// ============================================
// SUPPLIER ORDERS TYPES - Core type definitions
// ============================================

import { z } from 'zod';
import type { Supplier } from '@/pages/admin/supply-chain/suppliers/types/supplierTypes';
import type { MaterialItem } from '@/pages/admin/supply-chain/materials/types';

// ============================================
// DATABASE TYPES
// ============================================

/**
 * Supplier Order Status
 */
export type SupplierOrderStatus =
  | 'draft'       // Initial creation, can be edited freely
  | 'pending'     // Submitted, waiting for approval
  | 'approved'    // Approved, sent to supplier
  | 'received'    // Materials received and stock updated
  | 'cancelled';  // Order cancelled

/**
 * Supplier Order entity from database
 */
export interface SupplierOrder {
  id: string;
  po_number: string;  // Auto-generated: PO-YYYYMMDD-XXXX
  supplier_id: string;
  status: SupplierOrderStatus;
  total_amount: number;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  notes: string | null;
  internal_notes: string | null;
  created_by: string | null;
  approved_by: string | null;
  received_by: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  received_at: string | null;
  cancelled_at: string | null;
}

/**
 * Supplier Order Item (line item)
 */
export interface SupplierOrderItem {
  id: string;
  supplier_order_id: string;
  material_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;  // Calculated: quantity * unit_cost
  received_quantity: number;
  notes: string | null;
  created_at: string;
}

/**
 * Supplier Order with relationships populated
 */
export interface SupplierOrderWithDetails extends SupplierOrder {
  supplier?: Supplier;
  items: SupplierOrderItemWithDetails[];
}

/**
 * Supplier Order Item with material details
 */
export interface SupplierOrderItemWithDetails extends SupplierOrderItem {
  material?: MaterialItem;
}

// ============================================
// FORM DATA TYPES
// ============================================

/**
 * Form data for creating/editing supplier order
 */
export interface SupplierOrderFormData {
  supplier_id: string;
  expected_delivery_date?: string;
  notes?: string;
  internal_notes?: string;
  items: SupplierOrderItemFormData[];
}

/**
 * Form data for order items
 */
export interface SupplierOrderItemFormData {
  material_id: string;
  quantity: number;
  unit_cost: number;
  notes?: string;
}

/**
 * Data for receiving an order
 */
export interface ReceiveOrderData {
  actual_delivery_date?: string;
  items: {
    id: string;  // item id
    received_quantity: number;
  }[];
  notes?: string;
}

// ============================================
// ZOD SCHEMAS
// ============================================

/**
 * Supplier Order Item schema
 */
export const SupplierOrderItemSchema = z.object({
  material_id: z.string().uuid('Material inválido'),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
  unit_cost: z.number().min(0, 'El costo debe ser mayor o igual a 0'),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal(''))
});

/**
 * Supplier Order validation schema
 */
export const SupplierOrderSchema = z.object({
  supplier_id: z.string().uuid('Debe seleccionar un proveedor'),
  expected_delivery_date: z.string().optional().or(z.literal('')),
  notes: z.string().max(1000, 'Máximo 1000 caracteres').optional().or(z.literal('')),
  internal_notes: z.string().max(1000, 'Máximo 1000 caracteres').optional().or(z.literal('')),
  items: z.array(SupplierOrderItemSchema)
    .min(1, 'Debe agregar al menos un material')
    .max(100, 'Máximo 100 materiales por orden')
});

/**
 * Receive Order schema
 */
export const ReceiveOrderSchema = z.object({
  actual_delivery_date: z.string().optional().or(z.literal('')),
  items: z.array(z.object({
    id: z.string().uuid(),
    received_quantity: z.number().min(0, 'La cantidad recibida no puede ser negativa')
  })).min(1, 'Debe especificar cantidades recibidas'),
  notes: z.string().max(1000).optional().or(z.literal(''))
});

// ============================================
// METRICS & ANALYTICS TYPES
// ============================================

/**
 * Supplier Order metrics for dashboard
 */
