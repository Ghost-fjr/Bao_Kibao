from rest_framework import serializers
from .models import Tournament, Team, Player, Match, Standing, Pool
from apps.organizations.serializers import OrganizationSerializer
from apps.users.serializers import UserSerializer

class TournamentSerializer(serializers.ModelSerializer):
    """Serializer for Tournament model"""
    organization_details = OrganizationSerializer(source='organization', read_only=True)
    
    class Meta:
        model = Tournament
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'organization']


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
    
    class Meta:
        model = Team
        fields = '__all__'
        read_only_fields = ['registered_at', 'approved_at', 'status', 'payment_status']


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
    
    class Meta:
        model = Pool
        fields = '__all__'
