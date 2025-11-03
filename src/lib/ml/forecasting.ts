/**
 * DEMAND FORECASTING - Pure Algorithms
 * ============================================================================
 * Algoritmos para predicción de demanda y optimización de inventario
 * Incluye EOQ, reorder points, y forecasting avanzado
 *
 * @module lib/ml/forecasting
 */

import {
  exponentialSmoothing,
  seasonalDecomposition,
  detectTrend,
  linearRegression,
  predictNextValue,
  type TrendDirection
} from './timeseries';

// ============================================================================
// TYPES
// ============================================================================

export interface ForecastResult {
  predictions: number[];
  trend: TrendDirection;
  confidence: number;
  seasonalFactors?: number[];
  metadata: {
    method: ForecastMethod;
    dataPoints: number;
    horizon: number;
  };
}

export type ForecastMethod = 'sma' | 'ema' | 'seasonal' | 'linear' | 'auto';

export interface ForecastConfig {
  method?: ForecastMethod;
  horizon?: number;        // Número de periodos a predecir
  seasonLength?: number;   // Longitud del ciclo estacional (7 para semanas, 30 para meses)
  alpha?: number;          // Factor de suavizado para EMA (0-1)
  confidenceLevel?: number; // Nivel de confianza (0-1)
}

// ============================================================================
// DEMAND FORECASTING
// ============================================================================

/**
 * Forecast Demand
 * Predice la demanda futura basándose en datos históricos
 *
 * @param historicalData - Array de valores históricos
 * @param config - Configuración del forecast
 * @returns Resultado con predicciones y metadata
 *
 * @example
 * ```typescript
 * const sales = [100, 105, 110, 108, 115, 120, 118, 125];
 * const forecast = forecastDemand(sales, {
 *   method: 'auto',
 *   horizon: 7,
 *   seasonLength: 7
 * });
 * console.log(forecast.predictions); // [127, 130, ...]
 * console.log(forecast.trend);       // 'increasing'
 * ```
 */
export function forecastDemand(
  historicalData: number[],
  config: ForecastConfig = {}
): ForecastResult {
  const {
    method = 'auto',
    horizon = 7,
    seasonLength = 7,
    alpha = 0.3,
    confidenceLevel = 0.7
  } = config;

  if (historicalData.length === 0) {
    return {
      predictions: [],
      trend: 'stable',
      confidence: 0,
      metadata: {
        method: 'auto',
        dataPoints: 0,
        horizon
      }
    };
  }

  // Detect trend
  const trend = detectTrend(historicalData);

  // Auto-select best method
  let selectedMethod: ForecastMethod = method;
  if (method === 'auto') {
    selectedMethod = selectBestForecastMethod(
      historicalData,
      seasonLength,
      trend
    );
  }

  // Generate predictions based on selected method
  let predictions: number[] = [];
  let seasonalFactors: number[] | undefined;

  switch (selectedMethod) {
    case 'seasonal':
      const decomp = seasonalDecomposition(historicalData, seasonLength);
      predictions = decomp.forecast;
      seasonalFactors = decomp.seasonal;

      // Extend forecast if horizon > seasonLength
      if (horizon > seasonLength) {
        const extraPeriods = horizon - seasonLength;
        for (let i = 0; i < extraPeriods; i++) {
          const seasonIndex = i % seasonLength;
          const lastTrend = decomp.trend[decomp.trend.length - 1] || historicalData[historicalData.length - 1];
          predictions.push(Math.max(0, lastTrend + decomp.seasonal[seasonIndex]));
        }
      }
      break;

    case 'ema':
      const smoothed = exponentialSmoothing(historicalData, alpha);
      const lastSmoothed = smoothed[smoothed.length - 1];
      predictions = new Array(horizon).fill(lastSmoothed);
      break;

    case 'linear':
      const regression = linearRegression(historicalData);
      for (let i = 0; i < horizon; i++) {
        const nextIndex = historicalData.length + i;
        const prediction = regression.slope * nextIndex + regression.intercept;
        predictions.push(Math.max(0, prediction));
      }
      break;

    default: // 'sma'
      const lastValue = historicalData[historicalData.length - 1];
      predictions = new Array(horizon).fill(lastValue);
  }

  // Calculate confidence based on data quality
  const confidence = calculateForecastConfidence(
    historicalData,
    predictions,
    selectedMethod
  );

  return {
    predictions: predictions.slice(0, horizon),
    trend,
    confidence: Math.min(1, Math.max(0, confidence)),
    seasonalFactors,
    metadata: {
      method: selectedMethod,
      dataPoints: historicalData.length,
      horizon
    }
  };
}

