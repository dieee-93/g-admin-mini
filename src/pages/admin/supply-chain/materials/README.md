# Módulo de Materials - G-Admin Mini

## 📋 Descripción del Módulo

El módulo de **Materials** gestiona el inventario completo de materias primas, control de stock, análisis ABC, y optimización de cadena de suministro. Incluye funcionalidades avanzadas de previsión de demanda, recomendaciones de compras, y alertas inteligentes basadas en datos reales de consumo.

### Características principales:
- ✅ Gestión completa de inventario y stock
- ✅ Análisis ABC automático con clasificación inteligente (A, B, C)
- ✅ Sistema de alertas de stock con umbrales dinámicos
- ✅ Previsión de demanda y recomendaciones de compra
- ✅ Análisis de proveedores y optimización de costos
- ✅ Cálculos de stock con precisión decimal (Decimal.js)
- ✅ Integración con cadena de suministro

---

## 🏗️ Estructura Estándar de Módulo

Esta estructura sigue nuestro **patrón oficial** establecido en el módulo Products:

```
src/pages/admin/supply-chain/materials/
├── README.md                   # 📖 Este archivo (documentación completa)
├── page.tsx                    # 🎯 Página orquestadora (componente principal)
│
├── components/                 # 🧩 Componentes UI específicos del módulo
│   ├── index.ts               # 📦 Barrel exports
│   ├── MaterialsList/         # 📋 Lista de materiales con filtros
│   ├── MaterialFormModal/     # ➕ Modal para crear/editar materiales
│   ├── ABCAnalysisPanel/      # 📊 Panel de análisis ABC
│   ├── ProcurementPanel/      # 💰 Panel de recomendaciones de compra
│   ├── SupplyChainPanel/      # 🚚 Panel de análisis de cadena de suministro
│   ├── StockAlertsWidget/     # ⚠️ Widget de alertas de stock
│   └── [otros componentes]/   # 🔧 Componentes adicionales
│
├── hooks/                     # 🪝 Hooks de negocio y página
│   ├── index.ts              # 📦 Barrel exports
│   ├── useMaterialsPage.ts   # 🎭 Hook orquestador de la página
│   ├── useMaterialsMigrated.tsx # 🔄 Hook migrado del sistema CRUD unificado
│   └── [otros hooks]/        # 🔧 Hooks específicos
│
├── services/                  # ⚙️ Lógica de negocio y servicios
│   ├── index.ts              # 📦 Barrel exports
│   ├── inventoryApi.ts       # 🌐 API calls para inventario
│   ├── materialsNormalizer.ts # 🔄 Normalizador de datos
│   ├── suppliersApi.ts       # 🏢 API calls para proveedores
│   ├── supplyChainDataService.ts # 📊 Servicio de datos de cadena
│   │
│   # Business Logic Services (movidos desde business-logic/inventory)
│   ├── stockCalculation.ts   # 📈 Cálculos de stock y umbrales
│   ├── abcAnalysisEngine.ts  # 📊 Motor de análisis ABC
│   ├── demandForecastingEngine.ts # 🔮 Previsión de demanda
│   ├── procurementRecommendationsEngine.ts # 💡 Recomendaciones de compra
│   ├── smartAlertsEngine.ts  # 🚨 Motor de alertas inteligentes
│   ├── smartAlertsAdapter.ts # 🔧 Adaptador de alertas
│   ├── supplierAnalysisEngine.ts # 🏢 Análisis de proveedores
│   ├── formCalculation.ts    # 📝 Cálculos de formularios
│   └── __tests__/           # 🧪 Tests de servicios
│
├── types/                    # 🏷️ Definiciones TypeScript
│   ├── index.ts             # 📦 Barrel exports
│   ├── types.ts             # 📝 Tipos base del módulo
│   └── abc-analysis.ts      # 📊 Tipos específicos del análisis ABC
│
└── utils/                   # 🛠️ Utilidades específicas del módulo
    ├── index.ts            # 📦 Barrel exports
    └── [utilidades]/       # 🔧 Helper functions
```

---

## 🎯 Patrón "Página Orquestadora"

### Concepto
El archivo `page.tsx` actúa como un **orquestador limpio** siguiendo el mismo patrón establecido en Products:
- ✅ No contiene lógica de negocio
- ✅ Usa componentes semánticos del sistema de diseño
- ✅ Delega la lógica al hook `useMaterialsPage`
- ✅ Mantiene estructura clara y consistente

### Implementación Actual

