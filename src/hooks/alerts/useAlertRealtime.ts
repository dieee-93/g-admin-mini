import { useState, useEffect, useCallback } from 'react';
import { alertRealtimeService } from '@/lib/alerts/AlertRealtimeService';
import { Alert } from '@/lib/alerts/universal/types';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logging';

interface UseAlertRealtimeOptions {
    initialLimit?: number;
    autoSubscribe?: boolean;
}

export function useAlertRealtime(options: UseAlertRealtimeOptions = {}) {
    const { initialLimit = 50, autoSubscribe = true } = options;
    const { user, session } = useAuth();

    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [organizationId, setOrganizationId] = useState<string | null>(null);

    // Fetch initial alerts
    const fetchAlerts = useCallback(async (orgId: string) => {
        if (!orgId) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('alerts')
                .select('*')
                .eq('organization_id', orgId)
                .order('created_at', { ascending: false })
                .limit(initialLimit);

            if (error) throw error;

            if (data) {
                setAlerts(data as Alert[]);
                setUnreadCount(data.filter((a: Alert) => a.status === 'new').length);
            }
        } catch (err) {
            logger.error('Alerts', 'Failed to fetch alerts', { error: err });
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [initialLimit]);

    // Initialize Organisation ID from session/user
    useEffect(() => {
        const getOrgId = async () => {
            if (!user || !session) return;

            // 1. Try metadata
            let orgId = user.user_metadata?.organization_id;

            // 2. Fallback to DB if not in metadata
            if (!orgId) {
                try {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('organization_id')
                        .eq('id', user.id)
                        .single();
                    orgId = userData?.organization_id;
                } catch (e) {
                    logger.warn('Alerts', 'Failed to fetch org ID from DB', e);
                }
            }

            if (orgId) {
                setOrganizationId(orgId);
            }
        };

        getOrgId();
    }, [user, session]);

    // Setup subscription when Org ID is available
    useEffect(() => {
        if (!organizationId || !autoSubscribe) return;

        // Initial fetch
        fetchAlerts(organizationId);

        // Subscribe
        const unsubscribe = alertRealtimeService.subscribe(organizationId, (newAlert) => {
            setAlerts(prev => [newAlert, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            unsubscribe();
        };
    }, [organizationId, autoSubscribe, fetchAlerts]);

    const markAsRead = useCallback(async (alertId: string) => {
        try {
            // Optimistic update
            setAlerts(prev => prev.map(a =>
                a.id === alertId ? { ...a, status: 'read' as const } : a
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));

            await alertRealtimeService.markAsRead(alertId);
        } catch (err) {
            logger.error('Alerts', 'Failed to mark as read', { error: err });
            // Reload to ensure state consistency
            if (organizationId) fetchAlerts(organizationId);
        }
    }, [organizationId, fetchAlerts]);

    const dismiss = useCallback(async (alertId: string) => {
        try {
            // Optimistic update
            const alert = alerts.find(a => a.id === alertId);
            setAlerts(prev => prev.filter(a => a.id !== alertId));

            if (alert && alert.status === 'new') {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            await alertRealtimeService.dismiss(alertId);
        } catch (err) {
            logger.error('Alerts', 'Failed to dismiss', { error: err });
            if (organizationId) fetchAlerts(organizationId);
        }
    }, [organizationId, fetchAlerts, alerts]);

    return {
        alerts,
        unreadCount,
        loading,
        error,
        markAsRead,
        dismiss,
        refresh: () => organizationId && fetchAlerts(organizationId)
    };
}
