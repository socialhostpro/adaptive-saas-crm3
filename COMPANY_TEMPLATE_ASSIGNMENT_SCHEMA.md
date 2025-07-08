# Company Template Assignment Database Schema

This document outlines the database schema additions needed to support company-specific template assignments in your SaaS CRM system.

## New Tables Required

### 1. Companies Table Enhancement

```sql
-- Add ID field to existing company_profile table or create new companies table
ALTER TABLE public.company_profile ADD COLUMN IF NOT EXISTS id TEXT PRIMARY KEY DEFAULT 'main_profile';

-- Or create a new companies table for multi-tenant support
CREATE TABLE IF NOT EXISTS public.companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    country TEXT,
    phone TEXT,
    website TEXT,
    logo_url TEXT,
    plan_type TEXT DEFAULT 'standard',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
```

### 2. Template Assignments Table

```sql
-- Create template assignment table
CREATE TABLE IF NOT EXISTS public.company_template_assignments (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    template_name TEXT NOT NULL,
    template_type TEXT DEFAULT 'custom',
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unique_company_template UNIQUE (company_id, template_id)
);
ALTER TABLE public.company_template_assignments ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraints
ALTER TABLE public.company_template_assignments 
ADD CONSTRAINT fk_company_template_company 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_company_template_assignments_company_id 
ON public.company_template_assignments(company_id);

CREATE INDEX IF NOT EXISTS idx_company_template_assignments_template_id 
ON public.company_template_assignments(template_id);
```

### 3. Row Level Security Policies

```sql
-- RLS Policies for companies table
CREATE POLICY "Companies can view own data" ON public.companies
FOR SELECT
TO authenticated
USING (auth.uid()::text = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Companies can update own data" ON public.companies
FOR UPDATE
TO authenticated
USING (auth.uid()::text = id OR auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for template assignments
CREATE POLICY "View own company template assignments" ON public.company_template_assignments
FOR SELECT
TO authenticated
USING (
    company_id = auth.uid()::text OR 
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'super_admin'
);

CREATE POLICY "Manage template assignments" ON public.company_template_assignments
FOR ALL
TO authenticated
USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'super_admin'
);
```

## Updated SendGrid Service Integration

### Database Service Functions

```typescript
// Add these methods to your database service

class DatabaseService {
    // Get companies for template assignment
    async getCompaniesForTemplate(templateId: string) {
        const { data, error } = await supabase
            .from('company_template_assignments')
            .select(`
                company_id,
                companies (
                    id,
                    name,
                    logo_url,
                    website
                )
            `)
            .eq('template_id', templateId)
            .eq('is_active', true);

        if (error) throw error;
        return data?.map(item => item.companies).filter(Boolean) || [];
    }

    // Get templates for company
    async getTemplatesForCompany(companyId: string) {
        const { data, error } = await supabase
            .from('company_template_assignments')
            .select('template_id, template_name, template_type, assigned_at')
            .eq('company_id', companyId)
            .eq('is_active', true);

        if (error) throw error;
        return data || [];
    }

    // Assign template to company
    async assignTemplateToCompany(templateId: string, companyId: string, templateType: string = 'custom', assignedBy?: string) {
        const { data, error } = await supabase
            .from('company_template_assignments')
            .upsert({
                id: `${companyId}_${templateId}`,
                company_id: companyId,
                template_id: templateId,
                template_name: templateId, // You might want to fetch the actual name
                template_type: templateType,
                is_active: true,
                assigned_by: assignedBy || 'system',
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
        return data;
    }

    // Remove template assignment
    async unassignTemplateFromCompany(templateId: string, companyId: string) {
        const { error } = await supabase
            .from('company_template_assignments')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('template_id', templateId)
            .eq('company_id', companyId);

        if (error) throw error;
    }

    // Get all companies (for assignment dropdown)
    async getAllCompanies() {
        const { data, error } = await supabase
            .from('companies')
            .select('id, name, logo_url, website, is_active')
            .eq('is_active', true)
            .order('name');

        if (error) throw error;
        return data || [];
    }
}
```

## Migration Script

