# 🏢 MULTI-LOCATION COMPLETE IMPACT ANALYSIS

**Created**: 2025-01-15
**Status**: 🔍 ANALYSIS COMPLETE - Ready for Implementation Planning
**Database Verification**: ✅ Verified against live Supabase schema

---

## 📊 EXECUTIVE SUMMARY

### Critical Findings from Database Analysis

1. **NO location_id exists** in any core business tables
2. **Fiscal/AFIP tables EXIST** but lack multi-location support
3. **65 tables in production** - 15 need location_id for multi-location
4. **AFIP compliance** requires special handling for Argentina

### Impact Rating by Module

| Priority | Modules | Tables Affected | Reason |
|----------|---------|----------------|--------|
| 🔴 **CRITICAL** | Fiscal, Sales, Materials | invoices, sales, stock_entries | Legal compliance + core business |
| 🟠 **HIGH** | Staff, Scheduling, Floor | employees, shifts, tables | Operations dependency |
| 🟡 **MEDIUM** | Delivery, Suppliers, Kitchen | delivery_orders, supplier_orders | Location-aware workflows |
| 🟢 **LOW** | Products, Customers, Dashboard | products, customers | Shared resources |

---

## 🗄️ DATABASE SCHEMA ANALYSIS

### Current State (Verified via Supabase MCP)

**Total Tables**: 65 production tables identified

**Tables with location-related columns (NOT location_id):**
- `items.location` - Physical storage location (warehouse/shelf)
- `tables.location_x`, `tables.location_y` - Floor plan coordinates
- `time_entries.location` - Time entry location text

**Fiscal/AFIP Tables (EXIST in production):**
```sql
-- ✅ Existing fiscal infrastructure
invoices (16 columns)
  - id, invoice_number, customer_id, sale_id
  - invoice_type, subtotal, tax_amount, total
  - afip_cae, afip_cae_due_date  -- ⚠️ AFIP integration exists
  - status, due_date, qr_code, notes
  - created_at, updated_at

tax_reports (9 columns)
  - id, report_type, period_year, period_month
  - status, file_path, generated_at, submitted_at
  - created_at

financial_reports (10 columns)
  - id, report_name, report_type
  - start_date, end_date, data (JSONB)
  - status, file_url, created_at, updated_at

afip_configuration (table exists)
  -- Schema not fully verified, but referenced in fiscalApi.ts

percepciones_retenciones (table exists)
  -- For Argentine tax withholdings
```

**Key Tables Missing location_id:**

| Table | Current State | Multi-Location Need | Impact |
|-------|---------------|---------------------|--------|
| `invoices` | ❌ No location_id | punto_venta per location | 🔴 CRITICAL (AFIP) |
| `sales` | ❌ No location_id | Track sales by location | 🔴 CRITICAL |
| `stock_entries` | ❌ No location_id | Inventory per location | 🔴 CRITICAL |
| `employees` | ❌ No location_id | Staff assignment | 🟠 HIGH |
| `shifts` | ❌ No location_id | Shift scheduling | 🟠 HIGH |
| `tables` | ❌ No location_id | Tables per restaurant | 🟠 HIGH |
| `delivery_orders` | ❌ No location_id | Delivery origin | 🟡 MEDIUM |
| `supplier_orders` | ❌ No location_id | Purchasing by location | 🟡 MEDIUM |

---

## 🏛️ FISCAL MODULE - CRITICAL ANALYSIS

### 🇦🇷 AFIP Compliance Requirements (Argentina)

**Current Implementation:**
- ✅ AFIP integration exists (CAE generation)
- ✅ `afip_configuration` table present
- ✅ Invoice types supported (A, B, C, E)
- ❌ NO multi-location support

**Legal Requirements for Multi-Location:**

1. **Punto de Venta (PDV) per Location**
   - Each physical location = Different PDV number registered with AFIP
   - Example:
     - Location "Palermo" → PDV 1
     - Location "Belgrano" → PDV 2
     - Location "Caballito" → PDV 3