```tsx
// src/pages/admin/supply-chain/materials/page.tsx
export function MaterialsPage() {
  // 🎭 Toda la lógica delegada al hook orquestador
  const {
    pageState,
    metrics,
    actions,
    loading,
    error
  } = useMaterialsPage();

  return (
    <ContentLayout spacing="normal">
      {/* 📋 Header semántico con acciones específicas de materials */}
      <PageHeader
        title="Materials"
        subtitle="Inventory control & raw materials management"
        actions={
          <>
            <Button variant="outline" colorPalette="blue" onClick={actions.handleABCAnalysis}>
              <ChartBarIcon className="w-4 h-4" />
              ABC Analysis
            </Button>
            <Button variant="outline" colorPalette="green" onClick={actions.handleProcurement}>
              <ClipboardDocumentListIcon className="w-4 h-4" />
              Procurement
            </Button>
            <Button colorPalette="purple" onClick={actions.handleNewMaterial}>
              <PlusIcon className="w-4 h-4" />
              New Material
            </Button>
          </>
        }
      />

      {/* 📊 Métricas calculadas automáticamente */}
      <StatsSection>
        <CardGrid columns={{ base: 1, md: 4 }}>
          <MetricCard title="Total Items" value={metrics.totalItems.toString()} />
          <MetricCard title="Low Stock" value={metrics.lowStockItems.toString()} />
          <MetricCard title="Total Value" value={DecimalUtils.formatCurrency(metrics.totalValue)} />
          <MetricCard title="Suppliers" value={metrics.supplierCount.toString()} />
        </CardGrid>
      </StatsSection>

      {/* 🧩 Secciones condicionales basadas en estado */}
      <Section variant="elevated" title="Inventory Management">
        <MaterialsList />
      </Section>

      {pageState.showABCAnalysis && (
        <Section variant="elevated" title="ABC Analysis">
          <ABCAnalysisPanel />
        </Section>
      )}

      {pageState.showProcurement && (
        <Section variant="elevated" title="Procurement Recommendations">
          <ProcurementPanel />
        </Section>
      )}
    </ContentLayout>
  );
}
```

### Hook Orquestador

```tsx
// src/pages/admin/supply-chain/materials/hooks/useMaterialsPage.ts
export const useMaterialsPage = (): UseMaterialsPageReturn => {
  // 🚀 Configurar acciones rápidas del header global
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-material',
        label: 'Nuevo Material',
        icon: PlusIcon,
        action: () => handleNewMaterial(),
        color: 'purple'
      },
      {
        id: 'abc-analysis',
        label: 'Análisis ABC',
        icon: ChartBarIcon,
        action: () => handleABCAnalysis(),
        color: 'blue'
      },
      // ... más acciones
    ];
    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions]);

  // 📊 Métricas calculadas usando business logic services
  const metrics: MaterialsPageMetrics = {
    totalItems: items.length,
    lowStockItems: StockCalculation.getLowStockItems(items).length,
    criticalStockItems: StockCalculation.getCriticalStockItems(items).length,
    outOfStockItems: StockCalculation.getOutOfStockItems(items).length,
    totalValue: items.reduce((sum, item) => sum + StockCalculation.getTotalValue(item), 0),
    supplierCount: new Set(items.map(item => item.supplier_id).filter(Boolean)).size
  };

  return { pageState, metrics, actions, loading, error, /* ... */ };
};
```

---

## 🧠 Arquitectura de Lógica de Negocio

### Separación de Responsabilidades

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   page.tsx      │───▶│     hooks/      │───▶│   services/     │
│  (Orquestador)  │    │ (Estado/Efectos)│    │ (Lógica Pura)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
   🎭 UI Structure        🪝 State Management     ⚙️ Business Logic
```

### Servicios de Negocio Específicos

**Moved from `business-logic/inventory/` to `materials/services/`:**

1. **stockCalculation.ts** - Cálculos de stock y umbrales
   ```typescript
   export class StockCalculation {
     static getStockStatus(item: MaterialItem): StockStatus
     static getTotalValue(item: MaterialItem): number
     static getSuggestedReorderQuantity(item: MaterialItem): number
   }
   ```

2. **abcAnalysisEngine.ts** - Motor de análisis ABC
   ```typescript
   export class ABCAnalysisEngine {
     static analyzeInventory(items: MaterialItem[]): ABCAnalysisResult
     static generateRecommendations(): ABCRecommendation[]
   }
   ```

3. **demandForecastingEngine.ts** - Previsión de demanda
4. **procurementRecommendationsEngine.ts** - Recomendaciones de compra
5. **smartAlertsEngine.ts** - Alertas inteligentes
6. **supplierAnalysisEngine.ts** - Análisis de proveedores

---

## 🎨 Sistema de Diseño Integrado

### Componentes Semánticos Obligatorios

```tsx
import {
  // 🏗️ Componentes de Layout Semánticos (PRIORIDAD)
  ContentLayout,    // Estructura principal de página
  PageHeader,       // Header con título, subtítulo y acciones
  Section,          // Secciones con variants (elevated/flat/default)
  StatsSection,     // Sección especializada para métricas

  // 📊 Componentes de Métricas
  MetricCard, CardGrid,

  // 🧩 Componentes Base
  Button, Modal, Alert, Badge
} from '@/shared/ui'
```

### Reglas de Diseño Materials
1. **❌ NUNCA** importar de `@chakra-ui/react` directamente
2. **✅ USAR** `ContentLayout spacing="normal"` como contenedor
3. **✅ APLICAR** `PageHeader` con acciones específicas (ABC Analysis, Procurement)
4. **✅ IMPLEMENTAR** `Section` variants para diferentes paneles
5. **✅ UTILIZAR** `StatsSection + CardGrid + MetricCard` para métricas

---

## 📊 Funcionalidades Específicas de Materials

### 1. Análisis ABC Automatizado
```typescript
// Clasificación automática de materiales por valor
const abcResult = ABCAnalysisEngine.analyzeInventory(materials);
// Genera categorías: A (críticos), B (importantes), C (ordinarios)
```

### 2. Sistema de Alertas Inteligentes
```typescript
// Alertas basadas en umbrales dinámicos
const alerts = SmartAlertsEngine.generateAlerts(materials);
// Detecta: stock bajo, stock crítico, sin stock
```

### 3. Previsión de Demanda
```typescript
// Predicciones basadas en consumo histórico
const forecast = DemandForecastingEngine.calculateForecast(materialId);
// Optimiza cantidades de pedido
```

### 4. Recomendaciones de Compra
```typescript
// Sugerencias inteligentes de reabastecimiento
const recommendations = ProcurementEngine.generateRecommendations(materials);
// Considera: lead times, descuentos por volumen, estacionalidad
```

---

## 🔄 Integración con EventBus

### Eventos del Módulo

```typescript
// Eventos que emite el módulo materials
const MATERIALS_EVENTS = {
  STOCK_UPDATED: 'materials:stock_updated',
  LOW_STOCK_ALERT: 'materials:low_stock_alert',
  ABC_ANALYSIS_COMPLETED: 'materials:abc_analysis_completed',
  MATERIAL_CREATED: 'materials:material_created',
  PURCHASE_ORDER_GENERATED: 'materials:purchase_order_generated'
} as const;

