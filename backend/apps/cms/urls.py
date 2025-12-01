from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PageViewSet, AchievementViewSet, MediaGalleryViewSet

router = DefaultRouter()
router.register(r'pages', PageViewSet)
router.register(r'achievements', AchievementViewSet)
router.register(r'gallery', MediaGalleryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
