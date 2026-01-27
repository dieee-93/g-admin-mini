# ShiftControl Implementation - Continuation Prompt

**Fecha**: 2025-12-04
**Estado**: 📋 READY TO CONTINUE
**Contexto**: Session ended after research and architecture definition

---

## 🎯 OBJETIVO DE LA PRÓXIMA SESIÓN

Implementar el módulo ShiftControl con arquitectura de **Multiple Operational Shifts** basada en investigación de sistemas reales (Toast POS, Square, Odoo).

---

## ✅ LO QUE YA ESTÁ HECHO

### 1. **Investigación Completa** ✅

**Documentos creados:**
- `RESEARCH_OPERATIONAL_VS_EMPLOYEE_SHIFTS.md` - Distinción crítica entre operational shift vs employee shift
- `SHIFT_LIFECYCLE_BY_CAPABILITY.md` - Matriz de behaviors por capability
- `SHIFT_CONTROL_EXECUTION_PLAN.md` - Plan ejecutable (ahora desactualizado)
- `IMPLEMENTATION_COMPLETE.md` - Estado del módulo básico
- `INTEGRATION_GUIDE.md` - Guía de integración con otros módulos

**Hallazgos clave:**
- ✅ Operational Shift ≠ Employee Shift (conceptos diferentes)
- ✅ Scheduling module ya maneja employee shifts (NO duplicar)
- ✅ ShiftControl es orchestrator, NO domain expert
- ✅ Sistemas reales (Toast, Square, Odoo) analizados
- ✅ BusinessHoursConfig ya existe en Scheduling

### 2. **Módulo Básico Implementado** ✅

**Archivos existentes:**
```
src/modules/shift-control/
├── types/index.ts           ✅ Types básicos
├── store/shiftStore.ts      ✅ Zustand store con selectores optimizados
├── handlers/                ✅ Event handlers (cash, staff, materials)
├── components/
│   └── ShiftControlWidget.tsx  ✅ Widget optimizado (sin loop infinito)
├── manifest.tsx             ✅ Module manifest con event subscriptions
└── index.ts                 ✅ Public exports
```

**Widgets de indicadores creados:**
- `cash-management/widgets/CashSessionIndicator.tsx` ✅
- `staff/widgets/StaffIndicator.tsx` ✅
- `materials/widgets/StockAlertIndicator.tsx` ✅

**Estado:**
- ✅ Registrado en `src/modules/index.ts`
- ✅ Inyectado en dashboard con prioridad 110
- ✅ Performance optimizado (useShallow, useMemo, useCallback)

### 3. **Decisiones Tomadas** ✅

**DECISIÓN 1**: Cash Session → **Manual** (checkbox en modal)
**DECISIÓN 2**: Turno Operativo → **Manual** (botón "Abrir Turno")
**DECISIÓN 3**: Staff Check-in → **Independiente** (puede entrar sin turno abierto)
**DECISIÓN 4**: Operational Shifts → **Múltiples por día** (Opción B)
**DECISIÓN 5**: Persistencia → **Pendiente de decidir**

---

## 🚧 LO QUE FALTA IMPLEMENTAR

### FASE 1: Core Architecture (Multiple Shifts)

#### 1.1 Actualizar Types

**Archivo**: `src/modules/shift-control/types/index.ts`

```typescript
// AGREGAR:

/**
 * Operational Shift - Business state (NOT employee shift!)
 * Multiple shifts can exist per day (lunch, dinner, etc.)
 */
export interface OperationalShift {
  id: string;
  type: 'morning' | 'lunch' | 'dinner' | 'evening' | 'night' | 'custom';
  name: string; // "Turno Almuerzo", "Turno Cena"

  // Timestamps
  openedAt: string; // ISO timestamp
  closedAt: string | null;

  // Users
  openedBy: string; // user_id
  closedBy: string | null;

  // State
  status: 'active' | 'closed';

  // References to resources
  cashSessionIds: string[]; // Multiple cash sessions possible
  employeeShiftIds: string[]; // Staff shifts during this operational shift

  // Close validation
  closeBlockers: CloseBlocker[];
  canClose: boolean;

  // Summary (populated on close)
  summary?: {
    totalSales: number;
    laborCost: number;
    activeStaffPeak: number;
    mermas: number;
    // ...
  };

  // Metadata
  location_id?: string;
  notes?: string;
}

/**
 * Shift Type Config - Define los tipos de turnos operativos del negocio
 */
export interface ShiftTypeConfig {
  type: 'morning' | 'lunch' | 'dinner' | 'evening' | 'night' | 'custom';
  name: string;
  defaultStartTime: string; // "09:00"
  defaultEndTime: string;   // "15:00"
  enabled: boolean;

  // Capabilities que requieren este tipo de shift
  requiredCapabilities?: string[];
}

// ACTUALIZAR CloseBlocker:
export interface CloseBlocker {
  id: string;
  reason: string; // 'cash_session_open', 'tables_open', etc.
  message: string; // Mensaje para el usuario
  module: string; // 'cash-management', 'tables', etc.
  capability: string; // Feature que causa el blocker
  canOverride: boolean; // ¿Se puede forzar el cierre?
  severity: 'error' | 'warning'; // error = bloqueante, warning = sugerencia
  data?: Record<string, unknown>; // Datos adicionales
}
```

