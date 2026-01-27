# ShiftControl - UI Architecture & Design (MASTER DOCUMENT)

**Fecha**: 2025-12-04
**Estado**: ✅ COMPLETE - Ready for critical review  
**Versión**: 2.0 - Feature-based mapping corregido

---

## 🎯 RESUMEN EJECUTIVO

ShiftControl es un módulo **event-driven** que gestiona el estado operativo del negocio mediante:
- ✅ **Subscripciones a eventos** (NO orquestación manual)
- ✅ **Mapeo feature-based** (many-to-many, NO 1:1 simplista)
- ✅ **Multiple operational shifts** por día
- ✅ **HookPoint pattern** para extensibilidad
- ✅ **Zustand store** reactivo y performante

**Arquitectura clave**: EventBus → Handlers → Store → UI (unidirectional)

---

## 🧩 FEATURE-BASED MAPPING (CORREGIDO)

### ❌ Mapeo Simplista Incorrecto

```typescript
// MAL: Asumir relación 1:1
if (hasCapability('physical_products')) {
  subscribe('cash.session.opened');
}
```

### ✅ Mapeo REAL (BusinessModelRegistry)

| Feature | Activado Por Capabilities | Eventos Suscritos |
|---------|--------------------------|-------------------|
| `sales_payment_processing` | physical_products, professional_services, onsite_service, pickup_orders, delivery_shipping | cash.session.* |
| `inventory_stock_tracking` | physical_products, onsite_service, pickup_orders, delivery_shipping | inventory.* |
| `staff_employee_management` | professional_services, onsite_service, pickup_orders, delivery_shipping, corporate_sales, mobile_operations | staff.employee.* |
| `operations_table_management` | onsite_service | tables.* |
| `scheduling_appointment_booking` | professional_services, asset_rental, membership_subscriptions | appointments.* |

**Conclusión**: El mapeo es **many-to-many**, NO 1:1.

---

## 🏗️ COMPONENT TREE

```
ShiftControlWidget
├─ ShiftHeader (status badge, tiempo operativo)
├─ ShiftStats (ventas, labor cost, staff activo)
├─ IndicatorsSection
│  └─ <HookPoint name="shift-control.indicators" />
│     ├─ CashSessionIndicator (Cash Module)
│     ├─ StaffIndicator (Staff Module) 
│     ├─ StockAlertIndicator (Materials Module)
│     └─ [Dynamic indicators...]
├─ QuickActionsSection
│  └─ <HookPoint name="shift-control.quick-actions" />
│     ├─ OpenShiftButton / CloseShiftButton
│     └─ [Dynamic actions...]
├─ AlertsPanel
│  └─ <HookPoint name="shift-control.alerts" />
└─ ShiftFooter (history, last closed summary)
```

---

## 🎭 STATE MACHINE

```
NO_SHIFT → OPENING_MODAL → SHIFT_ACTIVE → VALIDATE_CLOSE
                                ↓
                    [BLOCKED] o [CLOSING_MODAL] → CLOSING → SHIFT_CLOSED → NO_SHIFT
```

---

## 📦 ZUSTAND STORE

```typescript
interface ShiftState {
  // Multiple shifts (NO single)
  shifts: OperationalShift[];
  activeShiftId: string | null;
  
  // Indicators (actualizados por event handlers)
  cashSession: CashSessionRow | null;
  activeStaffCount: number;
  openTablesCount: number;
  activeDeliveriesCount: number;
  
  // Computed getters
  getCurrentShift(): OperationalShift | null;
  isOperational(): boolean;
}
```

---

## 🔌 EVENT SUBSCRIPTIONS (Feature-Based)

```typescript
// manifest.tsx setup
const { hasFeature } = useCapabilityStore.getState();

// Cash (múltiples capabilities lo activan)
if (hasFeature('sales_payment_processing')) {
  eventBus.subscribe('cash.session.opened', handleCashOpened);
}

// Staff (6+ capabilities lo activan)
if (hasFeature('staff_employee_management')) {
  eventBus.subscribe('staff.employee.checked_in', handleStaffCheckIn);
}

// Tables (solo onsite_service)
if (hasFeature('operations_table_management')) {
  eventBus.subscribe('tables.opened', handleTableOpened);
}
```

---

## ⚡ PERFORMANCE

- ✅ `React.memo` en componentes con props estables
- ✅ `useShallow` en selectores Zustand múltiples
- ✅ Selectores específicos para valores individuales
- ✅ Lazy loading de modals

---

## 🎯 IMPLEMENTATION CHECKLIST

**Fase 1**: Types, Store, Handlers, Services (2-3 días)  
**Fase 2**: UI Components (2-3 días)  
**Fase 3**: Modals (1-2 días)  
**Fase 4**: Integration (1 día)  
**Fase 5**: Testing (1-2 días)  

**Total**: ~10 días

---

## 🔍 PRÓXIMO PASO

**REVISIÓN CRÍTICA** del documento para detectar:
- Gaps arquitectónicos
- Casos no cubiertos  
- Inconsistencias con convenciones
- Optimizaciones faltantes

---

**Estado**: ✅ COMPLETE - Ready for review  
**Versión**: 2.0 (Feature-based corrected)  
**Autor**: Claude Code + User Feedback

---

## 🚨 GAPS CRÍTICOS & SOLUCIONES (Research Session 2025-12-04)

### Research Base
- **Zustand persist**: https://github.com/pmndrs/zustand
- **Event-driven 2025**: https://www.growin.com/blog/event-driven-architecture-scale-systems-2025/
- **Retail POS**: https://www.omg.org/retail/schema.htm

