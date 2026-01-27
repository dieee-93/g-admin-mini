# Modules Reference Guide

**Version**: 1.0.0
**Last Updated**: December 21, 2025
**Status**: Complete

Complete reference documentation for all 26 modules in the G-Admin Mini permissions system.

---

## Table of Contents

- [Module Organization](#module-organization)
- [Domain: Core Operations](#domain-core-operations)
- [Domain: Resources](#domain-resources)
- [Domain: Finance](#domain-finance)
- [Domain: Customers](#domain-customers)
- [Domain: Analytics](#domain-analytics)
- [Domain: System](#domain-system)
- [Domain: Customer-Facing](#domain-customer-facing)
- [Module Summary Table](#module-summary-table)

---

## Module Organization

Modules are organized into 7 domains representing different business areas:

| Domain | Modules | Purpose |
|--------|---------|---------|
| **Core Operations** | 5 modules | Day-to-day business operations (sales, inventory, products) |
| **Resources** | 2 modules | Human resources and scheduling |
| **Finance** | 3 modules | Financial management and integrations |
| **Customers** | 4 modules | Customer relationship and lifecycle management |
| **Analytics** | 4 modules | Business intelligence and reporting |
| **System** | 3 modules | System configuration and tools |
| **Customer-Facing** | 3 modules | External customer portal modules |

**Total**: 26 modules across 7 domains

---

## Domain: Core Operations

### Module: `sales`

**Display Name**: Ventas / Sales
**Purpose**: Complete sales and order management system
**Category**: Core operational module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ✅ | Create new sales/orders |
| read | ✅ | View sales history and details |
| update | ✅ | Modify pending orders |
| delete | ✅ | Permanently delete sales records |
| void | ✅ | Cancel/void completed transactions |
| approve | ❌ | N/A for sales |
| configure | ✅ | Configure tax rates, payment methods, sales settings |
| export | ✅ | Export sales data for accounting/analysis |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No admin sales access |
| OPERADOR | create, read, update | Can process sales but not void/delete |
| SUPERVISOR | create, read, update, void | Can void incorrect sales |
| ADMINISTRADOR | ALL | Full sales management |
| SUPER_ADMIN | ALL | Full sales management |

**Minimum Role**: `OPERADOR`

#### Related Features (from FeatureRegistry)

- `sales_order_management` - Base order processing
- `sales_payment_processing` - Payment handling
- `sales_pos_onsite` - Point-of-sale system
- `sales_dine_in_orders` - Restaurant/onsite orders
- `sales_online_order_processing` - E-commerce orders
- `sales_split_payment` - Multiple payment methods
- `sales_tip_management` - Tips/gratuities
- `sales_coupon_management` - Discounts and promotions

#### Common Use Cases

```typescript
// OPERADOR: Create a sale
const createSale = async (saleData: Sale) => {
  requirePermission(user, 'sales', 'create');
  return await salesApi.create(saleData);
};

// SUPERVISOR: Void incorrect sale
const voidSale = async (saleId: string, reason: string) => {
  requirePermission(user, 'sales', 'void');
  return await salesApi.void(saleId, reason);
};

// ADMINISTRADOR: Export sales for accounting
const exportSalesReport = async (dateRange: DateRange) => {
  requirePermission(user, 'sales', 'export');
  return await salesApi.exportToCSV(dateRange);
};
```

---

### Module: `materials`

**Display Name**: Materiales / Inventory
**Purpose**: Inventory and materials management
**Category**: Core operational module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ✅ | Add new materials/SKUs |
| read | ✅ | View inventory levels |
| update | ✅ | Adjust stock quantities |
| delete | ✅ | Remove discontinued materials |
| void | ❌ | N/A for inventory |
| approve | ❌ | N/A for inventory |
| configure | ✅ | Configure units, reorder points, ABC classification |
| export | ✅ | Export inventory data |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No inventory access |
| OPERADOR | read, update | Can view and update stock after sales |
| SUPERVISOR | create, read, update | Can add new materials |
| ADMINISTRADOR | ALL | Full inventory management |
| SUPER_ADMIN | ALL | Full inventory management |

**Minimum Role**: `OPERADOR` (read-only for lower)

#### Related Features

- `inventory_stock_tracking` - Basic stock control
- `inventory_alert_system` - Low stock alerts
- `inventory_purchase_orders` - Purchase order creation
- `inventory_low_stock_auto_reorder` - Automatic reordering
- `inventory_batch_lot_tracking` - Lot/batch traceability
- `inventory_expiration_tracking` - FIFO/FEFO management

#### Common Use Cases

```typescript
// OPERADOR: Update stock after sale
const updateStockAfterSale = async (items: SaleItem[]) => {
  requirePermission(user, 'materials', 'update');

  for (const item of items) {
    await materialsApi.decrementStock(item.material_id, item.quantity);
  }
};

// SUPERVISOR: Create new material
const addMaterial = async (material: Material) => {
  requirePermission(user, 'materials', 'create');
  return await materialsApi.create(material);
};

// ADMINISTRADOR: Configure reorder points
const configureReorderPoints = async (materialId: string, config: ReorderConfig) => {
  requirePermission(user, 'materials', 'configure');
  return await materialsApi.updateReorderConfig(materialId, config);
};
```

---

### Module: `suppliers`

**Display Name**: Proveedores / Suppliers
**Purpose**: Supplier and vendor management
**Category**: Core operational module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ✅ | Add new suppliers |
| read | ✅ | View supplier catalog |
| update | ✅ | Modify supplier details |
| delete | ✅ | Remove suppliers |
| void | ❌ | N/A for suppliers |
| approve | ❌ | N/A for suppliers |
| configure | ✅ | Configure supplier preferences and terms |
| export | ✅ | Export supplier list |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No supplier access |
| OPERADOR | ❌ None | No supplier access |
| SUPERVISOR | ❌ None | No supplier access |
| ADMINISTRADOR | ALL | Full supplier management |
| SUPER_ADMIN | ALL | Full supplier management |

**Minimum Role**: `ADMINISTRADOR`

#### Related Features

- `inventory_supplier_management` - Supplier catalog
- `inventory_purchase_orders` - Purchase orders to suppliers
- `operations_vendor_performance` - Supplier KPIs

#### Common Use Cases

```typescript
// ADMINISTRADOR: Create supplier
const addSupplier = async (supplier: Supplier) => {
  requirePermission(user, 'suppliers', 'create');
  return await suppliersApi.create(supplier);
};

// ADMINISTRADOR: Configure payment terms
const setPaymentTerms = async (supplierId: string, terms: PaymentTerms) => {
  requirePermission(user, 'suppliers', 'configure');
  return await suppliersApi.updatePaymentTerms(supplierId, terms);
};
```

---

### Module: `products`

**Display Name**: Productos / Products
**Purpose**: Product catalog and recipe management
**Category**: Core operational module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ✅ | Add new products |
| read | ✅ | View product catalog |
| update | ✅ | Modify product details/recipes |
| delete | ✅ | Remove products |
| void | ❌ | N/A for products |
| approve | ❌ | N/A for products |
| configure | ✅ | Configure pricing, recipes, availability |
| export | ✅ | Export product catalog |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No admin product access (see `customer_menu`) |
| OPERADOR | read | View-only for POS |
| SUPERVISOR | create, read, update | Can modify products |
| ADMINISTRADOR | ALL | Full product management |
| SUPER_ADMIN | ALL | Full product management |

**Minimum Role**: `OPERADOR` (read-only)

#### Related Features

- `products_recipe_management` - Recipe/BOM definition
- `products_catalog_menu` - Menu-style catalog
- `products_catalog_ecommerce` - E-commerce catalog
- `products_package_management` - Product bundles
- `products_cost_intelligence` - Automated costing
- `products_availability_calculation` - Real-time availability

#### Common Use Cases

```typescript
// OPERADOR: View product for sale
const getProductDetails = async (productId: string) => {
  requirePermission(user, 'products', 'read');
  return await productsApi.getById(productId);
};

// SUPERVISOR: Update product price
const updateProductPrice = async (productId: string, newPrice: number) => {
  requirePermission(user, 'products', 'update');
  return await productsApi.updatePrice(productId, newPrice);
};

// ADMINISTRADOR: Configure product recipe
const setProductRecipe = async (productId: string, recipe: Recipe) => {
  requirePermission(user, 'products', 'configure');
  return await productsApi.setRecipe(productId, recipe);
};
```

---

### Module: `operations`

**Display Name**: Operaciones / Operations
**Purpose**: General operational management
**Category**: Core operational module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ✅ | Create operational records |
| read | ✅ | View operations data |
| update | ✅ | Modify operational records |
| delete | ✅ | Delete operational records |
| void | ❌ | N/A |
| approve | ❌ | N/A |
| configure | ✅ | Configure operational settings |
| export | ❌ | Not applicable |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No operations access |
| OPERADOR | read, update | View and update operations |
| SUPERVISOR | create, read, update | Can create operational records |
| ADMINISTRADOR | ALL | Full operations management |
| SUPER_ADMIN | ALL | Full operations management |

**Minimum Role**: `OPERADOR`

#### Related Features

- `operations_table_management` - Restaurant tables
- `operations_delivery_zones` - Delivery zones
- `operations_pickup_scheduling` - Pickup scheduling
- `operations_notification_system` - Notifications

---

## Domain: Resources

### Module: `staff`

**Display Name**: Personal / Staff
**Purpose**: Employee and HR management
**Category**: Resources module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ✅ | Hire new employees |
| read | ✅ | View employee records |
| update | ✅ | Modify employee details |
| delete | ✅ | Terminate employees |
| void | ❌ | N/A |
| approve | ✅ | Approve time off, expense requests |
| configure | ✅ | Configure HR policies |
| export | ✅ | Export employee data |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No staff access |
| OPERADOR | ❌ None | No staff access |
| SUPERVISOR | read, update | View and update staff info |
| ADMINISTRADOR | ALL | Full HR management |
| SUPER_ADMIN | ALL | Full HR management |

**Minimum Role**: `SUPERVISOR`

#### Related Features

- `staff_employee_management` - Employee records
- `staff_shift_management` - Shift scheduling
- `staff_time_tracking` - Time clock
- `staff_performance_tracking` - Performance reviews
- `staff_training_management` - Training programs

#### Common Use Cases

```typescript
// SUPERVISOR: Update employee details
const updateEmployee = async (employeeId: string, updates: Partial<Employee>) => {
  requirePermission(user, 'staff', 'update');
  return await staffApi.update(employeeId, updates);
};

// ADMINISTRADOR: Hire employee
const hireEmployee = async (employee: Employee) => {
  requirePermission(user, 'staff', 'create');
  return await staffApi.create(employee);
};

// ADMINISTRADOR: Approve time off
const approveTimeOff = async (requestId: string) => {
  requirePermission(user, 'staff', 'approve');
  return await staffApi.approveTimeOffRequest(requestId);
};
```

---

### Module: `scheduling`

**Display Name**: Programación / Scheduling
**Purpose**: Staff scheduling and appointment management
**Category**: Resources module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ✅ | Create schedules/appointments |
| read | ✅ | View schedules |
| update | ✅ | Modify schedules |
| delete | ✅ | Delete schedules |
| void | ❌ | N/A |
| approve | ✅ | Approve schedule changes |
| configure | ✅ | Configure scheduling rules |
| export | ❌ | Not applicable |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No scheduling access |
| OPERADOR | read | View own schedule only (filtered in service layer) |
| SUPERVISOR | create, read, update, approve | Full scheduling for location |
| ADMINISTRADOR | ALL | Full scheduling management |
| SUPER_ADMIN | ALL | Full scheduling management |

**Minimum Role**: `OPERADOR` (read-only, own schedule)

#### Related Features

- `scheduling_appointment_booking` - Appointment system
- `scheduling_calendar_management` - Calendar view
- `staff_shift_management` - Shift planning
- `scheduling_reminder_system` - Automated reminders

---

## Domain: Finance

### Module: `fiscal`

**Display Name**: Fiscal / Tax Management
**Purpose**: Tax compliance and fiscal reporting
**Category**: Finance module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ✅ | Create fiscal documents |
| read | ✅ | View fiscal records |
| update | ✅ | Modify fiscal documents |
| delete | ✅ | Delete fiscal records |
| void | ✅ | Void fiscal transactions |
| approve | ❌ | N/A |
| configure | ✅ | Configure tax rates and fiscal settings |
| export | ✅ | Export fiscal reports |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No fiscal access |
| OPERADOR | ❌ None | No fiscal access |
| SUPERVISOR | read | View-only for basic reporting |
| ADMINISTRADOR | ALL | Full fiscal management |
| SUPER_ADMIN | ALL | Full fiscal management |

**Minimum Role**: `SUPERVISOR` (read-only)

---

### Module: `billing`

**Display Name**: Facturación / Billing
**Purpose**: Invoice and billing management
**Category**: Finance module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ✅ | Create invoices |
| read | ✅ | View billing history |
| update | ✅ | Modify invoices |
| delete | ✅ | Delete invoices |
| void | ✅ | Void invoices |
| approve | ❌ | N/A |
| configure | ✅ | Configure billing settings |
| export | ✅ | Export billing data |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No billing access |
| OPERADOR | ❌ None | No billing access |
| SUPERVISOR | read | View-only |
| ADMINISTRADOR | ALL | Full billing management |
| SUPER_ADMIN | ALL | Full billing management |

**Minimum Role**: `SUPERVISOR` (read-only)

---

### Module: `integrations`

**Display Name**: Integraciones / Payment Integrations
**Purpose**: Payment gateway and third-party integrations
**Category**: Finance module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ✅ | Create integration configs |
| read | ✅ | View integration status |
| update | ✅ | Modify integration settings |
| delete | ✅ | Remove integrations |
| void | ❌ | N/A |
| approve | ❌ | N/A |
| configure | ✅ | Configure API keys and webhooks |
| export | ❌ | N/A |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No integrations access |
| OPERADOR | ❌ None | No integrations access |
| SUPERVISOR | ❌ None | No integrations access |
| ADMINISTRADOR | ALL | Full integrations management |
| SUPER_ADMIN | ALL | Full integrations management |

**Minimum Role**: `ADMINISTRADOR`

---

## Domain: Customers

### Module: `customers`

**Display Name**: Clientes / Customers
**Purpose**: Customer relationship management (CRM)
**Category**: Customers module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ✅ | Register new customers |
| read | ✅ | View customer records |
| update | ✅ | Modify customer details |
| delete | ✅ | Delete customer records |
| void | ❌ | N/A |
| approve | ❌ | N/A |
| configure | ❌ | N/A |
| export | ✅ | Export customer list |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No admin customer access |
| OPERADOR | create, read, update | Can register customers during sales |
| SUPERVISOR | create, read, update | Can manage customers |
| ADMINISTRADOR | ALL | Full customer management |
| SUPER_ADMIN | ALL | Full customer management |

**Minimum Role**: `OPERADOR`

---

### Module: `memberships`

**Display Name**: Membresías / Memberships
**Purpose**: Membership and subscription management
**Category**: Customers module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ✅ | Create memberships |
| read | ✅ | View membership status |
| update | ✅ | Modify membership details |
| delete | ✅ | Cancel memberships |
| void | ❌ | N/A |
| approve | ✅ | Approve membership applications |
| configure | ✅ | Configure membership plans |
| export | ❌ | N/A |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No admin membership access |
| OPERADOR | read | View-only |
| SUPERVISOR | read, update | Can update status |
| ADMINISTRADOR | ALL | Full membership management |
| SUPER_ADMIN | ALL | Full membership management |

**Minimum Role**: `OPERADOR` (read-only)

---

### Module: `rentals`

**Display Name**: Alquileres / Rentals
**Purpose**: Equipment and space rental management
**Category**: Customers module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ✅ | Create rental bookings |
| read | ✅ | View rental history |
| update | ✅ | Modify rental details |
| delete | ✅ | Cancel rentals |
| void | ❌ | N/A |
| approve | ❌ | N/A |
| configure | ✅ | Configure rental rates and policies |
| export | ❌ | N/A |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No admin rental access |
| OPERADOR | ❌ None | No rental access |
| SUPERVISOR | create, read, update | Can manage rentals |
| ADMINISTRADOR | ALL | Full rental management |
| SUPER_ADMIN | ALL | Full rental management |

**Minimum Role**: `SUPERVISOR`

---

### Module: `assets`

**Display Name**: Activos / Assets
**Purpose**: Business asset and equipment management
**Category**: Customers module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ✅ | Register new assets |
| read | ✅ | View asset inventory |
| update | ✅ | Update asset details |
| delete | ✅ | Decommission assets |
| void | ❌ | N/A |
| approve | ❌ | N/A |
| configure | ✅ | Configure asset policies |
| export | ❌ | N/A |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No asset access |
| OPERADOR | ❌ None | No asset access |
| SUPERVISOR | read, update | View and maintain assets |
| ADMINISTRADOR | ALL | Full asset management |
| SUPER_ADMIN | ALL | Full asset management |

**Minimum Role**: `SUPERVISOR`

---

## Domain: Analytics

### Module: `reporting`

**Display Name**: Reportes / Reports
**Purpose**: Standard business reports and analytics
**Category**: Analytics module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ❌ | Reports are generated, not created |
| read | ✅ | View reports |
| update | ❌ | Reports are immutable |
| delete | ❌ | Reports are immutable |
| void | ❌ | N/A |
| approve | ❌ | N/A |
| configure | ✅ | Configure report parameters |
| export | ✅ | Export reports to CSV/PDF |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No reporting access |
| OPERADOR | ❌ None | No reporting access |
| SUPERVISOR | read | View operational reports |
| ADMINISTRADOR | ALL | Full reporting access |
| SUPER_ADMIN | ALL | Full reporting access |

**Minimum Role**: `SUPERVISOR` (read-only)

---

### Module: `intelligence`

**Display Name**: Inteligencia de Negocios / Business Intelligence
**Purpose**: Advanced analytics and AI-powered insights
**Category**: Analytics module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ❌ | Insights are generated |
| read | ✅ | View BI insights |
| update | ❌ | Read-only |
| delete | ❌ | Read-only |
| void | ❌ | N/A |
| approve | ❌ | N/A |
| configure | ✅ | Configure BI parameters |
| export | ❌ | Use reporting module |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No BI access |
| OPERADOR | ❌ None | No BI access |
| SUPERVISOR | ❌ None | No BI access |
| ADMINISTRADOR | ALL | Full BI access |
| SUPER_ADMIN | ALL | Full BI access |

**Minimum Role**: `ADMINISTRADOR`

---

### Module: `executive`

**Display Name**: Dashboard Ejecutivo / Executive Dashboard
**Purpose**: Executive-level KPIs and metrics
**Category**: Analytics module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ❌ | Dashboard is generated |
| read | ✅ | View executive metrics |
| update | ❌ | Read-only |
| delete | ❌ | Read-only |
| void | ❌ | N/A |
| approve | ❌ | N/A |
| configure | ✅ | Configure KPIs and widgets |
| export | ✅ | Export executive reports |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No executive access |
| OPERADOR | ❌ None | No executive access |
| SUPERVISOR | ❌ None | No executive access |
| ADMINISTRADOR | ALL | Full executive dashboard |
| SUPER_ADMIN | ALL | Full executive dashboard |

**Minimum Role**: `ADMINISTRADOR`

---

### Module: `dashboard`

**Display Name**: Dashboard / Dashboard
**Purpose**: Main operational dashboard
**Category**: Analytics module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ❌ | Dashboard is generated |
| read | ✅ | View dashboard |
| update | ❌ | Read-only |
| delete | ❌ | Read-only |
| void | ❌ | N/A |
| approve | ❌ | N/A |
| configure | ✅ | Customize dashboard widgets |
| export | ❌ | Use reporting module |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No admin dashboard |
| OPERADOR | read | Basic dashboard view |
| SUPERVISOR | read | Operational dashboard |
| ADMINISTRADOR | ALL | Full dashboard customization |
| SUPER_ADMIN | ALL | Full dashboard customization |

**Minimum Role**: `OPERADOR`

---

## Domain: System

### Module: `settings`

**Display Name**: Configuración / Settings
**Purpose**: System configuration and preferences
**Category**: System module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ❌ | Settings exist, not created |
| read | ✅ | View settings |
| update | ✅ | Modify settings |
| delete | ❌ | Settings cannot be deleted |
| void | ❌ | N/A |
| approve | ❌ | N/A |
| configure | ✅ | System-wide configuration |
| export | ❌ | N/A |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | read, update | Own profile settings only |
| OPERADOR | ❌ None | No settings access |
| SUPERVISOR | ❌ None | No settings access |
| ADMINISTRADOR | ALL | Full system configuration |
| SUPER_ADMIN | ALL | Full system configuration |

**Minimum Role**: Varies (CLIENTE for own profile, ADMINISTRADOR for system)

---

### Module: `gamification`

**Display Name**: Gamificación / Gamification
**Purpose**: Achievement and progress tracking system
**Category**: System module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ❌ | Achievements are predefined |
| read | ✅ | View achievements and progress |
| update | ❌ | Progress is automatic |
| delete | ❌ | Cannot delete achievements |
| void | ❌ | N/A |
| approve | ❌ | N/A |
| configure | ✅ | Configure achievement rules |
| export | ❌ | N/A |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No gamification access |
| OPERADOR | read | View own progress |
| SUPERVISOR | read | View own progress |
| ADMINISTRADOR | ALL | Configure achievement system |
| SUPER_ADMIN | ALL | Configure achievement system |

**Minimum Role**: `OPERADOR` (read-only)

---

### Module: `debug`

**Display Name**: Herramientas de Debug / Debug Tools
**Purpose**: System debugging and infrastructure management
**Category**: System module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ✅ | Create debug sessions/logs |
| read | ✅ | View logs and metrics |
| update | ✅ | Modify debug configurations |
| delete | ✅ | Clear logs/cache |
| void | ❌ | N/A |
| approve | ❌ | N/A |
| configure | ✅ | System-level debugging config |
| export | ❌ | N/A |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | ❌ None | No debug access |
| OPERADOR | ❌ None | No debug access |
| SUPERVISOR | ❌ None | No debug access |
| ADMINISTRADOR | ❌ None | **NO ACCESS - Only SUPER_ADMIN** |
| SUPER_ADMIN | ALL | **ONLY ROLE WITH DEBUG ACCESS** |

**Minimum Role**: `SUPER_ADMIN` (exclusive)

**Security Note**: Debug access is intentionally restricted to SUPER_ADMIN only to prevent business users from accessing infrastructure tools.

---

## Domain: Customer-Facing

### Module: `customer_portal`

**Display Name**: Portal de Clientes / Customer Portal
**Purpose**: Customer self-service portal
**Category**: Customer-facing module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ❌ | Portal access is granted |
| read | ✅ | View portal content |
| update | ✅ | Update own information |
| delete | ❌ | Cannot delete portal |
| void | ❌ | N/A |
| approve | ❌ | N/A |
| configure | ❌ | N/A |
| export | ❌ | N/A |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | read, update | Full customer portal access |
| OPERADOR | ❌ None | No customer portal access |
| SUPERVISOR | read | Support/troubleshooting access |
| ADMINISTRADOR | read | Support/troubleshooting access |
| SUPER_ADMIN | read | Support/troubleshooting access |

**Minimum Role**: `CLIENTE`

---

### Module: `customer_menu`

**Display Name**: Menú de Clientes / Customer Menu
**Purpose**: Public product/service menu
**Category**: Customer-facing module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ❌ | Menu is managed in products |
| read | ✅ | View menu |
| update | ❌ | Menu is managed in products |
| delete | ❌ | Menu is managed in products |
| void | ❌ | N/A |
| approve | ❌ | N/A |
| configure | ❌ | N/A |
| export | ❌ | N/A |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | read | Browse menu |
| OPERADOR | ❌ None | Use admin products module |
| SUPERVISOR | read | Preview customer view |
| ADMINISTRADOR | read | Preview customer view |
| SUPER_ADMIN | read | Preview customer view |

**Minimum Role**: `CLIENTE`

---

### Module: `my_orders`

**Display Name**: Mis Pedidos / My Orders
**Purpose**: Customer order history and tracking
**Category**: Customer-facing module

#### Available Actions

| Action | Available | Purpose |
|--------|-----------|---------|
| create | ✅ | Place new orders |
| read | ✅ | View order history |
| update | ❌ | Orders managed by staff |
| delete | ❌ | Cannot delete orders |
| void | ❌ | Void requires staff |
| approve | ❌ | N/A |
| configure | ❌ | N/A |
| export | ❌ | N/A |

#### Role Access Matrix

| Role | Permissions | Notes |
|------|-------------|-------|
| CLIENTE | read, create | View and create own orders |
| OPERADOR | ❌ None | Use admin sales module |
| SUPERVISOR | read | Support access |
| ADMINISTRADOR | read | Support access |
| SUPER_ADMIN | read | Support access |

**Minimum Role**: `CLIENTE`

---

## Module Summary Table

| Module | Domain | Min Role | Key Actions | Purpose |
|--------|--------|----------|-------------|---------|
| sales | Core Ops | OPERADOR | create, read, update, void (SUPER+) | Sales management |
| materials | Core Ops | OPERADOR | read, update | Inventory tracking |
| suppliers | Core Ops | ADMINISTRADOR | create, read, update, delete | Supplier management |
| products | Core Ops | OPERADOR | read | Product catalog |
| operations | Core Ops | OPERADOR | read, update | Operations |
| staff | Resources | SUPERVISOR | read, update | HR management |
| scheduling | Resources | OPERADOR | read (own only) | Scheduling |
| fiscal | Finance | SUPERVISOR | read | Tax management |
| billing | Finance | SUPERVISOR | read | Invoicing |
| integrations | Finance | ADMINISTRADOR | ALL | Payment gateways |
| customers | Customers | OPERADOR | create, read, update | CRM |
| memberships | Customers | OPERADOR | read | Memberships |
| rentals | Customers | SUPERVISOR | create, read, update | Rentals |
| assets | Customers | SUPERVISOR | read, update | Asset tracking |
| reporting | Analytics | SUPERVISOR | read | Reports |
| intelligence | Analytics | ADMINISTRADOR | read | BI insights |
| executive | Analytics | ADMINISTRADOR | read | Executive KPIs |
| dashboard | Analytics | OPERADOR | read | Dashboard |
| settings | System | ADMINISTRADOR | read, update, configure | System config |
| gamification | System | OPERADOR | read | Achievements |
| debug | System | SUPER_ADMIN | ALL | Debug tools |
| customer_portal | Customer | CLIENTE | read, update | Portal |
| customer_menu | Customer | CLIENTE | read | Menu |
| my_orders | Customer | CLIENTE | read, create | Orders |

---

## Related Documentation

- [ROLES.md](./ROLES.md) - Complete role reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development patterns
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [SECURITY.md](./SECURITY.md) - Security best practices
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

---

**Version**: 1.0.0
**Last Updated**: December 21, 2025
**Maintainer**: Development Team
