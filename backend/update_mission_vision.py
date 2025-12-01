from apps.cms.models import Page
from apps.organizations.models import Organization

def update_mission_vision():
    try:
        # Get the Bao Kibao organization
        org = Organization.objects.get(slug='bao-kibao')
        
        # Update organization mission and vision from the materials
        org.mission = '''To inspire change through football tournaments, educational drives, and awareness campaigns. We promote conscious living by boycotting brands that fund oppression and choosing products that support humanity.'''
        
        org.vision = '''To build a united community where every match, jersey, and voice becomes a call for freedom and justice in Gaza — now and always.'''
        
        org.description = '''Bao Ki Bao Initiative is a youth-led movement using football to unite communities and stand in solidarity with Palestine. We host tournaments, raise awareness about boycotting oppressive brands, and fundraise directly for Gaza. Every match, merchandise, and voice counts.'''
        
        org.save()
        
        print(f"✅ Successfully updated organization mission and vision")
        print(f"\nMission: {org.mission}")
        print(f"\nVision: {org.vision}")
        
        # Create or update About Us page
        about_page, created = Page.objects.get_or_create(
            organization=org,
            slug='about-us',
            defaults={
                'title': 'About Bao Kibao',
                'is_published': True
            }
        )
        
        about_content = '''
# Who We Are

**Background**

Bao Ki Bao Initiative is a youth-led movement using football to unite communities and stand in solidarity with Palestine.

We host tournaments, raise awareness about boycotting oppressive brands, and fundraise directly for Gaza.

Every match, merchandise, and voice counts.

## Our Vision

To build a united community where every match, jersey, and voice becomes a call for freedom and justice in Gaza — now and always.

## Our Mission

To inspire change through football tournaments, educational drives, and awareness campaigns. We promote conscious living by boycotting brands that fund oppression and choosing products that support humanity.

## What We Do

Bao Ki Bao uses the power of football to unite communities, raise awareness, and support Gaza through fundraising and advocacy.

### ⚽ Football for a Cause
We organize 7-a-side tournaments that bring people together to play for a purpose.

### 🏴 Merch for Palestine
Sale of Palestinian jerseys and merchandise — 100% of profits go to Gaza relief efforts.

### 🚫 Boycott Awareness
Educating our community on boycotting products that support oppression and occupation.

### ❤️ Community Engagement
We collaborate with local youth and organizations to promote solidarity and empowerment.

---

**Play. Support. Stand for Palestine.**
'''
        
        about_page.content = about_content
        about_page.save()
        
        print(f"\n✅ Successfully updated About Us page")
        
    except Organization.DoesNotExist:
        print("❌ Organization 'bao-kibao' not found")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    update_mission_vision()
