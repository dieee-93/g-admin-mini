import { createBrowserClient } from '@supabase/ssr';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Singleton pattern to prevent multiple instances
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'g-admin-auth-token'
      }
    });
  }
  return supabaseInstance;
}

// Create the Supabase client for browser use
export const supabase = getSupabaseClient();

// Export types for convenience
export type { User, Session } from '@supabase/supabase-js';