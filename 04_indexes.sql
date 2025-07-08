-- 04_indexes.sql
-- Performance indexes for Adaptive SaaS CRM
-- Creates indexes to optimize queries and improve performance

-- =======================
-- Company and Profile Indexes
-- =======================

-- Index for company lookups
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);

-- Profile indexes for authentication and company lookups
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(active) WHERE active = true;

-- =======================
-- Lead Management Indexes
-- =======================

-- Core lead indexes
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_updated_at ON leads(updated_at);

-- Lead source and scoring indexes
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_company_status ON leads(company_id, status);

-- Lead scores table indexes
CREATE INDEX IF NOT EXISTS idx_lead_scores_lead_id ON lead_scores(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_scores_created_at ON lead_scores(created_at);

-- =======================
-- Opportunity Management Indexes
-- =======================

-- Core opportunity indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_company_id ON opportunities(company_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_lead_id ON opportunities(lead_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_assigned_to ON opportunities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_opportunities_value ON opportunities(value);
CREATE INDEX IF NOT EXISTS idx_opportunities_close_date ON opportunities(close_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_opportunities_company_stage ON opportunities(company_id, stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_company_value ON opportunities(company_id, value);

-- Opportunity products indexes
CREATE INDEX IF NOT EXISTS idx_opportunity_products_opportunity_id ON opportunity_products(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_products_product_id ON opportunity_products(product_id);

-- =======================
-- Contact Management Indexes
-- =======================

-- Core contact indexes
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- Contact name search optimization
CREATE INDEX IF NOT EXISTS idx_contacts_name_search ON contacts 
    USING gin((first_name || ' ' || last_name) gin_trgm_ops);

-- Contact groups indexes
CREATE INDEX IF NOT EXISTS idx_contact_groups_company_id ON contact_groups(company_id);
CREATE INDEX IF NOT EXISTS idx_contact_group_members_group_id ON contact_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_contact_group_members_contact_id ON contact_group_members(contact_id);

-- =======================
-- Project and Task Management Indexes
-- =======================

-- Project indexes
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);
CREATE INDEX IF NOT EXISTS idx_projects_end_date ON projects(end_date);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Task indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Composite indexes for task queries
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_status ON tasks(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id, status);

-- Task dependencies indexes
CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);

-- =======================
-- Support and Case Management Indexes
-- =======================

-- Case indexes
CREATE INDEX IF NOT EXISTS idx_cases_company_id ON cases(company_id);
CREATE INDEX IF NOT EXISTS idx_cases_contact_id ON cases(contact_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at);
CREATE INDEX IF NOT EXISTS idx_cases_updated_at ON cases(updated_at);

-- Composite indexes for case queries
CREATE INDEX IF NOT EXISTS idx_cases_company_status ON cases(company_id, status);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_status ON cases(assigned_to, status);

-- Case comments indexes
CREATE INDEX IF NOT EXISTS idx_case_comments_case_id ON case_comments(case_id);
CREATE INDEX IF NOT EXISTS idx_case_comments_author_id ON case_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_case_comments_created_at ON case_comments(created_at);

-- =======================
-- Communication and Activity Indexes
-- =======================

-- Activity indexes
CREATE INDEX IF NOT EXISTS idx_activities_company_id ON activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_entity_type ON activities(entity_type);
CREATE INDEX IF NOT EXISTS idx_activities_entity_id ON activities(entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- Composite indexes for activity queries
CREATE INDEX IF NOT EXISTS idx_activities_company_type ON activities(company_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);

-- Communications indexes
CREATE INDEX IF NOT EXISTS idx_communications_company_id ON communications(company_id);
CREATE INDEX IF NOT EXISTS idx_communications_contact_id ON communications(contact_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(communication_type);
CREATE INDEX IF NOT EXISTS idx_communications_direction ON communications(direction);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at);

-- Chat channel indexes
CREATE INDEX IF NOT EXISTS idx_chat_channels_company_id ON chat_channels(company_id);
CREATE INDEX IF NOT EXISTS idx_chat_channels_type ON chat_channels(channel_type);
CREATE INDEX IF NOT EXISTS idx_chat_channels_created_by ON chat_channels(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_channels_created_at ON chat_channels(created_at);

-- Channel members indexes
CREATE INDEX IF NOT EXISTS idx_channel_members_channel_id ON channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_role ON channel_members(role);

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Message search optimization
CREATE INDEX IF NOT EXISTS idx_chat_messages_content_search ON chat_messages 
    USING gin(content gin_trgm_ops);

-- =======================
-- File Management Indexes
-- =======================

-- File indexes
CREATE INDEX IF NOT EXISTS idx_files_company_id ON files(company_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_entity_type ON files(entity_type);
CREATE INDEX IF NOT EXISTS idx_files_entity_id ON files(entity_id);
CREATE INDEX IF NOT EXISTS idx_files_file_type ON files(file_type);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);

-- File name search optimization
CREATE INDEX IF NOT EXISTS idx_files_name_search ON files 
    USING gin(file_name gin_trgm_ops);

-- File permissions indexes
CREATE INDEX IF NOT EXISTS idx_file_permissions_file_id ON file_permissions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_permissions_user_id ON file_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_file_permissions_permission_type ON file_permissions(permission_type);

-- =======================
-- Product and Inventory Indexes
-- =======================

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Product name search optimization
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products 
    USING gin(name gin_trgm_ops);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory(location);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_updated_at ON inventory(updated_at);

-- =======================
-- Financial Management Indexes
-- =======================

-- Estimate indexes
CREATE INDEX IF NOT EXISTS idx_estimates_company_id ON estimates(company_id);
CREATE INDEX IF NOT EXISTS idx_estimates_contact_id ON estimates(contact_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_total ON estimates(total);
CREATE INDEX IF NOT EXISTS idx_estimates_created_at ON estimates(created_at);
CREATE INDEX IF NOT EXISTS idx_estimates_valid_until ON estimates(valid_until);

-- Estimate items indexes
CREATE INDEX IF NOT EXISTS idx_estimate_items_estimate_id ON estimate_items(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_items_product_id ON estimate_items(product_id);

-- Invoice indexes
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_contact_id ON invoices(contact_id);
CREATE INDEX IF NOT EXISTS idx_invoices_estimate_id ON invoices(estimate_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_total ON invoices(total);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

-- Invoice number search optimization
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- Invoice items indexes
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items(product_id);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_amount ON payments(amount);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- =======================
-- Campaign and Newsletter Indexes
-- =======================

-- Campaign indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_company_id ON campaigns(company_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_start_date ON campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_end_date ON campaigns(end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);

-- Campaign analytics indexes
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_metric_name ON campaign_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_recorded_at ON campaign_analytics(recorded_at);

-- Newsletter indexes
CREATE INDEX IF NOT EXISTS idx_newsletters_company_id ON newsletters(company_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_scheduled_at ON newsletters(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_newsletters_sent_at ON newsletters(sent_at);
CREATE INDEX IF NOT EXISTS idx_newsletters_created_at ON newsletters(created_at);

-- Newsletter subscribers indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_company_id ON newsletter_subscribers(company_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at ON newsletter_subscribers(subscribed_at);

-- Newsletter analytics indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_newsletter_id ON newsletter_analytics(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_metric_name ON newsletter_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_recorded_at ON newsletter_analytics(recorded_at);

-- =======================
-- Custom Widgets and AI Templates Indexes
-- =======================

-- Custom widgets indexes
CREATE INDEX IF NOT EXISTS idx_custom_widgets_company_id ON custom_widgets(company_id);
CREATE INDEX IF NOT EXISTS idx_custom_widgets_widget_type ON custom_widgets(widget_type);
CREATE INDEX IF NOT EXISTS idx_custom_widgets_active ON custom_widgets(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_custom_widgets_created_at ON custom_widgets(created_at);

-- AI templates indexes
CREATE INDEX IF NOT EXISTS idx_ai_templates_company_id ON ai_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_templates_template_type ON ai_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_ai_templates_is_public ON ai_templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_ai_templates_active ON ai_templates(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_ai_templates_created_at ON ai_templates(created_at);

-- Template name search optimization
CREATE INDEX IF NOT EXISTS idx_ai_templates_name_search ON ai_templates 
    USING gin(name gin_trgm_ops);

-- Widget permissions indexes
CREATE INDEX IF NOT EXISTS idx_widget_permissions_widget_id ON widget_permissions(widget_id);
CREATE INDEX IF NOT EXISTS idx_widget_permissions_user_id ON widget_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_permissions_permission_type ON widget_permissions(permission_type);

-- =======================
-- Full-Text Search Extensions and Indexes
-- =======================

-- Enable pg_trgm extension for fuzzy text search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Full-text search indexes for key searchable content
CREATE INDEX IF NOT EXISTS idx_leads_fulltext_search ON leads 
    USING gin(to_tsvector('english', 
        coalesce(first_name, '') || ' ' || 
        coalesce(last_name, '') || ' ' || 
        coalesce(email, '') || ' ' || 
        coalesce(company_name, '') || ' ' || 
        coalesce(notes, '')
    ));

CREATE INDEX IF NOT EXISTS idx_contacts_fulltext_search ON contacts 
    USING gin(to_tsvector('english', 
        coalesce(first_name, '') || ' ' || 
        coalesce(last_name, '') || ' ' || 
        coalesce(email, '') || ' ' || 
        coalesce(company_name, '') || ' ' || 
        coalesce(notes, '')
    ));

CREATE INDEX IF NOT EXISTS idx_opportunities_fulltext_search ON opportunities 
    USING gin(to_tsvector('english', 
        coalesce(name, '') || ' ' || 
        coalesce(description, '')
    ));

CREATE INDEX IF NOT EXISTS idx_projects_fulltext_search ON projects 
    USING gin(to_tsvector('english', 
        coalesce(name, '') || ' ' || 
        coalesce(description, '')
    ));

CREATE INDEX IF NOT EXISTS idx_tasks_fulltext_search ON tasks 
    USING gin(to_tsvector('english', 
        coalesce(title, '') || ' ' || 
        coalesce(description, '')
    ));

CREATE INDEX IF NOT EXISTS idx_cases_fulltext_search ON cases 
    USING gin(to_tsvector('english', 
        coalesce(title, '') || ' ' || 
        coalesce(description, '')
    ));

-- =======================
-- Performance Monitoring Indexes
-- =======================

-- Indexes for common reporting and analytics queries
CREATE INDEX IF NOT EXISTS idx_leads_monthly_stats ON leads(company_id, date_trunc('month', created_at));
CREATE INDEX IF NOT EXISTS idx_opportunities_monthly_stats ON opportunities(company_id, date_trunc('month', created_at));
CREATE INDEX IF NOT EXISTS idx_activities_daily_stats ON activities(company_id, date_trunc('day', created_at));
CREATE INDEX IF NOT EXISTS idx_communications_monthly_stats ON communications(company_id, date_trunc('month', created_at));

-- =======================
-- Index Creation Complete
-- =======================

-- Analyze tables to update statistics after index creation
ANALYZE;
