# company_profile.sql

This file contains the schema and seed data for the `company_profile` table. It stores the main details of the user's company.

```sql
-- Schema for the company_profile table
CREATE TABLE IF NOT EXISTS company_profile (
    id TEXT PRIMARY KEY DEFAULT 'main_profile', -- Assuming a single company profile per instance
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

-- Seed data for the company_profile table
INSERT INTO company_profile (name, address, city, state, zip, country, phone, website, logo_url) VALUES
('Adaptive Solutions LLC', '123 Innovation Drive', 'Techville', 'CA', '94043', 'USA', '555-0199', 'https://adaptivesolutions.dev', 'https://tailwindui.com/img/logos/mark.svg?color=sky&shade=500');
```