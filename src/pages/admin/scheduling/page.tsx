// Scheduling Management Module - Main Page with UNIFIED navigation pattern
import { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Tabs, Badge, CardWrapper, SimpleGrid } from '@chakra-ui/react';
import { 
  CalendarIcon, 
  ClockIcon, 
  UsersIcon, 
  CurrencyDollarIcon, 
  PlusIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserMinusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

// Import section components (will be implemented)
import { WeeklyScheduleView } from './components/sections/WeeklyScheduleView';
import { TimeOffManager } from './components/sections/TimeOffManager';
// import { CoveragePlanner } from './components/sections/CoveragePlanner';
import { LaborCostTracker } from './components/sections/LaborCostTracker';

// Types
interface SchedulingStats {
  total_shifts_this_week: number;
  employees_scheduled: number;
  coverage_percentage: number;
  pending_time_off: number;
  labor_cost_this_week: number;
  overtime_hours: number;
  understaffed_shifts: number;
  approved_requests: number;
}

type SchedulingTab = 'schedule' | 'timeoff' | 'coverage' | 'costs';

interface SchedulingViewState {
  activeTab: SchedulingTab;
  selectedWeek: string;
  filters: {
    position?: string;
    employee?: string;
    status?: string;
  };
  viewMode: 'week' | 'day' | 'month';
}

export default function SchedulingPage() {
  const { setQuickActions } = useNavigation();
  const [viewState, setViewState] = useState<SchedulingViewState>({
    activeTab: 'schedule',
    selectedWeek: new Date().toISOString().split('T')[0],
    filters: {},
    viewMode: 'week'
  });

  // Mock scheduling stats - will be replaced with API call
  const [schedulingStats] = useState<SchedulingStats>({
    total_shifts_this_week: 156,
    employees_scheduled: 24,
    coverage_percentage: 87.5,
    pending_time_off: 8,
    labor_cost_this_week: 18750,
    overtime_hours: 12,
    understaffed_shifts: 3,
    approved_requests: 15
  });

  useEffect(() => {
    // Set context-aware quick actions based on active tab
    const getQuickActionsForTab = (tab: SchedulingTab) => {
      const baseActions = [
        {
          id: 'new-shift',
          label: 'New Shift',
          icon: PlusIcon,
          action: () => {
            // TODO: Open shift creation modal
            console.log('Opening new shift form');
          }
        }
      ];

      switch (tab) {
        case 'schedule':
          return [
            ...baseActions,
            {
              id: 'auto-schedule',
              label: 'Auto Schedule',
              icon: Cog6ToothIcon,
              action: () => console.log('Auto-scheduling shifts')
            },
            {
              id: 'copy-week',
              label: 'Copy Week',
              icon: CalendarIcon,
              action: () => console.log('Copying week schedule')
            }
          ];
        case 'timeoff':
          return [
            {
              id: 'new-request',
              label: 'New Request',
              icon: PlusIcon,
              action: () => console.log('Creating time-off request')
            },
            {
              id: 'bulk-approve',
              label: 'Bulk Approve',
              icon: CheckCircleIcon,
              action: () => console.log('Bulk approving requests')
            }
          ];
        case 'coverage':
          return [
            {
              id: 'find-coverage',
              label: 'Find Coverage',
              icon: UsersIcon,
              action: () => console.log('Finding coverage')
            }
          ];
        case 'costs':
          return [
            {
              id: 'export-costs',
              label: 'Export Report',
              icon: ChartBarIcon,
              action: () => console.log('Exporting cost report')
            }
          ];
        default:
          return baseActions;
      }
    };

    setQuickActions(getQuickActionsForTab(viewState.activeTab));
  }, [viewState.activeTab, setQuickActions]);

  const handleTabChange = (tab: SchedulingTab) => {
    setViewState(prev => ({ ...prev, activeTab: tab }));
  };

  return (
  <Box p="6" maxW="container.xl" mx="auto">
      <VStack gap="6" align="stretch">
        {/* UNIFIED PATTERN: Header with icon, badges, KPIs */}
        <Card.Root>
          <Card.Body>
            <HStack gap="4">
              <Box p="2" bg="blue.100" borderRadius="md">
                <CalendarIcon className="w-8 h-8 text-blue-600" />
              </Box>
              <VStack align="start" gap="1">
                <HStack>
                  <Text fontSize="2xl" fontWeight="bold">
                    Staff Scheduling
                  </Text>
                  <Badge colorPalette="blue" variant="subtle">
                    Week View
                  </Badge>
                  {schedulingStats.understaffed_shifts > 0 && (
                    <Badge colorPalette="red" variant="subtle">
                      {schedulingStats.understaffed_shifts} Understaffed
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  Manage employee schedules, time-off requests, and labor costs
                </Text>
              </VStack>
            </HStack>

            {/* KPI Row */}
            <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" mt="4">
              <Card.Root size="sm">
                <Card.Body textAlign="center" py="3">
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                    {schedulingStats.total_shifts_this_week}
                  </Text>
                  <Text fontSize="xs" color="gray.600">Shifts This Week</Text>
                </Card.Body>
              </Card.Root>
              
              <Card.Root size="sm">
                <Card.Body textAlign="center" py="3">
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {schedulingStats.coverage_percentage}%
                  </Text>
                  <Text fontSize="xs" color="gray.600">Coverage Rate</Text>
                </Card.Body>
              </Card.Root>
              
              <Card.Root size="sm">
                <Card.Body textAlign="center" py="3">
                  <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                    {schedulingStats.pending_time_off}
                  </Text>
                  <Text fontSize="xs" color="gray.600">Pending Requests</Text>
                </Card.Body>
              </Card.Root>
              
              <Card.Root size="sm">
                <Card.Body textAlign="center" py="3">
                  <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                    ${schedulingStats.labor_cost_this_week.toLocaleString()}
                  </Text>
                  <Text fontSize="xs" color="gray.600">Labor Cost</Text>
                </Card.Body>
              </Card.Root>
            </SimpleGrid>
          </Card.Body>
        </Card.Root>

        {/* UNIFIED PATTERN: Tab Navigation */}
        <Card.Root>
          <Card.Body p="0">
            <Tabs.Root 
              value={viewState.activeTab}
              onValueChange={(e) => handleTabChange(e.value as SchedulingTab)}
            >
              <Tabs.List px="6" pt="4">
                <Tabs.Trigger value="schedule">
                  <HStack gap="2">
                    <CalendarIcon className="w-4 h-4" />
                    <Text>Weekly Schedule</Text>
                    <Badge size="xs" colorPalette="blue">
                      {schedulingStats.employees_scheduled}
                    </Badge>
                  </HStack>
                </Tabs.Trigger>

                <Tabs.Trigger value="timeoff">
                  <HStack gap="2">
                    <UserMinusIcon className="w-4 h-4" />
                    <Text>Time Off</Text>
                    {schedulingStats.pending_time_off > 0 && (
                      <Badge size="xs" colorPalette="orange">
                        {schedulingStats.pending_time_off}
                      </Badge>
                    )}
                  </HStack>
                </Tabs.Trigger>

                <Tabs.Trigger value="coverage">
                  <HStack gap="2">
                    <UsersIcon className="w-4 h-4" />
                    <Text>Coverage Planning</Text>
                    {schedulingStats.understaffed_shifts > 0 && (
                      <Badge size="xs" colorPalette="red">
                        {schedulingStats.understaffed_shifts}
                      </Badge>
                    )}
                  </HStack>
                </Tabs.Trigger>

                <Tabs.Trigger value="costs">
                  <HStack gap="2">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <Text>Labor Costs</Text>
                    {schedulingStats.overtime_hours > 0 && (
                      <Badge size="xs" colorPalette="yellow">
                        {schedulingStats.overtime_hours}h OT
                      </Badge>
                    )}
                  </HStack>
                </Tabs.Trigger>
              </Tabs.List>

              {/* Tab Content */}
              <Box p="6">
                <Tabs.Content value="schedule">
                  <WeeklyScheduleView 
                    viewState={viewState}
                    onViewStateChange={setViewState}
                  />
                </Tabs.Content>

                <Tabs.Content value="timeoff">
                  <TimeOffManager 
                    pendingCount={schedulingStats.pending_time_off}
                    approvedCount={schedulingStats.approved_requests}
                  />
                </Tabs.Content>

                <Tabs.Content value="coverage">
                  {/* <CoveragePlanner 
                    understaffedShifts={schedulingStats.understaffed_shifts}
                    coveragePercentage={schedulingStats.coverage_percentage}
                  /> */}
                  <div>Coverage Planner - En desarrollo</div>
                </Tabs.Content>

                <Tabs.Content value="costs">
                  <LaborCostTracker 
                    weeklyTotal={schedulingStats.labor_cost_this_week}
                    overtimeHours={schedulingStats.overtime_hours}
                  />
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
}