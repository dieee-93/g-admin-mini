import { useState, useCallback } from 'react';

export interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

export interface UseSupabaseConnectionReturn {
  // State
  supabaseUrl: string;
  supabaseAnonKey: string;
  error: string | null;
  isConnecting: boolean;
  
  // Actions
  setSupabaseUrl: (url: string) => void;
  setSupabaseAnonKey: (key: string) => void;
  setError: (error: string | null) => void;
  handleConnect: () => void;
  handleUseDemo: () => void;
  clearError: () => void;
  
  // Computed
  canConnect: boolean;
}

interface UseSupabaseConnectionProps {
  onConnectionSuccess: (url: string, anonKey: string) => void;
  isConnecting?: boolean;
}

export function useSupabaseConnection({
  onConnectionSuccess,
  isConnecting = false
}: UseSupabaseConnectionProps): UseSupabaseConnectionReturn {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const validateCredentials = useCallback((url: string, key: string): string | null => {
    if (!url || !key) {
      return 'Por favor, completa ambos campos';
    }

    if (!url.includes('supabase.co')) {
      return 'La URL debe ser de Supabase (debe contener "supabase.co")';
    }

    if (key.length < 100) {
      return 'La clave anónima parece ser muy corta. Verifica que sea correcta.';
    }

    return null;
  }, []);

  const handleConnect = useCallback(() => {
    console.log('🔌 Iniciando conexión a Supabase...', { 
      supabaseUrl, 
      supabaseAnonKeyLength: supabaseAnonKey.length 
    });
    
    setError(null);

    // Validaciones
    const validationError = validateCredentials(supabaseUrl, supabaseAnonKey);
    if (validationError) {
      console.warn('❌ Validación fallida:', validationError);
      setError(validationError);
      return;
    }

    console.log('✅ Validaciones pasadas, llamando onConnectionSuccess...');
    onConnectionSuccess(supabaseUrl, supabaseAnonKey);
  }, [supabaseUrl, supabaseAnonKey, onConnectionSuccess, validateCredentials]);

  const handleUseDemo = useCallback(() => {
    console.log('🎮 Usando configuración de demo...');
    setError(null);
    
    // Usar las variables de entorno o datos de demo
    const demoUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co';
    const demoKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8tcHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1MDA0ODAwLCJleHAiOjE5NjAzODA4MDB9.demo-key-for-testing-purposes-only';
    
    console.log('🔧 Configuración de demo:', { demoUrl, demoKeyLength: demoKey.length });
    
    setSupabaseUrl(demoUrl);
    setSupabaseAnonKey(demoKey);
    
    // Auto-conectar después de un momento
    setTimeout(() => {
      console.log('⏰ Auto-conectando con demo data...');
      onConnectionSuccess(demoUrl, demoKey);
    }, 500);
  }, [onConnectionSuccess]);

  const canConnect = Boolean(supabaseUrl && supabaseAnonKey && !isConnecting);

  return {
    // State
    supabaseUrl,
    supabaseAnonKey,
    error,
    isConnecting,
    
    // Actions
    setSupabaseUrl,
    setSupabaseAnonKey,
    setError,
    handleConnect,
    handleUseDemo,
    clearError,
    
    // Computed
    canConnect,
  };
}