# 🏗️ ASSETS MODULE - Production Ready

**Module**: Assets (Equipment & Facility Management)
**Phase**: Phase 3 P4 - Module 4/5
**Estimated Time**: 4-5 hours
**Priority**: P4 (Advanced - optional, can work standalone)

---

## 📋 OBJECTIVE

Make the **Assets module** production-ready following the 10-criteria checklist.

**Why this module in P4**: Physical asset management and maintenance tracking. Can work standalone but integrates with Rentals for asset rental tracking.

---

## ✅ 10 PRODUCTION-READY CRITERIA

1. ✅ **Architecture compliant**: Follows Capabilities → Features → Modules
2. ⚠️ **Scaffolding ordered**: Page exists, need services/, types/ structure
3. ⚠️ **Zero errors**: Need to verify ESLint + TypeScript
4. ⚠️ **UI complete**: Page skeleton exists, needs full CRUD
5. ❌ **Cross-module mapped**: No README exists
6. ⚠️ **Zero duplication**: Need to audit for repeated logic
7. ❌ **DB connected**: No service layer exists
8. ✅ **Features mapped**: No required features (standalone)
9. ⚠️ **Permissions designed**: minimumRole set (SUPERVISOR), need full integration
10. ❌ **README**: Needs creation

---

## 📂 MODULE FILES

### Core Files
- **Manifest**: `src/modules/assets/manifest.tsx` ✅ (97 lines)
- **Page**: `src/pages/admin/operations/assets/page.tsx` ⚠️ (skeleton exists)
- **README**: ❌ TO CREATE
- **Database Tables**: `assets`, `asset_maintenance`, `asset_depreciation` (need to verify)

### Current Structure
```
src/modules/assets/
├── manifest.tsx                              # ✅ Complete (97 lines)
└── components/
    └── AssetsWidget.tsx                      # ✅ Dashboard widget

src/pages/admin/operations/assets/
├── page.tsx                                  # ⚠️ Skeleton with tabs
├── components/
│   ├── AssetFormEnhanced.tsx                 # ⚠️ Form exists
│   ├── AssetAnalyticsEnhanced.tsx            # ⚠️ Analytics exists
│   └── AssetFormModal.tsx                    # ⚠️ Modal exists
└── hooks/
    ├── useAssetForm.tsx                      # ⚠️ Form hook exists
    └── index.ts                              # ✅ Barrel export

MISSING:
├── services/                                 # ❌ Need to create
│   ├── assetApi.ts                           # ❌ CRUD operations
│   └── index.ts                              # ❌ Barrel export
├── types/                                    # ❌ Need to create
│   ├── asset.ts                              # ❌ Type definitions
│   └── index.ts                              # ❌ Barrel export
└── README.md                                 # ❌ TO CREATE
```

---

## 🔍 MODULE DETAILS

### Current Status (From Manifest)

**Metadata**:
- ✅ ID: `assets`
- ✅ minimumRole: `SUPERVISOR` (asset management is supervisor-level)
- ✅ autoInstall: `true` (always available)
- ✅ depends: `[]` (standalone module)

**Required Features**: None (optional module)

**Optional Features**: None (no specific feature requirements)

**Hooks**:
- **PROVIDES**:
  - `assets.status_updated` - Asset status change events
  - `assets.maintenance_due` - Maintenance alert events
  - `dashboard.widgets` - Asset health dashboard widget

- **CONSUMES**:
  - `rentals.asset_rented` - Track asset rental usage (if Rentals module active)
  - `operations.asset_used` - Track operational asset usage

**Exports**:
- `getAsset(assetId)` - Retrieve asset details
- `scheduleMainten(assetId, date)` - Schedule maintenance (note: typo in manifest)

### Database Schema (TO VERIFY/CREATE)

**Tables** (need to verify in Supabase):

