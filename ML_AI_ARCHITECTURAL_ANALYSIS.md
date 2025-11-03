# ANÁLISIS ARQUITECTÓNICO ML/AI - G-ADMIN MINI

**Fecha**: 2025-01-30
**Autor**: Claude Code
**Estado**: 🎯 **ANÁLISIS COMPLETADO**

---

## 🎯 RESUMEN EJECUTIVO

### Hallazgos Críticos

Tu intuición es **100% CORRECTA**. Después de analizar el código real:

1. **HAY un sistema unificado de alertas** (`@/shared/alerts`) que **NADIE está usando correctamente**
2. **HAY lógica común reutilizable** que está duplicada en múltiples módulos
3. **HAY un patrón híbrido** funcionando parcialmente (Adapters + Intelligence Engines)
4. **SÍ hay forma de conectar todo**, pero falta implementación consistente

---

## 📊 MAPA DEL ECOSISTEMA ACTUAL

### 1. SISTEMA BASE (✅ Existente pero subutilizado)

**Ubicación**: `src/shared/alerts/`

**Componentes**:
```typescript
// SISTEMA UNIFICADO DE ALERTAS (✅ YA EXISTE)
- AlertsProvider          // Context global
- useAlerts()            // Hook principal
- useStockAlerts()       // Hook especializado (existe pero no se usa)
- AlertDisplay           // Componente de visualización
- AlertBadge            // Badge de alertas
- GlobalAlertsDisplay   // Display global
```

**Características**:
- ✅ Sistema de severidades: `critical | high | medium | low | info`
- ✅ Sistema de tipos: `stock | business | operational | system | validation`
- ✅ Sistema de contextos: `materials | sales | scheduling | global`
- ✅ Actions personalizables por alerta
- ✅ Auto-expiración y persistencia
- ✅ Stats y analytics
- ✅ **AlertUtils** helper functions

**Problema**: Solo Materials está intentando usarlo (incompletamente)

---

### 2. INTELLIGENCE ENGINES (Patrón correcto ✅)

#### A. SalesIntelligenceEngine (✅ Funciona bien)

**Ubicación**: `src/pages/admin/operations/sales/services/SalesIntelligenceEngine.ts`

**Patrón**:
```typescript
export class SalesIntelligenceEngine {
  // ✅ Static methods (no singleton, no estado global)
  static generateSalesAlerts(data: SalesAnalysisData, config?: Config): SalesAlert[] {
    const alerts: SalesAlert[] = [];

    // 1. Análisis de revenue patterns
    alerts.push(...this.analyzeRevenue(data));

    // 2. Análisis de conversión
    alerts.push(...this.analyzeConversion(data));

    // 3. Análisis cross-module
    alerts.push(...this.analyzeCrossModuleImpact(data));

    return alerts;
  }
}
```

**Integración**:
```typescript
// Hook: useSalesAlerts.ts
export function useSalesAlerts() {
  const salesData = useSalesStore();

  const alerts = useMemo(() =>
    SalesIntelligenceEngine.generateSalesAlerts(salesData),
    [salesData]
  );

  return { alerts };
}
```

**Adaptador**: `SalesAlertsAdapter.ts`
```typescript
// Convierte SalesAlert → CreateAlertInput (formato unificado)
export class SalesAlertsAdapter {
  static convertToUnifiedAlerts(salesAlerts: SalesAlert[]): CreateAlertInput[] {
    return salesAlerts.map(alert => ({
      id: alert.id,
      type: mapSalesTypeToUnified(alert.type),
      severity: mapSeverity(alert.severity),
      context: 'sales',
      title: alert.title,
      description: alert.description,
      // ... metadata, actions
    }));
  }
}
```

---

#### B. SchedulingIntelligenceEngine (✅ Funciona bien)

**Ubicación**: `src/pages/admin/resources/scheduling/services/SchedulingIntelligenceEngine.ts`

**Patrón**: Idéntico a Sales (correcto)

```typescript
export class SchedulingIntelligenceEngine {
  analyze(data: SchedulingData): IntelligentAlert[] {
    const alerts: IntelligentAlert[] = [];

    // 1. Labor costs analysis
    alerts.push(...this.analyzeLaborCosts(data));

    // 2. Coverage gaps analysis
    alerts.push(...this.analyzeCoverageGaps(data));

    // 3. Efficiency patterns
    alerts.push(...this.analyzeEfficiencyPatterns(data));

    // 4. Compliance checking
    alerts.push(...this.analyzeCompliance(data));

    // 5. PREDICTIVE analysis
    alerts.push(...this.analyzePredictiveIssues(data));

    return alerts;
  }
}
```

**Adaptador**: `SchedulingAlertsAdapter.ts` (mismo patrón que Sales)

---

#### C. SmartAlertsEngine (Materials) (⚠️ Funciona pero desconectado)

**Ubicación**: `src/pages/admin/supply-chain/materials/services/smartAlertsEngine.ts`

**Patrón**: ✅ Correcto (static methods)

```typescript
export class SmartAlertsEngine {
  static generateSmartAlerts(materials: MaterialABC[], config?: Config): SmartAlert[] {
    const alerts: SmartAlert[] = [];

    // 1. Low stock detection (basado en ABC class)
    alerts.push(...this.detectLowStock(materials));

    // 2. Out of stock (critical)
    alerts.push(...this.detectOutOfStock(materials));

    // 3. Overstocked detection
    alerts.push(...this.detectOverstock(materials));

    // 4. Slow moving inventory
    alerts.push(...this.detectSlowMoving(materials));

    return alerts;
  }
}
```

**Adaptador**: `smartAlertsAdapter.ts` ✅ Existe y está bien implementado

**Hook**: `useSmartInventoryAlerts.ts` ❌ **STUB SIN IMPLEMENTAR**

```typescript
// ❌ ACTUALMENTE ES SOLO UN STUB
export function useSmartInventoryAlerts() {
  const generateAndUpdateAlerts = useCallback(() => {
    // TODO: Query materials data
    // TODO: Apply ML algorithms
    // TODO: Generate alerts using addAlert()

    logger.debug('Stub implementation'); // ← NO HACE NADA
  }, []);

  return { generateAndUpdateAlerts };
}
```

---

### 3. CÓDIGO ML/AI NO USADO (Potencial reutilizable)

#### A. MLEngine.ts (❌ Roto, pero tiene lógica útil)

**Ubicación**: `src/lib/ml/core/MLEngine.ts` (660 líneas)

**Lógica Reutilizable**:
```typescript
class TimeSeriesForecastEngine {
  // ✅ Útil: Moving averages
  private simpleMovingAverage(data: number[], window: number): number[]

  // ✅ Útil: Exponential smoothing
  private exponentialSmoothing(data: number[], alpha: number): number[]

  // ✅ Útil: Seasonal decomposition
  private seasonalForecast(data: number[], seasonLength: number): {...}

  // ✅ Útil: Linear regression
  private linearRegression(x: number[], y: number[]): {...}

  // ✅ Útil: Trend detection
  private detectTrend(data: number[]): 'increasing' | 'decreasing' | 'stable'
}
```

**Problemas del código actual**:
- ❌ Singleton pattern (innecesario)
- ❌ EventBus listeners rotos (variable `event` no definida)
- ❌ Background processing inútil (loop de 1 hora sin datos)
- ❌ Datos mockeados (no usa Supabase)

**Solución**: Extraer algoritmos puros a `src/lib/ml/timeseries.ts`

---

#### B. PredictiveInventory.ts (❌ Depende de MLEngine roto)

**Ubicación**: `src/lib/ml/inventory/PredictiveInventory.ts` (672 líneas)

**Lógica Reutilizable**:
```typescript
class PredictiveInventoryManager {
  // ✅ Útil: EOQ calculation (Economic Order Quantity)
  private calculateEOQ(demand, orderCost, holdingCost): number

  // ✅ Útil: Reorder point optimization
  private optimizeReorderPoint(leadTime, demand, serviceLevel): number

  // ✅ Útil: Stockout risk assessment
  private assessStockoutRisk(current, forecast, leadTime): number

  // ✅ Útil: Alternative products suggestion
  private suggestAlternatives(itemId): Array<{id, ratio}>
}
```

