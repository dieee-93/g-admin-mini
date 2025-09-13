// AnomalyDetection.ts - Advanced anomaly detection and self-healing system
// Monitors system health, detects issues, and applies automated fixes

import { EventBus } from '@/lib/events';
import { EventBus } from '@/lib/events';
import { mlEngine } from '../core/MLEngine';
import { bundleOptimizer } from '@/lib/performance/BundleOptimizer';

// ===== INTERFACES =====

export interface Anomaly {
  id: string;
  type: 'performance' | 'data' | 'business' | 'system' | 'user_behavior';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  detectedAt: number;
  source: string;
  metrics: Record<string, number>;
  threshold: {
    expected: number;
    actual: number;
    deviation: number;
  };
  impact: {
    affectedSystems: string[];
    estimatedLoss?: number;
    userImpact: 'none' | 'minor' | 'moderate' | 'severe';
  };
  autoFixable: boolean;
  suggestedActions: string[];
  context?: Record<string, any>;
}

export interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: {
    warning: number;
    critical: number;
  };
  trend: 'improving' | 'stable' | 'degrading';
  lastUpdated: number;
  history: Array<{
    timestamp: number;
    value: number;
  }>;
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  score: number; // 0-100
  metrics: HealthMetric[];
  activeAnomalies: Anomaly[];
  lastCheck: number;
  uptime: number;
  autoHealingStatus: 'active' | 'disabled' | 'maintenance';
}

export interface HealingAction {
  id: string;
  type: 'restart_service' | 'clear_cache' | 'adjust_settings' | 'scale_resources' | 'notify_admin';
  description: string;
  priority: number; // 1-10
  estimatedExecutionTime: number; // milliseconds
  prerequisites: string[];
  rollbackable: boolean;
  execute: () => Promise<boolean>;
  rollback?: () => Promise<boolean>;
}

export interface AnomalyPattern {
  signature: string;
  matchCriteria: Array<{
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'between';
    value: number | [number, number];
  }>;
  confidence: number;
  historicalOccurrences: number;
  successfulHealingRate: number;
  recommendedActions: string[];
}

// ===== ANOMALY DETECTION ENGINE =====

export class AnomalyDetectionEngine {
  private static instance: AnomalyDetectionEngine;
  private metrics = new Map<string, HealthMetric>();
  private anomalies = new Map<string, Anomaly>();
  private patterns: AnomalyPattern[] = [];
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private healingActions = new Map<string, HealingAction>();
  private executedActions: Array<{ actionId: string; timestamp: number; success: boolean }> = [];

  private constructor() {
    this.initializeBaseMetrics();
    this.initializeHealingActions();
    this.initializeAnomalyPatterns();
    this.initializeEventListeners();
  }

  public static getInstance(): AnomalyDetectionEngine {
    if (!AnomalyDetectionEngine.instance) {
      AnomalyDetectionEngine.instance = new AnomalyDetectionEngine();
    }
    return AnomalyDetectionEngine.instance;
  }

  /**
   * Initialize base health metrics to monitor
   */
  private initializeBaseMetrics(): void {
    const baseMetrics: Array<Omit<HealthMetric, 'value' | 'status' | 'trend' | 'lastUpdated' | 'history'>> = [
      {
        name: 'response_time',
        unit: 'ms',
        threshold: { warning: 1000, critical: 3000 }
      },
      {
        name: 'memory_usage',
        unit: 'MB',
        threshold: { warning: 100, critical: 200 }
      },
      {
        name: 'error_rate',
        unit: '%',
        threshold: { warning: 2, critical: 5 }
      },
      {
        name: 'offline_sync_queue',
        unit: 'operations',
        threshold: { warning: 50, critical: 100 }
      },
      {
        name: 'failed_predictions',
        unit: 'count',
        threshold: { warning: 5, critical: 10 }
      },
      {
        name: 'websocket_disconnections',
        unit: 'count/hour',
        threshold: { warning: 10, critical: 20 }
      },
      {
        name: 'cache_miss_rate',
        unit: '%',
        threshold: { warning: 30, critical: 50 }
      },
      {
        name: 'bundle_load_failures',
        unit: 'count',
        threshold: { warning: 3, critical: 7 }
      }
    ];

    baseMetrics.forEach(metric => {
      this.metrics.set(metric.name, {
        ...metric,
        value: 0,
        status: 'healthy',
        trend: 'stable',
        lastUpdated: Date.now(),
        history: []
      });
    });
  }

