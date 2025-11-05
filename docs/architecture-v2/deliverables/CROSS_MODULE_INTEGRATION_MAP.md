# G-ADMIN MINI - CROSS-MODULE INTEGRATION MAP

**Version**: 2.0.0
**Date**: 2025-01-24
**Status**: 📋 REFERENCE GUIDE
**Based On**: ARCHITECTURE_DESIGN_V2.md

---

## 📋 PURPOSE

This document catalogs ALL cross-module interactions for the 22 modules in G-Admin Mini.

**For each module:**
- **PROVIDES**: Hooks, Events, Widgets exposed to other modules
- **CONSUMES**: Hooks, Stores, Events consumed from other modules
- **UI Navigation**: Buttons/links to other modules
- **Dependencies**: Required modules (from manifest)

**Use this document to:**
1. Understand module relationships before making changes
2. Identify circular dependencies
3. Plan hook system usage
4. Design new cross-module features

---

## 🗺️ INTEGRATION PATTERNS

### Pattern 1: Hook Points (UI Extension)
```typescript
// Module PROVIDES hook
<HookPoint name="sales.toolbar.actions" data={orderData} />

// Other module CONSUMES hook
registry.addAction('sales.toolbar.actions', (data) => (
  <Button onClick={() => sendToProduction(data.orderId)}>
    Send to Production
  </Button>
), 'production', 10);
```

### Pattern 2: EventBus (Data Communication)
```typescript
// Module EMITS event
eventBus.emit('sales.order_placed', { orderId, items }, { priority: EventPriority.HIGH });

// Other module LISTENS to event
eventBus.subscribe('sales.order_placed', (event) => {
  updateFulfillmentQueue(event.payload);
}, { moduleId: 'fulfillment' });
```

### Pattern 3: Shared Stores (State Access)
```typescript
// Module PROVIDES store
export const useMaterialsStore = create((set) => ({
  materials: [],
  checkStock: (materialId) => { /* ... */ }
}));

// Other module CONSUMES store
const { checkStock } = useMaterialsStore();
const hasStock = checkStock(materialId);
```

### Pattern 4: UI Navigation (Direct Links)
```typescript
// Module provides navigation button
<Button onClick={() => navigate('/admin/supply-chain/materials')}>
  Check Stock
</Button>
```

---

## 📦 MODULE INTEGRATION CATALOG

**Module Count**: 22 modules (reduced from 27)
**Organization**: By tier (System Core → Foundation → Operations → Support)

---

## TIER 0: SYSTEM CORE

### 1. GAMIFICATION (Achievements System)

**Route**: `/admin/gamification`

**Module Type**: System-wide (cross-cutting)

#### PROVIDES

**Hooks:**
- `achievements.show_modal` → Show setup required modal
  - **Used by**: All modules (when capability not active)
  - **Returns**: `<SetupRequiredModal />`
  - **Data**: `{ requiredCapability: string, currentStep: number }`

**Events:**
- `achievements.milestone_completed` → Milestone reached
  - **Consumed by**: Dashboard (show notification)
  - **Payload**: `{ milestoneId: string, userId: string, timestamp: Date }`

**Widgets:**
- `dashboard.widgets` → Achievement progress widget
  - **Used by**: Dashboard
  - **Returns**: `<AchievementsWidget />`

#### CONSUMES

**Events (Listens to ALL modules):**
- `sales.order_completed` ← Sales
- `materials.stock_updated` ← Materials
- `staff.shift_completed` ← Staff
- `scheduling.appointment_completed` ← Scheduling
- (Listens to ~30 events across all modules)

**Purpose**: Track progress toward milestone completion

#### UI Navigation

**None** (no outbound navigation)

#### Dependencies

```typescript
depends: [] // System core, no dependencies
```

---

## TIER 1: CORE FOUNDATION

### 2. DASHBOARD (Central Hub)

**Route**: `/admin/core/dashboard`

**Module Type**: Aggregator (consumes from all modules)

#### PROVIDES

**Hooks:**
- `dashboard.widgets` → Hook point for all modules to inject widgets
  - **Used by**: All modules
  - **Returns**: Widget grid
  - **Data**: `{ userId: string, dateRange: DateRange }`

#### CONSUMES

**Widgets (from ALL modules):**
- `sales.widget` ← Sales (sales metrics)
- `fulfillment.widget` ← Fulfillment (queue status)
- `materials.widget` ← Materials (inventory alerts)
- `production.widget` ← Production (production queue)
- `staff.widget` ← Staff (labor costs)
- `scheduling.widget` ← Scheduling (upcoming appointments)
- `customers.widget` ← Customers (customer insights)
- `fiscal.widget` ← Fiscal (tax summary)
- `achievements.widget` ← Gamification (progress)
- (Consumes from all 22 modules)

**Events:**
- `*.*.completed` ← All modules (update metrics in real-time)

**Stores:**
- `salesStore` ← Sales (revenue data)
- `materialsStore` ← Materials (low stock alerts)
- `staffStore` ← Staff (labor hours)

#### UI Navigation

