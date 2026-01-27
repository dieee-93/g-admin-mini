# Módulo de Sales - G-Admin Mini

## 📋 Descripción del Módulo

El módulo de **Sales** gestiona el sistema completo de punto de venta (POS), análisis de ventas, y operaciones comerciales. Incluye funcionalidades avanzadas de gestión de mesas, cocina, generación de códigos QR, y análisis de rendimiento financiero con precisión decimal.

### Características principales:
- ✅ Sistema POS completo con gestión de inventario en tiempo real
- ✅ Gestión inteligente de mesas y turnos
- ✅ Análisis de ventas con métricas avanzadas (crecimiento, conversión, velocidad)
- ✅ Cálculos fiscales precisos para Argentina (IVA, Ingresos Brutos)
- ✅ Integración con cocina y pantallas de pedidos
- ✅ Generación de códigos QR para mesas
- ✅ Dashboard de métricas en tiempo real

- ✅ Dashboard de métricas en tiempo real

### 🗺️ Feature & Route Map

| Route (Relative) | Feature Area | Components | Description |
|------------------|--------------|------------|-------------|
| **`/`** | **POS System** | `POSSystem`, `SalesAnalytics` | Main orchestration page. Handles Point of Sale, Table Management, and Real-time Analytics. |
| **`/b2b`** | **Corporate Sales** | `B2BPortal` | Dedicated interface for wholesale and corporate client management. |

---

## 🏗️ Estructura Estándar de Módulo

Esta estructura representa nuestro **patrón oficial** para todos los módulos de G-Admin Mini:

```
src/pages/admin/operations/sales/
├── README.md                   # 📖 Este archivo (documentación completa)
├── page.tsx                    # 🎯 Página orquestadora (componente principal)
│
├── components/                 # 🧩 Componentes UI específicos del módulo
│   ├── index.ts               # 📦 Barrel exports
│   ├── POSSystem/             # 💰 Sistema de punto de venta
│   ├── TableManagement/       # 🪑 Gestión de mesas y ocupación
│   ├── SalesAnalytics/        # 📊 Dashboard de análisis
│   ├── KitchenDisplay/        # 👨‍🍳 Pantalla para cocina
│   ├── RevenueBreakdown/      # 💵 Desglose de ingresos
│   ├── ProductPerformance/    # 📈 Rendimiento de productos
│   └── TaxDetails/            # 🧾 Detalles fiscales
│
├── hooks/                     # 🪝 Hooks de negocio y página
│   ├── index.ts              # 📦 Barrel exports
│   ├── useSalesPage.ts       # 🎭 Hook orquestador de la página
│   ├── useSales.ts           # 💰 Hook de gestión de ventas
│   └── useSalesCart.ts       # 🛒 Hook del carrito de compras
│
├── services/                  # ⚙️ Lógica de negocio y servicios
│   ├── index.ts              # 📦 Barrel exports
│   ├── saleApi.ts            # 🌐 API calls de ventas
│   ├── tableApi.ts           # 🪑 API calls de mesas
│   ├── salesAnalytics.ts     # 📊 Cálculos de análisis (migrado de business-logic)
│   └── taxCalculationService.ts # 🧾 Servicio de cálculos fiscales (migrado de business-logic)
│
├── types/                    # 🏷️ Definiciones TypeScript
│   ├── index.ts             # 📦 Barrel exports
│   └── [tipos específicos]/ # 📝 Interfaces y types
│
└── utils/                   # 🛠️ Utilidades específicas del módulo
    ├── index.ts            # 📦 Barrel exports
    └── [utilidades]/       # 🔧 Helper functions
```

---

## 🎯 Patrón "Página Orquestadora"

### Concepto
El archivo `page.tsx` actúa como un **orquestador limpio** que:
- ✅ No contiene lógica de negocio
- ✅ Usa componentes semánticos del sistema de diseño
- ✅ Delega la lógica a hooks especializados
- ✅ Mantiene una estructura clara y consistente

### Implementación Actual

