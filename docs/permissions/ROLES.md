# Roles Reference Guide

**Version**: 1.0.0
**Last Updated**: December 21, 2025
**Status**: Complete

Complete reference documentation for all roles in the G-Admin Mini permissions system.

---

## Table of Contents

- [Role Hierarchy](#role-hierarchy)
- [Role Definitions](#role-definitions)
  - [CLIENTE - Customer Portal](#cliente---customer-portal)
  - [OPERADOR - Frontline Staff](#operador---frontline-staff)
  - [SUPERVISOR - Shift Manager](#supervisor---shift-manager)
  - [ADMINISTRADOR - Business Owner](#administrador---business-owner)
  - [SUPER_ADMIN - System Administrator](#super_admin---system-administrator)
- [Role Comparison](#role-comparison)
- [Code Examples](#code-examples)

---

## Role Hierarchy

The system implements a 5-level role hierarchy where higher levels inherit base capabilities:

```
SUPER_ADMIN (Level 4)  ← System infrastructure access
    ↓
ADMINISTRADOR (Level 3)  ← Full business management
    ↓
SUPERVISOR (Level 2)  ← Operational oversight
    ↓
OPERADOR (Level 1)  ← Frontline tasks
    ↓
CLIENTE (Level 0)  ← Customer self-service
```

**Hierarchy Levels** (defined in `PermissionsRegistry.ts`):
```typescript
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'CLIENTE': 0,
  'OPERADOR': 1,
  'SUPERVISOR': 2,
  'ADMINISTRADOR': 3,
  'SUPER_ADMIN': 4,
};
```

---

## Role Definitions

### CLIENTE - Customer Portal

**Role ID**: `CLIENTE`
**Hierarchy Level**: 0 (Lowest)
**Default Route**: `/app/portal`
**Purpose**: Customer self-service portal access

#### Typical Users
- End customers
- Clients
- External users
- Self-service portal users

#### Complete Permission Matrix

| Module | Create | Read | Update | Delete | Void | Approve | Configure | Export |
|--------|--------|------|--------|--------|------|---------|-----------|--------|
| **Customer-Facing Modules** |
| customer_portal | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| customer_menu | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| my_orders | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| settings | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **All Admin Modules** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Summary**:
- **Total Accessible Modules**: 4 of 26 (15%)
- **Total Permissions**: 6 actions across 4 modules
- **Key Permissions**: Can view menu, create own orders, update own profile

#### Use Cases and Scenarios

**Day-to-Day Tasks**:
1. Browse product/service menu
2. Place online orders
3. View order history
4. Track order status
5. Update personal information
6. Manage own account settings

**Real-World Example**:
```typescript
// Customer viewing their order history
const CustomerOrders = () => {
  const { canRead, canCreate } = usePermissions('my_orders');
  const { canRead: canViewMenu } = usePermissions('customer_menu');

  if (!canRead) return <AccessDenied />;

  return (
    <>
      {canViewMenu && <MenuBrowser />}
      <OrderHistory />
      {canCreate && <CreateOrderButton />}
    </>
  );
};
```

#### Restrictions and Why

- **Cannot Access Admin Modules**: Business logic separation - customers should not see business operations
- **Cannot View Other Customers' Data**: Privacy and security - RLS policies enforce own data only
- **Cannot Modify Orders After Placement**: Business rule - order modifications require staff approval
- **Cannot Export Data**: Compliance - prevents data scraping and unauthorized data extraction

#### Migration Notes

No migration needed - CLIENTE is the default fallback role for all new users.

---

### OPERADOR - Frontline Staff

**Role ID**: `OPERADOR`
**Hierarchy Level**: 1
**Default Route**: `/admin/operations/sales`
**Purpose**: Point-of-sale and operational tasks

#### Typical Users
- Cashiers
- Waiters/waitresses
- Sales associates
- Front desk staff
- Service technicians

#### Complete Permission Matrix

| Module | Create | Read | Update | Delete | Void | Approve | Configure | Export |
|--------|--------|------|--------|--------|------|---------|-----------|--------|
| **Core Operations** |
| sales | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| materials | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| products | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| operations | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Customers** |
| customers | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| memberships | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Resources** |
| scheduling | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Analytics** |
| dashboard | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| gamification | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **No Access** |
| staff, suppliers, fiscal, billing, integrations, rentals, assets, reporting, intelligence, executive, settings, debug | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Summary**:
- **Total Accessible Modules**: 9 of 26 (35%)
- **Total Permissions**: 15 actions across 9 modules
- **Key Permissions**: Create sales, update inventory, manage customers during transactions

#### Use Cases and Scenarios

**Day-to-Day Tasks**:
1. Process customer sales at POS
2. Update inventory levels after sales
3. Register new customers during checkout
4. View product catalog for pricing
5. Check own work schedule
6. View own gamification progress

**Real-World Example**:
```typescript
// Cashier processing a sale
const POSView = () => {
  const { canCreate: canCreateSale } = usePermissions('sales');
  const { canUpdate: canUpdateInventory } = usePermissions('materials');
  const { canCreate: canCreateCustomer } = usePermissions('customers');

  const processSale = async (saleData) => {
    // Service layer will validate OPERADOR permissions
    await createSale(saleData, currentUser);

    // Automatically update inventory
    if (canUpdateInventory) {
      await updateInventoryLevels(saleData.items);
    }
  };

  return (
    <>
      {canCreateSale && <SaleForm onSubmit={processSale} />}
      {canCreateCustomer && <QuickCustomerRegister />}
    </>
  );
};
```

#### Restrictions and Why

- **Cannot Delete Any Records**: Audit trail - all deletions must be approved by supervisors
- **Cannot Void Sales**: Financial control - voiding requires supervisor approval
- **Cannot Access Financial Reports**: Information security - salary/profit data is confidential
- **Cannot Configure System**: Operational safety - prevents accidental misconfigurations
- **Cannot Manage Staff**: HR boundary - staff management is supervisor/admin responsibility
- **Cannot Export Data**: Data protection - prevents unauthorized data extraction

#### Scheduling Access Note

OPERADOR can read scheduling but **filtered to own schedule only**. Service layer enforces:
```typescript
// Service layer filtering
const getEmployeeSchedule = async (user: AuthUser) => {
  requirePermission(user, 'scheduling', 'read');

  // OPERADOR can only see own schedule
  if (user.role === 'OPERADOR') {
    return supabase
      .from('schedules')
      .select('*')
      .eq('employee_id', user.id); // Filtered to own ID
  }

  // Higher roles see all schedules
  return supabase.from('schedules').select('*');
};
```

---

### SUPERVISOR - Shift Manager

**Role ID**: `SUPERVISOR`
**Hierarchy Level**: 2
**Default Route**: `/admin/dashboard`
**Purpose**: Operational oversight and approvals for single location

#### Typical Users
- Shift managers
- Team leads
- Department supervisors
- Floor managers
- Service managers

#### Complete Permission Matrix

| Module | Create | Read | Update | Delete | Void | Approve | Configure | Export |
|--------|--------|------|--------|--------|------|---------|-----------|--------|
| **Core Operations** |
| sales | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| materials | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| products | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| operations | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Resources** |
| staff | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| scheduling | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Finance** |
| fiscal | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| billing | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Customers** |
| customers | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| memberships | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| rentals | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| assets | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Analytics** |
| reporting | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| dashboard | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| gamification | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Customer-Facing** |
| customer_portal | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| customer_menu | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| my_orders | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **No Access** |
| suppliers, integrations, intelligence, executive, settings, debug | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Summary**:
- **Total Accessible Modules**: 16 of 26 (62%)
- **Total Permissions**: 37 actions across 16 modules
- **Key Permissions**: Void sales, approve schedules, manage daily operations

#### Use Cases and Scenarios

**Day-to-Day Tasks**:
1. Void incorrect or fraudulent sales
2. Approve employee schedule requests
3. Manage daily inventory operations
4. Oversee staff during shift
5. Resolve customer issues
6. View operational performance reports
7. Manage rental bookings
8. Update membership statuses

**Real-World Example**:
```typescript
// Supervisor voiding an incorrect sale
const SalesManagement = () => {
  const { canVoid } = usePermissions('sales');
  const { canApprove } = usePermissions('scheduling');

  const voidSale = async (saleId: string, reason: string) => {
    // Only SUPERVISOR or higher can void
    requirePermission(currentUser, 'sales', 'void');

    await supabase
      .from('sales')
      .update({
        status: 'VOIDED',
        voided_by: currentUser.id,
        void_reason: reason,
        voided_at: new Date().toISOString()
      })
      .eq('id', saleId);
  };

  const approveSchedule = async (scheduleId: string) => {
    requirePermission(currentUser, 'scheduling', 'approve');

    await supabase
      .from('schedules')
      .update({
        status: 'APPROVED',
        approved_by: currentUser.id
      })
      .eq('id', scheduleId);
  };

  return (
    <>
      {canVoid && <VoidSaleButton onClick={voidSale} />}
      {canApprove && <ApproveScheduleButton onClick={approveSchedule} />}
    </>
  );
};
```

#### Restrictions and Why

- **Cannot Delete Records**: Audit compliance - deletions require admin approval, supervisors use void instead
- **Cannot Configure System**: Safety - system-wide changes require admin approval
- **Cannot Access Financial Details**: Information hierarchy - profit margins, costs are admin-level
- **Cannot Export Data**: Data security - prevents unauthorized data extraction
- **Cannot Manage Staff Records**: HR boundary - hiring/firing is admin responsibility
- **Cannot Create Suppliers**: Strategic decision - supplier relationships managed by admin

#### Special Permissions

**Void Permission** (vs Delete):
- SUPERVISOR can void sales (soft delete, reversible)
- SUPERVISOR cannot delete sales (permanent, non-reversible)
- Voiding preserves audit trail while correcting errors

**Approve Permission**:
- SUPERVISOR can approve scheduling requests (time off, shift swaps)
- Approval workflow ensures accountability
- Cannot approve own requests (enforced in service layer)

---

### ADMINISTRADOR - Business Owner

**Role ID**: `ADMINISTRADOR`
**Hierarchy Level**: 3
**Default Route**: `/admin/dashboard`
**Purpose**: Complete business management with full operational control

#### Typical Users
- Business owners
- General managers
- Operations directors
- C-level executives (except IT)

#### Complete Permission Matrix

**Full Access to ALL modules EXCEPT debug**

| Domain | Modules | All Actions | Exception |
|--------|---------|-------------|-----------|
| **Core Operations** | sales, materials, suppliers, products, operations | ✅ create, read, update, delete, configure, export, void | - |
| **Resources** | staff, scheduling | ✅ create, read, update, delete, approve, configure, export | - |
| **Finance** | fiscal, billing, integrations | ✅ create, read, update, delete, void, configure, export | - |
| **Customers** | customers, memberships, rentals, assets | ✅ create, read, update, delete, configure, export | memberships adds approve |
| **Analytics** | reporting, intelligence, executive, dashboard | ✅ read, configure, export | No create/update/delete (read-only data) |
| **System** | settings, gamification | ✅ read, update, configure | No create/delete (system-level) |
| **Customer-Facing** | customer_portal, customer_menu, my_orders | ✅ read | Support/testing access only |
| **Debug** | debug | ❌ NO ACCESS | Only SUPER_ADMIN |

**Summary**:
- **Total Accessible Modules**: 25 of 26 (96%)
- **Total Permissions**: 140+ actions across 25 modules
- **Key Restriction**: Cannot access debug tools

#### Detailed Permission Breakdown

**Core Operations** (Full CRUD + Special):
```typescript
sales: ['create', 'read', 'update', 'delete', 'void', 'configure', 'export']
materials: ['create', 'read', 'update', 'delete', 'configure', 'export']
suppliers: ['create', 'read', 'update', 'delete', 'configure', 'export']
products: ['create', 'read', 'update', 'delete', 'configure', 'export']
operations: ['create', 'read', 'update', 'delete', 'configure']
```

**Resources** (Full + Approvals):
```typescript
staff: ['create', 'read', 'update', 'delete', 'approve', 'configure', 'export']
scheduling: ['create', 'read', 'update', 'delete', 'approve', 'configure']
```

**Finance** (Full + Void):
```typescript
fiscal: ['create', 'read', 'update', 'delete', 'void', 'configure', 'export']
billing: ['create', 'read', 'update', 'delete', 'void', 'configure', 'export']
integrations: ['create', 'read', 'update', 'delete', 'configure']
```

**Customers**:
```typescript
customers: ['create', 'read', 'update', 'delete', 'export']
memberships: ['create', 'read', 'update', 'delete', 'approve', 'configure']
rentals: ['create', 'read', 'update', 'delete', 'configure']
assets: ['create', 'read', 'update', 'delete', 'configure']
```

**Analytics** (Read-Only + Export):
```typescript
reporting: ['read', 'export', 'configure']
intelligence: ['read', 'configure']
executive: ['read', 'export', 'configure']
dashboard: ['read', 'configure']
```

**System**:
```typescript
settings: ['read', 'update', 'configure']
gamification: ['read', 'configure']
```

#### Use Cases and Scenarios

**Day-to-Day Tasks**:
1. Complete financial oversight and management
2. Staff hiring, management, and payroll
3. System configuration and business rules
4. Business intelligence and reporting
5. Multi-location management (Phase 2E)
6. Supplier and vendor relationships
7. Membership program configuration
8. Strategic planning and analytics

**Real-World Examples**:

**Financial Management**:
```typescript
const FinancialDashboard = () => {
  const { canRead: canReadFiscal, canExport } = usePermissions('fiscal');
  const { canRead: canReadBilling } = usePermissions('billing');
  const { canConfigure } = usePermissions('integrations');

  return (
    <>
      {canReadFiscal && <FiscalReports />}
      {canReadBilling && <BillingHistory />}
      {canExport && <ExportFinancialDataButton />}
      {canConfigure && <PaymentGatewaySettings />}
    </>
  );
};
```

**Staff Management**:
```typescript
const StaffManagement = () => {
  const {
    canCreate,
    canDelete,
    canApprove,
    canConfigure
  } = usePermissions('staff');

  const hireEmployee = async (employeeData) => {
    requirePermission(currentUser, 'staff', 'create');
    // Only ADMINISTRADOR can hire
  };

  const terminateEmployee = async (employeeId) => {
    requirePermission(currentUser, 'staff', 'delete');
    // Only ADMINISTRADOR can terminate
  };

  return (
    <>
      {canCreate && <HireEmployeeButton />}
      {canDelete && <TerminateEmployeeButton />}
      {canApprove && <ApproveTimeOffRequests />}
      {canConfigure && <StaffPoliciesConfig />}
    </>
  );
};
```

**System Configuration**:
```typescript
const SystemSettings = () => {
  const { canConfigure: canConfigureSales } = usePermissions('sales');
  const { canConfigure: canConfigureSettings } = usePermissions('settings');
  const { canConfigure: canConfigureMemberships } = usePermissions('memberships');

  return (
    <>
      {canConfigureSales && <SalesTaxConfiguration />}
      {canConfigureSettings && <BusinessHoursConfig />}
      {canConfigureMemberships && <MembershipPlansConfig />}
    </>
  );
};
```

#### Restrictions and Why

**The One Major Restriction**:

- **Cannot Access Debug Tools**:
  - **Why**: Debug tools expose infrastructure, database internals, and system vulnerabilities
  - **Security**: Business owners should not need infrastructure access
  - **Separation of Concerns**: Business management ≠ IT infrastructure
  - **Who Can**: Only SUPER_ADMIN (IT staff, developers)

**Why This Matters**:
```typescript
// ❌ ADMINISTRADOR attempting debug access
const { canRead } = usePermissions('debug');
console.log(canRead); // false

// ✅ SUPER_ADMIN debug access
const { canRead } = usePermissions('debug');
console.log(canRead); // true
```

#### Multi-Location Access (Phase 2E)

ADMINISTRADOR has access to **all locations** by default:

```typescript
// Service layer - location filtering
const getSales = async (user: UserWithLocation) => {
  requireModuleAccess(user, 'sales');

  // ADMINISTRADOR sees ALL locations
  if (user.role === 'ADMINISTRADOR' || user.role === 'SUPER_ADMIN') {
    return supabase.from('sales').select('*'); // No filter
  }

  // Other roles filtered by location
  const locationIds = getAccessibleLocationIds(user);
  return supabase.from('sales').select('*').in('location_id', locationIds);
};
```

---

### SUPER_ADMIN - System Administrator

**Role ID**: `SUPER_ADMIN`
**Hierarchy Level**: 4 (Highest)
**Default Route**: `/admin/dashboard`
**Purpose**: System-level administration, debugging, and infrastructure management

#### Typical Users
- IT administrators
- System developers
- DevOps engineers
- Technical support staff
- Infrastructure managers

#### Complete Permission Matrix

**Full Access to EVERYTHING including debug**

Inherits ALL permissions from ADMINISTRADOR **PLUS**:

| Module | Additional Permissions vs ADMINISTRADOR |
|--------|----------------------------------------|
| **debug** | ✅ read, create, update, delete, configure |
| **All other modules** | Same as ADMINISTRADOR |

**Summary**:
- **Total Accessible Modules**: 26 of 26 (100%)
- **Total Permissions**: 150+ actions across 26 modules
- **Unique Permission**: Full debug access

#### Debug Module Permissions

```typescript
debug: ['read', 'create', 'update', 'delete', 'configure']
```

**What Debug Access Enables**:
- View system logs and error traces
- Access database query inspector
- Modify feature flags and configuration
- View performance metrics and profiling
- Access service worker debugging
- Inspect authentication JWT tokens
- Database schema modifications (dangerous)
- Cache management and invalidation

#### Use Cases and Scenarios

**Day-to-Day Tasks**:
1. System performance monitoring
2. Debugging production issues
3. Database maintenance and optimization
4. Infrastructure updates and patches
5. Security audits and hardening
6. Feature flag configuration
7. System health monitoring
8. Disaster recovery operations

**Real-World Examples**:

**Debugging Production Issue**:
```typescript
const DebugConsole = () => {
  const { canRead } = usePermissions('debug');

  // Only SUPER_ADMIN can see this
  if (!canRead) return null;

  const inspectJWTToken = () => {
    const token = session?.access_token;
    const claims = decodeJWTClaims(token);
    console.log('JWT Claims:', claims);
  };

  const viewErrorLogs = async () => {
    const { data } = await supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    return data;
  };

  return (
    <DebugPanel>
      <JWTInspector onClick={inspectJWTToken} />
      <ErrorLogViewer onLoad={viewErrorLogs} />
      <PerformanceProfiler />
      <DatabaseQueryInspector />
    </DebugPanel>
  );
};
```

**Feature Flag Management**:
```typescript
const FeatureFlagManager = () => {
  const { canConfigure } = usePermissions('debug');

  requirePermission(currentUser, 'debug', 'configure');

  const toggleFeature = async (featureId: string, enabled: boolean) => {
    // Only SUPER_ADMIN can modify feature flags
    await supabase
      .from('feature_flags')
      .update({ enabled })
      .eq('id', featureId);
  };

  return <FeatureFlagUI onToggle={toggleFeature} />;
};
```

**Database Maintenance**:
```typescript
const DatabaseMaintenance = () => {
  const { canConfigure } = usePermissions('debug');

  const optimizeDatabase = async () => {
    requirePermission(currentUser, 'debug', 'configure');

    // Run VACUUM, ANALYZE, rebuild indexes
    await supabase.rpc('optimize_database');
  };

  const clearCache = async () => {
    requirePermission(currentUser, 'debug', 'configure');

    await supabase.rpc('clear_cache');
  };

  return (
    <>
      <OptimizeDatabaseButton onClick={optimizeDatabase} />
      <ClearCacheButton onClick={clearCache} />
    </>
  );
};
```

#### Restrictions and Best Practices

**Should NOT Be Used For**:
- Daily business operations (use ADMINISTRADOR instead)
- Regular sales or inventory management
- Customer service
- Normal reporting and analytics

**Should ONLY Be Used For**:
- System troubleshooting
- Infrastructure changes
- Performance optimization
- Security audits
- Feature deployments
- Emergency fixes

**Security Warning**:
```typescript
// 🚨 DANGER: SUPER_ADMIN can do ANYTHING
// This role should NOT be assigned to business users
// Only for IT staff and developers

// Example of dangerous operation:
const dangerousOperation = async () => {
  requirePermission(currentUser, 'debug', 'delete');

  // Can delete critical system data
  await supabase.from('system_config').delete().eq('id', 'critical');

  // Can modify RLS policies
  await supabase.rpc('disable_rls_policies');

  // Can access all user data
  await supabase.from('users').select('*');
};
```

**Best Practices**:
1. **Minimal Assignment**: Only assign to IT staff who need it
2. **Audit Logging**: All SUPER_ADMIN actions should be logged
3. **Time-Limited**: Consider temporary elevation instead of permanent role
4. **MFA Required**: Always require multi-factor authentication
5. **Separate Accounts**: Don't use SUPER_ADMIN for business tasks

---

## Role Comparison

### Side-by-Side Comparison Table

| Capability | CLIENTE | OPERADOR | SUPERVISOR | ADMINISTRADOR | SUPER_ADMIN |
|------------|---------|----------|------------|---------------|-------------|
| **Sales Operations** |
| Create Sales | ✅ (own orders) | ✅ | ✅ | ✅ | ✅ |
| Void Sales | ❌ | ❌ | ✅ | ✅ | ✅ |
| Delete Sales | ❌ | ❌ | ❌ | ✅ | ✅ |
| Configure Sales | ❌ | ❌ | ❌ | ✅ | ✅ |
| Export Sales Data | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Inventory** |
| View Inventory | ❌ | ✅ | ✅ | ✅ | ✅ |
| Update Stock | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create Materials | ❌ | ❌ | ✅ | ✅ | ✅ |
| Delete Materials | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Staff Management** |
| View Staff | ❌ | ❌ | ✅ | ✅ | ✅ |
| Update Staff | ❌ | ❌ | ✅ | ✅ | ✅ |
| Hire Staff | ❌ | ❌ | ❌ | ✅ | ✅ |
| Terminate Staff | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Scheduling** |
| View Own Schedule | ❌ | ✅ | ✅ | ✅ | ✅ |
| View All Schedules | ❌ | ❌ | ✅ | ✅ | ✅ |
| Create Schedules | ❌ | ❌ | ✅ | ✅ | ✅ |
| Approve Schedules | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Finance** |
| View Financial Data | ❌ | ❌ | ✅ (read) | ✅ (full) | ✅ (full) |
| Manage Billing | ❌ | ❌ | ❌ | ✅ | ✅ |
| Configure Payments | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Customers** |
| Register Customers | ❌ | ✅ | ✅ | ✅ | ✅ |
| Update Customers | ✅ (own) | ✅ | ✅ | ✅ | ✅ |
| Delete Customers | ❌ | ❌ | ❌ | ✅ | ✅ |
| Export Customer Data | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Analytics** |
| View Dashboard | ❌ | ✅ | ✅ | ✅ | ✅ |
| View Reports | ❌ | ❌ | ✅ | ✅ | ✅ |
| Export Reports | ❌ | ❌ | ❌ | ✅ | ✅ |
| Configure Reports | ❌ | ❌ | ❌ | ✅ | ✅ |
| **System** |
| Update Own Profile | ✅ | ❌ | ❌ | ✅ | ✅ |
| Configure Settings | ❌ | ❌ | ❌ | ✅ | ✅ |
| Access Debug Tools | ❌ | ❌ | ❌ | ❌ | ✅ |

### When to Use Each Role

**CLIENTE**:
- External customers
- Self-service portal users
- No business operations access needed
- Online ordering only

**OPERADOR**:
- Front-line staff (cashiers, waiters)
- Limited to daily operational tasks
- Cannot void or delete transactions
- Cannot access financial data

**SUPERVISOR**:
- Shift managers and team leads
- Can void sales and approve schedules
- Operational oversight for one location
- Cannot configure system or export data

**ADMINISTRADOR**:
- Business owners and general managers
- Full business management access
- Can configure system and export data
- Cannot access debug tools

**SUPER_ADMIN**:
- IT administrators and developers
- System-level debugging and maintenance
- Should NOT be used for business operations
- Infrastructure management only

### Upgrade/Downgrade Paths

**Promotion Path** (Typical career progression):
```
CLIENTE → (N/A - external users)
OPERADOR → SUPERVISOR → ADMINISTRADOR
```

**Demotion Path** (Accountability or role change):
```
SUPER_ADMIN → ADMINISTRADOR → SUPERVISOR → OPERADOR
```

**Role Assignment Changes**:
```typescript
// Update user role (admin operation)
const updateUserRole = async (userId: string, newRole: UserRole) => {
  // Requires ADMINISTRADOR or SUPER_ADMIN
  requirePermission(currentUser, 'staff', 'update');

  // Update database
  await supabase
    .from('users_roles')
    .update({
      role: newRole,
      updated_at: new Date().toISOString(),
      updated_by: currentUser.id
    })
    .eq('user_id', userId);

  // User must re-login to get new JWT claims
  // Or force token refresh
};
```

---

## Code Examples

### Checking Current User Role

```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, isRole } = useAuth();

  // Check single role
  if (isRole('ADMINISTRADOR')) {
    return <AdminPanel />;
  }

  // Check multiple roles (OR logic)
  if (isRole(['ADMINISTRADOR', 'SUPER_ADMIN'])) {
    return <ManagementTools />;
  }

  // Check role hierarchy
  const isManagerOrHigher = isRole(['SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN']);

  return <DefaultView />;
};
```

### Using RoleGuard Component

```typescript
import { RoleGuard } from '@/components/auth/RoleGuard';

const ProtectedContent = () => {
  return (
    <>
      {/* Only ADMINISTRADOR and SUPER_ADMIN can see */}
      <RoleGuard requiredRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
        <FinancialReports />
      </RoleGuard>

      {/* Only SUPERVISOR and above */}
      <RoleGuard requiredRoles={['SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN']}>
        <VoidSaleButton />
      </RoleGuard>

      {/* Custom fallback */}
      <RoleGuard
        requiredRoles={['SUPER_ADMIN']}
        fallback={<AccessDeniedMessage />}
      >
        <DebugTools />
      </RoleGuard>
    </>
  );
};
```

### Using useRoleGuard Hook

```typescript
import { useRoleGuard } from '@/components/auth/RoleGuard';

const ConditionalFeatures = () => {
  const canAccessAdmin = useRoleGuard(['ADMINISTRADOR', 'SUPER_ADMIN']);
  const canVoidSales = useRoleGuard(['SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN']);
  const canDebug = useRoleGuard(['SUPER_ADMIN']);

  return (
    <>
      {canAccessAdmin && <AdminLink />}
      {canVoidSales && <VoidButton />}
      {canDebug && <DebugPanel />}
    </>
  );
};
```

### Service Layer Role Validation

```typescript
import { requirePermission } from '@/lib/permissions/servicePermissions';
import type { AuthUser } from '@/contexts/AuthContext';

// Create operation - requires specific role
export const createSupplier = async (data: Supplier, user: AuthUser) => {
  // Only ADMINISTRADOR and SUPER_ADMIN can create suppliers
  requirePermission(user, 'suppliers', 'create');

  return supabase.from('suppliers').insert(data);
};

// Void operation - SUPERVISOR and above
export const voidSale = async (saleId: string, user: AuthUser) => {
  // OPERADOR cannot void, SUPERVISOR and above can
  requirePermission(user, 'sales', 'void');

  return supabase
    .from('sales')
    .update({
      status: 'VOIDED',
      voided_by: user.id
    })
    .eq('id', saleId);
};

// Debug operation - SUPER_ADMIN only
export const clearSystemCache = async (user: AuthUser) => {
  // Only SUPER_ADMIN has debug access
  requirePermission(user, 'debug', 'configure');

  return supabase.rpc('clear_cache');
};
```

### Role-Based Default Routes

```typescript
import { getDefaultRoute } from '@/lib/routing/roleRedirects';

const LoginRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) {
      const route = getDefaultRoute(user.role);
      navigate(route);
    }
  }, [user]);

  // Default routes by role:
  // CLIENTE → /app/portal
  // OPERADOR → /admin/operations/sales
  // SUPERVISOR → /admin/dashboard
  // ADMINISTRADOR → /admin/dashboard
  // SUPER_ADMIN → /admin/dashboard
};
```

### Combining Roles with Module Permissions

```typescript
const AdvancedPermissionCheck = () => {
  const { user, isRole, canPerformAction } = useAuth();

  // Role check + permission check
  const canManageStaff =
    isRole(['ADMINISTRADOR', 'SUPER_ADMIN']) &&
    canPerformAction('staff', 'delete');

  // Role hierarchy + specific action
  const canApproveSchedules =
    isRole(['SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN']) &&
    canPerformAction('scheduling', 'approve');

  return (
    <>
      {canManageStaff && <TerminateEmployeeButton />}
      {canApproveSchedules && <ApproveScheduleButton />}
    </>
  );
};
```

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Authentication and authorization flow
- [MODULES.md](./MODULES.md) - Complete module reference
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Practical development patterns
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API documentation
- [SECURITY.md](./SECURITY.md) - Security best practices
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions

---

**Version**: 1.0.0
**Last Updated**: December 21, 2025
**Maintainer**: Development Team
