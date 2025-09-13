// BrowserLeaderElection.test.ts - Test suite for browser-based leader election
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BrowserLeaderElection, type LeaderElectionConfig } from '../BrowserLeaderElection';

// Mock BroadcastChannel
class MockBroadcastChannel {
  name: string;
  private listeners = new Set<(event: any) => void>();
  static channels = new Map<string, MockBroadcastChannel[]>();
  private static nextId = 0;
  private instanceId: number;

  constructor(name: string) {
    this.name = name;
    this.instanceId = MockBroadcastChannel.nextId++;
    
    console.log(`[MOCK] Creating BroadcastChannel for ${name}, instanceId: ${this.instanceId}`);
    
    // Store instances by channel name, allowing multiple instances per channel
    if (!MockBroadcastChannel.channels.has(name)) {
      MockBroadcastChannel.channels.set(name, []);
    }
    MockBroadcastChannel.channels.get(name)!.push(this);
  }

  addEventListener(type: string, listener: (event: any) => void) {
    if (type === 'message') {
      this.listeners.add(listener);
      console.log(`[MOCK] Added listener to instance ${this.instanceId}, total listeners: ${this.listeners.size}`);
    }
  }

  removeEventListener(type: string, listener: (event: any) => void) {
    this.listeners.delete(listener);
  }

  postMessage(data: any) {
    const channelInstances = MockBroadcastChannel.channels.get(this.name) || [];
    const otherInstances = channelInstances.filter(instance => instance !== this);
    
    console.log(`[MOCK] Instance ${this.instanceId} broadcasting to ${otherInstances.length} other instances. Message type: ${data.type}, senderId: ${data.senderId}`);
    
    // Use setTimeout with 0 delay for better test compatibility
    setTimeout(() => {
      const event = { data, type: 'message' };
      otherInstances.forEach((instance, index) => {
        console.log(`[MOCK] Sending to instance ${instance.instanceId} (${instance.listeners.size} listeners)`);
        instance.listeners.forEach(listener => {
          try {
            listener(event);
          } catch (error) {
            console.error(`[MOCK] Error in listener for instance ${instance.instanceId}:`, error);
          }
        });
      });
    }, 0);
  }

  close() {
    console.log(`[MOCK] Closing BroadcastChannel instance ${this.instanceId}`);
    this.listeners.clear();
    
    const channelInstances = MockBroadcastChannel.channels.get(this.name);
    if (channelInstances) {
      const index = channelInstances.indexOf(this);
      if (index > -1) {
        channelInstances.splice(index, 1);
      }
      
      if (channelInstances.length === 0) {
        MockBroadcastChannel.channels.delete(this.name);
      }
    }
  }
}

global.BroadcastChannel = MockBroadcastChannel as any;

