# 🚀 ShiftControl Module - Guía de Implementación

**Fecha**: 2025-01-26
**Patrón**: Hybrid (Declarative + Grouped) - Event-Driven Architecture
**Estado**: 📝 Listo para implementar

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Módulo](#arquitectura-del-módulo)
3. [Estructura de Archivos](#estructura-de-archivos)
4. [Implementación Paso a Paso](#implementación-paso-a-paso)
5. [Event Groups Completos](#event-groups-completos)
6. [Handlers Implementation](#handlers-implementation)
7. [ShiftStore Implementation](#shiftstore-implementation)
8. [Testing Strategy](#testing-strategy)
9. [Migration Path](#migration-path)

---

## 🎯 RESUMEN EJECUTIVO

### ¿Qué Estamos Construyendo?

Un **módulo ShiftControl event-driven** que:
- ✅ Se adapta automáticamente según capabilities activas
- ✅ Escucha eventos de múltiples módulos (Cash, Staff, Materials, etc.)
- ✅ Mantiene estado coherente del turno en Zustand store
- ✅ Emite eventos de coordinación
- ✅ Código declarativo, mantenible y testeable

### Decisiones Arquitectónicas Clave

| Decisión | Opción Elegida | Razón |
|----------|---------------|-------|
| **Patrón de Suscripción** | Hybrid (Declarative + Grouped) | Balance entre simplicidad y organización |
| **State Management** | Zustand Store | Reactivo, simple, ya usado en el proyecto |
| **Event Communication** | EventBus (ya existe) | Event-driven, desacoplado |
| **Subscription Logic** | Conditional by Capability | Solo suscribe a eventos relevantes |

---

## 🏗️ ARQUITECTURA DEL MÓDULO

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                  SHIFT-CONTROL MODULE                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐      ┌──────────────────────────┐   │
│  │  manifest.tsx│─────→│ subscriptionEngine.ts    │   │
│  └──────────────┘      └──────────────────────────┘   │
│                                ↓                        │
│         ┌──────────────────────────────────┐           │
│         │  EVENT GROUPS (Declarative)      │           │
│         ├──────────────────────────────────┤           │
│         │ - cashEvents.ts                  │           │
│         │ - staffEvents.ts                 │           │
│         │ - appointmentEvents.ts           │           │
│         │ - assetEvents.ts                 │           │
│         │ - mobileEvents.ts                │           │
│         │ - tablesEvents.ts                │           │
│         │ - deliveryEvents.ts              │           │
│         └──────────────────────────────────┘           │
│                        ↓                                │
│         ┌──────────────────────────────────┐           │
│         │  EVENT HANDLERS                  │           │
│         ├──────────────────────────────────┤           │
│         │ handleCashSessionOpened()        │           │
│         │ handleStaffCheckIn()             │           │
│         │ handleAppointmentCompleted()     │───┐       │
│         │ ...                              │   │       │
│         └──────────────────────────────────┘   │       │
│                                                 ↓       │
│         ┌─────────────────────────────────────────┐    │
│         │  SHIFT STORE (Zustand)                  │    │
│         ├─────────────────────────────────────────┤    │
│         │ State:                                  │    │
│         │  - isOperational                        │    │
│         │  - cashSession                          │    │
│         │  - activeStaffCount                     │    │
│         │  - currentShift                         │    │
│         │  - alerts                               │    │
│         │                                         │    │
│         │ Actions:                                │    │
│         │  - updateCashSession()                  │    │
│         │  - incrementStaffCount()                │    │
│         │  - setOperationalStatus()               │    │
│         └─────────────────────────────────────────┘    │
│                        ↑                                │
│         ┌──────────────────────────────────┐           │
│         │  SHIFT SERVICE                   │           │
│         ├──────────────────────────────────┤           │
│         │ openShift()                      │           │
│         │ closeShift()                     │           │
│         │ validateCloseConditions()        │           │
│         └──────────────────────────────────┘           │
│                        ↑                                │
│         ┌──────────────────────────────────┐           │
│         │  SHIFT CONTROL WIDGET (UI)       │           │
│         └──────────────────────────────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘

                    EXTERNAL MODULES
     ┌──────────┐  ┌──────┐  ┌──────────┐  ┌────────┐
     │   Cash   │  │Staff │  │Materials │  │ Tables │
     └────┬─────┘  └───┬──┘  └────┬─────┘  └───┬────┘
          │            │          │            │
          └────────────┴──────────┴────────────┘
                       │
                   EventBus
                       │
                  ShiftControl
                   (Subscribe)
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
src/modules/shift-control/
├── manifest.tsx                          # Module registration
├── subscriptions/
│   ├── index.ts                          # Export all groups
│   ├── subscriptionEngine.ts             # Registration logic
│   ├── cashEvents.ts                     # Cash-related events
│   ├── staffEvents.ts                    # Staff-related events
│   ├── appointmentEvents.ts              # Appointment-related events
│   ├── assetEvents.ts                    # Asset rental events
│   ├── mobileEvents.ts                   # Mobile operations events
│   ├── tablesEvents.ts                   # Table management events
│   ├── deliveryEvents.ts                 # Delivery events
│   └── materialsEvents.ts                # Inventory events
├── handlers/
│   ├── index.ts                          # Export all handlers
│   ├── cashHandlers.ts                   # Cash event handlers
│   ├── staffHandlers.ts                  # Staff event handlers
│   ├── appointmentHandlers.ts            # Appointment handlers
│   ├── assetHandlers.ts                  # Asset handlers
│   ├── mobileHandlers.ts                 # Mobile handlers
│   ├── tablesHandlers.ts                 # Table handlers
│   ├── deliveryHandlers.ts               # Delivery handlers
│   └── materialsHandlers.ts              # Inventory handlers
├── services/
│   ├── shiftService.ts                   # Business logic
│   └── validationService.ts              # Close validations
├── store/
│   └── shiftStore.ts                     # Zustand store
├── components/
│   ├── ShiftControlWidget.tsx            # Main widget
│   ├── PhysicalShiftWidget.tsx           # Physical business variant
│   ├── HybridShiftWidget.tsx             # Hybrid variant
│   └── DigitalShiftWidget.tsx            # Digital variant
├── types/
│   └── index.ts                          # TypeScript types
└── __tests__/
    ├── shiftStore.test.ts
    ├── shiftService.test.ts
    ├── cashHandlers.test.ts
    └── subscriptionEngine.test.ts
```

---

## 🔧 IMPLEMENTACIÓN PASO A PASO

### Paso 1: Tipos Base

```typescript
// src/modules/shift-control/types/index.ts

import type { BusinessCapabilityId } from '@/config/types';
import type { EventHandler, EventPattern } from '@/lib/events/types';
import type { CashSessionRow } from '@/modules/cash/types';

/**
 * Event Group Configuration
 * Agrupa eventos por capability
 */
export interface EventGroup {
  /** Capability que activa este grupo de eventos */
  capability: BusinessCapabilityId | BusinessCapabilityId[];

  /** Lista de eventos a suscribir */
  events: Array<{
    pattern: EventPattern;
    handler: EventHandler;
    priority?: number;
  }>;

  /** Descripción para debugging */
  description?: string;
}

/**
 * Shift State
 * Estado completo del turno
 */
export interface ShiftState {
  // Operational status
  isOperational: boolean;
  operationalSince: string | null;

  // Cash session (if physical_products)
  cashSession: CashSessionRow | null;

  // Staff
  activeStaffCount: number;
  scheduledStaffCount: number;
  staffMembers: Array<{
    id: string;
    name: string;
    role: string;
    checkedInAt: string;
  }>;

  // Current shift info
  currentShift: {
    name: string;
    startTime: string;
    endTime: string;
  } | null;

  // Tables (if onsite_service)
  openTablesCount: number;

  // Deliveries (if delivery_shipping)
  activeDeliveriesCount: number;

  // Appointments (if professional_services)
  appointmentsCompleted: number;
  appointmentsNoShow: number;

  // Assets (if asset_rental)
  assetsCheckedOut: number;

  // Alerts
  alerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;

  // Loading states
  loading: boolean;
  error: string | null;
}

/**
 * Shift Close Validation Result
 */
export interface CloseValidationResult {
  canClose: boolean;
  blockingIssues: string[];
  warnings: string[];
}
```

---

### Paso 2: ShiftStore (Zustand)

```typescript
// src/modules/shift-control/store/shiftStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ShiftState } from '../types';
import type { CashSessionRow } from '@/modules/cash/types';

interface ShiftActions {
  // Operational status
  setOperationalStatus: (isOperational: boolean) => void;

  // Cash session
  updateCashSession: (session: CashSessionRow | null) => void;

  // Staff
  incrementStaffCount: () => void;
  decrementStaffCount: () => void;
  updateScheduledStaffCount: (count: number) => void;
  addStaffMember: (member: { id: string; name: string; role: string; checkedInAt: string }) => void;
  removeStaffMember: (id: string) => void;

  // Current shift
  setCurrentShift: (shift: { name: string; startTime: string; endTime: string } | null) => void;

  // Tables
  setOpenTablesCount: (count: number) => void;
  incrementOpenTables: () => void;
  decrementOpenTables: () => void;

  // Deliveries
  setActiveDeliveriesCount: (count: number) => void;
  incrementDeliveries: () => void;
  decrementDeliveries: () => void;

  // Appointments
  incrementAppointmentsCompleted: () => void;
  incrementAppointmentsNoShow: () => void;
  resetAppointmentCounters: () => void;

  // Assets
  setAssetsCheckedOut: (count: number) => void;
  incrementAssetsOut: () => void;
  decrementAssetsOut: () => void;

  // Alerts
  addAlert: (alert: Omit<ShiftState['alerts'][0], 'id' | 'timestamp'>) => void;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;

  // General
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: ShiftState = {
  isOperational: false,
  operationalSince: null,
  cashSession: null,
  activeStaffCount: 0,
  scheduledStaffCount: 0,
  staffMembers: [],
  currentShift: null,
  openTablesCount: 0,
  activeDeliveriesCount: 0,
  appointmentsCompleted: 0,
  appointmentsNoShow: 0,
  assetsCheckedOut: 0,
  alerts: [],
  loading: false,
  error: null
};

export const useShiftStore = create<ShiftState & ShiftActions>()(
  devtools(
    (set) => ({
      ...initialState,

      // Operational status
      setOperationalStatus: (isOperational) =>
        set({
          isOperational,
          operationalSince: isOperational ? new Date().toISOString() : null
        }),

      // Cash session
      updateCashSession: (cashSession) =>
        set({ cashSession }),

      // Staff
      incrementStaffCount: () =>
        set((state) => ({ activeStaffCount: state.activeStaffCount + 1 })),

      decrementStaffCount: () =>
        set((state) => ({ activeStaffCount: Math.max(0, state.activeStaffCount - 1) })),

      updateScheduledStaffCount: (scheduledStaffCount) =>
        set({ scheduledStaffCount }),

      addStaffMember: (member) =>
        set((state) => ({
          staffMembers: [...state.staffMembers, member],
          activeStaffCount: state.activeStaffCount + 1
        })),

      removeStaffMember: (id) =>
        set((state) => ({
          staffMembers: state.staffMembers.filter(m => m.id !== id),
          activeStaffCount: Math.max(0, state.activeStaffCount - 1)
        })),

      // Current shift
      setCurrentShift: (currentShift) =>
        set({ currentShift }),

      // Tables
      setOpenTablesCount: (openTablesCount) =>
        set({ openTablesCount }),

      incrementOpenTables: () =>
        set((state) => ({ openTablesCount: state.openTablesCount + 1 })),

      decrementOpenTables: () =>
        set((state) => ({ openTablesCount: Math.max(0, state.openTablesCount - 1) })),

      // Deliveries
      setActiveDeliveriesCount: (activeDeliveriesCount) =>
        set({ activeDeliveriesCount }),

      incrementDeliveries: () =>
        set((state) => ({ activeDeliveriesCount: state.activeDeliveriesCount + 1 })),

      decrementDeliveries: () =>
        set((state) => ({ activeDeliveriesCount: Math.max(0, state.activeDeliveriesCount - 1) })),

      // Appointments
      incrementAppointmentsCompleted: () =>
        set((state) => ({ appointmentsCompleted: state.appointmentsCompleted + 1 })),

      incrementAppointmentsNoShow: () =>
        set((state) => ({ appointmentsNoShow: state.appointmentsNoShow + 1 })),

      resetAppointmentCounters: () =>
        set({ appointmentsCompleted: 0, appointmentsNoShow: 0 }),

      // Assets
      setAssetsCheckedOut: (assetsCheckedOut) =>
        set({ assetsCheckedOut }),

      incrementAssetsOut: () =>
        set((state) => ({ assetsCheckedOut: state.assetsCheckedOut + 1 })),

      decrementAssetsOut: () =>
        set((state) => ({ assetsCheckedOut: Math.max(0, state.assetsCheckedOut - 1) })),

      // Alerts
      addAlert: (alert) =>
        set((state) => ({
          alerts: [
            ...state.alerts,
            {
              ...alert,
              id: Math.random().toString(36).substr(2, 9),
              timestamp: new Date().toISOString()
            }
          ]
        })),

      removeAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter(a => a.id !== id)
        })),

      clearAlerts: () =>
        set({ alerts: [] }),

      // General
      setLoading: (loading) =>
        set({ loading }),

      setError: (error) =>
        set({ error }),

      reset: () =>
        set(initialState)
    }),
    { name: 'ShiftStore' }
  )
);
```

---

### Paso 3: Event Groups (Ejemplo Completo)

```typescript
// src/modules/shift-control/subscriptions/cashEvents.ts

import type { EventGroup } from '../types';
import {
  handleCashSessionOpened,
  handleCashSessionClosed,
  handleCashDiscrepancy
} from '../handlers/cashHandlers';

export const CASH_EVENTS: EventGroup = {
  capability: 'physical_products',
  description: 'Cash management events for physical product businesses',
  events: [
    {
      pattern: 'cash.session.opened',
      handler: handleCashSessionOpened
    },
    {
      pattern: 'cash.session.closed',
      handler: handleCashSessionClosed
    },
    {
      pattern: 'cash.discrepancy.detected',
      handler: handleCashDiscrepancy,
      priority: 100 // High priority
    }
  ]
};
```

```typescript
// src/modules/shift-control/subscriptions/staffEvents.ts

import type { EventGroup } from '../types';
import {
  handleStaffCheckIn,
  handleStaffCheckOut
} from '../handlers/staffHandlers';

export const STAFF_EVENTS: EventGroup = {
  // Aplica a la mayoría de capabilities (todas menos digital_products)
  capability: ['physical_products', 'professional_services', 'asset_rental', 'membership_subscriptions'],
  description: 'Staff check-in/out events',
  events: [
    {
      pattern: 'staff.employee.checked_in',
      handler: handleStaffCheckIn
    },
    {
      pattern: 'staff.employee.checked_out',
      handler: handleStaffCheckOut
    }
  ]
};
```

```typescript
// src/modules/shift-control/subscriptions/index.ts

export { CASH_EVENTS } from './cashEvents';
export { STAFF_EVENTS } from './staffEvents';
export { APPOINTMENT_EVENTS } from './appointmentEvents';
export { ASSET_EVENTS } from './assetEvents';
export { MOBILE_EVENTS } from './mobileEvents';
export { TABLES_EVENTS } from './tablesEvents';
export { DELIVERY_EVENTS } from './deliveryEvents';
export { MATERIALS_EVENTS } from './materialsEvents';

export { registerEventGroups } from './subscriptionEngine';
```

---

### Paso 4: Subscription Engine

```typescript
// src/modules/shift-control/subscriptions/subscriptionEngine.ts

import type { EventGroup } from '../types';
import type { IEventBus } from '@/lib/events/types';
import type { BusinessCapabilityId } from '@/config/types';
import { logger } from '@/lib/logging';

/**
 * Registra grupos de eventos según capabilities activas
 */
export function registerEventGroups(
  eventGroups: EventGroup[],
  eventBus: IEventBus,
  hasCapability: (cap: BusinessCapabilityId) => boolean
): void {
  let totalSubscriptions = 0;

  for (const group of eventGroups) {
    // Check if capability is active
    const isActive = Array.isArray(group.capability)
      ? group.capability.some(cap => hasCapability(cap))
      : hasCapability(group.capability);

    if (!isActive) {
      logger.debug('ShiftControl', `Skipping ${group.description || 'event group'} (capability not active)`);
      continue;
    }

    // Subscribe to all events in the group
    for (const { pattern, handler, priority } of group.events) {
      eventBus.subscribe(
        pattern,
        handler,
        {
          moduleId: 'shift-control',
          priority
        }
      );

      totalSubscriptions++;
      logger.debug('ShiftControl', `Subscribed to: ${pattern}`);
    }

    logger.info('ShiftControl', `✅ Registered ${group.description || 'event group'} (${group.events.length} events)`);
  }

  logger.info('ShiftControl', `📡 Total event subscriptions: ${totalSubscriptions}`);
}
```

---

### Paso 5: Handlers (Ejemplo)

```typescript
// src/modules/shift-control/handlers/cashHandlers.ts

import type { NamespacedEvent } from '@/lib/events/types';
import { useShiftStore } from '../store/shiftStore';
import { logger } from '@/lib/logging';

/**
 * Handler: Cash Session Opened
 */
export async function handleCashSessionOpened(event: NamespacedEvent) {
  logger.info('ShiftControl', 'Cash session opened', event.payload);

  const { cashSession } = event.payload;

  // Update store
  useShiftStore.getState().updateCashSession(cashSession);
  useShiftStore.getState().setOperationalStatus(true);

  logger.debug('ShiftControl', 'Store updated with cash session');
}

/**
 * Handler: Cash Session Closed
 */
export async function handleCashSessionClosed(event: NamespacedEvent) {
  logger.info('ShiftControl', 'Cash session closed', event.payload);

  const { variance } = event.payload;

  // Update store
  useShiftStore.getState().updateCashSession(null);

  // Add alert if there's a discrepancy
  if (Math.abs(variance) > 50) {
    useShiftStore.getState().addAlert({
      type: 'warning',
      message: `Cash discrepancy detected: $${variance.toFixed(2)}`
    });
  }

  logger.debug('ShiftControl', 'Cash session removed from store');
}

/**
 * Handler: Cash Discrepancy Detected
 */
export async function handleCashDiscrepancy(event: NamespacedEvent) {
  logger.warn('ShiftControl', 'Cash discrepancy detected', event.payload);

  const { variance, sessionId } = event.payload;

  // Add critical alert
  useShiftStore.getState().addAlert({
    type: 'error',
    message: `Critical cash discrepancy: $${variance.toFixed(2)} (Session: ${sessionId})`
  });
}
```

```typescript
// src/modules/shift-control/handlers/staffHandlers.ts

import type { NamespacedEvent } from '@/lib/events/types';
import { useShiftStore } from '../store/shiftStore';
import { logger } from '@/lib/logging';

/**
 * Handler: Staff Check-In
 */
export async function handleStaffCheckIn(event: NamespacedEvent) {
  logger.info('ShiftControl', 'Staff checked in', event.payload);

  const { employeeId, employeeName, role, timestamp } = event.payload;

  // Add staff member to store
  useShiftStore.getState().addStaffMember({
    id: employeeId,
    name: employeeName,
    role,
    checkedInAt: timestamp
  });

  logger.debug('ShiftControl', `Active staff count: ${useShiftStore.getState().activeStaffCount}`);
}

/**
 * Handler: Staff Check-Out
 */
export async function handleStaffCheckOut(event: NamespacedEvent) {
  logger.info('ShiftControl', 'Staff checked out', event.payload);

  const { employeeId } = event.payload;

  // Remove staff member from store
  useShiftStore.getState().removeStaffMember(employeeId);

  logger.debug('ShiftControl', `Active staff count: ${useShiftStore.getState().activeStaffCount}`);
}
```

---

### Paso 6: Manifest Final

```typescript
// src/modules/shift-control/manifest.tsx

import type { ModuleManifest } from '@/lib/modules/types';
import { logger } from '@/lib/logging';
import { lazy } from 'react';

export const shiftControlManifest: ModuleManifest = {
  id: 'shift-control',
  name: 'Shift Control',
  version: '1.0.0',

  depends: ['cash-management', 'staff', 'scheduling'],
  autoInstall: true,

  requiredFeatures: [],
  optionalFeatures: [],

  minimumRole: 'CAJERO' as const,

  hooks: {
    provide: [
      'shift.opening',
      'shift.opened',
      'shift.closing',
      'shift.closed',
      'shift.validation.failed',
      'dashboard.widgets'
    ],
    consume: [
      'cash.session.opened',
      'cash.session.closed',
      'staff.employee.checked_in',
      'staff.employee.checked_out',
      // ... (todos los eventos que escucha)
    ]
  },

  setup: async (registry) => {
    logger.info('ShiftControl', '🎯 Setting up Shift Control module');

    const [
      { registerEventGroups },
      {
        CASH_EVENTS,
        STAFF_EVENTS,
        APPOINTMENT_EVENTS,
        ASSET_EVENTS,
        MOBILE_EVENTS,
        TABLES_EVENTS,
        DELIVERY_EVENTS,
        MATERIALS_EVENTS
      },
      { eventBus },
      { useCapabilityStore }
    ] = await Promise.all([
      import('./subscriptions/subscriptionEngine'),
      import('./subscriptions'),
      import('@/lib/events'),
      import('@/store/capabilityStore')
    ]);

    const hasCapability = useCapabilityStore.getState().hasCapability;

    // ============================================
    // REGISTER EVENT SUBSCRIPTIONS
    // ============================================
    queueMicrotask(() => {
      registerEventGroups(
        [
          CASH_EVENTS,
          STAFF_EVENTS,
          APPOINTMENT_EVENTS,
          ASSET_EVENTS,
          MOBILE_EVENTS,
          TABLES_EVENTS,
          DELIVERY_EVENTS,
          MATERIALS_EVENTS
        ],
        eventBus,
        hasCapability
      );
    });

    // ============================================
    // REGISTER DASHBOARD WIDGET
    // ============================================
    const ShiftControlWidget = lazy(() =>
      import('./components/ShiftControlWidget').then((m) => ({
        default: m.ShiftControlWidget
      }))
    );

    registry.addAction(
      'dashboard.widgets',
      () => <ShiftControlWidget />,
      'shift-control',
      100 // Highest priority (hero widget)
    );

    logger.info('ShiftControl', '✅ Shift Control module setup complete');
  },

  teardown: async () => {
    logger.info('ShiftControl', 'Tearing down Shift Control module');
  },

  exports: {
    // Para otros módulos que necesiten saber estado del turno
    getShiftStatus: () => {
      const { useShiftStore } = require('./store/shiftStore');
      return useShiftStore.getState().isOperational;
    }
  },

  metadata: {
    category: 'core',
    description: 'Central shift management and operational status control',
    author: 'G-Admin Team',
    tags: ['shift', 'cash', 'staff', 'operations'],
    navigation: {
      route: '/admin/core/dashboard',
      icon: null, // No navigation (embedded in dashboard)
      domain: 'core'
    }
  }
};

export default shiftControlManifest;
```

---

## ✅ VENTAJAS DE ESTA ARQUITECTURA

| Aspecto | Beneficio |
|---------|-----------|
| **Legibilidad** | Configuración clara en event groups |
| **Mantenibilidad** | Agregar capability = crear nuevo event group |
| **Testeable** | Test grupos y handlers por separado |
| **Escalable** | Agregar 10+ capabilities sin complicar código |
| **Performance** | Solo suscribe a eventos relevantes |
| **Debugging** | Logs claros de qué se suscribió |
| **Separación de Concerns** | Config / Logic / State separados |

---

## 📝 PRÓXIMOS PASOS

1. [ ] Revisar y aprobar arquitectura
2. [ ] Implementar event groups completos (8 groups)
3. [ ] Implementar handlers para cada evento
4. [ ] Implementar ShiftService (openShift, closeShift)
5. [ ] Agregar eventos faltantes en módulos existentes
6. [ ] Implementar ShiftControlWidget (UI)
7. [ ] Testing

---

**Documento creado por**: Claude Code
**Estado**: 📝 Listo para implementación
**Última actualización**: 2025-01-26