  /**
   * Initialize healing actions
   */
  private initializeHealingActions(): void {
    const actions: HealingAction[] = [
      {
        id: 'clear_performance_cache',
        type: 'clear_cache',
        description: 'Clear performance optimization cache to resolve stale data issues',
        priority: 7,
        estimatedExecutionTime: 500,
        prerequisites: [],
        rollbackable: false,
        execute: async () => {
          try {
            // Clear various caches
            if ('lazyLoadingManager' in window) {
              (window as any).lazyLoadingManager.invalidateCache();
            }
            
            // Clear browser cache for static resources
            if ('caches' in window) {
              const cacheNames = await caches.keys();
              await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
              );
            }
            
            console.log('🔧 Performance cache cleared successfully');
            return true;
          } catch (error) {
            console.error('Failed to clear performance cache:', error);
            return false;
          }
        }
      },

      {
        id: 'restart_websocket_connection',
        type: 'restart_service',
        description: 'Restart WebSocket connection to resolve connectivity issues',
        priority: 8,
        estimatedExecutionTime: 2000,
        prerequisites: [],
        rollbackable: true,
        execute: async () => {
          try {
            // Access WebSocket manager through global reference or module
            const wsManager = (window as any).wsManager;
            if (wsManager && typeof wsManager.reconnect === 'function') {
              await wsManager.reconnect();
              console.log('🔧 WebSocket connection restarted successfully');
              return true;
            }
            return false;
          } catch (error) {
            console.error('Failed to restart WebSocket connection:', error);
            return false;
          }
        },
        rollback: async () => {
          // WebSocket connections self-manage, no explicit rollback needed
          return true;
        }
      },

      {
        id: 'optimize_memory_usage',
        type: 'adjust_settings',
        description: 'Trigger garbage collection and optimize memory usage',
        priority: 6,
        estimatedExecutionTime: 1000,
        prerequisites: [],
        rollbackable: false,
        execute: async () => {
          try {
            // Trigger garbage collection if available
            if ('gc' in window && typeof (window as any).gc === 'function') {
              (window as any).gc();
            }

            // Clear unused data structures
            this.cleanupOldData();

            // Optimize bundle loading
            const optimizer = bundleOptimizer;
            if (optimizer && typeof optimizer.optimizeChunkLoadingOrder === 'function') {
              // Get current chunks and optimize their loading order
              const currentChunks = Array.from(document.scripts)
                .map(script => script.src)
                .filter(src => src.includes('chunk'))
                .map(src => src.split('/').pop()?.split('.')[0] || '');
              
              optimizer.optimizeChunkLoadingOrder(currentChunks);
            }

            console.log('🔧 Memory usage optimized successfully');
            return true;
          } catch (error) {
            console.error('Failed to optimize memory usage:', error);
            return false;
          }
        }
      },

      {
        id: 'force_offline_sync',
        type: 'restart_service',
        description: 'Force synchronization of offline operations to clear queue',
        priority: 7,
        estimatedExecutionTime: 5000,
        prerequisites: ['network_available'],
        rollbackable: false,
        execute: async () => {
          try {
            // Access offline sync through module or global reference
            const { forceSync } = await import('@/lib/offline');
            await forceSync();
            console.log('🔧 Offline sync forced successfully');
            return true;
          } catch (error) {
            console.error('Failed to force offline sync:', error);
            return false;
          }
        }
      },

      {
        id: 'reload_ml_models',
        type: 'restart_service',
        description: 'Reload ML models to resolve prediction failures',
        priority: 5,
        estimatedExecutionTime: 3000,
        prerequisites: [],
        rollbackable: false,
        execute: async () => {
          try {
            // Reinitialize ML engine
            await mlEngine.initialize();
            console.log('🔧 ML models reloaded successfully');
            return true;
          } catch (error) {
            console.error('Failed to reload ML models:', error);
            return false;
          }
        }
      },

      {
        id: 'emergency_page_reload',
        type: 'restart_service',
        description: 'Emergency full page reload to resolve critical system issues',
        priority: 10,
        estimatedExecutionTime: 5000,
        prerequisites: [],
        rollbackable: false,
        execute: async () => {
          console.warn('🚨 Emergency page reload initiated');
          // Delay to allow logging and cleanup
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          return true;
        }
      }
    ];

