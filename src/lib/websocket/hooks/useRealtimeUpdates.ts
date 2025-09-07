// useRealtimeUpdates.ts - React Hook for Real-time WebSocket Updates
// Provides easy integration of real-time updates into React components

import { useState, useEffect, useCallback, useRef } from 'react';
import { wsManager, type WSMessageType } from '../WebSocketManager';
import { realtimeIntegration } from '../RealtimeIntegration';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';

// Hook return type
interface UseRealtimeUpdatesReturn {
  // Connection state
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'failed';
  latency: number;
  
  // Methods
  sendMessage: (type: WSMessageType, data: any, priority?: 'low' | 'medium' | 'high' | 'critical') => Promise<void>;
  sendMessageWithAck: (type: WSMessageType, data: any, timeout?: number) => Promise<any>;
  broadcast: (type: WSMessageType, data: any, priority?: 'low' | 'medium' | 'high' | 'critical') => Promise<void>;
  
  // Subscription management
  subscribe: (messageType: WSMessageType, callback: (data: unknown) => void) => () => void;
  
  // Statistics
  stats: {
    connectionAttempts: number;
    successfulConnections: number;
    failedConnections: number;
    messagesReceived: number;
    messagesSent: number;
    averageLatency: number;
  };
}

// Module-specific hooks
interface UseRealtimeOrdersReturn extends UseRealtimeUpdatesReturn {
  onOrderCreated: (callback: (order: unknown) => void) => () => void;
  onOrderUpdated: (callback: (order: unknown) => void) => () => void;
  onOrderStatusChanged: (callback: (order: unknown) => void) => () => void;
  createOrder: (orderData: unknown) => Promise<void>;
  updateOrder: (orderId: string, updates: any) => Promise<void>;
  changeOrderStatus: (orderId: string, status: string) => Promise<void>;
}

interface UseRealtimeInventoryReturn extends UseRealtimeUpdatesReturn {
  onInventoryUpdated: (callback: (item: unknown) => void) => () => void;
  updateInventory: (itemId: string, field: string, value: any) => Promise<void>;
  onStockLevelChanged: (callback: (item: unknown) => void) => () => void;
}

interface UseRealtimeStaffReturn extends UseRealtimeUpdatesReturn {
  onStaffClockAction: (callback: (action: unknown) => void) => () => void;
  onStaffUpdate: (callback: (update: unknown) => void) => () => void;
  clockAction: (employeeId: string, action: 'clock_in' | 'clock_out' | 'break_start' | 'break_end', notes?: string) => Promise<void>;
}

interface UseRealtimeKitchenReturn extends UseRealtimeUpdatesReturn {
  onKitchenUpdate: (callback: (update: unknown) => void) => () => void;
  sendKitchenUpdate: (type: string, data: any, priority?: 'low' | 'medium' | 'high' | 'critical') => Promise<void>;
  onOrderReceived: (callback: (order: unknown) => void) => () => void;
}

