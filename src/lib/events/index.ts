// EventBus - Enterprise Event Management System
// Advanced event bus with module management, deduplication, and offline-first support

// Main EventBus (singleton - default instance)
export { default as EventBus, EventBus as EventBusClass } from './EventBus';

// Factory Pattern for multiple instances
export { default as EventBusFactory } from './EventBusFactory';
export { default as EventBusCore } from './EventBusCore';

// Core components (for advanced usage)
export { EventStoreIndexedDB } from './EventStore';
export { DeduplicationManager } from './DeduplicationManager';
export { ModuleRegistry } from './ModuleRegistry';

// Complete type system
export * from './types';

// Testing utilities
export { EventBusTestingHarness } from './testing/EventBusTestingHarness';

// Distributed EventBus system - temporarily commented to avoid circular dependency
// export * from './distributed';

// Default instance for immediate use
import eventBus from './EventBus';
export { eventBus }; // Named export for compatibility
export default eventBus;