// RealtimeIntegration.ts - Real-time Integration Layer for G-Admin Mini
// Connects WebSocket updates to module-specific functionality

import { wsManager, type WSMessageType } from './WebSocketManager';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';
import { notify } from '@/lib/notifications';
import { offlineSync, localStorage } from '@/lib/offline';

// Real-time update types for different modules
interface OrderUpdate {
  orderId: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  updatedFields: Record<string, any>;
  timestamp: number;
  updatedBy: string;
}

interface InventoryUpdate {
  itemId: string;
  field: 'stock' | 'price' | 'status' | 'details';
  oldValue: any;
  newValue: any;
  timestamp: number;
  updatedBy: string;
  automatic?: boolean;
}

interface StaffUpdate {
  employeeId: string;
  action: 'clock_in' | 'clock_out' | 'break_start' | 'break_end' | 'status_change';
  timestamp: number;
  location?: { latitude: number; longitude: number };
  notes?: string;
}

interface KitchenUpdate {
  type: 'order_received' | 'order_completed' | 'station_status' | 'item_shortage';
  data: any;
  timestamp: number;
  station?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface NotificationUpdate {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  module?: 'sales' | 'kitchen' | 'inventory' | 'staff' | 'system';
  actions?: Array<{
    label: string;
    action: string;
    style: 'primary' | 'secondary' | 'danger';
  }>;
  timestamp: number;
  expiresAt?: number;
}

export class RealtimeIntegration {
  private subscriptions: Array<() => void> = [];
  private isInitialized = false;
  private conflictResolutionStrategies = new Map<string, (local: any, remote: any) => any>();

  constructor() {
    this.setupConflictResolutionStrategies();
  }

  /**
   * Initialize real-time integration
   */
  public initialize(): void {
    if (this.isInitialized) {
      console.warn('RealtimeIntegration already initialized');
      return;
    }

    this.setupWebSocketSubscriptions();
    this.setupOfflineIntegration();
    this.setupModuleIntegrations();
    
    this.isInitialized = true;
    console.log('RealtimeIntegration initialized successfully');
  }

  /**
   * Cleanup real-time integration
   */
  public cleanup(): void {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
    this.isInitialized = false;
    console.log('RealtimeIntegration cleaned up');
  }

  /**
   * Send real-time update to other clients
   */
  public async broadcastUpdate(
    type: WSMessageType,
    data: any,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    try {
      await wsManager.sendMessage({
        type,
        data,
        priority
      });
    } catch (error) {
      console.warn('Failed to broadcast real-time update:', error);
      // Gracefully handle WebSocket failure - offline sync will handle it
    }
  }

  /**
   * Send real-time update with acknowledgment
   */
  public async broadcastUpdateWithAck(
    type: WSMessageType,
    data: any,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    timeout = 5000
  ): Promise<any> {
    return wsManager.sendMessageWithAck({ type, data, priority }, timeout);
  }

  // Private setup methods

  private setupWebSocketSubscriptions(): void {
    // Subscribe to order updates
    this.subscriptions.push(
      wsManager.subscribe('ORDER_CREATED', this.handleOrderCreated.bind(this)),
      wsManager.subscribe('ORDER_UPDATED', this.handleOrderUpdated.bind(this)),
      wsManager.subscribe('ORDER_STATUS_CHANGED', this.handleOrderStatusChanged.bind(this)),
      
      // Subscribe to inventory updates
      wsManager.subscribe('INVENTORY_UPDATED', this.handleInventoryUpdated.bind(this)),
      
      // Subscribe to staff updates
      wsManager.subscribe('STAFF_CLOCK_ACTION', this.handleStaffUpdate.bind(this)),
      
      // Subscribe to kitchen updates
      wsManager.subscribe('KITCHEN_UPDATE', this.handleKitchenUpdate.bind(this)),
      
      // Subscribe to notifications
      wsManager.subscribe('NOTIFICATION', this.handleNotification.bind(this)),
      
      // Subscribe to sync requests
      wsManager.subscribe('SYNC_REQUEST', this.handleSyncRequest.bind(this))
    );
  }

  private setupOfflineIntegration(): void {
    // When offline operations are synced, broadcast updates
    EventBus.on(RestaurantEvents.SYNC_COMPLETED, async (event) => {
      if (wsManager.isConnected()) {
        // Inform other clients about synchronized operations
        for (const operation of event.payload.operations) {
          await this.broadcastSyncedOperation(operation);
        }
      }
    });

    // When going online, request sync from server
    EventBus.on(RestaurantEvents.WEBSOCKET_CONNECTED, async () => {
      const pendingOperations = await offlineSync.syncPendingOperations();
      if (pendingOperations.length > 0) {
        await this.broadcastUpdate('SYNC_REQUEST', {
          operationCount: pendingOperations.length,
          lastSync: await localStorage.get('sync_metadata', 'lastSync'),
          clientId: await localStorage.get('client_metadata', 'clientId')
        }, 'high');
      }
    });
  }

