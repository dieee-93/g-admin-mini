/**
 * Slot System Types for G-Admin v3.0
 * Implements Compound Components Pattern with TypeScript safety
 * Based on 2024 React slot pattern best practices
 */

import { ReactNode, ComponentType } from 'react';

/**
 * Base slot configuration
 */
export interface SlotConfig {
  /** Unique identifier for the slot */
  id: string;
  /** Display name for debugging */
  name: string;
  /** Whether the slot is required */
  required?: boolean;
  /** Default component if none provided */
  defaultComponent?: ComponentType<any>;
  /** Validation function for slot content */
  validator?: (content: ReactNode) => boolean;
}

/**
 * Slot content with metadata
 */
export interface SlotContent {
  /** The React component or element to render */
  content: ReactNode;
  /** Priority for ordering (higher = renders first) */
  priority?: number;
  /** Conditional rendering props */
  conditions?: {
    capabilities?: string[];
    mode?: 'any' | 'all';
  };
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Slot registry entry
 */
export interface SlotRegistryEntry {
  config: SlotConfig;
  contents: SlotContent[];
  /** Active content (resolved from contents) */
  activeContent?: ReactNode;
}

/**
 * Compound component slot props
 */
export interface CompoundSlotProps {
  /** Child components */
  children?: ReactNode;
  /** CSS class name */
  className?: string;
  /** Additional props passed to wrapper */
  [key: string]: any;
}

/**
 * Slot provider context value
 */
export interface SlotContextValue {
  /** Register a slot */
  registerSlot: (config: SlotConfig) => void;
  /** Unregister a slot */
  unregisterSlot: (id: string) => void;
  /** Add content to a slot */
  addSlotContent: (slotId: string, content: SlotContent) => void;
  /** Remove content from a slot */
  removeSlotContent: (slotId: string, contentId: string) => void;
  /** Get slot configuration */
  getSlot: (id: string) => SlotRegistryEntry | undefined;
  /** Get all slots */
  getAllSlots: () => Record<string, SlotRegistryEntry>;
  /** Check if slot exists */
  hasSlot: (id: string) => boolean;
}

/**
 * Pluggable component interface
 */
export interface PluggableComponentConfig {
  /** Component identifier */
  id: string;
  /** Component name for display */
  name: string;
  /** React component */
  component: ComponentType<any>;
  /** Target slot IDs where this component can be used */
  targetSlots: string[];
  /** Business capabilities required to show this component */
  requiredCapabilities?: string[];
  /** Priority for auto-placement */
  priority?: number;
  /** Component category for organization */
  category?: string;
}

/**
 * Module slot definition
 */
export interface ModuleSlotDefinition {
  /** Module identifier */
  moduleId: string;
  /** Slots provided by this module */
  providedSlots: SlotConfig[];
  /** Slots consumed by this module */
  consumedSlots: string[];
  /** Pluggable components offered by this module */
  pluggableComponents: PluggableComponentConfig[];
}

/**
 * Slot composition strategy
 */
export type SlotCompositionStrategy =
  | 'compound'      // Compound components pattern (Card.Header, Card.Body)
  | 'named-props'   // Named props pattern (header={}, body={})
  | 'children-type' // Children type detection pattern
  | 'context-based' // Context-driven slot resolution;

/**
 * Advanced slot options
 */
export interface AdvancedSlotOptions {
  /** Composition strategy to use */
  strategy: SlotCompositionStrategy;
  /** Enable hot reloading of slot content */
  hotReload?: boolean;
  /** Enable performance monitoring */
  performanceTracking?: boolean;
  /** Maximum number of contents per slot */
  maxContents?: number;
  /** Enable accessibility features */
  accessibility?: {
    announceChanges?: boolean;
    labelledBy?: string;
    describedBy?: string;
  };
}