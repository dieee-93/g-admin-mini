/**
 * TIME SERIES ANALYSIS - Pure Algorithms
 * ============================================================================
 * Algoritmos puros para análisis de series temporales
 * Extraídos de MLEngine.ts y convertidos a funciones puras reutilizables
 *
 * @module lib/ml/timeseries
 */

// ============================================================================
// TYPES
// ============================================================================

export interface TimeSeriesData {
  timestamp: number;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface SeasonalDecomposition {
  trend: number[];
  seasonal: number[];
  residual: number[];
  forecast: number[];
}

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  r2: number;
}

export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

// ============================================================================
// MOVING AVERAGES
// ============================================================================

/**
 * Simple Moving Average (SMA)
 * Calcula el promedio móvil simple de una serie temporal
 *
 * @param data - Array de valores numéricos
 * @param window - Tamaño de la ventana (default: 7)
 * @returns Array de promedios móviles
 *
 * @example
 * ```typescript
 * const data = [10, 12, 15, 14, 18, 20, 22];
 * const sma = simpleMovingAverage(data, 3);
 * // Returns: [12.33, 13.67, 15.67, 17.33, 20]
 * ```
 */
export function simpleMovingAverage(data: number[], window: number = 7): number[] {
  if (data.length < window) {
    return [];
  }

  const result: number[] = [];

  for (let i = window - 1; i < data.length; i++) {
    const sum = data.slice(i - window + 1, i + 1).reduce((acc, val) => acc + val, 0);
    result.push(sum / window);
  }

  return result;
}

/**
 * Exponential Smoothing (EMA)
 * Suavizado exponencial que da más peso a valores recientes
 *
 * @param data - Array de valores numéricos
 * @param alpha - Factor de suavizado (0-1, default: 0.3)
 * @returns Array de valores suavizados
 *
 * @example
 * ```typescript
 * const data = [10, 15, 13, 17, 20];
 * const ema = exponentialSmoothing(data, 0.3);
 * ```
 */
export function exponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
  if (data.length === 0) {
    return [];
  }

  // Validar alpha
  const validAlpha = Math.max(0, Math.min(1, alpha));

  const result: number[] = [data[0]];

  for (let i = 1; i < data.length; i++) {
    const smoothed = validAlpha * data[i] + (1 - validAlpha) * result[i - 1];
    result.push(smoothed);
  }

  return result;
}

// ============================================================================
// SEASONAL DECOMPOSITION
// ============================================================================

/**
 * Seasonal Decomposition
 * Descompone una serie temporal en tendencia, estacionalidad y residuo
 *
 * @param data - Array de valores numéricos
 * @param seasonLength - Longitud del periodo estacional (default: 7 para semanas)
 * @returns Objeto con componentes trend, seasonal, residual y forecast
 *
 * @example
 * ```typescript
 * const salesData = [100, 120, 110, 130, 125, 140, 135]; // 1 semana
 * const decomposition = seasonalDecomposition(salesData, 7);
 * console.log(decomposition.trend);    // Tendencia general
 * console.log(decomposition.seasonal); // Componente estacional
 * console.log(decomposition.forecast); // Predicción próximo periodo
 * ```
 */
export function seasonalDecomposition(
  data: number[],
  seasonLength: number = 7
): SeasonalDecomposition {
  if (data.length < seasonLength * 2) {
    // Not enough data for decomposition
    return {
      trend: data,
      seasonal: new Array(seasonLength).fill(0),
      residual: new Array(data.length).fill(0),
      forecast: data.slice(-seasonLength)
    };
  }

  // Calculate trend using moving average
  const trend = simpleMovingAverage(data, seasonLength);

  // Initialize seasonal component
  const seasonal: number[] = new Array(seasonLength).fill(0);
  const seasonalCounts: number[] = new Array(seasonLength).fill(0);

  // Calculate seasonal components
  for (let i = 0; i < data.length; i++) {
    const seasonIndex = i % seasonLength;
    const trendIndex = Math.max(0, i - Math.floor(seasonLength / 2));
    const trendValue = trend[trendIndex] || data[i];

    seasonal[seasonIndex] += (data[i] - trendValue);
    seasonalCounts[seasonIndex]++;
  }

  // Average seasonal components
  for (let i = 0; i < seasonal.length; i++) {
    if (seasonalCounts[i] > 0) {
      seasonal[i] /= seasonalCounts[i];
    }
  }

  // Calculate residuals
  const residual: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const seasonIndex = i % seasonLength;
    const trendIndex = Math.max(0, i - Math.floor(seasonLength / 2));
    const trendValue = trend[trendIndex] || data[i];
    residual.push(data[i] - trendValue - seasonal[seasonIndex]);
  }

  // Generate forecast for next season
  const lastTrendValue = trend[trend.length - 1] || data[data.length - 1];
  const forecast: number[] = [];

  for (let i = 0; i < seasonLength; i++) {
    const seasonIndex = i % seasonLength;
    // Ensure non-negative forecast
    forecast.push(Math.max(0, lastTrendValue + seasonal[seasonIndex]));
  }

  return { trend, seasonal, residual, forecast };
}

