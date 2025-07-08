# time_entries.sql

This file contains the schema and seed data for the `time_entries` table, used for logging and billing time against contacts and tasks.

```sql
-- Create custom enum type for time entry status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'time_entry_status_enum') THEN
        CREATE TYPE time_entry_status_enum AS ENUM ('Unbilled', 'Invoiced');
    END IF;
END$$;

-- Schema for the time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
    id TEXT PRIMARY KEY,
    contact_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    date DATE NOT NULL,
    duration NUMERIC NOT NULL, -- in hours
    description TEXT,
    is_billable BOOLEAN NOT NULL,
    status time_entry_status_enum NOT NULL,
    hourly_rate NUMERIC,
    task_id TEXT,
    user_id TEXT
);

-- Seed data for the time_entries table
INSERT INTO time_entries (id, contact_id, contact_name, date, duration, description, is_billable, status, hourly_rate, task_id, user_id) VALUES
('te1', 'c1', 'Alana Patel', '2024-07-20', 2.5, 'Consultation call for website redesign', true, 'Unbilled', 150, 't1', 'user'),
('te2', 'c1', 'Alana Patel', '2024-07-21', 5, 'Initial design mockups', true, 'Unbilled', 150, 't1', 'user'),
('te3', 'c2', 'Ben Carter', '2024-07-22', 3, 'Cloud migration planning session', true, 'Invoiced', 200, 't2', 'tm2'),
('te4', 'c4', 'David Lee', '2024-07-22', 1.5, 'Internal project sync', false, 'Unbilled', NULL, NULL, 'tm5'),
('te5', 'c1', 'Alana Patel', '2024-07-23', 4, 'Implementing feedback on mockups', true, 'Unbilled', 150, NULL, 'tm3'),
('te6', 'c2', 'Ben Carter', '2024-07-24', 1, 'Follow up call re: migration', true, 'Unbilled', 200, 't9', 'tm2');
```