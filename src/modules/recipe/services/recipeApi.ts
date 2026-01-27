/**
 * Recipe API Service
 *
 * API layer para operaciones CRUD de recetas con Supabase
 *
 * @module recipe/services/recipeApi
 */

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logging'
import type {
  Recipe,
  CreateRecipeInput,
  UpdateRecipeInput,
  RecipeExecution,
  ExecuteRecipeInput,
  RecipeViability,
  RecipeCostResult
} from '../types'
import { validateCreateRecipeInput, createValidationError } from './recipeValidation'

const LOG_PREFIX = '[RecipeAPI]'

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Obtiene todas las recetas
 */
export async function fetchRecipes(): Promise<Recipe[]> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients(
          id,
          item_id,
          quantity,
          unit,
          optional,
          substitute_for,
          yield_percentage,
          waste_percentage,
          unit_cost_override,
          conversion_factor,
          stage,
          stage_name,
          display_order
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error(`${LOG_PREFIX} Error fetching recipes`, { error })
      throw error
    }

    return transformRecipesFromDB(data || [])
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to fetch recipes`, { error })
    throw error
  }
}

/**
 * Obtiene una receta por ID
 */
export async function fetchRecipeById(id: string): Promise<Recipe> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients(
          id,
          item_id,
          quantity,
          unit,
          optional,
          substitute_for,
          yield_percentage,
          waste_percentage,
          unit_cost_override,
          conversion_factor,
          stage,
          stage_name,
          display_order
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      logger.error(`${LOG_PREFIX} Error fetching recipe ${id}`, { error })
      throw error
    }

    if (!data) {
      throw new Error(`Recipe not found: ${id}`)
    }

    return transformRecipeFromDB(data)
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to fetch recipe ${id}`, { error })
    throw error
  }
}

/**
 * Crea una nueva receta
 */
