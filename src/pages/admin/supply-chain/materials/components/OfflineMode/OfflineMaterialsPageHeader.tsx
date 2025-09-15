// OfflineMaterialsPageHeader.tsx - Focused header component with connection status
import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Alert,
  IconButton,
  Progress,
  Tooltip
} from '@chakra-ui/react';
import {
  PlusIcon,
  BeakerIcon,
  ArrowPathIcon,
  CogIcon,
  WifiIcon,
  NoSymbolIcon,
  CloudIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

interface OfflineMaterialsPageHeaderProps {
  isOnline: boolean;
  isConnecting: boolean;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  isSyncing: boolean;
  syncProgress: number;
  offlineOperationsCount: number;
  queueSize: number;
  onAddItem: () => void;
  onShowOfflineModal: () => void;
  onForceSync: () => void;
}

export function OfflineMaterialsPageHeader({
  isOnline,
  isConnecting,
  connectionQuality = 'good',
  isSyncing,
  syncProgress,
  offlineOperationsCount,
  queueSize,
  onAddItem,
  onShowOfflineModal,
  onForceSync
}: OfflineMaterialsPageHeaderProps) {
  const getConnectionStatusColor = () => {
    if (!isOnline) return 'red';
    if (connectionQuality === 'excellent') return 'green';
    if (connectionQuality === 'good') return 'yellow';
    return 'orange';
  };

  return (
    <VStack align="start" gap="3">
      <HStack justify="space-between" w="full">
        <VStack align="start" gap="1">
          <HStack>
            <Text fontSize="3xl" fontWeight="bold">Supply Chain Intelligence</Text>
            <Badge 
              colorPalette={getConnectionStatusColor()} 
              variant="subtle"
              p={2}
            >
              <HStack spacing={1}>
                {isOnline ? 
                  <WifiIcon className="w-3 h-3" /> : 
                  <NoSymbolIcon className="w-3 h-3" />
                }
                <Text fontSize="xs">
                  {!isOnline ? 'Offline' : 
                   isConnecting ? 'Connecting...' : 
                   `Online (${connectionQuality})`}
                </Text>
              </HStack>
            </Badge>
          </HStack>
          <Text color="gray.600">
            Gestión offline-first de inventario con inteligencia de cadena de suministro
          </Text>
        </VStack>

        <HStack gap="2">
          {/* Offline Operations Indicator */}
          {offlineOperationsCount > 0 && (
            <Tooltip label={`${offlineOperationsCount} operations pending sync`}>
              <Button
                variant="outline"
                colorPalette="orange"
                size="sm"
                onClick={onShowOfflineModal}
              >
                <CircleStackIcon className="w-4 h-4" />
                {offlineOperationsCount} Offline
              </Button>
            </Tooltip>
          )}

          {/* Sync Progress */}
          {isSyncing && (
            <Box minW="120px">
              <Text fontSize="xs" mb={1}>Syncing...</Text>
              <Progress.Root value={syncProgress} size="sm">
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </Box>
          )}

          {/* Manual Sync Button */}
          {queueSize > 0 && (
            <Button
              variant="outline"
              colorPalette="blue"
              size="sm"
              onClick={onForceSync}
              loading={isSyncing}
            >
              <CloudIcon className="w-4 h-4" />
              Sync ({queueSize})
            </Button>
          )}

          <Button 
            variant="outline"
            colorPalette="orange" 
            onClick={() => window.open('/tools/intelligence/recipes', '_blank')}
            leftIcon={<BeakerIcon className="w-4 h-4" />}
            size="sm"
          >
            🧠 Recipe Intelligence
          </Button>

          <Button 
            colorPalette="blue" 
            onClick={onAddItem}
            leftIcon={<PlusIcon className="w-4 h-4" />}
          >
            Nuevo Item
          </Button>
        </HStack>
      </HStack>

      {/* Offline Mode Alert */}
      {!isOnline && (
        <Alert.Root status="warning">
          <Alert.Indicator>
            <NoSymbolIcon className="w-5 h-5" />
          </Alert.Indicator>
          <Alert.Title>Inventory Offline Mode</Alert.Title>
          <Alert.Description>
            All inventory operations will be saved locally and synced automatically when connection is restored.
          </Alert.Description>
        </Alert.Root>
      )}
    </VStack>
  );
}

export default OfflineMaterialsPageHeader;