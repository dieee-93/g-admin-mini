// ==========================================
// RECIPE CORE TYPES - Simplified Essential Types
// Only the types actually used in the application
// ==========================================

// ===== ESSENTIAL RECIPE TYPES =====

export interface Recipe {
  // Core Information (required for all recipes)
  id: string;
  name: string;
  output_item_id: string;
  output_quantity: number;
  instructions?: string;
  created_at?: string;
  updated_at?: string;
  
  // Basic Recipe Info (commonly used)
  description?: string;
  preparation_time?: number; // in minutes
  serving_size?: number;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  recipe_category?: RecipeCategory;
  
  // Essential Cost Data
  base_cost?: number;
  
  // Common Metadata
  allergens?: string[];
  dietary_tags?: string[];
  image_url?: string;
  
  // Relations (existing compatibility)
  item?: {
    id: string;
    name: string;
    unit: string;
    type: string;
    stock: number;
    unit_cost?: number;
  };
}

export interface RecipeWithCost extends Recipe {
  // Cost calculation results
  total_cost: number;
  cost_per_unit: number;
  cost_breakdown?: {
    ingredients: number;
    labor: number;
    overhead: number;
  };
}

export interface RecipeIngredient {
  // Core ingredient data
  id: string;
  recipe_id: string;
  item_id: string;
  quantity: number;
  unit: string;
  notes?: string;
  
  // Cost calculation
  unit_cost?: number;
  extended_cost?: number;
  
  // Relations (existing compatibility)
  item?: {
    id: string;
    name: string;
    unit: string;
    type: string;
    stock: number;
    unit_cost?: number;
  };
}

// ===== ENUMS (Essential Only) =====

export enum RecipeCategory {
  APPETIZER = 'appetizer',
  SOUP = 'soup',
  SALAD = 'salad',
  MAIN_COURSE = 'main_course',
  SIDE_DISH = 'side_dish',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
  SAUCE = 'sauce',
  MARINADE = 'marinade',
  PREPARATION = 'preparation'
}

// ===== SIMPLE REQUEST/RESPONSE TYPES =====

