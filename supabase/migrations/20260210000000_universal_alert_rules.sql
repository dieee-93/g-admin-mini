-- ============================================================================
-- Universal Alert Rules System - Database Migration
-- ============================================================================
-- Version: 1.0.0
-- Date: 2026-02-10
-- Phase: 1 - Week 1, Day 1
-- Description: Core table for rule-based alert system with multi-tenant RLS,
--              optimized JSONB indexing, and security best practices
-- ============================================================================

-- ============================================================================
-- 1. CREATE MAIN TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS universal_alert_rules (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-tenant isolation (CRITICAL for RLS)
  organization_id uuid NOT NULL,
  
  -- Metadata (indexed for fast filtering)
  module_name text NOT NULL,
  rule_name text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type IN ('threshold', 'anomaly', 'ml_forecast', 'event', 'schedule')),
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  priority integer NOT NULL DEFAULT 100 CHECK (priority >= 0 AND priority <= 1000),
  
  -- Rule definition (JSONB for flexibility)
  conditions jsonb NOT NULL,
  actions jsonb NOT NULL,
  context jsonb DEFAULT '{}'::jsonb,
  
  -- Activation control
  is_active boolean NOT NULL DEFAULT true,
  
  -- Audit trail
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  
  -- Alert execution tracking
  last_triggered_at timestamptz,
  trigger_count integer NOT NULL DEFAULT 0,
  
  -- Constraints
  CONSTRAINT unique_rule_per_module_org UNIQUE(organization_id, module_name, rule_name)
);

-- ============================================================================
-- 2. COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE universal_alert_rules IS 
  'Universal alert rules system with JSONB-based rule engine. Supports threshold, anomaly detection, ML forecasting, event-based, and scheduled alerts across all g-mini modules.';

COMMENT ON COLUMN universal_alert_rules.organization_id IS 
  'Multi-tenant isolation key. Used by RLS policies to ensure data segregation.';

COMMENT ON COLUMN universal_alert_rules.module_name IS 
  'Target module (e.g., "sales", "materials", "customers"). Must match ModuleRegistry names.';

COMMENT ON COLUMN universal_alert_rules.rule_type IS 
  'Alert type: threshold (value-based), anomaly (statistical), ml_forecast (NeuralProphet), event (reactive), schedule (time-based).';

COMMENT ON COLUMN universal_alert_rules.conditions IS 
  'JSONB rule conditions. Example: {"field": "total", "operator": ">", "value": 10000}. Validated by TypeScript engine before storage.';

COMMENT ON COLUMN universal_alert_rules.actions IS 
  'JSONB actions to execute. Example: {"notify": ["email", "sms"], "recipients": ["admin@example.com"], "message": "High value sale detected"}.';

COMMENT ON COLUMN universal_alert_rules.priority IS 
  'Execution priority (0-1000). Lower numbers = higher priority. Used when multiple rules trigger simultaneously.';

-- ============================================================================
-- 3. INDEXES (Performance Optimization)
-- ============================================================================

-- Index 1: Organization + Active status (most common query)
CREATE INDEX idx_alert_rules_org_active 
  ON universal_alert_rules (organization_id, is_active) 
  WHERE is_active = true;

COMMENT ON INDEX idx_alert_rules_org_active IS 
  'Partial index for active rules per organization. Optimizes rule evaluation queries.';

-- Index 2: Module + Active (module-specific queries)
CREATE INDEX idx_alert_rules_module_active 
  ON universal_alert_rules (module_name, is_active) 
  WHERE is_active = true;

COMMENT ON INDEX idx_alert_rules_module_active IS 
  'Partial index for active rules per module. Used by module-specific alert evaluators.';

-- Index 3: JSONB conditions (GIN with jsonb_path_ops - 50% smaller)
CREATE INDEX idx_alert_rules_conditions 
  ON universal_alert_rules 
  USING GIN (conditions jsonb_path_ops);

COMMENT ON INDEX idx_alert_rules_conditions IS 
  'GIN index using jsonb_path_ops operator class. Optimized for containment queries (@>) with 50% smaller index size vs default jsonb_ops.';

-- Index 4: Rule type (for type-specific batch evaluation)
CREATE INDEX idx_alert_rules_type 
  ON universal_alert_rules (rule_type) 
  WHERE is_active = true;

