/**
 * UNIVERSAL ALERT SYSTEM - BARREL EXPORTS
 * ============================================================================
 * Central export point for the Universal Alert Rules system
 */

// Core engine
export { UniversalRuleEngine } from './UniversalRuleEngine';

// Types
export type {
    // Database types
    UniversalAlertRule,
    UniversalAlertRuleInsert,
    UniversalAlertRuleUpdate,
    AlertRule,
    AlertRuleInsert,
    AlertRuleUpdate,

    // Enums
    RuleType,
    Severity,
    ComparisonOperator,
    NotificationChannel,

    // Conditions
    RuleCondition,
    RuleConditionBase,
    ThresholdCondition,
    AnomalyCondition,
    MLForecastCondition,
    EventCondition,
    ScheduleCondition,
    ComplexConditions,

    // Actions
    RuleAction,

    // Evaluation
    RuleEvaluationContext,
    RuleEvaluationResult,
    RuleEngineStats,
    UniversalRuleEngineConfig
} from './types';

// Type guards
export {
    isThresholdCondition,
    isAnomalyCondition,
    isMLForecastCondition,
    isEventCondition,
    isScheduleCondition,
    isComplexConditions
} from './types';
