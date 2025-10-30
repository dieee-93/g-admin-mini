# 🛠️ WORKSHOP: DEFINICIÓN COMPLETA DE NAVEGACIÓN

**Fecha**: 2025-10-12
**Propósito**: Definir arquitectura definitiva de módulos con contexto completo
**Estado**: 🚧 En progreso - Sesión interactiva

---

## 📋 FASE 1: ANÁLISIS DE SITUACIÓN ACTUAL

### 1.1 Intelligence y Reporting - Decisión Requerida

#### Intelligence Module
**Ubicación**: `src/pages/admin/core/intelligence/`
**Manifest**: `autoInstall: true`, domain: 'core'

**Componentes encontrados**:
- `CompetitorsTable.tsx` - Análisis de competencia
- `MarketInsightsPanel.tsx` - Insights de mercado
- `MarketTrendsPanel.tsx` - Tendencias
- `PricingAnalysisPanel.tsx` - Análisis de precios

**Propósito**: Competitive intelligence (datos EXTERNOS del mercado)

**Problema**:
- ✅ Tiene funcionalidad real y única (análisis de mercado)
- ⚠️ Nombre ambiguo ("Intelligence")
- ⚠️ `autoInstall: true` sin justificación clara
- ❓ ¿Es core o es advanced/analytics?

**Opciones**:
1. **Renombrar + Mantener**: "Market Intelligence" o "Competitive Analysis"
2. **Mover a Advanced**: domain → 'advanced', autoInstall → false
3. **Integrar en Dashboard**: Como tab "Market Insights"
4. **Eliminar**: Si no es prioritario para MVP

#### Reporting Module
**Ubicación**: `src/pages/admin/core/reporting/` + `src/pages/admin/tools/reporting/`
**Manifest**: `autoInstall: true`, domain: 'core'

**Componentes encontrados**:
- `ReportBuilder.tsx` - Constructor de reportes custom
- `TemplatesTab.tsx` - Plantillas de reportes
- `AutomationTab.tsx` - Programación de reportes
- `GeneratedReportsTab.tsx` - Historial de reportes

**Propósito**: Custom reporting engine (datos INTERNOS de todos los módulos)

**Problema**:
- ✅ Funcionalidad valiosa y única
- ⚠️ Duplicación: archivos en `core/reporting/` Y `tools/reporting/`
- ⚠️ También en `settings/pages/reporting/` (configuración)
- ❓ ¿Es core o es analytics/tools?

**Opciones**:
1. **Renombrar + Consolidar**: "Analytics" (unifica Reporting + Executive Dashboard)
2. **Mantener separado**: "Custom Reports" (nombre más claro)
3. **Integrar en Dashboard**: Como tab "Reports"
4. **Mover a Advanced**: Herramienta avanzada para power users

---

### 1.2 Materials vs Inventory vs StockLab - Decisión de Nomenclatura

**Situación**:
- Código usa inconsistentemente: "Materials", "Inventory", "StockLab"
- "StockLab" fue propuesta como nombre comercial/amigable
- Manifest: `id: 'materials'`, pero ruta: `/admin/materials`

**Problema**:
- "Materials" técnico, enfocado en materiales primos (manufactura)
- "Inventory" genérico, aplicable a retail/restaurante/servicios
- "StockLab" comercial, pero puede confundir (¿es laboratorio?)

**Opciones**:
1. **Inventory** - Estándar industria, claro, genérico ⭐ RECOMENDADO
2. **Materials** - Mantener actual (técnico)
3. **StockLab** - Comercial pero poco claro
4. **Stock** - Muy corto, poco descriptivo

**Impacto**:
- Renombrar módulo ID: `materials` → `inventory`
- Actualizar ruta: `/admin/materials` → `/admin/inventory`
- Actualizar manifest, store, componentes

---

### 1.3 Supplier Orders - Nomenclatura y Agrupación

**Situación**:
- Nombre largo para evitar confusión con otras "órdenes"
- Fue sugerido como módulo aparte (relación materials↔suppliers)
- Actualmente es módulo independiente

**Problema**:
- ¿Es suficientemente grande para módulo propio?
- ¿O debería ser tab/feature dentro de Suppliers o Inventory?

**Opciones**:
1. **Módulo independiente** - "Purchase Orders" (nombre estándar) ⭐ RECOMENDADO
2. **Tab en Suppliers** - `/admin/suppliers` > Tab "Orders"
3. **Tab en Inventory** - `/admin/inventory` > Tab "Purchase Orders"
4. **Mantener nombre actual** - "Supplier Orders"

