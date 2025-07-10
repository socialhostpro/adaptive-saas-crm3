-- ==================================================
-- SUPABASE CRM COMPLETE SCHEMA SETUP
-- ==================================================
-- Run these scripts in order in your Supabase SQL Editor
-- 1. First run this schema file
-- 2. Then run the seed data file
-- 3. Then run the RLS policies file
-- 4. Finally run the indexes file

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================================================
-- ENUMS AND TYPES
-- ==================================================

-- Lead Status Enum
CREATE TYPE lead_status AS ENUM (
    'New',
    'Contacted', 
    'Qualified',
    'Lost',
    'Converted'
);

-- Activity Type Enum
CREATE TYPE activity_type AS ENUM (
    'Call',
    'Email', 
    'Meeting',
    'Note'
);

-- Task Status Enum
CREATE TYPE task_status AS ENUM (
    'To Do',
    'In Progress',
    'Completed'
);

-- Task Priority Enum
CREATE TYPE task_priority AS ENUM (
    'Low',
    'Medium',
    'High'
);

-- Invoice Status Enum
CREATE TYPE invoice_status AS ENUM (
    'Draft',
    'Sent',
    'Paid',
    'Overdue',
    'Partially Paid'
);

-- Payment Method Enum
CREATE TYPE payment_method AS ENUM (
    'Credit Card',
    'Bank Transfer',
    'Check',
    'Cash',
    'Other'
);

-- Opportunity Stage Enum
CREATE TYPE opportunity_stage AS ENUM (
    'Prospecting',
    'Qualification',
    'Proposal',
    'Negotiation',
    'Closed Won',
    'Closed Lost'
);

-- Project Status Enum
CREATE TYPE project_status AS ENUM (
    'Planning',
    'In Progress',
    'On Hold',
    'Completed',
    'Cancelled'
);

-- Case Priority Enum
CREATE TYPE case_priority AS ENUM (
    'Low',
    'Medium',
    'High',
    'Critical'
);

-- Case Status Enum
CREATE TYPE case_status AS ENUM (
    'Open',
    'In Progress',
    'Pending',
    'Resolved',
    'Closed'
);

-- Media File Type Enum
CREATE TYPE media_file_type AS ENUM (
    'image',
    'video',
    'audio',
    'document',
    'other'
);

