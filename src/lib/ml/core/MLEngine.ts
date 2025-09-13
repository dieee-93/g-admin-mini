// MLEngine.ts - Advanced Machine Learning Engine for G-Admin Mini
// Provides demand forecasting, pattern recognition, and predictive analytics

import { EventBus } from '@/lib/events';
import { EventBus } from '@/lib/events';

// ===== CORE ML INTERFACES =====

export interface DataPoint {
  timestamp: number;
  value: number;
  metadata?: Record<string, any>;
}

export interface TimeSeries {
  id: string;
  name: string;
  data: DataPoint[];
  category: 'sales' | 'inventory' | 'staff' | 'kitchen' | 'customer';
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

export interface ForecastResult {
  predictions: Array<{
    timestamp: number;
    value: number;
    confidence: number;
    upperBound: number;
    lowerBound: number;
  }>;
  accuracy: number;
  model: string;
  metadata: {
    seasonality: boolean;
    trend: 'increasing' | 'decreasing' | 'stable';
    volatility: number;
    lastTrainingDate: number;
    dataPoints: number;
  };
}

export interface MLModel {
  id: string;
  name: string;
  type: 'regression' | 'classification' | 'clustering' | 'timeseries';
  status: 'training' | 'ready' | 'error' | 'updating';
  accuracy: number;
  lastTrained: number;
  features: string[];
  hyperparameters: Record<string, any>;
}

export interface PredictionRequest {
  modelId: string;
  features: Record<string, any>;
  horizon?: number; // For time series predictions
  confidence?: number; // Minimum confidence threshold
}

// ===== TIME SERIES FORECASTING ENGINE =====

export class TimeSeriesForecastEngine {
  private models = new Map<string, MLModel>();
  private trainingData = new Map<string, TimeSeries>();
  private cache = new Map<string, { result: ForecastResult; timestamp: number; ttl: number }>();

  /**
   * Simple Moving Average forecast
   */
  private simpleMovingAverage(data: number[], window: number = 7): number[] {
    const result: number[] = [];
    
    for (let i = window - 1; i < data.length; i++) {
      const sum = data.slice(i - window + 1, i + 1).reduce((acc, val) => acc + val, 0);
      result.push(sum / window);
    }
    
    return result;
  }

  /**
   * Exponential Smoothing forecast
   */
  private exponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
    const result: number[] = [data[0]];
    
    for (let i = 1; i < data.length; i++) {
      const smoothed = alpha * data[i] + (1 - alpha) * result[i - 1];
      result.push(smoothed);
    }
    
    return result;
  }

  /**
   * Seasonal decomposition and forecasting
   */
  private seasonalForecast(data: number[], seasonLength: number = 7): {
    trend: number[];
    seasonal: number[];
    residual: number[];
    forecast: number[];
  } {
    // Simple seasonal decomposition
    const trend = this.simpleMovingAverage(data, seasonLength);
    const seasonal: number[] = [];
    const residual: number[] = [];
    
    // Calculate seasonal components
    for (let i = 0; i < data.length; i++) {
      const seasonIndex = i % seasonLength;
      const trendValue = trend[Math.max(0, i - Math.floor(seasonLength / 2))] || data[i];
      
      if (!seasonal[seasonIndex]) {
        seasonal[seasonIndex] = 0;
      }
      
      seasonal[seasonIndex] += (data[i] - trendValue);
    }
    
    // Average seasonal components
    for (let i = 0; i < seasonal.length; i++) {
      seasonal[i] /= Math.floor(data.length / seasonLength);
    }
    
    // Calculate residuals
    for (let i = 0; i < data.length; i++) {
      const seasonIndex = i % seasonLength;
      const trendValue = trend[Math.max(0, i - Math.floor(seasonLength / 2))] || data[i];
      residual.push(data[i] - trendValue - seasonal[seasonIndex]);
    }
    
    // Generate forecast
    const lastTrendValue = trend[trend.length - 1] || data[data.length - 1];
    const forecast: number[] = [];
    
    for (let i = 0; i < seasonLength; i++) {
      const seasonIndex = i % seasonLength;
      forecast.push(Math.max(0, lastTrendValue + seasonal[seasonIndex]));
    }
    
    return { trend, seasonal, residual, forecast };
  }