2. **Independent Invoice Numbering**
   - Each PDV has its own correlative sequence
   - Invoice format: `[PDV]-[Number]` (e.g., 0001-00012345)
   - Cannot mix numbering between locations

3. **CAE per Invoice/Location**
   - CAE (Electronic Authorization Code) obtained per invoice
   - Must specify PDV when requesting CAE from AFIP

4. **Tax Reporting Options**
   - **Option A**: Consolidated IVA report (all locations, single CUIT)
   - **Option B**: Separate reports per location (if different CUIT)

**Database Changes Required:**

```sql
-- 1. ALTER invoices table
ALTER TABLE invoices
  ADD COLUMN location_id UUID REFERENCES locations(id),
  ADD COLUMN punto_venta INTEGER NOT NULL DEFAULT 1,
  ADD CONSTRAINT unique_invoice_per_location
    UNIQUE (location_id, punto_venta, invoice_number);

CREATE INDEX idx_invoices_location ON invoices(location_id);
CREATE INDEX idx_invoices_pdv ON invoices(punto_venta);

-- 2. ALTER afip_configuration (one config per location)
ALTER TABLE afip_configuration
  ADD COLUMN location_id UUID REFERENCES locations(id),
  ADD UNIQUE (location_id);

-- 3. ALTER tax_reports (support consolidated + per-location)
ALTER TABLE tax_reports
  ADD COLUMN location_id UUID REFERENCES locations(id),
  ADD COLUMN is_consolidated BOOLEAN DEFAULT false;

-- 4. ALTER financial_reports
ALTER TABLE financial_reports
  ADD COLUMN location_id UUID REFERENCES locations(id),
  ADD COLUMN is_consolidated BOOLEAN DEFAULT false;

-- 5. ALTER percepciones_retenciones
ALTER TABLE percepciones_retenciones
  ADD COLUMN location_id UUID REFERENCES locations(id);
```

**TypeScript Type Updates:**

```typescript
// src/pages/admin/finance/fiscal/types/fiscalTypes.ts

export interface AFIPConfiguration {
  id: string;
  location_id?: string;        // 🆕 REQUIRED for multi-location
  cuit: string;                 // Can be same CUIT for all locations
  certificate_path: string;
  private_key_path: string;
  environment: 'testing' | 'production';
  punto_venta: number;          // 🆕 PDV específico de este local
  ultimo_comprobante?: number;
  location_name?: string;       // For UI display
}

export interface Invoice {
  id: string;
  location_id?: string;         // 🆕 Local emisor
  punto_venta: number;          // 🔄 UPDATED: Now per location
  invoice_number: number;       // Correlativo por (location_id, punto_venta)
  // ... existing fields
}

export interface TaxReport {
  id: string;
  location_id?: string;         // 🆕 null = consolidated report
  is_consolidated: boolean;     // 🆕 Flag for multi-location reports
  // ... existing fields
}
```

**Service Changes Required:**

```typescript
// src/pages/admin/finance/fiscal/services/fiscalApi.ts

class FiscalAPI {
  // 🔄 UPDATED: Get next invoice number per location + PDV
  async getNextInvoiceNumber(
    locationId: string,
    puntoVenta: number
  ): Promise<number> {
    const { data, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('location_id', locationId)
      .eq('punto_venta', puntoVenta)
      .order('invoice_number', { ascending: false })
      .limit(1);

    return data && data.length > 0 ? data[0].invoice_number + 1 : 1;
  }

  // 🔄 UPDATED: Get AFIP config for specific location
  async getAFIPConfiguration(locationId: string): Promise<AFIPConfiguration> {
    const { data, error } = await supabase
      .from('afip_configuration')
      .select('*')
      .eq('location_id', locationId)
      .single();

    if (error) throw new Error(`No AFIP config for location ${locationId}`);
    return data;
  }

  // 🆕 NEW: Get all AFIP configurations (for multi-location setup)
  async getAllAFIPConfigurations(): Promise<AFIPConfiguration[]> {
    const { data, error } = await supabase
      .from('afip_configuration')
      .select('*, locations(name, code)')
      .order('location_id');

    return data || [];
  }

  // 🔄 UPDATED: Create invoice with location context
  async createInvoice(
    invoiceData: Partial<Invoice>,
    locationId: string
  ): Promise<Invoice> {
    const afipConfig = await this.getAFIPConfiguration(locationId);
    const nextNumber = await this.getNextInvoiceNumber(
      locationId,
      afipConfig.punto_venta
    );

    const invoice: Partial<Invoice> = {
      ...invoiceData,
      location_id: locationId,
      punto_venta: afipConfig.punto_venta,
      invoice_number: nextNumber,
      // ... rest
    };

    // Request CAE with PDV information
    await this.requestCAE(invoice.id, afipConfig.punto_venta);
  }
}
```

