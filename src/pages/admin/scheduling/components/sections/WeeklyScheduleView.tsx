// WeeklyScheduleView - Main calendar interface with drag & drop scheduling
import { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  CardWrapper , 
  Button, 
  Grid, 
  Badge,
  IconButton,
  Skeleton,
  Select,
  Stack
} from '@chakra-ui/react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PlusIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import type { Shift, ShiftStatus } from '../../types';

interface WeeklyScheduleViewProps {
  viewState: {
    activeTab: string;
    selectedWeek: string;
    filters: {
      position?: string;
      employee?: string;
      status?: string;
    };
    viewMode: 'week' | 'day' | 'month';
  };
  onViewStateChange: (viewState: unknown) => void;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  avatar?: string;
  availability: string[];
}

interface DaySchedule {
  date: string;
  dayName: string;
  shifts: Shift[];
  totalHours: number;
  coverage: number;
}

export function WeeklyScheduleView({ viewState, onViewStateChange }: WeeklyScheduleViewProps) {
  const [loading, setLoading] = useState(true);
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([]);

  // Mock data - will be replaced with API calls
  useEffect(() => {
    const mockEmployees: Employee[] = [
      { id: '1', name: 'Ana García', position: 'Server', availability: ['mon', 'tue', 'wed', 'thu', 'fri'] },
      { id: '2', name: 'Carlos López', position: 'Cook', availability: ['tue', 'wed', 'thu', 'fri', 'sat', 'sun'] },
      { id: '3', name: 'María Rodríguez', position: 'Server', availability: ['wed', 'thu', 'fri', 'sat', 'sun'] },
      { id: '4', name: 'José Martín', position: 'Manager', availability: ['mon', 'tue', 'wed', 'thu', 'fri'] },
      { id: '5', name: 'Elena Fernández', position: 'Bartender', availability: ['thu', 'fri', 'sat', 'sun'] },
      { id: '6', name: 'Pedro Sánchez', position: 'Cook', availability: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'] }
    ];

    const mockShifts: Shift[] = [
      {
        id: '1',
        employee_id: '1',
        employee_name: 'Ana García',
        date: '2024-01-15',
        start_time: '09:00',
        end_time: '17:00',
        position: 'Server',
        status: 'confirmed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        employee_id: '2',
        employee_name: 'Carlos López',
        date: '2024-01-15',
        start_time: '11:00',
        end_time: '20:00',
        position: 'Cook',
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Generate week schedule
    const weekDays = generateWeekDays(selectedWeekStart);
    const mockWeekSchedule = weekDays.map(day => ({
      date: day.toISOString().split('T')[0],
      dayName: day.toLocaleDateString('es-ES', { weekday: 'short' }),
      shifts: mockShifts.filter(shift => shift.date === day.toISOString().split('T')[0]),
      totalHours: 16, // Mock calculation
      coverage: 85 // Mock coverage percentage
    }));

    setEmployees(mockEmployees);
    setWeekSchedule(mockWeekSchedule);
    setLoading(false);
  }, [selectedWeekStart]);

  const generateWeekDays = (startDate: Date): Date[] => {
    const days = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Start from Monday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeekStart(newDate);
  };

  const getShiftColor = (status: ShiftStatus) => {
    const colors = {
      scheduled: 'blue',
      confirmed: 'green',
      in_progress: 'orange',
      completed: 'gray',
      cancelled: 'red',
      no_show: 'red'
    };
    return colors[status] || 'gray';
  };

  const ShiftCard = ({ shift }: { shift: Shift }) => (
    <CardWrapper .Root size="sm" mb="2" bg={`${getShiftColor(shift.status)}.50`}>
      <CardWrapper .Body p="2">
        <VStack gap="1" align="stretch">
          <HStack justify="space-between">
            <Text fontSize="xs" fontWeight="semibold">
              {shift.employee_name}
            </Text>
            <Badge size="xs" colorPalette={getShiftColor(shift.status)}>
              {shift.status}
            </Badge>
          </HStack>
          <HStack gap="1">
            <ClockIcon className="w-3 h-3 text-gray-500" />
            <Text fontSize="xs" color="gray.600">
              {shift.start_time} - {shift.end_time}
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            {shift.position}
          </Text>
        </VStack>
      </CardWrapper .Body>
    </CardWrapper .Root>
  );

  if (loading) {
    return (
      <VStack gap="4" align="stretch">
        <Skeleton height="40px" />
        <Grid templateColumns="repeat(7, 1fr)" gap="4">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} height="200px" />
          ))}
        </Grid>
      </VStack>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Week Navigation & Controls */}
      <CardWrapper .Root>
        <CardWrapper .Body>
          <HStack justify="space-between">
            <HStack gap="4">
              <HStack>
                <IconButton variant="ghost" size="sm" onClick={() => navigateWeek('prev')}>
                  <ChevronLeftIcon className="w-4 h-4" />
                </IconButton>
                <VStack gap="0">
                  <Text fontWeight="semibold">
                    {selectedWeekStart.toLocaleDateString('es-ES', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Week of {selectedWeekStart.toLocaleDateString('es-ES', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </VStack>
                <IconButton variant="ghost" size="sm" onClick={() => navigateWeek('next')}>
                  <ChevronRightIcon className="w-4 h-4" />
                </IconButton>
              </HStack>

              {/* View Mode Toggle */}
              <HStack>
                <Button 
                  size="sm" 
                  variant={viewState.viewMode === 'week' ? 'solid' : 'ghost'}
                  onClick={() => onViewStateChange({...viewState, viewMode: 'week'})}
                >
                  Week
                </Button>
                <Button 
                  size="sm" 
                  variant={viewState.viewMode === 'day' ? 'solid' : 'ghost'}
                  onClick={() => onViewStateChange({...viewState, viewMode: 'day'})}
                >
                  Day
                </Button>
              </HStack>
            </HStack>

            <HStack gap="2">
              {/* Filters */}
              <Select.Root size="sm" width="150px">
                <Select.Trigger>
                  <Select.ValueText placeholder="All Positions" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="server">Server</Select.Item>
                  <Select.Item value="cook">Cook</Select.Item>
                  <Select.Item value="bartender">Bartender</Select.Item>
                  <Select.Item value="manager">Manager</Select.Item>
                </Select.Content>
              </Select.Root>

              <Button size="sm" leftIcon={<PlusIcon className="w-4 h-4" />}>
                New Shift
              </Button>
            </HStack>
          </HStack>
        </CardWrapper .Body>
      </CardWrapper .Root>

      {/* Weekly Calendar Grid */}
      <CardWrapper .Root>
        <CardWrapper .Body p="4">
          <Grid templateColumns="repeat(7, 1fr)" gap="4">
            {weekSchedule.map((day, index) => (
              <VStack key={day.date} gap="2" align="stretch">
                {/* Day Header */}
                <VStack gap="1">
                  <Text fontSize="sm" fontWeight="semibold" textTransform="capitalize">
                    {day.dayName}
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {new Date(day.date).getDate()}
                  </Text>
                  <HStack gap="2">
                    <Badge size="xs" colorPalette={day.coverage >= 80 ? 'green' : day.coverage >= 60 ? 'orange' : 'red'}>
                      {day.coverage}%
                    </Badge>
                    <Text fontSize="xs" color="gray.600">
                      {day.totalHours}h
                    </Text>
                  </HStack>
                </VStack>

                {/* Shifts Column */}
                <Box 
                  minH="300px" 
                  bg="bg.canvas" 
                  borderRadius="md" 
                  p="2"
                  border="2px dashed"
                  borderColor="border.default"
                  _hover={{ borderColor: 'blue.300', bg: 'blue.50' }}
                >
                  {day.shifts.map(shift => (
                    <ShiftCard key={shift.id} shift={shift} />
                  ))}
                  
                  {day.shifts.length === 0 && (
                    <VStack gap="2" justify="center" h="100px" color="gray.400">
                      <PlusIcon className="w-6 h-6" />
                      <Text fontSize="xs">Add shifts</Text>
                    </VStack>
                  )}

                  {/* Coverage Warning */}
                  {day.coverage < 60 && (
                    <CardWrapper .Root size="sm" bg="red.50" borderColor="red.200">
                      <CardWrapper .Body p="2">
                        <HStack gap="1">
                          <ExclamationTriangleIcon className="w-3 h-3 text-red-500" />
                          <Text fontSize="xs" color="red.600">
                            Understaffed
                          </Text>
                        </HStack>
                      </CardWrapper .Body>
                    </CardWrapper .Root>
                  )}
                </Box>
              </VStack>
            ))}
          </Grid>
        </CardWrapper .Body>
      </CardWrapper .Root>

      {/* Employee Availability Panel */}
      <CardWrapper .Root>
        <CardWrapper .Header>
          <Text fontSize="md" fontWeight="semibold">Staff Availability</Text>
        </CardWrapper .Header>
        <CardWrapper .Body>
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="4">
            {employees.map(employee => (
              <CardWrapper .Root key={employee.id} size="sm">
                <CardWrapper .Body>
                  <VStack gap="2" align="start">
                    <HStack gap="2">
                      <Box w="8" h="8" bg="blue.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                      </Box>
                      <VStack gap="0" align="start">
                        <Text fontSize="sm" fontWeight="semibold">
                          {employee.name}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {employee.position}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <Text fontSize="xs" color="gray.500">
                      Available: {employee.availability.length} days/week
                    </Text>
                    
                    <HStack gap="1" flexWrap="wrap">
                      {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                        <Badge 
                          key={day}
                          size="xs" 
                          colorPalette={employee.availability.includes(day) ? 'green' : 'gray'}
                          variant={employee.availability.includes(day) ? 'subtle' : 'outline'}
                        >
                          {day}
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>
                </CardWrapper .Body>
              </CardWrapper .Root>
            ))}
          </Grid>
        </CardWrapper .Body>
      </CardWrapper .Root>
    </VStack>
  );
}