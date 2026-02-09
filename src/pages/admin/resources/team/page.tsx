import {
  ContentLayout, Section, StatsSection,
  Button, Alert, Badge, Icon, Stack, Typography, Tabs, Dialog, SimpleGrid
} from '@/shared/ui';
import { StatCard } from '@/shared/widgets/StatCard';
import {
  UsersIcon,
  AcademicCapIcon,
  PlusIcon,
  ClockIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
// Module Registry integration
import EventBus from '@/lib/events';
import { EventPriority } from '@/lib/events/types';
import { HookPoint } from '@/lib/modules/HookPoint';
import { useLocation } from '@/contexts/LocationContext';
import { useEffect, useState } from 'react';
import { logger } from '@/lib/logging';
import { useDisclosure } from '@/shared/hooks';

import { useTeamPage } from './hooks';
import { useDeleteTeam } from '@/modules/team/hooks';
// import { useTeamStore } from '@/modules/team/store'; // Legacy

// Tab sections
import { DirectorySection } from './components/sections/DirectorySection';
import { PerformanceSection } from './components/sections/PerformanceSection';
import { TrainingSection } from './components/sections/TrainingSection';
import { ManagementSection } from './components/sections/ManagementSection';
import { TimeTrackingSection } from './components/sections/TimeTrackingSection';
import { StaffPoliciesTab } from './tabs/policies';
import { StaffRolesPage } from './tabs/roles';

// Forms and Modals
import { TeamMemberForm } from './components/TeamMemberForm';
import type { TeamMember, TeamViewState } from './types';

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

  const {
    pageState,
    metrics,
    loading,
    error,
    actions,
    alertsData
  } = useTeamPage();

  // Local state for view configuration
  const [viewState, setViewState] = useState<TeamViewState>({
    activeTab: 'directory',
    viewMode: 'grid',
    filters: {},
    sortBy: { field: 'name', direction: 'asc' }
  });

  // Modal state for teamMember forms
  const teamMemberModal = useDisclosure();
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | undefined>(undefined);

  // Delete confirmation state
  const deleteDialog = useDisclosure();
  const [deletingTeamMember, setDeletingTeamMember] = useState<TeamMember | undefined>(undefined);
  const { mutateAsync: deleteTeamMember } = useDeleteTeam();

  // Handle delete teamMember
  const handleDeleteTeamMember = async () => {
    if (!deletingTeamMember) return;

    try {
      await deleteTeamMember(deletingTeamMember.id);
      deleteDialog.onClose();
      setDeletingTeamMember(undefined);
    } catch (error) {
      logger.error('Team', 'Error deleting teamMember', error);
    }
  };

  // EventBus subscriptions - Listen to events from other modules
  useEffect(() => {
    // Listen to kitchen alerts to check staff availability during rush
    const unsubKitchen = EventBus.subscribe(
      'production.alert.*',
      (event) => {
        const data = event.payload as KitchenAlertEventData;
        logger.debug('Team', '👥 Kitchen alert received, checking staff availability', data);
      },
      { moduleId: 'team', priority: EventPriority.NORMAL }
    );

    // Monitor sales orders to track staff workload
    const unsubSales = EventBus.subscribe(
      'sales.order.placed',
      (event) => {
        const data = event.payload as OrderPlacedEventData;
        logger.info('Team', '👥 Order placed, monitoring service load', data);
      },
      { moduleId: 'team', priority: EventPriority.HIGH }
    );

    // Handle shift reminders
    const unsubScheduling = EventBus.subscribe(
      'scheduling.shift.reminder',
      (event) => {
        const data = event.payload as ShiftReminderEventData;
        logger.info('Team', '👥 Shift reminder for teamMember', data);
      },
      { moduleId: 'team', priority: EventPriority.CRITICAL }
    );

    return () => {
      unsubKitchen();
      unsubSales();
      unsubScheduling();
    };
  }, []);

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
                <div className="ml-2">
                  <Badge size="xs" colorPalette="orange">
                    {selectedLocation.name}
                  </Badge>
                </div>
              )}
              <Typography variant="body" size="sm" color="text.muted" display={{ base: 'none', md: 'block' }}>
                Personal, Costos & Rendimiento
              </Typography>
            </Stack>
            <Button
              variant="solid"
              onClick={() => {
                setEditingTeamMember(undefined);
                teamMemberModal.onOpen();
              }}
              size="lg"
            >
              <Icon icon={PlusIcon} size="sm" />
              <Typography display={{ base: 'none', sm: 'inline' }}>Nuevo Empleado</Typography>
            </Button>
          </Stack>

          {/* Consolidated Responsive Grid: 1 col mobile → 2 col tablet → 4 col desktop → 6 col wide */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4, xl: 6 }} gap="6">
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
          value={viewState.activeTab || 'directory'}
          onValueChange={(details) => setViewState(prev => ({ ...prev, activeTab: details.value as any }))}
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
              <div className="ml-1">
                <Badge colorPalette="orange" size="xs">Beta</Badge>
              </div>
            </Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>

          {/* 1. Personal (Directory) Tab */}
          <Tabs.Content value="directory">
            <DirectorySection
              viewState={viewState}
              onViewStateChange={setViewState}
              onEditEmployee={(teamMember: TeamMember) => {
                setEditingTeamMember(teamMember);
                teamMemberModal.onOpen();
              }}
              onDeleteEmployee={(teamMember: TeamMember) => {
                setDeletingTeamMember(teamMember);
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
      <TeamMemberForm
        teamMember={editingTeamMember}
        isOpen={teamMemberModal.isOpen}
        onClose={() => {
          teamMemberModal.onClose();
          setEditingTeamMember(undefined);
        }}
        onSuccess={() => {
          teamMemberModal.onClose();
          setEditingTeamMember(undefined);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        open={deleteDialog.isOpen}
        onOpenChange={(e: any) => {
          if (!e.open) {
            deleteDialog.onClose();
            setDeletingTeamMember(undefined);
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
                <strong>{deletingTeamMember?.first_name} {deletingTeamMember?.last_name}</strong>?
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
                <Button colorPalette="red" onClick={handleDeleteTeamMember}>
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
