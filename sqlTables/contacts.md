# contacts.sql

This file contains the schema and seed data for the `contacts` table, which is a central repository for all customer and lead contact information.

```sql
-- Schema for the contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    title TEXT,
    company TEXT,
    avatar_url TEXT,
    phone TEXT
);

-- Seed data for the contacts table
INSERT INTO contacts (id, name, email, title, company, avatar_url, phone) VALUES
('c1', 'Alana Patel', 'alana.p@examplecorp.com', 'Marketing Director', 'Innovate Inc.', 'https://picsum.photos/seed/1/100/100', '555-0101'),
('c2', 'Ben Carter', 'ben.c@techsolutions.io', 'CEO', 'TechSolutions', 'https://picsum.photos/seed/2/100/100', '555-0102'),
('c3', 'Carla Rodriguez', 'carla.r@datatech.co', 'Lead Developer', 'DataTech', 'https://picsum.photos/seed/3/100/100', '555-0103'),
('c4', 'David Lee', 'david.l@synergy.com', 'Product Manager', 'Synergy Co.', 'https://picsum.photos/seed/4/100/100', NULL),
('c5', 'Eva Chen', 'eva.c@cloudwave.net', 'Sales Manager', 'CloudWave', 'https://picsum.photos/seed/5/100/100', '555-0105');
```