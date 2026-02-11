import { supabase } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import type { Alert, AlertStatus, AlertSeverity, AlertType, AlertContext, IntelligenceLevel, AlertMetadata } from '@/shared/alerts/types';
import type { Database } from '@/lib/supabase/database.types';
import { logger } from '@/lib/logging';

type AlertCallback = (payload: Alert) => void;
// Define the exact Update type for the alerts table
type AlertUpdate = Database['public']['Tables']['alerts']['Update'];

class AlertRealtimeService {
    private channel: RealtimeChannel | null = null;
    private subscribers: Set<AlertCallback> = new Set();
    private isConnected = false;
    private organizationId: string | null = null;

    /**
     * Subscribe to realtime alerts for a specific organization
     */
    public subscribe(organizationId: string, callback: AlertCallback): () => void {
        this.subscribers.add(callback);

        // If not connected or org changed, reconnect
        if (!this.isConnected || this.organizationId !== organizationId) {
            this.connect(organizationId);
        }

        // Return unsubscribe function
        return () => {
            this.subscribers.delete(callback);
            if (this.subscribers.size === 0) {
                this.disconnect();
            }
        };
    }

    private async connect(organizationId: string) {
        if (this.channel) {
            await this.disconnect();
        }

        this.organizationId = organizationId;

        logger.debug('Alerts', `Connecting to realtime channel for org: ${organizationId}`);

        this.channel = supabase
            .channel(`alerts:${organizationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'alerts',
                    filter: `organization_id=eq.${organizationId}`
                },
                (payload) => {
                    logger.info('Alerts', '🔥 REALTIME: New alert detected in DB!', payload.new);
                    const raw = payload.new as any;

                    // Map raw DB payload to UI Alert type
                    const newAlert: Alert = {
                        id: raw.id,
                        title: raw.title,
                        description: raw.description, // mapped from description
                        severity: raw.severity as AlertSeverity,
                        type: raw.type as AlertType,
                        status: raw.status as AlertStatus,
                        context: raw.context as AlertContext,
                        intelligence_level: (raw.intelligence_level as IntelligenceLevel) || 'simple',
                        metadata: raw.metadata as AlertMetadata,
                        createdAt: new Date(raw.created_at),
                        updatedAt: new Date(raw.updated_at),
                        readAt: raw.status === 'read' ? new Date(raw.updated_at) : undefined, // infer readAt
                        organization_id: raw.organization_id,
                        module_name: raw.module_name,
                        entity_id: raw.entity_id,
                        rule_id: raw.rule_id,
                        isRecurring: raw.is_recurring ?? false,
                        recurrencePattern: raw.recurrence_pattern,
                        // Defaults
                        actions: [], // Realtime payload might not include actions relation, need to fetch? usually empty on create
                        tags: []
                    };

                    logger.debug('Alerts', 'Realtime alert received', { id: newAlert.id });
                    this.notifySubscribers(newAlert);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    this.isConnected = true;
                    logger.debug('Alerts', 'Successfully subscribed to realtime alerts');
                } else if (status === 'CHANNEL_ERROR') {
                    this.isConnected = false;
                    logger.error('Alerts', 'Realtime subscription error');
                }
            });
    }

    private async disconnect() {
        if (this.channel) {
            await supabase.removeChannel(this.channel);
            this.channel = null;
            this.isConnected = false;
            this.organizationId = null;
        }
    }

    private notifySubscribers(alert: Alert) {
        this.subscribers.forEach(callback => {
            try {
                callback(alert);
            } catch (error) {
                logger.error('Alerts', 'Error in alert subscriber callback', { error });
            }
        });
    }

    /**
     * Mark an alert as read
     */
    public async markAsRead(alertId: string): Promise<void> {
        // Use strict type casting to AlertUpdate to ensure type safety
        const updatePayload: AlertUpdate = {
            status: 'read',
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('alerts')
            .update(updatePayload)
            .eq('id', alertId);

        if (error) {
            logger.error('Alerts', 'Failed to mark alert as read', { error, alertId });
            throw error;
        }
    }

    /**
     * Dismiss an alert (hide from default view)
     */
    public async dismiss(alertId: string): Promise<void> {
        // Use strict type casting to AlertUpdate to ensure type safety
        const updatePayload: AlertUpdate = {
            status: 'dismissed',
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('alerts')
            .update(updatePayload)
            .eq('id', alertId);

        if (error) {
            logger.error('Alerts', 'Failed to dismiss alert', { error, alertId });
            throw error;
        }
    }
}

export const alertRealtimeService = new AlertRealtimeService();
