/**
 * Production Batches API Service
 *
 * Service for managing production batches (immediate and scheduled execution).
 * Handles CRUD operations and production execution tracking.
 *
 * @module recipe/services
 */

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logging'
import type {
  ProductionBatch,
  ProductionBatchStatus,
  ProductionExecutionResult
} from '../types/production'

const LOG_PREFIX = '[ProductionBatchesAPI]'

// ============================================
// TYPE TRANSFORMATIONS
// ============================================

interface ProductionBatchDB {
  id: string
  recipe_id: string
  material_id?: string | null
  scheduled_at?: string | null
  executed_at?: string | null
  status: string
  expected_quantity: string
  actual_quantity?: string | null
  scrap_quantity?: string | null
  yield_percentage?: string | null
  scrap_reason?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  created_by?: string | null
}

function transformBatchFromDB(db: ProductionBatchDB): ProductionBatch {
  return {
    id: db.id,
    recipeId: db.recipe_id,
    materialId: db.material_id ?? undefined,
    scheduledAt: db.scheduled_at ? new Date(db.scheduled_at) : undefined,
    executedAt: db.executed_at ? new Date(db.executed_at) : undefined,
    status: db.status as ProductionBatchStatus,
    expectedQuantity: parseFloat(db.expected_quantity),
    actualQuantity: db.actual_quantity
      ? parseFloat(db.actual_quantity)
      : undefined,
    scrapQuantity: db.scrap_quantity ? parseFloat(db.scrap_quantity) : undefined,
    yieldPercentage: db.yield_percentage
      ? parseFloat(db.yield_percentage)
      : undefined,
    scrapReason: db.scrap_reason ?? undefined,
    notes: db.notes ?? undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
    createdBy: db.created_by ?? undefined
  }
}

function transformBatchToDB(
  batch: Partial<ProductionBatch>
): Partial<ProductionBatchDB> {
  return {
    recipe_id: batch.recipeId,
    material_id: batch.materialId ?? null,
    scheduled_at: batch.scheduledAt?.toISOString() ?? null,
    executed_at: batch.executedAt?.toISOString() ?? null,
    status: batch.status,
    expected_quantity: batch.expectedQuantity?.toString(),
    actual_quantity: batch.actualQuantity?.toString() ?? null,
    scrap_quantity: batch.scrapQuantity?.toString() ?? null,
    scrap_reason: batch.scrapReason ?? null,
    notes: batch.notes ?? null
  }
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Create a new production batch
 */
export async function createProductionBatch(
  batch: Omit<ProductionBatch, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ProductionBatch> {
  try {
    const dbBatch = transformBatchToDB(batch)

    const { data, error } = await supabase
      .from('production_batches')
      .insert(dbBatch)
      .select()
      .single()

    if (error) {
      logger.error(LOG_PREFIX, 'Failed to create production batch', { error })
      throw error
    }

    logger.info(LOG_PREFIX, 'Production batch created', {
      batchId: data.id,
      recipeId: batch.recipeId
    })

    return transformBatchFromDB(data)
  } catch (error) {
    logger.error(LOG_PREFIX, 'Error creating production batch', { error })
    throw error
  }
}

/**
 * Get production batch by ID
 */
export async function getProductionBatch(
  id: string
): Promise<ProductionBatch | null> {
  try {
    const { data, error } = await supabase
      .from('production_batches')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      logger.error(LOG_PREFIX, 'Failed to fetch production batch', { error, id })
      throw error
    }

    return transformBatchFromDB(data)
  } catch (error) {
    logger.error(LOG_PREFIX, 'Error fetching production batch', { error })
    throw error
  }
}

/**
 * Get production batches by recipe ID
 */
export async function getProductionBatchesByRecipe(
  recipeId: string
): Promise<ProductionBatch[]> {
  try {
    const { data, error } = await supabase
      .from('production_batches')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error(LOG_PREFIX, 'Failed to fetch production batches', {
        error,
        recipeId
      })
      throw error
    }

    return data.map(transformBatchFromDB)
  } catch (error) {
    logger.error(LOG_PREFIX, 'Error fetching production batches', { error })
    throw error
  }
}

/**
 * Get scheduled production batches
 */
export async function getScheduledBatches(): Promise<ProductionBatch[]> {
  try {
    const { data, error } = await supabase
      .from('production_batches')
      .select('*')
      .eq('status', 'scheduled')
      .not('scheduled_at', 'is', null)
      .order('scheduled_at', { ascending: true })

    if (error) {
      logger.error(LOG_PREFIX, 'Failed to fetch scheduled batches', { error })
      throw error
    }

    return data.map(transformBatchFromDB)
  } catch (error) {
    logger.error(LOG_PREFIX, 'Error fetching scheduled batches', { error })
    throw error
  }
}

/**
 * Update production batch
 */
export async function updateProductionBatch(
  id: string,
  updates: Partial<ProductionBatch>
): Promise<ProductionBatch> {
  try {
    const dbUpdates = transformBatchToDB(updates)

    const { data, error } = await supabase
      .from('production_batches')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error(LOG_PREFIX, 'Failed to update production batch', {
        error,
        id
      })
      throw error
    }

    logger.info(LOG_PREFIX, 'Production batch updated', { batchId: id })

    return transformBatchFromDB(data)
  } catch (error) {
    logger.error(LOG_PREFIX, 'Error updating production batch', { error })
    throw error
  }
}

/**
 * Complete production batch (mark as completed with actual quantities)
 */
export async function completeProductionBatch(
  id: string,
  result: {
    actualQuantity: number
    scrapQuantity?: number
    scrapReason?: string
    notes?: string
  }
): Promise<ProductionExecutionResult> {
  try {
    const batch = await getProductionBatch(id)
    if (!batch) {
      throw new Error(`Production batch ${id} not found`)
    }

    const yieldPercentage =
      (result.actualQuantity / batch.expectedQuantity) * 100

    const updated = await updateProductionBatch(id, {
      status: ProductionBatchStatus.COMPLETED,
      executedAt: new Date(),
      actualQuantity: result.actualQuantity,
      scrapQuantity: result.scrapQuantity ?? 0,
      scrapReason: result.scrapReason,
      notes: result.notes,
      yieldPercentage
    })

    logger.info(LOG_PREFIX, 'Production batch completed', {
      batchId: id,
      yieldPercentage
    })

    return {
      batchId: updated.id,
      success: true,
      actualQuantity: updated.actualQuantity!,
      scrapQuantity: updated.scrapQuantity ?? 0,
      yieldPercentage: updated.yieldPercentage!,
      executedAt: updated.executedAt!
    }
  } catch (error) {
    logger.error(LOG_PREFIX, 'Error completing production batch', { error, id })
    throw error
  }
}

/**
 * Cancel production batch
 */
export async function cancelProductionBatch(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('production_batches')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) {
      logger.error(LOG_PREFIX, 'Failed to cancel production batch', {
        error,
        id
      })
      throw error
    }

    logger.info(LOG_PREFIX, 'Production batch cancelled', { batchId: id })
  } catch (error) {
    logger.error(LOG_PREFIX, 'Error cancelling production batch', { error })
    throw error
  }
}

/**
 * Delete production batch
 */
export async function deleteProductionBatch(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('production_batches')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error(LOG_PREFIX, 'Failed to delete production batch', {
        error,
        id
      })
      throw error
    }

    logger.info(LOG_PREFIX, 'Production batch deleted', { batchId: id })
  } catch (error) {
    logger.error(LOG_PREFIX, 'Error deleting production batch', { error })
    throw error
  }
}
