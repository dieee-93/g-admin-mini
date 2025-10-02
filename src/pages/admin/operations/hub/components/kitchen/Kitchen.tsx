// KitchenSection.tsx - Migrated to Design System
// Fixed: Element type is invalid error

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Design System Components v2.1 (UPDATED)
import {
  // Semantic Layout Components (PRIORITY)
  Section, CardGrid, MetricCard,

  // Layout & Structure
  Stack, VStack, HStack,

  // Typography
  Typography,

  // Components
  Button, Badge, Alert, AlertDescription,
  CardWrapper
} from '@/shared/ui';

import { Icon } from '@/shared/ui';
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  WifiIcon,
  NoSymbolIcon,
  CloudIcon,
  ComputerDesktopIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

// EventBus integration for Kitchen module
import { useEventBus } from '@/providers/EventBusProvider';

import { useOfflineStatus } from '@/lib/offline';
import { 
  useKitchenConfig,
  KITCHEN_MODE_DESCRIPTIONS,
  type EffectiveMode
} from '../../hooks/useKitchenConfig';
import { notify } from '@/lib/notifications';

import { logger } from '@/lib/logging';
// Kitchen Display Component - Updated to v2.1 patterns
const BasicKitchenDisplay = ({ mode, onOrderReady }: {
  mode: EffectiveMode;
  onOrderReady?: (orderId: string) => void;
}) => {
  return (
    <Section variant="elevated" title="Kitchen Display">
      <VStack gap="md">
        <Typography variant="body" color="text.muted">
          Active Mode: {mode}
        </Typography>
          <Badge 
            colorPalette={mode.includes('offline') ? 'warning' : 'green'}
          >
            {mode.replace('-active', '').replace('-', ' ').toUpperCase()} MODE
          </Badge>
          <Typography variant="body" color="text.muted" style={{ textAlign: 'center' }}>
            Kitchen display system is running in {mode.replace('-active', '').replace('-', ' ')} mode.
            {mode.includes('offline') && ' All operations are stored locally and will sync when connection is restored.'}
            {mode.includes('hybrid') && ' Using mixed online/offline operations for optimal performance.'}
          </Typography>
          {mode.includes('offline') && (
            <Alert status="info" title="Offline Operations Active">
              <AlertDescription>
                Offline operations are fully functional. Orders, tickets, and kitchen updates are saved locally.
              </AlertDescription>
            </Alert>
          )}

          {/* Order ready button for testing EventBus */}
          <Button
            onClick={() => onOrderReady?.('order-123')}
            colorPalette="green"
            size="sm"
          >
            Mark Order Ready (Test)
          </Button>
        </VStack>
    </Section>
  );
};

