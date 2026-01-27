/**
 * Staff Page - Recursos Humanos
 *
 * REFACTORED v6.0 - MAGIC PATTERNS DESIGN
 * Design Principles:
 * - Decorative background blobs for visual depth
 * - Gradient metric cards with top border accents (3px)
 * - Elevated content cards with modern shadows
 * - Responsive grid layouts (SimpleGrid)
 * - Clean spacing system (gap="6/8", p="6/8")
 * - No maxW restrictions (w="100%")
 */

import {
  Box,
  Flex,
  SimpleGrid,
  Stack,
  Text
} from '@chakra-ui/react';
import {
  Button, Alert, Badge, Icon, Tabs, Dialog
} from '@/shared/ui';
import {
  UsersIcon,
  AcademicCapIcon,
  PlusIcon,
  ClockIcon,
  TrophyIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
// Module Registry integration
import EventBus from '@/lib/events';
import { HookPoint } from '@/lib/modules/HookPoint';
import { useLocation } from '@/contexts/LocationContext';
import { useEffect, useState } from 'react';
import { logger } from '@/lib/logging';

import { useStaffPage } from './hooks';
import { useTeamStore } from '@/modules/team/store';

// Tab sections
import { DirectorySection } from './components/sections/DirectorySection';
import { PerformanceSection } from './components/sections/PerformanceSection';
import { TrainingSection } from './components/sections/TrainingSection';
import { ManagementSection } from './components/sections/ManagementSection';
import { TimeTrackingSection } from './components/sections/TimeTrackingSection';
import { StaffPoliciesTab } from './tabs/policies';
import { StaffRolesPage } from './tabs/roles';

// Forms and Modals
import { EmployeeForm } from './components/EmployeeForm';
import type { TeamMember } from './types';

// EventBus payload types for cross-module communication
interface KitchenAlertEventData {
  type: 'rush_hour' | 'understaffed' | 'quality_issue';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

interface OrderPlacedEventData {
  orderId: string;
  tableNumber?: number;
  itemCount: number;
}

interface ShiftReminderEventData {
  employeeId: string;
  employeeName: string;
  shiftStart: string;
  minutesUntilShift: number;
}

export default function StaffPage() {
  // Module integration (EventBus + Module Registry Hooks)
  const { selectedLocation, isMultiLocationMode } = useLocation();
  const { loadStaff } = useTeamStore();

  const {
    pageState,
    metrics,
    loading,
    error,
    actions,
    alertsData
  } = useStaffPage();

  // Local state for view configuration
  const [viewState, setViewState] = useState({
    viewMode: 'grid' as 'grid' | 'list',
    sortBy: 'name',
    sortDirection: 'asc' as 'asc' | 'desc'
  });

  // Modal state for teamMember forms
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<TeamMember | undefined>(undefined);

  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<TeamMember | undefined>(undefined);
  const { deleteTeamMember } = useTeamStore();

  // Handle delete teamMember
  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;

    try {
      await deleteTeamMember(deletingEmployee.id);
      setIsDeleteDialogOpen(false);
      setDeletingEmployee(undefined);
      loadStaff(); // Refresh data
    } catch (error) {
      logger.error('StaffPage', 'Error deleting teamMember', error);
    }
  };

  // EventBus subscriptions - Listen to events from other modules
  useEffect(() => {
    // Listen to kitchen alerts to check staff availability during rush
    const unsubKitchen = EventBus.subscribe(
      'production.alert.*',
      (event) => {
        const data = event.payload as KitchenAlertEventData;
        logger.debug('StaffStore', '👥 Kitchen alert received, checking staff availability', data);
        // TODO: Check if more kitchen staff needed during rush
        // TODO: Trigger alert if understaffed
      },
      { moduleId: 'staff', priority: 75 }
    );

    // Monitor sales orders to track staff workload
    const unsubSales = EventBus.subscribe(
      'sales.order.placed',
      (event) => {
        const data = event.payload as OrderPlacedEventData;
        logger.info('StaffStore', '👥 Order placed, monitoring service load', data);
        // TODO: Monitor staff workload for service optimization
        // TODO: Alert if service staff overloaded
      },
      { moduleId: 'staff', priority: 50 }
    );

    // Handle shift reminders
    const unsubScheduling = EventBus.subscribe(
      'scheduling.shift.reminder',
      (event) => {
        const data = event.payload as ShiftReminderEventData;
        logger.info('StaffStore', '👥 Shift reminder for teamMember', data);
        // TODO: Send notifications to staff about upcoming shifts
        // TODO: Update UI to show pending shift starts
      },
      { moduleId: 'staff', priority: 100 }
    );

    return () => {
      unsubKitchen();
      unsubSales();
      unsubScheduling();
    };
  }, []);

  // Staff event emitters - Available for future use when implementing tab sections
  // These will be used when DirectorySection, TimeTrackingSection, etc. are implemented
  // const handleShiftChange = (staffId: string, shiftData: ShiftChangeData) => { ... };
  // const handleClockIn = (staffId: string, location: string) => { ... };
  // const handleClockOut = (staffId: string) => { ... };
  // const handlePerformanceAlert = (staffId: string, alertType: string, severity: 'low' | 'medium' | 'high') => { ... };

  if (loading) {
    return (
      <Box p={{ base: "6", md: "8" }}>
        <div>Cargando datos del personal...</div>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={{ base: "6", md: "8" }}>
        <Alert title={error} />
      </Box>
    );
  }

  return (
    <Box position="relative" minH="100vh" bg="bg.canvas" overflow="hidden">
      {/* Decorative background elements */}
      <Box position="absolute" top="-10%" right="-5%" width="500px" height="500px" borderRadius="full" bg="indigo.50" opacity="0.4" filter="blur(80px)" pointerEvents="none" />
      <Box position="absolute" bottom="-10%" left="-5%" width="400px" height="400px" borderRadius="full" bg="blue.50" opacity="0.4" filter="blur(80px)" pointerEvents="none" />

      <Box position="relative" zIndex="1" p={{ base: "6", md: "8" }}>
        <Stack gap="8" w="100%">

          {/* ═══════════════════════════════════════════════════════════════
              HEADER - Title + Actions
              ═══════════════════════════════════════════════════════════════ */}
          <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
            <Flex align="center" gap="3">
              <Box bg="linear-gradient(135deg, var(--chakra-colors-indigo-500) 0%, var(--chakra-colors-indigo-600) 100%)" p="3" borderRadius="xl" shadow="lg">
                <Text fontSize="2xl">👥</Text>
              </Box>
              <Box>
                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="extrabold" color="indigo.600">
                  Recursos Humanos
                </Text>
                <Flex align="center" gap="2" mt="1" flexWrap="wrap">
                  <Badge colorPalette="blue" size="sm">🔒 Security Compliant</Badge>
                  <Badge colorPalette="green" size="sm">{metrics.activeStaff} Activos</Badge>
                  {isMultiLocationMode && selectedLocation && (
                    <Badge colorPalette="purple" size="sm">
                      📍 {selectedLocation.name}
                    </Badge>
                  )}
                </Flex>
              </Box>
            </Flex>

            <Button
              colorPalette="indigo"
              size="lg"
              onClick={() => {
                setEditingEmployee(undefined);
                setIsEmployeeModalOpen(true);
              }}
            >
              <Icon icon={PlusIcon} size="sm" />
              Nuevo Empleado
            </Button>
          </Flex>

          {/* ═══════════════════════════════════════════════════════════════
              METRICS CARDS - Gradient style (6 cards)
              ═══════════════════════════════════════════════════════════════ */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 6 }} gap="4">
            {/* Total Personal */}
            <Box position="relative" overflow="hidden" bg="bg.surface" p="5" borderRadius="xl" shadow="md" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
              <Box position="absolute" top={0} left={0} right={0} h="3px" bg="linear-gradient(90deg, var(--chakra-colors-indigo-400) 0%, var(--chakra-colors-indigo-600) 100%)" />
              <Flex justify="space-between" align="start" mb="3">
                <Box p="2" bg="indigo.500/10" borderRadius="lg">
                  <Icon icon={UsersIcon} size="md" color="indigo.500" />
                </Box>
              </Flex>
              <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" mb="1">Total Personal</Text>
              <Text fontSize="2xl" fontWeight="bold" color="indigo.600">{metrics.totalStaff}</Text>
              <Text fontSize="xs" color="text.muted" mt="1">Empleados activos</Text>
            </Box>

            {/* En Turno */}
            <Box position="relative" overflow="hidden" bg="bg.surface" p="5" borderRadius="xl" shadow="md" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
              <Box position="absolute" top={0} left={0} right={0} h="3px" bg="linear-gradient(90deg, var(--chakra-colors-green-400) 0%, var(--chakra-colors-green-600) 100%)" />
              <Flex justify="space-between" align="start" mb="3">
                <Box p="2" bg="green.500/10" borderRadius="lg">
                  <Icon icon={ClockIcon} size="md" color="green.500" />
                </Box>
                {metrics.onShiftCount > 0 && <Badge colorPalette="green" size="sm">Activo</Badge>}
              </Flex>
              <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" mb="1">En Turno</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">{metrics.onShiftCount}</Text>
              <Text fontSize="xs" color="text.muted" mt="1">Trabajando ahora</Text>
            </Box>

            {/* Rendimiento */}
            <Box position="relative" overflow="hidden" bg="bg.surface" p="5" borderRadius="xl" shadow="md" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
              <Box position="absolute" top={0} left={0} right={0} h="3px" bg="linear-gradient(90deg, var(--chakra-colors-yellow-400) 0%, var(--chakra-colors-yellow-600) 100%)" />
              <Flex justify="space-between" align="start" mb="3">
                <Box p="2" bg="yellow.500/10" borderRadius="lg">
                  <Icon icon={TrophyIcon} size="md" color="yellow.600" />
                </Box>
                <Badge colorPalette={metrics.avgPerformanceRating > 3.5 ? "green" : "orange"} size="sm">
                  {metrics.avgPerformanceRating > 3.5 ? '+5%' : '-2%'}
                </Badge>
              </Flex>
              <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" mb="1">Rendimiento</Text>
              <Text fontSize="2xl" fontWeight="bold" color="yellow.600">{(metrics.avgPerformanceRating * 20).toFixed(0)}%</Text>
              <Text fontSize="xs" color="text.muted" mt="1">Promedio del equipo</Text>
            </Box>

            {/* Costo Laboral */}
            <Box position="relative" overflow="hidden" bg="bg.surface" p="5" borderRadius="xl" shadow="md" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
              <Box position="absolute" top={0} left={0} right={0} h="3px" bg="linear-gradient(90deg, var(--chakra-colors-blue-400) 0%, var(--chakra-colors-blue-600) 100%)" />
              <Flex justify="space-between" align="start" mb="3">
                <Box p="2" bg="blue.500/10" borderRadius="lg">
                  <Icon icon={CurrencyDollarIcon} size="md" color="blue.500" />
                </Box>
                <Badge colorPalette={metrics.budgetVariance <= 0 ? "green" : "red"} size="sm">
                  {metrics.budgetVariance <= 0 ? 'En presupuesto' : `+${metrics.budgetVariance.toFixed(0)}%`}
                </Badge>
              </Flex>
              <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" mb="1">Costo Laboral</Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">${metrics.todayLaborCost.toFixed(0)}</Text>
              <Text fontSize="xs" color="text.muted" mt="1">Hoy</Text>
            </Box>

            {/* Presupuesto */}
            <Box position="relative" overflow="hidden" bg="bg.surface" p="5" borderRadius="xl" shadow="md" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
              <Box position="absolute" top={0} left={0} right={0} h="3px" bg="linear-gradient(90deg, var(--chakra-colors-purple-400) 0%, var(--chakra-colors-purple-600) 100%)" />
              <Flex justify="space-between" align="start" mb="3">
                <Box p="2" bg="purple.500/10" borderRadius="lg">
                  <Icon icon={ArrowTrendingUpIcon} size="md" color="purple.500" />
                </Box>
                <Badge colorPalette={metrics.budgetVariance <= 0 ? "green" : "orange"} size="sm">
                  {metrics.budgetVariance > 0 ? '+' : ''}{metrics.budgetVariance.toFixed(0)}%
                </Badge>
              </Flex>
              <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" mb="1">Presupuesto</Text>
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">{metrics.budgetUtilization.toFixed(0)}%</Text>
              <Text fontSize="xs" color="text.muted" mt="1">Uso mensual</Text>
            </Box>

            {/* Horas Extra */}
            <Box position="relative" overflow="hidden" bg="bg.surface" p="5" borderRadius="xl" shadow="md" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
              <Box position="absolute" top={0} left={0} right={0} h="3px" bg="linear-gradient(90deg, var(--chakra-colors-orange-400) 0%, var(--chakra-colors-orange-600) 100%)" />
              <Flex justify="space-between" align="start" mb="3">
                <Box p="2" bg="orange.500/10" borderRadius="lg">
                  <Icon icon={ExclamationTriangleIcon} size="md" color="orange.500" />
                </Box>
                {metrics.overtimeConcerns > 0 && <Badge colorPalette="red" size="sm">{metrics.overtimeConcerns} alertas</Badge>}
              </Flex>
              <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" mb="1">Horas Extra</Text>
              <Text fontSize="2xl" fontWeight="bold" color="orange.600">{metrics.totalOvertimeHours.toFixed(1)}h</Text>
              <Text fontSize="xs" color="text.muted" mt="1">Esta semana</Text>
            </Box>
          </SimpleGrid>

          {/* 🚨 ALERTAS CRÍTICAS */}
          {alertsData.length > 0 && (
            <Box bg="bg.surface" p="6" borderRadius="2xl" shadow="md">
              <Text fontSize="lg" fontWeight="bold" mb="4">⚠️ Alertas y Notificaciones</Text>
              <Stack gap="3">
                {alertsData.map((alert, index) => (
                  <Alert key={index} title={alert.message}>
                    <Icon icon={ExclamationTriangleIcon} size="sm" />
                  </Alert>
                ))}
              </Stack>
            </Box>
          )}

          {/* 📑 CONSOLIDATED TAB NAVIGATION - Elevated Card */}
          <Box bg="bg.surface" p="6" borderRadius="2xl" shadow="xl">
            <Tabs.Root
              defaultValue="directory"
              value={pageState.activeTab}
              onValueChange={(details) => actions.setActiveTab(details.value as typeof pageState.activeTab)}
            >
              <Tabs.List flexWrap={{ base: 'wrap', md: 'nowrap' }} gap={{ base: '2', md: '0' }}>
                <Tabs.Trigger value="directory" flex={{ base: '1 1 45%', md: 'auto' }}>
                  <Icon icon={UsersIcon} size="sm" />
                  <Text display={{ base: 'none', sm: 'inline' }}>Personal</Text>
                </Tabs.Trigger>
                <Tabs.Trigger value="labor-costs" flex={{ base: '1 1 45%', md: 'auto' }}>
                  <Icon icon={ArrowTrendingUpIcon} size="sm" />
                  <Text display={{ base: 'none', sm: 'inline' }}>Labor & Costos</Text>
                </Tabs.Trigger>
                <Tabs.Trigger value="timetracking" flex={{ base: '1 1 45%', md: 'auto' }}>
                  <Icon icon={ClockIcon} size="sm" />
                  <Text display={{ base: 'none', sm: 'inline' }}>Control Tiempo</Text>
                </Tabs.Trigger>
                <Tabs.Trigger value="management" flex={{ base: '1 1 45%', md: 'auto' }}>
                  <Icon icon={Cog6ToothIcon} size="sm" />
                  <Text display={{ base: 'none', sm: 'inline' }}>Gestión</Text>
                </Tabs.Trigger>
                <Tabs.Trigger value="training" flex={{ base: '1 1 45%', md: 'auto' }}>
                  <Icon icon={AcademicCapIcon} size="sm" />
                  <Text display={{ base: 'none', sm: 'inline' }}>Capacitación</Text>
                  <Badge colorPalette="orange" size="xs" ml="1">Beta</Badge>
                </Tabs.Trigger>
              </Tabs.List>

              {/* 1. Personal (Directory) Tab */}
              <Tabs.Content value="directory">
                <Box pt="6">
                  <DirectorySection
                    viewState={viewState}
                    onViewStateChange={setViewState}
                    onEditEmployee={(teamMember: TeamMember) => {
                      setEditingEmployee(teamMember);
                      setIsEmployeeModalOpen(true);
                    }}
                    onDeleteEmployee={(teamMember: TeamMember) => {
                      setDeletingEmployee(teamMember);
                      setIsDeleteDialogOpen(true);
                    }}
                  />
                </Box>
              </Tabs.Content>

              {/* 2. Labor & Costos */}
              <Tabs.Content value="labor-costs">
                <Stack gap="6" pt="6">
                  <Alert colorPalette="blue" title="Labor & Costos Dashboard">
                    Análisis consolidado de rendimiento del personal y costos laborales
                  </Alert>
                  <PerformanceSection
                    viewState={viewState}
                    onViewStateChange={setViewState}
                  />
                </Stack>
              </Tabs.Content>

              {/* 3. Control de Tiempo Tab */}
              <Tabs.Content value="timetracking">
                <Box pt="6">
                  <TimeTrackingSection
                    viewState={viewState}
                    onViewStateChange={setViewState}
                  />
                </Box>
              </Tabs.Content>

              {/* 4. Gestión (Consolidated) */}
              <Tabs.Content value="management">
                <Stack gap="6" pt="6">
                  <Text fontSize="xl" fontWeight="bold">Gestión de Personal</Text>
                  <Alert colorPalette="purple" title="Sección Consolidada">
                    Administración, políticas y roles de trabajo en un solo lugar
                  </Alert>

                  <Tabs.Root defaultValue="admin">
                    <Tabs.List>
                      <Tabs.Trigger value="admin">Administración</Tabs.Trigger>
                      <Tabs.Trigger value="policies">Políticas</Tabs.Trigger>
                      <Tabs.Trigger value="roles">Roles de Trabajo</Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="admin">
                      <Box pt="6">
                        <ManagementSection
                          viewState={viewState}
                          onViewStateChange={setViewState}
                        />
                      </Box>
                    </Tabs.Content>

                    <Tabs.Content value="policies">
                      <Box pt="6">
                        <StaffPoliciesTab />
                      </Box>
                    </Tabs.Content>

                    <Tabs.Content value="roles">
                      <Box pt="6">
                        <StaffRolesPage />
                      </Box>
                    </Tabs.Content>
                  </Tabs.Root>
                </Stack>
              </Tabs.Content>

              {/* 5. Capacitación (Beta) */}
              <Tabs.Content value="training">
                <Stack gap="4" pt="6">
                  <Alert colorPalette="orange" title="Módulo en Construcción">
                    El sistema de capacitación está en desarrollo. Las funciones mostradas son preliminares.
                  </Alert>
                  <TrainingSection
                    viewState={viewState}
                    onViewStateChange={setViewState}
                  />
                </Stack>
              </Tabs.Content>
            </Tabs.Root>
          </Box>

          {/* Extensions Hook Point */}
          <HookPoint name="staff.dashboard" />

          {/* TeamMember Form Modal */}
          <EmployeeForm
            teamMember={editingEmployee}
            isOpen={isEmployeeModalOpen}
            onClose={() => {
              setIsEmployeeModalOpen(false);
              setEditingEmployee(undefined);
            }}
            onSuccess={() => {
              setIsEmployeeModalOpen(false);
              setEditingEmployee(undefined);
              // Refresh staff data from database
              loadStaff();
            }}
          />

          {/* Delete Confirmation Dialog */}
          <Dialog.Root
            open={isDeleteDialogOpen}
            onOpenChange={(e) => {
              setIsDeleteDialogOpen(e.open);
              if (!e.open) setDeletingEmployee(undefined);
            }}
          >
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Confirmar Eliminación</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <Text>
                    ¿Estás seguro de que deseas eliminar a{' '}
                    <strong>{deletingEmployee?.first_name} {deletingEmployee?.last_name}</strong>?
                  </Text>
                  <Text fontSize="sm" color="text.muted" mt="2">
                    Esta acción marcará al empleado como inactivo. No se eliminarán datos de forma permanente.
                  </Text>
                </Dialog.Body>
                <Dialog.Footer>
                  <Stack direction="row" gap="3" justify="end">
                    <Dialog.CloseTrigger asChild>
                      <Button variant="outline">Cancelar</Button>
                    </Dialog.CloseTrigger>
                    <Button colorPalette="red" onClick={handleDeleteEmployee}>
                      Eliminar
                    </Button>
                  </Stack>
                </Dialog.Footer>
                <Dialog.CloseTrigger />
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>

        </Stack>
      </Box>
    </Box>
  );
}