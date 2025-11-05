// SchedulingAlerts.tsx - Enterprise Intelligent Alerts Component
// Integra SchedulingIntelligenceEngine + Sistema Unificado de Alertas

import React, { useMemo } from 'react';
import {
  Section, Stack, Alert, Badge, Button, Icon
} from '@/shared/ui';

// ✅ HEROICONS
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// ✅ INTELLIGENT ALERTS SYSTEM
import { useSchedulingAlerts } from '../../hooks/useSchedulingAlerts';

interface SchedulingStats {
  total_shifts_this_week: number;
  employees_scheduled: number;
  coverage_percentage: number;
  pending_time_off: number;
  labor_cost_this_week: number;
  overtime_hours: number;
  understaffed_shifts: number;
  approved_requests: number;
}

interface SchedulingAlertsProps {
  context: 'scheduling' | 'dashboard' | 'realtime';
  schedulingStats?: SchedulingStats;
  onAlertAction?: (action: string, data?: unknown) => void;
  showTitle?: boolean;
  maxAlerts?: number;
  enablePredictive?: boolean;
}

export function SchedulingAlerts({
  context,
  schedulingStats,
  onAlertAction = () => {},
  showTitle = true,
  maxAlerts = 10,
  enablePredictive = true
}: SchedulingAlertsProps) {

  // ✅ ESTABILIZAR OPTIONS PARA EVITAR RE-RENDERS
  const alertsOptions = useMemo(() => ({
    context,
    maxAlerts,
    enablePredictive,
    autoRefresh: true,
    refreshInterval: context === 'realtime' ? 15000 : 30000
  }), [context, maxAlerts, enablePredictive]);

  // 🧠 INTELLIGENT ALERTS HOOK
  const {
    alerts,
    loading,
    error,
    criticalCount,
    warningCount,
    totalCount,
    hasUrgentAlerts,
    topPriorityAlert,
    businessImpactSummary,
    refreshAlerts,
    handleAlertAction,
    dismissAlert,
    togglePredictive
  } = useSchedulingAlerts(schedulingStats, alertsOptions);

  // ❌ ERROR STATE
  if (error) {
    return (
      <Section variant="elevated" title={showTitle ? "Alertas del Sistema" : undefined}>
        <Alert
          status="error"
          title="Error en Sistema de Alertas"
          description={error}
        >
          <Alert.Action>
            <Button
              size="sm"
              variant="solid"
              colorPalette="red"
              onClick={refreshAlerts}
            >
              Reintentar
            </Button>
          </Alert.Action>
        </Alert>
      </Section>
    );
  }

  // 📊 NO ALERTS STATE
  if (!loading && alerts.length === 0) {
    return context === 'dashboard' ? null : (
      <Section variant="flat" title={showTitle ? "Estado del Sistema" : undefined}>
        <Alert
          status="success"
          variant="subtle"
          title="✅ Sistema Operando Normalmente"
          description="No se han detectado problemas críticos en el módulo de horarios"
        />
      </Section>
    );
  }

  return (
    <Section
      variant="elevated"
      title={showTitle ? "Alertas Inteligentes" : undefined}
    >
      <Stack direction="column" gap="md">
        {/* 📊 HEADER CON MÉTRICAS Y CONTROLES */}
        <Stack direction="row" justify="space-between" align="center" flexWrap="wrap">
          {/* Badges de resumen */}
          <Stack direction="row" gap="sm" align="center" flexWrap="wrap">
            <Badge
              colorPalette={hasUrgentAlerts ? "red" : "blue"}
              size="sm"
              variant={hasUrgentAlerts ? "solid" : "subtle"}
            >
              <Icon
                icon={hasUrgentAlerts ? ExclamationTriangleIcon : InformationCircleIcon}
                size="xs"
              />
              {totalCount} alertas
            </Badge>

            {criticalCount > 0 && (
              <Badge colorPalette="red" size="sm" variant="solid">
                {criticalCount} críticas
              </Badge>
            )}

            {warningCount > 0 && (
              <Badge colorPalette="orange" size="sm">
                {warningCount} advertencias
              </Badge>
            )}

            {enablePredictive && (
              <Badge colorPalette="purple" size="sm" variant="outline">
                IA Predictiva
              </Badge>
            )}
          </Stack>

          {/* Controles */}
          <Stack direction="row" gap="sm">
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePredictive}
              colorPalette={enablePredictive ? "purple" : "gray"}
            >
              {enablePredictive ? "IA ON" : "IA OFF"}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={refreshAlerts}
              loading={loading}
            >
              Actualizar
            </Button>
          </Stack>
        </Stack>

        {/* 💼 BUSINESS IMPACT SUMMARY */}
        {businessImpactSummary && (
          <Alert
            variant="subtle"
            status={hasUrgentAlerts ? "warning" : "info"}
            title="Impacto en el Negocio"
            description={businessImpactSummary}
          />
        )}

        {/* 🚨 TOP PRIORITY ALERT */}
        {topPriorityAlert && context !== 'dashboard' && (
          <Alert
            variant="left-accent"
            status={topPriorityAlert.type === 'critical' ? 'error' : 'warning'}
            title={`🎯 Prioridad Alta: ${topPriorityAlert.title}`}
            description={topPriorityAlert.description}
          >
            {topPriorityAlert.actions && topPriorityAlert.actions.length > 0 && (
              <Alert.Action>
                <Button
                  size="sm"
                  variant="solid"
                  colorPalette={topPriorityAlert.type === 'critical' ? 'red' : 'orange'}
                  onClick={() => handleAlertAction(
                    topPriorityAlert.id,
                    topPriorityAlert.actions![0].id
                  )}
                >
                  {topPriorityAlert.actions[0].label}
                </Button>
              </Alert.Action>
            )}
          </Alert>
        )}

        {/* 📋 ALERTAS INDIVIDUALES */}
        <Stack direction="column" gap="sm">
          {alerts.map((alert) => (
            <Stack key={alert.id} direction="row" align="stretch" gap="sm">
              {/* Alerta principal */}
              <Alert
                variant="subtle"
                status={mapAlertTypeToStatus(alert.type)}
                title={alert.title}
                description={alert.description}
                flex="1"
              >
                {alert.actions && alert.actions.length > 0 && (
                  <Alert.Action>
                    <Button
                      size="sm"
                      variant="solid"
                      colorPalette={mapAlertTypeToStatus(alert.type) === 'error' ? 'red' : 'blue'}
                      onClick={() => {
                        handleAlertAction(alert.id, alert.actions![0].id);
                        onAlertAction(alert.actions![0].id, alert.metadata);
                      }}
                    >
                      {alert.actions[0].label}
                    </Button>
                  </Alert.Action>
                )}
              </Alert>

              {/* Botón de descarte */}
              <Button
                size="sm"
                variant="ghost"
                colorPalette="gray"
                onClick={() => dismissAlert(alert.id)}
                aria-label="Descartar alerta"
              >
                <Icon icon={XMarkIcon} size="sm" />
              </Button>
            </Stack>
          ))}
        </Stack>

        {/* 🔄 LOADING STATE */}
        {loading && (
          <Alert
            variant="subtle"
            status="info"
            title="Analizando datos..."
            description="El sistema inteligente está procesando la información más reciente"
          />
        )}

        {/* ℹ️ INFORMACIÓN DEL SISTEMA */}
        {context !== 'dashboard' && (
          <Alert
            variant="subtle"
            status="info"
            title="Sistema de Alertas Inteligentes v2.1"
            description={`
              Análisis automático cada ${context === 'realtime' ? '15' : '30'} segundos.
              ${enablePredictive ? 'Análisis predictivo activado.' : 'Modo básico activo.'}
              Confianza promedio: ${calculateAverageConfidence(alerts)}%
            `}
          />
        )}
      </Stack>
    </Section>
  );
}

// ✅ HELPER FUNCTIONS
function mapAlertTypeToStatus(alertType: string): 'error' | 'warning' | 'info' | 'success' {
  if (alertType === 'critical') return 'error';
  if (alertType === 'warning') return 'warning';
  return 'info';
}

function calculateAverageConfidence(alerts: unknown[]): number {
  if (alerts.length === 0) return 100;

  const totalConfidence = alerts.reduce((sum, alert) =>
    sum + (alert.metadata?.confidence || 90), 0
  );

  return Math.round(totalConfidence / alerts.length);
}

export default SchedulingAlerts;