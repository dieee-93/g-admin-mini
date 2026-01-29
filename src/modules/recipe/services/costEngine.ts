// ============================================================================
// RECIPE COST ENGINE - Cálculo de costos con precisión decimal
// ============================================================================
// Motor de cálculo de costos para recetas con soporte completo de:
// - Yield analysis (rendimiento y desperdicio)
// - Labor costs
// - Overhead (fixed y percentage)
// - Profitability metrics
// - Precisión decimal para finanzas

import { logger } from '@/lib/logging/Logger'
import { DecimalUtils, RecipeDecimal, FinancialDecimal } from '@/lib/decimal'
import { supabase } from '@/lib/supabase/client'
import type {
  RecipeCostResult,
  RecipeInputCost,
  RecipeProfitability,
  RecipeCostOptions,
  YieldAnalysis,
  CalculateCostInput
} from '../types/costing'
import type { Recipe, RecipeInput, RecipeCostConfig } from '../types/recipe'

const MODULE = 'RecipeCostEngine'

// ============================================================================
// RECIPE COST ENGINE
// ============================================================================

/**
 * Motor de cálculo de costos para recetas
 *
 * IMPORTANTE - Precisión:
 * - Usa RecipeDecimal (6 decimales) para cantidades
 * - Usa FinancialDecimal (4 decimales) para costos
 * - Redondeo solo al final de cálculos
 *
 * IMPORTANTE - Yield:
 * - wastePercentage: % de desperdicio en el input
 * - yieldPercentage: % de rendimiento efectivo
 * - Ajusta cantidades para obtener costo real
 */
export class RecipeCostEngine {

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Calcula el costo completo de una receta
   *
   * @param input - Datos de entrada para el cálculo
   * @param options - Opciones de configuración
   * @returns Resultado completo del cálculo de costos
   */
  static async calculateRecipeCost(
    input: CalculateCostInput,
    options?: RecipeCostOptions
  ): Promise<RecipeCostResult> {
    const startTime = Date.now()
    logger.info(`${MODULE}.calculateRecipeCost`, 'Iniciando cálculo de costos', {
      recipeId: input.recipeId,
      inputsCount: input.inputs.length
    })

    try {
      // 1. Calcular costo de cada input (con yield ajustado)
      const inputsBreakdown = await this.calculateInputsCosts(input.inputs)

      // 2. Sumar costos base de materiales
      const materialsCost = this.sumInputsCosts(inputsBreakdown)

      // 3. Calcular labor cost
      const laborCost = this.calculateLaborCost(input, options)

      // 4. Calcular overhead
      const overheadCost = this.calculateOverhead(materialsCost, input, options)

      // 5. Packaging cost
      const packagingCost = new FinancialDecimal(input.costConfig?.packagingCost ?? 0)

      // 6. Total cost
      const totalCost = materialsCost
        .plus(laborCost)
        .plus(overheadCost)
        .plus(packagingCost)

      // 7. Costo por unidad
      const outputQuantity = new RecipeDecimal(input.output.quantity)
      if (outputQuantity.isZero()) {
        throw new Error('Output quantity cannot be zero')
      }
      const costPerUnit = totalCost.dividedBy(outputQuantity)

      // 8. Yield analysis
      const yieldAnalysis = this.calculateYieldAnalysis(input)

      // 9. Calcular porcentajes de breakdown
      const inputsBreakdownWithPercentages = this.calculateInputsPercentages(
        inputsBreakdown,
        materialsCost
      )

      // 10. Profitability (opcional)
      const profitability = options?.includeProfitability
        ? this.calculateProfitability(totalCost, costPerUnit, input, options)
        : undefined

      // 11. Resultado
      const result: RecipeCostResult = {
        // Costos base
        materialsCost: DecimalUtils.toNumber(materialsCost),
        laborCost: DecimalUtils.toNumber(laborCost),
        overheadCost: DecimalUtils.toNumber(overheadCost),
        packagingCost: DecimalUtils.toNumber(packagingCost),
        totalCost: DecimalUtils.toNumber(totalCost),

        // Por unidad
        costPerUnit: DecimalUtils.toNumber(costPerUnit),

        // Breakdown
        inputsBreakdown: inputsBreakdownWithPercentages,

        // Yield analysis
        yieldAnalysis,

        // Profitability (si aplica)
        profitability,

        // Metadata
        calculatedAt: new Date(),
        costingMethod: input.costConfig?.costingMethod
      }

      const duration = Date.now() - startTime
      logger.info(`${MODULE}.calculateRecipeCost`, 'Cálculo completado', {
        duration,
        totalCost: result.totalCost,
        costPerUnit: result.costPerUnit
      })

      return result

    } catch (error) {
      logger.error(`${MODULE}.calculateRecipeCost`, 'Error calculando costos', error)
      throw error
    }
  }

