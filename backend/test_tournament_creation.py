from datetime import date
from apps.tournaments.models import Tournament
from apps.organizations.models import Organization, OrganizationMember
from apps.users.models import User

def create_test_tournament():
    try:
        # Get admin user
        admin = User.objects.get(email='admin@example.com')
        print(f"Found admin user: {admin.email}")

        # Get organization
        org = Organization.objects.first()
        if not org:
            print("No organization found. Creating one...")
            org = Organization.objects.create(name="Test Org", slug="test-org")
            OrganizationMember.objects.create(user=admin, organization=org, role='admin')
        print(f"Using organization: {org.name}")

        # Create tournament
        tournament = Tournament.objects.create(
            organization=org,
            name="Scripted Tournament",
            description="Created via python script",
            venue="Script Arena",
            start_date=date(2025, 6, 1),
            end_date=date(2025, 6, 30),
            registration_deadline=date(2025, 5, 15),
            registration_fee=1000,
            max_teams=16,
            status='open'
        )
        print(f"Successfully created tournament: {tournament.name} (ID: {tournament.id})")
        
    except Exception as e:
        print(f"Error creating tournament: {e}")

if __name__ == '__main__':
    create_test_tournament()
