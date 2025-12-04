"""
Utility functions for tournament management
"""
from datetime import timedelta
from django.utils import timezone
from .models import Pool, Match, Standing


def generate_pools(tournament, teams_per_pool=4):
    """
    Generate pools/groups for a tournament from approved teams.
    
    Args:
        tournament: Tournament instance
        teams_per_pool: Number of teams per pool (default: 4, football-style)
    
    Returns:
        Number of pools created
    
    Raises:
        ValueError: If not enough teams are approved
    """
    # Get all approved teams
    approved_teams = tournament.teams.filter(status='approved').order_by('registered_at')
    team_count = approved_teams.count()
    
    if team_count < 2:
        raise ValueError(f"Need at least 2 approved teams to generate pools. Currently have {team_count}")
    
    # Calculate number of pools needed
    num_pools = max(1, (team_count + teams_per_pool - 1) // teams_per_pool)
    
    # Delete existing pools for this tournament
    tournament.pools.all().delete()
    
    # Create pools
    pools = []
    pool_names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']
    
    for i in range(num_pools):
        pool_name = f"Group {pool_names[i]}" if i < len(pool_names) else f"Group {i + 1}"
        pool = Pool.objects.create(
            tournament=tournament,
            name=pool_name
        )
        pools.append(pool)
    
    # Distribute teams evenly across pools (snake draft style for balance)
    team_list = list(approved_teams)
    for idx, team in enumerate(team_list):
        pool_idx = idx % num_pools
        pools[pool_idx].teams.add(team)
    
    # Create standings for each team
    for team in approved_teams:
        Standing.objects.get_or_create(
            tournament=tournament,
            team=team,
            defaults={
                'played': 0,
                'wins': 0,
                'draws': 0,
                'losses': 0,
                'goals_for': 0,
                'goals_against': 0,
                'points': 0
            }
        )
    
    return num_pools


def schedule_pool_matches(pool):
    """
    Schedule round-robin matches for a pool (each team plays every other team once).
    
    Args:
        pool: Pool instance
    
    Returns:
        Number of matches created
    """
    teams = list(pool.teams.all())
    team_count = len(teams)
    
    if team_count < 2:
        raise ValueError(f"Pool {pool.name} needs at least 2 teams to schedule matches")
    
    # Delete existing matches for this pool
    Match.objects.filter(pool=pool).delete()
    
    matches_created = 0
    tournament = pool.tournament
    
    # Generate round-robin fixtures
    # Each team plays every other team once
    for i in range(team_count):
        for j in range(i + 1, team_count):
            # Calculate match date (spread matches over tournament duration)
            days_offset = matches_created * 2  # 2 days between matches
            match_date = tournament.start_date + timedelta(days=days_offset)
            
            Match.objects.create(
                tournament=tournament,
                pool=pool,
                team1=teams[i],
                team2=teams[j],
                match_date=match_date,
                venue=tournament.venue,
                round='Pool Stage',
                status='scheduled'
            )
            matches_created += 1
    
    return matches_created


def update_standings(match):
    """
    Update tournament standings based on a completed match.
    
    Args:
        match: Match instance with completed status and scores
    
    Football scoring:
    - Win: 3 points
    - Draw: 1 point
    - Loss: 0 points
    """
    if match.status != 'completed':
        return
    
    if match.team1_score is None or match.team2_score is None:
        return
    
    tournament = match.tournament
    
    # Get or create standings for both teams
    standing1, _ = Standing.objects.get_or_create(
        tournament=tournament,
        team=match.team1,
        defaults={
            'played': 0, 'wins': 0, 'draws': 0, 'losses': 0,
            'goals_for': 0, 'goals_against': 0, 'points': 0
        }
    )
    
    standing2, _ = Standing.objects.get_or_create(
        tournament=tournament,
        team=match.team2,
        defaults={
            'played': 0, 'wins': 0, 'draws': 0, 'losses': 0,
            'goals_for': 0, 'goals_against': 0, 'points': 0
        }
    )
    
    # Update match statistics
    standing1.played += 1
    standing1.goals_for += match.team1_score
    standing1.goals_against += match.team2_score
    
    standing2.played += 1
    standing2.goals_for += match.team2_score
    standing2.goals_against += match.team1_score
    
    # Update win/draw/loss and points
    if match.team1_score > match.team2_score:
        # Team 1 wins
        standing1.wins += 1
        standing1.points += 3
        standing2.losses += 1
    elif match.team2_score > match.team1_score:
        # Team 2 wins
        standing2.wins += 1
        standing2.points += 3
        standing1.losses += 1
    else:
        # Draw
        standing1.draws += 1
        standing1.points += 1
        standing2.draws += 1
        standing2.points += 1
    
    standing1.save()
    standing2.save()


def recalculate_all_standings(tournament):
    """
    Recalculate all standings for a tournament from scratch.
    Useful if standings get out of sync.
    
    Args:
        tournament: Tournament instance
    """
    # Reset all standings
    Standing.objects.filter(tournament=tournament).update(
        played=0, wins=0, draws=0, losses=0,
        goals_for=0, goals_against=0, points=0
    )
    
    # Recalculate from all completed matches
    completed_matches = Match.objects.filter(
        tournament=tournament,
        status='completed'
    ).exclude(team1_score__isnull=True).exclude(team2_score__isnull=True)
    
    for match in completed_matches:
        update_standings(match)
