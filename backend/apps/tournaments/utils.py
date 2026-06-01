"""
Utility functions for tournament management.
"""
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from .models import Pool, Match, Standing


@transaction.atomic
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
    approved_teams = tournament.teams.filter(status='approved').order_by('registered_at')
    team_count = approved_teams.count()

    if team_count < 2:
        raise ValueError(
            f"Need at least 2 approved teams to generate pools. Currently have {team_count}"
        )

    num_pools = max(1, (team_count + teams_per_pool - 1) // teams_per_pool)

    # Delete existing pools (cascades to matches via SET_NULL, not DELETE — safe)
    tournament.pools.all().delete()

    pool_names = list('ABCDEFGHIJKLMNOP')
    pools = []
    for i in range(num_pools):
        pool_name = f"Group {pool_names[i]}" if i < len(pool_names) else f"Group {i + 1}"
        pool = Pool.objects.create(tournament=tournament, name=pool_name)
        pools.append(pool)

    # Distribute teams evenly across pools (round-robin style for balance)
    for idx, team in enumerate(approved_teams):
        pools[idx % num_pools].teams.add(team)

    # Create standings for each approved team
    for team in approved_teams:
        Standing.objects.get_or_create(
            tournament=tournament,
            team=team,
            defaults={
                'played': 0, 'wins': 0, 'draws': 0, 'losses': 0,
                'goals_for': 0, 'goals_against': 0, 'points': 0
            }
        )

    return num_pools


@transaction.atomic
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

    # Delete existing matches for this pool only
    Match.objects.filter(pool=pool).delete()

    matches_created = 0
    tournament = pool.tournament

    for i in range(team_count):
        for j in range(i + 1, team_count):
            days_offset = matches_created * 2
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
    Recalculate standings for the entire tournament after a match result changes.

    Using full recalculation (rather than incremental updates) prevents standings
    from accumulating when a match result is corrected multiple times.

    Args:
        match: Match instance with completed status and scores set
    """
    if match.status != 'completed':
        return
    if match.team1_score is None or match.team2_score is None:
        return
    # Recalculate all standings from scratch to avoid accumulation bugs
    recalculate_all_standings(match.tournament)


def recalculate_all_standings(tournament):
    """
    Recalculate all standings for a tournament from scratch.
    Resets every standing to zero then replays all completed matches.
    Idempotent — safe to call multiple times.

    Args:
        tournament: Tournament instance
    """
    # Reset all standings for this tournament
    Standing.objects.filter(tournament=tournament).update(
        played=0, wins=0, draws=0, losses=0,
        goals_for=0, goals_against=0, points=0
    )

    # Replay every completed match
    completed_matches = Match.objects.filter(
        tournament=tournament,
        status='completed'
    ).exclude(team1_score__isnull=True).exclude(team2_score__isnull=True)

    for match in completed_matches:
        _apply_match_to_standings(match)


def _apply_match_to_standings(match):
    """
    Apply a single completed match result to the standings.
    Internal helper — call recalculate_all_standings or update_standings instead.
    """
    tournament = match.tournament
    category = match.category  # May be None for tournaments without categories

    standing1, _ = Standing.objects.get_or_create(
        tournament=tournament,
        team=match.team1,
        category=category,
        defaults={
            'played': 0, 'wins': 0, 'draws': 0, 'losses': 0,
            'goals_for': 0, 'goals_against': 0, 'points': 0
        }
    )

    standing2, _ = Standing.objects.get_or_create(
        tournament=tournament,
        team=match.team2,
        category=category,
        defaults={
            'played': 0, 'wins': 0, 'draws': 0, 'losses': 0,
            'goals_for': 0, 'goals_against': 0, 'points': 0
        }
    )

    standing1.played += 1
    standing1.goals_for += match.team1_score
    standing1.goals_against += match.team2_score

    standing2.played += 1
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
        standing1.points += 1
        standing2.draws += 1
        standing2.points += 1

    standing1.save()
    standing2.save()