  private setupModuleIntegrations(): void {
    // Sales module integration
    EventBus.on(RestaurantEvents.ORDER_PLACED, async (data) => {
      if (!data.isOffline) {
        await this.broadcastUpdate('ORDER_CREATED', {
          orderId: data.orderId,
          orderData: data.orderData,
          timestamp: Date.now(),
          station: 'pos'
        }, 'high');
      }
    });

    EventBus.on(RestaurantEvents.ORDER_UPDATED, async (data) => {
      if (!data.isOffline) {
        await this.broadcastUpdate('ORDER_UPDATED', {
          orderId: data.orderId,
          updatedFields: data.updatedFields,
          timestamp: Date.now()
        }, 'medium');
      }
    });

    // Kitchen module integration
    EventBus.on(RestaurantEvents.ORDER_STATUS_CHANGED, async (data) => {
      await this.broadcastUpdate('ORDER_STATUS_CHANGED', {
        orderId: data.orderId,
        oldStatus: data.oldStatus,
        newStatus: data.newStatus,
        timestamp: Date.now(),
        station: 'kitchen'
      }, 'high');
    });

    // Inventory module integration
    EventBus.on(RestaurantEvents.INVENTORY_UPDATED, async (event) => {
      if (!event.payload?.isOffline) {
        await this.broadcastUpdate('INVENTORY_UPDATED', {
          itemId: event.payload.itemId,
          field: event.payload.field,
          oldValue: event.payload.oldValue,
          newValue: event.payload.newValue,
          timestamp: Date.now(),
          automatic: event.payload.automatic || false
        }, 'medium');
      }
    });

    // Staff module integration
    EventBus.on(RestaurantEvents.EMPLOYEE_CLOCK_IN, async (event) => {
      if (!event.payload?.isOffline) {
        await this.broadcastUpdate('STAFF_CLOCK_ACTION', {
          employeeId: event.payload.employeeId,
          action: 'clock_in',
          timestamp: Date.now(),
          location: event.payload.location,
          notes: event.payload.notes
        }, 'medium');
      }
    });

    EventBus.on(RestaurantEvents.EMPLOYEE_CLOCK_OUT, async (event) => {
      if (!event.payload?.isOffline) {
        await this.broadcastUpdate('STAFF_CLOCK_ACTION', {
          employeeId: event.payload.employeeId,
          action: 'clock_out',
          timestamp: Date.now(),
          location: event.payload.location,
          notes: event.payload.notes
        }, 'medium');
      }
    });
  }

  private setupConflictResolutionStrategies(): void {
    // Order conflict resolution
    this.conflictResolutionStrategies.set('order', (local, remote) => {
      // Kitchen updates (status changes) take precedence over POS updates
      if (remote.station === 'kitchen' && local.station === 'pos') {
        return remote;
      }
      
      // More recent updates take precedence
      return remote.timestamp > local.timestamp ? remote : local;
    });

    // Inventory conflict resolution
    this.conflictResolutionStrategies.set('inventory', (local, remote) => {
      // Automatic updates (from sales) take precedence over manual updates
      if (remote.automatic && !local.automatic) {
        return remote;
      }
      
      // Stock decreases take precedence over increases (safety measure)
      if (local.field === 'stock' && remote.field === 'stock') {
        if (remote.newValue < local.newValue) {
          return remote;
        }
      }
      
      return remote.timestamp > local.timestamp ? remote : local;
    });

    // Staff conflict resolution  
    this.conflictResolutionStrategies.set('staff', (local, remote) => {
      // Clock actions are sequential, use timestamp
      return remote.timestamp > local.timestamp ? remote : local;
    });
  }

  // WebSocket message handlers

  private async handleOrderCreated(data: OrderUpdate): Promise<void> {
    console.log('Real-time order created:', data.orderId);
    
    // Check for conflicts with local data
    const localOrder = await localStorage.get('offline_orders', data.orderId);
    if (localOrder) {
      const resolved = this.resolveConflict('order', localOrder, data);
      await localStorage.set('offline_orders', data.orderId, resolved);
    }

    // Emit to interested modules
    EventBus.emit(RestaurantEvents.ORDER_CREATED_REALTIME, data);
    
    // Show notification if order is for current station
    if (data.updatedBy !== await this.getCurrentUserId()) {
      notify.info('New Order Received', {
        description: `Order #${data.orderId} has been placed`
      });
    }
  }

  private async handleOrderUpdated(data: OrderUpdate): Promise<void> {
    console.log('Real-time order updated:', data.orderId);
    
    // Update local cache if exists
    const localOrder = await localStorage.get('offline_orders', data.orderId);
    if (localOrder) {
      const resolved = this.resolveConflict('order', localOrder, data);
      await localStorage.set('offline_orders', data.orderId, resolved);
    }

    EventBus.emit(RestaurantEvents.ORDER_UPDATED_REALTIME, data);
  }

