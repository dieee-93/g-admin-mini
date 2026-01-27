/**
 * Recipe Cost Calculation Hooks
 *
 * Hooks for calculating and managing recipe costs
 * Uses RecipeCostEngine for calculations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logging/Logger'
import { RecipeCostEngine } from '../services/costEngine'
import type { CalculateCostInput, RecipeCostResult, RecipeCostOptions } from '../types/costing'
import { recipeKeys } from './useRecipes'

// ============================================
// QUERY KEYS FACTORY
// ============================================

export const recipeCostKeys = {
  all: ['recipe-costs'] as const,
  calculations: () => [...recipeCostKeys.all, 'calculation'] as const,
  calculation: (recipeId: string) => [...recipeCostKeys.calculations(), recipeId] as const,
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Calculate recipe cost (with caching)
 *
 * This hook caches the cost calculation result
 * Useful for displaying costs that don't change frequently
 */
export function useRecipeCost(
  input: CalculateCostInput | undefined,
  options?: RecipeCostOptions
) {
  return useQuery({
    queryKey: recipeCostKeys.calculation(input?.recipeId ?? 'none'),
    queryFn: async () => {
      if (!input) throw new Error('Recipe cost input is required')

      logger.info('useRecipeCost' as any, 'Calculating recipe cost', {
        recipeId: input.recipeId,
        inputsCount: input.inputs.length
      })

      try {
        return await RecipeCostEngine.calculateRecipeCost(input, options)
      } catch (error) {
        logger.error('useRecipeCost' as any, 'Failed to calculate cost', error)
        throw error
      }
    },
    enabled: !!input,
    staleTime: 60000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================
// IMPERATIVE HOOKS
// ============================================

/**
 * Hook for imperative cost calculations
 *
 * Useful for:
 * - Real-time cost preview in forms
 * - Quick cost estimation
 * - One-off calculations without caching
 */
export function useCalculateRecipeCost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      input,
      options,
    }: {
      input: CalculateCostInput
      options?: RecipeCostOptions
    }) => {
      logger.info('useCalculateRecipeCost' as any, 'Calculating cost (imperative)', {
        recipeId: input.recipeId,
      })

      try {
        return await RecipeCostEngine.calculateRecipeCost(input, options)
      } catch (error) {
        logger.error('useCalculateRecipeCost' as any, 'Failed to calculate cost', error)
        throw error
      }
    },
    onSuccess: (result, variables) => {
      // Cache the result for future use
      if (variables.input.recipeId) {
        queryClient.setQueryData(
          recipeCostKeys.calculation(variables.input.recipeId),
          result
        )
      }

      logger.info('useCalculateRecipeCost' as any, 'Cost calculated', {
        totalCost: result.totalCost,
        costPerUnit: result.costPerUnit,
      })
    },
  })
}

/**
 * Hook for quick cost estimation (without DB fetch)
 *
 * Uses unitCostOverride from inputs, doesn't fetch from DB
 * Perfect for real-time UI updates
 */
export function useQuickCostEstimate() {
  return {
    estimateCost: (inputs: CalculateCostInput['inputs']): number => {
      try {
        return RecipeCostEngine.estimateQuickCost(inputs)
      } catch (error) {
        logger.error('useQuickCostEstimate' as any, 'Failed to estimate cost', error)
        return 0
      }
    },
  }
}

/**
 * Hook for scaling recipe costs
 *
 * Useful for batch production calculations
 */
export function useScaleRecipeCost() {
  return {
    scaleCost: (originalCost: RecipeCostResult, scaleFactor: number): RecipeCostResult => {
      try {
        return RecipeCostEngine.scaleRecipeCost(originalCost, scaleFactor)
      } catch (error) {
        logger.error('useScaleRecipeCost' as any, 'Failed to scale cost', error)
        return originalCost
      }
    },
  }
}

// ============================================
// INVALIDATION HELPERS
// ============================================

/**
 * Hook to invalidate cost calculations
 *
 * Useful when:
 * - Material prices change
 * - Recipe inputs are modified
 * - Labor rates are updated
 */
export function useInvalidateRecipeCosts() {
  const queryClient = useQueryClient()

  return {
    /**
     * Invalidate cost for a specific recipe
     */
    invalidateRecipeCost: (recipeId: string) => {
      queryClient.invalidateQueries({
        queryKey: recipeCostKeys.calculation(recipeId),
      })
    },

    /**
     * Invalidate all recipe costs
     */
    invalidateAllRecipeCosts: () => {
      queryClient.invalidateQueries({
        queryKey: recipeCostKeys.calculations(),
      })
    },

    /**
     * Invalidate recipe and its cost together
     */
    invalidateRecipeWithCost: (recipeId: string) => {
      queryClient.invalidateQueries({
        queryKey: recipeKeys.detail(recipeId),
      })
      queryClient.invalidateQueries({
        queryKey: recipeCostKeys.calculation(recipeId),
      })
    },
  }
}

// ============================================
// COMPOSITE HOOKS
// ============================================

/**
 * Hook that provides all cost calculation functionality
 *
 * One hook to rule them all!
 */
export function useRecipeCosts() {
  const calculateCost = useCalculateRecipeCost()
  const quickEstimate = useQuickCostEstimate()
  const scaleCost = useScaleRecipeCost()
  const invalidate = useInvalidateRecipeCosts()

  return {
    // Imperative calculation
    calculateCost: calculateCost.mutate,
    calculateCostAsync: calculateCost.mutateAsync,
    isCalculating: calculateCost.isPending,
    calculationError: calculateCost.error,

    // Quick estimation (sync)
    estimateQuickCost: quickEstimate.estimateCost,

    // Scaling
    scaleRecipeCost: scaleCost.scaleCost,

    // Invalidation
    invalidateRecipeCost: invalidate.invalidateRecipeCost,
    invalidateAllRecipeCosts: invalidate.invalidateAllRecipeCosts,
    invalidateRecipeWithCost: invalidate.invalidateRecipeWithCost,
  }
}
