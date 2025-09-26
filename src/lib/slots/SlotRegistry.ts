/**
 * Sistema de Slots para G-Admin - Arquitectura Modular
 * Permite a los módulos registrar componentes dinámicamente
 * Elimina la necesidad de condicionales hardcodeados por toda la app
 */

import React from 'react';
import type { BusinessCapability } from '../capabilities/types/BusinessCapabilities';

export interface SlotComponent {
  component: React.ComponentType<any>;
  requirements: BusinessCapability[];
  priority?: number;
  id: string;
  moduleId: string;
}

export interface SlotRegistration {
  name: string;
  components: SlotComponent[];
}

export interface SlotData {
  [key: string]: any;
}

/**
 * Registry global para todos los slots del sistema
 */
class SlotRegistry {
  private slots: Map<string, SlotComponent[]> = new Map();
  private listeners: Set<() => void> = new Set();

  /**
   * Registra un componente en un slot específico
   */
  register(
    slotName: string,
    component: React.ComponentType<any>,
    requirements: BusinessCapability[] = [],
    options: {
      priority?: number;
      id?: string;
      moduleId?: string;
    } = {}
  ): void {
    const slotComponent: SlotComponent = {
      component,
      requirements,
      priority: options.priority || 0,
      id: options.id || `${options.moduleId || 'unknown'}-${Date.now()}`,
      moduleId: options.moduleId || 'unknown'
    };

    if (!this.slots.has(slotName)) {
      this.slots.set(slotName, []);
    }

    const existingComponents = this.slots.get(slotName)!;
    existingComponents.push(slotComponent);

    // Ordenar por prioridad (mayor prioridad primero)
    existingComponents.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    this.notifyListeners();
  }

  /**
   * Desregistra un componente específico
   */
  unregister(slotName: string, componentId: string): void {
    const components = this.slots.get(slotName);
    if (components) {
      const filtered = components.filter(comp => comp.id !== componentId);
      this.slots.set(slotName, filtered);
      this.notifyListeners();
    }
  }

  /**
   * Desregistra todos los componentes de un módulo
   */
  unregisterModule(moduleId: string): void {
    for (const [slotName, components] of this.slots.entries()) {
      const filtered = components.filter(comp => comp.moduleId !== moduleId);
      this.slots.set(slotName, filtered);
    }
    this.notifyListeners();
  }

  /**
   * Obtiene componentes válidos para un slot según capacidades resueltas
   */
  getComponents(
    slotName: string,
    resolvedCapabilities: BusinessCapability[]
  ): SlotComponent[] {
    const components = this.slots.get(slotName) || [];

    return components.filter(comp => {
      // Si no tiene requirements, siempre se muestra
      if (comp.requirements.length === 0) return true;

      // Verificar que todas las capacidades requeridas estén disponibles
      return comp.requirements.every(req => resolvedCapabilities.includes(req));
    });
  }

  /**
   * Verifica si un slot tiene componentes válidos
   */
  hasComponents(slotName: string, resolvedCapabilities: BusinessCapability[]): boolean {
    return this.getComponents(slotName, resolvedCapabilities).length > 0;
  }

  /**
   * Obtiene todos los slots registrados
   */
  getAllSlots(): string[] {
    return Array.from(this.slots.keys());
  }

  /**
   * Obtiene información de debug sobre el estado del registry
   */
  getDebugInfo(): Record<string, any> {
    const info: Record<string, any> = {};

    for (const [slotName, components] of this.slots.entries()) {
      info[slotName] = components.map(comp => ({
        id: comp.id,
        moduleId: comp.moduleId,
        requirements: comp.requirements,
        priority: comp.priority
      }));
    }

    return info;
  }

  /**
   * Limpia todos los slots (útil para testing)
   */
  clear(): void {
    this.slots.clear();
    this.notifyListeners();
  }

  /**
   * Suscribe a cambios en el registry
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Instancia global del registry
export const slotRegistry = new SlotRegistry();

/**
 * Hook para usar el registry en componentes React
 */
export function useSlotRegistry() {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  React.useEffect(() => {
    return slotRegistry.subscribe(forceUpdate);
  }, []);

  return slotRegistry;
}

/**
 * Utilidad para módulos - registra múltiples slots de una vez
 */
export function registerModuleSlots(
  moduleId: string,
  slots: Array<{
    slotName: string;
    component: React.ComponentType<any>;
    requirements?: BusinessCapability[];
    priority?: number;
  }>
): void {
  slots.forEach(({ slotName, component, requirements = [], priority = 0 }) => {
    slotRegistry.register(slotName, component, requirements, {
      priority,
      moduleId,
      id: `${moduleId}-${slotName}-${Date.now()}`
    });
  });
}