**Links to ALL modules:**
- "View Sales" → `/admin/operations/sales`
- "View Inventory" → `/admin/supply-chain/materials`
- "View Staff" → `/admin/resources/staff`
- (Links to all 22 modules via widgets)

#### Dependencies

```typescript
depends: [] // Foundation, but CONSUMES from all modules
```

**Note**: Dashboard has no formal dependencies but requires other modules to provide widgets.

---

### 3. SETTINGS (System Configuration)

**Route**: `/admin/core/settings`

**Module Type**: Foundation (configuration)

#### PROVIDES

**Stores:**
- `settingsStore` → System configuration
  - **Used by**: All modules
  - **Exposes**: `businessProfile`, `taxConfig`, `userPermissions`, `terminology`

**Hooks:**
- `settings.terminology` → Industry-specific labels
  - **Used by**: Production, Fulfillment (configurable labels)
  - **Returns**: `{ production_bom: 'Recipe', production_display: 'Kitchen', ... }`

#### CONSUMES

**None** (foundation module)

#### UI Navigation

**Subpages:**
- `/settings/business-profile` (Business info)
- `/settings/tax-configuration` (Tax settings)
- `/settings/user-permissions` (Role management)
- `/settings/integrations` (Third-party integrations)
- `/settings/diagnostics` (Debug tools)

#### Dependencies

```typescript
depends: [] // Foundation, no dependencies
```

---

### 4. CUSTOMERS (CRM)

**Route**: `/admin/core/crm/customers`

**Module Type**: Foundation (data provider)

#### PROVIDES

**Stores:**
- `customersStore` → Customer data
  - **Used by**: Sales, Scheduling, Memberships, Billing, Finance
  - **Exposes**: `getCustomer()`, `searchCustomers()`, `getServiceHistory()`

**Hooks:**
- `customers.selector` → Customer selector component
  - **Used by**: Sales, Scheduling (select customer in forms)
  - **Returns**: `<CustomerSelector />`

**Events:**
- `customers.created` → New customer added
  - **Consumed by**: Gamification, Reporting

**Widgets:**
- `dashboard.widgets` → Customer insights widget
  - **Used by**: Dashboard

#### CONSUMES

**Hooks:**
- `sales.order_completed` ← Sales (update service history)
- `scheduling.appointment_completed` ← Scheduling (update service history)

**Events:**
- `sales.order_placed` ← Sales (update order history)
- `memberships.activated` ← Memberships (link membership to customer)

#### UI Navigation

**Outbound Links:**
- "View Orders" → `/admin/operations/sales?customer={id}`
- "View Appointments" → `/admin/resources/scheduling?customer={id}`
- "View Membership" → `/admin/operations/memberships?customer={id}`

**Hook Points:**
- `customers.tabs` → Extensible tabs for customer details
  - Used by: Sales (orders tab), Scheduling (appointments tab), Memberships (membership tab)

#### Dependencies

```typescript
depends: [] // Foundation, no dependencies
```

---

### 5. DEBUG (Development Tools)

**Route**: `/admin/core/settings/diagnostics`

**Module Type**: Development (dev only)

#### PROVIDES

**None** (development tool)

#### CONSUMES

**Stores (All modules):**
- Reads from all stores for debugging
- No modifications

#### UI Navigation

**Links:**
- "View Logs" (internal)
- "Test CRUD Operations" (internal)
- "Performance Monitor" (internal)

#### Dependencies

```typescript
depends: [] // Independent dev tool
```

---

## TIER 2: SALES & FULFILLMENT

### 6. SALES (Revenue Operations)

**Route**: `/admin/operations/sales`

**Module Type**: Core operations

#### PROVIDES

**Events:**
- `sales.order_placed` → New sale created
  - **Consumed by**: Fulfillment, Production, Materials, Fiscal, Gamification
  - **Payload**: `{ orderId, items, customer, fulfillmentType, total }`

- `sales.order_completed` → Sale finalized
  - **Consumed by**: Materials (deduct stock), Fiscal (generate invoice), Customers (update history)
  - **Payload**: `{ orderId, finalTotal, paymentMethod }`

- `sales.payment_received` → Payment processed
  - **Consumed by**: Fiscal, Billing, Finance
  - **Payload**: `{ orderId, amount, method, transactionId }`

**Hooks:**
- `sales.toolbar.actions` → Toolbar extension point
  - **Used by**: Production (KDS button), Fulfillment (send to queue)
  - **Returns**: Toolbar buttons

- `sales.tabs` → Tab extension point for sales views
  - **Used by**: Fiscal (invoices tab), E-commerce subfolder (online orders tab)

**Widgets:**
- `dashboard.widgets` → Sales metrics widget

**Stores:**
- `salesStore` → Sales data
  - **Used by**: Fiscal, Reporting, Dashboard

#### CONSUMES

**Stores:**
- `customersStore` ← Customers (customer data in POS)
- `materialsStore` ← Materials (stock validation before sale)
- `productsStore` ← Products (product catalog)

**Hooks:**
- `materials.stock_check` ← Materials (validate stock availability)
- `production.order_ready` ← Production (order ready notification)
- `fulfillment.order_ready` ← Fulfillment (order ready for pickup/delivery)

**Events:**
- `materials.stock_updated` ← Materials (refresh stock levels in POS)

