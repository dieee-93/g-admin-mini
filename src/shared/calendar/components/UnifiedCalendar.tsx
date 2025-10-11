/**
 * UNIFIED CALENDAR COMPONENT - G-ADMIN MINI v3.0
 *
 * Main calendar component that adapts to any business model
 * Uses slots system for business-specific customization
 *
 * @version 3.0.0
 */

import React, { useEffect, useMemo } from 'react';
import {
  ContentLayout,
  Section,
  Stack,
  Typography,
  Button,
  Alert,
  Spinner
} from '@/shared/ui';
import { useCalendarEngine } from '../hooks/useCalendarEngine';
import { useCalendarAdapter } from '../hooks/useCalendarAdapter';
import { useCalendarConfig } from '../hooks/useCalendarConfig';
import type { CalendarEngineConfig } from '../engine/UnifiedCalendarEngine';
import { BaseCalendarAdapter } from '../adapters/BaseCalendarAdapter';
import type {
  CalendarConfig,
  TimezoneString,
  DateRange,
} from '../types/DateTimeTypes';
import { createISODate, getUserTimezone } from '../utils/dateTimeUtils';
import { CalendarGrid } from './CalendarGrid';
import { CalendarHeader } from './CalendarHeader';
import { CalendarSidebar } from './CalendarSidebar';
import { Slot } from '../slots/Slot';

import { logger } from '@/lib/logging';
// ===============================
// COMPONENT INTERFACES
// ===============================

/**
 * Unified calendar props
 */
export interface UnifiedCalendarProps {
  /**
   * Business model for adapter selection
   */
  readonly businessModel: string;

  /**
   * Calendar adapter instance (optional - will auto-select if not provided)
   */
  readonly adapter?: BaseCalendarAdapter;

  /**
   * Calendar configuration (optional - will use defaults if not provided)
   */
  readonly config?: Partial<CalendarConfig>;

  /**
   * Initial date range to display
   */
  readonly initialDateRange?: DateRange;

  /**
   * Timezone for display (optional - will use user's timezone)
   */
  readonly timezone?: TimezoneString;

  /**
   * Additional CSS classes
   */
  readonly className?: string;

  /**
   * Calendar view mode
   */
  readonly viewMode?: 'month' | 'week' | 'day' | 'agenda';

  /**
   * Enable/disable specific features
   */
  readonly features?: {
    readonly showHeader?: boolean;
    readonly showSidebar?: boolean;
    readonly allowNavigation?: boolean;
    readonly allowBookingCreation?: boolean;
    readonly showLegend?: boolean;
    readonly enableSearch?: boolean;
  };

  /**
   * Event handlers
   */
  readonly onBookingClick?: (bookingId: string) => void;
  readonly onSlotClick?: (date: string, time: string) => void;
  readonly onDateChange?: (dateRange: DateRange) => void;
  readonly onError?: (error: string) => void;

  /**
   * Loading and error states
   */
  readonly loading?: boolean;
  readonly error?: string;
}

/**
 * Calendar layout configuration
 */
interface CalendarLayout {
  readonly showHeader: boolean;
  readonly showSidebar: boolean;
  readonly gridColumns: string;
  readonly headerHeight: string;
}

// ===============================
// MAIN COMPONENT
// ===============================

/**
 * Unified Calendar Component
 *
 * Business-model-agnostic calendar that adapts through the adapter pattern
 * and provides customization points through the slots system
 */
