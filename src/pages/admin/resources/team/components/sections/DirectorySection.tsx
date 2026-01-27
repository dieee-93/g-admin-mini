// Staff Directory Section - Editorial Brutalist Redesign
// Clean, modern staff directory with distinctive card design
import { useState } from 'react';
import { Spinner } from '@chakra-ui/react';
import {
  Box,
  Stack,
  Text,
  Badge,
  SimpleGrid,
  Button,
  Icon,
  InputField,
  Alert,
  IconButton,
  SegmentGroup,
  SegmentItem,
} from '@/shared/ui';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PlusIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { useStaffWithLoader } from '@/modules/team/hooks';
import type { StaffFilters } from '@/modules/team/hooks/useStaff';
import type { TeamMember } from '@/modules/team/store';
import { EmployeeForm } from '../EmployeeForm';
import { StaffCard, StaffListItem } from '../StaffCard';
import type { StaffViewState, TeamMember } from '../../types';

// Helper to transform TeamMember to TeamMember format for the form
function staffMemberToEmployee(staff: TeamMember): Partial<TeamMember> {
  const [firstName, ...lastNameParts] = staff.name.split(' ');
  return {
    id: staff.id,
    employee_id: '', // Will be generated
    first_name: firstName || '',
    last_name: lastNameParts.join(' ') || '',
    email: staff.email,
    phone: staff.phone,
    avatar_url: staff.avatar,
    position: staff.position,
    department: staff.department,
    hire_date: staff.hire_date,
    employment_status: staff.status,
    performance_score: staff.performance_score,
    salary: staff.salary,
    created_at: staff.created_at,
    updated_at: staff.updated_at,
  };
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const DEPARTMENTS = [
  { value: 'all', label: 'Todos' },
  { value: 'kitchen', label: 'Cocina' },
  { value: 'service', label: 'Servicio' },
  { value: 'admin', label: 'Admin' },
  { value: 'cleaning', label: 'Limpieza' },
  { value: 'management', label: 'Gerencia' },
];

const STATUSES = [
  { value: 'all', label: 'Todos', color: 'gray' },
  { value: 'active', label: 'Activos', color: 'green' },
  { value: 'inactive', label: 'Inactivos', color: 'gray' },
  { value: 'on_leave', label: 'Licencia', color: 'yellow' },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
interface DirectorySectionProps {
  viewState: StaffViewState;
  onViewStateChange: (state: StaffViewState) => void;
}

export function DirectorySection({ viewState, onViewStateChange }: DirectorySectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<TeamMember> | undefined>();

  // Query filters
  const filters: StaffFilters = {
    search: searchTerm || undefined,
    department: (selectedDepartment !== 'all' ? selectedDepartment : undefined) as StaffFilters['department'],
    status: (selectedStatus !== 'all' ? selectedStatus : undefined) as StaffFilters['status'],
  };

  const { staff, loading, error } = useStaffWithLoader(filters);

  // Check if any filter is active
  const hasActiveFilters = selectedDepartment !== 'all' || selectedStatus !== 'all' || searchTerm;

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('all');
    setSelectedStatus('all');
  };

  // Handlers
  const handleView = (teamMember: TeamMember) => {
    console.log('View teamMember:', teamMember.id);
    // TODO: Navigate to teamMember profile
  };

  const handleEdit = (teamMember: TeamMember) => {
    setEditingEmployee(staffMemberToEmployee(teamMember));
    setShowEmployeeForm(true);
  };

  const handleContact = (teamMember: TeamMember, method: 'whatsapp' | 'call' | 'email') => {
    console.log(`Contact ${teamMember.name} via ${method}`);
  };

  const handleIncident = (teamMember: TeamMember) => {
    console.log('Register incident for:', teamMember.id);
    // TODO: Open incident modal
  };

  // ─────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Stack direction="column" gap="4" py="16" align="center">
        <Spinner size="lg" color="gray.400" />
        <Text color="gray.500" fontSize="14px">Cargando equipo...</Text>
      </Stack>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Alert status="error" borderRadius="2px">
        <Alert.Indicator />
        <Alert.Title>Error cargando empleados</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
      </Alert>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // EMPTY STATE
  // ─────────────────────────────────────────────────────────────
  if (staff.length === 0 && !hasActiveFilters) {
    return (
      <Stack direction="column" gap="6" py="20" align="center">
        <Box
          p="6"
          bg="gray.50"
          borderRadius="full"
          _dark={{ bg: 'gray.800' }}
        >
          <Icon icon={PlusIcon} boxSize="8" color="gray.400" />
        </Box>
        <Stack direction="column" gap="1" textAlign="center">
          <Text fontSize="18px" fontWeight="600" color="gray.900" _dark={{ color: 'white' }}>
            Sin empleados registrados
          </Text>
          <Text fontSize="14px" color="gray.500">
            Agrega tu primer empleado para comenzar
          </Text>
        </Stack>
        <Button
          colorPalette="blue"
          size="lg"
          onClick={() => setShowEmployeeForm(true)}
          borderRadius="2px"
        >
          <Icon icon={PlusIcon} boxSize="5" mr="2" />
          Agregar Empleado
        </Button>
      </Stack>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <Stack direction="column" gap="6" align="stretch">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* TOOLBAR */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Stack
        direction="row"
        gap="3"
        align="center"
        flexWrap="wrap"
        pb="4"
        borderBottom="1px solid"
        borderColor="gray.100"
        _dark={{ borderColor: 'gray.800' }}
      >
        {/* Search */}
        <Box flex="1" minW="240px" maxW="400px">
          <InputField
            placeholder="Buscar por nombre o posicion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startElement={
              <Icon icon={MagnifyingGlassIcon} boxSize="4" color="gray.400" />
            }
            size="sm"
          />
        </Box>

        {/* Filter toggle */}
        <Button
          variant={showFilters ? 'solid' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          borderRadius="2px"
          colorPalette={showFilters ? 'blue' : 'gray'}
        >
          <Icon icon={showFilters ? AdjustmentsHorizontalIcon : FunnelIcon} boxSize="4" />
          Filtros
          {hasActiveFilters && (
            <Badge ml="2" colorPalette="blue" size="sm" borderRadius="full">
              {[selectedDepartment !== 'all', selectedStatus !== 'all'].filter(Boolean).length}
            </Badge>
          )}
        </Button>

        {/* View mode toggle */}
        <Stack direction="row" gap="1" bg="gray.100" p="1" borderRadius="2px" _dark={{ bg: 'gray.800' }}>
          <IconButton
            aria-label="Vista cuadricula"
            variant={viewState.viewMode === 'grid' ? 'solid' : 'ghost'}
            size="xs"
            onClick={() => onViewStateChange({ ...viewState, viewMode: 'grid' })}
            borderRadius="2px"
            colorPalette={viewState.viewMode === 'grid' ? 'blue' : 'gray'}
          >
            <Icon icon={Squares2X2Icon} boxSize="4" />
          </IconButton>
          <IconButton
            aria-label="Vista lista"
            variant={viewState.viewMode === 'list' ? 'solid' : 'ghost'}
            size="xs"
            onClick={() => onViewStateChange({ ...viewState, viewMode: 'list' })}
            borderRadius="2px"
            colorPalette={viewState.viewMode === 'list' ? 'blue' : 'gray'}
          >
            <Icon icon={ListBulletIcon} boxSize="4" />
          </IconButton>
        </Stack>

        {/* Add button */}
        <Button
          colorPalette="blue"
          size="sm"
          onClick={() => setShowEmployeeForm(true)}
          borderRadius="2px"
          ml="auto"
        >
          <Icon icon={PlusIcon} boxSize="4" />
          Agregar
        </Button>
      </Stack>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* FILTERS PANEL */}
      {/* ═══════════════════════════════════════════════════════ */}
      {showFilters && (
        <Stack
          direction="row"
          gap="6"
          p="4"
          bg="gray.50"
          borderRadius="2px"
          align="flex-end"
          flexWrap="wrap"
          _dark={{ bg: 'gray.900' }}
        >
          {/* Department filter */}
          <Stack direction="column" gap="2">
            <Text fontSize="11px" fontWeight="600" textTransform="uppercase" letterSpacing="0.05em" color="gray.500">
              Departamento
            </Text>
            <SegmentGroup
              value={selectedDepartment}
              onValueChange={(e) => setSelectedDepartment(e.value)}
              size="sm"
            >
              {DEPARTMENTS.map((dept) => (
                <SegmentItem key={dept.value} value={dept.value}>
                  {dept.label}
                </SegmentItem>
              ))}
            </SegmentGroup>
          </Stack>

          {/* Status filter */}
          <Stack direction="column" gap="2">
            <Text fontSize="11px" fontWeight="600" textTransform="uppercase" letterSpacing="0.05em" color="gray.500">
              Estado
            </Text>
            <SegmentGroup
              value={selectedStatus}
              onValueChange={(e) => setSelectedStatus(e.value)}
              size="sm"
            >
              {STATUSES.map((status) => (
                <SegmentItem key={status.value} value={status.value}>
                  {status.label}
                </SegmentItem>
              ))}
            </SegmentGroup>
          </Stack>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              color="gray.500"
            >
              <Icon icon={XMarkIcon} boxSize="4" mr="1" />
              Limpiar
            </Button>
          )}
        </Stack>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* RESULTS SUMMARY */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Stack direction="row" justify="space-between" align="center">
        <Text fontSize="13px" color="gray.500">
          <Text as="span" fontWeight="600" color="gray.700" _dark={{ color: 'gray.300' }}>
            {staff.length}
          </Text>
          {' '}empleado{staff.length !== 1 ? 's' : ''}
          {hasActiveFilters && ' (filtrado)'}
        </Text>
      </Stack>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* NO RESULTS */}
      {/* ═══════════════════════════════════════════════════════ */}
      {staff.length === 0 && hasActiveFilters && (
        <Stack direction="column" gap="4" py="12" align="center">
          <Text fontSize="15px" color="gray.500">
            No se encontraron empleados con estos filtros
          </Text>
          <Button variant="outline" size="sm" onClick={clearFilters} borderRadius="2px">
            Limpiar filtros
          </Button>
        </Stack>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* GRID VIEW */}
      {/* ═══════════════════════════════════════════════════════ */}
      {viewState.viewMode === 'grid' && staff.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap="4">
          {staff.map((teamMember) => (
            <StaffCard
              key={teamMember.id}
              teamMember={teamMember}
              onView={handleView}
              onEdit={handleEdit}
              onContact={handleContact}
              onIncident={handleIncident}
            />
          ))}
        </SimpleGrid>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* LIST VIEW */}
      {/* ═══════════════════════════════════════════════════════ */}
      {viewState.viewMode === 'list' && staff.length > 0 && (
        <Stack
          direction="column"
          gap="0"
          bg="white"
          borderRadius="2px"
          overflow="hidden"
          boxShadow="0 1px 3px rgba(0,0,0,0.08)"
          _dark={{ bg: 'gray.900' }}
        >
          {/* List header */}
          <Stack
            direction="row"
            align="center"
            gap="16px"
            py="10px"
            pl="20px"
            pr="12px"
            bg="gray.50"
            borderBottom="1px solid"
            borderColor="gray.100"
            _dark={{ bg: 'gray.950', borderColor: 'gray.800' }}
          >
            <Box w="32px" /> {/* Avatar space */}
            <Text flex="1" minW="140px" fontSize="10px" fontWeight="600" textTransform="uppercase" letterSpacing="0.06em" color="gray.500">
              Empleado
            </Text>
            <Text minW="80px" fontSize="10px" fontWeight="600" textTransform="uppercase" letterSpacing="0.06em" color="gray.500">
              Depto
            </Text>
            <Text minW="70px" fontSize="10px" fontWeight="600" textTransform="uppercase" letterSpacing="0.06em" color="gray.500">
              Estado
            </Text>
            <Text minW="50px" fontSize="10px" fontWeight="600" textTransform="uppercase" letterSpacing="0.06em" color="gray.500">
              Rend.
            </Text>
            <Box w="100px" /> {/* Actions space */}
          </Stack>

          {/* List items */}
          {staff.map((teamMember) => (
            <StaffListItem
              key={teamMember.id}
              teamMember={teamMember}
              onView={handleView}
              onEdit={handleEdit}
              onContact={handleContact}
              onIncident={handleIncident}
            />
          ))}
        </Stack>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* EMPLOYEE FORM MODAL */}
      {/* ═══════════════════════════════════════════════════════ */}
      <EmployeeForm
        teamMember={editingEmployee as TeamMember | undefined}
        isOpen={showEmployeeForm}
        onClose={() => {
          setShowEmployeeForm(false);
          setEditingEmployee(undefined);
        }}
        onSuccess={() => {
          setEditingEmployee(undefined);
        }}
      />
    </Stack>
  );
}
