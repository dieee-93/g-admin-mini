/**
 * CrossModuleInsights FIXED - Layout y spacing arreglado
 *
 * Problemas identificados y solucionados:
 * - Sin margins/padding adecuado
 * - Texto apretado sin line-height
 * - Badges mal espaciados
 * - Secciones sin separación visual
 */

import React, { useState } from 'react';
import {
  Section, Box, CardWrapper, CardGrid, SimpleGrid, Stack, Typography, Badge, Icon, Button
} from '@/shared/ui';
// Using proper component hierarchy: Section > Box > SimpleGrid > Card
import {
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { MetricCard } from '@/shared/ui';

import { logger } from '@/lib/logging';
// Import recuperated robust interfaces
import type {
  CrossModuleInsight,
  SystemHealthMetric,
  BusinessBottleneck
} from '../types/analytics';

export const CrossModuleInsights: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // System Health Metrics (recuperado de CrossModuleAnalytics)
  const systemHealth: SystemHealthMetric[] = [
    {
      category: 'Performance',
      name: 'Response Time',
      value: 95,
      target: 100,
      unit: 'ms',
      status: 'excellent',
      trend: 'improving',
      lastUpdated: '2 min ago'
    },
    {
      category: 'Integration',
      name: 'Module Sync',
      value: 98,
      target: 100,
      unit: '%',
      status: 'excellent',
      trend: 'stable',
      lastUpdated: '5 min ago'
    },
    {
      category: 'Data Quality',
      name: 'Accuracy Score',
      value: 94,
      target: 95,
      unit: '%',
      status: 'good',
      trend: 'improving',
      lastUpdated: '1 min ago'
    }
  ];

  // Business Bottlenecks (recuperado y mejorado)
  const businessBottlenecks: BusinessBottleneck[] = [
    {
      id: 'inventory-sales-lag',
      name: 'Lag entre Inventario y Ventas',
      type: 'process',
      severity: 'medium',
      affectedModules: ['Inventory', 'Sales', 'POS'],
      rootCause: 'Sincronización manual entre sistemas causa retrasos en actualizaciones de stock',
      symptoms: ['Stock phantom en POS', 'Overselling ocasional', 'Tiempo extra en auditorías'],
      estimatedImpact: {
        financial: -8500,
        operational: 15,
        customer: 8
      },
      recommendations: [
        {
          action: 'Implementar sincronización automática en tiempo real',
          effort: 'medium',
          timeframe: '2-4 semanas',
          expectedImprovement: 85,
          cost: 3500,
          riskLevel: 'low'
        }
      ],
      detectedAt: '2024-01-15',
      priority: 7
    }
  ];

  // Deep Analysis Function (recuperado de CrossModuleAnalytics)
  const runDeepAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2500));
      setShowAdvanced(true);
    } catch (error) {
      logger.error('App', 'Error running deep analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Insights que conectan múltiples módulos
  const insights: CrossModuleInsight[] = [
    {
      id: 'customer-revenue-correlation',
      title: 'Clientes Premium generan 68% del Revenue',
      description: 'Los clientes con membresías activas tienen 3.2x mayor valor promedio de transacción',
      modules: ['CRM', 'Memberships', 'Sales', 'Finance'],
      impact: 'high',
      type: 'opportunity',
      value: '+$180K',
      change: 'potencial anual',
      actionRequired: true
    },
    {
      id: 'inventory-sales-prediction',
      title: 'Predicción de Stock para Black Friday',
      description: 'Analytics predictivo muestra necesidad de 40% más stock en 3 categorías principales',
      modules: ['Inventory', 'Sales', 'Analytics', 'Forecasting'],
      impact: 'high',
      type: 'trend',
      value: '15 días',
      change: 'para preparación',
      actionRequired: true
    },
    {
      id: 'payment-integration-success',
      title: 'MercadoPago reduce tiempo de checkout 34%',
      description: 'Nueva integración argentina mejora conversión y satisfacción del cliente',
      modules: ['Integrations', 'Sales', 'Customer Experience'],
      impact: 'medium',
      type: 'achievement',
      value: '+12.3%',
      change: 'conversión',
      actionRequired: false
    },
    {
      id: 'staff-performance-gamification',
      title: 'Gamificación mejora productividad 18%',
      description: 'Staff con logros activos muestra mayor eficiencia en operaciones diarias',
      modules: ['Gamification', 'Staff', 'Operations', 'Performance'],
      impact: 'medium',
      type: 'achievement',
      value: '+18%',
      change: 'productividad',
      actionRequired: false
    },
    {
      id: 'asset-maintenance-cost',
      title: 'Mantenimiento predictivo ahorra $15K/mes',
      description: 'IA de activos previene fallas costosas con 89% de precisión',
      modules: ['Assets', 'AI', 'Maintenance', 'Finance'],
      impact: 'high',
      type: 'achievement',
      value: '$15K',
      change: 'ahorro mensual',
      actionRequired: false
    },
    {
      id: 'billing-automation-efficiency',
      title: 'Facturación automática reduce errores 95%',
      description: 'Sistema inteligente elimina errores manuales y acelera cobros',
      modules: ['Billing', 'Finance', 'Automation', 'Quality'],
      impact: 'medium',
      type: 'achievement',
      value: '95%',
      change: 'menos errores',
      actionRequired: false
    }
  ];

  const getInsightIcon = (type: CrossModuleInsight['type']) => {
    switch (type) {
      case 'opportunity': return ArrowTrendingUpIcon;
      case 'risk': return ExclamationTriangleIcon;
      case 'achievement': return CheckCircleIcon;
      case 'trend': return ChartBarIcon;
      default: return ClockIcon;
    }
  };

  const moduleStats = {
    totalIntegrations: 23,
    activeConnections: 18,
    dataPoints: '847K',
    lastSync: '2 min ago'
  };

  return (
    <Section variant="elevated" title="Insights Cross-Module">
      <Stack gap="8"> {/* Más espacio entre secciones */}

        {/* Stats de Integración - Con MetricCard arreglado */}
        <CardGrid columns={{ base: 2, md: 4 }} gap="6">
          <MetricCard
            title="Módulos Integrados"
            value={moduleStats.totalIntegrations.toString()}
            subtitle="Sistema completo"
            icon={CheckCircleIcon}
            colorPalette="green"
          />
          <MetricCard
            title="Conexiones Activas"
            value={moduleStats.activeConnections.toString()}
            subtitle="En tiempo real"
            icon={ArrowTrendingUpIcon}
            trend="up"
            colorPalette="blue"
          />
          <MetricCard
            title="Puntos de Datos"
            value={moduleStats.dataPoints}
            subtitle="Procesados hoy"
            icon={ChartBarIcon}
            trend="up"
            colorPalette="purple"
          />
          <MetricCard
            title="Última Sincronización"
            value={moduleStats.lastSync}
            subtitle="Todos los módulos"
            icon={ClockIcon}
            colorPalette="gray"
          />
        </CardGrid>

        {/* Insights Detallados - Con mejor spacing */}
        <Stack gap="6">
          <Stack direction="row" justify="space-between" align="center">
            <Stack direction="row" align="center" gap="3">
              <Icon icon={ChartBarIcon} size="lg" />
              <Typography variant="heading" size="xl" weight="semibold">
                Insights Inteligentes del Sistema
              </Typography>
            </Stack>

            {/* Advanced Analysis Button */}
            <Button
              size="md"
              colorPalette="purple"
              onClick={runDeepAnalysis}
              loading={isAnalyzing}
            >
              <MagnifyingGlassIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              {isAnalyzing ? 'Analizando...' : 'Análisis Profundo'}
            </Button>
          </Stack>

          {/* Insights Grid - Usando componentes semánticos */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
            {insights.map((insight) => (
              <CardWrapper
                key={insight.id}
                variant="elevated"
                colorPalette={
                  insight.type === 'opportunity' ? 'blue' :
                  insight.type === 'risk' ? 'red' :
                  insight.type === 'achievement' ? 'green' : 'purple'
                }
                position="relative"
              >
                {insight.actionRequired && (
                  <Box position="absolute" top={4} right={4}>
                    <Badge size="sm" colorPalette="red" variant="solid">
                      Acción Requerida
                    </Badge>
                  </Box>
                )}

                <CardWrapper.Body>
                  <Stack gap="4">
                    <Stack direction="row" align="start" gap="4">
                      <Icon
                        icon={getInsightIcon(insight.type)}
                        size="lg"
                        color={
                          insight.type === 'opportunity' ? 'blue.600' :
                          insight.type === 'risk' ? 'red.600' :
                          insight.type === 'achievement' ? 'green.600' : 'purple.600'
                        }
                      />

                      <Stack gap="3" flex={1}>
                        <Typography variant="heading" size="lg" weight="semibold" lineHeight="1.3">
                          {insight.title}
                        </Typography>

                        <Typography variant="body" size="md" color="gray.700" lineHeight="1.5">
                          {insight.description}
                        </Typography>

                        {insight.value && (
                          <Stack direction="row" gap="3" align="center">
                            <Typography variant="heading" size="xl" weight="bold" color="gray.800">
                              {insight.value}
                            </Typography>
                            <Typography variant="body" size="sm" color="gray.600">
                              {insight.change}
                            </Typography>
                          </Stack>
                        )}

                        {/* Módulos Tags - Usando Stack en lugar de div */}
                        <Stack direction="row" wrap="wrap" gap="2">
                          {insight.modules.map((module) => (
                            <Badge key={module} size="sm" colorPalette="gray" variant="subtle">
                              {module}
                            </Badge>
                          ))}
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardWrapper.Body>
              </CardWrapper>
            ))}
          </SimpleGrid>
        </Stack>

        {/* Advanced Analysis Results */}
        {showAdvanced && (
          <Stack gap="8">
            {/* System Health Section */}
            <Stack gap="4">
              <Typography variant="heading" size="lg" weight="semibold">
                🔧 Salud del Sistema (Análisis Avanzado)
              </Typography>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
                {systemHealth.map((health, index) => (
                  <CardWrapper key={index} variant="elevated" colorPalette="gray">
                    <CardWrapper.Body>
                      <Stack gap="3">
                        <Stack direction="row" justify="space-between" align="center">
                          <Typography variant="body" size="sm" weight="medium">{health.name}</Typography>
                          <Badge
                            size="sm"
                            colorPalette={health.status === 'excellent' ? 'green' : health.status === 'good' ? 'blue' : 'yellow'}
                          >
                            {health.status}
                          </Badge>
                        </Stack>
                        <Typography variant="heading" size="2xl" weight="bold" color="gray.800">
                          {health.value}{health.unit}
                        </Typography>
                        <Typography variant="body" size="xs" color="gray.500">
                          Target: {health.target}{health.unit} • {health.trend}
                        </Typography>
                      </Stack>
                    </CardWrapper.Body>
                  </CardWrapper>
                ))}
              </SimpleGrid>
            </Stack>

            {/* Business Bottlenecks Section - Mejorado */}
            <Stack gap="6">
              <Typography variant="heading" size="lg" weight="semibold">
                ⚠️ Business Bottlenecks Detectados
              </Typography>
              {businessBottlenecks.map((bottleneck) => (
                <CardWrapper key={bottleneck.id} variant="elevated" colorPalette="orange">
                  <CardWrapper.Body>
                    <Stack gap="4">
                      <Stack direction="row" justify="space-between" align="start">
                        <Stack gap="2">
                          <Typography variant="heading" size="lg" weight="bold">{bottleneck.name}</Typography>
                          <Stack direction="row" gap="2">
                            <Badge size="sm" colorPalette="orange">{bottleneck.severity}</Badge>
                            <Badge size="sm" colorPalette="gray">{bottleneck.type}</Badge>
                            <Badge size="sm" colorPalette="blue">Priority {bottleneck.priority}/10</Badge>
                          </Stack>
                        </Stack>
                      </Stack>

                      <Typography variant="body" size="md" color="gray.700" lineHeight="1.5">
                        <strong>Causa:</strong> {bottleneck.rootCause}
                      </Typography>

                      {/* Impact Grid - Usando SimpleGrid */}
                      <CardWrapper variant="subtle" colorPalette="gray">
                        <CardWrapper.Body>
                          <SimpleGrid columns={3} gap="4">
                            <Box textAlign="center">
                              <Typography variant="heading" size="lg" weight="bold" color="red.600">
                                ${Math.abs(bottleneck.estimatedImpact.financial)}
                              </Typography>
                              <Typography variant="body" size="xs" color="gray.600">Pérdida Financiera</Typography>
                            </Box>
                            <Box textAlign="center">
                              <Typography variant="heading" size="lg" weight="bold" color="orange.600">
                                -{bottleneck.estimatedImpact.operational}%
                              </Typography>
                              <Typography variant="body" size="xs" color="gray.600">Eficiencia</Typography>
                            </Box>
                            <Box textAlign="center">
                              <Typography variant="heading" size="lg" weight="bold" color="yellow.600">
                                -{bottleneck.estimatedImpact.customer}%
                              </Typography>
                              <Typography variant="body" size="xs" color="gray.600">Satisfacción</Typography>
                            </Box>
                          </SimpleGrid>
                        </CardWrapper.Body>
                      </CardWrapper>

                      {/* Recommendations - Usando Card */}
                      <Stack gap="2">
                        <Typography variant="body" size="sm" weight="semibold">Recomendación:</Typography>
                        {bottleneck.recommendations.map((rec, idx) => (
                          <CardWrapper key={idx} variant="subtle" colorPalette="blue">
                            <CardWrapper.Body>
                              <Typography variant="body" size="md" lineHeight="1.4">{rec.action}</Typography>
                              <Stack direction="row" gap="4" mt="2">
                                <Typography variant="body" size="sm" color="gray.600">
                                  Esfuerzo: <strong>{rec.effort}</strong>
                                </Typography>
                                <Typography variant="body" size="sm" color="gray.600">
                                  Plazo: <strong>{rec.timeframe}</strong>
                                </Typography>
                                <Typography variant="body" size="sm" color="gray.600">
                                  Mejora: <strong>+{rec.expectedImprovement}%</strong>
                                </Typography>
                                <Typography variant="body" size="sm" color="gray.600">
                                  Costo: <strong>${rec.cost}</strong>
                                </Typography>
                              </Stack>
                            </CardWrapper.Body>
                          </CardWrapper>
                        ))}
                      </Stack>

                      {/* Affected Modules - Usando Stack */}
                      <Stack direction="row" wrap="wrap" gap="2">
                        {bottleneck.affectedModules.map((module) => (
                          <Badge key={module} size="sm" colorPalette="blue" variant="subtle">{module}</Badge>
                        ))}
                      </Stack>
                    </Stack>
                  </CardWrapper.Body>
                </CardWrapper>
              ))}
            </Stack>
          </Stack>
        )}

        {/* Resumen de Impacto - Usando Card + SimpleGrid */}
        <CardWrapper variant="elevated" colorPalette="blue">
          <CardWrapper.Body>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
              <Box textAlign="center">
                <Typography variant="heading" size="3xl" weight="bold" color="blue.600">
                  $195K+
                </Typography>
                <Typography variant="body" size="md" color="gray.600">
                  Impacto financiero anual
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="heading" size="3xl" weight="bold" color="green.600">
                  23%
                </Typography>
                <Typography variant="body" size="md" color="gray.600">
                  Mejora promedio eficiencia
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="heading" size="3xl" weight="bold" color="purple.600">
                  6
                </Typography>
                <Typography variant="body" size="md" color="gray.600">
                  Oportunidades identificadas
                </Typography>
              </Box>
            </SimpleGrid>
          </CardWrapper.Body>
        </CardWrapper>
      </Stack>
    </Section>
  );
};

export default CrossModuleInsights;