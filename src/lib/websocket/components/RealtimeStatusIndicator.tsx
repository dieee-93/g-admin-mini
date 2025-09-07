// RealtimeStatusIndicator.tsx - Real-time Connection Status Component
// Displays WebSocket connection status with visual indicators

import React from 'react';
import {
  Box,
  HStack,
  Text,
  Badge,
  IconButton,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  Progress,
  ProgressTrack,
  ProgressRange
} from '@chakra-ui/react';
import {
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';

interface RealtimeStatusIndicatorProps {
  connectionState?: 'connected' | 'connecting' | 'disconnected' | 'error';
  showDetails?: boolean;
}

export function RealtimeStatusIndicator({
  connectionState = 'disconnected',
  showDetails = true
}: RealtimeStatusIndicatorProps) {
  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'green';
      case 'connecting':
        return 'yellow';
      case 'disconnected':
        return 'gray';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <Icon icon={CheckCircleIcon} size="sm" />;
      case 'connecting':
        return <Icon icon={WifiIcon} size="sm" />;
      case 'disconnected':
      case 'error':
        return <Icon icon={ExclamationTriangleIcon} size="sm" />;
      default:
        return <Icon icon={WifiIcon} size="sm" />;
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'disconnected':
        return 'Desconectado';
      case 'error':
        return 'Error';
      default:
        return 'Desconocido';
    }
  };

  if (!showDetails) {
    return (
      <TooltipRoot>
        <TooltipTrigger>
          <IconButton
            variant="ghost"
            size="sm"
            color={`${getStatusColor()}.500`}
          >
            {getStatusIcon()}
          </IconButton>
        </TooltipTrigger>
        <TooltipContent>
          WebSocket: {getStatusText()}
        </TooltipContent>
      </TooltipRoot>
    );
  }

  return (
    <Box>
      <HStack gap="2" align="center">
        {getStatusIcon()}
        <Text fontSize="sm" color={`${getStatusColor()}.500`}>
          {getStatusText()}
        </Text>
        <Badge colorPalette={getStatusColor()} size="sm">
          WebSocket
        </Badge>
      </HStack>
      
      {connectionState === 'connecting' && (
        <Box mt="2" width="100px">
          <Progress.Root size="xs" colorPalette="blue">
            <ProgressTrack>
              <ProgressRange />
            </ProgressTrack>
          </Progress.Root>
        </Box>
      )}
    </Box>
  );
}

export default RealtimeStatusIndicator;