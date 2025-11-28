# 🔧 Smart Alerts Refactoring Plan

**ESTADO:** ✅ **COMPLETADO** - V2 Architecture implementada  
**Fecha de Finalización:** 19 de noviembre de 2025  
**Resultado:** Código limpio, sin duplicación, -1,073 líneas eliminadas

---

## ✅ REFACTORIZACIÓN COMPLETADA

### Decisión Final: **V2 SmartAlertsEngine es la versión correcta**

**Razones:**
1. ✅ Alineado 100% con `docs/alert/ALERT_ARCHITECTURE_V2.md`
2. ✅ React Best Practices 2025: Composition over Inheritance (generics `<T>`)
3. ✅ Arquitectura genérica: Reutilizable para 31+ módulos
4. ✅ Type system unificado: `CreateAlertInput` (no tipos custom)
5. ✅ 306 líneas limpias vs 720 líneas Materials-específicas

### Cambios Ejecutados

**✅ Nueva Estructura V2:**
```
src/modules/materials/alerts/
├── rules.ts (221 líneas) - 7 reglas organizadas por prioridad
├── engine.ts (30 líneas) - Instancia pre-configurada
└── adapter.ts (67 líneas) - Integración con sistema unificado
```

**❌ Código Legacy Eliminado:**
- `src/pages/.../smartAlertsEngine.ts` (720 líneas) - **ELIMINADO**
- `src/pages/.../smartAlertsAdapter.ts` (387 → 34 líneas) - **91% reducción**
- **Total eliminado:** 1,073 líneas sin recuperación

**✅ Imports Actualizados:**
- `useSmartInventoryAlerts.ts` → usa `MaterialsAlertsAdapter`
- `Logger.ts` → módulos Materials/SmartAlertsEngine añadidos
- Tests: Mock de compatibilidad creado

### Métricas

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Engines duplicados | 2 (1,026 líneas) | 1 (306 líneas) | -720 líneas |
| Código duplicado | ~425 líneas | 0 líneas | ✅ 100% |
| Adapter Materials | 387 líneas | 34 líneas | -91% |
| Type systems | 2 incompatibles | 1 unificado | ✅ |

---

## 📋 Plan Original (Referencia Histórica)

Este plan se creó inicialmente para migración gradual con adapters.  
**Resultado final:** Eliminación directa sin adaptaciones.

Ver: `SMART_ALERTS_V2_REFACTOR_COMPLETE.md` para documentación completa.

---

### Step 1.1: Create Type Adapter

**File:** `src/lib/alerts/adapters/smartAlertConverter.ts` (NEW)

