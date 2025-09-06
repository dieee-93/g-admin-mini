// ============================================================================
// SUPPLIER ANALYSIS ENGINE - Business Logic
// ============================================================================
// Sistema inteligente de análisis y rating de proveedores integrado con procurement

import { type Supplier, type MaterialItem } from '@/pages/admin/materials/types';
import { type MaterialABC } from '@/pages/admin/materials/types/abc-analysis';
import { type ProcurementRecommendation } from './procurementRecommendationsEngine';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { InventoryDecimal, DECIMAL_CONSTANTS } from '@/config/decimal-config';

// ============================================================================
// TYPES
// ============================================================================

export type SupplierRatingCategory = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export type SupplierRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ConsolidationOpportunity = 
  | 'high_potential'    // Alto potencial de consolidación
  | 'medium_potential'  // Potencial medio
  | 'low_potential'     // Bajo potencial
  | 'not_recommended';  // No recomendado

// Métricas base de performance del proveedor
export interface SupplierMetrics {
  // Métricas de calidad
  qualityScore: number;          // 0-100
  defectRate: number;           // % productos defectuosos
  returnRate: number;           // % devoluciones
  
  // Métricas de entrega
  onTimeDeliveryRate: number;   // % entregas a tiempo
  averageLeadTime: number;      // Días promedio de lead time
  leadTimeVariability: number;  // Desviación estándar del lead time
  
  // Métricas financieras
  paymentTermsScore: number;    // 0-100 basado en términos de pago
  priceCompetitiveness: number; // 0-100 vs mercado
  costStability: number;        // 0-100 estabilidad de precios
  
  // Métricas de servicio
  responsiveness: number;       // 0-100 tiempo de respuesta
  supportQuality: number;       // 0-100 calidad del soporte
  flexibilityScore: number;     // 0-100 capacidad de adaptación
  
  // Métricas de riesgo
  financialStability: number;   // 0-100 estabilidad financiera
  geographicRisk: number;       // 0-100 riesgo geográfico
  dependencyRisk: number;       // 0-100 riesgo por dependencia
}

// Análisis completo del proveedor
export interface SupplierAnalysis extends Supplier {
  // Rating y categorización
  overallRating: number;        // 0-100 rating general
  ratingCategory: SupplierRatingCategory;
  riskLevel: SupplierRiskLevel;
  
  // Métricas detalladas
  metrics: SupplierMetrics;
  
  // Análisis de negocio
  totalAnnualValue: number;     // Valor total anual de compras
  itemCount: number;           // Cantidad de items suministrados
  abcDistribution: {           // Distribución de items por clase ABC
    classA: number;
    classB: number;
    classC: number;
  };
  
  // Oportunidades y riesgos
  consolidationOpportunity: ConsolidationOpportunity;
  consolidationPotentialValue: number;
  riskFactors: SupplierRiskFactor[];
  opportunities: SupplierOpportunity[];
  
  // Recomendaciones específicas
  recommendations: SupplierRecommendation[];
  
  // Metadata
  analysisDate: string;
  nextReviewDate: string;
  dataCompleteness: number;    // % de datos disponibles para el análisis
  confidence: number;          // % confianza en el análisis
}

export interface SupplierRiskFactor {
  id: string;
  category: 'financial' | 'operational' | 'strategic' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: number;              // 0-100 impacto en el negocio
  likelihood: number;          // 0-100 probabilidad de ocurrencia
  mitigationActions: string[];
}

export interface SupplierOpportunity {
  id: string;
  type: 'cost_reduction' | 'quality_improvement' | 'lead_time_reduction' | 'consolidation';
  title: string;
  description: string;
  potentialValue: number;      // Valor potencial en ARS
  implementationEffort: 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  requiredActions: string[];
}

export interface SupplierRecommendation {
  id: string;
  type: 'maintain' | 'improve' | 'reduce_dependency' | 'replace' | 'consolidate';
  priority: 1 | 2 | 3 | 4 | 5; // 5 = más urgente
  title: string;
  description: string;
  justification: string;
  expectedImpact: number;      // 0-100
  implementationCost: number;  // Costo estimado de implementación
  timeframe: string;
  actions: Array<{
    id: string;
    description: string;
    responsible: string;
    dueDate?: string;
  }>;
}

