/**
 * ANOMALY DETECTION - Pure Algorithms
 * ============================================================================
 * Algoritmos para detección de anomalías y outliers
 * Útil para quality assurance, monitoring, y alertas inteligentes
 *
 * @module lib/ml/anomalyDetection
 */

import { calculateMean, calculateStandardDeviation } from './timeseries';

// ============================================================================
// TYPES
// ============================================================================

export interface AnomalyResult {
  isAnomaly: boolean;
  score: number;        // Z-score o deviation score
  threshold: number;
  value: number;
  expectedRange: {
    min: number;
    max: number;
  };
}

export interface OutlierDetectionConfig {
  method?: 'zscore' | 'iqr' | 'mad';
  threshold?: number;
}

// ============================================================================
// Z-SCORE METHOD
// ============================================================================

/**
 * Calculate Z-Score
 * Calcula cuántas desviaciones estándar se aleja un valor de la media
 *
 * @param value - Valor a evaluar
 * @param data - Array de valores de referencia
 * @returns Z-score (número de desviaciones estándar)
 *
 * @example
 * ```typescript
 * const data = [10, 12, 11, 13, 12, 14, 11];
 * const zScore = calculateZScore(25, data);
 * console.log(zScore); // ~4.5 (muy alto = outlier)
 * ```
 */
export function calculateZScore(value: number, data: number[]): number {
  if (data.length === 0) return 0;

  const mean = calculateMean(data);
  const stdDev = calculateStandardDeviation(data);

  if (stdDev === 0) return 0;

  return (value - mean) / stdDev;
}

/**
 * Detect Outliers (Z-Score Method)
 * Detecta outliers usando el método de Z-score
 *
 * @param data - Array de valores a evaluar
 * @param threshold - Umbral de Z-score (default: 2.5)
 * @returns Array de booleanos indicando si cada valor es outlier
 *
 * @example
 * ```typescript
 * const sales = [100, 105, 110, 108, 500, 112, 115]; // 500 es outlier
 * const outliers = detectOutliers(sales, 2.5);
 * console.log(outliers); // [false, false, false, false, true, false, false]
 * ```
 */
export function detectOutliers(
  data: number[],
  threshold: number = 2.5
): boolean[] {
  if (data.length < 3) {
    return data.map(() => false);
  }

  const mean = calculateMean(data);
  const stdDev = calculateStandardDeviation(data);

  if (stdDev === 0) {
    return data.map(() => false);
  }

  return data.map(value => {
    const zScore = Math.abs((value - mean) / stdDev);
    return zScore > threshold;
  });
}

/**
 * Detect Single Anomaly
 * Detecta si un valor individual es una anomalía
 *
 * @param value - Valor a evaluar
 * @param referenceData - Datos de referencia
 * @param threshold - Umbral de Z-score (default: 2.5)
 * @returns Objeto con información de la anomalía
 *
 * @example
 * ```typescript
 * const historicalSales = [100, 105, 110, 108, 112];
 * const todaySales = 200; // Posible anomalía
 * const result = detectSingleAnomaly(todaySales, historicalSales);
 * console.log(result.isAnomaly); // true
 * console.log(result.score);     // ~3.5
 * ```
 */
export function detectSingleAnomaly(
  value: number,
  referenceData: number[],
  threshold: number = 2.5
): AnomalyResult {
  if (referenceData.length === 0) {
    return {
      isAnomaly: false,
      score: 0,
      threshold,
      value,
      expectedRange: { min: value, max: value }
    };
  }

  const mean = calculateMean(referenceData);
  const stdDev = calculateStandardDeviation(referenceData);

  const zScore = stdDev === 0 ? 0 : Math.abs((value - mean) / stdDev);
  const isAnomaly = zScore > threshold;

  const expectedRange = {
    min: mean - (threshold * stdDev),
    max: mean + (threshold * stdDev)
  };

  return {
    isAnomaly,
    score: zScore,
    threshold,
    value,
    expectedRange
  };
}