1. **assets** (main asset inventory)
```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL, -- equipment, vehicle, facility, tools
  asset_category TEXT, -- Sub-category
  serial_number TEXT UNIQUE,
  model TEXT,
  manufacturer TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(12,2),
  current_value DECIMAL(12,2), -- After depreciation
  location TEXT,
  assigned_to UUID REFERENCES staff(id), -- Optional staff assignment
  status TEXT NOT NULL DEFAULT 'available', -- available, in_use, maintenance, retired
  condition TEXT DEFAULT 'good', -- excellent, good, fair, poor
  warranty_expiry DATE,
  images JSONB, -- Array of image URLs
  specifications JSONB, -- Technical specs
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_assigned_to ON assets(assigned_to);
CREATE INDEX idx_assets_serial ON assets(serial_number);

-- RLS Policies
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all assets"
  ON assets FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'GERENTE'));

CREATE POLICY "Supervisors can manage assets"
  ON assets FOR ALL
  USING (auth.jwt() ->> 'role' IN ('SUPERVISOR', 'ADMINISTRADOR', 'GERENTE'));
```

2. **asset_maintenance** (maintenance history and schedule)
```sql
CREATE TABLE asset_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL, -- preventive, corrective, inspection
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  performed_by UUID REFERENCES staff(id),
  cost DECIMAL(10,2),
  description TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  next_maintenance_date DATE, -- Auto-calculated for recurring maintenance
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_asset_maintenance_asset ON asset_maintenance(asset_id);
CREATE INDEX idx_asset_maintenance_scheduled ON asset_maintenance(scheduled_date);
CREATE INDEX idx_asset_maintenance_status ON asset_maintenance(status);

-- RLS Policies
ALTER TABLE asset_maintenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all maintenance"
  ON asset_maintenance FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'GERENTE'));

CREATE POLICY "Supervisors can manage maintenance"
  ON asset_maintenance FOR ALL
  USING (auth.jwt() ->> 'role' IN ('SUPERVISOR', 'ADMINISTRADOR', 'GERENTE'));
```

3. **asset_depreciation** (depreciation tracking)
```sql
CREATE TABLE asset_depreciation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  depreciation_method TEXT NOT NULL, -- straight_line, declining_balance, units_of_production
  useful_life_years INTEGER, -- For straight-line method
  salvage_value DECIMAL(12,2),
  annual_depreciation DECIMAL(12,2),
  accumulated_depreciation DECIMAL(12,2) DEFAULT 0,
  last_calculation_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asset_id) -- One depreciation record per asset
);

-- Indexes
CREATE INDEX idx_asset_depreciation_asset ON asset_depreciation(asset_id);

-- RLS Policies
ALTER TABLE asset_depreciation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view depreciation"
  ON asset_depreciation FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'GERENTE'));

CREATE POLICY "Supervisors can manage depreciation"
  ON asset_depreciation FOR ALL
  USING (auth.jwt() ->> 'role' IN ('SUPERVISOR', 'ADMINISTRADOR', 'GERENTE'));
```

4. **asset_usage_log** (usage tracking)
```sql
CREATE TABLE asset_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  used_by UUID REFERENCES staff(id),
  usage_start TIMESTAMPTZ NOT NULL,
  usage_end TIMESTAMPTZ,
  usage_type TEXT, -- rental, operational, maintenance
  hours_used DECIMAL(8,2),
  mileage_km DECIMAL(10,2), -- For vehicles
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_asset_usage_asset ON asset_usage_log(asset_id);
CREATE INDEX idx_asset_usage_dates ON asset_usage_log(usage_start, usage_end);

-- RLS Policies
ALTER TABLE asset_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view usage logs"
  ON asset_usage_log FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'GERENTE'));

CREATE POLICY "Supervisors can manage usage logs"
  ON asset_usage_log FOR ALL
  USING (auth.jwt() ->> 'role' IN ('SUPERVISOR', 'ADMINISTRADOR', 'GERENTE'));
```

---

## 🎯 WORKFLOW (4-5 HOURS)

### 1️⃣ AUDIT (30 min)

**Tasks**:
- [ ] Read `src/modules/assets/manifest.tsx` ✅ (already done)
- [ ] Read `src/pages/admin/operations/assets/page.tsx`
- [ ] Check ESLint errors: `pnpm -s exec eslint src/modules/assets/ src/pages/admin/operations/assets/`
- [ ] Check TypeScript errors: `pnpm -s exec tsc --noEmit`
- [ ] Verify database schema (Supabase tables above)
- [ ] Check if tables exist, create if missing
- [ ] Test page tabs (dashboard, create, manage, analytics, maintenance)
- [ ] Check form components work
- [ ] Document current state

