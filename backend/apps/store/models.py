import uuid
from django.db import models
from django.db.models import Sum, F, ExpressionWrapper, DecimalField
from apps.users.models import User


class Category(models.Model):
    """Product category model"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Product(models.Model):
    """Product model for merchandise store"""
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/')
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def in_stock(self):
        # Check if product has sizes
        if self.sizes.exists():
            return self.sizes.filter(stock__gt=0).exists()
        return self.stock > 0


class ProductSize(models.Model):
    """Product size/variant model for items like jerseys, hoodies, etc."""
    STANDARD_SIZES = {'XS': 0, 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5, '2XL': 5, '3XL': 6}

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sizes')
    size_name = models.CharField(max_length=50)  # e.g., "S", "M", "L", "XL", "XXL"
    sort_order = models.PositiveIntegerField(
        default=99,
        help_text="Controls display order. Lower numbers appear first. Standard: XS=0, S=1, M=2, L=3, XL=4, XXL=5"
    )
    stock = models.PositiveIntegerField(default=0)
    price_adjustment = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Additional price for this size (can be negative for discount)"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', 'size_name']
        unique_together = ['product', 'size_name']

    def __str__(self):
        return f"{self.product.name} - {self.size_name}"

    def save(self, *args, **kwargs):
        # Auto-assign sort_order from standard size name if not set
        if self.sort_order == 99 and self.size_name.upper() in self.STANDARD_SIZES:
            self.sort_order = self.STANDARD_SIZES[self.size_name.upper()]
        super().save(*args, **kwargs)

    @property
    def final_price(self):
        return self.product.price + self.price_adjustment

    @property
    def in_stock(self):
        return self.stock > 0


class Cart(models.Model):
    """Shopping cart model"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart - {self.user.email}"

    @property
    def total_amount(self):
        """Calculate cart total using database aggregation (avoids Python-loop N+1)."""
        result = self.items.annotate(
            item_total=ExpressionWrapper(
                F('quantity') * F('product__price'),
                output_field=DecimalField(max_digits=10, decimal_places=2)
            )
        ).aggregate(total=Sum('item_total'))
        return result['total'] or 0

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    """Cart item model"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    size = models.ForeignKey(ProductSize, on_delete=models.SET_NULL, null=True, blank=True, help_text="Selected size for the product")
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['cart', 'product', 'size']

    def __str__(self):
        size_str = f" ({self.size.size_name})" if self.size else ""
        return f"{self.product.name}{size_str} x {self.quantity}"

    @property
    def subtotal(self):
        if self.size:
            return self.size.final_price * self.quantity
        return self.product.price * self.quantity


class Order(models.Model):
    """Order model for completed purchases"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=50, unique=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Shipping information
    shipping_name = models.CharField(max_length=200)
    shipping_email = models.EmailField()
    shipping_phone = models.CharField(max_length=20)
    shipping_address = models.TextField()
    shipping_city = models.CharField(max_length=100)
    shipping_country = models.CharField(max_length=100)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_number} - {self.user.email}"


class OrderItem(models.Model):
    """Order item model"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=200)  # Store name in case product is deleted
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Store price at time of purchase

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

    @property
    def subtotal(self):
        return self.price * self.quantity
