// Inventory Transfer Types - Multi-Location Stock Transfers
// ================================================================
// Purpose: Types for transferring inventory between locations
// ================================================================

import type { MaterialItem } from './materialTypes';
import type { Location } from '@/types/location';

// Transfer status workflow
export type TransferStatus =
  | 'pending'      // Initial state, waiting for approval
  | 'approved'     // Approved, ready to ship
  | 'in_transit'   // Being transported
  | 'completed'    // Stock updated in both locations
  | 'cancelled'    // Cancelled before completion
  | 'rejected';    // Rejected by approver

// Core inventory transfer interface
export interface InventoryTransfer {
  id: string;
  transfer_number: string;

  // Locations
  from_location_id: string;
  to_location_id: string;

  // Item
  item_id: string;

  // Transfer details
  quantity: number;
  unit: string;

  // Status and workflow
  status: TransferStatus;

  // Tracking
  requested_by?: string;
  approved_by?: string;
  completed_by?: string;

  // Notes
  reason?: string;
  notes?: string;

  // Timestamps
  requested_at: string;
  approved_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;

  // Expanded relations (optional)
  from_location?: Location;
  to_location?: Location;
  item?: MaterialItem;
}

// Form data for creating a transfer
export interface CreateTransferData {
  from_location_id: string;
  to_location_id: string;
  item_id: string;
  quantity: number;
  reason?: string;
  notes?: string;
  requested_by?: string;
}

// Transfer filters
export interface TransferFilters {
  from_location_id?: string;
  to_location_id?: string;
  item_id?: string;
  status?: TransferStatus;
  date_from?: string;
  date_to?: string;
}

// Transfer validation result
export interface TransferValidation {
  is_valid: boolean;
  available_stock?: number;
  required_stock?: number;
  error_message?: string;
  warnings?: string[];
}

// Transfer process result
export interface TransferProcessResult {
  success: boolean;
  transfer_id?: string;
  transfer_number?: string;
  message: string;
  error?: string;
  validation?: TransferValidation;
}

// Transfer statistics
export interface TransferStats {
  total_transfers: number;
  pending_transfers: number;
  in_transit_transfers: number;
  completed_today: number;
  completed_this_week: number;
  completed_this_month: number;
  most_transferred_items: Array<{
    item_id: string;
    item_name: string;
    total_quantity: number;
    transfer_count: number;
  }>;
  busiest_routes: Array<{
    from_location: string;
    to_location: string;
    transfer_count: number;
  }>;
}

// Transfer history entry
export interface TransferHistoryEntry {
  id: string;
  transfer_id: string;
  action: 'created' | 'approved' | 'rejected' | 'shipped' | 'completed' | 'cancelled';
  performed_by: string;
  notes?: string;
  timestamp: string;
}

// Status badge configuration
export const TRANSFER_STATUS_CONFIG: Record<TransferStatus, {
  label: string;
  colorPalette: 'gray' | 'blue' | 'yellow' | 'green' | 'red' | 'orange';
  icon: string;
}> = {
  pending: {
    label: 'Pendiente',
    colorPalette: 'gray',
    icon: '⏳'
  },
  approved: {
    label: 'Aprobado',
    colorPalette: 'blue',
    icon: '✓'
  },
  in_transit: {
    label: 'En Tránsito',
    colorPalette: 'yellow',
    icon: '🚚'
  },
  completed: {
    label: 'Completado',
    colorPalette: 'green',
    icon: '✅'
  },
  cancelled: {
    label: 'Cancelado',
    colorPalette: 'red',
    icon: '✕'
  },
  rejected: {
    label: 'Rechazado',
    colorPalette: 'orange',
    icon: '⚠'
  }
};

// Helper functions
export function canApproveTransfer(transfer: InventoryTransfer): boolean {
  return transfer.status === 'pending';
}

export function canCancelTransfer(transfer: InventoryTransfer): boolean {
  return ['pending', 'approved'].includes(transfer.status);
}

export function canCompleteTransfer(transfer: InventoryTransfer): boolean {
  return ['approved', 'in_transit'].includes(transfer.status);
}

export function isTransferInProgress(transfer: InventoryTransfer): boolean {
  return ['pending', 'approved', 'in_transit'].includes(transfer.status);
}

export function isTransferFinalized(transfer: InventoryTransfer): boolean {
  return ['completed', 'cancelled', 'rejected'].includes(transfer.status);
}
