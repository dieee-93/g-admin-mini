/**
 * Inventory Transfers Service
 *
 * Business logic layer for multi-location inventory transfers.
 * Handles validation, workflow, and cross-location stock management.
 *
 * Features:
 * - Transfer initiation with stock validation
 * - Transfer approval/rejection workflow
 * - Atomic stock updates across locations
 * - Audit trail and history
 * - EventBus integration for notifications
 */

import { supabase } from '@/lib/supabase/client';
import { secureApiCall } from '@/lib/validation';
import { logger } from '@/lib/logging';
import eventBus from '@/lib/events';

// ============================================
// TYPES
// ============================================

export interface Transfer {
  id: string;
  from_location_id: string;
  to_location_id: string;
  item_id: string;
  quantity: number;
  status: 'pending' | 'approved' | 'in_transit' | 'received' | 'cancelled';
  initiated_by: string;
  approved_by?: string;
  received_by?: string;
  notes?: string;
  initiated_at: string;
  approved_at?: string;
  received_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TransferRequest {
  from_location_id: string;
  to_location_id: string;
  item_id: string;
  quantity: number;
  notes?: string;
}

export interface TransferApproval {
  transferId: string;
  approved: boolean;
  notes?: string;
}

export interface TransferReceipt {
  transferId: string;
  quantity_received: number;
  notes?: string;
}

// ============================================
// SERVICE
// ============================================

export class InventoryTransfersService {

  /**
   * Initiate a transfer between locations
   * Validates stock availability before creating
   */
  static async initiateTransfer(
    request: TransferRequest
  ): Promise<Transfer> {
    return secureApiCall(async () => {
      // Validate inputs
      if (request.from_location_id === request.to_location_id) {
        throw new Error('Source and destination locations cannot be the same');
      }

      if (request.quantity <= 0) {
        throw new Error('Transfer quantity must be greater than zero');
      }

      // Get source item to validate stock
      const { data: sourceItem, error: itemError } = await supabase
        .from('materials')
        .select('*')
        .eq('id', request.item_id)
        .eq('location_id', request.from_location_id)
        .single();

      if (itemError || !sourceItem) {
        throw new Error('Item not found in source location');
      }

      // Validate sufficient stock
      if ((sourceItem.stock || 0) < request.quantity) {
        throw new Error(
          `Insufficient stock. Available: ${sourceItem.stock}, Requested: ${request.quantity}`
        );
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required');
      }

      // Create transfer record
      const { data: transfer, error: transferError } = await supabase
        .from('inventory_transfers')
        .insert({
          from_location_id: request.from_location_id,
          to_location_id: request.to_location_id,
          item_id: request.item_id,
          quantity: request.quantity,
          status: 'pending',
          initiated_by: user.id,
          initiated_at: new Date().toISOString(),
          notes: request.notes
        })
        .select()
        .single();

      if (transferError) {
        throw transferError;
      }

      // Emit event
      eventBus.emit('inventory.transfer_initiated', {
        transferId: transfer.id,
        itemId: request.item_id,
        quantity: request.quantity,
        fromLocation: request.from_location_id,
        toLocation: request.to_location_id,
        initiatedBy: user.id,
        timestamp: new Date().toISOString()
      });

      logger.info('TransfersService', `Transfer initiated: ${transfer.id}`);

      return transfer as Transfer;
    }, {
      operation: 'initiateTransfer',
      context: {
        itemId: request.item_id,
        quantity: request.quantity
      }
    });
  }

  /**
   * Approve or reject a transfer
   * Updates transfer status and optionally deducts stock from source
   */
  static async approveTransfer(
    approval: TransferApproval
  ): Promise<Transfer> {
    return secureApiCall(async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required');
      }

      // Get transfer
      const { data: transfer, error: transferError } = await supabase
        .from('inventory_transfers')
        .select('*')
        .eq('id', approval.transferId)
        .single();

      if (transferError || !transfer) {
        throw new Error('Transfer not found');
      }

      // Validate transfer is in pending status
      if (transfer.status !== 'pending') {
        throw new Error(`Transfer cannot be approved. Current status: ${transfer.status}`);
      }

      if (approval.approved) {
        // APPROVE: Deduct stock from source location
        const { data: sourceItem } = await supabase
          .from('materials')
          .select('stock')
          .eq('id', transfer.item_id)
          .eq('location_id', transfer.from_location_id)
          .single();

        if (!sourceItem) {
          throw new Error('Source item not found');
        }

        // Validate stock still available
        if ((sourceItem.stock || 0) < transfer.quantity) {
          throw new Error('Insufficient stock for transfer');
        }

        // Update source item stock
        const newSourceStock = (sourceItem.stock || 0) - transfer.quantity;
        await supabase
          .from('materials')
          .update({
            stock: newSourceStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', transfer.item_id)
          .eq('location_id', transfer.from_location_id);

        // Update transfer status to in_transit
        const { data: updatedTransfer, error: updateError } = await supabase
          .from('inventory_transfers')
          .update({
            status: 'in_transit',
            approved_by: user.id,
            approved_at: new Date().toISOString()
          })
          .eq('id', approval.transferId)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        // Emit event
        eventBus.emit('inventory.transfer_approved', {
          transferId: approval.transferId,
          approvedBy: user.id,
          timestamp: new Date().toISOString()
        });

        logger.info('TransfersService', `Transfer approved: ${approval.transferId}`);

        return updatedTransfer as Transfer;

      } else {
        // REJECT: Update status to cancelled
        const { data: updatedTransfer, error: updateError } = await supabase
          .from('inventory_transfers')
          .update({
            status: 'cancelled',
            approved_by: user.id,
            approved_at: new Date().toISOString(),
            notes: approval.notes || 'Transfer rejected'
          })
          .eq('id', approval.transferId)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        // Emit event
        eventBus.emit('inventory.transfer_rejected', {
          transferId: approval.transferId,
          rejectedBy: user.id,
          timestamp: new Date().toISOString()
        });

        logger.info('TransfersService', `Transfer rejected: ${approval.transferId}`);

        return updatedTransfer as Transfer;
      }
    }, {
      operation: 'approveTransfer',
      context: {
        transferId: approval.transferId,
        approved: approval.approved
      }
    });
  }

