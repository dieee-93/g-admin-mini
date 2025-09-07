// hooks/useRecipeStockValidation.ts
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface RecipeStockValidationResult {
  is_valid: boolean;
  error_message?: string;
  missing_ingredients?: Array<{
    item_id: string;
    item_name: string;
    required: number;
    available: number;
    missing: number;
  }>;
  cost_issues?: Array<{
    item_id: string;
    item_name: string;
    has_cost: boolean;
  }>;
}

export function useRecipeStockValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<RecipeStockValidationResult | null>(null);

  const validateRecipeStock = useCallback(async (recipeId: string, batches: number = 1) => {
    if (!recipeId) {
      const result = { is_valid: true };
      setValidationResult(result);
      return result;
    }

    setIsValidating(true);
    
    try {
      // Use the existing recipe viability function
      const { data, error } = await supabase.rpc('get_recipe_viability', {
        recipe_id: recipeId
      });

      if (error) {
        console.error('Error validating recipe stock:', error);
        const result = { 
          is_valid: false, 
          error_message: `Error de validación: ${error.message}` 
        };
        setValidationResult(result);
        return result;
      }

      // Transform the viability data to our validation format
      const result: RecipeStockValidationResult = {
        is_valid: data?.is_viable || false,
        missing_ingredients: data?.missing_ingredients?.map((item: unknown) => ({
          item_id: item.item_id,
          item_name: item.item_name,
          required: item.required * batches,
          available: item.available,
          missing: (item.required * batches) - item.available
        })) || []
      };

      if (!result.is_valid && result.missing_ingredients?.length === 0) {
        result.error_message = 'La receta no se puede ejecutar con el stock actual';
      }

      setValidationResult(result);
      return result;
      
    } catch (error) {
      console.error('Unexpected error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      const result = { 
        is_valid: false, 
        error_message: `Error inesperado: ${errorMessage}` 
      };
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    validateRecipeStock,
    clearValidation,
    isValidating,
    validationResult,
    hasValidation: validationResult !== null,
    isValid: validationResult?.is_valid ?? false
  };
}