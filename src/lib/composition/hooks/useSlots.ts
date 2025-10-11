/**
 * Slot System Hooks for G-Admin v3.0
 * Provides convenient hooks for slot management and content injection
 * Based on 2024 React composition patterns
 */

import React, { useCallback, useMemo } from 'react';
import { useSlotContext } from '../SlotProvider';
import { SlotContent, PluggableComponentConfig } from '../types/SlotTypes';
import { useCapabilities } from '@/store/capabilityStore';

/**
 * Hook for managing slot content with capabilities integration
 */
export const useSlotContent = (slotId: string) => {
  const { getSlot, addSlotContent, removeSlotContent } = useSlotContext();
  const slot = getSlot(slotId);

  const addContent = useCallback((content: SlotContent) => {
    addSlotContent(slotId, content);
  }, [slotId, addSlotContent]);

  const removeContent = useCallback((contentId: string) => {
    removeSlotContent(slotId, contentId);
  }, [slotId, removeSlotContent]);

  return {
    slot,
    addContent,
    removeContent,
    hasContent: !!slot?.activeContent,
    contentCount: slot?.contents?.length || 0
  };
};

/**
 * Hook for feature-aware content injection (NEW v4.0)
 */
export const useFeatureSlotContent = (
  slotId: string,
  requiredFeatures: string[] = [],
  mode: 'any' | 'all' = 'any'
) => {
  const { hasFeature, hasAllFeatures } = useCapabilities();
  const { addContent, removeContent, ...slotInfo } = useSlotContent(slotId);

  const hasAccess = useMemo(() => {
    if (requiredFeatures.length === 0) return true;

    return mode === 'all'
      ? hasAllFeatures(requiredFeatures as any[])
      : requiredFeatures.some(feat => hasFeature(feat as any));
  }, [requiredFeatures, mode, hasFeature, hasAllFeatures]);

  const addFeatureContent = useCallback((content: Omit<SlotContent, 'conditions'>) => {
    if (hasAccess) {
      addContent({
        ...content,
        conditions: {
          capabilities: requiredFeatures, // Keep key name for backward compat with SlotContent type
          mode
        }
      });
    }
  }, [hasAccess, addContent, requiredFeatures, mode]);

  return {
    ...slotInfo,
    hasAccess,
    addContent: addFeatureContent,
    removeContent
  };
};

/**
 * @deprecated Use useFeatureSlotContent instead
 * Backward compatibility alias
 */
export const useCapabilitySlotContent = useFeatureSlotContent;

/**
 * Hook for managing pluggable components
 */
export const usePluggableComponents = (targetSlotIds: string[] = []) => {
  const { getAllSlots, addSlotContent } = useSlotContext();
  const { hasFeature, hasAllFeatures } = useCapabilities();

  // Register a pluggable component
  const registerComponent = useCallback((config: PluggableComponentConfig) => {
    const {
      id,
      component: Component,
      targetSlots,
      requiredCapabilities = [],
      priority = 0
    } = config;

    // Check capabilities (now using features)
    const hasAccess = requiredCapabilities.length === 0 ||
      requiredCapabilities.some(cap => hasFeature(cap as any));

    if (!hasAccess) {
      return;
    }

    // Find valid target slots
    const validSlots = targetSlots.filter(slotId =>
      targetSlotIds.length === 0 || targetSlotIds.includes(slotId)
    );

    // Add component to each valid slot
    validSlots.forEach(slotId => {
      addSlotContent(slotId, {
        content: React.createElement(Component, { key: id }),
        priority,
        conditions: {
          capabilities: requiredCapabilities,
          mode: 'any'
        },
        metadata: {
          componentId: id,
          category: config.category
        }
      });
    });
  }, [targetSlotIds, hasFeature, addSlotContent]);

  // Get components for specific slots
  const getSlotComponents = useCallback((slotId: string) => {
    const allSlots = getAllSlots();
    const slot = allSlots[slotId];

    if (!slot) return [];

    return slot.contents.map(content => ({
      content: content.content,
      priority: content.priority || 0,
      metadata: content.metadata
    }));
  }, [getAllSlots]);

  return {
    registerComponent,
    getSlotComponents
  };
};

/**
 * Hook for dynamic slot discovery and management
 */
export const useSlotRegistry = () => {
  const { getAllSlots, hasSlot, registerSlot, unregisterSlot } = useSlotContext();

  // Get all available slots
  const availableSlots = useMemo(() => {
    const slots = getAllSlots();
    return Object.keys(slots).map(id => ({
      id,
      name: slots[id].config.name,
      required: slots[id].config.required || false,
      hasContent: !!slots[id].activeContent,
      contentCount: slots[id].contents.length
    }));
  }, [getAllSlots]);

  // Get slots by category or pattern
  const getSlotsByPattern = useCallback((pattern: string | RegExp) => {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return availableSlots.filter(slot => regex.test(slot.id));
  }, [availableSlots]);

  // Bulk slot operations
  const bulkRegisterSlots = useCallback((slots: Array<{ id: string; name: string; required?: boolean }>) => {
    slots.forEach(slot => {
      registerSlot({
        id: slot.id,
        name: slot.name,
        required: slot.required || false
      });
    });
  }, [registerSlot]);

  return {
    availableSlots,
    hasSlot,
    getSlotsByPattern,
    bulkRegisterSlots,
    registerSlot,
    unregisterSlot
  };
};

/**
 * Hook for slot performance monitoring
 */
export const useSlotPerformance = (slotId: string, enabled: boolean = false) => {
  const { getSlot } = useSlotContext();

  const getPerformanceMetrics = useCallback(() => {
    if (!enabled) return null;

    const slot = getSlot(slotId);
    if (!slot) return null;

    return {
      slotId,
      contentCount: slot.contents.length,
      hasActiveContent: !!slot.activeContent,
      lastUpdated: Date.now() // In real implementation, track actual update times
    };
  }, [enabled, slotId, getSlot]);

  return {
    getMetrics: getPerformanceMetrics,
    enabled
  };
};

/**
 * Main useSlots hook - combines all slot functionality for debugging
 * Used primarily by debug tools
 */
export const useSlots = () => {
  const { getAllSlots, registerSlot, unregisterSlot } = useSlotContext();
  const { getSlotComponents } = usePluggableComponents();

  return {
    getAllSlots,
    registerSlot,
    unregisterSlot,
    getSlotComponents
  };
};