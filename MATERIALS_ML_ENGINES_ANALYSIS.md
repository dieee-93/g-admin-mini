# MATERIALS ML/AI ENGINES - ANÁLISIS PROFUNDO

**Fecha**: 2025-01-30
**Objetivo**: Decidir el destino de cada engine basado en análisis técnico

---

## 📋 INVENTARIO DE ENGINES

### 1. demandForecastingEngine.ts (429 lines, 42KB)

**Propósito declarado**: Predecir demanda futura usando Machine Learning

**Métodos implementados**:
- `moving_average` - Media móvil simple
- `weighted_average` - Media móvil ponderada
- `exponential_smoothing` - Suavizado exponencial
- `linear_regression` - Regresión lineal
- `seasonal_decomposition` - Descomposición estacional (ARIMA-like)
- `hybrid_model` - Combinación de métodos

**Complejidad técnica**:
- ⚠️ ARIMA model implementation (100+ lines de algoritmo)
- ⚠️ Seasonal pattern detection
- ⚠️ Outlier detection y data cleaning
- ⚠️ Confidence intervals calculation

**Datos requeridos**:
```typescript
interface DemandDataPoint {
  date: string;
  actualDemand: number;
  dayOfWeek: number;
  month: number;
  quarter: number;
  isHoliday?: boolean;
  isPromotion?: boolean;
  weatherCondition?: string;
  priceAtTime?: number;
  competitorPrice?: number;
  marketingSpend?: number;
}
```

**Mínimo viable**:
- 24-36 meses de datos históricos para ARIMA
- 12+ meses para seasonal decomposition
- 6+ meses para moving average

**Uso actual**: Analizando...

---

### 2. abcAnalysisEngine.ts (190 lines)

**Propósito declarado**: Clasificar inventory en A/B/C según valor

**Algoritmo**:
```
Clase A: Top 80% del valor acumulado (20% de items)
Clase B: Siguiente 15% del valor (30% de items)
Clase C: Último 5% del valor (50% de items)
```

**Criterios soportados**:
- `revenue` - Por ingresos generados
- `turnover` - Por rotación
- `margin` - Por margen de ganancia
- `quantity` - Por cantidad vendida

**Complejidad técnica**:
- ✅ Matemática simple (ordenar + acumular)
- ✅ Cálculos con Decimal.js
- ✅ Bien estructurado

**Datos requeridos**:
- Stock actual
- Costo unitario
- Ventas históricas (opcional para revenue analysis)

**Uso actual**: Analizando...

---

### 3. procurementRecommendationsEngine.ts (276 lines)

**Propósito declarado**: Recomendar qué comprar y cuándo

**Funcionalidad**:
- Calcula Economic Order Quantity (EOQ)
- Determina reorder points
- Considera lead times
- Evalúa supplier reliability

**Fórmulas implementadas**:
```typescript
EOQ = √(2 * D * S / H)
// D = Annual demand
// S = Order cost
// H = Holding cost per unit
```

**Complejidad técnica**:
- ✅ Matemática estándar de supply chain
- ⚠️ Requiere configuración de supplier data
- ⚠️ Requiere lead times históricos

**Datos requeridos**:
- Annual demand per item
- Order cost
- Holding cost
- Lead times por supplier
- Supplier reliability metrics

**Uso actual**: Analizando...

---

### 4. supplierAnalysisEngine.ts (311 lines)

**Propósito declarado**: Analizar performance de suppliers

**Métricas calculadas**:
- On-time delivery rate
- Quality score (defect rate)
- Price competitiveness
- Lead time consistency
- Order fill rate

**Complejidad técnica**:
- ✅ Análisis estadístico simple
- ⚠️ Requiere purchase orders históricos
- ⚠️ Requiere quality inspection data

**Datos requeridos**:
- Purchase orders (fecha pedida vs recibida)
- Quality inspections
- Supplier pricing history

**Uso actual**: Analizando...

---

### 5. smartAlertsEngine.ts (221 lines)

**Propósito declarado**: Sistema de alertas "inteligente" con scoring

**Tipos de alertas**:
- Stock crítico (< safety stock)
- Stock bajo (< reorder point)
- Overstocking (> max stock)
- Expiration warnings
- Price anomalies

**Scoring system**:
```typescript
severity = baseScore * urgencyMultiplier * impactMultiplier
```