// Configuración del análisis
export interface SupplierAnalysisConfig {
  // Pesos para el cálculo del rating general (deben sumar 100)
  weights: {
    quality: number;           // % peso de métricas de calidad
    delivery: number;          // % peso de métricas de entrega
    financial: number;         // % peso de métricas financieras
    service: number;           // % peso de métricas de servicio
    risk: number;             // % peso de métricas de riesgo
  };
  
  // Umbrales para categorización
  thresholds: {
    excellent: number;         // Rating mínimo para 'excellent'
    good: number;             // Rating mínimo para 'good'
    fair: number;             // Rating mínimo para 'fair'
    poor: number;             // Rating mínimo para 'poor'
  };
  
  // Configuración de riesgo
  riskFactors: {
    maxDependencyPercentage: number;  // % máximo de dependencia de un proveedor
    minFinancialStability: number;    // Score mínimo de estabilidad financiera
    maxLeadTimeVariability: number;   // Máxima variabilidad de lead time aceptable
  };
  
  // Configuración de consolidación
  consolidation: {
    minValueForConsolidation: number; // Valor mínimo para considerar consolidación
    maxSuppliersPerCategory: number;  // Máximo proveedores recomendados por categoría
    consolidationSavingsRate: number; // % de ahorro esperado por consolidación
  };
}

// Resultado consolidado del análisis
export interface SupplierAnalysisResult {
  // Metadata
  generatedAt: string;
  config: SupplierAnalysisConfig;
  suppliersAnalyzed: number;
  
  // Análisis individuales
  supplierAnalyses: SupplierAnalysis[];
  
  // Análisis consolidado
  portfolioMetrics: {
    averageRating: number;
    ratingDistribution: Record<SupplierRatingCategory, number>;
    riskDistribution: Record<SupplierRiskLevel, number>;
    totalAnnualSpend: number;
    supplierConcentration: number; // % del gasto en top 3 proveedores
  };
  
  // Oportunidades de consolidación
  consolidationOpportunities: Array<{
    category: string;
    currentSuppliers: string[];
    recommendedSupplier: string;
    potentialSavings: number;
    riskReduction: number;
    implementationComplexity: 'low' | 'medium' | 'high';
  }>;
  
  // Recomendaciones estratégicas
  strategicRecommendations: Array<{
    id: string;
    type: 'diversification' | 'consolidation' | 'upgrade' | 'risk_mitigation';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: number;
    timeframe: string;
  }>;
  
  // Alertas a generar
  alertsToGenerate: Array<{
    supplierId: string;
    type: 'performance_decline' | 'risk_increase' | 'opportunity_identified';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    recommendedActions: string[];
  }>;
}

// ============================================================================
// SUPPLIER ANALYSIS ENGINE
// ============================================================================

export class SupplierAnalysisEngine {
  
  // Configuración por defecto
  private static readonly DEFAULT_CONFIG: SupplierAnalysisConfig = {
    weights: {
      quality: 25,    // 25% peso en calidad
      delivery: 25,   // 25% peso en entrega
      financial: 20,  // 20% peso en aspectos financieros
      service: 15,    // 15% peso en servicio
      risk: 15        // 15% peso en riesgo
    },
    
    thresholds: {
      excellent: 85,  // 85+ puntos = excelente
      good: 70,       // 70-84 puntos = bueno
      fair: 55,       // 55-69 puntos = regular
      poor: 40        // 40-54 puntos = malo, <40 = crítico
    },
    
    riskFactors: {
      maxDependencyPercentage: 40,    // Máximo 40% dependencia
      minFinancialStability: 60,      // Mínimo 60 puntos estabilidad
      maxLeadTimeVariability: 30      // Máximo 30% variabilidad
    },
    
    consolidation: {
      minValueForConsolidation: 10000,  // ARS $10,000 mínimo
      maxSuppliersPerCategory: 3,       // Máximo 3 proveedores por categoría
      consolidationSavingsRate: 8       // 8% de ahorro esperado
    }
  };

  // ============================================================================
  // MAIN ANALYSIS METHOD
  // ============================================================================

  /**
   * Ejecuta análisis completo de proveedores
   */
  static async analyzeSuppliers(
    suppliers: Supplier[],
    materials: MaterialABC[],
    procurementRecommendations: ProcurementRecommendation[] = [],
    config: Partial<SupplierAnalysisConfig> = {}
  ): Promise<SupplierAnalysisResult> {
    
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config };
    const timestamp = new Date().toISOString();
    
