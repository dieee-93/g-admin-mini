// UnifiedMaterialsView.tsx - Smart Materials View with Automatic Online/Offline Detection
// Intelligently switches between MaterialsPage and OfflineMaterialsPage based on connection

import React, { useEffect, useMemo } from 'react';
import { ContentLayout, Section, Badge, Alert, Icon } from '@/shared/ui';
import { 
  WifiIcon, 
  CloudIcon, 
  ExclamationTriangleIcon,
  CubeIcon 
} from '@heroicons/react/24/outline';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { notify } from '@/lib/notifications';

// Import both implementations
import MaterialsPage from '../../page';
import OfflineMaterialsPage from '../OfflineMode/OfflineMaterialsPage';

interface UnifiedMaterialsViewProps {
  // Optional props to customize behavior
  forceMode?: 'auto' | 'online' | 'offline';
  showConnectionStatus?: boolean;
}

export function MaterialsView({ 
  forceMode = 'auto',
  showConnectionStatus = true 
}: UnifiedMaterialsViewProps) {
  const {
    isOnline,
    connectionQuality,
    isSyncing,
    queueSize,
    lastOnline
  } = useOfflineStatus();

  // Determine which implementation to use
  const effectiveMode = useMemo(() => {
    if (forceMode === 'online') return 'online';
    if (forceMode === 'offline') return 'offline';
    
    // Auto mode: Materials benefits more from offline-first due to stock adjustments
    // Use offline mode if connection is unstable to prevent data loss
    if (!isOnline) return 'offline';
    if (connectionQuality === 'poor' || connectionQuality === 'offline') return 'offline';
    
    // Only use online mode for excellent connections
    return connectionQuality === 'excellent' ? 'online' : 'offline';
  }, [isOnline, connectionQuality, forceMode]);

  // Connection status indicator
  const getConnectionStatus = () => {
    if (isSyncing) {
      return {
        icon: CloudIcon,
        color: 'yellow',
        text: `Sincronizando inventario${queueSize > 0 ? ` (${queueSize} operaciones)` : ''}`,
        description: 'Actualizando datos de inventario...'
      };
    }

    switch (effectiveMode) {
      case 'online':
        return {
          icon: WifiIcon,
          color: 'green',
          text: 'Inventario Online',
          description: 'Conectado - actualizaciones en tiempo real'
        };
      case 'offline':
        return {
          icon: CloudIcon,
          color: 'blue',
          text: queueSize > 0 ? `Inventario Local (${queueSize} cambios)` : 'Inventario Local',
          description: isOnline 
            ? 'Trabajando localmente - cambios se sincronizarán automáticamente'
            : 'Sin conexión - cambios guardados localmente'
        };
      default:
        return {
          icon: ExclamationTriangleIcon,
          color: 'orange',
          text: 'Detectando conexión...',
          description: 'Verificando estado de red'
        };
    }
  };

  const status = getConnectionStatus();

  // Notify user of mode changes (prevent spam notifications)
  useEffect(() => {
    const now = Date.now();
    const lastNotification = localStorage.getItem('materials_mode_notification');
    
    // Only notify if enough time has passed (prevent spam)
    if (!lastNotification || now - parseInt(lastNotification) > 10000) {
      if (effectiveMode === 'offline' && isOnline) {
        notify.info('Inventario en modo local - conexión inestable detectada');
      } else if (effectiveMode === 'online' && lastOnline) {
        notify.success('Inventario conectado - sincronizando datos');
      }
      localStorage.setItem('materials_mode_notification', now.toString());
    }
  }, [effectiveMode, isOnline, lastOnline]);

  return (
    <div>
      {/* Connection Status Header */}
      {showConnectionStatus && (
        <Section variant="flat" style={{ marginBottom: '1rem' }}>
          <Alert 
            status={status.color === 'red' ? 'error' : 
                   status.color === 'yellow' ? 'warning' : 
                   status.color === 'green' ? 'success' : 'info'}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon icon={CubeIcon} size="sm" />
                <span>{status.text}</span>
                <Badge 
                  colorPalette={status.color} 
                  variant="outline" 
                  size="sm"
                >
                  {effectiveMode === 'online' ? 'Tiempo Real' : 'Seguro Local'}
                </Badge>
              </div>
            }
          >
            {status.description}
          </Alert>
        </Section>
      )}

      {/* Render appropriate implementation */}
      <div>
        {effectiveMode === 'offline' ? (
          <OfflineMaterialsPage />
        ) : (
          <MaterialsPage />
        )}
      </div>
    </div>
  );
}

export default MaterialsView;