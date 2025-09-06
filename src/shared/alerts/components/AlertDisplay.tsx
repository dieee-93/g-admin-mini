// src/shared/alerts/components/AlertDisplay.tsx
// 🎯 COMPONENTE BASE UNIFICADO PARA MOSTRAR ALERTAS
// Reemplaza AlertCard y otros componentes similares

import React from 'react';
import {
  Alert,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Badge,
  Box,
} from '@chakra-ui/react';
import {
  ExclamationTriangleIcon,
  FireIcon,
  ShieldExclamationIcon,
  InformationCircleIcon,
  BellIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  CubeIcon,
  TruckIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import type { Alert as AlertType, AlertSeverity, AlertType as AlertTypeEnum } from '../types';
import { CardWrapper } from '@/shared/ui';

export interface AlertDisplayProps {
  alert: AlertType;
  variant?: 'card' | 'banner' | 'inline' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showActions?: boolean;
  showMetadata?: boolean;
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string, notes?: string) => void;
  onDismiss?: (id: string) => void;
  onView?: (id: string) => void;
  onAction?: (actionId: string, alertId: string) => void;
}

// Mapeo de severidades a colores
const severityColorMap: Record<AlertSeverity, string> = {
  critical: 'red',
  high: 'orange', 
  medium: 'yellow',
  low: 'blue',
  info: 'gray'
};

// Mapeo de severidades a iconos
const severityIconMap: Record<AlertSeverity, React.ComponentType<any>> = {
  critical: FireIcon,
  high: ExclamationTriangleIcon,
  medium: ShieldExclamationIcon,
  low: InformationCircleIcon,
  info: InformationCircleIcon
};

// Mapeo de tipos a iconos
const typeIconMap: Record<AlertTypeEnum, React.ComponentType<any>> = {
  stock: CubeIcon,
  system: Cog6ToothIcon,
  validation: ShieldExclamationIcon,
  business: TruckIcon,
  security: ShieldExclamationIcon,
  operational: BellIcon
};

// Mapeo de estados a texto en español
const statusTextMap = {
  active: 'Activa',
  acknowledged: 'Reconocida', 
  resolved: 'Resuelta',
  dismissed: 'Descartada'
};

