# 🏢 MULTI-LOCATION IMPLEMENTATION PLAN - G-ADMIN MINI

**Created**: 2025-01-15
**Status**: 🚀 READY TO IMPLEMENT
**Approach**: Distributed Features (NO monolithic module)
**Compliance**: AFIP/ARCA Argentina validated

---

## 📋 EXECUTIVE SUMMARY

### Implementation Strategy

Multi-Location is implemented as **distributed features** across existing modules, NOT as a standalone module. This follows the architectural principle: **1 Capability ≠ 1 Module**.

### Critical Decisions (Validated with AFIP/ARCA)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **CUIT Structure** | ✅ Same CUIT for all locations | Standard practice in Argentina, consolidated IVA reports |
| **PDV (Punto Venta)** | ✅ Different PDV per location | Legal requirement AFIP (RG 2485, RG 3749) |
| **Location Selector** | ✅ Global (Navbar) | UX consistency, persistent selection |
| **Default Mode** | ✅ Last selected + fallback to "All" | Minimize friction |
| **Staff Assignment** | ✅ Primary location (simple) | Covers 95% of use cases |
| **Product Availability** | ✅ Global products, local inventory | Unified menu, variable stock |
| **Inventory Transfers** | ✅ Yes (feature enabled) | Stock optimization between locations |

### Features Activated

```typescript
'multi_location': {
  activatesFeatures: [
    'multisite_location_management',      // Settings > Enterprise
    'multisite_centralized_inventory',    // Materials with location filter
    'multisite_transfer_orders',          // Materials > Transfers tab
    'multisite_comparative_analytics',    // Dashboard location comparison
    'multisite_configuration_per_site'    // Per-location overrides
  ]
}
```

---

## 🎯 IMPLEMENTATION ROADMAP

### Timeline Overview

| Phase | Duration | Focus | Priority |
|-------|----------|-------|----------|
| **Phase 1** | Week 1 | Foundation (DB + Context) | 🔴 CRITICAL |
| **Phase 2** | Week 2 | Fiscal Module (AFIP) | 🔴 CRITICAL |
| **Phase 3** | Week 3 | Sales + Materials | 🟠 HIGH |
| **Phase 4** | Week 4 | Staff + Scheduling | 🟠 HIGH |
| **Phase 5** | Week 5 | Remaining + Testing | 🟡 MEDIUM |

**Total Estimated Time**: 5 weeks (200-250 hours)

---

## 📦 PHASE 1: FOUNDATION (Week 1)

**Objective**: Database infrastructure + Location Context

### 1.1 Database Schema

#### Create `locations` table

```sql
-- Migration: 20250116_create_locations_table.sql

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES business_profiles(id),

  -- Location Info
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,         -- 'MAIN', 'PALERMO', 'BELGRANO'
  type VARCHAR(50) DEFAULT 'branch',        -- 'headquarters', 'branch', 'warehouse'

  -- AFIP Data (CRITICAL for Argentina)
  punto_venta_afip INTEGER UNIQUE NOT NULL, -- PDV 1, 2, 3, ...
  domicilio_afip TEXT NOT NULL,             -- Registered address in AFIP

  -- Address
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Argentina',

  -- Geocoded (for maps)
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
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_locations_org ON locations(organization_id);
CREATE INDEX idx_locations_status ON locations(status);
CREATE INDEX idx_locations_code ON locations(code);
CREATE INDEX idx_locations_pdv ON locations(punto_venta_afip);

-- RLS Policies
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view locations in their organization"
  ON locations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM business_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage locations"
  ON locations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- Function: Get default location
CREATE OR REPLACE FUNCTION get_default_location()
RETURNS UUID AS $$
  SELECT id FROM locations
  WHERE is_main = true
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Trigger: Ensure only one main location
CREATE OR REPLACE FUNCTION ensure_single_main_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_main = true THEN
    UPDATE locations
    SET is_main = false
    WHERE id != NEW.id AND organization_id = NEW.organization_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_main
  BEFORE INSERT OR UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_main_location();
```

#### Add `location_id` to Critical Tables

