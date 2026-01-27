/**
 * SCHEDULING PAGE - v2.0 Unified Calendar System
 *
 * Página principal del módulo de Scheduling con calendario unificado.
 * Soporta múltiples tipos de eventos según capabilities activas.
 *
 * @version 2.0.0 - Calendar-first design
 * @see ./docs/SCHEDULING_CALENDAR_DESIGN.md
 *
 * BACKUP: La versión anterior está en page.tsx.backup
 */

import React, { useState, useMemo } from 'react';
import { Box, Button, Alert, Icon, Stack, Badge, Tabs, Flex, SimpleGrid } from '@/shared/ui';
import { useDisclosure } from '@/shared/hooks';
import { PlusIcon, FunnelIcon, Cog6ToothIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { HookPoint } from '@/lib/modules';
import { useLocation } from '@/contexts/LocationContext';

// Calendar components
import {
  CalendarViewSelector,
  MonthCalendarGrid,
  WeekCalendarGrid,
  DayCalendarTimeline,
  CalendarFiltersPanel
} from '@/modules/scheduling/components/calendar';

// Top bar
import { SchedulingTopBar } from '@/modules/scheduling/components/SchedulingTopBar';

// Availability configuration
import { AvailabilityTab } from '@/modules/scheduling/components/AvailabilityTab';

// Modals
import { ShiftEditorModal, AutoSchedulingModal, AppointmentBookingModal } from '@/modules/scheduling/components';

// Types & Adapters
import type { CalendarView, CalendarFilters, UnifiedScheduleEvent } from '@/modules/scheduling/types/calendar';
import type { Appointment } from '@/modules/scheduling/types/appointments';
import {
  staffShiftAdapter,
  deliveryAdapter,
  timeOffAdapter,
  maintenanceAdapter,
  appointmentAdapter
} from '@/modules/scheduling/adapters';
import { SchedulingUtils } from '@/modules/scheduling/adapters/SchedulingAdapter';

// Hooks
import { useSchedulingPage } from '@/modules/scheduling/hooks';
import { useScheduling } from '@/modules/scheduling/hooks';
import { useAppointments } from '@/modules/scheduling/hooks';

// Systems integration
import { useErrorHandler } from '@/lib/error-handling';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { logger } from '@/lib/logging';

/**
 * SchedulingPage Component - v2.0
 *
 * Estructura:
 * 1. TopBar: Métricas + Alertas compactas
 * 2. CalendarViewSelector: Month/Week/Day tabs + Date navigation
 * 3. Unified Calendar: Vista adaptable según selección
 * 4. Filters Panel: Lateral slide-in
 * 5. Modals: ShiftEditor, AutoScheduling
 */
export default function SchedulingPage() {
  // ============================================
  // SYSTEMS INTEGRATION
  // ============================================

  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();
  const { selectedLocation, isMultiLocationMode } = useLocation();

  // ============================================
  // CALENDAR VIEW STATE (Must be declared first)
  // ============================================

  const [activeTab, setActiveTab] = useState('calendar');
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const filtersDrawer = useDisclosure();

  // ============================================
  // PAGE STATE
  // ============================================

  const {
    schedulingStats,
    isAutoSchedulingOpen,
    isShiftEditorOpen,
    editingShift,
    setIsAutoSchedulingOpen,
    handleScheduleGenerated,
    handleOpenCreateShift,
    handleOpenEditShift,
    handleCloseShiftEditor,
    loading,
    error
  } = useSchedulingPage();

  // Get shifts data
  const { shifts: allShifts, refreshData } = useScheduling();

  // Phase 4: Get appointments data (depends on referenceDate)
  const {
    appointments,
    refreshAppointments
  } = useAppointments({
    dateFrom: new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)
      .toISOString()
      .split('T')[0],
    dateTo: new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0],
    autoLoad: true
  });

  // TODO: Get data from other sources when tables are ready
  // const { deliveries } = useDeliveries();
  // const { timeOffRequests } = useTimeOff();
  // const { maintenanceSchedules } = useMaintenance();

  // Phase 4: Appointment modal state
  const appointmentModal = useDisclosure();
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // ============================================
  // FILTERS STATE
  // ============================================

  const [filters, setFilters] = useState<CalendarFilters>({
    eventTypes: ['staff_shift', 'production', 'appointment', 'delivery', 'time_off', 'maintenance'],
    employeeIds: [],
    departments: ['Kitchen', 'Service', 'Admin', 'Cleaning', 'Management'],
    statuses: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    capabilities: [],
    searchText: undefined
  });

  // ============================================
  // DATA TRANSFORMATION
  // ============================================

  // Convert all data sources to unified events
  const unifiedEvents = useMemo(() => {
    try {
      const events: UnifiedScheduleEvent[] = [];

      // Placeholder data sources (move inside useMemo to avoid dependency warnings)
      const deliveries: unknown[] = []; // Placeholder until deliveries table exists
      const timeOffRequests: unknown[] = []; // Placeholder until time_off_requests ready
      const maintenanceSchedules: unknown[] = []; // Placeholder until maintenance_schedules exists

      // Staff shifts
      if (allShifts.length > 0) {
        events.push(...staffShiftAdapter.adaptMany(allShifts));
      }

      // Phase 4: Appointments
      if (appointments && appointments.length > 0) {
        events.push(...appointmentAdapter.adaptMany(appointments));
      }

      // Deliveries (when data available)
      if (deliveries.length > 0) {
        events.push(...deliveryAdapter.adaptMany(deliveries as never[]));
      }

      // Time-off requests (when data available)
      if (timeOffRequests.length > 0) {
        events.push(...timeOffAdapter.adaptMany(timeOffRequests as never[]));
      }

      // Maintenance schedules (when data available)
      if (maintenanceSchedules.length > 0) {
        events.push(...maintenanceAdapter.adaptMany(maintenanceSchedules as never[]));
      }

      return events;
    } catch (err) {
      logger.error('Scheduling', 'Error adapting events to unified format', err);
      handleError(err as Error);
      return [];
    }
  }, [allShifts, appointments, handleError]);

  // Apply filters
  const filteredEvents = useMemo(() => {
    let filtered = unifiedEvents;

    // Multi-Location Filter: Auto-filter by selected location if in multi-location mode
    if (isMultiLocationMode && selectedLocation) {
      filtered = filtered.filter(event => {
        // Only show events for the selected location
        return event.locationId === selectedLocation.id || !event.locationId; // Include events without location (backwards compatibility)
      });
    }

    // Filter by location_id (manual filter)
    if (filters.locationId) {
      filtered = filtered.filter(event => event.locationId === filters.locationId);
    }

    // Filter by event types
    if (filters.eventTypes.length > 0) {
      filtered = SchedulingUtils.filterByType(filtered, filters.eventTypes);
    }

    // Filter by employees
    if (filters.employeeIds.length > 0) {
      filtered = SchedulingUtils.filterByEmployee(filtered, filters.employeeIds);
    }

    // Filter by departments (exact match)
    if (filters.departments && filters.departments.length > 0) {
      filtered = filtered.filter(event => {
        if (!event.departmentName) return false;
        return filters.departments.includes(event.departmentName);
      });
    }

    // Filter by statuses (exact match)
    if (filters.statuses && filters.statuses.length > 0) {
      filtered = filtered.filter(event => {
        return filters.statuses.includes(event.status);
      });
    }

    // Filter by search text
    if (filters.searchText && filters.searchText.trim().length > 0) {
      const searchLower = filters.searchText.toLowerCase().trim();
      filtered = filtered.filter(event => {
        // Search in title
        if (event.title.toLowerCase().includes(searchLower)) return true;

        // Search in description
        if (event.description?.toLowerCase().includes(searchLower)) return true;

        // Search in employee name
        if (event.employeeName?.toLowerCase().includes(searchLower)) return true;

        // Search in department
        if (event.departmentName?.toLowerCase().includes(searchLower)) return true;

        return false;
      });
    }

    return filtered;
  }, [unifiedEvents, filters, isMultiLocationMode, selectedLocation]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleViewChange = (view: CalendarView) => {
    setCalendarView(view);
    logger.debug('Scheduling', `Calendar view changed to: ${view}`);
  };

  const handleDateChange = (date: Date) => {
    setReferenceDate(date);
  };

  const handleDayClick = (date: Date) => {
    // Navigate to day view when clicking a day in month view
    setReferenceDate(date);
    setCalendarView('day');
  };

  const handleMetricClick = (metric: string) => {
    logger.debug('Scheduling', `Metric clicked: ${metric}`);

    // Handle different metric actions
    switch (metric) {
      case 'total_shifts':
        // Show all staff shifts
        setFilters({
          ...filters,
          eventTypes: ['staff_shift']
        });
        filtersDrawer.onOpen();
        break;

      case 'active_employees':
        // Show filter panel with employee selector
        filtersDrawer.onOpen();
        break;

      case 'coverage_percentage':
        // TODO: Navigate to coverage analysis view when implemented
        logger.info('Scheduling', 'Coverage metric clicked - analysis view pending');
        break;

      case 'total_hours':
        // Show all events (no filter)
        setFilters({
          ...filters,
          eventTypes: ['staff_shift', 'production', 'appointment', 'delivery', 'time_off', 'maintenance']
        });
        break;

      case 'labor_cost':
        // TODO: Navigate to cost analysis view when implemented
        logger.info('Scheduling', 'Labor cost metric clicked - analysis view pending');
        break;

      case 'pending_time_off':
        // Show pending time-off requests
        setFilters({
          ...filters,
          eventTypes: ['time_off'],
          statuses: ['scheduled'] // Pending approval
        });
        filtersDrawer.onOpen();
        break;

      case 'understaffed_shifts':
        // Show understaffed alerts
        // TODO: Implement understaffed filter when coverage data is available
        logger.info('Scheduling', 'Understaffed metric clicked - filter pending');
        break;

      case 'overtime_hours':
        // TODO: Navigate to overtime analysis when implemented
        logger.info('Scheduling', 'Overtime metric clicked - analysis view pending');
        break;

      default:
        logger.warn('Scheduling', `Unknown metric clicked: ${metric}`);
    }
  };

  const handleEventClick = (event: UnifiedScheduleEvent) => {
    logger.debug('Scheduling', `Event clicked:`, event);

    // Handle different event types
    switch (event.type) {
      case 'staff_shift': {
        // Open shift editor modal
        const shift = allShifts.find(s => s.id === event.id);
        if (shift) {
          handleOpenEditShift(shift);
        }
        break;
      }

      case 'delivery': {
        // TODO: Open delivery details modal when deliveries module is ready
        logger.info('Scheduling', 'Delivery event clicked', event.metadata);
        // Future: setSelectedDelivery(event.metadata);
        break;
      }

      case 'time_off': {
        // TODO: Open time-off review modal when time-off module is ready
        logger.info('Scheduling', 'Time-off event clicked', event.metadata);
        // Future: setSelectedTimeOff(event.metadata);
        break;
      }

      case 'maintenance': {
        // TODO: Open maintenance details modal when maintenance module is ready
        logger.info('Scheduling', 'Maintenance event clicked', event.metadata);
        // Future: setSelectedMaintenance(event.metadata);
        break;
      }

      case 'production': {
        // TODO: Open production batch details when production module is active
        logger.info('Scheduling', 'Production event clicked', event.metadata);
        // Future: Navigate to production module with batch ID
        break;
      }

      case 'appointment': {
        // Phase 4: Open appointment editor modal
        const appointment = appointments?.find(a => a.id === event.id);
        if (appointment) {
          setEditingAppointment(appointment);
          appointmentModal.onOpen();
          logger.info('Scheduling', 'Opening appointment editor', { appointmentId: appointment.id });
        } else {
          logger.warn('Scheduling', 'Appointment not found in local data', { eventId: event.id });
        }
        break;
      }

      default:
        logger.warn('Scheduling', `Unknown event type clicked: ${event.type}`);
    }
  };

  const handleEventDrop = async (eventId: string, newStart: Date, newEnd: Date) => {
    try {
      logger.debug('Scheduling', `Event ${eventId} dropped - new time: ${newStart.toISOString()} to ${newEnd.toISOString()}`);

      // Import API dynamically to avoid circular deps
      const { shiftsApi } = await import('@/modules/scheduling/services/schedulingApi');

      // Update event time via API
      await shiftsApi.updateEventTime(eventId, newStart, newEnd);

      // Refresh data to show updated times
      await refreshData();

      logger.info('Scheduling', `Event ${eventId} successfully updated`);
    } catch (err) {
      logger.error('Scheduling', 'Error updating event time', err);
      handleError(err as Error);
    }
  };

  // ============================================
  // CROSS-MODULE ACTION HANDLERS
  // ============================================

  /**
   * Handler: View Staff Availability
   * Filters calendar to show only available employees (no shifts assigned)
   */
  const handleViewStaffAvailability = () => {
    logger.info('Scheduling', 'Filtering to show available staff only');

    // Apply filter to show staff_shift events only
    // Future: Query employees table to find those without shifts on selected date
    setFilters({
      ...filters,
      eventTypes: ['staff_shift'],
      statuses: ['scheduled'] // Show only scheduled (not in_progress/completed)
    });

    filtersDrawer.onOpen();
  };

  /**
   * Handler: Show Sales Forecast
   * Toggles visual overlay showing demand forecast on calendar
   */
  const handleShowSalesForecast = () => {
    logger.info('Scheduling', 'Sales forecast overlay requested', {
      referenceDate: referenceDate.toISOString()
    });

    // TODO: Implement forecast overlay state
    // For now, show all appointment events as proxy for demand
    setFilters({
      ...filters,
      eventTypes: ['appointment', 'staff_shift']
    });

    logger.debug('Scheduling', 'Forecast view activated (using appointments as proxy)');
  };

  /**
   * Handler: Create Stock Reception Event
   * Opens modal/form to schedule material reception
   */
  const handleCreateStockReception = () => {
    logger.info('Scheduling', 'Creating stock reception event');

    // TODO: Open StockReceptionModal when materials module provides it
    // For now, create a maintenance event as placeholder
    logger.warn('Scheduling', 'Stock reception modal not implemented - would create maintenance event');

    // Future implementation:
    // setSelectedStockReception({ date: referenceDate });
    // setIsStockReceptionModalOpen(true);
  };

  // ============================================
  // PHASE 4: APPOINTMENT HANDLERS
  // ============================================

  /**
   * Handler: Open create appointment modal
   */
  const handleOpenCreateAppointment = () => {
    setEditingAppointment(null);
    appointmentModal.onOpen();
    logger.info('Scheduling', 'Opening create appointment modal');
  };

  /**
   * Handler: Close appointment modal
   */
  const handleCloseAppointmentModal = () => {
    appointmentModal.onClose();
    setEditingAppointment(null);
  };

  /**
   * Handler: Appointment created/updated successfully
   */
  const handleAppointmentSuccess = async () => {
    await refreshAppointments();
    await refreshData(); // Refresh all scheduling data
    logger.info('Scheduling', 'Appointment saved successfully, data refreshed');
  };

  /**
   * Handler: Create Production Block
   * Opens modal/form to schedule production batch
   */
  const handleCreateProductionBlock = () => {
    logger.info('Scheduling', 'Creating production block event');

    // TODO: Open ProductionBlockModal when production module provides it
    // For now, log the action
    logger.warn('Scheduling', 'Production block modal not implemented - would create production event');

    // Future implementation:
    // setSelectedProductionBlock({ date: referenceDate });
    // setIsProductionBlockModalOpen(true);
  };

  // ============================================
  // ERROR HANDLING
  // ============================================

  if (error) {
    return (
      <Box p={{ base: "6", md: "8" }}>
        <Stack gap="4" w="100%">
          <Alert status="error" title="Error de carga del módulo">
            {error}
          </Alert>
          <Button onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </Stack>
      </Box>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <Box position="relative" minH="100vh" bg="bg.canvas" overflow="hidden">
      {/* Decorative Background Blobs */}
      <Box
        position="absolute"
        top="-10%"
        right="-5%"
        width="500px"
        height="500px"
        borderRadius="full"
        bg="green.50"
        opacity="0.4"
        filter="blur(80px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-10%"
        left="-5%"
        width="400px"
        height="400px"
        borderRadius="full"
        bg="cyan.50"
        opacity="0.4"
        filter="blur(80px)"
        pointerEvents="none"
      />

      <Box position="relative" zIndex="1" p={{ base: "6", md: "8" }}>

      <Stack gap="8" w="100%">
        {/* Header */}
        <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
          <Flex align="center" gap="3">
            <Box
              p="3"
              bg="linear-gradient(135deg, var(--chakra-colors-green-400), var(--chakra-colors-green-600))"
              borderRadius="xl"
              shadow="lg"
            >
              📅
            </Box>
            <Box>
              <Flex align="center" gap="2" flexWrap="wrap">
                <Box as="h1" fontSize="2xl" fontWeight="bold">
                  Programación de Turnos
                </Box>
                {isMultiLocationMode && selectedLocation && (
                  <Badge variant="solid" colorPalette="purple">
                    {selectedLocation.name}
                  </Badge>
                )}
              </Flex>
            </Box>
          </Flex>
        </Flex>

        {/* OFFLINE WARNING */}
        {!isOnline && (
          <Alert status="warning" title="Modo Offline">
            Los cambios se sincronizarán cuando recuperes la conexión
          </Alert>
        )}

        {/* 1. TOP BAR: Metrics + Critical Alerts */}
        <SchedulingTopBar
          stats={schedulingStats}
          loading={loading}
          onMetricClick={handleMetricClick}
        />

        {/* 2. MAIN TABS: Calendar vs Availability Config */}
        <Box bg="bg.surface" p="6" borderRadius="2xl" shadow="xl">
          <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value)}>
            <Tabs.List>
              <Tabs.Trigger value="calendar">
                <Icon icon={CalendarIcon} size="sm" />
                Calendar & Shifts
              </Tabs.Trigger>
              <Tabs.Trigger value="availability">
                <Icon icon={ClockIcon} size="sm" />
                Availability Configuration
              </Tabs.Trigger>
            </Tabs.List>

            {/* CALENDAR TAB */}
            <Tabs.Content value="calendar">
              <Box pt="6">
                <Stack direction="column" gap="4">
                  {/* Calendar Controls */}
                  <Stack direction="row" justify="space-between" align="center" flexWrap="wrap" gap="4">
                    {/* Left: View Selector */}
                    <CalendarViewSelector
                      view={calendarView}
                      onViewChange={handleViewChange}
                      referenceDate={referenceDate}
                      onDateChange={handleDateChange}
                    />

                    {/* Right: Actions */}
                    <Stack direction="row" gap="2" align="center" flexWrap="wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={filtersDrawer.onOpen}
                      >
                        <Icon icon={FunnelIcon} size="xs" />
                        Filtros
                      </Button>

                      <Button
                        size="sm"
                        colorPalette="blue"
                        onClick={handleOpenCreateShift}
                      >
                        <Icon icon={PlusIcon} size="xs" />
                        Nuevo Turno
                      </Button>

                      <Button
                        size="sm"
                        colorPalette="green"
                        onClick={handleOpenCreateAppointment}
                      >
                        <Icon icon={CalendarIcon} size="xs" />
                        Nueva Cita
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsAutoSchedulingOpen(true)}
                      >
                        <Icon icon={Cog6ToothIcon} size="xs" />
                        Auto-Schedule
                      </Button>

                      {/* HOOKPOINT: Toolbar Actions - Cross-Module */}
                      <HookPoint
                        name="scheduling.toolbar.actions"
                        data={{
                          referenceDate,
                          calendarView,
                          filters,
                          selectedEvents: filteredEvents,
                          // Callbacks for cross-module actions
                          onViewStaffAvailability: handleViewStaffAvailability,
                          onShowSalesForecast: handleShowSalesForecast,
                          onCreateStockReception: handleCreateStockReception,
                          onCreateProductionBlock: handleCreateProductionBlock
                        }}
                        fallback={null}
                        direction="row"
                        gap="2"
                      />
                    </Stack>
                  </Stack>

                  {/* Calendar Grid */}
                  {calendarView === 'month' && (
                    <MonthCalendarGrid
                      referenceDate={referenceDate}
                      events={filteredEvents}
                      onDayClick={handleDayClick}
                      loading={loading}
                    />
                  )}

                  {calendarView === 'week' && (
                    <WeekCalendarGrid
                      referenceDate={referenceDate}
                      events={filteredEvents}
                      onEventClick={handleEventClick}
                      onEventDrop={handleEventDrop}
                      loading={loading}
                    />
                  )}

                  {calendarView === 'day' && (
                    <DayCalendarTimeline
                      referenceDate={referenceDate}
                      events={filteredEvents}
                      onEventClick={handleEventClick}
                      onEventDrop={handleEventDrop}
                      loading={loading}
                    />
                  )}

                  {/* HOOKPOINT: Cross-Module Calendar Events */}
                  <HookPoint
                    name="calendar.events"
                    data={{
                      referenceDate,
                      calendarView,
                      filteredEvents,
                      onEventClick: handleEventClick
                    }}
                    fallback={null}
                    direction="column"
                    gap="3"
                  />
                </Stack>
              </Box>
            </Tabs.Content>

            {/* AVAILABILITY TAB */}
            <Tabs.Content value="availability">
              <Box pt="6">
                <AvailabilityTab location_id={selectedLocation?.id} />
              </Box>
            </Tabs.Content>
          </Tabs.Root>
        </Box>

        {/* 3. FILTERS PANEL (Slide-in from right) */}
        <CalendarFiltersPanel
          filters={filters}
          onFiltersChange={setFilters}
          allEvents={unifiedEvents}
          isOpen={filtersDrawer.isOpen}
          onClose={filtersDrawer.onClose}
        />

        {/* 4. MODALS */}

        {/* Shift Editor Modal */}
        {isShiftEditorOpen && (
          <ShiftEditorModal
            isOpen={isShiftEditorOpen}
            onClose={handleCloseShiftEditor}
            onSuccess={() => {
              handleCloseShiftEditor();
              refreshData();
            }}
            shift={editingShift}
            prefilledDate={referenceDate.toISOString().split('T')[0]}
          />
        )}

        {/* Auto Scheduling Modal */}
        {isAutoSchedulingOpen && (
          <AutoSchedulingModal
            isOpen={isAutoSchedulingOpen}
            onClose={() => setIsAutoSchedulingOpen(false)}
            onScheduleGenerated={handleScheduleGenerated}
            currentWeek={referenceDate.toISOString().split('T')[0]}
          />
        )}

        {/* Phase 4: Appointment Booking Modal */}
        {appointmentModal.isOpen && (
          <AppointmentBookingModal
            isOpen={appointmentModal.isOpen}
            onClose={handleCloseAppointmentModal}
            onSuccess={handleAppointmentSuccess}
            appointment={editingAppointment}
            prefilledDate={referenceDate.toISOString().split('T')[0]}
          />
        )}
      </Stack>
      </Box>
    </Box>
  );
}