**Complejidad técnica**:
- ✅ Lógica simple de business rules
- ⚠️ Duplica funcionalidad de MaterialsAlerts component

**Datos requeridos**:
- Stock levels
- Reorder points
- Expiration dates
- Price history

**Uso actual**: Analizando...

---

### 6. trendsService.ts (143 lines)

**Propósito declarado**: Calcular trends de stock y consumo

**Análisis**:
- Stock turnover rate
- Consumption trends (increasing/decreasing)
- Fast-moving vs slow-moving items
- Stock-out frequency

**Complejidad técnica**:
- ✅ Matemática simple (growth rate, averages)
- ⚠️ Requiere datos históricos de 3-6 meses

**Datos requeridos**:
- Stock movements históricos
- Sales history

**Uso actual**: Analizando...

---

## 🔍 ANÁLISIS DE USO REAL

### Resultados del Análisis

| Engine | Usado en Producción | Tiene Tests | Tamaño | Veredicto |
|--------|-------------------|-------------|--------|-----------|
| **ABCAnalysisEngine** | ✅ SÍ (ABCAnalysisSection, useMaterialsPage) | ✅ 22KB | 190 lines | 🟢 **MANTENER** |
| **DemandForecastingEngine** | ❌ NO | ✅ 38KB | 429 lines | 🔴 **ELIMINAR** |
| **ProcurementRecommendationsEngine** | ❌ NO | ✅ 29KB | 276 lines | 🔴 **ELIMINAR** |
| **SupplierAnalysisEngine** | ❌ NO | ❌ NO | 311 lines | 🔴 **ELIMINAR** |
| **SmartAlertsEngine** | 🟡 Interno | ❌ NO | 221 lines | 🟡 **EVALUAR** |
| **TrendsService** | ✅ SÍ (useMaterialsPage) | ❌ NO | 143 lines | 🟢 **MANTENER** |

---

## 🎯 DECISIÓN POR ENGINE

### 1. ABCAnalysisEngine - 🟢 MANTENER (con mejoras)

**Por qué mantener**:
- ✅ **Usado activamente** en ABCAnalysisSection component
- ✅ **Funcionalidad legítima** - ABC Analysis es estándar en supply chain
- ✅ **Tests completos** (22KB de tests)
- ✅ **Valor de negocio claro** - Priorizar control de inventory
- ✅ **No requiere ML** - Matemática simple y determinista

**Mejoras recomendadas**:
```typescript
// ANTES: 190 lines de clase con métodos privados
class ABCAnalysisEngine {
  static analyzeInventory(items, config) { ... }
  private static filterValidItems() { ... }
  private static calculateAnalysisMetrics() { ... }
  // ... 8 métodos privados más
}

// DESPUÉS: Simplificar a funciones puras (80-100 lines)
export function analyzeABC(items: Material[], config?: ABCConfig): ABCResult {
  const validItems = filterValidItems(items, config);
  const classified = classifyByValue(validItems);
  const summary = generateSummary(classified);
  return { classified, summary };
}

// O mejor aún: SQL function en Supabase
CREATE FUNCTION get_abc_classification(p_location_id UUID)
RETURNS TABLE(...) AS $$
WITH ranked AS (
  SELECT *,
    SUM(value) OVER (ORDER BY value DESC) / SUM(value) OVER () as cumulative
  FROM inventory
  WHERE location_id = p_location_id
)
SELECT id, name,
  CASE
    WHEN cumulative <= 0.80 THEN 'A'
    WHEN cumulative <= 0.95 THEN 'B'
    ELSE 'C'
  END as abc_class
FROM ranked;
$$ LANGUAGE sql;
```

**Plan de acción**:
1. Simplificar de clase a funciones (reduce 50%)
2. Mover cálculo pesado a SQL function
3. Mantener tests
4. Agregar caching de resultados (ABC no cambia tan seguido)

---

### 2. DemandForecastingEngine - 🔴 ELIMINAR

**Por qué eliminar**:
- ❌ **NO usado en ningún component**
- ❌ **NO usado en ningún hook**
- ❌ Solo en exports, nunca importado
- ❌ **Datos insuficientes** - Requiere 24+ meses de historical data
- ❌ **ARIMA inviable** - Proyecto recién empezando
- ❌ **Over-engineering extremo** - 429 lines de código que no aporta valor