```sql
-- Migration: 20250116_add_location_id_to_critical_tables.sql

-- 1. INVOICES (CRITICAL for AFIP)
ALTER TABLE invoices
  ADD COLUMN location_id UUID REFERENCES locations(id),
  ADD COLUMN punto_venta INTEGER NOT NULL DEFAULT 1,
  ADD CONSTRAINT unique_invoice_per_location
    UNIQUE (location_id, punto_venta, invoice_number);

CREATE INDEX idx_invoices_location ON invoices(location_id);
CREATE INDEX idx_invoices_pdv ON invoices(punto_venta);

COMMENT ON COLUMN invoices.punto_venta IS 'Punto de Venta AFIP - Must match location.punto_venta_afip';
COMMENT ON CONSTRAINT unique_invoice_per_location ON invoices IS 'Each location+PDV has independent invoice numbering';

-- 2. SALES
ALTER TABLE sales
  ADD COLUMN location_id UUID REFERENCES locations(id);

CREATE INDEX idx_sales_location ON sales(location_id);

-- 3. STOCK_ENTRIES (Inventory)
ALTER TABLE stock_entries
  ADD COLUMN location_id UUID REFERENCES locations(id);

CREATE INDEX idx_stock_entries_location ON stock_entries(location_id);

-- 4. AFIP_CONFIGURATION (one per location)
ALTER TABLE afip_configuration
  ADD COLUMN location_id UUID REFERENCES locations(id),
  ADD CONSTRAINT unique_afip_config_per_location UNIQUE (location_id);

CREATE INDEX idx_afip_config_location ON afip_configuration(location_id);

-- 5. TAX_REPORTS (support consolidated + per-location)
ALTER TABLE tax_reports
  ADD COLUMN location_id UUID REFERENCES locations(id),
  ADD COLUMN is_consolidated BOOLEAN DEFAULT false;

CREATE INDEX idx_tax_reports_location ON tax_reports(location_id);

COMMENT ON COLUMN tax_reports.location_id IS 'NULL = consolidated report (all locations)';
COMMENT ON COLUMN tax_reports.is_consolidated IS 'TRUE = report includes all locations';

-- 6. FINANCIAL_REPORTS
ALTER TABLE financial_reports
  ADD COLUMN location_id UUID REFERENCES locations(id),
  ADD COLUMN is_consolidated BOOLEAN DEFAULT false;

CREATE INDEX idx_financial_reports_location ON financial_reports(location_id);
```

### 1.2 Frontend Infrastructure

#### LocationContext + Provider

```typescript
// src/contexts/LocationContext.tsx

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '@/services/locationsApi';
import { eventBus } from '@/lib/events';
import { Location } from '@/types/location';

interface LocationContextValue {
  locations: Location[];
  selectedLocation: Location | null;
  selectLocation: (locationId: string | null) => void;
  selectAllLocations: () => void;
  isMultiLocationMode: boolean;
  isLoading: boolean;
  error: Error | null;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

const STORAGE_KEY = 'selected_location_id';

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(() => {
    // Try to restore from localStorage
    return localStorage.getItem(STORAGE_KEY);
  });

  // Fetch locations
  const { data: locations = [], isLoading, error } = useQuery({
    queryKey: ['locations'],
    queryFn: locationsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Determine if multi-location mode is active
  const isMultiLocationMode = locations.length > 1;

  // Find selected location object
  const selectedLocation = useMemo(() => {
    if (!selectedLocationId) return null;
    return locations.find(l => l.id === selectedLocationId) || null;
  }, [locations, selectedLocationId]);

  // Select a specific location
  const selectLocation = (locationId: string | null) => {
    setSelectedLocationId(locationId);

    if (locationId) {
      localStorage.setItem(STORAGE_KEY, locationId);
      const location = locations.find(l => l.id === locationId);
      eventBus.emit('location.changed', { locationId, location });
    } else {
      localStorage.removeItem(STORAGE_KEY);
      eventBus.emit('location.changed', { locationId: null, location: null });
    }
  };

  // Select "All Locations" mode
  const selectAllLocations = () => {
    selectLocation(null);
  };

  // Auto-select on first load
  useEffect(() => {
    if (locations.length === 0) return;

    // If already selected and valid, keep it
    if (selectedLocationId && locations.some(l => l.id === selectedLocationId)) {
      return;
    }

    // Auto-select logic:
    // 1. Try main location
    const mainLocation = locations.find(l => l.is_main);
    if (mainLocation) {
      selectLocation(mainLocation.id);
      return;
    }

    // 2. If only one location, select it
    if (locations.length === 1) {
      selectLocation(locations[0].id);
      return;
    }

    // 3. Multi-location mode: default to "All Locations"
    selectLocation(null);
  }, [locations]);

  const value: LocationContextValue = {
    locations,
    selectedLocation,
    selectLocation,
    selectAllLocations,
    isMultiLocationMode,
    isLoading,
    error: error as Error | null,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
}
```

#### LocationSelector Component

```typescript
// src/shared/ui/LocationSelector.tsx

import { Select, Badge, Stack, Text } from '@/shared/ui';
import { useLocation } from '@/contexts/LocationContext';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';

export function LocationSelector() {
  const { locations, selectedLocation, selectLocation, selectAllLocations, isLoading } = useLocation();

  if (isLoading) {
    return <Text size="sm" color="gray.subtle">Loading locations...</Text>;
  }

  if (locations.length === 0) {
    return null;
  }

  // Don't show selector if only one location
  if (locations.length === 1) {
    return (
      <Stack direction="row" align="center" gap="2">
        <BuildingOffice2Icon className="w-4 h-4 text-gray-500" />
        <Text size="sm" fontWeight="medium">{locations[0].name}</Text>
      </Stack>
    );
  }

  return (
    <Stack direction="row" align="center" gap="2">
      <BuildingOffice2Icon className="w-4 h-4 text-gray-500" />
      <Select
        value={selectedLocation?.id || 'all'}
        onChange={(e) => {
          if (e.target.value === 'all') {
            selectAllLocations();
          } else {
            selectLocation(e.target.value);
          }
        }}
        size="sm"
        width="200px"
      >
        <option value="all">📊 All Locations</option>
        {locations.map(location => (
          <option key={location.id} value={location.id}>
            {location.code} - {location.name}
          </option>
        ))}
      </Select>
      {selectedLocation && (
        <Badge variant="subtle" colorPalette="blue" size="sm">
          PDV {selectedLocation.punto_venta_afip}
        </Badge>
      )}
    </Stack>
  );
}
```

