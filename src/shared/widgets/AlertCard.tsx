/**
 * AlertCard - Tarjeta de alerta simple
 *
 * DISEÑO COPIADO DE: newdashboard/src/components/widgets/AlertCard.tsx
 * ADAPTADO A: G-Admin Mini design system
 *
 * Widget reutilizable para mostrar alertas con:
 * - Título y descripción
 * - Status con colores (success, warning, error, info)
 * - Icono automático según status
 * - Diseño compacto
 *
 * @example
 * <AlertCard
 *   title="Stock crítico"
 *   description="Material XYZ tiene solo 5 unidades"
 *   status="warning"
 * />
 *
 * @example
 * // Con icono custom
 * <AlertCard
 *   title="Sistema actualizado"
 *   description="Nueva versión disponible"
 *   status="success"
 *   icon={<Icon as={CheckCircleIcon} boxSize={5} />}
 * />
 */

import React from 'react';
import { Box, Stack, Typography, Icon } from '@/shared/ui';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// ===============================
// TYPES
// ===============================

export interface AlertCardProps {
  /** Título de la alerta */
  title: string;

  /** Descripción detallada */
  description: string;

  /** Nivel de severidad */
  status?: 'success' | 'warning' | 'error' | 'info';

  /** Icono custom (opcional, usa icono por defecto si no se provee) */
  icon?: React.ReactElement;
}

// ===============================
// HELPERS
// ===============================

const getStatusColor = (status: AlertCardProps['status']) => {
  switch (status) {
    case 'success':
      return 'green.500';
    case 'warning':
      return 'orange.500';
    case 'error':
      return 'red.500';
    default:
      return 'blue.500';
  }
};

const getDefaultIcon = (status: AlertCardProps['status']) => {
  switch (status) {
    case 'success':
      return CheckCircleIcon;
    case 'warning':
      return ExclamationTriangleIcon;
    case 'error':
      return XCircleIcon;
    default:
      return InformationCircleIcon;
  }
};

// ===============================
// COMPONENT
// ===============================

export const AlertCard: React.FC<AlertCardProps> = ({
  title,
  description,
  status = 'info',
  icon
}) => {
  const statusColor = getStatusColor(status);
  const defaultIconComponent = getDefaultIcon(status);

  return (
    <Box
      bg="gray.100"
      borderRadius="md"
      p={4}
      borderLeft="4px solid"
      borderColor={statusColor}
    >
      <Stack direction="row" align="center" mb={2}>
        <Box color={statusColor} mr={2}>
          {icon || <Icon as={defaultIconComponent} boxSize={4} />}
        </Box>
        <Typography
          variant="body"
          weight="medium"
          color="fg.default"
        >
          {title}
        </Typography>
      </Stack>

      <Typography
        variant="body"
        size="sm"
        color="fg.muted"
      >
        {description}
      </Typography>
    </Box>
  );
};
