-- Migration: Add file_name, name, and description columns to media_files
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS file_name TEXT NOT NULL DEFAULT '';
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS description TEXT;

-- If you want to backfill file_name and name for existing rows, you can run:
-- UPDATE media_files SET file_name = split_part(url, '/', array_length(string_to_array(url, '/'), 1)) WHERE file_name = '';
-- UPDATE media_files SET name = file_name WHERE name = '';
