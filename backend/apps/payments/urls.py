from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PaymentViewSet, 
    DonationViewSet,
    InitiateMpesaPaymentView,
    MpesaCallbackView,
    CheckPaymentStatusView
)

router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'donations', DonationViewSet, basename='donation')

urlpatterns = [
    path('', include(router.urls)),
    path('mpesa/initiate/', InitiateMpesaPaymentView.as_view(), name='mpesa-initiate'),
    path('mpesa/callback/', MpesaCallbackView.as_view(), name='mpesa-callback'),
    path('mpesa/status/<int:payment_id>/', CheckPaymentStatusView.as_view(), name='mpesa-status'),
]