  // ============================================================================
  // CÁLCULO DE INPUTS
  // ============================================================================

  /**
   * Calcula costos de inputs con yield ajustado
   *
   * IMPORTANTE - Yield adjustment:
   * - Si waste = 20%, solo 80% es útil
   * - Para obtener 100g útiles, necesito 125g totales
   * - Cantidad efectiva = quantity / (1 - waste/100)
   */
  private static async calculateInputsCosts(
    inputs: RecipeInput[]
  ): Promise<RecipeInputCost[]> {
    return Promise.all(
      inputs.map(async (input) => {
        try {
          // 1. Obtener costo unitario (override o actual)
          const unitCostRaw = input.unitCostOverride ?? await this.getItemUnitCost(input.item)
          const unitCost = new FinancialDecimal(unitCostRaw)

          // 2. Cantidad base
          const baseQuantity = new RecipeDecimal(input.quantity)

          // 3. Ajustar por yield/waste
          const yieldFactor = this.calculateYieldFactor(
            input.yieldPercentage,
            input.wastePercentage
          )
          const effectiveQuantity = baseQuantity.dividedBy(yieldFactor)

          // 4. Costo total ajustado
          const totalCost = effectiveQuantity.times(unitCost)

          // 5. Conversión si aplica
          const conversionFactor = new RecipeDecimal(input.conversionFactor ?? 1)
          const finalCost = totalCost.times(conversionFactor)

          return {
            inputId: input.id,
            itemId: typeof input.item === 'string' ? input.item : input.item.id,
            itemName: typeof input.item === 'string' ? 'Unknown' : input.item.name,
            quantity: DecimalUtils.toNumber(baseQuantity),
            unit: input.unit,
            unitCost: DecimalUtils.toNumber(unitCost),
            totalCost: DecimalUtils.toNumber(finalCost),
            yieldAdjustedCost: DecimalUtils.toNumber(finalCost),
            percentageOfTotal: 0 // Se calcula después
          }
        } catch (error) {
          logger.error(`${MODULE}.calculateInputsCosts`, `Error calculando input ${input.id}`, error)
          throw new Error(`Failed to calculate cost for input ${input.id}: ${error}`)
        }
      })
    )
  }

  /**
   * Calcula factor de yield efectivo
   *
   * yieldPercentage: % de rendimiento (opcional)
   * wastePercentage: % de desperdicio (opcional)
   *
   * Si ambos están presentes, usar yieldPercentage
   * Si solo waste, calcular yield = 100 - waste
   * Si ninguno, yield = 100%
   */
  private static calculateYieldFactor(
    yieldPercentage?: number,
    wastePercentage?: number
  ): RecipeDecimal {
    let effectiveYield: RecipeDecimal

    if (yieldPercentage !== undefined) {
      // Usar yield explícito
      effectiveYield = new RecipeDecimal(yieldPercentage)
    } else if (wastePercentage !== undefined) {
      // Calcular yield desde waste
      effectiveYield = new RecipeDecimal(100).minus(new RecipeDecimal(wastePercentage))
    } else {
      // Sin pérdidas
      effectiveYield = new RecipeDecimal(100)
    }

    // Validar rango [0, 100]
    if (effectiveYield.lessThan(0) || effectiveYield.greaterThan(100)) {
      throw new Error(`Invalid yield percentage: ${effectiveYield}. Must be between 0 and 100.`)
    }

    // Convertir a factor (100% = 1.0, 80% = 0.8)
    return effectiveYield.dividedBy(100)
  }

