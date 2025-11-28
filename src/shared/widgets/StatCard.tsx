/**
 * StatCard - Tarjeta de estadísticas con tendencias
 *
 * DISEÑO COPIADO DE: newdashboard/src/components/widgets/StatCard.tsx
 * ADAPTADO A: G-Admin Mini design system
 *
 * Widget reutilizable para mostrar métricas con:
 * - Valor principal grande
 * - Icono decorativo
 * - Tendencia (↑/↓ con porcentaje)
 * - Footer con información adicional
 * - Animaciones suaves en hover
 *
 * @example
 * // Uso directo
 * <StatCard
 *   title="Revenue Hoy"
 *   value="$12,450"
 *   icon={<Icon as={CurrencyDollarIcon} boxSize={5} />}
 *   accentColor="green.500"
 *   trend={{ value: '+12.5%', isPositive: true }}
 *   footer="vs ayer"
 * />
 *
 * @example
 * // Inyección vía hook registry (en manifest.tsx)
 * hooks: {
 *   'dashboard.widgets': () => [
 *     {
 *       id: 'revenue-widget',
 *       component: () => <StatCard {...props} />,
 *       priority: 10
 *     }
 *   ]
 * }
 */

import React from 'react';
import { Box, Stack, Typography } from '@/shared/ui';

// ===============================
// TYPES
// ===============================

export interface StatCardProps {
  /** Título del stat */
  title: string;

  /** Valor principal (puede ser número o string formateado) */
  value: string | number;

  /** Subtítulo opcional */
  subtitle?: string;

  /** Icono decorativo (React element) */
  icon?: React.ReactElement;

  /** Color de acento (border izquierdo) */
  accentColor?: string;

  /** Texto del footer */
  footer?: string;

  /** Valor del footer */
  footerValue?: string;

  /** Color del valor del footer */
  footerColor?: string;

  /** Tendencia con valor y dirección */
  trend?: {
    value: string;
    isPositive: boolean;
  };

  /** onClick handler (opcional) */
  onClick?: () => void;
}

// ===============================
// COMPONENT
// ===============================

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = 'gray.600',
  footer,
  footerValue,
  footerColor,
  trend,
  onClick
}) => {
  return (
    <Box
      bg="gray.100"
      p={6}
      borderRadius="2xl"
      borderLeft="4px solid"
      borderColor={accentColor}
      transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'lg'
      }}
    >
      <Stack direction="row" justify="space-between" align="start" mb={4}>
        <Box flex={1}>
          <Typography
            variant="body"
            size="sm"
            color="fg.muted"
            weight="medium"
            mb={2}
          >
            {title}
          </Typography>
          <Typography
            variant="heading"
            size="3xl"
            weight="bold"
            color="fg.default"
            lineHeight="1"
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography
              variant="body"
              size="xs"
              color="fg.subtle"
              mt={2}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {icon && (
          <Box
            p={3}
            borderRadius="xl"
            bg="gray.200"
            color={accentColor}
          >
            {icon}
          </Box>
        )}
      </Stack>

      {trend && (
        <Stack direction="row" align="center" mb={2}>
          <Typography
            variant="body"
            size="sm"
            weight="semibold"
            color={trend.isPositive ? 'green.500' : 'red.500'}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </Typography>
          <Typography
            variant="body"
            size="xs"
            color="fg.subtle"
            ml={2}
          >
            vs período anterior
          </Typography>
        </Stack>
      )}

      {(footer || footerValue) && (
        <Stack
          direction="row"
          justify="space-between"
          align="center"
          pt={4}
          borderTop="1px solid"
          borderColor="border.default"
        >
          {footer && (
            <Typography
              variant="body"
              size="xs"
              color="fg.subtle"
              weight="medium"
            >
              {footer}
            </Typography>
          )}
          {footerValue && (
            <Typography
              variant="body"
              size="sm"
              weight="semibold"
              color={footerColor || 'fg.default'}
            >
              {footerValue}
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
};
