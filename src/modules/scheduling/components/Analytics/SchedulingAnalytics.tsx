/**
 * Scheduling Analytics Component
 * Advanced analytics and optimization insights for scheduling
 */

import { useState, useEffect } from 'react';
import {
  Button, Badge, Alert, CardWrapper, Tabs, VStack, HStack, Box, SimpleGrid, Progress, Select,
  StatRoot, StatLabel, StatValueText, StatHelpText
} from '@/shared/ui';
import {
  ArrowTrendingDownIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UsersIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

import { notify } from '@/lib/notifications';

import { logger } from '@/lib/logging';
interface SchedulingAnalyticsProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

interface AnalyticsData {
  efficiency: SchedulingEfficiency;
  trends: SchedulingTrends;
  optimization: OptimizationInsights;
  performance: PerformanceMetrics;
}

interface SchedulingEfficiency {
  overall_efficiency: number;
  cost_efficiency: number;
  coverage_efficiency: number;
  overtime_efficiency: number;
  staff_utilization: number;
  
  // Breakdown by position
  position_efficiency: Record<string, number>;
  
  // Time-based efficiency
  time_slot_efficiency: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
}

interface SchedulingTrends {
  labor_cost_trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    weekly_data: { week: string; cost: number }[];
  };
  
  coverage_trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    weekly_data: { week: string; coverage: number }[];
  };
  
  overtime_trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    weekly_data: { week: string; hours: number }[];
  };
  
  staff_satisfaction_trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    score: number;
  };
}

interface OptimizationInsights {
  potential_savings: number;
  optimization_opportunities: OptimizationOpportunity[];
  best_practices: BestPractice[];
  red_flags: RedFlag[];
}

interface OptimizationOpportunity {
  id: string;
  type: 'cost_reduction' | 'coverage_improvement' | 'efficiency_gain';
  title: string;
  description: string;
  potential_impact: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_savings: number;
}

interface BestPractice {
  id: string;
  category: 'scheduling' | 'coverage' | 'cost_management';
  title: string;
  description: string;
  implementation_tip: string;
  priority: 'high' | 'medium' | 'low';
}

interface RedFlag {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation: string;
  affected_area: string;
}

interface PerformanceMetrics {
  schedule_adherence: number;
  shift_fill_rate: number;
  last_minute_changes: number;
  staff_availability_rate: number;
  customer_satisfaction_impact: number;
  
  // Comparative metrics
  vs_last_period: {
    cost: number;
    efficiency: number;
    coverage: number;
  };
  
  // Benchmarking
  industry_comparison: {
    labor_cost_ratio: 'above' | 'at' | 'below';
    efficiency_ranking: number; // percentile
  };
}

