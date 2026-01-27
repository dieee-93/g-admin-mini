/**
 * OfflineSalesHeader Component
 * Header section for OfflineSalesView with connection status and actions
 * 
 * EXTRACTED FROM: OfflineSalesView.tsx (lines 503-583)
 */

import { Stack, Button, Typography, Badge } from '@/shared/ui';
import {
  CreditCardIcon,
  ArrowPathIcon,
  CloudIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  WifiIcon,
} from '@heroicons/react/24/outline';
import {
  WifiIcon as WifiOffIcon
} from '@heroicons/react/24/solid';

interface OfflineSalesHeaderProps {
  // Connection status
  isOnline: boolean;
  isConnecting: boolean;
  connectionQuality: string;
  
  // Sync status
  isSyncing: boolean;
  syncProgress: number;
  queueSize: number;
  offlineSalesCount: number;
  
  // Cart summary
  cartItemCount: number;
  hasItems: boolean;
  isValidating: boolean;
  isProcessing: boolean;
  
  // Actions
  onShowOfflineStatus: () => void;
  onForceSync: () => void;
  onValidateStock: () => void;
  onOpenCheckout: () => void;
}

export function OfflineSalesHeader({
  isOnline,
  isConnecting,
  connectionQuality,
  isSyncing,
  syncProgress,
  queueSize,
  offlineSalesCount,
  cartItemCount,
  hasItems,
  isValidating,
  isProcessing,
  onShowOfflineStatus,
  onForceSync,
  onValidateStock,
  onOpenCheckout,
}: OfflineSalesHeaderProps) {
  
  const getConnectionStatusColor = () => {
    if (!isOnline) return 'red';
    if (isConnecting) return 'yellow';
    if (connectionQuality === 'good') return 'green';
    if (connectionQuality === 'fair') return 'yellow';
    return 'red';
  };

  const getConnectionStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isConnecting) return 'Conectando...';
    return `Online (${connectionQuality})`;
  };

  return (
    <Stack direction="row" justify="space-between" align="center">
      {/* Title and Status */}
      <Stack direction="column" align="start" gap="xs">
        <Stack direction="row" align="center" gap="sm">
          <Typography variant="heading" size="xl" weight="bold">
            POS Offline-First
          </Typography>
          <Badge 
            colorPalette={getConnectionStatusColor()} 
            variant="subtle"
          >
            <Stack direction="row" gap="xs" align="center">
              {isOnline ? <WifiIcon className="w-3 h-3" /> : <WifiOffIcon className="w-3 h-3" />}
              <Typography variant="body" size="xs">{getConnectionStatusText()}</Typography>
            </Stack>
          </Badge>
        </Stack>
        <Typography variant="body" size="md" color="text.muted">
          Sistema de ventas con capacidad offline completa
        </Typography>
      </Stack>
      
      {/* Actions */}
      <Stack direction="row" gap="md">
        {/* Offline Sales Indicator */}
        {offlineSalesCount > 0 && (
          <Button
            variant="outline"
            colorPalette="orange"
            onClick={onShowOfflineStatus}
            title={`${offlineSalesCount} ventas pendientes de sincronización`}
          >
            <ClockIcon className="w-4 h-4" />
            {offlineSalesCount} Offline
          </Button>
        )}

        {/* Sync Progress */}
        {isSyncing && (
          <Stack direction="column" minW="120px" gap="xs">
            <Typography variant="body" size="xs">Sincronizando...</Typography>
            <Typography variant="body" size="xs">{syncProgress}%</Typography>
          </Stack>
        )}

        {/* Manual Sync Button */}
        {queueSize > 0 && (
          <Button
            variant="outline"
            colorPalette="blue"
            onClick={onForceSync}
            loading={isSyncing}
          >
            <CloudIcon className="w-4 h-4" />
            Sincronizar ({queueSize})
          </Button>
        )}

        {/* Stock Validation */}
        <Button
          variant="outline"
          colorPalette="blue"
          onClick={onValidateStock}
          loading={isValidating}
          disabled={!hasItems}
        >
          <ArrowPathIcon className="w-4 h-4" />
          Revalidar Stock
        </Button>
        
        {/* Checkout Button */}
        <Button
          colorPalette="green"
          onClick={onOpenCheckout}
          disabled={!hasItems || isValidating}
          loading={isProcessing}
        >
          <CreditCardIcon className="w-4 h-4" />
          Finalizar Venta ({cartItemCount})
        </Button>
      </Stack>
    </Stack>
  );
}
