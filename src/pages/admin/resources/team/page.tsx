import {
  ContentLayout, Section, StatsSection, CardGrid,
  Button, Alert, Badge, Icon, Stack, Typography, Tabs, Dialog, SimpleGrid
} from '@/shared/ui';
import { StatCard } from '@/shared/widgets/StatCard';
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
import { useDisclosure } from '@/shared/hooks';

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
  const employeeModal = useDisclosure();
  const [editingEmployee, setEditingEmployee] = useState<TeamMember | undefined>(undefined);

  // Delete confirmation state
  const deleteDialog = useDisclosure();
  const [deletingEmployee, setDeletingEmployee] = useState<TeamMember | undefined>(undefined);
  const { deleteTeamMember } = useTeamStore();

  // Handle delete teamMember
  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;

    try {
      await deleteTeamMember(deletingEmployee.id);
      deleteDialog.onClose();
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
      <ContentLayout spacing="normal">
        <div>Cargando datos del personal...</div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout spacing="normal">
        <Stack gap="12">
          <Alert variant="subtle" title={error} />
        </Stack>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">

      <Stack gap="12">
        {/* 📊 UNIFIED METRICS DASHBOARD - Mobile-First Responsive */}
        <StatsSection>
          <Stack direction="row" justify="space-between" align="center" mb="lg" flexWrap="wrap" gap="4">
            <Stack direction="row" gap="sm" align="center" flexWrap="wrap">
              <Badge variant="solid" colorPalette="blue">Security Compliant</Badge>
              <Badge variant="solid" colorPalette="green">{metrics.activeStaff} Activos</Badge>
              {isMultiLocationMode && selectedLocation && (
                <Badge variant="solid" colorPalette="purple">
                  📍 {selectedLocation.name}
                </Badge>
              )}
              <Typography variant="body" size="sm" color="text.muted" display={{ base: 'none', md: 'block' }}>
                Personal, Costos & Rendimiento
              </Typography>
            </Stack>
            <Button
              variant="solid"
              onClick={() => {
                setEditingEmployee(undefined);
                employeeModal.onOpen();
              }}
              size={{ base: 'md', md: 'lg' }}
            >
              <Icon icon={PlusIcon} size="sm" />
              <Typography display={{ base: 'none', sm: 'inline' }}>Nuevo Empleado</Typography>
            </Button>
          </Stack>

          {/* Consolidated Responsive Grid: 1 col mobile → 2 col tablet → 4 col desktop → 6 col wide */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4, xl: 6 }} gap={6}>
            {/* Staff Metrics */}
            <StatCard
              title="Total Personal"
              value={metrics.totalStaff.toString()}
              icon={<Icon as={UsersIcon} />}
              footer="Empleados activos"
            />
            <StatCard
              title="En Turno"
              value={metrics.onShiftCount.toString()}
              icon={<Icon as={ClockIcon} />}
              footer="Trabajando ahora"
              trend={metrics.onShiftCount > 0 ? { value: 'Activo', isPositive: true } : undefined}
            />
            <StatCard
              title="Rendimiento"
              value={`${(metrics.avgPerformanceRating * 20).toFixed(0)}%`}
              icon={<Icon as={TrophyIcon} />}
              trend={{ value: metrics.avgPerformanceRating > 3.5 ? '+5%' : '-2%', isPositive: metrics.avgPerformanceRating > 3.5 }}
              footer="Promedio del equipo"
            />

            {/* Labor Cost Metrics */}
            <StatCard
              title="Costo Laboral"
              value={`$${metrics.todayLaborCost.toFixed(0)}`}
              icon={<Icon as={CurrencyDollarIcon} />}
              footer="Hoy"
              trend={metrics.budgetVariance <= 0 ? { value: 'En presupuesto', isPositive: true } : { value: `+${metrics.budgetVariance.toFixed(0)}%`, isPositive: false }}
            />
            <StatCard
              title="Presupuesto"
              value={`${metrics.budgetUtilization.toFixed(0)}%`}
              icon={<Icon as={ArrowTrendingUpIcon} />}
              trend={{ value: `${metrics.budgetVariance > 0 ? '+' : ''}${metrics.budgetVariance.toFixed(0)}%`, isPositive: metrics.budgetVariance <= 0 }}
              footer="Uso mensual"
            />
            <StatCard
              title="Horas Extra"
              value={`${metrics.totalOvertimeHours.toFixed(1)}h`}
              icon={<Icon as={ExclamationTriangleIcon} />}
              footer="Esta semana"
              trend={metrics.overtimeConcerns > 0 ? { value: `${metrics.overtimeConcerns} alertas`, isPositive: false } : undefined}
            />
          </SimpleGrid>
        </StatsSection>

        {/* 🚨 ALERTAS CRÍTICAS - Solo si existen */}
        {alertsData.length > 0 && (
          <Section variant="elevated" title="Alertas y Notificaciones">
            <Stack direction="column" gap="sm">
              {alertsData.map((alert, index) => (
                <Alert
                  key={index}
                  variant="subtle"
                  title={alert.message}
                  icon={<Icon icon={ExclamationTriangleIcon} size="sm" />}
                />
              ))}
            </Stack>
          </Section>
        )}

        {/* 📑 CONSOLIDATED TAB NAVIGATION - 7 → 5 tabs */}
        <Tabs.Root
          defaultValue="directory"
          value={pageState.activeTab}
          onValueChange={(details) => actions.setActiveTab(details.value as typeof pageState.activeTab)}
          variant="enclosed"
          size="lg"
        >
          <Tabs.List flexWrap={{ base: 'wrap', md: 'nowrap' }} gap={{ base: '2', md: '0' }}>
            <Tabs.Trigger value="directory" flex={{ base: '1 1 45%', md: 'auto' }}>
              <Icon icon={UsersIcon} size="sm" />
              <Typography variant="body" size="sm" display={{ base: 'none', sm: 'inline' }}>Personal</Typography>
            </Tabs.Trigger>
            <Tabs.Trigger value="labor-costs" flex={{ base: '1 1 45%', md: 'auto' }}>
              <Icon icon={ArrowTrendingUpIcon} size="sm" />
              <Typography variant="body" size="sm" display={{ base: 'none', sm: 'inline' }}>Labor & Costos</Typography>
            </Tabs.Trigger>
            <Tabs.Trigger value="timetracking" flex={{ base: '1 1 45%', md: 'auto' }}>
              <Icon icon={ClockIcon} size="sm" />
              <Typography variant="body" size="sm" display={{ base: 'none', sm: 'inline' }}>Control Tiempo</Typography>
            </Tabs.Trigger>
            <Tabs.Trigger value="management" flex={{ base: '1 1 45%', md: 'auto' }}>
              <Icon icon={Cog6ToothIcon} size="sm" />
              <Typography variant="body" size="sm" display={{ base: 'none', sm: 'inline' }}>Gestión</Typography>
            </Tabs.Trigger>
            <Tabs.Trigger value="training" flex={{ base: '1 1 45%', md: 'auto' }}>
              <Icon icon={AcademicCapIcon} size="sm" />
              <Typography variant="body" size="sm" display={{ base: 'none', sm: 'inline' }}>Capacitación</Typography>
              <Badge colorPalette="orange" size="xs" ml="1">Beta</Badge>
            </Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>

          {/* 1. Personal (Directory) Tab */}
          <Tabs.Content value="directory">
            <DirectorySection
              viewState={viewState}
              onViewStateChange={setViewState}
              onEditEmployee={(teamMember: TeamMember) => {
                setEditingEmployee(teamMember);
                employeeModal.onOpen();
              }}
              onDeleteEmployee={(teamMember: TeamMember) => {
                setDeletingEmployee(teamMember);
                deleteDialog.onOpen();
              }}
            />
          </Tabs.Content>

          {/* 2. Labor & Costos (NEW - consolidates Performance + Labor Cost Dashboard) */}
          <Tabs.Content value="labor-costs">
            <Stack gap="6">
              <Alert.Root variant="subtle" colorPalette="blue">
                <Alert.Indicator />
                <Stack>
                  <Alert.Title>Labor & Costos Dashboard</Alert.Title>
                  <Alert.Description>
                    Análisis consolidado de rendimiento del personal y costos laborales
                  </Alert.Description>
                </Stack>
              </Alert.Root>

              {/* Performance Section Content */}
              <PerformanceSection
                viewState={viewState}
                onViewStateChange={setViewState}
              />
            </Stack>
          </Tabs.Content>

          {/* 3. Control de Tiempo Tab */}
          <Tabs.Content value="timetracking">
            <TimeTrackingSection
              viewState={viewState}
              onViewStateChange={setViewState}
            />
          </Tabs.Content>

          {/* 4. Gestión (Consolidated: Management + Policies + Roles) */}
          <Tabs.Content value="management">
            <Stack gap="6">
              <Typography variant="heading" size="lg">Gestión de Personal</Typography>
              <Alert.Root variant="subtle" colorPalette="purple">
                <Alert.Indicator />
                <Stack>
                  <Alert.Title>Sección Consolidada</Alert.Title>
                  <Alert.Description>
                    Administración, políticas y roles de trabajo en un solo lugar
                  </Alert.Description>
                </Stack>
              </Alert.Root>

              {/* Accordion consolidating Management, Policies, Roles */}
              <Section>
                <Tabs.Root defaultValue="admin" variant="enclosed">
                  <Tabs.List>
                    <Tabs.Trigger value="admin">Administración</Tabs.Trigger>
                    <Tabs.Trigger value="policies">Políticas</Tabs.Trigger>
                    <Tabs.Trigger value="roles">Roles de Trabajo</Tabs.Trigger>
                  </Tabs.List>

                  <Tabs.Content value="admin">
                    <ManagementSection
                      viewState={viewState}
                      onViewStateChange={setViewState}
                    />
                  </Tabs.Content>

                  <Tabs.Content value="policies">
                    <StaffPoliciesTab />
                  </Tabs.Content>

                  <Tabs.Content value="roles">
                    <StaffRolesPage />
                  </Tabs.Content>
                </Tabs.Root>
              </Section>
            </Stack>
          </Tabs.Content>

          {/* 5. Capacitación (Beta) Tab */}
          <Tabs.Content value="training">
            <Stack gap="4">
              <Alert.Root variant="subtle" colorPalette="orange">
                <Alert.Indicator />
                <Stack>
                  <Alert.Title>Módulo en Construcción</Alert.Title>
                  <Alert.Description>
                    El sistema de capacitación está en desarrollo. Las funciones mostradas son preliminares.
                  </Alert.Description>
                </Stack>
              </Alert.Root>

              <TrainingSection
                viewState={viewState}
                onViewStateChange={setViewState}
              />
            </Stack>
          </Tabs.Content>
        </Tabs.Root>

        {/* Extensions Hook Point */}
        <HookPoint name="staff.dashboard" />
      </Stack>

      {/* TeamMember Form Modal */}
      <EmployeeForm
        teamMember={editingEmployee}
        isOpen={employeeModal.isOpen}
        onClose={() => {
          employeeModal.onClose();
          setEditingEmployee(undefined);
        }}
        onSuccess={() => {
          employeeModal.onClose();
          setEditingEmployee(undefined);
          // Refresh staff data from database
          loadStaff();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        open={deleteDialog.isOpen}
        onOpenChange={(e) => {
          if (!e.open) {
            deleteDialog.onClose();
            setDeletingEmployee(undefined);
          }
        }}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Confirmar Eliminación</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Typography variant="body">
                ¿Estás seguro de que deseas eliminar a{' '}
                <strong>{deletingEmployee?.first_name} {deletingEmployee?.last_name}</strong>?
              </Typography>
              <Typography variant="body" size="sm" color="text.muted" mt="2">
                Esta acción marcará al empleado como inactivo. No se eliminarán datos de forma permanente.
              </Typography>
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
    </ContentLayout>
  );
}
