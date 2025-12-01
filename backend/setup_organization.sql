-- Run this SQL to setup organization and admin membership
-- Connect to your database and execute these commands

-- Create organization
INSERT INTO organizations_organization (name, slug, mission, vision, contact_email, is_active, created_at, updated_at)
VALUES ('Bao Kibao', 'bao-kibao', 'Empowering youth through sports', 'Building stronger communities', 'info@baokibao.org', 1, datetime('now'), datetime('now'))
ON CONFLICT(slug) DO NOTHING;

-- Assign admin user to organization
INSERT INTO organizations_organizationmember (organization_id, user_id, role, is_active, joined_at)
SELECT 
    (SELECT id FROM organizations_organization WHERE slug = 'bao-kibao'),
    (SELECT id FROM users_user WHERE email = 'admin@example.com'),
    'admin',
    1,
    datetime('now')
WHERE NOT EXISTS (
    SELECT 1 FROM organizations_organizationmember 
    WHERE user_id = (SELECT id FROM users_user WHERE email = 'admin@example.com')
);
