# 🚚 DECISIÓN ARQUITECTÓNICA: Delivery & Shipping Module

**Fecha**: 2025-01-15 02:30
**Contexto**: Análisis de separación de módulos siguiendo principio "Features por FUNCIÓN, no por capability"
**Estado**: ✅ **DECISIÓN TOMADA**

---

## 🎯 PROBLEMA PLANTEADO

**Pregunta inicial**: ¿Delivery es módulo separado, tab en Sales, o features distribuidas?

**Complejidad detectada**: Delivery tiene múltiples formas con workflows muy diferentes:
1. **Instant delivery** (0-60 min) - Restaurant, Rappi, Uber
2. **Same-day delivery** (scheduled 24h) - Motomensajería
3. **Programmed delivery** (24h+) - Scheduled future
4. **Shipping** (async) - OCA, Andreani, Correo Argentino

---

## 🔍 ANÁLISIS REALIZADO

### Taxonomía de Envíos

```
DELIVERY TYPES (por timing):
├── 1. Instant Delivery (0-60 min)
│   ├── Restaurant delivery (own drivers)
│   ├── Rappi/PedidosYa integration
│   └── Uber Direct
│
├── 2. Same-Day Delivery (scheduled within 24h)
│   ├── Scheduled time slots
│   └── Motomensajería local
│
├── 3. Next-Day/Programmed (24h+)
│   └── Scheduled future delivery
│
└── 4. Shipping (correo/paquetería - async)
    ├── OCA
    ├── Andreani
    ├── Correo Argentino
    └── International (DHL, FedEx)
```

### Comparación de Workflows

| Tipo | Tracking Real-Time | Route Optimization | Driver Assignment | Integration API | Complexity |
|------|-------------------|-------------------|------------------|----------------|------------|
| **Instant** | ✅ GPS live | ✅ Required | ✅ Internal drivers | Google Maps | 🔴 HIGH |
| **Same-Day** | ✅ GPS live | ✅ Required | ✅ Internal/3rd party | Google Maps + Rappi | 🔴 HIGH |
| **Programmed** | ⚠️ Status updates | ❌ No | ⚠️ Optional | - | 🟡 MEDIUM |
| **Shipping** | ⚠️ Tracking number | ❌ No | ❌ External | OCA/Andreani API | 🟢 LOW |

**Hallazgo crítico**: Workflows **instant/same-day** son completamente diferentes de **shipping**.
- Instant/Same-day = **Active fulfillment** (requiere coordinación real-time)
- Shipping = **Passive fulfillment** (entregado a carrier externo)

---

## 🏗️ OPCIONES EVALUADAS

### Opción A: Todo en Sales como "Delivery Orders" Tab
**Rechazada**

**Razón**:
- ❌ Sales ya tiene 15K lines + 3 tabs (POS, Analytics, Reports)
- ❌ Live tracking con GPS requiere UI compleja (full-screen map)
- ❌ Route optimization es lógica operativa, NO lógica de venta
- ❌ Violaría el límite de complejidad (nested tabs inevitable)

### Opción B: Dominio `/admin/logistics/`
**Rechazada (prematura)**

**Razón**:
- ⚠️ Logistics implica más scope (warehouses, inventory movement, multi-location)
- ⚠️ Crear dominio nuevo es decisión pesada
- ✅ Buena idea a futuro si crece

### Opción C: Módulo `/admin/operations/delivery` ✅
**SELECCIONADA**

**Razón**:
- ✅ Delivery es **operations** (fulfillment activo, como Kitchen)
- ✅ Requiere UI compleja específica (maps, GPS, route optimization)
- ✅ Lógica operativa independiente
- ✅ NO es capability, es **función operativa**
- ✅ Scope manejable y claro

### Opción D: Separar Delivery vs Shipping
**APROBADA COMO REFINAMIENTO**

```
/admin/operations/
└── delivery/       (instant + same-day - active fulfillment)
    ├── Live Tracking (GPS)
    ├── Route Optimization
    └── Driver Assignment

/admin/supply-chain/
└── shipping/       (programmed + carriers - passive fulfillment)
    ├── Carrier Integration (OCA, Andreani)
    ├── Shipping Labels
    └── Tracking Numbers
```

**Razón separación**:
- **Delivery** (instant/same-day) = Operations (coordinación real-time)
- **Shipping** (correo/paquetería) = Supply Chain (logística de productos)

---

## ✅ DECISIÓN FINAL

### Crear Módulo: `/admin/operations/delivery`