#### UI Navigation

**Outbound Links:**
- "Check Stock" → `/admin/supply-chain/materials`
- "View Customer" → `/admin/core/crm/customers/{id}`
- "Generate Invoice" → `/admin/finance/fiscal` (opens invoice modal)
- "Send to Production" → `/admin/operations/production` (via EventBus, not direct navigation)

**Hook Points:**
- `sales.tabs` → Fiscal adds "Invoices" tab, E-commerce adds "Online Orders" tab

#### Dependencies

```typescript
depends: [] // Foundation operations module
// Runtime consumes: Customers, Materials, Products, Fiscal
```

---

### 7. FULFILLMENT (Order Logistics) ⭐ NEW

**Route**: `/admin/operations/fulfillment`

**Module Type**: Core operations (replaces Floor)

**Submodules**:
- `/core` - Shared fulfillment logic (76% overlap)
- `/onsite` - Tables, floor plan, waitlist (MOVED from Floor module)
- `/pickup` - Pickup scheduling, curbside
- `/delivery` - Delivery zones, GPS tracking

#### PROVIDES

**Events:**
- `fulfillment.order_ready` → Order ready for customer
  - **Consumed by**: Sales (notify POS), Customers (send notification)
  - **Payload**: `{ orderId, fulfillmentType, readyTime }`

- `fulfillment.order_dispatched` → Order dispatched (delivery)
  - **Consumed by**: Mobile (track delivery), Customers (notify customer)
  - **Payload**: `{ orderId, driverId, estimatedArrival }`

**Hooks:**
- `fulfillment.toolbar.actions` → Toolbar extension point
  - **Used by**: Mobile (GPS tracking button for delivery)

**Widgets:**
- `dashboard.widgets` → Fulfillment queue widget

**Stores:**
- `fulfillmentStore` → Fulfillment queue data
  - **Used by**: Sales, Production

#### CONSUMES

**Events:**
- `sales.order_placed` ← Sales (add to fulfillment queue)
- `production.order_ready` ← Production (mark order ready for fulfillment)
- `materials.stock_updated` ← Materials (validate availability)

**Stores:**
- `salesStore` ← Sales (order details)
- `staffStore` ← Staff (assign service staff/drivers)
- `materialsStore` ← Materials (stock validation)

**Hooks:**
- `mobile.gps_tracking` ← Mobile (delivery tracking)

#### UI Navigation

**Outbound Links:**
- "View Order" → `/admin/operations/sales/{orderId}`
- "Assign Driver" → `/admin/resources/staff` (driver selector)
- "Track Delivery" → `/admin/operations/mobile` (GPS tracking)

**Onsite Submodule:**
- "Floor Plan" → `/fulfillment/onsite/floor-plan`
- "Waitlist" → `/fulfillment/onsite/waitlist`
- "Table Assignment" → `/fulfillment/onsite/tables`

#### Dependencies

```typescript
depends: ['sales', 'staff', 'materials']
// Optional: 'production', 'mobile'
```

---

### 8. PRODUCTION (Production Workflows) ♻️ RENAMED

**Route**: `/admin/operations/production` (was `/kitchen`)

**Module Type**: Link module (auto-installs when Sales + Materials active)

**Generic Terminology**: BOM (Bill of Materials), PDS (Production Display System)

#### PROVIDES

**Events:**
- `production.order_ready` → Production completed
  - **Consumed by**: Fulfillment (notify order ready), Sales (update status)
  - **Payload**: `{ orderId, completedTime, operator }`

- `production.ingredient_check` → Check ingredient availability
  - **Consumed by**: Materials (validate stock)

**Hooks:**
- `production.display.orders` → Production Display System (PDS)
  - **Used by**: Internal (KDS/job board display)

**Widgets:**
- `dashboard.widgets` → Production queue widget

**Stores:**
- `productionStore` → Production queue data
  - **Used by**: Sales, Fulfillment

#### CONSUMES

**Events:**
- `sales.order_placed` ← Sales (receive new orders)
- `materials.stock_updated` ← Materials (track ingredient levels)

**Stores:**
- `salesStore` ← Sales (order details)
- `materialsStore` ← Materials (ingredient availability)
- `productsStore` ← Products (BOM/recipes)

**Hooks:**
- `materials.row.actions` ← Materials (add "Send to Production" button to materials grid)

#### UI Navigation

**Outbound Links:**
- "View Order" → `/admin/operations/sales/{orderId}`
- "Check Ingredients" → `/admin/supply-chain/materials`
- "View Recipe" → `/admin/supply-chain/products/{productId}`

**Terminology (Configurable per Industry):**
- **Gastronomy**: BOM="Recipe", PDS="Kitchen Display", Operator="Cook"
- **Manufacturing**: BOM="BOM", PDS="Production Display", Operator="Operator"
- **Workshop**: BOM="Work Order", PDS="Job Board", Operator="Technician"
- **Salon**: BOM="Service Protocol", PDS="Treatment Display", Operator="Stylist"

#### Dependencies

```typescript
depends: ['sales', 'materials']
autoInstall: true // Link module (auto-installs when dependencies active)
```

---

