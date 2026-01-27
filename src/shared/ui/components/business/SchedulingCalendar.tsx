/**
 * @fileoverview Generic scheduling calendar component for managing events across different business contexts.
 * This component provides a reusable, type-safe calendar interface that can be adapted for production scheduling,
 * appointment booking, shift management, maintenance scheduling, and any other date-based event management.
 *
 * @module SchedulingCalendar
 * @version 1.0.0
 * @author G-Admin Mini Team
 * @license MIT
 *
 * @see {@link https://tsdoc.org/ | TSDoc Standard}
 * @see {@link https://react.dev/learn/typescript | React TypeScript Documentation}
 *
 * @example
 * ```tsx
 * // Production scheduling example
 * import { SchedulingCalendar } from '@/shared/ui';
 *
 * interface ProductionSchedule {
 *   id: string;
 *   scheduled_date: string;
 *   quantity: number;
 *   status: 'scheduled' | 'in_progress' | 'completed';
 * }
 *
 * function ProductionScheduler() {
 *   return (
 *     <SchedulingCalendar<ProductionSchedule>
 *       events={schedules}
 *       getEventDate={(s) => new Date(s.scheduled_date)}
 *       renderEvent={(s) => `${s.quantity}x`}
 *       onDateClick={handleCreate}
 *       onEventClick={handleEdit}
 *     />
 *   );
 * }
 * ```
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  Stack,
  Button,
  Badge,
  Grid,
  Box,
  Typography,
  Separator
} from '@/shared/ui';
import { Skeleton } from '@chakra-ui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Base interface that all schedulable events must implement.
 * Your custom event types should extend this interface.
 *
 * @public
 * @interface SchedulableEvent
 *
 * @property {string} id - Unique identifier for the event
 * @property {string | Date} date - The date when the event occurs (ISO string or Date object)
 *
 * @example
 * ```typescript
 * // Extend SchedulableEvent for custom use cases
 * interface ProductionSchedule extends SchedulableEvent {
 *   material_id: string;
 *   quantity: number;
 *   status: 'scheduled' | 'completed';
 * }
 *
 * interface Appointment extends SchedulableEvent {
 *   customer_name: string;
 *   service: string;
 *   duration: number;
 * }
 * ```
 *
 * @remarks
 * The date property can be either:
 * - ISO 8601 date string (e.g., "2025-01-15")
 * - JavaScript Date object
 *
 * Additional properties can be added as needed for your specific use case.
 */
export interface SchedulableEvent {
  /** Unique identifier for the event */
  id: string;

  /** The date when the event occurs (ISO date string or Date object) */
  date: string | Date;

  /** Allow any other custom fields for flexibility */
  [key: string]: any;
}

/**
 * Configuration object for customizing calendar behavior and appearance.
 *
 * @public
 * @interface SchedulingCalendarConfig
 *
 * @example
 * ```typescript
 * // Full-featured interactive calendar
 * const fullConfig: SchedulingCalendarConfig = {
 *   showNavigation: true,
 *   showAddButton: true,
 *   allowDateClick: true,
 *   compactMode: false,
 *   highlightToday: true,
 *   locale: 'es-ES'
 * };
 *
 * // Read-only compact calendar for dashboards
 * const dashboardConfig: SchedulingCalendarConfig = {
 *   showNavigation: false,
 *   showAddButton: false,
 *   allowDateClick: false,
 *   compactMode: true
 * };
 * ```
 */
export interface SchedulingCalendarConfig {
  /**
   * Display navigation arrows for month navigation
   * @defaultValue true
   */
  showNavigation?: boolean;

  /**
   * Display "Add" button in the header for creating new events
   * @defaultValue true
   */
  showAddButton?: boolean;

  /**
   * Enable click interaction on calendar dates
   * @defaultValue true
   */
  allowDateClick?: boolean;

  /**
   * Use compact mode with smaller cells (useful for dashboards)
   * @defaultValue false
   */
  compactMode?: boolean;

  /**
   * Calendar view mode
   * @defaultValue 'month'
   *
   * @remarks
   * Currently only 'month' view is implemented.
   * 'week' view is planned for future releases.
   */
  view?: 'month' | 'week';

  /**
   * Display week numbers in the calendar
   * @defaultValue false
   */
  showWeekNumbers?: boolean;

  /**
   * Highlight the current date
   * @defaultValue true
   */
  highlightToday?: boolean;

