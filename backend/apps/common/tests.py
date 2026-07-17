from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from apps.common.permissions import IsAdminOrReadOnly, IsAdminUser

User = get_user_model()

class PermissionTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin = User.objects.create_user(username='admin', email='admin@test.com', password='pass', role='admin')
        self.donor = User.objects.create_user(username='donor', email='donor@test.com', password='pass', role='donor')

    def test_is_admin_or_read_only(self):
        permission = IsAdminOrReadOnly()
        
        # GET request (Read only) should be allowed for anyone
        request = self.factory.get('/')
        request.user = self.donor
        self.assertTrue(permission.has_permission(request, None))
        
        # POST request should be denied for donor
        request = self.factory.post('/')
        request.user = self.donor
        self.assertFalse(permission.has_permission(request, None))
        
        # POST request should be allowed for admin
        request = self.factory.post('/')
        request.user = self.admin
        self.assertTrue(permission.has_permission(request, None))

    def test_is_admin_user(self):
        permission = IsAdminUser()
        
        # GET request should be denied for donor
        request = self.factory.get('/')
        request.user = self.donor
        self.assertFalse(permission.has_permission(request, None))
        
        # GET request should be allowed for admin
        request = self.factory.get('/')
        request.user = self.admin
        self.assertTrue(permission.has_permission(request, None))
