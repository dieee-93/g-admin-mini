/**
 * ActivityFeedWidget - Feed de actividad reciente
 *
 * DISEÑO COPIADO DE: newdashboard/src/components/dashboard/ActivityFeedWidget.tsx
 * ADAPTADO A: G-Admin Mini design system
 *
 * Lista scrolleable de actividades recientes con:
 * - Tipos de actividad (sale, order, customer, alert, success)
 * - Iconos y colores por tipo
 * - Avatar del usuario
 * - Timestamp relativo
 * - Badge de tipo
 * - Hover effect
 * - Scrollbar personalizado
 *
 * @example
 * <ActivityFeedWidget maxItems={10} />
 *
 * @example
 * // Con actividades custom
 * <ActivityFeedWidget
 *   activities={customActivities}
 *   maxItems={5}
 * />
 */

import React from 'react';
import { Box, Stack, Typography, Icon, Badge, Avatar } from '@/shared/ui';
import {
  ShoppingCartIcon,
  CubeIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// ===============================
// TYPES
// ===============================

export interface Activity {
  id: string;
  type: 'sale' | 'order' | 'customer' | 'alert' | 'success';
  title: string;
  description: string;
  user?: string;
  timestamp: string;
  icon?: React.ElementType;
  color?: string;
}

export interface ActivityFeedWidgetProps {
  /** Lista de actividades */
  activities?: Activity[];

  /** Número máximo de items a mostrar */
  maxItems?: number;
}

// ===============================
// DEFAULT DATA
// ===============================

const defaultActivities: Activity[] = [
  {
    id: '1',
    type: 'sale',
    title: 'Nueva venta completada',
    description: 'Venta #1234 por $450.00',
    user: 'Juan Pérez',
    timestamp: 'Hace 2 minutos',
    icon: ShoppingCartIcon,
    color: 'green.500'
  },
  {
    id: '2',
    type: 'order',
    title: 'Orden de producción creada',
    description: 'Orden #567 - 50 unidades',
    user: 'María García',
    timestamp: 'Hace 15 minutos',
    icon: CubeIcon,
    color: 'blue.500'
  },
  {
    id: '3',
    type: 'customer',
    title: 'Nuevo cliente registrado',
    description: 'Carlos Rodríguez - Premium',
    user: 'Sistema',
    timestamp: 'Hace 30 minutos',
    icon: UserGroupIcon,
    color: 'purple.500'
  },
  {
    id: '4',
    type: 'alert',
    title: 'Stock bajo en Material XYZ',
    description: 'Solo quedan 5 unidades',
    user: 'Sistema',
    timestamp: 'Hace 1 hora',
    icon: ExclamationTriangleIcon,
    color: 'orange.500'
  },
  {
    id: '5',
    type: 'success',
    title: 'Sincronización completada',
    description: 'Todos los módulos actualizados',
    user: 'Sistema',
    timestamp: 'Hace 2 horas',
    icon: CheckCircleIcon,
    color: 'green.500'
  }
];

// ===============================
// COMPONENT
// ===============================

export const ActivityFeedWidget: React.FC<ActivityFeedWidgetProps> = ({
  activities = defaultActivities,
  maxItems = 10
}) => {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Box
      bg="gray.100"
      borderRadius="2xl"
      p={6}
      height="100%"
      maxH="600px"
      overflowY="auto"
      css={{
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
      }}
    >
      <Typography variant="heading" size="lg" weight="bold" mb={6}>
        Actividad Reciente
      </Typography>

      <Stack gap="4">
        {displayedActivities.map(activity => (
          <Box
            key={activity.id}
            p={4}
            bg="gray.50"
            borderRadius="xl"
            borderLeft="3px solid"
            borderColor={activity.color}
            transition="all 0.2s"
            _hover={{
              bg: 'bg.subtle',
              transform: 'translateX(4px)'
            }}
          >
            <Stack direction="row" gap="4" align="start">
              {/* Icon */}
              <Box
                p={2}
                borderRadius="lg"
                bg="gray.100"
                color={activity.color}
                flexShrink={0}
              >
                <Icon as={activity.icon} boxSize={5} />
              </Box>

              {/* Content */}
              <Box flex={1}>
                <Typography
                  variant="body"
                  size="sm"
                  weight="semibold"
                  mb={1}
                >
                  {activity.title}
                </Typography>
                <Typography
                  variant="body"
                  size="xs"
                  color="fg.muted"
                  mb={2}
                >
                  {activity.description}
                </Typography>

                <Stack direction="row" gap="3" align="center">
                  {activity.user && (
                    <Stack direction="row" gap="2" align="center">
                      <Avatar name={activity.user} size="xs" />
                      <Typography variant="body" size="xs" color="fg.subtle">
                        {activity.user}
                      </Typography>
                    </Stack>
                  )}
                  <Typography variant="body" size="xs" color="fg.subtle">
                    {activity.timestamp}
                  </Typography>
                </Stack>
              </Box>

              {/* Type Badge */}
              <Badge
                size="sm"
                colorPalette={
                  activity.type === 'sale'
                    ? 'green'
                    : activity.type === 'alert'
                      ? 'orange'
                      : 'blue'
                }
                variant="subtle"
                flexShrink={0}
              >
                {activity.type}
              </Badge>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};
