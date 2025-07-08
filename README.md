# Adaptive SaaS CRM

This is a comprehensive, AI-powered Customer Relationship Management (CRM) application built with React, TypeScript, and Vite. It features a modular design, a rich user interface, and a powerful AI assistant to streamline sales and customer management workflows.

## Features

- **Dashboard:** A customizable, widget-based dashboard providing a 360-degree view of your business.
- **Contact Management:** A centralized repository for all your customer information.
- **Sales Pipeline:** Visualize and manage your sales process from lead to close with dedicated modules for Leads and Opportunities.
- **Task & Project Management:** Create, assign, and track tasks and projects to stay organized.
- **Billing & Invoicing:** Generate and manage invoices and estimates.
- **AI Assistant:** A powerful, context-aware assistant to help you manage your data and automate tasks.
- **And much more...**

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

## Next Steps & To-Do

For a detailed plan of the remaining work, please see the [Project_Guide.md](Project_Guide.md). This includes:
- Full backend integration with Supabase.
- Implementation of user authentication.
- Refactoring of all data handling to use Supabase instead of mock data.
- Securing AI functionality with Supabase Edge Functions.

# Deployment triggered: 2025-07-08  
This line was added to trigger a redeploy to Cloudflare.
