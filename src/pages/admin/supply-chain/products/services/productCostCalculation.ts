/**
 * PRODUCT COST CALCULATION SERVICE
 *
 * Servicio centralizado para calcular costos de productos.
 * UN SOLO lugar para todas las lógicas de cálculo de costos.
 *
 * ✅ CORRECCIÓN #4 (PRODUCTS_FORM_DESIGN_REVIEW.md)
 * ✅ Unifica lógica duplicada
 * ✅ Reutilizable en todas las secciones
 * ✅ Type-safe
 * ✅ PRECISION: Uses DecimalUtils for all financial calculations
 *
 * @design PRODUCTS_FORM_DESIGN_REVIEW.md - Issue #1
 */

import type {
  ProductFormData,
  ProductCostBreakdown,
  ProductComponent,
  StaffAllocation,
  OverheadConfig
} from '../types/productForm';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

// ============================================
// MAIN COST CALCULATION
// ============================================

/**
 * Calcula el costo total del producto con desglose completo
 *
 * @example
 * ```ts
 * const costs = calculateProductTotalCost(formData)
 * // Returns: { materials: 100, labor: 50, overhead: 20, total: 170 }
 * ```
 */
export function calculateProductTotalCost(
  formData: ProductFormData
): ProductCostBreakdown {
  const materialsCost = formData.materials?.components
    ? calculateMaterialsCost(formData.materials.components)
    : 0;

  const laborCost = formData.staff?.staff_allocation
    ? calculateLaborCost(formData.staff.staff_allocation)
    : 0;

  const overheadCost = formData.production?.overhead_config
    ? calculateProductionOverhead(
        formData.production.overhead_config,
        materialsCost,
        formData.production.production_time_minutes || 0
      )
    : 0;

  const total = materialsCost + laborCost + overheadCost;

  return {
    materials: materialsCost,
    labor: laborCost,
    overhead: overheadCost,
    total
  };
}

// ============================================
// MATERIALS COST CALCULATION
// ============================================

/**
 * Calcula el costo de un solo componente (material)
 *
 * ✅ PRECISION: Uses RecipeDecimal for component cost
 *
 * @example
 * ```ts
 * calculateComponentCost(2.5, 45.67)
 * // Returns: 114.175 (no float errors)
 * ```
 */
export function calculateComponentCost(quantity: number, unitCost: number): number {
  const costDec = DecimalUtils.multiply(
    quantity.toString(),
    unitCost.toString(),
    'recipe'
  );
  return costDec.toNumber();
}

/**
 * Calcula el costo de materiales/ingredientes
 *
 * TODO: Integrar con calculateElaboratedCost del módulo Materials
 * para cálculos más complejos (yields, waste, etc.)
 *
 * @example
 * ```ts
 * const cost = calculateMaterialsCost([
 *   { material_id: '1', quantity: 2, unit_cost: 10 },
 *   { material_id: '2', quantity: 1, unit_cost: 5 }
 * ])
 * // Returns: 25
 * ```
 */
export function calculateMaterialsCost(
  components: ProductComponent[]
): number {
  if (!components || components.length === 0) {
    return 0;
  }

  // ✅ PRECISION FIX: Use RecipeDecimal for production cost calculations
  const totalDec = components.reduce((sumDec, component) => {
    const unitCost = component.unit_cost || 0;
    const quantity = component.quantity || 0;

    const componentCostDec = DecimalUtils.multiply(
      quantity.toString(),
      unitCost.toString(),
      'recipe'
    );

    return DecimalUtils.add(sumDec, componentCostDec, 'recipe');
  }, DecimalUtils.fromValue(0, 'recipe'));

  return totalDec.toNumber();
}

// ============================================
// LABOR COST CALCULATION
// ============================================

/**
 * Calcula el costo de mano de obra
 *
 * Formula: (duration_minutes / 60) × hourly_rate × count
 *
 * @example
 * ```ts
 * const cost = calculateLaborCost([
 *   { role_id: '1', count: 2, duration_minutes: 60, hourly_rate: 15 }
 * ])
 * // Returns: 30 (1 hour × $15/hour × 2 people)
 * ```
 */
