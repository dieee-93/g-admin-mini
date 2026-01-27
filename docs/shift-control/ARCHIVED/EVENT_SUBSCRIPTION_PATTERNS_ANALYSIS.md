# 🔍 Event Subscription Patterns - Análisis y Mejores Prácticas

**Fecha**: 2025-01-26
**Pregunta**: ¿Es el patrón `if (hasCapability)` la mejor manera de suscribirse a eventos?
**Estado**: 🟢 ANÁLISIS COMPLETO

---

## ❓ LA PREGUNTA

```typescript
// ¿Es esto correcto?
if (hasCapability('physical_products')) {
  eventBus.subscribe('cash.session.opened', handler);
}

if (hasCapability('asset_rental')) {
  eventBus.subscribe('assets.checkout', handler);
}
```

**Preocupaciones**:
- ❌ Condiciones anidadas pueden volverse ilegibles
- ❌ Código imperative (procedural) vs declarative
- ❌ Difícil de testear
- ❌ Difícil de mantener si hay muchas capabilities

---

## 📚 INVESTIGACIÓN: MEJORES PRÁCTICAS

### 1. Topic-Based Filtering (Broker-Side)

> "A subscriber should subscribe only to the events it needs, and the subscription should do the filtering, not the business logic."

**Fuente**: [Solace Event-Driven Architecture Patterns](https://solace.com/event-driven-architecture-patterns/)

**Principio**: El broker filtra eventos, no el consumidor.

### 2. Declarative vs Imperative

> "Subscriber registration can occur at different times: build time (hardcoded handlers), initialization time (XML configuration files or metadata), or runtime (dynamic subscriptions)."

**Fuente**: [Microsoft Event-Driven Architecture](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven)

**Best Practice**: Configuración declarativa > Código imperative.

### 3. Registry Pattern

> "The register function receives an event name and a callback function to be invoked, and returns a Registry object to enable a way of unregistering the same event."

**Fuente**: [How to Implement an Event Bus in TypeScript](https://luixaviles.com/2021/07/how-to-implement-event-bus-typescript/)

**Patrón**: Centralizar suscripciones en un registry.

### 4. Anti-Pattern Alert

> "Building a system with many services each directly subscribing to events from other services can make it very hard to understand what the system actually does."

**Fuente**: [Event Sourcing Anti-Patterns - InfoQ](https://www.infoq.com/news/2016/04/event-sourcing-anti-pattern/)

**Alerta**: Demasiadas suscripciones dispersas = código incomprensible.

---

## 🔍 ANÁLISIS DEL CÓDIGO ACTUAL

### Patrón Actual en el Proyecto

```typescript
// src/modules/mobile/manifest.tsx (líneas 90-126)

queueMicrotask(() => {
  // Subscription 1
  if (hasFeature('mobile_route_planning')) {
    eventBus.subscribe('fulfillment.delivery.queued', handler);
  }

  // Subscription 2 (sin condición)
  eventBus.subscribe('staff.driver_available', handler);

  // Subscription 3
  if (hasFeature('mobile_inventory_constraints')) {
    eventBus.subscribe('materials.stock_updated', handler);
  }
});
```

### Otros Módulos (sin condiciones)

```typescript
// src/modules/customers/manifest.tsx
eventBus.subscribe('sales.order_completed', handler);

// src/modules/fulfillment/manifest.tsx
eventBus.subscribe('sales.order_placed', handler);
eventBus.subscribe('production.order_ready', handler);
```

### ✅ Observaciones

1. **Mobile Module YA usa `if (hasFeature)`** → Es un patrón existente
2. **Algunos módulos NO usan condiciones** → Siempre suscriben
3. **Todos usan `queueMicrotask`** → Non-blocking setup

---

## 🎯 EVALUACIÓN: PATRÓN IF-CAPABILITY

### ❌ Problemas del Patrón Original

```typescript
// ShiftControl manifest (propuesta original)
setup: async (registry) => {
  if (hasCapability('physical_products')) {
    eventBus.subscribe('cash.session.opened', handler);
    eventBus.subscribe('cash.session.closed', handler);
    eventBus.subscribe('cash.discrepancy.detected', handler);
  }

  if (hasCapability('professional_services')) {
    eventBus.subscribe('scheduling.appointment.completed', handler);
    eventBus.subscribe('scheduling.appointment.no_show', handler);
  }

  if (hasCapability('asset_rental')) {
    eventBus.subscribe('assets.checkout', handler);
    eventBus.subscribe('assets.checkin', handler);
    eventBus.subscribe('assets.damaged.reported', handler);
  }

  if (hasCapability('onsite_service') && hasCapability('physical_products')) {
    eventBus.subscribe('tables.opened', handler);
    eventBus.subscribe('tables.closed', handler);
  }

  if (hasCapability('mobile_operations')) {
    eventBus.subscribe('mobile.location.updated', handler);
    eventBus.subscribe('mobile.route.completed', handler);
  }

  // ... 5+ capabilities más ...
}
```

**Problemas**:
1. ❌ **20-30 bloques if** → Ilegible
2. ❌ **Lógica dispersa** → Difícil encontrar qué capability activa qué
3. ❌ **No escalable** → Agregar capability = modificar función gigante
4. ❌ **Testing complejo** → Mock de hasCapability + 30 casos
5. ❌ **Mezcla de concerns** → Setup + conditional logic juntos

---

## ✅ SOLUCIONES: PATRONES MEJORADOS

### Opción A: **Subscription Registry (Declarative)**

**Concepto**: Definir suscripciones como data, no como código.

```typescript
// ============================================
// CONFIGURACIÓN DECLARATIVA
// ============================================

interface EventSubscriptionConfig {
  capability: BusinessCapabilityId | BusinessCapabilityId[];
  event: EventPattern;
  handler: EventHandler;
  priority?: number;
}

const SHIFT_CONTROL_SUBSCRIPTIONS: EventSubscriptionConfig[] = [
  // ============================================
  // CASH MANAGEMENT (physical_products)
  // ============================================
  {
    capability: 'physical_products',
    event: 'cash.session.opened',
    handler: handleCashSessionOpened
  },
  {
    capability: 'physical_products',
    event: 'cash.session.closed',
    handler: handleCashSessionClosed
  },
  {
    capability: 'physical_products',
    event: 'cash.discrepancy.detected',
    handler: handleCashDiscrepancy,
    priority: EventPriority.HIGH
  },

  // ============================================
  // STAFF MANAGEMENT (todas menos digital_products)
  // ============================================
  {
    capability: ['physical_products', 'professional_services', 'asset_rental'],
    event: 'staff.employee.checked_in',
    handler: handleStaffCheckIn
  },
  {
    capability: ['physical_products', 'professional_services', 'asset_rental'],
    event: 'staff.employee.checked_out',
    handler: handleStaffCheckOut
  },

  // ============================================
  // APPOINTMENTS (professional_services)
  // ============================================
  {
    capability: 'professional_services',
    event: 'scheduling.appointment.completed',
    handler: handleAppointmentCompleted
  },
  {
    capability: 'professional_services',
    event: 'scheduling.appointment.no_show',
    handler: handleAppointmentNoShow
  },

  // ============================================
  // ASSET RENTAL
  // ============================================
  {
    capability: 'asset_rental',
    event: 'assets.checkout',
    handler: handleAssetCheckout
  },
  {
    capability: 'asset_rental',
    event: 'assets.checkin',
    handler: handleAssetCheckin
  },

  // ============================================
  // MOBILE OPERATIONS
  // ============================================
  {
    capability: 'mobile_operations',
    event: 'mobile.location.updated',
    handler: handleLocationUpdate
  },
  {
    capability: 'mobile_operations',
    event: 'mobile.route.completed',
    handler: handleRouteCompleted
  },

  // ... más configuraciones ...
];

// ============================================
// ENGINE DE SUSCRIPCIÓN
// ============================================

function registerCapabilityAwareSubscriptions(
  config: EventSubscriptionConfig[],
  eventBus: IEventBus,
  hasCapability: (cap: BusinessCapabilityId) => boolean
): void {
  for (const subscription of config) {
    // Check if capability is active
    const isActive = Array.isArray(subscription.capability)
      ? subscription.capability.some(cap => hasCapability(cap))
      : hasCapability(subscription.capability);

    if (isActive) {
      eventBus.subscribe(
        subscription.event,
        subscription.handler,
        {
          moduleId: 'shift-control',
          priority: subscription.priority
        }
      );

      logger.debug('ShiftControl', `Subscribed to ${subscription.event}`);
    }
  }
}

// ============================================
// MANIFEST SETUP (Limpio y simple)
// ============================================

setup: async (registry) => {
  const { eventBus } = await import('@/lib/events');
  const { hasCapability } = useCapabilityStore.getState();

  // Una sola línea
  registerCapabilityAwareSubscriptions(
    SHIFT_CONTROL_SUBSCRIPTIONS,
    eventBus,
    hasCapability
  );

  logger.info('ShiftControl', 'Event subscriptions configured');
}
```

#### ✅ Ventajas

| Aspecto | If-Capability | Subscription Registry |
|---------|--------------|----------------------|
| **Legibilidad** | Baja (30 ifs) | Alta (tabla clara) |
| **Mantenibilidad** | Difícil | Fácil (agregar línea) |
| **Testing** | Complejo | Simple (test array) |
| **Documentación** | Implícita | Auto-documentada |
| **Escalabilidad** | No escala | Escala bien |
| **Separación de concerns** | Mezcla lógica | Separa config de lógica |

---

### Opción B: **Strategy Pattern (Por Capability)**

**Concepto**: Cada capability tiene su propio strategy de suscripciones.

```typescript
// ============================================
// INTERFACE
// ============================================

interface CapabilityEventStrategy {
  capability: BusinessCapabilityId;
  subscribe: (eventBus: IEventBus) => void;
  unsubscribe?: () => void;
}

// ============================================
// STRATEGIES
// ============================================

const PhysicalProductsStrategy: CapabilityEventStrategy = {
  capability: 'physical_products',

  subscribe: (eventBus) => {
    eventBus.subscribe('cash.session.opened', handleCashSessionOpened);
    eventBus.subscribe('cash.session.closed', handleCashSessionClosed);
    eventBus.subscribe('cash.discrepancy.detected', handleCashDiscrepancy);
    eventBus.subscribe('materials.stock.snapshot_taken', handleStockSnapshot);
    eventBus.subscribe('materials.low_stock.alert', handleLowStock);
  }
};

const ProfessionalServicesStrategy: CapabilityEventStrategy = {
  capability: 'professional_services',

  subscribe: (eventBus) => {
    eventBus.subscribe('scheduling.appointment.completed', handleAppointmentCompleted);
    eventBus.subscribe('scheduling.appointment.no_show', handleAppointmentNoShow);
    eventBus.subscribe('staff.professional.checked_in', handleProfessionalCheckIn);
  }
};

const AssetRentalStrategy: CapabilityEventStrategy = {
  capability: 'asset_rental',

  subscribe: (eventBus) => {
    eventBus.subscribe('assets.checkout', handleAssetCheckout);
    eventBus.subscribe('assets.checkin', handleAssetCheckin);
    eventBus.subscribe('assets.damaged.reported', handleAssetDamage);
  }
};

const MobileOperationsStrategy: CapabilityEventStrategy = {
  capability: 'mobile_operations',

  subscribe: (eventBus) => {
    eventBus.subscribe('mobile.location.updated', handleLocationUpdate);
    eventBus.subscribe('mobile.route.completed', handleRouteCompleted);
    eventBus.subscribe('materials.mobile_stock.loaded', handleMobileStockLoad);
  }
};

// ============================================
// REGISTRY DE STRATEGIES
// ============================================

const CAPABILITY_STRATEGIES = [
  PhysicalProductsStrategy,
  ProfessionalServicesStrategy,
  AssetRentalStrategy,
  MobileOperationsStrategy
  // ... más strategies
];

// ============================================
// ENGINE
// ============================================

function applyCapabilityStrategies(
  strategies: CapabilityEventStrategy[],
  eventBus: IEventBus,
  hasCapability: (cap: BusinessCapabilityId) => boolean
): void {
  for (const strategy of strategies) {
    if (hasCapability(strategy.capability)) {
      strategy.subscribe(eventBus);
      logger.info('ShiftControl', `Applied ${strategy.capability} strategy`);
    }
  }
}

// ============================================
// MANIFEST SETUP
// ============================================

setup: async (registry) => {
  const { eventBus } = await import('@/lib/events');
  const { hasCapability } = useCapabilityStore.getState();

  applyCapabilityStrategies(
    CAPABILITY_STRATEGIES,
    eventBus,
    hasCapability
  );
}
```

#### ✅ Ventajas

- ✅ **Organización por capability** → Fácil encontrar qué eventos pertenecen a qué
- ✅ **Extensible** → Agregar nueva capability = crear nuevo strategy
- ✅ **Testeable** → Test cada strategy aisladamente
- ✅ **Desacoplado** → Strategies pueden estar en archivos separados

---

### Opción C: **Hybrid (Declarative + Grouped)**

**Concepto**: Declarativo pero agrupado lógicamente.

```typescript
// ============================================
// GRUPOS DE EVENTOS POR CAPABILITY
// ============================================

const CASH_EVENTS = {
  capability: 'physical_products',
  events: [
    { pattern: 'cash.session.opened', handler: handleCashSessionOpened },
    { pattern: 'cash.session.closed', handler: handleCashSessionClosed },
    { pattern: 'cash.discrepancy.detected', handler: handleCashDiscrepancy }
  ]
};

const APPOINTMENT_EVENTS = {
  capability: 'professional_services',
  events: [
    { pattern: 'scheduling.appointment.completed', handler: handleAppointmentCompleted },
    { pattern: 'scheduling.appointment.no_show', handler: handleAppointmentNoShow }
  ]
};

const ASSET_EVENTS = {
  capability: 'asset_rental',
  events: [
    { pattern: 'assets.checkout', handler: handleAssetCheckout },
    { pattern: 'assets.checkin', handler: handleAssetCheckin },
    { pattern: 'assets.damaged.reported', handler: handleAssetDamage }
  ]
};

const MOBILE_EVENTS = {
  capability: 'mobile_operations',
  events: [
    { pattern: 'mobile.location.updated', handler: handleLocationUpdate },
    { pattern: 'mobile.route.completed', handler: handleRouteCompleted }
  ]
};

const EVENT_GROUPS = [
  CASH_EVENTS,
  APPOINTMENT_EVENTS,
  ASSET_EVENTS,
  MOBILE_EVENTS
];

// ============================================
// SIMPLE REGISTRATION
// ============================================

setup: async (registry) => {
  const { eventBus } = await import('@/lib/events');
  const { hasCapability } = useCapabilityStore.getState();

  for (const group of EVENT_GROUPS) {
    if (hasCapability(group.capability)) {
      for (const { pattern, handler } of group.events) {
        eventBus.subscribe(pattern, handler, { moduleId: 'shift-control' });
      }
      logger.info('ShiftControl', `Subscribed to ${group.capability} events`);
    }
  }
}
```

#### ✅ Ventajas

- ✅ **Balance perfecto** → Declarativo pero simple
- ✅ **Agrupado lógicamente** → Fácil ver qué eventos van juntos
- ✅ **Menos boilerplate** → No necesita strategy classes
- ✅ **Fácil de leer** → Estructura clara

---

## 🎯 RECOMENDACIÓN FINAL

### **Opción C: Hybrid (Declarative + Grouped)** 🏆

**Por qué**:
1. ✅ **Más simple** que Strategy Pattern (menos boilerplate)
2. ✅ **Más organizado** que If-Capability
3. ✅ **Ya se usa en el proyecto** (Mobile module tiene patrón similar)
4. ✅ **Balance ideal** entre simplicidad y mantenibilidad

---

## 📐 ESTRUCTURA DE ARCHIVOS PROPUESTA

```
src/modules/shift-control/
├── manifest.tsx
├── subscriptions/
│   ├── index.ts                    ← Export all event groups
│   ├── cashEvents.ts                ← CASH_EVENTS group
│   ├── staffEvents.ts               ← STAFF_EVENTS group
│   ├── appointmentEvents.ts         ← APPOINTMENT_EVENTS group
│   ├── assetEvents.ts               ← ASSET_EVENTS group
│   ├── mobileEvents.ts              ← MOBILE_EVENTS group
│   └── subscriptionEngine.ts        ← registerEventGroups() function
├── handlers/
│   ├── cashHandlers.ts              ← handleCashSessionOpened, etc.
│   ├── staffHandlers.ts
│   ├── appointmentHandlers.ts
│   └── ...
└── store/
    └── shiftStore.ts
```

### Código Final

```typescript
// src/modules/shift-control/subscriptions/index.ts
export { CASH_EVENTS } from './cashEvents';
export { STAFF_EVENTS } from './staffEvents';
export { APPOINTMENT_EVENTS } from './appointmentEvents';
export { ASSET_EVENTS } from './assetEvents';
export { MOBILE_EVENTS } from './mobileEvents';
export { registerEventGroups } from './subscriptionEngine';

// src/modules/shift-control/manifest.tsx
import { registerEventGroups } from './subscriptions';
import {
  CASH_EVENTS,
  STAFF_EVENTS,
  APPOINTMENT_EVENTS,
  ASSET_EVENTS,
  MOBILE_EVENTS
} from './subscriptions';

export const shiftControlManifest: ModuleManifest = {
  id: 'shift-control',
  // ...

  setup: async (registry) => {
    const { eventBus } = await import('@/lib/events');
    const { hasCapability } = useCapabilityStore.getState();

    // ✅ Una sola función, configuración declarativa
    registerEventGroups(
      [
        CASH_EVENTS,
        STAFF_EVENTS,
        APPOINTMENT_EVENTS,
        ASSET_EVENTS,
        MOBILE_EVENTS
      ],
      eventBus,
      hasCapability
    );

    logger.info('ShiftControl', '✅ Event subscriptions configured');
  }
};
```

---

## ✅ CRITERIOS DE VALIDACIÓN

### Código BUENO ✅

- [ ] Suscripciones definidas como data (declarative)
- [ ] Agrupadas lógicamente por capability
- [ ] Fácil agregar/quitar eventos
- [ ] Testeable (test el array)
- [ ] Auto-documentado
- [ ] Separación de concerns (config vs lógica)

### Código MALO ❌

- [ ] 30+ bloques if anidados
- [ ] Lógica condicional mezclada con setup
- [ ] Handlers inline (funciones anónimas gigantes)
- [ ] Hard-coded checks everywhere
- [ ] Imposible testear sin mocks complejos

---

## 📚 REFERENCIAS

### Investigación
- [Solace: Event-Driven Architecture Patterns](https://solace.com/event-driven-architecture-patterns/)
- [Microsoft: Event-Driven Architecture](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven)
- [TypeScript Event Bus Implementation](https://luixaviles.com/2021/07/how-to-implement-event-bus-typescript/)
- [Event Sourcing Anti-Patterns - InfoQ](https://www.infoq.com/news/2016/04/event-sourcing-anti-pattern/)

### Código del Proyecto
- `src/modules/mobile/manifest.tsx` (líneas 90-126)
- `src/lib/events/EventBus.ts`

---

**Documento creado por**: Claude Code
**Estado**: ✅ Recomendación final: Opción C (Hybrid)
**Última actualización**: 2025-01-26
