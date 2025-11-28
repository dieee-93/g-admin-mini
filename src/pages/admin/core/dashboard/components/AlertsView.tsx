/**
 * AlertsView - Vista de alertas operacionales del dashboard
 *
 * INTEGRADO CON SISTEMA UNIFICADO DE ALERTAS v2.0
 *
 * Features:
 * - ✅ Integración real con AlertsProvider (NO mock data)
 * - ✅ Priorización automática por severidad
 * - ✅ Filtrado de alertas para dashboard y global
 * - ✅ Links de acción directa a módulos
 * - ✅ Actualización reactiva cuando cambian las alertas
 *
 * Data sources (via AlertsProvider):
 * - Material alerts (stock bajo, vencimientos)
 * - Sales alerts (pagos pendientes, mesas esperando)
 * - Staff alerts (ausencias, conflictos de horarios)
 * - Operations alerts (órdenes atrasadas, equipos)
 * - Global system alerts
 *
 * Architecture:
 * - Uses useAlerts hook for reactive alert consumption
 * - Converts unified Alert format → CollapsibleAlertStack format
 * - Performance optimized with useMemo
 */

import React, { useMemo, useCallback, memo } from 'react';
import {
  Stack,
  Typography,
  Box,
  Button,
  Card,
  Heading
} from '@/shared/ui';
import { CollapsibleAlertStack } from '@/shared/ui/CollapsibleAlertStack';
import { useNavigationActions } from '@/contexts/NavigationContext';
import { useAlerts } from '@/shared/alerts/hooks/useAlerts';
import type { AlertItem } from '@/shared/ui/CollapsibleAlertStack';
import type { Alert, AlertSeverity } from '@/shared/alerts/types';
import { logger } from '@/lib/logging';

// ===============================
// INTERFACES
// ===============================

export interface AlertsViewProps {
  /** Opcional: forzar recargar alerts */
  refreshTrigger?: number;
}

// ===============================
// HELPERS
// ===============================

/**
 * Maps unified Alert severity to CollapsibleAlertStack status
 */
const severityToStatus = (severity: AlertSeverity): AlertItem['status'] => {
  const mapping: Record<AlertSeverity, AlertItem['status']> = {
    critical: 'error',
    high: 'error',
    medium: 'warning',
    low: 'warning',
    info: 'info'
  };
  return mapping[severity];
};

/**
 * Gets navigation target module from alert context
 */
const getNavigationModule = (context: string): string => {
  const mapping: Record<string, string> = {
    materials: 'materials',
    sales: 'sales',
    operations: 'fulfillment',
    customers: 'customers',
    staff: 'staff',
    fiscal: 'fiscal',
    dashboard: 'dashboard',
    global: 'dashboard'
  };
  return mapping[context] || 'dashboard';
};

// ===============================
// MEMOIZED ALERT BUTTON COMPONENT
// ===============================

/**
 * 🎯 PERFORMANCE: Memoized button component to prevent re-renders
 * Each alert button is memoized separately
 */
const AlertActionButton = memo(function AlertActionButton({
  context,
  alertId,
  onNavigate
}: {
  context: string;
  alertId: string;
  onNavigate: (moduleId: string, alertId: string) => void;
}) {
  // 🎯 PERFORMANCE: useCallback to stabilize handler
  const handleClick = useCallback(() => {
    const targetModule = getNavigationModule(context);
    onNavigate(targetModule, alertId);
  }, [context, alertId, onNavigate]);

  return (
    <Stack direction="row" gap="2" mt="2">
      <Button
        size="sm"
        variant="outline"
        onClick={handleClick}
      >
        Ver Detalles →
      </Button>
    </Stack>
  );
});

// ===============================
// COMPONENT
// ===============================

