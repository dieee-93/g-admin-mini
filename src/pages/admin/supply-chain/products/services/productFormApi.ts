/**
 * PRODUCT FORM API SERVICE
 *
 * Adapter service que conecta el nuevo ProductFormData con el API existente.
 * Transforma datos entre el formato del formulario v3.0 y el schema de la BD.
 *
 * @design PRODUCTS_FORM_ARCHITECTURE.md
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import { eventBus, EventPriority } from '@/lib/events';
import type { AuthUser } from '@/lib/permissions';
import type { ProductFormData } from '../types/productForm';

// ============================================
// TRANSFORMATION FUNCTIONS
// ============================================

/**
 * Transform ProductFormData to database format (v3.0 schema)
 */
function transformFormToDb(formData: ProductFormData): any {
  const {
    id,
    product_type,
    basic_info,
    materials,
    staff,
    booking,
    production,
    pricing,
    asset_config,
    rental_terms,
    digital_delivery,
    recurring_config,
    ...rest
  } = formData;

  // Base product data (v3.0 schema)
  const dbData: any = {
    // Identity
    name: basic_info.name,
    description: basic_info.description,
    sku: basic_info.sku,
    category: basic_info.category,
    tags: basic_info.tags,
    image_url: basic_info.image_url,

    // Product type (v3.0)
    product_type: product_type, // Store as-is: 'physical_product', 'service', etc.
    active: basic_info.active,

    // Flags
    has_materials: materials?.has_materials || false,
    has_staff_requirements: staff?.has_staff_requirements || false,

    // Pricing
    price: pricing.price,
    compare_at_price: pricing.compare_at_price,
    tax_included: pricing.tax_included,

    // Config JSONB - Store booking, production, cost breakdown
    config: {
      booking: booking || {},
      production: production || {},

      // Cost breakdown
      calculated_cost: pricing.calculated_cost,
      profit_margin_percentage: pricing.profit_margin_percentage,
      suggested_price: pricing.suggested_price
    },

    // Note: asset_config, rental_terms, digital_delivery, recurring_config
    // should be stored in their own tables and referenced by ID
    // For now, we'll handle them in separate operations
  };

  return dbData;
}

/**
 * Transform database format to ProductFormData (v3.0 schema)
 */
