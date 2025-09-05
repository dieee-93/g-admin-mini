import { type ItemFormData, type MeasurableUnit, type PackagingInfo } from '@/pages/admin/materials/types';
import { InventoryDecimal, DECIMAL_CONSTANTS } from '@/config/decimal-config';

/**
 * Utility functions for material form calculations
 * Handles cost calculations, conversions, and formatting for the form UI
 */
export class FormCalculations {
  
  // ===============================================
  // COST CALCULATIONS
  // ===============================================
  
  /**
   * Calculates unit cost from total cost and quantity
   * IMPORTANT: Determines if unit_cost represents total cost or unit cost based on context
   */
  static calculateUnitCost(totalCost: number, quantity: number): number {
    const totalCostDec = new InventoryDecimal(totalCost);
    const quantityDec = new InventoryDecimal(quantity);
    if (quantityDec.isZero() || quantityDec.isNegative()) return 0;
    return totalCostDec.dividedBy(quantityDec).toNumber();
  }
  
  /**
   * Calculates total investment cost
   * unit_cost should represent cost per unit, quantity is the amount purchased
   */
  static calculateTotalCost(unitCost: number, quantity: number): number {
    return new InventoryDecimal(unitCost).times(quantity).toNumber();
  }
  
  /**
   * Gets the correct unit cost for display
   * Based on form context, unit_cost might be total cost that needs to be divided
   */
  static getDisplayUnitCost(formData: ItemFormData): number {
    const { unit_cost = 0, initial_stock = 0 } = formData;
    
    // If we have both values, assume unit_cost is actually total cost in form context
    if (initial_stock > 0 && unit_cost > 0) {
      return this.calculateUnitCost(unit_cost, initial_stock);
    }
    
    return unit_cost;
  }
  
  /**
   * Gets the total investment amount
   */
  static getTotalInvestment(formData: ItemFormData): number {
    return formData.unit_cost || 0;
  }
  
  // ===============================================
  // PACKAGING CALCULATIONS
  // ===============================================
  
  /**
   * Calculates cost per package
   */
  static calculateCostPerPackage(unitCost: number, packageSize: number): number {
    return new InventoryDecimal(unitCost).times(packageSize).toNumber();
  }
  
  /**
   * Calculates how many complete packages from total units
   */
  static calculateCompletePackages(totalUnits: number, packageSize: number): number {
    const packageSizeDec = new InventoryDecimal(packageSize);
    if (packageSizeDec.isZero() || packageSizeDec.isNegative()) return 0;
    return new InventoryDecimal(totalUnits).dividedBy(packageSizeDec).floor().toNumber();
  }
  
  /**
   * Calculates remaining loose units after complete packages
   */
  static calculateLooseUnits(totalUnits: number, packageSize: number): number {
    const packageSizeDec = new InventoryDecimal(packageSize);
    if (packageSizeDec.isZero() || packageSizeDec.isNegative()) return totalUnits;
    return new InventoryDecimal(totalUnits).modulo(packageSizeDec).toNumber();
  }
  
  /**
   * Gets package analysis for countable items
   */
  static getPackageAnalysis(formData: ItemFormData) {
    const { initial_stock = 0, packaging } = formData;
    
    if (!packaging?.package_size) {
      return null;
    }
    
    const unitCost = this.getDisplayUnitCost(formData);
    const completePackages = this.calculateCompletePackages(initial_stock, packaging.package_size);
    const looseUnits = this.calculateLooseUnits(initial_stock, packaging.package_size);
    const costPerPackage = this.calculateCostPerPackage(unitCost, packaging.package_size);
    
    return {
      completePackages,
      looseUnits,
      costPerPackage,
      packageUnit: packaging.package_unit || 'paquete'
    };
  }
  
  // ===============================================
  // UNIT CONVERSIONS
  // ===============================================
  
  /**
   * Converts weight units
   */
  static convertWeight(amount: number, fromUnit: 'kg' | 'g', toUnit: 'kg' | 'g'): number {
    if (fromUnit === toUnit) return amount;
    const amountDec = new InventoryDecimal(amount);
    
    if (fromUnit === 'kg' && toUnit === 'g') {
      return amountDec.times(1000).toNumber();
    }
    
    if (fromUnit === 'g' && toUnit === 'kg') {
      return amountDec.dividedBy(1000).toNumber();
    }
    
    return amount;
  }
  