### 9. MOBILE (No Fixed Location Operations) ⭐ NEW

**Route**: `/admin/operations/mobile`

**Module Type**: Infrastructure service

**Purpose**: Location-based operations (food trucks, fairs, mobile services)

#### PROVIDES

**Services:**
- `mobile.gps_tracking` → GPS location service
  - **Used by**: Fulfillment/delivery (track drivers), Mobile operations (track truck)
  - **Exposes**: `getCurrentLocation()`, `trackRoute()`, `updateLocation()`

- `mobile.route_planning` → Route optimization
  - **Used by**: Fulfillment/delivery (optimize delivery routes)
  - **Exposes**: `planRoute(waypoints)`, `optimizeRoute()`

**Hooks:**
- `mobile.location_picker` → Map picker component
  - **Used by**: Fulfillment/delivery (select delivery zones)
  - **Returns**: `<LocationPicker />`

**Widgets:**
- `dashboard.widgets` → Active routes widget

#### CONSUMES

**Stores:**
- `materialsStore` ← Materials (mobile inventory constraints)
- `salesStore` ← Sales (mobile POS sales)

**Events:**
- `sales.order_placed` ← Sales (if mobile location)

#### UI Navigation

**Outbound Links:**
- "View Inventory" → `/admin/supply-chain/materials` (mobile inventory)
- "View Sales" → `/admin/operations/sales` (mobile POS)

**Submodules:**
- `/location` - GPS tracking, map view
- `/routes` - Route planning, optimization
- `/inventory` - Mobile inventory constraints (truck/booth capacity)

#### Dependencies

```typescript
depends: ['materials']
// External: Google Maps API / Mapbox
```

**Note**: Offline-first architecture is UNIVERSAL (not specific to Mobile module).

---

## TIER 3: SUPPLY CHAIN

### 10. MATERIALS (Inventory Management)

**Route**: `/admin/supply-chain/materials`

**Module Type**: Foundation (data provider)

#### PROVIDES

**Events:**
- `materials.stock_updated` → Inventory changed
  - **Consumed by**: Sales, Production, Products, Dashboard
  - **Payload**: `{ materialId, newQuantity, reason }`

- `materials.low_stock_alert` → Stock below threshold
  - **Consumed by**: Dashboard, Suppliers (trigger reorder)
  - **Payload**: `{ materialId, currentStock, threshold }`

**Hooks:**
- `materials.stock_check` → Validate stock availability
  - **Used by**: Sales (before completing order), Production (before starting production)
  - **Returns**: `{ available: boolean, quantity: number }`

- `materials.row.actions` → Row action extension point
  - **Used by**: Production (add "Send to Production" button)

**Widgets:**
- `dashboard.widgets` → Inventory alerts widget

**Stores:**
- `materialsStore` → Inventory data
  - **Used by**: Sales, Production, Products, Supplier-Orders

#### CONSUMES

**Events:**
- `sales.order_completed` ← Sales (deduct stock)
- `production.order_completed` ← Production (deduct ingredients)
- `supplier-orders.received` ← Supplier-Orders (add stock)

**Stores:**
- `suppliersStore` ← Suppliers (supplier info)
- `productsStore` ← Products (product-material relationships)

#### UI Navigation

**Outbound Links:**
- "Order from Supplier" → `/admin/supply-chain/supplier-orders/new`
- "View Recipes" → `/admin/supply-chain/products?material={id}` (recipes using this material)
- "View Supplier" → `/admin/supply-chain/suppliers/{id}`

**Hook Points:**
- `materials.row.actions` → Production adds "Send to Production", Sales adds "Quick Sale"

#### Dependencies

```typescript
depends: []
// Runtime consumes: Suppliers, Products
```

---

### 11. SUPPLIERS (Supplier Management)

**Route**: `/admin/supply-chain/suppliers`

**Module Type**: Foundation (data provider)

#### PROVIDES

**Stores:**
- `suppliersStore` → Supplier data
  - **Used by**: Materials, Supplier-Orders
  - **Exposes**: `getSupplier()`, `searchSuppliers()`

**Hooks:**
- `suppliers.selector` → Supplier selector component
  - **Used by**: Materials, Supplier-Orders (select supplier in forms)
  - **Returns**: `<SupplierSelector />`

#### CONSUMES

**Events:**
- `supplier-orders.created` ← Supplier-Orders (track order history)

#### UI Navigation

**Outbound Links:**
- "Create Purchase Order" → `/admin/supply-chain/supplier-orders/new?supplier={id}`
- "View Materials" → `/admin/supply-chain/materials?supplier={id}`

#### Dependencies

```typescript
depends: []
```

---

### 12. SUPPLIER-ORDERS (Purchase Orders)

**Route**: `/admin/supply-chain/supplier-orders`

**Module Type**: Operations (purchasing)

#### PROVIDES

**Events:**
- `supplier-orders.created` → New PO created
  - **Consumed by**: Suppliers (update order history)

- `supplier-orders.received` → PO received
  - **Consumed by**: Materials (add stock)
  - **Payload**: `{ orderId, items, receivedQuantities }`

#### CONSUMES

