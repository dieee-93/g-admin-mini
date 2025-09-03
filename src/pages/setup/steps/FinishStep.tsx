import React from 'react';
import { Box, Stack, Text, Button } from '@chakra-ui/react';
import { useSetupStore } from '../../../store/setupStore';

export function FinishStep() {
  const { userName } = useSetupStore();

  return (
    <Box textAlign="center" p={8}>
      <Stack gap={6} align="center">
        <Text fontSize="3xl" color="gray.700">
          ¡Todo listo! 🎉
        </Text>
        <Text fontSize="md" color="gray.600">
          {userName ? `${userName}, tu negocio` : 'Tu negocio'} ha sido configurado exitosamente. Ya podés empezar a operar.
        </Text>
        <Button
          size="lg"
          bg="gray.800"
          color="gray.50"
          _hover={{ bg: 'gray.900' }}
          onClick={() => window.location.href = '/admin'}
          className="setup-interactive"
        >
          Ir al Dashboard →
        </Button>
      </Stack>
    </Box>
  );
}
