-- Create custom enum type for media file types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_file_type_enum') THEN
        CREATE TYPE media_file_type_enum AS ENUM ('image', 'video', 'document');
    END IF;
END$$;

-- Schema for the media_files table
CREATE TABLE IF NOT EXISTS media_files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type media_file_type_enum NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL
);

-- Seed data for the media_files table
INSERT INTO media_files (id, name, url, type, uploaded_at) VALUES
('mf1', 'Website Mockup Draft.png', 'https://picsum.photos/seed/mf1/800/600', 'image', '2024-07-25T21:35:46Z'),
('mf2', 'Client Kickoff Presentation.mp4', '#', 'video', '2024-07-24T21:35:46Z'),
('mf3', 'Service Contract.pdf', '#', 'document', '2024-07-23T21:35:46Z'),
('mf4', 'Final Logo Design.png', 'https://tailwindui.com/img/logos/mark.svg?color=sky&shade=500', 'image', '2024-07-22T21:35:46Z'),
('mf5', 'Infrastructure Diagram.pdf', '#', 'document', '2024-07-21T21:35:46Z'),
('mf6', 'Competitor Analysis.png', 'https://picsum.photos/seed/mf6/800/600', 'image', '2024-07-20T21:35:46Z')
ON CONFLICT (id) DO NOTHING;
