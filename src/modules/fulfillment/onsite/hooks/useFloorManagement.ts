/**
 * useFloorManagement - Main orchestration hook
 * 
 * Manages table data, real-time subscriptions, and actions
 * Following project patterns from delivery/hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { notify } from '@/lib/notifications';
import { eventBus } from '@/lib/events';
import { logger } from '@/lib/logging';
import { tablesApi } from '../services/tablesApi';
import type { Table, SeatPartyData, TableStatus } from '../types';

interface UseFloorManagementOptions {
    /** Trigger refresh externally */
    refreshTrigger?: number;
    /** Enable real-time subscriptions */
    realtime?: boolean;
}

interface UseFloorManagementReturn {
    // Data
    tables: Table[];

    // State
    loading: boolean;
    error: string | null;

    // Actions
    refresh: () => Promise<void>;
    updateStatus: (tableId: string, status: TableStatus | string) => Promise<void>;
    seatParty: (tableId: string, data: SeatPartyData) => Promise<void>;
    completeParty: (partyId: string, tableId: string) => Promise<void>;
    reorderTables: (newOrder: Table[]) => void;
}

export function useFloorManagement(
    options: UseFloorManagementOptions = {}
): UseFloorManagementReturn {
    const { refreshTrigger, realtime = true } = options;

    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load tables
    const loadTables = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await tablesApi.getTables();
            setTables(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error loading tables';
            setError(message);
            logger.error('useFloorManagement', message, err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Refresh action
    const refresh = useCallback(async () => {
        await loadTables();
        notify.success({ title: 'Data refreshed' });
    }, [loadTables]);

    // Update table status
    const updateStatus = useCallback(async (tableId: string, status: TableStatus | string) => {
        try {
            await tablesApi.updateStatus(tableId, status);

            // Optimistic update
            setTables(prev => prev.map(t =>
                t.id === tableId ? { ...t, status } : t
            ));

            notify.success({ title: 'Estado actualizado correctamente' });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error updating status';
            notify.error({ title: 'Error al cambiar estado', description: message });
            logger.error('useFloorManagement', message, err);
            throw err;
        }
    }, []);

    // Seat a new party
    const seatParty = useCallback(async (tableId: string, data: SeatPartyData) => {
        try {
            const party = await tablesApi.seatParty(tableId, data);

            // Optimistic update
            setTables(prev => prev.map(t =>
                t.id === tableId
                    ? { ...t, status: 'occupied' as TableStatus, current_party: party }
                    : t
            ));

            notify.success({ title: 'Party registrado exitosamente' });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error seating party';
            notify.error({ title: 'Error al registrar party', description: message });
            logger.error('useFloorManagement', message, err);
            throw err;
        }
    }, []);

    // Reorder tables (for drag & drop)
    const reorderTables = useCallback((newOrder: Table[]) => {
        setTables(newOrder);
        // TODO: Persist order to DB when position field is ready
    }, []);

    // Complete a party (close table)
    const completeParty = useCallback(async (
        partyId: string,
        tableId: string,
        payments: Array<{ type: 'cash' | 'card' | 'transfer'; amount: number }> = []
    ) => {
        // Find table and party data for event payload
        const table = tables.find(t => t.id === tableId);
        const party = table?.current_party?.id === partyId ? table.current_party : null;

        try {
            await tablesApi.completeParty(partyId, tableId);

            // Emit completion event for cross-module integration
            if (table && party) {
                eventBus.emit('fulfillment.party_completed', {
                    partyId,
                    tableId,
                    tableNumber: table.number,
                    totalSpent: party.total_spent,
                    durationMinutes: Math.floor((Date.now() - new Date(party.seated_at).getTime()) / 60000),
                    paymentMethods: payments,
                    customerName: party.customer_name,
                    partySize: party.size,
                    ordersCount: 0, // TODO: Get actual count if possible
                    closedAt: new Date().toISOString()
                });
            }

            // Optimistic update
            setTables(prev => prev.map(t =>
                t.id === tableId
                    ? { ...t, status: 'cleaning' as TableStatus, current_party: null }
                    : t
            ));

            notify.success({ title: 'Mesa cerrada correctamente' });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error closing table';
            notify.error({ title: 'Error al cerrar mesa', description: message });
            logger.error('useFloorManagement', message, err);
            throw err;
        }
    }, [tables]);

    // Initial load
    useEffect(() => {
        loadTables();
    }, [loadTables, refreshTrigger]);

    // Real-time subscription
    useEffect(() => {
        if (!realtime) return;

        const channel = supabase
            .channel('floor-management')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tables' },
                (payload) => {
                    logger.debug('useFloorManagement', 'Table change received', payload);
                    // Reload all tables to ensure consistency
                    loadTables();
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'parties' },
                (payload) => {
                    logger.debug('useFloorManagement', 'Party change received', payload);
                    loadTables();
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [realtime, loadTables]);

    return {
        tables,
        loading,
        error,
        refresh,
        updateStatus,
        seatParty,
        completeParty,
        reorderTables
    };
}
