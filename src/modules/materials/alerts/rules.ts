/**
 * MATERIALS SMART ALERT RULES
 * ============================================================================
 * Business intelligence rules for inventory/materials management (StockLab)
 * Uses V2 SmartAlertsEngine architecture
 * 
 * @module modules/materials/alerts/rules
 * @see docs/alert/ALERT_ARCHITECTURE_V2.md
 * @see docs/alert/SMART_ALERTS_GUIDE.md
 */

import type { SmartAlertRule } from '@/lib/alerts/types/smartRules';
import type { MaterialABC, ABCClass } from '@/pages/admin/supply-chain/materials/types/abc-analysis';

/**
 * Stock-related alert rules
 */
export const MATERIALS_STOCK_RULES: SmartAlertRule<MaterialABC>[] = [
  {
    id: 'stock-critical-zero',
    name: 'Critical Stock: Out of Stock',
    description: 'Material is completely out of stock - immediate action required',
    condition: (item) => item.currentStock === 0,
    severity: 'critical',
    title: (item) => `${item.name}: Sin stock`,
    description: (item) => `Material sin existencias. Impacto operacional inmediato. Clase ${item.abcClass}.`,
    metadata: (item) => ({
      itemId: item.id,
      itemName: item.name,
      currentStock: 0,
      minThreshold: item.min_stock,
      unit: item.unit,
      abcClass: item.abcClass,
      estimatedImpact: item.abcClass === 'A' ? 'high' : item.abcClass === 'B' ? 'medium' : 'low',
      monthlyConsumption: item.monthlyConsumption || 0
    }),
    priority: 100, // Highest priority
    persistent: true
  },
  
  {
    id: 'stock-low',
    name: 'Low Stock Warning',
    description: 'Stock level below minimum threshold',
    condition: (item) => item.currentStock > 0 && item.currentStock <= item.min_stock,
    severity: 'high',
    title: (item) => `${item.name}: Stock bajo (${item.currentStock} ${item.unit})`,
    description: (item) => {
      const percentage = ((item.currentStock / item.min_stock) * 100).toFixed(0);
      return `Stock al ${percentage}% del mínimo (${item.min_stock} ${item.unit}). Considere realizar pedido.`;
    },
    metadata: (item) => ({
      itemId: item.id,
      itemName: item.name,
      currentStock: item.currentStock,
      minThreshold: item.min_stock,
      unit: item.unit,
      abcClass: item.abcClass,
      stockPercentage: ((item.currentStock / item.min_stock) * 100).toFixed(1),
      recommendedOrder: Math.ceil(item.min_stock * 1.5),
      daysUntilEmpty: item.monthlyConsumption 
        ? Math.floor((item.currentStock / (item.monthlyConsumption / 30)))
        : null
    }),
    priority: 90
  },
  
  {
    id: 'stock-overstock',
    name: 'Overstock Alert',
    description: 'Stock level significantly above normal - capital tied up',
    condition: (item) => item.currentStock > item.min_stock * 3,
    severity: 'medium',
    title: (item) => `${item.name}: Sobrestock`,
    description: (item) => {
      const ratio = (item.currentStock / item.min_stock).toFixed(1);
      return `Stock ${ratio}x superior al mínimo. Riesgo de capital inmovilizado o vencimiento.`;
    },
    metadata: (item) => ({
      itemId: item.id,
      itemName: item.name,
      currentStock: item.currentStock,
      minThreshold: item.min_stock,
      overstockRatio: Number((item.currentStock / item.min_stock).toFixed(1)),
      estimatedCapitalTied: item.currentStock * (item.unit_cost || 0),
      unit: item.unit
    }),
    priority: 50
  }
];

/**
 * ABC classification alert rules
 */
export const MATERIALS_ABC_RULES: SmartAlertRule<MaterialABC>[] = [
  {
    id: 'abc-class-a-attention',
    name: 'Class A Item Requires Attention',
    description: 'High-value Class A item needs immediate attention',
    condition: (item) => 
      item.abcClass === 'A' && 
      item.currentStock <= item.min_stock * 1.5,
    severity: 'high',
    title: (item) => `⚠️ Clase A: ${item.name}`,
    description: (item) => 
      `Item de alto valor requiere atención. Stock: ${item.currentStock} ${item.unit} (80% del inventario en valor).`,
    metadata: (item) => ({
      itemId: item.id,
      itemName: item.name,
      currentStock: item.currentStock,
      minThreshold: item.min_stock,
      abcClass: 'A',
      annualValue: item.annualValue,
      revenuePercentage: item.revenuePercentage,
      unit: item.unit
    }),
    priority: 95
  },

  {
    id: 'abc-class-b-monitoring',
    name: 'Class B Item Monitoring',
    description: 'Moderate-value Class B item approaching low stock',
    condition: (item) => 
      item.abcClass === 'B' && 
      item.currentStock <= item.min_stock,
    severity: 'medium',
    title: (item) => `📊 Clase B: ${item.name}`,
    description: (item) => 
      `Item de valor moderado requiere monitoreo. Stock: ${item.currentStock} ${item.unit}.`,
    metadata: (item) => ({
      itemId: item.id,
      itemName: item.name,
      currentStock: item.currentStock,
      minThreshold: item.min_stock,
      abcClass: 'B',
      annualValue: item.annualValue,
      unit: item.unit
    }),
    priority: 70
  }
];

