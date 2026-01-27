# ShiftControl Architecture - Research & Analysis

**Fecha**: 2025-01-26
**Estado**: 🔍 INVESTIGATION COMPLETE
**Tarea**: Determinar el patrón correcto para event subscriptions en ShiftControl

---

## 📋 CONTEXTO

### El Problema

Al diseñar ShiftControl, necesitamos decidir cómo suscribirse a eventos de forma condicional según capabilities activas:

```typescript
// ❓ ¿Cuál es la manera CORRECTA de hacerlo?

// Opción 1: If simple (como mobile module)
if (hasCapability('physical_products')) {
  eventBus.subscribe('cash.session.opened', handler);
}

// Opción 2: Hybrid Declarative + Grouped
const CASH_EVENTS = {
  capability: 'physical_products',
  events: [
    { pattern: 'cash.session.opened', handler: handleCashSessionOpened }
  ]
};

// Opción 3: ???
```

### Preocupaciones del Usuario

1. ✅ El patrón `if (hasCapability('physical_products'))` está presente en mobile module, **PERO** pudo haber sido escrito sin análisis profundo
2. ✅ La arquitectura del proyecto es **PARTICULAR** (capabilities combinables, 8+ capabilities diferentes)
3. ✅ Se debe evitar `if (hasCapability('A') && hasCapability('B'))` porque es difícil de mantener
4. ✅ El proyecto usa **HookRegistry** para inyección de contenido (no conditional renders)
5. ❌ **NO está claro** si el patrón Hybrid es correcto para este proyecto específico

---

## 🔍 INVESTIGACIÓN EN EL CÓDIGO

### 1. Arquitectura de Capabilities

**Archivo**: `src/store/capabilityStore.ts`

```typescript
// Layer 1: User Choices
selectedCapabilities: BusinessCapabilityId[]
selectedInfrastructure: InfrastructureId[]

// Layer 2: System Features (auto-activadas)
activeFeatures: FeatureId[]

// Computed getter (no state)
getActiveModules(): string[]
```

**Hallazgo Clave**:
- ✅ Features se **calculan** desde capabilities vía `FeatureActivationEngine`
- ✅ Modules se **derivan** desde features vía `getModulesForActiveFeatures()`
- ✅ **NO hay hasCapability() directo** - se usa `hasFeature()`

### 2. Sistema de Hooks (HookRegistry)

**Archivos**: `src/lib/modules/ModuleRegistry.ts`, `src/lib/modules/HookPoint.tsx`

**Patrón usado**:
```typescript
// En manifest.tsx
setup: async (registry) => {
  registry.addAction('dashboard.widgets', () => <MyWidget />, 'myModule', 10);
}

// En componente
<HookPoint name="dashboard.widgets" data={{ userId }} />
```

**Hallazgo Clave**:
- ✅ **Filtrado automático** por permissions (`requiredPermission` en context)
- ✅ **Priority-based execution** (orden de renders)
- ✅ **NO requiere conditional checks** en el código - el registry filtra
- ✅ Inspirado en WordPress, VSCode, Odoo

### 3. EventBus Actual

**Archivo**: `src/lib/events/EventBus.ts`

```typescript
eventBus.subscribe(pattern, handler, {
  moduleId: 'myModule',
  priority: EventPriority.HIGH
});
```

**Hallazgo Clave**:
- ✅ Soporta metadata (`moduleId`, `priority`)
- ❌ **NO soporta conditional filtering nativo**
- ❌ Cada módulo debe validar manualmente con `if (hasCapability)`

---

## 🌐 INVESTIGACIÓN EN INTERNET

### 1. VSCode Extension Architecture

