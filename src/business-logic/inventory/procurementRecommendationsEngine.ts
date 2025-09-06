// ============================================================================
// PROCUREMENT RECOMMENDATIONS ENGINE - Business Logic
// ============================================================================
// Sistema inteligente de recomendaciones de compra integrado con ABC Analysis y Smart Alerts

import { type MaterialItem } from '@/pages/admin/materials/types';
import { type MaterialABC, type ABCClass } from '@/pages/admin/materials/types/abc-analysis';
import { SmartAlertsEngine, type SmartAlert } from './smartAlertsEngine';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { InventoryDecimal, DECIMAL_CONSTANTS } from '@/config/decimal-config';

// ============================================================================
// TYPES
// ============================================================================

export type RecommendationType = 
  | 'urgent_restock'     // Restock inmediato por stock crítico
  | 'planned_restock'    // Restock planificado por bajo stock
  | 'bulk_purchase'      // Compra en lote para optimizar costos
  | 'just_in_time'       // Compra JIT para items críticos
  | 'seasonal_stock'     // Stock estacional anticipado
  | 'price_optimization' // Aprovechar precio favorable
  | 'supplier_consolidation'; // Consolidar con otros pedidos

export type ProcurementPriority = 1 | 2 | 3 | 4 | 5; // 5 = más urgente

export type ProcurementStrategy = 
  | 'immediate'    // Comprar inmediatamente
  | 'within_24h'   // Comprar en 24 horas
  | 'within_week'  // Comprar esta semana
  | 'next_order'   // Incluir en próximo pedido
  | 'monitor';     // Solo monitorear

// Recomendación individual de compra
export interface ProcurementRecommendation {
  id: string;
  itemId: string;
  itemName: string;
  abcClass: ABCClass;
  
  // Tipo y prioridad
  type: RecommendationType;
  priority: ProcurementPriority;
  strategy: ProcurementStrategy;
  
  // Métricas actuales
  currentStock: number;
  optimalStock: number;
  reorderPoint: number;
  
  // Recomendación de compra
  recommendedQuantity: number;
  recommendedValue: number;
  unit: string;
  
  // Análisis financiero
  estimatedCostSavings: number;
  opportunityCost: number;
  carryingCost: number;
  orderingCost: number;
  
  // Timing
  estimatedDeliveryDays: number;
  optimalOrderDate: string;
  stockoutRisk: number; // % probabilidad de stock-out
  
  // Justificación
  reasoning: string;
  confidence: number; // % confianza en la recomendación
  
  // Contexto de alertas relacionadas
  relatedAlerts: string[]; // IDs de alertas que generaron esta recomendación
  
  // Metadata
  generatedAt: string;
  validUntil: string;
  
  // Acciones sugeridas
  actions: ProcurementAction[];
}

export interface ProcurementAction {
  id: string;
  label: string;
  type: 'create_order' | 'contact_supplier' | 'request_quote' | 'schedule_delivery' | 'view_details';
  parameters?: Record<string, any>;
  autoExecute?: boolean;
}

// Configuración del engine
export interface ProcurementEngineConfig {
  // Parámetros generales
  leadTimeBuffer: number; // días adicionales de buffer
  safetyStockMultiplier: number; // multiplicador de stock de seguridad
  
  // Estrategias por clase ABC
  strategies: Record<ABCClass, {
    reorderPolicy: 'min_max' | 'economic_order_quantity' | 'just_in_time';
    safetyStockDays: number;
    maxStockDays: number;
    reviewFrequencyDays: number;
  }>;
  
  // Costos
  orderingCostPerOrder: number;
  carryingCostPercentage: number; // % anual del valor del inventario
  stockoutCostMultiplier: number; // costo de ruptura como % del valor
  
  // Machine learning parameters
  historicalDataMonths: number;
  seasonalityWeighting: number; // 0-1
  trendWeighting: number; // 0-1
  
