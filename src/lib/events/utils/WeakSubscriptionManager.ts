// WeakSubscriptionManager.ts - Memory-safe subscription management
// Prevents memory leaks using WeakReferences and automatic cleanup

import type { EventSubscription, EventHandler, EventPattern } from '../types';
import { SecurityLogger } from './SecureLogger';

interface WeakSubscription {
  id: string;
  pattern: EventPattern;
  weakHandler: WeakRef<EventHandler>;
  moduleId: string;
  priority: number;
  persistent: boolean;
  created: Date;
  lastTriggered?: Date;
  timeoutMs?: number;
  filter?: any; // Store the filter function reference
  isDisposed: boolean;
}

interface WeakSubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  disposedSubscriptions: number;
  cleanupOperations: number;
  lastCleanupTime: Date | null;
}

export class WeakSubscriptionManager {
  private subscriptions = new Map<string, WeakSubscription>();
  private patternMap = new Map<EventPattern, Set<string>>(); // pattern -> subscription IDs
  private moduleMap = new Map<string, Set<string>>(); // module -> subscription IDs
  private cleanupRegistry = new FinalizationRegistry((subscriptionId: string) => {
    this.handleDisposedSubscription(subscriptionId);
  });
  
  private stats: WeakSubscriptionStats = {
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    disposedSubscriptions: 0,
    cleanupOperations: 0,
    lastCleanupTime: null
  };

  /**
   * Add a subscription with weak reference to handler
   */
  addSubscription(subscription: EventSubscription): string {
    const weakHandler = new WeakRef(subscription.handler);
    
    const weakSub: WeakSubscription = {
      id: subscription.id,
      pattern: subscription.pattern,
      weakHandler,
      moduleId: subscription.moduleId,
      priority: subscription.priority,
      persistent: subscription.persistent,
      created: subscription.created,
      lastTriggered: subscription.lastTriggered,
      timeoutMs: subscription.timeoutMs,
      filter: subscription.filter,
      isDisposed: false
    };

    // Store subscription
    this.subscriptions.set(subscription.id, weakSub);
    
    // Update pattern mapping
    if (!this.patternMap.has(subscription.pattern)) {
      this.patternMap.set(subscription.pattern, new Set());
    }
    this.patternMap.get(subscription.pattern)!.add(subscription.id);
    
    // Update module mapping
    if (!this.moduleMap.has(subscription.moduleId)) {
      this.moduleMap.set(subscription.moduleId, new Set());
    }
    this.moduleMap.get(subscription.moduleId)!.add(subscription.id);
    
    // Register for cleanup when handler is garbage collected
    this.cleanupRegistry.register(subscription.handler, subscription.id);
    
    // Update stats
    this.stats.totalSubscriptions++;
    this.stats.activeSubscriptions++;
    
    SecurityLogger.info('Weak subscription added', {
      subscriptionId: subscription.id,
      pattern: subscription.pattern,
      moduleId: subscription.moduleId
    });

    return subscription.id;
  }

  /**
   * Get active handler for subscription (returns null if garbage collected)
   */
  getHandler(subscriptionId: string): EventHandler | null {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription || subscription.isDisposed) {
      return null;
    }

    const handler = subscription.weakHandler.deref();
    if (!handler) {
      // Handler was garbage collected
      this.handleDisposedSubscription(subscriptionId);
      return null;
    }

