// Simple JS script to fetch all table info from Supabase
// Requires @supabase/supabase-js installed and your Supabase URL & anon key

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env.local');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getTableInfo(table) {
  // Get up to 1 row and all column names
  const { data, error } = await supabase.from(table).select('*').limit(1);
  if (error) {
    console.error(`Error fetching ${table}:`, error.message);
    return { table, columns: [], error: error.message };
  }
  const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
  return { table, columns };
}

async function main() {
  const tables = [
    'active_subscriptions', 'activities', 'cases', 'companies', 'contact_subscriptions',
    'contacts', 'discounts', 'estimate_line_items', 'estimates', 'invoice_line_items',
    'invoices', 'leads', 'media_files', 'notes', 'opportunities', 'payments', 'plans',
    'products', 'profiles', 'projects', 'subscriptions', 'tags', 'tasks', 'team_members',
    'time_entries', 'users'
  ];
  const results = [];
  for (const table of tables) {
    const info = await getTableInfo(table);
    results.push(info);
  }
  console.log(JSON.stringify({ tables: results }, null, 2));
}

main();
