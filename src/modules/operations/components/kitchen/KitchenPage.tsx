import React from 'react';
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
  Progress,
  Select,
  createListCollection,
} from '@chakra-ui/react';
import { 
  ClockIcon, 
  PlayIcon, 
  CheckIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  FireIcon,
  BeakerIcon,
  CakeIcon
} from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
import { supabase } from '@/lib/supabase';
import { notify } from '@/lib/notifications';

interface KitchenOrder {
  order_id: string;
  order_number: string;
  table_number?: string;
  items: KitchenOrderItem[];
  order_time: string;
  estimated_ready_time: string;
  priority: 'normal' | 'rush' | 'vip';
  special_instructions: string[];
  allergy_warnings: string[];
  items_completed: number;
  items_total: number;
  completion_percentage: number;
  estimated_time_remaining: number;
}

interface KitchenOrderItem {
  item_id: string;
  product_name: string;
  quantity: number;
  modifications: ItemModification[];
  special_instructions?: string;
  allergy_warnings: string[];
  station: string;
  status: 'pending' | 'in_progress' | 'ready' | 'served';
  estimated_prep_time: number;
  actual_prep_time?: number;
  started_prep_at?: string;
  completed_at?: string;
}

interface ItemModification {
  id: string;
  type: 'addition' | 'substitution' | 'removal' | 'preparation_style';
  description: string;
  price_adjustment: number;
}

interface KitchenStats {
  active_orders: number;
  avg_prep_time: number;
  orders_behind_schedule: number;
  completion_rate: number;
  items_in_progress: number;
}

const KITCHEN_STATIONS = [
  { id: 'grill', name: 'Grill', icon: FireIcon, color: 'red' },
  { id: 'salad', name: 'Cold Prep', icon: BeakerIcon, color: 'green' },
  { id: 'dessert', name: 'Dessert', icon: CakeIcon, color: 'purple' },
  { id: 'bar', name: 'Beverages', icon: BeakerIcon, color: 'blue' },
  { id: 'prep', name: 'Hot Prep', icon: FireIcon, color: 'orange' },
  { id: 'expo', name: 'Expedite', icon: AdjustmentsHorizontalIcon, color: 'cyan' }
];

