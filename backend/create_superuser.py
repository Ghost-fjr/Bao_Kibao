import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
if not User.objects.filter(email='admin@example.com').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("Superuser created successfully")
else:
    user = User.objects.get(email='admin@example.com')
    user.set_password('admin123')
    user.save()
    print("Superuser already exists, password updated to admin123")
