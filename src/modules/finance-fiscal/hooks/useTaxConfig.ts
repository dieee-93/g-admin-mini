/**
 * Tax Configuration - TanStack Query Hooks
 * Server state management for fiscal/tax configuration
 * 
 * Pattern: Following Cash Module architecture
 * Reference: CASH_MODULE_TANSTACK_QUERY_MIGRATION.md
 * 
 * @module finance-fiscal
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';

// ============================================
// TYPES
// ============================================

export interface TaxConfig {
  id: string;
  tax_id?: string;              // Generic tax identification number
  afip_cuit?: string;           // CUIT for Argentina (AFIP)
  invoicing_enabled: boolean;   // Whether invoicing is enabled
  default_tax_rate?: number;    // Default tax rate percentage
  tax_category?: string;        // Tax category/regime
  created_at?: string;
  updated_at?: string;
}

export interface AFIPConfig {
  cuit: string;
  punto_venta: number;
  condicion_iva: string;
  inicio_actividades: string;
  ingresos_brutos?: string;
}

// ============================================
// QUERY KEYS
// ============================================

export const taxConfigKeys = {
  all: ['tax-config'] as const,
  config: () => [...taxConfigKeys.all, 'main'] as const,
  afip: () => [...taxConfigKeys.all, 'afip'] as const,
};

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch tax configuration
 */
async function fetchTaxConfig(): Promise<TaxConfig | null> {
  try {
    const { data, error } = await supabase
      .from('tax_config')
      .select('*')
      .maybeSingle();

    if (error) throw error;

    logger.info('TaxConfigApi', 'Fetched tax configuration');
    return data;

  } catch (error) {
    logger.error('TaxConfigApi', 'Failed to fetch tax config', error);
    throw error;
  }
}

/**
 * Update tax configuration
 */
async function upsertTaxConfig(config: Partial<TaxConfig>): Promise<TaxConfig> {
  try {
    const { data, error } = await supabase
      .from('tax_config')
      .upsert({
        ...config,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    logger.info('TaxConfigApi', 'Updated tax configuration');
    return data;

  } catch (error) {
    logger.error('TaxConfigApi', 'Failed to update tax config', error);
    throw error;
  }
}

/**
 * Fetch AFIP configuration
 */
async function fetchAFIPConfig(): Promise<AFIPConfig | null> {
  try {
    const { data, error } = await supabase
      .from('afip_config')
      .select('*')
      .maybeSingle();

    if (error) throw error;

    logger.info('AFIPConfigApi', 'Fetched AFIP configuration');
    return data;

  } catch (error) {
    logger.error('AFIPConfigApi', 'Failed to fetch AFIP config', error);
    throw error;
  }
}

/**
 * Update AFIP configuration
 */
async function upsertAFIPConfig(config: Partial<AFIPConfig>): Promise<AFIPConfig> {
  try {
    const { data, error } = await supabase
      .from('afip_config')
      .upsert({
        ...config,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    logger.info('AFIPConfigApi', 'Updated AFIP configuration');
    return data;

  } catch (error) {
    logger.error('AFIPConfigApi', 'Failed to update AFIP config', error);
    throw error;
  }
}

// ============================================
// QUERIES
// ============================================

/**
 * Hook to fetch tax configuration
 */
export function useTaxConfig() {
  return useQuery({
    queryKey: taxConfigKeys.config(),
    queryFn: fetchTaxConfig,
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes
  });
}

/**
 * Hook to fetch AFIP configuration
 */
export function useAFIPConfig() {
  return useQuery({
    queryKey: taxConfigKeys.afip(),
    queryFn: fetchAFIPConfig,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook to update tax configuration
 */
export function useUpdateTaxConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Partial<TaxConfig>) => {
      return await upsertTaxConfig(config);
    },
    onMutate: async (config) => {
      await queryClient.cancelQueries({ queryKey: taxConfigKeys.config() });

      const previousConfig = queryClient.getQueryData(taxConfigKeys.config());

      queryClient.setQueryData(taxConfigKeys.config(), (old: TaxConfig | null) => {
        if (!old) return config as TaxConfig;
        return { ...old, ...config };
      });

      return { previousConfig };
    },
    onError: (error, _, context) => {
      if (context?.previousConfig) {
        queryClient.setQueryData(taxConfigKeys.config(), context.previousConfig);
      }
      logger.error('useUpdateTaxConfig', 'Failed to update tax config', error);
      notify.error({
        title: 'Error al actualizar configuración fiscal',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxConfigKeys.config() });
      notify.success({
        title: 'Configuración actualizada',
        description: 'Configuración fiscal actualizada correctamente'
      });
    },
  });
}

/**
 * Hook to update AFIP configuration
 */
export function useUpdateAFIPConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Partial<AFIPConfig>) => {
      return await upsertAFIPConfig(config);
    },
    onMutate: async (config) => {
      await queryClient.cancelQueries({ queryKey: taxConfigKeys.afip() });

      const previousConfig = queryClient.getQueryData(taxConfigKeys.afip());

      queryClient.setQueryData(taxConfigKeys.afip(), (old: AFIPConfig | null) => {
        if (!old) return config as AFIPConfig;
        return { ...old, ...config };
      });

      return { previousConfig };
    },
    onError: (error, _, context) => {
      if (context?.previousConfig) {
        queryClient.setQueryData(taxConfigKeys.afip(), context.previousConfig);
      }
      logger.error('useUpdateAFIPConfig', 'Failed to update AFIP config', error);
      notify.error({
        title: 'Error al actualizar configuración AFIP',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxConfigKeys.afip() });
      notify.success({
        title: 'Configuración AFIP actualizada',
        description: 'Configuración de AFIP actualizada correctamente'
      });
    },
  });
}

/**
 * Hook to toggle invoicing
 */
export function useToggleInvoicing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      return await upsertTaxConfig({ invoicing_enabled: enabled });
    },
    onSuccess: (_, enabled) => {
      queryClient.invalidateQueries({ queryKey: taxConfigKeys.config() });
      notify.success({
        title: enabled ? 'Facturación activada' : 'Facturación desactivada',
        description: enabled 
          ? 'El sistema de facturación ha sido activado' 
          : 'El sistema de facturación ha sido desactivado'
      });
    },
    onError: (error) => {
      logger.error('useToggleInvoicing', 'Failed to toggle invoicing', error);
      notify.error({
        title: 'Error al cambiar facturación',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    },
  });
}
