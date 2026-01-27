# 🎨 SALES MODULE REDESIGN PROPOSAL v1.0

**Date**: 2025-12-11
**Status**: Proposal - Pending Approval
**Scope**: Complete UI/UX redesign + Architecture improvements
**Effort**: High (3-4 week sprint)

---

## 📋 TABLA DE CONTENIDOS

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Problems Identified](#problems-identified)
4. [Design Principles](#design-principles)
5. [Proposed Architecture](#proposed-architecture)
6. [UI/UX Redesign](#uiux-redesign)
7. [Metrics System Redesign](#metrics-system-redesign)
8. [Adaptive POS Interface](#adaptive-pos-interface)
9. [Sales-Cash Integration UI](#sales-cash-integration-ui)
10. [TakeAway Toggle Relocation](#takeaway-toggle-relocation)
11. [Implementation Plan](#implementation-plan)
12. [Risk Analysis](#risk-analysis)

---

## 🎯 EXECUTIVE SUMMARY

El módulo Sales requiere un rediseño completo para:

1. **Optimizar espacio**: Reducir paddings excesivos, mejorar densidad de información
2. **Capabilities-aware UI**: Métricas y componentes que reaccionen dinámicamente a capabilities activas
3. **Adaptive POS**: Interfaz que se adapte al tipo de producto/servicio vendido
4. **Cash Integration**: UI visible para integración con Cash Management
5. **Component reorganization**: Reubicación de TakeAway toggle y otros elementos

### Impacto Esperado
- ✅ 40% más espacio útil en pantalla
- ✅ Experiencia adaptativa según business model
- ✅ Mejor visibilidad de información financiera (Cash)
- ✅ Reducción de confusión en UX

---

## 🔍 CURRENT STATE ANALYSIS

### Arquitectura Actual

```
Sales Page Structure (CURRENT)
├─ SkipLink (✅ correcto)
├─ Offline Warning (✅ correcto)
├─ Multi-Location Badge (✅ correcto)
├─ Toolbar Actions (HookPoint)
│  └─ TakeAway Toggle ← ❌ MAL UBICADO (muy prominente, confuso)
├─ Metrics Section (Aside)
│  └─ 8 MetricCards ← ❌ NO REACCIONA A CAPABILITIES (siempre muestra 8)
├─ Alerts Section (✅ correcto)
├─ Sales Management Section
│  └─ Tabs: POS, Analytics, Reports, Delivery, Appointments
│     └─ POS Tab
│        ├─ Badge "Principal" + "Live"
│        ├─ Descripción genérica
│        └─ Botones: Nueva Venta, Historial, Mesas, QR
│           ← ❌ NO ADAPTATIVO (siempre muestra todos los botones)
└─ Quick Actions (Aside) ← ❌ POCO ÚTIL (acciones duplicadas)
```

### Current Metrics (ALWAYS 8 cards)

```
ROW 1:
[Revenue Hoy] [Transacciones] [Ticket Promedio] [Mesas Activas] ← ❌ "Mesas" siempre visible

ROW 2:
[Órdenes Pendientes] [Tiempo Servicio] [Margen] [Ocupación] ← ❌ Ocupación siempre visible
```

### Issues Visualized in image.png

```
┌────────────────────────────────────────────────────────────────────┐
│  HUGE PADDING                                                       │
│                                                                     │
│  [TakeAway Toggle - ENORME BOX]  ← ❌ Muy prominente              │
│                                                                     │
│  HUGE PADDING                                                       │
│                                                                     │
│  [────────────] [────────────] [────────────] [────────────]      │
│  │  Revenue   │ │Transaction│ │   Ticket   │ │   Mesas    │ ❌   │
│  │  GIANT     │ │  GIANT    │ │   GIANT    │ │   GIANT    │      │
│  [────────────] [────────────] [────────────] [────────────]      │
│                                                                     │
│  HUGE PADDING                                                       │
│                                                                     │
│  [────────────] [────────────] [────────────] [────────────]      │
│  │  Órdenes   │ │  Tiempo   │ │  Margen    │ │  Ocupación │ ❌   │
│  │  GIANT     │ │  GIANT    │ │   GIANT    │ │   GIANT    │      │
│  [────────────] [────────────] [────────────] [────────────]      │
│                                                                     │
│  HUGE PADDING                                                       │
│                                                                     │
│  [Sistema Operando Normalmente - Alert Box]                        │
│                                                                     │
│  HUGE PADDING                                                       │
└────────────────────────────────────────────────────────────────────┘
```

**Problemas Evidentes:**
1. ❌ **80% del espacio es padding/whitespace** - Desperdicio brutal
2. ❌ **TakeAway toggle muy prominente** - Parece el feature principal
3. ❌ **Cards uniformes** - Todas del mismo tamaño, sin jerarquía
4. ❌ **No reacción a capabilities** - Siempre muestra "Mesas" aunque no esté activo

---

## ❌ PROBLEMS IDENTIFIED

### 1. TakeAway Toggle Issues

**Problema Técnico:**
```typescript
// CÓDIGO ACTUAL: src/modules/sales/manifest.tsx:172
registry.addAction(
  'sales.toolbar.actions',
  () => <TakeAwayToggle key="takeaway-toggle" />,
  'sales',
  90  // ← Alta prioridad → se renderiza PRIMERO y GRANDE
);
```

**Problemas:**
- ✅ **Implementación técnica**: CORRECTA (validación, achievements, modal)
- ❌ **Ubicación visual**: INCORRECTA (demasiado prominente)
- ❌ **Sincronización real**: Usa estado local, no sincroniza con capability real
- ❌ **Jerarquía**: Parece el feature principal de la página

**Propuestas:**
1. ✅ **Opción A**: Reubicar en ShiftControl widget (contexto operacional correcto)
2. ✅ **Opción B**: Mover a Settings > Operating Hours (configuración)
3. ✅ **Opción C**: Compactar y mover a toolbar secundaria (menos prominente)

### 2. Metrics Cards - No Capability-Aware

**Problema:**
```typescript
// CÓDIGO ACTUAL: src/pages/admin/operations/sales/components/SalesMetrics.tsx
// ❌ SIEMPRE renderiza 8 cards, sin importar capabilities activas

<MetricCard title="Mesas Activas" ... />  // ← Siempre visible
<MetricCard title="Ocupación Mesas" ... /> // ← Siempre visible
```

**Impacto:**
- Confusión: Usuario ve "Mesas Activas: 0" aunque no tenga onsite dining
- Espacio desperdiciado: Cards irrelevantes ocupan espacio
- No escalable: Al agregar más capabilities, se vuelve caótico

**Necesidad:**
```typescript
// PROPUESTO: Inyección dinámica vía HookPoint
<HookPoint name="sales.metrics.primary" />
<HookPoint name="sales.metrics.secondary" />

// Onsite module inyecta:
registry.addAction('sales.metrics.primary', () => (
  <MetricCard title="Mesas Activas" value={activeTables} />
), 'onsite-fulfillment', 80);
```

### 3. Spacing & Layout Waste

**Mediciones de image.png:**
- Padding top: ~120px (excesivo)
- Padding entre sections: ~80px cada una
- Card height: ~200px (muy grande para datos simples)
- Padding interno cards: ~40px

**Total espacio útil:** ~20% de la pantalla
**Total padding:** ~80% de la pantalla ❌

### 4. Non-Adaptive POS Interface

**Problema:**
```typescript
// CÓDIGO ACTUAL: SalesManagement component
<Button onClick={onNewSale}>Nueva Venta</Button>
<Button>Gestión Mesas</Button>  // ← Siempre visible
<Button>Códigos QR</Button>     // ← Siempre visible
```

**Escenarios No Soportados:**
- 🎫 **Digital Products**: ¿Cómo se registra venta de gift card?
- 🏋️ **Service Appointments**: ¿Cómo se registra sesión de gym?
- 📦 **Rental**: ¿Cómo se registra alquiler de equipo?
- 🚚 **Delivery**: ¿Interfaz es igual que dine-in?

**Necesidad:**
- POS debe adaptar interfaz según `product.type`
- Campos dinámicos según tipo de venta
- Validaciones específicas por capability

### 5. Cash Integration Invisible

**Problema:**
```typescript
// INTEGRACIÓN EXISTE en código:
// src/modules/cash/handlers/salesPaymentHandler.ts
// src/docs/cash/05-MODULE-INTEGRATION.md

// PERO en UI:
// ❌ No se ve sesión de caja activa
// ❌ No se ve monto en caja del empleado
// ❌ No se ve botón de cierre de caja
```

**Necesidad:**
```
POS Interface debería mostrar:
┌─────────────────────────────────────┐
│ 💰 Caja: María Gómez                │
│ Efectivo: $2,500 | Ventas: 12       │
│ [Cerrar Caja]                       │
└─────────────────────────────────────┘
```

---

## 🎨 DESIGN PRINCIPLES

### 1. Capability-Driven UI

**Principio**: La UI reacciona dinámicamente a las capabilities activas.

```typescript
// BAD (current)
if (metrics.activeTables !== undefined) {
  return <MetricCard title="Mesas" value={metrics.activeTables} />;
}

// GOOD (proposed)
<HookPoint name="sales.metrics.primary" />
// Onsite module inyecta solo si capability activa
```

### 2. Information Density

**Principio**: Maximizar información útil, minimizar whitespace.

```
CURRENT:  20% info / 80% padding  ❌
TARGET:   60% info / 40% padding  ✅
```

### 3. Contextual Hierarchy

**Principio**: Elementos por orden de importancia operacional.

```
Jerarquía Visual (más a menos importante):
1. Acción primaria (Nueva Venta)
2. Métricas críticas (Revenue, Transacciones)
3. Controles operacionales (Turnos, Caja)
4. Métricas secundarias (Margen, Ocupación)
5. Configuraciones (TakeAway, Settings)
```

### 4. Mobile-First Adaptive

**Principio**: Diseño responsive, móvil como prioridad.

```
MOBILE:   1 columna, cards compactas
TABLET:   2 columnas, layout optimizado
DESKTOP:  3-4 columnas, full features
```

### 5. Progressive Disclosure

**Principio**: Mostrar información avanzada solo cuando sea necesaria.

```
BASIC POS:    Nueva Venta, Historial
+ ONSITE:     + Gestión Mesas
+ DELIVERY:   + Rastreo Pedidos
+ CASH:       + Sesión Caja
```

---

## 🏗️ PROPOSED ARCHITECTURE

### New Page Structure

```
Sales Page Structure (PROPOSED)
├─ SkipLink (sin cambios)
├─ Offline Warning (sin cambios)
├─ Page Header Section (NEW)
│  ├─ Breadcrumb + Title
│  ├─ Shift Status Widget (NEW) ← Integración con Shift Control
│  │  └─ Shift Activo + Caja Abierta
│  └─ Quick Actions Bar (REDISEÑADO)
│     ├─ [Nueva Venta] (primary)
│     ├─ [Historial]
│     └─ HookPoint: context_actions (fulfillment modules inject)
│
├─ Critical Metrics Section (REDISEÑADO)
│  ├─ Primary Metrics (ALWAYS VISIBLE)
│  │  └─ Revenue, Transacciones, Ticket Promedio
│  └─ HookPoint: sales.metrics.primary (CAPABILITY-INJECTED)
│     ├─ Onsite injects: Mesas, Ocupación
│     ├─ Delivery injects: En Ruta, Tiempo Entrega
│     └─ Rental injects: Items Alquilados, Devoluciones Hoy
│
├─ Cash Integration Section (NEW)
│  └─ HookPoint: sales.cash_session_status
│     └─ Cash module injects: Session info, Close button
│
├─ Alerts Section (sin cambios pero compacto)
│
├─ POS Interface Section (ADAPTATIVO)
│  └─ Tab: POS
│     └─ AdaptivePOSInterface (NEW COMPONENT)
│        ├─ Detecta capability activa
│        ├─ Renderiza interfaz específica
│        └─ HookPoint: sales.pos.context_selector
│
├─ Analytics/Reports Tabs (sin cambios)
│
└─ Settings Section (NEW - RELOCATED)
   └─ HookPoint: sales.configuration
      └─ TakeAway toggle inyectado aquí (menos prominente)
```

### Hook Point Strategy

**New Hook Points:**

```typescript
export const salesManifest: ModuleManifest = {
  hooks: {
    provide: [
      // EXISTING
      'sales.toolbar.actions',
      'sales.order_placed',
      'sales.payment_received',

      // NEW - Métricas dinámicas
      'sales.metrics.primary',      // Métricas críticas inyectadas por capabilities
      'sales.metrics.secondary',    // Métricas adicionales

      // NEW - POS adaptativo
      'sales.pos.interface',        // Interfaz POS principal
      'sales.pos.context_selector', // Selector de contexto (Onsite/Delivery/Pickup)
      'sales.pos.payment_methods',  // Métodos de pago disponibles

      // NEW - Cash integration
      'sales.cash_session_status',  // Estado de sesión de caja
      'sales.cash_actions',         // Acciones de caja (abrir, cerrar)

      // NEW - Configuración
      'sales.configuration',        // Panel de configuración
      'sales.quick_actions'         // Acciones rápidas contextuales
    ],
    consume: [
      // EXISTING
      'materials.stock_updated',
      'production.order_ready',

      // NEW - Shift integration
      'shift.status_changed',       // Escuchar cambios de turno
      'shift.opened',               // Turno abierto
      'shift.closing',              // Turno cerrándose

      // NEW - Cash integration
      'cash.session.opened',        // Sesión de caja abierta
      'cash.session.closed',        // Sesión de caja cerrada
      'cash.balance_low'            // Alerta de efectivo bajo
    ]
  }
};
```

---

## 🎨 UI/UX REDESIGN

### Proposed Layout (Desktop)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Sales Management                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ 🟢 Turno Mañana (Juan Pérez)  💰 Caja: María ($2,500)  [Cerrar]    │
│ ──────────────────────────────────────────────────────────────────  │
│                                                                       │
│ [🛒 Nueva Venta]  [📊 Historial]  [🍽️ Gestión Mesas]  [⚙️]        │
│                                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                    MÉTRICAS CRÍTICAS                                 │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ │ Revenue  │ │  Trans   │ │ Ticket   │ │  Mesas   │ │ Ocupación│  │
│ │ $12,450  │ │   145    │ │  $85     │ │    8     │ │   75%    │  │
│ │   ↑12%   │ │          │ │          │ │  activas │ │          │  │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│    CORE         CORE         CORE      ← ONSITE    ← ONSITE        │
│                                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                    PUNTO DE VENTA                                    │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ [POS] [Analytics] [Reportes] [Delivery] [Appointments]        │  │
│ ├───────────────────────────────────────────────────────────────┤  │
│ │                                                                 │  │
│ │  [Interfaz POS adaptativa según capability activa]            │  │
│ │                                                                 │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

Espaciado optimizado:
- Padding top: 16px (era 120px)
- Padding entre sections: 24px (era 80px)
- Card height: 120px (era 200px)
- Padding interno: 16px (era 40px)
```

### Proposed Layout (Mobile)

```
┌────────────────────────────┐
│ Sales                      │
├────────────────────────────┤
│                            │
│ 🟢 Turno: Mañana          │
│ 💰 Caja: María ($2,500)   │
│                            │
│ [🛒 Nueva Venta]          │
│                            │
├────────────────────────────┤
│ Revenue      $12,450  ↑12% │
│ Transacciones     145      │
│ ────────────────────────── │
│ Mesas activas       8      │
│ Ocupación         75%      │
│                            │
├────────────────────────────┤
│ [POS] [Analytics] [...]    │
│                            │
│ [Interfaz compacta]       │
│                            │
└────────────────────────────┘
```

### Color & Visual Hierarchy

```typescript
// Jerarquía Visual mediante colores y tamaños

PRIMARY ACTIONS:
- Color: teal.600 (brand)
- Size: lg
- Weight: bold
- Example: [Nueva Venta]

CRITICAL METRICS:
- Color: green (positive), red (negative), blue (neutral)
- Size: 2xl (números)
- Trend indicators: ↑↓

CONTEXT INDICATORS:
- Shift status: badge green (activo), gray (cerrado)
- Cash status: badge teal (abierta), red (warning)

SECONDARY ACTIONS:
- Color: gray.600
- Size: md
- Weight: normal
```

---

## 📊 METRICS SYSTEM REDESIGN

### Current Problems

```typescript
// ❌ PROBLEMA: Métricas hardcoded
const METRICS = [
  { title: 'Revenue', value: todayRevenue },
  { title: 'Mesas Activas', value: activeTables },  // ← Siempre visible
  { title: 'Ocupación', value: tableOccupancy }     // ← Siempre visible
];
```

### Proposed Solution: Dynamic Injection

#### Core Metrics (Always Visible)

```typescript
// src/pages/admin/operations/sales/components/CoreMetrics.tsx
export function CoreMetrics({ metrics }: Props) {
  return (
    <>
      <MetricCard
        title="Revenue Hoy"
        value={formatCurrency(metrics.todayRevenue)}
        trend={metrics.salesGrowth}
        icon={CurrencyDollarIcon}
        colorPalette="green"
        priority="critical"
      />
      <MetricCard
        title="Transacciones"
        value={metrics.todayTransactions}
        icon={CreditCardIcon}
        colorPalette="blue"
        priority="critical"
      />
      <MetricCard
        title="Ticket Promedio"
        value={formatCurrency(metrics.averageOrderValue)}
        icon={ArrowTrendingUpIcon}
        colorPalette="purple"
        priority="critical"
      />
    </>
  );
}
```

#### Capability-Specific Metrics (Injected via HookPoint)

```typescript
// src/modules/fulfillment/onsite/manifest.tsx
export const onsiteManifest: ModuleManifest = {
  setup: async (registry) => {
    // Inyectar métricas de mesas solo si onsite está activo
    registry.addAction(
      'sales.metrics.primary',
      ({ salesData }) => (
        <>
          <MetricCard
            title="Mesas Activas"
            value={salesData.activeTables}
            icon={TableCellsIcon}
            colorPalette="teal"
            priority="high"
          />
          <MetricCard
            title="Ocupación"
            value={`${salesData.tableOccupancy}%`}
            icon={UsersIcon}
            colorPalette="cyan"
            priority="medium"
          />
        </>
      ),
      'onsite-fulfillment',
      80
    );
  }
};

// src/modules/fulfillment/delivery/manifest.tsx
export const deliveryManifest: ModuleManifest = {
  setup: async (registry) => {
    // Inyectar métricas de delivery solo si delivery está activo
    registry.addAction(
      'sales.metrics.primary',
      ({ salesData }) => (
        <>
          <MetricCard
            title="En Ruta"
            value={salesData.deliveriesInProgress}
            icon={TruckIcon}
            colorPalette="orange"
            priority="high"
          />
          <MetricCard
            title="Tiempo Entrega Promedio"
            value={`${salesData.avgDeliveryTime} min`}
            icon={ClockIcon}
            colorPalette="blue"
            priority="medium"
          />
        </>
      ),
      'delivery-fulfillment',
      75
    );
  }
};
```

#### Metrics Container (Uses HookPoint)

```typescript
// src/pages/admin/operations/sales/components/SalesMetricsContainer.tsx
export function SalesMetricsContainer({ metrics }: Props) {
  return (
    <Section as="aside" variant="flat" semanticHeading="Sales Metrics">
      <CardGrid columns={{ base: 1, sm: 2, lg: 5 }} gap="4">
        {/* Core metrics - ALWAYS VISIBLE */}
        <CoreMetrics metrics={metrics} />

        {/* Capability-specific metrics - INJECTED */}
        <HookPoint
          name="sales.metrics.primary"
          data={{ salesData: metrics }}
          fallback={null}
        />
      </CardGrid>
    </Section>
  );
}
```

### Metrics Displayed by Business Model

```
RESTAURANT (Onsite + Delivery):
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Revenue  │ │  Trans   │ │ Ticket   │ │  Mesas   │ │ En Ruta  │
│ $12,450  │ │   145    │ │  $85     │ │    8     │ │    5     │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
   CORE         CORE         CORE       ← ONSITE    ← DELIVERY

GYM (Appointments):
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Revenue  │ │  Trans   │ │ Ticket   │ │  Citas   │ │Asistencia│
│ $8,500   │ │    45    │ │  $189    │ │   Hoy    │ │    92%   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
   CORE         CORE         CORE      ← SCHEDULING

RENTAL (Equipment):
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Revenue  │ │  Trans   │ │ Ticket   │ │ Alquilado│ │Devolución│
│ $3,200   │ │    12    │ │  $267    │ │   Activo │ │   Hoy    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
   CORE         CORE         CORE       ← RENTAL     ← RENTAL
```

---

## 🎯 ADAPTIVE POS INTERFACE

### Current Problem

```typescript
// ❌ POS actual: Una sola interfaz para todos los tipos
<Button onClick={onNewSale}>Nueva Venta</Button>

// onNewSale abre modal genérico
// No distingue entre: Restaurant, Gym, Rental, Digital Product, etc.
```

### Proposed Solution: Context-Aware POS

#### 1. Context Detection

```typescript
// src/pages/admin/operations/sales/hooks/useBusinessContext.ts
export function useBusinessContext() {
  const { hasFeature } = useCapabilities();

  // Detectar contexto primario
  const primaryContext = useMemo(() => {
    if (hasFeature('sales_dine_in_orders')) return 'restaurant_onsite';
    if (hasFeature('sales_delivery_orders')) return 'restaurant_delivery';
    if (hasFeature('sales_appointments')) return 'appointments';
    if (hasFeature('sales_rentals')) return 'rentals';
    return 'generic_retail';
  }, [hasFeature]);

  return { primaryContext };
}
```

#### 2. Adaptive POS Component

```typescript
// src/pages/admin/operations/sales/components/AdaptivePOS.tsx
export function AdaptivePOS() {
  const { primaryContext } = useBusinessContext();

  // Context selector (si hay múltiples capabilities)
  const [activeContext, setActiveContext] = useState(primaryContext);

  return (
    <>
      {/* Context Selector */}
      <HookPoint
        name="sales.pos.context_selector"
        data={{ activeContext, onContextChange: setActiveContext }}
        fallback={null}
      />

      {/* Interfaz específica según contexto */}
      <POS variant={activeContext} />
    </>
  );
}
```

#### 3. Context Selector (Injected by Fulfillment Modules)

```typescript
// src/modules/fulfillment/onsite/manifest.tsx
registry.addAction(
  'sales.pos.context_selector',
  ({ activeContext, onContextChange }) => (
    <Button
      variant={activeContext === 'restaurant_onsite' ? 'solid' : 'outline'}
      onClick={() => onContextChange('restaurant_onsite')}
    >
      🍽️ Mesa
    </Button>
  ),
  'onsite-fulfillment',
  90
);

// src/modules/fulfillment/delivery/manifest.tsx
registry.addAction(
  'sales.pos.context_selector',
  ({ activeContext, onContextChange }) => (
    <Button
      variant={activeContext === 'restaurant_delivery' ? 'solid' : 'outline'}
      onClick={() => onContextChange('restaurant_delivery')}
    >
      🚚 Delivery
    </Button>
  ),
  'delivery-fulfillment',
  85
);

// src/modules/fulfillment/pickup/manifest.tsx
registry.addAction(
  'sales.pos.context_selector',
  ({ activeContext, onContextChange }) => (
    <Button
      variant={activeContext === 'pickup' ? 'solid' : 'outline'}
      onClick={() => onContextChange('pickup')}
    >
      🥡 TakeAway
    </Button>
  ),
  'pickup-fulfillment',
  80
);
```

#### 4. POS Variants

```typescript
// src/pages/admin/operations/sales/components/POS/variants.tsx
interface POSProps {
  variant: BusinessContext;
}

export function POS({ variant }: POSProps) {
  switch (variant) {
    case 'restaurant_onsite':
      return <RestaurantOnsitePOS />;
    case 'restaurant_delivery':
      return <RestaurantDeliveryPOS />;
    case 'appointments':
      return <AppointmentsPOS />;
    case 'rentals':
      return <RentalsPOS />;
    default:
      return <GenericPOS />;
  }
}
```

### POS Variants UI

#### Restaurant Onsite POS

```
┌────────────────────────────────────────────────┐
│ [🍽️ Mesa] [🚚 Delivery] [🥡 TakeAway]        │
├────────────────────────────────────────────────┤
│                                                 │
│ 1. Seleccionar Mesa                            │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│ │  1  │ │  2  │ │  3  │ │  4  │              │
│ │ 🟢  │ │ 🔴  │ │ 🟡  │ │ 🟢  │              │
│ └─────┘ └─────┘ └─────┘ └─────┘              │
│                                                 │
│ 2. Agregar Items (search + quick add)         │
│ 3. Confirmar y Enviar a Cocina                │
│                                                 │
└────────────────────────────────────────────────┘
```

#### Delivery POS

```
┌────────────────────────────────────────────────┐
│ [🍽️ Mesa] [🚚 Delivery] [🥡 TakeAway]        │
├────────────────────────────────────────────────┤
│                                                 │
│ 1. Información del Cliente                     │
│    Nombre: [____________]                      │
│    Teléfono: [____________]                    │
│    Dirección: [________________________]       │
│    Ubicación: [📍 Ver en Mapa]                │
│                                                 │
│ 2. Agregar Items                               │
│                                                 │
│ 3. Calcular Tiempo de Entrega                 │
│    Estimado: 45 min | Distancia: 3.2 km      │
│                                                 │
│ 4. Asignar Repartidor (opcional)              │
│    [Auto] [Juan Pérez ▼]                      │
│                                                 │
└────────────────────────────────────────────────┘
```

#### Appointments POS

```
┌────────────────────────────────────────────────┐
│ [🏋️ Appointments]                             │
├────────────────────────────────────────────────┤
│                                                 │
│ 1. Seleccionar Servicio                       │
│    [Entrenamiento Personal ▼]                 │
│                                                 │
│ 2. Seleccionar Fecha/Hora                     │
│    Fecha: [2025-12-11]                        │
│    Hora: [14:00 ▼] Duración: [60 min ▼]      │
│                                                 │
│ 3. Seleccionar Trainer (opcional)             │
│    [María López ▼]                            │
│                                                 │
│ 4. Cliente                                     │
│    [Buscar cliente o nuevo]                   │
│                                                 │
│ 5. Confirmar y Registrar                      │
│                                                 │
└────────────────────────────────────────────────┘
```

#### Rentals POS

```
┌────────────────────────────────────────────────┐
│ [📦 Rentals]                                   │
├────────────────────────────────────────────────┤
│                                                 │
│ 1. Seleccionar Item(s)                        │
│    [🎿 Esquís - Disponibles: 8]               │
│    [🥾 Botas - Disponibles: 12]               │
│                                                 │
│ 2. Período de Alquiler                        │
│    Desde: [2025-12-11 10:00]                  │
│    Hasta: [2025-12-13 18:00]                  │
│    Total: 2 días 8 horas                      │
│                                                 │
│ 3. Costo Calculado                            │
│    Esquís: $80/día × 2.33 días = $186.40     │
│    Botas: $30/día × 2.33 días = $69.90       │
│    ────────────────────────────────────        │
│    Total: $256.30                             │
│                                                 │
│ 4. Depósito Requerido                         │
│    [💳 $500] (reembolsable)                   │
│                                                 │
└────────────────────────────────────────────────┘
```

---

## 💰 SALES-CASH INTEGRATION UI

### Current State: Integration Exists in Code, Not in UI

**Backend Integration (✅ COMPLETE):**
- `src/modules/cash/handlers/salesPaymentHandler.ts` - Escucha `sales.payment.completed`
- `src/docs/cash/05-MODULE-INTEGRATION.md` - Documentación completa
- `database/migrations/20250210_cash_shift_integration.sql` - Schema listo

**Frontend Integration (❌ MISSING):**
- No se muestra sesión de caja activa
- No se ve monto en caja del empleado
- No hay botón de cierre de caja
- No se ven alertas de efectivo bajo

### Proposed UI Integration

#### 1. Cash Session Widget (Injected in Page Header)

```typescript
// src/modules/cash-management/widgets/CashSessionWidget.tsx
export function CashSessionWidget() {
  const { activeSessions } = useCashSessions();
  const currentUserSession = activeSessions.find(s => s.employee_id === currentUserId);

  if (!currentUserSession) {
    return (
      <Badge colorPalette="gray">
        💰 Sin caja asignada
      </Badge>
    );
  }

  return (
    <HStack
      p="3"
      bg="green.50"
      borderRadius="md"
      border="1px solid"
      borderColor="green.200"
      gap="4"
    >
      <Stack gap="1">
        <Text fontSize="xs" fontWeight="semibold" color="green.800">
          💰 Caja Activa
        </Text>
        <Text fontSize="sm" fontWeight="bold" color="green.600">
          {formatCurrency(currentUserSession.cash_sales)}
        </Text>
        <Text fontSize="xs" color="green.700">
          {currentUserSession.transactions_count} ventas
        </Text>
      </Stack>

      <Button
        size="sm"
        variant="outline"
        colorPalette="green"
        onClick={handleCloseCashSession}
      >
        Cerrar Caja
      </Button>
    </HStack>
  );
}

// Inyección en Sales page
// src/modules/cash-management/manifest.tsx
registry.addAction(
  'sales.cash_session_status',
  () => <CashSessionWidget key="cash-session-widget" />,
  'cash-management',
  100
);
```

#### 2. Cash Session Status in Page Layout

```
HEADER SECTION (NUEVO):
┌─────────────────────────────────────────────────────────────┐
│ Sales Management                                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 🟢 Turno: Mañana (Juan Pérez)    💰 Caja: María ($2,500)   │
│ Abierto: 8:00am                   12 ventas  [Cerrar Caja]  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
      ↑                                    ↑
   Shift Widget                    Cash Session Widget
(shift-control module)          (cash-management module)
```

#### 3. Cash Alerts Integration

```typescript
// src/modules/cash-management/components/CashAlerts.tsx
export function CashAlerts() {
  const { activeSessions } = useCashSessions();
  const alerts = useCashAlerts(activeSessions);

  return (
    <>
      {alerts.map(alert => (
        <Alert
          key={alert.id}
          status={alert.severity}
          title={alert.title}
        >
          {alert.message}
          {alert.action && (
            <Button size="sm" onClick={alert.action.handler}>
              {alert.action.label}
            </Button>
          )}
        </Alert>
      ))}
    </>
  );
}

// Ejemplos de alertas:
// ⚠️  Efectivo alto en caja (>$5,000) - Realizar retiro intermedio
// 🚨 Varianza detectada al cerrar turno anterior (-$50)
// ℹ️  Recuerda cerrar tu caja al finalizar turno
```

#### 4. Payment Flow with Cash Session

```typescript
// ModernPaymentProcessor (UPDATED)
async function processPayment(paymentData: PaymentData) {
  // ... procesamiento existente

  // Emitir evento con employee_id
  await EventBus.emit('sales.payment.completed', {
    ...paymentData,
    employeeId: currentUser.id,  // ← AGREGAR
    cashSessionId: activeCashSession?.id  // ← AGREGAR (si CASH)
  }, 'SalesModule');

  // Cash module automáticamente:
  // - Actualiza cash_session si es CASH
  // - Crea journal_entry
  // - Trackea a nivel shift si NO es CASH
}
```

---

## 📍 TAKEAWAY TOGGLE RELOCATION

### Current Location (Problematic)

```typescript
// src/modules/sales/manifest.tsx:172
registry.addAction(
  'sales.toolbar.actions',  // ← UBICACIÓN ACTUAL
  () => <TakeAwayToggle key="takeaway-toggle" />,
  'sales',
  90  // Alta prioridad → muy prominente
);
```

**Renderiza en:**
```
┌────────────────────────────────────────────────┐
│ Sales Management                                │
├────────────────────────────────────────────────┤
│                                                 │
│ [═══════════════════════════════════════════] │
│ │  🥡 TakeAway Público     [Toggle ON/OFF]  │ │ ← TOO PROMINENT
│ [═══════════════════════════════════════════] │
│                                                 │
│ (rest of page)                                 │
└────────────────────────────────────────────────┘
```

### Proposed Relocation Options

#### Option A: Shift Control Widget (RECOMMENDED)

**Justificación:**
- TakeAway es una configuración operacional de turno
- Se activa/desactiva durante operación
- Contexto correcto: control de turno

```typescript
// src/modules/shift-control/manifest.tsx
registry.addAction(
  'shift.operational_controls',  // ← NUEVA UBICACIÓN
  () => <TakeAwayToggle compact key="takeaway-toggle" />,
  'pickup-fulfillment',
  50
);
```

**Renderiza en:**
```
┌────────────────────────────────────────────────┐
│ 🟢 Turno Activo: Mañana (Juan Pérez)          │
├────────────────────────────────────────────────┤
│ Controles Operacionales:                       │
│ [🥡 TakeAway: ON]  [🍽️ Mesas: 8]  [...]      │
└────────────────────────────────────────────────┘
```

#### Option B: Settings Panel (Alternative)

**Justificación:**
- Es una configuración de negocio
- No necesita ser prominente
- Ubicación estándar para toggles

```typescript
// src/modules/sales/manifest.tsx
registry.addAction(
  'sales.configuration',  // ← NUEVA UBICACIÓN
  () => <TakeAwayToggle key="takeaway-toggle" />,
  'pickup-fulfillment',
  70
);
```

**Renderiza en:**
```
┌────────────────────────────────────────────────┐
│ Sales Management                                │
│ ... (métricas, POS) ...                        │
├────────────────────────────────────────────────┤
│ ⚙️ Configuración                               │
│ ├─ 🥡 TakeAway Público: [ON]                  │
│ ├─ 🚚 Delivery: [ON]                          │
│ └─ 🍽️ Dine-In: [ON]                          │
└────────────────────────────────────────────────┘
```

#### Option C: Context Selector (Variant)

**Justificación:**
- TakeAway es un contexto de venta
- Se selecciona al hacer nueva venta

```typescript
// Integrado en AdaptivePOS
<Button variant={context === 'takeaway' ? 'solid' : 'outline'}>
  🥡 TakeAway
</Button>
```

**Renderiza en:**
```
┌────────────────────────────────────────────────┐
│ POS - Nuevo Pedido                             │
├────────────────────────────────────────────────┤
│ [🍽️ Mesa] [🚚 Delivery] [🥡 TakeAway]        │
│                               ↑                 │
│                          Si está habilitado    │
└────────────────────────────────────────────────┘
```

### Recommended Approach: Hybrid

**Implementación Final:**

1. **Primary Location**: Shift Control Widget (Option A)
   - Visible durante operación
   - Contexto correcto (controles operacionales)
   - Menos prominente pero accesible

2. **Secondary Location**: Settings Panel (Option B)
   - Para configuración inicial/cambios permanentes
   - Documentación y ayuda contextual

3. **Implicit**: Context Selector (Option C)
   - TakeAway aparece como opción al hacer nueva venta
   - Solo si está habilitado globalmente

```typescript
// Implementation:
// 1. Remover de sales.toolbar.actions (demasiado prominente)
registry.removeAction('sales.toolbar.actions', 'takeaway-toggle');

// 2. Agregar a shift control
registry.addAction(
  'shift.operational_controls',
  () => <TakeAwayToggle compact variant="indicator" />,
  'pickup-fulfillment',
  50
);

// 3. Agregar a settings (configuración)
registry.addAction(
  'sales.configuration',
  () => <TakeAwayToggle variant="full" />,
  'pickup-fulfillment',
  70
);
```

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Foundation (Week 1)

**Goals:**
- Preparar infraestructura para UI adaptativa
- Definir nuevos hook points
- Refactorizar layout spacing

**Tasks:**
1. ✅ Crear nuevos hook points en `sales/manifest.tsx`
   - `sales.metrics.primary`
   - `sales.metrics.secondary`
   - `sales.pos.context_selector`
   - `sales.cash_session_status`
   - `sales.configuration`

2. ✅ Crear `useBusinessContext()` hook
   - Detectar capability primaria
   - Retornar contexto activo

3. ✅ Refactorizar `SalesPage.tsx` layout
   - Reducir paddings (120px → 16px)
   - Optimizar spacing entre sections
   - Compactar cards (200px → 120px)

4. ✅ Crear `PageHeader` component
   - Breadcrumb + Title
   - Shift status widget (placeholder)
   - Cash session widget (placeholder)

**Deliverables:**
- Hook points registrados
- Layout optimizado (60% info / 40% padding)
- Page header component funcional

**Testing:**
- Layout responsivo (mobile, tablet, desktop)
- Hook points funcionando
- No regresiones en funcionalidad existente

---

### Phase 2: Metrics System (Week 2)

**Goals:**
- Implementar métricas capability-aware
- Inyección dinámica funcional

**Tasks:**
1. ✅ Refactorizar `SalesMetrics.tsx`
   - Separar core metrics (Revenue, Trans, Ticket)
   - Usar HookPoint para métricas adicionales
   - Responsive grid

2. ✅ Implementar inyección en Onsite module
   ```typescript
   registry.addAction('sales.metrics.primary', () => (
     <MetricCard title="Mesas Activas" value={activeTables} />
   ), 'onsite', 80);
   ```

3. ✅ Implementar inyección en Delivery module
   ```typescript
   registry.addAction('sales.metrics.primary', () => (
     <MetricCard title="En Ruta" value={deliveriesInProgress} />
   ), 'delivery', 75);
   ```

4. ✅ Testing multi-capability
   - Solo Onsite → muestra Mesas
   - Solo Delivery → muestra En Ruta
   - Ambos → muestra ambos
   - Ninguno → solo core metrics

**Deliverables:**
- Metrics container usando HookPoint
- Onsite metrics inyectadas
- Delivery metrics inyectadas

**Testing:**
- Activar/desactivar capabilities
- Verificar métricas correctas aparecen/desaparecen
- Performance (re-renders)

---

### Phase 3: Adaptive POS (Week 2-3)

**Goals:**
- POS interface adaptativa funcional
- Context selector

**Tasks:**
1. ✅ Crear `AdaptivePOS.tsx` component
   - Detecta contexto primario
   - Renderiza variante correcta

2. ✅ Implementar `RestaurantOnsitePOS` variant
   - Table selection
   - Item selection
   - Send to kitchen

3. ✅ Implementar `RestaurantDeliveryPOS` variant
   - Customer info (nombre, dirección, teléfono)
   - Location picker
   - Delivery time calculator
   - Driver assignment

4. ✅ Implementar context selector
   - Onsite module inyecta botón "🍽️ Mesa"
   - Delivery module inyecta botón "🚚 Delivery"
   - Pickup module inyecta botón "🥡 TakeAway"

5. ✅ Integrar con SaleFormModal
   - Recibe `variant` prop
   - Renderiza campos específicos según variant
   - Validación específica por variant

**Deliverables:**
- AdaptivePOS funcionando
- 3 variantes implementadas (Onsite, Delivery, Generic)
- Context selector funcional

**Testing:**
- Cambiar entre contextos
- Validaciones específicas por contexto
- Flujo completo de venta por cada variante

---

### Phase 4: Cash Integration UI (Week 3)

**Goals:**
- Visibilidad de sesión de caja
- Alertas de efectivo
- Botón de cierre

**Tasks:**
1. ✅ Crear `CashSessionWidget.tsx`
   - Muestra sesión activa del usuario
   - Monto en caja
   - Número de ventas
   - Botón "Cerrar Caja"

2. ✅ Inyectar widget en Sales page
   ```typescript
   registry.addAction('sales.cash_session_status', () => (
     <CashSessionWidget />
   ), 'cash-management', 100);
   ```

3. ✅ Implementar `CashAlerts.tsx`
   - Efectivo alto (>$5000)
   - Varianza detectada
   - Recordatorio de cierre

4. ✅ Integrar ModernPaymentProcessor
   - Incluir `employeeId` en evento
   - Incluir `cashSessionId` si es CASH

**Deliverables:**
- Cash session widget visible en header
- Alertas de efectivo funcionando
- Payment flow actualizado

**Testing:**
- Abrir caja → widget aparece
- Realizar ventas CASH → monto actualiza
- Cerrar caja → widget desaparece
- Alertas disparan correctamente

---

### Phase 5: TakeAway Relocation (Week 3)

**Goals:**
- Reubicar TakeAway toggle
- Menor prominencia visual

**Tasks:**
1. ✅ Implementar `TakeAwayToggle` compact variant
   - Versión compacta para shift widget
   - Versión full para settings

2. ✅ Crear hook point `shift.operational_controls`
   ```typescript
   // shift-control/manifest.tsx
   registry.provide('shift.operational_controls');
   ```

3. ✅ Reubicar toggle
   - Remover de `sales.toolbar.actions`
   - Agregar a `shift.operational_controls` (compact)
   - Agregar a `sales.configuration` (full)

4. ✅ Update validación
   - Validar con achievements module
   - Sincronizar con capability real
   - Modal de setup requirements

**Deliverables:**
- TakeAway toggle reubicado
- 2 variantes (compact, full)
- Validación funcionando

**Testing:**
- Toggle en shift widget
- Toggle en settings
- Validación requirements
- Modal de setup

---

### Phase 6: Polish & Testing (Week 4)

**Goals:**
- Refinamiento UI/UX
- Testing comprehensivo
- Documentación

**Tasks:**
1. ✅ UI Polish
   - Spacing final adjustments
   - Color palette consistency
   - Animation/transitions
   - Loading states
   - Error states

2. ✅ Performance Optimization
   - Memoization (useCallback, useMemo)
   - Lazy loading
   - Code splitting
   - Bundle size check

3. ✅ Accessibility Audit
   - WCAG AA compliance
   - Keyboard navigation
   - Screen reader testing
   - Focus management

4. ✅ Cross-capability Testing
   - Restaurant (Onsite + Delivery)
   - Gym (Appointments)
   - Rental shop
   - Retail (Generic)

5. ✅ Documentation
   - Update README.md
   - Component documentation
   - Hook usage examples
   - Migration guide

**Deliverables:**
- Polished UI
- Performance optimizado
- Accessibility compliant
- Documentation completa

**Testing:**
- E2E tests
- Visual regression tests
- Performance benchmarks
- Accessibility scan

---

## ⚠️ RISK ANALYSIS

### High Risk

#### 1. Breaking Changes in POS Flow
**Risk**: Adaptive POS puede romper flujos existentes
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Feature flag para POS adaptativo
- Mantener POS genérico como fallback
- Testing exhaustivo de cada variante
- Rollback plan

#### 2. Metrics Performance Issues
**Risk**: HookPoint injection causa re-renders excesivos
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- Memoization aggressive (useCallback, useMemo)
- React.memo en MetricCard components
- Performance monitoring
- Lazy loading de widgets

### Medium Risk

#### 3. Cash Integration Bugs
**Risk**: Desincronización entre Sales y Cash
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Transacciones idempotentes
- Event replay capability
- Comprehensive logging
- Manual reconciliation UI

#### 4. Capability Detection Failures
**Risk**: useBusinessContext retorna contexto incorrecto
**Probability**: Low
**Impact**: High
**Mitigation**:
- Exhaustive capability testing
- Fallback a generic POS
- Admin override capability
- Debug mode visible

### Low Risk

#### 5. UI Regression
**Risk**: Nuevo layout rompe en mobile/tablet
**Probability**: Low
**Impact**: Medium
**Mitigation**:
- Responsive design desde inicio
- Visual regression tests
- Device testing matrix
- Incremental rollout

#### 6. TakeAway Toggle Confusion
**Risk**: Usuarios no encuentran toggle después de reubicación
**Probability**: Low
**Impact**: Low
**Mitigation**:
- In-app announcement
- Tooltip "Moved to Shift Controls"
- Documentation update
- Support tickets monitoring

---

## 📝 SUCCESS CRITERIA

### Functional Requirements
- ✅ Metrics react to active capabilities
- ✅ POS adapts to business context
- ✅ Cash session visible in UI
- ✅ TakeAway toggle relocated
- ✅ Spacing optimized (60% info / 40% padding)

### Performance Requirements
- ✅ Initial load: < 2s
- ✅ Metric updates: < 100ms
- ✅ Context switch: < 200ms
- ✅ Bundle size: < 500kb (increase from current)

### Accessibility Requirements
- ✅ WCAG AA compliant
- ✅ Keyboard navigation
- ✅ Screen reader compatible
- ✅ Focus indicators visible

### User Experience Requirements
- ✅ Mobile responsive
- ✅ Intuitive context switching
- ✅ Clear visual hierarchy
- ✅ Helpful error messages

---

## 📚 NEXT STEPS

1. **Review & Approval**
   - Present proposal to team
   - Gather feedback
   - Adjust priorities

2. **Prototype**
   - Create Figma mockups
   - Build interactive prototype
   - User testing session

3. **Implementation**
   - Follow phased plan (Weeks 1-4)
   - Daily standups
   - Weekly demos

4. **Launch**
   - Feature flag rollout
   - Gradual percentage (10% → 50% → 100%)
   - Monitor metrics & errors
   - Collect user feedback

---

**Document Status**: Draft v1.0
**Author**: G-Admin Team
**Date**: 2025-12-11
**Next Review**: After team approval