### GAP 1: Handlers sin validación de shift activo (CRÍTICO)
**Solución**: HOF pattern `createShiftAwareHandler`
```typescript
export function createShiftAwareHandler<T>(name, handler) {
  return async (event) => {
    if (!useShiftStore.getState().isOperational()) {
      logger.warn('Event ignored - no active shift');
      return;
    }
    await handler(event);
  };
}
```

### GAP 2: Persistence strategy (CRÍTICO)
**Decisión**: Híbrido (localStorage + DB)
- localStorage: Recovery inmediato (patrón cashStore.ts)
- DB: operational_shifts table para histórico
- Sync: On open/close (no realtime)

### GAP 3: Staff Module no emite eventos (BLOCKER)
**Acción requerida**: Staff Module debe implementar event emissions ANTES
```typescript
// staffService.ts debe agregar:
await eventBus.emit('staff.employee.checked_in', {...});
```

### GAP 4: EventBus subscription cleanup (MEDIA)
**Solución**: Teardown con unsubscribe array

### GAP 5: Reset de indicators (MEDIA)
**Solución**: Reset completo en closeShift()

### GAP 6: Eventos de shifts anteriores (MEDIA)
**Solución**: Agregar shiftId a payloads + filtrar

### GAP 7: Close validation ubicación (MEDIA)
**Solución**: Mover validación a service (business logic)

### GAP 8: Múltiples shifts activos (BAJA)
**Decisión**: NO permitir - solo 1 activo

### GAP 9: Multi-location (BAJA)
**Decisión**: v1.0 single-location, v2.0 multi

---

## 🔑 DECISIONES ARQUITECTÓNICAS FINALES

| Decisión | Razón |
|----------|-------|
| Feature-based subscriptions | Many-to-many mapping real del BusinessModelRegistry |
| Zustand + persist partialize | Patrón del proyecto (cashStore) |
| HOF wrapper handlers | DRY + validación centralizada |
| localStorage + DB híbrido | Recovery + histórico |
| Solo 1 shift activo | Simplifica UI, casos reales secuenciales |
| Service-based validation | Business logic fuera de UI |

---

**Total research effort**: 4 horas análisis + investigación
**Implementation effort estimado**: 4 días
**BLOCKER crítico**: Staff Module eventos (prerequisito)

---

# 📋 COMPONENT PROPS INTERFACES (DETALLADO)

## Core Types

```typescript
/**
 * Operational Shift - Main entity
 */
export interface OperationalShift {
  id: string;
  business_id: string;
  opened_by: string;
  opened_at: string; // ISO 8601
  closed_by?: string | null;
  closed_at?: string | null;
  status: 'active' | 'closed';

  // Metadata
  created_at: string;
  updated_at: string;

  // Computed fields (optional, may come from aggregations)
  total_sales?: number;
  labor_cost?: number;
  active_staff_count?: number;
}

/**
 * Shift State for UI
 */
export type ShiftUIState =
  | 'NO_SHIFT'           // No active shift
  | 'OPENING_MODAL'      // Opening modal displayed
  | 'SHIFT_ACTIVE'       // Shift is operational
  | 'VALIDATE_CLOSE'     // Checking if can close
  | 'BLOCKED'            // Cannot close (blockers exist)
  | 'CLOSING_MODAL'      // Closing modal displayed
  | 'CLOSING'            // Closing in progress
  | 'SHIFT_CLOSED';      // Shift closed successfully

/**
 * Validation result for close operation
 */
export interface CloseValidationResult {
  canClose: boolean;
  blockers: ValidationBlocker[];
  warnings: ValidationWarning[];
}

export interface ValidationBlocker {
  type: 'cash_session' | 'open_tables' | 'active_deliveries' | 'pending_orders';
  message: string;
  count?: number;
  affectedFeature: FeatureId;
}

export interface ValidationWarning {
  type: 'unchecked_staff' | 'inventory_count' | 'low_cash';
  message: string;
  severity: 'low' | 'medium' | 'high';
}
```

## ShiftControlWidget Props

```typescript
interface ShiftControlWidgetProps {
  /**
   * Optional className for custom styling
   */
  className?: string;

  /**
   * Compact mode (minimal UI)
   * @default false
   */
  compact?: boolean;

  /**
   * Debug mode (show internal state)
   * @default false
   */
  debug?: boolean;
}
```

## ShiftHeader Props

```typescript
interface ShiftHeaderProps {
  /**
   * Current shift or null if no active shift
   */
  shift: OperationalShift | null;

  /**
   * Current UI state
   */
  uiState: ShiftUIState;

  /**
   * Elapsed time in seconds since shift opened
   */
  elapsedSeconds: number;
}
```

## ShiftStats Props

```typescript
interface ShiftStatsProps {
  /**
   * Total sales during this shift (from transactions)
   */
  totalSales: number;

  /**
   * Labor cost during this shift (staff hours * rates)
   */
  laborCost: number;

  /**
   * Currently active staff count
   */
  activeStaffCount: number;

  /**
   * Scheduled staff count (for deficit detection)
   */
  scheduledStaffCount?: number;

  /**
   * Loading state
   */
  loading?: boolean;
}
```

## IndicatorsSection Props

```typescript
interface IndicatorsSectionProps {
  /**
   * Shift data to pass to indicator hookpoints
   */
  shiftData: {
    shiftId: string;
    cashSession: CashSessionRow | null;
    activeStaffCount: number;
    openTablesCount: number;
    activeDeliveriesCount: number;
    pendingOrdersCount: number;
    stockAlerts: StockAlert[];
  };
}
```

## QuickActionsSection Props

