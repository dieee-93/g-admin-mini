// src/features/recipes/logic/useRecipes.ts
import { useEffect, useState } from 'react';
import { 
  type Recipe, 
  type RecipeWithCost, 
  type RecipeViability,
  type RecipeExecution,
  type CreateRecipeData 
} from '../types';
import { 
  fetchRecipes,
  fetchRecipesWithCosts,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  calculateRecipeCost,
  checkRecipeViability,
  executeRecipe
} from '../api/recipeApi';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesWithCosts, setRecipesWithCosts] = useState<RecipeWithCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCosts, setLoadingCosts] = useState(false);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const data = await fetchRecipes();
      setRecipes(data);
    } catch (e) {
      console.error('Error loading recipes:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const loadRecipesWithCosts = async () => {
    setLoadingCosts(true);
    try {
      const data = await fetchRecipesWithCosts();
      setRecipesWithCosts(data);
    } catch (e) {
      console.error('Error loading recipes with costs:', e);
      throw e;
    } finally {
      setLoadingCosts(false);
    }
  };

  const addRecipe = async (recipeData: CreateRecipeData): Promise<Recipe> => {
    const newRecipe = await createRecipe(recipeData);
    await loadRecipes();
    await loadRecipesWithCosts(); // Refrescar también los costos
    return newRecipe;
  };

  const editRecipe = async (
    id: string, 
    updates: Partial<CreateRecipeData>
  ): Promise<Recipe> => {
    const updatedRecipe = await updateRecipe(id, updates);
    await loadRecipes();
    await loadRecipesWithCosts();
    return updatedRecipe;
  };

  const removeRecipe = async (id: string): Promise<void> => {
    await deleteRecipe(id);
    await loadRecipes();
    await loadRecipesWithCosts();
  };

  useEffect(() => {
    loadRecipes();
    loadRecipesWithCosts();
  }, []);

  return { 
    recipes,
    recipesWithCosts,
    loading,
    loadingCosts,
    addRecipe,
    editRecipe,
    removeRecipe,
    reloadRecipes: loadRecipes,
    reloadRecipesWithCosts: loadRecipesWithCosts
  };
}

export function useRecipeOperations() {
  const [loading, setLoading] = useState(false);

  const getCost = async (recipeId: string): Promise<number> => {
    setLoading(true);
    try {
      return await calculateRecipeCost(recipeId);
    } catch (e) {
      console.error('Error calculating recipe cost:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const checkViability = async (recipeId: string): Promise<RecipeViability> => {
    setLoading(true);
    try {
      return await checkRecipeViability(recipeId);
    } catch (e) {
      console.error('Error checking recipe viability:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const execute = async (
    recipeId: string, 
    batches: number = 1
  ): Promise<RecipeExecution> => {
    setLoading(true);
    try {
      return await executeRecipe(recipeId, batches);
    } catch (e) {
      console.error('Error executing recipe:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getCost,
    checkViability,
    execute
  };
}