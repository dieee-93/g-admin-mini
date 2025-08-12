// WebSocketManager.ts - Real-time WebSocket Management for G-Admin Mini
// Provides robust WebSocket connections with automatic reconnection and offline graceful degradation

import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';
import { notify } from '@/lib/notifications';
import { localStorage } from '@/lib/offline';

// WebSocket connection states
type WSConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'failed';

// Message types for real-time updates
export type WSMessageType = 
  | 'ORDER_CREATED'
  | 'ORDER_UPDATED' 
  | 'ORDER_STATUS_CHANGED'
  | 'INVENTORY_UPDATED'
  | 'STAFF_CLOCK_ACTION'
  | 'KITCHEN_UPDATE'
  | 'NOTIFICATION'
  | 'HEARTBEAT'
  | 'SYNC_REQUEST'
  | 'CLIENT_CONNECTED'
  | 'CLIENT_DISCONNECTED'
  | 'ERROR';

// WebSocket message structure
export interface WSMessage {
  id: string;
  type: WSMessageType;
  timestamp: number;
  data: any;
  source: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requires_ack?: boolean;
  ack_timeout?: number;
}

// WebSocket configuration
interface WSConfig {
  url: string;
  protocols?: string[];
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  heartbeatTimeout: number;
  messageQueueSize: number;
  enableAutoReconnect: boolean;
  enableMessageQueue: boolean;
  enableHeartbeat: boolean;
  enableEncryption: boolean;
  // Enhanced backoff configuration
  maxBackoffDelay: number;
  backoffMultiplier: number;
  jitterRange: number;
}

// Connection statistics
interface WSStats {
  connectionAttempts: number;
  successfulConnections: number;
  failedConnections: number;
  messagesReceived: number;
  messagesSent: number;
  lastConnected?: number;
  lastDisconnected?: number;
  averageLatency: number;
  currentLatency: number;
}

// Message acknowledgment tracking
interface PendingAck {
  messageId: string;
  timestamp: number;
  timeout: number;
  resolve: (value: any) => void;
  reject: (error: Error) => void;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WSConfig;
  private state: WSConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private heartbeatTimeoutTimer: NodeJS.Timeout | null = null;
  private messageQueue: WSMessage[] = [];
  private pendingAcks = new Map<string, PendingAck>();
  private stats: WSStats = {
    connectionAttempts: 0,
    successfulConnections: 0,
    failedConnections: 0,
    messagesReceived: 0,
    messagesSent: 0,
    averageLatency: 0,
    currentLatency: 0
  };

  // Event listeners
  private listeners = new Map<string, Set<(data: any) => void>>();
  
  // Enhanced reconnection management
  private lastHeartbeatResponse = 0;
  private consecutiveHeartbeatFailures = 0;
  private maxConsecutiveHeartbeatFailures = 3;
  private connectionPaused = false;
  private pauseUntil = 0;

