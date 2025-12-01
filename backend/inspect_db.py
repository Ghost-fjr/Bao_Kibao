from apps.tournaments.models import Tournament
from apps.organizations.models import Organization, OrganizationMember
from apps.users.models import User

print("--- Organizations ---")
for org in Organization.objects.all():
    print(f"ID: {org.id}, Name: {org.name}")

print("\n--- Users ---")
for user in User.objects.all():
    print(f"ID: {user.id}, Email: {user.email}")

print("\n--- Memberships ---")
for member in OrganizationMember.objects.all():
    print(f"User: {member.user.email}, Org: {member.organization.name}, Role: {member.role}")

print("\n--- Tournaments ---")
for t in Tournament.objects.all():
    print(f"ID: {t.id}, Name: {t.name}, Org: {t.organization.name}, Status: {t.status}")
