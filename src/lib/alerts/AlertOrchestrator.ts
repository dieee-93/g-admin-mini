import { moduleEventBus } from '@/shared/events/ModuleEventBus';
import { UniversalRuleEngine } from './universal/UniversalRuleEngine';
import { logger } from '@/lib/logging';
import { supabase } from '@/lib/supabase/client';

/**
 * Alert Orchestrator
 * 
 * Central coordinator for the alerting system.
 * Listens to ModuleEventBus events and triggers rule evaluations
 * using module-specific UniversalRuleEngine instances.
 */
export class AlertOrchestrator {
    private static instance: AlertOrchestrator;
    private engines: Map<string, UniversalRuleEngine> = new Map();
    private initialized = false;
    private organizationId: string | null = null;
    private handlers: Map<string, any> = new Map();
    private supabase = supabase;

    private constructor() { }

    /**
     * Get singleton instance
     */
    static getInstance(): AlertOrchestrator {
        if (!AlertOrchestrator.instance) {
            AlertOrchestrator.instance = new AlertOrchestrator();
        }
        return AlertOrchestrator.instance;
    }

    /**
     * Initialize the orchestrator with organization context
     */
    async initialize(organizationId: string) {
        // If already initialized for this org, skip
        if (this.initialized && this.organizationId === organizationId) return;

        this.organizationId = organizationId;

        // Only setup subscriptions once
        if (!this.initialized) {
            this.setupSubscriptions();
            this.initialized = true;
        }

        logger.info('Alerts', 'AlertOrchestrator initialized', { organizationId });
    }

    /**
     * Get or create a rule engine for a specific module
     */
    private getEngine(moduleName: string): UniversalRuleEngine {
        if (!this.organizationId) {
            throw new Error('AlertOrchestrator not initialized with organizationId');
        }

        if (!this.engines.has(moduleName)) {
            logger.info('Alerts', `[AlertOrchestrator] 🚀 Creating new engine for ${moduleName} with org: ${this.organizationId}`);
            const engine = new UniversalRuleEngine({
                organizationId: this.organizationId,
                moduleName: moduleName,
                debug: true // Forcing debug mode for runtime inspection
            });
            this.engines.set(moduleName, engine);
        }
        return this.engines.get(moduleName)!;
    }

    /**
     * Setup event listeners
     */
    private setupSubscriptions() {
        const busId = (moduleEventBus as any).id || 'TypedBus';
        logger.info('Alerts', `[AlertOrchestrator] Setting up subscriptions on bus: ${busId}`);

        // Payment Gateway Health Updates
        const paymentHandler = async (payload: any) => {
            logger.info('Alerts', '[AlertOrchestrator] 📥 RECEIVED event: payment.gateway_health_updated', payload);
            await this.handleModuleEvent('payment', payload);
        };
        this.handlers.set('payment.gateway_health_updated', paymentHandler);
        moduleEventBus.on('payment.gateway_health_updated', paymentHandler);

        // Fulfillment / Pickup Updates (Omni-Channel)
        const fulfillmentHandler = async (payload: any) => {
            // We listen to generic state changes or specific pickup events
            logger.info('Alerts', '[AlertOrchestrator] 📥 RECEIVED event: fulfillment.update', payload);
            await this.handleModuleEvent('fulfillment', payload);
        }
        // Subscribe to relevant fulfillment events
        // Note: Assuming these events exist or we add them. For now, we reuse the pattern.
        // In a real scenario, we might subscribe to 'sales.order_placed', 'fulfillment.status_changed', etc.
        // For Phase 2, we will assume 'fulfillment.queue_updated' or similar is emitted.
        this.handlers.set('fulfillment.queue_updated', fulfillmentHandler);
        moduleEventBus.on('fulfillment.queue_updated', fulfillmentHandler);

        if (this.handlers.size > 0) {
            logger.info('Alerts', `[AlertOrchestrator] ✅ Subscribed to ${this.handlers.size} channels`);
        }
    }

