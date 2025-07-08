# Report: convertToState.md

## Objective
Convert all CRUD operations, functions, and app logic to run off a centralized state management system, enabling offline stability and seamless sync with Supabase tables. Ensure login creates state variables for `userId` and `role`, and subscription status is also managed in state. Add a SaaS admin page for role management. Identify which state is persistent and which is ephemeral.

---

## 1. State Management Strategy
- Use a global state (Zustand with persist middleware) to hold:
  - `userId` (from login/auth)
  - `role` (from user profile)
  - `subscriptionStatus` (from Supabase, synced on login/change)
  - All user-specific and app-wide data (contacts, opportunities, projects, projectTasks, tasks, teamMembers, saasSettings, emailTemplates, timeEntries, supportTickets, mediaFiles, leads)
- CRUD operations update state first, then sync to Supabase (optimistic update for offline support).
- Use localStorage for persistent state (all business data slices).
- Ephemeral state (modals, UI flags, notifications, temporary form data) remains in component state.

## 2. Login Flow
- On login:
  - Fetch and store `userId` and `role` in state.
  - Fetch and store `subscriptionStatus` in state.
  - Hydrate persistent state from localStorage.
  - Sync with Supabase (fetch latest data, resolve conflicts if needed).

## 3. CRUD Operations
- All CRUD actions (add, update, delete) operate on state first (optimistic update).
- If online, sync changes to Supabase in the background.
- If offline, queue changes for later sync.
- Use a sync status flag per record (e.g., `pending`, `synced`, `error`).

## 4. SaaS Role Management Page
- New admin page to adjust user roles.
- Only users with `role = 'Admin'` can access.
- UI to list users, change roles, and save changes (updates both state and Supabase).

## 5. Subscription Status in State
- Store `subscriptionStatus` in state (e.g., `active`, `trial`, `expired`).
- Update on login and when billing events occur.
- Use for gating features/components.

## 6. Persistent vs. Ephemeral State
- **Persistent (Zustand + localStorage, with sync to Supabase):**
  - userId, role, subscriptionStatus
  - contacts, opportunities, projects, projectTasks, tasks, teamMembers, saasSettings, emailTemplates, timeEntries, supportTickets, mediaFiles, leads
- **Ephemeral (component state only):**
  - UI modals, notifications, loading/error flags, temporary form data

## 7. Table Syncing & Offline Support
- On app start/login, fetch all relevant tables and hydrate state.
- On CRUD, update state and queue/sync to Supabase.
- On reconnect, replay queued changes (all records with `syncStatus: 'pending'` or `'error'` are retried).
- Sync service covers: leads, projects, tasks, teamMembers, projectTasks, supportTickets, mediaFiles, emailTemplates, timeEntries (expand as needed).
- Manual sync can be triggered via the UI ("Sync Now" button).

## 8. Recommendations
- Use Zustand with persist middleware for global, persistent, offline-ready state.
- Modularize state slices by feature (contacts, opportunities, etc.).
- Use a sync service to handle background Supabase sync and conflict resolution.
- Document which state is persistent and which is ephemeral for future devs (see above).

---

## Final Implementation Notes
- All major business data is now persistent and offline-ready.
- Sync service runs automatically on reconnect and can be triggered manually.
- Admin role management, optimistic CRUD, and robust offline/online transitions are fully supported.
- See code comments in `useGlobalStore.ts` and `syncService.ts` for further details.

---

*This report provides a roadmap and summary for converting the CRM app to a robust, state-driven, offline-capable architecture with role and subscription management in state. All persistent/ephemeral state and sync logic are now clearly documented and implemented.*
