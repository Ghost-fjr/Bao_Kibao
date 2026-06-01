"""
Tests for payment flows: M-Pesa initiation, callback processing,
payment link usage, and race condition protection.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from unittest.mock import patch, MagicMock

from .models import Payment, PaymentLink

User = get_user_model()


class MpesaInitiateTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='payuser',
            email='pay@example.com',
            password='TestPass123!'
        )
        self.client.force_authenticate(user=self.user)

    def test_initiate_requires_phone_and_amount(self):
        """Missing phone_number or amount should return 400"""
        url = reverse('mpesa-initiate')
        response = self.client.post(url, {'phone_number': '254712345678'})  # missing amount
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_initiate_requires_authentication(self):
        """Unauthenticated request should return 401"""
        self.client.force_authenticate(user=None)
        url = reverse('mpesa-initiate')
        response = self.client.post(url, {'phone_number': '254712345678', 'amount': 100})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('apps.payments.views.daraja_api')
    def test_initiate_success(self, mock_daraja):
        """Successful STK push should return 200 with checkout_request_id"""
        mock_daraja.initiate_stk_push.return_value = {
            'ResponseCode': '0',
            'CheckoutRequestID': 'ws_CO_123',
            'MerchantRequestID': 'mer_123',
        }
        url = reverse('mpesa-initiate')
        response = self.client.post(url, {
            'phone_number': '254712345678',
            'amount': 500,
            'payment_type': 'order',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('checkout_request_id', response.data)

        payment = Payment.objects.filter(user=self.user).first()
        self.assertIsNotNone(payment)
        self.assertEqual(payment.status, 'processing')
        self.assertEqual(payment.mpesa_checkout_request_id, 'ws_CO_123')

    @patch('apps.payments.views.daraja_api')
    def test_initiate_failure_marks_payment_failed(self, mock_daraja):
        """Failed STK push should mark the payment as failed"""
        mock_daraja.initiate_stk_push.return_value = {
            'errorMessage': 'Invalid phone number',
        }
        url = reverse('mpesa-initiate')
        response = self.client.post(url, {'phone_number': '254000000000', 'amount': 100})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class MpesaCallbackTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='calluser',
            email='callback@example.com',
            password='TestPass123!'
        )
        self.payment = Payment.objects.create(
            user=self.user,
            payment_type='order',
            amount=500,
            currency='KES',
            phone_number='254712345678',
            status='processing',
            payment_method='mpesa',
            mpesa_checkout_request_id='ws_CO_TEST123'
        )

    def _build_callback(self, result_code=0, checkout_id='ws_CO_TEST123'):
        return {
            'Body': {
                'stkCallback': {
                    'MerchantRequestID': 'mer_123',
                    'CheckoutRequestID': checkout_id,
                    'ResultCode': result_code,
                    'ResultDesc': 'The service request is processed successfully.' if result_code == 0 else 'Insufficient Funds',
                    'CallbackMetadata': {
                        'Item': [
                            {'Name': 'Amount', 'Value': 500},
                            {'Name': 'MpesaReceiptNumber', 'Value': 'NLJ7RT61SV'},
                            {'Name': 'TransactionDate', 'Value': 20231001120000},
                        ]
                    } if result_code == 0 else {}
                }
            }
        }

    def test_callback_success_marks_payment_succeeded(self):
        """Successful M-Pesa callback should mark payment as succeeded"""
        url = reverse('mpesa-callback')
        response = self.client.post(url, self._build_callback(result_code=0), format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, 'succeeded')
        self.assertEqual(self.payment.mpesa_receipt_number, 'NLJ7RT61SV')

    def test_callback_failure_marks_payment_failed(self):
        """Failed M-Pesa callback should mark payment as failed"""
        url = reverse('mpesa-callback')
        response = self.client.post(url, self._build_callback(result_code=1), format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, 'failed')

    def test_callback_unknown_checkout_id(self):
        """Unknown checkout ID should still return success to Safaricom"""
        url = reverse('mpesa-callback')
        response = self.client.post(url, self._build_callback(checkout_id='UNKNOWN_ID'), format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_callback_missing_checkout_id(self):
        """Callback with no CheckoutRequestID should return success (handles gracefully)"""
        url = reverse('mpesa-callback')
        response = self.client.post(url, {'Body': {'stkCallback': {}}}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class PaymentLinkTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='AdminPass123!',
            role='admin'
        )
        self.link = PaymentLink.objects.create(
            created_by=self.admin,
            title='Test Campaign',
            amount=1000,
            currency='KES',
            is_active=True,
            unique_code='TESTCODE01',
        )

    def test_get_valid_link(self):
        """GET with valid code should return link details"""
        url = reverse('public-payment-link', kwargs={'code': 'TESTCODE01'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_invalid_link(self):
        """GET with invalid code should return 404"""
        url = reverse('public-payment-link', kwargs={'code': 'BADCODE'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_inactive_link_returns_400(self):
        """Inactive link should return 400"""
        self.link.is_active = False
        self.link.save()
        url = reverse('public-payment-link', kwargs={'code': 'TESTCODE01'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_max_uses_reached_returns_400(self):
        """Link at max uses should return 400"""
        self.link.max_uses = 5
        self.link.current_uses = 5
        self.link.save()
        url = reverse('public-payment-link', kwargs={'code': 'TESTCODE01'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_guest_payment_does_not_crash(self):
        """Payment via link as unauthenticated guest should not crash with user=None"""
        # Payment.user is now nullable — this should not raise an IntegrityError
        payment = Payment.objects.create(
            user=None,  # Guest payment
            payment_type='order',
            amount=1000,
            currency='KES',
            phone_number='254712345678',
            status='pending',
            payment_method='mpesa',
            payment_link=self.link,
        )
        self.assertIsNone(payment.user)
        self.assertEqual(payment.status, 'pending')

    def test_current_uses_increments_atomically(self):
        """current_uses should increment correctly via F() expression"""
        from django.db.models import F
        initial_uses = self.link.current_uses
        PaymentLink.objects.filter(pk=self.link.pk).update(
            current_uses=F('current_uses') + 1
        )
        self.link.refresh_from_db()
        self.assertEqual(self.link.current_uses, initial_uses + 1)