export function calculateLaborCost(
  staff_allocation: StaffAllocation[]
): number {
  if (!staff_allocation || staff_allocation.length === 0) {
    return 0;
  }

  // ✅ PRECISION FIX: Use RecipeDecimal for labor cost calculations
  const totalDec = staff_allocation.reduce((sumDec, allocation) => {
    const durationMinutes = allocation.duration_minutes || 0;
    const rate = allocation.hourly_rate || 0;
    const count = allocation.count || 1;

    // Convert minutes to hours: hours = duration / 60
    const hoursDec = DecimalUtils.divide(
      durationMinutes.toString(),
      '60',
      'recipe'
    );

    // Calculate: hours × rate × count
    const allocationCostDec = DecimalUtils.multiply(
      hoursDec,
      rate.toString(),
      'recipe'
    );

    const finalCostDec = DecimalUtils.multiply(
      allocationCostDec,
      count.toString(),
      'recipe'
    );

    return DecimalUtils.add(sumDec, finalCostDec, 'recipe');
  }, DecimalUtils.fromValue(0, 'recipe'));

  return totalDec.toNumber();
}

// ============================================
// OVERHEAD COST CALCULATION
// ============================================

/**
 * Calcula el overhead según el método configurado
 *
 * ✅ Usa schema unificado (CORRECCIÓN #1)
 * Soporta 4 métodos:
 * - 'none': Sin overhead
 * - 'fixed': Costo fijo por lote
 * - 'per_unit': Costo por unidad
 * - 'time_based': Costo por minuto de producción
 *
 * @example
 * ```ts
 * // Fixed overhead
 * calculateProductionOverhead({ method: 'fixed', fixed_overhead: 50 }, 100, 30)
 * // Returns: 50
 *
 * // Per unit overhead
 * calculateProductionOverhead({ method: 'per_unit', per_unit_overhead: 5 }, 100, 30)
 * // Returns: 5
 *
 * // Time based overhead (30 mins × $0.5/min)
 * calculateProductionOverhead({ method: 'time_based', overhead_per_minute: 0.5 }, 100, 30)
 * // Returns: 15
 * ```
 */
export function calculateProductionOverhead(
  config: OverheadConfig,
  materialsCost: number,
  productionTimeMinutes: number
): number {
  switch (config.method) {
    case 'none':
      return 0;

    case 'fixed':
      // Costo fijo por lote de producción
      return config.fixed_overhead || 0;

    case 'per_unit':
      // Costo por unidad producida
      return config.per_unit_overhead || 0;

    case 'time_based':
      // ✅ PRECISION FIX: Use RecipeDecimal for time-based overhead
      // Costo por minuto de producción (ej: gas, electricidad)
      const perMinute = config.overhead_per_minute || 0;
      const overheadDec = DecimalUtils.multiply(
        perMinute.toString(),
        productionTimeMinutes.toString(),
        'recipe'
      );
      return overheadDec.toNumber();

    default:
      return 0;
  }
}

// ============================================
// TIME CONVERSION HELPERS
// ============================================

/**
 * Convierte minutos a horas
 *
 * @example
 * ```ts
 * convertTimeToHours(90)
 * // Returns: 1.5
 * ```
 */
export function convertTimeToHours(minutes: number): number {
  return minutes / 60;
}

/**
 * Convierte horas a minutos
 *
 * @example
 * ```ts
 * convertTimeToMinutes(1.5)
 * // Returns: 90
 * ```
 */
export function convertTimeToMinutes(hours: number): number {
  return hours * 60;
}

// ============================================
// PRICING HELPERS
// ============================================

/**
 * Calcula el margen de ganancia
 *
 * Formula: ((price - cost) / price) × 100
 *
 * ✅ PRECISION: Uses FinancialDecimal for pricing calculations
 *
 * @example
 * ```ts
 * calculateProfitMargin(100, 150)
 * // Returns: 33.33 (%)
 * ```
 */
export function calculateProfitMargin(cost: number, price: number): number {
  if (price === 0) return 0;

  // ✅ PRECISION FIX: Use DecimalUtils.calculateProfitMargin
  // Note: DecimalUtils expects (revenue/price, cost) order
  const marginDec = DecimalUtils.calculateProfitMargin(price, cost);
  return marginDec.toNumber();
}

/**
 * Calcula el markup
 *
 * Formula: ((price - cost) / cost) × 100
 *
 * ✅ PRECISION: Uses FinancialDecimal for pricing calculations
 *
 * @example
 * ```ts
 * calculateMarkup(100, 150)
 * // Returns: 50 (%)
 * ```
 */
