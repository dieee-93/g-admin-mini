import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { type ProductWithIntelligence } from '../types';
import { useProductsStore } from '@/store/productsStore';

export function useProducts() {
  const { 
    products, 
    isLoading, 
    error, 
    setProducts, 
    setLoading, 
    setError,
    getProductById,
    getProductsWithRecipes
  } = useProductsStore();

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get products with their recipes if they exist - CONNECTED TO REAL RECIPE SYSTEM
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          product_components (
            id,
            component_type,
            item_id,
            recipe_id,
            quantity,
            items (id, name, unit),
            recipes (
              id,
              name,
              description,
              output_quantity,
              base_cost,
              preparation_time,
              recipe_ingredients (
                id,
                item_id,
                quantity,
                items (id, name, unit, cost)
              )
            )
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      const transformedProducts: ProductWithIntelligence[] = (productsData || []).map((product: unknown) => {
        // Extract recipe information if exists - REAL RECIPE INTEGRATION
        const recipeComponent = product.product_components?.find((comp: unknown) => comp.component_type === 'recipe');
        const recipe = recipeComponent?.recipes;
        
        // Calculate REAL cost from recipe ingredients - NO MORE MOCK DATA
        let calculatedCost = 0;
        if (recipe?.recipe_ingredients) {
          calculatedCost = recipe.recipe_ingredients.reduce((total: number, ingredient: any) => {
            return total + (ingredient.quantity * (ingredient.items?.cost || 0));
          }, 0);
        }

        // Transform to ProductWithIntelligence
        return {
          id: product.id,
          name: product.name,
          unit: product.unit,
          type: product.type,
          description: product.description || '',
          created_at: product.created_at,
          updated_at: product.updated_at,
          
          // Intelligence Features - CONNECTED TO REAL DATA
          cost: calculatedCost,
          availability: 0, // Will be calculated by availability functions
          components_count: product.product_components?.length || 0,
          
          // Calculated Fields
          can_produce: true, // Will be determined by stock availability
          production_ready: !!recipe, // Has recipe = production ready
          cost_per_unit: calculatedCost,
          
          // Components List - REAL DATA
          components: product.product_components || [],
        };
      });

      setProducts(transformedProducts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading products';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = () => {
    loadProducts();
  };

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    loading: isLoading,
    error,
    refreshProducts,
    loadProducts,
    getProductById,
    getProductsWithRecipes
  };
}