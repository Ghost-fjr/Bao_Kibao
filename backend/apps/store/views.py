from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from apps.common.permissions import IsAdminOrReadOnly
from .models import Category, Product, ProductSize, Cart, CartItem, Order, OrderItem
from .serializers import (
    CategorySerializer, ProductSerializer, CartSerializer, 
    CartItemSerializer, OrderSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Category CRUD"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        # Organization is now optional
        serializer.save()

    def perform_update(self, serializer):
        # No organization checks needed
        serializer.save()

    def get_queryset(self):
        # Show all categories to everyone (public access)
        return Category.objects.all()


class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for Product CRUD"""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at']

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    def get_queryset(self):
        # Show all active products to everyone (public access)
        queryset = Product.objects.filter(is_active=True)
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__id=category)
        return queryset


class CartViewSet(viewsets.ViewSet):
    """ViewSet for Cart management"""
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Get user's cart"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add item to cart"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        size_id = request.data.get('size_id')  # Optional size
        
        # Validate quantity input
        try:
            quantity = int(request.data.get('quantity', 1))
            if quantity <= 0 or quantity > 1000:
                return Response({"error": "Quantity must be between 1 and 1000"}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({"error": "Quantity must be a valid number"}, status=status.HTTP_400_BAD_REQUEST)
        
        product = get_object_or_404(Product, id=product_id)
        
        # Handle size selection
        size = None
        if size_id:
            size = get_object_or_404(ProductSize, id=size_id, product=product)
            # Check size stock
            if size.stock < quantity:
                return Response({"error": f"Not enough stock for size {size.size_name}"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Check product stock (if no sizes or size not specified)
            if product.stock < quantity:
                return Response({"error": "Not enough stock"}, status=status.HTTP_400_BAD_REQUEST)
            
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, 
            product=product, 
            size=size
        )
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        cart_item.save()
        
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """Remove item from cart"""
        cart = get_object_or_404(Cart, user=request.user)
        item_id = request.data.get('item_id')
        
        cart_item = get_object_or_404(CartItem, cart=cart, id=item_id)
        cart_item.delete()
        
        return Response(CartSerializer(cart).data)


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for Order CRUD"""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)

    @transaction.atomic
    def perform_create(self, serializer):
        # Calculate total from cart
        cart = get_object_or_404(Cart, user=self.request.user)
        total_amount = cart.total_amount
        
        if not cart.items.exists():
            raise ValidationError("Cart is empty")
        
        # Create order without organization requirement
        order = serializer.save(
            user=self.request.user, 
            total_amount=total_amount
        )
        
        # Move items from cart to order with stock validation
        for item in cart.items.all():
            price = item.size.final_price if item.size else item.product.price
            size_name = item.size.size_name if item.size else ''

            # Create OrderItem
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                size_name=size_name,
                price=price,
                quantity=item.quantity
            )
            
            # Decrement stock atomically (locking product/size row to prevent race conditions)
            if item.size:
                # Decrement size stock
                locked_size = ProductSize.objects.select_for_update().get(id=item.size.id)
                if locked_size.stock < item.quantity:
                    raise ValidationError(f"Not enough stock for {item.product.name} ({size_name})")
                locked_size.stock -= item.quantity
                locked_size.save()
                
                # Also optionally decrement overall product stock if you track it at both levels,
                # but typically if using sizes, stock is tracked per-size. 
                # Assuming we still decrement the parent product for total aggregate:
                locked_product = Product.objects.select_for_update().get(id=item.product.id)
                if locked_product.stock >= item.quantity:
                    locked_product.stock -= item.quantity
                    locked_product.save()
            else:
                # Decrement product stock directly
                locked_product = Product.objects.select_for_update().get(id=item.product.id)
                if locked_product.stock < item.quantity:
                    raise ValidationError(f"Not enough stock for {item.product.name}")
                locked_product.stock -= item.quantity
                locked_product.save()
            
        # Clear cart
        cart.items.all().delete()
