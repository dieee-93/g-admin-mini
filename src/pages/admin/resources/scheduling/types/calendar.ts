/**
 * CALENDAR TYPES - Unified Schedule Event System
 *
 * Sistema de tipos unificado para el calendario de scheduling.
 * Soporta múltiples tipos de eventos según capabilities activas.
 *
 * @version 1.0.0
 * @see ../docs/SCHEDULING_EVENT_TYPES.md
 */

import type { BusinessCapabilityId } from '@/config/types';

// ============================================
// EVENT TYPE DEFINITIONS
// ============================================

/**
 * Tipos de eventos soportados en el calendario
 *
 * Cada tipo se activa según la capability del negocio:
 * - staff_shift: onsite_service, pickup_orders, delivery_shipping
 * - production: requires_preparation
 * - appointment: appointment_based
 * - delivery: delivery_shipping
 * - time_off: Todas (gestión de personal)
 * - maintenance: Todas (operaciones)
 */
export type EventType =
  | 'staff_shift'      // Turno de empleado
  | 'production'       // Bloque de producción/cocina
  | 'appointment'      // Cita con cliente
  | 'delivery'         // Entrega programada
  | 'time_off'         // Permiso/ausencia
  | 'maintenance';     // Mantenimiento de equipos

/**
 * Estados posibles de un evento
 */
export type EventStatus =
  | 'scheduled'   // Programado
  | 'confirmed'   // Confirmado
  | 'in_progress' // En curso
  | 'completed'   // Completado
  | 'cancelled'   // Cancelado
  | 'no_show';    // No se presentó (para citas)

// ============================================
// UNIFIED EVENT STRUCTURE
// ============================================

/**
 * Estructura unificada de evento de calendario
 *
 * Esta estructura normaliza TODOS los tipos de eventos
 * para que puedan renderizarse consistentemente en el calendario.
 */
export interface UnifiedScheduleEvent {
  /** ID único del evento */
  id: string;

  /** Tipo de evento */
  type: EventType;

  // ============================================
  // INFORMACIÓN BÁSICA
  // ============================================

  /** Título del evento (ej: "John Doe - Kitchen Shift") */
  title: string;

  /** Descripción opcional */
  description?: string;

  // ============================================
  // INFORMACIÓN TEMPORAL
  // ============================================

  /** Fecha/hora de inicio */
  start: Date;

  /** Fecha/hora de fin */
  end: Date;

  /** Si es evento de todo el día */
  allDay: boolean;

  // ============================================
  // RELACIONES
  // ============================================

  /** ID del empleado relacionado (si aplica) */
  employeeId?: string;

  /** Nombre del empleado (desnormalizado para performance) */
  employeeName?: string;

  /** ID del departamento */
  departmentId?: string;

  /** Nombre del departamento */
  departmentName?: string;

  /** ID de ubicación (para multi-location) */
  locationId?: string;

  // ============================================
  // ESTADO
  // ============================================

  /** Estado actual del evento */
  status: EventStatus;

  /** Prioridad (1=baja, 2=media, 3=alta) */
  priority?: 1 | 2 | 3;

  // ============================================
  // METADATA ESPECÍFICA POR TIPO
  // ============================================

  /**
   * Metadata específica según el tipo de evento
   * TypeScript infiere el tipo correcto basado en `type`
   */
  metadata: EventMetadata;

  // ============================================
  // UI CONFIGURATION
  // ============================================

  /** Color de fondo (ej: 'blue.50') */
  colorBg: string;

  /** Color de borde (ej: 'blue.500') */
  colorBorder: string;

  /** Color de texto (ej: 'blue.900') */
  colorText: string;

  /** Color de dot para month view (hex) */
  colorDot: string;

  /** Icono representativo (Heroicons name) */
  icon: string;

  // ============================================
  // AUDIT FIELDS
  // ============================================

  /** Fecha de creación */
  createdAt: Date;

  /** Fecha de última actualización */
  updatedAt: Date;

  /** Usuario que creó */
  createdBy?: string;
}

// ============================================
// METADATA POR TIPO DE EVENTO
// ============================================

/**
 * Union type de todas las metadata posibles
 */
export type EventMetadata =
  | StaffShiftMetadata
  | ProductionMetadata
  | AppointmentMetadata
  | DeliveryMetadata
  | TimeOffMetadata
  | MaintenanceMetadata;

/**
 * Metadata específica de Staff Shift
 */
export interface StaffShiftMetadata {
  type: 'staff_shift';

  /** Posición/rol del empleado */
  position: string;

  /** Tarifa por hora (para cálculos de costo) */
  hourlyRate?: number;

  /** Duración del break (minutos) */
  breakDuration?: number;

  /** Notas adicionales */
  notes?: string;

  /** Si el turno es obligatorio */
  isMandatory?: boolean;

  /** Si puede ser cubierto por otro empleado */
  canBeCovered?: boolean;

  /** ID del empleado que cubre (si aplica) */
  coveredBy?: string;
}

/**
 * Metadata específica de Production Block
 */
export interface ProductionMetadata {
  type: 'production';

  /** ID de la receta/producto */
  recipeId?: string;

  /** Nombre de la receta */
  recipeName: string;

  /** Cantidad a producir */
  quantity: number;

  /** Unidad (ej: 'units', 'kg', 'liters') */
  unit: string;

  /** IDs de empleados asignados */
  assignedStaffIds: string[];

  /** Nombres de empleados (desnormalizado) */
  assignedStaffNames: string[];

  /** Porcentaje de capacidad usado */
  capacityUsed: number;

  /** Estación de trabajo (ej: 'grill', 'prep', 'assembly') */
  station?: string;
}

