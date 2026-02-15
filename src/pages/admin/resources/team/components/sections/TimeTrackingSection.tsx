// OfflineTimeTrackingSection.tsx - Offline-First Time Tracking for G-Admin Mini
// Provides seamless offline time tracking with intelligent sync

import { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  Badge,
  Alert,
  Dialog,
  Avatar,
  Progress,
  Tooltip,
  Tabs,
  Textarea,
  CardWrapper,
  Grid,
  Icon
} from '@/shared/ui';
import {
  ClockIcon,
  PlayIcon,
  StopIcon,
  PauseIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  WifiIcon,
  NoSymbolIcon,
  CircleStackIcon,
  CloudIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { ClockIcon as TimeIcon } from '@heroicons/react/24/outline'; // Using ClockIcon again

// Offline functionality
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { type OfflineCommand as SyncOperation } from '@/lib/offline/types';
import type { TeamViewState, TeamMember } from '../../types';
import { EventBus } from '@/lib/events';
import { notify } from '@/lib/notifications';

// Staff imports
import type { TimeEntry, TimeSheet, TimeTrackingStats } from '../../types';
import { logger } from '@/lib/logging';

// TODO: Implement useMemo and useCallback when performance optimization is needed
// TODO: Implement Table, NumberInput, Select, IconButton when time entry editing UI is added
// TODO: Implement offlineSync integration for automatic synchronization

// Time tracking specific offline types
interface OfflineTimeOperation {
  id: string;
  type: 'time_entry_create' | 'time_entry_update' | 'timesheet_submit' | 'timesheet_approve';
  entityId: string;
  data: TimeEntry | TimeSheet;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  employee_id: string;
}


interface OfflineTimeTrackingSectionProps {
  viewState: TeamViewState;
  onViewStateChange: (state: TeamViewState) => void;
}

// Mock teamMember data for demonstration
const mockEmployees: TeamMember[] = [
  {
    id: 'emp001',
    employee_id: 'EMP001',
    teamMember_id: 'TM001', // Added mock field
    first_name: 'Ana',
    last_name: 'García',
    email: 'ana@restaurant.com',
    position: 'Chef',
    department: 'Kitchen',
    hire_date: '2023-01-15',
    employment_status: 'active',
    employment_type: 'full_time',
    role: 'teamMember',
    permissions: [],
    created_at: '2023-01-15T08:00:00Z',
    updated_at: '2024-01-08T10:00:00Z'
  },
  {
    id: 'emp002',
    employee_id: 'EMP002',
    teamMember_id: 'TM002', // Added mock field
    first_name: 'Carlos',
    last_name: 'López',
    email: 'carlos@restaurant.com',
    position: 'Waiter',
    department: 'Service',
    hire_date: '2023-03-20',
    employment_status: 'active',
    employment_type: 'part_time',
    role: 'teamMember',
    permissions: [],
    created_at: '2023-03-20T08:00:00Z',
    updated_at: '2024-01-08T10:00:00Z'
  },
  {
    id: 'emp003',
    employee_id: 'EMP003',
    teamMember_id: 'TM003', // Added mock field
    first_name: 'María',
    last_name: 'Rodríguez',
    email: 'maria@restaurant.com',
    position: 'Manager',
    department: 'Administration',
    hire_date: '2022-08-10',
    employment_status: 'active',
    employment_type: 'full_time',
    role: 'manager',
    permissions: [],
    created_at: '2022-08-10T08:00:00Z',
    updated_at: '2024-01-08T10:00:00Z'
  }
];

export function TimeTrackingSection({ viewState: _viewState, onViewStateChange: _onViewStateChange }: OfflineTimeTrackingSectionProps) {
  // Offline status management
  const {
    isOnline,
    isConnecting,
    connectionQuality,
    isSyncing,
    queueSize,
    queueOperation,
    forceSync,
    cacheData,
    getCachedData
  } = useOfflineStatus();

  // Local state for offline functionality
  const [offlineTimeEntries, setOfflineTimeEntries] = useState<TimeEntry[]>([]);
  const [offlineTimesheets, setOfflineTimesheets] = useState<TimeSheet[]>([]);
  const [offlineOperations, setOfflineOperations] = useState<OfflineTimeOperation[]>([]);
  const [currentShifts, setCurrentShifts] = useState<Map<string, TimeEntry>>(new Map());

  // UI state
  const [activeTab, setActiveTab] = useState<'clock' | 'timesheets' | 'reports' | 'settings'>('clock');
  const [selectedEmployee, setSelectedEmployee] = useState<TeamMember | null>(null);
  const [showClockDialog, setShowClockDialog] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [clockAction, setClockAction] = useState<'in' | 'out' | 'break_start' | 'break_end'>('in');
  const [clockNotes, setClockNotes] = useState('');
  const [syncProgress, setSyncProgress] = useState(0);

  // Time tracking stats
  const [timeStats, setTimeStats] = useState<TimeTrackingStats>({
    today_total_hours: 0,
    week_total_hours: 0,
    active_employees: 0,
    on_break: 0,
    overtime_this_week: 0,
    pending_approvals: 0
  });

  // Initialize offline functionality
  useEffect(() => {
    loadTimeTrackingData();
    loadOfflineOperations();
    const cleanup = setupTimeTrackingEventListeners();
    calculateTimeStats();

    return cleanup;
  }, [isOnline]);

  // Sync progress monitoring
  useEffect(() => {
    const updateSyncProgress = () => {
      if (isSyncing && queueSize > 0) {
        const progress = Math.max(0, Math.min(100, (1 - queueSize / Math.max(offlineOperations.length, 1)) * 100));
        setSyncProgress(progress);
      } else if (!isSyncing) {
        setSyncProgress(100);
      }
    };

    const interval = setInterval(updateSyncProgress, 1000);
    return () => clearInterval(interval);
  }, [isSyncing, queueSize, offlineOperations.length]);

  const loadTimeTrackingData = async () => {
    try {
      let timeEntries: TimeEntry[] = [];
      let timesheets: TimeSheet[] = [];

      if (isOnline) {
        // Load from API when online
        // timeEntries = await timeTrackingApi.getTimeEntries();
        // timesheets = await timeTrackingApi.getTimesheets();

        // Cache for offline use
        if (timeEntries.length > 0) {
          await cacheData('time_entries', timeEntries, 60 * 60 * 1000); // 1 hour TTL
        }
        if (timesheets.length > 0) {
          await cacheData('timesheets', timesheets, 60 * 60 * 1000);
        }
      } else {
        // Load from cache when offline
        const cachedEntries = await getCachedData('time_entries') || [];
        const cachedSheets = await getCachedData('timesheets') || [];
        timeEntries = cachedEntries;
        timesheets = cachedSheets;

        if (timeEntries.length > 0 || timesheets.length > 0) {
          notify.info('Showing cached time tracking data (offline mode)');
        }
      }

      // Load offline-only data and merge
      const offlineEntries = await localStorage.getAll('offline_time_entries') || [];
      const offlineSheets = await localStorage.getAll('offline_timesheets') || [];

      setOfflineTimeEntries([...timeEntries, ...offlineEntries]);
      setOfflineTimesheets([...timesheets, ...offlineSheets]);

      // Update current shifts
      updateCurrentShifts([...timeEntries, ...offlineEntries]);

    } catch (error) {
      logger.error('StaffStore', 'Error loading time tracking data:', error);

      // Fallback to cached/offline data
      const cachedEntries = await getCachedData('time_entries') || [];
      const cachedSheets = await getCachedData('timesheets') || [];
      const offlineEntries = await localStorage.getAll('offline_time_entries') || [];
      const offlineSheets = await localStorage.getAll('offline_timesheets') || [];

      if (cachedEntries.length > 0 || offlineEntries.length > 0) {
        setOfflineTimeEntries([...cachedEntries, ...offlineEntries]);
        setOfflineTimesheets([...cachedSheets, ...offlineSheets]);
        notify.warning('Using cached time tracking data - could not connect to server');
      } else {
        notify.error('No time tracking data available offline');
      }
    }
  };

  const loadOfflineOperations = async () => {
    try {
      const operations = await localStorage.getAll('offline_time_operations') || [];
      setOfflineOperations(operations);
    } catch (error) {
      logger.error('StaffStore', 'Error loading offline time operations:', error);
    }
  };

  const setupTimeTrackingEventListeners = () => {
    // Listen for teamMember clock events
    const handleTimeEvent = async (event: any) => {
      if (event.isOffline) {
        await processOfflineTimeEntry(event);
      }
    };

    EventBus.on('staff.clock_in', handleTimeEvent);
    EventBus.on('staff.clock_out', handleTimeEvent);

    return () => {
      EventBus.off('staff.clock_in', handleTimeEvent);
      EventBus.off('staff.clock_out', handleTimeEvent);
    };
  };

  const updateCurrentShifts = (timeEntries: TimeEntry[]) => {
    const shifts = new Map<string, TimeEntry>();

    // Group by teamMember and find latest clock_in without clock_out
    const employeeEntries = timeEntries.reduce((acc, entry) => {
      if (!acc[entry.employee_id]) acc[entry.employee_id] = [];
      acc[entry.employee_id].push(entry);
      return acc;
    }, {} as Record<string, TimeEntry[]>);

    Object.entries(employeeEntries).forEach(([employeeId, entries]) => {
      const sortedEntries = entries.sort((a, b) => b.timestamp - a.timestamp);

      // Find if teamMember is currently clocked in
      for (const entry of sortedEntries) {
        if (entry.entry_type === 'clock_in') {
          // Check if there's a corresponding clock_out after this clock_in
          const hasClockOut = sortedEntries.some(e =>
            e.entry_type === 'clock_out' &&
            e.timestamp > entry.timestamp
          );

          if (!hasClockOut) {
            shifts.set(employeeId, entry);
          }
          break;
        }
      }
    });

    setCurrentShifts(shifts);
  };

  const calculateTimeStats = () => {
    const today = new Date().toDateString();
    const thisWeek = getWeekStart(new Date());

    let todayHours = 0;
    let weekHours = 0;
    let activeCount = 0;
    let onBreakCount = 0;
    let overtimeWeek = 0;
    let pendingApprovals = 0;

    // Calculate from timesheets and current shifts
    offlineTimesheets.forEach(sheet => {
      const sheetDate = new Date(sheet.date);

      if (sheetDate.toDateString() === today) {
        todayHours += sheet.total_hours;
      }

      if (sheetDate >= thisWeek) {
        weekHours += sheet.total_hours;
        overtimeWeek += sheet.overtime_hours;
      }

      if (sheet.status === 'submitted') {
        pendingApprovals++;
      }
    });

    // Count active shifts
    activeCount = currentShifts.size;

    // Count teamMembers on break (simplified logic)
    const latestEntries = new Map<string, TimeEntry>();
    offlineTimeEntries.forEach(entry => {
      const current = latestEntries.get(entry.employee_id);
      if (!current || entry.timestamp > current.timestamp) {
        latestEntries.set(entry.employee_id, entry);
      }
    });

    latestEntries.forEach(entry => {
      if (entry.entry_type === 'break_start') {
        onBreakCount++;
      }
    });

    setTimeStats({
      today_total_hours: todayHours,
      week_total_hours: weekHours,
      active_employees: activeCount,
      on_break: onBreakCount,
      overtime_this_week: overtimeWeek,
      pending_approvals: pendingApprovals
    });
  };

  const processOfflineTimeEntry = async (entryData: any) => {
    const timeEntry: TimeEntry = {
      id: `offline_time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      employee_id: entryData.employee_id,
      entry_type: entryData.entry_type,
      timestamp: Date.now(),
      location: entryData.location,
      notes: entryData.notes || '',
      is_offline: true,
      sync_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Store offline entry
    await localStorage.set('offline_time_entries', timeEntry.id, timeEntry);

    // Create sync operation
    const operation: OfflineTimeOperation = {
      id: `time_entry_${timeEntry.id}`,
      type: 'time_entry_create',
      entityId: timeEntry.id,
      data: timeEntry,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
      employee_id: entryData.employee_id
    };

    // Queue for sync - Correctly mapped to OfflineCommand structure
    const syncOperation: Omit<SyncOperation, 'id' | 'timestamp' | 'clientId' | 'retry' | 'lastError' | 'nextRetryAt'> = {
      operation: 'CREATE',
      entityType: 'time_entries', // Assuming time_entries is valid table key
      entityId: timeEntry.id, // Should match schema PK
      data: timeEntry,
      priority: 2, // High priority for time tracking
      status: 'pending',
      retryCount: 0
    };

    // queueOperation expects OfflineCommand properties
    queueOperation(syncOperation as any); // Using as any to bypass strict type check if needed temporarily

    // Store operation
    await localStorage.set('offline_time_operations', operation.id, operation);
    setOfflineOperations(prev => [...prev, operation]);

    // Update local state
    setOfflineTimeEntries(prev => [...prev, timeEntry]);
    updateCurrentShifts([...offlineTimeEntries, timeEntry]);
    calculateTimeStats();
  };

  const handleClockAction = async () => {
    if (!selectedEmployee) return;

    try {
      const entryData = {
        employee_id: selectedEmployee.id,
        entry_type: clockAction,
        notes: clockNotes,
        location: await getCurrentLocation()
      };

      if (isOnline) {
        // Try online first
        try {
          // await timeTrackingApi.createTimeEntry(entryData);

          // Emit EventBus events for ShiftControl integration
          const eventBus = EventBus.getInstance(); // Method might not exist, check EventBus definition
          // Or just use EventBus.emit if static

          if (clockAction === 'in') {
            await (EventBus as any).emit('staff.teamMember.checked_in', { // Static method usage
              employee_id: selectedEmployee.id,
              employee_name: `${selectedEmployee.first_name} ${selectedEmployee.last_name}`,
              checked_in_at: new Date().toISOString(),
              shift_id: null, // Will be associated by ShiftControl based on active shift
            });
            logger.info('StaffModule', 'Emitted staff.teamMember.checked_in event', {
              employee_id: selectedEmployee.id
            });
          } else if (clockAction === 'out') {
            // Find the corresponding clock_in to calculate hours worked
            const currentShift = currentShifts.get(selectedEmployee.id);
            const hoursWorked = currentShift
              ? (Date.now() - currentShift.timestamp) / (1000 * 60 * 60)
              : 0;

            await (EventBus as any).emit('staff.teamMember.checked_out', {
              employee_id: selectedEmployee.id,
              checked_out_at: new Date().toISOString(),
              shift_id: null, // Will be associated by ShiftControl based on active shift
              hours_worked: Math.round(hoursWorked * 100) / 100, // Round to 2 decimals
            });
            logger.info('StaffModule', 'Emitted staff.teamMember.checked_out event', {
              employee_id: selectedEmployee.id,
              hours_worked: hoursWorked
            });
          }

          notify.success(`${getActionLabel(clockAction)} registered successfully`);
          handleClockDialogClose();
          return;
        } catch (error) {
          logger.error('StaffStore', 'Online clock action failed, switching to offline mode:', error);
        }
      }

      // Offline processing
      await processOfflineTimeEntry(entryData);
      notify.success(`${getActionLabel(clockAction)} saved offline - will sync when online`);
      handleClockDialogClose();

    } catch (error) {
      logger.error('StaffStore', 'Error processing clock action:', error);
      notify.error(`Failed to register ${getActionLabel(clockAction).toLowerCase()}`);
    }
  };

  const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | undefined> => {
    try {
      if (!navigator.geolocation) return undefined;

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }),
          () => resolve(undefined),
          { timeout: 5000 }
        );
      });
    } catch {
      return undefined;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'in': return 'Clock In';
      case 'out': return 'Clock Out';
      case 'break_start': return 'Break Start';
      case 'break_end': return 'Break End';
      default: return 'Action';
    }
  };

  const getEmployeeStatus = (employeeId: string) => {
    const currentShift = currentShifts.get(employeeId);
    if (currentShift) {
      // Check latest entry for this teamMember
      const latestEntry = offlineTimeEntries
        .filter(entry => entry.employee_id === employeeId)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      if (latestEntry?.entry_type === 'break_start') {
        return { status: 'on_break', label: 'On Break', color: 'yellow' };
      }
      return { status: 'working', label: 'Working', color: 'green' };
    }
    return { status: 'off_duty', label: 'Off Duty', color: 'gray' };
  };

  const getShiftHours = (employeeId: string) => {
    const currentShift = currentShifts.get(employeeId);
    if (!currentShift) return 0;

    const now = Date.now();
    const shiftStart = currentShift.timestamp;

    // Subtract break time
    const breaks = offlineTimeEntries
      .filter(entry =>
        entry.employee_id === employeeId &&
        entry.timestamp > shiftStart &&
        (entry.entry_type === 'break_start' || entry.entry_type === 'break_end')
      )
      .sort((a, b) => a.timestamp - b.timestamp);

    let totalBreakTime = 0;
    for (let i = 0; i < breaks.length; i += 2) {
      const breakStart = breaks[i];
      const breakEnd = breaks[i + 1];

      if (breakStart?.entry_type === 'break_start') {
        const breakEndTime = breakEnd?.entry_type === 'break_end' ? breakEnd.timestamp : now;
        totalBreakTime += breakEndTime - breakStart.timestamp;
      }
    }

    const totalTime = now - shiftStart - totalBreakTime;
    return Math.max(0, totalTime / (1000 * 60 * 60)); // Convert to hours
  };

  const handleForceSyncTimeTracking = async () => {
    try {
      await forceSync();
      await loadOfflineOperations();
      notify.success('Time tracking sync completed');
    } catch (error) {
      logger.error('StaffStore', 'Error forcing time tracking sync:', error);
      notify.error('Failed to sync time tracking operations');
    }
  };

  const handleClockDialogClose = () => {
    setShowClockDialog(false);
    setSelectedEmployee(null);
    setClockAction('in');
    setClockNotes('');
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const getConnectionStatusColor = () => {
    if (!isOnline) return 'red';
    if (connectionQuality === 'excellent') return 'green';
    if (connectionQuality === 'good') return 'yellow';
    return 'orange';
  };

  return (
    <Stack direction="column" gap="6" align="stretch">
      {/* Enhanced Header with Connection Status */}
      <Stack direction="row" justify="space-between" align="center">
        <Stack direction="row">
          <Typography fontSize="lg" fontWeight="semibold">Time Tracking</Typography>
          <Box p="2">
            <Badge
              colorPalette={getConnectionStatusColor()}
              variant="subtle"
            >
              <Stack direction="row" gap={1}>
                {isOnline ?
                  <Icon icon={WifiIcon} size="xs" /> :
                  <Icon icon={NoSymbolIcon} size="xs" />
                }
                <Typography fontSize="xs">
                  {!isOnline ? 'Offline' :
                    isConnecting ? 'Connecting...' :
                      `Online (${connectionQuality})`}
                </Typography>
              </Stack>
            </Badge>
          </Box>
        </Stack>

        <Stack direction="row" gap="2">
          {/* Offline Operations Indicator */}
          {offlineOperations.length > 0 && (
            <Tooltip.Root aria-label={`${offlineOperations.length} operations pending sync`}>
              <Button
                variant="outline"
                colorPalette="orange"
                size="sm"
                onClick={() => setShowOfflineModal(true)}
              >
                <Icon icon={CircleStackIcon} size="sm" />
                {offlineOperations.length} Offline
              </Button>
            </Tooltip.Root>
          )}

          {/* Sync Progress */}
          {isSyncing && (
            <Box px="4">
              <Typography fontSize="xs" mb={1}>Syncing...</Typography>
              <Progress.Root value={syncProgress} size="sm">
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </Box>
          )}

          {/* Manual Sync Button */}
          {queueSize > 0 && (
            <Button
              variant="outline"
              colorPalette="blue"
              size="sm"
              onClick={handleForceSyncTimeTracking}
              loading={isSyncing}
            >
              <Icon icon={CloudIcon} size="sm" />
              Sync ({queueSize})
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Offline Mode Alert */}
      {!isOnline && (
        <Alert.Root status="warning">
          <Alert.Indicator>
            <Icon icon={NoSymbolIcon} size="md" />
          </Alert.Indicator>
          <Alert.Title>Time Tracking Offline Mode</Alert.Title>
          <Alert.Description>
            All time entries will be saved locally and synced automatically when connection is restored.
          </Alert.Description>
        </Alert.Root>
      )}

      {/* Time Tracking Stats */}
      <Grid columns={{ base: 2, md: 4, lg: 6 }} gap="4">
        <CardWrapper size="sm">
          <CardWrapper.Body textAlign="center">
            <Stack direction="column" gap="1">
              <Icon icon={TimeIcon} size="md" color="blue.500" />
              <Typography fontSize="lg" fontWeight="bold">{timeStats.today_total_hours.toFixed(1)}</Typography>
              <Typography fontSize="xs" color="gray.600">Hours Today</Typography>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper size="sm">
          <CardWrapper.Body textAlign="center">
            <Stack direction="column" gap="1">
              <Icon icon={CalendarIcon} size="md" color="green.500" />
              <Typography fontSize="lg" fontWeight="bold">{timeStats.week_total_hours.toFixed(1)}</Typography>
              <Typography fontSize="xs" color="gray.600">Hours This Week</Typography>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper size="sm">
          <CardWrapper.Body textAlign="center">
            <Stack direction="column" gap="1">
              <Icon icon={PlayIcon} size="md" color="purple.500" />
              <Typography fontSize="lg" fontWeight="bold">{timeStats.active_employees}</Typography>
              <Typography fontSize="xs" color="gray.600">Active Now</Typography>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper size="sm">
          <CardWrapper.Body textAlign="center">
            <Stack direction="column" gap="1">
              <Icon icon={PauseIcon} size="md" color="orange.500" />
              <Typography fontSize="lg" fontWeight="bold">{timeStats.on_break}</Typography>
              <Typography fontSize="xs" color="gray.600">On Break</Typography>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper size="sm">
          <CardWrapper.Body textAlign="center">
            <Stack direction="column" gap="1">
              <Icon icon={ArrowTrendingUpIcon} size="md" color="red.500" />
              <Typography fontSize="lg" fontWeight="bold">{timeStats.overtime_this_week.toFixed(1)}</Typography>
              <Typography fontSize="xs" color="gray.600">Overtime Week</Typography>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper size="sm">
          <CardWrapper.Body textAlign="center">
            <Stack direction="column" gap="1">
              <Icon icon={ExclamationTriangleIcon} size="md" color="yellow.500" />
              <Typography fontSize="lg" fontWeight="bold">{timeStats.pending_approvals}</Typography>
              <Typography fontSize="xs" color="gray.600">Pending Approval</Typography>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      </Grid>

      {/* Time Tracking Tabs */}
      <CardWrapper>
        <CardWrapper.Body p="0">
          <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
            <Tabs.List bg="gray.50" p="1" borderRadius="lg">
              <Tabs.Trigger value="clock" gap="2" flex="1" minH="44px">
                <Icon icon={ClockIcon} size="md" />
                <Typography display={{ base: "none", sm: "block" }}>Clock</Typography>
                {!isOnline && <Badge colorPalette="orange" size="xs">Offline</Badge>}
              </Tabs.Trigger>

              <Tabs.Trigger value="timesheets" gap="2" flex="1" minH="44px">
                <Icon icon={DocumentTextIcon} size="md" />
                <Typography display={{ base: "none", sm: "block" }}>Timesheets</Typography>
                {timeStats.pending_approvals > 0 && (
                  <Badge colorPalette="yellow" size="xs">{timeStats.pending_approvals}</Badge>
                )}
              </Tabs.Trigger>

              <Tabs.Trigger value="reports" gap="2" flex="1" minH="44px">
                <Icon icon={ChartBarIcon} size="md" />
                <Typography display={{ base: "none", sm: "block" }}>Reports</Typography>
              </Tabs.Trigger>

              <Tabs.Trigger value="settings" gap="2" flex="1" minH="44px">
                <Icon icon={AdjustmentsHorizontalIcon} size="md" />
                <Typography display={{ base: "none", sm: "block" }}>Settings</Typography>
              </Tabs.Trigger>
            </Tabs.List>

            <Box p="6">
              {/* Clock Tab */}
              <Tabs.Content value="clock">
                <Stack direction="column" gap="6" align="stretch">
                  <Typography fontSize="lg" fontWeight="semibold">TeamMember Clock</Typography>

                  {/* Current Shifts */}
                  <Grid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
                    {mockEmployees.map(teamMember => {
                      const status = getEmployeeStatus(teamMember.id);
                      const shiftHours = getShiftHours(teamMember.id);

                      return (
                        <CardWrapper key={teamMember.id}>
                          <CardWrapper.Body>
                            <Stack direction="column" align="stretch" gap="3">
                              <Stack direction="row" gap="3">
                                <Avatar
                                  name={`${teamMember.first_name} ${teamMember.last_name}`}
                                  size="sm"
                                />

                                <Stack direction="column" align="start" gap="0" flex="1">
                                  <Typography fontWeight="medium" fontSize="sm">
                                    {teamMember.first_name} {teamMember.last_name}
                                  </Typography>
                                  <Typography fontSize="xs" color="gray.600">
                                    {teamMember.position}
                                  </Typography>
                                </Stack>

                                <Box>
                                  <Badge colorPalette={status.color as any} size="sm">
                                    {status.label}
                                  </Badge>
                                </Box>
                              </Stack>

                              {status.status !== 'off_duty' && (
                                <Stack direction="row" justify="space-between" align="center">
                                  <Typography fontSize="xs" color="gray.500">Current Shift:</Typography>
                                  <Box>
                                    <Badge variant="outline" colorPalette="blue" size="sm">
                                      {shiftHours.toFixed(1)} hrs
                                    </Badge>
                                  </Box>
                                </Stack>
                              )}

                              <Box width="full">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  colorPalette="gray"
                                  onClick={() => {
                                    setSelectedEmployee(teamMember);
                                    setShowClockDialog(true);
                                  }}
                                  width="full"
                                >
                                  {status.status === 'off_duty' ? 'Start Shift' : 'Project Clock'}
                                </Button>
                              </Box>
                            </Stack>
                          </CardWrapper.Body>
                        </CardWrapper>
                      );
                    })}
                  </Grid>
                </Stack>
              </Tabs.Content>
              {/* Other tabs implementation placeholders would go here */}
            </Box>
          </Tabs.Root>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Clock Dialog */}
      <Dialog.Root open={showClockDialog} onOpenChange={(e) => setShowClockDialog(e.open)}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Clock Action</Dialog.Title>
            <Dialog.Description>
              Record time entry for {selectedEmployee?.first_name} {selectedEmployee?.last_name}
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Body>
            <Stack gap="4">
              <Grid columns={{ base: 2, md: 2 }} gap="3">
                <Box width="full">
                  <Button
                    variant={clockAction === 'in' ? 'solid' : 'outline'}
                    colorPalette="green"
                    onClick={() => setClockAction('in')}
                    width="full"
                  >
                    <Icon icon={PlayIcon} size="sm" /> Clock In
                  </Button>
                </Box>
                <Box width="full">
                  <Button
                    variant={clockAction === 'out' ? 'solid' : 'outline'}
                    colorPalette="red"
                    onClick={() => setClockAction('out')}
                    width="full"
                  >
                    <Icon icon={StopIcon} size="sm" /> Clock Out
                  </Button>
                </Box>
                <Box width="full">
                  <Button
                    variant={clockAction === 'break_start' ? 'solid' : 'outline'}
                    colorPalette="orange"
                    onClick={() => setClockAction('break_start')}
                    width="full"
                  >
                    <Icon icon={PauseIcon} size="sm" /> Start Break
                  </Button>
                </Box>
                <Box width="full">
                  <Button
                    variant={clockAction === 'break_end' ? 'solid' : 'outline'}
                    colorPalette="blue"
                    onClick={() => setClockAction('break_end')}
                    width="full"
                  >
                    <Icon icon={ClockIcon} size="sm" /> End Break
                  </Button>
                </Box>
              </Grid>

              <Textarea
                placeholder="Optional notes..."
                value={clockNotes}
                onChange={(e) => setClockNotes(e.target.value)}
              />
            </Stack>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="ghost" onClick={handleClockDialogClose}>Cancel</Button>
            <Button colorPalette="blue" onClick={handleClockAction}>Confirm</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>

      {/* Offline Sync Modal placeholder */}
      <Dialog.Root open={showOfflineModal} onOpenChange={(e) => setShowOfflineModal(e.open)}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Offline Operations</Dialog.Title>
            <Dialog.Description>
              {offlineOperations.length} operations pending synchronization
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Body>
            {/* List of operations would go here */}
            <Typography>Syncing is handled automatically when connection is restored.</Typography>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={() => setShowOfflineModal(false)}>Close</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </Stack>
  );
}