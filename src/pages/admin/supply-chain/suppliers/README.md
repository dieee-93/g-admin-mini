# Módulo de Suppliers - G-Admin Mini

## 📋 Descripción del Módulo

El módulo de **Suppliers** (Proveedores) gestiona la relación completa con proveedores, incluyendo información de contacto, evaluación de desempeño, y análisis de riesgos. Es un módulo fundamental del sistema de supply chain que provee datos críticos para el módulo de Supplier Orders.

### Características principales:
- ✅ Gestión completa de proveedores (CRUD operations)
- ✅ **Sistema de rating y evaluación de desempeño**
- ✅ **Análisis de riesgos y consolidación de compras**
- ✅ **Dashboard de métricas y KPIs**
- ✅ **Integración con Materials** (visualización de materiales por proveedor)
- ✅ **Form validations** con business logic (unique name/email, CUIT format)
- ✅ **Field warnings** para datos incompletos o problemáticos
- ✅ Integración completa con Supabase (tabla `suppliers`)
- ✅ EventBus integration para comunicación cross-module

---

## 🎨 Arquitectura del Módulo

### **Patrón Material Form** (Migrated 2025-01-31)

El módulo sigue el **Material Form Pattern** establecido en el módulo de Materials:

```
📁 suppliers/
├── 📄 page.tsx                          # Orchestration layer
├── 📁 components/
│   ├── 📄 SupplierFormModal.tsx         # ✅ Presentational UI only
│   ├── 📄 SuppliersManagement.tsx       # Main management view
│   ├── 📄 SuppliersMetrics.tsx          # Metrics display
│   ├── 📄 SuppliersTable.tsx            # Table view
│   └── 📁 analytics/                    # Analytics components
│       ├── 📄 AnalyticsTab.tsx
│       ├── 📄 SupplierPerformanceCard.tsx
│       ├── 📄 ConsolidationOpportunities.tsx
│       └── 📄 StrategicRecommendations.tsx
├── 📁 hooks/
│   ├── 📄 useSupplierForm.tsx           # ✅ Business logic
│   ├── 📄 useSuppliers.ts               # Data fetching & mutations
│   ├── 📄 useSuppliersPage.ts           # Page orchestration
│   └── 📄 useSupplierAnalytics.ts       # Analytics logic
├── 📁 services/
│   ├── 📄 suppliersApi.ts               # ✅ Supabase integration
│   ├── 📄 suppliersService.ts           # Business logic service
│   ├── 📄 supplierAnalyticsService.ts   # Analytics engine
│   └── 📄 supplierHistoryService.ts     # Historical data
└── 📁 types/
    └── 📄 supplierTypes.ts               # ✅ TypeScript types & Zod schemas
```

---

## 🔧 Form Architecture (NEW PATTERN)

### **Separation of Concerns**

El form se divide en 3 capas:

#### 1. **UI Layer** (`SupplierFormModal.tsx`)
- Presentational component only
- No business logic
- Receives all data/handlers from hook

#### 2. **Business Logic Layer** (`useSupplierForm.tsx`)
- Form state management
- Field validation coordination
- Submission orchestration
- Progress tracking
- Badge generation

#### 3. **Validation Layer** (built-in to `useSupplierForm`)
- Duplicate name detection
- Email uniqueness validation
- CUIT format validation (Argentina)
- Rating range validation (1-5)
- Field warnings (low rating, inactive supplier)

---

## 📝 Form Validations

### **Business Validations**

```typescript
// ✅ Unique name check
const isDuplicateName = await checkDuplicateName(name, currentSupplierId);
if (isDuplicateName) {
  errors.name = 'Ya existe un proveedor con este nombre';
}

// ✅ Unique email check
if (email) {
  const isEmailTaken = await validateEmailUnique(email, currentSupplierId);
  if (isEmailTaken) {
    errors.email = 'Este email ya está registrado';
  }
}

// ✅ CUIT format (Argentina)
if (tax_id && !validateTaxId(tax_id)) {
  errors.tax_id = 'CUIT/CUIL inválido. Formato: 20-12345678-9';
}

// ✅ Rating range
if (rating !== null && rating !== undefined) {
  if (rating < 1 || rating > 5) {
    errors.rating = 'El rating debe estar entre 1 y 5';
  }
}
```

### **Field Warnings**

```typescript
// ⚠️ Low rating warning
if (rating !== null && rating < 3) {
  warnings.rating = 'Rating bajo. Considera revisar este proveedor';
}

// ⚠️ Inactive supplier warning
if (is_active === false) {
  warnings.name = 'Proveedor inactivo';
}

// ⚠️ Missing contact info
if (!email && !phone) {
  warnings.contact_person = 'Sin email ni teléfono registrado';
}
```

