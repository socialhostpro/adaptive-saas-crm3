# cases.sql

This file contains the schema and seed data for the `cases` table, designed for legal case management.

```sql
-- Create custom enum type for case statuses
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_status_enum') THEN
        CREATE TYPE case_status_enum AS ENUM ('Intake', 'Discovery', 'In Trial', 'On Hold', 'Closed - Won', 'Closed - Lost');
    END IF;
END$$;

-- Schema for the cases table
CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    case_number TEXT NOT NULL,
    contact_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    attorney_id TEXT NOT NULL,
    status case_status_enum NOT NULL,
    open_date DATE NOT NULL,
    close_date DATE,
    description TEXT,
    media_file_ids TEXT[]
);

-- Seed data for the cases table
INSERT INTO cases (id, name, case_number, contact_id, contact_name, attorney_id, status, open_date, description, media_file_ids) VALUES
('case1', 'Innovate Inc. vs. Competitor Co.', 'CIV-2024-001', 'c1', 'Alana Patel', 'tm2', 'Discovery', '2024-05-10', 'Intellectual property dispute regarding marketing materials.', ARRAY['mf3']),
('case2', 'Carter Personal Injury Claim', 'PI-2024-052', 'c2', 'Ben Carter', 'user', 'Intake', '2024-07-15', 'Claim regarding a slip and fall incident at a commercial property.', ARRAY[]),
('case3', 'DataTech Employment Contract Review', 'EMP-2024-113', 'c3', 'Carla Rodriguez', 'tm4', 'Closed - Won', '2024-04-01', 'Review and negotiation of employment contract terms for a senior developer.', ARRAY[]);

UPDATE cases SET close_date = '2024-06-30' WHERE id = 'case3';
```