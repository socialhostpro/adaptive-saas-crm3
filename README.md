# Adaptive SaaS CRM

This is a comprehensive, AI-powered Customer Relationship Management (CRM) application built with React, TypeScript, and Vite. It features a modular design, a rich user interface, and a powerful AI assistant to streamline sales and customer management workflows.

## Features

- **Dashboard:** A customizable, widget-based dashboard providing a 360-degree view of your business.  
  **Status:** [x] Done
- **Contact Management:** A centralized repository for all your customer information.  
  **Status:** [x] Done
- **Sales Pipeline:** Visualize and manage your sales process from lead to close with dedicated modules for Leads and Opportunities.  
  **Status:** [x] Done
- **Task & Project Management:** Create, assign, and track tasks and projects to stay organized.  
  **Status:** [x] Tasks: [x] Done, Projects: [ ] In Progress
- **Billing & Invoicing:** Generate and manage invoices and estimates.  
  **Status:** [x] Invoices: [x] Done, Estimates: [ ] In Progress
- **AI Assistant:** A powerful, context-aware assistant to help you manage your data and automate tasks.  
  **Status:** [x] Core AI: [x] Done, Advanced AI: [ ] In Progress
- **Media File Upload/Storage:** Upload, sync, and manage media files with Supabase Storage.  
  **Status:** [x] Done
- **Team & Role Management:** Manage team members, roles, and permissions.  
  **Status:** [x] Done
- **Customer Portal:** Dedicated portal for customer access to CRM, projects, cases, landing pages, creative.  
  **Status:** [ ] In Progress
- **Stripe Billing Integration:** Subscription and payment management via Stripe.  
  **Status:** [x] Core Stripe: [x] Done, Webhooks/Edge Functions: [ ] In Progress
- **Realtime & Offline Sync:** Live updates and offline support.  
  **Status:** [x] Done
- **Role-Based Access Control:** Fine-grained security for all features.  
  **Status:** [x] Done

## Run Locally

**Prerequisites:**

- Node.js
- A Supabase account (free tier is sufficient)
- A Google Gemini API Key

**Setup:**

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd adaptive-saas-crm
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Supabase:**
    - Go to [supabase.com](https://supabase.com/) and create a new project.
    - In your Supabase project, go to the **SQL Editor** and run the SQL commands found in the `sqlTables/` directory to create the database schema.
    - Go to **Project Settings > API** and find your **Project URL** and **Project API Keys** (the `anon` `public` key).

4.  **Configure Environment Variables:**
    - There is a `.env.local` file in the root of the project.
    - Open the `.env.local` file and add your Supabase and Gemini credentials:
      ```
      SUPABASE_URL=your_supabase_url
      SUPABASE_ANON_KEY=your_supabase_anon_key
      API_KEY=your_gemini_api_key
      ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application should now be running on `http://localhost:5173`.

## Project Structure

```
/
├── components/         # React components
│   ├── shared/         # Reusable components (Card, Modals, etc.)
│   ├── widgets/        # Dashboard widgets
│   ├── company/        # Components for Company Settings page
│   ├── saas/           # Components for SaaS Admin pages
│   └── ...             # Other primary feature components
├── hooks/              # Custom React hooks (e.g., useAuth, useSupabase)
├── lib/                # Helper functions, client initializations (supabaseClient.ts)
├── sqlTables/          # Individual SQL files for each table
├── types/              # TypeScript type definitions (types.ts)
├── index.html
├── index.tsx
└── ...
```

## Supabase Storage Integration

Media files (images, documents, etc.) are uploaded and managed using Supabase Storage. See `lib/mediaStorage.ts` for utility functions:

- `uploadMediaFile(file: File, bucket?: string)` – Uploads a file to Supabase Storage.
- `getMediaFileUrl(path: string, bucket?: string)` – Gets a public URL for a stored file.
- `deleteMediaFile(path: string, bucket?: string)` – Deletes a file from storage.

Integrate these utilities in your media file components for file upload, preview, and deletion.

## Supabase Realtime Integration

The app supports live updates using Supabase Realtime. See `lib/realtime.ts` for utilities:

- `subscribeToTable(table: string, onChange: (payload) => void)` – Subscribes to realtime changes (insert, update, delete) for a table.
- `unsubscribeFromChannel(channel)` – Unsubscribes from a realtime channel.

Use these in your components to keep UI in sync with backend changes in real time.

## Sync, Offline, and State Management

- All business data is managed in Zustand global state with optimistic updates and sync status (`pending`, `synced`, `error`).
- CRUD operations update state first, then sync to Supabase in the background.
- Offline changes are queued and synced when back online.
- See `lib/syncService.ts` for sync logic and `hooks/useGlobalStore.ts` for state management.

## Next Steps & To-Do

For a detailed plan of the remaining work, please see the [Project_Guide.md](Project_Guide.md). This includes:
- Full backend integration with Supabase.  
  **Status:** [ ] In Progress
- Implementation of user authentication.  
  **Status:** [x] Done
- Refactoring of all data handling to use Supabase instead of mock data.  
  **Status:** [ ] In Progress
- Securing AI functionality with Supabase Edge Functions.  
  **Status:** [ ] In Progress

# Deployment triggered: 2025-07-08  
This line was added to trigger a redeploy to Cloudflare.