  constructor(config: Partial<WSConfig> = {}) {
    this.config = {
      url: config.url || this.getWebSocketUrl(),
      protocols: config.protocols || ['restaurant-protocol'],
      reconnectInterval: config.reconnectInterval || 1000, // Start with 1s
      maxReconnectAttempts: config.maxReconnectAttempts || 15, // More attempts
      heartbeatInterval: config.heartbeatInterval || 30000, // 30s heartbeat
      heartbeatTimeout: config.heartbeatTimeout || 10000, // 10s timeout for heartbeat response
      messageQueueSize: config.messageQueueSize || 100,
      enableAutoReconnect: config.enableAutoReconnect !== false,
      enableMessageQueue: config.enableMessageQueue !== false,
      enableHeartbeat: config.enableHeartbeat !== false,
      enableEncryption: config.enableEncryption !== false,
      // Enhanced backoff configuration
      maxBackoffDelay: config.maxBackoffDelay || 60000, // Max 60s delay
      backoffMultiplier: config.backoffMultiplier || 1.5, // Gentler than 2x
      jitterRange: config.jitterRange || 0.1 // 10% jitter
    };

    // Initialize event listeners for offline system integration
    this.setupOfflineIntegration();
    
    // Load persisted message queue
    this.loadMessageQueue();

    // Setup cleanup on page unload
    window.addEventListener('beforeunload', () => this.disconnect());
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/api/ws`;
  }

  private setupOfflineIntegration() {
    // Listen for offline status changes
    window.addEventListener('online', () => {
      if (this.state === 'disconnected' && this.config.enableAutoReconnect) {
        console.log('Network restored, attempting WebSocket reconnection...');
        this.connect();
      }
    });

    window.addEventListener('offline', () => {
      console.log('Network lost, WebSocket will gracefully handle offline mode');
      this.handleNetworkLoss();
    });

    // Listen for offline sync completion to trigger real-time sync
    EventBus.on(RestaurantEvents.SYNC_COMPLETED, (data) => {
      if (this.isConnected()) {
        this.sendMessage({
          type: 'SYNC_REQUEST',
          data: { syncedOperations: data.operations },
          priority: 'high'
        });
      }
    });
  }

  private async loadMessageQueue() {
    try {
      const savedQueue = await localStorage.get('websocket_message_queue', 'queue');
      if (savedQueue && Array.isArray(savedQueue)) {
        this.messageQueue = savedQueue.slice(0, this.config.messageQueueSize);
        console.log(`Loaded ${this.messageQueue.length} queued WebSocket messages`);
      }
    } catch (error) {
      console.warn('Failed to load WebSocket message queue:', error);
    }
  }

  private async saveMessageQueue() {
    try {
      await localStorage.set('websocket_message_queue', 'queue', this.messageQueue);
    } catch (error) {
      console.warn('Failed to save WebSocket message queue:', error);
    }
  }

  // Public API
  
  /**
   * Connect to WebSocket server
   */
  public async connect(): Promise<void> {
    if (this.state === 'connected' || this.state === 'connecting') {
      return;
    }

    // Check if connection is paused due to repeated failures
    if (this.connectionPaused && Date.now() < this.pauseUntil) {
      const remainingPause = Math.round((this.pauseUntil - Date.now()) / 1000);
      console.log(`[WebSocketManager] Connection paused for ${remainingPause}s due to repeated failures`);
      return;
    }

    // Reset pause if enough time has passed
    if (this.connectionPaused && Date.now() >= this.pauseUntil) {
      this.connectionPaused = false;
      this.reconnectAttempts = 0;
      console.log('[WebSocketManager] Connection pause expired, resuming connection attempts');
    }

    this.setState('connecting');
    this.stats.connectionAttempts++;

    try {
      this.ws = new WebSocket(this.config.url, this.config.protocols);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

    } catch (error) {
      this.handleConnectionError(error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    this.config.enableAutoReconnect = false;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'Client disconnect');
    }

    // Reset connection state
    this.connectionPaused = false;
    this.reconnectAttempts = 0;
    this.consecutiveHeartbeatFailures = 0;
    this.lastHeartbeatResponse = 0;

    this.setState('disconnected');
  }

  /**
   * Send message through WebSocket
   */
  public async sendMessage(
    message: Omit<WSMessage, 'id' | 'timestamp' | 'source'>
  ): Promise<void> {
    const fullMessage: WSMessage = {
      id: this.generateMessageId(),
      timestamp: Date.now(),
      source: 'client',
      ...message
    };

    if (this.isConnected()) {
      return this.sendMessageImmediate(fullMessage);
    } else if (this.config.enableMessageQueue) {
      return this.queueMessage(fullMessage);
    } else {
      throw new Error('WebSocket not connected and message queuing disabled');
    }
  }

  /**
   * Send message with acknowledgment
   */
  public async sendMessageWithAck(
    message: Omit<WSMessage, 'id' | 'timestamp' | 'source' | 'requires_ack'>,
    timeout = 5000
  ): Promise<any> {
    const fullMessage: WSMessage = {
      id: this.generateMessageId(),
      timestamp: Date.now(),
      source: 'client',
      requires_ack: true,
      ack_timeout: timeout,
      ...message
    };

    return new Promise((resolve, reject) => {
      // Track acknowledgment
      this.pendingAcks.set(fullMessage.id, {
        messageId: fullMessage.id,
        timestamp: Date.now(),
        timeout,
        resolve,
        reject
      });

      // Send message
      this.sendMessage(fullMessage).catch(reject);

      // Setup timeout
      setTimeout(() => {
        if (this.pendingAcks.has(fullMessage.id)) {
          this.pendingAcks.delete(fullMessage.id);
          reject(new Error(`Message acknowledgment timeout: ${fullMessage.id}`));
        }
      }, timeout);
    });
  }

  /**
   * Subscribe to specific message types
   */
  public subscribe(messageType: WSMessageType, callback: (data: any) => void): () => void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, new Set());
    }
    
    this.listeners.get(messageType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const typeListeners = this.listeners.get(messageType);
      if (typeListeners) {
        typeListeners.delete(callback);
        if (typeListeners.size === 0) {
          this.listeners.delete(messageType);
        }
      }
    };
  }

  /**
   * Get connection state
   */
  public getState(): WSConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.state === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection statistics
   */
  public getStats(): WSStats {
    return { ...this.stats };
  }

  /**
   * Get current latency
   */
  public async measureLatency(): Promise<number> {
    if (!this.isConnected()) {
      return -1;
    }

    const startTime = Date.now();
    
    try {
      await this.sendMessageWithAck({
        type: 'HEARTBEAT',
        data: { timestamp: startTime },
        priority: 'low'
      }, 3000);

      const latency = Date.now() - startTime;
      this.stats.currentLatency = latency;
      
      // Update average latency
      if (this.stats.averageLatency === 0) {
        this.stats.averageLatency = latency;
      } else {
        this.stats.averageLatency = (this.stats.averageLatency * 0.9) + (latency * 0.1);
      }

      return latency;
    } catch (error) {
      return -1;
    }
  }

  // Private methods

  private handleOpen(): void {
    console.log('WebSocket connected successfully');
    
    this.setState('connected');
    this.stats.successfulConnections++;
    this.stats.lastConnected = Date.now();
    this.reconnectAttempts = 0;

    // Start heartbeat
    if (this.config.enableHeartbeat) {
      this.startHeartbeat();
    }

    // Process queued messages
    this.processMessageQueue();

    // Notify successful connection
    notify.success('Real-time updates connected');
    
    // Emit connection event
    EventBus.emit(RestaurantEvents.WEBSOCKET_CONNECTED, {
      timestamp: Date.now(),
      stats: this.getStats()
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WSMessage = JSON.parse(event.data);
      this.stats.messagesReceived++;

      // Handle acknowledgment responses
      if (message.type === 'ACK' && this.pendingAcks.has(message.data?.messageId)) {
        const pendingAck = this.pendingAcks.get(message.data.messageId)!;
        this.pendingAcks.delete(message.data.messageId);
        pendingAck.resolve(message.data);
        return;
      }

      // Send acknowledgment if requested
      if (message.requires_ack) {
        this.sendAcknowledgment(message.id, message.data);
      }

      // Route message to subscribers
      this.routeMessage(message);

      // Handle system messages
      this.handleSystemMessage(message);

    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket connection closed:', event.code, event.reason);
    
    this.setState('disconnected');
    this.stats.lastDisconnected = Date.now();
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    // Attempt reconnection if enabled
    if (this.config.enableAutoReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.setState('reconnecting');
      this.scheduleReconnect();
    } else {
      this.setState('failed');
      notify.warning('Real-time updates disconnected');
      
      EventBus.emit(RestaurantEvents.WEBSOCKET_DISCONNECTED, {
        timestamp: Date.now(),
        reason: event.reason,
        code: event.code
      });
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    this.stats.failedConnections++;
    
    EventBus.emit(RestaurantEvents.WEBSOCKET_ERROR, {
      timestamp: Date.now(),
      error: error
    });
  }

  private handleConnectionError(error: any): void {
    console.error('WebSocket connection error:', error);
    this.setState('failed');
    this.stats.failedConnections++;
    
    if (this.config.enableAutoReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private handleNetworkLoss(): void {
    if (this.ws) {
      this.ws.close();
    }
    
    // Don't show notification for network loss - handled by offline manager
    console.log('WebSocket handling network loss gracefully');
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    
    // Check if we've exceeded max attempts - pause connections
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.connectionPaused = true;
      // Pause for 5 minutes after max attempts
      this.pauseUntil = Date.now() + (5 * 60 * 1000);
      console.log(`[WebSocketManager] Max reconnection attempts reached (${this.config.maxReconnectAttempts}). Pausing for 5 minutes.`);
      this.setState('failed');
      return;
    }

    // Enhanced exponential backoff with jitter
    const baseDelay = this.config.reconnectInterval * Math.pow(this.config.backoffMultiplier, this.reconnectAttempts - 1);
    const cappedDelay = Math.min(baseDelay, this.config.maxBackoffDelay);
    
    // Add jitter to prevent thundering herd
    const jitter = cappedDelay * this.config.jitterRange * (Math.random() * 2 - 1);
    const delay = Math.max(1000, cappedDelay + jitter); // Minimum 1 second

    console.log(`[WebSocketManager] Scheduling reconnection in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private setState(newState: WSConnectionState): void {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      
      console.log(`WebSocket state changed: ${oldState} -> ${newState}`);
      
      EventBus.emit(RestaurantEvents.WEBSOCKET_STATE_CHANGED, {
        oldState,
        newState,
        timestamp: Date.now()
      });
    }
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
    }