```typescript
/**
 * SMART ALERT CONVERTER
 * ============================================================================
 * Converts between legacy SmartAlert type and unified CreateAlertInput type
 * Temporary adapter during migration from V1 → V2 architecture
 * 
 * @deprecated Will be removed once all modules migrated to V2
 */

import type { CreateAlertInput, AlertSeverity, AlertType } from '@/shared/alerts/types';
import type { SmartAlert, AlertSeverity as V1Severity } from '@/pages/admin/supply-chain/materials/services/smartAlertsEngine';

/**
 * Map V1 severity to V2 severity
 */
function mapSeverity(v1Severity: V1Severity): AlertSeverity {
  const mapping: Record<V1Severity, AlertSeverity> = {
    'info': 'info',
    'warning': 'medium',
    'critical': 'critical',
    'urgent': 'high'
  };
  return mapping[v1Severity];
}

/**
 * Infer V2 AlertType from V1 alert type string
 */
function inferAlertType(v1Type: string): AlertType {
  if (v1Type.includes('stock') || v1Type.includes('inventory')) {
    return 'stock';
  }
  if (v1Type.includes('price') || v1Type.includes('supplier')) {
    return 'business';
  }
  if (v1Type.includes('seasonal') || v1Type.includes('demand')) {
    return 'business';
  }
  return 'operational';
}

/**
 * Map V1 timeToAction to V2 autoExpire (milliseconds)
 */
function mapTimeToAction(timeToAction: SmartAlert['timeToAction']): number | undefined {
  const mapping: Record<SmartAlert['timeToAction'], number | undefined> = {
    'immediate': undefined, // No expiry - requires immediate action
    'within_24h': 24 * 60 * 60 * 1000, // 24 hours
    'within_week': 7 * 24 * 60 * 60 * 1000, // 7 days
    'next_month': 30 * 24 * 60 * 60 * 1000 // 30 days
  };
  return mapping[timeToAction];
}

/**
 * Convert V1 SmartAlert to V2 CreateAlertInput
 */
export function convertSmartAlertToCreateInput(
  smartAlert: SmartAlert,
  context: 'materials' | 'products' | 'sales' = 'materials'
): CreateAlertInput {
  return {
    type: inferAlertType(smartAlert.type),
    severity: mapSeverity(smartAlert.severity),
    context,
    intelligence_level: 'smart',
    
    title: smartAlert.title,
    description: smartAlert.description,
    
    metadata: {
      // Core identifiers
      itemId: smartAlert.itemId,
      itemName: smartAlert.itemName,
      
      // Stock metrics (for stock alerts)
      currentStock: smartAlert.currentValue,
      minThreshold: smartAlert.thresholdValue,
      
      // Business logic
      estimatedImpact: smartAlert.estimatedImpact,
      timeToResolve: mapTimeToActionToMinutes(smartAlert.timeToAction),
      
      // V1-specific data preserved in contextData
      abcClass: smartAlert.abcClass,
      deviation: smartAlert.deviation,
      actionPriority: smartAlert.actionPriority,
      
      // Original V1 data for debugging
      _v1Data: smartAlert.contextData
    },
    
    persistent: true, // Smart alerts are always persistent
    autoExpire: mapTimeToAction(smartAlert.timeToAction),
    
    // Convert recommended action to alert action
    actions: smartAlert.recommendedAction ? [{
      label: smartAlert.recommendedAction,
      variant: smartAlert.severity === 'urgent' || smartAlert.severity === 'critical' 
        ? 'primary' as const
        : 'secondary' as const,
      action: async () => {
        // Navigate to item detail or appropriate action
        const url = smartAlert.contextData.itemUrl 
          || `/admin/supply-chain/materials/${smartAlert.itemId}`;
        window.location.href = url;
      }
    }] : undefined
  };
}

/**
 * Helper: Convert timeToAction to minutes for metadata
 */
function mapTimeToActionToMinutes(timeToAction: SmartAlert['timeToAction']): number {
  const mapping: Record<SmartAlert['timeToAction'], number> = {
    'immediate': 0,
    'within_24h': 24 * 60,
    'within_week': 7 * 24 * 60,
    'next_month': 30 * 24 * 60
  };
  return mapping[timeToAction];
}

/**
 * Batch convert multiple alerts
 */
export function convertSmartAlertsToCreateInputs(
  smartAlerts: SmartAlert[],
  context: 'materials' | 'products' | 'sales' = 'materials'
): CreateAlertInput[] {
  return smartAlerts.map(alert => convertSmartAlertToCreateInput(alert, context));
}
```

---

### Step 1.2: Create Generic Hook

**File:** `src/hooks/useSmartModuleAlerts.ts` (NEW)

