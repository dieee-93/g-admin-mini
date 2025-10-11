// CrossInstanceCoordinator.ts - Cross-instance event propagation via BroadcastChannel
// Handles direct communication between EventBus instances in different tabs/windows

import { NamespacedEvent } from '../types';
import { SecureLogger } from '../utils/SecureLogger';

export interface CrossInstanceConfig {
  channelName: string;
  instanceId: string;
  busId: string;
  maxMessageSize: number;           // Maximum message size in bytes (default: 64KB)
  compressionEnabled: boolean;      // Enable message compression
  acknowledgmentTimeout: number;    // Timeout for message acknowledgments (default: 5000ms)
  retryAttempts: number;           // Number of retry attempts for failed deliveries (default: 3)
}

export interface CrossInstanceMessage {
  type: 'EVENT' | 'ACK' | 'PING' | 'PONG' | 'SHUTDOWN' | 'INSTANCE_REGISTRY';
  messageId: string;
  senderId: string;
  targetId?: string;                // Specific target instance (for unicast)
  busId: string;
  timestamp: number;
  data: any;
  compressed?: boolean;
  requiresAck?: boolean;
}

export interface InstanceInfo {
  instanceId: string;
  busId: string;
  lastSeen: number;
  isActive: boolean;
  capabilities: string[];
}

export type RemoteEventCallback = (event: NamespacedEvent) => void;

export class CrossInstanceCoordinator {
  private config: CrossInstanceConfig;
  private broadcastChannel: BroadcastChannel;
  private remoteEventCallbacks: RemoteEventCallback[] = [];
  private connectedInstances = new Map<string, InstanceInfo>();
  private pendingAcknowledgments = new Map<string, {
    resolve: () => void;
    reject: (error: Error) => void;
    timeout: number;
  }>();
  
  // Statistics
  private stats = {
    eventsPropagated: 0,
    eventsReceived: 0,
    messagesDropped: 0,
    compressionRatio: 0,
    averageLatency: 0
  };

  // Health monitoring
  private pingInterval?: number;
  private instanceCleanupInterval?: number;
  private isDestroyed = false;

  constructor(config: CrossInstanceConfig) {
    this.config = {
      maxMessageSize: 64 * 1024, // 64KB
      compressionEnabled: true,
      acknowledgmentTimeout: 5000,
      retryAttempts: 3,
      ...config
    };

    this.broadcastChannel = new BroadcastChannel(this.config.channelName);
    this.setupMessageHandling();
    this.startHealthMonitoring();
    this.announceInstance();

    SecureLogger.info('EventBus', 'Cross-instance coordinator initialized', {
      instanceId: this.config.instanceId,
      busId: this.config.busId,
      channelName: this.config.channelName
    });
  }