**Criterio a definir**: ¿Cuándo algo es módulo vs tab?

---

## 📊 FASE 2: ANÁLISIS DE COBERTURA

### 2.1 Features del FeatureRegistry (86 features)

| Domain | Features | Módulos Actuales | Cobertura |
|--------|----------|------------------|-----------|
| **SALES** (24) | order_management, payment, POS, e-commerce, quotes, contracts, etc. | Sales | ⚠️ Parcial - Falta E-commerce, B2B |
| **INVENTORY** (13) | stock_tracking, alerts, purchase_orders, suppliers, SKU, etc. | Materials, Suppliers, Supplier-Orders | ✅ Completo |
| **PRODUCTION** (4) | recipes, kitchen_display, order_queue, capacity_planning | Products, Production (logic), Kitchen (link) | ⚠️ Production sin UI |
| **OPERATIONS** (15) | pickup, delivery, tables, floor_plan, waitlist, etc. | Operations Hub | ⚠️ Parcial - Falta Delivery |
| **SCHEDULING** (4) | appointments, calendar, reminders, availability | Scheduling | ✅ Completo |
| **CUSTOMER** (5) | history, preferences, loyalty, reservations | Customers | ✅ Completo |
| **FINANCE** (4) | corporate_accounts, credit, invoicing, payment_terms | Billing, Fiscal, Finance-Integrations | ✅ Completo |
| **MOBILE** (5) | pos_offline, location_tracking, route_planning, etc. | ❌ FALTA | ❌ Sin cobertura |
| **MULTISITE** (5) | location_management, centralized_inventory, transfers, etc. | ❌ FALTA | ❌ Sin cobertura |
| **ANALYTICS** (2) | ecommerce_metrics, conversion_tracking | Reporting, Intelligence, Executive | ⚠️ Disperso |
| **STAFF** (6) | employees, shifts, time_tracking, performance, training | Staff, Scheduling | ✅ Completo |

### 2.2 Módulos Sin Features Claras

Módulos que existen pero NO tienen features en FeatureRegistry:

| Módulo | Features que debería tener | Estado |
|--------|---------------------------|--------|
| **Memberships** | `customer_loyalty_program` existe, pero memberships es diferente (planes pagos) | ❓ Necesita features nuevas o es sub-feature? |
| **Rentals** | ❌ No hay features de alquileres en registry | ❓ Agregar features o eliminar módulo? |
| **Assets** | ❌ No hay features de gestión de activos | ❓ Agregar features o eliminar módulo? |
| **Debug** | ✅ Es herramienta dev, no necesita features | ✅ OK |

### 2.3 Módulos Faltantes (Features sin Módulo)

| Features Sin Módulo | Propuesta de Módulo | Prioridad |
|---------------------|---------------------|-----------|
| **E-commerce** (catalog_ecommerce, cart, checkout, online_payment) | `E-commerce` o tab en Sales | 🔴 Alta |
| **B2B Sales** (quotes, contracts, approvals, bulk_pricing) | `B2B Sales` o tab en Sales | 🟡 Media |
| **Delivery** (delivery_zones, tracking, shipping) | `Delivery` | 🟡 Media |
| **Mobile** (pos_offline, location_tracking, routes) | `Mobile POS` | 🟢 Baja |
| **Multisite** (location_mgmt, transfers, comparative) | `Multi-Location` | 🟢 Baja |
| **Production UI** (production logic existe, falta UI) | `Production` (UI) | 🔴 Alta |

---

## 🎯 FASE 3: CRITERIOS DE ORGANIZACIÓN

### 3.1 ¿Qué es un Módulo? (Propuesta)

**Módulo** = Entidad de negocio principal con CRUD completo + lógica de dominio

**Criterios**:
- ✅ Tiene tabla(s) principal(es) en DB
- ✅ Tiene operaciones CRUD completas
- ✅ Tiene lógica de negocio significativa (>500 LOC)
- ✅ Puede funcionar independiente de otros módulos (excepto core)
- ✅ Usuario lo busca por nombre en navegación

**Ejemplos**: Sales, Inventory, Customers, Staff

---

### 3.2 ¿Qué es un Feature? (Propuesta)

**Feature** = Funcionalidad dentro de módulo, activada por capabilities

**Criterios**:
- ✅ Es toggle on/off según BusinessModel
- ✅ Agrega funcionalidad a módulo existente
- ✅ No justifica navegación separada
- ✅ Puede ser tab, sección, o campos adicionales

