/**
 * CALENDAR SIDEBAR COMPONENT - G-ADMIN MINI v3.0
 *
 * Sidebar component for calendar with filters, legend, and quick actions
 * Adapts to business model through adapter system
 *
 * @version 3.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Stack,
  Section,
  Typography,
  Button,
  Badge,
  Alert,
  Icon
} from '@/shared/ui';
import { Checkbox } from '@chakra-ui/react';
import {
  ClockIcon,
  CpuChipIcon as CoffeeIcon,
  ExclamationCircleIcon as AlertCircleIcon,
  HeartIcon as StethoscopeIcon,
  BoltIcon as ZapIcon,
  ArrowPathIcon as RefreshCwIcon,
  ChartBarIcon as ActivityIcon,
  UserIcon,
  Cog6ToothIcon as SettingsIcon,
  PlusIcon,
  DocumentTextIcon as FileTextIcon,
  ArrowDownTrayIcon as DownloadIcon,
  UsersIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { UnifiedCalendarEngine } from '../engine/UnifiedCalendarEngine';
import { BaseCalendarAdapter } from '../adapters/BaseCalendarAdapter';
import { logger } from '@/lib/logging';
import type {
  CalendarConfig,
  DateRange,
  BookingStatus,
  BookingType
} from '../types/DateTimeTypes';

// ===============================
// COMPONENT INTERFACES
// ===============================

/**
 * Calendar sidebar props
 */
export interface CalendarSidebarProps {
  readonly businessModel: string;
  readonly engine: UnifiedCalendarEngine;
  readonly adapter: BaseCalendarAdapter;
  readonly config: CalendarConfig;
  readonly dateRange: DateRange;
  readonly showLegend?: boolean;
  readonly onDateRangeChange?: (dateRange: DateRange) => void;
  readonly onFiltersChange?: (filters: CalendarFilters) => void;
}

/**
 * Calendar filters interface
 */
export interface CalendarFilters {
  readonly bookingTypes: BookingType[];
  readonly statuses: BookingStatus[];
  readonly resourceIds: string[];
  readonly showCancelled: boolean;
  readonly showCompleted: boolean;
}

/**
 * Legend item interface
 */
interface LegendItem {
  readonly label: string;
  readonly color: string;
  readonly icon?: React.ComponentType<{ className?: string }>;
  readonly count?: number;
}

/**
 * Quick action interface
 */
interface QuickAction {
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly action: () => void;
  readonly variant?: 'solid' | 'outline' | 'ghost';
  readonly colorPalette?: string;
}

// ===============================
// MAIN COMPONENT
// ===============================

/**
 * Calendar Sidebar Component
 *
 * Provides filtering, legend, and quick actions for the calendar
 */
