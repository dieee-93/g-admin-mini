/**
 * EventBusProvider - Integration layer for G-Admin EventBus system
 * Connects EventBus with React context for seamless module communication
 */

import React, { createContext, useContext, useEffect, useRef } from 'react';
import EventBus from '@/lib/events/EventBus';
import type { IEventBusV2, ModuleId } from '@/lib/events/types';

import { logger } from '@/lib/logging';
// Context for EventBus instance
const EventBusContext = createContext<IEventBusV2 | null>(null);

interface EventBusProviderProps {
  children: React.ReactNode;
  debug?: boolean;
}

/**
 * EventBusProvider - Makes EventBus available throughout the app
 */
export function EventBusProvider({ children, debug = false }: EventBusProviderProps) {
  const eventBusRef = useRef(EventBus);

  useEffect(() => {
    if (debug) {
      logger.info('App', '🚌 EventBusProvider initialized');
    }

    // Initialize EventBus for React context
    const eventBus = eventBusRef.current;

    // Global error handler for EventBus
    const handleEventBusError = (error: any) => {
      logger.error('App', '🚨 EventBus Error:', error);
    };

    // Setup global event listeners if needed
    eventBus.on('system.error', handleEventBusError);

    return () => {
      eventBus.off('system.error', handleEventBusError);
    };
  }, [debug]);

  return (
    <EventBusContext.Provider value={eventBusRef.current}>
      {children}
    </EventBusContext.Provider>
  );
}

/**
 * useEventBus - Hook for accessing EventBus functionality
 * Provides simplified interface for module communication
 */
export function useEventBus() {
  const eventBus = useContext(EventBusContext);

  if (!eventBus) {
    throw new Error('useEventBus must be used within EventBusProvider');
  }

  return {
    /**
     * Emit an event to the EventBus
     */
    emit: <T = any>(event: string, data?: T, options?: { moduleId?: ModuleId }) => {
      eventBus.emit(event, data, {
        ...options,
        timestamp: Date.now()
      });
    },

    /**
     * Subscribe to an event
     */
    on: <T = any>(pattern: string, handler: (data: T) => void) => {
      return eventBus.on(pattern, handler);
    },

    /**
     * Unsubscribe from an event
     */
    off: (pattern: string, handler: Function) => {
      eventBus.off(pattern, handler);
    },

    /**
     * Emit module-specific event with automatic module prefix
     */
    emitModuleEvent: <T = any>(
      moduleId: ModuleId,
      action: string,
      data?: T
    ) => {
      eventBus.emit(`${moduleId}.${action}`, {
        ...data,
        module: moduleId,
        timestamp: Date.now()
      });
    },

    /**
     * Subscribe to module-specific events
     */
    onModuleEvent: <T = any>(
      moduleId: ModuleId,
      action: string,
      handler: (data: T & { module: ModuleId; timestamp: number }) => void
    ) => {
      return eventBus.on(`${moduleId}.${action}`, handler);
    },

    /**
     * Subscribe to cross-module events (wildcard patterns)
     */
    onCrossModule: <T = any>(
      pattern: string,
      handler: (data: T) => void
    ) => {
      return eventBus.on(pattern, handler);
    },

    /**
     * Get EventBus instance for advanced usage
     */
    getInstance: () => eventBus
  };
}

/**
 * Higher-order component for EventBus integration
 */
export function withEventBus<P extends object>(
  Component: React.ComponentType<P>
) {
  const WrappedComponent: React.FC<P> = (props) => {
    const eventBus = useEventBus();

    return <Component {...props} eventBus={eventBus} />;
  };

  WrappedComponent.displayName = `withEventBus(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Event listener hook with automatic cleanup
 */
export function useEventListener<T = any>(
  event: string,
  handler: (data: T) => void,
  deps: React.DependencyList = []
) {
  const { on, off } = useEventBus();

  useEffect(() => {
    const unsubscribe = on(event, handler);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      } else {
        off(event, handler);
      }
    };
  }, deps);
}

/**
 * Module event listener hook
 */
export function useModuleEventListener<T = any>(
  moduleId: ModuleId,
  action: string,
  handler: (data: T) => void,
  deps: React.DependencyList = []
) {
  const { onModuleEvent } = useEventBus();

  useEffect(() => {
    const unsubscribe = onModuleEvent(moduleId, action, handler);

    return unsubscribe;
  }, deps);
}

/**
 * Development helper for debugging events
 */
export function useEventBusDebugger(enabled: boolean = process.env.NODE_ENV === 'development') {
  const { getInstance } = useEventBus();

  useEffect(() => {
    if (!enabled) return;

    const eventBus = getInstance();

    // Log all events in development
    const debugHandler = (event: string, data: any) => {
      logger.info('App', `🚌 EventBus [${event}]:`, data);
    };

    // Subscribe to all events for debugging
    const unsubscribe = eventBus.on('*', debugHandler);

    return unsubscribe;
  }, [enabled, getInstance]);
}