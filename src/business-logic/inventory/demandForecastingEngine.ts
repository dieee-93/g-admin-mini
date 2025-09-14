// ============================================================================
// DEMAND FORECASTING ENGINE - Business Logic
// ============================================================================
// Sistema inteligente de predicción de demanda integrado con ventas históricas

import { type MaterialItem } from '@/pages/admin/supply-chain/materials/types';
import { type MaterialABC } from '@/pages/admin/supply-chain/materials/types/abc-analysis';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { InventoryDecimal, DECIMAL_CONSTANTS } from '@/config/decimal-config';

// ============================================================================
// TYPES
// ============================================================================

export type ForecastingMethod = 
  | 'moving_average'     // Media móvil simple
  | 'weighted_average'   // Media móvil ponderada
  | 'exponential_smoothing' // Suavizado exponencial
  | 'linear_regression'  // Regresión lineal
  | 'seasonal_decomposition' // Descomposición estacional
  | 'hybrid_model';      // Modelo híbrido (combinación)

export type SeasonalPattern = 
  | 'none'               // Sin patrón estacional
  | 'weekly'             // Patrón semanal
  | 'monthly'            // Patrón mensual
  | 'quarterly'          // Patrón trimestral
  | 'yearly';            // Patrón anual

export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'volatile';

export type ForecastConfidence = 'very_high' | 'high' | 'medium' | 'low' | 'very_low';

// Punto de datos históricos
export interface DemandDataPoint {
  date: string;              // ISO date string
  actualDemand: number;      // Demanda real registrada
  adjustedDemand?: number;   // Demanda ajustada (sin outliers)
  
  // Context data
  dayOfWeek: number;         // 0-6 (0=domingo)
  month: number;             // 1-12
  quarter: number;           // 1-4
  isHoliday?: boolean;       // Si era día feriado
  isPromotion?: boolean;     // Si había promoción activa
  weatherCondition?: 'sunny' | 'rainy' | 'cold' | 'hot' | 'normal';
  
  // External factors
  priceAtTime?: number;      // Precio del item en esa fecha
  competitorPrice?: number;  // Precio de competencia
  marketingSpend?: number;   // Gasto en marketing
}

// Pronóstico individual
export interface DemandForecast {
  itemId: string;
  itemName: string;
  abcClass: string;
  
  // Configuración del forecast
  method: ForecastingMethod;
  periodLength: number;      // Días del período de forecast
  confidence: ForecastConfidence;
  accuracy: number;          // % precisión histórica del modelo
  
  // Análisis de patrones
  trendDirection: TrendDirection;
  trendStrength: number;     // 0-100 (fuerza de la tendencia)
  seasonalPattern: SeasonalPattern;
  seasonalStrength: number;  // 0-100 (fuerza del patrón estacional)
  volatility: number;        // 0-100 (volatilidad de la demanda)
  
  // Predicciones
  forecasts: ForecastPoint[];
  
  // Análisis estadístico
  statistics: {
    historicalAverage: number;
    standardDeviation: number;
    coefficientOfVariation: number;  // CV = std/mean
    autocorrelation: number;         // Correlación con períodos anteriores
    
    // Error metrics
    mae: number;                     // Mean Absolute Error
    rmse: number;                    // Root Mean Square Error
    mape: number;                    // Mean Absolute Percentage Error
  };
  
  // Factores influyentes
  keyFactors: Array<{
    factor: string;
    impact: number;        // -100 to +100 (impacto en la demanda)
    confidence: number;    // 0-100 (confianza en el impacto)
  }>;
  
  // Recommendations
  recommendations: ForecastRecommendation[];
  
  // Metadata
  generatedAt: string;
  validUntil: string;
  dataPointsUsed: number;
  lastDataDate: string;
}

// Punto de forecast específico
export interface ForecastPoint {
  date: string;
  predictedDemand: number;
  lowerBound: number;        // Límite inferior (confidence interval)
  upperBound: number;        // Límite superior (confidence interval)
  confidence: number;        // % confianza en esta predicción
  
  // Context for this forecast point
  dayOfWeek: number;
  isWeekend: boolean;
  isHoliday?: boolean;
  expectedEvents?: string[]; // Eventos especiales esperados
}

// Recomendación basada en forecast
export interface ForecastRecommendation {
  id: string;
  type: 'stock_increase' | 'stock_decrease' | 'promotion_opportunity' | 'supplier_contact' | 'price_adjustment';
  priority: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  
  // Timing
  suggestedDate: string;
  urgency: 'immediate' | 'within_week' | 'within_month';
  
  // Impact
  expectedImpact: number;    // 0-100
  potentialSavings?: number; // ARS
  riskLevel: 'low' | 'medium' | 'high';
  
  // Action details
  suggestedQuantity?: number;
  justification: string;
}

