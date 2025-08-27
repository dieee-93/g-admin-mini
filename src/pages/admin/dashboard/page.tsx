// Dashboard Moderno 2025 - Diseño basado en mejores prácticas
// ✅ Jerarquía visual + Sin duplicación + Responsive + Operacional + Design System

import React, { useEffect } from 'react';
import { 
  Stack, 
  Typography, 
  Grid, 
  MetricCard,
  CardWrapper,
  Badge,
  Icon,
} from '@/shared/ui';

// Componentes modernos - migraremos estos también
import {
  HeroMetricCard,
  SummaryPanel,
  QuickActionCard
} from '@/shared/components/widgets';
import { useModernDashboard } from './hooks';
import { useNavigation } from '@/contexts/NavigationContext';
import { 
  HomeIcon,
  ChartBarIcon,
  BellIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

export function Dashboard() {
  const {
    heroMetric,
    secondaryMetrics,
    summaryMetrics,
    summaryStatus,
    operationalActions,
    onConfigure
  } = useModernDashboard();

  const { setQuickActions } = useNavigation();

  useEffect(() => {
    setQuickActions([
      {
        id: 'refresh-dashboard',
        label: 'Actualizar Dashboard',
        icon: BoltIcon,
        action: () => console.log('Refresh dashboard'),
        color: 'blue'
      }
    ]);
  }, [setQuickActions]);

  return (
    <CardWrapper>
        <Stack gap="xl" align="stretch">
          
          {/* Header elegante con design system */}
          <Stack direction="row" justify="space-between" align="end">
            <Stack gap="xs">
              <Stack direction="row" align="center" gap="sm">
                <Icon icon={HomeIcon} size="lg"  />
                <Typography variant="heading" size="2xl" weight="bold" >
                  Dashboard
                </Typography>
              </Stack>
              <Typography variant="body" color="secondary" size="md">
                Centro de comando · G-Admin
              </Typography>
            </Stack>
          </Stack>

          {/* MÉTRICAS EN FORMATO HORIZONTAL COMPACTO */}
          <Grid 
            templateColumns={{ 
              base: "1fr", 
              md: "1.5fr 1fr 1fr", 
              lg: "2fr 1fr 1fr 1fr" 
            }} 
            gap="md"
          >
            {/* Hero Metric - Más compacto */}
            <CardWrapper>
              <HeroMetricCard {...heroMetric} />
            </CardWrapper>

            {/* Secondary Metrics - Horizontales */}
            {secondaryMetrics.map((metric) => (
              <MetricCard key={metric.title} {...metric} />
            ))}
          </Grid>

          {/* RESUMEN OPERACIONAL - Expandido por defecto y más compacto */}
          <SummaryPanel
            title="Resumen Operacional"
            metrics={summaryMetrics}
            status={summaryStatus}
            onConfigure={onConfigure}
            defaultExpanded={true}
          />

          {/* ACCIONES RÁPIDAS - Con design system */}
          <Stack gap="sm" align="start">
            <Stack direction="row" align="center" gap="sm">
              <Icon icon={BoltIcon} size="md"  />
              <Typography variant="body" weight="semibold" color="primary">
                Acciones Rápidas
              </Typography>
            </Stack>
            
            <Grid 
              templateColumns={{ 
                base: "repeat(3, 1fr)", 
                md: "repeat(5, 1fr)", 
                lg: "repeat(5, 1fr)" 
              }} 
              gap="sm"
            >
              {operationalActions.map((action) => {
                // Mapear colorPalette a valores válidos del design system
                const mappedColorPalette = (() => {
                  switch (action.colorPalette) {
                    case 'blue': return 'info';
                    case 'green': return 'success';
                    case 'purple': return 'brand';
                    case 'red': return 'error';
                    case 'orange': return 'warning';
                    default: return 'gray';
                  }
                })();

                return (
                  <QuickActionCard
                    key={action.id}
                    title={action.title}
                    description={action.description}
                    icon={action.icon}
                    colorPalette={mappedColorPalette}
                    onClick={action.onClick}
                  />
                );
              })}
            </Grid>
          </Stack>

          {/* SECCIÓN ADICIONAL - Actividad y Rendimiento con design system */}
          <Grid 
            templateColumns={{ 
              base: "1fr", 
              md: "1fr 1fr", 
              lg: "1fr 1fr 1fr" 
            }} 
            gap="md"
          >
            {/* Actividad Reciente */}
            <CardWrapper>
              <Stack gap="sm" align="start">
                <Stack direction="row" align="center" gap="sm">
                  <Icon icon={ChartBarIcon} size="md"  />
                  <Typography variant="body" weight="semibold" color="primary">
                    Tendencias Hoy
                  </Typography>
                </Stack>
                <Stack gap="xs" align="stretch" width="full">
                  <Stack direction="row" justify="space-between">
                    <Typography variant="body" size="sm" color="secondary">Ventas</Typography>
                    <Badge colorPalette="success">+12%</Badge>
                  </Stack>
                  <Stack direction="row" justify="space-between">
                    <Typography variant="body" size="sm" color="secondary">Inventario</Typography>
                    <Badge colorPalette="info">Estable</Badge>
                  </Stack>
                  <Stack direction="row" justify="space-between">
                    <Typography variant="body" size="sm" color="secondary">Personal</Typography>
                    <Badge colorPalette="warning">85%</Badge>
                  </Stack>
                </Stack>
              </Stack>
            </CardWrapper>

            {/* Alertas */}
            <CardWrapper>
              <Stack gap="sm" align="start">
                <Stack direction="row" align="center" gap="sm">
                  <Icon icon={BellIcon} size="md"  />
                  <Typography variant="body" weight="semibold" color="primary">
                    Notificaciones
                  </Typography>
                </Stack>
                <Stack gap="xs" align="stretch" width="full">
                  <Stack direction="row" align="center" gap="sm">
                    <Badge colorPalette="warning" size="sm">●</Badge>
                    <Typography variant="body" size="sm" color="secondary">Stock bajo: 3 productos</Typography>
                  </Stack>
                  <Stack direction="row" align="center" gap="sm">
                    <Badge colorPalette="success" size="sm">●</Badge>
                    <Typography variant="body" size="sm" color="secondary">Turno completo</Typography>
                  </Stack>
                  <Stack direction="row" align="center" gap="sm">
                    <Badge colorPalette="info" size="sm">●</Badge>
                    <Typography variant="body" size="sm" color="secondary">2 pedidos pendientes</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </CardWrapper>

            {/* Performance */}
            <CardWrapper>
              <Stack gap="sm" align="start">
                <Stack direction="row" align="center" gap="sm">
                  <Icon icon={BoltIcon} size="md"  />
                  <Typography variant="body" weight="semibold" color="primary">
                    Rendimiento
                  </Typography>
                </Stack>
                <Stack gap="xs" align="stretch" width="full">
                  <Stack direction="row" justify="space-between">
                    <Typography variant="body" size="sm" color="secondary">Sistema</Typography>
                    <Badge colorPalette="success">Óptimo</Badge>
                  </Stack>
                  <Stack direction="row" justify="space-between">
                    <Typography variant="body" size="sm" color="secondary">Carga</Typography>
                    <Badge colorPalette="info">Normal</Badge>
                  </Stack>
                  <Stack direction="row" justify="space-between">
                    <Typography variant="body" size="sm" color="secondary">Respuesta</Typography>
                    <Badge colorPalette="success">&lt; 100ms</Badge>
                  </Stack>
                </Stack>
              </Stack>
            </CardWrapper>
          </Grid>
        </Stack>
    </CardWrapper>  
  );
}