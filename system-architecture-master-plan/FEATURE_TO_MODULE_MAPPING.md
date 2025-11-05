# 🗺️ MATRIZ COMPLETA: FEATURES → MÓDULOS
## Mapeo de las 86 Features del Sistema a Módulos Actuales

**Fecha**: 2025-01-14
**Versión**: 1.0 - Auditoría Completa
**Estado**: 🔍 En Análisis
**Total Features**: 86 (confirmadas en FeatureRegistry.ts)

---

## 📋 METODOLOGÍA

Para cada feature se analiza:

1. **¿Dónde debería vivir?** - Módulo(s) lógico según función
2. **¿Está implementada?** - Estado actual en el código
3. **¿Requiere nuevo módulo?** - Si no cabe en existentes
4. **Notas** - Decisiones, dependencias, conflictos

**Leyenda de Estado**:
- ✅ **Implementada** - Feature existe con UI completa
- ⚠️ **Parcial** - Existe pero incompleta o sin UI dedicada
- ❌ **No implementada** - No existe en el código
- 🔍 **Por investigar** - Requiere análisis de código profundo

---

## 📊 RESUMEN POR DOMINIO

| Dominio | Total Features | Implementadas | Parciales | No Implementadas |
|---------|----------------|---------------|-----------|------------------|
| **SALES** | 24 | 🔍 | 🔍 | 🔍 |
| **INVENTORY** | 13 | 🔍 | 🔍 | 🔍 |
| **PRODUCTION** | 4 | 🔍 | 🔍 | 🔍 |
| **OPERATIONS** | 15 | 🔍 | 🔍 | 🔍 |
| **SCHEDULING** | 4 | 🔍 | 🔍 | 🔍 |
| **CUSTOMER** | 5 | 🔍 | 🔍 | 🔍 |
| **FINANCE** | 4 | 🔍 | 🔍 | 🔍 |
| **MOBILE** | 5 | 🔍 | 🔍 | 🔍 |
| **MULTISITE** | 5 | 🔍 | 🔍 | 🔍 |
| **ANALYTICS** | 2 | 🔍 | 🔍 | 🔍 |
| **STAFF** | 6 | 🔍 | 🔍 | 🔍 |
| **TOTAL** | **86** | - | - | - |

*(Se actualizará con análisis de código)*

---

## 🛍️ SALES DOMAIN (24 features)

### 1. `sales_order_management`
- **Descripción**: Sistema base de gestión de pedidos
- **¿Dónde debería vivir?**: Módulo **Sales** (core)
- **¿Está implementada?**: ✅ Sí - `src/pages/admin/operations/sales/page.tsx`
- **¿Requiere nuevo módulo?**: No
- **Notas**: Base fundamental del módulo Sales, implementada en POS

---

### 2. `sales_payment_processing`
- **Descripción**: Sistema de cobros y procesamiento de pagos
- **¿Dónde debería vivir?**: Módulo **Sales** + compartido (PaymentService)
- **¿Está implementada?**: ✅ Sí - Componente de pago en Sales
- **¿Requiere nuevo módulo?**: No
- **Notas**: Servicio compartido usado por Sales, E-commerce (futuro), B2B (futuro)

---

### 3. `sales_catalog_menu`
- **Descripción**: Catálogo base de productos/servicios
- **¿Dónde debería vivir?**: Módulo **Products/Catalog**
- **¿Está implementada?**: ✅ Sí - `src/pages/admin/supply-chain/products/page.tsx`
- **¿Requiere nuevo módulo?**: No (pero renombrar a Catalog)
- **Notas**: Usado por Sales para seleccionar items

---

### 4. `sales_pos_onsite`
- **Descripción**: Punto de venta para consumo en local
- **¿Dónde debería vivir?**: Módulo **Sales**
- **¿Está implementada?**: ✅ Sí - Es el core del módulo Sales actual
- **¿Requiere nuevo módulo?**: No
- **Notas**: POS es la funcionalidad principal de Sales

---

### 5. `sales_dine_in_orders`
- **Descripción**: Gestión de órdenes para mesas/cabinas
- **¿Dónde debería vivir?**: Módulo **Sales** + **Operations Hub** (mesas)
- **¿Está implementada?**: ⚠️ Parcial - Sales tiene órdenes, Operations tiene mesas
- **¿Requiere nuevo módulo?**: No
- **Notas**: Cross-module: Sales (orden) + Operations (mesa assignment)

---

### 6. `sales_order_at_table`
- **Descripción**: Tomar pedidos directamente en la mesa
- **¿Dónde debería vivir?**: Módulo **Sales** (feature móvil)
- **¿Está implementada?**: ❌ No - Requiere UI móvil/tablet
- **¿Requiere nuevo módulo?**: No (feature dentro de Sales)
- **Notas**: Podría ser Progressive Web App (PWA) del Sales POS

---

### 7. `sales_catalog_ecommerce`
- **Descripción**: Catálogo avanzado para tienda online
- **¿Dónde debería vivir?**: Módulo **Products/Catalog** (variante e-commerce)
- **¿Está implementada?**: ❌ No - Catalog actual es básico
- **¿Requiere nuevo módulo?**: No (agregar features al Catalog existente)
- **Notas**: Agregar: fotos múltiples, descripciones largas, SEO, variantes complejas

---

### 8. `sales_async_order_processing`
- **Descripción**: Procesar pedidos fuera de horario comercial
- **¿Dónde debería vivir?**: ¿Módulo **E-commerce** nuevo O tab en **Sales**?
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: **DECISIÓN PENDIENTE** (E-commerce independiente vs Sales > E-commerce tab)
- **Notas**: Workflow muy diferente a POS (asíncrono, no hay cliente presente)

