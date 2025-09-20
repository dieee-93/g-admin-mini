// Staff Training Section - Records and certifications management
import { useState } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Select, 
  Badge, 
  SimpleGrid,
  Progress,
  Button,
  Avatar,
  IconButton,
  Tabs,
  Textarea,
  createListCollection
} from '@chakra-ui/react';
import { 
  AcademicCapIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  TrophyIcon,
  PlayCircleIcon,
  PauseCircleIcon
} from '@heroicons/react/24/outline';
import { Icon, InputField, CardWrapper } from '@/shared/ui';
import type { Employee, StaffViewState, TrainingRecord } from '../../types';

interface TrainingSectionProps {
  viewState: StaffViewState;
  onViewStateChange: (state: StaffViewState) => void;
}

// Mock training records
const mockTrainingRecords: TrainingRecord[] = [
  {
    id: '1',
    employee_id: 'EMP001',
    course_name: 'Liderazgo y Gestión de Equipos',
    course_type: 'leadership',
    status: 'completed',
    start_date: '2023-11-01',
    completion_date: '2023-11-15',
    score: 95,
    certificate_url: '/certificates/emp001-leadership.pdf',
    hours: 16,
    instructor: 'Dr. María González',
    created_at: '2023-11-01T09:00:00Z'
  },
  {
    id: '2',
    employee_id: 'EMP001',
    course_name: 'Seguridad Alimentaria Avanzada',
    course_type: 'safety',
    status: 'completed',
    start_date: '2023-10-01',
    completion_date: '2023-10-05',
    expiry_date: '2024-10-05',
    score: 98,
    certificate_url: '/certificates/emp001-food-safety.pdf',
    hours: 8,
    instructor: 'Chef Roberto Martín',
    created_at: '2023-10-01T09:00:00Z'
  },
  {
    id: '3',
    employee_id: 'EMP002',
    course_name: 'Gestión de Cocina Profesional',
    course_type: 'skills',
    status: 'completed',
    start_date: '2023-09-15',
    completion_date: '2023-10-15',
    score: 88,
    certificate_url: '/certificates/emp002-kitchen-mgmt.pdf',
    hours: 24,
    instructor: 'Chef Andrea López',
    created_at: '2023-09-15T09:00:00Z'
  },
  {
    id: '4',
    employee_id: 'EMP002',
    course_name: 'Primeros Auxilios',
    course_type: 'safety',
    status: 'in_progress',
    start_date: '2024-01-08',
    hours: 12,
    instructor: 'Dr. Carlos Ruiz',
    created_at: '2024-01-08T09:00:00Z'
  },
  {
    id: '5',
    employee_id: 'EMP003',
    course_name: 'Servicio al Cliente Excepcional',
    course_type: 'skills',
    status: 'completed',
    start_date: '2023-12-01',
    completion_date: '2023-12-10',
    score: 92,
    hours: 12,
    instructor: 'Lic. Ana Fernández',
    created_at: '2023-12-01T09:00:00Z'
  },
  {
    id: '6',
    employee_id: 'EMP003',
    course_name: 'Sommelier Básico',
    course_type: 'skills',
    status: 'in_progress',
    start_date: '2024-01-05',
    hours: 20,
    instructor: 'Sommelier Diego Vega',
    created_at: '2024-01-05T09:00:00Z'
  },
  {
    id: '7',
    employee_id: 'EMP004',
    course_name: 'Seguridad Alimentaria Básica',
    course_type: 'safety',
    status: 'expired',
    start_date: '2022-06-01',
    completion_date: '2022-06-05',
    expiry_date: '2023-06-05',
    score: 85,
    hours: 8,
    instructor: 'Chef Roberto Martín',
    created_at: '2022-06-01T09:00:00Z'
  }
];

// Available courses catalog
const courseCatalog = [
  {
    id: 'safety-basic',
    name: 'Seguridad Alimentaria Básica',
    type: 'safety',
    hours: 8,
    description: 'Fundamentos de manipulación segura de alimentos',
    required: true,
    validity_months: 12
  },
  {
    id: 'safety-advanced',
    name: 'Seguridad Alimentaria Avanzada',
    type: 'safety',
    hours: 16,
    description: 'Procedimientos avanzados HACCP y gestión de riesgos',
    required: false,
    validity_months: 24
  },
  {
    id: 'customer-service',
    name: 'Servicio al Cliente Excepcional',
    type: 'skills',
    hours: 12,
    description: 'Técnicas avanzadas de atención y satisfacción del cliente',
    required: false,
    validity_months: null
  },
  {
    id: 'leadership',
    name: 'Liderazgo y Gestión de Equipos',
    type: 'leadership',
    hours: 16,
    description: 'Desarrollo de habilidades de liderazgo y gestión',
    required: false,
    validity_months: null
  },
  {
    id: 'first-aid',
    name: 'Primeros Auxilios',
    type: 'safety',
    hours: 12,
    description: 'Respuesta a emergencias médicas básicas',
    required: true,
    validity_months: 24
  }
];

