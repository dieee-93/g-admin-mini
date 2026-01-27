/**
 * RecipeProductionSection - Production Execution Configuration for Recipes
 *
 * Component for configuring production execution for elaborated materials.
 * Supports: Define only, Produce now, Schedule production (with recurrence)
 *
 * @module recipe/components
 */

import React, { useCallback, useMemo, useState } from 'react'
import {
  Box,
  Stack,
  Text,
  RadioGroup,
  RadioItem,
  InputField,
  SelectField,
  createListCollection,
  FormSection
} from '@/shared/ui'
import { useProductionConfig } from '../hooks/useProductionConfig'
import { ScrapReason, ProductionFrequency } from '../types/production'
import type { Recipe } from '../types/recipe'
import { DecimalUtils } from '@/lib/decimal'
import { logger } from '@/lib/logging'
import { ScheduledProductionForm } from './ScheduledProductionForm'

// ============================================
// TYPES
// ============================================

export interface RecipeProductionSectionProps {
  entityType: 'material' | 'product' | 'service'
  recipe: Partial<Recipe>
  updateRecipe?: (updates: Partial<Recipe>) => void
}

type ProductionMode = 'none' | 'immediate' | 'scheduled'

// ============================================
// CONSTANTS
// ============================================

const SCRAP_REASONS = createListCollection({
  items: [
    { value: ScrapReason.NORMAL_WASTE, label: 'Merma normal' },
    { value: ScrapReason.QUALITY_ISSUE, label: 'Problema de calidad' },
    { value: ScrapReason.EQUIPMENT_FAILURE, label: 'Falla de equipo' },
    { value: ScrapReason.OPERATOR_ERROR, label: 'Error de operador' },
    { value: ScrapReason.MATERIAL_DEFECT, label: 'Defecto de material' },
    { value: ScrapReason.OTHER, label: 'Otro' }
  ]
})

const FREQUENCIES = createListCollection({
  items: [
    { value: ProductionFrequency.ONCE, label: 'Una vez' },
    { value: ProductionFrequency.DAILY, label: 'Diario' },
    { value: ProductionFrequency.WEEKLY, label: 'Semanal' },
    { value: ProductionFrequency.MONTHLY, label: 'Mensual' }
  ]
})

// ============================================
// COMPONENT
// ============================================

