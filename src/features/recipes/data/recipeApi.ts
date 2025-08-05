// src/features/recipes/data/recipeApi.ts
import { supabase } from '@/lib/supabase';
import { 
  type Recipe, 
  type RecipeWithCost, 
  type RecipeViability, 
  type RecipeExecution,
  type CreateRecipeData
} from '../types';

// ===== CRUD BÁSICO =====

export async function fetchRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      output_item:items(id, name, unit, type),
      recipe_ingredients(
        id,
        item_id,
        quantity,
        item:items(id, name, unit, type, stock, unit_cost)
      )
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function fetchRecipeById(id: string): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      output_item:items(id, name, unit, type),
      recipe_ingredients(
        id,
        item_id,
        quantity,
        item:items(id, name, unit, type, stock, unit_cost)
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createRecipe(recipeData: CreateRecipeData): Promise<Recipe> {
  // Crear la receta principal
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert([{
      name: recipeData.name,
      output_item_id: recipeData.output_item_id,
      output_quantity: recipeData.output_quantity,
      preparation_time: recipeData.preparation_time,
      instructions: recipeData.instructions,
    }])
    .select()
    .single();

  if (recipeError) throw recipeError;

  // Crear los ingredientes
  if (recipeData.ingredients.length > 0) {
    const ingredients = recipeData.ingredients.map(ingredient => ({
      recipe_id: recipe.id,
      item_id: ingredient.item_id,
      quantity: ingredient.quantity,
    }));

    const { error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .insert(ingredients);

    if (ingredientsError) throw ingredientsError;
  }

  // Retornar la receta completa
  return await fetchRecipeById(recipe.id);
}

export async function updateRecipe(
  id: string, 
  updates: Partial<CreateRecipeData>
): Promise<Recipe> {
  // Actualizar la receta principal
  const { error: recipeError } = await supabase
    .from('recipes')
    .update({
      name: updates.name,
      output_item_id: updates.output_item_id,
      output_quantity: updates.output_quantity,
      preparation_time: updates.preparation_time,
      instructions: updates.instructions,
    })
    .eq('id', id);

  if (recipeError) throw recipeError;

  // Si se enviaron ingredientes, actualizarlos
  if (updates.ingredients) {
    // Eliminar ingredientes existentes
    await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', id);

    // Insertar nuevos ingredientes
    if (updates.ingredients.length > 0) {
      const ingredients = updates.ingredients.map(ingredient => ({
        recipe_id: id,
        item_id: ingredient.item_id,
        quantity: ingredient.quantity,
      }));

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredients);

      if (ingredientsError) throw ingredientsError;
    }
  }

  return await fetchRecipeById(id);
}

export async function deleteRecipe(id: string): Promise<void> {
  // Los ingredientes se eliminan automáticamente por CASCADE
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ===== FUNCIONES AVANZADAS (usando las funciones de Supabase) =====

export async function fetchRecipesWithCosts(): Promise<RecipeWithCost[]> {
  const { data, error } = await supabase
    .rpc('get_recipes_with_costs');
  
  if (error) throw error;
  return data || [];
}

export async function calculateRecipeCost(recipeId: string): Promise<number> {
  const { data, error } = await supabase
    .rpc('calculate_recipe_cost', { recipe_id: recipeId });
  
  if (error) {
    console.error('Cost calculation error:', error);
    throw new Error(`Error calculating recipe cost: ${error.message}`);
  }
  
  // Handle null/undefined data from database function
  const cost = typeof data === 'number' ? data : 0;
  return Math.max(0, cost); // Ensure non-negative
}

export async function checkRecipeViability(recipeId: string): Promise<RecipeViability> {
  const { data, error } = await supabase
    .rpc('get_recipe_viability', { recipe_id: recipeId });
  
  if (error) throw error;
  return data;
}

export async function executeRecipe(
  recipeId: string, 
  batches: number = 1
): Promise<RecipeExecution> {
  const { data, error } = await supabase
    .rpc('execute_recipe', { 
      recipe_id: recipeId, 
      batches: batches 
    });
  
  if (error) throw error;
  return data;
}