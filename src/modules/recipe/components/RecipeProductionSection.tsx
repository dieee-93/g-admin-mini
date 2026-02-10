/**
 * RecipeProductionSection - Production Execution Configuration for Recipes
 *
 * Component for configuring production execution for elaborated materials.
 * Supports: Produce now, Schedule production (with recurrence)
 *
 * CHANGES (Phase 3 - Yield Tracking):
 * - Removed "Solo definir receta" option (materials require production)
 * - Added totalCost prop for real unit cost calculation
 * - Added editable batch size (replaces read-only expectedQuantity)
 * - Calculates REAL unit cost: totalCost / actualQuantity
 * - Shows comparison: estimated vs real unit cost
 * - Enhanced yield visual feedback
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
  FormSection,
  Typography,
  Flex
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
  entityType: 'material' | 'product' | 'service' | 'kit'
  recipe: Partial<Recipe>
  updateRecipe?: (updates: Partial<Recipe>) => void
  totalCost?: number // NEW: Total manufacturing cost for unit cost calculation
}

type ProductionMode = 'immediate' | 'scheduled' // Removed 'none'

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
  updateRecipe,
  totalCost = 0
}: RecipeProductionSectionProps) {
  // ============================================
  // STATE
  // ============================================

  const [batchSize, setBatchSize] = useState<number>(1)

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

  // Derive mode from config state (removed 'none' option)
  const mode = useMemo<ProductionMode>(() => {
    if (config.produceNow) return 'immediate'
    return 'scheduled' // Default to scheduled instead of none
  }, [config.produceNow])

  // Debug: Log current mode
  logger.debug('Recipe', `Current mode: ${mode}, produceNow: ${config.produceNow}, scheduleProduction: ${config.scheduleProduction}`)

  const yieldColor = useMemo(() => {
    if (yieldPercentage >= 95) return 'green'
    if (yieldPercentage >= 85) return 'orange'
    return 'red'
  }, [yieldPercentage])

  const yieldStatus = useMemo(() => {
    if (yieldPercentage >= 95) return '✅ Excelente'
    if (yieldPercentage >= 85) return '⚠️ Aceptable'
    return '❌ Bajo'
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

  // Calculate estimated unit cost
  const estimatedUnitCost = useMemo(() => {
    if (batchSize === 0) return 0
    return totalCost / batchSize
  }, [totalCost, batchSize])

  // Calculate REAL unit cost
  const realUnitCost = useMemo(() => {
    if (!config.actualQuantity || config.actualQuantity === 0) return 0
    return totalCost / config.actualQuantity
  }, [totalCost, config.actualQuantity])

  // Cost difference (real vs estimated)
  const costDifference = useMemo(() => {
    if (estimatedUnitCost === 0) return 0
    return ((realUnitCost - estimatedUnitCost) / estimatedUnitCost) * 100
  }, [realUnitCost, estimatedUnitCost])

  // ============================================
  // HANDLERS
  // ============================================

  const handleModeChange = useCallback((value: string) => {
    logger.info('Recipe', `handleModeChange called with: ${value}`)
    const newMode = value as ProductionMode

    if (newMode === 'immediate') {
      handleProduceNowChange(true)
      handleScheduleChange(false)
    } else if (newMode === 'scheduled') {
      handleProduceNowChange(false)
      handleScheduleChange(true)
    }
  }, [handleProduceNowChange, handleScheduleChange])

  const handleBatchSizeChange = useCallback(
    (value: string) => {
      const parsed = parseFloat(value)
      if (!isNaN(parsed) && parsed > 0) {
        setBatchSize(parsed)
        updateConfig('expectedQuantity', parsed)
      }
    },
    [updateConfig]
  )

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
        bg="bg.subtle"
        borderRadius="md"
        borderWidth="1px"
        borderColor="border.subtle"
      >
        <Stack gap="3">
          <Text fontSize="sm" fontWeight="medium" color="fg.default">
            ℹ️ INFORMACIÓN DE BOM
          </Text>
          <Text fontSize="sm" color="fg.muted">
            Esta receta se ejecuta automáticamente:
          </Text>
          <Stack gap="1" pl="4">
            <Text fontSize="sm" color="fg.muted">
              • <strong>Producto:</strong> Al momento de cada venta
            </Text>
            <Text fontSize="sm" color="fg.muted">
              • <strong>Servicio:</strong> Al ejecutar el servicio
            </Text>
          </Stack>
          <Text fontSize="sm" color="fg.muted">
            Los ingredientes se consumen en cada ejecución.
          </Text>
        </Stack>
      </Box>
    )
  }

  // Case: Material (full production config)
  return (
    <Box
      p="5"
      bg="bg.panel"
      borderWidth="3px"
      borderColor="border.emphasized"
      borderRadius="xl"
      boxShadow="lg"
    >
      <Stack gap="6">
        {/* Header */}
        <Typography fontSize="sm" fontWeight="700">
          🏭 EJECUCIÓN DE PRODUCCIÓN
        </Typography>

        {/* General error */}
        {fieldErrors.general && (
          <Box
            p="3"
            bg="red.50"
            borderRadius="md"
            borderWidth="1px"
            borderColor="red.500"
          >
            <Text fontSize="sm" color="red.700">
              {fieldErrors.general}
            </Text>
          </Box>
        )}

        {/* Batch Size (Editable) */}
        <Box p="4" bg="blue.50" borderRadius="md" borderWidth="2px" borderColor="blue.200">
          <Stack gap="3">
            <Typography fontSize="sm" fontWeight="700" color="blue.700">
              📊 Configuración de Batch
            </Typography>
            <InputField
              label="Batch Size (cantidad a producir)"
              type="number"
              step="0.001"
              value={batchSize.toString()}
              onChange={e => handleBatchSizeChange(e.target.value)}
              helperText="Cantidad objetivo a producir en este batch"
            />
            {totalCost > 0 && (
              <Box p="3" bg="blue.100" borderRadius="md">
                <Typography fontSize="sm" fontWeight="600">
                  💰 Costo Unitario Estimado: ${estimatedUnitCost.toFixed(2)}/{config.unit}
                </Typography>
                <Typography fontSize="xs" color="fg.muted" mt="1">
                  (Total ${totalCost.toFixed(2)} / {batchSize} {config.unit})
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Mode Selection */}
        <RadioGroup value={mode} onValueChange={handleModeChange}>
          {/* Option 1: Produce Now */}
          <RadioItem value="immediate" disabled={!canProduceNow}>
            Producir ahora
          </RadioItem>

          {/* Option 2: Schedule */}
          <RadioItem value="scheduled" disabled={!canSchedule}>
            Programar producción
          </RadioItem>
        </RadioGroup>

        {/* Expanded content for "Produce Now" */}
        {mode === 'immediate' && (
          <Box
            p="4"
            bg="bg.subtle"
            borderRadius="md"
            borderWidth="1px"
            borderColor="border.subtle"
          >
            <Stack gap="4">
              <Text fontSize="sm" fontWeight="medium">
                📏 MEDICIÓN POST-PRODUCCIÓN
              </Text>

              {/* Actual Quantity */}
              <Box>
                <InputField
                  label="Cantidad Obtenida (REAL) *"
                  type="number"
                  step="0.001"
                  value={config.actualQuantity?.toString() ?? ''}
                  onChange={e => handleActualQuantityChange(e.target.value)}
                  helperText="Cantidad real producida (medida después de producir)"
                  style={{
                    borderColor: fieldErrors.actualQuantity
                      ? 'red'
                      : undefined
                  }}
                />
                {config.actualQuantity && (
                  <Box mt="2" p="3" bg={`${yieldColor}.50`} borderRadius="md" borderWidth="2px" borderColor={`${yieldColor}.300`}>
                    <Stack gap="2">
                      <Flex justify="space-between" align="center">
                        <Typography fontSize="sm" fontWeight="700" color={`${yieldColor}.700`}>
                          {yieldStatus} Yield: {yieldPercentage.toFixed(1)}%
                        </Typography>
                        <Typography fontSize="xs" color="fg.muted">
                          {config.actualQuantity}/{batchSize} {config.unit}
                        </Typography>
                      </Flex>

                      {/* Real Unit Cost */}
                      {totalCost > 0 && (
                        <Box mt="2" p="3" bg={`${yieldColor}.100`} borderRadius="md">
                          <Typography fontSize="md" fontWeight="800" color={`${yieldColor}.800`}>
                            💰 COSTO UNITARIO REAL: ${realUnitCost.toFixed(2)}/{config.unit}
                          </Typography>
                          <Typography fontSize="xs" color="fg.muted" mt="1">
                            (Total ${totalCost.toFixed(2)} / {config.actualQuantity} {config.unit} real)
                          </Typography>

                          {/* Comparison */}
                          <Box mt="2" p="2" bg="bg.panel" borderRadius="sm">
                            <Stack gap="1">
                              <Flex justify="space-between">
                                <Typography fontSize="xs">Estimado:</Typography>
                                <Typography fontSize="xs" fontWeight="600">${estimatedUnitCost.toFixed(2)}</Typography>
                              </Flex>
                              <Flex justify="space-between">
                                <Typography fontSize="xs">Real:</Typography>
                                <Typography fontSize="xs" fontWeight="600">${realUnitCost.toFixed(2)}</Typography>
                              </Flex>
                              <Box h="1px" bg="border.default" />
                              <Flex justify="space-between">
                                <Typography fontSize="xs" fontWeight="700">Diferencia:</Typography>
                                <Typography
                                  fontSize="xs"
                                  fontWeight="700"
                                  color={costDifference > 0 ? 'red.600' : 'green.600'}
                                >
                                  {costDifference > 0 ? '+' : ''}{costDifference.toFixed(1)}%
                                </Typography>
                              </Flex>
                            </Stack>
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                )}
                {fieldErrors.actualQuantity && (
                  <Text fontSize="xs" mt="1" color="red.600">
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
                        ? 'red'
                        : undefined
                    }}
                  />
                  {fieldErrors.scrapReason && (
                    <Text fontSize="xs" mt="1" color="red.600">
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
        {recipe.inputs && recipe.inputs.length > 0 && (
          <Box
            p="4"
            bg="blue.50"
            borderRadius="md"
            borderWidth="1px"
            borderColor="blue.300"
          >
            <Stack gap="3">
              <Text fontSize="sm" fontWeight="medium" color="blue.700">
                ℹ️ {mode === 'immediate' ? 'Se consumirá al guardar' : 'Se consumirá al ejecutar'}
              </Text>
              <Stack gap="1">
                {recipe.inputs.map((input, index) => {
                  const itemName = typeof input.item === 'object' ? input.item.name : 'Desconocido'
                  return (
                    <Text key={input.id || index} fontSize="xs" color="fg.muted">
                      • {itemName}: <strong>{input.quantity * batchSize} {input.unit}</strong>
                    </Text>
                  )
                })}
              </Stack>
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  )
}

export default RecipeProductionSection