/**
 * Metadata específica de Appointment
 */
export interface AppointmentMetadata {
  type: 'appointment';

  /** ID del cliente */
  customerId?: string;

  /** Nombre del cliente */
  customerName: string;

  /** Teléfono del cliente */
  customerPhone?: string;

  /** Email del cliente */
  customerEmail?: string;

  /** Tipo de servicio */
  serviceType: string;

  /** Si se envió reminder */
  reminderSent: boolean;

  /** Notas del cliente */
  notes?: string;

  /** Costo estimado del servicio */
  estimatedCost?: number;
}

/**
 * Metadata específica de Delivery
 */
export interface DeliveryMetadata {
  type: 'delivery';

  /** ID del pedido */
  orderId: string;

  /** Dirección de entrega */
  deliveryAddress: string;

  /** ID del repartidor */
  driverId?: string;

  /** Nombre del repartidor */
  driverName?: string;

  /** ID del vehículo */
  vehicleId?: string;

  /** Zona de entrega */
  deliveryZone?: string;

  /** Distancia estimada (km) */
  distanceKm?: number;

  /** Tiempo estimado (minutos) */
  estimatedTimeMinutes?: number;

  /** Tracking URL */
  trackingUrl?: string;
}

/**
 * Metadata específica de Time-Off
 */
export interface TimeOffMetadata {
  type: 'time_off';

  /** Tipo de permiso */
  requestType: 'vacation' | 'sick' | 'personal' | 'emergency';

  /** Razón del permiso */
  reason?: string;

  /** Si fue aprobado */
  approved: boolean;

  /** Fecha de solicitud */
  requestedAt: Date;

  /** ID de quien aprobó/rechazó */
  reviewedBy?: string;

  /** Fecha de revisión */
  reviewedAt?: Date;

  /** Comentarios del revisor */
  reviewerComments?: string;
}

/**
 * Metadata específica de Maintenance
 */
export interface MaintenanceMetadata {
  type: 'maintenance';

  /** Equipo/área a mantener */
  equipmentName: string;

  /** ID del equipo */
  equipmentId?: string;

  /** Tipo de mantenimiento */
  maintenanceType: 'preventive' | 'corrective' | 'inspection';

  /** Técnico asignado */
  technicianId?: string;

  /** Nombre del técnico */
  technicianName?: string;

  /** Costo estimado */
  estimatedCost?: number;

  /** Notas técnicas */
  notes?: string;
}

// ============================================
// CALENDAR VIEW TYPES
// ============================================

/**
 * Tipos de vista del calendario
 */
export type CalendarView = 'month' | 'week' | 'day';

/**
 * Estado de la vista del calendario
 */
export interface CalendarViewState {
  /** Vista activa */
  view: CalendarView;

  /** Fecha de referencia (centro del calendario) */
  referenceDate: Date;

  /** Semana seleccionada (ISO week, ej: "2025-W41") */
  selectedWeek?: string;

  /** Día seleccionado */
  selectedDay?: Date;

  /** Filtros activos */
  filters: CalendarFilters;
}

/**
 * Filtros del calendario
 */
export interface CalendarFilters {
  /** Tipos de evento a mostrar */
  eventTypes: EventType[];

  /** IDs de empleados a mostrar */
  employeeIds: string[];

  /** Departamentos a mostrar */
  departments: string[];

  /** Estados a mostrar */
  statuses: EventStatus[];

  /** Capabilities activas (filtro dinámico) */
  capabilities: BusinessCapabilityId[];

  /** Texto de búsqueda */
  searchText?: string;
}

// ============================================
// CALENDAR EVENT COLORS
// ============================================

/**
 * Configuración de colores por tipo de evento
 */
export interface EventColorConfig {
  bg: string;        // Background color (ej: 'blue.50')
  border: string;    // Border color (ej: 'blue.500')
  text: string;      // Text color (ej: 'blue.900')
  dot: string;       // Dot color for month view (hex, ej: '#3182CE')
}

/**
 * Paleta de colores por tipo de evento
 */
export const EVENT_COLORS: Record<EventType, EventColorConfig> = {
  staff_shift: {
    bg: 'blue.50',
    border: 'blue.500',
    text: 'blue.900',
    dot: '#3182CE'
  },
  production: {
    bg: 'purple.50',
    border: 'purple.500',
    text: 'purple.900',
    dot: '#805AD5'
  },
  appointment: {
    bg: 'green.50',
    border: 'green.500',
    text: 'green.900',
    dot: '#38A169'
  },
  time_off: {
    bg: 'orange.50',
    border: 'orange.500',
    text: 'orange.900',
    dot: '#DD6B20'
  },
  delivery: {
    bg: 'cyan.50',
    border: 'cyan.500',
    text: 'cyan.900',
    dot: '#0BC5EA'
  },
  maintenance: {
    bg: 'gray.50',
    border: 'gray.500',
    text: 'gray.900',
    dot: '#718096'
  }
};

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Evento agrupado por día (para Month view)
 */
export interface DayEventsSummary {
  date: Date;
  events: UnifiedScheduleEvent[];
  eventCount: number;
  eventsByType: Record<EventType, number>;
}

/**
 * Overlap de eventos (para Week/Day view)
 */
export interface EventOverlap {
  timeSlot: { start: Date; end: Date };
  events: UnifiedScheduleEvent[];
  overlapCount: number;
}

/**
 * Resultado de filtrado de eventos
 */
export interface FilteredEventsResult {
  filtered: UnifiedScheduleEvent[];
  total: number;
  countByType: Record<EventType, number>;
  countByStatus: Record<EventStatus, number>;
}