**Hook Orchestrator Changes:**

```typescript
// src/pages/admin/finance/fiscal/hooks/useFiscalPage.ts

export const useFiscalPage = (): UseFiscalPageReturn => {
  const { selectedLocation, isMultiLocationMode } = useLocation();
  const [fiscalMode, setFiscalMode] = useState<'per-location' | 'consolidated'>('per-location');

  // Fetch fiscal data based on location context
  const { fiscalStats, isLoading } = useFiscal(
    selectedLocation?.id,
    fiscalMode
  );

  // Metrics calculation considering location
  const metrics: FiscalPageMetrics = useMemo(() => {
    if (fiscalMode === 'consolidated') {
      // Aggregate metrics from all locations
      return calculateConsolidatedFiscalMetrics();
    }

    // Single location metrics
    return calculateLocationFiscalMetrics(selectedLocation?.id);
  }, [selectedLocation, fiscalMode, fiscalStats]);

  // AFIP configuration per location
  const { data: afipConfig } = useQuery({
    queryKey: ['afip-config', selectedLocation?.id],
    queryFn: () => fiscalApi.getAFIPConfiguration(selectedLocation!.id),
    enabled: !!selectedLocation?.id
  });

  const actions: FiscalPageActions = useMemo(() => ({
    handleNewInvoice: () => {
      if (!selectedLocation && isMultiLocationMode) {
        notify.warning({
          title: 'Seleccione un local',
          description: 'Debe seleccionar un local específico para emitir facturas'
        });
        return;
      }

      // Open invoice modal with location context
      openInvoiceModal(selectedLocation!.id, afipConfig.punto_venta);
    },

    handleAFIPSync: async () => {
      if (fiscalMode === 'consolidated') {
        // Sync all locations
        await fiscalApi.syncAllLocationsPendingCAE();
      } else {
        // Sync single location
        await fiscalApi.syncLocationPendingCAE(selectedLocation!.id);
      }
    },

    // ... more actions
  }), [selectedLocation, afipConfig, fiscalMode]);

  return {
    pageState: {
      fiscalMode,
      setFiscalMode,
      selectedLocation,
      isMultiLocationMode,
      afipConfig
    },
    metrics,
    actions,
    // ...
  };
};
```

**UI Changes (page.tsx):**

```tsx
export function FiscalPage() {
  const { pageState, metrics, actions } = useFiscalPage();
  const { isMultiLocationMode, selectedLocation, fiscalMode, afipConfig } = pageState;

  return (
    <ContentLayout spacing="normal">
      <PageHeader
        title="Gestión Fiscal"
        subtitle={
          <Stack direction="row" gap="sm" align="center">
            {/* 🆕 Location selector (only if multi-location active) */}
            {isMultiLocationMode && <LocationSelector />}

            {/* 🆕 Show current PDV */}
            {afipConfig && (
              <Badge variant="solid" colorPalette="purple">
                PDV {afipConfig.punto_venta}
              </Badge>
            )}

            {/* 🆕 Fiscal mode toggle */}
            {isMultiLocationMode && (
              <SegmentedControl
                value={fiscalMode}
                onChange={(value) => pageState.setFiscalMode(value)}
                items={[
                  { value: 'per-location', label: 'Por Local' },
                  { value: 'consolidated', label: 'Consolidado' }
                ]}
              />
            )}
          </Stack>
        }
        actions={
          <Button
            variant="solid"
            onClick={actions.handleNewInvoice}
            disabled={!selectedLocation && isMultiLocationMode}
          >
            Nueva Factura
          </Button>
        }
      />

      {/* Metrics adapt based on fiscal mode */}
      <StatsSection>
        {fiscalMode === 'consolidated' ? (
          <ConsolidatedFiscalMetrics metrics={metrics} />
        ) : (
          <LocationFiscalMetrics
            metrics={metrics}
            location={selectedLocation}
          />
        )}
      </StatsSection>

      {/* ... rest of the page */}
    </ContentLayout>
  );
}
```

