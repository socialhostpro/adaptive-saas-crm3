# TODO List

## Current CRUD Implementation Status
1. **Leads**: Full CRUD (`select`, `insert`, `update`, `delete`) implemented in `Leads.tsx`, `CreateLeadModal.tsx`, `LeadDetailsModal.tsx`, `ConvertLeadModal.tsx`.
2. **Contacts**: Full CRUD implemented in `Contacts.tsx`, `CreateContactModal.tsx`, `ContactDetailsModal.tsx`.
3. **Opportunities**: Full CRUD implemented in `Opportunities.tsx`, `CreateOpportunityModal.tsx`, `EditOpportunityModal.tsx`, `OpportunityDetailsModal.tsx`.
4. **Projects**: Full CRUD implemented in `Projects.tsx`, `CreateProjectModal.tsx`, `ProjectDetailsModal.tsx`.
5. **Tasks**: Full CRUD implemented in `Tasks.tsx`, `CreateTaskModal.tsx`, `TaskDetailsModal.tsx`, `MyTasksWidget.tsx`.
6. **Invoices & Estimates**: Full CRUD implemented in `InvoiceBilling.tsx`, `CreateInvoiceModal.tsx`, `CreateEstimateModal.tsx`, `PublicInvoicePage.tsx`, `PublicEstimatePage.tsx`.
7. **Activities**: Full CRUD implemented in `Activities.tsx`, `LogActivityModal.tsx`, `RecentActivityWidget.tsx`.
8. **Case Tasks**: Full CRUD implemented in `Cases.tsx`, `CaseDetailsModal.tsx`.
9. **Media Files**: Partial CRUD (`select`, `insert`, `delete`) implemented in `MediaLibrary.tsx`, `UploadFileModal.tsx`, `MediaFileDetailsModal.tsx`.
10. **Support Tickets**: Partial CRUD (`select`, `insert`, `update`) implemented in `Support.tsx`, `Chat.tsx`.
11. **Team Members**: Partial CRUD (`select`, `insert`, `update`, `delete`) implemented in `Team.tsx`, `InviteMemberModal.tsx`, `TeamMemberDetailsModal.tsx`.
12. **Email Templates**: Partial CRUD (`select`, `update`) implemented in `company/EmailNotificationSettings.tsx`, `saas/SaaSEmailManagement.tsx`.
13. **Subscription Invoices**: Partial CRUD (`select`) implemented in `saas/PlatformBilling.tsx`.
14. **AI Insights**: Partial CRUD (`select`, `insert`) implemented in `AIInsightsWidget.tsx`, `AIAssistantModal.tsx`.

## Missing CRUD Endpoints
1. **Realtime Subscriptions**: Missing for `Chat.tsx` and `Activities.tsx`.
2. **File Uploads**: Supabase Storage integration required for `UploadFileModal`.
3. **Role Management**: Admin page for role adjustments missing.
4. **Advanced Features**: Missing backend logic for modals like `ConfirmDeleteModal`, `InviteMemberModal`, and actions like `handleCreateInvoices`, `handleConvertLead`, `handleResolveTicket`.

## Next Steps
- Refactor all local state CRUD calls to use Supabase client calls.
- Implement missing backend logic for modals and actions.
- Finalize database schema and ensure all tables, relationships, and RLS policies are set up in Supabase.
- Integrate publish/download actions with backend or deployment targets.

### Plan and Steps for Supabase Integration

#### **Plan**

1. **State-First Architecture**:

   - All Supabase calls should synchronize with the global state management system (e.g., Zustand).

   - Direct Supabase calls are limited to adding, editing, and deleting records.

2. **Synchronization Strategy**:

   - **Read Operations**: Populate global state slices using Supabase `select` queries.

   - **Write Operations**: Perform Supabase `insert`, `update`, and `delete` queries, then synchronize changes with the global state.

   - **Realtime Subscriptions**: Use Supabase's realtime features to update global state slices dynamically.

3. **Missing CRUD Endpoints**:

   - Implement realtime subscriptions for `Chat.tsx` and `Activities.tsx`.

   - Integrate Supabase Storage for file uploads in `UploadFileModal`.

   - Create an admin page for role management.

   - Add backend logic for advanced modals and actions.

4. **Next Steps**:

   - Refactor local state CRUD calls to synchronize with Supabase client calls.

   - Finalize database schema and set up tables, relationships, and RLS policies in Supabase.

   - Integrate publish/download actions with backend or deployment targets.

   - Implement missing backend logic for advanced features and modals.

#### **Steps**

1. **Refactor CRUD Calls**:

   - Replace local state CRUD calls with Supabase client calls.

   - Ensure synchronization with Zustand state slices.

2. **Implement Realtime Subscriptions**:

   - Set up Supabase subscriptions for `Chat.tsx` and `Activities.tsx`.

   - Update Zustand state slices based on subscription events.

3. **File Upload Integration**:

   - Use Supabase Storage for file uploads in `UploadFileModal`.

   - Synchronize uploaded files with the global state.

4. **Role Management**:

   - Develop an admin page for role adjustments.

   - Integrate Supabase backend logic for role updates.

5. **Backend Logic for Advanced Features**:

   - Implement missing logic for modals (`ConfirmDeleteModal`, `InviteMemberModal`) and actions (`handleCreateInvoices`, `handleConvertLead`, `handleResolveTicket`).

6. **Database Schema Finalization**:

   - Ensure all tables, relationships, and RLS policies are correctly set up in Supabase.

7. **Publish/Download Integration**:

   - Connect publish/download actions to backend or deployment targets.

This plan ensures a robust state-first architecture while leveraging Supabase's capabilities effectively.