**Datos que necesitaría**:
```typescript
// POR CADA MATERIAL, POR CADA DÍA:
{
  actualDemand: number,           // ❌ No existe
  dayOfWeek: number,              // ✅ Calculable
  isHoliday: boolean,             // ❌ No existe
  isPromotion: boolean,           // ❌ No existe
  weatherCondition: string,       // ❌ No existe
  priceAtTime: number,            // ❌ No existe (no hay price history)
  competitorPrice: number,        // ❌ No existe
  marketingSpend: number          // ❌ No existe
}
```

**Alternativa simple** (si se necesita forecast en el futuro):
```typescript
// Simple moving average (20 lines)
function getSimpleForecast(materialId: string, days: number = 30): number {
  const lastMonthSales = await getSalesLastMonth(materialId);
  const avgDailySales = lastMonthSales.total / 30;
  return avgDailySales * days * 1.15; // +15% safety buffer
}
```

**Plan de acción**:
1. ❌ Borrar `demandForecastingEngine.ts`
2. ❌ Borrar `demandForecastingEngine.test.ts`
3. ✅ Si se necesita forecast: Simple moving average en 1 función
4. ✅ Implementar ML forecast solo cuando haya 12+ meses de datos reales

**Reducción**: -467 lines (-429 engine -38 tests)

---

### 3. ProcurementRecommendationsEngine - 🔴 ELIMINAR

**Por qué eliminar**:
- ❌ **NO usado** - Solo exportado, nunca importado
- ❌ **Depende de DemandForecastingEngine** (que se elimina)
- ❌ **Depende de SupplierAnalysisEngine** (que se elimina)
- ❌ **Datos faltantes** - No hay lead times, no hay supplier data
- ❌ **EOQ inviable** - Requiere Annual demand, order costs, holding costs configurados

**Datos que necesitaría**:
```typescript
{
  annualDemand: number,           // ❌ No existe (no hay 1 año de data)
  orderCost: number,              // ❌ No configurado
  holdingCost: number,            // ❌ No configurado
  leadTime: number,               // ❌ No existe per supplier
  supplierReliability: number     // ❌ No existe
}
```

**Alternativa simple** (funcionalidad actual):
```typescript
// Lista de items bajo reorder point (10 lines)
function getNeedsProcurement(): Material[] {
  return materials.filter(m => m.current_stock < m.reorder_point);
}
```

**Plan de acción**:
1. ❌ Borrar `procurementRecommendationsEngine.ts`
2. ❌ Borrar `procurementRecommendationsEngine.test.ts`
3. ✅ Implementar simple reorder list en materialsApi
4. ✅ Futuro: EOQ cuando haya supplier module + configuración

**Reducción**: -305 lines (-276 engine -29 tests)

---

### 4. SupplierAnalysisEngine - 🔴 ELIMINAR

**Por qué eliminar**:
- ❌ **NO usado** - Solo exportado
- ❌ **NO tiene tests**
- ❌ **Datos inexistentes** - No hay purchase orders históricos
- ❌ **Sin supplier module** - No hay suppliers configurados
- ❌ **Métricas imposibles** - No se trackean quality inspections

**Datos que necesitaría**:
```typescript
{
  purchaseOrders: [{
    orderedDate: Date,            // ❌ No existe
    promisedDate: Date,           // ❌ No existe
    receivedDate: Date,           // ❌ No existe
    quantityOrdered: number,      // ❌ No existe
    quantityReceived: number,     // ❌ No existe
    defectsFound: number          // ❌ No existe
  }]
}
```

**Plan de acción**:
1. ❌ Borrar `supplierAnalysisEngine.ts`
2. ✅ Implementar cuando exista Supplier Orders module (Phase 2+)

**Reducción**: -311 lines

---

### 5. SmartAlertsEngine - 🟡 CONSOLIDAR

**Estado actual**:
- 🟡 **Usado internamente** por:
  - `smartAlertsAdapter.ts`
  - `procurementRecommendationsEngine.ts` (se elimina)
- ❌ **NO usado directamente** en components
- ❌ **Duplica funcionalidad** de MaterialsAlerts component

**Problema**: Hay 2 sistemas de alertas

1. **SmartAlertsEngine** (221 lines)
   - Genera alertas con scoring
   - Usado por adapter

