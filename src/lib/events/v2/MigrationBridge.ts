// MigrationBridge.ts - Bridge between EventBus V1 and V2
// Allows gradual migration while maintaining backward compatibility

import { EventBus as EventBusV1 } from '../EventBus';
import { RestaurantEvents } from '../RestaurantEvents';
import type { BaseEvent, EventHandler as V1EventHandler } from '../RestaurantEvents';
import eventBusV2 from './EventBusV2';
import type { 
  EventPattern, 
  NamespacedEvent, 
  EventHandler as V2EventHandler,
  ModuleId 
} from './types';

// Migration configuration
interface MigrationConfig {
  enableV1ToV2Bridge: boolean;        // Forward V1 events to V2
  enableV2ToV1Bridge: boolean;        // Forward V2 events to V1
  v1EventNamespace: string;           // Namespace for V1 events in V2
  logBridgeEvents: boolean;           // Log bridge operations
  gradualMigration: boolean;          // Enable gradual module migration
}

// Event pattern mapping between V1 and V2
interface EventMapping {
  v1Event: RestaurantEvents;
  v2Pattern: EventPattern;
  transform?: (payload: any) => any;   // Optional payload transformation
}

export class MigrationBridge {
  private config: MigrationConfig;
  private v1Subscriptions = new Map<string, Function>();
  private v2Subscriptions = new Map<string, Function>();
  private eventMappings = new Map<RestaurantEvents, EventMapping>();
  private migratedModules = new Set<ModuleId>();

  constructor(config: Partial<MigrationConfig> = {}) {
    this.config = {
      enableV1ToV2Bridge: true,
      enableV2ToV1Bridge: true,
      v1EventNamespace: 'legacy',
      logBridgeEvents: false,
      gradualMigration: true,
      ...config
    };

    this.setupEventMappings();
    this.initializeBridges();
  }

  // Setup event mappings between V1 and V2
  private setupEventMappings(): void {
    const mappings: Array<[RestaurantEvents, EventPattern]> = [
      // Order events
      [RestaurantEvents.ORDER_PLACED, 'sales.order.placed'],
      [RestaurantEvents.ORDER_CONFIRMED, 'sales.order.confirmed'],
      [RestaurantEvents.ORDER_PREPARED, 'kitchen.order.prepared'],
      [RestaurantEvents.ORDER_SERVED, 'sales.order.served'],
      [RestaurantEvents.ORDER_PAID, 'sales.payment.completed'],
      [RestaurantEvents.ORDER_CANCELLED, 'sales.order.cancelled'],

      // Payment events
      [RestaurantEvents.PAYMENT_INITIATED, 'sales.payment.initiated'],
      [RestaurantEvents.PAYMENT_COMPLETED, 'sales.payment.completed'],
      [RestaurantEvents.PAYMENT_FAILED, 'sales.payment.failed'],
      [RestaurantEvents.PAYMENT_REFUNDED, 'sales.payment.refunded'],

      // Inventory events
      [RestaurantEvents.STOCK_LOW, 'inventory.stock.low'],
      [RestaurantEvents.STOCK_OUT, 'inventory.stock.out'],
      [RestaurantEvents.STOCK_RECEIVED, 'inventory.stock.received'],
      [RestaurantEvents.STOCK_ADJUSTED, 'inventory.stock.adjusted'],
      [RestaurantEvents.ITEM_EXPIRED, 'inventory.item.expired'],

      // Staff events
      [RestaurantEvents.SHIFT_STARTED, 'staff.shift.started'],
      [RestaurantEvents.SHIFT_ENDED, 'staff.shift.ended'],
      [RestaurantEvents.OVERTIME_DETECTED, 'staff.overtime.detected'],
      [RestaurantEvents.EMPLOYEE_PERFORMANCE_UPDATED, 'staff.performance.updated'],

      // Kitchen events
      [RestaurantEvents.PREPARATION_STARTED, 'kitchen.preparation.started'],
      [RestaurantEvents.ITEM_READY, 'kitchen.item.ready'],
      [RestaurantEvents.KITCHEN_DELAYED, 'kitchen.delayed'],
      [RestaurantEvents.QUALITY_ISSUE, 'kitchen.quality.issue'],

      // Recipe events
      [RestaurantEvents.RECIPE_USED, 'recipes.recipe.used'],
      [RestaurantEvents.RECIPE_COST_CHANGED, 'recipes.cost.changed'],
      [RestaurantEvents.INGREDIENT_SUBSTITUTED, 'recipes.ingredient.substituted'],

      // System events
      [RestaurantEvents.DATA_SYNCED, 'global.sync.completed'],
      [RestaurantEvents.BACKUP_COMPLETED, 'global.backup.completed'],
      [RestaurantEvents.ERROR_OCCURRED, 'global.error.occurred'],
      [RestaurantEvents.MAINTENANCE_STARTED, 'global.maintenance.started'],

      // Fiscal events
      [RestaurantEvents.INVOICE_GENERATED, 'fiscal.invoice.generated'],
      [RestaurantEvents.CAE_OBTAINED, 'fiscal.cae.obtained'],
      [RestaurantEvents.CAE_REJECTED, 'fiscal.cae.rejected'],

      // Real-time events
      [RestaurantEvents.ORDER_UPDATED_REALTIME, 'realtime.order.updated'],
      [RestaurantEvents.INVENTORY_UPDATED_REALTIME, 'realtime.inventory.updated'],
      [RestaurantEvents.STAFF_TIME_UPDATED_REALTIME, 'realtime.staff.updated']
    ];

    for (const [v1Event, v2Pattern] of mappings) {
      this.eventMappings.set(v1Event, {
        v1Event,
        v2Pattern
      });
    }
  }