#### 1.2 Actualizar Store

**Archivo**: `src/modules/shift-control/store/shiftStore.ts`

```typescript
// CAMBIAR de single shift a multiple shifts:

interface ShiftState {
  // OLD (single):
  // isOperational: boolean;
  // shiftOpenedAt: string | null;

  // NEW (multiple):
  shifts: OperationalShift[];
  activeShiftId: string | null;

  // Computed getter:
  get currentShift(): OperationalShift | null;
  get isOperational(): boolean; // true if any shift active
  get shiftsToday(): OperationalShift[]; // Today's shifts

  // ... resto del estado (indicators) igual
}

// ACTIONS:
openShift(config: { type, name }): Promise<void>;
closeShift(shiftId: string): Promise<void>;
switchShift(fromId: string, toId: string): Promise<void>; // Cambio de turno
validateCloseConditions(shiftId: string): CloseBlocker[];
```

#### 1.3 API Services

**Archivo nuevo**: `src/modules/shift-control/services/shiftApi.ts`

```typescript
// CRUD operations para operational shifts

export async function createOperationalShift(data: {
  type: ShiftType;
  name: string;
  opened_by: string;
}): Promise<OperationalShift> {
  // POST /api/operational-shifts
}

export async function closeOperationalShift(
  shiftId: string,
  summary: OperationalShift['summary']
): Promise<void> {
  // PATCH /api/operational-shifts/:id/close
}

export async function getTodayShifts(): Promise<OperationalShift[]> {
  // GET /api/operational-shifts?date=today
}

export async function getShiftHistory(
  dateRange: { start: string; end: string }
): Promise<OperationalShift[]> {
  // GET /api/operational-shifts?start=...&end=...
}
```

**Archivo nuevo**: `src/modules/shift-control/services/closeValidation.ts`

```typescript
/**
 * Valida condiciones de cierre según capabilities activas
 */
export async function validateCloseConditions(
  shiftId: string
): Promise<CloseBlocker[]> {
  const blockers: CloseBlocker[] = [];
  const { hasFeature } = useCapabilityStore.getState();

  // 1. Cash Session (si sales_pos activo)
  if (hasFeature('sales_pos')) {
    const openCashSessions = await cashApi.getOpenSessions();
    if (openCashSessions.length > 0) {
      blockers.push({
        id: 'cash_session_open',
        reason: 'cash_session_open',
        message: `${openCashSessions.length} cajas abiertas - Cerrar antes de finalizar turno`,
        module: 'cash-management',
        capability: 'sales_pos',
        canOverride: false,
        severity: 'error',
        data: { count: openCashSessions.length }
      });
    }
  }

  // 2. Open Tables (si onsite_service + sales_pos)
  if (hasFeature('sales_pos_dine_in')) {
    const openTables = await tablesApi.getOpenTables();
    if (openTables.length > 0) {
      blockers.push({
        id: 'tables_open',
        reason: 'tables_open',
        message: `${openTables.length} mesas abiertas`,
        module: 'tables',
        capability: 'sales_pos_dine_in',
        canOverride: false,
        severity: 'error'
      });
    }
  }

  // 3. Active Deliveries (warning, no blocker)
  if (hasFeature('fulfillment_delivery')) {
    const activeDeliveries = await deliveryApi.getActiveDeliveries();
    if (activeDeliveries.length > 0) {
      blockers.push({
        id: 'deliveries_active',
        reason: 'deliveries_active',
        message: `${activeDeliveries.length} deliveries en ruta`,
        module: 'fulfillment',
        capability: 'fulfillment_delivery',
        canOverride: true,
        severity: 'warning' // NO bloqueante
      });
    }
  }

  // 4. Inventory not counted (si physical_products)
  if (hasFeature('inventory_stock_management')) {
    const hasSnapshot = await materialsApi.hasClosingSnapshot(shiftId);
    if (!hasSnapshot) {
      blockers.push({
        id: 'inventory_not_counted',
        reason: 'inventory_not_counted',
        message: 'Inventario no contado',
        module: 'materials',
        capability: 'inventory_stock_management',
        canOverride: false,
        severity: 'error'
      });
    }
  }

  return blockers;
}
```

