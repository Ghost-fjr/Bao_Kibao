from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from .models import Payment, Donation
from .serializers import PaymentSerializer, DonationSerializer
from .daraja import daraja_api
import logging

logger = logging.getLogger(__name__)


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing payments"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
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
                organization_id=request.user.organization_id if hasattr(request.user, 'organization_id') else None,
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
