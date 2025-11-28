/**
 * Scheduling Module Hooks
 * Exportaciones centralizadas de hooks del módulo de scheduling
 *
 * IMPORTANTE: Este archivo re-exporta hooks desde /pages/admin/resources/scheduling
 * No contiene implementaciones propias, solo actúa como punto de acceso público
 * del módulo para consumo vía ModuleRegistry.
 *
 * @example
 * ```tsx
 * // Consumo vía ModuleRegistry (patrón Dynamic Import)
 * import { ModuleRegistry } from '@/lib/modules';
 *
 * const registry = ModuleRegistry.getInstance();
 * const schedulingModule = registry.getExports('scheduling');
 *
 * // Dynamic import del hook
 * const { useScheduling } = await schedulingModule.hooks.useScheduling();
 *
 * function MyComponent() {
 *   const { shifts, loading, createShift } = useScheduling();
 *   // ...
 * }
 * ```
 */

// Re-export del hook principal desde /pages
export { useScheduling } from '../../../pages/admin/resources/scheduling/hooks/useScheduling';

// Re-export de tipos relacionados (si existen)
export type {
  StaffShift,
  ShiftStatus,
  WorkSchedule,
  TimeOffRequest,
  ShiftTemplate,
  ShiftFormData,
  EmployeeResource,
  LaborCost,
  CoverageMetrics,
  ScheduleDashboard
} from '../../../pages/admin/resources/scheduling/types/schedulingTypes';
