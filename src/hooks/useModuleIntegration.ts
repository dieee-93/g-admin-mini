/**
 * useModuleIntegration - Hook for seamless EventBus + CapabilityGate integration
 * Provides unified interface for module communication and capability checking
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useEventBus } from '@/providers/EventBusProvider';
import { useCapabilities } from '@/lib/capabilities';
import { useSlotRegistry } from '@/lib/composition';
import type { ModuleId } from '@/lib/events/types';
import type { BusinessCapability } from '@/lib/capabilities/types/BusinessCapabilities';

export interface ModuleConfig {
  /** Required capabilities for this module */
  capabilities: BusinessCapability[];

  /** Events this module can emit */
  events?: {
    emits?: string[];
    listens?: string[];
  };

  /** Event handlers for subscribed events */
  eventHandlers?: Record<string, (data: any) => void>;

  /** Slots this module provides */
  slots?: string[];

  /** Module metadata */
  metadata?: {
    version?: string;
    description?: string;
  };
}

export interface ModuleIntegrationReturn {
  /** Module ID */
  moduleId: ModuleId;

  /** Emit event with module prefix */
  emitEvent: (event: string, data?: any) => void;

  /** Emit cross-module event */
  emitCrossModule: (targetModule: ModuleId, event: string, data?: any) => void;

  /** Check if user has specific capability */
  hasCapability: (capability: BusinessCapability) => boolean;

  /** Check if user has all required capabilities */
  hasAllCapabilities: (capabilities: BusinessCapability[]) => boolean;

  /** Register content in a slot */
  registerSlotContent: (slotId: string, content: React.ReactNode) => void;

  /** Module status */
  status: {
    isActive: boolean;
    missingCapabilities: BusinessCapability[];
    connectedModules: ModuleId[];
  };
}

/**
 * Main integration hook - connects module to EventBus + CapabilityGate ecosystem
 */
export function useModuleIntegration(
  moduleId: ModuleId,
  config: ModuleConfig
): ModuleIntegrationReturn {
  const { emit, on, off, emitModuleEvent } = useEventBus();
  const { hasCapability, hasAllCapabilities, activeCapabilities } = useCapabilities();
  const { bulkRegisterSlots, addSlotContent } = useSlotRegistry();

  // ✅ MEMOIZE STATUS CALCULATION - Prevents infinite re-renders
  const status = useMemo(() => {
    const missingCapabilities = config.capabilities.filter(cap => !hasCapability(cap));
    const isActive = missingCapabilities.length === 0;

    // 🐛 DEBUG: Only log when status actually changes
    console.log('[useModuleIntegration] ⚙️ Status calculated for', moduleId, {
      isActive,
      missingCapabilities,
      activeCapabilities: activeCapabilities.length,
      configCapabilities: config.capabilities,
      configLength: config.capabilities.length,
      missingCount: missingCapabilities.length,
      timestamp: new Date().toISOString()
    });

    // Track connected modules (modules that emit events this module listens to)
    const connectedModules = config.events?.listens?.map(event => {
      const parts = event.split('.');
      return parts[0] as ModuleId;
    }).filter((module, index, self) => self.indexOf(module) === index) || [];

    return {
      isActive,
      missingCapabilities,
      connectedModules
    };
  }, [config.capabilities, config.events?.listens, hasCapability, activeCapabilities.length, moduleId]);

  // Register module on mount
  useEffect(() => {
    console.log('[useModuleIntegration] 🔄 Module registration effect triggered', {
      moduleId,
      isActive: status.isActive,
      missingCapabilities: status.missingCapabilities,
      configCapabilities: config.capabilities
    });

    // Emit module registration event
    emitModuleEvent('system', 'module_registered', {
      moduleId,
      capabilities: config.capabilities,
      events: config.events,
      slots: config.slots,
      metadata: config.metadata,
      isActive: status.isActive
    });

    // Register slots if provided
    if (config.slots?.length) {
      bulkRegisterSlots(config.slots.map(slotId => ({
        id: slotId,
        name: `${moduleId} - ${slotId}`
      })));
    }

    // Setup event listeners
    const unsubscribers: (() => void)[] = [];

    if (config.events?.listens && config.eventHandlers) {
      config.events.listens.forEach(event => {
        const handler = config.eventHandlers![event];
        if (handler) {
          const unsubscribe = on(event, handler);
          unsubscribers.push(unsubscribe);
        }
      });
    }

    // Cleanup function
    return () => {
      console.log('[useModuleIntegration] 🔄 Module unregistration cleanup triggered', {
        moduleId,
        reason: 'Effect cleanup'
      });

      // Emit module unregistration
      emitModuleEvent('system', 'module_unregistered', { moduleId });

      // Cleanup event listeners
      unsubscribers.forEach(unsub => unsub());
    };
  }, [moduleId, config, status.isActive]);

  // Event emission functions
  const emitEvent = useCallback((event: string, data?: any) => {
    emitModuleEvent(moduleId, event, data);
  }, [moduleId, emitModuleEvent]);

  const emitCrossModule = useCallback((targetModule: ModuleId, event: string, data?: any) => {
    emit(`${targetModule}.${event}`, {
      ...data,
      sourceModule: moduleId,
      timestamp: Date.now()
    });
  }, [moduleId, emit]);

  const registerSlotContent = useCallback((slotId: string, content: React.ReactNode) => {
    addSlotContent(slotId, {
      content,
      moduleId,
      priority: 10 // Default priority
    });
  }, [moduleId, addSlotContent]);

  return {
    moduleId,
    emitEvent,
    emitCrossModule,
    hasCapability,
    hasAllCapabilities,
    registerSlotContent,
    status
  };
}