**Ejemplos**:
- `inventory_alert_system` → Feature en Inventory
- `sales_tip_management` → Feature en Sales
- `customer_loyalty_program` → Feature en Customers

---

### 3.3 ¿Qué es un Submodule/Tab? (Propuesta)

**Submodule** = Sección grande dentro de módulo con UI propia

**Criterios**:
- ✅ Comparte contexto con módulo padre
- ✅ Tiene suficiente UI para pantalla dedicada
- ✅ Usuario navega dentro del módulo (tabs o sidebar)
- ✅ Puede tener ruta propia: `/parent/submodule`

**Ejemplos**:
- Settings > Integrations, Diagnostics, Reporting
- Operations Hub > Tables, Kitchen, Waitlist
- Finance > Billing, Fiscal, Integrations (¿?)

---

### 3.4 ¿Qué es un Link Module? (Propuesta)

**Link Module** = Sin UI, solo lógica de integración entre módulos

**Criterios**:
- ✅ Conecta dos o más módulos
- ✅ Auto-install cuando dependencias activas
- ✅ No tiene ruta de navegación
- ✅ Registra hooks, no componentes

**Ejemplos**:
- Kitchen (link entre Sales y Materials)
- Production (link entre Products y Materials)

---

## 📝 FASE 4: PROPUESTA DE LISTA COMPLETA

### 4.1 Módulos Core (Siempre Visibles)

| # | ID | Nombre | Tipo | Decisión Pendiente |
|---|----|--------|------|-------------------|
| 1 | `dashboard` | Dashboard | Core | ✅ OK |
| 2 | `settings` | Settings | Core | ✅ OK |
| 3 | `debug` | Debug Tools | Core (dev) | ✅ OK |

---

### 4.2 Módulos de Negocio Principal

| # | ID | Nombre Propuesto | Decisión Pendiente |
|---|----|------------------|-------------------|
| 4 | `sales` | Sales (POS) | ✅ OK - Nombre claro |
| 5 | `inventory` | Inventory | ⚠️ Renombrar desde "materials" |
| 6 | `products` | Menu | ⚠️ Renombrar: "Products" → "Menu" (restaurantes) o "Catalog" (retail) |
| 7 | `customers` | Customers (CRM) | ✅ OK |
| 8 | `suppliers` | Suppliers | ✅ OK |
| 9 | `purchase-orders` | Purchase Orders | ⚠️ Renombrar desde "supplier-orders" |
| 10 | `staff` | Staff (HR) | ✅ OK |
| 11 | `scheduling` | Scheduling | ✅ OK |

---

### 4.3 Módulos Operacionales

| # | ID | Nombre Propuesto | Tipo | Decisión Pendiente |
|---|----|------------------|------|-------------------|
| 12 | `operations` | Floor Management | Module | ⚠️ Renombrar desde "operations-hub" |
| 13 | `production` | Production | Module | ⚠️ Necesita UI (actualmente solo logic) |
| 14 | `delivery` | Delivery | Module | 🆕 NUEVO - Para delivery_zones, tracking |
| 15 | `ecommerce` | E-commerce | Module | 🆕 NUEVO - O tab en Sales? |

---

### 4.4 Módulos Financieros

| # | ID | Nombre | Decisión Pendiente |
|---|----|--------|-------------------|
| 16 | `billing` | Billing | ✅ OK |
| 17 | `fiscal` | Fiscal (AFIP) | ✅ OK - Específico Argentina |
| 18 | `finance-integrations` | Payment Integrations | ⚠️ Renombrar: más claro |

---

### 4.5 Módulos de Servicios Adicionales

| # | ID | Nombre | Decisión Pendiente |
|---|----|--------|-------------------|
| 19 | `memberships` | Memberships | ❓ ¿Agregar features o hacer tab en Customers? |
| 20 | `rentals` | Rentals | ❓ ¿Agregar features o hacer tab en Operations? |
| 21 | `assets` | Asset Management | ❓ ¿Agregar features o hacer tab en Operations? |

---

### 4.6 Módulos de Analytics & Insights

| # | ID | Nombre Propuesto | Decisión Pendiente |
|---|----|------------------|-------------------|
| 22 | `analytics` | Analytics | 🔄 CONSOLIDAR: Reporting + Intelligence + Executive |
| 23 | `intelligence` | Market Intelligence | 🔄 CONSOLIDAR en Analytics o mantener separado? |
| 24 | `reporting` | Custom Reports | 🔄 CONSOLIDAR en Analytics o mantener separado? |
| 25 | `executive` | Executive Dashboard | 🔄 CONSOLIDAR en Analytics o mantener separado? |

