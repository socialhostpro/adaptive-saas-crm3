# conversations.sql

This file contains the schema and seed data for the `conversations` table, which defines chat channels and direct messages.

```sql
-- Create custom enum types for conversation metadata
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_type_enum') THEN
        CREATE TYPE conversation_type_enum AS ENUM ('channel', 'dm');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'linked_record_type_enum') THEN
        CREATE TYPE linked_record_type_enum AS ENUM ('Opportunity', 'Contact');
    END IF;
END$$;

-- Schema for the conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    type conversation_type_enum NOT NULL,
    name TEXT NOT NULL,
    participant_ids TEXT[] NOT NULL,
    last_message TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL,
    unread_count INT DEFAULT 0,
    avatar_url TEXT,
    description TEXT,
    linked_record_type linked_record_type_enum,
    linked_record_name TEXT,
    creator_id TEXT,
    ticket_id TEXT
);

-- Seed data for the conversations table
INSERT INTO conversations (id, type, name, participant_ids, creator_id, description, last_message, "timestamp", unread_count) VALUES
('conv1', 'channel', '#q3-sales-push', ARRAY['user', 'tm3', 'tm4', 'tm5'], 'user', '4 Members', 'Great, let''s circle back on Friday.', '2024-07-26T21:30:46Z', 2),
('conv4', 'channel', '#project-synergy', ARRAY['user', 'tm2', 'tm3', 'c4'], 'tm2', 'Client & Internal Team', 'Can you provide an update on the wireframes?', '2024-07-25T21:35:46Z', 0);

INSERT INTO conversations (id, type, name, participant_ids, avatar_url, description, last_message, "timestamp", unread_count) VALUES
('conv2', 'dm', 'Ryan Reynolds', ARRAY['user', 'tm2'], 'https://picsum.photos/seed/tm2/100/100', 'Manager', 'Perfect, I''ve attached the final version.', '2024-07-26T21:05:46Z', 0);

INSERT INTO conversations (id, type, name, participant_ids, avatar_url, description, last_message, "timestamp", unread_count, linked_record_type, linked_record_name) VALUES
('conv3', 'dm', 'Ben Carter', ARRAY['user', 'c2'], 'https://picsum.photos/seed/2/100/100', 'TechSolutions CEO', 'The proposal for the new system looks great.', '2024-07-26T19:35:46Z', 1, 'Opportunity', 'Cloud Migration Service');
```