# opportunities.sql

This file contains the schema and seed data for the `opportunities` table, used for tracking sales deals through a pipeline.

```sql
-- Create custom enum type for opportunity stages
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'opportunity_stage_enum') THEN
        CREATE TYPE opportunity_stage_enum AS ENUM ('Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed - Won', 'Closed - Lost');
    END IF;
END$$;

-- Schema for the opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    contact_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    value NUMERIC NOT NULL,
    stage opportunity_stage_enum NOT NULL,
    close_date DATE NOT NULL,
    assignee_id TEXT
);

-- Seed data for the opportunities table
INSERT INTO opportunities (id, title, contact_id, contact_name, value, stage, close_date, assignee_id) VALUES
('o1', 'Website Redesign Project', 'c1', 'Alana Patel', 25000, 'Proposal', '2024-08-30', 'tm3'),
('o2', 'Cloud Migration Service', 'c2', 'Ben Carter', 55000, 'Negotiation', '2024-07-25', 'tm2'),
('o3', 'Data Analytics Platform', 'c3', 'Carla Rodriguez', 72000, 'Qualification', '2024-09-15', 'user'),
('o4', 'Mobile App Development', 'c4', 'David Lee', 40000, 'Prospecting', '2024-10-01', 'tm5'),
('o5', 'Q3 Sales Training', 'c5', 'Eva Chen', 15000, 'Closed - Won', '2024-06-28', 'tm3'),
('o6', 'API Integration', 'l3', 'Henry Ito', 18000, 'Qualification', '2024-08-20', 'tm4'),
('o7', 'IT Support Contract', 'l2', 'Grace Hall', 30000, 'Proposal', '2024-07-31', 'user'),
('o8', 'Initial Consultation', 'l5', 'Jack Miller', 5000, 'Prospecting', '2024-08-05', 'tm5');
```