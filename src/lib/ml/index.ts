// ML Library Index - Complete Machine Learning and AI integration for G-Admin Mini
// Centralized exports for all ML/AI functionality including predictions, recommendations, and self-healing

// ===== CORE ML ENGINE =====
import { logger } from '@/lib/logging';

export {
  MLEngine,
  mlEngine,
  TimeSeriesForecastEngine,
  initializeML,
  getDemandForecast,
  getSalesForecast,
  getInventoryForecast
} from './core/MLEngine';

import {
  mlEngine,
  getDemandForecast,
  getSalesForecast,
  getInventoryForecast
} from './core/MLEngine';

import type {
  DataPoint,
  TimeSeries,
  ForecastResult,
  MLModel,
  PredictionRequest
} from './core/MLEngine';

// ===== PREDICTIVE INVENTORY =====
export {
  PredictiveInventoryManager,
  predictiveInventory,
  initializePredictiveInventory,
  getReorderRecommendations,
  optimizeInventoryItem,
  processAutoReorder
} from './inventory/PredictiveInventory';

import {
  predictiveInventory,
  getReorderRecommendations
} from './inventory/PredictiveInventory';

import type {
  InventoryItem,
  PredictiveMetrics,
  ReorderRecommendation,
  InventoryOptimization
} from './inventory/PredictiveInventory';

// ===== SMART RECOMMENDATIONS =====
export {
  SmartRecommendationEngine,
  smartRecommendations,
  generateMenuRecommendations,
  generatePersonalizedRecommendations,
  generateSalesInsights
} from './recommendations/SmartRecommendations';

import {
  smartRecommendations,
  generateMenuRecommendations,
  generatePersonalizedRecommendations,
  generateSalesInsights
} from './recommendations/SmartRecommendations';

import type {
  MenuItem,
  CustomerProfile,
  MenuRecommendation,
  PersonalizedRecommendation,
  SalesInsight
} from './recommendations/SmartRecommendations';

// ===== ANOMALY DETECTION & SELF-HEALING =====
export {
  AnomalyDetectionEngine,
  anomalyDetection,
  startAnomalyDetection,
  getSystemHealth,
  getActiveAnomalies,
  executeHealingAction
} from './selfhealing/AnomalyDetection';

import {
  anomalyDetection,
  getSystemHealth,
  getActiveAnomalies,
  executeHealingAction
} from './selfhealing/AnomalyDetection';

import type {
  Anomaly,
  HealthMetric,
  SystemHealth,
  HealingAction,
  AnomalyPattern
} from './selfhealing/AnomalyDetection';

// ===== ML INTEGRATION UTILITIES =====

export interface MLSystemConfig {
  // Core ML settings
  mlEngine: {
    enabled: boolean;
    autoInitialize: boolean;
    forecastHorizon: number; // days
    confidenceThreshold: number;
    retryAttempts: number;
  };

  // Predictive inventory
  inventory: {
    enabled: boolean;
    autoReordering: boolean;
    optimizationInterval: number; // hours
    riskTolerance: 'low' | 'medium' | 'high';
    leadTimeBuffer: number; // days
  };

  // Smart recommendations  
  recommendations: {
    enabled: boolean;
    personalization: boolean;
    menuOptimization: boolean;
    analysisInterval: number; // hours
    minConfidence: number;
  };

  // Anomaly detection
  anomalyDetection: {
    enabled: boolean;
    autoHealing: boolean;
    monitoringInterval: number; // seconds
    alertThreshold: 'low' | 'medium' | 'high';
    emergencyActions: boolean;
  };

  // Integration settings
  integration: {
    realtimeUpdates: boolean;
    eventDriven: boolean;
    offlineMode: boolean;
    dataPersistence: boolean;
  };
}