// ============================================================================
// IQR METHOD (Interquartile Range)
// ============================================================================

/**
 * Calculate Quartiles
 * Calcula los cuartiles Q1, Q2 (mediana), Q3 de un dataset
 */
function calculateQuartiles(data: number[]): {
  q1: number;
  q2: number;
  q3: number;
} {
  if (data.length === 0) {
    return { q1: 0, q2: 0, q3: 0 };
  }

  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;

  const q2 = sorted[Math.floor(n / 2)];

  const lowerHalf = sorted.slice(0, Math.floor(n / 2));
  const upperHalf = sorted.slice(Math.ceil(n / 2));

  const q1 = lowerHalf.length > 0
    ? lowerHalf[Math.floor(lowerHalf.length / 2)]
    : sorted[0];

  const q3 = upperHalf.length > 0
    ? upperHalf[Math.floor(upperHalf.length / 2)]
    : sorted[n - 1];

  return { q1, q2, q3 };
}

/**
 * Detect Outliers IQR
 * Detecta outliers usando el método IQR (más robusto que Z-score)
 *
 * @param data - Array de valores
 * @param multiplier - Multiplicador IQR (default: 1.5)
 * @returns Array de booleanos indicando outliers
 *
 * @example
 * ```typescript
 * const prices = [10, 12, 11, 13, 50, 12, 14];
 * const outliers = detectOutliersIQR(prices);
 * console.log(outliers); // [false, false, false, false, true, false, false]
 * ```
 */
export function detectOutliersIQR(
  data: number[],
  multiplier: number = 1.5
): boolean[] {
  if (data.length < 4) {
    return data.map(() => false);
  }

  const { q1, q3 } = calculateQuartiles(data);
  const iqr = q3 - q1;

  const lowerBound = q1 - (multiplier * iqr);
  const upperBound = q3 + (multiplier * iqr);

  return data.map(value =>
    value < lowerBound || value > upperBound
  );
}

// ============================================================================
// MAD METHOD (Median Absolute Deviation)
// ============================================================================

/**
 * Calculate Median
 * Calcula la mediana de un array
 */
