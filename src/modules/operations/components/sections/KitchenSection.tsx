// KitchenSection.tsx - Hybrid Kitchen Display System for G-Admin Mini
// User-configurable modes with intelligent fallback and emergency override

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Alert,
  Dialog,
  Select,
  Switch,
  Tooltip,
  createListCollection
} from '@chakra-ui/react';
import {
  CogIcon,
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
  userPreference: 'chef_default'
};

const KITCHEN_MODE_DESCRIPTIONS = {
  'auto': {
    label: '🤖 Automatic Detection',
    description: 'System decides based on connection quality',
    icon: BoltIcon,
    color: 'blue'
  },
  'online-first': {
    label: '🌐 Online First',
    description: 'Always try online, fallback to offline if needed',
    icon: WifiIcon,
    color: 'green'
  },
  'offline-first': {
    label: '💾 Offline First (Recommended)',
    description: 'Work offline, sync in background when possible',
    icon: CloudIcon,
    color: 'purple'
  },
  'offline-only': {
    label: '🔒 Offline Only',
    description: 'Never attempt online operations, manual sync only',
    icon: NoSymbolIcon,
    color: 'orange'
  }
};

// Basic Kitchen Implementation - will be replaced with proper components
const BasicKitchenDisplay = ({ mode }: { mode: EffectiveMode }) => {
  return (
    <Card p={6}>
      <VStack spacing={4}>
        <Text fontSize="lg" fontWeight="semibold">Kitchen Display</Text>
        <Badge colorScheme={mode.includes('offline') ? 'purple' : 'green'}>
          {mode.replace('-active', '').replace('-', ' ').toUpperCase()} MODE
        </Badge>
        <Text color="gray.600" textAlign="center">
          Kitchen display system is running in {mode.replace('-active', '').replace('-', ' ')} mode.
          {mode.includes('offline') && ' All operations are stored locally and will sync when connection is restored.'}
          {mode.includes('hybrid') && ' Using mixed online/offline operations for optimal performance.'}
        </Text>
        {mode.includes('offline') && (
          <Alert status="info">
            <Alert.Indicator />
            <Alert.Description>
              Offline operations are fully functional. Orders, tickets, and kitchen updates are saved locally.
            </Alert.Description>
          </Alert>
        )}
      </VStack>
    </Card>
  );
};

