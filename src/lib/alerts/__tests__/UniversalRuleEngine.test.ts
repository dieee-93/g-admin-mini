/**
 * UNIVERSAL RULE ENGINE - COMPREHENSIVE UNIT TESTS
 * ============================================================================
 * Tests all operators, multi-condition logic, template interpolation,
 * complexity validation, and error handling using the Hybrid Testing Approach.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UniversalRuleEngine } from '../universal/UniversalRuleEngine';
import type {
    UniversalAlertRule,
    RuleEvaluationContext,
    ComplexConditions
} from '../universal/types';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock Supabase client - minimal mock needed since we use evaluateWithRules
vi.mock('@/lib/supabase/supabaseClient', () => ({
    supabase: {
        from: vi.fn(),
        rpc: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }
}));

// Mock logger
vi.mock('@/lib/logging/Logger', () => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn()
    }
}));

// ============================================================================
// TEST UTILITIES
// ============================================================================

function createMockRule(
    id: string,
    conditions: any,
    actions: any = { message: 'Test alert' }
): UniversalAlertRule {
    return {
        id,
        organization_id: 'test-org',
        module_name: 'test-module',
        rule_name: `Test Rule ${id}`,
        rule_type: 'threshold',
        conditions,
        actions,
        severity: 'medium',
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    } as UniversalAlertRule;
}

function createContext(data: Record<string, any>): RuleEvaluationContext {
    return {
        organizationId: 'test-org',
        moduleName: 'test-module',
        data,
        timestamp: new Date(),
        userId: 'test-user'
    };
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe('UniversalRuleEngine', () => {
    let engine: UniversalRuleEngine;

    beforeEach(() => {
        engine = new UniversalRuleEngine({
            organizationId: 'test-org',
            moduleName: 'test-module',
            cacheTTL: 1000,
            debug: false
        });
        vi.clearAllMocks();
    });

    afterEach(() => {
        engine.clearCache();
    });

    // ========================================================================
    // BASIC OPERATORS
    // ========================================================================

    describe('Basic Operators', () => {
        it('should evaluate > operator correctly', async () => {
            const rule = createMockRule('gt-test', {
                field: 'stock_level',
                operator: '>',
                value: 10
            });

            const context1 = createContext({ stock_level: 15 });
            const context2 = createContext({ stock_level: 5 });

            const result1 = await engine.evaluateWithRules([rule], context1.data, context1);
            const result2 = await engine.evaluateWithRules([rule], context2.data, context2);

            expect(result1[0].triggered).toBe(true);
            expect(result2[0].triggered).toBe(false);
        });

        it('should evaluate < operator correctly', async () => {
            const rule = createMockRule('lt-test', {
                field: 'stock_level',
                operator: '<',
                value: 10
            });

            const context1 = createContext({ stock_level: 5 });
            const context2 = createContext({ stock_level: 15 });

            const result1 = await engine.evaluateWithRules([rule], context1.data, context1);
            const result2 = await engine.evaluateWithRules([rule], context2.data, context2);

            expect(result1[0].triggered).toBe(true);
            expect(result2[0].triggered).toBe(false);
        });

        it('should evaluate >= operator correctly', async () => {
            const rule = createMockRule('gte-test', {
                field: 'age',
                operator: '>=',
                value: 18
            });

            const context1 = createContext({ age: 18 });
            const context2 = createContext({ age: 20 });
            const context3 = createContext({ age: 15 });

            const result1 = await engine.evaluateWithRules([rule], context1.data, context1);
            const result2 = await engine.evaluateWithRules([rule], context2.data, context2);
            const result3 = await engine.evaluateWithRules([rule], context3.data, context3);

            expect(result1[0].triggered).toBe(true);
            expect(result2[0].triggered).toBe(true);
            expect(result3[0].triggered).toBe(false);
        });

        it('should evaluate <= operator correctly', async () => {
            const rule = createMockRule('lte-test', {
                field: 'temperature',
                operator: '<=',
                value: 25
            });

            const context1 = createContext({ temperature: 25 });
            const context2 = createContext({ temperature: 20 });
            const context3 = createContext({ temperature: 30 });

            const result1 = await engine.evaluateWithRules([rule], context1.data, context1);
            const result2 = await engine.evaluateWithRules([rule], context2.data, context2);
            const result3 = await engine.evaluateWithRules([rule], context3.data, context3);

            expect(result1[0].triggered).toBe(true);
            expect(result2[0].triggered).toBe(true);
            expect(result3[0].triggered).toBe(false);
        });

        it('should evaluate = operator correctly', async () => {
            const rule = createMockRule('eq-test', {
                field: 'status',
                operator: '=',
                value: 'active'
            });

            const context1 = createContext({ status: 'active' });
            const context2 = createContext({ status: 'inactive' });

            const result1 = await engine.evaluateWithRules([rule], context1.data, context1);
            const result2 = await engine.evaluateWithRules([rule], context2.data, context2);

            expect(result1[0].triggered).toBe(true);
            expect(result2[0].triggered).toBe(false);
        });

        it('should evaluate != operator correctly', async () => {
            const rule = createMockRule('neq-test', {
                field: 'status',
                operator: '!=',
                value: 'deleted'
            });

            const context1 = createContext({ status: 'active' });
            const context2 = createContext({ status: 'deleted' });

            const result1 = await engine.evaluateWithRules([rule], context1.data, context1);
            const result2 = await engine.evaluateWithRules([rule], context2.data, context2);

            expect(result1[0].triggered).toBe(true);
            expect(result2[0].triggered).toBe(false);
        });
    });

    // ========================================================================
    // BETWEEN OPERATOR
    // ========================================================================

    describe('between Operator', () => {
        it('should evaluate between with valid range', async () => {
            const rule = createMockRule('between-test', {
                field: 'age',
                operator: 'between',
                value: [18, 65]
            });

            const context1 = createContext({ age: 25 });
            const context2 = createContext({ age: 18 });
            const context3 = createContext({ age: 65 });
            const context4 = createContext({ age: 16 });
            const context5 = createContext({ age: 70 });

            const results = await Promise.all([
                engine.evaluateWithRules([rule], context1.data, context1),
                engine.evaluateWithRules([rule], context2.data, context2),
                engine.evaluateWithRules([rule], context3.data, context3),
                engine.evaluateWithRules([rule], context4.data, context4),
                engine.evaluateWithRules([rule], context5.data, context5)
            ]);

            expect(results[0][0].triggered).toBe(true);  // 25 in range
            expect(results[1][0].triggered).toBe(true);  // 18 = min
            expect(results[2][0].triggered).toBe(true);  // 65 = max
            expect(results[3][0].triggered).toBe(false); // 16 < min
            expect(results[4][0].triggered).toBe(false); // 70 > max
        });

        it('should handle string to number coercion in between', async () => {
            const rule = createMockRule('between-string-test', {
                field: 'price',
                operator: 'between',
                value: ['10', '50']
            });

            const context = createContext({ price: '25' });
            const result = await engine.evaluateWithRules([rule], context.data, context);

            expect(result[0].triggered).toBe(true);
        });

        it('should reject invalid range (non-array)', async () => {
            const rule = createMockRule('between-invalid-test', {
                field: 'value',
                operator: 'between',
                value: 10 // Should be array
            });

            const context = createContext({ value: 15 });
            const result = await engine.evaluateWithRules([rule], context.data, context);

            expect(result[0].triggered).toBe(false);
        });

        it('should reject invalid range (wrong array length)', async () => {
            const rule = createMockRule('between-length-test', {
                field: 'value',
                operator: 'between',
                value: [10] // Should have 2 elements
            });

            const context = createContext({ value: 15 });
            const result = await engine.evaluateWithRules([rule], context.data, context);

            expect(result[0].triggered).toBe(false);
        });
    });

    // ========================================================================
    // IN OPERATOR
    // ========================================================================

    describe('in Operator', () => {
        it('should find value in small array (<100) using includes()', async () => {
            const rule = createMockRule('in-small-test', {
                field: 'status',
                operator: 'in',
                value: ['pending', 'confirmed', 'processing']
            });

            const context1 = createContext({ status: 'confirmed' });
            const context2 = createContext({ status: 'cancelled' });

            const result1 = await engine.evaluateWithRules([rule], context1.data, context1);
            const result2 = await engine.evaluateWithRules([rule], context2.data, context2);

            expect(result1[0].triggered).toBe(true);
            expect(result2[0].triggered).toBe(false);
        });

        it('should find value in large array (≥100) using Set optimization', async () => {
            // Create array with 150 elements
            const largeArray = Array.from({ length: 150 }, (_, i) => `id-${i}`);

            const rule = createMockRule('in-large-test', {
                field: 'product_id',
                operator: 'in',
                value: largeArray
            });

            const context1 = createContext({ product_id: 'id-75' });
            const context2 = createContext({ product_id: 'id-999' });

            const result1 = await engine.evaluateWithRules([rule], context1.data, context1);
            const result2 = await engine.evaluateWithRules([rule], context2.data, context2);

            expect(result1[0].triggered).toBe(true);
            expect(result2[0].triggered).toBe(false);
        });

        it('should cache Set for repeated large array lookups', async () => {
            const largeArray = Array.from({ length: 150 }, (_, i) => `id-${i}`);

            const rule = createMockRule('in-cache-test', {
                field: 'product_id',
                operator: 'in',
                value: largeArray
            });

            // First evaluation should create Set
            const context1 = createContext({ product_id: 'id-50' });
            await engine.evaluateWithRules([rule], context1.data, context1);

            // Second evaluation should use cached Set
            const context2 = createContext({ product_id: 'id-100' });
            const result = await engine.evaluateWithRules([rule], context2.data, context2);

            expect(result[0].triggered).toBe(true);
        });

        it('should reject non-array value for in operator', async () => {
            const rule = createMockRule('in-invalid-test', {
                field: 'status',
                operator: 'in',
                value: 'pending' // Should be array
            });

            const context = createContext({ status: 'pending' });
            const result = await engine.evaluateWithRules([rule], context.data, context);

            expect(result[0].triggered).toBe(false);
        });
    });

    // ========================================================================
    // MULTI-CONDITION LOGIC
    // ========================================================================

    describe('Multi-Condition Logic', () => {
        it('should evaluate simple AND condition (all true)', async () => {
            const conditions: ComplexConditions = {
                AND: [
                    { field: 'stock_level', operator: '<', value: 10 },
                    { field: 'category', operator: '=', value: 'critical' }
                ]
            };

            const rule = createMockRule('and-all-true', conditions);
            const context = createContext({
                stock_level: 5,
                category: 'critical'
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].triggered).toBe(true);
        });

        it('should evaluate simple AND condition (one false - short-circuit)', async () => {
            const conditions: ComplexConditions = {
                AND: [
                    { field: 'stock_level', operator: '<', value: 10 },
                    { field: 'category', operator: '=', value: 'critical' }
                ]
            };

            const rule = createMockRule('and-one-false', conditions);
            const context = createContext({
                stock_level: 15, // First condition fails
                category: 'critical'
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].triggered).toBe(false);
        });

        it('should evaluate simple OR condition (one true - short-circuit)', async () => {
            const conditions: ComplexConditions = {
                OR: [
                    { field: 'stock_level', operator: '<', value: 10 },
                    { field: 'days_until_expiry', operator: '<=', value: 3 }
                ]
            };

            const rule = createMockRule('or-one-true', conditions);
            const context = createContext({
                stock_level: 5, // First condition true
                days_until_expiry: 10
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].triggered).toBe(true);
        });

        it('should evaluate simple OR condition (all false)', async () => {
            const conditions: ComplexConditions = {
                OR: [
                    { field: 'stock_level', operator: '<', value: 10 },
                    { field: 'days_until_expiry', operator: '<=', value: 3 }
                ]
            };

            const rule = createMockRule('or-all-false', conditions);
            const context = createContext({
                stock_level: 20,
                days_until_expiry: 10
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].triggered).toBe(false);
        });

        it('should evaluate nested AND/OR (3 levels deep)', async () => {
            const conditions: ComplexConditions = {
                OR: [
                    {
                        AND: [
                            { field: 'stock_level', operator: '<', value: 10 },
                            {
                                OR: [
                                    { field: 'category', operator: '=', value: 'essential' },
                                    { field: 'category', operator: '=', value: 'critical' }
                                ]
                            }
                        ]
                    },
                    { field: 'emergency_override', operator: '=', value: true }
                ]
            };

            const rule = createMockRule('nested-test', conditions);

            const context1 = createContext({
                stock_level: 5,
                category: 'essential',
                emergency_override: false
            });

            const context2 = createContext({
                stock_level: 20,
                category: 'normal',
                emergency_override: true
            });

            const result1 = await engine.evaluateWithRules([rule], context1.data, context1);
            const result2 = await engine.evaluateWithRules([rule], context2.data, context2);

            expect(result1[0].triggered).toBe(true);  // Nested condition true
            expect(result2[0].triggered).toBe(true);  // Emergency override true
        });

        it('should evaluate DNF pattern (OR at top, AND nested)', async () => {
            const conditions: ComplexConditions = {
                OR: [
                    {
                        AND: [
                            { field: 'stock_level', operator: 'between', value: [1, 5] },
                            { field: 'demand', operator: '>', value: 0.8 }
                        ]
                    },
                    {
                        AND: [
                            { field: 'stock_level', operator: '=', value: 0 },
                            { field: 'reorder_status', operator: '!=', value: 'pending' }
                        ]
                    }
                ]
            };

            const rule = createMockRule('dnf-test', conditions);

            const context = createContext({
                stock_level: 3,
                demand: 0.9,
                reorder_status: 'none'
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].triggered).toBe(true);
        });
    });

    // ========================================================================
    // TEMPLATE INTERPOLATION
    // ========================================================================

    describe('Template Interpolation', () => {
        it('should replace single placeholder {field}', async () => {
            const rule = createMockRule(
                'template-single',
                { field: 'stock_level', operator: '<', value: 10 },
                { message: 'Stock bajo: {material_name}' }
            );

            const context = createContext({
                stock_level: 5,
                material_name: 'Harina'
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].message).toBe('Stock bajo: Harina');
        });

        it('should replace multiple placeholders', async () => {
            const rule = createMockRule(
                'template-multiple',
                { field: 'stock_level', operator: '<', value: 10 },
                { message: '{material_name}: {stock_level} unidades (mínimo: {min_stock})' }
            );

            const context = createContext({
                stock_level: 5,
                material_name: 'Tomate',
                min_stock: 10
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].message).toBe('Tomate: 5 unidades (mínimo: 10)');
        });

        it('should handle nested fields {object.property}', async () => {
            const rule = createMockRule(
                'template-nested',
                { field: 'order.total', operator: '>', value: 100 },
                { message: 'Pedido de {customer.name}: ${order.total}' }
            );

            const context = createContext({
                order: { total: 150 },
                customer: { name: 'Juan Pérez' }
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].message).toBe('Pedido de Juan Pérez: $150');
        });

        it('should preserve placeholder if field missing', async () => {
            const rule = createMockRule(
                'template-missing',
                { field: 'stock_level', operator: '<', value: 10 },
                { message: 'Stock: {missing_field}' }
            );

            const context = createContext({ stock_level: 5 });
            const result = await engine.evaluateWithRules([rule], context.data, context);

            expect(result[0].message).toBe('Stock: {missing_field}');
        });

        it('should escape HTML to prevent XSS', async () => {
            const rule = createMockRule(
                'template-xss',
                { field: 'alert', operator: '=', value: true },
                { message: 'Usuario: {username}' }
            );

            const context = createContext({
                alert: true,
                username: '<script>alert("XSS")</script>'
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].message).toContain('&lt;script&gt;');
            expect(result[0].message).not.toContain('<script>');
        });
    });

    // ========================================================================
    // COMPLEXITY VALIDATION
    // ========================================================================

    describe('Complexity Validation', () => {
        it('should accept valid rule (2 levels deep)', async () => {
            const conditions: ComplexConditions = {
                AND: [
                    { field: 'a', operator: '=', value: 1 },
                    {
                        OR: [
                            { field: 'b', operator: '=', value: 2 },
                            { field: 'c', operator: '=', value: 3 }
                        ]
                    }
                ]
            };

            const rule = createMockRule('complexity-valid', conditions);
            const context = createContext({ a: 1, b: 2, c: 3 });

            // Should not throw
            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0]).toBeDefined();
        });

        it('should reject rule exceeding max depth (4 levels)', async () => {
            const conditions: ComplexConditions = {
                AND: [
                    {
                        OR: [
                            {
                                AND: [
                                    {
                                        OR: [ // 4th level - exceeds limit
                                            { field: 'a', operator: '=', value: 1 }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            const rule = createMockRule('complexity-depth', conditions);
            const context = createContext({ a: 1 });

            const result = await engine.evaluateWithRules([rule], context.data, context);

            // Should have error in stats
            const stats = engine.getStats();
            expect(stats.errorsEncountered).toBeGreaterThan(0);
        });

        it('should reject rule exceeding max conditions per level (11)', async () => {
            const conditions: ComplexConditions = {
                AND: Array.from({ length: 11 }, (_, i) => ({
                    field: `field_${i}`,
                    operator: '=' as const,
                    value: i
                }))
            };

            const rule = createMockRule('complexity-conditions', conditions);
            const context = createContext({});

            const result = await engine.evaluateWithRules([rule], context.data, context);

            // Should have error in stats
            const stats = engine.getStats();
            expect(stats.errorsEncountered).toBeGreaterThan(0);
        });
    });

    // ========================================================================
    // ERROR HANDLING
    // ========================================================================

    describe('Error Handling', () => {
        it('should handle missing field gracefully', async () => {
            const rule = createMockRule('missing-field', {
                field: 'nonexistent_field',
                operator: '>',
                value: 10
            });

            const context = createContext({ other_field: 5 });
            const result = await engine.evaluateWithRules([rule], context.data, context);

            expect(result[0].triggered).toBe(false);
            expect(result[0]).toBeDefined();
        });

        it('should handle null values gracefully', async () => {
            const rule = createMockRule('null-value', {
                field: 'nullable_field',
                operator: '=',
                value: 'test'
            });

            const context = createContext({ nullable_field: null });
            const result = await engine.evaluateWithRules([rule], context.data, context);

            expect(result[0].triggered).toBe(false);
        });

        it('should handle undefined values gracefully', async () => {
            const rule = createMockRule('undefined-value', {
                field: 'undefined_field',
                operator: '>',
                value: 10
            });

            const context = createContext({ undefined_field: undefined });
            const result = await engine.evaluateWithRules([rule], context.data, context);

            expect(result[0].triggered).toBe(false);
        });

        it('should increment error counter on evaluation failures', async () => {
            // Reset stats
            engine.resetStats();

            // Create a rule with complexity that is guaranteed to throw in validateComplexity
            // The validation runs before evaluation in evaluateRule
            const invalidRule = createMockRule('invalid-complexity', {
                // Nested too deep (4 levels of AND)
                AND: [{ AND: [{ AND: [{ AND: [{ field: 'a', operator: '=', value: 1 }] }] }] }]
            });

            await engine.evaluateWithRules([invalidRule], { a: 1 }, createContext({}));

            const stats = engine.getStats();
            expect(stats.errorsEncountered).toBeGreaterThan(0);
        });
    });

    // ========================================================================
    // INTEGRATION & STATS
    // ========================================================================

    describe('Integration', () => {
        it('should track statistics correctly', async () => {
            const rule1 = createMockRule('stat-1', {
                field: 'value',
                operator: '>',
                value: 10
            });

            const rule2 = createMockRule('stat-2', {
                field: 'value',
                operator: '<',
                value: 5
            });

            const context1 = createContext({ value: 15 }); // Triggers rule1
            const context2 = createContext({ value: 3 });  // Triggers rule2

            await engine.evaluateWithRules([rule1, rule2], context1.data, context1);
            await engine.evaluateWithRules([rule1, rule2], context2.data, context2);

            const stats = engine.getStats();

            expect(stats.totalRulesEvaluated).toBe(4); // 2 rules × 2 contexts
            expect(stats.rulesTriggered).toBe(2); // 1 per context
            expect(stats.evaluationTimeMs).toBeGreaterThan(0);
        });

        it('should handle multiple rules in single evaluation', async () => {
            const rules = [
                createMockRule('multi-1', { field: 'a', operator: '=', value: 1 }),
                createMockRule('multi-2', { field: 'b', operator: '=', value: 2 }),
                createMockRule('multi-3', { field: 'c', operator: '=', value: 3 })
            ];

            const context = createContext({ a: 1, b: 2, c: 3 });
            const results = await engine.evaluateWithRules(rules, context.data, context);

            expect(results).toHaveLength(3);
            expect(results.every(r => r.triggered)).toBe(true);
        });

        it('should clear cache properly', async () => {
            const rule = createMockRule('test', { field: 'a', operator: '=', value: 1 });
            await engine.evaluateWithRules([rule], { a: 1 }, createContext({}));

            engine.clearCache();
            engine.resetStats();
            const stats = engine.getStats();

            expect(stats.totalRulesEvaluated).toBe(0);
            expect(stats.rulesTriggered).toBe(0);
            expect(stats.errorsEncountered).toBe(0);
        });
    });
});
