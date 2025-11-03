# 🏢 MULTI-LOCATION ARCHITECTURE ANALYSIS

**Date**: 2025-01-15
**Status**: ANALYSIS COMPLETE - Ready for Implementation
**Approach**: **DISTRIBUTED FEATURES** (NO módulo monolítico)

---

## 📋 EXECUTIVE SUMMARY

Multi-Location es una **infrastructure capability** que activa 5 features distribuidas en módulos existentes. **NO es un módulo**, es un modo de operación que adapta módulos existentes para trabajar con múltiples ubicaciones.

### Principio Fundamental
> **1 Capability ≠ 1 Module**
> Multi-location modifica el comportamiento de módulos existentes, NO crea un módulo nuevo.

---

## 🎯 SCOPE DEFINITION

### Current State (Single Location)
```typescript
// src/config/BusinessModelRegistry.ts:310
'single_location': {
  conflicts: ['multi_location', 'mobile_business']
}
```

### Target State (Multi Location)
```typescript
// src/config/BusinessModelRegistry.ts:319-334
'multi_location': {
  id: 'multi_location',
  name: 'Múltiples Locales',
  description: 'Cadena/franquicia con varias ubicaciones',

  activatesFeatures: [
    'multisite_location_management',      // 1. Gestión de Ubicaciones
    'multisite_centralized_inventory',    // 2. Inventario Centralizado
    'multisite_transfer_orders',          // 3. Órdenes de Transferencia
    'multisite_comparative_analytics',    // 4. Analytics Comparativo
    'multisite_configuration_per_site'    // 5. Configuración por Local
  ]
}
```

---

## 🗂️ FEATURE-TO-MODULE MAPPING

### Feature 1: `multisite_location_management`
**Description**: Administrar múltiples locales (crear, editar, activar/desactivar)

**Module**: **Settings** (`/admin/core/settings`)

**Implementation**:
- ✅ **UI Already Exists**: `src/pages/admin/core/settings/pages/enterprise/page.tsx` (270 lines)
  - Location grid with metrics (revenue, orders, staff)
  - Add Location button
  - Location status badges (active, opening, closed)
- ❌ **Backend Missing**: Mock data hardcoded (línea 20-57)

**Required Changes**:
- [ ] Create `locations` table in Supabase
- [ ] Create LocationsAPI service
- [ ] Replace mock data with real API calls
- [ ] Add Location CRUD forms (create, edit, deactivate)

**Files to Modify**:
```
src/pages/admin/core/settings/pages/enterprise/
├── page.tsx                           # 🔄 Replace mock with API
├── components/
│   ├── LocationFormModal.tsx         # 🆕 NEW - Create/Edit location
│   ├── LocationCard.tsx              # 🆕 NEW - Extract from page.tsx
│   └── LocationMetrics.tsx           # 🆕 NEW - Real-time metrics
└── services/
    └── locationsApi.ts               # 🆕 NEW - CRUD operations
```

---

### Feature 2: `multisite_centralized_inventory`
**Description**: Ver inventario consolidado de todas las ubicaciones

**Modules**: **Materials** (`/admin/supply-chain/materials`) + **Products** (`/admin/supply-chain/products`)

**Implementation Strategy**:

#### A) Materials Module Adaptation
**Current View**: Single-location inventory (materials grid)

**Multi-Location View Options**:
1. **Location Filter** (Recommended):
   ```tsx
   <MaterialsToolbar>
     <LocationSelector
       selectedLocation={selectedLocation}
       onChange={setSelectedLocation}
       showAllOption={true} // "All Locations" aggregate view
     />
   </MaterialsToolbar>
   ```

2. **Aggregated Grid** (Alternative):
   - Grid shows materials with stock per location
   - Columns: Material | Total Stock | Location A | Location B | Location C
   - Expandable rows showing location breakdown

**Required Changes**:
- [ ] Add `location_id` column to `inventory` table
- [ ] Add LocationContext to filter queries
- [ ] Modify MaterialsGrid to show location column
- [ ] Add aggregate views (Total Stock across locations)
- [ ] Update StockAlerts to be location-aware

