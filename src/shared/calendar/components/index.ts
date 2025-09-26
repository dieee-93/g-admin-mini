/**
 * UNIFIED CALENDAR COMPONENTS - G-ADMIN MINI v3.0
 *
 * Central export point for all calendar components
 * Provides organized access to calendar UI components
 *
 * @version 3.0.0
 */

// ===============================
// MAIN CALENDAR COMPONENTS
// ===============================

// Core calendar component
export { default as UnifiedCalendar, SimpleCalendar, AdminCalendar, MobileCalendar } from './UnifiedCalendar';
export type { UnifiedCalendarProps } from './UnifiedCalendar';

// Calendar grid
export { default as CalendarGrid } from './CalendarGrid';
export type { CalendarGridProps } from './CalendarGrid';

// Calendar header
export { default as CalendarHeader } from './CalendarHeader';
export type { CalendarHeaderProps } from './CalendarHeader';

// Calendar sidebar
export { default as CalendarSidebar } from './CalendarSidebar';
export type { CalendarSidebarProps, CalendarFilters } from './CalendarSidebar';

// ===============================
// SUPPORTING COMPONENTS
// ===============================

// Note: These components will be implemented in separate files

// ===============================
// PLACEHOLDER EXPORTS
// ===============================

// Placeholder exports for components to be implemented
export const BookingForm = null;
export const BookingDetails = null;
export const TimeSlotPicker = null;

// ===============================
// DEFAULT EXPORT
// ===============================

export default {
  UnifiedCalendar,
  CalendarGrid,
  CalendarHeader,
  CalendarSidebar
};