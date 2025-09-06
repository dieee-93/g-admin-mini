// ============================================================================
// ABC ANALYSIS ENGINE - Business Logic
// ============================================================================
// Algoritmo avanzado de clasificación ABC para gestión inteligente de inventario
// Utiliza decimal.js para precisión matemática en análisis financiero

import { type MaterialItem } from '@/pages/admin/materials/types';
import { 
  type ABCAnalysisConfig, 
  type ABCAnalysisResult, 
  type MaterialABC, 
  type ABCClass,
  type ABCCategory,
  type ABCClassSummary,
  type ABCRecommendation,
  type AnalysisType,
  DEFAULT_CONTROL_STRATEGIES,
  getClassColor,
  getClassImportance
} from '@/pages/admin/materials/types/abc-analysis';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { InventoryDecimal, DECIMAL_CONSTANTS } from '@/config/decimal-config';

/**
 * ABC Analysis Engine - Clasificación inteligente de inventario
 * Implementa algoritmo ABC estándar con mejoras para restaurantes/hospitality
 */
export class ABCAnalysisEngine {
  
  // ============================================================================
  // CONFIGURACIONES POR DEFECTO
  // ============================================================================
  
  private static readonly DEFAULT_CONFIG: ABCAnalysisConfig = {
    classAThreshold: 80, // 80% del valor
    classBThreshold: 15, // 15% del valor
    primaryCriteria: 'revenue',
    analysisPeridMonths: 12,
    minDataPoints: 3,
    includeInactive: false,
    minValue: 0,
    excludeCategories: []
  };

  // ============================================================================
  // ANÁLISIS PRINCIPAL
  // ============================================================================

  /**
   * Ejecuta análisis ABC completo con datos de inventario
   * @param items Array de materiales con datos históricos
   * @param config Configuración del análisis (opcional)
   * @returns Resultado completo del análisis ABC
   */
  static analyzeInventory(
    items: MaterialItem[],
    config: Partial<ABCAnalysisConfig> = {}
  ): ABCAnalysisResult {
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    // 1. Filtrar y validar datos
    const validItems = this.filterValidItems(items, fullConfig);
    
    // 2. Calcular métricas de análisis
    const materialsWithMetrics = this.calculateAnalysisMetrics(validItems, fullConfig);
    
    // 3. Clasificar usando algoritmo ABC
    const classifiedMaterials = this.classifyMaterials(materialsWithMetrics, fullConfig);
    
    // 4. Generar resumen estadístico
    const summary = this.generateSummary(classifiedMaterials);
    
    // 5. Generar recomendaciones inteligentes
    const recommendations = this.generateRecommendations(classifiedMaterials, summary);
    
    return {
      generatedAt: new Date().toISOString(),
      config: fullConfig,
      totalItemsAnalyzed: validItems.length,
      totalValue: this.calculateTotalValue(materialsWithMetrics),
      classA: classifiedMaterials.filter(m => m.abcClass === 'A'),
      classB: classifiedMaterials.filter(m => m.abcClass === 'B'),
      classC: classifiedMaterials.filter(m => m.abcClass === 'C'),
      summary,
      recommendations
    };
  }

  // ============================================================================
  // FILTRADO Y VALIDACIÓN
  // ============================================================================

  private static filterValidItems(
    items: MaterialItem[],
    config: ABCAnalysisConfig
  ): MaterialItem[] {
    return items.filter(item => {
      // Filtrar por valor mínimo
      const itemValue = this.calculateItemValue(item);
      if (DecimalUtils.fromValue(itemValue, 'inventory').lt(config.minValue || 0)) {
        return false;
      }
      
      // Filtrar categorías excluidas
      if (config.excludeCategories?.includes(item.category)) {
        return false;
      }
      
      // Filtrar inactivos si no están incluidos
      if (!config.includeInactive && (item.stock <= 0)) {
        return false;
      }
      
      return true;
    });
  }

  // ============================================================================
  // CÁLCULO DE MÉTRICAS
  // ============================================================================

