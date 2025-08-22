// OfflineMonitor.tsx - Connection and Sync Status Monitoring for G-Admin Mini
// Provides real-time offline status, sync progress, and queue monitoring

import { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  HStack, 
  Text, 
  Badge, 
  VStack,
  Alert,
  Button,
  useDisclosure,
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogCloseTrigger,
  DialogBody,
  DialogFooter,
  Flex,
  Card,
  Progress,
  createListCollection
} from '@chakra-ui/react';
import { 
  WifiIcon, 
  NoSymbolIcon, 
  ArrowPathIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CpuChipIcon,
  CircleStackIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import offlineSync, { type SyncStatus } from './OfflineSync';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';

// Connection status types
interface ConnectionStatus {
  isOnline: boolean;
  lastOnline: number;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

interface QueuedOperation {
  id: string;
  type: string;
  entity: string;
  timestamp: number;
  retry: number;
  priority: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
}

interface SyncProgress {
  current: number;
  total: number;
  percentage: number;
  currentOperation?: string;
  estimatedRemaining: number;
}

// Connection Status Component
export const ConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    lastOnline: Date.now(),
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  // const bgColor = "white"; // ChakraUI v3 compatible
  // const borderColor = "gray.200"; // ChakraUI v3 compatible

  useEffect(() => {
    // Update connection status
    const updateConnectionStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      const isNowOnline = navigator.onLine;
      
      setConnectionStatus(prevStatus => {
        const wasOffline = !prevStatus.isOnline;
        
        // Trigger automatic sync when coming back online
        if (wasOffline && isNowOnline) {
          console.log('[OfflineMonitor] Network restored, triggering automatic sync');
          // Wait 2 seconds for connection to stabilize before syncing
          setTimeout(() => {
            const currentSyncStatus = offlineSync.getSyncStatus();
            if (currentSyncStatus.queueSize > 0 && !currentSyncStatus.isSyncing) {
              console.log(`[OfflineMonitor] Auto-syncing ${currentSyncStatus.queueSize} pending operations`);
              offlineSync.forcSync();
            }
          }, 2000);
        }
        
        return {
          isOnline: isNowOnline,
          lastOnline: isNowOnline ? Date.now() : prevStatus.lastOnline,
          connectionType: connection?.type || 'unknown',
          effectiveType: connection?.effectiveType || 'unknown',
          downlink: connection?.downlink || 0,
          rtt: connection?.rtt || 0
        };
      });
    };

    // Update sync status
    const updateSyncStatus = () => {
      setSyncStatus(offlineSync.getSyncStatus());
    };

    // Enhanced network event handlers
    const handleOnline = () => {
      console.log('[OfflineMonitor] Network online event detected');
      updateConnectionStatus();
    };

    const handleOffline = () => {
      console.log('[OfflineMonitor] Network offline event detected');
      updateConnectionStatus();
    };

    // Set up listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', updateConnectionStatus);
    }

    // Sync status updates
    const syncStatusInterval = setInterval(updateSyncStatus, 1000);

    // Event listeners for sync events
    offlineSync.on('networkOnline', updateConnectionStatus);
    offlineSync.on('networkOffline', updateConnectionStatus);
    offlineSync.on('syncStarted', updateSyncStatus);
    offlineSync.on('syncCompleted', updateSyncStatus);
    offlineSync.on('initialized', (data: { queueSize: number }) => {
      console.log(`[OfflineMonitor] OfflineSync initialized with ${data.queueSize} operations`);
      updateSyncStatus();
    });

    // Initial updates
    updateConnectionStatus();
    updateSyncStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', updateConnectionStatus);
      }
      clearInterval(syncStatusInterval);
      
      offlineSync.off('networkOnline', updateConnectionStatus);
      offlineSync.off('networkOffline', updateConnectionStatus);
      offlineSync.off('syncStarted', updateSyncStatus);
      offlineSync.off('syncCompleted', updateSyncStatus);
      offlineSync.off('initialized', updateSyncStatus);
    };
  }, []);

  const getConnectionBadgeProps = () => {
    if (connectionStatus.isOnline) {
      return {
        colorScheme: 'green',
        icon: WifiIcon,
        text: 'Online'
      };
    } else {
      return {
        colorScheme: 'red',
        icon: NoSymbolIcon,
        text: 'Offline'
      };
    }
  };

  const badgeProps = getConnectionBadgeProps();

  return (
    <HStack gap={1} align="center">
      {/* Icono principal de conexión - más discreto */}
      <Box 
        w="6" 
        h="6" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        borderRadius="full"
        bg={connectionStatus.isOnline ? "green.50" : "red.50"}
        color={connectionStatus.isOnline ? "green.600" : "red.600"}
        transition="all 0.2s ease"
      >
        <badgeProps.icon style={{ width: '14px', height: '14px' }} />
      </Box>

      {/* Badge sutil solo si hay operaciones pendientes */}
      {syncStatus && syncStatus.queueSize > 0 && (
        <Box
          minW="5"
          h="5"
          bg="yellow.500"
          color="white"
          borderRadius="full"
          fontSize="xs"
          fontWeight="bold"
          display="flex"
          alignItems="center"
          justifyContent="center"
          ml="-2"
          border="2px solid"
          borderColor={{ base: "white", _dark: "gray.800" }}
        >
          {syncStatus.queueSize > 9 ? '9+' : syncStatus.queueSize}
        </Box>
      )}

      {/* Indicador de sincronización activa */}
      {syncStatus?.isSyncing && (
        <Box
          w="3"
          h="3"
          bg="blue.500"
          borderRadius="full"
          ml="-1"
          animation="pulse 2s infinite"
        />
      )}
    </HStack>
  );
};

