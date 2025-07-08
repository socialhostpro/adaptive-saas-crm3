# tasks.sql

This file contains the schema and seed data for the `tasks` table. It stores all tasks related to contacts, leads, opportunities, etc.

```sql
-- Create custom enum types for task status and priority
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status_enum') THEN
        CREATE TYPE task_status_enum AS ENUM ('To Do', 'In Progress', 'Completed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority_enum') THEN
        CREATE TYPE task_priority_enum AS ENUM ('Low', 'Medium', 'High');
    END IF;
END$$;

-- Schema for the tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    contact_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    due_date DATE NOT NULL,
    status task_status_enum NOT NULL,
    priority task_priority_enum NOT NULL,
    description TEXT,
    assignee_id TEXT,
    lead_id TEXT,
    opportunity_id TEXT,
    project_id TEXT,
    case_id TEXT,
    media_file_ids TEXT[],
    time_entry_ids TEXT[]
);

-- Seed data for the tasks table
INSERT INTO tasks (id, title, contact_id, contact_name, due_date, status, priority, description, assignee_id, opportunity_id, media_file_ids, time_entry_ids) VALUES
('t1', 'Follow up on proposal with Innovate Inc.', 'c1', 'Alana Patel', '2024-08-15', 'To Do', 'High', 'Client is waiting for the updated proposal. Make sure to include the new timeline and budget.', 'user', 'o1', ARRAY['mf1'], ARRAY['te1', 'te2']),
('t2', 'Prepare for Q3 review meeting', 'c2', 'Ben Carter', '2024-07-22', 'In Progress', 'High', 'Gather all sales data and create presentation slides.', 'tm2', 'o2', NULL, ARRAY['te3']),
('t3', 'Onboard new developer with DataTech', 'c3', 'Carla Rodriguez', '2024-07-10', 'Completed', 'Medium', NULL, 'tm4', NULL, NULL, NULL),
('t4', 'Schedule a demo call with Synergy Co.', 'c4', 'David Lee', '2024-07-25', 'To Do', 'Medium', 'David is interested in seeing the new mobile app features.', 'tm5', 'o4', NULL, NULL),
('t5', 'Review Q2 sales report with CloudWave', 'c5', 'Eva Chen', '2024-07-01', 'Completed', 'Low', NULL, 'user', NULL, NULL, NULL),
('t6', 'Draft a new service level agreement', 'c2', 'Ben Carter', '2024-07-18', 'To Do', 'High', NULL, 'tm2', NULL, NULL, NULL),
('t7', 'Send welcome kit to Frank', 'l1', 'Frank Green', '2024-08-10', 'To Do', 'Medium', NULL, 'tm3', NULL, NULL, NULL),
('t8', 'Review discovery documents', 'c1', 'Alana Patel', '2024-08-25', 'To Do', 'High', NULL, 'user', NULL, ARRAY['mf3'], NULL),
('t9', 'Client follow-up call', 'c2', 'Ben Carter', '2024-08-28', 'To Do', 'Medium', NULL, 'tm2', NULL, NULL, ARRAY['te6']);

UPDATE tasks SET lead_id = 'l2' WHERE id = 't6';
UPDATE tasks SET lead_id = 'l1' WHERE id = 't7';
UPDATE tasks SET case_id = 'case1' WHERE id = 't8';
UPDATE tasks SET project_id = 'proj2' WHERE id = 't9';
```