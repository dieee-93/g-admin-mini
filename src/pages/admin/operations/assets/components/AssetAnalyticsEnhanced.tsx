import React from 'react';
import {
  ContentLayout, Section, CardGrid, MetricCard, Stack, Badge,
  Typography, Alert
} from '@/shared/ui';

const AssetAnalyticsEnhanced: React.FC = () => {
  // Mock data - en implementación real vendría del AnalyticsEngine
  const mockData = {
    portfolio: {
      totalAssets: 287,
      activeAssets: 256,
      totalValue: 2847500,
      depreciatedValue: 1923400,
      annualDepreciation: 287600,
      insuranceValue: 3100000
    },
    performance: {
      averageROI: 18.7,
      averageUtilization: 73.8,
      topPerformingCategory: 'audiovisual_equipment',
      totalAnnualRevenue: 567800,
      maintenanceCostRatio: 6.2
    },
    lifecycle: {
      newAssets: 23,
      retiredAssets: 8,
      assetsNeedingReplacement: 12,
      averageLifespan: 6.8,
      depreciationRate: 14.2
    },
    maintenance: {
      scheduledMaintenances: 45,
      overdueMaintenances: 7,
      criticalRepairs: 3,
      maintenanceBudgetUsed: 67.3,
      preventiveVsCorrective: 78.2
    }
  };

  const assetLifecycleMatrix = React.useMemo(() => {
    return [
      {
        title: "Assets Nuevos 🆕",
        description: "Menos de 2 años, alto ROI",
        count: 67,
        avgAge: 1.2,
        roi: 24.8,
        utilizationRate: 82.4,
        color: "green",
        priority: "Maximizar utilización",
        strategies: ["Optimización rental", "Marketing agresivo", "Pricing premium"]
      },
      {
        title: "Assets Maduros 💰",
        description: "2-5 años, ROI estable",
        count: 134,
        avgAge: 3.6,
        roi: 18.2,
        utilizationRate: 75.6,
        color: "blue",
        priority: "Mantener performance",
        strategies: ["Mantenimiento preventivo", "Pricing competitivo", "Upgrades selectivos"]
      },
      {
        title: "Assets Veteranos ⚠️",
        description: "5-8 años, ROI en declive",
        count: 67,
        avgAge: 6.4,
        roi: 12.1,
        utilizationRate: 58.9,
        color: "orange",
        priority: "Evaluación estratégica",
        strategies: ["Análisis reemplazo", "Mantenimiento intensivo", "Pricing agresivo"]
      },
      {
        title: "Assets Críticos 🔴",
        description: "Más de 8 años, bajo ROI",
        count: 19,
        avgAge: 9.2,
        roi: 6.3,
        utilizationRate: 34.2,
        color: "red",
        priority: "Reemplazo urgente",
        strategies: ["Liquidación", "Retirement planning", "Upgrade inmediato"]
      }
    ];
  }, []);

  const categoryPerformance = React.useMemo(() => {
    return [
      {
        category: "Equipos Audiovisuales",
        assetCount: 45,
        totalValue: 987500,
        utilization: 89.4,
        roi: 28.7,
        revenue: 156780,
        maintenanceCost: 12450,
        condition: "excellent",
        growthPotential: "high"
      },
      {
        category: "Vehículos",
        assetCount: 23,
        totalValue: 756000,
        utilization: 67.8,
        roi: 15.2,
        revenue: 98340,
        maintenanceCost: 45600,
        condition: "good",
        growthPotential: "medium"
      },
      {
        category: "Herramientas Especializadas",
        assetCount: 89,
        totalValue: 234500,
        utilization: 78.5,
        roi: 21.4,
        revenue: 87650,
        maintenanceCost: 8900,
        condition: "good",
        growthPotential: "high"
      },
      {
        category: "Espacios",
        assetCount: 12,
        totalValue: 1200000,
        utilization: 56.3,
        roi: 9.8,
        revenue: 89400,
        maintenanceCost: 67800,
        condition: "fair",
        growthPotential: "low"
      },
      {
        category: "Tecnología",
        assetCount: 67,
        totalValue: 445600,
        utilization: 82.1,
        roi: 19.6,
        revenue: 76890,
        maintenanceCost: 18900,
        condition: "excellent",
        growthPotential: "high"
      },
      {
        category: "Mobiliario",
        assetCount: 51,
        totalValue: 123900,
        utilization: 45.2,
        roi: 7.8,
        revenue: 23450,
        maintenanceCost: 3400,
        condition: "good",
        growthPotential: "low"
      }
    ];
  }, []);

  const assetInsights = React.useMemo(() => {
    return [
      {
        type: "success",
        title: "Portfolio Saludable",
        description: `${mockData.portfolio.activeAssets} assets activos con valor total de $${mockData.portfolio.totalValue.toLocaleString()}`,
        priority: "high",
        actionable: false
      },
      {
        type: "warning",
        title: "Mantenimientos Vencidos",
        description: `${mockData.maintenance.overdueMaintenances} mantenimientos vencidos y ${mockData.maintenance.criticalRepairs} reparaciones críticas pendientes`,
        priority: "high",
        actionable: true
      },
      {
        type: "info",
        title: "ROI Promedio Sólido",
        description: `ROI promedio del ${mockData.performance.averageROI}% con utilización del ${mockData.performance.averageUtilization}%`,
        priority: "medium",
        actionable: false
      },
      {
        type: "warning",
        title: "Assets Requieren Reemplazo",
        description: `${mockData.lifecycle.assetsNeedingReplacement} assets necesitan reemplazo por edad o condición crítica`,
        priority: "high",
        actionable: true
      },
      {
        type: "success",
        title: "Crecimiento del Portfolio",
        description: `${mockData.lifecycle.newAssets} nuevos assets adquiridos vs ${mockData.lifecycle.retiredAssets} retirados - crecimiento neto positivo`,
        priority: "medium",
        actionable: false
      }
    ];
  }, [mockData]);

  const maintenanceAnalytics = React.useMemo(() => {
    return [
      {
        period: "Q1 2024",
        scheduled: 38,
        completed: 36,
        overdue: 2,
        critical: 1,
        budgetUsed: 45.6,
        efficiency: 94.7,
        status: "excellent"
      },
      {
        period: "Q2 2024",
        scheduled: 42,
        completed: 39,
        overdue: 3,
        critical: 0,
        budgetUsed: 52.3,
        efficiency: 92.9,
        status: "good"
      },
      {
        period: "Q3 2024",
        scheduled: 47,
        completed: 41,
        overdue: 5,
        critical: 1,
        budgetUsed: 61.8,
        efficiency: 87.2,
        status: "fair"
      },
      {
        period: "Q4 2024",
        scheduled: 45,
        completed: 38,
        overdue: 7,
        critical: 3,
        budgetUsed: 67.3,
        efficiency: 84.4,
        status: "concerning"
      }
    ];
  }, []);

  const riskAssessment = React.useMemo(() => {
    return [
      {
        risk: "Depreciación Acelerada",
        impact: "high",
        probability: "medium",
        affectedAssets: 45,
        mitigation: "Evaluación de vida útil y pricing dinámico",
        timeline: "3 meses"
      },
      {
        risk: "Obsolescencia Tecnológica",
        impact: "high",
        probability: "high",
        affectedAssets: 23,
        mitigation: "Plan de modernización y replacement",
        timeline: "6 meses"
      },
      {
        risk: "Incremento Costos Mantenimiento",
        impact: "medium",
        probability: "high",
        affectedAssets: 67,
        mitigation: "Contratos de mantenimiento y preventivo",
        timeline: "1 mes"
      },
      {
        risk: "Baja Utilización",
        impact: "medium",
        probability: "medium",
        affectedAssets: 34,
        mitigation: "Estrategias de marketing y pricing",
        timeline: "2 meses"
      }
    ];
  }, []);

  return (
    <ContentLayout spacing="normal">
      <Stack gap="lg">

        {/* Portfolio Overview */}
        <Section title="Resumen del Portfolio de Assets" variant="elevated">
          <CardGrid columns={{ base: 2, md: 6 }} gap="md">
            <MetricCard
              title="Total Assets"
              value={mockData.portfolio.totalAssets.toString()}
              change={4.2}
              icon="CubeIcon"
            />
            <MetricCard
              title="Valor Total"
              value={`$${(mockData.portfolio.totalValue / 1000000).toFixed(1)}M`}
              change={2.8}
              icon="CurrencyDollarIcon"
            />
            <MetricCard
              title="ROI Promedio"
              value={`${mockData.performance.averageROI}%`}
              change={1.5}
              icon="ArrowTrendingUpIcon"
            />
            <MetricCard
              title="Utilización"
              value={`${mockData.performance.averageUtilization}%`}
              change={-2.1}
              icon="ChartBarIcon"
            />
            <MetricCard
              title="Ingresos Anuales"
              value={`$${(mockData.performance.totalAnnualRevenue / 1000).toFixed(0)}K`}
              change={8.7}
              icon="BanknotesIcon"
            />
            <MetricCard
              title="Ratio Mantenimiento"
              value={`${mockData.performance.maintenanceCostRatio}%`}
              change={-0.8}
              icon="WrenchScrewdriverIcon"
            />
          </CardGrid>
        </Section>

        {/* Asset Lifecycle Matrix */}
        <Section title="Matriz de Ciclo de Vida de Assets" variant="elevated">
          <Typography variant="body" color="muted" mb="md">
            Segmentación de assets por edad y performance para estrategias de lifecycle management
          </Typography>

          <CardGrid columns={{ base: 1, md: 2 }} gap="lg">
            {assetLifecycleMatrix.map((segment) => (
              <Section key={segment.title} variant="flat" title={segment.title}>
                <Stack gap="md">
                  <Stack gap="sm">
                    <Typography variant="body">{segment.description}</Typography>
                    <Stack direction="row" gap="sm" align="center">
                      <Badge colorPalette={segment.color} variant="subtle">
                        {segment.count} assets
                      </Badge>
                      <Badge variant="outline">
                        {segment.avgAge} años promedio
                      </Badge>
                      <Badge colorPalette={segment.roi > 20 ? 'green' : segment.roi > 15 ? 'blue' : segment.roi > 10 ? 'yellow' : 'red'} variant="subtle">
                        {segment.roi}% ROI
                      </Badge>
                    </Stack>
                  </Stack>

                  <Stack gap="sm">
                    <Typography variant="body" color="muted">
                      Utilización: {segment.utilizationRate}%
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

        {/* Category Performance Analysis */}
        <Section title="Performance por Categoría de Assets" variant="elevated">
          <Typography variant="body" color="muted" mb="md">
            Análisis detallado de ROI, utilización y potencial por tipo de asset
          </Typography>

          <Stack gap="md">
            {categoryPerformance.map((category) => (
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
                      <Badge
                        colorPalette={category.roi > 20 ? 'green' : category.roi > 15 ? 'blue' : category.roi > 10 ? 'yellow' : 'red'}
                        variant="subtle"
                      >
                        {category.roi}% ROI
                      </Badge>
                      <Badge
                        colorPalette={category.growthPotential === 'high' ? 'green' : category.growthPotential === 'medium' ? 'yellow' : 'gray'}
                        variant="subtle"
                      >
                        Potencial {category.growthPotential}
                      </Badge>
                    </Stack>
                    <Typography variant="caption" color="muted">
                      {category.assetCount} assets • Valor: ${category.totalValue.toLocaleString()}
                    </Typography>
                  </Stack>

                  <Stack gap="sm" align="end">
                    <Typography variant="caption" color="muted">
                      Ingresos: ${category.revenue.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="muted">
                      Mantenimiento: ${category.maintenanceCost.toLocaleString()}
                    </Typography>
                    <Badge
                      colorPalette={category.condition === 'excellent' ? 'green' : category.condition === 'good' ? 'blue' : 'orange'}
                      variant="outline"
                      size="sm"
                    >
                      Condición {category.condition}
                    </Badge>
                  </Stack>
                </Stack>
              </Section>
            ))}
          </Stack>
        </Section>

        {/* Maintenance Analytics */}
        <Section title="Analytics de Mantenimiento" variant="elevated">
          <CardGrid columns={{ base: 1, md: 4 }} gap="md">
            <MetricCard
              title="Mantenimientos Programados"
              value={mockData.maintenance.scheduledMaintenances.toString()}
              change={7.1}
              icon="CalendarDaysIcon"
            />
            <MetricCard
              title="Vencidos"
              value={mockData.maintenance.overdueMaintenances.toString()}
              change={-12.5}
              icon="ExclamationTriangleIcon"
            />
            <MetricCard
              title="Reparaciones Críticas"
              value={mockData.maintenance.criticalRepairs.toString()}
              change={-25.0}
              icon="WrenchScrewdriverIcon"
            />
            <MetricCard
              title="Presupuesto Usado"
              value={`${mockData.maintenance.maintenanceBudgetUsed}%`}
              change={5.8}
              icon="CurrencyDollarIcon"
            />
          </CardGrid>

          <Typography variant="body" color="muted" mb="md">
            Tendencia trimestral de eficiencia de mantenimiento
          </Typography>

          <Stack gap="md">
            {maintenanceAnalytics.map((period) => (
              <Section key={period.period} variant="flat">
                <Stack direction={{ base: 'column', md: 'row' }} justify="between" align="start" gap="md">
                  <Stack gap="sm">
                    <Stack direction="row" align="center" gap="sm">
                      <Typography variant="subtitle">{period.period}</Typography>
                      <Badge
                        colorPalette={
                          period.status === 'excellent' ? 'green' :
                          period.status === 'good' ? 'blue' :
                          period.status === 'fair' ? 'yellow' : 'red'
                        }
                        variant="subtle"
                      >
                        {period.status}
                      </Badge>
                    </Stack>
                    <Typography variant="body" color="muted">
                      {period.completed}/{period.scheduled} completados • {period.overdue} vencidos
                    </Typography>
                  </Stack>

                  <Stack direction="row" gap="lg">
                    <Stack align="center" gap="xs">
                      <Typography variant="caption" color="muted">Eficiencia</Typography>
                      <Badge colorPalette={period.efficiency > 90 ? 'green' : period.efficiency > 85 ? 'yellow' : 'red'} variant="subtle">
                        {period.efficiency}%
                      </Badge>
                    </Stack>
                    <Stack align="center" gap="xs">
                      <Typography variant="caption" color="muted">Presupuesto</Typography>
                      <Badge colorPalette={period.budgetUsed < 60 ? 'green' : period.budgetUsed < 80 ? 'yellow' : 'red'} variant="subtle">
                        {period.budgetUsed}%
                      </Badge>
                    </Stack>
                    <Stack align="center" gap="xs">
                      <Typography variant="caption" color="muted">Críticos</Typography>
                      <Badge colorPalette={period.critical === 0 ? 'green' : period.critical < 3 ? 'yellow' : 'red'} variant="subtle">
                        {period.critical}
                      </Badge>
                    </Stack>
                  </Stack>
                </Stack>
              </Section>
            ))}
          </Stack>
        </Section>

        {/* Financial Analytics */}
        <Section title="Analytics Financieros" variant="elevated">
          <CardGrid columns={{ base: 1, md: 4 }} gap="md">
            <MetricCard
              title="Valor Original"
              value={`$${(mockData.portfolio.totalValue / 1000000).toFixed(1)}M`}
              change={2.8}
              icon="CurrencyDollarIcon"
            />
            <MetricCard
              title="Valor Depreciado"
              value={`$${(mockData.portfolio.depreciatedValue / 1000000).toFixed(1)}M`}
              change={-mockData.lifecycle.depreciationRate}
              icon="TrendingDownIcon"
            />
            <MetricCard
              title="Depreciación Anual"
              value={`$${(mockData.portfolio.annualDepreciation / 1000).toFixed(0)}K`}
              change={-3.2}
              icon="MinusCircleIcon"
            />
            <MetricCard
              title="Valor de Seguro"
              value={`$${(mockData.portfolio.insuranceValue / 1000000).toFixed(1)}M`}
              change={1.5}
              icon="ShieldCheckIcon"
            />
          </CardGrid>
        </Section>

        {/* Risk Assessment */}
        <Section title="Evaluación de Riesgos" variant="elevated">
          <Typography variant="body" color="muted" mb="md">
            Identificación y mitigación de riesgos del portfolio de assets
          </Typography>

          <Stack gap="md">
            {riskAssessment.map((risk, index) => (
              <Section key={index} variant="flat">
                <Stack direction={{ base: 'column', md: 'row' }} justify="between" align="start" gap="md">
                  <Stack gap="sm">
                    <Typography variant="subtitle">{risk.risk}</Typography>
                    <Stack direction="row" gap="sm">
                      <Badge
                        colorPalette={risk.impact === 'high' ? 'red' : risk.impact === 'medium' ? 'yellow' : 'green'}
                        variant="subtle"
                      >
                        Impacto {risk.impact}
                      </Badge>
                      <Badge
                        colorPalette={risk.probability === 'high' ? 'red' : risk.probability === 'medium' ? 'yellow' : 'green'}
                        variant="subtle"
                      >
                        Probabilidad {risk.probability}
                      </Badge>
                      <Badge variant="outline">
                        {risk.affectedAssets} assets afectados
                      </Badge>
                    </Stack>
                  </Stack>

                  <Stack gap="sm" align="end">
                    <Typography variant="caption" color="muted">
                      Timeline: {risk.timeline}
                    </Typography>
                    <Typography variant="caption" fontWeight="semibold">
                      Mitigación: {risk.mitigation}
                    </Typography>
                  </Stack>
                </Stack>
              </Section>
            ))}
          </Stack>
        </Section>

        {/* Insights & Recommendations */}
        <Section title="Insights y Recomendaciones" variant="elevated">
          <Stack gap="md">
            {assetInsights.map((insight, index) => (
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

        {/* Lifecycle Status Overview */}
        <Section title="Estado del Ciclo de Vida" variant="elevated">
          <CardGrid columns={{ base: 2, md: 4 }} gap="md">
            <MetricCard
              title="Nuevos Assets"
              value={mockData.lifecycle.newAssets.toString()}
              change={35.7}
              icon="PlusCircleIcon"
            />
            <MetricCard
              title="Assets Retirados"
              value={mockData.lifecycle.retiredAssets.toString()}
              change={-18.9}
              icon="MinusCircleIcon"
            />
            <MetricCard
              title="Requieren Reemplazo"
              value={mockData.lifecycle.assetsNeedingReplacement.toString()}
              change={-8.3}
              icon="ArrowPathIcon"
            />
            <MetricCard
              title="Vida Útil Promedio"
              value={`${mockData.lifecycle.averageLifespan} años`}
              change={2.1}
              icon="ClockIcon"
            />
          </CardGrid>
        </Section>

      </Stack>
    </ContentLayout>
  );
};

export default AssetAnalyticsEnhanced;