    actions.forEach(action => {
      this.healingActions.set(action.id, action);
    });
  }

  /**
   * Initialize known anomaly patterns
   */
  private initializeAnomalyPatterns(): void {
    this.patterns = [
      {
        signature: 'high_memory_slow_response',
        matchCriteria: [
          { metric: 'memory_usage', operator: 'gt', value: 150 },
          { metric: 'response_time', operator: 'gt', value: 2000 }
        ],
        confidence: 0.9,
        historicalOccurrences: 0,
        successfulHealingRate: 0.85,
        recommendedActions: ['optimize_memory_usage', 'clear_performance_cache']
      },
      {
        signature: 'websocket_connection_issues',
        matchCriteria: [
          { metric: 'websocket_disconnections', operator: 'gt', value: 15 }
        ],
        confidence: 0.95,
        historicalOccurrences: 0,
        successfulHealingRate: 0.9,
        recommendedActions: ['restart_websocket_connection']
      },
      {
        signature: 'offline_sync_overload',
        matchCriteria: [
          { metric: 'offline_sync_queue', operator: 'gt', value: 75 }
        ],
        confidence: 0.8,
        historicalOccurrences: 0,
        successfulHealingRate: 0.7,
        recommendedActions: ['force_offline_sync']
      },
      {
        signature: 'ml_prediction_failures',
        matchCriteria: [
          { metric: 'failed_predictions', operator: 'gt', value: 7 }
        ],
        confidence: 0.85,
        historicalOccurrences: 0,
        successfulHealingRate: 0.75,
        recommendedActions: ['reload_ml_models']
      },
      {
        signature: 'critical_system_failure',
        matchCriteria: [
          { metric: 'error_rate', operator: 'gt', value: 8 },
          { metric: 'response_time', operator: 'gt', value: 5000 }
        ],
        confidence: 0.95,
        historicalOccurrences: 0,
        successfulHealingRate: 1.0,
        recommendedActions: ['emergency_page_reload']
      }
    ];
  }

  /**
   * Initialize event listeners for system monitoring
   */
  private initializeEventListeners(): void {
    // Listen for system errors
    window.addEventListener('error', (event) => {
      this.updateMetric('error_rate', this.calculateErrorRate());
    });

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.updateMetric('error_rate', this.calculateErrorRate());
    });

    // Listen for WebSocket events
    EventBus.on('websocket.disconnected', () => {
      this.incrementMetric('websocket_disconnections');
    });

    // Listen for ML prediction failures
    EventBus.on('alerts.generated', (event) => {
      if (event.payload.alertType === 'system' && 
          event.payload.description.includes('prediction')) {
        this.incrementMetric('failed_predictions');
      }
    });

    // Listen for sync events
    EventBus.on('system.sync_failed', () => {
      // Sync failures might indicate queue issues
      this.checkOfflineSyncQueue();
    });
  }

  /**
   * Start monitoring system health
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;

    console.log('🔍 Starting anomaly detection monitoring...');
    this.isMonitoring = true;

    // Monitor system health every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.detectAnomalies();
      this.performAutoHealing();
    }, 30000);

    // Initial metrics collection
    this.collectMetrics();
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('⏹️ Anomaly detection monitoring stopped');
  }

  /**
   * Collect current system metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      // Response time (simplified measurement)
      const startTime = performance.now();
      await new Promise(resolve => setTimeout(resolve, 1));
      const responseTime = performance.now() - startTime;
      this.updateMetric('response_time', responseTime);

      // Memory usage
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        const memoryMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
        this.updateMetric('memory_usage', memoryMB);
      }

      // Error rate
      this.updateMetric('error_rate', this.calculateErrorRate());

      // Cache miss rate
      const cacheStats = this.calculateCacheMissRate();
      this.updateMetric('cache_miss_rate', cacheStats);

      // Bundle load failures
      const bundleFailures = this.countBundleLoadFailures();
      this.updateMetric('bundle_load_failures', bundleFailures);

      // Offline sync queue size
      await this.checkOfflineSyncQueue();

    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  }

  /**
   * Update a metric value and its history
   */
  private updateMetric(name: string, value: number): void {
    const metric = this.metrics.get(name);
    if (!metric) return;

    const previousValue = metric.value;
    metric.value = value;
    metric.lastUpdated = Date.now();

    // Add to history (keep last 100 points)
    metric.history.push({ timestamp: Date.now(), value });
    if (metric.history.length > 100) {
      metric.history = metric.history.slice(-100);
    }

    // Determine status
    if (value >= metric.threshold.critical) {
      metric.status = 'critical';
    } else if (value >= metric.threshold.warning) {
      metric.status = 'warning';
    } else {
      metric.status = 'healthy';
    }

    // Determine trend
    if (metric.history.length >= 5) {
      const recent = metric.history.slice(-5);
      const avgRecent = recent.reduce((sum, point) => sum + point.value, 0) / recent.length;
      const older = metric.history.slice(-10, -5);
      if (older.length > 0) {
        const avgOlder = older.reduce((sum, point) => sum + point.value, 0) / older.length;
        const change = (avgRecent - avgOlder) / avgOlder;
        
        if (change > 0.1) metric.trend = 'degrading';
        else if (change < -0.1) metric.trend = 'improving';
        else metric.trend = 'stable';
      }
    }
  }

  /**
   * Increment a counter metric
   */
  private incrementMetric(name: string, amount: number = 1): void {
    const metric = this.metrics.get(name);
    if (!metric) return;
    this.updateMetric(name, metric.value + amount);
  }

  /**
   * Calculate current error rate
   */
  private calculateErrorRate(): number {
    // This would typically integrate with error logging system
    // For now, use a simple heuristic based on console errors
    const errors = (window as any).__errorCount || 0;
    const totalRequests = (window as any).__requestCount || 1;
    return (errors / totalRequests) * 100;
  }

  /**
   * Calculate cache miss rate
   */
  private calculateCacheMissRate(): number {
    // Integration with performance system
    try {
      const perfMetrics = bundleOptimizer.getPerformanceMetrics();
      return (1 - perfMetrics.cacheHitRate) * 100;
    } catch (error) {
      return 0; // Default to healthy if unable to measure
    }
  }

  /**
   * Count bundle load failures
   */
  private countBundleLoadFailures(): number {
    // Count failed script loads
    const failedScripts = Array.from(document.scripts)
      .filter(script => script.dataset.loadFailed === 'true');
    return failedScripts.length;
  }

  /**
   * Check offline sync queue size
   */
  private async checkOfflineSyncQueue(): Promise<void> {
    try {
      const { offlineSync } = await import('@/lib/offline');
      const queueSize = offlineSync.getQueueSize();
      this.updateMetric('offline_sync_queue', queueSize);
    } catch (error) {
      // Offline sync not available
      this.updateMetric('offline_sync_queue', 0);
    }
  }

  /**
   * Detect anomalies in current metrics
   */
  private detectAnomalies(): void {
    const currentAnomalies: Anomaly[] = [];

    // Check each metric for threshold violations
    for (const [name, metric] of this.metrics.entries()) {
      if (metric.status === 'critical' || metric.status === 'warning') {
        const anomaly = this.createMetricAnomaly(name, metric);
        if (anomaly) {
          currentAnomalies.push(anomaly);
        }
      }
    }

    // Check for pattern matches
    for (const pattern of this.patterns) {
      const match = this.checkPatternMatch(pattern);
      if (match) {
        const anomaly = this.createPatternAnomaly(pattern, match);
        currentAnomalies.push(anomaly);
      }
    }

    // Update anomalies map
    this.anomalies.clear();
    currentAnomalies.forEach(anomaly => {
      this.anomalies.set(anomaly.id, anomaly);
    });

    // Emit events for new critical anomalies
    currentAnomalies
      .filter(anomaly => anomaly.severity === 'critical')
      .forEach(anomaly => {
        EventBus.emit('alerts.generated', {
          alertId: anomaly.id,
          alertType: 'system',
          severity: 'critical',
          title: anomaly.title,
          description: anomaly.description,
          estimatedImpact: 100,
          autoActionsTriggered: anomaly.autoFixable ? anomaly.suggestedActions : [],
          timestamp: new Date().toISOString()
        }, 'AnomalyDetection');
      });
  }

  /**
   * Create anomaly from metric violation
   */
  private createMetricAnomaly(metricName: string, metric: HealthMetric): Anomaly | null {
    const threshold = metric.status === 'critical' ? metric.threshold.critical : metric.threshold.warning;
    const deviation = ((metric.value - threshold) / threshold) * 100;

    return {
      id: `metric_${metricName}_${Date.now()}`,
      type: 'performance',
      severity: metric.status === 'critical' ? 'critical' : 'medium',
      title: `${metricName.replace('_', ' ').toUpperCase()} Threshold Exceeded`,
      description: `${metricName} is ${metric.value.toFixed(2)} ${metric.unit}, exceeding ${metric.status} threshold of ${threshold} ${metric.unit}`,
      detectedAt: Date.now(),
      source: 'MetricMonitoring',
      metrics: { [metricName]: metric.value },
      threshold: {
        expected: threshold,
        actual: metric.value,
        deviation
      },
      impact: {
        affectedSystems: this.getAffectedSystems(metricName),
        userImpact: metric.status === 'critical' ? 'moderate' : 'minor'
      },
      autoFixable: this.isMetricAutoFixable(metricName),
      suggestedActions: this.getSuggestedActionsForMetric(metricName)
    };
  }

  /**
   * Create anomaly from pattern match
   */
  private createPatternAnomaly(pattern: AnomalyPattern, matchData: any): Anomaly {
    return {
      id: `pattern_${pattern.signature}_${Date.now()}`,
      type: 'system',
      severity: matchData.severity || 'high',
      title: `System Pattern Detected: ${pattern.signature}`,
      description: `Known system issue pattern identified with ${Math.round(pattern.confidence * 100)}% confidence`,
      detectedAt: Date.now(),
      source: 'PatternMatching',
      metrics: matchData.metrics,
      threshold: matchData.threshold,
      impact: {
        affectedSystems: ['system_health'],
        userImpact: matchData.severity === 'critical' ? 'severe' : 'moderate'
      },
      autoFixable: true,
      suggestedActions: pattern.recommendedActions,
      context: { pattern: pattern.signature, confidence: pattern.confidence }
    };
  }

  /**
   * Check if a pattern matches current metrics
   */
  private checkPatternMatch(pattern: AnomalyPattern): any | null {
    const matchedCriteria = pattern.matchCriteria.filter(criteria => {
      const metric = this.metrics.get(criteria.metric);
      if (!metric) return false;

      switch (criteria.operator) {
        case 'gt':
          return metric.value > (criteria.value as number);
        case 'lt':
          return metric.value < (criteria.value as number);
        case 'eq':
          return metric.value === (criteria.value as number);
        case 'between':
          const [min, max] = criteria.value as [number, number];
          return metric.value >= min && metric.value <= max;
        default:
          return false;
      }
    });

    if (matchedCriteria.length === pattern.matchCriteria.length) {
      // All criteria matched
      pattern.historicalOccurrences++;
      
      return {
        metrics: Object.fromEntries(
          matchedCriteria.map(criteria => [criteria.metric, this.metrics.get(criteria.metric)!.value])
        ),
        severity: matchedCriteria.some(c => c.metric === 'error_rate' && this.metrics.get(c.metric)!.value > 8) ? 'critical' : 'high',
        threshold: {
          expected: 'pattern_threshold',
          actual: 'pattern_match',
          deviation: pattern.confidence * 100
        }
      };
    }

    return null;
  }

  /**
   * Perform automatic healing for detected anomalies
   */
  private async performAutoHealing(): Promise<void> {
    const criticalAnomalies = Array.from(this.anomalies.values())
      .filter(anomaly => anomaly.autoFixable && anomaly.severity === 'critical');

    for (const anomaly of criticalAnomalies) {
      for (const actionId of anomaly.suggestedActions) {
        const action = this.healingActions.get(actionId);
        if (!action) continue;

        // Check prerequisites
        if (!this.checkPrerequisites(action.prerequisites)) {
          console.warn(`Prerequisites not met for healing action: ${actionId}`);
          continue;
        }

        // Check if action was recently executed
        const recentExecutions = this.executedActions.filter(
          exec => exec.actionId === actionId && 
                 Date.now() - exec.timestamp < 5 * 60 * 1000 // 5 minutes
        );

        if (recentExecutions.length > 0) {
          console.log(`Healing action ${actionId} was recently executed, skipping`);
          continue;
        }

        try {
          console.log(`🔧 Executing healing action: ${action.description}`);
          
          const success = await action.execute();
          
          this.executedActions.push({
            actionId,
            timestamp: Date.now(),
            success
          });

          if (success) {
            console.log(`✅ Healing action ${actionId} completed successfully`);
            
            // Emit healing event
            await EventBus.emit('alerts.automated_action_executed', {
              actionId: action.id,
              alertId: anomaly.id,
              actionType: action.type,
              status: 'completed',
              executionTime: action.estimatedExecutionTime,
              result: action.description,
              timestamp: new Date().toISOString()
            }, 'SelfHealing');
            
            // Remove the anomaly if it's been fixed
            this.anomalies.delete(anomaly.id);
            break; // Stop trying other actions for this anomaly
          } else {
            console.error(`❌ Healing action ${actionId} failed`);
          }
        } catch (error) {
          console.error(`Error executing healing action ${actionId}:`, error);
          
          this.executedActions.push({
            actionId,
            timestamp: Date.now(),
            success: false
          });
        }
      }
    }
  }

  /**
   * Check if prerequisites are met for an action
   */
  private checkPrerequisites(prerequisites: string[]): boolean {
    for (const prerequisite of prerequisites) {
      switch (prerequisite) {
        case 'network_available':
          if (!navigator.onLine) return false;
          break;
        case 'low_cpu_usage':
          // Simple heuristic - if response time is reasonable, CPU is probably fine
          const responseMetric = this.metrics.get('response_time');
          if (responseMetric && responseMetric.value > 2000) return false;
          break;
        default:
          console.warn(`Unknown prerequisite: ${prerequisite}`);
          break;
      }
    }
    return true;
  }

  /**
   * Get systems affected by a metric
   */
  private getAffectedSystems(metricName: string): string[] {
    const systemMap: Record<string, string[]> = {
      'response_time': ['ui', 'api', 'user_experience'],
      'memory_usage': ['browser', 'performance'],
      'error_rate': ['ui', 'api', 'user_experience'],
      'offline_sync_queue': ['data_sync', 'offline_mode'],
      'failed_predictions': ['ml_system', 'recommendations'],
      'websocket_disconnections': ['realtime_updates', 'notifications'],
      'cache_miss_rate': ['performance', 'loading_times'],
      'bundle_load_failures': ['ui', 'module_loading']
    };

    return systemMap[metricName] || ['unknown'];
  }

  /**
   * Check if a metric can be auto-fixed
   */
  private isMetricAutoFixable(metricName: string): boolean {
    const autoFixableMetrics = [
      'cache_miss_rate',
      'offline_sync_queue',
      'websocket_disconnections',
      'failed_predictions',
      'bundle_load_failures'
    ];

    return autoFixableMetrics.includes(metricName);
  }

  /**
   * Get suggested actions for a metric
   */
  private getSuggestedActionsForMetric(metricName: string): string[] {
    const actionMap: Record<string, string[]> = {
      'response_time': ['optimize_memory_usage', 'clear_performance_cache'],
      'memory_usage': ['optimize_memory_usage'],
      'error_rate': ['clear_performance_cache', 'emergency_page_reload'],
      'offline_sync_queue': ['force_offline_sync'],
      'failed_predictions': ['reload_ml_models'],
      'websocket_disconnections': ['restart_websocket_connection'],
      'cache_miss_rate': ['clear_performance_cache'],
      'bundle_load_failures': ['clear_performance_cache', 'emergency_page_reload']
    };

    return actionMap[metricName] || [];
  }

  /**
   * Clean up old data to free memory
   */
  private cleanupOldData(): void {
    // Limit history size for all metrics
    for (const metric of this.metrics.values()) {
      if (metric.history.length > 50) {
        metric.history = metric.history.slice(-50);
      }
    }

    // Clean up old executed actions
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.executedActions = this.executedActions.filter(
      action => action.timestamp > oneHourAgo
    );

    // Clean up old anomalies
    const oldAnomalies = Array.from(this.anomalies.entries())
      .filter(([_, anomaly]) => Date.now() - anomaly.detectedAt > 30 * 60 * 1000); // 30 minutes
    
    oldAnomalies.forEach(([id, _]) => this.anomalies.delete(id));
  }

  /**
   * Get current system health
   */
  public getSystemHealth(): SystemHealth {
    const metrics = Array.from(this.metrics.values());
    const criticalMetrics = metrics.filter(m => m.status === 'critical').length;
    const warningMetrics = metrics.filter(m => m.status === 'warning').length;
    
    let overall: SystemHealth['overall'];
    let score: number;

    if (criticalMetrics > 0) {
      overall = 'critical';
      score = Math.max(0, 100 - (criticalMetrics * 30) - (warningMetrics * 10));
    } else if (warningMetrics > 0) {
      overall = 'warning';
      score = Math.max(50, 100 - (warningMetrics * 15));
    } else {
      overall = 'healthy';
      score = 100;
    }

    return {
      overall,
      score,
      metrics,
      activeAnomalies: Array.from(this.anomalies.values()),
      lastCheck: Date.now(),
      uptime: Date.now() - (window as any).__appStartTime || Date.now(),
      autoHealingStatus: this.isMonitoring ? 'active' : 'disabled'
    };
  }

  /**
   * Get specific metric
   */
  public getMetric(name: string): HealthMetric | null {
    return this.metrics.get(name) || null;
  }

  /**
   * Get all active anomalies
   */
  public getActiveAnomalies(): Anomaly[] {
    return Array.from(this.anomalies.values());
  }

  /**
   * Manually trigger healing action
   */
  public async executeHealingAction(actionId: string): Promise<boolean> {
    const action = this.healingActions.get(actionId);
    if (!action) {
      console.error(`Healing action not found: ${actionId}`);
      return false;
    }

    try {
      const success = await action.execute();
      
      this.executedActions.push({
        actionId,
        timestamp: Date.now(),
        success
      });

      return success;
    } catch (error) {
      console.error(`Failed to execute healing action ${actionId}:`, error);
      return false;
    }
  }

  /**
   * Get execution history
   */
  public getExecutionHistory(): Array<{ actionId: string; timestamp: number; success: boolean }> {
    return [...this.executedActions].sort((a, b) => b.timestamp - a.timestamp);
  }
}

// Global instance
export const anomalyDetection = AnomalyDetectionEngine.getInstance();

// Utility functions
export const startAnomalyDetection = () => anomalyDetection.startMonitoring();
export const getSystemHealth = () => anomalyDetection.getSystemHealth();
export const getActiveAnomalies = () => anomalyDetection.getActiveAnomalies();
export const executeHealingAction = (actionId: string) => anomalyDetection.executeHealingAction(actionId);

export default anomalyDetection;