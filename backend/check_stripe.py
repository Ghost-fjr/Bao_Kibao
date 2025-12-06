import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings

print("=" * 60)
print("STRIPE CONFIGURATION CHECK")
print("=" * 60)

# Check if Stripe keys are loaded
stripe_secret = getattr(settings, 'STRIPE_SECRET_KEY', None)
stripe_publishable = getattr(settings, 'STRIPE_PUBLISHABLE_KEY', None)

print(f"\n✓ Stripe Secret Key: {stripe_secret[:20]}... (length: {len(stripe_secret) if stripe_secret else 0})")
print(f"✓ Stripe Publishable Key: {stripe_publishable[:20]}... (length: {len(stripe_publishable) if stripe_publishable else 0})")

# Verify keys are not placeholders
if stripe_secret and 'your' not in stripe_secret.lower():
    print("\n✅ Stripe Secret Key is properly configured!")
else:
    print("\n❌ Stripe Secret Key is still a placeholder!")

if stripe_publishable and 'your' not in stripe_publishable.lower():
    print("✅ Stripe Publishable Key is properly configured!")
else:
    print("❌ Stripe Publishable Key is still a placeholder!")

# Try to initialize Stripe
try:
    import stripe
    stripe.api_key = stripe_secret
    
    # Test API call
    print("\n" + "=" * 60)
    print("TESTING STRIPE API CONNECTION")
    print("=" * 60)
    
    # Try to retrieve account info (this will validate the key)
    account = stripe.Account.retrieve()
    print(f"\n✅ Successfully connected to Stripe!")
    print(f"   Account ID: {account.id}")
    print(f"   Test Mode: {not account.livemode}")
    
except ImportError:
    print("\n⚠️  Stripe library not installed. Run: pip install stripe")
except stripe.error.AuthenticationError as e:
    print(f"\n❌ Stripe Authentication Failed: {e}")
except Exception as e:
    print(f"\n❌ Error: {e}")

print("\n" + "=" * 60)
