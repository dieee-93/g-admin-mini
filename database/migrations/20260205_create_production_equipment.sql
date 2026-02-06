-- =============================================
-- MIGRATION: Create Production Equipment System
-- Date: 2026-02-05
-- Description:
--   Production equipment with costing (depreciation, maintenance, consumables)
--   Replaces legacy 'assets' table with clean architecture
-- =============================================

BEGIN;

-- =============================================
-- PHASE 1: BACKUP LEGACY DATA (if needed)
-- =============================================

-- Create backup of old assets table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_name = 'assets' AND table_schema = 'public') THEN

    -- Backup legacy table
    CREATE TABLE IF NOT EXISTS public.assets_archived_20260205 AS
      SELECT * FROM public.assets;

    COMMENT ON TABLE public.assets_archived_20260205 IS
      'Archived assets table before production_equipment migration (2026-02-05)';

    RAISE NOTICE 'Legacy assets table backed up to assets_archived_20260205';
  END IF;
END $$;

-- =============================================
-- PHASE 2: DROP LEGACY TABLES (clean slate)
-- =============================================

-- Drop legacy assets table completely
DROP TABLE IF EXISTS public.assets CASCADE;

-- Drop legacy functions/triggers
DROP FUNCTION IF EXISTS update_assets_updated_at() CASCADE;

-- =============================================
-- PHASE 3: CREATE PRODUCTION_EQUIPMENT (clean)
-- =============================================

CREATE TABLE public.production_equipment (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  equipment_type VARCHAR(50) NOT NULL,

  -- Financial (Depreciation)
  purchase_price NUMERIC(12,2),
  current_value NUMERIC(12,2),
  purchase_date DATE,
  useful_life_years INTEGER,
  salvage_value NUMERIC(12,2) DEFAULT 0,
  accumulated_depreciation NUMERIC(12,2) DEFAULT 0,

  -- Costing (Hourly Rate Components)
  estimated_annual_hours INTEGER NOT NULL DEFAULT 2000,
  hourly_cost_rate NUMERIC(10,4),
  auto_calculate_rate BOOLEAN NOT NULL DEFAULT true,

  -- Cost Components
  maintenance_cost_percentage NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  energy_cost_per_hour NUMERIC(10,4) NOT NULL DEFAULT 0,
  consumables_cost_per_hour NUMERIC(10,4) NOT NULL DEFAULT 0,
  insurance_cost_annual NUMERIC(10,2) NOT NULL DEFAULT 0,
  overhead_cost_per_hour NUMERIC(10,4) NOT NULL DEFAULT 0,

  -- Usage Tracking
  actual_hours_used INTEGER NOT NULL DEFAULT 0,
  last_cost_calculation_date DATE,

  -- Operational Status
  status VARCHAR(50) NOT NULL DEFAULT 'available',
  condition VARCHAR(50) NOT NULL DEFAULT 'good',
  location VARCHAR(255),
  assigned_to UUID,

  -- Maintenance Schedule
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_interval_days INTEGER NOT NULL DEFAULT 90,

  -- Metadata
  notes TEXT,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,

  -- Constraints
  CONSTRAINT equipment_type_valid CHECK (
    equipment_type IN (
      'oven', 'mixer', 'press', 'lathe', 'mill',
      'saw', 'welder', 'conveyor', 'packaging',
      'dryer', 'grinder', 'cutter', 'other'
    )
  ),
  CONSTRAINT status_valid CHECK (
    status IN ('available', 'in_use', 'maintenance', 'retired')
  ),
  CONSTRAINT condition_valid CHECK (
    condition IN ('excellent', 'good', 'fair', 'poor')
  ),
  CONSTRAINT useful_life_positive CHECK (
    useful_life_years IS NULL OR useful_life_years > 0
  ),
  CONSTRAINT salvage_value_non_negative CHECK (
    salvage_value >= 0
  ),
  CONSTRAINT accumulated_depreciation_non_negative CHECK (
    accumulated_depreciation >= 0
  ),
  CONSTRAINT estimated_hours_positive CHECK (
    estimated_annual_hours > 0
  ),
  CONSTRAINT hourly_rate_non_negative CHECK (
    hourly_cost_rate IS NULL OR hourly_cost_rate >= 0
  ),
  CONSTRAINT maintenance_percentage_valid CHECK (
    maintenance_cost_percentage >= 0 AND maintenance_cost_percentage <= 100
  ),
  CONSTRAINT actual_hours_non_negative CHECK (
    actual_hours_used >= 0
  ),
  CONSTRAINT maintenance_interval_positive CHECK (
    maintenance_interval_days > 0
  )
);

