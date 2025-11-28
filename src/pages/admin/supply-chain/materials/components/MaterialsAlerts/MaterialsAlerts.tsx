import { useMemo, memo, useCallback } from 'react';
import { CollapsibleAlertStack, Stack, Button, type AlertItem } from '@/shared/ui';
import { useAlertsState, useAlertsActions } from '@/shared/alerts';

interface MaterialsAlertsProps {
  onAlertAction: (alertId: string, action: string) => Promise<void>;
  context: string;
}

// 🎯 PERFORMANCE: Extract AlertActions as a separate memoized component
// This prevents re-creating Button components on every alertItems calculation
const AlertActions = memo(function AlertActions({ 
  alertId, 
  actions, 
  onAlertAction, 
  onDismiss 
}: { 
  alertId: string; 
  actions?: Array<{ id: string; label: string }>; 
  onAlertAction: (alertId: string, actionId: string) => Promise<void>; 
  onDismiss: (id: string) => Promise<void>;
}) {
  // 🛠️ PERFORMANCE: Memoize callbacks to prevent Button re-renders
  const handleDismiss = useCallback(() => {
    onDismiss(alertId);
  }, [alertId, onDismiss]);

  return (
    <Stack direction="row" gap="xs" mt="sm">
      {actions?.map((action) => {
        // Each action button gets its own stable handler via closure
        return (
          <Button
            key={action.id}
            size="sm"
            variant="outline"
            onClick={() => onAlertAction(alertId, action.id)}
          >
            {action.label}
          </Button>
        );
      })}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDismiss}
      >
        Descartar
      </Button>
    </Stack>
  );
});

export const MaterialsAlerts = memo(function MaterialsAlerts({ onAlertAction, context }: MaterialsAlertsProps) {
  // 🛠️ PERFORMANCE OPTIMIZATION: Split state and actions consumption
  // Only re-render when alerts change, NOT when action functions change
  const { alerts } = useAlertsState();
MaterialsAlerts.displayName = 'MaterialsAlerts';
  const { dismiss } = useAlertsActions();

  // ✅ FIX: Alert generation moved to App-level (useGlobalAlertsInit)
  // No longer need to call useSmartInventoryAlerts here
  // This prevents alerts from only loading after entering the module

  // 🛠️ PERFORMANCE: Memoize filtered alerts to prevent re-creating on every render
  const materialsAlerts = useMemo(
    () => alerts.filter(alert => alert.context === context),
    [alerts, context]
  );

  // 🛠️ PERFORMANCE: Memoize alert items transformation
  // Now using AlertActions component instead of inline JSX
  const alertItems: AlertItem[] = useMemo(() => 
    materialsAlerts.map((alert) => ({
      status: alert.severity,
      title: alert.title,
      description: (
        <Stack direction="column" gap="xs">
          {alert.description}
          {/* 🎯 Use memoized component instead of inline Buttons */}
          <AlertActions
            alertId={alert.id}
            actions={alert.actions}
            onAlertAction={onAlertAction}
            onDismiss={dismiss}
          />
        </Stack>
      )
    })),
    [materialsAlerts, onAlertAction, dismiss]
  );

  if (materialsAlerts.length === 0) {
    return null;
  }

  return (
    <CollapsibleAlertStack
      alerts={alertItems}
      defaultOpen={materialsAlerts.some(a => a.severity === 'critical' || a.severity === 'high')}
      title="Alertas de Inventario"
      variant="subtle"
      size="md"
      showCount
    />
  );
});