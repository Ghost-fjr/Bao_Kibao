from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PageViewSet, AchievementViewSet, MediaGalleryViewSet, GalleryCollectionViewSet

router = DefaultRouter()
router.register(r'pages', PageViewSet, basename='page')
router.register(r'achievements', AchievementViewSet, basename='achievement')
router.register(r'gallery', MediaGalleryViewSet, basename='media-gallery')
router.register(r'gallery-collections', GalleryCollectionViewSet, basename='gallery-collection')

urlpatterns = [
    path('', include(router.urls)),
]