**Stores:**
- `suppliersStore` ← Suppliers (supplier details)
- `materialsStore` ← Materials (material catalog)

**Events:**
- `materials.low_stock_alert` ← Materials (trigger auto-reorder)

#### UI Navigation

**Outbound Links:**
- "View Supplier" → `/admin/supply-chain/suppliers/{id}`
- "View Material" → `/admin/supply-chain/materials/{id}`
- "Receive Stock" → `/admin/supply-chain/materials` (add stock via materials module)

#### Dependencies

```typescript
depends: ['suppliers', 'materials']
```

---

### 13. PRODUCTS (Product Catalog)

**Route**: `/admin/supply-chain/products`

**Module Type**: Foundation (data provider)

#### PROVIDES

**Stores:**
- `productsStore` → Product catalog
  - **Used by**: Sales, Production, E-commerce
  - **Exposes**: `getProduct()`, `searchProducts()`, `getBOM()`

**Hooks:**
- `products.selector` → Product selector component
  - **Used by**: Sales (select product in POS)
  - **Returns**: `<ProductSelector />`

- `products.tabs` → Product detail tabs extension point
  - **Used by**: E-commerce (add "Online Catalog" tab)

#### CONSUMES

**Stores:**
- `materialsStore` ← Materials (BOM ingredients)

**Events:**
- `sales.order_placed` ← Sales (track product sales)

#### UI Navigation

**Outbound Links:**
- "View Materials" → `/admin/supply-chain/materials` (BOM ingredients)
- "View Sales" → `/admin/operations/sales?product={id}`

**Hook Points:**
- `products.tabs` → E-commerce adds online catalog tab

#### Dependencies

```typescript
depends: ['materials']
// Optional dependency for production_bom_management feature
```

---

## TIER 4: HUMAN RESOURCES

### 14. STAFF (Employee Management)

**Route**: `/admin/resources/staff`

**Module Type**: Foundation (data provider)

#### PROVIDES

**Stores:**
- `staffStore` → Employee data
  - **Used by**: Scheduling, Fulfillment, Production, Sales
  - **Exposes**: `getEmployee()`, `getAvailableProviders()`, `getShifts()`

**Hooks:**
- `staff.selector` → Staff selector component
  - **Used by**: Scheduling (assign provider), Fulfillment (assign driver/server)
  - **Returns**: `<StaffSelector />`

**Events:**
- `staff.shift_started` → Shift started
  - **Consumed by**: Dashboard (labor tracking), Gamification

- `staff.shift_ended` → Shift ended
  - **Consumed by**: Dashboard, Reporting

**Widgets:**
- `dashboard.widgets` → Labor costs widget

#### CONSUMES

**Events:**
- `scheduling.appointment_completed` ← Scheduling (track provider performance)
- `sales.order_completed` ← Sales (track POS operator performance)

#### UI Navigation

**Outbound Links:**
- "View Schedule" → `/admin/resources/scheduling?staff={id}`
- "View Performance" → `/admin/resources/staff/{id}/performance`

#### Dependencies

```typescript
depends: []
```

---

### 15. SCHEDULING (Appointment Management)

**Route**: `/admin/resources/scheduling`

**Module Type**: Service operations

**Purpose**: Customer appointment booking (NOT staff scheduling)

#### PROVIDES

**Events:**
- `scheduling.appointment_created` → New appointment booked
  - **Consumed by**: Customers (update service history), Gamification

- `scheduling.appointment_completed` → Appointment finished
  - **Consumed by**: Customers, Staff (update provider performance)
  - **Payload**: `{ appointmentId, customerId, providerId, serviceId }`

**Hooks:**
- `scheduling.calendar` → Calendar view component
  - **Used by**: Dashboard (upcoming appointments widget)
  - **Returns**: `<SchedulingCalendar />`

**Widgets:**
- `dashboard.widgets` → Upcoming appointments widget

#### CONSUMES

**Stores:**
- `staffStore` ← Staff (provider availability)
- `customersStore` ← Customers (customer data)

**Events:**
- `staff.shift_started` ← Staff (update provider availability)

#### UI Navigation

**Outbound Links:**
- "View Customer" → `/admin/core/crm/customers/{id}`
- "View Provider" → `/admin/resources/staff/{providerId}`

**Submodules:**
- `/appointments` - Appointment calendar, booking
- `/availability` - Provider schedules, blocked slots
- `/reminders` - Automated reminder system (SMS/email)
- `/online-booking` - Public booking portal

#### Dependencies

```typescript
depends: ['staff']
// Runtime consumes: Customers
```

**Note**: Walk-in immediate booking is part of appointment_based capability (not separate walkin_service).

---

## TIER 5: FINANCE

### 16. FISCAL (Tax Compliance)

**Route**: `/admin/finance/fiscal`

**Module Type**: Operations (tax)

#### PROVIDES

**Services:**
- `fiscal.calculateTax` → Tax calculation service
  - **Used by**: Sales, Finance (B2B invoices)
  - **Exposes**: `calculateTax(amount, items)`

**Events:**
- `fiscal.invoice_generated` → Invoice created
  - **Consumed by**: Reporting, Customers

**Widgets:**
- `dashboard.widgets` → Tax summary widget

