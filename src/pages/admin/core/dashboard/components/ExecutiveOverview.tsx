/**
 * ExecutiveOverview - Layout ejecutivo limpio y profesional
 */

import React from 'react';
import {
  ContentLayout, CardGrid, Box, Card, CardBody, SimpleGrid, Stack, Typography, Icon, Badge, Button,
  CardWrapper, Section, MetricCard
} from '@/shared/ui';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ChartBarIcon,
  BoltIcon,
  TrophyIcon,
  CreditCardIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';

interface ExecutiveMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  module: string;
  action?: () => void;
}

export const ExecutiveOverview: React.FC = () => {
  // Datos ejecutivos REALES de múltiples módulos
  const executiveMetrics: ExecutiveMetric[] = [
    {
      title: 'Revenue Total',
      value: '$2.8M',
      change: '+23.5%',
      trend: 'up',
      icon: CurrencyDollarIcon,
      module: 'Finance',
      action: () => ModuleEventUtils.executive.dashboardViewed('finance-overview')
    },
    {
      title: 'Clientes Activos',
      value: '1,247',
      change: '+12.3%',
      trend: 'up',
      icon: UserGroupIcon,
      module: 'CRM',
      action: () => ModuleEventUtils.executive.dashboardViewed('customers-overview')
    },
    {
      title: 'Eficiencia Operacional',
      value: '94.2%',
      change: '+8.7%',
      trend: 'up',
      icon: ChartBarIcon,
      module: 'Operations'
    },
    {
      title: 'Transacciones/Día',
      value: '847',
      change: '+15.9%',
      trend: 'up',
      icon: BoltIcon,
      module: 'Sales'
    },
    {
      title: 'ROI Activos',
      value: '28.4%',
      change: '+5.2%',
      trend: 'up',
      icon: ArrowTrendingUpIcon,
      module: 'Assets'
    },
    {
      title: 'Score Gamificación',
      value: '8,450',
      change: '+890',
      trend: 'up',
      icon: TrophyIcon,
      module: 'Gamification'
    },
    {
      title: 'Pagos Digitales',
      value: '87.3%',
      change: '+12.1%',
      trend: 'up',
      icon: CreditCardIcon,
      module: 'Integrations'
    },
    {
      title: 'Membresías Activas',
      value: '342',
      change: '+18.7%',
      trend: 'up',
      icon: BuildingOfficeIcon,
      module: 'Memberships'
    }
  ];

  const criticalAlerts = [
    {
      id: 1,
      module: 'Inventory',
      message: '15 productos en stock crítico',
      severity: 'high' as const,
      action: 'Ver Inventario'
    },
    {
      id: 2,
      module: 'Billing',
      message: '3 facturas vencidas requieren atención',
      severity: 'medium' as const,
      action: 'Gestionar Facturas'
    },
    {
      id: 3,
      module: 'Staff',
      message: 'Evaluación trimestral pendiente (12 empleados)',
      severity: 'low' as const,
      action: 'Ver Staff'
    }
  ];

  const moduleActivity = [
    { module: 'Sales', activity: '+23 transacciones', time: 'hace 2 min', color: 'green' },
    { module: 'MercadoPago', activity: 'Webhook procesado', time: 'hace 5 min', color: 'blue' },
    { module: 'Assets', activity: 'Mantenimiento completado', time: 'hace 15 min', color: 'purple' },
    { module: 'Executive BI', activity: 'Reporte generado', time: 'hace 28 min', color: 'orange' },
    { module: 'Gamification', activity: 'Nuevo logro desbloqueado', time: 'hace 45 min', color: 'yellow' }
  ];

  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="Vista Ejecutiva - G-Admin Enterprise">
        <Stack gap={8}>

          {/* Métricas Principales - Spacing optimizado */}
          <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={8}>
            {executiveMetrics.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
                icon={metric.icon}
                onClick={metric.action}
                colorPalette="blue"
                badge={{
                  value: metric.module,
                  colorPalette: 'gray',
                  variant: 'subtle'
                }}
              />
            ))}
          </CardGrid>

          {/* Resumen de Rendimiento - Layout mejorado */}
          <SimpleGrid columns={{ base: 1, lg: 3 }} gap={10}>

            {/* Alertas Críticas */}
            <Box>
              <Section variant="elevated" title="Alertas Críticas">
                <Stack gap={4}>
                  {criticalAlerts.map((alert) => (
                    <CardWrapper
                      key={alert.id}
                      variant="elevated"
                      colorPalette={
                        alert.severity === 'high' ? 'red' :
                        alert.severity === 'medium' ? 'yellow' : 'blue'
                      }
                    >
                      <CardWrapper.Body>
                        <Stack direction="row" justify="space-between" align="start" gap={4}>
                          <Stack gap={2}>
                            <Typography variant="body" size="sm" weight="semibold">
                              {alert.module}
                            </Typography>
                            <Typography variant="body" size="sm" color="gray.600" lineHeight="1.4">
                              {alert.message}
                            </Typography>
                          </Stack>
                          <Button size="sm" variant="outline" colorPalette="blue">
                            {alert.action}
                          </Button>
                        </Stack>
                      </CardWrapper.Body>
                    </CardWrapper>
                  ))}
                </Stack>
              </Section>
            </Box>

            {/* Actividad en Tiempo Real */}
            <Box gridColumn={{ lg: "span 2" }}>
              <Section variant="elevated" title="Actividad del Sistema">
                <Stack gap={4}>
                  {moduleActivity.map((activity, index) => (
                    <CardWrapper key={index} variant="subtle" colorPalette="gray">
                      <CardWrapper.Body>
                        <Stack direction="row" justify="space-between" align="center">
                          <Stack direction="row" align="center" gap={3}>
                            <Box
                              w={3}
                              h={3}
                              borderRadius="full"
                              bg={`${activity.color}.500`}
                            />
                            <Stack gap={1}>
                              <Typography variant="body" size="sm" weight="medium">
                                {activity.module}
                              </Typography>
                              <Typography variant="body" size="xs" color="gray.600">
                                {activity.activity}
                              </Typography>
                            </Stack>
                          </Stack>
                          <Typography variant="body" size="xs" color="gray.500">
                            {activity.time}
                          </Typography>
                        </Stack>
                      </CardWrapper.Body>
                    </CardWrapper>
                  ))}

                  <Button variant="outline" size="sm" mt={4}>
                    Ver Toda la Actividad
                  </Button>
                </Stack>
              </Section>
            </Box>
          </SimpleGrid>

          {/* Quick Actions Ejecutivas */}
          <Section variant="flat" title="Acciones Ejecutivas">
            <CardGrid columns={{ base: 2, sm: 3, md: 6 }} gap={6}>
              {[
                { label: 'Executive BI', icon: ChartBarIcon, path: '/admin/executive', color: 'purple' },
                { label: 'Finanzas', icon: CurrencyDollarIcon, path: '/admin/finance/billing', color: 'green' },
                { label: 'Reportes', icon: ChartBarIcon, path: '/admin/tools/reporting', color: 'blue' },
                { label: 'Activos', icon: BuildingOfficeIcon, path: '/admin/operations/assets', color: 'gray' },
                { label: 'Gamificación', icon: TrophyIcon, path: '/admin/gamification', color: 'yellow' },
                { label: 'Integraciones', icon: CreditCardIcon, path: '/admin/finance/integrations', color: 'teal' }
              ].map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  h={28}
                  flexDirection="column"
                  gap={4}
                  p={6}
                  borderRadius="xl"
                  onClick={() => window.location.href = action.path}
                >
                  <Icon icon={action.icon} size="lg" />
                  <Typography variant="body" size="xs" textAlign="center" lineHeight="1.2">
                    {action.label}
                  </Typography>
                </Button>
              ))}
            </CardGrid>
          </Section>

        </Stack>
      </Section>
    </ContentLayout>
  );
};

export default ExecutiveOverview;