// Simple standalone Supabase configuration
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables:', {
    SUPABASE_URL: !!SUPABASE_URL,
    SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY
  });
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for easier debugging
export { SUPABASE_URL, SUPABASE_ANON_KEY };
