# invoices.sql

This file contains the schema and seed data for the `invoices` table. It's used for client billing and tracking payments.

```sql
-- Create custom enum type for invoice statuses
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status_enum') THEN
        CREATE TYPE invoice_status_enum AS ENUM ('Draft', 'Sent', 'Paid', 'Overdue', 'Partially Paid');
    END IF;
END$$;

-- Schema for the invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    contact_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status invoice_status_enum NOT NULL,
    line_items JSONB, -- Storing line items as JSON
    payments JSONB -- Storing payments as JSON
);

-- Seed data for the invoices table
INSERT INTO invoices (id, invoice_number, contact_id, contact_name, total_amount, issue_date, due_date, status, payments) VALUES
('inv1', 'INV-2024-001', 'c5', 'Eva Chen', 15000, '2024-06-20', '2024-07-20', 'Paid', '[{"id": "pay1", "amount": 15000, "date": "2024-07-19", "method": "Credit Card"}]'),
('inv2', 'INV-2024-002', 'c1', 'Alana Patel', 25000, '2024-07-01', '2024-07-31', 'Partially Paid', '[{"id": "pay2", "amount": 10000, "date": "2024-07-15", "method": "Bank Transfer"}]'),
('inv3', 'INV-2024-003', 'c2', 'Ben Carter', 55000, '2024-07-15', '2024-08-15', 'Draft', '[]'),
('inv4', 'INV-2024-004', 'c4', 'David Lee', 40000, '2024-05-30', '2024-06-30', 'Overdue', '[]'),
('inv5', 'INV-2024-005', 'l2', 'Grace Hall', 30000, '2024-07-18', '2024-08-18', 'Sent', '[]');
```