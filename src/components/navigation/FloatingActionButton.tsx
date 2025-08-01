// src/components/navigation/FloatingActionButton.tsx
// FAB para acción principal en mobile
// ✅ CORREGIDO: Contextual según módulo actual

import { Box, Button } from '@chakra-ui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

export function FloatingActionButton() {
  const { quickActions, currentModule } = useNavigation();
  
  // ✅ Acción principal según contexto
  const primaryAction = quickActions[0];
  
  if (!primaryAction) return null;

  return (
    <Box
      position="fixed"
      bottom="90px" // Above bottom navigation
      right="16px"
      zIndex={999}
    >
      <Button
        colorPalette={currentModule?.color || 'blue'}
        size="lg"
        borderRadius="full"
        w="56px"
        h="56px"
        shadow="lg"
        onClick={primaryAction.action}
      >
        <PlusIcon style={{ width: '24px', height: '24px' }} />
      </Button>
    </Box>
  );
}