2. **MaterialsAlerts component** (UI)
   - Muestra alertas en la interfaz
   - NO usa SmartAlertsEngine

**Decisión**:
- ❌ Eliminar `SmartAlertsEngine.ts`
- ❌ Eliminar `smartAlertsAdapter.ts`
- ✅ Consolidar en 1 función simple en `materialsApi.ts`

```typescript
// materialsApi.ts
export function getStockAlerts(materials: Material[]): Alert[] {
  const alerts: Alert[] = [];

  materials.forEach(m => {
    // Critical: Out of stock
    if (m.current_stock === 0) {
      alerts.push({
        type: 'critical',
        materialId: m.id,
        message: `${m.name} agotado`
      });
    }
    // Warning: Low stock
    else if (m.current_stock < m.reorder_point) {
      alerts.push({
        type: 'warning',
        materialId: m.id,
        message: `${m.name} bajo stock: ${m.current_stock} ${m.unit}`
      });
    }
    // Info: Near expiration
    if (m.expiration_date && isNearExpiration(m.expiration_date)) {
      alerts.push({
        type: 'info',
        materialId: m.id,
        message: `${m.name} próximo a vencer`
      });
    }
  });

  return alerts.sort((a, b) =>
    SEVERITY_ORDER[a.type] - SEVERITY_ORDER[b.type]
  );
}
```

**Plan de acción**:
1. ❌ Borrar `smartAlertsEngine.ts` (221 lines)
2. ❌ Borrar `smartAlertsAdapter.ts` (114 lines)
3. ✅ Crear `getStockAlerts()` en materialsApi (30 lines)
4. ✅ Usar en MaterialsAlerts component

**Reducción**: -305 lines

---

### 6. TrendsService - 🟢 MANTENER (simplificar)

**Por qué mantener**:
- ✅ **Usado** en useMaterialsPage hook
- ✅ **Funcionalidad útil** - Stock turnover, fast/slow movers
- ✅ **No requiere ML** - Cálculos simples

**Problema actual**: 143 lines para cálculos simples

**Simplificación**:
```typescript
// ANTES: Clase con 143 lines
class TrendsService {
  static async calculateSystemTrends() { ... }
  private static calculateTurnoverRate() { ... }
  private static identifyFastMovers() { ... }
  // ... más métodos
}

// DESPUÉS: Funciones simples (50 lines total)
export async function getStockTurnover(locationId?: string) {
  // SQL query que calcula turnover
  const { data } = await supabase.rpc('calculate_stock_turnover', {
    p_location_id: locationId,
    p_period_days: 30
  });
  return data;
}

export async function getFastMovers(locationId?: string) {
  // Query: Items con más de X ventas en último mes
  const { data } = await supabase
    .from('inventory')
    .select(`
      *,
      sales_last_30_days:sales(count)
    `)
    .gte('sales_last_30_days.count', 10)
    .order('sales_last_30_days.count', { ascending: false });

  return data;
}
```

**SQL Functions** (mover lógica a DB):
```sql
CREATE FUNCTION calculate_stock_turnover(
  p_location_id UUID,
  p_period_days INT DEFAULT 30
)
RETURNS TABLE(...) AS $$
SELECT
  i.id,
  i.name,
  COALESCE(
    SUM(s.quantity) / NULLIF(i.average_stock, 0),
    0
  ) as turnover_rate,
  CASE
    WHEN turnover_rate > 4 THEN 'fast'
    WHEN turnover_rate > 2 THEN 'medium'
    ELSE 'slow'
  END as movement_category
FROM inventory i
LEFT JOIN sales s ON s.material_id = i.id
  AND s.created_at >= NOW() - INTERVAL '1 day' * p_period_days
WHERE (p_location_id IS NULL OR i.location_id = p_location_id)
GROUP BY i.id;
$$ LANGUAGE sql;
```

**Plan de acción**:
1. ✅ Simplificar clase a 2-3 funciones
2. ✅ Mover cálculos a SQL functions
3. ✅ Reducir de 143 lines a ~50 lines

**Reducción**: -93 lines

---

## 📊 RESUMEN DE DECISIONES

### Eliminar (4 engines)

