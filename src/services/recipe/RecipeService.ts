// Recipe Service - Business logic layer
import type { Recipe, RecipeIngredient, RecipeValidationResult, RecipeCalculations, RecipeBuilderConfig } from './types';
import { recipeAPI } from './RecipeAPI';

class RecipeService {
  // Recipe validation
  validateRecipe(recipe: Partial<Recipe>): RecipeValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!recipe.name?.trim()) {
      errors.push('El nombre de la receta es obligatorio');
    }
    
    if (!recipe.type) {
      errors.push('El tipo de receta (producto/material) es obligatorio');
    }
    
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      errors.push('La receta debe tener al menos un ingrediente');
    }

    // Validate ingredients
    recipe.ingredients?.forEach((ingredient, index) => {
      if (!ingredient.name?.trim()) {
        errors.push(`Ingrediente ${index + 1}: nombre es obligatorio`);
      }
      
      if (!ingredient.quantity || ingredient.quantity <= 0) {
        errors.push(`Ingrediente ${index + 1}: cantidad debe ser mayor a 0`);
      }
      
      if (!ingredient.unit?.trim()) {
        errors.push(`Ingrediente ${index + 1}: unidad es obligatoria`);
      }

      if (ingredient.cost < 0) {
        warnings.push(`Ingrediente ${index + 1}: costo negativo puede causar problemas`);
      }
    });

    // Business logic validations
    if (recipe.servingSize && recipe.servingSize <= 0) {
      errors.push('El tamaño de porción debe ser mayor a 0');
    }

    if (recipe.type === 'product' && recipe.suggestedPrice && recipe.totalCost && recipe.suggestedPrice <= recipe.totalCost) {
      warnings.push('El precio sugerido es menor o igual al costo total, no habrá ganancia');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Cost calculations
  calculateRecipeCosts(recipe: Recipe): RecipeCalculations {
    const totalCost = recipe.ingredients.reduce(
      (sum, ingredient) => sum + (ingredient.cost * ingredient.quantity), 
      0
    );

    const costPerServing = recipe.servingSize > 0 
      ? totalCost / recipe.servingSize 
      : totalCost;

    const calculations: RecipeCalculations = {
      totalCost,
      costPerServing
    };

    // Product-specific calculations
    if (recipe.type === 'product' && recipe.suggestedPrice) {
      calculations.marginAmount = recipe.suggestedPrice - costPerServing;
      calculations.profitPercentage = costPerServing > 0 
        ? ((recipe.suggestedPrice - costPerServing) / costPerServing) * 100 
        : 0;
      calculations.breakEvenPrice = costPerServing * 1.1; // 10% minimum margin
    }

    return calculations;
  }

  // Recipe builder configuration
  getBuilderConfig(mode: 'product' | 'material'): RecipeBuilderConfig {
    return {
      mode,
      showPricing: mode === 'product',
      showNutrition: mode === 'product',
      allowSubRecipes: true,
      costCalculationMode: 'automatic'
    };
  }

  // Recipe templates
  getRecipeTemplate(type: 'product' | 'material'): Partial<Recipe> {
    const base = {
      name: '',
      description: '',
      type,
      category: '',
      servingSize: 1,
      servingUnit: type === 'product' ? 'porción' : 'unidad',
      ingredients: [],
      steps: [],
      difficulty: 'medium' as const,
      prepTime: 0,
      cookTime: 0,
      tags: [],
      allergens: []
    };

    if (type === 'product') {
      return {
        ...base,
        suggestedPrice: 0,
        marginPercentage: 30 // 30% default margin
      };
    }

    return base;
  }

  // Import/Export functionality
  exportRecipe(recipe: Recipe): string {
    return JSON.stringify(recipe, null, 2);
  }

  importRecipe(jsonData: string): Recipe {
    try {
      const recipe = JSON.parse(jsonData) as Recipe;
      const validation = this.validateRecipe(recipe);
      
      if (!validation.isValid) {
        throw new Error(`Receta inválida: ${validation.errors.join(', ')}`);
      }
      
      return recipe;
    } catch (error) {
      throw new Error(`Error al importar receta: ${error.message}`);
    }
  }

  // Recipe scaling
  scaleRecipe(recipe: Recipe, scaleFactor: number): Recipe {
    if (scaleFactor <= 0) {
      throw new Error('El factor de escala debe ser mayor a 0');
    }

    return {
      ...recipe,
      servingSize: recipe.servingSize * scaleFactor,
      ingredients: recipe.ingredients.map(ingredient => ({
        ...ingredient,
        quantity: ingredient.quantity * scaleFactor
      })),
      steps: recipe.steps.map(step => ({
        ...step,
        duration: step.duration ? Math.round(step.duration * scaleFactor) : undefined
      }))
    };
  }

  // Recipe comparison
  compareRecipes(recipe1: Recipe, recipe2: Recipe): {
    costDifference: number;
    ingredientsDifference: string[];
    similarityScore: number;
  } {
    const costDifference = this.calculateRecipeCosts(recipe1).totalCost - 
                          this.calculateRecipeCosts(recipe2).totalCost;

    const ingredients1 = new Set(recipe1.ingredients.map(i => i.name.toLowerCase()));
    const ingredients2 = new Set(recipe2.ingredients.map(i => i.name.toLowerCase()));
    
    const onlyIn1 = [...ingredients1].filter(x => !ingredients2.has(x));
    const onlyIn2 = [...ingredients2].filter(x => !ingredients1.has(x));
    
    const ingredientsDifference = [
      ...onlyIn1.map(i => `Solo en ${recipe1.name}: ${i}`),
      ...onlyIn2.map(i => `Solo en ${recipe2.name}: ${i}`)
    ];

    const intersection = [...ingredients1].filter(x => ingredients2.has(x));
    const union = new Set([...ingredients1, ...ingredients2]);
    const similarityScore = intersection.length / union.size;

    return {
      costDifference,
      ingredientsDifference,
      similarityScore: Math.round(similarityScore * 100) / 100
    };
  }
}

export const recipeService = new RecipeService();