```typescript
/**
 * GENERIC SMART MODULE ALERTS HOOK
 * ============================================================================
 * Reusable hook for generating smart alerts across all modules
 * Eliminates duplication between Materials, Products, Sales, etc.
 * 
 * @module hooks/useSmartModuleAlerts
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAlertsActions } from '@/shared/alerts';
import { logger } from '@/lib/logging';
import type { AlertContext, CreateAlertInput } from '@/shared/alerts/types';

/**
 * Configuration for smart module alerts
 */
export interface SmartModuleAlertsConfig<T> {
  /** Module name for logging (e.g., 'Materials', 'Products') */
  moduleName: string;
  
  /** Alert context for filtering */
  context: AlertContext;
  
  /** Store selector to get items */
  useStore: () => T[];
  
  /** Adapter to generate alerts from items */
  adapter: {
    generateAlerts: (items: T[]) => Promise<CreateAlertInput[]> | CreateAlertInput[];
  };
  
  /** Optional: Circuit breaker interval (default: 3000ms) */
  circuitBreakerInterval?: number;
  
  /** Optional: Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Generic hook for smart module alerts
 * 
 * @example
 * ```typescript
 * // Materials module
 * const useSmartInventoryAlerts = () => useSmartModuleAlerts({
 *   moduleName: 'Materials',
 *   context: 'materials',
 *   useStore: () => useMaterialsStore(state => state.items),
 *   adapter: MaterialsAlertsAdapter
 * });
 * 
 * // Products module
 * const useSmartProductsAlerts = () => useSmartModuleAlerts({
 *   moduleName: 'Products',
 *   context: 'products',
 *   useStore: () => useProductsStore(state => state.products),
 *   adapter: ProductsAlertsAdapter
 * });
 * ```
 */
export function useSmartModuleAlerts<T>(config: SmartModuleAlertsConfig<T>) {
  const {
    moduleName,
    context,
    useStore,
    adapter,
    circuitBreakerInterval = 3000,
    debug = false
  } = config;

  const actions = useAlertsActions();
  const items = useStore();
  
  // Circuit breaker: Prevent excessive alert generation
  const lastGenerationRef = useRef<number>(0);

  /**
   * Generate and update alerts based on current data
   */
  const generateAndUpdateAlerts = useCallback(async () => {
    try {
      if (debug) {
        logger.debug(moduleName, `[useSmartModuleAlerts] Generating smart alerts...`, {
          timestamp: new Date().toISOString(),
          itemCount: items.length,
          context
        });
      }

      // 1. Clear previous alerts to avoid duplicates
      await actions.clearAll({ 
        context,
        intelligence_level: 'smart' 
      });

      // 2. Generate alerts via adapter
      const alerts = await adapter.generateAlerts(items);

      if (alerts.length === 0) {
        if (debug) {
          logger.debug(moduleName, `[useSmartModuleAlerts] No alerts to create`);
        }
        return;
      }

      // 3. Bulk create alerts (much faster than individual creates)
      const alertIds = await actions.bulkCreate(alerts);

      logger.info(moduleName, `Generated ${alertIds.length} smart alerts`, {
        context,
        alertCount: alertIds.length,
        severities: alerts.reduce((acc, alert) => {
          acc[alert.severity] = (acc[alert.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });

    } catch (error) {
      logger.error(moduleName, `Error generating smart alerts:`, error);
    }
  }, [items, actions, adapter, context, moduleName, debug]);

  // Auto-generate alerts when items change
  // Circuit Breaker: Rate limit to prevent excessive evaluations
  useEffect(() => {
    if (items.length === 0) {
      if (debug) {
        logger.debug(moduleName, `[useSmartModuleAlerts] No items to evaluate`);
      }
      return;
    }

    const now = Date.now();
    const timeSinceLastGeneration = now - lastGenerationRef.current;

    if (timeSinceLastGeneration >= circuitBreakerInterval) {
      lastGenerationRef.current = now;
      generateAndUpdateAlerts();

      if (debug) {
        logger.debug(moduleName, `[useSmartModuleAlerts] Alert generation allowed`, {
          timeSinceLastGeneration: `${timeSinceLastGeneration}ms`,
          itemsCount: items.length
        });
      }
    } else {
      if (debug) {
        logger.warn(moduleName, `[useSmartModuleAlerts] Alert generation throttled`, {
          timeSinceLastGeneration: `${timeSinceLastGeneration}ms`,
          threshold: `${circuitBreakerInterval}ms`,
          itemsCount: items.length
        });
      }
    }
  }, [items, generateAndUpdateAlerts, circuitBreakerInterval, moduleName, debug]);

  return {
    generateAndUpdateAlerts
  };
}
```

---

## 📋 Phase 2: Migration (Days 3-7)

### Step 2.1: Migrate Materials to V2

**File:** `src/modules/materials/alerts/rules.ts` (NEW)

```typescript
/**
 * MATERIALS SMART ALERT RULES
 * ============================================================================
 * Business intelligence rules for inventory/materials management
 * Uses V2 SmartAlertsEngine architecture
 */

import type { SmartAlertRule } from '@/lib/alerts/types/smartRules';
import type { MaterialABC } from '@/pages/admin/supply-chain/materials/types/abc-analysis';

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
      estimatedImpact: item.abcClass === 'A' ? 'high' : item.abcClass === 'B' ? 'medium' : 'low'
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
      recommendedOrder: Math.ceil(item.min_stock * 1.5)
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
      estimatedCapitalTied: item.currentStock * (item.unit_cost || 0)
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
      abcClass: 'A',
      annualValue: item.annualValue,
      revenuePercentage: item.revenuePercentage
    }),
    priority: 95
  }
];

/**
 * Combined rules for Materials module
 */
export const MATERIALS_SMART_RULES: SmartAlertRule<MaterialABC>[] = [
  ...MATERIALS_STOCK_RULES,
  ...MATERIALS_ABC_RULES
];
```

