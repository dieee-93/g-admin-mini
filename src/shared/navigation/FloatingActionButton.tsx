// ====================================
// src/components/navigation/FloatingActionButton.tsx - CORREGIDO
// ====================================

import { Box, Button } from '@chakra-ui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';
import { Icon } from '@/shared/ui/Icon';

export function FloatingActionButton() {
  const { quickActions, currentModule } = useNavigation();
  
  const primaryAction = quickActions[0];
  
  if (!primaryAction) return null;

  return (
    <Box
      position="fixed" // 🔧 CORREGIDO: fixed para consistencia
      bottom="90px"
      right="16px"
      zIndex={1003}
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
        {/* ✅ CORREGIDO: Icon component en lugar de style directo */}
        <Icon icon={PlusIcon} size="lg" />
      </Button>
    </Box>
  );
}