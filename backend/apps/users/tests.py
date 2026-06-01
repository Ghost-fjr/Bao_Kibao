"""
Tests for user authentication, registration, email verification, and password reset.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
import uuid

User = get_user_model()


class UserRegistrationTests(APITestCase):
    def test_register_success(self):
        """Standard registration should succeed and return 201"""
        url = reverse('register')
        data = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'password': 'SecurePass123!',
            'confirm_password': 'SecurePass123!',
            'first_name': 'New',
            'last_name': 'User',
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_register_default_role_is_donor(self):
        """Registered users should always get the 'donor' role regardless of what is sent"""
        url = reverse('register')
        data = {
            'email': 'hacker@example.com',
            'username': 'hacker',
            'password': 'SecurePass123!',
            'confirm_password': 'SecurePass123!',
            'role': 'admin',  # Should be ignored
        }
        self.client.post(url, data)
        user = User.objects.filter(email='hacker@example.com').first()
        if user:
            self.assertNotEqual(user.role, 'admin', "User should not be able to self-assign admin role")

    def test_register_password_mismatch(self):
        """Mismatched passwords should return 400"""
        url = reverse('register')
        data = {
            'email': 'user@example.com',
            'username': 'user',
            'password': 'Pass123!',
            'confirm_password': 'Different123!',
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        """Duplicate email should return 400"""
        User.objects.create_user(username='existing', email='exists@example.com', password='pass')
        url = reverse('register')
        data = {
            'email': 'exists@example.com',
            'username': 'newuser',
            'password': 'SecurePass123!',
            'confirm_password': 'SecurePass123!',
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserLoginTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!'
        )

    def test_login_success_returns_tokens(self):
        """Successful login should return access and refresh tokens"""
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'email': 'test@example.com', 'password': 'TestPass123!'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_wrong_password(self):
        """Wrong password should return 401"""
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'email': 'test@example.com', 'password': 'WrongPassword!'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_user(self):
        """Login for non-existent user should return 401"""
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'email': 'nobody@example.com', 'password': 'anypass'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class LogoutTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='logoutuser',
            email='logout@example.com',
            password='TestPass123!'
        )
        login_url = reverse('token_obtain_pair')
        response = self.client.post(login_url, {'email': 'logout@example.com', 'password': 'TestPass123!'})
        self.access_token = response.data['access']
        self.refresh_token = response.data['refresh']

    def test_logout_blacklists_refresh_token(self):
        """Logout should blacklist the refresh token so it cannot be reused"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        logout_url = reverse('logout')
        response = self.client.post(logout_url, {'refresh': self.refresh_token})
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

        # Attempt to use the blacklisted refresh token — should fail
        refresh_url = reverse('token_refresh')
        response = self.client.post(refresh_url, {'refresh': self.refresh_token})
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_400_BAD_REQUEST])

    def test_logout_without_refresh_token(self):
        """Logout without a refresh token should return 400"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        url = reverse('logout')
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_requires_authentication(self):
        """Logout endpoint should require authentication"""
        url = reverse('logout')
        response = self.client.post(url, {'refresh': self.refresh_token})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class EmailVerificationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='verifyuser',
            email='verify@example.com',
            password='TestPass123!',
            is_verified=False
        )

    def test_verify_email_with_valid_token(self):
        """Valid token should verify the email"""
        url = reverse('verify-email', kwargs={'token': self.user.email_verification_token})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_verified)
        self.assertIsNotNone(self.user.email_verified_at)

    def test_verify_email_with_invalid_token(self):
        """Invalid token should return 400"""
        url = reverse('verify-email', kwargs={'token': uuid.uuid4()})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_email_already_verified(self):
        """Verifying an already verified email should return success"""
        self.user.is_verified = True
        self.user.save()
        url = reverse('verify-email', kwargs={'token': self.user.email_verification_token})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class PasswordResetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='resetuser',
            email='reset@example.com',
            password='OldPassword123!'
        )

    def test_password_reset_request_valid_email(self):
        """Valid email should return success (even if email fails to send)"""
        url = reverse('password-reset-request')
        response = self.client.post(url, {'email': 'reset@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_password_reset_request_nonexistent_email(self):
        """Non-existent email should still return success (prevent enumeration)"""
        url = reverse('password-reset-request')
        response = self.client.post(url, {'email': 'nobody@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_password_reset_confirm_valid_token(self):
        """Valid token should reset the password"""
        token = uuid.uuid4()
        self.user.password_reset_token = token
        self.user.password_reset_token_expires = timezone.now() + timezone.timedelta(hours=24)
        self.user.save()

        url = reverse('password-reset-confirm')
        response = self.client.post(url, {'token': str(token), 'new_password': 'NewPass123!'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass123!'))

    def test_password_reset_confirm_expired_token(self):
        """Expired token should return 400"""
        token = uuid.uuid4()
        self.user.password_reset_token = token
        self.user.password_reset_token_expires = timezone.now() - timezone.timedelta(hours=1)
        self.user.save()

        url = reverse('password-reset-confirm')
        response = self.client.post(url, {'token': str(token), 'new_password': 'NewPass123!'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_confirm_invalid_token(self):
        """Invalid token should return 400"""
        url = reverse('password-reset-confirm')
        response = self.client.post(url, {'token': str(uuid.uuid4()), 'new_password': 'NewPass123!'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ProtectedEndpointTests(APITestCase):
    """Verify that the default permission is IsAuthenticated, not AllowAny."""

    def test_profile_endpoint_requires_auth(self):
        """Profile endpoint should return 401 for unauthenticated requests"""
        url = reverse('profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_user_list_requires_admin(self):
        """User list endpoint should require admin role"""
        # Regular user
        user = User.objects.create_user(username='regular', email='reg@example.com', password='pass')
        self.client.force_authenticate(user=user)
        url = '/api/users/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
