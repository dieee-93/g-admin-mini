import { Stack, Alert, Button, Icon, Typography, Badge } from '@/shared/ui';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useSalesAlerts, useMetricsToAnalysisData } from '../hooks/useSalesAlerts';
import type { SalesPageMetrics } from '../hooks/useSalesPage';

interface SalesAlertsProps {
  onAlertAction?: (action: string, alertId: string) => void;
  context: string;
  metrics?: SalesPageMetrics;
}

// ✅ SISTEMA INTELIGENTE DE ALERTAS INTEGRADO
export function SalesAlerts({ onAlertAction, context, metrics }: SalesAlertsProps) {
  const {
    alerts,
    alertsSummary,
    recommendations,
    isGenerating,
    lastUpdate,
    error,
    refreshAlerts,
    dismissAlert,
    acknowledgeAlert
  } = useSalesAlerts();

  // Convertir métricas a formato de análisis si están disponibles
  const analysisData = metrics ? useMetricsToAnalysisData(metrics) : null;

  const handleAlertAction = (action: string, alertId: string) => {
    onAlertAction?.(action, alertId);
    acknowledgeAlert(alertId);
  };

  const handleDismissAlert = (alertId: string) => {
    dismissAlert(alertId);
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'urgent':
      case 'critical':
        return <Icon icon={ExclamationTriangleIcon} size="sm" />;
      case 'warning':
        return <Icon icon={ExclamationTriangleIcon} size="sm" />;
      case 'info':
        return <Icon icon={InformationCircleIcon} size="sm" />;
      default:
        return <Icon icon={InformationCircleIcon} size="sm" />;
    }
  };

  const getAlertStatus = (severity: string): 'error' | 'warning' | 'info' | 'success' => {
    switch (severity) {
      case 'urgent':
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  const formatTimeToAction = (timeToAction: string): string => {
    const timeMap = {
      immediate: 'Inmediato',
      within_1h: 'En 1 hora',
      within_24h: 'En 24 horas',
      within_week: 'Esta semana'
    };
    return timeMap[timeToAction as keyof typeof timeMap] || timeToAction;
  };

  if (error) {
    return (
      <Alert
        variant="subtle"
        status="error"
        title="Error en Sistema de Alertas"
        description={error}
        action={
          <Button variant="outline" size="sm" onClick={refreshAlerts}>
            <Icon icon={ArrowPathIcon} size="sm" />
            Reintentar
          </Button>
        }
      />
    );
  }

  if (alerts.length === 0 && !isGenerating) {
    return (
      <Alert
        variant="subtle"
        status="success"
        title="Sistema Operando Normalmente"
        description="No hay alertas críticas en este momento. Todas las métricas dentro de parámetros esperados."
        action={
          lastUpdate && (
            <Stack direction="row" align="center" gap="sm">
              <Icon icon={ClockIcon} size="sm" />
              <Typography variant="body" size="sm" color="text.muted">
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </Typography>
            </Stack>
          )
        }
      />
    );
  }

  return (
    <Stack direction="column" gap="md">
      {/* Summary Header */}
      {alertsSummary.total > 0 && (
        <Stack direction="row" align="center" gap="md" mb="sm">
          <Typography variant="heading" size="sm">
            Alertas Inteligentes ({alertsSummary.total})
          </Typography>
          {alertsSummary.critical > 0 && (
            <Badge variant="solid" colorPalette="red">
              {alertsSummary.critical} Críticas
            </Badge>
          )}
          {alertsSummary.warning > 0 && (
            <Badge variant="solid" colorPalette="orange">
              {alertsSummary.warning} Advertencias
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshAlerts}
            loading={isGenerating}
            loadingText="Analizando..."
          >
            <Icon icon={ArrowPathIcon} size="sm" />
            Actualizar
          </Button>
        </Stack>
      )}

      {/* Individual Alerts */}
      <Stack direction="column" gap="sm">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            variant="subtle"
            status={getAlertStatus(alert.severity)}
            title={alert.title}
            description={alert.description}
            icon={getAlertIcon(alert.severity)}
            action={
              <Stack direction="column" gap="sm" align="end">
                {/* Priority and Time Info */}
                <Stack direction="row" gap="sm" align="center">
                  <Badge
                    variant="outline"
                    colorPalette={alert.severity === 'critical' || alert.severity === 'urgent' ? 'red' : 'orange'}
                  >
                    Prioridad {alert.actionPriority}
                  </Badge>
                  <Badge variant="subtle" colorPalette="gray">
                    {formatTimeToAction(alert.timeToAction)}
                  </Badge>
                </Stack>

                {/* Action Buttons */}
                <Stack direction="row" gap="sm">
                  <Button
                    variant="solid"
                    size="sm"
                    colorPalette={alert.severity === 'critical' ? 'red' : 'blue'}
                    onClick={() => handleAlertAction('primary_action', alert.id)}
                  >
                    {alert.recommendedAction.split(':')[0]}
                  </Button>

                  {alert.affectedModules && alert.affectedModules.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAlertAction('cross_module', alert.id)}
                    >
                      Ver Módulos Afectados
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismissAlert(alert.id)}
                  >
                    <Icon icon={XMarkIcon} size="sm" />
                  </Button>
                </Stack>

                {/* Context Information */}
                {alert.deviation > 0 && (
                  <Typography variant="body" size="xs" color="text.muted">
                    Desviación: {alert.deviation}% | Impacto: {alert.estimatedImpact}
                  </Typography>
                )}
              </Stack>
            }
          />
        ))}
      </Stack>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Alert
          variant="subtle"
          status="info"
          title="Recomendaciones Consolidadas"
          description={
            <Stack direction="column" gap="xs" mt="sm">
              {recommendations.slice(0, 3).map((rec, index) => (
                <Typography key={index} variant="body" size="sm">
                  {rec}
                </Typography>
              ))}
              {recommendations.length > 3 && (
                <Typography variant="body" size="sm" color="text.muted">
                  +{recommendations.length - 3} recomendaciones adicionales
                </Typography>
              )}
            </Stack>
          }
        />
      )}
    </Stack>
  );
}