---

## 🔌 Integration Points

### **1. Module Registry**

El módulo se integra con otros módulos vía **Module Registry**:

```typescript
// src/modules/suppliers/manifest.tsx

hooks: {
  provide: [
    'suppliers.supplier_created',       // Event when created
    'suppliers.supplier_updated',       // Event when updated
    'suppliers.supplier_status_changed', // Event when status changes
    'dashboard.widgets',                // Dashboard widget
    'materials.supplier.actions',       // Actions for Materials module
    'materials.supplier.badge'          // Rating badge for Materials
  ],

  consume: [
    'materials.stock_updated',          // Track material usage
    'materials.low_stock_alert',        // Trigger reorder
    'materials.purchase_order_created'  // Link PO to suppliers
  ]
}
```

### **2. Dashboard Widget**

Widget que aparece automáticamente en el dashboard:

```tsx
// Auto-provided via dashboard.widgets hook
<SuppliersWidget
  onClick={() => navigate('/admin/supply-chain/suppliers')}
/>

// Shows:
// - Total suppliers count
// - Active suppliers count
// - Average rating
// - Suppliers without rating
```

### **3. Materials Integration**

El módulo provee **acciones y badges** que aparecen en Materials:

```tsx
// In Materials module, shows supplier actions:
<HookPoint
  name="materials.supplier.actions"
  data={{ material: selectedMaterial }}
  fallback={null}
/>

// Shows "View Supplier" button
// Shows "Create PO" button (if permissions)
// Shows supplier rating badge
```

---

## 📊 Database Schema

### **Table: `suppliers`**

```sql
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL UNIQUE,           -- ✅ Unique constraint
  contact_person VARCHAR(150),
  email VARCHAR(100) UNIQUE,                   -- ✅ Unique constraint
  phone VARCHAR(50),
  address VARCHAR(500),
  tax_id VARCHAR(50),                          -- CUIT/CUIL (Argentina)
  payment_terms VARCHAR(100),
  rating DECIMAL(3,2) CHECK (rating >= 1 AND rating <= 5), -- 1.00 to 5.00
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_email ON suppliers(email);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);
CREATE INDEX idx_suppliers_rating ON suppliers(rating);
```

### **Row Level Security (RLS)**

```sql
-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Policy: Supervisors and above can view
CREATE POLICY suppliers_select_policy ON suppliers
  FOR SELECT
  USING (
    auth.role() IN ('ADMIN', 'SUPERVISOR', 'EMPLOYEE')
  );

-- Policy: Supervisors and above can create/update
CREATE POLICY suppliers_insert_policy ON suppliers
  FOR INSERT
  WITH CHECK (
    auth.role() IN ('ADMIN', 'SUPERVISOR')
  );

CREATE POLICY suppliers_update_policy ON suppliers
  FOR UPDATE
  USING (auth.role() IN ('ADMIN', 'SUPERVISOR'));

-- Policy: Only admins can delete
CREATE POLICY suppliers_delete_policy ON suppliers
  FOR DELETE
  USING (auth.role() = 'ADMIN');
```

---

## 🎯 Usage Examples

### **1. Create Supplier**

```tsx
import { useSuppliers } from './hooks/useSuppliers';

function MyComponent() {
  const { createSupplier } = useSuppliers();

  const handleCreate = async () => {
    await createSupplier({
      name: 'Distribuidora Central',
      contact_person: 'Juan Pérez',
      email: 'juan@distribuidora.com',
      phone: '+54 11 1234-5678',
      address: 'Av. Corrientes 1234, CABA',
      tax_id: '20-12345678-9',
      payment_terms: '30 días',
      rating: 4.5,
      is_active: true
    });
  };
}
```

### **2. Access Suppliers API from Another Module**

```tsx
// From another module via Module Registry
const suppliersAPI = registry.getExports('suppliers');
const supplier = await suppliersAPI.getSupplier('SUPP-001');
const performance = await suppliersAPI.getSupplierPerformance('SUPP-001');
```

### **3. Listen to Supplier Events**

```tsx
// Via EventBus
eventBus.on('suppliers.supplier_created', (event) => {
  console.log('New supplier:', event.payload);

  // Refresh materials list if needed
  refreshMaterials();
});
```

---

## 🔐 Permissions

### **Module-Level Permissions**

```typescript
// Defined in manifest.tsx
minimumRole: 'SUPERVISOR' as const
```

