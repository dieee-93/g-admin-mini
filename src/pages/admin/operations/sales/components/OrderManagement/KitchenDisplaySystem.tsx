// src/features/sales/components/OrderManagement/KitchenDisplaySystem.tsx
// 🚀 KITCHEN DISPLAY SYSTEM - Real-time Order Management for Kitchen Staff
import { useState, useMemo } from 'react';
import {
  Text,
  VStack,
  Grid,
  CardWrapper
} from '@/shared/ui';
import { logger } from '@/lib/logging';
import {
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  type KitchenOrder,
  KitchenItemStatus,
  PriorityLevel,
  KITCHEN_STATIONS
} from '../../types';
import { KitchenHeader } from './Kitchen/KitchenHeader';
import { KitchenStationStats, type StationStats } from './Kitchen/KitchenStationStats';
import { KitchenOrderCard } from './Kitchen/KitchenOrderCard';

interface KitchenDisplaySystemProps {
  orders: KitchenOrder[];
  onUpdateItemStatus: (orderId: string, itemId: string, status: KitchenItemStatus) => void;
  onCompleteOrder: (orderId: string) => void;
  onPriorityChange: (orderId: string, priority: PriorityLevel) => void;
  currentStation?: string;
  showAllStations?: boolean;
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
  
  logger.info('SalesStore', 'Orders loaded', orders)

  // Filter orders based on station
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by station
    if (!showAllStations && selectedStation !== 'all') {
      filtered = filtered.filter(order =>
        order.items.some(item => item.station === selectedStation));
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

  return (
    <VStack gap="6" align="stretch">
      {/* Header & Controls */}
      <KitchenHeader
        activeOrdersCount={filteredOrders.length}
        pendingItemsCount={stationStats.reduce((sum, s) => sum + s.pendingItems, 0)}
        showAllStations={showAllStations}
        selectedStation={selectedStation}
        onSelectStation={setSelectedStation}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showCompleted={showCompleted}
        onToggleCompleted={() => setShowCompleted(!showCompleted)}
      />

      {/* Station Statistics */}
      {showAllStations && (
        <KitchenStationStats stats={stationStats} />
      )}

      {/* Kitchen Orders */}
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }}
        gap={{ base: "3", md: "4" }}
        role="grid"
        aria-label="Kitchen orders display"
      >
        {filteredOrders.map((order) => (
          <KitchenOrderCard
            key={order.order_id}
            order={order}
            selectedStation={selectedStation}
            onUpdateItemStatus={onUpdateItemStatus}
            onPriorityChange={onPriorityChange}
            onCompleteOrder={onCompleteOrder}
          />
        ))}
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