from rest_framework import serializers
from .models import Category, Product, Cart, CartItem, Order, OrderItem

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ['organization', 'slug', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['organization', 'slug', 'created_at', 'updated_at']


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for CartItem model"""
    product_details = ProductSerializer(source='product', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_details', 'quantity', 'subtotal']


class CartSerializer(serializers.ModelSerializer):
    """Serializer for Cart model"""
    items = CartItemSerializer(many=True, read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_amount', 'total_items', 'updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem model"""
    class Meta:
        model = OrderItem
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Order model"""
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['order_number', 'user', 'total_amount', 'status', 'payment_status', 'created_at', 'updated_at']
