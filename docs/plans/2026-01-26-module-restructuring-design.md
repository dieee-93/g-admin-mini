# Module Restructuring Design - G-Admin Mini

**Fecha**: 2026-01-26
**Status**: ✅ Diseño Validado
**Objetivo**: Reorganizar estructura de dominios y módulos para mejorar cohesión, eliminar antipatrrones, y optimizar arquitectura

---

## Contexto

### Problemas Detectados en Estructura Actual (31 módulos, 9 dominios)

1. **Inconsistencia en criterio de agrupación**: Dominios agrupan por criterios diferentes (método de entrega, tipo de operación, actividad)
2. **Antipatrón: Dominio con 1 módulo** (SALES) sugiere sobre-fragmentación
3. **Separación artificial**: CATALOG vs INVENTORY ambos gestionan productos/materiales
4. **Submódulos con manifest**: `fulfillment/delivery/manifest.tsx` crea complejidad innecesaria
5. **Fragmentación excesiva**: 9 dominios para 25 módulos (ratio 2.7:1 es bajo)
6. **Duplicaciones**: `staff/` y `team/` con misma ruta; `cash/` y `cash-management/`
7. **Módulos legacy sin metadata**: `cash/`, `achievements/`, `mobile/`
8. **Finance fragmentado**: 6 módulos financieros poco consolidados
9. **Analytics centralizado**: Módulos `reporting/`, `intelligence/`, `executive/` van contra paradigma modular

---

## Principios Arquitectónicos Fundamentales

### 1. Módulos Amplios + UI Adaptativa

Los módulos son **generales y abstractos** (ej: `production` sirve para comida, manufactura, servicios). La interfaz se adapta dinámicamente según las **capabilities activas**.

**Beneficios:**
- Evita proliferación de módulos especializados
- Reduce duplicación de código
- UI contextual inteligente (no "genérica mala")

**Ejemplo:** Cuando un usuario activa capability `B2B`, no se crea módulo nuevo. En su lugar, `sales/`, `products/`, `customers/` muestran features adicionales (cotizaciones, precios tiered, términos de pago).

---

### 2. Analytics Distribuido

**NO existe módulo centralizado de "Reporting" o "Analytics"**. Cada módulo es responsable de sus propios reportes y análisis.

**Distribución:**
- `sales/` → Dashboards de ventas, revenue, conversión
- `materials/` → ABC analysis, stock trends, supplier performance
- `customers/` → Segmentación RFM, lifetime value, cohorts
- `products/` → Menu engineering, profitabilidad, popularidad

El dashboard principal agrega widgets de múltiples módulos vía **HookPoints**.

---

### 3. Cohesión Conceptual en Dominios

Los dominios agrupan módulos por **"naturaleza de la actividad"**, no por características técnicas. Cada dominio responde a una pregunta clara del negocio:

| Dominio | Pregunta del Negocio |
|---------|----------------------|
| CORE | ¿Cómo arranco y configuro el sistema? |
| SALES & FULFILLMENT | ¿Cómo vendo y entrego al cliente? |
| INVENTORY | ¿Qué tengo disponible para vender/usar? |
| FINANCE | ¿Cómo manejo el dinero? |
| PEOPLE | ¿Quién trabaja y cuándo? |
| MARKETING | ¿Cómo atraigo y retengo clientes? |

---

### 4. Decisión sobre Submódulos

Los subdirectorios (ej: `sales/b2b/`, `materials/procurement/`) son **SOLO carpetas organizacionales de código**, NO módulos independientes.

**Regla:**
- ✅ Un solo `manifest.tsx` por módulo padre
- ❌ NO crear submódulos con manifest propio (antipatrón detectado en fulfillment)

---

## Estructura Final: 7 Dominios, 25 Módulos

### 1. CORE (4 módulos)
Sistema transversal, siempre activo, infraestructura operativa.

| Código | UI (español) | Propósito |
|--------|--------------|-----------|
| `dashboard` | "Panel Principal" | Vista unificada, widgets via HookPoints |
| `settings` | "Configuración" | Settings del sistema, business config |
| `achievements` | "Progreso del Sistema" | Onboarding, objetivos obligatorios/sugeridos/acumulativos |
| `shift-control` | "ShiftHub" | Orquestador operativo: apertura/cierre de jornada, arqueos |

**Ruta:** `/admin/dashboard`, `/admin/settings`, `/admin/achievements`, `/admin/shift-control`

---

### 2. SALES & FULFILLMENT (7 módulos)
Del pedido al cliente: vender, producir, entregar.

