// src/features/products/data/productApi.ts
// G-Admin Products API - Leveraging Database Functions for Intelligence

import { supabase } from "@/lib/supabase/client";
import { logger } from '@/lib/logging';
import { requirePermission, type AuthUser } from '@/lib/permissions';
import { eventBus, EventPriority } from '@/lib/events';
import {
  type Product,
  type ProductWithIntelligence,
  type ProductComponent,
  type CreateProductData,
  type UpdateProductData,
  type AddComponentData,
  type ProductsWithAvailabilityResponse,
  type ProductType
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
      type: item.type as ProductType,
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
    logger.error('App', "Error fetching products with intelligence:", error);
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
    logger.error('App', "Error fetching products:", error);
    throw error;
  }
}

export async function createProduct(productData: CreateProductData, user: AuthUser): Promise<Product> {
  try {
    // 🔒 PERMISSION CHECK: Require 'create' permission on 'products' module
    requirePermission(user, 'products', 'create');

    const { data, error} = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (error) throw error;

    logger.info('App', 'Product created', { productId: data.id, userId: user.id });

    // 📡 EVENTBUS: Emit product_created event
    eventBus.emit('products.product_created', {
      productId: data.id,
      productName: data.name,
      productType: data.type,
      timestamp: new Date().toISOString(),
      userId: user.id
    }, {
      priority: EventPriority.HIGH,
      moduleId: 'products'
    });

    return data;
  } catch (error) {
    logger.error('App', "Error creating product:", error);
    throw error;
  }
}

export async function updateProduct(productData: UpdateProductData, user: AuthUser): Promise<Product> {
  try {
    // 🔒 PERMISSION CHECK: Require 'update' permission on 'products' module
    requirePermission(user, 'products', 'update');

    const { id, ...updates } = productData;

    // Get old product data before update for comparison
    const { data: oldProduct, error: fetchError } = await supabase
      .from("products")
      .select('*')
      .eq("id", id)
      .single();

    if (fetchError) {
      logger.error('App', "Error fetching product for update:", fetchError);
      throw fetchError;
    }

    if (!oldProduct) {
      throw new Error(`Product with id ${id} not found`);
    }

    // Update product in database
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error('App', "Error updating product:", error);
      throw error;
    }

    logger.info('App', 'Product updated', { 
      productId: id, 
      userId: user.id,
      fieldsUpdated: Object.keys(updates)
    });

    // 📡 EVENTBUS: Emit product_updated event
    eventBus.emit('products.product_updated', {
      productId: id,
      productName: data.name,
      changes: Object.keys(updates),
      timestamp: new Date().toISOString(),
      userId: user.id
    }, {
      priority: EventPriority.MEDIUM,
      moduleId: 'products'
    });

    // 📡 EVENTBUS: Emit price_changed event if price was updated
    if (updates.price !== undefined && updates.price !== oldProduct.price) {
      eventBus.emit('products.price_changed', {
        productId: id,
        productName: data.name,
        oldPrice: oldProduct.price,
        newPrice: updates.price,
        timestamp: new Date().toISOString(),
        userId: user.id
      }, {
        priority: EventPriority.HIGH,
        moduleId: 'products'
      });
    }

    // 📡 EVENTBUS: Emit publish_toggled event if is_published was updated
    if (updates.is_published !== undefined && updates.is_published !== oldProduct.is_published) {
      eventBus.emit('products.publish_toggled', {
        productId: id,
        productName: data.name,
        isPublished: updates.is_published,
        timestamp: new Date().toISOString(),
        userId: user.id
      }, {
        priority: EventPriority.MEDIUM,
        moduleId: 'products'
      });
    }

    return data;
  } catch (error) {
    logger.error('App', "Error updating product:", error);
    throw error;
  }
}

export async function deleteProduct(id: string, user: AuthUser): Promise<void> {
  try {
    // 🔒 PERMISSION CHECK: Require 'delete' permission on 'products' module
    requirePermission(user, 'products', 'delete');

    // Get product data before deletion
    const { data: product } = await supabase
      .from("products")
      .select('name')
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    logger.info('App', 'Product deleted', { productId: id, userId: user.id });

    // 📡 EVENTBUS: Emit product_deleted event
    eventBus.emit('products.product_deleted', {
      productId: id,
      productName: product?.name || 'Unknown',
      timestamp: new Date().toISOString(),
      userId: user.id
    }, {
      priority: EventPriority.MEDIUM,
      moduleId: 'products'
    });
  } catch (error) {
    logger.error('App', "Error deleting product:", error);
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
    logger.error('App', "Error calculating product cost:", error);
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
    logger.error('App', "Error calculating product availability:", error);
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
    logger.error('App', "Error fetching product components:", error);
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
    logger.error('App', "Error adding product component:", error);
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
    logger.error('App', "Error removing component:", error);
    throw error;
  }
}

// ===== PRODUCTS SERVICE =====
// Service layer that coordinates API calls with store updates

export const productsService = {
  async loadProducts() {
    try {
      const { useProductsStore } = await import('@/store/productsStore');
      const { setProducts, setLoading, setError } = useProductsStore.getState();

      setLoading(true);
      setError(null);

      const products = await fetchProductsWithIntelligence();
      setProducts(products);

      setLoading(false);
      return products;
    } catch (error) {
      const { useProductsStore } = await import('@/store/productsStore');
      const { setLoading, setError } = useProductsStore.getState();

      setLoading(false);
      setError(error instanceof Error ? error.message : 'Error loading products');
      logger.error('App', "Error in loadProducts:", error);
      throw error;
    }
  },

  async updateProduct(productData: UpdateProductData, user: AuthUser) {
    try {
      const { useProductsStore } = await import('@/store/productsStore');
      const { updateProduct: updateInStore } = useProductsStore.getState();

      // Update in database first
      const updatedProduct = await updateProduct(productData, user);

      // Update in store (optimistic update already done by UI, but ensure consistency)
      updateInStore(updatedProduct.id, updatedProduct);

      return updatedProduct;
    } catch (error) {
      const { useProductsStore } = await import('@/store/productsStore');
      const { setError } = useProductsStore.getState();

      setError(error instanceof Error ? error.message : 'Error updating product');
      logger.error('App', "Error in updateProduct service:", error);
      throw error;
    }
  }
};

// ============================================
// SERVICES MANAGEMENT (Service Products)
// ============================================

/**
 * Fetch service products (products with type='SERVICE')
 */
export async function getServiceProducts(
  organizationId: string,
  user: AuthUser
): Promise<Product[]> {
  requirePermission(user, 'products', 'read');

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('type', 'SERVICE')
    .eq('organization_id', organizationId)
    .order('name');

  if (error) {
    logger.error('App', 'Error fetching service products', error);
    throw error;
  }

  return data || [];
}

/**
 * Create a service product (reuses createProduct with type='SERVICE')
 */
export async function createServiceProduct(
  serviceData: CreateProductData,
  user: AuthUser
): Promise<Product> {
  return createProduct({ ...serviceData, type: 'SERVICE' }, user);
}

/**
 * Update a service product (reuses updateProduct)
 */
export async function updateServiceProduct(
  id: string,
  updates: Partial<CreateProductData>,
  user: AuthUser
): Promise<Product> {
  return updateProduct(id, updates, user);
}

/**
 * Delete a service product (reuses deleteProduct)
 */
export async function deleteServiceProduct(
  id: string,
  user: AuthUser
): Promise<void> {
  return deleteProduct(id, user);
}
