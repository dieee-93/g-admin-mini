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
        // Security: Use PKCE flow for better security (vs implicit flow)
        // PKCE (Proof Key for Code Exchange) protects against authorization code interception
        flowType: 'pkce',

        // Auto-detect session from URL after OAuth/magic link redirects
        detectSessionInUrl: true,

        // Persist session across page refreshes
        persistSession: true,

        // Auto-refresh tokens before they expire
        autoRefreshToken: true,

        // Storage configuration
        // Note: Using localStorage for development. In production with SSR,
        // this should be replaced with cookie-based storage via custom adapter.
        // See: docs/SECURITY_ARCHITECTURE.md for production configuration
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