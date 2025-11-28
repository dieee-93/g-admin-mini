/**
 * SMART ALERTS ENGINE
 * ============================================================================
 * Base class for generating smart (Layer 2) alerts from business intelligence rules
 * 
 * This engine evaluates data against configurable rules and generates alerts
 * when conditions are met. It provides circuit breaker protection, performance
 * tracking, and batched alert creation.
 * 
 * @module lib/alerts/SmartAlertsEngine
 * @version 2.0.0
 * 
 * @example
 * ```typescript
 * // Define rules for your module
 * const rules: SmartAlertRule<MaterialItem>[] = [
 *   {
 *     id: 'stock-critical',
 *     name: 'Critical Stock Level',
 *     condition: (item) => item.stock === 0,
 *     severity: 'critical',
 *     title: (item) => `${item.name}: Sin stock`,
 *     description: (item) => 'Material sin existencias',
 *     metadata: (item) => ({ itemId: item.id, currentStock: 0 })
 *   }
 * ];
 * 
 * // Create engine instance
 * const engine = new SmartAlertsEngine({
 *   rules,
 *   context: 'materials',
 *   circuitBreakerInterval: 3000
 * });
 * 
 * // Evaluate data
 * const alerts = engine.evaluate(materialsData);
 * ```
 */

import type { CreateAlertInput, AlertType } from '@/shared/alerts/types';
import type {
  SmartAlertRule,
  SmartAlertsEngineConfig,
  RuleEvaluationResult,
  EngineEvaluationStats
} from './types/smartRules';
import { logger } from '@/lib/logging';

export class SmartAlertsEngine<T = any> {
  private config: Required<SmartAlertsEngineConfig<T>>;
  private lastEvaluation: number = 0;
  private evaluationCount: number = 0;

  constructor(config: SmartAlertsEngineConfig<T>) {
    // Apply defaults
    this.config = {
      rules: config.rules,
      context: config.context,
      circuitBreakerInterval: config.circuitBreakerInterval ?? 3000,
      maxAlertsPerEvaluation: config.maxAlertsPerEvaluation ?? 100,
      debug: config.debug ?? false
    };

    this.validateConfiguration();
  }

  /**
   * Validate engine configuration
   * @throws Error if configuration is invalid
   */
  private validateConfiguration(): void {
    if (!this.config.rules || this.config.rules.length === 0) {
      throw new Error('SmartAlertsEngine: No rules provided');
    }

    if (!this.config.context) {
      throw new Error('SmartAlertsEngine: Context is required');
    }

    // Validate each rule
    for (const rule of this.config.rules) {
      if (!rule.id || !rule.name || !rule.condition || !rule.severity) {
        throw new Error(`SmartAlertsEngine: Invalid rule configuration for rule ${rule.id || 'unknown'}`);
      }
    }
  }

  /**
   * Evaluate all rules against data and generate alerts
   * 
   * @param data - Single item or array of items to evaluate
   * @param globalContext - Optional global context for all evaluations
   * @returns Array of alert inputs ready to be created
   */
  evaluate(data: T | T[], globalContext?: any): CreateAlertInput[] {
    const startTime = performance.now();
    
    // Circuit breaker: prevent evaluation too frequently
    const now = Date.now();
    if ((now - this.lastEvaluation) < this.config.circuitBreakerInterval) {
      if (this.config.debug) {
        logger.debug('SmartAlertsEngine', `Evaluation blocked by circuit breaker (${this.config.context})`, {
          timeSinceLastEval: now - this.lastEvaluation,
          threshold: this.config.circuitBreakerInterval
        });
      }
      return [];
    }
    this.lastEvaluation = now;
    this.evaluationCount++;

    // Convert to array for uniform processing
    const dataArray = Array.isArray(data) ? data : [data];

    if (dataArray.length === 0) {
      if (this.config.debug) {
        logger.debug('SmartAlertsEngine', `No data to evaluate (${this.config.context})`);
      }
      return [];
    }

    const alerts: CreateAlertInput[] = [];
    const ruleResults: RuleEvaluationResult[] = [];

    // Sort rules by priority (higher first)
    const sortedRules = [...this.config.rules].sort((a, b) => 
      (b.priority || 0) - (a.priority || 0)
    );

    // Evaluate each rule against each data item
    for (const rule of sortedRules) {
      const ruleStartTime = performance.now();
      let matched = false;

      try {
        for (const item of dataArray) {
          // Evaluate condition
          const conditionMet = rule.condition(item, globalContext);

          if (conditionMet) {
            matched = true;

            // Check alert limit
            if (alerts.length >= this.config.maxAlertsPerEvaluation) {
              logger.warn('SmartAlertsEngine', `Max alerts limit reached (${this.config.maxAlertsPerEvaluation})`, {
                context: this.config.context,
                ruleId: rule.id
              });
              break;
            }

            // Generate alert
            const alert: CreateAlertInput = {
              type: this.inferAlertType(rule),
              severity: rule.severity,
              context: this.config.context,
              intelligence_level: 'smart',
              title: rule.title(item),
              description: rule.description(item),
              metadata: rule.metadata(item),
              persistent: rule.persistent ?? true,
              autoExpire: rule.autoExpire,
              actions: rule.actions?.(item)
            };

            alerts.push(alert);
          }
        }

        // Track rule result
        ruleResults.push({
          ruleId: rule.id,
          matched,
          evaluationTime: performance.now() - ruleStartTime
        });

      } catch (error) {
        logger.error('SmartAlertsEngine', `Rule evaluation failed: ${rule.id}`, {
          context: this.config.context,
          error
        });

        ruleResults.push({
          ruleId: rule.id,
          matched: false,
          evaluationTime: performance.now() - ruleStartTime,
          error: error instanceof Error ? error : new Error(String(error))
        });
      }
    }

    const totalTime = performance.now() - startTime;

    // Log statistics
    if (this.config.debug || alerts.length > 0) {
      logger.info('SmartAlertsEngine', `Evaluation complete (${this.config.context})`, {
        dataItems: dataArray.length,
        rulesEvaluated: sortedRules.length,
        alertsGenerated: alerts.length,
        totalTimeMs: totalTime.toFixed(2),
        evaluationNumber: this.evaluationCount
      });
    }

    return alerts;
  }