// Eventos que escucha el módulo
const SUBSCRIBED_EVENTS = [
  'recipes:ingredient_used',      // Actualizar stock cuando se usa en recetas
  'sales:product_sold',          // Reducir stock de materiales asociados
  'procurement:order_received',   // Actualizar stock al recibir pedidos
  'suppliers:price_updated'      // Recalcular costos cuando cambian precios
] as const;
```

---

## 📊 Testing Strategy

### Estructura de Tests

```
src/pages/admin/supply-chain/materials/
├── __tests__/
│   ├── page.test.tsx                    # Tests del componente principal
│   ├── components/
│   │   ├── MaterialsList.test.tsx       # Tests de componentes
│   │   └── ABCAnalysisPanel.test.tsx
│   ├── hooks/
│   │   ├── useMaterialsPage.test.ts     # Tests de hooks
│   │   └── useMaterials.test.ts
│   └── services/
│       ├── __tests__/                   # Tests de business logic
│       ├── stockCalculation.test.ts
│       ├── abcAnalysisEngine.test.ts
│       └── demandForecastingEngine.test.ts
```

---

## 🚀 Migración Completada

### ✅ Trabajo Realizado

1. **✅ Movimiento de Business Logic**
   - Transferidos 8 archivos desde `business-logic/inventory/` a `materials/services/`
   - Incluye tests y documentación completa
   - Actualizado `business-logic/index.ts` con comentarios de migración

2. **✅ Refactorización de Página**
   - `page.tsx` convertido a orquestador limpio
   - Lógica extraída a `useMaterialsPage` hook
   - Componentes semánticos implementados

3. **✅ Hook Orquestador**
   - `useMaterialsPage.ts` creado siguiendo patrón Products
   - Quick actions configuradas
   - Métricas calculadas con business logic services

4. **✅ Barrel Exports**
   - `services/index.ts` actualizado con nuevas exportaciones
   - `hooks/index.ts` creado para hooks del módulo

---

## 🔗 Referencias Técnicas

### Dependencias Clave
- **Decimal.js**: Precisión en cálculos de inventario y costos
- **Zustand**: State management (materialsStore)
- **ChakraUI v3**: Sistema de componentes base
- **React Query**: Data fetching y cache
- **Heroicons**: Iconografía consistente

### Patrones Aplicados
- ✅ **Separation of Concerns**: UI, Estado, Lógica Business
- ✅ **Composition over Inheritance**: Componentes reutilizables
- ✅ **Domain-Driven Design**: Estructura por dominios de negocio
- ✅ **Event-Driven Architecture**: Comunicación entre módulos
- ✅ **Decimal Precision**: Cálculos de inventario exactos

---

## 📈 Métricas de Calidad

### Indicadores de Éxito
- ⚡ **Performance**: Carga < 200ms, cálculos ABC < 100ms
- 🧪 **Testing**: Cobertura > 80%, tests unitarios + integración
- 📦 **Bundle Size**: Incremento < 75KB por módulo
- 🔧 **Mantenibilidad**: Complejidad ciclomática < 10
- 🎨 **UX Consistency**: 100% componentes del design system

### Validación Técnica
```bash
# Comandos de verificación
npm run typecheck     # Sin errores TypeScript
npm run lint         # Sin warnings ESLint
npm run test:unit    # Todos los tests pasan
npm run build        # Build exitoso
```

---

**🎯 Este README.md documenta la migración completa del módulo Materials siguiendo el patrón establecido en Products.**

**📋 El módulo Materials ahora implementa el estándar oficial de G-Admin Mini con business logic migrada, página orquestadora, y componentes semánticos.**