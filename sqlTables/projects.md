# projects.sql

This file contains the schema and seed data for the `projects` table, used for project management.

```sql
-- Create custom enum type for project statuses
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status_enum') THEN
        CREATE TYPE project_status_enum AS ENUM ('Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled');
    END IF;
END$$;

-- Schema for the projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    contact_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    deadline DATE NOT NULL,
    budget NUMERIC,
    status project_status_enum NOT NULL,
    media_file_ids TEXT[]
);

-- Seed data for the projects table
INSERT INTO projects (id, name, description, contact_id, contact_name, deadline, budget, status, media_file_ids) VALUES
('proj1', 'Innovate Inc. Website Redesign', 'Complete overhaul of the corporate website, including a new CMS and e-commerce functionality.', 'c1', 'Alana Patel', '2024-10-31', 25000, 'In Progress', ARRAY['mf1', 'mf4']),
('proj2', 'TechSolutions Cloud Platform', 'Migration of all on-premise servers to a new scalable cloud infrastructure.', 'c2', 'Ben Carter', '2024-09-30', 55000, 'In Progress', ARRAY['mf5']),
('proj3', 'DataTech Analytics Dashboard', 'Development of a new internal dashboard for real-time data visualization.', 'c3', 'Carla Rodriguez', '2024-12-01', 72000, 'Not Started', ARRAY[]),
('proj4', 'Synergy Mobile App', 'Build a cross-platform mobile application for customer engagement.', 'c4', 'David Lee', '2025-01-15', 40000, 'On Hold', ARRAY[]);
```