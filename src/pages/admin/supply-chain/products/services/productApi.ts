// src/features/products/data/productApi.ts
// G-Admin Products API - Leveraging Database Functions for Intelligence

import { supabase } from "@/lib/supabase/client";
import { 
  type Product, 
  type ProductWithIntelligence,
  type ProductComponent,
  type CreateProductData,
  type UpdateProductData,
  type AddComponentData,
  type ProductsWithAvailabilityResponse 
} from "../types";

// ===== PRODUCTS WITH INTELLIGENCE =====

export async function fetchProductsWithIntelligence(): Promise<ProductWithIntelligence[]> {
  try {
    // Use existing database function for products with availability and costs
    const { data, error } = await supabase
      .rpc("get_products_with_availability");

    if (error) throw error;

    // Transform API response to our types with intelligence features
    const products: ProductWithIntelligence[] = (data || []).map((item: ProductsWithAvailabilityResponse) => ({
      id: item.id,
      name: item.name,
      unit: item.unit,
      type: item.type as any,
      description: item.description,
      created_at: item.created_at,
      updated_at: item.updated_at,
      
      // Intelligence Features
      cost: item.cost,
      availability: item.availability,
      components_count: item.components_count,
      
      // Calculated Fields
      can_produce: item.availability > 0,
      production_ready: item.availability > 0 && item.components_count > 0,
      cost_per_unit: item.cost
    }));

    return products;
  } catch (error) {
    console.error("Error fetching products with intelligence:", error);
    throw error;
  }
}

// ===== BASIC PRODUCT CRUD =====

export async function fetchProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function createProduct(productData: CreateProductData): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

export async function updateProduct(productData: UpdateProductData): Promise<Product> {
  try {
    const { id, ...updates } = productData;
    
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

// ===== PRODUCT INTELLIGENCE FUNCTIONS =====

export async function getProductCost(productId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc("get_product_cost", { p_product_id: productId });

    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.error("Error calculating product cost:", error);
    return 0; // Fallback to 0
  }
}

export async function getProductAvailability(productId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc("calculate_product_availability", { p_product_id: productId });

    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.error("Error calculating product availability:", error);
    return 0; // Fallback to 0
  }
}

// ===== COMPONENT MANAGEMENT =====

export async function fetchProductComponents(productId: string): Promise<ProductComponent[]> {
  try {
    const { data, error } = await supabase
      .from("product_components")
      .select(`
        *,
        items:item_id (
          id,
          name,
          unit,
          unit_cost,
          stock
        )
      `)
      .eq("product_id", productId);

    if (error) throw error;

    // Transform and enhance with item information
    const components: ProductComponent[] = (data || []).map(component => ({
      id: component.id,
      product_id: component.product_id,
      item_id: component.item_id,
      quantity: component.quantity,
      
      // Enhanced information from items
      item_name: component.items?.name,
      item_unit: component.items?.unit,
      item_cost: component.items?.unit_cost,
      item_stock: component.items?.stock,
      availability_for_component: component.items?.stock 
        ? Math.floor(component.items.stock / component.quantity)
        : 0
    }));

    return components;
  } catch (error) {
    console.error("Error fetching product components:", error);
    return [];
  }
}

export async function addProductComponent(componentData: AddComponentData): Promise<ProductComponent> {
  try {
    const { data, error } = await supabase
      .from("product_components")
      .insert([componentData])
      .select(`
        *,
        items:item_id (
          id,
          name,
          unit,
          unit_cost,
          stock
        )
      `)
      .single();

    if (error) throw error;

    // Transform response
    return {
      id: data.id,
      product_id: data.product_id,
      item_id: data.item_id,
      quantity: data.quantity,
      item_name: data.items?.name,
      item_unit: data.items?.unit,
      item_cost: data.items?.unit_cost,
      item_stock: data.items?.stock,
      availability_for_component: data.items?.stock 
        ? Math.floor(data.items.stock / data.quantity)
        : 0
    };
  } catch (error) {
    console.error("Error adding product component:", error);
    throw error;
  }
}

export async function removeProductComponent(componentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("product_components")
      .delete()
      .eq("id", componentId);

    if (error) throw error;
  } catch (error) {
    console.error("Error removing component:", error);
    throw error;
  }
}

