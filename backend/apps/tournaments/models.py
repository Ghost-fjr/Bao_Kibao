from django.db import models
from django.utils import timezone
from apps.users.models import User


class Tournament(models.Model):
    """Tournament model for managing football tournaments"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('open', 'Open for Registration'),
        ('closed', 'Registration Closed'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    registration_deadline = models.DateTimeField()
    registration_fee = models.DecimalField(max_digits=10, decimal_places=2)
    max_teams = models.PositiveIntegerField(help_text="Maximum teams per category")
    min_players_per_team = models.PositiveIntegerField(default=7)
    max_players_per_team = models.PositiveIntegerField(default=15)
    venue = models.CharField(max_length=300)
    rules = models.TextField(blank=True)
    prizes = models.TextField(blank=True)
    prize_pool = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text="Total prize pool amount")
    banner_image = models.ImageField(upload_to='tournaments/banners/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return self.name

    @property
    def is_registration_open(self):
        now = timezone.now()
        return (
            self.status == 'open' and
            now < self.registration_deadline
        )

    @property
    def registered_teams_count(self):
        return self.teams.filter(status='approved').count()


class TournamentCategory(models.Model):
    """Category/Age group for tournaments (e.g., U12, U16, U18, Open)"""
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)  # e.g., "Under 12", "Under 16", "Open/Adults"
    short_name = models.CharField(max_length=20, blank=True)  # e.g., "U12", "U16", "Open"
    description = models.TextField(blank=True)
    min_age = models.PositiveIntegerField(null=True, blank=True, help_text="Minimum age for this category")
    max_age = models.PositiveIntegerField(null=True, blank=True, help_text="Maximum age for this category")
    max_teams = models.PositiveIntegerField(null=True, blank=True, help_text="Max teams for this category (overrides tournament default)")
    registration_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Fee for this category (overrides tournament default)")
    order = models.PositiveIntegerField(default=0, help_text="Display order")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'name']
        unique_together = ['tournament', 'name']
        verbose_name_plural = 'Tournament Categories'

    def __str__(self):
        return f"{self.name} - {self.tournament.name}"

    @property
    def registered_teams_count(self):
        return self.teams.filter(status='approved').count()


class Team(models.Model):
    """Team model for tournament participants"""
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]

    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='teams')
    category = models.ForeignKey(TournamentCategory, on_delete=models.CASCADE, related_name='teams', null=True, blank=True)
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to='teams/logos/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, default='pending')
    registered_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['tournament', 'category', 'name']
        ordering = ['-registered_at']

    def __str__(self):
        cat = f" ({self.category.short_name or self.category.name})" if self.category else ""
        return f"{self.name}{cat} - {self.tournament.name}"


class Player(models.Model):
    """Player model for team members"""
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='players')
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    jersey_number = models.PositiveIntegerField()
    date_of_birth = models.DateField(null=True, blank=True)
    photo = models.ImageField(upload_to='players/photos/', null=True, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['team', 'jersey_number']
        ordering = ['jersey_number']

    def __str__(self):
        return f"{self.name} (#{self.jersey_number}) - {self.team.name}"


class Pool(models.Model):
    """Pool/Group model for tournament structure"""
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='pools')
    category = models.ForeignKey(TournamentCategory, on_delete=models.CASCADE, related_name='pools', null=True, blank=True)
    name = models.CharField(max_length=100)  # e.g., "Group A", "Pool 1"
    teams = models.ManyToManyField(Team, related_name='pools')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['tournament', 'category', 'name']
        ordering = ['name']

    def __str__(self):
        cat = f" ({self.category.short_name})" if self.category else ""
        return f"{self.name}{cat} - {self.tournament.name}"


class Match(models.Model):
    """Match model for tournament fixtures"""
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('live', 'Live'),
        ('completed', 'Completed'),
        ('postponed', 'Postponed'),
        ('cancelled', 'Cancelled'),
    ]

    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches')
    category = models.ForeignKey(TournamentCategory, on_delete=models.CASCADE, related_name='matches', null=True, blank=True)
    pool = models.ForeignKey(Pool, on_delete=models.SET_NULL, null=True, blank=True, related_name='matches')
    team1 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='home_matches')
    team2 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='away_matches')
    team1_score = models.PositiveIntegerField(null=True, blank=True)
    team2_score = models.PositiveIntegerField(null=True, blank=True)
    match_date = models.DateTimeField()
    venue = models.CharField(max_length=300)
    round = models.CharField(max_length=100, blank=True)  # e.g., "Quarter Final", "Semi Final"
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['match_date']
        verbose_name_plural = 'Matches'

    def __str__(self):
        return f"{self.team1.name} vs {self.team2.name} - {self.match_date.strftime('%Y-%m-%d')}"

    @property
    def winner(self):
        if self.status == 'completed' and self.team1_score is not None and self.team2_score is not None:
            if self.team1_score > self.team2_score:
                return self.team1
            elif self.team2_score > self.team1_score:
                return self.team2
        return None


class Standing(models.Model):
    """Tournament standings/leaderboard"""
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='standings')
    category = models.ForeignKey(TournamentCategory, on_delete=models.CASCADE, related_name='standings', null=True, blank=True)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='standings')
    played = models.PositiveIntegerField(default=0)
    wins = models.PositiveIntegerField(default=0)
    draws = models.PositiveIntegerField(default=0)
    losses = models.PositiveIntegerField(default=0)
    goals_for = models.PositiveIntegerField(default=0)
    goals_against = models.PositiveIntegerField(default=0)
    points = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ['tournament', 'category', 'team']
        ordering = ['-points', '-goals_for']

    def __str__(self):
        return f"{self.team.name} - {self.points} pts"

    @property
    def goal_difference(self):
        return self.goals_for - self.goals_against
