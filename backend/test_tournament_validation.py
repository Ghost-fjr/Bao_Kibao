from rest_framework.test import APIClient
from apps.users.models import User
from apps.organizations.models import Organization, OrganizationMember
import json

def test_create_tournament_validation():
    # Setup user and org
    user = User.objects.get(email='admin@example.com')
    org = Organization.objects.first()
    
    # Ensure membership
    membership, created = OrganizationMember.objects.get_or_create(
        user=user, 
        organization=org,
        defaults={'role': 'admin', 'is_active': True}
    )
    if not created and not membership.is_active:
        membership.is_active = True
        membership.save()

    client = APIClient()
    client.force_authenticate(user=user)

    # Simulate the exact data sent from frontend
    data = {
        'name': 'Test Tournament',
        'description': 'Test Description',
        'category': 'football',
        'venue': 'Test Venue',
        'start_date': '2025-08-01',
        'end_date': '2025-08-15',
        'registration_deadline': '2025-07-15',
        'registration_fee': '3000',
        'max_teams': '8',
        'status': 'open'
    }

    print(f"\n{'='*60}")
    print(f"Testing Tournament Creation")
    print(f"{'='*60}")
    print(f"User: {user.email}")
    print(f"Organization: {org.name}")
    print(f"Membership Active: {membership.is_active}")
    print(f"\nRequest Data:")
    print(json.dumps(data, indent=2))
    
    response = client.post('/api/tournaments/tournaments/', data, format='json')
    
    print(f"\n{'='*60}")
    print(f"Response Status: {response.status_code}")
    print(f"{'='*60}")
    if response.status_code == 400:
        print(f"Validation Errors:")
        print(json.dumps(response.data, indent=2))
    else:
        print(f"Success! Tournament created:")
        print(json.dumps(response.data, indent=2))

if __name__ == '__main__':
    test_create_tournament_validation()