---

### 9. `sales_online_payment_gateway`
- **Descripción**: Integración con pasarelas de pago digitales
- **¿Dónde debería vivir?**: Módulo **Finance > Payment Integrations** (shared service)
- **¿Está implementada?**: ⚠️ Parcial - Existe módulo Integrations pero sin gateways implementados
- **¿Requiere nuevo módulo?**: No
- **Notas**: Servicio compartido usado por E-commerce, Sales online, B2B

---

### 10. `sales_cart_management`
- **Descripción**: Carrito de compras para e-commerce
- **¿Dónde debería vivir?**: ¿Módulo **E-commerce** nuevo O tab en **Sales**?
- **¿Está implementada?**: ❌ No - POS no tiene carrito persistente
- **¿Requiere nuevo módulo?**: **DECISIÓN PENDIENTE**
- **Notas**: Si E-commerce es módulo separado, cart va ahí. Si es tab, va en Sales > E-commerce

---

### 11. `sales_checkout_process`
- **Descripción**: Flujo de compra online completo
- **¿Dónde debería vivir?**: ¿Módulo **E-commerce** nuevo O tab en **Sales**?
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: **DECISIÓN PENDIENTE**
- **Notas**: Incluye: address validation, shipping options, payment methods

---

### 12. `sales_multicatalog_management`
- **Descripción**: Gestionar múltiples catálogos (online + onsite)
- **¿Dónde debería vivir?**: Módulo **Products/Catalog**
- **¿Está implementada?**: ❌ No - Catalog actual es único
- **¿Requiere nuevo módulo?**: No (feature en Catalog)
- **Notas**: Casos: Menú restaurante (onsite) vs Menú delivery (online, items diferentes)

---

### 13. `sales_bulk_pricing`
- **Descripción**: Precios escalonados por cantidad
- **¿Dónde debería vivir?**: Módulo **Products/Catalog** (pricing rules)
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No (pricing logic en Catalog)
- **Notas**: Usado por B2B, Retail, Wholesale

---

### 14. `sales_quote_generation`
- **Descripción**: Sistema de cotizaciones B2B
- **¿Dónde debería vivir?**: ¿Módulo **B2B** nuevo O tab en **Sales**?
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: **DECISIÓN PENDIENTE**
- **Notas**: Workflow B2B: Quote → Approval → Order → Invoice

---

### 15. `sales_product_retail`
- **Descripción**: Venta de productos minoristas
- **¿Dónde debería vivir?**: Módulo **Sales** (ya lo soporta)
- **¿Está implementada?**: ✅ Sí - Sales POS puede vender retail
- **¿Requiere nuevo módulo?**: No
- **Notas**: No requiere feature especial, es capability activada

---

### 16. `sales_package_management`
- **Descripción**: Paquetes de servicios/productos (bundles)
- **¿Dónde debería vivir?**: Módulo **Products/Catalog** (tipo de producto)
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No (tipo de producto en Catalog)
- **Notas**: Ejemplo: "Paquete Spa" = masaje + facial + acceso piscina

---

### 17. `sales_contract_management`
- **Descripción**: Contratos corporativos B2B
- **¿Dónde debería vivir?**: ¿Módulo **B2B** nuevo O tab en **Sales** O **Customers**?
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: **DECISIÓN PENDIENTE**
- **Notas**: Requiere: templates, approvals, renewals, terms

---

### 18. `sales_tiered_pricing`
- **Descripción**: Precios diferenciados por segmento de cliente
- **¿Dónde debería vivir?**: Módulo **Products/Catalog** (pricing) + **Customers** (segmentation)
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No (cross-module)
- **Notas**: Ejemplo: Cliente VIP = -10%, Mayorista = -20%

---

### 19. `sales_approval_workflows`
- **Descripción**: Aprobaciones multinivel para ventas B2B
- **¿Dónde debería vivir?**: ¿Módulo **B2B** nuevo O **Settings** (workflow config)?
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: **DECISIÓN PENDIENTE**
- **Notas**: Requiere sistema de workflows genérico (reutilizable)

---

### 20. `sales_quote_to_order`
- **Descripción**: Convertir cotizaciones en órdenes
- **¿Dónde debería vivir?**: Mismo módulo que `sales_quote_generation`
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: **DECISIÓN PENDIENTE** (depende de quotes)
- **Notas**: Workflow: Quote (approved) → Order (crear automáticamente)

---

### 21. `sales_split_payment`
- **Descripción**: Dividir pago en múltiples métodos
- **¿Dónde debería vivir?**: Módulo **Sales** (payment screen)
- **¿Está implementada?**: ✅ **SÍ** - `ModernPaymentProcessor.tsx` tiene `SplitBill` y `SplitBillType`
- **¿Requiere nuevo módulo?**: No
- **Notas**: Implementado en types con `allowSplitBill` prop. UI completa en payment processor
- **Archivo**: `src/pages/admin/operations/sales/components/Payment/ModernPaymentProcessor.tsx:32-36`

---

### 22. `sales_tip_management`
- **Descripción**: Sistema de propinas para restaurantes
- **¿Dónde debería vivir?**: Módulo **Sales** (payment screen)
- **¿Está implementada?**: ✅ **SÍ** - `TipConfiguration`, `DEFAULT_TIP_PERCENTAGES`, campos en Sale.tips
- **¿Requiere nuevo módulo?**: No
- **Notas**: Implementado con % preconfigurados + custom tip. Sale.tips guardado en DB
- **Archivos**:
  - `src/pages/admin/operations/sales/components/Payment/ModernPaymentProcessor.tsx:34-35`
  - `src/pages/admin/operations/sales/types.ts:14` (Sale.tips)

---

