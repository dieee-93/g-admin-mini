import {
  ContentLayout, Section, StatsSection, CardGrid, MetricCard,
  Button, Alert, Badge, Icon, Stack, Typography, Tabs
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
  CheckCircleIcon
} from '@heroicons/react/24/outline';
// Module Registry integration
import EventBus from '@/lib/events';
import { HookPoint } from '@/lib/modules/HookPoint';
import { useLocation } from '@/contexts/LocationContext';
import { useEffect, useState } from 'react';
import { logger } from '@/lib/logging';

import { useStaffPage } from './hooks';
import { useStaffStore } from '@/store/staffStore';

// Tab sections
import { DirectorySection } from './components/sections/DirectorySection';
import { PerformanceSection } from './components/sections/PerformanceSection';
import { TrainingSection } from './components/sections/TrainingSection';
import { ManagementSection } from './components/sections/ManagementSection';
import { TimeTrackingSection } from './components/sections/TimeTrackingSection';

// Forms and Modals
import { EmployeeForm } from './components/EmployeeForm';
import { Dialog } from '@/shared/ui';
import type { Employee } from '@/services/staff/staffApi';

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
  const { loadStaff } = useStaffStore();

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

  // Modal state for employee forms
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);

  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | undefined>(undefined);
  const { deleteStaffMember } = useStaffStore();

  // Handle delete employee
  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;

    try {
      await deleteStaffMember(deletingEmployee.id);
      setIsDeleteDialogOpen(false);
      setDeletingEmployee(undefined);
      loadStaff(); // Refresh data
    } catch (error) {
      logger.error('StaffPage', 'Error deleting employee', error);
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
        logger.info('StaffStore', '👥 Shift reminder for employee', data);
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
        {/* 📊 MÉTRICAS DE STAFF - SIEMPRE PRIMERO */}
        <StatsSection>
          <Stack direction="row" justify="space-between" align="center" mb="lg">
            <Stack direction="row" gap="sm" align="center" flexWrap="wrap">
              <Badge variant="solid" colorPalette="blue">Security Compliant</Badge>
              <Badge variant="solid" colorPalette="green">{metrics.activeStaff} Activos</Badge>
              {/* 🌎 Multi-Location Badge */}
              {isMultiLocationMode && selectedLocation && (
                <Badge variant="solid" colorPalette="purple">
                  📍 {selectedLocation.name}
                </Badge>
              )}
              <Typography variant="body" size="sm" color="text.muted">
                Directorio, rendimiento, entrenamiento y administración HR
              </Typography>
            </Stack>
            <Button
              variant="solid"
              onClick={() => {
                setEditingEmployee(undefined);
                setIsEmployeeModalOpen(true);
              }}
              size="lg"
            >
              <Icon icon={PlusIcon} size="sm" />
              Nuevo Empleado
            </Button>
          </Stack>
          <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
            <MetricCard
              title="Total Personal"
              value={metrics.totalStaff}
              icon={UsersIcon}
              colorPalette="blue"
            />
            <MetricCard
              title="En Turno"
              value={metrics.onShiftCount}
              icon={ClockIcon}
              colorPalette="green"
            />
            <MetricCard
              title="Rendimiento Prom."
              value={`${(metrics.avgPerformanceRating * 20).toFixed(1)}%`}
              icon={TrophyIcon}
              colorPalette="purple"
              trend={{ value: metrics.avgPerformanceRating, isPositive: metrics.avgPerformanceRating > 3.5 }}
            />
            <MetricCard
              title="Evaluaciones Pendientes"
              value={metrics.upcomingReviews}
              icon={AcademicCapIcon}
              colorPalette="orange"
            />
          </CardGrid>
        </StatsSection>

        {/* 💰 MÉTRICAS DE COSTOS LABORALES */}
        <StatsSection>
          <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
            <MetricCard
              title="Costo Laboral Hoy"
              value={`$${metrics.todayLaborCost.toFixed(2)}`}
              icon={CurrencyDollarIcon}
              colorPalette="teal"
            />
            <MetricCard
              title="Uso Presupuesto"
              value={`${metrics.budgetUtilization.toFixed(1)}%`}
              icon={ArrowTrendingUpIcon}
              colorPalette={metrics.budgetVariance > 10 ? "red" : "green"}
              trend={{ value: metrics.budgetVariance, isPositive: metrics.budgetVariance <= 0 }}
            />
            <MetricCard
              title="Eficiencia"
              value={`${metrics.efficiencyScore.toFixed(1)}%`}
              icon={CheckCircleIcon}
              colorPalette="cyan"
              trend={{ value: metrics.efficiencyScore, isPositive: metrics.efficiencyScore > 80 }}
            />
            <MetricCard
              title="Horas Extra"
              value={`${metrics.totalOvertimeHours.toFixed(1)}h`}
              icon={ExclamationTriangleIcon}
              colorPalette={metrics.overtimeConcerns > 0 ? "orange" : "green"}
            />
          </CardGrid>
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

        {/* 📑 TAB NAVIGATION */}
        <Tabs.Root
          defaultValue="directory"
          value={pageState.activeTab}
          onValueChange={(details) => actions.setActiveTab(details.value as typeof pageState.activeTab)}
          variant="enclosed"
          size="lg"
        >
          <Tabs.List>
            <Tabs.Trigger value="directory">
              <Icon icon={UsersIcon} size="sm" />
              <Typography variant="body" size="sm">Directorio</Typography>
            </Tabs.Trigger>
            <Tabs.Trigger value="performance">
              <Icon icon={TrophyIcon} size="sm" />
              <Typography variant="body" size="sm">Rendimiento</Typography>
            </Tabs.Trigger>
            <Tabs.Trigger value="timetracking">
              <Icon icon={ClockIcon} size="sm" />
              <Typography variant="body" size="sm">Control Tiempo</Typography>
            </Tabs.Trigger>
            <Tabs.Trigger value="training">
              <Icon icon={AcademicCapIcon} size="sm" />
              <Typography variant="body" size="sm">Entrenamiento</Typography>
            </Tabs.Trigger>
            <Tabs.Trigger value="management">
              <Icon icon={ShieldCheckIcon} size="sm" />
              <Typography variant="body" size="sm">Administración</Typography>
            </Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>

          {/* Directory Tab */}
          <Tabs.Content value="directory">
            <DirectorySection
              viewState={viewState}
              onViewStateChange={setViewState}
              onEditEmployee={(employee: Employee) => {
                setEditingEmployee(employee);
                setIsEmployeeModalOpen(true);
              }}
              onDeleteEmployee={(employee: Employee) => {
                setDeletingEmployee(employee);
                setIsDeleteDialogOpen(true);
              }}
            />
          </Tabs.Content>

          {/* Performance Tab */}
          <Tabs.Content value="performance">
            <PerformanceSection
              viewState={viewState}
              onViewStateChange={setViewState}
            />
          </Tabs.Content>

          {/* Time Tracking Tab */}
          <Tabs.Content value="timetracking">
            <TimeTrackingSection
              viewState={viewState}
              onViewStateChange={setViewState}
            />
          </Tabs.Content>

          {/* Training Tab */}
          <Tabs.Content value="training">
            <TrainingSection
              viewState={viewState}
              onViewStateChange={setViewState}
            />
          </Tabs.Content>

          {/* Management Tab */}
          <Tabs.Content value="management">
            <ManagementSection
              viewState={viewState}
              onViewStateChange={setViewState}
            />
          </Tabs.Content>
        </Tabs.Root>

        {/* Extensions Hook Point */}
        <HookPoint name="staff.dashboard" />
      </Stack>

      {/* Employee Form Modal */}
      <EmployeeForm
        employee={editingEmployee}
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
