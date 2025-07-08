# support_tickets.sql

This file contains the schema and seed data for the `support_tickets` table, which tracks customer support requests.

```sql
-- Create custom enum type for support ticket status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_ticket_status_enum') THEN
        CREATE TYPE support_ticket_status_enum AS ENUM ('Open', 'Resolved', 'Closed');
    END IF;
END$$;

-- Schema for the support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    description TEXT,
    submitter_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    status support_ticket_status_enum NOT NULL
);

-- Seed data for the support_tickets table
-- This table starts empty in the mock data.
-- Example insert:
-- INSERT INTO support_tickets (id, subject, description, submitter_id, created_at, status) VALUES
-- ('ticket-1', 'Cannot connect to Stripe', 'I am trying to connect my Stripe account but keep getting an error message.', 'user', '2024-07-26T20:00:00Z', 'Open');
```