
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UniversalRuleEngine } from '../universal/UniversalRuleEngine';
import type { UniversalAlertRule, RuleEvaluationContext } from '../universal/types';

// Mock Supabase client
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

function createMockRule(
    id: string,
    rule_name: string,
    conditions: any,
    actions: any = { message: 'Test alert' },
    severity: 'info' | 'warning' | 'error' | 'critical' = 'warning',
    metadata: any = {}
): UniversalAlertRule {
    return {
        id,
        organization_id: 'test-org',
        module_name: 'fulfillment',
        rule_name,
        rule_type: 'threshold',
        conditions,
        actions,
        severity,
        enabled: true,
        priority: 'high',
        intelligence_level: 'contextual', // As per seed
        metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    } as UniversalAlertRule;
}

function createContext(data: Record<string, any>): RuleEvaluationContext {
    return {
        organizationId: 'test-org',
        moduleName: 'fulfillment',
        data,
        timestamp: new Date(),
        userId: 'test-user'
    };
}

describe('Omni-Channel Operational Alerts', () => {
    let engine: UniversalRuleEngine;

    beforeEach(() => {
        engine = new UniversalRuleEngine({
            organizationId: 'test-org',
            moduleName: 'fulfillment',
            cacheTTL: 1000,
            debug: false
        });
        vi.clearAllMocks();
    });

    afterEach(() => {
        engine.clearCache();
    });

    // 1. Omni-Channel Capacity Surge
    // Logic: (Pickups * 1.0) + (Tables * 2.5) + (Deliveries * 1.5) > 20
    describe('Alert 1: Omni-Channel Capacity Surge', () => {
        const rule = createMockRule(
            'capacity_surge',
            'omni_capacity_surge',
            { field: 'weighted_load', operator: '>', value: 20 },
            { message: 'High load detected: {weighted_load}' },
            'warning',
            { category: 'capacity' }
        );

        it('should trigger when weighted load exceeds 20', async () => {
            // Scenario: 5 Pickups (5), 4 Tables (10), 4 Deliveries (6) = 21
            const context = createContext({
                weighted_load: 21.0,
                pickup_count: 5,
                table_count: 4,
                delivery_count: 4
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].triggered).toBe(true);
            expect(result[0].message).toContain('21');
        });

        it('should NOT trigger when weighted load is 20 or less', async () => {
            // Scenario: 5 Pickups (5), 4 Tables (10), 3 Deliveries (4.5) = 19.5
            const context = createContext({
                weighted_load: 19.5,
                pickup_count: 5,
                table_count: 4,
                delivery_count: 3
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].triggered).toBe(false);
        });
    });

    // 2. Unpaid Handover Risk
    // Logic: status='ready' AND payment_status!='paid'
    describe('Alert 2: Unpaid Handover Risk', () => {
        const rule = createMockRule(
            'unpaid_handover',
            'unpaid_handover_risk',
            {
                AND: [
                    { field: 'status', operator: '=', value: 'ready' },
                    { field: 'payment_status', operator: '!=', value: 'paid' }
                ]
            },
            { message: 'Order {orderId} is ready but unpaid!' },
            'critical',
            { category: 'financial' }
        );

        it('should trigger when order is READY but NOT PAID', async () => {
            const context = createContext({
                status: 'ready',
                payment_status: 'pending',
                orderId: 'ORD-123'
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].triggered).toBe(true);
            expect(result[0].severity).toBe('critical');
        });

        it('should NOT trigger when order is READY and PAID', async () => {
            const context = createContext({
                status: 'ready',
                payment_status: 'paid',
                orderId: 'ORD-123'
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].triggered).toBe(false);
        });

        it('should NOT trigger when order is NOT READY (even if unpaid)', async () => {
            const context = createContext({
                status: 'in_progress',
                payment_status: 'pending',
                orderId: 'ORD-123'
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].triggered).toBe(false);
        });
    });

    // 3. Stale Workflow / Kitchen Bottleneck
    // Logic: status='in_progress' AND minutes_in_progress > 45
    describe('Alert 3: Stale Workflow', () => {
        const rule = createMockRule(
            'stale_workflow',
            'stale_workflow',
            {
                AND: [
                    { field: 'status', operator: '=', value: 'in_progress' },
                    { field: 'minutes_in_progress', operator: '>', value: 45 }
                ]
            },
            { message: 'Order {orderId} stuck in kitchen for {minutes_in_progress}m' },
            'warning',
            { category: 'efficiency' }
        );

        it('should trigger when order is in_progress for > 45 mins', async () => {
            const context = createContext({
                status: 'in_progress',
                minutes_in_progress: 50,
                orderId: 'ORD-456'
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].triggered).toBe(true);
            expect(result[0].message).toContain('50m');
        });

        it('should NOT trigger when order is in_progress for < 45 mins', async () => {
            const context = createContext({
                status: 'in_progress',
                minutes_in_progress: 30,
                orderId: 'ORD-456'
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].triggered).toBe(false);
        });

        it('should NOT trigger when order is NOT in_progress', async () => {
            const context = createContext({
                status: 'ready',
                minutes_in_progress: 100, // Even if it took long, it's done now (or handled by another rule)
                // NOTE: Realistically, this rule checks current status. If it's ready, it's not "stuck" anymore.
                orderId: 'ORD-456'
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].triggered).toBe(false);
        });
    });

    // 4. Potentially Late Pickup
    // Logic: is_late_risk = true
    describe('Alert 4: Potentially Late Pickup', () => {
        const rule = createMockRule(
            'late_pickup',
            'late_pickup_risk',
            { field: 'is_late_risk', operator: '=', value: true },
            { message: 'Order {orderId} likely to miss pickup window' },
            'warning',
            { category: 'cx' }
        );

        it('should trigger when is_late_risk is true', async () => {
            const context = createContext({
                is_late_risk: true,
                orderId: 'ORD-789'
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].triggered).toBe(true);
        });

        it('should NOT trigger when is_late_risk is false', async () => {
            const context = createContext({
                is_late_risk: false,
                orderId: 'ORD-789'
            });

            const result = await engine.evaluateWithRules([rule], context.data, context);
            expect(result[0].triggered).toBe(false);
        });
    });
});
