import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User

u = User.objects.get(email='admin@example.com')
u.is_verified = True
u.role = 'admin'
u.is_staff = True
u.is_superuser = True
u.set_password('Admin@BaoKibao2024')
u.save()

print("Done!")
print(f"  email       : {u.email}")
print(f"  role        : {u.role}")
print(f"  is_verified : {u.is_verified}")
print(f"  is_active   : {u.is_active}")
print(f"  is_staff    : {u.is_staff}")
print(f"  is_superuser: {u.is_superuser}")
print(f"  new password: Admin@BaoKibao2024")
