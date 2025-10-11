/**
 * AlertsView - Vista de alertas operacionales del dashboard
 *
 * Wrapper del CollapsibleAlertStack existente.
 * Vista por defecto del HeaderSwitch en el Dashboard Evolutivo.
 *
 * Features:
 * - Integración con sistemas de alertas existentes
 * - Priorización por severidad
 * - Agrupación inteligente
 * - Links de acción directa
 *
 * Data sources:
 * - Material alerts (stock bajo, vencimientos)
 * - Sales alerts (pagos pendientes, mesas esperando)
 * - Staff alerts (ausencias, conflictos de horarios)
 * - Operations alerts (órdenes atrasadas, equipos)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Section,
  Stack,
  Typography,
  Box,
  Button,
  Card,
  Heading
} from '@/shared/ui';
import { CollapsibleAlertStack } from '@/shared/ui/CollapsibleAlertStack';
import type { AlertItem } from '@/shared/ui/CollapsibleAlertStack';
import { logger } from '@/lib/logging';

// ===============================
// INTERFACES
// ===============================

export interface AlertsViewProps {
  /** Opcional: forzar recargar alerts */
  refreshTrigger?: number;
}

// ===============================
// COMPONENT
// ===============================

export const AlertsView: React.FC<AlertsViewProps> = ({ refreshTrigger }) => {
  const navigate = useNavigate();

  // Estado local
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ===============================
  // DATA FETCHING
  // ===============================

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setIsLoading(true);

        // TODO: Implementar fetching real desde stores/servicios
        // Por ahora, datos mock para demostración

        const mockAlerts: AlertItem[] = [
          {
            status: 'warning',
            title: 'Stock Bajo',
            description: 'Harina (2kg restantes)',
            children: (
              <Stack direction="row" gap={2} mt={2}>
                <button
                  onClick={() => navigate('/admin/materials')}
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.875rem',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e0',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Ver Inventario →
                </button>
              </Stack>
            )
          },
          {
            status: 'info',
            title: 'Sin Alertas Críticas',
            description: 'Todas las operaciones funcionan normalmente'
          }
        ];

        setAlerts(mockAlerts);

        logger.info('Dashboard', 'Alerts loaded', { count: mockAlerts.length });

      } catch (error) {
        logger.error('Dashboard', 'Error loading alerts', error);
        setAlerts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAlerts();
  }, [refreshTrigger, navigate]);

  // ===============================
  // RENDER
  // ===============================

  if (isLoading) {
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
      <Card.Header pb={2}>
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

      <Card.Body pt={2}>
        <Stack gap={3}>
          {/* Alerts - Más compactas */}
          {alerts.length > 0 ? (
            <Box maxW="full">
              <CollapsibleAlertStack
                alerts={alerts}
                defaultOpen={false}
                title="Alertas del Sistema"
                showCount={true}
                variant="subtle"
                size="sm"
              />
            </Box>
          ) : (
            <Box
              p={3}
              textAlign="center"
              bg="green.50"
              borderRadius="md"
              borderWidth="1px"
              borderColor="green.200"
            >
              <Typography variant="heading" fontSize="sm" color="green.700" mb={1}>
                ✅ Todo en orden
              </Typography>
              <Typography variant="body" fontSize="xs" color="gray.600">
                No hay alertas críticas en este momento
              </Typography>
            </Box>
          )}

          {/* Quick Actions - Dentro del mismo card */}
          <Box pt={2} borderTop="1px solid" borderColor="gray.100">
            <Typography variant="body" fontSize="xs" fontWeight="semibold" mb={2} color="gray.600" textTransform="uppercase">
              Acciones Rápidas
            </Typography>
            <Stack direction="row" gap={2} flexWrap="wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/admin/materials')}
                colorPalette="blue"
              >
                📦 Inventario
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/admin/sales')}
                colorPalette="green"
              >
                💰 Ventas
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/admin/staff')}
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
};
