// Staff Directory Section - Employee list and profiles with REAL DATA
import { useState, useEffect } from 'react';
import { Spinner } from '@chakra-ui/react';
import { 
  Box, 
  VStack, 
  HStack, 
  Typography as Text, //TODO: REPLACE ALL Text USAGES WITH Typography
  Badge, 
  SimpleGrid,
  Button,
  Avatar,
  Icon,
  CardWrapper,
  InputField,
  Alert,
} from '@/shared/ui';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  EyeIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useStaffWithLoader } from '../../../../../../hooks/useStaffData';
import { EmployeeForm } from '../EmployeeForm';
import type { StaffViewState } from '../../types';
import type { Employee } from '../../../../../../services/staff/staffApi';

interface DirectorySectionProps {
  viewState: StaffViewState;
  onViewStateChange: (state: StaffViewState) => void;
}

export function DirectorySection({ viewState, onViewStateChange }: DirectorySectionProps) {
  const { staff, loading, error, refreshEmployees } = useStaffWithLoader();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();

  // Apply filters and refresh data when they change
  useEffect(() => {
    const filters: unknown = {};
    
    if (searchTerm) filters.search = searchTerm;
    if (selectedDepartment !== 'all') filters.department = selectedDepartment;
    if (selectedStatus !== 'all') filters.status = selectedStatus;

    refreshEmployees(filters);
  }, [searchTerm, selectedDepartment, selectedStatus, refreshEmployees]);

  // Get department badge color
  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      kitchen: 'orange',
      service: 'blue', 
      admin: 'purple',
      cleaning: 'green',
      management: 'red'
    };
    return colors[department] || 'gray';
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'green',
      inactive: 'gray',
      on_leave: 'yellow',
      terminated: 'red'
    };
    return colors[status] || 'gray';
  };

  // Format status for display
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      active: 'Activo',
      inactive: 'Inactivo', 
      on_leave: 'En Licencia',
      terminated: 'Terminado'
    };
    return statusMap[status] || status;
  };

  // Format department for display
  const formatDepartment = (department: string) => {
    const deptMap: Record<string, string> = {
      kitchen: 'Cocina',
      service: 'Servicio',
      admin: 'Administración',
      cleaning: 'Limpieza',
      management: 'Gerencia'
    };
    return deptMap[department] || department;
  };

  // Loading state
  if (loading) {
    return (
      <Stack direction="column" gap="4" py="8">
        <Spinner size="lg" />
        <Text>Cargando empleados...</Text>
      </Stack>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert status="error">
        <Alert.Indicator />
        <Alert.Title>Error cargando empleados</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
      </Alert>
    );
  }

  // Empty state
  if (staff.length === 0) {
    return (
      <Stack direction="column" gap="6" py="12" textAlign="center">
        <Box p="4" bg="gray.100" borderRadius="full">
          <Icon icon={PlusIcon} size="xl" color="gray.400" />
        </Box>
        <Stack direction="column" gap="2">
          <Text fontSize="lg" fontWeight="semibold">No hay empleados registrados</Text>
          <Text color="gray.600">Comienza agregando tu primer empleado</Text>
        </Stack>
        <Button 
          colorPalette="blue"
          onClick={() => setShowEmployeeForm(true)}
        >
          <Icon icon={PlusIcon} size="sm" />
          Agregar Empleado
        </Button>
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap="6" align="stretch">
      {/* Search and Filters Bar */}
      <Stack direction="column" gap="4" align="stretch">
        <Stack direction="row" gap="4" flexWrap="wrap">
          <Box flex="1" minW="300px">
            <InputField
              placeholder="Buscar por nombre, email o posición..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startElement={<Icon icon={MagnifyingGlassIcon} size="sm" />}
            />
          </Box>
          <Button
            variant={showFilters ? 'solid' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Icon icon={FunnelIcon} size="sm" />
            Filtros
          </Button>
          <Icon
            variant={viewState.viewMode === 'grid' ? 'solid' : 'outline'}
            onClick={() => onViewStateChange({ ...viewState, viewMode: 'grid' })}
          >
            <Icon icon={Squares2X2Icon} size="sm" />
          </Icon>
          <Icon
            variant={viewState.viewMode === 'list' ? 'solid' : 'outline'}
            onClick={() => onViewStateChange({ ...viewState, viewMode: 'list' })}
          >
            <Icon icon={ListBulletIcon} size="sm" />
          </Icon>
        </Stack>

        {/* Advanced Filters */}
        {showFilters && (
          <CardWrapper variant="elevated" padding="md">
            <CardWrapper.Body>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb="2">Departamento</Text>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">Todos los Departamentos</option>
                    <option value="kitchen">Cocina</option>
                    <option value="service">Servicio</option>
                    <option value="admin">Administración</option>
                    <option value="cleaning">Limpieza</option>
                    <option value="management">Gerencia</option>
                  </select>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb="2">Estado</Text>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">Todos los Estados</option>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="on_leave">En Licencia</option>
                    <option value="terminated">Terminado</option>
                  </select>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb="2">Acciones</Text>
                  <Stack direction="row" gap="2">
                    <Button size="sm" variant="outline" onClick={() => {
                      setSearchTerm('');
                      setSelectedDepartment('all');
                      setSelectedStatus('all');
                    }}>
                      Limpiar
                    </Button>
                  </Stack>
                </Box>
              </SimpleGrid>
            </CardWrapper.Body>
          </CardWrapper>
        )}
      </Stack>

      {/* Results Summary */}
      <Text fontSize="sm" color="gray.600">
        {staff.length} empleado{staff.length !== 1 ? 's' : ''} encontrado{staff.length !== 1 ? 's' : ''}
      </Text>

      {/* Employee Cards/List */}
      {viewState.viewMode === 'grid' ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
          {staff.map((employee) => (
            <CardWrapper key={employee.id} variant="elevated" padding="md">
              <CardWrapper.Body>
                <Stack direction="column" gap="4" align="stretch">
                  {/* Employee Header */}
                  <Stack direction="row" gap="3">
                    <Avatar
                      name={employee.name}
                      src={employee.avatar}
                      size="md"
                    />
                    <Stack direction="column" align="start" gap="1" flex="1">
                      <Text fontWeight="semibold" fontSize="md">{employee.name}</Text>
                      <Text fontSize="sm" color="gray.600">{employee.position}</Text>
                    </Stack>
                  </Stack>

                  {/* Employee Info */}
                  <Stack direction="column" gap="2" align="stretch">
                    <Stack direction="row" gap="2">
                      <Badge colorPalette={getDepartmentColor(employee.department)} size="sm">
                        {formatDepartment(employee.department)}
                      </Badge>
                      <Badge colorPalette={getStatusColor(employee.status)} size="sm">
                        {formatStatus(employee.status)}
                      </Badge>
                    </Stack>

                    <Stack direction="row" gap="2" fontSize="sm" color="gray.600">
                      <Icon icon={EnvelopeIcon} size="sm" />
                      <Text>{employee.email}</Text>
                    </Stack>

                    {employee.phone && (
                      <Stack direction="row" gap="2" fontSize="sm" color="gray.600">
                        <Icon icon={PhoneIcon} size="sm" />
                        <Text>{employee.phone}</Text>
                      </Stack>
                    )}

                    <Stack direction="row" gap="2" fontSize="sm" color="gray.600">
                      <Icon icon={ClockIcon} size="sm" />
                      <Text>Desde {new Date(employee.hire_date).toLocaleDateString()}</Text>
                    </Stack>
                  </Stack>

                  {/* Performance Indicator */}
                  <Stack direction="row" gap="2" justify="space-between" align="center">
                    <Stack direction="column" align="start" gap="0">
                      <Text fontSize="xs" color="gray.500">Rendimiento</Text>
                      <Text fontSize="sm" fontWeight="medium">{employee.performance_score}%</Text>
                    </Stack>
                    <Stack direction="row" gap="1">
                      <Icon 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          // TODO: View employee details
                        }}
                      >
                        <Icon icon={EyeIcon} size="sm" />
                      </Icon>
                      <Icon 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setEditingEmployee(employee);
                          setShowEmployeeForm(true);
                        }}
                      >
                        <Icon icon={PencilIcon} size="sm" />
                      </Icon>
                    </Stack>
                  </Stack>
                </Stack>
              </CardWrapper.Body>
            </CardWrapper>
          ))}
        </SimpleGrid>
      ) : (
        /* List View */
        <Stack direction="column" gap="2" align="stretch">
          {staff.map((employee) => (
            <CardWrapper key={employee.id} variant="flat" padding="md">
              <CardWrapper.Body>
                <Stack direction="row" gap="4" align="center">
                  <Avatar
                    name={employee.name}
                    src={employee.avatar}
                    size="sm"
                  />
                  <Stack direction="column" align="start" gap="0" flex="1">
                    <Text fontWeight="medium">{employee.name}</Text>
                    <Text fontSize="sm" color="gray.600">{employee.position}</Text>
                  </Stack>
                  <Badge colorPalette={getDepartmentColor(employee.department)} size="sm">
                    {formatDepartment(employee.department)}
                  </Badge>
                  <Badge colorPalette={getStatusColor(employee.status)} size="sm">
                    {formatStatus(employee.status)}
                  </Badge>
                  <Text fontSize="sm" color="gray.600" minW="100px">
                    {employee.performance_score}% rendimiento
                  </Text>
                  <Stack direction="row" gap="1">
                    <Icon 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        // TODO: View employee details
                      }}
                    >
                      <Icon icon={EyeIcon} size="sm" />
                    </Icon>
                    <Icon 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setEditingEmployee(employee);
                        setShowEmployeeForm(true);
                      }}
                    >
                      <Icon icon={PencilIcon} size="sm" />
                    </Icon>
                  </Stack>
                </Stack>
              </CardWrapper.Body>
            </CardWrapper>
          ))}
        </Stack>
      )}

      {/* Employee Form Modal */}
      <EmployeeForm
        employee={editingEmployee}
        isOpen={showEmployeeForm}
        onClose={() => {
          setShowEmployeeForm(false);
          setEditingEmployee(undefined);
        }}
        onSuccess={(employee) => {
          refreshEmployees();
          setEditingEmployee(undefined);
        }}
      />
    </Stack>
  );
}