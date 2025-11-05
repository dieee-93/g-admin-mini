import { describe, it, expect } from 'vitest';

/**
 * Station Filtering Tests
 * Tests filtering logic for Kitchen Display System
 */

enum KitchenItemStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  SERVED = 'SERVED'
}

enum PriorityLevel {
  VIP = 'VIP',
  RUSH = 'RUSH',
  NORMAL = 'NORMAL'
}

interface KitchenItem {
  id: string;
  name: string;
  station: string;
  status: KitchenItemStatus;
  quantity: number;
}

interface KitchenOrder {
  id: string;
  priority: PriorityLevel;
  order_time: string;
  items: KitchenItem[];
}

// Filtering functions extracted from KitchenDisplay logic
export function filterOrdersByStation(
  orders: KitchenOrder[],
  station: string
): KitchenOrder[] {
  if (station === 'all') {
    return orders;
  }

  return orders.filter(order =>
    order.items.some(item => item.station === station)
  );
}

export function filterCompletedOrders(
  orders: KitchenOrder[],
  showCompleted: boolean
): KitchenOrder[] {
  if (showCompleted) {
    return orders;
  }

  return orders.filter(order =>
    order.items.some(item => item.status !== KitchenItemStatus.SERVED)
  );
}

describe('Station Filtering', () => {
  describe('filterOrdersByStation', () => {
    it('should filter orders by single station', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        {
          id: '1',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:00:00',
          items: [
            { id: 'item-1', name: 'Burger', station: 'grill', status: KitchenItemStatus.PENDING, quantity: 1 },
            { id: 'item-2', name: 'Salad', station: 'salad', status: KitchenItemStatus.PENDING, quantity: 1 }
          ]
        },
        {
          id: '2',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:05:00',
          items: [
            { id: 'item-3', name: 'Fries', station: 'fryer', status: KitchenItemStatus.PENDING, quantity: 1 }
          ]
        },
        {
          id: '3',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:10:00',
          items: [
            { id: 'item-4', name: 'Steak', station: 'grill', status: KitchenItemStatus.PENDING, quantity: 1 }
          ]
        }
      ];

      // Act
      const filtered = filterOrdersByStation(orders, 'grill');

      // Assert
      expect(filtered).toHaveLength(2);
      expect(filtered[0].id).toBe('1');
      expect(filtered[1].id).toBe('3');
    });

    it('should return all orders when station is "all"', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        {
          id: '1',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:00:00',
          items: [
            { id: 'item-1', name: 'Burger', station: 'grill', status: KitchenItemStatus.PENDING, quantity: 1 }
          ]
        },
        {
          id: '2',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:05:00',
          items: [
            { id: 'item-2', name: 'Fries', station: 'fryer', status: KitchenItemStatus.PENDING, quantity: 1 }
          ]
        }
      ];

      // Act
      const filtered = filterOrdersByStation(orders, 'all');

      // Assert
      expect(filtered).toHaveLength(2);
    });

    it('should return empty array when no orders match station', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        {
          id: '1',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:00:00',
          items: [
            { id: 'item-1', name: 'Burger', station: 'grill', status: KitchenItemStatus.PENDING, quantity: 1 }
          ]
        }
      ];

      // Act
      const filtered = filterOrdersByStation(orders, 'dessert');

      // Assert
      expect(filtered).toHaveLength(0);
    });

    it('should include orders with multi-station items', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        {
          id: '1',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:00:00',
          items: [
            { id: 'item-1', name: 'Burger', station: 'grill', status: KitchenItemStatus.PENDING, quantity: 1 },
            { id: 'item-2', name: 'Fries', station: 'fryer', status: KitchenItemStatus.PENDING, quantity: 1 },
            { id: 'item-3', name: 'Salad', station: 'salad', status: KitchenItemStatus.PENDING, quantity: 1 }
          ]
        }
      ];

      // Act
      const filtered = filterOrdersByStation(orders, 'grill');

      // Assert
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should handle empty orders array', () => {
      // Arrange
      const orders: KitchenOrder[] = [];

      // Act
      const filtered = filterOrdersByStation(orders, 'grill');

      // Assert
      expect(filtered).toHaveLength(0);
    });
  });

  describe('filterCompletedOrders', () => {
    it('should exclude completed orders when showCompleted is false', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        {
          id: '1',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:00:00',
          items: [
            { id: 'item-1', name: 'Burger', station: 'grill', status: KitchenItemStatus.SERVED, quantity: 1 }
          ]
        },
        {
          id: '2',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:05:00',
          items: [
            { id: 'item-2', name: 'Fries', station: 'fryer', status: KitchenItemStatus.PENDING, quantity: 1 }
          ]
        }
      ];

      // Act
      const filtered = filterCompletedOrders(orders, false);

      // Assert
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });

    it('should include all orders when showCompleted is true', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        {
          id: '1',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:00:00',
          items: [
            { id: 'item-1', name: 'Burger', station: 'grill', status: KitchenItemStatus.SERVED, quantity: 1 }
          ]
        },
        {
          id: '2',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:05:00',
          items: [
            { id: 'item-2', name: 'Fries', station: 'fryer', status: KitchenItemStatus.PENDING, quantity: 1 }
          ]
        }
      ];

      // Act
      const filtered = filterCompletedOrders(orders, true);

      // Assert
      expect(filtered).toHaveLength(2);
    });

    it('should include orders with partial completion', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        {
          id: '1',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:00:00',
          items: [
            { id: 'item-1', name: 'Burger', station: 'grill', status: KitchenItemStatus.SERVED, quantity: 1 },
            { id: 'item-2', name: 'Fries', station: 'fryer', status: KitchenItemStatus.PENDING, quantity: 1 }
          ]
        }
      ];

      // Act
      const filtered = filterCompletedOrders(orders, false);

      // Assert
      expect(filtered).toHaveLength(1); // Order still has pending items
    });

    it('should handle IN_PROGRESS items as active', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        {
          id: '1',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:00:00',
          items: [
            { id: 'item-1', name: 'Burger', station: 'grill', status: KitchenItemStatus.IN_PROGRESS, quantity: 1 }
          ]
        }
      ];

      // Act
      const filtered = filterCompletedOrders(orders, false);

      // Assert
      expect(filtered).toHaveLength(1);
    });

    it('should handle READY items as active', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        {
          id: '1',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:00:00',
          items: [
            { id: 'item-1', name: 'Burger', station: 'grill', status: KitchenItemStatus.READY, quantity: 1 }
          ]
        }
      ];

      // Act
      const filtered = filterCompletedOrders(orders, false);

      // Assert
      expect(filtered).toHaveLength(1);
    });
  });

  describe('Combined filtering', () => {
    it('should filter by station AND exclude completed', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        {
          id: '1',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:00:00',
          items: [
            { id: 'item-1', name: 'Burger', station: 'grill', status: KitchenItemStatus.PENDING, quantity: 1 }
          ]
        },
        {
          id: '2',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:05:00',
          items: [
            { id: 'item-2', name: 'Steak', station: 'grill', status: KitchenItemStatus.SERVED, quantity: 1 }
          ]
        },
        {
          id: '3',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:10:00',
          items: [
            { id: 'item-3', name: 'Fries', station: 'fryer', status: KitchenItemStatus.PENDING, quantity: 1 }
          ]
        }
      ];

      // Act
      const filteredByStation = filterOrdersByStation(orders, 'grill');
      const finalFiltered = filterCompletedOrders(filteredByStation, false);

      // Assert
      expect(finalFiltered).toHaveLength(1);
      expect(finalFiltered[0].id).toBe('1');
    });

    it('should handle empty result from combined filters', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        {
          id: '1',
          priority: PriorityLevel.NORMAL,
          order_time: '2025-01-14T10:00:00',
          items: [
            { id: 'item-1', name: 'Burger', station: 'grill', status: KitchenItemStatus.SERVED, quantity: 1 }
          ]
        }
      ];

      // Act
      const filteredByStation = filterOrdersByStation(orders, 'grill');
      const finalFiltered = filterCompletedOrders(filteredByStation, false);

      // Assert
      expect(finalFiltered).toHaveLength(0);
    });
  });
});
