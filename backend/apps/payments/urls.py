from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, DonationViewSet, CreatePaymentIntentView, StripeWebhookView

router = DefaultRouter()
router.register(r'payments', PaymentViewSet)
router.register(r'donations', DonationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('create-payment-intent/', CreatePaymentIntentView.as_view(), name='create-payment-intent'),
    path('webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
]
