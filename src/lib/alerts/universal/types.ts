/**
 * UNIVERSAL ALERT RULES - TYPE DEFINITIONS
 * ============================================================================
 * TypeScript interfaces for the Universal Alert Rules system
 * 
 * This module provides type-safe interfaces for rule conditions, actions,
 * and the rule engine evaluation logic.
 * 
 * @module lib/alerts/universal/types
 * @version 1.0.0
 */

import type { Database } from '@/lib/supabase/database.types';

// ============================================================================
// DATABASE TYPES (from Supabase)
// ============================================================================

export type UniversalAlertRule = Database['public']['Tables']['universal_alert_rules']['Row'];
export type UniversalAlertRuleInsert = Database['public']['Tables']['universal_alert_rules']['Insert'];
export type UniversalAlertRuleUpdate = Database['public']['Tables']['universal_alert_rules']['Update'];

// ============================================================================
// RULE TYPE ENUMS
// ============================================================================

export type RuleType = 'threshold' | 'anomaly' | 'ml_forecast' | 'event' | 'schedule';

export type Severity = 'info' | 'warning' | 'critical';

export type ComparisonOperator = '>' | '<' | '>=' | '<=' | '=' | '!=' | 'between' | 'in';

// ============================================================================
// CONDITION SCHEMAS
// ============================================================================

/**
 * Base condition interface - all rule conditions must implement this
 */
export interface RuleConditionBase {
    field: string;
    operator: ComparisonOperator;
    value: string | number | boolean | any[] | DynamicValue; // Array for 'between' and 'in' operators, or dynamic field reference
}

/**
 * Dynamic value reference - compares against another field value
 * 
 * @example
 * ```json
 * {
 *   "field": "limit",
 *   "multiplier": 0.9,
 *   "offset": 0
 * }
 * ```
 */
export interface DynamicValue {
    field: string;
    multiplier?: number;
    offset?: number;
}

/**
 * Threshold condition - compares a field value against a static threshold
 * 
 * @example
 * ```json
 * {
 *   "field": "total",
 *   "operator": ">",
 *   "value": 10000,
 *   "window": "15m"
 * }
 * ```
 */
export interface ThresholdCondition extends RuleConditionBase {
    window?: string; // Time window (e.g., "15m", "1h", "24h")
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

/**
 * Anomaly condition - detects statistical outliers
 * 
 * @example
 * ```json
 * {
 *   "field": "sales_volume",
 *   "operator": ">",
 *   "value": 0,
 *   "z_score_threshold": 3,
 *   "lookback_days": 30
 * }
 * ```
 */
export interface AnomalyCondition extends RuleConditionBase {
    z_score_threshold?: number;
    lookback_days?: number;
    method?: 'isolation_forest' | 'z_score' | 'moving_average';
}

/**
 * ML Forecast condition - uses NeuralProphet predictions
 * 
 * @example
 * ```json
 * {
 *   "field": "material_stock",
 *   "operator": "<",
 *   "value": 10,
 *   "forecast_days": 7,
 *   "confidence_threshold": 0.8
 * }
 * ```
 */
export interface MLForecastCondition extends RuleConditionBase {
    forecast_days?: number;
    confidence_threshold?: number;
    model_version?: string;
}

/**
 * Event condition - reacts to specific database events
 * 
 * @example
 * ```json
 * {
 *   "field": "payment_status",
 *   "operator": "=",
 *   "value": "failed",
 *   "event_type": "INSERT"
 * }
 * ```
 */
export interface EventCondition extends RuleConditionBase {
    event_type?: 'INSERT' | 'UPDATE' | 'DELETE';
    debounce_ms?: number;
}

/**
 * Schedule condition - triggers at specific times
 * 
 * @example
 * ```json
 * {
 *   "field": "daily_report",
 *   "operator": "=",
 *   "value": true,
 *   "cron": "0 9 * * *"
 * }
 * ```
 */
export interface ScheduleCondition extends RuleConditionBase {
    cron: string;
    timezone?: string;
}

/**
 * Complex conditions - supports AND/OR logic with nesting
 * 
 * @example
 * ```json
 * {
 *   "OR": [
 *     {
 *       "AND": [
 *         { "field": "stock", "operator": "<", "value": 10 },
 *         { "field": "priority", "operator": "=", "value": "high" }
 *       ]
 *     },
 *     {
 *       "AND": [
 *         { "field": "stock", "operator": "=", "value": 0 },
 *         { "field": "has_supplier", "operator": "=", "value": false }
 *       ]
 *     }
 *   ]
 * }
 * ```
 */
export interface ComplexConditions {
    AND?: (RuleCondition | ComplexConditions)[];
    OR?: (RuleCondition | ComplexConditions)[];
}

/**
 * Union type for all condition types
 * Can be a simple condition, a specific condition type, or complex AND/OR logic
 */
export type RuleCondition =
    | ThresholdCondition
    | AnomalyCondition
    | MLForecastCondition
    | EventCondition
    | ScheduleCondition
    | ComplexConditions;

// ============================================================================
// ACTION SCHEMAS
// ============================================================================

/**
 * Notification channel types
 */
export type NotificationChannel = 'email' | 'sms' | 'app_notification' | 'webhook' | 'slack';

/**
 * Alert action - what happens when rule triggers
 * 
 * @example
 * ```json
 * {
 *   "notify": ["email", "app_notification"],
 *   "recipients": ["admin@example.com"],
 *   "message": "Payment failure rate exceeded 5%",
 *   "escalate_after": "30m",
 *   "webhook_url": "https://example.com/alerts"
 * }
 * ```
 */
export interface RuleAction {
    notify: NotificationChannel[];
    recipients?: string[];
    title?: string; // Optional title template
    message: string;
    escalate_after?: string;
    webhook_url?: string;
    custom_data?: Record<string, any>;
}

// ============================================================================
// RULE EVALUATION
// ============================================================================

/**
 * Context passed to rule evaluation
 */
export interface RuleEvaluationContext {
    organizationId: string;
    moduleName: string;
    data: any; // The data being evaluated
    timestamp: Date;
    metadata?: Record<string, any>;
}

/**
 * Result of a rule evaluation
 */
export interface RuleEvaluationResult {
    ruleId: string;
    triggered: boolean;
    severity: Severity;
    matchedCondition?: RuleCondition;
    computedValue?: any;
    message?: string;
    actions?: RuleAction;
    metadata?: Record<string, any>;
    context?: Record<string, any>; // Context snapshot
    alertTitle?: string; // Rule name or generated title
    evaluatedAt: Date;
}

/**
 * Statistics for rule engine performance
 */
export interface RuleEngineStats {
    totalRulesEvaluated: number;
    rulesTriggered: number;
    evaluationTimeMs: number;
    errorsEncountered: number;
    lastEvaluationAt: Date;
}

// ============================================================================
// RULE ENGINE CONFIG
// ============================================================================

/**
 * Configuration for UniversalRuleEngine
 */
export interface UniversalRuleEngineConfig {
    /**
     * Organization ID for RLS filtering
     */
    organizationId: string;

