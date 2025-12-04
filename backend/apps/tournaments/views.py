from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.shortcuts import get_object_or_404
from .models import Tournament, Team, Player, Match, Standing, Pool
from .serializers import (
    TournamentSerializer, TeamSerializer, TeamAdminSerializer, PlayerSerializer, 
    MatchSerializer, StandingSerializer, PoolSerializer
)
from .utils import generate_pools, schedule_pool_matches, update_standings

class TournamentViewSet(viewsets.ModelViewSet):
    """ViewSet for Tournament CRUD"""
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'venue']
    ordering_fields = ['start_date', 'created_at']

    def perform_create(self, serializer):
        # Auto-set organization from user's first active membership
        membership = self.request.user.org_memberships.filter(is_active=True).first()
        if membership:
            serializer.save(organization=membership.organization)
        else:
            raise ValidationError("User is not a member of any organization")

    def perform_update(self, serializer):
        # Ensure user can only update items from their organization
        instance = self.get_object()
        membership = self.request.user.org_memberships.filter(is_active=True).first()
        if not membership or instance.organization != membership.organization:
            raise PermissionDenied("Cannot update tournaments from other organizations")
        serializer.save()

    def get_queryset(self):
        # Filter by user's organization for authenticated users
        if self.request.user.is_authenticated:
            memberships = self.request.user.org_memberships.filter(is_active=True)
            org_ids = memberships.values_list('organization_id', flat=True)
            return Tournament.objects.filter(organization_id__in=org_ids)
        # Public users see all tournaments
        return Tournament.objects.all()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def register_team(self, request, pk=None):
        """Register a team for the tournament"""
        tournament = self.get_object()
        
        # Check if registration is open
        if not tournament.is_registration_open:
            return Response(
                {"error": "Registration is closed for this tournament"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Create team
        serializer = TeamSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                tournament=tournament,
                captain=request.user,
                status='pending'
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def standings(self, request, pk=None):
        """Get tournament standings"""
        tournament = self.get_object()
        standings = Standing.objects.filter(tournament=tournament).order_by('-points', '-goals_for')
        serializer = StandingSerializer(standings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def matches(self, request, pk=None):
        """Get tournament matches"""
        tournament = self.get_object()
        matches = Match.objects.filter(tournament=tournament).order_by('match_date')
        serializer = MatchSerializer(matches, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def generate_pools(self, request, pk=None):
        """Generate pools for the tournament from approved teams"""
        tournament = self.get_object()
        
        # Check if user has permission (admin or org member)
        user = request.user
        if user.role != 'admin':
            membership = user.org_memberships.filter(
                organization=tournament.organization,
                is_active=True
            ).first()
            if not membership:
                raise PermissionDenied("You don't have permission to manage this tournament")
        
        teams_per_pool = request.data.get('teams_per_pool', 4)
        
        try:
            pools_created = generate_pools(tournament, teams_per_pool)
            return Response({
                'message': f'Successfully generated {pools_created} pools',
                'pools_count': pools_created
            }, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def pools(self, request, pk=None):
        """Get all pools for the tournament"""
        tournament = self.get_object()
        pools = tournament.pools.all().order_by('name')
        serializer = PoolSerializer(pools, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def schedule_matches(self, request, pk=None):
        """Schedule matches for all pools in the tournament"""
        tournament = self.get_object()
        
        # Check if user has permission
        user = request.user
        if user.role != 'admin':
            membership = user.org_memberships.filter(
                organization=tournament.organization,
                is_active=True
            ).first()
            if not membership:
                raise PermissionDenied("You don't have permission to manage this tournament")
        
        pools = tournament.pools.all()
        if not pools.exists():
            return Response(
                {'error': 'No pools found. Generate pools first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        total_matches = 0
        for pool in pools:
            try:
                matches = schedule_pool_matches(pool)
                total_matches += matches
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'message': f'Successfully scheduled {total_matches} matches',
            'matches_count': total_matches
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def teams(self, request, pk=None):
        """Get all teams registered for the tournament"""
        tournament = self.get_object()
        teams = tournament.teams.all().order_by('-registered_at')
        serializer = TeamSerializer(teams, many=True)
        return Response(serializer.data)


class TeamViewSet(viewsets.ModelViewSet):
    """ViewSet for Team CRUD"""
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter teams by user if not admin
        user = self.request.user
        if user.role == 'admin':
            return Team.objects.all()
        return Team.objects.filter(captain=user)

    @action(detail=True, methods=['post'])
    def add_player(self, request, pk=None):
        """Add player to team"""
        team = self.get_object()
        
        # Check if user is captain or admin
        if team.captain != request.user and request.user.role != 'admin':
            return Response(
                {"error": "Only team captain or admin can add players"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = PlayerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(team=team)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        """Approve a team (admin only)"""
        team = self.get_object()
        
        # Check if user is admin
        if request.user.role != 'admin':
            raise PermissionDenied("Only admins can approve teams")
        
        from django.utils import timezone
        team.status = 'approved'
        team.approved_at = timezone.now()
        team.save()
        
        return Response(TeamSerializer(team).data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        """Reject a team (admin only)"""
        team = self.get_object()
        
        # Check if user is admin
        if request.user.role != 'admin':
            raise PermissionDenied("Only admins can reject teams")
        
        team.status = 'rejected'
        team.save()
        
        return Response(TeamSerializer(team).data)
    
    def get_serializer_class(self):
        """Use admin serializer for admin users"""
        if self.request.user.is_authenticated and self.request.user.role == 'admin':
            return TeamAdminSerializer
        return TeamSerializer


class MatchViewSet(viewsets.ModelViewSet):
    """ViewSet for Match CRUD"""
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def update_result(self, request, pk=None):
        """Update match result and standings"""
        match = self.get_object()
        team1_score = request.data.get('team1_score')
        team2_score = request.data.get('team2_score')
        
        if team1_score is not None and team2_score is not None:
            match.team1_score = team1_score
            match.team2_score = team2_score
            match.status = 'completed'
            match.save()
            
            # Update standings automatically
            update_standings(match)
            
            return Response(MatchSerializer(match).data)
        return Response({"error": "Scores required"}, status=status.HTTP_400_BAD_REQUEST)


class PoolViewSet(viewsets.ModelViewSet):
    """ViewSet for Pool CRUD"""
    queryset = Pool.objects.all()
    serializer_class = PoolSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=True, methods=['get'])
    def standings(self, request, pk=None):
        """Get standings for teams in this pool"""
        pool = self.get_object()
        team_ids = pool.teams.values_list('id', flat=True)
        standings = Standing.objects.filter(
            tournament=pool.tournament,
            team_id__in=team_ids
        ).order_by('-points', '-goals_for')
        serializer = StandingSerializer(standings, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def matches(self, request, pk=None):
        """Get matches for this pool"""
        pool = self.get_object()
        matches = pool.matches.all().order_by('match_date')
        serializer = MatchSerializer(matches, many=True)
        return Response(serializer.data)


class StandingViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Standing (read-only)"""
    queryset = Standing.objects.all()
    serializer_class = StandingSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Standing.objects.all().order_by('-points', '-goals_for')
        tournament_id = self.request.query_params.get('tournament', None)
        if tournament_id:
            queryset = queryset.filter(tournament_id=tournament_id)
        return queryset
