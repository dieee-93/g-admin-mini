/**
 * useProductionConfig - Hook for Production Configuration
 *
 * Manages production execution state and logic for elaborated materials.
 * Handles both immediate and scheduled production execution.
 *
 * @module recipe/hooks
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { logger } from '@/lib/logging'
import eventBus from '@/lib/events/EventBus'
import { createProductionBatch } from '../services/productionBatchesApi'
import type { Recipe } from '../types/recipe'
import {
  type ProductionConfig,
  ProductionBatchStatus
} from '../types/production'
import { EventPriority } from '@/lib/events/types'

const LOG_PREFIX = 'Recipe'

export interface UseProductionConfigParams {
  recipe: Partial<Recipe>
  entityType: 'material' | 'product' | 'service' | 'kit'
}

export interface UseProductionConfigReturn {
  // State
  config: ProductionConfig
  fieldErrors: Record<string, string>
  isSubmitting: boolean

  // Computed
  canProduceNow: boolean
  canSchedule: boolean
  yieldPercentage: number

  // Actions
  updateConfig: (field: keyof ProductionConfig, value: unknown) => void
  handleProduceNowChange: (checked: boolean) => void
  handleScheduleChange: (checked: boolean) => void
  validateConfig: () => boolean
  executeProduction: () => Promise<boolean>
}

/**
 * Hook for managing production configuration
 */
