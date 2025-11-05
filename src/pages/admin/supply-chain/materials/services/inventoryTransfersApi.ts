// Inventory Transfers API - Multi-Location Stock Transfers
// ================================================================
// Purpose: API functions for managing inventory transfers between locations
// ================================================================

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type {
  InventoryTransfer,
  CreateTransferData,
  TransferFilters,
  TransferValidation,
  TransferProcessResult,
  TransferStats
} from '../types/inventoryTransferTypes';

export const inventoryTransfersApi = {
  /**
   * Get all transfers with optional filters
   */
  async getTransfers(filters?: TransferFilters): Promise<InventoryTransfer[]> {
    try {
      let query = supabase
        .from('inventory_transfers')
        .select(`
          *,
          from_location:locations!inventory_transfers_from_location_id_fkey(id, name, code),
          to_location:locations!inventory_transfers_to_location_id_fkey(id, name, code),
          item:items(id, name, unit, type)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.from_location_id) {
        query = query.eq('from_location_id', filters.from_location_id);
      }

      if (filters?.to_location_id) {
        query = query.eq('to_location_id', filters.to_location_id);
      }

      if (filters?.item_id) {
        query = query.eq('item_id', filters.item_id);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('TransfersAPI', 'Error fetching transfers:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('TransfersAPI', 'Error in getTransfers:', error);
      throw error;
    }
  },

  /**
   * Get a single transfer by ID
   */
  async getTransfer(id: string): Promise<InventoryTransfer> {
    try {
      const { data, error } = await supabase
        .from('inventory_transfers')
        .select(`
          *,
          from_location:locations!inventory_transfers_from_location_id_fkey(id, name, code),
          to_location:locations!inventory_transfers_to_location_id_fkey(id, name, code),
          item:items(id, name, unit, type, stock)
        `)
        .eq('id', id)
        .single();

      if (error) {
        logger.error('TransfersAPI', 'Error fetching transfer:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('TransfersAPI', 'Error in getTransfer:', error);
      throw error;
    }
  },

  /**
   * Validate a transfer before creating
   */
  async validateTransfer(transferData: CreateTransferData): Promise<TransferValidation> {
    try {
      // Check if source and destination are different
      if (transferData.from_location_id === transferData.to_location_id) {
        return {
          is_valid: false,
          error_message: 'Las ubicaciones de origen y destino deben ser diferentes'
        };
      }

      // Check quantity is positive
      if (transferData.quantity <= 0) {
        return {
          is_valid: false,
          error_message: 'La cantidad debe ser mayor a cero'
        };
      }

      // Check stock availability in source location
      const { data: item, error } = await supabase
        .from('items')
        .select('stock, name, unit')
        .eq('id', transferData.item_id)
        .eq('location_id', transferData.from_location_id)
        .single();

      if (error || !item) {
        return {
          is_valid: false,
          error_message: 'Material no encontrado en la ubicación de origen'
        };
      }

      if (item.stock < transferData.quantity) {
        return {
          is_valid: false,
          available_stock: item.stock,
          required_stock: transferData.quantity,
          error_message: `Stock insuficiente. Disponible: ${item.stock} ${item.unit}, Requerido: ${transferData.quantity} ${item.unit}`
        };
      }

      // Check if destination location has the item (if not, warn)
      const { data: destItem } = await supabase
        .from('items')
        .select('id')
        .eq('id', transferData.item_id)
        .eq('location_id', transferData.to_location_id)
        .single();

      const warnings: string[] = [];
      if (!destItem) {
        warnings.push('El material no existe en la ubicación de destino. Se creará automáticamente.');
      }

      return {
        is_valid: true,
        available_stock: item.stock,
        required_stock: transferData.quantity,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    } catch (error) {
      logger.error('TransfersAPI', 'Error validating transfer:', error);
      return {
        is_valid: false,
        error_message: 'Error al validar la transferencia'
      };
    }
  },

  /**
   * Create a new transfer
   */
  async createTransfer(transferData: CreateTransferData): Promise<TransferProcessResult> {
    try {
      // Validate first
      const validation = await this.validateTransfer(transferData);
      if (!validation.is_valid) {
        return {
          success: false,
          message: 'Validación fallida',
          error: validation.error_message,
          validation
        };
      }

      // Generate transfer number
      const { data: transferNumberData, error: numberError } = await supabase
        .rpc('generate_transfer_number');

      if (numberError) {
        logger.error('TransfersAPI', 'Error generating transfer number:', numberError);
        throw numberError;
      }

      const transfer_number = transferNumberData as string;

      // Get item unit
      const { data: item } = await supabase
        .from('items')
        .select('unit')
        .eq('id', transferData.item_id)
        .single();

      // Create transfer
      const { data, error } = await supabase
        .from('inventory_transfers')
        .insert({
          transfer_number,
          from_location_id: transferData.from_location_id,
          to_location_id: transferData.to_location_id,
          item_id: transferData.item_id,
          quantity: transferData.quantity,
          unit: item?.unit || 'unidad',
          status: 'pending',
          reason: transferData.reason,
          notes: transferData.notes,
          requested_by: transferData.requested_by,
          requested_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('TransfersAPI', 'Error creating transfer:', error);
        throw error;
      }

      return {
        success: true,
        transfer_id: data.id,
        transfer_number: data.transfer_number,
        message: `Transferencia ${data.transfer_number} creada exitosamente`,
        validation
      };
    } catch (error) {
      logger.error('TransfersAPI', 'Error in createTransfer:', error);
      return {
        success: false,
        message: 'Error al crear la transferencia',
        error: (error as Error).message
      };
    }
  },

  /**
   * Approve a transfer
   */
  async approveTransfer(transferId: string, approvedBy: string): Promise<TransferProcessResult> {
    try {
      const { data, error } = await supabase
        .from('inventory_transfers')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', transferId)
        .eq('status', 'pending')  // Only approve if pending
        .select()
        .single();

      if (error) {
        logger.error('TransfersAPI', 'Error approving transfer:', error);
        throw error;
      }

      if (!data) {
        return {
          success: false,
          message: 'Transferencia no encontrada o no está en estado pendiente'
        };
      }

      return {
        success: true,
        transfer_id: data.id,
        transfer_number: data.transfer_number,
        message: `Transferencia ${data.transfer_number} aprobada`
      };
    } catch (error) {
      logger.error('TransfersAPI', 'Error in approveTransfer:', error);
      return {
        success: false,
        message: 'Error al aprobar la transferencia',
        error: (error as Error).message
      };
    }
  },

  /**
   * Complete a transfer (updates stock in both locations)
   */
  async completeTransfer(transferId: string, completedBy: string): Promise<TransferProcessResult> {
    try {
      const { data, error } = await supabase
        .rpc('process_inventory_transfer', {
          p_transfer_id: transferId,
          p_completed_by: completedBy
        });

      if (error) {
        logger.error('TransfersAPI', 'Error completing transfer:', error);
        throw error;
      }

      const result = data as { success: boolean; error?: string; message?: string; transfer_id?: string };

      if (!result.success) {
        return {
          success: false,
          message: result.error || 'Error al completar la transferencia'
        };
      }

      return {
        success: true,
        transfer_id: result.transfer_id,
        message: result.message || 'Transferencia completada exitosamente'
      };
    } catch (error) {
      logger.error('TransfersAPI', 'Error in completeTransfer:', error);
      return {
        success: false,
        message: 'Error al completar la transferencia',
        error: (error as Error).message
      };
    }
  },

  /**
   * Cancel a transfer
   */
  async cancelTransfer(transferId: string, cancelledBy: string, reason?: string): Promise<TransferProcessResult> {
    try {
      const { data, error } = await supabase
        .from('inventory_transfers')
        .update({
          status: 'cancelled',
          notes: reason ? `Cancelado: ${reason}` : undefined,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', transferId)
        .in('status', ['pending', 'approved'])  // Can only cancel if not started
        .select()
        .single();

      if (error) {
        logger.error('TransfersAPI', 'Error cancelling transfer:', error);
        throw error;
      }

      if (!data) {
        return {
          success: false,
          message: 'Transferencia no encontrada o ya fue procesada'
        };
      }

      return {
        success: true,
        transfer_id: data.id,
        transfer_number: data.transfer_number,
        message: `Transferencia ${data.transfer_number} cancelada`
      };
    } catch (error) {
      logger.error('TransfersAPI', 'Error in cancelTransfer:', error);
      return {
        success: false,
        message: 'Error al cancelar la transferencia',
        error: (error as Error).message
      };
    }
  },

  /**
   * Mark transfer as in transit
   */
  async markInTransit(transferId: string): Promise<TransferProcessResult> {
    try {
      const { data, error } = await supabase
        .from('inventory_transfers')
        .update({
          status: 'in_transit',
          updated_at: new Date().toISOString()
        })
        .eq('id', transferId)
        .eq('status', 'approved')  // Only if approved
        .select()
        .single();

      if (error) {
        logger.error('TransfersAPI', 'Error marking transfer in transit:', error);
        throw error;
      }

      if (!data) {
        return {
          success: false,
          message: 'Transferencia no encontrada o no está aprobada'
        };
      }

      return {
        success: true,
        transfer_id: data.id,
        transfer_number: data.transfer_number,
        message: `Transferencia ${data.transfer_number} marcada como en tránsito`
      };
    } catch (error) {
      logger.error('TransfersAPI', 'Error in markInTransit:', error);
      return {
        success: false,
        message: 'Error al marcar la transferencia',
        error: (error as Error).message
      };
    }
  },

  /**
   * Get transfer statistics
   */
  async getTransferStats(): Promise<TransferStats> {
    try {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1)).toISOString();

      // Get all transfers
      const { data: allTransfers } = await supabase
        .from('inventory_transfers')
        .select('*');

      const transfers = allTransfers || [];

      // Calculate stats
      const stats: TransferStats = {
        total_transfers: transfers.length,
        pending_transfers: transfers.filter(t => t.status === 'pending').length,
        in_transit_transfers: transfers.filter(t => t.status === 'in_transit').length,
        completed_today: transfers.filter(t =>
          t.status === 'completed' && t.completed_at && t.completed_at >= today
        ).length,
        completed_this_week: transfers.filter(t =>
          t.status === 'completed' && t.completed_at && t.completed_at >= weekAgo
        ).length,
        completed_this_month: transfers.filter(t =>
          t.status === 'completed' && t.completed_at && t.completed_at >= monthAgo
        ).length,
        most_transferred_items: [],
        busiest_routes: []
      };

      return stats;
    } catch (error) {
      logger.error('TransfersAPI', 'Error getting transfer stats:', error);
      throw error;
    }
  }
};
