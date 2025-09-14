/**
 * Product Materials Cost Engine with Decimal.js Precision
 * Advanced cost calculation engine for product materials analysis and production viability
 */

import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

export interface MaterialCost {
  item_id: string;
  item_name: string;
  unit_cost: number;
  unit: string;
  available_quantity: number;
  line_cost?: number;
}

export interface ProductCostBreakdown {
  product_id: string;
  product_name: string;
  total_materials_cost: number;
  materials_breakdown: MaterialCost[];
  recipe_yield: number;
  cost_per_unit: number;
  precision_applied: boolean;
}

export interface ProductionViability {
  product_id: string;
  product_name: string;
  can_produce: boolean;
  required_materials: Array<{
    item_id: string;
    item_name: string;
    required_quantity: number;
    available_quantity: number;
    shortage?: number;
  }>;
  max_possible_batches: number;
  total_cost_estimate: number;
}

export interface BatchCalculation {
  batch_size: number;
  total_cost: number;
  cost_per_unit: number;
  material_requirements: Array<{
    item_id: string;
    item_name: string;
    quantity_needed: number;
    available_quantity: number;
    sufficient: boolean;
  }>;
  production_capacity: number;
}

/**
 * Calculate precise material costs for a product with decimal precision
 */
export function calculateProductMaterialsCost(
  productData: {
    product_id: string;
    product_name: string;
    recipe_yield: number;
    ingredients: Array<{
      item_id: string;
      item_name: string;
      quantity: number;
      item_cost: number;
      unit: string;
      available_quantity: number;
    }>;
  }
): ProductCostBreakdown {
  if (!productData.ingredients || productData.ingredients.length === 0) {
    return {
      product_id: productData.product_id,
      product_name: productData.product_name,
      total_materials_cost: 0,
      materials_breakdown: [],
      recipe_yield: productData.recipe_yield,
      cost_per_unit: 0,
      precision_applied: true
    };
  }

  let totalMaterialsCostDec = DecimalUtils.fromValue(0, 'financial');
  const materialsBreakdown: MaterialCost[] = [];

  // Calculate line costs with decimal precision
  productData.ingredients.forEach(ingredient => {
    const quantityDec = DecimalUtils.fromValue(ingredient.quantity, 'recipe');
    const costDec = DecimalUtils.fromValue(ingredient.item_cost || 0, 'financial');
    
    // Calculate line cost with precision
    const lineCostDec = DecimalUtils.multiply(quantityDec, costDec, 'financial');
    const lineCost = DecimalUtils.toNumber(lineCostDec);
    
    // Add to total
    totalMaterialsCostDec = DecimalUtils.add(totalMaterialsCostDec, lineCostDec, 'financial');
    
    materialsBreakdown.push({
      item_id: ingredient.item_id,
      item_name: ingredient.item_name,
      unit_cost: ingredient.item_cost || 0,
      unit: ingredient.unit,
      available_quantity: ingredient.available_quantity,
      line_cost: lineCost
    });
  });

  // Calculate cost per unit with precision
  const recipeYieldDec = DecimalUtils.fromValue(productData.recipe_yield, 'recipe');
  const costPerUnitDec = DecimalUtils.divide(totalMaterialsCostDec, recipeYieldDec, 'financial');

  return {
    product_id: productData.product_id,
    product_name: productData.product_name,
    total_materials_cost: DecimalUtils.toNumber(totalMaterialsCostDec),
    materials_breakdown: materialsBreakdown,
    recipe_yield: productData.recipe_yield,
    cost_per_unit: DecimalUtils.toNumber(costPerUnitDec),
    precision_applied: true
  };
}

/**
 * Analyze production viability with precise calculations
 */
