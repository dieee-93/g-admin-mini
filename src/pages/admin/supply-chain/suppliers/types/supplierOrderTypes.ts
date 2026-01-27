/**
 * Supplier Orders Types
 * Types for purchase orders from suppliers with Event Sourcing support
 */

import type { Database } from '@/lib/supabase/database.types';

// Database types
export type SupplierOrder = Database['public']['Tables']['supplier_orders']['Row'];
export type SupplierOrderInsert = Database['public']['Tables']['supplier_orders']['Insert'];
export type SupplierOrderUpdate = Database['public']['Tables']['supplier_orders']['Update'];

export type SupplierOrderItem = Database['public']['Tables']['supplier_order_items']['Row'];
export type SupplierOrderItemInsert = Database['public']['Tables']['supplier_order_items']['Insert'];
export type SupplierOrderItemUpdate = Database['public']['Tables']['supplier_order_items']['Update'];

// Order status enum
export type OrderStatus = 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';

// Form data types
export interface SupplierOrderFormData {
  supplier_id: string;
  po_number: string;
  expected_delivery_date?: string;
  notes?: string;
  items: SupplierOrderItemFormData[];
}

export interface SupplierOrderItemFormData {
  material_id: string;
  material_name?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  notes?: string;
}

// Order with related data
export interface SupplierOrderWithDetails extends SupplierOrder {
  supplier?: {
    id: string;
    name: string;
    contact_name?: string;
  };
  items?: Array<SupplierOrderItem & {
    material?: {
      id: string;
      name: string;
      type: string;
      unit?: string;
    };
  }>;
}

// Receive order data
export interface ReceiveOrderData {
  order_id: string;
  received_at: string;
  notes?: string;
  items: ReceiveOrderItemData[];
}

export interface ReceiveOrderItemData {
  order_item_id: string;
  material_id: string;
  received_quantity: number;
  unit_cost: number;
  notes?: string;
}

// Event Sourcing metadata
export interface OrderEventMetadata {
  event_type: 'order_created' | 'order_approved' | 'order_received' | 'order_cancelled';
  user_id: string;
  order_id: string;
  supplier_id: string;
  po_number?: string;
  total_amount: number;
  items_count: number;
  business_context?: {
    reason?: string;
    approved_by?: string;
    received_by?: string;
  };
  audit_trail?: {
    ip_address?: string;
    user_agent?: string;
    timestamp: string;
  };
}

// API response types
export interface CreateOrderResponse {
  order: SupplierOrder;
  items: SupplierOrderItem[];
}

export interface ReceiveOrderResponse {
  order: SupplierOrder;
  stock_entries: Array<{
    id: string;
    material_id: string;
    quantity: number;
    created_at: string;
  }>;
}

// Filters and sorting
export interface OrderFilters {
  status?: OrderStatus[];
  supplier_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface OrderSort {
  field: 'expected_delivery_date' | 'total_amount' | 'created_at';
  direction: 'asc' | 'desc';
}