export interface MLSystemStatus {
  initialized: boolean;
  components: {
    mlEngine: 'active' | 'inactive' | 'error';
    predictiveInventory: 'active' | 'inactive' | 'error';
    recommendations: 'active' | 'inactive' | 'error';
    anomalyDetection: 'active' | 'inactive' | 'error';
  };
  lastUpdate: number;
  performance: {
    predictionAccuracy: number;
    averageResponseTime: number;
    systemHealth: number;
    autoHealingSuccess: number;
  };
  statistics: {
    totalPredictions: number;
    successfulReorders: number;
    recommendationsGenerated: number;
    anomaliesDetected: number;
    autoFixesApplied: number;
  };
}

export interface MLInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'optimization' | 'alert';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  confidence: number;
  impact: {
    financial?: number;
    operational?: string;
    customer?: string;
  };
  actions: Array<{
    id: string;
    title: string;
    description: string;
    automated: boolean;
    executed?: boolean;
  }>;
  relatedData?: any;
  timestamp: number;
  expiresAt?: number;
}

// ===== ML SYSTEM MANAGER =====

class MLSystemManager {
  private static instance: MLSystemManager;
  private config: MLSystemConfig;
  private status: MLSystemStatus;
  private insights: MLInsight[] = [];
  private isInitialized = false;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.status = this.getInitialStatus();
  }

  public static getInstance(): MLSystemManager {
    if (!MLSystemManager.instance) {
      MLSystemManager.instance = new MLSystemManager();
    }
    return MLSystemManager.instance;
  }

  /**
   * Initialize the complete ML system
   */
  public async initializeSystem(config: Partial<MLSystemConfig> = {}): Promise<void> {
    if (this.isInitialized) return;

    logger.info('Performance', '🤖 Initializing complete ML system...');
    
    this.config = { ...this.config, ...config };
    const startTime = Date.now();

    try {
      // Initialize core components
      if (this.config.mlEngine.enabled) {
        await this.initializeMLEngine();
      }

      if (this.config.inventory.enabled) {
        await this.initializePredictiveInventory();
      }

      if (this.config.recommendations.enabled) {
        await this.initializeRecommendations();
      }

      if (this.config.anomalyDetection.enabled) {
        await this.initializeAnomalyDetection();
      }

      // Start background processes
      this.startBackgroundProcesses();
      
      // Generate initial insights
      await this.generateInitialInsights();

      this.isInitialized = true;
      this.status.initialized = true;
      this.status.lastUpdate = Date.now();

      const initTime = Date.now() - startTime;
      logger.info('Performance', `✅ ML system initialized successfully in ${initTime}ms`);

      // Emit initialization event
      const { EventBus } = await import('@/lib/events/EventBus');
      const { RestaurantEvents } = await import('@/lib/events/RestaurantEvents');
      
      await EventBus.emit('alerts.generated', {
        alertId: `ml_system_init_${Date.now()}`,
        alertType: 'system',
        severity: 'info',
        title: 'ML System Initialized',
        description: `Advanced ML capabilities now active with ${Object.values(this.status.components).filter(s => s === 'active').length} components`,
        estimatedImpact: 0,
        autoActionsTriggered: [],
        timestamp: new Date().toISOString()
      }, 'MLSystem');

    } catch (error) {
      logger.error('Performance', '❌ ML system initialization failed:', error);
      this.status.initialized = false;
      throw error;
    }
  }

  /**
   * Initialize ML Engine
   */
  private async initializeMLEngine(): Promise<void> {
    try {
      await mlEngine.initialize();
      this.status.components.mlEngine = 'active';
    } catch (error) {
      logger.error('Performance', 'ML Engine initialization failed:', error);
      this.status.components.mlEngine = 'error';
    }
  }

  /**
   * Initialize Predictive Inventory
   */
  private async initializePredictiveInventory(): Promise<void> {
    try {
      await predictiveInventory.runOptimization();
      this.status.components.predictiveInventory = 'active';
    } catch (error) {
      logger.error('Performance', 'Predictive Inventory initialization failed:', error);
      this.status.components.predictiveInventory = 'error';
    }
  }

  /**
   * Initialize Smart Recommendations
   */
  private async initializeRecommendations(): Promise<void> {
    try {
      await smartRecommendations.generateMenuRecommendations();
      this.status.components.recommendations = 'active';
    } catch (error) {
      logger.error('Performance', 'Smart Recommendations initialization failed:', error);
      this.status.components.recommendations = 'error';
    }
  }

  /**
   * Initialize Anomaly Detection
   */
  private async initializeAnomalyDetection(): Promise<void> {
    try {
      anomalyDetection.startMonitoring();
      this.status.components.anomalyDetection = 'active';
    } catch (error) {
      logger.error('Performance', 'Anomaly Detection initialization failed:', error);
      this.status.components.anomalyDetection = 'error';
    }
  }

  /**
   * Start background processes
   */
  private startBackgroundProcesses(): void {
    // Update system status every minute
    setInterval(() => {
      this.updateSystemStatus();
    }, 60000);

    // Generate insights every 30 minutes
    setInterval(() => {
      this.generateInsights();
    }, 30 * 60 * 1000);

    // Cleanup old insights every hour
    setInterval(() => {
      this.cleanupInsights();
    }, 60 * 60 * 1000);
  }

  /**
   * Update system status
   */
  private async updateSystemStatus(): Promise<void> {
    try {
      // Update performance metrics
      const systemHealth = anomalyDetection.getSystemHealth();
      this.status.performance.systemHealth = systemHealth.score;
      
      // Update statistics
      this.status.statistics.anomaliesDetected = systemHealth.activeAnomalies.length;
      
      // Calculate prediction accuracy (simplified)
      this.status.performance.predictionAccuracy = 0.85; // Would come from actual ML metrics
      
      this.status.lastUpdate = Date.now();

    } catch (error) {
      logger.error('Performance', 'Failed to update system status:', error);
    }
  }

  /**
   * Generate comprehensive insights
   */
  public async generateInsights(): Promise<MLInsight[]> {
    const newInsights: MLInsight[] = [];

    try {
      // Get inventory insights
      if (this.status.components.predictiveInventory === 'active') {
        const inventoryOptimization = predictiveInventory.getLastOptimization();
        const criticalRecommendations = inventoryOptimization.recommendations
          .filter(r => r.urgency === 'critical');

        if (criticalRecommendations.length > 0) {
          newInsights.push({
            id: `inventory_critical_${Date.now()}`,
            type: 'alert',
            priority: 'critical',
            title: `${criticalRecommendations.length} Critical Inventory Issues`,
            description: `Immediate action required for ${criticalRecommendations.length} items to prevent stockouts`,
            confidence: 0.95,
            impact: {
              financial: criticalRecommendations.reduce((sum, r) => sum + r.estimatedCost, 0),
              operational: 'Potential stockouts and service disruption',
              customer: 'Menu items may become unavailable'
            },
            actions: criticalRecommendations.map(r => ({
              id: `reorder_${r.itemId}`,
              title: `Order ${r.recommendedOrderQuantity} ${r.itemName}`,
              description: r.reason,
              automated: this.config.inventory.autoReordering
            })),
            relatedData: criticalRecommendations,
            timestamp: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
          });
        }
      }

      // Get menu optimization insights
      if (this.status.components.recommendations === 'active') {
        const menuRecommendations = await smartRecommendations.generateMenuRecommendations();
        const highPriorityRecs = menuRecommendations.filter(r => r.priority === 'high');

        if (highPriorityRecs.length > 0) {
          newInsights.push({
            id: `menu_optimization_${Date.now()}`,
            type: 'optimization',
            priority: 'medium',
            title: `${highPriorityRecs.length} Menu Optimization Opportunities`,
            description: `High-impact recommendations to improve menu performance`,
            confidence: 0.8,
            impact: {
              financial: highPriorityRecs.reduce((sum, r) => sum + (r.expectedImpact.revenueChange || 0), 0),
              operational: 'Improved menu efficiency and profitability'
            },
            actions: highPriorityRecs.map(r => ({
              id: `menu_${r.type}_${r.itemId}`,
              title: r.actionRequired,
              description: r.reasoning,
              automated: false
            })),
            relatedData: highPriorityRecs,
            timestamp: Date.now(),
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
          });
        }
      }

      // Get sales insights
      if (this.status.components.recommendations === 'active') {
        const salesInsights = await smartRecommendations.generateSalesInsights();
        const highImpactInsights = salesInsights.filter(i => i.impact === 'high');

        highImpactInsights.forEach(insight => {
          newInsights.push({
            id: `sales_${insight.type}_${Date.now()}`,
            type: insight.type === 'trend' ? 'prediction' : 'recommendation',
            priority: 'medium',
            title: insight.title,
            description: insight.description,
            confidence: insight.confidence,
            impact: {
              operational: insight.data.metric,
              customer: 'Revenue and customer experience impact'
            },
            actions: insight.recommendations.map((rec, index) => ({
              id: `sales_action_${index}`,
              title: rec,
              description: `Based on ${insight.data.metric} analysis`,
              automated: false
            })),
            relatedData: insight,
            timestamp: Date.now(),
            expiresAt: Date.now() + (3 * 24 * 60 * 60 * 1000) // 3 days
          });
        });
      }

      // Get system health insights
      if (this.status.components.anomalyDetection === 'active') {
        const systemHealth = anomalyDetection.getSystemHealth();
        const activeAnomalies = systemHealth.activeAnomalies;

        if (systemHealth.overall !== 'healthy') {
          newInsights.push({
            id: `system_health_${Date.now()}`,
            type: 'alert',
            priority: systemHealth.overall === 'critical' ? 'critical' : 'high',
            title: `System Health: ${systemHealth.overall.toUpperCase()}`,
            description: `System health score: ${systemHealth.score}/100 with ${activeAnomalies.length} active anomalies`,
            confidence: 1.0,
            impact: {
              operational: 'System performance and reliability',
              customer: systemHealth.overall === 'critical' ? 'Service may be affected' : 'Minor performance impact'
            },
            actions: activeAnomalies
              .filter(a => a.autoFixable)
              .flatMap(a => a.suggestedActions.map(action => ({
                id: `healing_${action}`,
                title: action.replace('_', ' ').toUpperCase(),
                description: `Auto-fix for ${a.title}`,
                automated: this.config.anomalyDetection.autoHealing
              }))),
            relatedData: { systemHealth, activeAnomalies },
            timestamp: Date.now(),
            expiresAt: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
          });
        }
      }

      // Add new insights and remove old ones
      this.insights = [...this.insights, ...newInsights];
      this.cleanupInsights();

      return newInsights;

    } catch (error) {
      logger.error('Performance', 'Failed to generate ML insights:', error);
      return [];
    }
  }

  /**
   * Generate initial insights on system startup
   */
  private async generateInitialInsights(): Promise<void> {
    await this.generateInsights();
  }

  /**
   * Clean up expired insights
   */
  private cleanupInsights(): void {
    const now = Date.now();
    this.insights = this.insights.filter(insight => 
      !insight.expiresAt || insight.expiresAt > now
    );

    // Keep only last 50 insights for performance
    if (this.insights.length > 50) {
      this.insights = this.insights
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50);
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): MLSystemConfig {
    return {
      mlEngine: {
        enabled: true,
        autoInitialize: true,
        forecastHorizon: 7,
        confidenceThreshold: 0.7,
        retryAttempts: 3
      },
      inventory: {
        enabled: true,
        autoReordering: false, // Manual approval by default
        optimizationInterval: 4,
        riskTolerance: 'medium',
        leadTimeBuffer: 2
      },
      recommendations: {
        enabled: true,
        personalization: true,
        menuOptimization: true,
        analysisInterval: 6,
        minConfidence: 0.6
      },
      anomalyDetection: {
        enabled: true,
        autoHealing: true,
        monitoringInterval: 30,
        alertThreshold: 'medium',
        emergencyActions: true
      },
      integration: {
        realtimeUpdates: true,
        eventDriven: true,
        offlineMode: true,
        dataPersistence: true
      }
    };
  }

  /**
   * Get initial status
   */
  private getInitialStatus(): MLSystemStatus {
    return {
      initialized: false,
      components: {
        mlEngine: 'inactive',
        predictiveInventory: 'inactive',
        recommendations: 'inactive',
        anomalyDetection: 'inactive'
      },
      lastUpdate: Date.now(),
      performance: {
        predictionAccuracy: 0,
        averageResponseTime: 0,
        systemHealth: 100,
        autoHealingSuccess: 0
      },
      statistics: {
        totalPredictions: 0,
        successfulReorders: 0,
        recommendationsGenerated: 0,
        anomaliesDetected: 0,
        autoFixesApplied: 0
      }
    };
  }

  // Public API methods
  public getConfig(): MLSystemConfig {
    return { ...this.config };
  }

  public getStatus(): MLSystemStatus {
    return { ...this.status };
  }

  public getInsights(): MLInsight[] {
    return [...this.insights];
  }

  public async updateConfig(config: Partial<MLSystemConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    
    // Restart components if needed
    if (this.isInitialized) {
      await this.initializeSystem(this.config);
    }
  }

  public shutdown(): void {
    if (this.status.components.anomalyDetection === 'active') {
      anomalyDetection.stopMonitoring();
    }
    
    if (this.status.components.predictiveInventory === 'active') {
      predictiveInventory.shutdown();
    }

    if (this.status.components.mlEngine === 'active') {
      mlEngine.shutdown();
    }

    this.isInitialized = false;
    this.status.initialized = false;
    
    logger.info('Performance', '🔌 ML system shutdown completed');
  }
}

