// ConnectionBadge.tsx - Universal Connection Status Indicator
// ChakraUI v3.23.0 Compatible - G-Admin Mini
// Provides consistent connection status across all modules
import React from 'react';
import {
  Badge,
  Box,
  Spinner,
  Text,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent
} from '@chakra-ui/react';
import { Typography, Icon } from '@/shared/ui';
import {
  WifiIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useOfflineStatus } from '../../lib/offline/useOfflineStatus';

export interface ConnectionBadgeProps {
  showText?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'subtle' | 'outline';
  showQueueSize?: boolean;
  showLastSync?: boolean;
  contextLabel?: string;
}

export function ConnectionBadge({
  showText = true,
  showIcon = true,
  size = 'sm',
  variant = 'subtle',
  showQueueSize = true,
  showLastSync = false,
  contextLabel
}: ConnectionBadgeProps) {
  const { isOnline, connectionQuality, isSyncing, queueSize } = useOfflineStatus();

  // Determine status
  let color = 'gray';
  let IconComponent = ExclamationTriangleIcon;
  let text = 'Detectando...';
  let showSpinner = false;

  if (isSyncing) {
    color = 'yellow';
    text = contextLabel ? contextLabel + ' sincronizando' : 'Sincronizando';
    showSpinner = true;
  } else if (!isOnline) {
    color = 'blue';
    IconComponent = CloudIcon;
    text = contextLabel ? contextLabel + ' offline' : 'Offline';
  } else if (connectionQuality === 'excellent') {
    color = 'green';
    IconComponent = CheckCircleIcon;
    text = contextLabel ? contextLabel + ' online' : 'Online';
  } else if (connectionQuality === 'good') {
    color = 'green';
    IconComponent = WifiIcon;
    text = contextLabel ? contextLabel + ' online' : 'Online';
  } else if (connectionQuality === 'poor') {
    color = 'orange';
    IconComponent = WifiIcon;
    text = contextLabel ? contextLabel + ' lento' : 'Conexión lenta';
  }

  // Build display text
  const displayText = showText ? (text + (showQueueSize && queueSize > 0 ? ' (' + queueSize + ')' : '')) : null;

  // Spinner sizes
  const spinnerSize = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';

  return (
    <TooltipRoot>
      <TooltipTrigger>
        <Badge
          colorPalette={color}
          variant={variant}
          size={size}
          cursor="help"
          display="flex"
          alignItems="center"
          gap={1}
        >
          {showIcon && (
            <Box display="flex" alignItems="center">
              {showSpinner ? (
                <Spinner size={spinnerSize} color="current" />
              ) : (
                <Icon 
                  icon={IconComponent} 
                  size={size === 'sm' ? 'xs' : size === 'lg' ? 'lg' : 'sm'} 
                />
              )}
            </Box>
          )}
          {displayText && (
            <Text
              fontSize={size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm'}
              fontWeight="medium"
            >
              {displayText}
            </Text>
          )}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <Box maxWidth="250px">
          <Typography variant="body" size="sm">
            {isSyncing ? 'Sincronizando datos...' :
             !isOnline ? 'Sin conexión a internet' :
             connectionQuality === 'excellent' ? 'Conexión excelente' :
             connectionQuality === 'good' ? 'Conexión buena' :
             connectionQuality === 'poor' ? 'Conexión lenta' : 'Detectando conexión'}
          </Typography>
        </Box>
      </TooltipContent>
    </TooltipRoot>
  );
}

// Convenience components for specific contexts
export function POSConnectionBadge(props: Omit<ConnectionBadgeProps, 'contextLabel'>) {
  return <ConnectionBadge {...props} contextLabel="POS" />;
}

export function InventoryConnectionBadge(props: Omit<ConnectionBadgeProps, 'contextLabel'>) {
  return <ConnectionBadge {...props} contextLabel="Inventario" />;
}

export function StaffConnectionBadge(props: Omit<ConnectionBadgeProps, 'contextLabel'>) {
  return <ConnectionBadge {...props} contextLabel="Personal" />;
}

export default ConnectionBadge;
