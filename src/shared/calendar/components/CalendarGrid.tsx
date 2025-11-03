/**
 * CALENDAR GRID COMPONENT - G-ADMIN MINI v3.0
 *
 * Grid component for displaying calendar data in various formats
 * Adapts to business model through adapter system
 *
 * @version 3.0.0
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Stack,
  Button,
  Badge,
  Typography,
  Spinner
} from '@/shared/ui';
import { UnifiedCalendarEngine } from '../engine/UnifiedCalendarEngine';
import { BaseCalendarAdapter } from '../adapters/BaseCalendarAdapter';
import { logger } from '@/lib/logging';
import type {
  CalendarConfig,
  DateRange,
  TimeSlot,
  Booking,
  ISODateString,
  ISOTimeString,
  TimezoneString
} from '../types/DateTimeTypes';
import {
  createISODate,
  formatDateForUser,
  formatTimeForUser,
  formatTimeSlotForUser
} from '../utils/dateTimeUtils';

// ===============================
// COMPONENT INTERFACES
// ===============================

/**
 * Calendar grid props
 */
export interface CalendarGridProps {
  readonly businessModel: string;
  readonly engine: UnifiedCalendarEngine;
  readonly adapter: BaseCalendarAdapter;
  readonly config: CalendarConfig;
  readonly dateRange: DateRange;
  readonly viewMode: 'month' | 'week' | 'day' | 'agenda';
  readonly onDateClick?: (date: ISODateString) => void;
  readonly onTimeSlotClick?: (timeSlot: TimeSlot) => void;
  readonly onBookingClick?: (booking: Booking) => void;
  readonly loading?: boolean;
}

// ===============================
// MAIN COMPONENT
// ===============================

/**
 * Calendar Grid Component
 *
 * Displays calendar data in a grid format with business model adaptation
 */
export function CalendarGrid({
  businessModel,
  engine,
  adapter,
  config,
  dateRange,
  viewMode,
  onDateClick,
  onTimeSlotClick,
  onBookingClick,
  loading = false
}: CalendarGridProps) {
  // ===============================
  // STATE MANAGEMENT
  // ===============================

  const [calendarData, setCalendarData] = useState<{
    timeSlots: TimeSlot[];
    bookings: Booking[];
    resources: any[];
  }>({
    timeSlots: [],
    bookings: [],
    resources: []
  });

  // ===============================
  // DATA LOADING
  // ===============================

  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        // Simulate loading calendar data
        const timeSlots: TimeSlot[] = [];
        const bookings: Booking[] = [];
        const resources: any[] = [];

        setCalendarData({ timeSlots, bookings, resources });
      } catch (error) {
        logger.error('App', 'Error loading calendar data:', error);
      }
    };

    loadCalendarData();
  }, [dateRange, businessModel]);

  // ===============================
  // EVENT HANDLERS
  // ===============================

  const handleDateClick = useCallback((date: ISODateString) => {
    onDateClick?.(date);
  }, [onDateClick]);

  const handleTimeSlotClick = useCallback((timeSlot: TimeSlot) => {
    onTimeSlotClick?.(timeSlot);
  }, [onTimeSlotClick]);

  const handleBookingClick = useCallback((booking: Booking) => {
    onBookingClick?.(booking);
  }, [onBookingClick]);

  // ===============================
  // RENDER HELPERS
  // ===============================

  const renderMonthView = () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
            {day}
          </div>
        ))}
        {Array.from({ length: 35 }, (_, i) => (
          <div
            key={i}
            style={{
              padding: '8px',
              minHeight: '60px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer'
            }}
            onClick={() => handleDateClick(createISODate(new Date()))}
          >
            {i + 1}
          </div>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(7, 1fr)', gap: '1px' }}>
        <div></div>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
            {day}
          </div>
        ))}

        {Array.from({ length: 24 }, (_, hour) => (
          <React.Fragment key={hour}>
            <div style={{ padding: '8px', textAlign: 'right', fontSize: '12px' }}>
              {hour.toString().padStart(2, '0')}:00
            </div>
            {Array.from({ length: 7 }, (_, day) => (
              <div
                key={`${hour}-${day}`}
                style={{
                  padding: '4px',
                  minHeight: '40px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  const timeSlot: TimeSlot = {
                    startTime: `${hour.toString().padStart(2, '0')}:00` as ISOTimeString,
                    endTime: `${(hour + 1).toString().padStart(2, '0')}:00` as ISOTimeString,
                    date: createISODate(new Date()),
                    timezone: config.timezone
                  };
                  handleTimeSlotClick(timeSlot);
                }}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1px' }}>
        {Array.from({ length: 24 }, (_, hour) => (
          <React.Fragment key={hour}>
            <div style={{ padding: '8px', textAlign: 'right', fontSize: '12px' }}>
              {hour.toString().padStart(2, '0')}:00
            </div>
            <div
              style={{
                padding: '8px',
                minHeight: '60px',
                border: '1px solid #e2e8f0',
                cursor: 'pointer'
              }}
              onClick={() => {
                const timeSlot: TimeSlot = {
                  startTime: `${hour.toString().padStart(2, '0')}:00` as ISOTimeString,
                  endTime: `${(hour + 1).toString().padStart(2, '0')}:00` as ISOTimeString,
                  date: createISODate(new Date()),
                  timezone: config.timezone
                };
                handleTimeSlotClick(timeSlot);
              }}
            >
              {/* Time slot content */}
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderAgendaView = () => {
    return (
      <Stack gap="md">
        {calendarData.bookings.length === 0 ? (
          <Typography>No bookings found for this period</Typography>
        ) : (
          calendarData.bookings.map((booking, index) => (
            <div
              key={index}
              style={{
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={() => handleBookingClick(booking)}
            >
              <Stack direction="row" justify="space-between" align="center">
                <div>
                  <Typography fontWeight="semibold">
                    {formatTimeSlotForUser(booking.timeSlot, config.timezone)}
                  </Typography>
                  <Typography variant="caption" color="gray.600">
                    {formatDateForUser(booking.timeSlot.date, 'en-US')}
                  </Typography>
                </div>
                <Badge colorPalette="blue">{booking.status}</Badge>
              </Stack>
            </div>
          ))
        )}
      </Stack>
    );
  };

  // ===============================
  // MAIN RENDER
  // ===============================

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'agenda' && renderAgendaView()}
    </div>
  );
}

export default CalendarGrid;