// 💾 HOOK DE AUTO-SAVE PARA CONFIGURACIONES G-ADMIN v2.1
// Sistema inteligente de guardado automático con debounce y estado visual
import { useState, useEffect, useCallback, useRef } from 'react';
import { toaster } from '@/shared/ui';
import { logger } from '@/lib/logging';

interface AutoSaveOptions {
  enabled?: boolean;
  debounceMs?: number;
  showNotifications?: boolean;
  maxRetries?: number;
}

interface AutoSaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
  hasUnsavedChanges: boolean;
}

export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  options: AutoSaveOptions = {}
) {
  const {
    enabled = true,
    debounceMs = 2000,
    showNotifications = true,
    maxRetries = 3
  } = options;

  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    status: 'idle',
    hasUnsavedChanges: false
  });

  const timeoutRef = useRef<number>();
  const retryCountRef = useRef(0);
  const lastDataRef = useRef<T>(data);
  const isMountedRef = useRef(true);

  // 🎯 Función de guardado con retry
  const performSave = useCallback(async (dataToSave: T) => {
    if (!enabled || !isMountedRef.current) return;

    try {
      setAutoSaveState(prev => ({ 
        ...prev, 
        status: 'saving',
        error: undefined 
      }));

      await saveFunction(dataToSave);

      if (isMountedRef.current) {
        setAutoSaveState(prev => ({
          ...prev,
          status: 'saved',
          lastSaved: new Date(),
          hasUnsavedChanges: false
        }));

        if (showNotifications) {
          toaster.create({
            title: 'Configuración guardada automáticamente',
            type: 'success',
            duration: 2000
          });
        }

        retryCountRef.current = 0;
        logger.info('App', 'Configuration saved successfully');
      }

    } catch (error: any) {
      if (!isMountedRef.current) return;

      const errorMessage = error.message || 'Error al guardar';
      
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        logger.warn('App', `Save failed, retry ${retryCountRef.current}/${maxRetries}`, { error: errorMessage });
        
        // Retry con backoff exponencial
        setTimeout(() => {
          if (isMountedRef.current) {
            performSave(dataToSave);
          }
        }, 1000 * Math.pow(2, retryCountRef.current - 1));
        
      } else {
        setAutoSaveState(prev => ({
          ...prev,
          status: 'error',
          error: errorMessage,
          hasUnsavedChanges: true
        }));

        if (showNotifications) {
          toaster.create({
            title: `Error al guardar: ${errorMessage}`,
            type: 'error',
            duration: 4000
          });
        }

        logger.error('App', 'Save failed after max retries', { 
          error: errorMessage, 
          retries: maxRetries 
        });

        retryCountRef.current = 0;
      }
    }
  }, [enabled, saveFunction, showNotifications, maxRetries]);

  // 🎯 Debounced auto-save
  const debouncedSave = useCallback((newData: T) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setAutoSaveState(prev => ({
      ...prev,
      hasUnsavedChanges: true,
      status: prev.status === 'error' ? 'idle' : prev.status
    }));

    timeoutRef.current = window.setTimeout(() => {
      performSave(newData);
    }, debounceMs);

  }, [debounceMs, performSave]);

  // 🎯 Detectar cambios en los datos
  useEffect(() => {
    if (!enabled) return;

    // Comparación profunda simple
    const dataChanged = JSON.stringify(data) !== JSON.stringify(lastDataRef.current);
    
    if (dataChanged) {
      lastDataRef.current = data;
      debouncedSave(data);
    }
  }, [data, enabled, debouncedSave]);

  // 🎯 Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 🎯 Funciones de control manual
  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    performSave(data);
  }, [data, performSave]);

  const cancelPendingSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setAutoSaveState(prev => ({
        ...prev,
        hasUnsavedChanges: false,
        status: 'idle'
      }));
    }
  }, []);

  const retry = useCallback(() => {
    if (autoSaveState.status === 'error') {
      retryCountRef.current = 0;
      performSave(data);
    }
  }, [autoSaveState.status, data, performSave]);

  return {
    autoSaveState,
    forceSave,
    cancelPendingSave,
    retry,
    
    // Estado helpers
    isLoading: autoSaveState.status === 'saving',
    hasError: autoSaveState.status === 'error',
    hasUnsavedChanges: autoSaveState.hasUnsavedChanges,
    lastSaved: autoSaveState.lastSaved
  };
}

// 🎯 Hook específico para configuraciones de settings
export function useSettingsAutoSave(settingsData: any) {
  const saveSettings = useCallback(async (data: any) => {
    // Simular guardado de configuraciones
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // En producción aquí iría la llamada a Supabase
    // await updateSettingsInDatabase(data);
    
    logger.info('App', 'Settings auto-saved successfully', data);
  }, []);

  return useAutoSave(settingsData, saveSettings, {
    enabled: true,
    debounceMs: 1500, // Más rápido para configuraciones
    showNotifications: false, // Las configuraciones son menos críticas
    maxRetries: 2
  });
}