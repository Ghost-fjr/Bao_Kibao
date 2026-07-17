from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal

from .models import Category, Product, ProductSize, Cart, CartItem, Order, OrderItem

User = get_user_model()

class ProductModelTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Apparel')
        self.product_no_sizes = Product.objects.create(
            name='Mug',
            price=Decimal('15.00'),
            stock=10,
            category=self.category
        )
        self.product_with_sizes = Product.objects.create(
            name='Jersey',
            price=Decimal('50.00'),
            stock=0,  # Overall stock doesn't matter if sizes exist
            category=self.category
        )
        self.size_m = ProductSize.objects.create(
            product=self.product_with_sizes,
            size_name='M',
            stock=5,
            price_adjustment=Decimal('0.00')
        )
        self.size_xl = ProductSize.objects.create(
            product=self.product_with_sizes,
            size_name='XL',
            stock=0,
            price_adjustment=Decimal('5.00')
        )

    def test_in_stock_property_no_sizes(self):
        self.assertTrue(self.product_no_sizes.in_stock)
        self.product_no_sizes.stock = 0
        self.product_no_sizes.save()
        self.assertFalse(self.product_no_sizes.in_stock)

    def test_in_stock_property_with_sizes(self):
        self.assertTrue(self.product_with_sizes.in_stock)
        self.size_m.stock = 0
        self.size_m.save()
        self.assertFalse(self.product_with_sizes.in_stock)

class CartTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='buyer', password='password123')
        self.client.force_authenticate(user=self.user)
        self.cart = Cart.objects.create(user=self.user)
        
        self.product = Product.objects.create(
            name='Jersey',
            price=Decimal('50.00'),
            stock=0
        )
        self.size_m = ProductSize.objects.create(
            product=self.product, size_name='M', stock=10, price_adjustment=Decimal('0.00')
        )
        self.size_xxl = ProductSize.objects.create(
            product=self.product, size_name='XXL', stock=5, price_adjustment=Decimal('10.00')
        )

    def test_cart_total_amount_with_size_adjustments(self):
        # 1x M Jersey (50.00 + 0.00 = 50.00)
        CartItem.objects.create(cart=self.cart, product=self.product, size=self.size_m, quantity=1)
        # 2x XXL Jersey (50.00 + 10.00 = 60.00 * 2 = 120.00)
        CartItem.objects.create(cart=self.cart, product=self.product, size=self.size_xxl, quantity=2)
        
        self.assertEqual(self.cart.total_amount, Decimal('170.00'))

    def test_add_item_to_cart_api(self):
        url = reverse('cart-add-item')
        data = {
            'product_id': self.product.id,
            'size_id': self.size_m.id,
            'quantity': 2
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.assertEqual(self.cart.items.count(), 1)
        item = self.cart.items.first()
        self.assertEqual(item.quantity, 2)
        self.assertEqual(item.size, self.size_m)

    def test_add_item_insufficient_size_stock(self):
        url = reverse('cart-add-item')
        data = {
            'product_id': self.product.id,
            'size_id': self.size_m.id,
            'quantity': 15  # Only 10 in stock
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Not enough stock", response.data['error'])


class CheckoutTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='buyer', password='password123', email='buyer@example.com')
        self.client.force_authenticate(user=self.user)
        self.cart = Cart.objects.create(user=self.user)
        
        self.product = Product.objects.create(
            name='Cap',
            price=Decimal('20.00'),
            stock=5
        )
        self.product_with_size = Product.objects.create(
            name='Hoodie',
            price=Decimal('60.00'),
            stock=0
        )
        self.size = ProductSize.objects.create(
            product=self.product_with_size, size_name='L', stock=3, price_adjustment=Decimal('5.00')
        )

    def test_checkout_creates_order_and_decrements_stock(self):
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)
        CartItem.objects.create(cart=self.cart, product=self.product_with_size, size=self.size, quantity=1)
        
        url = reverse('order-list')
        data = {
            'shipping_name': 'Test User',
            'shipping_email': 'test@example.com',
            'shipping_phone': '0712345678',
            'shipping_address': '123 Fake St',
            'shipping_city': 'Nairobi',
            'shipping_country': 'Kenya'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify order total: (20 * 2) + (60 + 5) * 1 = 40 + 65 = 105
        order = Order.objects.get(user=self.user)
        self.assertEqual(order.total_amount, Decimal('105.00'))
        
        # Verify order items
        self.assertEqual(order.items.count(), 2)
        hoodie_item = order.items.get(product=self.product_with_size)
        self.assertEqual(hoodie_item.price, Decimal('65.00'))
        self.assertEqual(hoodie_item.size_name, 'L')
        
        # Verify stock was decremented
        self.product.refresh_from_db()
        self.size.refresh_from_db()
        self.assertEqual(self.product.stock, 3)  # 5 - 2
        self.assertEqual(self.size.stock, 2)     # 3 - 1
        
        # Verify cart was cleared
        self.assertEqual(self.cart.items.count(), 0)

    def test_checkout_fails_if_stock_insufficient_during_checkout(self):
        # Add to cart
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)
        
        # Simulate another user buying the stock before checkout
        self.product.stock = 1
        self.product.save()
        
        url = reverse('order-list')
        data = {
            'shipping_name': 'Test User',
            'shipping_email': 'test@example.com',
            'shipping_phone': '0712345678',
            'shipping_address': '123 Fake St',
            'shipping_city': 'Nairobi',
            'shipping_country': 'Kenya'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Not enough stock for Cap", response.data)
        
        # Order should not be created
        self.assertEqual(Order.objects.count(), 0)