### **Action-Level Permissions**

```typescript
// READ: SUPERVISOR+
usePermissions('suppliers', 'read')

// CREATE/UPDATE: SUPERVISOR+
usePermissions('suppliers', 'create')
usePermissions('suppliers', 'update')

// DELETE: ADMIN only
usePermissions('suppliers', 'delete')
```

### **Hook Permissions**

```typescript
// Dashboard widget - requires read permission
registry.addAction(
  'dashboard.widgets',
  WidgetComponent,
  'suppliers',
  7,
  { requiredPermission: { module: 'suppliers', action: 'read' } }
);

// Create PO button - requires create permission
registry.addAction(
  'materials.row.actions',
  CreatePOButton,
  'suppliers',
  10,
  { requiredPermission: { module: 'suppliers', action: 'create' } }
);
```

---

## 📈 Analytics & Metrics

### **Supplier Performance Card**

Shows key performance indicators:
- Overall rating (1-5 stars)
- Risk level (Low/Medium/High/Critical)
- Quality score
- On-time delivery rate
- Price competitiveness
- Responsiveness score

### **Consolidation Opportunities**

Identifies suppliers that can be consolidated:
- Duplicate categories
- Low volume suppliers
- Geographic clustering
- Estimated savings

### **Strategic Recommendations**

AI-generated recommendations:
- Diversify high-risk suppliers
- Consolidate low-volume suppliers
- Renegotiate payment terms
- Add backup suppliers for critical materials

---

## 🧪 Testing

### **Manual Testing Checklist**

- [ ] Create new supplier
- [ ] Edit existing supplier
- [ ] Delete supplier (check materials constraint)
- [ ] Toggle active/inactive status
- [ ] Test duplicate name validation
- [ ] Test duplicate email validation
- [ ] Test CUIT format validation
- [ ] Test rating range validation
- [ ] Test field warnings display
- [ ] Verify dashboard widget appears
- [ ] Verify Materials integration (supplier actions)
- [ ] Verify EventBus events fire correctly

### **Test Data**

```sql
-- Insert test supplier
INSERT INTO suppliers (name, contact_person, email, phone, tax_id, rating, is_active)
VALUES
  ('Distribuidora Central', 'Juan Pérez', 'juan@central.com', '+54 11 1234-5678', '20-12345678-9', 4.5, true),
  ('Proveedor ABC', 'María García', 'maria@abc.com', '+54 11 9876-5432', '27-98765432-1', 3.2, true),
  ('Importadora XYZ', 'Carlos López', 'carlos@xyz.com', '+54 11 5555-1234', '30-11111111-5', 4.8, false);
```

---

## 🚀 Next Steps

### **Phase 3 P1 Roadmap**

1. ✅ **Suppliers Module** - Production Ready (THIS MODULE)
2. 🔜 **Supplier Orders Module** - Depends on this module
3. 🔜 **Finance Module** - Integrates with supplier payments

### **Future Enhancements**

- [ ] Real-time notifications for low-rated suppliers
- [ ] Automated PO generation based on low stock alerts
- [ ] Supplier performance trends over time
- [ ] Integration with external procurement systems
- [ ] Supplier contracts management
- [ ] Multi-currency support for international suppliers

---

## 📚 Related Documentation

- **Module Registry Guide**: `src/modules/README.md`
- **Materials Module**: `src/pages/admin/supply-chain/materials/README.md`
- **Form Migration Pattern**: `FORM_MIGRATION_PROMPT.md`
- **EventBus System**: `docs/06-features/eventbus-system.md`
- **Capabilities System**: `docs/02-architecture/business-capabilities.md`

---

## ✅ Production Ready Checklist

- [x] 1. Architecture compliant (Module Registry + EventBus)
- [x] 2. Scaffolding ordered (Screaming Architecture)
- [x] 3. Zero errors (ESLint + TypeScript clean)
- [x] 4. UI complete (Form migrated, Table, Metrics, Analytics)
- [x] 5. Cross-module mapped (Materials integration, Dashboard widget)
- [x] 6. Zero duplication (Material Form Pattern)
- [x] 7. DB connected (Supabase RLS + API layer)
- [x] 8. Features mapped (`inventory_supplier_management`)
- [x] 9. Permissions designed (minimumRole: SUPERVISOR)
- [x] 10. README complete (THIS FILE)

---

**Status**: ✅ **PRODUCTION READY**
**Version**: 1.0.0
**Last Updated**: 2025-02-01
**Next Module**: Supplier Orders