### 23. `sales_coupon_management`
- **Descripción**: Sistema de descuentos y cupones
- **¿Dónde debería vivir?**: Módulo **Sales** (promociones) + **Marketing** (futuro)
- **¿Está implementada?**: ⚠️ **Parcial** - Sale.discounts existe, pero sin UI de cupones/códigos
- **¿Requiere nuevo módulo?**: No
- **Notas**: DB field existe (Sale.discounts), falta UI para crear/aplicar cupones
- **Archivo**: `src/pages/admin/operations/sales/types.ts:15` (Sale.discounts)

---

### 24. `sales_order_management` (duplicado? revisar)
*(Ya listado como #1)*

---

## 📦 INVENTORY DOMAIN (13 features)

### 25. `inventory_stock_tracking`
- **Descripción**: Control básico de inventario
- **¿Dónde debería vivir?**: Módulo **Inventory** (Materials renombrado)
- **¿Está implementada?**: ✅ Sí - `src/pages/admin/supply-chain/materials/page.tsx`
- **¿Requiere nuevo módulo?**: No
- **Notas**: Core del módulo Materials/Inventory

---

### 26. `inventory_alert_system`
- **Descripción**: Alertas de stock bajo/crítico
- **¿Dónde debería vivir?**: Módulo **Inventory**
- **¿Está implementada?**: ✅ Sí - 🔍 Confirmar si tiene UI de configuración
- **¿Requiere nuevo módulo?**: No
- **Notas**: Requiere: umbrales configurables, notificaciones

---

### 27. `inventory_purchase_orders`
- **Descripción**: Órdenes de compra a proveedores
- **¿Dónde debería vivir?**: Módulo **Purchase Orders** (supplier-orders renombrado)
- **¿Está implementada?**: ✅ Sí - `src/pages/admin/supply-chain/supplier-orders/page.tsx`
- **¿Requiere nuevo módulo?**: No (ya existe)
- **Notas**: Renombrar módulo a "Purchase Orders"

---

### 28. `inventory_supplier_management`
- **Descripción**: Catálogo y gestión de proveedores
- **¿Dónde debería vivir?**: Módulo **Suppliers**
- **¿Está implementada?**: ✅ Sí - `src/pages/admin/supply-chain/suppliers/page.tsx`
- **¿Requiere nuevo módulo?**: No (ya existe)
- **Notas**: Módulo completo de suppliers

---

### 29. `inventory_sku_management`
- **Descripción**: Catálogo de SKUs y variantes
- **¿Dónde debería vivir?**: Módulo **Inventory** O **Products/Catalog**
- **¿Está implementada?**: ⚠️ Parcial - 🔍 Requiere verificar si Materials tiene SKU
- **¿Requiere nuevo módulo?**: No
- **Notas**: **DECISIÓN**: ¿SKU solo para retail o también para materials?

---

### 30. `inventory_barcode_scanning`
- **Descripción**: Lectura de códigos de barras/QR
- **¿Dónde debería vivir?**: Módulo **Inventory** + **Sales** (shared feature)
- **¿Está implementada?**: ❌ No - Requiere integración con hardware
- **¿Requiere nuevo módulo?**: No
- **Notas**: Usar WebRTC API o lector USB

---

### 31. `inventory_multi_unit_tracking`
- **Descripción**: Conversión entre unidades (kg, litros, etc.)
- **¿Dónde debería vivir?**: Módulo **Inventory**
- **¿Está implementada?**: ⚠️ Parcial - 🔍 Materials tiene tipos (countable, measurable, elaborated)
- **¿Requiere nuevo módulo?**: No
- **Notas**: Verificar si conversiones están implementadas

---

### 32. `inventory_low_stock_auto_reorder`
- **Descripción**: Generación automática de órdenes de compra
- **¿Dónde debería vivir?**: Módulo **Inventory** (automation) + **Purchase Orders**
- **¿Está implementada?**: ❌ No - Requiere automation logic
- **¿Requiere nuevo módulo?**: No
- **Notas**: Cross-module: Inventory detecta → Purchase Orders crea orden

---

### 33. `inventory_demand_forecasting`
- **Descripción**: Predicción de necesidades de inventario
- **¿Dónde debería vivir?**: Módulo **Analytics** O tab en **Inventory**
- **¿Está implementada?**: ❌ No - Requiere ML/analytics
- **¿Requiere nuevo módulo?**: No
- **Notas**: Puede vivir en Intelligence/Analytics como insight

---

### 34. `inventory_available_to_promise`
- **Descripción**: Cálculo de stock disponible para venta (ATP)
- **¿Dónde debería vivir?**: Módulo **Inventory** (cálculo) usado por **Sales**
- **¿Está implementada?**: ⚠️ Parcial - 🔍 Verificar si Sales consulta stock real-time
- **¿Requiere nuevo módulo?**: No
- **Notas**: ATP = Stock - Reservados - Safety Stock

---

### 35. `inventory_batch_lot_tracking`
- **Descripción**: Trazabilidad por lote/batch
- **¿Dónde debería vivir?**: Módulo **Inventory**
- **¿Está implementada?**: ❌ No - Requiere campos adicionales
- **¿Requiere nuevo módulo?**: No
- **Notas**: Importante para alimentos, farmacéuticos (compliance)

---

### 36. `inventory_expiration_tracking`
- **Descripción**: Gestión de fechas de vencimiento (FIFO/FEFO)
- **¿Dónde debería vivir?**: Módulo **Inventory**
- **¿Está implementada?**: ❌ No - 🔍 Verificar si Materials tiene fecha de vencimiento
- **¿Requiere nuevo módulo?**: No
- **Notas**: FIFO = First In First Out, FEFO = First Expired First Out

---

### 37. `inventory_supplier_management` (duplicado? revisar)
*(Ya listado como #28)*

---

## 🏭 PRODUCTION DOMAIN (4 features)

### 38. `production_recipe_management`
- **Descripción**: BOM (Bill of Materials) y recetas
- **¿Dónde debería vivir?**: Módulo **Products/Catalog** (recipes tab)
- **¿Está implementada?**: ✅ Sí - Products tiene RecipeBuilder
- **¿Requiere nuevo módulo?**: No
- **Notas**: BOM = lista de materials necesarios para producir

---

### 39. `production_kitchen_display`
- **Descripción**: KDS (Kitchen Display System)
- **¿Dónde debería vivir?**: ¿Módulo **Production** nuevo O tab en **Operations Hub**?
- **¿Está implementada?**: ❌ No - Solo existe lógica en link module
- **¿Requiere nuevo módulo?**: **DECISIÓN PENDIENTE**
- **Notas**: UI para cocina: órdenes entrantes, en proceso, completadas

---

### 40. `production_order_queue`
- **Descripción**: Gestión de cola de producción
- **¿Dónde debería vivir?**: Mismo módulo que KDS
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: **DECISIÓN PENDIENTE**
- **Notas**: Priorización de órdenes, tiempos estimados

---

### 41. `production_capacity_planning`
- **Descripción**: MRP básico - Material Requirements Planning
- **¿Dónde debería vivir?**: ¿Módulo **Production** O **Analytics** O tab en **Inventory**?
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: **DECISIÓN PENDIENTE**
- **Notas**: Cálculo: Órdenes futuras → Materials requeridos → Purchase Orders

---

## 🏪 OPERATIONS DOMAIN (15 features)

### 42. `operations_pickup_scheduling`
- **Descripción**: Agendamiento de horarios de pickup
- **¿Dónde debería vivir?**: ¿Módulo **Operations Hub** O **Scheduling**?
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No
- **Notas**: Cliente selecciona hora de retiro al ordenar

---

### 43. `operations_notification_system`
- **Descripción**: Notificaciones push/SMS/email
- **¿Dónde debería vivir?**: **Shared Service** (usado por múltiples módulos)
- **¿Está implementada?**: ⚠️ Parcial - 🔍 Verificar si existe NotificationService
- **¿Requiere nuevo módulo?**: No (servicio compartido)
- **Notas**: Usar EventBus para triggers

---

### 44. `operations_delivery_zones`
- **Descripción**: Gestión de zonas geográficas de delivery
- **¿Dónde debería vivir?**: ¿Módulo **Delivery** nuevo O tab en **Operations Hub**?
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: **DECISIÓN PENDIENTE**
- **Notas**: Incluye: mapa, radios, tarifas por zona

---

### 45. `operations_delivery_tracking`
- **Descripción**: Rastreo en tiempo real de deliveries
- **¿Dónde debería vivir?**: Mismo módulo que delivery_zones
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: **DECISIÓN PENDIENTE**
- **Notas**: Requiere: GPS tracking, mapas, notificaciones

---

### 46. `operations_shipping_integration`
- **Descripción**: Integración con correos/transportistas
- **¿Dónde debería vivir?**: Módulo **Finance > Payment Integrations** O separado
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No (integrations)
- **Notas**: APIs: Correo Argentino, OCA, Andreani, FedEx

---

### 47. `operations_deferred_fulfillment`
- **Descripción**: Procesar pedidos para entrega futura
- **¿Dónde debería vivir?**: Módulo **Sales** (orden) + **Operations** (fulfillment)
- **¿Está implementada?**: ⚠️ Parcial - 🔍 Verificar si Sales permite fecha futura
- **¿Requiere nuevo módulo?**: No
- **Notas**: E-commerce: Compra hoy, entrega en 7 días

---

### 48. `operations_table_management`
- **Descripción**: Control de mesas del restaurante
- **¿Dónde debería vivir?**: Módulo **Operations Hub**
- **¿Está implementada?**: ✅ Sí - Operations Hub tiene tabla de mesas
- **¿Requiere nuevo módulo?**: No
- **Notas**: Ya implementado en Operations

---

### 49. `operations_table_assignment`
- **Descripción**: Asignar mesas a clientes/meseros
- **¿Dónde debería vivir?**: Módulo **Operations Hub**
- **¿Está implementada?**: ⚠️ Parcial - 🔍 Verificar funcionalidad completa
- **¿Requiere nuevo módulo?**: No
- **Notas**: Incluye: asignar mesero, tiempo estimado

---

### 50. `operations_floor_plan_config`
- **Descripción**: Diseño del plano del restaurante
- **¿Dónde debería vivir?**: Módulo **Operations Hub** (config) O **Settings**
- **¿Está implementada?**: ❌ No - Requiere editor visual
- **¿Requiere nuevo módulo?**: No
- **Notas**: Editor drag-and-drop de mesas/layout

---

### 51. `operations_bill_splitting`
- **Descripción**: Dividir cuenta entre comensales
- **¿Dónde debería vivir?**: Módulo **Sales** (payment) + **Operations**
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No
- **Notas**: Dividir por persona, por item, o custom

---

### 52. `operations_waitlist_management`
- **Descripción**: Gestión de fila de espera para mesas
- **¿Dónde debería vivir?**: Módulo **Operations Hub**
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No
- **Notas**: Incluye: estimación de espera, notificación cuando disponible

---

### 53. `operations_vendor_performance`
- **Descripción**: KPIs y evaluación de proveedores
- **¿Dónde debería vivir?**: Módulo **Suppliers** (analytics) O **Analytics**
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No
- **Notas**: Métricas: on-time delivery, quality, cost

---

---

## 📅 SCHEDULING DOMAIN (4 features)

### 54. `scheduling_appointment_booking`
- **Descripción**: Sistema de agendamiento de citas
- **¿Dónde debería vivir?**: Módulo **Scheduling** (appointments tab)
- **¿Está implementada?**: ⚠️ Parcial - Scheduling existe pero enfocado en shifts, no appointments
- **¿Requiere nuevo módulo?**: No (agregar tab o separar Appointments como módulo)
- **Notas**: **DECISIÓN**: Scheduling actual = Staff shifts. ¿Agregar Appointments o crear módulo separado?

---

### 55. `scheduling_calendar_management`
- **Descripción**: Calendario de disponibilidad
- **¿Dónde debería vivir?**: Módulo **Scheduling**
- **¿Está implementada?**: ✅ Sí - Scheduling tiene calendario
- **¿Requiere nuevo módulo?**: No
- **Notas**: Calendario compartido puede usarse para shifts Y appointments

---

### 56. `scheduling_reminder_system`
- **Descripción**: Recordatorios automáticos de citas
- **¿Dónde debería vivir?**: Módulo **Scheduling** + Notification Service
- **¿Está implementada?**: ❌ No - Requiere automation
- **¿Requiere nuevo módulo?**: No (feature en Scheduling)
- **Notas**: Usar EventBus + Notification Service

---

### 57. `scheduling_availability_rules`
- **Descripción**: Configuración de horarios disponibles
- **¿Dónde debería vivir?**: Módulo **Scheduling**
- **¿Está implementada?**: ⚠️ Parcial - 🔍 Verificar si tiene config de disponibilidad
- **¿Requiere nuevo módulo?**: No
- **Notas**: Reglas: días laborables, horarios, bloques, excepciones

---

## 👥 CUSTOMER DOMAIN (5 features)

### 58. `customer_service_history`
- **Descripción**: Registro de servicios previos del cliente
- **¿Dónde debería vivir?**: Módulo **Customers** (CRM)
- **¿Está implementada?**: ⚠️ Parcial - 🔍 Verificar si Customers tiene historial
- **¿Requiere nuevo módulo?**: No
- **Notas**: Integración con Sales orders, Appointments, Service records

---

### 59. `customer_preference_tracking`
- **Descripción**: Registro de preferencias del cliente
- **¿Dónde debería vivir?**: Módulo **Customers** (CRM)
- **¿Está implementada?**: ⚠️ Parcial - 🔍 Verificar si hay campos de preferencias
- **¿Requiere nuevo módulo?**: No
- **Notas**: Ejemplo: Alergias, preferencias de producto, canales comunicación

---

### 60. `customer_loyalty_program`
- **Descripción**: Sistema de puntos/recompensas
- **¿Dónde debería vivir?**: ¿Módulo **Customers** O **Memberships** O **Gamification**?
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No
- **Notas**: **DECISIÓN**: Loyalty (puntos) ≠ Memberships (suscripción). ¿Dónde vive?

---

### 61. `customer_online_reservation`
- **Descripción**: Portal web para reservas de clientes
- **¿Dónde debería vivir?**: Módulo **Scheduling** (public-facing) O **Customer Portal**
- **¿Está implementada?**: ❌ No - Requiere portal público
- **¿Requiere nuevo módulo?**: ⚠️ Posible - Portal de cliente público
- **Notas**: Diferentes al admin: Cliente final hace booking sin login admin

---

### 62. `customer_reservation_reminders`
- **Descripción**: Recordatorios automáticos de reservas
- **¿Dónde debería vivir?**: Módulo **Scheduling** + Notification Service
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No
- **Notas**: Similar a `scheduling_reminder_system` (#56)

---

## 💰 FINANCE DOMAIN (4 features)

### 63. `finance_corporate_accounts`
- **Descripción**: Gestión de cuentas empresariales
- **¿Dónde debería vivir?**: Módulo **Customers** (account type) + **Finance > Billing**
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No (cross-module)
- **Notas**: Cuenta corporativa = Customer especial con billing/credit features

---

### 64. `finance_credit_management`
- **Descripción**: Líneas de crédito para clientes B2B
- **¿Dónde debería vivir?**: Módulo **Finance > Billing**
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No
- **Notas**: Credit limit, balance, payment terms, collections

---

### 65. `finance_invoice_scheduling`
- **Descripción**: Facturación programada/recurrente
- **¿Dónde debería vivir?**: Módulo **Finance > Billing**
- **¿Está implementada?**: ❌ No - Billing existe pero sin scheduling
- **¿Requiere nuevo módulo?**: No
- **Notas**: Casos: Suscripciones mensuales, pagos recurrentes

---

### 66. `finance_payment_terms`
- **Descripción**: Configuración de términos de pago B2B
- **¿Dónde debería vivir?**: Módulo **Finance > Billing** O **Customers** (account config)
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No
- **Notas**: Ejemplo: Net 30, Net 60, 50% adelanto + 50% entrega

---

## 📱 MOBILE DOMAIN (5 features)

### 67. `mobile_pos_offline`
- **Descripción**: POS que funciona sin conexión
- **¿Dónde debería vivir?**: Módulo **Sales** (offline mode) O **Mobile POS** separado
- **¿Está implementada?**: ⚠️ Parcial - Sistema offline existe pero 🔍 verificar si Sales lo usa
- **¿Requiere nuevo módulo?**: **DECISIÓN PENDIENTE** (Mobile POS como módulo separado)
- **Notas**: Sistema offline (`src/lib/offline/`) existe, ¿integrado en Sales?

---

### 68. `mobile_location_tracking`
- **Descripción**: GPS tracking del negocio móvil
- **¿Dónde debería vivir?**: ¿Módulo **Mobile POS** O **Delivery**?
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: **DECISIÓN PENDIENTE**
- **Notas**: Uso: Food truck ubicación, Delivery driver tracking

---

### 69. `mobile_route_planning`
- **Descripción**: Optimización de rutas móviles
- **¿Dónde debería vivir?**: Mismo módulo que location_tracking
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: **DECISIÓN PENDIENTE**
- **Notas**: Algoritmos de ruta óptima para deliveries/food truck

---

### 70. `mobile_inventory_constraints`
- **Descripción**: Límites de stock para negocio móvil
- **¿Dónde debería vivir?**: Módulo **Inventory** (mobile mode)
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No
- **Notas**: Food truck tiene subset de inventario total

---

### 71. `mobile_sync_management`
- **Descripción**: Sincronización offline-online para móvil
- **¿Dónde debería vivir?**: **Shared Service** (OfflineSync ya existe)
- **¿Está implementada?**: ✅ Sí - `src/lib/offline/OfflineSync.ts`
- **¿Requiere nuevo módulo?**: No
- **Notas**: Sistema offline ya implementado, solo falta integración en módulos

---

## 🏢 MULTISITE DOMAIN (5 features)

### 72. `multisite_location_management`
- **Descripción**: Administrar múltiples locales
- **¿Dónde debería vivir?**: ¿Módulo **Multi-Location** nuevo O **Settings**?
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: **DECISIÓN PENDIENTE** - Probablemente sí (módulo grande)
- **Notas**: CRUD de locaciones, config per-site, roles per-site

---

### 73. `multisite_centralized_inventory`
- **Descripción**: Inventario consolidado multi-local
- **¿Dónde debería vivir?**: Módulo **Inventory** (multi-site view)
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No (vista agregada en Inventory)
- **Notas**: Ver stock de TODAS las locaciones consolidado

---

### 74. `multisite_transfer_orders`
- **Descripción**: Transferencias entre locales
- **¿Dónde debería vivir?**: ¿Módulo **Multi-Location** O nuevo módulo **Transfers**?
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: **DECISIÓN PENDIENTE**
- **Notas**: Similar a Purchase Orders pero entre locales propios

---

### 75. `multisite_comparative_analytics`
- **Descripción**: Comparación de performance entre locales
- **¿Dónde debería vivir?**: Módulo **Analytics** (multi-site tab)
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No
- **Notas**: KPIs comparativos: Local A vs Local B

---

### 76. `multisite_configuration_per_site`
- **Descripción**: Config específica para cada ubicación
- **¿Dónde debería vivir?**: Módulo **Settings** (per-site selector)
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No
- **Notas**: Ejemplo: Menú diferente per local, horarios diferentes

---

## 📊 ANALYTICS DOMAIN (2 features)

### 77. `analytics_ecommerce_metrics`
- **Descripción**: KPIs de tienda online
- **¿Dónde debería vivir?**: Módulo **Analytics** (e-commerce tab) O dentro de **E-commerce**
- **¿Está implementada?**: ❌ No - E-commerce no existe
- **¿Requiere nuevo módulo?**: No
- **Notas**: Métricas: Conversion rate, cart abandonment, AOV

---

### 78. `analytics_conversion_tracking`
- **Descripción**: Tracking de embudos de conversión
- **¿Dónde debería vivir?**: Módulo **Analytics**
- **¿Está implementada?**: ❌ No
- **¿Requiere nuevo módulo?**: No
- **Notas**: Funnel: Visita → Cart → Checkout → Payment → Complete

---

## 👨‍💼 STAFF DOMAIN (6 features)

### 79. `staff_employee_management`
- **Descripción**: Administración básica de personal
- **¿Dónde debería vivir?**: Módulo **Staff**
- **¿Está implementada?**: ✅ Sí - `src/pages/admin/resources/staff/page.tsx`
- **¿Requiere nuevo módulo?**: No
- **Notas**: CRUD de empleados, core del módulo Staff

---

### 80. `staff_shift_management`
- **Descripción**: Programación y gestión de turnos de trabajo
- **¿Dónde debería vivir?**: Módulo **Scheduling**
- **¿Está implementada?**: ✅ Sí - Scheduling maneja shifts
- **¿Requiere nuevo módulo?**: No
- **Notas**: Scheduling actual enfocado en shifts de staff

---

### 81. `staff_time_tracking`
- **Descripción**: Control de asistencia y horas trabajadas
- **¿Dónde debería vivir?**: Módulo **Staff** O **Scheduling**
- **¿Está implementada?**: ⚠️ Parcial - 🔍 Verificar si existe clock in/out
- **¿Requiere nuevo módulo?**: No
- **Notas**: Time tracking puede vivir en Staff o Scheduling

---

### 82. `staff_performance_tracking`
- **Descripción**: Evaluaciones y métricas de rendimiento
- **¿Dónde debería vivir?**: Módulo **Staff** (performance tab)
- **¿Está implementada?**: ✅ SÍ - PerformanceSection + PerformanceDashboard + Engine
- **¿Requiere nuevo módulo?**: No
- **Notas**:
  - **Components**:
    - `src/pages/admin/resources/staff/components/sections/PerformanceSection.tsx`
    - `src/pages/admin/resources/staff/components/PerformanceDashboard.tsx`
  - **Engine**: `src/pages/admin/resources/staff/services/staffPerformanceAnalyticsEngine.ts`
  - **StaffAnalyticsEnhanced**: Tab completo con métricas
  - KPIs implementados: ventas per employee, productivity, performance metrics
  - 13 archivos encontrados con time tracking/performance logic

---

### 83. `staff_training_management`
- **Descripción**: Programas de entrenamiento y desarrollo
- **¿Dónde debería vivir?**: Módulo **Staff** (training tab)
- **¿Está implementada?**: ❌ No - Requiere sistema de cursos/certificaciones
- **¿Requiere nuevo módulo?**: No
- **Notas**: Tracking: Cursos completados, certificaciones, skills

---

### 84. `staff_labor_cost_tracking`
- **Descripción**: Análisis y tracking de costos de personal
- **¿Dónde debería vivir?**: Módulo **Staff** (costs) + **Analytics**
- **¿Está implementada?**: ✅ SÍ - useRealTimeLaborCosts hook + Engine + UI integration
- **¿Requiere nuevo módulo?**: No
- **Notas**:
  - **Hook**: `src/hooks/useRealTimeLaborCosts.ts` (lines 32-38)
  - **Engine**: `src/pages/admin/resources/staff/services/realTimeLaborCostEngine.ts`
  - **Computed values**:
    - `totalActiveCost` - costo de empleados activos
    - `totalProjectedCost` - proyección de costos
    - Real-time calculation basado en wages + shifts activos
  - **Integration**: Hook usado en Staff module con UI completa
  - Sistema completo y funcional

---

## 🚧 FEATURES ADICIONALES (No en dominios principales)

### 85-86. Features de módulos base
*(Algunas entries en FeatureRegistry son módulos, no features granulares)*

---

## 🚧 ESTADO DEL DOCUMENTO

**Completado**:
- ✅ SALES (24 features)
- ✅ INVENTORY (13 features)
- ✅ PRODUCTION (4 features)
- ✅ OPERATIONS (15 features)
- ✅ SCHEDULING (4 features)
- ✅ CUSTOMER (5 features)
- ✅ FINANCE (4 features)
- ✅ MOBILE (5 features)
- ✅ MULTISITE (5 features)
- ✅ ANALYTICS (2 features)
- ✅ STAFF (6 features)

**Total analizado**: 84 features (86 declaradas en archivo, algunas son módulos no features)

---

## 📊 RESUMEN EJECUTIVO - ESTADO REAL DEL SISTEMA

### Análisis Cuantitativo

| Estado | Cantidad | % | Features |
|--------|----------|---|----------|
| ✅ **Implementadas** | ~15 | 18% | POS, Inventory tracking, Staff CRUD, Scheduling shifts, Suppliers, Purchase Orders, etc. |
| ⚠️ **Parciales** | ~20 | 24% | Split payment, Tips, Alerts, Performance tracking, Time tracking, Offline sync, etc. |
| ❌ **No Implementadas** | ~49 | 58% | E-commerce, B2B, Delivery, KDS, Appointments, Multi-site, Analytics avanzados, etc. |
| **TOTAL** | **84** | 100% | - |

### GAPs Críticos por Capability

| Capability (Setup Wizard) | Features Activadas | Features Implementadas | GAP |
|---------------------------|--------------------|-----------------------|-----|
| `onsite_service` | 16 features | ~12 (75%) | ⚠️ Faltan: floor plan editor, waitlist, bill splitting |
| `pickup_orders` | 11 features | ~7 (64%) | ⚠️ Falta: pickup scheduling UI |
| `delivery_shipping` | 15 features | ~2 (13%) | 🔴 **CRÍTICO** - Falta módulo completo |
| `async_operations` (E-commerce) | 11 features | 0 (0%) | 🔴 **CRÍTICO** - Falta módulo completo |
| `requires_preparation` | 15 features | ~8 (53%) | 🔴 Falta UI de Production (KDS, queue, capacity) |
| `appointment_based` | 9 features | ~3 (33%) | 🔴 Scheduling tiene shifts, no appointments |
| `corporate_sales` (B2B) | 14 features | 0 (0%) | 🔴 **CRÍTICO** - Todas las features B2B faltan |
| `mobile_operations` | 5 features | ~1 (20%) | 🔴 Offline existe, falta integración completa |
| `multi_location` | 5 features | 0 (0%) | 🔴 **CRÍTICO** - Falta módulo completo |

---

## 🚨 DECISIONES ARQUITECTÓNICAS CRÍTICAS

### Nivel 1: Requieren Módulos Nuevos (Probablemente)

1. **E-commerce / Async Operations**
   - Features: cart, checkout, async processing, online payments, catalog e-commerce
   - Opciones:
     - A) Módulo independiente `/admin/ecommerce`
     - B) Mega-tab en Sales
   - **Impacto**: 11 features (13% del sistema)
   - **Recomendación inicial**: Módulo independiente (workflow muy diferente a POS)

2. **Delivery Management**
   - Features: zones, tracking, courier integrations, route planning
   - Opciones:
     - A) Módulo independiente `/admin/delivery`
     - B) Tab en Operations Hub
     - C) Tab en Sales
   - **Impacto**: ~8 features (10% del sistema)
   - **Recomendación inicial**: Tab en Operations (es fulfillment, no venta)

