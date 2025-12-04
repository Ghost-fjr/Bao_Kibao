from rest_framework import serializers
from .models import Category, Product, ProductSize, Cart, CartItem, Order, OrderItem

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ['organization', 'created_at']


class ProductSizeSerializer(serializers.ModelSerializer):
    """Serializer for ProductSize model"""
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = ProductSize
        fields = ['id', 'size_name', 'stock', 'price_adjustment', 'final_price', 'in_stock']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    sizes = ProductSizeSerializer(many=True, required=False)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['organization', 'created_at', 'updated_at']

    def create(self, validated_data):
        sizes_data = self.context['request'].data.get('sizes')
        if sizes_data and isinstance(sizes_data, str):
            import json
            try:
                sizes_data = json.loads(sizes_data)
            except json.JSONDecodeError:
                sizes_data = []
        
        # Remove sizes from validated_data if it exists there (it shouldn't if not in fields, but good practice)
        if 'sizes' in validated_data:
            del validated_data['sizes']
            
        product = Product.objects.create(**validated_data)
        
        if sizes_data:
            for size in sizes_data:
                ProductSize.objects.create(product=product, **size)
                
        return product

    def update(self, instance, validated_data):
        sizes_data = self.context['request'].data.get('sizes')
        if sizes_data and isinstance(sizes_data, str):
            import json
            try:
                sizes_data = json.loads(sizes_data)
            except json.JSONDecodeError:
                sizes_data = []
                
        # Update product fields
        for attr, value in validated_data.items():
            if attr != 'sizes':
                setattr(instance, attr, value)
        instance.save()
        
        # Update sizes
        if sizes_data is not None:
            # Delete existing sizes not in the new list (simple replacement strategy)
            # Or smarter update. Let's do a replace for simplicity or update if ID exists.
            
            # Current implementation: Delete all and recreate to ensure sync
            # This is destructive but ensures the state matches exactly what's sent
            instance.sizes.all().delete()
            for size in sizes_data:
                ProductSize.objects.create(product=instance, **size)
                
        return instance


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
