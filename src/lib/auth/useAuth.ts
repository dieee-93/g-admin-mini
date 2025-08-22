import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { authService, type AuthUser, type LoginCredentials, type RegisterCredentials } from './authService';
import { User, UserRole } from './types';
import type { AuthError } from '@supabase/supabase-js';

export interface UseAuthReturn {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  signIn: (credentials: LoginCredentials) => Promise<boolean>;
  signUp: (credentials: RegisterCredentials) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get user from store
  const { user: storeUser } = useAppStore();
  
  const user: User | null = storeUser.id ? {
    id: storeUser.id,
    email: storeUser.email || '',
    role: storeUser.role as UserRole,
    full_name: storeUser.full_name || '',
    avatar_url: storeUser.avatar_url || '',
    created_at: storeUser.created_at || new Date().toISOString(),
    last_sign_in_at: storeUser.last_sign_in_at,
  } : null;

  const isAuthenticated = user !== null;

  const signIn = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { user: authUser, error: authError } = await authService.signIn(credentials);
      
      if (authError) {
        setError(getAuthErrorMessage(authError));
        return false;
      }
      
      if (authUser) {
        return true;
      }
      
      setError('Error inesperado durante el inicio de sesión');
      return false;
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
      console.error('Sign in error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (credentials: RegisterCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { user: authUser, error: authError } = await authService.signUp(credentials);
      
      if (authError) {
        setError(getAuthErrorMessage(authError));
        return false;
      }
      
      if (authUser) {
        return true;
      }
      
      // No user returned but no error means email confirmation required
      setError('Registro exitoso. Por favor confirma tu email para continuar.');
      return true; // Return true because registration was successful
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
      console.error('Sign up error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    console.log('🟠 useAuth signOut function called');
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🟠 Calling authService.signOut()...');
      const { error: authError } = await authService.signOut();
      console.log('🟠 authService.signOut() result:', { error: authError });
      
      if (authError) {
        console.log('🟠 AuthError detected:', authError);
        setError(getAuthErrorMessage(authError));
      } else {
        console.log('🟠 No authError, sign out successful');
      }
    } catch (error) {
      console.log('🟠 Exception in signOut:', error);
      setError('Error al cerrar sesión');
      console.error('Sign out error:', error);
    } finally {
      console.log('🟠 signOut finally block, setting isLoading to false');
      setIsLoading(false);
    }
    
    console.log('🟠 useAuth signOut function finished');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: authError } = await authService.resetPassword(email);
      
      if (authError) {
        setError(getAuthErrorMessage(authError));
        return false;
      }
      
      return true;
    } catch (error) {
      setError('Error al enviar email de recuperación');
      console.error('Reset password error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: authError } = await authService.updatePassword(password);
      
      if (authError) {
        setError(getAuthErrorMessage(authError));
        return false;
      }
      
      return true;
    } catch (error) {
      setError('Error al actualizar contraseña');
      console.error('Update password error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
  };
}

/**
 * Convert Supabase auth errors to user-friendly Spanish messages
 */
function getAuthErrorMessage(error: AuthError): string {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Email o contraseña incorrectos';
    case 'Email not confirmed':
      return 'Por favor confirma tu email antes de iniciar sesión';
    case 'Password should be at least 6 characters':
      return 'La contraseña debe tener al menos 6 caracteres';
    case 'User already registered':
      return 'Este email ya está registrado';
    case 'Invalid email':
      return 'Email inválido';
    case 'Signup requires a valid password':
      return 'Se requiere una contraseña válida';
    case 'Network error':
      return 'Error de conexión. Verifica tu internet.';
    case 'Email rate limit exceeded':
      return 'Demasiados intentos. Intenta en unos minutos.';
    default:
      return error.message || 'Error de autenticación';
  }
}