3. **Multi-Location / Multi-Site**
   - Features: location mgmt, transfers, centralized inventory, comparative analytics, per-site config
   - Opciones:
     - A) Módulo independiente `/admin/locations`
     - B) Features distribuidas (Inventory, Settings, Analytics)
   - **Impacto**: 5 features (6% del sistema)
   - **Recomendación inicial**: Módulo independiente (suficientemente grande y complejo)

4. **Production UI (KDS + Queue + Capacity)**
   - Features: kitchen display, order queue, capacity planning
   - Opciones:
     - A) Módulo independiente `/admin/production`
     - B) Tab en Operations Hub
     - C) Tab en Products
   - **Impacto**: 3-4 features (5% del sistema)
   - **Recomendación inicial**: Tab en Operations (es operación diaria)

---

### Nivel 2: B2B - Caso Especial (Features Distribuidas)

**B2B Sales / Corporate Sales**
- Features: quotes, contracts, approvals, bulk pricing, tiered pricing, corporate accounts, credit mgmt, payment terms, quote-to-order
- **Total**: 14 features (17% del sistema)

**Análisis**:
- ❌ NO crear módulo "B2B Sales" monolítico
- ✅ Distribuir features en módulos existentes:
  - **Sales**: quotes, quote-to-order, bulk orders
  - **Customers**: corporate accounts, segmentation
  - **Finance > Billing**: credit mgmt, payment terms, invoicing
  - **Products/Catalog**: bulk pricing, tiered pricing
  - **Settings**: approval workflows (reutilizable)