  // Initialize bidirectional event bridges
  private initializeBridges(): void {
    if (this.config.enableV1ToV2Bridge) {
      this.setupV1ToV2Bridge();
    }

    if (this.config.enableV2ToV1Bridge) {
      this.setupV2ToV1Bridge();
    }

    console.log('[MigrationBridge] Event bridges initialized', {
      v1ToV2: this.config.enableV1ToV2Bridge,
      v2ToV1: this.config.enableV2ToV1Bridge
    });
  }

  // Bridge V1 events to V2
  private setupV1ToV2Bridge(): void {
    // Subscribe to all V1 events and forward to V2
    for (const [v1Event, mapping] of this.eventMappings) {
      const unsubscribe = EventBusV1.on(v1Event, async (event: BaseEvent) => {
        try {
          // Transform payload if transformer exists
          const payload = mapping.transform ? mapping.transform(event.payload) : event.payload;
          
          // Emit to V2 with legacy namespace
          await eventBusV2.emit(mapping.v2Pattern, payload, {
            correlationId: event.correlationId,
            userId: event.userId,
            persistent: true,
            crossModule: true
          });

          if (this.config.logBridgeEvents) {
            console.log(`[MigrationBridge] V1->V2: ${v1Event} -> ${mapping.v2Pattern}`);
          }
        } catch (error) {
          console.error(`[MigrationBridge] Error bridging V1->V2 event ${v1Event}:`, error);
        }
      });

      this.v1Subscriptions.set(v1Event, unsubscribe);
    }
  }

  // Bridge V2 events to V1 (for backward compatibility)
  private setupV2ToV1Bridge(): void {
    // Subscribe to V2 events and forward to V1 if not from a migrated module
    for (const [v1Event, mapping] of this.eventMappings) {
      const unsubscribe = eventBusV2.on(mapping.v2Pattern, async (event: NamespacedEvent) => {
        try {
          // Skip if event originated from a migrated module to avoid loops
          if (this.migratedModules.has(event.source)) {
            return;
          }

          // Emit to V1
          await EventBusV1.emit(v1Event, event.payload, event.source, {
            correlationId: event.correlationId,
            userId: event.userId
          });

          if (this.config.logBridgeEvents) {
            console.log(`[MigrationBridge] V2->V1: ${mapping.v2Pattern} -> ${v1Event}`);
          }
        } catch (error) {
          console.error(`[MigrationBridge] Error bridging V2->V1 event ${mapping.v2Pattern}:`, error);
        }
      });

      this.v2Subscriptions.set(mapping.v2Pattern, unsubscribe);
    }
  }

  // Mark a module as migrated to V2
  migrateModule(moduleId: ModuleId): void {
    this.migratedModules.add(moduleId);
    console.log(`[MigrationBridge] Module '${moduleId}' marked as migrated to V2`);
  }

