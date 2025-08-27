// Staff Directory Section - Employee list and profiles
import { useState } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Input, 
  Select, 
  Badge, 
  Card, 
  SimpleGrid,
  Button,
  Avatar,
  IconButton,
  createListCollection
} from '@chakra-ui/react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  EyeIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import type { Employee, StaffViewState, MaskedEmployee } from '../../types';

interface DirectorySectionProps {
  viewState: StaffViewState;
  onViewStateChange: (state: StaffViewState) => void;
}

// Mock employee data with security compliance
const mockEmployees: MaskedEmployee[] = [
  {
    id: '1',
    employee_id: 'EMP001',
    first_name: 'Ana',
    last_name: 'García',
    email: 'ana.garcia@restaurant.com',
    phone: '+1234567890',
    avatar_url: undefined,
    position: 'Gerente General',
    department: 'Administración',
    hire_date: '2023-01-15',
    employment_status: 'active',
    employment_type: 'full_time',
    role: 'manager',
    permissions: ['staff:manage', 'performance:read', 'training:write'],
    last_login: '2024-01-08T14:30:00Z',
    performance_score: 95,
    goals_completed: 8,
    total_goals: 10,
    certifications: ['Food Safety', 'Leadership'],
    training_completed: 12,
    training_hours: 48,
    salary_masked: true,
    hourly_rate_masked: true,
    social_security_masked: '***-**-1234',
    created_at: '2023-01-15T09:00:00Z',
    updated_at: '2024-01-08T14:30:00Z'
  },
  {
    id: '2',
    employee_id: 'EMP002',
    first_name: 'Carlos',
    last_name: 'Rodriguez',
    email: 'carlos.rodriguez@restaurant.com',
    phone: '+1234567891',
    position: 'Chef Principal',
    department: 'Cocina',
    hire_date: '2023-03-01',
    employment_status: 'active',
    employment_type: 'full_time',
    role: 'supervisor',
    permissions: ['staff:read', 'performance:read', 'training:read'],
    last_login: '2024-01-08T12:15:00Z',
    performance_score: 88,
    goals_completed: 7,
    total_goals: 9,
    certifications: ['Food Safety', 'Kitchen Management'],
    training_completed: 8,
    training_hours: 32,
    salary_masked: true,
    hourly_rate_masked: true,
    social_security_masked: '***-**-5678',
    created_at: '2023-03-01T09:00:00Z',
    updated_at: '2024-01-08T12:15:00Z'
  },
  {
    id: '3',
    employee_id: 'EMP003',
    first_name: 'María',
    last_name: 'López',
    email: 'maria.lopez@restaurant.com',
    phone: '+1234567892',
    position: 'Mesera Senior',
    department: 'Servicio',
    hire_date: '2023-05-15',
    employment_status: 'active',
    employment_type: 'part_time',
    role: 'employee',
    permissions: ['staff:read'],
    last_login: '2024-01-08T16:45:00Z',
    performance_score: 92,
    goals_completed: 6,
    total_goals: 8,
    certifications: ['Customer Service'],
    training_completed: 5,
    training_hours: 20,
    salary_masked: true,
    hourly_rate_masked: true,
    social_security_masked: '***-**-9012',
    created_at: '2023-05-15T09:00:00Z',
    updated_at: '2024-01-08T16:45:00Z'
  },
  {
    id: '4',
    employee_id: 'EMP004',
    first_name: 'Diego',
    last_name: 'Martín',
    email: 'diego.martin@restaurant.com',
    position: 'Cocinero',
    department: 'Cocina',
    hire_date: '2023-08-01',
    employment_status: 'active',
    employment_type: 'full_time',
    role: 'employee',
    permissions: ['staff:read'],
    last_login: '2024-01-08T10:30:00Z',
    performance_score: 78,
    goals_completed: 4,
    total_goals: 7,
    certifications: ['Food Safety'],
    training_completed: 3,
    training_hours: 12,
    salary_masked: true,
    hourly_rate_masked: true,
    social_security_masked: '***-**-3456',
    created_at: '2023-08-01T09:00:00Z',
    updated_at: '2024-01-08T10:30:00Z'
  }
];

