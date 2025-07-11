-- Test script for all main CRM tables

-- 1. Test insert for profiles
test_profile_id := gen_random_uuid();
INSERT INTO profiles (id, email, full_name) VALUES (test_profile_id, 'testuser@example.com', 'Test User');

-- 2. Test insert for team_members
test_team_id := gen_random_uuid();
INSERT INTO team_members (id, user_id, name, email, role) VALUES (test_team_id, test_profile_id, 'Test Team Member', 'teammember@example.com', 'admin');

-- 3. Test insert for companies
test_company_id := gen_random_uuid();
INSERT INTO companies (id, name) VALUES (test_company_id, 'Test Company');

-- 4. Test insert for contacts
test_contact_id := gen_random_uuid();
INSERT INTO contacts (id, name, company_id) VALUES (test_contact_id, 'Test Contact', test_company_id);

-- 5. Test insert for leads
test_lead_id := gen_random_uuid();
INSERT INTO leads (id, name, company, contact_id) VALUES (test_lead_id, 'Test Lead', 'Test Company', test_contact_id);

-- 6. Test insert for opportunities
test_opp_id := gen_random_uuid();
INSERT INTO opportunities (id, title, contact_id, lead_id) VALUES (test_opp_id, 'Test Opportunity', test_contact_id, test_lead_id);

-- 7. Test insert for projects
test_project_id := gen_random_uuid();
INSERT INTO projects (id, name, contact_id, opportunity_id) VALUES (test_project_id, 'Test Project', test_contact_id, test_opp_id);

-- 8. Test insert for cases
test_case_id := gen_random_uuid();
INSERT INTO cases (id, title, contact_id) VALUES (test_case_id, 'Test Case', test_contact_id);

-- 9. Test insert for activities
test_activity_id := gen_random_uuid();
INSERT INTO activities (id, type, summary, contact_id) VALUES (test_activity_id, 'Call', 'Test Activity', test_contact_id);

-- 10. Test insert for tasks (unified)
INSERT INTO tasks (id, type, project_id, case_id, title, description, status, due_date, created_at)
VALUES (gen_random_uuid(), 'project', gen_random_uuid(), NULL, 'Test Project Task', 'Test project task description', 'open', NOW() + INTERVAL '7 days', NOW());

INSERT INTO tasks (id, type, project_id, case_id, title, description, status, due_date, created_at)
VALUES (gen_random_uuid(), 'case', NULL, gen_random_uuid(), 'Test Case Task', 'Test case task description', 'open', NOW() + INTERVAL '7 days', NOW());

-- 11. Test insert for products
test_product_id := gen_random_uuid();
INSERT INTO products (id, name) VALUES (test_product_id, 'Test Product');

-- 12. Test insert for invoices
test_invoice_id := gen_random_uuid();
INSERT INTO invoices (id, project_id) VALUES (test_invoice_id, test_project_id);

-- 13. Test insert for invoice_line_items
test_invoice_line_id := gen_random_uuid();
INSERT INTO invoice_line_items (id, invoice_id) VALUES (test_invoice_line_id, test_invoice_id);

-- 14. Test insert for payments
test_payment_id := gen_random_uuid();
INSERT INTO payments (id, invoice_id) VALUES (test_payment_id, test_invoice_id);

-- 15. Test insert for estimates
test_estimate_id := gen_random_uuid();
INSERT INTO estimates (id, project_id) VALUES (test_estimate_id, test_project_id);

-- 16. Test insert for estimate_line_items
test_estimate_line_id := gen_random_uuid();
INSERT INTO estimate_line_items (id, estimate_id) VALUES (test_estimate_line_id, test_estimate_id);

-- 17. Test insert for media_files
test_media_id := gen_random_uuid();
INSERT INTO media_files (id, file_name) VALUES (test_media_id, 'testfile.png');

-- 18. Test insert for notes
test_note_id := gen_random_uuid();
INSERT INTO notes (id, content) VALUES (test_note_id, 'Test Note');

-- 19. Test insert for time_entries
test_time_id := gen_random_uuid();
INSERT INTO time_entries (id, description) VALUES (test_time_id, 'Test Time Entry');

-- 20. Test insert for tags
test_tag_id := gen_random_uuid();
INSERT INTO tags (id, name) VALUES (test_tag_id, 'Test Tag');

-- Clean up (optional): delete all test data by id
-- DELETE FROM ... WHERE id IN (...);
