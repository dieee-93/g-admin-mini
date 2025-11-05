/**
 * ML ALGORITHMS LIBRARY
 * ============================================================================
 * Pure machine learning algorithms for G-Admin Mini
 * Extracted from MLEngine and refactored as reusable functions
 *
 * @module lib/ml
 */

// ============================================================================
// TIME SERIES
// ============================================================================

export {
  // Main algorithms
  simpleMovingAverage,
  exponentialSmoothing,
  seasonalDecomposition,
  linearRegression,
  detectTrend,
  predictNextValue,

  // Statistical helpers
  calculateMean,
  calculateStandardDeviation,
  calculateVariance,

  // Types
  type TimeSeriesData,
  type SeasonalDecomposition,
  type LinearRegressionResult,
  type TrendDirection
} from './timeseries';

// ============================================================================
// FORECASTING
// ============================================================================

export {
  // Main algorithms
  forecastDemand,
  calculateEOQ,
  optimizeReorderPoint,
  calculateDaysUntilStockout,
  predictStockoutRisk,

  // Types
  type ForecastResult,
  type ForecastMethod,
  type ForecastConfig
} from './forecasting';

// ============================================================================
// ANOMALY DETECTION
// ============================================================================

export {
  // Z-Score methods
  calculateZScore,
  detectOutliers,
  detectSingleAnomaly,

  // IQR method
  detectOutliersIQR,

  // MAD method
  detectOutliersMAD,

  // Seasonal anomalies
  detectSeasonalAnomalies,

  // Business logic
  detectBusinessRuleViolations,
  detectPerformanceDegradation,

  // Types
  type AnomalyResult,
  type OutlierDetectionConfig
} from './anomalyDetection';
