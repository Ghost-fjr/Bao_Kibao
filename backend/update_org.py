import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.cms.models import Page
from apps.organizations.models import Organization

# Get organization
org = Organization.objects.get(slug='bao-kibao')

# Update mission and vision
org.mission = 'To inspire change through football tournaments, educational drives, and awareness campaigns. We promote conscious living by boycotting brands that fund oppression and choosing products that support humanity.'
org.vision = 'To build a united community where every match, jersey, and voice becomes a call for freedom and justice in Gaza - now and always.'
org.save()

print('Organization updated successfully!')
print(f'Mission: {org.mission}')
print(f'Vision: {org.vision}')

# Create/update About page
about_page, created = Page.objects.get_or_create(
    organization=org,
    slug='about-us',
    defaults={'title': 'About Bao Kibao', 'is_published': True}
)

about_page.content = '''# Who We Are

Bao Ki Bao Initiative is a youth-led movement using football to unite communities and stand in solidarity with Palestine.

We host tournaments, raise awareness about boycotting oppressive brands, and fundraise directly for Gaza.

Every match, merchandise, and voice counts.

## Our Vision

To build a united community where every match, jersey, and voice becomes a call for freedom and justice in Gaza - now and always.

## Our Mission

To inspire change through football tournaments, educational drives, and awareness campaigns. We promote conscious living by boycotting brands that fund oppression and choosing products that support humanity.

## What We Do

### Football for a Cause
We organize 7-a-side tournaments that bring people together to play for a purpose.

### Merch for Palestine
Sale of Palestinian jerseys and merchandise - 100% of profits go to Gaza relief efforts.

### Boycott Awareness
Educating our community on boycotting products that support oppression and occupation.

### Community Engagement
We collaborate with local youth and organizations to promote solidarity and empowerment.
'''
about_page.save()

print(f'About page {"created" if created else "updated"} successfully!')
