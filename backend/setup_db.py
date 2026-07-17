import sqlite3
from datetime import datetime

# Connect to database
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

try:
    # Create organization
    cursor.execute("""
        INSERT OR IGNORE INTO organizations_organization 
        (name, slug, mission, vision, contact_email, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        'Bao Kibao',
        'bao-kibao',
        'Empowering youth through sports',
        'Building stronger communities',
        'info@baokibao.org',
        1,
        datetime.now().isoformat(),
        datetime.now().isoformat()
    ))
    
    # Get organization ID
    cursor.execute('SELECT id FROM organizations_organization WHERE slug = ?', ('bao-kibao',))
    org_result = cursor.fetchone()
    
    if not org_result:
        print("ERROR: Failed to create organization")
        exit(1)
    
    org_id = org_result[0]
    print(f"✓ Organization created/found: ID {org_id}")
    
    # Get admin user ID
    cursor.execute('SELECT id FROM users_user WHERE email = ?', ('admin@example.com',))
    user_result = cursor.fetchone()
    
    if not user_result:
        print("ERROR: Admin user not found")
        exit(1)
    
    user_id = user_result[0]
    print(f"✓ Admin user found: ID {user_id}")
    
    # Create membership
    cursor.execute("""
        INSERT OR IGNORE INTO organizations_organizationmember 
        (organization_id, user_id, role, is_active, joined_at)
        VALUES (?, ?, ?, ?, ?)
    """, (org_id, user_id, 'admin', 1, datetime.now().isoformat()))
    
    # Commit changes
    conn.commit()
    print(f"✓ Admin user assigned to organization")
    print("\n✅ Organization setup complete!")
    print("You can now create categories, products, tournaments, and CMS content.")
    
except Exception as e:
    print(f"ERROR: {e}")
    conn.rollback()
finally:
    conn.close()
