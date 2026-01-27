/**
 * Service Context API - Data Access Layer
 * 
 * Version: 1.0.0
 * Purpose: Supabase API layer for service_contexts CRUD operations
 * 
 * IMPORTANT: This is for COSTING purposes (service staff, additional costs).
 * For operational fulfillment config (zones, fees, timing), use fulfillmentPoliciesApi.
 * 
 * NOTE: Tables are created by migration 20260107_service_contexts.sql
 * After running migration, regenerate Supabase types and remove 'as any' casts.
 * 
 * See: docs/product/COSTING_ARCHITECTURE.md Section 9
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type {
  ServiceContext,
  ServiceContextFormData,
  ContextStaffRequirement,
  ContextAdditionalCost,
  ContextCostResult,
  ProductContextCostComparison,
} from '../types/serviceContext';

// ============================================================================
// NOTE: Using 'as any' for table names until DB migration runs and types regenerate
// TODO: Remove 'as any' after running migration and `supabase gen types typescript`
// ============================================================================

// Type alias for Supabase client - using 'any' since new tables aren't in types yet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// ============================================================================
// TYPES - Database row types
// ============================================================================

interface DbServiceContext {
  id: string;
  organization_id: string;
  key: string;
  name: string;
  description: string | null;
  requires_feature: string | null;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface DbContextStaffRequirement {
  id: string;
  context_id: string;
  role_id: string;
  minutes_per_unit: number;
  per: string;
  count: number;
  hourly_rate_override: number | null;
  loaded_factor_override: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined data
  staff_roles?: {
    id: string;
    name: string;
    default_hourly_rate: number | null;
    loaded_factor: number;
  };
}

interface DbContextAdditionalCost {
  id: string;
  context_id: string;
  name: string;
  cost_type: string;
  amount: number | null;
  percentage: number | null;
  amount_per_item: number | null;
  min_order_value: number | null;
  max_amount: number | null;
  is_active: boolean;
  include_in_cost: boolean;
  include_in_price: boolean;
  cost_category: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// MAPPERS
// ============================================================================

function mapDbToServiceContext(
  db: DbServiceContext,
  staffRequirements: DbContextStaffRequirement[] = [],
  additionalCosts: DbContextAdditionalCost[] = []
): ServiceContext {
  return {
    id: db.id,
    organization_id: db.organization_id,
    key: db.key,
    name: db.name,
    description: db.description ?? undefined,
    requires_feature: db.requires_feature ?? undefined,
    staff_requirements: staffRequirements.map(mapDbToStaffRequirement),
    additional_costs: additionalCosts.map(mapDbToAdditionalCost),
    is_active: db.is_active,
    is_default: db.is_default,
    sort_order: db.sort_order,
    created_at: db.created_at,
    updated_at: db.updated_at,
  };
}

function mapDbToStaffRequirement(db: DbContextStaffRequirement): ContextStaffRequirement {
  return {
    id: db.id,
    role_id: db.role_id,
    role_name: db.staff_roles?.name,
    minutes_per_unit: db.minutes_per_unit,
    per: db.per as ContextStaffRequirement['per'],
    count: db.count,
    hourly_rate_override: db.hourly_rate_override ?? undefined,
    loaded_factor_override: db.loaded_factor_override ?? undefined,
  };
}

function mapDbToAdditionalCost(db: DbContextAdditionalCost): ContextAdditionalCost {
  return {
    id: db.id,
    name: db.name,
    type: db.cost_type as ContextAdditionalCost['type'],
    amount: db.amount ?? undefined,
    percentage: db.percentage ?? undefined,
    amount_per_item: db.amount_per_item ?? undefined,
    min_order_value: db.min_order_value ?? undefined,
    max_amount: db.max_amount ?? undefined,
    is_active: db.is_active,
    include_in_cost: db.include_in_cost,
    include_in_price: db.include_in_price,
    cost_category: db.cost_category as ContextAdditionalCost['cost_category'],
  };
}

// ============================================================================
// FETCH OPERATIONS
// ============================================================================

/**
 * Fetch all service contexts for the current organization
 */
