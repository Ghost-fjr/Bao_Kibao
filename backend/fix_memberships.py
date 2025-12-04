import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.organizations.models import Organization, OrganizationMembership
from django.contrib.auth import get_user_model

User = get_user_model()

# Get the organization
org = Organization.objects.first()
if not org:
    print("❌ No organization found!")
    exit(1)

print(f"Organization: {org.name}")

# Get all users
users = User.objects.all()
for user in users:
    print(f"\nUser: {user.email} - Role: {user.role}")
    # Create membership if doesn't exist
    membership, created = OrganizationMembership.objects.get_or_create(
        user=user,
        organization=org,
        defaults={'role': 'admin' if user.role == 'admin' else 'member', 'is_active': True}
    )
    if created:
        print(f"  ✅ Created membership for {user.email}")
    else:
        if not membership.is_active:
            membership.is_active = True
            membership.save()
            print(f"  ✅ Activated membership for {user.email}")
        else:
            print(f"  ℹ️  Membership already exists and is active")

print("\n✅ All users now have organization memberships!")