/**
 * Hook for listening to specific module events with automatic cleanup
 */
export function useModuleEventListener<T = any>(
  sourceModule: ModuleId,
  event: string,
  handler: (data: T) => void,
  deps: React.DependencyList = []
) {
  const { on } = useEventBus();

  useEffect(() => {
    const unsubscribe = on(`${sourceModule}.${event}`, handler);
    return unsubscribe;
  }, [sourceModule, event, ...deps]);
}

/**
 * Hook for cross-module communication
 */
export function useCrossModuleCommunication(currentModule: ModuleId) {
  const { emit, on } = useEventBus();

  const sendToModule = useCallback((
    targetModule: ModuleId,
    event: string,
    data?: any
  ) => {
    emit(`${targetModule}.${event}`, {
      ...data,
      sourceModule: currentModule,
      timestamp: Date.now()
    });
  }, [currentModule, emit]);

  const listenToModule = useCallback((
    sourceModule: ModuleId,
    event: string,
    handler: (data: any) => void
  ) => {
    return on(`${sourceModule}.${event}`, handler);
  }, [on]);

  const broadcast = useCallback((event: string, data?: any) => {
    emit(`broadcast.${event}`, {
      ...data,
      sourceModule: currentModule,
      timestamp: Date.now()
    });
  }, [currentModule, emit]);

  return {
    sendToModule,
    listenToModule,
    broadcast
  };
}

/**
 * Hook for module capability requirements
 */
export function useModuleCapabilities(requiredCapabilities: BusinessCapability[]) {
  const { hasCapability, hasAllCapabilities } = useCapabilities();

  const capabilityStatus = requiredCapabilities.map(cap => ({
    capability: cap,
    available: hasCapability(cap)
  }));

  const allAvailable = hasAllCapabilities(requiredCapabilities);
  const missingCapabilities = capabilityStatus
    .filter(status => !status.available)
    .map(status => status.capability);

  return {
    allAvailable,
    missingCapabilities,
    capabilityStatus,
    hasCapability,
    hasAllCapabilities
  };
}