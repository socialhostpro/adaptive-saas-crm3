# leads.sql

This file contains the schema and seed data for the `leads` table, which tracks potential new customers before they become qualified contacts.

```sql
-- Create custom enum type for lead statuses
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status_enum') THEN
        CREATE TYPE lead_status_enum AS ENUM ('New', 'Contacted', 'Qualified', 'Lost', 'Converted');
    END IF;
END$$;

-- Schema for the leads table
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    score INT,
    status lead_status_enum NOT NULL,
    last_contacted TEXT,
    contact_id TEXT
);

-- Seed data for the leads table
INSERT INTO leads (id, name, company, email, score, status, last_contacted, contact_id) VALUES
('l1', 'Frank Green', 'Global Exports', 'frank.g@globalexports.com', 85, 'Contacted', '2 days ago', NULL),
('l2', 'Grace Hall', 'HealthFirst Clinic', 'grace.h@healthfirst.org', 92, 'Qualified', '1 day ago', 'c2'),
('l3', 'Henry Ito', 'NextGen AI', 'henry.i@nextgenai.dev', 78, 'New', '5 days ago', NULL),
('l4', 'Isla King', 'Quantum Computing Inc', 'isla.k@quantum.com', 65, 'Lost', '1 week ago', NULL),
('l5', 'Jack Miller', 'Creative Solutions', 'jack.m@creatives.co', 88, 'Contacted', '3 hours ago', NULL);
```