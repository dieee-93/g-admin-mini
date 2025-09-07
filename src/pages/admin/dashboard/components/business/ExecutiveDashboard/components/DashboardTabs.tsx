import {
  Box,
  Tabs,
  HStack,
  Text,
  VStack,
  CardWrapper,
  SimpleGrid,
  Badge,
  Progress,
  ProgressTrack,
  ProgressRange,
  Select,
} from '@chakra-ui/react';
import { Icon } from '@/shared/ui';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import type { ExecutiveSummary, StrategicInsight, ExecutiveKPI } from '../../types';
import { KPI_CATEGORY_COLLECTION } from '../../constants';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  summary: ExecutiveSummary | null;
  insights: StrategicInsight[];
  filteredKPIs: ExecutiveKPI[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  getTrendDisplay: (trend: string, changeType?: string) => { icon: any; color: string };
  getPriorityColor: (priority: string) => string;
}

export const DashboardTabs = ({
  activeTab,
  onTabChange,
  summary,
  insights,
  filteredKPIs,
  selectedCategory,
  onCategoryChange,
  getTrendDisplay,
  getPriorityColor,
}: DashboardTabsProps) => {
  return (
    <Tabs.Root value={activeTab} onValueChange={(details) => onTabChange(details.value as any)}>
      <Tabs.List>
        <Tabs.Trigger value="overview">
          <HStack gap={2}>
            <Icon icon={ChartBarIcon} size="sm" />
            <Text>Resumen</Text>
          </HStack>
        </Tabs.Trigger>

        <Tabs.Trigger value="kpis">
          <HStack gap={2}>
            <Icon icon={DocumentChartBarIcon} size="sm" />
            <Text>KPIs</Text>
          </HStack>
        </Tabs.Trigger>

        <Tabs.Trigger value="insights">
          <HStack gap={2}>
            <Icon icon={LightBulbIcon} size="sm" />
            <Text>Insights Estratégicos</Text>
          </HStack>
        </Tabs.Trigger>

        <Tabs.Trigger value="correlations">
          <HStack gap={2}>
            <Icon icon={ArrowTrendingUpIcon} size="sm" />
            <Text>Correlaciones</Text>
          </HStack>
        </Tabs.Trigger>

        <Tabs.Trigger value="actions">
          <HStack gap={2}>
            <Icon icon={CheckCircleIcon} size="sm" />
            <Text>Plan de Acción</Text>
          </HStack>
        </Tabs.Trigger>
      </Tabs.List>

      <Box mt={6}>
        {/* Overview Tab */}
        <Tabs.Content value="overview">
          <VStack gap={6} align="stretch">
            {summary && (
              <>
                {/* Key Highlights */}
                <CardWrapper .Root variant="outline">
                  <CardWrapper .Header>
                    <Text fontSize="lg" fontWeight="bold">🌟 Logros Destacados</Text>
                  </CardWrapper .Header>
                  <CardWrapper .Body>
                    <VStack gap={2} align="stretch">
                      {summary.keyHighlights.map((highlight, index) => (
                        <HStack key={index} gap={3}>
                          <Icon icon={CheckCircleIcon} size="sm" color="green.500" />
                          <Text fontSize="sm">{highlight}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </CardWrapper .Body>
                </CardWrapper .Root>

                {/* Key Concerns */}
                {summary.keyConcerns.length > 0 && (
                  <CardWrapper .Root variant="outline">
                    <CardWrapper .Header>
                      <Text fontSize="lg" fontWeight="bold">⚠️ Áreas de Atención</Text>
                    </CardWrapper .Header>
                    <CardWrapper .Body>
                      <VStack gap={2} align="stretch">
                        {summary.keyConcerns.map((concern, index) => (
                          <HStack key={index} gap={3}>
                            <Icon icon={ExclamationTriangleIcon} size="sm" color="yellow.500" />
                            <Text fontSize="sm">{concern}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </CardWrapper .Body>
                  </CardWrapper .Root>
                )}

                {/* Strategic Recommendations */}
                <CardWrapper .Root variant="outline">
                  <CardWrapper .Header>
                    <Text fontSize="lg" fontWeight="bold">🎯 Recomendaciones Estratégicas</Text>
                  </CardWrapper .Header>
                  <CardWrapper .Body>
                    <VStack gap={2} align="stretch">
                      {summary.strategicRecommendations.map((recommendation, index) => (
                        <HStack key={index} gap={3}>
                          <Icon icon={ArrowUpIcon} size="sm" color="blue.500" />
                          <Text fontSize="sm">{recommendation}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </CardWrapper .Body>
                </CardWrapper .Root>

                {/* Health Scores Grid */}
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                  {/* Financial Health */}
                  <CardWrapper .Root variant="outline">
                    <CardWrapper .Header pb={2}>
                      <HStack justify="space-between">
                        <Text fontSize="md" fontWeight="bold">💰 Salud Financiera</Text>
                        <Badge colorPalette={summary.financialHealth.score > 80 ? 'green' : summary.financialHealth.score > 60 ? 'yellow' : 'red'}>
                          {summary.financialHealth.score}/100
                        </Badge>
                      </HStack>
                    </CardWrapper .Header>
                    <CardWrapper .Body pt={0}>
                      <VStack gap={2} align="stretch">
                        {[
                          { label: 'Ingresos', data: summary.financialHealth.revenue, prefix: '$', suffix: 'K' },
                          { label: 'Rentabilidad', data: summary.financialHealth.profitability, prefix: '', suffix: '%' },
                          { label: 'Costos', data: summary.financialHealth.costs, prefix: '$', suffix: 'K' },
                          { label: 'Flujo de Caja', data: summary.financialHealth.cashFlow, prefix: '$', suffix: 'K' }
                        ].map((item, index) => {
                          const trend = getTrendDisplay(item.data.trend);
                          const TrendIcon = trend.icon;
                          return (
                            <HStack key={index} justify="space-between" fontSize="sm">
                              <Text color="gray.600">{item.label}:</Text>
                              <HStack gap={1}>
                                <Text fontWeight="medium">
                                  {item.prefix}{(item.data.value / (item.suffix === 'K' ? 1000 : 1)).toFixed(item.suffix === '%' ? 1 : 0)}{item.suffix}
                                </Text>
                                <Icon icon={TrendIcon} size="xs" color={`${trend.color}.500`} />
                                <Text fontSize="xs" color={`${trend.color}.600`}>
                                  {item.data.change > 0 ? '+' : ''}{item.data.change.toFixed(1)}%
                                </Text>
                              </HStack>
                            </HStack>
                          );
                        })}
                      </VStack>
                    </CardWrapper .Body>
                  </CardWrapper .Root>

                  {/* Operational Health */}
                  <CardWrapper .Root variant="outline">
                    <CardWrapper .Header pb={2}>
                      <HStack justify="space-between">
                        <Text fontSize="md" fontWeight="bold">⚙️ Eficiencia Operacional</Text>
                        <Badge colorPalette={summary.operationalEfficiency.score > 80 ? 'green' : summary.operationalEfficiency.score > 60 ? 'yellow' : 'red'}>
                          {summary.operationalEfficiency.score}/100
                        </Badge>
                      </HStack>
                    </CardWrapper .Header>
                    <CardWrapper .Body pt={0}>
                      <VStack gap={2} align="stretch">
                        {[
                          { label: 'Eficiencia', data: summary.operationalEfficiency.efficiency },
                          { label: 'Calidad', data: summary.operationalEfficiency.quality },
                          { label: 'Productividad', data: summary.operationalEfficiency.productivity },
                          { label: 'Utilización', data: summary.operationalEfficiency.utilization }
                        ].map((item, index) => {
                          const trend = getTrendDisplay(item.data.trend);
                          const TrendIcon = trend.icon;
                          return (
                            <HStack key={index} justify="space-between" fontSize="sm">
                              <Text color="gray.600">{item.label}:</Text>
                              <HStack gap={1}>
                                <Text fontWeight="medium">{item.data.value.toFixed(1)}%</Text>
                                <Icon icon={TrendIcon} size="xs" color={`${trend.color}.500`} />
                                <Text fontSize="xs" color={`${trend.color}.600`}>
                                  {item.data.change > 0 ? '+' : ''}{item.data.change.toFixed(1)}%
                                </Text>
                              </HStack>
                            </HStack>
                          );
                        })}
                      </VStack>
                    </CardWrapper .Body>
                  </CardWrapper .Root>

                  {/* Market Health */}
                  <CardWrapper .Root variant="outline">
                    <CardWrapper .Header pb={2}>
                      <HStack justify="space-between">
                        <Text fontSize="md" fontWeight="bold">🏪 Posición de Mercado</Text>
                        <Badge colorPalette={summary.marketPosition.score > 80 ? 'green' : summary.marketPosition.score > 60 ? 'yellow' : 'red'}>
                          {summary.marketPosition.score}/100
                        </Badge>
                      </HStack>
                    </CardWrapper .Header>
                    <CardWrapper .Body pt={0}>
                      <VStack gap={2} align="stretch">
                        {[
                          { label: 'Satisfacción Cliente', data: summary.marketPosition.customerSatisfaction, scale: 5 },
                          { label: 'Cuota de Mercado', data: summary.marketPosition.marketShare, scale: 100 },
                          { label: 'Posición Competitiva', data: summary.marketPosition.competitivePosition, scale: 10 },
                          { label: 'Fortaleza de Marca', data: summary.marketPosition.brandStrength, scale: 100 }
                        ].map((item, index) => {
                          const trend = getTrendDisplay(item.data.trend);
                          const TrendIcon = trend.icon;
                          return (
                            <HStack key={index} justify="space-between" fontSize="sm">
                              <Text color="gray.600">{item.label}:</Text>
                              <HStack gap={1}>
                                <Text fontWeight="medium">
                                  {item.data.value.toFixed(1)}{item.scale === 5 ? '/5' : item.scale === 10 ? '/10' : '%'}
                                </Text>
                                <Icon icon={TrendIcon} size="xs" color={`${trend.color}.500`} />
                                <Text fontSize="xs" color={`${trend.color}.600`}>
                                  {item.data.change > 0 ? '+' : ''}{item.data.change.toFixed(1)}%
                                </Text>
                              </HStack>
                            </HStack>
                          );
                        })}
                      </VStack>
                    </CardWrapper .Body>
                  </CardWrapper .Root>
                </SimpleGrid>
              </>
            )}
          </VStack>
        </Tabs.Content>

        {/* KPIs Tab */}
        <Tabs.Content value="kpis">
          <VStack gap={4} align="stretch">
            {/* Filters */}
            <HStack gap={4} flexWrap="wrap">
              <Select.Root
                collection={KPI_CATEGORY_COLLECTION}
                value={[selectedCategory]}
                onValueChange={(details) => onCategoryChange(details.value[0])}
                width="200px"
              >
                <Select.Trigger>
                  <Select.ValueText placeholder="Categoría" />
                </Select.Trigger>
                <Select.Content>
                  {KPI_CATEGORY_COLLECTION.items.map(item => (
                    <Select.Item key={item.value} item={item}>
                      {item.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </HStack>

            {/* KPIs Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
              {filteredKPIs.map((kpi) => {
                const trend = getTrendDisplay(kpi.trend, kpi.changeType);
                const TrendIcon = trend.icon;
                const progressValue = kpi.target ? (kpi.value / kpi.target) * 100 : 0;

                return (
                  <CardWrapper .Root
                    key={kpi.id}
                    variant="outline"
                    bg={kpi.priority === 'critical' ? 'red.25' : 'white'}
                    borderColor={kpi.priority === 'critical' ? 'red.200' : 'gray.200'}
                  >
                    <CardWrapper .Body p={4}>
                      <VStack align="stretch" gap={3}>
                        {/* Header */}
                        <HStack justify="space-between">
                          <VStack align="start" gap={0}>
                            <Text fontSize="sm" fontWeight="bold">{kpi.name}</Text>
                            <Badge
                              colorPalette={getPriorityColor(kpi.priority)}
                              size="xs"
                            >
                              {kpi.priority}
                            </Badge>
                          </VStack>
                          <Icon icon={TrendIcon} size="sm" color={`${trend.color}.500`} />
                        </HStack>

                        {/* Value */}
                        <HStack justify="space-between" align="end">
                          <VStack align="start" gap={0}>
                            <Text fontSize="2xl" fontWeight="bold" color={trend.color === 'green' ? 'green.600' : trend.color === 'red' ? 'red.600' : 'blue.600'}>
                              {kpi.unit === '$' ? '$' : ''}{kpi.value.toLocaleString()}{kpi.unit !== '$' ? kpi.unit : ''}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              Actualizado: {new Date(kpi.lastUpdated).toLocaleDateString()}
                            </Text>
                          </VStack>

                          <VStack align="end" gap={0}>
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              color={kpi.changeType === 'increase' ? 'green.600' : 'red.600'}
                            >
                              {kpi.changeType === 'increase' ? '+' : ''}{kpi.change.toFixed(1)}%
                            </Text>
                            <Text fontSize="xs" color="gray.500">vs anterior</Text>
                          </VStack>
                        </HStack>

                        {/* Progress to Target */}
                        {kpi.target && (
                          <VStack align="stretch" gap={1}>
                            <HStack justify="space-between" fontSize="xs">
                              <Text color="gray.600">Objetivo: {kpi.unit === '$' ? '$' : ''}{kpi.target.toLocaleString()}{kpi.unit !== '$' ? kpi.unit : ''}</Text>
                              <Text color={progressValue >= 100 ? 'green.600' : progressValue >= 80 ? 'yellow.600' : 'red.600'}>
                                {progressValue.toFixed(0)}%
                              </Text>
                            </HStack>
                            <Progress.Root
                              value={Math.min(progressValue, 100)}
                              colorPalette={progressValue >= 100 ? 'green' : progressValue >= 80 ? 'yellow' : 'red'}
                              size="sm"
                            >
                              <ProgressTrack>
                                <ProgressRange />
                              </ProgressTrack>
                            </Progress.Root>
                          </VStack>
                        )}

                        {/* Description */}
                        <Text fontSize="xs" color="gray.600" lineHeight={1.3}>
                          {kpi.description}
                        </Text>
                      </VStack>
                    </CardWrapper .Body>
                  </CardWrapper .Root>
                );
              })}
            </SimpleGrid>
          </VStack>
        </Tabs.Content>

        {/* Strategic Insights Tab */}
        <Tabs.Content value="insights">
          <VStack gap={4} align="stretch">
            {insights.map((insight) => (
              <CardWrapper .Root key={insight.id} variant="outline">
                <CardWrapper .Header>
                  <HStack justify="space-between">
                    <HStack gap={3}>
                      <Box p={2} bg={`${getPriorityColor(insight.priority)}.100`} borderRadius="md">
                        {insight.type === 'opportunity' && <Icon icon={ArrowTrendingUpIcon} size="lg" color={`${getPriorityColor(insight.priority)}.600`} />}
                        {insight.type === 'risk' && <Icon icon={ExclamationTriangleIcon} size="lg" color={`${getPriorityColor(insight.priority)}.600`} />}
                        {insight.type === 'recommendation' && <Icon icon={LightBulbIcon} size="lg" color={`${getPriorityColor(insight.priority)}.600`} />}
                        {insight.type === 'trend' && <Icon icon={ChartBarIcon} size="lg" color={`${getPriorityColor(insight.priority)}.600`} />}
                      </Box>
                      <VStack align="start" gap={0}>
                        <Text fontSize="lg" fontWeight="bold">{insight.title}</Text>
                        <HStack gap={2}>
                          <Badge colorPalette={getPriorityColor(insight.priority)} size="sm">
                            {insight.priority}
                          </Badge>
                          <Badge colorPalette="blue" size="sm">
                            {insight.category}
                          </Badge>
                          {insight.aiGenerated && (
                            <Badge colorPalette="purple" size="sm">
                              🤖 IA
                            </Badge>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>

                    <VStack align="end" gap={0}>
                      <Text fontSize="sm" fontWeight="bold" color="blue.600">
                        {insight.confidence}% confianza
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Impacto: {insight.impact}
                      </Text>
                    </VStack>
                  </HStack>
                </CardWrapper .Header>

                <CardWrapper .Body>
                  <VStack gap={4} align="stretch">
                    <Text fontSize="sm" color="gray.700" lineHeight={1.5}>
                      {insight.description}
                    </Text>

                    {/* Metrics */}
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                      {insight.metrics.map((metric, index) => (
                        <CardWrapper .Root key={index} variant="subtle" size="sm">
                          <CardWrapper .Body p={3} textAlign="center">
                            <Text fontSize="xs" color="gray.600" mb={1}>
                              {metric.name}
                            </Text>
                            <Text
                              fontSize="md"
                              fontWeight="bold"
                              color={metric.trend === 'positive' ? 'green.600' : metric.trend === 'negative' ? 'red.600' : 'blue.600'}
                            >
                              {metric.value}
                            </Text>
                            {metric.change && (
                              <Text
                                fontSize="xs"
                                color={metric.trend === 'positive' ? 'green.600' : metric.trend === 'negative' ? 'red.600' : 'gray.600'}
                              >
                                {metric.change}
                              </Text>
                            )}
                          </CardWrapper .Body>
                        </CardWrapper .Root>
                      ))}
                    </SimpleGrid>

                    {/* Action Items */}
                    {insight.actionItems.length > 0 && (
                      <VStack gap={2} align="stretch">
                        <Text fontSize="sm" fontWeight="medium" color="gray.700">
                          Plan de Acción:
                        </Text>
                        {insight.actionItems.map((action) => (
                          <CardWrapper .Root key={action.id} variant="outline" size="sm">
                            <CardWrapper .Body p={3}>
                              <HStack justify="space-between" align="start">
                                <VStack align="start" gap={1} flex="1">
                                  <Text fontSize="sm" fontWeight="medium">
                                    {action.description}
                                  </Text>
                                  <HStack gap={4} fontSize="xs" color="gray.600">
                                    <Text>👤 {action.owner}</Text>
                                    <Text>💰 {action.estimatedImpact}</Text>
                                    <Text>⏱️ {action.estimatedEffort}</Text>
                                    {action.deadline && <Text>📅 {action.deadline}</Text>}
                                  </HStack>
                                </VStack>

                                <VStack gap={1}>
                                  <Badge
                                    colorPalette={getPriorityColor(action.priority)}
                                    size="sm"
                                  >
                                    {action.priority}
                                  </Badge>
                                  <Badge
                                    colorPalette={action.status === 'completed' ? 'green' : action.status === 'in_progress' ? 'blue' : 'gray'}
                                    size="sm"
                                  >
                                    {action.status === 'completed' ? 'Completado' :
                                     action.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                                  </Badge>
                                </VStack>
                              </HStack>
                            </CardWrapper .Body>
                          </CardWrapper .Root>
                        ))}
                      </VStack>
                    )}

                    {/* Timeline */}
                    <HStack justify="space-between" bg="bg.canvas" p={3} borderRadius="md">
                      <Text fontSize="sm" color="gray.600">
                        <Icon icon={CalendarIcon} size="sm" style={{ display: 'inline', marginRight: '4px' }} />
                        Timeline esperado: {insight.timeline}
                      </Text>
                      <Button size="sm" variant="outline" colorPalette="blue">
                        Ver Detalles
                      </Button>
                    </HStack>
                  </VStack>
                </CardWrapper .Body>
              </CardWrapper .Root>
            ))}
          </VStack>
        </Tabs.Content>

        {/* Correlations Tab */}
        <Tabs.Content value="correlations">
          <CardWrapper .Root variant="subtle">
            <CardWrapper .Body p={8} textAlign="center">
              <Icon icon={ChartBarIcon} size="3xl" color="gray.400" />
              <Text fontSize="lg" fontWeight="medium" mb={2}>
                Análisis de Correlaciones
              </Text>
              <Text color="gray.600">
                Matriz de correlaciones entre KPIs y análisis predictivo de impacto cruzado.
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                * Funcionalidad avanzada disponible en versión completa
              </Text>
            </CardWrapper .Body>
          </CardWrapper .Root>
        </Tabs.Content>

        {/* Action Plans Tab */}
        <Tabs.Content value="actions">
          <VStack gap={4} align="stretch">
            {insights.flatMap(insight => insight.actionItems).map((action) => (
              <CardWrapper .Root key={action.id} variant="outline">
                <CardWrapper .Body p={4}>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" gap={2} flex="1">
                      <Text fontSize="md" fontWeight="bold">
                        {action.description}
                      </Text>

                      <HStack gap={6} fontSize="sm" color="gray.600">
                        <HStack gap={1}>
                          <Icon icon={UsersIcon} size="sm" />
                          <Text>{action.owner}</Text>
                        </HStack>
                        <HStack gap={1}>
                          <Icon icon={CurrencyDollarIcon} size="sm" />
                          <Text>{action.estimatedImpact}</Text>
                        </HStack>
                        <HStack gap={1}>
                          <Icon icon={ClockIcon} size="sm" />
                          <Text>{action.estimatedEffort}</Text>
                        </HStack>
                        {action.deadline && (
                          <HStack gap={1}>
                            <Icon icon={CalendarIcon} size="sm" />
                            <Text>{action.deadline}</Text>
                          </HStack>
                        )}
                      </HStack>
                    </VStack>

                    <VStack gap={2} align="end">
                      <Badge
                        colorPalette={getPriorityColor(action.priority)}
                      >
                        {action.priority}
                      </Badge>
                      <Badge
                        colorPalette={action.status === 'completed' ? 'green' : action.status === 'in_progress' ? 'blue' : 'gray'}
                      >
                        {action.status === 'completed' ? 'Completado' :
                         action.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Actualizar Estado
                      </Button>
                    </VStack>
                  </HStack>
                </CardWrapper .Body>
              </CardWrapper .Root>
            ))}
          </VStack>
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  );
};