export function analyzeProductionViability(
  productData: {
    product_id: string;
    product_name: string;
    materials_required: Array<{
      item_id: string;
      item_name: string;
      required_quantity: number;
      available_quantity: number;
      unit_cost: number;
    }>;
    batch_size?: number;
  }
): ProductionViability {
  const batchSizeDec = DecimalUtils.fromValue(productData.batch_size || 1, 'inventory');
  let maxPossibleBatchesDec = DecimalUtils.fromValue(Number.MAX_SAFE_INTEGER, 'inventory');
  let canProduce = true;
  let totalCostEstimateDec = DecimalUtils.fromValue(0, 'financial');

  const requiredMaterials = productData.materials_required.map(material => {
    const requiredQtyDec = DecimalUtils.fromValue(material.required_quantity, 'inventory');
    const availableQtyDec = DecimalUtils.fromValue(material.available_quantity, 'inventory');
    const unitCostDec = DecimalUtils.fromValue(material.unit_cost, 'financial');

    // Calculate how many batches this material can support
    let possibleBatchesDec = DecimalUtils.fromValue(0, 'inventory');
    if (DecimalUtils.isPositive(requiredQtyDec)) {
      possibleBatchesDec = DecimalUtils.divide(availableQtyDec, requiredQtyDec, 'inventory');
    }

    // Update maximum possible batches
    maxPossibleBatchesDec = DecimalUtils.min(maxPossibleBatchesDec, possibleBatchesDec);

    // Check if we have enough quantity
    const hasEnough = DecimalUtils.greaterThanOrEqual(availableQtyDec, requiredQtyDec);
    if (!hasEnough) {
      canProduce = false;
    }

    // Calculate shortage if any
    let shortage: number | undefined;
    if (!hasEnough) {
      const shortageDec = DecimalUtils.subtract(requiredQtyDec, availableQtyDec, 'inventory');
      shortage = DecimalUtils.toNumber(shortageDec);
    }

    // Add to total cost estimate
    const materialCostDec = DecimalUtils.multiply(requiredQtyDec, unitCostDec, 'financial');
    totalCostEstimateDec = DecimalUtils.add(totalCostEstimateDec, materialCostDec, 'financial');

    return {
      item_id: material.item_id,
      item_name: material.item_name,
      required_quantity: material.required_quantity,
      available_quantity: material.available_quantity,
      shortage
    };
  });

  // Ensure we don't have negative batches
  maxPossibleBatchesDec = DecimalUtils.max(maxPossibleBatchesDec, DecimalUtils.fromValue(0, 'inventory'));

  return {
    product_id: productData.product_id,
    product_name: productData.product_name,
    can_produce: canProduce,
    required_materials: requiredMaterials,
    max_possible_batches: DecimalUtils.toNumber(maxPossibleBatchesDec),
    total_cost_estimate: DecimalUtils.toNumber(totalCostEstimateDec)
  };
}

/**
 * Calculate batch production costs with decimal precision
 */
export function calculateBatchCosts(
  recipeData: {
    ingredients: Array<{
      item_id: string;
      item_name: string;
      quantity_per_batch: number;
      unit_cost: number;
      available_quantity: number;
    }>;
    batch_yield: number;
  },
  desiredBatches: number = 1
): BatchCalculation {
  const desiredBatchesDec = DecimalUtils.fromValue(desiredBatches, 'inventory');
  const batchYieldDec = DecimalUtils.fromValue(recipeData.batch_yield, 'inventory');
  let totalBatchCostDec = DecimalUtils.fromValue(0, 'financial');
  let maxProductionCapacityDec = DecimalUtils.fromValue(Number.MAX_SAFE_INTEGER, 'inventory');

  const materialRequirements = recipeData.ingredients.map(ingredient => {
    const qtyPerBatchDec = DecimalUtils.fromValue(ingredient.quantity_per_batch, 'inventory');
    const unitCostDec = DecimalUtils.fromValue(ingredient.unit_cost, 'financial');
    const availableQtyDec = DecimalUtils.fromValue(ingredient.available_quantity, 'inventory');

    // Calculate total quantity needed for desired batches
    const totalQtyNeededDec = DecimalUtils.multiply(qtyPerBatchDec, desiredBatchesDec, 'inventory');

    // Calculate cost for this ingredient
    const ingredientCostDec = DecimalUtils.multiply(totalQtyNeededDec, unitCostDec, 'financial');
    totalBatchCostDec = DecimalUtils.add(totalBatchCostDec, ingredientCostDec, 'financial');

    // Calculate production capacity limitation
    const maxBatchesFromIngredientDec = DecimalUtils.divide(availableQtyDec, qtyPerBatchDec, 'inventory');
    maxProductionCapacityDec = DecimalUtils.min(maxProductionCapacityDec, maxBatchesFromIngredientDec);

    // Check if we have sufficient quantity
    const sufficient = DecimalUtils.greaterThanOrEqual(availableQtyDec, totalQtyNeededDec);

    return {
      item_id: ingredient.item_id,
      item_name: ingredient.item_name,
      quantity_needed: DecimalUtils.toNumber(totalQtyNeededDec),
      available_quantity: ingredient.available_quantity,
      sufficient
    };
  });

  // Calculate total units produced and cost per unit
  const totalUnitsProducedDec = DecimalUtils.multiply(desiredBatchesDec, batchYieldDec, 'inventory');
  const costPerUnitDec = DecimalUtils.isZero(totalUnitsProducedDec) 
    ? DecimalUtils.fromValue(0, 'financial')
    : DecimalUtils.divide(totalBatchCostDec, totalUnitsProducedDec, 'financial');

  // Ensure production capacity is not negative
  maxProductionCapacityDec = DecimalUtils.max(maxProductionCapacityDec, DecimalUtils.fromValue(0, 'inventory'));

  return {
    batch_size: desiredBatches,
    total_cost: DecimalUtils.toNumber(totalBatchCostDec),
    cost_per_unit: DecimalUtils.toNumber(costPerUnitDec),
    material_requirements: materialRequirements,
    production_capacity: DecimalUtils.toNumber(maxProductionCapacityDec)
  };
}

