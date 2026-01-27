/**
 * useRecipeBuilder - Custom hook for RecipeBuilder form logic
 *
 * Follows the project's architecture pattern (similar to useMaterialForm, useProductValidation)
 * Replaces RecipeBuilderProvider context pattern with custom hook
 */

import { useState, useCallback, useMemo } from 'react'
import { logger } from '@/lib/logging/Logger'
import { validateRecipe } from '../services/recipeValidation'
import { useCreateRecipe, useUpdateRecipe } from './useRecipes'
import type { Recipe } from '../types/recipe'
import type {
  RecipeBuilderComplexity,
  RecipeBuilderFeatures,
  ValidationResult
} from '../components/RecipeBuilder/types'

// ============================================
// HOOK PARAMS
// ============================================

export interface UseRecipeBuilderParams {
  initialData?: Partial<Recipe>
  mode: 'create' | 'edit'
  entityType: 'material' | 'product' | 'kit' | 'service'
  complexity?: RecipeBuilderComplexity
  features?: RecipeBuilderFeatures
  onSave?: (recipe: Recipe) => void | Promise<void>
  customValidation?: (recipe: Partial<Recipe>) => ValidationResult
}

// ============================================
// DEFAULT FEATURES
// ============================================

const DEFAULT_FEATURES: Required<RecipeBuilderFeatures> = {
  showCostCalculation: true,
  showAnalytics: false,
  showInstructions: true,
  showYieldConfig: true,
  showQualityConfig: false,
  allowSubstitutions: true,  // ✅ Habilitado por defecto
  enableAiSuggestions: false,
}

// ============================================
// HOOK
// ============================================

export function useRecipeBuilder(params: UseRecipeBuilderParams) {
  const {
    initialData,
    mode,
    entityType,
    complexity = 'standard',
    features: featuresProps = {},
    onSave,
    customValidation,
  } = params

  // Merge features with defaults
  const features = useMemo(
    () => ({ ...DEFAULT_FEATURES, ...featuresProps }),
    [featuresProps]
  )

  // ============================================
  // STATE
  // ============================================

  const [recipe, setRecipe] = useState<Partial<Recipe>>(
    initialData ?? {
      name: '',
      description: '',
      entityType,
      inputs: [],
      output: { quantity: 1, unit: 'unit' },
      // Set executionMode based on entityType
      executionMode: entityType === 'material' ? 'immediate' : 'on_demand',
    }
  )

  // ============================================
  // MUTATIONS
  // ============================================

  const createRecipe = useCreateRecipe()
  const updateRecipeMutation = useUpdateRecipe()

  const isSubmitting = createRecipe.isPending || updateRecipeMutation.isPending

  // ============================================
  // VALIDATION
  // ============================================

  const validateRecipeCallback = useCallback((): ValidationResult => {
    try {
      // Use custom validation if provided
      if (customValidation) {
        return customValidation(recipe)
      }

      // Use default validation
      const validationResult = validateRecipe(recipe as Recipe)

      return validationResult
    } catch (error) {
      logger.error('useRecipeBuilder' as any, 'Validation error', error)
      return {
        isValid: false,
        errors: [`Validation failed: ${error}`],
        warnings: [],
      }
    }
  }, [recipe, customValidation])

  const validation = useMemo(() => validateRecipeCallback(), [validateRecipeCallback])

  // ============================================
  // UPDATE RECIPE
  // ============================================

  const updateRecipe = useCallback((updates: Partial<Recipe>) => {
    setRecipe((prev) => ({ ...prev, ...updates }))
  }, [])

  // ============================================
  // SAVE RECIPE
  // ============================================

  const saveRecipe = useCallback(async (): Promise<Recipe | null> => {
    // Validate before saving
    const currentValidation = validateRecipeCallback()
    if (!currentValidation.isValid) {
      logger.warn('useRecipeBuilder' as any, 'Cannot save: validation failed', {
        errors: currentValidation.errors,
      })
      return null
    }

    try {
      let savedRecipe: Recipe

      if (mode === 'edit' && recipe.id) {
        // Update existing
        logger.info('useRecipeBuilder' as any, 'Updating recipe', { id: recipe.id })
        savedRecipe = await updateRecipeMutation.mutateAsync({
          id: recipe.id,
          updates: recipe,
        })
      } else {
        // Create new
        logger.info('useRecipeBuilder' as any, 'Creating recipe', { name: recipe.name })
        savedRecipe = await createRecipe.mutateAsync(recipe)
      }

      // Call onSave callback
      if (onSave) {
        await onSave(savedRecipe)
      }

      logger.info('useRecipeBuilder' as any, 'Recipe saved', { id: savedRecipe.id })
      return savedRecipe
    } catch (error) {
      logger.error('useRecipeBuilder' as any, 'Failed to save recipe', error)
      return null
    }
  }, [recipe, mode, validateRecipeCallback, createRecipe, updateRecipeMutation, onSave])

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    recipe,
    updateRecipe,

    // Validation
    validation,
    validateRecipe: validateRecipeCallback,

    // Submission
    isSubmitting,
    saveRecipe,

    // Metadata
    mode,
    entityType,
    complexity,
    features,
  }
}