**Razón**: B2B no es un "módulo", es un **modo de operación** que activa features en múltiples módulos

---

### Nivel 3: Features que Viven en Módulos Existentes

1. **Appointments** (dentro de Scheduling)
   - Scheduling actual = shifts de staff
   - Agregar tab "Appointments" para servicios con cita
   - Comparte calendario, solo cambia el dominio (staff vs customers)

2. **Loyalty Program** (¿dónde?)
   - Opciones: Customers, Memberships, Gamification
   - **Decisión pendiente**: Loyalty ≠ Memberships
   - Loyalty = puntos por compras → ¿Gamification?
   - Memberships = suscripción paga → Módulo separado

3. **Multi-catalog** (dentro de Products/Catalog)
   - No requiere módulo nuevo
   - Feature: gestionar múltiples catálogos (onsite, online, delivery, etc.)

4. **Analytics Features** (consolidar Intelligence + Reporting + Executive)
   - Crear módulo "Analytics" único
   - Tabs: Reports (custom), Market (intelligence), Executive (KPIs), E-commerce (metrics)

---

## 📋 PRÓXIMOS PASOS RECOMENDADOS

### Paso 1: Verificar Features Marcadas como ⚠️ Parcial

Investigar código actual para confirmar estado:
- `sales_split_payment` - ¿Existe en Sales payment screen?
- `sales_tip_management` - ¿Existe en Sales?
- `sales_coupon_management` - ¿Existe parcialmente?
- `inventory_alert_system` - ¿Tiene UI de configuración?
- `inventory_sku_management` - ¿Materials tiene SKU?
- `inventory_multi_unit_tracking` - ¿Conversiones implementadas?
- `inventory_available_to_promise` - ¿Sales consulta stock real-time?
- `operations_table_assignment` - ¿Funcionalidad completa?
- `operations_deferred_fulfillment` - ¿Sales permite fecha futura?
- `customer_service_history` - ¿Customers tiene historial?
- `customer_preference_tracking` - ¿Hay campos de preferencias?
- `staff_time_tracking` - ¿Clock in/out existe?
- `staff_performance_tracking` - ¿Staff tiene performance metrics?
- `staff_labor_cost_tracking` - ¿Hook está integrado en UI?

