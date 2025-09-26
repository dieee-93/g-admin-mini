/**
 * SLOT REGISTRY - G-ADMIN MINI v3.0
 *
 * Central registry for managing slot components
 * Enables dynamic component registration and resolution
 *
 * @version 3.0.0
 */

import React from 'react';

// ===============================
// REGISTRY INTERFACES
// ===============================

/**
 * Slot component type
 */
export type SlotComponent = React.ComponentType<any>;

/**
 * Slot registration options
 */
export interface SlotRegistrationOptions {
  /**
   * Priority for slot resolution (higher = more priority)
   */
  readonly priority?: number;

  /**
   * Business models this slot applies to
   */
  readonly businessModels?: string[];

  /**
   * Whether to override existing slots
   */
  readonly override?: boolean;

  /**
   * Slot metadata
   */
  readonly metadata?: Record<string, unknown>;

  /**
   * Conditional registration function
   */
  readonly condition?: () => boolean;
}

/**
 * Registered slot entry
 */
interface SlotEntry {
  readonly name: string;
  readonly component: SlotComponent;
  readonly options: SlotRegistrationOptions;
  readonly registeredAt: Date;
}

/**
 * Slot registration result
 */
export interface SlotRegistrationResult {
  readonly success: boolean;
  readonly message?: string;
  readonly overridden?: boolean;
}

// ===============================
// SLOT REGISTRY CLASS
// ===============================

/**
 * Singleton slot registry for managing business-model-specific components
 */
export class SlotRegistry {
  private static instance: SlotRegistry | null = null;
  private slots: Map<string, SlotEntry> = new Map();
  private listeners: Set<(event: SlotRegistryEvent) => void> = new Set();

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SlotRegistry {
    if (!SlotRegistry.instance) {
      SlotRegistry.instance = new SlotRegistry();
    }
    return SlotRegistry.instance;
  }

  /**
   * Register a slot component
   */
  register(
    name: string,
    component: SlotComponent,
    options: SlotRegistrationOptions = {}
  ): SlotRegistrationResult {
    const {
      priority = 0,
      businessModels = [],
      override = false,
      metadata = {},
      condition
    } = options;

    // Check condition if provided
    if (condition && !condition()) {
      return {
        success: false,
        message: 'Slot registration condition not met'
      };
    }

    // Check if slot already exists
    const existingSlot = this.slots.get(name);
    if (existingSlot && !override) {
      // Check priority
      if (priority <= existingSlot.options.priority!) {
        return {
          success: false,
          message: `Slot "${name}" already registered with higher or equal priority`
        };
      }
    }

    // Register the slot
    const slotEntry: SlotEntry = {
      name,
      component,
      options: {
        priority,
        businessModels,
        override,
        metadata,
        condition
      },
      registeredAt: new Date()
    };

    this.slots.set(name, slotEntry);

    // Emit registration event
    this.emitEvent({
      type: 'slot_registered',
      slotName: name,
      data: slotEntry
    });

    return {
      success: true,
      overridden: !!existingSlot
    };
  }

  /**
   * Register multiple slots at once
   */
  registerMultiple(
    slots: Array<{
      name: string;
      component: SlotComponent;
      options?: SlotRegistrationOptions;
    }>
  ): SlotRegistrationResult[] {
    return slots.map(({ name, component, options }) =>
      this.register(name, component, options)
    );
  }

  /**
   * Unregister a slot
   */
  unregister(name: string): boolean {
    const existed = this.slots.has(name);
    this.slots.delete(name);

    if (existed) {
      this.emitEvent({
        type: 'slot_unregistered',
        slotName: name
      });
    }

    return existed;
  }

  /**
   * Get a slot component by name
   */
  get(name: string): SlotComponent | null {
    const slot = this.slots.get(name);
    if (!slot) return null;

    // Check condition if it exists
    if (slot.options.condition && !slot.options.condition()) {
      return null;
    }

    return slot.component;
  }

  /**
   * Get slot for specific business model
   */
  getForBusinessModel(name: string, businessModel: string): SlotComponent | null {
    // Try business-model-specific slot first
    const specificSlot = this.get(`${businessModel}-${name}`);
    if (specificSlot) return specificSlot;

    // Fall back to generic slot
    const genericSlot = this.get(name);
    if (!genericSlot) return null;

    // Check if generic slot supports this business model
    const slotEntry = this.slots.get(name);
    if (slotEntry?.options.businessModels?.length) {
      if (!slotEntry.options.businessModels.includes(businessModel)) {
        return null;
      }
    }

    return genericSlot;
  }

  /**
   * Check if a slot is registered
   */
  has(name: string): boolean {
    return this.slots.has(name);
  }

  /**
   * Get all registered slot names
   */
  getSlotNames(): string[] {
    return Array.from(this.slots.keys());
  }

