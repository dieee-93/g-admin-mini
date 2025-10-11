import { useEffect } from 'react';
import { CollapsibleAlertStack, Stack, Button, type AlertItem } from '@/shared/ui';
import { useAlerts } from '@/shared/alerts';
import { useSmartInventoryAlerts } from '@/hooks/useSmartInventoryAlerts';

interface MaterialsAlertsProps {
  onAlertAction: (alertId: string, action: string) => Promise<void>;
  context: string;
}

export function MaterialsAlerts({ onAlertAction, context }: MaterialsAlertsProps) {
  // ✅ SISTEMA UNIFICADO (base)
  const { alerts, dismissAlert } = useAlerts();

  // ✅ ENGINE INTELIGENTE (específico)
  const { generateAndUpdateAlerts, intelligentAlerts } = useSmartInventoryAlerts();

  // ✅ SYNC INTELLIGENT ALERTS WITH UNIFIED SYSTEM
  useEffect(() => {
    generateAndUpdateAlerts();
  }, [generateAndUpdateAlerts]);

  const materialsAlerts = alerts.filter(alert => alert.context === context);

  if (materialsAlerts.length === 0) {
    return null;
  }

  // Transform alerts to CollapsibleAlertStack format
  const alertItems: AlertItem[] = materialsAlerts.map((alert) => ({
    status: alert.severity,
    title: alert.title,
    description: alert.message,
    children: (
      <Stack direction="row" gap="xs" mt="sm">
        {alert.actions?.map((action) => (
          <Button
            key={action.id}
            size="sm"
            variant="outline"
            onClick={() => onAlertAction(alert.id, action.id)}
          >
            {action.label}
          </Button>
        ))}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => dismissAlert(alert.id)}
        >
          Descartar
        </Button>
      </Stack>
    )
  }));

  return (
    <CollapsibleAlertStack
      alerts={alertItems}
      defaultOpen={materialsAlerts.some(a => a.severity === 'error')}
      title="Alertas de Inventario"
      variant="subtle"
      size="md"
      showCount
    />
  );
}