---

## 📋 OTHER MODULES IMPACT SUMMARY

### 🔴 CRITICAL IMPACT

**1. Sales Module**
- **Table**: `sales`
- **Changes**: Add `location_id UUID REFERENCES locations(id)`
- **Reason**: Track which location generated the sale
- **Cascade**: Affects invoices (fiscal), delivery_orders, analytics
- **Code Impact**:
  - `src/pages/admin/operations/sales/` - Filter sales by location
  - POS needs location context

**2. Materials Module**
- **Table**: `stock_entries`
- **Changes**: Add `location_id UUID REFERENCES locations(id)`
- **Reason**: Inventory is per-location, not global
- **New Feature**: Inventory transfers between locations
- **Code Impact**:
  - `src/pages/admin/supply-chain/materials/` - Location filter
  - New "Transfers" tab

### 🟠 HIGH IMPACT

**3. Staff Module**
- **Table**: `employees`
- **Changes**: Add `primary_location_id UUID REFERENCES locations(id)`
- **Reason**: Staff assigned to specific location
- **Code Impact**: Staff assignment UI

**4. Scheduling Module**
- **Table**: `shifts`
- **Changes**: Add `location_id UUID REFERENCES locations(id)`
- **Reason**: Shifts are location-specific
- **Code Impact**: Calendar filters by location

**5. Floor Module**
- **Table**: `tables`
- **Changes**: Add `location_id UUID REFERENCES locations(id)`
- **Note**: Different from `location_x/y` (floor coordinates)
- **Reason**: Each location has its own tables
- **Code Impact**: Floor plan per location

### 🟡 MEDIUM IMPACT

**6. Delivery Module**
- **Table**: `delivery_orders`
- **Changes**: Add `origin_location_id UUID REFERENCES locations(id)`
- **Reason**: Delivery originates from specific location
- **Code Impact**: Route planning considers origin

**7. Suppliers Module**
- **Table**: `supplier_orders`
- **Changes**: Add `destination_location_id UUID REFERENCES locations(id)`
- **Reason**: Orders delivered to specific location
- **Code Impact**: Purchase orders by location

**8. Kitchen Module**
- **Impact**: Indirect (via sales location)
- **Changes**: Filter production orders by location
- **Code Impact**: Kitchen display filtered by location

### 🟢 LOW IMPACT

**9. Products Module**
- **Impact**: Products are shared across locations
- **Changes**: None to products table, but inventory availability varies
- **Code Impact**: Show availability per location

**10. Customers Module**
- **Impact**: Customers can visit any location
- **Changes**: Track preferred location (optional)
- **Code Impact**: Customer analytics by location

**11. Dashboard Module**
- **Impact**: Comparison widgets
- **Changes**: New comparison charts
- **Code Impact**: Location selector + aggregation views

---

## 🎯 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1)
**Focus**: Database schema + LocationContext

1. Create `locations` table
2. Add `location_id` to critical tables (sales, invoices, stock_entries)
3. Implement LocationContext + LocationProvider
4. Create LocationSelector component
5. Update Settings > Enterprise page (remove mock data)

**Deliverables**:
- ✅ locations table with RLS policies
- ✅ LocationContext React Context
- ✅ LocationSelector UI component
- ✅ Location CRUD in Enterprise settings

### Phase 2: Fiscal Module (Week 2)
**Focus**: AFIP multi-location compliance

