from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Category, Product, Cart, CartItem, Order, OrderItem
from .serializers import (
    CategorySerializer, ProductSerializer, CartSerializer, 
    CartItemSerializer, OrderSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Category CRUD"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # Auto-set organization from user's first active membership
        membership = self.request.user.org_memberships.filter(is_active=True).first()
        if membership:
            serializer.save(organization=membership.organization)
        else:
            raise ValidationError("User is not a member of any organization")

    def perform_update(self, serializer):
        # Ensure user can only update items from their organization
        instance = self.get_object()
        membership = self.request.user.org_memberships.filter(is_active=True).first()
        if not membership or instance.organization != membership.organization:
            raise PermissionDenied("Cannot update items from other organizations")
        serializer.save()

    def get_queryset(self):
        # Filter by user's organization
        if self.request.user.is_authenticated:
            memberships = self.request.user.org_memberships.filter(is_active=True)
            org_ids = memberships.values_list('organization_id', flat=True)
            return Category.objects.filter(organization_id__in=org_ids)
        return Category.objects.none()


class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for Product CRUD"""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at']

    def perform_create(self, serializer):
        # Auto-set organization from user's first active membership
        membership = self.request.user.org_memberships.filter(is_active=True).first()
        if membership:
            serializer.save(organization=membership.organization)
        else:
            raise ValidationError("User is not a member of any organization")

    def perform_update(self, serializer):
        # Ensure user can only update items from their organization
        instance = self.get_object()
        membership = self.request.user.org_memberships.filter(is_active=True).first()
        if not membership or instance.organization != membership.organization:
            raise PermissionDenied("Cannot update items from other organizations")
        serializer.save()

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by user's organization
        if self.request.user.is_authenticated:
            memberships = self.request.user.org_memberships.filter(is_active=True)
            org_ids = memberships.values_list('organization_id', flat=True)
            queryset = queryset.filter(organization_id__in=org_ids)
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
        
        # Validate quantity input
        try:
            quantity = int(request.data.get('quantity', 1))
            if quantity <= 0 or quantity > 1000:
                return Response({"error": "Quantity must be between 1 and 1000"}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({"error": "Quantity must be a valid number"}, status=status.HTTP_400_BAD_REQUEST)
        
        product = get_object_or_404(Product, id=product_id)
        
        if product.stock < quantity:
            return Response({"error": "Not enough stock"}, status=status.HTTP_400_BAD_REQUEST)
            
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
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
        
        order = serializer.save(user=self.request.user, total_amount=total_amount)
        
        # Move items from cart to order with stock validation
        for item in cart.items.all():
            # Lock product row to prevent race conditions
            product = Product.objects.select_for_update().get(id=item.product.id)
            
            # Validate stock availability
            if product.stock < item.quantity:
                raise ValidationError(f"Insufficient stock for {product.name}. Available: {product.stock}, Requested: {item.quantity}")
            
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                quantity=item.quantity,
                price=product.price
            )
            
            # Decrease stock atomically
            product.stock -= item.quantity
            product.save()
            
        # Clear cart
        cart.items.all().delete()