  /**
   * Register callback for remote events
   */
  onRemoteEvent(callback: RemoteEventCallback): () => void {
    this.remoteEventCallbacks.push(callback);
    
    return () => {
      const index = this.remoteEventCallbacks.indexOf(callback);
      if (index > -1) {
        this.remoteEventCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Propagate event to other instances
   */
  async propagateEvent(event: NamespacedEvent): Promise<void> {
    try {
      const message: CrossInstanceMessage = {
        type: 'EVENT',
        messageId: this.generateMessageId(),
        senderId: this.config.instanceId,
        busId: this.config.busId,
        timestamp: Date.now(),
        data: event,
        requiresAck: false // For now, fire-and-forget
      };

      // Check message size
      const messageSize = this.calculateMessageSize(message);
      if (messageSize > this.config.maxMessageSize) {
        if (this.config.compressionEnabled) {
          message.data = await this.compressData(event);
          message.compressed = true;
          
          const compressedSize = this.calculateMessageSize(message);
          if (compressedSize > this.config.maxMessageSize) {
            throw new Error(`Event too large even after compression: ${compressedSize} bytes`);
          }
          
          this.updateCompressionStats(messageSize, compressedSize);
        } else {
          throw new Error(`Event too large: ${messageSize} bytes`);
        }
      }

      await this.sendMessage(message);
      this.stats.eventsPropagated++;

      SecureLogger.debug('EventBus', 'Event propagated to other instances', {
        eventId: event.id,
        pattern: event.pattern,
        messageSize: messageSize,
        compressed: message.compressed
      });
    } catch (error) {
      this.stats.messagesDropped++;
      SecureLogger.error('EventBus', 'Failed to propagate event', {
        eventId: event.id,
        pattern: event.pattern,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Notify other instances of shutdown
   */
  async notifyShutdown(): Promise<void> {
    const message: CrossInstanceMessage = {
      type: 'SHUTDOWN',
      messageId: this.generateMessageId(),
      senderId: this.config.instanceId,
      busId: this.config.busId,
      timestamp: Date.now(),
      data: { reason: 'graceful_shutdown' }
    };

    await this.sendMessage(message);

    SecureLogger.info('EventBus', 'Shutdown notification sent to other instances', {
      instanceId: this.config.instanceId
    });
  }

  /**
   * Get number of connected instances
   */
  async getConnectedInstanceCount(): Promise<number> {
    this.cleanupInactiveInstances();
    return this.connectedInstances.size;
  }

  /**
   * Get statistics
   */
  getPropagatedEventCount(): number {
    return this.stats.eventsPropagated;
  }

  getReceivedEventCount(): number {
    return this.stats.eventsReceived;
  }

  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Setup message handling
   */
  private setupMessageHandling(): void {
    this.broadcastChannel.addEventListener('message', (_event) => {
      if (this.isDestroyed) return;

      const message = event.data as CrossInstanceMessage;
      
      // Ignore messages from self
      if (message.senderId === this.config.instanceId) {
        return;
      }

      // Ignore messages from different bus
      if (message.busId !== this.config.busId) {
        return;
      }

      this.handleMessage(message);
    });

    // Handle browser close
    window.addEventListener('beforeunload', () => {
      this.notifyShutdown().catch(() => {
        // Ignore errors during shutdown
      });
    });
  }

  /**
   * Handle incoming messages
   */
  private async handleMessage(message: CrossInstanceMessage): Promise<void> {
    try {
      // Update instance registry
      this.updateInstanceInfo(message.senderId);

      switch (message.type) {
        case 'EVENT':
          await this.handleEventMessage(message);
          break;
          
        case 'ACK':
          this.handleAckMessage(message);
          break;
          
        case 'PING':
          await this.handlePingMessage(message);
          break;
          
        case 'PONG':
          this.handlePongMessage(message);
          break;
          
        case 'SHUTDOWN':
          this.handleShutdownMessage(message);
          break;
          
        case 'INSTANCE_REGISTRY':
          this.handleInstanceRegistryMessage(message);
          break;
      }
    } catch (error) {
      SecureLogger.error('EventBus', 'Error handling cross-instance message', {
        messageType: message.type,
        senderId: message.senderId,
        error: error.message
      });
    }
  }

  /**
   * Handle incoming event message
   */
  private async handleEventMessage(message: CrossInstanceMessage): Promise<void> {
    let eventData = message.data;

    // Decompress if needed
    if (message.compressed) {
      eventData = await this.decompressData(message.data);
    }

    // Send acknowledgment if required
    if (message.requiresAck) {
      const ackMessage: CrossInstanceMessage = {
        type: 'ACK',
        messageId: this.generateMessageId(),
        senderId: this.config.instanceId,
        targetId: message.senderId,
        busId: this.config.busId,
        timestamp: Date.now(),
        data: { originalMessageId: message.messageId }
      };

      await this.sendMessage(ackMessage);
    }

    // Process the event
    this.stats.eventsReceived++;
    
    // Calculate latency
    const latency = Date.now() - message.timestamp;
    this.updateLatencyStats(latency);

    // Notify callbacks
    this.remoteEventCallbacks.forEach(callback => {
      try {
        callback(eventData as NamespacedEvent);
      } catch (error) {
        SecureLogger.error('EventBus', 'Error in remote event callback', { error });
      }
    });

    SecureLogger.debug('EventBus', 'Remote event received and processed', {
      eventId: eventData.id,
      pattern: eventData.pattern,
      senderId: message.senderId,
      latency
    });
  }

  /**
   * Handle acknowledgment message
   */
  private handleAckMessage(message: CrossInstanceMessage): void {
    const originalMessageId = message.data.originalMessageId;
    const pending = this.pendingAcknowledgments.get(originalMessageId);
    
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingAcknowledgments.delete(originalMessageId);
      pending.resolve();
    }
  }

  /**
   * Handle ping message
   */
  private async handlePingMessage(message: CrossInstanceMessage): Promise<void> {
    const pongMessage: CrossInstanceMessage = {
      type: 'PONG',
      messageId: this.generateMessageId(),
      senderId: this.config.instanceId,
      targetId: message.senderId,
      busId: this.config.busId,
      timestamp: Date.now(),
      data: { originalMessageId: message.messageId }
    };

    await this.sendMessage(pongMessage);
  }

  /**
   * Handle pong message
   */
  private handlePongMessage(message: CrossInstanceMessage): void {
    // Update instance as active
    this.updateInstanceInfo(message.senderId, true);
  }

  /**
   * Handle shutdown message
   */
  private handleShutdownMessage(message: CrossInstanceMessage): void {
    SecureLogger.info('EventBus', 'Instance shutdown notification received', {
      instanceId: message.senderId,
      reason: message.data.reason
    });

    // Remove from active instances
    this.connectedInstances.delete(message.senderId);
  }

  /**
   * Handle instance registry message
   */
  private handleInstanceRegistryMessage(message: CrossInstanceMessage): void {
    const instanceInfo = message.data as InstanceInfo;
    this.connectedInstances.set(instanceInfo.instanceId, instanceInfo);
  }

  /**
   * Update instance information
   */
  private updateInstanceInfo(instanceId: string, markActive = true): void {
    const existing = this.connectedInstances.get(instanceId);
    const now = Date.now();

    const instanceInfo: InstanceInfo = {
      instanceId,
      busId: this.config.busId,
      lastSeen: now,
      isActive: markActive,
      capabilities: existing?.capabilities || []
    };

    this.connectedInstances.set(instanceId, instanceInfo);
  }

  /**
   * Announce this instance to others
   */
  private async announceInstance(): Promise<void> {
    const message: CrossInstanceMessage = {
      type: 'INSTANCE_REGISTRY',
      messageId: this.generateMessageId(),
      senderId: this.config.instanceId,
      busId: this.config.busId,
      timestamp: Date.now(),
      data: {
        instanceId: this.config.instanceId,
        busId: this.config.busId,
        lastSeen: Date.now(),
        isActive: true,
        capabilities: ['events', 'compression']
      }
    };

    await this.sendMessage(message);
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    // Send ping to discover other instances
    this.pingInterval = window.setInterval(async () => {
      if (this.isDestroyed) return;

      const pingMessage: CrossInstanceMessage = {
        type: 'PING',
        messageId: this.generateMessageId(),
        senderId: this.config.instanceId,
        busId: this.config.busId,
        timestamp: Date.now(),
        data: {}
      };

      try {
        await this.sendMessage(pingMessage);
      } catch (error) {
        SecureLogger.error('EventBus', 'Failed to send ping', { error });
      }
    }, 10000); // Ping every 10 seconds

    // Cleanup inactive instances
    this.instanceCleanupInterval = window.setInterval(() => {
      if (this.isDestroyed) return;
      this.cleanupInactiveInstances();
    }, 30000); // Cleanup every 30 seconds
  }

  /**
   * Clean up inactive instances
   */
  private cleanupInactiveInstances(): void {
    const now = Date.now();
    const timeout = 60000; // 1 minute timeout

    for (const [instanceId, info] of this.connectedInstances.entries()) {
      if (now - info.lastSeen > timeout) {
        this.connectedInstances.delete(instanceId);
        
        SecureLogger.debug('EventBus', 'Removed inactive instance', {
          instanceId,
          lastSeen: new Date(info.lastSeen).toISOString()
        });
      }
    }
  }

  /**
   * Send message with optional retry logic
   */
  private async sendMessage(message: CrossInstanceMessage): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        this.broadcastChannel.postMessage(message);
        return; // Success
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.retryAttempts) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All attempts failed
    throw new Error(`Failed to send message after ${this.config.retryAttempts} attempts: ${lastError?.message}`);
  }

  /**
   * Calculate message size in bytes
   */
  private calculateMessageSize(message: CrossInstanceMessage): number {
    return new Blob([JSON.stringify(message)]).size;
  }

  /**
   * Compress data using built-in compression
   */
  private async compressData(data: any): Promise<string> {
    // For browser environment, we use simple string compression
    // In a real implementation, you might use libraries like pako for gzip
    const jsonString = JSON.stringify(data);
    
    // Simple RLE-like compression for demo
    return jsonString.replace(/(.)\1+/g, (match, char) => {
      return match.length > 3 ? `${char}*${match.length}` : match;
    });
  }

  /**
   * Decompress data
   */
  private async decompressData(compressedData: string): Promise<any> {
    // Reverse the simple compression
    const decompressed = compressedData.replace(/(.)\*(\d+)/g, (match, char, count) => {
      return char.repeat(parseInt(count, 10));
    });
    
    return JSON.parse(decompressed);
  }

  /**
   * Update compression statistics
   */
  private updateCompressionStats(originalSize: number, compressedSize: number): void {
    const ratio = compressedSize / originalSize;
    this.stats.compressionRatio = this.stats.compressionRatio === 0 
      ? ratio 
      : (this.stats.compressionRatio + ratio) / 2;
  }

  /**
   * Update latency statistics
   */
  private updateLatencyStats(latency: number): void {
    this.stats.averageLatency = this.stats.averageLatency === 0
      ? latency
      : (this.stats.averageLatency * 0.9 + latency * 0.1); // Exponential moving average
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `${this.config.instanceId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Wait for acknowledgment with timeout
   */
  private async waitForAcknowledgment(messageId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingAcknowledgments.delete(messageId);
        reject(new Error('Acknowledgment timeout'));
      }, this.config.acknowledgmentTimeout);

      this.pendingAcknowledgments.set(messageId, {
        resolve,
        reject,
        timeout
      });
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    // Clear intervals
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    if (this.instanceCleanupInterval) {
      clearInterval(this.instanceCleanupInterval);
    }

    // Clear pending acknowledgments
    for (const [messageId, pending] of this.pendingAcknowledgments.entries()) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Coordinator destroyed'));
    }
    this.pendingAcknowledgments.clear();

    // Close broadcast channel
    this.broadcastChannel.close();

    // Clear callbacks
    this.remoteEventCallbacks = [];
    this.connectedInstances.clear();

    SecureLogger.info('EventBus', 'Cross-instance coordinator destroyed', {
      instanceId: this.config.instanceId
    });
  }
}

export default CrossInstanceCoordinator;