**Responsabilidades**:
- ✅ Live tracking con GPS en tiempo real
- ✅ Route optimization (algoritmo + visualización)
- ✅ Driver assignment operativo
- ✅ Delivery zones configuration
- ✅ Delivery analytics (ETA accuracy, driver performance)
- ✅ Integration con APIs (Google Maps, Rappi, Uber Direct)

**NO es responsable de**:
- ❌ Crear orders (eso es Sales con `fulfillment_type: DELIVERY`)
- ❌ Gestionar empleados (eso es Staff - drivers son empleados)
- ❌ Shipping con carriers (eso será Supply Chain > Shipping)

---

## 🔗 INTEGRACIÓN CROSS-MODULE

### Sales Module: "Delivery Orders" Tab

**Propósito**: Vista **resumida** de delivery orders con preview y quick actions

**UI Design**:
```tsx
// sales/components/DeliveryOrdersTab.tsx

<Section title="Delivery Orders" variant="elevated">
  <DeliveryOrdersList>
    {deliveryOrders.map(order => (
      <DeliveryOrderCard
        order={order}
        driver={order.driver}          // desde Staff
        route={order.route}            // desde Delivery
        customer={order.customer}      // desde Customers

        // Cross-module navigation
        onViewRoute={() => navigate('/admin/operations/delivery', { orderId })}
        onViewDriver={() => navigate('/admin/resources/staff', { driverId })}
        onViewCustomer={() => navigate('/admin/core/customers', { customerId })}
      >
        {/* Preview Components */}
        <Stack direction="row" gap="md">
          <DriverAvatar driver={order.driver} size="md" />
          <RouteMiniMap route={order.route} height="80px" width="120px" />
          <OrderSummary
            items={order.items}
            total={order.total}
            status={order.status}
          />
        </Stack>

        {/* Quick Actions (sin salir de Sales) */}
        <Button onClick={handleReassignDriver} variant="outline">
          Reasignar Repartidor
        </Button>
        <Button onClick={handleContactCustomer} variant="outline">
          Contactar Cliente
        </Button>
        <Button onClick={handleViewFullTracking} variant="solid">
          Ver Tracking Completo
        </Button>
      </DeliveryOrderCard>
    ))}
  </DeliveryOrdersList>
</Section>
```

**Características**:
- ✅ Vista lista con filtros (Active | Scheduled | Completed)
- ✅ Miniatura de ruta (mini-map component reutilizable)
- ✅ Avatar + nombre del repartidor
- ✅ Resumen de orden (items, total, status)
- ✅ Quick actions sin salir de Sales
- ✅ Hipervínculos a módulos origen (Delivery, Staff, Customers)

---

### Delivery Module: Vista Completa Operativa

**Propósito**: Control operativo total de deliveries en tiempo real

**UI Design**:
```tsx
// operations/delivery/page.tsx

<ContentLayout>
  <Tabs>
    {/* Tab 1: Live Map - Vista principal operativa */}
    <Tab value="live-map">
      <FullScreenMap height="calc(100vh - 200px)">
        {/* Marcadores de deliveries activos */}
        {activeDeliveries.map(delivery => (
          <DeliveryMarker
            key={delivery.id}
            position={delivery.currentLocation}
            driver={delivery.driver}
            order={delivery.order}
            route={delivery.optimizedRoute}
            eta={delivery.estimatedArrival}
            status={delivery.status}
          />
        ))}

        {/* Zonas de delivery */}
        {deliveryZones.map(zone => (
          <ZoneOverlay
            key={zone.id}
            boundaries={zone.boundaries}
            color={zone.color}
            active={zone.isActive}
          />
        ))}
      </FullScreenMap>

      {/* Sidebar con lista de deliveries activos */}
      <DeliverySidebar width="350px">
        <ActiveDeliveriesList
          deliveries={activeDeliveries}
          onSelectDelivery={handleSelectDelivery}
          onReassignDriver={handleReassignDriver}
        />
      </DeliverySidebar>
    </Tab>

    {/* Tab 2: Drivers - Vista de repartidores (link a Staff) */}
    <Tab value="drivers">
      <DriversOverview>
        {/* Vista rápida de drivers con link a Staff module */}
        <Alert status="info">
          Para gestión completa de repartidores, ve a
          <Link to="/admin/resources/staff?role=driver">Staff Management</Link>
        </Alert>

        {/* Vista operativa: disponibilidad, asignaciones, performance */}
        <DriversOperationalView
          drivers={availableDrivers}
          showAvailability={true}
          showCurrentAssignments={true}
        />
      </DriversOverview>
    </Tab>

    {/* Tab 3: Zones - Configuración de zonas de delivery */}
    <Tab value="zones">
      <DeliveryZonesConfig
        zones={deliveryZones}
        onCreateZone={handleCreateZone}
        onEditZone={handleEditZone}
        onToggleZone={handleToggleZone}
      >
        {/* Map editor para dibujar zonas */}
        <ZoneMapEditor />
      </DeliveryZonesConfig>
    </Tab>

    {/* Tab 4: Analytics - Métricas de delivery performance */}
    <Tab value="analytics">
      <DeliveryAnalytics>
        <MetricsCards>
          <MetricCard label="Avg Delivery Time" value="32 min" />
          <MetricCard label="On-Time Rate" value="94%" />
          <MetricCard label="Active Deliveries" value={activeCount} />
          <MetricCard label="ETA Accuracy" value="89%" />
        </MetricsCards>

        <DeliveryPerformanceCharts />
        <DriverPerformanceTable />
      </DeliveryAnalytics>
    </Tab>
  </Tabs>
</ContentLayout>
```