    return handler;
  }

  /**
   * Get subscription metadata
   */
  getSubscription(subscriptionId: string): WeakSubscription | null {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription || subscription.isDisposed) {
      return null;
    }

    // Check if handler is still alive
    const handler = subscription.weakHandler.deref();
    if (!handler) {
      this.handleDisposedSubscription(subscriptionId);
      return null;
    }

    return subscription;
  }

  /**
   * Get all subscription IDs matching a pattern (includes wildcards)
   */
  getSubscriptionsByPattern(pattern: EventPattern): string[] {
    // Get exact matches
    const exactMatches = this.patternMap.get(pattern) || new Set();
    const activeIds: string[] = [];

    // Process exact matches
    for (const id of exactMatches) {
      const subscription = this.subscriptions.get(id);
      if (subscription && !subscription.isDisposed) {
        const handler = subscription.weakHandler.deref();
        if (handler) {
          activeIds.push(id);
        } else {
          this.handleDisposedSubscription(id);
        }
      }
    }

    // Check for wildcard matches
    for (const [subscribedPattern, subscriptionIds] of this.patternMap) {
      if (this.isWildcardMatch(subscribedPattern, pattern)) {
        for (const id of subscriptionIds) {
          const subscription = this.subscriptions.get(id);
          if (subscription && !subscription.isDisposed) {
            const handler = subscription.weakHandler.deref();
            if (handler) {
              activeIds.push(id);
            } else {
              this.handleDisposedSubscription(id);
            }
          }
        }
      }
    }

    return activeIds;
  }

  /**
   * Get all subscription IDs for a module
   */
  getSubscriptionsByModule(moduleId: string): string[] {
    const subscriptionIds = this.moduleMap.get(moduleId) || new Set();
    const activeIds: string[] = [];

    for (const id of subscriptionIds) {
      const subscription = this.subscriptions.get(id);
      if (subscription && !subscription.isDisposed) {
        // Verify handler is still alive
        const handler = subscription.weakHandler.deref();
        if (handler) {
          activeIds.push(id);
        } else {
          this.handleDisposedSubscription(id);
        }
      }
    }

    return activeIds;
  }

  /**
   * Remove subscription manually
   */
  removeSubscription(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    this.handleDisposedSubscription(subscriptionId);
    return true;
  }

  /**
   * Remove all subscriptions for a module
   */
  removeSubscriptionsByModule(moduleId: string): number {
    const subscriptionIds = this.getSubscriptionsByModule(moduleId);
    
    for (const id of subscriptionIds) {
      this.removeSubscription(id);
    }

    return subscriptionIds.length;
  }

  /**
   * Update last triggered time for subscription
   */
  updateLastTriggered(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription && !subscription.isDisposed) {
      subscription.lastTriggered = new Date();
    }
  }

  /**
   * Perform cleanup of disposed subscriptions
   */
  cleanup(): number {
    let cleanedCount = 0;
    const disposedIds: string[] = [];

    // Find all disposed subscriptions
    for (const [id, subscription] of this.subscriptions.entries()) {
      if (subscription.isDisposed) {
        disposedIds.push(id);
        continue;
      }

      // Check if handler is still alive
      const handler = subscription.weakHandler.deref();
      if (!handler) {
        disposedIds.push(id);
      }
    }

    // Clean up disposed subscriptions
    for (const id of disposedIds) {
      this.handleDisposedSubscription(id);
      cleanedCount++;
    }

    this.stats.cleanupOperations++;
    this.stats.lastCleanupTime = new Date();

    if (cleanedCount > 0) {
      SecurityLogger.anomaly('Weak subscriptions cleanup completed', {
        cleanedSubscriptions: cleanedCount,
        remainingActive: this.stats.activeSubscriptions
      });
    }

    return cleanedCount;
  }

  /**
   * Get subscription statistics
   */
  getStats(): WeakSubscriptionStats {
    return { ...this.stats };
  }

  /**
   * Get all active subscription IDs
   */
  getAllActiveSubscriptions(): string[] {
    const activeIds: string[] = [];

    for (const [id, subscription] of this.subscriptions.entries()) {
      if (!subscription.isDisposed) {
        const handler = subscription.weakHandler.deref();
        if (handler) {
          activeIds.push(id);
        } else {
          this.handleDisposedSubscription(id);
        }
      }
    }

    return activeIds;
  }

  /**
   * Check if subscription exists and is active
   */
  hasActiveSubscription(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription || subscription.isDisposed) {
      return false;
    }

    const handler = subscription.weakHandler.deref();
    if (!handler) {
      this.handleDisposedSubscription(subscriptionId);
      return false;
    }

    return true;
  }

  /**
   * Destroy all subscriptions and cleanup resources
   */
  destroy(): void {
    // Clear all mappings
    for (const [id] of this.subscriptions.entries()) {
      this.handleDisposedSubscription(id);
    }

    this.subscriptions.clear();
    this.patternMap.clear();
    this.moduleMap.clear();

    // Reset stats
    this.stats = {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      disposedSubscriptions: this.stats.disposedSubscriptions,
      cleanupOperations: this.stats.cleanupOperations + 1,
      lastCleanupTime: new Date()
    };

    SecurityLogger.anomaly('WeakSubscriptionManager destroyed - all subscriptions cleaned up');
  }

  // === PRIVATE METHODS ===

  private isWildcardMatch(subscribedPattern: EventPattern, eventPattern: EventPattern): boolean {
    // Exact match (already handled above, but included for completeness)
    if (subscribedPattern === eventPattern) {
      return false; // Avoid duplicates with exact matches
    }
    
    // Convert patterns to regex-like matching
    // Replace * with .* for regex matching
    const regexPattern = subscribedPattern
      .replace(/\./g, '\\.')  // Escape dots
      .replace(/\*/g, '.*');  // Replace * with .*
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(eventPattern);
  }

  private handleDisposedSubscription(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return;
    }

    if (!subscription.isDisposed) {
      subscription.isDisposed = true;
      this.stats.activeSubscriptions--;
      this.stats.disposedSubscriptions++;

      // Remove from pattern mapping
      const patternSet = this.patternMap.get(subscription.pattern);
      if (patternSet) {
        patternSet.delete(subscriptionId);
        if (patternSet.size === 0) {
          this.patternMap.delete(subscription.pattern);
        }
      }

      // Remove from module mapping
      const moduleSet = this.moduleMap.get(subscription.moduleId);
      if (moduleSet) {
        moduleSet.delete(subscriptionId);
        if (moduleSet.size === 0) {
          this.moduleMap.delete(subscription.moduleId);
        }
      }
    }

    // Remove from subscriptions map
    this.subscriptions.delete(subscriptionId);
  }
}

export default WeakSubscriptionManager;