**Files to Modify**:
```
src/pages/admin/supply-chain/materials/
├── page.tsx                                  # 🔄 Add LocationSelector
├── components/
│   ├── MaterialsToolbar/MaterialsToolbar.tsx # 🔄 Add location filter
│   ├── MaterialsTable/MaterialsTable.tsx     # 🔄 Show location column
│   └── FilterDrawer/FilterDrawer.tsx         # 🔄 Add location filter option
├── services/
│   └── inventoryApi.ts                       # 🔄 Add location_id param
└── hooks/
    └── useMaterials.ts                       # 🔄 Filter by location
```

#### B) Products Module Adaptation
**Similar approach**: Location filter + aggregate views

---

### Feature 3: `multisite_transfer_orders`
**Description**: Transferencias de inventario entre locales

**Module**: **Materials** (`/admin/supply-chain/materials`)

**Implementation**: New Tab "Transfers" en MaterialsManagement

**UI Pattern**:
```tsx
<MaterialsManagement>
  <Tabs>
    <Tab>Inventory</Tab>           {/* Existing */}
    <Tab>Analytics</Tab>            {/* Existing */}
    <Tab>Transfers</Tab>            {/* 🆕 NEW */}
  </Tabs>
</MaterialsManagement>
```

**Transfer Flow**:
1. Select source location
2. Select destination location
3. Select materials + quantities
4. Add notes/reason
5. Generate transfer order
6. Receive at destination (two-step commit)

**Required Changes**:
- [ ] Create `inventory_transfers` table
- [ ] Create TransfersTab component
- [ ] Create TransferFormModal
- [ ] Create ReceiveTransferModal
- [ ] Add EventBus events: `inventory.transfer.created`, `inventory.transfer.received`

**Files to Create**:
```
src/pages/admin/supply-chain/materials/
├── components/
│   └── TransfersManagement/
│       ├── TransfersTab.tsx                 # 🆕 NEW - Main tab
│       ├── TransferFormModal.tsx            # 🆕 NEW - Create transfer
│       ├── ReceiveTransferModal.tsx         # 🆕 NEW - Receive transfer
│       ├── TransfersTable.tsx               # 🆕 NEW - List transfers
│       └── TransferStatus.tsx               # 🆕 NEW - Status badges
└── services/
    └── transfersApi.ts                       # 🆕 NEW - Transfer operations
```

---

### Feature 4: `multisite_comparative_analytics`
**Description**: Comparar performance entre locales

**Modules**: **Dashboard** (`/admin/core/dashboard`) + **Executive** (`/admin/executive/dashboards`)

**Implementation**: Location comparison widgets

**Dashboard Widgets** (Multi-Location Mode):
```tsx
// When multi_location is active, show:
<LocationComparisonWidget>
  - Revenue by Location (bar chart)
  - Top Location (current month)
  - Performance Trends (line chart)
  - Location Rankings (table)
</LocationComparisonWidget>

<SalesWidget location={selectedLocation} /> // Existing widget, now location-aware
<InventoryWidget location={selectedLocation} />
<StaffWidget location={selectedLocation} />
```

**Required Changes**:
- [ ] Add location filter to dashboard
- [ ] Create LocationComparisonCard component
- [ ] Modify widget hooks to accept `location_id` param
- [ ] Create aggregation queries (SUM, AVG by location)

**Files to Modify**:
```
src/pages/admin/core/dashboard/
├── page.tsx                                 # 🔄 Add location filter
├── components/
│   ├── widgets/
│   │   ├── LocationComparisonWidget.tsx    # 🆕 NEW
│   │   ├── RevenueWidget.tsx               # 🔄 Add location param
│   │   ├── InventoryAlertsWidget.tsx       # 🔄 Filter by location
│   │   └── StaffPerformanceWidget.tsx      # 🔄 Filter by location
│   └── LocationSelector.tsx                # 🆕 NEW - Global selector
└── hooks/
    └── useDashboardData.ts                  # 🔄 Add location context
```

---

### Feature 5: `multisite_configuration_per_site`
**Description**: Configuración específica por local (horarios, menú, precios)

**Modules**: **Multiple** (distributed config)

**Implementation**: Config overrides per location

