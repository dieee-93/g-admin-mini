/**
 * ACHIEVEMENTS WIDGET PLACEHOLDER
 *
 * Widget simplificado que NO usa useValidationContext
 * para evitar el infinite loop mientras se refactoriza la arquitectura.
 *
 * @version 1.0.0 - Placeholder temporal
 */

import React from 'react';
import { Box, VStack, HStack, Heading, Text, Button } from '@/shared/ui';
import { useCapabilityStore } from '@/store/capabilityStore';
import { useShallow } from 'zustand/react/shallow';
import { useNavigationActions } from '@/contexts/NavigationContext';

export default function AchievementsWidgetPlaceholder() {
  const { navigate } = useNavigationActions();

  // ✅ Solo leer activeFeatures - NO usar useValidationContext
  // 🔧 FIX: Usar useShallow para prevenir re-renders por cambio de referencia del array
  const activeFeatures = useCapabilityStore(
    useShallow((state) => state.features.activeFeatures)
  );
  const setupCompleted = useCapabilityStore((state) => state.profile?.setupCompleted ?? false);

  return (
    <Box
      gap="3"
      gridColumn={{ base: 'span 1', md: 'span 2' }}
      p="6"
      bg="purple.50"
      borderRadius="lg"
      border="2px solid"
      borderColor="purple.200"
      _dark={{
        bg: 'purple.900/20',
        borderColor: 'purple.700'
      }}
    >
      <VStack align="start" gap="4" w="full">
        <HStack gap="3">
          <Text fontSize="3xl">🎯</Text>
          <Heading size="lg" color="purple.700" _dark={{ color: 'purple.300' }}>
            Sistema de Logros
          </Heading>
        </HStack>

        <Text color="gray.700" _dark={{ color: 'gray.300' }} fontSize="md">
          {setupCompleted
            ? `Tienes ${activeFeatures.length} funcionalidades activas en tu negocio.`
            : 'Completa la configuración inicial para desbloquear todas las funcionalidades.'}
        </Text>

        <Button
          size="lg"
          colorPalette="purple"
          w="full"
          onClick={() => navigate('gamification', '/achievements')}
        >
          Ver Logros y Configuración
        </Button>

        <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.500' }}>
          ⚠️ Widget en modo simplificado (refactorización pendiente)
        </Text>
      </VStack>
    </Box>
  );
}