export async function createRecipe(input: CreateRecipeInput): Promise<Recipe> {
  try {
    // Validar input
    const validation = validateCreateRecipeInput(input)
    if (!validation.isValid) {
      throw createValidationError(validation, 'Cannot create recipe: validation failed')
    }

    // Log warnings si existen
    if (validation.warnings.length > 0) {
      logger.warn(`${LOG_PREFIX} Recipe creation warnings`, {
        warnings: validation.warnings
      })
    }

    // Preparar datos para DB
    const recipeData = transformRecipeToDB(input)

    // Crear receta
    const { data, error } = await supabase
      .from('recipes')
      .insert([recipeData])
      .select()
      .single()

    if (error) {
      logger.error(`${LOG_PREFIX} Error creating recipe`, { error, input })
      throw error
    }

    // Crear ingredients
    const ingredients = input.inputs.map(inp => ({
      recipe_id: data.id,
      item_id: inp.itemId,
      quantity: inp.quantity,
      unit: inp.unit,
      optional: inp.optional,
      substitute_for: inp.substituteFor,
      yield_percentage: inp.yieldPercentage ?? 100,
      waste_percentage: inp.wastePercentage ?? 0,
      unit_cost_override: inp.unitCostOverride,
      conversion_factor: inp.conversionFactor ?? 1,
      stage: inp.stage,
      stage_name: inp.stageName,
      display_order: inp.displayOrder
    }))

    const { error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .insert(ingredients)

    if (ingredientsError) {
      // Rollback: eliminar la receta creada
      await supabase.from('recipes').delete().eq('id', data.id)
      logger.error(`${LOG_PREFIX} Error creating ingredients, rolled back`, {
        error: ingredientsError,
        recipeId: data.id
      })
      throw ingredientsError
    }

    logger.info(`${LOG_PREFIX} Recipe created successfully`, {
      recipeId: data.id,
      name: input.name
    })

    // Retornar receta completa
    return fetchRecipeById(data.id)
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to create recipe`, { error, input })
    throw error
  }
}

/**
 * Actualiza una receta existente
 */
export async function updateRecipe(
  id: string,
  updates: UpdateRecipeInput
): Promise<Recipe> {
  try {
    // Preparar datos para DB
    const updateData: any = {}

    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.entityType !== undefined) updateData.entity_type = updates.entityType
    if (updates.executionMode !== undefined) updateData.execution_mode = updates.executionMode
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty
    if (updates.preparationTime !== undefined) updateData.preparation_time = updates.preparationTime
    if (updates.cookingTime !== undefined) updateData.cooking_time = updates.cookingTime
    if (updates.instructions !== undefined) updateData.instructions = updates.instructions
    if (updates.notes !== undefined) updateData.notes = updates.notes
    if (updates.costConfig !== undefined) updateData.cost_config = updates.costConfig
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl

    // Output
    if (updates.outputItemId !== undefined) updateData.output_item_id = updates.outputItemId
    if (updates.outputQuantity !== undefined) updateData.output_quantity = updates.outputQuantity
    if (updates.outputUnit !== undefined) updateData.output_unit = updates.outputUnit
    if (updates.outputYieldPercentage !== undefined) {
      updateData.output_yield_percentage = updates.outputYieldPercentage
    }
    if (updates.outputWastePercentage !== undefined) {
      updateData.output_waste_percentage = updates.outputWastePercentage
    }
    if (updates.outputQualityGrade !== undefined) {
      updateData.output_quality_grade = updates.outputQualityGrade
    }

    // Total time
    if (updates.preparationTime !== undefined || updates.cookingTime !== undefined) {
      const current = await fetchRecipeById(id)
      const prepTime = updates.preparationTime ?? current.preparationTime ?? 0
      const cookTime = updates.cookingTime ?? current.cookingTime ?? 0
      updateData.total_time = prepTime + cookTime
    }

    updateData.updated_at = new Date().toISOString()

    // Actualizar receta
    const { error } = await supabase
      .from('recipes')
      .update(updateData)
      .eq('id', id)

    if (error) {
      logger.error(`${LOG_PREFIX} Error updating recipe ${id}`, { error, updates })
      throw error
    }

    // Actualizar ingredients si se proporcionaron
    if (updates.inputs) {
      // Eliminar ingredients existentes
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', id)

      // Crear nuevos ingredients
      const ingredients = updates.inputs.map(inp => ({
        recipe_id: id,
        item_id: inp.itemId,
        quantity: inp.quantity,
        unit: inp.unit,
        optional: inp.optional,
        substitute_for: inp.substituteFor,
        yield_percentage: inp.yieldPercentage ?? 100,
        waste_percentage: inp.wastePercentage ?? 0,
        unit_cost_override: inp.unitCostOverride,
        conversion_factor: inp.conversionFactor ?? 1,
        stage: inp.stage,
        stage_name: inp.stageName,
        display_order: inp.displayOrder
      }))

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredients)

      if (ingredientsError) {
        logger.error(`${LOG_PREFIX} Error updating ingredients for recipe ${id}`, {
          error: ingredientsError
        })
        throw ingredientsError
      }
    }

    logger.info(`${LOG_PREFIX} Recipe updated successfully`, { recipeId: id })

    // Retornar receta actualizada
    return fetchRecipeById(id)
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to update recipe ${id}`, { error, updates })
    throw error
  }
}

/**
 * Elimina una receta
 */
export async function deleteRecipe(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error(`${LOG_PREFIX} Error deleting recipe ${id}`, { error })
      throw error
    }

    logger.info(`${LOG_PREFIX} Recipe deleted successfully`, { recipeId: id })
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to delete recipe ${id}`, { error })
    throw error
  }
}

// ============================================================================
// ADVANCED OPERATIONS
// ============================================================================

/**
 * Ejecuta una receta (producción)
 */
export async function executeRecipe(
  input: ExecuteRecipeInput
): Promise<RecipeExecution> {
  try {
    const { recipeId, batches = 1, notes } = input

    // Llamar RPC function
    const { data, error } = await supabase
      .rpc('execute_recipe', {
        p_recipe_id: recipeId,
        p_batches: batches,
        p_executed_by: null // TODO: obtener user ID del contexto
      })

    if (error) {
      logger.error(`${LOG_PREFIX} Error executing recipe ${recipeId}`, {
        error,
        batches
      })
      throw error
    }

    logger.info(`${LOG_PREFIX} Recipe executed successfully`, {
      recipeId,
      executionId: data,
      batches
    })

    // Fetch execution details
    const { data: execution, error: fetchError } = await supabase
      .from('recipe_executions')
      .select('*')
      .eq('id', data)
      .single()

    if (fetchError) throw fetchError

    return transformExecutionFromDB(execution)
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to execute recipe`, { error, input })
    throw error
  }
}

