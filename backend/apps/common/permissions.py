"""
Shared DRF permission classes for the Bao Kibao platform.
Import from here rather than defining locally in each app.
"""
from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Allow access only to users with the 'admin' role or Django's is_staff flag.
    Use this as the single source of truth for admin-level permission checks.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_staff or getattr(request.user, 'role', None) == 'admin')
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Read access (GET, HEAD, OPTIONS) to any authenticated user.
    Write access (POST, PUT, PATCH, DELETE) only to admins.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user.is_staff or
            getattr(request.user, 'role', None) == 'admin'
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission: allow access if the user owns the object or is admin.
    Views using this must implement get_object().
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or getattr(request.user, 'role', None) == 'admin':
            return True
        # Attempt to match common owner fields
        for field in ('user', 'owner', 'created_by'):
            if hasattr(obj, field) and getattr(obj, field) == request.user:
                return True
        return False
