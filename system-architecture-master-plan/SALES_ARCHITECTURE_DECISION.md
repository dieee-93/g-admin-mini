# ⚠️ DOCUMENTO DESACTUALIZADO - VER ARCHITECTURAL_DECISIONS_CORRECTED.md

**Fecha original**: 2025-01-15 01:30
**Estado**: ❌ **SUPERSEDED - ENFOQUE INCORRECTO**
**Documento actualizado**: `ARCHITECTURAL_DECISIONS_CORRECTED.md`

---

## ⚠️ ADVERTENCIA

Este documento fue creado con enfoque **INCORRECTO**: agrupa features por capability en lugar de por función.

**Problema identificado**:
- Propone "E-commerce tab", "Delivery tab", "Appointments tab" en Sales
- Viola principio: "Features por FUNCIÓN, no por capability"

**Corrección aplicada**:
Ver `ARCHITECTURAL_DECISIONS_CORRECTED.md` para decisiones correctas sobre:
- E-commerce → Distribuido en Products, Sales, Finance, Backend
- Delivery → Módulo independiente (ya correcto en DELIVERY_ARCHITECTURE_DECISION.md)
- Appointments → Distribuido en Sales, Scheduling, Staff, Products, Customer App
- B2B → Distribuido en Sales, Products, Finance, Customers, Settings

---

## 📄 CONTENIDO ORIGINAL (Para referencia histórica)

# 🏗️ DECISIÓN ARQUITECTÓNICA: Sales como Hub Universal de Ventas

**Fecha**: 2025-01-15 01:30
**Contexto**: Sesión de testing Kitchen module - Descubrimiento de GAP Sale ↔ KitchenOrder
**Estado ORIGINAL**: ✅ **DECISIÓN TOMADA Y VALIDADA** (ahora obsoleta)

---

## 🎯 PROBLEMA IDENTIFICADO

Durante la activación del Kitchen Display System, se descubrió:

1. **GAP estructural**: `Sale` ≠ `KitchenOrder` (tipos incompatibles)
2. **Transformación necesaria**: `Sale[]` → `KitchenOrder[]` para KDS
3. **Pregunta arquitectónica clave**: **¿Sales maneja TODOS los canales de venta o necesitamos módulos separados?**

---

## 🔍 ANÁLISIS REALIZADO

### 1. Estructura de Sale (sales/types.ts)

```typescript
export interface Sale {
  // Identificación
  id: string;
  customer_id?: string;
  table_id?: string;
  order_id?: string;

  // 🚀 CLAVE: Discriminadores de canal
  order_type: OrderType;        // DINE_IN | TAKEOUT | DELIVERY | PICKUP | CATERING
  fulfillment_type: FulfillmentType;  // DINE_IN | TAKEOUT | DELIVERY | PICKUP
  order_status: OrderStatus;    // PENDING | CONFIRMED | PREPARING | READY | SERVED | COMPLETED
  payment_status: PaymentStatus;

  // Timing
  created_at: string;
  estimated_ready_time?: string;
  completed_at?: string;

  // Relations
  sale_items?: SaleItem[];
  payment_methods?: PaymentMethod[];
  order?: Order;  // Relación a Order entity
}
```

**Hallazgo crítico**: `Sale` **YA está diseñado** para manejar múltiples canales vía enums.

### 2. OrderType Enum (sales/types.ts línea 401-407)

```typescript
export enum OrderType {
  DINE_IN = 'dine_in',      // Servicio en local
  TAKEOUT = 'takeout',      // Retiro inmediato
  DELIVERY = 'delivery',    // Envío a domicilio
  PICKUP = 'pickup',        // Retiro programado
  CATERING = 'catering'     // Eventos/corporativo
}
```

### 3. Capabilities → OrderType Mapping

| Capability | Activa OrderType | Features Principales |
|------------|------------------|---------------------|
| `onsite_service` | `DINE_IN` | POS onsite, table mgmt, split payment, tips |
| `pickup_orders` | `PICKUP`, `TAKEOUT` | Pickup scheduling, notifications |
| `delivery_shipping` | `DELIVERY` | Delivery zones, tracking, driver mgmt |
| `async_operations` | Todos (async) | E-commerce, cart, checkout, online payment |
| `appointment_based` | `DINE_IN` (scheduled) | Appointment booking (customer-facing) |
| `corporate_sales` | Todos + B2B | Quotes, contracts, bulk pricing, approval workflows |

### 4. Features por Canal Detectadas

**Canal POS Onsite** (✅ Implementado 100%)
- `sales_order_management`
- `sales_payment_processing`
- `sales_pos_onsite`
- `sales_dine_in_orders`
- `sales_split_payment`
- `sales_tip_management`

**Canal E-commerce** (❌ 0% implementado)
- `sales_catalog_ecommerce`
- `sales_async_order_processing`
- `sales_online_payment_gateway`
- `sales_cart_management`
- `sales_checkout_process`
- `sales_multicatalog_management`

