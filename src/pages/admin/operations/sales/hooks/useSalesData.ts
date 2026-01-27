/**
 * MIGRATED: Sales Data Management Hook (V2)
 *
 * Uses the standard `useCrudOperations` pattern for:
 * - Real-time updates (via Supabase)
 * - Automatic Caching
 * - Deduplicated Requests
 * - Type Safety (via Zod + Types)
 *
 * @see src/hooks/core/useCrudOperations.ts
 * @see docs/cross-module/CROSS_MODULE_DATA_ARCHITECTURE.md
 */

import { useMemo } from 'react';
import { useCrudOperations } from '@/hooks/core/useCrudOperations';
import { EntitySchemas } from '@/lib/validation/zod/CommonSchemas';
import type { Sale } from '../types';

export function useSalesData() {
    // Use our unified CRUD system
    const crud = useCrudOperations<any>({
        tableName: 'sales',
        selectQuery: `
      *,
      sale_items (*),
      customer:customers (id, name, email),
      table:tables (id, name, number)
    `,
        // Use the CommonSchema for validation reference, though 'sales' table is slightly broader
        schema: EntitySchemas.sale,
        enableRealtime: true,
        cacheKey: 'sales_data',
        cacheTime: 2 * 60 * 1000, // 2 minutes cache (sales change often)
    });

    // Transform raw data to verified Sale objects
    const sales = useMemo<Sale[]>(() => {
        return crud.items.map(item => {
            // Ensure all required properties for the Sale interface are present
            return {
                ...item,
                // Ensure arrays are initialized
                sale_items: item.sale_items || [],
                // Ensure numeric values are safe
                total: Number(item.total || 0),
                subtotal: Number(item.subtotal || 0),
                tax_amount: Number(item.tax_amount || 0),
                discounts: Number(item.discounts || 0),
                // Map relationships if needed
                customer_name: item.customer?.name,
                table_name: item.table?.name
            } as Sale;
        });
    }, [crud.items]);

    // Derived Metrics (Memoized for performance)
    const metrics = useMemo(() => {
        const active = sales.filter(s => s.order_status !== 'completed' && s.order_status !== 'cancelled');
        const today = sales.filter(s => {
            const saleDate = new Date(s.created_at || Date.now());
            const today = new Date();
            return saleDate.getDate() === today.getDate() &&
                saleDate.getMonth() === today.getMonth() &&
                saleDate.getFullYear() === today.getFullYear();
        });

        return {
            activeCount: active.length,
            todayCount: today.length,
            todayTotal: today.reduce((sum, s) => sum + (s.total || 0), 0),
            weekTotal: sales
                .filter(s => {
                    const d = new Date(s.created_at || Date.now());
                    const now = new Date();
                    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return d >= oneWeekAgo && s.order_status === 'completed';
                })
                .reduce((sum, s) => sum + (s.total || 0), 0),
            monthTotal: sales
                .filter(s => {
                    const d = new Date(s.created_at || Date.now());
                    const now = new Date();
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && s.order_status === 'completed';
                })
                .reduce((sum, s) => sum + (s.total || 0), 0),
            monthCount: sales
                .filter(s => {
                    const d = new Date(s.created_at || Date.now());
                    const now = new Date();
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && s.order_status === 'completed';
                }).length
        };
    }, [sales]);

    return {
        // Data
        sales,
        loading: crud.loading,
        error: crud.error,

        // Metrics
        metrics,

        // Actions
        reloadSales: crud.refresh,
        refresh: crud.refresh, // Alias

        // CRUD Ops (Wrapped for Type Safety)
        createSale: async (data: Partial<Sale>) => {
            return await crud.create(data);
        },
        updateSale: async (id: string, data: Partial<Sale>) => {
            return await crud.update(id, data);
        },
        deleteSale: async (id: string) => {
            return await crud.remove(id);
        },

        // Status
        isRealtimeConnected: crud.isSubscribed
    };
}