| Código | UI (español) | Propósito |
|--------|--------------|-----------|
| `sales` | "Ventas" | POS, checkout, órdenes (B2B/ecommerce via capabilities) |
| `storefront` | "Tienda" | Configuración de menú/catálogo visible al cliente |
| `production` | "Centro de Producción" | Manufactura, preparación, KDS (absorbe kitchen) |
| `delivery` | "Delivery" 🏍️ | Entregas con motos/repartidores propios |
| `shipping` | "Envíos por Correo" | Couriers externos, correo, flete |
| `onsite` | "Salón y Mesas" | Gestión de mesas, servicio en local |
| `pickup` | "Take Away" | Retiro en local |

**Rutas:** `/admin/sales/*`

**Notas:**
- `storefront` es **NUEVO**
- `production` absorbe código útil de `kitchen/` (deprecado)
- `shipping` es **NUEVO** (envíos por servicios externos)

---

### 3. INVENTORY (5 módulos)
Gestión de stock, productos, insumos, proveedores.

| Código | UI (español) | Propósito |
|--------|--------------|-----------|
| `products` | "Productos" | Catálogo universal (físicos, servicios, digitales, rentals) |
| `materials` | "Materiales" | Materias primas, stock (countable/measurable/elaborated) |
| `suppliers` | "Proveedores" | Gestión de proveedores |
| `recipe` | "Recetas" | RecipeBuilder Full (BOM, recetas para products/materials) |
| `assets` | "Activos Fijos" | Equipos internos (hornos, mobiliario, maquinaria) |

**Rutas:** `/admin/inventory/*`

**Notas:**
- Rental assets son **productos especiales** en `products` (capability `rentals` activa features)
- `recipe` es módulo standalone con interfaz completa (RecipeBuilder Lite embebido en formularios)
- Domain renombrado de `supply-chain` → `inventory`

---

### 4. FINANCE (3 módulos)
Gestión de dinero: contabilidad, facturación, cobros.

| Código | UI (español) | Propósito |
|--------|--------------|-----------|
| `accounting` | "Contabilidad" | Sesiones de caja, arqueos, movimientos, balance |
| `billing` | "Facturación e Impuestos" | Facturación recurrente, documentos fiscales, AFIP |
| `payment-gateways` | "Medios de Pago" | MercadoPago, MODO, webhooks, QR interoperable |

**Rutas:** `/admin/finance/*`

**Consolidación:** 6 módulos actuales → 3 módulos optimizados
- `accounting` fusiona: `cash-management` + `cash/` (legacy)
- `billing` fusiona: `finance-billing` + `finance-fiscal`
- `payment-gateways` renombra: `finance-integrations`

---

### 5. PEOPLE (2 módulos)
Gestión de recursos humanos.

| Código | UI (español) | Propósito |
|--------|--------------|-----------|
| `staff` | "Personal" | Empleados, roles, permisos, performance |
| `scheduling` | "Turnos y Horarios" | Turnos, disponibilidad, timeoff, labor costs |

**Rutas:** `/admin/people/*`

**Nota:** Eliminar módulo `team/` (duplicado de `staff`, misma ruta)

---

### 6. MARKETING (4 módulos)
Atracción, retención y fidelización de clientes.

| Código | UI (español) | Propósito |
|--------|--------------|-----------|
| `customers` | "Clientes" | CRM universal (retail, miembros, B2B, todos los tipos) |
| `loyalty` | "Fidelización" | Puntos, rewards, programas de lealtad |
| `campaigns` | "Campañas" | Promociones personalizadas, cupones |
| `social` | "Redes Sociales" | Integración redes sociales |

**Rutas:** `/admin/marketing/*`

**Notas:**
- `loyalty` renombra `gamification`
- `campaigns` y `social` son **NUEVOS** (migrar código existente o placeholder)
- Eliminar módulo `memberships` (ver sección "Capabilities")

---

### Resumen Cuantitativo

| Dominio | Módulos | % del Total |
|---------|---------|-------------|
| CORE | 4 | 16% |
| SALES & FULFILLMENT | 7 | 28% |
| INVENTORY | 5 | 20% |
| FINANCE | 3 | 12% |
| PEOPLE | 2 | 8% |
| MARKETING | 4 | 16% |
| **TOTAL** | **25** | **100%** |

**Ratio promedio:** 3.6 módulos por dominio (saludable, rango óptimo: 3-6)

---

## Plan de Migración: De 31 a 25 Módulos

### FASE 1: ELIMINAR (12 módulos/manifests deprecados)