  private static calculateAnalysisMetrics(
    items: MaterialItem[],
    config: ABCAnalysisConfig
  ): MaterialABC[] {
    return items.map(item => {
      // Calcular consumo anual simulado basado en stock actual
      // En producción, esto vendría de datos históricos reales
      const annualConsumption = this.estimateAnnualConsumption(item);
      const annualValue = DecimalUtils.multiply(
        annualConsumption, 
        item.unit_cost || 0, 
        'inventory'
      ).toNumber();
      
      const materialABC: MaterialABC = {
        ...item,
        abcClass: 'C', // Se asignará en clasificación
        annualConsumption,
        annualValue,
        revenuePercentage: 0, // Se calculará después
        cumulativeRevenue: 0, // Se calculará después
        currentStock: item.stock,
        totalStockValue: DecimalUtils.calculateStockValue(
          item.stock, 
          item.unit_cost || 0
        ).toNumber(),
        monthlyConsumption: annualConsumption / 12,
        consumptionFrequency: this.estimateConsumptionFrequency(item),
        lastUsedDate: this.estimateLastUsedDate(item)
      };
      
      return materialABC;
    });
  }

  /**
   * Estima consumo anual basado en tipo de material y stock actual
   * En producción real, esto se calcularía con datos históricos de movimientos
   */
  private static estimateAnnualConsumption(item: MaterialItem): number {
    const baseConsumption = item.stock * 12; // Estimación simple
    
    // Factores por tipo de item
    switch (item.type) {
      case 'MEASURABLE':
        // Items conmensurables tienden a tener rotación alta (carnes, lácteos)
        return Math.round(baseConsumption * 1.5);
        
      case 'COUNTABLE':
        // Items contables varían según packaging
        return Math.round(baseConsumption * 1.2);
        
      case 'ELABORATED':
        // Items elaborados dependen de demanda de productos finales
        return Math.round(baseConsumption * 0.8);
        
      default:
        return Math.round(baseConsumption);
    }
  }

  private static estimateConsumptionFrequency(item: MaterialItem): number {
    // Frecuencia estimada por tipo (usos por mes)
    switch (item.type) {
      case 'MEASURABLE': return 25; // Diario aproximadamente
      case 'COUNTABLE': return 15;  // Día por medio
      case 'ELABORATED': return 10; // Menos frecuente
      default: return 12; // Mensual
    }
  }

  private static estimateLastUsedDate(item: MaterialItem): string {
    // Simula última fecha de uso (en producción vendría de movimientos)
    const daysAgo = Math.floor(Math.random() * 30);
    const lastUsed = new Date();
    lastUsed.setDate(lastUsed.getDate() - daysAgo);
    return lastUsed.toISOString();
  }

  private static calculateItemValue(item: MaterialItem): number {
    return DecimalUtils.calculateStockValue(
      item.stock, 
      item.unit_cost || 0
    ).toNumber();
  }

  // ============================================================================
  // CLASIFICACIÓN ABC
  // ============================================================================

  private static classifyMaterials(
    materials: MaterialABC[],
    config: ABCAnalysisConfig
  ): MaterialABC[] {
    // 1. Ordenar por criterio primario (descendente)
    const sorted = this.sortByCriteria(materials, config.primaryCriteria);
    
    // 2. Calcular valor total
    const totalValue = DecimalUtils.fromValue(
      sorted.reduce((sum, item) => 
        DecimalUtils.add(sum, item.annualValue, 'inventory').toNumber(), 0
      ),
      'inventory'
    );
    
    // 3. Calcular porcentajes y clasificar
    let cumulativeValue = DecimalUtils.fromValue(0, 'inventory');
    
    return sorted.map((item, index) => {
      // Calcular porcentaje individual
      const itemValue = DecimalUtils.fromValue(item.annualValue, 'inventory');
      const revenuePercentage = DecimalUtils.calculatePercentage(
        itemValue, 
        totalValue, 
        'inventory'
      ).toNumber();
      
      // Calcular porcentaje acumulado
      cumulativeValue = DecimalUtils.add(cumulativeValue, itemValue, 'inventory');
      const cumulativePercentage = DecimalUtils.calculatePercentage(
        cumulativeValue, 
        totalValue, 
        'inventory'
      ).toNumber();
      
      // Asignar clase ABC
      const abcClass = this.determineClass(cumulativePercentage, config);
      
      return {
        ...item,
        abcClass,
        revenuePercentage: DecimalUtils.fromValue(revenuePercentage, 'inventory').toFixed(1),
        cumulativeRevenue: DecimalUtils.fromValue(cumulativePercentage, 'inventory').toFixed(1)
      } as MaterialABC;
    });
  }

