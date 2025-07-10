-- View: saas_user_access_matrix
-- This view joins users with their roles and lists all features they can access based on the role-feature matrix.

CREATE OR REPLACE VIEW saas_user_access_matrix AS
SELECT
  p.id AS user_id,
  p.email,
  p.full_name,
  p.role,
  rf.feature_name,
  rf.access_allowed
FROM profiles p
JOIN (
  VALUES
    ('saas-admin', 'User authentication & profile management', true),
    ('saas-admin', 'Team management', true),
    ('saas-admin', 'Company management', true),
    ('saas-admin', 'Contact management', true),
    ('saas-admin', 'Lead management', true),
    ('saas-admin', 'Opportunity tracking', true),
    ('saas-admin', 'Project management', true),
    ('saas-admin', 'Legal case management', true),
    ('saas-admin', 'Activities', true),
    ('saas-admin', 'Task management', true),
    ('saas-admin', 'Product catalog', true),
    ('saas-admin', 'Invoice management', true),
    ('saas-admin', 'Estimate management', true),
    ('saas-admin', 'Payment tracking', true),
    ('saas-admin', 'Discount codes', true),
    ('saas-admin', 'Media file storage', true),
    ('saas-admin', 'Notes', true),
    ('saas-admin', 'Time entries', true),
    ('saas-admin', 'Tagging system', true),
    ('saas-admin', 'AI insights', true),
    ('saas-admin', 'Chat & communication', true),
    ('saas-admin', 'AI Bots Phone & Website', true),
    ('saas-admin', 'Email templates', true),
    ('saas-admin', 'Subscriptions & billing', true),
    ('saas-admin', 'Customer portal', true),
    ('saas-admin', 'Dashboard & reporting', true),
    ('saas-admin', 'Role-based access control', true),
    ('saas-admin', 'Webhook/event processing', true),
    ('saas-admin', 'Views for pipeline, tasks, invoices, etc.', true)
    -- Add all other roles and features as needed
) AS rf(role, feature_name, access_allowed)
ON p.role = rf.role;
