from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrganizationViewSet, OrganizationMemberViewSet

router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet)
router.register(r'members', OrganizationMemberViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