**Problemas**:
- ❌ Depende de MLEngine (que está roto)
- ❌ Singleton pattern
- ❌ EventBus listeners rotos
- ❌ No integrado con Materials module

**Solución**: Refactorizar como `MaterialsIntelligenceEngine` (patrón correcto)

---

#### C. SmartRecommendations.ts (⚠️ Útil para Products/Sales)

**Ubicación**: `src/lib/ml/recommendations/SmartRecommendations.ts`

**Lógica Reutilizable**:
```typescript
class SmartRecommendationEngine {
  // ✅ Útil: Menu optimization
  recommendMenuOptimization(menu: MenuItem[]): Recommendation[]

  // ✅ Útil: Personalized recommendations
  getPersonalizedRecommendations(customer: CustomerProfile): MenuItem[]

  // ✅ Útil: Cross-selling opportunities
  findCrossSellOpportunities(orderHistory): Array<{item, probability}>

  // ✅ Útil: Pricing optimization
  optimizePricing(item: MenuItem, competitorData): PriceRecommendation
}
```

**Uso potencial**:
- Products module: Menu optimization
- Sales module: Cross-selling suggestions
- Customers module: Personalized recommendations

---

#### D. AnomalyDetection.ts (⚠️ Útil para System Health)

**Ubicación**: `src/lib/ml/selfhealing/AnomalyDetection.ts`

**Lógica Reutilizable**:
```typescript
class AnomalyDetectionSystem {
  // ✅ Útil: Performance monitoring
  detectPerformanceAnomalies(metrics: HealthMetric[]): Anomaly[]

  // ✅ Útil: Data quality issues
  detectDataAnomalies(data): Anomaly[]

  // ✅ Útil: Business pattern anomalies
  detectBusinessAnomalies(metrics): Anomaly[]
}
```

**Uso potencial**:
- Settings/Diagnostics module
- Performance monitoring dashboard
- Debug/DevTools module

---

## 🎨 ARQUITECTURA PROPUESTA: SISTEMA UNIFICADO

### Estructura de 3 Capas

```
┌─────────────────────────────────────────────────────────────┐
│               CAPA 1: SISTEMA BASE (Shared)                 │
├─────────────────────────────────────────────────────────────┤
│  src/shared/alerts/                                         │
│  - AlertsProvider (Context)                                 │
│  - useAlerts() (Hook principal)                             │
│  - useContextAlerts() (Hook por módulo)                     │
│  - Alert Types/Interfaces unificados                        │
│  - AlertDisplay, AlertBadge, GlobalAlertsDisplay            │
└─────────────────────────────────────────────────────────────┘
                            ↑
                            │ (usa via Adapter)
                            │
┌─────────────────────────────────────────────────────────────┐
│         CAPA 2: INTELLIGENCE ENGINES (Por módulo)           │
├─────────────────────────────────────────────────────────────┤
│  src/pages/admin/[domain]/[module]/services/               │
│                                                             │
│  ✅ SalesIntelligenceEngine.ts                              │
│     - analyzeRevenue()                                      │
│     - analyzeConversion()                                   │
│     - analyzeCrossModuleImpact()                            │
│     + SalesAlertsAdapter → Sistema Unificado ✅             │
│                                                             │
│  ✅ SchedulingIntelligenceEngine.ts                         │
│     - analyzeLaborCosts()                                   │
│     - analyzeCoverageGaps()                                 │
│     - analyzeEfficiency()                                   │
│     + SchedulingAlertsAdapter → Sistema Unificado ✅        │
│                                                             │
│  ⚠️ SmartAlertsEngine.ts (Materials - ya funciona)          │
│     - detectLowStock()                                      │
│     - detectOutOfStock()                                    │
│     - detectOverstock()                                     │
│     - detectSlowMoving()                                    │
│     + SmartAlertsAdapter → Sistema Unificado ✅             │
│     ⚠️ Hook useSmartInventoryAlerts NO implementado         │
│                                                             │
│  🆕 ProductsIntelligenceEngine.ts (crear)                   │
│     - analyzeMenuPerformance()                              │
│     - analyzePricingOpportunities()                         │
│     - analyzeCrossSelling()                                 │
│                                                             │
│  🆕 CustomersIntelligenceEngine.ts (crear)                  │
│     - analyzeCustomerBehavior()                             │
│     - analyzeChurnRisk()                                    │
│     - analyzeLifetimeValue()                                │
└─────────────────────────────────────────────────────────────┘
                            ↑
                            │ (usa)
                            │
┌─────────────────────────────────────────────────────────────┐
│    CAPA 3: ML ALGORITHMS (Pure functions)                  │
├─────────────────────────────────────────────────────────────┤
│  src/lib/ml/                                                │
│                                                             │
│  🆕 timeseries.ts                                           │
│     - simpleMovingAverage()                                 │
│     - exponentialSmoothing()                                │
│     - seasonalDecomposition()                               │
│     - linearRegression()                                    │
│     - detectTrend()                                         │
│                                                             │
│  🆕 forecasting.ts                                          │
│     - forecastDemand()                                      │
│     - predictStockout()                                     │
│     - optimizeReorderPoint()                                │
│                                                             │
│  🆕 recommendations.ts                                      │
│     - calculateSimilarity()                                 │
│     - collaborativeFiltering()                              │
│     - contentBasedFiltering()                               │
│                                                             │
│  🆕 anomalyDetection.ts                                     │
│     - detectOutliers()                                      │
│     - calculateZScore()                                     │
│     - detectSeasonalAnomalies()                             │
└─────────────────────────────────────────────────────────────┘
```

**✅ CORRECCIÓN IMPORTANTE**:
- Smart Alerts **YA USAN** el sistema unificado via `SmartAlertsAdapter`
- El adapter convierte `SmartAlert` → `CreateAlertInput` (formato del sistema)
- Solo falta **implementar el hook** `useSmartInventoryAlerts` (actualmente es stub)

---

## 🔄 FLUJO DE INTEGRACIÓN

### Ejemplo: Materials Module