-- ==================================================
-- CORE TABLES
-- ==================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar_url TEXT,
    department TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    logo_url TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    title TEXT,
    company TEXT,
    company_id UUID REFERENCES companies(id),
    address TEXT,
    avatar_url TEXT,
    info TEXT,
    social_networks JSONB DEFAULT '[]',
    related_contact_ids UUID[],
    created_by UUID REFERENCES profiles(id),
    assigned_to UUID REFERENCES team_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    score INTEGER DEFAULT 0,
    status lead_status DEFAULT 'New',
    source TEXT,
    last_contacted TIMESTAMP WITH TIME ZONE,
    contact_id UUID REFERENCES contacts(id),
    assigned_to UUID REFERENCES team_members(id),
    created_by UUID REFERENCES profiles(id),
    avatar_url TEXT,
    title TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunities
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    value DECIMAL(15,2) DEFAULT 0,
    stage opportunity_stage DEFAULT 'Prospecting',
    probability INTEGER DEFAULT 0,
    close_date DATE,
    contact_id UUID REFERENCES contacts(id),
    contact_name TEXT,
    lead_id UUID REFERENCES leads(id),
    assigned_to UUID REFERENCES team_members(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    status project_status DEFAULT 'Planning',
    start_date DATE,
    end_date DATE,
    deadline DATE,
    budget DECIMAL(15,2),
    contact_id UUID REFERENCES contacts(id),
    contact_name TEXT,
    opportunity_id UUID REFERENCES opportunities(id),
    assigned_to UUID REFERENCES team_members(id),
    created_by UUID REFERENCES profiles(id),
    media_file_ids UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cases (Support/Service Cases)
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    priority case_priority DEFAULT 'Medium',
    status case_status DEFAULT 'Open',
    contact_id UUID REFERENCES contacts(id),
    contact_name TEXT,
    assigned_to UUID REFERENCES team_members(id),
    created_by UUID REFERENCES profiles(id),
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type activity_type NOT NULL,
    summary TEXT NOT NULL,
    description TEXT,
    contact_id UUID REFERENCES contacts(id),
    contact_name TEXT,
    lead_id UUID REFERENCES leads(id),
    opportunity_id UUID REFERENCES opportunities(id),
    project_id UUID REFERENCES projects(id),
    case_id UUID REFERENCES cases(id),
    assigned_to UUID REFERENCES team_members(id),
    created_by UUID REFERENCES profiles(id),
    -- Activity specific fields
    duration INTEGER, -- in minutes for calls
    outcome TEXT, -- for calls
    subject TEXT, -- for emails
    location TEXT, -- for meetings
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status task_status DEFAULT 'To Do',
    priority task_priority DEFAULT 'Medium',
    due_date TIMESTAMP WITH TIME ZONE,
    contact_id UUID REFERENCES contacts(id),
    contact_name TEXT,
    lead_id UUID REFERENCES leads(id),
    opportunity_id UUID REFERENCES opportunities(id),
    project_id UUID REFERENCES projects(id),
    case_id UUID REFERENCES cases(id),
    assigned_to UUID REFERENCES team_members(id),
    created_by UUID REFERENCES profiles(id),
    media_file_ids UUID[],
    time_entry_ids UUID[],
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(15,2) DEFAULT 0,
    cost DECIMAL(15,2) DEFAULT 0,
    sku TEXT UNIQUE,
    category TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    contact_id UUID REFERENCES contacts(id),
    contact_name TEXT,
    opportunity_id UUID REFERENCES opportunities(id),
    project_id UUID REFERENCES projects(id),
    total_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    status invoice_status DEFAULT 'Draft',
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    notes TEXT,
    terms TEXT,
    created_by UUID REFERENCES profiles(id),
    sent_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Line Items
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) DEFAULT 1,
    unit_price DECIMAL(15,2) DEFAULT 0,
    line_total DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id),
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    method payment_method DEFAULT 'Other',
    reference_number TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Estimates
CREATE TABLE estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimate_number TEXT UNIQUE NOT NULL,
    contact_id UUID REFERENCES contacts(id),
    contact_name TEXT,
    opportunity_id UUID REFERENCES opportunities(id),
    total_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    status TEXT DEFAULT 'Draft',
    issue_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    notes TEXT,
    terms TEXT,
    created_by UUID REFERENCES profiles(id),
    sent_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Estimate Line Items
CREATE TABLE estimate_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) DEFAULT 1,
    unit_price DECIMAL(15,2) DEFAULT 0,
    line_total DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media Files
CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    original_name TEXT,
    file_type media_file_type,
    file_size INTEGER,
    mime_type TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    description TEXT,
    contact_id UUID REFERENCES contacts(id),
    lead_id UUID REFERENCES leads(id),
    opportunity_id UUID REFERENCES opportunities(id),
    project_id UUID REFERENCES projects(id),
    case_id UUID REFERENCES cases(id),
    task_id UUID REFERENCES tasks(id),
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    contact_id UUID REFERENCES contacts(id),
    lead_id UUID REFERENCES leads(id),
    opportunity_id UUID REFERENCES opportunities(id),
    project_id UUID REFERENCES projects(id),
    case_id UUID REFERENCES cases(id),
    task_id UUID REFERENCES tasks(id),
    created_by UUID REFERENCES profiles(id),
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time Entries (for project tracking)
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    task_id UUID REFERENCES tasks(id),
    project_id UUID REFERENCES projects(id),
    billable BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(10,2),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#6B7280',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tag Associations (many-to-many relationship)