---

### FASE 2: UI Implementation

#### 2.1 Actualizar ShiftControlWidget

**Archivo**: `src/modules/shift-control/components/ShiftControlWidget.tsx`

Cambios principales:
- Mostrar shift actual (name, type, tiempo transcurrido)
- Dropdown para ver todos los shifts del día
- Botón "Cambiar Turno" (si configurado)
- Modal de apertura con selección de tipo de shift
- Modal de cierre con resumen y blockers

#### 2.2 Modals

**Archivo nuevo**: `src/modules/shift-control/components/OpenShiftModal.tsx`

```typescript
// Modal para abrir turno con:
// - Selector de tipo de shift (lunch, dinner, etc.)
// - Checkbox "Abrir caja con fondo inicial"
// - Input de fondo inicial (si checkbox marcado)
// - Confirmación
```

**Archivo nuevo**: `src/modules/shift-control/components/CloseShiftModal.tsx`

```typescript
// Modal para cerrar turno con:
// - Lista de close blockers (si existen)
// - Resumen del turno:
//   * Ventas totales
//   * Labor cost
//   * Peak staff
//   * Mermas
// - Botón confirmar (disabled si blockers)
```

**Archivo nuevo**: `src/modules/shift-control/components/ShiftHistoryModal.tsx`

```typescript
// Modal para ver historial de turnos:
// - Lista de turnos cerrados del día
// - Resumen de cada uno
// - Link para ver detalles completos
```

---

### FASE 3: Integration & Testing

#### 3.1 Actualizar Manifests de Módulos

**Cash Management**: Agregar validación de cierre
**Tables**: Agregar validación de cierre
**Materials**: Agregar snapshot de cierre
**Scheduling**: Relacionar employee shifts con operational shift

#### 3.2 Database Schema

**Tabla nueva**: `operational_shifts`

```sql
CREATE TABLE operational_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'morning', 'lunch', 'dinner', etc.
  name TEXT NOT NULL,
  opened_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  opened_by UUID REFERENCES auth.users(id),
  closed_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'closed'
  summary JSONB, -- { totalSales, laborCost, etc. }
  location_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_operational_shifts_status ON operational_shifts(status);
CREATE INDEX idx_operational_shifts_date ON operational_shifts(DATE(opened_at));
CREATE INDEX idx_operational_shifts_location ON operational_shifts(location_id);
```

---

## ⚠️ PREOCUPACIONES DEL USUARIO A RESOLVER

### 1. **Capabilities Mapping**

**INVESTIGAR**:
- ¿El módulo Scheduling tiene correctamente mapeadas sus features?
- ¿Scheduling funciona con el sistema de capabilities?
- ¿Qué features deberían activar qué funcionalidades de scheduling?

**ARCHIVO A REVISAR**:
- `src/modules/scheduling/manifest.tsx` → `requiredFeatures` y `optionalFeatures`
- `src/config/FeatureActivationEngine.ts` → ¿Cómo se activan features de scheduling?

### 2. **Cross-Module Interaction**

**ASEGURAR**:
- ShiftControl NO duplica lógica de Scheduling
- Comunicación clara vía EventBus
- Validaciones de cierre consumen APIs de otros módulos, no reimplementan

### 3. **Time Blocks Architecture**

**INVESTIGAR**:
- ¿Cómo se implementó el sistema de bloques de horario?
- ¿Dónde vive esta lógica?
- ¿Es el mismo sistema que `BusinessHoursConfig`?
- ¿Hay overlapping de horarios? ¿Cómo se maneja?

