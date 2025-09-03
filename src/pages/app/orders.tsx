// MyOrders.tsx - Historial y seguimiento de pedidos para clientes
// Experiencia moderna de seguimiento de órdenes

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Badge,
  Tabs,
  Progress,
  Grid
} from '@chakra-ui/react';
import {
  ListBulletIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';

// Tipos para pedidos
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
  estimatedTime?: string;
  progress?: number;
  deliveryAddress?: string;
  orderType: 'delivery' | 'pickup' | 'dine-in';
}

// Datos de ejemplo
const SAMPLE_ORDERS: Order[] = [
  {
    id: 'ORD-2024-001',
    date: '2024-01-20T14:30:00',
    status: 'preparing',
    items: [
      { id: '1', name: 'Pizza Margherita', quantity: 1, price: 15.90 },
      { id: '2', name: 'Coca Cola', quantity: 2, price: 2.50 }
    ],
    total: 20.90,
    estimatedTime: '15 min',
    progress: 60,
    orderType: 'delivery',
    deliveryAddress: 'Av. Principal 123, Apt 4B'
  },
  {
    id: 'ORD-2024-002',
    date: '2024-01-19T19:15:00',
    status: 'delivered',
    items: [
      { id: '3', name: 'Hamburguesa Clásica', quantity: 2, price: 12.50 },
      { id: '4', name: 'Papas Fritas', quantity: 1, price: 4.50 }
    ],
    total: 29.50,
    orderType: 'pickup'
  },
  {
    id: 'ORD-2024-003',
    date: '2024-01-18T12:45:00',
    status: 'delivered',
    items: [
      { id: '5', name: 'Ensalada César', quantity: 1, price: 8.90 }
    ],
    total: 8.90,
    orderType: 'dine-in'
  },
  {
    id: 'ORD-2024-004',
    date: '2024-01-17T20:30:00',
    status: 'cancelled',
    items: [
      { id: '6', name: 'Tacos al Pastor', quantity: 3, price: 11.50 }
    ],
    total: 34.50,
    orderType: 'delivery'
  }
];

// Utilidades para status
function getStatusColor(status: Order['status']) {
  const colors = {
    pending: 'yellow',
    preparing: 'blue',
    ready: 'green',
    delivered: 'teal',
    cancelled: 'red'
  };
  return colors[status] || 'gray';
}

function getStatusText(status: Order['status']) {
  const texts = {
    pending: 'Pendiente',
    preparing: 'Preparando',
    ready: 'Listo',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };
  return texts[status] || status;
}

function getStatusIcon(status: Order['status']) {
  const icons = {
    pending: ClockIcon,
    preparing: ArrowPathIcon,
    ready: CheckCircleIcon,
    delivered: CheckCircleIcon,
    cancelled: XCircleIcon
  };
  return icons[status] || ClockIcon;
}

function getOrderTypeText(type: Order['orderType']) {
  const types = {
    delivery: 'Delivery',
    pickup: 'Para retirar',
    'dine-in': 'En el local'
  };
  return types[type] || type;
}

// Componente de progreso del pedido
function OrderProgress({ order }: { order: Order }) {
  if (order.status === 'delivered' || order.status === 'cancelled') {
    return null;
  }

  return (
    <VStack align="stretch" gap="3">
      <HStack justify="space-between" align="center">
        <Text fontSize="sm" fontWeight="medium">
          Estado del pedido
        </Text>
        {order.estimatedTime && (
          <Text fontSize="sm" color="blue.600" fontWeight="medium">
            {order.estimatedTime} restantes
          </Text>
        )}
      </HStack>
      
      <Progress.Root value={order.progress || 0} colorPalette="blue" size="md">
        <Progress.Track bg="bg.muted">
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
      
      <HStack justify="space-between">
        <Text fontSize="xs" color="text.muted">
          Recibido
        </Text>
        <Text fontSize="xs" color="text.muted">
          Preparando
        </Text>
        <Text fontSize="xs" color="text.muted">
          Listo
        </Text>
      </HStack>
    </VStack>
  );
}

