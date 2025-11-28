import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

import { logger } from '@/lib/logging';
import {
  type PermissionAction as RegistryPermissionAction,
  hasPermission as checkPermission,
  canAccessModule as checkCanAccessModule,
} from '@/config/PermissionsRegistry';

// User role type
export type UserRole = 'CLIENTE' | 'OPERADOR' | 'SUPERVISOR' | 'ADMINISTRADOR' | 'SUPER_ADMIN';

// Module names for access control
export type ModuleName =
  | 'dashboard'
  | 'operations'
  | 'sales'
  | 'customers'
  | 'materials'
  | 'materials-procurement'
  | 'products'
  | 'staff'
  | 'scheduling'
  | 'fiscal'
  | 'settings'
  | 'gamification'
  | 'executive'
  | 'billing'
  | 'integrations'
  | 'memberships'
  | 'rentals'
  | 'assets'
  | 'reporting'
  | 'intelligence'
  | 'customer_portal'
  | 'customer_menu'
  | 'my_orders'
  | 'debug'; // Debug tools for SUPER_ADMIN only

// Permission actions (re-export from PermissionsRegistry)
export type PermissionAction = RegistryPermissionAction;

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

  // ========================================================================
  // PERMISSIONS SYSTEM (PermissionsRegistry Integration)
  // ========================================================================

  /** Check if user can access a module (has any permission) */
  canAccessModule: (module: ModuleName) => boolean;

  /** Check if user can perform a specific action on a module */
  canPerformAction: (module: ModuleName, action: PermissionAction) => boolean;

  /** CRUD Permission Checks */
  canCreate: (module: ModuleName) => boolean;
  canRead: (module: ModuleName) => boolean;
  canUpdate: (module: ModuleName) => boolean;
  canDelete: (module: ModuleName) => boolean;

  /** Special Action Permission Checks */
  canVoid: (module: ModuleName) => boolean;
  canApprove: (module: ModuleName) => boolean;
  canConfigure: (module: ModuleName) => boolean;
  canExport: (module: ModuleName) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