/**
 * Select Best Forecast Method
 * Selecciona automáticamente el mejor método basado en características de los datos
 */
function selectBestForecastMethod(
  data: number[],
  seasonLength: number,
  trend: TrendDirection
): ForecastMethod {
  // Not enough data for complex methods
  if (data.length < seasonLength * 2) {
    return trend !== 'stable' ? 'linear' : 'ema';
  }

  // Check for seasonality
  const hasSeasonality = detectSeasonality(data, seasonLength);

  // Check for strong trend
  const regression = linearRegression(data);
  const hasStrongTrend = Math.abs(regression.slope) > 0.1 && regression.r2 > 0.7;

  // Decision logic
  if (hasSeasonality && hasStrongTrend) {
    return 'seasonal';
  } else if (hasStrongTrend) {
    return 'linear';
  } else if (hasSeasonality) {
    return 'seasonal';
  } else {
    return 'ema';
  }
}

/**
 * Detect Seasonality
 * Detecta si existe un patrón estacional en los datos
 */
function detectSeasonality(data: number[], seasonLength: number): boolean {
  if (data.length < seasonLength * 2) return false;

  // Compare cycles
  const cycles = Math.floor(data.length / seasonLength);
  if (cycles < 2) return false;

  let totalCorrelation = 0;
  for (let cycle = 1; cycle < cycles; cycle++) {
    const current = data.slice(cycle * seasonLength, (cycle + 1) * seasonLength);
    const previous = data.slice((cycle - 1) * seasonLength, cycle * seasonLength);

    const correlation = calculateCorrelation(current, previous);
    totalCorrelation += correlation;
  }

  const avgCorrelation = totalCorrelation / (cycles - 1);
  return avgCorrelation > 0.5; // 50% threshold
}

/**
 * Calculate Correlation
 * Calcula la correlación entre dos arrays
 */
function calculateCorrelation(arr1: number[], arr2: number[]): number {
  const n = Math.min(arr1.length, arr2.length);
  if (n === 0) return 0;

  const mean1 = arr1.reduce((a, b) => a + b, 0) / n;
  const mean2 = arr2.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denom1 = 0;
  let denom2 = 0;

  for (let i = 0; i < n; i++) {
    const diff1 = arr1[i] - mean1;
    const diff2 = arr2[i] - mean2;
    numerator += diff1 * diff2;
    denom1 += diff1 * diff1;
    denom2 += diff2 * diff2;
  }

  if (denom1 === 0 || denom2 === 0) return 0;
  return numerator / Math.sqrt(denom1 * denom2);
}

/**
 * Calculate Forecast Confidence
 * Calcula el nivel de confianza del forecast basado en calidad de datos
 */
function calculateForecastConfidence(
  historicalData: number[],
  predictions: number[],
  method: ForecastMethod
): number {
  let confidence = 0.5; // Base confidence

  // More data = more confidence
  if (historicalData.length >= 30) {
    confidence += 0.2;
  } else if (historicalData.length >= 14) {
    confidence += 0.1;
  }

  // Better methods = more confidence
  if (method === 'seasonal' || method === 'linear') {
    confidence += 0.15;
  } else if (method === 'ema') {
    confidence += 0.1;
  }

  // Check for data consistency (low variance)
  const mean = historicalData.reduce((a, b) => a + b, 0) / historicalData.length;
  const variance = historicalData.reduce((sum, val) =>
    sum + Math.pow(val - mean, 2), 0
  ) / historicalData.length;
  const cv = Math.sqrt(variance) / mean; // Coefficient of variation

  if (cv < 0.2) { // Low variability
    confidence += 0.15;
  } else if (cv < 0.5) {
    confidence += 0.05;
  }

  return confidence;
}

// ============================================================================
// INVENTORY OPTIMIZATION
// ============================================================================

/**
 * Calculate Economic Order Quantity (EOQ)
 * Calcula la cantidad óptima de pedido para minimizar costos
 *
 * @param annualDemand - Demanda anual esperada
 * @param orderCost - Costo fijo por orden
 * @param holdingCost - Costo de almacenamiento anual por unidad
 * @returns Cantidad óptima de orden
 *
 * @example
 * ```typescript
 * const eoq = calculateEOQ(10000, 50, 2);
 * console.log(eoq); // ~707 unidades
 * ```
 */
export function calculateEOQ(
  annualDemand: number,
  orderCost: number,
  holdingCost: number
): number {
  if (annualDemand <= 0 || orderCost <= 0 || holdingCost <= 0) {
    return 0;
  }

  return Math.sqrt((2 * annualDemand * orderCost) / holdingCost);
}