```typescript
// ============================================
// PASO 1: ML Algorithms (Pure functions)
// ============================================
// src/lib/ml/forecasting.ts

export function forecastDemand(
  historicalData: number[],
  seasonality: number = 7,
  horizon: number = 30
): ForecastResult {
  // 1. Detect trend
  const trend = detectTrend(historicalData);

  // 2. Seasonal decomposition
  const { seasonal, residual } = seasonalDecomposition(historicalData, seasonality);

  // 3. Forecast using exponential smoothing
  const forecast = exponentialSmoothing([...historicalData, ...residual], 0.3);

  return {
    predictions: forecast.slice(-horizon),
    trend,
    seasonalFactors: seasonal,
    confidence: calculateConfidence(residual)
  };
}

// ============================================
// PASO 2: Intelligence Engine (Domain logic)
// ============================================
// src/pages/admin/supply-chain/materials/services/MaterialsIntelligenceEngine.ts

import { forecastDemand, calculateEOQ } from '@/lib/ml/forecasting';
import { detectOutliers } from '@/lib/ml/anomalyDetection';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

export interface MaterialsAlert {
  id: string;
  type: 'low_stock' | 'stockout_risk' | 'overstock' | 'slow_moving';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  itemId: string;
  itemName: string;

  // Métricas
  currentValue: number;
  targetValue: number;
  deviation: number;

  // Recomendaciones
  recommendedAction: string;
  estimatedImpact: 'high' | 'medium' | 'low';

  // Context
  metadata: {
    abcClass?: 'A' | 'B' | 'C';
    forecastedDemand?: number;
    daysUntilStockout?: number;
    reorderQuantity?: number;
  };
}

export class MaterialsIntelligenceEngine {

  /**
   * Analiza stock levels y genera alertas inteligentes
   */
  static analyzeStockLevels(
    materials: Material[],
    config?: AnalysisConfig
  ): MaterialsAlert[] {
    const alerts: MaterialsAlert[] = [];

    for (const material of materials) {
      // 1. Check current stock vs thresholds
      if (material.current_stock <= 0) {
        alerts.push(this.createOutOfStockAlert(material));
        continue;
      }

      if (material.current_stock <= material.min_stock) {
        alerts.push(this.createLowStockAlert(material));
      }

      // 2. Forecast demand (usando business logic común)
      const forecast = forecastDemand(material.consumptionHistory || []);

      // 3. Predict stockout
      const daysUntilStockout = this.calculateDaysUntilStockout(
        material.current_stock,
        forecast.predictions
      );

      if (daysUntilStockout <= 7) {
        alerts.push(this.createStockoutRiskAlert(material, daysUntilStockout));
      }

      // 4. Detect overstock
      if (material.current_stock > material.max_stock * 1.5) {
        alerts.push(this.createOverstockAlert(material));
      }

      // 5. Detect slow-moving (usando anomaly detection)
      const isSlowMoving = detectOutliers(
        material.consumptionHistory || [],
        { threshold: 2.5 }
      );

      if (isSlowMoving) {
        alerts.push(this.createSlowMovingAlert(material));
      }
    }

    return alerts;
  }

  /**
   * Analiza demand patterns y genera recomendaciones
   */
  static analyzeDemandPatterns(materials: Material[]): DemandInsight[] {
    // Lógica de análisis de patrones de demanda
    // Usa business logic común (timeseries analysis)
  }

  private static createLowStockAlert(material: Material): MaterialsAlert {
    const deviation = ((material.min_stock - material.current_stock) / material.min_stock) * 100;

    return {
      id: `low-stock-${material.id}`,
      type: 'low_stock',
      severity: deviation > 50 ? 'high' : 'medium',
      title: `Stock bajo: ${material.name}`,
      description: `Solo quedan ${material.current_stock} ${material.unit}`,
      itemId: material.id,
      itemName: material.name,
      currentValue: material.current_stock,
      targetValue: material.min_stock,
      deviation,
      recommendedAction: 'Crear orden de compra',
      estimatedImpact: 'high',
      metadata: {
        abcClass: material.abc_class,
        reorderQuantity: calculateEOQ(material)
      }
    };
  }

  // ... otros métodos de creación de alertas
}

// ============================================
// PASO 3: Adapter (Conversión al formato unificado)
// ============================================
// src/pages/admin/supply-chain/materials/services/MaterialsAlertsAdapter.ts

import { MaterialsIntelligenceEngine, type MaterialsAlert } from './MaterialsIntelligenceEngine';
import type { CreateAlertInput } from '@/shared/alerts/types';

export class MaterialsAlertsAdapter {

  static generateMaterialsAlerts(materials: Material[]): CreateAlertInput[] {
    // 1. Generar alertas inteligentes
    const intelligentAlerts = MaterialsIntelligenceEngine.analyzeStockLevels(materials);

    // 2. Convertir al formato unificado
    return intelligentAlerts.map(alert => this.convertToUnified(alert));
  }

  private static convertToUnified(alert: MaterialsAlert): CreateAlertInput {
    return {
      id: alert.id,
      type: this.mapType(alert.type),
      severity: this.mapSeverity(alert.severity),
      context: 'materials',
      title: alert.title,
      description: alert.description,
      metadata: {
        itemId: alert.itemId,
        itemName: alert.itemName,
        currentValue: alert.currentValue,
        targetValue: alert.targetValue,
        deviation: alert.deviation,
        ...alert.metadata
      },
      actions: this.createActions(alert)
    };
  }

  private static mapType(type: MaterialsAlert['type']): AlertType {
    const map = {
      'low_stock': 'stock',
      'stockout_risk': 'stock',
      'overstock': 'stock',
      'slow_moving': 'business'
    };
    return map[type];
  }

  private static createActions(alert: MaterialsAlert): AlertAction[] {
    const actions: AlertAction[] = [];

    if (alert.type === 'low_stock' || alert.type === 'stockout_risk') {
      actions.push({
        label: 'Crear Orden de Compra',
        variant: 'primary',
        action: () => {
          // Navigate to create purchase order
          window.location.href = `/suppliers/orders/new?itemId=${alert.itemId}`;
        }
      });
    }

    actions.push({
      label: 'Ver Detalles',
      variant: 'secondary',
      action: () => {
        window.location.href = `/materials/${alert.itemId}`;
      }
    });

    return actions;
  }
}

// ============================================
// PASO 4: Hook (React integration)
// ============================================
// src/pages/admin/supply-chain/materials/hooks/useMaterialsAlerts.ts

import { useCallback, useEffect } from 'react';
import { useAlerts } from '@/shared/alerts';
import { useMaterialsStore } from '@/stores/useMaterialsStore';
import { MaterialsAlertsAdapter } from '../services/MaterialsAlertsAdapter';
import { logger } from '@/lib/logging';

export function useMaterialsAlerts() {
  const { addAlert, clearContext } = useAlerts();
  const materials = useMaterialsStore(state => state.items);

  const generateAndUpdateAlerts = useCallback(() => {
    try {
      // 1. Clear previous materials alerts
      clearContext('materials');

      // 2. Generate new alerts via adapter
      const alerts = MaterialsAlertsAdapter.generateMaterialsAlerts(materials);

      // 3. Add alerts to unified system
      alerts.forEach(alert => addAlert(alert));

      logger.info('Materials', `Generated ${alerts.length} intelligent alerts`);
    } catch (error) {
      logger.error('Materials', 'Error generating alerts:', error);
    }
  }, [materials, addAlert, clearContext]);

  // Auto-generate alerts when materials change
  useEffect(() => {
    generateAndUpdateAlerts();
  }, [materials, generateAndUpdateAlerts]);

  return {
    generateAndUpdateAlerts
  };
}

// ============================================
// PASO 5: Component (UI)
// ============================================
// src/pages/admin/supply-chain/materials/components/MaterialsAlerts.tsx

import { useContextAlerts } from '@/shared/alerts';
import { CollapsibleAlertStack } from '@/shared/ui';

export function MaterialsAlerts() {
  const { alerts, dismissAlert } = useContextAlerts('materials');

  if (alerts.length === 0) return null;

  return (
    <CollapsibleAlertStack
      alerts={alerts}
      onDismiss={dismissAlert}
      title="Alertas de Inventario"
      showCount
    />
  );
}
```

---

## 📋 PLAN DE IMPLEMENTACIÓN

### Fase 1: Preparar Base (2-3 horas)

#### 1.1 Crear estructura ML
```bash
mkdir -p src/lib/ml
```

#### 1.2 Extraer algoritmos puros de MLEngine
```typescript
// src/lib/ml/timeseries.ts
export function simpleMovingAverage(data: number[], window: number): number[] { ... }
export function exponentialSmoothing(data: number[], alpha: number): number[] { ... }
export function seasonalDecomposition(data: number[], season: number): { ... } { ... }
export function detectTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' { ... }
```

#### 1.3 Extraer lógica de forecasting
```typescript
// src/lib/ml/forecasting.ts
export function forecastDemand(historical: number[], config?: ForecastConfig): ForecastResult { ... }
export function calculateEOQ(demand: number, orderCost: number, holdingCost: number): number { ... }
export function optimizeReorderPoint(leadTime: number, demand: number, serviceLevel: number): number { ... }
```

---

### Fase 2: Refactorizar Materials (3-4 horas)

#### 2.1 Crear MaterialsIntelligenceEngine
```bash
# Renombrar/refactorizar smartAlertsEngine.ts
mv src/pages/admin/supply-chain/materials/services/smartAlertsEngine.ts \
   src/pages/admin/supply-chain/materials/services/MaterialsIntelligenceEngine.ts
```

#### 2.2 Actualizar MaterialsIntelligenceEngine
- Usar business logic común (`src/business-logic/ml/`)
- Seguir patrón de SalesIntelligenceEngine (static methods)
- Agregar forecasting y demand analysis

#### 2.3 Actualizar MaterialsAlertsAdapter
- Ya existe y está bien implementado
- Solo verificar mapeo de tipos

