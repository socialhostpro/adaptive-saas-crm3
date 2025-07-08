# chat_messages.sql

This file contains the schema and seed data for the `chat_messages` table. It stores individual messages belonging to conversations.

```sql
-- Schema for the chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    text TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,
    parent_id TEXT,
    attachment_id TEXT -- references media_files table
);

-- Seed data for the chat_messages table
-- Note: Timestamps are hardcoded for consistency.
INSERT INTO chat_messages (id, conversation_id, sender_id, text, "timestamp") VALUES
('msg1-1', 'conv1', 'tm3', 'Morning team! Any new updates on the Q3 leads?', '2024-07-26T21:10:46Z'),
('msg1-2', 'conv1', 'user', 'I just spoke with _Global Exports_, they are very interested. @Blake Lively can you follow up?', '2024-07-26T21:15:46Z'),
('msg1-3', 'conv1', 'tm5', 'On it. I''ll schedule a call for this afternoon.', '2024-07-26T21:20:46Z'),
('msg1-4', 'conv1', 'user', '*Excellent.*', '2024-07-26T21:30:46Z');

INSERT INTO chat_messages (id, conversation_id, sender_id, text, "timestamp") VALUES
('msg2-1', 'conv2', 'tm2', 'Hey, I''ve reviewed the draft for the client presentation. It looks solid, just a few minor tweaks needed.', '2024-07-26T20:50:46Z'),
('msg2-2', 'conv2', 'user', 'Great, what did you have in mind?', '2024-07-26T20:51:46Z');

INSERT INTO chat_messages (id, conversation_id, sender_id, text, "timestamp", parent_id) VALUES
('msg2-3', 'conv2', 'tm2', 'Let''s add a slide on competitor analysis. I think that will really strengthen our position.', '2024-07-26T20:55:46Z', 'msg2-2'),
('msg2-4', 'conv2', 'user', 'Good idea. I''ll work on that now.', '2024-07-26T20:57:46Z', 'msg2-3');

INSERT INTO chat_messages (id, conversation_id, sender_id, text, "timestamp", attachment_id) VALUES
('msg2-5', 'conv2', 'user', 'Perfect, I''ve attached the final version.', '2024-07-26T21:05:46Z', 'mf6');

INSERT INTO chat_messages (id, conversation_id, sender_id, text, "timestamp", attachment_id) VALUES
('msg3-1', 'conv3', 'user', 'Hi Ben, following up on our discussion. Here is the service contract for the cloud migration.', '2024-07-26T18:35:46Z', 'mf3');

INSERT INTO chat_messages (id, conversation_id, sender_id, text, "timestamp") VALUES
('msg3-2', 'conv3', 'c2', 'Thanks! I''ll review this with my team and get back to you shortly.', '2024-07-26T19:05:46Z'),
('msg3-3', 'conv3', 'c2', 'The proposal for the new system looks great.', '2024-07-26T19:35:46Z');
```