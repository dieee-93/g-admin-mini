/**
 * CAPABILITY SYNC COMPONENT
 *
 * Sincronización automática entre localStorage y Supabase
 *
 * FLUJO:
 * 1. App monta → Intentar cargar desde Supabase
 * 2. Si existe en DB → Cargar desde allí (prioridad)
 * 3. Si NO existe en DB → Usar localStorage (persist middleware)
 * 4. Guardar en DB cuando se completa el setup
 *
 * UBICACIÓN: Montar en App.tsx dentro de AuthProvider
 */

import { useEffect, useState } from 'react';
import { useCapabilityStore } from '@/store/capabilityStore';
import { logger } from '@/lib/logging';

export function CapabilitySync() {
  const loadFromDB = useCapabilityStore(state => state.loadFromDB);
  const profile = useCapabilityStore(state => state.profile);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    async function syncCapabilities() {
      setSyncStatus('loading');

      try {
        logger.info('CapabilitySync', '🔄 Initializing capability sync...');

        // Intentar cargar desde DB
        const loadedFromDB = await loadFromDB();

        if (loadedFromDB) {
          logger.info('CapabilitySync', '✅ Capabilities loaded from Supabase');
          setSyncStatus('success');
        } else {
          logger.info('CapabilitySync', '📭 No DB profile, using localStorage');
          setSyncStatus('success');
        }
      } catch (error) {
        logger.error('CapabilitySync', '❌ Sync error, falling back to localStorage', { error });
        setSyncStatus('error');
      }
    }

    // Solo ejecutar una vez al montar
    syncCapabilities();
  }, []); // Empty deps = run once on mount

  // Log status changes
  useEffect(() => {
    if (syncStatus === 'success' && profile) {
      logger.info('CapabilitySync', '✅ Capability sync completed', {
        businessName: profile.businessName || 'Not set',
        activities: profile.selectedActivities?.length || 0,
        infrastructure: profile.selectedInfrastructure?.length || 0,
        setupCompleted: profile.setupCompleted
      });
    }
  }, [syncStatus, profile]);

  // Este componente no renderiza nada (solo lógica)
  return null;
}
