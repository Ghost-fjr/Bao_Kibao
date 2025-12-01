"""
Script to create a default organization and assign the admin user to it.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.organizations.models import Organization, OrganizationMember
from apps.users.models import User

# Create or get default organization
org, created = Organization.objects.get_or_create(
    slug='bao-kibao',
    defaults={
        'name': 'Bao Kibao',
        'mission': 'Empowering youth through sports',
        'vision': 'Building stronger communities through athletics',
        'contact_email': 'info@baokibao.org',
        'contact_phone': '+254700000000',
    }
)

if created:
    print(f"Created organization: {org.name}")
else:
    print(f"Organization already exists: {org.name}")

# Get admin user
try:
    admin_user = User.objects.get(email='admin@example.com')
    
    # Create or get membership
    membership, created = OrganizationMember.objects.get_or_create(
        organization=org,
        user=admin_user,
        defaults={'role': 'admin', 'is_active': True}
    )
    
    if created:
        print(f"Added {admin_user.email} to {org.name} as admin")
    else:
        print(f"{admin_user.email} is already a member of {org.name}")
        
except User.DoesNotExist:
    print("Admin user not found. Please create an admin user first.")
