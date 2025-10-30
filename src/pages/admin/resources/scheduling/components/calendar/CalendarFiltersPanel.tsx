/**
 * CALENDAR FILTERS PANEL
 *
 * Panel lateral/dropdown con filtros del calendario.
 * Permite filtrar por tipo, empleado, departamento, estado.
 *
 * @version 2.0.0 - Added employee filter
 * @see ../../docs/SCHEDULING_CALENDAR_DESIGN.md#filters
 */

import React, { useMemo, useState } from 'react';
import { Stack, Button, Typography, Badge, Icon, Input } from '@/shared/ui';
import { FunnelIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { CalendarFilters, EventType, EventStatus, UnifiedScheduleEvent } from '../../types/calendar';

export interface CalendarFiltersPanelProps {
  /** Filtros actuales */
  filters: CalendarFilters;

  /** Callback cuando cambian los filtros */
  onFiltersChange: (filters: CalendarFilters) => void;

  /** Eventos totales (para contar por categoría) */
  allEvents: UnifiedScheduleEvent[];

  /** Si el panel está abierto */
  isOpen: boolean;

  /** Callback para cerrar */
  onClose: () => void;
}

/**
 * CalendarFiltersPanel Component
 *
 * Renderiza panel de filtros con:
 * - Checkboxes por tipo de evento
 * - Checkboxes por departamento
 * - Checkboxes por estado
 * - Contador de eventos por categoría
 * - Botón "Clear All"
 */
export function CalendarFiltersPanel({
  filters,
  onFiltersChange,
  allEvents,
  isOpen,
  onClose
}: CalendarFiltersPanelProps) {

  // ============================================
  // LOCAL STATE
  // ============================================

  const [searchInput, setSearchInput] = useState(filters.searchText || '');

  // ============================================
  // CALCULATE COUNTS
  // ============================================

  const counts = useMemo(() => {
    return {
      byType: countEventsByType(allEvents),
      byDepartment: countEventsByDepartment(allEvents),
      byStatus: countEventsByStatus(allEvents),
      byEmployee: countEventsByEmployee(allEvents)
    };
  }, [allEvents]);

  // Extract unique employees from events
  const uniqueEmployees = useMemo(() => {
    const employeeMap = new Map<string, { id: string; name: string }>();

    allEvents.forEach(event => {
      if (event.employeeId && event.employeeName) {
        employeeMap.set(event.employeeId, {
          id: event.employeeId,
          name: event.employeeName
        });
      }
    });

    return Array.from(employeeMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [allEvents]);

  // ============================================
  // HANDLERS
  // ============================================

  const toggleEventType = (type: EventType) => {
    const newTypes = filters.eventTypes.includes(type)
      ? filters.eventTypes.filter(t => t !== type)
      : [...filters.eventTypes, type];

    onFiltersChange({ ...filters, eventTypes: newTypes });
  };

  const toggleDepartment = (dept: string) => {
    const newDepts = filters.departments.includes(dept)
      ? filters.departments.filter(d => d !== dept)
      : [...filters.departments, dept];

    onFiltersChange({ ...filters, departments: newDepts });
  };

  const toggleStatus = (status: EventStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];

    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const toggleEmployee = (employeeId: string) => {
    const newEmployeeIds = filters.employeeIds.includes(employeeId)
      ? filters.employeeIds.filter(id => id !== employeeId)
      : [...filters.employeeIds, employeeId];

    onFiltersChange({ ...filters, employeeIds: newEmployeeIds });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    onFiltersChange({ ...filters, searchText: value || undefined });
  };

  const clearSearch = () => {
    setSearchInput('');
    onFiltersChange({ ...filters, searchText: undefined });
  };

  const clearAll = () => {
    setSearchInput('');
    onFiltersChange({
      eventTypes: EVENT_TYPES,
      employeeIds: [],
      departments: DEPARTMENTS,
      statuses: EVENT_STATUSES,
      capabilities: [],
      searchText: undefined
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.eventTypes.length < EVENT_TYPES.length ||
      filters.departments.length < DEPARTMENTS.length ||
      filters.statuses.length < EVENT_STATUSES.length ||
      filters.employeeIds.length > 0
    );
  };

  // ============================================
  // RENDER
  // ============================================

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '320px',
        backgroundColor: 'white',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        padding: '20px',
        overflowY: 'auto'
      }}
    >
      <Stack direction="column" gap={4}>
        {/* Header */}
        <Stack direction="row" justify="space-between" align="center">
          <Stack direction="row" align="center" gap={2}>
            <Icon icon={FunnelIcon} size="sm" />
            <Typography variant="heading" size="md" fontWeight="bold">
              Filtros
            </Typography>
          </Stack>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            aria-label="Cerrar filtros"
          >
            <Icon icon={XMarkIcon} size="sm" />
          </Button>
        </Stack>

        {/* Clear All Button */}
        {hasActiveFilters() && (
          <Button
            size="sm"
            variant="outline"
            colorPalette="red"
            onClick={clearAll}
            w="full"
          >
            Limpiar Filtros
          </Button>
        )}

        {/* SEARCH */}
        <Stack direction="column" gap={2}>
          <Typography variant="body" size="sm" fontWeight="semibold" color="gray.700">
            Buscar
          </Typography>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
              <Icon icon={MagnifyingGlassIcon} size="sm" color="gray.400" />
            </div>
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#3B82F6'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                aria-label="Limpiar búsqueda"
              >
                <Icon icon={XMarkIcon} size="xs" color="gray.500" />
              </button>
            )}
          </div>
        </Stack>

        {/* EVENT TYPES */}
        <Stack direction="column" gap={2}>
          <Typography variant="body" size="sm" fontWeight="semibold" color="gray.700">
            Tipo de Evento
          </Typography>

          {EVENT_TYPES.map(type => (
            <FilterCheckbox
              key={type}
              label={getEventTypeLabel(type)}
              count={counts.byType[type] || 0}
              checked={filters.eventTypes.includes(type)}
              onChange={() => toggleEventType(type)}
            />
          ))}
        </Stack>

        {/* DEPARTMENTS */}
        <Stack direction="column" gap={2}>
          <Typography variant="body" size="sm" fontWeight="semibold" color="gray.700">
            Departamento
          </Typography>

          {DEPARTMENTS.map(dept => (
            <FilterCheckbox
              key={dept}
              label={dept}
              count={counts.byDepartment[dept] || 0}
              checked={filters.departments.includes(dept)}
              onChange={() => toggleDepartment(dept)}
            />
          ))}
        </Stack>

        {/* STATUSES */}
        <Stack direction="column" gap={2}>
          <Typography variant="body" size="sm" fontWeight="semibold" color="gray.700">
            Estado
          </Typography>

          {EVENT_STATUSES.map(status => (
            <FilterCheckbox
              key={status}
              label={getStatusLabel(status)}
              count={counts.byStatus[status] || 0}
              checked={filters.statuses.includes(status)}
              onChange={() => toggleStatus(status)}
            />
          ))}
        </Stack>

        {/* EMPLOYEES */}
        {uniqueEmployees.length > 0 && (
          <Stack direction="column" gap={2}>
            <Typography variant="body" size="sm" fontWeight="semibold" color="gray.700">
              Empleado
            </Typography>

            {uniqueEmployees.map(employee => (
              <FilterCheckbox
                key={employee.id}
                label={employee.name}
                count={counts.byEmployee[employee.id] || 0}
                checked={filters.employeeIds.includes(employee.id)}
                onChange={() => toggleEmployee(employee.id)}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface FilterCheckboxProps {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}

function FilterCheckbox({ label, count, checked, onChange }: FilterCheckboxProps) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        backgroundColor: checked ? '#EBF8FF' : 'transparent'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = checked ? '#EBF8FF' : '#F7FAFC'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = checked ? '#EBF8FF' : 'transparent'; }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ cursor: 'pointer' }}
      />

      <Typography variant="body" size="sm" flex="1">
        {label}
      </Typography>

      <Badge size="sm" colorPalette={checked ? 'blue' : 'gray'}>
        {count}
      </Badge>
    </label>
  );
}

// ============================================
// CONSTANTS
// ============================================

const EVENT_TYPES: EventType[] = [
  'staff_shift',
  'production',
  'appointment',
  'delivery',
  'time_off',
  'maintenance'
];

const DEPARTMENTS = ['Kitchen', 'Service', 'Admin', 'Cleaning', 'Management'];

const EVENT_STATUSES: EventStatus[] = [
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled'
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

function countEventsByType(events: UnifiedScheduleEvent[]): Record<EventType, number> {
  return events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<EventType, number>);
}

function countEventsByDepartment(events: UnifiedScheduleEvent[]): Record<string, number> {
  return events.reduce((acc, event) => {
    const dept = event.departmentName || 'Sin Departamento';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function countEventsByStatus(events: UnifiedScheduleEvent[]): Record<EventStatus, number> {
  return events.reduce((acc, event) => {
    acc[event.status] = (acc[event.status] || 0) + 1;
    return acc;
  }, {} as Record<EventStatus, number>);
}

function countEventsByEmployee(events: UnifiedScheduleEvent[]): Record<string, number> {
  return events.reduce((acc, event) => {
    if (event.employeeId) {
      acc[event.employeeId] = (acc[event.employeeId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
}

function getEventTypeLabel(type: EventType): string {
  const labels: Record<EventType, string> = {
    staff_shift: 'Turnos de Personal',
    production: 'Producción',
    appointment: 'Citas',
    delivery: 'Entregas',
    time_off: 'Permisos',
    maintenance: 'Mantenimiento'
  };
  return labels[type];
}

function getStatusLabel(status: EventStatus): string {
  const labels: Record<EventStatus, string> = {
    scheduled: 'Programado',
    confirmed: 'Confirmado',
    in_progress: 'En Curso',
    completed: 'Completado',
    cancelled: 'Cancelado',
    no_show: 'No se presentó'
  };
  return labels[status];
}
