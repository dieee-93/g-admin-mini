/**
 * Recipe API Service
 *
 * API layer para operaciones CRUD de recetas con Supabase. 
 * Sincronizado con el esquema industrial corregido (numeric types + units).
 *
 * CHANGES v3.2:
 * - ✨ MIGRATION SYNC: Restored 'unit' and 'output_unit' mappings.
 * - 🎯 PRECISION: Full support for decimal quantities (numeric).
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
} from '../types'
import { validateCreateRecipeInput, createValidationError } from './recipeValidation'

const LOG_PREFIX = '[RecipeAPI]'

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function fetchRecipes(): Promise<Recipe[]> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(transformRecipeFromDB)
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to fetch recipes`, { error })
    throw error
  }
}

export async function fetchRecipeById(id: string): Promise<Recipe> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return transformRecipeFromDB(data)
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to fetch recipe ${id}`, { error })
    throw error
  }
}

export async function createRecipe(input: CreateRecipeInput): Promise<Recipe> {
  try {
    const validation = validateCreateRecipeInput(input)
    if (!validation.isValid) throw createValidationError(validation);

    const recipeData = transformRecipeToDB(input)
    const { data, error } = await supabase.from('recipes').insert([recipeData]).select().single()
    if (error) throw error

    if (input.inputs && input.inputs.length > 0) {
      const ingredients = input.inputs.map(inp => ({
        recipe_id: data.id,
        item_id: inp.itemId,
        quantity: inp.quantity,
        unit: inp.unit, // Restored after migration
        conversion_factor: inp.conversionFactor ?? 1,
        yield_percentage: inp.yieldPercentage ?? 100,
        waste_percentage: inp.wastePercentage ?? 0,
        unit_cost_override: inp.unitCostOverride
      }))
      const { error: ingError } = await supabase.from('recipe_ingredients').insert(ingredients)
      if (ingError) {
        await supabase.from('recipes').delete().eq('id', data.id)
        throw ingError
      }
    }

    return fetchRecipeById(data.id)
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to create recipe`, { error, input })
    throw error
  }
}

export async function updateRecipe(id: string, updates: UpdateRecipeInput): Promise<Recipe> {
  try {
    const updateData = transformRecipeToDB(updates);
    const { error } = await supabase.from('recipes').update(updateData).eq('id', id)
    if (error) throw error

    if (updates.inputs) {
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', id)
      const ingredients = updates.inputs.map(inp => ({
        recipe_id: id,
        item_id: inp.itemId,
        quantity: inp.quantity,
        unit: inp.unit, // Restored after migration
        conversion_factor: inp.conversionFactor ?? 1,
        yield_percentage: inp.yieldPercentage ?? 100,
        waste_percentage: inp.wastePercentage ?? 0,
        unit_cost_override: inp.unitCostOverride
      }))
      await supabase.from('recipe_ingredients').insert(ingredients)
    }

    return fetchRecipeById(id)
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to update recipe ${id}`, { error, updates })
    throw error
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('recipes').delete().eq('id', id)
    if (error) throw error
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to delete recipe ${id}`, { error })
    throw error
  }
}

// ============================================================================
// TRANSFORM HELPERS
// ============================================================================

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
      unit: data.output_unit, // Restored after migration
      yieldPercentage: data.yield_percentage,
      wastePercentage: data.waste_percentage,
    },

    inputs: (data.recipe_ingredients || []).map((ing: any) => ({
      id: ing.id,
      item: ing.item_id,
      quantity: ing.quantity,
      unit: ing.unit, // Restored after migration
      conversionFactor: ing.conversion_factor,
      yieldPercentage: ing.yield_percentage,
      wastePercentage: ing.waste_percentage,
      unitCostOverride: ing.unit_cost_override
    })),

    difficulty: data.difficulty_level,
    instructions: typeof data.instructions === 'string' ? JSON.parse(data.instructions) : data.instructions,
    notes: data.notes,
    imageUrl: data.image_url,

    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

function transformRecipeToDB(input: Partial<CreateRecipeInput>): any {
  const data: any = {};
  
  if (input.name !== undefined) data.name = input.name;
  if (input.description !== undefined) data.description = input.description;
  if (input.entityType !== undefined) data.entity_type = input.entityType;
  if (input.executionMode !== undefined) data.execution_mode = input.executionMode;

  if (input.outputItemId !== undefined) {
    data.output_item_id = input.outputItemId === 'temp' ? null : input.outputItemId;
  }
  if (input.outputQuantity !== undefined) data.output_quantity = input.outputQuantity;
  if (input.outputUnit !== undefined) data.output_unit = input.outputUnit; // Restored
  
  if (input.outputYieldPercentage !== undefined) data.yield_percentage = input.outputYieldPercentage;
  if (input.outputWastePercentage !== undefined) data.waste_percentage = input.outputWastePercentage;

  if (input.difficulty !== undefined) data.difficulty_level = input.difficulty;
  if (input.instructions !== undefined) data.instructions = JSON.stringify(input.instructions);
  if (input.notes !== undefined) data.notes = input.notes;
  if (input.imageUrl !== undefined) data.image_url = input.imageUrl;

  if (input.costConfig) {
    if (input.costConfig.laborHours !== undefined) data.labor_cost = input.costConfig.laborHours;
    if (input.costConfig.overheadFixed !== undefined) data.overhead_cost = input.costConfig.overheadFixed;
  }

  return data;
}

// ============================================================================
// ADVANCED OPERATIONS
// ============================================================================

export async function executeRecipe(recipeId: string, batches: number = 1, executedBy?: string): Promise<RecipeExecution> {
  const { data, error } = await supabase.rpc('execute_recipe', { p_recipe_id: recipeId, p_batches: batches, p_executed_by: executedBy });
  if (error) throw error;
  const { data: execution, error: fetchError } = await supabase.from('recipe_executions').select('*').eq('id', data).single();
  if (fetchError) throw fetchError;
  return execution;
}

export async function checkRecipeViability(recipeId: string): Promise<RecipeViability> {
  const { data, error } = await supabase.rpc('get_recipe_viability', { p_recipe_id: recipeId });
  if (error) throw error;
  return data;
}