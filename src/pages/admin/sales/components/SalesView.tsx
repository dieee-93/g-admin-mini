// UnifiedSalesView.tsx - Smart Sales View with Automatic Online/Offline Detection
// Eliminates duplicate POS tabs by intelligently switching between implementations

import React, { useEffect, useMemo } from 'react';
import { Stack, Typography, Card } from '@/shared/ui';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { notify } from '@/lib/notifications';
import { POSConnectionBadge } from '@/shared/ui/ConnectionBadge';

// Import both implementations
import { SalesWithStockView } from './SaleWithStockView';
import { OfflineSalesView } from './OfflineSalesView';

interface UnifiedSalesViewProps {
  // Optional props to customize behavior
  forceMode?: 'auto' | 'online' | 'offline';
  showConnectionStatus?: boolean;
}

export function SalesView({ 
  forceMode = 'auto',
  showConnectionStatus = true 
}: UnifiedSalesViewProps) {
  const {
    isOnline,
    connectionQuality,
    lastOnline
  } = useOfflineStatus();

  // Determine which implementation to use
  const effectiveMode = useMemo(() => {
    if (forceMode === 'online') return 'online';
    if (forceMode === 'offline') return 'offline';
    
    // Auto mode: decide based on connection quality
    if (!isOnline) return 'offline';
    if (connectionQuality === 'poor' || connectionQuality === 'offline') return 'offline';
    return 'online';
  }, [isOnline, connectionQuality, forceMode]);

  // Status description based on mode
  const getStatusDescription = () => {
    if (effectiveMode === 'offline') {
      return isOnline 
        ? 'Modo offline activado para mayor estabilidad'
        : 'Sin conexión - todas las operaciones se guardan localmente';
    }
    return 'Conectado - operaciones en tiempo real';
  };

  // Notify user of mode changes (only once per change)
  useEffect(() => {
    const now = Date.now();
    const lastNotification = localStorage.getItem('sales_mode_notification');
    
    // Only notify if enough time has passed (prevent spam)
    if (!lastNotification || now - parseInt(lastNotification) > 10000) {
      if (effectiveMode === 'offline' && isOnline) {
        notify.info({ title: 'POS trabajando offline - conexión inestable detectada' });
      } else if (effectiveMode === 'online' && lastOnline) {
        notify.success({ title: 'POS conectado - sincronizando datos' });
      }
      localStorage.setItem('sales_mode_notification', now.toString());
    }
  }, [effectiveMode, isOnline, lastOnline]);

  return (
    <Stack gap="md">
      {/* Connection Status Header */}
      {showConnectionStatus && (
        <CardWrapper>
          <Stack direction="row" justify="space-between" align="center">
            <Typography variant="body" size="sm" color="text.secondary">
              {getStatusDescription()}
            </Typography>
            <POSConnectionBadge 
              showText={true}
              showIcon={true}
              showQueueSize={true}
              size="md"
              variant="subtle"
            />
          </Stack>
        </CardWrapper>
      )}

      {/* Render appropriate implementation */}
      <Stack>
        {effectiveMode === 'offline' ? (
          <OfflineSalesView />
        ) : (
          <SalesWithStockView />
        )}
      </Stack>
    </Stack>
  );
}

export default SalesView;