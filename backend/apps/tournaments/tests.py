"""
Tests for tournament utilities: pool generation, match scheduling, and standings.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Tournament, Team, Match, Standing, Pool
from .utils import generate_pools, schedule_pool_matches, update_standings, recalculate_all_standings

User = get_user_model()


class PoolGenerationTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin', email='admin@example.com', password='pass', role='admin'
        )
        self.tournament = Tournament.objects.create(
            name='Test Cup',
            start_date=timezone.now().date() + timezone.timedelta(days=7),
            end_date=timezone.now().date() + timezone.timedelta(days=14),
            registration_deadline=timezone.now().date() + timezone.timedelta(days=5),
            venue='Test Venue',
            status='upcoming'
        )

    def _add_teams(self, count, status='approved'):
        teams = []
        for i in range(count):
            team = Team.objects.create(
                tournament=self.tournament,
                name=f'Team {i + 1}',
                status=status
            )
            teams.append(team)
        return teams

    def test_generate_pools_requires_at_least_2_teams(self):
        """Generating pools with < 2 teams should raise ValueError"""
        self._add_teams(1)
        with self.assertRaises(ValueError):
            generate_pools(self.tournament)

    def test_generate_pools_creates_correct_number(self):
        """8 teams with 4 per pool should create 2 pools"""
        self._add_teams(8)
        num_pools = generate_pools(self.tournament, teams_per_pool=4)
        self.assertEqual(num_pools, 2)
        self.assertEqual(self.tournament.pools.count(), 2)

    def test_generate_pools_creates_standings(self):
        """Pool generation should also create Standing records for each team"""
        teams = self._add_teams(4)
        generate_pools(self.tournament)
        standings = Standing.objects.filter(tournament=self.tournament)
        self.assertEqual(standings.count(), 4)

    def test_generate_pools_is_idempotent(self):
        """Calling generate_pools twice should not double the pools"""
        self._add_teams(4)
        generate_pools(self.tournament)
        generate_pools(self.tournament)  # Call again
        self.assertEqual(self.tournament.pools.count(), 1)

    def test_ignores_unapproved_teams(self):
        """Only approved teams should be included in pools"""
        self._add_teams(3, status='approved')
        self._add_teams(2, status='pending')
        num_pools = generate_pools(self.tournament)
        total_teams = sum(pool.teams.count() for pool in self.tournament.pools.all())
        self.assertEqual(total_teams, 3)


class MatchSchedulingTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin2', email='admin2@example.com', password='pass', role='admin'
        )
        self.tournament = Tournament.objects.create(
            name='Match Cup',
            start_date=timezone.now().date() + timezone.timedelta(days=7),
            end_date=timezone.now().date() + timezone.timedelta(days=30),
            registration_deadline=timezone.now().date() + timezone.timedelta(days=5),
            venue='Test Venue',
            status='upcoming'
        )
        self.pool = Pool.objects.create(tournament=self.tournament, name='Group A')
        for i in range(4):
            team = Team.objects.create(
                tournament=self.tournament, name=f'Team {i + 1}', status='approved'
            )
            self.pool.teams.add(team)

    def test_schedule_creates_correct_match_count(self):
        """4 teams in round-robin should create 4*(4-1)/2 = 6 matches"""
        count = schedule_pool_matches(self.pool)
        self.assertEqual(count, 6)
        self.assertEqual(Match.objects.filter(pool=self.pool).count(), 6)

    def test_schedule_requires_at_least_2_teams(self):
        """Pool with < 2 teams should raise ValueError"""
        empty_pool = Pool.objects.create(tournament=self.tournament, name='Group B')
        with self.assertRaises(ValueError):
            schedule_pool_matches(empty_pool)

    def test_schedule_is_idempotent(self):
        """Calling schedule twice should not duplicate matches"""
        schedule_pool_matches(self.pool)
        schedule_pool_matches(self.pool)
        self.assertEqual(Match.objects.filter(pool=self.pool).count(), 6)


class StandingsTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin3', email='admin3@example.com', password='pass', role='admin'
        )
        self.tournament = Tournament.objects.create(
            name='Standings Cup',
            start_date=timezone.now().date() + timezone.timedelta(days=7),
            end_date=timezone.now().date() + timezone.timedelta(days=30),
            registration_deadline=timezone.now().date() + timezone.timedelta(days=5),
            venue='Test Venue',
            status='active'
        )
        self.team1 = Team.objects.create(tournament=self.tournament, name='Team Alpha', status='approved')
        self.team2 = Team.objects.create(tournament=self.tournament, name='Team Beta', status='approved')
        self.match = Match.objects.create(
            tournament=self.tournament,
            team1=self.team1,
            team2=self.team2,
            status='completed',
            team1_score=2,
            team2_score=1,
        )

    def test_update_standings_win(self):
        """Team1 wins 2-1: should get 3 points; Team2 gets 0"""
        update_standings(self.match)
        s1 = Standing.objects.get(tournament=self.tournament, team=self.team1)
        s2 = Standing.objects.get(tournament=self.tournament, team=self.team2)
        self.assertEqual(s1.points, 3)
        self.assertEqual(s1.wins, 1)
        self.assertEqual(s2.points, 0)
        self.assertEqual(s2.losses, 1)

    def test_update_standings_draw(self):
        """Draw 1-1: both teams get 1 point"""
        self.match.team1_score = 1
        self.match.team2_score = 1
        self.match.save()
        update_standings(self.match)
        s1 = Standing.objects.get(tournament=self.tournament, team=self.team1)
        s2 = Standing.objects.get(tournament=self.tournament, team=self.team2)
        self.assertEqual(s1.points, 1)
        self.assertEqual(s2.points, 1)

    def test_recalculate_is_idempotent(self):
        """Calling update_standings multiple times should not accumulate"""
        update_standings(self.match)
        update_standings(self.match)  # Run again (simulates score correction)
        update_standings(self.match)  # Run a third time
        s1 = Standing.objects.get(tournament=self.tournament, team=self.team1)
        # Points should be 3, not 9 (would be 9 if accumulating)
        self.assertEqual(s1.points, 3)
        self.assertEqual(s1.played, 1)

    def test_recalculate_all_standings_resets_then_recalculates(self):
        """recalculate_all_standings should be idempotent"""
        recalculate_all_standings(self.tournament)
        recalculate_all_standings(self.tournament)
        s1 = Standing.objects.get(tournament=self.tournament, team=self.team1)
        self.assertEqual(s1.points, 3)
        self.assertEqual(s1.played, 1)

    def test_update_standings_ignored_for_non_completed_match(self):
        """update_standings should do nothing for non-completed matches"""
        self.match.status = 'scheduled'
        self.match.save()
        update_standings(self.match)
        self.assertFalse(Standing.objects.filter(tournament=self.tournament).exists())
