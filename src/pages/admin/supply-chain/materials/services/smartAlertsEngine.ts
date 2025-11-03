// ============================================================================
// SMART ALERTS ENGINE - Business Logic
// ============================================================================
// Sistema inteligente de alertas basado en patrones ABC y machine learning
// ✅ REFACTORIZADO para usar shared/alerts/utils (2025-01-30)

import { type MaterialABC, type ABCClass } from '@/pages/admin/supply-chain/materials/types/abc-analysis';
import { DecimalUtils, DECIMAL_CONSTANTS } from '@/business-logic/shared/decimalUtils';
import EventBus from '@/lib/events'; // ✅ EventBus for cross-module alerts
import { logger } from '@/lib/logging';

// ============================================================================
// SHARED UTILITIES - Lógica reutilizable ✅
// ============================================================================

import {
  // Prioritization
  prioritizeAlerts,
  deduplicateAlerts,

  // Types
  type PrioritizableAlert,
  type PrioritizationConfig
} from '@/shared/alerts/utils';

// ============================================================================
// TYPES
// ============================================================================

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'urgent';
export type AlertType = 
  | 'low_stock' 
  | 'out_of_stock' 
  | 'overstocked' 
  | 'slow_moving' 
  | 'price_variance' 
  | 'supplier_risk'
  | 'seasonal_demand'
  | 'abc_reclassification';

export interface SmartAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  itemId: string;
  itemName: string;
  abcClass: ABCClass;
  
  // Métricas específicas
  currentValue: number;
  thresholdValue: number;
  deviation: number; // % de desviación del threshold
  
  // Recomendaciones
  recommendedAction: string;
  actionPriority: number; // 1-5, 5 being highest
  estimatedImpact: 'low' | 'medium' | 'high';
  timeToAction: 'immediate' | 'within_24h' | 'within_week' | 'next_month';
  
  // Metadata
  generatedAt: string;
  expiresAt?: string;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  
  // Context data para análisis
  contextData: Record<string, unknown>;
}

export interface AlertThresholds {
  abcClass: ABCClass;
  
  // Stock thresholds como % del stock promedio
  lowStockThreshold: number;
  criticalStockThreshold: number;
  overstockThreshold: number;
  
  // Velocidad de rotación (días)
  slowMovingDays: number;
  
  // Varianza de precio permitida (%)
  priceVarianceThreshold: number;
  
  // Lead time de alerta anticipada (días)
  leadTimeBuffer: number;
}

export interface SmartAlertsConfig {
  // Configuración general
  enablePredictiveAlerts: boolean;
  alertRetentionDays: number;
  maxAlertsPerItem: number;
  
  // Thresholds por clase ABC
  thresholds: Record<ABCClass, AlertThresholds>;
  
  // Machine learning settings
  historicalDataMonths: number;
  seasonalityDetection: boolean;
  trendAnalysis: boolean;
  
  // Notification settings
  autoNotification: boolean;
  notificationChannels: ('email' | 'in_app' | 'webhook')[];
}

export interface AlertsAnalytics {
  totalAlerts: number;
  alertsBySeverity: Record<AlertSeverity, number>;
  alertsByType: Record<AlertType, number>;
  alertsByClass: Record<ABCClass, number>;
  
  averageResolutionTime: number; // hours
  alertAccuracy: number; // % of alerts that were actionable
  costSavingsFromAlerts: number; // estimated $ saved
  
  trends: {
    alertVolumeChange: number; // % change from last period
    severityTrend: 'improving' | 'worsening' | 'stable';
    topAlertTypes: Array<{ type: AlertType; count: number }>;
  };
}

// ============================================================================
// SMART ALERTS ENGINE
// ============================================================================

export class SmartAlertsEngine {
  