  /**
   * Locale for date formatting (BCP 47 language tag)
   * @defaultValue 'es-ES'
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument | MDN Intl Locales}
   *
   * @example
   * ```typescript
   * locale: 'es-ES'  // Spanish (Spain)
   * locale: 'en-US'  // English (United States)
   * locale: 'pt-BR'  // Portuguese (Brazil)
   * ```
   */
  locale?: string;
}

/**
 * Props for the SchedulingCalendar component.
 *
 * @public
 * @interface SchedulingCalendarProps
 * @typeParam T - The type of event being scheduled (must extend SchedulableEvent)
 *
 * @example
 * ```typescript
 * interface ProductionSchedule extends SchedulableEvent {
 *   quantity: number;
 *   status: 'scheduled' | 'completed';
 * }
 *
 * const props: SchedulingCalendarProps<ProductionSchedule> = {
 *   events: productionSchedules,
 *   getEventDate: (s) => new Date(s.date),
 *   renderEvent: (s) => `${s.quantity}x`,
 *   onDateClick: handleCreate,
 *   config: { compactMode: false }
 * };
 * ```
 */
export interface SchedulingCalendarProps<T extends SchedulableEvent> {
  // ============================================
  // DATA PROPS
  // ============================================

  /**
   * Array of events to display in the calendar
   *
   * @remarks
   * Events are automatically grouped by date for efficient rendering.
   * The component handles date extraction via the `getEventDate` prop.
   */
  events: T[];

  /**
   * Initial date to display when the calendar is first rendered
   * @defaultValue new Date() (current date)
   *
   * @example
   * ```typescript
   * // Start at a specific month
   * initialDate={new Date('2025-06-01')}
   * ```
   */
  initialDate?: Date;

  /**
   * Loading state indicator
   * @defaultValue false
   *
   * @remarks
   * When true, displays skeleton loaders instead of the calendar grid.
   */
  loading?: boolean;

  // ============================================
  // RENDER PROPS (Customization)
  // ============================================

  /**
   * Function to extract the date from your event object
   *
   * @param event - The event object
   * @returns The date when the event occurs
   *
   * @example
   * ```typescript
   * // For ISO date strings
   * getEventDate={(event) => new Date(event.scheduled_date)}
   *
   * // For Date objects
   * getEventDate={(event) => event.date}
   *
   * // For custom date formats
   * getEventDate={(event) => parseCustomDate(event.customDateField)}
   * ```
   */
  getEventDate: (event: T) => Date;

  /**
   * Render function for displaying each event
   *
   * @param event - The event to render
   * @returns React node to display (text, components, etc.)
   *
   * @example
   * ```typescript
   * // Simple text
   * renderEvent={(event) => event.name}
   *
   * // Formatted text
   * renderEvent={(event) => `${event.quantity}x ${event.item}`}
   *
   * // Custom component
   * renderEvent={(event) => (
   *   <Stack direction="row" gap="1">
   *     <Icon as={CheckIcon} />
   *     <Text>{event.title}</Text>
   *   </Stack>
   * )}
   * ```
   */
  renderEvent: (event: T) => React.ReactNode;

  /**
   * Optional function to determine event badge color
   *
   * @param event - The event to get the color for
   * @returns Chakra UI color palette name
   *
   * @defaultValue 'gray'
   *
   * @example
   * ```typescript
   * // Color by status
   * getEventColor={(event) => {
   *   switch (event.status) {
   *     case 'completed': return 'green';
   *     case 'in_progress': return 'blue';
   *     case 'cancelled': return 'red';
   *     default: return 'gray';
   *   }
   * }}
   *
   * // Color by priority
   * getEventColor={(event) => event.priority === 'high' ? 'red' : 'blue'}
   * ```
   */
  getEventColor?: (event: T) => string;

  /**
   * Optional custom renderer for event count indicator
   *
   * @param events - Array of events for a specific date
   * @returns React node to display as the event count indicator
   *
   * @remarks
   * If not provided, a default badge showing the count will be displayed.
   * In compact mode, a small dot indicator is shown instead.
   *
   * @example
   * ```typescript
   * // Show total quantity
   * renderEventCount={(events) => {
   *   const total = events.reduce((sum, e) => sum + e.quantity, 0);
   *   return <Badge>{total} units</Badge>;
   * }}
   *
   * // Show status breakdown
   * renderEventCount={(events) => (
   *   <Stack direction="row">
   *     <Badge colorPalette="green">
   *       {events.filter(e => e.status === 'completed').length}
   *     </Badge>
   *     <Badge colorPalette="blue">
   *       {events.filter(e => e.status === 'pending').length}
   *     </Badge>
   *   </Stack>
   * )}
   * ```
   */
  renderEventCount?: (events: T[]) => React.ReactNode;

