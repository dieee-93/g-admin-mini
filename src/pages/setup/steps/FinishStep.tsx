import React, { useState } from 'react';
import { Box, Stack, Text, Button } from '@chakra-ui/react';
import { useSetupStore } from '../../../store/setupStore';
import { useCapabilities } from '../../../store/capabilityStore';
import { logger } from '@/lib/logging';
import { useNavigationActions } from '@/contexts/NavigationContext';

export function FinishStep() {
  const { userName } = useSetupStore();
  const { completeSetup, saveToDB, profile } = useCapabilities();
  const { navigate } = useNavigationActions();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleFinishSetup = async () => {
    setIsCompleting(true);

    try {
      logger.info('SetupWizard', '🎯 Finalizando setup...');

      // 1. Complete setup (marks as done, emits setup.completed event)
      completeSetup();

      // 2. Save to database
      const saved = await saveToDB();
      if (!saved) {
        logger.warn('SetupWizard', '⚠️ Could not save to DB, but continuing');
      }

      logger.info('SetupWizard', '✅ Setup completado:', {
        activities: profile?.selectedActivities?.length ?? 0,
        infrastructure: profile?.selectedInfrastructure?.length ?? 0
      });

      // 3. Navigate to dashboard with first-time flag
      navigate('dashboard');

    } catch (error) {
      logger.error('SetupWizard', '❌ Error completing setup:', error);
      // Still navigate even if there's an error
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