  private async handleOrderStatusChanged(data: OrderUpdate): Promise<void> {
    console.log('Real-time order status changed:', data.orderId, data.status);
    
    // Update local cache
    const localOrder = await localStorage.get('offline_orders', data.orderId);
    if (localOrder) {
      localOrder.status = data.status;
      localOrder.updatedAt = data.timestamp;
      await localStorage.set('offline_orders', data.orderId, localOrder);
    }

    EventBus.emit(RestaurantEvents.ORDER_STATUS_CHANGED_REALTIME, data);
    
    // Show status change notification
    const statusLabels = {
      'preparing': 'Order is being prepared',
      'ready': 'Order is ready for pickup',
      'delivered': 'Order has been delivered',
      'cancelled': 'Order has been cancelled'
    };
    
    if (data.status in statusLabels) {
      notify.info('Order Status Update', {
        description: `Order #${data.orderId}: ${statusLabels[data.status as keyof typeof statusLabels]}`
      });
    }
  }

  private async handleInventoryUpdated(data: InventoryUpdate): Promise<void> {
    console.log('Real-time inventory updated:', data.itemId, data.field);
    
    // Check for conflicts with local data
    const localItem = await localStorage.get('offline_inventory_items', data.itemId);
    if (localItem) {
      const resolved = this.resolveConflict('inventory', localItem, data);
      await localStorage.set('offline_inventory_items', data.itemId, resolved);
    }

    EventBus.emit(RestaurantEvents.INVENTORY_UPDATED_REALTIME, data);
    
    // Show critical stock alerts
    if (data.field === 'stock' && data.newValue <= 5) {
      notify.warning('Low Stock Alert', {
        description: `${data.itemId} is running low (${data.newValue} remaining)`
      });
    }
  }

  private async handleStaffUpdate(data: StaffUpdate): Promise<void> {
    console.log('Real-time staff update:', data.employeeId, data.action);
    
    // Update local time tracking data
    const timeEntry = {
      id: `realtime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      employee_id: data.employeeId,
      entry_type: data.action,
      timestamp: data.timestamp,
      location: data.location,
      notes: data.notes,
      is_offline: false,
      sync_status: 'synced' as const,
      created_at: new Date(data.timestamp).toISOString(),
      updated_at: new Date(data.timestamp).toISOString()
    };

    await localStorage.set('offline_time_entries', timeEntry.id, timeEntry);
    
    EventBus.emit(RestaurantEvents.STAFF_TIME_UPDATED_REALTIME, data);
  }

  private async handleKitchenUpdate(data: KitchenUpdate): Promise<void> {
    console.log('Real-time kitchen update:', data.type);
    
    EventBus.emit(RestaurantEvents.KITCHEN_UPDATED_REALTIME, data);
    
    // Show critical kitchen alerts
    if (data.priority === 'critical') {
      notify.error('Kitchen Alert', {
        description: data.data.message || 'Critical kitchen situation requires attention'
      });
    }
  }

  private async handleNotification(data: NotificationUpdate): Promise<void> {
    console.log('Real-time notification:', data.type, data.title);
    
    // Show notification based on type
    switch (data.type) {
      case 'error':
        notify.error(data.title, { description: data.message });
        break;
      case 'warning':
        notify.warning(data.title, { description: data.message });
        break;
      case 'info':
        notify.info(data.title, { description: data.message });
        break;
      case 'success':
        notify.success(data.title, { description: data.message });
        break;
    }
    
    EventBus.emit(RestaurantEvents.NOTIFICATION_RECEIVED_REALTIME, data);
  }

  private async handleSyncRequest(data: any): Promise<void> {
    console.log('Real-time sync request received:', data);
    
    // Trigger offline sync if we have pending operations
    const pendingOperations = await offlineSync.getPendingOperations();
    if (pendingOperations.length > 0) {
      await offlineSync.forceSync();
    }
    
    EventBus.emit(RestaurantEvents.SYNC_REQUESTED_REALTIME, data);
  }

  // Utility methods

  private resolveConflict(entityType: string, local: any, remote: any): any {
    const strategy = this.conflictResolutionStrategies.get(entityType);
    if (strategy) {
      return strategy(local, remote);
    }
    
    // Default: remote wins if more recent
    return remote.timestamp > local.timestamp ? remote : local;
  }

  private async broadcastSyncedOperation(operation: any): Promise<void> {
    const messageType = this.getMessageTypeForOperation(operation);
    if (messageType) {
      await this.broadcastUpdate(messageType, {
        operationId: operation.id,
        entity: operation.entity,
        data: operation.data,
        timestamp: operation.timestamp,
        synced: true
      }, 'medium');
    }
  }

  private getMessageTypeForOperation(operation: any): WSMessageType | null {
    switch (operation.entity) {
      case 'orders':
        return operation.type === 'CREATE' ? 'ORDER_CREATED' : 'ORDER_UPDATED';
      case 'inventory_items':
      case 'inventory_stock':
        return 'INVENTORY_UPDATED';
      case 'time_entries':
        return 'STAFF_CLOCK_ACTION';
      default:
        return null;
    }
  }

  private async getCurrentUserId(): Promise<string> {
    try {
      return await localStorage.get('user_metadata', 'userId') || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }
}

// Global real-time integration instance
export const realtimeIntegration = new RealtimeIntegration();

// Auto-initialize
if (typeof window !== 'undefined') {
  realtimeIntegration.initialize();
}