function calculateMedian(data: number[]): number {
  if (data.length === 0) return 0;

  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

/**
 * Calculate MAD (Median Absolute Deviation)
 * Calcula la desviación absoluta mediana (más robusta que std dev)
 */
function calculateMAD(data: number[]): number {
  if (data.length === 0) return 0;

  const median = calculateMedian(data);
  const deviations = data.map(value => Math.abs(value - median));

  return calculateMedian(deviations);
}

/**
 * Detect Outliers MAD
 * Detecta outliers usando MAD (método más robusto)
 *
 * @param data - Array de valores
 * @param threshold - Umbral (default: 3.5)
 * @returns Array de booleanos indicando outliers
 */
export function detectOutliersMAD(
  data: number[],
  threshold: number = 3.5
): boolean[] {
  if (data.length < 3) {
    return data.map(() => false);
  }

  const median = calculateMedian(data);
  const mad = calculateMAD(data);

  if (mad === 0) {
    return data.map(() => false);
  }

  // Modified Z-score using MAD
  return data.map(value => {
    const modifiedZScore = 0.6745 * Math.abs(value - median) / mad;
    return modifiedZScore > threshold;
  });
}

// ============================================================================
// SEASONAL ANOMALY DETECTION
// ============================================================================

/**
 * Detect Seasonal Anomalies
 * Detecta anomalías considerando patrones estacionales
 *
 * @param data - Array de valores
 * @param seasonLength - Longitud del periodo estacional
 * @param threshold - Umbral de Z-score (default: 2.5)
 * @returns Array de booleanos indicando anomalías
 *
 * @example
 * ```typescript
 * // Ventas por día de la semana (7 semanas)
 * const weeklySales = [
 *   100, 120, 110, 130, 140, 200, 180, // Semana 1
 *   105, 125, 115, 135, 145, 210, 185, // Semana 2
 *   // ... más semanas
 * ];
 * const anomalies = detectSeasonalAnomalies(weeklySales, 7);
 * ```
 */
export function detectSeasonalAnomalies(
  data: number[],
  seasonLength: number,
  threshold: number = 2.5
): boolean[] {
  if (data.length < seasonLength * 2) {
    return data.map(() => false);
  }

  const anomalies: boolean[] = [];

  // For each season position, collect all values at that position
  for (let i = 0; i < data.length; i++) {
    const seasonPosition = i % seasonLength;

    // Collect all values at this season position
    const seasonalValues: number[] = [];
    for (let j = seasonPosition; j < data.length; j += seasonLength) {
      if (j !== i) { // Exclude current value
        seasonalValues.push(data[j]);
      }
    }

    // Detect if current value is anomaly for this season position
    if (seasonalValues.length > 0) {
      const result = detectSingleAnomaly(data[i], seasonalValues, threshold);
      anomalies.push(result.isAnomaly);
    } else {
      anomalies.push(false);
    }
  }

  return anomalies;
}

// ============================================================================
// BUSINESS LOGIC ANOMALIES
// ============================================================================

/**
 * Detect Business Rule Violations
 * Detecta violaciones de reglas de negocio
 *
 * @param value - Valor a evaluar
 * @param rules - Reglas de negocio
 * @returns Objeto indicando si hay violación
 *
 * @example
 * ```typescript
 * const stock = 5;
 * const result = detectBusinessRuleViolations(stock, {
 *   min: 10,
 *   max: 1000,
 *   mustBePositive: true
 * });
 * console.log(result.isAnomaly); // true (stock < min)
 * ```
 */
export function detectBusinessRuleViolations(
  value: number,
  rules: {
    min?: number;
    max?: number;
    mustBePositive?: boolean;
    mustBeInteger?: boolean;
    allowedValues?: number[];
  }
): AnomalyResult {
  const violations: string[] = [];
  let isAnomaly = false;

  if (rules.mustBePositive && value < 0) {
    violations.push('Value must be positive');
    isAnomaly = true;
  }

  if (rules.min !== undefined && value < rules.min) {
    violations.push(`Value below minimum (${rules.min})`);
    isAnomaly = true;
  }

  if (rules.max !== undefined && value > rules.max) {
    violations.push(`Value above maximum (${rules.max})`);
    isAnomaly = true;
  }

  if (rules.mustBeInteger && !Number.isInteger(value)) {
    violations.push('Value must be integer');
    isAnomaly = true;
  }

  if (rules.allowedValues && !rules.allowedValues.includes(value)) {
    violations.push('Value not in allowed list');
    isAnomaly = true;
  }

  return {
    isAnomaly,
    score: violations.length,
    threshold: 0,
    value,
    expectedRange: {
      min: rules.min ?? -Infinity,
      max: rules.max ?? Infinity
    }
  };
}

// ============================================================================
// PERFORMANCE ANOMALIES
// ============================================================================

/**
 * Detect Performance Degradation
 * Detecta degradación de performance comparando con baseline
 *
 * @param currentMetric - Métrica actual
 * @param baseline - Valor baseline
 * @param threshold - % de degradación aceptable (default: 0.2 = 20%)
 * @returns Objeto indicando si hay degradación
 */
export function detectPerformanceDegradation(
  currentMetric: number,
  baseline: number,
  threshold: number = 0.2
): AnomalyResult {
  if (baseline === 0) {
    return {
      isAnomaly: false,
      score: 0,
      threshold,
      value: currentMetric,
      expectedRange: { min: baseline, max: baseline }
    };
  }

  const degradation = (baseline - currentMetric) / baseline;
  const isAnomaly = degradation > threshold;

  return {
    isAnomaly,
    score: degradation,
    threshold,
    value: currentMetric,
    expectedRange: {
      min: baseline * (1 - threshold),
      max: baseline
    }
  };
}
