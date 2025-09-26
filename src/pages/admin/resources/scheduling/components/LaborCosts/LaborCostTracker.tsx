// LaborCostTracker - Track and analyze labor costs, overtime, and budget performance
// MIGRATED: Now uses centralized business logic for precise calculations
import { useState, useEffect } from 'react';
import {
  Stack, Button, Badge, SimpleGrid, Typography, Section,
  Icon, MetricCard, CardGrid, CardWrapper,VStack, HStack
} from '@/shared/ui';
import { Progress, Table } from '@chakra-ui/react';
import { QuickCalculations } from '@/business-logic/shared/FinancialCalculations';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import * as TableOperations from '@/business-logic/operations/tableOperations';
import { 
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ClockIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

interface LaborCostTrackerProps {
  weeklyTotal: number;
  overtimeHours: number;
}

interface LaborCostBreakdown {
  position: string;
  regular_hours: number;
  overtime_hours: number;
  regular_pay: number;
  overtime_pay: number;
  total_cost: number;
  budget_allocated: number;
  variance: number;
  variance_percentage: number;
}

interface WeeklyCostSummary {
  week_ending: string;
  total_cost: number;
  budget: number;
  variance: number;
  regular_hours: number;
  overtime_hours: number;
  avg_hourly_rate: number;
}

interface LaborMetrics {
  labor_cost_percentage: number; // % of total revenue
  overtime_percentage: number; // % of total hours
  avg_cost_per_shift: number;
  cost_per_customer_served: number;
  budget_utilization: number;
  efficiency_score: number;
}

type CostPeriod = 'week' | 'month' | 'quarter';
type CostView = 'summary' | 'breakdown' | 'trends' | 'budget';

export function LaborCostTracker({ weeklyTotal, overtimeHours }: LaborCostTrackerProps) {
  const [loading, setLoading] = useState(true);
  const [costBreakdown, setCostBreakdown] = useState<LaborCostBreakdown[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklyCostSummary[]>([]);
  const [metrics, setMetrics] = useState<LaborMetrics>({
    labor_cost_percentage: 0,
    overtime_percentage: 0,
    avg_cost_per_shift: 0,
    cost_per_customer_served: 0,
    budget_utilization: 0,
    efficiency_score: 0
  });

  const [viewState, setViewState] = useState({
    period: 'week' as CostPeriod,
    view: 'summary' as CostView
  });

  // Mock data - will be replaced with API calls
  useEffect(() => {
    const mockCostBreakdown: LaborCostBreakdown[] = [
      {
        position: 'Server',
        regular_hours: 120,
        overtime_hours: 8,
        regular_pay: 2400,
        overtime_pay: 240,
        total_cost: 2640,
        budget_allocated: 2500,
        variance: 140,
        variance_percentage: 5.6
      },
      {
        position: 'Cook',
        regular_hours: 80,
        overtime_hours: 4,
        regular_pay: 2000,
        overtime_pay: 150,
        total_cost: 2150,
        budget_allocated: 2200,
        variance: -50,
        variance_percentage: -2.3
      },
      {
        position: 'Bartender',
        regular_hours: 60,
        overtime_hours: 0,
        regular_pay: 1350,
        overtime_pay: 0,
        total_cost: 1350,
        budget_allocated: 1400,
        variance: -50,
        variance_percentage: -3.6
      },
      {
        position: 'Manager',
        regular_hours: 50,
        overtime_hours: 0,
        regular_pay: 2500,
        overtime_pay: 0,
        total_cost: 2500,
        budget_allocated: 2500,
        variance: 0,
        variance_percentage: 0
      }
    ];

    const mockWeeklySummary: WeeklyCostSummary[] = [
      {
        week_ending: '2024-01-14',
        total_cost: 8200,
        budget: 8600,
        variance: -400,
        regular_hours: 290,
        overtime_hours: 15,
        avg_hourly_rate: 26.89
      },
      {
        week_ending: '2024-01-07',
        total_cost: 8640,
        budget: 8600,
        variance: 40,
        regular_hours: 305,
        overtime_hours: 12,
        avg_hourly_rate: 27.25
      },
      {
        week_ending: '2023-12-31',
        total_cost: 9200,
        budget: 8600,
        variance: 600,
        regular_hours: 315,
        overtime_hours: 20,
        avg_hourly_rate: 27.46
      },
      {
        week_ending: '2023-12-24',
        total_cost: 8100,
        budget: 8600,
        variance: -500,
        regular_hours: 280,
        overtime_hours: 8,
        avg_hourly_rate: 28.12
      }
    ];

    const mockMetrics: LaborMetrics = {
      labor_cost_percentage: 32.5,
      overtime_percentage: 4.2,
      avg_cost_per_shift: 156.25,
      cost_per_customer_served: 12.80,
      budget_utilization: 97.2,
      efficiency_score: 78.5
    };

    setCostBreakdown(mockCostBreakdown);
    setWeeklySummary(mockWeeklySummary);
    setMetrics(mockMetrics);
    setLoading(false);
  }, [weeklyTotal, overtimeHours]);

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'red';
    if (variance < 0) return 'green';
    return 'gray';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return ArrowTrendingUpIcon;
    if (current < previous) return ArrowTrendingDownIcon;
    return null;
  };

  const getTrendColor = (current: number, previous: number, reverse = false) => {
    const isUp = current > previous;
    if (reverse) {
      return isUp ? 'red' : 'green';
    }
    return isUp ? 'green' : 'red';
  };

  const currentWeek = weeklySummary[0];
  const previousWeek = weeklySummary[1];
  
  return (
    <VStack gap="6" align="stretch">
      {/* Key Metrics */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} gap="4">
        <CardWrapper>
          <CardWrapper.Body textAlign="center" py="3">
            <VStack gap="1">
              <Typography fontSize="xl" fontWeight="bold" color="green.500">
                ${weeklyTotal.toLocaleString()}
              </Typography>
              <Typography fontSize="xs" color="gray.600">Weekly Total</Typography>
              {currentWeek && previousWeek && (
                <HStack gap="1" justify="center">
                  {getTrendIcon(currentWeek.total_cost, previousWeek.total_cost) && (
                    <Box as={getTrendIcon(currentWeek.total_cost, previousWeek.total_cost)} 
                         className="w-3 h-3" 
                         color={getTrendColor(currentWeek.total_cost, previousWeek.total_cost, true)} />
                  )}
                  <Typography fontSize="xs" color={getTrendColor(currentWeek.total_cost, previousWeek.total_cost, true)}>
                    {Math.abs(((currentWeek.total_cost - previousWeek.total_cost) / previousWeek.total_cost * 100)).toFixed(1)}%
                  </Typography>
                </HStack>
              )}
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
        
        <CardWrapper>
          <CardWrapper.Body textAlign="center" py="3">
            <VStack gap="1">
              <Typography fontSize="xl" fontWeight="bold" color="orange.500">
                {metrics.labor_cost_percentage}%
              </Typography>
              <Typography fontSize="xs" color="gray.600">of Revenue</Typography>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
        
        <CardWrapper>
          <CardWrapper.Body textAlign="center" py="3">
            <VStack gap="1">
              <Typography fontSize="xl" fontWeight="bold" color="red.500">
                {overtimeHours}h
              </Typography>
              <Typography fontSize="xs" color="gray.600">Overtime</Typography>
              <Typography fontSize="xs" color="gray.500">
                {metrics.overtime_percentage}% of total
              </Typography>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
        
        <CardWrapper>
          <CardWrapper.Body textAlign="center" py="3">
            <VStack gap="1">
              <Typography fontSize="xl" fontWeight="bold" color="blue.500">
                {metrics.budget_utilization}%
              </Typography>
              <Typography fontSize="xs" color="gray.600">Budget Used</Typography>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
        
        <CardWrapper>
          <CardWrapper.Body textAlign="center" py="3">
            <VStack gap="1">
              <Typography fontSize="xl" fontWeight="bold" color="purple.500">
                ${metrics.avg_cost_per_shift}
              </Typography>
              <Typography fontSize="xs" color="gray.600">Avg per Shift</Typography>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
        
        <CardWrapper>
          <CardWrapper.Body textAlign="center" py="3">
            <VStack gap="1">
              <Typography fontSize="xl" fontWeight="bold" color="teal.500">
                ${metrics.cost_per_customer_served}
              </Typography>
              <Typography fontSize="xs" color="gray.600">per Customer</Typography>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
      </SimpleGrid>

      {/* Budget Status Alert */}
      {metrics.budget_utilization > 95 && (
        <CardWrapper bg="red.50" borderColor="red.200">
          <CardWrapper.Body>
            <HStack gap="3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <VStack align="start" gap="1">
                <Typography fontSize="sm" fontWeight="semibold" color="red.700">
                  Budget Alert: {metrics.budget_utilization}% utilized
                </Typography>
                <Typography fontSize="xs" color="red.600">
                  Weekly labor costs are approaching budget limits. Consider optimizing shift schedules.
                </Typography>
              </VStack>
            </HStack>
          </CardWrapper.Body>
        </CardWrapper>
      )}

      {/* View Controls */}
      <CardWrapper>
        <CardWrapper.Body>
          <HStack justify="space-between">
            <HStack gap="4">
              <Box>
                <Typography fontSize="sm" mb="1" fontWeight="medium">Period</Typography>
                <Select.Root 
                  value={viewState.period}
                  onValueChange={(e) => setViewState(prev => ({...prev, period: e.value as CostPeriod}))}
                >
                  <Select.Trigger width="120px">
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="week">Week</Select.Item>
                    <Select.Item value="month">Month</Select.Item>
                    <Select.Item value="quarter">Quarter</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box>
                <Typography fontSize="sm" mb="1" fontWeight="medium">View</Typography>
                <Select.Root 
                  value={viewState.view}
                  onValueChange={(e) => setViewState(prev => ({...prev, view: e.value as CostView}))}
                >
                  <Select.Trigger width="120px">
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="summary">Summary</Select.Item>
                    <Select.Item value="breakdown">Breakdown</Select.Item>
                    <Select.Item value="trends">Trends</Select.Item>
                    <Select.Item value="budget">Budget</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
            </HStack>

            <Button leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}>
              Export Report
            </Button>
          </HStack>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Cost Breakdown by Position */}
      <CardWrapper>
        <CardWrapper.Header>
          <Typography fontSize="lg" fontWeight="semibold">Labor Cost Breakdown by Position</Typography>
        </CardWrapper.Header>
        <CardWrapper.Body p="0">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Position</Table.ColumnHeader>
                <Table.ColumnHeader>Hours</Table.ColumnHeader>
                <Table.ColumnHeader>Regular Pay</Table.ColumnHeader>
                <Table.ColumnHeader>Overtime</Table.ColumnHeader>
                <Table.ColumnHeader>Total Cost</Table.ColumnHeader>
                <Table.ColumnHeader>Budget</Table.ColumnHeader>
                <Table.ColumnHeader>Variance</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {costBreakdown.map(item => (
                <Table.Row key={item.position}>
                  <Table.Cell>
                    <Typography fontWeight="semibold">{item.position}</Typography>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <VStack align="start" gap="0">
                      <Typography fontSize="sm">{item.regular_hours}h regular</Typography>
                      {item.overtime_hours > 0 && (
                        <Typography fontSize="xs" color="orange.600">
                          +{item.overtime_hours}h OT
                        </Typography>
                      )}
                    </VStack>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Typography fontSize="sm">${item.regular_pay.toLocaleString()}</Typography>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Typography fontSize="sm" color={item.overtime_pay > 0 ? 'orange.600' : 'gray.500'}>
                      ${item.overtime_pay.toLocaleString()}
                    </Typography>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Typography fontSize="sm" fontWeight="semibold">
                      ${item.total_cost.toLocaleString()}
                    </Typography>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Typography fontSize="sm">${item.budget_allocated.toLocaleString()}</Typography>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <HStack gap="2">
                      <Typography 
                        fontSize="sm" 
                        fontWeight="semibold"
                        color={getVarianceColor(item.variance)}
                      >
                        ${Math.abs(item.variance).toLocaleString()}
                      </Typography>
                      <Badge 
                        size="sm" 
                        colorPalette={getVarianceColor(item.variance)}
                        variant="subtle"
                      >
                        {item.variance > 0 ? '+' : ''}{item.variance_percentage.toFixed(1)}%
                      </Badge>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
              
              {/* Totals Row */}
              <Table.Row bg="bg.canvas">
                <Table.Cell>
                  <Typography fontWeight="bold">Total</Typography>
                </Table.Cell>
                <Table.Cell>
                  <Typography fontWeight="semibold">
                    {QuickCalculations.formatNumber(
                      costBreakdown.reduce((sum, item) => 
                        DecimalUtils.financial.add(sum, DecimalUtils.financial.add(item.regular_hours, item.overtime_hours)), 0
                      )
                    )}h
                  </Typography>
                </Table.Cell>
                <Table.Cell>
                  <Typography fontWeight="semibold">
                    ${costBreakdown.reduce((sum, item) => sum + item.regular_pay, 0).toLocaleString()}
                  </Typography>
                </Table.Cell>
                <Table.Cell>
                  <Typography fontWeight="semibold">
                    ${costBreakdown.reduce((sum, item) => sum + item.overtime_pay, 0).toLocaleString()}
                  </Typography>
                </Table.Cell>
                <Table.Cell>
                  <Typography fontWeight="bold" fontSize="md">
                    ${costBreakdown.reduce((sum, item) => sum + item.total_cost, 0).toLocaleString()}
                  </Typography>
                </Table.Cell>
                <Table.Cell>
                  <Typography fontWeight="semibold">
                    ${costBreakdown.reduce((sum, item) => sum + item.budget_allocated, 0).toLocaleString()}
                  </Typography>
                </Table.Cell>
                <Table.Cell>
                  <Typography 
                    fontWeight="bold"
                    color={getVarianceColor(costBreakdown.reduce((sum, item) => sum + item.variance, 0))}
                  >
                    ${Math.abs(costBreakdown.reduce((sum, item) => sum + item.variance, 0)).toLocaleString()}
                  </Typography>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Weekly Trends */}
      <CardWrapper>
        <CardWrapper.Header>
          <Typography fontSize="lg" fontWeight="semibold">Weekly Cost Trends</Typography>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
            {weeklySummary.map(week => (
              <CardWrapper key={week.week_ending} size="sm">
                <CardWrapper.Body>
                  <VStack gap="3" align="stretch">
                    <HStack justify="space-between">
                      <VStack align="start" gap="0">
                        <Typography fontSize="sm" color="gray.600">Week ending</Typography>
                        <Typography fontWeight="semibold">
                          {new Date(week.week_ending).toLocaleDateString('es-ES')}
                        </Typography>
                      </VStack>
                      <Badge colorPalette={getVarianceColor(week.variance)} variant="subtle">
                        {week.variance > 0 ? '+' : ''}${Math.abs(week.variance)}
                      </Badge>
                    </HStack>
                    
                    <VStack gap="2" align="stretch">
                      <HStack justify="space-between">
                        <Typography fontSize="sm">Total Cost</Typography>
                        <Typography fontSize="sm" fontWeight="bold">${week.total_cost.toLocaleString()}</Typography>
                      </HStack>
                      <HStack justify="space-between">
                        <Typography fontSize="sm">Budget</Typography>
                        <Typography fontSize="sm">${week.budget.toLocaleString()}</Typography>
                      </HStack>
                      <HStack justify="space-between">
                        <Typography fontSize="sm">Total Hours</Typography>
                        <Typography fontSize="sm">
                          {QuickCalculations.formatNumber(
                            DecimalUtils.financial.add(week.regular_hours, week.overtime_hours)
                          )}h
                        </Typography>
                      </HStack>
                      <HStack justify="space-between">
                        <Typography fontSize="sm">Avg Rate</Typography>
                        <Typography fontSize="sm">${week.avg_hourly_rate.toFixed(2)}/h</Typography>
                      </HStack>
                    </VStack>
                    
                    <Box>
                      <HStack justify="space-between" mb="1">
                        <Typography fontSize="xs" color="gray.600">Budget Utilization</Typography>
                        <Typography fontSize="xs">{((week.total_cost / week.budget) * 100).toFixed(1)}%</Typography>
                      </HStack>
                      <Progress 
                        value={(week.total_cost / week.budget) * 100} 
                        colorPalette={week.total_cost > week.budget ? 'red' : 'green'}
                        size="sm"
                      />
                    </Box>
                  </VStack>
                </CardWrapper.Body>
              </CardWrapper>
            ))}
          </SimpleGrid>
        </CardWrapper.Body>
      </CardWrapper>
    </VStack>
  );
}