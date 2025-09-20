// src/features/sales/components/OrderManagement/KitchenDisplaySystem.tsx
// 🚀 KITCHEN DISPLAY SYSTEM - Real-time Order Management for Kitchen Staff
import { useState, useMemo } from 'react';
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Grid,
  Progress,
  Alert,
  Select,
  createListCollection,
  Separator
} from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui';
import {
  FireIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import {
  type KitchenOrder,
  KitchenItemStatus,
  PriorityLevel,
  KITCHEN_STATIONS
} from '../../types';

interface KitchenDisplaySystemProps {
  orders: KitchenOrder[];
  onUpdateItemStatus: (orderId: string, itemId: string, status: KitchenItemStatus) => void;
  onCompleteOrder: (orderId: string) => void;
  onPriorityChange: (orderId: string, priority: PriorityLevel) => void;
  currentStation?: string;
  showAllStations?: boolean;
}

interface StationStats {
  station: string;
  activeOrders: number;
  pendingItems: number;
  averagePrepTime: number;
  backlogMinutes: number;
}

export function KitchenDisplaySystem({
  orders,
  onUpdateItemStatus,
  onCompleteOrder,
  onPriorityChange,
  currentStation = 'all',
  showAllStations = true
}: KitchenDisplaySystemProps) {
  const [selectedStation, setSelectedStation] = useState<string>(currentStation);
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'table'>('priority');
  const [showCompleted, setShowCompleted] = useState(false);
  console.log(orders)
  // Filter orders based on station
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by station
    if (!showAllStations && selectedStation !== 'all') {
      filtered = filtered.filter(order => 
        order.items.some(item => item.station === selectedStation)
      );
    }
  
    // Filter completed orders
    if (!showCompleted) {
      filtered = filtered.filter(order => 
        order.items.some(item => item.status !== KitchenItemStatus.SERVED)
      );
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { [PriorityLevel.VIP]: 3, [PriorityLevel.RUSH]: 2, [PriorityLevel.NORMAL]: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case 'time':
          return new Date(a.order_time).getTime() - new Date(b.order_time).getTime();
        case 'table':
          return (a.table_number || '').localeCompare(b.table_number || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, selectedStation, showAllStations, showCompleted, sortBy]);

  // Calculate station statistics
  const stationStats = useMemo((): StationStats[] => {
    const stats: Record<string, StationStats> = {};

    KITCHEN_STATIONS.forEach(station => {
      stats[station] = {
        station,
        activeOrders: 0,
        pendingItems: 0,
        averagePrepTime: 0,
        backlogMinutes: 0
      };
    });

    orders.forEach(order => {
      order.items.forEach(item => {
        if (stats[item.station]) {
          const stat = stats[item.station];
          
          if (item.status === KitchenItemStatus.PENDING || item.status === KitchenItemStatus.IN_PROGRESS) {
            stat.pendingItems++;
          }
          
          if (item.status !== KitchenItemStatus.SERVED) {
            stat.activeOrders++;
          }
        }
      });
    });

    return Object.values(stats);
  }, [orders]);

  // Station collection for select
  const stationCollection = createListCollection({
    items: [
      { value: 'all', label: 'All Stations' },
      ...KITCHEN_STATIONS.map(station => ({
        value: station,
        label: station.charAt(0).toUpperCase() + station.slice(1)
      }))
    ]
  });

  // Sort options
  const sortCollection = createListCollection({
    items: [
      { value: 'priority', label: 'Priority' },
      { value: 'time', label: 'Order Time' },
      { value: 'table', label: 'Table Number' }
    ]
  });

  // Get priority color
  const getPriorityColor = (priority: PriorityLevel) => {
    switch (priority) {
      case PriorityLevel.VIP: return 'purple';
      case PriorityLevel.RUSH: return 'red';
      case PriorityLevel.NORMAL: return 'blue';
      default: return 'gray';
    }
  };

  // Get item status color
  const getItemStatusColor = (status: KitchenItemStatus) => {
    switch (status) {
      case KitchenItemStatus.PENDING: return 'gray';
      case KitchenItemStatus.IN_PROGRESS: return 'yellow';
      case KitchenItemStatus.READY: return 'green';
      case KitchenItemStatus.SERVED: return 'blue';
      default: return 'gray';
    }
  };

  // Calculate order timing
  const getOrderTiming = (order: KitchenOrder) => {
    const orderTime = new Date(order.order_time);
    const now = new Date();
    const elapsedMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    const estimatedTime = new Date(order.estimated_ready_time);
    const remainingMinutes = Math.floor((estimatedTime.getTime() - now.getTime()) / (1000 * 60));
    
    return {
      elapsedMinutes,
      remainingMinutes,
      isOverdue: remainingMinutes < 0,
      progressPercentage: Math.min(100, (elapsedMinutes / (elapsedMinutes + Math.max(0, remainingMinutes))) * 100)
    };
  };

  // Handle item action
  const handleItemAction = (orderId: string, itemId: string, currentStatus: KitchenItemStatus) => {
    let nextStatus: KitchenItemStatus;
    
    switch (currentStatus) {
      case KitchenItemStatus.PENDING:
        nextStatus = KitchenItemStatus.IN_PROGRESS;
        break;
      case KitchenItemStatus.IN_PROGRESS:
        nextStatus = KitchenItemStatus.READY;
        break;
      case KitchenItemStatus.READY:
        nextStatus = KitchenItemStatus.SERVED;
        break;
      default:
        return;
    }
    
    onUpdateItemStatus(orderId, itemId, nextStatus);
  };

  // Get action button text
  const getActionButtonText = (status: KitchenItemStatus) => {
    switch (status) {
      case KitchenItemStatus.PENDING: return 'Start';
      case KitchenItemStatus.IN_PROGRESS: return 'Ready';
      case KitchenItemStatus.READY: return 'Served';
      default: return '';
    }
  };

  return (
    <VStack gap="6" align="stretch">
      {/* Header & Controls */}
      <CardWrapper p="4">
        <HStack justify="space-between" align="center" wrap="wrap" gap="4">
          <VStack align="start" gap="1">
            <Text fontSize="xl" fontWeight="bold">Kitchen Display System</Text>
            <Text color="gray.600" fontSize="sm">
              {filteredOrders.length} active orders • {stationStats.reduce((sum, s) => sum + s.pendingItems, 0)} pending items
            </Text>
          </VStack>

          <HStack gap="3" wrap="wrap">
            {showAllStations && (
              <Select.Root
                collection={stationCollection}
                value={[selectedStation]}
                onValueChange={(details) => setSelectedStation(details.value[0])}
                size="sm"
                width="150px"
              >
                <Select.Trigger>
                  <Select.ValueText placeholder="Station" />
                </Select.Trigger>
                <Select.Content>
                  {stationCollection.items.map((station) => (
                    <Select.Item key={station.value} item={station}>
                      {station.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            )}

            <Select.Root
              collection={sortCollection}
              value={[sortBy]}
              onValueChange={(details) => setSortBy(details.value[0] as 'priority' | 'time' | 'table')}
              size="sm"
              width="120px"
            >
              <Select.Trigger>
                <Select.ValueText placeholder="Sort by" />
              </Select.Trigger>
              <Select.Content>
                {sortCollection.items.map((sort) => (
                  <Select.Item key={sort.value} item={sort}>
                    {sort.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Button
              variant={showCompleted ? "solid" : "outline"}
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? 'Hide' : 'Show'} Completed
            </Button>
          </HStack>
        </HStack>
      </CardWrapper>

      {/* Station Statistics */}
      {showAllStations && (
        <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }} gap="3">
          {stationStats.map((stat) => (
            <CardWrapper key={stat.station} p="3" size="sm">
              <VStack gap="2" align="center">
                <Text fontWeight="bold" fontSize="sm" textTransform="capitalize">
                  {stat.station}
                </Text>
                <VStack gap="1" align="center">
                  <Text fontSize="xs" color="gray.600">Pending Items</Text>
                  <Badge 
                    colorPalette={stat.pendingItems > 5 ? 'red' : stat.pendingItems > 2 ? 'yellow' : 'green'}
                    size="sm"
                  >
                    {stat.pendingItems}
                  </Badge>
                </VStack>
              </VStack>
            </CardWrapper>
          ))}
        </Grid>
      )}

      {/* Kitchen Orders */}
      <Grid 
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} 
        gap={{ base: "3", md: "4" }}
        role="grid"
        aria-label="Kitchen orders display"
      >
        {filteredOrders.map((order) => {
          const timing = getOrderTiming(order);
          const priorityColor = getPriorityColor(order.priority);
          
          return (
            <CardWrapper
              key={order.order_id}
              p={{ base: "3", md: "4" }}
              borderWidth="2px"
              borderColor={timing.isOverdue ? 'red.300' : 'gray.200'}
              bg={timing.isOverdue ? 'red.50' : 'white'}
              role="gridcell"
              aria-label={`Order ${order.order_number}, ${timing.isOverdue ? 'overdue' : 'on time'}, ${order.items.length} items`}
            >
              <VStack gap="4" align="stretch">
                {/* Order Header */}
                <HStack justify="space-between" align="center">
                  <VStack align="start" gap="0">
                    <HStack gap="2">
                      <Text fontWeight="bold" fontSize="lg">
                        Order #{order.order_number}
                      </Text>
                      <Badge colorPalette={priorityColor} size="sm">
                        {order.priority && order.priority.toUpperCase()}
                      </Badge>
                    </HStack>
                    {order.table_number && (
                      <Text fontSize="sm" color="gray.600">
                        Table {order.table_number}
                      </Text>
                    )}
                  </VStack>

                  <VStack align="end" gap="0">
                    <Text fontSize="sm" fontWeight="medium">
                      {timing.elapsedMinutes}m elapsed
                    </Text>
                    <Text 
                      fontSize="sm" 
                      color={timing.isOverdue ? 'red.600' : 'gray.600'}
                    >
                      {timing.isOverdue ? 
                        `${Math.abs(timing.remainingMinutes)}m overdue` : 
                        `${timing.remainingMinutes}m remaining`
                      }
                    </Text>
                  </VStack>
                </HStack>

                {/* Progress Bar */}
                <Box>
                  <Progress.Root 
                    value={timing.progressPercentage} 
                    size="sm"
                    colorPalette={timing.isOverdue ? 'red' : 'blue'}
                  />
                  <Text fontSize="xs" color="gray.500" mt="1">
                    {order.completion_percentage}% complete
                  </Text>
                </Box>

                {/* Special Instructions & Allergies */}
                {((order.special_instructions?.length || 0) > 0 || (order.allergy_warnings?.length || 0) > 0) && (
                  <VStack gap="2" align="stretch">
                    {(order.special_instructions?.length || 0) > 0 && (
                      <Alert.Root status="info" size="sm">
                        <Alert.Indicator />
                        <Alert.Title>Special Instructions</Alert.Title>
                        <Alert.Description>
                          {order.special_instructions?.join(', ') || ''}
                        </Alert.Description>
                      </Alert.Root>
                    )}
                    
                    {(order.allergy_warnings?.length || 0) > 0 && (
                      <Alert.Root status="warning" size="sm">
                        <Alert.Indicator />
                        <Alert.Title>Allergy Warnings</Alert.Title>
                        <Alert.Description>
                          {order.allergy_warnings?.join(', ') || ''}
                        </Alert.Description>
                      </Alert.Root>
                    )}
                  </VStack>
                )}

                {/* Order Items */}
                <VStack gap="3" align="stretch">
                  {order.items
                    .filter(item => selectedStation === 'all' || item.station === selectedStation)
                    .map((item) => {
                      const statusColor = getItemStatusColor(item.status);
                      
                      return (
                        <CardWrapper key={item.item_id} p="3" variant="outline" size="sm">
                          <VStack gap="2" align="stretch">
                            <HStack justify="space-between" align="center">
                              <VStack align="start" gap="0">
                                <Text fontWeight="medium">
                                  {item.quantity}x {item.product_name}
                                </Text>
                                <Text fontSize="xs" color="gray.600" textTransform="capitalize">
                                  {item.station} • ~{item.estimated_prep_time}m
                                </Text>
                              </VStack>
                              
                              <Badge colorPalette={statusColor} size="sm">
                                {item.status?.replace('_', ' ') || 'Unknown'}
                              </Badge>
                            </HStack>

                            {/* Item Modifications */}
                            {(item.modifications?.length || 0) > 0 && (
                              <Box p="2" bg="bg.canvas" borderRadius="sm">
                                <Text fontSize="xs" fontWeight="medium" mb="1">Modifications:</Text>
                                {(item.modifications || []).map((mod, idx) => (
                                  <Text key={idx} fontSize="xs" color="gray.600">
                                    • {mod.description}
                                  </Text>
                                ))}
                              </Box>
                            )}

                            {/* Special Instructions */}
                            {item.special_instructions && (
                              <Text fontSize="xs" color="blue.600" fontStyle="italic">
                                Note: {item.special_instructions}
                              </Text>
                            )}

                            {/* Allergy Warnings */}
                            {(item.allergy_warnings?.length || 0) > 0 && (
                              <HStack gap="1" wrap="wrap">
                                <ExclamationTriangleIcon className="w-3 h-3 text-red-500" />
                                <Text fontSize="xs" color="red.600" fontWeight="medium">
                                  Allergies: {item.allergy_warnings?.join(', ') || ''}
                                </Text>
                              </HStack>
                            )}

                            {/* Action Button */}
                            {item.status !== KitchenItemStatus.SERVED && (
                              <Button
                                size={{ base: "md", md: "sm" }}
                                colorPalette={
                                  item.status === KitchenItemStatus.PENDING ? 'blue' :
                                  item.status === KitchenItemStatus.IN_PROGRESS ? 'green' :
                                  'purple'
                                }
                                onClick={() => handleItemAction(order.order_id, item.item_id, item.status)}
                                variant={item.status === KitchenItemStatus.READY ? 'solid' : 'outline'}
                                aria-label={`${getActionButtonText(item.status)} ${item.product_name}`}
                              >
                                {item.status === KitchenItemStatus.PENDING && <PlayIcon className="w-3 h-3" />}
                                {item.status === KitchenItemStatus.IN_PROGRESS && <CheckCircleIcon className="w-3 h-3" />}
                                {item.status === KitchenItemStatus.READY && <CheckCircleIcon className="w-3 h-3" />}
                                {getActionButtonText(item.status)}
                              </Button>
                            )}
                          </VStack>
                        </CardWrapper>
                      );
                    })}
                </VStack>

                {/* Order Actions */}
                <Separator />
                <HStack gap="2" justify="space-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPriorityChange(order.order_id, 
                      order.priority === PriorityLevel.RUSH ? PriorityLevel.NORMAL : PriorityLevel.RUSH
                    )}
                    colorPalette={order.priority === PriorityLevel.RUSH ? 'gray' : 'red'}
                  >
                    <FireIcon className="w-3 h-3" />
                    {order.priority === PriorityLevel.RUSH ? 'Normal' : 'Rush'}
                  </Button>

                  {order.items.every(item => item.status === KitchenItemStatus.READY) && (
                    <Button
                      colorPalette="green"
                      size="sm"
                      onClick={() => onCompleteOrder(order.order_id)}
                    >
                      <CheckCircleIcon className="w-3 h-3" />
                      Order Ready
                    </Button>
                  )}
                </HStack>
              </VStack>
            </CardWrapper>
          );
        })}
      </Grid>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <CardWrapper p="8" textAlign="center">
          <VStack gap="3">
            <CheckCircleIcon className="w-12 h-12 text-green-500" />
            <Text fontSize="lg" fontWeight="medium">All caught up!</Text>
            <Text color="gray.600">
              {showCompleted ? 'No orders to display' : 'No pending orders in the kitchen'}
            </Text>
          </VStack>
        </CardWrapper>
      )}
    </VStack>
  );
}