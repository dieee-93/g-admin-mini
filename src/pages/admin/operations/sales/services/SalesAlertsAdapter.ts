// ============================================================================
// SALES ALERTS ADAPTER - Integration Layer
// ============================================================================
// Adaptador que conecta SalesIntelligenceEngine con el sistema unificado de alertas
// Convierte alertas inteligentes específicas de sales al formato estándar

import { logger } from '@/lib/logging';

import {
  SalesIntelligenceEngine,
  type SalesAlert,
  type SalesAnalysisData,
  type SalesIntelligenceConfig
} from './SalesIntelligenceEngine';

// Import del sistema unificado de alertas (placeholder por ahora)
// TODO: Cuando AlertUtils esté disponible, importar desde @/shared/alerts
// import { AlertUtils } from '@/shared/alerts';

// ============================================================================
// TYPES FOR UNIFIED SYSTEM INTEGRATION
// ============================================================================

interface UnifiedAlert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  context: string;
  priority: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface AlertGenerationResult {
  alerts: SalesAlert[];
  summary: {
    total: number;
    critical: number;
    warning: number;
    info: number;
  };
  recommendations: string[];
}

// ============================================================================
// SALES ALERTS ADAPTER
// ============================================================================

export class SalesAlertsAdapter {
  private static instance: SalesAlertsAdapter;
  private config: SalesIntelligenceConfig;
  private lastAnalysis: Date | null = null;

  private constructor(config?: Partial<SalesIntelligenceConfig>) {
    // Usar config default del SalesIntelligenceEngine con overrides
    this.config = {
      enablePredictiveAlerts: true,
      enableCrossModuleCorrelation: true,
      alertRetentionHours: 24,
      maxAlertsPerType: 3,
      thresholds: {
        dailyTarget: 5000,
        weeklyTarget: 35000,
        monthlyTarget: 150000,
        minConversionRate: 85,
        maxServiceTime: 30,
        minTableTurnover: 3,
        criticalRevenueThreshold: 25,
        warningRevenueThreshold: 15,
        lowConversionThreshold: 80,
        slowServiceThreshold: 35
      },
      businessHours: { start: 8, end: 23 },
      peakHours: [12, 13, 18, 19, 20, 21],
      ...config
    };
  }

  static getInstance(config?: Partial<SalesIntelligenceConfig>): SalesAlertsAdapter {
    if (!SalesAlertsAdapter.instance) {
      SalesAlertsAdapter.instance = new SalesAlertsAdapter(config);
    }
    return SalesAlertsAdapter.instance;
  }

  // ============================================================================
  // MAIN GENERATION METHOD
  // ============================================================================

  /**
   * Genera y actualiza alertas inteligentes basadas en datos de ventas actuales
   */
  async generateAndUpdateAlerts(salesData: SalesAnalysisData): Promise<AlertGenerationResult> {
    try {
      // 1. Generar alertas inteligentes usando el engine
      const intelligentAlerts = SalesIntelligenceEngine.generateSalesAlerts(salesData, this.config);

      // 2. Convertir a formato unificado y enviar al sistema de alertas
      const unifiedAlerts = this.convertToUnifiedFormat(intelligentAlerts);

      // 3. Enviar al sistema unificado
      await this.pushToUnifiedSystem(unifiedAlerts);

      // 4. Generar recomendaciones consolidadas
      const recommendations = this.generateConsolidatedRecommendations(intelligentAlerts);

      // 5. Actualizar timestamp de último análisis
      this.lastAnalysis = new Date();

      // 6. Generar summary
      const summary = this.generateSummary(intelligentAlerts);

      return {
        alerts: intelligentAlerts,
        summary,
        recommendations
      };

    } catch (error) {
      logger.error('SalesStore', 'Error generating sales alerts:', error);
      throw new Error(`Sales alerts generation failed: ${error}`);
    }
  }

  // ============================================================================
  // CONVERSION METHODS
  // ============================================================================

