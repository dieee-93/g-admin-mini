import React from 'react';
import { Box, VStack, HStack, Text, Avatar, Icon, Badge } from '@chakra-ui/react';
import { ShoppingCart, Package, Users, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
interface Activity {
  id: string;
  type: 'sale' | 'order' | 'customer' | 'alert' | 'success';
  title: string;
  description: string;
  user?: string;
  timestamp: string;
  icon?: React.ElementType;
  color?: string;
}
const defaultActivities: Activity[] = [{
  id: '1',
  type: 'sale',
  title: 'Nueva venta completada',
  description: 'Venta #1234 por $450.00',
  user: 'Juan Pérez',
  timestamp: 'Hace 2 minutos',
  icon: ShoppingCart,
  color: 'green.400'
}, {
  id: '2',
  type: 'order',
  title: 'Orden de producción creada',
  description: 'Orden #567 - 50 unidades',
  user: 'María García',
  timestamp: 'Hace 15 minutos',
  icon: Package,
  color: 'blue.400'
}, {
  id: '3',
  type: 'customer',
  title: 'Nuevo cliente registrado',
  description: 'Carlos Rodríguez - Premium',
  user: 'Sistema',
  timestamp: 'Hace 30 minutos',
  icon: Users,
  color: 'purple.400'
}, {
  id: '4',
  type: 'alert',
  title: 'Stock bajo en Material XYZ',
  description: 'Solo quedan 5 unidades',
  user: 'Sistema',
  timestamp: 'Hace 1 hora',
  icon: AlertTriangle,
  color: 'orange.400'
}, {
  id: '5',
  type: 'success',
  title: 'Sincronización completada',
  description: 'Todos los módulos actualizados',
  user: 'Sistema',
  timestamp: 'Hace 2 horas',
  icon: CheckCircle,
  color: 'green.400'
}];
interface ActivityFeedWidgetProps {
  activities?: Activity[];
  maxItems?: number;
}
export const ActivityFeedWidget: React.FC<ActivityFeedWidgetProps> = ({
  activities = defaultActivities,
  maxItems = 10
}) => {
  const displayedActivities = activities.slice(0, maxItems);
  return <Box bg="#152a47" borderRadius="2xl" p={6} height="100%" maxH="600px" overflowY="auto" css={{
    '&::-webkit-scrollbar': {
      width: '8px'
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '10px'
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '10px'
    }
  }}>
      <Text fontSize="lg" fontWeight="bold" color="white" mb={6}>
        Actividad Reciente
      </Text>
      <VStack gap={4} align="stretch">
        {displayedActivities.map(activity => <Box key={activity.id} p={4} bg="#0a1929" borderRadius="xl" borderLeft="3px solid" borderColor={activity.color} transition="all 0.2s" _hover={{
        bg: '#0d1f35',
        transform: 'translateX(4px)'
      }}>
            <HStack gap={4} align="start">
              {/* Icon */}
              <Box p={2} borderRadius="lg" bg="whiteAlpha.100" color={activity.color} flexShrink={0}>
                <Icon as={activity.icon} boxSize={5} />
              </Box>
              {/* Content */}
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="semibold" color="white" mb={1}>
                  {activity.title}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.600" mb={2}>
                  {activity.description}
                </Text>
                <HStack gap={3}>
                  {activity.user && <HStack gap={2}>
                      <Avatar size="xs" name={activity.user} />
                      <Text fontSize="xs" color="whiteAlpha.500">
                        {activity.user}
                      </Text>
                    </HStack>}
                  <Text fontSize="xs" color="whiteAlpha.400">
                    {activity.timestamp}
                  </Text>
                </HStack>
              </Box>
              {/* Type Badge */}
              <Badge size="sm" colorScheme={activity.type === 'sale' ? 'green' : activity.type === 'alert' ? 'orange' : 'blue'} variant="subtle" flexShrink={0}>
                {activity.type}
              </Badge>
            </HStack>
          </Box>)}
      </VStack>
    </Box>;
};