| Módulo actual | Razón | Destino del código útil |
|---------------|-------|-------------------------|
| `kitchen/` | Deprecado, reemplazado por `production` | Migrar código útil a `production/` |
| `fulfillment/` (parent manifest) | Concepto eliminado, no es módulo | - |
| `fulfillment/delivery/manifest.tsx` | Submódulo con manifest (antipatrón) | Promover a `delivery/` top-level |
| `fulfillment/onsite/manifest.tsx` | Submódulo con manifest (antipatrón) | Promover a `onsite/` top-level |
| `fulfillment/pickup/manifest.tsx` | Submódulo con manifest (antipatrón) | Promover a `pickup/` top-level |
| `memberships/` | Capability, no módulo | Distribuir en `customers`, `products`, `billing` |
| `reporting/` | Analytics debe ser distribuido | Migrar reportes a módulos correspondientes |
| `intelligence/` | Analytics debe ser distribuido | Migrar a módulos correspondientes |
| `executive/` | Analytics debe ser distribuido | Revisar si hay código útil |
| `team/` | Duplicado de `staff` | Eliminar (misma ruta `/admin/resources/team`) |
| `cash/` | Legacy sin route/domain | Eliminar (reemplazado por `cash-management`) |
| `finance-corporate/` | Casi vacío | Eliminar |

**Total eliminados:** 12 módulos/manifests

**Acciones concretas:**
1. Auditar código antes de eliminar (buscar lógica reutilizable)
2. Migrar servicios/utilidades útiles a nuevos módulos
3. Actualizar imports en toda la codebase
4. Eliminar carpetas y manifests
5. Limpiar registros en `ModuleRegistry`

---

### FASE 2: RENOMBRAR (5 módulos)

| Nombre actual | Nombre nuevo (código) | Nombre nuevo (UI) | Razón |
|---------------|----------------------|-------------------|-------|
| `gamification/` | `loyalty/` | "Fidelización" | Más claro y comercial |
| `cash-management/` | `accounting/` | "Contabilidad" | Consolidación Finance |
| `finance-billing/` | `billing/` | "Facturación e Impuestos" | Consolidación Finance (absorbe fiscal) |
| `finance-integrations/` | `payment-gateways/` | "Medios de Pago" | Más descriptivo |
| Domain: `supply-chain/` | Domain: `inventory/` | "Inventario" | Más claro |

**Acciones concretas:**
1. Renombrar carpetas en `src/modules/`
2. Actualizar `manifest.tsx` (id, domain, route)
3. Actualizar imports en toda la codebase (usar buscar/reemplazar global)
4. Actualizar `ModuleRegistry` y `routeMap.ts`
5. Actualizar rutas en navegación y permisos

---

### FASE 3: CREAR (4 módulos nuevos)

| Módulo | Dominio | Propósito | Estado Inicial |
|--------|---------|-----------|----------------|
| `storefront/` | SALES & FULFILLMENT | Configuración de tienda/menú | Placeholder con manifest |
| `shipping/` | SALES & FULFILLMENT | Envíos por correo/flete/couriers | Implementación básica |
| `campaigns/` | MARKETING | Promociones personalizadas | Migrar código existente |
| `social/` | MARKETING | Redes sociales | Placeholder con manifest |

**Acciones concretas:**
1. Crear estructura de carpetas `src/modules/{nombre}/`
2. Crear `manifest.tsx` con metadata básica
3. Crear componente placeholder o migrar código existente
4. Registrar en `ModuleRegistry`
5. Agregar rutas en `routeMap.ts`

---

### FASE 4: CONSOLIDAR Finance (6 → 3 módulos)

#### Estado actual: 6 módulos financieros fragmentados
```
finance/
├── finance-billing         → Facturación recurrente, suscripciones
├── finance-fiscal          → Impuestos, AFIP, documentos fiscales
├── finance-integrations    → MercadoPago, MODO, gateways
├── finance-corporate       → Casi vacío
├── cash-management/        → Sesiones de caja, arqueos
└── cash/                   → Legacy (sin route, sin domain)
```

#### Estado objetivo: 3 módulos consolidados
```
finance/
├── accounting              → Fusiona: cash-management + cash (legacy)
│   └── Responsable: Sesiones de caja, arqueos, movimientos, balance, contabilidad general
│
├── billing                 → Fusiona: finance-billing + finance-fiscal
│   └── Responsable: Facturación recurrente, documentos fiscales, impuestos, AFIP
│
└── payment-gateways        → Renombra: finance-integrations
    └── Responsable: MercadoPago, MODO, webhooks, QR interoperable
```

#### Plan de consolidación detallado:

