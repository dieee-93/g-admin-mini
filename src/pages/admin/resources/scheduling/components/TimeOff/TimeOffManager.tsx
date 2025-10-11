// TimeOffManager - Manage time-off requests, approvals, and PTO tracking
import { useState, useEffect } from 'react';
import {
  Stack, VStack, HStack, Button, Badge, Grid, SimpleGrid, Typography, Section,
  Icon, SelectField, InputField, CardWrapper, MetricCard, CardGrid, Box, createListCollection
} from '@/shared/ui';
import { Table, IconButton, Select } from '@chakra-ui/react';
import { 
  CheckIcon, 
  XMarkIcon, 
  ClockIcon,
  CalendarDaysIcon,
  UserIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import type { TimeOffRequest } from '../../types';

interface TimeOffManagerProps {
  pendingCount: number;
  approvedCount: number;
}

interface TimeOffStats {
  total_requests_this_month: number;
  pending_requests: number;
  approved_requests: number;
  denied_requests: number;
  avg_approval_time: number; // days
  most_requested_type: string;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  pto_balance: number;
  sick_balance: number;
}

type RequestFilter = 'all' | 'pending' | 'approved' | 'denied';
type RequestType = 'vacation' | 'sick' | 'personal' | 'emergency' | 'all';

export function TimeOffManager({ pendingCount, approvedCount }: TimeOffManagerProps) {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<TimeOffStats>({
    total_requests_this_month: 0,
    pending_requests: 0,
    approved_requests: 0,
    denied_requests: 0,
    avg_approval_time: 0,
    most_requested_type: ''
  });

  const [filters, setFilters] = useState({
    status: 'all' as RequestFilter,
    type: 'all' as RequestType,
    search: ''
  });

  // Mock data - will be replaced with API calls
  useEffect(() => {
    const mockEmployees: Employee[] = [
      { id: '1', name: 'Ana García', position: 'Server', pto_balance: 15, sick_balance: 8 },
      { id: '2', name: 'Carlos López', position: 'Cook', pto_balance: 20, sick_balance: 5 },
      { id: '3', name: 'María Rodríguez', position: 'Server', pto_balance: 12, sick_balance: 10 },
      { id: '4', name: 'José Martín', position: 'Manager', pto_balance: 25, sick_balance: 12 },
      { id: '5', name: 'Elena Fernández', position: 'Bartender', pto_balance: 18, sick_balance: 7 }
    ];

    const mockRequests: TimeOffRequest[] = [
      {
        id: '1',
        employee_id: '1',
        start_date: '2024-02-15',
        end_date: '2024-02-17',
        type: 'vacation',
        status: 'pending',
        reason: 'Family vacation',
        requested_at: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        employee_id: '2',
        start_date: '2024-01-22',
        end_date: '2024-01-22',
        type: 'sick',
        status: 'approved',
        reason: 'Medical appointment',
        requested_at: '2024-01-20T08:30:00Z',
        reviewed_by: 'manager',
        reviewed_at: '2024-01-20T14:00:00Z'
      },
      {
        id: '3',
        employee_id: '3',
        start_date: '2024-02-01',
        end_date: '2024-02-03',
        type: 'personal',
        status: 'pending',
        reason: 'Personal matters',
        requested_at: '2024-01-12T16:45:00Z'
      },
      {
        id: '4',
        employee_id: '4',
        start_date: '2024-01-18',
        end_date: '2024-01-19',
        type: 'emergency',
        status: 'approved',
        reason: 'Family emergency',
        requested_at: '2024-01-17T22:00:00Z',
        reviewed_by: 'hr',
        reviewed_at: '2024-01-18T08:00:00Z'
      }
    ];

    const mockStats: TimeOffStats = {
      total_requests_this_month: 12,
      pending_requests: pendingCount,
      approved_requests: approvedCount,
      denied_requests: 2,
      avg_approval_time: 1.5,
      most_requested_type: 'vacation'
    };

    setEmployees(mockEmployees);
    setRequests(mockRequests);
    setStats(mockStats);
    setLoading(false);
  }, [pendingCount, approvedCount]);

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee?.name || 'Unknown';
  };

  const getStatusColor = (status: TimeOffRequest['status']) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      denied: 'red'
    };
    return colors[status] || 'gray';
  };

  const getTypeIcon = (type: TimeOffRequest['type']) => {
    const icons = {
      vacation: CalendarDaysIcon,
      sick: ExclamationTriangleIcon,
      personal: UserIcon,
      emergency: ExclamationTriangleIcon
    };
    return icons[type] || CalendarDaysIcon;
  };

  const handleApproveRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'approved' as const, reviewed_at: new Date().toISOString(), reviewed_by: 'manager' }
        : req
    ));
  };

  const handleDenyRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'denied' as const, reviewed_at: new Date().toISOString(), reviewed_by: 'manager' }
        : req
    ));
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filters.status === 'all' || request.status === filters.status;
    const matchesType = filters.type === 'all' || request.type === filters.type;
    const matchesSearch = filters.search === '' || 
      getEmployeeName(request.employee_id).toLowerCase().includes(filters.search.toLowerCase()) ||
      request.reason?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const RequestRow = ({ request }: { request: TimeOffRequest }) => {
    const IconComponent = getTypeIcon(request.type);
    const daysDuration = Math.ceil((new Date(request.end_date).getTime() - new Date(request.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return (
      <Table.Row key={request.id}>
        <Table.Cell>
          <HStack gap="3">
            <Box p="2" bg={`${getStatusColor(request.status)}.100`} borderRadius="md">
              <IconComponent className="w-4 h-4" />
            </Box>
            <VStack align="start" gap="0">
              <Typography variant="body" weight="semibold">{getEmployeeName(request.employee_id)}</Typography>
              <Typography variant="caption" color="gray.600">
                {employees.find(emp => emp.id === request.employee_id)?.position}
              </Typography>
            </VStack>
          </HStack>
        </Table.Cell>
        
        <Table.Cell>
          <VStack align="start" gap="1">
            <Badge colorPalette={getStatusColor(request.status)} variant="subtle" textTransform="capitalize">
              {request.type}
            </Badge>
            <Typography variant="body" size="sm">
              {daysDuration} day{daysDuration > 1 ? 's' : ''}
            </Typography>
          </VStack>
        </Table.Cell>
        
        <Table.Cell>
          <VStack align="start" gap="0">
            <Typography variant="body" size="sm">
              {new Date(request.start_date).toLocaleDateString('es-ES')}
            </Typography>
            <Typography variant="caption" color="gray.600">
              to {new Date(request.end_date).toLocaleDateString('es-ES')}
            </Typography>
          </VStack>
        </Table.Cell>
        
        <Table.Cell>
          <Badge colorPalette={getStatusColor(request.status)} variant="subtle">
            {request.status}
          </Badge>
        </Table.Cell>
        
        <Table.Cell>
          <Typography variant="body" size="sm" style={{ maxWidth: '200px' }}>
            {request.reason}
          </Typography>
        </Table.Cell>
        
        <Table.Cell>
          {request.status === 'pending' && (
            <HStack gap="1">
              <IconButton 
                size="sm" 
                colorPalette="green" 
                variant="ghost"
                onClick={() => handleApproveRequest(request.id)}
              >
                <CheckIcon className="w-4 h-4" />
              </IconButton>
              <IconButton 
                size="sm" 
                colorPalette="red" 
                variant="ghost"
                onClick={() => handleDenyRequest(request.id)}
              >
                <XMarkIcon className="w-4 h-4" />
              </IconButton>
            </HStack>
          )}
          {request.status !== 'pending' && (
            <Typography variant="caption" color="gray.500">
              {request.reviewed_at && new Date(request.reviewed_at).toLocaleDateString('es-ES')}
            </Typography>
          )}
        </Table.Cell>
      </Table.Row>
    );
  };

  return (
    <VStack gap="6" align="stretch">
      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
        <CardWrapper>
          <CardWrapper.Body textAlign="center" py="4">
            <VStack gap="1">
              <Typography variant="heading" size="2xl" weight="bold" color="orange.500">
                {stats.pending_requests}
              </Typography>
              <Typography variant="label" size="sm" color="gray.600">Pending Requests</Typography>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
        
        <CardWrapper>
          <CardWrapper.Body textAlign="center" py="4">
            <VStack gap="1">
              <Typography variant="heading" size="2xl" weight="bold" color="green.500">
                {stats.approved_requests}
              </Typography>
              <Typography variant="label" size="sm" color="gray.600">Approved This Month</Typography>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
        
        <CardWrapper>
          <CardWrapper.Body textAlign="center" py="4">
            <VStack gap="1">
              <Typography variant="heading" size="2xl" weight="bold" color="blue.500">
                {stats.avg_approval_time}d
              </Typography>
              <Typography variant="label" size="sm" color="gray.600">Avg Approval Time</Typography>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
        
        <CardWrapper>
          <CardWrapper.Body textAlign="center" py="4">
            <VStack gap="1">
              <Typography variant="heading" size="2xl" weight="bold" color="purple.500">
                {stats.total_requests_this_month}
              </Typography>
              <Typography variant="label" size="sm" color="gray.600">Total This Month</Typography>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
      </SimpleGrid>

      {/* Filters */}
      <CardWrapper>
        <CardWrapper.Body>
          <Stack direction={{ base: 'column', md: 'row' }} gap="4" align="end">
            <HStack gap="4" flex="1">
              <Box>
                <Typography variant="label" size="sm" style={{ marginBottom: '0.25rem' }}>Status</Typography>
                <Select.Root 
                  collection={createListCollection({
                    items: [
                      { value: "all", label: "All Status" },
                      { value: "pending", label: "Pending" },
                      { value: "approved", label: "Approved" },
                      { value: "denied", label: "Denied" }
                    ]
                  })}
                  value={filters.status} 
                  onValueChange={(e) => setFilters(prev => ({...prev, status: e.value as RequestFilter}))}
                >
                  <Select.Trigger width="150px">
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content />
                </Select.Root>
              </Box>

              <Box>
                <Typography variant="label" size="sm" style={{ marginBottom: '0.25rem' }}>Type</Typography>
                <Select.Root 
                  collection={createListCollection({
                    items: [
                      { value: "all", label: "All Types" },
                      { value: "vacation", label: "Vacation" },
                      { value: "sick", label: "Sick Leave" },
                      { value: "personal", label: "Personal" },
                      { value: "emergency", label: "Emergency" }
                    ]
                  })}
                  value={filters.type}
                  onValueChange={(e) => setFilters(prev => ({...prev, type: e.value as RequestType}))}
                >
                  <Select.Trigger width="150px">
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content />
                </Select.Root>
              </Box>

              <Box flex="1">
                <Typography variant="label" size="sm" style={{ marginBottom: '0.25rem' }}>Search</Typography>
                <InputField
                  placeholder="Search by employee or reason..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                />
              </Box>
            </HStack>

            <Button 
            leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}>
              Filter
            </Button>
          </Stack>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Requests Table */}
      <CardWrapper>
        <CardWrapper.Header>
          <HStack justify="space-between">
            <Typography variant="title" size="lg" weight="semibold">
              Time Off Requests ({filteredRequests.length})
            </Typography>
            {stats.pending_requests > 0 && (
              <Badge colorPalette="orange">
                {stats.pending_requests} pending review
              </Badge>
            )}
          </HStack>
        </CardWrapper.Header>
        <CardWrapper.Body p="0">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Employee</Table.ColumnHeader>
                <Table.ColumnHeader>Type</Table.ColumnHeader>
                <Table.ColumnHeader>Dates</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Reason</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredRequests.map(request => (
                <RequestRow key={request.id} request={request} />
              ))}
              {filteredRequests.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py="8">
                    <VStack gap="2" color="gray.500">
                      <InformationCircleIcon className="w-8 h-8" />
                      <Typography variant="body">No time-off requests found</Typography>
                      <Typography variant="caption">Try adjusting your filters</Typography>
                    </VStack>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Employee PTO Balances */}
      <CardWrapper>
        <CardWrapper.Header>
          <Typography variant="title" size="lg" weight="semibold">Employee PTO Balances</Typography>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
            {employees.map(employee => (
              <CardWrapper key={employee.id} size="sm">
                <CardWrapper.Body>
                  <VStack gap="3" align="stretch">
                    <HStack justify="space-between">
                      <VStack align="start" gap="0">
                        <Typography variant="body" weight="semibold">{employee.name}</Typography>
                        <Typography variant="caption" color="gray.600">{employee.position}</Typography>
                      </VStack>
                    </HStack>
                    
                    <SimpleGrid columns={2} gap="3">
                      <VStack gap="1">
                        <Typography variant="title" size="lg" weight="bold" color="blue.500">
                          {employee.pto_balance}
                        </Typography>
                        <Typography variant="caption" color="gray.600">PTO Days</Typography>
                      </VStack>
                      <VStack gap="1">
                        <Typography variant="title" size="lg" weight="bold" color="green.500">
                          {employee.sick_balance}
                        </Typography>
                        <Typography variant="caption" color="gray.600">Sick Days</Typography>
                      </VStack>
                    </SimpleGrid>
                  </VStack>
                </CardWrapper.Body>
              </CardWrapper>
            ))}
          </SimpleGrid>
        </CardWrapper.Body>
      </CardWrapper>
    </VStack>
  );
}