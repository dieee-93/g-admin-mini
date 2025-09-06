// CoveragePlanner - Analyze and manage shift coverage gaps and staffing needs
// MIGRATED FROM MOCK DATA TO REAL SUPABASE INTEGRATION
import { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  CardWrapper , 
  Button, 
  Badge,
  SimpleGrid,
  Progress,
  Table,
  Select,
  Alert,
  Stack
} from '@chakra-ui/react';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  UsersIcon,
  ClockIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  BellAlertIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

// Import real API instead of using mock data
import coverageApi, {
  type CoverageGap,
  type StaffingRequirement,
  type CoverageAnalytics,
  type CoverageFilter,
  type TimeSlot
} from '@/services/scheduling/coverageApi';
import { notify } from '@/lib/notifications';

interface CoveragePlannerProps {
  understaffedShifts: number;
  coveragePercentage: number;
}

export function CoveragePlanner({ understaffedShifts, coveragePercentage }: CoveragePlannerProps) {
  const [loading, setLoading] = useState(true);
  const [coverageGaps, setCoverageGaps] = useState<CoverageGap[]>([]);
  const [staffingRequirements, setStaffingRequirements] = useState<StaffingRequirement[]>([]);
  const [analytics, setAnalytics] = useState<CoverageAnalytics>({
    weekly_coverage_avg: coveragePercentage,
    understaffed_shifts: understaffedShifts,
    critical_gaps: 0,
    coverage_trend: 'stable',
    peak_understaffing_time: '',
    calculated_at: ''
  });

  const [filters, setFilters] = useState({
    priority: 'all' as CoverageFilter,
    timeSlot: 'all' as TimeSlot,
    position: 'all'
  });

  // Real data from Supabase - Replaced mock implementation
  useEffect(() => {
    const loadCoverageData = async () => {
      try {
        setLoading(true);
        
        // Get current week date range
        const today = new Date();
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6);
        
        const startDate = startOfWeek.toISOString().split('T')[0];
        const endDate = endOfWeek.toISOString().split('T')[0];
        
        // Load real data from API
        const [gaps, requirements, analyticsData] = await Promise.all([
          coverageApi.getCoverageGaps(startDate, endDate, {
            priority: filters.priority,
            position: filters.position === 'all' ? undefined : filters.position,
            timeSlot: filters.timeSlot
          }),
          coverageApi.getStaffingRequirements(),
          coverageApi.getCoverageAnalytics(startDate, endDate)
        ]);
        
        setCoverageGaps(gaps);
        setStaffingRequirements(requirements);
        setAnalytics(analyticsData);
        
      } catch (error) {
        console.error('Error loading coverage data:', error);
        notify.error({
          title: 'Error Loading Coverage Data',
          description: 'Failed to load shift coverage information. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    loadCoverageData();
  }, [understaffedShifts, coveragePercentage, filters]);

  const getPriorityColor = (priority: CoverageGap['priority']) => {
    const colors = {
      critical: 'red',
      high: 'orange',
      medium: 'yellow',
      low: 'green'
    };
    return colors[priority];
  };

  const getPriorityIcon = (priority: CoverageGap['priority']) => {
    const icons = {
      critical: ShieldExclamationIcon,
      high: ExclamationTriangleIcon,
      medium: BellAlertIcon,
      low: ClockIcon
    };
    return icons[priority] || ClockIcon;
  };

  const handleFindCoverage = (gapId: string) => {
    // TODO: Implement automatic coverage finding
    console.log('Finding coverage for gap:', gapId);
  };

  const getCoverageRateColor = (rate: number) => {
    if (rate >= 90) return 'green';
    if (rate >= 75) return 'yellow';
    if (rate >= 60) return 'orange';
    return 'red';
  };

  const filteredGaps = coverageGaps.filter(gap => {
    const matchesPriority = filters.priority === 'all' || gap.priority === filters.priority;
    const matchesPosition = filters.position === 'all' || gap.position === filters.position;
    
    let matchesTimeSlot = true;
    if (filters.timeSlot !== 'all') {
      const timeSlotMatches = {
        'morning': gap.shift_time.includes('7-') || gap.shift_time.includes('8-') || gap.shift_time.includes('9-'),
        'afternoon': gap.shift_time.includes('11-') || gap.shift_time.includes('12-') || gap.shift_time.includes('13-') || gap.shift_time.includes('14-'),
        'evening': gap.shift_time.includes('17-') || gap.shift_time.includes('18-') || gap.shift_time.includes('19-'),
        'night': gap.shift_time.includes('20-') || gap.shift_time.includes('21-') || gap.shift_time.includes('22-')
      };
      matchesTimeSlot = timeSlotMatches[filters.timeSlot] || false;
    }

    return matchesPriority && matchesPosition && matchesTimeSlot;
  });

  if (loading) {
    return (
      <Box>
        <Text>Loading coverage analysis...</Text>
        <Progress size="xs" isIndeterminate colorScheme="blue" mt={2} />
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      {/* Coverage Overview Cards */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
        <CardWrapper >
          <CardWrapper .Body>
            <VStack align="stretch">
              <HStack justify="space-between">
                <UsersIcon width={20} height={20} />
                <Text fontSize="2xl" fontWeight="bold" color={analytics.critical_gaps > 0 ? 'red.500' : 'green.500'}>
                  {analytics.critical_gaps}
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.600">Critical Gaps</Text>
            </VStack>
          </CardWrapper .Body>
        </CardWrapper >
        
        <CardWrapper >
          <CardWrapper .Body>
            <VStack align="stretch">
              <HStack justify="space-between">
                <CalendarIcon width={20} height={20} />
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {analytics.understaffed_shifts}
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.600">Understaffed Shifts</Text>
            </VStack>
          </CardWrapper .Body>
        </CardWrapper >
        
        <CardWrapper >
          <CardWrapper .Body>
            <VStack align="stretch">
              <HStack justify="space-between">
                <CheckCircleIcon width={20} height={20} />
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {analytics.weekly_coverage_avg}%
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.600">Coverage Rate</Text>
            </VStack>
          </CardWrapper .Body>
        </CardWrapper >
        
        <CardWrapper >
          <CardWrapper .Body>
            <VStack align="stretch">
              <HStack justify="space-between">
                <ClockIcon width={20} height={20} />
                <Badge colorScheme={analytics.coverage_trend === 'improving' ? 'green' : analytics.coverage_trend === 'declining' ? 'red' : 'blue'}>
                  {analytics.coverage_trend}
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.600">Trend</Text>
            </VStack>
          </CardWrapper .Body>
        </CardWrapper >
      </SimpleGrid>

      {/* Filters */}
      <CardWrapper >
        <CardWrapper .Body>
          <HStack spacing={4} wrap="wrap">
            <Box>
              <Text fontSize="sm" mb={1}>Priority</Text>
              <Select 
                value={filters.priority} 
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as CoverageFilter }))}
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </Box>
            
            <Box>
              <Text fontSize="sm" mb={1}>Time Slot</Text>
              <Select 
                value={filters.timeSlot} 
                onChange={(e) => setFilters(prev => ({ ...prev, timeSlot: e.target.value as TimeSlot }))}
              >
                <option value="all">All Times</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </Select>
            </Box>
            
            <Box>
              <Text fontSize="sm" mb={1}>Position</Text>
              <Select 
                value={filters.position} 
                onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
              >
                <option value="all">All Positions</option>
                <option value="Server">Server</option>
                <option value="Cook">Cook</option>
                <option value="Bartender">Bartender</option>
                <option value="Host">Host</option>
              </Select>
            </Box>
          </HStack>
        </CardWrapper .Body>
      </CardWrapper >

      {/* Coverage Gaps Table */}
      <CardWrapper >
        <CardWrapper .Header>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">Coverage Gaps</Text>
            <Badge>{filteredGaps.length} gaps found</Badge>
          </HStack>
        </CardWrapper .Header>
        <CardWrapper .Body>
          {filteredGaps.length === 0 ? (
            <Alert status="success">
              <Alert.Indicator />
              <Alert.Title>Great news!</Alert.Title>
              <Alert.Description>
                No coverage gaps found for the selected filters.
              </Alert.Description>
            </Alert>
          ) : (
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Priority</Table.ColumnHeader>
                  <Table.ColumnHeader>Date</Table.ColumnHeader>
                  <Table.ColumnHeader>Time</Table.ColumnHeader>
                  <Table.ColumnHeader>Position</Table.ColumnHeader>
                  <Table.ColumnHeader>Gap</Table.ColumnHeader>
                  <Table.ColumnHeader>Impact</Table.ColumnHeader>
                  <Table.ColumnHeader>Actions</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredGaps.map(gap => {
                  const PriorityIcon = getPriorityIcon(gap.priority);
                  return (
                    <Table.Row key={gap.id}>
                      <Table.Cell>
                        <HStack>
                          <PriorityIcon width={16} height={16} />
                          <Badge colorScheme={getPriorityColor(gap.priority)}>
                            {gap.priority}
                          </Badge>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>{gap.date}</Table.Cell>
                      <Table.Cell>{gap.shift_time}</Table.Cell>
                      <Table.Cell>{gap.position}</Table.Cell>
                      <Table.Cell>{gap.current_staff}/{gap.required_staff}</Table.Cell>
                      <Table.Cell>{gap.impact}</Table.Cell>
                      <Table.Cell>
                        <Button 
                          size="sm" 
                          colorScheme="blue" 
                          onClick={() => handleFindCoverage(gap.id)}
                        >
                          Find Coverage
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          )}
        </CardWrapper .Body>
      </CardWrapper >

      {/* Staffing Requirements */}
      <CardWrapper >
        <CardWrapper .Header>
          <Text fontSize="lg" fontWeight="semibold">Staffing Requirements</Text>
        </CardWrapper .Header>
        <CardWrapper .Body>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Position</Table.ColumnHeader>
                <Table.ColumnHeader>Time Slot</Table.ColumnHeader>
                <Table.ColumnHeader>Min Staff</Table.ColumnHeader>
                <Table.ColumnHeader>Optimal</Table.ColumnHeader>
                <Table.ColumnHeader>Current Avg</Table.ColumnHeader>
                <Table.ColumnHeader>Coverage Rate</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {staffingRequirements.map((req, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{req.position}</Table.Cell>
                  <Table.Cell>{req.time_slot}</Table.Cell>
                  <Table.Cell>{req.min_staff}</Table.Cell>
                  <Table.Cell>{req.optimal_staff}</Table.Cell>
                  <Table.Cell>{req.current_average}</Table.Cell>
                  <Table.Cell>
                    <HStack>
                      <Progress 
                        value={req.coverage_rate} 
                        colorScheme={getCoverageRateColor(req.coverage_rate)}
                        size="sm"
                        flex={1}
                      />
                      <Text fontSize="sm" minWidth="50px">
                        {req.coverage_rate}%
                      </Text>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </CardWrapper .Body>
      </CardWrapper >
    </VStack>
  );
}