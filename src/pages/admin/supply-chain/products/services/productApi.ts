/**
 * Product API - Data Access Layer
 * Pure database operations with typed Supabase client
 * 
 * ✅ Clean separation: API layer handles ONLY data access
 * ✅ No store imports
 * ✅ No business logic
 * ✅ Throws errors, doesn't handle them
 */

import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import { logger } from '@/lib/logging';
import { requirePermission, type UserWithLocation } from '@/lib/permissions';
import { eventBus, EventPriority } from '@/lib/events';
import type {
  Product,
  ProductWithIntelligence,
  CreateProductData,
  UpdateProductData,
  ProductType,
} from '../types/product';

type DbProduct = Database['public']['Tables']['products']['Row'];
type DbProductInsert = Database['public']['Tables']['products']['Insert'];
type DbProductUpdate = Database['public']['Tables']['products']['Update'];

// ============================================
// TYPE MAPPERS
// ============================================

function mapDbProductToProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    unit: dbProduct.type || undefined,
    type: (dbProduct.type as ProductType) || 'ELABORATED',
    description: dbProduct.description || undefined,
    is_published: dbProduct.is_published,
    created_at: dbProduct.created_at || new Date().toISOString(),
    updated_at: dbProduct.updated_at || new Date().toISOString(),
  };
}

// ============================================
// PRODUCTS WITH INTELLIGENCE
// ============================================

export async function fetchProductsWithIntelligence(): Promise<ProductWithIntelligence[]> {
  const { data, error } = await supabase.rpc('get_products_with_availability');

  if (error) {
    logger.error('Products', 'Error fetching products with intelligence', error);
    throw error;
  }

  const rawData = (data || []) as any[];
  const products: ProductWithIntelligence[] = rawData.map((item: any) => ({
    id: item.id,
    name: item.name,
    unit: item.unit,
    type: item.type as ProductType,
    description: item.description,
    created_at: item.created_at,
    updated_at: item.updated_at,
    cost: item.cost || 0,
    availability: item.availability || 0,
    components_count: item.components_count || 0,
    can_produce: (item.availability || 0) > 0,
    production_ready: (item.availability || 0) > 0 && (item.components_count || 0) > 0,
    cost_per_unit: item.cost || 0,
  }));

  return products;
}

// ============================================
// BASIC PRODUCT CRUD
// ============================================

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Products', 'Error fetching products', error);
    throw error;
  }

  return (data || []).map(mapDbProductToProduct);
}

export async function createProduct(
  productData: CreateProductData,
  user: UserWithLocation
): Promise<Product> {
  requirePermission(user, 'products', 'create');

  const { count: previousCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const insertData: DbProductInsert = {
    name: productData.name,
    description: productData.description,
    type: productData.type,
    product_type: productData.type,
    price: 0,
  };

  const { data, error } = await supabase
    .from('products')
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    logger.error('Products', 'Error creating product', error);
    throw error;
  }

  const product = mapDbProductToProduct(data);
  const totalCount = (previousCount || 0) + 1;

  logger.info('Products', 'Product created', { 
    productId: product.id, 
    userId: user.id,
    totalCount,
    previousCount: previousCount || 0,
  });

  eventBus.emit(
    'products.created',
    {
      product: {
        id: product.id,
        name: product.name,
        category: product.type,
      },
      totalCount,
      previousCount: previousCount || 0,
      timestamp: Date.now(),
      triggeredBy: 'manual',
    },
    {
      priority: EventPriority.NORMAL,
    }
  );

  return product;
}

export async function updateProduct(
  productData: UpdateProductData,
  user: UserWithLocation
): Promise<Product> {
  requirePermission(user, 'products', 'update');

  const { id, ...updates } = productData;

  const { data: oldProductData, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    logger.error('Products', 'Error fetching product for update', fetchError);
    throw fetchError;
  }

  if (!oldProductData) {
    throw new Error(`Product with id ${id} not found`);
  }

  const oldProduct = mapDbProductToProduct(oldProductData);

  const updateData: DbProductUpdate = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.type !== undefined) {
    updateData.type = updates.type;
    updateData.product_type = updates.type;
  }
  if (updates.is_published !== undefined) updateData.is_published = updates.is_published;

  const { data, error } = await supabase
    .from('products')
    .update(updateData as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('Products', 'Error updating product', error);
    throw error;
  }

  const updatedProduct = mapDbProductToProduct(data);

  logger.info('Products', 'Product updated', {
    productId: id,
    userId: user.id,
    fieldsUpdated: Object.keys(updates),
  });

  eventBus.emit(
    'products.product_updated',
    {
      productId: id,
      productName: updatedProduct.name,
      changes: Object.keys(updates),
      timestamp: new Date().toISOString(),
      userId: user.id,
    },
    {
      priority: EventPriority.MEDIUM,
    }
  );

  if (updates.is_published !== undefined && updates.is_published !== oldProduct.is_published) {
    eventBus.emit(
      'products.publish_toggled',
      {
        productId: id,
        productName: updatedProduct.name,
        isPublished: updates.is_published,
        timestamp: new Date().toISOString(),
        userId: user.id,
      },
      {
        priority: EventPriority.MEDIUM,
      }
    );
  }

  return updatedProduct;
}

export async function deleteProduct(id: string, user: UserWithLocation): Promise<void> {
  requirePermission(user, 'products', 'delete');

  const { data: productData } = await supabase
    .from('products')
    .select('name')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    logger.error('Products', 'Error deleting product', error);
    throw error;
  }

  logger.info('Products', 'Product deleted', { productId: id, userId: user.id });

  eventBus.emit(
    'products.product_deleted',
    {
      productId: id,
      productName: productData?.name || 'Unknown',
      timestamp: new Date().toISOString(),
      userId: user.id,
    },
    {
      priority: EventPriority.MEDIUM,
    }
  );
}

// ============================================
// PRODUCT INTELLIGENCE FUNCTIONS
// ============================================

export async function getProductCost(productId: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_product_cost', { 
    p_product_id: productId 
  } as any);

  if (error) {
    logger.error('Products', 'Error calculating product cost', error);
    return 0;
  }

  return (data as any) || 0;
}

export async function getProductAvailability(productId: string): Promise<number> {
  const { data, error } = await supabase.rpc('calculate_product_availability', {
    p_product_id: productId,
  } as any);

  if (error) {
    logger.error('Products', 'Error calculating product availability', error);
    return 0;
  }

  return (data as any) || 0;
}
