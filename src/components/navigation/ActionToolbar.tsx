// src/components/navigation/ActionToolbar.tsx
// Toolbar de acciones para desktop
// ✅ CORREGIDO: Import de Text + Quick actions contextuales

import { Box, HStack, Button, Text } from '@chakra-ui/react';
import { useNavigation } from '@/contexts/NavigationContext';

export function ActionToolbar() {
  const { quickActions } = useNavigation();

  if (quickActions.length === 0) return null;

  return (
    <Box
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      px="6"
      py="3"
    >
      <HStack gap="3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          
          return (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={action.action}
              colorPalette={action.color || 'gray'}
            >
              <HStack gap="2">
                <Icon style={{ width: '16px', height: '16px' }} />
                <Text>{action.label}</Text>
              </HStack>
            </Button>
          );
        })}
      </HStack>
    </Box>
  );
}