/**
 * Utilidades para el sistema de slots
 * Helper functions para simplificar el uso del sistema
 */

import { slotRegistry } from './SlotRegistry';
import type { BusinessCapability } from '../capabilities/types/BusinessCapabilities';

/**
 * Registra múltiples slots para un módulo específico
 * Simplifica el registro masivo de componentes
 */
export function createModuleSlots(moduleId: string) {
  return {
    /**
     * Registra un slot con sintaxis fluida
     */
    register: (
      slotName: string,
      component: React.ComponentType<any>,
      requirements: BusinessCapability[] = [],
      priority: number = 0
    ) => {
      slotRegistry.register(slotName, component, requirements, {
        moduleId,
        priority,
        id: `${moduleId}-${slotName}-${Date.now()}`
      });
    },

    /**
     * Desregistra todos los slots del módulo
     */
    unregisterAll: () => {
      slotRegistry.unregisterModule(moduleId);
    }
  };
}

/**
 * Declaración de slots - para TypeScript
 * Define todos los slots disponibles en el sistema
 */
export interface SlotDefinitions {
  // Material/Product slots
  'material-supplier': { material: any };
  'material-actions': { material: any };
  'material-analytics': { material: any };
  'material-metadata': { material: any };

  // Product slots
  'product-supplier': { product: any };
  'product-analytics': { product: any };
  'product-actions': { product: any };
  'product-pricing': { product: any };

  // Customer slots
  'customer-actions': { customer: any };
  'customer-analytics': { customer: any };
  'customer-metadata': { customer: any };

  // Sales slots
  'sale-analytics': { sale: any };
  'sale-actions': { sale: any };
  'sale-payment': { sale: any };

  // Staff slots
  'staff-actions': { staff: any };
  'staff-analytics': { staff: any };
  'staff-scheduling': { staff: any };

  // Dashboard slots
  'dashboard-widget': { widget?: any };
  'dashboard-action': { action?: any };

  // App-level slots
  'app-header-actions': {};
  'app-sidebar-items': {};
  'app-footer-content': {};
}

/**
 * Type-safe slot names
 */
export type SlotName = keyof SlotDefinitions;

/**
 * Helper para crear componentes de slot con tipos seguros
 */
export function createTypedSlot<T extends SlotName>(
  slotName: T
): React.FC<{
  data?: SlotDefinitions[T];
  fallback?: React.ReactNode;
}> {
  return ({ data, fallback }) => {
    // Usar dynamic import para evitar circular dependencies
    const { Slot } = require('./Slot');
    return <Slot name={slotName} data={data} fallback={fallback} />;
  };
}

/**
 * Debug helper - muestra información de todos los slots
 */
export function debugSlots(): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('🎯 Debug Slots System');
    console.log('Registry Info:', slotRegistry.getDebugInfo());
    console.log('All Slots:', slotRegistry.getAllSlots());
    console.groupEnd();
  }
}

/**
 * Macro para registrar slots comunes de un módulo
 */
export function registerCommonModuleSlots(
  moduleId: string,
  entityName: string,
  components: {
    actions?: React.ComponentType<any>;
    analytics?: React.ComponentType<any>;
    metadata?: React.ComponentType<any>;
  },
  requirements: BusinessCapability[] = []
) {
  const module = createModuleSlots(moduleId);

  if (components.actions) {
    module.register(`${entityName}-actions`, components.actions, requirements, 10);
  }

  if (components.analytics) {
    module.register(`${entityName}-analytics`, components.analytics, requirements, 5);
  }

  if (components.metadata) {
    module.register(`${entityName}-metadata`, components.metadata, requirements, 0);
  }
}