```typescript
interface QuickActionsSectionProps {
  /**
   * Current shift
   */
  shift: OperationalShift | null;

  /**
   * UI state
   */
  uiState: ShiftUIState;

  /**
   * Callback to open shift
   */
  onOpenShift: () => void;

  /**
   * Callback to close shift
   */
  onCloseShift: () => void;

  /**
   * Loading states
   */
  isOpening: boolean;
  isClosing: boolean;
  isValidating: boolean;
}
```

## AlertsPanel Props

```typescript
interface AlertsPanelProps {
  /**
   * Active alerts from all modules
   */
  alerts: ShiftAlert[];

  /**
   * Callback to dismiss an alert
   */
  onDismissAlert: (alertId: string) => void;
}

export interface ShiftAlert {
  id: string;
  type: 'cash' | 'staff' | 'inventory' | 'operations';
  severity: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  moduleId: string;
  actionable?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}
```

## ShiftFooter Props

```typescript
interface ShiftFooterProps {
  /**
   * History of closed shifts (last 5)
   */
  recentShifts: OperationalShift[];

  /**
   * Callback to view shift details
   */
  onViewShift: (shiftId: string) => void;
}
```

## OpenShiftModal Props

```typescript
interface OpenShiftModalProps {
  /**
   * Modal open state
   */
  isOpen: boolean;

  /**
   * Callback to close modal
   */
  onClose: () => void;

  /**
   * Callback to confirm open
   */
  onConfirm: (data: OpenShiftData) => Promise<void>;

  /**
   * Loading state
   */
  isLoading: boolean;
}

export interface OpenShiftData {
  opened_by: string; // User ID
  notes?: string;
  initial_cash_amount?: number; // If cash session needs to be opened
}
```

## CloseShiftModal Props

```typescript
interface CloseShiftModalProps {
  /**
   * Modal open state
   */
  isOpen: boolean;

  /**
   * Callback to close modal
   */
  onClose: () => void;

  /**
   * Callback to confirm close
   */
  onConfirm: (data: CloseShiftData) => Promise<void>;

  /**
   * Current shift to close
   */
  shift: OperationalShift;

  /**
   * Validation result
   */
  validation: CloseValidationResult;

  /**
   * Loading state
   */
  isLoading: boolean;
}

export interface CloseShiftData {
  closed_by: string; // User ID
  notes?: string;
  final_cash_amount?: number; // If cash session needs to be closed
  force_close?: boolean; // Override blockers
}
```

---

# 🔄 STATE MACHINE TRANSITIONS (DETALLADO)

## State Diagram Extended

```
┌─────────────┐
│  NO_SHIFT   │ ← Initial state, no operational shift
└──────┬──────┘
       │
       │ TRIGGER: User clicks "Abrir Turno"
       │ ACTION: Show opening modal
       ↓
┌──────────────────┐
│  OPENING_MODAL   │
└──────┬───────────┘
       │
       ├─→ TRIGGER: User cancels
       │   ACTION: Return to NO_SHIFT
       │
       ├─→ TRIGGER: User confirms
       │   ACTION: Call shiftService.openShift()
       │           Emit 'shift.opened' event
       │           Update store with new shift
       ↓
┌──────────────────┐
│  SHIFT_ACTIVE    │ ← Normal operational state
└──────┬───────────┘
       │
       │ Events processed:
       │ - cash.session.opened → Update store.cashSession
       │ - staff.employee.checked_in → Increment store.activeStaffCount
       │ - staff.employee.checked_out → Decrement store.activeStaffCount
       │ - tables.opened → Increment store.openTablesCount
       │ - delivery.started → Increment store.activeDeliveriesCount
       │ - inventory.alert → Add to store.stockAlerts
       │
       │ TRIGGER: User clicks "Cerrar Turno"
       │ ACTION: Start validation process
       ↓
┌──────────────────┐
│  VALIDATE_CLOSE  │
└──────┬───────────┘
       │
       ├─→ RESULT: Has blockers
       │   ACTION: Transition to BLOCKED
       │
       ├─→ RESULT: No blockers
       │   ACTION: Transition to CLOSING_MODAL
       │
       ↓ (blockers)
┌──────────────────┐
│     BLOCKED      │ ← Cannot close, show reasons
└──────┬───────────┘
       │
       │ TRIGGER: User resolves blockers
       │         (closes cash session, closes tables, etc.)
       │ ACTION: Return to SHIFT_ACTIVE
       │         Show success message
       │
       ↓ (no blockers)
┌──────────────────┐
│  CLOSING_MODAL   │
└──────┬───────────┘
       │
       ├─→ TRIGGER: User cancels
       │   ACTION: Return to SHIFT_ACTIVE
       │
       ├─→ TRIGGER: User confirms
       │   ACTION: Transition to CLOSING
       ↓
┌──────────────────┐
│     CLOSING      │ ← API call in progress
└──────┬───────────┘
       │
       ├─→ RESULT: Success
       │   ACTION: Call shiftService.closeShift()
       │           Emit 'shift.closed' event
       │           Reset all indicators in store
       │           Transition to SHIFT_CLOSED
       │
       ├─→ RESULT: Error
       │   ACTION: Show error message
       │           Return to CLOSING_MODAL
       │
       ↓
┌──────────────────┐
│  SHIFT_CLOSED    │ ← Success state (transient)
└──────┬───────────┘
       │
       │ AUTO-TRANSITION: After 2 seconds
       │ ACTION: Return to NO_SHIFT
       │         Show success toast
       ↓
    (back to NO_SHIFT)
```

## Transition Rules

