# team_members.sql

This file contains the schema and seed data for the `team_members` table, storing information about all users in the company account.

```sql
-- Create custom enum types for team member role and status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_member_role_enum') THEN
        CREATE TYPE team_member_role_enum AS ENUM ('Admin', 'Manager', 'Sales Rep', 'Super Admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_member_status_enum') THEN
        CREATE TYPE team_member_status_enum AS ENUM ('Online', 'Away', 'Offline');
    END IF;
END$$;

-- Schema for the team_members table
CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role team_member_role_enum NOT NULL,
    avatar_url TEXT,
    status team_member_status_enum NOT NULL,
    last_seen TEXT,
    phone TEXT,
    hire_date DATE,
    voice_settings JSONB
);

-- Seed data for the team_members table
INSERT INTO team_members (id, name, email, role, avatar_url, status, last_seen, phone, hire_date, voice_settings) VALUES
('user', 'Taylor Swift', 'taylor.s@adaptiverm.com', 'Super Admin', 'https://picsum.photos/seed/user/100/100', 'Online', 'Online', '555-0110', '2022-01-15', '{"voiceURI": "default", "rate": 1, "pitch": 1}'),
('tm2', 'Ryan Reynolds', 'ryan.r@adaptiverm.com', 'Super Admin', 'https://picsum.photos/seed/tm2/100/100', 'Online', 'Online', '555-0111', '2021-03-20', NULL),
('tm3', 'Blake Lively', 'blake.l@adaptiverm.com', 'Sales Rep', 'https://picsum.photos/seed/tm3/100/100', 'Away', '15m ago', '555-0112', '2022-08-01', NULL),
('tm4', 'Hugh Jackman', 'hugh.j@adaptiverm.com', 'Sales Rep', 'https://picsum.photos/seed/tm4/100/100', 'Offline', '2h ago', '555-0113', '2023-05-10', NULL),
('tm5', 'Zendaya', 'zendaya@adaptiverm.com', 'Sales Rep', 'https://picsum.photos/seed/tm5/100/100', 'Online', 'Online', '555-0114', '2023-09-01', NULL);
```