    // 1. Analizar cada proveedor individualmente
    const supplierAnalyses = await Promise.all(
      suppliers.map(supplier => 
        this.analyzeIndividualSupplier(supplier, materials, fullConfig, timestamp)
      )
    );
    
    // 2. Análisis de portfolio consolidado
    const portfolioMetrics = this.calculatePortfolioMetrics(supplierAnalyses);
    
    // 3. Identificar oportunidades de consolidación
    const consolidationOpportunities = this.identifyConsolidationOpportunities(
      supplierAnalyses, 
      materials, 
      fullConfig
    );
    
    // 4. Generar recomendaciones estratégicas
    const strategicRecommendations = this.generateStrategicRecommendations(
      supplierAnalyses,
      portfolioMetrics,
      fullConfig
    );
    
    // 5. Generar alertas
    const alertsToGenerate = this.generateSupplierAlerts(supplierAnalyses, fullConfig);
    
    return {
      generatedAt: timestamp,
      config: fullConfig,
      suppliersAnalyzed: suppliers.length,
      supplierAnalyses: supplierAnalyses.filter(analysis => analysis !== null) as SupplierAnalysis[],
      portfolioMetrics,
      consolidationOpportunities,
      strategicRecommendations,
      alertsToGenerate
    };
  }

  // ============================================================================
  // INDIVIDUAL SUPPLIER ANALYSIS
  // ============================================================================

  private static async analyzeIndividualSupplier(
    supplier: Supplier,
    materials: MaterialABC[],
    config: SupplierAnalysisConfig,
    timestamp: string
  ): Promise<SupplierAnalysis | null> {
    
    // Simular métricas (en producción vendrían de datos históricos reales)
    const metrics = this.calculateSupplierMetrics(supplier, materials);
    
    // Calcular rating general
    const overallRating = this.calculateOverallRating(metrics, config);
    
    // Determinar categoría y nivel de riesgo
    const ratingCategory = this.determineRatingCategory(overallRating, config);
    const riskLevel = this.determineRiskLevel(metrics, config);
    
    // Análisis de negocio
    const businessAnalysis = this.calculateBusinessMetrics(supplier, materials);
    
    // Identificar riesgos y oportunidades
    const riskFactors = this.identifyRiskFactors(supplier, metrics, config);
    const opportunities = this.identifyOpportunities(supplier, metrics, businessAnalysis);
    
    // Determinar oportunidad de consolidación
    const consolidationOpportunity = this.evaluateConsolidationPotential(
      supplier, 
      businessAnalysis, 
      config
    );
    
    // Generar recomendaciones específicas
    const recommendations = this.generateSupplierRecommendations(
      supplier, 
      metrics, 
      riskFactors, 
      opportunities,
      ratingCategory
    );
    
    const analysis: SupplierAnalysis = {
      ...supplier,
      overallRating,
      ratingCategory,
      riskLevel,
      metrics,
      totalAnnualValue: businessAnalysis.totalValue,
      itemCount: businessAnalysis.itemCount,
      abcDistribution: businessAnalysis.abcDistribution,
      consolidationOpportunity,
      consolidationPotentialValue: this.calculateConsolidationValue(supplier, businessAnalysis, config),
      riskFactors,
      opportunities,
      recommendations,
      analysisDate: timestamp,
      nextReviewDate: this.calculateNextReviewDate(ratingCategory),
      dataCompleteness: this.calculateDataCompleteness(supplier),
      confidence: this.calculateAnalysisConfidence(supplier, metrics)
    };
    
    return analysis;
  }

  // ============================================================================
  // METRICS CALCULATION
  // ============================================================================

  private static calculateSupplierMetrics(supplier: Supplier, materials: MaterialABC[]): SupplierMetrics {
    // En producción, estas métricas vendrían de datos históricos reales
    // Por ahora generamos valores simulados pero realistas
    
    const baseScore = 60 + Math.random() * 30; // Base entre 60-90
    const variation = (Math.random() - 0.5) * 20; // Variación ±10
    
    return {
      // Calidad (simulada)
      qualityScore: Math.max(40, Math.min(100, baseScore + variation)),
      defectRate: Math.max(0, Math.min(15, Math.random() * 5)),
      returnRate: Math.max(0, Math.min(10, Math.random() * 3)),
      
      // Entrega (simulada basada en rating existente)
      onTimeDeliveryRate: Math.max(70, Math.min(100, (supplier.rating || 3) * 20 + Math.random() * 10)),
      averageLeadTime: Math.max(1, Math.min(21, 7 + Math.random() * 7)),
      leadTimeVariability: Math.max(5, Math.min(50, Math.random() * 25)),
      
      // Financiero (simulado)
      paymentTermsScore: Math.max(50, Math.min(100, 70 + Math.random() * 20)),
      priceCompetitiveness: Math.max(60, Math.min(95, 75 + Math.random() * 15)),
      costStability: Math.max(60, Math.min(95, 80 + Math.random() * 10)),
      
      // Servicio (simulado)
      responsiveness: Math.max(50, Math.min(100, baseScore + variation)),
      supportQuality: Math.max(50, Math.min(100, (supplier.rating || 3) * 18 + Math.random() * 15)),
      flexibilityScore: Math.max(40, Math.min(100, 70 + Math.random() * 20)),
      
      // Riesgo (simulado - invertido para que alto = mejor)
      financialStability: Math.max(40, Math.min(100, 75 + Math.random() * 20)),
      geographicRisk: Math.max(60, Math.min(100, 80 + Math.random() * 15)), // Alto = bajo riesgo
      dependencyRisk: Math.max(50, Math.min(100, 70 + Math.random() * 25))   // Alto = bajo riesgo
    };
  }

  private static calculateOverallRating(metrics: SupplierMetrics, config: SupplierAnalysisConfig): number {
    const qualityScore = DecimalUtils.fromValue(
      (metrics.qualityScore + (100 - metrics.defectRate) + (100 - metrics.returnRate)) / 3,
      'inventory'
    );
    
    const deliveryScore = DecimalUtils.fromValue(
      (metrics.onTimeDeliveryRate + (100 - (metrics.leadTimeVariability * 2))) / 2,
      'inventory'
    );
    
    const financialScore = DecimalUtils.fromValue(
      (metrics.paymentTermsScore + metrics.priceCompetitiveness + metrics.costStability) / 3,
      'inventory'
    );
    
    const serviceScore = DecimalUtils.fromValue(
      (metrics.responsiveness + metrics.supportQuality + metrics.flexibilityScore) / 3,
      'inventory'
    );
    
    const riskScore = DecimalUtils.fromValue(
      (metrics.financialStability + metrics.geographicRisk + metrics.dependencyRisk) / 3,
      'inventory'
    );
    
    // Aplicar pesos
    const weightedScore = DecimalUtils.add(
      DecimalUtils.multiply(qualityScore, config.weights.quality / 100, 'inventory'),
      DecimalUtils.add(
        DecimalUtils.multiply(deliveryScore, config.weights.delivery / 100, 'inventory'),
        DecimalUtils.add(
          DecimalUtils.multiply(financialScore, config.weights.financial / 100, 'inventory'),
          DecimalUtils.add(
            DecimalUtils.multiply(serviceScore, config.weights.service / 100, 'inventory'),
            DecimalUtils.multiply(riskScore, config.weights.risk / 100, 'inventory'),
            'inventory'
          ),
          'inventory'
        ),
        'inventory'
      ),
      'inventory'
    );
    
    return Math.max(0, Math.min(100, weightedScore.toNumber()));
  }

  private static calculateBusinessMetrics(supplier: Supplier, materials: MaterialABC[]) {
    // Simular relación supplier-materials (en producción vendría de BD)
    const supplierMaterials = materials.filter(() => Math.random() < 0.3); // 30% chance
    
    const totalValue = DecimalUtils.fromValue(
      supplierMaterials.reduce((sum, material) => 
        sum + (material.annualValue || material.totalStockValue || 0), 0
      ),
      'inventory'
    ).toNumber();
    
    const abcDistribution = supplierMaterials.reduce(
      (acc, material) => {
        acc[`class${material.abcClass}`] += 1;
        return acc;
      },
      { classA: 0, classB: 0, classC: 0 }
    );
    
    return {
      itemCount: supplierMaterials.length,
      totalValue,
      abcDistribution
    };
  }

  // ============================================================================
  // CLASSIFICATION METHODS
  // ============================================================================

  private static determineRatingCategory(rating: number, config: SupplierAnalysisConfig): SupplierRatingCategory {
    if (rating >= config.thresholds.excellent) return 'excellent';
    if (rating >= config.thresholds.good) return 'good';
    if (rating >= config.thresholds.fair) return 'fair';
    if (rating >= config.thresholds.poor) return 'poor';
    return 'critical';
  }

  private static determineRiskLevel(metrics: SupplierMetrics, config: SupplierAnalysisConfig): SupplierRiskLevel {
    let riskScore = 0;
    
    // Factores de riesgo
    if (metrics.financialStability < config.riskFactors.minFinancialStability) riskScore += 30;
    if (metrics.leadTimeVariability > config.riskFactors.maxLeadTimeVariability) riskScore += 25;
    if (metrics.onTimeDeliveryRate < 80) riskScore += 20;
    if (metrics.qualityScore < 70) riskScore += 25;
    
    if (riskScore >= 50) return 'critical';
    if (riskScore >= 30) return 'high';
    if (riskScore >= 15) return 'medium';
    return 'low';
  }

  // ============================================================================
  // RISK AND OPPORTUNITY IDENTIFICATION
  // ============================================================================

  private static identifyRiskFactors(
    supplier: Supplier, 
    metrics: SupplierMetrics, 
    config: SupplierAnalysisConfig
  ): SupplierRiskFactor[] {
    const risks: SupplierRiskFactor[] = [];
    
    // Riesgo financiero
    if (metrics.financialStability < config.riskFactors.minFinancialStability) {
      risks.push({
        id: `financial_${supplier.id}`,
        category: 'financial',
        severity: metrics.financialStability < 40 ? 'critical' : 'high',
        title: 'Estabilidad Financiera Baja',
        description: `Score de estabilidad financiera: ${metrics.financialStability}`,
        impact: 80,
        likelihood: 60,
        mitigationActions: [
          'Monitorear reportes financieros mensualmente',
          'Diversificar proveedores para items críticos',
          'Negociar términos de pago más favorables'
        ]
      });
    }
    
    // Riesgo de entrega
    if (metrics.leadTimeVariability > config.riskFactors.maxLeadTimeVariability) {
      risks.push({
        id: `delivery_${supplier.id}`,
        category: 'operational',
        severity: metrics.leadTimeVariability > 40 ? 'high' : 'medium',
        title: 'Alta Variabilidad en Tiempos de Entrega',
        description: `Variabilidad: ${metrics.leadTimeVariability}%`,
        impact: 60,
        likelihood: 70,
        mitigationActions: [
          'Implementar buffer de seguridad adicional',
          'Acordar penalidades por retrasos',
          'Buscar proveedores alternativos'
        ]
      });
    }
    
    // Riesgo de calidad
    if (metrics.qualityScore < 60) {
      risks.push({
        id: `quality_${supplier.id}`,
        category: 'operational',
        severity: metrics.qualityScore < 40 ? 'critical' : 'high',
        title: 'Problemas de Calidad Recurrentes',
        description: `Score de calidad: ${metrics.qualityScore}`,
        impact: 85,
        likelihood: 75,
        mitigationActions: [
          'Implementar inspecciones de calidad más rigurosas',
          'Solicitar plan de mejora de calidad',
          'Evaluar proveedores alternativos'
        ]
      });
    }
    
    return risks;
  }

  private static identifyOpportunities(
    supplier: Supplier, 
    metrics: SupplierMetrics, 
    businessAnalysis: any
  ): SupplierOpportunity[] {
    const opportunities: SupplierOpportunity[] = [];
    
    // Oportunidad de reducción de costos
    if (metrics.priceCompetitiveness < 85 && businessAnalysis.totalValue > 20000) {
      opportunities.push({
        id: `cost_reduction_${supplier.id}`,
        type: 'cost_reduction',
        title: 'Negociación de Precios',
        description: 'Oportunidad de mejorar competitividad de precios',
        potentialValue: businessAnalysis.totalValue * 0.05, // 5% ahorro potencial
        implementationEffort: 'medium',
        timeframe: 'short_term',
        requiredActions: [
          'Solicitar cotización actualizada',
          'Benchmarking con otros proveedores',
          'Negociar descuentos por volumen'
        ]
      });
    }
    
    // Oportunidad de consolidación
    if (businessAnalysis.itemCount > 5 && metrics.flexibilityScore > 75) {
      opportunities.push({
        id: `consolidation_${supplier.id}`,
        type: 'consolidation',
        title: 'Consolidación de Productos',
        description: 'Potencial para consolidar más productos con este proveedor',
        potentialValue: businessAnalysis.totalValue * 0.08, // 8% ahorro por consolidación
        implementationEffort: 'low',
        timeframe: 'medium_term',
        requiredActions: [
          'Evaluar catálogo completo del proveedor',
          'Negociar términos para productos adicionales',
          'Planificar migración gradual'
        ]
      });
    }
    
    return opportunities;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private static evaluateConsolidationPotential(
    supplier: Supplier, 
    businessAnalysis: any, 
    config: SupplierAnalysisConfig
  ): ConsolidationOpportunity {
    if (businessAnalysis.totalValue < config.consolidation.minValueForConsolidation) {
      return 'not_recommended';
    }
    
    const score = businessAnalysis.totalValue / 10000 + businessAnalysis.itemCount * 2;
    
    if (score >= 15) return 'high_potential';
    if (score >= 8) return 'medium_potential';
    if (score >= 4) return 'low_potential';
    return 'not_recommended';
  }

  private static calculateConsolidationValue(
    supplier: Supplier, 
    businessAnalysis: any, 
    config: SupplierAnalysisConfig
  ): number {
    return DecimalUtils.multiply(
      businessAnalysis.totalValue,
      config.consolidation.consolidationSavingsRate / 100,
      'inventory'
    ).toNumber();
  }

  private static calculateNextReviewDate(category: SupplierRatingCategory): string {
    const now = new Date();
    let monthsToAdd: number;
    
    switch (category) {
      case 'critical': monthsToAdd = 1; break;  // Mensual
      case 'poor': monthsToAdd = 2; break;     // Bimestral
      case 'fair': monthsToAdd = 3; break;     // Trimestral
      case 'good': monthsToAdd = 6; break;     // Semestral
      case 'excellent': monthsToAdd = 12; break; // Anual
      default: monthsToAdd = 6;
    }
    
    now.setMonth(now.getMonth() + monthsToAdd);
    return now.toISOString();
  }

  private static calculateDataCompleteness(supplier: Supplier): number {
    let completeness = 0;
    const fields = ['name', 'contact_person', 'email', 'phone', 'address', 'rating', 'tax_id'];
    
    fields.forEach(field => {
      if (supplier[field as keyof Supplier]) completeness += 100 / fields.length;
    });
    
    return Math.round(completeness);
  }

  private static calculateAnalysisConfidence(supplier: Supplier, metrics: SupplierMetrics): number {
    let confidence = 70; // Base
    
    // Mayor confianza con más datos
    confidence += this.calculateDataCompleteness(supplier) * 0.2;
    
    // Mayor confianza si hay rating histórico
    if (supplier.rating && supplier.rating > 0) confidence += 10;
    
    return Math.min(95, Math.round(confidence));
  }

  // ============================================================================
  // CONSOLIDATION AND PORTFOLIO ANALYSIS
  // ============================================================================

  private static calculatePortfolioMetrics(analyses: (SupplierAnalysis | null)[]) {
    const validAnalyses = analyses.filter(a => a !== null) as SupplierAnalysis[];
    
    if (validAnalyses.length === 0) {
      return {
        averageRating: 0,
        ratingDistribution: { excellent: 0, good: 0, fair: 0, poor: 0, critical: 0 },
        riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
        totalAnnualSpend: 0,
        supplierConcentration: 0
      };
    }
    
    const averageRating = validAnalyses.reduce((sum, a) => sum + a.overallRating, 0) / validAnalyses.length;
    
    const ratingDistribution = validAnalyses.reduce((acc, analysis) => {
      acc[analysis.ratingCategory] += 1;
      return acc;
    }, { excellent: 0, good: 0, fair: 0, poor: 0, critical: 0 });
    
    const riskDistribution = validAnalyses.reduce((acc, analysis) => {
      acc[analysis.riskLevel] += 1;
      return acc;
    }, { low: 0, medium: 0, high: 0, critical: 0 });
    
    const totalAnnualSpend = DecimalUtils.fromValue(
      validAnalyses.reduce((sum, a) => sum + a.totalAnnualValue, 0),
      'inventory'
    ).toNumber();
    
    // Calcular concentración (top 3 proveedores)
    const sortedByValue = [...validAnalyses].sort((a, b) => b.totalAnnualValue - a.totalAnnualValue);
    const top3Value = sortedByValue.slice(0, 3).reduce((sum, a) => sum + a.totalAnnualValue, 0);
    const supplierConcentration = totalAnnualSpend > 0 ? (top3Value / totalAnnualSpend) * 100 : 0;
    
    return {
      averageRating,
      ratingDistribution,
      riskDistribution,
      totalAnnualSpend,
      supplierConcentration
    };
  }

  private static identifyConsolidationOpportunities(
    analyses: (SupplierAnalysis | null)[],
    materials: MaterialABC[],
    config: SupplierAnalysisConfig
  ) {
    // Por ahora retorna array vacío - en producción implementaríamos lógica compleja
    return [];
  }

  private static generateStrategicRecommendations(
    analyses: (SupplierAnalysis | null)[],
    portfolioMetrics: any,
    config: SupplierAnalysisConfig
  ) {
    const recommendations = [];
    
    // Recomendación de diversificación si hay alta concentración
    if (portfolioMetrics.supplierConcentration > 60) {
      recommendations.push({
        id: 'diversify_suppliers',
        type: 'diversification' as const,
        priority: 'high' as const,
        title: 'Diversificar Base de Proveedores',
        description: `La concentración de proveedores es del ${portfolioMetrics.supplierConcentration.toFixed(1)}%, lo cual representa un riesgo.`,
        impact: 80,
        timeframe: '3-6 meses'
      });
    }
    
    return recommendations;
  }

  private static generateSupplierAlerts(
    analyses: (SupplierAnalysis | null)[],
    config: SupplierAnalysisConfig
  ) {
    const alerts = [];
    
    const validAnalyses = analyses.filter(a => a !== null) as SupplierAnalysis[];
    
    // Generar alertas para proveedores críticos
    validAnalyses
      .filter(analysis => analysis.ratingCategory === 'critical' || analysis.riskLevel === 'critical')
      .forEach(analysis => {
        alerts.push({
          supplierId: analysis.id,
          type: 'performance_decline' as const,
          severity: 'critical' as const,
          message: `${analysis.name} requiere atención inmediata - Rating: ${analysis.overallRating}`,
          recommendedActions: [
            'Programar reunión urgente',
            'Evaluar proveedores alternativos',
            'Implementar plan de mejora'
          ]
        });
      });
    
    return alerts;
  }

  private static generateSupplierRecommendations(
    supplier: Supplier,
    metrics: SupplierMetrics,
    riskFactors: SupplierRiskFactor[],
    opportunities: SupplierOpportunity[],
    category: SupplierRatingCategory
  ): SupplierRecommendation[] {
    const recommendations: SupplierRecommendation[] = [];
    
    // Recomendación basada en categoría
    switch (category) {
      case 'excellent':
        recommendations.push({
          id: `maintain_${supplier.id}`,
          type: 'maintain',
          priority: 2,
          title: 'Mantener Relación Estratégica',
          description: 'Proveedor excelente - mantener y fortalecer relación',
          justification: `Rating excepcional (${metrics.qualityScore}) justifica inversión continua`,
          expectedImpact: 90,
          implementationCost: 5000,
          timeframe: 'Continuo',
          actions: [
            { id: '1', description: 'Review anual de performance', responsible: 'Procurement Manager' },
            { id: '2', description: 'Explorar nuevas oportunidades', responsible: 'Category Manager' }
          ]
        });
        break;
        
      case 'critical':
        recommendations.push({
          id: `replace_${supplier.id}`,
          type: 'replace',
          priority: 5,
          title: 'Evaluar Reemplazo Urgente',
          description: 'Performance crítica requiere acción inmediata',
          justification: 'Múltiples factores de riesgo críticos identificados',
          expectedImpact: 95,
          implementationCost: 15000,
          timeframe: '1-3 meses',
          actions: [
            { id: '1', description: 'Identificar proveedores alternativos', responsible: 'Procurement Team' },
            { id: '2', description: 'Plan de transición', responsible: 'Operations Manager' }
          ]
        });
        break;
    }
    
    return recommendations;
  }
}