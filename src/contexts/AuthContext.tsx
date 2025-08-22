import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

// User role type
export type UserRole = 'CLIENTE' | 'OPERADOR' | 'SUPERVISOR' | 'ADMINISTRADOR' | 'SUPER_ADMIN';

// JWT Custom Claims interface
interface CustomClaims {
  user_role?: UserRole;
  is_active?: boolean;
  role_updated_at?: number;
  app_metadata?: {
    provider?: string;
    role_source?: string;
  };
  error?: string;
}

// Extended user type with role information
export interface AuthUser extends User {
  role?: UserRole;
  isActive?: boolean;
  roleSource?: 'jwt' | 'database' | 'fallback';
}

// Auth context type
interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
  isAuthenticated: boolean;
  isRole: (role: UserRole | UserRole[]) => boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to decode JWT and extract custom claims
function decodeJWTClaims(token: string): CustomClaims | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return {
      user_role: decoded.user_role,
      is_active: decoded.is_active,
      role_updated_at: decoded.role_updated_at,
      app_metadata: decoded.app_metadata,
      error: decoded.error
    };
  } catch (error) {
    console.error('Error decoding JWT claims:', error);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Enhanced function to get user role with JWT claims priority
  const getUserRoleFromMultipleSources = async (currentSession: Session): Promise<{
    role: UserRole;
    isActive: boolean;
    source: 'jwt' | 'database' | 'fallback';
  }> => {
    // 1. Try to get role from JWT claims first
    if (currentSession.access_token) {
      const claims = decodeJWTClaims(currentSession.access_token);
      
      if (claims && claims.user_role && !claims.error) {
        console.log('Role from JWT:', claims.user_role);
        return {
          role: claims.user_role,
          isActive: claims.is_active ?? true,
          source: 'jwt'
        };
      }
      
      if (claims?.error) {
        console.warn('JWT claims error:', claims.error);
      }
    }

    // 2. Fallback to database query
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('users_roles')
        .select('role, is_active')
        .eq('user_id', currentSession.user.id)
        .eq('is_active', true)
        .single();

      if (!roleError && roleData) {
        console.log('Role from database:', roleData.role);
        return {
          role: roleData.role as UserRole,
          isActive: roleData.is_active,
          source: 'database'
        };
      }
    } catch (dbError) {
      console.error('Database role fetch error:', dbError);
    }

    // 3. Final fallback
    return {
      role: 'CLIENTE',
      isActive: false,
      source: 'fallback'
    };
  };

  // Handle authentication state and fetch user role
  const handleAuthState = async (currentSession: Session) => {
    try {
      setSession(currentSession);
      
      const { role, isActive, source } = await getUserRoleFromMultipleSources(currentSession);

      const enhancedUser: AuthUser = {
        ...currentSession.user,
        role,
        isActive,
        roleSource: source
      };

      setUser(enhancedUser);
      console.log(`🔐 AuthContext - User authenticated - Role: ${role} (${source})`);
      console.log('🔐 AuthContext - Enhanced user object:', enhancedUser);
      
    } catch (error) {
      console.error('Error in handleAuthState:', error);
      setUser({
        ...currentSession.user,
        role: 'CLIENTE',
        isActive: false,
        roleSource: 'fallback'
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (initialSession) {
            await handleAuthState(initialSession);
          } else {
            // Ensure clean state when no session
            setUser(null);
            setSession(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      console.log('Auth state change:', event, !!currentSession);

      if (event === 'SIGNED_OUT' || !currentSession) {
        // Explicit cleanup on sign out
        setSession(null);
        setUser(null);
        setLoading(false);
      } else if (currentSession) {
        await handleAuthState(currentSession);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Force refresh user role
  const refreshRole = async () => {
    if (!session) return;
    
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      await handleAuthState(session);
    } else if (data.session) {
      await handleAuthState(data.session);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      
      // Clear Supabase session
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
      }
      
      // Force clear any persisted session data
      localStorage.removeItem('g-admin-auth-token');
      
      // Navigate after cleanup
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if error, clear local state
      setUser(null);
      setSession(null);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user && !!session;
  
  const isRole = (role: UserRole | UserRole[]): boolean => {
    if (!user?.role) return false;
    return Array.isArray(role) ? role.includes(user.role) : user.role === role;
  };

  const hasRole = (roles: UserRole[]): boolean => {
    return isRole(roles);
  };

  const contextValue: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshRole,
    isAuthenticated,
    isRole,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