/**
 * Calculate optimal batch size for cost efficiency
 */
export function calculateOptimalBatchSize(
  recipeData: {
    ingredients: Array<{
      item_id: string;
      quantity_per_batch: number;
      unit_cost: number;
      available_quantity: number;
      minimum_order_quantity?: number;
      bulk_discount_threshold?: number;
      bulk_discount_rate?: number;
    }>;
    batch_yield: number;
    setup_cost_per_batch?: number;
  },
  targetQuantity: number,
  maxBatches: number = 10
): {
  optimal_batch_size: number;
  total_cost: number;
  cost_per_unit: number;
  efficiency_score: number;
  cost_analysis: Array<{
    batch_size: number;
    total_cost: number;
    cost_per_unit: number;
    efficiency_score: number;
  }>;
} {
  const targetQtyDec = DecimalUtils.fromValue(targetQuantity, 'inventory');
  const setupCostDec = DecimalUtils.fromValue(recipeData.setup_cost_per_batch || 0, 'financial');
  
  const costAnalysis = [];
  let bestBatchSize = 1;
  let lowestCostPerUnitDec = DecimalUtils.fromValue(Number.MAX_SAFE_INTEGER, 'financial');

  for (let batchSize = 1; batchSize <= maxBatches; batchSize++) {
    const batchCalculation = calculateBatchCosts(recipeData, batchSize);
    
    // Add setup costs
    const setupCostForBatchDec = DecimalUtils.multiply(
      setupCostDec,
      DecimalUtils.fromValue(batchSize, 'financial'),
      'financial'
    );
    const totalCostWithSetupDec = DecimalUtils.add(
      DecimalUtils.fromValue(batchCalculation.total_cost, 'financial'),
      setupCostForBatchDec,
      'financial'
    );

    // Calculate units produced
    const unitsProducedDec = DecimalUtils.multiply(
      DecimalUtils.fromValue(batchSize, 'inventory'),
      DecimalUtils.fromValue(recipeData.batch_yield, 'inventory'),
      'inventory'
    );

    // Calculate cost per unit including setup
    const costPerUnitDec = DecimalUtils.divide(totalCostWithSetupDec, unitsProducedDec, 'financial');

    // Calculate efficiency score (lower cost per unit = higher efficiency)
    const maxPossibleCostDec = DecimalUtils.multiply(
      DecimalUtils.fromValue(100, 'financial'), // Arbitrary high cost
      DecimalUtils.fromValue(batchSize, 'financial'),
      'financial'
    );
    const efficiencyDec = DecimalUtils.subtract(
      DecimalUtils.fromValue(100, 'financial'),
      DecimalUtils.multiply(
        DecimalUtils.divide(costPerUnitDec, maxPossibleCostDec, 'financial'),
        DecimalUtils.fromValue(100, 'financial'),
        'financial'
      ),
      'financial'
    );
    const efficiencyScore = Math.max(0, Math.min(100, DecimalUtils.toNumber(efficiencyDec)));

    costAnalysis.push({
      batch_size: batchSize,
      total_cost: DecimalUtils.toNumber(totalCostWithSetupDec),
      cost_per_unit: DecimalUtils.toNumber(costPerUnitDec),
      efficiency_score: efficiencyScore
    });

    // Track the best option
    if (DecimalUtils.lessThan(costPerUnitDec, lowestCostPerUnitDec)) {
      lowestCostPerUnitDec = costPerUnitDec;
      bestBatchSize = batchSize;
    }
  }

  const optimalResult = costAnalysis.find(analysis => analysis.batch_size === bestBatchSize)!;

  return {
    optimal_batch_size: bestBatchSize,
    total_cost: optimalResult.total_cost,
    cost_per_unit: optimalResult.cost_per_unit,
    efficiency_score: optimalResult.efficiency_score,
    cost_analysis: costAnalysis.sort((a, b) => a.cost_per_unit - b.cost_per_unit)
  };
}

/**
 * Calculate material waste and efficiency metrics
 */