```tsx
// src/pages/admin/operations/sales/page.tsx
export default function SalesPage() {
  // 🎭 Toda la lógica delegada al hook orquestador
  const {
    pageState,
    metrics,
    loading,
    error,
    actions
  } = useSalesPage();

  return (
    <ContentLayout spacing="normal">
      {/* 📋 Header semántico con acciones */}
      <PageHeader
        title="Sistema de Ventas"
        subtitle={
          <Stack direction="row" gap="sm" align="center">
            <Badge variant="solid">Live</Badge>
            <Typography variant="body" size="sm" color="text.muted">
              POS inteligente con gestión completa
            </Typography>
          </Stack>
        }
        icon={ComputerDesktopIcon}
        actions={
          <Button variant="solid" onClick={actions.handleNewSale} size="lg">
            <Icon icon={PlusIcon} size="sm" />
            Nueva Venta
          </Button>
        }
      />

      {/* 📊 Métricas de ventas en tiempo real */}
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
          <MetricCard
            title="Ventas Hoy"
            value={`$${metrics.todayRevenue.toFixed(2)}`}
            icon={CurrencyDollarIcon}
            trend={{ value: metrics.salesGrowth, isPositive: metrics.salesGrowth > 0 }}
            colorPalette="green"
          />
          {/* Más métricas... */}
        </CardGrid>
      </StatsSection>

      {/* 🧩 Secciones semánticas para cada funcionalidad */}
      <Section variant="elevated" title="Sistema POS">
        {/* POS System logic */}
      </Section>

      {/* 🪑 Gestión de mesas condicional */}
      {pageState.activeSection === 'tables' && (
        <Section variant="elevated" title="Gestión de Mesas">
          {/* Table Management logic */}
        </Section>
      )}

      {/* 📊 Analytics condicional */}
      {pageState.showAnalytics && (
        <Section variant="elevated" title="Analytics de Ventas">
          {/* Analytics components */}
        </Section>
      )}

      {/* ⚡ Acciones rápidas */}
      <Section variant="flat" title="Acciones Rápidas">
        {/* Quick action buttons */}
      </Section>
    </ContentLayout>
  );
}
```

### Hook Orquestador

```tsx
// src/pages/admin/operations/sales/hooks/useSalesPage.ts
export const useSalesPage = (): UseSalesPageReturn => {
  const { setQuickActions, updateModuleBadge } = useNavigation();

  // 🚀 Configurar acciones rápidas del header global
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-sale',
        label: 'Nueva Venta',
        icon: CreditCardIcon,
        action: () => handleNewSale(),
        color: 'teal'
      },
      {
        id: 'view-analytics',
        label: 'Analytics',
        icon: ChartBarIcon,
        action: () => handleShowAnalytics(),
        color: 'blue'
      },
      {
        id: 'table-management',
        label: 'Gestión Mesas',
        icon: TableCellsIcon,
        action: () => setActiveSection('tables'),
        color: 'green'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions]);

  // 📊 Cálculo de métricas usando servicios de negocio
  const metrics: SalesPageMetrics = useMemo(() => {
    const todayTransactions = transactionData.filter(/* filtros */);
    const todayRevenue = todayTransactions.reduce(/* cálculos */);

    // Usar servicios migrados de business-logic
    const topProducts = analyzeProductPerformance(productData, todayRevenue);
    const revenueBreakdown = calculateRevenueBreakdown(/* parámetros */);
    const salesVelocity = calculateSalesVelocity(dailySalesData);

    return {
      todayRevenue,
      todayTransactions: todayTransactions.length,
      averageOrderValue,
      // ... más métricas
    };
  }, [transactionData, productData, salesData, tableData]);

  // 🎯 Handlers de acciones específicas
  const handleNewSale = useCallback(() => {
    setActiveSection('pos');
    // Lógica para iniciar nueva venta
  }, []);

  return {
    pageState,
    metrics,
    currentSalesMetrics,
    loading,
    error,
    actions,
    // ... más datos y helpers
  };
};
```

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

  // 🧩 Componentes Base
  Button, Alert, Badge, Icon, Stack, Typography,

  // 📊 Componentes de Negocio
  MetricCard, CardGrid
} from '@/shared/ui'
```

### Reglas de Diseño
1. **❌ NUNCA** importar de `@chakra-ui/react` directamente
2. **✅ SIEMPRE** usar `ContentLayout` como contenedor principal
3. **✅ USAR** `PageHeader` para títulos complejos con acciones
4. **✅ APLICAR** `Section` con variants apropiados
5. **✅ USAR** `StatsSection + CardGrid + MetricCard` para métricas
6. **✅ DELEGAR** theming automático (tokens `gray.*`)

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

### Migración de Business Logic

**Servicios migrados desde `business-logic/`:**

1. **salesAnalytics.ts** (429 líneas)
   - ✅ `calculateSalesMetrics()` - Métricas principales con Decimal.js
   - ✅ `comparePeriods()` - Comparación de períodos
   - ✅ `analyzeProductPerformance()` - Análisis de productos
   - ✅ `calculateRevenueBreakdown()` - Desglose de ingresos
   - ✅ `calculateSalesVelocity()` - Velocidad de ventas

2. **taxCalculationService.ts**
   - ✅ Cálculos de IVA para Argentina
   - ✅ Cálculos de Ingresos Brutos
   - ✅ Integración con tipos de productos
   - ✅ Precisión decimal para cálculos fiscales

### Tipos de Hooks

1. **Hook Orquestador** (`useSalesPage.ts`)
   - 🎯 Maneja el estado completo de la página de ventas
   - 🚀 Configura acciones rápidas globales
   - 📊 Calcula métricas usando servicios de negocio
   - 🎭 Coordina entre POS, mesas, analytics y cocina

2. **Hooks de Negocio** (`useSales.ts`, `useSalesCart.ts`)
   - 💰 Encapsula lógica específica de ventas y carrito
   - 🔄 Maneja llamadas a APIs de ventas y mesas
   - 📡 Gestiona estado local de transacciones

---

## 🔄 Integración con EventBus

### Eventos del Módulo

```typescript
// Eventos que emite el módulo
const SALES_EVENTS = {
  SALE_CREATED: 'sales:sale_created',
  SALE_COMPLETED: 'sales:sale_completed',
  TABLE_ASSIGNED: 'sales:table_assigned',
  ORDER_UPDATED: 'sales:order_updated',
  PAYMENT_PROCESSED: 'sales:payment_processed',
  METRICS_UPDATED: 'sales:metrics_updated'
} as const;

