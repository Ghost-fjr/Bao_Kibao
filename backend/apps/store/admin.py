from django.contrib import admin
from .models import Category, Product, ProductSize, Cart, CartItem, Order, OrderItem


class ProductSizeInline(admin.TabularInline):
    """Inline admin for product sizes"""
    model = ProductSize
    extra = 1
    fields = ['size_name', 'stock', 'price_adjustment']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'is_active', 'is_featured', 'created_at']
    list_filter = ['is_active', 'is_featured', 'category']
    search_fields = ['name', 'description']
    inlines = [ProductSizeInline]
    fieldsets = (
        ('Basic Information', {
            'fields': ('category', 'name', 'description')
        }),
        ('Pricing & Inventory', {
            'fields': ('price', 'stock')
        }),
        ('Media', {
            'fields': ('image',)
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured')
        }),
    )


@admin.register(ProductSize)
class ProductSizeAdmin(admin.ModelAdmin):
    list_display = ['product', 'size_name', 'stock', 'price_adjustment', 'final_price']
    list_filter = ['product__category', 'size_name']
    search_fields = ['product__name', 'size_name']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_items', 'total_amount', 'created_at']
    search_fields = ['user__email']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'product', 'quantity', 'subtotal']
    list_filter = ['cart__user']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'total_amount', 'status', 'payment_status', 'created_at']
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['order_number', 'user__email', 'shipping_name']
    readonly_fields = ['order_number', 'created_at', 'updated_at']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product_name', 'quantity', 'price', 'subtotal']
    list_filter = ['order__status']
    search_fields = ['product_name', 'order__order_number']
