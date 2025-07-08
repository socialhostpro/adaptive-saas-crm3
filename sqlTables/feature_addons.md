# feature_addons.sql

This file contains the schema and seed data for the `feature_addons` table. It is used by the company owner to enable or disable specific paid features for their account.

```sql
-- Schema for the feature_addons table
CREATE TABLE IF NOT EXISTS feature_addons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    monthly_price NUMERIC NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE
);

-- Seed data for the feature_addons table
INSERT INTO feature_addons (id, name, description, monthly_price, is_enabled) VALUES
('addon1', 'Advanced AI Analytics', 'Unlock deeper insights with AI-powered reporting and forecasting.', 99, true),
('addon2', 'Dedicated Legal Case Management', 'A full suite of tools for managing legal cases, documents, and client communication.', 79, true),
('addon3', 'Priority Support & Onboarding', 'Get a dedicated account manager and priority access to our support team.', 149, false),
('addon4', 'Client Portal Access', 'Allow your clients to log in to view project progress and invoices.', 59, false);
```