---

**File:** `src/modules/materials/alerts/engine.ts` (NEW)

```typescript
/**
 * MATERIALS ALERTS ENGINE INSTANCE
 * ============================================================================
 * Pre-configured SmartAlertsEngine for Materials module
 */

import { SmartAlertsEngine } from '@/lib/alerts/SmartAlertsEngine';
import { MATERIALS_SMART_RULES } from './rules';

/**
 * Materials smart alerts engine
 * Evaluates materials data against business rules
 */
export const materialsAlertsEngine = new SmartAlertsEngine({
  rules: MATERIALS_SMART_RULES,
  context: 'materials',
  circuitBreakerInterval: 3000,
  maxAlertsPerEvaluation: 100,
  debug: false // Set true for detailed logs
});

/**
 * Re-export for convenience
 */
export { MATERIALS_SMART_RULES };
```

---

**File:** `src/modules/materials/alerts/adapter.ts` (NEW)

```typescript
/**
 * MATERIALS ALERTS ADAPTER
 * ============================================================================
 * Adapts Materials module data to unified alert system
 * Uses V2 SmartAlertsEngine
 */

import type { CreateAlertInput } from '@/shared/alerts/types';
import type { MaterialABC } from '@/pages/admin/supply-chain/materials/types/abc-analysis';
import { materialsAlertsEngine } from './engine';
import { logger } from '@/lib/logging';

export class MaterialsAlertsAdapter {
  /**
   * Generate smart alerts for materials
   */
  static async generateAlerts(materials: MaterialABC[]): Promise<CreateAlertInput[]> {
    try {
      // Use V2 engine to evaluate rules
      const alerts = materialsAlertsEngine.evaluate(materials);
      
      logger.debug('MaterialsAlertsAdapter', `Generated ${alerts.length} alerts from ${materials.length} items`);
      
      return alerts;
      
    } catch (error) {
      logger.error('MaterialsAlertsAdapter', 'Error generating alerts', error);
      return [];
    }
  }
}
```

---

**File:** `src/hooks/useSmartInventoryAlerts.ts` (REFACTOR)

```typescript
/**
 * USE SMART INVENTORY ALERTS HOOK
 * ============================================================================
 * Materials module smart alerts
 * Now uses generic useSmartModuleAlerts hook (V2)
 */

import { useShallow } from 'zustand/react/shallow';
import { useMaterialsStore } from '@/store/materialsStore';
import { useSmartModuleAlerts } from './useSmartModuleAlerts';
import { MaterialsAlertsAdapter } from '@/modules/materials/alerts/adapter';
import type { MaterialABC } from '@/pages/admin/supply-chain/materials/types/abc-analysis';

/**
 * Converts MaterialItem[] to MaterialABC[] with default classification
 */
function convertToMaterialABC(materials: any[]): MaterialABC[] {
  return materials.map(material => {
    if ('abcClass' in material && material.abcClass) {
      return material as MaterialABC;
    }

    return {
      ...material,
      abcClass: 'C',
      annualConsumption: 0,
      annualValue: 0,
      revenuePercentage: 0,
      cumulativeRevenue: 0,
      currentStock: material.stock || 0,
      consumptionFrequency: 0,
      monthlyConsumption: 0,
      totalStockValue: (material.stock || 0) * (material.unit_cost || 0)
    } as MaterialABC;
  });
}

/**
 * Smart alerts hook for inventory/materials
 */
export function useSmartInventoryAlerts() {
  // Get materials from store
  const materials = useMaterialsStore(
    useShallow(state => state.items)
  );

  // Use generic hook with Materials-specific config
  return useSmartModuleAlerts({
    moduleName: 'Materials',
    context: 'materials',
    useStore: () => convertToMaterialABC(materials),
    adapter: MaterialsAlertsAdapter,
    circuitBreakerInterval: 3000,
    debug: false
  });
}

export default useSmartInventoryAlerts;
```

**Result:** useSmartInventoryAlerts.ts reduced from 168 lines → ~60 lines (64% reduction)

---

### Step 2.2: Migrate Products to V2

**File:** `src/hooks/useSmartProductsAlerts.ts` (REFACTOR)