export function RecipeProductionSection({
  entityType,
  recipe,
  updateRecipe
}: RecipeProductionSectionProps) {
  // ============================================
  // STATE
  // ============================================

  // (No local state needed - moved to child components)

  // ============================================
  // HOOKS
  // ============================================

  const {
    config,
    fieldErrors,
    canProduceNow,
    canSchedule,
    yieldPercentage,
    updateConfig,
    handleProduceNowChange,
    handleScheduleChange
  } = useProductionConfig({
    recipe,
    entityType
  })

  // ============================================
  // COMPUTED
  // ============================================

  // Derive mode from config state (single source of truth)
  const mode = useMemo<ProductionMode>(() => {
    if (config.produceNow) return 'immediate'
    if (config.scheduleProduction) return 'scheduled'
    return 'none'
  }, [config.produceNow, config.scheduleProduction])
  
  // Debug: Log current mode
  logger.debug('RecipeProductionSection', `Current mode: ${mode}, produceNow: ${config.produceNow}, scheduleProduction: ${config.scheduleProduction}`)

  const yieldColor = useMemo(() => {
    if (yieldPercentage >= 95) return 'var(--colors-success)'
    if (yieldPercentage >= 85) return 'var(--colors-warning)'
    return 'var(--colors-error)'
  }, [yieldPercentage])

  const nextExecutionText = useMemo(() => {
    if (!config.scheduledAt || !config.frequency) return ''

    const date = new Date(config.scheduledAt)
    const formatter = new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })

    return formatter.format(date)
  }, [config.scheduledAt, config.frequency])

  const estimatedCost = useMemo(() => {
    if (!recipe.inputs || recipe.inputs.length === 0) return 0
    
    return recipe.inputs.reduce((sum, input) => {
      const unitCost = typeof input.item === 'object' && input.item.unitCost 
        ? input.item.unitCost 
        : 0
      
      // Use DecimalUtils for financial precision
      const itemCost = DecimalUtils.multiply(
        DecimalUtils.multiply(unitCost, input.quantity, 'inventory'),
        config.expectedQuantity,
        'inventory'
      )
      
      return DecimalUtils.add(sum, itemCost, 'inventory')
    }, 0)
  }, [recipe.inputs, config.expectedQuantity])

  // ============================================
  // HANDLERS
  // ============================================

  const handleModeChange = useCallback((value: string) => {
    logger.info('RecipeProductionSection', `handleModeChange called with: ${value}`)
    const newMode = value as ProductionMode
    
    // Update config based on mode (this triggers re-render via hook)
    if (newMode === 'none') {
      handleProduceNowChange(false)
      handleScheduleChange(false)
    } else if (newMode === 'immediate') {
      handleProduceNowChange(true)
      handleScheduleChange(false)
    } else if (newMode === 'scheduled') {
      handleProduceNowChange(false)
      handleScheduleChange(true)
    }
  }, [handleProduceNowChange, handleScheduleChange])

  const handleActualQuantityChange = useCallback(
    (value: string) => {
      const parsed = parseFloat(value)
      if (!isNaN(parsed)) {
        updateConfig('actualQuantity', parsed)
      }
    },
    [updateConfig]
  )

  const handleScrapQuantityChange = useCallback(
    (value: string) => {
      const parsed = parseFloat(value)
      if (!isNaN(parsed)) {
        updateConfig('scrapQuantity', parsed)
      }
    },
    [updateConfig]
  )

  const handleFrequencyChange = useCallback(
    (value: string) => {
      updateConfig('frequency', value)
    },
    [updateConfig]
  )

  // ============================================
  // RENDER HELPERS
  // ============================================

  // Case: Product/Service (info only)
  if (entityType !== 'material') {
    return (
      <Box
        p="4"
        bg="var(--colors-bg-subtle)"
        borderRadius="md"
        borderWidth="1px"
        borderColor="var(--colors-border-subtle)"
      >
        <Stack gap="3">
          <Text fontSize="sm" fontWeight="medium" color="var(--colors-fg)">
            ℹ️ INFORMACIÓN DE BOM
          </Text>
          <Text fontSize="sm" color="var(--colors-fg-muted)">
            Esta receta se ejecuta automáticamente:
          </Text>
          <Stack gap="1" pl="4">
            <Text fontSize="sm" color="var(--colors-fg-muted)">
              • <strong>Producto:</strong> Al momento de cada venta
            </Text>
            <Text fontSize="sm" color="var(--colors-fg-muted)">
              • <strong>Servicio:</strong> Al ejecutar el servicio
            </Text>
          </Stack>
          <Text fontSize="sm" color="var(--colors-fg-muted)">
            Los ingredientes se consumen en cada ejecución.
          </Text>
        </Stack>
      </Box>
    )
  }

  // Case: Material (full production config)
  return (
    <FormSection title="Ejecución de la Producción">
      <Stack gap="6">
        {/* General error */}
        {fieldErrors.general && (
          <Box
            p="3"
            bg="var(--colors-error-subtle)"
            borderRadius="md"
            borderWidth="1px"
            borderColor="var(--colors-error)"
          >
            <Text fontSize="sm" color="var(--colors-error)">
              {fieldErrors.general} 
            </Text>
          </Box>
        )}

        {/* Mode Selection */}
        <RadioGroup value={mode} defaultValue="none" onValueChange={handleModeChange}>
          {/* Option 1: Define Only */}
          <RadioItem value="none">
            Solo definir receta
          </RadioItem>

          {/* Option 2: Produce Now */}
          <RadioItem value="immediate" disabled={!canProduceNow}>
            Producir ahora
          </RadioItem>

          {/* Option 3: Schedule */}
          <RadioItem value="scheduled" disabled={!canSchedule}>
            Programar producción
          </RadioItem>
        </RadioGroup>

        {/* Expanded content for "Produce Now" */}
        {mode === 'immediate' && (
          <Box
            p="4"
            bg="var(--colors-bg-subtle)"
            borderRadius="md"
            borderWidth="1px"
            borderColor="var(--colors-border-subtle)"
          >
            <Stack gap="4">
              <Text fontSize="sm" fontWeight="medium">
                MEDICIÓN POST-PRODUCCIÓN
              </Text>

              {/* Expected Quantity (read-only) */}
              <InputField
                label="Cantidad Esperada"
                value={`${config.expectedQuantity} ${config.unit}`}
                readOnly
                disabled
              />

              {/* Actual Quantity */}
              <Box>
                <InputField
                  label="Cantidad Obtenida *"
                  type="number"
                  step="0.001"
                  value={config.actualQuantity?.toString() ?? ''}
                  onChange={e => handleActualQuantityChange(e.target.value)}
                  style={{
                    borderColor: fieldErrors.actualQuantity
                      ? 'var(--colors-error)'
                      : undefined
                  }}
                />
                {config.actualQuantity && (
                  <Text
                    fontSize="xs"
                    mt="1"
                    color={yieldColor}
                    fontWeight="medium"
                  >
                    ⚠️ Yield: {yieldPercentage.toFixed(1)}%
                  </Text>
                )}
                {fieldErrors.actualQuantity && (
                  <Text fontSize="xs" mt="1" color="var(--colors-error)">
                    {fieldErrors.actualQuantity}
                  </Text>
                )}
              </Box>

              {/* Scrap Quantity */}
              <InputField
                label={`Desperdicio (Scrap) - ${config.unit}`}
                type="number"
                step="0.001"
                value={config.scrapQuantity?.toString() ?? ''}
                onChange={e => handleScrapQuantityChange(e.target.value)}
              />

              {/* Scrap Reason */}
              {config.scrapQuantity && config.scrapQuantity > 0 && (
                <Box>
                  <SelectField
                    label="Motivo *"
                    collection={SCRAP_REASONS}
                    value={config.scrapReason ? [config.scrapReason] : []}
                    onValueChange={details =>
                      updateConfig('scrapReason', details.value[0])
                    }
                    style={{
                      borderColor: fieldErrors.scrapReason
                        ? 'var(--colors-error)'
                        : undefined
                    }}
                  />
                  {fieldErrors.scrapReason && (
                    <Text fontSize="xs" mt="1" color="var(--colors-error)">
                      {fieldErrors.scrapReason}
                    </Text>
                  )}
                </Box>
              )}
            </Stack>
          </Box>
        )}

        {/* Expanded content for "Schedule" */}
        {mode === 'scheduled' && (
          <ScheduledProductionForm
            scheduledAt={config.scheduledAt}
            frequency={config.frequency}
            fieldErrors={{
              scheduledAt: fieldErrors.scheduledAt,
              frequency: fieldErrors.frequency
            }}
            onScheduledAtChange={date => updateConfig('scheduledAt', date)}
            onFrequencyChange={handleFrequencyChange}
          />
        )}

        {/* Preview de consumo */}
        {mode !== 'none' && recipe.inputs && recipe.inputs.length > 0 && (
          <Box
            p="4"
            bg="var(--colors-info-subtle)"
            borderRadius="md"
            borderWidth="1px"
            borderColor="var(--colors-info)"
          >
            <Stack gap="3">
              <Text fontSize="sm" fontWeight="medium" color="var(--colors-info)">
                ℹ️ {mode === 'immediate' ? 'Se consumirá' : 'Se consumirá al ejecutar'}
              </Text>
              <Stack gap="1">
                {recipe.inputs.map((input, index) => {
                  const itemName = typeof input.item === 'object' ? input.item.name : 'Desconocido'
                  return (
                    <Text key={input.id || index} fontSize="xs" color="var(--colors-fg-muted)">
                      • {itemName}: <strong>{input.quantity * config.expectedQuantity} {input.unit}</strong>
                    </Text>
                  )
                })}
              </Stack>
              <Text fontSize="xs" fontWeight="medium" color="var(--colors-fg)">
                Costo estimado: ${estimatedCost.toFixed(2)}
              </Text>
            </Stack>
          </Box>
        )}
      </Stack>
    </FormSection>
  )
}

export default RecipeProductionSection
