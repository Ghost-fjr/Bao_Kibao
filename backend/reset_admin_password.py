import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
email = 'admin@example.com'
password = 'admin123'

try:
    user = User.objects.get(email=email)
    print(f"Found user: {user.username} / {user.email}")
    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.role = 'admin'
    user.save()
    print(f"Password updated for {email}")
except User.DoesNotExist:
    print(f"User {email} not found, creating...")
    User.objects.create_superuser(username='admin', email=email, password=password, role='admin')
    print(f"Superuser created: {email}")

# Verify
u = User.objects.get(email=email)
print(f"Verification: Check password: {u.check_password(password)}")
