# Instructions for Next Chat Session

1. **Global State Refactor & Prop Migration: COMPLETE**
   - All business data (contacts, leads, tasks, invoices, estimates, products, media files, etc.) now load from Supabase and are managed in Zustand global state.
   - All major components and pages accept business data props as optional, with defaults, so App.tsx can pass only available data.
   - All local state and setters for business data have been removed or migrated.
   - The app compiles and runs with only the fully migrated global state entities.

2. **CRUD & Sync Integration: COMPLETE**
   - [x] Contacts: CRUD, sync, and UI status complete
   - [x] Leads: CRUD, sync, and UI status complete
   - [x] Tasks: CRUD, sync, and UI status complete
   - [x] Projects: CRUD, sync, and UI status complete
   - [x] Opportunities: CRUD, sync, and UI status complete
   - [x] Cases: CRUD, sync, and UI status complete
   - [x] Media Files: CRUD, sync, and UI status complete
   - [x] Invoices, Estimates, Products, AIInsights: CRUD, sync, and UI status complete
   - [x] Realtime subscriptions for key features (chat, activities, etc.)
   - [x] Supabase Storage for file uploads

3. **NEXT STEPS**
   - Continue to refine UI/UX and error handling
   - Expand AI assistant actions and automation
   - Add more advanced analytics, reporting, and notifications
   - Review and optimize security, RLS, and API usage
   - Keep documentation up to date as new features are added

---

_Last updated: July 9, 2025_
