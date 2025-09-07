// Smart Cost Calculation Engine with Decimal.js precision
import { supabase } from '@/lib/supabase/client';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { RecipeDecimal } from '@/config/decimal-config';

export interface RecipeIngredientData {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  yield_factor?: number; // Factor de rendimiento (0-1)
}

export interface YieldAnalysis {
  theoretical_yield: number;
  actual_yield: number;
  yield_percentage: number;
  waste_factor: number;
  efficiency_score: number;
}

export interface ProfitabilityMetrics {
  suggested_selling_price: number;
  profit_margin: number;
  food_cost_percentage: number;
  break_even_price: number;
  target_food_cost_percentage: number;
}

export interface CostCalculationResult {
  total_cost: number;
  cost_per_unit: number;
  cost_per_portion: number;
  ingredient_breakdown: Array<{
    ingredient_id: string;
    name: string;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    percentage_of_total: number;
    yield_adjusted_cost: number;
  }>;
  yield_analysis: YieldAnalysis;
  profitability_metrics: ProfitabilityMetrics;
}

export class SmartCostCalculationEngine {
  
  /**
   * Calcular costo de receta con análisis de rendimiento avanzado
   */
  static async calculateRecipeCostWithYield(recipeId: string): Promise<CostCalculationResult> {
    try {
      // Obtener datos de la receta desde la base de datos
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            id,
            material_id,
            quantity,
            unit,
            materials (
              id,
              name,
              unit_cost,
              yield_factor
            )
          )
        `)
        .eq('id', recipeId)
        .single();

      if (recipeError) throw recipeError;
      if (!recipeData) throw new Error('Receta no encontrada');

      const ingredients: RecipeIngredientData[] = recipeData.recipe_ingredients.map((ri: unknown) => ({
        id: ri.material_id,
        name: ri.materials.name,
        quantity: ri.quantity,
        unit: ri.unit,
        cost: ri.materials.unit_cost || 0,
        yield_factor: ri.materials.yield_factor || 1.0
      }));

      return this.calculateCostBreakdown(ingredients, {
        servingSize: recipeData.serving_size || 1,
        targetFoodCostPercentage: 30,
        wasteFactor: 0.05 // 5% desperdicio por defecto
      });

    } catch (error) {
      console.error('Error calculating recipe cost:', error);
      // Retornar estructura vacía en caso de error
      return this.getEmptyResult();
    }
  }

  /**
   * Calcular breakdown de costos con precisión decimal
   */
  private static calculateCostBreakdown(
    ingredients: RecipeIngredientData[],
    config: {
      servingSize: number;
      targetFoodCostPercentage: number;
      wasteFactor: number;
    }
  ): CostCalculationResult {
    
    let totalCostDec = DecimalUtils.fromValue(0, 'recipe');
    const ingredientBreakdown: any[] = [];

    // Calcular costo de cada ingrediente con factor de rendimiento
    ingredients.forEach(ingredient => {
      const quantityDec = DecimalUtils.fromValue(ingredient.quantity, 'recipe');
      const costDec = DecimalUtils.fromValue(ingredient.cost, 'recipe');
      const yieldFactorDec = DecimalUtils.fromValue(ingredient.yield_factor || 1, 'recipe');
      
      // Costo base del ingrediente
      const baseCostDec = DecimalUtils.multiply(quantityDec, costDec, 'recipe');
      
      // Ajustar por factor de rendimiento (menor rendimiento = mayor costo)
      const yieldAdjustedCostDec = DecimalUtils.divide(baseCostDec, yieldFactorDec, 'recipe');
      
      totalCostDec = DecimalUtils.add(totalCostDec, yieldAdjustedCostDec, 'recipe');
      
      ingredientBreakdown.push({
        ingredient_id: ingredient.id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit_cost: DecimalUtils.toNumber(costDec),
        total_cost: DecimalUtils.toNumber(baseCostDec),
        yield_adjusted_cost: DecimalUtils.toNumber(yieldAdjustedCostDec),
        percentage_of_total: 0 // Se calculará después
      });
    });

    // Aplicar factor de desperdicio
    const wasteFactorDec = DecimalUtils.fromValue(1 + config.wasteFactor, 'recipe');
    totalCostDec = DecimalUtils.multiply(totalCostDec, wasteFactorDec, 'recipe');

    // Calcular costo por porción
    const servingSizeDec = DecimalUtils.fromValue(config.servingSize, 'recipe');
    const costPerPortionDec = DecimalUtils.divide(totalCostDec, servingSizeDec, 'recipe');

    // Calcular porcentajes de cada ingrediente
    ingredientBreakdown.forEach(item => {
      const itemCostDec = DecimalUtils.fromValue(item.yield_adjusted_cost, 'recipe');
      const percentageDec = DecimalUtils.calculatePercentage(itemCostDec, totalCostDec, 'recipe');
      item.percentage_of_total = DecimalUtils.toNumber(percentageDec);
    });

    // Análisis de rendimiento
    const yieldAnalysis: YieldAnalysis = this.calculateYieldAnalysis(ingredients, config.wasteFactor);

    // Métricas de rentabilidad
    const profitabilityMetrics: ProfitabilityMetrics = this.calculateProfitabilityMetrics(
      costPerPortionDec,
      config.targetFoodCostPercentage
    );

    return {
      total_cost: DecimalUtils.toNumber(totalCostDec),
      cost_per_unit: DecimalUtils.toNumber(costPerPortionDec),
      cost_per_portion: DecimalUtils.toNumber(costPerPortionDec),
      ingredient_breakdown: ingredientBreakdown,
      yield_analysis: yieldAnalysis,
      profitability_metrics: profitabilityMetrics
    };
  }

  /**
   * Análisis de rendimiento de ingredientes
   */
  private static calculateYieldAnalysis(ingredients: RecipeIngredientData[], wasteFactor: number): YieldAnalysis {
    const averageYieldDec = ingredients.length > 0 
      ? ingredients.reduce((sum, ingredient) => {
          return DecimalUtils.add(sum, ingredient.yield_factor || 1, 'recipe');
        }, DecimalUtils.fromValue(0, 'recipe'))
      : DecimalUtils.fromValue(1, 'recipe');

    const avgYieldDec = DecimalUtils.divide(averageYieldDec, ingredients.length || 1, 'recipe');
    const wasteFactorDec = DecimalUtils.fromValue(wasteFactor, 'recipe');
    const actualYieldDec = DecimalUtils.subtract(avgYieldDec, wasteFactorDec, 'recipe');
    
    return {
      theoretical_yield: DecimalUtils.toNumber(avgYieldDec),
      actual_yield: DecimalUtils.toNumber(actualYieldDec),
      yield_percentage: DecimalUtils.toNumber(
        DecimalUtils.calculatePercentage(actualYieldDec, avgYieldDec, 'recipe')
      ),
      waste_factor: wasteFactor,
      efficiency_score: DecimalUtils.toNumber(actualYieldDec) * 100
    };
  }

  /**
   * Calcular métricas de rentabilidad
   */
  private static calculateProfitabilityMetrics(
    costPerPortionDec: any,
    targetFoodCostPercentage: number
  ): ProfitabilityMetrics {
    const targetFoodCostDec = DecimalUtils.fromValue(targetFoodCostPercentage / 100, 'recipe');
    
    // Precio sugerido basado en el target food cost percentage
    const suggestedPriceDec = DecimalUtils.divide(costPerPortionDec, targetFoodCostDec, 'recipe');
    
    // Margen de ganancia
    const profitMarginDec = DecimalUtils.calculateProfitMargin(suggestedPriceDec, costPerPortionDec);
    
    // Precio de punto de equilibrio (costo + 10% mínimo)
    const breakEvenPriceDec = DecimalUtils.multiply(costPerPortionDec, DecimalUtils.fromValue(1.1, 'recipe'), 'recipe');

    return {
      suggested_selling_price: DecimalUtils.toNumber(suggestedPriceDec),
      profit_margin: DecimalUtils.toNumber(profitMarginDec),
      food_cost_percentage: targetFoodCostPercentage,
      break_even_price: DecimalUtils.toNumber(breakEvenPriceDec),
      target_food_cost_percentage: targetFoodCostPercentage
    };
  }

  /**
   * Resultado vacío para casos de error
   */
  private static getEmptyResult(): CostCalculationResult {
    return {
      total_cost: 0,
      cost_per_unit: 0,
      cost_per_portion: 0,
      ingredient_breakdown: [],
      yield_analysis: {
        theoretical_yield: 0,
        actual_yield: 0,
        yield_percentage: 0,
        waste_factor: 0,
        efficiency_score: 0
      },
      profitability_metrics: {
        suggested_selling_price: 0,
        profit_margin: 0,
        food_cost_percentage: 30,
        break_even_price: 0,
        target_food_cost_percentage: 30
      }
    };
  }
}

export const calculateRecipeCost = SmartCostCalculationEngine.calculateRecipeCostWithYield;
