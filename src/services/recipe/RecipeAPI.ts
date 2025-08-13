// Recipe Service - API layer for recipe operations
import type { Recipe, RecipeIngredient } from './types';

class RecipeAPI {
  private baseURL = '/api';

  // Generic recipe operations
  async getRecipes(type?: 'product' | 'material'): Promise<Recipe[]> {
    const url = type 
      ? `${this.baseURL}/recipes?type=${type}`
      : `${this.baseURL}/recipes`;
    
    const response = await fetch(url);
    return response.json();
  }

  async getRecipe(id: string): Promise<Recipe> {
    const response = await fetch(`${this.baseURL}/recipes/${id}`);
    return response.json();
  }

  async createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipe> {
    const endpoint = recipe.type === 'product' 
      ? `${this.baseURL}/products/recipes`
      : `${this.baseURL}/materials/recipes`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe)
    });
    
    return response.json();
  }

  async updateRecipe(id: string, recipe: Partial<Recipe>): Promise<Recipe> {
    const endpoint = recipe.type === 'product'
      ? `${this.baseURL}/products/recipes/${id}`
      : `${this.baseURL}/materials/recipes/${id}`;
    
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe)
    });
    
    return response.json();
  }

  async deleteRecipe(id: string, type: 'product' | 'material'): Promise<void> {
    const endpoint = type === 'product'
      ? `${this.baseURL}/products/recipes/${id}`
      : `${this.baseURL}/materials/recipes/${id}`;
    
    await fetch(endpoint, { method: 'DELETE' });
  }

  // Context-specific operations
  async getMaterials(): Promise<Array<{ id: string; name: string; cost: number; unit: string }>> {
    const response = await fetch(`${this.baseURL}/materials`);
    return response.json();
  }

  async getProducts(): Promise<Array<{ id: string; name: string; cost: number; unit: string }>> {
    const response = await fetch(`${this.baseURL}/products`);
    return response.json();
  }

  // Cost calculations
  async calculateRecipeCost(ingredients: RecipeIngredient[]): Promise<number> {
    const response = await fetch(`${this.baseURL}/recipes/calculate-cost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients })
    });
    
    const result = await response.json();
    return result.totalCost;
  }

  // AI-powered suggestions
  async getAISuggestions(
    recipeName: string, 
    type: 'product' | 'material'
  ): Promise<{
    ingredients: RecipeIngredient[];
    steps: string[];
    nutritionEstimate?: Record<string, number>;
  }> {
    const response = await fetch(`${this.baseURL}/recipes/ai-suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: recipeName, type })
    });
    
    return response.json();
  }

  // Recipe optimization
  async optimizeRecipe(recipeId: string): Promise<{
    costReduction: number;
    alternativeIngredients: RecipeIngredient[];
    suggestions: string[];
  }> {
    const response = await fetch(`${this.baseURL}/recipes/${recipeId}/optimize`, {
      method: 'POST'
    });
    
    return response.json();
  }
}

export const recipeAPI = new RecipeAPI();