---

## 📊 DISTRIBUCIÓN DE FEATURES POR FUNCIÓN

| Feature | Función Real | Dónde Vive | UI Location |
|---------|--------------|------------|-------------|
| **Delivery Zones Config** | Configuración operativa | Delivery | `/admin/operations/delivery` (Zones tab) |
| **Live Tracking** | Monitoring real-time | Delivery | `/admin/operations/delivery` (Live Map tab) |
| **Route Optimization** | Algoritmo operativo | Delivery (service layer) | Backend service + visualization |
| **Driver Management** | RRHH | **Staff** (link desde Delivery) | `/admin/resources/staff?role=driver` |
| **Driver Assignment** | Operaciones | Delivery | `/admin/operations/delivery` (Live Map) |
| **Delivery Orders List** | Vista de ventas | **Sales** (Delivery tab) | `/admin/operations/sales` (tab) |
| **Customer Notifications** | Comunicación | EventBus integration | Automated via events |
| **Order Creation** | Venta | **Sales** | `/admin/operations/sales` (POS) |
| **Shipping Labels** (OCA) | Logística pasiva | **Shipping** (futuro) | `/admin/supply-chain/shipping` |

---

## 🎯 PRINCIPIOS APLICADOS

### ✅ Features por FUNCIÓN, NO por capability

**Correcto** (este documento):
- `delivery_tracking` → Delivery module (función: fulfillment operativo)
- `driver_assignment` → Delivery module (función: operations)
- `driver_management` → Staff module (función: RRHH)
- `order_creation` → Sales module (función: venta)
- `shipping_labels` → Shipping module (función: supply chain)

**Incorrecto** (lo que evitamos):
- ❌ Crear `/admin/delivery-capability` que agrupe TODO delivery
- ❌ Poner driver management en Delivery (es RRHH)
- ❌ Poner order creation en Delivery (es venta)

### ✅ Cross-Module Integration, NO Nested Tabs

**Correcto**:
- Sales tiene tab "Delivery Orders" con preview + links a Delivery/Staff/Customers
- Delivery tiene vista completa operativa
- Staff maneja drivers, Delivery solo asigna

**Incorrecto** (lo que evitamos):
- ❌ Sales → Delivery Orders → [Map, Drivers, Zones, Analytics] (4 nested tabs)

---

## 📋 RESPONSABILIDADES FINALES

### Sales Module
**Función**: Gestión de ventas y órdenes

- ✅ Crear orden con `fulfillment_type: DELIVERY`
- ✅ Mostrar **lista** de delivery orders
- ✅ Preview compacto (minimap, driver, status)
- ✅ Quick actions (contact, reassign)
- ✅ EventBus emit: `sales.order.created` con delivery data

**NO es responsable de**:
- ❌ Tracking real-time con GPS
- ❌ Route optimization
- ❌ Driver management (profiles, shifts)
- ❌ Zones configuration

---

### Delivery Module (`/admin/operations/delivery`)
**Función**: Fulfillment operativo con coordinación real-time

- ✅ Live tracking con GPS en mapa full-screen
- ✅ Route optimization (algoritmo + visualización)
- ✅ Driver assignment operativo (asignar delivery a driver disponible)
- ✅ Delivery zones configuration (crear/editar zonas)
- ✅ Delivery analytics (ETA accuracy, on-time rate, driver performance)
- ✅ Integration APIs (Google Maps, Rappi, Uber Direct)
- ✅ EventBus listen: `sales.order.created` (filtrar delivery orders)
- ✅ EventBus emit: `delivery.driver.assigned`, `delivery.status.updated`, `delivery.completed`