**Examples**:
```typescript
// Settings > Products > Pricing
interface Product {
  base_price: number;
  location_overrides?: {
    [location_id: string]: {
      price?: number;
      available?: boolean;
      name_override?: string;
    }
  }
}

// Settings > Operations > Hours
interface Location {
  operating_hours: {
    monday: { open: '09:00', close: '22:00' },
    // ...
  }
}
```

**Required Changes**:
- [ ] Add `location_overrides` JSONB column to configurable tables
- [ ] UI to manage overrides per location
- [ ] Runtime resolution: `getConfigForLocation(location_id)`

---

## 🗄️ DATABASE SCHEMA DESIGN

### New Tables

#### 1. `locations`
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES business_profiles(id),

  -- Location Info
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,         -- 'MAIN', 'NORTE', 'SUR'
  type VARCHAR(50) DEFAULT 'branch',        -- 'headquarters', 'branch', 'warehouse'

  -- Address
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Argentina',

  -- Geocoded Coords (for maps)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Operational Status
  status VARCHAR(50) DEFAULT 'active',      -- 'active', 'opening', 'maintenance', 'closed'
  opening_date DATE,
  closing_date DATE,

  -- Contact
  phone VARCHAR(50),
  email VARCHAR(100),
  manager_id UUID REFERENCES employees(id),

  -- Configuration
  operating_hours JSONB,                    -- { monday: { open, close }, ... }
  timezone VARCHAR(50) DEFAULT 'America/Argentina/Buenos_Aires',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_locations_org ON locations(organization_id);
CREATE INDEX idx_locations_status ON locations(status);
CREATE INDEX idx_locations_code ON locations(code);
```

#### 2. `inventory_transfers`
```sql
CREATE TABLE inventory_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Transfer Info
  transfer_number VARCHAR(50) UNIQUE NOT NULL,
  source_location_id UUID NOT NULL REFERENCES locations(id),
  destination_location_id UUID NOT NULL REFERENCES locations(id),

  -- Status Flow: draft → submitted → in_transit → received → completed
  status VARCHAR(50) DEFAULT 'draft',

  -- Items (denormalized for performance)
  items JSONB NOT NULL,                     -- [{ material_id, quantity, unit_cost }]

  -- Totals
  total_items INTEGER,
  total_cost DECIMAL(12, 2),

  -- Notes
  notes TEXT,
  reason VARCHAR(200),                      -- 'restock', 'redistribution', 'emergency'

  -- Tracking
  submitted_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- People
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  received_by UUID REFERENCES auth.users(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transfers_source ON inventory_transfers(source_location_id);
CREATE INDEX idx_transfers_destination ON inventory_transfers(destination_location_id);
CREATE INDEX idx_transfers_status ON inventory_transfers(status);
CREATE INDEX idx_transfers_dates ON inventory_transfers(submitted_at, received_at);
```

### Modified Tables

#### Add `location_id` to Existing Tables
```sql
-- Inventory
ALTER TABLE inventory ADD COLUMN location_id UUID REFERENCES locations(id);
CREATE INDEX idx_inventory_location ON inventory(location_id);

-- Sales
ALTER TABLE sales ADD COLUMN location_id UUID REFERENCES locations(id);
CREATE INDEX idx_sales_location ON sales(location_id);

-- Employees
ALTER TABLE employees ADD COLUMN primary_location_id UUID REFERENCES locations(id);
CREATE INDEX idx_employees_location ON employees(primary_location_id);

-- Production
ALTER TABLE production_orders ADD COLUMN location_id UUID REFERENCES locations(id);
CREATE INDEX idx_production_location ON production_orders(location_id);

-- Tables (Floor Management)
ALTER TABLE tables ADD COLUMN location_id UUID REFERENCES locations(id);
CREATE INDEX idx_tables_location ON tables(location_id);
```

---

## 🔄 LOCATION CONTEXT PATTERN

### Architecture: React Context + Zustand Store

#### 1. LocationContext (React)
```typescript
// src/contexts/LocationContext.tsx

interface LocationContextValue {
  locations: Location[];
  selectedLocation: Location | null;
  selectLocation: (locationId: string) => void;
  selectAllLocations: () => void;
  isMultiLocationMode: boolean;
  isLoading: boolean;
}

export const LocationProvider = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Load locations on mount
  useEffect(() => {
    loadLocations();
  }, []);

  const selectLocation = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    setSelectedLocation(location || null);

    // Persist to localStorage
    localStorage.setItem('selected_location_id', locationId);

    // Emit event for other components
    eventBus.emit('location.changed', { locationId, location });
  };

  return (
    <LocationContext.Provider value={{ ... }}>
      {children}
    </LocationContext.Provider>
  );
};