#### 2.4 Implementar useMaterialsAlerts hook
- Reemplazar stub actual
- Usar MaterialsAlertsAdapter
- Integrar con sistema unificado de alertas

---

### Fase 3: Eliminar Duplicados (30 min)

```bash
# Eliminar engines duplicados
rm src/pages/admin/supply-chain/materials/services/demandForecastingEngine.ts
rm src/pages/admin/supply-chain/materials/services/procurementRecommendationsEngine.ts

# Eliminar infraestructura ML rota
rm -rf src/lib/ml/core/
rm -rf src/lib/ml/inventory/
```

---

### Fase 4: Activar Código Útil (4-6 horas)

#### 4.1 SmartRecommendations → ProductsIntelligenceEngine
```typescript
// src/pages/admin/supply-chain/products/services/ProductsIntelligenceEngine.ts

import { collaborativeFiltering } from '@/lib/ml/recommendations';

export class ProductsIntelligenceEngine {
  static analyzeMenuPerformance(products: Product[]): ProductInsight[] { ... }
  static recommendCrossSelling(orderHistory: Order[]): Recommendation[] { ... }
  static optimizePricing(product: Product, market: MarketData): PriceRecommendation { ... }
}
```

#### 4.2 AnomalyDetection → SystemHealthEngine
```typescript
// src/pages/admin/debug/services/SystemHealthEngine.ts

import { detectOutliers, calculateZScore } from '@/lib/ml/anomalyDetection';

export class SystemHealthEngine {
  static analyzePerformance(metrics: HealthMetric[]): Anomaly[] { ... }
  static detectDataQualityIssues(data: any[]): DataQualityIssue[] { ... }
}
```

---

### Fase 5: Diferir a Phase 3

```bash
# Mover supplierAnalysisEngine a archivos de Phase 3
mkdir -p docs/architecture-v2/phase-3/
mv src/pages/admin/supply-chain/materials/services/supplierAnalysisEngine.ts \
   docs/architecture-v2/phase-3/supplier-analysis-reference.ts
```

---

## 📚 DOCUMENTACIÓN

### Crear Guía de Intelligence Engines

**Ubicación**: `docs/05-development/INTELLIGENCE_ENGINES_GUIDE.md`

**Contenido**:
1. Cuándo crear un Intelligence Engine
2. Patrón estándar (3 capas: Business Logic → Engine → Adapter)
3. Integración con sistema unificado de alertas
4. Testing strategy
5. Ejemplos completos (Sales, Scheduling, Materials)
6. Anti-patterns (qué NO hacer)

---

## ✅ RESPUESTA A TUS PREGUNTAS

### 1. "Las alertas Smart varían de módulo a módulo, ¿verdad?"

**Respuesta**: SÍ, pero con lógica común compartida.

**Ejemplo**:
- **Sales**: Alertas de revenue, conversión, efficiency
- **Scheduling**: Alertas de labor costs, coverage gaps, compliance
- **Materials**: Alertas de stock levels, demand, supplier performance

**Lógica común**:
- Time series forecasting (todas usan)
- Trend detection (todas usan)
- Anomaly detection (todas usan)
- Statistical calculations (todas usan)

**Solución**: Extraer lógica común a `src/business-logic/ml/`

---

### 2. "¿Hay alguna lógica que sea común?"

**Respuesta**: SÍ, MUCHA.

**Lógica común identificada**:
```typescript
// Time series analysis
- simpleMovingAverage()
- exponentialSmoothing()
- seasonalDecomposition()
- detectTrend()

// Forecasting
- forecastDemand()
- predictNextPeriod()
- calculateConfidenceInterval()

// Statistical
- calculateMean()
- calculateStandardDeviation()
- calculateZScore()
- detectOutliers()

// Optimization
- calculateEOQ()
- optimizeThreshold()
- linearRegression()
```

**Ubicación propuesta**: `src/business-logic/ml/` (pure functions)

---

### 3. "¿Inventory es el único módulo que necesita alertas smart?"

**Respuesta**: NO. Todos los módulos se benefician.

**Módulos que necesitan Intelligence Engines**:

| Módulo | Engine | Alertas Inteligentes |
|--------|--------|---------------------|
| Sales ✅ | SalesIntelligenceEngine | Revenue patterns, conversión, cross-module impact |
| Scheduling ✅ | SchedulingIntelligenceEngine | Labor costs, coverage gaps, efficiency, compliance |
| Materials ⚠️ | MaterialsIntelligenceEngine (refactor) | Stock levels, demand forecast, supplier performance |
| Products 🆕 | ProductsIntelligenceEngine (crear) | Menu performance, pricing optimization, cross-selling |
| Customers 🆕 | CustomersIntelligenceEngine (crear) | Churn risk, lifetime value, behavior patterns |
| Staff 🆕 | StaffIntelligenceEngine (crear) | Performance metrics, training needs, retention risk |
| Finance 🆕 | FinanceIntelligenceEngine (Phase 3) | Cash flow, credit risk, payment patterns |

---

### 4. "¿Hay una forma de conectar todo esto?"

**Respuesta**: SÍ. Sistema de 3 capas + EventBus.

**Conexión via Sistema Unificado**:
```typescript
// Todos los engines generan alertas en formato estándar
SalesIntelligenceEngine → SalesAlertsAdapter → Sistema Unificado
SchedulingIntelligenceEngine → SchedulingAlertsAdapter → Sistema Unificado
MaterialsIntelligenceEngine → MaterialsAlertsAdapter → Sistema Unificado

// Sistema unificado las agrega por context
useContextAlerts('sales')
useContextAlerts('scheduling')
useContextAlerts('materials')

// Dashboard muestra todas
<GlobalAlertsDisplay /> // Todas las alertas de todos los módulos
```

**Conexión via EventBus** (cross-module impact):
```typescript
// Sales detecta low revenue → emit event
EventBus.emit('sales.revenue.below_target', {
  amount: 2500,
  target: 5000
});

// Materials escucha y analiza correlación
EventBus.subscribe('sales.revenue.*', (event) => {
  const materialsImpact = MaterialsIntelligenceEngine.analyzeCrossModuleImpact(event);
  // Genera alerta si hay correlación con stock issues
});

// Scheduling escucha y analiza correlación
EventBus.subscribe('sales.revenue.*', (event) => {
  const staffingImpact = SchedulingIntelligenceEngine.analyzeCrossModuleImpact(event);
  // Genera alerta si understaffing causó low revenue
});
```

---

## 🎯 DECISIÓN FINAL RECOMENDADA

### Enfoque Pragmático: "Activar lo que existe, eliminar lo roto"

#### ELIMINAR (~1,000 líneas):
- ❌ `src/lib/ml/core/MLEngine.ts` (660 líneas - singleton roto)
- ❌ `src/lib/ml/inventory/PredictiveInventory.ts` (672 líneas - depende de MLEngine)
- ❌ `demandForecastingEngine.ts` (duplica MLEngine)
- ❌ `procurementRecommendationsEngine.ts` (duplica PredictiveInventory)

#### EXTRAER y REUTILIZAR (~800 líneas):
- ✅ Algoritmos de time series → `src/lib/ml/timeseries.ts`
- ✅ Algoritmos de forecasting → `src/lib/ml/forecasting.ts`
- ✅ Lógica de recommendations → `src/lib/ml/recommendations.ts`
- ✅ Lógica de anomaly detection → `src/lib/ml/anomalyDetection.ts`

#### REFACTORIZAR (~670 líneas):
- ⚠️ `smartAlertsEngine.ts` → `MaterialsIntelligenceEngine.ts`
- ⚠️ `useSmartInventoryAlerts.ts` → Implementar completamente

#### MANTENER (~2,600 líneas):
- ✅ `SalesIntelligenceEngine.ts` (695 líneas)
- ✅ `SchedulingIntelligenceEngine.ts` (927 líneas)
- ✅ `smartAlertsAdapter.ts` (390 líneas)
- ✅ Sistema unificado de alertas (`@/shared/alerts/`)

#### DIFERIR a Phase 3 (~311 líneas):
- ⏸️ `supplierAnalysisEngine.ts`