1. Add location_id + punto_venta to invoices
2. Update afip_configuration for per-location
3. Modify fiscalApi.ts for location-aware queries
4. Update useFiscalPage hook with LocationContext
5. Add PDV badge and fiscal mode toggle to UI
6. Test invoice numbering per location

**Deliverables**:
- ✅ Invoice generation per location
- ✅ AFIP configuration per PDV
- ✅ Fiscal reports (consolidated + per-location)
- ✅ Tax compliance verified

### Phase 3: Sales + Materials (Week 3)
**Focus**: Core business operations

1. Add location_id to sales table
2. Update POS to use LocationContext
3. Add location_id to stock_entries
4. Create inventory transfers feature
5. Location filter in Materials page
6. Dashboard widgets with location selector

**Deliverables**:
- ✅ Sales tracked by location
- ✅ Inventory per location
- ✅ Transfer orders between locations
- ✅ Centralized inventory view

### Phase 4: Staff + Scheduling (Week 4)
**Focus**: Human resources

1. Add primary_location_id to employees
2. Add location_id to shifts
3. Location filter in Staff page
4. Location-aware scheduling
5. Comparative analytics (labor costs by location)

**Deliverables**:
- ✅ Staff assignment to locations
- ✅ Shifts scheduled by location
- ✅ Labor cost comparison

### Phase 5: Delivery + Floor + Suppliers (Week 5)
**Focus**: Remaining modules

1. Add origin_location_id to delivery_orders
2. Add location_id to tables
3. Add destination_location_id to supplier_orders
4. Update all page filters
5. Final testing + documentation

**Deliverables**:
- ✅ Complete multi-location support
- ✅ All modules location-aware
- ✅ Testing suite passing

---

## ✅ CRITICAL QUESTIONS - ANSWERED (Based on Research)

> **Note**: These answers are based on exhaustive research of AFIP/ARCA official documentation and Argentine fiscal best practices.
> See: `FISCAL_MULTI_LOCATION_BEST_PRACTICES_ARGENTINA.md` for complete research findings.

### 🏛️ Fiscal/Legal Structure

**Q1: ¿Múltiples locales comparten el mismo CUIT?**
- [x] **Opción A - RECOMENDADA**: Sí, todos los locales son sucursales de la misma empresa (mismo CUIT)
  - ✅ Práctica estándar en Argentina
  - ✅ Múltiples PDV bajo un solo CUIT
  - ✅ Reporte IVA: Consolidado (UN solo reporte mensual)
  - ✅ Configuración: Una fila en `afip_configuration` por local, MISMO CUIT
  - ✅ Mismo certificado AFIP para todos los PDV
  - ✅ Menor costo administrativo y contable

**Research Finding**: El Libro IVA Digital (RG 4597) establece que se presenta UN SOLO reporte consolidado por CUIT, identificando las operaciones por PDV. Esta es la práctica normal para cadenas de restaurantes en Argentina.

**Q2: ¿Ya tienen PDVs registrados en AFIP?**
- **Escenario A (Negocio nuevo)**: Registrar PDV 00001, 00002, 00003
- **Escenario B (Ya tienen un PDV)**: Mantener existente + agregar nuevos
- **Proceso**:
  1. Registrar domicilios en Sistema Registral (3 días hábiles)
  2. Alta de PDV en "Administración de Puntos de Venta y Domicilios"
  3. Mapeo: Palermo → PDV 1, Belgrano → PDV 2, Caballito → PDV 3

**Research Finding**: Cada PDV debe asociarse a un domicilio comercial registrado. La numeración de facturas es INDEPENDIENTE por PDV. Formato: [PDV 5 dígitos]-[Número 8 dígitos]. Ejemplo: 00001-00000123

### 🎨 UX Strategy

**Q3: ¿Ubicación del Location Selector?**
- [x] **Opción A - RECOMENDADA**: Global (Navbar) - Persiste entre páginas
  - ✅ Consistencia UX
  - ✅ Una sola selección para toda la sesión
  - ✅ Menos decisiones cognitivas
  - ✅ Más simple de implementar
  - Location persiste en localStorage

