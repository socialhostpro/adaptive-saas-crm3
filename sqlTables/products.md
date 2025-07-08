# products.sql

This file contains the schema and seed data for the `products` table. It stores the company's products and services that can be added to invoices and estimates.

```sql
-- Schema for the products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image_url TEXT
);

-- Seed data for the products table
INSERT INTO products (id, name, description, price, image_url) VALUES
('prod1', 'Standard Website Package', 'Includes 5 pages, basic SEO, and contact form.', 5000, 'https://picsum.photos/seed/prod1/400/300'),
('prod2', 'Premium Cloud Hosting', '1-year premium hosting with 99.9% uptime.', 1200, 'https://picsum.photos/seed/prod2/400/300'),
('prod3', 'SEO & Marketing Plan', 'Monthly SEO and content marketing services.', 2500, 'https://picsum.photos/seed/prod3/400/300'),
('prod4', 'Hourly Consulting', 'Technical or business consulting.', 150, 'https://picsum.photos/seed/prod4/400/300'),
('prod5', 'Enterprise Software License', '1-year license for up to 50 users.', 15000, 'https://picsum.photos/seed/prod5/400/300');
```