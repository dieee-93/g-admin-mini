/**
 * Recipe TanStack Query Hooks
 *
 * CRUD operations for recipes with TanStack Query
 * Following Customers/Cash module patterns
 *
 * @see src/hooks/useCustomers.ts - Reference implementation
 * @see ZUSTAND_TANSTACK_MIGRATION_AUDIT.md - Migration plan
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notify } from '@/lib/notifications'
import { logger } from '@/lib/logging/Logger'
import {
  fetchRecipes,
  fetchRecipeById,
  createRecipe as createRecipeApi,
  updateRecipe as updateRecipeApi,
  deleteRecipe as deleteRecipeApi,
  executeRecipe as executeRecipeApi,
  checkRecipeViability
} from '../services/recipeApi'
import type { Recipe, RecipeEntityType, CreateRecipeInput, UpdateRecipeInput } from '../types/recipe'

// ============================================
// TYPES
// ============================================

export interface RecipeFilters {
  searchTerm?: string
  entityType?: RecipeEntityType | 'all'
}

// ============================================
// QUERY KEYS
// ============================================

export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (filters?: RecipeFilters) => [...recipeKeys.lists(), { filters }] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
  viability: (id: string) => [...recipeKeys.detail(id), 'viability'] as const,
  executions: (id: string) => [...recipeKeys.detail(id), 'executions'] as const,
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all recipes with optional filtering
 */
export function useRecipes(filters?: RecipeFilters) {
  return useQuery({
    queryKey: recipeKeys.list(filters),
    queryFn: async () => {
      logger.info('useRecipes' as any, 'Fetching recipes', { filters })

      try {
        const recipes = await fetchRecipes()

        // Apply client-side filters
        let filtered = recipes

        if (filters?.entityType && filters.entityType !== 'all') {
          filtered = filtered.filter(r => r.entityType === filters.entityType)
        }

        if (filters?.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter(
            r =>
              r.name.toLowerCase().includes(searchLower) ||
              r.description?.toLowerCase().includes(searchLower)
          )
        }

        return filtered
      } catch (error) {
        logger.error('useRecipes' as any, 'Failed to fetch recipes', error)
        throw error
      }
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch a single recipe by ID
 */
export function useRecipe(id: string | undefined) {
  return useQuery({
    queryKey: recipeKeys.detail(id!),
    queryFn: async () => {
      if (!id) throw new Error('Recipe ID is required')

      logger.info('useRecipe' as any, 'Fetching recipe', { id })

      try {
        return await fetchRecipeById(id)
      } catch (error) {
        logger.error('useRecipe' as any, 'Failed to fetch recipe', error)
        throw error
      }
    },
    enabled: !!id,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Check recipe viability (can it be executed?)
 */
export function useRecipeViability(id: string | undefined) {
  return useQuery({
    queryKey: recipeKeys.viability(id!),
    queryFn: async () => {
      if (!id) throw new Error('Recipe ID is required')

      logger.info('useRecipeViability' as any, 'Checking viability', { id })

      try {
        return await checkRecipeViability(id)
      } catch (error) {
        logger.error('useRecipeViability' as any, 'Failed to check viability', error)
        throw error
      }
    },
    enabled: !!id,
    staleTime: 10000, // 10 seconds (viability can change quickly)
    gcTime: 1 * 60 * 1000, // 1 minute
  })
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create a new recipe
 */
export function useCreateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateRecipeInput) => {
      logger.info('useCreateRecipe' as any, 'Creating recipe', { name: input.name })

      try {
        return await createRecipeApi(input)
      } catch (error) {
        logger.error('useCreateRecipe' as any, 'Failed to create recipe', error)
        throw error
      }
    },
    onSuccess: (recipe) => {
      // Invalidate recipes list
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() })

      // Set the new recipe in cache
      queryClient.setQueryData(recipeKeys.detail(recipe.id), recipe)

      notify.success({ title: 'Receta creada exitosamente' })
      logger.info('useCreateRecipe' as any, 'Recipe created', { id: recipe.id })
    },
    onError: (error: Error) => {
      notify.error({ title: 'Error al crear receta', description: error.message })
    },
  })
}

/**
 * Update an existing recipe
 */
export function useUpdateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateRecipeInput }) => {
      logger.info('useUpdateRecipe' as any, 'Updating recipe', { id })

      try {
        return await updateRecipeApi(id, updates)
      } catch (error) {
        logger.error('useUpdateRecipe' as any, 'Failed to update recipe', error)
        throw error
      }
    },
    onSuccess: (recipe) => {
      // Invalidate and update cache
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() })
      queryClient.setQueryData(recipeKeys.detail(recipe.id), recipe)

      notify.success({ title: 'Receta actualizada exitosamente' })
      logger.info('useUpdateRecipe' as any, 'Recipe updated', { id: recipe.id })
    },
    onError: (error: Error) => {
      notify.error({ title: 'Error al actualizar receta', description: error.message })
    },
  })
}

/**
 * Delete a recipe
 */
export function useDeleteRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      logger.info('useDeleteRecipe' as any, 'Deleting recipe', { id })

      try {
        await deleteRecipeApi(id)
        return id
      } catch (error) {
        logger.error('useDeleteRecipe' as any, 'Failed to delete recipe', error)
        throw error
      }
    },
    onSuccess: (id) => {
      // Invalidate lists and remove from cache
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() })
      queryClient.removeQueries({ queryKey: recipeKeys.detail(id) })
      queryClient.removeQueries({ queryKey: recipeKeys.viability(id) })

      notify.success({ title: 'Receta eliminada exitosamente' })
      logger.info('useDeleteRecipe' as any, 'Recipe deleted', { id })
    },
    onError: (error: Error) => {
      notify.error({ title: 'Error al eliminar receta', description: error.message })
    },
  })
}

/**
 * Execute a recipe (production)
 */
export function useExecuteRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ExecuteRecipeInput) => {
      logger.info('useExecuteRecipe' as any, 'Executing recipe', { recipeId: input.recipeId })

      try {
        return await executeRecipeApi(input.recipeId, input.batches, input.executedBy)
      } catch (error) {
        logger.error('useExecuteRecipe' as any, 'Failed to execute recipe', error)
        throw error
      }
    },
    onSuccess: (execution) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: recipeKeys.viability(execution.recipeId) })
      queryClient.invalidateQueries({ queryKey: recipeKeys.executions(execution.recipeId) })
      queryClient.invalidateQueries({ queryKey: recipeKeys.detail(execution.recipeId) })

      // Invalidate materials/products stock (if applicable)
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })

      notify.success({ title: 'Receta ejecutada exitosamente' })
      logger.info('useExecuteRecipe' as any, 'Recipe executed', { executionId: execution.id })
    },
    onError: (error: Error) => {
      notify.error({ title: 'Error al ejecutar receta', description: error.message })
    },
  })
}

// ============================================
// COMPOSITE HOOKS
// ============================================

/**
 * Hook that combines recipe data + viability
 * Useful for recipe details pages
 */
export function useRecipeWithViability(id: string | undefined) {
  const recipe = useRecipe(id)
  const viability = useRecipeViability(id)

  return {
    recipe: recipe.data,
    viability: viability.data,
    isLoading: recipe.isLoading || viability.isLoading,
    error: recipe.error || viability.error,
    refetch: () => {
      recipe.refetch()
      viability.refetch()
    },
  }
}
