// BrowserLeaderElection.ts - Fast Bully Algorithm for Browser Environment
// Implements leader election for distributed EventBus coordination

import { SecureLogger } from '../utils/SecureLogger';

import { logger } from '@/lib/logging';
export interface LeaderElectionConfig {
  channelName: string;
  instanceId: string;
  heartbeatInterval: number;        // Leader heartbeat interval in ms (default: 2000)
  electionTimeout: number;          // Election timeout in ms (default: 5000)
  leadershipTimeout: number;        // Max time without heartbeat before starting election (default: 6000)
  priority?: number;                // Instance priority for leader election (higher = more priority)
}

export interface LeaderElectionMessage {
  type: 'ELECTION' | 'ELECTION_OK' | 'COORDINATOR' | 'HEARTBEAT';
  senderId: string;
  timestamp: number;
  priority?: number;
  data?: any;
}

export type LeadershipChangeCallback = (isLeader: boolean, previousLeader?: string) => void;

export class BrowserLeaderElection {
  private config: LeaderElectionConfig;
  private broadcastChannel: BroadcastChannel;
  private isCurrentlyLeader = false;
  private currentLeader?: string;
  private electionInProgress = false;
  private heartbeatInterval?: number;
  private leadershipTimeoutId?: number;
  private lastHeartbeat = 0;
  private leadershipCallbacks: LeadershipChangeCallback[] = [];
  private isDestroyed = false;

  // Election state
  private receivedElectionResponses = new Set<string>();
  private electionStartTime = 0;
  private pendingElectionTimeout?: number;
  private initialElectionTimeout?: number;

  // Metrics and tracking
  private totalLeadershipDuration = 0;
  private leadershipStartTime?: number;
  private electionCount = 0;
  private connectedInstances = new Set<string>();
  
  // Callback tracking
  private heartbeatCallbacks: ((instanceId: string) => void)[] = [];
  private shutdownCallbacks: ((instanceId: string) => void)[] = [];
  
  // Instance activity tracking
  private instanceLastSeen = new Map<string, number>();
  private instancePriorities = new Map<string, number>();
  private inactivityCheckInterval?: number;
  private lastKnownLeader?: string; // Track last known leader for callbacks

  constructor(config: LeaderElectionConfig) {
    this.config = {
      heartbeatInterval: 3000,   // Increased from 2000ms
      electionTimeout: 8000,     // Increased from 5000ms  
      leadershipTimeout: 10000,  // Increased from 6000ms
      ...config
    };

    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Initializing with priority ${this.config.priority || 'auto'}`);

    this.broadcastChannel = new BroadcastChannel(this.config.channelName);
    this.setupMessageHandling();
    this.startInactivityMonitoring();
    
    // TODO: Re-evaluate if initial heartbeat is needed
    // Send an initial heartbeat to announce presence immediately
    // This helps with instance detection before the delayed ANNOUNCE
    // setTimeout(() => {
    //   if (!this.isDestroyed) {
    //     this.sendMessage({
    //       type: 'HEARTBEAT',
    //       senderId: this.config.instanceId,
    //       timestamp: Date.now(),
    //       priority: this.config.priority || this.getInstancePriority(this.config.instanceId)
    //     });
    //   }
    // }, 10); // Very small delay to let constructor finish
    
    this.startInitialElection();
    
    // Standard Bully Algorithm: No ANNOUNCE messages needed
    // Elections are triggered by heartbeat timeouts only

    SecureLogger.info('EventBus', 'Leader election initialized', {
      instanceId: this.config.instanceId,
      channelName: this.config.channelName,
      priority: this.config.priority
    });
  }

  /**
   * Check if this instance is the current leader
   */
  isLeader(): boolean {
    return this.isCurrentlyLeader;
  }

  /**
   * Get the current leader instance ID
   */
  getCurrentLeader(): string | undefined {
    return this.currentLeader;
  }

  /**
   * Get this instance ID
   */
  getInstanceId(): string {
    return this.config.instanceId;
  }

  /**
   * Get list of connected instances
   */
  getConnectedInstances(): string[] {
    return Array.from(this.connectedInstances);
  }

  /**
   * Register callback for leadership changes
   */
  onLeadershipChange(callback: LeadershipChangeCallback): () => void {
    this.leadershipCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.leadershipCallbacks.indexOf(callback);
      if (index > -1) {
        this.leadershipCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Voluntarily step down from leadership
   */
  async stepDown(): Promise<void> {
    if (!this.isCurrentlyLeader) {
      return;
    }

    SecureLogger.info('EventBus', 'Stepping down from leadership', {
      instanceId: this.config.instanceId
    });

    // Notify other instances
    this.sendMessage({
      type: 'STEP_DOWN',
      senderId: this.config.instanceId,
      timestamp: Date.now()
    });

    // Stop being leader
    this.stopBeingLeader();

    // Start new election after a brief delay
    setTimeout(() => {
      if (!this.isDestroyed) {
        this.startElection();
      }
    }, 500);
  }

  /**
   * Setup message handling for leader election
   */
  private setupMessageHandling(): void {
    this.broadcastChannel.addEventListener('message', (event) => {
      if (this.isDestroyed) return;

      const message = event.data as LeaderElectionMessage;
      
      // Ignore messages from self
      if (message.senderId === this.config.instanceId) {
        return;
      }

      this.handleMessage(message);
    });

    // Handle browser tab/window close
    window.addEventListener('beforeunload', () => {
      this.destroy();
    });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: LeaderElectionMessage): void {
    // Track connected instances and their activity
    const wasNewInstance = !this.connectedInstances.has(message.senderId);
    this.connectedInstances.add(message.senderId);
    this.instanceLastSeen.set(message.senderId, Date.now());
    
    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Received ${message.type} from ${message.senderId}, connected instances: [${Array.from(this.connectedInstances).join(', ')}], wasNew: ${wasNewInstance}`);
    