**1. Consolidar `accounting`:**
```
1. Crear `src/modules/finance/accounting/` con estructura:
   - manifest.tsx
   - components/
   - services/
   - hooks/
   - types/

2. Migrar de cash-management/:
   - services/cashSessionService.ts → accounting/services/
   - components/CashSessionManager.tsx → accounting/components/
   - hooks/useCashSession.ts → accounting/hooks/

3. Revisar cash/ (legacy):
   - Auditar código útil
   - Migrar servicios no duplicados
   - Eliminar carpeta cash/

4. Actualizar imports en toda la codebase
5. Eliminar cash-management/
```

**2. Consolidar `billing`:**
```
1. Crear src/modules/finance/billing/ con estructura base

2. Migrar de finance-billing/:
   - Facturación recurrente
   - Gestión de suscripciones
   - Componentes de billing

3. Migrar de finance-fiscal/:
   - Documentos fiscales (facturas A, B, C)
   - Integración AFIP
   - Cálculos de impuestos
   - Componentes fiscales

4. Fusionar servicios relacionados:
   - billingApi.ts + fiscalApi.ts → billing/services/
   - Consolidar types

5. Actualizar imports
6. Eliminar finance-billing/ y finance-fiscal/
```

**3. Renombrar `payment-gateways`:**
```
1. Renombrar carpeta:
   finance-integrations/ → payment-gateways/

2. Actualizar manifest.tsx:
   - id: 'payment-gateways'
   - route: '/admin/finance/payment-gateways'

3. Actualizar imports
```

---

## TODOs: Deudas Técnicas Identificadas

### 1. Rentals - Diseño completo pendiente 🔴 Alta prioridad

**Situación actual:**
- Módulo `rentals/` existe pero incompleto
- Decisión arquitectónica: Rental assets = productos especiales en `products`

**Tareas pendientes:**
- [ ] Investigar lógica actual de `rentals/` (qué código existe)
- [ ] Diseñar UI en `products` para equipos alquilables:
  - Tipo de producto "Rental Asset"
  - Configuración de disponibilidad temporal (calendario)
  - Precios por hora/día/semana/mes
  - Configuración de depósitos y penalidades por daños
- [ ] Definir settings de configuración en módulo `settings`:
  - Políticas de alquiler (duración mínima/máxima)
  - Penalidades por retraso/daño
  - Workflow de devoluciones
- [ ] Decidir si necesita módulo auxiliar para gestión de préstamos activos:
  - Tracking de préstamos en curso
  - Alertas de vencimiento
  - Gestión de devoluciones y mantenimiento post-devolución
- [ ] Considerar aspectos operativos:
  - Disponibilidad temporal (reservas futuras)
  - Reservas vs alquileres confirmados
  - Devoluciones parciales/totales
  - Mantenimiento entre alquileres
  - Estados del asset (disponible, alquilado, en mantenimiento, dañado)

**Impacto en módulos:**
- `products/`: UI extendida para tipo "rental"
- `sales/`: Calendario de disponibilidad, cálculo por duración
- `inventory/`: Tracking de estado de rental assets

---

### 2. B2B y E-commerce - Arquitectura adaptativa 🔴 Alta prioridad

**Situación actual:**
- `sales/b2b/` y `sales/ecommerce/` son carpetas organizacionales
- Código construido con prompt simple "agregar soporte B2B", no diseñado arquitectónicamente
- Capabilities activan estas funciones, pero diseño incompleto y mezclado

**Tareas pendientes:**
- [ ] Auditar código actual de `sales/b2b/`:
  - QuoteBuilder
  - TieredPricingService
  - Funciones específicas B2B
- [ ] Auditar código actual de `sales/ecommerce/`:
  - CartService
  - CheckoutService
  - OrderService
  - Catálogos online
- [ ] Diseñar cómo capabilities B2B/ecommerce adaptan cada módulo:

  **`sales/`:**
  - B2B: Cotizaciones, términos de pago, precios por volumen
  - Ecommerce: Carritos persistentes, checkout online, order tracking

  **`products/`:**
  - B2B: Catálogos segmentados, precios tiered, MOQ
  - Ecommerce: Catálogos públicos, SEO, reviews

  **`customers/`:**
  - B2B: Clientes corporativos (CUIT, razón social), múltiples contactos, límites de crédito
  - Ecommerce: Clientes online, direcciones múltiples, wishlist

  **`storefront/`:**
  - B2B: Portal de cliente con historial de órdenes, re-order fácil
  - Ecommerce: Tienda pública, carrito, checkout

- [ ] Definir settings específicos por capability:
  - B2B: Términos de pago, descuentos por volumen, aprobaciones
  - Ecommerce: Gateway de pago, shipping methods, políticas de devolución

- [ ] Documentar patrón para futuras capabilities similares:
  - Cómo agregar UI condicional
  - Cómo estructurar código en subcarpetas
  - Cómo validar capabilities en servicios