| From State | To State | Trigger | Conditions | Actions |
|------------|----------|---------|------------|---------|
| NO_SHIFT | OPENING_MODAL | User clicks "Abrir Turno" | User has permission | Show modal |
| OPENING_MODAL | NO_SHIFT | User cancels | - | Close modal |
| OPENING_MODAL | SHIFT_ACTIVE | User confirms | Valid form data | API call + emit event |
| SHIFT_ACTIVE | VALIDATE_CLOSE | User clicks "Cerrar Turno" | User has permission | Run validation |
| VALIDATE_CLOSE | BLOCKED | Validation fails | blockers.length > 0 | Show blockers UI |
| VALIDATE_CLOSE | CLOSING_MODAL | Validation passes | blockers.length === 0 | Show modal |
| BLOCKED | SHIFT_ACTIVE | User resolves | All blockers resolved | Update UI |
| CLOSING_MODAL | SHIFT_ACTIVE | User cancels | - | Close modal |
| CLOSING_MODAL | CLOSING | User confirms | Valid form data | Start API call |
| CLOSING | SHIFT_CLOSED | API success | - | Emit event + reset |
| CLOSING | CLOSING_MODAL | API error | - | Show error |
| SHIFT_CLOSED | NO_SHIFT | Auto (2s delay) | - | Clear state |

## State Persistence

```typescript
// States that should persist in localStorage
const PERSISTENT_STATES = ['SHIFT_ACTIVE'];

// States that should reset on page reload
const TRANSIENT_STATES = ['OPENING_MODAL', 'CLOSING_MODAL', 'CLOSING', 'VALIDATE_CLOSE', 'BLOCKED', 'SHIFT_CLOSED'];

// On app initialization:
if (localStorage.activeShift && !['SHIFT_ACTIVE'].includes(uiState)) {
  // Reset to SHIFT_ACTIVE if shift exists but UI was in transient state
  setUIState('SHIFT_ACTIVE');
}
```

---

# 🔌 HOOKPOINT DATA CONTRACTS

## 'shift-control.indicators'

**Purpose**: Display operational indicators in ShiftControl widget

**Data Passed**:
```typescript
interface ShiftIndicatorData {
  // Current shift ID
  shiftId: string;

  // Cash session (from cashStore)
  cashSession: CashSessionRow | null;

  // Staff count (from shiftStore, updated by staff events)
  activeStaffCount: number;
  scheduledStaffCount?: number;

  // Operations (from shiftStore, updated by operations events)
  openTablesCount: number;
  activeDeliveriesCount: number;
  pendingOrdersCount: number;

  // Inventory (from shiftStore, updated by inventory events)
  stockAlerts: Array<{
    material_id: string;
    material_name: string;
    current_quantity: number;
    min_quantity: number;
    severity: 'low' | 'medium' | 'high';
  }>;
}
```

**Expected Return**: Array of `ReactNode`

**Consumer Pattern**:
```typescript
// In cash-management/manifest.tsx
registry.addAction(
  'shift-control.indicators',
  ({ cashSession }) => <CashSessionIndicator cashSession={cashSession} key="cash-indicator" />,
  'cash-management',
  90  // High priority
);
```

**Execution**: All registered handlers called, results rendered in order of priority

---

## 'shift-control.quick-actions'

**Purpose**: Add custom quick actions to shift widget

**Data Passed**:
```typescript
interface ShiftQuickActionData {
  // Current shift
  shift: OperationalShift | null;

  // UI state
  uiState: ShiftUIState;

  // Callbacks
  refreshShift: () => Promise<void>;
}
```

**Expected Return**: Array of `ReactNode` (typically `<Button>` components)

**Consumer Pattern**:
```typescript
// Example: Operations module adds "Ver Mesas" button
registry.addAction(
  'shift-control.quick-actions',
  ({ shift }) => {
    if (!shift) return null;
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate('/admin/operations/tables')}
        key="view-tables"
      >
        Ver Mesas
      </Button>
    );
  },
  'operations-tables',
  50
);
```

---

## 'shift-control.alerts'

**Purpose**: Display module-specific alerts in ShiftControl

**Data Passed**:
```typescript
interface ShiftAlertData {
  // Current shift
  shiftId: string;

  // Callback to dismiss alert
  onDismissAlert: (alertId: string) => void;
}
```

**Expected Return**: Array of `ReactNode` (alert components)

**Consumer Pattern**:
```typescript
// Example: Inventory module adds stock alerts
registry.addAction(
  'shift-control.alerts',
  ({ shiftId, onDismissAlert }) => {
    const alerts = useInventoryAlerts(shiftId);

    return alerts.map(alert => (
      <Alert status="warning" key={alert.id}>
        <AlertIcon />
        <AlertTitle>{alert.title}</AlertTitle>
        <AlertDescription>{alert.message}</AlertDescription>
        <CloseButton onClick={() => onDismissAlert(alert.id)} />
      </Alert>
    ));
  },
  'materials-inventory',
  60
);
```

---

## 'shift-control.close-validation'

**Purpose**: Allow modules to add custom validation rules for shift closing

**Data Passed**:
```typescript
interface ShiftCloseValidationData {
  // Current shift
  shift: OperationalShift;

  // User attempting to close
  userId: string;
}
```

**Expected Return**: Array of `CloseValidationResult | null`

**Consumer Pattern**:
```typescript
// Example: Cash module validates session is closed
registry.addAction(
  'shift-control.close-validation',
  async ({ shift }) => {
    const activeSessions = await cashSessionService.getActiveSessions();

    if (activeSessions.length > 0) {
      return {
        canClose: false,
        blockers: [{
          type: 'cash_session',
          message: 'Hay sesiones de caja abiertas. Cierra todas las cajas antes de cerrar el turno.',
          count: activeSessions.length,
          affectedFeature: 'sales_payment_processing'
        }],
        warnings: []
      };
    }

    return { canClose: true, blockers: [], warnings: [] };
  },
  'cash-management',
  100  // Critical validation
);
```