  // Filtros
  minRecommendationValue: number;
  maxRecommendations: number;
  confidenceThreshold: number; // % mínimo de confianza
}

// Resultado completo del análisis
export interface ProcurementAnalysisResult {
  // Metadata
  generatedAt: string;
  config: ProcurementEngineConfig;
  totalItemsAnalyzed: number;
  
  // Recomendaciones por prioridad
  urgentRecommendations: ProcurementRecommendation[];
  plannedRecommendations: ProcurementRecommendation[];
  opportunityRecommendations: ProcurementRecommendation[];
  
  // Análisis consolidado
  totalRecommendedInvestment: number;
  estimatedTotalSavings: number;
  averageConfidence: number;
  
  // Métricas por clase ABC
  metricsByClass: Record<ABCClass, {
    itemCount: number;
    recommendedInvestment: number;
    estimatedSavings: number;
    averagePriority: number;
  }>;
  
  // Consolidación por proveedor (si hay datos)
  supplierOpportunities?: Array<{
    supplierId?: string;
    supplierName?: string;
    totalValue: number;
    itemCount: number;
    recommendedItems: string[];
    estimatedDiscount: number;
  }>;
  
  // Alertas integradas
  triggeredByAlerts: string[];
  newAlertsToGenerate: Array<{
    type: 'procurement_opportunity' | 'budget_required' | 'supplier_contact_needed';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    metadata: Record<string, any>;
  }>;
}

// ============================================================================
// PROCUREMENT RECOMMENDATIONS ENGINE
// ============================================================================

export class ProcurementRecommendationsEngine {
  
  // Configuración por defecto optimizada para restaurantes
  private static readonly DEFAULT_CONFIG: ProcurementEngineConfig = {
    leadTimeBuffer: 2, // 2 días de buffer adicional
    safetyStockMultiplier: 1.5,
    
    strategies: {
      A: {
        reorderPolicy: 'just_in_time',
        safetyStockDays: 3,
        maxStockDays: 10,
        reviewFrequencyDays: 1
      },
      B: {
        reorderPolicy: 'economic_order_quantity',
        safetyStockDays: 7,
        maxStockDays: 21,
        reviewFrequencyDays: 3
      },
      C: {
        reorderPolicy: 'min_max',
        safetyStockDays: 14,
        maxStockDays: 45,
        reviewFrequencyDays: 7
      }
    },
    
    orderingCostPerOrder: 150, // Costo fijo por pedido en ARS
    carryingCostPercentage: 25, // 25% anual
    stockoutCostMultiplier: 3, // 3x el valor como costo de ruptura
    
    historicalDataMonths: 6,
    seasonalityWeighting: 0.3,
    trendWeighting: 0.2,
    
    minRecommendationValue: 500, // Mínimo ARS $500
    maxRecommendations: 50,
    confidenceThreshold: 60 // Mínimo 60% confianza
  };

  // ============================================================================
  // MAIN ANALYSIS METHOD
  // ============================================================================

  /**
   * Genera recomendaciones inteligentes de compra basadas en ABC Analysis y alertas
   */
  static async generateProcurementRecommendations(
    materials: MaterialABC[],
    existingAlerts?: SmartAlert[],
    config: Partial<ProcurementEngineConfig> = {}
  ): Promise<ProcurementAnalysisResult> {
    
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config };
    const timestamp = new Date().toISOString();
    
    // 1. Generar alertas si no se proporcionaron
    const alerts = existingAlerts || SmartAlertsEngine.generateSmartAlerts(materials);
    
    // 2. Analizar cada material para recomendaciones
    const allRecommendations = await Promise.all(
      materials.map(material => 
        this.analyzeMaterialForRecommendations(material, alerts, fullConfig, timestamp)
      )
    );
    
