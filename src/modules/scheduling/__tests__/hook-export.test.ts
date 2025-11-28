/**
 * Test de exportación del hook useScheduling
 * Verifica que el patrón Dynamic Import funcione correctamente
 */

import { describe, it, expect } from 'vitest';

describe('Scheduling Module - Hook Export', () => {
  it('should export useScheduling hook via index', async () => {
    // Arrange & Act
    const module = await import('../hooks/index');

    // Assert
    expect(module).toHaveProperty('useScheduling');
    expect(typeof module.useScheduling).toBe('function');
  });

  it('should export types via index', async () => {
    // Arrange & Act
    const module = await import('../hooks/index');

    // Assert - verificar que los tipos están disponibles
    // No podemos testear tipos en runtime, pero podemos verificar que el módulo se importa
    expect(module).toBeDefined();
  });

  it('should match the manifest export pattern', async () => {
    // Arrange
    const { schedulingManifest } = await import('../manifest');

    // Act
    const exports = schedulingManifest.exports as any;

    // Assert
    expect(exports).toHaveProperty('hooks');
    expect(exports.hooks).toHaveProperty('useScheduling');
    expect(typeof exports.hooks.useScheduling).toBe('function');
  });

  it('should dynamically import the hook via manifest', async () => {
    // Arrange
    const { schedulingManifest } = await import('../manifest');
    const exports = schedulingManifest.exports as any;

    // Act
    const hookModule = await exports.hooks.useScheduling();

    // Assert
    expect(hookModule).toHaveProperty('useScheduling');
    expect(typeof hookModule.useScheduling).toBe('function');
  });
});

/**
 * Ejemplo de uso del hook en un componente (no ejecutable, solo referencia)
 */
const USAGE_EXAMPLE = `
import { ModuleRegistry } from '@/lib/modules';

async function SchedulingDashboardWidget() {
  const registry = ModuleRegistry.getInstance();
  const schedulingModule = registry.getExports('scheduling');

  // Dynamic import del hook
  const { useScheduling } = await schedulingModule.hooks.useScheduling();

  function InnerComponent() {
    const {
      shifts,
      schedules,
      loading,
      createShift,
      publishSchedule,
      refreshData
    } = useScheduling();

    if (loading) return <div>Loading...</div>;

    return (
      <div>
        <h3>Shifts This Week: {shifts.length}</h3>
        <h3>Schedules: {schedules.length}</h3>
        <button onClick={refreshData}>Refresh</button>
      </div>
    );
  }

  return <InnerComponent />;
}
`;

export { USAGE_EXAMPLE };