export function KitchenSection() {
  // Offline status monitoring
  const {
    isOnline,
    connectionQuality,
    isSyncing,
    queueSize
  } = useOfflineStatus();

  // Configuration state
  const [config, setConfig] = useState<KitchenConfig>(() => {
    const stored = localStorage.getItem('kitchen_display_config');
    return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG;
  });

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [modeChangeReason, setModeChangeReason] = useState<string | null>(null);

  // Calculate effective operating mode
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

  // Track mode changes and notify user
  useEffect(() => {
    const previousMode = sessionStorage.getItem('last_effective_mode');
    const currentModeStr = effectiveMode;
    
    if (previousMode && previousMode !== currentModeStr) {
      const reason = getModeChangeReason(previousMode as EffectiveMode, effectiveMode);
      setModeChangeReason(reason);
      
      // Auto-hide reason after 5 seconds
      setTimeout(() => setModeChangeReason(null), 5000);
    }
    
    sessionStorage.setItem('last_effective_mode', currentModeStr);
  }, [effectiveMode]);

  const getModeChangeReason = (from: EffectiveMode, to: EffectiveMode): string => {
    if (from === 'online-active' && to === 'offline-active') {
      return 'Switched to offline due to connection issues';
    }
    if (from === 'offline-active' && to === 'online-active') {
      return 'Switched to online - connection restored';
    }
    if (to === 'emergency-offline') {
      return 'Emergency offline mode activated by user';
    }
    if (to === 'hybrid-active') {
      return 'Using hybrid mode due to connection quality or sync queue';
    }
    return `Mode changed to ${to.replace('-active', '').replace('-', ' ')}`;
  };

  // Save configuration changes
  const updateConfig = useCallback((newConfig: Partial<KitchenConfig>) => {
    const updatedConfig = {
      ...config,
      ...newConfig,
      lastChanged: Date.now()
    };
    
    setConfig(updatedConfig);
    localStorage.setItem('kitchen_display_config', JSON.stringify(updatedConfig));
    
    notify.success('Kitchen display configuration updated');
  }, [config]);

  // Emergency offline toggle
  const handleEmergencyToggle = useCallback(() => {
    setEmergencyMode(prev => {
      const newMode = !prev;
      notify.info(
        newMode 
          ? 'Emergency offline mode activated - all operations will be local'
          : 'Emergency mode deactivated - returning to configured mode'
      );
      return newMode;
    });
  }, []);

  // Quick mode change
  const handleQuickModeChange = useCallback((newMode: KitchenMode) => {
    updateConfig({ mode: newMode });
    notify.success(`Kitchen mode changed to ${KITCHEN_MODE_DESCRIPTIONS[newMode].label}`);
  }, [updateConfig]);

  // Get current mode information for display
  const getCurrentModeInfo = () => {
    if (emergencyMode) {
      return {
        label: '🚨 Emergency Offline',
        description: 'All operations local, manual sync required',
        color: 'red',
        icon: ExclamationTriangleIcon
      };
    }

    const baseMode = KITCHEN_MODE_DESCRIPTIONS[config.mode];
    const effectiveLabel = effectiveMode.includes('online') ? 'Online Active' :
                          effectiveMode.includes('offline') ? 'Offline Active' :
                          effectiveMode.includes('hybrid') ? 'Hybrid Active' : 'Active';

    return {
      ...baseMode,
      label: `${baseMode.label.split(' ')[0]} ${effectiveLabel}`,
      isAutoMode: config.mode === 'auto'
    };
  };

  const currentModeInfo = getCurrentModeInfo();

  // Render the appropriate kitchen component based on effective mode
  const renderKitchenComponent = () => {
    return <BasicKitchenDisplay mode={effectiveMode} />;
  };

  const modeCollection = createListCollection({
    items: Object.entries(KITCHEN_MODE_DESCRIPTIONS).map(([value, info]) => ({
      value,
      label: info.label
    }))
  });

  return (
    <Box>
      {/* Mode Status Bar */}
      <Card mb={4} p={4}>
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <Badge 
              colorScheme={emergencyMode ? 'red' : currentModeInfo.color} 
              variant="subtle"
              p={2}
            >
              <HStack spacing={1}>
                <currentModeInfo.icon className="w-4 h-4" />
                <Text fontSize="sm" fontWeight="medium">
                  {currentModeInfo.label}
                </Text>
              </HStack>
            </Badge>

            <Text fontSize="sm" color="gray.600">
              {currentModeInfo.description}
            </Text>

            {config.showConnectionIndicator && (
              <HStack spacing={2}>
                {isOnline ? (
                  <Badge colorScheme="green" size="sm">
                    <HStack spacing={1}>
                      <WifiIcon className="w-3 h-3" />
                      <Text fontSize="xs">{connectionQuality}</Text>
                    </HStack>
                  </Badge>
                ) : (
                  <Badge colorScheme="red" size="sm">
                    <HStack spacing={1}>
                      <NoSymbolIcon className="w-3 h-3" />
                      <Text fontSize="xs">Offline</Text>
                    </HStack>
                  </Badge>
                )}

                {isSyncing && (
                  <Badge colorScheme="blue" size="sm">
                    Syncing ({queueSize})
                  </Badge>
                )}
              </HStack>
            )}
          </HStack>

          <HStack spacing={2}>
            {/* Quick Mode Selector */}
            <Tooltip label="Quick mode change">
              <Select.Root
                collection={modeCollection}
                value={[config.mode]}
                onValueChange={(details) => handleQuickModeChange(details.value[0] as KitchenMode)}
                size="sm"
              >
                <Select.Trigger minW="180px">
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  {modeCollection.items.map((mode) => (
                    <Select.Item key={mode.value} item={mode}>
                      {mode.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Tooltip>

            {/* Emergency Override Button */}
            {config.emergencyOverride && (
              <Tooltip label={emergencyMode ? "Deactivate emergency mode" : "Activate emergency offline mode"}>
                <Button
                  size="sm"
                  colorScheme={emergencyMode ? "red" : "orange"}
                  variant={emergencyMode ? "solid" : "outline"}
                  onClick={handleEmergencyToggle}
                  leftIcon={<ExclamationTriangleIcon className="w-4 h-4" />}
                >
                  {emergencyMode ? "Emergency" : "Emergency"}
                </Button>
              </Tooltip>
            )}

            {/* Configuration Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfigModal(true)}
              leftIcon={<CogIcon className="w-4 h-4" />}
            >
              Config
            </Button>
          </HStack>
        </HStack>
      </Card>

      {/* Mode Change Notification */}
      {modeChangeReason && (
        <Alert status="info" mb={4}>
          <Alert.Indicator />
          <Alert.Title>Kitchen Mode Changed</Alert.Title>
          <Alert.Description>{modeChangeReason}</Alert.Description>
        </Alert>
      )}

      {/* Connection Warning for Online-Only Mode */}
      {config.mode === 'online-first' && !config.autoFallback && !isOnline && (
        <Alert status="error" mb={4}>
          <Alert.Indicator />
          <Alert.Title>Connection Required</Alert.Title>
          <Alert.Description>
            Kitchen is configured for online-first mode but no connection is available. 
            Consider enabling auto-fallback or switching to offline-first mode.
          </Alert.Description>
        </Alert>
      )}

      {/* Main Kitchen Component */}
      {renderKitchenComponent()}

      {/* Configuration Modal */}
      <KitchenConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        config={config}
        onConfigUpdate={updateConfig}
        currentEffectiveMode={effectiveMode}
        connectionStatus={{ isOnline, connectionQuality, queueSize }}
      />
    </Box>
  );
}

// Kitchen Configuration Modal Component
interface KitchenConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: KitchenConfig;
  onConfigUpdate: (config: Partial<KitchenConfig>) => void;
  currentEffectiveMode: EffectiveMode;
  connectionStatus: {
    isOnline: boolean;
    connectionQuality: string;
    queueSize: number;
  };
}

const KitchenConfigModal: React.FC<KitchenConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdate,
  currentEffectiveMode,
  connectionStatus
}) => {
  const [localConfig, setLocalConfig] = useState<KitchenConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = () => {
    onConfigUpdate(localConfig);
    onClose();
  };

  const handleReset = () => {
    setLocalConfig(DEFAULT_CONFIG);
    onConfigUpdate(DEFAULT_CONFIG);
    notify.success('Configuration reset to defaults');
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="2xl">
          <Dialog.Header>
            <Dialog.Title>Kitchen Display Configuration</Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>

          <Dialog.Body>
            <VStack spacing={6} align="stretch">
              {/* Current Status */}
              <Card p={4} bg="gray.50">
                <VStack spacing={2} align="stretch">
                  <Text fontWeight="semibold">Current Status</Text>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Effective Mode:</Text>
                    <Badge colorScheme="blue">{currentEffectiveMode.replace('-', ' ')}</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Connection:</Text>
                    <Badge colorScheme={connectionStatus.isOnline ? 'green' : 'red'}>
                      {connectionStatus.isOnline ? connectionStatus.connectionQuality : 'Offline'}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Pending Sync:</Text>
                    <Badge colorScheme="purple">{connectionStatus.queueSize} operations</Badge>
                  </HStack>
                </VStack>
              </Card>

              {/* Mode Selection */}
              <VStack align="stretch" spacing={3}>
                <Text fontWeight="semibold">Kitchen Display Mode</Text>
                
                {Object.entries(KITCHEN_MODE_DESCRIPTIONS).map(([modeKey, modeInfo]) => (
                  <Card
                    key={modeKey}
                    p={4}
                    cursor="pointer"
                    borderWidth="2px"
                    borderColor={localConfig.mode === modeKey ? `${modeInfo.color}.200` : 'gray.200'}
                    bg={localConfig.mode === modeKey ? `${modeInfo.color}.50` : 'white'}
                    onClick={() => setLocalConfig(prev => ({ ...prev, mode: modeKey as KitchenMode }))}
                    _hover={{ borderColor: `${modeInfo.color}.300` }}
                  >
                    <HStack spacing={3}>
                      <modeInfo.icon className="w-5 h-5" />
                      <VStack align="start" spacing={1} flex="1">
                        <Text fontWeight="medium">{modeInfo.label}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {modeInfo.description}
                        </Text>
                      </VStack>
                      {localConfig.mode === modeKey && (
                        <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                      )}
                    </HStack>
                  </Card>
                ))}
              </VStack>

              {/* Advanced Options */}
              <VStack align="stretch" spacing={4}>
                <Text fontWeight="semibold">Advanced Options</Text>
                
                <Switch
                  checked={localConfig.autoFallback}
                  onCheckedChange={(checked) => 
                    setLocalConfig(prev => ({ ...prev, autoFallback: checked.checked }))
                  }
                >
                  Enable automatic fallback on connection errors
                </Switch>
                
                <Switch
                  checked={localConfig.emergencyOverride}
                  onCheckedChange={(checked) => 
                    setLocalConfig(prev => ({ ...prev, emergencyOverride: checked.checked }))
                  }
                >
                  Allow emergency mode override
                </Switch>
                
                <Switch
                  checked={localConfig.showConnectionIndicator}
                  onCheckedChange={(checked) => 
                    setLocalConfig(prev => ({ ...prev, showConnectionIndicator: checked.checked }))
                  }
                >
                  Show connection quality indicator
                </Switch>
              </VStack>

              {/* Help Text */}
              <Card p={4} bg="blue.50">
                <VStack align="start" spacing={2}>
                  <HStack>
                    <ComputerDesktopIcon className="w-5 h-5 text-blue-500" />
                    <Text fontWeight="medium" color="blue.700">Recommended Settings</Text>
                  </HStack>
                  <Text fontSize="sm" color="blue.600">
                    • **Offline First**: Best for most restaurants - reliable and consistent
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    • **Auto Fallback**: Enabled - provides safety net for connection issues
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    • **Emergency Override**: Enabled - allows immediate offline mode when needed
                  </Text>
                </VStack>
              </Card>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <HStack spacing={3}>
              <Button variant="outline" onClick={handleReset}>
                Reset to Defaults
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleSave}>
                Save Configuration
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
