from django.core.management.base import BaseCommand
from apps.organizations.models import Organization, OrganizationMember
from apps.users.models import User


class Command(BaseCommand):
    help = 'Setup default organization and assign admin user'

    def handle(self, *args, **options):
        # Create default organization
        org, created = Organization.objects.get_or_create(
            slug='bao-kibao',
            defaults={
                'name': 'Bao Kibao',
                'mission': 'Empowering youth through sports',
                'vision': 'Building stronger communities',
                'contact_email': 'info@baokibao.org',
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created organization: {org.name}'))
        else:
            self.stdout.write(self.style.WARNING(f'Organization already exists: {org.name}'))

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
                self.stdout.write(self.style.SUCCESS(f'Added {admin_user.email} to {org.name} as admin'))
            else:
                self.stdout.write(self.style.WARNING(f'{admin_user.email} is already a member of {org.name}'))
                
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('Admin user not found. Please create an admin user first.'))