AuthContext.displayName = 'AuthContext';

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
    logger.error('AuthContext', 'Error decoding JWT claims:', error);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🐛 PERFORMANCE DEBUG: Track renders to detect re-render issues
  const renderCountRef = useRef(0);
  renderCountRef.current++;
  logger.debug('AuthContext', `🔵 RENDER #${renderCountRef.current}`);

  // Track critical state changes
  const prevUserRef = useRef(user);
  const prevSessionRef = useRef(session);
  const prevLoadingRef = useRef(loading);

  if (prevUserRef.current !== user) {
    logger.warn('AuthContext', '⚠️ user CHANGED!', {
      prevUserId: prevUserRef.current?.id,
      newUserId: user?.id,
      prevRole: prevUserRef.current?.role,
      newRole: user?.role,
      renderCount: renderCountRef.current,
      areSameReference: prevUserRef.current === user
    });
    prevUserRef.current = user;
  }

  if (prevSessionRef.current !== session) {
    logger.info('AuthContext', '📝 session CHANGED', {
      hadSession: !!prevSessionRef.current,
      hasSession: !!session,
      renderCount: renderCountRef.current,
      areSameReference: prevSessionRef.current === session
    });
    prevSessionRef.current = session;
  }

  if (prevLoadingRef.current !== loading) {
    logger.info('AuthContext', `🔄 loading: ${prevLoadingRef.current} → ${loading}`, {
      renderCount: renderCountRef.current
    });
    prevLoadingRef.current = loading;
  }

  // Alert on excessive renders
  if (renderCountRef.current > 20) {
    logger.error('AuthContext', '🔴 EXCESSIVE RENDERS DETECTED!', {
      count: renderCountRef.current,
      userId: user?.id,
      isLoading: loading
    });
  }

  // ✅ FIX: Create deterministic hash for session comparison
  const getSessionHash = useCallback((session: Session | null): string => {
    if (!session) return 'null';

    // Hash critical session properties that define uniqueness
    const criticalData = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      user_id: session.user?.id
    };

    // Simple hash function (better than JSON.stringify for performance)
    return JSON.stringify(criticalData);
  }, []);

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
        logger.info('AuthContext', 'Role from JWT:', claims.user_role);
        return {
          role: claims.user_role,
          isActive: claims.is_active ?? true,
          source: 'jwt'
        };
      }

      if (claims?.error) {
        logger.error('AuthContext', 'JWT claims error:', claims.error);
      }
    }

    // 2. Fallback to database query
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('users_roles')
        .select('role, is_active')
        .eq('user_id', currentSession.user.id)
        .eq('is_active', true)
        .single<{ role: string; is_active: boolean }>();

      if (!roleError && roleData) {
        logger.info('AuthContext', 'Role from database:', { role: roleData.role });
        return {
          role: roleData.role as UserRole,
          isActive: roleData.is_active,
          source: 'database'
        };
      }
    } catch (dbError) {
      logger.error('AuthContext', 'Database role fetch error:', dbError);
    }

    // 3. Final fallback
    return {
      role: 'CLIENTE',
      isActive: false,
      source: 'fallback'
    };
  };

  // ✅ FIX: Memoize handleAuthState to prevent re-creation
  // Handle authentication state and fetch user role
  const handleAuthState = useCallback(async (currentSession: Session) => {
    try {
      // 🔥 PERFORMANCE FIX: Only update session if it's actually different
      setSession(prevSession => {
        // Compare by reference first (fast path)
        if (prevSession === currentSession) {
          logger.debug('AuthContext', '🔄 Session reference unchanged');
          return prevSession;
        }

        // 🔐 HASH COMPARISON: Compare session hashes to detect actual changes
        const prevHash = getSessionHash(prevSession);
        const currentHash = getSessionHash(currentSession);

        if (prevHash === currentHash) {
          logger.debug('AuthContext', '🔄 Session hash unchanged, preserving reference', {
            hash: currentHash.substring(0, 50) + '...'
          });
          return prevSession; // PRESERVE OLD REFERENCE - prevents cascade renders
        }

        logger.debug('AuthContext', '✨ Session changed, updating', {
          prevHash: prevHash.substring(0, 50) + '...',
          currentHash: currentHash.substring(0, 50) + '...'
        });
        return currentSession; // New session
      });

      const { role, isActive, source } = await getUserRoleFromMultipleSources(currentSession);

      const enhancedUser: AuthUser = {
        ...currentSession.user,
        role,
        isActive,
        roleSource: source
      };

      // 🔥 PERFORMANCE FIX: Only update user if values actually changed
      setUser(prevUser => {
        // If no previous user, return new one
        if (!prevUser) return enhancedUser;

        // Compare relevant properties to detect actual changes
        const hasChanges =
          prevUser.id !== enhancedUser.id ||
          prevUser.role !== enhancedUser.role ||
          prevUser.isActive !== enhancedUser.isActive ||
          prevUser.roleSource !== enhancedUser.roleSource ||
          prevUser.email !== enhancedUser.email;

        if (!hasChanges) {
          logger.debug('AuthContext', '🔄 User unchanged, preserving reference');
          return prevUser; // PRESERVE OLD REFERENCE - prevents re-renders!
        }

        logger.info('AuthContext', `🔐 AuthContext - User authenticated - Role: ${role} (${source})`);
        logger.info('AuthContext', '🔐 AuthContext - Enhanced user object:', enhancedUser);
        return enhancedUser; // New user object
      });

    } catch (error) {
      logger.error('AuthContext', 'Error in handleAuthState:', error);
      setUser({
        ...currentSession.user,
        role: 'CLIENTE',
        isActive: false,
        roleSource: 'fallback'
      });
    }
  }, [getSessionHash, getUserRoleFromMultipleSources]); // Include dependencies

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
        logger.error('AuthContext', 'Error initializing auth:', error);
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

      logger.info('AuthContext', 'Auth state change:', { event, hasSession: !!currentSession });

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
  }, [handleAuthState]);

  // ✅ FIX: Memoize auth functions to prevent re-creation
  // Force refresh user role
  const refreshRole = useCallback(async () => {
    if (!session) return;

    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      logger.error('AuthContext', 'Error refreshing session:', error);
      await handleAuthState(session);
    } else if (data.session) {
      await handleAuthState(data.session);
    }
  }, [session, handleAuthState]);

  const signIn = useCallback(async (email: string, password: string) => {
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
      logger.error('AuthContext', 'Sign in error:', error);
      return { error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
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
      logger.error('AuthContext', 'Sign up error:', error);
      return { error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);

      // Clear local state immediately
      setUser(null);
      setSession(null);

      // Clear Supabase session
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('AuthContext', 'Sign out error:', error);
      }

      // Force clear any persisted session data
      localStorage.removeItem('g-admin-auth-token');

      // Navigate after cleanup
      navigate('/login');
    } catch (error) {
      logger.error('AuthContext', 'Sign out error:', error);
      // Even if error, clear local state
      setUser(null);
      setSession(null);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const isAuthenticated = !!user && !!session;

  // ✅ FIX: Memoize helper functions to prevent re-creation
  const isRole = useCallback((role: UserRole | UserRole[]): boolean => {
    if (!user?.role) return false;
    return Array.isArray(role) ? role.includes(user.role) : user.role === role;
  }, [user?.role]);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    return isRole(roles);
  }, [isRole]);

  // ========================================================================
  // MODULE ACCESS & PERMISSIONS (New Granular System)
  // ========================================================================
  // ✅ FIX: Memoized with useCallback to prevent infinite loops in NavigationProvider

  const canAccessModuleImpl = useCallback((module: ModuleName): boolean => {
    if (!user?.role) return false;
    return checkCanAccessModule(user.role, module);
  }, [user?.role]);

  const canPerformActionImpl = useCallback((module: ModuleName, action: PermissionAction): boolean => {
    if (!user?.role) return false;
    return checkPermission(user.role, module, action);
  }, [user?.role]);

  // CRUD Permission Checks
  const canCreateImpl = useCallback((module: ModuleName): boolean =>
    canPerformActionImpl(module, 'create')
    , [canPerformActionImpl]);

  const canReadImpl = useCallback((module: ModuleName): boolean =>
    canPerformActionImpl(module, 'read')
    , [canPerformActionImpl]);

  const canUpdateImpl = useCallback((module: ModuleName): boolean =>
    canPerformActionImpl(module, 'update')
    , [canPerformActionImpl]);

  const canDeleteImpl = useCallback((module: ModuleName): boolean =>
    canPerformActionImpl(module, 'delete')
    , [canPerformActionImpl]);

  // Special Action Permission Checks
  const canVoidImpl = useCallback((module: ModuleName): boolean =>
    canPerformActionImpl(module, 'void')
    , [canPerformActionImpl]);

  const canApproveImpl = useCallback((module: ModuleName): boolean =>
    canPerformActionImpl(module, 'approve')
    , [canPerformActionImpl]);

  const canConfigureImpl = useCallback((module: ModuleName): boolean =>
    canPerformActionImpl(module, 'configure')
    , [canPerformActionImpl]);

  const canExportImpl = useCallback((module: ModuleName): boolean =>
    canPerformActionImpl(module, 'export')
    , [canPerformActionImpl]);


  // ✅ FIX: Memoize contextValue to prevent re-creating object on every render
  const contextValue = useMemo<AuthContextType>(() => ({
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

    // Permissions System (PermissionsRegistry Integration)
    canAccessModule: canAccessModuleImpl,
    canPerformAction: canPerformActionImpl,
    canCreate: canCreateImpl,
    canRead: canReadImpl,
    canUpdate: canUpdateImpl,
    canDelete: canDeleteImpl,
    canVoid: canVoidImpl,
    canApprove: canApproveImpl,
    canConfigure: canConfigureImpl,
    canExport: canExportImpl,
  }), [
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
    canAccessModuleImpl,
    canPerformActionImpl,
    canCreateImpl,
    canReadImpl,
    canUpdateImpl,
    canDeleteImpl,
    canVoidImpl,
    canApproveImpl,
    canConfigureImpl,
    canExportImpl,
  ]);

  // 🔍 DEBUG: Track authentication state changes
  useEffect(() => {
    const authState = {
      isAuthenticated,
      loading,
      userEmail: user?.email || 'null',
      userRole: user?.role || 'null',
      timestamp: new Date().toISOString()
    };
    logger.info('AuthContext', `Auth state changed:`, authState);
    console.log('🔐 [AuthContext] Auth state changed:', authState);
  }, [isAuthenticated, loading, user]);

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
