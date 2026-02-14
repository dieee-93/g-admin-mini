import React, { useState } from 'react';
import { Box, VStack, Stack, Text, Heading, CardWrapper, Button, InputField } from '@/shared/ui';
import { CogIcon } from '@heroicons/react/24/outline';

import { logger } from '@/lib/logging';
interface BasicSystemConfigProps {
  onComplete: () => void;
  onBack: () => void;
  onSkip?: () => void;
}

export function BasicSystemConfig({ onComplete, onBack, onSkip }: BasicSystemConfigProps) {
  const [businessName, setBusinessName] = useState('');
  const [currency, setCurrency] = useState('ARS');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!businessName.trim()) return;
    setIsSaving(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      logger.info('App', 'System config saved:', { businessName, currency });
      onComplete();
    } catch (error) {
      logger.error('App', 'Error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box maxW="500px" mx="auto" p="6">
      <VStack gap="6" align="stretch">
        <VStack gap="3" textAlign="center">
          <Box bg="green.500" color="white" borderRadius="full" p="3" display="inline-flex">
            <CogIcon width={24} height={24} />
          </Box>
          <Heading size="lg" color="gray.700">Configuración Básica</Heading>
          <Text color="gray.600" fontSize="md">
            Configurá los parámetros básicos de tu negocio.
          </Text>
          <Text color="blue.600" fontSize="sm" fontStyle="italic">
            🔹 Este paso es opcional - puedes configurarlo más tarde en Settings
          </Text>
        </VStack>

        <CardWrapper>
          <Box p="6">
            <VStack gap="4" align="stretch">
              <InputField
                label="Nombre del negocio"
                placeholder="Ej: Mi Restaurante"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb="2">
                  Moneda
                </Text>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <option value="ARS">Peso Argentino (ARS)</option>
                  <option value="USD">Dólar Estadounidense (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="BRL">Real Brasileño (BRL)</option>
                </select>
              </Box>
            </VStack>
          </Box>
        </CardWrapper>

        <Stack direction="row" justify="space-between">
          <Button variant="ghost" onClick={onBack}>← Atrás</Button>
          <Stack direction="row" gap="3">
            {onSkip && (
              <Button variant="outline" onClick={onSkip}>
                Saltar por ahora
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={!businessName.trim()} loading={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar y Continuar'}
            </Button>
          </Stack>
        </Stack>
      </VStack>
    </Box>
  );
}