export function SchedulingAnalytics({ dateRange }: SchedulingAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState<'efficiency' | 'trends' | 'optimization' | 'performance'>('efficiency');
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, timeFrame]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would call the analytics API
      const mockData: AnalyticsData = {
        efficiency: {
          overall_efficiency: 84.5,
          cost_efficiency: 78.2,
          coverage_efficiency: 91.3,
          overtime_efficiency: 73.1,
          staff_utilization: 87.6,
          position_efficiency: {
            'Server': 89.2,
            'Cook': 82.1,
            'Bartender': 94.3,
            'Host': 76.8
          },
          time_slot_efficiency: {
            morning: 92.1,
            afternoon: 85.7,
            evening: 88.3,
            night: 71.4
          }
        },
        trends: {
          labor_cost_trend: {
            direction: 'up',
            percentage: 8.3,
            weekly_data: [
              { week: '2024-01-01', cost: 12000 },
              { week: '2024-01-08', cost: 12500 },
              { week: '2024-01-15', cost: 13200 },
              { week: '2024-01-22', cost: 13800 }
            ]
          },
          coverage_trend: {
            direction: 'stable',
            percentage: 2.1,
            weekly_data: [
              { week: '2024-01-01', coverage: 87.5 },
              { week: '2024-01-08', coverage: 89.2 },
              { week: '2024-01-15', coverage: 88.7 },
              { week: '2024-01-22', coverage: 90.1 }
            ]
          },
          overtime_trend: {
            direction: 'down',
            percentage: -15.2,
            weekly_data: [
              { week: '2024-01-01', hours: 28 },
              { week: '2024-01-08', hours: 24 },
              { week: '2024-01-15', hours: 19 },
              { week: '2024-01-22', hours: 16 }
            ]
          },
          staff_satisfaction_trend: {
            direction: 'up',
            percentage: 12.4,
            score: 8.2
          }
        },
        optimization: {
          potential_savings: 2400,
          optimization_opportunities: [
            {
              id: '1',
              type: 'cost_reduction',
              title: 'Optimize Night Shift Coverage',
              description: 'Night shifts are overstaffed by 15% on average',
              potential_impact: 'Reduce weekly costs by $400-600',
              difficulty: 'easy',
              estimated_savings: 500
            },
            {
              id: '2',
              type: 'efficiency_gain',
              title: 'Implement Cross-Training',
              description: 'Cross-train servers as bartenders for peak flexibility',
              potential_impact: 'Improve coverage by 12% and reduce overtime',
              difficulty: 'medium',
              estimated_savings: 800
            }
          ],
          best_practices: [
            {
              id: '1',
              category: 'scheduling',
              title: 'Use Historical Data for Forecasting',
              description: 'Your scheduling accuracy could improve by using last 3 months of data',
              implementation_tip: 'Enable predictive scheduling in auto-schedule settings',
              priority: 'high'
            }
          ],
          red_flags: [
            {
              id: '1',
              severity: 'warning',
              title: 'High Last-Minute Schedule Changes',
              description: '23% of shifts were changed within 24 hours last month',
              recommendation: 'Implement stricter scheduling policies and backup coverage',
              affected_area: 'Staff Satisfaction & Operations'
            }
          ]
        },
        performance: {
          schedule_adherence: 92.3,
          shift_fill_rate: 97.8,
          last_minute_changes: 23,
          staff_availability_rate: 89.4,
          customer_satisfaction_impact: 7.8,
          vs_last_period: {
            cost: 8.3,
            efficiency: -2.1,
            coverage: 4.2
          },
          industry_comparison: {
            labor_cost_ratio: 'at',
            efficiency_ranking: 73
          }
        }
      };

      setAnalyticsData(mockData);
      
    } catch (error) {
      logger.error('API', 'Error loading analytics data:', error);
      notify.error({
        title: 'Analytics Error',
        description: 'Failed to load scheduling analytics'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderEfficiencyTab = () => {
    if (!analyticsData) return null;
    const { efficiency } = analyticsData;

    return (
      <VStack align="stretch" gap="6">
        {/* Overall Efficiency Metrics */}
        <SimpleGrid columns={{ base: 2, md: 5 }} gap="4">
          <StatRoot>
            <StatLabel>Overall Efficiency</StatLabel>
            <StatValueText fontSize="2xl" color="blue.500">
              {efficiency.overall_efficiency}%
            </StatValueText>
            <StatHelpText>Scheduling optimization score</StatHelpText>
          </StatRoot>
          
          <StatRoot>
            <StatLabel>Cost Efficiency</StatLabel>
            <StatValueText fontSize="2xl" color="green.500">
              {efficiency.cost_efficiency}%
            </StatValueText>
            <StatHelpText>Budget utilization</StatHelpText>
          </StatRoot>
          
          <StatRoot>
            <StatLabel>Coverage</StatLabel>
            <StatValueText fontSize="2xl" color="purple.500">
              {efficiency.coverage_efficiency}%
            </StatValueText>
            <StatHelpText>Shift coverage rate</StatHelpText>
          </StatRoot>
          
          <StatRoot>
            <StatLabel>Staff Utilization</StatLabel>
            <StatValueText fontSize="2xl" color="orange.500">
              {efficiency.staff_utilization}%
            </StatValueText>
            <StatHelpText>Average utilization</StatHelpText>
          </StatRoot>
          
          <StatRoot>
            <StatLabel>Overtime Control</StatLabel>
            <StatValueText fontSize="2xl" color="red.500">
              {efficiency.overtime_efficiency}%
            </StatValueText>
            <StatHelpText>Overtime management</StatHelpText>
          </StatRoot>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
          {/* Position Efficiency */}
          <CardWrapper>
            <CardWrapper.Header>
              <HStack>
                <UsersIcon className="w-5 h-5" />
                <Text fontWeight="semibold">Efficiency by Position</Text>
              </HStack>
            </CardWrapper.Header>
            <CardWrapper.Body>
              <VStack align="stretch" gap="4">
                {Object.entries(efficiency.position_efficiency).map(([position, score]) => (
                  <Box key={position}>
                    <HStack justify="space-between" mb="2">
                      <Text fontSize="sm">{position}</Text>
                      <Text fontSize="sm" fontWeight="medium" color={score >= 85 ? 'green.500' : score >= 75 ? 'yellow.500' : 'red.500'}>
                        {score}%
                      </Text>
                    </HStack>
                    <Progress value={score} colorPalette={score >= 85 ? 'green' : score >= 75 ? 'yellow' : 'red'} size="sm" />
                  </Box>
                ))}
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>

          {/* Time Slot Efficiency */}
          <CardWrapper>
            <CardWrapper.Header>
              <HStack>
                <ClockIcon className="w-5 h-5" />
                <Text fontWeight="semibold">Efficiency by Time Slot</Text>
              </HStack>
            </CardWrapper.Header>
            <CardWrapper.Body>
              <VStack align="stretch" gap="4">
                {Object.entries(efficiency.time_slot_efficiency).map(([slot, score]) => (
                  <Box key={slot}>
                    <HStack justify="space-between" mb="2">
                      <Text fontSize="sm" textTransform="capitalize">{slot}</Text>
                      <Text fontSize="sm" fontWeight="medium" color={score >= 85 ? 'green.500' : score >= 75 ? 'yellow.500' : 'red.500'}>
                        {score}%
                      </Text>
                    </HStack>
                    <Progress value={score} colorPalette={score >= 85 ? 'green' : score >= 75 ? 'yellow' : 'red'} size="sm" />
                  </Box>
                ))}
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>
        </SimpleGrid>
      </VStack>
    );
  };

  const renderTrendsTab = () => {
    if (!analyticsData) return null;
    const { trends } = analyticsData;

    const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
      if (direction === 'up') return ArrowTrendingUpIcon;
      if (direction === 'down') return ArrowTrendingDownIcon;
      return ArrowPathIcon;
    };

    const getTrendColor = (direction: 'up' | 'down' | 'stable', isGood: boolean) => {
      if (direction === 'stable') return 'blue';
      return (direction === 'up' && isGood) || (direction === 'down' && !isGood) ? 'green' : 'red';
    };

    return (
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
        {/* Labor Cost Trend */}
        <CardWrapper>
          <CardWrapper.Header>
            <HStack>
              <CurrencyDollarIcon className="w-5 h-5" />
              <Text fontWeight="semibold">Labor Cost Trend</Text>
            </HStack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <VStack align="stretch" gap="4">
              <HStack justify="space-between">
                <HStack>
                  {(() => {
                    const TrendIcon = getTrendIcon(trends.labor_cost_trend.direction);
                    return <TrendIcon className={`w-5 h-5 text-${getTrendColor(trends.labor_cost_trend.direction, false)}-500`} />;
                  })()}
                  <Text fontSize="lg" fontWeight="semibold">
                    {trends.labor_cost_trend.percentage > 0 ? '+' : ''}{trends.labor_cost_trend.percentage}%
                  </Text>
                </HStack>
                <Badge colorPalette={getTrendColor(trends.labor_cost_trend.direction, false)}>
                  {trends.labor_cost_trend.direction}
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.600">vs last period</Text>
              {/* Mini chart would go here in a real implementation */}
              <Box h="20" bg="gray.50" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                <Text fontSize="xs" color="gray.500">Cost trend visualization</Text>
              </Box>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>

        {/* Coverage Trend */}
        <CardWrapper>
          <CardWrapper.Header>
            <HStack>
              <CheckCircleIcon className="w-5 h-5" />
              <Text fontWeight="semibold">Coverage Trend</Text>
            </HStack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <VStack align="stretch" gap="4">
              <HStack justify="space-between">
                <HStack>
                  {(() => {
                    const TrendIcon = getTrendIcon(trends.coverage_trend.direction);
                    return <TrendIcon className={`w-5 h-5 text-${getTrendColor(trends.coverage_trend.direction, true)}-500`} />;
                  })()}
                  <Text fontSize="lg" fontWeight="semibold">
                    {trends.coverage_trend.percentage > 0 ? '+' : ''}{trends.coverage_trend.percentage}%
                  </Text>
                </HStack>
                <Badge colorPalette={getTrendColor(trends.coverage_trend.direction, true)}>
                  {trends.coverage_trend.direction}
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.600">vs last period</Text>
              <Box h="20" bg="gray.50" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                <Text fontSize="xs" color="gray.500">Coverage trend visualization</Text>
              </Box>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>

        {/* Overtime Trend */}
        <CardWrapper>
          <CardWrapper.Header>
            <HStack>
              <ClockIcon className="w-5 h-5" />
              <Text fontWeight="semibold">Overtime Trend</Text>
            </HStack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <VStack align="stretch" gap="4">
              <HStack justify="space-between">
                <HStack>
                  {(() => {
                    const TrendIcon = getTrendIcon(trends.overtime_trend.direction);
                    return <TrendIcon className={`w-5 h-5 text-${getTrendColor(trends.overtime_trend.direction, false)}-500`} />;
                  })()}
                  <Text fontSize="lg" fontWeight="semibold">
                    {trends.overtime_trend.percentage > 0 ? '+' : ''}{trends.overtime_trend.percentage}%
                  </Text>
                </HStack>
                <Badge colorPalette={getTrendColor(trends.overtime_trend.direction, false)}>
                  {trends.overtime_trend.direction}
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.600">vs last period</Text>
              <Box h="20" bg="gray.50" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                <Text fontSize="xs" color="gray.500">Overtime trend visualization</Text>
              </Box>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>

        {/* Staff Satisfaction */}
        <CardWrapper>
          <CardWrapper.Header>
            <HStack>
              <UsersIcon className="w-5 h-5" />
              <Text fontWeight="semibold">Staff Satisfaction</Text>
            </HStack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <VStack align="stretch" gap="4">
              <HStack justify="space-between">
                <HStack>
                  {(() => {
                    const TrendIcon = getTrendIcon(trends.staff_satisfaction_trend.direction);
                    return <TrendIcon className={`w-5 h-5 text-${getTrendColor(trends.staff_satisfaction_trend.direction, true)}-500`} />;
                  })()}
                  <Text fontSize="lg" fontWeight="semibold">
                    {trends.staff_satisfaction_trend.score}/10
                  </Text>
                </HStack>
                <Badge colorPalette={getTrendColor(trends.staff_satisfaction_trend.direction, true)}>
                  +{trends.staff_satisfaction_trend.percentage}%
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.600">Current satisfaction score</Text>
              <Progress value={trends.staff_satisfaction_trend.score * 10} colorPalette="green" size="lg" />
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
      </SimpleGrid>
    );
  };

  const renderOptimizationTab = () => {
    if (!analyticsData) return null;
    const { optimization } = analyticsData;

    return (
      <VStack align="stretch" gap="6">
        {/* Potential Savings */}
        <CardWrapper>
          <CardWrapper.Header>
            <HStack justify="space-between">
              <HStack>
                <CurrencyDollarIcon className="w-5 h-5" />
                <Text fontWeight="semibold">Optimization Potential</Text>
              </HStack>
              <Badge colorPalette="green" fontSize="md">
                ${optimization.potential_savings}/week
              </Badge>
            </HStack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Text color="gray.600">
              Based on current patterns, you could save up to ${optimization.potential_savings} per week 
              by implementing the optimization opportunities below.
            </Text>
          </CardWrapper.Body>
        </CardWrapper>

        {/* Opportunities */}
        <CardWrapper>
          <CardWrapper.Header>
            <HStack>
              <LightBulbIcon className="w-5 h-5" />
              <Text fontWeight="semibold">Optimization Opportunities</Text>
            </HStack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <VStack align="stretch" gap="4">
              {optimization.optimization_opportunities.map(opportunity => (
                <Box key={opportunity.id} p="4" border="1px" borderColor="gray.200" borderRadius="md">
                  <HStack justify="space-between" mb="2">
                    <Text fontWeight="medium">{opportunity.title}</Text>
                    <HStack>
                      <Badge colorPalette={opportunity.difficulty === 'easy' ? 'green' : opportunity.difficulty === 'medium' ? 'yellow' : 'red'}>
                        {opportunity.difficulty}
                      </Badge>
                      <Badge colorPalette="blue">
                        ${opportunity.estimated_savings}/week
                      </Badge>
                    </HStack>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" mb="2">
                    {opportunity.description}
                  </Text>
                  <Text fontSize="sm" fontWeight="medium" color="green.600">
                    {opportunity.potential_impact}
                  </Text>
                </Box>
              ))}
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
          {/* Best Practices */}
          <CardWrapper>
            <CardWrapper.Header>
              <HStack>
                <CheckCircleIcon className="w-5 h-5" />
                <Text fontWeight="semibold">Best Practices</Text>
              </HStack>
            </CardWrapper.Header>
            <CardWrapper.Body>
              <VStack align="stretch" gap="3">
                {optimization.best_practices.map(practice => (
                  <Box key={practice.id}>
                    <HStack justify="space-between" mb="1">
                      <Text fontSize="sm" fontWeight="medium">{practice.title}</Text>
                      <Badge size="xs" colorPalette={practice.priority === 'high' ? 'red' : practice.priority === 'medium' ? 'yellow' : 'green'}>
                        {practice.priority}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.600" mb="1">
                      {practice.description}
                    </Text>
                    <Text fontSize="xs" color="blue.600">
                      💡 {practice.implementation_tip}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>

          {/* Red Flags */}
          <CardWrapper>
            <CardWrapper.Header>
              <HStack>
                <ExclamationTriangleIcon className="w-5 h-5" />
                <Text fontWeight="semibold">Issues to Address</Text>
              </HStack>
            </CardWrapper.Header>
            <CardWrapper.Body>
              <VStack align="stretch" gap="3">
                {optimization.red_flags.map(flag => (
                  <Alert key={flag.id} status={flag.severity === 'critical' ? 'error' : 'warning'}>
                    <Alert.Indicator />
                    <Box>
                      <Alert.Title fontSize="sm">{flag.title}</Alert.Title>
                      <Alert.Description fontSize="xs">
                        {flag.description}
                        <br />
                        <Text fontWeight="medium" mt="1">
                          Recommendation: {flag.recommendation}
                        </Text>
                      </Alert.Description>
                    </Box>
                  </Alert>
                ))}
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>
        </SimpleGrid>
      </VStack>
    );
  };

  if (loading) {
    return (
      <Box textAlign="center" py="8">
        <Progress size="xs" isIndeterminate colorPalette="blue" />
        <Text mt="2" color="gray.600">Loading scheduling analytics...</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap="6">
      {/* Header with Controls */}
      <HStack justify="space-between">
        <Text fontSize="xl" fontWeight="semibold">Scheduling Analytics</Text>
        <HStack>
          <Select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value as unknown)} size="sm">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </Select>
          <Button size="sm" variant="outline" onClick={loadAnalyticsData}>
            Refresh
          </Button>
        </HStack>
      </HStack>

      {/* Analytics Tabs */}
      <CardWrapper>
        <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as unknown)}>
          <Tabs.List>
            <Tabs.Trigger value="efficiency">
              <HStack>
                <ChartBarIcon className="w-4 h-4" />
                <Text>Efficiency</Text>
              </HStack>
            </Tabs.Trigger>
            <Tabs.Trigger value="trends">
              <HStack>
                <ArrowTrendingUpIcon className="w-4 h-4" />
                <Text>Trends</Text>
              </HStack>
            </Tabs.Trigger>
            <Tabs.Trigger value="optimization">
              <HStack>
                <LightBulbIcon className="w-4 h-4" />
                <Text>Optimization</Text>
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>

          <Box p="6">
            <Tabs.Content value="efficiency">
              {renderEfficiencyTab()}
            </Tabs.Content>
            <Tabs.Content value="trends">
              {renderTrendsTab()}
            </Tabs.Content>
            <Tabs.Content value="optimization">
              {renderOptimizationTab()}
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </CardWrapper>
    </VStack>
  );
}