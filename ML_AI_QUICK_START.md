# ML/AI SISTEMA UNIFICADO - QUICK START

**Fecha**: 2025-01-30
**Estado**: ✅ **ARQUITECTURA VALIDADA**

---

## 🎯 RESUMEN EJECUTIVO

### ¿Qué descubrimos?

1. ✅ **Ya tienes un sistema unificado de alertas** (`@/shared/alerts/`)
2. ✅ **SmartAlerts YA lo usa** via `SmartAlertsAdapter`
3. ⚠️ **Solo falta 1 hook** de 30 minutos de trabajo
4. ✅ **Sales y Scheduling ya funcionan correctamente**

### Estado Actual (Antes de implementar)

```
✅ Sistema Unificado (@/shared/alerts/) - EXISTE
   ↑
   ├─ ✅ SalesAlertsAdapter → useSalesAlerts() → FUNCIONA
   ├─ ✅ SchedulingAlertsAdapter → useSchedulingAlerts() → FUNCIONA
   └─ ⚠️ SmartAlertsAdapter → useSmartInventoryAlerts() → STUB (no implementado)
```

---

## 📊 MAPA DE CONEXIONES

### Cómo funciona actualmente (Sales como ejemplo)

```typescript
// 1. Engine genera alertas específicas del dominio
SalesIntelligenceEngine.generateSalesAlerts(data)
  → SalesAlert[] // Formato específico de Sales

// 2. Adapter convierte al formato unificado
SalesAlertsAdapter.convertToUnifiedAlerts(salesAlerts)
  → CreateAlertInput[] // Formato del sistema unificado

// 3. Hook integra con React + sistema unificado
useSalesAlerts() {
  const alerts = SalesIntelligenceEngine.generateSalesAlerts(data);
  const unified = SalesAlertsAdapter.convertToUnifiedAlerts(alerts);
  unified.forEach(alert => addAlert(alert)); // addAlert del sistema unificado
}

// 4. Componente muestra las alertas
<SalesAlerts /> → useContextAlerts('sales') → Muestra alertas del sistema unificado
```

### Cómo debería funcionar Materials (actualmente roto)

```typescript
// 1. Engine genera alertas (✅ YA FUNCIONA)
SmartAlertsEngine.generateSmartAlerts(materials)
  → SmartAlert[] // ✅ Funciona

// 2. Adapter convierte (✅ YA FUNCIONA)
SmartAlertsAdapter.generateMaterialsAlerts(materials)
  → CreateAlertInput[] // ✅ Funciona

// 3. Hook integra (❌ STUB - NO IMPLEMENTADO)
useSmartInventoryAlerts() {
  // TODO: Implementar (30 min)
}

// 4. Componente muestra (✅ LISTO PARA USAR)
<MaterialsAlerts /> → Espera alerts del sistema unificado
```

---

## 🚀 PLAN DE ACCIÓN (7-10 horas)

### Prioridad 1: Completar Materials (30 min) ⚡

**Archivo**: `src/hooks/useSmartInventoryAlerts.ts`

```typescript
import { useCallback, useEffect } from 'react';
import { useAlerts } from '@/shared/alerts';
import { useMaterialsStore } from '@/stores/useMaterialsStore';
import { SmartAlertsAdapter } from '@/pages/admin/supply-chain/materials/services/smartAlertsAdapter';
import { logger } from '@/lib/logging';

export function useSmartInventoryAlerts() {
  const { addAlert, clearContext } = useAlerts();
  const materials = useMaterialsStore(state => state.items);

  const generateAndUpdateAlerts = useCallback(async () => {
    try {
      // 1. Clear previous materials alerts
      clearContext('materials');

      // 2. Generate alerts via adapter
      const alerts = await SmartAlertsAdapter.generateMaterialsAlerts(materials);

      // 3. Add to unified system
      alerts.forEach(alert => addAlert(alert));

      logger.info('Materials', `Generated ${alerts.length} smart alerts`);
    } catch (error) {
      logger.error('Materials', 'Error generating smart alerts:', error);
    }
  }, [materials, addAlert, clearContext]);

  // Auto-generate on materials change
  useEffect(() => {
    if (materials.length > 0) {
      generateAndUpdateAlerts();
    }
  }, [materials, generateAndUpdateAlerts]);

  return { generateAndUpdateAlerts };
}

export default useSmartInventoryAlerts;
```