**Objetivo:** Convertir código "ad-hoc" en arquitectura bien diseñada y reutilizable.

---

### 3. Production - Migrar código de Kitchen 🟡 Media prioridad

**Tareas pendientes:**
- [ ] Auditar código útil en `production/kitchen/`:
  - KitchenDisplay component
  - Order preparation logic
  - Status tracking
  - Ticket printing
- [ ] Identificar componentes reutilizables vs específicos de restaurant
- [ ] Migrar a `production/` con adaptaciones:
  - Renombrar componentes (KitchenDisplay → ProductionDisplay)
  - Generalizar terminología (order → production order, ticket → work order)
  - Adaptar para múltiples contextos vía capabilities
- [ ] Eliminar `production/kitchen/` cuando migración complete
- [ ] Actualizar imports y referencias

---

### 4. Analytics distribuido 🟡 Media prioridad

**Tareas pendientes:**
- [ ] Auditar código en `reporting/`, `intelligence/`, `executive/`:
  - Identificar reportes y analytics útiles
  - Clasificar por dominio correspondiente
  - Detectar código obsoleto o duplicado

- [ ] Distribuir en módulos correspondientes:
  - **Sales analytics** → `sales/components/analytics/`
    - Revenue reports, conversion rates, sales trends
  - **Inventory analytics** → `materials/`, `products/`
    - ABC analysis, stock trends, supplier performance
    - Menu engineering, profitability analysis
  - **Customer analytics** → `customers/`
    - RFM analysis, segmentation, lifetime value
  - **Finance analytics** → `accounting/`, `billing/`
    - Cash flow, P&L, balance sheet
  - **Staff analytics** → `staff/`, `scheduling/`
    - Labor costs, productivity, scheduling efficiency

- [ ] Documentar patrón de analytics por módulo:
  - Estructura de carpetas: `{module}/components/analytics/`
  - Naming conventions
  - Cómo exponer vía HookPoints para dashboard principal

- [ ] Eliminar módulos centralizados cuando migración complete:
  - `reporting/`
  - `intelligence/`
  - `executive/`

---

### 5. Storefront - Implementación inicial 🟢 Baja prioridad

**Tareas pendientes:**
- [ ] Crear módulo `storefront/` como placeholder:
  - Manifest básico
  - Componente inicial vacío
  - Estructura de carpetas

- [ ] Definir settings básicos (primera versión):
  - Nombre de tienda
  - Logo y branding
  - Información de contacto
  - Horarios de atención

- [ ] Integrar con `products` para mostrar catálogo:
  - API para obtener productos públicos
  - Filtros y búsqueda
  - Vistas: grid, list, categories

- [ ] Considerar capabilities:
  - **Ecommerce**: Checkout online, carrito, payment gateway
  - **Onsite**: Menú digital para QR en mesas
  - **Takeaway**: Menú para pickup, order ahead

- [ ] Diseño responsive (mobile-first)

**Nota:** Este módulo será clave para capabilities ecommerce y onsite ordering.

---

### 6. Marketing modules - Campaigns y Social 🟢 Baja prioridad

**Campaigns:**
- [ ] Buscar código existente de promociones/cupones en codebase
- [ ] Crear módulo `campaigns/` con funcionalidad básica:
  - CRUD de campañas
  - Tipos: descuentos, cupones, 2x1, combos
  - Reglas de aplicación (productos, clientes, fechas)
  - Tracking de uso
- [ ] Integrar con `sales` para aplicar promociones en checkout
- [ ] Dashboard de performance de campañas

**Social:**
- [ ] Crear módulo `social/` como placeholder
- [ ] Definir integraciones futuras:
  - Facebook/Instagram: Posts, stories, catalog sync
  - WhatsApp Business: Mensajería, catálogo
  - Google My Business: Reviews, info
- [ ] Roadmap de funcionalidades:
  - Publicación programada
  - Analytics de redes
  - Social listening

---

## Impacto en Sistema de Capabilities

### Paradigma: Capabilities → Features → Módulos

**3 capas del sistema:**

1. **Capabilities (12)**: Usuario selecciona modelo de negocio
   *Ejemplos: Restaurant, Retail, B2B, E-commerce, Memberships, Rentals*

2. **Features (88)**: Flags granulares que se activan según capabilities
   *Ejemplos: `sales.b2b.quotes`, `products.membership_plans`, `customers.rfm_analysis`*

3. **Módulos (25)**: Implementaciones de negocio que reaccionan a features
   *Los módulos son amplios y se adaptan. NO se crean módulos nuevos por cada capability.*

---

