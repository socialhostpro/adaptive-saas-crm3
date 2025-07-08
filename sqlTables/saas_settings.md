# saas_settings.sql

This file contains the schema and seed data for the `saas_settings` table. It stores platform-wide settings for the SaaS administrator, such as third-party API keys.

```sql
-- Schema for the saas_settings table
CREATE TABLE IF NOT EXISTS saas_settings (
    id TEXT PRIMARY KEY DEFAULT 'global_settings',
    sendgrid_api_key TEXT
);

-- Seed data for the saas_settings table
INSERT INTO saas_settings (id, sendgrid_api_key) VALUES
('global_settings', 'SG.xxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
```