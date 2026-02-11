-- ============================================================================
-- Payment Gateway Alert Rules - Seed Data
-- ============================================================================
-- Phase: 1 - Week 2, Day 8
-- Description: Initial set of 5 alert rules for Payment Gateways module.
--              Includes checks for health status, error rates, and API limits.
-- ============================================================================

-- Variables
-- Note: In a real migration we might query this, but for seeds we often use 
-- known IDs or placeholders. Using the default organization ID found in DB.
-- Organization ID: 00000000-0000-0000-0000-000000000001

-- 1. Gateway Health Check Failed -> Critical
INSERT INTO public.universal_alert_rules (
    organization_id,
    module_name,
    rule_name,
    rule_type,
    severity,
    priority,
    conditions,
    actions,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'payment',
    'Payment Gateway Down',
    'threshold',
    'critical',
    10, -- High priority
    '{
        "field": "status",
        "operator": "!=",
        "value": "operational"
    }'::jsonb,
    '{
        "notify": ["email", "app_notification", "slack"],
        "message": "Payment Gateway {gateway_name} is DOWN. Status: {status}",
        "escalate_after": "15m"
    }'::jsonb,
    true
) ON CONFLICT (organization_id, module_name, rule_name) DO UPDATE SET 
    conditions = EXCLUDED.conditions,
    actions = EXCLUDED.actions;

-- 2. Error Rate > 5% -> Error
INSERT INTO public.universal_alert_rules (
    organization_id,
    module_name,
    rule_name,
    rule_type,
    severity,
    priority,
    conditions,
    actions,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'payment',
    'High Error Rate',
    'threshold',
    'critical',
    50,
    '{
        "field": "error_rate",
        "operator": ">",
        "value": 0.05
    }'::jsonb,
    '{
        "notify": ["email", "app_notification"],
        "message": "High error rate detected for {gateway_name}: {error_rate}%",
        "escalate_after": "1h"
    }'::jsonb,
    true
) ON CONFLICT (organization_id, module_name, rule_name) DO UPDATE SET 
    conditions = EXCLUDED.conditions,
    actions = EXCLUDED.actions;

-- 3. API Calls > 90% of Limit -> Warning
-- Uses new DynamicValue feature
INSERT INTO public.universal_alert_rules (
    organization_id,
    module_name,
    rule_name,
    rule_type,
    severity,
    priority,
    conditions,
    actions,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'payment',
    'API Limit Approaching',
    'threshold',
    'warning',
    100,
    '{
        "field": "api_calls",
        "operator": ">",
        "value": {
            "field": "limit",
            "multiplier": 0.9
        }
    }'::jsonb,
    '{
        "notify": ["email"],
        "message": "API usage for {gateway_name} is at {api_calls} (90% of limit)"
    }'::jsonb,
    true
) ON CONFLICT (organization_id, module_name, rule_name) DO UPDATE SET 
    conditions = EXCLUDED.conditions,
    actions = EXCLUDED.actions;

-- 4. Declined Payments Spike -> Warning
INSERT INTO public.universal_alert_rules (
    organization_id,
    module_name,
    rule_name,
    rule_type,
    severity,
    priority,
    conditions,
    actions,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'payment',
    'Declined Payments Spike',
    'anomaly',
    'warning',
    80,
    '{
        "field": "metadata.declined_count_1h",
        "operator": ">",
        "value": 10
    }'::jsonb,
    '{
        "notify": ["email"],
        "message": "Unusual number of declined payments for {gateway_name}: {metadata.declined_count_1h} in last hour"
    }'::jsonb,
    true
) ON CONFLICT (organization_id, module_name, rule_name) DO UPDATE SET 
    conditions = EXCLUDED.conditions,
    actions = EXCLUDED.actions;

-- 5. Settlement Delay -> Info
INSERT INTO public.universal_alert_rules (
    organization_id,
    module_name,
    rule_name,
    rule_type,
    severity,
    priority,
    conditions,
    actions,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'payment',
    'Settlement Delay',
    'threshold',
    'info',
    200,
    '{
        "field": "metadata.settlement_delay_hours",
        "operator": ">",
        "value": 48
    }'::jsonb,
    '{
        "notify": ["app_notification"],
        "message": "Settlement delay detected for {gateway_name}: >48h"
    }'::jsonb,
    true
) ON CONFLICT (organization_id, module_name, rule_name) DO UPDATE SET 
    conditions = EXCLUDED.conditions,
    actions = EXCLUDED.actions;
