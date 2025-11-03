import React from 'react';
import { Box, VStack, HStack, Text, Button, Grid } from '@chakra-ui/react';
import { ShoppingCartIcon, ClockIcon, HeartIcon, UserIcon } from '@heroicons/react/24/outline';
import { CardWrapper, Icon } from '@/shared/ui';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationActions } from '@/contexts/NavigationContext';

export function CustomerPortal() {
  const { user } = useAuth();
  const { navigate } = useNavigationActions();

  return (
    <RoleGuard requiredModule="customer_portal">
      <Box p="6">
        <VStack gap="6" align="stretch">
          {/* Bienvenida */}
          <CardWrapper>
            <VStack gap="4" p="6">
              <Icon icon={UserIcon} size="2xl" color="blue.500" />
              <VStack gap="2">
                <Text fontSize="2xl" fontWeight="bold">
                  ¡Bienvenido, {user?.user_metadata?.full_name || user?.email || 'Cliente'}!
                </Text>
                <Text color="gray.600" textAlign="center">
                  Explora nuestro menú, realiza pedidos y mantente al tanto de tus órdenes
                </Text>
              </VStack>
            </VStack>
          </CardWrapper>

          {/* Acciones Rápidas */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="4">
            <CardWrapper>
              <VStack gap="4" p="6" cursor="pointer" _hover={{ transform: 'translateY(-2px)' }} onClick={() => navigate('customer-menu')}>
                <Icon icon={ShoppingCartIcon} size="xl" color="green.500" />
                <VStack gap="2">
                  <Text fontSize="lg" fontWeight="bold">Ver Menú</Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Explora nuestros productos y realiza tu pedido
                  </Text>
                </VStack>
              </VStack>
            </CardWrapper>

            <CardWrapper>
              <VStack gap="4" p="6" cursor="pointer" _hover={{ transform: 'translateY(-2px)' }} onClick={() => navigate('my-orders')}>
                <Icon icon={ClockIcon} size="xl" color="teal.500" />
                <VStack gap="2">
                  <Text fontSize="lg" fontWeight="bold">Mis Pedidos</Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Revisa el estado de tus pedidos actuales e historial
                  </Text>
                </VStack>
              </VStack>
            </CardWrapper>

            <CardWrapper>
              <VStack gap="4" p="6" cursor="pointer" _hover={{ transform: 'translateY(-2px)' }} onClick={() => navigate('customer-settings')}>
                <Icon icon={HeartIcon} size="xl" color="pink.500" />
                <VStack gap="2">
                  <Text fontSize="lg" fontWeight="bold">Favoritos</Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Gestiona tus productos y categorías favoritas
                  </Text>
                </VStack>
              </VStack>
            </CardWrapper>
          </Grid>

          {/* Estadísticas del Cliente */}
          <CardWrapper>
            <VStack gap="4" p="6">
              <Text fontSize="xl" fontWeight="bold">Tu Actividad</Text>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="6" w="full">
                <VStack gap="2">
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">12</Text>
                  <Text fontSize="sm" color="gray.600">Pedidos Totales</Text>
                </VStack>
                <VStack gap="2">
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">$2,450</Text>
                  <Text fontSize="sm" color="gray.600">Total Gastado</Text>
                </VStack>
                <VStack gap="2">
                  <Text fontSize="2xl" fontWeight="bold" color="teal.500">3</Text>
                  <Text fontSize="sm" color="gray.600">Productos Favoritos</Text>
                </VStack>
              </Grid>
            </VStack>
          </CardWrapper>

          {/* Pedidos Recientes */}
          <CardWrapper>
            <VStack gap="4" p="6" align="stretch">
              <HStack justify="space-between">
                <Text fontSize="xl" fontWeight="bold">Pedidos Recientes</Text>
                <Button variant="outline" size="sm" onClick={() => navigate('my-orders')}>
                  Ver Todos
                </Button>
              </HStack>
              
              <VStack gap="3" align="stretch">
                {/* Ejemplo de pedido reciente */}
                <Box p="4" border="1px solid" borderColor="border.default" borderRadius="md">
                  <HStack justify="space-between">
                    <VStack align="start" gap="1">
                      <Text fontWeight="medium">#ORD-2024-001</Text>
                      <Text fontSize="sm" color="gray.600">15 de Agosto, 2024</Text>
                    </VStack>
                    <VStack align="end" gap="1">
                      <Text fontWeight="bold">$890</Text>
                      <Text fontSize="sm" color="green.600">Entregado</Text>
                    </VStack>
                  </HStack>
                </Box>
                
                <Box p="4" border="1px solid" borderColor="border.default" borderRadius="md">
                  <HStack justify="space-between">
                    <VStack align="start" gap="1">
                      <Text fontWeight="medium">#ORD-2024-002</Text>
                      <Text fontSize="sm" color="gray.600">18 de Agosto, 2024</Text>
                    </VStack>
                    <VStack align="end" gap="1">
                      <Text fontWeight="bold">$1,250</Text>
                      <Text fontSize="sm" color="blue.600">En Preparación</Text>
                    </VStack>
                  </HStack>
                </Box>
              </VStack>
            </VStack>
          </CardWrapper>
        </VStack>
      </Box>
    </RoleGuard>
  );
}