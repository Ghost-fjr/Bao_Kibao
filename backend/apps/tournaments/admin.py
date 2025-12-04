from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Tournament, Team, Player, Pool, Match, Standing


class PlayerInline(admin.TabularInline):
    """Inline admin for players within a team"""
    model = Player
    extra = 1
    fields = ('name', 'email', 'phone', 'jersey_number', 'date_of_birth')


class TeamInline(admin.TabularInline):
    """Inline admin for teams within a tournament"""
    model = Team
    extra = 0
    fields = ('name', 'captain', 'status', 'payment_status')
    readonly_fields = ('registered_at',)
    show_change_link = True


class PoolInline(admin.TabularInline):
    """Inline admin for pools within a tournament"""
    model = Pool
    extra = 0
    show_change_link = True


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    """Admin interface for Tournament model"""
    list_display = ('name', 'category', 'venue', 'start_date', 'status', 'registered_teams_count', 'max_teams')
    list_filter = ('status', 'category', 'start_date')
    search_fields = ('name', 'venue', 'description')
    readonly_fields = ('created_at', 'updated_at', 'registered_teams_count')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('organization', 'name', 'description', 'category', 'status')
        }),
        ('Schedule', {
            'fields': ('start_date', 'end_date', 'registration_deadline')
        }),
        ('Registration', {
            'fields': ('registration_fee', 'max_teams', 'min_players_per_team', 'max_players_per_team')
        }),
        ('Details', {
            'fields': ('venue', 'rules', 'prizes', 'prize_pool', 'banner_image')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'registered_teams_count'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [TeamInline, PoolInline]
    
    actions = ['generate_pools', 'schedule_pool_matches', 'open_registration', 'close_registration']
    
    def generate_pools(self, request, queryset):
        """Generate pools for selected tournaments"""
        from .utils import generate_pools
        
        count = 0
        for tournament in queryset:
            try:
                pools_created = generate_pools(tournament)
                count += pools_created
                self.message_user(request, f'Generated {pools_created} pools for "{tournament.name}"')
            except Exception as e:
                self.message_user(request, f'Error generating pools for "{tournament.name}": {str(e)}', level='error')
        
        if count > 0:
            self.message_user(request, f'Successfully generated {count} total pools')
    
    generate_pools.short_description = "Generate pools for selected tournaments"
    
    def schedule_pool_matches(self, request, queryset):
        """Schedule matches for all pools in selected tournaments"""
        from .utils import schedule_pool_matches
        
        match_count = 0
        for tournament in queryset:
            pools = tournament.pools.all()
            for pool in pools:
                try:
                    matches = schedule_pool_matches(pool)
                    match_count += matches
                except Exception as e:
                    self.message_user(request, f'Error scheduling matches for {pool.name}: {str(e)}', level='error')
        
        if match_count > 0:
            self.message_user(request, f'Successfully scheduled {match_count} matches')
    
    schedule_pool_matches.short_description = "Schedule pool matches for selected tournaments"
    
    def open_registration(self, request, queryset):
        """Open registration for selected tournaments"""
        updated = queryset.update(status='open')
        self.message_user(request, f'Opened registration for {updated} tournament(s)')
    
    open_registration.short_description = "Open registration"
    
    def close_registration(self, request, queryset):
        """Close registration for selected tournaments"""
        updated = queryset.update(status='closed')
        self.message_user(request, f'Closed registration for {updated} tournament(s)')
    
    close_registration.short_description = "Close registration"


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    """Admin interface for Team model"""
    list_display = ('name', 'tournament', 'captain', 'status', 'payment_status', 'player_count', 'registered_at')
    list_filter = ('status', 'payment_status', 'tournament__category')
    search_fields = ('name', 'captain__email', 'tournament__name')
    readonly_fields = ('registered_at', 'approved_at', 'player_count')
    
    fieldsets = (
        ('Team Information', {
            'fields': ('tournament', 'name', 'captain', 'logo')
        }),
        ('Status', {
            'fields': ('status', 'payment_status', 'approved_at')
        }),
        ('Metadata', {
            'fields': ('registered_at', 'player_count'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [PlayerInline]
    
    actions = ['approve_teams', 'reject_teams', 'mark_payment_complete']
    
    def player_count(self, obj):
        """Display number of players in team"""
        return obj.players.count()
    
    player_count.short_description = 'Players'
    
    def approve_teams(self, request, queryset):
        """Approve selected teams"""
        from django.utils import timezone
        updated = queryset.update(status='approved', approved_at=timezone.now())
        self.message_user(request, f'Approved {updated} team(s)')
    
    approve_teams.short_description = "Approve selected teams"
    
    def reject_teams(self, request, queryset):
        """Reject selected teams"""
        updated = queryset.update(status='rejected')
        self.message_user(request, f'Rejected {updated} team(s)')
    
    reject_teams.short_description = "Reject selected teams"
    
    def mark_payment_complete(self, request, queryset):
        """Mark payment as complete for selected teams"""
        updated = queryset.update(payment_status='completed')
        self.message_user(request, f'Marked payment complete for {updated} team(s)')
    
    mark_payment_complete.short_description = "Mark payment complete"


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    """Admin interface for Player model"""
    list_display = ('name', 'team', 'jersey_number', 'email', 'phone', 'date_of_birth')
    list_filter = ('team__tournament', 'team')
    search_fields = ('name', 'email', 'phone', 'team__name')
    readonly_fields = ('added_at',)


@admin.register(Pool)
class PoolAdmin(admin.ModelAdmin):
    """Admin interface for Pool model"""
    list_display = ('name', 'tournament', 'team_count', 'created_at')
    list_filter = ('tournament',)
    search_fields = ('name', 'tournament__name')
    filter_horizontal = ('teams',)
    readonly_fields = ('created_at', 'team_count')
    
    def team_count(self, obj):
        """Display number of teams in pool"""
        return obj.teams.count()
    
    team_count.short_description = 'Teams'


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    """Admin interface for Match model"""
    list_display = ('match_summary', 'tournament', 'pool', 'match_date', 'status', 'score_display')
    list_filter = ('status', 'tournament', 'pool', 'match_date')
    search_fields = ('team1__name', 'team2__name', 'tournament__name')
    readonly_fields = ('created_at', 'updated_at', 'winner')
    
    fieldsets = (
        ('Match Details', {
            'fields': ('tournament', 'pool', 'round')
        }),
        ('Teams', {
            'fields': ('team1', 'team2')
        }),
        ('Schedule', {
            'fields': ('match_date', 'venue', 'status')
        }),
        ('Results', {
            'fields': ('team1_score', 'team2_score', 'winner')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_completed', 'mark_as_live']
    
    def match_summary(self, obj):
        """Display match summary"""
        return f"{obj.team1.name} vs {obj.team2.name}"
    
    match_summary.short_description = 'Match'
    
    def score_display(self, obj):
        """Display match score"""
        if obj.team1_score is not None and obj.team2_score is not None:
            return f"{obj.team1_score} - {obj.team2_score}"
        return "-"
    
    score_display.short_description = 'Score'
    
    def mark_as_completed(self, request, queryset):
        """Mark selected matches as completed"""
        updated = queryset.update(status='completed')
        self.message_user(request, f'Marked {updated} match(es) as completed')
    
    mark_as_completed.short_description = "Mark as completed"
    
    def mark_as_live(self, request, queryset):
        """Mark selected matches as live"""
        updated = queryset.update(status='live')
        self.message_user(request, f'Marked {updated} match(es) as live')
    
    mark_as_live.short_description = "Mark as live"


@admin.register(Standing)
class StandingAdmin(admin.ModelAdmin):
    """Admin interface for Standing model"""
    list_display = ('team', 'tournament', 'played', 'wins', 'draws', 'losses', 
                   'goals_for', 'goals_against', 'goal_difference', 'points')
    list_filter = ('tournament',)
    search_fields = ('team__name', 'tournament__name')
    readonly_fields = ('goal_difference',)
    
    fieldsets = (
        ('Team Information', {
            'fields': ('tournament', 'team')
        }),
        ('Match Statistics', {
            'fields': ('played', 'wins', 'draws', 'losses')
        }),
        ('Goals', {
            'fields': ('goals_for', 'goals_against', 'goal_difference')
        }),
        ('Points', {
            'fields': ('points',)
        }),
    )
