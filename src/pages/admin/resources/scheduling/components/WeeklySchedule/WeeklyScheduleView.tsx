// WeeklyScheduleView - Enterprise Calendar with Shared Components
// Migrated to G-Admin Mini v2.1 + Shared Business Components

import { useState, useEffect } from 'react';
import {
  Stack, Button, Icon, Badge, Grid,
  WeeklyCalendar, EmployeeAvailabilityCard,
  Section
} from '@/shared/ui';

import { Skeleton } from '@chakra-ui/react';

// ✅ HEROICONS v2
import {
  PlusIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

// ✅ SHARED TYPES
import type {
  CalendarShift,
  EmployeeAvailability
} from '@/shared/ui';

import type { Shift, ShiftStatus } from '../../types';

import { logger } from '@/lib/logging';
interface WeeklyScheduleViewProps {
  viewState: {
    activeTab: string;
    selectedWeek: string;
    filters: {
      position?: string;
      employee?: string;
      status?: string;
    };
    viewMode: 'week' | 'day' | 'month';
  };
  onViewStateChange: (viewState: unknown) => void;
}

export function WeeklyScheduleView({ viewState, onViewStateChange }: WeeklyScheduleViewProps) {
  const [loading, setLoading] = useState(true);
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(new Date());
  const [employees, setEmployees] = useState<EmployeeAvailability[]>([]);
  const [shifts, setShifts] = useState<CalendarShift[]>([]);

  // ✅ MOCK DATA - será reemplazado por API calls
  useEffect(() => {
    const mockEmployees: EmployeeAvailability[] = [
      {
        id: '1',
        name: 'Ana García',
        position: 'Server',
        availableDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
        preferredShifts: ['morning', 'afternoon'],
        maxWeeklyHours: 40,
        currentWeeklyHours: 32,
        status: 'available',
        reliability: 95,
        averageRating: 4.8,
        totalShiftsThisMonth: 12
      },
      {
        id: '2',
        name: 'Carlos López',
        position: 'Cook',
        availableDays: ['tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        preferredShifts: ['afternoon', 'evening'],
        maxWeeklyHours: 40,
        currentWeeklyHours: 36,
        status: 'available',
        reliability: 88,
        averageRating: 4.5,
        totalShiftsThisMonth: 15
      },
      {
        id: '3',
        name: 'María Rodríguez',
        position: 'Server',
        availableDays: ['wed', 'thu', 'fri', 'sat', 'sun'],
        preferredShifts: ['evening'],
        maxWeeklyHours: 32,
        currentWeeklyHours: 28,
        status: 'available',
        reliability: 92,
        averageRating: 4.7,
        totalShiftsThisMonth: 10
      }
    ];

    const mockShifts: CalendarShift[] = [
      {
        id: '1',
        employeeId: '1',
        employeeName: 'Ana García',
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '17:00',
        position: 'Server',
        status: 'confirmed'
      },
      {
        id: '2',
        employeeId: '2',
        employeeName: 'Carlos López',
        date: '2024-01-15',
        startTime: '11:00',
        endTime: '20:00',
        position: 'Cook',
        status: 'scheduled'
      }
    ];

    setEmployees(mockEmployees);
    setShifts(mockShifts);
    setLoading(false);
  }, [selectedWeekStart]);

  // ✅ HANDLERS
  const handleWeekChange = (newWeek: Date) => {
    setSelectedWeekStart(newWeek);
    onViewStateChange({
      ...viewState,
      selectedWeek: newWeek.toISOString()
    });
  };

  const handleShiftClick = (shift: CalendarShift) => {
    logger.info('API', 'Shift clicked:', shift);
    // TODO: Open shift details modal
  };

  const handleNewShift = (date: string) => {
    logger.info('API', 'New shift for date:', date);
    // TODO: Open new shift modal
  };

  const handleDayClick = (date: string) => {
    logger.info('API', 'Day clicked:', date);
    // TODO: Focus on day view or show day details
  };

  const handleEmployeeAction = (employeeId: string, action: string) => {
    logger.info('API', 'Employee action:', employeeId, action);
    // TODO: Handle employee actions (schedule, contact, etc.)
  };

  if (loading) {
    return (
      <Stack direction="column" gap="md">
        <Skeleton h="60px" />
        <Skeleton h="400px" />
        <Skeleton h="200px" />
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap="md">
      {/* 📅 MAIN WEEKLY CALENDAR */}
      <Section variant="elevated" title="Calendario Semanal">
        <Stack direction="column" gap="md">
          {/* Controls Row */}
          <Stack direction="row" justify="space-between" align="center">
            <Stack direction="row" gap="sm" align="center">
              {/* View Mode Toggle */}
              <Stack direction="row" gap="xs">
                <Button
                  size="sm"
                  variant={viewState.viewMode === 'week' ? 'solid' : 'ghost'}
                  onClick={() => onViewStateChange({...viewState, viewMode: 'week'})}
                >
                  Semana
                </Button>
                <Button
                  size="sm"
                  variant={viewState.viewMode === 'day' ? 'solid' : 'ghost'}
                  onClick={() => onViewStateChange({...viewState, viewMode: 'day'})}
                >
                  Día
                </Button>
              </Stack>

              {/* Quick Filters */}
              <Badge size="sm" colorPalette="blue" variant="outline">
                {shifts.length} turnos programados
              </Badge>
            </Stack>

            <Stack direction="row" gap="sm">
              <Button
                size="sm"
                variant="outline"
                onClick={() => logger.info('API', 'Filters')}
              >
                <Icon icon={AdjustmentsHorizontalIcon} size="sm" />
                Filtros
              </Button>

              <Button
                size="sm"
                variant="solid"
                onClick={() => handleNewShift(new Date().toISOString().split('T')[0])}
              >
                <Icon icon={PlusIcon} size="sm" />
                Nuevo Turno
              </Button>
            </Stack>
          </Stack>

          {/* Weekly Calendar Component */}
          <WeeklyCalendar
            shifts={shifts}
            initialWeek={selectedWeekStart}
            onWeekChange={handleWeekChange}
            onDayClick={handleDayClick}
            onShiftClick={handleShiftClick}
            onNewShift={handleNewShift}
            loading={false}
            config={{
              showCoverage: true, showHours: true, allowNewShifts: true, compactMode: false
            }}
          />
        </Stack>
      </Section>

      {/* 👥 STAFF AVAILABILITY PANEL */}
      <Section variant="elevated" title="Disponibilidad del Personal">
        <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap="md">
          {employees.map(employee => (
            <EmployeeAvailabilityCard
              key={employee.id}
              employee={employee}
              variant="default"
              showActions={true}
              onQuickAction={handleEmployeeAction}
              config={{
                showMetrics: true,
                showContact: false,
                showAvailabilityDetails: true,
                allowScheduling: true
              }}
            />
          ))}
        </Grid>
      </Section>
    </Stack>);
}