// Hook
export const useLocation = () => useContext(LocationContext);
```

#### 2. Location Selector Component
```typescript
// src/shared/ui/LocationSelector.tsx

export const LocationSelector = () => {
  const { locations, selectedLocation, selectLocation, selectAllLocations } = useLocation();

  return (
    <Select
      value={selectedLocation?.id || 'all'}
      onChange={(e) => {
        if (e.target.value === 'all') {
          selectAllLocations();
        } else {
          selectLocation(e.target.value);
        }
      }}
    >
      <option value="all">📊 All Locations</option>
      {locations.map(location => (
        <option key={location.id} value={location.id}>
          {location.code} - {location.name}
        </option>
      ))}
    </Select>
  );
};
```

#### 3. Query Hook Pattern
```typescript
// src/hooks/useLocationAwareQuery.ts

export function useLocationAwareQuery<T>(
  queryFn: (locationId: string | null) => Promise<T>
) {
  const { selectedLocation } = useLocation();

  return useQuery({
    queryKey: ['data', selectedLocation?.id],
    queryFn: () => queryFn(selectedLocation?.id || null),
    enabled: !!selectedLocation || selectedLocation === null // null = all locations
  });
}

// Usage in modules:
const { data: materials } = useLocationAwareQuery(
  (locationId) => fetchMaterials({ location_id: locationId })
);
```

---

## 📊 MODULE IMPACT ANALYSIS

### High Impact (Core Features)
| Module | Feature | Changes Required | Priority |
|--------|---------|------------------|----------|
| **Materials** | Centralized Inventory | Add location filter, transfer orders tab | 🔴 HIGH |
| **Dashboard** | Comparative Analytics | Location selector, comparison widgets | 🔴 HIGH |
| **Settings > Enterprise** | Location Management | Replace mock with real CRUD | 🔴 HIGH |

### Medium Impact (Location Awareness)
| Module | Feature | Changes Required | Priority |
|--------|---------|------------------|----------|
| **Sales** | Sales by Location | Add location_id to sales table, filter | 🟠 MEDIUM |
| **Products** | Inventory by Location | Location filter in product availability | 🟠 MEDIUM |
| **Staff** | Staff by Location | Primary location assignment | 🟠 MEDIUM |
| **Scheduling** | Shifts by Location | Location-aware shift planning | 🟠 MEDIUM |

### Low Impact (Config Overrides)
| Module | Feature | Changes Required | Priority |
|--------|---------|------------------|----------|
| **Floor** | Tables by Location | Location_id in tables table | 🟡 LOW |
| **Kitchen** | Production by Location | Location-aware kitchen orders | 🟡 LOW |
| **Suppliers** | Supplier by Location | Preferred suppliers per location | 🟡 LOW |

---

## 🎨 UI/UX PATTERNS

### Pattern 1: Global Location Selector (Navbar)
```tsx
<Navbar>
  <Logo />
  <LocationSelector /> {/* Only visible when multi_location active */}
  <UserMenu />
</Navbar>
```

### Pattern 2: Module-Level Filter
```tsx
<MaterialsPage>
  <MaterialsToolbar>
    <SearchBar />
    <LocationFilter />  {/* Inherits from LocationContext */}
    <StatusFilter />
  </MaterialsToolbar>
</MaterialsPage>
```

### Pattern 3: Aggregated View Toggle
```tsx
<DashboardWidget>
  <WidgetHeader>
    <Title>Revenue</Title>
    <ViewToggle>
      <Option value="current">Current Location</Option>
      <Option value="all">All Locations</Option>
      <Option value="comparison">Compare</Option>
    </ViewToggle>
  </WidgetHeader>