/**
 * Slow-moving inventory alert rules
 */
export const MATERIALS_SLOW_MOVING_RULES: SmartAlertRule<MaterialABC>[] = [
  {
    id: 'slow-moving-class-c',
    name: 'Slow Moving Class C Item',
    description: 'Low-value item with no movement for extended period',
    condition: (item) => {
      if (item.abcClass !== 'C') return false;
      if (!item.monthlyConsumption) return false;
      
      // No consumption for 30+ days
      const daysWithoutMovement = 30; // This would come from actual transaction data
      return item.monthlyConsumption < 0.1 && daysWithoutMovement >= 30;
    },
    severity: 'low',
    title: (item) => `🐌 Clase C sin movimiento: ${item.name}`,
    description: () => 
      `Item de bajo valor sin movimiento significativo en 30+ días. Considere liquidación o descontinuación.`,
    metadata: (item) => ({
      itemId: item.id,
      itemName: item.name,
      currentStock: item.currentStock,
      monthlyConsumption: item.monthlyConsumption,
      abcClass: 'C',
      capitalTied: item.currentStock * (item.unit_cost || 0),
      unit: item.unit
    }),
    priority: 30
  }
];

/**
 * Valuation and cost alert rules
 */
export const MATERIALS_VALUATION_RULES: SmartAlertRule<MaterialABC>[] = [
  {
    id: 'high-value-stock-at-risk',
    name: 'High Value Stock at Risk',
    description: 'Significant capital tied up in single item',
    condition: (item) => {
      const stockValue = item.currentStock * (item.unit_cost || 0);
      return stockValue > 10000 && item.currentStock > item.min_stock * 2;
    },
    severity: 'medium',
    title: (item) => `💰 Alto valor en stock: ${item.name}`,
    description: (item) => {
      const stockValue = (item.currentStock * (item.unit_cost || 0)).toFixed(2);
      return `$${stockValue} inmovilizados. Stock actual: ${item.currentStock} ${item.unit}.`;
    },
    metadata: (item) => ({
      itemId: item.id,
      itemName: item.name,
      currentStock: item.currentStock,
      unitCost: item.unit_cost || 0,
      totalStockValue: item.currentStock * (item.unit_cost || 0),
      abcClass: item.abcClass,
      unit: item.unit
    }),
    priority: 60
  }
];

/**
 * Combined rules for Materials module
 * Organized by priority: Stock → ABC → Valuation → Slow Moving
 */
export const MATERIALS_SMART_RULES: SmartAlertRule<MaterialABC>[] = [
  ...MATERIALS_STOCK_RULES,       // Priority 90-100
  ...MATERIALS_ABC_RULES,         // Priority 70-95
  ...MATERIALS_VALUATION_RULES,   // Priority 60
  ...MATERIALS_SLOW_MOVING_RULES  // Priority 30
];

/**
 * Get importance score for ABC class
 */
export function getABCImportanceScore(abcClass: ABCClass): number {
  const scores: Record<ABCClass, number> = {
    'A': 100,
    'B': 60,
    'C': 30
  };
  return scores[abcClass];
}

/**
 * Get recommended action based on ABC class and alert type
 */
export function getRecommendedAction(
  item: MaterialABC,
  alertType: 'critical' | 'low' | 'overstock'
): string {
  const classActions: Record<ABCClass, Record<typeof alertType, string>> = {
    'A': {
      critical: 'ACCIÓN INMEDIATA: Contactar proveedor prioritario y verificar alternativas',
      low: 'Programar orden de compra dentro de 24h - Item crítico',
      overstock: 'Revisar proyecciones de demanda - Alto capital inmovilizado'
    },
    'B': {
      critical: 'Contactar proveedor y programar reposición urgente',
      low: 'Incluir en próxima orden de compra (3-5 días)',
      overstock: 'Considerar promoción o uso en producción'
    },
    'C': {
      critical: 'Evaluar si es necesario reponer - Considerar alternativas',
      low: 'Agregar a lista de compras mensual',
      overstock: 'Liquidar excedente o discontinuar si no hay movimiento'
    }
  };

  return classActions[item.abcClass][alertType];
}
