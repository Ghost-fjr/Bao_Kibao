import uuid
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
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

    # User who made the payment (null for guest/payment-link payments)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='KES')
    
    # M-Pesa integration fields (Daraja API)
    mpesa_checkout_request_id = models.CharField(max_length=200, blank=True, help_text="M-Pesa CheckoutRequestID")
    mpesa_transaction_id = models.CharField(max_length=200, blank=True, help_text="M-Pesa Transaction ID")
    mpesa_receipt_number = models.CharField(max_length=200, blank=True, help_text="M-Pesa Receipt Number")
    phone_number = models.CharField(max_length=15, blank=True, help_text="Phone number used for M-Pesa payment")
    
    # Generic relation to link to order, tournament registration, or donation
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Link to payment link if payment came from a shareable link
    payment_link = models.ForeignKey('PaymentLink', on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    
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
    donor_name = models.CharField(max_length=200)
    donor_email = models.EmailField()
    donor_phone = models.CharField(max_length=20, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='KES')
    message = models.TextField(blank=True)
    is_anonymous = models.BooleanField(default=False)
    payment = models.OneToOneField(Payment, on_delete=models.SET_NULL, null=True, related_name='donation')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        donor = "Anonymous" if self.is_anonymous else self.donor_name
        return f"Donation from {donor} - {self.amount} {self.currency}"


class PaymentLink(models.Model):
    """Payment Link model for creating shareable payment links"""
    title = models.CharField(max_length=200, help_text="Name of the payment link")
    description = models.TextField(help_text="Purpose of the payment")
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Fixed or minimum amount")
    allow_custom_amount = models.BooleanField(default=False, help_text="Allow users to enter custom amounts")
    currency = models.CharField(max_length=3, default='KES')
    unique_code = models.CharField(max_length=20, unique=True, db_index=True, help_text="Unique identifier for the link")
    is_active = models.BooleanField(default=True, help_text="Enable/disable this payment link")
    max_uses = models.PositiveIntegerField(null=True, blank=True, help_text="Maximum number of times this link can be used")
    current_uses = models.PositiveIntegerField(default=0, help_text="Number of times this link has been used")
    expires_at = models.DateTimeField(null=True, blank=True, help_text="Expiration date for this link")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_links')
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.unique_code}"

    def save(self, *args, **kwargs):
        if not self.unique_code:
            self.unique_code = uuid.uuid4().hex[:12].upper()
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        """Check if the link has expired"""
        if self.expires_at:
            from django.utils import timezone
            return timezone.now() > self.expires_at
        return False

    @property
    def is_max_uses_reached(self):
        """Check if maximum uses have been reached"""
        if self.max_uses:
            return self.current_uses >= self.max_uses
        return False

    @property
    def is_usable(self):
        """Check if the link can be used"""
        return self.is_active and not self.is_expired and not self.is_max_uses_reached