  // ============================================
  // CALLBACK PROPS
  // ============================================

  /**
   * Callback fired when a calendar date is clicked
   *
   * @param date - The clicked date
   *
   * @remarks
   * Only fires if `config.allowDateClick` is true.
   * Typically used to open a modal for creating a new event.
   *
   * @example
   * ```typescript
   * onDateClick={(date) => {
   *   openCreateModal({
   *     scheduled_date: date.toISOString().split('T')[0],
   *     status: 'scheduled'
   *   });
   * }}
   * ```
   */
  onDateClick?: (date: Date) => void;

  /**
   * Callback fired when an event is clicked
   *
   * @param event - The clicked event
   *
   * @remarks
   * Typically used to open a modal for editing or viewing the event details.
   *
   * @example
   * ```typescript
   * onEventClick={(event) => {
   *   openEditModal(event);
   * }}
   * ```
   */
  onEventClick?: (event: T) => void;

  /**
   * Callback fired when the user navigates to a different month
   *
   * @param date - The new month's date (always the 1st of the month)
   *
   * @remarks
   * Useful for lazy-loading events for the new month from the backend.
   *
   * @example
   * ```typescript
   * onMonthChange={(date) => {
   *   fetchEventsForMonth(date.getMonth(), date.getFullYear());
   * }}
   * ```
   */
  onMonthChange?: (date: Date) => void;

  /**
   * Callback fired when the "Add" button is clicked
   *
   * @param currentDate - The currently displayed month
   *
   * @remarks
   * Only fires if `config.showAddButton` is true.
   * Alternative to `onDateClick` for creating events.
   *
   * @example
   * ```typescript
   * onAddClick={(date) => {
   *   openCreateModal({
   *     scheduled_date: date.toISOString().split('T')[0]
   *   });
   * }}
   * ```
   */
  onAddClick?: (currentDate: Date) => void;

  // ============================================
  // CONFIGURATION
  // ============================================

  /**
   * Configuration object for customizing calendar behavior
   *
   * @see {@link SchedulingCalendarConfig}
   */
  config?: SchedulingCalendarConfig;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generates an array of dates for a calendar month view (42 days - 6 weeks).
 *
 * @internal
 * @param date - The reference date (any day in the target month)
 * @returns Array of 42 dates covering the calendar grid
 *
 * @remarks
 * The returned array includes:
 * - Days from the previous month to fill the first week
 * - All days of the target month
 * - Days from the next month to complete 6 weeks (42 days total)
 *
 * This ensures a consistent grid layout regardless of month length or start day.
 */
function generateMonthDays(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start from Sunday of the week containing the 1st
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // Generate 42 days (6 weeks) to always fill the grid
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    days.push(currentDate);
  }

  return days;
}

/**
 * Checks if two dates represent the same calendar day.
 *
 * @internal
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns True if dates represent the same day
 *
 * @remarks
 * This comparison ignores time components (hours, minutes, seconds).
 * Only the year, month, and day are compared.
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

/**
 * Checks if two dates are in the same month and year.
 *
 * @internal
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns True if dates are in the same month
 */
