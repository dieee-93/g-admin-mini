import { describe, it, expect } from 'vitest';
import { StockCalculations } from '../stockCalculations';
import { MaterialItem, MeasurableItem, CountableItem, ElaboratedItem } from '../../types';

describe('StockCalculations', () => {
  const createMockItem = (type: 'MEASURABLE' | 'COUNTABLE' | 'ELABORATED', stock: number): MaterialItem => {
    const base = {
      id: '1',
      name: 'Test Item',
      stock,
      unit_cost: 10,
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    };

    switch (type) {
      case 'MEASURABLE':
        return {
          ...base,
          type: 'MEASURABLE',
          unit: 'kg',
          category: 'weight',
          precision: 2
        } as MeasurableItem;
      case 'COUNTABLE':
        return {
          ...base,
          type: 'COUNTABLE',
          unit: 'unidad'
        } as CountableItem;
      case 'ELABORATED':
        return {
          ...base,
          type: 'ELABORATED',
          unit: 'porción',
          requires_production: true,
          auto_calculate_cost: true,
          ingredients_available: false
        } as ElaboratedItem;
    }
  };

  describe('getMinStock', () => {
    it('should return correct minimum stock for each type', () => {
      const measurable = createMockItem('MEASURABLE', 50);
      const countable = createMockItem('COUNTABLE', 50);
      const elaborated = createMockItem('ELABORATED', 50);

      expect(StockCalculations.getMinStock(measurable)).toBe(20);
      expect(StockCalculations.getMinStock(countable)).toBe(10);
      expect(StockCalculations.getMinStock(elaborated)).toBe(5);
    });
  });

  describe('getCriticalStock', () => {
    it('should calculate critical stock as 30% of minimum', () => {
      const measurable = createMockItem('MEASURABLE', 50);
      const countable = createMockItem('COUNTABLE', 50);
      const elaborated = createMockItem('ELABORATED', 50);

      expect(StockCalculations.getCriticalStock(measurable)).toBe(6); // ceil(20 * 0.3)
      expect(StockCalculations.getCriticalStock(countable)).toBe(3);   // ceil(10 * 0.3)
      expect(StockCalculations.getCriticalStock(elaborated)).toBe(2);  // ceil(5 * 0.3)
    });
  });

  describe('getStockStatus', () => {
    it('should return "out" for zero or negative stock', () => {
      const item = createMockItem('COUNTABLE', 0);
      expect(StockCalculations.getStockStatus(item)).toBe('out');

      item.stock = -5;
      expect(StockCalculations.getStockStatus(item)).toBe('out');
    });

    it('should return "critical" for stock at or below critical threshold', () => {
      const item = createMockItem('COUNTABLE', 3); // critical is 3 for countable
      expect(StockCalculations.getStockStatus(item)).toBe('critical');

      item.stock = 2;
      expect(StockCalculations.getStockStatus(item)).toBe('critical');
    });

    it('should return "low" for stock at or below minimum threshold', () => {
      const item = createMockItem('COUNTABLE', 10); // min is 10 for countable
      expect(StockCalculations.getStockStatus(item)).toBe('low');

      item.stock = 8;
      expect(StockCalculations.getStockStatus(item)).toBe('low');
    });

    it('should return "ok" for stock above minimum threshold', () => {
      const item = createMockItem('COUNTABLE', 15);
      expect(StockCalculations.getStockStatus(item)).toBe('ok');
    });
  });

  describe('getDisplayUnit', () => {
    it('should return correct unit for MEASURABLE items', () => {
      const item = createMockItem('MEASURABLE', 50) as MeasurableItem;
      item.unit = 'kg';
      expect(StockCalculations.getDisplayUnit(item)).toBe('kg');
    });

    it('should return packaging unit for COUNTABLE items', () => {
      const item = createMockItem('COUNTABLE', 50) as CountableItem;
      item.packaging = {
        package_size: 12,
        package_unit: 'docena',
        display_mode: 'individual'
      };
      expect(StockCalculations.getDisplayUnit(item)).toBe('docena');
    });

    it('should return "unidad" for COUNTABLE items without packaging', () => {
      const item = createMockItem('COUNTABLE', 50);
      expect(StockCalculations.getDisplayUnit(item)).toBe('unidad');
    });

    it('should return unit for ELABORATED items', () => {
      const item = createMockItem('ELABORATED', 50) as ElaboratedItem;
      item.unit = 'porción';
      expect(StockCalculations.getDisplayUnit(item)).toBe('porción');
    });
  });

  describe('getTotalValue', () => {
    it('should calculate total value correctly', () => {
      const item = createMockItem('COUNTABLE', 10);
      item.unit_cost = 15.5;
      
      expect(StockCalculations.getTotalValue(item)).toBe(155);
    });

    it('should handle zero or undefined values', () => {
      const item = createMockItem('COUNTABLE', 0);
      expect(StockCalculations.getTotalValue(item)).toBe(0);

      item.stock = 10;
      item.unit_cost = undefined;
      expect(StockCalculations.getTotalValue(item)).toBe(0);
    });
  });

  describe('getSuggestedReorderQuantity', () => {
    it('should suggest quantity to reach 2x minimum stock', () => {
      const item = createMockItem('COUNTABLE', 3); // min is 10, current is 3
      // target is 20, needed is 17, rounded to 20
      expect(StockCalculations.getSuggestedReorderQuantity(item)).toBe(20);
    });

    it('should return 0 if stock is already above target', () => {
      const item = createMockItem('COUNTABLE', 25); // already above 2x minimum (20)
      expect(StockCalculations.getSuggestedReorderQuantity(item)).toBe(0);
    });

    it('should round to full packages for COUNTABLE items with packaging', () => {
      const item = createMockItem('COUNTABLE', 3) as CountableItem;
      item.packaging = { package_size: 6, package_unit: 'pack', display_mode: 'individual' };
      
      // needed: 17, rounded up to next package: ceil(17/6) * 6 = 18
      expect(StockCalculations.getSuggestedReorderQuantity(item)).toBe(18);
    });

    it('should round to nearest 5 for ELABORATED items', () => {
      const item = createMockItem('ELABORATED', 1); // min is 5, current is 1
      // target is 10, needed is 9, rounded to 10
      expect(StockCalculations.getSuggestedReorderQuantity(item)).toBe(10);
    });
  });

  describe('getStatusColor', () => {
    it('should return correct colors for each status', () => {
      expect(StockCalculations.getStatusColor('ok')).toBe('green.500');
      expect(StockCalculations.getStatusColor('low')).toBe('yellow.400');
      expect(StockCalculations.getStatusColor('critical')).toBe('orange.600');
      expect(StockCalculations.getStatusColor('out')).toBe('red.600');
    });
  });

  describe('getStatusLabel', () => {
    it('should return correct labels for each status', () => {
      expect(StockCalculations.getStatusLabel('ok')).toBe('Stock Normal');
      expect(StockCalculations.getStatusLabel('low')).toBe('Stock Bajo');
      expect(StockCalculations.getStatusLabel('critical')).toBe('Stock Crítico');
      expect(StockCalculations.getStatusLabel('out')).toBe('Sin Stock');
    });
  });

  describe('filtering methods', () => {
    const items = [
      createMockItem('COUNTABLE', 0),  // out
      createMockItem('COUNTABLE', 2),  // critical
      createMockItem('COUNTABLE', 8),  // low
      createMockItem('COUNTABLE', 15)  // ok
    ];

    it('should filter by status correctly', () => {
      expect(StockCalculations.filterByStatus(items, 'out')).toHaveLength(1);
      expect(StockCalculations.filterByStatus(items, 'critical')).toHaveLength(1);
      expect(StockCalculations.filterByStatus(items, 'low')).toHaveLength(1);
      expect(StockCalculations.filterByStatus(items, 'ok')).toHaveLength(1);
    });

    it('should get low stock items (low + critical)', () => {
      const lowStock = StockCalculations.getLowStockItems(items);
      expect(lowStock).toHaveLength(2);
    });

    it('should get critical stock items (critical + out)', () => {
      const criticalStock = StockCalculations.getCriticalStockItems(items);
      expect(criticalStock).toHaveLength(2);
    });

    it('should get out of stock items', () => {
      const outOfStock = StockCalculations.getOutOfStockItems(items);
      expect(outOfStock).toHaveLength(1);
    });
  });

  describe('getStockStatistics', () => {
    const items = [
      createMockItem('COUNTABLE', 0),   // out, value: 0
      createMockItem('COUNTABLE', 2),   // critical, value: 20
      createMockItem('COUNTABLE', 8),   // low, value: 80
      createMockItem('COUNTABLE', 15)   // ok, value: 150
    ];

    it('should calculate statistics correctly', () => {
      const stats = StockCalculations.getStockStatistics(items);

      expect(stats.total).toBe(4);
      expect(stats.ok).toBe(1);
      expect(stats.low).toBe(1);
      expect(stats.critical).toBe(1);
      expect(stats.out).toBe(1);
      expect(stats.totalValue).toBe(250);
      expect(stats.averageStock).toBe(6.25); // (0+2+8+15)/4
    });
  });

  describe('needsReordering', () => {
    it('should identify items that need reordering', () => {
      expect(StockCalculations.needsReordering(createMockItem('COUNTABLE', 0))).toBe(true);   // out
      expect(StockCalculations.needsReordering(createMockItem('COUNTABLE', 2))).toBe(true);   // critical
      expect(StockCalculations.needsReordering(createMockItem('COUNTABLE', 8))).toBe(true);   // low
      expect(StockCalculations.needsReordering(createMockItem('COUNTABLE', 15))).toBe(false); // ok
    });
  });

  describe('getReorderPriority', () => {
    it('should assign correct priorities', () => {
      expect(StockCalculations.getReorderPriority(createMockItem('COUNTABLE', 0))).toBe(5);   // out
      expect(StockCalculations.getReorderPriority(createMockItem('COUNTABLE', 2))).toBe(4);   // critical
      expect(StockCalculations.getReorderPriority(createMockItem('COUNTABLE', 8))).toBe(3);   // low
      expect(StockCalculations.getReorderPriority(createMockItem('COUNTABLE', 15))).toBe(1);  // ok
    });
  });
});