---

## 📊 RESULTADO FINAL

**Total eliminado**: ~1,000 líneas de código roto
**Total reutilizado**: ~800 líneas de lógica útil
**Total refactorizado**: ~670 líneas
**Total mantenido**: ~2,600 líneas funcionando

**Esfuerzo**: 12-15 horas total
**Beneficio**: Arquitectura limpia, código reutilizable, sistema unificado funcionando

---

## 🚀 PRÓXIMOS PASOS

1. ✅ **Validar este análisis contigo**
2. ⚠️ **Decidir si proceder con el plan**
3. 🔄 **Implementar Fase por Fase**
4. 📝 **Documentar patrón estándar**
5. 🎯 **Replicar en otros módulos**

---

---

## ✅ ACLARACIONES FINALES (Correcciones del usuario)

### 1. Smart Alerts YA USAN el Sistema Unificado

**Estado actual**:
```typescript
// ✅ SmartAlertsEngine existe y funciona
SmartAlertsEngine.generateSmartAlerts(materials) → SmartAlert[]

// ✅ SmartAlertsAdapter existe y convierte al formato unificado
SmartAlertsAdapter.generateMaterialsAlerts(materials) → CreateAlertInput[]

// ❌ Hook useSmartInventoryAlerts es solo STUB
useSmartInventoryAlerts() → { generateAndUpdateAlerts: () => {} } // NO HACE NADA
```

**Lo que falta**:
Solo completar la implementación del hook `useSmartInventoryAlerts.ts`:

```typescript
// src/hooks/useSmartInventoryAlerts.ts
import { useCallback, useEffect } from 'react';
import { useAlerts } from '@/shared/alerts';
import { useMaterialsStore } from '@/stores/useMaterialsStore';
import { SmartAlertsAdapter } from '@/pages/admin/supply-chain/materials/services/smartAlertsAdapter';

export function useSmartInventoryAlerts() {
  const { addAlert, clearContext } = useAlerts();
  const materials = useMaterialsStore(state => state.items);

  const generateAndUpdateAlerts = useCallback(async () => {
    // 1. Clear previous materials alerts
    clearContext('materials');

    // 2. Generate alerts via adapter (ya convierte al formato unificado)
    const alerts = await SmartAlertsAdapter.generateMaterialsAlerts(materials);

    // 3. Add to unified system
    alerts.forEach(alert => addAlert(alert));
  }, [materials, addAlert, clearContext]);

  // Auto-generate on materials change
  useEffect(() => {
    generateAndUpdateAlerts();
  }, [materials, generateAndUpdateAlerts]);

  return { generateAndUpdateAlerts };
}
```

**Conclusión**: El sistema YA está conectado via adapters. Solo falta 1 archivo (hook).

---

### 2. Lógica Común va en `src/lib/ml/` (NO en `src/business-logic/ml/`)

**Razón**:
- `src/business-logic/` es para lógica de negocio específica del dominio (cálculos financieros, stock, etc.)
- `src/lib/ml/` es para algoritmos ML puros y reutilizables (time series, forecasting, etc.)

**Estructura correcta**:
```
src/
├── lib/
│   └── ml/                           # ← Algoritmos ML puros (correcto)
│       ├── timeseries.ts
│       ├── forecasting.ts
│       ├── recommendations.ts
│       └── anomalyDetection.ts
│
├── business-logic/
│   └── shared/                       # ← Lógica de negocio común
│       ├── decimalUtils.ts           # Cálculos financieros
│       ├── FinancialCalculations.ts  # Lógica financiera
│       └── ...
│
└── pages/admin/[domain]/[module]/
    └── services/
        └── [Module]IntelligenceEngine.ts  # Usa src/lib/ml/
```

**Ejemplo de uso correcto**:
```typescript
// src/pages/admin/supply-chain/materials/services/MaterialsIntelligenceEngine.ts
import { forecastDemand } from '@/lib/ml/forecasting';              // ✅ Algoritmo ML
import { DecimalUtils } from '@/business-logic/shared/decimalUtils'; // ✅ Lógica negocio

export class MaterialsIntelligenceEngine {
  static analyzeDemand(materials: Material[]): Alert[] {
    // Usa ML para forecast
    const forecast = forecastDemand(historicalData);

    // Usa business logic para cálculos financieros
    const cost = DecimalUtils.multiply(quantity, unitCost);

    return alerts;
  }
}
```

---

## 🎯 PLAN ACTUALIZADO

### Cambios vs Plan Original:

1. **No refactorizar SmartAlertsEngine** → Ya está bien, solo renombrar si prefieres consistencia
2. **Solo implementar hook useSmartInventoryAlerts** → 30 minutos (no 3-4 horas)
3. **Lógica común a `src/lib/ml/`** → No `src/business-logic/ml/`

### Esfuerzo Real:

| Fase | Tarea | Tiempo Original | Tiempo Real |
|------|-------|----------------|-------------|
| Fase 1 | Extraer algoritmos ML a `src/lib/ml/` | 2-3 hrs | 2-3 hrs ✅ |
| Fase 2 | Implementar `useSmartInventoryAlerts` | 3-4 hrs | 30 min ✅ |
| Fase 3 | Eliminar duplicados | 30 min | 30 min ✅ |
| Fase 4 | Activar código útil | 4-6 hrs | 4-6 hrs ✅ |
| Fase 5 | Diferir a Phase 3 | 0 | 0 |
| **TOTAL** | | **10-14 hrs** | **7-10 hrs** |

**Ahorro**: ~3-4 horas (porque SmartAlerts ya funciona via adapter)

---

---

## 🔄 LÓGICA COMÚN REUTILIZABLE EN INTELLIGENCE ENGINES

### Análisis de Patrones Duplicados

Después de analizar los 3 Intelligence Engines existentes (Sales, Scheduling, Materials), se identificaron **múltiples funciones helper duplicadas** que pueden extraerse a utilidades comunes.

### 1. ⚡ Funciones de Priorización (100% duplicadas)

**Duplicación detectada** en:
- `smartAlertsEngine.ts:514` → `prioritizeAndFilterAlerts()`
- `SalesIntelligenceEngine.ts:587` → `prioritizeAndFilterAlerts()`
- `SchedulingIntelligenceEngine.ts:909` → `prioritizeAlerts()`

**Código duplicado**:
```typescript
// ❌ DUPLICADO EN 3 ARCHIVOS (idéntico 95%)
private static prioritizeAndFilterAlerts(alerts, config) {
  // 1. Ordenar por prioridad y severidad
  const prioritized = alerts.sort((a, b) => {
    if (a.actionPriority !== b.actionPriority) {
      return b.actionPriority - a.actionPriority;
    }

    const severityOrder = { urgent: 4, critical: 3, warning: 2, info: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  // 2. Limitar alertas por tipo/item
  const byType = new Map();
  prioritized.forEach(alert => {
    // ... lógica de agrupación y filtrado
  });

  return Array.from(byType.values()).flat();
}
```

**Solución propuesta**: Extraer a `src/lib/alerts/alertPrioritization.ts`

---

### 2. 📝 Funciones de Enriquecimiento de Descripciones (90% duplicadas)

**Duplicación detectada** en:
- `smartAlertsAdapter.ts:116` → `enrichDescription()`
- `SchedulingAlertsAdapter.ts:128` → `enrichDescription()`

**Código duplicado**:
```typescript
// ❌ DUPLICADO EN 2 ARCHIVOS (similar 90%)
private static enrichDescription(alert) {
  let description = alert.description;

  // Agregar información contextual
  description += `\n\n📊 **Clase/Categoría**: ${alert.category}`;

  // Agregar desviación
  if (alert.deviation > 0) {
    description += `\n📈 **Desviación**: ${alert.deviation}%`;
  }

  // Agregar prioridad
  description += `\n⏰ **Prioridad**: ${this.getPriorityText(alert.actionPriority)}`;

  // Agregar recomendación
  if (alert.recommendedAction) {
    description += `\n\n💡 **Recomendación**: ${alert.recommendedAction}`;
  }

  return description;
}
```

