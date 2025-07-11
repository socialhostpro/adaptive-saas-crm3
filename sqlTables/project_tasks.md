# ARCHIVED: project_tasks.sql

This table has been replaced by the unified `tasks` table. See Project_Guide.md for details.

```sql
-- Ensure task_status enum exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status_enum') THEN
        CREATE TYPE task_status_enum AS ENUM ('To Do', 'In Progress', 'Completed');
    END IF;
END$$;

-- Schema for the project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    assignee_id TEXT NOT NULL,
    due_date DATE NOT NULL,
    status task_status_enum NOT NULL
);

-- Seed data for the project_tasks table
INSERT INTO project_tasks (id, project_id, title, assignee_id, due_date, status) VALUES
('ptask1', 'proj1', 'Finalize design mockups', 'tm3', '2024-08-15', 'Completed'),
('ptask2', 'proj1', 'Develop frontend components', 'tm5', '2024-09-10', 'In Progress'),
('ptask3', 'proj1', 'Set up CMS backend', 'tm4', '2024-09-20', 'To Do'),
('ptask4', 'proj2', 'Audit existing server infrastructure', 'tm2', '2024-08-10', 'Completed'),
('ptask5', 'proj2', 'Configure cloud environment', 'tm2', '2024-08-25', 'In Progress'),
('ptask6', 'proj2', 'Plan data migration schedule', 'user', '2024-09-05', 'In Progress'),
('ptask7', 'proj2', 'Execute full migration', 'tm2', '2024-09-25', 'To Do'),
('ptask8', 'proj3', 'Gather data source requirements', 'user', '2024-09-01', 'To Do');
```