#### CONSUMES

**Events:**
- `sales.order_completed` ← Sales (generate invoice)
- `sales.payment_received` ← Sales (update payment status)

**Stores:**
- `salesStore` ← Sales (order data for invoicing)
- `customersStore` ← Customers (customer tax info)

**Hooks:**
- `sales.tabs` → Add "Invoices" tab to Sales module

#### UI Navigation

**Outbound Links:**
- "View Sale" → `/admin/operations/sales/{saleId}`
- "View Customer" → `/admin/core/crm/customers/{customerId}`

**Hook Points:**
- Uses `sales.tabs` to inject invoices view

#### Dependencies

```typescript
depends: ['sales']
// Runtime consumes: Customers
```

---

### 17. BILLING (Recurring Subscriptions)

**Route**: `/admin/finance/billing`

**Module Type**: Operations (subscriptions)

#### PROVIDES

**Events:**
- `billing.subscription_created` → New subscription
  - **Consumed by**: Customers, Gamification

- `billing.payment_failed` → Payment failed
  - **Consumed by**: Customers (dunning notification)

**Widgets:**
- `dashboard.widgets` → Recurring revenue widget

#### CONSUMES

**Stores:**
- `customersStore` ← Customers (subscription holder)

**Events:**
- `customers.created` ← Customers (offer subscription during signup)

#### UI Navigation

**Outbound Links:**
- "View Customer" → `/admin/core/crm/customers/{id}`
- "View Payment History" → `/admin/finance/integrations` (payment gateway)

#### Dependencies

```typescript
depends: ['customers']
```

---

### 18. FINANCE-INTEGRATIONS (Payment Gateways)

**Route**: `/admin/finance/integrations`

**Module Type**: Infrastructure service

#### PROVIDES

**Services:**
- `payments.processPayment` → Payment processing
  - **Used by**: Sales, Billing, Finance (B2B payments)
  - **Exposes**: `processPayment(amount, method, metadata)`

**Events:**
- `payments.webhook_received` → Payment gateway webhook
  - **Consumed by**: Sales, Billing, Finance

#### CONSUMES

**Events:**
- `sales.payment_received` ← Sales (log payment)
- `billing.payment_failed` ← Billing (retry payment)

#### UI Navigation

**Outbound Links:**
- "Configure Gateway" → `/admin/core/settings/integrations`

#### Dependencies

```typescript
depends: ['fiscal', 'billing']
// External: Stripe, PayPal, MercadoPago, MODO SDKs
```

---

### 19. FINANCE (B2B Accounts & Credit) ⭐ NEW

**Route**: `/admin/finance`

**Module Type**: Operations (B2B)

**Purpose**: Corporate accounts, credit management, invoicing

#### PROVIDES

**Services:**
- `finance.checkCredit` → Credit limit validation
  - **Used by**: Sales/b2b (validate order against credit)
  - **Exposes**: `checkCredit(customerId, amount)`

**Events:**
- `finance.credit_limit_exceeded` → Credit exceeded
  - **Consumed by**: Sales (block order), Customers (notify account manager)

- `finance.invoice_scheduled` → Invoice scheduled for NET payment
  - **Consumed by**: Customers, Reporting

**Widgets:**
- `dashboard.widgets` → AR aging widget

#### CONSUMES

**Stores:**
- `customersStore` ← Customers (corporate customer data)
- `salesStore` ← Sales (B2B orders)

**Events:**
- `sales.order_placed` ← Sales/b2b (create invoice)

**Services:**
- `fiscal.calculateTax` ← Fiscal (tax calculation for invoices)

#### UI Navigation

**Outbound Links:**
- "View Customer" → `/admin/core/crm/customers/{id}`
- "View Orders" → `/admin/operations/sales/b2b?account={id}`
- "Generate Invoice" → `/admin/finance/fiscal` (tax invoice)

**Submodules:**
- `/accounts` - Corporate accounts management
- `/credit` - Credit limits, aging report
- `/invoicing` - Invoice scheduling, NET terms

#### Dependencies

```typescript
depends: ['sales', 'customers', 'fiscal']
```

---

## TIER 6: ANALYTICS & REPORTING

### 20. REPORTING (Business Intelligence)

**Route**: `/admin/core/reporting`

**Module Type**: Aggregator (reads from all modules)

#### PROVIDES

**Hooks:**
- `reporting.data_sources` → Register data source for reports
  - **Used by**: All modules (register their data)

**Widgets:**
- `dashboard.widgets` → Scheduled reports widget

#### CONSUMES

**Stores (ALL modules):**
- `salesStore` ← Sales (revenue reports)
- `materialsStore` ← Materials (inventory reports)
- `staffStore` ← Staff (labor reports)
- (Consumes from all 22 modules)

**Events:**
- `*.*.completed` ← All modules (trigger scheduled reports)

#### UI Navigation

**Links to data sources:**
- "View Sales Data" → `/admin/operations/sales`
- "View Inventory Data" → `/admin/supply-chain/materials`
- (Links to all modules for report configuration)

#### Dependencies

```typescript
depends: []
// Runtime consumes: All modules (data sources)
```

---