**Solución propuesta**: Extraer a `src/lib/alerts/alertFormatting.ts`

---

### 3. 🔢 Mapeo de Severidades (100% duplicado)

**Duplicación detectada** en:
- `smartAlertsAdapter.ts:23` → `SEVERITY_MAP`
- `SalesAlertsAdapter.ts:160` → `mapSeverityToUnifiedType()`
- `SchedulingAlertsAdapter.ts` → Similar mapping

**Código duplicado**:
```typescript
// ❌ DUPLICADO EN 3 ARCHIVOS (idéntico)
const SEVERITY_MAP: Record<string, SystemAlertSeverity> = {
  'urgent': 'critical',
  'critical': 'high',
  'warning': 'medium',
  'info': 'low'
};
```

**Solución propuesta**: Extraer a `src/shared/alerts/severityMapping.ts`

---

### 4. 🎯 Estimación de Impacto (70% similar)

**Duplicación detectada** en:
- `smartAlertsAdapter.ts:210` → `estimateRevenueImpact()`
- `SalesIntelligenceEngine` → Similar calculations
- `SchedulingIntelligenceEngine` → Cost impact calculations

**Patrón común**:
```typescript
// ⚠️ PATRÓN SIMILAR EN 3 ARCHIVOS
private static estimateImpact(alert) {
  let impact = 0;

  switch (alert.severity) {
    case 'urgent':
    case 'critical':
      impact = alert.currentValue * 0.5; // 50% del valor
      break;
    case 'warning':
      impact = alert.currentValue * 0.2;
      break;
    default:
      impact = alert.currentValue * 0.05;
  }

  return impact;
}
```

**Solución propuesta**: Crear función genérica con configuración por módulo

---

### 5. ⏱️ Cálculo de Tiempo de Expiración (80% duplicado)

**Duplicación detectada** en:
- `smartAlertsAdapter.ts:248` → `getAutoExpireTime()`
- Similar logic en Sales y Scheduling

**Código duplicado**:
```typescript
// ❌ DUPLICADO (80% similar)
private static getAutoExpireTime(alert) {
  switch (alert.severity) {
    case 'urgent':
      return 2 * 60 * 60 * 1000; // 2 hours
    case 'critical':
      return 4 * 60 * 60 * 1000; // 4 hours
    case 'warning':
      return 24 * 60 * 60 * 1000; // 24 hours
    default:
      return 7 * 24 * 60 * 60 * 1000; // 7 days
  }
}
```

**Solución propuesta**: Extraer a configuración compartida

---

## 🏗️ ARQUITECTURA PROPUESTA: SHARED ALERT UTILITIES

### Estructura Recomendada

```
src/
├── shared/
│   └── alerts/
│       ├── types.ts                      # ✅ Ya existe
│       ├── AlertsProvider.tsx            # ✅ Ya existe
│       ├── hooks/useAlerts.ts            # ✅ Ya existe
│       │
│       └── utils/                        # 🆕 NUEVO
│           ├── index.ts
│           ├── severityMapping.ts        # Mapeos de severidad
│           ├── alertPrioritization.ts    # Priorización común
│           ├── alertFormatting.ts        # Enriquecimiento de descripciones
│           ├── impactEstimation.ts       # Estimación de impacto
│           └── alertLifecycle.ts         # TTL, expiración
```

---

### Implementación Propuesta

#### 1. `src/shared/alerts/utils/severityMapping.ts`

```typescript
/**
 * SEVERITY MAPPING UTILITIES
 * Mapeos estándar entre sistemas de severidad de diferentes módulos
 */

import type { AlertSeverity } from '../types';

// Mapeo de severidades de módulos → Sistema unificado
export const SEVERITY_TO_UNIFIED: Record<string, AlertSeverity> = {
  'urgent': 'critical',
  'critical': 'high',
  'warning': 'medium',
  'info': 'low'
};

// Orden numérico de severidades (para sorting)
export const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  'critical': 4,
  'high': 3,
  'medium': 2,
  'low': 1,
  'info': 0
};

/**
 * Mapea severidad de módulo a severidad del sistema unificado
 */
export function mapSeverity(moduleSeverity: string): AlertSeverity {
  return SEVERITY_TO_UNIFIED[moduleSeverity] || 'medium';
}

/**
 * Compara dos severidades (para sorting)
 * @returns Número negativo si a < b, positivo si a > b, 0 si iguales
 */
export function compareSeverity(a: AlertSeverity, b: AlertSeverity): number {
  return SEVERITY_ORDER[b] - SEVERITY_ORDER[a];
}
```

---

#### 2. `src/shared/alerts/utils/alertPrioritization.ts`

```typescript
/**
 * ALERT PRIORITIZATION UTILITIES
 * Funciones comunes para priorizar y filtrar alertas
 */

import { compareSeverity } from './severityMapping';
import type { Alert } from '../types';

export interface PrioritizationConfig {
  maxAlertsPerGroup?: number;
  groupBy?: 'type' | 'context' | 'severity';
}

/**
 * Prioriza y filtra alertas basándose en prioridad y severidad
 * Función genérica reutilizable por todos los Intelligence Engines
 */
export function prioritizeAlerts<T extends {
  severity: string;
  actionPriority?: number;
  type?: string;
  context?: string;
}>(
  alerts: T[],
  config: PrioritizationConfig = {}
): T[] {
  const {
    maxAlertsPerGroup = 3,
    groupBy = 'type'
  } = config;

  // 1. Ordenar por prioridad de acción y severidad
  const prioritized = [...alerts].sort((a, b) => {
    // Primero por actionPriority (si existe)
    if (a.actionPriority !== undefined && b.actionPriority !== undefined) {
      if (a.actionPriority !== b.actionPriority) {
        return b.actionPriority - a.actionPriority;
      }
    }

    // Luego por severidad
    return compareSeverity(a.severity as any, b.severity as any);
  });

  // 2. Agrupar y limitar por grupo
  const grouped = new Map<string, T[]>();

  prioritized.forEach(alert => {
    const groupKey = groupBy === 'type'
      ? alert.type || 'default'
      : groupBy === 'context'
      ? alert.context || 'default'
      : alert.severity;

    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, []);
    }

    const groupAlerts = grouped.get(groupKey)!;
    if (groupAlerts.length < maxAlertsPerGroup) {
      groupAlerts.push(alert);
    }
  });

  // 3. Convertir de vuelta a array plano
  return Array.from(grouped.values()).flat();
}
```

---

#### 3. `src/shared/alerts/utils/alertFormatting.ts`

```typescript
/**
 * ALERT FORMATTING UTILITIES
 * Funciones para enriquecer descripciones de alertas
 */

export interface EnrichmentOptions {
  showCategory?: boolean;
  showDeviation?: boolean;
  showPriority?: boolean;
  showRecommendation?: boolean;
  emojis?: boolean;
}

/**
 * Enriquece la descripción de una alerta con información adicional
 */
export function enrichDescription<T extends {
  description: string;
  category?: string;
  deviation?: number;
  currentValue?: number;
  thresholdValue?: number;
  actionPriority?: number;
  recommendedAction?: string;
}>(
  alert: T,
  options: EnrichmentOptions = {}
): string {
  const {
    showCategory = true,
    showDeviation = true,
    showPriority = true,
    showRecommendation = true,
    emojis = true
  } = options;

  let enriched = alert.description;

  // Agregar categoría
  if (showCategory && alert.category) {
    const emoji = emojis ? '📊 ' : '';
    enriched += `\n\n${emoji}**Categoría**: ${alert.category}`;
  }

  // Agregar desviación
  if (showDeviation && alert.deviation !== undefined && alert.deviation > 0) {
    const emoji = emojis ? '📈 ' : '';
    const direction = alert.currentValue && alert.thresholdValue && alert.currentValue > alert.thresholdValue
      ? 'por encima'
      : 'por debajo';
    enriched += `\n${emoji}**Desviación**: ${alert.deviation.toFixed(1)}% ${direction} del umbral`;
  }

  // Agregar prioridad
  if (showPriority && alert.actionPriority !== undefined) {
    const emoji = emojis ? '⏰ ' : '';
    const priorityText = getPriorityText(alert.actionPriority);
    enriched += `\n${emoji}**Prioridad**: ${priorityText}`;
  }

  // Agregar recomendación
  if (showRecommendation && alert.recommendedAction) {
    const emoji = emojis ? '\n\n💡 ' : '\n\n';
    enriched += `${emoji}**Recomendación**: ${alert.recommendedAction}`;
  }

  return enriched;
}

function getPriorityText(priority: number): string {
  if (priority >= 5) return 'Muy Alta';
  if (priority >= 4) return 'Alta';
  if (priority >= 3) return 'Media';
  if (priority >= 2) return 'Baja';
  return 'Muy Baja';
}
```

