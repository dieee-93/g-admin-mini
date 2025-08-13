// Recipe Service - Shared types for recipe functionality
export interface RecipeIngredient {
  id: string;
  materialId?: string; // For materials
  productId?: string; // For products (sub-recipes)
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  notes?: string;
}

export interface RecipeStep {
  id: string;
  order: number;
  description: string;
  duration?: number; // minutes
  temperature?: number;
  equipment?: string[];
  notes?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  type: 'product' | 'material'; // Context mode
  category: string;
  servingSize: number;
  servingUnit: string;
  
  // Ingredients and steps
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  
  // Costs and pricing (context-dependent)
  totalCost: number;
  costPerServing: number;
  suggestedPrice?: number; // for products
  marginPercentage?: number; // for products
  
  // Nutritional info
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  
  // Metadata
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number; // minutes
  cookTime: number; // minutes
  tags: string[];
  allergens: string[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface RecipeBuilderConfig {
  mode: 'product' | 'material';
  showPricing: boolean;
  showNutrition: boolean;
  allowSubRecipes: boolean;
  costCalculationMode: 'automatic' | 'manual';
}

export interface RecipeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RecipeCalculations {
  totalCost: number;
  costPerServing: number;
  marginAmount?: number;
  profitPercentage?: number;
  breakEvenPrice?: number;
}