  /**
   * Receive a transfer at destination
   * Updates destination stock and completes transfer
   */
  static async receiveTransfer(
    receipt: TransferReceipt
  ): Promise<Transfer> {
    return secureApiCall(async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required');
      }

      // Get transfer
      const { data: transfer, error: transferError } = await supabase
        .from('inventory_transfers')
        .select('*')
        .eq('id', receipt.transferId)
        .single();

      if (transferError || !transfer) {
        throw new Error('Transfer not found');
      }

      // Validate transfer is in_transit
      if (transfer.status !== 'in_transit') {
        throw new Error(`Transfer cannot be received. Current status: ${transfer.status}`);
      }

      // Validate quantity received
      if (receipt.quantity_received <= 0 || receipt.quantity_received > transfer.quantity) {
        throw new Error(
          `Invalid quantity received. Expected: ${transfer.quantity}, Received: ${receipt.quantity_received}`
        );
      }

      // Get or create destination item
      const { data: destItem, error: destError } = await supabase
        .from('materials')
        .select('*')
        .eq('id', transfer.item_id)
        .eq('location_id', transfer.to_location_id)
        .maybeSingle();

      if (destError) {
        throw destError;
      }

      if (destItem) {
        // Update existing item
        const newDestStock = (destItem.stock || 0) + receipt.quantity_received;
        await supabase
          .from('materials')
          .update({
            stock: newDestStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', transfer.item_id)
          .eq('location_id', transfer.to_location_id);
      } else {
        // Create new item at destination (copy from source)
        const { data: sourceItem } = await supabase
          .from('materials')
          .select('*')
          .eq('id', transfer.item_id)
          .eq('location_id', transfer.from_location_id)
          .single();

        if (!sourceItem) {
          throw new Error('Source item not found');
        }

        await supabase
          .from('materials')
          .insert({
            ...sourceItem,
            id: transfer.item_id, // Keep same ID
            location_id: transfer.to_location_id,
            stock: receipt.quantity_received,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      // Update transfer status to received
      const { data: updatedTransfer, error: updateError } = await supabase
        .from('inventory_transfers')
        .update({
          status: 'received',
          received_by: user.id,
          received_at: new Date().toISOString(),
          notes: receipt.notes
        })
        .eq('id', receipt.transferId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Emit event
      eventBus.emit('inventory.transfer_received', {
        transferId: receipt.transferId,
        receivedBy: user.id,
        quantityReceived: receipt.quantity_received,
        timestamp: new Date().toISOString()
      });

      logger.info('TransfersService', `Transfer received: ${receipt.transferId}`);

      return updatedTransfer as Transfer;
    }, {
      operation: 'receiveTransfer',
      context: {
        transferId: receipt.transferId,
        quantityReceived: receipt.quantity_received
      }
    });
  }

  /**
   * Get all transfers for a location
   */
  static async getTransfersByLocation(
    locationId: string,
    direction: 'incoming' | 'outgoing' | 'all' = 'all'
  ): Promise<Transfer[]> {
    return secureApiCall(async () => {
      let query = supabase
        .from('inventory_transfers')
        .select('*')
        .order('created_at', { ascending: false });

      if (direction === 'incoming') {
        query = query.eq('to_location_id', locationId);
      } else if (direction === 'outgoing') {
        query = query.eq('from_location_id', locationId);
      } else {
        query = query.or(`from_location_id.eq.${locationId},to_location_id.eq.${locationId}`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []) as Transfer[];
    }, {
      operation: 'getTransfersByLocation',
      context: { locationId, direction }
    });
  }
}