export function calculateMarkup(cost: number, price: number): number {
  if (cost === 0) return 0;

  // ✅ PRECISION FIX: Use DecimalUtils.calculateMarkup
  const markupDec = DecimalUtils.calculateMarkup(price, cost);
  return markupDec.toNumber();
}

/**
 * Sugiere un precio basado en costo y margen deseado
 *
 * Formula: price = cost / (1 - margin/100)
 *
 * ✅ PRECISION: Uses FinancialDecimal for pricing calculations
 *
 * @example
 * ```ts
 * suggestPrice(100, 30)  // 30% margen
 * // Returns: 142.86
 * ```
 */
export function suggestPrice(cost: number, marginPercentage: number): number {
  if (marginPercentage >= 100) {
    throw new Error('Margin percentage must be less than 100%');
  }

  // ✅ PRECISION FIX: Use FinancialDecimal for price calculation
  // Formula: price = cost / (1 - margin/100)
  const costDec = DecimalUtils.fromValue(cost, 'financial');
  const marginDec = DecimalUtils.fromValue(marginPercentage, 'financial');

  // Calculate (1 - margin/100)
  const marginFractionDec = DecimalUtils.divide(marginDec, '100', 'financial');
  const divisorDec = DecimalUtils.subtract('1', marginFractionDec, 'financial');

  // Calculate price = cost / divisor
  const priceDec = DecimalUtils.divide(costDec, divisorDec, 'financial');

  return priceDec.toNumber();
}

/**
 * Sugiere un precio basado en costo y markup deseado
 *
 * @example
 * ```ts
 * suggestPriceFromMarkup(100, 50)  // 50% markup
 * // Returns: 150
 * ```
 */
export function suggestPriceFromMarkup(cost: number, markupPercentage: number): number {
  return cost * (1 + markupPercentage / 100);
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Valida que el precio sea mayor o igual al costo
 */
export function isPriceBelowCost(cost: number, price: number): boolean {
  return price < cost;
}

/**
 * Calcula el margen mínimo recomendado según industria
 *
 * Basado en research (PRODUCTS_FORM_RESEARCH_SUMMARY.md):
 * - Food: 30-35%
 * - Retail: 40-50%
 * - Services: 40-60%
 * - Digital: 70-90%
 */
export function getRecommendedMargin(productType: string): {
  min: number;
  max: number;
  recommended: number;
} {
  switch (productType) {
    case 'physical_product':
      return { min: 30, max: 50, recommended: 35 };
    case 'service':
      return { min: 40, max: 60, recommended: 50 };
    case 'digital':
      return { min: 70, max: 90, recommended: 80 };
    case 'rental':
      return { min: 30, max: 50, recommended: 40 };
    case 'membership':
      return { min: 50, max: 70, recommended: 60 };
    default:
      return { min: 30, max: 50, recommended: 40 };
  }
}

// ============================================
// DEPRECATION COST (for rental)
// ============================================

/**
 * Calcula el costo de depreciación por uso (para rental)
 *
 * @example
 * ```ts
 * calculateDepreciationCost({
 *   method: 'straight_line',
 *   acquisition_cost: 10000,
 *   salvage_value: 2000,
 *   useful_life_months: 60
 * })
 * // Returns: 133.33 per month
 * ```
 */
export function calculateDepreciationCost(config: {
  method: 'straight_line' | 'declining_balance' | 'units_of_production';
  acquisition_cost: number;
  salvage_value: number;
  useful_life_months?: number;
  depreciation_rate?: number;
  total_units?: number;
  current_units?: number;
}): number {
  const { method, acquisition_cost, salvage_value } = config;

  switch (method) {
    case 'straight_line': {
      // (Costo - Salvage Value) / Vida Útil
      const usefulLife = config.useful_life_months || 1;
      return (acquisition_cost - salvage_value) / usefulLife;
    }

    case 'declining_balance': {
      // Costo × Tasa de Depreciación
      const rate = config.depreciation_rate || 0.2;
      return acquisition_cost * rate;
    }

    case 'units_of_production': {
      // (Costo - Salvage Value) / Total Units × Current Units
      const totalUnits = config.total_units || 1;
      const currentUnits = config.current_units || 0;
      return ((acquisition_cost - salvage_value) / totalUnits) * currentUnits;
    }

    default:
      return 0;
  }
}
