import type { InventoryItem } from '@/pages/admin/materials/types';

// AI Suggestions Interfaces
export interface IngredientSubstitution {
  originalIngredient: string;
  suggestedSubstitute: string;
  reason: string;
  costImpact: number; // positive = savings, negative = cost increase
  availabilityScore: number; // 0-100
  nutritionalImpact: string;
  confidenceLevel: number; // 0-100
}

export interface CostOptimization {
  type: 'ingredient_substitution' | 'yield_adjustment' | 'batch_optimization';
  description: string;
  currentCost: number;
  optimizedCost: number;
  savings: number;
  implementation: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface YieldOptimization {
  currentYield: number;
  suggestedYield: number;
  improvement: number; // percentage
  reasoning: string;
  adjustments: YieldAdjustment[];
}

export interface YieldAdjustment {
  ingredient: string;
  currentQuantity: number;
  suggestedQuantity: number;
  reason: string;
}

export interface NutritionalInsight {
  category: 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'sodium';
  value: number;
  unit: string;
  dailyValuePercentage?: number;
  healthScore: number; // 0-100
  recommendations: string[];
}

export interface AIRecipeSuggestions {
  substitutions: IngredientSubstitution[];
  costOptimizations: CostOptimization[];
  yieldOptimization?: YieldOptimization;
  nutritionalInsights: NutritionalInsight[];
  overallScore: number; // 0-100
  confidence: number; // 0-100
}

export const generateMockAISuggestions = (
  validIngredients: any[],
  allItems: InventoryItem[],
  currentCost: number,
  outputQuantity: string,
): AIRecipeSuggestions => {
  const substitutions: IngredientSubstitution[] = [];
  const costOptimizations: CostOptimization[] = [];
  const nutritionalInsights: NutritionalInsight[] = [];

  // Generate substitutions for expensive or unavailable ingredients
  validIngredients.forEach((ingredient, index) => {
    const item = allItems.find(i => i.id === ingredient.item_id);
    if (item && Math.random() > 0.6) {
      // 40% chance of suggestion
      const possibleSubs = allItems.filter(
        i => i.id !== item.id && i.type === item.type && i.stock > 0,
      );

      if (possibleSubs.length > 0) {
        const substitute = possibleSubs[Math.floor(Math.random() * possibleSubs.length)];
        const costImpact = (item.unit_cost || 0) - (substitute.unit_cost || 0);

        substitutions.push({
          originalIngredient: item.name,
          suggestedSubstitute: substitute.name,
          reason:
            costImpact > 0
              ? 'Menor costo y mejor disponibilidad'
              : 'Mejor disponibilidad en stock',
          costImpact: costImpact * parseFloat(ingredient.quantity),
          availabilityScore: Math.min(100, substitute.stock * 10),
          nutritionalImpact: 'Similar perfil nutricional',
          confidenceLevel: 75 + Math.floor(Math.random() * 20),
        });
      }
    }
  });

  // Generate cost optimizations
  if (substitutions.length > 0) {
    const totalSubSavings = substitutions.reduce(
      (sum, sub) => sum + Math.max(0, sub.costImpact),
      0,
    );
    if (totalSubSavings > 0) {
      costOptimizations.push({
        type: 'ingredient_substitution',
        description: `Sustitución de ${substitutions.length} ingrediente${
          substitutions.length > 1 ? 's' : ''
        }`,
        currentCost,
        optimizedCost: currentCost - totalSubSavings,
        savings: totalSubSavings,
        implementation: 'Aplicar sustituciones sugeridas automáticamente',
        riskLevel: 'low',
      });
    }
  }

  // Batch optimization suggestion
  if (currentCost > 50) {
    costOptimizations.push({
      type: 'batch_optimization',
      description: 'Optimización por lotes de preparación',
      currentCost,
      optimizedCost: currentCost * 0.85,
      savings: currentCost * 0.15,
      implementation: 'Preparar en lotes más grandes para economías de escala',
      riskLevel: 'medium',
    });
  }

  // Generate nutritional insights
  const nutritionCategories = ['calories', 'protein', 'carbs', 'fat', 'fiber'] as const;
  nutritionCategories.forEach(category => {
    nutritionalInsights.push({
      category,
      value: Math.floor(Math.random() * 200) + 50,
      unit: category === 'calories' ? 'kcal' : 'g',
      dailyValuePercentage: Math.floor(Math.random() * 30) + 10,
      healthScore: Math.floor(Math.random() * 40) + 60,
      recommendations: [
        `Considera agregar más ${
          category === 'protein'
            ? 'proteínas'
            : category === 'fiber'
            ? 'fibra'
            : category
        }`,
        'Balancear con otros nutrientes para mejor perfil nutricional',
      ],
    });
  });

  // Yield optimization
  const currentYield = parseFloat(outputQuantity || '1');
  const yieldOptimization: YieldOptimization = {
    currentYield,
    suggestedYield: currentYield * 1.15,
    improvement: 15,
    reasoning: 'Optimización de técnicas de preparación y reducción de desperdicios',
    adjustments: validIngredients.slice(0, 2).map(ing => {
      const item = allItems.find(i => i.id === ing.item_id);
      const currentQty = parseFloat(ing.quantity);
      return {
        ingredient: item?.name || 'Ingrediente',
        currentQuantity: currentQty,
        suggestedQuantity: currentQty * 1.05,
        reason: 'Ajuste para mejor rendimiento',
      };
    }),
  };

  return {
    substitutions,
    costOptimizations,
    yieldOptimization,
    nutritionalInsights,
    overallScore: 75 + Math.floor(Math.random() * 20),
    confidence: 80 + Math.floor(Math.random() * 15),
  };
};