// Sync Progress Component
export const SyncProgress = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    current: 0,
    total: 0,
    percentage: 0,
    estimatedRemaining: 0
  });

  const { open, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const updateSyncStatus = () => {
      const status = offlineSync.getSyncStatus();
      setSyncStatus(status);
      
      if (status.isSyncing) {
        setSyncProgress(prev => ({
          ...prev,
          percentage: status.syncProgress,
          estimatedRemaining: Math.max(0, prev.estimatedRemaining - 1000)
        }));
      }
    };

    const handleSyncStarted = (data: any) => {
      setSyncProgress({
        current: 0,
        total: data.queueSize,
        percentage: 0,
        estimatedRemaining: data.queueSize * 2000 // 2 seconds per operation estimate
      });
    };

    const handleBatchProcessed = (data: any) => {
      setSyncProgress(prev => ({
        ...prev,
        current: prev.current + data.results.length,
        percentage: Math.round((prev.current + data.results.length) / prev.total * 100)
      }));
    };

    // Set up listeners
    const interval = setInterval(updateSyncStatus, 1000);
    offlineSync.on('syncStarted', handleSyncStarted);
    offlineSync.on('batchProcessed', handleBatchProcessed);

    updateSyncStatus();

    return () => {
      clearInterval(interval);
      offlineSync.off('syncStarted', handleSyncStarted);
      offlineSync.off('batchProcessed', handleBatchProcessed);
    };
  }, []);

  if (!syncStatus?.isSyncing && syncStatus?.queueSize === 0) {
    return null;
  }

  return (
    <>
      <Box p={3} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
        <HStack justify="space-between" mb={2}>
          <HStack>
            <BoltIcon className="w-4 h-4 text-blue-500" />
            <Text fontSize="sm" fontWeight="medium" color="blue.700">
              {syncStatus?.isSyncing ? 'Synchronizing...' : 'Queued for sync'}
            </Text>
          </HStack>
          <Button size="xs" variant="ghost" onClick={onOpen}>
            Details
          </Button>
        </HStack>
        
        {syncStatus?.isSyncing && (
          <VStack gap={1} align="stretch">
            <Progress.Root 
              value={syncProgress.percentage} 
              size="sm" 
              colorScheme="blue"
              borderRadius="full"
            >
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
            <HStack justify="space-between" fontSize="xs" color="blue.600">
              <Text>{syncProgress.current} of {syncProgress.total}</Text>
              <Text>
                {syncProgress.estimatedRemaining > 0 ? 
                  `~${Math.round(syncProgress.estimatedRemaining / 1000)}s remaining` : 
                  'Finalizing...'
                }
              </Text>
            </HStack>
          </VStack>
        )}

        {!syncStatus?.isSyncing && syncStatus && syncStatus.queueSize > 0 && (
          <HStack justify="space-between" fontSize="sm">
            <Text color="blue.600">
              {syncStatus.queueSize} operations pending
            </Text>
            <Button 
              size="xs" 
              colorScheme="blue" 
              onClick={() => offlineSync.forcSync()}
              
            >
              <ArrowPathIcon className="w-3 h-3 mr-1" />
              Sync Now
            </Button>
          </HStack>
        )}
      </Box>

      <SyncDetailsModal 
        isOpen={open} 
        onClose={onClose} 
        syncStatus={syncStatus} 
        syncProgress={syncProgress}
      />
    </>
  );
};

