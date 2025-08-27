// useTaxCalculation Hook - React hook for tax calculations
// Provides easy access to the centralized tax calculation service

import { useCallback, useMemo, useState } from 'react';
import { 
  taxService, 
  type TaxConfiguration, 
  type TaxCalculationResult, 
  type SaleItem 
} from '../services/taxCalculationService';

export interface UseTaxCalculationOptions {
  initialConfig?: Partial<TaxConfiguration>;
  autoUpdate?: boolean;
}

export function useTaxCalculation(options: UseTaxCalculationOptions = {}) {
  const { initialConfig, autoUpdate = true } = options;
  
  // Local config state (optional override of global config)
  const [localConfig, setLocalConfig] = useState<Partial<TaxConfiguration> | null>(
    initialConfig || null
  );

  // Get effective configuration
  const effectiveConfig = useMemo(() => {
    const globalConfig = taxService.getConfiguration();
    return localConfig ? { ...globalConfig, ...localConfig } : globalConfig;
  }, [localConfig]);

  /**
   * Calculate taxes for a single amount
   */
  const calculateTaxes = useCallback((amount: number): TaxCalculationResult => {
    return taxService.calculateTaxesForAmount(amount, localConfig || undefined);
  }, [localConfig]);

  /**
   * Calculate taxes for multiple items
   */
  const calculateCartTaxes = useCallback((items: SaleItem[]): TaxCalculationResult => {
    return taxService.calculateTaxesForItems(items, localConfig || undefined);
  }, [localConfig]);

  /**
   * Calculate reverse taxes (from final price to components)
   */
  const reverseTaxCalculation = useCallback((finalAmount: number): TaxCalculationResult => {
    return taxService.reverseTaxCalculation(finalAmount, localConfig || undefined);
  }, [localConfig]);

  /**
   * Update local tax configuration
   */
  const updateConfig = useCallback((newConfig: Partial<TaxConfiguration>) => {
    setLocalConfig(prev => ({ ...prev, ...newConfig }));
    
    if (autoUpdate) {
      // Update global service configuration
      taxService.updateConfiguration(newConfig);
    }
  }, [autoUpdate]);

  /**
   * Reset to global configuration
   */
  const resetConfig = useCallback(() => {
    setLocalConfig(null);
  }, []);

  /**
   * Format tax results for display
   */
  const formatTaxDisplay = useCallback((result: TaxCalculationResult) => {
    return taxService.formatTaxDisplay(result);
  }, []);

  /**
   * Quick helpers for common calculations
   */
  const helpers = useMemo(() => ({
    // Get tax amount from total
    getTaxAmount: (totalAmount: number) => {
      const result = reverseTaxCalculation(totalAmount);
      return result.totalTaxes;
    },
    
    // Get subtotal from total
    getSubtotal: (totalAmount: number) => {
      const result = reverseTaxCalculation(totalAmount);
      return result.subtotal;
    },
    
    // Get IVA amount from total
    getIVAAmount: (totalAmount: number) => {
      const result = reverseTaxCalculation(totalAmount);
      return result.ivaAmount;
    },
    
    // Check if price includes taxes
    pricesIncludeTax: effectiveConfig.taxIncludedInPrice,
    
    // Get current IVA rate
    currentIVARate: effectiveConfig.ivaRate,
    
    // Get effective tax rate
    getEffectiveTaxRate: () => {
      const baseResult = calculateTaxes(100); // Calculate on $100 base
      return baseResult.breakdown.effectiveTaxRate;
    }
  }), [effectiveConfig, calculateTaxes, reverseTaxCalculation]);

  return {
    // Configuration
    config: effectiveConfig,
    updateConfig,
    resetConfig,
    
    // Calculation methods
    calculateTaxes,
    calculateCartTaxes,
    reverseTaxCalculation,
    
    // Formatting
    formatTaxDisplay,
    
    // Helpers
    helpers,
    
    // Status
    isConfigOverridden: localConfig !== null
  };
}

/**
 * Hook specifically for cart tax calculations
 */
export function useCartTaxCalculation(items: SaleItem[], config?: Partial<TaxConfiguration>) {
  const { calculateCartTaxes, formatTaxDisplay } = useTaxCalculation({ 
    initialConfig: config 
  });

  const result = useMemo(() => {
    if (items.length === 0) {
      return {
        subtotal: 0,
        ivaAmount: 0,
        ingresosBrutosAmount: 0,
        totalTaxes: 0,
        totalAmount: 0,
        breakdown: {
          basePrice: 0,
          ivaRate: 0,
          ingresosBrutosRate: 0,
          effectiveTaxRate: 0
        }
      };
    }
    return calculateCartTaxes(items);
  }, [items, calculateCartTaxes]);

  const formatted = useMemo(() => formatTaxDisplay(result), [result, formatTaxDisplay]);

  return {
    result,
    formatted,
    isEmpty: items.length === 0
  };
}

/**
 * Hook for simple amount tax calculation
 */
export function useAmountTaxCalculation(amount: number, config?: Partial<TaxConfiguration>) {
  const { calculateTaxes, formatTaxDisplay } = useTaxCalculation({ 
    initialConfig: config 
  });

  const result = useMemo(() => {
    if (amount <= 0) {
      return {
        subtotal: 0,
        ivaAmount: 0,
        ingresosBrutosAmount: 0,
        totalTaxes: 0,
        totalAmount: 0,
        breakdown: {
          basePrice: 0,
          ivaRate: 0,
          ingresosBrutosRate: 0,
          effectiveTaxRate: 0
        }
      };
    }
    return calculateTaxes(amount);
  }, [amount, calculateTaxes]);

  const formatted = useMemo(() => formatTaxDisplay(result), [result, formatTaxDisplay]);

  return {
    result,
    formatted,
    isEmpty: amount <= 0
  };
}

export default useTaxCalculation;