export function TrainingSection({ viewState, onViewStateChange }: TrainingSectionProps) {
  const [activeTab, setActiveTab] = useState<'records' | 'catalog' | 'schedule'>('records');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const getStatusColor = (status: TrainingRecord['status']) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'expired': return 'red';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getTypeColor = (type: TrainingRecord['course_type']) => {
    switch (type) {
      case 'safety': return 'red';
      case 'skills': return 'blue';
      case 'compliance': return 'orange';
      case 'leadership': return 'purple';
      default: return 'gray';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'gray';
    if (score >= 90) return 'green';
    if (score >= 80) return 'blue';
    if (score >= 70) return 'orange';
    return 'red';
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffInDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 30 && diffInDays > 0;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  const filteredRecords = mockTrainingRecords.filter(record => {
    const matchesEmployee = selectedEmployee === 'all' || record.employee_id === selectedEmployee;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    return matchesEmployee && matchesStatus;
  });

  const getTrainingStats = () => {
    const total = mockTrainingRecords.length;
    const completed = mockTrainingRecords.filter(r => r.status === 'completed').length;
    const inProgress = mockTrainingRecords.filter(r => r.status === 'in_progress').length;
    const expired = mockTrainingRecords.filter(r => r.status === 'expired').length;
    const expiringSoon = mockTrainingRecords.filter(r => 
      r.expiry_date && isExpiringSoon(r.expiry_date)
    ).length;
    
    return { total, completed, inProgress, expired, expiringSoon };
  };

  const trainingStats = getTrainingStats();

  return (
    <VStack gap="6" align="stretch">
      {/* Training Overview Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
        <CardWrapper>
          <CardWrapper.Body textAlign="center">
            <VStack gap="2">
              <Icon icon={BookOpenIcon} size="lg" color="var(--chakra-colors-blue-500)" style={{marginLeft: 'auto', marginRight: 'auto'}} />
              <Text fontSize="2xl" fontWeight="bold">{trainingStats.total}</Text>
              <Text fontSize="sm" color="gray.600">Total Entrenamientos</Text>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper>
          <CardWrapper.Body textAlign="center">
            <VStack gap="2">
              <Icon icon={CheckCircleIcon} size="lg" color="var(--chakra-colors-green-500)" style={{marginLeft: 'auto', marginRight: 'auto'}} />
              <Text fontSize="2xl" fontWeight="bold">{trainingStats.completed}</Text>
              <Text fontSize="sm" color="gray.600">Completados</Text>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper>
          <CardWrapper.Body textAlign="center">
            <VStack gap="2">
              <Icon icon={ClockIcon} size="lg" color="var(--chakra-colors-blue-500)" style={{marginLeft: 'auto', marginRight: 'auto'}} />
              <Text fontSize="2xl" fontWeight="bold">{trainingStats.inProgress}</Text>
              <Text fontSize="sm" color="gray.600">En Progreso</Text>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper>
          <CardWrapper.Body textAlign="center">
            <VStack gap="2">
              <Icon icon={ExclamationTriangleIcon} size="lg" color="var(--chakra-colors-red-500)" style={{marginLeft: 'auto', marginRight: 'auto'}} />
              <Text fontSize="2xl" fontWeight="bold">{trainingStats.expired + trainingStats.expiringSoon}</Text>
              <Text fontSize="sm" color="gray.600">Requiere Atención</Text>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
      </SimpleGrid>

      {/* Training Management Tabs */}
      <CardWrapper>
        <CardWrapper.Body p="0">
          <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
            <Tabs.List bg="bg.canvas" p="1" borderRadius="lg">
              <Tabs.Trigger value="records" gap="2" flex="1" minH="44px">
                <Icon icon={DocumentTextIcon} size="md" />
                <Text display={{ base: "none", sm: "block" }}>Registros</Text>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="catalog" gap="2" flex="1" minH="44px">
                <Icon icon={BookOpenIcon} size="md" />
                <Text display={{ base: "none", sm: "block" }}>Catálogo</Text>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="schedule" gap="2" flex="1" minH="44px">
                <Icon icon={CalendarDaysIcon} size="md" />
                <Text display={{ base: "none", sm: "block" }}>Programar</Text>
              </Tabs.Trigger>
            </Tabs.List>

            <Box p="6">
              {/* Training Records Tab */}
              <Tabs.Content value="records">
                <VStack gap="4" align="stretch">
                  {/* Filters */}
                  <HStack gap="4" wrap="wrap">
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb="1">Empleado</Text>
                      <Select.Root
                        collection={createListCollection({
                          items: [
                            { value: "all", label: "Todos" },
                            { value: "EMP001", label: "EMP001 - Ana García" },
                            { value: "EMP002", label: "EMP002 - Carlos Rodriguez" },
                            { value: "EMP003", label: "EMP003 - María López" },
                            { value: "EMP004", label: "EMP004 - Diego Martín" }
                          ]
                        })}
                        value={[selectedEmployee]}
                        onValueChange={(e) => setSelectedEmployee(e.value[0])}
                        width="200px"
                      >
                        <Select.Trigger>
                          <Select.ValueText />
                        </Select.Trigger>
                        <Select.Content />
                      </Select.Root>
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb="1">Estado</Text>
                      <Select.Root
                        collection={createListCollection({
                          items: [
                            { value: "all", label: "Todos" },
                            { value: "completed", label: "Completado" },
                            { value: "in_progress", label: "En Progreso" },
                            { value: "expired", label: "Expirado" }
                          ]
                        })}
                        value={[selectedStatus]}
                        onValueChange={(e) => setSelectedStatus(e.value[0])}
                        width="150px"
                      >
                        <Select.Trigger>
                          <Select.ValueText />
                        </Select.Trigger>
                        <Select.Content />
                      </Select.Root>
                    </Box>
                  </HStack>

                  {/* Training Records List */}
                  <VStack gap="3" align="stretch">
                    {filteredRecords.map((record) => (
                      <CardWrapper key={record.id} size="sm">
                        <CardWrapper.Body>
                          <VStack align="stretch" gap="3">
                            <HStack justify="space-between" align="start">
                              <VStack align="start" gap="1" flex="1">
                                <HStack gap="2">
                                  <Text fontWeight="semibold">{record.course_name}</Text>
                                  <Badge colorPalette={getTypeColor(record.course_type)} size="xs">
                                    {record.course_type}
                                  </Badge>
                                </HStack>
                                <HStack gap="4" fontSize="sm" color="gray.600">
                                  <Text>Empleado: {record.employee_id}</Text>
                                  <Text>Duración: {record.hours}h</Text>
                                  {record.instructor && (
                                    <Text>Instructor: {record.instructor}</Text>
                                  )}
                                </HStack>
                              </VStack>

                              <VStack align="end" gap="1">
                                <Badge colorPalette={getStatusColor(record.status)} size="sm">
                                  {record.status === 'completed' ? 'Completado' :
                                   record.status === 'in_progress' ? 'En Progreso' :
                                   record.status === 'expired' ? 'Expirado' : 'Fallido'}
                                </Badge>
                                {record.score && (
                                  <Badge colorPalette={getScoreColor(record.score)} size="xs">
                                    {record.score}%
                                  </Badge>
                                )}
                              </VStack>
                            </HStack>

                            {/* Progress for in-progress courses */}
                            {record.status === 'in_progress' && (
                              <Box>
                                <HStack justify="space-between" mb="1">
                                  <Text fontSize="sm">Progreso</Text>
                                  <Text fontSize="sm">65%</Text>
                                </HStack>
                                <Progress.Root value={65} colorPalette="blue" size="sm">
                                  <Progress.Track>
                                    <Progress.Range />
                                  </Progress.Track>
                                </Progress.Root>
                              </Box>
                            )}

                            {/* Dates and expiry warnings */}
                            <HStack justify="space-between" fontSize="sm" color="gray.500">
                              <HStack gap="4">
                                <Text>Inicio: {new Date(record.start_date).toLocaleDateString()}</Text>
                                {record.completion_date && (
                                  <Text>Completado: {new Date(record.completion_date).toLocaleDateString()}</Text>
                                )}
                              </HStack>
                              
                              {record.expiry_date && (
                                <HStack gap="1">
                                  {isExpiringSoon(record.expiry_date) && (
                                    <Icon icon={ExclamationTriangleIcon} size="sm" color="var(--chakra-colors-orange-500)" />
                                  )}
                                  {isExpired(record.expiry_date) && (
                                    <Icon icon={ExclamationTriangleIcon} size="sm" color="var(--chakra-colors-red-500)" />
                                  )}
                                  <Text color={
                                    isExpired(record.expiry_date) ? 'red.500' :
                                    isExpiringSoon(record.expiry_date) ? 'orange.500' : 'gray.500'
                                  }>
                                    Vence: {new Date(record.expiry_date).toLocaleDateString()}
                                  </Text>
                                </HStack>
                              )}
                            </HStack>

                            {/* Actions */}
                            <HStack gap="2">
                              {record.certificate_url && (
                                <Button size="sm" variant="outline" colorPalette="green">
                                  <Icon icon={TrophyIcon} size="sm" style={{marginRight: '8px'}} />
                                  Ver Certificado
                                </Button>
                              )}
                              {record.status === 'in_progress' && (
                                <Button size="sm" variant="outline" colorPalette="blue">
                                  <Icon icon={PlayCircleIcon} size="sm" style={{marginRight: '8px'}} />
                                  Continuar
                                </Button>
                              )}
                              {record.status === 'expired' && (
                                <Button size="sm" variant="outline" colorPalette="orange">
                                  Renovar
                                </Button>
                              )}
                            </HStack>
                          </VStack>
                        </CardWrapper.Body>
                      </CardWrapper>
                    ))}
                  </VStack>
                </VStack>
              </Tabs.Content>

              {/* Course Catalog Tab */}
              <Tabs.Content value="catalog">
                <VStack gap="4" align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="semibold">Catálogo de Cursos</Text>
                    <Button colorPalette="blue">
                      <Icon icon={PlusIcon} size="sm" style={{marginRight: '8px'}} />
                      Nuevo Curso
                    </Button>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                    {courseCatalog.map((course) => (
                      <CardWrapper key={course.id} size="sm">
                        <CardWrapper.Body>
                          <VStack align="stretch" gap="3">
                            <HStack justify="space-between" align="start">
                              <VStack align="start" gap="1" flex="1">
                                <HStack gap="2">
                                  <Text fontWeight="semibold">{course.name}</Text>
                                  {course.required && (
                                    <Badge colorPalette="red" size="xs">Requerido</Badge>
                                  )}
                                </HStack>
                                <Text fontSize="sm" color="gray.600">
                                  {course.description}
                                </Text>
                              </VStack>
                              <Badge colorPalette={getTypeColor(course.type as any)} size="sm">
                                {course.type}
                              </Badge>
                            </HStack>

                            <HStack justify="space-between" fontSize="sm" color="gray.500">
                              <Text>Duración: {course.hours}h</Text>
                              {course.validity_months && (
                                <Text>Válido: {course.validity_months} meses</Text>
                              )}
                            </HStack>

                            <Button size="sm" colorPalette="blue" w="full">
                              <Icon icon={UserGroupIcon} size="sm" style={{marginRight: '8px'}} />
                              Asignar a Empleados
                            </Button>
                          </VStack>
                        </CardWrapper.Body>
                      </CardWrapper>
                    ))}
                  </SimpleGrid>
                </VStack>
              </Tabs.Content>

              {/* Schedule Training Tab */}
              <Tabs.Content value="schedule">
                <VStack gap="4" align="stretch">
                  <Text fontSize="lg" fontWeight="semibold">Programar Nuevo Entrenamiento</Text>
                  
                  <CardWrapper>
                    <CardWrapper.Body>
                      <VStack gap="4" align="stretch">
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                          <Box>
                            <Text fontSize="sm" fontWeight="medium" mb="2">Curso</Text>
                            <Select.Root
                              collection={createListCollection({
                                items: courseCatalog.map(course => ({
                                  value: course.id,
                                  label: course.name
                                }))
                              })}
                            >
                              <Select.Trigger>
                                <Select.ValueText placeholder="Seleccionar curso" />
                              </Select.Trigger>
                              <Select.Content />
                            </Select.Root>
                          </Box>

                          <Box>
                            <Text fontSize="sm" fontWeight="medium" mb="2">Empleado(s)</Text>
                            <Select.Root
                              collection={createListCollection({
                                items: [
                                  { value: "EMP001", label: "EMP001 - Ana García" },
                                  { value: "EMP002", label: "EMP002 - Carlos Rodriguez" },
                                  { value: "EMP003", label: "EMP003 - María López" },
                                  { value: "EMP004", label: "EMP004 - Diego Martín" },
                                  { value: "all", label: "Todos los empleados" }
                                ]
                              })}
                            >
                              <Select.Trigger>
                                <Select.ValueText placeholder="Seleccionar empleado" />
                              </Select.Trigger>
                              <Select.Content />
                            </Select.Root>
                          </Box>

                          <Box>
                            <Text fontSize="sm" fontWeight="medium" mb="2">Fecha de Inicio</Text>
                            <InputField type="date" />
                          </Box>

                          <Box>
                            <Text fontSize="sm" fontWeight="medium" mb="2">Instructor</Text>
                            <InputField placeholder="Nombre del instructor" />
                          </Box>
                        </SimpleGrid>

                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb="2">Notas Adicionales</Text>
                          <Textarea 
                            placeholder="Información adicional sobre el entrenamiento..."
                            rows={3}
                          />
                        </Box>

                        <HStack gap="2" justify="end">
                          <Button variant="outline">Cancelar</Button>
                          <Button colorPalette="blue">Programar Entrenamiento</Button>
                        </HStack>
                      </VStack>
                    </CardWrapper.Body>
                  </CardWrapper>
                </VStack>
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </CardWrapper.Body>
      </CardWrapper>
    </VStack>
  );
}