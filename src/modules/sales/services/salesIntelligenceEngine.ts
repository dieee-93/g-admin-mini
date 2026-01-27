// ============================================================================
// SALES INTELLIGENCE ENGINE - Business Logic
// ============================================================================
// Sistema inteligente de alertas para análisis de revenue patterns,
// conversion optimization y customer behavior analytics

import { formatCurrency, DecimalUtils } from '@/lib/decimal';

// ============================================================================
// TYPES
// ============================================================================

export type SalesAlertSeverity = 'info' | 'warning' | 'critical' | 'urgent';
export type SalesAlertType =
  | 'revenue_below_target'
  | 'revenue_critical'
  | 'conversion_low'
  | 'service_slow'
  | 'table_inefficiency'
  | 'payment_method_issue'
  | 'customer_churn_risk'
  | 'cross_module_impact'
  | 'predictive_opportunity';

// Specific types for alert data
export interface SalesAlertCorrelationData {
  weeklyTrend?: number;
  seasonalFactor?: number;
  crossModuleImpact?: {
    materials?: number;
    staff?: number;
    kitchen?: number;
  };
  performanceComparison?: {
    vsYesterday?: number;
    vsLastWeek?: number;
    vsAverage?: number;
  };
  // Allow additional dynamic fields
  [key: string]: string | number | Record<string, number> | undefined;
}

export interface SalesAlertContextData {
  hourlyBreakdown?: number[];
  expectedEndOfDayRevenue?: number;
  actionsSuggested?: string[];
  peakHourOpportunities?: number[];
  staffingRecommendations?: string[];
  customerSegments?: {
    new?: number;
    returning?: number;
    vip?: number;
  };
  // Allow additional dynamic fields
  [key: string]: string | number | string[] | number[] | Record<string, number> | undefined;
}

export interface SalesAlert {
  id: string;
  type: SalesAlertType;
  severity: SalesAlertSeverity;
  title: string;
  description: string;

  // Métricas específicas
  currentValue: number;
  targetValue: number;
  deviation: number; // % de desviación del target

  // Recomendaciones
  recommendedAction: string;
  actionPriority: number; // 1-5, 5 being highest
  estimatedImpact: 'low' | 'medium' | 'high';
  timeToAction: 'immediate' | 'within_1h' | 'within_24h' | 'within_week';

  // Cross-module correlations
  affectedModules: string[];
  correlationData: SalesAlertCorrelationData;

  // Metadata
  generatedAt: string;
  expiresAt?: string;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;

  // Context data para análisis
  contextData: SalesAlertContextData;
}

export interface SalesAnalysisData {
  // Revenue metrics
  todayRevenue: number;
  targetRevenue: number;
  yesterdayRevenue: number;
  lastWeekRevenue: number;

  // Operational metrics
  todayTransactions: number;
  averageOrderValue: number;
  tableOccupancy: number;
  averageServiceTime: number; // minutes

  // Conversion metrics
  tablesTurnover: number; // times per day
  paymentSuccessRate: number;
  conversionRate: number;

  // Customer metrics
  newCustomers: number;
  returningCustomers: number;
  customerSatisfaction?: number;

  // Cross-module data
  materialsStockCritical: number; // count of materials with critical stock
  staffCapacity: number; // % of optimal staffing
  kitchenEfficiency: number; // % efficiency
}

export interface RevenueThresholds {
  // Revenue targets
  dailyTarget: number;
  weeklyTarget: number;
  monthlyTarget: number;

  // Performance thresholds
  minConversionRate: number; // %
  maxServiceTime: number; // minutes
  minTableTurnover: number; // times per day

  // Alert thresholds
  criticalRevenueThreshold: number; // % below target
  warningRevenueThreshold: number; // % below target
  lowConversionThreshold: number; // %
  slowServiceThreshold: number; // minutes
}

export interface SalesIntelligenceConfig {
  enablePredictiveAlerts: boolean;
  enableCrossModuleCorrelation: boolean;
  alertRetentionHours: number;
  maxAlertsPerType: number;

  thresholds: RevenueThresholds;

