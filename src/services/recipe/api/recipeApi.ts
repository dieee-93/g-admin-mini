// src/features/recipes/data/recipeApi.ts
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import { 
  type Recipe, 
  type RecipeWithCost, 
  type RecipeViability, 
  type RecipeExecution,
  type CreateRecipeData,
  type RecipeCostWithYield,
  type CostCalculationParameters,
  type IngredientCostDetail,
  type CostBreakdown,
  type YieldAnalysis,
  type ProfitabilityMetrics,
  type YieldSuggestion,
  QualityGrade
} from '../types';

// ===== CRUD BÁSICO =====

export async function fetchRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      output_item:items(id, name, unit, type),
      recipe_ingredients(
        id,
        item_id,
        quantity,
        item:items(id, name, unit, type, stock, unit_cost)
      )
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function fetchRecipeById(id: string): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      output_item:items(id, name, unit, type),
      recipe_ingredients(
        id,
        item_id,
        quantity,
        item:items(id, name, unit, type, stock, unit_cost)
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createRecipe(recipeData: CreateRecipeData): Promise<Recipe> {
  const { ingredients, ...recipeDetails } = recipeData;

  const { data, error } = await supabase
    .from('recipes')
    .insert([
      {
        ...recipeDetails,
        recipe_ingredients: ingredients,
      },
    ])
    .select(`
      *,
      output_item:items(id, name, unit, type),
      recipe_ingredients(
        id,
        item_id,
        quantity,
        item:items(id, name, unit, type, stock, unit_cost)
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updateRecipe(
  id: string, 
  updates: Partial<CreateRecipeData>
): Promise<Recipe> {
  // Actualizar la receta principal
  const { error: recipeError } = await supabase
    .from('recipes')
    .update({
      name: updates.name,
      output_item_id: updates.output_item_id,
      output_quantity: updates.output_quantity,
      preparation_time: updates.preparation_time,
      instructions: updates.instructions,
    })
    .eq('id', id);

  if (recipeError) throw recipeError;

  // Si se enviaron ingredientes, actualizarlos
  if (updates.ingredients) {
    // Eliminar ingredientes existentes
    await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', id);

    // Insertar nuevos ingredientes
    if (updates.ingredients.length > 0) {
      const ingredients = updates.ingredients.map(ingredient => ({
        recipe_id: id,
        item_id: ingredient.item_id,
        quantity: ingredient.quantity,
      }));

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredients);

      if (ingredientsError) throw ingredientsError;
    }
  }

  return await fetchRecipeById(id);
}

export async function deleteRecipe(id: string): Promise<void> {
  // Los ingredientes se eliminan automáticamente por CASCADE
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ===== FUNCIONES AVANZADAS (usando las funciones de Supabase) =====

export async function fetchRecipesWithCosts(): Promise<RecipeWithCost[]> {
  const { data, error } = await supabase
    .rpc('get_recipes_with_costs');
  
  if (error) throw error;
  return data || [];
}

export async function calculateRecipeCost(recipeId: string): Promise<number> {
  const { data, error } = await supabase
    .rpc('calculate_recipe_cost', { recipe_id: recipeId });
  
  if (error) {
    logger.error('App', 'Cost calculation error:', error);
    throw new Error(`Error calculating recipe cost: ${error.message}`);
  }
  
  // Handle null/undefined data from database function
  const cost = typeof data === 'number' ? data : 0;
  return Math.max(0, cost); // Ensure non-negative
}

export async function checkRecipeViability(recipeId: string): Promise<RecipeViability> {
  const { data, error } = await supabase
    .rpc('get_recipe_viability', { recipe_id: recipeId });
  
  if (error) throw error;
  return data;
}

export async function executeRecipe(
  recipeId: string, 
  batches: number = 1
): Promise<RecipeExecution> {
  const { data, error } = await supabase
    .rpc('execute_recipe', { 
      recipe_id: recipeId, 
      batches: batches 
    });
  
  if (error) throw error;
  return data;
}
// ===== ENHANCED COST CALCULATION FUNCTIONS =====

export async function calculateRecipeCostWithYield(
  recipeId: string,
  parameters?: Partial<CostCalculationParameters>
): Promise<RecipeCostWithYield> {
  // Default calculation parameters
  const defaultParams: CostCalculationParameters = {
    include_labor: false,
    include_overhead: false,
    labor_cost_per_hour: 15.0,
    overhead_percentage: 20.0,
    yield_assumptions: {
      default_waste_percentage: 5.0,
      prep_loss_percentage: 3.0,
      cooking_loss_percentage: 8.0,
      service_loss_percentage: 2.0
    },
    quality_standards: {
      ingredient_grade: QualityGrade.STANDARD,
      freshness_requirements: 'standard',
      consistency_tolerance: 0.05
    }
  };

  const calcParams = { ...defaultParams, ...parameters };

  // Fetch the recipe with detailed ingredient data
  const recipe = await fetchRecipeById(recipeId);
  if (!recipe.recipe_ingredients) {
    throw new Error('Recipe ingredients not found');
  }

  // Calculate detailed ingredient costs
  const ingredient_costs: IngredientCostDetail[] = recipe.recipe_ingredients.map(ingredient => {
    const unitCost = ingredient.item?.unit_cost || 0;
    const quantity = ingredient.quantity;
    const extendedCost = unitCost * quantity;
    
    // Apply yield/waste factors
    const wastePercentage = calcParams.yield_assumptions.default_waste_percentage;
    const yieldPercentage = 100 - wastePercentage;
    const effectiveCost = extendedCost * (100 / yieldPercentage);

    return {
      ingredient_id: ingredient.item_id,
      ingredient_name: ingredient.item?.name || 'Unknown Item',
      quantity_required: quantity,
      unit: ingredient.item?.unit || '',
      unit_cost: unitCost,
      extended_cost: extendedCost,
      cost_percentage: 0, // Will calculate after total
      yield_percentage: yieldPercentage,
      waste_percentage: wastePercentage,
      effective_cost: effectiveCost
    };
  });

  // Calculate totals
  const totalIngredientCost = ingredient_costs.reduce((sum, ing) => sum + ing.effective_cost, 0);
  const laborCost = calcParams.include_labor ? (recipe.preparation_time || 0) / 60 * (calcParams.labor_cost_per_hour || 0) : 0;
  const overheadCost = calcParams.include_overhead ? totalIngredientCost * (calcParams.overhead_percentage || 0) / 100 : 0;
  const totalCost = totalIngredientCost + laborCost + overheadCost;

  // Update cost percentages
  ingredient_costs.forEach(ing => {
    ing.cost_percentage = totalCost > 0 ? (ing.effective_cost / totalCost) * 100 : 0;
  });

  // Build cost breakdown
  const cost_breakdown: CostBreakdown = {
    total_cost: totalCost,
    cost_per_unit: totalCost / recipe.output_quantity,
    labor_cost: laborCost,
    overhead_cost: overheadCost,
    ingredient_costs,
    cost_efficiency_score: calculateCostEfficiencyScore(ingredient_costs),
    profit_margin_percentage: 30.0, // Default target
    suggested_selling_price: totalCost * 1.43 // 30% profit margin
  };

  // Build yield analysis
  const yield_analysis: YieldAnalysis = {
    theoretical_yield: recipe.output_quantity,
    actual_yield: recipe.output_quantity * 0.93, // Assume 7% loss
    yield_percentage: 93.0,
    waste_factor: calcParams.yield_assumptions.default_waste_percentage / 100,
    shrinkage_factor: 0.05,
    conversion_losses: calcParams.yield_assumptions.cooking_loss_percentage / 100,
    quality_grade_impact: getQualityGradeImpact(calcParams.quality_standards.ingredient_grade),
    yield_optimization_suggestions: generateYieldSuggestions(ingredient_costs, calcParams)
  };

  // Build profitability metrics
  const profitability_metrics: ProfitabilityMetrics = {
    cost_per_serving: cost_breakdown.cost_per_unit,
    suggested_menu_price: cost_breakdown.suggested_selling_price || 0,
    profit_margin: (cost_breakdown.suggested_selling_price || 0) - cost_breakdown.cost_per_unit,
    profit_margin_percentage: 30.0,
    break_even_volume: Math.ceil(1000 / ((cost_breakdown.suggested_selling_price || 0) - cost_breakdown.cost_per_unit)),
    roi_projection: 1.43
  };

  return {
    recipe_id: recipeId,
    recipe_name: recipe.name,
    cost_breakdown,
    yield_analysis,
    profitability_metrics,
    optimization_score: calculateOptimizationScore(cost_breakdown, yield_analysis, profitability_metrics),
    last_calculated: new Date().toISOString(),
    calculation_parameters: calcParams
  };
}

// Helper functions
function calculateCostEfficiencyScore(ingredients: IngredientCostDetail[]): number {
  // Higher score for more balanced ingredient costs (no single ingredient dominates)
  const maxCostPercentage = Math.max(...ingredients.map(ing => ing.cost_percentage));
  return Math.max(0, 100 - maxCostPercentage);
}

function getQualityGradeImpact(grade: QualityGrade): number {
  switch (grade) {
    case QualityGrade.PREMIUM: return 0.95; // 5% quality loss
    case QualityGrade.STANDARD: return 0.90; // 10% quality loss  
    case QualityGrade.ECONOMY: return 0.85; // 15% quality loss
    default: return 0.90;
  }
}

function generateYieldSuggestions(
  ingredients: IngredientCostDetail[],
  params: CostCalculationParameters
): YieldSuggestion[] {
  const suggestions: YieldSuggestion[] = [];

  // Find most expensive ingredient for substitution suggestion
  const mostExpensiveIngredient = ingredients.reduce((max, ing) => 
    ing.cost_percentage > max.cost_percentage ? ing : max
  );

  if (mostExpensiveIngredient.cost_percentage > 40) {
    suggestions.push({
      type: 'ingredient_substitution',
      suggestion: `Consider substituting ${mostExpensiveIngredient.ingredient_name} with a more cost-effective alternative`,
      potential_savings: mostExpensiveIngredient.effective_cost * 0.25,
      implementation_difficulty: 'medium',
      impact_score: 8.5
    });
  }

  // Waste reduction suggestion
  if (params.yield_assumptions.default_waste_percentage > 7) {
    suggestions.push({
      type: 'technique_improvement',
      suggestion: `Implement better prep techniques to reduce waste from ${params.yield_assumptions.default_waste_percentage}% to 5%`,
      potential_savings: ingredients.reduce((sum, ing) => sum + ing.effective_cost, 0) * 0.02,
      implementation_difficulty: 'easy',
      impact_score: 7.0
    });
  }

  // Quality upgrade suggestion for low-grade ingredients
  if (params.quality_standards.ingredient_grade === QualityGrade.ECONOMY) {
    suggestions.push({
      type: 'quality_upgrade',
      suggestion: 'Upgrade to standard grade ingredients for better yield and customer satisfaction',
      potential_savings: -50, // Cost increase but value increase
      implementation_difficulty: 'easy',
      impact_score: 6.5
    });
  }

  return suggestions;
}

function calculateOptimizationScore(
  costBreakdown: CostBreakdown,
  yieldAnalysis: YieldAnalysis, 
  profitabilityMetrics: ProfitabilityMetrics
): number {
  // Weighted scoring: Cost efficiency (40%) + Yield efficiency (30%) + Profit potential (30%)
  const costScore = costBreakdown.cost_efficiency_score;
  const yieldScore = yieldAnalysis.yield_percentage;
  const profitScore = Math.min(100, profitabilityMetrics.profit_margin_percentage * 2);

  return (costScore * 0.4) + (yieldScore * 0.3) + (profitScore * 0.3);
}