export async function fetchServiceContexts(): Promise<ServiceContext[]> {
  const { data: contexts, error } = await db
    .from('service_contexts')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    logger.error('ServiceContextApi', 'Failed to fetch service contexts', error);
    throw error;
  }

  if (!contexts || contexts.length === 0) {
    return [];
  }

  // Fetch related data for all contexts
  const contextIds = (contexts as DbServiceContext[]).map(c => c.id);
  
  const [staffReqsResult, addCostsResult] = await Promise.all([
    db
      .from('context_staff_requirements')
      .select(`
        *,
        staff_roles (id, name, default_hourly_rate, loaded_factor)
      `)
      .in('context_id', contextIds)
      .order('sort_order'),
    db
      .from('context_additional_costs')
      .select('*')
      .in('context_id', contextIds)
      .order('sort_order'),
  ]);

  if (staffReqsResult.error) {
    logger.error('ServiceContextApi', 'Failed to fetch staff requirements', staffReqsResult.error);
    throw staffReqsResult.error;
  }

  if (addCostsResult.error) {
    logger.error('ServiceContextApi', 'Failed to fetch additional costs', addCostsResult.error);
    throw addCostsResult.error;
  }

  // Group related data by context_id
  const staffReqsByContext = new Map<string, DbContextStaffRequirement[]>();
  const addCostsByContext = new Map<string, DbContextAdditionalCost[]>();

  (staffReqsResult.data as DbContextStaffRequirement[]).forEach(req => {
    const existing = staffReqsByContext.get(req.context_id) || [];
    existing.push(req);
    staffReqsByContext.set(req.context_id, existing);
  });

  (addCostsResult.data as DbContextAdditionalCost[]).forEach(cost => {
    const existing = addCostsByContext.get(cost.context_id) || [];
    existing.push(cost);
    addCostsByContext.set(cost.context_id, existing);
  });

  // Map to full ServiceContext objects
  return (contexts as DbServiceContext[]).map(ctx => 
    mapDbToServiceContext(
      ctx,
      staffReqsByContext.get(ctx.id) || [],
      addCostsByContext.get(ctx.id) || []
    )
  );
}

/**
 * Fetch a single service context by ID
 */
export async function fetchServiceContextById(id: string): Promise<ServiceContext> {
  const { data: context, error } = await db
    .from('service_contexts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    logger.error('ServiceContextApi', `Failed to fetch service context ${id}`, error);
    throw error;
  }

  // Fetch related data
  const [staffReqsResult, addCostsResult] = await Promise.all([
    db
      .from('context_staff_requirements')
      .select(`
        *,
        staff_roles (id, name, default_hourly_rate, loaded_factor)
      `)
      .eq('context_id', id)
      .order('sort_order'),
    db
      .from('context_additional_costs')
      .select('*')
      .eq('context_id', id)
      .order('sort_order'),
  ]);

  return mapDbToServiceContext(
    context as DbServiceContext,
    (staffReqsResult.data || []) as DbContextStaffRequirement[],
    (addCostsResult.data || []) as DbContextAdditionalCost[]
  );
}

/**
 * Fetch only active service contexts
 */
export async function fetchActiveServiceContexts(): Promise<ServiceContext[]> {
  const contexts = await fetchServiceContexts();
  return contexts.filter(ctx => ctx.is_active);
}

/**
 * Fetch the default service context
 */
export async function fetchDefaultServiceContext(): Promise<ServiceContext | null> {
  const { data: context, error } = await db
    .from('service_contexts')
    .select('*')
    .eq('is_default', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No default context found
      return null;
    }
    logger.error('ServiceContextApi', 'Failed to fetch default service context', error);
    throw error;
  }

  return fetchServiceContextById(context.id);
}

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new service context with staff requirements and additional costs
 */