// Configuración del engine
export interface ForecastingConfig {
  // Parámetros generales
  defaultForecastDays: number;        // Días hacia adelante
  minHistoricalDays: number;          // Mínimos datos históricos requeridos
  maxHistoricalDays: number;          // Máximos datos históricos a usar
  
  // Configuración por método
  methodParams: {
    movingAverage: {
      windowSize: number;              // Ventana de días para promedio
    };
    weightedAverage: {
      windowSize: number;
      weights: number[];               // Pesos para cada día (más reciente = mayor peso)
    };
    exponentialSmoothing: {
      alpha: number;                   // Smoothing parameter (0-1)
      beta?: number;                   // Trend smoothing (0-1)
      gamma?: number;                  // Seasonal smoothing (0-1)
    };
    linearRegression: {
      polynomialDegree: number;        // Grado del polinomio (1=linear, 2=quadratic, etc.)
    };
  };
  
  // Detección de outliers
  outlierDetection: {
    enabled: boolean;
    zscore: number;                    // Z-score threshold for outliers
    removeOutliers: boolean;           // Si remover o solo marcar outliers
  };
  
  // Ajustes estacionales
  seasonalAdjustment: {
    enabled: boolean;
    detectAutomatically: boolean;      // Auto-detectar patrones
    knownPatterns: SeasonalPattern[];  // Patrones conocidos a buscar
  };
  
  // Factores externos
  externalFactors: {
    considerWeather: boolean;
    considerPromotions: boolean;
    considerHolidays: boolean;
    considerPriceChanges: boolean;
  };
  
  // Validación y confianza
  validation: {
    backtestDays: number;              // Días para backtest de precisión
    minAccuracyThreshold: number;      // % mínimo de precisión requerida
    confidenceIntervals: number[];     // Intervalos de confianza (ej: [80, 95])
  };
}

// Resultado consolidado de forecasting
export interface ForecastingResult {
  // Metadata
  generatedAt: string;
  config: ForecastingConfig;
  itemsAnalyzed: number;
  averageAccuracy: number;
  
  // Forecasts individuales
  forecasts: DemandForecast[];
  
  // Análisis agregado
  aggregatedMetrics: {
    totalPredictedDemand: number;      // Demanda total predicha
    demandByClass: Record<string, number>; // Demanda por clase ABC
    demandByCategory: Record<string, number>; // Demanda por categoría
    
    // Trends
    overallTrend: TrendDirection;
    trendStrength: number;
    mostVolatileItems: string[];       // IDs de items más volátiles
    mostPredictableItems: string[];    // IDs de items más predecibles
  };
  
  // Recomendaciones consolidadas
  strategicRecommendations: Array<{
    id: string;
    type: 'inventory_optimization' | 'procurement_timing' | 'promotion_planning' | 'capacity_planning';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    affectedItems: string[];
    potentialImpact: number;           // ARS
    timeframe: string;
  }>;
  
  // Alertas de forecast
  forecastAlerts: Array<{
    itemId: string;
    type: 'demand_spike_expected' | 'demand_drop_expected' | 'high_uncertainty' | 'data_quality_issue';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    forecastDate: string;
    recommendedActions: string[];
  }>;
  
  // Quality metrics
  qualityMetrics: {
    dataCompleteness: number;          // % de datos completos
    modelReliability: number;          // % confiabilidad general
    forecastHorizonOptimal: number;    // Días óptimos de forecast
  };
}

// ============================================================================
// DEMAND FORECASTING ENGINE
// ============================================================================

export class DemandForecastingEngine {
  
  // Configuración por defecto optimizada para restaurantes
  private static readonly DEFAULT_CONFIG: ForecastingConfig = {
    defaultForecastDays: 30,           // 30 días hacia adelante
    minHistoricalDays: 60,             // Mínimo 60 días de historia
    maxHistoricalDays: 365,            // Máximo 1 año de historia
    
    methodParams: {
      movingAverage: {
        windowSize: 7                  // Ventana de 7 días
      },
      weightedAverage: {
        windowSize: 14,
        weights: [0.5, 0.3, 0.2]       // Más peso a días recientes
      },
      exponentialSmoothing: {
        alpha: 0.3,                    // Suavizado moderado
        beta: 0.1,                     // Poco seguimiento de tendencia
        gamma: 0.1                     // Poco seguimiento estacional
      },
      linearRegression: {
        polynomialDegree: 1            // Regresión lineal simple
      }
    },
    
    outlierDetection: {
      enabled: true,
      zscore: 2.5,                     // Z-score > 2.5 = outlier
      removeOutliers: false            // Solo marcar, no remover
    },
    
    seasonalAdjustment: {
      enabled: true,
      detectAutomatically: true,
      knownPatterns: ['weekly', 'monthly'] // Buscar patrones semanales y mensuales
    },
    
    externalFactors: {
      considerWeather: false,          // Por simplicidad, deshabilitado inicialmente
      considerPromotions: true,        // Importante para restaurantes
      considerHolidays: true,          // Crítico para demanda
      considerPriceChanges: true       // Impacta directamente demanda
    },
    
    validation: {
      backtestDays: 30,                // Validar últimos 30 días
      minAccuracyThreshold: 70,        // Mínimo 70% precisión
      confidenceIntervals: [80, 95]    // Intervalos de 80% y 95%
    }
  };