  /**
   * Linear regression for trend analysis
   */
  private linearRegression(data: number[]): { slope: number; intercept: number; r2: number } {
    const n = data.length;
    if (n < 2) return { slope: 0, intercept: data[0] || 0, r2: 0 };
    
    const x = data.map((_, i) => i);
    const y = data;
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R²
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
   * Advanced time series forecast combining multiple methods
   */
  public async forecast(
    seriesId: string, 
    horizon: number = 7,
    options: {
      method?: 'auto' | 'sma' | 'ema' | 'seasonal' | 'linear';
      seasonLength?: number;
      alpha?: number;
      window?: number;
    } = {}
  ): Promise<ForecastResult> {
    const { method = 'auto', seasonLength = 7, alpha = 0.3, window = 7 } = options;
    
    // Check cache first
    const cacheKey = `${seriesId}_${horizon}_${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      return cached.result;
    }

    const series = this.trainingData.get(seriesId);
    if (!series || series.data.length < 3) {
      throw new Error(`Insufficient data for series ${seriesId}`);
    }

    const values = series.data.map(d => d.value);
    const timestamps = series.data.map(d => d.timestamp);
    const lastTimestamp = Math.max(...timestamps);
    
    let predictions: number[] = [];
    let modelName = '';
    let accuracy = 0;

    // Choose best method
    if (method === 'auto') {
      // Simple auto-selection based on data characteristics
      const hasSeasonality = values.length >= seasonLength * 2;
      const regression = this.linearRegression(values);
      const hasTrend = Math.abs(regression.slope) > 0.1;
      
      if (hasSeasonality && hasTrend) {
        const seasonal = this.seasonalForecast(values, seasonLength);
        predictions = seasonal.forecast.slice(0, horizon);
        modelName = 'seasonal_decomposition';
        accuracy = Math.max(0, 1 - (seasonal.residual.reduce((sum, r) => sum + Math.abs(r), 0) / values.length / Math.max(...values)));
      } else if (hasTrend) {
        // Linear trend extrapolation
        predictions = Array.from({ length: horizon }, (_, i) => 
          Math.max(0, regression.slope * (values.length + i) + regression.intercept)
        );
        modelName = 'linear_regression';
        accuracy = regression.r2;
      } else {
        // Use exponential smoothing for stable series
        const smoothed = this.exponentialSmoothing(values, alpha);
        const lastValue = smoothed[smoothed.length - 1];
        predictions = Array.from({ length: horizon }, () => lastValue);
        modelName = 'exponential_smoothing';
        accuracy = 0.8; // Default accuracy for stable series
      }
    } else {
      // Use specified method
      switch (method) {
        case 'sma':
          const sma = this.simpleMovingAverage(values, window);
          const lastSMA = sma[sma.length - 1];
          predictions = Array.from({ length: horizon }, () => lastSMA);
          modelName = 'simple_moving_average';
          accuracy = 0.7;
          break;
          
        case 'ema':
          const ema = this.exponentialSmoothing(values, alpha);
          const lastEMA = ema[ema.length - 1];
          predictions = Array.from({ length: horizon }, () => lastEMA);
          modelName = 'exponential_smoothing';
          accuracy = 0.75;
          break;
          
        case 'seasonal':
          const seasonal = this.seasonalForecast(values, seasonLength);
          predictions = seasonal.forecast.slice(0, horizon);
          modelName = 'seasonal_decomposition';
          accuracy = 0.8;
          break;
          
        case 'linear':
          const regression = this.linearRegression(values);
          predictions = Array.from({ length: horizon }, (_, i) => 
            Math.max(0, regression.slope * (values.length + i) + regression.intercept)
          );
          modelName = 'linear_regression';
          accuracy = regression.r2;
          break;
      }
    }

    // Calculate confidence intervals (simplified approach)
    const variance = values.reduce((sum, val) => {
      const mean = values.reduce((s, v) => s + v, 0) / values.length;
      return sum + Math.pow(val - mean, 2);
    }, 0) / values.length;
    
    const stdDev = Math.sqrt(variance);
    const confidenceMultiplier = 1.96; // 95% confidence interval

    // Generate forecast result
    const forecastResult: ForecastResult = {
      predictions: predictions.map((value, index) => {
        const timestamp = lastTimestamp + (index + 1) * (24 * 60 * 60 * 1000); // Daily intervals
        const confidence = Math.max(0.1, accuracy - (index * 0.05)); // Decreasing confidence
        
        return {
          timestamp,
          value: Math.max(0, value),
          confidence,
          upperBound: Math.max(0, value + confidenceMultiplier * stdDev),
          lowerBound: Math.max(0, value - confidenceMultiplier * stdDev)
        };
      }),
      accuracy,
      model: modelName,
      metadata: {
        seasonality: modelName.includes('seasonal'),
        trend: this.determineTrend(values),
        volatility: stdDev / (values.reduce((s, v) => s + v, 0) / values.length),
        lastTrainingDate: Date.now(),
        dataPoints: values.length
      }
    };

    // Cache result
    this.cache.set(cacheKey, {
      result: forecastResult,
      timestamp: Date.now(),
      ttl: 30 * 60 * 1000 // 30 minutes TTL
    });

    return forecastResult;
  }

  private determineTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const regression = this.linearRegression(values);
    const threshold = 0.05; // 5% of mean value
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    if (regression.slope > threshold * mean) return 'increasing';
    if (regression.slope < -threshold * mean) return 'decreasing';
    return 'stable';
  }

  /**
   * Add training data for a time series
   */
  public addTrainingData(series: TimeSeries): void {
    // Sort data by timestamp
    series.data.sort((a, b) => a.timestamp - b.timestamp);
    
    const existing = this.trainingData.get(series.id);
    if (existing) {
      // Merge new data with existing, avoiding duplicates
      const existingTimestamps = new Set(existing.data.map(d => d.timestamp));
      const newData = series.data.filter(d => !existingTimestamps.has(d.timestamp));
      existing.data.push(...newData);
      existing.data.sort((a, b) => a.timestamp - b.timestamp);
      
      // Keep only last 1000 data points for performance
      if (existing.data.length > 1000) {
        existing.data = existing.data.slice(-1000);
      }
    } else {
      this.trainingData.set(series.id, series);
    }

    // Clear cache for this series
    Array.from(this.cache.keys())
      .filter(key => key.startsWith(series.id))
      .forEach(key => this.cache.delete(key));
  }

  /**
   * Get available time series
   */
  public getAvailableSeries(): Array<{ id: string; name: string; category: string; dataPoints: number }> {
    return Array.from(this.trainingData.values()).map(series => ({
      id: series.id,
      name: series.name,
      category: series.category,
      dataPoints: series.data.length
    }));
  }

  /**
   * Clear cache and retrain models
   */
  public invalidateCache(): void {
    this.cache.clear();
  }
}

// ===== MAIN ML ENGINE =====

export class MLEngine {
  private static instance: MLEngine;
  private forecastEngine: TimeSeriesForecastEngine;
  private isInitialized = false;
  private eventListeners: Array<() => void> = [];

  private constructor() {
    this.forecastEngine = new TimeSeriesForecastEngine();
    this.initializeEventListeners();
  }

  public static getInstance(): MLEngine {
    if (!MLEngine.instance) {
      MLEngine.instance = new MLEngine();
    }
    return MLEngine.instance;
  }

  /**
   * Initialize ML engine and start data collection
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🤖 Initializing ML Engine...');
    
    try {
      // Initialize training data collection
      await this.initializeTrainingData();
      
      // Start background data processing
      this.startBackgroundProcessing();
      
      this.isInitialized = true;
      console.log('✅ ML Engine initialized successfully');
      
    } catch (error) {
      console.error('❌ ML Engine initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize event listeners for real-time data collection
   */
  private initializeEventListeners(): void {
    // Listen for sales data
    const salesListener = EventBus.on('sales.completed', async (event) => {
      await this.processSaleData(event.payload);
    });

    // Listen for inventory updates
    const inventoryListener = EventBus.on('inventory.stock_adjusted', async (event) => {
      await this.processInventoryData(event.payload);
    });

    // Listen for order events
    const orderListener = EventBus.on('sales.order.placed', async (event) => {
      await this.processOrderData(event.payload);
    });

    this.eventListeners.push(salesListener, inventoryListener, orderListener);
  }

  /**
   * Process sales data for ML training
   */
  private async processSaleData(saleData: unknown): Promise<void> {
    try {
      const timeSeries: TimeSeries = {
        id: 'daily_sales',
        name: 'Daily Sales Revenue',
        category: 'sales',
        frequency: 'daily',
        data: [{
          timestamp: Date.now(),
          value: saleData.totalAmount || 0,
          metadata: {
            items: saleData.items?.length || 0,
            customerId: saleData.customerId,
            paymentMethod: saleData.paymentMethod
          }
        }]
      };

      this.forecastEngine.addTrainingData(timeSeries);
    } catch (error) {
      console.error('Error processing sale data for ML:', error);
    }
  }

  /**
   * Process inventory data for ML training
   */
  private async processInventoryData(inventoryData: unknown): Promise<void> {
    try {
      const timeSeries: TimeSeries = {
        id: `inventory_${inventoryData.itemId}`,
        name: `Inventory: ${inventoryData.itemName}`,
        category: 'inventory',
        frequency: 'daily',
        data: [{
          timestamp: Date.now(),
          value: inventoryData.currentStock || 0,
          metadata: {
            adjustment: inventoryData.adjustment,
            reason: inventoryData.reason,
            supplierId: inventoryData.supplierId
          }
        }]
      };

      this.forecastEngine.addTrainingData(timeSeries);
    } catch (error) {
      console.error('Error processing inventory data for ML:', error);
    }
  }

  /**
   * Process order data for demand forecasting
   */
  private async processOrderData(orderData: unknown): Promise<void> {
    try {
      // Process each item in the order
      orderData.items?.forEach((item: unknown) => {
        const timeSeries: TimeSeries = {
          id: `demand_${item.productId}`,
          name: `Demand: ${item.productId}`,
          category: 'sales',
          frequency: 'hourly',
          data: [{
            timestamp: Date.now(),
            value: item.quantity || 0,
            metadata: {
              orderId: orderData.orderId,
              customerId: orderData.customerId,
              orderType: orderData.orderType
            }
          }]
        };

        this.forecastEngine.addTrainingData(timeSeries);
      });
    } catch (error) {
      console.error('Error processing order data for ML:', error);
    }
  }

  /**
   * Initialize training data from historical records
   */
  private async initializeTrainingData(): Promise<void> {
    // This would typically load historical data from the database
    console.log('📚 Loading historical data for ML training...');
    
    // For now, we'll generate some sample data to bootstrap the system
    const sampleSalesData = this.generateSampleData('sales', 30);
    const sampleInventoryData = this.generateSampleData('inventory', 30);
    
    this.forecastEngine.addTrainingData(sampleSalesData);
    this.forecastEngine.addTrainingData(sampleInventoryData);
  }

  /**
   * Generate sample data for testing (remove in production)
   */
  private generateSampleData(type: 'sales' | 'inventory', days: number): TimeSeries {
    const data: DataPoint[] = [];
    const now = Date.now();
    const baseValue = type === 'sales' ? 1000 : 100;
    
    for (let i = 0; i < days; i++) {
      const timestamp = now - (days - i) * 24 * 60 * 60 * 1000;
      const trend = i * (type === 'sales' ? 10 : -2); // Sales growing, inventory decreasing
      const seasonal = Math.sin(i * 2 * Math.PI / 7) * (baseValue * 0.2); // Weekly pattern
      const noise = (Math.random() - 0.5) * (baseValue * 0.1);
      const value = Math.max(0, baseValue + trend + seasonal + noise);
      
      data.push({
        timestamp,
        value,
        metadata: { generated: true, day: i }
      });
    }

    return {
      id: `sample_${type}`,
      name: `Sample ${type.charAt(0).toUpperCase() + type.slice(1)} Data`,
      category: type,
      frequency: 'daily',
      data
    };
  }

  /**
   * Start background processing for continuous learning
   */
  private startBackgroundProcessing(): void {
    // Process data every hour
    setInterval(async () => {
      try {
        await this.processBackgroundTasks();
      } catch (error) {
        console.error('Background ML processing error:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Background processing tasks
   */
  private async processBackgroundTasks(): Promise<void> {
    console.log('🔄 Running background ML processing...');
    
    // Clear old cache entries
    this.forecastEngine.invalidateCache();
    
    // Generate predictions for key metrics
    const series = this.forecastEngine.getAvailableSeries();
    
    for (const seriesInfo of series.slice(0, 5)) { // Limit to avoid overload
      try {
        await this.forecastEngine.forecast(seriesInfo.id, 7);
      } catch (error) {
        console.warn(`Failed to generate forecast for ${seriesInfo.id}:`, error);
      }
    }
    
    console.log('✅ Background ML processing completed');
  }

  /**
   * Public API Methods
   */

  public async getDemandForecast(
    productId: string, 
    horizon: number = 7
  ): Promise<ForecastResult> {
    return this.forecastEngine.forecast(`demand_${productId}`, horizon);
  }

  public async getSalesForecast(horizon: number = 7): Promise<ForecastResult> {
    return this.forecastEngine.forecast('daily_sales', horizon);
  }

  public async getInventoryForecast(
    itemId: string, 
    horizon: number = 7
  ): Promise<ForecastResult> {
    return this.forecastEngine.forecast(`inventory_${itemId}`, horizon);
  }

  public getAvailableModels(): Array<{ id: string; name: string; category: string; dataPoints: number }> {
    return this.forecastEngine.getAvailableSeries();
  }

  /**
   * Cleanup and shutdown
   */
  public shutdown(): void {
    this.eventListeners.forEach(unsubscribe => unsubscribe());
    this.eventListeners = [];
    this.isInitialized = false;
  }
}

// Global instance
export const mlEngine = MLEngine.getInstance();

// Utility functions
export const initializeML = () => mlEngine.initialize();
export const getDemandForecast = (productId: string, horizon?: number) => 
  mlEngine.getDemandForecast(productId, horizon);
export const getSalesForecast = (horizon?: number) => 
  mlEngine.getSalesForecast(horizon);
export const getInventoryForecast = (itemId: string, horizon?: number) => 
  mlEngine.getInventoryForecast(itemId, horizon);

export default mlEngine;