| Engine | Lines | Razón | Reducción |
|--------|-------|-------|-----------|
| DemandForecastingEngine | 429 | No usado, datos insuficientes, over-engineering | -467 lines |
| ProcurementRecommendationsEngine | 276 | No usado, depende de engines eliminados | -305 lines |
| SupplierAnalysisEngine | 311 | No usado, sin datos, sin supplier module | -311 lines |
| SmartAlertsEngine | 221 | Duplicado, consolidar en API | -335 lines |

**Total eliminado**: 1,418 lines (code + tests)

---

### Simplificar (2 engines)

| Engine | Antes | Después | Reducción |
|--------|-------|---------|-----------|
| ABCAnalysisEngine | 190 lines | 80-100 lines + SQL function | -90 lines |
| TrendsService | 143 lines | 50 lines + SQL functions | -93 lines |

**Total simplificado**: -183 lines

---

### RESULTADO FINAL

| Métrica | Antes | Después | Reducción |
|---------|-------|---------|-----------|
| **Engines totales** | 6 | 2 | -67% |
| **Lines of code** | 1,791 | 188 | -89% |
| **Complexity** | EXTREMA | BAJA | ✅ |
| **Dependency on ML** | SÍ | NO | ✅ |
| **Dependency on historical data** | SÍ (24+ meses) | NO | ✅ |
| **Testability** | DIFÍCIL | FÁCIL | ✅ |
| **Maintainability** | BAJA | ALTA | ✅ |

---

## 🎯 PLAN DE IMPLEMENTACIÓN

### Fase 1: Eliminación (Día 1)

```bash
# Borrar engines no usados
rm src/pages/admin/supply-chain/materials/services/demandForecastingEngine.ts
rm src/pages/admin/supply-chain/materials/services/procurementRecommendationsEngine.ts
rm src/pages/admin/supply-chain/materials/services/supplierAnalysisEngine.ts
rm src/pages/admin/supply-chain/materials/services/smartAlertsEngine.ts
rm src/pages/admin/supply-chain/materials/services/smartAlertsAdapter.ts

# Borrar tests obsoletos
rm src/pages/admin/supply-chain/materials/services/__tests__/demandForecastingEngine.test.ts
rm src/pages/admin/supply-chain/materials/services/__tests__/procurementRecommendationsEngine.test.ts

# Actualizar exports
# Editar src/pages/admin/supply-chain/materials/services/index.ts
```

**Verificar**: `pnpm build` debe pasar sin errores (no hay imports a estos archivos)

---

### Fase 2: Consolidar Alerts (Día 1)

**Crear**: `src/pages/admin/supply-chain/materials/services/alerts.ts`

```typescript
export type AlertType = 'critical' | 'warning' | 'info';

export interface StockAlert {
  id: string;
  type: AlertType;
  materialId: string;
  materialName: string;
  message: string;
  currentStock: number;
  reorderPoint?: number;
  expirationDate?: string;
}

export function getStockAlerts(materials: Material[]): StockAlert[] {
  const alerts: StockAlert[] = [];

  materials.forEach(m => {
    if (m.current_stock === 0) {
      alerts.push({
        id: `${m.id}-outofstock`,
        type: 'critical',
        materialId: m.id,
        materialName: m.name,
        message: `Agotado`,
        currentStock: 0
      });
    }
    else if (m.current_stock < m.reorder_point) {
      alerts.push({
        id: `${m.id}-lowstock`,
        type: 'warning',
        materialId: m.id,
        materialName: m.name,
        message: `Stock bajo: ${m.current_stock} ${m.unit}`,
        currentStock: m.current_stock,
        reorderPoint: m.reorder_point
      });
    }

    if (m.expiration_date && isNearExpiration(m.expiration_date, 7)) {
      alerts.push({
        id: `${m.id}-expiring`,
        type: 'info',
        materialId: m.id,
        materialName: m.name,
        message: `Vence ${formatDate(m.expiration_date)}`,
        currentStock: m.current_stock,
        expirationDate: m.expiration_date
      });
    }
  });

  return alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.type] - order[b.type];
  });
}

function isNearExpiration(date: string, days: number): boolean {
  const expDate = new Date(date);
  const now = new Date();
  const diffDays = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= days && diffDays >= 0;
}
```

**Actualizar**: MaterialsAlerts component para usar esta función

---

### Fase 3: Simplificar ABCAnalysisEngine (Día 2)

