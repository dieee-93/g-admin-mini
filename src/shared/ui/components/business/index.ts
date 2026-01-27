// ✅ BUSINESS COMPONENTS EXPORTS
// Shared components específicos para funcionalidades de negocio
// Estos componentes implementan lógica empresarial reutilizable

// 🗓️ SCHEDULING & TIME MANAGEMENT
export { WeeklyCalendar } from './WeeklyCalendar';
export type {
  CalendarShift,
  DayData,
  WeeklyCalendarProps
} from './WeeklyCalendar';

export { SchedulingCalendar } from './SchedulingCalendar';
export type {
  SchedulableEvent,
  SchedulingCalendarConfig,
  SchedulingCalendarProps
} from './SchedulingCalendar';

export { TimeSlotPicker } from './TimeSlotPicker';
export type {
  TimeSlot,
  TimeSlotPickerProps
} from './TimeSlotPicker';

// 👥 EMPLOYEE & STAFF MANAGEMENT
export { EmployeeAvailabilityCard } from './EmployeeAvailabilityCard';
export type {
  EmployeeAvailability,
  EmployeeAvailabilityCardProps
} from './EmployeeAvailabilityCard';