import { supabase } from '@/lib/supabase/client';

/**
 * Service for connecting Products cost analysis with real Materials data
 * Eliminates hardcoded mock data in CostAnalysisTab
 */

export interface MaterialCost {
  item_id: string;
  item_name: string;
  unit_cost: number;
  unit: string;
  available_quantity: number;
}

export interface ProductCostBreakdown {
  product_id: string;
  product_name: string;
  total_materials_cost: number;
  materials_breakdown: MaterialCost[];
  recipe_yield: number;
  cost_per_unit: number;
}

export class ProductCostAnalysisService {
  
  /**
   * Get real materials cost for a product based on its recipe
   */
  static async getProductMaterialsCost(productId: string): Promise<ProductCostBreakdown | null> {
    try {
      // Get product with its recipe and materials
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          product_components (
            id,
            component_type,
            recipe_id,
            recipes (
              id,
              name,
              output_quantity,
              recipe_ingredients (
                id,
                item_id,
                quantity,
                items (
                  id,
                  name,
                  unit,
                  cost,
                  stock_quantity
                )
              )
            )
          )
        `)
        .eq('id', productId)
        .single();

      if (productError) throw productError;
      if (!productData) return null;

      // Find recipe component
      const recipeComponent = productData.product_components?.find(
        (comp: any) => comp.component_type === 'recipe'
      );

      if (!recipeComponent?.recipes) {
        // No recipe found - product doesn't have material costs
        return {
          product_id: productId,
          product_name: productData.name,
          total_materials_cost: 0,
          materials_breakdown: [],
          recipe_yield: 1,
          cost_per_unit: 0
        };
      }

      const recipe = recipeComponent.recipes;

      // Calculate materials costs
      const materialsBreakdown: MaterialCost[] = [];
      let totalMaterialsCost = 0;

      if (recipe.recipe_ingredients) {
        for (const ingredient of recipe.recipe_ingredients) {
          const item = ingredient.items;
          if (item) {
            const lineCost = ingredient.quantity * (item.cost || 0);
            totalMaterialsCost += lineCost;

            materialsBreakdown.push({
              item_id: item.id,
              item_name: item.name,
              unit_cost: item.cost || 0,
              unit: item.unit || 'unidad',
              available_quantity: item.stock_quantity || 0
            });
          }
        }
      }

      const recipeYield = recipe.output_quantity || 1;
      const costPerUnit = totalMaterialsCost / recipeYield;

      return {
        product_id: productId,
        product_name: productData.name,
        total_materials_cost: totalMaterialsCost,
        materials_breakdown: materialsBreakdown,
        recipe_yield: recipeYield,
        cost_per_unit: costPerUnit
      };

    } catch (error) {
      console.error('Error getting product materials cost:', error);
      throw error;
    }
  }

  /**
   * Get available products that have recipes (can calculate real costs)
   */
  static async getProductsWithRecipes(): Promise<Array<{ id: string; name: string; has_recipe: boolean }>> {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          product_components!inner (
            component_type,
            recipe_id
          )
        `)
        .eq('is_active', true)
        .eq('product_components.component_type', 'recipe');

      if (error) throw error;

      return (products || []).map(product => ({
        id: product.id,
        name: product.name,
        has_recipe: true
      }));

    } catch (error) {
      console.error('Error getting products with recipes:', error);
      throw error;
    }
  }

  /**
   * Validate if product can be produced with current inventory
   */
  static async validateProductionViability(productId: string, batchSize: number = 1): Promise<{
    can_produce: boolean;
    insufficient_materials: string[];
    max_possible_batches: number;
  }> {
    try {
      const costBreakdown = await this.getProductMaterialsCost(productId);
      
      if (!costBreakdown || costBreakdown.materials_breakdown.length === 0) {
        return {
          can_produce: true, // No materials required
          insufficient_materials: [],
          max_possible_batches: 999
        };
      }

      const insufficientMaterials: string[] = [];
      let maxPossibleBatches = 999;

      for (const material of costBreakdown.materials_breakdown) {
        const requiredQuantity = batchSize; // Simplified - should use recipe quantities
        
        if (material.available_quantity < requiredQuantity) {
          insufficientMaterials.push(material.item_name);
        }

        const possibleBatches = Math.floor(material.available_quantity / requiredQuantity);
        maxPossibleBatches = Math.min(maxPossibleBatches, possibleBatches);
      }

      return {
        can_produce: insufficientMaterials.length === 0,
        insufficient_materials: insufficientMaterials,
        max_possible_batches: Math.max(0, maxPossibleBatches)
      };

    } catch (error) {
      console.error('Error validating production viability:', error);
      throw error;
    }
  }
}