export function DirectorySection({ viewState, onViewStateChange }: DirectorySectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

 // Create collections for Select components (ChakraUI v3.23.0 requirement)
  const departmentItems = [
    { value: '', label: 'Todos' },
    { value: 'Administración', label: 'Administración' },
    { value: 'Cocina', label: 'Cocina' },
    { value: 'Servicio', label: 'Servicio' },
    { value: 'Limpieza', label: 'Limpieza' }
  ];
  const departmentCollection = createListCollection({ items: departmentItems });

  const statusItems = [
    { value: '', label: 'Todos' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'on_leave', label: 'En Licencia' },
    { value: 'terminated', label: 'Terminado' }
  ];
  const statusCollection = createListCollection({ items: statusItems });

  const roleItems = [
    { value: '', label: 'Todos' },
    { value: 'admin', label: 'Administrador' },
    { value: 'manager', label: 'Gerente' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'employee', label: 'Empleado' }
  ];
  const roleCollection = createListCollection({ items: roleItems });
  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !viewState.filters.employment_status || 
      employee.employment_status === viewState.filters.employment_status;
    
    const matchesDepartment = !viewState.filters.department || 
      employee.department === viewState.filters.department;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleViewEmployee = (employee: MaskedEmployee) => {
    onViewStateChange({
      ...viewState,
      selectedEmployee: employee as Employee
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'on_leave': return 'orange';
      case 'terminated': return 'red';
      default: return 'gray';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'purple';
      case 'manager': return 'blue';
      case 'supervisor': return 'teal';
      case 'employee': return 'gray';
      default: return 'gray';
    }
  };

  const formatLastSeen = (lastLogin?: string) => {
    if (!lastLogin) return 'Nunca';
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  };

  return (
    <VStack gap="6" align="stretch">
      {/* Search and Filter Controls */}
      <HStack gap="4" wrap="wrap">
        <Box flex="1" minW="200px">
          <Input
            placeholder="Buscar empleados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="lg"
            pr="12"
          />
          <Box position="absolute" right="3" top="50%" transform="translateY(-50%)" zIndex="1">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </Box>
        </Box>

        <IconButton
          aria-label="Toggle filters"
          size="lg"
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FunnelIcon className="w-5 h-5" />
        </IconButton>

        <HStack>
          <IconButton
            aria-label="Grid view"
            size="lg"
            variant={viewState.viewMode === 'grid' ? 'solid' : 'outline'}
            onClick={() => onViewStateChange({ ...viewState, viewMode: 'grid' })}
          >
            <Squares2X2Icon className="w-5 h-5" />
          </IconButton>
          
          <IconButton
            aria-label="List view"
            size="lg"
            variant={viewState.viewMode === 'list' ? 'solid' : 'outline'}
            onClick={() => onViewStateChange({ ...viewState, viewMode: 'list' })}
          >
            <ListBulletIcon className="w-5 h-5" />
          </IconButton>
        </HStack>
      </HStack>

      {/* Filters Panel */}
      {showFilters && (
        <Card.Root>
          <Card.Body>
            <HStack gap="4" wrap="wrap">
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb="2">Departamento</Text>
                <Select.Root
                  collection={createListCollection({ 
                    items: [
                      { value: '', label: 'Todos' },
                      { value: 'Administración', label: 'Administración' },
                      { value: 'Cocina', label: 'Cocina' },
                      { value: 'Servicio', label: 'Servicio' },
                      { value: 'Limpieza', label: 'Limpieza' }
                    ]
                  })}
                  value={[viewState.filters.department || '']}
                  onValueChange={(e) => onViewStateChange({
                    ...viewState,
                    filters: { ...viewState.filters, department: e.value[0] || undefined }
                  })}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="Todos" />
                  </Select.Trigger>
                  <Select.Content />
                </Select.Root>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb="2">Estado</Text>
                <Select.Root
                  collection={createListCollection({ 
                    items: [
                      { value: '', label: 'Todos' },
                      { value: 'active', label: 'Activo' },
                      { value: 'inactive', label: 'Inactivo' },
                      { value: 'on_leave', label: 'En Licencia' },
                      { value: 'terminated', label: 'Terminado' }
                    ]
                  })}
                  value={[viewState.filters.employment_status || '']}
                  onValueChange={(e) => onViewStateChange({
                    ...viewState,
                    filters: { ...viewState.filters, employment_status: e.value[0] as any || undefined }
                  })}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="Todos" />
                  </Select.Trigger>
                  <Select.Content />
                </Select.Root>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb="2">Rol</Text>
                <Select.Root
                  collection={createListCollection({ 
                    items: [
                      { value: '', label: 'Todos' },
                      { value: 'admin', label: 'Administrador' },
                      { value: 'manager', label: 'Gerente' },
                      { value: 'supervisor', label: 'Supervisor' },
                      { value: 'employee', label: 'Empleado' }
                    ]
                  })}
                  value={[viewState.filters.role || '']}
                  onValueChange={(e) => onViewStateChange({
                    ...viewState,
                    filters: { ...viewState.filters, role: e.value[0] as any || undefined }
                  })}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="Todos" />
                  </Select.Trigger>
                  <Select.Content />
                </Select.Root>
              </Box>
            </HStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* Results Summary */}
      <HStack justify="space-between" align="center">
        <Text color="gray.600">
          Mostrando {filteredEmployees.length} de {mockEmployees.length} empleados
        </Text>
        <Text fontSize="sm" color="gray.500">
          Actualizado hace 2 minutos
        </Text>
      </HStack>

      {/* Employee Cards/List */}
      {viewState.viewMode === 'grid' ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
          {filteredEmployees.map((employee) => (
            <Card.Root key={employee.id} size="sm" _hover={{ shadow: 'md' }} cursor="pointer">
              <Card.Body>
                <VStack align="stretch" gap="3">
                  <HStack gap="3">
                    <Avatar.Root
                      size="md"
                    >
                      <Avatar.Fallback name={`${employee.first_name} ${employee.last_name}`} />
                      <Avatar.Image src={employee.avatar_url} />
                    </Avatar.Root>
                    <VStack align="start" gap="1" flex="1">
                      <HStack justify="space-between" w="full">
                        <Text fontWeight="semibold" fontSize="sm">
                          {employee.first_name} {employee.last_name}
                        </Text>
                        <Badge 
                          colorPalette={getStatusColor(employee.employment_status)} 
                          size="xs"
                        >
                          {employee.employment_status}
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color="gray.600">{employee.position}</Text>
                      <Text fontSize="xs" color="gray.500">{employee.employee_id}</Text>
                    </VStack>
                  </HStack>

                  <HStack gap="2" fontSize="xs" color="gray.500">
                    <ClockIcon className="w-3 h-3" />
                    <Text>{formatLastSeen(employee.last_login)}</Text>
                  </HStack>

                  <HStack gap="2">
                    <Badge colorPalette={getRoleColor(employee.role)} size="xs">
                      {employee.role}
                    </Badge>
                    <Badge colorPalette="gray" size="xs">
                      {employee.department}
                    </Badge>
                    {employee.performance_score && (
                      <Badge 
                        colorPalette={employee.performance_score > 85 ? 'green' : 'orange'} 
                        size="xs"
                      >
                        {employee.performance_score}%
                      </Badge>
                    )}
                  </HStack>

                  <HStack gap="1" justify="space-between">
                    <HStack gap="1">
                      <IconButton
                        aria-label="Call employee"
                        size="xs"
                        variant="ghost"
                        colorPalette="green"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${employee.phone}`);
                        }}
                      >
                        <PhoneIcon className="w-3 h-3" />
                      </IconButton>
                      <IconButton
                        aria-label="Email employee"
                        size="xs"
                        variant="ghost"
                        colorPalette="blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`mailto:${employee.email}`);
                        }}
                      >
                        <EnvelopeIcon className="w-3 h-3" />
                      </IconButton>
                    </HStack>

                    <HStack gap="1">
                      <IconButton
                        aria-label="View employee"
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewEmployee(employee);
                        }}
                      >
                        <EyeIcon className="w-3 h-3" />
                      </IconButton>
                      <IconButton
                        aria-label="Edit employee"
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Edit employee:', employee.id);
                        }}
                      >
                        <PencilIcon className="w-3 h-3" />
                      </IconButton>
                    </HStack>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>
      ) : (
        <VStack gap="2" align="stretch">
          {filteredEmployees.map((employee) => (
            <Card.Root 
              key={employee.id} 
              size="sm" 
              _hover={{ shadow: 'md' }} 
              cursor="pointer"
              onClick={() => handleViewEmployee(employee)}
            >
              <Card.Body>
                <HStack justify="space-between" gap="4">
                  <HStack gap="4">
                    <Avatar.Root
                      size="sm"
                    >
                      <Avatar.Fallback name={`${employee.first_name} ${employee.last_name}`}/>
                      <Avatar.Image src={employee.avatar_url}/>
                    </Avatar.Root>
                    <VStack align="start" gap="1">
                      <HStack gap="2">
                        <Text fontWeight="semibold">
                          {employee.first_name} {employee.last_name}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          ({employee.employee_id})
                        </Text>
                      </HStack>
                      <HStack gap="2" fontSize="sm" color="gray.600">
                        <Text>{employee.position}</Text>
                        <Text>•</Text>
                        <Text>{employee.department}</Text>
                      </HStack>
                    </VStack>
                  </HStack>

                  <HStack gap="2">
                    <Badge colorPalette={getStatusColor(employee.employment_status)} size="sm">
                      {employee.employment_status}
                    </Badge>
                    <Badge colorPalette={getRoleColor(employee.role)} size="sm">
                      {employee.role}
                    </Badge>
                    {employee.performance_score && (
                      <Badge 
                        colorPalette={employee.performance_score > 85 ? 'green' : 'orange'} 
                        size="sm"
                      >
                        {employee.performance_score}%
                      </Badge>
                    )}
                  </HStack>

                  <HStack gap="1">
                    <IconButton
                      aria-label="View employee"
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewEmployee(employee);
                      }}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </IconButton>
                    <IconButton
                      aria-label="Edit employee"
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Edit employee:', employee.id);
                      }}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </IconButton>
                  </HStack>
                </HStack>
              </Card.Body>
            </Card.Root>
          ))}
        </VStack>
      )}

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <Card.Root>
          <Card.Body py="12" textAlign="center">
            <VStack gap="4">
              <Box p="4" bg="gray.100" borderRadius="full">
                <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
              </Box>
              <VStack gap="2">
                <Text fontSize="lg" fontWeight="semibold">No se encontraron empleados</Text>
                <Text color="gray.600">
                  Intenta ajustar los filtros o términos de búsqueda
                </Text>
              </VStack>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  onViewStateChange({
                    ...viewState,
                    filters: {}
                  });
                }}
              >
                Limpiar Filtros
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}
    </VStack>
  );
}