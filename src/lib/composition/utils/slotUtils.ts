/**
 * Slot Utilities for G-Admin v3.0 Composition System
 * Helper functions for slot management and validation
 */

import { SlotConfig, ModuleSlotDefinition, PluggableComponentConfig } from '../types/SlotTypes';

/**
 * Creates standardized slot configurations for a module
 */
export const createModuleSlots = (
  moduleId: string,
  slotDefinitions: Array<{
    name: string;
    required?: boolean;
    defaultComponent?: any;
  }>
): SlotConfig[] => {
  return slotDefinitions.map(def => ({
    id: `${moduleId}-${def.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: `${moduleId} ${def.name}`,
    required: def.required || false,
    defaultComponent: def.defaultComponent
  }));
};

/**
 * Validates slot configuration
 */
export const validateSlotConfiguration = (config: SlotConfig): boolean => {
  // Check required fields
  if (!config.id || !config.name) {
    console.error('Slot configuration missing required fields:', config);
    return false;
  }

  // Check ID format (should be kebab-case)
  const idPattern = /^[a-z][a-z0-9-]*[a-z0-9]$/;
  if (!idPattern.test(config.id)) {
    console.error('Slot ID should be in kebab-case format:', config.id);
    return false;
  }

  return true;
};

/**
 * Creates a complete module slot definition
 */
export const createModuleDefinition = (
  moduleId: string,
  config: {
    providedSlots?: Array<{ name: string; required?: boolean }>;
    consumedSlots?: string[];
    pluggableComponents?: Array<{
      name: string;
      component: any;
      targetSlots: string[];
      capabilities?: string[];
      category?: string;
    }>;
  }
): ModuleSlotDefinition => {
  const providedSlots = config.providedSlots
    ? createModuleSlots(moduleId, config.providedSlots)
    : [];

  const pluggableComponents: PluggableComponentConfig[] = config.pluggableComponents?.map(comp => ({
    id: `${moduleId}-${comp.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: comp.name,
    component: comp.component,
    targetSlots: comp.targetSlots,
    requiredCapabilities: comp.capabilities,
    category: comp.category || moduleId,
    priority: 0
  })) || [];

  return {
    moduleId,
    providedSlots,
    consumedSlots: config.consumedSlots || [],
    pluggableComponents
  };
};

/**
 * Merges multiple slot configurations, handling conflicts
 */
export const mergeSlotConfigurations = (
  configs: SlotConfig[],
  conflictResolution: 'first' | 'last' | 'merge' = 'last'
): SlotConfig[] => {
  const slotMap = new Map<string, SlotConfig>();

  configs.forEach(config => {
    const existing = slotMap.get(config.id);

    if (!existing) {
      slotMap.set(config.id, config);
    } else {
      switch (conflictResolution) {
        case 'first':
          // Keep existing, ignore new
          break;
        case 'last':
          slotMap.set(config.id, config);
          break;
        case 'merge':
          slotMap.set(config.id, {
            ...existing,
            ...config,
            // Combine names if different
            name: existing.name !== config.name
              ? `${existing.name} / ${config.name}`
              : config.name
          });
          break;
      }
    }
  });

  return Array.from(slotMap.values());
};

/**
 * Generates slot documentation
 */
export const generateSlotDocumentation = (
  moduleDefinition: ModuleSlotDefinition
): string => {
  const { moduleId, providedSlots, consumedSlots, pluggableComponents } = moduleDefinition;

  let doc = `# ${moduleId} Module Slots\n\n`;

  if (providedSlots.length > 0) {
    doc += '## Provided Slots\n\n';
    providedSlots.forEach(slot => {
      doc += `### ${slot.name}\n`;
      doc += `- **ID**: \`${slot.id}\`\n`;
      doc += `- **Required**: ${slot.required ? 'Yes' : 'No'}\n`;
      if (slot.defaultComponent) {
        doc += `- **Default Component**: Yes\n`;
      }
      doc += '\n';
    });
  }

  if (consumedSlots.length > 0) {
    doc += '## Consumed Slots\n\n';
    consumedSlots.forEach(slotId => {
      doc += `- \`${slotId}\`\n`;
    });
    doc += '\n';
  }

  if (pluggableComponents.length > 0) {
    doc += '## Pluggable Components\n\n';
    pluggableComponents.forEach(comp => {
      doc += `### ${comp.name}\n`;
      doc += `- **ID**: \`${comp.id}\`\n`;
      doc += `- **Category**: ${comp.category}\n`;
      doc += `- **Target Slots**: ${comp.targetSlots.join(', ')}\n`;
      if (comp.requiredCapabilities && comp.requiredCapabilities.length > 0) {
        doc += `- **Required Capabilities**: ${comp.requiredCapabilities.join(', ')}\n`;
      }
      doc += '\n';
    });
  }

  return doc;
};

/**
 * Validates module slot dependencies
 */
export const validateModuleDependencies = (
  modules: ModuleSlotDefinition[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const providedSlots = new Set<string>();
  const consumedSlots = new Set<string>();

  // Collect all provided and consumed slots
  modules.forEach(module => {
    module.providedSlots.forEach(slot => {
      if (providedSlots.has(slot.id)) {
        errors.push(`Duplicate slot provided: ${slot.id} (from ${module.moduleId})`);
      }
      providedSlots.add(slot.id);
    });

    module.consumedSlots.forEach(slotId => {
      consumedSlots.add(slotId);
    });
  });

  // Check for unresolved dependencies
  consumedSlots.forEach(slotId => {
    if (!providedSlots.has(slotId)) {
      errors.push(`Unresolved slot dependency: ${slotId}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};