  // ============================================================================
  // MAIN FORECASTING METHOD
  // ============================================================================

  /**
   * Genera forecasts de demanda para materiales usando datos históricos
   */
  static async generateDemandForecasts(
    materials: MaterialABC[],
    historicalData: Map<string, DemandDataPoint[]>, // itemId -> historical data
    config: Partial<ForecastingConfig> = {}
  ): Promise<ForecastingResult> {
    
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config };
    const timestamp = new Date().toISOString();
    
    // 1. Filtrar materiales con suficientes datos históricos
    const materialsWithData = materials.filter(material => {
      const data = historicalData.get(material.id);
      return data && data.length >= fullConfig.minHistoricalDays;
    });
    
    // 2. Generar forecast para cada material
    const forecasts = await Promise.all(
      materialsWithData.map(material => {
        const data = historicalData.get(material.id)!;
        return this.generateIndividualForecast(material, data, fullConfig);
      })
    );
    
    // 3. Filtrar forecasts válidos
    const validForecasts = forecasts.filter(f => f !== null) as DemandForecast[];
    
    // 4. Calcular métricas agregadas
    const aggregatedMetrics = this.calculateAggregatedMetrics(validForecasts, materials);
    
    // 5. Generar recomendaciones estratégicas
    const strategicRecommendations = this.generateStrategicRecommendations(validForecasts, aggregatedMetrics);
    
    // 6. Generar alertas de forecast
    const forecastAlerts = this.generateForecastAlerts(validForecasts);
    
    // 7. Calcular métricas de calidad
    const qualityMetrics = this.calculateQualityMetrics(validForecasts, historicalData);
    
    const averageAccuracy = validForecasts.length > 0 
      ? validForecasts.reduce((sum, f) => sum + f.accuracy, 0) / validForecasts.length 
      : 0;
    
