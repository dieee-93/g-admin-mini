import { supabase } from '@/lib/supabase/client';
import { useAppStore } from '@/store/appStore';
import { ROLES, User, UserRole } from './types';
import { ROLE_PERMISSIONS } from './permissions';
import type { Session, AuthError } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  role?: UserRole;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  last_sign_in_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name?: string;
}

class AuthService {
  private initialized = false;

  /**
   * Initialize auth service and set up session listener
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting initial session:', error);
        return;
      }

      // Set initial user if session exists
      if (session?.user) {
        await this.setUserFromSession(session);
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        
        switch (event) {
          case 'SIGNED_IN':
            if (session) {
              await this.setUserFromSession(session);
            }
            break;
          case 'SIGNED_OUT':
            this.clearUser();
            break;
          case 'TOKEN_REFRESHED':
            if (session) {
              await this.setUserFromSession(session);
            }
            break;
        }
      });

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing auth service:', error);
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, error };
      }

      if (data.session?.user) {
        const authUser = await this.setUserFromSession(data.session);
        return { user: authUser, error: null };
      }

      return { user: null, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        user: null, 
        error: error as AuthError 
      };
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(credentials: RegisterCredentials): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      console.log('🚀 Starting signup process for:', credentials.email);
      
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.full_name || '',
          },
        },
      });

      console.log('📊 Supabase signup response:');
      console.log('- Data:', data);
      console.log('- Error:', error);
      console.log('- Error details:', error ? JSON.stringify(error, null, 2) : 'No error');

      if (error) {
        console.error('❌ Signup failed with error:', error.message);
        console.error('❌ Error code:', error.status);
        console.error('❌ Full error object:', error);
        return { user: null, error };
      }

      if (data.session?.user) {
        const authUser = await this.setUserFromSession(data.session);
        return { user: authUser, error: null };
      }

      console.log('✅ Signup completed successfully');
      return { user: null, error: null };
    } catch (error) {
      console.error('🔥 JavaScript error during signup:', error);
      console.error('🔥 Error type:', typeof error);
      console.error('🔥 Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('🔥 Error message:', error instanceof Error ? error.message : String(error));
      console.error('🔥 Error stack:', error instanceof Error ? error.stack : 'No stack');
      return { 
        user: null, 
        error: error as AuthError 
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    console.log('🔵 authService.signOut called');
    console.log('🔵 supabase object:', supabase);
    console.log('🔵 supabase.auth object:', supabase.auth);
    
    try {
      console.log('🔵 About to call supabase.auth.getSession()...');
      
      // Add timeout for getSession too
      const getSessionPromise = supabase.auth.getSession();
      const sessionTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('getSession timeout after 3s')), 3000)
      );
      
      const sessionResult = await Promise.race([getSessionPromise, sessionTimeoutPromise]) as any;
      console.log('🔵 getSession() completed, result:', sessionResult);
      
      const { data: { session } } = sessionResult;
      console.log('🔵 Current session status:', session ? 'active' : 'no session');
      
      // If no session, just clear user locally
      if (!session) {
        console.log('🔵 No active session, clearing user locally');
        this.clearUser();
        return { error: null };
      }
      
      console.log('🔵 Calling supabase.auth.signOut()...');
      
      // Add timeout to detect hanging requests
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Supabase signOut timeout after 5s')), 5000)
      );
      
      const { error } = await Promise.race([signOutPromise, timeoutPromise]) as any;
      console.log('🔵 supabase.auth.signOut() result:', { error });
      
      if (!error) {
        console.log('🔵 No error, calling clearUser()...');
        this.clearUser();
        console.log('🔵 clearUser() completed');
      } else {
        console.log('🔵 Error detected in signOut:', error);
      }
      
      console.log('🔵 Returning from authService.signOut');
      return { error };
    } catch (error) {
      console.log('🔵 Exception in authService.signOut:', error);
      
      // If it's any timeout (getSession or signOut), force clear user anyway
      if (error.message?.includes('timeout')) {
        console.log('🔵 Timeout detected, force clearing user...');
        this.clearUser();
        return { error: null }; // Treat timeout as success
      }
      
      console.error('Sign out error:', error);
      return { error: error as AuthError };
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting current session:', error);
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  /**
   * Get current user from store
   */
  getCurrentUser(): AuthUser | null {
    const { user } = useAppStore.getState();
    
    if (!user.id) return null;
    
    return {
      id: user.id,
      email: user.email || '',
      role: user.role as UserRole,
      full_name: user.full_name || '',
      avatar_url: user.avatar_url || '',
      created_at: user.created_at || new Date().toISOString(),
      last_sign_in_at: user.last_sign_in_at,
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.id !== null;
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as AuthError };
    }
  }

  /**
   * Update password
   */
  async updatePassword(password: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      return { error };
    } catch (error) {
      console.error('Update password error:', error);
      return { error: error as AuthError };
    }
  }

  /**
   * Set user data from Supabase session
   */
  private async setUserFromSession(session: Session): Promise<AuthUser> {
    const user = session.user;
    
    // Try to fetch role from database first, fallback to metadata, then default
    let role: UserRole | undefined;
    
    try {
      // Try to get role from user_roles table
      const { data: roleData, error } = await supabase
        .from('users_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
      if (!error && roleData) {
        role = roleData.role as UserRole;
      } else {
        // Fallback to metadata or default to CLIENTE for new users
        role = (user.user_metadata?.role as UserRole) || ROLES.CLIENTE;
      }
    } catch (error) {
      console.warn('Error fetching user role, using default:', error);
      role = ROLES.CLIENTE;
    }
    
    const authUser: AuthUser = {
      id: user.id,
      email: user.email || '',
      role: role,
      full_name: user.user_metadata?.full_name || '',
      avatar_url: user.user_metadata?.avatar_url || '',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    };

    // Update app store
    useAppStore.getState().setUser({
      id: authUser.id,
      email: authUser.email,
      role: authUser.role,
      permissions: [], // Will be computed by useRoleAccess hook
    });

    return authUser;
  }

  /**
   * Clear user data from store
   */
  private clearUser(): void {
    useAppStore.getState().setUser({
      id: null,
      email: null,
      role: null,
      permissions: [],
    });
  }

  /**
   * Assign role to user (SUPER_ADMIN only)
   */
  async assignRole(userId: string, role: UserRole, assignedBy: string): Promise<{ error: any | null }> {
    try {
      const { error } = await supabase
        .from('users_roles')
        .upsert({
          user_id: userId,
          role: role,
          assigned_by: assignedBy,
          is_active: true,
          updated_at: new Date().toISOString()
        });
      
      return { error };
    } catch (error) {
      console.error('Error assigning role:', error);
      return { error };
    }
  }
}

// Create singleton instance
export const authService = new AuthService();

// Auto-initialize when module is imported
if (typeof window !== 'undefined') {
  authService.initialize();
}