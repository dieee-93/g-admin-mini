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

import { useState } from 'react';
import { Collapsible } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Stack, Badge, Alert, Button, Icon, Box } from '@/shared/ui';
import type { ReactNode } from 'react';

export interface AlertItem {
  status: 'info' | 'warning' | 'success' | 'error' | 'neutral';
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
} as const;

export function CollapsibleAlertStack({
  alerts,
  defaultOpen = false,
  title = 'Alertas del Sistema',
  showCount = true,
  maxVisibleWhenCollapsed = 0,
  variant = 'subtle',
  size = 'md'
}: CollapsibleAlertStackProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // If no alerts, don't render anything
  if (alerts.length === 0) {
    return null;
  }

  // Get most severe alert status for header color
  const getMostSevereStatus = (): AlertItem['status'] => {
    if (alerts.some(a => a.status === 'error')) return 'error';
    if (alerts.some(a => a.status === 'warning')) return 'warning';
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
      <Alert
        status={mostSevereStatus}
        variant={variant}
        size={size}
        width="full"
      >
        <Stack direction="row" justify="space-between" align="center" width="full" gap="md">
          <Stack direction="row" align="center" gap="sm" flex="1">
            <Alert.Title>{title}</Alert.Title>
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
      </Alert>

      {/* Collapsible Content - Alert Details */}
      <Collapsible.Root open={isOpen}>
        <Collapsible.Content>
          <Stack direction="column" gap="sm" mt="sm">
            {alerts.map((alert, index) => (
              <Alert
                key={index}
                status={alert.status}
                variant={variant}
                size={size}
                title={alert.title}
                description={alert.description}
                closable={alert.closable}
                onClose={alert.onClose}
                width="full"
              >
                {alert.children}
              </Alert>
            ))}
          </Stack>
        </Collapsible.Content>
      </Collapsible.Root>

      {/* Preview when collapsed (optional) */}
      {!isOpen && maxVisibleWhenCollapsed > 0 && (
        <Stack direction="column" gap="sm" mt="sm">
          {alerts.slice(0, maxVisibleWhenCollapsed).map((alert, index) => (
            <Alert
              key={index}
              status={alert.status}
              variant="outline"
              size="sm"
              title={alert.title}
              width="full"
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

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
