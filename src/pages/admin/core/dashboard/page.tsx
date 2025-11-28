/**
 * Dashboard Page - Executive Command Center with Tab Navigation
 *
 * REFACTORED v5.0 - TAB-BASED NAVIGATION:
 * ✅ Tab System inspired by newdashboard/Dashboard.tsx
 * ✅ 4 Tabs: Overview, Analytics, Operations, Activity
 * ✅ Hero: OperationalStatusWidget (always visible)
 * ✅ Alerts & Achievements Section (always visible)
 * ✅ Dynamic Widgets Grid via Hook Registry
 * ✅ WCAG 2.4.1 Level A compliant (Bypass Blocks)
 *
 * TAB STRUCTURE:
 * - Overview: QuickActions + KPIs + Charts preview + Insights
 * - Analytics: All charts (SalesTrend, Distribution, Revenue, Metrics)
 * - Operations: Module stats (Integrated modules, Active connections)
 * - Activity: Activity feed (Recent events timeline)
 *
 * Based on:
 * - newdashboard/src/components/dashboard/Dashboard.tsx
 * - Progressive Disclosure pattern (NN/G)
 * - Atomic Capabilities v2.0 (Dynamic Slot System)
 */

import React, { useState } from 'react';
import { ContentLayout, Section, SkipLink, Box, Stack, Typography, Tabs, Icon, SimpleGrid } from '@/shared/ui';
import { StatCard } from '@/shared/widgets/StatCard';
import { InsightCard } from '@/shared/widgets/InsightCard';
import { AlertsAchievementsSection } from './components/AlertsAchievementsSection';
import { OperationalStatusWidget } from './components/OperationalStatusWidget';
import { QuickActionsWidget } from './components/QuickActionsWidget';
import { ActivityFeedWidget } from './components/ActivityFeedWidget';
import { SalesTrendChart } from './components/charts/SalesTrendChart';
import { DistributionChart } from './components/charts/DistributionChart';
import { RevenueAreaChart } from './components/charts/RevenueAreaChart';
import { MetricsBarChart } from './components/charts/MetricsBarChart';
import {
  HomeIcon,
  ChartBarIcon,
  CogIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  CubeIcon,
  CheckCircleIcon,
  SignalIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';

// ===============================
// COMPONENT
// ===============================

const DashboardPage: React.FC = () => {
  // ===============================
  // STATE
  // ===============================
  const [activeTab, setActiveTab] = useState<number>(0);

  // ===============================
  // MOCK DATA (TODO: Connect to real data)
  // ===============================
  const operationalStatus = {
    isOpen: true,
    currentShift: 'Turno Tarde',
    activeStaff: 6,
    totalStaff: 9,
    openTime: '09:00',
    closeTime: '21:00',
    operatingHours: 4.5,
    alerts: 2,
  };

  // ===============================
  // RENDER
  // ===============================

  return (
    <>
      {/* ✅ SKIP LINK - First focusable element (WCAG 2.4.1 Level A) */}
      <SkipLink />

      {/* ✅ MAIN CONTENT - Semantic <main> with ARIA label */}
      <ContentLayout spacing="compact" mainLabel="Executive Dashboard">

        {/* ✅ HERO WIDGET - Operational Status (always visible) */}
        <Section
          variant="flat"
          semanticHeading="Operational Status Overview"
          live="polite"
          atomic
        >
          <OperationalStatusWidget
            isOpen={operationalStatus.isOpen}
            currentShift={operationalStatus.currentShift}
            activeStaff={operationalStatus.activeStaff}
            totalStaff={operationalStatus.totalStaff}
            openTime={operationalStatus.openTime}
            closeTime={operationalStatus.closeTime}
            operatingHours={operationalStatus.operatingHours}
            alerts={operationalStatus.alerts}
            onToggleStatus={() => logger.info('Dashboard', 'Toggle operational status')}
          />
        </Section>

        {/* ✅ ALERTS & ACHIEVEMENTS SECTION (always visible) */}
        <Section
          variant="flat"
          semanticHeading="Operational Alerts and Business Progress"
          live="polite"
          atomic
        >
          <AlertsAchievementsSection />
        </Section>

        {/* ✅ TABS NAVIGATION */}
        <Box mt={6}>
          <Tabs.Root value={activeTab.toString()} onValueChange={(details) => setActiveTab(Number(details.value))}>
            <Tabs.List>
              <Tabs.Trigger value="0">
                <Icon as={HomeIcon} mr={2} />
                Overview
              </Tabs.Trigger>
              <Tabs.Trigger value="1">
                <Icon as={ChartBarIcon} mr={2} />
                Analytics
              </Tabs.Trigger>
              <Tabs.Trigger value="2">
                <Icon as={CogIcon} mr={2} />
                Operaciones
              </Tabs.Trigger>
              <Tabs.Trigger value="3">
                <Icon as={ClockIcon} mr={2} />
                Actividad
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="0">
              {/* TAB 1: OVERVIEW */}
              <Stack direction="column" gap={6} pt={6}>
                {/* Quick Actions */}
                <Box>
                  <QuickActionsWidget />
                </Box>

                {/* KPI Cards */}
                <Box>
                  <Typography variant="body" size="sm" fontWeight="bold" color="text.muted" mb={4} textTransform="uppercase" letterSpacing="wider">
                    Métricas Principales
                  </Typography>
                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={6}>
                    <StatCard
                      title="Revenue Hoy"
                      value="$12,450"
                      icon={<Icon as={CurrencyDollarIcon} />}
                      trend={{ value: '+12.5%', isPositive: true }}
                      footer="vs ayer"
                    />
                    <StatCard
                      title="Ventas Hoy"
                      value="47"
                      icon={<Icon as={ShoppingCartIcon} />}
                      trend={{ value: '+8.2%', isPositive: true }}
                      footer="vs ayer"
                    />
                    <StatCard
                      title="Staff Activo"
                      value="6/9"
                      icon={<Icon as={UsersIcon} />}
                      footer="Performance"
                      footerValue="94%"
                    />
                    <StatCard
                      title="Órdenes Pendientes"
                      value="12"
                      icon={<Icon as={CubeIcon} />}
                      footer="En proceso"
                    />
                  </SimpleGrid>
                </Box>

                {/* Charts Preview */}
                <Box>
                  <Typography variant="body" size="sm" fontWeight="bold" color="text.muted" mb={4} textTransform="uppercase" letterSpacing="wider">
                    Tendencias
                  </Typography>
                  <SimpleGrid columns={{ base: 1, lg: 12 }} gap={6}>
                    <Box gridColumn={{ base: 'span 1', lg: 'span 8' }}>
                      <SalesTrendChart />
                    </Box>
                    <Box gridColumn={{ base: 'span 1', lg: 'span 4' }}>
                      <DistributionChart />
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Insights */}
                <Box>
                  <Stack direction="row" justify="space-between" align="center" mb={6}>
                    <Stack direction="row" align="center" gap={3}>
                      <Icon as={ArrowTrendingUpIcon} color="blue.400" />
                      <Typography variant="heading" size="lg" fontWeight="bold">
                        Insights Inteligentes
                      </Typography>
                    </Stack>
                  </Stack>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                    <InsightCard
                      title="Clientes Premium generan 68% del Revenue"
                      description="Los clientes con membresías activas tienen 3.2x mayor valor promedio"
                      metric="+$180K"
                      metricLabel="potencial anual"
                      tags={['CRM', 'Memberships', 'Sales']}
                      actionLabel="Ver Detalles"
                      positive
                    />
                    <InsightCard
                      title="Stock bajo en 3 materiales críticos"
                      description="Se necesita reabastecimiento urgente para mantener producción"
                      metric="15 días"
                      metricLabel="hasta desabastecimiento"
                      tags={['Inventory', 'Production']}
                      actionLabel="Ordenar Ahora"
                      positive={false}
                    />
                  </SimpleGrid>
                </Box>
              </Stack>
            </Tabs.Content>

            <Tabs.Content value="1">
              {/* TAB 2: ANALYTICS */}
              <Box pt={6}>
                <SimpleGrid columns={{ base: 1, lg: 12 }} gap="6">
                  {/* Sales Trend */}
                  <Box gridColumn={{ base: 'span 1', lg: 'span 8' }}>
                    <SalesTrendChart />
                  </Box>
                  {/* Distribution */}
                  <Box gridColumn={{ base: 'span 1', lg: 'span 4' }}>
                    <DistributionChart />
                  </Box>
                  {/* Revenue Area */}
                  <Box gridColumn={{ base: 'span 1', lg: 'span 7' }}>
                    <RevenueAreaChart />
                  </Box>
                  {/* Metrics Bar */}
                  <Box gridColumn={{ base: 'span 1', lg: 'span 5' }}>
                    <MetricsBarChart />
                  </Box>
                </SimpleGrid>
              </Box>
            </Tabs.Content>

            <Tabs.Content value="2">
              {/* TAB 3: OPERATIONS */}
              <Box pt={6}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
                  <StatCard
                    title="Módulos Integrados"
                    value="23"
                    subtitle="Sistema completo"
                    icon={<Icon as={CheckCircleIcon} />}
                  />
                  <StatCard
                    title="Conexiones Activas"
                    value="18"
                    subtitle="En tiempo real"
                    icon={<Icon as={SignalIcon} />}
                  />
                  <StatCard
                    title="Última Sincronización"
                    value="2 min ago"
                    subtitle="Todos los módulos"
                    icon={<Icon as={ClockIcon} />}
                  />
                </SimpleGrid>
              </Box>
            </Tabs.Content>

            <Tabs.Content value="3">
              {/* TAB 4: ACTIVITY */}
              <Box pt={6}>
                <ActivityFeedWidget />
              </Box>
            </Tabs.Content>
          </Tabs.Root>
        </Box>

      </ContentLayout>
    </>
  );
};

export default DashboardPage;
