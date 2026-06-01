"""
Admin-only user management CRUD endpoints at /api/users/.
Requires admin role or is_staff flag.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'', UserViewSet, basename='users')

urlpatterns = [
    path('', include(router.urls)),
]