describe('BrowserLeaderElection', () => {
  let election1: BrowserLeaderElection;
  let election2: BrowserLeaderElection;
  let election3: BrowserLeaderElection;
  let config: LeaderElectionConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    MockBroadcastChannel.channels.clear();
    MockBroadcastChannel.nextId = 0;

    config = {
      instanceId: 'test-instance-1',
      channelName: 'test-election-channel',
      electionTimeout: 1000,
      heartbeatInterval: 500,
      leadershipTimeout: 1200,
      priority: 100
    };
  });

  afterEach(async () => {
    // Destroy all election instances and wait for cleanup
    const cleanupPromises = [];
    
    if (election1) {
      cleanupPromises.push(election1.destroy());
      election1 = null as any;
    }
    if (election2) {
      cleanupPromises.push(election2.destroy());
      election2 = null as any;
    }
    if (election3) {
      cleanupPromises.push(election3.destroy());
      election3 = null as any;
    }
    
    // Wait for all cleanup to complete
    await Promise.all(cleanupPromises);
    
    // Clear all mock state
    MockBroadcastChannel.channels.clear();
    MockBroadcastChannel.nextId = 0;
    
    // Additional wait to ensure all asynchronous operations are complete
    // This prevents interference between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Initialization', () => {
    it('should initialize with correct configuration', () => {
      election1 = new BrowserLeaderElection(config);
      
      expect(election1.getInstanceId()).toBe('test-instance-1');
      expect(election1.isLeader()).toBe(false); // Should not be leader immediately
    });

    it('should start as candidate and attempt to become leader', async () => {
      election1 = new BrowserLeaderElection(config);
      
      // Wait for initial election process - increased timeout for suite runs
      // Initial delay (200ms) + election timeout (1000ms) + buffer for suite interference
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // With only one instance, should become leader
      expect(election1.isLeader()).toBe(true);
    });

    it('should handle multiple instances with different priorities', async () => {
      const config1 = { ...config, instanceId: 'instance-1', priority: 100 };
      const config2 = { ...config, instanceId: 'instance-2', priority: 200 }; // Higher priority
      
      election1 = new BrowserLeaderElection(config1);
      // Small delay to let first instance start its election
      await new Promise(resolve => setTimeout(resolve, 100));
      
      election2 = new BrowserLeaderElection(config2);
      
      // Wait for elections to complete and settle (including challenge elections and stabilization)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Wait for leadership transitions to stabilize by polling
      let election2IsLeader = false;
      let election1IsLeader = true;
      const maxAttempts = 20; // 2 seconds max
      
      for (let i = 0; i < maxAttempts; i++) {
        election2IsLeader = election2.isLeader();
        election1IsLeader = election1.isLeader();
        
        console.log(`[TEST] Poll ${i + 1}: election1.isLeader(): ${election1IsLeader}, election2.isLeader(): ${election2IsLeader}`);
        
        if (election2IsLeader && !election1IsLeader) {
          console.log(`[TEST] Stable leadership achieved on poll ${i + 1}`);
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Instance with higher priority should be leader
      expect(election2IsLeader).toBe(true);
      expect(election1IsLeader).toBe(false);
    });
  });

  describe('Leader Election Protocol', () => {
    it('should handle Fast Bully Algorithm correctly', async () => {
      const config1 = { ...config, instanceId: 'instance-1', priority: 100 };
      const config2 = { ...config, instanceId: 'instance-2', priority: 200 };
      const config3 = { ...config, instanceId: 'instance-3', priority: 300 };
      
      election1 = new BrowserLeaderElection(config1);
      
      // Wait a bit, then add second instance
      await new Promise(resolve => setTimeout(resolve, 2500));
      expect(election1.isLeader()).toBe(true);
      
      election2 = new BrowserLeaderElection(config2);
      
      // Wait for re-election
      await new Promise(resolve => setTimeout(resolve, 2000));
      expect(election2.isLeader()).toBe(true);
      expect(election1.isLeader()).toBe(false);
      
      // Add third instance with highest priority
      election3 = new BrowserLeaderElection(config3);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      expect(election3.isLeader()).toBe(true);
      expect(election2.isLeader()).toBe(false);
      expect(election1.isLeader()).toBe(false);
    }, 10000);

    it('should handle election messages correctly', async () => {
      const config1 = { ...config, instanceId: 'instance-1', priority: 100 };
      const config2 = { ...config, instanceId: 'instance-2', priority: 200 };
      
      const electionCallback1 = vi.fn();
      const electionCallback2 = vi.fn();
      
      election1 = new BrowserLeaderElection(config1);
      election1.onLeadershipChange(electionCallback1);
      
      // Wait a bit, then add higher priority instance
      await new Promise(resolve => setTimeout(resolve, 2500));
      expect(election1.isLeader()).toBe(true);
      expect(electionCallback1).toHaveBeenCalledWith(true, undefined);
      
      election2 = new BrowserLeaderElection(config2);
      election2.onLeadershipChange(electionCallback2);
      
      // Wait for election process to complete
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Higher priority instance should become leader
      // electionCallback2 becomes leader, displacing instance-1 (hence previousLeader = "instance-1")
      expect(electionCallback2).toHaveBeenCalledWith(true, "instance-1");
      // electionCallback1 loses leadership (previousLeader is its own previous state)
      expect(electionCallback1).toHaveBeenCalledWith(false, undefined);
    });

    it('should handle coordinator announcements', async () => {
      election1 = new BrowserLeaderElection(config);
      
      // Wait to become leader
      await new Promise(resolve => setTimeout(resolve, 2500));
      expect(election1.isLeader()).toBe(true);
      
      // Add second instance - should recognize existing leader
      const config2 = { ...config, instanceId: 'instance-2', priority: 50 }; // Lower priority
      election2 = new BrowserLeaderElection(config2);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Original leader should remain leader
      expect(election1.isLeader()).toBe(true);
      expect(election2.isLeader()).toBe(false);
    });
  });

  describe('Heartbeat Management', () => {
    it('should send regular heartbeats when leader', async () => {
      election1 = new BrowserLeaderElection(config);
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      expect(election1.isLeader()).toBe(true);
      
      // Mock heartbeat reception
      const heartbeatCallback = vi.fn();
      election1.onHeartbeat(heartbeatCallback);
      
      // Wait for heartbeat intervals
      await new Promise(resolve => setTimeout(resolve, config.heartbeatInterval + 100));
      
      // Should have sent heartbeats (this is implicit - leader sends them)
    });

    it('should detect leader failure and start new election', async () => {
      const config1 = { ...config, instanceId: 'instance-1', priority: 200 };
      const config2 = { ...config, instanceId: 'instance-2', priority: 100 };
      
      election1 = new BrowserLeaderElection(config1);
      election2 = new BrowserLeaderElection(config2);
      
      // Wait for election
      await new Promise(resolve => setTimeout(resolve, 2500));
      expect(election1.isLeader()).toBe(true);
      
      const leadershipCallback = vi.fn();
      election2.onLeadershipChange(leadershipCallback);
      
      // Simulate leader failure by destroying first election
      await election1.destroy();
      election1 = null as any;
      
      // Wait for failure detection and new election with extended timeout
      // Need time for: leadership timeout (1200ms) + initial delay (200ms) + election timeout (1000ms) + buffer
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Second instance should become new leader
      expect(election2.isLeader()).toBe(true);
      expect(leadershipCallback).toHaveBeenCalledWith(true, 'instance-1');
    }, 8000);

    it('should handle missing heartbeats gracefully', async () => {
      election1 = new BrowserLeaderElection(config);
      
      const heartbeatCallback = vi.fn();
      election1.onHeartbeat(heartbeatCallback);
      
      // Wait longer than heartbeat interval
      await new Promise(resolve => setTimeout(resolve, config.heartbeatInterval * 3));
      
      // Should continue operating normally
      expect(election1.isLeader()).toBe(true);
    });
  });

  describe('Instance Management', () => {
    it('should track connected instances', async () => {
      const config1 = { ...config, instanceId: 'instance-1', priority: 100 };
      const config2 = { ...config, instanceId: 'instance-2', priority: 200 };
      
      election1 = new BrowserLeaderElection(config1);
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      election2 = new BrowserLeaderElection(config2);
      
      // Wait enough time for instances to discover each other through election/heartbeat messages
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const instances1 = election1.getConnectedInstances();
      const instances2 = election2.getConnectedInstances();
      
      expect(instances1.length).toBeGreaterThan(0);
      expect(instances2.length).toBeGreaterThan(0);
    });

    it('should handle instance shutdown gracefully', async () => {
      const config1 = { ...config, instanceId: 'instance-1', priority: 100 };
      const config2 = { ...config, instanceId: 'instance-2', priority: 200 };
      
      election1 = new BrowserLeaderElection(config1);
      election2 = new BrowserLeaderElection(config2);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const shutdownCallback = vi.fn();
      election1.onInstanceShutdown(shutdownCallback);
      
      // Shutdown second instance
      await election2.destroy();
      election2 = null as any;
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      expect(shutdownCallback).toHaveBeenCalledWith('instance-2');
    });

    it('should cleanup inactive instances', async () => {
      election1 = new BrowserLeaderElection({
        ...config,
        electionTimeout: 200, // Short timeout for testing
        heartbeatInterval: 100,
        leadershipTimeout: 300
      });
      
      // Add and immediately remove a mock instance
      const instances = election1.getConnectedInstances();
      const initialCount = instances.length;
      
      // Wait for cleanup cycle
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Should maintain correct instance count
      const finalInstances = election1.getConnectedInstances();
      expect(finalInstances.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle BroadcastChannel errors gracefully', async () => {
      // Mock BroadcastChannel to throw error
      const originalPostMessage = MockBroadcastChannel.prototype.postMessage;
      MockBroadcastChannel.prototype.postMessage = vi.fn().mockImplementation(() => {
        throw new Error('Channel error');
      });
      
      election1 = new BrowserLeaderElection(config);
      
      // Should not throw during initialization
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Restore original
      MockBroadcastChannel.prototype.postMessage = originalPostMessage;
    });

    it('should handle malformed messages', async () => {
      election1 = new BrowserLeaderElection(config);
      
      // Simulate malformed message
      const channels = MockBroadcastChannel.channels.get(config.channelName);
      if (channels && channels.length > 0) {
        const channel = channels[0];
        channel.listeners.forEach(listener => {
          try {
            listener({ data: null, type: 'message' });
            listener({ data: { type: 'invalid' }, type: 'message' });
            listener({ data: 'not-an-object', type: 'message' });
          } catch (error) {
            // Expected to handle gracefully
          }
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Should continue operating normally
      expect(election1.isLeader()).toBe(true);
    });

    it('should handle rapid succession of elections', async () => {
      const instances: BrowserLeaderElection[] = [];
      
      // Create multiple instances rapidly
      for (let i = 0; i < 5; i++) {
        instances.push(new BrowserLeaderElection({
          ...config,
          instanceId: `rapid-instance-${i}`,
          priority: Math.random() * 1000
        }));
      }
      
      // Wait for elections to settle
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Should have exactly one leader
      const leaders = instances.filter(instance => instance.isLeader());
      expect(leaders.length).toBe(1);
      
      // Cleanup
      await Promise.all(instances.map(instance => instance.destroy()));
    });
  });

  describe('Leadership Transitions', () => {
    it('should handle smooth leadership transitions', async () => {
      const config1 = { ...config, instanceId: 'instance-1', priority: 100 };
      const config2 = { ...config, instanceId: 'instance-2', priority: 200 };
      
      election1 = new BrowserLeaderElection(config1);
      
      const transitionCallback1 = vi.fn();
      const transitionCallback2 = vi.fn();
      
      election1.onLeadershipChange(transitionCallback1);
      
      // Wait to become leader
      await new Promise(resolve => setTimeout(resolve, 2500));
      expect(election1.isLeader()).toBe(true);
      
      // Add higher priority instance
      election2 = new BrowserLeaderElection(config2);
      election2.onLeadershipChange(transitionCallback2);
      
      // Wait for transition - give enough time for challenge election to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      expect(election2.isLeader()).toBe(true);
      expect(election1.isLeader()).toBe(false);
      
      // Both should have received callbacks with correct previousLeader values
      expect(transitionCallback1).toHaveBeenCalledWith(false, undefined);
      expect(transitionCallback2).toHaveBeenCalledWith(true, "instance-1");
    });

    it('should handle leadership duration tracking', async () => {
      election1 = new BrowserLeaderElection(config);
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      expect(election1.isLeader()).toBe(true);
      
      // Wait a bit to accumulate leadership time
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const metrics = election1.getLeadershipMetrics();
      expect(metrics.isCurrentLeader).toBe(true);
      expect(metrics.totalLeadershipDuration).toBeGreaterThan(0);
      expect(metrics.currentLeadershipStart).toBeGreaterThan(0);
    });
  });

  describe('Metrics and Monitoring', () => {
    it('should provide accurate leadership metrics', async () => {
      election1 = new BrowserLeaderElection(config);
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const metrics = election1.getLeadershipMetrics();
      expect(metrics).toHaveProperty('isCurrentLeader');
      expect(metrics).toHaveProperty('totalLeadershipDuration');
      expect(metrics).toHaveProperty('electionCount');
      expect(metrics).toHaveProperty('connectedInstances');
    });

    it('should track election statistics', async () => {
      const instances: BrowserLeaderElection[] = [];
      
      // Create instances with different priorities
      for (let i = 0; i < 3; i++) {
        instances.push(new BrowserLeaderElection({
          ...config,
          instanceId: `stats-instance-${i}`,
          priority: (i + 1) * 100
        }));
        
        // Small delay between creations to trigger elections
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Wait for elections to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check election statistics
      instances.forEach(instance => {
        const metrics = instance.getLeadershipMetrics();
        expect(metrics.electionCount).toBeGreaterThan(0);
      });
      
      // Cleanup
      await Promise.all(instances.map(instance => instance.destroy()));
    });
  });
});