  // Business hours for analysis
  businessHours: {
    start: number; // hour 0-23
    end: number;   // hour 0-23
  };

  // Peak hours definition
  peakHours: number[]; // array of hours [18, 19, 20, 21]
}

// ============================================================================
// SALES INTELLIGENCE ENGINE
// ============================================================================

export class SalesIntelligenceEngine {

  // Default configuration para restaurantes
  private static readonly DEFAULT_CONFIG: SalesIntelligenceConfig = {
    enablePredictiveAlerts: true,
    enableCrossModuleCorrelation: true,
    alertRetentionHours: 24,
    maxAlertsPerType: 3,

    thresholds: {
      dailyTarget: 5000,     // $5000 daily target
      weeklyTarget: 35000,   // $35000 weekly target
      monthlyTarget: 150000, // $150000 monthly target

      minConversionRate: 85,    // 85% minimum conversion rate
      maxServiceTime: 30,       // 30 minutes max service time
      minTableTurnover: 3,      // 3 times per day minimum

      criticalRevenueThreshold: 25, // 25% below target = critical
      warningRevenueThreshold: 15,  // 15% below target = warning
      lowConversionThreshold: 80,   // Below 80% conversion = alert
      slowServiceThreshold: 35      // Above 35 minutes = slow service
    },

    businessHours: {
      start: 8,  // 8 AM
      end: 23    // 11 PM
    },

    peakHours: [12, 13, 18, 19, 20, 21] // Lunch and dinner peaks
  };

  // ============================================================================
  // MAIN ANALYSIS METHODS
  // ============================================================================

  /**
   * Genera alertas inteligentes basadas en datos de ventas
   */
  static generateSalesAlerts(
    salesData: SalesAnalysisData,
    config: Partial<SalesIntelligenceConfig> = {}
  ): SalesAlert[] {
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config };
    const alerts: SalesAlert[] = [];
    const now = new Date().toISOString();

    // 1. Revenue Pattern Analysis
    alerts.push(...this.analyzeRevenuePatterns(salesData, fullConfig, now));

    // 2. Conversion Rate Analysis
    alerts.push(...this.analyzeConversionRates(salesData, fullConfig, now));

    // 3. Service Efficiency Analysis
    alerts.push(...this.analyzeServiceEfficiency(salesData, fullConfig, now));

    // 4. Cross-Module Impact Analysis
    if (fullConfig.enableCrossModuleCorrelation) {
      alerts.push(...this.analyzeCrossModuleImpact(salesData, fullConfig, now));
    }

    // 5. Predictive Opportunities
    if (fullConfig.enablePredictiveAlerts) {
      alerts.push(...this.analyzePredictiveOpportunities(salesData, fullConfig, now));
    }

