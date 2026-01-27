// Staff Performance Section - Real Analytics with Interactive Charts
import { useState, useEffect } from 'react';
import {
  Stack,
  SimpleGrid,
  Badge,
  Avatar,
  CardWrapper,
  Tabs,
  Box,
  Text,
  Button,
  Spinner,
  Progress,
  Icon
} from '@/shared/ui';
import {
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useStaffWithLoader } from '@/modules/team/hooks';
import { getDepartmentPerformance, getPerformanceTrends, getTopPerformers } from '@/modules/team/services';
import type { StaffViewState } from '../../types';
import { logger } from '@/lib/logging';

// Performance data types
interface PerformanceTrend {
  month: string;
  avgPerformance: number;
  avgAttendance: number;
  employeeCount: number;
  turnoverRate: number;
}

interface DepartmentPerformance {
  department: string;
  teamMembers: number;
  avgPerformance: number;
  avgAttendance: number;
  efficiency: number;
}

interface TopPerformer {
  id: string;
  name: string;
  position: string;
  department: string;
  performance_score: number;
  attendance_rate: number;
  tenure_months: number;
  efficiency: number;
  rank: number;
}

interface PerformanceSectionProps {
  viewState: StaffViewState;
  onViewStateChange: (state: StaffViewState) => void;
}

// TODO: Implement MiniBarChart when chart visualization is needed
// TODO: Implement Select dropdown for period filtering UI

// Simple chart components (since we don't have a chart library installed)
function MiniBarChart({ data, color = 'blue' }: { data: number[], color?: string }) {
  const max = Math.max(...data);
  return (
    <Stack direction="row" gap="1" align="end" h="40px">
      {data.map((value, index) => (
        <Box
          key={index}
          w="8px"
          h={`${(value / max) * 100}%`}
          bg={`${color}.500`}
          borderRadius="sm"
          minH="4px"
        />
      ))}
    </Stack>
  );
}