  /**
   * Converts volume units
   */
  static convertVolume(amount: number, fromUnit: 'l' | 'ml', toUnit: 'l' | 'ml'): number {
    if (fromUnit === toUnit) return amount;
    const amountDec = new InventoryDecimal(amount);
    
    if (fromUnit === 'l' && toUnit === 'ml') {
      return amountDec.times(1000).toNumber();
    }
    
    if (fromUnit === 'ml' && toUnit === 'l') {
      return amountDec.dividedBy(1000).toNumber();
    }
    
    return amount;
  }
  
  /**
   * Gets weight conversion display info
   */
  static getWeightConversion(amount: number, unit: 'kg' | 'g') {
    const unitCost = new InventoryDecimal(1); // This should come from formData context
    
    if (unit === 'kg') {
      const grams = this.convertWeight(amount, 'kg', 'g');
      const costPerGram = unitCost.dividedBy(1000).toNumber();
      return {
        converted: { amount: grams, unit: 'g' },
        costPer: { amount: costPerGram, unit: 'gramo' }
      };
    } else {
      const kilograms = this.convertWeight(amount, 'g', 'kg');
      const costPerKg = unitCost.times(1000).toNumber();
      return {
        converted: { amount: kilograms, unit: 'kg' },
        costPer: { amount: costPerKg, unit: 'kg' }
      };
    }
  }
  
  /**
   * Gets volume conversion display info
   */
  static getVolumeConversion(amount: number, unit: 'l' | 'ml') {
    const unitCost = new InventoryDecimal(1); // This should come from formData context
    
    if (unit === 'l') {
      const milliliters = this.convertVolume(amount, 'l', 'ml');
      const costPerMl = unitCost.dividedBy(1000).toNumber();
      return {
        converted: { amount: milliliters, unit: 'ml' },
        costPer: { amount: costPerMl, unit: 'ml' }
      };
    } else {
      const liters = this.convertVolume(amount, 'ml', 'l');
      const costPerLiter = unitCost.times(1000).toNumber();
      return {
        converted: { amount: liters, unit: 'L' },
        costPer: { amount: costPerLiter, unit: 'litro' }
      };
    }
  }
  
  // ===============================================
  // FORMATTING UTILITIES
  // ===============================================
  
  /**
   * Formats currency with appropriate decimal places
   */
  static formatCurrency(amount: number, decimals: number = 2): string {
    return new InventoryDecimal(amount).toFixed(decimals);
  }
  
  /**
   * Formats currency for display with locale
   */
  static formatCurrencyDisplay(amount: number): string {
    return amount.toLocaleString();
  }
  
  /**
   * Formats quantity with appropriate decimal places
   */
  static formatQuantity(amount: number, decimals: number = 0): string {
    return new InventoryDecimal(amount).toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals 
    });
  }
  
  /**
   * Formats weight conversion amount
   */
  static formatWeightConversion(amount: number, unit: 'kg' | 'g'): string {
    const decimals = unit === 'kg' ? 3 : 0;
    return this.formatQuantity(amount, decimals);
  }
  
  /**
   * Formats volume conversion amount  
   */
  static formatVolumeConversion(amount: number, unit: 'l' | 'ml'): string {
    const decimals = unit === 'l' ? 3 : 0;
    return this.formatQuantity(amount, decimals);
  }
  
  // ===============================================
  // FORM VALIDATION HELPERS
  // ===============================================
  
  /**
   * Validates if cost calculations are possible
   */
  static canCalculateCosts(formData: ItemFormData): boolean {
    const { unit_cost, initial_stock } = formData;
    return (unit_cost ?? 0) > 0 && (initial_stock ?? 0) > 0;
  }
  
  /**
   * Validates if packaging calculations are possible
   */
  static canCalculatePackaging(formData: ItemFormData): boolean {
    return !!(formData.packaging?.package_size && formData.packaging?.package_unit);
  }
  
  /**
   * Validates if conversions are applicable
   */
  static canShowConversions(unit: MeasurableUnit): boolean {
    return ['kg', 'g', 'l', 'ml'].includes(unit);
  }
}