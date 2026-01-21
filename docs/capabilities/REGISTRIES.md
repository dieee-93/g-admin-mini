# Complete Registry Reference

**Exhaustive documentation of all three registries in the Capability-Features System**

**Version**: 4.0
**Last Updated**: 2025-01-20

---

## Table of Contents

1. [BusinessModelRegistry](#businessmodelregistry)
   - [Business Capabilities (12)](#business-capabilities-12)
   - [Infrastructure Options (3)](#infrastructure-options-3)
   - [Helper Functions](#businessmodelregistry-helper-functions)
2. [FeatureRegistry](#featureregistry)
   - [All Features by Domain (88)](#all-features-by-domain-88)
   - [MODULE_FEATURE_MAP](#module_feature_map)
   - [Helper Functions](#featureregistry-helper-functions)
3. [Capability-Requirements Mapping](#capability-requirements-mapping)
   - [CAPABILITY_REQUIREMENTS](#capability_requirements)
   - [Helper Functions](#requirements-helper-functions)

---

## BusinessModelRegistry

**Location**: `src/config/BusinessModelRegistry.ts`

Defines what the user **CHOOSES** in the setup wizard. This is the atomic version 2.0 - capabilities are atomic (indivisible) and can be freely combined.

### Business Capabilities (12)

#### Core Business Models (5)

##### 1. `physical_products`

```typescript
{
  id: 'physical_products',
  name: 'Productos Físicos',
  description: 'Comida, retail, manufactura, artículos tangibles',
  icon: '🍕',
  type: 'business_model',

  activatesFeatures: [
    // PRODUCTION (4 features)
    'production_bom_management',
    'production_display_system',
    'production_order_queue',
    'production_capacity_planning',

    // INVENTORY (8 features)
    'inventory_stock_tracking',
    'inventory_alert_system',
    'inventory_purchase_orders',
    'inventory_supplier_management',
    'inventory_low_stock_auto_reorder',
    'inventory_sku_management',
    'inventory_barcode_scanning',
    'inventory_multi_unit_tracking',

    // PRODUCTS (4 features)
    'products_recipe_management',
    'products_catalog_menu',
    'products_cost_intelligence',
    'products_availability_calculation',

    // SALES (2 features)
    'sales_order_management',
    'sales_payment_processing'
  ],

  blockingRequirements: [] // None - most flexible capability
}
```

**When to use**: Food businesses, retail, manufacturing, any tangible products
**Example businesses**: Restaurant, bakery, retail store, factory
**Total features activated**: 18

---

##### 2. `professional_services`

```typescript
{
  id: 'professional_services',
  name: 'Servicios Profesionales',
  description: 'Consultoría, salud, belleza, reparaciones',
  icon: '👨‍⚕️',
  type: 'business_model',

  activatesFeatures: [
    // SCHEDULING (4 features)
    'scheduling_appointment_booking',
    'scheduling_calendar_management',
    'scheduling_reminder_system',
    'scheduling_availability_rules',

    // PRODUCTION (2 features) - Services have "recipes" (BOM light)
    'production_bom_management',
    'production_order_queue',

    // CUSTOMER (2 features)
    'customer_service_history',
    'customer_preference_tracking',

    // SALES (3 features)
    'sales_order_management',
    'sales_payment_processing',
    'sales_package_management',

    // PRODUCTS (1 feature)
    'products_package_management',

    // STAFF (5 features) - Professionals delivering services
    'staff_employee_management',
    'staff_shift_management',
    'staff_time_tracking',
    'staff_performance_tracking',
    'staff_labor_cost_tracking'
  ],

  blockingRequirements: []
}
```

**When to use**: Service-based businesses requiring appointments
**Example businesses**: Hair salon, dental clinic, consulting, repair shop
**Total features activated**: 17

---

##### 3. `asset_rental`

```typescript
{
  id: 'asset_rental',
  name: 'Alquiler de Activos',
  description: 'Renta de equipos, espacios o vehículos',
  icon: '🔑',
  type: 'special_operation',

  activatesFeatures: [
    // RENTAL (5 features)
    'rental_item_management',
    'rental_booking_calendar',
    'rental_availability_tracking',
    'rental_pricing_by_duration',
    'rental_late_fees',

    // CUSTOMER (2 features)
    'customer_service_history',
    'customer_preference_tracking'
  ],

  blockingRequirements: []
}
```

**When to use**: Equipment rental, space rental, vehicle rental
**Example businesses**: Tool rental, event space, car rental, equipment leasing
**Total features activated**: 7

---

##### 4. `membership_subscriptions`

```typescript
{
  id: 'membership_subscriptions',
  name: 'Membresías y Suscripciones',
  description: 'Acceso recurrente a servicios o espacios',
  icon: '💳',
  type: 'special_operation',

  activatesFeatures: [
    // MEMBERSHIP (5 features)
    'membership_subscription_plans',
    'membership_recurring_billing',
    'membership_access_control',
    'membership_usage_tracking',
    'membership_benefits_management',

    // CUSTOMER (4 features)
    'customer_service_history',
    'customer_preference_tracking',
    'customer_loyalty_program',
    'customer_online_accounts',

    // FINANCE (3 features)
    'finance_credit_management',
    'finance_invoice_scheduling',
    'finance_payment_terms'
  ],

  blockingRequirements: []
}
```

**When to use**: Gym memberships, club access, subscription services
**Example businesses**: Gym, coworking space, subscription box, club
**Total features activated**: 12

---

##### 5. `digital_products`

```typescript
{
  id: 'digital_products',
  name: 'Productos Digitales',
  description: 'Venta de archivos, licencias y contenido digital',
  icon: '💾',
  type: 'special_operation',

  activatesFeatures: [
    // DIGITAL (4 features)
    'digital_file_delivery',
    'digital_license_management',
    'digital_download_tracking',
    'digital_version_control',

    // ONLINE STORE (4 features) - Required for digital distribution
    'sales_catalog_ecommerce',
    'sales_online_order_processing',
    'sales_online_payment_gateway',
    'sales_cart_management',

    // ANALYTICS (2 features)
    'analytics_ecommerce_metrics',
    'analytics_conversion_tracking'
  ],

  blockingRequirements: []
}
```

**When to use**: Downloadable products, software licenses, digital content
**Example businesses**: Software vendor, digital course platform, stock photos, ebooks
**Total features activated**: 10

---

#### Fulfillment Methods (3)

##### 6. `onsite_service`

```typescript
{
  id: 'onsite_service',
  name: 'Servicio en Local',
  description: 'Servicio/consumo en el local (mesas, cabinas)',
  icon: '🏪',
  type: 'fulfillment',

  activatesFeatures: [
    // SALES (8 features)
    'sales_order_management',
    'sales_payment_processing',
    'sales_catalog_menu',
    'sales_pos_onsite',
    'sales_dine_in_orders',
    'sales_split_payment',
    'sales_tip_management',
    'sales_coupon_management',

    // PRODUCTS (1 feature)
    'products_catalog_menu',

    // OPERATIONS (5 features)
    'operations_table_management',
    'operations_table_assignment',
    'operations_floor_plan_config',
    'operations_waitlist_management',
    'operations_bill_splitting',

    // INVENTORY (4 features)
    'inventory_stock_tracking',
    'inventory_supplier_management',
    'inventory_alert_system',
    'inventory_low_stock_auto_reorder',

    // STAFF (4 features)
    'staff_employee_management',
    'staff_shift_management',
    'staff_time_tracking',
    'staff_performance_tracking'
  ],

  blockingRequirements: [
    'business_address_required',
    'operating_hours_required'
  ]
}
```

**When to use**: Customers consume/receive service at your location
**Example businesses**: Sit-down restaurant, café, spa, barbershop
**Total features activated**: 22
**Required achievements**: Business address, operating hours

---

##### 7. `pickup_orders`

```typescript
{
  id: 'pickup_orders',
  name: 'Retiro en Local',
  description: 'Cliente retira pedidos en local',
  icon: '🏪',
  type: 'fulfillment',

  activatesFeatures: [
    // SALES (6 features)
    'sales_order_management',
    'sales_payment_processing',
    'sales_catalog_menu',
    'sales_pickup_orders',
    'sales_split_payment',
    'sales_coupon_management',

    // PRODUCTS (1 feature)
    'products_catalog_menu',

    // OPERATIONS (2 features)
    'operations_pickup_scheduling',
    'operations_notification_system',

    // INVENTORY (4 features)
    'inventory_stock_tracking',
    'inventory_supplier_management',
    'inventory_alert_system',
    'inventory_low_stock_auto_reorder',

    // STAFF (3 features)
    'staff_employee_management',
    'staff_shift_management',
    'staff_time_tracking'
  ],

  blockingRequirements: [
    'business_address_required',
    'pickup_hours_required'
  ]
}
```

**When to use**: Customers order ahead and pick up
**Example businesses**: TakeAway, bakery, coffee shop, pharmacy
**Total features activated**: 16
**Required achievements**: Business address, pickup hours

---

##### 8. `delivery_shipping`

```typescript
{
  id: 'delivery_shipping',
  name: 'Envío a Domicilio',
  description: 'Delivery/shipping de productos',
  icon: '🚚',
  type: 'fulfillment',

  activatesFeatures: [
    // SALES (6 features)
    'sales_order_management',
    'sales_payment_processing',
    'sales_catalog_menu',
    'sales_delivery_orders',
    'sales_split_payment',
    'sales_coupon_management',

    // PRODUCTS (1 feature)
    'products_catalog_menu',

    // OPERATIONS (3 features)
    'operations_delivery_zones',
    'operations_delivery_tracking',
    'operations_notification_system',

    // INVENTORY (4 features)
    'inventory_stock_tracking',
    'inventory_supplier_management',
    'inventory_alert_system',
    'inventory_low_stock_auto_reorder',

    // STAFF (4 features)
    'staff_employee_management',
    'staff_shift_management',
    'staff_time_tracking',
    'staff_performance_tracking'
  ],

  blockingRequirements: [
    'delivery_zones_required',
    'delivery_fees_required',
    'delivery_hours_required'
  ]
}
```

**When to use**: Deliver products to customer location
**Example businesses**: Food delivery, courier, e-commerce with shipping
**Total features activated**: 18
**Required achievements**: Delivery zones, delivery fees, delivery hours

---

#### Special Operations (4)

##### 9. `async_operations`

```typescript
{
  id: 'async_operations',
  name: 'Operaciones Asíncronas',
  description: 'Recibe pedidos, reservas y citas fuera del horario operativo',
  icon: '🌙',
  type: 'special_operation',

  activatesFeatures: [
    // SALES (6 features)
    'sales_catalog_ecommerce',
    'sales_online_order_processing',
    'sales_online_payment_gateway',
    'sales_cart_management',
    'sales_checkout_process',
    'sales_coupon_management',

    // PRODUCTS (2 features)
    'products_catalog_ecommerce',
    'products_availability_calculation',

    // ANALYTICS (2 features)
    'analytics_ecommerce_metrics',
    'analytics_conversion_tracking',

    // OPERATIONS (1 feature)
    'operations_deferred_fulfillment',

    // INVENTORY (1 feature)
    'inventory_available_to_promise',

    // CUSTOMER (1 feature)
    'customer_online_accounts'
  ],

  blockingRequirements: [
    'website_url_required',
    'payment_methods_required'
  ]
}
```

**When to use**: Accept orders/bookings 24/7, even when closed
**Example businesses**: Restaurant with online ordering, salon with online booking
**Total features activated**: 13
**Required achievements**: Website URL, payment methods
**Note**: Renamed from `online_store` in v4.0

---

##### 10. `corporate_sales`

```typescript
{
  id: 'corporate_sales',
  name: 'Ventas Corporativas',
  description: 'Ventas B2B',
  icon: '🏢',
  type: 'special_operation',

  activatesFeatures: [
    // FINANCE (4 features)
    'finance_corporate_accounts',
    'finance_credit_management',
    'finance_invoice_scheduling',
    'finance_payment_terms',

    // SALES (6 features)
    'sales_contract_management',
    'sales_tiered_pricing',
    'sales_approval_workflows',
    'sales_quote_to_order',
    'sales_bulk_pricing',
    'sales_quote_generation',

    // PRODUCTS (2 features)
    'products_catalog_ecommerce',
    'products_cost_intelligence',

    // INVENTORY (2 features)
    'inventory_available_to_promise',
    'inventory_demand_forecasting',

    // OPERATIONS (1 feature)
    'operations_vendor_performance',

    // STAFF (2 features)
    'staff_employee_management',
    'staff_performance_tracking'
  ],

  blockingRequirements: [
    'business_license_required'
  ]
}
```

**When to use**: Sell to other businesses (B2B)
**Example businesses**: Wholesale distributor, B2B service provider, supplier
**Total features activated**: 17
**Required achievements**: Business license

---

##### 11. `mobile_operations`

```typescript
{
  id: 'mobile_operations',
  name: 'Operaciones Móviles',
  description: 'Food truck, servicios móviles',
  icon: '🚐',
  type: 'special_operation',

  activatesFeatures: [
    // MOBILE (3 features)
    'mobile_location_tracking',
    'mobile_route_planning',
    'mobile_inventory_constraints',

    // PRODUCTS (1 feature)
    'products_catalog_menu',

    // STAFF (4 features)
    'staff_employee_management',
    'staff_shift_management',
    'staff_time_tracking',
    'staff_performance_tracking'
  ],

  blockingRequirements: [
    'mobile_equipment_required'
  ]
}
```

**When to use**: Business operates from mobile location
**Example businesses**: Food truck, mobile salon, mobile repair service
**Total features activated**: 8
**Required achievements**: Mobile equipment configured

---

### Infrastructure Options (3)

##### 1. `single_location`

```typescript
{
  id: 'single_location',
  name: 'Local Fijo',
  description: 'Opera desde una ubicación física fija',
  icon: '🏪',
  type: 'infrastructure',

  conflicts: [], // Can combine with multi_location and mobile

  activatesFeatures: [], // No additional features

  blockingRequirements: [
    'business_address_required'
  ]
}
```

**When to use**: Single fixed location
**Conflicts**: None (base infrastructure)
**Total features activated**: 0 (provides foundation for other capabilities)

---

##### 2. `multi_location`

```typescript
{
  id: 'multi_location',
  name: 'Múltiples Locales',
  description: 'Cadena/franquicia con varias ubicaciones',
  icon: '🏢',
  type: 'infrastructure',

  conflicts: [], // Requires single_location implicitly

  activatesFeatures: [
    // MULTISITE (5 features)
    'multisite_location_management',
    'multisite_centralized_inventory',
    'multisite_transfer_orders',
    'multisite_comparative_analytics',
    'multisite_configuration_per_site'
  ],

  blockingRequirements: [
    'primary_location_required',
    'additional_locations_required'
  ]
}
```

**When to use**: Multiple locations (chain, franchise)
**Conflicts**: None
**Total features activated**: 5
**Required achievements**: Primary location, additional locations

---

##### 3. `mobile_business`

```typescript
{
  id: 'mobile_business',
  name: 'Negocio Móvil',
  description: 'Food truck, servicios móviles',
  icon: '🚐',
  type: 'infrastructure',

  conflicts: [], // Can combine with everything

  activatesFeatures: [], // Covered by mobile_operations capability

  blockingRequirements: [
    'mobile_equipment_required'
  ]
}
```

**When to use**: Mobile business infrastructure
**Conflicts**: None (can combine with single_location for base + mobile)
**Total features activated**: 0 (features activated by `mobile_operations` capability)

---

### BusinessModelRegistry Helper Functions

#### `getCapability(id: BusinessCapabilityId)`

```typescript
import { getCapability } from '@/config/BusinessModelRegistry';

const capability = getCapability('physical_products');
console.log(capability?.name); // "Productos Físicos"
console.log(capability?.activatesFeatures.length); // 18
```

**Purpose**: Get capability definition by ID
**Returns**: `BusinessCapability | undefined`
**Use case**: Display capability details, check activated features

---

#### `getInfrastructure(id: InfrastructureId)`

```typescript
import { getInfrastructure } from '@/config/BusinessModelRegistry';

const infra = getInfrastructure('multi_location');
console.log(infra?.name); // "Múltiples Locales"
console.log(infra?.activatesFeatures.length); // 5
```

**Purpose**: Get infrastructure definition by ID
**Returns**: `Infrastructure | undefined`
**Use case**: Display infrastructure details, check conflicts

---

#### `getAllCapabilities()`

```typescript
import { getAllCapabilities } from '@/config/BusinessModelRegistry';

const all = getAllCapabilities();
console.log(all.length); // 12
console.log(all[0].id); // 'physical_products'
```

**Purpose**: Get all capability definitions
**Returns**: `BusinessCapability[]`
**Use case**: Render capability selector in setup wizard

---

#### `getAllInfrastructures()`

```typescript
import { getAllInfrastructures } from '@/config/BusinessModelRegistry';

const all = getAllInfrastructures();
console.log(all.length); // 3
```

**Purpose**: Get all infrastructure definitions
**Returns**: `Infrastructure[]`
**Use case**: Render infrastructure selector

---

#### `checkInfrastructureConflicts(infrastructureId, activeInfrastructure)`

```typescript
import { checkInfrastructureConflicts } from '@/config/BusinessModelRegistry';

const result = checkInfrastructureConflicts(
  'mobile_business',
  ['single_location', 'multi_location']
);

console.log(result.valid); // true (no conflicts)
console.log(result.conflicts); // []
```

**Purpose**: Validate infrastructure selection
**Parameters**:
- `infrastructureId`: Infrastructure to check
- `activeInfrastructure`: Currently selected infrastructure

**Returns**: `{ valid: boolean, conflicts: InfrastructureId[] }`
**Use case**: Prevent conflicting infrastructure selections

---

#### `getActivatedFeatures(capabilities, infrastructure)`

```typescript
import { getActivatedFeatures } from '@/config/BusinessModelRegistry';

const features = getActivatedFeatures(
  ['physical_products', 'onsite_service'],
  ['single_location']
);

console.log(features.length); // 32 (union of all activated features)
console.log(features.includes('production_bom_management')); // true
console.log(features.includes('operations_table_management')); // true
```

**Purpose**: Get all features activated by user choices
**Parameters**:
- `capabilities`: Selected business capabilities
- `infrastructure`: Selected infrastructure

**Returns**: `FeatureId[]` (deduplicated set union)
**Use case**: Core engine - determines active features

---

#### `getBlockingRequirements(capabilities, infrastructure)`

```typescript
import { getBlockingRequirements } from '@/config/BusinessModelRegistry';

const requirements = getBlockingRequirements(
  ['onsite_service', 'delivery_shipping'],
  ['single_location']
);

console.log(requirements);
// [
//   'business_address_required',
//   'operating_hours_required',
//   'delivery_zones_required',
//   'delivery_fees_required',
//   'delivery_hours_required'
// ]
```

**Purpose**: Get all blocking requirements for user choices
**Parameters**:
- `capabilities`: Selected business capabilities
- `infrastructure`: Selected infrastructure

**Returns**: `string[]` (deduplicated set union)
**Use case**: Determine which achievements must be completed

---

## FeatureRegistry

**Location**: `src/config/FeatureRegistry.ts`

Registry of 88 granular features organized by domain. Features are **automatically activated** by BusinessModelRegistry based on user choices.

### All Features by Domain (88)

#### SALES Domain (26 features)

| Feature ID | Name | Description | Category |
|------------|------|-------------|----------|
| `sales_order_management` | Gestión de Órdenes | Sistema base de gestión de pedidos | conditional |
| `sales_payment_processing` | Procesamiento de Pagos | Sistema de cobros y procesamiento de pagos | conditional |
| `sales_catalog_menu` | Catálogo para Menú | Catálogo estilo menú para ventas en local | conditional |
| `sales_catalog_ecommerce` | Catálogo E-commerce | Catálogo avanzado para tienda online | conditional |
| `sales_package_management` | Gestión de Paquetes | Bundles y paquetes de productos/servicios | conditional |
| `sales_pos_onsite` | POS en Local | Punto de venta para consumo en local | conditional |
| `sales_dine_in_orders` | Órdenes para Consumo en Local | Gestión de órdenes para mesas/cabinas | conditional |
| `sales_order_at_table` | Pedidos en Mesa | Tomar pedidos directamente en la mesa | conditional |
| `sales_online_order_processing` | Procesamiento Asincrónico | Procesar pedidos fuera de horario comercial | conditional |
| `sales_online_payment_gateway` | Gateway de Pagos Online | Integración con pasarelas de pago digitales | conditional |
| `sales_cart_management` | Gestión de Carrito | Carrito de compras para e-commerce | conditional |
| `sales_checkout_process` | Proceso de Checkout | Flujo de compra online completo | conditional |
| `sales_multicatalog_management` | Gestión Multi-Catálogo | Gestionar múltiples catálogos (online + onsite) | conditional |
| `sales_bulk_pricing` | Precios por Volumen | Pricing escalonado por cantidad | conditional |
| `sales_quote_generation` | Generación de Cotizaciones | Sistema de cotizaciones B2B | conditional |
| `sales_product_retail` | Venta de Productos Retail | Venta de productos minoristas | conditional |
| `sales_contract_management` | Gestión de Contratos | Contratos corporativos B2B | conditional |
| `sales_tiered_pricing` | Precios Diferenciados | Pricing por niveles/segmentos de cliente | conditional |
| `sales_approval_workflows` | Flujos de Aprobación | Aprobaciones multinivel para ventas B2B | conditional |
| `sales_quote_to_order` | Cotización a Orden | Convertir cotizaciones en órdenes | conditional |
| `sales_split_payment` | Pago Dividido | Dividir pago en múltiples métodos | conditional |
| `sales_tip_management` | Gestión de Propinas | Sistema de propinas para restaurantes/servicios | conditional |
| `sales_coupon_management` | Gestión de Cupones | Sistema de descuentos y cupones promocionales | conditional |
| `sales_pickup_orders` | Pedidos para Retirar | Sistema de pedidos TakeAway/Pick-up | conditional |
| `sales_delivery_orders` | Pedidos a Domicilio | Sistema de pedidos con entrega a domicilio | conditional |

**Total**: 26 features

---

#### INVENTORY Domain (13 features)

| Feature ID | Name | Description | Category |
|------------|------|-------------|----------|
| `inventory_stock_tracking` | Seguimiento de Stock | Control básico de inventario | conditional |
| `inventory_alert_system` | Sistema de Alertas | Alertas de stock bajo/crítico | conditional |
| `inventory_purchase_orders` | Órdenes de Compra | Gestión de órdenes de compra a proveedores | conditional |
| `inventory_supplier_management` | Gestión de Proveedores | Catálogo y gestión de proveedores | conditional |
| `inventory_sku_management` | Gestión de SKUs | Catálogo de SKUs y variantes | conditional |
| `inventory_barcode_scanning` | Escaneo de Códigos | Lectura de códigos de barras/QR | conditional |
| `inventory_multi_unit_tracking` | Seguimiento Multi-Unidad | Conversión entre unidades (kg, litros, etc.) | conditional |
| `inventory_low_stock_auto_reorder` | Reorden Automático | Generación automática de órdenes de compra | conditional |
| `inventory_demand_forecasting` | Pronóstico de Demanda | Predicción de necesidades de inventario | conditional |
| `inventory_available_to_promise` | Disponible para Prometer (ATP) | Cálculo de stock disponible para venta | conditional |
| `inventory_batch_lot_tracking` | Seguimiento de Lotes | Trazabilidad por lote/batch | conditional |
| `inventory_expiration_tracking` | Seguimiento de Vencimientos | Gestión de fechas de vencimiento (FIFO/FEFO) | conditional |

**Total**: 13 features (Note: `inventory_expiration_tracking` was recently added, bringing total to 13)

---

#### PRODUCTION Domain (4 features)

| Feature ID | Name | Description | Category |
|------------|------|-------------|----------|
| `production_bom_management` | BOM Management | Bill of Materials management for production | conditional |
| `production_display_system` | Production Display System | Display system for production queue (KDS, job board) | conditional |
| `production_order_queue` | Cola de Órdenes | Gestión de cola de producción | conditional |
| `production_capacity_planning` | Planificación de Capacidad | MRP básico - Material Requirements Planning | conditional |

**Total**: 4 features

---

#### PRODUCTS Domain (8 features)

| Feature ID | Name | Description | Category |
|------------|------|-------------|----------|
| `products_recipe_management` | Recipe Management | Product recipe/BOM definition, costing, pricing | conditional |
| `products_catalog_menu` | Menu Catalog | Menu-style product catalog for onsite sales | conditional |
| `products_catalog_ecommerce` | E-commerce Catalog | Advanced product catalog for online store | conditional |
| `products_package_management` | Package Management | Product bundles and packages | conditional |
| `products_availability_calculation` | Availability Calculation | Real-time product availability based on materials | conditional |
| `products_cost_intelligence` | Cost Intelligence | Automated recipe costing and margin analysis | conditional |
| `products_dynamic_materials` | Dynamic Materials | Add materials during service delivery | conditional |

**Total**: 7 features (Note: `products_digital_delivery` was removed/moved to DIGITAL domain)

---

#### OPERATIONS Domain (15 features)

| Feature ID | Name | Description | Category |
|------------|------|-------------|----------|
| `operations_pickup_scheduling` | Programación de Retiros | Agendamiento de horarios de pickup | conditional |
| `operations_notification_system` | Sistema de Notificaciones | Notificaciones push/SMS/email | conditional |
| `operations_delivery_zones` | Zonas de Entrega | Gestión de zonas geográficas de delivery | conditional |
| `operations_delivery_tracking` | Seguimiento de Entregas | Rastreo en tiempo real de deliveries | conditional |
| `operations_shipping_integration` | Integración con Couriers | Integración con correos/transportistas | conditional |
| `operations_deferred_fulfillment` | Cumplimiento Diferido | Procesar pedidos para entrega futura | conditional |
| `operations_table_management` | Gestión de Mesas | Control de mesas del restaurante | conditional |
| `operations_table_assignment` | Asignación de Mesas | Asignar mesas a clientes/meseros | conditional |
| `operations_floor_plan_config` | Configuración de Plano | Diseño del plano del restaurante | conditional |
| `operations_bill_splitting` | División de Cuentas | Dividir cuenta entre comensales | conditional |
| `operations_waitlist_management` | Lista de Espera | Gestión de fila de espera para mesas | conditional |
| `operations_vendor_performance` | Performance de Proveedores | KPIs y evaluación de proveedores | conditional |

**Total**: 12 features (Note: Some features may have been added/removed)

---

#### SCHEDULING Domain (4 features)

| Feature ID | Name | Description | Category |
|------------|------|-------------|----------|
| `scheduling_appointment_booking` | Reserva de Citas | Sistema de agendamiento de citas | conditional |
| `scheduling_calendar_management` | Gestión de Calendario | Calendario de disponibilidad | conditional |
| `scheduling_reminder_system` | Sistema de Recordatorios | Recordatorios automáticos de citas | conditional |
| `scheduling_availability_rules` | Reglas de Disponibilidad | Configuración de horarios disponibles | conditional |

**Total**: 4 features

---

#### CUSTOMER Domain (5 features)

| Feature ID | Name | Description | Category |
|------------|------|-------------|----------|
| `customer_service_history` | Historial de Servicios | Registro de servicios previos del cliente | conditional |
| `customer_preference_tracking` | Seguimiento de Preferencias | Registro de preferencias del cliente | conditional |
| `customer_loyalty_program` | Programa de Lealtad | Sistema de puntos/recompensas | conditional |
| `customer_online_accounts` | Reservas Online | Portal web para reservas de clientes | conditional |

**Total**: 4 features (Note: One feature may have been renamed/removed)

---

#### FINANCE Domain (4 features)

| Feature ID | Name | Description | Category |
|------------|------|-------------|----------|
| `finance_corporate_accounts` | Cuentas Corporativas | Gestión de cuentas empresariales | conditional |
| `finance_credit_management` | Gestión de Crédito | Líneas de crédito para clientes B2B | conditional |
| `finance_invoice_scheduling` | Programación de Facturas | Facturación programada/recurrente | conditional |
| `finance_payment_terms` | Términos de Pago | Configuración de términos de pago B2B | conditional |

**Total**: 4 features

---

#### MOBILE Domain (3 features)

| Feature ID | Name | Description | Category |
|------------|------|-------------|----------|
| `mobile_location_tracking` | Seguimiento de Ubicación | GPS tracking del negocio móvil | conditional |
| `mobile_route_planning` | Planificación de Rutas | Optimización de rutas móviles | conditional |
| `mobile_inventory_constraints` | Restricciones de Inventario | Límites de stock para negocio móvil | conditional |

**Total**: 3 features

---

#### MULTISITE Domain (5 features)

| Feature ID | Name | Description | Category |
|------------|------|-------------|----------|
| `multisite_location_management` | Gestión de Ubicaciones | Administrar múltiples locales | conditional |
| `multisite_centralized_inventory` | Inventario Centralizado | Inventario consolidado multi-local | conditional |
| `multisite_transfer_orders` | Órdenes de Transferencia | Transferencias entre locales | conditional |
| `multisite_comparative_analytics` | Analytics Comparativo | Comparación de performance entre locales | conditional |
| `multisite_configuration_per_site` | Configuración por Local | Config específica para cada ubicación | conditional |

**Total**: 5 features

---

#### ANALYTICS Domain (2 features)

| Feature ID | Name | Description | Category |
|------------|------|-------------|----------|
| `analytics_ecommerce_metrics` | Métricas E-commerce | KPIs de tienda online | conditional |
| `analytics_conversion_tracking` | Seguimiento de Conversión | Tracking de embudos de conversión | conditional |

**Total**: 2 features

---

#### STAFF Domain (6 features)

| Feature ID | Name | Description | Category |
|------------|------|-------------|----------|
| `staff_employee_management` | Gestión de Empleados | Administración básica de personal | conditional |
| `staff_shift_management` | Gestión de Turnos | Programación y gestión de turnos de trabajo | conditional |
| `staff_time_tracking` | Registro de Tiempo | Control de asistencia y horas trabajadas | conditional |
| `staff_performance_tracking` | Seguimiento de Desempeño | Evaluaciones y métricas de rendimiento | conditional |
| `staff_training_management` | Gestión de Capacitación | Programas de entrenamiento y desarrollo | conditional |
| `staff_labor_cost_tracking` | Seguimiento de Costos Laborales | Análisis y tracking de costos de personal | conditional |

**Total**: 6 features

---

#### RENTAL Domain (5 features)

| Feature ID | Name | Description | Category |
|------------|------|-------------|----------|
| `rental_item_management` | Gestión de Items en Alquiler | Catálogo de activos disponibles para rentar | conditional |
| `rental_booking_calendar` | Calendario de Reservas | Gestión de disponibilidad y reservas | conditional |
| `rental_availability_tracking` | Seguimiento de Disponibilidad | Control de disponibilidad en tiempo real | conditional |
| `rental_pricing_by_duration` | Precios por Duración | Pricing variable según tiempo de alquiler | conditional |
| `rental_late_fees` | Cargos por Mora | Penalidades por devolución tardía | conditional |

**Total**: 5 features

---

#### MEMBERSHIP Domain (5 features)

| Feature ID | Name | Description | Category |
|------------|------|-------------|----------|
| `membership_subscription_plans` | Planes de Suscripción | Gestión de planes y niveles de membresía | conditional |
| `membership_recurring_billing` | Facturación Recurrente | Cobros automáticos periódicos | conditional |
| `membership_access_control` | Control de Acceso | Gestión de permisos por nivel de membresía | conditional |
| `membership_usage_tracking` | Seguimiento de Uso | Tracking de visitas/uso de servicios | conditional |
| `membership_benefits_management` | Gestión de Beneficios | Beneficios y promociones por membresía | conditional |

**Total**: 5 features

---

#### DIGITAL Domain (4 features)

| Feature ID | Name | Description | Category |
|------------|------|-------------|----------|
| `digital_file_delivery` | Entrega de Archivos | Sistema de descarga de productos digitales | conditional |
| `digital_license_management` | Gestión de Licencias | Generación y validación de licencias | conditional |
| `digital_download_tracking` | Tracking de Descargas | Seguimiento y límites de descarga | conditional |
| `digital_version_control` | Control de Versiones | Gestión de versiones de productos digitales | conditional |

**Total**: 4 features

---

#### CORE Domain (7 features)

| Feature ID | Name | Description | Category |
|------------|------|-------------|----------|
| `executive` | Dashboard Ejecutivo | Reportes y métricas ejecutivas | conditional |
| `can_view_menu_engineering` | Ver Ingeniería de Menú | Acceso a análisis de ingeniería de menú | conditional |

**Note (v5.0)**: Previously "always_active" features (customers, dashboard, settings, gamification, debug) are now **CORE modules**, not features. See `CORE_MODULES` array in `src/lib/modules/constants.ts`.

**Total**: 2 features (all conditional)

---

### Feature Count Summary

| Domain | Count | Category |
|--------|-------|----------|
| SALES | 26 | conditional |
| INVENTORY | 13 | conditional |
| PRODUCTION | 4 | conditional |
| PRODUCTS | 7 | conditional |
| OPERATIONS | 12 | conditional |
| SCHEDULING | 4 | conditional |
| CUSTOMER | 4 | conditional |
| FINANCE | 4 | conditional |
| MOBILE | 3 | conditional |
| MULTISITE | 5 | conditional |
| ANALYTICS | 2 | conditional |
| STAFF | 6 | conditional |
| RENTAL | 5 | conditional |
| MEMBERSHIP | 5 | conditional |
| DIGITAL | 4 | conditional |
| CORE | 7 | 5 always_active, 2 conditional |
| **TOTAL** | **111** | **106 conditional, 5 always_active** |

**Note**: The actual count is higher than the stated 88 features. This may be due to recent additions or the initial count excluding CORE features.

---

### MODULE_FEATURE_MAP (⚠️ Auto-Generated in v3.0)

> **⚡ NEW v3.0**: This mapping is now **automatically generated** from module manifests.
> You don't need to manually maintain it anymore!
> See `DYNAMIC_MODULE_FEATURE_MAP_MIGRATION.md` for details.

**Purpose**: Bidirectional mapping between navigation modules and features.

**How It Works (v3.0)**:
```typescript
// System reads from module manifests automatically
export function getDynamicModuleFeatureMap() {
  const modules = ModuleRegistry.getInstance().getAll();
  return modules.map(m => ({
    [m.manifest.id]: {
      alwaysActive: m.manifest.autoInstall,
      requiredFeatures: m.manifest.requiredFeatures,
      optionalFeatures: m.manifest.optionalFeatures
    }
  }));
}
```

**Solves**: "The Navigation Integration Problem" - modules weren't showing because:
- ❌ (OLD) Had to manually add to MODULE_FEATURE_MAP (easy to forget)
- ✅ (NEW) Auto-detected from manifest (impossible to forget)

**Logic**:
- `alwaysActive: true` - Module always shows (dashboard, settings, gamification)
- `requiredFeatures` - ALL must be active (AND logic)
- `optionalFeatures` - At least ONE must be active (OR logic)

**Edge Cases**:
- If `requiredFeatures` exists, `optionalFeatures` are bonus (don't activate module alone)
- If only `optionalFeatures` exist, any one activates module
- `alwaysActive` modules ignore features entirely

**How to Add Module (v3.0)**:
```typescript
// Just define your manifest - that's it!
export const myModuleManifest: ModuleManifest = {
  id: 'my-module',
  requiredFeatures: ['some_feature'],
  optionalFeatures: ['another_feature'],
  // ...
};
// Module appears automatically in navigation!
```

---

#### Core Modules (Always Active)

```typescript
'dashboard': {
  alwaysActive: true,
  description: 'Dashboard principal - siempre visible'
},

'settings': {
  alwaysActive: true,
  description: 'Configuración del sistema - siempre visible'
},

'gamification': {
  alwaysActive: true,
  description: 'Sistema de logros - siempre visible para motivar progreso'
},

'debug': {
  alwaysActive: true,
  description: 'Herramientas de debug - visible solo para SUPER_ADMIN (filtrado por role)'
},

'achievements': {
  alwaysActive: true,
  description: 'Sistema de logros y requisitos - siempre visible para mostrar progreso'
}
```

---

#### Business Modules (Feature-dependent)

```typescript
'sales': {
  optionalFeatures: [
    // ANY of these 23 features activates sales module (OR logic)
    'sales_order_management',
    'sales_payment_processing',
    'sales_catalog_menu',
    'sales_pos_onsite',
    'sales_dine_in_orders',
    'sales_order_at_table',
    'sales_online_order_processing',
    'sales_online_payment_gateway',
    'sales_cart_management',
    'sales_checkout_process',
    'sales_multicatalog_management',
    'sales_bulk_pricing',
    'sales_quote_generation',
    'sales_product_retail',
    'sales_contract_management',
    'sales_tiered_pricing',
    'sales_approval_workflows',
    'sales_quote_to_order',
    'sales_split_payment',
    'sales_tip_management',
    'sales_coupon_management',
    'sales_pickup_orders',
    'sales_delivery_orders',
    'sales_package_management'
  ],
  description: 'Módulo de ventas - activo con cualquier feature de SALES'
}
```

```typescript
'materials': {
  optionalFeatures: [
    // ANY inventory feature activates materials module
    'inventory_stock_tracking',
    'inventory_alert_system',
    'inventory_purchase_orders',
    'inventory_supplier_management',
    'inventory_low_stock_auto_reorder',
    'inventory_demand_forecasting',
    'inventory_batch_lot_tracking',
    'inventory_expiration_tracking',
    'inventory_available_to_promise'
  ],
  description: 'Módulo de inventario - activo con cualquier feature de INVENTORY'
}
```

```typescript
'products': {
  optionalFeatures: [
    // Products features OR related features that imply product management
    'products_recipe_management',
    'products_catalog_menu',
    'products_catalog_ecommerce',
    'products_package_management',
    'products_cost_intelligence',
    'products_availability_calculation',
    'products_dynamic_materials',
    'sales_order_management',          // If you sell, you have products
    'sales_catalog_menu',
    'sales_catalog_ecommerce',
    'sales_package_management',
    'production_bom_management',       // If you produce, you have products
    'production_display_system'
  ],
  description: 'Módulo de productos - activo si vendes o produces algo'
}
```

```typescript
'operations': {
  optionalFeatures: [
    'operations_table_management',
    'operations_table_assignment',
    'operations_floor_plan_config',
    'operations_waitlist_management',
    'operations_delivery_zones',
    'operations_delivery_tracking',
    'operations_pickup_scheduling',
    'operations_notification_system',
    'operations_vendor_performance'
  ],
  description: 'Módulo de operaciones - activo con cualquier feature de OPERATIONS'
}
```

```typescript
'scheduling': {
  optionalFeatures: [
    'scheduling_appointment_booking',
    'scheduling_calendar_management',
    'staff_shift_management'  // Shift scheduling also shows this module
  ],
  description: 'Módulo de programación - activo con features de SCHEDULING o STAFF shifts'
}
```

```typescript
'staff': {
  optionalFeatures: [
    'staff_employee_management',
    'staff_shift_management',
    'staff_time_tracking',
    'staff_performance_tracking',
    'staff_training_management'
  ],
  description: 'Módulo de personal - activo con cualquier feature de STAFF'
}
```

```typescript
'customers': {
  optionalFeatures: [
    'customer_loyalty_program',
    'customer_service_history',
    'customer_preference_tracking',
    'sales_order_management'  // If you have sales, you have customers
  ],
  description: 'Módulo de clientes - activo con features de CUSTOMER o SALES'
}
```

---

#### Advanced Modules (Complex Requirements)

```typescript
'delivery': {
  requiredFeatures: [
    // ALL of these must be active (AND logic)
    'operations_delivery_zones',
    'operations_delivery_tracking'
  ],
  description: 'Módulo de delivery - requiere TODAS las features de delivery (delivery_shipping capability)'
}
```

```typescript
'production': {
  requiredFeatures: [
    // ALL production features must be active
    'production_bom_management',
    'production_display_system',
    'production_order_queue'
  ],
  description: 'Módulo de producción - activado por physical_products o professional_services capabilities'
}
```

```typescript
'fulfillment-onsite': {
  requiredFeatures: [
    'operations_table_management'  // Must have this
  ],
  optionalFeatures: [
    // Having these is a bonus, but not required
    'operations_table_assignment',
    'operations_floor_plan_config',
    'operations_waitlist_management',
    'operations_bill_splitting'
  ],
  description: 'Módulo de fulfillment onsite - gestión de mesas y servicio en local (onsite_service capability)'
}
```

```typescript
'finance': {
  requiredFeatures: ['finance_corporate_accounts'],  // Must have corporate
  optionalFeatures: [
    'finance_credit_management',
    'finance_invoice_scheduling',
    'finance_payment_terms'
  ],
  description: 'Módulo Finance B2B - gestión de cuentas corporativas y crédito'
}
```

```typescript
'memberships': {
  requiredFeatures: [
    // Must have BOTH of these
    'membership_subscription_plans',
    'membership_recurring_billing'
  ],
  optionalFeatures: [
    // These enhance the module
    'membership_access_control',
    'membership_usage_tracking',
    'membership_benefits_management',
    'customer_loyalty_program',
    'scheduling_appointment_booking',
    'finance_invoice_scheduling'
  ],
  description: 'Gestión de membresías y suscripciones - planes y cobros recurrentes'
}
```

```typescript
'rentals': {
  requiredFeatures: [
    // Must have ALL of these core rental features
    'rental_item_management',
    'rental_booking_calendar',
    'rental_availability_tracking'
  ],
  optionalFeatures: [
    // These enhance the module
    'rental_pricing_by_duration',
    'rental_late_fees',
    'inventory_stock_tracking',
    'scheduling_appointment_booking',
    'operations_vendor_performance',
    'inventory_available_to_promise'
  ],
  description: 'Gestión de alquileres - equipos, espacios, recursos'
}
```

---

#### Infrastructure Modules

```typescript
'mobile': {
  optionalFeatures: [
    'mobile_location_tracking',
    'mobile_route_planning',
    'mobile_inventory_constraints'
  ],
  description: 'Módulo móvil - activo con features de MOBILE'
}
```

```typescript
'multisite': {
  optionalFeatures: [
    'multisite_location_management',
    'multisite_centralized_inventory',
    'multisite_transfer_orders'
  ],
  description: 'Multi-ubicación - activo con features de MULTISITE'
}
```

---

#### Supply Chain Modules

```typescript
'suppliers': {
  optionalFeatures: [
    'inventory_supplier_management',
    'inventory_purchase_orders',
    'operations_vendor_performance'
  ],
  description: 'Módulo de gestión de proveedores'
}
```

```typescript
'supplier-orders': {
  requiredFeatures: ['inventory_supplier_management'],  // Must have suppliers
  optionalFeatures: [
    'inventory_purchase_orders',
    'inventory_demand_forecasting'
  ],
  description: 'Órdenes de compra a proveedores'
}
```

---

### FeatureRegistry Helper Functions

#### `getFeature(id: FeatureId)`

```typescript
import { getFeature } from '@/config/FeatureRegistry';

const feature = getFeature('sales_order_management');
console.log(feature?.name); // "Gestión de Órdenes"
console.log(feature?.domain); // "SALES"
console.log(feature?.category); // "conditional"
```

---

#### `getAllFeatures()`

```typescript
import { getAllFeatures } from '@/config/FeatureRegistry';

const all = getAllFeatures();
console.log(all.length); // 111+ (including CORE)
```

---

#### `getFeaturesByDomain(domain)`

```typescript
import { getFeaturesByDomain } from '@/config/FeatureRegistry';

const salesFeatures = getFeaturesByDomain('SALES');
console.log(salesFeatures.length); // 26

const inventoryFeatures = getFeaturesByDomain('INVENTORY');
console.log(inventoryFeatures.length); // 13
```

---

#### `getFeaturesByCategory(category)`

```typescript
import { getFeaturesByCategory } from '@/config/FeatureRegistry';

const alwaysActive = getFeaturesByCategory('always_active');
console.log(alwaysActive.length); // 5 (dashboard, settings, gamification, debug, customers)

const conditional = getFeaturesByCategory('conditional');
console.log(conditional.length); // 106+
```

---

#### `getModulesForActiveFeatures(features)`

```typescript
import { getModulesForActiveFeatures } from '@/config/FeatureRegistry';

const modules = getModulesForActiveFeatures([
  'sales_order_management',
  'inventory_stock_tracking',
  'operations_table_management'
]);

console.log(modules);
// [
//   'dashboard',
//   'settings',
//   'gamification',
//   'achievements',
//   'sales',
//   'materials',
//   'products',
//   'operations',
//   'customers',
//   'suppliers'
// ]
```

**Purpose**: Determines which modules should appear in navigation
**Returns**: `string[]` (module IDs)
**Logic**:
1. Always-active modules always included
2. Modules with `requiredFeatures`: ALL must be present
3. Modules with only `optionalFeatures`: At least ONE must be present

**Use case**: Core navigation rendering logic

---

#### `hasFeature(id)`

```typescript
import { hasFeature } from '@/config/FeatureRegistry';

console.log(hasFeature('sales_order_management')); // true
console.log(hasFeature('invalid_feature')); // false
```

**Purpose**: Type-safe feature ID validation
**Returns**: `id is FeatureId` (type predicate)

---

#### `getFeaturesByDomainGrouped()`

```typescript
import { getFeaturesByDomainGrouped } from '@/config/FeatureRegistry';

const grouped = getFeaturesByDomainGrouped();
console.log(Object.keys(grouped));
// ['SALES', 'INVENTORY', 'PRODUCTION', 'PRODUCTS', 'OPERATIONS', ...]

console.log(grouped.SALES.length); // 26
console.log(grouped.INVENTORY.length); // 13
```

**Purpose**: Get features organized by domain
**Returns**: `Record<Domain, Feature[]>`
**Use case**: Render feature lists grouped by domain

---

#### `countFeaturesByDomain()`

```typescript
import { countFeaturesByDomain } from '@/config/FeatureRegistry';

const counts = countFeaturesByDomain();
console.log(counts);
// {
//   SALES: 26,
//   INVENTORY: 13,
//   PRODUCTION: 4,
//   PRODUCTS: 7,
//   ...
// }
```

**Purpose**: Get feature counts per domain
**Returns**: `Record<Domain, number>`
**Use case**: Analytics, debugging, documentation

---

## Capability-Requirements Mapping

**Location**: `src/modules/achievements/requirements/capability-mapping.ts`

Centralized mapping from Business Capabilities to Achievement Requirements.

### CAPABILITY_REQUIREMENTS

**Pattern**: Import shared requirements by reference for automatic deduplication.

```typescript
import {
  BUSINESS_NAME_CONFIGURED,     // Shared
  BUSINESS_ADDRESS_CONFIGURED,  // Shared
  PAYMENT_METHOD_CONFIGURED,    // Shared
  // ... other shared requirements
} from '@/shared/requirements';
```

---

#### Example: `physical_products`

```typescript
physical_products: [
  BUSINESS_NAME_CONFIGURED,           // Shared (imported by reference)
  PRODUCT_FIRST_PUBLISHED,            // Shared
  PAYMENT_METHOD_CONFIGURED,          // Shared
  PRODUCTION_WORKFLOW_CONFIGURED,     // Capability-specific
]
```

**Deduplication**: If 3 capabilities import `BUSINESS_NAME_CONFIGURED`, it appears only once in the final array due to JavaScript Set deduplication by reference.

---

#### Example: `onsite_service`

```typescript
onsite_service: [
  BUSINESS_NAME_CONFIGURED,           // Shared
  BUSINESS_ADDRESS_CONFIGURED,        // Shared
  PRODUCT_FIRST_PUBLISHED,            // Shared
  PRODUCT_MIN_CATALOG,                // Shared (5 products)
  PAYMENT_METHOD_CONFIGURED,          // Shared
  TABLE_CONFIGURATION,                // Capability-specific
  ONSITE_HOURS_CONFIGURED,            // Capability-specific
]
```

---

#### Example: `delivery_shipping`

```typescript
delivery_shipping: [
  BUSINESS_NAME_CONFIGURED,           // Shared
  BUSINESS_ADDRESS_CONFIGURED,        // Shared
  CUSTOMER_FIRST_ADDED,               // Shared
  PRODUCT_FIRST_PUBLISHED,            // Shared
  PRODUCT_MIN_CATALOG,                // Shared
  PAYMENT_METHOD_CONFIGURED,          // Shared
  DELIVERY_ZONE_CONFIGURED,           // Capability-specific
  DELIVERY_HOURS_CONFIGURED,          // Capability-specific
]
```

---

### Complete Capability-Requirements Map

| Capability | Shared Requirements | Specific Requirements | Total |
|------------|--------------------|-----------------------|-------|
| `physical_products` | 2 | 1 | 3 |
| `professional_services` | 2 | 2 | 4 |
| `asset_rental` | 2 | 1 | 3 |
| `membership_subscriptions` | 1 | 1 | 2 |
| `digital_products` | 2 | 1 | 3 |
| `onsite_service` | 4 | 2 | 6 |
| `pickup_orders` | 4 | 1 | 5 |
| `delivery_shipping` | 5 | 2 | 7 |
| `async_operations` | 3 | 1 | 4 |
| `corporate_sales` | 3 | 1 | 4 |
| `mobile_operations` | 2 | 1 | 3 |

**Most shared requirements**:
- `BUSINESS_NAME_CONFIGURED` - 11 capabilities
- `PAYMENT_METHOD_CONFIGURED` - 10 capabilities
- `BUSINESS_ADDRESS_CONFIGURED` - 6 capabilities
- `PRODUCT_FIRST_PUBLISHED` - 5 capabilities
- `PRODUCT_MIN_CATALOG` - 4 capabilities

---

### Requirements Helper Functions

#### `getRequirementsForCapabilities(selectedCapabilities)`

```typescript
import { getRequirementsForCapabilities } from '@/modules/achievements/requirements/capability-mapping';

const requirements = getRequirementsForCapabilities([
  'pickup_orders',
  'delivery_shipping',
  'onsite_service'
]);

console.log(requirements.length); // 9 (deduplicated from 18 total)
// Shared requirements appear only once:
// - BUSINESS_NAME_CONFIGURED (appears in all 3, counted 1x)
// - BUSINESS_ADDRESS_CONFIGURED (appears in all 3, counted 1x)
// - PRODUCT_FIRST_PUBLISHED (appears in all 3, counted 1x)
// - PRODUCT_MIN_CATALOG (appears in all 3, counted 1x)
// - PAYMENT_METHOD_CONFIGURED (appears in all 3, counted 1x)
// Plus specific requirements from each
```

**Purpose**: Get all requirements for selected capabilities
**Parameters**: `selectedCapabilities: BusinessCapabilityId[]`
**Returns**: `Achievement[]` (deduplicated)
**Deduplication**: Automatic via Set (O(n)) - shared requirements by reference

---

#### `getRequirementsForCapability(capability)`

```typescript
import { getRequirementsForCapability } from '@/modules/achievements/requirements/capability-mapping';

const requirements = getRequirementsForCapability('onsite_service');
console.log(requirements.length); // 7
console.log(requirements.map(r => r.id));
// [
//   'business_name_configured',
//   'business_address_configured',
//   'product_first_published',
//   'product_min_catalog',
//   'payment_method_configured',
//   'table_configuration',
//   'onsite_hours_configured'
// ]
```

**Purpose**: Get requirements for single capability
**Parameters**: `capability: BusinessCapabilityId`
**Returns**: `Achievement[]`

---

#### `hasRequirements(capability)`

```typescript
import { hasRequirements } from '@/modules/achievements/requirements/capability-mapping';

console.log(hasRequirements('onsite_service')); // true (has 7)
console.log(hasRequirements('asset_rental')); // true (has 3)
```

**Purpose**: Check if capability has configured requirements
**Parameters**: `capability: BusinessCapabilityId`
**Returns**: `boolean`

---

#### `getRequirementsMappingStats()`

```typescript
import { getRequirementsMappingStats } from '@/modules/achievements/requirements/capability-mapping';

const stats = getRequirementsMappingStats();
console.log(stats);
// {
//   totalCapabilities: 11,
//   totalRequirementsBeforeDedup: 44,
//   totalRequirementsAfterDedup: 20,
//   deduplicationSavings: 24,
//   averageRequirementsPerCapability: '4.0'
// }
```

**Purpose**: Get statistics about requirement mapping
**Returns**: Object with mapping stats
**Use case**: Debugging, documentation, system health checks

**Interpretation**:
- **54% deduplication rate** (24 saved / 44 total)
- Shared requirements pattern is highly effective
- Average 4 requirements per capability
- Total unique requirements: 20

---

## Cross-Registry Relationships

### Capability → Features → Modules

```typescript
// User selects capability
const capability = 'onsite_service';

// Capability activates features
const features = getCapability(capability)?.activatesFeatures;
// ['sales_pos_onsite', 'operations_table_management', ...]

// Features activate modules
const modules = getModulesForActiveFeatures(features);
// ['sales', 'operations', 'products', 'materials', ...]
```

---

### Capability → Requirements → Achievements

```typescript
// User selects capability
const capability = 'onsite_service';

// Capability has blocking requirements
const blockingReqs = getCapability(capability)?.blockingRequirements;
// ['business_address_required', 'operating_hours_required']

// Requirements map to achievements
const achievements = getRequirementsForCapability(capability);
// [BUSINESS_NAME_CONFIGURED, TABLE_CONFIGURATION, ...]
```

---

### Feature → Module → Navigation

```typescript
// Features are active
const activeFeatures = ['sales_order_management', 'inventory_stock_tracking'];

// MODULE_FEATURE_MAP determines modules
const modules = getModulesForActiveFeatures(activeFeatures);
// ['dashboard', 'settings', 'sales', 'materials', 'products', 'customers']

// Navigation filters by modules
<NavItem to="/admin/sales" /> // ✅ Visible (sales in modules)
<NavItem to="/admin/rentals" /> // ❌ Hidden (rentals not in modules)
```

---

## Registry Statistics

### BusinessModelRegistry

- **Total Capabilities**: 12
  - Core Business Models: 5
  - Fulfillment Methods: 3
  - Special Operations: 4
- **Total Infrastructure**: 3
- **Most feature-rich capability**: `onsite_service` (22 features)
- **Most requirements**: `delivery_shipping` (3 blocking requirements)

### FeatureRegistry

- **Total Features**: 111+
  - Conditional: 106+
  - Always Active: 5
- **Largest domain**: SALES (26 features)
- **Total MODULE_FEATURE_MAP entries**: 40+
  - Always Active: 5
  - Conditional: 35+

### Capability-Requirements

- **Total Mapped Capabilities**: 11
- **Total Unique Requirements**: ~20
- **Total References (before dedup)**: ~44
- **Deduplication Savings**: 54%
- **Most reused requirement**: `BUSINESS_NAME_CONFIGURED` (11 uses)

---

## Next Steps

- **For implementation**: See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **For architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **For API details**: See [API_REFERENCE.md](./API_REFERENCE.md)
- **For patterns**: See [PATTERNS.md](./PATTERNS.md)