-- =============================================
-- PHASE 4: CREATE INDEXES
-- =============================================

CREATE INDEX idx_production_equipment_code ON public.production_equipment(code);
CREATE INDEX idx_production_equipment_type ON public.production_equipment(equipment_type);
CREATE INDEX idx_production_equipment_status ON public.production_equipment(status);
CREATE INDEX idx_production_equipment_location ON public.production_equipment(location);
CREATE INDEX idx_production_equipment_assigned_to ON public.production_equipment(assigned_to);
CREATE INDEX idx_production_equipment_tags ON public.production_equipment USING GIN(tags);
CREATE INDEX idx_production_equipment_custom_fields ON public.production_equipment USING GIN(custom_fields);

-- =============================================
-- PHASE 5: ADD FOREIGN KEY CONSTRAINTS
-- =============================================

-- FK to team_members (assigned_to)
ALTER TABLE public.production_equipment
  ADD CONSTRAINT fk_production_equipment_assigned_to
  FOREIGN KEY (assigned_to)
  REFERENCES public.team_members(id)
  ON DELETE SET NULL;

-- FK to users (audit fields)
ALTER TABLE public.production_equipment
  ADD CONSTRAINT fk_production_equipment_created_by
  FOREIGN KEY (created_by)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

ALTER TABLE public.production_equipment
  ADD CONSTRAINT fk_production_equipment_updated_by
  FOREIGN KEY (updated_by)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

-- =============================================
-- PHASE 6: CREATE TRIGGERS
-- =============================================

-- Trigger: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_production_equipment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER production_equipment_updated_at
  BEFORE UPDATE ON public.production_equipment
  FOR EACH ROW
  EXECUTE FUNCTION update_production_equipment_timestamp();

-- Trigger: Auto-calculate hourly rate
CREATE OR REPLACE FUNCTION calculate_production_equipment_rate()
RETURNS TRIGGER AS $$
DECLARE
  depreciation_per_hour NUMERIC := 0;
  maintenance_per_hour NUMERIC := 0;
  insurance_per_hour NUMERIC := 0;
  total_rate NUMERIC := 0;
BEGIN
  -- Only calculate if auto_calculate_rate enabled and required fields exist
  IF NEW.auto_calculate_rate = true
     AND NEW.purchase_price IS NOT NULL
     AND NEW.useful_life_years IS NOT NULL
     AND NEW.useful_life_years > 0 THEN

    -- 1. Depreciation per hour
    depreciation_per_hour :=
      (NEW.purchase_price - COALESCE(NEW.salvage_value, 0))
      / (NEW.useful_life_years * NEW.estimated_annual_hours);

    -- 2. Maintenance per hour
    IF NEW.maintenance_cost_percentage > 0 THEN
      maintenance_per_hour :=
        (NEW.purchase_price * NEW.maintenance_cost_percentage / 100)
        / NEW.estimated_annual_hours;
    END IF;

    -- 3. Insurance per hour
    IF NEW.insurance_cost_annual > 0 THEN
      insurance_per_hour :=
        NEW.insurance_cost_annual / NEW.estimated_annual_hours;
    END IF;

    -- 4. Total rate
    total_rate :=
      depreciation_per_hour
      + maintenance_per_hour
      + COALESCE(NEW.energy_cost_per_hour, 0)
      + COALESCE(NEW.consumables_cost_per_hour, 0)
      + insurance_per_hour
      + COALESCE(NEW.overhead_cost_per_hour, 0);

    -- Update fields
    NEW.hourly_cost_rate := ROUND(total_rate, 4);
    NEW.last_cost_calculation_date := CURRENT_DATE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER production_equipment_calculate_rate
  BEFORE INSERT OR UPDATE ON public.production_equipment
  FOR EACH ROW
  EXECUTE FUNCTION calculate_production_equipment_rate();

-- =============================================
-- PHASE 7: CREATE RLS POLICIES
-- =============================================

ALTER TABLE public.production_equipment ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view
CREATE POLICY production_equipment_select_policy
  ON public.production_equipment FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only supervisors+ can manage