```typescript
/**
 * USE SMART PRODUCTS ALERTS HOOK
 * ============================================================================
 * Products module smart alerts
 * Now uses generic useSmartModuleAlerts hook (V2)
 */

import { useProductsStore } from '@/store/productsStore';
import { useSmartModuleAlerts } from './useSmartModuleAlerts';
import { ProductsAlertsAdapter } from '@/modules/products/services/productsAlertsAdapter';

/**
 * Smart alerts hook for products
 */
export function useSmartProductsAlerts() {
  return useSmartModuleAlerts({
    moduleName: 'Products',
    context: 'products',
    useStore: () => useProductsStore(state => state.products),
    adapter: ProductsAlertsAdapter,
    circuitBreakerInterval: 3000,
    debug: false
  });
}

export default useSmartProductsAlerts;
```

**Result:** useSmartProductsAlerts.ts reduced from 118 lines → ~25 lines (79% reduction)

---

## 📋 Phase 3: Cleanup (Days 8-10)

### Step 3.1: Deprecate Old Engine

**File:** `src/pages/admin/supply-chain/materials/services/smartAlertsEngine.ts` (MODIFY)

Add deprecation notice at top:

```typescript
/**
 * @deprecated This V1 engine is deprecated. Use new V2 architecture:
 * - Rules: src/modules/materials/alerts/rules.ts
 * - Engine: src/modules/materials/alerts/engine.ts
 * - Adapter: src/modules/materials/alerts/adapter.ts
 * 
 * Migration: See CODE_REFACTORING_PLAN.md
 * Will be removed in v3.2.0 (January 2026)
 */

// ... existing code with @deprecated tags on exports
```

---

### Step 3.2: Remove Dead Code

Delete unused factory function:

```typescript
// ❌ DELETE from src/lib/alerts/SmartAlertsEngine.ts (lines 295-306)
export function createSmartAlertsEngine<T = any>(
  config: SmartAlertsEngineConfig<T>
): SmartAlertsEngine<T> {
  return new SmartAlertsEngine(config);
}
```

---

### Step 3.3: Use Type Guard

**File:** `src/lib/alerts/SmartAlertsEngine.ts` (MODIFY)

```typescript
// Line 1: Add import
import { isValidSmartAlertRule } from './types/smartRules';

// Lines 81-87: Replace manual validation
private validateConfiguration(): void {
  if (!this.config.rules || this.config.rules.length === 0) {
    throw new Error('SmartAlertsEngine: No rules provided');
  }

  if (!this.config.context) {
    throw new Error('SmartAlertsEngine: Context is required');
  }

  // ✅ Use type guard instead of manual checks
  for (const rule of this.config.rules) {
    if (!isValidSmartAlertRule(rule)) {
      throw new Error(`SmartAlertsEngine: Invalid rule configuration for rule ${rule.id || 'unknown'}`);
    }
  }
}
```

---

## 📋 Phase 4: Testing (Days 11-15)

### Step 4.1: Unit Tests for V2 Engine

**File:** `src/lib/alerts/__tests__/SmartAlertsEngine.test.ts` (NEW)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SmartAlertsEngine } from '../SmartAlertsEngine';
import type { SmartAlertRule, SmartAlertsEngineConfig } from '../types/smartRules';

