from django.contrib import admin
from .models import Payment, Donation, PaymentLink


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'payment_type', 'amount', 'currency', 'status', 'payment_method', 'created_at']
    list_filter = ['status', 'payment_type', 'payment_method', 'created_at']
    search_fields = ['user__email', 'user__username', 'mpesa_receipt_number', 'mpesa_transaction_id', 'phone_number']
    readonly_fields = ['created_at', 'updated_at', 'paid_at', 'mpesa_checkout_request_id', 'mpesa_transaction_id', 'mpesa_receipt_number']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'payment_type', 'amount', 'currency', 'status')
        }),
        ('M-Pesa Details', {
            'fields': ('phone_number', 'payment_method', 'mpesa_checkout_request_id', 'mpesa_transaction_id', 'mpesa_receipt_number')
        }),
        ('Additional Information', {
            'fields': ('error_message', 'metadata')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'paid_at')
        }),
    )


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ['id', 'donor_name', 'donor_email', 'amount', 'currency', 'is_anonymous', 'created_at']
    list_filter = ['is_anonymous', 'created_at']
    search_fields = ['donor_name', 'donor_email', 'donor_phone', 'message']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Donor Information', {
            'fields': ('donor_name', 'donor_email', 'donor_phone', 'is_anonymous')
        }),
        ('Donation Details', {
            'fields': ('amount', 'currency', 'message')
        }),
        ('Payment', {
            'fields': ('payment',)
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )


@admin.register(PaymentLink)
class PaymentLinkAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'unique_code', 'amount', 'currency', 'is_active', 'current_uses', 'max_uses', 'created_by', 'created_at']
    list_filter = ['is_active', 'currency', 'allow_custom_amount', 'created_at']
    search_fields = ['title', 'unique_code', 'description']
    readonly_fields = ['unique_code', 'current_uses', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'created_by')
        }),
        ('Payment Settings', {
            'fields': ('amount', 'currency', 'allow_custom_amount')
        }),
        ('Link Settings', {
            'fields': ('unique_code', 'is_active', 'expires_at')
        }),
        ('Usage Limits', {
            'fields': ('max_uses', 'current_uses')
        }),
        ('Metadata', {
            'fields': ('metadata', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