/**
 * Verifica la viabilidad de una receta (stock disponible, costos, etc.)
 */
export async function checkRecipeViability(
  recipeId: string
): Promise<RecipeViability> {
  try {
    const { data, error } = await supabase
      .rpc('get_recipe_viability', {
        p_recipe_id: recipeId
      })

    if (error) {
      logger.error(`${LOG_PREFIX} Error checking viability for recipe ${recipeId}`, {
        error
      })
      throw error
    }

    return data
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to check recipe viability`, {
      error,
      recipeId
    })
    throw error
  }
}

// ============================================================================
// TRANSFORM HELPERS
// ============================================================================

/**
 * Transforma recetas desde DB al formato del módulo
 */
function transformRecipesFromDB(data: any[]): Recipe[] {
  return data.map(transformRecipeFromDB)
}

/**
 * Transforma una receta desde DB al formato del módulo
 */
function transformRecipeFromDB(data: any): Recipe {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    entityType: data.entity_type,
    executionMode: data.execution_mode,

    output: {
      item: data.output_item_id,
      quantity: data.output_quantity,
      unit: data.output_unit,
      yieldPercentage: data.output_yield_percentage,
      wastePercentage: data.output_waste_percentage,
      qualityGrade: data.output_quality_grade
    },

    inputs: (data.recipe_ingredients || []).map((ing: any) => ({
      id: ing.id,
      item: ing.item_id,
      quantity: ing.quantity,
      unit: ing.unit,
      optional: ing.optional,
      substituteFor: ing.substitute_for,
      yieldPercentage: ing.yield_percentage,
      wastePercentage: ing.waste_percentage,
      unitCostOverride: ing.unit_cost_override,
      conversionFactor: ing.conversion_factor,
      stage: ing.stage,
      stageName: ing.stage_name,
      displayOrder: ing.display_order
    })),

    category: data.category,
    tags: data.tags,
    difficulty: data.difficulty,

    preparationTime: data.preparation_time,
    cookingTime: data.cooking_time,
    totalTime: data.total_time,

    instructions: data.instructions,
    notes: data.notes,

    costConfig: data.cost_config,
    metrics: data.metrics,

    imageUrl: data.image_url,

    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    createdBy: data.created_by,
    version: data.version
  }
}

/**
 * Transforma CreateRecipeInput al formato de DB
 */
function transformRecipeToDB(input: CreateRecipeInput): any {
  return {
    name: input.name,
    description: input.description,
    entity_type: input.entityType,
    execution_mode: input.executionMode,

    output_item_id: input.outputItemId,
    output_quantity: input.outputQuantity,
    output_unit: input.outputUnit,
    output_yield_percentage: input.outputYieldPercentage,
    output_waste_percentage: input.outputWastePercentage,
    output_quality_grade: input.outputQualityGrade,

    category: input.category,
    tags: input.tags,
    difficulty: input.difficulty,

    preparation_time: input.preparationTime,
    cooking_time: input.cookingTime,
    total_time: (input.preparationTime || 0) + (input.cookingTime || 0),

    instructions: input.instructions,
    notes: input.notes,

    cost_config: input.costConfig,

    image_url: input.imageUrl
  }
}

/**
 * Transforma execution desde DB
 */
function transformExecutionFromDB(data: any): RecipeExecution {
  return {
    id: data.id,
    recipeId: data.recipe_id,
    recipeName: data.recipe_name,

    batches: data.batches,
    outputQuantity: data.output_quantity,
    outputUnit: data.output_unit,

    inputsConsumed: data.inputs_consumed || [],

    expectedCost: data.expected_cost,
    actualCost: data.actual_cost,
    costVariance: data.cost_variance,

    startedAt: new Date(data.started_at),
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    expectedDuration: data.expected_duration,
    actualDuration: data.actual_duration,

    yieldPercentage: data.yield_percentage,
    qualityGrade: data.quality_grade,

    executedBy: data.executed_by,
    notes: data.notes,
    status: data.status,

    createdAt: new Date(data.created_at)
  }
}
