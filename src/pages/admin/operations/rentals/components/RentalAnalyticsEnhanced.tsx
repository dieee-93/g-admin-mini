import React from 'react';
import {
  ContentLayout, Section, CardGrid, MetricCard, Stack, Badge,
  Typography, Alert
} from '@/shared/ui';

const RentalAnalyticsEnhanced: React.FC = () => {
  // Mock data - en implementación real vendría del AnalyticsEngine
  const mockData = {
    rentals: {
      total: 342,
      active: 89,
      completed: 198,
      cancelled: 34,
      pending: 21
    },
    revenue: {
      monthly: 127450,
      quarterly: 382350,
      annual: 1529400,
      growth: 14.2
    },
    utilization: {
      averageRate: 73.8,
      peakDays: ['friday', 'saturday'],
      equipmentUtilization: 81.2,
      spaceUtilization: 67.4,
      vehicleUtilization: 59.8
    },
    assets: {
      totalAssets: 156,
      rentableAssets: 142,
      maintenanceRequired: 8,
      topPerformers: 12,
      underperformers: 23
    },
    customer: {
      repeatCustomers: 67.3,
      averageRentalValue: 372,
      corporateSegment: 45.8,
      memberDiscount: 18.5
    }
  };

  const assetPerformanceMatrix = React.useMemo(() => {
    return [
      {
        title: "Top Performers 🏆",
        description: "Alta demanda, alta rentabilidad",
        count: 12,
        utilizationRate: 92.4,
        revenueContribution: 34.8,
        avgDailyRate: 285,
        color: "green",
        priority: "Maximizar disponibilidad",
        strategies: ["Ampliar inventario", "Premium pricing", "Mantenimiento preventivo"]
      },
      {
        title: "Estables 💼",
        description: "Demanda consistente, rentabilidad media",
        count: 67,
        utilizationRate: 76.2,
        revenueContribution: 48.9,
        avgDailyRate: 156,
        color: "blue",
        priority: "Optimización continua",
        strategies: ["Mejoras operativas", "Bundling packages", "Seasonal adjustments"]
      },
      {
        title: "Potencial ⚡",
        description: "Baja utilización, alta rentabilidad",
        count: 34,
        utilizationRate: 45.8,
        revenueContribution: 12.7,
        avgDailyRate: 198,
        color: "yellow",
        priority: "Marketing enfocado",
        strategies: ["Promociones dirigidas", "Educación de mercado", "Partnership programs"]
      },
      {
        title: "Críticos 🔧",
        description: "Baja demanda, baja rentabilidad",
        count: 29,
        utilizationRate: 23.1,
        revenueContribution: 3.6,
        avgDailyRate: 89,
        color: "red",
        priority: "Evaluación estratégica",
        strategies: ["Reposicionamiento", "Liquidación", "Repurposing"]
      }
    ];
  }, []);

  const rentalInsights = React.useMemo(() => {
    return [
      {
        type: "success",
        title: "Crecimiento Sólido",
        description: `${mockData.rentals.active} rentals activos con crecimiento del ${mockData.revenue.growth}% mensual en ingresos`,
        priority: "high",
        actionable: false
      },
      {
        type: "warning",
        title: "Optimización de Utilización",
        description: `Tasa de utilización del ${mockData.utilization.averageRate}% indica oportunidades de mejora en ${assetPerformanceMatrix[3].count} assets críticos`,
        priority: "high",
        actionable: true
      },
      {
        type: "info",
        title: "Dominio Corporativo",
        description: `${mockData.customer.corporateSegment}% de ingresos provienen de clientes corporativos con contratos recurrentes`,
        priority: "medium",
        actionable: false
      },
      {
        type: "warning",
        title: "Mantenimiento Crítico",
        description: `${mockData.assets.maintenanceRequired} assets requieren mantenimiento inmediato para mantener disponibilidad`,
        priority: "high",
        actionable: true
      },
      {
        type: "success",
        title: "Lealtad de Clientes",
        description: `${mockData.customer.repeatCustomers}% de clientes son recurrentes con valor promedio de $${mockData.customer.averageRentalValue}`,
        priority: "medium",
        actionable: false
      }
    ];
  }, [mockData, assetPerformanceMatrix]);

  const utilizationByCategory = React.useMemo(() => {
    return [
      {
        category: "Equipos Audiovisuales",
        utilization: 89.4,
        revenue: 45820,
        avgRentalDuration: 8.5,
        topItems: ["Proyector 4K", "Sistema Sonido Pro", "Pantalla LED"],
        seasonality: "high",
        maintenanceCost: 2340
      },
      {
        category: "Espacios para Eventos",
        utilization: 76.8,
        revenue: 38950,
        avgRentalDuration: 12.0,
        topItems: ["Salón Principal", "Terraza Ejecutiva", "Sala Reuniones"],
        seasonality: "medium",
        maintenanceCost: 1890
      },
      {
        category: "Vehículos",
        utilization: 62.3,
        revenue: 28740,
        avgRentalDuration: 72.0,
        topItems: ["Van Ejecutiva", "Camioneta Carga", "Auto Compacto"],
        seasonality: "low",
        maintenanceCost: 4560
      },
      {
        category: "Herramientas Técnicas",
        utilization: 55.7,
        revenue: 13940,
        avgRentalDuration: 24.0,
        topItems: ["Kit Construcción", "Equipos Medición", "Herramientas Eléctricas"],
        seasonality: "high",
        maintenanceCost: 980
      }
    ];
  }, []);

  const rentalTrends = React.useMemo(() => {
    return [
      {
        period: "Q1 2024",
        totalRentals: 78,
        revenue: 89450,
        utilizationRate: 71.2,
        avgDuration: 18.5,
        customerSatisfaction: 4.6,
        status: "strong"
      },
      {
        period: "Q2 2024",
        totalRentals: 85,
        revenue: 98720,
        utilizationRate: 74.8,
        avgDuration: 16.8,
        customerSatisfaction: 4.7,
        status: "growing"
      },
      {
        period: "Q3 2024",
        totalRentals: 92,
        revenue: 112340,
        utilizationRate: 78.3,
        avgDuration: 19.2,
        customerSatisfaction: 4.8,
        status: "excellent"
      },
      {
        period: "Q4 2024",
        totalRentals: 87,
        revenue: 127450,
        utilizationRate: 73.8,
        avgDuration: 22.1,
        customerSatisfaction: 4.5,
        status: "stable"
      }
    ];
  }, []);

  return (
    <ContentLayout spacing="normal">
      <Stack gap="lg">

        {/* Revenue & Rental Overview */}
        <Section title="Métricas Principales de Rentals" variant="elevated">
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
              icon="ArrowTrendingUpIcon"
            />
            <MetricCard
              title="Rentals Activos"
              value={mockData.rentals.active.toString()}
              change={12.5}
              icon="PlayIcon"
            />
            <MetricCard
              title="Tasa Utilización"
              value={`${mockData.utilization.averageRate}%`}
              change={3.8}
              icon="ChartBarIcon"
            />
            <MetricCard
              title="Valor Promedio"
              value={`$${mockData.customer.averageRentalValue}`}
              change={8.4}
              icon="CurrencyDollarIcon"
            />
          </CardGrid>
        </Section>

        {/* Asset Performance Matrix */}
        <Section title="Matriz de Performance de Assets" variant="elevated">
          <Typography variant="body" color="muted" mb="md">
            Segmentación de assets por utilización y rentabilidad para optimización estratégica
          </Typography>

          <CardGrid columns={{ base: 1, md: 2 }} gap="lg">
            {assetPerformanceMatrix.map((segment) => (
              <Section key={segment.title} variant="flat" title={segment.title}>
                <Stack gap="md">
                  <Stack gap="sm">
                    <Typography variant="body">{segment.description}</Typography>
                    <Stack direction="row" gap="sm" align="center">
                      <Badge colorPalette={segment.color} variant="subtle">
                        {segment.count} assets
                      </Badge>
                      <Badge variant="outline">
                        {segment.utilizationRate}% utilización
                      </Badge>
                      <Badge colorPalette="green" variant="subtle">
                        {segment.revenueContribution}% ingresos
                      </Badge>
                    </Stack>
                  </Stack>

                  <Stack gap="sm">
                    <Typography variant="body" color="muted">
                      Tarifa promedio: ${segment.avgDailyRate}/día
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

        {/* Utilization by Category */}
        <Section title="Utilización por Categoría de Assets" variant="elevated">
          <Typography variant="body" color="muted" mb="md">
            Performance detallado por tipo de asset con métricas operativas
          </Typography>

          <Stack gap="md">
            {utilizationByCategory.map((category) => (
              <Section key={category.category} variant="flat">
                <Stack direction={{ base: 'column', md: 'row' }} justify="between" align="start" gap="md">
                  <Stack gap="sm">
                    <Typography variant="subtitle">{category.category}</Typography>
                    <Stack direction="row" gap="sm">
                      <Badge
                        colorPalette={category.utilization > 80 ? 'green' : category.utilization > 60 ? 'yellow' : 'red'}
                        variant="subtle"
                      >
                        {category.utilization}% utilización
                      </Badge>
                      <Badge colorPalette="blue" variant="outline">
                        ${category.revenue.toLocaleString()} ingresos
                      </Badge>
                      <Badge
                        colorPalette={category.seasonality === 'high' ? 'purple' : category.seasonality === 'medium' ? 'blue' : 'gray'}
                        variant="subtle"
                      >
                        Estacionalidad {category.seasonality}
                      </Badge>
                    </Stack>
                    <Typography variant="caption" color="muted">
                      Items top: {category.topItems.join(", ")}
                    </Typography>
                  </Stack>

                  <Stack gap="sm" align="end">
                    <Typography variant="caption" color="muted">
                      Duración promedio: {category.avgRentalDuration}h
                    </Typography>
                    <Typography variant="caption" color="muted">
                      Costo mantenimiento: ${category.maintenanceCost.toLocaleString()}
                    </Typography>
                  </Stack>
                </Stack>
              </Section>
            ))}
          </Stack>
        </Section>

        {/* Asset Status Overview */}
        <Section title="Estado de Assets" variant="elevated">
          <CardGrid columns={{ base: 2, md: 5 }} gap="md">
            <MetricCard
              title="Total Assets"
              value={mockData.assets.totalAssets.toString()}
              change={2.4}
              icon="CubeIcon"
            />
            <MetricCard
              title="Disponibles"
              value={mockData.assets.rentableAssets.toString()}
              change={1.8}
              icon="CheckCircleIcon"
            />
            <MetricCard
              title="Top Performers"
              value={mockData.assets.topPerformers.toString()}
              change={8.3}
              icon="StarIcon"
            />
            <MetricCard
              title="Underperformers"
              value={mockData.assets.underperformers.toString()}
              change={-12.1}
              icon="ExclamationTriangleIcon"
            />
            <MetricCard
              title="Mantenimiento"
              value={mockData.assets.maintenanceRequired.toString()}
              change={-5.2}
              icon="WrenchScrewdriverIcon"
            />
          </CardGrid>
        </Section>

        {/* Quarterly Trends */}
        <Section title="Tendencias Trimestrales" variant="elevated">
          <Typography variant="body" color="muted" mb="md">
            Evolución de métricas clave por trimestre
          </Typography>

          <Stack gap="md">
            {rentalTrends.map((trend) => (
              <Section key={trend.period} variant="flat">
                <Stack direction={{ base: 'column', md: 'row' }} justify="between" align="start" gap="md">
                  <Stack gap="sm">
                    <Stack direction="row" align="center" gap="sm">
                      <Typography variant="subtitle">{trend.period}</Typography>
                      <Badge
                        colorPalette={
                          trend.status === 'excellent' ? 'green' :
                          trend.status === 'growing' ? 'blue' :
                          trend.status === 'strong' ? 'purple' : 'gray'
                        }
                        variant="subtle"
                      >
                        {trend.status}
                      </Badge>
                    </Stack>
                    <Typography variant="body" color="muted">
                      {trend.totalRentals} rentals • ${trend.revenue.toLocaleString()} ingresos
                    </Typography>
                  </Stack>

                  <Stack direction="row" gap="lg">
                    <Stack align="center" gap="xs">
                      <Typography variant="caption" color="muted">Utilización</Typography>
                      <Badge colorPalette={trend.utilizationRate > 75 ? 'green' : trend.utilizationRate > 65 ? 'yellow' : 'red'} variant="subtle">
                        {trend.utilizationRate}%
                      </Badge>
                    </Stack>
                    <Stack align="center" gap="xs">
                      <Typography variant="caption" color="muted">Duración Avg</Typography>
                      <Badge variant="outline">
                        {trend.avgDuration}h
                      </Badge>
                    </Stack>
                    <Stack align="center" gap="xs">
                      <Typography variant="caption" color="muted">Satisfacción</Typography>
                      <Badge colorPalette={trend.customerSatisfaction > 4.5 ? 'green' : trend.customerSatisfaction > 4.0 ? 'yellow' : 'red'} variant="subtle">
                        {trend.customerSatisfaction}⭐
                      </Badge>
                    </Stack>
                  </Stack>
                </Stack>
              </Section>
            ))}
          </Stack>
        </Section>

        {/* Customer Analytics */}
        <Section title="Analytics de Clientes" variant="elevated">
          <CardGrid columns={{ base: 1, md: 4 }} gap="md">
            <MetricCard
              title="Clientes Recurrentes"
              value={`${mockData.customer.repeatCustomers}%`}
              change={5.7}
              icon="UserGroupIcon"
            />
            <MetricCard
              title="Segmento Corporativo"
              value={`${mockData.customer.corporateSegment}%`}
              change={8.2}
              icon="BuildingOfficeIcon"
            />
            <MetricCard
              title="Descuento Miembros"
              value={`${mockData.customer.memberDiscount}%`}
              change={-2.1}
              icon="TagIcon"
            />
            <MetricCard
              title="Peak Days"
              value={mockData.utilization.peakDays.join(", ")}
              change={0}
              icon="CalendarIcon"
            />
          </CardGrid>
        </Section>

        {/* Insights & Recommendations */}
        <Section title="Insights y Recomendaciones" variant="elevated">
          <Stack gap="md">
            {rentalInsights.map((insight, index) => (
              <Alert key={index} status={insight.type} size="md">
                <Stack gap="sm">
                  <Typography variant="subtitle">{insight.title}</Typography>
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

        {/* Rental Status Overview */}
        <Section title="Estado de Rentals" variant="elevated">
          <CardGrid columns={{ base: 2, md: 5 }} gap="md">
            <MetricCard
              title="Total Rentals"
              value={mockData.rentals.total.toString()}
              change={7.3}
              icon="DocumentTextIcon"
            />
            <MetricCard
              title="Activos"
              value={mockData.rentals.active.toString()}
              change={12.5}
              icon="PlayIcon"
            />
            <MetricCard
              title="Completados"
              value={mockData.rentals.completed.toString()}
              change={8.7}
              icon="CheckCircleIcon"
            />
            <MetricCard
              title="Cancelados"
              value={mockData.rentals.cancelled.toString()}
              change={-15.3}
              icon="XCircleIcon"
            />
            <MetricCard
              title="Pendientes"
              value={mockData.rentals.pending.toString()}
              change={22.1}
              icon="ClockIcon"
            />
          </CardGrid>
        </Section>

      </Stack>
    </ContentLayout>
  );
};

export default RentalAnalyticsEnhanced;