export function AlertDisplay({
  alert,
  variant = 'card',
  size = 'md',
  showActions = true,
  showMetadata = true,
  onAcknowledge,
  onResolve,
  onDismiss,
  onView,
  onAction
}: AlertDisplayProps) {
  const severityColor = severityColorMap[alert.severity];
  const SeverityIcon = severityIconMap[alert.severity];
  const TypeIcon = typeIconMap[alert.type];

  // Helper para formatear tiempo relativo
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  };

  // Renderizar acciones
  const renderActions = () => {
    if (!showActions || alert.status === 'resolved' || alert.status === 'dismissed') {
      return null;
    }

    const actions = [];

    // Acciones del sistema
    if (alert.status === 'active' && onAcknowledge) {
      actions.push(
        <IconButton
          key="acknowledge"
          size="xs"
          variant="ghost"
          colorPalette="blue"
          onClick={() => onAcknowledge(alert.id)}
          aria-label="Reconocer alerta"
        >
          <CheckCircleIcon className="w-3 h-3" />
        </IconButton>
      );
    }

    if ((alert.status === 'active' || alert.status === 'acknowledged') && onResolve) {
      actions.push(
        <IconButton
          key="resolve"
          size="xs"
          variant="ghost"
          colorPalette="green"
          onClick={() => onResolve(alert.id)}
          aria-label="Resolver alerta"
        >
          <CheckCircleIcon className="w-3 h-3" />
        </IconButton>
      );
    }

    if (onDismiss) {
      actions.push(
        <IconButton
          key="dismiss"
          size="xs"
          variant="ghost"
          colorPalette="red"
          onClick={() => onDismiss(alert.id)}
          aria-label="Descartar alerta"
        >
          <XMarkIcon className="w-3 h-3" />
        </IconButton>
      );
    }

    if (onView) {
      actions.push(
        <IconButton
          key="view"
          size="xs"
          variant="ghost"
          onClick={() => onView(alert.id)}
          aria-label="Ver detalles"
        >
          <EyeIcon className="w-3 h-3" />
        </IconButton>
      );
    }

    // Acciones personalizadas de la alerta
    if (alert.actions && alert.actions.length > 0) {
      alert.actions.forEach(action => {
        actions.push(
          <Button
            key={action.id}
            size="xs"
            variant={action.variant === 'primary' ? 'solid' : 'outline'}
            colorPalette={
              action.variant === 'danger' ? 'red' :
              action.variant === 'primary' ? severityColor : 'gray'
            }
            onClick={() => {
              if (onAction) {
                onAction(action.id, alert.id);
              } else {
                action.action();
              }
              
              // Auto-resolve si está configurado
              if (action.autoResolve && onResolve) {
                onResolve(alert.id, `Resuelto por acción: ${action.label}`);
              }
            }}
          >
            {action.label}
          </Button>
        );
      });
    }

    return actions.length > 0 ? (
      <HStack gap="1" flexWrap="wrap">
        {actions}
      </HStack>
    ) : null;
  };

  // Renderizar metadata
  const renderMetadata = () => {
    if (!showMetadata || !alert.metadata) return null;

    const metadata = alert.metadata;
    const items = [];

    if (metadata.itemName) {
      items.push(
        <Badge key="item" colorPalette="blue" variant="subtle" size="xs">
          {metadata.itemName}
        </Badge>
      );
    }

    if (metadata.currentStock !== undefined && metadata.minThreshold !== undefined) {
      items.push(
        <Text key="stock" fontSize="xs" color="gray.600">
          Stock: {metadata.currentStock} / Min: {metadata.minThreshold}
        </Text>
      );
    }

    if (metadata.estimatedImpact) {
      items.push(
        <Text key="impact" fontSize="xs" color={severityColor + '.600'}>
          Impacto: {metadata.estimatedImpact}
        </Text>
      );
    }

    return items.length > 0 ? (
      <HStack gap="2" flexWrap="wrap">
        {items}
      </HStack>
    ) : null;
  };

  // Variants de renderizado
  if (variant === 'minimal') {
    return (
      <HStack gap="2" p="2" bg={`${severityColor}.50`} borderRadius="md" border="1px solid" borderColor={`${severityColor}.200`}>
        <SeverityIcon className={`w-4 h-4 text-${severityColor}-500`} />
        <Text fontSize="sm" fontWeight="medium" flex="1">
          {alert.title}
        </Text>
        <Badge colorPalette={severityColor} size="xs">
          {statusTextMap[alert.status]}
        </Badge>
      </HStack>
    );
  }

  if (variant === 'banner') {
    return (
      <Alert.Root status={alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info'}>
        <Alert.Indicator>
          <SeverityIcon className="w-4 h-4" />
        </Alert.Indicator>
        
        <VStack align="start" gap="2" flex="1">
          <Alert.Title>
            <HStack gap="2">
              <Text>{alert.title}</Text>
              {alert.isRecurring && (
                <Badge colorPalette="purple" size="xs">
                  Recurrente ({alert.occurrenceCount})
                </Badge>
              )}
            </HStack>
          </Alert.Title>
          
          {alert.description && (
            <Alert.Description>
              {alert.description}
            </Alert.Description>
          )}
          
          {renderMetadata()}
          {renderActions()}
        </VStack>
      </Alert.Root>
    );
  }

  if (variant === 'inline') {
    return (
      <Box p="3" bg={`${severityColor}.50`} borderLeft="4px solid" borderColor={`${severityColor}.400`} borderRadius="md">
        <HStack justify="space-between" align="start">
          <HStack gap="3" align="start" flex="1">
            <SeverityIcon className={`w-5 h-5 text-${severityColor}-500 mt-0.5`} />
            <VStack align="start" gap="1" flex="1">
              <HStack gap="2" align="center">
                <Text fontWeight="medium" fontSize="sm">
                  {alert.title}
                </Text>
                <Badge colorPalette={severityColor} size="xs">
                  {alert.severity === 'critical' ? 'Crítica' :
                   alert.severity === 'high' ? 'Alta' :
                   alert.severity === 'medium' ? 'Media' :
                   alert.severity === 'low' ? 'Baja' : 'Info'}
                </Badge>
              </HStack>
              
              {alert.description && (
                <Text fontSize="sm" color="gray.700">
                  {alert.description}
                </Text>
              )}
              
              {renderMetadata()}
            </VStack>
          </HStack>
          
          <VStack align="end" gap="1">
            <Text fontSize="xs" color="gray.500">
              {getRelativeTime(alert.createdAt)}
            </Text>
            {renderActions()}
          </VStack>
        </HStack>
      </Box>
    );
  }

  // Default: card variant
  return (
    <CardWrapper size={size} variant="outline" borderColor={`${severityColor}.200`}>
      <CardWrapper.Body>
        <VStack align="stretch" gap="3">
          {/* Header */}
          <HStack justify="space-between" align="start">
            <HStack gap="3" align="start" flex="1">
              <Box mt="0.5">
                <SeverityIcon className={`w-5 h-5 text-${severityColor}-500`} />
              </Box>
              
              <VStack align="start" gap="1" flex="1">
                <HStack gap="2" align="center" flexWrap="wrap">
                  <Text fontWeight="medium" fontSize={size === 'sm' ? 'sm' : 'md'}>
                    {alert.title}
                  </Text>
                  
                  <Badge colorPalette={severityColor} size="xs">
                    {alert.severity === 'critical' ? 'Crítica' :
                     alert.severity === 'high' ? 'Alta' :
                     alert.severity === 'medium' ? 'Media' :
                     alert.severity === 'low' ? 'Baja' : 'Info'}
                  </Badge>
                  
                  {alert.isRecurring && (
                    <Badge colorPalette="purple" size="xs">
                      Recurrente ({alert.occurrenceCount})
                    </Badge>
                  )}
                </HStack>

                {alert.description && (
                  <Text fontSize="sm" color="gray.600">
                    {alert.description}
                  </Text>
                )}
              </VStack>
            </HStack>
            
            <VStack align="end" gap="1">
              <Text fontSize="xs" color="gray.500">
                {getRelativeTime(alert.createdAt)}
              </Text>
              <HStack gap="1">
                <TypeIcon className="w-4 h-4 text-gray-400" />
                <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                  {alert.context}
                </Text>
              </HStack>
            </VStack>
          </HStack>

          {/* Metadata */}
          {renderMetadata()}

          {/* Actions */}
          {renderActions()}
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}