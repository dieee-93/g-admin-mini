/**
 * MEMBERSHIP ANALYTICS - Real Database Integration
 * All data comes directly from Supabase
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  ContentLayout, Section, CardGrid, MetricCard, Stack, Badge,
  Typography, Alert, Spinner
} from '@/shared/ui';
import { getMembershipMetrics } from '../services';
import { logger } from '@/lib/logging';
import type { MembershipMetrics } from '../types';
import { useAuth } from '@/contexts/AuthContext';

const MembershipAnalyticsEnhanced: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MembershipMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load metrics from database
        const metricsData = await getMembershipMetrics();
        setMetrics(metricsData);

        logger.info('MembershipAnalytics', 'Data loaded successfully', {
          metricsCount: metricsData.total_members
        });
      } catch (err) {
        logger.error('MembershipAnalytics', 'Error loading data', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (isLoading) {
    return (
      <ContentLayout spacing="normal">
        <Section variant="elevated">
          <Stack gap="4" align="center" justify="center" minH="400px">
            <Spinner size="lg" color="purple.500" />
            <Typography variant="body" size="md" color="text.secondary">
              Cargando analytics de membresías...
            </Typography>
          </Stack>
        </Section>
      </ContentLayout>
    );
  }

  if (error || !metrics) {
    return (
      <ContentLayout spacing="normal">
        <Section variant="elevated">
          <Alert status="error" title="Error al cargar datos">
            {error || 'No se pudieron cargar las métricas de membresías.'}
          </Alert>
        </Section>
      </ContentLayout>
    );
  }

  // Calculate retention rate
  const retentionRate = metrics.total_members > 0
    ? ((metrics.active_members / metrics.total_members) * 100).toFixed(1)
    : '0';

  // Calculate churn rate
  const churnRate = metrics.total_members > 0
    ? ((metrics.cancelled_members / metrics.total_members) * 100).toFixed(1)
    : '0';

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <ContentLayout spacing="normal">
      {/* Overview Metrics */}
      <Section
        title="Resumen General"
        variant="elevated"
        semanticHeading="Membership Overview Metrics"
      >
        <CardGrid columns={{ base: 1, md: 2, lg: 4 }}>
          <MetricCard
            title="Miembros Totales"
            value={metrics.total_members.toString()}
            colorPalette="blue"
            subtitle="Total de membresías registradas"
          />
          <MetricCard
            title="Miembros Activos"
            value={metrics.active_members.toString()}
            colorPalette="green"
            subtitle={`Tasa de retención: ${retentionRate}%`}
          />
          <MetricCard
            title="MRR"
            value={formatCurrency(metrics.mrr)}
            colorPalette="purple"
            subtitle="Monthly Recurring Revenue"
          />
          <MetricCard
            title="ARR"
            value={formatCurrency(metrics.arr)}
            colorPalette="orange"
            subtitle="Annual Recurring Revenue"
          />
        </CardGrid>
      </Section>

      {/* Member Status */}
      <Section
        title="Estado de Membresías"
        variant="elevated"
        semanticHeading="Membership Status Breakdown"
      >
        <CardGrid columns={{ base: 1, md: 2, lg: 4 }}>
          <MetricCard
            title="Vencidas"
            value={metrics.expired_members.toString()}
            colorPalette="red"
            subtitle="Membresías expiradas"
          />
          <MetricCard
            title="Suspendidas"
            value={metrics.suspended_members.toString()}
            colorPalette="yellow"
            subtitle="Temporalmente suspendidas"
          />
          <MetricCard
            title="Canceladas"
            value={metrics.cancelled_members.toString()}
            colorPalette="gray"
            subtitle={`Tasa de churn: ${churnRate}%`}
          />
          <MetricCard
            title="Por Vencer"
            value={metrics.expiring_soon.toString()}
            colorPalette="orange"
            subtitle="Próximos 30 días"
          />
        </CardGrid>
      </Section>

      {/* Engagement Metrics */}
      <Section
        title="Métricas de Engagement"
        variant="elevated"
        semanticHeading="Membership Engagement Metrics"
      >
        <CardGrid columns={{ base: 1, md: 3 }}>
          <MetricCard
            title="Check-ins Hoy"
            value={metrics.check_ins_today.toString()}
            colorPalette="green"
            subtitle="Visitas registradas hoy"
          />
          <MetricCard
            title="Visitas Promedio/Mes"
            value={metrics.avg_monthly_visits.toFixed(1)}
            colorPalette="blue"
            subtitle="Por membresía activa"
          />
          <MetricCard
            title="Tasa de Utilización"
            value={`${((metrics.check_ins_today / (metrics.active_members || 1)) * 100).toFixed(1)}%`}
            colorPalette="purple"
            subtitle="Check-ins vs miembros activos"
          />
        </CardGrid>
      </Section>

      {/* Distribution by Tier */}
      <Section
        title="Distribución por Tier"
        variant="elevated"
        semanticHeading="Membership Tier Distribution"
      >
        <Stack gap="4">
          {metrics.members_by_tier.map((tier) => (
            <Stack
              key={tier.tier_name}
              direction="row"
              justify="space-between"
              align="center"
              p="4"
              bg="bg.subtle"
              borderRadius="md"
              border="1px solid"
              borderColor="border.default"
            >
              <Stack gap="1">
                <Typography variant="body" size="md" weight="semibold">
                  {tier.tier_name}
                  <Badge ml="2" colorPalette="blue">
                    Nivel {tier.tier_level}
                  </Badge>
                </Typography>
                <Typography variant="body" size="sm" color="text.secondary">
                  {tier.count} miembros • {formatCurrency(tier.revenue)} MRR
                </Typography>
              </Stack>
              <Stack align="end" gap="1">
                <Typography variant="body" size="lg" weight="bold" color="purple.600">
                  {tier.count}
                </Typography>
                <Typography variant="body" size="xs" color="text.secondary">
                  {metrics.total_members > 0
                    ? ((tier.count / metrics.total_members) * 100).toFixed(1)
                    : '0'}%
                </Typography>
              </Stack>
            </Stack>
          ))}

          {metrics.members_by_tier.length === 0 && (
            <Alert status="info" title="Sin datos">
              No hay miembros registrados aún. Crea la primera membresía para ver estadísticas.
            </Alert>
          )}
        </Stack>
      </Section>

      {/* Revenue Breakdown */}
      <Section
        title="Desglose de Ingresos"
        variant="elevated"
        semanticHeading="Revenue Breakdown"
      >
        <CardGrid columns={{ base: 1, md: 3 }}>
          <MetricCard
            title="Ingreso Mensual"
            value={formatCurrency(metrics.mrr)}
            colorPalette="green"
            subtitle="MRR total"
          />
          <MetricCard
            title="Ingreso Trimestral"
            value={formatCurrency(metrics.mrr * 3)}
            colorPalette="blue"
            subtitle="Proyección 3 meses"
          />
          <MetricCard
            title="Ingreso Anual"
            value={formatCurrency(metrics.arr)}
            colorPalette="purple"
            subtitle="ARR total"
          />
        </CardGrid>
      </Section>

      {/* Action Items */}
      {metrics.expiring_soon > 0 && (
        <Section variant="elevated">
          <Alert status="warning" title="Acción Requerida">
            Hay {metrics.expiring_soon} membresías que vencen en los próximos 30 días.
            Contacta a estos miembros para renovación.
          </Alert>
        </Section>
      )}

      {metrics.active_members === 0 && (
        <Section variant="elevated">
          <Alert status="info" title="Sistema Listo">
            El sistema de membresías está configurado y listo para usar.
            Crea tu primera membresía para comenzar a ver analytics en tiempo real.
          </Alert>
        </Section>
      )}
    </ContentLayout>
  );
};

export default MembershipAnalyticsEnhanced;
