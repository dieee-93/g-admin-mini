/**
 * Sistema de Slots para G-Admin - Punto de Entrada Principal
 * Exporta todos los componentes y utilidades del sistema modular
 */

// Core del sistema
export { slotRegistry, useSlotRegistry, registerModuleSlots } from './SlotRegistry';
export type { SlotComponent, SlotRegistration, SlotData } from './SlotRegistry';

// Componentes React
export { Slot, ConditionalSlot, InlineSlot, useSlotHasComponents } from './Slot';
export type { SlotProps } from './Slot';

// Utilidades para módulos
export * from './utils';

/**
 * Inicialización del sistema de slots
 * Debe ser llamado una vez al arrancar la aplicación
 */
export function initializeSlotSystem() {
  // Registrar slots básicos del sistema
  console.log('🎯 Sistema de Slots inicializado');

  // TODO: Registrar slots básicos aquí cuando sea necesario
  // slotRegistry.register('app-header-actions', HeaderActionsComponent, []);
}

/**
 * Versión del sistema de slots
 */
export const SLOT_SYSTEM_VERSION = '1.0.0';