# activities.sql

This file contains the schema and seed data for the `activities` table. It tracks user interactions like calls, emails, meetings, and notes.

```sql
-- Create custom enum type for activity types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type_enum') THEN
        CREATE TYPE activity_type_enum AS ENUM ('Call', 'Email', 'Meeting', 'Note');
    END IF;
END$$;

-- Schema for the activities table
CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    type activity_type_enum NOT NULL,
    contact_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    summary TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,
    duration INT,
    outcome TEXT,
    subject TEXT,
    location TEXT,
    end_time TIMESTAMPTZ,
    lead_id TEXT
);

-- Seed data for the activities table
-- Note: Timestamps are hardcoded for consistency.
INSERT INTO activities (id, type, contact_id, contact_name, summary, "timestamp", subject) VALUES
('a1', 'Email', 'c1', 'Alana Patel', 'Sent over the final proposal documents for the new website design. She will review with her team and get back to us by Friday.', '2024-07-26T19:30:00Z', 'Proposal for Website Redesign');

INSERT INTO activities (id, type, contact_id, contact_name, summary, "timestamp", duration, outcome, lead_id) VALUES
('a2', 'Call', 'c2', 'Ben Carter', 'Follow-up call regarding cloud services. He had a few questions about our security protocols which I answered. He seems confident in our solution.', '2024-07-26T16:30:00Z', 15, 'Positive', 'l2');

INSERT INTO activities (id, type, contact_id, contact_name, summary, "timestamp", location, end_time) VALUES
('a3', 'Meeting', 'c5', 'Eva Chen', 'Q3 sales strategy kickoff. We aligned on targets and discussed the new commission structure. Team is motivated.', '2024-07-25T21:30:00Z', 'Boardroom C / Zoom', '2024-07-25T22:30:00Z');

INSERT INTO activities (id, type, contact_id, contact_name, summary, "timestamp") VALUES
('a4', 'Note', 'c3', 'Carla Rodriguez', 'Carla is a key decision-maker. She mentioned offhand that their current analytics dashboard is slow and lacks key features we offer. This could be a major upsell opportunity in Q4.', '2024-07-24T21:30:00Z');

INSERT INTO activities (id, type, contact_id, contact_name, summary, "timestamp", duration, outcome, lead_id) VALUES
('a5', 'Call', 'l1', 'Frank Green', 'Initial discovery call with Frank. He is looking for a new shipping logistics partner.', '2024-07-24T21:30:00Z', 30, 'Positive', 'l1');
```