  // Revert a module back to V1
  revertModule(moduleId: ModuleId): void {
    this.migratedModules.delete(moduleId);
    console.log(`[MigrationBridge] Module '${moduleId}' reverted to V1`);
  }

  // Get migration status
  getMigrationStatus(): {
    migratedModules: ModuleId[];
    bridgeActive: boolean;
    eventMappings: number;
  } {
    return {
      migratedModules: Array.from(this.migratedModules),
      bridgeActive: this.config.enableV1ToV2Bridge || this.config.enableV2ToV1Bridge,
      eventMappings: this.eventMappings.size
    };
  }

  // Helper: Create V2 module from V1 patterns
  createV2ModuleDescriptor(
    moduleId: ModuleId,
    name: string,
    v1EventHandlers: Record<RestaurantEvents, string>
  ) {
    const eventSubscriptions = Object.entries(v1EventHandlers)
      .map(([v1Event, handlerName]) => {
        const mapping = this.eventMappings.get(v1Event as RestaurantEvents);
        if (!mapping) return null;

        return {
          pattern: mapping.v2Pattern,
          handler: handlerName,
          priority: 'normal' as const
        };
      })
      .filter(Boolean) as any[];

    return {
      id: moduleId,
      name,
      version: '2.0.0',
      dependencies: [] as ModuleId[],
      eventSubscriptions,
      healthCheck: async () => ({
        status: 'active' as const,
        metrics: {
          eventsProcessed: 0,
          eventsEmitted: 0,
          errorRate: 0,
          avgProcessingTimeMs: 0,
          queueSize: 0
        },
        dependencies: {},
        lastCheck: new Date()
      })
    };
  }

  // Helper: Wrap V1 handler for V2
  wrapV1Handler(v1Handler: V1EventHandler): V2EventHandler {
    return async (event: NamespacedEvent) => {
      // Convert V2 event to V1 format
      const v1Event: BaseEvent = {
        type: 'unknown' as RestaurantEvents, // Would need reverse mapping
        payload: event.payload,
        timestamp: event.timestamp,
        source: event.source,
        correlationId: event.correlationId,
        userId: event.userId
      };

      return await v1Handler(v1Event);
    };
  }

  // Disable bridges (for testing or full migration)
  disableBridges(): void {
    // Unsubscribe all V1 subscriptions
    for (const unsubscribe of this.v1Subscriptions.values()) {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    }
    this.v1Subscriptions.clear();

    // Unsubscribe all V2 subscriptions
    for (const unsubscribe of this.v2Subscriptions.values()) {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    }
    this.v2Subscriptions.clear();

    console.log('[MigrationBridge] All bridges disabled');
  }

  // Enable logging for debugging
  enableLogging(): void {
    this.config.logBridgeEvents = true;
  }

  disableLogging(): void {
    this.config.logBridgeEvents = false;
  }

  // Get statistics
  getStatistics(): {
    v1Subscriptions: number;
    v2Subscriptions: number;
    migratedModules: number;
    mappedEvents: number;
  } {
    return {
      v1Subscriptions: this.v1Subscriptions.size,
      v2Subscriptions: this.v2Subscriptions.size,
      migratedModules: this.migratedModules.size,
      mappedEvents: this.eventMappings.size
    };
  }
}

// Export singleton instance for immediate use
export const migrationBridge = new MigrationBridge();

// Export utilities for module migration
export const MigrationUtils = {
  // Quick migration helper
  quickMigrateModule: async (
    moduleId: ModuleId,
    moduleName: string,
    v1Handlers: Record<RestaurantEvents, Function>
  ) => {
    // Create V2 module descriptor
    const handlerNames: Record<RestaurantEvents, string> = {};
    for (const event in v1Handlers) {
      handlerNames[event as RestaurantEvents] = `handle${event}`;
    }
    
    const descriptor = migrationBridge.createV2ModuleDescriptor(
      moduleId,
      moduleName,
      handlerNames
    );

    // Register with V2
    await eventBusV2.registerModule(descriptor);

    // Mark as migrated
    migrationBridge.migrateModule(moduleId);

    console.log(`[MigrationUtils] Module '${moduleId}' migrated successfully`);
  },

  // Check if event should use V1 or V2
  shouldUseV2: (moduleId: ModuleId): boolean => {
    const status = migrationBridge.getMigrationStatus();
    return status.migratedModules.includes(moduleId);
  }
};