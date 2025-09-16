import React from 'react';
import {
  ContentLayout, Section, CardGrid, MetricCard, Stack, Badge,
  Typography, Alert
} from '@/shared/ui';

const MembershipAnalyticsEnhanced: React.FC = () => {
  // Mock data - en implementación real vendría del AnalyticsEngine
  const mockData = {
    members: {
      total: 1847,
      active: 1623,
      expired: 156,
      suspended: 45,
      trial: 23
    },
    revenue: {
      monthly: 147850,
      quarterly: 443550,
      annual: 1774200,
      growth: 8.7
    },
    retention: {
      rate: 87.3,
      averageLifespan: 14.8,
      churnRate: 12.7,
      renewalRate: 78.9
    },
    engagement: {
      averageVisitsPerMonth: 12.4,
      peakHours: '18:00-20:00',
      mostUsedFacilities: ['gym', 'pool', 'classes'],
      avgSessionDuration: 87 // minutes
    },
    demographics: {
      avgAge: 34.2,
      genderSplit: { male: 52, female: 48 },
      corporateMembers: 23,
      familyMembers: 167
    }
  };

  const membershipMatrix = React.useMemo(() => {
    return [
      {
        title: "Champions 🏆",
        description: "Alta frecuencia, alta retención",
        count: 342,
        avgMonthlyVisits: 18.5,
        retentionRate: 94.2,
        avgLTV: 4850,
        color: "green",
        priority: "Programas VIP",
        strategies: ["Beneficios exclusivos", "Referidos premium", "Eventos especiales"]
      },
      {
        title: "Regulares 💪",
        description: "Uso constante, lealtad media",
        count: 756,
        avgMonthlyVisits: 12.8,
        retentionRate: 84.1,
        avgLTV: 2940,
        color: "blue",
        priority: "Engagement programs",
        strategies: ["Challenges mensuales", "Personal training", "Clases grupales"]
      },
      {
        title: "Ocasionales ⚠️",
        description: "Uso esporádico, riesgo medio",
        count: 289,
        avgMonthlyVisits: 6.2,
        retentionRate: 71.5,
        avgLTV: 1680,
        color: "orange",
        priority: "Re-engagement",
        strategies: ["Check-ins personales", "Planes flexibles", "Incentivos uso"]
      },
      {
        title: "En Riesgo 🚨",
        description: "Baja actividad, alta probabilidad churn",
        count: 134,
        avgMonthlyVisits: 2.1,
        retentionRate: 45.8,
        avgLTV: 890,
        color: "red",
        priority: "Retención urgente",
        strategies: ["Contacto directo", "Descuentos especiales", "Planes de recuperación"]
      }
    ];
  }, []);

  const facilityUsage = React.useMemo(() => {
    return [
      {
        facility: "Gimnasio Principal",
        usage: 89.2,
        peakHours: "18:00-20:00",
        avgDuration: 95,
        satisfaction: 4.6,
        waitTime: 3.2
      },
      {
        facility: "Piscina",
        usage: 67.8,
        peakHours: "19:00-21:00",
        avgDuration: 45,
        satisfaction: 4.8,
        waitTime: 1.5
      },
      {
        facility: "Clases Grupales",
        usage: 78.5,
        peakHours: "09:00-10:00, 19:00-20:00",
        avgDuration: 60,
        satisfaction: 4.7,
        waitTime: 0
      },
      {
        facility: "Spa & Wellness",
        usage: 34.6,
        peakHours: "16:00-18:00",
        avgDuration: 120,
        satisfaction: 4.9,
        waitTime: 12.5
      },
      {
        facility: "Canchas Deportivas",
        usage: 45.9,
        peakHours: "20:00-22:00",
        avgDuration: 90,
        satisfaction: 4.4,
        waitTime: 8.7
      }
    ];
  }, []);

  const membershipInsights = React.useMemo(() => {
    return [
      {
        type: "success",
        title: "Crecimiento Sostenido",
        description: `${mockData.members.active} miembros activos con crecimiento del ${mockData.revenue.growth}% mensual`,
        priority: "high",
        actionable: false
      },
      {
        type: "warning",
        title: "Optimización de Retención",
        description: `Tasa de churn del ${mockData.retention.churnRate}% superior al objetivo del 10%. ${membershipMatrix[3].count} miembros en riesgo crítico`,
        priority: "high",
        actionable: true
      },
      {
        type: "info",
        title: "Saturación en Horas Pico",
        description: `Gimnasio principal al ${facilityUsage[0].usage}% de capacidad en horas pico (${facilityUsage[0].peakHours})`,
        priority: "medium",
        actionable: true
      },
      {
        type: "success",
        title: "Alta Satisfacción General",
        description: `Promedio de ${facilityUsage.reduce((acc, f) => acc + f.satisfaction, 0) / facilityUsage.length}⭐ en satisfacción de instalaciones`,
        priority: "medium",
        actionable: false
      },
      {
        type: "warning",
        title: "Subutilización Spa",
        description: `Spa & Wellness solo ${facilityUsage[3].usage}% de uso con tiempo de espera de ${facilityUsage[3].waitTime} min`,
        priority: "medium",
        actionable: true
      }
    ];
  }, [mockData, membershipMatrix, facilityUsage]);

  const cohortAnalysis = React.useMemo(() => {
    return [
      {
        cohort: "Ene 2024",
        initialSize: 89,
        retention1M: 94.4,
        retention3M: 87.6,
        retention6M: 81.5,
        retention12M: 76.4,
        avgLTV: 3240,
        status: "strong"
      },
      {
        cohort: "Feb 2024",
        initialSize: 76,
        retention1M: 92.1,
        retention3M: 85.5,
        retention6M: 78.9,
        retention12M: null,
        avgLTV: 3180,
        status: "healthy"
      },
      {
        cohort: "Mar 2024",
        initialSize: 94,
        retention1M: 89.4,
        retention3M: 82.9,
        retention6M: 76.6,
        retention12M: null,
        avgLTV: 2950,
        status: "concerning"
      },
      {
        cohort: "Abr 2024",
        initialSize: 102,
        retention1M: 95.1,
        retention3M: 88.2,
        retention6M: null,
        retention12M: null,
        avgLTV: 2100,
        status: "promising"
      }
    ];
  }, []);

  return (
    <ContentLayout spacing="normal">
      <Stack gap="lg">

        {/* Revenue & Member Overview */}
        <Section title="Métricas Principales de Membresías" variant="elevated">
          <CardGrid columns={{ base: 2, md: 5 }} gap="md">
            <MetricCard
              title="Ingresos Mensuales"
              value={`$${mockData.revenue.monthly.toLocaleString()}`}
              change={mockData.revenue.growth}
              icon="CurrencyDollarIcon"
            />
            <MetricCard
              title="ARR Proyectado"
              value={`$${mockData.revenue.annual.toLocaleString()}`}
              change={mockData.revenue.growth}
              icon="TrendingUpIcon"
            />
            <MetricCard
              title="Miembros Activos"
              value={mockData.members.active.toString()}
              change={6.4}
              icon="UserGroupIcon"
            />
            <MetricCard
              title="Tasa de Retención"
              value={`${mockData.retention.rate}%`}
              change={2.1}
              icon="HeartIcon"
            />
            <MetricCard
              title="LTV Promedio"
              value={`$${membershipMatrix.reduce((acc, m) => acc + m.avgLTV, 0) / membershipMatrix.length}`}
              change={12.5}
              icon="ChartBarIcon"
            />
          </CardGrid>
        </Section>

        {/* Member Engagement Matrix */}
        <Section title="Matriz de Engagement de Miembros" variant="elevated">
          <Typography variant="body" color="muted" mb="md">
            Segmentación de miembros por frecuencia de uso y retención para estrategias dirigidas
          </Typography>

          <CardGrid columns={{ base: 1, md: 2 }} gap="lg">
            {membershipMatrix.map((segment) => (
              <Section key={segment.title} variant="flat" title={segment.title}>
                <Stack gap="md">
                  <Stack gap="sm">
                    <Typography variant="body">{segment.description}</Typography>
                    <Stack direction="row" gap="sm" align="center">
                      <Badge colorPalette={segment.color} variant="subtle">
                        {segment.count} miembros
                      </Badge>
                      <Badge variant="outline">
                        {segment.avgMonthlyVisits} visitas/mes
                      </Badge>
                      <Badge colorPalette={segment.retentionRate > 90 ? 'green' : segment.retentionRate > 75 ? 'yellow' : 'red'} variant="subtle">
                        {segment.retentionRate}% retención
                      </Badge>
                    </Stack>
                  </Stack>

                  <Stack gap="sm">
                    <Typography variant="body" color="muted">
                      LTV Promedio: ${segment.avgLTV.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" fontWeight="semibold" color={`${segment.color}.600`}>
                      Estrategia: {segment.priority}
                    </Typography>
                    <Typography variant="caption" color="muted">
                      Acciones: {segment.strategies.join(", ")}
                    </Typography>
                  </Stack>
                </Stack>
              </Section>
            ))}
          </CardGrid>
        </Section>

        {/* Facility Usage Analytics */}
        <Section title="Análisis de Uso de Instalaciones" variant="elevated">
          <Typography variant="body" color="muted" mb="md">
            Utilización, satisfacción y tiempos de espera por instalación
          </Typography>

          <Stack gap="md">
            {facilityUsage.map((facility) => (
              <Section key={facility.facility} variant="flat">
                <Stack direction={{ base: 'column', md: 'row' }} justify="between" align="start" gap="md">
                  <Stack gap="sm">
                    <Typography variant="h6">{facility.facility}</Typography>
                    <Stack direction="row" gap="sm">
                      <Badge
                        colorPalette={facility.usage > 80 ? 'red' : facility.usage > 60 ? 'yellow' : 'green'}
                        variant="subtle"
                      >
                        {facility.usage}% uso
                      </Badge>
                      <Badge colorPalette="blue" variant="outline">
                        {facility.satisfaction}⭐ satisfacción
                      </Badge>
                      {facility.waitTime > 0 && (
                        <Badge colorPalette={facility.waitTime > 10 ? 'red' : facility.waitTime > 5 ? 'yellow' : 'green'} variant="subtle">
                          {facility.waitTime} min espera
                        </Badge>
                      )}
                    </Stack>
                  </Stack>

                  <Stack gap="sm" align="end">
                    <Typography variant="caption" color="muted">
                      Horas pico: {facility.peakHours}
                    </Typography>
                    <Typography variant="caption" color="muted">
                      Duración promedio: {facility.avgDuration} min
                    </Typography>
                  </Stack>
                </Stack>
              </Section>
            ))}
          </Stack>
        </Section>

        {/* Member Demographics */}
        <Section title="Demografía de Miembros" variant="elevated">
          <CardGrid columns={{ base: 1, md: 4 }} gap="md">
            <MetricCard
              title="Edad Promedio"
              value={`${mockData.demographics.avgAge} años`}
              change={0.8}
              icon="UserIcon"
            />
            <MetricCard
              title="Distribución Género"
              value={`${mockData.demographics.genderSplit.male}% M / ${mockData.demographics.genderSplit.female}% F`}
              change={0}
              icon="UsersIcon"
            />
            <MetricCard
              title="Miembros Corporativos"
              value={`${mockData.demographics.corporateMembers}%`}
              change={3.2}
              icon="BuildingOfficeIcon"
            />
            <MetricCard
              title="Membresías Familiares"
              value={mockData.demographics.familyMembers.toString()}
              change={5.7}
              icon="HomeIcon"
            />
          </CardGrid>
        </Section>

        {/* Retention Cohort Analysis */}
        <Section title="Análisis de Retención por Cohortes" variant="elevated">
          <Typography variant="body" color="muted" mb="md">
            Seguimiento de retención de nuevos miembros por mes de ingreso
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
                          cohort.status === 'strong' ? 'green' :
                          cohort.status === 'healthy' ? 'blue' :
                          cohort.status === 'concerning' ? 'orange' :
                          cohort.status === 'promising' ? 'purple' : 'gray'
                        }
                        variant="subtle"
                      >
                        {cohort.status}
                      </Badge>
                    </Stack>
                    <Typography variant="body" color="muted">
                      {cohort.initialSize} miembros iniciales • LTV promedio ${cohort.avgLTV.toLocaleString()}
                    </Typography>
                  </Stack>

                  <Stack direction="row" gap="lg">
                    <Stack align="center" gap="xs">
                      <Typography variant="caption" color="muted">1 mes</Typography>
                      <Badge colorPalette={cohort.retention1M > 90 ? 'green' : cohort.retention1M > 85 ? 'yellow' : 'red'} variant="subtle">
                        {cohort.retention1M}%
                      </Badge>
                    </Stack>
                    <Stack align="center" gap="xs">
                      <Typography variant="caption" color="muted">3 meses</Typography>
                      <Badge colorPalette={cohort.retention3M > 85 ? 'green' : cohort.retention3M > 80 ? 'yellow' : 'red'} variant="subtle">
                        {cohort.retention3M}%
                      </Badge>
                    </Stack>
                    <Stack align="center" gap="xs">
                      <Typography variant="caption" color="muted">6 meses</Typography>
                      <Badge colorPalette={cohort.retention6M && cohort.retention6M > 80 ? 'green' : cohort.retention6M && cohort.retention6M > 75 ? 'yellow' : 'red'} variant="subtle">
                        {cohort.retention6M ? `${cohort.retention6M}%` : 'Pendiente'}
                      </Badge>
                    </Stack>
                    <Stack align="center" gap="xs">
                      <Typography variant="caption" color="muted">12 meses</Typography>
                      <Badge colorPalette={cohort.retention12M && cohort.retention12M > 75 ? 'green' : cohort.retention12M && cohort.retention12M > 70 ? 'yellow' : 'red'} variant="subtle">
                        {cohort.retention12M ? `${cohort.retention12M}%` : 'Pendiente'}
                      </Badge>
                    </Stack>
                  </Stack>
                </Stack>
              </Section>
            ))}
          </Stack>
        </Section>

        {/* Insights & Recommendations */}
        <Section title="Insights y Recomendaciones" variant="elevated">
          <Stack gap="md">
            {membershipInsights.map((insight, index) => (
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

        {/* Member Status Overview */}
        <Section title="Estado de Membresías" variant="elevated">
          <CardGrid columns={{ base: 2, md: 5 }} gap="md">
            <MetricCard
              title="Total Miembros"
              value={mockData.members.total.toString()}
              change={4.8}
              icon="DocumentTextIcon"
            />
            <MetricCard
              title="Activos"
              value={mockData.members.active.toString()}
              change={6.4}
              icon="CheckCircleIcon"
            />
            <MetricCard
              title="Vencidos"
              value={mockData.members.expired.toString()}
              change={-8.2}
              icon="ExclamationTriangleIcon"
            />
            <MetricCard
              title="Suspendidos"
              value={mockData.members.suspended.toString()}
              change={-12.5}
              icon="PauseIcon"
            />
            <MetricCard
              title="En Prueba"
              value={mockData.members.trial.toString()}
              change={25.4}
              icon="BeakerIcon"
            />
          </CardGrid>
        </Section>

      </Stack>
    </ContentLayout>
  );
};

export default MembershipAnalyticsEnhanced;