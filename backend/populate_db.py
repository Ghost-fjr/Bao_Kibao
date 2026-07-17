import os
import django
import random
from datetime import timedelta
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from faker import Faker
from django.contrib.auth import get_user_model
from django.db import transaction

from apps.store.models import Category, Product, ProductSize, Order, OrderItem
from apps.tournaments.models import Tournament, TournamentCategory, Team, Player, Match
from apps.cms.models import Achievement, GalleryCollection, MediaGallery

User = get_user_model()
fake = Faker()

@transaction.atomic
def populate_users(n=50):
    print(f"Populating {n} users...")
    roles = ['donor', 'captain']
    for _ in range(n):
        email = fake.unique.email()
        first_name = fake.first_name()
        last_name = fake.last_name()
        User.objects.create_user(
            username=email,
            email=email,
            password='password123',
            first_name=first_name,
            last_name=last_name,
            role=random.choice(roles),
            phone=fake.phone_number()[:20],
            is_verified=True,
            email_verified_at=timezone.now()
        )

@transaction.atomic
def populate_store():
    print("Populating store categories and products...")
    cat_names = ["Jerseys", "Hoodies", "Accessories", "Gaming Gear"]
    categories = []
    for name in cat_names:
        cat, created = Category.objects.get_or_create(
            name=name,
            defaults={'description': fake.text(max_nb_chars=200)}
        )
        categories.append(cat)

    print("Populating products...")
    adjectives = ["Pro", "Elite", "Classic", "Premium", "Performance"]
    items = ["Jersey", "Hoodie", "Headset", "Mousepad", "Wristband"]
    
    products = []
    for _ in range(30):
        cat = random.choice(categories)
        name = f"{random.choice(adjectives)} {fake.word().capitalize()} {random.choice(items)}"
        product = Product.objects.create(
            category=cat,
            name=name,
            description=fake.text(max_nb_chars=500),
            price=random.uniform(15.0, 150.0),
            stock=random.randint(10, 100),
            is_active=True,
            is_featured=random.choice([True, False, False])
        )
        products.append(product)

@transaction.atomic
def populate_tournaments():
    print("Populating tournaments and teams...")
    statuses = ['open', 'ongoing', 'completed']
    tournaments = []
    
    for i in range(5):
        start_date = timezone.now() + timedelta(days=random.randint(-30, 30))
        tournament = Tournament.objects.create(
            name=f"Bao Kibao Championship {fake.year()} - Part {i+1}",
            description=fake.text(max_nb_chars=1000),
            start_date=start_date,
            end_date=start_date + timedelta(days=14),
            registration_deadline=start_date - timedelta(days=7),
            registration_fee=random.uniform(50.0, 200.0),
            max_teams=random.choice([8, 16, 32]),
            venue=fake.address(),
            prize_pool=random.uniform(1000.0, 5000.0),
            status=random.choice(statuses)
        )
        tournaments.append(tournament)
        
        # Categories
        for cat_name in ['Open', 'Under 18']:
            t_cat = TournamentCategory.objects.create(
                tournament=tournament,
                name=cat_name,
                short_name=cat_name[:3]
            )
            
            # Teams
            for _ in range(random.randint(4, 12)):
                team = Team.objects.create(
                    tournament=tournament,
                    category=t_cat,
                    name=fake.company(),
                    status='approved',
                    payment_status='paid'
                )
                
                # Players
                jersey_numbers = random.sample(range(1, 100), 7)
                for i in range(7):
                    Player.objects.create(
                        team=team,
                        name=fake.name(),
                        email=fake.email(),
                        phone=fake.phone_number()[:20],
                        jersey_number=jersey_numbers[i]
                    )

@transaction.atomic
def populate_orders():
    print("Populating orders...")
    users = list(User.objects.filter(role='donor'))
    products = list(Product.objects.all())
    
    if not users or not products:
        print("Need users and products for orders")
        return
        
    for _ in range(50):
        user = random.choice(users)
        status = random.choice(['pending', 'processing', 'shipped', 'delivered'])
        payment_status = random.choice(['paid', 'paid', 'paid', 'pending'])
        
        # Select 1 to 3 random products
        order_products = random.sample(products, random.randint(1, 3))
        
        total = sum([p.price * random.randint(1, 2) for p in order_products])
        
        order = Order.objects.create(
            user=user,
            total_amount=total,
            status=status,
            payment_status=payment_status,
            shipping_name=user.full_name,
            shipping_email=user.email,
            shipping_phone=(user.phone or fake.phone_number())[:20],
            shipping_address=fake.street_address(),
            shipping_city=fake.city(),
            shipping_country=fake.country()
        )
        
        for p in order_products:
            qty = random.randint(1, 2)
            OrderItem.objects.create(
                order=order,
                product=p,
                product_name=p.name,
                quantity=qty,
                price=p.price
            )

@transaction.atomic
def populate_cms():
    print("Populating achievements and gallery...")
    # Achievements
    achievements = [
        ("Regional Champions", "Won the regional esports championship"),
        ("100K Registered Users", "Reached a milestone of 100,000 active gamers"),
        ("Partnership with Logitech", "Official hardware partnership"),
        ("1st Annual Bao Kibao Cup", "Successfully hosted our first major tournament")
    ]
    for i, (title, desc) in enumerate(achievements):
        Achievement.objects.create(
            title=title,
            description=desc,
            date=timezone.now().date() - timedelta(days=random.randint(30, 365*3)),
            order=i,
            is_featured=random.choice([True, False])
        )
        
    # Gallery
    events = ["Summer Showdown 2024", "Winter Qualifiers", "Community Meetup", "Finals LAN Party"]
    for i, event in enumerate(events):
        collection = GalleryCollection.objects.create(
            title=event,
            description=fake.text(max_nb_chars=200),
            event_date=timezone.now().date() - timedelta(days=random.randint(10, 300)),
            order=i,
            is_published=True
        )
        
        # Add 5-10 media items to each collection
        for j in range(random.randint(5, 10)):
            is_video = random.choice([True, False, False, False])
            MediaGallery.objects.create(
                collection=collection,
                title=f"{event} Highlights {j+1}",
                media_type='video' if is_video else 'image',
                video_url="https://youtube.com/watch?v=dQw4w9WgXcQ" if is_video else "",
                caption=fake.sentence(),
                order=j,
                is_featured=random.choice([True, False, False])
            )

def main():
    print("Starting database population...")
    try:
        # populate_users(50)
        # populate_store()
        # populate_tournaments()
        # populate_orders()
        populate_cms()
        print("\nSuccessfully populated database!")
    except Exception as e:
        print(f"\nError populating database: {e}")

if __name__ == '__main__':
    main()