---

#### 4. `src/shared/alerts/utils/alertLifecycle.ts`

```typescript
/**
 * ALERT LIFECYCLE UTILITIES
 * TTL, expiración, y configuración de ciclo de vida de alertas
 */

import type { AlertSeverity } from '../types';

export interface LifecycleConfig {
  ttlBySeverity?: Partial<Record<AlertSeverity, number>>;
  persistent?: boolean;
}

const DEFAULT_TTL: Record<AlertSeverity, number> = {
  'critical': 2 * 60 * 60 * 1000,      // 2 hours
  'high': 4 * 60 * 60 * 1000,          // 4 hours
  'medium': 24 * 60 * 60 * 1000,       // 24 hours
  'low': 3 * 24 * 60 * 60 * 1000,      // 3 days
  'info': 7 * 24 * 60 * 60 * 1000      // 7 days
};

/**
 * Calcula el tiempo de expiración para una alerta
 */
export function calculateExpiration(
  severity: AlertSeverity,
  config: LifecycleConfig = {}
): number | undefined {
  // Si es persistente, no expira
  if (config.persistent) {
    return undefined;
  }

  // Usar configuración personalizada o default
  const ttl = config.ttlBySeverity?.[severity] || DEFAULT_TTL[severity];

  return Date.now() + ttl;
}

/**
 * Determina si una alerta debe ser persistente
 */
export function shouldBePersistent(severity: AlertSeverity): boolean {
  return severity === 'critical' || severity === 'high';
}
```

---

### Uso en Intelligence Engines

**Antes** (código duplicado):
```typescript
// smartAlertsEngine.ts
private static prioritizeAndFilterAlerts(alerts, config) {
  const prioritized = alerts.sort((a, b) => {
    // ... 20 líneas de código duplicado
  });
  // ... más código duplicado
}
```

**Después** (usando utilidades compartidas):
```typescript
// smartAlertsEngine.ts
import { prioritizeAlerts } from '@/shared/alerts/utils';

static generateSmartAlerts(materials, config) {
  const alerts: SmartAlert[] = [];

  // ... generar alertas

  // Usar utilidad compartida
  return prioritizeAlerts(alerts, {
    maxAlertsPerGroup: config.maxAlertsPerItem,
    groupBy: 'type'
  });
}
```

---

## 📊 BENEFICIOS DE EXTRAER LÓGICA COMÚN

### Reducción de Código

| Archivo | Líneas Antes | Líneas Después | Ahorro |
|---------|--------------|----------------|--------|
| smartAlertsEngine.ts | 670 | ~500 | -170 |
| SalesIntelligenceEngine.ts | 695 | ~550 | -145 |
| SchedulingIntelligenceEngine.ts | 927 | ~750 | -177 |
| **TOTAL** | **2,292** | **~1,800** | **-492** |

**+ Nuevas utilidades compartidas**: +300 líneas

**Net reduction**: ~200 líneas + **eliminación de duplicación**

### Consistencia

✅ Mismo comportamiento de priorización en todos los módulos
✅ Mismo formato de descripciones
✅ Mismos TTL por severidad
✅ Fácil actualizar comportamiento global

### Mantenibilidad

✅ Un solo lugar para actualizar lógica
✅ Testing centralizado
✅ Menos bugs por inconsistencias

---

## ✅ RECOMENDACIÓN

**Crear `src/shared/alerts/utils/` con las 5 funciones identificadas**

Esto debe hacerse **antes de crear nuevos Intelligence Engines** (Products, Customers, etc.) para evitar seguir duplicando código.

**Esfuerzo estimado**: 2-3 horas
**Beneficio**: Código limpio, consistente y mantenible

---

---

## 🔄 LÓGICA COMÚN REUTILIZABLE EN INTELLIGENCE ENGINES

### Hallazgo: Código Duplicado Entre Engines

Después de analizar `SmartAlertsEngine`, `SalesIntelligenceEngine`, y `SchedulingIntelligenceEngine`, se identificaron **patrones comunes que se repiten** en todos los engines:

---

### 1. Priorización y Filtrado de Alertas

**Código duplicado en 3 engines**:

```typescript
// ❌ DUPLICADO en smartAlertsEngine.ts (líneas 545-573)
private static prioritizeAndFilterAlerts(
  alerts: SmartAlert[],
  config: SmartAlertsConfig
): SmartAlert[] {
  // Ordenar por prioridad y severidad
  const prioritized = alerts.sort((a, b) => {
    if (a.actionPriority !== b.actionPriority) {
      return b.actionPriority - a.actionPriority;
    }

    const severityOrder = { urgent: 4, critical: 3, warning: 2, info: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  // Limitar alertas por item
  const byItem = new Map<string, SmartAlert[]>();
  prioritized.forEach(alert => {
    if (!byItem.has(alert.itemId)) {
      byItem.set(alert.itemId, []);
    }
    const itemAlerts = byItem.get(alert.itemId)!;
    if (itemAlerts.length < config.maxAlertsPerItem) {
      itemAlerts.push(alert);
    }
  });

  return Array.from(byItem.values()).flat();
}

// ❌ DUPLICADO en SalesIntelligenceEngine.ts (líneas 587-614)
// Mismo código, solo cambia el tipo de alerta

// ❌ DUPLICADO en SchedulingIntelligenceEngine.ts (líneas 909-940)
// Mismo código, solo cambia el tipo de alerta
```

**Solución**: Extraer a `src/lib/alerts/prioritization.ts`

---

### 2. Cálculo de Desviación/Porcentaje

**Código duplicado en 3+ engines**:

```typescript
// ❌ DUPLICADO - Cálculo de desviación porcentual
const deviation = ((targetValue - currentValue) / targetValue) * 100;

// Aparece en:
// - smartAlertsEngine.ts (múltiples lugares)
// - SalesIntelligenceEngine.ts (líneas 250, 320, 380)
// - SchedulingIntelligenceEngine.ts (líneas 450, 580)
```

**Solución**: Extraer a `src/lib/alerts/calculations.ts`

```typescript
export function calculateDeviation(current: number, target: number): number {
  if (target === 0) return 0;
  return ((target - current) / target) * 100;
}

export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}
```

---

### 3. Mapeo de Severidad a Orden Numérico

**Código duplicado en 3 engines**:

```typescript
// ❌ DUPLICADO - Mapeo de severidad
const severityOrder = {
  urgent: 4,
  critical: 3,
  warning: 2,
  info: 1
};
```

**Solución**: Extraer a `src/lib/alerts/constants.ts`

```typescript
export const SEVERITY_ORDER = {
  urgent: 4,
  critical: 3,
  warning: 2,
  info: 1
} as const;

export const SEVERITY_LEVELS = ['info', 'warning', 'critical', 'urgent'] as const;

export function compareSeverity(a: AlertSeverity, b: AlertSeverity): number {
  return SEVERITY_ORDER[b] - SEVERITY_ORDER[a];
}
```

---

### 4. Estimación de Impacto de Revenue

**Código similar en adapters**:

```typescript
// ❌ SIMILAR en smartAlertsAdapter.ts (líneas 210-230)
private static estimateRevenueImpact(smartAlert: SmartAlert): number {
  switch (smartAlert.abcClass) {
    case 'A': return 10000;
    case 'B': return 5000;
    case 'C': return 1000;
    default: return 0;
  }
}

// ❌ SIMILAR en SalesAlertsAdapter.ts
// Mismo concepto, diferentes valores
```

