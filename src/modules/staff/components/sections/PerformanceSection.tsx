// Staff Performance Section - Metrics and scoring system
import { useState } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Select, 
  Badge, 
  Card, 
  SimpleGrid,
  Progress,
  Button,
  Avatar,
  Flex,
  IconButton,
  Stat
} from '@chakra-ui/react';
import { 
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  DocumentTextIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import type { Employee, StaffViewState, PerformanceMetrics, Goal } from '../../types';

interface PerformanceSectionProps {
  viewState: StaffViewState;
  onViewStateChange: (state: StaffViewState) => void;
}

// Mock performance data
const mockPerformanceData: PerformanceMetrics[] = [
  {
    employee_id: 'EMP001',
    period: 'monthly',
    score: 95,
    productivity: 98,
    quality: 92,
    attendance: 100,
    goals_met: 8,
    total_goals: 10,
    feedback: 'Excelente liderazgo y gestión del equipo. Superó expectativas en todas las áreas.',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    employee_id: 'EMP002',
    period: 'monthly',
    score: 88,
    productivity: 90,
    quality: 95,
    attendance: 96,
    goals_met: 7,
    total_goals: 9,
    feedback: 'Consistente en calidad de cocina. Área de mejora: puntualidad.',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    employee_id: 'EMP003',
    period: 'monthly',
    score: 92,
    productivity: 94,
    quality: 88,
    attendance: 94,
    goals_met: 6,
    total_goals: 8,
    feedback: 'Excelente atención al cliente. Mejorando en upselling.',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    employee_id: 'EMP004',
    period: 'monthly',
    score: 78,
    productivity: 75,
    quality: 80,
    attendance: 85,
    goals_met: 4,
    total_goals: 7,
    feedback: 'Progreso constante. Necesita foco en tiempo de preparación.',
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockGoals: Goal[] = [
  {
    id: '1',
    employee_id: 'EMP001',
    title: 'Reducir tiempo promedio de servicio',
    description: 'Optimizar procesos para reducir tiempo de servicio a 15 minutos',
    category: 'performance',
    target_value: 15,
    current_value: 12,
    unit: 'minutos',
    due_date: '2024-02-01',
    status: 'completed',
    priority: 'high',
    created_by: 'HR001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    employee_id: 'EMP002',
    title: 'Aumentar satisfacción del cliente',
    category: 'quality',
    target_value: 95,
    current_value: 88,
    unit: '%',
    due_date: '2024-02-15',
    status: 'active',
    priority: 'high',
    created_by: 'HR001',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-08T00:00:00Z'
  },
  {
    id: '3',
    employee_id: 'EMP003',
    title: 'Completar certificación de vinos',
    category: 'skills',
    target_value: 1,
    current_value: 0.7,
    unit: 'certificación',
    due_date: '2024-03-01',
    status: 'active',
    priority: 'medium',
    created_by: 'HR001',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];

export function PerformanceSection({ viewState, onViewStateChange }: PerformanceSectionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 80) return 'blue';
    if (score >= 70) return 'orange';
    return 'red';
  };

  const getGoalStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return 'green';
      case 'active': return 'blue';
      case 'overdue': return 'red';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const calculateGoalProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getTeamAverages = () => {
    const total = mockPerformanceData.length;
    const avgScore = mockPerformanceData.reduce((sum, p) => sum + p.score, 0) / total;
    const avgProductivity = mockPerformanceData.reduce((sum, p) => sum + p.productivity, 0) / total;
    const avgQuality = mockPerformanceData.reduce((sum, p) => sum + p.quality, 0) / total;
    const avgAttendance = mockPerformanceData.reduce((sum, p) => sum + p.attendance, 0) / total;
    
    return {
      score: Math.round(avgScore),
      productivity: Math.round(avgProductivity),
      quality: Math.round(avgQuality),
      attendance: Math.round(avgAttendance)
    };
  };

  const teamAverages = getTeamAverages();

  return (
    <VStack gap="6" align="stretch">
      {/* Performance Overview Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
        <Card.Root>
          <Card.Body textAlign="center">
            <VStack gap="2">
              <TrophyIcon className="w-8 h-8 text-yellow-500 mx-auto" />
              <Text fontSize="2xl" fontWeight="bold">{teamAverages.score}%</Text>
              <Text fontSize="sm" color="gray.600">Puntuación Promedio</Text>
              <Badge colorPalette={getScoreColor(teamAverages.score)} size="sm">
                Excelente
              </Badge>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body textAlign="center">
            <VStack gap="2">
              <ArrowTrendingUpIcon className="w-8 h-8 text-blue-500 mx-auto" />
              <Text fontSize="2xl" fontWeight="bold">{teamAverages.productivity}%</Text>
              <Text fontSize="sm" color="gray.600">Productividad</Text>
              <Badge colorPalette="blue" size="sm">+5% vs mes anterior</Badge>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body textAlign="center">
            <VStack gap="2">
              <StarIcon className="w-8 h-8 text-purple-500 mx-auto" />
              <Text fontSize="2xl" fontWeight="bold">{teamAverages.quality}%</Text>
              <Text fontSize="sm" color="gray.600">Calidad</Text>
              <Badge colorPalette="purple" size="sm">Estable</Badge>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body textAlign="center">
            <VStack gap="2">
              <ClockIcon className="w-8 h-8 text-green-500 mx-auto" />
              <Text fontSize="2xl" fontWeight="bold">{teamAverages.attendance}%</Text>
              <Text fontSize="sm" color="gray.600">Asistencia</Text>
              <Badge colorPalette="green" size="sm">+2% vs mes anterior</Badge>
            </VStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {/* Period Selector */}
      <HStack justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="semibold">Rendimiento del Equipo</Text>
        <HStack gap="4">
          <Select.Root
            value={[selectedPeriod]}
            onValueChange={(e) => setSelectedPeriod(e.value[0] as any)}
            width="150px"
          >
            <Select.Trigger>
              <Select.ValueText />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="weekly">Semanal</Select.Item>
              <Select.Item value="monthly">Mensual</Select.Item>
              <Select.Item value="quarterly">Trimestral</Select.Item>
            </Select.Content>
          </Select.Root>
          <Button
            size="sm"
            leftIcon={<PlusIcon className="w-4 h-4" />}
            colorPalette="blue"
          >
            Nueva Evaluación
          </Button>
        </HStack>
      </HStack>

      {/* Employee Performance Cards */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
        {mockPerformanceData.map((performance) => (
          <Card.Root key={performance.employee_id} size="sm">
            <Card.Body>
              <VStack align="stretch" gap="4">
                {/* Employee Header */}
                <HStack justify="space-between">
                  <HStack gap="3">
                    <Avatar size="sm" name="Employee" />
                    <VStack align="start" gap="0">
                      <Text fontWeight="semibold">
                        Empleado {performance.employee_id}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Evaluación {selectedPeriod}
                      </Text>
                    </VStack>
                  </HStack>
                  <VStack align="end" gap="0">
                    <Text fontSize="2xl" fontWeight="bold" color={`${getScoreColor(performance.score)}.500`}>
                      {performance.score}%
                    </Text>
                    <Badge colorPalette={getScoreColor(performance.score)} size="sm">
                      {performance.score >= 90 ? 'Excelente' : 
                       performance.score >= 80 ? 'Bueno' :
                       performance.score >= 70 ? 'Regular' : 'Necesita mejora'}
                    </Badge>
                  </VStack>
                </HStack>

                {/* Performance Metrics */}
                <VStack gap="3" align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm">Productividad</Text>
                    <Text fontSize="sm" fontWeight="medium">{performance.productivity}%</Text>
                  </HStack>
                  <Progress.Root 
                    value={performance.productivity} 
                    colorPalette={getScoreColor(performance.productivity)}
                    size="sm"
                  >
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>

                  <HStack justify="space-between">
                    <Text fontSize="sm">Calidad</Text>
                    <Text fontSize="sm" fontWeight="medium">{performance.quality}%</Text>
                  </HStack>
                  <Progress.Root 
                    value={performance.quality} 
                    colorPalette={getScoreColor(performance.quality)}
                    size="sm"
                  >
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>

                  <HStack justify="space-between">
                    <Text fontSize="sm">Asistencia</Text>
                    <Text fontSize="sm" fontWeight="medium">{performance.attendance}%</Text>
                  </HStack>
                  <Progress.Root 
                    value={performance.attendance} 
                    colorPalette={getScoreColor(performance.attendance)}
                    size="sm"
                  >
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                </VStack>

                {/* Goals Progress */}
                <HStack justify="space-between" align="center">
                  <HStack gap="2">
                    <CheckCircleIcon className="w-4 h-4 text-gray-500" />
                    <Text fontSize="sm" color="gray.600">
                      Objetivos: {performance.goals_met}/{performance.total_goals}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="medium">
                    {Math.round((performance.goals_met / performance.total_goals) * 100)}%
                  </Text>
                </HStack>
                <Progress.Root 
                  value={(performance.goals_met / performance.total_goals) * 100}
                  colorPalette="blue"
                  size="sm"
                >
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>

                {/* Feedback */}
                {performance.feedback && (
                  <Box bg="gray.50" p="3" borderRadius="md">
                    <HStack gap="2" mb="2">
                      <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        Feedback
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      {performance.feedback}
                    </Text>
                  </Box>
                )}

                {/* Actions */}
                <HStack gap="2" justify="space-between">
                  <Button size="sm" variant="outline" flex="1">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Ver Detalles
                  </Button>
                  <Button size="sm" variant="outline" flex="1">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Nueva Evaluación
                  </Button>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      {/* Active Goals Section */}
      <Box>
        <HStack justify="space-between" align="center" mb="4">
          <Text fontSize="lg" fontWeight="semibold">Objetivos Activos</Text>
          <Button
            size="sm"
            leftIcon={<PlusIcon className="w-4 h-4" />}
            colorPalette="green"
          >
            Nuevo Objetivo
          </Button>
        </HStack>

        <VStack gap="3" align="stretch">
          {mockGoals
            .filter(goal => goal.status !== 'cancelled')
            .map((goal) => (
            <Card.Root key={goal.id} size="sm">
              <Card.Body>
                <VStack align="stretch" gap="3">
                  <HStack justify="space-between" align="start">
                    <VStack align="start" gap="1" flex="1">
                      <HStack gap="2">
                        <Text fontWeight="semibold">{goal.title}</Text>
                        <Badge colorPalette={getPriorityColor(goal.priority)} size="xs">
                          {goal.priority}
                        </Badge>
                      </HStack>
                      {goal.description && (
                        <Text fontSize="sm" color="gray.600">
                          {goal.description}
                        </Text>
                      )}
                      <HStack gap="4" fontSize="sm" color="gray.500">
                        <Text>Empleado: {goal.employee_id}</Text>
                        <Text>Vence: {new Date(goal.due_date).toLocaleDateString()}</Text>
                      </HStack>
                    </VStack>
                    
                    <VStack align="end" gap="1">
                      <Badge colorPalette={getGoalStatusColor(goal.status)} size="sm">
                        {goal.status === 'completed' ? 'Completado' :
                         goal.status === 'active' ? 'Activo' :
                         goal.status === 'overdue' ? 'Vencido' : 'Cancelado'}
                      </Badge>
                      {goal.status === 'completed' && (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      )}
                      {goal.status === 'overdue' && (
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                      )}
                    </VStack>
                  </HStack>

                  {/* Goal Progress */}
                  <Box>
                    <HStack justify="space-between" mb="1">
                      <Text fontSize="sm">Progreso</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {goal.current_value} / {goal.target_value} {goal.unit}
                      </Text>
                    </HStack>
                    <Progress.Root 
                      value={calculateGoalProgress(goal.current_value, goal.target_value)}
                      colorPalette={
                        goal.status === 'completed' ? 'green' :
                        calculateGoalProgress(goal.current_value, goal.target_value) > 75 ? 'blue' :
                        calculateGoalProgress(goal.current_value, goal.target_value) > 50 ? 'orange' : 'red'
                      }
                      size="sm"
                    >
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                    <Text fontSize="xs" color="gray.500" mt="1">
                      {calculateGoalProgress(goal.current_value, goal.target_value)}% completado
                    </Text>
                  </Box>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </VStack>
      </Box>

      {/* Performance Insights */}
      <Card.Root>
        <Card.Body>
          <VStack align="stretch" gap="4">
            <Text fontSize="lg" fontWeight="semibold">Insights de Rendimiento</Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
              <Box>
                <HStack gap="2" mb="2">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                  <Text fontWeight="medium" color="green.600">Tendencias Positivas</Text>
                </HStack>
                <VStack align="start" gap="1" pl="7">
                  <Text fontSize="sm">• Productividad aumentó 5% este mes</Text>
                  <Text fontSize="sm">• 3 empleados superaron sus objetivos</Text>
                  <Text fontSize="sm">• Asistencia mejoró en todos los departamentos</Text>
                </VStack>
              </Box>

              <Box>
                <HStack gap="2" mb="2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
                  <Text fontWeight="medium" color="orange.600">Áreas de Mejora</Text>
                </HStack>
                <VStack align="start" gap="1" pl="7">
                  <Text fontSize="sm">• 2 empleados necesitan entrenamiento adicional</Text>
                  <Text fontSize="sm">• Tiempo de servicio puede optimizarse</Text>
                  <Text fontSize="sm">• 5 objetivos próximos a vencer</Text>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}