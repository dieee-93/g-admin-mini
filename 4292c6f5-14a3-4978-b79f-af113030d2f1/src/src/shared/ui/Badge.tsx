import React from 'react';
/**
 * Badge - Status/Category Indicator
 *
 * Badge para indicar estados, categorías o etiquetas.
 * Soporta diferentes variantes y colores.
 */

import { Badge as ChakraBadge } from '@chakra-ui/react';
interface BadgeProps {
  /**
   * Contenido del badge
   */
  children: React.ReactNode;
  /**
   * Variante visual
   */
  variant?: 'solid' | 'subtle' | 'outline';
  /**
   * Esquema de color
   */
  colorScheme?: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  /**
   * Tamaño del badge
   */
  size?: 'sm' | 'md' | 'lg';
}
export function Badge({
  children,
  variant = 'subtle',
  colorScheme = 'gray',
  size = 'md'
}: BadgeProps) {
  return (
    <ChakraBadge
      variant={variant}
      colorScheme={colorScheme}
      fontSize={size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md'}
      px={size === 'sm' ? '2' : size === 'md' ? '3' : '4'}
      py={size === 'sm' ? '1' : '1'}
      borderRadius="base"
      fontWeight="medium"
      textTransform="uppercase"
      letterSpacing="wide">

      {children}
    </ChakraBadge>);

}
/**
 * StatusBadge - Predefined Status Badge
 *
 * Badge con estados predefinidos para casos comunes.
 */
interface StatusBadgeProps {
  /**
   * Estado
   */
  status: 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning';
  /**
   * Tamaño
   */
  size?: 'sm' | 'md' | 'lg';
}
const STATUS_CONFIG = {
  active: {
    label: 'Activo',
    colorScheme: 'green'
  },
  inactive: {
    label: 'Inactivo',
    colorScheme: 'gray'
  },
  pending: {
    label: 'Pendiente',
    colorScheme: 'yellow'
  },
  success: {
    label: 'Exitoso',
    colorScheme: 'green'
  },
  error: {
    label: 'Error',
    colorScheme: 'red'
  },
  warning: {
    label: 'Advertencia',
    colorScheme: 'yellow'
  }
} as const;
export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge colorScheme={config.colorScheme} size={size}>
      {config.label}
    </Badge>);

}