import React from 'react';
import {
  ContentLayout, Section, CardGrid, MetricCard, Stack, Badge,
  Typography, Alert
} from '@/shared/ui';

const RecurringBillingAnalyticsEnhanced: React.FC = () => {
  // Mock data - en implementación real vendría del AnalyticsEngine
  const mockData = {
    subscriptions: {
      total: 247,
      active: 198,
      suspended: 23,
      cancelled: 26,
      trial: 15
    },
    revenue: {
      monthly: 89450,
      quarterly: 268350,
      annual: 1073400,
      growth: 12.5
    },
    churn: {
      rate: 8.2,
      voluntaryChurn: 5.1,
      involuntaryChurn: 3.1,
      trend: -1.2
    },
    ltv: {
      average: 2847,
      median: 1950,
      top10Percent: 8950,
      cohortImprovement: 15.3
    },
    billingHealth: {
      successfulCharges: 94.2,
      failedCharges: 5.8,
      retrySuccessRate: 67.3,
      averageCollectionTime: 2.1
    }
  };

  const subscriptionMatrix = React.useMemo(() => {
    const { revenue, churn } = mockData;

    return [
      {
        title: "Champions 🏆",
        description: "Alto valor, baja rotación",
        count: 42,
        avgRevenue: 2850,
        churnRate: 2.1,
        color: "green",
        priority: "Retener y expandir",
        strategies: ["Upselling premium", "Programas fidelidad", "Referencias"]
      },
      {
        title: "Estables 💎",
        description: "Valor medio, baja rotación",
        count: 89,
        avgRevenue: 1200,
        churnRate: 4.5,
        color: "blue",
        priority: "Maximizar valor",
        strategies: ["Cross-selling", "Optimización uso", "Engagement"]
      },
      {
        title: "En Riesgo ⚠️",
        description: "Alto valor, alta rotación",
        count: 18,
        avgRevenue: 2100,
        churnRate: 15.2,
        color: "orange",
        priority: "Intervención urgente",
        strategies: ["Customer success", "Descuentos específicos", "Soporte personalizado"]
      },
      {
        title: "Transitioning 📈",
        description: "Valor medio, rotación media",
        count: 67,
        avgRevenue: 850,
        churnRate: 8.9,
        color: "yellow",
        priority: "Desarrollar potencial",
        strategies: ["Educación producto", "Migración a planes superiores", "Automatización"]
      }
    ];
  }, [mockData]);

  const revenueInsights = React.useMemo(() => {
    const { revenue, subscriptions, churn, ltv } = mockData;

    return [
      {
        type: "success",
        title: "Crecimiento Saludable",
        description: `Ingresos recurrentes creciendo ${revenue.growth}% mensual con ${subscriptions.active} suscripciones activas`,
        priority: "high",
        actionable: true
      },
      {
        type: "warning",
        title: "Optimización de Churn",
        description: `Tasa de abandono del ${churn.rate}% supera objetivo del 7%. Churn involuntario del ${churn.involuntaryChurn}% es optimizable`,
        priority: "high",
        actionable: true
      },
      {
        type: "info",
        title: "LTV en Mejora",
        description: `Valor de vida promedio de $${ltv.average.toLocaleString()} con mejora del ${ltv.cohortImprovement}% vs cohortes anteriores`,
        priority: "medium",
        actionable: false
      },
      {
        type: "success",
        title: "Eficiencia de Cobranza",
        description: `${mockData.billingHealth.successfulCharges}% de cargos exitosos con tiempo promedio de cobro de ${mockData.billingHealth.averageCollectionTime} días`,
        priority: "medium",
        actionable: false
      }
    ];
  }, [mockData]);

  const cohortAnalysis = React.useMemo(() => {
    return [
      {
        cohort: "Q1 2024",
        initialSize: 89,
        retention30: 91.0,
        retention60: 84.3,
        retention90: 78.9,
        avgLTV: 2650,
        status: "mature"
      },
      {
        cohort: "Q2 2024",
        initialSize: 95,
        retention30: 93.7,
        retention60: 87.4,
        retention90: 81.1,
        avgLTV: 2890,
        status: "growing"
      },
      {
        cohort: "Q3 2024",
        initialSize: 78,
        retention30: 89.7,
        retention60: 83.3,
        retention90: 76.9,
        avgLTV: 2340,
        status: "concerning"
      },
      {
        cohort: "Q4 2024",
        initialSize: 63,
        retention30: 95.2,
        retention60: 88.9,
        retention90: null,
        avgLTV: 1950,
        status: "early"
      }
    ];
  }, []);

  return (
    <ContentLayout spacing="normal">
      <Stack gap="lg">

        {/* Revenue Overview */}
        <Section title="Métricas Principales de Suscripciones" variant="elevated">
          <CardGrid columns={{ base: 2, md: 5 }} gap="md">
            <MetricCard
              title="Ingresos Mensuales"
              value={`$${mockData.revenue.monthly.toLocaleString()}`}
              change={mockData.revenue.growth}
              icon="CurrencyDollarIcon"
            />
            <MetricCard
              title="MRR Anualizado"
              value={`$${mockData.revenue.annual.toLocaleString()}`}
              change={mockData.revenue.growth}
              icon="TrendingUpIcon"
            />
            <MetricCard
              title="Suscripciones Activas"
              value={mockData.subscriptions.active.toString()}
              change={8.3}
              icon="UserGroupIcon"
            />
            <MetricCard
              title="Tasa de Churn"
              value={`${mockData.churn.rate}%`}
              change={mockData.churn.trend}
              icon="ArrowPathIcon"
            />
            <MetricCard
              title="LTV Promedio"
              value={`$${mockData.ltv.average.toLocaleString()}`}
              change={mockData.ltv.cohortImprovement}
              icon="ChartBarIcon"
            />
          </CardGrid>
        </Section>

        {/* Subscription Matrix Analysis */}
        <Section title="Matriz de Suscripciones" variant="elevated">
          <Typography variant="body" color="muted" mb="md">
            Segmentación de suscripciones por valor y retención para estrategias dirigidas
          </Typography>

          <CardGrid columns={{ base: 1, md: 2 }} gap="lg">
            {subscriptionMatrix.map((segment) => (
              <Section key={segment.title} variant="flat" title={segment.title}>
                <Stack gap="md">
                  <Stack gap="sm">
                    <Typography variant="body">{segment.description}</Typography>
                    <Stack direction="row" gap="sm" align="center">
                      <Badge colorPalette={segment.color} variant="subtle">
                        {segment.count} suscripciones
                      </Badge>
                      <Badge variant="outline">
                        ${segment.avgRevenue.toLocaleString()} promedio
                      </Badge>
                      <Badge colorPalette={segment.churnRate > 10 ? 'red' : segment.churnRate > 5 ? 'yellow' : 'green'} variant="subtle">
                        {segment.churnRate}% churn
                      </Badge>
                    </Stack>
                  </Stack>

                  <Stack gap="xs">
                    <Typography variant="caption" fontWeight="semibold" color={`${segment.color}.600`}>
                      Prioridad: {segment.priority}
                    </Typography>
                    <Typography variant="caption" color="muted">
                      Estrategias: {segment.strategies.join(", ")}
                    </Typography>
                  </Stack>
                </Stack>
              </Section>
            ))}
          </CardGrid>
        </Section>

        {/* Billing Health Dashboard */}
        <Section title="Salud del Sistema de Facturación" variant="elevated">
          <CardGrid columns={{ base: 1, md: 4 }} gap="md">
            <MetricCard
              title="Cargos Exitosos"
              value={`${mockData.billingHealth.successfulCharges}%`}
              change={2.1}
              icon="CheckCircleIcon"
            />
            <MetricCard
              title="Cargos Fallidos"
              value={`${mockData.billingHealth.failedCharges}%`}
              change={-0.8}
              icon="ExclamationCircleIcon"
            />
            <MetricCard
              title="Éxito en Reintentos"
              value={`${mockData.billingHealth.retrySuccessRate}%`}
              change={5.2}
              icon="ArrowPathIcon"
            />
            <MetricCard
              title="Tiempo de Cobro"
              value={`${mockData.billingHealth.averageCollectionTime} días`}
              change={-0.3}
              icon="ClockIcon"
            />
          </CardGrid>

          <Alert status="info" size="sm">
            <strong>Optimización sugerida:</strong> El {mockData.billingHealth.failedCharges}% de cargos fallidos puede reducirse
            implementando validación de tarjetas pre-cargo y notificaciones automáticas de vencimiento.
          </Alert>
        </Section>

        {/* Cohort Retention Analysis */}
        <Section title="Análisis de Retención por Cohortes" variant="elevated">
          <Typography variant="body" color="muted" mb="md">
            Seguimiento de retención de suscriptores por período de inicio
          </Typography>

          <Stack gap="md">
            {cohortAnalysis.map((cohort) => (
              <Section key={cohort.cohort} variant="flat">
                <Stack direction={{ base: 'column', md: 'row' }} justify="between" align="start" gap="md">
                  <Stack gap="sm">
                    <Stack direction="row" align="center" gap="sm">
                      <Typography variant="h6">{cohort.cohort}</Typography>
                      <Badge
                        colorPalette={
                          cohort.status === 'growing' ? 'green' :
                          cohort.status === 'concerning' ? 'red' :
                          cohort.status === 'early' ? 'blue' : 'gray'
                        }
                        variant="subtle"
                      >
                        {cohort.status}
                      </Badge>
                    </Stack>
                    <Typography variant="body" color="muted">
                      {cohort.initialSize} suscriptores iniciales • LTV promedio ${cohort.avgLTV.toLocaleString()}
                    </Typography>
                  </Stack>

                  <Stack direction="row" gap="lg">
                    <Stack align="center" gap="xs">
                      <Typography variant="caption" color="muted">30 días</Typography>
                      <Badge colorPalette={cohort.retention30 > 90 ? 'green' : cohort.retention30 > 85 ? 'yellow' : 'red'} variant="subtle">
                        {cohort.retention30}%
                      </Badge>
                    </Stack>
                    <Stack align="center" gap="xs">
                      <Typography variant="caption" color="muted">60 días</Typography>
                      <Badge colorPalette={cohort.retention60 > 85 ? 'green' : cohort.retention60 > 80 ? 'yellow' : 'red'} variant="subtle">
                        {cohort.retention60}%
                      </Badge>
                    </Stack>
                    <Stack align="center" gap="xs">
                      <Typography variant="caption" color="muted">90 días</Typography>
                      <Badge colorPalette={cohort.retention90 && cohort.retention90 > 80 ? 'green' : cohort.retention90 && cohort.retention90 > 75 ? 'yellow' : 'red'} variant="subtle">
                        {cohort.retention90 ? `${cohort.retention90}%` : 'Pendiente'}
                      </Badge>
                    </Stack>
                  </Stack>
                </Stack>
              </Section>
            ))}
          </Stack>
        </Section>

        {/* Revenue Insights */}
        <Section title="Insights y Recomendaciones" variant="elevated">
          <Stack gap="md">
            {revenueInsights.map((insight, index) => (
              <Alert key={index} status={insight.type} size="md">
                <Stack gap="sm">
                  <Typography variant="h6">{insight.title}</Typography>
                  <Typography variant="body">{insight.description}</Typography>
                  {insight.actionable && (
                    <Badge colorPalette="blue" variant="subtle" size="sm">
                      Acción requerida - Prioridad {insight.priority}
                    </Badge>
                  )}
                </Stack>
              </Alert>
            ))}
          </Stack>
        </Section>

        {/* Subscription Status Overview */}
        <Section title="Estado de Suscripciones" variant="elevated">
          <CardGrid columns={{ base: 2, md: 5 }} gap="md">
            <MetricCard
              title="Total Suscripciones"
              value={mockData.subscriptions.total.toString()}
              change={6.2}
              icon="DocumentTextIcon"
            />
            <MetricCard
              title="Activas"
              value={mockData.subscriptions.active.toString()}
              change={8.3}
              icon="CheckCircleIcon"
            />
            <MetricCard
              title="Suspendidas"
              value={mockData.subscriptions.suspended.toString()}
              change={-2.1}
              icon="PauseIcon"
            />
            <MetricCard
              title="Canceladas"
              value={mockData.subscriptions.cancelled.toString()}
              change={-4.5}
              icon="XCircleIcon"
            />
            <MetricCard
              title="En Prueba"
              value={mockData.subscriptions.trial.toString()}
              change={15.7}
              icon="BeakerIcon"
            />
          </CardGrid>
        </Section>

      </Stack>
    </ContentLayout>
  );
};

export default RecurringBillingAnalyticsEnhanced;