  private static sortByCriteria(materials: MaterialABC[], criteria: AnalysisType): MaterialABC[] {
    return [...materials].sort((a, b) => {
      switch (criteria) {
        case 'revenue':
          return b.annualValue - a.annualValue;
        case 'quantity':
          return b.annualConsumption - a.annualConsumption;
        case 'frequency':
          return (b.consumptionFrequency || 0) - (a.consumptionFrequency || 0);
        case 'cost':
          return (b.unit_cost || 0) - (a.unit_cost || 0);
        default:
          return b.annualValue - a.annualValue;
      }
    });
  }

  private static determineClass(cumulativePercentage: number, config: ABCAnalysisConfig): ABCClass {
    if (cumulativePercentage <= config.classAThreshold) {
      return 'A';
    } else if (cumulativePercentage <= config.classAThreshold + config.classBThreshold) {
      return 'B';
    } else {
      return 'C';
    }
  }

  // ============================================================================
  // GENERACIÓN DE RESUMEN
  // ============================================================================

  private static generateSummary(materials: MaterialABC[]): Record<ABCClass, ABCClassSummary> {
    const classes = ['A', 'B', 'C'] as const;
    const totalItems = materials.length;
    const totalValue = this.calculateTotalValue(materials);
    
    return classes.reduce((summary, className) => {
      const classItems = materials.filter(m => m.abcClass === className);
      const classValue = DecimalUtils.fromValue(
        classItems.reduce((sum, item) => DecimalUtils.add(sum, item.annualValue, 'inventory').toNumber(), 0),
        'inventory'
      );
      
      summary[className] = {
        itemCount: classItems.length,
        totalValue: classValue.toNumber(),
        percentageOfValue: DecimalUtils.calculatePercentage(classValue, totalValue, 'inventory').toNumber(),
        percentageOfItems: DecimalUtils.calculatePercentage(classItems.length, totalItems, 'inventory').toNumber(),
        averageValue: classItems.length > 0 
          ? DecimalUtils.divide(classValue, classItems.length, 'inventory').toNumber()
          : 0,
        strategy: DEFAULT_CONTROL_STRATEGIES[className].procurementStrategy
      };
      
      return summary;
    }, {} as Record<ABCClass, ABCClassSummary>);
  }

  private static calculateTotalValue(materials: MaterialABC[]): InventoryDecimal {
    return materials.reduce(
      (total, item) => DecimalUtils.add(total, item.annualValue, 'inventory'),
      DecimalUtils.fromValue(0, 'inventory')
    ) as InventoryDecimal;
  }

  // ============================================================================
  // GENERACIÓN DE RECOMENDACIONES
  // ============================================================================