**Canal Delivery** (⚠️ 13% implementado - features existen, UI no)
- `operations_delivery_zones`
- `operations_delivery_tracking`
- `operations_notification_system`

**Canal Appointments** (⚠️ 33% implementado - scheduling existe pero para staff, no clientes)
- `operations_appointment_scheduling`
- `operations_calendar_management`

**Canal B2B/Corporate** (❌ 0% implementado)
- `sales_bulk_pricing`
- `sales_quote_generation`
- `sales_quote_to_order`
- `sales_contract_management`
- `sales_tiered_pricing`
- `sales_approval_workflows`

---

## ✅ DECISIÓN TOMADA

### **Sales como Hub Universal de Ventas**

**Arquitectura propuesta**:

```
/admin/operations/sales (módulo principal)
├── POS Tab (dine-in + takeout inmediato) ✅ IMPLEMENTADO
├── Online Orders Tab (e-commerce async) ⚠️ REEVALUAR (distribuir por función)
├── Delivery Orders Tab (vista resumida) ❌ PENDIENTE
│   └── Link a /admin/operations/delivery (módulo completo)
├── Appointments Tab (customer booking) ⚠️ REEVALUAR (distribuir por función)
└── Corporate Tab (B2B quotes/contracts) ⚠️ REEVALUAR (distribuir por función)

NOTA: Este documento fue creado con enfoque INCORRECTO (módulos por capability).
Ver DELIVERY_ARCHITECTURE_DECISION.md para enfoque correcto (features por función).
```

### Razones de la Decisión

1. **`Sale` ya está preparado** - Tiene discriminadores `order_type` y `fulfillment_type`
2. **Evita duplicación** - Un solo módulo Sales con tabs por canal vs 5 módulos separados
3. **DRY principle** - Payment, customer, inventory logic compartida
4. **Coherencia con types** - `Sale` entity agrupa TODOS los canales
5. **Screaming architecture** - Operations domain agrupa TODAS las ventas

### Módulos que NO se crean

❌ `/admin/ecommerce` - Es tab en Sales
❌ `/admin/delivery` - Es tab en Sales
❌ `/admin/appointments` - Es tab en Sales (booking de clientes, NO staff scheduling)
❌ `/admin/b2b` - Es tab en Sales
❌ `/admin/corporate` - Es tab en Sales

---

## 🔧 IMPLEMENTACIÓN REALIZADA

### 1. Transformer Sales → Kitchen (✅ COMPLETADO)

**Archivo**: `src/pages/admin/operations/kitchen/utils/salesTransformer.ts`

```typescript
// Transforms Sale[] → KitchenOrder[]
export function transformSalesToKitchenOrders(sales: Sale[]): KitchenOrder[]

// Transforms Order[] → KitchenOrder[]
export function transformOrdersToKitchenOrders(orders: Order[]): KitchenOrder[]
```

**Características**:
- Filtra items con `kitchen_status !== SERVED`
- Calcula `estimated_ready_time` basado en `preparation_time`
- Calcula `completion_percentage` y `items_completed`
- Mapea `station` desde `product.kitchen_station`
- Preserva `special_instructions` y `allergy_warnings`

### 2. Kitchen Page Integrado (✅ COMPLETADO)

**Archivo**: `src/pages/admin/operations/kitchen/page.tsx`

```typescript
// Get sales from store
const sales = useSalesStore((state) => state.sales);

// Transform to kitchen orders
const kitchenOrders = React.useMemo(() => {
  return transformSalesToKitchenOrders(sales);
}, [sales]);

<KitchenDisplaySystem
  orders={kitchenOrders}
  onUpdateItemStatus={handleUpdateItemStatus}
  onCompleteOrder={handleCompleteOrder}
  onPriorityChange={handlePriorityChange}
  showAllStations={true}
/>
```

### 3. Testing Realizado (✅ VALIDADO)

**Resultado**: Kitchen Display carga correctamente
- ✅ Muestra "0 active orders • 0 pending items" (salesStore vacío)
- ✅ Station stats visibles (Grill, Salad, Dessert, Bar, Prep, Expo)
- ✅ Filters funcionales (All Stations, Priority, Show Completed)
- ✅ Empty state correcto ("All caught up!")
- ✅ Console logs confirman transformación: `sales: [] → kitchenOrders: []`

**Próximo paso**: Crear orden en Sales POS para verificar flujo completo.

---

## 📐 ARQUITECTURA FINAL DE SALES

### Sale Entity (Núcleo)