export function CalendarSidebar({
  businessModel,
  engine,
  adapter,
  config,
  dateRange,
  showLegend = true,
  onDateRangeChange,
  onFiltersChange
}: CalendarSidebarProps) {
  // ===============================
  // STATE MANAGEMENT
  // ===============================

  const [filters, setFilters] = useState<CalendarFilters>({
    bookingTypes: [],
    statuses: [],
    resourceIds: [],
    showCancelled: false,
    showCompleted: true
  });

  // ===============================
  // BUSINESS MODEL CONFIGURATION
  // ===============================

  const businessModelConfig = useMemo(() => {
    const supportedTypes = adapter.getSupportedBookingTypes();
    const supportedFeatures = adapter.getSupportedFeatures();

    return {
      supportedBookingTypes: supportedTypes,
      supportedFeatures,
      hasResourceManagement: supportedFeatures.includes('resource_management'),
      hasReports: supportedFeatures.includes('reports'),
      hasExport: supportedFeatures.includes('export'),
      hasNotifications: supportedFeatures.includes('notifications')
    };
  }, [adapter]);

  // ===============================
  // LEGEND CONFIGURATION
  // ===============================

  const legendItems = useMemo((): LegendItem[] => {
    const items: LegendItem[] = [];

    // Booking status legend
    const statusColors = {
      pending: '#FEF3C7',
      confirmed: '#D1FAE5',
      in_progress: '#DBEAFE',
      completed: '#F3F4F6',
      cancelled: '#FEE2E2',
      no_show: '#FED7AA',
      rescheduled: '#E9D5FF',
      expired: '#F9FAFB'
    };

    Object.entries(statusColors).forEach(([status, color]) => {
      items.push({
        label: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        color,
        count: 0
      });
    });

    // Business model specific legend items
    if (businessModel === 'staff_scheduling') {
      items.push(
        { label: 'Shift', color: '#3B82F6', icon: ClockIcon },
        { label: 'Break', color: '#8B5CF6', icon: CoffeeIcon },
        { label: 'Overtime', color: '#EF4444', icon: AlertCircleIcon }
      );
    } else if (businessModel === 'medical_appointments') {
      items.push(
        { label: 'Consultation', color: '#10B981', icon: StethoscopeIcon },
        { label: 'Emergency', color: '#EF4444', icon: ZapIcon },
        { label: 'Follow-up', color: '#F59E0B', icon: RefreshCwIcon }
      );
    } else if (businessModel === 'fitness_classes') {
      items.push(
        { label: 'Class', color: '#8B5CF6', icon: ActivityIcon },
        { label: 'Personal Training', color: '#06B6D4', icon: UserIcon },
        { label: 'Equipment Maintenance', color: '#6B7280', icon: SettingsIcon }
      );
    }

    return items;
  }, [businessModel]);

  // ===============================
  // QUICK ACTIONS CONFIGURATION
  // ===============================

  const quickActions = useMemo((): QuickAction[] => {
    const actions: QuickAction[] = [];

    actions.push({
      label: 'New Booking',
      icon: PlusIcon,
      action: () => logger.info('App', 'New booking'),
      variant: 'solid',
      colorPalette: 'blue'
    });

    if (businessModelConfig.hasReports) {
      actions.push({
        label: 'Generate Report',
        icon: FileTextIcon,
        action: () => logger.info('App', 'Generate report'),
        variant: 'outline'
      });
    }

    if (businessModelConfig.hasExport) {
      actions.push({
        label: 'Export Data',
        icon: DownloadIcon,
        action: () => logger.info('App', 'Export data'),
        variant: 'outline'
      });
    }

    if (businessModel === 'staff_scheduling') {
      actions.push(
        {
          label: 'Auto Schedule',
          icon: ZapIcon,
          action: () => logger.info('App', 'Auto schedule'),
          variant: 'outline',
          colorPalette: 'purple'
        },
        {
          label: 'Coverage Report',
          icon: UsersIcon,
          action: () => logger.debug('CalendarSidebar', 'Coverage report'),
          variant: 'ghost'
        });
    } else if (businessModel === 'medical_appointments') {
      actions.push(
        {
          label: 'Patient List',
          icon: UsersIcon,
          action: () => logger.info('App', 'Patient list'),
          variant: 'outline',
          colorPalette: 'green'
        },
        {
          label: 'Send Reminders',
          icon: BellIcon,
          action: () => logger.debug('CalendarSidebar', 'Send reminders'),
          variant: 'ghost'
        });
    }

    return actions;
  }, [businessModel, businessModelConfig]);

  // ===============================
  // EVENT HANDLERS
  // ===============================

  const handleFilterChange = useCallback((newFilters: Partial<CalendarFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  }, [filters, onFiltersChange]);

  const handleBookingTypeToggle = useCallback((bookingType: BookingType) => {
    const updatedTypes = filters.bookingTypes.includes(bookingType)
      ? filters.bookingTypes.filter(t => t !== bookingType)
      : [...filters.bookingTypes, bookingType];

    handleFilterChange({ bookingTypes: updatedTypes });
  }, [filters.bookingTypes, handleFilterChange]);

  const handleStatusToggle = useCallback((status: BookingStatus) => {
    const updatedStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];

    handleFilterChange({ statuses: updatedStatuses });
  }, [filters.statuses, handleFilterChange]);

  // ===============================
  // RENDER HELPERS
  // ===============================

  const renderFilters = () => (
    <Section variant="elevated" title="Filters">
      <Stack gap="md">
        {businessModelConfig.supportedBookingTypes.length > 0 && (
          <div>
            <Typography variant="body" fontWeight="semibold" marginBottom="sm">
              Booking Types
            </Typography>
            <Stack gap="xs">
              {businessModelConfig.supportedBookingTypes.map(type => (
                <Checkbox.Root
                  key={type}
                  checked={filters.bookingTypes.includes(type)}
                  onCheckedChange={() => handleBookingTypeToggle(type)}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Checkbox.Label>
                </Checkbox.Root>
              ))}
            </Stack>
          </div>
        )}

        <div>
          <Typography variant="body" fontWeight="semibold" marginBottom="sm">
            Status
          </Typography>
          <Stack gap="xs">
            <Checkbox.Root
              checked={filters.showCompleted}
              onCheckedChange={(checked) => handleFilterChange({ showCompleted: !!checked })}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>
                Show Completed
              </Checkbox.Label>
            </Checkbox.Root>
            <Checkbox.Root
              checked={filters.showCancelled}
              onCheckedChange={(checked) => handleFilterChange({ showCancelled: !!checked })}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>
                Show Cancelled
              </Checkbox.Label>
            </Checkbox.Root>
          </Stack>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFilterChange({
            bookingTypes: [],
            statuses: [],
            resourceIds: [],
            showCancelled: false,
            showCompleted: true
          })}
        >
          Clear All Filters
        </Button>
      </Stack>
    </Section>
  );

  const renderLegend = () => {
    if (!showLegend) return null;

    return (
      <Section variant="elevated" title="Legend">
        <Stack gap="sm">
          {legendItems.map((item, index) => (
            <Stack key={index} direction="row" align="center" gap="sm">
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: item.color,
                  borderRadius: '4px',
                  border: '1px solid var(--colors-gray-300)'
                }}
              />
              {item.icon && <Icon as={item.icon} size="sm" />}
              <Typography variant="caption" flex="1">
                {item.label}
              </Typography>
              {item.count !== undefined && (
                <Badge size="sm" colorPalette="gray">
                  {item.count}
                </Badge>
              )}
            </Stack>
          ))}
        </Stack>
      </Section>
    );
  };

  const renderQuickActions = () => (
    <Section variant="elevated" title="Quick Actions">
      <Stack gap="sm">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'outline'}
            colorPalette={action.colorPalette}
            size="sm"
            leftIcon={<Icon as={action.icon} />}
            onClick={action.action}
            width="full"
          >
            {action.label}
          </Button>
        ))}
      </Stack>
    </Section>
  );

  const renderStats = () => {
    const stats = engine.getEngineStatus();

    return (
      <Section variant="flat" title="Overview">
        <Stack gap="sm">
          <Stack direction="row" justify="space-between">
            <Typography variant="caption" color="gray.600">
              Total Bookings
            </Typography>
            <Badge colorPalette="blue">
              {stats?.totalBookings || 0}
            </Badge>
          </Stack>
          <Stack direction="row" justify="space-between">
            <Typography variant="caption" color="gray.600">
              Resources
            </Typography>
            <Badge colorPalette="green">
              {stats?.totalResources || 0}
            </Badge>
          </Stack>
          <Stack direction="row" justify="space-between">
            <Typography variant="caption" color="gray.600">
              Business Model
            </Typography>
            <Badge colorPalette="purple">
              {businessModel.replace('_', ' ')}
            </Badge>
          </Stack>
        </Stack>
      </Section>
    );
  };

  const renderBusinessModelInfo = () => {
    if (!businessModelConfig.supportedFeatures.length) return null;

    return (
      <Section variant="flat" title="Capabilities">
        <Stack gap="xs">
          {businessModelConfig.supportedFeatures.map(feature => (
            <Badge
              key={feature}
              size="sm"
              colorPalette="gray"
              variant="outline"
            >
              {feature.replace('_', ' ')}
            </Badge>
          ))}
        </Stack>
      </Section>
    );
  };

  // ===============================
  // MAIN RENDER
  // ===============================

  return (
    <Stack gap="lg">
      {renderStats()}
      {renderFilters()}
      {renderLegend()}
      {renderQuickActions()}
      {renderBusinessModelInfo()}

      {businessModel === 'staff_scheduling' && (
        <Section variant="elevated" title="Labor Insights">
          <Alert status="info" title="Coverage Alert">
            Monday needs 2 additional staff members during lunch hours.
          </Alert>
        </Section>
      )}

      {businessModel === 'medical_appointments' && (
        <Section variant="elevated" title="Patient Alerts">
          <Alert status="warning" title="Reminder">
            3 patients have appointments today without confirmed contact info.
          </Alert>
        </Section>
      )}
    </Stack>
  );
}

export default CalendarSidebar;