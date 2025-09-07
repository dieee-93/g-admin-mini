// Recipe Service - Business logic layer with Decimal.js precision
import type { Recipe, RecipeIngredient, RecipeValidationResult, RecipeCalculations, RecipeBuilderConfig } from './types';
import { recipeAPI } from './RecipeAPI';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { RecipeDecimal } from '@/config/decimal-config';
import { SmartCostCalculationEngine, calculateRecipeCost } from '@/business-logic/recipes/recipeCostCalculationEngine';

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

  // Cost calculations with Decimal.js precision
  calculateRecipeCosts(recipe: Recipe): RecipeCalculations {
    // Usar Decimal.js para cálculos de precisión crítica
    const totalCostDec = recipe.ingredients.reduce(
      (sum, ingredient) => {
        const ingredientCostDec = DecimalUtils.fromValue(ingredient.cost, 'recipe');
        const quantityDec = DecimalUtils.fromValue(ingredient.quantity, 'recipe');
        const ingredientTotalDec = DecimalUtils.multiply(ingredientCostDec, quantityDec, 'recipe');
        return DecimalUtils.add(sum, ingredientTotalDec, 'recipe');
      }, 
      DecimalUtils.fromValue(0, 'recipe')
    );

    const costPerServingDec = recipe.servingSize > 0 
      ? DecimalUtils.divide(totalCostDec, recipe.servingSize, 'recipe')
      : totalCostDec;

    const calculations: RecipeCalculations = {
      totalCost: DecimalUtils.toNumber(totalCostDec),
      costPerServing: DecimalUtils.toNumber(costPerServingDec)
    };

    // Product-specific calculations with precision
    if (recipe.type === 'product' && recipe.suggestedPrice) {
      const suggestedPriceDec = DecimalUtils.fromValue(recipe.suggestedPrice, 'recipe');
      
      // Margen absoluto
      const marginAmountDec = DecimalUtils.subtract(suggestedPriceDec, costPerServingDec, 'recipe');
      calculations.marginAmount = DecimalUtils.toNumber(marginAmountDec);
      
      // Porcentaje de ganancia (profit percentage)
      calculations.profitPercentage = DecimalUtils.isPositive(costPerServingDec)
        ? DecimalUtils.toNumber(DecimalUtils.calculateProfitMargin(suggestedPriceDec, costPerServingDec))
        : 0;
      
      // Precio de punto de equilibrio con 10% de margen mínimo
      const minMarginFactor = DecimalUtils.fromValue(1.1, 'recipe'); // 10% minimum margin
      const breakEvenPriceDec = DecimalUtils.multiply(costPerServingDec, minMarginFactor, 'recipe');
      calculations.breakEvenPrice = DecimalUtils.toNumber(breakEvenPriceDec);
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

  // Recipe scaling with Decimal.js precision
  scaleRecipe(recipe: Recipe, scaleFactor: number): Recipe {
    if (scaleFactor <= 0) {
      throw new Error('El factor de escala debe ser mayor a 0');
    }

    const scaleFactorDec = DecimalUtils.fromValue(scaleFactor, 'recipe');
    
    return {
      ...recipe,
      servingSize: DecimalUtils.toNumber(
        DecimalUtils.multiply(recipe.servingSize, scaleFactorDec, 'recipe')
      ),
      ingredients: recipe.ingredients.map(ingredient => ({
        ...ingredient,
        quantity: DecimalUtils.toNumber(
          DecimalUtils.scaleRecipe(ingredient.quantity, scaleFactorDec)
        )
      })),
      steps: recipe.steps.map(step => ({
        ...step,
        duration: step.duration 
          ? Math.round(DecimalUtils.toNumber(
              DecimalUtils.multiply(step.duration, scaleFactorDec, 'recipe')
            )) 
          : undefined
      }))
    };
  }

  // Recipe comparison with Decimal.js precision
  compareRecipes(recipe1: Recipe, recipe2: Recipe): {
    costDifference: number;
    ingredientsDifference: string[];
    similarityScore: number;
  } {
    const cost1Dec = DecimalUtils.fromValue(this.calculateRecipeCosts(recipe1).totalCost, 'recipe');
    const cost2Dec = DecimalUtils.fromValue(this.calculateRecipeCosts(recipe2).totalCost, 'recipe');
    const costDifferenceDec = DecimalUtils.subtract(cost1Dec, cost2Dec, 'recipe');

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
    
    // Calcular similaridad con precisión decimal
    const intersectionSizeDec = DecimalUtils.fromValue(intersection.length, 'recipe');
    const unionSizeDec = DecimalUtils.fromValue(union.size, 'recipe');
    const similarityScoreDec = DecimalUtils.divide(intersectionSizeDec, unionSizeDec, 'recipe');

    return {
      costDifference: DecimalUtils.toNumber(costDifferenceDec),
      ingredientsDifference,
      similarityScore: DecimalUtils.toNumber(
        DecimalUtils.fromValue(similarityScoreDec, 'recipe').toDecimalPlaces(2)
      )
    };
  }
}

export const recipeService = new RecipeService();