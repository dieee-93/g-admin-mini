import { useEffect } from 'react';
import { Section, Alert, Stack, Button, Badge } from '@/shared/ui';
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

  return (
    <Section variant="elevated" title="Alertas y Notificaciones">
      <Stack direction="column" gap="sm">
        {materialsAlerts.map((alert) => (
          <Alert
            key={alert.id}
            variant="subtle"
            status={alert.severity}
            title={alert.title}
            description={alert.message}
            actions={
              <Stack direction="row" gap="xs">
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
            }
          />
        ))}
      </Stack>
    </Section>
  );
}