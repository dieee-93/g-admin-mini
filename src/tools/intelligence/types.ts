// ==========================================
// G-ADMIN RECIPES MODULE - RECIPE INTELLIGENCE SYSTEM v3.0
// Following Screaming Architecture Pattern
// Smart Cost Calculation + Menu Engineering + Production Intelligence + Kitchen Automation
// ==========================================

// ===== CORE RECIPE TYPES =====

export interface Recipe {
  // Basic Information (existing compatibility)
  id: string;
  name: string;
  output_item_id: string;
  output_quantity: number;
  preparation_time?: number; // en minutos
  instructions?: string;
  created_at?: string;
  updated_at?: string;
  
  // Enhanced Recipe Intelligence
  description?: string;
  difficulty_level?: DifficultyLevel;
  recipe_category?: RecipeCategory;
  dietary_flags?: DietaryFlag[];
  allergen_warnings?: AllergenInfo[];
  kitchen_station?: KitchenStation;
  
  // Nutritional Intelligence
  nutritional_profile?: NutritionalProfile;
  portion_size?: number; // grams
  servings_per_batch?: number;
  
  // Cost Intelligence
  cost_breakdown?: CostBreakdown;
  yield_analysis?: YieldAnalysis;
  profitability_metrics?: ProfitabilityMetrics;
  
  // Menu Engineering Integration
  menu_engineering?: MenuEngineeringData;
  popularity_metrics?: PopularityMetrics;
  sales_performance?: SalesPerformanceData;
  
  // Production Intelligence
  production_planning?: ProductionPlanningData;
  batch_optimization?: BatchOptimizationData;
  quality_control?: QualityControlData;
  
  // Kitchen Workflow
  workflow_steps?: WorkflowStep[];
  timing_requirements?: TimingRequirement[];
  equipment_requirements?: EquipmentRequirement[];
  skill_requirements?: SkillRequirement[];
  
  // Relations (existing compatibility)
  output_item?: {
    id: string;
    name: string;
    unit: string;
    type: string;
  };
  recipe_ingredients?: RecipeIngredient[];
}

export interface RecipeIngredient {
  // Basic Information (existing compatibility)
  id: string;
  recipe_id: string;
  item_id: string;
  quantity: number;
  
  // Enhanced Ingredient Intelligence
  ingredient_role?: IngredientRole;
  preparation_method?: PreparationMethod;
  substitution_options?: IngredientSubstitution[];
  quality_requirements?: QualityRequirement;
  
  // Yield Management
  yield_percentage?: number;
  waste_percentage?: number;
  shrinkage_factor?: number;
  conversion_factor?: number;
  
  // Cost Intelligence
  unit_cost?: number;
  extended_cost?: number;
  cost_percentage?: number; // % of total recipe cost
  price_volatility?: PriceVolatility;
  
  // Nutritional Contribution
  nutritional_contribution?: NutritionalContribution;
  allergen_profile?: AllergenInfo[];
  
  // Sourcing Intelligence
  supplier_data?: SupplierData;
  seasonal_availability?: SeasonalAvailability;
  sustainability_score?: number;
  
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

// ===== ENUMS & CONSTANTS =====

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

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
  STOCK = 'stock',
  BREAD = 'bread',
  PASTA = 'pasta'
}

export enum KitchenStation {
  COLD_STATION = 'cold_station',
  HOT_STATION = 'hot_station',
  GRILL = 'grill',
  FRYER = 'fryer',
  SAUTE = 'saute',
  ROAST = 'roast',
  PREP = 'prep',
  PASTRY = 'pastry',
  BAR = 'bar',
  EXPO = 'expo'
}

export enum IngredientRole {
  BASE = 'base',           // Main ingredient
  FLAVOR = 'flavor',       // Spices, herbs
  TEXTURE = 'texture',     // Binding agents
  COLOR = 'color',         // Visual enhancement
  GARNISH = 'garnish',     // Finishing touch
  STRUCTURE = 'structure'  // Flour, eggs in baking
}

export enum PreparationMethod {
  RAW = 'raw',
  CHOPPED = 'chopped',
  DICED = 'diced',
  MINCED = 'minced',
  SLICED = 'sliced',
  JULIENNED = 'julienned',
  GRATED = 'grated',
  PUREED = 'pureed'
}

export enum QualityGrade {
  PREMIUM = 'premium',
  STANDARD = 'standard',
  ECONOMY = 'economy'
}