// Offline Status Alert Component
export const OfflineAlert = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    const updateQueueSize = () => {
      const status = offlineSync.getSyncStatus();
      setQueueSize(status.queueSize);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const interval = setInterval(updateQueueSize, 2000);
    updateQueueSize();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!isOffline && queueSize === 0) {
    return null;
  }

  return (
    <Alert.Root status={isOffline ? "warning" : "info"}>
      <Alert.Indicator>
        {isOffline ? <NoSymbolIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />}
      </Alert.Indicator>
      <Box flex="1">
        <Alert.Title fontSize="sm">
          {isOffline ? 'Working Offline' : 'Sync Pending'}
        </Alert.Title>
        <Alert.Description fontSize="xs">
          {isOffline 
            ? `${queueSize} operations will sync when connection returns`
            : `${queueSize} operations waiting to sync`
          }
        </Alert.Description>
      </Box>
    </Alert.Root>
  );
};

// Queue Monitor Component
export const QueueMonitor = () => {
  const [queueOperations, setQueueOperations] = useState<QueuedOperation[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateQueue = () => {
      // This would integrate with the actual sync queue
      // For now, we'll simulate the queue state
      const status = offlineSync.getSyncStatus();
      // Mock queue operations based on sync status
      setQueueOperations([]); // Would be populated from actual queue
    };

    const interval = setInterval(updateQueue, 2000);
    updateQueue();

    return () => clearInterval(interval);
  }, []);

  if (queueOperations.length === 0) {
    return null;
  }

  return (
    <Box bg="gray.50" borderRadius="md" p={3} border="1px" borderColor="gray.200">
      <HStack justify="space-between" mb={2} cursor="pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <HStack>
          <CircleStackIcon className="w-4 h-4" />
          <Text fontSize="sm" fontWeight="medium">
            Operation Queue ({queueOperations.length})
          </Text>
        </HStack>
        {isExpanded ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
      </HStack>

      {isExpanded && (
        <VStack gap={2} align="stretch">
          {queueOperations.slice(0, 5).map(operation => (
            <OperationItem key={operation.id} operation={operation} />
          ))}
          {queueOperations.length > 5 && (
            <Text fontSize="xs" color="gray.500" textAlign="center">
              +{queueOperations.length - 5} more operations
            </Text>
          )}
        </VStack>
      )}
    </Box>
  );
};

// Individual Operation Item
const OperationItem = ({ operation }: { operation: QueuedOperation }) => {
  const getStatusProps = () => {
    switch (operation.status) {
      case 'pending':
        return { colorScheme: 'yellow', icon: ClockIcon };
      case 'syncing':
        return { colorScheme: 'blue', icon: ArrowPathIcon };
      case 'failed':
        return { colorScheme: 'red', icon: XCircleIcon };
      case 'completed':
        return { colorScheme: 'green', icon: CheckCircleIcon };
      default:
        return { colorScheme: 'gray', icon: ClockIcon };
    }
  };

  const statusProps = getStatusProps();

  return (
    <HStack gap={3} p={2} bg="white" borderRadius="sm" fontSize="sm">
      <statusProps.icon className={`w-4 h-4 text-gray-500`} />
      <VStack gap={0} align="start" flex="1">
        <Text fontWeight="medium">
          {operation.type} {operation.entity}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {new Date(operation.timestamp).toLocaleTimeString()}
        </Text>
      </VStack>
      <Badge colorScheme={statusProps.colorScheme} size="sm">
        {operation.status}
      </Badge>
    </HStack>
  );
};

