# SQL Install Script for Supabase CRM

-- PROFILES TABLE (with RLS policies)
CREATE TABLE IF NOT EXISTS public.profiles (
    id bigint primary key generated always as identity,
    user_id uuid references auth.users(id) ON DELETE CASCADE,
    username text NOT NULL,
    bio text,
    created_at timestamp with time zone DEFAULT now()
) WITH (OIDS=FALSE);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Allow users to select their own profile
CREATE POLICY "Select own profile" ON public.profiles
FOR SELECT
USING (user_id = (select auth.uid()));

-- Allow users to insert their own profile
CREATE POLICY "Insert own profile" ON public.profiles
FOR INSERT
WITH CHECK (user_id = (select auth.uid()));

-- Allow users to update their own profile
CREATE POLICY "Update own profile" ON public.profiles
FOR UPDATE
USING (user_id = (select auth.uid()));

-- Allow users to delete their own profile
CREATE POLICY "Delete own profile" ON public.profiles
FOR DELETE
USING (user_id = (select auth.uid()));

-- Add role column to profiles for role-based permissions
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'User';
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id bigint primary key generated always as identity,
    username text NOT NULL,
    email text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now()
) WITH (OIDS=FALSE);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ACTIVITY TYPE ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type_enum') THEN
        CREATE TYPE public.activity_type_enum AS ENUM ('Call', 'Email', 'Meeting', 'Note');
    END IF;
END$$;

-- ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
    id TEXT PRIMARY KEY,
    type public.activity_type_enum NOT NULL,
    contact_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    summary TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,
    duration INT,
    outcome TEXT,
    subject TEXT,
    location TEXT,
    end_time TIMESTAMPTZ,
    lead_id TEXT
);
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- SEED DATA FOR ACTIVITIES
INSERT INTO public.activities (id, type, contact_id, contact_name, summary, "timestamp", subject) VALUES
('a1', 'Email', 'c1', 'Alana Patel', 'Sent over the final proposal documents for the new website design. She will review with her team and get back to us by Friday.', '2024-07-26T19:30:00Z', 'Proposal for Website Redesign');

INSERT INTO public.activities (id, type, contact_id, contact_name, summary, "timestamp", duration, outcome, lead_id) VALUES
('a2', 'Call', 'c2', 'Ben Carter', 'Follow-up call regarding cloud services. He had a few questions about our security protocols which I answered. He seems confident in our solution.', '2024-07-26T16:30:00Z', 15, 'Positive', 'l2');

INSERT INTO public.activities (id, type, contact_id, contact_name, summary, "timestamp", location, end_time) VALUES
('a3', 'Meeting', 'c5', 'Eva Chen', 'Q3 sales strategy kickoff. We aligned on targets and discussed the new commission structure. Team is motivated.', '2024-07-25T21:30:00Z', 'Boardroom C / Zoom', '2024-07-25T22:30:00Z');

INSERT INTO public.activities (id, type, contact_id, contact_name, summary, "timestamp") VALUES
('a4', 'Note', 'c3', 'Carla Rodriguez', 'Carla is a key decision-maker. She mentioned offhand that their current analytics dashboard is slow and lacks key features we offer. This could be a major upsell opportunity in Q4.', '2024-07-24T21:30:00Z');

INSERT INTO public.activities (id, type, contact_id, contact_name, summary, "timestamp", duration, outcome, lead_id) VALUES
('a5', 'Call', 'l1', 'Frank Green', 'Initial discovery call with Frank. He is looking for a new shipping logistics partner.', '2024-07-24T21:30:00Z', 30, 'Positive', 'l1');

-- CONTACTS TABLE
CREATE TABLE IF NOT EXISTS public.contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    title TEXT,
    company TEXT,
    avatar_url TEXT,
    phone TEXT
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public.contacts
CREATE POLICY "Select own contacts" ON public.contacts
FOR SELECT
TO authenticated
USING (id = (select auth.uid()::text));

CREATE POLICY "Insert own contacts" ON public.contacts
FOR INSERT
TO authenticated
WITH CHECK (id = (select auth.uid()::text));

CREATE POLICY "Update own contacts" ON public.contacts
FOR UPDATE
TO authenticated
USING (id = (select auth.uid()::text))
WITH CHECK (id = (select auth.uid()::text));

CREATE POLICY "Delete own contacts" ON public.contacts
FOR DELETE
TO authenticated
USING (id = (select auth.uid()::text));

-- OPPORTUNITY STAGE ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'opportunity_stage_enum') THEN
        CREATE TYPE public.opportunity_stage_enum AS ENUM ('Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed - Won', 'Closed - Lost');
    END IF;
END$$;

-- OPPORTUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.opportunities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    contact_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    value NUMERIC NOT NULL,
    stage public.opportunity_stage_enum NOT NULL,
    close_date DATE NOT NULL,
    assignee_id TEXT
);
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public.opportunities
CREATE POLICY "Select own opportunities" ON public.opportunities
FOR SELECT
TO authenticated
USING (assignee_id = (select auth.uid()::text));