    // 3. Filtrar y consolidar recomendaciones
    const validRecommendations = allRecommendations
      .filter(rec => rec !== null)
      .filter(rec => rec!.confidence >= fullConfig.confidenceThreshold)
      .sort((a, b) => b!.priority - a!.priority) // Ordenar por prioridad
      .slice(0, fullConfig.maxRecommendations) as ProcurementRecommendation[];
    
    // 4. Categorizar por prioridad
    const result = this.categorizeAndConsolidateRecommendations(
      validRecommendations, 
      alerts, 
      fullConfig, 
      timestamp
    );
    
    return result;
  }

  // ============================================================================
  // INDIVIDUAL MATERIAL ANALYSIS
  // ============================================================================

  private static async analyzeMaterialForRecommendations(
    material: MaterialABC,
    alerts: SmartAlert[],
    config: ProcurementEngineConfig,
    timestamp: string
  ): Promise<ProcurementRecommendation | null> {
    
    // Encontrar alertas relacionadas con este material
    const relatedAlerts = alerts.filter(alert => alert.itemId === material.id);
    
    // Si no hay alertas y el stock es normal, no generar recomendación
    if (relatedAlerts.length === 0 && this.isStockNormal(material, config)) {
      return null;
    }
    
    // Calcular métricas base
    const metrics = this.calculateBaseMetrics(material, config);
    
    // Determinar tipo de recomendación basado en alertas y análisis
    const recommendationType = this.determineRecommendationType(material, relatedAlerts, metrics);
    
    // Calcular cantidad y timing óptimos
    const procurement = this.calculateOptimalProcurement(material, recommendationType, metrics, config);
    
    // Análisis financiero
    const financialAnalysis = this.calculateFinancialImpact(material, procurement, config);
    
    // Generar justificación
    const reasoning = this.generateReasoning(material, relatedAlerts, recommendationType, metrics);
    
    // Calcular confianza en la recomendación
    const confidence = this.calculateRecommendationConfidence(material, relatedAlerts, metrics);
    
    const recommendation: ProcurementRecommendation = {
      id: `proc_${material.id}_${timestamp}`,
      itemId: material.id,
      itemName: material.name,
      abcClass: material.abcClass,
      
      type: recommendationType,
      priority: this.calculatePriority(material, relatedAlerts, recommendationType),
      strategy: this.determineStrategy(recommendationType, material.abcClass),
      
      currentStock: material.currentStock,
      optimalStock: metrics.optimalStock,
      reorderPoint: metrics.reorderPoint,
      
      recommendedQuantity: procurement.quantity,
      recommendedValue: procurement.value,
      unit: this.getUnit(material),
      
      estimatedCostSavings: financialAnalysis.savings,
      opportunityCost: financialAnalysis.opportunityCost,
      carryingCost: financialAnalysis.carryingCost,
      orderingCost: financialAnalysis.orderingCost,
      
      estimatedDeliveryDays: config.strategies[material.abcClass].safetyStockDays + config.leadTimeBuffer,
      optimalOrderDate: this.calculateOptimalOrderDate(material, procurement, config),
      stockoutRisk: this.calculateStockoutRisk(material, metrics),
      
      reasoning,
      confidence,
      
      relatedAlerts: relatedAlerts.map(alert => alert.id),
      
      generatedAt: timestamp,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
      
      actions: this.generateProcurementActions(material, recommendationType, procurement)
    };
    
    return recommendation;
  }

  // ============================================================================
  // CALCULATION METHODS
  // ============================================================================

  private static calculateBaseMetrics(material: MaterialABC, config: ProcurementEngineConfig) {
    const dailyConsumption = DecimalUtils.divide(
      material.monthlyConsumption || material.annualConsumption / 12, 
      30, 
      'inventory'
    );
    
    const strategy = config.strategies[material.abcClass];
    
    // Stock de seguridad
    const safetyStock = DecimalUtils.multiply(
      dailyConsumption, 
      strategy.safetyStockDays * config.safetyStockMultiplier,
      'inventory'
    );
    
    // Punto de reorden
    const leadTimeDemand = DecimalUtils.multiply(
      dailyConsumption,
      strategy.safetyStockDays + config.leadTimeBuffer,
      'inventory'
    );
    
    const reorderPoint = DecimalUtils.add(leadTimeDemand, safetyStock, 'inventory');
    
    // Stock óptimo
    const optimalStock = DecimalUtils.multiply(
      dailyConsumption,
      strategy.maxStockDays,
      'inventory'
    );
    
    return {
      dailyConsumption: dailyConsumption.toNumber(),
      safetyStock: safetyStock.toNumber(),
      reorderPoint: reorderPoint.toNumber(),
      optimalStock: optimalStock.toNumber(),
      leadTimeDemand: leadTimeDemand.toNumber()
    };
  }

  private static calculateOptimalProcurement(
    material: MaterialABC, 
    type: RecommendationType,
    metrics: any,
    config: ProcurementEngineConfig
  ) {
    let quantity: number;
    
    switch (type) {
      case 'urgent_restock':
        // Urgente: llevar al punto de reorden + buffer
        quantity = Math.max(
          metrics.reorderPoint - material.currentStock + metrics.safetyStock,
          metrics.dailyConsumption * 3 // Mínimo 3 días
        );
        break;
        
      case 'planned_restock':
        // Planificado: llevar al stock óptimo
        quantity = metrics.optimalStock - material.currentStock;
        break;
        
      case 'just_in_time':
        // JIT: cantidad justa para cubrir lead time + seguridad
        quantity = metrics.leadTimeDemand + metrics.safetyStock;
        break;
        
      case 'bulk_purchase':
        // Lote: cantidad económica optimizada
        quantity = this.calculateEconomicOrderQuantity(material, config);
        break;
        
      default:
        quantity = Math.max(metrics.optimalStock - material.currentStock, 0);
    }
    
    // Asegurar cantidad mínima positiva
    quantity = Math.max(quantity, 1);
    
    const value = DecimalUtils.multiply(
      quantity, 
      material.unit_cost || 0, 
      'inventory'
    ).toNumber();
    
    return { quantity: Math.round(quantity), value };
  }

  private static calculateEconomicOrderQuantity(material: MaterialABC, config: ProcurementEngineConfig): number {
    // Fórmula EOQ: √(2DS/H)
    // D = demanda anual, S = costo de pedido, H = costo de mantener inventario
    
    const annualDemand = DecimalUtils.fromValue(material.annualConsumption, 'inventory');
    const orderingCost = DecimalUtils.fromValue(config.orderingCostPerOrder, 'inventory');
    const unitCost = DecimalUtils.fromValue(material.unit_cost || 0, 'inventory');
    const holdingCostRate = DecimalUtils.fromValue(config.carryingCostPercentage / 100, 'inventory');
    
    const holdingCostPerUnit = DecimalUtils.multiply(unitCost, holdingCostRate, 'inventory');
    
    if (holdingCostPerUnit.isZero()) return material.monthlyConsumption || 10; // Fallback
    
    const numerator = DecimalUtils.multiply(
      DecimalUtils.multiply(DECIMAL_CONSTANTS.ONE.plus(DECIMAL_CONSTANTS.ONE), annualDemand, 'inventory'),
      orderingCost,
      'inventory'
    );
    
    const eoq = DecimalUtils.fromValue(
      Math.sqrt(DecimalUtils.divide(numerator, holdingCostPerUnit, 'inventory').toNumber()),
      'inventory'
    );
    
    return Math.max(eoq.toNumber(), 1);
  }

  private static calculateFinancialImpact(
    material: MaterialABC,
    procurement: { quantity: number; value: number },
    config: ProcurementEngineConfig
  ) {
    const unitCost = DecimalUtils.fromValue(material.unit_cost || 0, 'inventory');
    const quantity = DecimalUtils.fromValue(procurement.quantity, 'inventory');
    
    // Costo de mantener inventario (anual, prorrateado)
    const carryingCost = DecimalUtils.multiply(
      DecimalUtils.multiply(unitCost, quantity, 'inventory'),
      DecimalUtils.divide(config.carryingCostPercentage, 100, 'inventory'),
      'inventory'
    ).toNumber();
    
    // Costo de pedido
    const orderingCost = config.orderingCostPerOrder;
    
    // Costo de oportunidad (no comprar podría significar stock-out)
    const stockoutValue = DecimalUtils.multiply(
      unitCost,
      quantity,
      'inventory'
    );
    const opportunityCost = DecimalUtils.multiply(
      stockoutValue,
      config.stockoutCostMultiplier,
      'inventory'
    ).toNumber();
    
    // Ahorro estimado vs stock-out
    const savings = Math.max(0, opportunityCost - carryingCost - orderingCost);
    
    return {
      carryingCost,
      orderingCost,
      opportunityCost,
      savings
    };
  }

  // ============================================================================
  // CLASSIFICATION AND LOGIC METHODS
  // ============================================================================

  private static determineRecommendationType(
    material: MaterialABC,
    relatedAlerts: SmartAlert[],
    metrics: any
  ): RecommendationType {
    
    // Si hay alertas urgentes/críticas
    const criticalAlerts = relatedAlerts.filter(alert => 
      alert.severity === 'urgent' || alert.severity === 'critical'
    );
    
    if (criticalAlerts.length > 0) {
      const stockoutAlert = criticalAlerts.find(alert => alert.type === 'out_of_stock');
      if (stockoutAlert) return 'urgent_restock';
      
      const lowStockAlert = criticalAlerts.find(alert => alert.type === 'low_stock');
      if (lowStockAlert && material.abcClass === 'A') return 'just_in_time';
      if (lowStockAlert) return 'urgent_restock';
    }
    
    // Análisis basado en stock actual vs métricas
    if (material.currentStock <= metrics.reorderPoint) {
      return material.abcClass === 'A' ? 'just_in_time' : 'planned_restock';
    }
    
    // Para clase C, considerar compras en lote
    if (material.abcClass === 'C' && material.currentStock < metrics.optimalStock * 0.7) {
      return 'bulk_purchase';
    }
    
    return 'planned_restock';
  }

  private static calculatePriority(
    material: MaterialABC,
    relatedAlerts: SmartAlert[],
    type: RecommendationType
  ): ProcurementPriority {
    
    let basePriority = 3; // Media por defecto
    
    // Ajustar por clase ABC
    switch (material.abcClass) {
      case 'A': basePriority = 4; break;
      case 'B': basePriority = 3; break;
      case 'C': basePriority = 2; break;
    }
    
    // Ajustar por tipo de recomendación
    switch (type) {
      case 'urgent_restock': basePriority = 5; break;
      case 'just_in_time': basePriority = Math.min(5, basePriority + 1); break;
      case 'bulk_purchase': basePriority = Math.max(1, basePriority - 1); break;
    }
    
    // Ajustar por alertas críticas
    const criticalAlerts = relatedAlerts.filter(alert => 
      alert.severity === 'urgent' || alert.severity === 'critical'
    );
    if (criticalAlerts.length > 0) {
      basePriority = Math.min(5, basePriority + 1);
    }
    
    return basePriority as ProcurementPriority;
  }

  private static determineStrategy(type: RecommendationType, abcClass: ABCClass): ProcurementStrategy {
    if (type === 'urgent_restock') return 'immediate';
    if (type === 'just_in_time' && abcClass === 'A') return 'within_24h';
    if (type === 'planned_restock') return abcClass === 'A' ? 'within_24h' : 'within_week';
    if (type === 'bulk_purchase') return 'next_order';
    
    return 'within_week';
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private static isStockNormal(material: MaterialABC, config: ProcurementEngineConfig): boolean {
    const metrics = this.calculateBaseMetrics(material, config);
    return material.currentStock > metrics.reorderPoint;
  }

  private static generateReasoning(
    material: MaterialABC,
    alerts: SmartAlert[],
    type: RecommendationType,
    metrics: any
  ): string {
    let reasoning = `Análisis para ${material.name} (Clase ${material.abcClass}): `;
    
    if (alerts.length > 0) {
      reasoning += `${alerts.length} alerta${alerts.length > 1 ? 's' : ''} activa${alerts.length > 1 ? 's' : ''}. `;
    }
    
    reasoning += `Stock actual: ${DecimalUtils.formatQuantity(material.currentStock, this.getUnit(material))}. `;
    reasoning += `Punto de reorden: ${DecimalUtils.formatQuantity(metrics.reorderPoint, this.getUnit(material))}. `;
    
    switch (type) {
      case 'urgent_restock':
        reasoning += 'Restock urgente requerido para evitar ruptura de stock.';
        break;
      case 'just_in_time':
        reasoning += 'Estrategia JIT recomendada para item crítico.';
        break;
      case 'bulk_purchase':
        reasoning += 'Compra en lote para optimizar costos de pedido.';
        break;
      default:
        reasoning += 'Restock planificado para mantener niveles óptimos.';
    }
    
    return reasoning;
  }

  private static calculateRecommendationConfidence(
    material: MaterialABC,
    alerts: SmartAlert[],
    metrics: any
  ): number {
    let confidence = 70; // Base
    
    // Mayor confianza con más datos históricos
    if (material.monthlyConsumption && material.monthlyConsumption > 0) confidence += 10;
    if (material.annualConsumption && material.annualConsumption > 0) confidence += 10;
    
    // Mayor confianza con alertas que confirman la necesidad
    confidence += Math.min(alerts.length * 5, 15);
    
    // Mayor confianza para items clase A (más datos disponibles típicamente)
    if (material.abcClass === 'A') confidence += 5;
    
    return Math.min(confidence, 95); // Máximo 95%
  }

  private static calculateOptimalOrderDate(
    material: MaterialABC,
    procurement: { quantity: number; value: number },
    config: ProcurementEngineConfig
  ): string {
    const strategy = config.strategies[material.abcClass];
    const daysToOrder = strategy.safetyStockDays + config.leadTimeBuffer;
    
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() + daysToOrder);
    
    return orderDate.toISOString();
  }

  private static calculateStockoutRisk(material: MaterialABC, metrics: any): number {
    const stockRatio = material.currentStock / metrics.reorderPoint;
    
    if (stockRatio <= 0) return 95; // Sin stock = alto riesgo
    if (stockRatio <= 0.5) return 70; // Muy bajo stock
    if (stockRatio <= 1) return 30; // Por debajo del punto de reorden
    if (stockRatio <= 1.5) return 10; // Stock bajo pero seguro
    
    return 5; // Stock suficiente
  }

  private static generateProcurementActions(
    material: MaterialABC,
    type: RecommendationType,
    procurement: { quantity: number; value: number }
  ): ProcurementAction[] {
    const actions: ProcurementAction[] = [];
    
    // Acción principal
    actions.push({
      id: 'create_order',
      label: `Crear Pedido (${DecimalUtils.formatQuantity(procurement.quantity, this.getUnit(material))})`,
      type: 'create_order',
      parameters: {
        itemId: material.id,
        quantity: procurement.quantity,
        estimatedValue: procurement.value
      }
    });
    
    // Acciones secundarias según tipo
    if (type === 'urgent_restock' || material.abcClass === 'A') {
      actions.push({
        id: 'contact_supplier',
        label: 'Contactar Proveedor',
        type: 'contact_supplier',
        parameters: { itemId: material.id }
      });
    }
    
    actions.push({
      id: 'request_quote',
      label: 'Solicitar Cotización',
      type: 'request_quote',
      parameters: { itemId: material.id, quantity: procurement.quantity }
    });
    
    actions.push({
      id: 'view_details',
      label: 'Ver Detalles',
      type: 'view_details',
      parameters: { itemId: material.id }
    });
    
    return actions;
  }

  private static getUnit(material: MaterialABC): string {
    if ('unit' in material) {
      return material.unit as string;
    }
    return 'unidad';
  }

  // ============================================================================
  // CONSOLIDATION AND FINALIZATION
  // ============================================================================

  private static categorizeAndConsolidateRecommendations(
    recommendations: ProcurementRecommendation[],
    alerts: SmartAlert[],
    config: ProcurementEngineConfig,
    timestamp: string
  ): ProcurementAnalysisResult {
    
    // Categorizar por prioridad
    const urgentRecommendations = recommendations.filter(rec => rec.priority >= 4);
    const plannedRecommendations = recommendations.filter(rec => rec.priority === 3);
    const opportunityRecommendations = recommendations.filter(rec => rec.priority <= 2);
    
    // Cálculos consolidados
    const totalRecommendedInvestment = DecimalUtils.fromValue(
      recommendations.reduce((sum, rec) => sum + rec.recommendedValue, 0),
      'inventory'
    ).toNumber();
    
    const estimatedTotalSavings = DecimalUtils.fromValue(
      recommendations.reduce((sum, rec) => sum + rec.estimatedCostSavings, 0),
      'inventory'
    ).toNumber();
    
    const averageConfidence = recommendations.length > 0 
      ? recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length 
      : 0;
    
    // Métricas por clase ABC
    const metricsByClass = (['A', 'B', 'C'] as const).reduce((acc, className) => {
      const classRecs = recommendations.filter(rec => rec.abcClass === className);
      acc[className] = {
        itemCount: classRecs.length,
        recommendedInvestment: DecimalUtils.fromValue(
          classRecs.reduce((sum, rec) => sum + rec.recommendedValue, 0),
          'inventory'
        ).toNumber(),
        estimatedSavings: DecimalUtils.fromValue(
          classRecs.reduce((sum, rec) => sum + rec.estimatedCostSavings, 0),
          'inventory'
        ).toNumber(),
        averagePriority: classRecs.length > 0 
          ? classRecs.reduce((sum, rec) => sum + rec.priority, 0) / classRecs.length 
          : 0
      };
      return acc;
    }, {} as Record<ABCClass, any>);
    
    // Alertas relacionadas
    const triggeredByAlerts = [...new Set(
      recommendations.flatMap(rec => rec.relatedAlerts)
    )];
    
    // Nuevas alertas a generar
    const newAlertsToGenerate = [];
    
    // Alert si la inversión recomendada es muy alta
    if (totalRecommendedInvestment > 50000) { // ARS $50,000
      newAlertsToGenerate.push({
        type: 'budget_required' as const,
        severity: 'high' as const,
        message: `Inversión total recomendada: ${DecimalUtils.formatCurrency(totalRecommendedInvestment)}. Se requiere aprobación de presupuesto.`,
        metadata: { totalInvestment: totalRecommendedInvestment }
      });
    }
    
    // Alert para items urgentes
    if (urgentRecommendations.length > 0) {
      newAlertsToGenerate.push({
        type: 'procurement_opportunity' as const,
        severity: 'critical' as const,
        message: `${urgentRecommendations.length} items requieren restock urgente.`,
        metadata: { urgentItems: urgentRecommendations.map(rec => rec.itemId) }
      });
    }
    
    return {
      generatedAt: timestamp,
      config,
      totalItemsAnalyzed: recommendations.length,
      
      urgentRecommendations,
      plannedRecommendations,
      opportunityRecommendations,
      
      totalRecommendedInvestment,
      estimatedTotalSavings,
      averageConfidence,
      
      metricsByClass,
      
      triggeredByAlerts,
      newAlertsToGenerate
    };
  }
}