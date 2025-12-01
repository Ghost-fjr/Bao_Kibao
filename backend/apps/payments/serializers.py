from rest_framework import serializers
from .models import Payment, Donation

class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['stripe_payment_intent_id', 'stripe_charge_id', 'status', 'created_at', 'updated_at']


class DonationSerializer(serializers.ModelSerializer):
    """Serializer for Donation model"""
    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ['payment', 'created_at']


class CreatePaymentIntentSerializer(serializers.Serializer):
    """Serializer for creating Stripe payment intent"""
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(default='usd')
    payment_type = serializers.ChoiceField(choices=['order', 'tournament', 'donation'])
    metadata = serializers.DictField(required=False)