    /**
     * Module name to filter rules
     */
    moduleName?: string;

    /**
     * Maximum number of rules to evaluate per batch
     * @default 100
     */
    maxRulesPerBatch?: number;

    /**
     * Enable debug logging
     * @default false
     */
    debug?: boolean;

    /**
     * Circuit breaker: minimum interval between evaluations (ms)
     * @default 3000
     */
    circuitBreakerInterval?: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type guard for threshold conditions
 */
export function isThresholdCondition(condition: RuleCondition): condition is ThresholdCondition {
    return 'window' in condition || 'aggregation' in condition;
}

/**
 * Type guard for anomaly conditions
 */
export function isAnomalyCondition(condition: RuleCondition): condition is AnomalyCondition {
    return 'z_score_threshold' in condition || 'method' in condition;
}

/**
 * Type guard for ML forecast conditions
 */
export function isMLForecastCondition(condition: RuleCondition): condition is MLForecastCondition {
    return 'forecast_days' in condition || 'confidence_threshold' in condition;
}

/**
 * Type guard for event conditions
 */
export function isEventCondition(condition: RuleCondition): condition is EventCondition {
    return 'event_type' in condition || 'debounce_ms' in condition;
}

/**
 * Type guard for schedule conditions
 */
export function isScheduleCondition(condition: RuleCondition): condition is ScheduleCondition {
    return 'cron' in condition;
}

/**
 * Type guard for complex conditions (AND/OR logic)
 */
export function isComplexConditions(condition: RuleCondition): condition is ComplexConditions {
    const complex = condition as ComplexConditions;
    return complex.AND !== undefined || complex.OR !== undefined;
}

/**
 * Type guard for dynamic value
 */
export function isDynamicValue(value: any): value is DynamicValue {
    return value && typeof value === 'object' && 'field' in value && !('operator' in value);
}

// ============================================================================
// EXPORTS
// ============================================================================

export interface Alert {
    // Core fields (Shared)
    id: string;
    organization_id?: string; // Added via migration 20260210...
    rule_id?: string; // Link to UniversalAlertRule
    title: string;
    status: 'active' | 'acknowledged' | 'resolved' | 'dismissed' | 'new' | 'read'; // Combined statuses
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;

    // Existing table fields
    type?: string;
    context?: string;
    description?: string; // Replacing 'message'
    intelligence_level?: 'simple' | 'smart' | 'predictive';
    acknowledged_at?: string;
    acknowledged_by?: string;
    resolved_at?: string;
    resolved_by?: string;
    resolution_notes?: string;
    persistent?: boolean;
    auto_expire_ms?: number;
    escalation_level?: number;
    is_recurring?: boolean;
    recurrence_pattern?: string;
    occurrence_count?: number;
    last_occurrence?: string;
    confidence?: number;
    predicted_date?: string;
    model_version?: string;

    // New fields (Added via migration)
    module_name?: string;
    entity_id?: string;

    // Mapped fields for compatibility
    message?: string; // Alias for description in UI
}

export type {
    Database,
    UniversalAlertRule as AlertRule,
    UniversalAlertRuleInsert as AlertRuleInsert,
    UniversalAlertRuleUpdate as AlertRuleUpdate
};
