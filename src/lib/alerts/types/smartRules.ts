/**
 * SMART ALERT RULES TYPE DEFINITIONS
 * ============================================================================
 * Type system for defining business intelligence alert rules
 * 
 * Smart alerts analyze data against business rules and generate contextual
 * notifications when conditions are met.
 * 
 * @module lib/alerts/types/smartRules
 * @version 2.0.0
 */

import type { AlertSeverity, AlertMetadata, AlertAction, AlertContext } from '@/shared/alerts/types';

/**
 * Smart Alert Rule Definition
 * 
 * Defines a business rule that generates an alert when conditions are met.
 * Each rule is evaluated against data to determine if an alert should be created.
 * 
 * @template T - The data type this rule evaluates (e.g., MaterialItem, Product, Order)
 * 
 * @example
 * ```typescript
 * const lowStockRule: SmartAlertRule<MaterialItem> = {
 *   id: 'stock-low',
 *   name: 'Low Stock Warning',
 *   condition: (item) => item.stock > 0 && item.stock <= item.min_stock,
 *   severity: 'high',
 *   title: (item) => `${item.name}: Stock bajo (${item.stock} ${item.unit})`,
 *   description: (item) => `Nivel por debajo del mínimo (${item.min_stock} ${item.unit}).`,
 *   metadata: (item) => ({
 *     itemId: item.id,
 *     itemName: item.name,
 *     currentStock: item.stock,
 *     minThreshold: item.min_stock
 *   })
 * };
 * ```
 */
export interface SmartAlertRule<T = any> {
  /** Unique identifier for this rule */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Optional description of what this rule detects */
  description?: string;
  
  /**
   * Condition function: returns true if alert should be generated
   * 
   * @param data - The data item to evaluate
   * @param context - Optional additional context (e.g., related data, user settings)
   * @returns true if condition is met, false otherwise
   */
  condition: (data: T, context?: any) => boolean;
  
  /**
   * Alert severity when condition is met
   */
  severity: AlertSeverity;
  
  /**
   * Generate alert title from data
   * 
   * @param data - The data item that triggered the alert
   * @returns Alert title string
   */
  title: (data: T) => string;
  
  /**
   * Generate alert description from data
   * 
   * @param data - The data item that triggered the alert
   * @returns Alert description string (can be markdown)
   */
  description: (data: T) => string;
  
  /**
   * Generate alert metadata from data
   * 
   * @param data - The data item that triggered the alert
   * @returns Alert metadata object with relevant context
   */
  metadata: (data: T) => AlertMetadata;
  
  /**
   * Optional: Priority for rule evaluation (higher = evaluated first)
   * Default: 0
   */
  priority?: number;
  
  /**
   * Optional: Auto-expire time in milliseconds
   * Default: null (never expires)
   */
  autoExpire?: number;
  
  /**
   * Optional: Whether alert should persist across sessions
   * Default: true (for smart alerts)
   */
  persistent?: boolean;
  
  /**
   * Optional: Generate alert actions from data
   * 
   * @param data - The data item that triggered the alert
   * @returns Array of alert actions
   */
  actions?: (data: T) => Omit<AlertAction, 'id'>[];
  
  /**
   * Optional: Tags for categorization
   */
  tags?: string[];
}

/**
 * Configuration for SmartAlertsEngine
 * 
 * Defines the rules and settings for a module's smart alert system.
 * 
 * @template T - The data type this engine evaluates
 */
export interface SmartAlertsEngineConfig<T = any> {
  /** Array of rules to evaluate */
  rules: SmartAlertRule<T>[];
  
  /** Module context for generated alerts */
  context: AlertContext;
  
  /**
   * Optional: Circuit breaker interval in milliseconds
   * Prevents evaluation more often than this interval
   * Default: 3000 (3 seconds)
   */
  circuitBreakerInterval?: number;
  
  /**
   * Optional: Maximum alerts to generate per evaluation
   * Prevents alert flooding
   * Default: 100
   */
  maxAlertsPerEvaluation?: number;
  
  /**
   * Optional: Enable debug logging
   * Default: false
   */
  debug?: boolean;
}

/**
 * Result from alert rule evaluation
 */
export interface RuleEvaluationResult {
  /** Rule that was evaluated */
  ruleId: string;
  
  /** Whether rule condition was met */
  matched: boolean;
  
  /** Evaluation time in milliseconds */
  evaluationTime: number;
  
  /** Error if evaluation failed */
  error?: Error;
}

/**
 * Statistics from engine evaluation
 */
export interface EngineEvaluationStats {
  /** Total rules evaluated */
  totalRules: number;
  
  /** Rules that matched */
  matchedRules: number;
  
  /** Alerts generated */
  alertsGenerated: number;
  
  /** Total evaluation time in milliseconds */
  totalTime: number;
  
  /** Individual rule results */
  ruleResults: RuleEvaluationResult[];
}

/**
 * Type guard to check if a rule is valid
 */
export function isValidSmartAlertRule<T>(rule: any): rule is SmartAlertRule<T> {
  return (
    typeof rule === 'object' &&
    typeof rule.id === 'string' &&
    typeof rule.name === 'string' &&
    typeof rule.condition === 'function' &&
    typeof rule.severity === 'string' &&
    typeof rule.title === 'function' &&
    typeof rule.description === 'function' &&
    typeof rule.metadata === 'function'
  );
}

/**
 * Helper type for rule condition functions
 */
export type RuleCondition<T> = (data: T, context?: any) => boolean;

/**
 * Helper type for rule generation functions
 */
export type RuleGenerator<T, R> = (data: T) => R;
