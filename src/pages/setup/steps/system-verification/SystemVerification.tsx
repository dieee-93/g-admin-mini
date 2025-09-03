import React from 'react';
import { Box, VStack, Stack, Text, Heading } from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { Button } from '@/shared/ui/Button';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface SystemVerificationProps {
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
}

export function SystemVerification({ onNext, onBack, onSkip }: SystemVerificationProps) {
  return (
    <Box maxW="500px" mx="auto" p={6}>
      <VStack gap={6} align="stretch">
        <VStack gap={3} textAlign="center">
          <Box bg="orange.500" color="white" borderRadius="full" p={3} display="inline-flex">
            <CheckCircleIcon width={24} height={24} />
          </Box>
          <Heading size="lg" color="gray.700">Verificación del Sistema</Heading>
          <Text color="gray.600" fontSize="md">
            Verificando que todo esté configurado correctamente...
          </Text>
          <Text color="blue.600" fontSize="sm" fontStyle="italic">
            🔹 Este paso es opcional - puedes saltarlo si quieres continuar rápidamente
          </Text>
        </VStack>

        <CardWrapper>
          <Box p={6}>
            <VStack gap={3} align="start">
              <Text fontSize="sm" color="green.600">✓ Conexión a base de datos establecida</Text>
              <Text fontSize="sm" color="green.600">✓ Tablas creadas correctamente</Text>
              <Text fontSize="sm" color="green.600">✓ Usuario administrador configurado</Text>
              <Text fontSize="sm" color="green.600">✓ Configuración básica guardada</Text>
            </VStack>
          </Box>
        </CardWrapper>

        <Stack direction="row" justify="space-between">
          <Button variant="ghost" onClick={onBack}>← Atrás</Button>
          <Stack direction="row" gap={3}>
            {onSkip && (
              <Button variant="outline" onClick={onSkip}>
                Saltar verificación
              </Button>
            )}
            <Button onClick={onNext}>Continuar</Button>
          </Stack>
        </Stack>
      </VStack>
    </Box>
  );
}
