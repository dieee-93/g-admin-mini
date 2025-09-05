// useKitchenConfig.ts - Kitchen Configuration Management Hook
// Migrates kitchen configuration from localStorage to Supabase user preferences

import { useState, useEffect, useCallback } from 'react';
import { updateSystemSettings, getSystemSettings } from '@/pages/admin/settings/services/settingsApi';
import { notify } from '@/lib/notifications';

// Kitchen mode configuration types
export type KitchenMode = 'auto' | 'online-first' | 'offline-first' | 'offline-only';
export type EffectiveMode = 'online-active' | 'offline-active' | 'hybrid-active' | 'emergency-offline';

export interface KitchenConfig {
  mode: KitchenMode;
  autoFallback: boolean;
  emergencyOverride: boolean;
  showConnectionIndicator: boolean;
  lastChanged: number;
  userPreference: string;
}

const DEFAULT_CONFIG: KitchenConfig = {
  mode: 'offline-first', // Most reliable default
  autoFallback: true,
  emergencyOverride: true,
  showConnectionIndicator: true,
  lastChanged: Date.now(),
  userPreference: 'reliable-offline-first'
};

export interface UseKitchenConfigReturn {
  config: KitchenConfig;
  isLoading: boolean;
  error: string | null;
  updateConfig: (updates: Partial<KitchenConfig>) => Promise<void>;
  resetToDefault: () => Promise<void>;
  migrateFromLocalStorage: () => Promise<void>;
}

/**
 * Hook to manage kitchen configuration with Supabase persistence
 * Replaces localStorage with proper database storage
 */
export function useKitchenConfig(): UseKitchenConfigReturn {
  const [config, setConfig] = useState<KitchenConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load configuration from Supabase
  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const systemSettings = await getSystemSettings();
      
      // Kitchen config is stored as part of system settings
      const kitchenConfig = (systemSettings as any).kitchen_config as KitchenConfig;
      
      if (kitchenConfig) {
        setConfig({ ...DEFAULT_CONFIG, ...kitchenConfig });
      } else {
        // No config exists yet, use defaults
        setConfig(DEFAULT_CONFIG);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load kitchen configuration';
      setError(errorMessage);
      console.error('Error loading kitchen config:', err);
      
      // Fallback to default config
      setConfig(DEFAULT_CONFIG);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update configuration in Supabase
  const updateConfig = useCallback(async (updates: Partial<KitchenConfig>) => {
    try {
      setError(null);

      const updatedConfig = {
        ...config,
        ...updates,
        lastChanged: Date.now()
      };

      // Update in Supabase
      await updateSystemSettings(
        { kitchen_config: updatedConfig },
        'current_user' // TODO: Get actual user ID from auth
      );

      setConfig(updatedConfig);
      
      notify.success({
        title: 'Kitchen Configuration Updated',
        description: 'Your settings have been saved successfully'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update kitchen configuration';
      setError(errorMessage);
      console.error('Error updating kitchen config:', err);
      
      notify.error({
        title: 'Configuration Update Failed',
        description: errorMessage
      });
    }
  }, [config]);

  // Reset to default configuration
  const resetToDefault = useCallback(async () => {
    try {
      await updateConfig(DEFAULT_CONFIG);
      
      notify.success({
        title: 'Configuration Reset',
        description: 'Kitchen settings have been reset to defaults'
      });
    } catch (err) {
      console.error('Error resetting kitchen config:', err);
    }
  }, [updateConfig]);

  // Migrate from localStorage to Supabase
  const migrateFromLocalStorage = useCallback(async () => {
    try {
      const localStorageConfig = localStorage.getItem('kitchen_config');
      
      if (localStorageConfig) {
        const parsedConfig = JSON.parse(localStorageConfig) as Partial<KitchenConfig>;
        
        // Merge with defaults and update in Supabase
        const migratedConfig = { ...DEFAULT_CONFIG, ...parsedConfig };
        await updateConfig(migratedConfig);
        
        // Remove from localStorage after successful migration
        localStorage.removeItem('kitchen_config');
        
        notify.info({
          title: 'Configuration Migrated',
          description: 'Kitchen settings have been moved to your user preferences'
        });
        
        console.log('Kitchen configuration migrated from localStorage to Supabase');
      }
    } catch (err) {
      console.error('Error migrating kitchen config from localStorage:', err);
    }
  }, [updateConfig]);

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Auto-migration on first load
  useEffect(() => {
    if (!isLoading && !error) {
      migrateFromLocalStorage();
    }
  }, [isLoading, error, migrateFromLocalStorage]);

  return {
    config,
    isLoading,
    error,
    updateConfig,
    resetToDefault,
    migrateFromLocalStorage
  };
}

// Kitchen Mode Descriptions for UI
export const KITCHEN_MODE_DESCRIPTIONS = {
  'auto': {
    label: 'Auto (Smart Detection)',
    description: 'Automatically adapts based on connection quality and workload',
    reliability: 'adaptive'
  },
  'online-first': {
    label: 'Online First',
    description: 'Prioritizes real-time features, falls back to offline when needed',
    reliability: 'high-when-connected'
  },
  'offline-first': {
    label: 'Offline First (Recommended)',
    description: 'Prioritizes reliability, syncs when connection is stable',
    reliability: 'very-high'
  },
  'offline-only': {
    label: 'Offline Only',
    description: 'Local operations only, no network dependency',
    reliability: 'maximum'
  }
} as const;