// Componente de card de pedido
function OrderCard({ order, onViewDetails, onReorder }: {
  order: Order;
  onViewDetails: (orderId: string) => void;
  onReorder: (orderId: string) => void;
}) {
  const StatusIcon = getStatusIcon(order.status);
  
  return (
    <Card.Root 
      variant="elevated" 
      bg="bg.surface"
      _hover={{ shadow: "md" }}
      transition="all 0.2s"
    >
      <Card.Body>
        <VStack align="stretch" gap="4">
          {/* Header */}
          <HStack justify="space-between" align="start">
            <VStack align="start" gap="1">
              <HStack gap="2" align="center">
                <Text fontSize="lg" fontWeight="semibold">
                  {order.id}
                </Text>
                <Badge colorPalette={getStatusColor(order.status)} variant="subtle">
                  <HStack gap="1" align="center">
                    <Icon icon={StatusIcon} size="xs" />
                    <Text fontSize="xs">{getStatusText(order.status)}</Text>
                  </HStack>
                </Badge>
              </HStack>
              <Text fontSize="sm" color="text.secondary">
                {new Date(order.date).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
              <Text fontSize="xs" color="text.muted">
                {getOrderTypeText(order.orderType)}
                {order.deliveryAddress && ` • ${order.deliveryAddress}`}
              </Text>
            </VStack>
            
            <Text fontSize="xl" fontWeight="bold" color="green.600">
              ${order.total.toFixed(2)}
            </Text>
          </HStack>
          
          {/* Items */}
          <VStack align="stretch" gap="2">
            {order.items.map((item) => (
              <HStack key={item.id} justify="space-between" align="center">
                <HStack gap="2">
                  <Text fontSize="sm" fontWeight="medium" color="blue.600">
                    {item.quantity}x
                  </Text>
                  <Text fontSize="sm">{item.name}</Text>
                </HStack>
                <Text fontSize="sm" color="text.secondary">
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </HStack>
            ))}
          </VStack>
          
          {/* Progress para pedidos activos */}
          <OrderProgress order={order} />
          
          {/* Actions */}
          <HStack gap="2">
            <Button
              leftIcon={<Icon icon={EyeIcon} size="sm" />}
              variant="outline"
              size="sm"
              flex="1"
              onClick={() => onViewDetails(order.id)}
            >
              Ver Detalles
            </Button>
            
            {order.status === 'delivered' && (
              <Button
                leftIcon={<Icon icon={ArrowPathIcon} size="sm" />}
                colorPalette="blue"
                variant="solid" 
                size="sm"
                flex="1"
                onClick={() => onReorder(order.id)}
              >
                Pedir de Nuevo
              </Button>
            )}
            
            {order.status === 'delivered' && (
              <Button
                leftIcon={<Icon icon={StarIcon} size="sm" />}
                colorPalette="yellow"
                variant="outline"
                size="sm"
              >
                Calificar
              </Button>
            )}
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

export function MyOrders() {
  const [selectedTab, setSelectedTab] = useState('all');

  const handleViewDetails = (orderId: string) => {
    console.log('Ver detalles del pedido:', orderId);
    // TODO: Implementar modal o navegación a detalles
  };

  const handleReorder = (orderId: string) => {
    console.log('Reordenar pedido:', orderId);
    // TODO: Implementar lógica de reorden
  };

  // Filtrar órdenes según tab
  const filteredOrders = SAMPLE_ORDERS.filter(order => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'active') return ['pending', 'preparing', 'ready'].includes(order.status);
    if (selectedTab === 'completed') return ['delivered'].includes(order.status);
    return false;
  });

  // Estadísticas rápidas
  const stats = {
    total: SAMPLE_ORDERS.length,
    active: SAMPLE_ORDERS.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length,
    completed: SAMPLE_ORDERS.filter(o => o.status === 'delivered').length
  };

  return (
    <Box p={{ base: "4", md: "6" }} maxW="1200px" mx="auto">
      <VStack align="stretch" gap="8">
        {/* Header */}
        <VStack align="start" gap="2">
          <Text fontSize="3xl" fontWeight="bold" color="text.primary">
            Mis Pedidos
          </Text>
          <Text fontSize="lg" color="text.secondary">
            Historial completo y seguimiento en tiempo real
          </Text>
        </VStack>
        
        {/* Stats Cards */}
        <Grid templateColumns={{ base: "repeat(3, 1fr)" }} gap="4">
          <Card.Root variant="elevated" bg="blue.50">
            <Card.Body textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {stats.total}
              </Text>
              <Text fontSize="sm" color="blue.600">
                Total
              </Text>
            </Card.Body>
          </Card.Root>
          
          <Card.Root variant="elevated" bg="orange.50">
            <Card.Body textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                {stats.active}
              </Text>
              <Text fontSize="sm" color="orange.600">
                Activos
              </Text>
            </Card.Body>
          </Card.Root>
          
          <Card.Root variant="elevated" bg="green.50">
            <Card.Body textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {stats.completed}
              </Text>
              <Text fontSize="sm" color="green.600">
                Completados
              </Text>
            </Card.Body>
          </Card.Root>
        </Grid>
        
        {/* Tabs */}
        <Tabs.Root value={selectedTab} onValueChange={(e) => setSelectedTab(e.value as string)}>
          <Tabs.List bg="bg.surface" borderRadius="xl" p="1">
            <Tabs.Trigger value="all" flex="1" borderRadius="lg">
              <Text fontSize="sm" fontWeight="medium">
                Todos ({stats.total})
              </Text>
            </Tabs.Trigger>
            <Tabs.Trigger value="active" flex="1" borderRadius="lg">
              <Text fontSize="sm" fontWeight="medium">
                Activos ({stats.active})
              </Text>
            </Tabs.Trigger>
            <Tabs.Trigger value="completed" flex="1" borderRadius="lg">
              <Text fontSize="sm" fontWeight="medium">
                Completados ({stats.completed})
              </Text>
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
        
        {/* Orders List */}
        <VStack align="stretch" gap="4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={handleViewDetails}
                onReorder={handleReorder}
              />
            ))
          ) : (
            <Card.Root variant="outline">
              <Card.Body>
                <VStack gap="4" py="8">
                  <Icon icon={ListBulletIcon} size="2xl" color="text.muted" />
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="medium" color="text.secondary">
                      No hay pedidos en esta categoría
                    </Text>
                    <Text fontSize="md" color="text.muted">
                      Cuando hagas un pedido, aparecerá aquí
                    </Text>
                  </VStack>
                  <Button colorPalette="orange" leftIcon={<Icon icon={ListBulletIcon} size="sm" />}>
                    Explorar Menú
                  </Button>
                </VStack>
              </Card.Body>
            </Card.Root>
          )}
        </VStack>
      </VStack>
    </Box>
  );
}

export default MyOrders;