// Base hook for real-time updates
export function useRealtimeUpdates(): UseRealtimeUpdatesReturn {
  const [connectionState, setConnectionState] = useState(wsManager.getState());
  const [stats, setStats] = useState(wsManager.getStats());
  const [latency, setLatency] = useState(0);
  
  const subscriptionsRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    // Update state when connection changes
    const unsubscribeState = EventBus.on(RestaurantEvents.WEBSOCKET_STATE_CHANGED, (data) => {
      setConnectionState(data.payload.newState);
      setStats(wsManager.getStats());
    });

    const unsubscribeConnected = EventBus.on(RestaurantEvents.WEBSOCKET_CONNECTED, () => {
      setConnectionState('connected');
      setStats(wsManager.getStats());
      measureLatency();
    });

    const unsubscribeDisconnected = EventBus.on(RestaurantEvents.WEBSOCKET_DISCONNECTED, () => {
      setStats(wsManager.getStats());
    });

    // Update stats periodically
    const statsInterval = setInterval(() => {
      setStats(wsManager.getStats());
    }, 10000);

    // Measure latency periodically when connected
    const latencyInterval = setInterval(() => {
      if (connectionState === 'connected') {
        measureLatency();
      }
    }, 30000);

    return () => {
      unsubscribeState();
      unsubscribeConnected();
      unsubscribeDisconnected();
      clearInterval(statsInterval);
      clearInterval(latencyInterval);
      
      // Clean up subscriptions
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
    };
  }, [connectionState]);

  const measureLatency = useCallback(async () => {
    try {
      const result = await wsManager.measureLatency();
      setLatency(result);
    } catch (error) {
      setLatency(-1);
    }
  }, []);

  const sendMessage = useCallback(async (
    type: WSMessageType, 
    data: any, 
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    return wsManager.sendMessage({ type, data, priority });
  }, []);

  const sendMessageWithAck = useCallback(async (
    type: WSMessageType, 
    data: any, 
    timeout = 5000
  ) => {
    return wsManager.sendMessageWithAck({ type, data, priority: 'medium' }, timeout);
  }, []);

  const broadcast = useCallback(async (
    type: WSMessageType, 
    data: any, 
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    return realtimeIntegration.broadcastUpdate(type, data, priority);
  }, []);

  const subscribe = useCallback((
    messageType: WSMessageType, 
    callback: (data: unknown) => void
  ) => {
    const unsubscribe = wsManager.subscribe(messageType, callback);
    subscriptionsRef.current.push(unsubscribe);
    
    // Return unsubscribe function that also removes from our ref
    return () => {
      unsubscribe();
      const index = subscriptionsRef.current.indexOf(unsubscribe);
      if (index > -1) {
        subscriptionsRef.current.splice(index, 1);
      }
    };
  }, []);

  return {
    isConnected: connectionState === 'connected',
    connectionState,
    latency,
    sendMessage,
    sendMessageWithAck,
    broadcast,
    subscribe,
    stats
  };
}

// Orders-specific hook
export function useRealtimeOrders(): UseRealtimeOrdersReturn {
  const base = useRealtimeUpdates();

  const onOrderCreated = useCallback((callback: (order: unknown) => void) => {
    return base.subscribe('ORDER_CREATED', callback);
  }, [base]);

  const onOrderUpdated = useCallback((callback: (order: unknown) => void) => {
    return base.subscribe('ORDER_UPDATED', callback);
  }, [base]);

  const onOrderStatusChanged = useCallback((callback: (order: unknown) => void) => {
    return base.subscribe('ORDER_STATUS_CHANGED', callback);
  }, [base]);

  const createOrder = useCallback(async (orderData: unknown) => {
    return base.broadcast('ORDER_CREATED', {
      orderId: orderData.id || `order_${Date.now()}`,
      orderData,
      timestamp: Date.now(),
      station: 'pos'
    }, 'high');
  }, [base]);

  const updateOrder = useCallback(async (orderId: string, updates: any) => {
    return base.broadcast('ORDER_UPDATED', {
      orderId,
      updatedFields: updates,
      timestamp: Date.now()
    }, 'medium');
  }, [base]);

  const changeOrderStatus = useCallback(async (orderId: string, status: string) => {
    return base.broadcast('ORDER_STATUS_CHANGED', {
      orderId,
      status,
      timestamp: Date.now()
    }, 'high');
  }, [base]);

  return {
    ...base,
    onOrderCreated,
    onOrderUpdated,
    onOrderStatusChanged,
    createOrder,
    updateOrder,
    changeOrderStatus
  };
}

// Inventory-specific hook
export function useRealtimeInventory(): UseRealtimeInventoryReturn {
  const base = useRealtimeUpdates();

  const onInventoryUpdated = useCallback((callback: (item: unknown) => void) => {
    return base.subscribe('INVENTORY_UPDATED', callback);
  }, [base]);

  const onStockLevelChanged = useCallback((callback: (item: unknown) => void) => {
    // Filter for stock-specific updates
    return base.subscribe('INVENTORY_UPDATED', (data) => {
      if (data.field === 'stock') {
        callback(data);
      }
    });
  }, [base]);

  const updateInventory = useCallback(async (itemId: string, field: string, value: any) => {
    return base.broadcast('INVENTORY_UPDATED', {
      itemId,
      field,
      newValue: value,
      timestamp: Date.now(),
      automatic: false
    }, 'medium');
  }, [base]);

  return {
    ...base,
    onInventoryUpdated,
    updateInventory,
    onStockLevelChanged
  };
}

