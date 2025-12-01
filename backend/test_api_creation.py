from rest_framework.test import APIClient
from apps.users.models import User
from apps.organizations.models import Organization, OrganizationMember
from datetime import date

def test_create_tournament_api():
    # Setup user and org
    user = User.objects.get(email='admin@example.com')
    org = Organization.objects.first()
    
    # Ensure membership
    if not OrganizationMember.objects.filter(user=user, organization=org).exists():
        OrganizationMember.objects.create(user=user, organization=org, role='admin')

    client = APIClient()
    client.force_authenticate(user=user)

    data = {
        'name': 'API Test Tournament',
        'description': 'Created via APIClient',
        'category': 'football',
        'venue': 'API Stadium',
        'start_date': '2025-08-01',
        'end_date': '2025-08-15',
        'registration_deadline': '2025-07-15',
        'registration_fee': '3000',
        'max_teams': 8,
        'status': 'open'
    }

    print(f"Attempting to create tournament with data: {data}")
    response = client.post('/api/tournaments/tournaments/', data)
    
    print(f"Response Status Code: {response.status_code}")
    print(f"Response Data: {response.data}")

if __name__ == '__main__':
    test_create_tournament_api()