/**
 * Optimize Reorder Point
 * Calcula el punto óptimo de reorden considerando lead time y nivel de servicio
 *
 * @param leadTimeDays - Tiempo de entrega en días
 * @param dailyDemand - Demanda diaria promedio
 * @param serviceLevel - Nivel de servicio deseado (0-1, default: 0.95)
 * @param demandStdDev - Desviación estándar de la demanda (opcional)
 * @returns Punto de reorden óptimo
 *
 * @example
 * ```typescript
 * const reorderPoint = optimizeReorderPoint(7, 50, 0.95, 10);
 * console.log(reorderPoint); // ~366 unidades
 * ```
 */
export function optimizeReorderPoint(
  leadTimeDays: number,
  dailyDemand: number,
  serviceLevel: number = 0.95,
  demandStdDev?: number
): number {
  if (leadTimeDays <= 0 || dailyDemand <= 0) {
    return 0;
  }

  // Base demand during lead time
  const leadTimeDemand = dailyDemand * leadTimeDays;

  // Safety stock (if std dev provided)
  let safetyStock = 0;
  if (demandStdDev && demandStdDev > 0) {
    // Z-score for service level (simplified)
    const zScore = getZScoreForServiceLevel(serviceLevel);
    safetyStock = zScore * demandStdDev * Math.sqrt(leadTimeDays);
  } else {
    // Simple safety stock (20% of lead time demand)
    safetyStock = leadTimeDemand * 0.2;
  }

  return Math.ceil(leadTimeDemand + safetyStock);
}

/**
 * Get Z-Score for Service Level
 * Retorna el Z-score correspondiente a un nivel de servicio
 */
function getZScoreForServiceLevel(serviceLevel: number): number {
  // Simplified mapping of service level to Z-score
  const mapping: { [key: number]: number } = {
    0.50: 0.00,
    0.80: 0.84,
    0.85: 1.04,
    0.90: 1.28,
    0.95: 1.65,
    0.98: 2.05,
    0.99: 2.33
  };

  // Find closest service level
  const levels = Object.keys(mapping).map(Number).sort((a, b) => a - b);
  let closest = levels[0];
  let minDiff = Math.abs(serviceLevel - closest);

  for (const level of levels) {
    const diff = Math.abs(serviceLevel - level);
    if (diff < minDiff) {
      minDiff = diff;
      closest = level;
    }
  }

  return mapping[closest];
}

/**
 * Calculate Days Until Stockout
 * Estima cuántos días faltan hasta quedarse sin stock
 *
 * @param currentStock - Stock actual
 * @param averageDailyDemand - Demanda diaria promedio
 * @param forecast - Forecast opcional de demanda futura
 * @returns Número de días hasta stockout
 *
 * @example
 * ```typescript
 * const days = calculateDaysUntilStockout(100, 15);
 * console.log(days); // ~6.67 días
 * ```
 */
export function calculateDaysUntilStockout(
  currentStock: number,
  averageDailyDemand: number,
  forecast?: number[]
): number {
  if (currentStock <= 0) return 0;
  if (averageDailyDemand <= 0) return Infinity;

  // If forecast provided, use it
  if (forecast && forecast.length > 0) {
    let remainingStock = currentStock;
    let days = 0;

    for (const demand of forecast) {
      if (remainingStock <= 0) break;
      remainingStock -= demand;
      days++;
    }

    return days;
  }

  // Simple calculation
  return currentStock / averageDailyDemand;
}

/**
 * Predict Stockout Risk
 * Predice el riesgo de quedarse sin stock en un periodo determinado
 *
 * @param currentStock - Stock actual
 * @param forecast - Forecast de demanda
 * @param leadTime - Tiempo de reposición en días
 * @returns Riesgo de stockout (0-1)
 *
 * @example
 * ```typescript
 * const risk = predictStockoutRisk(50, [10, 12, 15, 18], 7);
 * console.log(risk); // 0.8 (80% riesgo)
 * ```
 */
export function predictStockoutRisk(
  currentStock: number,
  forecast: number[],
  leadTime: number
): number {
  if (currentStock <= 0) return 1.0; // 100% risk
  if (forecast.length === 0) return 0.5; // Unknown

  // Sum forecasted demand during lead time
  const leadTimeForecast = forecast.slice(0, leadTime);
  const totalDemand = leadTimeForecast.reduce((sum, val) => sum + val, 0);

  // Calculate shortfall
  const shortfall = totalDemand - currentStock;

  if (shortfall <= 0) return 0.0; // No risk
  if (shortfall >= currentStock) return 1.0; // High risk

  // Proportional risk
  return shortfall / totalDemand;
}