export interface SupplierOrderMetrics {
  totalOrders: number;
  draftOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  receivedOrders: number;
  cancelledOrders: number;
  totalPendingValue: number;  // Sum of approved orders not yet received
  overdueOrders: number;      // Approved orders past expected_delivery_date
  averageDeliveryTime: number; // Days from approved to received
}

/**
 * Supplier performance from orders
 */
export interface SupplierOrderPerformance {
  supplier_id: string;
  supplier_name: string;
  totalOrders: number;
  totalValue: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  cancelledOrders: number;
  averageDeliveryTime: number;
  onTimeRate: number;  // Percentage
}

// ============================================
// UI STATE TYPES
// ============================================

/**
 * Supplier Order tab options
 */
export type SupplierOrderTab = 'list' | 'analytics' | 'calendar';

/**
 * Supplier Order table filters
 */
export interface SupplierOrderFilters {
  searchText: string;
  status: SupplierOrderStatus | 'all';
  supplier_id: string | null;
  dateRange: {
    from: string | null;
    to: string | null;
  };
  showOverdue: boolean;
}

/**
 * Supplier Order sort options
 */
export type SupplierOrderSortField =
  | 'po_number'
  | 'supplier_name'
  | 'status'
  | 'total_amount'
  | 'expected_delivery_date'
  | 'created_at';

export type SupplierOrderSortDirection = 'asc' | 'desc';

export interface SupplierOrderSort {
  field: SupplierOrderSortField;
  direction: SupplierOrderSortDirection;
}

// ============================================
// STATUS HELPERS
// ============================================

/**
 * Status display configuration
 */
export const STATUS_CONFIG: Record<
  SupplierOrderStatus,
  {
    label: string;
    color: string;
    icon: string;
    description: string;
  }
> = {
  draft: {
    label: 'Borrador',
    color: 'gray',
    icon: 'DocumentIcon',
    description: 'Orden en edición'
  },
  pending: {
    label: 'Pendiente',
    color: 'yellow',
    icon: 'ClockIcon',
    description: 'Esperando aprobación'
  },
  approved: {
    label: 'Aprobada',
    color: 'blue',
    icon: 'CheckCircleIcon',
    description: 'Enviada al proveedor'
  },
  received: {
    label: 'Recibida',
    color: 'green',
    icon: 'CheckBadgeIcon',
    description: 'Materiales recibidos'
  },
  cancelled: {
    label: 'Cancelada',
    color: 'red',
    icon: 'XCircleIcon',
    description: 'Orden cancelada'
  }
};

/**
 * Check if order can be edited
 */
export function canEditOrder(status: SupplierOrderStatus): boolean {
  return status === 'draft';
}

/**
 * Check if order can be deleted
 */
export function canDeleteOrder(status: SupplierOrderStatus): boolean {
  return status === 'draft';
}

/**
 * Check if order can be approved
 */
export function canApproveOrder(status: SupplierOrderStatus): boolean {
  return status === 'pending';
}

/**
 * Check if order can be received
 */
export function canReceiveOrder(status: SupplierOrderStatus): boolean {
  return status === 'approved';
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(status: SupplierOrderStatus): boolean {
  return status === 'draft' || status === 'pending' || status === 'approved';
}

/**
 * Get next possible statuses from current status
 */
export function getNextStatuses(
  status: SupplierOrderStatus
): SupplierOrderStatus[] {
  switch (status) {
    case 'draft':
      return ['pending', 'cancelled'];
    case 'pending':
      return ['approved', 'cancelled'];
    case 'approved':
      return ['received', 'cancelled'];
    case 'received':
      return []; // Terminal state
    case 'cancelled':
      return []; // Terminal state
    default:
      return [];
  }
}

// ============================================
// EXPORT VALIDATIONS
// ============================================

export type ValidatedSupplierOrderForm = z.infer<typeof SupplierOrderSchema>;
export type ValidatedReceiveOrder = z.infer<typeof ReceiveOrderSchema>;
