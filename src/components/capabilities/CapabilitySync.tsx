/**
 * CAPABILITY SYNC COMPONENT v5.0
 *
 * Sincronización automática con Supabase usando TanStack Query.
 *
 * NUEVA ARQUITECTURA:
 * - TanStack Query maneja el caching y sincronización automáticamente
 * - Este componente solo necesita disparar el initial fetch
 * - No más manejo manual de localStorage (TanStack + Zustand persist lo hacen)
 *
 * UBICACIÓN: Montar en App.tsx dentro de AuthProvider
 */

import { useEffect, useState, useRef } from 'react';
import { useBusinessProfile } from '@/lib/capabilities';
import { logger } from '@/lib/logging';

// ⚠️ Flag global para evitar sync duplicado
// (porque CapabilitySync está dentro de AuthProvider que re-renderiza)
let syncCompleted = false;

export function CapabilitySync() {
  // NEW: TanStack Query hook - auto-fetches on mount
  const { profile, isLoading, error, refetch } = useBusinessProfile();
  
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const syncAttempted = useRef(false);

  useEffect(() => {
    // ⚠️ PREVENIR MÚLTIPLES SYNC
    // Si ya se completó el sync O ya intentamos en este componente, salir
    if (syncCompleted || syncAttempted.current) {
      logger.info('CapabilitySync', '⏭️ Sync already completed, skipping');
      return;
    }

    console.log('🔍 [LAYER 1: CapabilitySync] Starting sync...', {
      hasProfile: !!profile,
      isLoading,
      profile
    });

    syncAttempted.current = true;

    async function syncCapabilities() {
      setSyncStatus('loading');

      try {
        logger.info('CapabilitySync', '🔄 Initializing capability sync (TanStack Query)...');

        // TanStack Query ya hizo el fetch automáticamente
        // Solo necesitamos verificar el resultado
        if (profile) {
          console.log('✅ [LAYER 1: CapabilitySync] Profile loaded:', {
            businessName: profile.businessName,
            capabilities: profile.selectedCapabilities,
            infrastructure: profile.selectedInfrastructure,
            setupCompleted: profile.setupCompleted
          });
          logger.info('CapabilitySync', '✅ Profile loaded from cache/DB');
          setSyncStatus('success');
        } else if (!isLoading) {
          // No hay perfil y no está cargando = primera vez
          console.log('⚠️ [LAYER 1: CapabilitySync] No profile found');
          logger.info('CapabilitySync', '📭 No profile found, first time setup needed');
          setSyncStatus('success');
        }

        // Marcar como completado globalmente
        syncCompleted = true;
      } catch (err) {
        console.error('❌ [LAYER 1: CapabilitySync] Sync error:', err);
        logger.error('CapabilitySync', '❌ Sync error', { error: err });
        setSyncStatus('error');
        syncCompleted = true; // Evitar reintentos infinitos
      }
    }

    // Solo ejecutar una vez al montar
    syncCapabilities();
  }, [profile, isLoading]); // Depende de profile e isLoading

  // Log status changes
  useEffect(() => {
    if (syncStatus === 'success' && profile) {
      logger.info('CapabilitySync', '✅ Capability sync completed', {
        businessName: profile.businessName || 'Not set',
        capabilities: profile.selectedCapabilities?.length || 0,
        infrastructure: profile.selectedInfrastructure?.length || 0,
        setupCompleted: profile.setupCompleted
      });
    }
  }, [syncStatus, profile]);

  // Log errors
  useEffect(() => {
    if (error) {
      logger.error('CapabilitySync', '❌ TanStack Query error', { error });
      setSyncStatus('error');
    }
  }, [error]);

  // Este componente no renderiza nada (solo lógica)
  return null;
}

/**
 * Reset sync flag (para testing o forzar re-sync)
 */
export function resetCapabilitySyncFlag() {
  syncCompleted = false;
  logger.info('CapabilitySync', '🔄 Sync flag reset');
}
