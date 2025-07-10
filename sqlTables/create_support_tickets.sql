-- Migration: Create support_tickets table for Supabase/Postgres
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    how_can_we_help text,
    status text NOT NULL DEFAULT 'open',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for status
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
