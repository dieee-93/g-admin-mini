import React from 'react';
import { Box, VStack, Stack, Text, Heading } from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { Button } from '@/shared/ui/Button';
import { DocumentCheckIcon } from '@heroicons/react/24/outline';

interface SetupSummaryProps {
  userName: string;
  adminUser: {email: string, password: string, fullName: string} | null;
  onComplete: () => void;
  onBack: () => void;
}

export function SetupSummary({ userName, adminUser, onComplete, onBack }: SetupSummaryProps) {
  return (
    <Box maxW="500px" mx="auto" p={6}>
      <VStack gap={6} align="stretch">
        <VStack gap={3} textAlign="center">
          <Box bg="purple.500" color="white" borderRadius="full" p={3} display="inline-flex">
            <DocumentCheckIcon width={24} height={24} />
          </Box>
          <Heading size="lg" color="gray.700">Resumen de Configuración</Heading>
          <Text color="gray.600" fontSize="md">
            Revisá la configuración antes de finalizar.
          </Text>
        </VStack>

        <CardWrapper>
          <Box p={6}>
            <VStack gap={4} align="start">
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">Usuario de bienvenida:</Text>
                <Text fontSize="sm" color="gray.600">{userName || 'No especificado'}</Text>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">Administrador:</Text>
                <Text fontSize="sm" color="gray.600">
                  {adminUser?.fullName || 'No configurado'} ({adminUser?.email || 'Sin email'})
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">Base de datos:</Text>
                <Text fontSize="sm" color="gray.600">Configurada y lista</Text>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">Modelo de negocio:</Text>
                <Text fontSize="sm" color="gray.600">Definido</Text>
              </Box>
            </VStack>
          </Box>
        </CardWrapper>

        <Stack direction="row" justify="space-between">
          <Button variant="ghost" onClick={onBack}>← Atrás</Button>
          <Button onClick={onComplete}>Finalizar Configuración</Button>
        </Stack>
      </VStack>
    </Box>
  );
}
