// EmployeeAvailabilityCard.tsx - Enterprise Employee Availability Component
// Shared component para mostrar disponibilidad de empleados
// Compatible con G-Admin Mini v2.1 Design System

import React from 'react';
import {
  Stack, Badge, Icon, Avatar
} from '@/shared/ui';

// ✅ HEROICONS v2
import {
  UserIcon,
  ClockIcon,
  CalendarDaysIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// ✅ SHARED TYPES
export interface EmployeeAvailability {
  id: string;
  name: string;
  position: string;
  avatar?: string;
  email?: string;
  phone?: string;

  // Disponibilidad
  availableDays: string[]; // ['mon', 'tue', 'wed', ...]
  preferredShifts: string[]; // ['morning', 'afternoon', 'evening']
  maxWeeklyHours: number;
  currentWeeklyHours?: number;

  // Estado actual
  status: 'available' | 'busy' | 'off' | 'vacation' | 'sick';
  lastScheduled?: string; // ISO date

  // Métricas
  reliability?: number; // 0-100
  averageRating?: number; // 0-5
  totalShiftsThisMonth?: number;
}

export interface EmployeeAvailabilityCardProps {
  /** Datos del empleado */
  employee: EmployeeAvailability;

  /** Modo de visualización */
  variant?: 'default' | 'compact' | 'detailed';

  /** Mostrar controles de acción */
  showActions?: boolean;

  /** Callback cuando se hace click en el empleado */
  onClick?: (employee: EmployeeAvailability) => void;

  /** Callback para acciones rápidas */
  onQuickAction?: (employeeId: string, action: string) => void;

  /** Semana a mostrar (para contexto) */
  currentWeek?: Date;

  /** Configuración de vista */
  config?: {
    showMetrics?: boolean;
    showContact?: boolean;
    showAvailabilityDetails?: boolean;
    allowScheduling?: boolean;
  };
}

// ✅ UTILITY FUNCTIONS
function getStatusColor(status: EmployeeAvailability['status']): string {
  const colorMap = {
    available: 'green',
    busy: 'orange',
    off: 'gray',
    vacation: 'blue',
    sick: 'red'
  };
  return colorMap[status] || 'gray';
}

function getStatusLabel(status: EmployeeAvailability['status']): string {
  const labelMap = {
    available: 'Disponible',
    busy: 'Ocupado',
    off: 'Fuera de turno',
    vacation: 'Vacaciones',
    sick: 'Enfermo'
  };
  return labelMap[status] || status;
}

function getDayAbbreviation(day: string): string {
  const dayMap: Record<string, string> = {
    monday: 'L',
    tuesday: 'M',
    wednesday: 'X',
    thursday: 'J',
    friday: 'V',
    saturday: 'S',
    sunday: 'D',
    mon: 'L',
    tue: 'M',
    wed: 'X',
    thu: 'J',
    fri: 'V',
    sat: 'S',
    sun: 'D'
  };
  return dayMap[day.toLowerCase()] || day.charAt(0).toUpperCase();
}

function getUtilizationColor(utilization: number): string {
  if (utilization >= 90) return 'red';
  if (utilization >= 75) return 'orange';
  if (utilization >= 50) return 'blue';
  return 'green';
}

// ✅ AVAILABILITY INDICATOR COMPONENT
interface AvailabilityIndicatorProps {
  availableDays: string[];
  variant?: 'default' | 'compact';
}

function AvailabilityIndicator({ availableDays, variant = 'default' }: AvailabilityIndicatorProps) {
  const allDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  return (
    <Stack direction="row" gap="xs" flexWrap="wrap">
      {allDays.map(day => {
        const isAvailable = availableDays.includes(day);

        return (
          <Badge
            key={day}
            size={variant === 'compact' ? 'xs' : 'sm'}
            colorPalette={isAvailable ? 'green' : 'gray'}
            variant={isAvailable ? 'subtle' : 'outline'}
            title={`${day.charAt(0).toUpperCase() + day.slice(1)}${isAvailable ? ' - Disponible' : ' - No disponible'}`}
          >
            {getDayAbbreviation(day)}
          </Badge>
        );
      })}
    </Stack>
  );
}

// ✅ METRICS DISPLAY COMPONENT
interface MetricsDisplayProps {
  employee: EmployeeAvailability;
  variant: 'default' | 'compact';
}

function MetricsDisplay({ employee, variant }: MetricsDisplayProps) {
  const utilization = employee.currentWeeklyHours
    ? (employee.currentWeeklyHours / employee.maxWeeklyHours) * 100
    : 0;

  if (variant === 'compact') {
    return (
      <Stack direction="row" gap="sm" align="center">
        <text fontSize="xs" color="fg.muted">
          {employee.currentWeeklyHours || 0}/{employee.maxWeeklyHours}h
        </text>

        {employee.reliability && (
          <Badge size="xs" colorPalette="blue" variant="outline">
            {employee.reliability}% confiable
          </Badge>
        )}
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap="sm">
      {/* Hours Utilization */}
      <Stack direction="row" justify="space-between" align="center">
        <Stack direction="row" align="center" gap="xs">
          <Icon icon={ClockIcon} size="xs" color="fg.muted" />
          <text fontSize="sm" color="fg.default">
            Horas esta semana
          </text>
        </Stack>

        <Stack direction="row" align="center" gap="xs">
          <text fontSize="sm" fontWeight="medium">
            {employee.currentWeeklyHours || 0}/{employee.maxWeeklyHours}h
          </text>
          <Badge
            size="xs"
            colorPalette={getUtilizationColor(utilization)}
            variant="subtle"
          >
            {Math.round(utilization)}%
          </Badge>
        </Stack>
      </Stack>

      {/* Performance Metrics */}
      {(employee.reliability || employee.averageRating) && (
        <Stack direction="row" gap="md">
          {employee.reliability && (
            <Stack direction="row" align="center" gap="xs">
              <Icon icon={CheckIcon} size="xs" color="green.solid" />
              <text fontSize="xs" color="fg.muted">
                {employee.reliability}% confiabilidad
              </text>
            </Stack>
          )}

          {employee.averageRating && (
            <Stack direction="row" align="center" gap="xs">
              <text fontSize="xs" color="fg.muted">
                ⭐ {employee.averageRating.toFixed(1)}
              </text>
            </Stack>
          )}
        </Stack>
      )}

      {/* Recent Activity */}
      {employee.totalShiftsThisMonth && (
        <text fontSize="xs" color="fg.muted">
          {employee.totalShiftsThisMonth} turnos este mes
        </text>
      )}
    </Stack>
  );
}

// ✅ MAIN COMPONENT
export function EmployeeAvailabilityCard({
  employee,
  variant = 'default',
  showActions = false,
  onClick,
  onQuickAction,
  config = {}
}: EmployeeAvailabilityCardProps) {

  // ✅ CONFIG WITH DEFAULTS
  const cardConfig = {
    showMetrics: true,
    showContact: false,
    showAvailabilityDetails: true,
    allowScheduling: true,
    ...config
  };

  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <Stack
      direction="column"
      gap={isCompact ? "sm" : "md"}
      p={isCompact ? "sm" : "md"}
      bg="bg.panel"
      borderRadius="md"
      borderWidth="1px"
      borderColor="border.default"
      cursor={onClick ? "pointer" : "default"}
      onClick={() => onClick?.(employee)}
      _hover={onClick ? {
        borderColor: "border.accent",
        bg: "bg.subtle"
      } : undefined}
    >
      {/* Header con Avatar y Info Básica */}
      <Stack direction="row" justify="space-between" align="start">
        <Stack direction="row" gap="sm" align="center">
          <Avatar
            name={employee.name}
            src={employee.avatar}
            size={isCompact ? "sm" : "md"}
            fallback={{
              icon: UserIcon,
              bg: `${getStatusColor(employee.status)}.subtle`,
              color: `${getStatusColor(employee.status)}.solid`
            }}
          />

          <Stack direction="column" gap="0">
            <text fontSize={isCompact ? "sm" : "md"} fontWeight="semibold">
              {employee.name}
            </text>
            <text fontSize="xs" color="fg.muted">
              {employee.position}
            </text>

            {cardConfig.showContact && isDetailed && employee.email && (
              <text fontSize="xs" color="fg.muted">
                {employee.email}
              </text>
            )}
          </Stack>
        </Stack>

        {/* Status Badge */}
        <Badge
          size="sm"
          colorPalette={getStatusColor(employee.status)}
          variant="subtle"
        >
          {getStatusLabel(employee.status)}
        </Badge>
      </Stack>

      {/* Availability Days */}
      {cardConfig.showAvailabilityDetails && (
        <Stack direction="column" gap="xs">
          <text fontSize="xs" color="fg.muted" fontWeight="medium">
            Disponibilidad semanal
          </text>
          <AvailabilityIndicator
            availableDays={employee.availableDays}
            variant={isCompact ? 'compact' : 'default'}
          />
        </Stack>
      )}

      {/* Preferred Shifts */}
      {!isCompact && employee.preferredShifts.length > 0 && (
        <Stack direction="column" gap="xs">
          <text fontSize="xs" color="fg.muted" fontWeight="medium">
            Turnos preferidos
          </text>
          <Stack direction="row" gap="xs" flexWrap="wrap">
            {employee.preferredShifts.map(shift => (
              <Badge
                key={shift}
                size="xs"
                colorPalette="blue"
                variant="outline"
              >
                {shift}
              </Badge>
            ))}
          </Stack>
        </Stack>
      )}

      {/* Metrics */}
      {cardConfig.showMetrics && (
        <MetricsDisplay employee={employee} variant={variant} />
      )}

      {/* Quick Actions */}
      {showActions && cardConfig.allowScheduling && employee.status === 'available' && (
        <Stack direction="row" gap="sm" pt="sm" borderTop="1px solid" borderColor="border.muted">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction?.(employee.id, 'schedule');
            }}
            style={{
              fontSize: '12px',
              padding: '4px 8px',
              backgroundColor: 'var(--colors-blue-subtle)',
              color: 'var(--colors-blue-solid)',
              border: '1px solid var(--colors-blue-muted)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Programar turno
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction?.(employee.id, 'contact');
            }}
            style={{
              fontSize: '12px',
              padding: '4px 8px',
              backgroundColor: 'var(--colors-gray-subtle)',
              color: 'var(--colors-gray-solid)',
              border: '1px solid var(--colors-gray-muted)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Contactar
          </button>
        </Stack>
      )}

      {/* Last Scheduled Info */}
      {isDetailed && employee.lastScheduled && (
        <Stack direction="row" align="center" gap="xs" pt="xs">
          <Icon icon={CalendarDaysIcon} size="xs" color="fg.muted" />
          <text fontSize="xs" color="fg.muted">
            Último turno: {new Date(employee.lastScheduled).toLocaleDateString('es-ES')}
          </text>
        </Stack>
      )}
    </Stack>
  );
}

export default EmployeeAvailabilityCard;