    SecureLogger.debug('EventBus', 'Received leader election message', {
      type: message.type,
      from: message.senderId,
      instanceId: this.config.instanceId
    });

    switch (message.type) {
      case 'ELECTION':
        this.handleElectionMessage(message);
        break;
      
      case 'ELECTION_OK':
        this.handleElectionOkMessage(message);
        break;
      
      case 'COORDINATOR':
        logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Processing COORDINATOR message from ${message.senderId} with priority ${message.priority}`);
        this.handleCoordinatorMessage(message);
        break;
      
      case 'HEARTBEAT':
        this.handleHeartbeatMessage(message);
        break;
      
      case 'STEP_DOWN':
        this.handleStepDownMessage(message);
        break;
      
      case 'SHUTDOWN':
        this.handleShutdownMessage(message);
        break;
    }
  }

  /**
   * Handle ELECTION message - respond if we have higher priority
   */
  private handleElectionMessage(message: LeaderElectionMessage): void {
    // Use explicit priority if available, otherwise use instance ID-based priority
    const myPriority = this.config.priority || this.getInstancePriority(this.config.instanceId);
    const senderPriority = message.priority || this.getSenderPriority(message.senderId);

    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Election comparison - my priority: ${myPriority}, sender priority: ${senderPriority}, current leader: ${this.currentLeader}, am I leader: ${this.isCurrentlyLeader}`);

