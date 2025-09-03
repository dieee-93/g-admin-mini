import React from 'react';
import { VStack, HStack, Box } from '@chakra-ui/react';
import { Button, Typography } from '@/shared/ui';
import { SUPABASE_CONNECTION_CONFIG } from '../config/constants';

interface ActionButtonsProps {
  canConnect: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onUseDemo: () => void;
  onDebugSkip?: () => void;
}

export function ActionButtons({
  canConnect,
  isConnecting,
  onConnect,
  onUseDemo,
  onDebugSkip
}: ActionButtonsProps) {
  const { buttons, demoDescription } = SUPABASE_CONNECTION_CONFIG.TEXTS;

  return (
    <VStack gap="lg">
      <Button
        variant="solid"
        size="lg"
        onClick={onConnect}
        disabled={!canConnect}
        loading={isConnecting}
        loadingText={buttons.connecting}
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
        }}
        _active={{
          transform: 'translateY(0)'
        }}
        transition="all 0.2s ease"
      >
        {isConnecting ? buttons.connecting : buttons.connect}
      </Button>
      
      <HStack gap="sm" align="center" w="full" opacity={0.7}>
        <Box h="1px" bg="gray.300" flex={1} borderRadius="full" />
        <Typography variant="muted" fontSize="sm">o</Typography>
        <Box h="1px" bg="gray.300" flex={1} borderRadius="full" />
      </HStack>
      
      <Button
        variant="outline"
        size="lg"
        onClick={onUseDemo}
        disabled={isConnecting}
        _hover={{
          transform: 'translateY(-1px)',
          borderColor: 'blue.400',
          color: 'blue.600'
        }}
        _active={{
          transform: 'translateY(0)'
        }}
        transition="all 0.2s ease"
      >
        {buttons.useDemo}
      </Button>

      {/* Debug/Skip button - remove in production */}
      {import.meta.env.DEV && onDebugSkip && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDebugSkip}
          disabled={isConnecting}
        >
          {buttons.debugSkip}
        </Button>
      )}
      
      <Typography 
        variant="muted" 
        fontSize="sm" 
        textAlign="center" 
        opacity={0.8}
        _hover={{ opacity: 1 }}
        transition="opacity 0.2s ease"
      >
        {demoDescription}
      </Typography>
    </VStack>
  );
}