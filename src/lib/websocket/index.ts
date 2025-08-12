// WebSocket Library Index - Real-time Updates for G-Admin Mini
// Centralized exports for WebSocket functionality

// Core WebSocket functionality
export { WebSocketManager, wsManager, type WSMessage, type WSMessageType } from './WebSocketManager';
export { RealtimeIntegration, realtimeIntegration } from './RealtimeIntegration';

// React hooks
export {
  useRealtimeUpdates,
  useRealtimeOrders,
  useRealtimeInventory,
  useRealtimeStaff,
  useRealtimeKitchen,
  useRealtimeSubscription,
  useRealtimeConnectionStatus,
  type UseRealtimeUpdatesReturn,
  type UseRealtimeOrdersReturn,
  type UseRealtimeInventoryReturn,
  type UseRealtimeStaffReturn,
  type UseRealtimeKitchenReturn
} from './hooks/useRealtimeUpdates';

// Components
export { RealtimeStatusIndicator } from './components/RealtimeStatusIndicator';

// Initialize WebSocket system
export const initializeWebSocket = async () => {
  try {
    const { realtimeIntegration } = await import('./RealtimeIntegration');
    const { wsManager } = await import('./WebSocketManager');
    
    // Initialize real-time integration
    realtimeIntegration.initialize();
    
    // Connect WebSocket if online
    if (typeof window !== 'undefined' && navigator.onLine) {
      await wsManager.connect();
    }
    
    console.log('WebSocket system initialized successfully');
  } catch (error) {
    console.warn('WebSocket system initialization failed:', error);
    // System will work in offline mode
  }
};

// Cleanup WebSocket system
export const cleanupWebSocket = () => {
  import('./RealtimeIntegration').then(({ realtimeIntegration }) => {
    realtimeIntegration.cleanup();
  });
  import('./WebSocketManager').then(({ wsManager }) => {
    wsManager.disconnect();
  });
  console.log('WebSocket system cleaned up');
};