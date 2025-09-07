import React from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Stack,
  CardWrapper,
  Grid,
  Typography,
  Badge,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@/shared/ui';
import { EyeIcon, ClockIcon, UsersIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
import { notify } from '@/lib/notifications';

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'ready_for_bill' | 'maintenance';
  location: string;
  priority: 'normal' | 'vip' | 'urgent' | 'attention_needed';
  color_code: string;
  turn_count: number;
  daily_revenue: number;
  current_party?: {
    size: number;
    primary_customer_name?: string;
    seated_at: string;
    estimated_duration: number;
    total_spent: number;
    status: string;
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

export default function TableManagement() {
  const [tables, setTables] = React.useState<Table[]>([]);
  const [stats, setStats] = React.useState<TableStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [waitTimeData, setWaitTimeData] = React.useState<any>(null);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

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

      const formattedTables = data.map((table: unknown) => ({
        ...table,
        current_party: table.parties?.find((p: unknown) => 
          p.status === 'seated' || p.status === 'active'
        ) || null
      }));

      setTables(formattedTables);
    } catch (error) {
      console.error('Error loading tables:', error);
      notify.error({ title: 'Error loading table data' });
    }
  };

  const loadTableStats = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('status, daily_revenue, turn_count')
        .eq('is_active', true);

      if (error) throw error;

      const stats = {
        total_tables: data.length,
        available_tables: data.filter((t: unknown) => t.status === 'available').length,
        occupied_tables: data.filter((t: unknown) => t.status === 'occupied').length,
        reserved_tables: data.filter((t: unknown) => t.status === 'reserved').length,
        average_occupancy: (data.filter((t: unknown) => t.status === 'occupied').length / data.length) * 100,
        total_revenue: data.reduce((sum: number, t: any) => sum + (t.daily_revenue || 0), 0),
        average_turn_time: data.reduce((sum: number, t: any) => sum + (t.turn_count || 0), 0) / data.length
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Error loading table stats:', error);
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
      case 'available': return 'success';
      case 'occupied': return 'warning';
      case 'reserved': return 'info';
      case 'cleaning': return 'gray';
      case 'ready_for_bill': return 'accent';
      case 'maintenance': return 'error';
      default: return 'gray';
    }
  };

  const getColorCodeBg = (colorCode: string) => {
    switch (colorCode) {
      case 'green': return 'green.50';
      case 'yellow': return 'yellow.50';
      case 'orange': return 'orange.50';
      case 'red': return 'red.50';
      case 'blue': return 'blue.50';
      case 'gray': return 'gray.50';
      default: return 'gray.50';
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
    notify.success({ title: 'Data refreshed successfully' });
  };

  if (loading && !tables.length) {
    return (
      <Stack direction="row" align="center" justify="center" h="50vh">
        <Stack direction="column">
          <Typography>Loading table data...</Typography>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack p="lg">
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center" mb="lg">
        <Stack direction="column" align="start" gap="xs">
          <Typography variant="heading" size="lg">Table Management</Typography>
          <Typography color="text.muted">
            Real-time table status and restaurant operations
          </Typography>
        </Stack>
        <Stack direction="row">
          <Button
            onClick={refreshData}
            variant="outline"
            size="sm"
          >
            <Icon icon={ArrowPathIcon} size="sm" />
            Refresh
          </Button>
          <Button
            colorPalette="info"
            size="sm"
          >
            <Icon icon={PlusIcon} size="sm" />
            New Reservation
          </Button>
        </Stack>
      </Stack>

      {/* Quick Stats */}
      {stats && (
        <Stack mb="lg">
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="lg">
            <CardWrapper>
              <Stack direction="column" align="start">
                <Stack direction="row" justify="space-between" w="full">
                  <Typography size="sm" color="text.muted">Available Tables</Typography>
                  <Badge colorPalette="success">{stats.available_tables}</Badge>
                </Stack>
                <Typography size="2xl" fontWeight="bold" >
                  {stats.available_tables}/{stats.total_tables}
                </Typography>
              </Stack>
            </CardWrapper>

            <CardWrapper>
              <Stack direction="column" align="start">
                <Stack direction="row" justify="space-between" w="full">
                  <Typography size="sm" color="text.muted">Occupancy Rate</Typography>
                  <Badge colorPalette="info">{stats.average_occupancy.toFixed(1)}%</Badge>
                </Stack>
                <Typography size="2xl" fontWeight="bold" >
                  {stats.occupied_tables} Occupied
                </Typography>
              </Stack>
            </CardWrapper>

            <CardWrapper>
              <Stack direction="column" align="start">
                <Stack direction="row" justify="space-between" w="full">
                  <Typography size="sm" color="text.muted">Today's Revenue</Typography>
                  <Badge colorPalette="accent">${stats.total_revenue.toFixed(0)}</Badge>
                </Stack>
                <Typography size="2xl" fontWeight="bold" color="text.primary">
                  ${stats.total_revenue.toLocaleString()}
                </Typography>
              </Stack>
            </CardWrapper>

            <CardWrapper>
              <Stack direction="column" align="start">
                <Stack direction="row" justify="space-between" w="full">
                  <Typography size="sm" color="text.muted">Avg Wait Time</Typography>
                  <Badge colorPalette="warning">
                    {waitTimeData?.estimated_wait_minutes || 0} min
                  </Badge>
                </Stack>
                <Typography size="2xl" fontWeight="bold" >
                  {waitTimeData?.confidence_level || 'Unknown'}
                </Typography>
              </Stack>
            </CardWrapper>
          </Grid>
        </Stack>
      )}

      {/* Wait Time Alert */}
      {waitTimeData && waitTimeData.estimated_wait_minutes > 30 && (
        <Stack mb="4">
          <Alert status="warning">
            <AlertIcon>⚠️</AlertIcon>
            <Stack>
              <AlertTitle>High Wait Times</AlertTitle>
              <AlertDescription>
                Current estimated wait time is {waitTimeData.estimated_wait_minutes} minutes. 
                Consider managing reservations or optimizing table turnover.
              </AlertDescription>
            </Stack>
          </Alert>
        </Stack>
      )}

      <Tabs defaultValue="floor-plan">
        <TabList>
          <Tab value="floor-plan">Floor Plan</Tab>
          <Tab value="reservations">Reservations</Tab>
          <Tab value="analytics">Analytics</Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="floor-plan">
            {/* Table Floor Plan Grid */}
            <Stack mt="md">
              <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap="md">
              {tables.map((table) => (
                <CardWrapper
                  key={table.id}
                >
                  <Stack direction="column" align="start" gap="sm">
                    {/* Table Header */}
                    <Stack direction="row" justify="space-between" w="full">
                      <Stack direction="row">
                        <Typography size="lg" fontWeight="bold">
                          Table {table.number}
                        </Typography>
                        {getPriorityIcon(table.priority) && (
                          <Typography size="lg">{getPriorityIcon(table.priority)}</Typography>
                        )}
                      </Stack>
                      <Badge colorPalette={getStatusColor(table.status)}>
                        {table.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </Stack>

                    {/* Table Details */}
                    <Stack direction="row" justify="space-between" w="full">
                      <Stack direction="row">
                        <Icon icon={UsersIcon} size="sm" />
                        <Typography size="sm" color="text.muted">
                          Capacity: {table.capacity}
                        </Typography>
                      </Stack>
                      <Typography size="sm" color="text.muted" textTransform="capitalize">
                        {table.location.replace('_', ' ')}
                      </Typography>
                    </Stack>

                    {/* Current Party Info */}
                    {table.current_party && (
                      <>
                        <hr />
                        <Stack direction="column" align="start" gap="xs" w="full">
                          <Stack direction="row" justify="space-between" w="full">
                            <Typography size="sm" fontWeight="medium">
                              Party of {table.current_party.size}
                            </Typography>
                            <Typography size="sm" color="text.muted">
                              ${table.current_party.total_spent.toFixed(2)}
                            </Typography>
                          </Stack>
                          
                          {table.current_party.primary_customer_name && (
                            <Typography size="sm" color="text.muted">
                              {table.current_party.primary_customer_name}
                            </Typography>
                          )}
                          
                          <Stack direction="row" justify="space-between" w="full">
                            <Stack direction="row">
                              <Icon icon={ClockIcon} size="sm" />
                              <Typography size="sm" color="text.muted">
                                {formatDuration(
                                  Math.floor(
                                    (new Date().getTime() - new Date(table.current_party.seated_at).getTime()) / 60000
                                  )
                                )}
                              </Typography>
                            </Stack>
                            <Typography size="sm" color="text.muted">
                              Est: {formatDuration(table.current_party.estimated_duration)}
                            </Typography>
                          </Stack>
                        </Stack>
                      </>
                    )}

                    {/* Performance Stats */}
                    <hr />
                    <Stack direction="row" justify="space-between" w="full" fontSize="sm" color="text.muted">
                      <Typography>Turns: {table.turn_count}</Typography>
                      <Typography>Revenue: ${table.daily_revenue.toFixed(0)}</Typography>
                    </Stack>

                    {/* Action Buttons */}
                    <Stack direction="row" justify="end" w="full" pt={2}>
                      <Button size="sm" variant="ghost">
                        <Icon icon={EyeIcon} size="sm" />
                        View
                      </Button>
                      {table.status === 'available' && (
                        <Button size="sm" colorPalette="info">
                          Seat Party
                        </Button>
                      )}
                      {table.status === 'occupied' && table.color_code === 'red' && (
                        <Button size="sm" colorPalette="error">
                          Check Status
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </CardWrapper>
              ))}
              </Grid>
            </Stack>
          </TabPanel>

          <TabPanel value="reservations">
            <Stack mt="md">
              <CardWrapper>
                <Typography>Reservation management interface will be implemented here.</Typography>
              </CardWrapper>
            </Stack>
          </TabPanel>

          <TabPanel value="analytics">
            <Stack mt="md">
              <CardWrapper>
                <Typography>Table performance analytics will be implemented here.</Typography>
              </CardWrapper>
            </Stack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
}