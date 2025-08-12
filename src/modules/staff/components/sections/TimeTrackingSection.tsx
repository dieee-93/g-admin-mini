// OfflineTimeTrackingSection.tsx - Offline-First Time Tracking for G-Admin Mini
// Provides seamless offline time tracking with intelligent sync

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Badge,
  Alert,
  SimpleGrid,
  Dialog,
  Avatar,
  Progress,
  Tooltip,
  Tabs,
  Table,
  NumberInput,
  Textarea,
  Select,
  createListCollection,
  IconButton
} from '@chakra-ui/react';
import {
  ClockIcon,
  PlayIcon,
  StopIcon,
  PauseIcon,
  CalendarIcon,
  UserIcon,
  ExclamationTriangleIcon,
  WifiIcon,
  NoSymbolIcon,
  CloudIcon,
  CircleStackIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon as TimeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

// Offline functionality
import { 
  useOfflineStatus,
  offlineSync,
  localStorage,
  type SyncOperation 
} from '@/lib/offline';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';
import { notify } from '@/lib/notifications';

// Staff imports
import type { Employee, StaffViewState, TimeEntry, TimeSheet, TimeTrackingStats } from '../../types';

// Time tracking specific offline types

interface OfflineTimeOperation {
  id: string;
  type: 'time_entry_create' | 'time_entry_update' | 'timesheet_submit' | 'timesheet_approve';
  entityId: string;
  data: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  employee_id: string;
}


interface OfflineTimeTrackingSectionProps {
  viewState: StaffViewState;
  onViewStateChange: (state: StaffViewState) => void;
}

// Mock employee data for demonstration
const mockEmployees: Employee[] = [
  {
    id: 'emp001',
    employee_id: 'EMP001',
    first_name: 'Ana',
    last_name: 'García',
    email: 'ana@restaurant.com',
    position: 'Chef',
    department: 'Kitchen',
    hire_date: '2023-01-15',
    employment_status: 'active',
    employment_type: 'full_time',
    role: 'employee',
    permissions: [],
    created_at: '2023-01-15T08:00:00Z',
    updated_at: '2024-01-08T10:00:00Z'
  },
  {
    id: 'emp002',
    employee_id: 'EMP002',
    first_name: 'Carlos',
    last_name: 'López',
    email: 'carlos@restaurant.com',
    position: 'Waiter',
    department: 'Service',
    hire_date: '2023-03-20',
    employment_status: 'active',
    employment_type: 'part_time',
    role: 'employee',
    permissions: [],
    created_at: '2023-03-20T08:00:00Z',
    updated_at: '2024-01-08T10:00:00Z'
  },
  {
    id: 'emp003',
    employee_id: 'EMP003',
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

export function TimeTrackingSection({ viewState, onViewStateChange }: OfflineTimeTrackingSectionProps) {
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
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
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
    setupTimeTrackingEventListeners();
    calculateTimeStats();
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
      console.error('Error loading time tracking data:', error);
      
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
      console.error('Error loading offline time operations:', error);
    }
  };

  const setupTimeTrackingEventListeners = () => {
    // Listen for employee clock events
    const handleTimeEvent = async (event: any) => {
      if (event.isOffline) {
        await processOfflineTimeEntry(event);
      }
    };

    EventBus.on(RestaurantEvents.EMPLOYEE_CLOCK_IN, handleTimeEvent);
    EventBus.on(RestaurantEvents.EMPLOYEE_CLOCK_OUT, handleTimeEvent);

    return () => {
      EventBus.off(RestaurantEvents.EMPLOYEE_CLOCK_IN, handleTimeEvent);
      EventBus.off(RestaurantEvents.EMPLOYEE_CLOCK_OUT, handleTimeEvent);
    };
  };

  const updateCurrentShifts = (timeEntries: TimeEntry[]) => {
    const shifts = new Map<string, TimeEntry>();
    
    // Group by employee and find latest clock_in without clock_out
    const employeeEntries = timeEntries.reduce((acc, entry) => {
      if (!acc[entry.employee_id]) acc[entry.employee_id] = [];
      acc[entry.employee_id].push(entry);
      return acc;
    }, {} as Record<string, TimeEntry[]>);

    Object.entries(employeeEntries).forEach(([employeeId, entries]) => {
      const sortedEntries = entries.sort((a, b) => b.timestamp - a.timestamp);
      
      // Find if employee is currently clocked in
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
    
    // Count employees on break (simplified logic)
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

    // Queue for sync
    const syncOperation: Omit<SyncOperation, 'id' | 'timestamp' | 'clientId' | 'retry'> = {
      type: 'CREATE',
      entity: 'time_entries',
      data: timeEntry,
      priority: 2 // High priority for time tracking
    };

    queueOperation(syncOperation);

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
          notify.success(`${getActionLabel(clockAction)} registered successfully`);
          handleClockDialogClose();
          return;
        } catch (error) {
          console.warn('Online clock action failed, switching to offline mode:', error);
        }
      }

      // Offline processing
      await processOfflineTimeEntry(entryData);
      notify.success(`${getActionLabel(clockAction)} saved offline - will sync when online`);
      handleClockDialogClose();

    } catch (error) {
      console.error('Error processing clock action:', error);
      notify.error(`Failed to register ${getActionLabel(clockAction).toLowerCase()}`);
    }
  };

  const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | undefined> => {
    try {
      if (!navigator.geolocation) return undefined;
      
      return new Promise((resolve, reject) => {
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
      // Check latest entry for this employee
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
      console.error('Error forcing time tracking sync:', error);
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
    <VStack gap="6" align="stretch">
      {/* Enhanced Header with Connection Status */}
      <HStack justify="space-between" align="center">
        <HStack>
          <Text fontSize="lg" fontWeight="semibold">Time Tracking</Text>
          <Badge 
            colorPalette={getConnectionStatusColor()} 
            variant="subtle"
            p={2}
          >
            <HStack spacing={1}>
              {isOnline ? 
                <WifiIcon className="w-3 h-3" /> : 
                <NoSymbolIcon className="w-3 h-3" />
              }
              <Text fontSize="xs">
                {!isOnline ? 'Offline' : 
                 isConnecting ? 'Connecting...' : 
                 `Online (${connectionQuality})`}
              </Text>
            </HStack>
          </Badge>
        </HStack>

        <HStack gap="2">
          {/* Offline Operations Indicator */}
          {offlineOperations.length > 0 && (
            <Tooltip label={`${offlineOperations.length} operations pending sync`}>
              <Button
                variant="outline"
                colorPalette="orange"
                size="sm"
                onClick={() => setShowOfflineModal(true)}
              >
                <CircleStackIcon className="w-4 h-4" />
                {offlineOperations.length} Offline
              </Button>
            </Tooltip>
          )}

          {/* Sync Progress */}
          {isSyncing && (
            <Box minW="120px">
              <Text fontSize="xs" mb={1}>Syncing...</Text>
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
              <CloudIcon className="w-4 h-4" />
              Sync ({queueSize})
            </Button>
          )}
        </HStack>
      </HStack>

      {/* Offline Mode Alert */}
      {!isOnline && (
        <Alert.Root status="warning">
          <Alert.Indicator>
            <NoSymbolIcon className="w-5 h-5" />
          </Alert.Indicator>
          <Alert.Title>Time Tracking Offline Mode</Alert.Title>
          <Alert.Description>
            All time entries will be saved locally and synced automatically when connection is restored.
          </Alert.Description>
        </Alert.Root>
      )}

      {/* Time Tracking Stats */}
      <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} gap="4">
        <Card.Root size="sm">
          <Card.Body textAlign="center">
            <VStack gap="1">
              <TimeIcon className="w-5 h-5 text-blue-500 mx-auto" />
              <Text fontSize="lg" fontWeight="bold">{timeStats.today_total_hours.toFixed(1)}</Text>
              <Text fontSize="xs" color="gray.600">Hours Today</Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root size="sm">
          <Card.Body textAlign="center">
            <VStack gap="1">
              <CalendarIcon className="w-5 h-5 text-green-500 mx-auto" />
              <Text fontSize="lg" fontWeight="bold">{timeStats.week_total_hours.toFixed(1)}</Text>
              <Text fontSize="xs" color="gray.600">Hours This Week</Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root size="sm">
          <Card.Body textAlign="center">
            <VStack gap="1">
              <PlayIcon className="w-5 h-5 text-purple-500 mx-auto" />
              <Text fontSize="lg" fontWeight="bold">{timeStats.active_employees}</Text>
              <Text fontSize="xs" color="gray.600">Active Now</Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root size="sm">
          <Card.Body textAlign="center">
            <VStack gap="1">
              <PauseIcon className="w-5 h-5 text-orange-500 mx-auto" />
              <Text fontSize="lg" fontWeight="bold">{timeStats.on_break}</Text>
              <Text fontSize="xs" color="gray.600">On Break</Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root size="sm">
          <Card.Body textAlign="center">
            <VStack gap="1">
              <ArrowTrendingUpIcon className="w-5 h-5 text-red-500 mx-auto" />
              <Text fontSize="lg" fontWeight="bold">{timeStats.overtime_this_week.toFixed(1)}</Text>
              <Text fontSize="xs" color="gray.600">Overtime Week</Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root size="sm">
          <Card.Body textAlign="center">
            <VStack gap="1">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mx-auto" />
              <Text fontSize="lg" fontWeight="bold">{timeStats.pending_approvals}</Text>
              <Text fontSize="xs" color="gray.600">Pending Approval</Text>
            </VStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {/* Time Tracking Tabs */}
      <Card.Root>
        <Card.Body p="0">
          <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
            <Tabs.List bg="gray.50" p="1" borderRadius="lg">
              <Tabs.Trigger value="clock" gap="2" flex="1" minH="44px">
                <ClockIcon className="w-5 h-5" />
                <Text display={{ base: "none", sm: "block" }}>Clock</Text>
                {!isOnline && <Badge colorScheme="orange" size="xs">Offline</Badge>}
              </Tabs.Trigger>
              
              <Tabs.Trigger value="timesheets" gap="2" flex="1" minH="44px">
                <DocumentTextIcon className="w-5 h-5" />
                <Text display={{ base: "none", sm: "block" }}>Timesheets</Text>
                {timeStats.pending_approvals > 0 && (
                  <Badge colorScheme="yellow" size="xs">{timeStats.pending_approvals}</Badge>
                )}
              </Tabs.Trigger>
              
              <Tabs.Trigger value="reports" gap="2" flex="1" minH="44px">
                <ChartBarIcon className="w-5 h-5" />
                <Text display={{ base: "none", sm: "block" }}>Reports</Text>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="settings" gap="2" flex="1" minH="44px">
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                <Text display={{ base: "none", sm: "block" }}>Settings</Text>
              </Tabs.Trigger>
            </Tabs.List>

            <Box p="6">
              {/* Clock Tab */}
              <Tabs.Content value="clock">
                <VStack gap="6" align="stretch">
                  <Text fontSize="lg" fontWeight="semibold">Employee Clock</Text>

                  {/* Current Shifts */}
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
                    {mockEmployees.map(employee => {
                      const status = getEmployeeStatus(employee.id);
                      const shiftHours = getShiftHours(employee.id);
                      
                      return (
                        <Card.Root key={employee.id}>
                          <Card.Body>
                            <VStack align="stretch" gap="3">
                              <HStack gap="3">
                                <Avatar size="sm" name={`${employee.first_name} ${employee.last_name}`} />
                                <VStack align="start" gap="0" flex="1">
                                  <Text fontWeight="medium" fontSize="sm">
                                    {employee.first_name} {employee.last_name}
                                  </Text>
                                  <Text fontSize="xs" color="gray.600">
                                    {employee.position}
                                  </Text>
                                </VStack>
                                <Badge 
                                  colorPalette={status.color} 
                                  variant="subtle" 
                                  size="sm"
                                >
                                  {status.label}
                                </Badge>
                              </HStack>

                              {status.status !== 'off_duty' && (
                                <VStack align="stretch" gap="1">
                                  <HStack justify="space-between">
                                    <Text fontSize="xs" color="gray.600">Shift Time:</Text>
                                    <Text fontSize="xs" fontWeight="medium">
                                      {shiftHours.toFixed(1)} hrs
                                    </Text>
                                  </HStack>
                                </VStack>
                              )}

                              <Button
                                size="sm"
                                colorPalette={status.status === 'off_duty' ? 'green' : 'red'}
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setClockAction(status.status === 'off_duty' ? 'in' : 'out');
                                  setShowClockDialog(true);
                                }}
                                w="full"
                              >
                                {status.status === 'off_duty' ? (
                                  <>
                                    <PlayIcon className="w-4 h-4" />
                                    Clock In
                                  </>
                                ) : (
                                  <>
                                    <StopIcon className="w-4 h-4" />
                                    Clock Out
                                  </>
                                )}
                              </Button>

                              {status.status === 'working' && (
                                <HStack gap="1">
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    colorPalette="orange"
                                    onClick={() => {
                                      setSelectedEmployee(employee);
                                      setClockAction('break_start');
                                      setShowClockDialog(true);
                                    }}
                                    flex="1"
                                  >
                                    <PauseIcon className="w-3 h-3" />
                                    Break
                                  </Button>
                                </HStack>
                              )}

                              {status.status === 'on_break' && (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  colorPalette="green"
                                  onClick={() => {
                                    setSelectedEmployee(employee);
                                    setClockAction('break_end');
                                    setShowClockDialog(true);
                                  }}
                                  w="full"
                                >
                                  <PlayIcon className="w-3 h-3" />
                                  End Break
                                </Button>
                              )}
                            </VStack>
                          </Card.Body>
                        </Card.Root>
                      );
                    })}
                  </SimpleGrid>
                </VStack>
              </Tabs.Content>

              {/* Timesheets Tab */}
              <Tabs.Content value="timesheets">
                <VStack gap="4" align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="semibold">Timesheets</Text>
                    <Button size="sm" colorPalette="blue">
                      Generate Report
                    </Button>
                  </HStack>

                  <Card.Root>
                    <Card.Body>
                      <Text color="gray.600" textAlign="center" py="8">
                        Timesheet management coming soon...
                      </Text>
                    </Card.Body>
                  </Card.Root>
                </VStack>
              </Tabs.Content>

              {/* Reports Tab */}
              <Tabs.Content value="reports">
                <VStack gap="4" align="stretch">
                  <Text fontSize="lg" fontWeight="semibold">Time Tracking Reports</Text>

                  <Card.Root>
                    <Card.Body>
                      <Text color="gray.600" textAlign="center" py="8">
                        Advanced reporting features coming soon...
                      </Text>
                    </Card.Body>
                  </Card.Root>
                </VStack>
              </Tabs.Content>

              {/* Settings Tab */}
              <Tabs.Content value="settings">
                <VStack gap="4" align="stretch">
                  <Text fontSize="lg" fontWeight="semibold">Time Tracking Settings</Text>

                  <Card.Root>
                    <Card.Body>
                      <Text color="gray.600" textAlign="center" py="8">
                        Configuration settings coming soon...
                      </Text>
                    </Card.Body>
                  </Card.Root>
                </VStack>
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Card.Body>
      </Card.Root>

      {/* Clock Action Dialog */}
      <Dialog.Root open={showClockDialog} onOpenChange={({ open }) => !open && handleClockDialogClose()}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {selectedEmployee && `${getActionLabel(clockAction)} - ${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                {!isOnline && <Badge colorScheme="orange" size="sm" ml={2}>Offline Mode</Badge>}
              </Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>

            <Dialog.Body>
              <VStack gap="4" align="stretch">
                {!isOnline && (
                  <Alert.Root status="info" size="sm">
                    <Alert.Indicator />
                    <Alert.Title>Offline Clock Action</Alert.Title>
                    <Alert.Description>
                      Time entry will be saved locally and synced when connection is restored.
                    </Alert.Description>
                  </Alert.Root>
                )}

                <VStack align="stretch" gap="3">
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Action Type</Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      {getActionLabel(clockAction)}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Time</Text>
                    <Text fontSize="lg">
                      {new Date().toLocaleTimeString()}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Notes (optional)</Text>
                    <Textarea
                      value={clockNotes}
                      onChange={(e) => setClockNotes(e.target.value)}
                      placeholder="Add any notes about this time entry..."
                      rows={3}
                    />
                  </Box>
                </VStack>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack gap="3">
                <Button variant="outline" onClick={handleClockDialogClose}>
                  Cancel
                </Button>
                <Button 
                  colorPalette="blue" 
                  onClick={handleClockAction}
                >
                  {isOnline ? 'Confirm' : 'Save Offline'}
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Offline Operations Modal */}
      <OfflineTimeOperationsModal
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        operations={offlineOperations}
        onForceSync={handleForceSyncTimeTracking}
        isSyncing={isSyncing}
      />
    </VStack>
  );
}

// Offline Operations Modal Component
const OfflineTimeOperationsModal = ({
  isOpen,
  onClose,
  operations,
  onForceSync,
  isSyncing
}: {
  isOpen: boolean;
  onClose: () => void;
  operations: OfflineTimeOperation[];
  onForceSync: () => void;
  isSyncing: boolean;
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="2xl">
          <Dialog.Header>
            <Dialog.Title>Time Tracking Operations Pending Sync</Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>

          <Dialog.Body>
            <VStack gap="4" align="stretch">
              <Text color="gray.600">
                {operations.length} time tracking operation(s) pending synchronization
              </Text>

              <Box maxH="400px" overflowY="auto">
                <VStack gap="3" align="stretch">
                  {operations.map((operation) => (
                    <Card.Root key={operation.id} p="4">
                      <HStack justify="space-between" mb="2">
                        <VStack align="start" spacing="1">
                          <Text fontWeight="medium" textTransform="capitalize">
                            {operation.type.replace('_', ' ')}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Employee: {operation.employee_id}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {new Date(operation.timestamp).toLocaleString()}
                          </Text>
                        </VStack>
                        <Badge
                          colorScheme={
                            operation.status === 'synced' ? 'green' :
                            operation.status === 'syncing' ? 'blue' :
                            operation.status === 'failed' ? 'red' : 'yellow'
                          }
                        >
                          {operation.status}
                        </Badge>
                      </HStack>
                      
                      {operation.retryCount > 0 && (
                        <Text fontSize="sm" color="orange.600">
                          {operation.retryCount} retry attempts
                        </Text>
                      )}
                    </Card.Root>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <HStack gap="3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                colorScheme="blue"
                onClick={onForceSync}
                loading={isSyncing}
                loadingText="Syncing..."
                disabled={operations.length === 0}
                leftIcon={<ArrowPathIcon className="w-4 h-4" />}
              >
                Force Sync All
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default TimeTrackingSection;