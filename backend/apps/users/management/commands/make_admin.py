"""
Django management command to make a user an admin
Usage: python manage.py make_admin <email>
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Make a user an admin by setting is_staff=True and role=admin'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email of the user to make admin')

    def handle(self, *args, **options):
        email = options['email']
        
        try:
            user = User.objects.get(email=email)
            user.is_staff = True
            user.role = 'admin'
            user.is_superuser = True  # Also make them a superuser for Django admin access
            user.save()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully made {email} an admin!\n'
                    f'  - is_staff: {user.is_staff}\n'
                    f'  - role: {user.role}\n'
                    f'  - is_superuser: {user.is_superuser}'
                )
            )
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User with email {email} does not exist')
            )
