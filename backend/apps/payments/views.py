"""
Payment views: M-Pesa STK Push, Stripe webhook, Payment Links, Donations.
"""
import stripe
import logging

from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from rest_framework.decorators import action
from django.conf import settings
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import F
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import Payment, Donation, PaymentLink
from .serializers import PaymentSerializer, DonationSerializer, PaymentLinkSerializer
from .daraja import daraja_api
from apps.common.permissions import IsAdminUser

logger = logging.getLogger(__name__)


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and managing payments"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, 'role', None) == 'admin':
            return Payment.objects.all()
        return Payment.objects.filter(user=user)


class DonationViewSet(viewsets.ModelViewSet):
    """ViewSet for Donation CRUD"""
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [permissions.AllowAny]  # Allow anonymous donations


class InitiateMpesaPaymentView(views.APIView):
    """View to initiate M-Pesa STK Push payment"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Initiate M-Pesa payment via STK Push
        Expected payload:
        {
            "phone_number": "254712345678",
            "amount": 1000,
            "payment_type": "order",  # or "tournament", "donation"
            "account_reference": "ORDER123",
            "transaction_desc": "Payment for Order #123"
        }
        """
        phone_number = request.data.get('phone_number')
        amount = request.data.get('amount')
        payment_type = request.data.get('payment_type', 'order')
        account_reference = request.data.get('account_reference', 'Payment')
        transaction_desc = request.data.get('transaction_desc', 'Payment')

        if not phone_number or not amount:
            return Response(
                {'error': 'phone_number and amount are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            payment = Payment.objects.create(
                user=request.user,
                payment_type=payment_type,
                amount=amount,
                currency='KES',
                phone_number=phone_number,
                status='pending',
                payment_method='mpesa'
            )

            response = daraja_api.initiate_stk_push(
                phone_number=phone_number,
                amount=amount,
                account_reference=account_reference,
                transaction_desc=transaction_desc
            )

            if response and response.get('ResponseCode') == '0':
                payment.mpesa_checkout_request_id = response.get('CheckoutRequestID')
                payment.status = 'processing'
                payment.metadata = response
                payment.save()

                return Response({
                    'success': True,
                    'message': 'STK Push sent to your phone. Please enter your M-Pesa PIN to complete payment.',
                    'payment_id': payment.id,
                    'checkout_request_id': response.get('CheckoutRequestID'),
                    'merchant_request_id': response.get('MerchantRequestID')
                }, status=status.HTTP_200_OK)
            else:
                payment.status = 'failed'
                payment.error_message = response.get('errorMessage', 'Failed to initiate payment') if response else 'Failed to connect to M-Pesa'
                payment.save()
                return Response({'error': payment.error_message}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Error initiating M-Pesa payment: {str(e)}")
            return Response(
                {'error': 'An error occurred while processing your payment'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Safaricom's published production callback IPs
SAFARICOM_IPS = {
    '196.201.214.200', '196.201.214.206', '196.201.213.114',
    '196.201.214.207', '196.201.214.208', '196.201.213.44',
    '196.201.212.127', '196.201.212.138', '196.201.212.129',
    '196.201.212.136', '196.201.212.74', '196.201.212.69',
}


class MpesaCallbackView(views.APIView):
    """View to handle M-Pesa payment callbacks from Safaricom"""
    permission_classes = [permissions.AllowAny]  # Safaricom calls this

    def post(self, request):
        """Handle M-Pesa callback — Safaricom sends payment confirmation here"""
        # IP whitelist validation (production only)
        if getattr(settings, 'DARAJA_ENVIRONMENT', 'sandbox') == 'production':
            client_ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))
            client_ip = client_ip.split(',')[0].strip()
            if client_ip not in SAFARICOM_IPS:
                logger.warning(f"M-Pesa callback rejected from unauthorized IP: {client_ip}")
                return Response({'ResultCode': 1, 'ResultDesc': 'Unauthorized'}, status=403)

        try:
            logger.info(f"M-Pesa Callback received: {request.data}")

            callback_data = request.data.get('Body', {}).get('stkCallback', {})
            result_code = callback_data.get('ResultCode')
            checkout_request_id = callback_data.get('CheckoutRequestID')

            if not checkout_request_id:
                logger.error("No CheckoutRequestID in callback")
                return Response({'ResultCode': 1, 'ResultDesc': 'Invalid callback'})

            try:
                payment = Payment.objects.get(mpesa_checkout_request_id=checkout_request_id)
            except Payment.DoesNotExist:
                logger.error(f"Payment not found for CheckoutRequestID: {checkout_request_id}")
                return Response({'ResultCode': 1, 'ResultDesc': 'Payment not found'})

            if result_code == 0:
                callback_metadata = callback_data.get('CallbackMetadata', {}).get('Item', [])
                for item in callback_metadata:
                    if item.get('Name') == 'MpesaReceiptNumber':
                        payment.mpesa_receipt_number = item.get('Value')
                    elif item.get('Name') == 'TransactionDate':
                        payment.mpesa_transaction_id = str(item.get('Value'))

                payment.status = 'succeeded'
                payment.paid_at = timezone.now()
                payment.metadata = callback_data
                payment.save()
                logger.info(f"Payment {payment.id} completed successfully")
            else:
                payment.status = 'failed'
                payment.error_message = callback_data.get('ResultDesc', 'Payment failed')
                payment.metadata = callback_data
                payment.save()
                logger.info(f"Payment {payment.id} failed: {payment.error_message}")

            return Response({'ResultCode': 0, 'ResultDesc': 'Success'})

        except Exception as e:
            logger.error(f"Error processing M-Pesa callback: {str(e)}")
            return Response({'ResultCode': 1, 'ResultDesc': 'Error processing callback'})


class CheckPaymentStatusView(views.APIView):
    """View to check payment status"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, payment_id):
        """Check the status of a payment"""
        try:
            payment = Payment.objects.get(id=payment_id, user=request.user)

            if payment.status == 'processing' and payment.mpesa_checkout_request_id:
                response = daraja_api.query_transaction_status(payment.mpesa_checkout_request_id)
                if response and response.get('ResultCode') == '0':
                    payment.status = 'succeeded'
                    payment.paid_at = timezone.now()
                    payment.save()

            return Response({
                'payment_id': payment.id,
                'status': payment.status,
                'amount': str(payment.amount),
                'currency': payment.currency,
                'mpesa_receipt_number': payment.mpesa_receipt_number,
                'paid_at': payment.paid_at
            })

        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)


class PaymentLinkViewSet(viewsets.ModelViewSet):
    """ViewSet for managing payment links (Admin only)"""
    queryset = PaymentLink.objects.all()
    serializer_class = PaymentLinkSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle the is_active status of a payment link"""
        payment_link = self.get_object()
        payment_link.is_active = not payment_link.is_active
        payment_link.save()
        return Response(self.get_serializer(payment_link).data)


class PublicPaymentLinkView(views.APIView):
    """Public view to retrieve payment link details by code"""
    permission_classes = [permissions.AllowAny]

    def get(self, request, code):
        """Get payment link details by unique code"""
        try:
            payment_link = PaymentLink.objects.get(unique_code=code)
            if not payment_link.is_usable:
                if payment_link.is_expired:
                    error_msg = 'Payment link has expired'
                elif payment_link.is_max_uses_reached:
                    error_msg = 'Payment link has reached maximum uses'
                else:
                    error_msg = 'Payment link is inactive'
                return Response({'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)

            return Response(PaymentLinkSerializer(payment_link).data)

        except PaymentLink.DoesNotExist:
            return Response({'error': 'Payment link not found'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, code):
        """Initiate M-Pesa payment via payment link"""
        try:
            payment_link = get_object_or_404(PaymentLink, unique_code=code)

            if not payment_link.is_usable:
                return Response(
                    {'error': 'Payment link is not available'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            phone_number = request.data.get('phone_number')
            amount = request.data.get('amount', payment_link.amount)
            payer_name = request.data.get('payer_name', 'Guest')

            if not payment_link.allow_custom_amount:
                amount = payment_link.amount
            else:
                if float(amount) < float(payment_link.amount):
                    return Response(
                        {'error': f'Amount must be at least {payment_link.currency} {payment_link.amount}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            if not phone_number:
                return Response({'error': 'phone_number is required'}, status=status.HTTP_400_BAD_REQUEST)

            user = request.user if request.user.is_authenticated else None

            payment = Payment.objects.create(
                user=user,  # null for guests — Payment.user is now nullable
                payment_type='order',
                amount=amount,
                currency=payment_link.currency,
                phone_number=phone_number,
                status='pending',
                payment_method='mpesa',
                payment_link=payment_link,
                metadata={'payer_name': payer_name, 'link_code': code}
            )

            response = daraja_api.initiate_stk_push(
                phone_number=phone_number,
                amount=amount,
                account_reference=f"PAY-{payment_link.unique_code}",
                transaction_desc=payment_link.title[:20]
            )

            if response and response.get('ResponseCode') == '0':
                payment.mpesa_checkout_request_id = response.get('CheckoutRequestID')
                payment.status = 'processing'
                payment.metadata['mpesa_response'] = response
                payment.save()

                # Atomically increment usage count to prevent race conditions
                PaymentLink.objects.filter(pk=payment_link.pk).update(
                    current_uses=F('current_uses') + 1
                )

                return Response({
                    'success': True,
                    'message': 'STK Push sent to your phone. Please enter your M-Pesa PIN to complete payment.',
                    'payment_id': payment.id,
                    'checkout_request_id': response.get('CheckoutRequestID')
                }, status=status.HTTP_200_OK)
            else:
                payment.status = 'failed'
                payment.error_message = response.get('errorMessage', 'Failed to initiate payment') if response else 'Failed to connect to M-Pesa'
                payment.save()
                return Response({'error': payment.error_message}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Error processing payment link: {str(e)}")
            return Response(
                {'error': 'An error occurred while processing your payment'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(views.APIView):
    """
    Handle Stripe webhook events.
    Stripe signs each request with STRIPE_WEBHOOK_SECRET — we verify the
    signature before processing to prevent forged events.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        webhook_secret = settings.STRIPE_WEBHOOK_SECRET

        if not webhook_secret:
            logger.warning("STRIPE_WEBHOOK_SECRET not configured — skipping signature verification")
            event = stripe.Event.construct_from(request.data, stripe.api_key)
        else:
            try:
                stripe.api_key = settings.STRIPE_SECRET_KEY
                event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
            except ValueError:
                logger.error("Stripe webhook: invalid payload")
                return Response({'error': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)
            except stripe.error.SignatureVerificationError:
                logger.error("Stripe webhook: invalid signature")
                return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

        event_type = event.get('type')
        logger.info(f"Stripe webhook received: {event_type}")

        if event_type == 'payment_intent.succeeded':
            self._handle_payment_succeeded(event['data']['object'])
        elif event_type == 'payment_intent.payment_failed':
            self._handle_payment_failed(event['data']['object'])
        else:
            logger.info(f"Unhandled Stripe event type: {event_type}")

        return Response({'status': 'ok'})

    def _handle_payment_succeeded(self, payment_intent):
        """Mark corresponding Payment record as succeeded"""
        pi_id = payment_intent.get('id')
        try:
            payment = Payment.objects.get(
                metadata__stripe_payment_intent_id=pi_id
            )
            payment.status = 'succeeded'
            payment.paid_at = timezone.now()
            payment.save(update_fields=['status', 'paid_at'])
            logger.info(f"Stripe payment {pi_id} marked succeeded (Payment #{payment.id})")
        except Payment.DoesNotExist:
            logger.warning(f"No Payment record found for Stripe PaymentIntent {pi_id}")

    def _handle_payment_failed(self, payment_intent):
        """Mark corresponding Payment record as failed"""
        pi_id = payment_intent.get('id')
        try:
            payment = Payment.objects.get(
                metadata__stripe_payment_intent_id=pi_id
            )
            payment.status = 'failed'
            payment.error_message = payment_intent.get('last_payment_error', {}).get('message', 'Payment failed')
            payment.save(update_fields=['status', 'error_message'])
            logger.info(f"Stripe payment {pi_id} marked failed (Payment #{payment.id})")
        except Payment.DoesNotExist:
            logger.warning(f"No Payment record found for Stripe PaymentIntent {pi_id}")
