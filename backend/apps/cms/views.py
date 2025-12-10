from rest_framework import viewsets, permissions
from .models import Page, Achievement, MediaGallery, GalleryCollection
from .serializers import PageSerializer, AchievementSerializer, MediaGallerySerializer, GalleryCollectionSerializer


class PageViewSet(viewsets.ModelViewSet):
    """ViewSet for Page CRUD"""
    queryset = Page.objects.filter(is_published=True)
    serializer_class = PageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()


class AchievementViewSet(viewsets.ModelViewSet):
    """ViewSet for Achievement CRUD"""
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()


class GalleryCollectionViewSet(viewsets.ModelViewSet):
    """ViewSet for Gallery Collections with nested media items"""
    queryset = GalleryCollection.objects.filter(is_published=True).prefetch_related('media_items')
    serializer_class = GalleryCollectionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()


class MediaGalleryViewSet(viewsets.ModelViewSet):
    """ViewSet for MediaGallery CRUD"""
    queryset = MediaGallery.objects.all()
    serializer_class = MediaGallerySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()