**Solución**: Extraer a `src/lib/alerts/impact.ts`

```typescript
export interface ImpactEstimationConfig {
  highImpact: number;
  mediumImpact: number;
  lowImpact: number;
}

export function estimateImpactByPriority(
  priority: 'high' | 'medium' | 'low',
  config: ImpactEstimationConfig
): number {
  switch (priority) {
    case 'high': return config.highImpact;
    case 'medium': return config.mediumImpact;
    case 'low': return config.lowImpact;
  }
}
```

---

### 5. Tiempo de Auto-Expiración

**Código duplicado en adapters**:

```typescript
// ❌ DUPLICADO en smartAlertsAdapter.ts (líneas 248-256)
private static getAutoExpireTime(smartAlert: SmartAlert): number {
  switch (smartAlert.severity) {
    case 'urgent': return 60;        // 1 hora
    case 'critical': return 240;     // 4 horas
    case 'warning': return 1440;     // 24 horas
    case 'info': return 2880;        // 48 horas
    default: return 1440;
  }
}

// ❌ DUPLICADO en SalesAlertsAdapter.ts
// Mismos valores
```

**Solución**: Extraer a `src/lib/alerts/expiration.ts`

```typescript
export const ALERT_EXPIRATION_TIMES = {
  urgent: 60,        // 1 hora
  critical: 240,     // 4 horas
  warning: 1440,     // 24 horas
  info: 2880         // 48 horas
} as const;

export function getAutoExpireTime(severity: AlertSeverity): number {
  return ALERT_EXPIRATION_TIMES[severity] || ALERT_EXPIRATION_TIMES.warning;
}
```

---

### 6. Generación de IDs Únicos para Alertas

**Código similar en 3 engines**:

```typescript
// ❌ PATRÓN COMÚN - Generación de IDs
const alertId = `${type}-${itemId}-${timestamp}`;

// Variaciones:
// - Materials: `low-stock-${materialId}-${Date.now()}`
// - Sales: `revenue-below-${Date.now()}`
// - Scheduling: `coverage-gap-${shiftId}-${Date.now()}`
```

**Solución**: Extraer a `src/lib/alerts/identifiers.ts`

```typescript
export function generateAlertId(
  type: string,
  entityId?: string,
  timestamp?: number
): string {
  const ts = timestamp || Date.now();
  return entityId
    ? `${type}-${entityId}-${ts}`
    : `${type}-${ts}`;
}

export function parseAlertId(alertId: string): {
  type: string;
  entityId?: string;
  timestamp: number;
} | null {
  const parts = alertId.split('-');
  if (parts.length < 2) return null;

  const timestamp = parseInt(parts[parts.length - 1]);
  const type = parts[0];
  const entityId = parts.length === 3 ? parts[1] : undefined;

  return { type, entityId, timestamp };
}
```

---

### 7. Enriquecimiento de Descripciones

**Código similar en adapters**:

```typescript
// ❌ SIMILAR en smartAlertsAdapter.ts (líneas 116-136)
private static enrichDescription(smartAlert: SmartAlert): string {
  let description = smartAlert.description;

  // Agregar información de clase ABC
  description += `\n\n📊 **Clase ABC**: ${smartAlert.abcClass}`;

  // Agregar desviación del threshold
  if (smartAlert.deviation > 0) {
    description += `\n📈 **Desviación**: ${smartAlert.deviation}%`;
  }

  // Agregar prioridad de acción
  description += `\n⏰ **Prioridad**: ${smartAlert.actionPriority}`;

  return description;
}
```

**Solución**: Extraer a `src/lib/alerts/formatting.ts`

```typescript
export function enrichAlertDescription(
  baseDescription: string,
  metadata: {
    category?: string;
    deviation?: number;
    priority?: number;
    recommendation?: string;
  }
): string {
  let enriched = baseDescription;

  if (metadata.category) {
    enriched += `\n\n📊 **Categoría**: ${metadata.category}`;
  }

  if (metadata.deviation !== undefined) {
    enriched += `\n📈 **Desviación**: ${metadata.deviation.toFixed(1)}%`;
  }

  if (metadata.priority !== undefined) {
    enriched += `\n⏰ **Prioridad**: ${metadata.priority}/5`;
  }

  if (metadata.recommendation) {
    enriched += `\n\n💡 **Recomendación**: ${metadata.recommendation}`;
  }

  return enriched;
}
```

---

## 🎯 PROPUESTA: Shared Alert Utilities

### Estructura Propuesta

```
src/lib/alerts/                    # 🆕 NUEVA carpeta
├── prioritization.ts             # Priorización y filtrado de alertas
├── calculations.ts               # Cálculos comunes (desviación, %)
├── constants.ts                  # Constantes compartidas
├── impact.ts                     # Estimación de impacto
├── expiration.ts                 # Tiempos de expiración
├── identifiers.ts                # Generación de IDs
├── formatting.ts                 # Formateo de descripciones
└── index.ts                      # Exports centralizados
```

### Uso en Intelligence Engines

**Antes**:
```typescript
// ❌ Código duplicado en cada engine
private static prioritizeAndFilterAlerts(alerts, config) {
  const severityOrder = { urgent: 4, critical: 3, warning: 2, info: 1 };
  const prioritized = alerts.sort((a, b) => {
    // ... 20 líneas de lógica
  });
  return prioritized;
}
```

**Después**:
```typescript
// ✅ Reutilizar utilidad compartida
import { prioritizeAlerts, compareSeverity } from '@/lib/alerts';

private static prioritizeAndFilterAlerts(alerts, config) {
  return prioritizeAlerts(alerts, {
    maxPerItem: config.maxAlertsPerItem,
    compareFn: compareSeverity
  });
}
```

---

## 📊 Beneficios de Extraer Lógica Común

### 1. Reducción de Código Duplicado
- **Antes**: ~200 líneas duplicadas en 3 engines
- **Después**: ~60 líneas en utilities compartidas
- **Net reduction**: -140 líneas

### 2. Consistencia
- ✅ Misma lógica de priorización en todos los módulos
- ✅ Mismos tiempos de expiración
- ✅ Mismo formato de IDs

### 3. Mantenibilidad
- ✅ Cambio en un solo lugar
- ✅ Testing centralizado
- ✅ Documentación única

### 4. Testabilidad
- ✅ Pure functions fáciles de testear
- ✅ Sin dependencias de módulos específicos
- ✅ Casos de test reutilizables

---

## 🚀 Plan de Implementación (Opcional - Post Fase 5)

### Fase 6 (Opcional): Shared Alert Utilities (2-3 hrs)

#### 6.1: Crear estructura (30 min)
```bash
mkdir -p src/lib/alerts
```

#### 6.2: Extraer utilidades (1.5 hrs)
- `prioritization.ts` - 80 líneas
- `calculations.ts` - 40 líneas
- `constants.ts` - 30 líneas
- `impact.ts` - 50 líneas
- `expiration.ts` - 30 líneas
- `identifiers.ts` - 60 líneas
- `formatting.ts` - 80 líneas
- `index.ts` - 20 líneas

**Total**: ~390 líneas de utilities compartidas

#### 6.3: Refactorizar engines (1 hr)
- Actualizar SmartAlertsEngine
- Actualizar SalesIntelligenceEngine
- Actualizar SchedulingIntelligenceEngine
- Actualizar adapters

#### 6.4: Testing (30 min)
- Verificar que todo funciona igual
- TypeScript check
- Tests unitarios de utilities

---

## 📈 Comparativa: Antes vs Después

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Código duplicado** | ~200 líneas | 0 | -100% |
| **Líneas totales** | ~5,000 | ~4,860 | -140 líneas |
| **Engines testeables** | Difícil | Fácil | ✅ |
| **Consistencia** | Variable | 100% | ✅ |
| **Mantenibilidad** | Baja | Alta | ✅ |

---

**¿Estás de acuerdo con este análisis? ¿Quieres implementar las Shared Alert Utilities (Fase 6)?**
