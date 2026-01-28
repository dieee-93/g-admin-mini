/**
 * useOnsiteEventListeners - EventBus integration hook
 *
 * Listens to cross-module events and updates onsite state accordingly.
 * Primary use case: update party.total_spent when orders are placed.
 *
 * @see docs/architecture-v2/deliverables/CROSS_MODULE_INTEGRATION_MAP.md
 */

import { useEffect, useCallback, useRef } from 'react';
import { eventBus } from '@/lib/events';
import { tablesApi } from '../services/tablesApi';
import { logger } from '@/lib/logging';
import type { OnsiteSaleContext } from '../events';

// ============================================
// TYPES
// ============================================

interface OrderPlacedEvent {
    payload: {
        orderId: string;
        total: number;
        context?: OnsiteSaleContext;
        items: Array<{
            product_id: string;
            product_name: string;
            quantity: number;
            unit_price: number;
        }>;
    };
}

interface UseOnsiteEventListenersOptions {
    /** Callback when a party's total is updated */
    onPartyTotalUpdated?: (partyId: string, newTotal: number) => void;
    /** Callback when order is received for a table */
    onOrderReceived?: (tableId: string, orderId: string) => void;
    /** Enable/disable listeners */
    enabled?: boolean;
}

// ============================================
// HOOK
// ============================================

export function useOnsiteEventListeners(options: UseOnsiteEventListenersOptions = {}) {
    const {
        onPartyTotalUpdated,
        onOrderReceived,
        enabled = true
    } = options;

    // Use refs to avoid stale closures in event handlers
    const callbacksRef = useRef({ onPartyTotalUpdated, onOrderReceived });
    callbacksRef.current = { onPartyTotalUpdated, onOrderReceived };

    // ============================================
    // ORDER PLACED HANDLER
    // ============================================

    const handleOrderPlaced = useCallback(async (event: OrderPlacedEvent) => {
        const { payload } = event;
        const context = payload.context;

        // Only process onsite orders
        if (!context || context.type !== 'onsite') {
            return;
        }

        const { tableId, partyId } = context;
        const orderTotal = payload.total;

        logger.info('App', '📦 Order placed for table', {
            orderId: payload.orderId,
            tableId,
            partyId,
            orderTotal
        });

        try {
            // Update party's total_spent in the database
            await tablesApi.updatePartyTotal(partyId, orderTotal);

            logger.info('App', '✅ Party total updated', { partyId, added: orderTotal });

            // Notify callbacks
            callbacksRef.current.onOrderReceived?.(tableId, payload.orderId);

            // The new total would be fetched on next refresh
            // But we can notify the listener immediately with the added amount
            callbacksRef.current.onPartyTotalUpdated?.(partyId, orderTotal);

        } catch (error) {
            logger.error('App', '❌ Failed to update party total', error);
        }
    }, []);

    // ============================================
    // SUBSCRIBE TO EVENTS
    // ============================================

    useEffect(() => {
        if (!enabled) return;

        logger.debug('App', '🎧 Subscribing to sales.order_placed events');

        // Subscribe to order placed events
        const unsubscribe = eventBus.subscribe(
            'sales.order_placed',
            handleOrderPlaced as (event: unknown) => void
        );

        return () => {
            logger.debug('App', '🔇 Unsubscribing from sales.order_placed events');
            unsubscribe();
        };
    }, [enabled, handleOrderPlaced]);

    // ============================================
    // RETURN
    // ============================================

    return {
        // Currently no public API needed, but could expose:
        // - isListening: enabled
        // - manualRefresh: () => void
    };
}

export default useOnsiteEventListeners;
