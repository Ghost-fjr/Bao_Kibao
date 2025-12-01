from apps.organizations.models import Organization

def update_organization_info():
    try:
        # Get the Bao Kibao organization
        org = Organization.objects.get(slug='bao-kibao')
        
        # Update organization details
        org.name = 'Bao Kibao'
        org.mission = 'Using football to unite communities, raise awareness, and stand in solidarity with Palestine. We host tournaments, raise awareness about boycotting oppressive brands, and fundraise directly for Gaza.'
        org.vision = 'To build a united community where every match, jersey, and voice becomes a call for freedom and justice in Gaza — now and always.'
        org.description = 'Bao Ki Bao Initiative is a youth-led movement using football to unite communities and stand in solidarity with Palestine. We host tournaments, raise awareness about boycotting oppressive brands, and fundraise directly for Gaza. Every match, merchandise, and voice counts.'
        org.contact_email = 'baokibao.org@gmail.com'
        org.contact_phone = '0718-183-108'
        org.website = 'bao.kibao'
        org.social_media = {
            'instagram': '@bao_kibao',
            'phone_alt': '0704-667-311'
        }
        
        org.save()
        
        print(f"✅ Successfully updated organization: {org.name}")
        print(f"   Mission: {org.mission[:100]}...")
        print(f"   Contact: {org.contact_email}")
        
    except Organization.DoesNotExist:
        print("❌ Organization 'bao-kibao' not found")
    except Exception as e:
        print(f"❌ Error updating organization: {e}")

if __name__ == '__main__':
    update_organization_info()