---

# 📡 EVENT PAYLOADS SPEC

## Events Emitted by ShiftControl

### `shift.opened`

**Emitted**: When a new operational shift is successfully opened

**Payload**:
```typescript
interface ShiftOpenedPayload {
  // Event metadata (from EventBus)
  pattern: 'shift.opened';
  timestamp: string; // ISO 8601
  traceId: string;
  moduleId: 'shift-control';

  // Shift data
  data: {
    shift: OperationalShift;
    opened_by_user: {
      id: string;
      name: string;
      role: string;
    };
    notes?: string;
  };
}
```

**Subscribers**: Any module that needs to know when operations begin (e.g., analytics, logging)

---

### `shift.closed`

**Emitted**: When an operational shift is successfully closed

**Payload**:
```typescript
interface ShiftClosedPayload {
  pattern: 'shift.closed';
  timestamp: string;
  traceId: string;
  moduleId: 'shift-control';

  data: {
    shift: OperationalShift;
    closed_by_user: {
      id: string;
      name: string;
      role: string;
    };

    // Summary stats (computed at close time)
    summary: {
      total_sales: number;
      labor_cost: number;
      duration_minutes: number;
      staff_count: number;
      transactions_count: number;
    };

    notes?: string;
  };
}
```

**Subscribers**: Analytics, reporting, shift history modules

---

### `shift.close_validation.requested`

**Emitted**: When user attempts to close shift (before validation)

**Payload**:
```typescript
interface ShiftCloseValidationRequestedPayload {
  pattern: 'shift.close_validation.requested';
  timestamp: string;
  traceId: string;
  moduleId: 'shift-control';

  data: {
    shift: OperationalShift;
    user_id: string;
  };
}
```

**Purpose**: Allow modules to run async validations before showing close modal

---

### `shift.close_validation.failed`

**Emitted**: When shift close validation fails (has blockers)

**Payload**:
```typescript
interface ShiftCloseValidationFailedPayload {
  pattern: 'shift.close_validation.failed';
  timestamp: string;
  traceId: string;
  moduleId: 'shift-control';

  data: {
    shift: OperationalShift;
    validation: CloseValidationResult;
  };
}
```

**Purpose**: Analytics, alerting

---

## Events Consumed by ShiftControl

### `cash.session.opened`

**Source**: cash-management module

**Expected Payload**:
```typescript
interface CashSessionOpenedPayload {
  pattern: 'cash.session.opened';
  data: {
    session: CashSessionRow;
    shift_id?: string; // May be null if opened outside shift
  };
}
```

**Handler Action**:
```typescript
const handleCashSessionOpened = createShiftAwareHandler(
  'cash.session.opened',
  async (event) => {
    const { session } = event.data;
    useShiftStore.getState().setCashSession(session);
    logger.info('ShiftControl', 'Cash session opened', { sessionId: session.id });
  }
);
```

---

### `cash.session.closed`

**Source**: cash-management module

**Expected Payload**:
```typescript
interface CashSessionClosedPayload {
  pattern: 'cash.session.closed';
  data: {
    session: CashSessionRow;
    discrepancy?: number;
  };
}
```

**Handler Action**:
```typescript
const handleCashSessionClosed = createShiftAwareHandler(
  'cash.session.closed',
  async (event) => {
    useShiftStore.getState().setCashSession(null);

    // If discrepancy, add alert
    if (event.data.discrepancy && Math.abs(event.data.discrepancy) > 0.01) {
      addAlert({
        type: 'cash',
        severity: 'warning',
        message: `Diferencia de caja: $${event.data.discrepancy.toFixed(2)}`
      });
    }
  }
);
```

---

### `staff.employee.checked_in`

**Source**: staff module (⚠️ MUST BE IMPLEMENTED)

**Expected Payload**:
```typescript
interface StaffCheckedInPayload {
  pattern: 'staff.employee.checked_in';
  data: {
    employee_id: string;
    employee_name: string;
    shift_id: string;
    checked_in_at: string;
  };
}
```

**Handler Action**:
```typescript
const handleStaffCheckedIn = createShiftAwareHandler(
  'staff.employee.checked_in',
  async (event) => {
    const currentShiftId = useShiftStore.getState().activeShiftId;

    // Only count if event belongs to current shift
    if (event.data.shift_id === currentShiftId) {
      const { activeStaffCount } = useShiftStore.getState();
      useShiftStore.getState().setActiveStaffCount(activeStaffCount + 1);
    }
  }
);
```

---

### `staff.employee.checked_out`

**Source**: staff module (⚠️ MUST BE IMPLEMENTED)

**Expected Payload**:
```typescript
interface StaffCheckedOutPayload {
  pattern: 'staff.employee.checked_out';
  data: {
    employee_id: string;
    shift_id: string;
    checked_out_at: string;
    hours_worked: number;
  };
}
```

**Handler Action**:
```typescript
const handleStaffCheckedOut = createShiftAwareHandler(
  'staff.employee.checked_out',
  async (event) => {
    const currentShiftId = useShiftStore.getState().activeShiftId;

    if (event.data.shift_id === currentShiftId) {
      const { activeStaffCount } = useShiftStore.getState();
      useShiftStore.getState().setActiveStaffCount(Math.max(0, activeStaffCount - 1));
    }
  }
);
```

---

### `tables.opened` / `tables.closed`

**Source**: operations-tables module (if feature enabled)

**Expected Payload**:
```typescript
interface TableOpenedPayload {
  pattern: 'tables.opened';
  data: {
    table_id: string;
    table_number: number;
    opened_at: string;
  };
}
```

