// src/pages/CustomersPage.tsx
// Placeholder para módulo de clientes

import { Box, VStack, Text, Card } from '@chakra-ui/react';

export function CustomersPage() {
  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        <VStack align="start" gap="2">
          <Text fontSize="3xl" fontWeight="bold">Clientes</Text>
          <Text color="gray.600">
            Gestión de clientes y relaciones comerciales
          </Text>
        </VStack>

        <Card.Root>
          <Card.Body>
            <VStack gap="4">
              <Text fontSize="lg">Módulo en desarrollo</Text>
              <Text color="gray.600">
                Aquí podrás gestionar la información de clientes, historial de compras y comunicación.
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
}