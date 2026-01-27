/**
 * Onsite Fulfillment Events
 *
 * EventBus event types for cross-module communication.
 * Following project patterns from CROSS_MODULE_INTEGRATION_MAP.md
 *
 * @see docs/architecture-v2/deliverables/CROSS_MODULE_INTEGRATION_MAP.md
 */

import type { Party, Table } from '../types';

// ============================================
// SALE CONTEXT (For HookPoint Injection)
// ============================================

/**
 * Context passed to sales modal when ordering for a table
 */
export interface OnsiteSaleContext {
    type: 'onsite';
    tableId: string;
    tableNumber: string;
    partyId: string;
    partySize: number;
    customerName?: string;
}

/**
 * Union type for all possible sale contexts
 * Other modules can extend this pattern
 */
export type SaleContext =
    | OnsiteSaleContext
    | { type: 'counter' }
    | { type: 'pickup'; pickupTime?: string }
    | { type: 'delivery'; addressId?: string }
    | { type: 'rental'; rentalPeriod?: { start: string; end: string } };

// ============================================
// EVENT PAYLOADS
// ============================================

/**
 * Payload for fulfillment.party_completed event
 * Emitted when a table's party is closed (paid and released)
 */
export interface PartyCompletedPayload {
    partyId: string;
    tableId: string;
    tableNumber: string;
    totalSpent: number;
    durationMinutes: number;
    paymentMethods: Array<{
        type: 'cash' | 'card' | 'transfer';
        amount: number;
    }>;
    customerName?: string;
    partySize: number;
    ordersCount: number;
    closedAt: string;
}

/**
 * Payload for fulfillment.table_updated event
 * Emitted when a table's status or data changes
 */
export interface TableUpdatedPayload {
    tableId: string;
    tableNumber: string;
    previousStatus: string;
    newStatus: string;
    currentParty?: Party;
    updatedBy?: string;
}

/**
 * Payload for fulfillment.order_received event
 * Emitted when onsite module receives a sales.order_placed event
 * This is internal to onsite module for logging/tracking
 */
export interface OnsiteOrderReceivedPayload {
    orderId: string;
    tableId: string;
    partyId: string;
    orderTotal: number;
    itemCount: number;
    receivedAt: string;
}

// ============================================
// EVENT NAMES (Type-safe constants)
// ============================================

export const ONSITE_EVENTS = {
    /** Emitted when a party finishes and pays */
    PARTY_COMPLETED: 'fulfillment.party_completed',

    /** Emitted when table status changes */
    TABLE_UPDATED: 'fulfillment.table_updated',

    /** Emitted when a table is selected for ordering */
    TABLE_SELECTED: 'fulfillment.onsite.table_selected',
} as const;

export type OnsiteEventName = typeof ONSITE_EVENTS[keyof typeof ONSITE_EVENTS];

// ============================================
// HOOKPOINT DATA INTERFACES
// ============================================

/**
 * Data passed to HookPoint: sales.pos.context_selector
 */
export interface POSContextSelectorData {
    cart: unknown[]; // Cart items from useSalesCart
    onContextSelect: (context: SaleContext) => void;
    initialContext?: SaleContext;
}

/**
 * Info about an occupied table for the selector
 */
export interface OccupiedTableInfo {
    id: string;
    number: string;
    currentParty: {
        id: string;
        size: number;
        customerName?: string;
        totalSpent: number;
        seatedAt: string;
    };
}
