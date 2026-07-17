import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.payments.daraja import daraja_api

print("\n" + "="*60)
print("🔍 Testing Daraja API Connection...")
print("="*60)

# Test OAuth token
token = daraja_api.get_access_token()

if token:
    print("\n✅ SUCCESS! Daraja API connection established!")
    print(f"📱 Access Token: {token[:30]}...")
    print(f"🔑 Consumer Key: {daraja_api.consumer_key[:20]}...")
    print(f"🏢 Business Short Code: {daraja_api.business_short_code}")
    print(f"🌍 Environment: {daraja_api.environment}")
    print(f"🔗 Callback URL: {daraja_api.callback_url}")
    print("\n✨ Your M-Pesa integration is ready for testing!")
else:
    print("\n❌ FAILED to connect to Daraja API")
    print("Please check your credentials in the .env file")

print("="*60 + "\n")