  /**
   * Obtiene el costo unitario de un item desde la DB
   */
  private static async getItemUnitCost(item: string | { id: string; unitCost?: number }): Promise<number> {
    try {
      // Si el item es un objeto con unitCost, usarlo
      if (typeof item === 'object' && item.unitCost !== undefined) {
        return item.unitCost
      }

      const itemId = typeof item === 'string' ? item : item.id
      
      // Guard: Skip if ID is empty/undefined (new ingredient lines without material selected)
      if (!itemId || itemId.trim() === '') {
        return 0
      }

      // Query a Supabase para obtener unit_cost
      // NOTA: Esto asume que hay una tabla 'materials' o 'products' con unit_cost
      // Ajustar según tu schema real
      const { data, error } = await supabase
        .from('materials')
        .select('unit_cost')
        .eq('id', itemId)
        .maybeSingle()

      if (error) {
        logger.warn(`${MODULE}.getItemUnitCost`, `Error fetching unit cost for ${itemId}`, error)
        return 0
      }

      if (!data) {
        logger.warn(`${MODULE}.getItemUnitCost`, `Item not found: ${itemId}`)
        return 0
      }

      return data.unit_cost ?? 0

    } catch (error) {
      logger.error(`${MODULE}.getItemUnitCost`, `Error getting unit cost`, error)
      return 0
    }
  }

  // ============================================================================
  // LABOR COST
  // ============================================================================

  /**
   * Calcula costo de mano de obra
   */
  private static calculateLaborCost(
    input: CalculateCostInput,
    options?: RecipeCostOptions
  ): FinancialDecimal {
    const config = input.costConfig

    // Si no se incluye labor, retornar 0
    if (!config?.includeLabor) {
      return new FinancialDecimal(0)
    }

    // Horas de trabajo
    const laborHours = new RecipeDecimal(config.laborHours ?? 0)
    if (laborHours.isZero()) {
      return new FinancialDecimal(0)
    }

    // Costo por hora
    const laborCostPerHour = new FinancialDecimal(config.laborCostPerHour ?? 0)
    if (laborCostPerHour.isZero()) {
      return new FinancialDecimal(0)
    }

    // Total
    return laborHours.times(laborCostPerHour)
  }

  // ============================================================================
  // OVERHEAD
  // ============================================================================

  /**
   * Calcula overhead (costos indirectos)
   *
   * Soporta:
   * - overheadPercentage: % sobre el costo de materiales
   * - overheadFixed: Monto fijo
   * - Suma de ambos si están presentes
   */
  private static calculateOverhead(
    materialsCost: FinancialDecimal,
    input: CalculateCostInput,
    options?: RecipeCostOptions
  ): FinancialDecimal {
    const config = input.costConfig
    let overhead = new FinancialDecimal(0)

    // Overhead percentage
    if (config?.overheadPercentage) {
      const percentage = new RecipeDecimal(config.overheadPercentage)
      const percentageOverhead = materialsCost.times(percentage.dividedBy(100))
      overhead = overhead.plus(percentageOverhead)
    }

    // Overhead fixed
    if (config?.overheadFixed) {
      const fixed = new FinancialDecimal(config.overheadFixed)
      overhead = overhead.plus(fixed)
    }

    return overhead
  }

  // ============================================================================
  // YIELD ANALYSIS
  // ============================================================================

  /**
   * Calcula análisis de rendimiento
   */
  private static calculateYieldAnalysis(input: CalculateCostInput): YieldAnalysis {
    const outputQuantity = new RecipeDecimal(input.output.quantity)
    const outputYield = new RecipeDecimal(input.output.yieldPercentage ?? 100)
    const outputWaste = new RecipeDecimal(input.output.wastePercentage ?? 0)

    // Theoretical yield (sin pérdidas)
    const theoreticalYield = outputQuantity

    // Actual yield (con pérdidas)
    const yieldFactor = this.calculateYieldFactor(
      input.output.yieldPercentage,
      input.output.wastePercentage
    )
    const actualYield = theoreticalYield.times(yieldFactor)

    // Yield percentage
    const yieldPercentage = DecimalUtils.toNumber(outputYield)

    // Waste factor
    const wasteFactor = DecimalUtils.toNumber(outputWaste)

    // Efficiency score (0-100)
    const efficiencyScore = DecimalUtils.toNumber(
      outputYield.times(1).minus(outputWaste.times(0.5))
    )

    return {
      theoreticalYield: DecimalUtils.toNumber(theoreticalYield),
      actualYield: DecimalUtils.toNumber(actualYield),
      yieldPercentage,
      wasteFactor,
      efficiencyScore: Math.max(0, Math.min(100, efficiencyScore))
    }
  }

  // ============================================================================
  // PROFITABILITY
  // ============================================================================