export async function createServiceContext(
  data: ServiceContextFormData
): Promise<ServiceContext> {
  // Create the context first
  const { data: context, error: contextError } = await db
    .from('service_contexts')
    .insert({
      key: data.key,
      name: data.name,
      description: data.description || null,
      requires_feature: data.requires_feature || null,
      is_active: data.is_active,
      is_default: data.is_default,
      sort_order: data.sort_order,
    })
    .select()
    .single();

  if (contextError) {
    logger.error('ServiceContextApi', 'Failed to create service context', contextError);
    throw contextError;
  }

  const contextId = context.id;

  // Insert staff requirements
  if (data.staff_requirements.length > 0) {
    const staffReqs = data.staff_requirements.map((req, index) => ({
      context_id: contextId,
      role_id: req.role_id,
      minutes_per_unit: req.minutes_per_unit,
      per: req.per,
      count: req.count,
      hourly_rate_override: req.hourly_rate_override ?? null,
      loaded_factor_override: req.loaded_factor_override ?? null,
      sort_order: index,
    }));

    const { error: staffError } = await db
      .from('context_staff_requirements')
      .insert(staffReqs);

    if (staffError) {
      logger.error('ServiceContextApi', 'Failed to create staff requirements', staffError);
      // Rollback context creation
      await db.from('service_contexts').delete().eq('id', contextId);
      throw staffError;
    }
  }

  // Insert additional costs
  if (data.additional_costs.length > 0) {
    const addCosts = data.additional_costs.map((cost, index) => ({
      context_id: contextId,
      name: cost.name,
      cost_type: cost.type,
      amount: cost.type === 'fixed' ? cost.amount : null,
      percentage: cost.type === 'percentage' ? cost.percentage : null,
      amount_per_item: cost.type === 'per_item' ? cost.amount_per_item : null,
      min_order_value: cost.min_order_value ?? null,
      max_amount: cost.max_amount ?? null,
      is_active: cost.is_active,
      include_in_cost: cost.include_in_cost,
      include_in_price: cost.include_in_price,
      cost_category: cost.cost_category ?? 'other',
      sort_order: index,
    }));

    const { error: costsError } = await db
      .from('context_additional_costs')
      .insert(addCosts);

    if (costsError) {
      logger.error('ServiceContextApi', 'Failed to create additional costs', costsError);
      // Rollback (cascade will handle related records)
      await db.from('service_contexts').delete().eq('id', contextId);
      throw costsError;
    }
  }

  logger.info('ServiceContextApi', `Created service context ${context.key}`);
  return fetchServiceContextById(contextId);
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update a service context
 * Uses delete-and-recreate for child records (simpler than diffing)
 */
export async function updateServiceContext(
  id: string,
  data: Partial<ServiceContextFormData>
): Promise<ServiceContext> {
  // Update the context itself
  const updateData: Record<string, unknown> = {};
  if (data.key !== undefined) updateData.key = data.key;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.requires_feature !== undefined) updateData.requires_feature = data.requires_feature || null;
  if (data.is_active !== undefined) updateData.is_active = data.is_active;
  if (data.is_default !== undefined) updateData.is_default = data.is_default;
  if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;

  if (Object.keys(updateData).length > 0) {
    const { error: updateError } = await db
      .from('service_contexts')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      logger.error('ServiceContextApi', `Failed to update service context ${id}`, updateError);
      throw updateError;
    }
  }

  // Update staff requirements (delete and recreate)
  if (data.staff_requirements !== undefined) {
    await db.from('context_staff_requirements').delete().eq('context_id', id);

    if (data.staff_requirements.length > 0) {
      const staffReqs = data.staff_requirements.map((req, index) => ({
        context_id: id,
        role_id: req.role_id,
        minutes_per_unit: req.minutes_per_unit,
        per: req.per,
        count: req.count,
        hourly_rate_override: req.hourly_rate_override ?? null,
        loaded_factor_override: req.loaded_factor_override ?? null,
        sort_order: index,
      }));

      const { error: staffError } = await db
        .from('context_staff_requirements')
        .insert(staffReqs);

      if (staffError) {
        logger.error('ServiceContextApi', 'Failed to update staff requirements', staffError);
        throw staffError;
      }
    }
  }

  // Update additional costs (delete and recreate)
  if (data.additional_costs !== undefined) {
    await db.from('context_additional_costs').delete().eq('context_id', id);

    if (data.additional_costs.length > 0) {
      const addCosts = data.additional_costs.map((cost, index) => ({
        context_id: id,
        name: cost.name,
        cost_type: cost.type,
        amount: cost.type === 'fixed' ? cost.amount : null,
        percentage: cost.type === 'percentage' ? cost.percentage : null,
        amount_per_item: cost.type === 'per_item' ? cost.amount_per_item : null,
        min_order_value: cost.min_order_value ?? null,
        max_amount: cost.max_amount ?? null,
        is_active: cost.is_active,
        include_in_cost: cost.include_in_cost,
        include_in_price: cost.include_in_price,
        cost_category: cost.cost_category ?? 'other',
        sort_order: index,
      }));

      const { error: costsError } = await db
        .from('context_additional_costs')
        .insert(addCosts);

      if (costsError) {
        logger.error('ServiceContextApi', 'Failed to update additional costs', costsError);
        throw costsError;
      }
    }
  }

  logger.info('ServiceContextApi', `Updated service context ${id}`);
  return fetchServiceContextById(id);
}

/**
 * Toggle context active status
 */
export async function toggleServiceContextActive(
  id: string,
  isActive: boolean
): Promise<ServiceContext> {
  return updateServiceContext(id, { is_active: isActive });
}

/**
 * Set a context as default (unsets previous default automatically via DB trigger)
 */
export async function setDefaultServiceContext(id: string): Promise<ServiceContext> {
  return updateServiceContext(id, { is_default: true });
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete a service context (cascade deletes related records)
 */
export async function deleteServiceContext(id: string): Promise<void> {
  const { error } = await db
    .from('service_contexts')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('ServiceContextApi', `Failed to delete service context ${id}`, error);
    throw error;
  }

  logger.info('ServiceContextApi', `Deleted service context ${id}`);
}