export enum PriceVolatility {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum HealthCategory {
  LIGHT = 'light',
  BALANCED = 'balanced',
  INDULGENT = 'indulgent'
}

export enum DietaryFlag {
  VEGAN = 'vegan',
  VEGETARIAN = 'vegetarian',
  GLUTEN_FREE = 'gluten_free',
  DAIRY_FREE = 'dairy_free',
  KETO = 'keto',
  PALEO = 'paleo',
  HALAL = 'halal',
  KOSHER = 'kosher',
  LOW_CARB = 'low_carb',
  LOW_FAT = 'low_fat',
  LOW_SODIUM = 'low_sodium',
  HIGH_PROTEIN = 'high_protein'
}

export enum MenuCategory {
  STARS = 'stars',           // High profit + High popularity
  PLOWHORSES = 'plowhorses', // Low profit + High popularity  
  PUZZLES = 'puzzles',       // High profit + Low popularity
  DOGS = 'dogs'              // Low profit + Low popularity
}

// ===== NUTRITIONAL SYSTEM =====

export interface NutritionalProfile {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  saturated_fat: number;
  trans_fat: number;
  cholesterol: number;
  sodium: number;
  fiber: number;
  sugars: number;
  added_sugars: number;
  
  // Vitamins & Minerals
  vitamin_a: number;
  vitamin_c: number;
  vitamin_d: number;
  calcium: number;
  iron: number;
  potassium: number;
}

// ===== LEGACY COMPATIBILITY TYPES =====

export interface RecipeWithCost {
  id: string;
  name: string;
  output_item_id: string;
  output_quantity: number;
  total_cost: number;
  cost_per_unit: number;
  preparation_time?: number;
  instructions?: string;
  ingredient_count: number;
  is_viable: boolean;
  missing_ingredients?: any;
  output_item?: {
    id: string;
    name: string;
    unit: string;
    type: string;
  };
}

export interface RecipeViability {
  is_viable: boolean;
  missing_ingredients: {
    item_id: string;
    item_name: string;
    required: number;
    available: number;
    missing: number;
  }[];
}

export interface RecipeExecution {
  success: boolean;
  message: string;
  items_consumed: {
    item_id: string;
    item_name: string;
    quantity: number;
  }[];
  items_produced: {
    item_id: string;
    item_name: string;
    quantity: number;
  }[];
}

export interface CreateRecipeData {
  name: string;
  output_item_id: string;
  output_quantity: number;
  preparation_time?: number;
  instructions?: string;
  ingredients: {
    item_id: string;
    quantity: number;
  }[];
}

// ===== PLACEHOLDER TYPES FOR FUTURE IMPLEMENTATION =====
// These types are referenced above but will be implemented in Phase 2 & 3

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

// ===== SMART COST CALCULATOR TYPES (IMPLEMENTED) =====

export interface CostBreakdown {
  total_cost: number;
  cost_per_unit: number;
  labor_cost?: number;
  overhead_cost?: number;
  ingredient_costs: IngredientCostDetail[];
  cost_efficiency_score: number;
  profit_margin_percentage?: number;
  suggested_selling_price?: number;
}

export interface IngredientCostDetail {
  ingredient_id: string;
  ingredient_name: string;
  quantity_required: number;
  unit: string;
  unit_cost: number;
  extended_cost: number;
  cost_percentage: number;
  yield_percentage: number;
  waste_percentage: number;
  effective_cost: number; // After accounting for yield/waste
}

export interface YieldAnalysis {
  theoretical_yield: number;
  actual_yield: number;
  yield_percentage: number;
  waste_factor: number;
  shrinkage_factor: number;
  conversion_losses: number;
  quality_grade_impact: number;
  yield_optimization_suggestions: YieldSuggestion[];
}

export interface YieldSuggestion {
  type: 'ingredient_substitution' | 'technique_improvement' | 'quality_upgrade' | 'portion_optimization';
  suggestion: string;
  potential_savings: number;
  implementation_difficulty: 'easy' | 'medium' | 'hard';
  impact_score: number;
}

export interface ProfitabilityMetrics {
  cost_per_serving: number;
  suggested_menu_price: number;
  profit_margin: number;
  profit_margin_percentage: number;
  break_even_volume: number;
  roi_projection: number;
  price_elasticity_score?: number;
  competitive_pricing_analysis?: CompetitivePricing;
}

export interface CompetitivePricing {
  market_average: number;
  price_position: 'below_market' | 'at_market' | 'premium';
  value_score: number;
  recommended_price_range: {
    min: number;
    max: number;
    optimal: number;
  };
}

export interface RecipeCostWithYield {
  recipe_id: string;
  recipe_name: string;
  cost_breakdown: CostBreakdown;
  yield_analysis: YieldAnalysis;
  profitability_metrics: ProfitabilityMetrics;
  optimization_score: number;
  last_calculated: string;
  calculation_parameters: CostCalculationParameters;
}

export interface CostCalculationParameters {
  include_labor: boolean;
  include_overhead: boolean;
  labor_cost_per_hour?: number;
  overhead_percentage?: number;
  yield_assumptions: YieldAssumptions;
  quality_standards: QualityStandards;
}

export interface YieldAssumptions {
  default_waste_percentage: number;
  prep_loss_percentage: number;
  cooking_loss_percentage: number;
  service_loss_percentage: number;
}

export interface QualityStandards {
  ingredient_grade: QualityGrade;
  freshness_requirements: 'premium' | 'standard' | 'basic';
  consistency_tolerance: number;
}
