from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from django.conf import settings
import stripe
from .models import Payment, Donation
from .serializers import PaymentSerializer, DonationSerializer, CreatePaymentIntentSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY

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


class CreatePaymentIntentView(views.APIView):
    """View to create Stripe PaymentIntent"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreatePaymentIntentSerializer(data=request.data)
        if serializer.is_valid():
            amount = int(serializer.validated_data['amount'] * 100)  # Convert to cents
            currency = serializer.validated_data['currency']
            payment_type = serializer.validated_data['payment_type']
            metadata = serializer.validated_data.get('metadata', {})
            
            try:
                intent = stripe.PaymentIntent.create(
                    amount=amount,
                    currency=currency,
                    metadata={
                        'payment_type': payment_type,
                        'user_id': request.user.id,
                        **metadata
                    }
                )
                
                return Response({
                    'clientSecret': intent.client_secret,
                    'id': intent.id
                })
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StripeWebhookView(views.APIView):
    """View to handle Stripe webhooks"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        event = None

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Handle the event
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            # Logic to update payment status and related order/tournament/donation
            # This would typically involve finding the Payment object by intent ID and updating it
            pass

        return Response(status=status.HTTP_200_OK)
