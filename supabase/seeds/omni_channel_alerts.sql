-- Omni-Channel Operational Alerts (Phase 2 - Week 4)
-- Date: 2026-03-04
-- Module: Fulfillment (Cross-Module Scope)
-- Corrected Schema: module_name, rule_name, context, organization_id
-- Constraint Compliance: rule_type='threshold', intelligence_level='contextual'

INSERT INTO public.universal_alert_rules (
    organization_id,
    module_name,
    rule_name,
    rule_type,
    intelligence_level,
    priority,
    severity,
    title_template,
    message_template,
    conditions,
    actions,
    is_active,
    context
) VALUES
-- 1. Omni-Channel Capacity Surge (Versatile Load)
(
    (SELECT id FROM public.organizations LIMIT 1),
    'fulfillment',
    'OMNI_CAPACITY_SURGE',
    'threshold',
    'contextual',
    1,
    'warning',
    '⚠️ High Load: {active_count} Active Orders',
    'Kitchen is under heavy load. Tables: {table_count}, Pickups: {pickup_count}, Delivery: {delivery_count}.',
    '{
        "logicalOperator": "AND",
        "conditions": [
            {
                "field": "weighted_load",
                "operator": "gt",
                "value": 20
            }
        ]
    }'::jsonb,
    '{
        "channels": ["app_notification", "realtime_toast"],
        "recipients": ["role:kitchen", "role:manager"],
        "escalation": null
    }'::jsonb,
    true,
    '{"category": "capacity", "documentation": "Triggered when weighted order volume exceeds capacity threshold."}'::jsonb
),

-- 2. Unpaid Handover Risk (Financial Security)
(
    (SELECT id FROM public.organizations LIMIT 1),
    'fulfillment',
    'UNPAID_HANDOVER_RISK',
    'threshold',
    'contextual',
    2,
    'critical',
    '🛑 STOP: Unpaid Order #{order_number}',
    'Do not hand over order #{order_number}. Payment status is {payment_status}. Collect payment immediately.',
    '{
        "logicalOperator": "AND",
        "conditions": [
            {
                "field": "status",
                "operator": "eq",
                "value": "ready"
            },
            {
                "field": "payment_status",
                "operator": "neq",
                "value": "paid"
            },
            {
                "field": "type",
                "operator": "in",
                "value": ["pickup", "delivery"]
            }
        ]
    }'::jsonb,
    '{
        "channels": ["app_notification", "realtime_modal"],
        "recipients": ["role:front_desk", "role:staff"],
        "escalation": {
            "timeout_minutes": 5,
            "escalate_to": ["role:manager"]
        }
    }'::jsonb,
    true,
    '{"category": "financial", "documentation": "Prevents unpaid orders from being handed over to customers or drivers."}'::jsonb
),

-- 3. Stale Workflow / Kitchen Bottleneck
(
    (SELECT id FROM public.organizations LIMIT 1),
    'fulfillment',
    'STALE_WORKFLOW_BOTTLENECK',
    'threshold',
    'contextual',
    3,
    'warning',
    '⏳ Kitchen Bottleneck: Order #{order_number}',
    'Order #{order_number} has been in preparation for {minutes_in_progress} minutes. Check with kitchen.',
    '{
        "logicalOperator": "AND",
        "conditions": [
            {
                "field": "status",
                "operator": "eq",
                "value": "in_progress"
            },
            {
                "field": "minutes_in_progress",
                "operator": "gt",
                "value": 45
            }
        ]
    }'::jsonb,
    '{
        "channels": ["app_notification"],
        "recipients": ["role:manager", "role:kitchen_lead"],
        "escalation": null
    }'::jsonb,
    true,
    '{"category": "efficiency", "documentation": "Detects orders stuck in preparation phase."}'::jsonb
),

-- 4. Potentially Late Pickup (CX Promise)
(
    (SELECT id FROM public.organizations LIMIT 1),
    'fulfillment',
    'LATE_PICKUP_RISK',
    'threshold',
    'contextual',
    4,
    'warning',
    '⏰ Late Pickup Risk: Order #{order_number}',
    'Order #{order_number} estimated ready at {estimated_ready_time} but promised for {promised_time}.',
    '{
        "logicalOperator": "AND",
        "conditions": [
            {
                "field": "is_late_risk",
                "operator": "eq",
                "value": true
            },
            {
                "field": "type",
                "operator": "eq",
                "value": "pickup"
            }
        ]
    }'::jsonb,
    '{
        "channels": ["app_notification"],
        "recipients": ["role:manager", "role:front_desk"],
        "escalation": null
    }'::jsonb,
    true,
    '{"category": "cx", "documentation": "Alerts when production estimate exceeds customer promise time."}'::jsonb
);
