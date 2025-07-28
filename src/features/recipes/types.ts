// src/features/recipes/types.ts
export interface Recipe {
  id: string;
  name: string;
  output_item_id: string;
  output_quantity: number;
  preparation_time?: number; // en minutos
  instructions?: string;
  created_at?: string;
  updated_at?: string;
  
  // Relaciones
  output_item?: {
    id: string;
    name: string;
    unit: string;
    type: string;
  };
  recipe_ingredients?: RecipeIngredient[];
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  item_id: string;
  quantity: number;
  
  // Relaciones
  item?: {
    id: string;
    name: string;
    unit: string;
    type: string;
    stock: number;
    unit_cost?: number;
  };
}

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