export default function Kitchen() {
  // EventBus integration for Kitchen operations
  const { emit, on, off } = useEventBus();

  // Offline status monitoring
  const { isOnline, connectionQuality } = useOfflineStatus();

  // Kitchen configuration state - now using Supabase instead of localStorage
  const { config, isLoading: configLoading } = useKitchenConfig();

  // Emergency override state
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Kitchen EventBus integration
  const handleOrderReady = useCallback((orderId: string) => {
    logger.info('App', '🍳 Kitchen: Order ready', orderId);

    // Emit order ready event to Operations and Sales
    emit('operations.order_ready', {
      orderId,
      kitchenStation: 'main',
      prepTime: 15, // minutes
      timestamp: Date.now(),
      status: 'ready_for_pickup'
    });

    // Also emit to sales for customer notification
    emit('sales.order_ready_notification', {
      orderId,
      estimatedDelivery: Date.now() + (5 * 60 * 1000), // 5 minutes from now
      notifyCustomer: true
    });
  }, [emit]);

  // Listen for new orders from Sales
  useEffect(() => {
    const handleNewOrder = (orderData: any) => {
      logger.info('App', '🍳 Kitchen: New order received', orderData);
      // Update kitchen display with new order
      // In a real app, this would update the kitchen queue
    };

    // Subscribe to new orders
    const unsubscribe = on('sales.order_placed', handleNewOrder);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [on]);

  // Mock states for demo
  const queueSize = 3;

  // Calculate effective mode based on configuration and current conditions
  const effectiveMode: EffectiveMode = useMemo(() => {
    // Emergency override always wins
    if (emergencyMode) return 'emergency-offline';

    // User-selected specific modes
    switch (config.mode) {
      case 'online-first':
        if (isOnline) return 'online-active';
        if (config.autoFallback) return 'offline-active';
        return 'online-active'; // Will show connection error
        
      case 'offline-first':
      case 'offline-only':
        return 'offline-active';
        
      case 'auto':
        // Intelligent auto-detection
        if (!isOnline) return 'offline-active';
        if (connectionQuality === 'poor') return 'hybrid-active';
        if (queueSize > 5) return 'hybrid-active'; // Too many pending operations
        return 'online-active';
        
      default:
        return 'offline-active';
    }
  }, [config.mode, isOnline, connectionQuality, queueSize, config.autoFallback, emergencyMode]);

  // Get current mode information for display
  const getCurrentModeInfo = useCallback(() => {
    const modeConfig = KITCHEN_MODE_DESCRIPTIONS[config.mode];
    return {
      displayName: effectiveMode.replace('-active', '').replace('-', ' ').toUpperCase(),
      description: modeConfig.description,
      isStable: !effectiveMode.includes('emergency'),
      isAutoMode: config.mode === 'auto'
    };
  }, [config.mode, effectiveMode]);

  // Track mode changes and notify user (without sessionStorage dependency)
  const [previousMode, setPreviousMode] = useState<string | null>(null);
  
  useEffect(() => {
    const currentModeStr = effectiveMode;
    
    if (previousMode && previousMode !== currentModeStr) {
      const modeInfo = getCurrentModeInfo();
      if (modeInfo.isStable) {
        notify.success({
          title: `Kitchen Mode Changed`,
          description: `Now running in ${modeInfo.displayName}`
        });
      } else {
        notify.warning({
          title: `Kitchen Mode Changed`,
          description: `Now running in ${modeInfo.displayName}`
        });
      }
    }
    
    setPreviousMode(currentModeStr);
  }, [effectiveMode, getCurrentModeInfo, previousMode]);

  const currentModeInfo = getCurrentModeInfo();

  // Render the kitchen component
  const renderKitchenComponent = () => {
    return <BasicKitchenDisplay mode={effectiveMode} onOrderReady={handleOrderReady} />;
  };

  // Show loading state while config loads
  if (configLoading) {
    return (
      <CardWrapper variant="elevated" padding="lg">
        <CardWrapper.Body>
          <VStack gap="md" align="center">
            <Typography variant="title">Loading Kitchen Configuration...</Typography>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

  return (
    <VStack gap="md" align="stretch">
      {/* Mode Status Bar */}
      <CardWrapper variant="outline" padding="sm">
        <CardWrapper.Body>
          <HStack justify="space-between" align="center">
            <HStack gap="sm">
              <Typography variant="label">Current Mode:</Typography>
              <Badge 
                colorPalette={
                  effectiveMode.includes('emergency') ? 'red' :
                  effectiveMode.includes('offline') ? 'orange' : 'green'
                }
              >
                {currentModeInfo.displayName}
              </Badge>
            </HStack>
            
            <HStack gap="sm">
              {/* Connection Indicator */}
              {config.showConnectionIndicator && (
                <Badge 
                  colorPalette={isOnline ? 'green' : 'red'}
                  variant="subtle"
                >
                  {isOnline ? <Icon icon={WifiIcon} size="sm" /> : <Icon icon={NoSymbolIcon} size="sm" />}
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              )}
              
              {/* Emergency Override Button */}
              <Button
                variant={emergencyMode ? 'solid' : 'outline'}
                colorPalette="red"
                size="sm"
                onClick={() => setEmergencyMode(!emergencyMode)}
              >
                <Icon icon={ExclamationTriangleIcon} size="sm" />
                {emergencyMode ? 'Exit Emergency' : 'Emergency'}
              </Button>
            </HStack>
          </HStack>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Emergency Mode Alert */}
      {emergencyMode && (
        <Alert status="error" title="Emergency Offline Mode Active">
          <AlertDescription>
            All operations are running in emergency offline mode. Network features are disabled.
            Click "Exit Emergency" to return to normal operation.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Kitchen Display */}
      {renderKitchenComponent()}

      {/* Configuration Panel - Simplified for now */}
      <CardWrapper variant="outline" padding="md">
        <CardWrapper.Header>
          <Typography variant="title">Kitchen Settings</Typography>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <Stack gap="sm">
            <Typography variant="body" color="text.muted">
              Current mode: {config.mode.charAt(0).toUpperCase() + config.mode.slice(1)}
            </Typography>
            <Typography variant="caption" color="text.muted">
              {KITCHEN_MODE_DESCRIPTIONS[config.mode].description}
            </Typography>
          </Stack>
        </CardWrapper.Body>
      </CardWrapper>
    </VStack>
  );
}