CREATE POLICY production_equipment_manage_policy
  ON public.production_equipment FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('SUPERVISOR', 'ADMIN', 'OWNER')
    )
  );

-- =============================================
-- PHASE 8: ADD PRODUCTION_CONFIG TO MATERIALS/PRODUCTS
-- =============================================

-- Add production_config to materials
ALTER TABLE public.materials
  ADD COLUMN IF NOT EXISTS production_config JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_materials_production_config
  ON public.materials USING GIN (production_config);

-- Add production_config to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS production_config JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_products_production_config
  ON public.products USING GIN (production_config);

-- =============================================
-- PHASE 9: CREATE UTILITY FUNCTIONS
-- =============================================

-- Function: Manual cost calculation (for queries/reports)
CREATE OR REPLACE FUNCTION get_equipment_hourly_rate(p_equipment_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  result NUMERIC;
BEGIN
  SELECT hourly_cost_rate INTO result
  FROM public.production_equipment
  WHERE id = p_equipment_id;

  RETURN COALESCE(result, 0);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_equipment_hourly_rate IS
  'Returns the current hourly cost rate for a given equipment ID';

-- Function: Get equipment cost breakdown
CREATE OR REPLACE FUNCTION get_equipment_cost_breakdown(p_equipment_id UUID)
RETURNS TABLE(
  equipment_name VARCHAR,
  depreciation_per_hour NUMERIC,
  maintenance_per_hour NUMERIC,
  energy_per_hour NUMERIC,
  consumables_per_hour NUMERIC,
  insurance_per_hour NUMERIC,
  overhead_per_hour NUMERIC,
  total_per_hour NUMERIC
) AS $$
DECLARE
  eq RECORD;
  dep_hour NUMERIC := 0;
  maint_hour NUMERIC := 0;
  ins_hour NUMERIC := 0;
BEGIN
  SELECT * INTO eq
  FROM public.production_equipment
  WHERE id = p_equipment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Equipment not found: %', p_equipment_id;
  END IF;

  -- Calculate depreciation
  IF eq.purchase_price IS NOT NULL
     AND eq.useful_life_years IS NOT NULL
     AND eq.useful_life_years > 0 THEN
    dep_hour :=
      (eq.purchase_price - COALESCE(eq.salvage_value, 0))
      / (eq.useful_life_years * eq.estimated_annual_hours);
  END IF;

  -- Calculate maintenance
  IF eq.purchase_price IS NOT NULL
     AND eq.maintenance_cost_percentage > 0 THEN
    maint_hour :=
      (eq.purchase_price * eq.maintenance_cost_percentage / 100)
      / eq.estimated_annual_hours;
  END IF;

  -- Calculate insurance
  IF eq.insurance_cost_annual > 0 THEN
    ins_hour := eq.insurance_cost_annual / eq.estimated_annual_hours;
  END IF;

  -- Return breakdown
  RETURN QUERY SELECT
    eq.name,
    ROUND(dep_hour, 4),
    ROUND(maint_hour, 4),
    ROUND(COALESCE(eq.energy_cost_per_hour, 0), 4),
    ROUND(COALESCE(eq.consumables_cost_per_hour, 0), 4),
    ROUND(ins_hour, 4),
    ROUND(COALESCE(eq.overhead_cost_per_hour, 0), 4),
    ROUND(dep_hour + maint_hour +
          COALESCE(eq.energy_cost_per_hour, 0) +
          COALESCE(eq.consumables_cost_per_hour, 0) +
          ins_hour +
          COALESCE(eq.overhead_cost_per_hour, 0), 4);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_equipment_cost_breakdown IS
  'Returns detailed cost breakdown for equipment hourly rate';

-- Function: Increment equipment hours (usage tracking)
CREATE OR REPLACE FUNCTION increment_equipment_hours(
  p_equipment_id UUID,
  p_hours NUMERIC
) RETURNS VOID AS $$
BEGIN
  UPDATE public.production_equipment
  SET
    actual_hours_used = actual_hours_used + p_hours,
    updated_at = NOW()
  WHERE id = p_equipment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Equipment not found: %', p_equipment_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_equipment_hours IS
  'Increments actual hours used for equipment';

-- Function: Get equipment metrics
CREATE OR REPLACE FUNCTION get_equipment_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_equipment', (
      SELECT COUNT(*)
      FROM production_equipment
      WHERE status != 'retired'
    ),
    'available', (
      SELECT COUNT(*)
      FROM production_equipment
      WHERE status = 'available'
    ),
    'in_use', (
      SELECT COUNT(*)
      FROM production_equipment
      WHERE status = 'in_use'
    ),
    'maintenance', (
      SELECT COUNT(*)
      FROM production_equipment
      WHERE status = 'maintenance'
    ),
    'total_value', (
      SELECT COALESCE(SUM(current_value), 0)
      FROM production_equipment
      WHERE status != 'retired'
    ),
    'avg_hourly_rate', (
      SELECT ROUND(AVG(hourly_cost_rate), 2)
      FROM production_equipment
      WHERE status != 'retired'
        AND hourly_cost_rate IS NOT NULL
    ),
    'total_hours_used', (
      SELECT COALESCE(SUM(actual_hours_used), 0)
      FROM production_equipment
      WHERE status != 'retired'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_equipment_metrics IS
  'Returns aggregated metrics for production equipment';

-- =============================================
-- PHASE 10: ADD COMMENTS (Documentation)
-- =============================================

COMMENT ON TABLE public.production_equipment IS
  'Production equipment inventory with hourly costing (depreciation, maintenance, energy, consumables)';

COMMENT ON COLUMN public.production_equipment.code IS
  'Unique equipment code (e.g., OVEN-001, MIXER-A1)';

COMMENT ON COLUMN public.production_equipment.equipment_type IS
  'Type of production equipment (oven, mixer, press, lathe, etc.)';

COMMENT ON COLUMN public.production_equipment.useful_life_years IS
  'Expected useful life in years for depreciation calculation';

COMMENT ON COLUMN public.production_equipment.salvage_value IS
  'Estimated residual value at end of useful life';

COMMENT ON COLUMN public.production_equipment.accumulated_depreciation IS
  'Total depreciation accumulated to date';

COMMENT ON COLUMN public.production_equipment.estimated_annual_hours IS
  'Estimated hours of operation per year (for hourly rate calculation)';

COMMENT ON COLUMN public.production_equipment.hourly_cost_rate IS
  'Total cost per hour ($/hour) - calculated automatically from all components';

COMMENT ON COLUMN public.production_equipment.auto_calculate_rate IS
  'If true, hourly_cost_rate is calculated automatically on INSERT/UPDATE';

COMMENT ON COLUMN public.production_equipment.maintenance_cost_percentage IS
  'Annual maintenance cost as percentage of purchase_price (default: 5%)';

COMMENT ON COLUMN public.production_equipment.energy_cost_per_hour IS
  'Energy cost per hour (electricity, gas, etc.)';

COMMENT ON COLUMN public.production_equipment.consumables_cost_per_hour IS
  'Consumables cost per hour (lubricants, replacement parts, etc.)';

COMMENT ON COLUMN public.production_equipment.insurance_cost_annual IS
  'Annual insurance premium for the equipment';

COMMENT ON COLUMN public.production_equipment.overhead_cost_per_hour IS
  'Other overhead costs per hour (rent, storage, etc.)';

COMMENT ON COLUMN public.production_equipment.actual_hours_used IS
  'Cumulative actual hours of operation (tracked)';

COMMENT ON COLUMN public.production_equipment.last_cost_calculation_date IS
  'Date of last automatic hourly cost rate calculation';

COMMENT ON COLUMN public.production_equipment.assigned_to IS
  'Team member assigned to operate this equipment (FK to team_members.id)';

COMMENT ON COLUMN public.materials.production_config IS
  'Production configuration (JSONB): equipment_usage, labor, overhead for elaborated materials';

COMMENT ON COLUMN public.products.production_config IS
  'Production configuration (JSONB): equipment_usage, labor, overhead for products';

-- =============================================
-- PHASE 11: VALIDATION
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Production equipment system created successfully!';
  RAISE NOTICE 'Table: production_equipment';
  RAISE NOTICE 'Indexes: 7 created';
  RAISE NOTICE 'Triggers: 2 created';
  RAISE NOTICE 'Functions: 4 utility functions';
  RAISE NOTICE 'RLS Policies: 2 created';
  RAISE NOTICE 'Foreign Keys: 3 created (assigned_to → team_members, audit → users)';
END $$;

COMMIT;