    /**
     * Enrich context with cross-module data
     */
    private async getEnrichedContext(moduleName: string, payload: any): Promise<any> {
        const baseContext = {
            organizationId: this.organizationId,
            moduleName: moduleName,
            data: payload,
            timestamp: new Date()
        };

        if (moduleName === 'fulfillment') {
            try {
                // Calculate Weighted Load for "Omni-Channel Capacity Surge"
                // Logic: (Pickups * 1.0) + (Tables * 2.5) + (Deliveries * 1.5)
                const { data: activeOrders, error } = await this.supabase
                    .from('fulfillment_queue')
                    .select('type, status')
                    .in('status', ['pending', 'in_progress', 'ready']);

                if (!error && activeOrders) {
                    const counts = activeOrders.reduce((acc: any, order: any) => {
                        acc[order.type] = (acc[order.type] || 0) + 1;
                        return acc;
                    }, {});

                    const pickupCount = counts['pickup'] || 0;
                    const tableCount = counts['onsite'] || 0; // Assuming 'onsite' mapped to tables
                    const deliveryCount = counts['delivery'] || 0;

                    const weightedLoad = (pickupCount * 1.0) + (tableCount * 2.5) + (deliveryCount * 1.5);

                    return {
                        ...baseContext,
                        weighted_load: weightedLoad,
                        pickup_count: pickupCount,
                        table_count: tableCount,
                        delivery_count: deliveryCount,
                        active_count: activeOrders.length,

                        // Helper fields for other rules (can be overridden by payload if present)
                        status: payload.status,
                        payment_status: payload.payment_status,
                        minutes_in_progress: payload.updated_at ? Math.floor((Date.now() - new Date(payload.updated_at).getTime()) / 60000) : 0,
                        // Simple Late Risk Calculation (if not in payload)
                        is_late_risk: payload.estimated_ready_time && payload.expected_time
                            ? new Date(payload.estimated_ready_time) > new Date(payload.expected_time)
                            : false
                    };
                }
            } catch (err) {
                logger.error('Alerts', 'Failed to enrich fulfillment context', err);
            }
        }

        return baseContext;
    }

    /**
     * Handle generic module event
     */
    private async handleModuleEvent(moduleName: string, payload: any) {
        if (!this.organizationId) {
            logger.warn('Alerts', `[AlertOrchestrator] Skipped event for ${moduleName}: No organizationId`);
            return;
        }

        try {
            logger.info('Alerts', `[AlertOrchestrator] Handling event for ${moduleName}`, { payload });
            const engine = this.getEngine(moduleName);

            // Context specific to this event with enrichment
            const context = await this.getEnrichedContext(moduleName, payload);

            // Evaluator expects flat values for fields like 'weighted_load' in the data object passed as first arg
            // AND/OR in the context. UniversalRuleEngine combines them.
            // Actually, UniversalRuleEngine.evaluate(data, context).
            // The engine looks up fields in data first, then context.
            // So we can pass the enriched fields in context or merged data.
            // Let's merge them into a single data object for evaluation ease.
            const evaluationData = { ...payload, ...context };

            // Evaluate rules against the payload
            logger.info('Alerts', `[AlertOrchestrator] Evaluating rules for ${moduleName}...Context enriched.`);
            const results = await engine.evaluate(evaluationData, context);

            if (results.length > 0) {
                logger.info('Alerts', `[AlertOrchestrator] Evaluation results for ${moduleName}:`, {
                    total: results.length,
                    triggered: results.filter(r => r.triggered).length
                });
            }

            // Execute actions for triggered rules (create alerts, send notifications)
            await engine.executeActions(results);

            // Log results
            const generatedAlerts = results.filter(r => r.triggered).length;
            logger.info('Alerts', `[AlertOrchestrator] Completed ${moduleName}. Generated ${generatedAlerts} alerts.`);

        } catch (error) {
            logger.error('Alerts', `Error handling event for module ${moduleName}`, { error });
        }
    }
}
