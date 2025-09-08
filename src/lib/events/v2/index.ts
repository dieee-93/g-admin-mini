// EventBus V2.0 - Main Export Index
// Enterprise-grade event bus with module management, deduplication, and offline-first support

// Core EventBus
export { default as eventBusV2, EventBusV2 } from './EventBusV2';

// Core components (for advanced usage)
export { EventStoreIndexedDB } from './EventStore';
export { DeduplicationManager } from './DeduplicationManager';
export { ModuleRegistry } from './ModuleRegistry';

// Complete type system
export * from './types';

// Migration utilities
export { MigrationBridge } from './MigrationBridge';

// Testing utilities
export { EventBusTestingHarness } from './testing/EventBusTestingHarness';

// Default instance for immediate use
import eventBusV2 from './EventBusV2';
export default eventBusV2;