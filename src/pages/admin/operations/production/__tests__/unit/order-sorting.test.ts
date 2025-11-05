import { describe, it, expect } from 'vitest';

/**
 * Order Sorting Algorithm Tests
 * Tests sorting logic for Kitchen Display System
 */

// Priority levels from types
enum PriorityLevel {
  VIP = 'VIP',
  RUSH = 'RUSH',
  NORMAL = 'NORMAL'
}

interface KitchenOrder {
  id: string;
  priority: PriorityLevel;
  order_time: string;
  table_number?: string;
}

// Sorting functions extracted from KitchenDisplay logic
export function sortOrdersByPriority(orders: KitchenOrder[]): KitchenOrder[] {
  const priorityOrder = {
    [PriorityLevel.VIP]: 3,
    [PriorityLevel.RUSH]: 2,
    [PriorityLevel.NORMAL]: 1
  };

  return [...orders].sort((a, b) =>
    priorityOrder[b.priority] - priorityOrder[a.priority]
  );
}

export function sortOrdersByTime(orders: KitchenOrder[]): KitchenOrder[] {
  return [...orders].sort((a, b) =>
    new Date(a.order_time).getTime() - new Date(b.order_time).getTime()
  );
}

export function sortOrdersByTable(orders: KitchenOrder[]): KitchenOrder[] {
  return [...orders].sort((a, b) =>
    (a.table_number || '').localeCompare(b.table_number || '')
  );
}

describe('Order Sorting Algorithms', () => {
  describe('sortOrdersByPriority', () => {
    it('should sort by priority: VIP > RUSH > NORMAL', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        { id: '1', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:00:00' },
        { id: '2', priority: PriorityLevel.VIP, order_time: '2025-01-14T10:00:00' },
        { id: '3', priority: PriorityLevel.RUSH, order_time: '2025-01-14T10:00:00' },
        { id: '4', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:00:00' }
      ];

      // Act
      const sorted = sortOrdersByPriority(orders);

      // Assert
      expect(sorted[0].priority).toBe(PriorityLevel.VIP);
      expect(sorted[1].priority).toBe(PriorityLevel.RUSH);
      expect(sorted[2].priority).toBe(PriorityLevel.NORMAL);
      expect(sorted[3].priority).toBe(PriorityLevel.NORMAL);
    });

    it('should handle all same priority', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        { id: '1', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:00:00' },
        { id: '2', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:05:00' },
        { id: '3', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:10:00' }
      ];

      // Act
      const sorted = sortOrdersByPriority(orders);

      // Assert
      expect(sorted).toHaveLength(3);
      sorted.forEach(order => {
        expect(order.priority).toBe(PriorityLevel.NORMAL);
      });
    });

    it('should not mutate original array', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        { id: '1', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:00:00' },
        { id: '2', priority: PriorityLevel.VIP, order_time: '2025-01-14T10:00:00' }
      ];
      const originalFirstId = orders[0].id;

      // Act
      sortOrdersByPriority(orders);

      // Assert
      expect(orders[0].id).toBe(originalFirstId);
    });
  });

  describe('sortOrdersByTime', () => {
    it('should sort by time with oldest first (FIFO)', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        { id: '1', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:30:00' },
        { id: '2', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:15:00' },
        { id: '3', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:45:00' }
      ];

      // Act
      const sorted = sortOrdersByTime(orders);

      // Assert
      expect(sorted[0].id).toBe('2'); // 10:15
      expect(sorted[1].id).toBe('1'); // 10:30
      expect(sorted[2].id).toBe('3'); // 10:45
    });

    it('should handle same timestamps', () => {
      // Arrange
      const sameTime = '2025-01-14T10:00:00';
      const orders: KitchenOrder[] = [
        { id: '1', priority: PriorityLevel.NORMAL, order_time: sameTime },
        { id: '2', priority: PriorityLevel.NORMAL, order_time: sameTime }
      ];

      // Act
      const sorted = sortOrdersByTime(orders);

      // Assert
      expect(sorted).toHaveLength(2);
    });

    it('should handle cross-day timestamps', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        { id: '1', priority: PriorityLevel.NORMAL, order_time: '2025-01-15T00:30:00' },
        { id: '2', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T23:45:00' }
      ];

      // Act
      const sorted = sortOrdersByTime(orders);

      // Assert
      expect(sorted[0].id).toBe('2'); // Yesterday
      expect(sorted[1].id).toBe('1'); // Today
    });
  });

  describe('sortOrdersByTable', () => {
    it('should sort by table number alphanumerically', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        { id: '1', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:00:00', table_number: '10' },
        { id: '2', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:00:00', table_number: '1' },
        { id: '3', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:00:00', table_number: '5' }
      ];

      // Act
      const sorted = sortOrdersByTable(orders);

      // Assert
      expect(sorted[0].table_number).toBe('1');
      expect(sorted[1].table_number).toBe('10');
      expect(sorted[2].table_number).toBe('5');
    });

    it('should handle missing table numbers', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        { id: '1', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:00:00', table_number: '5' },
        { id: '2', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:00:00' },
        { id: '3', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:00:00', table_number: '3' }
      ];

      // Act
      const sorted = sortOrdersByTable(orders);

      // Assert
      expect(sorted[0].table_number).toBeUndefined(); // Empty string sorts first
      expect(sorted[1].table_number).toBe('3');
      expect(sorted[2].table_number).toBe('5');
    });

    it('should handle alphanumeric table names', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        { id: '1', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:00:00', table_number: 'B2' },
        { id: '2', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:00:00', table_number: 'A1' },
        { id: '3', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:00:00', table_number: 'C3' }
      ];

      // Act
      const sorted = sortOrdersByTable(orders);

      // Assert
      expect(sorted[0].table_number).toBe('A1');
      expect(sorted[1].table_number).toBe('B2');
      expect(sorted[2].table_number).toBe('C3');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty array', () => {
      // Arrange
      const orders: KitchenOrder[] = [];

      // Act & Assert
      expect(sortOrdersByPriority(orders)).toEqual([]);
      expect(sortOrdersByTime(orders)).toEqual([]);
      expect(sortOrdersByTable(orders)).toEqual([]);
    });

    it('should handle single order', () => {
      // Arrange
      const orders: KitchenOrder[] = [
        { id: '1', priority: PriorityLevel.NORMAL, order_time: '2025-01-14T10:00:00', table_number: '1' }
      ];

      // Act & Assert
      expect(sortOrdersByPriority(orders)).toHaveLength(1);
      expect(sortOrdersByTime(orders)).toHaveLength(1);
      expect(sortOrdersByTable(orders)).toHaveLength(1);
    });
  });
});
