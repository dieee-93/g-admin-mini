/**
 * SmartAlertsBar - Barra de alertas inteligentes colapsable
 *
 * DISEÑO COPIADO DE: newdashboard/src/components/dashboard/SmartAlertsBar.tsx
 * ADAPTADO A: G-Admin Mini design system
 *
 * Barra collapsible que muestra alertas con:
 * - Vista colapsada: Resumen con contador y badges
 * - Vista expandida: Lista completa de alertas con acciones
 * - Severidades: critical, warning, info
 * - Botón dismiss por alerta
 * - Borde y sombra según criticidad
 * - Auto-oculta si no hay alertas
 *
 * @example
 * <SmartAlertsBar
 *   alerts={alerts}
 *   onDismiss={(id) => console.log('Dismiss', id)}
 * />
 */

import React, { useState } from 'react';
import { Box, Stack, Typography, Icon, Badge, Button, IconButton, Collapsible } from '@/shared/ui';
import {
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// ===============================
// TYPES
// ===============================

export interface Alert {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface SmartAlertsBarProps {
  /** Lista de alertas */
  alerts?: Alert[];

  /** Handler para dismiss de alerta */
  onDismiss?: (id: string) => void;
}

// ===============================
// HELPERS
// ===============================

const getSeverityColor = (severity: Alert['severity']): string => {
  switch (severity) {
    case 'critical':
      return 'red.500';
    case 'warning':
      return 'orange.500';
    default:
      return 'blue.500';
  }
};

const getSeverityColorPalette = (severity: Alert['severity']): string => {
  switch (severity) {
    case 'critical':
      return 'red';
    case 'warning':
      return 'orange';
    default:
      return 'blue';
  }
};

// ===============================
// COMPONENT
// ===============================

export const SmartAlertsBar: React.FC<SmartAlertsBarProps> = ({
  alerts = [],
  onDismiss
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-hide si no hay alertas
  if (alerts.length === 0) return null;

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const hasCritical = criticalCount > 0;

  return (
    <Box
      bg="bg.muted"
      borderRadius="2xl"
      overflow="hidden"
      mb={6}
      border="1px solid"
      borderColor={hasCritical ? 'red.500' : 'orange.500'}
      boxShadow={hasCritical ? 'lg' : 'md'}
    >
      <Collapsible.Root open={isExpanded} onOpenChange={(e) => setIsExpanded(e.open)}>
        {/* Collapsed View - Trigger */}
        <Collapsible.Trigger asChild>
          <Stack
            direction="row"
            p={4}
            align="center"
            justify="space-between"
            cursor="pointer"
            _hover={{
              bg: 'bg.subtle'
            }}
            transition="all 0.2s"
          >
            <Stack direction="row" gap={4} align="center">
              <Icon
                as={ExclamationTriangleIcon}
                color={hasCritical ? 'red.500' : 'orange.500'}
                boxSize={6}
              />
              <Box>
                <Typography variant="body" size="md" weight="bold">
                  {alerts.length} Alerta{alerts.length !== 1 ? 's' : ''} Activa
                  {alerts.length !== 1 ? 's' : ''}
                </Typography>
                <Stack direction="row" gap={3} mt={1}>
                  {criticalCount > 0 && (
                    <Badge colorPalette="red" size="xs">
                      {criticalCount} Crítica{criticalCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  {warningCount > 0 && (
                    <Badge colorPalette="orange" size="xs">
                      {warningCount} Advertencia{warningCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </Stack>
              </Box>
            </Stack>

            <Icon
              as={isExpanded ? ChevronUpIcon : ChevronDownIcon}
              color="fg.muted"
              boxSize={5}
            />
          </Stack>
        </Collapsible.Trigger>

        {/* Expanded View - Content */}
        <Collapsible.Content>
          <Box
            borderTop="1px solid"
            borderColor="border.default"
            bg="bg.canvas"
            p={4}
          >
            <Stack gap={3}>
              {alerts.map(alert => (
                <Stack
                  key={alert.id}
                  direction="row"
                  p={4}
                  bg="bg.muted"
                  borderRadius="lg"
                  borderLeft="3px solid"
                  borderColor={getSeverityColor(alert.severity)}
                  justify="space-between"
                  align="start"
                >
                  <Box flex={1}>
                    <Stack direction="row" align="center" mb={2}>
                      <Badge
                        colorPalette={getSeverityColorPalette(alert.severity)}
                        mr={3}
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Typography variant="body" weight="semibold">
                        {alert.title}
                      </Typography>
                    </Stack>

                    <Typography
                      variant="body"
                      size="sm"
                      color="fg.muted"
                      mb={3}
                    >
                      {alert.message}
                    </Typography>

                    {alert.action && (
                      <Button
                        size="sm"
                        colorPalette={getSeverityColorPalette(alert.severity)}
                        onClick={alert.action.onClick}
                      >
                        {alert.action.label}
                      </Button>
                    )}
                  </Box>

                  {onDismiss && (
                    <IconButton
                      aria-label="Dismiss alert"
                      size="sm"
                      variant="ghost"
                      color="fg.muted"
                      _hover={{
                        color: 'fg.default',
                        bg: 'bg.subtle'
                      }}
                      onClick={() => onDismiss(alert.id)}
                    >
                      <Icon as={XMarkIcon} boxSize={4} />
                    </IconButton>
                  )}
                </Stack>
              ))}
            </Stack>
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
};