**Método**: Grep en código + leer componentes principales de cada módulo

---

### Paso 2: Tomar Decisiones Arquitectónicas (Workshop)

Resolver las 4 decisiones Nivel 1:
1. E-commerce: ¿Módulo o tab?
2. Delivery: ¿Dónde vive?
3. Multi-Location: ¿Módulo o distribuido?
4. Production UI: ¿Dónde vive?

**Método**: Revisar tus respuestas en NAVIGATION_WORKSHOP_2025.md + discutir complejidad

---

### Paso 3: Diseñar Arquitectura de Casos Complejos

Basado en tus preguntas pendientes:
- **Inventory vs Assets**: Separar consumibles de equipos
- **Catalog Multi-Tipo**: UI dinámica para evitar nested tabs
- **B2B Features**: Mapeo detallado a módulos existentes
- **Fulfillment Multi-Canal**: Cómo Sales/E-commerce/Delivery interactúan

**Método**: Documentos de diseño específicos por tema

---

### Paso 4: Crear Lista Definitiva de Módulos

Con decisiones tomadas, definir:
- Módulos finales (cantidad)
- Agrupación por dominios
- Orden en navegación
- Tabs vs módulos independientes

**Salida**: Lista definitiva para implementar

---

## 📊 DECISIONES PENDIENTES IDENTIFICADAS