  /**
   * Get slots for business model
   */
  getSlotsForBusinessModel(businessModel: string): string[] {
    const slots: string[] = [];

    for (const [name, entry] of this.slots) {
      // Include business-model-specific slots
      if (name.startsWith(`${businessModel}-`)) {
        slots.push(name);
      }
      // Include generic slots that support this business model
      else if (
        !entry.options.businessModels?.length ||
        entry.options.businessModels.includes(businessModel)
      ) {
        slots.push(name);
      }
    }

    return slots;
  }

  /**
   * Get slot metadata
   */
  getSlotInfo(name: string): SlotEntry | null {
    return this.slots.get(name) || null;
  }

  /**
   * Clear all slots
   */
  clear(): void {
    const slotNames = Array.from(this.slots.keys());
    this.slots.clear();

    this.emitEvent({
      type: 'registry_cleared',
      data: { clearedSlots: slotNames }
    });
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalSlots: number;
    businessModelSlots: Record<string, number>;
    genericSlots: number;
  } {
    const businessModelSlots: Record<string, number> = {};
    let genericSlots = 0;

    for (const name of this.slots.keys()) {
      const parts = name.split('-');
      if (parts.length > 1) {
        const businessModel = parts[0];
        businessModelSlots[businessModel] = (businessModelSlots[businessModel] || 0) + 1;
      } else {
        genericSlots++;
      }
    }

    return {
      totalSlots: this.slots.size,
      businessModelSlots,
      genericSlots
    };
  }

  // ===============================
  // EVENT SYSTEM
  // ===============================

  /**
   * Registry event types
   */
  private emitEvent(event: SlotRegistryEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in slot registry listener:', error);
      }
    }
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (event: SlotRegistryEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: SlotRegistryEvent) => void): void {
    this.listeners.delete(listener);
  }
}

// ===============================
// EVENT INTERFACES
// ===============================

/**
 * Slot registry events
 */
export interface SlotRegistryEvent {
  readonly type: 'slot_registered' | 'slot_unregistered' | 'registry_cleared';
  readonly slotName?: string;
  readonly data?: any;
}

// ===============================
// CONVENIENCE FUNCTIONS
// ===============================

/**
 * Global slot registry instance
 */
const globalRegistry = SlotRegistry.getInstance();

/**
 * Register a slot component globally
 */
export function registerSlot(
  name: string,
  component: SlotComponent,
  options?: SlotRegistrationOptions
): SlotRegistrationResult {
  return globalRegistry.register(name, component, options);
}

/**
 * Register business-model-specific slot
 */
export function registerBusinessSlot(
  businessModel: string,
  slotName: string,
  component: SlotComponent,
  options?: SlotRegistrationOptions
): SlotRegistrationResult {
  return globalRegistry.register(
    `${businessModel}-${slotName}`,
    component,
    {
      ...options,
      businessModels: [businessModel, ...(options?.businessModels || [])]
    }
  );
}

/**
 * Get slot component globally
 */
export function getSlotComponent(name: string): SlotComponent | null {
  return globalRegistry.get(name);
}

/**
 * Get slot component for business model
 */
export function getBusinessSlotComponent(
  businessModel: string,
  slotName: string
): SlotComponent | null {
  return globalRegistry.getForBusinessModel(slotName, businessModel);
}

/**
 * Check if slot exists globally
 */
export function hasSlot(name: string): boolean {
  return globalRegistry.has(name);
}

/**
 * Unregister slot globally
 */
export function unregisterSlot(name: string): boolean {
  return globalRegistry.unregister(name);
}

/**
 * Clear all slots globally
 */
export function clearAllSlots(): void {
  globalRegistry.clear();
}

/**
 * Get global registry stats
 */
export function getRegistryStats() {
  return globalRegistry.getStats();
}

// ===============================
// BATCH REGISTRATION HELPERS
// ===============================

/**
 * Register slots from module
 */
export function registerSlotsFromModule(
  module: Record<string, SlotComponent>,
  businessModel?: string,
  options?: SlotRegistrationOptions
): SlotRegistrationResult[] {
  const results: SlotRegistrationResult[] = [];

  for (const [exportName, component] of Object.entries(module)) {
    // Convert PascalCase to kebab-case
    const slotName = exportName
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');

    const fullName = businessModel ? `${businessModel}-${slotName}` : slotName;
    const result = registerSlot(fullName, component, options);
    results.push(result);
  }

  return results;
}

/**
 * Auto-register slots with naming convention
 */
export function autoRegisterSlots(
  components: Record<string, SlotComponent>,
  namingConvention: (name: string) => string = (name) => name.toLowerCase()
): SlotRegistrationResult[] {
  const results: SlotRegistrationResult[] = [];

  for (const [name, component] of Object.entries(components)) {
    const slotName = namingConvention(name);
    const result = registerSlot(slotName, component);
    results.push(result);
  }

  return results;
}

// ===============================
// EXPORTS
// ===============================