describe('SmartAlertsEngine', () => {
  interface TestItem {
    id: string;
    name: string;
    value: number;
  }

  const mockRules: SmartAlertRule<TestItem>[] = [
    {
      id: 'test-rule-1',
      name: 'Test Rule 1',
      condition: (item) => item.value > 100,
      severity: 'high',
      title: (item) => `High value: ${item.name}`,
      description: (item) => `Value ${item.value} exceeds threshold`,
      metadata: (item) => ({ itemId: item.id, value: item.value }),
      priority: 100
    },
    {
      id: 'test-rule-2',
      name: 'Test Rule 2',
      condition: (item) => item.value < 10,
      severity: 'medium',
      title: (item) => `Low value: ${item.name}`,
      description: (item) => `Value ${item.value} below threshold`,
      metadata: (item) => ({ itemId: item.id, value: item.value }),
      priority: 50
    }
  ];

  const config: SmartAlertsEngineConfig<TestItem> = {
    rules: mockRules,
    context: 'materials',
    circuitBreakerInterval: 1000,
    maxAlertsPerEvaluation: 10,
    debug: false
  };

  describe('constructor', () => {
    it('should create engine with valid config', () => {
      expect(() => new SmartAlertsEngine(config)).not.toThrow();
    });

    it('should throw error if no rules provided', () => {
      expect(() => 
        new SmartAlertsEngine({ ...config, rules: [] })
      ).toThrow('No rules provided');
    });

    it('should throw error if no context provided', () => {
      expect(() => 
        new SmartAlertsEngine({ ...config, context: '' as any })
      ).toThrow('Context is required');
    });

    it('should apply default config values', () => {
      const engine = new SmartAlertsEngine({
        rules: mockRules,
        context: 'materials'
      });
      
      const engineConfig = engine.getConfig();
      expect(engineConfig.circuitBreakerInterval).toBe(3000);
      expect(engineConfig.maxAlertsPerEvaluation).toBe(100);
      expect(engineConfig.debug).toBe(false);
    });
  });

  describe('evaluate', () => {
    let engine: SmartAlertsEngine<TestItem>;

    beforeEach(() => {
      engine = new SmartAlertsEngine(config);
      engine.resetCircuitBreaker();
    });

    it('should generate alerts for matching conditions', () => {
      const data: TestItem[] = [
        { id: '1', name: 'Item 1', value: 150 }, // Matches rule 1
        { id: '2', name: 'Item 2', value: 5 },   // Matches rule 2
        { id: '3', name: 'Item 3', value: 50 }   // No match
      ];

      const alerts = engine.evaluate(data);

      expect(alerts).toHaveLength(2);
      expect(alerts[0].title).toBe('High value: Item 1'); // Priority 100 first
      expect(alerts[0].severity).toBe('high');
      expect(alerts[1].title).toBe('Low value: Item 2');
      expect(alerts[1].severity).toBe('medium');
    });

    it('should respect circuit breaker', () => {
      const data: TestItem[] = [
        { id: '1', name: 'Item 1', value: 150 }
      ];

      // First evaluation
      const alerts1 = engine.evaluate(data);
      expect(alerts1).toHaveLength(1);

      // Immediate second evaluation (blocked)
      const alerts2 = engine.evaluate(data);
      expect(alerts2).toHaveLength(0);
    });

    it('should limit max alerts per evaluation', () => {
      const limitedEngine = new SmartAlertsEngine({
        ...config,
        maxAlertsPerEvaluation: 1
      });

      const data: TestItem[] = [
        { id: '1', name: 'Item 1', value: 150 },
        { id: '2', name: 'Item 2', value: 5 }
      ];

      const alerts = limitedEngine.evaluate(data);
      expect(alerts).toHaveLength(1); // Only first alert due to limit
    });

    it('should handle empty data', () => {
      const alerts = engine.evaluate([]);
      expect(alerts).toHaveLength(0);
    });

    it('should set intelligence_level to smart', () => {
      const data: TestItem[] = [
        { id: '1', name: 'Item 1', value: 150 }
      ];

      const alerts = engine.evaluate(data);
      expect(alerts[0].intelligence_level).toBe('smart');
    });

    it('should infer alert type from rule', () => {
      const stockRule: SmartAlertRule<TestItem> = {
        id: 'stock-low',
        name: 'Low Stock',
        condition: (item) => item.value < 10,
        severity: 'high',
        title: (item) => 'Low stock',
        description: (item) => 'Stock is low',
        metadata: (item) => ({ itemId: item.id })
      };

      const stockEngine = new SmartAlertsEngine({
        rules: [stockRule],
        context: 'materials'
      });

      const alerts = stockEngine.evaluate([{ id: '1', name: 'Test', value: 5 }]);
      expect(alerts[0].type).toBe('stock');
    });
  });

  describe('getConfig', () => {
    it('should return readonly copy of config', () => {
      const engine = new SmartAlertsEngine(config);
      const engineConfig = engine.getConfig();
      
      expect(engineConfig.context).toBe('materials');
      expect(engineConfig.rules).toHaveLength(2);
    });
  });

  describe('updateConfig', () => {
    it('should update circuit breaker interval', () => {
      const engine = new SmartAlertsEngine(config);
      engine.updateConfig({ circuitBreakerInterval: 5000 });
      
      expect(engine.getConfig().circuitBreakerInterval).toBe(5000);
    });

    it('should update max alerts limit', () => {
      const engine = new SmartAlertsEngine(config);
      engine.updateConfig({ maxAlertsPerEvaluation: 50 });
      
      expect(engine.getConfig().maxAlertsPerEvaluation).toBe(50);
    });

    it('should not allow updating rules or context', () => {
      const engine = new SmartAlertsEngine(config);
      
      // TypeScript should prevent this at compile time
      // @ts-expect-error - Testing runtime behavior
      engine.updateConfig({ rules: [], context: 'products' });
      
      // Config should remain unchanged
      expect(engine.getConfig().context).toBe('materials');
      expect(engine.getConfig().rules).toHaveLength(2);
    });
  });
});
```

---

### Step 4.2: Integration Tests

**File:** `src/lib/alerts/__tests__/SmartAlertsEngine.integration.test.ts` (NEW)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { SmartAlertsEngine } from '../SmartAlertsEngine';
import { MATERIALS_SMART_RULES } from '@/modules/materials/alerts/rules';
import type { MaterialABC } from '@/pages/admin/supply-chain/materials/types/abc-analysis';

describe('SmartAlertsEngine - Materials Integration', () => {
  let engine: SmartAlertsEngine<MaterialABC>;

  beforeEach(() => {
    engine = new SmartAlertsEngine({
      rules: MATERIALS_SMART_RULES,
      context: 'materials'
    });
    engine.resetCircuitBreaker();
  });

  it('should generate critical alert for out-of-stock Class A item', () => {
    const material: MaterialABC = {
      id: '1',
      name: 'Premium Beef',
      currentStock: 0,
      min_stock: 50,
      unit: 'kg',
      abcClass: 'A',
      annualValue: 50000,
      revenuePercentage: 40,
      // ... other required fields
    } as MaterialABC;

    const alerts = engine.evaluate([material]);

    expect(alerts.length).toBeGreaterThan(0);
    const criticalAlert = alerts.find(a => a.severity === 'critical');
    expect(criticalAlert).toBeDefined();
    expect(criticalAlert?.title).toContain('Sin stock');
    expect(criticalAlert?.metadata?.abcClass).toBe('A');
  });

  it('should generate multiple alerts for same item if multiple rules match', () => {
    // Item that matches both Class A attention + low stock rules
    const material: MaterialABC = {
      id: '1',
      name: 'High Value Item',
      currentStock: 40,
      min_stock: 100,
      unit: 'units',
      abcClass: 'A',
      annualValue: 100000,
      revenuePercentage: 50,
      // ... other required fields
    } as MaterialABC;

    const alerts = engine.evaluate([material]);

    // Should have alerts for:
    // - Low stock (currentStock <= min_stock)
    // - Class A attention (Class A + low stock)
    expect(alerts.length).toBeGreaterThanOrEqual(2);
  });
});
```

