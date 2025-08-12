// EventBus - Central Event Management System
import { 
  RestaurantEvents
} from './RestaurantEvents';

import type { 
  BaseEvent, 
  EventHandler, 
  EventHandlerMap,
  EventSubscription,
  EventFilter
} from './RestaurantEvents';

class EventBusClass {
  private handlers: Partial<EventHandlerMap> = {};
  private middlewares: Array<(event: BaseEvent) => BaseEvent | Promise<BaseEvent>> = [];
  private isEnabled: boolean = true;
  private eventHistory: BaseEvent[] = [];
  private maxHistorySize: number = 1000;

  // ============================================================================
  // CORE EVENT METHODS
  // ============================================================================

  /**
   * Subscribe to an event
   */
  on<T = any>(
    eventType: RestaurantEvents, 
    handler: EventHandler<T>,
    options: { once?: boolean; priority?: number } = {}
  ): () => void {
    if (!this.handlers[eventType]) {
      this.handlers[eventType] = [];
    }

    const wrappedHandler: EventHandler<T> = async (event) => {
      try {
        await handler(event);
        
        // Remove handler if it's a one-time subscription
        if (options.once) {
          this.off(eventType, wrappedHandler);
        }
      } catch (error) {
        console.error(`Error in event handler for ${eventType}:`, error);
        // Emit error event
        this.emit(RestaurantEvents.ERROR_OCCURRED, {
          originalEvent: eventType,
          error: error instanceof Error ? error.message : String(error),
          handler: handler.name || 'anonymous'
        }, 'EventBus');
      }
    };

    this.handlers[eventType]!.push(wrappedHandler);

    // Sort by priority if specified
    if (options.priority !== undefined) {
      this.handlers[eventType]!.sort((a: any, b: any) => 
        (b.priority || 0) - (a.priority || 0)
      );
      (wrappedHandler as any).priority = options.priority;
    }

    // Return unsubscribe function
    return () => this.off(eventType, wrappedHandler);
  }

  /**
   * Subscribe to an event once
   */
  once<T = any>(eventType: RestaurantEvents, handler: EventHandler<T>): () => void {
    return this.on(eventType, handler, { once: true });
  }

  /**
   * Unsubscribe from an event
   */
  off<T = any>(eventType: RestaurantEvents, handler?: EventHandler<T>): void {
    if (!this.handlers[eventType]) return;

    if (!handler) {
      // Remove all handlers for this event type
      delete this.handlers[eventType];
      return;
    }

    const index = this.handlers[eventType]!.indexOf(handler);
    if (index > -1) {
      this.handlers[eventType]!.splice(index, 1);
    }

    // Clean up empty handler arrays
    if (this.handlers[eventType]!.length === 0) {
      delete this.handlers[eventType];
    }
  }