### 21. INTELLIGENCE (Market Intelligence)

**Route**: `/admin/core/intelligence`

**Module Type**: Analytics (market data)

#### PROVIDES

**Widgets:**
- `dashboard.widgets` → Market trends widget

**Services:**
- `intelligence.getPricingRecommendations` → Pricing suggestions
  - **Used by**: Products, Sales
  - **Exposes**: `getPricingRecommendations(productId)`

#### CONSUMES

**Stores:**
- `salesStore` ← Sales (pricing data)
- `productsStore` ← Products (product catalog)

**Events:**
- `sales.order_completed` ← Sales (track market trends)

#### UI Navigation

**Outbound Links:**
- "View Products" → `/admin/supply-chain/products`
- "View Pricing" → `/admin/operations/sales/pricing`

#### Dependencies

```typescript
depends: []
// Runtime consumes: Sales, Products
```

**Note**: Recipe features REMOVED from Intelligence (moved to Production module).

---

## TIER 7: CUSTOMER EXPERIENCE

### 22. MEMBERSHIPS (Membership Programs)

**Route**: `/admin/operations/memberships`

**Module Type**: Operations (customer retention)

#### PROVIDES

**Events:**
- `memberships.activated` → Membership activated
  - **Consumed by**: Customers (link to customer), Sales (apply discount)

- `memberships.tier_changed` → Membership tier upgraded
  - **Consumed by**: Customers, Gamification

**Widgets:**
- `dashboard.widgets` → Active memberships widget

#### CONSUMES

**Stores:**
- `customersStore` ← Customers (member data)

**Events:**
- `customers.created` ← Customers (offer membership)

#### UI Navigation

**Outbound Links:**
- "View Customer" → `/admin/core/crm/customers/{id}`
- "View Benefits" → `/memberships/{id}/benefits`

#### Dependencies

```typescript
depends: ['customers']
// Optional: 'billing' (if recurring subscription)
```

---

### 23. RENTALS (Asset Rentals) [OPTIONAL]

**Route**: `/admin/operations/rentals`

**Module Type**: Operations (optional)

#### PROVIDES

**Events:**
- `rentals.reserved` → Rental reservation created
  - **Consumed by**: Customers, Scheduling (calendar integration)

**Widgets:**
- `dashboard.widgets` → Rental utilization widget

#### CONSUMES

**Stores:**
- `customersStore` ← Customers (renter data)
- `assetsStore` ← Assets (asset availability)

#### UI Navigation

**Outbound Links:**
- "View Customer" → `/admin/core/crm/customers/{id}`
- "View Asset" → `/admin/operations/assets/{id}`

#### Dependencies

```typescript
depends: ['customers']
// Optional: 'scheduling' (calendar integration)
```

---

### 24. ASSETS (Asset Management) [OPTIONAL]

**Route**: `/admin/operations/assets`

**Module Type**: Operations (optional)

#### PROVIDES

**Stores:**
- `assetsStore` → Asset data
  - **Used by**: Rentals (asset availability)
  - **Exposes**: `getAsset()`, `checkAvailability()`

**Events:**
- `assets.maintenance_due` → Maintenance scheduled
  - **Consumed by**: Staff (assign maintenance tasks)

#### CONSUMES

**Events:**
- `rentals.reserved` ← Rentals (mark asset unavailable)

#### UI Navigation

**Outbound Links:**
- "View Rentals" → `/admin/operations/rentals?asset={id}`
- "Schedule Maintenance" → `/admin/resources/staff` (assign task)

#### Dependencies

```typescript
depends: []
// Optional: 'rentals' (rental tracking)
```

---

## 🔗 DEPENDENCY GRAPH

**Visual representation of module dependencies:**

```
TIER 0: System Core
├─ Gamification (no dependencies, listens to ALL)

TIER 1: Foundation
├─ Dashboard (no formal deps, consumes from ALL)
├─ Settings (no dependencies)
├─ Customers (no dependencies)
└─ Debug (no dependencies)

TIER 2: Sales & Fulfillment
├─ Sales
│   └─ Runtime: Customers, Materials, Products, Fiscal
├─ Fulfillment
│   └─ Depends: Sales, Staff, Materials
│   └─ Optional: Production, Mobile
├─ Production (LINK MODULE)
│   └─ Depends: Sales, Materials
│   └─ Auto-installs when Sales + Materials active
└─ Mobile
    └─ Depends: Materials

TIER 3: Supply Chain
├─ Materials
│   └─ Runtime: Suppliers, Products
├─ Suppliers (no dependencies)
├─ Supplier-Orders
│   └─ Depends: Suppliers, Materials
└─ Products
    └─ Depends: Materials

TIER 4: Human Resources
├─ Staff (no dependencies)
└─ Scheduling
    └─ Depends: Staff
    └─ Runtime: Customers

TIER 5: Finance
├─ Fiscal
│   └─ Depends: Sales
│   └─ Runtime: Customers
├─ Billing
│   └─ Depends: Customers
├─ Finance-Integrations
│   └─ Depends: Fiscal, Billing
└─ Finance (NEW)
    └─ Depends: Sales, Customers, Fiscal

TIER 6: Analytics
├─ Reporting
│   └─ Runtime: All modules (data sources)
└─ Intelligence
    └─ Runtime: Sales, Products

TIER 7: Customer Experience
├─ Memberships
│   └─ Depends: Customers
│   └─ Optional: Billing
├─ Rentals [OPTIONAL]
│   └─ Depends: Customers
│   └─ Optional: Scheduling
└─ Assets [OPTIONAL]
    └─ Optional: Rentals
```