**Resultado**: Materials ahora usa el sistema unificado ✅

---

### Prioridad 2: Extraer Algoritmos ML (2-3 hrs)

**Objetivo**: Código reutilizable en `src/lib/ml/`

#### Crear archivos base

```bash
mkdir -p src/lib/ml
```

#### 2.1: `src/lib/ml/timeseries.ts`

```typescript
/**
 * Time Series Analysis - Pure Algorithms
 * Algoritmos puros para análisis de series temporales
 */

export interface TimeSeriesData {
  timestamp: number;
  value: number;
}

/**
 * Simple Moving Average
 */
export function simpleMovingAverage(data: number[], window: number = 7): number[] {
  const result: number[] = [];

  for (let i = window - 1; i < data.length; i++) {
    const sum = data.slice(i - window + 1, i + 1).reduce((acc, val) => acc + val, 0);
    result.push(sum / window);
  }

  return result;
}

/**
 * Exponential Smoothing
 */
export function exponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
  const result: number[] = [data[0]];

  for (let i = 1; i < data.length; i++) {
    const smoothed = alpha * data[i] + (1 - alpha) * result[i - 1];
    result.push(smoothed);
  }

  return result;
}

/**
 * Detect Trend
 */
export function detectTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (data.length < 2) return 'stable';

  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const diff = avgSecond - avgFirst;
  const threshold = avgFirst * 0.05; // 5% threshold

  if (diff > threshold) return 'increasing';
  if (diff < -threshold) return 'decreasing';
  return 'stable';
}

// Export más algoritmos extraídos de MLEngine.ts
```

#### 2.2: `src/lib/ml/forecasting.ts`

```typescript
/**
 * Demand Forecasting - Pure Algorithms
 */

import { simpleMovingAverage, exponentialSmoothing, detectTrend } from './timeseries';

export interface ForecastResult {
  predictions: number[];
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
}

export function forecastDemand(
  historicalData: number[],
  horizon: number = 30
): ForecastResult {
  // 1. Detect trend
  const trend = detectTrend(historicalData);

  // 2. Apply smoothing
  const smoothed = exponentialSmoothing(historicalData, 0.3);

  // 3. Simple forecast (último valor + tendencia)
  const lastValue = smoothed[smoothed.length - 1];
  const predictions: number[] = [];

  for (let i = 0; i < horizon; i++) {
    // Predicción simple (mejorar con algoritmos más sofisticados)
    predictions.push(lastValue);
  }

  return {
    predictions,
    trend,
    confidence: 0.7 // Placeholder
  };
}

/**
 * Economic Order Quantity
 */
export function calculateEOQ(
  annualDemand: number,
  orderCost: number,
  holdingCost: number
): number {
  return Math.sqrt((2 * annualDemand * orderCost) / holdingCost);
}
```

#### 2.3: `src/lib/ml/anomalyDetection.ts`

```typescript
/**
 * Anomaly Detection - Pure Algorithms
 */

export function detectOutliers(data: number[], threshold: number = 2.5): boolean[] {
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);

  return data.map(value => {
    const zScore = Math.abs((value - mean) / stdDev);
    return zScore > threshold;
  });
}

export function calculateZScore(value: number, data: number[]): number {
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);

  return (value - mean) / stdDev;
}
```

---

### Prioridad 3: Eliminar Duplicados (30 min)

```bash
# Eliminar engines duplicados
rm src/pages/admin/supply-chain/materials/services/demandForecastingEngine.ts
rm src/pages/admin/supply-chain/materials/services/procurementRecommendationsEngine.ts

# Eliminar infraestructura ML rota
rm -rf src/lib/ml/core/
rm -rf src/lib/ml/inventory/

# Actualizar imports (si hay alguno roto)
# Ejecutar: pnpm -s exec tsc --noEmit
```

---

### Prioridad 4: Activar Código Útil (4-6 hrs)

#### 4.1: ProductsIntelligenceEngine (basado en SmartRecommendations)

```bash
# Crear nuevo engine
touch src/pages/admin/supply-chain/products/services/ProductsIntelligenceEngine.ts
```

