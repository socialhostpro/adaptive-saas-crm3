# Need to Know

## Revised Plan for Supabase Integration

### State-First Approach

This app follows a state-first architecture. All calls to Supabase should be synchronized with the global state management system (e.g., Zustand). Direct calls to Supabase should only be made for the following operations:

- Adding new records.

- Editing existing records.

- Deleting records.

### Synchronization Strategy

1. **Read Operations**:

   - Supabase `select` queries should populate the global state slices.

   - State slices should be the single source of truth for the app.

   - Components should subscribe to state slices for data updates.

2. **Write Operations**:

   - Supabase `insert`, `update`, and `delete` queries should update the database.

   - After successful database operations, synchronize the changes with the global state.

3. **Realtime Subscriptions**:

   - Use Supabase's realtime features to listen for changes in the database.

   - Update the global state slices based on subscription events.

### Missing CRUD Endpoints

1. **Realtime Subscriptions**:

   - Implement for `Chat.tsx` and `Activities.tsx`.

2. **File Uploads**:

   - Integrate Supabase Storage for `UploadFileModal`.

3. **Role Management**:

   - Create an admin page for role adjustments.

4. **Advanced Features**:

   - Add backend logic for modals (`ConfirmDeleteModal`, `InviteMemberModal`) and actions (`handleCreateInvoices`, `handleConvertLead`, `handleResolveTicket`).

### Next Steps

- Refactor all local state CRUD calls to synchronize with Supabase client calls.

- Ensure all database operations are reflected in the global state.

- Finalize database schema and set up tables, relationships, and RLS policies in Supabase.

- Integrate publish/download actions with backend or deployment targets.

- Implement missing backend logic for advanced features and modals.

### Key Considerations

- Prioritize state synchronization to ensure consistent and predictable app behavior.

- Minimize direct Supabase calls to maintain the state-first architecture.

- Leverage Supabase's realtime capabilities for dynamic updates.