  /**
   * Get evaluation statistics
   * @returns Current evaluation statistics
   */
  getStats(): EngineEvaluationStats {
    return {
      totalRules: this.config.rules.length,
      matchedRules: 0, // Would need to track this
      alertsGenerated: 0, // Would need to track this
      totalTime: 0,
      ruleResults: []
    };
  }

  /**
   * Infer alert type from rule characteristics
   * @param rule - Rule to infer type from
   * @returns Inferred alert type
   */
  private inferAlertType(rule: SmartAlertRule<T>): AlertType {
    const ruleId = rule.id.toLowerCase();
    const ruleName = rule.name.toLowerCase();

    // Check rule ID and name for keywords
    if (ruleId.includes('stock') || ruleName.includes('stock') || 
        ruleId.includes('inventory') || ruleName.includes('inventory')) {
      return 'stock';
    }

    if (ruleId.includes('validation') || ruleName.includes('validation') ||
        ruleId.includes('invalid') || ruleName.includes('invalid')) {
      return 'validation';
    }

    if (ruleId.includes('security') || ruleName.includes('security') ||
        ruleId.includes('auth') || ruleName.includes('auth')) {
      return 'security';
    }

    if (ruleId.includes('system') || ruleName.includes('system') ||
        ruleId.includes('error') || ruleName.includes('error')) {
      return 'system';
    }

    if (ruleId.includes('operation') || ruleName.includes('operation') ||
        ruleId.includes('process') || ruleName.includes('process')) {
      return 'operational';
    }

    // Default to business type
    return 'business';
  }

  /**
   * Reset circuit breaker (useful for testing)
   */
  resetCircuitBreaker(): void {
    this.lastEvaluation = 0;
  }

  /**
   * Get engine configuration
   * @returns Current configuration
   */
  getConfig(): Readonly<Required<SmartAlertsEngineConfig<T>>> {
    return { ...this.config };
  }

  /**
   * Update engine configuration (rules cannot be changed after construction)
   * @param updates - Configuration updates
   */
  updateConfig(updates: Partial<Omit<SmartAlertsEngineConfig<T>, 'rules' | 'context'>>): void {
    if (updates.circuitBreakerInterval !== undefined) {
      this.config.circuitBreakerInterval = updates.circuitBreakerInterval;
    }
    if (updates.maxAlertsPerEvaluation !== undefined) {
      this.config.maxAlertsPerEvaluation = updates.maxAlertsPerEvaluation;
    }
    if (updates.debug !== undefined) {
      this.config.debug = updates.debug;
    }
  }
}

/**
 * Factory function to create a SmartAlertsEngine instance
 * @param config - Engine configuration
 * @returns SmartAlertsEngine instance
 */
export function createSmartAlertsEngine<T = any>(
  config: SmartAlertsEngineConfig<T>
): SmartAlertsEngine<T> {
  return new SmartAlertsEngine(config);
}

// Re-export types for convenience
export type { SmartAlertRule, SmartAlertsEngineConfig, RuleEvaluationResult, EngineEvaluationStats };
