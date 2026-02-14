// Team Directory Section - Editorial Brutalist Redesign
// Clean, modern team directory with distinctive card design
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
  Spinner
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
import { useTeamWithLoader } from '@/modules/team/hooks';
import type { TeamFilters } from '@/modules/team/hooks/useTeam';
import type { TeamMember } from '@/modules/team/store';
import { TeamMemberForm } from '../TeamMemberForm';
import { TeamCard, TeamListItem } from '../TeamCard';
import type { TeamViewState, TeamMember as TeamMemberDefinition } from '../../types';

// Helper to transform TeamMember to TeamMember format for the form
function teamMemberToEmployee(member: TeamMember): Partial<TeamMemberDefinition> {
  const [firstName, ...lastNameParts] = member.name.split(' ');
  return {
    id: member.id,
    employee_id: '', // Will be generated
    first_name: firstName || '',
    last_name: lastNameParts.join(' ') || '',
    email: member.email,
    phone: member.phone,
    avatar_url: member.avatar,
    position: member.position,
    department: member.department,
    hire_date: member.hire_date,
    employment_status: member.status,
    performance_score: member.performance_score,
    salary: member.salary,
    created_at: member.created_at,
    updated_at: member.updated_at,
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
  viewState: TeamViewState;
  onViewStateChange: (state: TeamViewState) => void;
  onEditEmployee: (teamMember: TeamMemberDefinition) => void;
  onDeleteEmployee: (teamMember: TeamMemberDefinition) => void;
}

export function DirectorySection({
  viewState,
  onViewStateChange,
  onEditEmployee,
  onDeleteEmployee
}: DirectorySectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Query filters
  const filters: TeamFilters = {
    search: searchTerm || undefined,
    department: (selectedDepartment !== 'all' ? selectedDepartment : undefined) as TeamFilters['department'],
    status: (selectedStatus !== 'all' ? selectedStatus : undefined) as TeamFilters['status'],
  };

  const { team: teamMembers, loading, error } = useTeamWithLoader(filters);

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
    // Transform store TeamMember back to likely definition if needed, 
    // or better yet, just pass what we have if types align enough, 
    // but here we use the helper to match expected type
    onEditEmployee(teamMemberToEmployee(teamMember) as TeamMemberDefinition);
  };

  const handleContact = (teamMember: TeamMember, method: 'whatsapp' | 'call' | 'email') => {
    console.log(`Contact ${teamMember.name} via ${method}`);
  };

  const handleIncident = (teamMember: TeamMember) => {
    console.log('Register incident for:', teamMember.id);
    // TODO: Open incident modal
  };

  // Transform API TeamMember to Store TeamMember
  const mapToStoreMember = (member: any): import('@/modules/team/store').TeamMember => ({
    ...member,
    name: `${member.first_name} ${member.last_name}`,
    status: member.employment_status || 'inactive',
    avatar: member.avatar_url || '',
  } as unknown as import('@/modules/team/store').TeamMember);

  const storeTeamMembers = teamMembers.map(mapToStoreMember);

  // ─────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Stack direction={{ base: 'column', md: 'row' }} gap="4" alignItems="end">
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
  if (teamMembers.length === 0 && !hasActiveFilters) {
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
          onClick={() => onEditEmployee({} as TeamMemberDefinition)}
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
          colorPalette={showFilters ? 'blue' : 'gray'}
        >
          <Icon icon={showFilters ? AdjustmentsHorizontalIcon : FunnelIcon} boxSize="4" />
          Filtros
          {hasActiveFilters && (
            <Badge colorPalette="blue" size="sm">
              {[selectedDepartment !== 'all', selectedStatus !== 'all'].filter(Boolean).length}
            </Badge>
          )}
        </Button>

        {/* View mode toggle */}
        <Stack direction="row" gap="1" bg="gray.100" p="1" borderRadius="2px" _dark={{ bg: 'gray.800' }}>
          <IconButton
            aria-label="Vista cuadricula"
            variant={viewState.viewMode === 'grid' ? 'solid' : 'outline'}
            size="sm"
            onClick={() => onViewStateChange({ ...viewState, viewMode: 'grid' })}
            css={{ borderRadius: 'md', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            colorPalette={viewState.viewMode === 'grid' ? 'blue' : 'gray'}
          >          <Icon icon={Squares2X2Icon} boxSize="4" />
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
        <Box ml="auto">
          <Button
            colorPalette="blue"
            size="sm"
            onClick={() => onEditEmployee({} as TeamMemberDefinition)} // Empty for new
          >
            <Icon icon={PlusIcon} boxSize="4" />
            Agregar
          </Button>
        </Box>
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
          alignItems="end"
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
              onValueChange={(e) => {
                if (e.value && e.value.length > 0) setSelectedDepartment(e.value[0]);
                else setSelectedDepartment('all');
              }}
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
              onValueChange={(e) => {
                if (e.value && e.value.length > 0) setSelectedStatus(e.value[0]);
                else setSelectedStatus('all');
              }}
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
              colorPalette="gray"
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
            {storeTeamMembers.length}
          </Text>
          {' '}empleado{storeTeamMembers.length !== 1 ? 's' : ''}
          {hasActiveFilters && ' (filtrado)'}
        </Text>
      </Stack>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* NO RESULTS */}
      {/* ═══════════════════════════════════════════════════════ */}
      {storeTeamMembers.length === 0 && hasActiveFilters && (
        <Stack direction="column" gap="4" py="12" align="center">
          <Text fontSize="15px" color="gray.500">
            No se encontraron empleados con estos filtros
          </Text>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </Stack>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* GRID VIEW */}
      {/* ═══════════════════════════════════════════════════════ */}
      {viewState.viewMode === 'grid' && storeTeamMembers.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap="4">
          {storeTeamMembers.map((teamMember) => (
            <TeamCard
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
      {viewState.viewMode === 'list' && storeTeamMembers.length > 0 && (
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
            alignItems="end"
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
          {storeTeamMembers.map((teamMember) => (
            <TeamListItem
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
      {/* EMPLOYEE FORM MODAL - Removed, lifted to parent */}
      {/* ═══════════════════════════════════════════════════════ */}
      {/* <TeamMemberForm ... /> */}
    </Stack>
  );
}
