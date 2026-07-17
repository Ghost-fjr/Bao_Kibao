from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Page, Achievement, GalleryCollection, MediaGallery

User = get_user_model()

class CMSPermissionTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username='admin', email='admin@test.com', password='password123', role='admin')
        self.donor = User.objects.create_user(username='donor', email='donor@test.com', password='password123', role='donor')
        
        self.page = Page.objects.create(title='About Us', content='Test Content', is_published=True)
        self.achievement = Achievement.objects.create(title='Won Cup', description='Test', date='2026-01-01')
        self.collection = GalleryCollection.objects.create(title='Summer Event', event_date='2026-06-01')

    def test_page_read_only_for_public(self):
        url = reverse('page-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_page_create_requires_admin(self):
        url = reverse('page-list')
        data = {'title': 'New Page', 'content': 'Content'}
        
        # Public
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Donor
        self.client.force_authenticate(user=self.donor)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Admin
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_achievement_read_only_for_public(self):
        url = reverse('achievement-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_achievement_create_requires_admin(self):
        url = reverse('achievement-list')
        data = {'title': 'New Goal', 'description': 'desc', 'date': '2026-07-01'}
        
        self.client.force_authenticate(user=self.donor)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_gallery_read_only_for_public(self):
        url = reverse('gallery-collection-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_gallery_create_requires_admin(self):
        url = reverse('gallery-collection-list')
        data = {'title': 'Winter Event', 'event_date': '2026-12-01'}
        
        self.client.force_authenticate(user=self.donor)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