// Eventos que escucha el módulo
const SUBSCRIBED_EVENTS = [
  'inventory:stock_updated',    // Actualizar disponibilidad en POS
  'kitchen:order_ready',        // Notificar mesa cuando pedido está listo
  'staff:shift_changed',        // Actualizar métricas por turno
  'products:price_updated'      // Actualizar precios en POS
] as const;
```

### Integración Tiempo Real

```typescript
// Actualización de métricas en tiempo real
useEffect(() => {
  const unsubscribe = eventBus.subscribe('sales:new_transaction', (transaction) => {
    // Actualizar métricas inmediatamente
    setMetrics(prev => ({
      ...prev,
      todayRevenue: prev.todayRevenue + transaction.total,
      todayTransactions: prev.todayTransactions + 1
    }));
  });

  return unsubscribe;
}, []);
```

---

## 📊 Testing Strategy

### Estructura de Tests

```
src/pages/admin/operations/sales/
├── __tests__/
│   ├── page.test.tsx                    # Tests del componente principal
│   ├── components/
│   │   ├── POSSystem.test.tsx           # Tests de sistema POS
│   │   ├── TableManagement.test.tsx     # Tests de gestión de mesas
│   │   └── SalesAnalytics.test.tsx      # Tests de analytics
│   ├── hooks/
│   │   ├── useSalesPage.test.ts         # Tests de hook orquestador
│   │   ├── useSales.test.ts             # Tests de hook de ventas
│   │   └── useSalesCart.test.ts         # Tests de carrito
│   └── services/
│       ├── salesAnalytics.test.ts       # Tests de lógica de análisis
│       ├── taxCalculationService.test.ts # Tests de cálculos fiscales
│       ├── saleApi.test.ts              # Tests de API de ventas
│       └── tableApi.test.ts             # Tests de API de mesas
```

### Tests Críticos de Precisión

```typescript
// Ejemplo: Tests de cálculos fiscales
describe('taxCalculationService', () => {
  it('should calculate IVA with decimal precision', () => {
    const result = calculateIVA(new Decimal(100), 21);
    expect(result.toString()).toBe('21.00');
  });

  it('should handle Ingresos Brutos correctly', () => {
    const result = calculateIngresosBrutos(/* parameters */);
    expect(result.tax_amount).toBeInstanceOf(Decimal);
  });
});
```

---

## 🚀 Funcionalidades Clave

### 1. Sistema POS Integrado
- ✅ Procesamiento de ventas en tiempo real
- ✅ Integración con inventario para control de stock
- ✅ Múltiples métodos de pago
- ✅ Impresión de tickets y facturas
- ✅ Gestión de descuentos y promociones

### 2. Gestión Inteligente de Mesas
- ✅ Visualización de plano de mesas
- ✅ Estados en tiempo real (disponible, ocupada, reservada, limpieza)
- ✅ Asignación automática de pedidos
- ✅ Cálculo de tiempo promedio de rotación
- ✅ Métricas de ocupación y rendimiento

### 3. Analytics Avanzados
- ✅ Métricas de ventas en tiempo real
- ✅ Análisis de crecimiento y tendencias
- ✅ Rendimiento por productos y categorías
- ✅ Velocidad de ventas y momentum
- ✅ Comparación de períodos históricos

### 4. Integración Fiscal
- ✅ Cálculo preciso de IVA (21%, 10.5%, 0%)
- ✅ Ingresos Brutos según jurisdicción
- ✅ Facturación electrónica (AFIP)
- ✅ Reportes fiscales automatizados

### 5. Pantalla de Cocina
- ✅ Visualización de pedidos en tiempo real
- ✅ Gestión de tiempos de preparación
- ✅ Comunicación con mesas
- ✅ Priorización automática de órdenes

---

## 🔗 Referencias Técnicas

### Dependencias Clave
- **Decimal.js**: Precisión en cálculos financieros y fiscales
- **Zustand**: State management global para carrito y sesiones
- **ChakraUI v3**: Sistema de componentes base
- **React Query**: Data fetching para APIs de ventas y mesas
- **Heroicons**: Iconografía consistente
- **EventBus**: Comunicación en tiempo real entre módulos

### Patrones Aplicados
- ✅ **Separation of Concerns**: UI, Estado, Lógica de Negocio
- ✅ **Real-time Updates**: EventBus para actualizaciones instantáneas
- ✅ **Domain-Driven Design**: Estructura por dominios de ventas
- ✅ **Decimal Precision**: Cálculos financieros exactos
- ✅ **Modular Services**: Migración desde business-logic centralizada

### Integración con Otros Módulos
- 📦 **Inventory/Materials**: Control de stock en tiempo real
- 🍽️ **Kitchen/Recipes**: Gestión de pedidos y preparación
- 👥 **Staff**: Seguimiento de ventas por empleado
- 💰 **Financial**: Reportes consolidados de ingresos

---

## 📈 Métricas de Calidad

### Indicadores de Éxito
- ⚡ **Performance**: Transacciones POS < 100ms
- 🧪 **Testing**: Cobertura > 85% (crítico en cálculos fiscales)
- 📦 **Bundle Size**: Incremento < 75KB (funcionalidad compleja)
- 🔧 **Mantenibilidad**: Complejidad ciclomática < 12
- 🎨 **UX Consistency**: 100% componentes del design system
- 💰 **Precision**: 0 errores en cálculos decimales

### Validación Técnica
```bash
# Comandos de verificación específicos para Sales
npm run typecheck           # Sin errores TypeScript
npm run lint               # Sin warnings ESLint
npm run test:unit          # Tests unitarios (servicios)
npm run test:integration   # Tests de integración (APIs)
npm run test:fiscal        # Tests específicos de cálculos fiscales
npm run build              # Build exitoso
```

### KPIs Operacionales
- 📊 **Uptime POS**: > 99.9%
- ⚡ **Tiempo respuesta**: < 200ms promedio
- 🎯 **Precisión fiscal**: 100% (cero errores en AFIP)
- 📱 **Compatibilidad móvil**: Pantallas desde 320px

---

**🎯 Este README.md representa nuestro estándar oficial para el módulo de Sales en G-Admin Mini.**

**📋 El módulo Sales sirve como referencia para otros módulos que requieren funcionalidades de tiempo real, cálculos de precisión decimal, e integración fiscal compleja.**