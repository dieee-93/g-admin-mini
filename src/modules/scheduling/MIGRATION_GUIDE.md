# Scheduling Module - Migration Guide

## ✅ Hook Export Completed

El hook `useScheduling` ahora está disponible públicamente a través del manifest del módulo.

---

## 📦 Estructura del Módulo

```
src/modules/scheduling/
├── manifest.tsx              # ✅ Exporta hooks.useScheduling
├── hooks/
│   └── index.ts             # ✅ Re-exporta desde /pages
└── components/
    └── SchedulingWidget.tsx  # ⚠️ Migración pendiente
```

---

## 🔄 Patrón de Consumo: Dynamic Import

### Opción A: Consumo desde ModuleRegistry (Recomendado para widgets cross-module)

```tsx
/**
 * Ejemplo: Dashboard Widget consumiendo Scheduling hook
 * Ubicación: src/modules/dashboard/components/SchedulingWidget.tsx
 */
import { useEffect, useState } from 'react';
import { ModuleRegistry } from '@/lib/modules';
import type { StaffShift } from '@/modules/scheduling/hooks';

export default function SchedulingDashboardWidget() {
  const [hookModule, setHookModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Dynamic import del hook
  useEffect(() => {
    async function loadHook() {
      const registry = ModuleRegistry.getInstance();
      const schedulingModule = registry.getExports('scheduling');

      const module = await schedulingModule.hooks.useScheduling();
      setHookModule(() => module);
      setLoading(false);
    }
    loadHook();
  }, []);

  if (loading || !hookModule) {
    return <div>Cargando...</div>;
  }

  // ✅ Usar el hook importado dinámicamente
  const { useScheduling } = hookModule;
  const { shifts, loading: shiftsLoading, refreshData } = useScheduling();

  return (
    <div>
      <h3>Turnos esta semana: {shifts.length}</h3>
      <button onClick={refreshData}>Refrescar</button>
    </div>
  );
}
```

### Opción B: Import directo (Para componentes dentro del módulo)

```tsx
/**
 * Para componentes que pertenecen al módulo Scheduling
 * Ubicación: src/modules/scheduling/components/SchedulingWidget.tsx
 */
import { useScheduling } from '@/modules/scheduling/hooks';

export default function SchedulingWidget() {
  // ✅ Import directo - sin dynamic import necesario
  const { shifts, loading, refreshData } = useScheduling();

  return (
    <div>
      <h3>Turnos: {shifts.length}</h3>
      <button onClick={refreshData}>Refrescar</button>
    </div>
  );
}
```

**IMPORTANTE**: El import directo (`@/modules/scheduling/hooks`) solo debe usarse dentro del propio módulo.
Para consumo cross-module, usar siempre el ModuleRegistry (Opción A).

---

## 🚨 Migración de SchedulingWidget.tsx

### Estado Actual (❌ Incorrecto)

```tsx
// src/modules/scheduling/components/SchedulingWidget.tsx
import { useScheduling } from '@/pages/admin/resources/scheduling/hooks/useScheduling';

export default function SchedulingWidget() {
  const { shifts, loading } = useScheduling();
  // ...
}
```

**Problema**: Importa desde `/pages` directamente, saltando la API pública del módulo.

### Estado Deseado (✅ Correcto)

```tsx
// src/modules/scheduling/components/SchedulingWidget.tsx
import { useScheduling } from '@/modules/scheduling/hooks';

export default function SchedulingWidget() {
  const { shifts, loading } = useScheduling();
  // ...
}
```

**Beneficios**:
- ✅ Usa la API pública del módulo
- ✅ Respeta la arquitectura de módulos
- ✅ Mejor tree-shaking y lazy loading
- ✅ Permite refactorizar `/pages` sin romper dependencias

---

## 📊 Comparación con Otros Módulos

| Módulo             | Patrón         | State Management | Ubicación Hook                            |
|--------------------|----------------|------------------|-------------------------------------------|
| finance-corporate  | Dynamic Import | Zustand          | /modules/finance-corporate/hooks/         |
| cash-management    | Dynamic Import | Zustand          | /modules/cash-management/hooks/           |
| **scheduling**     | Dynamic Import | **useState**     | /pages/.../hooks/ (re-exportado)          |
| materials          | Hook Factory   | useCrudOperations| Inline en manifest                        |

**IMPORTANTE**: Scheduling usa `useState` (NO Zustand). Esto está bien y es válido.

---

## 🎯 Hook API Completa