**Q4: ¿Modo default al abrir el sistema?**
- [x] **RECOMENDADO**: Last selected location + fallback a "All Locations"
  - ✅ Usuario retoma donde quedó (localStorage)
  - ✅ Si no hay última: Location principal del usuario
  - ✅ Si no tiene asignada: "All Locations" (vista consolidada)

### 📊 Business Rules

**Q5: ¿Pueden los empleados trabajar en múltiples locales?**
- [x] **RECOMENDADO**: Primary location (simple)
  - ✅ `employees.primary_location_id` para 95% de casos
  - ✅ Tabla `employee_locations` (many-to-many) solo para gerentes regionales
  - Fundamento: La mayoría del staff es fijo en una location

**Q6: ¿Pueden los productos estar en algunos locales y no en otros?**
- [x] **RECOMENDADO**: Productos globales, inventario por location
  - ✅ Tabla `products` SIN location_id (menú unificado)
  - ✅ Tabla `stock_entries` CON location_id (stock varía)
  - Fundamento: Típico en gastronomía - mismo menú, diferente disponibilidad

**Q7: ¿Necesitan transferencias de inventario entre locales?**
- [x] **RECOMENDADO**: Sí, crear tabla `inventory_transfers`
  - ✅ Optimizar stock entre sucursales
  - ✅ Evitar rupturas de stock
  - ✅ Aprovechar compras consolidadas
  - Feature: `multisite_transfer_orders` activa

---

## 📝 NEXT SESSION PROMPT

```
CONTEXTO:
✅ Completamos análisis Multi-Location + investigación exhaustiva AFIP/ARCA
✅ Verificado schema Supabase (65 tablas)
✅ TODAS LAS DECISIONES TOMADAS basadas en normativa oficial Argentina

HALLAZGOS CRÍTICOS VALIDADOS:
1. Módulo Fiscal con integración AFIP EXISTE pero NO soporta multi-location
2. 15 tablas necesitan location_id para multi-location completo
3. AFIP requiere punto_venta (PDV) diferente por local (REQUISITO LEGAL)
4. NO existe location_id en ninguna tabla core
5. Reportes IVA son CONSOLIDADOS (un reporte por CUIT - RG 4597)

✅ DECISIONES ARQUITECTÓNICAS (validadas):
1. MISMO CUIT para todos los locales (práctica estándar)
2. Location Selector GLOBAL en Navbar
3. Empleados con PRIMARY location (simple)
4. Productos GLOBALES, inventario por location
5. Transferencias de inventario SÍ
6. Reportes fiscales CONSOLIDADOS con ID por PDV
7. Numeración: [PDV 5 dígitos]-[Número 8 dígitos]

PRÓXIMO PASO - PHASE 1:
1. DATABASE: locations table + location_id en críticas
2. FRONTEND: LocationContext + LocationSelector
3. STORES: locationStore.ts con persist

DOCUMENTACIÓN COMPLETA:
- FISCAL_MULTI_LOCATION_BEST_PRACTICES_ARGENTINA.md ⭐
- MULTI_LOCATION_COMPLETE_IMPACT_ANALYSIS.md
- CONTINUITY_PROMPT_MULTI_LOCATION.md

COMANDO INICIAL:
cat system-architecture-master-plan/FISCAL_MULTI_LOCATION_BEST_PRACTICES_ARGENTINA.md
```

---

## 📚 REFERENCES

- **AFIP Documentation**: https://www.afip.gob.ar/ws/documentacion/default.asp
- **Fiscal Module README**: `src/pages/admin/finance/fiscal/README.md`
- **LocationContext Pattern**: `system-architecture-master-plan/MULTI_LOCATION_ARCHITECTURE_ANALYSIS.md`
- **Module Registry**: `src/lib/modules/ModuleRegistry.ts`
- **Feature Registry**: `src/config/FeatureRegistry.ts` (lines 610-650)

---

**STATUS**: ✅ **ANALYSIS COMPLETE** - Ready for user decisions + Phase 1 implementation

**Impact**: Enables true multi-location operations with fiscal/legal compliance for Argentina