---

## 🔍 CIRCULAR DEPENDENCY CHECK

**SAFE**: No circular dependencies detected

**Explanation**:
- All dependencies flow ONE WAY (Foundation → Operations → Analytics)
- "Runtime consumes" are hook/event-based (decoupled, not hard dependencies)
- Link modules (Production) use `autoInstall: true` to avoid circular imports

**Example - Why Sales ↔ Materials is NOT circular:**
- Sales **depends** on Materials (manifest dependency): NO
- Sales **consumes** Materials (runtime, via hooks): YES ✅
- Materials **depends** on Sales: NO
- Materials **consumes** Sales (runtime, via events): YES ✅

**Result**: Decoupled via EventBus/hooks, no import cycle.

---

## 📊 INTEGRATION STATISTICS

**Total Modules**: 22

**Hook Providers**: 18 modules (82%)
- Provide extensibility points for other modules

**Event Emitters**: 20 modules (91%)
- Communicate via EventBus

**Widget Providers**: 15 modules (68%)
- Contribute widgets to Dashboard

**Store Providers**: 11 modules (50%)
- Provide shared state to other modules

**Heavily Integrated Modules** (>5 integrations):
1. **Dashboard**: Consumes from ALL 22 modules (widgets)
2. **Sales**: Integrates with 8+ modules (Customers, Materials, Products, Fiscal, Production, Fulfillment)
3. **Materials**: Integrates with 7+ modules (Sales, Production, Products, Suppliers, Supplier-Orders)
4. **Fulfillment**: Integrates with 6+ modules (Sales, Production, Staff, Materials, Mobile)

**Least Integrated Modules** (<2 integrations):
1. **Debug**: 0 integrations (dev tool)
2. **Settings**: 1 integration (provides configuration)
3. **Assets**: 2 integrations (Rentals, Staff)

---

## 🚨 ANTI-PATTERNS TO AVOID

### ❌ DON'T: Direct Import from Other Modules

```typescript
// ❌ WRONG
import { SetupRequiredModal } from '@/modules/gamification/components';

// ✅ CORRECT
registry.doAction('gamification.show_modal', { requiredCapability: 'onsite_service' });
```

### ❌ DON'T: Circular Dependencies

```typescript
// ❌ WRONG
// moduleA/manifest.tsx
depends: ['moduleB']

// moduleB/manifest.tsx
depends: ['moduleA']

// ✅ CORRECT
// Use hooks/events for bidirectional communication
```

### ❌ DON'T: Tight Coupling via Stores

```typescript
// ❌ WRONG
// Module A directly modifies Module B's store
import { moduleBStore } from '@/modules/moduleB/store';
moduleBStore.setState({ data: newData });

// ✅ CORRECT
// Emit event, let Module B update its own store
eventBus.emit('moduleA.data_updated', { data: newData });
```

---

## ✅ BEST PRACTICES

### 1. Hook System for UI Extension
**Use when**: Another module needs to add UI to your module
```typescript
// Your module
<HookPoint name="sales.toolbar.actions" />

// Other module
registry.addAction('sales.toolbar.actions', () => <MyButton />);
```

### 2. EventBus for Data Communication
**Use when**: Your module needs to notify others of data changes
```typescript
// Emit
eventBus.emit('sales.order_placed', orderData);

// Listen
eventBus.subscribe('sales.order_placed', handleOrder);
```

### 3. Shared Stores for Read-Only Data
**Use when**: Other modules need to READ your data
```typescript
// Provide
export const useSalesStore = create((set) => ({ orders: [] }));

// Consume (read-only)
const { orders } = useSalesStore();
```

### 4. Services for Shared Logic
**Use when**: Multiple modules need the same utility function
```typescript
// Provide
export const taxService = {
  calculateTax: (amount) => { /* ... */ }
};

// Consume
import { taxService } from '@/services/taxService';
```

---

## 📚 REFERENCE

**Related Documents:**
- `ARCHITECTURE_DESIGN_V2.md` - Master architecture document
- `MIGRATION_PLAN.md` - Step-by-step migration guide
- `PRODUCTION_PLAN.md` - Production readiness plan
- `CLAUDE.md` - Project instructions

**Code References:**
- `src/lib/modules/ModuleRegistry.ts` - Hook system implementation
- `src/lib/modules/HookPoint.tsx` - Hook rendering component
- `src/lib/events/EventBus.ts` - EventBus implementation
- `src/modules/*/manifest.tsx` - Module manifests (22 files)

---

**END OF CROSS-MODULE INTEGRATION MAP**

**Status**: 📋 COMPLETE
**Total Modules Documented**: 22
**Total Integration Points**: ~150+ (hooks, events, stores, navigation)
**Use**: Reference guide for cross-module development
