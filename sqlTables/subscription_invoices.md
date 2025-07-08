# subscription_invoices.sql

This file contains the schema and seed data for the `subscription_invoices` table. It's used for managing the company's SaaS subscription billing.

```sql
-- Create custom enum type for subscription status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status_enum') THEN
        CREATE TYPE subscription_status_enum AS ENUM ('Paid', 'Failed');
    END IF;
END$$;

-- Schema for the subscription_invoices table
CREATE TABLE IF NOT EXISTS subscription_invoices (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    plan_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status subscription_status_enum NOT NULL
);

-- Seed data for the subscription_invoices table
INSERT INTO subscription_invoices (id, date, plan_name, amount, status) VALUES
('subinv1', '2024-07-01', 'Pro Plan', 249.00, 'Paid'),
('subinv2', '2024-06-01', 'Pro Plan', 249.00, 'Paid'),
('subinv3', '2024-05-01', 'Pro Plan', 249.00, 'Paid'),
('subinv4', '2024-04-01', 'Standard Plan', 149.00, 'Paid');
```