### Ejemplo 1: Capability "B2B" activa

#### Módulos que se adaptan:

**`sales/` muestra:**
- ✅ Tab "Cotizaciones" (quotes)
- ✅ Precios por volumen (tiered pricing)
- ✅ Términos de pago (payment terms: net 30, net 60)
- ✅ Orden mínima (MOQ - minimum order quantity)
- ❌ OCULTA: Opciones de propina (tips) - no aplican en B2B

**`customers/` muestra:**
- ✅ Campos corporativos: CUIT, razón social, industria
- ✅ Múltiples contactos por empresa (comprador, finanzas, operaciones)
- ✅ Límites de crédito y términos de pago configurables
- ✅ Historial de cotizaciones y órdenes
- ❌ OCULTA: Programa de puntos retail

**`products/` muestra:**
- ✅ Catálogos segmentados (B2B vs retail)
- ✅ Configuración de precios tiered (por volumen)
- ✅ MOQ por producto
- ✅ Bulk pricing calculator
- ❌ OCULTA: Reviews de clientes (no aplican en B2B)

**`storefront/` muestra:**
- ✅ Portal de cliente B2B con login
- ✅ Historial de órdenes y cotizaciones
- ✅ Re-order rápido de productos frecuentes
- ✅ Aprobaciones internas (workflow)

#### Implementación técnica:

```typescript
// En FeatureRegistry.ts
{
  id: 'sales.b2b.quotes',
  requiredCapabilities: ['b2b'],
  description: 'Cotizaciones para ventas B2B'
},
{
  id: 'sales.b2b.tiered_pricing',
  requiredCapabilities: ['b2b'],
  description: 'Precios por volumen'
}
```

```tsx
// En sales/components/SalesForm.tsx
const { hasFeature } = useFeatureFlags();

return (
  <>
    {hasFeature('sales.b2b.quotes') && <QuotesTab />}
    {hasFeature('sales.b2b.tiered_pricing') && <TieredPricingConfig />}
    {!hasFeature('sales.b2b') && <TipsInput />} {/* Solo retail */}
  </>
);
```

```tsx
// En customers/components/CustomerForm.tsx
const { hasFeature } = useFeatureFlags();

return (
  <>
    {hasFeature('customers.b2b.corporate') && (
      <>
        <Field label="CUIT" />
        <Field label="Razón Social" />
        <ContactsManager /> {/* Múltiples contactos */}
        <CreditLimitConfig />
      </>
    )}

    {hasFeature('customers.loyalty') && !hasFeature('customers.b2b') && (
      <LoyaltyProgramConfig /> {/* Solo retail */}
    )}
  </>
);
```

---

### Ejemplo 2: Capability "Memberships" activa

**NO se crea módulo `memberships/`**. En su lugar:

#### Módulos que se adaptan:

**`customers/` muestra:**
- ✅ Tab "Membresías" en vista de cliente
- ✅ Estado de membresía (activo, vencido, cancelado)
- ✅ Fecha de inicio/renovación/vencimiento
- ✅ Historial de renovaciones y upgrades
- ✅ Beneficios aplicados (descuentos, accesos)

**`products/` muestra:**
- ✅ Tipo de producto "Plan de Membresía"
- ✅ Configuración de recurrencia (mensual, anual)
- ✅ Niveles de membresía (básico, premium, VIP)
- ✅ Beneficios por nivel (descuentos, accesos exclusivos)
- ✅ Trial periods configurables

**`billing/` muestra:**
- ✅ Facturación recurrente automática
- ✅ Gestión de renovaciones y upgrades
- ✅ Downgrades y cancelaciones
- ✅ Gestión de períodos de prueba (trial)
- ✅ Notificaciones de vencimiento

**`sales/` muestra:**
- ✅ Aplicación automática de descuentos de membresía
- ✅ Verificación de beneficios al checkout
- ✅ Upgrade/downgrade durante compra

#### Implementación técnica:

```typescript
// En FeatureRegistry.ts
{
  id: 'customers.memberships',
  requiredCapabilities: ['memberships'],
  description: 'Gestión de membresías en clientes'
},
{
  id: 'products.membership_plans',
  requiredCapabilities: ['memberships'],
  description: 'Productos tipo plan de membresía'
},
{
  id: 'billing.recurring',
  requiredCapabilities: ['memberships'],
  description: 'Facturación recurrente'
}
```

```tsx
// En customers/components/CustomerDetail.tsx
const { hasFeature } = useFeatureFlags();

return (
  <Tabs>
    <Tab label="Información General">...</Tab>
    <Tab label="Historial">...</Tab>

    {hasFeature('customers.memberships') && (
      <Tab label="Membresía">
        <MembershipTab customerId={customer.id} />
      </Tab>
    )}
  </Tabs>
);
```

