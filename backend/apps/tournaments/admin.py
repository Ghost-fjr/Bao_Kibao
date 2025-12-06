from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Tournament, TournamentCategory, Team, Player, Pool, Match, Standing


class PlayerInline(admin.TabularInline):
    """Inline admin for players within a team"""
    model = Player
    extra = 1
    fields = ('name', 'email', 'phone', 'jersey_number', 'date_of_birth')


class TeamInline(admin.TabularInline):
    """Inline admin for teams within a tournament"""
    model = Team
    extra = 0
    fields = ('name', 'category', 'status', 'payment_status')
    readonly_fields = ('registered_at',)
    show_change_link = True


class CategoryInline(admin.TabularInline):
    """Inline admin for categories within a tournament"""
    model = TournamentCategory
    extra = 1
    fields = ('name', 'short_name', 'min_age', 'max_age', 'max_teams', 'registration_fee', 'order')
    ordering = ['order']


class PoolInline(admin.TabularInline):
    """Inline admin for pools within a tournament"""
    model = Pool
    extra = 0
    fields = ('name', 'category')
    show_change_link = True


@admin.register(TournamentCategory)
class TournamentCategoryAdmin(admin.ModelAdmin):
    """Admin interface for TournamentCategory model"""
    list_display = ('name', 'tournament', 'short_name', 'min_age', 'max_age', 'registered_teams_count')
    list_filter = ('tournament',)
    search_fields = ('name', 'tournament__name')
    ordering = ['tournament', 'order']


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    """Admin interface for Tournament model"""
    list_display = ('name', 'get_categories', 'venue', 'start_date', 'status', 'registered_teams_count', 'max_teams')
    list_filter = ('status', 'start_date')
    search_fields = ('name', 'venue', 'description')
    readonly_fields = ('created_at', 'updated_at', 'registered_teams_count')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'status')
        }),
        ('Schedule', {
            'fields': ('start_date', 'end_date', 'registration_deadline')
        }),
        ('Registration Defaults', {
            'fields': ('registration_fee', 'max_teams', 'min_players_per_team', 'max_players_per_team'),
            'description': 'These are default values. Categories can override max_teams and registration_fee.'
        }),
        ('Details', {
            'fields': ('venue', 'rules', 'prizes', 'prize_pool', 'banner_image')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'registered_teams_count'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [CategoryInline, TeamInline, PoolInline]
    
    actions = ['generate_pools', 'schedule_pool_matches', 'open_registration', 'close_registration']

    def get_categories(self, obj):
        categories = obj.categories.all()
        if categories:
            return ', '.join([c.short_name or c.name for c in categories])
        return '-'
    get_categories.short_description = 'Categories'
    
    def generate_pools(self, request, queryset):
        for tournament in queryset:
            # Generate pools for each category
            for category in tournament.categories.all():
                approved_teams = list(category.teams.filter(status='approved'))
                if len(approved_teams) >= 4:
                    import random
                    random.shuffle(approved_teams)
                    
                    # Create 2 pools per category
                    pool_a, _ = Pool.objects.get_or_create(
                        tournament=tournament,
                        category=category,
                        name=f'Group A - {category.short_name or category.name}'
                    )
                    pool_b, _ = Pool.objects.get_or_create(
                        tournament=tournament,
                        category=category,
                        name=f'Group B - {category.short_name or category.name}'
                    )
                    
                    pool_a.teams.clear()
                    pool_b.teams.clear()
                    
                    for i, team in enumerate(approved_teams):
                        if i % 2 == 0:
                            pool_a.teams.add(team)
                        else:
                            pool_b.teams.add(team)
                    
                    # Create standings
                    for team in pool_a.teams.all():
                        Standing.objects.get_or_create(tournament=tournament, category=category, team=team)
                    for team in pool_b.teams.all():
                        Standing.objects.get_or_create(tournament=tournament, category=category, team=team)
                    
        self.message_user(request, f"Generated pools for {queryset.count()} tournament(s)")
    generate_pools.short_description = "Generate pools from approved teams"
    
    def schedule_pool_matches(self, request, queryset):
        from datetime import timedelta
        for tournament in queryset:
            for pool in tournament.pools.all():
                teams = list(pool.teams.all())
                match_date = tournament.start_date
                
                for i in range(len(teams)):
                    for j in range(i + 1, len(teams)):
                        Match.objects.get_or_create(
                            tournament=tournament,
                            category=pool.category,
                            pool=pool,
                            team1=teams[i],
                            team2=teams[j],
                            defaults={
                                'match_date': match_date,
                                'venue': tournament.venue,
                                'round': 'Pool Stage'
                            }
                        )
                        match_date += timedelta(hours=2)
                        
        self.message_user(request, f"Scheduled matches for {queryset.count()} tournament(s)")
    schedule_pool_matches.short_description = "Schedule pool matches"
    
    def open_registration(self, request, queryset):
        queryset.update(status='open')
        self.message_user(request, f"Opened registration for {queryset.count()} tournament(s)")
    open_registration.short_description = "Open registration"
    
    def close_registration(self, request, queryset):
        queryset.update(status='closed')
        self.message_user(request, f"Closed registration for {queryset.count()} tournament(s)")
    close_registration.short_description = "Close registration"


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    """Admin interface for Team model"""
    list_display = ('name', 'tournament', 'category', 'status', 'payment_status', 'player_count', 'registered_at')
    list_filter = ('status', 'payment_status', 'tournament', 'category')
    search_fields = ('name', 'tournament__name')
    readonly_fields = ('registered_at', 'approved_at')
    
    fieldsets = (
        ('Team Information', {
            'fields': ('tournament', 'category', 'name', 'logo')
        }),
        ('Status', {
            'fields': ('status', 'payment_status', 'approved_at')
        }),
        ('Metadata', {
            'fields': ('registered_at',),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [PlayerInline]
    
    actions = ['approve_teams', 'reject_teams', 'mark_payment_completed']
    
    def player_count(self, obj):
        return obj.players.count()
    player_count.short_description = 'Players'
    
    def approve_teams(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='approved', approved_at=timezone.now())
        self.message_user(request, f"Approved {queryset.count()} team(s)")
    approve_teams.short_description = "Approve selected teams"
    
    def reject_teams(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f"Rejected {queryset.count()} team(s)")
    reject_teams.short_description = "Reject selected teams"
    
    def mark_payment_completed(self, request, queryset):
        queryset.update(payment_status='completed')
        self.message_user(request, f"Marked payment as completed for {queryset.count()} team(s)")
    mark_payment_completed.short_description = "Mark payment as completed"


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    """Admin interface for Player model"""
    list_display = ('name', 'team', 'jersey_number', 'email', 'phone')
    list_filter = ('team__tournament', 'team__category', 'team')
    search_fields = ('name', 'email', 'team__name')


@admin.register(Pool)
class PoolAdmin(admin.ModelAdmin):
    """Admin interface for Pool model"""
    list_display = ('name', 'tournament', 'category', 'team_count')
    list_filter = ('tournament', 'category')
    filter_horizontal = ('teams',)
    
    def team_count(self, obj):
        return obj.teams.count()
    team_count.short_description = 'Teams'


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    """Admin interface for Match model"""
    list_display = ('match_display', 'category', 'pool', 'match_date', 'venue', 'status', 'score_display')
    list_filter = ('status', 'tournament', 'category', 'pool', 'match_date')
    search_fields = ('team1__name', 'team2__name', 'tournament__name')
    date_hierarchy = 'match_date'
    
    fieldsets = (
        ('Match Details', {
            'fields': ('tournament', 'category', 'pool', 'team1', 'team2', 'round')
        }),
        ('Schedule', {
            'fields': ('match_date', 'venue', 'status')
        }),
        ('Score', {
            'fields': ('team1_score', 'team2_score')
        }),
    )
    
    actions = ['mark_completed', 'update_standings']
    
    def match_display(self, obj):
        return f"{obj.team1.name} vs {obj.team2.name}"
    match_display.short_description = 'Match'
    
    def score_display(self, obj):
        if obj.team1_score is not None and obj.team2_score is not None:
            return f"{obj.team1_score} - {obj.team2_score}"
        return "-"
    score_display.short_description = 'Score'
    
    def mark_completed(self, request, queryset):
        queryset.update(status='completed')
        self.message_user(request, f"Marked {queryset.count()} match(es) as completed")
    mark_completed.short_description = "Mark as completed"
    
    def update_standings(self, request, queryset):
        for match in queryset.filter(status='completed'):
            if match.team1_score is not None and match.team2_score is not None:
                standing1, _ = Standing.objects.get_or_create(
                    tournament=match.tournament,
                    category=match.category,
                    team=match.team1
                )
                standing2, _ = Standing.objects.get_or_create(
                    tournament=match.tournament,
                    category=match.category,
                    team=match.team2
                )
                
                standing1.played += 1
                standing2.played += 1
                standing1.goals_for += match.team1_score
                standing1.goals_against += match.team2_score
                standing2.goals_for += match.team2_score
                standing2.goals_against += match.team1_score
                
                if match.team1_score > match.team2_score:
                    standing1.wins += 1
                    standing1.points += 3
                    standing2.losses += 1
                elif match.team2_score > match.team1_score:
                    standing2.wins += 1
                    standing2.points += 3
                    standing1.losses += 1
                else:
                    standing1.draws += 1
                    standing2.draws += 1
                    standing1.points += 1
                    standing2.points += 1
                
                standing1.save()
                standing2.save()
                
        self.message_user(request, f"Updated standings for {queryset.count()} match(es)")
    update_standings.short_description = "Update standings from match results"


@admin.register(Standing)
class StandingAdmin(admin.ModelAdmin):
    """Admin interface for Standing model"""
    list_display = ('team', 'tournament', 'category', 'played', 'wins', 'draws', 'losses', 'goals_for', 'goals_against', 'goal_difference', 'points')
    list_filter = ('tournament', 'category')
    search_fields = ('team__name', 'tournament__name')
    ordering = ['-points', '-goals_for']
