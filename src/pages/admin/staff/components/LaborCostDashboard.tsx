// Labor Cost Dashboard - Real-time labor cost analysis and monitoring
import { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
  SimpleGrid,
  CardWrapper,
  Progress,
  Button,
  Spinner,
  Alert,
  Tabs,
  Icon
} from '@/shared/ui';
import {
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import staffApi, { type LaborCostData, type LaborCostSummary } from '@/services/staff/staffApi';
import { QuickCalculations } from '@/business-logic/shared/FinancialCalculations';

interface LaborCostDashboardProps {
  compact?: boolean;
  showDetails?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export function LaborCostDashboard({ 
  compact = false, 
  showDetails = true, 
  dateRange 
}: LaborCostDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [laborCosts, setLaborCosts] = useState<LaborCostData[]>([]);
  const [costSummary, setCostSummary] = useState<LaborCostSummary | null>(null);
  const [costAnalysis, setCostAnalysis] = useState<any[]>([]);

  // Default date range (current week) - MIGRATED TO DECIMAL PRECISION  
  const defaultDateRange = {
    start: new Date(
      DecimalUtils.subtract(
        DecimalUtils.fromValue(Date.now(), 'financial').toString(),
        DecimalUtils.multiply('7', DecimalUtils.multiply('24', DecimalUtils.multiply('60', DecimalUtils.multiply('60', '1000', 'financial'), 'financial'), 'financial'), 'financial').toString(),
        'financial'
      ).toNumber()
    ).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  };

  const currentDateRange = dateRange || defaultDateRange;

  // Load labor cost data
  useEffect(() => {
    loadLaborCostData();
  }, [currentDateRange.start, currentDateRange.end]);

  const loadLaborCostData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [costs, summary, analysis] = await Promise.all([
        staffApi.calculateLaborCosts(currentDateRange.start, currentDateRange.end),
        staffApi.getLaborCostSummary(currentDateRange.start, currentDateRange.end),
        staffApi.getCostPerHourAnalysis()
      ]);

      setLaborCosts(costs);
      setCostSummary(summary);
      setCostAnalysis(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading labor costs');
    } finally {
      setLoading(false);
    }
  };

  // MIGRATED: Use centralized currency formatting
  // const formatCurrency = (amount: number) => QuickCalculations.QuickCalculations.formatCurrency(amount);

  const getVarianceColor = (percentage: number) => {
    if (percentage > 10) return 'red';
    if (percentage > 5) return 'orange'; 
    if (percentage < -5) return 'green';
    return 'blue';
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 85) return 'green';
    if (score >= 70) return 'blue';
    if (score >= 50) return 'orange';
    return 'red';
  };

  if (loading) {
    return (
      <CardWrapper variant="elevated" padding="md">
        <CardWrapper.Body>
          <VStack gap="4" align="center" py="6">
            <Spinner size="lg" />
            <Text>Calculando costos laborales...</Text>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <Alert.Indicator />
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
      </Alert>
    );
  }

  if (!costSummary) {
    return (
      <CardWrapper variant="elevated" padding="md">
        <CardWrapper.Body>
          <Text textAlign="center" color="gray.500">
            No hay datos de costos disponibles para el período seleccionado
          </Text>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="center" flexWrap="wrap">
        <VStack align="start" gap="1">
          <Text fontSize="lg" fontWeight="semibold">
            Costos Laborales
          </Text>
          <Text fontSize="sm" color="gray.600">
            {costSummary.period}
          </Text>
        </VStack>
        <Button size="sm" variant="outline" onClick={loadLaborCostData}>
          Actualizar
        </Button>
      </HStack>

      {/* Key Metrics */}
      <SimpleGrid columns={{ base: 2, md: compact ? 2 : 4 }} gap="4">
        <CardWrapper variant="elevated" padding="md">
          <CardWrapper.Body textAlign="center">
            <Icon icon={CurrencyDollarIcon} size="lg" color="green.500" />
            <Text fontSize="xl" fontWeight="bold">
              {QuickCalculations.formatCurrency(costSummary.total_actual_cost)}
            </Text>
            <Text fontSize="sm" color="gray.600">Costo Total</Text>
            <HStack gap="1" justify="center" mt="1">
              {costSummary.variance_percentage > 0 ? (
                <Icon icon={ArrowTrendingUpIcon} size="xs" color="red.500" />
              ) : (
                <Icon icon={ArrowTrendingDownIcon} size="xs" color="green.500" />
              )}
              <Text fontSize="xs" color={getVarianceColor(costSummary.variance_percentage)}>
                {costSummary.variance_percentage > 0 ? '+' : ''}{costSummary.variance_percentage.toFixed(1)}%
              </Text>
            </HStack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper variant="elevated" padding="md">
          <CardWrapper.Body textAlign="center">
            <Icon icon={ClockIcon} size="lg" color="blue.500" />
            <Text fontSize="xl" fontWeight="bold">
              {costSummary.total_hours_worked.toFixed(0)}h
            </Text>
            <Text fontSize="sm" color="gray.600">Horas Trabajadas</Text>
            <Text fontSize="xs" color="gray.500" mt="1">
              {QuickCalculations.formatCurrency(costSummary.average_hourly_cost)}/hora prom.
            </Text>
          </CardWrapper.Body>
        </CardWrapper>

        {!compact && (
          <>
            <CardWrapper variant="elevated" padding="md">
              <CardWrapper.Body textAlign="center">
                <Icon icon={ExclamationTriangleIcon} size="lg" color="orange.500" />
                <Text fontSize="xl" fontWeight="bold">
                  {QuickCalculations.formatCurrency(DecimalUtils.abs(costSummary.variance).toNumber())}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {costSummary.variance > 0 ? 'Sobrecosto' : 'Ahorro'}
                </Text>
                <Text fontSize="xs" color="gray.500" mt="1">
                  vs presupuestado
                </Text>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="elevated" padding="md">
              <CardWrapper.Body textAlign="center">
                <Icon icon={CalculatorIcon} size="lg" color="purple.500" />
                <Text fontSize="xl" fontWeight="bold">
                  {costSummary.cost_efficiency_score}
                </Text>
                <Text fontSize="sm" color="gray.600">Eficiencia</Text>
                <Progress 
                  value={costSummary.cost_efficiency_score} 
                  size="sm" 
                  colorPalette={getEfficiencyColor(costSummary.cost_efficiency_score)}
                  mt="1"
                />
              </CardWrapper.Body>
            </CardWrapper>
          </>
        )}
      </SimpleGrid>

      {/* Detailed Analysis */}
      {showDetails && (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value || 'overview')}>
          <Tabs.List>
            <Tabs.Trigger value="overview">Resumen</Tabs.Trigger>
            <Tabs.Trigger value="departments">Por Departamento</Tabs.Trigger>
            <Tabs.Trigger value="employees">Por Empleado</Tabs.Trigger>
            <Tabs.Trigger value="analysis">Análisis</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="overview">
            <VStack gap="4" align="stretch">
              {/* Variance Analysis */}
              <CardWrapper variant="elevated" padding="md">
                <CardWrapper.Body>
                  <Text fontSize="lg" fontWeight="semibold" mb="4">
                    Análisis de Variación
                  </Text>
                  <HStack justify="space-between" align="center" mb="4">
                    <VStack align="start" gap="1">
                      <Text fontSize="sm" color="gray.600">Presupuestado</Text>
                      <Text fontSize="lg" fontWeight="medium">
                        {QuickCalculations.formatCurrency(costSummary.total_scheduled_cost)}
                      </Text>
                    </VStack>
                    <VStack align="center" gap="1">
                      <Text fontSize="sm" color="gray.600">vs</Text>
                      <Badge colorPalette={getVarianceColor(costSummary.variance_percentage)}>
                        {costSummary.variance_percentage > 0 ? '+' : ''}{costSummary.variance_percentage.toFixed(1)}%
                      </Badge>
                    </VStack>
                    <VStack align="end" gap="1">
                      <Text fontSize="sm" color="gray.600">Real</Text>
                      <Text fontSize="lg" fontWeight="medium">
                        {QuickCalculations.formatCurrency(costSummary.total_actual_cost)}
                      </Text>
                    </VStack>
                  </HStack>
                  <Progress 
                    value={DecimalUtils.min(
                      DecimalUtils.fromValue(100, 'financial'),
                      DecimalUtils.calculatePercentage(
                        costSummary.total_actual_cost.toString(),
                        costSummary.total_scheduled_cost.toString()
                      )
                    ).toNumber()}
                    colorPalette={getVarianceColor(costSummary.variance_percentage)}
                  />
                </CardWrapper.Body>
              </CardWrapper>

              {/* Department Breakdown */}
              <CardWrapper variant="elevated" padding="md">
                <CardWrapper.Body>
                  <Text fontSize="lg" fontWeight="semibold" mb="4">
                    Distribución por Departamento
                  </Text>
                  <VStack gap="3" align="stretch">
                    {Object.entries(costSummary.department_breakdown).map(([dept, data]) => (
                      <HStack key={dept} justify="space-between" align="center" p="3" bg="gray.50" borderRadius="md">
                        <VStack align="start" gap="1">
                          <Text fontWeight="medium" textTransform="capitalize">{dept}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {data.employee_count} empleado{data.employee_count > 1 ? 's' : ''} • {data.hours_worked.toFixed(0)}h
                          </Text>
                        </VStack>
                        <VStack align="end" gap="1">
                          <Text fontWeight="medium">
                            {QuickCalculations.formatCurrency(data.actual_cost)}
                          </Text>
                          <Progress 
                            value={data.avg_efficiency * 100} 
                            size="sm" 
                            w="80px"
                            colorPalette={getEfficiencyColor(data.avg_efficiency * 100)}
                          />
                        </VStack>
                      </HStack>
                    ))}
                  </VStack>
                </CardWrapper.Body>
              </CardWrapper>
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="departments">
            <CardWrapper variant="elevated" padding="md">
              <CardWrapper.Body>
                <Text fontSize="lg" fontWeight="semibold" mb="4">
                  Análisis por Departamento
                </Text>
                <VStack gap="4" align="stretch">
                  {costAnalysis.map((dept, index) => (
                    <CardWrapper key={index} variant="flat" padding="md">
                      <CardWrapper.Body>
                        <HStack justify="space-between" align="center">
                          <VStack align="start" gap="2">
                            <Text fontWeight="medium" textTransform="capitalize">{dept.department}</Text>
                            <HStack gap="4">
                              <VStack align="start" gap="0">
                                <Text fontSize="sm" color="gray.600">Costo/Hora</Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {QuickCalculations.formatCurrency(dept.avg_hourly_cost)}
                                </Text>
                              </VStack>
                              <VStack align="start" gap="0">
                                <Text fontSize="sm" color="gray.600">Rendimiento</Text>
                                <Text fontSize="sm" fontWeight="medium">{dept.avg_performance}%</Text>
                              </VStack>
                              <VStack align="start" gap="0">
                                <Text fontSize="sm" color="gray.600">Eficiencia</Text>
                                <Text fontSize="sm" fontWeight="medium">{dept.efficiency_score}/10</Text>
                              </VStack>
                            </HStack>
                          </VStack>
                          <VStack gap="2" align="end">
                            <Badge colorPalette={getEfficiencyColor(dept.efficiency_score * 10)}>
                              {dept.employees} empleado{dept.employees > 1 ? 's' : ''}
                            </Badge>
                            <Text fontSize="sm" color="gray.600">
                              {QuickCalculations.formatCurrency(dept.cost_per_performance_point)}/punto rendimiento
                            </Text>
                          </VStack>
                        </HStack>
                      </CardWrapper.Body>
                    </CardWrapper>
                  ))}
                </VStack>
              </CardWrapper.Body>
            </CardWrapper>
          </Tabs.Content>

          <Tabs.Content value="employees">
            <CardWrapper variant="elevated" padding="md">
              <CardWrapper.Body>
                <Text fontSize="lg" fontWeight="semibold" mb="4">
                  Costos por Empleado
                </Text>
                <Box overflowX="auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Empleado</th>
                        <th className="text-left p-2">Horas</th>
                        <th className="text-left p-2">Costo Total</th>
                        <th className="text-left p-2">Eficiencia</th>
                        <th className="text-left p-2">Costo/Rendimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {laborCosts.slice(0, 10).map((emp, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <VStack align="start" gap="0">
                              <Text fontSize="sm" fontWeight="medium">{emp.name}</Text>
                              <Text fontSize="xs" color="gray.600">{emp.position}</Text>
                            </VStack>
                          </td>
                          <td className="p-2">
                            <VStack align="start" gap="0">
                              <Text fontSize="sm">{emp.hours_worked}h</Text>
                              {emp.overtime_hours > 0 && (
                                <Text fontSize="xs" color="orange.600">
                                  +{emp.overtime_hours}h extra
                                </Text>
                              )}
                            </VStack>
                          </td>
                          <td className="p-2">
                            <Text fontSize="sm" fontWeight="medium">
                              {QuickCalculations.formatCurrency(emp.total_cost)}
                            </Text>
                          </td>
                          <td className="p-2">
                            <Progress 
                              value={emp.efficiency_rating * 100} 
                              size="sm" 
                              w="60px"
                              colorPalette={getEfficiencyColor(emp.efficiency_rating * 100)}
                            />
                          </td>
                          <td className="p-2">
                            <Text fontSize="sm">
                              {QuickCalculations.formatCurrency(emp.cost_per_performance_point)}
                            </Text>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </CardWrapper.Body>
            </CardWrapper>
          </Tabs.Content>

          <Tabs.Content value="analysis">
            <VStack gap="4" align="stretch">
              <CardWrapper variant="elevated" padding="md">
                <CardWrapper.Body>
                  <Text fontSize="lg" fontWeight="semibold" mb="4">
                    Recomendaciones de Optimización
                  </Text>
                  <VStack gap="3" align="stretch">
                    {/* Cost efficiency recommendations */}
                    {costSummary.variance_percentage > 10 && (
                      <Alert status="warning">
                        <Alert.Indicator />
                        <Alert.Title>Alto Sobrecosto</Alert.Title>
                        <Alert.Description>
                          Los costos superan el presupuesto en un {costSummary.variance_percentage.toFixed(1)}%. 
                          Revisar horas extras y eficiencia por departamento.
                        </Alert.Description>
                      </Alert>
                    )}

                    {costSummary.cost_efficiency_score < 70 && (
                      <Alert status="info">
                        <Alert.Indicator />
                        <Alert.Title>Oportunidad de Mejora</Alert.Title>
                        <Alert.Description>
                          El score de eficiencia es {costSummary.cost_efficiency_score}. 
                          Considerar programas de training o redistribución de personal.
                        </Alert.Description>
                      </Alert>
                    )}

                    {costSummary.variance_percentage < -5 && (
                      <Alert status="success">
                        <Alert.Indicator />
                        <Alert.Title>Excelente Control de Costos</Alert.Title>
                        <Alert.Description>
                          Ahorro del {Math.abs(costSummary.variance_percentage).toFixed(1)}% vs presupuesto. 
                          Mantener las prácticas actuales.
                        </Alert.Description>
                      </Alert>
                    )}
                  </VStack>
                </CardWrapper.Body>
              </CardWrapper>
            </VStack>
          </Tabs.Content>
        </Tabs>
      )}
    </VStack>
  );
}