**Propuesta de consolidación**:
```
Analytics (módulo único)
├── Tab: Reports (custom reports builder)
├── Tab: Market (competitive intelligence)
└── Tab: Executive (KPIs agregados)
```

---

### 4.7 Módulos de Infrastructure (Opcionales)

| # | ID | Nombre | Activación | Prioridad |
|---|----|--------|-----------|-----------|
| 26 | `mobile` | Mobile POS | `mobile_operations` capability | 🟢 Baja |
| 27 | `multisite` | Multi-Location | `multi_location` infrastructure | 🟢 Baja |

---

### 4.8 Módulos Cross-Cutting (Auto-install)

| # | ID | Nombre | Tipo | Decisión |
|---|----|--------|------|----------|
| 28 | `gamification` | Achievements | Auto-install | ✅ OK - Renombrar display name |
| 29 | `kitchen` | Kitchen (link) | Link module | ✅ OK |
| 30 | `production` | Production (link) | Link module | ⚠️ Necesita UI también |

---

## 🔍 FASE 5: PREGUNTAS PARA DECISIÓN

### Q1: Intelligence y Reporting
**¿Consolidar o mantener separados?**

Opciones:
- **A**: Consolidar todo en "Analytics" (1 módulo, 3 tabs)
- **B**: Mantener 2 separados: "Reporting" + "Intelligence"
- **C**: Eliminar Intelligence, mantener solo Reporting
- **Tu decisión**: Creo que la decision es A, pero creo que habria que analizarlos en profundidad y ver sobre que son las aanalitics los reportings e intellkigence, es decir, son generales? estan realacionadas con algun modulo ?

---

### Q2: Materials → Inventory
**¿Renombrar?**

- **A**: Sí, renombrar a "Inventory" ⭐
- **B**: Mantener "Materials"
- **C**: Usar "StockLab"
- **Tu decisión**: Aca hay un problema, podria ser inventory, pero otra vvez caemos en el mismo problema que parece que no podes ver el panorama entero, Inventory tambien podria considerarse maquinas, utensillos de cocina, etect, por otro lado puede conflictuar, te pongo un ejemplo prque no se como explicarlo con palabras, pero imaginemos un caso extremo que no creo que use mi app pero es un edge case interesante, imaginate un consultorio de dentista, podria ser que en su consultorio tenga maquinas, materiales, etcetc, Yo entiendo que inventory es una solucion que perfectamente aplica a este caos porque las cosas que te mencione pueden considerarse como inventory, pero Si le damos mas generalidad al modulo y que englobe todo hay que pensar como va a manejar esa dualidad(para un negocio gastronomico, un taller mecanico, etcetc)

---

### Q3: Products → Menu/Catalog
**¿Renombrar según contexto de negocio?**

- **A**: "Menu" (restaurantes)
- **B**: "Catalog" (retail)
- **C**: Mantener "Products"
- **D**: Nombre dinámico según BusinessModel
- **Tu decisión**: Nuevamente la decision en este caso es mas profunda y no responde asolamente a un cambio de nombre, hay que pensar que nuestro sistema maneja mas de un tipo de producto, digitales, capacitaciones, eventos, retail, gastronomicos etc, todos son combinables como plantea el paradigma de nuestra app, no solo hay que pensar estos nombres si no tambien como vamos a manejar estos casos, va a haber mas de una tienda ? va a cambiar segun lo que haya activado ? como debemos separar esto en modulos y navegacion ?

---

### Q4: Supplier Orders → Purchase Orders
**¿Renombrar?**

- **A**: Sí, "Purchase Orders" ⭐
- **B**: Mantener "Supplier Orders"
- **Tu decisión**: ACa tenemos otro problema, la idea de poner el nombre purchase orders es buena, pero comoo menciono ahora tnego miedo que luego su nombre se conflictue con el de algun modulo o feature faltante, entiendo que lo mas probable es que haya solo 2(sales order y purchase orders) pero igualmente como menciono en otras preguntas al estar en desarollo y planeacion, y ser conciente de que aun faltan algunas features o modulo para las gestionar el negocio con las capabilities restantes del form.
---

### Q5: Operations Hub → Floor Management
**¿Renombrar?**

- **A**: Sí, "Floor Management" ⭐
- **B**: "Floor & Tables"
- **C**: Mantener "Operations Hub"
- **Tu decisión**: En este caso me parece una buena idea cambiarlo a opoerationm hubs

---