```sql
-- Migration script to add company template assignment functionality
-- Run this in your Supabase SQL editor

BEGIN;

-- 1. Add ID to existing company_profile if not exists
ALTER TABLE public.company_profile ADD COLUMN IF NOT EXISTS id TEXT;
UPDATE public.company_profile SET id = 'main_profile' WHERE id IS NULL;
ALTER TABLE public.company_profile ADD CONSTRAINT company_profile_pkey PRIMARY KEY (id);

-- 2. Create companies table for multi-tenant support (optional)
CREATE TABLE IF NOT EXISTS public.companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    country TEXT,
    phone TEXT,
    website TEXT,
    logo_url TEXT,
    plan_type TEXT DEFAULT 'standard',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create template assignments table
CREATE TABLE IF NOT EXISTS public.company_template_assignments (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    template_name TEXT NOT NULL,
    template_type TEXT DEFAULT 'custom',
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unique_company_template UNIQUE (company_id, template_id)
);

-- 4. Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_template_assignments ENABLE ROW LEVEL SECURITY;

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_company_template_assignments_company_id 
ON public.company_template_assignments(company_id);

CREATE INDEX IF NOT EXISTS idx_company_template_assignments_template_id 
ON public.company_template_assignments(template_id);

-- 6. Create RLS policies
CREATE POLICY "Companies can view own data" ON public.companies
FOR SELECT TO authenticated
USING (true); -- Modify based on your auth structure

CREATE POLICY "View own company template assignments" ON public.company_template_assignments
FOR SELECT TO authenticated
USING (true); -- Modify based on your auth structure

CREATE POLICY "Manage template assignments" ON public.company_template_assignments
FOR ALL TO authenticated
USING (true); -- Modify based on your auth structure

-- 7. Insert sample data (optional)
INSERT INTO public.companies (id, name, address, city, state, zip, country, phone, website, logo_url) VALUES
('comp1', 'Adaptive Solutions LLC', '123 Innovation Drive', 'Techville', 'CA', '94043', 'USA', '555-0199', 'https://adaptivesolutions.dev', 'https://tailwindui.com/img/logos/mark.svg?color=sky&shade=500'),
('comp2', 'Tech Innovations Inc', '456 Technology Blvd', 'Silicon Valley', 'CA', '94105', 'USA', '555-0200', 'https://techinnovations.com', 'https://tailwindui.com/img/logos/mark.svg?color=blue&shade=500')
ON CONFLICT (id) DO NOTHING;

COMMIT;
```

## Environment Variables

Add these environment variables for multi-tenant support:

```bash
# Multi-tenant Configuration
VITE_MULTI_TENANT_ENABLED=true
VITE_DEFAULT_COMPANY_ID=main_profile

# Template Assignment Settings
VITE_TEMPLATE_ASSIGNMENT_ENABLED=true
VITE_AUTO_ASSIGN_TEMPLATES=false
```

## Usage Example

```typescript
// Example usage in your React components
import { sendGridService } from '../lib/sendgridService';

// Assign template to multiple companies
const assignToCompanies = async (templateId: string, companyIds: string[]) => {
    const result = await sendGridService.bulkAssignTemplate(templateId, companyIds, 'newsletter');
    if (result.success) {
        console.log('Template assigned successfully');
    }
};

// Get templates for current company
const loadCompanyTemplates = async (companyId: string) => {
    const result = await sendGridService.getTemplatesForCompany(companyId);
    if (result.success) {
        setTemplates(result.templates || []);
    }
};
```

## Benefits

1. **Multi-Tenant Support**: Each company can have their own set of email templates
2. **Granular Control**: Administrators can control which templates are available to which companies
3. **Scalability**: Supports unlimited companies and template assignments
4. **Audit Trail**: Track when templates are assigned and by whom
5. **Flexibility**: Easy to extend with additional metadata and permissions

## Next Steps

1. Run the migration script in your database
2. Update your authentication to include company context
3. Modify the SendGrid service to use the database service methods
4. Test the company assignment functionality
5. Add role-based permissions for template management

This implementation provides a solid foundation for company-specific template management in your SaaS CRM system.
