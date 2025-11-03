import { type MaterialItem } from '@/pages/admin/supply-chain/materials/types';
import { InventoryDecimal, DECIMAL_CONSTANTS } from '@/config/decimal-config';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

import { logger } from '@/lib/logging';
/**
 * Stock status levels
 */
export type StockStatus = 'ok' | 'low' | 'critical' | 'out';

/**
 * Utility functions for stock-related calculations
 */
export class StockCalculation {
  /**
   * Gets minimum stock threshold based on item type
   */
  static getMinStock(item: MaterialItem): number {
    switch (item.type) {
      case 'ELABORATED':
        // Elaborated items need smaller minimum since they're produced on demand
        return 5;
      case 'COUNTABLE':
        // Countable items typically need moderate buffer
        return 10;
      case 'MEASURABLE':
        // Measurable items often need larger buffer for continuous processes
        return 20;
      default:
        return 10;
    }
  }

  /**
   * Gets critical stock threshold (30% of minimum)
   */
  static getCriticalStock(item: MaterialItem): number {
    const minStock = new InventoryDecimal(this.getMinStock(item));
    return minStock.times(0.3).ceil().toNumber();
  }

  /**
   * Determines stock status for an item
   */
  static getStockStatus(item: MaterialItem): StockStatus {
    const currentStock = item.stock ?? 0;
    const minStock = this.getMinStock(item);
    const criticalStock = this.getCriticalStock(item);

    if (currentStock <= 0) {
      return 'out';
    }
    
    if (currentStock <= criticalStock) {
      return 'critical';
    }
    
    if (currentStock <= minStock) {
      return 'low';
    }
    
    return 'ok';
  }

  /**
   * Gets appropriate unit for display based on item type
   */
  static getDisplayUnit(item: MaterialItem): string {
    if (item.type === 'MEASURABLE') {
      return item.unit || 'kg';
    }
    
    if (item.type === 'COUNTABLE') {
      // Prefer packaging unit if available
      return item.packaging?.package_unit || 'unidad';
    }
    
    if (item.type === 'ELABORATED') {
      return item.unit || 'porción';
    }
    
    return 'unidad';
  }

  /**
   * Calculates total value for an item (stock * unit_cost)
   * ENHANCED: with validation for NaN/Infinity safety
   */
  static getTotalValue(item: MaterialItem): number {
    try {
      const stock = DecimalUtils.safeFromValue(item.stock ?? 0, 'inventory', `getTotalValue(${item.name || item.id})`);
      const cost = DecimalUtils.safeFromValue(item.unit_cost ?? 0, 'inventory', `getTotalValue(${item.name || item.id})`);
      
      const result = stock.times(cost);
      
      // Additional safety check on result
      if (!DecimalUtils.isFiniteDecimal(result)) {
        logger.warn('MaterialsStore', `StockCalculation.getTotalValue: Invalid result for item ${item.id}:`, { stock: item.stock, cost: item.unit_cost });
        return 0;
      }
      
      return result.toNumber();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('MaterialsStore', `StockCalculation.getTotalValue: Error calculating value for item ${item.id}:`, errorMessage);
      return 0; // Safe fallback
    }
  }

  /**
   * Calculates suggested reorder quantity
   */
  static getSuggestedReorderQuantity(item: MaterialItem): number {
    const minStock = new InventoryDecimal(this.getMinStock(item));
    const currentStock = new InventoryDecimal(item.stock ?? 0);
    
    // Suggest enough to reach 2x minimum stock
    const targetStock = minStock.times(2);
    const needed = InventoryDecimal.max(DECIMAL_CONSTANTS.ZERO, targetStock.minus(currentStock));
    
    if (needed.isZero()) return 0;

    // Round up to reasonable quantities based on type
    if (item.type === 'ELABORATED') {
      // Elaborated items: round to nearest 5
      return needed.dividedBy(5).ceil().times(5).toNumber();
    }
    
    if (item.type === 'COUNTABLE' && item.packaging?.package_size) {
      // Countable with packaging: round to full packages
      const packageSize = new InventoryDecimal(item.packaging.package_size);
      if (packageSize.isZero()) return needed.ceil().toNumber();
      return needed.dividedBy(packageSize).ceil().times(packageSize).toNumber();
    }
    
    // Default: round to nearest 10
    return needed.dividedBy(10).ceil().times(10).toNumber();
  }

  /**
   * Gets stock status color for UI
   */
  static getStatusColor(status: StockStatus): string {
    switch (status) {
      case 'ok':
        return 'green.500';
      case 'low':
        return 'yellow.400';
      case 'critical':
        return 'orange.600';
      case 'out':
        return 'red.600';
      default:
        return 'gray.300';
    }
  }

  /**
   * Gets stock status label for UI
   */
  static getStatusLabel(status: StockStatus): string {
    switch (status) {
      case 'ok':
        return 'Stock Normal';
      case 'low':
        return 'Stock Bajo';
      case 'critical':
        return 'Stock Crítico';
      case 'out':
        return 'Sin Stock';
      default:
        return 'Desconocido';
    }
  }

  /**
   * Filters items by stock status
   */
  static filterByStatus(items: MaterialItem[], status: StockStatus): MaterialItem[] {
    return items.filter(item => this.getStockStatus(item) === status);
  }

  /**
   * Gets low stock items (both 'low' and 'critical')
   */
  static getLowStockItems(items: MaterialItem[]): MaterialItem[] {
    return items.filter(item => {
      const status = this.getStockStatus(item);
      return status === 'low' || status === 'critical';
    });
  }

  /**
   * Gets critical stock items (both 'critical' and 'out')
   */
  static getCriticalStockItems(items: MaterialItem[]): MaterialItem[] {
    return items.filter(item => {
      const status = this.getStockStatus(item);
      return status === 'critical' || status === 'out';
    });
  }

  /**
   * Gets out of stock items
   */
  static getOutOfStockItems(items: MaterialItem[]): MaterialItem[] {
    return this.filterByStatus(items, 'out');
  }

  /**
   * Calculates stock statistics for a collection of items
   */
  static getStockStatistics(items: MaterialItem[]) {
    const stats = {
      total: items.length,
      ok: 0,
      low: 0,
      critical: 0,
      out: 0,
      totalValue: 0,
      averageStock: 0
    };

    let totalStockDec = new InventoryDecimal(0);
    let totalValueDec = new InventoryDecimal(0);

    items.forEach(item => {
      const status = this.getStockStatus(item);
      stats[status]++;
      totalValueDec = totalValueDec.plus(this.getTotalValue(item));
      totalStockDec = totalStockDec.plus(item.stock ?? 0);
    });

    stats.totalValue = totalValueDec.toDecimalPlaces(2).toNumber();
    stats.averageStock = items.length > 0 
      ? totalStockDec.dividedBy(items.length).toDecimalPlaces(2).toNumber() 
      : 0;

    return stats;
  }

  /**
   * Checks if item needs reordering
   */
  static needsReordering(item: MaterialItem): boolean {
    const status = this.getStockStatus(item);
    return status === 'low' || status === 'critical' || status === 'out';
  }

  /**
   * Gets reorder priority (1-5, 5 being highest priority)
   */
  static getReorderPriority(item: MaterialItem): number {
    const status = this.getStockStatus(item);
    switch (status) {
      case 'out':
        return 5; // Highest priority
      case 'critical':
        return 4;
      case 'low':
        return 3;
      default:
        return 1; // Low priority
    }
  }
}