**Questions to Answer**:
- How many ESLint/TS errors?
- Do asset tables exist in Supabase?
- Are form components functional?
- Is AssetFormEnhanced using proper validation?
- Is AssetAnalyticsEnhanced showing metrics?
- Are there unused components?
- Is permission system integrated?
- Is the typo in manifest exports fixed? (`scheduleMainten` → `scheduleMaintenance`)

---

### 2️⃣ FIX STRUCTURE (1 hour)

**Tasks**:
- [ ] Create `src/pages/admin/operations/assets/services/` directory
- [ ] Create `assetApi.ts` with CRUD operations
- [ ] Create `src/pages/admin/operations/assets/types/` directory
- [ ] Create `asset.ts` with type definitions
- [ ] Fix typo in manifest exports (`scheduleMainten` → `scheduleMaintenance`)
- [ ] Fix ESLint errors in asset files
- [ ] Fix TypeScript errors in asset files
- [ ] Add full permission integration to page.tsx
- [ ] Organize imports consistently
- [ ] Remove unused code

**Service Layer** (`services/assetApi.ts`):
```typescript
import { supabase } from '@/lib/supabase/client';
import { requirePermission, requireModuleAccess } from '@/lib/permissions';
import type { AuthUser } from '@/contexts/AuthContext';
import type { Asset, AssetMaintenance, AssetDepreciation } from '../types/asset';

// ============================================
// ASSET CRUD
// ============================================

export const getAssets = async (user?: AuthUser | null) => {
  if (user) {
    requireModuleAccess(user, 'assets');
  }

  const { data, error } = await supabase
    .from('assets')
    .select(`
      *,
      assigned_staff:staff(id, name),
      maintenance:asset_maintenance(id, scheduled_date, status)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getAssetById = async (id: string, user?: AuthUser | null) => {
  if (user) {
    requireModuleAccess(user, 'assets');
  }

  const { data, error } = await supabase
    .from('assets')
    .select(`
      *,
      assigned_staff:staff(*),
      maintenance:asset_maintenance(*),
      depreciation:asset_depreciation(*),
      usage_logs:asset_usage_log(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createAsset = async (asset: Partial<Asset>, user: AuthUser) => {
  requirePermission(user, 'assets', 'create');

  const { data, error } = await supabase
    .from('assets')
    .insert({
      asset_name: asset.asset_name,
      asset_type: asset.asset_type,
      asset_category: asset.asset_category,
      serial_number: asset.serial_number,
      model: asset.model,
      manufacturer: asset.manufacturer,
      purchase_date: asset.purchase_date,
      purchase_price: asset.purchase_price,
      current_value: asset.current_value ?? asset.purchase_price,
      location: asset.location,
      status: 'available',
      condition: asset.condition ?? 'good',
      warranty_expiry: asset.warranty_expiry,
      specifications: asset.specifications,
      notes: asset.notes
    })
    .select()
    .single();

  if (error) throw error;

  // Create depreciation record if purchase price provided
  if (data && asset.purchase_price) {
    await createDepreciationRecord(data.id, {
      depreciation_method: 'straight_line',
      useful_life_years: 5, // Default
      salvage_value: asset.purchase_price * 0.1, // 10% salvage value
      annual_depreciation: (asset.purchase_price * 0.9) / 5
    }, user);
  }

  return data;
};

export const updateAsset = async (id: string, updates: Partial<Asset>, user: AuthUser) => {
  requirePermission(user, 'assets', 'update');

  const { data, error } = await supabase
    .from('assets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAsset = async (id: string, user: AuthUser) => {
  requirePermission(user, 'assets', 'delete');

  // Soft delete by setting status to 'retired'
  const { data, error } = await supabase
    .from('assets')
    .update({ status: 'retired', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// MAINTENANCE OPERATIONS
// ============================================

export const getMaintenanceSchedule = async (assetId?: string) => {
  let query = supabase
    .from('asset_maintenance')
    .select(`
      *,
      asset:assets(id, asset_name, asset_type),
      performer:staff(id, name)
    `)
    .order('scheduled_date', { ascending: true });

  if (assetId) {
    query = query.eq('asset_id', assetId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const scheduleMaintenance = async (
  maintenance: Partial<AssetMaintenance>,
  user: AuthUser
) => {
  requirePermission(user, 'assets', 'update');

  const { data, error } = await supabase
    .from('asset_maintenance')
    .insert({
      asset_id: maintenance.asset_id,
      maintenance_type: maintenance.maintenance_type,
      scheduled_date: maintenance.scheduled_date,
      description: maintenance.description,
      status: 'scheduled'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const completeMaintenance = async (
  maintenanceId: string,
  data: {
    completed_date: string;
    performed_by?: string;
    cost?: number;
    notes?: string;
    next_maintenance_date?: string;
  },
  user: AuthUser
) => {
  requirePermission(user, 'assets', 'update');

  const { data: updated, error } = await supabase
    .from('asset_maintenance')
    .update({
      status: 'completed',
      completed_date: data.completed_date,
      performed_by: data.performed_by,
      cost: data.cost,
      notes: data.notes,
      next_maintenance_date: data.next_maintenance_date,
      updated_at: new Date().toISOString()
    })
    .eq('id', maintenanceId)
    .select()
    .single();

  if (error) throw error;
  return updated;
};

export const getUpcomingMaintenance = async (daysAhead: number = 30) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const { data, error } = await supabase
    .from('asset_maintenance')
    .select(`
      *,
      asset:assets(id, asset_name, asset_type, status)
    `)
    .eq('status', 'scheduled')
    .gte('scheduled_date', new Date().toISOString().split('T')[0])
    .lte('scheduled_date', futureDate.toISOString().split('T')[0])
    .order('scheduled_date', { ascending: true });

  if (error) throw error;
  return data;
};

// ============================================
// DEPRECIATION OPERATIONS
// ============================================

export const createDepreciationRecord = async (
  assetId: string,
  depreciation: Partial<AssetDepreciation>,
  user: AuthUser
) => {
  requirePermission(user, 'assets', 'create');

  const { data, error } = await supabase
    .from('asset_depreciation')
    .insert({
      asset_id: assetId,
      depreciation_method: depreciation.depreciation_method,
      useful_life_years: depreciation.useful_life_years,
      salvage_value: depreciation.salvage_value,
      annual_depreciation: depreciation.annual_depreciation,
      accumulated_depreciation: 0,
      last_calculation_date: new Date().toISOString().split('T')[0]
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const calculateDepreciation = async (assetId: string) => {
  // Get asset and depreciation data
  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .select(`
      *,
      depreciation:asset_depreciation(*)
    `)
    .eq('id', assetId)
    .single();

  if (assetError) throw assetError;

  if (!asset.depreciation || asset.depreciation.length === 0) {
    return { message: 'No depreciation record found' };
  }

  const dep = asset.depreciation[0];
  const purchaseDate = new Date(asset.purchase_date);
  const today = new Date();
  const yearsElapsed = (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  let accumulatedDepreciation = 0;

  if (dep.depreciation_method === 'straight_line') {
    accumulatedDepreciation = Math.min(
      dep.annual_depreciation * yearsElapsed,
      asset.purchase_price - dep.salvage_value
    );
  }

  const currentValue = Math.max(
    asset.purchase_price - accumulatedDepreciation,
    dep.salvage_value
  );

  // Update asset current value and depreciation record
  await supabase
    .from('assets')
    .update({ current_value: currentValue })
    .eq('id', assetId);

  await supabase
    .from('asset_depreciation')
    .update({
      accumulated_depreciation: accumulatedDepreciation,
      last_calculation_date: new Date().toISOString().split('T')[0]
    })
    .eq('asset_id', assetId);

  return {
    assetId,
    purchasePrice: asset.purchase_price,
    accumulatedDepreciation,
    currentValue,
    yearsElapsed: parseFloat(yearsElapsed.toFixed(2))
  };
};

// ============================================
// USAGE TRACKING
// ============================================

export const logAssetUsage = async (
  usage: {
    asset_id: string;
    used_by?: string;
    usage_start: string;
    usage_end?: string;
    usage_type: string;
    hours_used?: number;
    mileage_km?: number;
    notes?: string;
  },
  user: AuthUser
) => {
  requirePermission(user, 'assets', 'update');

  const { data, error } = await supabase
    .from('asset_usage_log')
    .insert(usage)
    .select()
    .single();

  if (error) throw error;

  // Update asset status to in_use if not already
  if (!usage.usage_end) {
    await supabase
      .from('assets')
      .update({ status: 'in_use' })
      .eq('id', usage.asset_id);
  }

  return data;
};

// ============================================
// ANALYTICS
// ============================================

export const getAssetMetrics = async () => {
  const { data, error } = await supabase
    .rpc('get_asset_metrics');

  if (error) throw error;
  return data;
};
```

**Types** (`types/asset.ts`):
```typescript
export interface Asset {
  id: string;
  asset_name: string;
  asset_type: 'equipment' | 'vehicle' | 'facility' | 'tools';
  asset_category?: string;
  serial_number?: string;
  model?: string;
  manufacturer?: string;
  purchase_date?: string;
  purchase_price?: number;
  current_value?: number;
  location?: string;
  assigned_to?: string;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  warranty_expiry?: string;
  images?: string[];
  specifications?: Record<string, any>;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Relations
  assigned_staff?: {
    id: string;
    name: string;
  };
  maintenance?: AssetMaintenance[];
  depreciation?: AssetDepreciation;
  usage_logs?: AssetUsageLog[];
}

export interface AssetMaintenance {
  id: string;
  asset_id: string;
  maintenance_type: 'preventive' | 'corrective' | 'inspection';
  scheduled_date: string;
  completed_date?: string;
  performed_by?: string;
  cost?: number;
  description?: string;
  notes?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  next_maintenance_date?: string;
  created_at: string;
  updated_at: string;

  // Relations
  asset?: Asset;
  performer?: {
    id: string;
    name: string;
  };
}

export interface AssetDepreciation {
  id: string;
  asset_id: string;
  depreciation_method: 'straight_line' | 'declining_balance' | 'units_of_production';
  useful_life_years?: number;
  salvage_value?: number;
  annual_depreciation?: number;
  accumulated_depreciation: number;
  last_calculation_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetUsageLog {
  id: string;
  asset_id: string;
  used_by?: string;
  usage_start: string;
  usage_end?: string;
  usage_type?: string;
  hours_used?: number;
  mileage_km?: number;
  notes?: string;
  created_at: string;
}

export interface AssetMetrics {
  total_assets: number;
  available_assets: number;
  in_use_assets: number;
  maintenance_assets: number;
  total_value: number;
  upcoming_maintenance: number;
  avg_asset_age_years: number;
  utilization_rate: number;
}
```

**Permission Integration** (page.tsx):
```typescript
import { usePermissions } from '@/hooks/usePermissions';

const {
  canCreate,
  canRead,
  canUpdate,
  canDelete
} = usePermissions('assets');

// Conditional rendering
{canCreate && <Button>Add Asset</Button>}
{canUpdate && <Button onClick={handleMaintenance}>Schedule Maintenance</Button>}
{canUpdate && <Button onClick={handleAssign}>Assign to Staff</Button>}
{canDelete && <Button onClick={handleRetire}>Retire Asset</Button>}
```

---

### 3️⃣ DATABASE & FUNCTIONALITY (1.5 hours)

**Tasks**:
- [ ] Verify tables exist in Supabase (or create them)
- [ ] Create RLS policies for all tables
- [ ] Test CREATE asset
- [ ] Test READ assets (list + detail)
- [ ] Test UPDATE asset (status, condition, assignment)
- [ ] Test DELETE/RETIRE asset
- [ ] Test maintenance scheduling (CRUD)
- [ ] Test maintenance completion workflow
- [ ] Test depreciation calculation
- [ ] Test usage logging
- [ ] Verify EventBus integration (rentals, operations)
- [ ] Test analytics metrics

**Database Migration** (if tables don't exist):
```sql
-- Run in Supabase SQL Editor
-- Create tables as defined above in Database Schema section

-- Create SQL function for asset metrics
CREATE OR REPLACE FUNCTION get_asset_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_assets', (SELECT COUNT(*) FROM assets WHERE status != 'retired'),
    'available_assets', (SELECT COUNT(*) FROM assets WHERE status = 'available'),
    'in_use_assets', (SELECT COUNT(*) FROM assets WHERE status = 'in_use'),
    'maintenance_assets', (SELECT COUNT(*) FROM assets WHERE status = 'maintenance'),
    'total_value', (SELECT COALESCE(SUM(current_value), 0) FROM assets WHERE status != 'retired'),
    'upcoming_maintenance', (
      SELECT COUNT(*)
      FROM asset_maintenance
      WHERE status = 'scheduled'
        AND scheduled_date >= CURRENT_DATE
        AND scheduled_date <= CURRENT_DATE + INTERVAL '30 days'
    ),
    'avg_asset_age_years', (
      SELECT ROUND(AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, purchase_date))), 1)
      FROM assets
      WHERE status != 'retired' AND purchase_date IS NOT NULL
    ),
    'utilization_rate', (
      SELECT ROUND(
        (COUNT(CASE WHEN status = 'in_use' THEN 1 END)::numeric /
         NULLIF(COUNT(*), 0)) * 100,
        2
      )
      FROM assets
      WHERE status != 'retired'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Depreciation Auto-Calculation** (SQL Trigger):
```sql
-- Trigger to auto-calculate depreciation monthly
CREATE OR REPLACE FUNCTION auto_calculate_depreciation()
RETURNS void AS $$
DECLARE
  asset_record RECORD;
BEGIN
  -- Calculate depreciation for all assets with depreciation records
  FOR asset_record IN
    SELECT a.id, a.purchase_price, a.purchase_date, d.*
    FROM assets a
    JOIN asset_depreciation d ON d.asset_id = a.id
    WHERE a.status != 'retired'
      AND (d.last_calculation_date IS NULL
           OR d.last_calculation_date < CURRENT_DATE - INTERVAL '1 month')
  LOOP
    -- Straight-line depreciation
    IF asset_record.depreciation_method = 'straight_line' THEN
      DECLARE
        years_elapsed numeric;
        new_accumulated numeric;
        new_current_value numeric;
      BEGIN
        years_elapsed := EXTRACT(YEAR FROM AGE(CURRENT_DATE, asset_record.purchase_date::date));
        new_accumulated := LEAST(
          asset_record.annual_depreciation * years_elapsed,
          asset_record.purchase_price - asset_record.salvage_value
        );
        new_current_value := GREATEST(
          asset_record.purchase_price - new_accumulated,
          asset_record.salvage_value
        );

        -- Update depreciation record
        UPDATE asset_depreciation
        SET accumulated_depreciation = new_accumulated,
            last_calculation_date = CURRENT_DATE
        WHERE asset_id = asset_record.id;

        -- Update asset current value
        UPDATE assets
        SET current_value = new_current_value
        WHERE id = asset_record.id;
      END;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule to run monthly (use pg_cron extension or external scheduler)
-- SELECT cron.schedule('monthly-depreciation', '0 0 1 * *', 'SELECT auto_calculate_depreciation()');
```

**EventBus Integration** (in manifest.tsx setup):
```typescript
// Listen to rentals.asset_rented (if Rentals module active)
eventBus.subscribe('rentals.asset_rented', async (event) => {
  const { assetId, rentalId, customerId, startDate, endDate } = event.payload;

  logger.info('Assets', 'Asset rented, logging usage', { assetId, rentalId });

  // Log rental usage
  await supabase
    .from('asset_usage_log')
    .insert({
      asset_id: assetId,
      usage_start: startDate,
      usage_end: endDate,
      usage_type: 'rental',
      notes: `Rental ID: ${rentalId}, Customer: ${customerId}`
    });

  // Update asset status to in_use
  await supabase
    .from('assets')
    .update({ status: 'in_use' })
    .eq('id', assetId);

  logger.info('Assets', 'Asset usage logged', { assetId });
}, { moduleId: 'assets' });

// Emit maintenance due alerts
const checkMaintenanceDue = async () => {
  const upcoming = await getUpcomingMaintenance(7); // Next 7 days

  if (upcoming.length > 0) {
    eventBus.emit('assets.maintenance_due', {
      count: upcoming.length,
      assets: upcoming.map(m => ({
        assetId: m.asset_id,
        assetName: m.asset?.asset_name,
        maintenanceDate: m.scheduled_date
      }))
    });

    logger.info('Assets', `${upcoming.length} asset(s) have maintenance due`, {
      count: upcoming.length
    });
  }
};

// Check maintenance due on module load and every 24 hours
checkMaintenanceDue();
setInterval(checkMaintenanceDue, 24 * 60 * 60 * 1000);
```

---

### 4️⃣ CROSS-MODULE INTEGRATION (1 hour)

**Tasks**:
- [ ] Create `src/pages/admin/operations/assets/README.md`
- [ ] Document all provided hooks and events
- [ ] Document all consumed hooks
- [ ] Document database schema with RLS policies
- [ ] Document permission requirements
- [ ] Test integration with Rentals module (asset rental tracking)
- [ ] Test dashboard widget display
- [ ] Test maintenance alerts

**README Template**:
```markdown
# Assets Module

Physical asset management and maintenance tracking system.

## Production Status
- [x] 0 ESLint errors
- [x] 0 TypeScript errors
- [x] All CRUD operations working
- [x] Database connected
- [x] EventBus integration complete
- [x] Permissions integrated

## Database Tables
- `assets` (main asset inventory)
- `asset_maintenance` (maintenance history and schedule)
- `asset_depreciation` (depreciation tracking)
- `asset_usage_log` (usage tracking)

## Features
- Asset inventory management (equipment, vehicles, facilities, tools)
- Maintenance scheduling and tracking
- Depreciation calculation (straight-line, declining balance)
- Usage logging
- Staff assignment
- Condition tracking
- Asset lifecycle management (purchase → use → maintenance → retire)
- Analytics (total value, utilization, maintenance due)

## Provides
- `assets.status_updated` - Asset status change events
- `assets.maintenance_due` - Maintenance alert events (auto-check every 24h)
- `dashboard.widgets` - Asset health dashboard widget

## Consumes
- `rentals.asset_rented` - Track rental usage (optional, if Rentals active)
- `operations.asset_used` - Track operational usage (future)

## Permissions
- minimumRole: `SUPERVISOR`
- create: Add new assets
- read: View asset inventory
- update: Edit assets, schedule maintenance, assign staff
- delete: Retire assets (soft delete)

## Service Layer
\`src/pages/admin/operations/assets/services/assetApi.ts\`

All API calls include permission validation.

## Dependencies
- None (standalone module)
- Optional: Rentals (for rental usage tracking)

## Usage Example
\`\`\`typescript
import { createAsset, scheduleMaintenance, calculateDepreciation } from './services/assetApi';

// Add new asset
const asset = await createAsset({
  asset_name: 'Forklift',
  asset_type: 'equipment',
  serial_number: 'FK-2024-001',
  purchase_date: '2024-01-15',
  purchase_price: 25000,
  location: 'Warehouse A'
}, user);

// Schedule maintenance
await scheduleMaintenance({
  asset_id: asset.id,
  maintenance_type: 'preventive',
  scheduled_date: '2024-07-15',
  description: 'Quarterly inspection'
}, user);

// Calculate depreciation
const depreciation = await calculateDepreciation(asset.id);
console.log('Current value:', depreciation.currentValue);
\`\`\`

## Depreciation Methods
1. **Straight-line**: Equal depreciation each year
   - Formula: (Purchase Price - Salvage Value) / Useful Life Years
2. **Declining balance**: Higher depreciation in early years (future)
3. **Units of production**: Based on usage hours/mileage (future)

## Maintenance Types
- **Preventive**: Scheduled regular maintenance
- **Corrective**: Repair after failure
- **Inspection**: Safety/compliance checks

## Status Lifecycle
1. **Available** → Asset ready for use
2. **In Use** → Asset currently assigned/rented
3. **Maintenance** → Asset under repair/inspection
4. **Retired** → Asset no longer in service (soft deleted)

## Condition Ratings
- **Excellent**: Like new, minimal wear
- **Good**: Normal wear, fully functional
- **Fair**: Significant wear, needs attention
- **Poor**: Heavy wear, repair/replacement needed
```

---

### 5️⃣ VALIDATION (30 min)

**Production-Ready Checklist**:
- [ ] ✅ Architecture compliant
- [ ] ✅ Scaffolding ordered (services/, types/ created)
- [ ] ✅ Zero ESLint errors (fix typo in manifest)
- [ ] ✅ Zero TypeScript errors
- [ ] ✅ Cross-module mapped (README created)
- [ ] ✅ Zero duplication
- [ ] ✅ DB connected (service layer complete)
- [ ] ✅ Features mapped
- [ ] ✅ Permissions designed
- [ ] ✅ README complete

**Manual Testing Workflow**:
1. [ ] Create asset (Forklift, Equipment)
2. [ ] View asset in list
3. [ ] Schedule preventive maintenance
4. [ ] View upcoming maintenance (next 30 days)
5. [ ] Assign asset to staff member
6. [ ] Log asset usage
7. [ ] Complete maintenance
8. [ ] Calculate depreciation
9. [ ] View current value
10. [ ] Check asset analytics
11. [ ] Retire asset
12. [ ] Test with different roles (SUPERVISOR, ADMINISTRADOR)

**Final Validation**:
```bash
# Lint
pnpm -s exec eslint src/modules/assets/
pnpm -s exec eslint src/pages/admin/operations/assets/

# Type check
pnpm -s exec tsc --noEmit

# Database
# Verify tables in Supabase Dashboard:
# - assets (with RLS)
# - asset_maintenance (with RLS)
# - asset_depreciation (with RLS)
# - asset_usage_log (with RLS)
```

Expected output: **0 errors**

---

## 🚨 CRITICAL PATTERNS

### ✅ DO
- Import from `@/shared/ui` (Stack, Button, Text, etc.)
- Use `usePermissions('assets')` for UI access control
- Use `requirePermission()` in service layer
- Document all database tables in README
- Soft delete assets (status='retired') instead of hard delete
- Auto-calculate depreciation monthly
- Track all asset usage (rental, operational, maintenance)
- Schedule preventive maintenance proactively
- Validate serial numbers are unique
- Store asset images for documentation

### ❌ DON'T
- Import directly from `@chakra-ui/react`
- Hardcode asset data (use Supabase)
- Skip permission checks in service layer
- Hard delete assets (lose history)
- Skip depreciation calculation
- Allow negative current values (minimum = salvage value)
- Forget to update asset status when usage changes
- Skip maintenance scheduling for critical equipment
- Delete assets with active maintenance records

---

## 📚 REFERENCE IMPLEMENTATIONS

**Study These**:
- `src/pages/admin/supply-chain/materials/` - CRUD pattern, service layer
- `src/modules/rentals/` - Related asset management pattern
- `src/hooks/usePermissions.ts` - Permission hook usage

---

## 📊 SUCCESS CRITERIA

### Module Complete When:
- [ ] 0 ESLint errors (fix typo in manifest)
- [ ] 0 TypeScript errors
- [ ] All 10 production-ready criteria met
- [ ] README.md created with full documentation
- [ ] Permissions integrated (page + service layer)
- [ ] All CRUD operations working
- [ ] Maintenance scheduling working
- [ ] Depreciation calculation working
- [ ] Usage logging working
- [ ] Analytics metrics working
- [ ] Manual testing passed (12 workflows)

### Integration Verified:
- [ ] Rentals module triggers usage logging (if active)
- [ ] Dashboard shows asset metrics widget
- [ ] Maintenance alerts appear when due
- [ ] EventBus events flowing correctly

---

## 🔧 COMMANDS

```bash
# Audit
pnpm -s exec eslint src/modules/assets/
pnpm -s exec eslint src/pages/admin/operations/assets/
pnpm -s exec tsc --noEmit

# Development
pnpm dev  # If not already running

# Database (Supabase Dashboard)
# Check tables: assets, asset_maintenance, asset_depreciation, asset_usage_log
# Verify RLS policies are enabled
# Verify SQL function: get_asset_metrics
```

---

## ⏱️ TIME TRACKING

- [ ] Audit: 30 min
- [ ] Fix Structure: 1 hour
- [ ] Database & Functionality: 1.5 hours
- [ ] Cross-Module: 1 hour
- [ ] Validation: 30 min

**Total**: 4.5 hours

---

## 🔄 DEPENDENCIES

**Requires** (must be complete):
- None (standalone module)

**Optional Integration**:
- Rentals module (for rental usage tracking)

---

**Status**: 🔴 NOT STARTED (needs service layer + database)
**Dependencies**: None (standalone)
**Next**: Mobile (final P4 module)
