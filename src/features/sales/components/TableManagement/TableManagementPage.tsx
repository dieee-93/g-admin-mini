import React from 'react';
import { supabase } from '@/lib/supabase';
import {
  Box,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
  Badge,
  Button,
  Stack,
  HStack,
  VStack,
  Separator,
  Tabs,
  Spinner,
  Alert,
} from '@chakra-ui/react';
import { EyeIcon, ClockIcon, UsersIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Icon } from '@/components/ui/Icon';
import { notify } from '@/lib/notifications';

interface Table {
  id: string;
  number: string;
  capacity: number;
  location: 'dining_room' | 'bar' | 'patio' | 'private_dining' | 'terrace';
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance' | 'ready_for_bill';
  service_stage?: string;
  color_code: 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'gray';
  priority: 'normal' | 'vip' | 'attention_needed' | 'urgent';
  turn_count: number;
  daily_revenue: number;
  current_party?: {
    size: number;
    primary_customer_name?: string;
    seated_at: string;
    estimated_duration: number;
    total_spent: number;
  };
}

interface TableStats {
  total_tables: number;
  available_tables: number;
  occupied_tables: number;
  reserved_tables: number;
  average_occupancy: number;
  total_revenue: number;
  average_turn_time: number;
}

export function TableManagementPage() {
  const [tables, setTables] = React.useState<Table[]>([]);
  const [stats, setStats] = React.useState<TableStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [waitTimeData, setWaitTimeData] = React.useState<any>(null);

  React.useEffect(() => {
    loadTableData();
    loadTableStats();
    loadWaitTimeEstimate();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadTableData();
      loadTableStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadTableData = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select(`
          *,
          parties (
            size,
            primary_customer_name,
            seated_at,
            estimated_duration,
            total_spent,
            status
          )
        `)
        .eq('is_active', true)
        .order('number');

      if (error) throw error;

      const formattedTables = data.map((table: any) => ({
        ...table,
        current_party: table.parties?.find((p: any) => 
          ['seated', 'ordering', 'dining', 'dessert', 'paying'].includes(p.status)
        ) || null
      }));

      setTables(formattedTables);
    } catch (error) {
      console.error('Error loading tables:', error);
      notify.error('Error loading table data');
    }
  };

  const loadTableStats = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('status, daily_revenue, turn_count')
        .eq('is_active', true);

      if (error) throw error;

      const stats: TableStats = {
        total_tables: data.length,
        available_tables: data.filter(t => t.status === 'available').length,
        occupied_tables: data.filter(t => t.status === 'occupied').length,
        reserved_tables: data.filter(t => t.status === 'reserved').length,
        average_occupancy: (data.filter(t => t.status === 'occupied').length / data.length) * 100,
        total_revenue: data.reduce((sum, t) => sum + (t.daily_revenue || 0), 0),
        average_turn_time: data.reduce((sum, t) => sum + (t.turn_count || 0), 0) / data.length
      };

      setStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWaitTimeEstimate = async () => {
    try {
      const { data, error } = await supabase.rpc('pos_estimate_next_table_available');
      
      if (error) throw error;
      setWaitTimeData(data);
    } catch (error) {
      console.error('Error loading wait time:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'green';
      case 'occupied': return 'yellow';
      case 'reserved': return 'blue';
      case 'cleaning': return 'gray';
      case 'ready_for_bill': return 'orange';
      case 'maintenance': return 'red';
      default: return 'gray';
    }
  };

  const getColorCodeBg = (colorCode: string) => {
    switch (colorCode) {
      case 'green': return 'green.100';
      case 'yellow': return 'yellow.100';
      case 'orange': return 'orange.100';
      case 'red': return 'red.100';
      case 'blue': return 'blue.100';
      case 'gray': return 'gray.100';
      default: return 'gray.100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'vip': return '👑';
      case 'urgent': return '🚨';
      case 'attention_needed': return '⚠️';
      default: return '';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const refreshData = () => {
    setLoading(true);
    loadTableData();
    loadTableStats();
    loadWaitTimeEstimate();
    notify.success('Data refreshed successfully');
  };

  if (loading && !tables.length) {
    return (
      <Flex align="center" justify="center" h="50vh">
        <VStack>
          <Spinner size="lg" />
          <Text>Loading table data...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="start" gap={1}>
          <Heading size="lg">Table Management</Heading>
          <Text color="gray.600">
            Real-time table status and restaurant operations
          </Text>
        </VStack>
        <HStack>
          <Button
            leftIcon={<Icon icon={ArrowPathIcon} size="sm" />}
            onClick={refreshData}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
          <Button
            leftIcon={<Icon icon={PlusIcon} size="sm" />}
            colorScheme="blue"
            size="sm"
          >
            New Reservation
          </Button>
        </HStack>
      </Flex>

      {/* Quick Stats */}
      {stats && (
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} mb={6}>
          <Card.Root>
            <Card.Body>
              <VStack align="start">
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.600">Available Tables</Text>
                  <Badge colorScheme="green">{stats.available_tables}</Badge>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {stats.available_tables}/{stats.total_tables}
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack align="start">
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.600">Occupancy Rate</Text>
                  <Badge colorScheme="blue">{stats.average_occupancy.toFixed(1)}%</Badge>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {stats.occupied_tables} Occupied
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack align="start">
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.600">Today's Revenue</Text>
                  <Badge colorScheme="purple">${stats.total_revenue.toFixed(0)}</Badge>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  ${stats.total_revenue.toLocaleString()}
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack align="start">
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.600">Avg Wait Time</Text>
                  <Badge colorScheme="orange">
                    {waitTimeData?.estimated_wait_minutes || 0} min
                  </Badge>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                  {waitTimeData?.confidence_level || 'Unknown'}
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Grid>
      )}

      {/* Wait Time Alert */}
      {waitTimeData && waitTimeData.estimated_wait_minutes > 30 && (
        <Alert.Root status="warning" mb={4}>
          <Alert.Indicator />
          <Box>
            <Alert.Title>High Wait Times</Alert.Title>
            <Alert.Description>
              Current estimated wait time is {waitTimeData.estimated_wait_minutes} minutes. 
              Consider managing reservations or optimizing table turnover.
            </Alert.Description>
          </Box>
        </Alert.Root>
      )}

      <Tabs.Root defaultValue="floor-plan">
        <Tabs.List>
          <Tabs.Trigger value="floor-plan">Floor Plan</Tabs.Trigger>
          <Tabs.Trigger value="reservations">Reservations</Tabs.Trigger>
          <Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="floor-plan">
          {/* Table Floor Plan Grid */}
          <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={4} mt={4}>
            {tables.map((table) => (
              <Card.Root
                key={table.id}
                bg={getColorCodeBg(table.color_code)}
                borderLeft="4px solid"
                borderLeftColor={getStatusColor(table.status)}
                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                transition="all 0.2s"
              >
                <Card.Body>
                  <VStack align="start" gap={3}>
                    {/* Table Header */}
                    <HStack justify="space-between" w="full">
                      <HStack>
                        <Text fontSize="lg" fontWeight="bold">
                          Table {table.number}
                        </Text>
                        {getPriorityIcon(table.priority) && (
                          <Text fontSize="lg">{getPriorityIcon(table.priority)}</Text>
                        )}
                      </HStack>
                      <Badge colorScheme={getStatusColor(table.status)}>
                        {table.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </HStack>

                    {/* Table Details */}
                    <HStack justify="space-between" w="full">
                      <HStack>
                        <Icon icon={UsersIcon} size="sm" />
                        <Text fontSize="sm" color="gray.600">
                          Capacity: {table.capacity}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600" textTransform="capitalize">
                        {table.location.replace('_', ' ')}
                      </Text>
                    </HStack>

                    {/* Current Party Info */}
                    {table.current_party && (
                      <>
                        <Separator />
                        <VStack align="start" gap={2} w="full">
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm" fontWeight="medium">
                              Party of {table.current_party.size}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              ${table.current_party.total_spent.toFixed(2)}
                            </Text>
                          </HStack>
                          
                          {table.current_party.primary_customer_name && (
                            <Text fontSize="sm" color="gray.600">
                              {table.current_party.primary_customer_name}
                            </Text>
                          )}
                          
                          <HStack justify="space-between" w="full">
                            <HStack>
                              <Icon icon={ClockIcon} size="sm" />
                              <Text fontSize="sm" color="gray.600">
                                {formatDuration(
                                  Math.floor(
                                    (new Date().getTime() - new Date(table.current_party.seated_at).getTime()) / 60000
                                  )
                                )}
                              </Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              Est: {formatDuration(table.current_party.estimated_duration)}
                            </Text>
                          </HStack>
                        </VStack>
                      </>
                    )}

                    {/* Performance Stats */}
                    <Separator />
                    <HStack justify="space-between" w="full" fontSize="sm" color="gray.600">
                      <Text>Turns: {table.turn_count}</Text>
                      <Text>Revenue: ${table.daily_revenue.toFixed(0)}</Text>
                    </HStack>

                    {/* Action Buttons */}
                    <HStack justify="end" w="full" pt={2}>
                      <Button size="sm" variant="ghost" leftIcon={<Icon icon={EyeIcon} size="sm" />}>
                        View
                      </Button>
                      {table.status === 'available' && (
                        <Button size="sm" colorScheme="blue">
                          Seat Party
                        </Button>
                      )}
                      {table.status === 'occupied' && table.color_code === 'red' && (
                        <Button size="sm" colorScheme="red">
                          Check Status
                        </Button>
                      )}
                    </HStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </Grid>
        </Tabs.Content>

        <Tabs.Content value="reservations">
          <Card.Root mt={4}>
            <Card.Body>
              <Text>Reservation management interface will be implemented here.</Text>
            </Card.Body>
          </Card.Root>
        </Tabs.Content>

        <Tabs.Content value="analytics">
          <Card.Root mt={4}>
            <Card.Body>
              <Text>Table performance analytics will be implemented here.</Text>
            </Card.Body>
          </Card.Root>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}