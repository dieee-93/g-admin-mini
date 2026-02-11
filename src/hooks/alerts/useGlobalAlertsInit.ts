import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { moduleEventBus } from '@/shared/events/ModuleEventBus';
import { AlertOrchestrator } from '@/lib/alerts/AlertOrchestrator';
import { logger } from '@/lib/logging';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to initialize the global alert orchestrator and set up
 * system-wide event listeners that bridge Supabase Realtime to ModuleEventBus.
 */
export function useGlobalAlertsInit(organizationId: string | null) {
    const initialized = useRef(false);

    useEffect(() => {
        if (!organizationId || initialized.current) return;

        const init = async () => {
            try {
                logger.info('Alerts', '🚀 Initializing Global Alert Orchestrator', { organizationId });

                // 1. Initialize Orchestrator
                await AlertOrchestrator.getInstance().initialize(organizationId);

                // 2. Setup Payment Gateway Health Listener
                // This bridges Supabase Realtime changes to the internal EventBus
                logger.info('Alerts', '📡 Setting up Realtime listener for payment_gateway_health');
                const channel = supabase
                    .channel('payment-health-global')
                    .on(
                        'postgres_changes',
                        {
                            event: '*', // Listen to INSERT/UPDATE
                            schema: 'public',
                            table: 'payment_gateway_health'
                        },
                        (payload) => {
                            const newData = payload.new as any; // Cast to any or specific interface if available

                            logger.info('Alerts', '🔔 Realtime Event: Payment health changed', {
                                gateway: newData.gateway_name,
                                status: newData.status
                            });

                            // Emit to internal bus for logic processing
                            logger.info('Alerts', '🚌 Emitting to ModuleEventBus: payment.gateway_health_updated', newData);
                            moduleEventBus.emit('payment.gateway_health_updated', {
                                ...newData,
                                source: 'realtime'
                            });
                        }
                    )
                    .subscribe((status) => {
                        logger.info('Alerts', `Supabase Realtime subscription status: ${status}`);
                    });

                initialized.current = true;

                return () => {
                    supabase.removeChannel(channel);
                };
            } catch (error) {
                logger.error('Alerts', 'Failed to initialize global alerts', error);
            }
        };

        const cleanup = init();

        return () => {
            // Cleanup logic handled inside init via removeChannel if possible
        };
    }, [organizationId]);
}
