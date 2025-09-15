// Dashboard Moderno 2025 - Diseño basado en mejores prácticas
// ✅ Jerarquía visual + Sin duplicación + Responsive + Operacional + Design System

import React, { useEffect } from 'react';
import { 
  ContentLayout, PageHeader, Section, StatsSection, CardGrid, MetricCard,
  Stack, Typography, Badge, Icon
} from '@/shared/ui';

// Componentes modernos - migraremos estos también
import {
  SummaryPanel
} from '@/shared/components/widgets';
import { ActionButton } from '@/shared/ui';
import { useDashboard } from './hooks';
import { useNavigation } from '@/contexts/NavigationContext';
import { 
  HomeIcon,
  ChartBarIcon,
  BellIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

import { MilestoneTracker, EvolutionRoutesWidget } from './components/widgets';

export function Dashboard() {
  const {
    heroMetric,
    secondaryMetrics,
    summaryMetrics,
    summaryStatus,
    operationalActions,
    onConfigure
  } = useDashboard();

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
    <ContentLayout spacing="loose">
      <PageHeader 
        title="Dashboard"
        subtitle="Centro de comando · G-Admin"
        icon={HomeIcon}
      />

      <MilestoneTracker />

      <EvolutionRoutesWidget />

      <StatsSection>
        <CardGrid 
          columns={{ 
            base: 1, 
            md: 2,
            lg: 4 
          }} 
        >
          {/* Hero Metric convertido a MetricCard normal */}
          <MetricCard 
            title={heroMetric.title}
            value={heroMetric.value}
            subtitle={heroMetric.subtitle}
            icon={heroMetric.icon}
            colorPalette={heroMetric.colorPalette}
          />

          {/* Secondary Metrics */}
          {secondaryMetrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </CardGrid>
      </StatsSection>

      <Section variant="elevated" title="Resumen Operacional" icon={ChartBarIcon}>
        <SummaryPanel
          metrics={summaryMetrics}
          status={summaryStatus}
          onConfigure={onConfigure}
          defaultExpanded={true}
        />
      </Section>

      <Section variant="default" title="Acciones Rápidas" icon={BoltIcon}>
        <CardGrid 
          columns={{ 
            base: 2, 
            md: 3, 
            lg: 5 
          }} 
         
        >
          {operationalActions.map((action) => {
            // Mapear colorPalette a valores válidos del design system
            const mappedColorPalette = (() => {
              switch (action.colorPalette) {
                case 'blue': return 'blue';
                case 'green': return 'green';
                case 'purple': return 'purple';
                case 'red': return 'red';
                case 'orange': return 'orange';
                default: return 'gray';
              }
            })();

            return (
              <ActionButton
                key={action.id}
                title={action.title}
                description={action.description}
                icon={action.icon}
                colorPalette={mappedColorPalette}
                onClick={action.onClick}
              />
            );
          })}
        </CardGrid>
      </Section>

      <CardGrid 
        columns={{ 
          base: 1, 
          md: 2, 
          lg: 3 
        }} 
   
      >
        {/* Tendencias Hoy */}
        <Section variant="elevated" title="Tendencias Hoy" icon={ChartBarIcon}>
          <Stack gap="sm">
            <Stack direction="row" justify="space-between" align="center" py="2">
              <Typography variant="body" size="md" color="text.primary">Ventas</Typography>
              <Badge colorPalette="green" variant="subtle">+12%</Badge>
            </Stack>
            <Stack direction="row" justify="space-between" align="center" py="2">
              <Typography variant="body" size="md" color="text.primary">Inventario</Typography>
              <Badge colorPalette="blue" variant="subtle">Estable</Badge>
            </Stack>
            <Stack direction="row" justify="space-between" align="center" py="2">
              <Typography variant="body" size="md" color="text.primary">Personal</Typography>
              <Badge colorPalette="orange" variant="subtle">85%</Badge>
            </Stack>
          </Stack>
        </Section>

        {/* Notificaciones */}
        <Section variant="elevated" title="Notificaciones" icon={BellIcon}>
          <Stack gap="sm">
            <Stack direction="row" align="center" gap="sm" py="2">
              <Badge colorPalette="orange" size="sm" dot>Stock bajo</Badge>
              <Typography variant="body" size="sm" color="text.muted">3 productos</Typography>
            </Stack>
            <Stack direction="row" align="center" gap="sm" py="2">
              <Badge colorPalette="green" size="sm" dot>Turno</Badge>
              <Typography variant="body" size="sm" color="text.muted">Completo</Typography>
            </Stack>
            <Stack direction="row" align="center" gap="sm" py="2">
              <Badge colorPalette="blue" size="sm" dot>Pedidos</Badge>
              <Typography variant="body" size="sm" color="text.muted">2 pendientes</Typography>
            </Stack>
          </Stack>
        </Section>

        {/* Rendimiento */}
        <Section variant="elevated" title="Rendimiento" icon={BoltIcon}>
          <Stack gap="sm">
            <Stack direction="row" justify="space-between" align="center" py="2">
              <Typography variant="body" size="md" color="text.primary">Sistema</Typography>
              <Badge colorPalette="green" variant="subtle">Óptimo</Badge>
            </Stack>
            <Stack direction="row" justify="space-between" align="center" py="2">
              <Typography variant="body" size="md" color="text.primary">Carga</Typography>
              <Badge colorPalette="blue" variant="subtle">Normal</Badge>
            </Stack>
            <Stack direction="row" justify="space-between" align="center" py="2">
              <Typography variant="body" size="md" color="text.primary">Respuesta</Typography>
              <Badge colorPalette="green" variant="subtle">&lt; 100ms</Badge>
            </Stack>
          </Stack>
        </Section>
      </CardGrid>
    </ContentLayout>  
  );
}