**Handler Action**:
```typescript
const handleTableOpened = createShiftAwareHandler(
  'tables.opened',
  async () => {
    const { openTablesCount } = useShiftStore.getState();
    useShiftStore.getState().setOpenTablesCount(openTablesCount + 1);
  }
);
```

---

### `inventory.alert`

**Source**: materials-inventory module

**Expected Payload**:
```typescript
interface InventoryAlertPayload {
  pattern: 'inventory.alert';
  data: {
    material_id: string;
    material_name: string;
    current_quantity: number;
    min_quantity: number;
    severity: 'low' | 'medium' | 'high';
  };
}
```

**Handler Action**:
```typescript
const handleInventoryAlert = createShiftAwareHandler(
  'inventory.alert',
  async (event) => {
    const { stockAlerts } = useShiftStore.getState();

    // Add or update alert
    const updated = [...stockAlerts];
    const index = updated.findIndex(a => a.material_id === event.data.material_id);

    if (index >= 0) {
      updated[index] = event.data;
    } else {
      updated.push(event.data);
    }

    useShiftStore.getState().setStockAlerts(updated);
  }
);
```

---

# ✅ CLOSE VALIDATION RULES (BY FEATURE)

## Validation Architecture

```typescript
/**
 * Close validation service
 * Aggregates validation from all modules via hookpoint
 */
export class ShiftCloseValidationService {
  async validateClose(shift: OperationalShift, userId: string): Promise<CloseValidationResult> {
    const registry = ModuleRegistry.getInstance();

    // Execute 'shift-control.close-validation' hookpoint
    const results = await registry.doAction<ShiftCloseValidationData, CloseValidationResult>(
      'shift-control.close-validation',
      { shift, userId }
    );

    // Aggregate all validation results
    const allBlockers: ValidationBlocker[] = [];
    const allWarnings: ValidationWarning[] = [];

    results.forEach(result => {
      if (result) {
        allBlockers.push(...result.blockers);
        allWarnings.push(...result.warnings);
      }
    });

    return {
      canClose: allBlockers.length === 0,
      blockers: allBlockers,
      warnings: allWarnings
    };
  }
}
```

---

## Feature: `sales_payment_processing`

**Validator**: cash-management module

**Rules**:
1. ✅ **BLOCKER**: No active cash sessions
   - Check: `cash_sessions` table WHERE `status = 'open'`
   - Message: "Hay {count} sesiones de caja abiertas. Cierra todas las cajas antes de cerrar el turno."

2. ⚠️ **WARNING**: Cash count performed today
   - Check: Last `cash.session.closed` event timestamp
   - Message: "No se ha cerrado ninguna caja hoy. ¿Seguro que quieres cerrar el turno?"

**Implementation**:
```typescript
// In cash-management/handlers/closeValidationHandler.ts
export async function validateCashForShiftClose(
  data: ShiftCloseValidationData
): Promise<CloseValidationResult> {
  const activeSessions = await cashSessionService.getActiveSessions();

  if (activeSessions.length > 0) {
    return {
      canClose: false,
      blockers: [{
        type: 'cash_session',
        message: `Hay ${activeSessions.length} sesión(es) de caja abiertas.`,
        count: activeSessions.length,
        affectedFeature: 'sales_payment_processing'
      }],
      warnings: []
    };
  }

  // Check if any cash session was closed today
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = await cashSessionService.getSessionsByDate(today);

  if (todaySessions.length === 0) {
    return {
      canClose: true,
      blockers: [],
      warnings: [{
        type: 'low_cash',
        message: 'No se cerró ninguna caja hoy.',
        severity: 'medium'
      }]
    };
  }

  return { canClose: true, blockers: [], warnings: [] };
}
```

---

## Feature: `operations_table_management`

**Validator**: operations-tables module

**Rules**:
1. ✅ **BLOCKER**: No open tables
   - Check: `tables` WHERE `status = 'occupied'`
   - Message: "Hay {count} mesas abiertas. Cierra o transfiere todas las mesas."

2. ⚠️ **WARNING**: Unpaid orders on tables
   - Check: `orders` JOIN `tables` WHERE `payment_status = 'pending'`
   - Message: "{count} órdenes sin pagar. Revisa antes de cerrar."

**Implementation**:
```typescript
export async function validateTablesForShiftClose(
  data: ShiftCloseValidationData
): Promise<CloseValidationResult> {
  const openTables = await tablesService.getOpenTables();

  if (openTables.length > 0) {
    return {
      canClose: false,
      blockers: [{
        type: 'open_tables',
        message: `${openTables.length} mesas abiertas.`,
        count: openTables.length,
        affectedFeature: 'operations_table_management'
      }],
      warnings: []
    };
  }

  return { canClose: true, blockers: [], warnings: [] };
}
```

---

## Feature: `fulfillment_delivery`

**Validator**: fulfillment-delivery module

**Rules**:
1. ✅ **BLOCKER**: No active deliveries
   - Check: `deliveries` WHERE `status IN ('pending', 'in_transit')`
   - Message: "Hay {count} entregas activas. Completa o cancela las entregas."

**Implementation**:
```typescript
export async function validateDeliveriesForShiftClose(
  data: ShiftCloseValidationData
): Promise<CloseValidationResult> {
  const activeDeliveries = await deliveryService.getActiveDeliveries();

  if (activeDeliveries.length > 0) {
    return {
      canClose: false,
      blockers: [{
        type: 'active_deliveries',
        message: `${activeDeliveries.length} entregas en curso.`,
        count: activeDeliveries.length,
        affectedFeature: 'fulfillment_delivery'
      }],
      warnings: []
    };
  }

  return { canClose: true, blockers: [], warnings: [] };
}
```