function SimpleLineChart({ data, label }: { data: PerformanceTrend[], label: string }) {
  return (
    <Stack direction="column" gap="2" align="stretch">
      <Text fontSize="sm" fontWeight="medium" color="gray.600">{label}</Text>
      <Box h="120px" bg="gray.50" borderRadius="md" p="3" position="relative">
        <Stack direction="row" justify="space-between" align="end" h="full">
          {data.slice(-6).map((item, index) => (
            <Stack direction="column" key={index} gap="1" align="center" flex="1">
              <Box
                w="20px"
                bg="blue.500"
                borderRadius="sm"
                h={`${Math.max(10, item.avgPerformance)}%`}
              />
              <Text fontSize="xs" color="gray.600">{item.month}</Text>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

export function PerformanceSection({ viewState: _viewState, onViewStateChange: _onViewStateChange }: PerformanceSectionProps) {
  const { staff, loading: staffLoading } = useStaffWithLoader();
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('6');
  const [activeTab, setActiveTab] = useState('overview');

  // Analytics data
  const [departmentPerformance, setDepartmentPerformance] = useState<DepartmentPerformance[]>([]);
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);

  // Load analytics data
  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [deptData, trendData, topData] = await Promise.all([
        getDepartmentPerformance(),
        getPerformanceTrends(parseInt(selectedPeriod)),
        getTopPerformers(5)
      ]);

      setDepartmentPerformance(deptData);
      setPerformanceTrends(trendData);
      setTopPerformers(topData);
    } catch (error) {
      logger.error('StaffStore', 'Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall metrics
  const overallMetrics = {
    avgPerformance: staff.length > 0
      ? Math.round(staff.reduce((sum, s) => sum + s.performance_score, 0) / staff.length)
      : 0,
    avgAttendance: staff.length > 0
      ? Math.round(staff.reduce((sum, s) => sum + s.attendance_rate, 0) / staff.length)
      : 0,
    topPerformerCount: staff.filter(s => s.performance_score >= 90).length,
    needsImprovementCount: staff.filter(s => s.performance_score < 75).length
  };

  // Get performance trend
  const getPerformanceTrend = (current: number, previous: number) => {
    const diff = current - previous;
    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
      value: Math.abs(diff),
      color: diff > 0 ? 'green' : diff < 0 ? 'red' : 'gray'
    };
  };

  if (staffLoading || loading) {
    return (
      <Stack direction="column" gap="4" py="8">
        <Spinner size="lg" />
        <Text>Cargando analytics de rendimiento...</Text>
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap="6" align="stretch">
      {/* Header Controls */}
      <Stack direction="row" justify="space-between" align="center" flexWrap="wrap">
        <Text fontSize="lg" fontWeight="semibold">
          Analytics de Rendimiento
        </Text>
        <Stack direction="row" gap="4">
          <Stack direction="row" gap="2">
            <Text fontSize="sm" color="gray.600">Período:</Text>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="3">3 meses</option>
              <option value="6">6 meses</option>
              <option value="12">12 meses</option>
            </select>
          </Stack>
          <Button size="sm" variant="outline" onClick={loadAnalytics}>
            Actualizar
          </Button>
        </Stack>
      </Stack>

      {/* Overall KPI Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
        <CardWrapper variant="outline">
          <CardWrapper.Body textAlign="center">
            <Icon icon={TrophyIcon} size="lg" color="var(--chakra-colors-yellow-500)" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: '8px' }} />
            <Text fontSize="2xl" fontWeight="bold">{overallMetrics.avgPerformance}%</Text>
            <Text fontSize="sm" color="gray.600">Rendimiento Promedio</Text>
            {performanceTrends.length > 1 && (
              <Stack direction="row" gap="1" justify="center" mt="1">
                {getPerformanceTrend(
                  performanceTrends[performanceTrends.length - 1]?.avgPerformance || 0,
                  performanceTrends[performanceTrends.length - 2]?.avgPerformance || 0
                ).direction === 'up' ? (
                  <Icon icon={ArrowTrendingUpIcon} size="xs" color="var(--chakra-colors-green-500)" />
                ) : (
                  <Icon icon={ArrowTrendingDownIcon} size="xs" color="var(--chakra-colors-red-500)" />
                )}
                <Text fontSize="xs" color="gray.500">vs mes anterior</Text>
              </Stack>
            )}
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper variant="outline">
          <CardWrapper.Body textAlign="center">
            <Icon icon={ClockIcon} size="lg" color="var(--chakra-colors-blue-500)" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: '8px' }} />
            <Text fontSize="2xl" fontWeight="bold">{overallMetrics.avgAttendance}%</Text>
            <Text fontSize="sm" color="gray.600">Asistencia Promedio</Text>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper variant="outline">
          <CardWrapper.Body textAlign="center">
            <Icon icon={StarIcon} size="lg" color="var(--chakra-colors-purple-500)" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: '8px' }} />
            <Text fontSize="2xl" fontWeight="bold">{overallMetrics.topPerformerCount}</Text>
            <Text fontSize="sm" color="gray.600">Top Performers</Text>
            <Text fontSize="xs" color="gray.500">(≥90% rendimiento)</Text>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper variant="outline">
          <CardWrapper.Body textAlign="center">
            <Icon icon={CheckCircleIcon} size="lg" color="var(--chakra-colors-orange-500)" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: '8px' }} />
            <Text fontSize="2xl" fontWeight="bold">{overallMetrics.needsImprovementCount}</Text>
            <Text fontSize="sm" color="gray.600">Necesita Mejora</Text>
            <Text fontSize="xs" color="gray.500">(&lt;75% rendimiento)</Text>
          </CardWrapper.Body>
        </CardWrapper>
      </SimpleGrid>

      {/* Analytics Tabs */}
      <Tabs.Root 
        value={activeTab} 
        onValueChange={(details) => setActiveTab(details.value || 'overview')}
        variant="enclosed"
        size="lg"
      >
        <Tabs.List>
          <Tabs.Trigger value="overview">Resumen</Tabs.Trigger>
          <Tabs.Trigger value="departments">Departamentos</Tabs.Trigger>
          <Tabs.Trigger value="trends">Tendencias</Tabs.Trigger>
          <Tabs.Trigger value="top-performers">Top Performers</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>

        <Tabs.Content value="overview">
          <Stack direction="column" gap="6" align="stretch">
            {/* Performance Trends Chart */}
            <CardWrapper variant="elevated">
              <CardWrapper.Body>
                <SimpleLineChart data={performanceTrends} label="Tendencia de Rendimiento" />
              </CardWrapper.Body>
            </CardWrapper>

            {/* Recent Performance Summary */}
            <CardWrapper variant="elevated">
              <CardWrapper.Body>
                <Text fontSize="lg" fontWeight="semibold" mb="4">Empleados por Rango de Rendimiento</Text>
                <Stack direction="column" gap="3" align="stretch">
                  <Stack direction="row" justify="space-between" align="center">
                    <Stack direction="row" gap="2">
                      <Box w="3" h="3" bg="green.500" borderRadius="full" />
                      <Text>Excelente (90-100%)</Text>
                    </Stack>
                    <Stack direction="row" gap="2">
                      <Text fontWeight="medium">{staff.filter(s => s.performance_score >= 90).length}</Text>
                      <Progress
                        value={(staff.filter(s => s.performance_score >= 90).length / staff.length) * 100}
                        size="sm"
                        w="100px"
                        colorPalette="green"
                      />
                    </Stack>
                  </Stack>

                  <Stack direction="row" justify="space-between" align="center">
                    <Stack direction="row" gap="2">
                      <Box w="3" h="3" bg="blue.500" borderRadius="full" />
                      <Text>Bueno (75-89%)</Text>
                    </Stack>
                    <Stack direction="row" gap="2">
                      <Text fontWeight="medium">{staff.filter(s => s.performance_score >= 75 && s.performance_score < 90).length}</Text>
                      <Progress
                        value={(staff.filter(s => s.performance_score >= 75 && s.performance_score < 90).length / staff.length) * 100}
                        size="sm"
                        w="100px"
                        colorPalette="blue"
                      />
                    </Stack>
                  </Stack>

                  <Stack direction="row" justify="space-between" align="center">
                    <Stack direction="row" gap="2">
                      <Box w="3" h="3" bg="orange.500" borderRadius="full" />
                      <Text>Necesita Mejora (&lt;75%)</Text>
                    </Stack>
                    <Stack direction="row" gap="2">
                      <Text fontWeight="medium">{staff.filter(s => s.performance_score < 75).length}</Text>
                      <Progress
                        value={(staff.filter(s => s.performance_score < 75).length / staff.length) * 100}
                        size="sm"
                        w="100px"
                        colorPalette="orange"
                      />
                    </Stack>
                  </Stack>
                </Stack>
              </CardWrapper.Body>
            </CardWrapper>
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="departments">
          <CardWrapper variant="elevated">
            <CardWrapper.Body>
              <Text fontSize="lg" fontWeight="semibold" mb="4">Rendimiento por Departamento</Text>
              <Stack direction="column" gap="4" align="stretch">
                {departmentPerformance.map((dept, index) => (
                  <CardWrapper key={index} variant="outline">
                    <CardWrapper.Body>
                      <Stack direction="row" justify="space-between" align="center">
                        <Stack direction="column" align="start" gap="1">
                          <Text fontWeight="medium" textTransform="capitalize">{dept.department}</Text>
                          <Text fontSize="sm" color="gray.600">{dept.teamMembers} empleados</Text>
                        </Stack>
                        <Stack direction="column" gap="2" align="end">
                          <Stack direction="row" gap="4">
                            <Stack direction="column" gap="0" align="center">
                              <Text fontSize="sm" fontWeight="medium">{dept.avgPerformance}%</Text>
                              <Text fontSize="xs" color="gray.500">Rendimiento</Text>
                            </Stack>
                            <Stack direction="column" gap="0" align="center">
                              <Text fontSize="sm" fontWeight="medium">{dept.avgAttendance}%</Text>
                              <Text fontSize="xs" color="gray.500">Asistencia</Text>
                            </Stack>
                            <Stack direction="column" gap="0" align="center">
                              <Text fontSize="sm" fontWeight="medium">{dept.efficiency}%</Text>
                              <Text fontSize="xs" color="gray.500">Eficiencia</Text>
                            </Stack>
                          </Stack>
                          <Progress
                            value={dept.efficiency}
                            size="sm"
                            w="200px"
                            colorPalette={dept.efficiency >= 85 ? 'green' : dept.efficiency >= 70 ? 'blue' : 'orange'}
                          />
                        </Stack>
                      </Stack>
                    </CardWrapper.Body>
                  </CardWrapper>
                ))}
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>
        </Tabs.Content>

        <Tabs.Content value="trends">
          <CardWrapper variant="elevated">
            <CardWrapper.Body>
              <Text fontSize="lg" fontWeight="semibold" mb="4">Tendencias de Rendimiento</Text>
              <Box overflowX="auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Mes</th>
                      <th className="text-left p-2">Rendimiento Promedio</th>
                      <th className="text-left p-2">Asistencia</th>
                      <th className="text-left p-2">Empleados</th>
                      <th className="text-left p-2">Rotación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceTrends.slice(-6).map((trend, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">{trend.month}</td>
                        <td className="p-2">
                          <Stack direction="row" gap="2">
                            <Text>{trend.avgPerformance}%</Text>
                            <Progress value={trend.avgPerformance} size="sm" w="60px" />
                          </Stack>
                        </td>
                        <td className="p-2">
                          <Stack direction="row" gap="2">
                            <Text>{trend.avgAttendance}%</Text>
                            <Progress value={trend.avgAttendance} size="sm" w="60px" />
                          </Stack>
                        </td>
                        <td className="p-2">{trend.employeeCount}</td>
                        <td className="p-2">{trend.turnoverRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardWrapper.Body>
          </CardWrapper>
        </Tabs.Content>

        <Tabs.Content value="top-performers">
          <CardWrapper variant="elevated">
            <CardWrapper.Body>
              <Text fontSize="lg" fontWeight="semibold" mb="4">Top 5 Empleados</Text>
              <Stack direction="column" gap="4" align="stretch">
                {topPerformers.map((performer, index) => (
                  <CardWrapper key={performer.id} variant="outline">
                    <CardWrapper.Body>
                      <Stack direction="row" justify="space-between" align="center">
                        <Stack direction="row" gap="3">
                          <Badge colorPalette={index === 0 ? 'yellow' : index === 1 ? 'gray' : 'orange'} size="lg">
                            #{performer.rank}
                          </Badge>
                          <Avatar name={performer.name} size="md" />
                          <Stack direction="column" align="start" gap="1">
                            <Text fontWeight="semibold">{performer.name}</Text>
                            <Text fontSize="sm" color="gray.600">{performer.position}</Text>
                            <Badge size="sm" colorPalette="blue">
                              {performer.department}
                            </Badge>
                          </Stack>
                        </Stack>
                        <Stack direction="column" gap="2" align="end">
                          <Stack direction="row" gap="4">
                            <Stack direction="column" gap="0" align="center">
                              <Text fontSize="lg" fontWeight="bold" color="green.600">
                                {performer.performance_score}%
                              </Text>
                              <Text fontSize="xs" color="gray.500">Rendimiento</Text>
                            </Stack>
                            <Stack direction="column" gap="0" align="center">
                              <Text fontSize="sm" fontWeight="medium">
                                {performer.attendance_rate}%
                              </Text>
                              <Text fontSize="xs" color="gray.500">Asistencia</Text>
                            </Stack>
                            <Stack direction="column" gap="0" align="center">
                              <Text fontSize="sm" fontWeight="medium">
                                {performer.tenure_months}m
                              </Text>
                              <Text fontSize="xs" color="gray.500">Antigüedad</Text>
                            </Stack>
                          </Stack>
                          <Progress
                            value={performer.efficiency}
                            size="sm"
                            w="150px"
                            colorPalette="green"
                          />
                        </Stack>
                      </Stack>
                    </CardWrapper.Body>
                  </CardWrapper>
                ))}
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>
        </Tabs.Content>
      </Tabs.Root>
    </Stack>
  );
}