# messages.sql

This file contains the schema for the `messages` table.

```sql
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    recipient_id TEXT NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (sender_id) REFERENCES profiles(id),
    FOREIGN KEY (recipient_id) REFERENCES profiles(id)
);
```
