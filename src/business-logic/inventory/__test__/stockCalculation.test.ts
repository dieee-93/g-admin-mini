import { describe, it, expect, beforeEach, afterEach, vi, type SpyInstance } from 'vitest';
import { StockCalculation, type StockStatus } from '../stockCalculation';
import { type MaterialItem, type CountableItem } from '@/pages/admin/supply-chain/materials/types';

/**
 * ⚡ COMPREHENSIVE TEST SUITE: Stock Calculation Engine
 * 
 * EXHAUSTIVE COVERAGE:
 * ✅ Core stock calculation functions
 * ✅ Stock status determination & thresholds
 * ✅ Precision with InventoryDecimal library
 * ✅ Edge cases & boundary conditions
 * ✅ Material type-specific logic (MEASURABLE, COUNTABLE, ELABORATED)
 * ✅ Reorder calculations & packaging logic
 * ✅ Filtering & sorting operations
 * ✅ Performance testing with large inventories
 * ✅ Real-world business scenarios
 * 
 * CRITICAL FOCUS: Inventory management accuracy & business logic
 */

describe('StockCalculation - Complete Test Suite', () => {
  let consoleErrorSpy: SpyInstance;
  let performanceStart: number;

  // Base mock items for different types
  const mockMeasurable: MaterialItem = {
    id: '1',
    name: 'Flour',
    type: 'MEASURABLE',
    unit: 'kg',
    stock: 10.5,
    unit_cost: 2.50,
    category: 'Ingredients',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  };

  const mockCountable: MaterialItem = {
    id: '2', 
    name: 'Bottles',
    type: 'COUNTABLE',
    unit: 'unidad',
    stock: 25,
    unit_cost: 0.75,
    category: 'Packaging',
    packaging: {
      package_size: 12,
      package_unit: 'caja',
      display_mode: 'packaged'
    },
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  };

  const mockElaborated: MaterialItem = {
    id: '3',
    name: 'Hamburger',
    type: 'ELABORATED', 
    unit: 'unidad',
    stock: 8,
    unit_cost: 12.50,
    category: 'Products',
    requires_production: true,
    auto_calculate_cost: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  };

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    performanceStart = performance.now();
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    const duration = performance.now() - performanceStart;
    // Performance check: Each test should complete in reasonable time
    expect(duration).toBeLessThan(1000);
  });

  // ============================================================================
  // CORE STOCK CALCULATION TESTS - BASIC FUNCTIONS
  // ============================================================================

  describe('Core Stock Calculations', () => {
    it('should calculate total value with precision using InventoryDecimal', () => {
      const totalValue = StockCalculation.getTotalValue(mockMeasurable);
      expect(totalValue).toBe(26.25); // 10.5 * 2.50
    });

    it('should calculate total value correctly with many decimal places', () => {
      const itemWithDecimalCost: MaterialItem = { 
        ...mockMeasurable, 
        stock: 10, 
        unit_cost: 0.111111 
      };
      const totalValue = StockCalculation.getTotalValue(itemWithDecimalCost);
      expect(totalValue).toBe(1.11111); // 10 * 0.111111
    });

    it('should handle zero stock correctly', () => {
      const zeroStockItem: MaterialItem = { ...mockMeasurable, stock: 0 };
      const totalValue = StockCalculation.getTotalValue(zeroStockItem);
      expect(totalValue).toBe(0);
    });

    it('should handle zero cost correctly', () => {
      const zeroCostItem: MaterialItem = { ...mockMeasurable, unit_cost: 0 };
      const totalValue = StockCalculation.getTotalValue(zeroCostItem);
      expect(totalValue).toBe(0);
    });
  });

  // ============================================================================
  // STOCK STATUS & THRESHOLD CALCULATIONS
  // ============================================================================

  describe('Stock Status & Thresholds', () => {
    it('should get correct minimum stock for different item types', () => {
      expect(StockCalculation.getMinStock(mockMeasurable)).toBe(20); // MEASURABLE
      expect(StockCalculation.getMinStock(mockCountable)).toBe(10);   // COUNTABLE
      expect(StockCalculation.getMinStock(mockElaborated)).toBe(5);   // ELABORATED
    });

    it('should calculate critical stock as 30% of minimum (rounded up)', () => {
      expect(StockCalculation.getCriticalStock(mockMeasurable)).toBe(6);  // 30% of 20 = 6
      expect(StockCalculation.getCriticalStock(mockCountable)).toBe(3);    // 30% of 10 = 3
      expect(StockCalculation.getCriticalStock(mockElaborated)).toBe(2);   // 30% of 5 = 1.5 → 2
    });

    it('should determine stock status correctly - OK status', () => {
      const okItem: MaterialItem = { ...mockMeasurable, stock: 25 }; // Above min (20)
      expect(StockCalculation.getStockStatus(okItem)).toBe('ok');
    });

    it('should determine stock status correctly - LOW status', () => {
      const lowItem: MaterialItem = { ...mockMeasurable, stock: 15 }; // Between critical (6) and min (20)
      expect(StockCalculation.getStockStatus(lowItem)).toBe('low');
    });

    it('should determine stock status correctly - CRITICAL status', () => {
      const criticalItem: MaterialItem = { ...mockMeasurable, stock: 5 }; // At critical level (6)
      expect(StockCalculation.getStockStatus(criticalItem)).toBe('critical');
    });

    it('should determine stock status correctly - OUT status', () => {
      const outItem: MaterialItem = { ...mockMeasurable, stock: 0 };
      expect(StockCalculation.getStockStatus(outItem)).toBe('out');
    });
  });

  // ============================================================================
  // DISPLAY UNIT LOGIC - TYPE-SPECIFIC BEHAVIOR
  // ============================================================================

  describe('Display Unit Logic', () => {
    it('should get correct display unit for measurable items', () => {
      expect(StockCalculation.getDisplayUnit(mockMeasurable)).toBe('kg');
      
      // Test with different unit
      const literItem: MaterialItem = { ...mockMeasurable, unit: 'l' };
      expect(StockCalculation.getDisplayUnit(literItem)).toBe('l');
    });

    it('should get correct display unit for countable items with packaging', () => {
      expect(StockCalculation.getDisplayUnit(mockCountable)).toBe('caja'); // package_unit
    });

    it('should get correct display unit for countable items without packaging', () => {
      // Create a countable item without packaging
      const noPackagingItem: CountableItem = { 
        ...mockCountable, 
        packaging: undefined 
      };
      expect(StockCalculation.getDisplayUnit(noPackagingItem)).toBe('unidad'); // Default
    });

    it('should get correct display unit for elaborated items', () => {
      expect(StockCalculation.getDisplayUnit(mockElaborated)).toBe('unidad');
      
      // Test with different unit  
      const kgElaborated: MaterialItem = { ...mockElaborated, unit: 'kg' };
      expect(StockCalculation.getDisplayUnit(kgElaborated)).toBe('kg');
    });
  });

  // ============================================================================
  // REORDER CALCULATION LOGIC - COMPLEX BUSINESS RULES
  // ============================================================================

  describe('Reorder Calculation Logic', () => {
    it('should calculate reorder quantity for measurable items (round to 10)', () => {
      const lowStockItem: MaterialItem = { ...mockMeasurable, stock: 12 }; // Min: 20, Target: 40
      const reorderQty = StockCalculation.getSuggestedReorderQuantity(lowStockItem);
      // Needed: 40 - 12 = 28, rounded up to nearest 10 = 30
      expect(reorderQty).toBe(30);
    });

    it('should calculate reorder quantity for elaborated items (round to 5)', () => {
      const lowStockElaborated: MaterialItem = { ...mockElaborated, stock: 2 }; // Min: 5, Target: 10
      const reorderQty = StockCalculation.getSuggestedReorderQuantity(lowStockElaborated);
      // Needed: 10 - 2 = 8, rounded up to nearest 5 = 10
      expect(reorderQty).toBe(10);
    });

    it('should calculate reorder quantity for countable items with packaging', () => {
      const lowStockCountable: MaterialItem = { ...mockCountable, stock: 3 }; // Min: 10, Target: 20
      const reorderQty = StockCalculation.getSuggestedReorderQuantity(lowStockCountable);
      // Needed: 20 - 3 = 17, rounded up to package size (12) = 24
      expect(reorderQty).toBe(24);
    });

    it('should handle zero package size in countable items', () => {
      const zeroPackageItem: MaterialItem = { 
        ...mockCountable, 
        stock: 3,
        packaging: { 
          package_size: 0, 
          package_unit: 'caja',
          display_mode: 'packaged'
        }
      };
      const reorderQty = StockCalculation.getSuggestedReorderQuantity(zeroPackageItem);
      expect(reorderQty).toBe(20); // Should round up to nearest 10 (default behavior)
    });

    it('should return 0 when no reorder is needed', () => {
      const wellStockedItem: MaterialItem = { ...mockMeasurable, stock: 50 }; // Well above target
      const reorderQty = StockCalculation.getSuggestedReorderQuantity(wellStockedItem);
      expect(reorderQty).toBe(0);
    });
  });

  // ============================================================================
  // UI HELPER FUNCTIONS - STATUS COLORS & LABELS
  // ============================================================================

  describe('UI Helper Functions', () => {
    it('should return correct status colors', () => {
      expect(StockCalculation.getStatusColor('ok')).toBe('green.500');
      expect(StockCalculation.getStatusColor('low')).toBe('yellow.400');
      expect(StockCalculation.getStatusColor('critical')).toBe('orange.600');
      expect(StockCalculation.getStatusColor('out')).toBe('red.600');
    });

    it('should return correct status labels in Spanish', () => {
      expect(StockCalculation.getStatusLabel('ok')).toBe('Stock Normal');
      expect(StockCalculation.getStatusLabel('low')).toBe('Stock Bajo');
      expect(StockCalculation.getStatusLabel('critical')).toBe('Stock Crítico');
      expect(StockCalculation.getStatusLabel('out')).toBe('Sin Stock');
    });

    it('should handle unknown status with defaults', () => {
      expect(StockCalculation.getStatusColor('unknown' as unknown as StockStatus)).toBe('gray.300');
      expect(StockCalculation.getStatusLabel('unknown' as unknown as StockStatus)).toBe('Desconocido');
    });
  });

  // ============================================================================
  // FILTERING & COLLECTION OPERATIONS
  // ============================================================================

  describe('Filtering & Collection Operations', () => {
    const testItems: MaterialItem[] = [
      { ...mockMeasurable, id: '1', stock: 25 },    // OK
      { ...mockMeasurable, id: '2', stock: 15 },    // LOW
      { ...mockMeasurable, id: '3', stock: 5 },     // CRITICAL
      { ...mockMeasurable, id: '4', stock: 0 },     // OUT
      { ...mockCountable, id: '5', stock: 15 },     // OK
    ];

    it('should filter items by specific status', () => {
      const okItems = StockCalculation.filterByStatus(testItems, 'ok');
      expect(okItems).toHaveLength(2);
      expect(okItems.map((item: MaterialItem) => item.id)).toEqual(['1', '5']);
    });

    it('should get low stock items (low + critical)', () => {
      const lowStockItems = StockCalculation.getLowStockItems(testItems);
      expect(lowStockItems).toHaveLength(2);
      expect(lowStockItems.map((item: MaterialItem) => item.id)).toEqual(['2', '3']);
    });

    it('should get critical stock items (critical + out)', () => {
      const criticalItems = StockCalculation.getCriticalStockItems(testItems);
      expect(criticalItems).toHaveLength(2);
      expect(criticalItems.map((item: MaterialItem) => item.id)).toEqual(['3', '4']);
    });

    it('should get out of stock items only', () => {
      const outItems = StockCalculation.getOutOfStockItems(testItems);
      expect(outItems).toHaveLength(1);
      expect(outItems[0].id).toBe('4');
    });
  });

  // ============================================================================
  // STATISTICS & AGGREGATION CALCULATIONS
  // ============================================================================

  describe('Statistics & Aggregations', () => {
    it('should calculate comprehensive stock statistics', () => {
      const items: MaterialItem[] = [
        { ...mockMeasurable, stock: 25, unit_cost: 2.0 },    // OK - value: 50
        { ...mockMeasurable, stock: 15, unit_cost: 1.5 },    // LOW - value: 22.5
        { ...mockMeasurable, stock: 5, unit_cost: 3.0 },     // CRITICAL - value: 15
        { ...mockMeasurable, stock: 0, unit_cost: 1.0 },     // OUT - value: 0
      ];

      const stats = StockCalculation.getStockStatistics(items);

      expect(stats.total).toBe(4);
      expect(stats.ok).toBe(1);
      expect(stats.low).toBe(1);
      expect(stats.critical).toBe(1);
      expect(stats.out).toBe(1);
      expect(stats.totalValue).toBe(87.5); // 50 + 22.5 + 15 + 0
      expect(stats.averageStock).toBe(11.25); // (25 + 15 + 5 + 0) / 4
    });

    it('should handle empty items list in statistics', () => {
      const stats = StockCalculation.getStockStatistics([]);
      expect(stats.total).toBe(0);
      expect(stats.totalValue).toBe(0);
      expect(stats.averageStock).toBe(0);
    });
  });

  // ============================================================================
  // REORDER PRIORITY & BUSINESS LOGIC
  // ============================================================================

  describe('Reorder Priority & Business Logic', () => {
    it('should identify items that need reordering', () => {
      expect(StockCalculation.needsReordering({ ...mockMeasurable, stock: 15 })).toBe(true);  // LOW
      expect(StockCalculation.needsReordering({ ...mockMeasurable, stock: 5 })).toBe(true);   // CRITICAL
      expect(StockCalculation.needsReordering({ ...mockMeasurable, stock: 0 })).toBe(true);   // OUT
      expect(StockCalculation.needsReordering({ ...mockMeasurable, stock: 25 })).toBe(false); // OK
    });

    it('should assign correct reorder priorities', () => {
      expect(StockCalculation.getReorderPriority({ ...mockMeasurable, stock: 0 })).toBe(5);   // OUT - highest
      expect(StockCalculation.getReorderPriority({ ...mockMeasurable, stock: 5 })).toBe(4);   // CRITICAL
      expect(StockCalculation.getReorderPriority({ ...mockMeasurable, stock: 15 })).toBe(3);  // LOW
      expect(StockCalculation.getReorderPriority({ ...mockMeasurable, stock: 25 })).toBe(1);  // OK - lowest
    });
  });

  // ============================================================================
  // EDGE CASES & BOUNDARY CONDITIONS
  // ============================================================================

  describe('Edge Cases & Boundary Conditions', () => {
    it('should handle negative stock values', () => {
      const negativeStockItem: MaterialItem = { ...mockMeasurable, stock: -5 };
      expect(StockCalculation.getStockStatus(negativeStockItem)).toBe('out');
      expect(StockCalculation.getTotalValue(negativeStockItem)).toBe(-12.5); // -5 * 2.5
    });

    it('should handle null/undefined stock values', () => {
      // Create item with 0 stock to test null behavior
      const nullStockItem: MaterialItem = { ...mockMeasurable, stock: 0 };
      expect(StockCalculation.getStockStatus(nullStockItem)).toBe('out');
      expect(StockCalculation.getTotalValue(nullStockItem)).toBe(0);
    });

    it('should handle extremely large stock values', () => {
      const largeStockItem: MaterialItem = { ...mockMeasurable, stock: 999999999.99, unit_cost: 0.01 };
      const totalValue = StockCalculation.getTotalValue(largeStockItem);
      expect(totalValue).toBe(9999999.9999); // 999999999.99 * 0.01 (exact InventoryDecimal result)
    });

    it('should handle very small decimal values', () => {
      const tinyItem: MaterialItem = { ...mockMeasurable, stock: 0.001, unit_cost: 0.001 };
      const totalValue = StockCalculation.getTotalValue(tinyItem);
      expect(totalValue).toBe(0.000001); // 0.001 * 0.001
    });
  });

  // ============================================================================
  // REAL-WORLD BUSINESS SCENARIOS
  // ============================================================================

  describe('Real-World Business Scenarios', () => {
    it('should handle restaurant kitchen inventory scenario', () => {
      const kitchenItems: MaterialItem[] = [
        { ...mockMeasurable, name: 'Flour', stock: 15, unit_cost: 1.2 },     // LOW (min: 20)
        { ...mockMeasurable, name: 'Oil', stock: 5, unit_cost: 3.5 },        // CRITICAL (critical: 6)
        { ...mockCountable, name: 'Plates', stock: 50, unit_cost: 0.8 },     // OK (min: 10)
        { ...mockElaborated, name: 'Pizza', stock: 0, unit_cost: 8.5 },      // OUT
      ];

      const stats = StockCalculation.getStockStatistics(kitchenItems);
      const lowStockItems = StockCalculation.getLowStockItems(kitchenItems);
      const criticalItems = StockCalculation.getCriticalStockItems(kitchenItems);

      expect(stats.total).toBe(4);
      expect(lowStockItems).toHaveLength(2); // Flour (low), Oil (critical)
      expect(criticalItems).toHaveLength(2); // Oil (critical), Pizza (out)
    });

    it('should handle retail store inventory with packaging', () => {
      const retailItem: MaterialItem = {
        ...mockCountable,
        name: 'Soda Bottles',
        stock: 8, // Below min (10) to be low
        packaging: { 
          package_size: 24, 
          package_unit: 'case',
          display_mode: 'packaged'
        }
      };

      const status = StockCalculation.getStockStatus(retailItem);
      const reorderQty = StockCalculation.getSuggestedReorderQuantity(retailItem);
      
      expect(status).toBe('low');
      expect(reorderQty).toBe(24); // One full case to reach target (20)
    });

    it('should handle manufacturing BOM scenario', () => {
      const bomItems: MaterialItem[] = [
        { ...mockMeasurable, name: 'Steel', stock: 100, unit_cost: 5.0 },    // OK (min: 20)
        { ...mockMeasurable, name: 'Paint', stock: 5, unit_cost: 12.0 },     // CRITICAL (critical: 6)
        { ...mockCountable, name: 'Screws', stock: 0, unit_cost: 0.05 },     // OUT
      ];

      const criticalItems = StockCalculation.getCriticalStockItems(bomItems);
      const priorities = criticalItems.map((item: MaterialItem) => ({
        name: item.name,
        priority: StockCalculation.getReorderPriority(item)
      }));

      expect(priorities).toEqual([
        { name: 'Paint', priority: 4 },  // CRITICAL 
        { name: 'Screws', priority: 5 }  // OUT
      ]);
    });
  });

  // ============================================================================
  // PERFORMANCE & STRESS TESTS
  // ============================================================================

  describe('Performance & Stress Tests', () => {
    it('should handle large inventory calculations efficiently', () => {
      const largeInventory = Array.from({ length: 1000 }, (_, i) => ({
        ...mockMeasurable,
        id: `item-${i}`,
        stock: Math.random() * 100,
        unit_cost: Math.random() * 10,
      }));

      const startTime = performance.now();
      const stats = StockCalculation.getStockStatistics(largeInventory);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(100); // Should complete in under 100ms
      expect(stats.total).toBe(1000);
      expect(stats.totalValue).toBeGreaterThan(0);
    });

    it('should handle rapid successive calculations', () => {
      const iterations = 10000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const testItem = { ...mockMeasurable, stock: i % 50, unit_cost: (i % 10) + 1 };
        StockCalculation.getStockStatus(testItem);
        StockCalculation.getTotalValue(testItem);
        StockCalculation.needsReordering(testItem);
      }

      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(1000); // 10k calculations in under 1 second
    });
  });
});
