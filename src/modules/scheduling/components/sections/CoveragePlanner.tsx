// r - Analyze and manage shift coverage gaps and staffing needs
import { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Card, 
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

interface rProps {
  understaffedShifts: number;
  coveragePercentage: number;
}

interface CoverageGap {
  id: string;
  date: string;
  shift_time: string;
  position: string;
  required_staff: number;
  current_staff: number;
  gap: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
}

interface StaffingRequirement {
  position: string;
  time_slot: string;
  min_staff: number;
  optimal_staff: number;
  current_average: number;
  coverage_rate: number;
}

interface CoverageAnalytics {
  weekly_coverage_avg: number;
  peak_hours_coverage: number;
  weekend_coverage: number;
  critical_gaps: number;
  auto_coverage_success_rate: number;
  most_difficult_position: string;
}

type CoverageFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';
type TimeSlot = 'all' | 'morning' | 'afternoon' | 'evening' | 'night';

export function r({ understaffedShifts, coveragePercentage }: rProps) {
  const [loading, setLoading] = useState(true);
  const [coverageGaps, setCoverageGaps] = useState<CoverageGap[]>([]);
  const [staffingRequirements, setStaffingRequirements] = useState<StaffingRequirement[]>([]);
  const [analytics, setAnalytics] = useState<CoverageAnalytics>({
    weekly_coverage_avg: 0,
    peak_hours_coverage: 0,
    weekend_coverage: 0,
    critical_gaps: 0,
    auto_coverage_success_rate: 0,
    most_difficult_position: ''
  });

  const [filters, setFilters] = useState({
    priority: 'all' as CoverageFilter,
    timeSlot: 'all' as TimeSlot,
    position: 'all'
  });

  // Mock data - will be replaced with API calls
  useEffect(() => {
    const mockCoverageGaps: CoverageGap[] = [
      {
        id: '1',
        date: '2024-01-18',
        shift_time: '18:00-22:00',
        position: 'Server',
        required_staff: 4,
        current_staff: 2,
        gap: 2,
        priority: 'critical',
        impact: 'Dinner rush will be severely understaffed'
      },
      {
        id: '2',
        date: '2024-01-19',
        shift_time: '11:00-15:00',
        position: 'Cook',
        required_staff: 3,
        current_staff: 2,
        gap: 1,
        priority: 'high',
        impact: 'Lunch service may have delays'
      },
      {
        id: '3',
        date: '2024-01-20',
        shift_time: '14:00-18:00',
        position: 'Bartender',
        required_staff: 2,
        current_staff: 1,
        gap: 1,
        priority: 'medium',
        impact: 'Happy hour service affected'
      },
      {
        id: '4',
        date: '2024-01-21',
        shift_time: '09:00-13:00',
        position: 'Server',
        required_staff: 3,
        current_staff: 2,
        gap: 1,
        priority: 'low',
        impact: 'Brunch service slightly reduced'
      }
    ];

    const mockStaffingRequirements: StaffingRequirement[] = [
      {
        position: 'Server',
        time_slot: 'Breakfast (7-11am)',
        min_staff: 2,
        optimal_staff: 3,
        current_average: 2.5,
        coverage_rate: 83.3
      },
      {
        position: 'Server',
        time_slot: 'Lunch (11am-3pm)',
        min_staff: 3,
        optimal_staff: 5,
        current_average: 3.8,
        coverage_rate: 76.0
      },
      {
        position: 'Server',
        time_slot: 'Dinner (5-10pm)',
        min_staff: 4,
        optimal_staff: 6,
        current_average: 4.2,
        coverage_rate: 70.0
      },
      {
        position: 'Cook',
        time_slot: 'All Day',
        min_staff: 2,
        optimal_staff: 3,
        current_average: 2.3,
        coverage_rate: 76.7
      },
      {
        position: 'Bartender',
        time_slot: 'Evening (4-11pm)',
        min_staff: 1,
        optimal_staff: 2,
        current_average: 1.4,
        coverage_rate: 70.0
      }
    ];

    const mockAnalytics: CoverageAnalytics = {
      weekly_coverage_avg: coveragePercentage,
      peak_hours_coverage: 73.5,
      weekend_coverage: 68.2,
      critical_gaps: understaffedShifts,
      auto_coverage_success_rate: 45.0,
      most_difficult_position: 'Server'
    };

    setCoverageGaps(mockCoverageGaps);
    setStaffingRequirements(mockStaffingRequirements);
    setAnalytics(mockAnalytics);
    setLoading(false);
  }, [understaffedShifts, coveragePercentage]);

  const getPriorityColor = (priority: CoverageGap['priority']) => {
    const colors = {
      critical: 'red',
      high: 'orange',
      medium: 'yellow',
      low: 'blue'
    };
    return colors[priority] || 'gray';
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
    
    let matchesTimeSlot = true;
    if (filters.timeSlot !== 'all') {
      const hour = parseInt(gap.shift_time.split(':')[0]);
      switch (filters.timeSlot) {
        case 'morning':
          matchesTimeSlot = hour >= 6 && hour < 12;
          break;
        case 'afternoon':
          matchesTimeSlot = hour >= 12 && hour < 17;
          break;
        case 'evening':
          matchesTimeSlot = hour >= 17 && hour < 22;
          break;
        case 'night':
          matchesTimeSlot = hour >= 22 || hour < 6;
          break;
      }
    }
    
    const matchesPosition = filters.position === 'all' || gap.position === filters.position;
    
    return matchesPriority && matchesTimeSlot && matchesPosition;
  });

  return (
    <VStack gap="6" align="stretch">
      {/* Coverage Analytics */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} gap="4">
        <Card.Root>
          <Card.Body textAlign="center" py="3">
            <VStack gap="1">
              <Text fontSize="xl" fontWeight="bold" color="blue.500">
                {analytics.weekly_coverage_avg}%
              </Text>
              <Text fontSize="xs" color="gray.600">Weekly Avg</Text>
            </VStack>
          </Card.Body>
        </Card.Root>
        
        <Card.Root>
          <Card.Body textAlign="center" py="3">
            <VStack gap="1">
              <Text fontSize="xl" fontWeight="bold" color="orange.500">
                {analytics.peak_hours_coverage}%
              </Text>
              <Text fontSize="xs" color="gray.600">Peak Hours</Text>
            </VStack>
          </Card.Body>
        </Card.Root>
        
        <Card.Root>
          <Card.Body textAlign="center" py="3">
            <VStack gap="1">
              <Text fontSize="xl" fontWeight="bold" color="purple.500">
                {analytics.weekend_coverage}%
              </Text>
              <Text fontSize="xs" color="gray.600">Weekends</Text>
            </VStack>
          </Card.Body>
        </Card.Root>
        
        <Card.Root>
          <Card.Body textAlign="center" py="3">
            <VStack gap="1">
              <Text fontSize="xl" fontWeight="bold" color="red.500">
                {analytics.critical_gaps}
              </Text>
              <Text fontSize="xs" color="gray.600">Critical Gaps</Text>
            </VStack>
          </Card.Body>
        </Card.Root>
        
        <Card.Root>
          <Card.Body textAlign="center" py="3">
            <VStack gap="1">
              <Text fontSize="xl" fontWeight="bold" color="green.500">
                {analytics.auto_coverage_success_rate}%
              </Text>
              <Text fontSize="xs" color="gray.600">Auto Success</Text>
            </VStack>
          </Card.Body>
        </Card.Root>
        
        <Card.Root>
          <Card.Body textAlign="center" py="3">
            <VStack gap="1">
              <Text fontSize="lg" fontWeight="bold" color="gray.700">
                {analytics.most_difficult_position}
              </Text>
              <Text fontSize="xs" color="gray.600">Hardest to Fill</Text>
            </VStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {/* Critical Alerts */}
      {analytics.critical_gaps > 0 && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Critical Coverage Gaps Detected!</Alert.Title>
            <Alert.Description>
              {analytics.critical_gaps} shifts are critically understaffed and need immediate attention. 
              Customer service will be significantly impacted.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* Filters */}
      <Card.Root>
        <Card.Body>
          <Stack direction={{ base: 'column', md: 'row' }} gap="4" align="end">
            <HStack gap="4" flex="1">
              <Box>
                <Text fontSize="sm" mb="1" fontWeight="medium">Priority</Text>
                <Select.Root 
                  value={filters.priority}
                  onValueChange={(e) => setFilters(prev => ({...prev, priority: e.value as CoverageFilter}))}
                >
                  <Select.Trigger width="150px">
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="all">All Priorities</Select.Item>
                    <Select.Item value="critical">Critical</Select.Item>
                    <Select.Item value="high">High</Select.Item>
                    <Select.Item value="medium">Medium</Select.Item>
                    <Select.Item value="low">Low</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box>
                <Text fontSize="sm" mb="1" fontWeight="medium">Time Slot</Text>
                <Select.Root 
                  value={filters.timeSlot}
                  onValueChange={(e) => setFilters(prev => ({...prev, timeSlot: e.value as TimeSlot}))}
                >
                  <Select.Trigger width="150px">
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="all">All Times</Select.Item>
                    <Select.Item value="morning">Morning</Select.Item>
                    <Select.Item value="afternoon">Afternoon</Select.Item>
                    <Select.Item value="evening">Evening</Select.Item>
                    <Select.Item value="night">Night</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box>
                <Text fontSize="sm" mb="1" fontWeight="medium">Position</Text>
                <Select.Root 
                  value={filters.position}
                  onValueChange={(e) => setFilters(prev => ({...prev, position: e.value}))}
                >
                  <Select.Trigger width="150px">
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="all">All Positions</Select.Item>
                    <Select.Item value="Server">Server</Select.Item>
                    <Select.Item value="Cook">Cook</Select.Item>
                    <Select.Item value="Bartender">Bartender</Select.Item>
                    <Select.Item value="Manager">Manager</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
            </HStack>

            <Button leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}>
              Apply Filters
            </Button>
          </Stack>
        </Card.Body>
      </Card.Root>

      {/* Coverage Gaps Table */}
      <Card.Root>
        <Card.Header>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              Coverage Gaps ({filteredGaps.length})
            </Text>
            <Badge colorPalette="red">
              {filteredGaps.filter(gap => gap.priority === 'critical').length} critical
            </Badge>
          </HStack>
        </Card.Header>
        <Card.Body p="0">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Priority</Table.ColumnHeader>
                <Table.ColumnHeader>Date & Time</Table.ColumnHeader>
                <Table.ColumnHeader>Position</Table.ColumnHeader>
                <Table.ColumnHeader>Staffing Gap</Table.ColumnHeader>
                <Table.ColumnHeader>Impact</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredGaps.map(gap => {
                const IconComponent = getPriorityIcon(gap.priority);
                return (
                  <Table.Row key={gap.id}>
                    <Table.Cell>
                      <HStack gap="2">
                        <Box p="1" bg={`${getPriorityColor(gap.priority)}.100`} borderRadius="md">
                          <IconComponent className="w-3 h-3" />
                        </Box>
                        <Badge colorPalette={getPriorityColor(gap.priority)} variant="subtle" size="sm">
                          {gap.priority}
                        </Badge>
                      </HStack>
                    </Table.Cell>
                    
                    <Table.Cell>
                      <VStack align="start" gap="0">
                        <Text fontSize="sm" fontWeight="medium">
                          {new Date(gap.date).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {gap.shift_time}
                        </Text>
                      </VStack>
                    </Table.Cell>
                    
                    <Table.Cell>
                      <Text fontSize="sm" fontWeight="medium">{gap.position}</Text>
                    </Table.Cell>
                    
                    <Table.Cell>
                      <VStack align="start" gap="1">
                        <HStack gap="2">
                          <Text fontSize="sm" color="red.600" fontWeight="bold">
                            -{gap.gap}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            ({gap.current_staff}/{gap.required_staff})
                          </Text>
                        </HStack>
                        <Progress 
                          value={(gap.current_staff / gap.required_staff) * 100} 
                          colorPalette={gap.current_staff === 0 ? 'red' : 'orange'}
                          size="sm"
                          width="80px"
                        />
                      </VStack>
                    </Table.Cell>
                    
                    <Table.Cell maxW="200px">
                      <Text fontSize="xs" color="gray.600" isTruncated>
                        {gap.impact}
                      </Text>
                    </Table.Cell>
                    
                    <Table.Cell>
                      <HStack gap="1">
                        <Button 
                          size="xs" 
                          variant="outline" 
                          colorPalette="blue"
                          onClick={() => handleFindCoverage(gap.id)}
                        >
                          Find Coverage
                        </Button>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        </Card.Body>
      </Card.Root>

      {/* Staffing Requirements Analysis */}
      <Card.Root>
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold">Staffing Requirements Analysis</Text>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
            {staffingRequirements.map((req, index) => (
              <Card.Root key={index} size="sm">
                <Card.Body>
                  <VStack gap="3" align="stretch">
                    <HStack justify="space-between">
                      <VStack align="start" gap="0">
                        <Text fontWeight="semibold">{req.position}</Text>
                        <Text fontSize="sm" color="gray.600">{req.time_slot}</Text>
                      </VStack>
                      <Badge colorPalette={getCoverageRateColor(req.coverage_rate)} variant="subtle">
                        {req.coverage_rate}%
                      </Badge>
                    </HStack>
                    
                    <VStack gap="2" align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm">Current Average</Text>
                        <Text fontSize="sm" fontWeight="semibold">{req.current_average}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Minimum Required</Text>
                        <Text fontSize="sm" color="orange.600">{req.min_staff}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Optimal Staffing</Text>
                        <Text fontSize="sm" color="green.600">{req.optimal_staff}</Text>
                      </HStack>
                    </VStack>
                    
                    <Box>
                      <HStack justify="space-between" mb="1">
                        <Text fontSize="xs" color="gray.600">Coverage Rate</Text>
                        <Text fontSize="xs" color="gray.600">{req.coverage_rate}%</Text>
                      </HStack>
                      <Progress 
                        value={req.coverage_rate} 
                        colorPalette={getCoverageRateColor(req.coverage_rate)}
                        size="sm"
                      />
                    </Box>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}