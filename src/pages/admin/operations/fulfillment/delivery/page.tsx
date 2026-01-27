/**
 * Delivery Management Page - Live Tracking & Routing
 *
 * CONSOLIDATED VERSION - Using fulfillment-delivery module
 *
 * SEMANTIC v3.0 - WCAG AA Compliant:
 * ✅ Skip link for keyboard navigation (WCAG 2.4.1 Level A)
 * ✅ Semantic main content wrapper with ARIA label
 * ✅ Proper section headings for screen readers
 * ✅ Nav pattern for tab navigation
 * ✅ Aside pattern for metrics
 * ✅ 3-Layer Architecture (Semantic → Layout → Primitives)
 *
 * @version 2.0.0 - Consolidated from standalone delivery module
 */

import { ContentLayout, Section, Tabs, Alert, Stack, MetricCard, Spinner, SkipLink } from '@/shared/ui';
import { TruckIcon, ClockIcon, ChartBarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';
import { useDeliveryPage } from './hooks/useDeliveryPageEnhanced';
import { Suspense, lazy } from 'react';

// Lazy load tabs for performance
const LiveMapTab = lazy(() => import('./tabs/LiveMap/LiveMapTab'));
const DriversTab = lazy(() => import('./tabs/Drivers/DriversTab'));
const ZonesTab = lazy(() => import('./tabs/Zones/ZonesTab'));
const AnalyticsTab = lazy(() => import('./tabs/Analytics/AnalyticsTab'));

export default function DeliveryPage() {
  logger.debug('Delivery', 'DeliveryPage rendering');

  const {
    activeTab,
    setActiveTab,
    activeDeliveries,
    drivers,
    zones,
    metrics,
    loading,
    error,
    refreshZones
  } = useDeliveryPage();

  if (error) {
    return (
      <>
        <SkipLink />
        <ContentLayout spacing="normal" mainLabel="Delivery Management Error">
          <Section variant="elevated">
            <Alert status="error" title="Error al cargar Delivery">
              {error}
            </Alert>
          </Section>
        </ContentLayout>
      </>
    );
  }

  return (
    <>
      {/* ✅ SKIP LINK - First focusable element (WCAG 2.4.1 Level A) */}
      <SkipLink />

      {/* ✅ MAIN CONTENT - Semantic <main> with ARIA label */}
      <ContentLayout spacing="normal" mainLabel="Delivery Management and Tracking">

        {/* ✅ METRICS SECTION - Complementary aside pattern */}
        <Section
          as="aside"
          variant="flat"
          title="Delivery Management"
          semanticHeading="Delivery Metrics Overview"
        >
          <Stack direction="row" gap="md" flexWrap="wrap">
            <MetricCard
              title="Deliveries Activos"
              value={loading ? '-' : metrics.active_deliveries}
              icon={TruckIcon}
              colorPalette="blue"
            />
            <MetricCard
              title="Pendientes Asignación"
              value={loading ? '-' : metrics.pending_assignments}
              icon={ChartBarIcon}
              colorPalette="orange"
            />
            <MetricCard
              title="Tiempo Promedio"
              value={loading ? '-' : `${metrics.avg_delivery_time_minutes} min`}
              icon={ClockIcon}
              colorPalette="green"
            />
            <MetricCard
              title="On-Time Rate"
              value={loading ? '-' : `${metrics.on_time_rate_percentage}%`}
              icon={CheckCircleIcon}
              colorPalette="teal"
            />
          </Stack>
        </Section>

        {/* ✅ TAB NAVIGATION SECTION - Semantic nav pattern */}
        <Section
          as="nav"
          variant="elevated"
          semanticHeading="Delivery Management Sections"
        >
          <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value)}>
            <Tabs.List>
              <Tabs.Trigger value="live-map">
                Mapa en Vivo
              </Tabs.Trigger>
              <Tabs.Trigger value="drivers">
                Repartidores
              </Tabs.Trigger>
              <Tabs.Trigger value="zones">
                Zonas
              </Tabs.Trigger>
              <Tabs.Trigger value="analytics">
                Analytics
              </Tabs.Trigger>
            </Tabs.List>

            <Suspense fallback={<LoadingFallback />}>
              <Tabs.Content value="live-map">
                <LiveMapTab
                  deliveries={activeDeliveries}
                  zones={zones}
                  loading={loading}
                />
              </Tabs.Content>

              <Tabs.Content value="drivers">
                <DriversTab drivers={drivers} loading={loading} />
              </Tabs.Content>

              <Tabs.Content value="zones">
                <ZonesTab zones={zones} loading={loading} onRefresh={refreshZones} />
              </Tabs.Content>

              <Tabs.Content value="analytics">
                <AnalyticsTab metrics={metrics} loading={loading} />
              </Tabs.Content>
            </Suspense>
          </Tabs.Root>
        </Section>

      </ContentLayout>
    </>
  );
}

function LoadingFallback() {
  return (
    <Stack align="center" justify="center" minH="400px">
      <Spinner size="lg" />
    </Stack>
  );
}
