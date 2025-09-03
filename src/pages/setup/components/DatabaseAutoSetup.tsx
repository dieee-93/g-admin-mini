import React, { useState, useEffect } from 'react';
import { VStack, HStack, Text, Badge, Box } from '@chakra-ui/react';
import { CardWrapper, CardHeader, CardBody, Heading } from '@/shared/ui';
import { DatabaseSetupService } from '@/services/DatabaseSetupService';
import type { SetupProgress } from '@/services/DatabaseSetupService';

interface DatabaseAutoSetupProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
  onSetupComplete: () => void;
  onSetupError: (error: string) => void;
}

interface SetupStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  error?: string;
}

export function DatabaseAutoSetup({ 
  supabaseUrl, 
  supabaseAnonKey, 
  onSetupComplete, 
  onSetupError 
}: DatabaseAutoSetupProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<SetupStep[]>([
    { id: 'connection', name: 'Verificar conexión', description: 'Conectando con Supabase...', status: 'pending' },
    { id: 'user_roles', name: 'Sistema de roles', description: 'Creando tipos y tablas de usuarios...', status: 'pending' },
    { id: 'core_tables', name: 'Tablas principales', description: 'Creando materiales, inventario, recetas...', status: 'pending' },
    { id: 'sales_tables', name: 'Sistema de ventas', description: 'Creando ventas, clientes, proveedores...', status: 'pending' },
    { id: 'functions', name: 'Funciones SQL', description: 'Configurando lógica de negocio...', status: 'pending' },
    { id: 'rls_policies', name: 'Políticas de seguridad', description: 'Configurando Row Level Security...', status: 'pending' },
    { id: 'triggers', name: 'Triggers automáticos', description: 'Configurando actualizaciones automáticas...', status: 'pending' },
    { id: 'initial_data', name: 'Datos iniciales', description: 'Insertando configuración básica...', status: 'pending' },
  ]);

  const updateStepStatus = (stepId: string, status: SetupStep['status'], error?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, error } : step
    ));
  };

  const runSetup = async () => {
    setIsRunning(true);

    try {
      // Crear el servicio de configuración con las credenciales proporcionadas
      const setupService = new DatabaseSetupService(
        (progress: SetupProgress) => {
          updateStepStatus(progress.step, progress.completed ? 'success' : 'running', progress.error);
        },
        supabaseUrl,
        supabaseAnonKey
      );

      // Ejecutar la configuración completa
      const success = await setupService.runCompleteSetup();

      if (success) {
        // Configuración completada exitosamente
        setTimeout(() => {
          onSetupComplete();
        }, 2000);
      } else {
        throw new Error('La configuración no se completó correctamente');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en la configuración';
      onSetupError(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Iniciar automáticamente cuando se monta el componente
    runSetup();
  }, []);

  const completedSteps = steps.filter(step => step.status === 'success').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <VStack align="stretch" gap="lg">
      <CardWrapper>
        <CardHeader>
          <Heading size="md">⚡ Configuración Automática de Base de Datos</Heading>
          <Text color="gray.600">
            Configurando tu base de datos de Supabase automáticamente. Este proceso puede tomar unos minutos.
          </Text>
        </CardHeader>
        <CardBody>
          <VStack align="stretch" gap="md">
            {/* Barra de progreso general */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="medium">Progreso General</Text>
                <Text fontSize="sm" color="gray.600">
                  {completedSteps} de {steps.length} completados ({Math.round(progressPercentage)}%)
                </Text>
              </HStack>
              <Box 
                width="100%" 
                height={4} 
                bg="bg.subtle" 
                borderRadius="md" 
                overflow="hidden"
              >
                <Box 
                  width={`${progressPercentage}%`} 
                  height="100%" 
                  bg="blue.500"
                  transition="width 0.3s ease"
                />
              </Box>
            </Box>

            {/* Lista de pasos */}
            <VStack align="stretch" gap="sm">
              {steps.map((step) => (
                <CardWrapper 
                  key={step.id} 
                  variant="outline"
                  bg={
                    step.status === 'success' ? 'green.50' :
                    step.status === 'error' ? 'red.50' :
                    step.status === 'running' ? 'blue.50' :
                    'gray.50'
                  }
                  borderColor={
                    step.status === 'success' ? 'green.200' :
                    step.status === 'error' ? 'red.200' :
                    step.status === 'running' ? 'blue.200' :
                    'gray.200'
                  }
                >
                  <CardBody>
                    <HStack justify="space-between">
                      <VStack align="start" gap="xs">
                        <HStack>
                          <Text fontWeight="medium">{step.name}</Text>
                          {step.status === 'success' && (
                            <Badge bg="green.500" color="white">✓ Completado</Badge>
                          )}
                          {step.status === 'error' && (
                            <Badge bg="red.500" color="white">✗ Error</Badge>
                          )}
                          {step.status === 'running' && (
                            <Badge bg="blue.500" color="white">🔄 Ejecutando</Badge>
                          )}
                          {step.status === 'pending' && (
                            <Badge bg="gray.500" color="white">⏳ Pendiente</Badge>
                          )}
                        </HStack>
                        <Text fontSize="sm" color="gray.600">{step.description}</Text>
                        {step.error && (
                          <Text fontSize="sm" color="red.600">Error: {step.error}</Text>
                        )}
                      </VStack>
                    </HStack>
                  </CardBody>
                </CardWrapper>
              ))}
            </VStack>

            {/* Mensaje final */}
            {!isRunning && (
              <CardWrapper variant="outline" bg="green.50" borderColor="green.200">
                <CardBody>
                  <VStack align="center" gap="sm">
                    <Badge bg="green.500" color="white" fontSize="md">🎉 CONFIGURACIÓN COMPLETADA</Badge>
                    <Text textAlign="center">
                      Tu base de datos ha sido configurada exitosamente. Ahora puedes continuar con la configuración de tu empresa.
                    </Text>
                  </VStack>
                </CardBody>
              </CardWrapper>
            )}
          </VStack>
        </CardBody>
      </CardWrapper>
    </VStack>
  );
}
