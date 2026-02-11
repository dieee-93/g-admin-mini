-- ============================================================================
-- EXTEND Universal Alert Rules Table
-- ============================================================================
-- Version: 1.0.1
-- Date: 2026-02-17
-- Description: Adds missing fields for payment gateway and advanced alert rules
-- ============================================================================

-- Add new columns for rule templates and intelligence level
ALTER TABLE universal_alert_rules
  ADD COLUMN IF NOT EXISTS title_template text,
  ADD COLUMN IF NOT EXISTS message_template text,
  ADD COLUMN IF NOT EXISTS intelligence_level text DEFAULT 'simple' CHECK (intelligence_level IN ('simple', 'contextual', 'predictive'));

-- Add comments
COMMENT ON COLUMN universal_alert_rules.title_template IS 'Template for alert title with placeholder variables (e.g., {gateway_name})';
COMMENT ON COLUMN universal_alert_rules.message_template IS 'Template for alert message with placeholder variables';
COMMENT ON COLUMN universal_alert_rules.intelligence_level IS 'Intelligence level: simple (threshold), contextual (pattern-aware), predictive (forecast)';

-- The 'context' JSON field can store additional metadata:
-- - category: string (e.g., 'infrastructure', 'performance', 'reliability', 'quota')
-- - requiresImmediate: boolean
-- - autoResolve: boolean
-- - is_recurring: boolean
-- - recurrence_pattern: string (e.g., 'escalate_hourly')
-- - threshold: number (for quota rules)
-- - entity_type: string (e.g., 'gateway_health', 'gateway_limits')

COMMENT ON COLUMN universal_alert_rules.context IS 'Additional rule metadata: category, requiresImmediate, autoResolve, is_recurring, recurrence_pattern, threshold, entity_type';
