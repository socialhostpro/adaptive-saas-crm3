# estimates.sql

This file contains the schema and seed data for the `estimates` table. It is used for creating and tracking sales quotes or estimates before they become invoices.

```sql
-- Create custom enum type for estimate statuses
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estimate_status_enum') THEN
        CREATE TYPE estimate_status_enum AS ENUM ('Draft', 'Sent', 'Accepted', 'Declined', 'Invoiced');
    END IF;
END$$;

-- Schema for the estimates table
CREATE TABLE IF NOT EXISTS estimates (
    id TEXT PRIMARY KEY,
    estimate_number TEXT UNIQUE NOT NULL,
    contact_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status estimate_status_enum NOT NULL,
    line_items JSONB -- Storing line items as JSON
);

-- Seed data for the estimates table
INSERT INTO estimates (id, estimate_number, contact_id, contact_name, amount, issue_date, expiry_date, status) VALUES
('est1', 'EST-2024-001', 'c3', 'Carla Rodriguez', 72000, '2024-07-10', '2024-08-10', 'Sent'),
('est2', 'EST-2024-002', 'c4', 'David Lee', 40000, '2024-07-12', '2024-08-12', 'Accepted'),
('est3', 'EST-2024-003', 'c1', 'Alana Patel', 25000, '2024-07-15', '2024-08-15', 'Draft'),
('est4', 'EST-2024-004', 'l1', 'Frank Green', 12000, '2024-06-25', '2024-07-25', 'Declined'),
('est5', 'EST-2024-005', 'c5', 'Eva Chen', 15000, '2024-06-01', '2024-07-01', 'Invoiced');
```