---

## Feature: `staff_employee_management`

**Validator**: staff module

**Rules**:
1. ⚠️ **WARNING**: All staff checked out
   - Check: `staff_attendance` WHERE `checked_out_at IS NULL`
   - Message: "{count} empleados no han marcado salida. Verifica asistencia."

**Implementation**:
```typescript
export async function validateStaffForShiftClose(
  data: ShiftCloseValidationData
): Promise<CloseValidationResult> {
  const notCheckedOut = await staffService.getActiveAttendance();

  if (notCheckedOut.length > 0) {
    return {
      canClose: true, // Not a blocker, just warning
      blockers: [],
      warnings: [{
        type: 'unchecked_staff',
        message: `${notCheckedOut.length} empleados no han marcado salida.`,
        severity: 'medium'
      }]
    };
  }

  return { canClose: true, blockers: [], warnings: [] };
}
```

---

## Feature: `inventory_stock_tracking`

**Validator**: materials-inventory module

**Rules**:
1. ⚠️ **WARNING**: Inventory count performed
   - Check: Last `inventory.count` event timestamp
   - Message: "No se ha hecho conteo de inventario hoy. Considera revisar stock crítico."

**Implementation**:
```typescript
export async function validateInventoryForShiftClose(
  data: ShiftCloseValidationData
): Promise<CloseValidationResult> {
  const today = new Date().toISOString().split('T')[0];
  const todayCounts = await inventoryService.getCountsByDate(today);

  if (todayCounts.length === 0) {
    return {
      canClose: true,
      blockers: [],
      warnings: [{
        type: 'inventory_count',
        message: 'No se realizó conteo de inventario hoy.',
        severity: 'low'
      }]
    };
  }

  return { canClose: true, blockers: [], warnings: [] };
}
```

---

## Validation Execution Flow

```typescript
// In ShiftControlWidget.tsx
const handleCloseShift = async () => {
  setUIState('VALIDATE_CLOSE');

  try {
    const currentShift = getCurrentShift();
    const userId = useAuthContext().user.id;

    // Run validation service
    const validation = await shiftCloseValidationService.validateClose(
      currentShift,
      userId
    );

    if (!validation.canClose) {
      // Show blockers UI
      setUIState('BLOCKED');
      setBlockers(validation.blockers);
    } else {
      // Show closing modal (may have warnings)
      setUIState('CLOSING_MODAL');
      setWarnings(validation.warnings);
    }
  } catch (error) {
    logger.error('ShiftControl', 'Validation failed', error);
    toast.error('Error al validar cierre de turno');
    setUIState('SHIFT_ACTIVE');
  }
};
```

---

# 🔧 HANDLER IMPLEMENTATION PATTERNS

## HOF Pattern: `createShiftAwareHandler`

```typescript
/**
 * Higher-Order Function that wraps event handlers
 * Ensures events are only processed when shift is active
 */
export function createShiftAwareHandler<T>(
  eventName: string,
  handler: (event: NamespacedEvent<T>) => Promise<void> | void
): (event: NamespacedEvent<T>) => Promise<void> {
  return async (event: NamespacedEvent<T>) => {
    const { isOperational, activeShiftId } = useShiftStore.getState();

    // Ignore events if no active shift
    if (!isOperational()) {
      logger.debug('ShiftControl', `Event ${eventName} ignored - no active shift`);
      return;
    }

    // If event has shift_id, verify it matches active shift
    if (event.data?.shift_id && event.data.shift_id !== activeShiftId) {
      logger.debug(
        'ShiftControl',
        `Event ${eventName} ignored - mismatched shift`,
        { eventShiftId: event.data.shift_id, activeShiftId }
      );
      return;
    }

    try {
      await handler(event);
    } catch (error) {
      logger.error('ShiftControl', `Handler ${eventName} failed`, error);
    }
  };
}
```

**Usage**:
```typescript
// In manifest.tsx setup
const handleCashOpened = createShiftAwareHandler(
  'cash.session.opened',
  async (event) => {
    useShiftStore.getState().setCashSession(event.data.session);
  }
);

eventBus.subscribe('cash.session.opened', handleCashOpened);
```

---

## Subscription Cleanup Pattern

```typescript
// In manifest.tsx
const subscriptions: UnsubscribeFn[] = [];

export const shiftControlManifest: ModuleManifest = {
  setup: async (registry) => {
    const eventBus = registry.getEventBus();
    const { hasFeature } = useCapabilityStore.getState();

    // Cash events
    if (hasFeature('sales_payment_processing')) {
      const unsub1 = eventBus.subscribe('cash.session.opened', handleCashOpened);
      const unsub2 = eventBus.subscribe('cash.session.closed', handleCashClosed);
      subscriptions.push(unsub1, unsub2);
    }

    // Staff events
    if (hasFeature('staff_employee_management')) {
      const unsub3 = eventBus.subscribe('staff.employee.checked_in', handleStaffIn);
      const unsub4 = eventBus.subscribe('staff.employee.checked_out', handleStaffOut);
      subscriptions.push(unsub3, unsub4);
    }

    // ... more subscriptions
  },

  teardown: async () => {
    // Unsubscribe all
    subscriptions.forEach(unsub => unsub());
    subscriptions.length = 0;
  }
};
```

---

# 📊 PERFORMANCE OPTIMIZATION

## React.memo Usage

```typescript
// Only memoize components with stable props
export const ShiftHeader = React.memo<ShiftHeaderProps>(
  ({ shift, uiState, elapsedSeconds }) => {
    // Component implementation
  },
  (prev, next) => {
    // Custom comparison for performance
    return (
      prev.shift?.id === next.shift?.id &&
      prev.uiState === next.uiState &&
      prev.elapsedSeconds === next.elapsedSeconds
    );
  }
);
```

