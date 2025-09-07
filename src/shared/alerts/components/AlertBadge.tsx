// src/shared/alerts/components/AlertBadge.tsx
// 🎯 COMPONENTE UNIFICADO DE BADGE DE ALERTAS - OPTIMIZED FOR PERFORMANCE
// Reemplaza AlertsBadge y todas sus variantes

import React, { memo, useMemo } from 'react';
import {
  HStack,
  Badge,
  Text,
  Box,
  Skeleton,
  IconButton
} from '@chakra-ui/react';
import { Icon } from '@/shared/ui';
import {
  ExclamationTriangleIcon,
  BellIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { useAlertsBadge, UseAlertsOptions } from '../hooks/useAlerts';

export interface AlertBadgeProps extends UseAlertsOptions {
  variant?: 'minimal' | 'detailed' | 'counter-only' | 'icon-only';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  showAnimation?: boolean;
  onClick?: () => void;
  className?: string;
}

// CSS-in-JS optimized animations - defined once, reused
const PULSE_ANIMATION_STYLE = {
  animation: 'pulse 2s infinite'
} as const;

const EMPTY_STYLE = {} as const;

export const AlertBadge = memo(function AlertBadge({
  variant = 'minimal',
  size = 'sm',
  showIcon = true,
  showText = false,
  showAnimation = true,
  onClick,
  className,
  ...alertOptions
}: AlertBadgeProps) {
  const {
    count,
    color,
    text,
    shouldShow,
    criticalCount,
    activeCount,
    hasCritical
  } = useAlertsBadge(alertOptions);

  // Memoize expensive calculations
  const icon = useMemo(() => {
    if (hasCritical) {
      return <Icon icon={FireIcon} size="sm" />;
    }
    if (criticalCount > 0) {
      return <Icon icon={ExclamationTriangleIcon} size="sm" />;
    }
    return <Icon icon={BellIcon} size="sm" />;
  }, [hasCritical, criticalCount]);

  const badgeSize = useMemo(() => {
    switch (size) {
      case 'xs': return 'xs';
      case 'sm': return 'sm';
      case 'md': return 'md';
      case 'lg': return 'lg';
      default: return 'sm';
    }
  }, [size]);

  // Optimized animation style - only recalculate when needed
  const pulseAnimation = useMemo(() => 
    showAnimation && hasCritical ? PULSE_ANIMATION_STYLE : EMPTY_STYLE,
    [showAnimation, hasCritical]
  );

  // Si no hay alertas, no mostrar nada (a menos que sea explícitamente forzado)
  if (!shouldShow) {
    return null;
  }

  // Variant: counter-only
  if (variant === 'counter-only') {
    return (
      <Badge
        colorPalette={color}
        variant="solid"
        size={badgeSize}
        cursor={onClick ? 'pointer' : 'default'}
        onClick={onClick}
        className={className}
        style={pulseAnimation}
      >
        {count}
      </Badge>
    );
  }

  // Variant: icon-only
  if (variant === 'icon-only') {
    return (
      <Box
        position="relative"
        cursor={onClick ? 'pointer' : 'default'}
        onClick={onClick}
        className={className}
      >
        {icon}
        
        {count > 0 && (
          <Badge
            position="absolute"
            top="-2"
            right="-2"
            colorPalette={color}
            variant="solid"
            fontSize="xs"
            minWidth="18px"
            height="18px"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={pulseAnimation}
          >
            {count > 99 ? '99+' : count}
          </Badge>
        )}
      </Box>
    );
  }

  // Variant: minimal
  if (variant === 'minimal') {
    return (
      <HStack
        gap="1"
        cursor={onClick ? 'pointer' : 'default'}
        onClick={onClick}
        _hover={onClick ? { opacity: 0.8 } : {}}
        className={className}
      >
        {showIcon && (
          <Box color={`${color}.500`}>
            {icon}
          </Box>
        )}
        
        <Badge
          colorPalette={color}
          variant="solid"
          size={badgeSize}
          style={pulseAnimation}
        >
          {count}
        </Badge>
        
        {showText && (
          <Text fontSize="sm" color="gray.600">
            {text}
          </Text>
        )}
      </HStack>
    );
  }

  // Variant: detailed (default)
  return (
    <HStack
      gap="2"
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      _hover={onClick ? { opacity: 0.8 } : {}}
      p="1"
      borderRadius="md"
      transition="all 0.2s"
      className={className}
    >
      {showIcon && (
        <Box color={hasCritical ? 'red.500' : activeCount > 0 ? 'orange.500' : 'gray.500'}>
          {icon}
        </Box>
      )}

      <HStack gap="1">
        {/* Critical alerts */}
        {criticalCount > 0 && (
          <Badge 
            colorPalette="red" 
            variant="solid" 
            size={badgeSize}
            style={pulseAnimation}
          >
            {criticalCount}
          </Badge>
        )}

        {/* Active alerts (non-critical) */}
        {activeCount - criticalCount > 0 && (
          <Badge colorPalette="orange" variant="solid" size={badgeSize}>
            {activeCount - criticalCount}
          </Badge>
        )}

        {/* Acknowledged alerts */}
        {count - activeCount > 0 && (
          <Badge colorPalette="yellow" variant="outline" size={badgeSize}>
            {count - activeCount}
          </Badge>
        )}

        {showText && (
          <Text fontSize="sm" color="gray.600">
            {text}
          </Text>
        )}
      </HStack>
    </HStack>
  );
});

// Wrapper components for common use cases - Memoized for performance

/**
 * 🎯 Badge para navegación principal - OPTIMIZED
 */
export const NavAlertBadge = memo(function NavAlertBadge({ 
  onClick 
}: { 
  onClick?: () => void 
}) {
  return (
    <AlertBadge 
      variant="icon-only"
      size="sm"
      onClick={onClick}
      showAnimation={true}
    />
  );
});

/**
 * 🎯 Badge para sidebar - OPTIMIZED
 */
export const SidebarAlertBadge = memo(function SidebarAlertBadge({ 
  onClick 
}: { 
  onClick?: () => void 
}) {
  return (
    <AlertBadge 
      variant="minimal"
      size="sm"
      showIcon={true}
      showText={true}
      onClick={onClick}
    />
  );
});

/**
 * 🎯 Badge específico para stock - OPTIMIZED
 */
export const StockAlertBadge = memo(function StockAlertBadge({ 
  onClick 
}: { 
  onClick?: () => void 
}) {
  return (
    <AlertBadge 
      variant="detailed"
      size="sm"
      context="materials"
      type="stock"
      onClick={onClick}
    />
  );
});

/**
 * 🎯 Badge para alertas críticas solamente - OPTIMIZED
 */
export const CriticalAlertBadge = memo(function CriticalAlertBadge({ 
  onClick 
}: { 
  onClick?: () => void 
}) {
  return (
    <AlertBadge 
      variant="minimal"
      size="md"
      severity="critical"
      status={['active', 'acknowledged']}
      showAnimation={true}
      onClick={onClick}
    />
  );
});

/**
 * 🎯 Skeleton loader para cuando se está cargando
 */
export function AlertBadgeSkeleton({ 
  variant = 'minimal',
  size = 'sm' 
}: { 
  variant?: AlertBadgeProps['variant'];
  size?: AlertBadgeProps['size']; 
}) {
  const width = variant === 'detailed' ? '80px' : 
                variant === 'minimal' ? '40px' : 
                '24px';
  
  const height = size === 'xs' ? '20px' :
                 size === 'sm' ? '24px' :
                 size === 'md' ? '28px' : '32px';

  return <Skeleton width={width} height={height} borderRadius="md" />;
}