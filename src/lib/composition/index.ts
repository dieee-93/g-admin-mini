/**
 * G-Admin v3.0 Composition System - Main Export
 * Slot-based component composition with capability integration
 * Based on 2024 React composition patterns and best practices
 */

// Core slot components
export { SlotProvider, useSlotContext, useSlotRegistration } from './SlotProvider';
export {
  Slot,
  FeatureSlot,      // NEW v4.0: Use this for new code
  CapabilitySlot,   // Backward compatibility alias
  Card,
  Dashboard,
  Module,
  createCompoundComponent
} from './Slot';

// Slot management hooks
export {
  useSlotContent,
  useCapabilitySlotContent,
  usePluggableComponents,
  useSlotRegistry,
  useSlotPerformance
} from './hooks/useSlots';

// Types
export type {
  SlotConfig,
  SlotContent,
  SlotRegistryEntry,
  SlotContextValue,
  CompoundSlotProps,
  PluggableComponentConfig,
  ModuleSlotDefinition,
  SlotCompositionStrategy,
  AdvancedSlotOptions
} from './types/SlotTypes';

// Utility functions
export { createModuleSlots, validateSlotConfiguration } from './utils/slotUtils';

/**
 * Quick start example:
 *
 * ```tsx
 * import { SlotProvider, Dashboard, useSlotContent } from '@/lib/composition';
 *
 * // In your app root
 * <SlotProvider>
 *   <Dashboard>
 *     <Dashboard.Header>
 *       <h1>My Dashboard</h1>
 *     </Dashboard.Header>
 *     <Dashboard.Content>
 *       <MainContent />
 *     </Dashboard.Content>
 *   </Dashboard>
 * </SlotProvider>
 *
 * // In a module component
 * const MyModule = () => {
 *   const { addContent } = useSlotContent('dashboard-sidebar');
 *
 *   useEffect(() => {
 *     addContent({
 *       content: <MySidebarWidget />,
 *       priority: 10
 *     });
 *   }, []);
 *
 *   return <div>Module content</div>;
 * };
 * ```
 */