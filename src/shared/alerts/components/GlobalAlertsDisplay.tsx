// src/shared/alerts/components/GlobalAlertsDisplay.tsx
// 🎯 DISPLAY AUTOMÁTICO DE ALERTAS GLOBALES
// Reemplaza GlobalAlerts con arquitectura más limpia

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Badge,
  Portal,
  Collapsible,
} from '@chakra-ui/react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { AlertDisplay } from './AlertDisplay';
import { useAlerts } from '../hooks/useAlerts';
import { useAlertsContext } from '../AlertsProvider';
import { CardWrapper, Icon } from '@/shared/ui';
import { logger } from '@/lib/logging';
export interface GlobalAlertsDisplayProps {
  maxVisible?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoCollapse?: boolean;
  collapseAfter?: number; // seconds
  showOnlyActive?: boolean;
  showConfiguration?: boolean;
}

export function GlobalAlertsDisplay({
  maxVisible,
  position,
  autoCollapse,
  collapseAfter,
  showOnlyActive = true,
  showConfiguration = false
}: GlobalAlertsDisplayProps) {
  const context = useAlertsContext();
  const { 
    alerts, 
    count, 
    criticalCount, 
    activeCount,
    actions 
  } = useAlerts({
    status: showOnlyActive ? 'active' : ['active', 'acknowledged'],
    autoFilter: true
  });

  // Local state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Use config from context or props
  const finalMaxVisible = maxVisible ?? context.config.maxVisibleAlerts;
  const finalPosition = position ?? context.config.position;
  const finalAutoCollapse = autoCollapse ?? context.config.autoCollapse;
  const finalCollapseAfter = collapseAfter ?? context.config.collapseAfter;

  // Auto-collapse after specified time
  useEffect(() => {
    if (finalAutoCollapse && alerts.length > 0 && !isCollapsed) {
      const timer = setTimeout(() => {
        setIsCollapsed(true);
      }, finalCollapseAfter * 1000);

      return () => clearTimeout(timer);
    }
  }, [alerts.length, finalAutoCollapse, finalCollapseAfter, isCollapsed]);

  // Reset collapsed state when new critical alerts arrive
  useEffect(() => {
    if (criticalCount > 0 && isCollapsed) {
      setIsCollapsed(false);
    }
  }, [criticalCount, isCollapsed]);

  // Position styles
  const positionStyles = {
    'top-right': { top: 4, right: 4 },
    'top-left': { top: 4, left: 4 },
    'bottom-right': { bottom: 4, right: 4 },
    'bottom-left': { bottom: 4, left: 4 }
  };

  // Don't render if no alerts or dismissed
  if (alerts.length === 0 || isDismissed) {
    return null;
  }

  // Get visible alerts
  const visibleAlerts = alerts.slice(0, finalMaxVisible);
  const hasMoreAlerts = alerts.length > finalMaxVisible;

  // Determine header color based on severity
  const getHeaderColor = () => {
    if (criticalCount > 0) return 'red';
    if (activeCount > 0) return 'orange';
    return 'blue';
  };

  const headerColor = getHeaderColor();

  return (
    <Portal>
      <Box
        position="fixed"
        {...positionStyles[finalPosition]}
        zIndex={1100}
        w="350px"
        maxW="90vw"
        pointerEvents="auto"
      >
        <VStack gap="2" align="stretch">
          {/* Header */}
          <CardWrapper
            bg={`${headerColor}.500`}
            color="white"
            size="sm"
          >
            <CardWrapper.Body p="3">
              <HStack justify="space-between" align="center">
                <HStack gap="2" flex="1">
                  <Text fontSize="sm" fontWeight="bold">
                    {criticalCount > 0 
                      ? `${criticalCount} Alertas Críticas`
                      : `${count} Alertas`
                    }
                  </Text>
                  
                  {hasMoreAlerts && (
                    <Badge bg={`${headerColor}.600`} color="white" size="xs">
                      +{alerts.length - finalMaxVisible}
                    </Badge>
                  )}
                </HStack>

                <HStack gap="1">
                  {showConfiguration && (
                    <IconButton
                      size="xs"
                      variant="ghost"
                      color="white"
                      onClick={() => {
                        // TODO: Open alerts configuration
                        logger.info('App', 'Open alerts configuration');
                      }}
                      aria-label="Configurar alertas"
                    >
                      <Icon icon={CogIcon} size="xs" />
                    </IconButton>
                  )}

                  <IconButton
                    size="xs"
                    variant="ghost"
                    color="white"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? 'Expandir alertas' : 'Colapsar alertas'}
                  >
                    {isCollapsed ? 
                      <Icon icon={ChevronDownIcon} size="xs" /> : 
                      <Icon icon={ChevronUpIcon} size="xs" />
                    }
                  </IconButton>

                  <IconButton
                    size="xs"
                    variant="ghost"
                    color="white"
                    onClick={() => setIsDismissed(true)}
                    aria-label="Cerrar panel de alertas"
                  >
                    <Icon icon={XMarkIcon} size="xs" />
                  </IconButton>
                </HStack>
              </HStack>
            </CardWrapper.Body>
          </CardWrapper>

          {/* Alerts List */}
          <Collapsible.Root open={!isCollapsed}>
            <Collapsible.Content>
              <VStack gap="2" align="stretch">
                {visibleAlerts.map((alert) => (
                  <AlertDisplay
                    key={alert.id}
                    alert={alert}
                    variant="card"
                    size="sm"
                    showActions={true}
                    showMetadata={true}
                    onAcknowledge={actions.acknowledge}
                    onResolve={actions.resolve}
                    onDismiss={actions.dismiss}
                    onAction={async (actionId, alertId) => {
                      // Find and execute the action
                      const alert = alerts.find(a => a.id === alertId);
                      const action = alert?.actions?.find(a => a.id === actionId);
                      
                      if (action) {
                        try {
                          await action.action();
                          
                          // Auto-resolve if configured
                          if (action.autoResolve) {
                            await actions.resolve(alertId, `Resuelto por acción: ${action.label}`);
                          }
                        } catch (error) {
                          logger.error('App', 'Error executing alert action:', error);
                        }
                      }
                    }}
                  />
                ))}

                {/* View All Button */}
                {hasMoreAlerts && (
                  <CardWrapper variant="outline" size="sm">
                    <CardWrapper.Body p="3" textAlign="center">
                      <Text
                        fontSize="sm"
                        color="blue.600"
                        cursor="pointer"
                        onClick={() => {
                          // TODO: Navigate to alerts page
                          window.location.href = '/alerts';
                        }}
                        _hover={{ textDecoration: 'underline' }}
                      >
                        Ver todas las alertas ({alerts.length})
                      </Text>
                    </CardWrapper.Body>
                  </CardWrapper>
                )}

                {/* Quick Actions */}
                {alerts.length > 1 && (
                  <CardWrapper variant="outline" size="sm">
                    <CardWrapper.Body p="2">
                      <HStack justify="center" gap="2">
                        <Text
                          fontSize="xs"
                          color="blue.600"
                          cursor="pointer"
                          onClick={() => actions.bulkAcknowledge(visibleAlerts.map(a => a.id))}
                          _hover={{ textDecoration: 'underline' }}
                        >
                          Reconocer todas
                        </Text>
                        
                        <Text fontSize="xs" color="gray.400">•</Text>
                        
                        <Text
                          fontSize="xs"
                          color="green.600"
                          cursor="pointer"
                          onClick={() => actions.bulkResolve(visibleAlerts.map(a => a.id))}
                          _hover={{ textDecoration: 'underline' }}
                        >
                          Resolver todas
                        </Text>
                        
                        <Text fontSize="xs" color="gray.400">•</Text>
                        
                        <Text
                          fontSize="xs"
                          color="red.600"
                          cursor="pointer"
                          onClick={() => actions.bulkDismiss(visibleAlerts.map(a => a.id))}
                          _hover={{ textDecoration: 'underline' }}
                        >
                          Descartar todas
                        </Text>
                      </HStack>
                    </CardWrapper.Body>
                  </CardWrapper>
                )}
              </VStack>
            </Collapsible.Content>
          </Collapsible.Root>
        </VStack>
      </Box>
    </Portal>
  );
}

/**
 * 🎯 WRAPPER QUE SE INCLUYE AUTOMÁTICAMENTE EN EL PROVIDER
 * Este componente se renderiza automáticamente cuando hay alertas
 */
export function AutoGlobalAlertsDisplay() {
  const { alerts, config } = useAlertsContext();
  
  // Solo renderizar si hay alertas activas
  const hasActiveAlerts = alerts.some(alert => alert.status === 'active');
  
  if (!hasActiveAlerts) {
    return null;
  }

  return (
    <GlobalAlertsDisplay
      maxVisible={config.maxVisibleAlerts}
      position={config.position}
      autoCollapse={config.autoCollapse}
      collapseAfter={config.collapseAfter}
      showOnlyActive={true}
      showConfiguration={false}
    />
  );
}