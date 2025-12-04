from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TournamentViewSet, TeamViewSet, MatchViewSet, PoolViewSet, StandingViewSet

router = DefaultRouter()
router.register(r'tournaments', TournamentViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'matches', MatchViewSet)
router.register(r'pools', PoolViewSet)
router.register(r'standings', StandingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
