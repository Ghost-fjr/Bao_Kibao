from rest_framework import serializers
from .models import Tournament, Team, Player, Match, Standing, Pool
from apps.organizations.serializers import OrganizationSerializer
from apps.users.serializers import UserSerializer

class TournamentSerializer(serializers.ModelSerializer):
    """Serializer for Tournament model"""
    organization_details = OrganizationSerializer(source='organization', read_only=True)
    pools_count = serializers.IntegerField(source='pools.count', read_only=True)
    teams_count = serializers.IntegerField(source='teams.count', read_only=True)
    approved_teams_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Tournament
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'organization']
    
    def get_approved_teams_count(self, obj):
        return obj.teams.filter(status='approved').count()


class PlayerSerializer(serializers.ModelSerializer):
    """Serializer for Player model"""
    class Meta:
        model = Player
        fields = '__all__'
        read_only_fields = ['added_at']


class TeamSerializer(serializers.ModelSerializer):
    """Serializer for Team model"""
    captain_details = UserSerializer(source='captain', read_only=True)
    players = PlayerSerializer(many=True, read_only=True)
    player_count = serializers.IntegerField(source='players.count', read_only=True)
    
    class Meta:
        model = Team
        fields = '__all__'
        read_only_fields = ['registered_at', 'approved_at']


class TeamAdminSerializer(serializers.ModelSerializer):
    """Serializer for Team model with admin write permissions"""
    captain_details = UserSerializer(source='captain', read_only=True)
    players = PlayerSerializer(many=True, read_only=True)
    player_count = serializers.IntegerField(source='players.count', read_only=True)
    
    class Meta:
        model = Team
        fields = '__all__'
        read_only_fields = ['registered_at']


class MatchSerializer(serializers.ModelSerializer):
    """Serializer for Match model"""
    team1_details = TeamSerializer(source='team1', read_only=True)
    team2_details = TeamSerializer(source='team2', read_only=True)
    
    class Meta:
        model = Match
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class StandingSerializer(serializers.ModelSerializer):
    """Serializer for Standing model"""
    team_details = TeamSerializer(source='team', read_only=True)
    
    class Meta:
        model = Standing
        fields = '__all__'


class PoolSerializer(serializers.ModelSerializer):
    """Serializer for Pool model"""
    teams = TeamSerializer(many=True, read_only=True)
    team_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Team.objects.all(), 
        source='teams', 
        write_only=True,
        required=False
    )
    matches = serializers.SerializerMethodField()
    standings = serializers.SerializerMethodField()
    
    class Meta:
        model = Pool
        fields = '__all__'
    
    def get_matches(self, obj):
        matches = obj.matches.all().order_by('match_date')
        return MatchSerializer(matches, many=True).data
    
    def get_standings(self, obj):
        # Get standings for teams in this pool
        team_ids = obj.teams.values_list('id', flat=True)
        standings = Standing.objects.filter(
            tournament=obj.tournament,
            team_id__in=team_ids
        ).order_by('-points', '-goals_for')
        return StandingSerializer(standings, many=True).data
