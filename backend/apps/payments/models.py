from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from apps.organizations.models import Organization
from apps.users.models import User


class Payment(models.Model):
    """Payment model for tracking all payments"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_TYPE_CHOICES = [
        ('order', 'Order Payment'),
        ('tournament', 'Tournament Registration'),
        ('donation', 'Donation'),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='payments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='KES')  # Changed from USD to KES
    
    # M-Pesa integration fields (Daraja API)
    mpesa_checkout_request_id = models.CharField(max_length=200, blank=True, help_text="M-Pesa CheckoutRequestID")
    mpesa_transaction_id = models.CharField(max_length=200, blank=True, help_text="M-Pesa Transaction ID")
    mpesa_receipt_number = models.CharField(max_length=200, blank=True, help_text="M-Pesa Receipt Number")
    phone_number = models.CharField(max_length=15, blank=True, help_text="Phone number used for M-Pesa payment")
    
    # Stripe integration fields (DEPRECATED - will be removed)
    # stripe_payment_intent_id = models.CharField(max_length=200, unique=True, blank=True)
    # stripe_charge_id = models.CharField(max_length=200, blank=True)
    
    # Generic relation to link to order, tournament registration, or donation
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=50, blank=True)
    error_message = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.id} - {self.amount} {self.currency} ({self.status})"


class Donation(models.Model):
    """Donation model for one-time and recurring donations"""
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='donations')
    donor_name = models.CharField(max_length=200)
    donor_email = models.EmailField()
    donor_phone = models.CharField(max_length=20, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    message = models.TextField(blank=True)
    is_anonymous = models.BooleanField(default=False)
    payment = models.OneToOneField(Payment, on_delete=models.SET_NULL, null=True, related_name='donation')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        donor = "Anonymous" if self.is_anonymous else self.donor_name
        return f"Donation from {donor} - {self.amount} {self.currency}"
