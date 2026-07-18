from rest_framework import viewsets
from apps.common.permissions import IsAdminOrReadOnly
from apps.common.mixins import CacheResponseMixin
from .models import Page, Achievement, MediaGallery, GalleryCollection
from .serializers import PageSerializer, AchievementSerializer, MediaGallerySerializer, GalleryCollectionSerializer


class PageViewSet(CacheResponseMixin, viewsets.ModelViewSet):
    """ViewSet for Page CRUD"""
    cache_key_prefix = 'cms_pages'
    queryset = Page.objects.filter(is_published=True)
    serializer_class = PageSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()


class AchievementViewSet(CacheResponseMixin, viewsets.ModelViewSet):
    """ViewSet for Achievement CRUD"""
    cache_key_prefix = 'cms_achievements'
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()


class GalleryCollectionViewSet(CacheResponseMixin, viewsets.ModelViewSet):
    """ViewSet for Gallery Collections with nested media items"""
    cache_key_prefix = 'cms_gallery_collections'
    queryset = GalleryCollection.objects.filter(is_published=True).prefetch_related('media_items')
    serializer_class = GalleryCollectionSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()


class MediaGalleryViewSet(viewsets.ModelViewSet):
    """ViewSet for MediaGallery CRUD"""
    queryset = MediaGallery.objects.all()
    serializer_class = MediaGallerySerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()