  // Default configuration optimizada para restaurantes
  private static readonly DEFAULT_CONFIG: SmartAlertsConfig = {
    enablePredictiveAlerts: true,
    alertRetentionDays: 30,
    maxAlertsPerItem: 5,
    
    thresholds: {
      A: {
        abcClass: 'A',
        lowStockThreshold: 25, // 25% del stock promedio
        criticalStockThreshold: 10, // 10% del stock promedio
        overstockThreshold: 300, // 300% del stock promedio
        slowMovingDays: 7, // 7 días sin movimiento
        priceVarianceThreshold: 5, // 5% variación de precio
        leadTimeBuffer: 2 // 2 días de anticipación
      },
      B: {
        abcClass: 'B',
        lowStockThreshold: 20,
        criticalStockThreshold: 8,
        overstockThreshold: 250,
        slowMovingDays: 14,
        priceVarianceThreshold: 10,
        leadTimeBuffer: 3
      },
      C: {
        abcClass: 'C',
        lowStockThreshold: 15,
        criticalStockThreshold: 5,
        overstockThreshold: 400,
        slowMovingDays: 30,
        priceVarianceThreshold: 15,
        leadTimeBuffer: 5
      }
    },
    
    historicalDataMonths: 6,
    seasonalityDetection: true,
    trendAnalysis: true,
    autoNotification: true,
    notificationChannels: ['in_app', 'email']
  };

  // ============================================================================
  // MAIN ANALYSIS METHODS
  // ============================================================================

  /**
   * Genera alertas inteligentes para un conjunto de materiales ABC
   */
  static generateSmartAlerts(
    materials: MaterialABC[],
    config: Partial<SmartAlertsConfig> = {}
  ): SmartAlert[] {
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config };
    const alerts: SmartAlert[] = [];
    const now = new Date().toISOString();
    
    materials.forEach(material => {
      const materialAlerts = this.analyzeItemForAlerts(material, fullConfig, now);
      alerts.push(...materialAlerts);
    });
    