export function KitchenPage() {
  const [orders, setOrders] = React.useState<KitchenOrder[]>([]);
  const [stats, setStats] = React.useState<KitchenStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeStation, setActiveStation] = React.useState<string>('all');
  const [orderFilter, setOrderFilter] = React.useState<string>('all');

  React.useEffect(() => {
    loadKitchenData();
    loadKitchenStats();
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      loadKitchenData();
      loadKitchenStats();
    }, 30000);

    // Subscribe to real-time updates
    const subscription = subscribeToKitchenUpdates();

    return () => {
      clearInterval(interval);
      subscription?.unsubscribe();
    };
  }, []);

  const subscribeToKitchenUpdates = () => {
    return supabase
      .channel('kitchen-orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => loadKitchenData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'order_items' }, 
        () => loadKitchenData()
      )
      .subscribe();
  };

  const loadKitchenData = async () => {
    try {
      const { data, error } = await supabase.rpc('pos_get_kitchen_orders');
      
      if (error) throw error;
      
      // Transform data to match interface
      const transformedOrders = (data || []).map((order: any) => ({
        ...order,
        items_completed: order.items?.filter((item: any) => 
          ['ready', 'served'].includes(item.status)
        ).length || 0,
        items_total: order.items?.length || 0,
        completion_percentage: order.items?.length ? 
          Math.round((order.items.filter((item: any) => 
            ['ready', 'served'].includes(item.status)
          ).length / order.items.length) * 100) : 0,
        estimated_time_remaining: calculateTimeRemaining(order)
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error loading kitchen orders:', error);
      notify.error('Failed to load kitchen orders');
    }
  };

  const loadKitchenStats = async () => {
    try {
      const { data, error } = await supabase.rpc('pos_get_kitchen_performance');
      
      if (error) throw error;
      
      setStats({
        active_orders: data?.active_orders || 0,
        avg_prep_time: data?.average_prep_time || 0,
        orders_behind_schedule: data?.orders_behind_schedule || 0,
        completion_rate: data?.completion_rate || 100,
        items_in_progress: data?.items_in_progress || 0
      });
    } catch (error) {
      console.error('Error loading kitchen stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeRemaining = (order: any) => {
    if (!order.items) return 0;
    
    const inProgressItems = order.items.filter((item: any) => 
      ['pending', 'in_progress'].includes(item.status)
    );
    
    if (inProgressItems.length === 0) return 0;
    
    return Math.max(...inProgressItems.map((item: any) => 
      item.estimated_prep_time - (item.actual_prep_time || 0)
    ));
  };

  const updateItemStatus = async (itemId: string, status: string) => {
    try {
      const { error } = await supabase.rpc('pos_update_kitchen_item_status', {
        item_id: itemId,
        new_status: status,
        staff_member: 'kitchen_staff' // In real app, get from auth context
      });

      if (error) throw error;
      
      notify.success(`Item marked as ${status}`);
      loadKitchenData();
    } catch (error) {
      console.error('Error updating item status:', error);
      notify.error('Failed to update item status');
    }
  };

  const completeOrder = async (orderId: string) => {
    try {
      const { error } = await supabase.rpc('pos_complete_kitchen_order', {
        order_id: orderId
      });

      if (error) throw error;
      
      notify.success('Order completed and ready for service');
      loadKitchenData();
    } catch (error) {
      console.error('Error completing order:', error);
      notify.error('Failed to complete order');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'vip': return 'purple';
      case 'rush': return 'red';
      default: return 'blue';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'gray';
      case 'in_progress': return 'yellow';
      case 'ready': return 'green';
      case 'served': return 'blue';
      default: return 'gray';
    }
  };

  const getTimeColor = (timeRemaining: number, estimatedTime: number) => {
    const percentage = (timeRemaining / estimatedTime) * 100;
    if (percentage > 80) return 'red';
    if (percentage > 50) return 'orange';
    return 'green';
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getElapsedTime = (orderTime: string) => {
    const elapsed = Math.floor((new Date().getTime() - new Date(orderTime).getTime()) / 60000);
    return elapsed;
  };

  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => {
      if (activeStation !== 'all') {
        const hasStationItems = order.items.some(item => item.station === activeStation);
        if (!hasStationItems) return false;
      }

      if (orderFilter === 'behind_schedule') {
        return getElapsedTime(order.order_time) > parseInt(order.estimated_ready_time);
      }
      if (orderFilter === 'priority') {
        return order.priority !== 'normal';
      }
      if (orderFilter === 'ready') {
        return order.completion_percentage === 100;
      }

      return true;
    });
  }, [orders, activeStation, orderFilter]);

  const stationCollection = createListCollection({
    items: [
      { value: 'all', label: 'All Stations' },
      ...KITCHEN_STATIONS.map(station => ({
        value: station.id,
        label: station.name
      }))
    ]
  });

  const filterCollection = createListCollection({
    items: [
      { value: 'all', label: 'All Orders' },
      { value: 'behind_schedule', label: 'Behind Schedule' },
      { value: 'priority', label: 'Priority Orders' },
      { value: 'ready', label: 'Ready to Serve' }
    ]
  });

  if (loading && orders.length === 0) {
    return (
      <Flex align="center" justify="center" h="50vh">
        <VStack>
          <Spinner size="lg" />
          <Text>Loading kitchen orders...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="start" gap={1}>
          <Heading size="lg">Kitchen Display System</Heading>
          <Text color="gray.600">
            Real-time order management and kitchen operations
          </Text>
        </VStack>
        <HStack>
          <Select.Root
            collection={stationCollection}
            value={[activeStation]}
            onValueChange={(details) => setActiveStation(details.value[0])}
            size="sm"
          >
            <Select.Trigger minW="150px">
              <Select.ValueText />
            </Select.Trigger>
            <Select.Content>
              {stationCollection.items.map((station) => (
                <Select.Item key={station.value} item={station}>
                  {station.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Select.Root
            collection={filterCollection}
            value={[orderFilter]}
            onValueChange={(details) => setOrderFilter(details.value[0])}
            size="sm"
          >
            <Select.Trigger minW="150px">
              <Select.ValueText />
            </Select.Trigger>
            <Select.Content>
              {filterCollection.items.map((filter) => (
                <Select.Item key={filter.value} item={filter}>
                  {filter.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Button
            leftIcon={<Icon icon={ArrowPathIcon} size="sm" />}
            onClick={() => {
              setLoading(true);
              loadKitchenData();
              loadKitchenStats();
            }}
            variant="outline"
            size="sm"
          >
            Refresh
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
                  <Text fontSize="sm" color="gray.600">Active Orders</Text>
                  <Badge colorScheme="blue">{stats.active_orders}</Badge>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {stats.active_orders}
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack align="start">
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.600">Avg Prep Time</Text>
                  <Badge colorScheme="green">{stats.avg_prep_time}m</Badge>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {formatTime(stats.avg_prep_time)}
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack align="start">
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.600">Behind Schedule</Text>
                  <Badge colorScheme={stats.orders_behind_schedule > 0 ? 'red' : 'green'}>
                    {stats.orders_behind_schedule}
                  </Badge>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color={stats.orders_behind_schedule > 0 ? 'red.600' : 'green.600'}>
                  {stats.orders_behind_schedule}
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack align="start">
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.600">Completion Rate</Text>
                  <Badge colorScheme="purple">{stats.completion_rate.toFixed(1)}%</Badge>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  {stats.completion_rate.toFixed(0)}%
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Grid>
      )}

      {/* Behind Schedule Alert */}
      {stats && stats.orders_behind_schedule > 0 && (
        <Alert.Root status="warning" mb={4}>
          <Alert.Indicator />
          <Box>
            <Alert.Title>Orders Behind Schedule</Alert.Title>
            <Alert.Description>
              {stats.orders_behind_schedule} orders are running behind their estimated completion time. 
              Please review and prioritize these orders.
            </Alert.Description>
          </Box>
        </Alert.Root>
      )}

      {/* Kitchen Orders Grid */}
      <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={4}>
        {filteredOrders.map((order) => {
          const elapsedTime = getElapsedTime(order.order_time);
          const isOverdue = elapsedTime > parseInt(order.estimated_ready_time);
          
          return (
            <Card.Root
              key={order.order_id}
              borderLeft="4px solid"
              borderLeftColor={getPriorityColor(order.priority)}
              bg={isOverdue ? 'red.50' : 'white'}
              _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              transition="all 0.2s"
            >
              <Card.Header>
                <VStack align="start" gap={2}>
                  {/* Order Header */}
                  <HStack justify="space-between" w="full">
                    <VStack align="start" gap={0}>
                      <Text fontSize="lg" fontWeight="bold">
                        Order #{order.order_number}
                      </Text>
                      {order.table_number && (
                        <Text fontSize="sm" color="gray.600">
                          Table {order.table_number}
                        </Text>
                      )}
                    </VStack>
                    <VStack align="end" gap={1}>
                      <Badge colorScheme={getPriorityColor(order.priority)}>
                        {order.priority.toUpperCase()}
                      </Badge>
                      {isOverdue && (
                        <Badge colorScheme="red">OVERDUE</Badge>
                      )}
                    </VStack>
                  </HStack>

                  {/* Time Information */}
                  <HStack justify="space-between" w="full" fontSize="sm">
                    <HStack color="gray.600">
                      <Icon icon={ClockIcon} size="sm" />
                      <Text>Elapsed: {formatTime(elapsedTime)}</Text>
                    </HStack>
                    <Text color={getTimeColor(order.estimated_time_remaining, parseInt(order.estimated_ready_time))}>
                      Est: {formatTime(order.estimated_time_remaining)}
                    </Text>
                  </HStack>

                  {/* Progress Bar */}
                  <Box w="full">
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="xs" color="gray.600">
                        Progress: {order.items_completed}/{order.items_total}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {order.completion_percentage}%
                      </Text>
                    </HStack>
                    <Progress 
                      value={order.completion_percentage} 
                      size="sm" 
                      colorScheme={order.completion_percentage === 100 ? 'green' : 'blue'}
                    />
                  </Box>
                </VStack>
              </Card.Header>

              <Card.Body>
                <VStack align="stretch" gap={3}>
                  {/* Special Instructions & Allergies */}
                  {(order.special_instructions.length > 0 || order.allergy_warnings.length > 0) && (
                    <Box p={2} bg="yellow.50" borderRadius="md" borderWidth="1px" borderColor="yellow.200">
                      {order.allergy_warnings.length > 0 && (
                        <HStack mb={1}>
                          <Icon icon={ExclamationTriangleIcon} size="sm" className="text-red-500" />
                          <Text fontSize="xs" color="red.600" fontWeight="bold">
                            ALLERGIES: {order.allergy_warnings.join(', ')}
                          </Text>
                        </HStack>
                      )}
                      {order.special_instructions.length > 0 && (
                        <Text fontSize="xs" color="orange.700">
                          Notes: {order.special_instructions.join(', ')}
                        </Text>
                      )}
                    </Box>
                  )}

                  {/* Order Items */}
                  <VStack align="stretch" gap={2}>
                    {order.items
                      .filter(item => activeStation === 'all' || item.station === activeStation)
                      .map((item, index) => {
                      const station = KITCHEN_STATIONS.find(s => s.id === item.station);
                      const StationIcon = station?.icon || FireIcon;

                      return (
                        <Box
                          key={item.item_id || index}
                          p={3}
                          bg={item.status === 'ready' ? 'green.50' : 
                              item.status === 'in_progress' ? 'yellow.50' : 'gray.50'}
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor={item.status === 'ready' ? 'green.200' : 
                                     item.status === 'in_progress' ? 'yellow.200' : 'gray.200'}
                        >
                          <VStack align="stretch" gap={2}>
                            <HStack justify="space-between">
                              <HStack>
                                <Icon icon={StationIcon} size="sm" className={`text-${station?.color || 'gray'}-500`} />
                                <Text fontWeight="medium" fontSize="sm">
                                  {item.quantity}x {item.product_name}
                                </Text>
                              </HStack>
                              <Badge colorScheme={getStatusColor(item.status)} size="sm">
                                {item.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </HStack>

                            {/* Modifications */}
                            {item.modifications.length > 0 && (
                              <Text fontSize="xs" color="gray.600">
                                Mods: {item.modifications.map(m => m.description).join(', ')}
                              </Text>
                            )}

                            {/* Item Special Instructions */}
                            {item.special_instructions && (
                              <Text fontSize="xs" color="orange.600">
                                Note: {item.special_instructions}
                              </Text>
                            )}

                            {/* Action Buttons */}
                            <HStack justify="end">
                              {item.status === 'pending' && (
                                <Button
                                  size="xs"
                                  colorScheme="blue"
                                  leftIcon={<Icon icon={PlayIcon} size="sm" />}
                                  onClick={() => updateItemStatus(item.item_id, 'in_progress')}
                                >
                                  Start
                                </Button>
                              )}
                              {item.status === 'in_progress' && (
                                <Button
                                  size="xs"
                                  colorScheme="green"
                                  leftIcon={<Icon icon={CheckIcon} size="sm" />}
                                  onClick={() => updateItemStatus(item.item_id, 'ready')}
                                >
                                  Ready
                                </Button>
                              )}
                            </HStack>
                          </VStack>
                        </Box>
                      );
                    })}
                  </VStack>

                  {/* Complete Order Button */}
                  {order.completion_percentage === 100 && (
                    <Button
                      colorScheme="green"
                      size="sm"
                      leftIcon={<HiCheck />}
                      onClick={() => completeOrder(order.order_id)}
                    >
                      Complete Order - Ready for Service
                    </Button>
                  )}
                </VStack>
              </Card.Body>
            </Card.Root>
          );
        })}
      </Grid>

      {/* No Orders Message */}
      {filteredOrders.length === 0 && !loading && (
        <Card.Root>
          <Card.Body>
            <VStack gap="4" py="8">
              <Icon icon={CheckIcon} size="2xl" className="text-gray-400" />
              <VStack gap="2">
                <Text fontSize="lg" fontWeight="medium">
                  No orders to display
                </Text>
                <Text color="gray.500" textAlign="center">
                  {activeStation !== 'all' 
                    ? `No orders for ${KITCHEN_STATIONS.find(s => s.id === activeStation)?.name} station`
                    : 'All orders are complete or no new orders received'
                  }
                </Text>
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}
    </Box>
  );
}