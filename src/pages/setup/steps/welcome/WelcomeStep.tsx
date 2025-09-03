import React, { useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { 
  Button, 
  Heading, 
  VStack,
  InputField
} from '@/shared/ui';

interface WelcomeStepProps {
  onStepComplete: (userName: string) => void;
}

export function WelcomeStep({ onStepComplete }: WelcomeStepProps) {
  const [userName, setUserName] = useState('');

  const handleStart = () => {
    if (userName.trim()) {
      console.log('👋 WelcomeStep: calling onStepComplete with:', userName.trim());
      onStepComplete(userName.trim());
      console.log('👋 WelcomeStep: onStepComplete called');
    } else {
      console.warn('👋 WelcomeStep: userName is empty, cannot proceed');
    }
  };

  return (
    <Box w="full" p={4}>
      <Box
        bgGradient="linear(135deg, gray.100 0%, gray.200 50%, gray.300 100%)"
        borderRadius="xl"
        p={8}
        w="full"
      >
          <VStack gap="xl" align="center" textAlign="center">
            
            {/* Header con emoji */}
            <Box>
              <Text fontSize="6xl" lineHeight="1">
                🏪
              </Text>
            </Box>

            {/* Contenido principal de bienvenida */}
            <VStack gap="md">
              <Heading size="2xl">
                ¡Bienvenido a g-admin!
              </Heading>
              
              <Text fontSize="xl" fontWeight="medium">
                El sistema que transformará tu negocio
              </Text>
              
              <Text fontSize="lg" lineHeight="relaxed">
                Controla inventarios, gestiona ventas, analiza costos y toma decisiones inteligentes. 
                Todo en una plataforma diseñada para hacer crecer tu negocio.
              </Text>
            </VStack>

            {/* Sección de personalización */}
            <VStack gap="lg" mt={8}>
              <VStack gap="sm">
                <Text fontSize="lg" fontWeight="medium">
                  Para empezar, ¿cómo te gustaría que te llamemos?
                </Text>
                <Text fontSize="md" textAlign="center">
                  Puede ser tu nombre, apodo o como prefieras que nos dirijamos a ti
                </Text>
              </VStack>
              
              <Box w="full" maxW="md">
                <InputField
                  placeholder="Ej: María, Carlos, Jefe, Doc. López..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  size="lg"
                />
                {userName.trim() && (
                  <Text fontSize="sm" mt={2}>
                    ¡Perfecto! Te llamaremos {userName.trim()} 👍
                  </Text>
                )}
              </Box>
            </VStack>

            {/* Botón de continuar */}
            <Box w="full" maxW="md" mt={6}>
              <Button
                variant="solid"
                onClick={handleStart}
                disabled={!userName.trim()}
                size="lg"
              >
                {userName.trim() ? `¡Hola ${userName.trim()}! Empezar 🚀` : 'Ingresa tu nombre para continuar'}
              </Button>
            </Box>

            {/* Footer informativo */}
            <VStack gap="sm" pt="md" borderTop="1px solid" borderColor="gray.200" mt={8}>
              <Text fontSize="sm" fontWeight="medium">
                📋 Configuración estimada: 5-10 minutos
              </Text>
              <Text fontSize="sm" textAlign="center">
                🔒 Tus datos están seguros • 🌐 Funciona offline • 📞 Soporte incluido
              </Text>
              <Text fontSize="xs" textAlign="center">
                g-admin v2.0 - Sistema de gestión empresarial
              </Text>
            </VStack>

          </VStack>
      </Box>
    </Box>
  );
}
