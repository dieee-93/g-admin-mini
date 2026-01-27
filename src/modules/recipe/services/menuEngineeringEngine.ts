/**
 * Menu Engineering Engine
 *
 * Engine para análisis Boston Matrix de recetas/productos.
 * Clasifica según popularidad y rentabilidad.
 *
 * @module recipe/services/menuEngineeringEngine
 */

import Decimal from 'decimal.js';
import type {
  RecipeSalesData,
  RecipeMenuMetrics,
  MenuEngineeringAnalysis,
  MenuEngineeringCategory,
  MenuEngineeringConfig,
  MenuEngineeringRecommendation,
  MockRecipeData
} from '../types/menuEngineering';

// ============================================
// ENGINE CLASS
// ============================================

export class MenuEngineeringEngine {
  private config: Required<MenuEngineeringConfig>;

  constructor(config: MenuEngineeringConfig = {}) {
    this.config = {
      popularityThreshold: config.popularityThreshold ?? 0.5,
      profitabilityThreshold: config.profitabilityThreshold ?? 0.5,
      activeOnly: config.activeOnly ?? true,
      periodDays: config.periodDays ?? 30,
      minSalesThreshold: config.minSalesThreshold ?? 1
    };
  }

  /**
   * Analiza datos de ventas y genera clasificación Boston Matrix
   */
  analyze(salesData: RecipeSalesData[]): MenuEngineeringAnalysis {
    // Filter by minimum threshold
    const filteredData = salesData.filter(
      data => data.totalSold >= this.config.minSalesThreshold
    );

    // Calculate totals
    const totals = this.calculateTotals(filteredData);

    // Calculate metrics for each recipe
    const recipes = filteredData.map(data =>
      this.calculateRecipeMetrics(data, totals)
    );

    // Calculate averages
    const averages = this.calculateAverages(recipes);

    // Classify recipes
    const classifiedRecipes = recipes.map(recipe =>
      this.classifyRecipe(recipe, averages)
    );

    // Calculate distribution
    const distribution = this.calculateDistribution(classifiedRecipes);

    // Generate recommendations
    const recommendations = this.generateRecommendations(classifiedRecipes);

    return {
      period: {
        startDate: new Date(Date.now() - this.config.periodDays * 24 * 60 * 60 * 1000),
        endDate: new Date()
      },
      totals,
      averages,
      recipes: classifiedRecipes,
      distribution,
      recommendations
    };
  }

  /**
   * Calcula totales generales
   */
  private calculateTotals(data: RecipeSalesData[]) {
    return {
      totalRevenue: data.reduce((sum, d) => sum + d.totalRevenue, 0),
      totalCost: data.reduce((sum, d) => sum + d.totalCost, 0),
      totalContribution: data.reduce(
        (sum, d) => sum + (d.totalRevenue - d.totalCost),
        0
      ),
      totalSold: data.reduce((sum, d) => sum + d.totalSold, 0),
      recipeCount: data.length
    };
  }

  /**
   * Calcula métricas para una receta individual
   */
  private calculateRecipeMetrics(
    data: RecipeSalesData,
    totals: ReturnType<typeof this.calculateTotals>
  ): Omit<RecipeMenuMetrics, 'category' | 'quadrant'> {
    const contributionMargin = new Decimal(data.avgSalePrice)
      .minus(data.avgCost)
      .toDecimalPlaces(2)
      .toNumber();

    const totalContribution = new Decimal(data.totalRevenue)
      .minus(data.totalCost)
      .toDecimalPlaces(2)
      .toNumber();

    const salesShare = new Decimal(data.totalSold)
      .dividedBy(totals.totalSold)
      .toDecimalPlaces(4)
      .toNumber();

    const marginPercentage = new Decimal(contributionMargin)
      .dividedBy(data.avgSalePrice)
      .times(100)
      .toDecimalPlaces(2)
      .toNumber();

    // Popularity: relative to average
    const avgSold = totals.totalSold / totals.recipeCount;
    const popularityScore = new Decimal(data.totalSold)
      .dividedBy(avgSold)
      .toDecimalPlaces(3)
      .toNumber();

    // Profitability: relative to average
    const avgMargin = totals.totalContribution / totals.totalSold;
    const profitabilityScore = new Decimal(contributionMargin)
      .dividedBy(avgMargin)
      .toDecimalPlaces(3)
      .toNumber();

    return {
      recipeId: data.recipeId,
      recipeName: data.recipeName,
      totalSold: data.totalSold,
      salesShare,
      popularityScore,
      contributionMargin,
      totalContribution,
      marginPercentage,
      profitabilityScore
    };
  }

  /**
   * Calcula promedios
   */
  private calculateAverages(
    recipes: Omit<RecipeMenuMetrics, 'category' | 'quadrant'>[]
  ) {
    const avgPopularity =
      recipes.reduce((sum, r) => sum + r.popularityScore, 0) / recipes.length;

    const avgProfitability =
      recipes.reduce((sum, r) => sum + r.profitabilityScore, 0) / recipes.length;

    const avgContributionMargin =
      recipes.reduce((sum, r) => sum + r.contributionMargin, 0) / recipes.length;

    return {
      avgPopularity,
      avgProfitability,
      avgContributionMargin
    };
  }

