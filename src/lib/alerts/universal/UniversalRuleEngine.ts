/**
 * UNIVERSAL RULE ENGINE
 * ============================================================================
 * Core engine for evaluating universal alert rules across all g-mini modules
 * 
 * This engine:
 * - Loads rules from universal_alert_rules table (with RLS)
 * - Evaluates data against rule conditions
 * - Triggers actions when conditions are met
 * - Tracks rule execution statistics
 * 
 * @module lib/alerts/universal/UniversalRuleEngine
 * @version 1.0.0
 * 
 * @example
 * ```typescript
 * import { UniversalRuleEngine } from '@/lib/alerts/universal/UniversalRuleEngine';
 * 
 * const engine = new UniversalRuleEngine({
 *   organizationId: user.organizationId,
 *   moduleName: 'sales'
 * });
 * 
 * // Evaluate data against all active rules
 * const results = await engine.evaluate({ total: 15000, status: 'completed' });
 * 
 * // Trigger actions for matched rules
 * await engine.executeActions(results);
 * ```
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type {
    UniversalAlertRule,
    RuleEvaluationContext,
    RuleEvaluationResult,
    RuleEngineStats,
    UniversalRuleEngineConfig,
    RuleCondition,
    ThresholdCondition,
    ComparisonOperator,
    ComplexConditions,
    DynamicValue
} from './types';
import { isComplexConditions, isDynamicValue } from './types';

export class UniversalRuleEngine {
    private config: Required<UniversalRuleEngineConfig>;
    private cachedRules: UniversalAlertRule[] = [];
    private lastCacheUpdate: number = 0;
    private setCache = new Map<string, Set<any>>(); // Cache for 'in' operator optimization
    private stats: RuleEngineStats = {
        totalRulesEvaluated: 0,
        rulesTriggered: 0,
        evaluationTimeMs: 0,
        errorsEncountered: 0,
        lastEvaluationAt: new Date()
    };

    constructor(config: UniversalRuleEngineConfig) {
        this.config = {
            organizationId: config.organizationId,
            moduleName: config.moduleName || '',
            maxRulesPerBatch: config.maxRulesPerBatch || 100,
            debug: config.debug || false,
            circuitBreakerInterval: config.circuitBreakerInterval || 3000
        };

        this.validateConfig();
    }

    /**
     * Validate engine configuration
     */
    private validateConfig(): void {
        if (!this.config.organizationId) {
            throw new Error('UniversalRuleEngine: organizationId is required');
        }
    }

    /**
     * Load active rules from database (with RLS filter)
     */
    async loadRules(): Promise<UniversalAlertRule[]> {
        try {
            const now = Date.now();

            // Cache rules for 30 seconds to avoid excessive DB queries
            if (this.cachedRules.length > 0 && (now - this.lastCacheUpdate) < 30000) {
                return this.cachedRules;
            }

            let query = supabase
                .from('universal_alert_rules')
                .select('*')
                .eq('is_active', true)
                .eq('organization_id', this.config.organizationId)
                .order('priority', { ascending: true });

            // Filter by module if specified
            if (this.config.moduleName) {
                query = query.eq('module_name', this.config.moduleName);
            }

            const { data, error } = await query.limit(this.config.maxRulesPerBatch);

            if (error) {
                logger.error('Alerts', '[UniversalRuleEngine] ❌ Supabase error loading rules:', { error });
                throw error;
            }

            this.cachedRules = data || [];
            this.lastCacheUpdate = now;

            if (this.config.debug) {
                logger.debug('Alerts', `Loaded ${this.cachedRules.length} active rules`, {
                    organizationId: this.config.organizationId,
                    moduleName: this.config.moduleName
                });
            }

            return this.cachedRules;
        } catch (error) {
            logger.error('Alerts', 'Error loading rules', { error });
            return [];
        }
    }

    /**
     * Evaluate data against all active rules
     * 
     * @param data - The data to evaluate
     * @param context - Optional additional context
     * @returns Array of evaluation results
     */
    async evaluate(data: any, context?: Partial<RuleEvaluationContext>): Promise<RuleEvaluationResult[]> {
        try {
            // Load rules (uses cache if available)
            const rules = await this.loadRules();

            if (rules.length === 0) {
                if (this.config.debug) {
                    logger.debug('Alerts', 'No active rules to evaluate');
                }
                return [];
            }

            // Evaluate using the extracted method
            const results = await this.evaluateWithRules(rules, data, context);

            if (this.config.debug) {
                logger.debug('Alerts', 'Rule evaluation complete', {
                    rulesEvaluated: rules.length,
                    rulesTriggered: results.filter(r => r.triggered).length,
                    durationMs: this.stats.evaluationTimeMs
                });
            }

            return results;
        } catch (error) {
            logger.error('Alerts', 'Error during rule evaluation', { error });
            this.stats.errorsEncountered++;
            return [];
        }
    }

    /**
     * Evaluate data against a specific set of rules (bypassing DB load)
     * Useful for testing or when rules are already loaded/filtered
     * 
     * @param rules - The rules to evaluate
     * @param data - The data to evaluate
     * @param context - Optional additional context
     * @returns Array of evaluation results
     */
    public async evaluateWithRules(
        rules: UniversalAlertRule[],
        data: any,
        context?: Partial<RuleEvaluationContext>
    ): Promise<RuleEvaluationResult[]> {
        const startTime = performance.now();
        const results: RuleEvaluationResult[] = [];

        // Build evaluation context
        const evalContext: RuleEvaluationContext = {
            organizationId: this.config.organizationId,
            moduleName: this.config.moduleName,
            data,
            timestamp: new Date(),
            metadata: context?.metadata,
            ...context
        };

        // Evaluate each rule
        for (const rule of rules) {
            try {
                const result = await this.evaluateRule(rule, evalContext);
                results.push(result);

                if (result.triggered) {
                    this.stats.rulesTriggered++;

                    // Increment trigger count in DB
                    // Note: In tests we mock this, in production it hits DB
                    await this.incrementTriggerCount(rule.id);
                }
            } catch (error) {
                logger.error('Alerts', `Error evaluating rule ${rule.id}`, { error, ruleId: rule.id });
                this.stats.errorsEncountered++;
            }
        }

        // Update stats
        this.stats.totalRulesEvaluated += rules.length;
        this.stats.evaluationTimeMs = performance.now() - startTime;
        this.stats.lastEvaluationAt = new Date();

        return results;
    }

    /**
     * Evaluate a single rule against data
     */
    private async evaluateRule(
        rule: UniversalAlertRule,
        context: RuleEvaluationContext
    ): Promise<RuleEvaluationResult> {
        const condition = rule.conditions as unknown as RuleCondition;
        const { data } = context;

        // Validate complexity before evaluation
        this.validateComplexity(condition);

        // Evaluate condition (supports both simple and complex conditions)
        const triggered = this.evaluateCondition(condition, data);

        const result: RuleEvaluationResult = {
            ruleId: rule.id,
            triggered,
            severity: rule.severity as any,
            matchedCondition: triggered ? condition : undefined,
            evaluatedAt: new Date(),
            alertTitle: rule.rule_name,
            context: { ...context, data: typeof context.data === 'object' ? context.data : { value: context.data } }
        };

        if (triggered) {
            const actions = rule.actions as unknown as RuleAction;
            // Interpolate template variables in title and message
            const rawTitle = actions.title || rule.rule_name;
            const rawMessage = actions.message || `Rule ${rule.rule_name} triggered`;
            
            result.alertTitle = this.interpolateMessage(rawTitle, data);
            result.message = this.interpolateMessage(rawMessage, data);
            result.actions = actions; 
            
            result.metadata = {
                ruleName: rule.rule_name,
                ruleType: rule.rule_type,
                entity_id: data.id || data.gateway_name, // Standardized to snake_case
                link: actions.custom_data?.link 
            };
        }

        return result;
    }

    /**
     * Evaluate a condition (simple or complex)
     * Supports AND/OR logic with nesting
     */
    private evaluateCondition(condition: RuleCondition, data: any): boolean {
        // Check if complex condition (AND/OR)
        if (isComplexConditions(condition)) {
            return this.evaluateComplexCondition(condition, data);
        }

        // Simple condition evaluation
        const typedCondition = condition as any;
        const field = typedCondition.field;
        const operator = typedCondition.operator;
        let expectedValue = typedCondition.value;

        // Resolve dynamic value if applicable
        if (isDynamicValue(expectedValue)) {
            const baseValue = this.extractFieldValue(data, expectedValue.field);
            expectedValue = this.calculateDynamicValue(baseValue, expectedValue);
        }

        const actualValue = this.extractFieldValue(data, field);
        return this.compareValues(actualValue, operator, expectedValue);
    }

    /**
     * Calculate resolved value for DynamicValue
     */
    private calculateDynamicValue(baseValue: any, dynamicConfig: DynamicValue): any {
        if (baseValue === undefined || baseValue === null) {
            return undefined;
        }

        let result = baseValue;

        // Ensure strictly numeric operations
        const numValue = typeof result === 'number' ? result : parseFloat(result);

        if (!isNaN(numValue)) {
            if (dynamicConfig.multiplier !== undefined) {
                result = numValue * dynamicConfig.multiplier;
            }
            if (dynamicConfig.offset !== undefined) {
                // If we already multiplied, use that result, otherwise use original numValue
                const intermediate = typeof result === 'number' ? result : numValue;
                result = intermediate + dynamicConfig.offset;
            }
        }

        return result;
    }

    /**
     * Evaluate complex condition (AND/OR logic)
     * Uses short-circuit evaluation for optimization
     */
    private evaluateComplexCondition(condition: ComplexConditions, data: any): boolean {
        if (condition.AND) {
            // ALL conditions must be true (short-circuit on first false)
            return condition.AND.every(c => this.evaluateCondition(c, data));
        }

        if (condition.OR) {
            // ANY condition must be true (short-circuit on first true)
            return condition.OR.some(c => this.evaluateCondition(c, data));
        }

        logger.warn('Alerts', 'Complex condition has neither AND nor OR', { condition });
        return false;
    }

    /**
     * Extract field value from data object (supports dot notation)
     * 
     * @example
     * extractFieldValue({ user: { name: 'John' } }, 'user.name') // 'John'
     */
    private extractFieldValue(data: any, field: string): any {
        const parts = field.split('.');
        let value = data;

        for (const part of parts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                return undefined;
            }
        }

        return value;
    }

    /**
     * Compare two values using an operator
     * Supports: >, <, >=, <=, =, !=, between, in
     */
    private compareValues(actual: any, operator: ComparisonOperator, expected: any): boolean {
        // Handle undefined/null
        if (actual === undefined || actual === null) {
            return operator === '!=' ? expected !== null : false;
        }

        // Handle 'between' operator: value >= min && value <= max
        if (operator === 'between') {
            return this.evaluateBetween(actual, expected);
        }

        // Handle 'in' operator: value is in array
        if (operator === 'in') {
            return this.evaluateIn(actual, expected);
        }

        // Type coercion for numeric comparisons - ONLY if they look like numbers
        const actualIsNum = !isNaN(parseFloat(actual)) && isFinite(actual);
        const expectedIsNum = !isNaN(parseFloat(expected)) && isFinite(expected);

        if (actualIsNum && expectedIsNum) {
            const actualNum = parseFloat(actual);
            const expectedNum = parseFloat(expected);

            switch (operator) {
                case '>': return actualNum > expectedNum;
                case '<': return actualNum < expectedNum;
                case '>=': return actualNum >= expectedNum;
                case '<=': return actualNum <= expectedNum;
                case '=': return actualNum === expectedNum;
                case '!=': return actualNum !== expectedNum;
            }
        }

        // Default to direct comparison for strings/booleans/etc
        switch (operator) {
            case '=':
                return actual === expected;
            case '!=':
                return actual !== expected;
            case '>':
                return actual > expected;
            case '<':
                return actual < expected;
            default:
                logger.warn('Alerts', `Unknown or unsupported operator for non-numeric types: ${operator}`);
                return false;
        }
    }

    /**
     * Evaluate 'between' operator
     * Expects: [min, max] array
     */
    private evaluateBetween(value: any, range: any): boolean {
        if (!Array.isArray(range) || range.length !== 2) {
            logger.warn('Alerts', 'Invalid range for between operator', { range });
            return false;
        }

        const [min, max] = range;
        const numValue = typeof value === 'number' ? value : parseFloat(value);
        const numMin = typeof min === 'number' ? min : parseFloat(min);
        const numMax = typeof max === 'number' ? max : parseFloat(max);

        if (isNaN(numValue) || isNaN(numMin) || isNaN(numMax)) {
            return false;
        }

        // Validate range
        if (numMin > numMax) {
            logger.warn('Alerts', 'Invalid range: min > max', { min, max });
            return false;
        }

        return numValue >= numMin && numValue <= numMax;
    }

    /**
     * Evaluate 'in' operator with Set optimization
     * Optimized for large arrays (>100 elements)
     */
    private evaluateIn(value: any, array: any): boolean {
        if (!Array.isArray(array)) {
            logger.warn('Alerts', 'Invalid array for in operator', { array });
            return false;
        }

        // For small arrays (<100), use includes() - O(n) but no overhead
        if (array.length < 100) {
            return array.includes(value);
        }

        // For large arrays, use Set - O(1) lookup after O(n) conversion
        // Cache the Set to amortize conversion cost
        const cacheKey = JSON.stringify(array);
        if (!this.setCache.has(cacheKey)) {
            this.setCache.set(cacheKey, new Set(array));
        }

        const set = this.setCache.get(cacheKey)!;
        return set.has(value);
    }

    /**
     * Interpolate template variables in message string
     * Supports: {field_name} syntax with HTML escaping for XSS prevention
     * 
     * @example
     * interpolateMessage("Stock: {material_name}", { material_name: "Flour" })
     * // Returns: "Stock: Flour"
     */
    private interpolateMessage(template: string, data: Record<string, any>): string {
        return template.replace(/\{(\w+(?:\.\w+)*)\}/g, (_, key) => {
            const value = this.extractFieldValue(data, key);
            if (value === undefined || value === null) {
                return `{${key}}`; // Preserve placeholder if missing
            }
            return this.escapeHtml(String(value));
        });
    }

    /**
     * Escape HTML characters to prevent XSS
     */
    private escapeHtml(text: string): string {
        const map: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        return text.replace(/[&<>"'/]/g, (char) => map[char]);
    }

    /**
     * Validate condition complexity to prevent performance issues
     * Max 3 levels of nesting, 10 conditions per level
     */
    private validateComplexity(condition: RuleCondition, depth: number = 0): void {
        const MAX_DEPTH = 3;
        const MAX_CONDITIONS_PER_LEVEL = 10;

        if (depth > MAX_DEPTH) {
            throw new Error(`Rule complexity exceeds max nesting depth (${MAX_DEPTH})`);
        }

        if (isComplexConditions(condition)) {
            const complex = condition as ComplexConditions;
            const keys = Object.keys(complex) as ('AND' | 'OR')[];

            if (keys.length > 1) {
                throw new Error('Only one logical operator (AND/OR) allowed per level');
            }

            const operator = keys[0];
            const nested = complex[operator];

            if (!nested || nested.length === 0) {
                throw new Error(`Empty ${operator} condition`);
            }

            if (nested.length > MAX_CONDITIONS_PER_LEVEL) {
                throw new Error(`Max ${MAX_CONDITIONS_PER_LEVEL} conditions per level exceeded`);
            }

            // Recursively validate nested conditions
            nested.forEach(c => this.validateComplexity(c, depth + 1));
        }
    }

    /**
     * Increment trigger count for a rule in DB
     */
    private async incrementTriggerCount(ruleId: string): Promise<void> {
        try {
            // Note: Casting to any because database.types.ts may not have the correct RPC signature yet
            // This will be fixed when we regenerate types with: supabase gen types typescript
            await (supabase.rpc as any)('increment_rule_trigger_count', { p_rule_id: ruleId });
        } catch (error) {
            logger.error('Alerts', `Failed to increment trigger count for rule ${ruleId}`, { error });
        }
    }

    /**
     * Get engine statistics
     */
    getStats(): RuleEngineStats {
        return { ...this.stats };
    }

    /**
     * Reset engine statistics
     */
    resetStats(): void {
        this.stats = {
            totalRulesEvaluated: 0,
            rulesTriggered: 0,
            evaluationTimeMs: 0,
            errorsEncountered: 0,
            lastEvaluationAt: new Date()
        };
    }

    /**
     * Clear cached rules and Set cache (force reload on next evaluation)
     */
    clearCache(): void {
        this.cachedRules = [];
        this.lastCacheUpdate = 0;
        this.setCache.clear();
    }

    /**
     * Execute actions for triggered rules
     */
    async executeActions(results: RuleEvaluationResult[]): Promise<void> {
        const triggered = results.filter(r => r.triggered);

        if (triggered.length === 0) {
            return;
        }

        for (const result of triggered) {
            try {
                if (!result.actions) continue;

                const { notify, message } = result.actions;
                const interpolatedMessage = result.message || message;

                // 1. Create alert record in DB (always, for audit/display)
                await this.createAlertRecord(result, interpolatedMessage);

                // 2. Handle specific channels (Mock implementations for now)
                if (notify.includes('email')) {
                    logger.info('Alerts', `[EMAIL] To: ${result.actions.recipients?.join(', ') || 'Admin'} - ${interpolatedMessage}`);
                }

                if (notify.includes('slack')) {
                    logger.info('Alerts', `[SLACK] ${interpolatedMessage}`);
                }

                if (notify.includes('webhook') && result.actions.webhook_url) {
                    logger.info('Alerts', `[WEBHOOK] ${result.actions.webhook_url} - ${interpolatedMessage}`);
                }

            } catch (error) {
                logger.error('Alerts', `Failed to execute action for rule ${result.ruleId}`, { error });
            }
        }
    }

    /**
     * Create alert record in database
     */
    private async createAlertRecord(result: RuleEvaluationResult, message: string): Promise<void> {
        try {
            logger.info('Alerts', `[UniversalRuleEngine] Attempting to create alert record: ${result.alertTitle}`);
            
            // Deduplication Logic
            const entityId = result.metadata?.entity_id || result.context?.entity_id;
            const fingerprint = entityId ? `${result.ruleId}:${entityId}` : result.ruleId;

            // Check for existing active or acknowledged alert with same fingerprint
            const { data: existingAlerts } = await supabase
                .from('alerts')
                .select('id, status')
                .eq('organization_id', this.config.organizationId)
                .eq('fingerprint', fingerprint)
                .in('status', ['active', 'acknowledged', 'new']);

            if (existingAlerts && existingAlerts.length > 0) {
                logger.info('Alerts', `[UniversalRuleEngine] Skipping duplicate alert for fingerprint ${fingerprint} (Existing status: ${existingAlerts[0].status})`);
                return;
            }

            const alertData = {
                organization_id: this.config.organizationId,
                rule_id: result.ruleId,
                title: result.alertTitle || message.substring(0, 255),
                description: message,
                severity: result.severity,
                status: 'active', 
                type: 'rule_alert',
                context: this.config.moduleName || 'global',
                module_name: this.config.moduleName,
                metadata: result.metadata || {},
                fingerprint: fingerprint,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            logger.info('Alerts', '[UniversalRuleEngine] Inserting alert data:', alertData);

            const { error } = await supabase
                .from('alerts')
                .insert(alertData as any);

            if (error) {
                logger.error('Alerts', `[UniversalRuleEngine] Failed to persist alert to database`, { error, alertData });
            } else {
                logger.info('Alerts', `[UniversalRuleEngine] Alert created successfully in DB: ${result.alertTitle}`);
            }
        } catch (error) {
            logger.error('Alerts', `[UniversalRuleEngine] Exception creating alert record`, { error });
        }
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
    UniversalRuleEngineConfig,
    RuleEvaluationContext,
    RuleEvaluationResult,
    RuleEngineStats
};
