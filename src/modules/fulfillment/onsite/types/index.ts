/**
 * Onsite Fulfillment Types
 *
 * Floor Management & Table Operations
 * Following project patterns from delivery/types
 */

// ============================================
// CORE ENUMS
// ============================================

export enum TableStatus {
    AVAILABLE = 'available',
    OCCUPIED = 'occupied',
    RESERVED = 'reserved',
    CLEANING = 'cleaning',
    READY_FOR_BILL = 'ready_for_bill',
    MAINTENANCE = 'maintenance'
}

export enum TablePriority {
    NORMAL = 'normal',
    HIGH = 'high',
    VIP = 'vip',
    URGENT = 'urgent',
    ATTENTION_NEEDED = 'attention_needed'
}

export enum PartyStatus {
    WAITING = 'waiting',
    SEATED = 'seated',
    ORDERING = 'ordering',
    SERVED = 'served',
    BILLING = 'billing',
    COMPLETED = 'completed'
}

// ============================================
// CORE TYPES
// ============================================

/**
 * Party - A group of customers at a table
 */
export interface Party {
    id: string;
    table_id: string;
    size: number;
    customer_name?: string;
    primary_customer_name?: string;  // Alias for customer_name
    status: PartyStatus | string;
    seated_at: string;
    estimated_duration: number;  // In minutes
    total_spent: number;
    notes?: string;
    created_at: string;
    updated_at?: string;
}

/**
 * Table - Restaurant table configuration and state
 */
export interface Table {
    id: string;
    number: string;
    capacity: number;
    status: TableStatus | string;
    priority: TablePriority | string;
    location?: string;
    section?: string;
    position?: number;  // For drag & drop ordering

    // Stats
    turn_count: number;
    daily_revenue: number;

    // Current party (joined from parties table)
    current_party?: Party | null;

    // All parties history (if fetched)
    parties?: Party[];

    created_at?: string;
    updated_at?: string;
}

/**
 * Table with required current_party (for occupied tables)
 */
export interface OccupiedTable extends Table {
    status: TableStatus.OCCUPIED;
    current_party: Party;
}

// ============================================
// METRICS & STATS
// ============================================

export interface FloorMetrics {
    total_tables: number;
    available_tables: number;
    occupied_tables: number;
    reserved_tables: number;
    cleaning_tables: number;

    total_parties_today: number;
    total_revenue_today: number;
    average_party_size: number;
    average_duration_minutes: number;

    occupancy_rate: number;  // 0-100
    turnover_rate: number;   // Parties per table today
}

export interface TableStats {
    table_id: string;
    turns_today: number;
    revenue_today: number;
    average_party_size: number;
    average_duration_minutes: number;
}

// ============================================
// RESERVATIONS
// ============================================

export interface Reservation {
    id: string;
    table_id?: string;
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    party_size: number;
    scheduled_time: string;
    duration_minutes: number;
    status: ReservationStatus;
    notes?: string;
    created_at: string;
    updated_at?: string;
}

export enum ReservationStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    SEATED = 'seated',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    NO_SHOW = 'no_show'
}

// ============================================
// FORM DATA TYPES
// ============================================

/**
 * Data needed to seat a new party
 */
export interface SeatPartyData {
    size: number;
    customer_name?: string;
    estimated_duration: number;
    notes?: string;
}

/**
 * Data for creating/updating a reservation
 */
export interface CreateReservationData {
    table_id?: string;
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    party_size: number;
    scheduled_time: string;
    duration_minutes: number;
    notes?: string;
}

export interface UpdateReservationData extends Partial<CreateReservationData> {
    id: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface TablesResponse {
    tables: Table[];
    error?: string;
}

export interface TableResponse {
    table: Table;
    error?: string;
}

export interface MetricsResponse {
    metrics: FloorMetrics;
    error?: string;
}

// ============================================
// REAL-TIME EVENT TYPES
// ============================================

export interface TableChangeEvent {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    table: Table;
    old?: Table;
}

export interface PartyChangeEvent {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    party: Party;
    old?: Party;
}
