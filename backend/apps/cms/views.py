from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from .models import Page, Achievement, MediaGallery, GalleryCollection
from .serializers import PageSerializer, AchievementSerializer, MediaGallerySerializer, GalleryCollectionSerializer

class PageViewSet(viewsets.ModelViewSet):
    """ViewSet for Page CRUD"""
    queryset = Page.objects.filter(is_published=True)
    serializer_class = PageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        membership = self.request.user.org_memberships.filter(is_active=True).first()
        if membership:
            serializer.save(organization=membership.organization)
        else:
            raise ValidationError("User is not a member of any organization")

    def perform_update(self, serializer):
        instance = self.get_object()
        membership = self.request.user.org_memberships.filter(is_active=True).first()
        if membership and instance.organization == membership.organization:
            serializer.save()
        else:
            raise ValidationError("You can only update items from your organization")


class AchievementViewSet(viewsets.ModelViewSet):
    """ViewSet for Achievement CRUD"""
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        membership = self.request.user.org_memberships.filter(is_active=True).first()
        if membership:
            serializer.save(organization=membership.organization)
        else:
            raise ValidationError("User is not a member of any organization")

    def perform_update(self, serializer):
        instance = self.get_object()
        membership = self.request.user.org_memberships.filter(is_active=True).first()
        if membership and instance.organization == membership.organization:
            serializer.save()
        else:
            raise ValidationError("You can only update items from your organization")


class GalleryCollectionViewSet(viewsets.ModelViewSet):
    """ViewSet for Gallery Collections with nested media items"""
    queryset = GalleryCollection.objects.filter(is_published=True).prefetch_related('media_items')
    serializer_class = GalleryCollectionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        membership = self.request.user.org_memberships.filter(is_active=True).first()
        if membership:
            serializer.save(organization=membership.organization)
        else:
            raise ValidationError("User is not a member of any organization")

    def perform_update(self, serializer):
        instance = self.get_object()
        membership = self.request.user.org_memberships.filter(is_active=True).first()
        if membership and instance.organization == membership.organization:
            serializer.save()
        else:
            raise ValidationError("You can only update items from your organization")


class MediaGalleryViewSet(viewsets.ModelViewSet):
    """ViewSet for MediaGallery CRUD"""
    queryset = MediaGallery.objects.all()
    serializer_class = MediaGallerySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        membership = self.request.user.org_memberships.filter(is_active=True).first()
        if membership:
            serializer.save(organization=membership.organization)
        else:
            raise ValidationError("User is not a member of any organization")

    def perform_update(self, serializer):
        instance = self.get_object()
        membership = self.request.user.org_memberships.filter(is_active=True).first()
        if membership and instance.organization == membership.organization:
            serializer.save()
        else:
            raise ValidationError("You can only update items from your organization")
