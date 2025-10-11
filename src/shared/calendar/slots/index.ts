/**
 * CALENDAR SLOTS - G-ADMIN MINI v3.0
 *
 * Central export point for slot system
 * Provides organized access to slot functionality
 *
 * @version 3.0.0
 */

import React from 'react';
import type { SlotComponent, SlotRegistrationOptions, SlotRegistrationResult } from './SlotRegistry';
import {
  SlotRegistry,
  registerSlot,
  registerBusinessSlot,
  getSlotComponent,
  getBusinessSlotComponent,
  hasSlot,
  unregisterSlot,
  clearAllSlots,
  getRegistryStats,
  registerSlotsFromModule,
  autoRegisterSlots
} from './SlotRegistry';
import Slot from './Slot';
import { CALENDAR_SLOTS, BUSINESS_MODEL_SLOTS } from './CalendarSlotDefinitions';

// ===============================
// CORE SLOT EXPORTS
// ===============================

// Main slot component
export { default as Slot, ConditionalSlot, AsyncSlot, SlotGroup, useSlotRegistered, useSlotContext } from './Slot';
export type { SlotProps, SlotContext } from './Slot';

// Slot registry
export {
  SlotRegistry,
  registerSlot,
  registerBusinessSlot,
  getSlotComponent,
  getBusinessSlotComponent,
  hasSlot,
  unregisterSlot,
  clearAllSlots,
  getRegistryStats,
  registerSlotsFromModule,
  autoRegisterSlots
} from './SlotRegistry';
export type {
  SlotRegistryEvent
} from './SlotRegistry';

// Slot definitions
export {
  CALENDAR_SLOTS,
  BUSINESS_MODEL_SLOTS,
  SLOT_CATEGORIES,
  SLOT_PRIORITIES,
  getSlotsForCategory,
  getBusinessModelSlots,
  isValidSlotName,
  generateBusinessSlotName,
  parseBusinessSlotName,
  getAllSlotNames,
  getSlotDocumentation
} from './CalendarSlotDefinitions';
export type {
  CalendarSlotName,
  BusinessModelSlotName,
  AnySlotName,
  SlotCategory
} from './CalendarSlotDefinitions';

// ===============================
// CONVENIENCE FUNCTIONS
// ===============================

/**
 * Initialize slot system for a business model
 */
export function initializeSlotSystem(businessModel: string) {
  const registry = SlotRegistry.getInstance();

  return {
    // Register a slot for this business model
    register: (slotName: string, component: SlotComponent, options?: SlotRegistrationOptions) => {
      return registerBusinessSlot(businessModel, slotName, component, options);
    },

    // Get available slots for this business model
    getAvailableSlots: () => {
      return registry.getSlotsForBusinessModel(businessModel);
    },

    // Check if slot is available
    hasSlot: (slotName: string) => {
      return !!registry.getForBusinessModel(slotName, businessModel);
    },

    // Get registry stats
    getStats: () => {
      return registry.getStats();
    }
  };
}

/**
 * Batch register slots for business model
 */
export function registerBusinessModelSlots(
  businessModel: string,
  slots: Record<string, SlotComponent>,
  options?: SlotRegistrationOptions
) {
  const results: SlotRegistrationResult[] = [];

  for (const [slotName, component] of Object.entries(slots)) {
    const result = registerBusinessSlot(businessModel, slotName, component, options);
    results.push(result);
  }

  return results;
}

/**
 * Create slot provider for business model
 */
export function createSlotProvider(businessModel: string) {
  return {
    businessModel,
    getSlot: (slotName: string) => getBusinessSlotComponent(businessModel, slotName),
    hasSlot: (slotName: string) => !!getBusinessSlotComponent(businessModel, slotName),
    registerSlot: (slotName: string, component: SlotComponent, options?: SlotRegistrationOptions) =>
      registerBusinessSlot(businessModel, slotName, component, options)
  };
}

// ===============================
// SLOT SYSTEM HOOKS
// ===============================

/**
 * Hook for managing slots in a business model
 */
export function useSlotSystem(businessModel: string) {
  const [registeredSlots, setRegisteredSlots] = React.useState<string[]>([]);

  React.useEffect(() => {
    const registry = SlotRegistry.getInstance();
    const updateSlots = () => {
      setRegisteredSlots(registry.getSlotsForBusinessModel(businessModel));
    };

    // Initial load
    updateSlots();

    // Listen for changes
    const unsubscribe = registry.addEventListener(() => {
      updateSlots();
    });

    return unsubscribe;
  }, [businessModel]);

  return {
    registeredSlots,
    hasSlot: React.useCallback((slotName: string) => {
      return registeredSlots.includes(slotName) || registeredSlots.includes(`${businessModel}-${slotName}`);
    }, [registeredSlots, businessModel]),
    getSlot: React.useCallback((slotName: string) => {
      return getBusinessSlotComponent(businessModel, slotName);
    }, [businessModel])
  };
}

// ===============================
// TYPE RE-EXPORTS
// ===============================

// Re-export for convenience
export type { SlotComponent, SlotRegistrationOptions, SlotRegistrationResult };

// ===============================
// DEFAULT EXPORT
// ===============================

export default {
  Slot,
  SlotRegistry,
  CALENDAR_SLOTS,
  BUSINESS_MODEL_SLOTS,
  initializeSlotSystem,
  registerBusinessModelSlots,
  createSlotProvider
};