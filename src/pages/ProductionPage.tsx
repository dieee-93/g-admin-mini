
// src/pages/ProductionPage.tsx
// Placeholder para módulo de producción
// ✅ Estructura básica que seguirá el patrón

import { Box, VStack, Text, Card } from '@chakra-ui/react';

export function ProductionPage() {
  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        <VStack align="start" gap="2">
          <Text fontSize="3xl" fontWeight="bold">Producción</Text>
          <Text color="gray.600">
            Recetas, costos y planificación de producción
          </Text>
        </VStack>

        <Card.Root>
          <Card.Body>
            <VStack gap="4">
              <Text fontSize="lg">Módulo en desarrollo</Text>
              <Text color="gray.600">
                Aquí podrás gestionar recetas, calcular costos de producción y planificar la elaboración de productos.
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
}
