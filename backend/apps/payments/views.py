from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from rest_framework.decorators import action
from django.conf import settings
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Payment, Donation, PaymentLink
from .serializers import PaymentSerializer, DonationSerializer, PaymentLinkSerializer
from .daraja import daraja_api
import logging

logger = logging.getLogger(__name__)


class IsAdminUser(permissions.BasePermission):
    """Permission to only allow admin users."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or request.user.role == 'admin'
        )


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and managing payments"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        if self.request.user.is_staff or self.request.user.role == 'admin':
            return Payment.objects.all()
        return Payment.objects.filter(user=self.request.user)



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
        
        # Validate required fields
        if not phone_number or not amount:
            return Response(
                {'error': 'phone_number and amount are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create payment record
            payment = Payment.objects.create(
                user=request.user,
                payment_type=payment_type,
                amount=amount,
                currency='KES',
                phone_number=phone_number,
                status='pending',
                payment_method='mpesa'
            )
            
            # Initiate STK Push
            response = daraja_api.initiate_stk_push(
                phone_number=phone_number,
                amount=amount,
                account_reference=account_reference,
                transaction_desc=transaction_desc
            )
            
            if response and response.get('ResponseCode') == '0':
                # STK Push initiated successfully
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
                # STK Push failed
                payment.status = 'failed'
                payment.error_message = response.get('errorMessage', 'Failed to initiate payment') if response else 'Failed to connect to M-Pesa'
                payment.save()
                
                return Response({
                    'error': payment.error_message
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error initiating M-Pesa payment: {str(e)}")
            return Response(
                {'error': 'An error occurred while processing your payment'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MpesaCallbackView(views.APIView):
    """View to handle M-Pesa payment callbacks"""
    permission_classes = [permissions.AllowAny]  # Safaricom will call this

    def post(self, request):
        """
        Handle M-Pesa callback
        Safaricom sends payment confirmation here
        """
        try:
            logger.info(f"M-Pesa Callback received: {request.data}")
            
            # Extract callback data
            callback_data = request.data.get('Body', {}).get('stkCallback', {})
            result_code = callback_data.get('ResultCode')
            checkout_request_id = callback_data.get('CheckoutRequestID')
            
            if not checkout_request_id:
                logger.error("No CheckoutRequestID in callback")
                return Response({'ResultCode': 1, 'ResultDesc': 'Invalid callback'})
            
            # Find payment by checkout request ID
            try:
                payment = Payment.objects.get(mpesa_checkout_request_id=checkout_request_id)
            except Payment.DoesNotExist:
                logger.error(f"Payment not found for CheckoutRequestID: {checkout_request_id}")
                return Response({'ResultCode': 1, 'ResultDesc': 'Payment not found'})
            
            # Update payment based on result
            if result_code == 0:
                # Payment successful
                callback_metadata = callback_data.get('CallbackMetadata', {}).get('Item', [])
                
                # Extract transaction details
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
                # Payment failed or cancelled
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
            
            # If payment is still processing, query M-Pesa for status
            if payment.status == 'processing' and payment.mpesa_checkout_request_id:
                response = daraja_api.query_transaction_status(payment.mpesa_checkout_request_id)
                
                if response and response.get('ResultCode') == '0':
                    # Payment completed
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
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class PaymentLinkViewSet(viewsets.ModelViewSet):
    """ViewSet for managing payment links (Admin only)"""
    queryset = PaymentLink.objects.all()
    serializer_class = PaymentLinkSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        """Set the created_by field to current user"""
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle the is_active status of a payment link"""
        payment_link = self.get_object()
        payment_link.is_active = not payment_link.is_active
        payment_link.save()
        serializer = self.get_serializer(payment_link)
        return Response(serializer.data)


class PublicPaymentLinkView(views.APIView):
    """Public view to retrieve payment link details by code"""
    permission_classes = [permissions.AllowAny]

    def get(self, request, code):
        """Get payment link details by unique code"""
        try:
            payment_link = PaymentLink.objects.get(unique_code=code)
            
            # Check if link is usable
            if not payment_link.is_usable:
                error_msg = 'Payment link is inactive'
                if payment_link.is_expired:
                    error_msg = 'Payment link has expired'
                elif payment_link.is_max_uses_reached:
                    error_msg = 'Payment link has reached maximum uses'
                
                return Response(
                    {'error': error_msg},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = PaymentLinkSerializer(payment_link)
            return Response(serializer.data)
            
        except PaymentLink.DoesNotExist:
            return Response(
                {'error': 'Payment link not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    def post(self, request, code):
        """Initiate M-Pesa payment via payment link"""
        try:
            payment_link = get_object_or_404(PaymentLink, unique_code=code)
            
            # Check if link is usable
            if not payment_link.is_usable:
                return Response(
                    {'error': 'Payment link is not available'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            phone_number = request.data.get('phone_number')
            amount = request.data.get('amount', payment_link.amount)
            payer_name = request.data.get('payer_name', 'Guest')
            
            # Validate amount if custom amounts are not allowed
            if not payment_link.allow_custom_amount:
                amount = payment_link.amount
            else:
                # Ensure amount is at least the minimum
                if float(amount) < float(payment_link.amount):
                    return Response(
                        {'error': f'Amount must be at least {payment_link.currency} {payment_link.amount}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            if not phone_number:
                return Response(
                    {'error': 'phone_number is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create or get user (for guest payments, you might want to create a guest user)
            # For now, we'll allow payments without authentication
            user = request.user if request.user.is_authenticated else None
            
            # Create payment record
            payment = Payment.objects.create(
                user=user,
                payment_type='order',  # Could be customized
                amount=amount,
                currency=payment_link.currency,
                phone_number=phone_number,
                status='pending',
                payment_method='mpesa',
                payment_link=payment_link,
                metadata={'payer_name': payer_name, 'link_code': code}
            )
            
            # Initiate STK Push
            response = daraja_api.initiate_stk_push(
                phone_number=phone_number,
                amount=amount,
                account_reference=f"PAY-{payment_link.unique_code}",
                transaction_desc=payment_link.title[:20]
            )
            
            if response and response.get('ResponseCode') == '0':
                # STK Push initiated successfully
                payment.mpesa_checkout_request_id = response.get('CheckoutRequestID')
                payment.status = 'processing'
                payment.metadata['mpesa_response'] = response
                payment.save()
                
                # Increment usage count
                payment_link.current_uses += 1
                payment_link.save()
                
                return Response({
                    'success': True,
                    'message': 'STK Push sent to your phone. Please enter your M-Pesa PIN to complete payment.',
                    'payment_id': payment.id,
                    'checkout_request_id': response.get('CheckoutRequestID')
                }, status=status.HTTP_200_OK)
            else:
                # STK Push failed
                payment.status = 'failed'
                payment.error_message = response.get('errorMessage', 'Failed to initiate payment') if response else 'Failed to connect to M-Pesa'
                payment.save()
                
                return Response({
                    'error': payment.error_message
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error processing payment link: {str(e)}")
            return Response(
                {'error': 'An error occurred while processing your payment'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
