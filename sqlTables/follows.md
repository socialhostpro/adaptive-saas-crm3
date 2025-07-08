# follows.sql

This file contains the schema for the `follows` table.

```sql
CREATE TABLE IF NOT EXISTS follows (
    follower_id TEXT NOT NULL,
    following_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES profiles(id),
    FOREIGN KEY (following_id) REFERENCES profiles(id)
);
```