export function UnifiedCalendar({
  businessModel,
  adapter: providedAdapter,
  config: providedConfig,
  initialDateRange,
  timezone = getUserTimezone(),
  className = '',
  viewMode = 'month',
  features = {},
  onBookingClick,
  onSlotClick,
  onDateChange,
  onError,
  loading: externalLoading = false,
  error: externalError
}: UnifiedCalendarProps) {
  // Feature defaults
  const {
    showHeader = true,
    showSidebar = true,
    allowNavigation = true,
    allowBookingCreation = true,
    showLegend = true,
    enableSearch = false
  } = features;

  // ===============================
  // CONFIGURATION MANAGEMENT
  // ===============================

  // Load or create calendar configuration
  const configHook = useCalendarConfig(businessModel, true);

  const calendarConfig = useMemo((): CalendarConfig => {
    if (providedConfig && configHook.config) {
      return { ...configHook.config, ...providedConfig };
    }
    if (configHook.config) {
      return configHook.config;
    }
    return configHook.createDefaultConfig(businessModel);
  }, [providedConfig, configHook.config, configHook.createDefaultConfig, businessModel]);

  // ===============================
  // ADAPTER MANAGEMENT
  // ===============================

  const adapterHook = useCalendarAdapter();

  // Initialize adapter when config is ready
  useEffect(() => {
    // Skip if provided adapter is used
    if (providedAdapter) {
      logger.info('App', 'Using provided adapter for', businessModel);
      return;
    }

    // Check if adapter is registered
    if (!adapterHook.hasAdapter(businessModel)) {
      logger.warn('App', `No adapter registered for business model: ${businessModel}`);
      logger.info('App', `Available adapters: ${adapterHook.availableAdapters.join(', ')}`);
      return;
    }

    // Wait for config to be fully loaded
    if (!configHook.config || !configHook.isLoaded || configHook.loading) {
      logger.info('App', 'Waiting for config to load before selecting adapter...');
      return;
    }

    // Wait for calendarConfig to be ready
    if (!calendarConfig || !calendarConfig.businessModel) {
      logger.warn('App', 'Calendar config not ready yet, waiting...');
      return;
    }

    // Skip if adapter is already selected for this business model
    if (adapterHook.currentAdapter && adapterHook.currentBusinessModel === businessModel) {
      logger.info('App', 'Adapter already selected for', businessModel);
      return;
    }

    // Auto-select adapter
    logger.info('App', `Selecting adapter for "${businessModel}" with config:`, calendarConfig);
    adapterHook.selectAdapter(businessModel, calendarConfig).catch((_error) => {
      logger.error('App', 'Failed to select adapter:', error);
    });
  }, [businessModel, providedAdapter, configHook.config, configHook.isLoaded, configHook.loading, calendarConfig.businessModel]);

  // ===============================
  // ENGINE MANAGEMENT
  // ===============================

  const engineConfig = useMemo((): CalendarEngineConfig => ({
    businessModel,
    timezone,
    enabledFeatures: new Set(calendarConfig.enabledFeatures),
    adapter: providedAdapter || adapterHook.currentAdapter || null as any,
    eventBusEnabled: true
  }), [businessModel, timezone, calendarConfig.enabledFeatures, providedAdapter, adapterHook.currentAdapter]);

  const engine = useCalendarEngine(engineConfig);

  // ===============================
  // DATE RANGE MANAGEMENT
  // ===============================

  const [currentDateRange, setCurrentDateRange] = React.useState<DateRange>(() => {
    if (initialDateRange) return initialDateRange;

    const today = createISODate();
    const endOfMonth = createISODate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

    return { startDate: today, endDate: endOfMonth };
  });

  // Notify parent of date changes
  useEffect(() => {
    onDateChange?.(currentDateRange);
  }, [currentDateRange, onDateChange]);

  // ===============================
  // LAYOUT CONFIGURATION
  // ===============================

  const layout = useMemo((): CalendarLayout => ({
    showHeader,
    showSidebar,
    gridColumns: showSidebar ? '1fr 300px' : '1fr',
    headerHeight: showHeader ? '80px' : '0px'
  }), [showHeader, showSidebar]);

  // ===============================
  // ERROR HANDLING
  // ===============================

  const combinedError = externalError || engine.error || adapterHook.error || configHook.error;

  useEffect(() => {
    if (combinedError) {
      onError?.(combinedError);
    }
  }, [combinedError, onError]);

  // ===============================
  // LOADING STATE
  // ===============================

  const isLoading = externalLoading || engine.loading || adapterHook.loading || configHook.loading;

  // ===============================
  // EVENT HANDLERS
  // ===============================

  const handleDateRangeChange = React.useCallback((newDateRange: DateRange) => {
    setCurrentDateRange(newDateRange);
  }, []);

  const handleBookingClick = React.useCallback((bookingId: string) => {
    onBookingClick?.(bookingId);
  }, [onBookingClick]);

  const handleSlotClick = React.useCallback((date: string, time: string) => {
    if (allowBookingCreation) {
      onSlotClick?.(date, time);
    }
  }, [allowBookingCreation, onSlotClick]);

  // ===============================
  // RENDER CONDITIONS
  // ===============================

  // Show loading state
  if (isLoading) {
    return (
      <ContentLayout spacing="normal" className={className}>
        <Section variant="flat" title="Calendar">
          <Stack align="center" justify="center" style={{ minHeight: '400px' }}>
            <Spinner size="lg" />
            <Typography variant="body" color="gray.600">
              Loading calendar...
            </Typography>
          </Stack>
        </Section>
      </ContentLayout>
    );
  }

  // Show error state
  if (combinedError) {
    return (
      <ContentLayout spacing="normal" className={className}>
        <Section variant="flat" title="Calendar Error">
          <Alert status="error" title="Calendar Error">
            {combinedError}
          </Alert>
          <Stack direction="row" gap="md" marginTop="md">
            <Button
              variant="outline"
              onClick={() => {
                engine.clearEngine?.();
                adapterHook.clearAdapter?.();
                configHook.clearError?.();
              }}
            >
              Reset Calendar
            </Button>
            <Button
              variant="solid"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Stack>
        </Section>
      </ContentLayout>
    );
  }

  // Show no adapter warning
  if (!engine.isInitialized || !adapterHook.currentAdapter) {
    return (
      <ContentLayout spacing="normal" className={className}>
        <Section variant="flat" title="Calendar Setup">
          <Alert status="warning" title="Calendar Not Ready">
            No adapter found for business model "{businessModel}".
            Please register an adapter or check your configuration.
          </Alert>
          <Stack marginTop="md">
            <Typography variant="body" color="gray.600">
              Available adapters: {adapterHook.availableAdapters.join(', ') || 'None'}
            </Typography>
            <Button
              variant="outline"
              onClick={() => configHook.loadConfig(businessModel)}
            >
              Retry Setup
            </Button>
          </Stack>
        </Section>
      </ContentLayout>
    );
  }

  // ===============================
  // MAIN RENDER
  // ===============================

  return (
    <ContentLayout spacing="normal" className={className}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: layout.gridColumns,
          gridTemplateRows: `${layout.headerHeight} 1fr`,
          gap: '1rem',
          minHeight: '600px'
        }}
      >
        {/* Calendar Header */}
        {layout.showHeader && (
          <div style={{ gridColumn: '1 / -1' }}>
            <Slot
              name="calendar-header"
              businessModel={businessModel}
              fallback={
                <CalendarHeader
                  businessModel={businessModel}
                  currentDateRange={currentDateRange}
                  onDateRangeChange={handleDateRangeChange}
                  viewMode={viewMode}
                  allowNavigation={allowNavigation}
                  enableSearch={enableSearch}
                  adapter={adapterHook.currentAdapter}
                  config={calendarConfig}
                />
              }
            />
          </div>
        )}

        {/* Main Calendar Grid */}
        <div style={{ gridColumn: layout.showSidebar ? '1' : '1 / -1' }}>
          <Slot
            name="calendar-main"
            businessModel={businessModel}
            fallback={
              <CalendarGrid
                businessModel={businessModel}
                engine={engine.engine!}
                adapter={adapterHook.currentAdapter!}
                config={calendarConfig}
                dateRange={currentDateRange}
                viewMode={viewMode}
                onBookingClick={handleBookingClick}
                onSlotClick={handleSlotClick}
                allowBookingCreation={allowBookingCreation}
                timezone={timezone}
              />
            }
          />
        </div>

        {/* Calendar Sidebar */}
        {layout.showSidebar && (
          <div style={{ gridColumn: '2' }}>
            <Slot
              name="calendar-sidebar"
              businessModel={businessModel}
              fallback={
                <CalendarSidebar
                  businessModel={businessModel}
                  engine={engine.engine!}
                  adapter={adapterHook.currentAdapter!}
                  config={calendarConfig}
                  dateRange={currentDateRange}
                  showLegend={showLegend}
                  onDateRangeChange={handleDateRangeChange}
                />
              }
            />
          </div>
        )}

        {/* Business-Specific Action Slots */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Slot
            name={`${businessModel}-actions`}
            businessModel={businessModel}
          />
        </div>
      </div>
    </ContentLayout>
  );
}

