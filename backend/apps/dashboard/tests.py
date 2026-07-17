from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from django.utils import timezone

from apps.payments.models import Payment
from apps.store.models import Order
from apps.tournaments.models import Tournament

User = get_user_model()

class DashboardOverviewTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username='admin', email='admin@test.com', password='password123', role='admin')
        self.donor = User.objects.create_user(username='donor', email='donor@test.com', password='password123', role='donor')
        
        # Create some data
        Payment.objects.create(user=self.donor, amount=Decimal('100.00'), payment_type='donation', status='succeeded', mpesa_receipt_number='REC1')
        Payment.objects.create(user=self.donor, amount=Decimal('50.00'), payment_type='donation', status='failed', mpesa_receipt_number='REC2')
        
        Order.objects.create(user=self.donor, order_number='ORD1', total_amount=Decimal('50.00'), status='pending', shipping_address='123', shipping_phone='123')
        
        Tournament.objects.create(
            name='Ongoing Cup',
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timezone.timedelta(days=7),
            registration_deadline=timezone.now().date() + timezone.timedelta(days=1),
            registration_fee=Decimal('10.00'),
            max_teams=8,
            venue='Main Stadium',
            description='Test Tournament Description',
            status='ongoing'
        )

    def test_dashboard_requires_admin(self):
        url = reverse('dashboard-overview')
        
        # Public
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Donor
        self.client.force_authenticate(user=self.donor)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_dashboard_metrics_calculation(self):
        url = reverse('dashboard-overview')
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        kpis = response.data['kpis']
        
        self.assertEqual(kpis['total_revenue'], 100.00) # Only succeeded payments
        self.assertEqual(kpis['total_orders'], 1)
        self.assertEqual(kpis['total_users'], 2)
        self.assertEqual(kpis['active_tournaments'], 1)