// Global instance
export const mlSystem = MLSystemManager.getInstance();

// Convenience functions
export const initializeMLSystem = (config?: Partial<MLSystemConfig>) => 
  mlSystem.initializeSystem(config);

export const getMLSystemStatus = () => mlSystem.getStatus();

export const getMLInsights = () => mlSystem.getInsights();

export const updateMLConfig = (config: Partial<MLSystemConfig>) => 
  mlSystem.updateConfig(config);

// Advanced utilities
export const generateComprehensiveReport = async (): Promise<{
  systemStatus: MLSystemStatus;
  insights: MLInsight[];
  predictions: {
    sales: ForecastResult;
    inventory: InventoryOptimization;
    systemHealth: SystemHealth;
  };
  recommendations: {
    menu: MenuRecommendation[];
    reorders: ReorderRecommendation[];
    performance: string[];
  };
}> => {
  const systemStatus = mlSystem.getStatus();
  const insights = mlSystem.getInsights();
  
  // Generate fresh predictions
  const salesForecast = await getSalesForecast(7);
  const inventoryOptimization = predictiveInventory.getLastOptimization();
  const systemHealth = getSystemHealth();
  
  // Get recommendations
  const menuRecommendations = await generateMenuRecommendations();
  const reorderRecommendations = getReorderRecommendations();
  
  // System performance recommendations
  const performanceRecommendations: string[] = [];
  if (systemHealth.score < 80) {
    performanceRecommendations.push('Consider optimizing system performance');
  }
  if (inventoryOptimization.itemsNeedingAttention > 5) {
    performanceRecommendations.push('High number of inventory items need attention');
  }
  if (systemHealth.activeAnomalies.length > 3) {
    performanceRecommendations.push('Multiple system anomalies detected - investigate infrastructure');
  }

  return {
    systemStatus,
    insights,
    predictions: {
      sales: salesForecast,
      inventory: inventoryOptimization,
      systemHealth
    },
    recommendations: {
      menu: menuRecommendations,
      reorders: reorderRecommendations,
      performance: performanceRecommendations
    }
  };
};

export default mlSystem;