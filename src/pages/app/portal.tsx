// CustomerPortal.tsx - Dashboard personalizado para usuarios CLIENTE
// Experiencia tipo web/app customer-friendly

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Card
} from '@chakra-ui/react';
import {
  HomeIcon,
  ShoppingBagIcon,
  ClockIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
import { MetricCard } from '@/shared/ui';

// Componente de bienvenida personalizado
function WelcomeHero() {
  return (
    <Card.Root variant="elevated" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="white">
      <Card.Body>
        <VStack align="start" gap="4" py="4">
          <HStack gap="3" align="center">
            <Box p="3" bg="rgba(255,255,255,0.2)" borderRadius="xl">
              <Icon icon={HomeIcon} size="lg" color="white" />
            </Box>
            <VStack align="start" gap="1">
              <Text fontSize="2xl" fontWeight="bold" lineHeight="1">
                ¡Bienvenido de vuelta!
              </Text>
              <Text fontSize="md" opacity={0.9}>
                Tu espacio personalizado en G-Admin
              </Text>
            </VStack>
          </HStack>
          
          <HStack gap="3" pt="2">
            <Button
              variant="solid"
              bg="white"
              color="purple.600"
              size="md"
              leftIcon={<Icon icon={ShoppingBagIcon} size="sm" />}
              _hover={{ bg: "gray.50" }}
            >
              Ver Menú
            </Button>
            <Button
              variant="outline"
              borderColor="white"
              color="white"
              size="md"
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
            >
              Mis Pedidos
            </Button>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

// Cards de acciones rápidas para cliente
function QuickActions() {
  const actions = [
    {
      id: 'new-order',
      title: 'Hacer Pedido',
      description: 'Explora nuestro menú',
      icon: ShoppingBagIcon,
      color: 'orange',
      path: '/customer-menu'
    },
    {
      id: 'track-order', 
      title: 'Seguir Pedido',
      description: 'Estado en tiempo real',
      icon: ClockIcon,
      color: 'blue',
      path: '/my-orders'
    },
    {
      id: 'favorites',
      title: 'Favoritos',
      description: 'Tus productos preferidos',
      icon: HeartIcon,
      color: 'pink',
      path: '/customer-menu?filter=favorites'
    },
    {
      id: 'reviews',
      title: 'Reseñas',
      description: 'Comparte tu experiencia',
      icon: StarIcon,
      color: 'yellow',
      path: '/reviews'
    }
  ];

  return (
    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap="4">
      {actions.map((action) => (
        <Card.Root
          key={action.id}
          variant="elevated"
          cursor="pointer"
          _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
          transition="all 0.2s"
          bg="bg.surface"
        >
          <Card.Body>
            <VStack align="center" gap="3" py="2">
              <Box 
                p="3" 
                bg={`${action.color}.50`} 
                borderRadius="xl"
                color={`${action.color}.600`}
              >
                <Icon icon={action.icon} size="lg" />
              </Box>
              <VStack align="center" gap="1">
                <Text fontSize="md" fontWeight="semibold" textAlign="center">
                  {action.title}
                </Text>
                <Text fontSize="xs" color="text.muted" textAlign="center">
                  {action.description}
                </Text>
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      ))}
    </Grid>
  );
}

// Resumen de pedidos para cliente
function OrdersSummary() {
  return (
    <VStack align="stretch" gap="4">
      <HStack justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="semibold" color="text.primary">
          Mi Actividad
        </Text>
        <Button variant="ghost" size="sm" color="blue.600">
          Ver Todo
        </Button>
      </HStack>
      
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="4">
        <MetricCard
          title="Pedidos este mes"
          value={12}
          subtitle="3 pendientes"
          icon={ShoppingBagIcon}
          iconColor="blue.600"
          iconBg="blue.50"
          additionalInfo="+2 vs mes anterior"
        />
        <MetricCard
          title="Favoritos"
          value={8}
          subtitle="Productos guardados"
          icon={HeartIcon}
          iconColor="pink.600"
          iconBg="pink.50"
        />
        <MetricCard
          title="Puntos Loyalty"
          value={245}
          subtitle="¡Próxima recompensa!"
          icon={StarIcon}
          iconColor="yellow.600"
          iconBg="yellow.50"
          additionalInfo="55 puntos más"
        />
      </Grid>
    </VStack>
  );
}

// Pedidos recientes
function RecentOrders() {
  const recentOrders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      items: ['Pizza Margherita', 'Coca Cola'],
      status: 'entregado',
      total: '$15.90'
    },
    {
      id: 'ORD-002', 
      date: '2024-01-12',
      items: ['Hamburguesa Clásica', 'Papas Fritas'],
      status: 'entregado',
      total: '$12.50'
    },
    {
      id: 'ORD-003',
      date: '2024-01-10', 
      items: ['Ensalada César'],
      status: 'entregado',
      total: '$8.90'
    }
  ];

  return (
    <VStack align="stretch" gap="4">
      <HStack justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="semibold" color="text.primary">
          Pedidos Recientes
        </Text>
        <Button variant="ghost" size="sm" color="blue.600">
          Ver Historial
        </Button>
      </HStack>
      
      <VStack align="stretch" gap="3">
        {recentOrders.map((order) => (
          <Card.Root key={order.id} variant="outline" size="sm">
            <Card.Body>
              <HStack justify="space-between" align="center">
                <VStack align="start" gap="1">
                  <Text fontSize="sm" fontWeight="medium">
                    {order.id} - {order.date}
                  </Text>
                  <Text fontSize="xs" color="text.secondary">
                    {order.items.join(', ')}
                  </Text>
                </VStack>
                <VStack align="end" gap="1">
                  <Text fontSize="sm" fontWeight="semibold" color="green.600">
                    {order.total}
                  </Text>
                  <Text fontSize="xs" color="text.muted">
                    {order.status}
                  </Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>
        ))}
      </VStack>
    </VStack>
  );
}

export function CustomerPortal() {
  return (
    <Box p={{ base: "4", md: "6" }} maxW="1200px" mx="auto">
      <VStack align="stretch" gap="8">
        {/* Hero Section */}
        <WelcomeHero />
        
        {/* Quick Actions */}
        <VStack align="stretch" gap="4">
          <Text fontSize="xl" fontWeight="semibold" color="text.primary">
            Acciones Rápidas
          </Text>
          <QuickActions />
        </VStack>
        
        {/* Activity Summary */}
        <OrdersSummary />
        
        {/* Recent Orders */}
        <RecentOrders />
      </VStack>
    </Box>
  );
}

export default CustomerPortal;