```tsx
// En products/components/ProductForm.tsx
const { hasFeature } = useFeatureFlags();

const productTypes = [
  'physical',
  'service',
  ...(hasFeature('products.membership_plans') ? ['membership'] : []),
  ...(hasFeature('products.digital') ? ['digital'] : []),
  ...(hasFeature('products.rental') ? ['rental'] : [])
];

return (
  <ProductTypeSelector options={productTypes} />
);
```

---

### Ejemplo 3: Capability "Rentals" activa

#### Módulos que se adaptan:

**`products/` muestra:**
- ✅ Tipo de producto "Rental Asset"
- ✅ Configuración de disponibilidad temporal (calendario)
- ✅ Precios por hora/día/semana/mes
- ✅ Configuración de depósitos (security deposit)
- ✅ Configuración de penalidades por daño/retraso
- ✅ Estados del asset: disponible, alquilado, mantenimiento, dañado

**`sales/` muestra:**
- ✅ Calendario de disponibilidad al agregar rental al carrito
- ✅ Selector de fecha inicio/fin de alquiler
- ✅ Cálculo automático de precio según duración
- ✅ Cobro de depósito en checkout
- ✅ Workflow de devolución (return flow)

**`inventory/` (materials) muestra:**
- ✅ Tracking de rental assets (ubicación, estado)
- ✅ Historial de alquileres por asset
- ✅ Mantenimiento preventivo entre alquileres

**`assets/` (activos fijos):**
- ❌ NO se ve afectado (son activos internos del negocio, no para alquilar)

#### Implementación técnica:

```typescript
// En FeatureRegistry.ts
{
  id: 'products.rental',
  requiredCapabilities: ['rentals'],
  description: 'Productos tipo rental asset'
},
{
  id: 'sales.rental_calendar',
  requiredCapabilities: ['rentals'],
  description: 'Calendario de disponibilidad en ventas'
}
```

```tsx
// En products/components/ProductForm.tsx
const { hasFeature } = useFeatureFlags();

return (
  <>
    <ProductTypeSelector />

    {productType === 'rental' && hasFeature('products.rental') && (
      <>
        <RentalPricingConfig /> {/* Precios por periodo */}
        <DepositConfig /> {/* Depósito de seguridad */}
        <PenaltyConfig /> {/* Penalidades */}
        <AvailabilityCalendar /> {/* Calendario */}
      </>
    )}
  </>
);
```

```tsx
// En sales/components/SalesCart.tsx
const { hasFeature } = useFeatureFlags();

return (
  <CartItems>
    {items.map(item => (
      <CartItem key={item.id}>
        {item.type === 'rental' && hasFeature('sales.rental_calendar') && (
          <>
            <DateRangePicker
              label="Período de alquiler"
              onChange={handleRentalPeriodChange}
            />
            <DepositInfo amount={item.deposit} />
            <RentalTerms />
          </>
        )}
      </CartItem>
    ))}
  </CartItems>
);
```

---

### Patrón de Implementación General

#### 1. Definir features en `FeatureRegistry.ts`:

```typescript
// src/config/FeatureRegistry.ts
export const FEATURES: Feature[] = [
  {
    id: 'sales.b2b.quotes',
    requiredCapabilities: ['b2b'],
    description: 'Cotizaciones para ventas B2B',
    module: 'sales'
  },
  {
    id: 'customers.memberships',
    requiredCapabilities: ['memberships'],
    description: 'Gestión de membresías',
    module: 'customers'
  }
];
```

#### 2. En componentes, usar `useFeatureFlags()`:

```tsx
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

function SalesForm() {
  const { hasFeature, hasAnyFeature, hasAllFeatures } = useFeatureFlags();

  // Caso simple: una feature
  if (hasFeature('sales.b2b.quotes')) {
    return <QuotesTab />;
  }

  // Caso OR: al menos una feature
  if (hasAnyFeature(['sales.pos', 'sales.ecommerce'])) {
    return <CheckoutFlow />;
  }

  // Caso AND: todas las features
  if (hasAllFeatures(['products.rental', 'sales.calendar'])) {
    return <RentalBookingFlow />;
  }

  return <StandardSalesForm />;
}
```

#### 3. En servicios, validar capabilities:

```typescript
// src/modules/sales/services/saleApi.ts
import { hasCapability } from '@/lib/capabilities';

export async function createQuote(data: QuoteData) {
  if (!hasCapability('b2b')) {
    throw new Error('B2B capability required to create quotes');
  }

  // Lógica de creación de cotización
}
```

