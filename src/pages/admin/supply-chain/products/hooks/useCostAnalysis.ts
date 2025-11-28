import { useMemo } from 'react';
import { useProductsStore } from '@/store/productsStore';
import { useMaterialsStore } from '@/store/materialsStore';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
// import { useCostCalculations } from './useCostCalculations'; // Hook not found after refactor

/**
 * Hook that connects CostAnalysisTab with REAL data from MaterialsStore and ProductsStore
 * Eliminates hardcoded mock data - uses actual recipe costs and materials inventory
 */

export interface RealCostCalculationInput {
  product_id: string;
  batch_size: number;
  labor_hours: number;
  labor_rate_per_hour?: number;
  equipment_cost?: number;
  utility_cost?: number;
  facility_cost?: number;
}

export interface MaterialsCostBreakdown {
  item_id: string;
  item_name: string;
  quantity_needed: number;
  unit_cost: number;
  line_total: number;
  available_stock: number;
  sufficient_stock: boolean;
}

export interface RealCostAnalysisResult {
  product_id: string;
  product_name: string;
  batch_size: number;

  // REAL Materials Costs (from MaterialsStore)
  materials_cost: number;
  materials_breakdown: MaterialsCostBreakdown[];
  materials_per_unit: number;

  // Labor & Overhead (user input)
  labor_cost: number;
  overhead_total: number;

  // Totals
  total_cost: number;
  cost_per_unit: number;

  // Pricing
  suggested_price: number;
  profit_margin: number;

  // Production Viability
  can_produce: boolean;
  insufficient_materials: string[];
  max_possible_batches: number;
}

export function useCostAnalysis() {
  const { getProductById, getProductsWithRecipes } = useProductsStore();
  const { items: materialItems } = useMaterialsStore();
  // const { calculateCosts } = useCostCalculations(); // Hook not found after refactor

  /**
   * Get available products that have recipes (can calculate real costs)
   */
  const availableProducts = useMemo(() => {
    return getProductsWithRecipes().map(product => ({
      id: product.id,
      name: product.name,
      has_recipe: product.production_ready,
      components_count: product.components_count
    }));
  }, [getProductsWithRecipes]);

  /**
   * Calculate REAL materials cost for a product using its recipe and current inventory
   * Note: This uses the cost already calculated in useProducts from recipe ingredients
   */
  const calculateRealMaterialsCost = useMemo(() =>
    (product_id: string, batch_size: number): { cost: number; breakdown: MaterialsCostBreakdown[]; can_produce: boolean } => {
      const product = getProductById(product_id);

      if (!product || !product.components || product.components.length === 0) {
        return { cost: 0, breakdown: [], can_produce: true };
      }

      // Use the already calculated cost from the product (from recipe ingredients)
      // ✅ PRECISION FIX: Use DecimalUtils.multiply for batch cost calculation
      const costPerUnit = product.cost_per_unit || 0;
      const totalMaterialsCostDec = DecimalUtils.multiply(
        costPerUnit.toString(),
        batch_size.toString(),
        'financial'
      );
      const totalMaterialsCost = totalMaterialsCostDec.toNumber();

      // Build breakdown from product components
      const breakdown: MaterialsCostBreakdown[] = [];
      let canProduce = true;

      for (const component of product.components) {
        // Find material item in store
        const materialItem = materialItems.find(item => item.id === component.item_id);

        if (materialItem) {
          const quantityNeeded = component.quantity * batch_size;
          const unitCost = materialItem.unit_cost || 0;
          // ✅ PRECISION FIX: Use DecimalUtils.multiply for line total calculation
          const lineTotalDec = DecimalUtils.multiply(
            quantityNeeded.toString(),
            unitCost.toString(),
            'financial'
          );
          const lineTotal = lineTotalDec.toNumber();
          const availableStock = materialItem.stock || 0;
          const sufficientStock = availableStock >= quantityNeeded;

          if (!sufficientStock) {
            canProduce = false;
          }

          breakdown.push({
            item_id: materialItem.id,
            item_name: materialItem.name,
            quantity_needed: quantityNeeded,
            unit_cost: unitCost,
            line_total: lineTotal,
            available_stock: availableStock,
            sufficient_stock: sufficientStock
          });
        }
      }

      return {
        cost: totalMaterialsCost,
        breakdown,
        can_produce: canProduce
      };
    },
    [getProductById, materialItems]
  );

  /**
   * Perform complete cost analysis with REAL data
   */
  const performRealCostAnalysis = useMemo(() =>
    (input: RealCostCalculationInput): RealCostAnalysisResult | null => {
      const product = getProductById(input.product_id);

      if (!product) {
        return null;
      }

      // Get REAL materials cost from current inventory
      const { cost: materialsCost, breakdown, can_produce } = calculateRealMaterialsCost(
        input.product_id,
        input.batch_size
      );

      // Calculate other costs using centralized logic
      // TODO: Implement calculateCosts function or import from service layer
      const costCalculation = calculateCosts({
        materials_cost: materialsCost,
        batch_size: input.batch_size,
        labor_hours: input.labor_hours,
        labor_rate_per_hour: input.labor_rate_per_hour,
        equipment_cost: input.equipment_cost,
        utility_cost: input.utility_cost,
        facility_cost: input.facility_cost
      });

      // Determine production constraints
      const insufficientMaterials = breakdown
        .filter(item => !item.sufficient_stock)
        .map(item => item.item_name);

      const maxPossibleBatches = breakdown.length > 0
        ? Math.min(...breakdown.map(item => Math.floor(item.available_stock / (item.quantity_needed / input.batch_size))))
        : 999;

      return {
        product_id: input.product_id,
        product_name: product.name,
        batch_size: input.batch_size,

        // REAL Materials Costs
        materials_cost: materialsCost,
        materials_breakdown: breakdown,
        materials_per_unit: costCalculation.materials_per_unit,

        // Labor & Overhead
        labor_cost: costCalculation.labor_cost,
        overhead_total: costCalculation.overhead_total,

        // Totals
        total_cost: costCalculation.total_cost,
        cost_per_unit: costCalculation.cost_per_unit,

        // Pricing
        suggested_price: costCalculation.suggested_price,
        profit_margin: costCalculation.profit_margin,

        // Production Viability
        can_produce,
        insufficient_materials: insufficientMaterials,
        max_possible_batches: Math.max(0, maxPossibleBatches)
      };
    },
    [getProductById, calculateRealMaterialsCost, calculateCosts]
  );

  /**
   * Validate if enough materials are available for production
   */
  const validateMaterialsAvailability = useMemo(() =>
    (product_id: string, batch_size: number): { valid: boolean; missing_items: string[] } => {
      const { can_produce, breakdown } = calculateRealMaterialsCost(product_id, batch_size);

      const missing_items = breakdown
        .filter(item => !item.sufficient_stock)
        .map(item => `${item.item_name} (necesita ${item.quantity_needed}, disponible ${item.available_stock})`);

      return {
        valid: can_produce,
        missing_items
      };
    },
    [calculateRealMaterialsCost]
  );

  return {
    availableProducts,
    performRealCostAnalysis,
    validateMaterialsAvailability,
    calculateRealMaterialsCost
  };
}