  /**
   * Calcula métricas de rentabilidad
   */
  private static calculateProfitability(
    totalCost: FinancialDecimal,
    costPerUnit: FinancialDecimal,
    input: CalculateCostInput,
    options?: RecipeCostOptions
  ): RecipeProfitability {
    // Precio de venta (si está disponible)
    const sellingPrice = options?.sellingPrice
      ? new FinancialDecimal(options.sellingPrice)
      : undefined

    // Target food cost percentage (típicamente 30-35% para restaurantes)
    const targetFoodCostPercentage = options?.targetFoodCostPercentage ?? 30

    // Break-even price (para alcanzar target food cost %)
    const targetFoodCostFactor = new RecipeDecimal(targetFoodCostPercentage).dividedBy(100)
    const breakEvenPrice = costPerUnit.dividedBy(targetFoodCostFactor)

    // Si hay selling price, calcular profit y margins
    if (sellingPrice) {
      const profit = sellingPrice.minus(costPerUnit)
      const profitMargin = DecimalUtils.toNumber(profit)
      const profitPercentage = DecimalUtils.toNumber(
        profit.dividedBy(sellingPrice).times(100)
      )

      // Actual food cost percentage
      const actualFoodCostPercentage = DecimalUtils.toNumber(
        costPerUnit.dividedBy(sellingPrice).times(100)
      )

      return {
        sellingPrice: DecimalUtils.toNumber(sellingPrice),
        profitMargin,
        profitPercentage,
        breakEvenPrice: DecimalUtils.toNumber(breakEvenPrice),
        targetFoodCostPercentage,
        actualFoodCostPercentage
      }
    }

    // Sin selling price, solo break-even
    return {
      breakEvenPrice: DecimalUtils.toNumber(breakEvenPrice),
      targetFoodCostPercentage
    }
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  /**
   * Suma costos de inputs
   */
  private static sumInputsCosts(inputs: RecipeInputCost[]): FinancialDecimal {
    return inputs.reduce(
      (sum, input) => sum.plus(new FinancialDecimal(input.totalCost)),
      new FinancialDecimal(0)
    )
  }

  /**
   * Calcula porcentajes de cada input sobre el total
   */
  private static calculateInputsPercentages(
    inputs: RecipeInputCost[],
    totalMaterialsCost: FinancialDecimal
  ): RecipeInputCost[] {
    if (totalMaterialsCost.isZero()) {
      return inputs
    }

    return inputs.map(input => ({
      ...input,
      percentageOfTotal: DecimalUtils.toNumber(
        new FinancialDecimal(input.totalCost)
          .dividedBy(totalMaterialsCost)
          .times(100)
      )
    }))
  }

  // ============================================================================
  // MÉTODOS DE UTILIDAD PÚBLICA
  // ============================================================================

  /**
   * Estima costo rápido (sin fetch a DB)
   * Útil para previews en UI
   */
  static estimateQuickCost(inputs: RecipeInput[]): number {
    try {
      const total = inputs.reduce((sum, input) => {
        const quantity = new RecipeDecimal(input.quantity)
        const unitCost = new FinancialDecimal(input.unitCostOverride ?? 0)
        const yieldFactor = this.calculateYieldFactor(
          input.yieldPercentage,
          input.wastePercentage
        )
        const effectiveQuantity = quantity.dividedBy(yieldFactor)
        const cost = effectiveQuantity.times(unitCost)
        return sum.plus(cost)
      }, new FinancialDecimal(0))

      return DecimalUtils.toNumber(total)
    } catch (error) {
      logger.error(`${MODULE}.estimateQuickCost`, 'Error estimando costo', error)
      return 0
    }
  }

  /**
   * Escala receta y recalcula costos
   */
  static scaleRecipeCost(
    originalCost: RecipeCostResult,
    scaleFactor: number
  ): RecipeCostResult {
    const factor = new RecipeDecimal(scaleFactor)

    return {
      ...originalCost,
      materialsCost: DecimalUtils.toNumber(
        new FinancialDecimal(originalCost.materialsCost).times(factor)
      ),
      laborCost: DecimalUtils.toNumber(
        new FinancialDecimal(originalCost.laborCost).times(factor)
      ),
      overheadCost: DecimalUtils.toNumber(
        new FinancialDecimal(originalCost.overheadCost).times(factor)
      ),
      packagingCost: DecimalUtils.toNumber(
        new FinancialDecimal(originalCost.packagingCost).times(factor)
      ),
      totalCost: DecimalUtils.toNumber(
        new FinancialDecimal(originalCost.totalCost).times(factor)
      ),
      // costPerUnit se mantiene igual (escalar no cambia el costo unitario)
      calculatedAt: new Date()
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default RecipeCostEngine