// ===============================
// COMPONENT VARIANTS
// ===============================

/**
 * Simplified calendar for basic use cases
 */
export function SimpleCalendar(props: Omit<UnifiedCalendarProps, 'features'>) {
  return (
    <UnifiedCalendar
      {...props}
      features={{
        showHeader: true,
        showSidebar: false,
        allowNavigation: true,
        allowBookingCreation: false,
        showLegend: false,
        enableSearch: false
      }}
    />
  );
}

/**
 * Full-featured calendar for admin interfaces
 */
export function AdminCalendar(props: Omit<UnifiedCalendarProps, 'features'>) {
  return (
    <UnifiedCalendar
      {...props}
      features={{
        showHeader: true,
        showSidebar: true,
        allowNavigation: true,
        allowBookingCreation: true,
        showLegend: true,
        enableSearch: true
      }}
    />
  );
}

/**
 * Mobile-optimized calendar
 */
export function MobileCalendar(props: Omit<UnifiedCalendarProps, 'features' | 'viewMode'>) {
  return (
    <UnifiedCalendar
      {...props}
      viewMode="day"
      features={{
        showHeader: true,
        showSidebar: false,
        allowNavigation: true,
        allowBookingCreation: true,
        showLegend: false,
        enableSearch: false
      }}
    />
  );
}

// ===============================
// EXPORTS
// ===============================

export default UnifiedCalendar;