**Opción A**: Simplificar código TypeScript

```typescript
// Reducir de clase con 11 métodos a 3 funciones puras
export function classifyABC(
  materials: Material[],
  config: Partial<ABCConfig> = {}
): ABCResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // 1. Calcular valores
  const withValues = materials.map(m => ({
    ...m,
    value: m.current_stock * m.unit_cost
  }));

  // 2. Ordenar por valor descendente
  const sorted = withValues.sort((a, b) => b.value - a.value);

  // 3. Calcular acumulados y clasificar
  const totalValue = sorted.reduce((sum, m) => sum + m.value, 0);
  let accumulated = 0;

  const classified = sorted.map(m => {
    accumulated += m.value;
    const percentage = (accumulated / totalValue) * 100;

    const abcClass: ABCClass =
      percentage <= 80 ? 'A' :
      percentage <= 95 ? 'B' : 'C';

    return { ...m, abcClass, accumulatedPercentage: percentage };
  });

  return {
    items: classified,
    summary: generateSummary(classified)
  };
}

function generateSummary(items: MaterialWithABC[]): ABCSummary {
  const byClass = groupBy(items, 'abcClass');

  return {
    classA: {
      count: byClass.A?.length || 0,
      totalValue: sum(byClass.A, 'value'),
      percentage: (byClass.A?.length / items.length) * 100
    },
    classB: {
      count: byClass.B?.length || 0,
      totalValue: sum(byClass.B, 'value'),
      percentage: (byClass.B?.length / items.length) * 100
    },
    classC: {
      count: byClass.C?.length || 0,
      totalValue: sum(byClass.C, 'value'),
      percentage: (byClass.C?.length / items.length) * 100
    }
  };
}
```

**Opción B**: SQL Function (mejor para performance)

```sql
CREATE OR REPLACE FUNCTION get_abc_classification(p_location_id UUID DEFAULT NULL)
RETURNS TABLE(
  material_id UUID,
  material_name TEXT,
  current_stock DECIMAL,
  unit_cost DECIMAL,
  item_value DECIMAL,
  accumulated_value DECIMAL,
  accumulated_percentage DECIMAL,
  abc_class TEXT
) AS $$
WITH material_values AS (
  SELECT
    id as material_id,
    name as material_name,
    current_stock,
    unit_cost,
    (current_stock * unit_cost) as item_value
  FROM inventory
  WHERE (p_location_id IS NULL OR location_id = p_location_id)
    AND current_stock > 0
  ORDER BY item_value DESC
),
cumulative AS (
  SELECT *,
    SUM(item_value) OVER (ORDER BY item_value DESC) as accumulated_value,
    SUM(item_value) OVER () as total_value
  FROM material_values
)
SELECT
  material_id,
  material_name,
  current_stock,
  unit_cost,
  item_value,
  accumulated_value,
  (accumulated_value / total_value * 100) as accumulated_percentage,
  CASE
    WHEN (accumulated_value / total_value * 100) <= 80 THEN 'A'
    WHEN (accumulated_value / total_value * 100) <= 95 THEN 'B'
    ELSE 'C'
  END as abc_class
FROM cumulative
ORDER BY item_value DESC;
$$ LANGUAGE sql STABLE;
```

**Usar en TypeScript**:
```typescript
export async function getABCClassification(locationId?: string) {
  const { data, error } = await supabase.rpc('get_abc_classification', {
    p_location_id: locationId
  });

  if (error) throw error;

  return {
    items: data,
    summary: {
      classA: data.filter(i => i.abc_class === 'A'),
      classB: data.filter(i => i.abc_class === 'B'),
      classC: data.filter(i => i.abc_class === 'C')
    }
  };
}
```

---

### Fase 4: Simplificar TrendsService (Día 2)

