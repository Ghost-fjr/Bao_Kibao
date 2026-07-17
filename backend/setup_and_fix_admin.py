"""
One-shot setup script: run migrations and create/fix the admin user.
Run with: python setup_and_fix_admin.py
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Bootstrap Django
django.setup()

from django.core.management import call_command
from apps.users.models import User

# 1. Run all migrations
print("=" * 50)
print("Running migrations...")
print("=" * 50)
call_command('migrate', verbosity=1)

# 2. Fix / create admin user
print()
print("=" * 50)
print("Setting up admin user...")
print("=" * 50)

email = 'faizashrafmuhamed99@gmail.com'
password = 'Ghost-2024'

user, created = User.objects.get_or_create(
    email=email,
    defaults={
        'username': 'admin',
        'first_name': 'Admin',
        'last_name': 'User',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True,
        'is_active': True,
        'is_verified': True,
    }
)

# Always apply these fixes whether created or existing
user.role = 'admin'
user.is_staff = True
user.is_superuser = True
user.is_active = True
user.is_verified = True
user.set_password(password)
user.save()

action = "Created" if created else "Updated"
print(f"  {action}: {user.email}")
print(f"  role        : {user.role}")
print(f"  is_verified : {user.is_verified}")
print(f"  is_active   : {user.is_active}")
print(f"  is_staff    : {user.is_staff}")
print(f"  is_superuser: {user.is_superuser}")
print()
print("=" * 50)
print("DONE! Admin credentials:")
print(f"  Email   : {email}")
print(f"  Password: {password}")
print("=" * 50)
