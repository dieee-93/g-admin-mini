// useRecipeBuilder - Shared logic for recipe building
import { useState, useCallback } from 'react';
import { recipeAPI, recipeService, type Recipe, type RecipeIngredient } from '@/services/recipe';

interface UseRecipeBuilderOptions {
  mode: 'product' | 'material';
  onSuccess?: (recipe: Recipe) => void;
  onError?: (error: Error) => void;
}

export const useRecipeBuilder = ({ mode, onSuccess, onError }: UseRecipeBuilderOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<Partial<Recipe>>(() => 
    recipeService.getRecipeTemplate(mode)
  );
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);

  // Add ingredient
  const addIngredient = useCallback(() => {
    const newIngredient: RecipeIngredient = {
      id: `ing-${Date.now()}`,
      name: '',
      quantity: 1,
      unit: mode === 'product' ? 'porción' : 'kg',
      cost: 0,
      notes: ''
    };
    
    setIngredients(prev => [...prev, newIngredient]);
  }, [mode]);

  // Update ingredient
  const updateIngredient = useCallback((index: number, field: keyof RecipeIngredient, value: any) => {
    setIngredients(prev => prev.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    ));
  }, []);

  // Remove ingredient
  const removeIngredient = useCallback((index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Update recipe field
  const updateRecipe = useCallback((field: keyof Recipe, value: any) => {
    setRecipe(prev => ({ ...prev, [field]: value }));
  }, []);

  // Calculate costs
  const calculateCosts = useCallback(() => {
    const totalCost = ingredients.reduce(
      (sum, ing) => sum + (ing.cost * ing.quantity), 
      0
    );

    const costPerServing = recipe.servingSize ? totalCost / recipe.servingSize : totalCost;

    setRecipe(prev => ({
      ...prev,
      totalCost,
      costPerServing,
      ingredients: [...ingredients]
    }));

    return { totalCost, costPerServing };
  }, [ingredients, recipe.servingSize]);

  // Save recipe
  const saveRecipe = useCallback(async () => {
    if (!recipe.name || ingredients.length === 0) {
      const error = new Error('Recipe name and ingredients are required');
      onError?.(error);
      return null;
    }

    setIsLoading(true);

    try {
      const completeRecipe: Recipe = {
        ...recipe,
        id: `recipe-${Date.now()}`,
        type: mode,
        ingredients,
        totalCost: recipe.totalCost || 0,
        costPerServing: recipe.costPerServing || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user' // TODO: Get from auth context
      } as Recipe;

      // Validate recipe
      const validation = recipeService.validateRecipe(completeRecipe);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Save to API
      const savedRecipe = await recipeAPI.createRecipe(completeRecipe);
      
      onSuccess?.(savedRecipe);
      return savedRecipe;
    } catch (error) {
      onError?.(error as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [recipe, ingredients, mode, onSuccess, onError]);

  // Get AI suggestions
  const getAISuggestions = useCallback(async (recipeName: string) => {
    if (!recipeName.trim()) return null;

    setIsLoading(true);

    try {
      const suggestions = await recipeAPI.getAISuggestions(recipeName, mode);
      
      // Apply suggestions to current recipe
      if (suggestions.ingredients.length > 0) {
        setIngredients(suggestions.ingredients);
      }

      return suggestions;
    } catch (error) {
      onError?.(error as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [mode, onError]);

  // Reset recipe
  const resetRecipe = useCallback(() => {
    setRecipe(recipeService.getRecipeTemplate(mode));
    setIngredients([]);
  }, [mode]);

  // Scale recipe
  const scaleRecipe = useCallback((factor: number) => {
    if (factor <= 0) return;

    setRecipe(prev => ({
      ...prev,
      servingSize: prev.servingSize ? prev.servingSize * factor : factor
    }));

    setIngredients(prev => prev.map(ing => ({
      ...ing,
      quantity: ing.quantity * factor
    })));
  }, []);

  // Get validation status
  const getValidation = useCallback(() => {
    const completeRecipe = {
      ...recipe,
      ingredients
    } as Recipe;

    return recipeService.validateRecipe(completeRecipe);
  }, [recipe, ingredients]);

  // Get cost calculations
  const getCostCalculations = useCallback(() => {
    if (!recipe.totalCost) return null;
    
    return recipeService.calculateRecipeCosts(recipe as Recipe);
  }, [recipe]);

  return {
    // State
    recipe,
    ingredients,
    isLoading,

    // Actions
    addIngredient,
    updateIngredient,
    removeIngredient,
    updateRecipe,
    calculateCosts,
    saveRecipe,
    getAISuggestions,
    resetRecipe,
    scaleRecipe,

    // Computed
    getValidation,
    getCostCalculations
  };
};