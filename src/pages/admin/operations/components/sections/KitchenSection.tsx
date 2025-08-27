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
  Card,
  Button,
  Badge,
  
  // Advanced
  Alert,
  AlertDescription
} from '@/shared/ui';

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
import { notify } from '@/lib/notifications';

// Kitchen mode configuration
type KitchenMode = 'auto' | 'online-first' | 'offline-first' | 'offline-only';
type EffectiveMode = 'online-active' | 'offline-active' | 'hybrid-active' | 'emergency-offline';

interface KitchenConfig {
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

const KITCHEN_MODE_DESCRIPTIONS = {
  'auto': {
    label: 'Auto (Smart Detection)',
    description: 'Automatically adapts based on connection quality and workload',
    icon: BoltIcon,
    reliability: 'adaptive'
  },
  'online-first': {
    label: 'Online First',
    description: 'Prioritizes real-time features, falls back to offline when needed',
    icon: CloudIcon,
    reliability: 'high-when-connected'
  },
  'offline-first': {
    label: 'Offline First (Recommended)',
    description: 'Prioritizes reliability, syncs when connection is stable',
    icon: ShieldCheckIcon,
    reliability: 'very-high'
  },
  'offline-only': {
    label: 'Offline Only',
    description: 'Local operations only, no network dependency',
    icon: ComputerDesktopIcon,
    reliability: 'maximum'
  }
};

// Fixed Basic Kitchen Implementation - Design System Compliant
const BasicKitchenDisplay = ({ mode }: { mode: EffectiveMode }) => {
  return (
    <Card variant="elevated" padding="lg">
      <Card.Body>
        <VStack gap="md">
          <Typography variant="title">Kitchen Display</Typography>
          <Badge 
            colorPalette={mode.includes('offline') ? 'accent' : 'success'}
          >
            {mode.replace('-active', '').replace('-', ' ').toUpperCase()} MODE
          </Badge>
          <Typography variant="body" color="muted" style={{ textAlign: 'center' }}>
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
      </Card.Body>
    </CardWrapper>
  );
};

export function KitchenSection() {
  // Offline status monitoring
  const { isOnline, connectionQuality } = useOfflineStatus();
  
  // Kitchen configuration state
  const [config] = useState<KitchenConfig>(() => {
    try {
      const saved = localStorage.getItem('kitchen_config');
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

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

  // Track mode changes and notify user
  useEffect(() => {
    const previousMode = sessionStorage.getItem('last_effective_mode');
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
    
    sessionStorage.setItem('last_effective_mode', currentModeStr);
  }, [effectiveMode, getCurrentModeInfo]);

  const currentModeInfo = getCurrentModeInfo();

  // Render the kitchen component
  const renderKitchenComponent = () => {
    return <BasicKitchenDisplay mode={effectiveMode} />;
  };

  return (
    <VStack gap="md" align="stretch">
      {/* Mode Status Bar */}
      <Card variant="outline" padding="sm">
        <Card.Body>
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
                  {isOnline ? <WifiIcon className="w-4 h-4" /> : <NoSymbolIcon className="w-4 h-4" />}
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
                <ExclamationTriangleIcon className="w-4 h-4" />
                {emergencyMode ? 'Exit Emergency' : 'Emergency'}
              </Button>
            </HStack>
          </HStack>
        </Card.Body>
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
      <Card variant="outline" padding="md">
        <Card.Header>
          <Typography variant="title">Kitchen Settings</Typography>
        </Card.Header>
        <Card.Body>
          <Stack gap="sm">
            <Typography variant="body" color="muted">
              Current mode: {config.mode.charAt(0).toUpperCase() + config.mode.slice(1)}
            </Typography>
            <Typography variant="caption" color="muted">
              {KITCHEN_MODE_DESCRIPTIONS[config.mode].description}
            </Typography>
          </Stack>
        </Card.Body>
      </CardWrapper>
    </VStack>
  );
}