export function calculateMaterialEfficiency(
  productionData: {
    materials_used: Array<{
      item_id: string;
      planned_quantity: number;
      actual_quantity: number;
      unit_cost: number;
    }>;
    planned_output: number;
    actual_output: number;
  }
): {
  overall_efficiency: number;
  material_efficiency: number;
  output_efficiency: number;
  waste_cost: number;
  efficiency_recommendations: string[];
} {
  let totalPlannedCostDec = DecimalUtils.fromValue(0, 'financial');
  let totalActualCostDec = DecimalUtils.fromValue(0, 'financial');
  let totalWasteCostDec = DecimalUtils.fromValue(0, 'financial');

  const efficiencyRecommendations: string[] = [];

  // Calculate material efficiency
  productionData.materials_used.forEach(material => {
    const plannedQtyDec = DecimalUtils.fromValue(material.planned_quantity, 'inventory');
    const actualQtyDec = DecimalUtils.fromValue(material.actual_quantity, 'inventory');
    const unitCostDec = DecimalUtils.fromValue(material.unit_cost, 'financial');

    const plannedCostDec = DecimalUtils.multiply(plannedQtyDec, unitCostDec, 'financial');
    const actualCostDec = DecimalUtils.multiply(actualQtyDec, unitCostDec, 'financial');
    const wasteCostDec = DecimalUtils.subtract(actualCostDec, plannedCostDec, 'financial');

    totalPlannedCostDec = DecimalUtils.add(totalPlannedCostDec, plannedCostDec, 'financial');
    totalActualCostDec = DecimalUtils.add(totalActualCostDec, actualCostDec, 'financial');
    
    if (DecimalUtils.isPositive(wasteCostDec)) {
      totalWasteCostDec = DecimalUtils.add(totalWasteCostDec, wasteCostDec, 'financial');
    }

    // Check for significant overuse
    const overusePercentDec = DecimalUtils.multiply(
      DecimalUtils.divide(
        DecimalUtils.subtract(actualQtyDec, plannedQtyDec, 'inventory'),
        plannedQtyDec,
        'inventory'
      ),
      DecimalUtils.fromValue(100, 'inventory'),
      'inventory'
    );
    
    if (DecimalUtils.toNumber(overusePercentDec) > 10) {
      efficiencyRecommendations.push(
        `Material ${material.item_id}: ${DecimalUtils.toNumber(overusePercentDec).toFixed(1)}% overuse detected`
      );
    }
  });

  // Calculate material efficiency percentage
  const materialEfficiencyDec = DecimalUtils.multiply(
    DecimalUtils.divide(totalPlannedCostDec, totalActualCostDec, 'financial'),
    DecimalUtils.fromValue(100, 'financial'),
    'financial'
  );

  // Calculate output efficiency
  const plannedOutputDec = DecimalUtils.fromValue(productionData.planned_output, 'inventory');
  const actualOutputDec = DecimalUtils.fromValue(productionData.actual_output, 'inventory');
  const outputEfficiencyDec = DecimalUtils.multiply(
    DecimalUtils.divide(actualOutputDec, plannedOutputDec, 'inventory'),
    DecimalUtils.fromValue(100, 'inventory'),
    'inventory'
  );

  // Calculate overall efficiency (weighted average)
  const overallEfficiencyDec = DecimalUtils.multiply(
    DecimalUtils.add(
      DecimalUtils.multiply(materialEfficiencyDec, DecimalUtils.fromValue(0.6, 'financial'), 'financial'),
      DecimalUtils.multiply(outputEfficiencyDec, DecimalUtils.fromValue(0.4, 'inventory'), 'financial'),
      'financial'
    ),
    DecimalUtils.fromValue(1, 'financial'),
    'financial'
  );

  // Add general recommendations based on efficiency levels
  const overallEff = DecimalUtils.toNumber(overallEfficiencyDec);
  if (overallEff < 80) {
    efficiencyRecommendations.push('Overall efficiency below 80% - review production processes');
  }
  if (DecimalUtils.toNumber(materialEfficiencyDec) < 85) {
    efficiencyRecommendations.push('Material efficiency could be improved - check portion control');
  }
  if (DecimalUtils.toNumber(outputEfficiencyDec) < 90) {
    efficiencyRecommendations.push('Output efficiency low - review recipe procedures and staff training');
  }

  return {
    overall_efficiency: overallEff,
    material_efficiency: DecimalUtils.toNumber(materialEfficiencyDec),
    output_efficiency: DecimalUtils.toNumber(outputEfficiencyDec),
    waste_cost: DecimalUtils.toNumber(totalWasteCostDec),
    efficiency_recommendations: efficiencyRecommendations
  };
}