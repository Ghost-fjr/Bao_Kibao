from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TournamentViewSet, TeamViewSet, MatchViewSet

router = DefaultRouter()
router.register(r'tournaments', TournamentViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'matches', MatchViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