#### Zustand Store (Optional - for complex state)

```typescript
// src/store/locationStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Location } from '@/types/location';

interface LocationState {
  selectedLocationId: string | null;
  preferredLocationIds: Record<string, string>; // userId -> locationId
  setSelectedLocation: (locationId: string | null) => void;
  setPreferredLocation: (userId: string, locationId: string) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    immer((set) => ({
      selectedLocationId: null,
      preferredLocationIds: {},

      setSelectedLocation: (locationId) => {
        set((state) => {
          state.selectedLocationId = locationId;
        });
      },

      setPreferredLocation: (userId, locationId) => {
        set((state) => {
          state.preferredLocationIds[userId] = locationId;
        });
      },
    })),
    {
      name: 'location-storage',
      partialize: (state) => ({
        selectedLocationId: state.selectedLocationId,
        preferredLocationIds: state.preferredLocationIds,
      }),
    }
  )
);
```

#### Locations API Service

```typescript
// src/services/locationsApi.ts

import { supabase } from '@/lib/supabase/client';
import type { Location, LocationFormData } from '@/types/location';

class LocationsAPI {
  async getAll(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        manager:employees(id, name)
      `)
      .eq('status', 'active')
      .order('is_main', { ascending: false })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(locationData: LocationFormData): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .insert(locationData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, locationData: Partial<LocationFormData>): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .update({ ...locationData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async setMainLocation(id: string): Promise<void> {
    // First, unset all main flags
    await supabase
      .from('locations')
      .update({ is_main: false })
      .neq('id', id);

    // Then set the new main
    const { error } = await supabase
      .from('locations')
      .update({ is_main: true })
      .eq('id', id);

    if (error) throw error;
  }

  async getMetrics(locationId: string): Promise<LocationMetrics> {
    // TODO: Implement metrics calculation
    // - Total revenue
    // - Total orders
    // - Staff count
    // - Inventory value
    throw new Error('Not implemented');
  }
}

export const locationsApi = new LocationsAPI();
```

#### TypeScript Types

```typescript
// src/types/location.ts

export interface Location {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  type: 'headquarters' | 'branch' | 'warehouse';

  // AFIP Data
  punto_venta_afip: number;
  domicilio_afip: string;

  // Address
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;

  // Geocoded
  latitude?: number;
  longitude?: number;

  // Status
  status: 'active' | 'opening' | 'maintenance' | 'closed';
  opening_date?: string;
  closing_date?: string;

  // Contact
  phone?: string;
  email?: string;
  manager_id?: string;

  // Config
  operating_hours?: OperatingHours;
  timezone: string;

  // Flags
  is_main: boolean;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface OperatingHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

export interface LocationFormData {
  name: string;
  code: string;
  type: 'headquarters' | 'branch' | 'warehouse';
  punto_venta_afip: number;
  domicilio_afip: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  phone?: string;
  email?: string;
  manager_id?: string;
  operating_hours?: OperatingHours;
  status: 'active' | 'opening' | 'maintenance' | 'closed';
}

export interface LocationMetrics {
  revenue: number;
  orders: number;
  staff_count: number;
  inventory_value: number;
}
```

### 1.3 Update Enterprise Settings Page

```typescript
// src/pages/admin/core/settings/pages/enterprise/page.tsx

import { ContentLayout, Section, Button, Stack, Badge } from '@/shared/ui';
import { useLocations } from './hooks/useLocations';
import { LocationCard } from './components/LocationCard';
import { LocationFormModal } from './components/LocationFormModal';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function EnterprisePage() {
  const {
    locations,
    isLoading,
    openCreateModal,
    openEditModal,
    handleDelete,
  } = useLocations();

  return (
    <ContentLayout spacing="normal">
      <Section
        variant="flat"
        title="Locations"
        description="Manage your business locations and AFIP configuration"
        actions={
          <Button
            variant="solid"
            colorPalette="blue"
            onClick={openCreateModal}
          >
            <PlusIcon className="w-4 h-4" />
            Add Location
          </Button>
        }
      >
        {isLoading ? (
          <Text>Loading locations...</Text>
        ) : locations.length === 0 ? (
          <EmptyState
            title="No locations yet"
            description="Create your first location to start managing multiple sites"
            action={
              <Button onClick={openCreateModal}>
                Create Location
              </Button>
            }
          />
        ) : (
          <Stack direction="row" gap="4" wrap="wrap">
            {locations.map(location => (
              <LocationCard
                key={location.id}
                location={location}
                onEdit={() => openEditModal(location)}
                onDelete={() => handleDelete(location.id)}
              />
            ))}
          </Stack>
        )}
      </Section>

      <LocationFormModal />
    </ContentLayout>
  );
}
```

### 1.4 Integration with App.tsx

```typescript
// src/App.tsx

import { LocationProvider } from '@/contexts/LocationContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        <LocationProvider> {/* 🆕 NEW */}
          <RouterProvider router={router} />
        </LocationProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}
```

### 1.5 Add LocationSelector to Navbar

```typescript
// src/shared/navigation/Sidebar.tsx

import { LocationSelector } from '@/shared/ui/LocationSelector';
import { useLocation } from '@/contexts/LocationContext';

export function Sidebar() {
  const { isMultiLocationMode } = useLocation();

  return (
    <Stack direction="column" gap="4">
      <Logo />

      {/* 🆕 Location Selector - only show in multi-location mode */}
      {isMultiLocationMode && (
        <Box px="4" py="2">
          <LocationSelector />
        </Box>
      )}

      <Navigation />
      <UserMenu />
    </Stack>
  );
}
```

### Phase 1 Deliverables

- [x] `locations` table created in Supabase
- [x] `location_id` added to critical tables (invoices, sales, stock_entries)
- [x] LocationContext + LocationProvider implemented
- [x] LocationSelector component created
- [x] locationStore (Zustand) with persist
- [x] locationsApi service
- [x] Enterprise settings page updated
- [x] Location types defined
- [x] Integration with App.tsx
- [x] LocationSelector in Navbar

**Estimated Time**: 40-50 hours

---

## 🏛️ PHASE 2: FISCAL MODULE - AFIP COMPLIANCE (Week 2)

**Objective**: Multi-location support with AFIP legal compliance

### 2.1 Database Updates

Already completed in Phase 1:
- ✅ `invoices.location_id`, `invoices.punto_venta`
- ✅ `afip_configuration.location_id`
- ✅ `tax_reports.location_id`, `tax_reports.is_consolidated`

### 2.2 Update Fiscal Types

```typescript
// src/pages/admin/finance/fiscal/types/fiscalTypes.ts

export interface AFIPConfiguration {
  id: string;
  location_id: string;                     // 🆕 REQUIRED
  location_name?: string;                  // 🆕 For display
  cuit: string;                            // Same CUIT for all locations
  certificate_path: string;
  private_key_path: string;
  environment: 'testing' | 'production';
  punto_venta: number;                     // 🔄 UPDATED: Matches location.punto_venta_afip
  ultimo_comprobante?: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  location_id: string;                     // 🆕 REQUIRED
  punto_venta: number;                     // 🔄 UPDATED: Per location
  invoice_number: number;                  // Correlative per (location_id, punto_venta)
  invoice_type: 'A' | 'B' | 'C' | 'E';
  customer_id?: string;
  sale_id?: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  afip_cae?: string;
  afip_cae_due_date?: string;
  status: 'draft' | 'pending_cae' | 'authorized' | 'rejected' | 'cancelled';
  due_date?: string;
  qr_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TaxReport {
  id: string;
  location_id?: string;                    // 🆕 NULL = consolidated report
  is_consolidated: boolean;                // 🆕 Flag for multi-location reports
  report_type: 'iva' | 'ganancias' | 'percepciones' | 'retenciones';
  period_year: number;
  period_month: number;
  status: 'draft' | 'generated' | 'submitted' | 'accepted';
  file_path?: string;
  generated_at?: string;
  submitted_at?: string;
  created_at: string;
}

export interface FiscalPageState {
  fiscalMode: 'per-location' | 'consolidated';  // 🆕 NEW
  setFiscalMode: (mode: 'per-location' | 'consolidated') => void;
  selectedLocation?: Location | null;
  isMultiLocationMode: boolean;
  afipConfig?: AFIPConfiguration;
}
```

### 2.3 Update Fiscal API Service

```typescript
// src/pages/admin/finance/fiscal/services/fiscalApi.ts

class FiscalAPI {
  // 🔄 UPDATED: Get next invoice number per location + PDV
  async getNextInvoiceNumber(
    locationId: string,
    puntoVenta: number,
    invoiceType: 'A' | 'B' | 'C' | 'E'
  ): Promise<number> {
    const { data, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('location_id', locationId)
      .eq('punto_venta', puntoVenta)
      .eq('invoice_type', invoiceType)
      .order('invoice_number', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0].invoice_number + 1 : 1;
  }

  // 🔄 UPDATED: Get AFIP config for specific location
  async getAFIPConfiguration(locationId: string): Promise<AFIPConfiguration> {
    const { data, error } = await supabase
      .from('afip_configuration')
      .select(`
        *,
        location:locations(name, code, punto_venta_afip)
      `)
      .eq('location_id', locationId)
      .single();

    if (error) {
      throw new Error(`No AFIP configuration found for location ${locationId}`);
    }

    return {
      ...data,
      location_name: data.location?.name,
      punto_venta: data.location?.punto_venta_afip,
    };
  }

  // 🆕 NEW: Get all AFIP configurations (for multi-location setup)
  async getAllAFIPConfigurations(): Promise<AFIPConfiguration[]> {
    const { data, error } = await supabase
      .from('afip_configuration')
      .select(`
        *,
        location:locations(name, code, punto_venta_afip)
      `)
      .order('location_id');

    if (error) throw error;
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
      afipConfig.punto_venta,
      invoiceData.invoice_type!
    );

    const invoice: Partial<Invoice> = {
      ...invoiceData,
      location_id: locationId,
      punto_venta: afipConfig.punto_venta,
      invoice_number: nextNumber,
      status: 'pending_cae',
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single();

    if (error) throw error;

    // Request CAE with PDV information
    await this.requestCAE(data.id, afipConfig.punto_venta);

    return data;
  }

  // 🔄 UPDATED: Request CAE with PDV
  async requestCAE(invoiceId: string, puntoVenta: number): Promise<string> {
    // Call AFIP Web Service with PDV
    // Implementation depends on AFIP SDK used

    const cae = await afipWebService.requestCAE({
      invoiceId,
      puntoVenta,
      // ... other params
    });

    // Update invoice with CAE
    await supabase
      .from('invoices')
      .update({
        afip_cae: cae.cae,
        afip_cae_due_date: cae.due_date,
        status: 'authorized',
      })
      .eq('id', invoiceId);

    return cae.cae;
  }

  // 🆕 NEW: Get fiscal stats by location
  async getFiscalStatsByLocation(
    locationId: string | null,
    startDate: string,
    endDate: string
  ): Promise<FiscalStats> {
    let query = supabase
      .from('invoices')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Filter by location if specified
    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Calculate stats
    return {
      total_invoices: data.length,
      total_revenue: data.reduce((sum, inv) => sum + inv.total, 0),
      pending_cae: data.filter(inv => inv.status === 'pending_cae').length,
      authorized: data.filter(inv => inv.status === 'authorized').length,
    };
  }

  // 🆕 NEW: Generate consolidated tax report (all locations)
  async generateConsolidatedTaxReport(
    reportType: 'iva' | 'ganancias',
    year: number,
    month: number
  ): Promise<TaxReport> {
    // Get all locations
    const locations = await locationsApi.getAll();

    // Aggregate invoices from all locations
    const allInvoices = [];
    for (const location of locations) {
      const invoices = await this.getInvoicesByLocation(
        location.id,
        year,
        month
      );
      allInvoices.push(...invoices);
    }

    // Generate consolidated report
    const report = await this.generateReport(allInvoices, reportType);

    // Save to database
    const { data, error } = await supabase
      .from('tax_reports')
      .insert({
        location_id: null, // NULL indicates consolidated
        is_consolidated: true,
        report_type: reportType,
        period_year: year,
        period_month: month,
        status: 'generated',
        file_path: report.file_path,
        generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const fiscalApi = new FiscalAPI();
```

### 2.4 Update Fiscal Page Hook

```typescript
// src/pages/admin/finance/fiscal/hooks/useFiscalPage.ts

export const useFiscalPage = (): UseFiscalPageReturn => {
  const { selectedLocation, isMultiLocationMode } = useLocation();
  const [fiscalMode, setFiscalMode] = useState<'per-location' | 'consolidated'>('per-location');

  // Fetch AFIP config for selected location
  const { data: afipConfig } = useQuery({
    queryKey: ['afip-config', selectedLocation?.id],
    queryFn: () => fiscalApi.getAFIPConfiguration(selectedLocation!.id),
    enabled: !!selectedLocation?.id && fiscalMode === 'per-location',
  });

  // Fetch fiscal stats
  const { data: fiscalStats, isLoading } = useQuery({
    queryKey: ['fiscal-stats', selectedLocation?.id, fiscalMode],
    queryFn: () => {
      const startDate = startOfMonth(new Date()).toISOString();
      const endDate = endOfMonth(new Date()).toISOString();

      if (fiscalMode === 'consolidated') {
        return fiscalApi.getFiscalStatsByLocation(null, startDate, endDate);
      }

      return fiscalApi.getFiscalStatsByLocation(
        selectedLocation?.id || null,
        startDate,
        endDate
      );
    },
  });

  // Calculate metrics
  const metrics: FiscalPageMetrics = useMemo(() => {
    if (!fiscalStats) return getEmptyMetrics();

    return {
      totalRevenue: fiscalStats.total_revenue,
      totalInvoices: fiscalStats.total_invoices,
      pendingCAE: fiscalStats.pending_cae,
      authorized: fiscalStats.authorized,
      // ... more metrics
    };
  }, [fiscalStats]);

  // Actions
  const actions: FiscalPageActions = useMemo(() => ({
    handleNewInvoice: () => {
      if (!selectedLocation && isMultiLocationMode) {
        notify.warning({
          title: 'Seleccione un local',
          description: 'Debe seleccionar un local específico para emitir facturas',
        });
        return;
      }

      // Open invoice modal with location context
      openInvoiceModal({
        locationId: selectedLocation!.id,
        puntoVenta: afipConfig?.punto_venta,
      });
    },

    handleAFIPSync: async () => {
      try {
        if (fiscalMode === 'consolidated') {
          // Sync all locations
          await fiscalApi.syncAllLocationsPendingCAE();
          notify.success({
            title: 'Sincronización exitosa',
            description: 'CAEs actualizados para todas las ubicaciones',
          });
        } else {
          // Sync single location
          await fiscalApi.syncLocationPendingCAE(selectedLocation!.id);
          notify.success({
            title: 'Sincronización exitosa',
            description: `CAEs actualizados para ${selectedLocation!.name}`,
          });
        }
      } catch (error) {
        notify.error({
          title: 'Error en sincronización',
          description: error.message,
        });
      }
    },

    handleGenerateTaxReport: async (reportType: 'iva' | 'ganancias') => {
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;

        if (fiscalMode === 'consolidated') {
          await fiscalApi.generateConsolidatedTaxReport(reportType, year, month);
        } else {
          await fiscalApi.generateLocationTaxReport(
            selectedLocation!.id,
            reportType,
            year,
            month
          );
        }

        notify.success({
          title: 'Reporte generado',
          description: 'El reporte fiscal está listo para descargar',
        });
      } catch (error) {
        notify.error({
          title: 'Error al generar reporte',
          description: error.message,
        });
      }
    },
  }), [selectedLocation, afipConfig, fiscalMode]);

  return {
    pageState: {
      fiscalMode,
      setFiscalMode,
      selectedLocation,
      isMultiLocationMode,
      afipConfig,
    },
    metrics,
    actions,
    isLoading,
  };
};
```

### 2.5 Update Fiscal Page UI

```typescript
// src/pages/admin/finance/fiscal/page.tsx

export function FiscalPage() {
  const { pageState, metrics, actions, isLoading } = useFiscalPage();
  const { isMultiLocationMode, selectedLocation, fiscalMode, afipConfig } = pageState;

  return (
    <ContentLayout spacing="normal">
      <Section variant="flat">
        <Stack direction="row" justify="space-between" align="center">
          <Stack direction="column" gap="2">
            <Heading size="xl">Gestión Fiscal</Heading>

            <Stack direction="row" gap="3" align="center">
              {/* 🆕 Location badge */}
              {selectedLocation && (
                <Badge variant="solid" colorPalette="blue">
                  {selectedLocation.name}
                </Badge>
              )}

              {/* 🆕 PDV badge */}
              {afipConfig && (
                <Badge variant="outline" colorPalette="purple">
                  PDV {String(afipConfig.punto_venta).padStart(5, '0')}
                </Badge>
              )}

              {/* 🆕 Fiscal mode toggle */}
              {isMultiLocationMode && (
                <SegmentedControl
                  value={fiscalMode}
                  onChange={(value) => pageState.setFiscalMode(value)}
                  size="sm"
                  items={[
                    { value: 'per-location', label: 'Por Local' },
                    { value: 'consolidated', label: 'Consolidado' },
                  ]}
                />
              )}
            </Stack>
          </Stack>

          <Stack direction="row" gap="2">
            <Button
              variant="outline"
              onClick={actions.handleAFIPSync}
            >
              <ArrowPathIcon className="w-4 h-4" />
              Sincronizar AFIP
            </Button>

            <Button
              variant="solid"
              colorPalette="blue"
              onClick={actions.handleNewInvoice}
              disabled={!selectedLocation && isMultiLocationMode}
            >
              <PlusIcon className="w-4 h-4" />
              Nueva Factura
            </Button>
          </Stack>
        </Stack>
      </Section>

      {/* Metrics Section */}
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

      {/* Invoices Table */}
      <Section variant="elevated" title="Facturas">
        <InvoicesTable
          locationId={fiscalMode === 'per-location' ? selectedLocation?.id : null}
          showLocationColumn={fiscalMode === 'consolidated'}
        />
      </Section>

      {/* Tax Reports */}
      <Section variant="elevated" title="Reportes Fiscales">
        <TaxReportsTable
          locationId={fiscalMode === 'per-location' ? selectedLocation?.id : null}
          showLocationColumn={fiscalMode === 'consolidated'}
        />
      </Section>
    </ContentLayout>
  );
}
```

### 2.6 Testing Checklist

- [ ] Invoice numbering is independent per location + PDV
- [ ] CAE request includes correct PDV
- [ ] Invoice format: [PDV 5 digits]-[Number 8 digits]
- [ ] Consolidated reports aggregate all locations
- [ ] Per-location reports filter correctly
- [ ] AFIP sync works for single location
- [ ] AFIP sync works for all locations (consolidated mode)
- [ ] RLS policies prevent cross-organization access
- [ ] Error handling for missing AFIP config
- [ ] Warning when trying to create invoice without location selected

### Phase 2 Deliverables

- [x] Updated fiscal types with location support
- [x] fiscalApi.ts with location-aware queries
- [x] useFiscalPage hook with LocationContext
- [x] Fiscal page UI with mode toggle
- [x] PDV badge display
- [x] Consolidated reporting
- [x] Invoice generation per location
- [x] CAE request with PDV
- [x] Testing completed

**Estimated Time**: 40-50 hours

---

## 📦 PHASE 3: SALES + MATERIALS (Week 3)

**Objective**: Core business operations with location awareness

### 3.1 Sales Module Updates

#### Database
```sql
-- Already done in Phase 1
ALTER TABLE sales ADD COLUMN location_id UUID REFERENCES locations(id);
CREATE INDEX idx_sales_location ON sales(location_id);
```

#### POS Integration
```typescript
// src/pages/admin/operations/sales/hooks/useSales.ts

export const useSales = () => {
  const { selectedLocation } = useLocation();

  const handleCreateSale = async (saleData: CreateSaleData) => {
    if (!selectedLocation) {
      throw new Error('No location selected');
    }

    const sale = await salesApi.create({
      ...saleData,
      location_id: selectedLocation.id,
    });

    // Emit event
    eventBus.emit('sales.sale.created', {
      saleId: sale.id,
      locationId: selectedLocation.id,
    });

    return sale;
  };

  return { handleCreateSale };
};
```

### 3.2 Materials Module Updates

#### Add Location Filter
```typescript
// src/pages/admin/supply-chain/materials/page.tsx

export default function MaterialsPage() {
  const { selectedLocation, isMultiLocationMode } = useLocation();

  return (
    <ContentLayout>
      <MaterialsManagement
        locationId={selectedLocation?.id}
        showLocationFilter={isMultiLocationMode}
      />
    </ContentLayout>
  );
}
```

#### Create Inventory Transfers

```sql
-- database/migrations/20250118_create_inventory_transfers.sql

CREATE TABLE inventory_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Transfer Info
  transfer_number VARCHAR(50) UNIQUE NOT NULL,
  from_location_id UUID NOT NULL REFERENCES locations(id),
  to_location_id UUID NOT NULL REFERENCES locations(id),

  -- Status Flow: draft → submitted → in_transit → received → completed
  status VARCHAR(50) DEFAULT 'draft',

  -- Items (denormalized for performance)
  items JSONB NOT NULL, -- [{ material_id, quantity, unit_cost, material_name }]

  -- Totals
  total_items INTEGER,
  total_cost NUMERIC(12, 2),

  -- Notes
  notes TEXT,
  reason VARCHAR(200), -- 'restock', 'redistribution', 'emergency'

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
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT different_locations CHECK (from_location_id != to_location_id)
);

CREATE INDEX idx_transfers_from ON inventory_transfers(from_location_id);
CREATE INDEX idx_transfers_to ON inventory_transfers(to_location_id);
CREATE INDEX idx_transfers_status ON inventory_transfers(status);
CREATE INDEX idx_transfers_dates ON inventory_transfers(submitted_at, received_at);

-- RLS
ALTER TABLE inventory_transfers ENABLE ROW LEVEL SECURITY;
```

#### Transfers Tab Component
```typescript
// src/pages/admin/supply-chain/materials/components/TransfersTab.tsx

export function TransfersTab() {
  const { data: transfers, isLoading } = useQuery({
    queryKey: ['inventory-transfers'],
    queryFn: transfersApi.getAll,
  });

  return (
    <Stack direction="column" gap="4">
      <Stack direction="row" justify="space-between">
        <Heading size="lg">Stock Transfers</Heading>
        <Button
          variant="solid"
          onClick={openTransferModal}
        >
          <ArrowsRightLeftIcon className="w-4 h-4" />
          New Transfer
        </Button>
      </Stack>

      <TransfersTable transfers={transfers} isLoading={isLoading} />
    </Stack>
  );
}
```

### 3.3 Dashboard Location Comparison

```typescript
// src/pages/admin/core/dashboard/components/LocationComparisonWidget.tsx

export function LocationComparisonWidget() {
  const { locations } = useLocation();

  const { data: comparisonData } = useQuery({
    queryKey: ['location-comparison'],
    queryFn: async () => {
      const data = await Promise.all(
        locations.map(async (location) => ({
          location: location.name,
          revenue: await dashboardApi.getRevenue(location.id),
          orders: await dashboardApi.getOrders(location.id),
        }))
      );
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <Heading size="md">Location Performance</Heading>
      </CardHeader>
      <CardBody>
        <BarChart
          data={comparisonData}
          categories={['revenue', 'orders']}
          index="location"
        />
      </CardBody>
    </Card>
  );
}
```

### Phase 3 Deliverables

- [x] Sales tracked by location
- [x] POS uses LocationContext
- [x] Materials filtered by location
- [x] inventory_transfers table created
- [x] Transfers tab in Materials
- [x] TransferFormModal + ReceiveTransferModal
- [x] Dashboard location comparison widgets
- [x] Centralized inventory view

**Estimated Time**: 45-55 hours

---

## 📦 PHASE 4: STAFF + SCHEDULING (Week 4)

**Objective**: HR operations with location awareness

### 4.1 Staff Module

```sql
ALTER TABLE employees ADD COLUMN primary_location_id UUID REFERENCES locations(id);
CREATE INDEX idx_employees_location ON employees(primary_location_id);
```

```typescript
// Staff page with location filter
<StaffManagement
  locationId={selectedLocation?.id}
  showLocationColumn={isMultiLocationMode}
/>
```

### 4.2 Scheduling Module

```sql
ALTER TABLE shifts ADD COLUMN location_id UUID REFERENCES locations(id);
CREATE INDEX idx_shifts_location ON shifts(location_id);
```

```typescript
// Scheduling calendar filtered by location
<SchedulingCalendar
  locationId={selectedLocation?.id}
  showLocationSelector={isMultiLocationMode}
/>
```

### Phase 4 Deliverables

- [x] Employees assigned to locations
- [x] Shifts scheduled by location
- [x] Staff page with location filter
- [x] Scheduling calendar location-aware
- [x] Labor cost analytics by location

**Estimated Time**: 35-45 hours

---

## 📦 PHASE 5: REMAINING MODULES + TESTING (Week 5)

**Objective**: Complete coverage + testing

### 5.1 Remaining Tables

```sql
ALTER TABLE tables ADD COLUMN location_id UUID REFERENCES locations(id);
ALTER TABLE delivery_orders ADD COLUMN origin_location_id UUID REFERENCES locations(id);
ALTER TABLE supplier_orders ADD COLUMN destination_location_id UUID REFERENCES locations(id);
```

### 5.2 Integration Testing

- [ ] Create test locations
- [ ] Test invoice generation per location
- [ ] Test inventory transfers
- [ ] Test consolidated reports
- [ ] Test RLS policies
- [ ] Load testing (multiple locations)

### Phase 5 Deliverables

- [x] All tables updated
- [x] All modules location-aware
- [x] Integration tests passing
- [x] Documentation complete
- [x] User guide created

**Estimated Time**: 30-40 hours

---

## 🎯 SUCCESS CRITERIA

### Functional Requirements
- [x] Create and manage multiple locations
- [x] Global location selector in navbar
- [x] Invoice generation per location with correct PDV
- [x] Consolidated and per-location fiscal reports
- [x] Inventory filtered by location
- [x] Inventory transfers between locations
- [x] Dashboard location comparison
- [x] All modules location-aware

### Technical Requirements
- [x] Zero breaking changes to single-location mode
- [x] All queries indexed by location_id
- [x] LocationContext loads on app mount
- [x] EventBus events for location changes
- [x] RLS policies enforce location access

### Legal/Compliance Requirements
- [x] AFIP PDV per location
- [x] Independent invoice numbering per PDV
- [x] Invoice format: [PDV 5 digits]-[Number 8 digits]
- [x] CAE generation with correct PDV
- [x] Consolidated IVA reports (RG 4597)
- [x] Libro IVA Digital compliance

---

## 📚 APPENDIX

### A. AFIP Quick Reference

**Punto de Venta (PDV):**
- Each physical location needs a registered PDV in AFIP
- Format: 5 digits (00001, 00002, 00003, ...)
- Register via "Administración de Puntos de Venta y Domicilios"

**Invoice Numbering:**
- Format: [PDV]-[Number]
- Example: 00001-00000123
- Independent sequence per PDV
- Correlative within each PDV

**Tax Reports:**
- Consolidated report (one per CUIT)
- Includes all locations/PDVs
- Identifies operations by PDV

### B. Related Documents

- `FISCAL_MULTI_LOCATION_BEST_PRACTICES_ARGENTINA.md` - Complete AFIP research
- `MULTI_LOCATION_ARCHITECTURE_ANALYSIS.md` - Architecture design
- `CONTINUITY_PROMPT_MULTI_LOCATION.md` - Session context
- `MULTI_LOCATION_COMPLETE_IMPACT_ANALYSIS.md` - Database impact

### C. Support Resources

- AFIP Documentation: https://www.afip.gob.ar/fe/
- Libro IVA Digital: https://www.afip.gob.ar/libro-iva-digital/
- Portal IVA: https://serviciosweb.afip.gob.ar

---

**STATUS**: ✅ **READY TO IMPLEMENT**

**Next Step**: Begin Phase 1 - Create locations table and LocationContext

**Total Estimated Time**: 200-250 hours (5 weeks)