## Zustand Selectors

```typescript
// ❌ BAD: Subscribes to entire store
const shiftStore = useShiftStore();

// ✅ GOOD: Subscribe to specific values
const shift = useShiftStore(state => state.getCurrentShift());
const isOpen = useShiftStore(state => state.isOperational());

// ✅ GOOD: Multiple values with useShallow
import { useShallow } from 'zustand/react/shallow';

const { shift, cashSession, activeStaffCount } = useShiftStore(
  useShallow(state => ({
    shift: state.getCurrentShift(),
    cashSession: state.cashSession,
    activeStaffCount: state.activeStaffCount
  }))
);
```

## Lazy Loading Modals

```typescript
// Lazy load heavy modals
const OpenShiftModal = lazy(() => import('./modals/OpenShiftModal'));
const CloseShiftModal = lazy(() => import('./modals/CloseShiftModal'));

// In component:
{isOpeningModalOpen && (
  <Suspense fallback={<Spinner />}>
    <OpenShiftModal isOpen={isOpeningModalOpen} onClose={handleClose} />
  </Suspense>
)}
```

---

# 🧪 TESTING STRATEGY

## Unit Tests

```typescript
// store/shiftStore.test.ts
describe('shiftStore', () => {
  beforeEach(() => {
    useShiftStore.setState({
      shifts: [],
      activeShiftId: null,
      cashSession: null,
      activeStaffCount: 0
    });
  });

  it('should open a new shift', () => {
    const newShift: OperationalShift = {
      id: 'shift-1',
      business_id: 'biz-1',
      opened_by: 'user-1',
      opened_at: new Date().toISOString(),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    useShiftStore.getState().openShift(newShift);

    expect(useShiftStore.getState().shifts).toHaveLength(1);
    expect(useShiftStore.getState().activeShiftId).toBe('shift-1');
    expect(useShiftStore.getState().isOperational()).toBe(true);
  });

  it('should handle staff check-in event', () => {
    // ... test implementation
  });
});
```

## Integration Tests

```typescript
// handlers/__tests__/cashHandlers.test.tsx
describe('Cash Event Handlers', () => {
  it('should update store when cash session opens', async () => {
    const eventBus = EventBus.getInstance();

    // Setup shift
    const shift = createTestShift();
    useShiftStore.getState().openShift(shift);

    // Emit cash.session.opened
    await eventBus.emit('cash.session.opened', {
      session: createTestCashSession()
    });

    // Verify store updated
    expect(useShiftStore.getState().cashSession).not.toBeNull();
  });
});
```

## E2E Tests (Playwright/Cypress)

```typescript
// e2e/shift-control.spec.ts
describe('Shift Control Widget', () => {
  it('should open and close a shift', () => {
    // Visit dashboard
    cy.visit('/admin/dashboard');

    // Open shift
    cy.contains('Abrir Turno').click();
    cy.get('[data-testid="open-shift-modal"]').should('be.visible');
    cy.get('input[name="notes"]').type('Morning shift');
    cy.contains('Confirmar').click();

    // Verify shift is active
    cy.contains('Turno Activo').should('be.visible');

    // Attempt to close (should be blocked if cash open)
    cy.contains('Cerrar Turno').click();
    cy.contains('sesiones de caja abiertas').should('be.visible');

    // Close cash first
    // ... close cash session

    // Now close shift
    cy.contains('Cerrar Turno').click();
    cy.get('[data-testid="close-shift-modal"]').should('be.visible');
    cy.contains('Confirmar').click();

    // Verify closed
    cy.contains('Turno Cerrado').should('be.visible');
  });
});
```

---

# 📝 IMPLEMENTATION NOTES

## Critical Dependencies

1. **Staff Module MUST emit events** (BLOCKER)
   - `staff.employee.checked_in`
   - `staff.employee.checked_out`
   - Without these, staff indicators won't work

2. **Database Schema**
   - Table: `operational_shifts` must exist
   - Columns: See types above

3. **Feature Registry**
   - All features must be correctly mapped in `BusinessModelRegistry.ts`

## Development Order

1. **Phase 1: Foundation** (Day 1)
   - Types
   - Store
   - Service
   - Handlers

2. **Phase 2: Core UI** (Day 2)
   - ShiftControlWidget
   - ShiftHeader
   - ShiftStats
   - IndicatorsSection

3. **Phase 3: Modals** (Day 3)
   - OpenShiftModal
   - CloseShiftModal
   - Validation UI

4. **Phase 4: Integration** (Day 4)
   - Manifest
   - Event subscriptions
   - HookPoints
   - Dashboard widget

5. **Phase 5: Testing** (Day 5)
   - Unit tests
   - Integration tests
   - E2E test

---

# ✅ COMPLETION CHECKLIST

## Architecture Design
- [x] Component tree defined
- [x] Props interfaces documented
- [x] State machine detailed
- [x] HookPoint contracts specified
- [x] Event payloads documented
- [x] Validation rules defined
- [x] Handler patterns established
- [x] Performance optimizations planned
- [x] Testing strategy outlined

## Next Steps
- [ ] Get user approval on architecture
- [ ] Implement foundation (types, store, handlers)
- [ ] Build UI components
- [ ] Integrate with existing modules
- [ ] Write tests
- [ ] Deploy and monitor

---

**Document Status**: ✅ **COMPLETE AND READY FOR IMPLEMENTATION**
**Version**: 2.1 - Full Architecture Specification
**Date**: 2025-12-05
**Author**: Claude Code (Sonnet 4.5) + User Collaboration
