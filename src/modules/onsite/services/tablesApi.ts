/**
 * Tables API Service
 * Handles all Supabase queries for table management
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type { Table, Party, SeatPartyData, TableStatus } from '../types';

export const tablesApi = {
    /**
     * Get all tables with their current party (if occupied)
     */
    async getTables(): Promise<Table[]> {
        try {
            const { data, error } = await supabase
                .from('tables')
                .select(`
          *,
          parties (
            id,
            size,
            customer_name,
            status,
            seated_at,
            estimated_duration,
            total_spent
          )
        `)
                .order('number');

            if (error) throw error;

            // Transform: find current seated party
            const tables: Table[] = (data || []).map((record) => ({
                id: record.id,
                number: record.number,
                capacity: record.capacity,
                status: record.status,
                priority: record.priority || 'normal',
                location: record.location,
                section: record.section,
                position: record.position,
                turn_count: record.turn_count || 0,
                daily_revenue: record.daily_revenue || 0,
                current_party: record.parties?.find((p: Party) => p.status === 'seated') || null,
                parties: record.parties,
                created_at: record.created_at,
                updated_at: record.updated_at
            }));

            logger.info('TablesApi', `Loaded ${tables.length} tables`);
            return tables;

        } catch (error) {
            logger.error('TablesApi', 'Failed to fetch tables:', error);
            throw error;
        }
    },

    /**
     * Get a single table by ID with its parties
     */
    async getTable(tableId: string): Promise<Table | null> {
        try {
            const { data, error } = await supabase
                .from('tables')
                .select(`
          *,
          parties (
            id,
            size,
            customer_name,
            status,
            seated_at,
            estimated_duration,
            total_spent
          )
        `)
                .eq('id', tableId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            const table: Table = {
                id: data.id,
                number: data.number,
                capacity: data.capacity,
                status: data.status,
                priority: data.priority || 'normal',
                location: data.location,
                section: data.section,
                position: data.position,
                turn_count: data.turn_count || 0,
                daily_revenue: data.daily_revenue || 0,
                current_party: data.parties?.find((p: Party) => p.status === 'seated') || null,
                parties: data.parties,
                created_at: data.created_at,
                updated_at: data.updated_at
            };

            return table;

        } catch (error) {
            logger.error('TablesApi', `Failed to fetch table ${tableId}:`, error);
            throw error;
        }
    },

    /**
     * Update table status
     */
    async updateStatus(tableId: string, status: TableStatus | string): Promise<void> {
        try {
            const { error } = await supabase
                .from('tables')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', tableId);

            if (error) throw error;

            logger.info('TablesApi', `Table ${tableId} status updated to ${status}`);

        } catch (error) {
            logger.error('TablesApi', `Failed to update table ${tableId} status:`, error);
            throw error;
        }
    },

    /**
     * Seat a new party at a table
     */
    async seatParty(tableId: string, partyData: SeatPartyData): Promise<Party> {
        try {
            // 1. Create party record
            const { data: party, error: partyError } = await supabase
                .from('parties')
                .insert([{
                    table_id: tableId,
                    size: partyData.size,
                    customer_name: partyData.customer_name || null,
                    status: 'seated',
                    seated_at: new Date().toISOString(),
                    estimated_duration: partyData.estimated_duration,
                    total_spent: 0,
                    notes: partyData.notes
                }])
                .select()
                .single();

            if (partyError) throw partyError;

            // 2. Update table status to occupied
            const { error: tableError } = await supabase
                .from('tables')
                .update({
                    status: 'occupied',
                    updated_at: new Date().toISOString()
                })
                .eq('id', tableId);

            if (tableError) throw tableError;

            logger.info('TablesApi', `Party seated at table ${tableId}`);
            return party as Party;

        } catch (error) {
            logger.error('TablesApi', `Failed to seat party at table ${tableId}:`, error);
            throw error;
        }
    },

    /**
     * Update table positions (for drag & drop ordering)
     */
    async updatePositions(updates: Array<{ id: string; position: number }>): Promise<void> {
        try {
            // Batch update using RPC if available, otherwise sequential updates
            const promises = updates.map(({ id, position }) =>
                supabase
                    .from('tables')
                    .update({ position, updated_at: new Date().toISOString() })
                    .eq('id', id)
            );

            const results = await Promise.all(promises);
            const errors = results.filter(r => r.error);

            if (errors.length > 0) {
                throw new Error(`Failed to update ${errors.length} table positions`);
            }

            logger.info('TablesApi', `Updated positions for ${updates.length} tables`);

        } catch (error) {
            logger.error('TablesApi', 'Failed to update table positions:', error);
            throw error;
        }
    },

    /**
     * Complete a party session (close table)
     */
    async completeParty(partyId: string, tableId: string): Promise<void> {
        try {
            // 1. Update party status
            const { error: partyError } = await supabase
                .from('parties')
                .update({
                    status: 'completed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', partyId);

            if (partyError) throw partyError;

            // 2. Set table to cleaning
            const { error: tableError } = await supabase
                .from('tables')
                .update({
                    status: 'cleaning',
                    updated_at: new Date().toISOString()
                })
                .eq('id', tableId);

            if (tableError) throw tableError;

            logger.info('TablesApi', `Party ${partyId} completed, table ${tableId} set to cleaning`);

        } catch (error) {
            logger.error('TablesApi', `Failed to complete party ${partyId}:`, error);
            throw error;
        }
    },

    /**
     * Update party's total_spent (increment by order amount)
     * Called when an order is placed for a table
     */
    async updatePartyTotal(partyId: string, orderAmount: number): Promise<void> {
        try {
            // First get current total
            const { data: currentParty, error: fetchError } = await supabase
                .from('parties')
                .select('total_spent')
                .eq('id', partyId)
                .single();

            if (fetchError) throw fetchError;

            const currentTotal = currentParty?.total_spent || 0;
            const newTotal = currentTotal + orderAmount;

            // Update with new total
            const { error: updateError } = await supabase
                .from('parties')
                .update({
                    total_spent: newTotal,
                    updated_at: new Date().toISOString()
                })
                .eq('id', partyId);

            if (updateError) throw updateError;

            logger.info('TablesApi', `Party ${partyId} total updated: ${currentTotal} → ${newTotal}`);

        } catch (error) {
            logger.error('TablesApi', `Failed to update party ${partyId} total:`, error);
            throw error;
        }
    }
};