// Staff-specific hook
export function useRealtimeStaff(): UseRealtimeStaffReturn {
  const base = useRealtimeUpdates();

  const onStaffClockAction = useCallback((callback: (action: unknown) => void) => {
    return base.subscribe('STAFF_CLOCK_ACTION', callback);
  }, [base]);

  const onStaffUpdate = useCallback((callback: (update: unknown) => void) => {
    return base.subscribe('STAFF_CLOCK_ACTION', callback);
  }, [base]);

  const clockAction = useCallback(async (
    employeeId: string, 
    action: 'clock_in' | 'clock_out' | 'break_start' | 'break_end',
    notes?: string
  ) => {
    // Get location if available
    let location: { latitude: number; longitude: number } | undefined;
    
    try {
      if (navigator.geolocation) {
        location = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }),
            () => resolve(undefined),
            { timeout: 5000 }
          );
        });
      }
    } catch {
      // Location not available
    }

    return base.broadcast('STAFF_CLOCK_ACTION', {
      employeeId,
      action,
      timestamp: Date.now(),
      location,
      notes
    }, 'medium');
  }, [base]);

  return {
    ...base,
    onStaffClockAction,
    onStaffUpdate,
    clockAction
  };
}

// Kitchen-specific hook
export function useRealtimeKitchen(): UseRealtimeKitchenReturn {
  const base = useRealtimeUpdates();

  const onKitchenUpdate = useCallback((callback: (update: unknown) => void) => {
    return base.subscribe('KITCHEN_UPDATE', callback);
  }, [base]);

  const onOrderReceived = useCallback((callback: (order: unknown) => void) => {
    // Filter for order_received updates
    return base.subscribe('KITCHEN_UPDATE', (data) => {
      if (data.type === 'order_received') {
        callback(data);
      }
    });
  }, [base]);

  const sendKitchenUpdate = useCallback(async (
    type: string, 
    data: any, 
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    return base.broadcast('KITCHEN_UPDATE', {
      type,
      data,
      timestamp: Date.now(),
      station: 'kitchen',
      priority
    }, priority);
  }, [base]);

  return {
    ...base,
    onKitchenUpdate,
    sendKitchenUpdate,
    onOrderReceived
  };
}

// Generic subscription hook for custom message types
export function useRealtimeSubscription<T = any>(
  messageType: WSMessageType,
  callback: (data: T) => void,
  dependencies: any[] = []
): void {
  const callbackRef = useRef(callback);
  
  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
  }, dependencies);

  useEffect(() => {
    const unsubscribe = wsManager.subscribe(messageType, (data: T) => {
      callbackRef.current(data);
    });

    return unsubscribe;
  }, [messageType]);
}

// Connection status hook
export function useRealtimeConnectionStatus() {
  const [connectionState, setConnectionState] = useState(wsManager.getState());
  const [isConnected, setIsConnected] = useState(wsManager.isConnected());

  useEffect(() => {
    const unsubscribeState = EventBus.on(RestaurantEvents.WEBSOCKET_STATE_CHANGED, (data) => {
      setConnectionState(data.payload.newState);
      setIsConnected(data.payload.newState === 'connected');
    });

    const unsubscribeConnected = EventBus.on(RestaurantEvents.WEBSOCKET_CONNECTED, () => {
      setConnectionState('connected');
      setIsConnected(true);
    });

    const unsubscribeDisconnected = EventBus.on(RestaurantEvents.WEBSOCKET_DISCONNECTED, () => {
      setIsConnected(false);
    });

    return () => {
      unsubscribeState();
      unsubscribeConnected();
      unsubscribeDisconnected();
    };
  }, []);

  const reconnect = useCallback(async () => {
    return wsManager.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsManager.disconnect();
  }, []);

  return {
    connectionState,
    isConnected,
    reconnect,
    disconnect
  };
}

// Export the interfaces for external usage
export type { UseRealtimeUpdatesReturn, UseRealtimeOrdersReturn, UseRealtimeInventoryReturn, UseRealtimeStaffReturn, UseRealtimeKitchenReturn };