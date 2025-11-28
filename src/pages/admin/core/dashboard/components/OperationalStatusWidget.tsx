/**
 * OperationalStatusWidget - Estado operacional en vivo
 *
 * DISEÑO COPIADO DE: newdashboard/src/components/dashboard/OperationalStatusWidget.tsx
 * ADAPTADO A: G-Admin Mini design system
 *
 * Hero widget que muestra el estado operacional del negocio:
 * - Status abierto/cerrado con badge en vivo
 * - Botón de toggle de estado
 * - Horas de operación
 * - Staff activo con barra de progreso
 * - Alertas activas
 * - Gradiente de fondo con patrón difuminado
 * - Borde de color según estado
 *
 * @example
 * <OperationalStatusWidget
 *   isOpen={true}
 *   currentShift="Turno Mañana"
 *   activeStaff={6}
 *   totalStaff={9}
 *   openTime="09:00"
 *   closeTime="21:00"
 *   operatingHours={4.5}
 *   alerts={2}
 *   onToggleStatus={() => console.log('Toggle')}
 * />
 */

import React from 'react';
import { Box, Stack, Typography, Icon, Badge, Button } from '@/shared/ui';
import { Progress } from '@/shared/ui';
import {
  ClockIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  PowerIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// ===============================
// TYPES
// ===============================

export interface OperationalStatusWidgetProps {
  /** Si el negocio está abierto */
  isOpen: boolean;

  /** Nombre del turno actual */
  currentShift?: string;

  /** Staff activo actualmente */
  activeStaff?: number;

  /** Total de staff disponible */
  totalStaff?: number;

  /** Hora de apertura */
  openTime?: string;

  /** Hora de cierre */
  closeTime?: string;

  /** Horas operadas hoy */
  operatingHours?: number;

  /** Número de alertas activas */
  alerts?: number;

  /** Handler para toggle de estado */
  onToggleStatus?: () => void;
}

// ===============================
// COMPONENT
// ===============================

export const OperationalStatusWidget: React.FC<OperationalStatusWidgetProps> = ({
  isOpen = true,
  currentShift = 'Turno Mañana',
  activeStaff = 6,
  totalStaff = 9,
  openTime = '09:00',
  closeTime = '21:00',
  operatingHours = 4.5,
  alerts = 0,
  onToggleStatus
}) => {
  const staffPercentage = (activeStaff / totalStaff) * 100;

  return (
    <Box
      bgGradient={isOpen ? 'linear(to-br, blue.800, gray.800)' : 'linear(to-br, gray.800, gray.900)'}
      borderRadius="3xl"
      p={8}
      position="relative"
      overflow="hidden"
      boxShadow="xl"
      border="1px solid"
      borderColor={isOpen ? 'green.500' : 'red.500'}
    >
      {/* Background Pattern - Patrón difuminado */}
      <Box
        position="absolute"
        top="-50%"
        right="-20%"
        width="300px"
        height="300px"
        borderRadius="full"
        bg={isOpen ? 'green.500' : 'red.500'}
        opacity={0.05}
        filter="blur(60px)"
      />

      <Stack direction="row" justify="space-between" align="start" mb={6}>
        {/* Status Badge */}
        <Stack gap={3} flex={1}>
          <Stack direction="row" align="center" gap={3}>
            <Icon
              as={isOpen ? CheckCircleIcon : ExclamationCircleIcon}
              boxSize={8}
              color={isOpen ? 'green.500' : 'red.500'}
            />
            <Box>
              <Typography variant="heading" size="2xl" weight="bold">
                {isOpen ? 'Operativo' : 'Cerrado'}
              </Typography>
              <Typography variant="body" size="sm" color="fg.muted">
                {currentShift}
              </Typography>
            </Box>
          </Stack>

          <Badge
            colorPalette={isOpen ? 'green' : 'red'}
            size="md"
            px={4}
            py={2}
            borderRadius="full"
            variant="solid"
          >
            {isOpen ? '● EN VIVO' : '● FUERA DE LÍNEA'}
          </Badge>
        </Stack>

        {/* Toggle Button */}
        {onToggleStatus && (
          <Button
            colorPalette={isOpen ? 'red' : 'green'}
            size="lg"
            onClick={onToggleStatus}
            px={8}
            borderRadius="full"
          >
            <Icon as={PowerIcon} boxSize={5} mr={2} />
            {isOpen ? 'Cerrar' : 'Abrir'}
          </Button>
        )}
      </Stack>

      {/* Stats Grid */}
      <Box
        bg="whiteAlpha.100"
        borderRadius="2xl"
        p={6}
        backdropFilter="blur(10px)"
      >
        <Stack direction="row" gap={6} wrap="wrap">
          {/* Operating Hours */}
          <Box flex={1} minW="200px">
            <Stack direction="row" align="center" gap={3} mb={3}>
              <Icon as={ClockIcon} color="blue.500" boxSize={5} />
              <Typography
                variant="body"
                size="sm"
                color="fg.muted"
                weight="medium"
              >
                Horas de Operación Hoy
              </Typography>
            </Stack>
            <Typography variant="heading" size="3xl" weight="bold">
              {operatingHours}h
            </Typography>
            <Typography variant="body" size="xs" color="fg.subtle" mt={1}>
              {openTime} - {closeTime}
            </Typography>
          </Box>

          {/* Active Staff */}
          <Box flex={1} minW="200px">
            <Stack direction="row" align="center" gap={3} mb={3}>
              <Icon as={UserGroupIcon} color="purple.500" boxSize={5} />
              <Typography
                variant="body"
                size="sm"
                color="fg.muted"
                weight="medium"
              >
                Staff Activo
              </Typography>
            </Stack>
            <Typography variant="heading" size="3xl" weight="bold">
              {activeStaff}/{totalStaff}
            </Typography>
            <Progress.Root
              value={staffPercentage}
              colorPalette="purple"
              size="sm"
              borderRadius="full"
              mt={2}
            >
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          </Box>

          {/* Alerts */}
          <Box flex={1} minW="200px">
            <Stack direction="row" align="center" gap={3} mb={3}>
              <Icon
                as={ExclamationCircleIcon}
                color={alerts > 0 ? 'orange.500' : 'green.500'}
                boxSize={5}
              />
              <Typography
                variant="body"
                size="sm"
                color="fg.muted"
                weight="medium"
              >
                Alertas Activas
              </Typography>
            </Stack>
            <Typography
              variant="heading"
              size="3xl"
              weight="bold"
              color={alerts > 0 ? 'orange.500' : 'green.500'}
            >
              {alerts}
            </Typography>
            <Typography variant="body" size="xs" color="fg.subtle" mt={1}>
              {alerts === 0 ? 'Todo en orden' : 'Requiere atención'}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Quick Info */}
      <Stack direction="row" gap={4} mt={6}>
        <Stack direction="row" align="center" gap={2}>
          <Icon as={CalendarIcon} color="fg.muted" boxSize={4} />
          <Typography variant="body" size="xs" color="fg.muted">
            Última actualización: Hace 2 min
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};
