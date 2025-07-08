-- 03_rls.sql
-- Row Level Security policies for Adaptive SaaS CRM
-- This file enables RLS and creates policies for secure multi-tenant access

-- =======================
-- Enable Row Level Security
-- =======================

-- Core company and profile tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Lead and opportunity management
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_products ENABLE ROW LEVEL SECURITY;

-- Contact and relationship management  
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_group_members ENABLE ROW LEVEL SECURITY;

-- Project and task management
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

-- Support and case management
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_comments ENABLE ROW LEVEL SECURITY;

-- Communication and activity tracking
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;

-- File and document management
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_permissions ENABLE ROW LEVEL SECURITY;

-- Product and inventory management
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Financial management
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Campaign and newsletter management
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_analytics ENABLE ROW LEVEL SECURITY;

-- Custom widgets and AI templates
ALTER TABLE custom_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_permissions ENABLE ROW LEVEL SECURITY;

-- =======================
-- Profile and Authentication Policies
-- =======================

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =======================
-- Company-based Multi-tenant Policies
-- =======================

-- Companies: Users can only access their own company data
CREATE POLICY "Users can view own company" ON companies
    FOR SELECT USING (
        id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company owners can update company" ON companies
    FOR UPDATE USING (
        id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'owner')
    );

-- =======================
-- Lead Management Policies
-- =======================

-- Leads: Multi-tenant access based on company_id
CREATE POLICY "Company users can view leads" ON leads
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can insert leads" ON leads
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can update leads" ON leads
    FOR UPDATE USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company owners and managers can delete leads" ON leads
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('owner', 'manager')
        )
    );