CREATE POLICY "Insert own opportunities" ON public.opportunities
FOR INSERT
TO authenticated
WITH CHECK (assignee_id = (select auth.uid()::text));

CREATE POLICY "Update own opportunities" ON public.opportunities
FOR UPDATE
TO authenticated
USING (assignee_id = (select auth.uid()::text))
WITH CHECK (assignee_id = (select auth.uid()::text));

CREATE POLICY "Delete own opportunities" ON public.opportunities
FOR DELETE
TO authenticated
USING (assignee_id = (select auth.uid()::text));

-- CASE STATUS ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_status_enum') THEN
        CREATE TYPE public.case_status_enum AS ENUM ('Intake', 'Discovery', 'In Trial', 'On Hold', 'Closed - Won', 'Closed - Lost');
    END IF;
END$$;

-- CASES TABLE
CREATE TABLE IF NOT EXISTS public.cases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    case_number TEXT NOT NULL,
    contact_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    attorney_id TEXT NOT NULL,
    status public.case_status_enum NOT NULL,
    open_date DATE NOT NULL,
    close_date DATE,
    description TEXT,
    media_file_ids TEXT[]
);
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image_url TEXT
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- PROJECT STATUS ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status_enum') THEN
        CREATE TYPE public.project_status_enum AS ENUM ('Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled');
    END IF;
END$$;

-- PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    contact_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    deadline DATE NOT NULL,
    budget NUMERIC,
    status public.project_status_enum NOT NULL,
    media_file_ids TEXT[]
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- TEAM MEMBER ROLE & STATUS ENUMS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_member_role_enum') THEN
        CREATE TYPE public.team_member_role_enum AS ENUM ('Admin', 'Manager', 'Sales Rep', 'Super Admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_member_status_enum') THEN
        CREATE TYPE public.team_member_status_enum AS ENUM ('Online', 'Away', 'Offline');
    END IF;
END$$;

-- TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.team_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role public.team_member_role_enum NOT NULL,
    avatar_url TEXT,
    status public.team_member_status_enum NOT NULL,
    last_seen TEXT,
    phone TEXT,
    hire_date DATE,
    voice_settings JSONB
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- TASK STATUS & PRIORITY ENUMS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status_enum') THEN
        CREATE TYPE public.task_status_enum AS ENUM ('To Do', 'In Progress', 'Completed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority_enum') THEN
        CREATE TYPE public.task_priority_enum AS ENUM ('Low', 'Medium', 'High');
    END IF;
END$$;

-- TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    contact_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    due_date DATE NOT NULL,
    status public.task_status_enum NOT NULL,
    priority public.task_priority_enum NOT NULL,
    description TEXT,
    assignee_id TEXT,
    lead_id TEXT,
    opportunity_id TEXT,
    project_id TEXT,
    case_id TEXT,
    media_file_ids TEXT[],
    time_entry_ids TEXT[]
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- MEDIA FILE TYPE ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_file_type_enum') THEN
        CREATE TYPE public.media_file_type_enum AS ENUM ('image', 'video', 'document');
    END IF;
END$$;

-- MEDIA FILES TABLE
CREATE TABLE IF NOT EXISTS public.media_files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type public.media_file_type_enum NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL
);
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- NOTES TABLE
CREATE TABLE IF NOT EXISTS public.notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- INVOICE STATUS ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status_enum') THEN
        CREATE TYPE public.invoice_status_enum AS ENUM ('Draft', 'Sent', 'Paid', 'Overdue', 'Partially Paid');
    END IF;
END$$;

-- INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    contact_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status public.invoice_status_enum NOT NULL,
    line_items JSONB,
    payments JSONB
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- EMAIL TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.email_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    placeholders TEXT[]
);
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- FEATURE ADDONS TABLE
CREATE TABLE IF NOT EXISTS public.feature_addons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    monthly_price NUMERIC NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE
);
ALTER TABLE public.feature_addons ENABLE ROW LEVEL SECURITY;

-- FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id TEXT NOT NULL,
    following_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES public.profiles(id),
    FOREIGN KEY (following_id) REFERENCES public.profiles(id)
);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- LIKES TABLE
CREATE TABLE IF NOT EXISTS public.likes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id TEXT,
    comment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    FOREIGN KEY (user_id) REFERENCES public.profiles(id),
    FOREIGN KEY (post_id) REFERENCES public.posts(id),
    FOREIGN KEY (comment_id) REFERENCES public.comments(id)
);
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    parent_id TEXT,
    FOREIGN KEY (post_id) REFERENCES public.posts(id),
    FOREIGN KEY (user_id) REFERENCES public.profiles(id),
    FOREIGN KEY (parent_id) REFERENCES public.comments(id)
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- TAGS TABLE
CREATE TABLE IF NOT EXISTS public.tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- CONVERSATION TYPE & LINKED RECORD TYPE ENUMS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_type_enum') THEN
        CREATE TYPE public.conversation_type_enum AS ENUM ('channel', 'dm');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'linked_record_type_enum') THEN
        CREATE TYPE public.linked_record_type_enum AS ENUM ('Opportunity', 'Contact');
    END IF;