    if (myPriority > senderPriority) {
      logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: I have higher priority, responding with OK and preparing to take leadership`);
      
      // We have higher priority, respond with OK
      this.sendMessage({
        type: 'ELECTION_OK',
        senderId: this.config.instanceId,
        timestamp: Date.now(),
        priority: myPriority
      });

      // Standard Bully Algorithm: Just respond OK, don't become leader yet
      // Leaders are only elected through their own election process
      logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Responded OK, may start own election later if needed`);
    } else {
      logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Sender has higher priority (${senderPriority} > ${myPriority}), not responding`);
    }
    // If sender has higher priority, we don't respond (they should become leader)
  }

  /**
   * Handle ELECTION_OK message - someone with higher priority exists
   */
  private handleElectionOkMessage(message: LeaderElectionMessage): void {
    if (this.electionInProgress) {
      this.receivedElectionResponses.add(message.senderId);
      
      // Store priority information for completion analysis
      const senderPriority = message.priority || this.getSenderPriority(message.senderId);
      this.instancePriorities.set(message.senderId, senderPriority);
      
      SecureLogger.debug('EventBus', 'Received election response from higher priority instance', {
        from: message.senderId,
        priority: senderPriority,
        instanceId: this.config.instanceId
      });
    }
  }

  /**
   * Handle COORDINATOR message - new leader announcement
   */
  private handleCoordinatorMessage(message: LeaderElectionMessage): void {
    const previousLeader = this.currentLeader;
    
    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Received coordinator message from ${message.senderId}, previousLeader: ${previousLeader}, wasLeader: ${this.isCurrentlyLeader}, electionInProgress: ${this.electionInProgress}`);
    
    // Check if we have higher priority than the announcing leader
    const myPriority = this.config.priority || this.getInstancePriority(this.config.instanceId);
    const announcingLeaderPriority = message.priority || this.getSenderPriority(message.senderId);
    
    if (myPriority > announcingLeaderPriority) {
      logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: I have higher priority (${myPriority}) than announcing leader (${announcingLeaderPriority}), challenging`);
      
      // Cancel current election if in progress to start challenge
      if (this.electionInProgress) {
        logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Canceling current election to challenge lower priority leader`);
        this.cancelElection();
      }
      
      // Challenge the leadership immediately - no delays
      if (!this.isDestroyed) {
        logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Starting immediate challenge election against lower priority leader ${message.senderId}`);
        this.startElection();
      }
      return;
    }
    
    this.currentLeader = message.senderId;
    
    // If we were the leader, stop being leader
    if (this.isCurrentlyLeader) {
      logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Stepping down from leadership`);
      this.stopBeingLeader();
    }

    // Cancel any ongoing election
    this.cancelElection();

    // Reset heartbeat tracking
    this.lastHeartbeat = message.timestamp;
    this.startLeadershipTimeout();

    SecureLogger.info('EventBus', 'New leader elected', {
      leaderId: message.senderId,
      previousLeader,
      instanceId: this.config.instanceId
    });

    // Notify callbacks - only if we're not the new leader
    if (message.senderId !== this.config.instanceId) {
      logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Notifying ${this.leadershipCallbacks.length} callbacks about leadership change (new leader: ${message.senderId})`);
      this.notifyLeadershipChange(false, previousLeader);
    }
  }

  /**
   * Handle HEARTBEAT message - leader is alive
   */
  private handleHeartbeatMessage(message: LeaderElectionMessage): void {
    const myPriority = this.config.priority || this.getInstancePriority(this.config.instanceId);
    const senderPriority = message.priority || this.getSenderPriority(message.senderId);
    
    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Received HEARTBEAT from ${message.senderId}, currentLeader is ${this.currentLeader}, senderPriority: ${senderPriority}, myPriority: ${myPriority}`);
    
    // Handle heartbeat from known current leader
    if (message.senderId === this.currentLeader) {
      this.lastHeartbeat = message.timestamp;
      this.startLeadershipTimeout(); // Reset timeout
      
      // Check if we have higher priority than the current leader
      if (myPriority > senderPriority && !this.isCurrentlyLeader) {
        logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Detected leader ${message.senderId} with lower priority (${senderPriority} < ${myPriority}), checking if challenge needed`);
        
        // Only start challenge if we're not already in an election
        // This prevents the infinite loop of cancelling and restarting elections
        if (!this.electionInProgress) {
          logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Starting challenge election against lower priority leader`);
          if (!this.isDestroyed) {
            this.startElection();
          }
        } else {
          logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Already in election process, not restarting challenge (this prevents infinite loops)`);
        }
      } else {
        logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Not challenging leader - myPriority: ${myPriority}, senderPriority: ${senderPriority}, isCurrentlyLeader: ${this.isCurrentlyLeader}`);
      }
    }
    // Handle heartbeat from potential competing leader (split-brain resolution)
    else if (this.isCurrentlyLeader && message.senderId !== this.config.instanceId) {
      logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Received heartbeat from competing leader ${message.senderId} (priority ${senderPriority}) while I am leader (priority ${myPriority})`);
      
      if (senderPriority > myPriority) {
        logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Competing leader has higher priority, stepping down`);
        
        // Step down immediately - the other leader has higher priority
        this.stopBeingLeader();
        this.currentLeader = message.senderId;
        this.lastHeartbeat = message.timestamp;
        this.startLeadershipTimeout();
        
        // Notify about leadership change
        this.notifyLeadershipChange(false, this.config.instanceId);
      } else {
        logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: I have higher priority than competing leader, continuing as leader`);
        // Send COORDINATOR message to assert dominance
        this.sendMessage({
          type: 'COORDINATOR',
          senderId: this.config.instanceId,
          timestamp: Date.now(),
          priority: myPriority
        });
      }
    }
    // Handle heartbeat from unknown leader when we're not leader  
    else if (!this.isCurrentlyLeader && message.senderId !== this.currentLeader) {
      logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Received heartbeat from unknown leader ${message.senderId} (priority ${senderPriority}), considering as current leader`);
      
      // Accept this as the new leader if we don't have one, or if this one has higher priority
      if (!this.currentLeader || senderPriority > (this.getSenderPriority(this.currentLeader) || 0)) {
        this.currentLeader = message.senderId;
        this.lastHeartbeat = message.timestamp;
        this.startLeadershipTimeout();
      }
    }
      
      // Notify heartbeat callbacks
      this.heartbeatCallbacks.forEach(callback => {
        try {
          callback(message.senderId);
        } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
          logger.error('EventBus', `[DEBUG] ${this.config.instanceId}: Error in heartbeat callback:`, error);
        }
      });
  }

  /**
   * Handle STEP_DOWN message - current leader is stepping down
   */
  private handleStepDownMessage(message: LeaderElectionMessage): void {
    if (message.senderId === this.currentLeader) {
      SecureLogger.info('EventBus', 'Current leader stepped down', {
        leaderId: message.senderId,
        instanceId: this.config.instanceId
      });

      this.currentLeader = undefined;
      
      // Start election after a brief delay to avoid conflicts
      setTimeout(() => {
        if (!this.isDestroyed) {
          this.startElection();
        }
      }, Math.random() * 1000); // Random delay to spread out elections
    }
  }

  /**
   * Handle SHUTDOWN message - clean up instance immediately
   */
  private handleShutdownMessage(message: LeaderElectionMessage): void {
    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Received shutdown notification from ${message.senderId}`);
    
    // Remove the instance from tracking
    this.connectedInstances.delete(message.senderId);
    this.instanceLastSeen.delete(message.senderId);
    
    // If it was the current leader, save previous leader info and clear leader
    if (message.senderId === this.currentLeader) {
      // Store the previous leader for future leadership transitions
      this.lastKnownLeader = this.currentLeader;
      this.currentLeader = undefined;
      
      // Start election after a brief delay
      setTimeout(() => {
        if (!this.isDestroyed) {
          this.startElection();
        }
      }, Math.random() * 500); // Faster response to leader shutdown
    }
    
    // Notify shutdown callbacks
    this.shutdownCallbacks.forEach(callback => {
      try {
        callback(message.senderId);
      } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
        logger.error('EventBus', `[DEBUG] ${this.config.instanceId}: Error in shutdown callback for ${message.senderId}:`, error);
      }
    });
    
    SecureLogger.info('EventBus', 'Instance shutdown detected', {
      shutdownInstanceId: message.senderId,
      instanceId: this.config.instanceId
    });
  }

  // REMOVED: handleAnnounceMessage() and announcePresence() 
  // These are NOT part of the standard Bully Algorithm
  // Standard algorithm only uses: ELECTION, ELECTION_OK, COORDINATOR, HEARTBEAT

  /**
   * Start initial election when instance starts
   */
  private startInitialElection(): void {
    // Standard Bully Algorithm: Simple timeout-based initial election
    const isTest = typeof global !== 'undefined' && global.process?.env?.NODE_ENV === 'test' || 
                   typeof window !== 'undefined' && window.location?.hostname === 'localhost';
    
    // Uniform delay for all instances - no priority-based timing complications
    const delay = isTest ? 200 : 1000;
    
    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Scheduling initial election in ${delay}ms`);
    
    this.initialElectionTimeout = window.setTimeout(() => {
      logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Initial election timeout fired`);
      if (!this.isDestroyed && !this.currentLeader && !this.electionInProgress) {
        logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Starting initial election`);
        this.startElection();
      } else {
        logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Skipping initial election - leader: ${this.currentLeader}, election in progress: ${this.electionInProgress}, destroyed: ${this.isDestroyed}`);
      }
    }, delay);
  }

  /**
   * Start leader election process
   */
  private startElection(): void {
    if (this.electionInProgress || this.isDestroyed) {
      logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Cannot start election - already in progress: ${this.electionInProgress}, destroyed: ${this.isDestroyed}`);
      return;
    }

    this.electionInProgress = true;
    this.electionStartTime = Date.now();
    this.receivedElectionResponses.clear();
    
    // Increment election count when participating in election
    this.electionCount++;

    const myPriority = this.config.priority || this.getInstancePriority(this.config.instanceId);
    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Starting election with priority ${myPriority}, participationCount: ${this.electionCount}`);

    SecureLogger.info('EventBus', 'Starting leader election', {
      instanceId: this.config.instanceId,
      priority: myPriority
    });

    // Send ELECTION message to all instances
    this.sendMessage({
      type: 'ELECTION',
      senderId: this.config.instanceId,
      timestamp: Date.now(),
      priority: myPriority
    });

    // Wait for responses - shorter timeout in test environment
    const isTest = typeof global !== 'undefined' && global.process?.env?.NODE_ENV === 'test' || 
                   typeof window !== 'undefined' && window.location?.hostname === 'localhost';
    const electionTimeout = isTest ? Math.min(this.config.electionTimeout, 2000) : this.config.electionTimeout;
    
    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Setting election timeout for ${electionTimeout}ms`);
    this.pendingElectionTimeout = window.setTimeout(() => {
      logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Election timeout fired, calling completeElection()`);
      this.completeElection();
    }, electionTimeout);
  }

  /**
   * Complete election process
   */
  private completeElection(): void {
    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: completeElection() called, electionInProgress: ${this.electionInProgress}`);
    if (!this.electionInProgress) {
      logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Election not in progress, skipping completion`);
      return;
    }

    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Completing election - received ${this.receivedElectionResponses.size} responses from: [${Array.from(this.receivedElectionResponses).join(', ')}]`);

    this.electionInProgress = false;
    
    if (this.pendingElectionTimeout) {
      clearTimeout(this.pendingElectionTimeout);
      this.pendingElectionTimeout = undefined;
    }

    // Standard Bully Algorithm: If no responses received, become leader immediately
    if (this.receivedElectionResponses.size === 0) {
      logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: No responses received, becoming leader`);
      this.becomeLeader();
    } else {
      // Check if any responder has higher priority than us
      const myPriority = this.config.priority || this.getInstancePriority(this.config.instanceId);
      let hasHigherPriorityResponder = false;
      
      for (const responderId of this.receivedElectionResponses) {
        const responderPriority = this.instancePriorities.get(responderId) || this.getSenderPriority(responderId);
        logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Checking responder ${responderId} with priority ${responderPriority} vs my priority ${myPriority}`);
        
        if (responderPriority > myPriority) {
          hasHigherPriorityResponder = true;
          logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Found higher priority responder: ${responderId} (${responderPriority})`);
          break;
        }
      }
      
      if (hasHigherPriorityResponder) {
        logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Responses from higher priority instances, waiting for coordinator`);
        
        SecureLogger.debug('EventBus', 'Election completed - waiting for higher priority instance', {
          responses: this.receivedElectionResponses.size,
          instanceId: this.config.instanceId
        });

        // Wait for COORDINATOR message, or restart election if it doesn't come
        setTimeout(() => {
          if (!this.currentLeader && !this.isDestroyed) {
            logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: No coordinator message received, restarting election`);
            SecureLogger.warn('EventBus', 'No coordinator message received, restarting election');
            this.startElection();
          }
        }, this.config.electionTimeout);
      } else {
        logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: All responders have lower priority, becoming leader`);
        this.becomeLeader();
      }
    }
  }

  /**
   * Cancel ongoing election
   */
  private cancelElection(): void {
    if (this.electionInProgress) {
      logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Canceling election, was in progress: ${this.electionInProgress}, had timeout: ${!!this.pendingElectionTimeout}`);
      this.electionInProgress = false;
      this.receivedElectionResponses.clear();
      
      if (this.pendingElectionTimeout) {
        logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Clearing pending election timeout`);
        clearTimeout(this.pendingElectionTimeout);
        this.pendingElectionTimeout = undefined;
      }
    } else {
      logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: cancelElection() called but no election was in progress`);
    }
  }

  /**
   * Become the leader
   */
  private becomeLeader(): void {
    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: becomeLeader() called - current state: isCurrentlyLeader=${this.isCurrentlyLeader}, isDestroyed=${this.isDestroyed}, currentLeader=${this.currentLeader}`);
    
    if (this.isCurrentlyLeader || this.isDestroyed) {
      logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Cannot become leader - already leader: ${this.isCurrentlyLeader}, destroyed: ${this.isDestroyed}`);
      return;
    }

    const previousLeader = this.currentLeader || this.lastKnownLeader;
    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: BECOMING LEADER - setting isCurrentlyLeader=true, previousLeader=${previousLeader}`);
    
    this.isCurrentlyLeader = true;
    this.currentLeader = this.config.instanceId;
    this.leadershipStartTime = Date.now();
    
    // Clear lastKnownLeader since we're now the leader
    this.lastKnownLeader = undefined;

    const myPriority = this.config.priority || this.getInstancePriority(this.config.instanceId);
    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: NOW LEADER with priority ${myPriority}, totalElections: ${this.electionCount}, isCurrentlyLeader=${this.isCurrentlyLeader}`);

    // Announce leadership
    this.sendMessage({
      type: 'COORDINATOR',
      senderId: this.config.instanceId,
      timestamp: Date.now(),
      priority: myPriority
    });

    // Start sending heartbeats
    this.startHeartbeat();

    SecureLogger.info('EventBus', 'Became leader', {
      instanceId: this.config.instanceId,
      previousLeader,
      priority: myPriority
    });

    // Standard Bully Algorithm: Heartbeats are sent on regular intervals only
    // No immediate or split-brain detection heartbeats needed

    // Notify callbacks
    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Notifying ${this.leadershipCallbacks.length} callbacks about leadership change (became leader)`);
    this.notifyLeadershipChange(true, previousLeader);
  }

  /**
   * Stop being leader
   */
  private stopBeingLeader(): void {
    if (!this.isCurrentlyLeader) {
      return;
    }

    const wasLeader = this.isCurrentlyLeader;
    
    // Update leadership duration metrics
    if (this.leadershipStartTime) {
      this.totalLeadershipDuration += Date.now() - this.leadershipStartTime;
      this.leadershipStartTime = undefined;
    }
    
    this.isCurrentlyLeader = false;

    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }

    SecureLogger.info('EventBus', 'Stopped being leader', {
      instanceId: this.config.instanceId
    });

    if (wasLeader) {
      this.notifyLeadershipChange(false);
    }
  }

  /**
   * Start sending leader heartbeats
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Starting heartbeat with interval ${this.config.heartbeatInterval}ms`);

    this.heartbeatInterval = window.setInterval(() => {
      if (this.isCurrentlyLeader && !this.isDestroyed) {
        const myPriority = this.config.priority || this.getInstancePriority(this.config.instanceId);
        logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Sending heartbeat as leader`);
        
        this.sendMessage({
          type: 'HEARTBEAT',
          senderId: this.config.instanceId,
          timestamp: Date.now(),
          priority: myPriority
        });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Start timeout for leader heartbeat
   */
  private startLeadershipTimeout(): void {
    if (this.leadershipTimeoutId) {
      clearTimeout(this.leadershipTimeoutId);
    }

    this.leadershipTimeoutId = window.setTimeout(() => {
      if (!this.isCurrentlyLeader && !this.isDestroyed) {
        SecureLogger.warn('EventBus', 'Leader heartbeat timeout, starting election', {
          currentLeader: this.currentLeader,
          instanceId: this.config.instanceId
        });

        this.currentLeader = undefined;
        this.startElection();
      }
    }, this.config.leadershipTimeout);
  }

  /**
   * Start monitoring for inactive instances
   */
  private startInactivityMonitoring(): void {
    this.inactivityCheckInterval = window.setInterval(() => {
      const now = Date.now();
      const inactivityThreshold = this.config.leadershipTimeout * 2; // 2x leadership timeout
      
      const inactiveInstances: string[] = [];
      
      this.instanceLastSeen.forEach((lastSeen, instanceId) => {
        if (now - lastSeen > inactivityThreshold) {
          inactiveInstances.push(instanceId);
        }
      });
      
      // Remove inactive instances and notify callbacks
      inactiveInstances.forEach(instanceId => {
        logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Detected inactive instance: ${instanceId}`);
        this.connectedInstances.delete(instanceId);
        this.instanceLastSeen.delete(instanceId);
        
        // Notify shutdown callbacks
        this.shutdownCallbacks.forEach(callback => {
          try {
            callback(instanceId);
          } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
            logger.error('EventBus', `[DEBUG] ${this.config.instanceId}: Error in shutdown callback for ${instanceId}:`, error);
          }
        });
      });
    }, this.config.heartbeatInterval); // Check every heartbeat interval
  }

  /**
   * Get instance priority based on ID
   * Later instances have higher priority (helps with split-brain scenarios)
   */
  private getInstancePriority(instanceId: string): number {
    // Extract timestamp from instance ID if available
    if (!instanceId || typeof instanceId !== 'string') {
      return Math.random();
    }
    const parts = instanceId.split('-');
    if (parts.length > 0) {
      const timestamp = parseInt(parts[0], 10);
      if (!isNaN(timestamp)) {
        return timestamp;
      }
    }
    
    // Fallback to deterministic string-based priority
    // Use lexicographic comparison to ensure consistency
    // Higher string values = higher priority (deterministic)
    let priority = 0;
    for (let i = 0; i < instanceId.length; i++) {
      priority += instanceId.charCodeAt(i) * (i + 1);
    }
    
    // Ensure positive value and reasonable range
    return Math.abs(priority) % 100000;
  }

  /**
   * Get priority for sender instance 
   * For now, we need to assume sender's priority is in their instanceId
   * In a real implementation, this would be included in the message
   */
  private getSenderPriority(senderId: string): number {
    // Try to extract numeric priority from instance name
    const parts = senderId.split('-');
    if (parts.length >= 2) {
      const potentialPriority = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(potentialPriority)) {
        return potentialPriority;
      }
    }
    
    // Fallback to ID-based priority
    return this.getInstancePriority(senderId);
  }

  /**
   * Send message to all instances
   */
  private sendMessage(message: LeaderElectionMessage): void {
    try {
      // Check if channel is still open before sending
      if (this.isDestroyed) {
        logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Cannot send message - instance destroyed`);
        return;
      }
      
      this.broadcastChannel.postMessage(message);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('EventBus', `[DEBUG] ${this.config.instanceId}: Failed to send message:`, error);
      SecureLogger.error('EventBus', 'Failed to send leader election message', {
        messageType: message.type,
        error: err.message,
        instanceId: this.config.instanceId
      });
      
      // If BroadcastChannel fails, consider this instance as potentially isolated
      // Don't become leader if we can't communicate
      if (this.isCurrentlyLeader) {
        logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Communication failure as leader, stepping down`);
        this.stopBeingLeader();
      }
    }
  }

  /**
   * Notify all registered callbacks about leadership change
   */
  private notifyLeadershipChange(isLeader: boolean, previousLeader?: string): void {
    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: notifyLeadershipChange called with isLeader=${isLeader}, previousLeader=${previousLeader}, callbacks=${this.leadershipCallbacks.length}`);
    
    if (this.leadershipCallbacks.length === 0) {
      logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: No callbacks registered`);
      return;
    }
    
    this.leadershipCallbacks.forEach((callback, index) => {
      const retryCallback = (attempt: number = 1) => {
        try {
          logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Calling callback ${index} (attempt ${attempt}) with (${isLeader}, ${previousLeader})`);
          callback(isLeader, previousLeader);
          logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Callback ${index} completed successfully`);
        } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
          logger.error('EventBus', `[DEBUG] ${this.config.instanceId}: Callback ${index} failed on attempt ${attempt}:`, error);
          
          // Retry once after a short delay
          if (attempt === 1) {
            setTimeout(() => retryCallback(2), 10);
          } else {
            SecureLogger.error('EventBus', 'Error in leadership change callback after retry', { 
              error, 
              instanceId: this.config.instanceId,
              callbackIndex: index 
            });
          }
        }
      };
      
      retryCallback();
    });
    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: All callbacks processed`);
  }

  /**
   * Get leadership metrics
   */
  getLeadershipMetrics(): {
    isCurrentLeader: boolean;
    totalLeadershipDuration: number;
    currentLeadershipStart: number;
    electionCount: number;
    connectedInstances: number;
  } {
    const now = Date.now();
    let totalDuration = this.totalLeadershipDuration;
    
    // Add current leadership duration if currently leader
    if (this.isCurrentlyLeader && this.leadershipStartTime) {
      totalDuration += now - this.leadershipStartTime;
    }
    
    return {
      isCurrentLeader: this.isCurrentlyLeader,
      totalLeadershipDuration: totalDuration,
      currentLeadershipStart: this.leadershipStartTime || 0,
      electionCount: this.electionCount,
      connectedInstances: this.connectedInstances.size
    };
  }

  /**
   * Register callback for heartbeat events
   */
  onHeartbeat(callback: (instanceId: string) => void): () => void {
    this.heartbeatCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.heartbeatCallbacks.indexOf(callback);
      if (index > -1) {
        this.heartbeatCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Register callback for instance shutdown events  
   */
  onInstanceShutdown(callback: (instanceId: string) => void): () => void {
    this.shutdownCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.shutdownCallbacks.indexOf(callback);
      if (index > -1) {
        this.shutdownCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    logger.debug('EventBus', `[DEBUG] ${this.config.instanceId}: Destroying leader election instance`);

    // Send shutdown notification to other instances BEFORE marking as destroyed
    const myPriority = this.config.priority || this.getInstancePriority(this.config.instanceId);
    this.sendMessage({
      type: 'SHUTDOWN',
      senderId: this.config.instanceId,
      timestamp: Date.now(),
      priority: myPriority
    });

    // Step down if leader
    if (this.isCurrentlyLeader) {
      this.sendMessage({
        type: 'STEP_DOWN',
        senderId: this.config.instanceId,
        timestamp: Date.now(),
        priority: myPriority
      });
      this.stopBeingLeader();
    }

    // Mark as destroyed AFTER sending messages
    this.isDestroyed = true;

    // Clear all timeouts and intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.leadershipTimeoutId) {
      clearTimeout(this.leadershipTimeoutId);
    }
    
    if (this.pendingElectionTimeout) {
      clearTimeout(this.pendingElectionTimeout);
    }

    if (this.initialElectionTimeout) {
      clearTimeout(this.initialElectionTimeout);
    }

    if (this.inactivityCheckInterval) {
      clearInterval(this.inactivityCheckInterval);
    }

    // Close broadcast channel after a brief delay to ensure shutdown message is sent
    setTimeout(() => {
      this.broadcastChannel.close();
    }, 10);

    // Clear callbacks
    this.leadershipCallbacks = [];
    this.heartbeatCallbacks = [];
    this.shutdownCallbacks = [];

    SecureLogger.info('EventBus', 'Leader election destroyed', {
      instanceId: this.config.instanceId
    });
  }
}

export default BrowserLeaderElection;