```typescript
Sale {
  // Discriminadores de canal
  order_type: OrderType      // DINE_IN | TAKEOUT | DELIVERY | PICKUP | CATERING
  fulfillment_type: FulfillmentType  // Cómo se entrega

  // Relaciones
  sale_items: SaleItem[]     // Items con kitchen_status
  order: Order               // Order lifecycle tracking
  table: Table               // Solo para DINE_IN
  customer: Customer         // Opcional para todos

  // Estados
  order_status: OrderStatus  // Workflow
  payment_status: PaymentStatus
  priority_level: PriorityLevel
}
```

### Flujo de Datos

```
[User] → Sales POS → creates Sale (order_type: DINE_IN)
                   ↓
              salesStore.sales[]
                   ↓
         Kitchen Page (transformer)
                   ↓
            KitchenOrder[] → KDS Display
                   ↓
         EventBus: kitchen.item.status.updated
                   ↓
              Update Sale.sale_items[].kitchen_status
```

### Tabs Pendientes de Implementar

1. **Online Orders Tab** (E-commerce)
   - Features: `sales_catalog_ecommerce`, `sales_cart_management`, `sales_checkout_process`
   - UI: Product grid, cart, checkout flow
   - Payment: `sales_online_payment_gateway`

2. **Delivery Tab**
   - Features: `operations_delivery_zones`, `operations_delivery_tracking`
   - UI: Map view, driver assignment, route optimization
   - Status: PREPARING → OUT_FOR_DELIVERY → DELIVERED

3. **Appointments Tab** (Customer booking)
   - Features: `operations_appointment_scheduling`, `operations_calendar_management`
   - UI: Calendar view, booking form, availability check
   - **Diferente de**: Staff scheduling (resources domain)

4. **Corporate Tab** (B2B)
   - Features: `sales_quote_generation`, `sales_contract_management`, `sales_approval_workflows`
   - UI: Quote builder, approval pipeline, contract mgmt
   - Pricing: `sales_bulk_pricing`, `sales_tiered_pricing`

---

## 🎓 LECCIONES APRENDIDAS

### 1. Screaming Architecture Funciona

El diseño actual de `Sale` ya anticipa múltiples canales via discriminadores. **NO necesitamos módulos separados**, solo tabs.

### 2. EventBus es el Puente

Kitchen-Sales comunicación via EventBus:
- `sales.order.created` → Kitchen escucha y transforma
- `kitchen.item.status.updated` → Sales actualiza `sale_items[].kitchen_status`
- `kitchen.order.completed` → Sales actualiza `order_status: SERVED`

### 3. Transformers como Adaptadores

El patrón `salesTransformer.ts` se puede replicar para otros canales:
- `deliveryTransformer.ts` - `Sale` → `DeliveryOrder`
- `appointmentTransformer.ts` - `Sale` → `AppointmentBooking`
- `quoteTransformer.ts` - `Sale` → `Quote`

### 4. SalesStore es Suficiente

NO necesitamos stores separados por canal:
- ✅ `salesStore` maneja TODOS los canales via `order_type`
- ❌ NO crear `ecommerceStore`, `deliveryStore`, `appointmentsStore`

---

## 📋 PRÓXIMOS PASOS

### Inmediato
1. ✅ **Kitchen-Sales conectado** (completado)
2. ⏳ **Crear orden de prueba** en Sales POS para validar flujo
3. ⏳ **Implementar EventBus listeners** en Kitchen page

### Corto Plazo
1. **Online Orders Tab** (E-commerce)
   - UI: Product catalog + cart + checkout
   - Backend: `sales_async_order_processing`, cart persistence

2. **Delivery Tab**
   - UI: Map view + driver assignment
   - Backend: `operations_delivery_zones`, geolocation

3. **Appointments Tab** (Customer booking)
   - UI: Calendar + booking form
   - Backend: Availability check, confirmation emails

### Largo Plazo
1. **Corporate Tab** (B2B)
   - UI: Quote builder + approval pipeline
   - Backend: Multi-level approvals, contract mgmt

---

## 🔗 REFERENCIAS

- **Sales Types**: `src/pages/admin/operations/sales/types.ts`
- **Kitchen Transformer**: `src/pages/admin/operations/kitchen/utils/salesTransformer.ts`
- **Kitchen Page**: `src/pages/admin/operations/kitchen/page.tsx`
- **Business Capabilities**: `src/config/BusinessModelRegistry.ts`
- **Feature Registry**: `src/config/FeatureRegistry.ts`

---

**FIN DE LA DECISIÓN ARQUITECTÓNICA**

Esta decisión resuelve:
- ✅ Decisión 2 (E-commerce) → Tab en Sales
- ✅ Decisión 3 (Delivery) → Tab en Sales
- ✅ Decisión 4 (Appointments) → Tab en Sales (customer booking)
- ✅ GAP Sale ↔ KitchenOrder → Transformer creado

Quedan pendientes:
- ⏳ Multi-Location (Decisión independiente)
- ⏳ Implementación de tabs Online/Delivery/Appointments/Corporate