**SQL Function**:
```sql
CREATE OR REPLACE FUNCTION calculate_stock_metrics(
  p_location_id UUID DEFAULT NULL,
  p_period_days INT DEFAULT 30
)
RETURNS TABLE(
  material_id UUID,
  material_name TEXT,
  avg_stock DECIMAL,
  total_sales DECIMAL,
  turnover_rate DECIMAL,
  movement_category TEXT
) AS $$
SELECT
  i.id as material_id,
  i.name as material_name,
  i.current_stock as avg_stock,
  COALESCE(SUM(s.quantity), 0) as total_sales,
  COALESCE(
    SUM(s.quantity) / NULLIF(i.current_stock, 0),
    0
  ) as turnover_rate,
  CASE
    WHEN COALESCE(SUM(s.quantity) / NULLIF(i.current_stock, 0), 0) > 4 THEN 'fast'
    WHEN COALESCE(SUM(s.quantity) / NULLIF(i.current_stock, 0), 0) > 2 THEN 'medium'
    ELSE 'slow'
  END as movement_category
FROM inventory i
LEFT JOIN sale_items s ON s.material_id = i.id
  AND s.created_at >= NOW() - INTERVAL '1 day' * p_period_days
WHERE (p_location_id IS NULL OR i.location_id = p_location_id)
GROUP BY i.id, i.name, i.current_stock
ORDER BY turnover_rate DESC;
$$ LANGUAGE sql STABLE;
```

**TypeScript wrapper**:
```typescript
export async function getStockMetrics(locationId?: string, periodDays = 30) {
  const { data, error } = await supabase.rpc('calculate_stock_metrics', {
    p_location_id: locationId,
    p_period_days: periodDays
  });

  if (error) throw error;

  return {
    fastMovers: data.filter(i => i.movement_category === 'fast'),
    mediumMovers: data.filter(i => i.movement_category === 'medium'),
    slowMovers: data.filter(i => i.movement_category === 'slow'),
    avgTurnoverRate: data.reduce((sum, i) => sum + i.turnover_rate, 0) / data.length
  };
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Día 1: Eliminación

- [ ] Backup del código actual
- [ ] Borrar 5 engines no usados
- [ ] Borrar tests obsoletos
- [ ] Actualizar services/index.ts
- [ ] Verificar build pasa
- [ ] Commit: "refactor: remove unused ML engines (-1,418 lines)"

### Día 2: Consolidación

- [ ] Crear alerts.ts con lógica simple
- [ ] Actualizar MaterialsAlerts component
- [ ] Verificar alertas funcionan correctamente
- [ ] Commit: "refactor: consolidate alerts system"

### Día 3: Simplificación ABC

- [ ] Decidir: TypeScript simple o SQL function
- [ ] Implementar nueva versión
- [ ] Actualizar ABCAnalysisSection component
- [ ] Verificar tests pasan
- [ ] Commit: "refactor: simplify ABC analysis"

### Día 4: Simplificación Trends

- [ ] Crear SQL function para stock metrics
- [ ] Implementar TypeScript wrapper
- [ ] Actualizar useMaterialsPage hook
- [ ] Verificar métricas correctas
- [ ] Commit: "refactor: move trends to SQL"

### Día 5: Testing & Docs

- [ ] Tests unitarios para nuevas funciones
- [ ] Tests de integración con DB
- [ ] Actualizar documentación
- [ ] Performance testing
- [ ] Final commit: "refactor: materials engines complete"

---

## 📈 BENEFICIOS ESPERADOS

### Código

- **-89% lines of code** en services layer
- **-67% engines** (de 6 a 2)
- Complejidad: EXTREMA → BAJA
- Maintainability: BAJA → ALTA

### Performance

- ABC Analysis: TypeScript O(n log n) → SQL O(n) con índices
- Trends: 143 lines TS → 1 SQL query optimizada
- Alerts: -305 lines, función pura sin side effects

### Arquitectura

- ✅ Separación clara: Business logic en SQL, orchestration en TS
- ✅ Sin dependencias de ML/AI
- ✅ Sin prerequisitos de datos históricos
- ✅ Testeable con datos reales mínimos

### Futuro

- ✅ ML puede agregarse cuando haya datos (12+ meses)
- ✅ Procurement puede implementarse cuando haya supplier module
- ✅ Base sólida para features enterprise reales

---

## 🎓 LECCIONES APRENDIDAS

1. **Start Simple**: Simple solutions que funcionan > Complex solutions que no se usan
2. **Data First**: ML sin datos = código muerto
3. **SQL is King**: Para cálculos de sets, SQL > TypeScript loops
4. **YAGNI**: Implementar features cuando se necesitan, no "por si acaso"
5. **Test Usage**: Si no hay imports, no se usa. Borrar sin miedo.

---

**PRÓXIMO**: Análisis de arquitectura y orquestación de sistemas