END$$;

-- CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
    id TEXT PRIMARY KEY,
    type public.conversation_type_enum NOT NULL,
    name TEXT NOT NULL,
    participant_ids TEXT[] NOT NULL,
    last_message TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL,
    unread_count INT DEFAULT 0,
    avatar_url TEXT,
    description TEXT,
    linked_record_type public.linked_record_type_enum,
    linked_record_name TEXT,
    creator_id TEXT,
    ticket_id TEXT
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    text TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,
    parent_id TEXT,
    attachment_id TEXT
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- INSIGHT PRIORITY ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'insight_priority_enum') THEN
        CREATE TYPE public.insight_priority_enum AS ENUM ('high', 'medium', 'low');
    END IF;
END$$;

-- AI INSIGHTS TABLE
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id TEXT PRIMARY KEY,
    emoji TEXT NOT NULL,
    text TEXT NOT NULL,
    priority public.insight_priority_enum NOT NULL
);
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- CASE TASKS TABLE
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status_enum') THEN
        CREATE TYPE public.task_status_enum AS ENUM ('To Do', 'In Progress', 'Completed');
    END IF;
END$$;
CREATE TABLE IF NOT EXISTS public.case_tasks (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    title TEXT NOT NULL,
    assignee_id TEXT NOT NULL,
    due_date DATE NOT NULL,
    status public.task_status_enum NOT NULL
);
ALTER TABLE public.case_tasks ENABLE ROW LEVEL SECURITY;

-- PROJECT TASKS TABLE
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status_enum') THEN
        CREATE TYPE public.task_status_enum AS ENUM ('To Do', 'In Progress', 'Completed');
    END IF;
END$$;
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    assignee_id TEXT NOT NULL,
    due_date DATE NOT NULL,
    status public.task_status_enum NOT NULL
);
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- TIME ENTRY STATUS ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'time_entry_status_enum') THEN
        CREATE TYPE public.time_entry_status_enum AS ENUM ('Unbilled', 'Invoiced');
    END IF;
END$$;

-- TIME ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.time_entries (
    id TEXT PRIMARY KEY,
    contact_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    date DATE NOT NULL,
    duration NUMERIC NOT NULL,
    description TEXT,
    is_billable BOOLEAN NOT NULL,
    status public.time_entry_status_enum NOT NULL,
    hourly_rate NUMERIC,
    task_id TEXT,
    user_id TEXT
);
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- SAAS SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.saas_settings (
    id TEXT PRIMARY KEY DEFAULT 'global_settings',
    sendgrid_api_key TEXT
);
ALTER TABLE public.saas_settings ENABLE ROW LEVEL SECURITY;

-- SUBSCRIPTION STATUS ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status_enum') THEN
        CREATE TYPE public.subscription_status_enum AS ENUM ('Paid', 'Failed');
    END IF;
END$$;

-- SUBSCRIPTION INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.subscription_invoices (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    plan_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status public.subscription_status_enum NOT NULL
);
ALTER TABLE public.subscription_invoices ENABLE ROW LEVEL SECURITY;

-- SUPPORT TICKET STATUS ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_ticket_status_enum') THEN
        CREATE TYPE public.support_ticket_status_enum AS ENUM ('Open', 'Resolved', 'Closed');
    END IF;
END$$;

-- SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    description TEXT,
    submitter_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    status public.support_ticket_status_enum NOT NULL
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- COMPANY PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.company_profile (
    id TEXT PRIMARY KEY DEFAULT 'main_profile',
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    country TEXT,
    phone TEXT,
    website TEXT,
    logo_url TEXT
);
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;

-- ESTIMATE STATUS ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estimate_status_enum') THEN
        CREATE TYPE public.estimate_status_enum AS ENUM ('Draft', 'Sent', 'Accepted', 'Declined', 'Invoiced');
    END IF;
END$$;

-- ESTIMATES TABLE
CREATE TABLE IF NOT EXISTS public.estimates (
    id TEXT PRIMARY KEY,
    estimate_number TEXT UNIQUE NOT NULL,
    contact_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status public.estimate_status_enum NOT NULL,
    line_items JSONB
);
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;

-- LEAD STATUS ENUM
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status_enum') THEN
        CREATE TYPE public.lead_status_enum AS ENUM ('New', 'Contacted', 'Qualified', 'Lost', 'Converted');
    END IF;
END$$;

-- LEADS TABLE
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    score INT,
    status public.lead_status_enum NOT NULL,
    last_contacted TEXT,
    contact_id TEXT
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Add more table definitions and seed data below as needed.
