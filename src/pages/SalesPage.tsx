// src/pages/SalesPage.tsx
// Placeholder para módulo de ventas

import { Box, VStack, Text, Card } from '@chakra-ui/react';

export function SalesPage() {
  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        <VStack align="start" gap="2">
          <Text fontSize="3xl" fontWeight="bold">Ventas</Text>
          <Text color="gray.600">
            Registro de ventas y gestión de transacciones
          </Text>
        </VStack>

        <Card.Root>
          <Card.Body>
            <VStack gap="4">
              <Text fontSize="lg">Módulo en desarrollo</Text>
              <Text color="gray.600">
                Aquí podrás registrar ventas, gestionar clientes y analizar el rendimiento comercial.
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
}