**NO es responsable de**:
- ❌ Crear orders (eso es Sales)
- ❌ Gestionar empleados (profiles, contracts, payroll → eso es Staff)
- ❌ Shipping con carriers externos (eso es Supply Chain > Shipping)

---

### Staff Module (`/admin/resources/staff`)
**Función**: Gestión de recursos humanos

- ✅ Driver profiles (datos personales, documentos, contratos)
- ✅ Availability y shifts
- ✅ Performance tracking (KPIs generales)
- ✅ Payroll integration
- ✅ Link desde Delivery: "Ver perfil completo en Staff"

**NO es responsable de**:
- ❌ Assignments operativos en tiempo real (eso es Delivery)
- ❌ Route optimization (eso es Delivery)

---

### Shipping Module (`/admin/supply-chain/shipping`) - FUTURO
**Función**: Logística pasiva con carriers externos

- ✅ Integration con OCA, Andreani, Correo Argentino
- ✅ Shipping label generation
- ✅ Tracking number management
- ✅ Returns management
- ✅ Bulk shipping (para e-commerce)

**Diferencia con Delivery**:
- Shipping = Passive (entregar a carrier y trackear con tracking number)
- Delivery = Active (GPS real-time, route optimization, propio driver)

---

## 🚀 IMPLEMENTACIÓN SUGERIDA

### Fase 1: Delivery Module Core (MVP)
1. Crear estructura `/admin/operations/delivery/`
2. Live Map tab con deliveries activos
3. Driver assignment básico
4. EventBus integration con Sales
5. Zones configuration simple

### Fase 2: Sales Integration
1. Crear "Delivery Orders" tab en Sales
2. Preview components (DriverAvatar, RouteMiniMap, OrderSummary)
3. Cross-module navigation
4. Quick actions

### Fase 3: Route Optimization
1. Google Maps Directions API integration
2. Route optimization algorithm
3. Multi-stop optimization
4. ETA calculation

### Fase 4: Advanced Features
1. Rappi/PedidosYa/Uber Direct integration
2. Driver app (mobile)
3. Customer tracking link
4. Analytics dashboard

### Fase 5: Shipping Module (Separate)
1. Crear `/admin/supply-chain/shipping/`
2. OCA/Andreani integration
3. Label printing
4. Tracking management

---

## 📚 DOCUMENTOS RELACIONADOS

- `CONTINUITY_PROMPT.md` - Contexto general del análisis arquitectónico
- `SALES_ARCHITECTURE_DECISION.md` - Decisión sobre Sales como hub universal (CORREGIDA)
- `HUB_MIGRATION_COMPLETED.md` - Eliminación de Operations Hub
- `FEATURE_TO_MODULE_MAPPING.md` - Mapeo original de features (actualizar con esta decisión)

---

## 🔄 ACTUALIZACIONES NECESARIAS

### Corregir `SALES_ARCHITECTURE_DECISION.md`
- ❌ Eliminar propuesta de "Delivery Tab en Sales" como vista completa
- ✅ Actualizar a "Delivery Orders Tab" como vista resumida con cross-module links
- ✅ Documentar que Delivery es módulo separado en Operations

### Actualizar `CONTINUITY_PROMPT.md`
- ✅ Marcar Decisión 2 (Delivery) como RESUELTA
- ✅ Agregar principio: "Active vs Passive fulfillment determina separación"

### Actualizar `FEATURE_TO_MODULE_MAPPING.md`
- ✅ Delivery features → `/admin/operations/delivery`
- ✅ Shipping features → `/admin/supply-chain/shipping` (futuro)
- ✅ Driver management → Staff (con link desde Delivery)

---

**FIN DE LA DECISIÓN ARQUITECTÓNICA**

Esta decisión resuelve:
- ✅ Decisión 2 (Delivery Management) → **Módulo `/admin/operations/delivery`**
- ✅ Principio "Features por FUNCIÓN" aplicado correctamente
- ✅ Cross-module integration diseñada (Sales ↔ Delivery ↔ Staff)
- ✅ Separación Active (Delivery) vs Passive (Shipping) fulfillment
- ✅ Nested tabs evitados (Sales tiene preview, Delivery tiene vista completa)

Quedan pendientes:
- ⏳ E-commerce features (distribuir por función)
- ⏳ Appointments features (distribuir por función)
- ⏳ B2B features (YA distribuidas correctamente)
- ⏳ Multi-Location (análisis separado)