```tsx
interface UnifiedSchedulingState {
  shifts: StaffShift[];
  schedules: WorkSchedule[];
  timeOffRequests: TimeOffRequest[];
  shiftTemplates: ShiftTemplate[];
  employeeResources: EmployeeResource[];
  dashboard: ScheduleDashboard | null;
  laborCosts: LaborCost[];
  coverageMetrics: CoverageMetrics[];
  loading: boolean;
  error: string | null;
  selectedDateRange: DateRange;
  timezone: TimezoneString;
  filters: {
    position?: string;
    employeeId?: string;
    status?: ShiftStatus;
  };
}

interface UnifiedSchedulingActions {
  // Shift management
  createShift: (shiftData: ShiftFormData) => Promise<StaffShift>;
  updateShift: (shiftId: string, updates: Partial<StaffShift>) => Promise<void>;
  deleteShift: (shiftId: string) => Promise<void>;
  bulkCreateShifts: (shiftsData: ShiftFormData[]) => Promise<StaffShift[]>;
  checkShiftConflicts: (employeeId: string, timeSlot: TimeSlot) => Promise<StaffShift[]>;

  // Schedule management
  createSchedule: (schedule: Omit<WorkSchedule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WorkSchedule>;
  publishSchedule: (scheduleId: string) => Promise<void>;
  copySchedule: (sourceRange: DateRange, targetRange: DateRange) => Promise<void>;
  optimizeSchedule: (dateRange: DateRange, constraints?: any) => Promise<void>;

  // Time-off management
  createTimeOffRequest: (request: Omit<TimeOffRequest, 'id' | 'requestedAt'>) => Promise<void>;
  approveTimeOffRequest: (requestId: string, reviewedBy: string) => Promise<void>;
  denyTimeOffRequest: (requestId: string, reviewedBy: string, reason?: string) => Promise<void>;

  // Real-time features
  getAvailableSlots: (date: ISODateString, employeeIds: string[], duration: DurationMinutes) => Promise<TimeSlot[]>;
  getDashboard: (date: ISODateString) => Promise<ScheduleDashboard>;
  calculateLaborCosts: (dateRange: DateRange) => Promise<LaborCost[]>;
  analyzeCoverage: (dateRange: DateRange) => Promise<CoverageMetrics[]>;

  // Filters and navigation
  setFilters: (filters: Partial<UnifiedSchedulingState['filters']>) => void;
  setDateRange: (dateRange: DateRange) => void;
  navigateWeek: (direction: 'prev' | 'next') => void;
  navigateDay: (direction: 'prev' | 'next') => void;

  // Data refresh
  refreshData: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

function useScheduling(): UnifiedSchedulingState & UnifiedSchedulingActions;
```

---

## ✅ Tareas Completadas

- [x] Crear `src/modules/scheduling/hooks/index.ts` con re-export desde `/pages`
- [x] Actualizar `manifest.tsx` con `exports.hooks.useScheduling` (Dynamic Import pattern)
- [x] Documentar tipos exportados (StaffShift, WorkSchedule, TimeOffRequest, etc.)
- [x] Agregar ejemplos de consumo en JSDoc del manifest
- [x] Validar TypeScript compilation (sin errores)

---

## 📝 Tareas Pendientes (Opcional)

- [ ] Migrar `SchedulingWidget.tsx` para usar `@/modules/scheduling/hooks`
- [ ] Crear ejemplo de consumo cross-module en Dashboard
- [ ] Agregar tests de integración para el hook exportado
- [ ] Documentar diferencias con módulos que usan Zustand

---

## 🔍 Verificación

```bash
# 1. Verificar exportaciones del módulo
grep -r "useScheduling" src/modules/scheduling/

# 2. Verificar imports directos desde /pages (deben migrar)
grep -r "from '@/pages/admin/resources/scheduling/hooks/useScheduling'" src/modules/

# 3. TypeScript check
npx tsc --noEmit

# 4. Verificar que el hook se puede importar
node -e "import('./src/modules/scheduling/hooks/index').then(m => console.log(Object.keys(m)))"
```

---

## 📚 Referencias

- **Patrón Dynamic Import**: `src/modules/finance-corporate/manifest.tsx:72`
- **Hook original**: `src/pages/admin/resources/scheduling/hooks/useScheduling.ts`
- **Re-export**: `src/modules/scheduling/hooks/index.ts`
- **Manifest export**: `src/modules/scheduling/manifest.tsx:172-190`

---

**Creado**: 2025-01-27
**Autor**: Claude Code
**Versión**: 1.0
