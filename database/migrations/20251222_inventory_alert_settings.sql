-- ============================================
-- INVENTORY ALERT SETTINGS TABLE
-- ============================================
-- Purpose: Business configuration for inventory thresholds and auto-reorder logic
-- Pattern: Settings Level 2 (specialized card → sub-page)
-- Route: /admin/settings/inventory/alerts
-- Version: 1.0.0
-- Date: 2025-12-22
-- 
-- ARCHITECTURE NOTE:
-- This table handles BUSINESS LOGIC configuration only (thresholds, EOQ, ABC).
-- For notification/alert delivery (recipients, channels), use existing notification_rules table.
-- Integration: notification_rules.conditions references thresholds defined here.
-- ============================================

-- ============================================
-- 1. CREATE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.inventory_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ========================================
  -- THRESHOLD CONFIGURATION (Global Defaults)
  -- ========================================
  -- These thresholds are referenced by notification_rules.conditions
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,      -- Units (global default)
  critical_stock_threshold INTEGER NOT NULL DEFAULT 5,  -- Units (global default)
  out_of_stock_threshold INTEGER NOT NULL DEFAULT 0,    -- Explicit zero stock
  
  -- ABC Analysis Configuration (Pareto 80-15-5 rule)
  abc_analysis_thresholds JSONB NOT NULL DEFAULT '{"a_threshold": 80, "b_threshold": 15, "c_threshold": 5}'::jsonb,
  abc_analysis_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Expiry Alert Configuration
  expiry_warning_days INTEGER NOT NULL DEFAULT 7,       -- Days before expiry to warn
  expiry_critical_days INTEGER NOT NULL DEFAULT 3,      -- Days before expiry for critical alert
  
  -- Waste Threshold
  waste_threshold_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00, -- Alert when waste > 5%
  
  -- ========================================
  -- AUTO-REORDER CONFIGURATION
  -- ========================================
  auto_reorder_enabled BOOLEAN NOT NULL DEFAULT false,
  reorder_quantity_rules JSONB NOT NULL DEFAULT '{
    "method": "economic_order_quantity",
    "min_order": 10,
    "max_order": 100,
    "safety_stock_days": 7,
    "lead_time_days": 3,
    "order_point_method": "fixed"
  }'::jsonb,
  
  -- ========================================
  -- METADATA
  -- ========================================
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- ========================================
  -- CONSTRAINTS
  -- ========================================
  CHECK (low_stock_threshold > critical_stock_threshold),
  CHECK (critical_stock_threshold >= out_of_stock_threshold),
  CHECK (expiry_warning_days > expiry_critical_days),
  CHECK (expiry_critical_days >= 0),
  CHECK (waste_threshold_percent >= 0 AND waste_threshold_percent <= 100)
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_inventory_alert_settings_created_by 
  ON public.inventory_alert_settings(created_by);

CREATE INDEX IF NOT EXISTS idx_inventory_alert_settings_is_system 
  ON public.inventory_alert_settings(is_system);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.inventory_alert_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Policy 1: All authenticated users can view settings
CREATE POLICY "Inventory alert settings viewable by authenticated users"
  ON public.inventory_alert_settings
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy 2: Only admins and managers can insert settings
CREATE POLICY "Inventory alert settings insertable by admins/managers"
  ON public.inventory_alert_settings
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

-- Policy 3: Only admins and managers can update settings
CREATE POLICY "Inventory alert settings updatable by admins/managers"
  ON public.inventory_alert_settings
  FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('admin', 'manager'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'manager'));

-- Policy 4: Only admins can delete non-system settings
CREATE POLICY "Inventory alert settings deletable by admins"
  ON public.inventory_alert_settings
  FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'admin'
    AND is_system = false
  );

-- ============================================
-- 5. CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_inventory_alert_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_alert_settings_updated_at
  BEFORE UPDATE ON public.inventory_alert_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_alert_settings_updated_at();

-- ============================================
-- 6. INSERT DEFAULT VALUES
-- ============================================

INSERT INTO public.inventory_alert_settings (
  low_stock_threshold,
  critical_stock_threshold,
  out_of_stock_threshold,
  abc_analysis_thresholds,
  abc_analysis_enabled,
  expiry_warning_days,
  expiry_critical_days,
  waste_threshold_percent,
  auto_reorder_enabled,
  reorder_quantity_rules,
  is_system
) VALUES (
  10,   -- Low stock at 10 units (global default)
  5,    -- Critical stock at 5 units
  0,    -- Out of stock explicitly at 0
  '{"a_threshold": 80, "b_threshold": 15, "c_threshold": 5}'::jsonb,  -- ABC Analysis (Pareto 80-15-5)
  true, -- ABC analysis enabled
  7,    -- Warn 7 days before expiry
  3,    -- Critical alert 3 days before expiry
  5.00, -- Alert when waste > 5%
  false, -- Auto-reorder disabled by default
  '{
    "method": "economic_order_quantity",
    "min_order": 10,
    "max_order": 100,
    "safety_stock_days": 7,
    "lead_time_days": 3,
    "order_point_method": "fixed",
    "reorder_multiplier": 1.0
  }'::jsonb,  -- EOQ method with safety stock
  true  -- System default (cannot be deleted)
) ON CONFLICT DO NOTHING;

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON public.inventory_alert_settings TO authenticated;
GRANT INSERT, UPDATE ON public.inventory_alert_settings TO authenticated;
GRANT DELETE ON public.inventory_alert_settings TO authenticated;

-- ============================================
-- 8. ADD COMMENTS
-- ============================================

COMMENT ON TABLE public.inventory_alert_settings IS 
  'Business configuration for inventory thresholds and auto-reorder logic. For notification delivery (recipients, channels), use notification_rules table.';

COMMENT ON COLUMN public.inventory_alert_settings.low_stock_threshold IS 
  'Global threshold for low stock alerts (in units). Referenced by notification_rules conditions.';

COMMENT ON COLUMN public.inventory_alert_settings.critical_stock_threshold IS 
  'Global threshold for critical stock alerts (in units). Referenced by notification_rules conditions.';

COMMENT ON COLUMN public.inventory_alert_settings.out_of_stock_threshold IS 
  'Explicit zero stock threshold. Typically 0 but configurable for fuzzy matching.';

COMMENT ON COLUMN public.inventory_alert_settings.abc_analysis_thresholds IS 
  'Percentage thresholds for ABC inventory classification (Pareto principle: A=80%, B=15%, C=5%)';

COMMENT ON COLUMN public.inventory_alert_settings.abc_analysis_enabled IS 
  'Whether ABC analysis classification is enabled for inventory items';

COMMENT ON COLUMN public.inventory_alert_settings.expiry_warning_days IS 
  'Days before expiry to trigger warning alert';

COMMENT ON COLUMN public.inventory_alert_settings.expiry_critical_days IS 
  'Days before expiry to trigger critical alert';

COMMENT ON COLUMN public.inventory_alert_settings.waste_threshold_percent IS 
  'Percentage threshold for waste alerts (e.g., 5% triggers alert)';

COMMENT ON COLUMN public.inventory_alert_settings.auto_reorder_enabled IS 
  'Whether automatic reordering is enabled when thresholds are crossed';

COMMENT ON COLUMN public.inventory_alert_settings.reorder_quantity_rules IS 
  'Configuration for automatic reorder quantities and methods (EOQ, fixed, days of supply)';

COMMENT ON COLUMN public.inventory_alert_settings.is_system IS 
  'Whether this is a system default that cannot be deleted';
