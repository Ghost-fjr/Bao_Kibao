from rest_framework import serializers
from .models import Payment, Donation

class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['mpesa_checkout_request_id', 'mpesa_transaction_id', 'mpesa_receipt_number', 'status', 'created_at', 'updated_at']


class DonationSerializer(serializers.ModelSerializer):
    """Serializer for Donation model"""
    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ['payment', 'created_at']


# Stripe serializers removed - using M-Pesa Daraja API instead