### Arquitectónicas (Requieren diseño)
1. **E-commerce**: ¿Módulo independiente o tab en Sales?
2. **Delivery**: ¿Módulo independiente o tab en Operations Hub?
3. **Multi-Location**: ¿Módulo independiente o features distribuidas?
4. **Production UI**: ¿Módulo independiente, tab en Operations, o tab en Products?

### De Organización (Menos críticas)
5. **Appointments**: ¿Tab en Scheduling o módulo separado?
6. **Loyalty Program**: ¿En Customers, Memberships, o Gamification?
7. **SKU Management**: ¿Solo en Products/Catalog o también en Inventory?
8. **Demand Forecasting**: ¿En Analytics o en Inventory?
9. **Capacity Planning**: ¿En Production, Analytics, o Inventory?
10. **Customer Portal**: ¿Módulo separado o parte de public routes?

---

## 🎯 MÉTRICAS FINALES

- **Features totales**: 84
- **Módulos actuales**: 24
- **Features sin módulo claro**: ~15 (requieren decisiones)
- **Features cross-module**: ~20 (B2B, Analytics, Notifications, etc.)
- **GAP de implementación**: 58% del sistema
- **Capabilities sin soporte completo**: 5 de 10 (50%)

---

**Documento completado**: 2025-01-14
**Próxima acción**: Verificar features ⚠️ Parciales mediante análisis de código
