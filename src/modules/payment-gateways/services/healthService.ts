/**
 * PAYMENT GATEWAY HEALTH SERVICE
 * 
 * Client-side service to fetch and monitor payment gateway health status.
 * Integrates with AlertsProvider for proactive notifications.
 */

import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type {
    PaymentGatewayHealth,
    PaymentGatewayLimits,
    GatewayStatusSummary,
    PaymentGatewayHealthRow,
    PaymentGatewayLimitsRow,
    mapHealthToUI,
    mapLimitsToUI,
} from './types';

// Import mappers
import { mapHealthToUI as mapHealth, mapLimitsToUI as mapLimits } from './types';

const supabase = createClient();

/**
 * Fetch health status for all gateways
 */
export async function fetchAllGatewayHealth(): Promise<PaymentGatewayHealth[]> {
    try {
        const { data, error } = await (supabase.from('payment_gateway_health') as any)
            .select('*')
            .order('gateway_name', { ascending: true });

        if (error) {
            logger.error('PaymentGateways', 'Failed to fetch gateway health', error);
            throw error;
        }

        return (data || []).map((row: PaymentGatewayHealthRow) => mapHealth(row));
    } catch (error) {
        logger.error('PaymentGateways', 'fetchAllGatewayHealth error', error);
        return [];
    }
}

/**
 * Fetch API limits for all gateways
 */
export async function fetchAllGatewayLimits(): Promise<PaymentGatewayLimits[]> {
    try {
        const { data, error } = await (supabase.from('payment_gateway_limits') as any)
            .select('*')
            .order('gateway_name', { ascending: true });

        if (error) {
            logger.error('PaymentGateways', 'Failed to fetch gateway limits', error);
            throw error;
        }

        return (data || []).map((row: PaymentGatewayLimitsRow) => mapLimits(row));
    } catch (error) {
        logger.error('PaymentGateways', 'fetchAllGatewayLimits error', error);
        return [];
    }
}

/**
 * Fetch combined gateway status summary
 */
export async function fetchGatewayStatusSummary(): Promise<GatewayStatusSummary[]> {
    try {
        const [healthData, limitsData] = await Promise.all([
            fetchAllGatewayHealth(),
            fetchAllGatewayLimits(),
        ]);

        // Combine health and limits by gateway name
        const summaries: GatewayStatusSummary[] = healthData.map((health) => {
            const limits = limitsData.find((l) => l.gatewayName === health.gatewayName);

            if (!limits) {
                logger.warn('PaymentGateways', `No limits found for gateway: ${health.gatewayName}`);
                // Return a default limits object
                return {
                    gateway: health.gatewayName,
                    health,
                    limits: {
                        id: '',
                        gatewayName: health.gatewayName,
                        dailyLimit: 0,
                        currentUsage: 0,
                        resetAt: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        usagePercentage: 0,
                        remainingCalls: 0,
                    },
                    isHealthy: health.status === 'operational',
                    isNearLimit: false,
                    needsAttention: health.status !== 'operational',
                };
            }

            const isHealthy = health.status === 'operational';
            const isNearLimit = limits.usagePercentage > 80;
            const needsAttention = !isHealthy || isNearLimit;

            return {
                gateway: health.gatewayName,
                health,
                limits,
                isHealthy,
                isNearLimit,
                needsAttention,
            };
        });

        return summaries;
    } catch (error) {
        logger.error('PaymentGateways', 'fetchGatewayStatusSummary error', error);
        return [];
    }
}

/**
 * Trigger manual health check via Edge Function
 */
export async function triggerHealthCheck(gateway?: 'mercadopago' | 'stripe'): Promise<void> {
    try {
        logger.info('PaymentGateways', `Triggering health check${gateway ? ` for ${gateway}` : ''}`, { gateway });

        // Call Edge Function
        const { data, error } = await supabase.functions.invoke('payment-health-check', {
            body: gateway ? { gateway } : {},
        });

        if (error) {
            logger.error('PaymentGateways', 'Health check failed', error);
            throw error;
        }

        logger.info('PaymentGateways', 'Health check complete', data);
    } catch (error) {
        logger.error('PaymentGateways', 'triggerHealthCheck error', error);
        throw error;
    }
}
