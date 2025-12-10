from rest_framework import serializers
from .models import Payment, Donation, PaymentLink

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


class PaymentLinkSerializer(serializers.ModelSerializer):
    """Serializer for PaymentLink model with computed fields"""
    from django.db.models import Sum
    
    link_url = serializers.SerializerMethodField()
    usage_percentage = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)
    is_usable = serializers.BooleanField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    total_collected = serializers.SerializerMethodField()

    class Meta:
        from .models import PaymentLink
        model = PaymentLink
        fields = [
            'id', 'title', 'description', 'amount', 'allow_custom_amount',
            'currency', 'unique_code', 'is_active', 'max_uses', 'current_uses',
            'expires_at', 'created_by', 'created_by_name', 'metadata',
            'created_at', 'updated_at', 'link_url', 'usage_percentage',
            'is_expired', 'is_usable', 'total_collected'
        ]
        read_only_fields = ['unique_code', 'current_uses', 'created_at', 'updated_at', 'created_by']

    def get_link_url(self, obj):
        """Generate the shareable payment link URL"""
        from django.conf import settings
        base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        return f"{base_url}/pay/{obj.unique_code}"

    def get_usage_percentage(self, obj):
        """Calculate usage percentage if max_uses is set"""
        if obj.max_uses and obj.max_uses > 0:
            return round((obj.current_uses / obj.max_uses) * 100, 2)
        return 0

    def get_total_collected(self, obj):
        """Calculate total amount collected through this link"""
        from django.db.models import Sum
        total = obj.payments.filter(status='succeeded').aggregate(total=Sum('amount'))['total']
        return float(total) if total else 0.0


# Stripe serializers removed - using M-Pesa Daraja API instead