-- Lead Scores: Same company access
CREATE POLICY "Company users can view lead scores" ON lead_scores
    FOR SELECT USING (
        lead_id IN (
            SELECT id FROM leads 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Company users can insert lead scores" ON lead_scores
    FOR INSERT WITH CHECK (
        lead_id IN (
            SELECT id FROM leads 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

-- =======================
-- Opportunity Management Policies
-- =======================

CREATE POLICY "Company users can view opportunities" ON opportunities
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can insert opportunities" ON opportunities
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can update opportunities" ON opportunities
    FOR UPDATE USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company owners and managers can delete opportunities" ON opportunities
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('owner', 'manager')
        )
    );

-- Opportunity Products
CREATE POLICY "Company users can view opportunity products" ON opportunity_products
    FOR SELECT USING (
        opportunity_id IN (
            SELECT id FROM opportunities 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Company users can manage opportunity products" ON opportunity_products
    FOR ALL USING (
        opportunity_id IN (
            SELECT id FROM opportunities 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

-- =======================
-- Contact Management Policies
-- =======================

CREATE POLICY "Company users can view contacts" ON contacts
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can insert contacts" ON contacts
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can update contacts" ON contacts
    FOR UPDATE USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company owners and managers can delete contacts" ON contacts
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('owner', 'manager')
        )
    );

-- Contact Groups
CREATE POLICY "Company users can view contact groups" ON contact_groups
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can manage contact groups" ON contact_groups
    FOR ALL USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Contact Group Members
CREATE POLICY "Company users can view contact group members" ON contact_group_members
    FOR SELECT USING (
        group_id IN (
            SELECT id FROM contact_groups 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Company users can manage contact group members" ON contact_group_members
    FOR ALL USING (
        group_id IN (
            SELECT id FROM contact_groups 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

-- =======================
-- Project and Task Management Policies
-- =======================

CREATE POLICY "Company users can view projects" ON projects
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can insert projects" ON projects
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can update projects" ON projects
    FOR UPDATE USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company owners and managers can delete projects" ON projects
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('owner', 'manager')
        )
    );

-- Tasks: Users can view tasks assigned to them or in their company projects
CREATE POLICY "Users can view accessible tasks" ON tasks
    FOR SELECT USING (
        assigned_to = auth.uid() OR
        project_id IN (
            SELECT id FROM projects 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Company users can insert tasks" ON tasks
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM projects 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can update own tasks or company tasks" ON tasks
    FOR UPDATE USING (
        assigned_to = auth.uid() OR
        project_id IN (
            SELECT id FROM projects 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Task Dependencies
CREATE POLICY "Company users can view task dependencies" ON task_dependencies
    FOR SELECT USING (
        task_id IN (
            SELECT id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE p.company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Company users can manage task dependencies" ON task_dependencies
    FOR ALL USING (
        task_id IN (
            SELECT id FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE p.company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

-- =======================
-- Support and Case Management Policies
-- =======================

CREATE POLICY "Company users can view cases" ON cases
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can insert cases" ON cases
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can update own cases or company cases" ON cases
    FOR UPDATE USING (
        assigned_to = auth.uid() OR
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Case Comments: Users can view comments on accessible cases
CREATE POLICY "Users can view case comments" ON case_comments
    FOR SELECT USING (
        case_id IN (
            SELECT id FROM cases 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can insert case comments" ON case_comments
    FOR INSERT WITH CHECK (
        case_id IN (
            SELECT id FROM cases 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        ) AND
        author_id = auth.uid()
    );

-- =======================
-- Communication and Activity Policies
-- =======================

CREATE POLICY "Company users can view activities" ON activities
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can insert activities" ON activities
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) AND
        user_id = auth.uid()
    );

CREATE POLICY "Users can update own activities" ON activities
    FOR UPDATE USING (user_id = auth.uid());

-- Communications
CREATE POLICY "Company users can view communications" ON communications
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can insert communications" ON communications
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Chat Channels
CREATE POLICY "Company users can view chat channels" ON chat_channels
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can create chat channels" ON chat_channels
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) AND
        created_by = auth.uid()
    );

-- Channel Members: Users can view channels they're members of
CREATE POLICY "Users can view channel memberships" ON channel_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        channel_id IN (
            SELECT id FROM chat_channels 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can join channels" ON channel_members
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        channel_id IN (
            SELECT id FROM chat_channels 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Chat Messages: Users can view messages in channels they're members of
CREATE POLICY "Users can view chat messages" ON chat_messages
    FOR SELECT USING (
        channel_id IN (
            SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send chat messages" ON chat_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        channel_id IN (
            SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
        )
    );

-- =======================
-- File Management Policies
-- =======================

CREATE POLICY "Company users can view files" ON files
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can upload files" ON files
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) AND
        uploaded_by = auth.uid()
    );

CREATE POLICY "File owners can update files" ON files
    FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "File owners and managers can delete files" ON files
    FOR DELETE USING (
        uploaded_by = auth.uid() OR
        company_id IN (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('owner', 'manager')
        )
    );

-- File Permissions
CREATE POLICY "Users can view file permissions" ON file_permissions
    FOR SELECT USING (
        file_id IN (
            SELECT id FROM files 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "File owners can manage permissions" ON file_permissions
    FOR ALL USING (
        file_id IN (
            SELECT id FROM files 
            WHERE uploaded_by = auth.uid()
        )
    );

-- =======================
-- Product and Inventory Policies
-- =======================

CREATE POLICY "Company users can view products" ON products
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can manage products" ON products
    FOR ALL USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can view inventory" ON inventory
    FOR SELECT USING (
        product_id IN (
            SELECT id FROM products 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Company users can manage inventory" ON inventory
    FOR ALL USING (
        product_id IN (
            SELECT id FROM products 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

-- =======================
-- Financial Management Policies
-- =======================

-- Estimates
CREATE POLICY "Company users can view estimates" ON estimates
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can manage estimates" ON estimates
    FOR ALL USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Estimate Items
CREATE POLICY "Company users can view estimate items" ON estimate_items
    FOR SELECT USING (
        estimate_id IN (
            SELECT id FROM estimates 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Company users can manage estimate items" ON estimate_items
    FOR ALL USING (
        estimate_id IN (
            SELECT id FROM estimates 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Invoices
CREATE POLICY "Company users can view invoices" ON invoices
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can manage invoices" ON invoices
    FOR ALL USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Invoice Items
CREATE POLICY "Company users can view invoice items" ON invoice_items
    FOR SELECT USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Company users can manage invoice items" ON invoice_items
    FOR ALL USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Payments
CREATE POLICY "Company users can view payments" ON payments
    FOR SELECT USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Company users can manage payments" ON payments
    FOR ALL USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

-- =======================
-- Campaign and Newsletter Policies
-- =======================

CREATE POLICY "Company users can view campaigns" ON campaigns
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can manage campaigns" ON campaigns
    FOR ALL USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can view campaign analytics" ON campaign_analytics
    FOR SELECT USING (
        campaign_id IN (
            SELECT id FROM campaigns 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Company users can manage campaign analytics" ON campaign_analytics
    FOR ALL USING (
        campaign_id IN (
            SELECT id FROM campaigns 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Newsletters
CREATE POLICY "Company users can view newsletters" ON newsletters
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can manage newsletters" ON newsletters
    FOR ALL USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Newsletter Subscribers (special case - subscribers can view their own data)
CREATE POLICY "Users can view newsletter subscriptions" ON newsletter_subscribers
    FOR SELECT USING (
        email IN (SELECT email FROM profiles WHERE id = auth.uid()) OR
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can manage newsletter subscriptions" ON newsletter_subscribers
    FOR INSERT WITH CHECK (
        email IN (SELECT email FROM profiles WHERE id = auth.uid()) OR
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can update own newsletter subscriptions" ON newsletter_subscribers
    FOR UPDATE USING (
        email IN (SELECT email FROM profiles WHERE id = auth.uid()) OR
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Newsletter Analytics
CREATE POLICY "Company users can view newsletter analytics" ON newsletter_analytics
    FOR SELECT USING (
        newsletter_id IN (
            SELECT id FROM newsletters 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Company users can manage newsletter analytics" ON newsletter_analytics
    FOR ALL USING (
        newsletter_id IN (
            SELECT id FROM newsletters 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

-- =======================
-- Custom Widgets and AI Templates Policies
-- =======================

CREATE POLICY "Company users can view custom widgets" ON custom_widgets
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can manage custom widgets" ON custom_widgets
    FOR ALL USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company users can view AI templates" ON ai_templates
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR
        is_public = true
    );

CREATE POLICY "Company users can manage AI templates" ON ai_templates
    FOR ALL USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Widget Permissions
CREATE POLICY "Users can view widget permissions" ON widget_permissions
    FOR SELECT USING (
        widget_id IN (
            SELECT id FROM custom_widgets 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Widget owners can manage permissions" ON widget_permissions
    FOR ALL USING (
        widget_id IN (
            SELECT id FROM custom_widgets 
            WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

-- =======================
-- RLS Setup Complete
-- =======================

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