// 🎯 PERFORMANCE: Memoize entire component to prevent unnecessary re-renders
export const AlertsView = memo(function AlertsView({ refreshTrigger }: AlertsViewProps) {
  const { navigate } = useNavigationActions();

  // ✅ REAL DATA: Connect to unified alerts system
  // Filter for dashboard-relevant alerts (dashboard context + global context)
  const { alerts, count, loading } = useAlerts({
    context: ['dashboard', 'global'],
    status: ['active', 'acknowledged'], // Exclude resolved/dismissed
    autoFilter: true
  });

  // ===============================
  // HANDLERS
  // ===============================

  // 🎯 PERFORMANCE: Stable navigation handler with useCallback
  const handleAlertNavigation = useCallback((moduleId: string, alertId: string) => {
    logger.info('Dashboard', `Navigating to ${moduleId} from alert`, { alertId });
    navigate(moduleId);
  }, [navigate]); // ✅ navigate is stable from NavigationActions

  // 🎯 PERFORMANCE: Stable handlers for quick action buttons
  const handleNavigateToMaterials = useCallback(() => navigate('materials'), [navigate]);
  const handleNavigateToSales = useCallback(() => navigate('sales'), [navigate]);
  const handleNavigateToStaff = useCallback(() => navigate('staff'), [navigate]);

  // ===============================
  // DATA TRANSFORMATION
  // ===============================

  // 🎯 PERFORMANCE: Convert unified Alert[] → AlertItem[] for CollapsibleAlertStack
  // Uses memoized AlertActionButton component to prevent button re-creation
  const alertItems: AlertItem[] = useMemo(() => {
    return alerts.map((alert: Alert) => ({
      status: severityToStatus(alert.severity),
      title: alert.title,
      description: alert.description,
      children: (
        <AlertActionButton
          context={alert.context}
          alertId={alert.id}
          onNavigate={handleAlertNavigation}
        />
      )
    }));
  }, [alerts, handleAlertNavigation]); // ✅ handleAlertNavigation is stable via useCallback

  // ===============================
  // RENDER
  // ===============================

  if (loading) {
    return (
      <Card.Root size="sm">
        <Card.Body>
          <Typography variant="body" color="gray.600" textAlign="center">
            Cargando alertas...
          </Typography>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root variant="elevated" size="sm">
      <Card.Header pb="2">
        <Stack direction="row" justify="space-between" align="center">
          <Box>
            <Heading size="md" fontWeight="semibold" mb={0.5}>
              🔔 Alertas Operacionales
            </Heading>
            <Typography variant="body" fontSize="xs" color="gray.600">
              Información urgente y notificaciones del sistema
            </Typography>
          </Box>
        </Stack>
      </Card.Header>

      <Card.Body pt="2">
        <Stack gap="3">
          {/* Alerts - Más compactas */}
          {alertItems.length > 0 ? (
            <Box maxW="full">
              <CollapsibleAlertStack
                alerts={alertItems}
                defaultOpen={false}
                title="Alertas del Sistema"
                showCount={true}
                variant="subtle"
                size="sm"
              />
            </Box>
          ) : (
            <Box
              p="3"
              textAlign="center"
              bg="green.50"
              borderRadius="md"
              borderWidth="1px"
              borderColor="green.200"
            >
              <Typography variant="heading" fontSize="sm" color="green.700" mb="1">
                ✅ Todo en orden
              </Typography>
              <Typography variant="body" fontSize="xs" color="gray.600">
                No hay alertas críticas en este momento
              </Typography>
            </Box>
          )}

          {/* Quick Actions - Dentro del mismo card */}
          <Box pt="1" borderTop="1px solid" borderColor="gray.100"> {/* Reducido pt de 2 a 1 */}
            <Typography variant="body" fontSize="xs" fontWeight="semibold" mb="1" color="gray.600" textTransform="uppercase"> {/* Reducido mb de 2 a 1 */}
              Acciones Rápidas
            </Typography>
            <Stack direction="row" gap="2" flexWrap="wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={handleNavigateToMaterials}
                colorPalette="blue"
              >
                📦 Inventario
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleNavigateToSales}
                colorPalette="green"
              >
                💰 Ventas
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleNavigateToStaff}
                colorPalette="purple"
              >
                👥 Staff
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}); // End memo
