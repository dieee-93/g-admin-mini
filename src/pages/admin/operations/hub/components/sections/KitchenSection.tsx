// KitchenSection.tsx - Migrated to Design System
// Fixed: Element type is invalid error

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// SOLO Design System Components - SIGUIENDO LAS REGLAS
import {
  // Layout & Structure
  Stack,
  VStack,
  HStack,
  
  // Typography
  Typography,
  
  // Components
  CardWrapper,
  Button,
  Badge,
  
  // Advanced
  Alert,
  AlertDescription
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

import { useOfflineStatus } from '@/lib/offline';
import { 
  useKitchenConfig,
  KITCHEN_MODE_DESCRIPTIONS,
  type EffectiveMode
} from '../../hooks/useKitchenConfig';

// Fixed Basic Kitchen Implementation - Design System Compliant
const BasicKitchenDisplay = ({ mode }: { mode: EffectiveMode }) => {
  return (
    <CardWrapper variant="elevated" padding="lg">
      <CardWrapper.Body>
        <VStack gap="md">
          <Typography variant="title">Kitchen Display</Typography>
          <Badge 
            colorPalette={mode.includes('offline') ? 'accent' : 'success'}
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
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
};

export function KitchenSection() {
  // Offline status monitoring
  const { isOnline, connectionQuality } = useOfflineStatus();
  
  // Kitchen configuration state - now using Supabase instead of localStorage
  const { config, isLoading: configLoading } = useKitchenConfig();

  // Emergency override state
  const [emergencyMode, setEmergencyMode] = useState(false);
  
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
    return <BasicKitchenDisplay mode={effectiveMode} />;
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
                  effectiveMode.includes('emergency') ? 'error' :
                  effectiveMode.includes('offline') ? 'accent' : 'success'
                }
              >
                {currentModeInfo.displayName}
              </Badge>
            </HStack>
            
            <HStack gap="sm">
              {/* Connection Indicator */}
              {config.showConnectionIndicator && (
                <Badge 
                  colorPalette={isOnline ? 'success' : 'error'}
                  variant="subtle"
                >
                  {isOnline ? <Icon icon={WifiIcon} size="sm" /> : <Icon icon={NoSymbolIcon} size="sm" />}
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              )}
              
              {/* Emergency Override Button */}
              <Button
                variant={emergencyMode ? 'solid' : 'outline'}
                colorPalette="error"
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
