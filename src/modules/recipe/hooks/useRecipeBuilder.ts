/**
 * useRecipeBuilder - Custom hook for RecipeBuilder form logic
 *
 * CHANGES v3.0:
 * - 🗑️ REMOVAL: Removed gastronomic fields and time mappings.
 * - 🔄 SYNC: Auto-sync name from parent form.
 * - 🏗️ ADAPTER: Flat mapping for API payload.
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { logger } from '@/lib/logging/Logger'
import { validateRecipe } from '../services/recipeValidation'
import { useCreateRecipe, useUpdateRecipe, useRecipe } from './useRecipes'
import type { Recipe } from '../types/recipe'
import type {
  RecipeBuilderComplexity,
  RecipeBuilderFeatures,
  ValidationResult
} from '../components/RecipeBuilder/types'

// ============================================
// PARAMS
// ============================================

export interface UseRecipeBuilderParams {
  initialData?: Partial<Recipe>
  recipeId?: string // 🆕 Added for loading existing data
  mode: 'create' | 'edit'
  entityType: 'material' | 'product' | 'kit' | 'service'
  complexity?: RecipeBuilderComplexity
  features?: RecipeBuilderFeatures
  onSave?: (recipe: Recipe) => void | Promise<void>
  customValidation?: (recipe: Partial<Recipe>) => ValidationResult
}

const DEFAULT_FEATURES: Required<RecipeBuilderFeatures> = {
  showCostCalculation: true,
  showAnalytics: false,
  showInstructions: true,
  showYieldConfig: true,
  showQualityConfig: false,
  allowSubstitutions: true,
  enableAiSuggestions: false,
}

// ============================================
// HOOK
// ============================================

export function useRecipeBuilder(params: UseRecipeBuilderParams) {
  const {
    initialData,
    recipeId,
    mode,
    entityType,
    complexity = 'standard',
    features: featuresProps = {},
    onSave,
    customValidation,
  } = params

  const features = useMemo(() => ({ ...DEFAULT_FEATURES, ...featuresProps }), [featuresProps])

  const [recipe, setRecipe] = useState<Partial<Recipe>>(
    initialData ?? {
      name: initialData?.name || '',
      description: initialData?.description || '',
      entityType,
      inputs: [],
      output: { 
        item: { id: 'temp', name: initialData?.name || 'Nuevo Item', type: 'material' },
        quantity: 1, 
        unit: 'unit' 
      },
      executionMode: entityType === 'material' ? 'immediate' : 'on_demand',
    }
  )

  // 🆕 Load existing recipe if recipeId is provided
  const { data: loadedRecipe, isLoading: isRecipeLoading } = useRecipe(recipeId);

  // 🆕 Sync loaded recipe to state
  useEffect(() => {
    if (loadedRecipe && mode === 'edit') {
      setRecipe(loadedRecipe);
    }
  }, [loadedRecipe, mode]);

  // Sync name from parent
  useEffect(() => {
    if (initialData?.name && recipe.name !== initialData.name) {
       setRecipe(prev => ({ ...prev, name: initialData.name }));
    }
  }, [initialData?.name, recipe.name]);

  const createRecipe = useCreateRecipe()
  const updateRecipeMutation = useUpdateRecipe()
  const isSubmitting = createRecipe.isPending || updateRecipeMutation.isPending

  const validateRecipeCallback = useCallback((): ValidationResult => {
    if (customValidation) return customValidation(recipe);
    return validateRecipe(recipe as Recipe);
  }, [recipe, customValidation]);

  const validation = useMemo(() => validateRecipeCallback(), [validateRecipeCallback])

  const updateRecipe = useCallback((updates: Partial<Recipe>) => {
    setRecipe((prev) => ({ ...prev, ...updates }))
  }, [])

  const saveRecipe = useCallback(async (): Promise<Recipe | null> => {
    const currentValidation = validateRecipeCallback()
    if (!currentValidation.isValid) return null;

    try {
      // TRANSFORM: UI State to API Payload (DTO)
      const apiPayload: any = {
        name: recipe.name,
        description: recipe.description,
        entityType: recipe.entityType,
        executionMode: recipe.executionMode,
        tags: recipe.tags,
        difficulty: recipe.difficulty,
        instructions: recipe.instructions,
        notes: recipe.notes,
        costConfig: recipe.costConfig,
        imageUrl: recipe.imageUrl,

        // Output Flat
        outputItemId: typeof recipe.output?.item === 'object' ? (recipe.output.item as any).id : recipe.output?.item,
        outputQuantity: recipe.output?.quantity,
        outputUnit: recipe.output?.unit,
        outputYieldPercentage: recipe.output?.yieldPercentage,
        outputWastePercentage: recipe.output?.wastePercentage,
        outputQualityGrade: recipe.output?.qualityGrade,

        // Inputs Flat
        inputs: recipe.inputs?.map(input => ({
          itemId: typeof input.item === 'object' ? (input.item as any).id : input.item,
          quantity: input.quantity,
          unit: input.unit,
          optional: input.optional,
          substituteFor: input.substituteFor,
          yieldPercentage: input.yieldPercentage,
          wastePercentage: input.wastePercentage,
          unitCostOverride: input.unitCostOverride,
          conversionFactor: input.conversionFactor,
          stage: input.stage,
          stageName: input.stageName,
          displayOrder: input.displayOrder
        })) || []
      };

      let savedRecipe: Recipe;
      if (mode === 'edit' && recipe.id) {
        savedRecipe = await updateRecipeMutation.mutateAsync({ id: recipe.id, updates: apiPayload });
      } else {
        savedRecipe = await createRecipe.mutateAsync(apiPayload);
      }

      if (onSave) await onSave(savedRecipe);
      return savedRecipe;
    } catch (error) {
      logger.error('useRecipeBuilder' as any, 'Failed to save recipe', error)
      return null
    }
  }, [recipe, mode, validateRecipeCallback, createRecipe, updateRecipeMutation, onSave])

  return {
    recipe,
    updateRecipe,
    validation,
    validateRecipe: validateRecipeCallback,
    isSubmitting,
    saveRecipe,
    mode,
    entityType,
    complexity,
    features,
  }
}