/**
 * SCHEDULING ADAPTERS - Export Index
 *
 * Centraliza exports de todos los adapters.
 */

export { SchedulingAdapter, SchedulingUtils } from './SchedulingAdapter';
export { StaffShiftAdapter, staffShiftAdapter } from './staffShiftAdapter';
export { ProductionAdapter, productionAdapter } from './productionAdapter';
export { AppointmentAdapter, appointmentAdapter } from './appointmentAdapter';
export { DeliveryAdapter, deliveryAdapter } from './deliveryAdapter';
export { TimeOffAdapter, timeOffAdapter } from './timeOffAdapter';
export { MaintenanceAdapter, maintenanceAdapter } from './maintenanceAdapter';

// Re-export types for convenience
export type {
  UnifiedScheduleEvent,
  EventType,
  EventStatus,
  EventMetadata,
  StaffShiftMetadata,
  ProductionMetadata,
  AppointmentMetadata,
  DeliveryMetadata,
  TimeOffMetadata,
  MaintenanceMetadata,
  CalendarView,
  CalendarViewState,
  CalendarFilters
} from '../types/calendar';

// Re-export adapter-specific types
export type { Delivery } from './deliveryAdapter';
export type { TimeOffRequest } from './timeOffAdapter';
export type { MaintenanceSchedule } from './maintenanceAdapter';