export interface CreateRecipeRequest {
  name: string;
  output_item_id: string;
  output_quantity: number;
  instructions?: string;
  description?: string;
  preparation_time?: number;
  difficulty_level?: Recipe['difficulty_level'];
  recipe_category?: RecipeCategory;
  ingredients: Array<{
    item_id: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
}

export interface UpdateRecipeRequest {
  name?: string;
  output_quantity?: number;
  instructions?: string;
  description?: string;
  preparation_time?: number;
  difficulty_level?: Recipe['difficulty_level'];
  recipe_category?: RecipeCategory;
  ingredients?: Array<{
    item_id: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
}

export interface RecipeListResponse {
  recipes: Recipe[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface RecipeCostAnalysis {
  recipe_id: string;
  total_cost: number;
  cost_per_unit: number;
  cost_breakdown: {
    ingredients: number;
    labor: number;
    overhead: number;
  };
  margin_analysis: {
    suggested_price: number;
    profit_margin: number;
  };
}

// ===== FILTERS AND QUERIES =====

export interface RecipeFilters {
  search?: string;
  category?: RecipeCategory;
  difficulty_level?: Recipe['difficulty_level'];
  has_allergens?: boolean;
  dietary_tags?: string[];
  max_prep_time?: number;
  cost_range?: {
    min: number;
    max: number;
  };
}

export interface RecipeQuery {
  filters?: RecipeFilters;
  sort_by?: 'name' | 'created_at' | 'total_cost' | 'preparation_time';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

// ===== ERROR TYPES =====

export interface RecipeError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export class RecipeValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: any
  ) {
    super(message);
    this.name = 'RecipeValidationError';
  }
}

export class RecipeCostCalculationError extends Error {
  constructor(
    message: string,
    public recipe_id: string,
    public missing_costs: string[]
  ) {
    super(message);
    this.name = 'RecipeCostCalculationError';
  }
}

// ===== UTILITY TYPES =====

export type RecipeStatus = 'draft' | 'active' | 'archived';

export interface RecipeMetrics {
  total_recipes: number;
  active_recipes: number;
  avg_cost_per_recipe: number;
  most_expensive_recipe: Recipe;
  least_expensive_recipe: Recipe;
}

// ===== ADDITIONAL TYPES FOR API COMPATIBILITY =====

export enum QualityGrade {
  PREMIUM = 'premium',
  STANDARD = 'standard',
  ECONOMY = 'economy'
}

export interface RecipeViability {
  is_viable: boolean;
  confidence_score: number;
  limiting_factors: string[];
  cost_effectiveness: number;
  market_potential: number;
  production_complexity: number;
  ingredient_availability: number;
  seasonal_factors: string[];
  recommendations: string[];
}

export interface RecipeExecution {
  id: string;
  recipe_id: string;
  batch_size: number;
  execution_date: string;
  actual_cost: number;
  actual_yield: number;
  quality_score: number;
  notes: string;
  variances: Record<string, unknown>;
}

export interface CreateRecipeData {
  name: string;
  description?: string;
  output_item_id: string;
  output_quantity: number;
  preparation_time?: number;
  instructions?: string;
  difficulty_level?: Recipe['difficulty_level'];
  recipe_category?: RecipeCategory;
  ingredients: Array<{
    item_id: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
}

export interface RecipeCostWithYield {
  recipe_id: string;
  base_cost: number;
  yield_adjusted_cost: number;
  waste_cost: number;
  labor_cost: number;
  total_cost: number;
  cost_per_unit: number;
  yield_percentage: number;
  profit_margin: number;
}

export interface CostCalculationParameters {
  include_labor: boolean;
  include_overhead: boolean;
  waste_percentage: number;
  yield_assumptions: Record<string, number>;
  pricing_date: string;
}

export interface IngredientCostDetail {
  item_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
  cost_per_recipe_unit: number;
  supplier: string;
  last_price_update: string;
  price_volatility: 'low' | 'medium' | 'high';
}

export interface CostBreakdown {
  ingredients_cost: number;
  labor_cost: number;
  overhead_cost: number;
  packaging_cost: number;
  total_direct_cost: number;
  waste_allowance: number;
  final_cost: number;
  cost_per_unit: number;
}

export interface YieldAnalysis {
  expected_yield: number;
  actual_yield: number;
  yield_variance: number;
  yield_percentage: number;
  waste_analysis: Record<string, number>;
  improvement_suggestions: string[];
}

export interface ProfitabilityMetrics {
  cost_per_unit: number;
  suggested_selling_price: number;
  profit_margin: number;
  break_even_quantity: number;
  roi_percentage: number;
  payback_period_days: number;
}

export interface YieldSuggestion {
  current_yield: number;
  suggested_yield: number;
  improvement_potential: number;
  implementation_steps: string[];
  cost_impact: number;
}

// ===== TYPE ALIASES FOR COMPATIBILITY =====
export type MenuEngineeringData = Record<string, unknown>;
export type PopularityMetrics = Record<string, unknown>;
export type SalesPerformanceData = Record<string, unknown>;
export type ProductionPlanningData = Record<string, unknown>;
export type BatchOptimizationData = Record<string, unknown>;
export type QualityControlData = Record<string, unknown>;
export type WorkflowStep = Record<string, unknown>;
export type TimingRequirement = Record<string, unknown>;
export type EquipmentRequirement = Record<string, unknown>;
export type SkillRequirement = Record<string, unknown>;
export type IngredientSubstitution = Record<string, unknown>;
export type QualityRequirement = Record<string, unknown>;
export type NutritionalContribution = Record<string, unknown>;
export type AllergenInfo = Record<string, unknown>;
export type SupplierData = Record<string, unknown>;
export type SeasonalAvailability = Record<string, unknown>;

// Re-export core types for easy import
export type {
  Recipe as CoreRecipe,
  RecipeWithCost as CoreRecipeWithCost,
  RecipeIngredient as CoreRecipeIngredient
};