</DashboardWidget>
```

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1)
- [ ] Create `locations` table
- [ ] Create LocationsAPI service
- [ ] Implement LocationContext + Provider
- [ ] Add LocationSelector component
- [ ] Update Enterprise page (remove mock data)

### Phase 2: Core Inventory (Week 2)
- [ ] Add `location_id` to `inventory` table
- [ ] Add location filter to Materials page
- [ ] Implement aggregated inventory views
- [ ] Create `inventory_transfers` table
- [ ] Implement Transfers tab in Materials

### Phase 3: Analytics & Reporting (Week 3)
- [ ] Add location filter to Dashboard
- [ ] Implement LocationComparisonWidget
- [ ] Update all dashboard widgets with location awareness
- [ ] Add location dimension to reports

### Phase 4: Operations Modules (Week 4)
- [ ] Add `location_id` to `sales`, `employees`, `production_orders`
- [ ] Update Sales module with location filter
- [ ] Update Staff module with location assignment
- [ ] Update Scheduling module with location-aware shifts

### Phase 5: Configuration & Polish (Week 5)
- [ ] Implement location-specific config overrides
- [ ] Add location-aware pricing in Products
- [ ] Add location-aware menu in Products
- [ ] Testing & bug fixes

---

## ✅ SUCCESS CRITERIA

### Functional Requirements
- [ ] User can create and manage multiple locations
- [ ] User can switch between locations globally
- [ ] Inventory shows aggregated view of all locations
- [ ] User can create transfer orders between locations
- [ ] Dashboard compares performance across locations
- [ ] Sales, Staff, and Production are location-aware

### Technical Requirements
- [ ] Zero breaking changes to single-location mode
- [ ] All queries have location_id indexed
- [ ] LocationContext loads locations on app mount
- [ ] EventBus events for location changes
- [ ] RLS policies respect location permissions

### UX Requirements
- [ ] Location selector visible only when multi_location active
- [ ] Default to "All Locations" aggregate view
- [ ] Clear visual indicators of current location
- [ ] Transfer process is intuitive (2-step: send + receive)

---

## 🎯 KEY DECISIONS

### Decision 1: Distributed Features ✅
**Multi-location is NOT a module** - It's features distributed across existing modules.

**Rationale**: Avoids monolithic "Locations" module, follows "1 capability ≠ 1 module" principle.

### Decision 2: Global Context + Module Filters ✅
**Architecture**: LocationContext provides global state, modules filter their own queries.

**Rationale**: Separation of concerns, each module owns its data filtering logic.

### Decision 3: Opt-In Location Awareness ✅
**Pattern**: Modules check if `multi_location` is active, adapt UI accordingly.

**Rationale**: Zero impact on single-location mode, progressive enhancement.

### Decision 4: Two-Step Transfer Commit ✅
**Flow**: Source creates transfer → Destination receives transfer → Inventory updated.

**Rationale**: Prevents ghost inventory, audit trail, allows for discrepancies.

---

## 📝 NOTES

### What Changes in Views?
1. **Settings > Enterprise**: Mock data → Real CRUD
2. **Materials > Inventory Tab**: Single table → Location filter + aggregated view
3. **Materials > NEW Transfers Tab**: Transfer management UI
4. **Dashboard**: Single metrics → Location selector + comparison widgets
5. **Sales/Staff/Scheduling**: Add location filter dropdown
6. **Products**: Add location overrides for pricing/availability

### What DOESN'T Change?
- ✅ Module structure (no new modules)
- ✅ Routing (no new routes)
- ✅ Single-location mode (works exactly as before)
- ✅ Core business logic (just adds location dimension)

---

## 🔗 RELATED DOCUMENTS

- `FEATURE_TO_MODULE_MAPPING.md` - Feature inventory
- `CONTINUITY_PROMPT.md` - Architecture session context
- `SALES_ARCHITECTURE_DECISION.md` - Sales module decisions
- `DELIVERY_ARCHITECTURE_DECISION.md` - Delivery module decisions

---

**END OF MULTI-LOCATION ARCHITECTURE ANALYSIS**

**Status**: ✅ **ANALYSIS COMPLETE** - Ready for phased implementation
**Approach**: ✅ **DISTRIBUTED FEATURES** (NO monolithic module)
**Next Step**: Create Navigation Refactor Plan with ALL architectural decisions
