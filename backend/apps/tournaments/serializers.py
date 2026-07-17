from rest_framework import serializers
from .models import Tournament, TournamentCategory, Team, Player, Match, Standing, Pool


class TournamentCategorySerializer(serializers.ModelSerializer):
    """Serializer for TournamentCategory model"""
    registered_teams_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TournamentCategory
        fields = '__all__'
        read_only_fields = ['created_at']
    
    def get_registered_teams_count(self, obj):
        return obj.teams.filter(status='approved').count()


class TournamentSerializer(serializers.ModelSerializer):
    """Serializer for Tournament model"""
    categories = TournamentCategorySerializer(many=True, read_only=True)
    pools_count = serializers.IntegerField(source='pools.count', read_only=True)
    teams_count = serializers.IntegerField(source='teams.count', read_only=True)
    approved_teams_count = serializers.SerializerMethodField()
    categories_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Tournament
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_approved_teams_count(self, obj):
        return obj.teams.filter(status='approved').count()
    
    def get_categories_list(self, obj):
        return list(obj.categories.values_list('name', flat=True))


class TournamentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Tournament with categories"""
    categories_data = serializers.JSONField(
        write_only=True, 
        required=False
    )
    
    class Meta:
        model = Tournament
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def validate_categories_data(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Expected a list of categories.")
        for item in value:
            if not isinstance(item, dict):
                raise serializers.ValidationError("Each category must be a JSON object.")
        return value
    
    def create(self, validated_data):
        categories_data = validated_data.pop('categories_data', [])
        tournament = Tournament.objects.create(**validated_data)
        
        for idx, cat_data in enumerate(categories_data):
            TournamentCategory.objects.create(
                tournament=tournament,
                name=cat_data.get('name', f'Category {idx + 1}'),
                short_name=cat_data.get('short_name', ''),
                description=cat_data.get('description', ''),
                min_age=cat_data.get('min_age') if cat_data.get('min_age') not in ['', None] else None,
                max_age=cat_data.get('max_age') if cat_data.get('max_age') not in ['', None] else None,
                max_teams=cat_data.get('max_teams') if cat_data.get('max_teams') not in ['', None] else None,
                registration_fee=cat_data.get('registration_fee') if cat_data.get('registration_fee') not in ['', None] else None,
                order=idx
            )
        
        return tournament
    
    def update(self, instance, validated_data):
        categories_data = validated_data.pop('categories_data', None)
        
        # Update tournament fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update categories if provided
        if categories_data is not None:
            # Get existing category IDs
            existing_ids = set(instance.categories.values_list('id', flat=True))
            updated_ids = set()
            
            for idx, cat_data in enumerate(categories_data):
                cat_id = cat_data.get('id')
                if cat_id and cat_id in existing_ids:
                    # Update existing category
                    cat = TournamentCategory.objects.get(id=cat_id)
                    cat.name = cat_data.get('name', cat.name)
                    cat.short_name = cat_data.get('short_name', cat.short_name)
                    cat.description = cat_data.get('description', cat.description)
                    cat.min_age = cat_data.get('min_age') if cat_data.get('min_age') not in ['', None] else None
                    cat.max_age = cat_data.get('max_age') if cat_data.get('max_age') not in ['', None] else None
                    cat.max_teams = cat_data.get('max_teams') if cat_data.get('max_teams') not in ['', None] else None
                    cat.registration_fee = cat_data.get('registration_fee') if cat_data.get('registration_fee') not in ['', None] else None
                    cat.order = idx
                    cat.save()
                    updated_ids.add(cat_id)
                else:
                    # Create new category
                    new_cat = TournamentCategory.objects.create(
                        tournament=instance,
                        name=cat_data.get('name', f'Category {idx + 1}'),
                        short_name=cat_data.get('short_name', ''),
                        description=cat_data.get('description', ''),
                        min_age=cat_data.get('min_age') if cat_data.get('min_age') not in ['', None] else None,
                        max_age=cat_data.get('max_age') if cat_data.get('max_age') not in ['', None] else None,
                        max_teams=cat_data.get('max_teams') if cat_data.get('max_teams') not in ['', None] else None,
                        registration_fee=cat_data.get('registration_fee') if cat_data.get('registration_fee') not in ['', None] else None,
                        order=idx
                    )
                    updated_ids.add(new_cat.id)
            
            # Delete categories not in the update
            to_delete = existing_ids - updated_ids
            TournamentCategory.objects.filter(id__in=to_delete).delete()
        
        return instance


class PlayerSerializer(serializers.ModelSerializer):
    """Serializer for Player model"""
    class Meta:
        model = Player
        fields = '__all__'
        read_only_fields = ['added_at']


class TeamSerializer(serializers.ModelSerializer):
    """Serializer for Team model"""
    players = PlayerSerializer(many=True, read_only=True)
    player_count = serializers.IntegerField(source='players.count', read_only=True)
    category_details = TournamentCategorySerializer(source='category', read_only=True)
    
    class Meta:
        model = Team
        fields = '__all__'
        read_only_fields = ['registered_at', 'approved_at']


class TournamentRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for registering a new team with nested players"""
    players = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Team
        fields = [
            'id', 'tournament', 'category', 'name', 'logo', 'status', 'payment_status',
            'captain_name', 'captain_email', 'captain_phone', 'alt_contact_person', 'alt_contact_phone',
            'accepted_rules', 'mpesa_confirmation_code', 'mpesa_name', 'players'
        ]
        read_only_fields = ['status', 'payment_status']
        
    def validate(self, data):
        # Ensure rules are accepted
        if not data.get('accepted_rules'):
            raise serializers.ValidationError({"accepted_rules": "You must accept the tournament rules to register."})
            
        players_data = data.get('players', [])
        if len(players_data) > 10:
            raise serializers.ValidationError({"players": "Maximum squad size is 10 players."})
            
        return data

    def create(self, validated_data):
        players_data = validated_data.pop('players', [])
        
        # Create team
        team = Team.objects.create(**validated_data)
        
        # Create players atomically
        for idx, player_dict in enumerate(players_data):
            # Form allows simply entering "Full Name"
            name = player_dict.get('name')
            if name:
                Player.objects.create(
                    team=team,
                    name=name,
                    jersey_number=idx + 1  # default jersey number
                )
                
        return team



class TeamAdminSerializer(serializers.ModelSerializer):
    """Serializer for Team model with admin write permissions"""
    players = PlayerSerializer(many=True, read_only=True)
    player_count = serializers.IntegerField(source='players.count', read_only=True)
    category_details = TournamentCategorySerializer(source='category', read_only=True)
    
    class Meta:
        model = Team
        fields = '__all__'
        read_only_fields = ['registered_at']


class MatchSerializer(serializers.ModelSerializer):
    """Serializer for Match model"""
    team1_details = TeamSerializer(source='team1', read_only=True)
    team2_details = TeamSerializer(source='team2', read_only=True)
    category_details = TournamentCategorySerializer(source='category', read_only=True)
    
    class Meta:
        model = Match
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class StandingSerializer(serializers.ModelSerializer):
    """Serializer for Standing model"""
    team_details = TeamSerializer(source='team', read_only=True)
    category_details = TournamentCategorySerializer(source='category', read_only=True)
    
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
    category_details = TournamentCategorySerializer(source='category', read_only=True)
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