function transformDbToForm(dbData: any): ProductFormData {
  const config = dbData.config || {};

  return {
    id: dbData.id,
    product_type: dbData.product_type || 'physical_product',

    basic_info: {
      name: dbData.name || '',
      description: dbData.description,
      sku: dbData.sku,
      category: dbData.category,
      tags: dbData.tags,
      image_url: dbData.image_url,
      active: dbData.active ?? true
    },

    // Materials section
    materials: dbData.has_materials ? {
      has_materials: true,
      components: [] // Will be loaded separately from product_components table
    } : undefined,

    // Staff section
    staff: dbData.has_staff_requirements ? {
      has_staff_requirements: true,
      staff_allocation: [] // Will be loaded separately from product_staff_allocations table
    } : undefined,

    // Booking section (from config JSONB)
    booking: config.booking,

    // Production section (from config JSONB)
    production: config.production,

    // Pricing section
    pricing: {
      price: dbData.price || 0,
      compare_at_price: dbData.compare_at_price,
      tax_included: dbData.tax_included,
      calculated_cost: config.calculated_cost,
      profit_margin_percentage: config.profit_margin_percentage,
      suggested_price: config.suggested_price
    },

    // Complex configs (will be loaded from specialized tables)
    // asset_config, rental_terms, digital_delivery, recurring_config
    // These are loaded separately using the FK IDs

    created_at: dbData.created_at,
    updated_at: dbData.updated_at
  };
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get product by ID with related data
 */
export async function getProductById(id: string): Promise<ProductFormData> {
  try {
    // Get base product
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Product not found');

    const formData = transformDbToForm(data);

    // Load materials/components if applicable
    if (data.has_materials) {
      const { data: components } = await supabase
        .from('product_components')
        .select('*')
        .eq('product_id', id);

      if (components && formData.materials) {
        formData.materials.components = components.map(c => ({
          material_id: c.item_id,
          quantity: c.quantity_required,
          unit: c.unit,
          material_name: c.material_name,
          unit_cost: c.unit_cost,
          total_cost: c.total_cost
        }));
      }
    }

    // Load staff allocations if applicable
    if (data.has_staff_requirements) {
      const { data: staffAllocations } = await supabase
        .from('product_staff_allocations')
        .select('*')
        .eq('product_id', id);

      if (staffAllocations && formData.staff) {
        formData.staff.staff_allocation = staffAllocations.map(s => ({
          role_id: s.role_id,
          role_name: s.role_name,
          count: s.count,
          duration_minutes: s.duration_minutes,
          hourly_rate: s.hourly_rate,
          total_hours: s.total_hours,
          total_cost: s.total_cost
        }));
      }
    }

    // TODO: Load complex configs (asset_config, rental_terms, digital_delivery, recurring_config)
    // from their specialized tables using FK IDs

    return formData;
  } catch (error) {
    logger.error('App', 'Error fetching product:', error);
    throw error;
  }
}

/**
 * Create new product with related data
 */
export async function createProductFromForm(
  formData: ProductFormData,
  user?: AuthUser
): Promise<ProductFormData> {
  try {
    const dbData = transformFormToDb(formData);

    // Insert main product
    const { data, error } = await supabase
      .from('products')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;

    const productId = data.id;

    // Insert materials/components if applicable
    if (formData.materials?.has_materials && formData.materials.components) {
      const components = formData.materials.components.map(c => ({
        product_id: productId,
        item_id: c.material_id,
        quantity_required: c.quantity,
        unit: c.unit,
        material_name: c.material_name,
        unit_cost: c.unit_cost
      }));

      await supabase.from('product_components').insert(components);
    }

    // Insert staff allocations if applicable
    if (formData.staff?.has_staff_requirements && formData.staff.staff_allocation) {
      const staffAllocations = formData.staff.staff_allocation.map(s => ({
        product_id: productId,
        role_id: s.role_id,
        role_name: s.role_name,
        count: s.count,
        duration_minutes: s.duration_minutes,
        hourly_rate: s.hourly_rate
      }));

      await supabase.from('product_staff_allocations').insert(staffAllocations);
    }

    // TODO: Insert complex configs (asset_config, rental_terms, digital_delivery, recurring_config)
    // into their specialized tables

    logger.info('App', 'Product created from form', {
      productId: data.id,
      productType: formData.product_type,
      userId: user?.id
    });

    // Emit event
    if (user) {
      eventBus.emit('products.product_created', {
        productId: data.id,
        productName: formData.basic_info.name,
        productType: formData.product_type,
        timestamp: new Date().toISOString(),
        userId: user.id
      }, {
        priority: EventPriority.HIGH,
        moduleId: 'products'
      });
    }

    // Return complete product data
    return await getProductById(productId);
  } catch (error) {
    logger.error('App', 'Error creating product from form:', error);
    throw error;
  }
}

/**
 * Update existing product with related data
 */
export async function updateProductFromForm(
  id: string,
  formData: ProductFormData,
  user?: AuthUser
): Promise<ProductFormData> {
  try {
    const dbData = transformFormToDb(formData);

    // Update main product
    const { data, error } = await supabase
      .from('products')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update materials/components
    if (formData.materials?.has_materials) {
      // Delete existing components
      await supabase.from('product_components').delete().eq('product_id', id);

      // Insert new components
      if (formData.materials.components && formData.materials.components.length > 0) {
        const components = formData.materials.components.map(c => ({
          product_id: id,
          item_id: c.material_id,
          quantity_required: c.quantity,
          unit: c.unit,
          material_name: c.material_name,
          unit_cost: c.unit_cost
        }));

        await supabase.from('product_components').insert(components);
      }
    } else {
      // Remove all components if materials is now disabled
      await supabase.from('product_components').delete().eq('product_id', id);
    }

    // Update staff allocations
    if (formData.staff?.has_staff_requirements) {
      // Delete existing allocations
      await supabase.from('product_staff_allocations').delete().eq('product_id', id);

      // Insert new allocations
      if (formData.staff.staff_allocation && formData.staff.staff_allocation.length > 0) {
        const staffAllocations = formData.staff.staff_allocation.map(s => ({
          product_id: id,
          role_id: s.role_id,
          role_name: s.role_name,
          count: s.count,
          duration_minutes: s.duration_minutes,
          hourly_rate: s.hourly_rate
        }));

        await supabase.from('product_staff_allocations').insert(staffAllocations);
      }
    } else {
      // Remove all allocations if staff is now disabled
      await supabase.from('product_staff_allocations').delete().eq('product_id', id);
    }

    // TODO: Update complex configs (asset_config, rental_terms, digital_delivery, recurring_config)

    logger.info('App', 'Product updated from form', {
      productId: id,
      userId: user?.id
    });

    // Emit event
    if (user) {
      eventBus.emit('products.product_updated', {
        productId: id,
        productName: formData.basic_info.name,
        changes: Object.keys(dbData),
        timestamp: new Date().toISOString(),
        userId: user.id
      }, {
        priority: EventPriority.MEDIUM,
        moduleId: 'products'
      });
    }

    // Return complete product data
    return await getProductById(id);
  } catch (error) {
    logger.error('App', 'Error updating product from form:', error);
    throw error;
  }
}

/**
 * Delete product
 */
export async function deleteProductFromForm(
  id: string,
  user?: AuthUser
): Promise<void> {
  try {
    // Get product name before deletion
    const { data: product } = await supabase
      .from('products')
      .select('name')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    logger.info('App', 'Product deleted from form', {
      productId: id,
      userId: user?.id
    });

    // Emit event
    if (user) {
      eventBus.emit('products.product_deleted', {
        productId: id,
        productName: product?.name || 'Unknown',
        timestamp: new Date().toISOString(),
        userId: user.id
      }, {
        priority: EventPriority.MEDIUM,
        moduleId: 'products'
      });
    }
  } catch (error) {
    logger.error('App', 'Error deleting product from form:', error);
    throw error;
  }
}

/**
 * List products with filters
 */
export async function listProducts(filters?: {
  productType?: string;
  active?: boolean;
  search?: string;
}): Promise<ProductFormData[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.productType) {
      query = query.eq('type', filters.productType.toUpperCase());
    }

    if (filters?.active !== undefined) {
      query = query.eq('active', filters.active);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(transformDbToForm);
  } catch (error) {
    logger.error('App', 'Error listing products:', error);
    throw error;
  }
}

// ============================================
// EXPORT DEFAULT SERVICE
// ============================================

export const productFormApi = {
  getProduct: getProductById,
  createProduct: createProductFromForm,
  updateProduct: updateProductFromForm,
  deleteProduct: deleteProductFromForm,
  listProducts
};