  /**
   * Convierte alertas de SalesIntelligenceEngine al formato del sistema unificado
   */
  private convertToUnifiedFormat(salesAlerts: SalesAlert[]): UnifiedAlert[] {
    return salesAlerts.map(alert => ({
      id: alert.id,
      type: this.mapSeverityToUnifiedType(alert.severity),
      title: alert.title,
      message: this.enhanceMessageWithContext(alert),
      context: 'sales',
      priority: alert.actionPriority,
      timestamp: alert.generatedAt,
      metadata: {
        originalType: alert.type,
        severity: alert.severity,
        currentValue: alert.currentValue,
        targetValue: alert.targetValue,
        deviation: alert.deviation,
        affectedModules: alert.affectedModules,
        estimatedImpact: alert.estimatedImpact,
        timeToAction: alert.timeToAction,
        contextData: alert.contextData,
        correlationData: alert.correlationData
      }
    }));
  }

  /**
   * Mapea severidad del engine al tipo del sistema unificado
   */
  private mapSeverityToUnifiedType(severity: SalesAlert['severity']): UnifiedAlert['type'] {
    switch (severity) {
      case 'urgent':
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  /**
   * Enriquece el mensaje con contexto adicional
   */
  private enhanceMessageWithContext(alert: SalesAlert): string {
    let message = alert.description;

    // Agregar recomendación si es crítica o urgente
    if (alert.severity === 'urgent' || alert.severity === 'critical') {
      message += ` • ${alert.recommendedAction}`;
    }

    // Agregar timeframe de acción
    const timeFrames = {
      immediate: 'Acción inmediata requerida',
      within_1h: 'Resolver en 1 hora',
      within_24h: 'Resolver en 24 horas',
      within_week: 'Resolver esta semana'
    };

    message += ` • ${timeFrames[alert.timeToAction]}`;

    return message;
  }

  // ============================================================================
  // UNIFIED SYSTEM INTEGRATION
  // ============================================================================

  /**
   * Envía alertas al sistema unificado de alertas
   */
  private async pushToUnifiedSystem(unifiedAlerts: UnifiedAlert[]): Promise<void> {
    // TODO: Implementar integración real con AlertUtils cuando esté disponible
    logger.info('SalesStore', '📊 Sales Alerts Generated:', unifiedAlerts.length);

    for (const alert of unifiedAlerts) {
      // Placeholder para integración con sistema unificado
      // AlertUtils.createRevenueAlert(alert.title, alert.message, alert.type, alert.metadata);
      logger.info('SalesStore', `🚨 ${alert.type.toUpperCase()}: ${alert.title}`);
      logger.info('SalesStore', `   ${alert.message}`);

      if (alert.metadata?.affectedModules?.length > 0) {
        logger.info('SalesStore', `   Módulos afectados: ${alert.metadata.affectedModules.join(', ')}`);
      }
    }
  }

  // ============================================================================
  // RECOMMENDATIONS ENGINE
  // ============================================================================

  /**
   * Genera recomendaciones consolidadas basadas en todas las alertas
   */
  private generateConsolidatedRecommendations(alerts: SalesAlert[]): string[] {
    const recommendations = new Set<string>();

    // Agrupar alertas por tipo para generar recomendaciones inteligentes
    const alertsByType = alerts.reduce((acc, alert) => {
      if (!acc[alert.type]) acc[alert.type] = [];
      acc[alert.type].push(alert);
      return acc;
    }, {} as Record<string, SalesAlert[]>);

    // Revenue-specific recommendations
    if (alertsByType.revenue_critical || alertsByType.revenue_below_target) {
      recommendations.add('🎯 Activar estrategia de recuperación de revenue inmediata');
      recommendations.add('📱 Lanzar campañas de marketing dirigidas');
      recommendations.add('💰 Considerar ajustes de pricing dinámico');
    }

    // Service-specific recommendations
    if (alertsByType.service_slow || alertsByType.conversion_low) {
      recommendations.add('⚡ Optimizar flujos de servicio en cocina y sala');
      recommendations.add('👥 Revisar distribución y capacidad de staff');
      recommendations.add('🔄 Implementar mejoras en proceso de pedidos');
    }

    // Cross-module recommendations
    if (alertsByType.cross_module_impact) {
      recommendations.add('🤝 Coordinar acciones inmediatas con otros módulos');
      recommendations.add('📋 Activar protocolos de contingencia cross-módulo');
    }

    // Predictive recommendations
    if (alertsByType.predictive_opportunity) {
      recommendations.add('🚀 Capitalizar oportunidades de peak hours identificadas');
      recommendations.add('📊 Implementar acciones predictivas de marketing');
    }

    // Always include monitoring recommendation
    recommendations.add('📈 Monitorear métricas en tiempo real durante las próximas 2 horas');

    return Array.from(recommendations);
  }

  // ============================================================================
  // SUMMARY AND ANALYTICS
  // ============================================================================

  /**
   * Genera resumen estadístico de las alertas generadas
   */
  private generateSummary(alerts: SalesAlert[]): AlertGenerationResult['summary'] {
    const severityCounts = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: alerts.length,
      critical: (severityCounts.urgent || 0) + (severityCounts.critical || 0),
      warning: severityCounts.warning || 0,
      info: severityCounts.info || 0
    };
  }

  // ============================================================================
  // CONFIGURATION AND UTILITY METHODS
  // ============================================================================

  /**
   * Actualiza configuración del adapter
   */
  updateConfig(newConfig: Partial<SalesIntelligenceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obtiene configuración actual
   */
  getConfig(): SalesIntelligenceConfig {
    return { ...this.config };
  }

  /**
   * Obtiene estadísticas del último análisis
   */
  getLastAnalysisInfo(): { timestamp: Date | null; wasSuccessful: boolean } {
    return {
      timestamp: this.lastAnalysis,
      wasSuccessful: this.lastAnalysis !== null
    };
  }

  /**
   * Simula datos de ventas para testing (remover en producción)
   */
  static generateMockSalesData(): SalesAnalysisData {
    return {
      todayRevenue: 3500,        // Below target
      targetRevenue: 5000,
      yesterdayRevenue: 4200,
      lastWeekRevenue: 4800,

      todayTransactions: 45,
      averageOrderValue: 77.78,
      tableOccupancy: 75,
      averageServiceTime: 32,    // Slightly above threshold

      tablesTurnover: 2.5,       // Below minimum
      paymentSuccessRate: 98,
      conversionRate: 82,        // Slightly below threshold

      newCustomers: 15,
      returningCustomers: 30,
      customerSatisfaction: 8.5,

      materialsStockCritical: 2, // Cross-module impact
      staffCapacity: 85,         // Below optimal
      kitchenEfficiency: 88
    };
  }

  /**
   * Método de testing para validar el flujo completo
   */
  static async testFullFlow(): Promise<void> {
    logger.info('SalesStore', '🧪 Testing Sales Alerts Flow...');

    const adapter = SalesAlertsAdapter.getInstance();
    const mockData = SalesAlertsAdapter.generateMockSalesData();

    try {
      const result = await adapter.generateAndUpdateAlerts(mockData);

      logger.info('SalesStore', '✅ Test completed successfully');
      logger.info('SalesStore', `📊 Generated ${result.summary.total} alerts`);
      logger.info('SalesStore', `🔴 Critical: ${result.summary.critical}`);
      logger.warn('SalesStore', `🟡 Warning: ${result.summary.warning}`);
      logger.info('SalesStore', `🔵 Info: ${result.summary.info}`);
      logger.info('SalesStore', `💡 Recommendations: ${result.recommendations.length}`);

      result.recommendations.forEach(rec => logger.info('SalesStore', `   ${rec}`));

    } catch (error) {
      logger.error('SalesStore', '❌ Test failed:', error);
    }
  }
}

// Export default instance for easy usage
export const salesAlertsAdapter = SalesAlertsAdapter.getInstance();