/**
 * NOTES & TODOs:
 *
 * COMPLETED IN THIS SESSION:
 * - Calendar-first design with Month view functional
 * - Unified event system with adapters
 * - Filters panel with event type/department/status filters
 * - Compact top bar with metrics + alerts
 * - Week/Day views with detailed implementation TODOs
 *
 * 📋 FUTURE ENHANCEMENTS (Next Session):
 * - Implement Week view with drag & drop
 * - Implement Day view with timeline
 * - Add Production adapter (requires production module)
 * - Add Appointment adapter (requires scheduling_appointment_booking feature)
 * - Add employee multi-select filter
 * - Add search functionality
 * - Mobile responsive optimizations
 * - Keyboard shortcuts (Cmd+N for new shift, arrows for navigation)
 * - Bulk operations (copy week, delete multiple, etc.)
 * - Export to PDF/Excel
 *
 * 🔗 CROSS-MODULE INTEGRATION:
 * - Production module: production blocks in calendar
 * - Sales module: volume forecasts -> staffing suggestions
 * - Customer module: appointments in calendar
 * - Finance module: budget alerts when costs exceed threshold
 *
 * 📚 DOCUMENTATION:
 * - See ./docs/SCHEDULING_CALENDAR_DESIGN.md for full architecture
 * - See ./docs/SCHEDULING_EVENT_TYPES.md for event type specs
 * - See ./docs/SCHEDULING_INTEGRATION_GUIDE.md for adding new event types
 */

