from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PaymentViewSet, 
    DonationViewSet,
    PaymentLinkViewSet,
    InitiateMpesaPaymentView,
    MpesaCallbackView,
    CheckPaymentStatusView,
    PublicPaymentLinkView
)

router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'donations', DonationViewSet, basename='donation')
router.register(r'payment-links', PaymentLinkViewSet, basename='payment-link')

urlpatterns = [
    path('', include(router.urls)),
    path('mpesa/initiate/', InitiateMpesaPaymentView.as_view(), name='mpesa-initiate'),
    path('mpesa/callback/', MpesaCallbackView.as_view(), name='mpesa-callback'),
    path('mpesa/status/<int:payment_id>/', CheckPaymentStatusView.as_view(), name='mpesa-status'),
    path('public/payment-link/<str:code>/', PublicPaymentLinkView.as_view(), name='public-payment-link'),
]