```typescript
// src/pages/admin/supply-chain/products/services/ProductsIntelligenceEngine.ts

import { detectTrend } from '@/lib/ml/timeseries';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

export class ProductsIntelligenceEngine {
  static analyzeMenuPerformance(products: Product[]): ProductAlert[] {
    const alerts: ProductAlert[] = [];

    // Análisis de productos usando ML
    for (const product of products) {
      const trend = detectTrend(product.salesHistory || []);

      if (trend === 'decreasing') {
        alerts.push({
          type: 'low_performance',
          severity: 'medium',
          title: `Ventas en descenso: ${product.name}`,
          productId: product.id,
          // ...
        });
      }
    }

    return alerts;
  }
}
```

#### 4.2: SystemHealthEngine (basado en AnomalyDetection)

```bash
touch src/pages/admin/debug/services/SystemHealthEngine.ts
```

---

## 📁 ESTRUCTURA FINAL

```
src/
├── shared/
│   └── alerts/                    # ✅ Sistema Unificado
│       ├── AlertsProvider.tsx
│       ├── hooks/useAlerts.ts
│       └── types.ts
│
├── lib/
│   └── ml/                        # 🆕 Algoritmos ML Comunes
│       ├── timeseries.ts          # SMA, EMA, trend detection
│       ├── forecasting.ts         # Demand forecast, EOQ
│       ├── recommendations.ts     # Collaborative filtering
│       └── anomalyDetection.ts    # Outliers, Z-score
│
├── hooks/
│   └── useSmartInventoryAlerts.ts # 🔧 Implementar (30 min)
│
└── pages/admin/
    ├── operations/sales/
    │   ├── services/
    │   │   ├── SalesIntelligenceEngine.ts       # ✅ Funciona
    │   │   └── SalesAlertsAdapter.ts            # ✅ Funciona
    │   └── hooks/useSalesAlerts.ts              # ✅ Funciona
    │
    ├── resources/scheduling/
    │   ├── services/
    │   │   ├── SchedulingIntelligenceEngine.ts  # ✅ Funciona
    │   │   └── SchedulingAlertsAdapter.ts       # ✅ Funciona
    │   └── hooks/useSchedulingAlerts.ts         # ✅ Funciona
    │
    └── supply-chain/materials/
        ├── services/
        │   ├── smartAlertsEngine.ts             # ✅ Funciona
        │   └── smartAlertsAdapter.ts            # ✅ Funciona
        └── hooks/ (usa global useSmartInventoryAlerts)
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Día 1: Quick Wins (1 hora)

- [ ] Implementar `useSmartInventoryAlerts.ts` (30 min)
- [ ] Eliminar duplicados (30 min)
- [ ] Verificar que Materials muestra alertas ✅

### Día 2-3: Algoritmos ML (2-3 hrs)

- [ ] Crear `src/lib/ml/timeseries.ts`
- [ ] Crear `src/lib/ml/forecasting.ts`
- [ ] Crear `src/lib/ml/anomalyDetection.ts`
- [ ] Extraer algoritmos de MLEngine.ts
- [ ] Testing básico

### Día 4-5: Nuevos Engines (4-6 hrs)

- [ ] ProductsIntelligenceEngine
- [ ] SystemHealthEngine
- [ ] Adapters correspondientes
- [ ] Hooks de integración

### Testing Final

- [ ] `pnpm -s exec tsc --noEmit` (verificar types)
- [ ] `pnpm test:run` (correr tests)
- [ ] Verificar alertas en UI de cada módulo

---

## 🎯 RESULTADO ESPERADO

Después de implementar:

```
Sistema Unificado (@/shared/alerts)
    ↑
    ├─ SalesIntelligenceEngine → SalesAlertsAdapter → ✅
    ├─ SchedulingIntelligenceEngine → SchedulingAlertsAdapter → ✅
    ├─ SmartAlertsEngine → SmartAlertsAdapter → ✅ (nuevo)
    ├─ ProductsIntelligenceEngine → ProductsAlertsAdapter → ✅ (nuevo)
    └─ SystemHealthEngine → SystemHealthAdapter → ✅ (nuevo)

Todos usan algoritmos comunes de src/lib/ml/ ✅
```

---

## 📚 DOCUMENTOS DE REFERENCIA

- **Análisis Completo**: `ML_AI_ARCHITECTURAL_ANALYSIS.md` (1,127 líneas)
- **Decisión Original**: `ML_AI_ARCHITECTURE_DECISION.md`
- **Este documento**: Quick Start Guide

---

**¿Listo para empezar? Comienza por Prioridad 1 (30 min) ⚡**