CREATE TABLE tag_associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one entity type per association
    CONSTRAINT single_entity_check CHECK (
        (contact_id IS NOT NULL)::int + 
        (lead_id IS NOT NULL)::int + 
        (opportunity_id IS NOT NULL)::int + 
        (project_id IS NOT NULL)::int + 
        (case_id IS NOT NULL)::int = 1
    )
);

-- AI Insights
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    insight_type TEXT NOT NULL,
    confidence DECIMAL(3,2), -- 0.00 to 1.00
    contact_id UUID REFERENCES contacts(id),
    lead_id UUID REFERENCES leads(id),
    opportunity_id UUID REFERENCES opportunities(id),
    project_id UUID REFERENCES projects(id),
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- ==================================================
-- COMMUNICATION & CHAT TABLES
-- ==================================================

-- Chat Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    is_group BOOLEAN DEFAULT false,
    avatar_url TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation Participants
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    role TEXT DEFAULT 'member', -- 'admin', 'member'
    
    UNIQUE(conversation_id, user_id)
);

-- Chat Messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text', -- 'text', 'file', 'image', 'system'
    file_url TEXT,
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    reply_to_id UUID REFERENCES chat_messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Reactions
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(message_id, user_id, emoji)
);

-- ==================================================
-- SYSTEM TABLES
-- ==================================================

-- Email Templates
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    template_type TEXT, -- 'lead_follow_up', 'invoice', 'estimate', etc.
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Settings
CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    company_logo TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    tax_number TEXT,
    currency TEXT DEFAULT 'USD',
    date_format TEXT DEFAULT 'MM/DD/YYYY',
    time_zone TEXT DEFAULT 'UTC',
    fiscal_year_start DATE DEFAULT '2024-01-01',
    invoice_prefix TEXT DEFAULT 'INV-',
    estimate_prefix TEXT DEFAULT 'EST-',
    next_invoice_number INTEGER DEFAULT 1,
    next_estimate_number INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- active_subscriptions
CREATE TABLE IF NOT EXISTS active_subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  status text,
  plan text,
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- activities
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text,
  contact_id uuid,
  contact_name text,
  summary text,
  timestamp timestamptz,
  duration integer,
  outcome text,
  subject text,
  location text,
  end_time timestamptz,
  lead_id uuid,
  description text,
  opportunity_id uuid,
  project_id uuid,
  case_id uuid,
  assigned_to uuid,
  created_by uuid,
  start_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- cases
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  priority text,
  status text,
  contact_id uuid,
  contact_name text,
  assigned_to uuid,
  created_by uuid,
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- companies
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid
);

-- contact_subscriptions
CREATE TABLE IF NOT EXISTS contact_subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id uuid,
  plan_name text,
  plan_price numeric,
  start_date date,
  end_date date,
  status text,
  renewal_period text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- contacts
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text,
  title text,
  company text,
  avatar_url text,
  phone text,
  created_by uuid,
  address text,
  info text,
  company_id uuid,
  social_networks jsonb,
  related_contact_ids uuid[],
  assigned_to uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- discounts
CREATE TABLE IF NOT EXISTS discounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text,
  description text,
  amount numeric,
  percent numeric,
  is_active boolean,
  valid_from date,
  valid_to date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- estimate_line_items
CREATE TABLE IF NOT EXISTS estimate_line_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id uuid,
  product_id uuid,
  description text,
  quantity integer,
  unit_price numeric,
  total numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- estimates
CREATE TABLE IF NOT EXISTS estimates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid,
  contact_id uuid,
  estimate_number text,
  status text,
  issue_date date,
  total numeric,
  notes text
);

