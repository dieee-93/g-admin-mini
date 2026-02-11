/**
 * UNIVERSAL ALERT RULES - PAYMENT GATEWAY MONITORING
 * 
 * Rule definitions for monitoring payment gateway health, API limits, and status.
 * 
 * Integration Flow:
 * 1. Edge Function checks gateway health every 5 minutes
 * 2. Updates `payment_gateway_health` and `payment_gateway_limits` tables
 * 3. Triggers evaluate these rules on table updates
 * 4. Alerts created in `alerts` table
 * 5. AlertsProvider + Realtime push to UI
 */

import type { UniversalAlertRule } from '@/lib/alerts/universal/types';

/**
 * Rule: Payment Gateway is Down
 * Trigger: status = 'down'
 * Severity: critical
 */
export const GATEWAY_DOWN_RULE: Partial<UniversalAlertRule> = {
    id: '00000000-0000-0000-0000-000000000007',
    module_name: 'payment-gateways',
    organization_id: '00000000-0000-0000-0000-000000000000', // Will be set at runtime
    rule_name: 'Payment Gateway Down',
    rule_type: 'threshold',
    conditions: {
        field: 'status',
        operator: '=',
        value: 'down',
    },
    actions: {
        create_alert: true,
        notify_users: ['admin'],
    },
    severity: 'critical',
    priority: 1,
    intelligence_level: 'predictive',
    title_template: '{gateway_name} está caído',
    message_template:
        'La pasarela de pago {gateway_name} no responde. Los pagos están bloqueados. Contactar soporte inmediatamente.',
    context: {
        entity_type: 'gateway_health',
        category: 'infrastructure',
        requiresImmediate: true,
        autoResolve: true,
        is_recurring: true,
        recurrence_pattern: 'escalate_hourly',
    },
    is_active: true,
};

/**
 * Rule: Payment Gateway Degraded
 * Trigger: status = 'degraded'
 * Severity: high
 */
export const GATEWAY_DEGRADED_RULE: Partial<UniversalAlertRule> = {
    id: '00000000-0000-0000-0000-000000000008',
    module_name: 'payment-gateways',
    organization_id: '00000000-0000-0000-0000-000000000000',
    rule_name: 'Payment Gateway Degraded',
    rule_type: 'threshold',
    conditions: {
        field: 'status',
        operator: '=',
        value: 'degraded',
    },
    actions: {
        create_alert: true,
        notify_users: ['admin'],
    },
    severity: 'high',
    priority: 2,
    intelligence_level: 'contextual',
    title_template: '{gateway_name} funcionando con degradación',
    message_template:
        'La pasarela {gateway_name} está experimentando problemas. Tasa de éxito: {success_rate}%. Latencia promedio: {avg_latency_ms}ms.',
    context: {
        entity_type: 'gateway_health',
        category: 'performance',
        requiresImmediate: false,
        is_recurring: false,
    },
    is_active: true,
};

/**
 * Rule: API Limit Near Threshold (80%)
 * Trigger: (current_usage / daily_limit) > 0.8
 * Severity: warning
 */
export const API_LIMIT_WARNING_RULE: Partial<UniversalAlertRule> = {
    id: '00000000-0000-0000-0000-000000000009',
    module_name: 'payment-gateways',
    organization_id: '00000000-0000-0000-0000-000000000000',
    rule_name: 'API Limit Warning (80%)',
    rule_type: 'threshold',
    conditions: {
        logic: 'AND',
        conditions: [
            {
                field: 'usage_percentage',
                operator: '>',
                value: 80,
            },
        ],
    },
    actions: {
        create_alert: true,
        notify_users: ['admin'],
    },
    severity: 'warning',
    priority: 5,
    intelligence_level: 'simple',
    title_template: 'Acercándose al límite de API de {gateway_name}',
    message_template:
        'Has usado {current_usage} de {daily_limit} llamadas diarias ({usage_percentage}%). El límite se resetea a las {reset_time}.',
    context: {
        entity_type: 'gateway_limits',
        category: 'quota',
        threshold: 0.8,
        is_recurring: false,
    },
    is_active: true,
};

/**
 * Rule: API Limit Critical (95%)
 * Trigger: (current_usage / daily_limit) > 0.95
 * Severity: high
 */