    this.lastHeartbeatResponse = Date.now();
    this.consecutiveHeartbeatFailures = 0;

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.sendHeartbeat();
      }
    }, this.config.heartbeatInterval);
  }

  private sendHeartbeat(): void {
    const heartbeatTimestamp = Date.now();
    
    // Check if previous heartbeat timed out
    if (this.lastHeartbeatResponse > 0 && 
        (heartbeatTimestamp - this.lastHeartbeatResponse) > (this.config.heartbeatTimeout + this.config.heartbeatInterval)) {
      this.consecutiveHeartbeatFailures++;
      console.warn(`[WebSocketManager] Heartbeat timeout detected (${this.consecutiveHeartbeatFailures}/${this.maxConsecutiveHeartbeatFailures})`);
      
      if (this.consecutiveHeartbeatFailures >= this.maxConsecutiveHeartbeatFailures) {
        console.error('[WebSocketManager] Multiple heartbeat failures detected, assuming connection is dead');
        this.handleHeartbeatFailure();
        return;
      }
    }
    
    // Send heartbeat with timeout tracking
    this.sendMessage({
      type: 'HEARTBEAT',
      data: { 
        timestamp: heartbeatTimestamp,
        sequence: this.consecutiveHeartbeatFailures 
      },
      priority: 'low'
    }).catch(error => {
      console.warn('[WebSocketManager] Heartbeat send failed:', error);
      this.consecutiveHeartbeatFailures++;
      
      if (this.consecutiveHeartbeatFailures >= this.maxConsecutiveHeartbeatFailures) {
        this.handleHeartbeatFailure();
      }
    });

    // Set timeout for heartbeat response
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
    }
    
    this.heartbeatTimeoutTimer = setTimeout(() => {
      this.consecutiveHeartbeatFailures++;
      console.warn(`[WebSocketManager] Heartbeat response timeout (${this.consecutiveHeartbeatFailures}/${this.maxConsecutiveHeartbeatFailures})`);
      
      if (this.consecutiveHeartbeatFailures >= this.maxConsecutiveHeartbeatFailures) {
        this.handleHeartbeatFailure();
      }
    }, this.config.heartbeatTimeout);
  }

  private handleHeartbeatFailure(): void {
    console.error('[WebSocketManager] Connection appears to be dead due to heartbeat failures');
    
    // Reset heartbeat state
    this.consecutiveHeartbeatFailures = 0;
    this.lastHeartbeatResponse = 0;
    
    // Close current connection and force reconnection
    if (this.ws) {
      this.ws.close(1006, 'Heartbeat failure');
    }
    
    // This will trigger reconnection logic in handleClose
  }

  private async sendMessageImmediate(message: WSMessage): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not ready');
    }

    try {
      this.ws.send(JSON.stringify(message));
      this.stats.messagesSent++;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      throw error;
    }
  }

  private async queueMessage(message: WSMessage): Promise<void> {
    // Add to queue with size limit
    this.messageQueue.push(message);
    
    if (this.messageQueue.length > this.config.messageQueueSize) {
      this.messageQueue.shift(); // Remove oldest message
    }

    // Persist queue
    await this.saveMessageQueue();
    
    console.log(`Message queued for later delivery: ${message.type}`);
  }

  private async processMessageQueue(): Promise<void> {
    if (this.messageQueue.length === 0) {
      return;
    }

    console.log(`Processing ${this.messageQueue.length} queued messages`);

    const messages = [...this.messageQueue];
    this.messageQueue = [];
    await this.saveMessageQueue();

    for (const message of messages) {
      try {
        await this.sendMessageImmediate(message);
      } catch (error) {
        console.error('Error sending queued message:', error);
        // Re-queue failed message
        this.messageQueue.unshift(message);
        break;
      }
    }
  }

  private sendAcknowledgment(messageId: string, originalData: any): void {
    this.sendMessage({
      type: 'ERROR', // Will be changed to ACK
      data: { messageId, originalData },
      priority: 'high'
    }).catch(error => {
      console.error('Failed to send acknowledgment:', error);
    });
  }

  private routeMessage(message: WSMessage): void {
    const typeListeners = this.listeners.get(message.type);
    if (typeListeners) {
      typeListeners.forEach(callback => {
        try {
          callback(message.data);
        } catch (error) {
          console.error(`Error in WebSocket message handler for ${message.type}:`, error);
        }
      });
    }
  }

  private handleSystemMessage(message: WSMessage): void {
    switch (message.type) {
      case 'HEARTBEAT':
        // Handle heartbeat response - reset failure counters
        this.lastHeartbeatResponse = Date.now();
        this.consecutiveHeartbeatFailures = 0;
        if (this.heartbeatTimeoutTimer) {
          clearTimeout(this.heartbeatTimeoutTimer);
          this.heartbeatTimeoutTimer = null;
        }
        break;
        
      case 'ORDER_CREATED':
      case 'ORDER_UPDATED':
      case 'ORDER_STATUS_CHANGED':
        EventBus.emit(RestaurantEvents.ORDER_UPDATED_REALTIME, message.data);
        break;
        
      case 'INVENTORY_UPDATED':
        EventBus.emit(RestaurantEvents.INVENTORY_UPDATED_REALTIME, message.data);
        break;
        
      case 'STAFF_CLOCK_ACTION':
        EventBus.emit(RestaurantEvents.STAFF_TIME_UPDATED_REALTIME, message.data);
        break;
        
      case 'KITCHEN_UPDATE':
        EventBus.emit(RestaurantEvents.KITCHEN_UPDATED_REALTIME, message.data);
        break;
        
      case 'NOTIFICATION':
        this.handleNotificationMessage(message.data);
        break;
        
      case 'SYNC_REQUEST':
        EventBus.emit(RestaurantEvents.SYNC_REQUESTED_REALTIME, message.data);
        break;
    }
  }

  private handleNotificationMessage(data: any): void {
    const { type, title, message, priority } = data;
    
    switch (priority) {
      case 'critical':
        notify.error(title, { description: message });
        break;
      case 'high':
        notify.warning(title, { description: message });
        break;
      case 'medium':
        notify.info(title, { description: message });
        break;
      default:
        notify.success(title, { description: message });
        break;
    }
  }

  private generateMessageId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global WebSocket manager instance
export const wsManager = new WebSocketManager();

// Auto-connect when online
if (typeof window !== 'undefined' && navigator.onLine) {
  wsManager.connect().catch(error => {
    console.warn('Initial WebSocket connection failed:', error);
  });
}