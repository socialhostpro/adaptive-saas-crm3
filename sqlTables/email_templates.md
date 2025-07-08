# email_templates.sql

This file contains the schema and seed data for the `email_templates` table. It stores user-configurable, automated email templates for company use.

```sql
-- Schema for the email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    placeholders TEXT[]
);

-- Seed data for the email_templates table
INSERT INTO email_templates (id, name, description, is_enabled, subject, body, placeholders) VALUES
('tmpl_invoice_sent', 'New Invoice Sent', 'Sent to a client when a new invoice is created and sent.', true, 'New Invoice {{invoice_number}} from {{company_name}}', 'Hi {{customer_name}},\n\nPlease find your new invoice attached.\n\nTotal Due: ${{invoice_total}}\nDue Date: {{invoice_due_date}}\n\nYou can view the invoice online here: {{invoice_link}}\n\nThank you for your business!\n\nBest,\nThe {{company_name}} Team', ARRAY['{{customer_name}}', '{{invoice_number}}', '{{invoice_total}}', '{{invoice_due_date}}', '{{invoice_link}}', '{{company_name}}']),
('tmpl_invoice_due', 'Invoice Due Reminder', 'Sent to a client when their invoice is approaching its due date.', true, 'Reminder: Invoice {{invoice_number}} is due soon', 'Hi {{customer_name}},\n\nThis is a friendly reminder that invoice {{invoice_number}} for ${{invoice_total}} is due on {{invoice_due_date}}.\n\nYou can view and pay the invoice online here: {{invoice_link}}\n\nIf you have already made a payment, please disregard this email.\n\nThanks,\nThe {{company_name}} Team', ARRAY['{{customer_name}}', '{{invoice_number}}', '{{invoice_total}}', '{{invoice_due_date}}', '{{invoice_link}}', '{{company_name}}']),
('tmpl_task_assigned', 'Task Assigned Notification', 'Sent to a team member when a new task is assigned to them.', false, 'New Task Assigned to You: {{task_title}}', 'Hi {{staff_name}},\n\nA new task has been assigned to you:\n\n"{{task_title}}"\n\nDue Date: {{task_due_date}}\n\nPlease log in to view the details.\n\nThanks!', ARRAY['{{staff_name}}', '{{task_title}}', '{{task_due_date}}']);
```