**Fuente**: [VSCode Activation Events](https://code.visualstudio.com/api/references/activation-events)

**Patrón**:
```json
// package.json
{
  "activationEvents": [
    "onLanguage:typescript",
    "onCommand:myExtension.doSomething",
    "workspaceContains:**/.git"
  ]
}
```

**Lecciones**:
- ✅ **Declarative activation** (no código imperative)
- ✅ **Pattern matching** en configuración
- ✅ Extensions **NO controlan** cuándo se activan - VSCode lo hace
- ⚠️ Limitación: [GitHub Issue #31777](https://github.com/Microsoft/vscode/issues/31777) - piden conditional activation más granular

---

### 2. WordPress Hook System

**Fuente**: [WordPress Event-Driven Engine](https://wpshout.com/wordpress-event-system-understanding-hooks/)

**Patrón**:
```php
// Plugin registra hook
add_action('save_post', 'my_handler', 10, 2); // priority: 10

// WordPress ejecuta
do_action('save_post', $post_id, $post);
```

**Lecciones**:
- ✅ **Publish-Subscribe pattern** (event bus)
- ✅ **NO hay conditional subscriptions** - cualquier plugin puede suscribirse
- ✅ Filtering se hace **DENTRO del handler** (`if (!current_user_can())`)
- ⚠️ Problema conocido: hooks globales pueden causar performance issues

**Best Practice** según [WordPress Plugin API](https://developer.wordpress.org/plugins/hooks/):
> The preferred lifecycle point for initiating hook bindings is during the `plugins_loaded` or `init` phase

---

### 3. Odoo Module System

**Fuente**: [Odoo Architecture](https://www.odoo.com/documentation/19.0/developer/tutorials/server_framework_101/01_architecture.html)

**Patrón**:
```python
# manifest.py
{
    'name': 'Sales Module',
    'depends': ['base', 'product'],
    'auto_install': False  # ← Conditional loading
}
```

**Automated Actions** (event triggers):
```python
# Trigger condition
if record.state == 'draft':
    # Action
```

**Lecciones**:
- ✅ **Module dependencies** declarativas
- ✅ **Automated Actions** = conditional event handlers
- ✅ Condition logic **EN el action definition**, no en código
- ✅ Similar al problema de G-Admin Mini (capabilities ≈ dependencies)

---

### 4. Enterprise Event-Driven Architecture

**Fuente**: [Solace EDA Guide](https://solace.com/what-is-event-driven-architecture/)

**Best Practice #1**:
> **A subscriber should subscribe only to the events it needs**

**Best Practice #2** (Topic-Based Filtering):
> Events are tagged with metadata called a "topic". The event broker takes care of delivery to systems that need it.

**Ejemplo**:
```
Topic: "sales.order.placed.{region}.{productType}"
Subscription: "sales.order.placed.us-east.*"
```

**Lecciones**:
- ✅ **Broker-side filtering** (no application-side)
- ✅ **Topic hierarchy** con wildcards
- ⚠️ G-Admin Mini usa `EventPattern` simple - no soporta wildcards nativamente

---

**Fuente**: [Microsoft Azure EDA](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven)

**Best Practice**:
> Subscriber registration can occur at: build time (hardcoded), initialization time (config files), or **runtime (dynamic subscriptions)**

**Lecciones**:
- ✅ **Declarative configuration** > Imperative code
- ✅ Separar **WHAT to subscribe** (data) de **HOW to subscribe** (logic)

---

### 5. NestJS Conditional Module Loading

**Fuente**: [NestJS ConditionalModule](https://stackoverflow.com/questions/69120748/nestjs-conditional-module-import)

**Patrón 2024**:
```typescript
import { ConditionalModule } from '@nestjs/config';

ConditionalModule.registerWhen(
  MyModule,
  (env) => env.get('FEATURE_FLAG') === 'true'
)
```

**Spread operator trick**:
```typescript
imports: [
  ...(process.env.NODE_ENV == 'dev' ? [DevModule] : [])
]
```

**Lecciones**:
- ✅ **Function-based conditional** (not hardcoded)
- ✅ Evaluation at **module registration time**
- ⚠️ Limitación: `register` se llama inmediatamente (issue #13710)

---

### 6. Multi-Tenant Event Bus (Azure)

**Fuente**: [Azure Service Bus Multi-Tenant](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/service/service-bus)

**Patrón**:
```typescript
// Topic subscription con filtro
subscription.filter = {
  subject: "orders.{tenant_id}"
};
```

**Lecciones**:
- ✅ **Subject-based filtering** en subscriptions
- ✅ Cada tenant tiene su propio **filter rule**
- ✅ El broker filtra automáticamente

---

## 📊 ANÁLISIS COMPARATIVO

### Proyectos Enterprise Similares

| Proyecto | Conditional Logic | Patrón | Similar a G-Admin |
|----------|------------------|--------|------------------|
| **VSCode** | Declarative (package.json) | Pattern matching | ⚠️ Parcial (no combinable capabilities) |
| **WordPress** | Imperative (`if` en handler) | Pub-Sub | ✅ Muy similar (plugins combinables) |
| **Odoo** | Declarative (manifest.py) | Dependency-based | ✅ Similar (módulos + dependencies) |
| **Azure Service Bus** | Broker-side (topic filters) | Subject filtering | ❌ No (requiere broker externo) |
| **NestJS** | Conditional imports | Function-based | ✅ Similar (feature flags) |

---

## 🎯 PATRÓN CORRECTO PARA G-ADMIN MINI

### Opción Evaluada: Hybrid (Declarative + Grouped)

**Ventajas**:
- ✅ Declarativo (data, no código)
- ✅ Agrupado lógicamente
- ✅ Fácil de testear (test array)

**Desventajas** (CRÍTICAS):
- ❌ **NO aprovecha la arquitectura existente** (HookRegistry)
- ❌ **Inconsistente** con el patrón de UI injection
- ❌ **Duplica lógica** de conditional filtering

---

### 🚨 PROBLEMA ARQUITECTÓNICO IDENTIFICADO

**El proyecto tiene DOS sistemas diferentes**:

1. **HookRegistry** (UI injection) ← Usa **automatic filtering**
2. **EventBus** (Data communication) ← Usa **manual filtering** (`if (hasCapability)`)

**Esto es inconsistente**:
```typescript
// UI: Filtrado automático ✅
registry.addAction('dashboard.widgets', () => <Widget />, 'sales', 10);
// No requiere if (hasFeature('sales_management'))

// EventBus: Filtrado manual ❌
if (hasCapability('physical_products')) {  // ← Manual check
  eventBus.subscribe('cash.session.opened', handler);
}
```

---

## 💡 PROPUESTA: EventBus con Capabilities Metadata

### Inspirado en: WordPress + Azure + VSCode

**Concepto**: Metadata-driven subscriptions con filtering automático

```typescript
// 1. Subscribe con metadata
eventBus.subscribe(
  'cash.session.opened',
  handleCashSessionOpened,
  {
    moduleId: 'shift-control',
    requiredCapabilities: ['physical_products'], // ← NEW
    priority: EventPriority.HIGH
  }
);

// 2. EventBus filtra automáticamente
class EventBus {
  emit(pattern, payload) {
    const subscribers = this.subscribers.get(pattern);

    subscribers.forEach(sub => {
      // ✅ Filtrado automático
      if (this.hasRequiredCapabilities(sub.context.requiredCapabilities)) {
        sub.handler(payload);
      }
    });
  }

  private hasRequiredCapabilities(required?: string[]): boolean {
    if (!required || required.length === 0) return true;

    const { hasFeature } = useCapabilityStore.getState();
    return required.every(cap => hasFeature(cap));
  }
}
```

**Ventajas**:
- ✅ **Consistente** con HookRegistry (ambos usan metadata)
- ✅ **Declarativo** (metadata, no `if`)
- ✅ **Centralizado** (lógica en EventBus, no dispersa)
- ✅ **Testeable** (mock EventBus filtering)
- ✅ **NO requiere** Hybrid pattern ni arrays de configuración

---

### Cómo se vería en ShiftControl

**Manifest simplificado**:
```typescript
// src/modules/shift-control/manifest.tsx

setup: async (registry) => {
  const { eventBus } = await import('@/lib/events');

  // Cash events (physical_products)
  eventBus.subscribe(
    'cash.session.opened',
    handleCashSessionOpened,
    {
      moduleId: 'shift-control',
      requiredCapabilities: ['physical_products']
    }
  );

  eventBus.subscribe(
    'cash.session.closed',
    handleCashSessionClosed,
    {
      moduleId: 'shift-control',
      requiredCapabilities: ['physical_products']
    }
  );

  // Staff events (almost all capabilities)
  eventBus.subscribe(
    'staff.employee.checked_in',
    handleStaffCheckIn,
    {
      moduleId: 'shift-control',
      requiredCapabilities: ['physical_products', 'professional_services', 'asset_rental']
      // Si ANY capability está activa, se suscribe
    }
  );

  // Tables events (physical_products + onsite_service)
  eventBus.subscribe(
    'tables.opened',
    handleTableOpened,
    {
      moduleId: 'shift-control',
      requiredCapabilities: ['physical_products', 'onsite_service'],
      requireAll: true  // ← Requiere AMBAS capabilities
    }
  );
}
```

**NO requiere**:
- ❌ Arrays de configuración (CASH_EVENTS, STAFF_EVENTS)
- ❌ Funciones de registro (registerEventGroups)
- ❌ Lógica de filtering manual
- ❌ Hybrid pattern

**Es simplemente**:
- ✅ Subscriptions directas con metadata
- ✅ EventBus filtra automáticamente
- ✅ Consistente con HookRegistry

---

## ⚖️ COMPARACIÓN FINAL

### Opción A: Hybrid (Declarative + Grouped) - PROPUESTA ANTERIOR

```typescript
// ❌ Requiere infraestructura adicional
const CASH_EVENTS = { capability: 'physical_products', events: [...] };
registerEventGroups([CASH_EVENTS, STAFF_EVENTS], eventBus, hasCapability);
```

**Pros**: Organizado, declarativo
**Cons**: Duplica lógica de filtering, inconsistente con HookRegistry, boilerplate

---

### Opción B: EventBus con Capabilities Metadata - NUEVA PROPUESTA

```typescript
// ✅ Usa infraestructura existente mejorada
eventBus.subscribe('cash.session.opened', handler, {
  requiredCapabilities: ['physical_products']
});
```

**Pros**: Consistente, centralizado, menos código
**Cons**: Requiere modificar EventBus.ts (pero es mejora universal)

---

## 🎬 RECOMENDACIÓN FINAL

### ✅ Implementar Opción B: EventBus con Capabilities Metadata

**Razones**:

1. **Consistencia Arquitectónica**
   - HookRegistry ya usa metadata filtering
   - EventBus debería hacer lo mismo

2. **Proyectos Enterprise lo usan**
   - WordPress: Filters en actions
   - Azure: Topic-based filtering
   - VSCode: Activation context

3. **Mejor Developer Experience**
   - Menos código para escribir
   - Menos archivos (no event groups)
   - Fácil de entender

4. **Mantenibilidad**
   - Lógica de filtering centralizada
   - Fácil agregar nuevas capabilities
   - Tests simples

---

## 📝 PRÓXIMOS PASOS

### 1. Modificar EventBus.ts

```typescript
// src/lib/events/EventBus.ts

export interface SubscriptionContext {
  moduleId?: string;
  priority?: EventPriority;
  requiredCapabilities?: string[];  // ← NEW
  requireAll?: boolean;             // ← NEW (default: false = ANY)
}

// En emit():
if (this.hasRequiredCapabilities(sub.context)) {
  sub.handler(event);
}
```

### 2. Implementar ShiftControl Manifest

Sin event groups, sin registerEventGroups, simplemente subscriptions directas con metadata.

### 3. Documentar Patrón

Actualizar `CROSS_MODULE_INTEGRATION_MAP.md` con este patrón como best practice.

---

## 📚 FUENTES

### Código del Proyecto
- `src/store/capabilityStore.ts` - Capability system
- `src/lib/modules/ModuleRegistry.ts` - Hook registry
- `src/lib/modules/HookPoint.tsx` - Hook filtering
- `src/lib/events/EventBus.ts` - Event bus implementation
- `docs/architecture-v2/deliverables/CROSS_MODULE_INTEGRATION_MAP.md`

### Investigación Online

**VSCode**:
- [Activation Events](https://code.visualstudio.com/api/references/activation-events)
- [Conditional Activation Issue](https://github.com/Microsoft/vscode/issues/31777)

**WordPress**:
- [WordPress Event System](https://wpshout.com/wordpress-event-system-understanding-hooks/)
- [Know the Code - Event-Driven Engine](https://knowthecode.io/series/wordpress-event-driven-engine)

**Odoo**:
- [Architecture Overview](https://www.odoo.com/documentation/19.0/developer/tutorials/server_framework_101/01_architecture.html)

**Enterprise EDA**:
- [Solace - Complete Guide to EDA](https://solace.com/what-is-event-driven-architecture/)
- [Microsoft - Event-Driven Architecture](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven)
- [AWS - Best Practices for EDA](https://aws.amazon.com/blogs/architecture/best-practices-for-implementing-event-driven-architectures-in-your-organization/)

**NestJS**:
- [Conditional Module Import](https://stackoverflow.com/questions/69120748/nestjs-conditional-module-import)
- [ConditionalModule Issue](https://github.com/nestjs/nest/issues/13710)

**Multi-Tenant Event Bus**:
- [node-ts/bus - Enterprise Service Bus](https://github.com/node-ts/bus)
- [Azure Service Bus Multi-Tenant](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/service/service-bus)

**TypeScript Event Bus**:
- [This Dot - Event Bus in TypeScript](https://www.thisdot.co/blog/how-to-implement-an-event-bus-in-typescript)

---

**Estado**: ✅ RESEARCH COMPLETE
**Conclusión**: EventBus con Capabilities Metadata es el patrón correcto
**Acción**: Esperando aprobación del usuario para proceder