  private static generateRecommendations(
    materials: MaterialABC[],
    summary: Record<ABCClass, ABCClassSummary>
  ): ABCRecommendation[] {
    const recommendations: ABCRecommendation[] = [];
    
    // Recomendación 1: Optimización de stock clase A
    const classAItems = materials.filter(m => m.abcClass === 'A');
    if (classAItems.length > 0) {
      const potentialSavings = DecimalUtils.fromValue(
        classAItems.reduce((sum, item) => sum + (item.totalStockValue || 0) * 0.15, 0),
        'inventory'
      ).toNumber();
      
      recommendations.push({
        id: 'optimize-class-a-stock',
        type: 'stock_optimization',
        priority: 'high',
        title: 'Optimizar inventario Clase A',
        description: 'Los items de Clase A representan el mayor valor. Implementar Just-In-Time puede reducir costos de almacenamiento.',
        potentialSavings,
        implementationEffort: 'medium',
        affectedItems: classAItems.map(item => item.id),
        actionItems: [
          'Implementar sistema JIT para items críticos',
          'Negociar entregas más frecuentes con proveedores',
          'Establecer alertas automáticas de reorden',
          'Revisar niveles mínimos de stock'
        ]
      });
    }
    
    // Recomendación 2: Consolidación de proveedores clase C
    const classCItems = materials.filter(m => m.abcClass === 'C');
    if (classCItems.length > 10) {
      recommendations.push({
        id: 'consolidate-class-c-suppliers',
        type: 'supplier_negotiation',
        priority: 'medium',
        title: 'Consolidar proveedores Clase C',
        description: 'Los items de Clase C pueden comprarse en lotes más grandes y con menos frecuencia para reducir costos administrativos.',
        implementationEffort: 'low',
        affectedItems: classCItems.map(item => item.id),
        actionItems: [
          'Identificar proveedores que ofrezcan múltiples items Clase C',
          'Negociar descuentos por volumen',
          'Establecer pedidos mensuales en lugar de semanales',
          'Simplificar proceso de aprobación'
        ]
      });
    }
    
    // Recomendación 3: Revisión de items con baja rotación
    const lowRotationItems = materials.filter(m => 
      (m.consumptionFrequency || 0) < 5 && m.totalStockValue && m.totalStockValue > 1000
    );
    
    if (lowRotationItems.length > 0) {
      recommendations.push({
        id: 'review-low-rotation-items',
        type: 'cost_reduction',
        priority: 'medium',
        title: 'Revisar items de baja rotación',
        description: 'Algunos items tienen alta inversión pero baja rotación. Considerar reducir stock o eliminar.',
        implementationEffort: 'low',
        affectedItems: lowRotationItems.map(item => item.id),
        actionItems: [
          'Analizar necesidad real de estos items',
          'Buscar alternativas más económicas',
          'Reducir niveles de stock mínimo',
          'Considerar eliminar items innecesarios'
        ]
      });
    }
    
    return recommendations;
  }

  // ============================================================================
  // UTILIDADES PÚBLICAS
  // ============================================================================

  /**
   * Genera categorías para dashboard overview
   */
  static generateCategoryOverview(analysisResult: ABCAnalysisResult): ABCCategory[] {
    return (['A', 'B', 'C'] as const).map(className => ({
      category: className,
      title: `Clase ${className} - ${this.getClassTitle(className)}`,
      description: getClassImportance(className),
      color: getClassColor(className),
      items: analysisResult.summary[className].itemCount,
      percentage: analysisResult.summary[className].percentageOfValue,
      revenue: analysisResult.summary[className].totalValue,
      strategy: DEFAULT_CONTROL_STRATEGIES[className].procurementStrategy
    }));
  }

  private static getClassTitle(className: ABCClass): string {
    switch (className) {
      case 'A': return 'Críticos';
      case 'B': return 'Importantes';
      case 'C': return 'Ordinarios';
    }
  }

  /**
   * Valida configuración de análisis
   */
  static validateConfig(config: Partial<ABCAnalysisConfig>): string[] {
    const errors: string[] = [];
    
    if (config.classAThreshold && (config.classAThreshold < 50 || config.classAThreshold > 95)) {
      errors.push('Umbral Clase A debe estar entre 50% y 95%');
    }
    
    if (config.classBThreshold && (config.classBThreshold < 5 || config.classBThreshold > 30)) {
      errors.push('Umbral Clase B debe estar entre 5% y 30%');
    }
    
    if (config.classAThreshold && config.classBThreshold && 
        (config.classAThreshold + config.classBThreshold >= 100)) {
      errors.push('La suma de umbrales A y B debe ser menor a 100%');
    }
    
    return errors;
  }
}