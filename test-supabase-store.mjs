// This is an ES module test file for Node.js
// Run with: node test-supabase-store.mjs
// Or better yet: use the browser test at http://localhost:5174/test-supabase.html

import { createClient } from '@supabase/supabase-js';
import { create } from 'zustand';

// Load environment variables manually for Node.js testing
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple .env parser for Node.js
function loadEnv() {
  try {
    const envPath = join(__dirname, '.env');
    const envFile = readFileSync(envPath, 'utf8');
    const env = {};
    
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        env[key.trim()] = value.trim();
      }
    });
    
    return env;
  } catch (err) {
    console.error('Could not load .env file:', err.message);
    return {};
  }
}

const env = loadEnv();
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

// Create a simple store for testing
const useTestStore = create(() => ({
  testKey: 'initial value'
}));

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('leads').select('count').limit(1);
    
    if (error) {
      console.error('❌ Error:', error.message);
      console.error('Details:', error);
    } else {
      console.log('✅ Successfully connected to Supabase!');
      console.log('Response:', data);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

function testZustandStore() {
  try {
    console.log('Testing Zustand store...');
    console.log('Initial state:', useTestStore.getState());

    useTestStore.setState({ testKey: 'testValue' });
    console.log('Updated state:', useTestStore.getState());
    console.log('✅ Zustand store working correctly!');
  } catch (err) {
    console.error('❌ Error interacting with Zustand store:', err.message);
  }
}

async function testRealtimeSubscriptions() {
  try {
    console.log('Testing realtime subscriptions...');
    const subscription = supabase
      .channel('test_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'leads' 
      }, (payload) => {
        console.log('📡 Realtime event received:', payload);
      })
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to realtime updates!');
        }
      });

    if (!subscription) {
      throw new Error('Failed to initialize realtime subscription.');
    }

    console.log('🔄 Realtime subscription initialized...');
  } catch (err) {
    console.error('❌ Error initializing realtime subscription:', err.message);
  }
}

async function runTests() {
  console.log('🧪 Running Supabase and Zustand Tests...\n');
  
  console.log('1. Testing Supabase connection...');
  await testSupabaseConnection();
  
  console.log('\n2. Testing Zustand store...');
  testZustandStore();
  
  console.log('\n3. Testing realtime subscriptions...');
  await testRealtimeSubscriptions();
  
  console.log('\n✅ All tests completed!');
  console.log('💡 For better testing, visit: http://localhost:5174/test-supabase.html');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}