**ARCHIVOS A REVISAR**:
- `shared/calendar/types/DateTimeTypes.ts`
- `src/modules/scheduling/types/calendar.ts`
- `src/modules/scheduling/components/BusinessHoursConfig.tsx`

---

## 📝 PROMPT PARA CLAUDE (PRÓXIMA SESIÓN)

```
Hola! Necesito continuar con la implementación del módulo ShiftControl.

CONTEXTO:
Hemos investigado y diseñado la arquitectura completa del módulo ShiftControl.
El módulo está parcialmente implementado y decidimos usar arquitectura de
"Multiple Operational Shifts" (Opción B).

ESTADO ACTUAL:
✅ Investigación completa documentada en docs/shift-control/
✅ Módulo básico implementado (types, store, handlers, widget)
✅ Widget optimizado sin performance issues
✅ Decisiones clave tomadas (manual open, multiple shifts, etc.)

TAREAS PENDIENTES:
1. Actualizar types para soportar múltiples operational shifts
2. Refactorizar store de single shift a multiple shifts array
3. Implementar servicios API para CRUD de operational shifts
4. Implementar closeValidation con blockers dinámicos por capability
5. Actualizar UI del widget para mostrar múltiples shifts
6. Crear modales (OpenShiftModal, CloseShiftModal, ShiftHistoryModal)

PREOCUPACIONES:
- Verificar que Scheduling module esté correctamente mapeado a capabilities
- No duplicar lógica de Scheduling (employee shifts)
- Entender sistema de time blocks y su relación con operational shifts
- Asegurar cross-module interaction correcta

DOCUMENTACIÓN:
Lee estos documentos PRIMERO:
1. docs/shift-control/CONTINUATION_PROMPT.md (este archivo)
2. docs/shift-control/RESEARCH_OPERATIONAL_VS_EMPLOYEE_SHIFTS.md
3. docs/shift-control/SHIFT_LIFECYCLE_BY_CAPABILITY.md

EMPECEMOS POR:
Quiero empezar con FASE 1.1 - Actualizar types para múltiples operational shifts.
Muéstrame el código actualizado para src/modules/shift-control/types/index.ts
```

---

## 📚 DOCUMENTOS CLAVE A REVISAR

**ANTES de continuar, leer en orden:**

1. `CONTINUATION_PROMPT.md` (este archivo) - Overview completo
2. `RESEARCH_OPERATIONAL_VS_EMPLOYEE_SHIFTS.md` - Distinción crítica
3. `SHIFT_LIFECYCLE_BY_CAPABILITY.md` - Behaviors por capability
4. `SHIFT_CONTROL_EXECUTION_PLAN.md` - Plan original (desactualizado pero útil)

**Módulos existentes a entender:**

5. `src/modules/scheduling/manifest.tsx` - Capabilities y features
6. `src/modules/scheduling/types/schedulingTypes.ts` - Employee shifts
7. `src/modules/scheduling/components/BusinessHoursConfig.tsx` - Horarios
8. `shared/calendar/types/DateTimeTypes.ts` - Time blocks system

---

## 🎯 OBJETIVOS DE LA PRÓXIMA SESIÓN

**Prioritarios:**
1. ✅ Implementar types de múltiples operational shifts
2. ✅ Refactorizar store para array de shifts
3. ✅ Implementar closeValidation con capabilities

**Secundarios:**
4. Investigar capabilities mapping en Scheduling
5. Implementar servicios API
6. Actualizar UI del widget

**Para el futuro:**
7. Modales (open/close/history)
8. Testing cross-module
9. Database migration
10. Documentación de uso

---

## ✅ CHECKLIST DE CONTINUACIÓN

Antes de empezar a codear, verificar:

- [ ] Leí `RESEARCH_OPERATIONAL_VS_EMPLOYEE_SHIFTS.md`
- [ ] Entiendo diferencia entre operational shift vs employee shift
- [ ] Revisé el estado actual del código en `src/modules/shift-control/`
- [ ] Entiendo que Scheduling YA maneja employee shifts (no duplicar)
- [ ] Revisé las decisiones tomadas (Manual, Multiple Shifts, etc.)
- [ ] Leí concerns sobre capabilities mapping

---

**Estado**: 📋 READY TO CONTINUE
**Autor**: Prepared by Claude Code
**Última actualización**: 2025-12-04
**Token budget usado**: ~114k / 200k