### Q6: Memberships, Rentals, Assets
**¿Qué hacer con estos módulos sin features claras?**

- **A**: Agregar features al FeatureRegistry y mantener módulos
- **B**: Convertir en tabs de módulos existentes
- **C**: Eliminar (no prioritario para MVP)
- **Tu decisión**: Es posible que todos estos modulos o carpetas hayan sido creadas de apurado o sin la planificacion suficiente, los modulos que mencionaste estan relacionados con capabilities del form que aun no tienen bien organizados y en claros los modulos que lo integraran, viste que mas arriba mencione que habia algunas capabilities que tenian modulos o features que faltaban planificacion o incluso construccion de modulos nuevos para funcionar, la opcion es la A, y debemos tenerlos en cuenta en la planificacion general de modulos y en la categorizacion o recategorizacion de los mismos(pueden faltarles algunos modulos adicionaes o feeatures externas, es decir Memerships por ejemplo esta relacionada claramente con 1 tipo de capabilitie del formuilario, la de membresias que ahora no puedo verla en la interfaz del setup pero estoy seguro que el sistema la contemplaba, en fin las preguntas que quedan por respopnder seria, alcanza con el modulo de mermerships y los relacionados para manejar un sistema de membresias ? es necesario con solo un modulo mermership donde vivan todas las funciones o habria que definir modulos mas pequeños y mas especificos )

---

### Q7: E-commerce
**¿Módulo separado o tab en Sales?**

- **A**: Módulo independiente "E-commerce"
- **B**: Tab en Sales: Sales > E-commerce
- **C**: No implementar aún (futuro)
- **Tu decisión**: No lo se aun, si queres podemos discutirlo con mas profundidad, es importante sabedr para esto como vamos a manejar los multiples casos de venta dew productos o servicios(fisicos y digitales, por cita, si se compran dentro del horario de la trienda para retirar en el momento o en la tienda 24 hs, etcetc)

---

### Q8: B2B Sales (Quotes, Contracts)
**¿Módulo separado o tab en Sales?**

- **A**: Módulo independiente "B2B Sales"
- **B**: Tab en Sales: Sales > B2B
- **C**: No implementar aún (futuro)
- **Tu decisión**: Mismo, aca no se bien como funciona, quiza podriamos pensar realmente en que funciones deberia tener nuestra app para poder soportar un negocio B2B, supongo que habra un modulo o hub central para el B2B, pero tambien hay que pensar que posiblemente hay algunasfunciones del b2b que es posible que vayan acopladas a otros modulos o usen la base de otros modulos(es decir ne otras palabras, nuestra app tiene la capacidad de manejar ventas de cualquier tipo, el b2b es algo similar solo que a otra escala, pero en fin el comercio B2B usara toda esta base para comercial quiza con diferencias o configuraciones adicionales propias de un negocio B2B)

---

### Q9: Delivery
**¿Módulo separado o tab en Operations?**

- **A**: Módulo independiente "Delivery"
- **B**: Tab en Operations
- **C**: Tab en Sales
- **Tu decisión**: Esto es tambien otra decision a tomar, Logicamente podria ser una pestaña con algunas que otras gestiones del envio, sobre todo en el caso de restaurants o negocios de comida que la logistica es un poco mas simple, pero la decision es en bnase a algo parecido que mencione arriba sobre las multiples opciones que tenemos no solo de productos si no tambien de envios, para la tienda asincrona, correo, motomensajeria, etcetc y para la tienda sincronica delivery, etc, lo mismo tambien me surge la duda de la entrega de productos digitales, y dfemas como se gestionara. Y puede haber casos que me estoy salteando, asi que en este caso tyambien hay qe pensar y hacerse preguntas e investigar el codigo

---

### Q10: Production
**¿Necesita UI o solo lógica?**

- **A**: Crear UI completa (página /admin/production)
- **B**: Integrar en Products como tab
- **C**: Mantener solo como link module (sin UI)
- **Tu decisión**: 

---
Ok
## 📊 FASE 6: DOMINIOS DEFINITIVOS (Post-decisiones)

*Se completará después de responder Q1-Q10*

---

## ✅ PRÓXIMOS PASOS

1. **Usuario responde Q1-Q10**
2. **Definir lista definitiva de módulos** (con nombres finales)
3. **Organizar en dominios** (cuántos, cuáles)
4. **Definir jerarquía**: módulos > tabs > features
5. **Plan de implementación**: renombramientos, nuevos módulos, consolidaciones

---

**Estado**: 🚧 Esperando respuestas a preguntas Q1-Q10
