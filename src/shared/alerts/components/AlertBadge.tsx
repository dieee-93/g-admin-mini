// src/shared/alerts/components/AlertBadge.tsx
// 🎯 COMPONENTE UNIFICADO DE BADGE DE ALERTAS
// Reemplaza AlertsBadge y todas sus variantes

import React from 'react';
import {
  HStack,
  Badge,
  Text,
  Box,
  Skeleton,
  IconButton
} from '@chakra-ui/react';
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

export function AlertBadge({
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

  // Si no hay alertas, no mostrar nada (a menos que sea explícitamente forzado)
  if (!shouldShow) {
    return null;
  }

  // Determinar el icono a usar
  const getIcon = () => {
    if (hasCritical) {
      return <FireIcon className="w-4 h-4" />;
    }
    if (criticalCount > 0) {
      return <ExclamationTriangleIcon className="w-4 h-4" />;
    }
    return <BellIcon className="w-4 h-4" />;
  };

  // Determinar el tamaño del badge
  const getBadgeSize = () => {
    switch (size) {
      case 'xs': return 'xs';
      case 'sm': return 'sm';
      case 'md': return 'md';
      case 'lg': return 'lg';
      default: return 'sm';
    }
  };

  // Estilos de animación para críticas
  const pulseAnimation = showAnimation && hasCritical ? {
    animation: 'pulse 2s infinite'
  } : {};

  // Variant: counter-only
  if (variant === 'counter-only') {
    return (
      <Badge
        colorPalette={color}
        variant="solid"
        size={getBadgeSize()}
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
        {getIcon()}
        
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
            {getIcon()}
          </Box>
        )}
        
        <Badge
          colorPalette={color}
          variant="solid"
          size={getBadgeSize()}
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
          {getIcon()}
        </Box>
      )}

      <HStack gap="1">
        {/* Critical alerts */}
        {criticalCount > 0 && (
          <Badge 
            colorPalette="red" 
            variant="solid" 
            size={getBadgeSize()}
            style={showAnimation ? { animation: 'pulse 2s infinite' } : {}}
          >
            {criticalCount}
          </Badge>
        )}

        {/* Active alerts (non-critical) */}
        {activeCount - criticalCount > 0 && (
          <Badge colorPalette="orange" variant="solid" size={getBadgeSize()}>
            {activeCount - criticalCount}
          </Badge>
        )}

        {/* Acknowledged alerts */}
        {count - activeCount > 0 && (
          <Badge colorPalette="yellow" variant="outline" size={getBadgeSize()}>
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
}

// Wrapper components for common use cases

/**
 * 🎯 Badge para navegación principal
 */
export function NavAlertBadge({ onClick }: { onClick?: () => void }) {
  return (
    <AlertBadge 
      variant="icon-only"
      size="sm"
      onClick={onClick}
      showAnimation={true}
    />
  );
}

/**
 * 🎯 Badge para sidebar
 */
export function SidebarAlertBadge({ onClick }: { onClick?: () => void }) {
  return (
    <AlertBadge 
      variant="minimal"
      size="sm"
      showIcon={true}
      showText={true}
      onClick={onClick}
    />
  );
}

/**
 * 🎯 Badge específico para stock
 */
export function StockAlertBadge({ onClick }: { onClick?: () => void }) {
  return (
    <AlertBadge 
      variant="detailed"
      size="sm"
      context="materials"
      type="stock"
      onClick={onClick}
    />
  );
}

/**
 * 🎯 Badge para alertas críticas solamente
 */
export function CriticalAlertBadge({ onClick }: { onClick?: () => void }) {
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
}

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