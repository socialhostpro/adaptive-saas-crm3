-- ==================================================
-- SUPABASE CRM SEED DATA
-- ==================================================
-- Run this after the schema file (01_schema.sql)
-- This file contains sample data to get your CRM started

-- ==================================================
-- COMPANY SETTINGS (Required for invoice/estimate numbering)
-- ==================================================

INSERT INTO company_settings (
    company_name,
    company_logo,
    address,
    phone,
    email,
    website,
    currency,
    invoice_prefix,
    estimate_prefix
) VALUES (
    'Your Company Name',
    'https://via.placeholder.com/200x100?text=LOGO',
    '123 Business St, Suite 100, City, State 12345',
    '+1 (555) 123-4567',
    'info@yourcompany.com',
    'https://yourcompany.com',
    'USD',
    'INV-',
    'EST-'
);

-- ==================================================
-- SAMPLE TEAM MEMBERS
-- ==================================================

INSERT INTO team_members (id, name, email, role, department, avatar_url) VALUES
(uuid_generate_v4(), 'John Smith', 'john@company.com', 'Sales Manager', 'Sales', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'),
(uuid_generate_v4(), 'Sarah Johnson', 'sarah@company.com', 'Account Executive', 'Sales', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'),
(uuid_generate_v4(), 'Mike Wilson', 'mike@company.com', 'Project Manager', 'Operations', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike'),
(uuid_generate_v4(), 'Emily Davis', 'emily@company.com', 'Customer Success', 'Support', 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily'),
(uuid_generate_v4(), 'David Brown', 'david@company.com', 'Developer', 'Engineering', 'https://api.dicebear.com/7.x/avataaars/svg?seed=david');

-- ==================================================
-- SAMPLE COMPANIES
-- ==================================================

INSERT INTO companies (id, name, industry, website, phone, address, city, state, country) VALUES
(uuid_generate_v4(), 'TechCorp Solutions', 'Software', 'https://techcorp.com', '+1 (555) 101-2000', '456 Tech Avenue', 'San Francisco', 'CA', 'USA'),
(uuid_generate_v4(), 'Global Manufacturing Inc', 'Manufacturing', 'https://globalmanuf.com', '+1 (555) 201-3000', '789 Industrial Blvd', 'Detroit', 'MI', 'USA'),
(uuid_generate_v4(), 'Creative Designs LLC', 'Design & Marketing', 'https://creativedesigns.com', '+1 (555) 301-4000', '321 Art District', 'Austin', 'TX', 'USA'),
(uuid_generate_v4(), 'HealthFirst Medical', 'Healthcare', 'https://healthfirst.com', '+1 (555) 401-5000', '654 Medical Center Dr', 'Boston', 'MA', 'USA');

-- ==================================================
-- SAMPLE CONTACTS
-- ==================================================

INSERT INTO contacts (id, name, email, phone, title, company, address, avatar_url, info) VALUES
(uuid_generate_v4(), 'Alex Thompson', 'alex@techcorp.com', '+1 (555) 101-2001', 'CTO', 'TechCorp Solutions', '456 Tech Avenue, San Francisco, CA', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 'Key decision maker for technology purchases'),
(uuid_generate_v4(), 'Maria Rodriguez', 'maria@globalmanuf.com', '+1 (555) 201-3001', 'Operations Director', 'Global Manufacturing Inc', '789 Industrial Blvd, Detroit, MI', 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria', 'Manages supply chain and operations'),
(uuid_generate_v4(), 'James Parker', 'james@creativedesigns.com', '+1 (555) 301-4001', 'Creative Director', 'Creative Designs LLC', '321 Art District, Austin, TX', 'https://api.dicebear.com/7.x/avataaars/svg?seed=james', 'Leads all creative projects and campaigns'),
(uuid_generate_v4(), 'Dr. Lisa Chen', 'lisa@healthfirst.com', '+1 (555) 401-5001', 'Chief Medical Officer', 'HealthFirst Medical', '654 Medical Center Dr, Boston, MA', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa', 'Oversees medical operations and compliance'),
(uuid_generate_v4(), 'Robert Taylor', 'robert@techcorp.com', '+1 (555) 101-2002', 'VP of Sales', 'TechCorp Solutions', '456 Tech Avenue, San Francisco, CA', 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert', 'Handles enterprise sales and partnerships'),
(uuid_generate_v4(), 'Jennifer Lee', 'jennifer@startup.com', '+1 (555) 999-0001', 'Founder & CEO', 'StartupXYZ', '123 Innovation Way, Palo Alto, CA', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer', 'Tech entrepreneur looking for solutions'),
(uuid_generate_v4(), 'Michael Foster', 'michael@consulting.com', '+1 (555) 888-0002', 'Senior Consultant', 'Foster Consulting', '789 Business Center, Chicago, IL', 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael', 'Management consultant specializing in operations'),
(uuid_generate_v4(), 'Amanda White', 'amanda@retailplus.com', '+1 (555) 777-0003', 'Marketing Manager', 'RetailPlus Corp', '456 Commerce St, New York, NY', 'https://api.dicebear.com/7.x/avataaars/svg?seed=amanda', 'Handles digital marketing and e-commerce');

-- ==================================================
-- SAMPLE LEADS
-- ==================================================

INSERT INTO leads (id, name, company, email, phone, score, status, source, avatar_url, title, notes) VALUES
(uuid_generate_v4(), 'Kevin Anderson', 'DataTech Systems', 'kevin@datatech.com', '+1 (555) 111-2222', 85, 'Qualified', 'Website', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kevin', 'IT Director', 'High-value prospect. Interested in enterprise solution.'),
(uuid_generate_v4(), 'Rachel Green', 'Innovative Solutions', 'rachel@innovative.com', '+1 (555) 333-4444', 72, 'Contacted', 'Referral', 'https://api.dicebear.com/7.x/avataaars/svg?seed=rachel', 'Business Owner', 'Referral from existing client. Looking for CRM system.'),
(uuid_generate_v4(), 'Tom Harris', 'GrowthCo', 'tom@growthco.com', '+1 (555) 555-6666', 63, 'New', 'Trade Show', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tom', 'VP Operations', 'Met at TechExpo 2024. Needs process automation.'),
(uuid_generate_v4(), 'Sophie Miller', 'NextGen Enterprises', 'sophie@nextgen.com', '+1 (555) 777-8888', 91, 'Qualified', 'LinkedIn', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophie', 'COO', 'Very interested. Budget approved. Ready to move forward.'),
(uuid_generate_v4(), 'Daniel Clark', 'FutureTech Inc', 'daniel@futuretech.com', '+1 (555) 999-0000', 45, 'New', 'Cold Email', 'https://api.dicebear.com/7.x/avataaars/svg?seed=daniel', 'CTO', 'Responded to cold outreach. Early stage prospect.');

-- ==================================================
-- SAMPLE OPPORTUNITIES
-- ==================================================

INSERT INTO opportunities (id, title, description, value, stage, probability, close_date, contact_name) VALUES
(uuid_generate_v4(), 'TechCorp Enterprise License', 'Annual enterprise software license for 500+ users', 125000.00, 'Negotiation', 80, '2024-03-15', 'Alex Thompson'),
(uuid_generate_v4(), 'Global Manufacturing CRM Implementation', 'Complete CRM system setup and customization', 75000.00, 'Proposal', 65, '2024-02-28', 'Maria Rodriguez'),
(uuid_generate_v4(), 'Creative Designs Marketing Automation', 'Marketing automation platform and training', 35000.00, 'Qualification', 40, '2024-04-10', 'James Parker'),
(uuid_generate_v4(), 'HealthFirst Compliance Solution', 'Healthcare compliance and reporting system', 95000.00, 'Prospecting', 25, '2024-05-20', 'Dr. Lisa Chen'),
(uuid_generate_v4(), 'StartupXYZ Growth Package', 'Startup-friendly CRM with scaling options', 15000.00, 'Proposal', 70, '2024-03-01', 'Jennifer Lee');

-- ==================================================
-- SAMPLE PROJECTS
-- ==================================================

INSERT INTO projects (id, name, description, status, start_date, deadline, budget, contact_name) VALUES
(uuid_generate_v4(), 'TechCorp System Integration', 'Integrate CRM with existing ERP and accounting systems', 'In Progress', '2024-01-15', '2024-03-15', 45000.00, 'Alex Thompson'),
(uuid_generate_v4(), 'Global Manufacturing Training', 'Comprehensive CRM training for 200+ users', 'Planning', '2024-02-01', '2024-03-30', 25000.00, 'Maria Rodriguez'),
(uuid_generate_v4(), 'Website Redesign Project', 'Complete website overhaul with new CRM integration', 'In Progress', '2024-01-10', '2024-02-28', 35000.00, 'James Parker'),
(uuid_generate_v4(), 'Data Migration Service', 'Migrate legacy data to new CRM system', 'Planning', '2024-03-01', '2024-04-15', 15000.00, 'Dr. Lisa Chen');

-- ==================================================
-- SAMPLE TASKS
-- ==================================================

INSERT INTO tasks (id, title, description, status, priority, due_date, contact_name) VALUES
(uuid_generate_v4(), 'Follow up with TechCorp', 'Schedule technical demo for next week', 'To Do', 'High', '2024-01-25 10:00:00+00', 'Alex Thompson'),
(uuid_generate_v4(), 'Prepare proposal for Global Manufacturing', 'Create detailed proposal including timeline and pricing', 'In Progress', 'High', '2024-01-30 17:00:00+00', 'Maria Rodriguez'),
(uuid_generate_v4(), 'Send contract to Creative Designs', 'Finalize and send signed contract', 'To Do', 'Medium', '2024-02-01 12:00:00+00', 'James Parker'),
(uuid_generate_v4(), 'Schedule implementation kickoff', 'Coordinate with client team for project start', 'To Do', 'Medium', '2024-02-05 14:00:00+00', 'Dr. Lisa Chen'),
(uuid_generate_v4(), 'Client onboarding call', 'Initial onboarding and training session', 'Completed', 'Low', '2024-01-20 15:00:00+00', 'Jennifer Lee'),
(uuid_generate_v4(), 'Update CRM documentation', 'Review and update user documentation', 'To Do', 'Low', '2024-02-10 16:00:00+00', 'Michael Foster'),
(uuid_generate_v4(), 'Quarterly business review', 'Prepare QBR presentation and metrics', 'In Progress', 'Medium', '2024-02-15 11:00:00+00', 'Amanda White');

-- ==================================================
-- SAMPLE ACTIVITIES
-- ==================================================

INSERT INTO activities (id, type, summary, description, contact_name, duration, outcome, start_time) VALUES
(uuid_generate_v4(), 'Call', 'Discovery call with TechCorp', 'Initial needs assessment and solution overview', 'Alex Thompson', 45, 'Positive - moving to demo phase', '2024-01-20 14:00:00+00'),
(uuid_generate_v4(), 'Meeting', 'On-site visit at Global Manufacturing', 'Facility tour and stakeholder interviews', 'Maria Rodriguez', 120, 'Good understanding of requirements', '2024-01-18 10:00:00+00'),
(uuid_generate_v4(), 'Email', 'Proposal sent to Creative Designs', 'Detailed proposal with pricing and timeline', 'James Parker', NULL, 'Awaiting response', '2024-01-22 09:30:00+00'),
(uuid_generate_v4(), 'Call', 'Technical discussion with HealthFirst', 'Security and compliance requirements review', 'Dr. Lisa Chen', 60, 'Need to provide additional documentation', '2024-01-19 16:00:00+00'),
(uuid_generate_v4(), 'Meeting', 'Startup pitch presentation', 'Product demo and pricing discussion', 'Jennifer Lee', 90, 'Very interested - requesting references', '2024-01-21 13:00:00+00');

-- ==================================================
-- SAMPLE PRODUCTS
-- ==================================================

INSERT INTO products (id, name, description, price, sku, category) VALUES
(uuid_generate_v4(), 'CRM Professional License', 'Annual license for professional CRM features', 1200.00, 'CRM-PRO-001', 'Software License'),
(uuid_generate_v4(), 'CRM Enterprise License', 'Annual license for enterprise CRM with advanced features', 2400.00, 'CRM-ENT-001', 'Software License'),
(uuid_generate_v4(), 'Implementation Services', 'Professional setup and configuration services', 5000.00, 'IMP-SRV-001', 'Professional Services'),
(uuid_generate_v4(), 'Training Package', 'Comprehensive user training and documentation', 2500.00, 'TRN-PKG-001', 'Training'),
(uuid_generate_v4(), 'Data Migration Service', 'Legacy data migration and cleanup', 3500.00, 'MIG-SRV-001', 'Professional Services'),
(uuid_generate_v4(), 'Custom Integration', 'Custom API integration with third-party systems', 7500.00, 'INT-CST-001', 'Professional Services'),
(uuid_generate_v4(), 'Premium Support', 'Priority support with dedicated account manager', 3600.00, 'SUP-PRM-001', 'Support');

-- ==================================================
-- SAMPLE TAGS
-- ==================================================

INSERT INTO tags (id, name, color) VALUES
(uuid_generate_v4(), 'High Value', '#10B981'),
(uuid_generate_v4(), 'Enterprise', '#3B82F6'),
(uuid_generate_v4(), 'Startup', '#8B5CF6'),
(uuid_generate_v4(), 'Healthcare', '#EF4444'),
(uuid_generate_v4(), 'Technology', '#06B6D4'),
(uuid_generate_v4(), 'Manufacturing', '#F59E0B'),
(uuid_generate_v4(), 'VIP Client', '#EC4899'),
(uuid_generate_v4(), 'Referral', '#84CC16'),
(uuid_generate_v4(), 'Hot Lead', '#F97316'),
(uuid_generate_v4(), 'Follow Up', '#6B7280');

-- ==================================================
-- SAMPLE EMAIL TEMPLATES
-- ==================================================

INSERT INTO email_templates (id, name, subject, body, template_type) VALUES
(uuid_generate_v4(), 'Welcome Email', 'Welcome to {{company_name}}!', 
'Hi {{contact_name}},

Welcome to {{company_name}}! We''re excited to work with you.

Here are your next steps:
1. Complete your profile setup
2. Schedule your onboarding call
3. Access your training materials

If you have any questions, don''t hesitate to reach out.

Best regards,
{{sender_name}}', 'welcome'),

(uuid_generate_v4(), 'Follow Up Email', 'Following up on our conversation', 
'Hi {{contact_name}},

Thank you for taking the time to speak with us yesterday. I wanted to follow up on our discussion about {{topic}}.

As discussed, here are the next steps:
{{next_steps}}

I''ve attached the proposal we discussed. Please let me know if you have any questions.

Looking forward to hearing from you.

Best regards,
{{sender_name}}', 'follow_up'),

(uuid_generate_v4(), 'Invoice Email', 'Invoice {{invoice_number}} from {{company_name}}', 
'Hi {{contact_name}},

Please find attached invoice {{invoice_number}} for services provided.

Invoice Details:
- Amount: ${{total_amount}}
- Due Date: {{due_date}}
- Payment Terms: {{payment_terms}}

You can pay online at: {{payment_link}}

Thank you for your business!

Best regards,
{{sender_name}}', 'invoice');

-- ==================================================
-- SAMPLE AI INSIGHTS
-- ==================================================

INSERT INTO ai_insights (id, title, description, insight_type, confidence, data) VALUES
(uuid_generate_v4(), 'High Conversion Probability', 'This lead shows strong buying signals and should be prioritized', 'lead_scoring', 0.87, '{"signals": ["budget_confirmed", "decision_maker", "timeline_urgent"], "score": 87}'),
(uuid_generate_v4(), 'Upsell Opportunity', 'Client usage patterns suggest they would benefit from premium features', 'upsell', 0.73, '{"current_plan": "professional", "usage": "high", "recommended_plan": "enterprise"}'),
(uuid_generate_v4(), 'Churn Risk Alert', 'Customer engagement has decreased significantly in the last 30 days', 'churn_risk', 0.65, '{"engagement_score": 35, "last_login": "15_days_ago", "support_tickets": 3}'),
(uuid_generate_v4(), 'Best Contact Time', 'Based on response patterns, optimal contact time is Tuesday 2-4 PM', 'engagement_optimization', 0.82, '{"best_day": "Tuesday", "best_time": "14:00-16:00", "response_rate": 0.82}');

COMMENT ON SCHEMA public IS 'CRM Seed Data - Sample data for testing and demonstration';
