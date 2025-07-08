# case_tasks.sql

This file contains the schema and seed data for the `case_tasks` table. It stores tasks that are specifically linked to a legal case.

```sql
-- Ensure task_status enum exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status_enum') THEN
        CREATE TYPE task_status_enum AS ENUM ('To Do', 'In Progress', 'Completed');
    END IF;
END$$;

-- Schema for the case_tasks table
CREATE TABLE IF NOT EXISTS case_tasks (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    title TEXT NOT NULL,
    assignee_id TEXT NOT NULL,
    due_date DATE NOT NULL,
    status task_status_enum NOT NULL
);

-- Seed data for the case_tasks table
INSERT INTO case_tasks (id, case_id, title, assignee_id, due_date, status) VALUES
('ctask1', 'case1', 'File motion for summary judgment', 'tm2', '2024-08-20', 'In Progress'),
('ctask2', 'case1', 'Deposition of opposing CEO', 'user', '2024-09-05', 'To Do'),
('ctask3', 'case2', 'Collect all medical records', 'user', '2024-08-01', 'To Do'),
('ctask4', 'case3', 'Finalize settlement agreement', 'tm4', '2024-06-25', 'Completed');
```