export const API_LIMIT_CRITICAL_RULE: Partial<UniversalAlertRule> = {
    id: '00000000-0000-0000-0000-000000000010',
    module_name: 'payment-gateways',
    organization_id: '00000000-0000-0000-0000-000000000000',
    rule_name: 'API Limit Critical (95%)',
    rule_type: 'threshold',
    conditions: {
        logic: 'AND',
        conditions: [
            {
                field: 'usage_percentage',
                operator: '>',
                value: 95,
            },
        ],
    },
    actions: {
        create_alert: true,
        notify_users: ['admin'],
    },
    severity: 'critical',
    priority: 3,
    intelligence_level: 'predictive',
    title_template: 'CRÍTICO: Límite de API de {gateway_name} casi agotado',
    message_template:
        'Solo quedan {remaining_calls} llamadas de {daily_limit}. El servicio se bloqueará en {estimated_time_remaining}.',
    context: {
        entity_type: 'gateway_limits',
        category: 'quota',
        threshold: 0.95,
        requiresImmediate: true,
        is_recurring: false,
    },
    is_active: true,
};

/**
 * Rule: High Error Rate Warning (>5%)
 * Trigger: error_rate > 0.05
 * Severity: warning
 */
export const HIGH_ERROR_RATE_WARNING_RULE: Partial<UniversalAlertRule> = {
    id: '00000000-0000-0000-0000-000000000012',
    module_name: 'payment-gateways',
    organization_id: '00000000-0000-0000-0000-000000000000',
    rule_name: 'High Error Rate Warning (5%)',
    rule_type: 'threshold',
    conditions: {
        field: 'error_rate',
        operator: '>',
        value: 0.05,
    },
    actions: {
        create_alert: true,
        notify_users: ['admin'],
    },
    severity: 'warning',
    priority: 6,
    intelligence_level: 'contextual',
    title_template: 'Tasa de error elevada en {gateway_name}',
    message_template:
        'La pasarela {gateway_name} tiene una tasa de error del {error_rate_percentage}%. Esto podría indicar un problema emergente.',
    context: {
        entity_type: 'gateway_health',
        category: 'reliability',
        is_recurring: false,
    },
    is_active: true,
};

/**
 * Rule: High Error Rate Medium (>10%)
 * Trigger: error_rate > 0.1
 * Severity: medium
 */
export const HIGH_ERROR_RATE_MEDIUM_RULE: Partial<UniversalAlertRule> = {
    id: '00000000-0000-0000-0000-000000000013',
    module_name: 'payment-gateways',
    organization_id: '00000000-0000-0000-0000-000000000000',
    rule_name: 'High Error Rate Medium (10%)',
    rule_type: 'threshold',
    conditions: {
        field: 'error_rate',
        operator: '>',
        value: 0.1,
    },
    actions: {
        create_alert: true,
        notify_users: ['admin'],
    },
    severity: 'high',
    priority: 4,
    intelligence_level: 'contextual',
    title_template: 'Tasa de error alta en {gateway_name}',
    message_template:
        'La pasarela {gateway_name} tiene una tasa de error del {error_rate_percentage}%. Último error: {last_error}. Se requiere investigación.',
    context: {
        entity_type: 'gateway_health',
        category: 'reliability',
        is_recurring: false,
    },
    is_active: true,
};

/**
 * Rule: High Error Rate Critical (>20%)
 * Trigger: error_rate > 0.2
 * Severity: critical
 */
export const HIGH_ERROR_RATE_CRITICAL_RULE: Partial<UniversalAlertRule> = {
    id: '00000000-0000-0000-0000-000000000014',
    module_name: 'payment-gateways',
    organization_id: '00000000-0000-0000-0000-000000000000',
    rule_name: 'High Error Rate Critical (20%)',
    rule_type: 'threshold',
    conditions: {
        field: 'error_rate',
        operator: '>',
        value: 0.2,
    },
    actions: {
        create_alert: true,
        notify_users: ['admin'],
    },
    severity: 'critical',
    priority: 2,
    intelligence_level: 'predictive',
    title_template: 'CRÍTICO: Tasa de error muy alta en {gateway_name}',
    message_template:
        'La pasarela {gateway_name} tiene una tasa de error CRÍTICA del {error_rate_percentage}%. Los pagos pueden estar fallando. Contactar soporte inmediatamente.',
    context: {
        entity_type: 'gateway_health',
        category: 'reliability',
        requiresImmediate: true,
        is_recurring: true,
        recurrence_pattern: 'escalate_hourly',
    },
    is_active: true,
};

/**
 * All Payment Gateway Rules (for bulk insertion)
 */
export const PAYMENT_GATEWAY_RULES: Partial<UniversalAlertRule>[] = [
    GATEWAY_DOWN_RULE,
    GATEWAY_DEGRADED_RULE,
    API_LIMIT_WARNING_RULE,
    API_LIMIT_CRITICAL_RULE,
    HIGH_ERROR_RATE_WARNING_RULE,
    HIGH_ERROR_RATE_MEDIUM_RULE,
    HIGH_ERROR_RATE_CRITICAL_RULE,
];
