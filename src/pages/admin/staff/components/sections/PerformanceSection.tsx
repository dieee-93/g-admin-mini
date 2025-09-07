// Staff Performance Section - Real Analytics with Interactive Charts
import { useState, useEffect } from 'react';
import { 
  VStack, 
  HStack, 
  SimpleGrid,
  Badge,
  Avatar,
  CardWrapper,
  Alert,
  Tabs
} from '@/shared/ui';
import { 
  Box, 
  Text,
  Button,
  Spinner,
  Progress,
  Select
} from '@chakra-ui/react';
import { 
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  StarIcon,
  UserGroupIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
import { useStaffWithLoader } from '@/hooks/useStaffData';
import staffApi from '@/services/staff/staffApi';
import type { StaffViewState } from '../../types';

interface PerformanceSectionProps {
  viewState: StaffViewState;
  onViewStateChange: (state: StaffViewState) => void;
}

// Simple chart components (since we don't have a chart library installed)
function MiniBarChart({ data, color = 'blue' }: { data: number[], color?: string }) {
  const max = Math.max(...data);
  return (
    <HStack gap="1" align="end" h="40px">
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
    </HStack>
  );
}

function SimpleLineChart({ data, label }: { data: any[], label: string }) {
  return (
    <VStack gap="2" align="stretch">
      <Text fontSize="sm" fontWeight="medium" color="gray.600">{label}</Text>
      <Box h="120px" bg="gray.50" borderRadius="md" p="3" position="relative">
        <HStack justify="space-between" align="end" h="full">
          {data.slice(-6).map((item, index) => (
            <VStack key={index} gap="1" align="center" flex="1">
              <Box
                w="20px"
                bg="blue.500"
                borderRadius="sm"
                h={`${Math.max(10, item.avgPerformance)}%`}
              />
              <Text fontSize="xs" color="gray.600">{item.month}</Text>
            </VStack>
          ))}
        </HStack>
      </Box>
    </VStack>
  );
}

export function PerformanceSection({ viewState, onViewStateChange }: PerformanceSectionProps) {
  const { staff, loading: staffLoading } = useStaffWithLoader();
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('6');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Analytics data
  const [departmentPerformance, setDepartmentPerformance] = useState<any[]>([]);
  const [performanceTrends, setPerformanceTrends] = useState<any[]>([]);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);

  // Load analytics data
  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [deptData, trendData, topData] = await Promise.all([
        staffApi.getDepartmentPerformance(),
        staffApi.getPerformanceTrends(parseInt(selectedPeriod)),
        staffApi.getTopPerformers(5)
      ]);

      setDepartmentPerformance(deptData);
      setPerformanceTrends(trendData);
      setTopPerformers(topData);
    } catch (error) {
      console.error('Error loading analytics:', error);
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
      <VStack gap="4" py="8">
        <Spinner size="lg" />
        <Text>Cargando analytics de rendimiento...</Text>
      </VStack>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Header Controls */}
      <HStack justify="space-between" align="center" flexWrap="wrap">
        <Text fontSize="lg" fontWeight="semibold">
          Analytics de Rendimiento
        </Text>
        <HStack gap="4">
          <HStack gap="2">
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
          </HStack>
          <Button size="sm" variant="outline" onClick={loadAnalytics}>
            Actualizar
          </Button>
        </HStack>
      </HStack>

      {/* Overall KPI Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
        <CardWrapper variant="flat" padding="md">
          <CardWrapper.Body textAlign="center">
            <Icon icon={TrophyIcon} size="lg" color="var(--chakra-colors-yellow-500)" style={{marginLeft: 'auto', marginRight: 'auto', marginBottom: '8px'}} />
            <Text fontSize="2xl" fontWeight="bold">{overallMetrics.avgPerformance}%</Text>
            <Text fontSize="sm" color="gray.600">Rendimiento Promedio</Text>
            {performanceTrends.length > 1 && (
              <HStack gap="1" justify="center" mt="1">
                {getPerformanceTrend(
                  performanceTrends[performanceTrends.length - 1]?.avgPerformance || 0,
                  performanceTrends[performanceTrends.length - 2]?.avgPerformance || 0
                ).direction === 'up' ? (
                  <Icon icon={ArrowTrendingUpIcon} size="xs" color="var(--chakra-colors-green-500)" />
                ) : (
                  <Icon icon={ArrowTrendingDownIcon} size="xs" color="var(--chakra-colors-red-500)" />
                )}
                <Text fontSize="xs" color="gray.500">vs mes anterior</Text>
              </HStack>
            )}
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper variant="flat" padding="md">
          <CardWrapper.Body textAlign="center">
            <Icon icon={ClockIcon} size="lg" color="var(--chakra-colors-blue-500)" style={{marginLeft: 'auto', marginRight: 'auto', marginBottom: '8px'}} />
            <Text fontSize="2xl" fontWeight="bold">{overallMetrics.avgAttendance}%</Text>
            <Text fontSize="sm" color="gray.600">Asistencia Promedio</Text>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper variant="flat" padding="md">
          <CardWrapper.Body textAlign="center">
            <Icon icon={StarIcon} size="lg" color="var(--chakra-colors-purple-500)" style={{marginLeft: 'auto', marginRight: 'auto', marginBottom: '8px'}} />
            <Text fontSize="2xl" fontWeight="bold">{overallMetrics.topPerformerCount}</Text>
            <Text fontSize="sm" color="gray.600">Top Performers</Text>
            <Text fontSize="xs" color="gray.500">(≥90% rendimiento)</Text>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper variant="flat" padding="md">
          <CardWrapper.Body textAlign="center">
            <Icon icon={CheckCircleIcon} size="lg" color="var(--chakra-colors-orange-500)" style={{marginLeft: 'auto', marginRight: 'auto', marginBottom: '8px'}} />
            <Text fontSize="2xl" fontWeight="bold">{overallMetrics.needsImprovementCount}</Text>
            <Text fontSize="sm" color="gray.600">Necesita Mejora</Text>
            <Text fontSize="xs" color="gray.500">(&lt;75% rendimiento)</Text>
          </CardWrapper.Body>
        </CardWrapper>
      </SimpleGrid>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value || 'overview')}>
        <Tabs.List>
          <Tabs.Trigger value="overview">Resumen</Tabs.Trigger>
          <Tabs.Trigger value="departments">Departamentos</Tabs.Trigger>
          <Tabs.Trigger value="trends">Tendencias</Tabs.Trigger>
          <Tabs.Trigger value="top-performers">Top Performers</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview">
          <VStack gap="6" align="stretch">
            {/* Performance Trends Chart */}
            <CardWrapper variant="elevated" padding="md">
              <CardWrapper.Body>
                <SimpleLineChart data={performanceTrends} label="Tendencia de Rendimiento" />
              </CardWrapper.Body>
            </CardWrapper>

            {/* Recent Performance Summary */}
            <CardWrapper variant="elevated" padding="md">
              <CardWrapper.Body>
                <Text fontSize="lg" fontWeight="semibold" mb="4">Empleados por Rango de Rendimiento</Text>
                <VStack gap="3" align="stretch">
                  <HStack justify="space-between" align="center">
                    <HStack gap="2">
                      <Box w="3" h="3" bg="green.500" borderRadius="full" />
                      <Text>Excelente (90-100%)</Text>
                    </HStack>
                    <HStack gap="2">
                      <Text fontWeight="medium">{staff.filter(s => s.performance_score >= 90).length}</Text>
                      <Progress 
                        value={(staff.filter(s => s.performance_score >= 90).length / staff.length) * 100}
                        size="sm"
                        w="100px"
                        colorPalette="green"
                      />
                    </HStack>
                  </HStack>

                  <HStack justify="space-between" align="center">
                    <HStack gap="2">
                      <Box w="3" h="3" bg="blue.500" borderRadius="full" />
                      <Text>Bueno (75-89%)</Text>
                    </HStack>
                    <HStack gap="2">
                      <Text fontWeight="medium">{staff.filter(s => s.performance_score >= 75 && s.performance_score < 90).length}</Text>
                      <Progress 
                        value={(staff.filter(s => s.performance_score >= 75 && s.performance_score < 90).length / staff.length) * 100}
                        size="sm"
                        w="100px"
                        colorPalette="blue"
                      />
                    </HStack>
                  </HStack>

                  <HStack justify="space-between" align="center">
                    <HStack gap="2">
                      <Box w="3" h="3" bg="orange.500" borderRadius="full" />
                      <Text>Necesita Mejora (&lt;75%)</Text>
                    </HStack>
                    <HStack gap="2">
                      <Text fontWeight="medium">{staff.filter(s => s.performance_score < 75).length}</Text>
                      <Progress 
                        value={(staff.filter(s => s.performance_score < 75).length / staff.length) * 100}
                        size="sm"
                        w="100px"
                        colorPalette="orange"
                      />
                    </HStack>
                  </HStack>
                </VStack>
              </CardWrapper.Body>
            </CardWrapper>
          </VStack>
        </Tabs.Content>

        <Tabs.Content value="departments">
          <CardWrapper variant="elevated" padding="md">
            <CardWrapper.Body>
              <Text fontSize="lg" fontWeight="semibold" mb="4">Rendimiento por Departamento</Text>
              <VStack gap="4" align="stretch">
                {departmentPerformance.map((dept, index) => (
                  <CardWrapper key={index} variant="flat" padding="sm">
                    <CardWrapper.Body>
                      <HStack justify="space-between" align="center">
                        <VStack align="start" gap="1">
                          <Text fontWeight="medium" textTransform="capitalize">{dept.department}</Text>
                          <Text fontSize="sm" color="gray.600">{dept.employees} empleados</Text>
                        </VStack>
                        <VStack gap="2" align="end">
                          <HStack gap="4">
                            <VStack gap="0" align="center">
                              <Text fontSize="sm" fontWeight="medium">{dept.avgPerformance}%</Text>
                              <Text fontSize="xs" color="gray.500">Rendimiento</Text>
                            </VStack>
                            <VStack gap="0" align="center">
                              <Text fontSize="sm" fontWeight="medium">{dept.avgAttendance}%</Text>
                              <Text fontSize="xs" color="gray.500">Asistencia</Text>
                            </VStack>
                            <VStack gap="0" align="center">
                              <Text fontSize="sm" fontWeight="medium">{dept.efficiency}%</Text>
                              <Text fontSize="xs" color="gray.500">Eficiencia</Text>
                            </VStack>
                          </HStack>
                          <Progress 
                            value={dept.efficiency} 
                            size="sm" 
                            w="200px"
                            colorPalette={dept.efficiency >= 85 ? 'green' : dept.efficiency >= 70 ? 'blue' : 'orange'}
                          />
                        </VStack>
                      </HStack>
                    </CardWrapper.Body>
                  </CardWrapper>
                ))}
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>
        </Tabs.Content>

        <Tabs.Content value="trends">
          <CardWrapper variant="elevated" padding="md">
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
                          <HStack gap="2">
                            <Text>{trend.avgPerformance}%</Text>
                            <Progress value={trend.avgPerformance} size="sm" w="60px" />
                          </HStack>
                        </td>
                        <td className="p-2">
                          <HStack gap="2">
                            <Text>{trend.avgAttendance}%</Text>
                            <Progress value={trend.avgAttendance} size="sm" w="60px" />
                          </HStack>
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
          <CardWrapper variant="elevated" padding="md">
            <CardWrapper.Body>
              <Text fontSize="lg" fontWeight="semibold" mb="4">Top 5 Empleados</Text>
              <VStack gap="4" align="stretch">
                {topPerformers.map((performer, index) => (
                  <CardWrapper key={performer.id} variant="flat" padding="md">
                    <CardWrapper.Body>
                      <HStack justify="space-between" align="center">
                        <HStack gap="3">
                          <Badge colorPalette={index === 0 ? 'yellow' : index === 1 ? 'gray' : 'orange'} size="lg">
                            #{performer.rank}
                          </Badge>
                          <Avatar name={performer.name} size="md" />
                          <VStack align="start" gap="1">
                            <Text fontWeight="semibold">{performer.name}</Text>
                            <Text fontSize="sm" color="gray.600">{performer.position}</Text>
                            <Badge size="sm" colorPalette="blue">
                              {performer.department}
                            </Badge>
                          </VStack>
                        </HStack>
                        <VStack gap="2" align="end">
                          <HStack gap="4">
                            <VStack gap="0" align="center">
                              <Text fontSize="lg" fontWeight="bold" color="green.600">
                                {performer.performance_score}%
                              </Text>
                              <Text fontSize="xs" color="gray.500">Rendimiento</Text>
                            </VStack>
                            <VStack gap="0" align="center">
                              <Text fontSize="sm" fontWeight="medium">
                                {performer.attendance_rate}%
                              </Text>
                              <Text fontSize="xs" color="gray.500">Asistencia</Text>
                            </VStack>
                            <VStack gap="0" align="center">
                              <Text fontSize="sm" fontWeight="medium">
                                {performer.tenure_months}m
                              </Text>
                              <Text fontSize="xs" color="gray.500">Antigüedad</Text>
                            </VStack>
                          </HStack>
                          <Progress 
                            value={performer.efficiency} 
                            size="sm" 
                            w="150px"
                            colorPalette="green"
                          />
                        </VStack>
                      </HStack>
                    </CardWrapper.Body>
                  </CardWrapper>
                ))}
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>
        </Tabs.Content>
      </Tabs>
    </VStack>
  );
}