---

## 📊 Expected Results

### Metrics After Refactoring

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Total Lines** | ~1,500 | ~1,075 | -425 lines (28%) |
| **SmartAlertsEngine** | 2 implementations | 1 implementation | -300 lines |
| **Hook Code** | 286 lines (2 hooks) | 85 lines (1 generic + 2 wrappers) | -201 lines (70%) |
| **Type Systems** | 2 (SmartAlert + CreateAlertInput) | 1 (CreateAlertInput) | Unified |
| **Test Coverage** | V1 only (60%) | V1 + V2 (90%+) | +30% |
| **Maintainability** | 🟡 Medium | 🟢 High | ✅ |

---

## ✅ Validation Checklist

After completing refactoring:

- [ ] All existing tests pass
- [ ] New V2 tests achieve 90%+ coverage
- [ ] Materials alerts work identically to before
- [ ] Products alerts work identically to before
- [ ] No breaking changes to public API
- [ ] Documentation updated
- [ ] Old code marked `@deprecated`
- [ ] Performance benchmarks meet targets
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no warnings

---

## 🎯 Success Criteria

1. **Single Source of Truth**: Only one SmartAlertsEngine implementation
2. **Zero Duplication**: Hook pattern abstracted to single generic
3. **Type Safety**: Unified type system throughout
4. **Test Coverage**: 90%+ for all new code
5. **Performance**: Alert generation < 50ms for 100 items
6. **Developer Experience**: Easy to add new modules (5-line wrapper)

---

**Next Steps:**
1. Review this plan with team
2. Assign developers to phases
3. Create feature branch: `refactor/smart-alerts-v2-consolidation`
4. Start Phase 1

**Questions?** See CODE_AUDIT_REPORT.md for detailed analysis
