// ==========================================
// ADVANCED NUTRITION TYPES - Lazy Loaded
// Only loaded when nutritional features are needed
// ==========================================

export interface NutritionalProfile {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  saturated_fat: number;
  cholesterol: number;
  sodium: number;
  fiber: number;
  sugars: number;
  
  // Extended vitamins (optional)
  vitamin_a?: number;
  vitamin_c?: number;
  vitamin_d?: number;
  calcium?: number;
  iron?: number;
}

export interface NutritionalContribution {
  calories_per_serving: number;
  protein_percentage: number;
  carb_percentage: number;
  fat_percentage: number;
}

export interface AllergenInfo {
  allergen: string;
  severity: 'trace' | 'contains' | 'may_contain';
  notes?: string;
}

export enum DietaryFlag {
  VEGAN = 'vegan',
  VEGETARIAN = 'vegetarian',
  GLUTEN_FREE = 'gluten_free',
  DAIRY_FREE = 'dairy_free',
  KETO = 'keto',
  PALEO = 'paleo',
  LOW_CARB = 'low_carb',
  HIGH_PROTEIN = 'high_protein'
}

export interface RecipeWithNutrition {
  id: string;
  name: string;
  nutritional_profile: NutritionalProfile;
  allergen_profile: AllergenInfo[];
  dietary_flags: DietaryFlag[];
}

export interface NutritionalAnalysis {
  recipe_id: string;
  per_serving: NutritionalProfile;
  per_100g: NutritionalProfile;
  health_score: number;
  dietary_compliance: DietaryFlag[];
}