#### 4. En rutas, proteger con capabilities:

```tsx
// src/config/routeMap.ts
{
  path: '/admin/sales/quotes',
  component: QuotesPage,
  requiredCapabilities: ['b2b'],
  requiredPermissions: ['sales.quotes.view']
}
```

---

### Beneficios de este Enfoque

✅ **Menos código duplicado**
Un módulo sirve para múltiples casos de uso. No hay módulo "B2B Sales" y otro "Retail Sales".

✅ **UI limpia y contextual**
Usuario solo ve lo que necesita según su modelo de negocio. No hay opciones irrelevantes.

✅ **Mantenimiento simple**
Cambios en un lugar afectan todos los casos. Fix un bug en `sales/` beneficia a POS, B2B, y ecommerce.

✅ **Escalable**
Agregar nueva capability no requiere nuevo módulo. Solo features y UI condicional.

✅ **Flexible y combinable**
Capabilities se combinan libremente: Restaurant + B2B + Delivery + Memberships funcionan juntos.

✅ **Testing más simple**
Test de módulo con diferentes combinaciones de capabilities vía feature flags.

---

## Próximos Pasos

### 1. Documentar y Commitear Diseño
- [x] Escribir este documento
- [ ] Commitear en git con mensaje descriptivo
- [ ] Compartir con equipo para feedback final

### 2. Crear Plan de Implementación Detallado
- [ ] Usar `superpowers:writing-plans` para generar plan paso a paso
- [ ] Estimar esfuerzo por fase (ELIMINAR, RENOMBRAR, CREAR, CONSOLIDAR)
- [ ] Definir orden de ejecución (dependencias entre fases)
- [ ] Identificar riesgos y mitigaciones

### 3. Setup de Worktree para Desarrollo Aislado
- [ ] Usar `superpowers:using-git-worktrees` para crear workspace aislado
- [ ] Branch: `refactor/module-restructuring`
- [ ] Trabajar sin afectar rama principal

### 4. Ejecución por Fases
- [ ] **FASE 1:** ELIMINAR módulos deprecados (más riesgoso, hacerlo primero)
- [ ] **FASE 2:** RENOMBRAR módulos existentes
- [ ] **FASE 3:** CREAR módulos nuevos (placeholders)
- [ ] **FASE 4:** CONSOLIDAR Finance (6 → 3)
- [ ] Testing integral después de cada fase

### 5. Actualizar Documentación
- [ ] `README.md` con nueva estructura
- [ ] `docs/architecture/` actualizar diagramas
- [ ] `CONTRIBUTING.md` con nuevas convenciones
- [ ] Registros de capabilities y features

### 6. Refinar TODOs
- [ ] Priorizar deudas técnicas (Rentals, B2B/Ecommerce primero)
- [ ] Crear issues en GitHub/proyecto
- [ ] Asignar responsables y timelines

---

## Métricas de Éxito

### Cuantitativas:
- ✅ Reducir de 31 → 25 módulos (19% reducción)
- ✅ Reducir de 9 → 7 dominios (22% reducción)
- ✅ Ratio módulos/dominio: 2.7 → 3.6 (33% mejora en cohesión)
- ✅ Eliminar 12 módulos/manifests deprecados
- ✅ 0 duplicaciones de rutas (eliminar staff/team)
- ✅ 0 módulos sin metadata

### Cualitativas:
- ✅ Criterio de agrupación consistente en todos los dominios
- ✅ No hay antipatrón de "dominio con 1 módulo"
- ✅ Separación clara entre conceptos (PRODUCTION vs DISTRIBUTION)
- ✅ Finance consolidado y coherente
- ✅ Analytics distribuido (no centralizado)
- ✅ Capabilities bien integradas con módulos

---

## Conclusión

Este rediseño arquitectónico transforma una estructura fragmentada de 31 módulos en 9 dominios inconsistentes, en una arquitectura coherente de **25 módulos en 7 dominios** con criterios claros:

1. **Cohesión conceptual**: Cada dominio agrupa actividades relacionadas
2. **Balance**: Ratio saludable de 3.6 módulos/dominio
3. **Escalabilidad**: Capabilities adaptan módulos existentes sin proliferación
4. **Mantenibilidad**: Menos duplicación, más código reutilizable
5. **Claridad**: Nombres descriptivos y comerciales

La estructura resultante está preparada para crecer con el producto, soportar múltiples modelos de negocio combinables, y mantener la complejidad bajo control.

---

**Autor**: Claude Sonnet 4.5
**Revisado por**: Diego (Product Owner)
**Fecha**: 2026-01-26
**Status**: ✅ Diseño Validado - Listo para Implementación
