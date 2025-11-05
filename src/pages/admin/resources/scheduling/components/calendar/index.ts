/**
 * CALENDAR COMPONENTS - Export Index
 *
 * Centraliza exports de todos los componentes de calendario.
 */

// Main components
export { CalendarViewSelector } from './CalendarViewSelector';
export type { CalendarViewSelectorProps } from './CalendarViewSelector';

export { MonthCalendarGrid } from './MonthCalendarGrid';
export type { MonthCalendarGridProps } from './MonthCalendarGrid';

export { WeekCalendarGrid } from './WeekCalendarGrid';
export type { WeekCalendarGridProps } from './WeekCalendarGrid';

export { DayCalendarTimeline } from './DayCalendarTimeline';
export type { DayCalendarTimelineProps } from './DayCalendarTimeline';

// Sub-components
export { EventDot, EventDotsGroup } from './EventDot';
export type { EventDotProps, EventDotsGroupProps } from './EventDot';

export { EventTooltip } from './EventTooltip';
export type { EventTooltipProps } from './EventTooltip';

export { CalendarFiltersPanel } from './CalendarFiltersPanel';
export type { CalendarFiltersPanelProps } from './CalendarFiltersPanel';

export { EventBlock, EventBlockStacked } from './EventBlock';
export type { EventBlockProps, EventBlockStackedProps } from './EventBlock';

export { EventCard, EventCardCompact } from './EventCard';
export type { EventCardProps, EventCardCompactProps } from './EventCard';

// Utility exports
export { getWeekStart, getWeekEnd } from './CalendarViewSelector';