    // Filtrar y priorizar alertas
    return this.prioritizeAndFilterAlerts(alerts, fullConfig);
  }

  // ============================================================================
  // REVENUE PATTERN ANALYSIS
  // ============================================================================

  private static analyzeRevenuePatterns(
    data: SalesAnalysisData,
    config: SalesIntelligenceConfig,
    timestamp: string
  ): SalesAlert[] {
    const alerts: SalesAlert[] = [];
    const { todayRevenue, targetRevenue } = data;
    const { thresholds } = config;

    // ✅ PRECISION FIX: Use DecimalUtils.calculatePercentage for revenue deviation
    const revenueDeviationDec = DecimalUtils.calculatePercentage(
      targetRevenue - todayRevenue,
      targetRevenue,
      'financial'
    );
    const revenueDeviation = revenueDeviationDec.toNumber();

    if (revenueDeviation >= thresholds.criticalRevenueThreshold) {
      // Revenue crítico
      alerts.push({
        id: `revenue_critical_${timestamp}`,
        type: 'revenue_critical',
        severity: 'critical',
        title: 'Revenue Crítico',
        description: `Revenue hoy ${formatCurrency(todayRevenue)} está ${revenueDeviation.toFixed(1)}% debajo del objetivo`,
        currentValue: todayRevenue,
        targetValue: targetRevenue,
        deviation: Math.round(revenueDeviation),
        recommendedAction: 'ACCIÓN INMEDIATA: Revisar estrategia de precios y activar promociones',
        actionPriority: 5,
        estimatedImpact: 'high',
        timeToAction: 'immediate',
        affectedModules: ['materials', 'staff', 'marketing'],
        correlationData: {
          weeklyTrend: this.calculateWeeklyTrend(data),
          seasonalFactor: this.getSeasonalFactor()
        },
        generatedAt: timestamp,
        isAcknowledged: false,
        contextData: {
          hourlyBreakdown: this.estimateHourlyRevenue(data),
          expectedEndOfDayRevenue: this.predictEndOfDayRevenue(data),
          actionsSuggested: [
            'Activar promociones de happy hour',
            'Revisar disponibilidad de productos populares',
            'Optimizar staffing para peak hours'
          ]
        }
      });
    } else if (revenueDeviation >= thresholds.warningRevenueThreshold) {
      // Revenue warning
      alerts.push({
        id: `revenue_warning_${timestamp}`,
        type: 'revenue_below_target',
        severity: 'warning',
        title: 'Revenue Debajo del Objetivo',
        description: `Revenue ${revenueDeviation.toFixed(1)}% debajo del objetivo diario`,
        currentValue: todayRevenue,
        targetValue: targetRevenue,
        deviation: Math.round(revenueDeviation),
        recommendedAction: 'Monitorear y considerar ajustes de marketing',
        actionPriority: 3,
        estimatedImpact: 'medium',
        timeToAction: 'within_24h',
        affectedModules: ['marketing'],
        correlationData: {
          competitorAnalysis: 'pending',
          weatherImpact: this.getWeatherImpact()
        },
        generatedAt: timestamp,
        isAcknowledged: false,
        contextData: {
          recoveryOpportunities: this.identifyRecoveryOpportunities(data),
          timeLeft: this.calculateTimeLeftInDay()
        }
      });
    }

    return alerts;
  }

  // ============================================================================
  // CONVERSION RATE ANALYSIS
  // ============================================================================

  private static analyzeConversionRates(
    data: SalesAnalysisData,
    config: SalesIntelligenceConfig,
    timestamp: string
  ): SalesAlert[] {
    const alerts: SalesAlert[] = [];
    const { conversionRate, averageServiceTime, tableOccupancy } = data;
    const { thresholds } = config;

    // Conversion rate analysis
    if (conversionRate < thresholds.lowConversionThreshold) {
      // ✅ PRECISION FIX: Use DecimalUtils.calculatePercentage for conversion deviation
      const conversionDeviationDec = DecimalUtils.calculatePercentage(
        thresholds.minConversionRate - conversionRate,
        thresholds.minConversionRate,
        'financial'
      );
      const conversionDeviation = conversionDeviationDec.toNumber();

      alerts.push({
        id: `conversion_low_${timestamp}`,
        type: 'conversion_low',
        severity: conversionRate < 70 ? 'critical' : 'warning',
        title: 'Conversión Baja',
        description: `Tasa de conversión ${conversionRate.toFixed(1)}% debajo del mínimo`,
        currentValue: conversionRate,
        targetValue: thresholds.minConversionRate,
        deviation: Math.round(conversionDeviation),
        recommendedAction: this.getConversionRecommendation(conversionRate),
        actionPriority: 4,
        estimatedImpact: 'high',
        timeToAction: 'within_1h',
        affectedModules: ['staff', 'kitchen'],
        correlationData: {
          serviceTimeCorrelation: averageServiceTime,
          occupancyCorrelation: tableOccupancy
        },
        generatedAt: timestamp,
        isAcknowledged: false,
        contextData: {
          possibleCauses: this.identifyConversionIssues(data),
          quickWins: [
            'Revisar tiempo de espera en mesas',
            'Verificar disponibilidad de platos populares',
            'Optimizar proceso de pago'
          ]
        }
      });
    }

    // Service time analysis
    if (averageServiceTime > thresholds.slowServiceThreshold) {
      alerts.push({
        id: `service_slow_${timestamp}`,
        type: 'service_slow',
        severity: 'warning',
        title: 'Servicio Lento',
        description: `Tiempo promedio de servicio ${averageServiceTime} min excede el límite`,
        currentValue: averageServiceTime,
        targetValue: thresholds.maxServiceTime,
        deviation: Math.round(((averageServiceTime - thresholds.maxServiceTime) / thresholds.maxServiceTime) * 100),
        recommendedAction: 'Optimizar flujo de cocina y servicio',
        actionPriority: 3,
        estimatedImpact: 'medium',
        timeToAction: 'within_1h',
        affectedModules: ['staff', 'kitchen'],
        correlationData: {
          kitchenEfficiency: data.kitchenEfficiency || 85,
          staffCount: data.staffCapacity || 90
        },
        generatedAt: timestamp,
        isAcknowledged: false,
        contextData: {
          bottlenecks: this.identifyServiceBottlenecks(data),
          recommendations: [
            'Aumentar staff en cocina',
            'Revisar complejidad del menú',
            'Optimizar sistema de pedidos'
          ]
        }
      });
    }

    return alerts;
  }

  // ============================================================================
  // SERVICE EFFICIENCY ANALYSIS
  // ============================================================================

  private static analyzeServiceEfficiency(
    data: SalesAnalysisData,
    config: SalesIntelligenceConfig,
    timestamp: string
  ): SalesAlert[] {
    const alerts: SalesAlert[] = [];
    const { tableOccupancy, tablesTurnover } = data;
    const { thresholds } = config;

    // Table efficiency analysis
    if (tablesTurnover < thresholds.minTableTurnover) {
      // ✅ PRECISION FIX: Use DecimalUtils.calculatePercentage for turnover deviation
      const turnoverDeviationDec = DecimalUtils.calculatePercentage(
        thresholds.minTableTurnover - tablesTurnover,
        thresholds.minTableTurnover,
        'financial'
      );
      const turnoverDeviation = turnoverDeviationDec.toNumber();

      alerts.push({
        id: `table_inefficiency_${timestamp}`,
        type: 'table_inefficiency',
        severity: 'warning',
        title: 'Eficiencia de Mesas Baja',
        description: `Rotación de mesas ${tablesTurnover.toFixed(1)} veces/día debajo del mínimo`,
        currentValue: tablesTurnover,
        targetValue: thresholds.minTableTurnover,
        deviation: Math.round(turnoverDeviation),
        recommendedAction: 'Optimizar gestión de mesas y tiempo de servicio',
        actionPriority: 3,
        estimatedImpact: 'medium',
        timeToAction: 'within_24h',
        affectedModules: ['staff'],
        correlationData: {
          occupancyRate: tableOccupancy,
          averageServiceTime: data.averageServiceTime
        },
        generatedAt: timestamp,
        isAcknowledged: false,
        contextData: {
          potentialRevenueLoss: this.calculatePotentialRevenueLoss(data),
          optimizationSuggestions: [
            'Implementar sistema de reservas más eficiente',
            'Reducir tiempo entre servicios',
            'Optimizar proceso de limpieza de mesas'
          ]
        }
      });
    }

    return alerts;
  }

  // ============================================================================
  // CROSS-MODULE IMPACT ANALYSIS
  // ============================================================================

  private static analyzeCrossModuleImpact(
    data: SalesAnalysisData,
    config: SalesIntelligenceConfig,
    timestamp: string
  ): SalesAlert[] {
    const alerts: SalesAlert[] = [];
    const { materialsStockCritical, staffCapacity } = data;
    // const kitchenEfficiency = data.kitchenEfficiency; // TODO: Use for kitchen performance alerts

    // Stock impact on sales
    if (materialsStockCritical > 0) {
      // ✅ PRECISION FIX: Use DecimalUtils for compound multiplication
      const potentialSalesLossDec = DecimalUtils.multiply(
        materialsStockCritical.toString(),
        DecimalUtils.multiply(
          data.averageOrderValue.toString(),
          '0.2',
          'financial'
        ),
        'financial'
      );
      const potentialSalesLoss = potentialSalesLossDec.toNumber();

      alerts.push({
        id: `cross_module_stock_impact_${timestamp}`,
        type: 'cross_module_impact',
        severity: materialsStockCritical > 3 ? 'critical' : 'warning',
        title: 'Stock Crítico Afecta Ventas',
        description: `${materialsStockCritical} productos con stock crítico afectan disponibilidad`,
        currentValue: materialsStockCritical,
        targetValue: 0,
        deviation: 100,
        recommendedAction: 'Coordinar reposición urgente con módulo Materials',
        actionPriority: 4,
        estimatedImpact: 'high',
        timeToAction: 'immediate',
        affectedModules: ['materials', 'kitchen'],
        correlationData: {
          estimatedSalesLoss: potentialSalesLoss,
          affectedProducts: 'high_demand_items' // En producción serían datos reales
        },
        generatedAt: timestamp,
        isAcknowledged: false,
        contextData: {
          materialImpact: `Pérdida estimada: ${formatCurrency(potentialSalesLoss)}`,
          urgentActions: [
            'Contactar proveedores prioritarios',
            'Activar productos sustitutos',
            'Notificar a staff sobre limitaciones'
          ]
        }
      });
    }

    // Staff capacity impact
    if (staffCapacity < 80) {
      alerts.push({
        id: `cross_module_staff_impact_${timestamp}`,
        type: 'cross_module_impact',
        severity: 'warning',
        title: 'Capacidad de Staff Limitada',
        description: `Staff al ${staffCapacity}% de capacidad óptima afecta servicio`,
        currentValue: staffCapacity,
        targetValue: 100,
        deviation: 100 - staffCapacity,
        recommendedAction: 'Coordinar refuerzos con módulo Staff',
        actionPriority: 3,
        estimatedImpact: 'medium',
        timeToAction: 'within_1h',
        affectedModules: ['staff'],
        correlationData: {
          serviceImpact: data.averageServiceTime,
          revenueImpact: this.estimateStaffRevenueImpact(staffCapacity)
        },
        generatedAt: timestamp,
        isAcknowledged: false,
        contextData: {
          staffingSuggestions: [
            'Llamar staff de reserva',
            'Redistribuir tareas críticas',
            'Priorizar mesas de alta facturación'
          ]
        }
      });
    }

    return alerts;
  }

  // ============================================================================
  // PREDICTIVE OPPORTUNITIES
  // ============================================================================

  private static analyzePredictiveOpportunities(
    data: SalesAnalysisData,
    config: SalesIntelligenceConfig,
    timestamp: string
  ): SalesAlert[] {
    const alerts: SalesAlert[] = [];
    const currentHour = new Date().getHours();
    const isPeakHour = config.peakHours.includes(currentHour);

    // Peak hour opportunity detection
    if (isPeakHour && data.tableOccupancy < 90) {
      const opportunityRevenue = (90 - data.tableOccupancy) * data.averageOrderValue * 0.01;

      alerts.push({
        id: `predictive_peak_opportunity_${timestamp}`,
        type: 'predictive_opportunity',
        severity: 'info',
        title: 'Oportunidad Peak Hour',
        description: `Peak hour detectada con ${data.tableOccupancy}% ocupación - oportunidad de crecimiento`,
        currentValue: data.tableOccupancy,
        targetValue: 90,
        deviation: 90 - data.tableOccupancy,
        recommendedAction: 'Activar marketing inmediato y optimizar capacidad',
        actionPriority: 2,
        estimatedImpact: 'medium',
        timeToAction: 'within_1h',
        affectedModules: ['marketing', 'staff'],
        correlationData: {
          peakHourPattern: 'detected',
          opportunityValue: opportunityRevenue
        },
        generatedAt: timestamp,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
        isAcknowledged: false,
        contextData: {
          marketingActions: [
            'Enviar push notifications a app users',
            'Activar descuentos flash',
            'Promocionar en redes sociales'
          ],
          revenueOpportunity: formatCurrency(opportunityRevenue)
        }
      });
    }

    return alerts;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private static prioritizeAndFilterAlerts(
    alerts: SalesAlert[],
    config: SalesIntelligenceConfig
  ): SalesAlert[] {
    // Ordenar por prioridad y severidad
    const prioritized = alerts.sort((a, b) => {
      if (a.actionPriority !== b.actionPriority) {
        return b.actionPriority - a.actionPriority;
      }

      const severityOrder = { urgent: 4, critical: 3, warning: 2, info: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

    // Limitar alertas por tipo
    const byType = new Map<SalesAlertType, SalesAlert[]>();
    prioritized.forEach(alert => {
      if (!byType.has(alert.type)) {
        byType.set(alert.type, []);
      }
      const typeAlerts = byType.get(alert.type)!;
      if (typeAlerts.length < config.maxAlertsPerType) {
        typeAlerts.push(alert);
      }
    });

    return Array.from(byType.values()).flat();
  }

  // Helper methods
  private static calculateWeeklyTrend(data: SalesAnalysisData): number {
    // ✅ PRECISION FIX: Use DecimalUtils.calculatePercentage for weekly trend
    const trendDec = DecimalUtils.calculatePercentage(
      data.todayRevenue - data.lastWeekRevenue,
      data.lastWeekRevenue,
      'financial'
    );
    return trendDec.toNumber();
  }

  private static getSeasonalFactor(): number {
    // Simplified seasonal factor
    const month = new Date().getMonth();
    return month >= 5 && month <= 8 ? 1.2 : 1.0; // Summer boost
  }

  private static estimateHourlyRevenue(data: SalesAnalysisData): Record<string, number> {
    // Simplified hourly breakdown
    const hoursLeft = 24 - new Date().getHours();
    const revenuePerHour = data.todayRevenue / (24 - hoursLeft);
    return { averagePerHour: revenuePerHour };
  }

  private static predictEndOfDayRevenue(data: SalesAnalysisData): number {
    const currentHour = new Date().getHours();
    const hoursLeft = 24 - currentHour;
    const revenuePerHour = data.todayRevenue / currentHour;
    return data.todayRevenue + (revenuePerHour * hoursLeft * 0.7); // Conservative estimate
  }

  private static getWeatherImpact(): string {
    // Placeholder - en producción integraría con API del clima
    return 'neutral';
  }

  private static identifyRecoveryOpportunities(/* data: SalesAnalysisData */): string[] {
    // TODO: Use data parameter to generate data-driven recommendations
    return [
      'Activar promociones de última hora',
      'Optimizar delivery/takeout',
      'Impulsar productos de alto margen'
    ];
  }

  private static calculateTimeLeftInDay(): number {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return Math.round((endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60)); // hours
  }

  private static getConversionRecommendation(rate: number): string {
    if (rate < 70) return 'CRÍTICO: Revisar proceso completo de servicio';
    if (rate < 80) return 'Optimizar puntos de fricción en servicio';
    return 'Monitorear y ajustar procesos menores';
  }

  private static identifyConversionIssues(data: SalesAnalysisData): string[] {
    const issues = [];
    if (data.averageServiceTime > 30) issues.push('Tiempo de servicio excesivo');
    if (data.paymentSuccessRate < 95) issues.push('Problemas en procesamiento de pagos');
    if (data.tableOccupancy > 85) issues.push('Saturación de capacidad');
    return issues;
  }

  private static identifyServiceBottlenecks(data: SalesAnalysisData): string[] {
    const bottlenecks = [];
    if (data.kitchenEfficiency < 85) bottlenecks.push('Eficiencia de cocina');
    if (data.staffCapacity < 90) bottlenecks.push('Capacidad de staff');
    return bottlenecks;
  }

  private static calculatePotentialRevenueLoss(data: SalesAnalysisData): number {
    const optimalTurnover = 3;
    const currentTurnover = data.tablesTurnover;
    const lostTurns = Math.max(0, optimalTurnover - currentTurnover);
    return lostTurns * data.averageOrderValue * 10; // Estimación para 10 mesas
  }

  private static estimateStaffRevenueImpact(staffCapacity: number): number {
    const impact = Math.max(0, 100 - staffCapacity);
    return impact * 50; // $50 per % point of staff shortage
  }
}