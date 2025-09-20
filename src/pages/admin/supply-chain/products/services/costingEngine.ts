import { supabase } from '@/lib/supabase/client';
import { 
  calculateProductMaterialsCost,
  analyzeProductionViability,
  type MaterialCost as MaterialCostEngine,
  type ProductCostBreakdown as ProductCostBreakdownEngine,
  type ProductionViability
} from '@/business-logic/products/productMaterialsCostEngine';

/**
 * Service for connecting Products cost analysis with real Materials data
 * Now uses centralized business logic with decimal precision
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
   * Now uses centralized calculation engine with decimal precision
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
        // No recipe found - return empty cost structure
        const emptyResult = calculateProductMaterialsCost({
          product_id: productId,
          product_name: productData.name,
          recipe_yield: 1,
          ingredients: []
        });

        return {
          product_id: emptyResult.product_id,
          product_name: emptyResult.product_name,
          total_materials_cost: emptyResult.total_materials_cost,
          materials_breakdown: emptyResult.materials_breakdown.map(item => ({
            item_id: item.item_id,
            item_name: item.item_name,
            unit_cost: item.unit_cost,
            unit: item.unit,
            available_quantity: item.available_quantity
          })),
          recipe_yield: emptyResult.recipe_yield,
          cost_per_unit: emptyResult.cost_per_unit
        };
      }

      const recipe = recipeComponent.recipes;

      // Prepare ingredients data for centralized calculation
      const ingredients = recipe.recipe_ingredients ? recipe.recipe_ingredients.map((ingredient: any) => ({
        item_id: ingredient.items.id,
        item_name: ingredient.items.name,
        quantity: ingredient.quantity,
        item_cost: ingredient.items.cost || 0,
        unit: ingredient.items.unit || 'unidad',
        available_quantity: ingredient.items.stock_quantity || 0
      })) : [];

      // Use centralized calculation engine with decimal precision
      const costResult = calculateProductMaterialsCost({
        product_id: productId,
        product_name: productData.name,
        recipe_yield: recipe.output_quantity || 1,
        ingredients
      });

      // Convert to service interface format
      return {
        product_id: costResult.product_id,
        product_name: costResult.product_name,
        total_materials_cost: costResult.total_materials_cost,
        materials_breakdown: costResult.materials_breakdown.map(item => ({
          item_id: item.item_id,
          item_name: item.item_name,
          unit_cost: item.unit_cost,
          unit: item.unit,
          available_quantity: item.available_quantity
        })),
        recipe_yield: costResult.recipe_yield,
        cost_per_unit: costResult.cost_per_unit
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
   * Now uses centralized production viability analysis with decimal precision
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

      // Prepare data for centralized analysis
      const materialsRequired = costBreakdown.materials_breakdown.map(material => ({
        item_id: material.item_id,
        item_name: material.item_name,
        required_quantity: batchSize, // Simplified - should use actual recipe quantities
        available_quantity: material.available_quantity,
        unit_cost: material.unit_cost
      }));

      // Use centralized production viability analysis with decimal precision
      const viabilityResult = analyzeProductionViability({
        product_id: productId,
        product_name: costBreakdown.product_name,
        materials_required: materialsRequired,
        batch_size: batchSize
      });

      // Extract insufficient materials from detailed analysis
      const insufficientMaterials = viabilityResult.required_materials
        .filter(material => material.shortage !== undefined)
        .map(material => material.item_name);

      return {
        can_produce: viabilityResult.can_produce,
        insufficient_materials: insufficientMaterials,
        max_possible_batches: viabilityResult.max_possible_batches
      };

    } catch (error) {
      console.error('Error validating production viability:', error);
      throw error;
    }
  }

  /**
   * Get detailed production analysis (new method using centralized engine)
   */
  static async getDetailedProductionAnalysis(productId: string, batchSize: number = 1): Promise<ProductionViability | null> {
    try {
      const costBreakdown = await this.getProductMaterialsCost(productId);
      
      if (!costBreakdown) return null;

      const materialsRequired = costBreakdown.materials_breakdown.map(material => ({
        item_id: material.item_id,
        item_name: material.item_name,
        required_quantity: batchSize,
        available_quantity: material.available_quantity,
        unit_cost: material.unit_cost
      }));

      return analyzeProductionViability({
        product_id: productId,
        product_name: costBreakdown.product_name,
        materials_required: materialsRequired,
        batch_size: batchSize
      });

    } catch (error) {
      console.error('Error getting detailed production analysis:', error);
      throw error;
    }
  }
}