// ============================================================================
// REGRESSION & TREND ANALYSIS
// ============================================================================

/**
 * Linear Regression
 * Calcula la regresión lineal de una serie temporal
 *
 * @param data - Array de valores numéricos
 * @returns Objeto con slope (pendiente), intercept (intercepto) y r2 (coeficiente de determinación)
 *
 * @example
 * ```typescript
 * const sales = [100, 105, 110, 115, 120];
 * const regression = linearRegression(sales);
 * console.log(regression.slope);     // ~5 (crecimiento por periodo)
 * console.log(regression.r2);        // ~1 (ajuste perfecto)
 * ```
 */
export function linearRegression(data: number[]): LinearRegressionResult {
  const n = data.length;

  if (n < 2) {
    return {
      slope: 0,
      intercept: data[0] || 0,
      r2: 0
    };
  }

  // Create x values (0, 1, 2, ...)
  const x = data.map((_, i) => i);
  const y = data;

  // Calculate sums
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);
  const sumYY = y.reduce((sum, val) => sum + val * val, 0);

  // Calculate slope and intercept
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R² (coefficient of determination)
  const yMean = sumY / n;
  const ssRes = y.reduce((sum, val, i) => {
    const predicted = slope * i + intercept;
    return sum + Math.pow(val - predicted, 2);
  }, 0);
  const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
  const r2 = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

  return { slope, intercept, r2 };
}

/**
 * Detect Trend
 * Detecta la dirección de la tendencia en una serie temporal
 *
 * @param data - Array de valores numéricos
 * @param threshold - Umbral de cambio relativo (default: 0.05 = 5%)
 * @returns 'increasing' | 'decreasing' | 'stable'
 *
 * @example
 * ```typescript
 * const sales = [100, 105, 110, 115, 120];
 * const trend = detectTrend(sales); // 'increasing'
 *
 * const flatSales = [100, 101, 99, 100, 101];
 * const flatTrend = detectTrend(flatSales); // 'stable'
 * ```
 */
export function detectTrend(
  data: number[],
  threshold: number = 0.05
): TrendDirection {
  if (data.length < 2) {
    return 'stable';
  }

  // Split data into first and second half
  const midpoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midpoint);
  const secondHalf = data.slice(midpoint);

  // Calculate averages
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  // Calculate relative change
  const diff = avgSecond - avgFirst;
  const relativeChange = Math.abs(diff) / avgFirst;

  // Determine trend
  if (relativeChange > threshold) {
    return diff > 0 ? 'increasing' : 'decreasing';
  }

  return 'stable';
}

/**
 * Predict Next Value
 * Predice el siguiente valor usando regresión lineal
 *
 * @param data - Array de valores históricos
 * @returns Valor predicho
 *
 * @example
 * ```typescript
 * const sales = [100, 105, 110, 115, 120];
 * const nextSale = predictNextValue(sales); // ~125
 * ```
 */
export function predictNextValue(data: number[]): number {
  if (data.length === 0) return 0;
  if (data.length === 1) return data[0];

  const regression = linearRegression(data);
  const nextIndex = data.length;
  const prediction = regression.slope * nextIndex + regression.intercept;

  // Ensure non-negative prediction
  return Math.max(0, prediction);
}

// ============================================================================
// STATISTICAL HELPERS
// ============================================================================

/**
 * Calculate Mean
 * Calcula el promedio de un array de números
 */
export function calculateMean(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((sum, val) => sum + val, 0) / data.length;
}

/**
 * Calculate Standard Deviation
 * Calcula la desviación estándar de un array de números
 */
export function calculateStandardDeviation(data: number[]): number {
  if (data.length === 0) return 0;

  const mean = calculateMean(data);
  const variance = data.reduce((sum, val) =>
    sum + Math.pow(val - mean, 2), 0
  ) / data.length;

  return Math.sqrt(variance);
}

/**
 * Calculate Variance
 * Calcula la varianza de un array de números
 */
export function calculateVariance(data: number[]): number {
  if (data.length === 0) return 0;

  const mean = calculateMean(data);
  return data.reduce((sum, val) =>
    sum + Math.pow(val - mean, 2), 0
  ) / data.length;
}
