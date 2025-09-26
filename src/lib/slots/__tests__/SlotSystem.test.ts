/**
 * Tests básicos para verificar el sistema de slots
 */

import { slotRegistry } from '../SlotRegistry';
import React from 'react';

// Mock component para testing
const TestComponent: React.FC<{ data?: any }> = ({ data }) =>
  React.createElement('div', null, `Test: ${data?.value || 'default'}`);

describe('Sistema de Slots', () => {
  beforeEach(() => {
    slotRegistry.clear();
  });

  test('debe registrar y obtener componentes', () => {
    // Registrar un componente
    slotRegistry.register('test-slot', TestComponent, [], {
      id: 'test-1',
      moduleId: 'test-module'
    });

    // Verificar que se registró
    const components = slotRegistry.getComponents('test-slot', []);
    expect(components).toHaveLength(1);
    expect(components[0].id).toBe('test-1');
    expect(components[0].component).toBe(TestComponent);
  });

  test('debe filtrar componentes por capacidades', () => {
    // Registrar componente que requiere capacidades
    slotRegistry.register('protected-slot', TestComponent, ['has_suppliers'], {
      id: 'protected-1',
      moduleId: 'test-module'
    });

    // Sin capacidades - no debe devolver componentes
    const withoutCapabilities = slotRegistry.getComponents('protected-slot', []);
    expect(withoutCapabilities).toHaveLength(0);

    // Con capacidades - debe devolver el componente
    const withCapabilities = slotRegistry.getComponents('protected-slot', ['has_suppliers'] as any[]);
    expect(withCapabilities).toHaveLength(1);
  });

  test('debe ordenar componentes por prioridad', () => {
    // Registrar componentes con diferentes prioridades
    slotRegistry.register('priority-slot', TestComponent, [], {
      id: 'low-priority',
      moduleId: 'test',
      priority: 1
    });

    slotRegistry.register('priority-slot', TestComponent, [], {
      id: 'high-priority',
      moduleId: 'test',
      priority: 10
    });

    const components = slotRegistry.getComponents('priority-slot', []);
    expect(components).toHaveLength(2);
    expect(components[0].id).toBe('high-priority'); // Prioridad más alta primero
    expect(components[1].id).toBe('low-priority');
  });

  test('debe desregistrar componentes por módulo', () => {
    // Registrar componentes de diferentes módulos
    slotRegistry.register('test-slot', TestComponent, [], {
      id: 'module-a-1',
      moduleId: 'module-a'
    });

    slotRegistry.register('test-slot', TestComponent, [], {
      id: 'module-b-1',
      moduleId: 'module-b'
    });

    // Verificar que ambos están registrados
    expect(slotRegistry.getComponents('test-slot', [])).toHaveLength(2);

    // Desregistrar un módulo
    slotRegistry.unregisterModule('module-a');

    // Verificar que solo queda uno
    const remaining = slotRegistry.getComponents('test-slot', []);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('module-b-1');
  });
});

/**
 * Test de integración básica
 */
describe('Integración con businessCapabilitiesStore', () => {
  test('debe usar las capacidades del store correctamente', () => {
    // Este test verificaría la integración real con el store
    // Por ahora solo verificamos que no hay errores de importación

    const { useCapabilities } = require('../../capabilities/hooks/useCapabilities');
    expect(typeof useCapabilities).toBe('function');
  });
});