/**
 * CALENDAR HEADER COMPONENT - G-ADMIN MINI v3.0
 *
 * Header component for calendar navigation and controls
 * Adapts to business model through adapter system
 *
 * @version 3.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Stack,
  Typography,
  Button,
  Icon,
  Badge
} from '@/shared/ui';
import { BaseCalendarAdapter } from '../adapters/BaseCalendarAdapter';
import type {
  CalendarConfig,
  DateRange,
  ISODateString
} from '../types/DateTimeTypes';
import {
  createISODate,
  formatDateForUser
} from '../utils/dateTimeUtils';

// ===============================
// COMPONENT INTERFACES
// ===============================

/**
 * Calendar header props
 */
export interface CalendarHeaderProps {
  readonly businessModel: string;
  readonly currentDateRange: DateRange;
  readonly onDateRangeChange: (dateRange: DateRange) => void;
  readonly viewMode: 'month' | 'week' | 'day' | 'agenda';
  readonly onViewModeChange?: (viewMode: 'month' | 'week' | 'day' | 'agenda') => void;
  readonly allowNavigation?: boolean;
  readonly enableSearch?: boolean;
  readonly adapter?: BaseCalendarAdapter;
  readonly config?: CalendarConfig;
  readonly actions?: React.ReactNode;
}

/**
 * Navigation step configuration
 */
interface NavigationStep {
  readonly days: number;
  readonly label: string;
}

// ===============================
// CONSTANTS
// ===============================

const VIEW_MODE_STEPS: Record<string, NavigationStep> = {
  day: { days: 1, label: 'day' },
  week: { days: 7, label: 'week' },
  month: { days: 30, label: 'month' },
  agenda: { days: 7, label: 'period' }
};

// ===============================
// MAIN COMPONENT
// ===============================

/**
 * Calendar Header Component
 *
 * Provides navigation controls and view mode switching
 * for the unified calendar system
 */
export function CalendarHeader({
  businessModel,
  currentDateRange,
  onDateRangeChange,
  viewMode,
  onViewModeChange,
  allowNavigation = true,
  enableSearch = false,
  adapter,
  config,
  actions
}: CalendarHeaderProps) {
  // ===============================
  // STATE MANAGEMENT
  // ===============================

  const [searchQuery, setSearchQuery] = useState('');

  // ===============================
  // NAVIGATION HELPERS
  // ===============================

  const navigationStep = VIEW_MODE_STEPS[viewMode] || VIEW_MODE_STEPS.month;

  const formatDateRangeDisplay = useMemo(() => {
    const start = new Date(currentDateRange.startDate);
    const end = new Date(currentDateRange.endDate);

    if (viewMode === 'day') {
      return formatDateForUser(currentDateRange.startDate, 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    if (viewMode === 'week') {
      if (start.getMonth() === end.getMonth()) {
        return `${formatDateForUser(currentDateRange.startDate, 'en-US', { month: 'long', day: 'numeric' })} - ${formatDateForUser(currentDateRange.endDate, 'en-US', { day: 'numeric', year: 'numeric' })}`;
      }
      return `${formatDateForUser(currentDateRange.startDate, 'en-US', { month: 'short', day: 'numeric' })} - ${formatDateForUser(currentDateRange.endDate, 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    if (viewMode === 'month') {
      return formatDateForUser(currentDateRange.startDate, 'en-US', {
        month: 'long',
        year: 'numeric'
      });
    }

    // Agenda view
    return `${formatDateForUser(currentDateRange.startDate, 'en-US', { month: 'short', day: 'numeric' })} - ${formatDateForUser(currentDateRange.endDate, 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }, [currentDateRange, viewMode]);

  // ===============================
  // EVENT HANDLERS
  // ===============================

  const handlePreviousPeriod = useCallback(() => {
    if (!allowNavigation) return;

    const startDate = new Date(currentDateRange.startDate);
    const endDate = new Date(currentDateRange.endDate);

    startDate.setDate(startDate.getDate() - navigationStep.days);
    endDate.setDate(endDate.getDate() - navigationStep.days);

    onDateRangeChange({
      startDate: createISODate(startDate),
      endDate: createISODate(endDate)
    });
  }, [currentDateRange, navigationStep.days, allowNavigation, onDateRangeChange]);

  const handleNextPeriod = useCallback(() => {
    if (!allowNavigation) return;

    const startDate = new Date(currentDateRange.startDate);
    const endDate = new Date(currentDateRange.endDate);

    startDate.setDate(startDate.getDate() + navigationStep.days);
    endDate.setDate(endDate.getDate() + navigationStep.days);

    onDateRangeChange({
      startDate: createISODate(startDate),
      endDate: createISODate(endDate)
    });
  }, [currentDateRange, navigationStep.days, allowNavigation, onDateRangeChange]);

  const handleToday = useCallback(() => {
    if (!allowNavigation) return;

    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    if (viewMode === 'day') {
      startDate = new Date(today);
      endDate = new Date(today);
    } else if (viewMode === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay()); // Start of week
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // End of week
    } else if (viewMode === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else {
      // Agenda view
      startDate = new Date(today);
      endDate = new Date(today);
      endDate.setDate(today.getDate() + 7);
    }

    onDateRangeChange({
      startDate: createISODate(startDate),
      endDate: createISODate(endDate)
    });
  }, [viewMode, allowNavigation, onDateRangeChange]);

  const handleViewModeChange = useCallback((newViewMode: typeof viewMode) => {
    onViewModeChange?.(newViewMode);

    // Adjust date range for new view mode
    const today = new Date(currentDateRange.startDate);
    let startDate: Date;
    let endDate: Date;

    if (newViewMode === 'day') {
      startDate = new Date(today);
      endDate = new Date(today);
    } else if (newViewMode === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (newViewMode === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else {
      // Agenda view
      startDate = new Date(today);
      endDate = new Date(today);
      endDate.setDate(today.getDate() + 7);
    }

    onDateRangeChange({
      startDate: createISODate(startDate),
      endDate: createISODate(endDate)
    });
  }, [currentDateRange, onDateRangeChange, onViewModeChange]);

  // ===============================
  // MAIN RENDER
  // ===============================

  return (
    <Stack
      direction="row"
      justify="space-between"
      align="center"
      padding="md"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      backgroundColor="white"
      gap="md"
    >
      {/* Left section: Navigation */}
      <Stack direction="row" align="center" gap="sm">
        {allowNavigation && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPeriod}
              aria-label={`Previous ${navigationStep.label}`}
            >
              <Icon name="ChevronLeft" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
            >
              Today
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPeriod}
              aria-label={`Next ${navigationStep.label}`}
            >
              <Icon name="ChevronRight" />
            </Button>
          </>
        )}

        <Typography variant="h2" marginLeft="md">
          {formatDateRangeDisplay}
        </Typography>
      </Stack>

      {/* Center section: Business model title */}
      <Stack direction="row" align="center" gap="sm">
        <Typography variant="body" color="gray.600">
          {businessModel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Typography>
      </Stack>

      {/* Right section: Controls and actions */}
      <Stack direction="row" align="center" gap="sm">
        {enableSearch && (
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid var(--colors-gray-300)',
              borderRadius: '6px',
              width: '200px'
            }}
          />
        )}

        <Stack direction="row" gap="sm">
          {['month', 'week', 'day', 'agenda'].map((mode) => (
            <Button
              key={mode}
              variant={mode === viewMode ? 'solid' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange(mode as typeof viewMode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Button>
          ))}
        </Stack>

        {actions}
      </Stack>
    </Stack>
  );
}

export default CalendarHeader;