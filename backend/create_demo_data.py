import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.tournaments.models import Tournament
from apps.store.models import Product, Category
from apps.organizations.models import Organization
from apps.cms.models import Page, Achievement
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta

User = get_user_model()

# Get or create organization
org, created = Organization.objects.get_or_create(
    slug='bao-kibao',
    defaults={
        'name': 'Bao Kibao',
        'mission': 'Empowering communities through sports and fundraising',
        'vision': 'Building stronger communities one tournament at a time',
        'contact_email': 'info@baokibao.org'
    }
)

print(f"Organization: {org.name} ({'created' if created else 'exists'})")

# Create tournaments
tournaments_data = [
    {
        'name': 'Summer Football Championship 2025',
        'description': 'Annual summer tournament bringing together local teams for an exciting competition',
        'category': 'football',
        'venue': 'Sir Ali Grounds',
        'start_date': datetime.now() + timedelta(days=60),
        'end_date': datetime.now() + timedelta(days=75),
        'registration_deadline': datetime.now() + timedelta(days=30),
        'registration_fee': 50.00,
        'max_teams': 16,
        'status': 'open'
    },
    {
        'name': 'Youth Basketball League',
        'description': 'Competitive basketball league for youth teams ages 12-18',
        'category': 'basketball',
        'venue': 'Community Sports Center',
        'start_date': datetime.now() + timedelta(days=45),
        'end_date': datetime.now() + timedelta(days=90),
        'registration_deadline': datetime.now() + timedelta(days=20),
        'registration_fee': 35.00,
        'max_teams': 12,
        'status': 'open'
    },
    {
        'name': 'Charity Volleyball Tournament',
        'description': 'Fun volleyball tournament with all proceeds going to local charities',
        'category': 'volleyball',
        'venue': 'Beach Sports Arena',
        'start_date': datetime.now() + timedelta(days=30),
        'end_date': datetime.now() + timedelta(days=32),
        'registration_deadline': datetime.now() + timedelta(days=15),
        'registration_fee': 25.00,
        'max_teams': 8,
        'status': 'open'
    }
]

for tournament_data in tournaments_data:
    tournament, created = Tournament.objects.get_or_create(
        organization=org,
        name=tournament_data['name'],
        defaults=tournament_data
    )
    print(f"Tournament: {tournament.name} ({'created' if created else 'exists'})")

# Create product categories
categories_data = [
    {'name': 'Apparel', 'slug': 'apparel', 'description': 'Team jerseys, t-shirts, and sportswear'},
    {'name': 'Equipment', 'slug': 'equipment', 'description': 'Sports equipment and gear'},
    {'name': 'Accessories', 'slug': 'accessories', 'description': 'Sports accessories and merchandise'}
]

for cat_data in categories_data:
    category, created = Category.objects.get_or_create(
        organization=org,
        slug=cat_data['slug'],
        defaults={'name': cat_data['name'], 'description': cat_data.get('description', '')}
    )
    print(f"Category: {category.name} ({'created' if created else 'exists'})")

# Create products
apparel_cat = Category.objects.get(organization=org, slug='apparel')
equipment_cat = Category.objects.get(organization=org, slug='equipment')
accessories_cat = Category.objects.get(organization=org, slug='accessories')

products_data = [
    {
        'category': apparel_cat,
        'name': 'Team Jersey',
        'description': 'Official tournament jersey with team logo',
        'price': 25.00,
        'stock': 100,
        'sku': 'JERSEY-001',
        'is_active': True
    },
    {
        'category': apparel_cat,
        'name': 'Training T-Shirt',
        'description': 'Comfortable training t-shirt for practice sessions',
        'price': 15.00,
        'stock': 150,
        'sku': 'TSHIRT-001',
        'is_active': True
    },
    {
        'category': equipment_cat,
        'name': 'Official Match Ball',
        'description': 'High-quality match ball for tournaments',
        'price': 45.00,
        'stock': 50,
        'sku': 'BALL-001',
        'is_active': True
    },
    {
        'category': accessories_cat,
        'name': 'Team Cap',
        'description': 'Branded cap with team colors',
        'price': 12.00,
        'stock': 200,
        'sku': 'CAP-001',
        'is_active': True
    },
    {
        'category': accessories_cat,
        'name': 'Water Bottle',
        'description': 'Reusable sports water bottle',
        'price': 8.00,
        'stock': 300,
        'sku': 'BOTTLE-001',
        'is_active': True
    }
]

for product_data in products_data:
    product, created = Product.objects.get_or_create(
        organization=org,
        name=product_data['name'],
        defaults=product_data
    )
    print(f"Product: {product.name} ({'created' if created else 'exists'})")

# Create CMS pages
pages_data = [
    {
        'slug': 'about',
        'title': 'About Bao Kibao',
        'content': 'Bao Kibao is dedicated to empowering communities through sports and fundraising initiatives. We organize tournaments and events that bring people together while supporting important causes.',
        'is_published': True
    },
    {
        'slug': 'contact',
        'title': 'Contact Us',
        'content': 'Get in touch with us at info@baokibao.org or visit our office during business hours.',
        'is_published': True
    }
]

for page_data in pages_data:
    page, created = Page.objects.get_or_create(
        organization=org,
        slug=page_data['slug'],
        defaults=page_data
    )
    print(f"Page: {page.title} ({'created' if created else 'exists'})")

# Create achievements
achievements_data = [
    {
        'title': '500+ Participants',
        'description': 'Over 500 athletes have participated in our tournaments',
        'date': datetime.now() - timedelta(days=365),
        'order': 1
    },
    {
        'title': 'Ksh. 50,000 Raised',
        'description': 'Successfully raised over Ksh. 50,000 for local charities',
        'date': datetime.now() - timedelta(days=180),
        'order': 2
    },
    {
        'title': '25 Tournaments',
        'description': 'Organized 25 successful tournaments across multiple sports',
        'date': datetime.now() - timedelta(days=90),
        'order': 3
    }
]

for achievement_data in achievements_data:
    achievement, created = Achievement.objects.get_or_create(
        organization=org,
        title=achievement_data['title'],
        defaults=achievement_data
    )
    print(f"Achievement: {achievement.title} ({'created' if created else 'exists'})")

print("\n✅ Demo data created successfully!")
print(f"- {Tournament.objects.filter(organization=org).count()} tournaments")
print(f"- {Product.objects.filter(organization=org).count()} products")
print(f"- {Category.objects.filter(organization=org).count()} categories")
print(f"- {Page.objects.filter(organization=org).count()} pages")
print(f"- {Achievement.objects.filter(organization=org).count()} achievements")