-- Index 5: Severity (for filtering critical alerts)
CREATE INDEX idx_alert_rules_severity 
  ON universal_alert_rules (severity) 
  WHERE is_active = true AND severity = 'critical';

COMMENT ON INDEX idx_alert_rules_severity IS 
  'Partial index for critical alerts only. Enables fast dashboards showing critical issues.';

-- Index 6: Last triggered (for stale rule detection)
CREATE INDEX idx_alert_rules_last_triggered 
  ON universal_alert_rules (last_triggered_at DESC NULLS LAST) 
  WHERE is_active = true;

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) - Multi-Tenant Isolation
-- ============================================================================

-- Enable RLS on table
ALTER TABLE universal_alert_rules ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owner (security best practice)
ALTER TABLE universal_alert_rules FORCE ROW LEVEL SECURITY;

-- Policy 1: Users can only SELECT their organization's rules
CREATE POLICY select_own_org_rules ON universal_alert_rules
  FOR SELECT
  USING (organization_id = current_setting('app.current_org_id', true)::uuid);

-- Policy 2: Users can only INSERT rules for their organization
CREATE POLICY insert_own_org_rules ON universal_alert_rules
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_org_id', true)::uuid);

-- Policy 3: Users can only UPDATE their organization's rules
CREATE POLICY update_own_org_rules ON universal_alert_rules
  FOR UPDATE
  USING (organization_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (organization_id = current_setting('app.current_org_id', true)::uuid);

-- Policy 4: Users can only DELETE their organization's rules
CREATE POLICY delete_own_org_rules ON universal_alert_rules
  FOR DELETE
  USING (organization_id = current_setting('app.current_org_id', true)::uuid);

-- ============================================================================
-- 5. TRIGGERS (Automated Maintenance)
-- ============================================================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_alert_rule_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_alert_rule_timestamp() IS 
  'Automatically sets updated_at to current timestamp on UPDATE operations.';

-- Trigger: Call timestamp function on UPDATE
CREATE TRIGGER trigger_update_alert_rule_timestamp
  BEFORE UPDATE ON universal_alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_rule_timestamp();

-- Function: Validate JSONB structure (security)
CREATE OR REPLACE FUNCTION validate_alert_rule_jsonb()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate conditions JSONB structure
  IF NOT (NEW.conditions ? 'field' AND NEW.conditions ? 'operator' AND NEW.conditions ? 'value') THEN
    RAISE EXCEPTION 'conditions must contain: field, operator, value';
  END IF;
  
  -- Validate actions JSONB structure
  IF NOT (NEW.actions ? 'notify') THEN
    RAISE EXCEPTION 'actions must contain: notify';
  END IF;
  
  -- Limit JSONB size to prevent bloat (8KB PostgreSQL limit - safe margin)
  IF LENGTH(NEW.conditions::text) > 7000 THEN
    RAISE EXCEPTION 'conditions JSONB too large (max 7KB)';
  END IF;
  
  IF LENGTH(NEW.actions::text) > 7000 THEN
    RAISE EXCEPTION 'actions JSONB too large (max 7KB)';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION validate_alert_rule_jsonb() IS 
  'Validates JSONB structure and size limits before INSERT/UPDATE. Prevents malformed rules and JSONB bloat.';

-- Trigger: Validate JSONB on INSERT/UPDATE
CREATE TRIGGER trigger_validate_alert_rule_jsonb
  BEFORE INSERT OR UPDATE ON universal_alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION validate_alert_rule_jsonb();

-- ============================================================================
-- 6. HELPER FUNCTIONS (Rule Engine Utilities)
-- ============================================================================

-- Function: Get active rules for a module
CREATE OR REPLACE FUNCTION get_active_rules_for_module(p_module_name text)
RETURNS TABLE (
  id uuid,
  rule_name text,
  rule_type text,
  severity text,
  priority integer,
  conditions jsonb,
  actions jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.rule_name,
    r.rule_type,
    r.severity,
    r.priority,
    r.conditions,
    r.actions
  FROM universal_alert_rules r
  WHERE r.module_name = p_module_name
    AND r.is_active = true
  ORDER BY r.priority ASC, r.severity DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_active_rules_for_module(text) IS 
  'Returns all active rules for a given module, ordered by priority and severity. Used by rule evaluation engine.';

-- Function: Increment trigger count
CREATE OR REPLACE FUNCTION increment_rule_trigger_count(p_rule_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE universal_alert_rules
  SET 
    trigger_count = trigger_count + 1,
    last_triggered_at = now()
  WHERE id = p_rule_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_rule_trigger_count(uuid) IS 
  'Increments trigger count and updates last_triggered_at. Called after successful alert execution.';

-- Function: Get stale rules (not triggered in X days)
CREATE OR REPLACE FUNCTION get_stale_rules(p_days_threshold integer DEFAULT 30)
RETURNS TABLE (
  id uuid,
  module_name text,
  rule_name text,
  days_since_last_trigger integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.module_name,
    r.rule_name,
    EXTRACT(DAY FROM (now() - r.last_triggered_at))::integer as days_since_last_trigger
  FROM universal_alert_rules r
  WHERE r.is_active = true
    AND (
      r.last_triggered_at IS NULL 
      OR r.last_triggered_at < (now() - (p_days_threshold || ' days')::interval)
    )
  ORDER BY r.last_triggered_at ASC NULLS FIRST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_stale_rules(integer) IS 
  'Identifies rules that have not triggered in X days. Useful for detecting misconfigured or overly-specific rules.';

-- ============================================================================
-- 7. STATISTICS CONFIGURATION (Query Planner Optimization)
-- ============================================================================

-- Increase statistics target for JSONB columns (high variance data)
ALTER TABLE universal_alert_rules ALTER COLUMN conditions SET STATISTICS 1000;
ALTER TABLE universal_alert_rules ALTER COLUMN actions SET STATISTICS 1000;

-- Analyze table to generate statistics
ANALYZE universal_alert_rules;

-- ============================================================================
-- 8. GRANTS (Permissions)
-- ============================================================================

-- Grant SELECT to authenticated users (RLS will filter by organization)
GRANT SELECT ON universal_alert_rules TO authenticated;

-- Grant INSERT, UPDATE, DELETE to authenticated users (RLS enforced)
GRANT INSERT, UPDATE, DELETE ON universal_alert_rules TO authenticated;

-- Grant EXECUTE on helper functions
GRANT EXECUTE ON FUNCTION get_active_rules_for_module(text) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_rule_trigger_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_stale_rules(integer) TO authenticated;

-- ============================================================================
-- 9. SAMPLE DATA (For Development/Testing)
-- ============================================================================
-- Uncomment below to insert sample rules during development

/*
-- Sample: Payment gateway failure alert (threshold)
INSERT INTO universal_alert_rules (
  organization_id,
  module_name,
  rule_name,
  rule_type,
  severity,
  priority,
  conditions,
  actions
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid, -- Replace with real org_id
  'payment-gateways',
  'Payment Failure Rate High',
  'threshold',
  'critical',
  10,
  '{
    "field": "failure_rate",
    "operator": ">",
    "value": 0.05,
    "window": "15m"
  }'::jsonb,
  '{
    "notify": ["email", "app_notification"],
    "recipients": ["admin@example.com"],
    "message": "Payment failure rate exceeded 5% in the last 15 minutes",
    "escalate_after": "30m"
  }'::jsonb
);

-- Sample: Low stock alert (threshold)
INSERT INTO universal_alert_rules (
  organization_id,
  module_name,
  rule_name,
  rule_type,
  severity,
  priority,
  conditions,
  actions
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'materials',
  'Low Stock Warning',
  'threshold',
  'warning',
  50,
  '{
    "field": "stock_quantity",
    "operator": "<",
    "value": 10,
    "material_type": "critical"
  }'::jsonb,
  '{
    "notify": ["email"],
    "recipients": ["inventory@example.com"],
    "message": "Critical material stock below threshold"
  }'::jsonb
);
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next Steps:
-- 1. Run: supabase db reset (local) or supabase db push (remote)
-- 2. Verify RLS: Test with different organization_id values
-- 3. Create TypeScript types: supabase gen types typescript --local
-- 4. Implement UniversalRuleEngine.ts (Week 1, Day 3-4)
-- ============================================================================
