import React, { useState } from 'react';
import { Box, Stack, Text, Button } from '@chakra-ui/react';
import { useSetupStore } from '../../../store/setupStore';
import { useBusinessProfile, useCompleteSetup } from '@/lib/capabilities';
import { logger } from '@/lib/logging';
import { useNavigationActions } from '@/contexts/NavigationContext';

export function FinishStep() {
  const { userName } = useSetupStore();
  const { profile } = useBusinessProfile();
  const { mutate: completeSetup } = useCompleteSetup();
  const { navigate } = useNavigationActions();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleFinishSetup = async () => {
    setIsCompleting(true);

    try {
      logger.info('SetupWizard', '🎯 Finalizando setup...');

      completeSetup();

      logger.info('SetupWizard', '✅ Setup completado:', {
        capabilities: profile?.selectedCapabilities?.length ?? 0,
        infrastructure: profile?.selectedInfrastructure?.length ?? 0
      });

      navigate('dashboard');

    } catch (error) {
      logger.error('SetupWizard', '❌ Error completing setup:', error);
      navigate('dashboard');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <Box textAlign="center" p="8">
      <Stack gap="6" align="center">
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
          onClick={handleFinishSetup}
          isLoading={isCompleting}
          loadingText="Finalizando..."
          className="setup-interactive"
        >
          Ir al Dashboard →
        </Button>
      </Stack>
    </Box>
  );
}