function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * Generic scheduling calendar component for managing events across different business contexts.
 *
 * @public
 * @component
 * @typeParam T - The type of event being scheduled (must extend {@link SchedulableEvent})
 *
 * @param props - Component props
 * @returns Rendered calendar component
 *
 * @remarks
 * This component provides a flexible, reusable calendar interface that can be adapted for:
 * - Production scheduling (manufacturing, recipes, materials)
 * - Appointment booking (services, consultations)
 * - Shift scheduling (staff, employees)
 * - Maintenance scheduling (equipment, facilities)
 * - Any other date-based event management
 *
 * **Key Features:**
 * - Type-safe with TypeScript generics
 * - Customizable via render props
 * - Performance optimized with React.memo
 * - Accessible (ARIA labels, keyboard navigation)
 * - Responsive design with Chakra UI v3
 *
 * **Performance Considerations:**
 * - Events are memoized and grouped by date
 * - Component is memoized to prevent unnecessary re-renders
 * - Efficient date calculations using native Date API
 *
 * @example
 * ```tsx
 * // Production scheduling
 * interface ProductionSchedule extends SchedulableEvent {
 *   material_id: string;
 *   quantity: number;
 *   status: 'scheduled' | 'in_progress' | 'completed';
 * }
 *
 * function ProductionScheduler() {
 *   const [schedules, setSchedules] = useState<ProductionSchedule[]>([]);
 *
 *   return (
 *     <SchedulingCalendar<ProductionSchedule>
 *       events={schedules}
 *       getEventDate={(s) => new Date(s.date)}
 *       renderEvent={(s) => `${s.quantity}x`}
 *       getEventColor={(s) => s.status === 'completed' ? 'green' : 'gray'}
 *       onDateClick={(date) => openCreateModal(date)}
 *       onEventClick={(s) => openEditModal(s)}
 *       config={{
 *         showNavigation: true,
 *         showAddButton: true,
 *         allowDateClick: true
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Appointment booking
 * interface Appointment extends SchedulableEvent {
 *   customer_name: string;
 *   service: string;
 *   status: 'pending' | 'confirmed' | 'completed';
 * }
 *
 * function AppointmentCalendar() {
 *   return (
 *     <SchedulingCalendar<Appointment>
 *       events={appointments}
 *       getEventDate={(a) => new Date(a.date)}
 *       renderEvent={(a) => `${a.customer_name} - ${a.service}`}
 *       getEventColor={(a) => a.status === 'confirmed' ? 'green' : 'orange'}
 *       onEventClick={(a) => viewAppointment(a)}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Read-only compact calendar for dashboards
 * function DashboardCalendar() {
 *   return (
 *     <SchedulingCalendar
 *       events={events}
 *       getEventDate={(e) => new Date(e.date)}
 *       renderEvent={(e) => e.title}
 *       config={{
 *         compactMode: true,
 *         showNavigation: false,
 *         showAddButton: false,
 *         allowDateClick: false
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @see {@link SchedulingCalendarProps} for detailed prop documentation
 * @see {@link SchedulableEvent} for event type requirements
 * @see {@link SchedulingCalendarConfig} for configuration options
 */
export const SchedulingCalendar = memo(function SchedulingCalendar<T extends SchedulableEvent>({
  events,
  initialDate = new Date(),
  loading = false,
  config = {},
  getEventDate,
  renderEvent,
  getEventColor,
  renderEventCount,
  onDateClick,
  onEventClick,
  onMonthChange,
  onAddClick
}: SchedulingCalendarProps<T>) {

  // ============================================
  // STATE
  // ============================================

  const [currentDate, setCurrentDate] = useState(initialDate);

  // ============================================
  // CONFIG DEFAULTS
  // ============================================

  const {
    showNavigation = true,
    showAddButton = true,
    allowDateClick = true,
    compactMode = false,
    highlightToday = true,
    locale = 'es-ES'
  } = config;

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const monthDays = useMemo(() => generateMonthDays(currentDate), [currentDate]);
  const today = useMemo(() => new Date(), []);

  // Group events by date for efficient lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, T[]>();

    events.forEach(event => {
      const eventDate = getEventDate(event);
      const dateKey = eventDate.toDateString();

      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    });

    return map;
  }, [events, getEventDate]);

  // ============================================
  // HANDLERS
  // ============================================

  const handlePrevMonth = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  }, [currentDate, onMonthChange]);

  const handleNextMonth = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  }, [currentDate, onMonthChange]);

  const handleDateClick = useCallback((date: Date) => {
    if (!allowDateClick) return;
    onDateClick?.(date);
  }, [allowDateClick, onDateClick]);

  const handleAddClick = useCallback(() => {
    onAddClick?.(currentDate);
  }, [currentDate, onAddClick]);

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <Stack gap="4" w="full">
        <Skeleton height="48px" borderRadius="md" />
        <Skeleton height="400px" borderRadius="md" />
      </Stack>
    );
  }

  return (
    <Stack gap="4" w="full">
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center" p="3" bg="bg.subtle" borderRadius="md">
        {showNavigation ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePrevMonth}
            aria-label="Mes anterior"
          >
            <ChevronLeftIcon style={{ width: '20px', height: '20px' }} />
          </Button>
        ) : <Box />}

        <Stack direction="row" align="center" gap="2">
          <CalendarIcon style={{ width: '20px', height: '20px', opacity: 0.6 }} />
          <Typography variant="body" fontSize="lg" fontWeight="semibold">
            {currentDate.toLocaleDateString(locale, {
              month: 'long',
              year: 'numeric'
            })}
          </Typography>
        </Stack>

        <Stack direction="row" gap="2">
          {showAddButton && onAddClick && (
            <Button
              size="sm"
              variant="solid"
              colorPalette="blue"
              onClick={handleAddClick}
            >
              <PlusIcon style={{ width: '16px', height: '16px' }} />
              <Typography variant="body" fontSize="sm">Agregar</Typography>
            </Button>
          )}

          {showNavigation && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNextMonth}
              aria-label="Mes siguiente"
            >
              <ChevronRightIcon style={{ width: '20px', height: '20px' }} />
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Calendar Grid */}
      <Box>
        <Grid templateColumns="repeat(7, 1fr)" gap={compactMode ? "1" : "2"}>
          {/* Day Headers */}
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <Box
              key={day}
              p="2"
              textAlign="center"
              fontWeight="semibold"
              fontSize="sm"
              color="fg.muted"
            >
              {day}
            </Box>
          ))}

          {/* Calendar Days */}
          {monthDays.map((date, index) => {
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isToday = highlightToday && isSameDay(date, today);
            const dateKey = date.toDateString();
            const dayEvents = eventsByDate.get(dateKey) || [];
            const hasEvents = dayEvents.length > 0;

            return (
              <Button
                key={index}
                size="sm"
                variant={isToday ? "outline" : "ghost"}
                colorPalette={isToday ? "blue" : undefined}
                opacity={isCurrentMonth ? 1 : 0.3}
                h={compactMode ? "12" : "20"}
                position="relative"
                flexDirection="column"
                gap="1"
                onClick={() => handleDateClick(date)}
                cursor={allowDateClick ? "pointer" : "default"}
                _hover={{
                  bg: allowDateClick ? "gray.100" : undefined
                }}
                aria-label={`${date.toLocaleDateString(locale, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}${hasEvents ? ` - ${dayEvents.length} evento${dayEvents.length > 1 ? 's' : ''}` : ''}`}
              >
                {/* Date Number */}
                <Typography
                  variant="body"
                  fontSize={compactMode ? "xs" : "sm"}
                  fontWeight={isToday ? "bold" : "normal"}
                >
                  {date.getDate()}
                </Typography>

                {/* Events */}
                {hasEvents && (
                  <Stack
                    direction="column"
                    gap="1"
                    w="full"
                    align="center"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (dayEvents.length === 1) {
                        onEventClick?.(dayEvents[0]);
                      }
                    }}
                  >
                    {/* Custom event count renderer */}
                    {renderEventCount ? (
                      renderEventCount(dayEvents)
                    ) : (
                      /* Default: Show badges */
                      compactMode ? (
                        /* Compact: Just a dot */
                        <Box
                          w="6px"
                          h="6px"
                          borderRadius="full"
                          bg={getEventColor?.(dayEvents[0]) || "blue.500"}
                        />
                      ) : (
                        /* Full: Show first 2-3 events */
                        <>
                          {dayEvents.slice(0, 2).map((event, i) => (
                            <Box
                              key={i}
                              w="full"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventClick?.(event);
                              }}
                            >
                              <Badge
                                size="xs"
                                colorPalette={getEventColor?.(event) || "gray"}
                                variant="subtle"
                                maxW="full"
                                textOverflow="ellipsis"
                                overflow="hidden"
                                whiteSpace="nowrap"
                              >
                                {renderEvent(event)}
                              </Badge>
                            </Box>
                          ))}

                          {dayEvents.length > 2 && (
                            <Typography
                              variant="body"
                              fontSize="2xs"
                              color="fg.muted"
                            >
                              +{dayEvents.length - 2} más
                            </Typography>
                          )}
                        </>
                      )
                    )}
                  </Stack>
                )}
              </Button>
            );
          })}
        </Grid>
      </Box>
    </Stack>
  );
}) as <T extends SchedulableEvent>(props: SchedulingCalendarProps<T>) => JSX.Element;

// ============================================
// EXPORTS
// ============================================

/**
 * @public
 * Re-exported types for convenience
 */
export type { SchedulableEvent, SchedulingCalendarConfig, SchedulingCalendarProps };