// Comprehensive Offline Status Component
export const OfflineStatusBar = () => {
  // const bgColor = "white"; // ChakraUI v3 compatible
  
  return (
    <Box 
      position="fixed" 
      top="0" 
      left="0" 
      right="0" 
      zIndex={1002}
      bg="green.100"
      borderBottom="1px"
      borderColor="gray.200"
      p={2}
    >
      <Flex justify="space-between" align="center" maxW="container.xl" mx="auto">
        <ConnectionStatus />
        <HStack gap={3}>
          <Text fontSize="sm" color="gray.600">G-Admin Mini</Text>
        </HStack>
      </Flex>
    </Box>
  );
};

// Sync Details Modal
const SyncDetailsModal = ({ 
  isOpen, 
  onClose, 
  syncStatus, 
  syncProgress 
}: {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: SyncStatus | null;
  syncProgress: SyncProgress;
}) => {
  const handleForcSync = useCallback(async () => {
    await offlineSync.forcSync();
  }, []);

  const handleClearQueue = useCallback(async () => {
    await offlineSync.clearQueue();
    onClose();
  }, [onClose]);

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <DialogBackdrop />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sync Status Details</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <VStack gap={4} align="stretch">
            {/* Connection Info */}
            <Box>
              <Text fontWeight="semibold" mb={2}>Connection Status</Text>
              <HStack>
                <ConnectionStatus />
              </HStack>
            </Box>

            {/* Sync Progress */}
            {syncStatus?.isSyncing && (
              <Box>
                <Text fontWeight="semibold" mb={2}>Sync Progress</Text>
                <HStack gap={4}>
                  <Box>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.400">
                      {syncProgress.percentage}%
                    </Text>
                  </Box>
                  <VStack align="start" gap={1}>
                    <Text fontSize="sm">
                      {syncProgress.current} of {syncProgress.total} operations
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {syncProgress.estimatedRemaining > 0 
                        ? `~${Math.round(syncProgress.estimatedRemaining / 1000)}s remaining`
                        : 'Finalizing...'
                      }
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}

            {/* Queue Status */}
            <Box>
              <Text fontWeight="semibold" mb={2}>Queue Status</Text>
              <VStack gap={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm">Pending Operations:</Text>
                  <Badge colorScheme="yellow">{syncStatus?.queueSize || 0}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm">Conflicts:</Text>
                  <Badge colorScheme="red">{syncStatus?.conflicts.length || 0}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm">Last Sync:</Text>
                  <Text fontSize="sm" color="gray.500">
                    {syncStatus?.lastSync 
                      ? new Date(syncStatus.lastSync).toLocaleString()
                      : 'Never'
                    }
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Errors */}
            {syncStatus?.errors && syncStatus.errors.length > 0 && (
              <Box>
                <Text fontWeight="semibold" mb={2} color="red.500">Recent Errors</Text>
                <VStack gap={1} align="stretch">
                  {syncStatus.errors.slice(0, 3).map((error, index) => (
                    <Text key={index} fontSize="xs" color="red.500" bg="red.50" p={2} borderRadius="sm">
                      {error}
                    </Text>
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        </DialogBody>
        <DialogFooter>
          <HStack gap={2}>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button colorScheme="red" size="sm" onClick={handleClearQueue}>
              Clear Queue
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleForcSync}
              loading={syncStatus?.isSyncing}
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Force Sync
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

// Main Offline Monitor Provider
export const OfflineMonitorProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box position="relative">
      <OfflineStatusBar />
      <Box pt="60px">
        {children}
      </Box>
      <Box position="fixed" bottom={4} right={4} zIndex="tooltip">
        <VStack gap={2} align="end">
          <OfflineAlert />
          <SyncProgress />
          <QueueMonitor />
        </VStack>
      </Box>
    </Box>
  );
};

export default {
  ConnectionStatus,
  SyncProgress,
  OfflineAlert,
  QueueMonitor,
  OfflineStatusBar,
  OfflineMonitorProvider
};