// ============================================================================
// COST CALCULATION
// ============================================================================

/**
 * Calculate the cost for a specific context given order details
 */
export async function calculateContextCost(
  contextId: string,
  orderTotal: number,
  itemCount: number
): Promise<ContextCostResult> {
  const context = await fetchServiceContextById(contextId);
  
  // Calculate staff costs
  const staffCosts: ContextCostResult['staff_costs'] = [];
  let totalStaffCost = 0;

  for (const req of context.staff_requirements) {
    // Get role info for rate calculation
    const { data: role } = await db
      .from('staff_roles')
      .select('default_hourly_rate, loaded_factor')
      .eq('id', req.role_id)
      .single();

    const hourlyRate = req.hourly_rate_override ?? role?.default_hourly_rate ?? 0;
    const loadedFactor = req.loaded_factor_override ?? role?.loaded_factor ?? 1.0;
    
    // Calculate units based on 'per' type
    let units = 1;
    if (req.per === 'item') {
      units = itemCount;
    }
    // 'order', 'guest', 'table' all default to 1 for now
    // (guest and table would need additional context to calculate)

    const hoursWorked = (req.minutes_per_unit * units * req.count) / 60;
    const cost = hoursWorked * hourlyRate * loadedFactor;

    staffCosts.push({
      role_id: req.role_id,
      role_name: req.role_name || 'Unknown',
      minutes: req.minutes_per_unit * units * req.count,
      hourly_rate: hourlyRate,
      loaded_factor: loadedFactor,
      cost,
    });

    totalStaffCost += cost;
  }

  // Calculate additional costs
  const additionalCosts: ContextCostResult['additional_costs'] = [];
  let totalAdditionalCost = 0;

  for (const cost of context.additional_costs) {
    if (!cost.is_active || !cost.include_in_cost) continue;
    
    // Check minimum order value
    if (cost.min_order_value && orderTotal < cost.min_order_value) continue;

    let calculatedCost = 0;
    switch (cost.type) {
      case 'fixed':
        calculatedCost = cost.amount ?? 0;
        break;
      case 'percentage':
        calculatedCost = orderTotal * (cost.percentage ?? 0);
        break;
      case 'per_item':
        calculatedCost = (cost.amount_per_item ?? 0) * itemCount;
        break;
    }

    // Apply max cap
    if (cost.max_amount && calculatedCost > cost.max_amount) {
      calculatedCost = cost.max_amount;
    }

    additionalCosts.push({
      name: cost.name,
      type: cost.type,
      cost: calculatedCost,
    });

    totalAdditionalCost += calculatedCost;
  }

  return {
    context_id: context.id,
    context_name: context.name,
    staff_costs: staffCosts,
    total_staff_cost: totalStaffCost,
    additional_costs: additionalCosts,
    total_additional_cost: totalAdditionalCost,
    total_context_cost: totalStaffCost + totalAdditionalCost,
  };
}

/**
 * Calculate cost comparison across all active contexts for a product
 */
export async function calculateProductContextCosts(
  productId: string,
  baseCost: number,
  orderTotal: number,
  itemCount: number = 1
): Promise<ProductContextCostComparison> {
  const contexts = await fetchActiveServiceContexts();
  
  const contextResults = await Promise.all(
    contexts.map(async (ctx) => {
      const costResult = await calculateContextCost(ctx.id, orderTotal, itemCount);
      return {
        context_id: ctx.id,
        context_name: ctx.name,
        context_cost: costResult.total_context_cost,
        total_cost: baseCost + costResult.total_context_cost,
      };
    })
  );

  return {
    product_id: productId,
    base_cost: baseCost,
    contexts: contextResults,
  };
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Initialize default contexts for a new organization
 */
export async function initializeDefaultContexts(
  defaults: ServiceContextFormData[]
): Promise<ServiceContext[]> {
  const results: ServiceContext[] = [];
  
  for (const data of defaults) {
    try {
      const context = await createServiceContext(data);
      results.push(context);
    } catch (error) {
      logger.error('ServiceContextApi', `Failed to create default context ${data.key}`, error);
      // Continue with other contexts
    }
  }

  return results;
}

/**
 * Reorder contexts
 */
export async function reorderServiceContexts(
  orderedIds: string[]
): Promise<void> {
  const updates = orderedIds.map((id, index) => ({
    id,
    sort_order: index,
  }));

  for (const update of updates) {
    await db
      .from('service_contexts')
      .update({ sort_order: update.sort_order })
      .eq('id', update.id);
  }

  logger.info('ServiceContextApi', 'Reordered service contexts');
}
