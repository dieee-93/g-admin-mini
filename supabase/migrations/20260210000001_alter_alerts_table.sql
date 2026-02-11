-- ============================================================================
-- ALTER Alerts Table - Database Migration
-- ============================================================================
-- Version: 1.0.1
-- Date: 2026-02-10
-- Description: Modifies the EXISTING 'alerts' table to support multi-tenancy
--              and the Universal Rule Engine requirements.
-- ============================================================================

-- 1. Add missing columns
ALTER TABLE alerts 
  ADD COLUMN IF NOT EXISTS organization_id uuid, -- Critical for multi-tenancy
  ADD COLUMN IF NOT EXISTS module_name text, -- For module-level filtering
  ADD COLUMN IF NOT EXISTS entity_id text, -- To link to source record
  ADD COLUMN IF NOT EXISTS rule_id uuid REFERENCES universal_alert_rules(id);

-- 2. Add limits/constraints if they don't exist
-- (Checking if organization_id is NULL for existing records - might need a default or backfill strategy
--  For now, making it nullable initially, then you might want to enforce NOT NULL after data fix)

-- 3. Create Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_alerts_org_status 
  ON alerts (organization_id, status)
  WHERE status IN ('active', 'new', 'read'); -- Note: 'status' in existing table has different values ('active', etc.)

CREATE INDEX IF NOT EXISTS idx_alerts_module 
  ON alerts (organization_id, module_name);

-- 4. Enable RLS (It might be enabled, but ensure it)
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies specifically for organization isolation
-- Drop existing policies if they conflict (or create new specific ones)

DROP POLICY IF EXISTS select_own_org_alerts ON alerts;
CREATE POLICY select_own_org_alerts ON alerts
  FOR SELECT
  USING (organization_id = current_setting('app.current_org_id', true)::uuid);

DROP POLICY IF EXISTS insert_own_org_alerts ON alerts;
CREATE POLICY insert_own_org_alerts ON alerts
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_org_id', true)::uuid);

DROP POLICY IF EXISTS update_own_org_alerts ON alerts;
CREATE POLICY update_own_org_alerts ON alerts
  FOR UPDATE
  USING (organization_id = current_setting('app.current_org_id', true)::uuid);

-- 6. Realtime
-- Ensure the table is in the publication
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;

-- 7. Comments
COMMENT ON COLUMN alerts.organization_id IS 'Multi-tenant isolation key (Added 2026-02-10).';
COMMENT ON COLUMN alerts.module_name IS 'Source module name (Added 2026-02-10).';
