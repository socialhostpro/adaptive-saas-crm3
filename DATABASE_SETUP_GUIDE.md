# Supabase Database Setup Guide

This guide provides the complete SQL scripts and instructions to set up the Adaptive SaaS CRM database in Supabase.

## Files Overview

1. **01_schema.sql** - Complete database schema with tables, types, triggers, and views
2. **02_seed.sql** - Sample data for testing and development
3. **03_rls.sql** - Row Level Security policies for multi-tenant access
4. **04_indexes.sql** - Performance indexes for optimized queries

## Installation Order

Execute the SQL files in the following order in your Supabase SQL Editor:

### Step 1: Create Schema and Tables
```sql
-- Execute the contents of 01_schema.sql
-- This creates all tables, types, triggers, and views
```

### Step 2: Insert Seed Data (Optional)
```sql
-- Execute the contents of 02_seed.sql
-- This adds sample data for testing
-- Skip this step in production
```

### Step 3: Enable Row Level Security
```sql
-- Execute the contents of 03_rls.sql
-- This enables RLS and creates security policies
```

### Step 4: Create Performance Indexes
```sql
-- Execute the contents of 04_indexes.sql
-- This creates indexes for better query performance
```

## Setup Instructions

### 1. Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor from the left sidebar
3. Create a new query

### 2. Execute Schema Creation
1. Copy the entire contents of `01_schema.sql`
2. Paste it into the SQL Editor
3. Click "Run" to execute
4. Verify all tables were created successfully

### 3. Insert Sample Data (Development Only)
1. Copy the entire contents of `02_seed.sql`
2. Paste it into a new query in the SQL Editor
3. Click "Run" to execute
4. This will populate your database with sample data for testing

### 4. Enable Security Policies
1. Copy the entire contents of `03_rls.sql`
2. Paste it into a new query in the SQL Editor
3. Click "Run" to execute
4. This enables Row Level Security and creates all necessary policies

### 5. Create Performance Indexes
1. Copy the entire contents of `04_indexes.sql`
2. Paste it into a new query in the SQL Editor
3. Click "Run" to execute
4. This creates indexes to optimize query performance

## Verification

After running all scripts, verify the setup:

### Check Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Check RLS Status
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### Check Indexes
```sql
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

## Environment Variables

Make sure your `.env` file contains the correct Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features Included

### Core CRM Features
- **Lead Management** - Lead tracking, scoring, and conversion
- **Contact Management** - Contact storage with groups and relationships
- **Opportunity Pipeline** - Sales opportunity tracking and forecasting
- **Project Management** - Project and task management with dependencies
- **Case Management** - Support ticket and case tracking
- **Communication Hub** - Activity logging and communication history

### Advanced Features
- **File Management** - Document storage with permissions
- **Team Chat** - Real-time messaging with channels
- **Campaign Management** - Marketing campaign tracking
- **Newsletter System** - Email marketing and analytics
- **Financial Management** - Estimates, invoices, and payments
- **Custom Widgets** - Extensible dashboard widgets
- **AI Templates** - AI-powered content generation

### Security Features
- **Multi-tenant Architecture** - Company-based data isolation
- **Row Level Security** - Automatic data access control
- **Role-based Permissions** - User role management (owner, manager, user)
- **File Permissions** - Granular file access controls

### Performance Features
- **Optimized Indexes** - Full-text search and performance indexes
- **Efficient Queries** - Pre-optimized for common CRM operations
- **Scalable Design** - Built for growth and high performance

## Troubleshooting

### Common Issues

1. **Permission Errors**
   - Ensure you have admin access to your Supabase project
   - Check that RLS policies allow your user access

2. **Authentication Issues**
   - Verify environment variables are correct
   - Check Supabase project URL and API keys

3. **Query Timeout**
   - For large datasets, run scripts in smaller chunks
   - Some index creation may take time on large tables

4. **Extension Errors**
   - The `pg_trgm` extension is created automatically
   - Contact Supabase support if extension issues persist

### Getting Help

1. Check Supabase documentation: https://supabase.com/docs
2. Review the SQL files for inline comments and explanations
3. Test with sample data before using in production
4. Monitor query performance using Supabase dashboard

## Production Considerations

### Before Going Live
1. **Skip seed data** - Don't run `02_seed.sql` in production
2. **Review policies** - Ensure RLS policies match your business logic
3. **Test thoroughly** - Verify all CRM functions work correctly
4. **Backup strategy** - Set up regular database backups
5. **Monitor performance** - Watch query performance and optimize as needed

### Security Checklist
- ✅ RLS enabled on all tables
- ✅ Policies tested for all user roles
- ✅ Environment variables secured
- ✅ API keys rotated if exposed
- ✅ File upload limits configured
- ✅ User registration policies set

This completes the database setup for your Adaptive SaaS CRM system!