export function useProductionConfig({
  recipe,
  entityType
}: UseProductionConfigParams): UseProductionConfigReturn {
  // ============================================
  // STATE
  // ============================================

  const [config, setConfig] = useState<ProductionConfig>({
    produceNow: false,
    scheduleProduction: false,
    expectedQuantity: recipe.output?.quantity ?? 1,
    unit: recipe.output?.unit ?? 'unit'
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ============================================
  // COMPUTED
  // ============================================

  // Allow production config for materials (even before saving the recipe)
  const canProduceNow = useMemo(() => {
    return entityType === 'material' || entityType === 'kit'
  }, [entityType])

  const canSchedule = useMemo(() => {
    return entityType === 'material' || entityType === 'kit'
  }, [entityType])

  const yieldPercentage = useMemo(() => {
    if (!config.actualQuantity || !config.expectedQuantity) return 100
    return (config.actualQuantity / config.expectedQuantity) * 100
  }, [config.actualQuantity, config.expectedQuantity])

  // ============================================
  // VALIDATION
  // ============================================

  const validateConfig = useCallback((): boolean => {
    const errors: Record<string, string> = {}

    // Mutual exclusion
    if (config.produceNow && config.scheduleProduction) {
      errors.general = 'No puedes producir ahora y programar al mismo tiempo'
    }

    // Produce now validations
    if (config.produceNow) {
      if (!config.actualQuantity || config.actualQuantity <= 0) {
        errors.actualQuantity = 'La cantidad obtenida es requerida'
      }

      if (config.scrapQuantity && config.scrapQuantity > 0 && !config.scrapReason) {
        errors.scrapReason = 'Debes especificar el motivo del desperdicio'
      }

      const total = (config.actualQuantity ?? 0) + (config.scrapQuantity ?? 0)
      if (total > config.expectedQuantity * 1.5) {
        errors.general = 'La suma de cantidad obtenida y desperdicio es muy alta'
      }
    }

    // Schedule validations
    if (config.scheduleProduction) {
      if (!config.scheduledAt) {
        errors.scheduledAt = 'Debes seleccionar una fecha'
      } else if (config.scheduledAt <= new Date()) {
        errors.scheduledAt = 'La fecha debe ser futura'
      }

      if (!config.frequency) {
        errors.frequency = 'Debes seleccionar una frecuencia'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [config])

  // ============================================
  // ACTIONS
  // ============================================

  const updateConfig = useCallback(
    (field: keyof ProductionConfig, value: unknown) => {
      setConfig(prev => ({ ...prev, [field]: value }))

      // Clear field error when user types
      if (fieldErrors[field]) {
        setFieldErrors(prev => {
          const next = { ...prev }
          delete next[field]
          return next
        })
      }
    },
    [fieldErrors]
  )

  const handleProduceNowChange = useCallback(
    (checked: boolean) => {
      setConfig(prev => ({
        ...prev,
        produceNow: checked,
        scheduleProduction: checked ? false : prev.scheduleProduction
      }))
    },
    []
  )

  const handleScheduleChange = useCallback(
    (checked: boolean) => {
      setConfig(prev => ({
        ...prev,
        scheduleProduction: checked,
        produceNow: checked ? false : prev.produceNow
      }))
    },
    []
  )

  const executeProduction = useCallback(async (): Promise<boolean> => {
    if (!validateConfig()) {
      return false
    }

    setIsSubmitting(true)

    try {
      if (config.produceNow) {
        // Create production batch for immediate execution
        const batch = await createProductionBatch({
          recipeId: recipe.id!,
          materialId: undefined, // Will be set after material is created
          status: ProductionBatchStatus.IN_PROGRESS,
          expectedQuantity: config.expectedQuantity,
          actualQuantity: config.actualQuantity!,
          scrapQuantity: config.scrapQuantity ?? 0,
          scrapReason: config.scrapReason,
          notes: config.productionNotes,
          yieldPercentage,
          executedAt: new Date()
        })

        // Emit event for immediate production
        await eventBus.emit(
          'production.immediate.requested',
          {
            batchId: batch.id,
            recipeId: recipe.id!,
            expectedQuantity: config.expectedQuantity,
            actualQuantity: config.actualQuantity!,
            scrapQuantity: config.scrapQuantity ?? 0,
            scrapReason: config.scrapReason,
            notes: config.productionNotes,
            yieldPercentage
          },
          { priority: EventPriority.HIGH }
        )

        logger.info(LOG_PREFIX, 'Immediate production requested', {
          batchId: batch.id,
          recipeId: recipe.id,
          actualQuantity: config.actualQuantity
        })
      } else if (config.scheduleProduction) {
        // Create production batch for scheduled execution
        const batch = await createProductionBatch({
          recipeId: recipe.id!,
          materialId: undefined,
          status: ProductionBatchStatus.SCHEDULED,
          scheduledAt: config.scheduledAt!,
          expectedQuantity: config.expectedQuantity
        })

        // Emit event for scheduled production
        await eventBus.emit(
          'production.scheduled',
          {
            batchId: batch.id,
            recipeId: recipe.id!,
            scheduledAt: config.scheduledAt!.toISOString(),
            frequency: config.frequency!,
            expectedQuantity: config.expectedQuantity
          },
          { priority: EventPriority.NORMAL }
        )

        logger.info(LOG_PREFIX, 'Production scheduled', {
          batchId: batch.id,
          recipeId: recipe.id,
          scheduledAt: config.scheduledAt
        })
      }

      return true
    } catch (error) {
      logger.error(LOG_PREFIX, 'Failed to execute production', { error })
      setFieldErrors({ general: 'Error al ejecutar la producción' })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [config, recipe.id, validateConfig, yieldPercentage])

  // ============================================
  // EFFECTS
  // ============================================

  // Update expected quantity when recipe output changes
  useEffect(() => {
    if (recipe.output?.quantity) {
      setConfig(prev => ({
        ...prev,
        expectedQuantity: recipe.output?.quantity ?? 1,
        unit: recipe.output?.unit ?? 'unit'
      }))
    }
  }, [recipe.output?.quantity, recipe.output?.unit])

  // ============================================
  // RETURN
  // ============================================

  return {
    config,
    fieldErrors,
    isSubmitting,
    canProduceNow,
    canSchedule,
    yieldPercentage,
    updateConfig,
    handleProduceNowChange,
    handleScheduleChange,
    validateConfig,
    executeProduction
  }
}