    // Filtrar y priorizar alertas
    return this.prioritizeAndFilterAlerts(alerts, fullConfig);
  }

  /**
   * Analiza un item individual para generar alertas
   */
  private static analyzeItemForAlerts(
    material: MaterialABC,
    config: SmartAlertsConfig,
    timestamp: string
  ): SmartAlert[] {
    const alerts: SmartAlert[] = [];
    const thresholds = config.thresholds[material.abcClass];
    
    // 1. Alertas de stock
    alerts.push(...this.checkStockAlerts(material, thresholds, timestamp));
    
    // 2. Alertas de movimiento lento
    alerts.push(...this.checkSlowMovingAlerts(material, thresholds, timestamp));
    
    // 3. Alertas de variación de precio
    alerts.push(...this.checkPriceVarianceAlerts(material, thresholds, timestamp));
    
    // 4. Alertas predictivas (solo si está habilitado)
    if (config.enablePredictiveAlerts) {
      alerts.push(...this.checkPredictiveAlerts(material, thresholds, timestamp));
    }
    
    return alerts.filter(alert => alert !== null) as SmartAlert[];
  }

  // ============================================================================
  // STOCK ALERTS
  // ============================================================================

  private static checkStockAlerts(
    material: MaterialABC,
    thresholds: AlertThresholds,
    timestamp: string
  ): SmartAlert[] {
    const alerts: SmartAlert[] = [];
    // 🔧 FIX: Handle undefined values with nullish coalescing (prevent DecimalError)
    const currentStock = DecimalUtils.fromValue(material.currentStock ?? 0, 'inventory');
    const averageConsumption = DecimalUtils.fromValue(material.monthlyConsumption ?? 0, 'inventory');
    
    // Calcular stock promedio estimado basado en consumo
    const estimatedOptimalStock = averageConsumption.times(2); // 2 meses de stock
    
    // Alert de stock bajo
    const lowStockLevel = estimatedOptimalStock.times(thresholds.lowStockThreshold / 100);
    const criticalStockLevel = estimatedOptimalStock.times(thresholds.criticalStockThreshold / 100);
    
    if (currentStock.lte(DECIMAL_CONSTANTS.ZERO)) {
      // Out of stock - máxima prioridad
      const alert = {
        id: `out_stock_${material.id}_${timestamp}`,
        type: 'out_of_stock',
        severity: 'urgent',
        title: 'Sin Stock',
        description: `${material.name} está completamente agotado`,
        itemId: material.id,
        itemName: material.name,
        abcClass: material.abcClass,
        currentValue: currentStock.toNumber(),
        thresholdValue: 0,
        deviation: 100,
        recommendedAction: material.abcClass === 'A'
          ? 'ACCIÓN INMEDIATA: Contactar proveedor prioritario'
          : 'Programar reposición urgente',
        actionPriority: 5,
        estimatedImpact: material.abcClass === 'A' ? 'high' : 'medium',
        timeToAction: 'immediate',
        generatedAt: timestamp,
        isAcknowledged: false,
        contextData: {
          estimatedOptimalStock: estimatedOptimalStock.toNumber(),
          monthlyConsumption: material.monthlyConsumption || 0,
          abcClassImportance: this.getClassImportanceScore(material.abcClass)
        }
      } as SmartAlert;

      alerts.push(alert);

      // 🎯 EVENTBUS: Emit critical low stock alert (out of stock)
      this.emitLowStockEvent(
        material.id,
        material.name,
        currentStock.toNumber(),
        0,
        'critical',
        material.abcClass,
        estimatedOptimalStock.toNumber()
      );
    } else if (currentStock.lte(criticalStockLevel)) {
      // Stock crítico
      const deviation = DecimalUtils.calculatePercentage(
        criticalStockLevel.minus(currentStock),
        criticalStockLevel,
        'inventory'
      ).toNumber();

      const alert = {
        id: `critical_stock_${material.id}_${timestamp}`,
        type: 'low_stock',
        severity: 'critical',
        title: 'Stock Crítico',
        description: `${material.name} tiene stock crítico (${DecimalUtils.formatQuantity(currentStock, this.getUnit(material))})`,
        itemId: material.id,
        itemName: material.name,
        abcClass: material.abcClass,
        currentValue: currentStock.toNumber(),
        thresholdValue: criticalStockLevel.toNumber(),
        deviation: Math.round(deviation),
        recommendedAction: this.getStockRecommendation(material, 'critical'),
        actionPriority: material.abcClass === 'A' ? 5 : 4,
        estimatedImpact: material.abcClass === 'A' ? 'high' : 'medium',
        timeToAction: material.abcClass === 'A' ? 'immediate' : 'within_24h',
        generatedAt: timestamp,
        isAcknowledged: false,
        contextData: {
          estimatedOptimalStock: estimatedOptimalStock.toNumber(),
          daysUntilEmpty: this.estimateDaysUntilEmpty(material),
          supplierLeadTime: 3 // Estimado, en producción vendría de datos reales
        }
      } as SmartAlert;

      alerts.push(alert);

      // 🎯 EVENTBUS: Emit critical stock alert
      this.emitLowStockEvent(
        material.id,
        material.name,
        currentStock.toNumber(),
        criticalStockLevel.toNumber(),
        'critical',
        material.abcClass,
        this.calculateOptimalOrderQuantity(material) * 2 // Double for critical
      );
    } else if (currentStock.lte(lowStockLevel)) {
      // Stock bajo
      const deviation = DecimalUtils.calculatePercentage(
        lowStockLevel.minus(currentStock),
        lowStockLevel,
        'inventory'
      ).toNumber();

      const alert = {
        id: `low_stock_${material.id}_${timestamp}`,
        type: 'low_stock',
        severity: 'warning',
        title: 'Stock Bajo',
        description: `${material.name} se está agotando`,
        itemId: material.id,
        itemName: material.name,
        abcClass: material.abcClass,
        currentValue: currentStock.toNumber(),
        thresholdValue: lowStockLevel.toNumber(),
        deviation: Math.round(deviation),
        recommendedAction: this.getStockRecommendation(material, 'low'),
        actionPriority: material.abcClass === 'A' ? 4 : 3,
        estimatedImpact: 'medium',
        timeToAction: material.abcClass === 'A' ? 'within_24h' : 'within_week',
        generatedAt: timestamp,
        isAcknowledged: false,
        contextData: {
          estimatedOptimalStock: estimatedOptimalStock.toNumber(),
          suggestedOrderQuantity: this.calculateOptimalOrderQuantity(material)
        }
      } as SmartAlert;

      alerts.push(alert);

      // 🎯 EVENTBUS: Emit warning low stock alert
      this.emitLowStockEvent(
        material.id,
        material.name,
        currentStock.toNumber(),
        lowStockLevel.toNumber(),
        'warning',
        material.abcClass,
        this.calculateOptimalOrderQuantity(material)
      );
    }
    
    // Alert de sobrestock
    const overstockLevel = estimatedOptimalStock.times(thresholds.overstockThreshold / 100);
    if (currentStock.gt(overstockLevel)) {
      const deviation = DecimalUtils.calculatePercentage(
        currentStock.minus(overstockLevel),
        overstockLevel,
        'inventory'
      ).toNumber();
      
      alerts.push({
        id: `overstock_${material.id}_${timestamp}`,
        type: 'overstocked',
        severity: 'warning',
        title: 'Sobrestock',
        description: `${material.name} tiene exceso de inventario`,
        itemId: material.id,
        itemName: material.name,
        abcClass: material.abcClass,
        currentValue: currentStock.toNumber(),
        thresholdValue: overstockLevel.toNumber(),
        deviation: Math.round(deviation),
        recommendedAction: 'Considerar promoción o reducir pedidos futuros',
        actionPriority: 2,
        estimatedImpact: 'medium',
        timeToAction: 'next_month',
        generatedAt: timestamp,
        isAcknowledged: false,
        contextData: {
          excessValue: DecimalUtils.multiply(
            currentStock.minus(overstockLevel),
            material.unit_cost || 0,
            'inventory'
          ).toNumber()
        }
      });
    }
    
    return alerts;
  }

  // ============================================================================
  // SLOW MOVING ALERTS
  // ============================================================================

  private static checkSlowMovingAlerts(
    material: MaterialABC,
    thresholds: AlertThresholds,
    timestamp: string
  ): SmartAlert[] {
    const alerts: SmartAlert[] = [];
    
    // Simular análisis de movimiento lento basado en frecuencia de consumo
    const consumptionFreq = material.consumptionFrequency || 0;
    const expectedFrequency = this.getExpectedFrequency(material.abcClass);
    
    if (consumptionFreq < expectedFrequency * 0.5) { // 50% menos que esperado
      const deviation = DecimalUtils.calculatePercentage(
        expectedFrequency - consumptionFreq,
        expectedFrequency,
        'inventory'
      ).toNumber();
      
      alerts.push({
        id: `slow_moving_${material.id}_${timestamp}`,
        type: 'slow_moving',
        severity: 'warning',
        title: 'Movimiento Lento',
        description: `${material.name} tiene baja rotación`,
        itemId: material.id,
        itemName: material.name,
        abcClass: material.abcClass,
        currentValue: consumptionFreq,
        thresholdValue: expectedFrequency,
        deviation: Math.round(deviation),
        recommendedAction: 'Revisar demanda y considerar alternativas',
        actionPriority: 2,
        estimatedImpact: 'low',
        timeToAction: 'within_week',
        generatedAt: timestamp,
        isAcknowledged: false,
        contextData: {
          lastUsedDate: material.lastUsedDate,
          stockValue: material.totalStockValue || 0
        }
      });
    }
    
    return alerts;
  }

  // ============================================================================
  // PREDICTIVE ALERTS
  // ============================================================================

  private static checkPredictiveAlerts(
    material: MaterialABC,
    thresholds: AlertThresholds,
    timestamp: string
  ): SmartAlert[] {
    const alerts: SmartAlert[] = [];
    
    // Predicción simple basada en consumo y lead time
    const daysUntilEmpty = this.estimateDaysUntilEmpty(material);
    const leadTimeWithBuffer = thresholds.leadTimeBuffer;
    
    if (daysUntilEmpty <= leadTimeWithBuffer && daysUntilEmpty > 0) {
      alerts.push({
        id: `predictive_stock_${material.id}_${timestamp}`,
        type: 'low_stock',
        severity: 'info',
        title: 'Agotamiento Previsto',
        description: `${material.name} se agotará en aproximadamente ${Math.round(daysUntilEmpty)} días`,
        itemId: material.id,
        itemName: material.name,
        abcClass: material.abcClass,
        currentValue: daysUntilEmpty,
        thresholdValue: leadTimeWithBuffer,
        deviation: Math.round(((leadTimeWithBuffer - daysUntilEmpty) / leadTimeWithBuffer) * 100),
        recommendedAction: 'Programar pedido anticipado',
        actionPriority: 3,
        estimatedImpact: 'medium',
        timeToAction: 'within_24h',
        generatedAt: timestamp,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
        isAcknowledged: false,
        contextData: {
          predictedEmptyDate: new Date(Date.now() + daysUntilEmpty * 24 * 60 * 60 * 1000).toISOString(),
          confidence: 'medium' // En producción sería calculado con ML
        }
      });
    }
    
    return alerts;
  }

  // ============================================================================
  // PRICE VARIANCE ALERTS
  // ============================================================================

  private static checkPriceVarianceAlerts(): SmartAlert[] {
    // En producción, compararíamos con precios históricos
    // Por ahora retornamos array vacío
    // TODO: Implement price variance detection using historical data
    return [];
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * 🎯 HELPER: Emit low stock alert event
   * Extracted to reduce code duplication (DRY principle)
   */
  private static emitLowStockEvent(
    materialId: string,
    materialName: string,
    currentStock: number,
    minStock: number,
    severity: 'critical' | 'warning',
    abcClass: ABCClass,
    recommendedOrder: number
  ): void {
    EventBus.emit('materials.low_stock_alert', {
      materialId,
      materialName,
      currentStock,
      minStock,
      severity,
      abcClass,
      recommendedOrder,
      timestamp: Date.now()
    });

    logger.debug('SmartAlertsEngine', `📢 Emitted materials.low_stock_alert (${severity})`, {
      materialId,
      severity
    });
  }

  /**
   * Prioriza y filtra alertas
   * ✅ USA SHARED UTILITY prioritizeAlerts
   */
  private static prioritizeAndFilterAlerts(
    alerts: SmartAlert[],
    config: SmartAlertsConfig
  ): SmartAlert[] {
    // ✅ Usar prioritizeAlerts de shared utils
    // Agrupar por itemId y limitar según config.maxAlertsPerItem
    const prioritizationConfig: PrioritizationConfig = {
      maxAlertsPerGroup: config.maxAlertsPerItem,
      groupBy: 'type', // Agrupar por tipo para evitar duplicados por item
      preserveOrder: false
    };

    // SmartAlert ya implementa PrioritizableAlert (tiene severity y actionPriority)
    return prioritizeAlerts(alerts as PrioritizableAlert[], prioritizationConfig) as SmartAlert[];
  }

  // ❌ ELIMINADO - Ahora usa prioritizeAlerts de shared/alerts/utils
  // Antes: ~30 líneas de lógica duplicada
  // Ahora: 1 llamada a utilidad compartida

  private static getStockRecommendation(material: MaterialABC, level: 'critical' | 'low'): string {
    const className = material.abcClass;
    const orderQty = this.calculateOptimalOrderQuantity(material);
    
    if (level === 'critical') {
      switch (className) {
        case 'A': return `URGENTE: Contactar proveedor inmediatamente. Pedir ${DecimalUtils.formatQuantity(orderQty, this.getUnit(material))}`;
        case 'B': return `Reabastecer pronto: ${DecimalUtils.formatQuantity(orderQty, this.getUnit(material))}`;
        case 'C': return `Incluir en próximo pedido: ${DecimalUtils.formatQuantity(orderQty, this.getUnit(material))}`;
      }
    } else {
      switch (className) {
        case 'A': return `Programar pedido prioritario: ${DecimalUtils.formatQuantity(orderQty, this.getUnit(material))}`;
        case 'B': return `Añadir a lista de compras: ${DecimalUtils.formatQuantity(orderQty, this.getUnit(material))}`;
        case 'C': return `Monitorear y pedir si es necesario: ${DecimalUtils.formatQuantity(orderQty, this.getUnit(material))}`;
      }
    }
    return 'Reabastecer según necesidad';
  }

  private static calculateOptimalOrderQuantity(material: MaterialABC): number {
    // Cálculo simplificado de cantidad óptima de pedido
    const monthlyConsumption = material.monthlyConsumption || 0;
    const leadTimeMonths = 0.5; // Asumimos 15 días de lead time
    const safetyFactor = material.abcClass === 'A' ? 2 : material.abcClass === 'B' ? 1.5 : 1;
    
    return Math.max(1, Math.round(monthlyConsumption * leadTimeMonths * safetyFactor));
  }

  private static estimateDaysUntilEmpty(material: MaterialABC): number {
    const currentStock = material.currentStock;
    const dailyConsumption = (material.monthlyConsumption || 0) / 30;
    
    if (dailyConsumption <= 0) return 999; // No consumption data
    
    return Math.max(0, currentStock / dailyConsumption);
  }

  private static getExpectedFrequency(abcClass: ABCClass): number {
    // Frecuencia esperada de uso por mes según clase ABC
    switch (abcClass) {
      case 'A': return 25; // Casi diario
      case 'B': return 15; // Día por medio
      case 'C': return 8;  // Semanal
    }
  }

  private static getClassImportanceScore(abcClass: ABCClass): number {
    switch (abcClass) {
      case 'A': return 5;
      case 'B': return 3;
      case 'C': return 1;
    }
  }

  private static getUnit(material: MaterialABC): string {
    if ('unit' in material) {
      return material.unit as string;
    }
    return 'unidad';
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Genera métricas y analytics de las alertas
   */
  static generateAlertsAnalytics(alerts: SmartAlert[]): AlertsAnalytics {
    const totalAlerts = alerts.length;
    
    const alertsBySeverity = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<AlertSeverity, number>);
    
    const alertsByType = alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<AlertType, number>);
    
    const alertsByClass = alerts.reduce((acc, alert) => {
      acc[alert.abcClass] = (acc[alert.abcClass] || 0) + 1;
      return acc;
    }, {} as Record<ABCClass, number>);
    
    // Top alert types
    const topAlertTypes = Object.entries(alertsByType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({ type: type as AlertType, count }));
    
    return {
      totalAlerts,
      alertsBySeverity: {
        info: alertsBySeverity.info || 0,
        warning: alertsBySeverity.warning || 0,
        critical: alertsBySeverity.critical || 0,
        urgent: alertsBySeverity.urgent || 0
      },
      alertsByType: {
        low_stock: alertsByType.low_stock || 0,
        out_of_stock: alertsByType.out_of_stock || 0,
        overstocked: alertsByType.overstocked || 0,
        slow_moving: alertsByType.slow_moving || 0,
        price_variance: alertsByType.price_variance || 0,
        supplier_risk: alertsByType.supplier_risk || 0,
        seasonal_demand: alertsByType.seasonal_demand || 0,
        abc_reclassification: alertsByType.abc_reclassification || 0
      },
      alertsByClass: {
        A: alertsByClass.A || 0,
        B: alertsByClass.B || 0,
        C: alertsByClass.C || 0
      },
      averageResolutionTime: 24, // Placeholder
      alertAccuracy: 85, // Placeholder
      costSavingsFromAlerts: 12500, // Placeholder
      trends: {
        alertVolumeChange: 15, // Placeholder
        severityTrend: 'stable',
        topAlertTypes
      }
    };
  }
}