  /**
   * Clasifica una receta en el Boston Matrix
   */
  private classifyRecipe(
    recipe: Omit<RecipeMenuMetrics, 'category' | 'quadrant'>,
    averages: ReturnType<typeof this.calculateAverages>
  ): RecipeMenuMetrics {
    const isPopular = recipe.popularityScore >= averages.avgPopularity;
    const isProfitable = recipe.profitabilityScore >= averages.avgProfitability;

    let category: MenuEngineeringCategory;
    if (isPopular && isProfitable) {
      category = 'STAR';
    } else if (!isPopular && isProfitable) {
      category = 'CASH_COW';
    } else if (isPopular && !isProfitable) {
      category = 'PUZZLE';
    } else {
      category = 'DOG';
    }

    return {
      ...recipe,
      category,
      quadrant: {
        x: recipe.popularityScore,
        y: recipe.profitabilityScore
      }
    };
  }

  /**
   * Calcula distribución por categoría
   */
  private calculateDistribution(recipes: RecipeMenuMetrics[]) {
    const categories: MenuEngineeringCategory[] = ['STAR', 'CASH_COW', 'PUZZLE', 'DOG'];

    return categories.reduce((dist, category) => {
      const categoryRecipes = recipes.filter(r => r.category === category);
      return {
        ...dist,
        [category]: {
          count: categoryRecipes.length,
          percentage: new Decimal(categoryRecipes.length)
            .dividedBy(recipes.length)
            .times(100)
            .toDecimalPlaces(1)
            .toNumber(),
          recipeIds: categoryRecipes.map(r => r.recipeId)
        }
      };
    }, {} as MenuEngineeringAnalysis['distribution']);
  }

  /**
   * Genera recomendaciones basadas en clasificación
   */
  private generateRecommendations(
    recipes: RecipeMenuMetrics[]
  ): MenuEngineeringRecommendation[] {
    return recipes.map(recipe => {
      switch (recipe.category) {
        case 'STAR':
          return {
            recipeId: recipe.recipeId,
            recipeName: recipe.recipeName,
            category: recipe.category,
            type: 'maintain',
            priority: 5,
            action: 'Mantener destacado en el menú y continuar promoción',
            expectedImpact: {
              revenue: 'Sostener ingresos actuales',
              margin: 'Mantener margen saludable'
            }
          };

        case 'CASH_COW':
          return {
            recipeId: recipe.recipeId,
            recipeName: recipe.recipeName,
            category: recipe.category,
            type: 'promote',
            priority: 4,
            action: 'Aumentar visibilidad y marketing para incrementar ventas',
            expectedImpact: {
              revenue: '+15-25% en ventas',
              volume: '+20-30% en unidades'
            }
          };

        case 'PUZZLE':
          return {
            recipeId: recipe.recipeId,
            recipeName: recipe.recipeName,
            category: recipe.category,
            type: 'optimize',
            priority: 3,
            action: 'Optimizar costos (ingredientes más baratos) o aumentar precio',
            expectedImpact: {
              margin: '+5-10% en margen',
              revenue: 'Potencial aumento si se ajusta precio'
            }
          };

        case 'DOG':
          return {
            recipeId: recipe.recipeId,
            recipeName: recipe.recipeName,
            category: recipe.category,
            type: 'discontinue',
            priority: 2,
            action: 'Considerar descontinuar o reemplazar con alternativa',
            expectedImpact: {
              revenue: 'Liberar recursos para items más rentables',
              margin: 'Mejorar margen promedio del menú'
            }
          };
      }
    });
  }
}

// ============================================
// MOCK DATA GENERATOR
// ============================================

/**
 * Genera datos mock para desarrollo/testing
 */
export function generateMockSalesData(): RecipeSalesData[] {
  const mockRecipes: MockRecipeData[] = [
    // STARS (alta popularidad + alta rentabilidad)
    { id: '1', name: 'Hamburguesa Clásica', category: 'Burgers', cost: 5, price: 12, soldUnits: 150 },
    { id: '2', name: 'Pizza Margherita', category: 'Pizzas', cost: 4, price: 14, soldUnits: 120 },

    // CASH COWS (baja popularidad + alta rentabilidad)
    { id: '3', name: 'Risotto Trufa', category: 'Pastas', cost: 8, price: 22, soldUnits: 25 },
    { id: '4', name: 'Filet Mignon', category: 'Carnes', cost: 15, price: 35, soldUnits: 30 },

    // PUZZLES (alta popularidad + baja rentabilidad)
    { id: '5', name: 'Combo Infantil', category: 'Combos', cost: 4, price: 5, soldUnits: 200 },
    { id: '6', name: 'Ensalada César', category: 'Ensaladas', cost: 3, price: 4, soldUnits: 180 },

    // DOGS (baja popularidad + baja rentabilidad)
    { id: '7', name: 'Sopa del Día', category: 'Sopas', cost: 2, price: 3, soldUnits: 15 },
    { id: '8', name: 'Postre Especial', category: 'Postres', cost: 4, price: 5, soldUnits: 10 }
  ];

  return mockRecipes.map(recipe => ({
    recipeId: recipe.id,
    recipeName: recipe.name,
    totalSold: recipe.soldUnits,
    totalRevenue: recipe.soldUnits * recipe.price,
    totalCost: recipe.soldUnits * recipe.cost,
    avgSalePrice: recipe.price,
    avgCost: recipe.cost
  }));
}

/**
 * Factory function para crear engine con datos mock
 */
export function createMenuEngineeringEngineWithMockData(): {
  engine: MenuEngineeringEngine;
  analysis: MenuEngineeringAnalysis;
} {
  const engine = new MenuEngineeringEngine();
  const mockData = generateMockSalesData();
  const analysis = engine.analyze(mockData);

  return { engine, analysis };
}