-- ==================================================
-- FUNCTIONS AND TRIGGERS
-- ==================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estimates_updated_at BEFORE UPDATE ON estimates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_files_updated_at BEFORE UPDATE ON media_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate invoice line totals
CREATE OR REPLACE FUNCTION calculate_line_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.line_total = NEW.quantity * NEW.unit_price;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for line total calculation
CREATE TRIGGER calculate_invoice_line_total BEFORE INSERT OR UPDATE ON invoice_line_items FOR EACH ROW EXECUTE FUNCTION calculate_line_total();
CREATE TRIGGER calculate_estimate_line_total BEFORE INSERT OR UPDATE ON estimate_line_items FOR EACH ROW EXECUTE FUNCTION calculate_line_total();

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT;
    next_num INTEGER;
BEGIN
    SELECT invoice_prefix, next_invoice_number INTO prefix, next_num FROM company_settings LIMIT 1;
    
    IF prefix IS NULL THEN
        prefix := 'INV-';
    END IF;
    
    IF next_num IS NULL THEN
        next_num := 1;
    END IF;
    
    NEW.invoice_number := prefix || LPAD(next_num::TEXT, 4, '0');
    
    UPDATE company_settings SET next_invoice_number = next_num + 1;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate estimate numbers
CREATE OR REPLACE FUNCTION generate_estimate_number()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT;
    next_num INTEGER;
BEGIN
    SELECT estimate_prefix, next_estimate_number INTO prefix, next_num FROM company_settings LIMIT 1;
    
    IF prefix IS NULL THEN
        prefix := 'EST-';
    END IF;
    
    IF next_num IS NULL THEN
        next_num := 1;
    END IF;
    
    NEW.estimate_number := prefix || LPAD(next_num::TEXT, 4, '0');
    
    UPDATE company_settings SET next_estimate_number = next_num + 1;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for auto-generating numbers (only if not provided)
CREATE TRIGGER auto_generate_invoice_number 
    BEFORE INSERT ON invoices 
    FOR EACH ROW 
    WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
    EXECUTE FUNCTION generate_invoice_number();

CREATE TRIGGER auto_generate_estimate_number 
    BEFORE INSERT ON estimates 
    FOR EACH ROW 
    WHEN (NEW.estimate_number IS NULL OR NEW.estimate_number = '')
    EXECUTE FUNCTION generate_estimate_number();

-- ==================================================
-- VIEWS FOR COMMON QUERIES
-- ==================================================

-- Lead Pipeline View
CREATE VIEW lead_pipeline AS
SELECT 
    l.*,
    c.name as contact_name,
    tm.name as assigned_name
FROM leads l
LEFT JOIN contacts c ON l.contact_id = c.id
LEFT JOIN team_members tm ON l.assigned_to = tm.id
WHERE l.status != 'Converted';

-- Opportunity Pipeline View
CREATE VIEW opportunity_pipeline AS
SELECT 
    o.*,
    c.name as contact_name,
    tm.name as assigned_name,
    l.name as lead_name
FROM opportunities o
LEFT JOIN contacts c ON o.contact_id = c.id
LEFT JOIN team_members tm ON o.assigned_to = tm.id
LEFT JOIN leads l ON o.lead_id = l.id
WHERE o.stage NOT IN ('Closed Won', 'Closed Lost');

-- Active Tasks View
CREATE VIEW active_tasks AS
SELECT 
    t.*,
    c.name as contact_name,
    tm.name as assigned_name
FROM tasks t
LEFT JOIN contacts c ON t.contact_id = c.id
LEFT JOIN team_members tm ON t.assigned_to = tm.id
WHERE t.status != 'Completed';

-- Outstanding Invoices View
CREATE VIEW outstanding_invoices AS
SELECT 
    i.*,
    c.name as contact_name,
    COALESCE(SUM(p.amount), 0) as paid_amount,
    i.total_amount - COALESCE(SUM(p.amount), 0) as balance_due
FROM invoices i
LEFT JOIN contacts c ON i.contact_id = c.id
LEFT JOIN payments p ON i.id = p.invoice_id
WHERE i.status IN ('Sent', 'Overdue', 'Partially Paid')
GROUP BY i.id, c.name;

COMMENT ON SCHEMA public IS 'Complete CRM Database Schema - Ready for Production Use';
