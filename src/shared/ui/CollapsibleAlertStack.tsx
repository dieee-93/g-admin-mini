/**
 * CollapsibleAlertStack Component
 *
 * Consolidates multiple alerts into a single collapsible component
 * to reduce vertical space usage while maintaining information accessibility.
 *
 * Features:
 * - Automatically collapses multiple alerts
 * - Shows count badge when collapsed
 * - Expandable with smooth transition
 * - Preserves all alert information
 * - Follows G-Admin v2.1 patterns
 *
 * @example
 * <CollapsibleAlertStack
 *   alerts={[
 *     { status: 'warning', title: 'Stock bajo', description: 'Material A' },
 *     { status: 'error', title: 'Stock crítico', description: 'Material B' }
 *   ]}
 *   defaultOpen={false}
 * />
 */

import { useState, memo, useMemo, useCallback } from 'react';
import { Collapsible, Alert as ChakraAlert } from '@chakra-ui/react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Stack, Badge, Button, Icon, Box } from '@/shared/ui';
import type { ReactNode } from 'react';

export interface AlertItem {
  status: 'info' | 'warning' | 'success' | 'error' | 'neutral' | 'medium';
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  closable?: boolean;
  onClose?: () => void;
}

export interface CollapsibleAlertStackProps {
  alerts: AlertItem[];
  defaultOpen?: boolean;
  title?: string;
  showCount?: boolean;
  maxVisibleWhenCollapsed?: number;
  variant?: 'subtle' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const statusColorMap = {
  success: 'green',
  warning: 'yellow',
  error: 'red',
  info: 'blue',
  neutral: 'gray',
  medium: 'orange', // Medium priority/severity
} as const;

// Helper to get icon for alert status (replaces broken ChakraAlert.Indicator)
const getAlertIcon = (status: AlertItem['status']) => {
  const iconMap = {
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    error: XCircleIcon,
    info: InformationCircleIcon,
    neutral: InformationCircleIcon,
    medium: ExclamationTriangleIcon, // Same as warning
  };
  return iconMap[status];
};

// Map custom statuses to Chakra's valid alert statuses
const getChakraStatus = (status: AlertItem['status']): 'info' | 'warning' | 'success' | 'error' => {
  if (status === 'medium') return 'warning';
  if (status === 'neutral') return 'info';
  return status as 'info' | 'warning' | 'success' | 'error';
};

// 🛠️ PERFORMANCE: Memoize component to prevent unnecessary re-renders
export const CollapsibleAlertStack = memo(function CollapsibleAlertStack({
  alerts,
  defaultOpen = false,
  title = 'Alertas del Sistema',
  showCount = true,
  maxVisibleWhenCollapsed = 0,
  variant = 'subtle',
  size = 'md'
}: CollapsibleAlertStackProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
CollapsibleAlertStack.displayName = 'CollapsibleAlertStack';

  // If no alerts, don't render anything
  if (alerts.length === 0) {
    return null;
  }

  // Get most severe alert status for header color
  const getMostSevereStatus = (): AlertItem['status'] => {
    if (alerts.some(a => a.status === 'error')) return 'error';
    if (alerts.some(a => a.status === 'warning')) return 'warning';
    if (alerts.some(a => a.status === 'medium')) return 'medium';
    if (alerts.some(a => a.status === 'success')) return 'success';
    if (alerts.some(a => a.status === 'info')) return 'info';
    return 'neutral';
  };

  const mostSevereStatus = getMostSevereStatus();
  const headerColorPalette = statusColorMap[mostSevereStatus];

  // Count alerts by severity
  const criticalCount = alerts.filter(a => a.status === 'error').length;
  const warningCount = alerts.filter(a => a.status === 'warning').length;

  return (
    <Box width="full">
      {/* Header - Always visible */}
      <ChakraAlert.Root
        status={getChakraStatus(mostSevereStatus)}
        variant={variant}
        size={size}
        width="full"
      >
        <Stack direction="row" justify="space-between" align="center" width="full" gap="md">
          <Stack direction="row" align="center" gap="sm" flex="1">
            <Icon icon={getAlertIcon(mostSevereStatus)} size="md" />
            <ChakraAlert.Title>{title}</ChakraAlert.Title>
            {showCount && (
              <Stack direction="row" gap="xs" align="center">
                {criticalCount > 0 && (
                  <Badge colorPalette="red" size="sm">
                    {criticalCount} críticas
                  </Badge>
                )}
                {warningCount > 0 && (
                  <Badge colorPalette="yellow" size="sm">
                    {warningCount} advertencias
                  </Badge>
                )}
                <Badge colorPalette={headerColorPalette} size="sm">
                  {alerts.length} total
                </Badge>
              </Stack>
            )}
          </Stack>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Colapsar alertas' : 'Expandir alertas'}
          >
            <Icon icon={isOpen ? ChevronUpIcon : ChevronDownIcon} size="sm" />
            {isOpen ? 'Ocultar' : 'Ver todas'}
          </Button>
        </Stack>
      </ChakraAlert.Root>

      {/* Collapsible Content - Alert Details */}
      <Collapsible.Root open={isOpen}>
        <Collapsible.Content>
          <Stack direction="column" gap="sm" mt="sm">
            {alerts.map((alert, index) => (
              <ChakraAlert.Root
                key={index}
                status={getChakraStatus(alert.status)}
                variant={variant}
                size={size}
                width="full"
              >
                <Icon icon={getAlertIcon(alert.status)} size="md" />
                {alert.description ? (
                  <ChakraAlert.Content>
                    <ChakraAlert.Title>{alert.title}</ChakraAlert.Title>
                    <ChakraAlert.Description>{alert.description}</ChakraAlert.Description>
                  </ChakraAlert.Content>
                ) : (
                  <ChakraAlert.Title flex="1">{alert.title}</ChakraAlert.Title>
                )}
              </ChakraAlert.Root>
            ))}
          </Stack>
        </Collapsible.Content>
      </Collapsible.Root>

      {/* Preview when collapsed (optional) */}
      {!isOpen && maxVisibleWhenCollapsed > 0 && (
        <Stack direction="column" gap="sm" mt="sm">
          {alerts.slice(0, maxVisibleWhenCollapsed).map((alert, index) => (
            <ChakraAlert.Root
              key={index}
              status={getChakraStatus(alert.status)}
              variant="outline"
              size="sm"
              width="full"
            >
              <Icon icon={getAlertIcon(alert.status)} size="sm" />
              <ChakraAlert.Title flex="1">{alert.title}</ChakraAlert.Title>
            </ChakraAlert.Root>
          ))}
        </Stack>
      )}
    </Box>
  );
}); // 🎯 End memo

/**
 * Quick variant for common use cases
 */
export function InventoryAlertStack({
  alerts,
  defaultOpen = false
}: Omit<CollapsibleAlertStackProps, 'title'>) {
  return (
    <CollapsibleAlertStack
      alerts={alerts}
      defaultOpen={defaultOpen}
      title="Alertas de Inventario"
      variant="subtle"
      size="md"
    />
  );
}

/**
 * Quick variant for system alerts
 */
export function SystemAlertStack({
  alerts,
  defaultOpen = false
}: Omit<CollapsibleAlertStackProps, 'title'>) {
  return (
    <CollapsibleAlertStack
      alerts={alerts}
      defaultOpen={defaultOpen}
      title="Alertas del Sistema"
      variant="subtle"
      size="md"
    />
  );
}

// Export variants
CollapsibleAlertStack.Inventory = InventoryAlertStack;
CollapsibleAlertStack.System = SystemAlertStack;
