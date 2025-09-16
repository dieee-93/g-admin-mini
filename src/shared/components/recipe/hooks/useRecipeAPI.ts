// useRecipeAPI - API operations hook
import { useState, useCallback } from 'react';
import { recipeAPI, type Recipe } from '../../../../services/recipe';

export const useRecipeAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: Error) => {
    setError(err.message);
    console.error('Recipe API Error:', err);
  }, []);

  const getRecipes = useCallback(async (type?: 'product' | 'material') => {
    setIsLoading(true);
    setError(null);

    try {
      const recipes = await recipeAPI.getRecipes(type);
      return recipes;
    } catch (err) {
      handleError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const getRecipe = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const recipe = await recipeAPI.getRecipe(id);
      return recipe;
    } catch (err) {
      handleError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const createRecipe = useCallback(async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);

    try {
      const newRecipe = await recipeAPI.createRecipe(recipe);
      return newRecipe;
    } catch (err) {
      handleError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const updateRecipe = useCallback(async (id: string, recipe: Partial<Recipe>) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedRecipe = await recipeAPI.updateRecipe(id, recipe);
      return updatedRecipe;
    } catch (err) {
      handleError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const deleteRecipe = useCallback(async (id: string, type: 'product' | 'material') => {
    setIsLoading(true);
    setError(null);

    try {
      await recipeAPI.deleteRecipe(id, type);
      return true;
    } catch (err) {
      handleError(err as Error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const getMaterials = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const materials = await recipeAPI.getMaterials();
      return materials;
    } catch (err) {
      handleError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const getProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const products = await recipeAPI.getProducts();
      return products;
    } catch (err) {
      handleError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const calculateCost = useCallback(async (ingredients: any[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const cost = await recipeAPI.calculateRecipeCost(ingredients);
      return cost;
    } catch (err) {
      handleError(err as Error);
      return 0;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const getAISuggestions = useCallback(async (recipeName: string, type: 'product' | 'material') => {
    setIsLoading(true);
    setError(null);

    try {
      const suggestions = await recipeAPI.getAISuggestions(recipeName, type);
      return suggestions;
    } catch (err) {
      handleError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const optimizeRecipe = useCallback(async (recipeId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const optimization = await recipeAPI.optimizeRecipe(recipeId);
      return optimization;
    } catch (err) {
      handleError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return {
    isLoading,
    error,
    clearError,
    
    // Recipe CRUD
    getRecipes,
    getRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    
    // Context data
    getMaterials,
    getProducts,
    
    // Calculations and AI
    calculateCost,
    getAISuggestions,
    optimizeRecipe
  };
};