import React from 'react';
import { Box, Stack, Skeleton, CardWrapper } from '@/shared/ui';
import { COMPONENT_TOKENS, DASHBOARD_TOKENS } from '@/theme/tokens';

/**
 * Skeleton para MetricCard - usado mientras cargan las métricas del dashboard
 */
export const MetricCardSkeleton: React.FC = () => (
  <CardWrapper variant="outline" p={COMPONENT_TOKENS.MetricCard.padding}>
    <Stack gap={COMPONENT_TOKENS.Skeleton.gap}>
      {/* Icon area */}
      <Skeleton width="40px" height="40px" borderRadius="full" />
      
      {/* Value area */}
      <Stack gap={DASHBOARD_TOKENS.spacing.textGap}>
        <Skeleton height="8" />
        <Skeleton height="4" width="70%" />
        <Skeleton height="4" width="50%" />
      </Stack>
    </Stack>
  </CardWrapper>
);

/**
 * Skeleton para la grid de métricas ejecutivas
 */
export const MetricsGridSkeleton: React.FC = () => (
  <Stack gap={COMPONENT_TOKENS.ExecutiveOverview.sectionGap}>
    {/* Title skeleton */}
    <Stack gap={DASHBOARD_TOKENS.spacing.textGap}>
      <Skeleton height="8" width="300px" />
      <Skeleton height="4" width="200px" />
    </Stack>
    
    {/* Metrics grid skeleton */}
    <Box
      display="grid"
      gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
      gap={COMPONENT_TOKENS.ExecutiveOverview.cardGridGap}
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <MetricCardSkeleton key={index} />
      ))}
    </Box>
  </Stack>
);

/**
 * Skeleton para secciones de alertas y acciones
 */
export const DashboardSectionSkeleton: React.FC = () => (
  <CardWrapper variant="outline" p={DASHBOARD_TOKENS.spacing.cardPadding}>
    <Stack gap={DASHBOARD_TOKENS.spacing.metricGap}>
      {/* Section title */}
      <Skeleton height="6" width="40%" />
      
      {/* Content items */}
      {Array.from({ length: 3 }).map((_, index) => (
        <Stack key={index} direction="row" justify="space-between" align="center">
          <Stack gap={DASHBOARD_TOKENS.spacing.textGap} flex="1">
            <Skeleton height="4" />
            <Skeleton height="3" width="60%" />
          </Stack>
          <Skeleton width="20" height="8" />
        </Stack>
      ))}
    </Stack>
  </CardWrapper>
);

/**
 * Skeleton completo para la página ExecutiveOverview
 */
export const ExecutiveOverviewSkeleton: React.FC = () => (
  <Stack gap={COMPONENT_TOKENS.ExecutiveOverview.sectionGap} p={DASHBOARD_TOKENS.spacing.pageContainer}>
    <MetricsGridSkeleton />
    
    {/* Secondary sections grid */}
    <Box
      display="grid"
      gridTemplateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }}
      gap={COMPONENT_TOKENS.ExecutiveOverview.metricsGridGap}
    >
      <DashboardSectionSkeleton />
      <DashboardSectionSkeleton />
      <DashboardSectionSkeleton />
    </Box>
    
    {/* Action buttons grid */}
    <Box
      display="grid"
      gridTemplateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(6, 1fr)" }}
      gap={COMPONENT_TOKENS.ExecutiveOverview.buttonGridGap}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} height="28" borderRadius="lg" />
      ))}
    </Box>
  </Stack>
);