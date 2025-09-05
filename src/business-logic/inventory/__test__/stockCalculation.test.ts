import { describe, it, expect } from 'vitest';
import { StockCalculation } from '../stockCalculation';
import { type MaterialItem } from '@/pages/admin/materials/types';

describe('StockCalculation', () => {

  const mockItem: MaterialItem = {
    id: '1',
    name: 'Test Item',
    type: 'MEASURABLE',
    unit: 'kg',
    stock: 10.5,
    unit_cost: 2.50,
    category: 'Test',
    created_at: '',
    updated_at: ''
  };

  it('should calculate total value with precision', () => {
    // 10.5 * 2.50 = 26.25
    const totalValue = StockCalculation.getTotalValue(mockItem);
    expect(totalValue).toBe(26.25);
  });

  it('should calculate total value correctly when cost has many decimals', () => {
    const itemWithDecimalCost: MaterialItem = { ...mockItem, stock: 10, unit_cost: 0.111111 };
    // 10 * 0.111111 = 1.11111
    const totalValue = StockCalculation.getTotalValue(itemWithDecimalCost);
    expect(totalValue).toBe(1.11111);
  });

  it('should get suggested reorder quantity with rounding up', () => {
    const lowStockItem: MaterialItem = { ...mockItem, stock: 12 }; // Min stock is 20
    // Target stock = 20 * 2 = 40
    // Needed = 40 - 12 = 28
    // Round up to nearest 10 = 30
    const reorderQty = StockCalculation.getSuggestedReorderQuantity(lowStockItem);
    expect(reorderQty).toBe(30);
  });
  
  it('should get suggested reorder quantity for elaborated items', () => {
    const lowStockElaborated: MaterialItem = { ...mockItem, type: 'ELABORATED', stock: 2 }; // Min stock is 5
    // Target stock = 5 * 2 = 10
    // Needed = 10 - 2 = 8
    // Round up to nearest 5 = 10
    const reorderQty = StockCalculation.getSuggestedReorderQuantity(lowStockElaborated);
    expect(reorderQty).toBe(10);
  });

  it('should calculate statistics with precision', () => {
    const items: MaterialItem[] = [
      { ...mockItem, stock: 10, unit_cost: 1.5 }, // value = 15
      { ...mockItem, stock: 5.5, unit_cost: 2 }, // value = 11
    ];
    const stats = StockCalculation.getStockStatistics(items);
    // totalValue = 15 + 11 = 26
    // totalStock = 10 + 5.5 = 15.5
    // averageStock = 15.5 / 2 = 7.75
    expect(stats.totalValue).toBe(26);
    expect(stats.averageStock).toBe(7.75);
  });
});