  /**
   * Emit an event
   */
  async emit<T = any>(
    eventType: RestaurantEvents, 
    payload: T, 
    source: string = 'unknown',
    options: { correlationId?: string; userId?: string } = {}
  ): Promise<void> {
    if (!this.isEnabled) return;

    let event: BaseEvent<T> = {
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
      source,
      correlationId: options.correlationId || this.generateCorrelationId(),
      userId: options.userId
    };

    // Apply middlewares
    for (const middleware of this.middlewares) {
      try {
        event = await middleware(event);
      } catch (error) {
        console.error('Error in event middleware:', error);
      }
    }

    // Add to history
    this.addToHistory(event);

    // Get handlers for this event type
    const eventHandlers = this.handlers[eventType] || [];

    // Execute handlers concurrently
    const handlerPromises = eventHandlers.map(handler => 
      Promise.resolve(handler(event)).catch(error => {
        console.error(`Error in event handler for ${eventType}:`, error);
      })
    );

    await Promise.all(handlerPromises);

    // Log event for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EventBus] ${eventType}`, { payload, source, correlationId: event.correlationId });
    }
  }

  // ============================================================================
  // MIDDLEWARE AND FILTERING
  // ============================================================================

  /**
   * Add middleware to process events before handlers
   */
  use(middleware: (event: BaseEvent) => BaseEvent | Promise<BaseEvent>): void {
    this.middlewares.push(middleware);
  }

  /**
   * Subscribe with filter
   */
  onWithFilter<T = any>(
    eventType: RestaurantEvents,
    filter: EventFilter<T>,
    handler: EventHandler<T>
  ): () => void {
    const filteredHandler: EventHandler<T> = (event) => {
      if (filter(event)) {
        return handler(event);
      }
    };

    return this.on(eventType, filteredHandler);
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  /**
   * Subscribe to multiple events with same handler
   */
  onMultiple<T = any>(
    eventTypes: RestaurantEvents[],
    handler: EventHandler<T>
  ): () => void {
    const unsubscribeFunctions = eventTypes.map(eventType => 
      this.on(eventType, handler)
    );

    return () => {
      unsubscribeFunctions.forEach(fn => fn());
    };
  }

  /**
   * Emit multiple events in sequence
   */
  async emitSequence<T = any>(
    events: Array<{
      type: RestaurantEvents;
      payload: T;
      source?: string;
      delay?: number;
    }>
  ): Promise<void> {
    for (const event of events) {
      if (event.delay) {
        await new Promise(resolve => setTimeout(resolve, event.delay));
      }
      await this.emit(event.type, event.payload, event.source);
    }
  }

  // ============================================================================
  // HISTORY AND DEBUGGING
  // ============================================================================

  /**
   * Get event history
   */
  getHistory(filter?: { 
    eventType?: RestaurantEvents; 
    source?: string; 
    since?: string;
    limit?: number;
  }): BaseEvent[] {
    let history = [...this.eventHistory];

    if (filter) {
      if (filter.eventType) {
        history = history.filter(event => event.type === filter.eventType);
      }
      if (filter.source) {
        history = history.filter(event => event.source === filter.source);
      }
      if (filter.since) {
        const sinceDate = new Date(filter.since);
        history = history.filter(event => new Date(event.timestamp) >= sinceDate);
      }
      if (filter.limit) {
        history = history.slice(-filter.limit);
      }
    }

    return history;
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get active subscriptions count
   */
  getSubscriptionsCount(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const [eventType, handlers] of Object.entries(this.handlers)) {
      counts[eventType] = handlers?.length || 0;
    }
    
    return counts;
  }

  // ============================================================================
  // CONTROL METHODS
  // ============================================================================

  /**
   * Enable/disable the event bus
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if event bus is enabled
   */
  isEventBusEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Remove all event handlers
   */
  removeAllHandlers(): void {
    this.handlers = {};
  }

  /**
   * Get all registered event types
   */
  getRegisteredEvents(): RestaurantEvents[] {
    return Object.keys(this.handlers) as RestaurantEvents[];
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private addToHistory(event: BaseEvent): void {
    this.eventHistory.push(event);
    
    // Maintain history size limit
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  private generateCorrelationId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================================================
  // CONVENIENCE METHODS FOR COMMON PATTERNS
  // ============================================================================

  /**
   * Wait for a specific event to occur
   */
  waitFor<T = any>(
    eventType: RestaurantEvents,
    timeout: number = 5000,
    filter?: EventFilter<T>
  ): Promise<BaseEvent<T>> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;
      
      const unsubscribe = this.on(eventType, (event) => {
        if (!filter || filter(event)) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(event);
        }
      });

      timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Timeout waiting for event ${eventType}`));
      }, timeout);
    });
  }

  /**
   * Create a scoped event bus for specific correlation ID
   */
  createScope(correlationId: string) {
    return {
      emit: <T>(eventType: RestaurantEvents, payload: T, source?: string) =>
        this.emit(eventType, payload, source, { correlationId }),
      
      on: <T>(eventType: RestaurantEvents, handler: EventHandler<T>) =>
        this.onWithFilter(
          eventType,
          (event) => event.correlationId === correlationId,
          handler
        ),
        
      once: <T>(eventType: RestaurantEvents, handler: EventHandler<T>) =>
        this.onWithFilter(
          eventType,
          (event) => event.correlationId === correlationId,
          (event) => {
            handler(event);
            // Auto-unsubscribe after first call
          }
        )
    };
  }
}

// Export singleton instance
export const EventBus = new EventBusClass();

// Export class for testing
export { EventBusClass };