// ==========================================
// RECIPE TYPES - Optimized Export Index
// Core types are always available, advanced types are lazy-loaded
// ==========================================

// Always export core types (small bundle impact)
export * from './core';

// Re-export core types as primary exports for backward compatibility
export type { 
  Recipe, 
  RecipeWithCost, 
  RecipeIngredient,
  CreateRecipeRequest,
  UpdateRecipeRequest,
  RecipeFilters,
  RecipeQuery,
  RecipeCostAnalysis,
  RecipeError,
  RecipeValidationError,
  RecipeCostCalculationError
} from './core';

// ===== LAZY-LOADED ADVANCED TYPES =====
// These will only be loaded when explicitly imported

export const loadAdvancedNutritionTypes = () => 
  import('./nutrition').then(m => m);

export const loadAdvancedMenuTypes = () => 
  import('./menu-engineering').then(m => m);

export const loadAdvancedSupplierTypes = () => 
  import('./supplier').then(m => m);

export const loadAdvancedProductionTypes = () => 
  import('./production').then(m => m);

// ===== MIGRATION HELPERS =====
// For components that still reference the old complex types

/**
 * @deprecated Use core Recipe type instead
 * This provides a bridge for legacy code
 */
export interface LegacyRecipe extends Recipe {
  // Add any legacy fields here if needed during migration
  __legacy?: boolean;
}

/**
 * Type guard to check if advanced features are needed
 */
export function requiresAdvancedFeatures(recipe: Recipe): boolean {
  // Check if recipe uses any advanced fields that would require
  // loading additional type modules
  return !!(
    (recipe as any).nutritional_profile ||
    (recipe as any).menu_engineering_data ||
    (recipe as any).supplier_data ||
    (recipe as any).production_schedule
  );
}

/**
 * Utility to dynamically load types based on recipe complexity
 */
export async function loadTypesForRecipe(recipe: Recipe) {
  const modules: Promise<any>[] = [];
  
  if ((recipe as any).nutritional_profile) {
    modules.push(loadAdvancedNutritionTypes());
  }
  
  if ((recipe as any).menu_engineering_data) {
    modules.push(loadAdvancedMenuTypes());
  }
  
  if ((recipe as any).supplier_data) {
    modules.push(loadAdvancedSupplierTypes());
  }
  
  if ((recipe as any).production_schedule) {
    modules.push(loadAdvancedProductionTypes());
  }
  
  return Promise.all(modules);
}

// ===== DEFAULT EXPORT =====
// Export the core types as default for easy import
import type { 
  Recipe as CoreRecipe, 
  RecipeWithCost as CoreRecipeWithCost,
  RecipeIngredient as CoreRecipeIngredient 
} from './core';

export default {
  Recipe: {} as CoreRecipe,
  RecipeWithCost: {} as CoreRecipeWithCost,
  RecipeIngredient: {} as CoreRecipeIngredient
};