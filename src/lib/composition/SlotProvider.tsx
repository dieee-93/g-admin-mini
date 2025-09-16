/**
 * Slot Provider for G-Admin v3.0 Composition System
 * Implements context-based slot management with TypeScript safety
 * Based on 2024 React composition patterns
 */

import React, { createContext, useContext, useCallback, useState, useMemo, ReactNode } from 'react';
import {
  SlotConfig,
  SlotContent,
  SlotRegistryEntry,
  SlotContextValue,
  AdvancedSlotOptions
} from './types/SlotTypes';

/**
 * Slot context for managing slot registration and content
 */
const SlotContext = createContext<SlotContextValue | null>(null);

/**
 * Hook to access slot context
 */
export const useSlotContext = (): SlotContextValue => {
  const context = useContext(SlotContext);
  if (!context) {
    throw new Error('useSlotContext must be used within a SlotProvider');
  }
  return context;
};

/**
 * Slot provider props
 */
interface SlotProviderProps {
  children: ReactNode;
  options?: AdvancedSlotOptions;
  debug?: boolean;
}

/**
 * Slot provider component - manages slot registry and content distribution
 */
export const SlotProvider: React.FC<SlotProviderProps> = ({
  children,
  options = { strategy: 'compound' },
  debug = false
}) => {
  // Slot registry state
  const [slotRegistry, setSlotRegistry] = useState<Record<string, SlotRegistryEntry>>({});

  // Register a new slot
  const registerSlot = useCallback((config: SlotConfig) => {
    setSlotRegistry(prev => {
      if (prev[config.id]) {
        if (debug) {
          console.warn(`🎰 Slot ${config.id} already registered, updating configuration`);
        }
        return {
          ...prev,
          [config.id]: {
            ...prev[config.id],
            config
          }
        };
      }

      if (debug) {
        console.log(`🎰 Registering slot: ${config.id} (${config.name})`);
      }

      return {
        ...prev,
        [config.id]: {
          config,
          contents: []
        }
      };
    });
  }, [debug]);

  // Unregister a slot
  const unregisterSlot = useCallback((id: string) => {
    setSlotRegistry(prev => {
      if (!prev[id]) {
        if (debug) {
          console.warn(`🎰 Attempted to unregister non-existent slot: ${id}`);
        }
        return prev;
      }

      if (debug) {
        console.log(`🎰 Unregistering slot: ${id}`);
      }

      const { [id]: removed, ...rest } = prev;
      return rest;
    });
  }, [debug]);

  // Add content to a slot
  const addSlotContent = useCallback((slotId: string, content: SlotContent) => {
    setSlotRegistry(prev => {
      if (!prev[slotId]) {
        if (debug) {
          console.warn(`🎰 Attempted to add content to non-existent slot: ${slotId}`);
        }
        return prev;
      }

      const slot = prev[slotId];
      const updatedContents = [...slot.contents, content];

      // Sort by priority (higher priority first)
      updatedContents.sort((a, b) => (b.priority || 0) - (a.priority || 0));

      if (debug) {
        console.log(`🎰 Adding content to slot: ${slotId}, total contents: ${updatedContents.length}`);
      }

      return {
        ...prev,
        [slotId]: {
          ...slot,
          contents: updatedContents,
          activeContent: updatedContents[0]?.content // Use highest priority content
        }
      };
    });
  }, [debug]);

  // Remove content from a slot
  const removeSlotContent = useCallback((slotId: string, contentId: string) => {
    setSlotRegistry(prev => {
      if (!prev[slotId]) {
        return prev;
      }

      const slot = prev[slotId];
      const updatedContents = slot.contents.filter(
        (content, index) => `${slotId}-${index}` !== contentId
      );

      if (debug) {
        console.log(`🎰 Removing content from slot: ${slotId}, remaining: ${updatedContents.length}`);
      }

      return {
        ...prev,
        [slotId]: {
          ...slot,
          contents: updatedContents,
          activeContent: updatedContents[0]?.content
        }
      };
    });
  }, [debug]);

  // Get slot configuration and state
  const getSlot = useCallback((id: string): SlotRegistryEntry | undefined => {
    return slotRegistry[id];
  }, [slotRegistry]);

  // Get all slots
  const getAllSlots = useCallback(() => {
    return slotRegistry;
  }, [slotRegistry]);

  // Check if slot exists
  const hasSlot = useCallback((id: string): boolean => {
    return id in slotRegistry;
  }, [slotRegistry]);

  // Context value
  const contextValue: SlotContextValue = useMemo(() => ({
    registerSlot,
    unregisterSlot,
    addSlotContent,
    removeSlotContent,
    getSlot,
    getAllSlots,
    hasSlot
  }), [
    registerSlot,
    unregisterSlot,
    addSlotContent,
    removeSlotContent,
    getSlot,
    getAllSlots,
    hasSlot
  ]);

  // Debug information
  if (debug && process.env.NODE_ENV === 'development') {
     
    React.useEffect(() => {
      console.log('🎰 Slot Registry State:', {
        totalSlots: Object.keys(slotRegistry).length,
        slots: Object.keys(slotRegistry),
        strategy: options.strategy
      });
    });
  }

  return (
    <SlotContext.Provider value={contextValue}>
      {children}
    </SlotContext.Provider>
  );
};

/**
 * Hook to register a slot and manage its lifecycle
 */
export const useSlotRegistration = (config: SlotConfig) => {
  const { registerSlot, unregisterSlot } = useSlotContext();

  React.useEffect(() => {
    registerSlot(config);
    return () => unregisterSlot(config.id);
  }, [config.id, config.name, config.required, registerSlot, unregisterSlot]);
};

/**
 * Hook to add content to a slot
 */
export const useSlotContent = (slotId: string, content: SlotContent) => {
  const { addSlotContent, removeSlotContent } = useSlotContext();

  React.useEffect(() => {
    const contentId = `${slotId}-${Date.now()}-${Math.random()}`;
    addSlotContent(slotId, content);

    return () => removeSlotContent(slotId, contentId);
  }, [slotId, content.content, content.priority, addSlotContent, removeSlotContent]);
};