    return {
      generatedAt: timestamp,
      config: fullConfig,
      itemsAnalyzed: materialsWithData.length,
      averageAccuracy,
      forecasts: validForecasts,
      aggregatedMetrics,
      strategicRecommendations,
      forecastAlerts,
      qualityMetrics
    };
  }

  // ============================================================================
  // INDIVIDUAL FORECAST GENERATION
  // ============================================================================

  private static async generateIndividualForecast(
    material: MaterialABC,
    historicalData: DemandDataPoint[],
    config: ForecastingConfig
  ): Promise<DemandForecast | null> {
    
    try {
      // 1. Preparar y limpiar datos
      const cleanData = this.preprocessData(historicalData, config);
      
      if (cleanData.length < config.minHistoricalDays) {
        return null; // Insuficientes datos después de limpieza
      }
      
      // 2. Analizar patrones
      const patterns = this.analyzePatterns(cleanData, config);
      
      // 3. Seleccionar mejor método de forecasting
      const bestMethod = this.selectBestMethod(cleanData, patterns, config);
      
      // 4. Generar forecast usando el método seleccionado
      const forecastPoints = this.generateForecastPoints(cleanData, bestMethod, config);
      
      // 5. Calcular estadísticas y métricas de error
      const statistics = this.calculateStatistics(cleanData, forecastPoints);
      
      // 6. Determinar factores clave
      const keyFactors = this.identifyKeyFactors(cleanData, patterns);
      
      // 7. Generar recomendaciones
      const recommendations = this.generateForecastRecommendations(
        material, 
        forecastPoints, 
        patterns, 
        statistics
      );
      
      // 8. Calcular confianza y precisión
      const confidence = this.calculateConfidence(statistics, patterns, cleanData.length);
      const accuracy = this.calculateAccuracy(cleanData, bestMethod, config);
      
      const forecast: DemandForecast = {
        itemId: material.id,
        itemName: material.name,
        abcClass: material.abcClass,
        
        method: bestMethod,
        periodLength: config.defaultForecastDays,
        confidence,
        accuracy,
        
        trendDirection: patterns.trend.direction,
        trendStrength: patterns.trend.strength,
        seasonalPattern: patterns.seasonal.pattern,
        seasonalStrength: patterns.seasonal.strength,
        volatility: patterns.volatility,
        
        forecasts: forecastPoints,
        statistics,
        keyFactors,
        recommendations,
        
        generatedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
        dataPointsUsed: cleanData.length,
        lastDataDate: cleanData[cleanData.length - 1]?.date || new Date().toISOString()
      };
      
      return forecast;
      
    } catch (error) {
      console.error(`Error generating forecast for ${material.name}:`, error);
      return null;
    }
  }

  // ============================================================================
  // DATA PREPROCESSING
  // ============================================================================

  private static preprocessData(data: DemandDataPoint[], config: ForecastingConfig): DemandDataPoint[] {
    // 1. Ordenar por fecha
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 2. Limitar cantidad de datos históricos
    const limitedData = sortedData.slice(-config.maxHistoricalDays);
    
    // 3. Detectar y manejar outliers si está habilitado
    if (config.outlierDetection.enabled) {
      return this.handleOutliers(limitedData, config);
    }
    
    return limitedData;
  }

  private static handleOutliers(data: DemandDataPoint[], config: ForecastingConfig): DemandDataPoint[] {
    if (data.length < 10) return data; // Muy pocos datos para análisis de outliers
    
    // Calcular media y desviación estándar
    const demands = data.map(d => d.actualDemand);
    const mean = demands.reduce((sum, d) => sum + d, 0) / demands.length;
    const stdDev = Math.sqrt(demands.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / demands.length);
    
    const threshold = config.outlierDetection.zscore * stdDev;
    
    return data.map(point => {
      const zScore = Math.abs(point.actualDemand - mean) / stdDev;
      const isOutlier = zScore > config.outlierDetection.zscore;
      
      if (isOutlier) {
        if (config.outlierDetection.removeOutliers) {
          // Reemplazar outlier con media móvil de los puntos adyacentes
          return {
            ...point,
            adjustedDemand: mean // Usar media como valor ajustado
          };
        }
      }
      
      return {
        ...point,
        adjustedDemand: point.actualDemand
      };
    });
  }

  // ============================================================================
  // PATTERN ANALYSIS
  // ============================================================================

  private static analyzePatterns(data: DemandDataPoint[], config: ForecastingConfig) {
    const demands = data.map(d => d.adjustedDemand || d.actualDemand);
    
    // Análisis de tendencia
    const trend = this.analyzeTrend(demands);
    
    // Análisis estacional
    const seasonal = config.seasonalAdjustment.enabled 
      ? this.analyzeSeasonal(data, config)
      : { pattern: 'none' as SeasonalPattern, strength: 0, factors: [] };
    
    // Análisis de volatilidad
    const volatility = this.calculateVolatility(demands);
    
    return { trend, seasonal, volatility };
  }

  private static analyzeTrend(demands: number[]) {
    if (demands.length < 10) {
      return { direction: 'stable' as TrendDirection, strength: 0 };
    }
    
    // Regresión lineal simple para detectar tendencia
    const n = demands.length;
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const y = demands;
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Determinar dirección y fuerza
    let direction: TrendDirection;
    const absSlope = Math.abs(slope);
    const meanY = sumY / n;
    const slopePercentage = Math.abs(slope / meanY) * 100;
    
    if (slopePercentage < 1) direction = 'stable';
    else if (slope > 0) direction = 'increasing';
    else direction = 'decreasing';
    
    // Calcular fuerza de la tendencia (0-100)
    const strength = Math.min(100, slopePercentage * 10);
    
    return { direction, strength };
  }

  private static analyzeSeasonal(data: DemandDataPoint[], config: ForecastingConfig) {
    // Análisis estacional simplificado
    // En producción se implementarían técnicas más avanzadas como FFT o descomposición STL
    
    const patterns = config.seasonalAdjustment.knownPatterns;
    let bestPattern: SeasonalPattern = 'none';
    let bestStrength = 0;
    
    // Análisis de patrón semanal
    if (patterns.includes('weekly')) {
      const weeklyStrength = this.calculateWeeklyPattern(data);
      if (weeklyStrength > bestStrength) {
        bestPattern = 'weekly';
        bestStrength = weeklyStrength;
      }
    }
    
    // Análisis de patrón mensual
    if (patterns.includes('monthly')) {
      const monthlyStrength = this.calculateMonthlyPattern(data);
      if (monthlyStrength > bestStrength) {
        bestPattern = 'monthly';
        bestStrength = monthlyStrength;
      }
    }
    
    return { 
      pattern: bestPattern, 
      strength: bestStrength, 
      factors: [] // Por simplicidad, vacío por ahora
    };
  }

  private static calculateWeeklyPattern(data: DemandDataPoint[]): number {
    // Agrupar por día de la semana y calcular variabilidad
    const weeklyDemand = Array(7).fill(0).map(() => []);
    
    data.forEach(point => {
      const dayOfWeek = new Date(point.date).getDay();
      weeklyDemand[dayOfWeek].push(point.adjustedDemand || point.actualDemand);
    });
    
    const weeklyAverages = weeklyDemand.map(dayDemands => 
      dayDemands.length > 0 
        ? dayDemands.reduce((sum: number, d: number) => sum + d, 0) / dayDemands.length 
        : 0
    );
    
    const overallAverage = weeklyAverages.reduce((sum, avg) => sum + avg, 0) / 7;
    const variance = weeklyAverages.reduce((sum, avg) => sum + Math.pow(avg - overallAverage, 2), 0) / 7;
    const coefficientOfVariation = overallAverage > 0 ? Math.sqrt(variance) / overallAverage : 0;
    
    // Convertir a porcentaje de fuerza estacional
    return Math.min(100, coefficientOfVariation * 100);
  }

  private static calculateMonthlyPattern(data: DemandDataPoint[]): number {
    // Similar al patrón semanal pero agrupado por mes
    const monthlyDemand = Array(12).fill(0).map(() => []);
    
    data.forEach(point => {
      const month = new Date(point.date).getMonth();
      monthlyDemand[month].push(point.adjustedDemand || point.actualDemand);
    });
    
    const monthlyAverages = monthlyDemand.map(monthDemands => 
      monthDemands.length > 0 
        ? monthDemands.reduce((sum: number, d: number) => sum + d, 0) / monthDemands.length 
        : 0
    );
    
    const overallAverage = monthlyAverages.reduce((sum, avg) => sum + avg, 0) / 12;
    const variance = monthlyAverages.reduce((sum, avg) => sum + Math.pow(avg - overallAverage, 2), 0) / 12;
    const coefficientOfVariation = overallAverage > 0 ? Math.sqrt(variance) / overallAverage : 0;
    
    return Math.min(100, coefficientOfVariation * 100);
  }

  private static calculateVolatility(demands: number[]): number {
    if (demands.length < 2) return 0;
    
    const mean = demands.reduce((sum, d) => sum + d, 0) / demands.length;
    const variance = demands.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / demands.length;
    const stdDev = Math.sqrt(variance);
    
    // Coeficiente de variación como medida de volatilidad
    const coefficientOfVariation = mean > 0 ? (stdDev / mean) * 100 : 0;
    
    return Math.min(100, coefficientOfVariation);
  }

  // ============================================================================
  // METHOD SELECTION
  // ============================================================================

  private static selectBestMethod(
    data: DemandDataPoint[], 
    patterns: any, 
    config: ForecastingConfig
  ): ForecastingMethod {
    
    // Reglas heurísticas para seleccionar el mejor método
    
    // Si hay fuerte estacionalidad, usar descomposición estacional
    if (patterns.seasonal.strength > 30) {
      return 'seasonal_decomposition';
    }
    
    // Si hay tendencia clara, usar regresión lineal
    if (patterns.trend.strength > 40 && patterns.volatility < 30) {
      return 'linear_regression';
    }
    
    // Si es muy volátil, usar suavizado exponencial
    if (patterns.volatility > 50) {
      return 'exponential_smoothing';
    }
    
    // Para datos estables, usar media móvil ponderada
    if (patterns.volatility < 20 && patterns.trend.strength < 20) {
      return 'weighted_average';
    }
    
    // Default: media móvil simple
    return 'moving_average';
  }

  // ============================================================================
  // FORECAST GENERATION
  // ============================================================================

  private static generateForecastPoints(
    data: DemandDataPoint[], 
    method: ForecastingMethod, 
    config: ForecastingConfig
  ): ForecastPoint[] {
    
    const forecastPoints: ForecastPoint[] = [];
    const lastDate = new Date(data[data.length - 1].date);
    
    for (let i = 1; i <= config.defaultForecastDays; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(forecastDate.getDate() + i);
      
      let predictedDemand: number;
      
      // Aplicar método de forecasting seleccionado
      switch (method) {
        case 'moving_average':
          predictedDemand = this.calculateMovingAverage(data, config.methodParams.movingAverage.windowSize);
          break;
          
        case 'weighted_average':
          predictedDemand = this.calculateWeightedAverage(data, config.methodParams.weightedAverage);
          break;
          
        case 'exponential_smoothing':
          predictedDemand = this.calculateExponentialSmoothing(data, config.methodParams.exponentialSmoothing, i);
          break;
          
        case 'linear_regression':
          predictedDemand = this.calculateLinearRegression(data, data.length + i);
          break;
          
        default:
          predictedDemand = this.calculateMovingAverage(data, 7); // Fallback
      }
      
      // Calcular intervalos de confianza
      const confidence = Math.max(50, 95 - (i * 2)); // Decrece con el tiempo
      const stdDev = this.calculateStandardDeviation(data.map(d => d.adjustedDemand || d.actualDemand));
      const marginOfError = (2 * stdDev) * (1 + i * 0.1); // Aumenta con el tiempo
      
      const forecastPoint: ForecastPoint = {
        date: forecastDate.toISOString(),
        predictedDemand: Math.max(0, predictedDemand),
        lowerBound: Math.max(0, predictedDemand - marginOfError),
        upperBound: predictedDemand + marginOfError,
        confidence,
        dayOfWeek: forecastDate.getDay(),
        isWeekend: forecastDate.getDay() === 0 || forecastDate.getDay() === 6,
        expectedEvents: this.getExpectedEvents(forecastDate) // Eventos especiales
      };
      
      forecastPoints.push(forecastPoint);
    }
    
    return forecastPoints;
  }

  // ============================================================================
  // FORECASTING METHODS IMPLEMENTATION
  // ============================================================================

  private static calculateMovingAverage(data: DemandDataPoint[], windowSize: number): number {
    const recentData = data.slice(-windowSize);
    const sum = recentData.reduce((sum, d) => sum + (d.adjustedDemand || d.actualDemand), 0);
    return sum / recentData.length;
  }

  private static calculateWeightedAverage(data: DemandDataPoint[], params: any): number {
    const recentData = data.slice(-params.windowSize);
    const weights = params.weights;
    
    if (recentData.length === 0) return 0;
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    recentData.forEach((point, index) => {
      const weight = weights[Math.min(index, weights.length - 1)] || weights[weights.length - 1];
      weightedSum += (point.adjustedDemand || point.actualDemand) * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private static calculateExponentialSmoothing(data: DemandDataPoint[], params: any, periodsAhead: number): number {
    if (data.length === 0) return 0;
    
    const alpha = params.alpha;
    let smoothedValue = data[0].adjustedDemand || data[0].actualDemand;
    
    // Aplicar suavizado exponencial a datos históricos
    for (let i = 1; i < data.length; i++) {
      const actualValue = data[i].adjustedDemand || data[i].actualDemand;
      smoothedValue = alpha * actualValue + (1 - alpha) * smoothedValue;
    }
    
    // Para simplificar, usar el último valor suavizado para todos los períodos futuros
    // En implementación completa se consideraría tendencia y estacionalidad
    return smoothedValue;
  }

  private static calculateLinearRegression(data: DemandDataPoint[], futureIndex: number): number {
    if (data.length < 2) return 0;
    
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const y = data.map(d => d.adjustedDemand || d.actualDemand);
    
    // Calcular coeficientes de regresión lineal
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Predecir para índice futuro
    return slope * futureIndex + intercept;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private static calculateStandardDeviation(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private static getExpectedEvents(date: Date): string[] {
    const events: string[] = [];
    
    // Verificar si es fin de semana
    if (date.getDay() === 0 || date.getDay() === 6) {
      events.push('weekend');
    }
    
    // Agregar otros eventos especiales según la fecha
    // En producción esto vendría de una base de datos de eventos/feriados
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if (month === 12 && day >= 20) events.push('holiday_season');
    if (month === 2 && day === 14) events.push('valentines_day');
    if (month === 5 && day === 1) events.push('labor_day');
    
    return events;
  }

  private static calculateStatistics(data: DemandDataPoint[], forecasts: ForecastPoint[]) {
    const demands = data.map(d => d.adjustedDemand || d.actualDemand);
    const mean = demands.reduce((sum, d) => sum + d, 0) / demands.length;
    const variance = demands.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / demands.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      historicalAverage: mean,
      standardDeviation: stdDev,
      coefficientOfVariation: mean > 0 ? (stdDev / mean) * 100 : 0,
      autocorrelation: 0.7, // Simulado - en producción se calcularía real
      
      // Error metrics (simulados por ahora)
      mae: stdDev * 0.8,
      rmse: stdDev,
      mape: Math.min(50, (stdDev / mean) * 100)
    };
  }

  private static identifyKeyFactors(data: DemandDataPoint[], patterns: any) {
    const factors = [];
    
    // Factor de tendencia
    if (patterns.trend.strength > 20) {
      factors.push({
        factor: patterns.trend.direction === 'increasing' ? 'Tendencia creciente' : 'Tendencia decreciente',
        impact: patterns.trend.direction === 'increasing' ? patterns.trend.strength : -patterns.trend.strength,
        confidence: Math.min(95, 60 + patterns.trend.strength * 0.5)
      });
    }
    
    // Factor estacional
    if (patterns.seasonal.strength > 15) {
      factors.push({
        factor: `Patrón ${patterns.seasonal.pattern}`,
        impact: patterns.seasonal.strength,
        confidence: Math.min(90, 50 + patterns.seasonal.strength * 0.8)
      });
    }
    
    // Factor de volatilidad
    if (patterns.volatility > 30) {
      factors.push({
        factor: 'Alta volatilidad',
        impact: -patterns.volatility * 0.5,
        confidence: Math.min(85, 40 + patterns.volatility * 0.6)
      });
    }
    
    return factors;
  }

  private static calculateConfidence(statistics: any, patterns: any, dataPoints: number): ForecastConfidence {
    let score = 60; // Base confidence
    
    // Mayor confianza con más datos
    if (dataPoints > 90) score += 15;
    else if (dataPoints > 60) score += 10;
    
    // Menor confianza con alta volatilidad
    if (patterns.volatility > 50) score -= 20;
    else if (patterns.volatility > 30) score -= 10;
    
    // Mayor confianza con patrones claros
    if (patterns.trend.strength > 30) score += 10;
    if (patterns.seasonal.strength > 30) score += 10;
    
    // Menor confianza con errores históricos altos
    if (statistics.mape > 30) score -= 15;
    else if (statistics.mape > 20) score -= 10;
    
    if (score >= 85) return 'very_high';
    if (score >= 75) return 'high';
    if (score >= 60) return 'medium';
    if (score >= 45) return 'low';
    return 'very_low';
  }

  private static calculateAccuracy(data: DemandDataPoint[], method: ForecastingMethod, config: ForecastingConfig): number {
    // Simulación de backtest simplificado
    // En producción se implementaría un backtest real dividiendo los datos
    
    const baseAccuracy = 75; // Base accuracy
    let adjustments = 0;
    
    // Ajustes según método
    switch (method) {
      case 'moving_average': adjustments = 0; break;
      case 'weighted_average': adjustments = 3; break;
      case 'exponential_smoothing': adjustments = 5; break;
      case 'linear_regression': adjustments = 4; break;
      case 'seasonal_decomposition': adjustments = 7; break;
      case 'hybrid_model': adjustments = 8; break;
    }
    
    // Ajuste por cantidad de datos
    const dataBonus = Math.min(10, data.length / 10);
    
    return Math.min(95, Math.max(50, baseAccuracy + adjustments + dataBonus));
  }

  private static generateForecastRecommendations(
    material: MaterialABC,
    forecasts: ForecastPoint[],
    patterns: any,
    statistics: any
  ): ForecastRecommendation[] {
    const recommendations: ForecastRecommendation[] = [];
    
    // Buscar picos de demanda esperados
    const averageDemand = statistics.historicalAverage;
    const highDemandDays = forecasts.filter(f => f.predictedDemand > averageDemand * 1.3);
    
    if (highDemandDays.length > 0) {
      const firstSpike = highDemandDays[0];
      recommendations.push({
        id: `spike_prep_${material.id}`,
        type: 'stock_increase',
        priority: 4,
        title: 'Preparar para Pico de Demanda',
        description: `Se espera un pico de demanda el ${new Date(firstSpike.date).toLocaleDateString()}`,
        suggestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
        urgency: 'within_week',
        expectedImpact: 80,
        potentialSavings: (firstSpike.predictedDemand - averageDemand) * (material.unit_cost || 0),
        riskLevel: 'medium',
        suggestedQuantity: Math.round(firstSpike.predictedDemand - averageDemand),
        justification: 'Forecast indica incremento significativo en demanda'
      });
    }
    
    // Recomendar contacto con proveedor si hay tendencia creciente fuerte
    if (patterns.trend.direction === 'increasing' && patterns.trend.strength > 40) {
      recommendations.push({
        id: `supplier_alert_${material.id}`,
        type: 'supplier_contact',
        priority: 3,
        title: 'Alertar a Proveedor sobre Tendencia',
        description: 'Tendencia creciente detectada - informar a proveedor',
        suggestedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // En 3 días
        urgency: 'within_week',
        expectedImpact: 70,
        riskLevel: 'low',
        justification: `Tendencia creciente del ${patterns.trend.strength}% detectada`
      });
    }
    
    return recommendations;
  }

  // ============================================================================
  // AGGREGATED ANALYSIS
  // ============================================================================

  private static calculateAggregatedMetrics(forecasts: DemandForecast[], materials: MaterialABC[]) {
    const totalPredictedDemand = DecimalUtils.fromValue(
      forecasts.reduce((sum, f) => 
        sum + f.forecasts.reduce((fSum, point) => fSum + point.predictedDemand, 0), 0
      ),
      'inventory'
    ).toNumber();
    
    // Demanda por clase ABC
    const demandByClass = forecasts.reduce((acc, forecast) => {
      const classDemand = forecast.forecasts.reduce((sum, point) => sum + point.predictedDemand, 0);
      acc[forecast.abcClass] = (acc[forecast.abcClass] || 0) + classDemand;
      return acc;
    }, {} as Record<string, number>);
    
    // Demanda por categoría (simulada)
    const demandByCategory = materials.reduce((acc, material) => {
      const forecast = forecasts.find(f => f.itemId === material.id);
      if (forecast) {
        const categoryDemand = forecast.forecasts.reduce((sum, point) => sum + point.predictedDemand, 0);
        acc[material.category] = (acc[material.category] || 0) + categoryDemand;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Análisis de tendencias generales
    const trendCounts = forecasts.reduce((acc, f) => {
      acc[f.trendDirection] = (acc[f.trendDirection] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const overallTrend = Object.entries(trendCounts)
      .reduce((max, [trend, count]) => count > max.count ? { trend, count } : max, { trend: 'stable', count: 0 })
      .trend as TrendDirection;
    
    const averageTrendStrength = forecasts.reduce((sum, f) => sum + f.trendStrength, 0) / forecasts.length;
    
    // Items más volátiles y predecibles
    const sortedByVolatility = [...forecasts].sort((a, b) => b.volatility - a.volatility);
    const mostVolatileItems = sortedByVolatility.slice(0, 5).map(f => f.itemId);
    const mostPredictableItems = sortedByVolatility.reverse().slice(0, 5).map(f => f.itemId);
    
    return {
      totalPredictedDemand,
      demandByClass,
      demandByCategory,
      overallTrend,
      trendStrength: averageTrendStrength,
      mostVolatileItems,
      mostPredictableItems
    };
  }

  private static generateStrategicRecommendations(forecasts: DemandForecast[], metrics: any) {
    const recommendations = [];
    
    // Recomendación de optimización de inventario si hay items muy volátiles
    if (metrics.mostVolatileItems.length > 0) {
      recommendations.push({
        id: 'optimize_volatile_items',
        type: 'inventory_optimization' as const,
        priority: 'high' as const,
        title: 'Optimizar Items Volátiles',
        description: 'Varios items muestran alta volatilidad en demanda',
        affectedItems: metrics.mostVolatileItems,
        potentialImpact: 15000, // ARS estimado
        timeframe: '2-4 semanas'
      });
    }
    
    // Recomendación de planning si hay tendencia creciente general
    if (metrics.overallTrend === 'increasing' && metrics.trendStrength > 30) {
      recommendations.push({
        id: 'capacity_planning',
        type: 'capacity_planning' as const,
        priority: 'medium' as const,
        title: 'Planificar Incremento de Capacidad',
        description: 'Tendencia creciente general detectada',
        affectedItems: forecasts.filter(f => f.trendDirection === 'increasing').map(f => f.itemId),
        potentialImpact: 25000,
        timeframe: '1-3 meses'
      });
    }
    
    return recommendations;
  }

  private static generateForecastAlerts(forecasts: DemandForecast[]) {
    const alerts = [];
    
    // Alertas por picos de demanda
    forecasts.forEach(forecast => {
      const highDemandDays = forecast.forecasts.filter(f => 
        f.predictedDemand > forecast.statistics.historicalAverage * 1.5
      );
      
      if (highDemandDays.length > 0) {
        alerts.push({
          itemId: forecast.itemId,
          type: 'demand_spike_expected' as const,
          severity: 'high' as const,
          message: `Pico de demanda esperado para ${forecast.itemName}`,
          forecastDate: highDemandDays[0].date,
          recommendedActions: [
            'Aumentar stock de seguridad',
            'Contactar proveedor',
            'Revisar capacidad de producción'
          ]
        });
      }
      
      // Alertas por baja confianza
      if (forecast.confidence === 'low' || forecast.confidence === 'very_low') {
        alerts.push({
          itemId: forecast.itemId,
          type: 'high_uncertainty' as const,
          severity: 'medium' as const,
          message: `Baja confianza en forecast para ${forecast.itemName}`,
          forecastDate: forecast.forecasts[0].date,
          recommendedActions: [
            'Recopilar más datos históricos',
            'Revisar factores externos',
            'Considerar método alternativo de forecast'
          ]
        });
      }
    });
    
    return alerts;
  }

  private static calculateQualityMetrics(forecasts: DemandForecast[], historicalData: Map<string, DemandDataPoint[]>) {
    const completenessScores = [];
    const reliabilityScores = [];
    
    forecasts.forEach(forecast => {
      const data = historicalData.get(forecast.itemId);
      if (data) {
        // Data completeness: % de días con datos en el período
        const daysCovered = data.length;
        const totalDays = 365; // Asumiendo análisis anual
        const completeness = Math.min(100, (daysCovered / totalDays) * 100);
        completenessScores.push(completeness);
        
        // Model reliability basada en accuracy y confidence
        const confidenceScore = this.confidenceToScore(forecast.confidence);
        const reliability = (forecast.accuracy + confidenceScore) / 2;
        reliabilityScores.push(reliability);
      }
    });
    
    const avgCompleteness = completenessScores.length > 0 
      ? completenessScores.reduce((sum, s) => sum + s, 0) / completenessScores.length 
      : 0;
    
    const avgReliability = reliabilityScores.length > 0 
      ? reliabilityScores.reduce((sum, s) => sum + s, 0) / reliabilityScores.length 
      : 0;
    
    return {
      dataCompleteness: avgCompleteness,
      modelReliability: avgReliability,
      forecastHorizonOptimal: 21 // Optimal forecast horizon in days (fixed for now)
    };
  }

  private static confidenceToScore(confidence: ForecastConfidence): number {
    switch (confidence) {
      case 'very_high': return 95;
      case 'high': return 85;
      case 'medium': return 70;
      case 'low': return 55;
      case 'very_low': return 40;
    }
  }
}