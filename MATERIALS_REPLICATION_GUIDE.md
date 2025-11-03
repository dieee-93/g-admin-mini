# 📘 MATERIALS MODULE - REPLICATION GUIDE

**Version**: 1.0.0
**Date**: 2025-01-31
**Status**: Production Ready ✅

---

## 🎯 PURPOSE

This guide provides a **step-by-step blueprint** for replicating the Materials module's architectural excellence in other modules (Sales, Production, Scheduling, Staff, etc.).

Materials module achieved **A+ (98/100)** by implementing all 10 architectural patterns correctly. Use this guide to achieve the same quality in your module.

---

## 📋 PRE-REQUISITES CHECKLIST

Before starting, ensure your module has:

- [ ] Database tables created with RLS policies
- [ ] Basic CRUD operations working (inventoryApi equivalent)
- [ ] Zustand store configured (materialsStore equivalent)
- [ ] Basic page component (page.tsx)
- [ ] Module manifest stub (manifest.tsx)

---

## 🏗️ REPLICATION STEPS (10 PHASES)

### PHASE 1: PERMISSIONS SYSTEM (2 hours)

#### 1.1. Add Permissions to Manifest Hooks

**File**: `src/modules/[your-module]/manifest.tsx`

**Pattern**:
```typescript
registry.addAction(
  'hook.name',
  () => <YourComponent />,
  'your-module',
  priority,
  { requiredPermission: { module: 'your-module', action: 'read' } } // ✅ ADD THIS
);
```

**Apply to ALL hooks in your manifest** (dashboard.widgets, row.actions, toolbar.actions, etc.)

**Permissions mapping**:
- `action: 'read'` → View data (widgets, metrics, lists)
- `action: 'create'` → Add new records (buttons, forms)
- `action: 'update'` → Modify records (edit, bulk ops)
- `action: 'delete'` → Remove records (delete buttons)
- `action: 'export'` → Export data (reports, CSV)
- `action: 'configure'` → Settings (sync, config)

**Example from Materials** (manifest.tsx:144):
```typescript
registry.addAction(
  'dashboard.widgets',
  () => <InventoryWidget key="inventory-widget" />,
  'materials',
  8,
  { requiredPermission: { module: 'materials', action: 'read' } } // ✅
);
```

---

#### 1.2. Add Permissions to Grid Component

**File**: `src/pages/admin/.../components/[YourModule]Grid.tsx`

**Pattern**:
```typescript
import { useAuth } from '@/contexts/AuthContext';

export const YourModuleGrid = ({ onEdit, onView, onDelete }) => {
  // ✅ Add permission checks
  const { canPerformAction } = useAuth();
  const canUpdate = canPerformAction('your-module', 'update');
  const canDelete = canPerformAction('your-module', 'delete');

  return (
    <div>
      {/* View always visible (read permission) */}
      <Button onClick={() => onView(item)}>Ver</Button>

      {/* Edit only if canUpdate */}
      {canUpdate && (
        <Button onClick={() => onEdit(item)}>Editar</Button>
      )}

      {/* Delete only if canDelete */}
      {canDelete && (
        <Button onClick={() => onDelete(item)}>Eliminar</Button>
      )}

      {/* HookPoint auto-filters by permissions */}
      <HookPoint name="your-module.row.actions" data={{ item }} />
    </div>
  );
};
```

**Example from Materials** (MaterialsGrid.tsx:27-30, 151-164)

**Test**:
- ADMINISTRADOR → 3 buttons (View, Edit, Delete)
- SUPERVISOR → 2 buttons (View, Edit)
- OPERADOR → 1 button (View)

---

#### 1.3. Add Permissions to Actions Component

**File**: `src/pages/admin/.../components/[YourModule]Actions.tsx`

**Pattern**:
```typescript
interface YourModuleActionsProps {
  onAdd?: () => void;
  onBulkOps?: () => void;
  onExport?: () => Promise<void>;
  onSync?: () => Promise<void>;
  permissions?: {
    canCreate: boolean;
    canUpdate: boolean;
    canExport: boolean;
    canConfigure: boolean;
  };
}

export function YourModuleActions({ permissions, ...handlers }) {
  // Don't render if no permissions
  if (!permissions.canCreate && !permissions.canUpdate && !permissions.canExport) {
    return null;
  }

  return (
    <Section title="Acciones Rápidas">
      {permissions.canCreate && onAdd && (
        <Button onClick={onAdd}>Agregar</Button>
      )}
      {permissions.canUpdate && onBulkOps && (
        <Button onClick={onBulkOps}>Operaciones Masivas</Button>
      )}
      {permissions.canExport && onExport && (
        <Button onClick={onExport}>Exportar</Button>
      )}
    </Section>
  );
}
```

**Example from Materials** (MaterialsActions.tsx:29-60)

---

#### 1.4. Pass Permissions from Page

**File**: `src/pages/admin/.../page.tsx`

**Pattern**:
```typescript
import { usePermissions } from '@/hooks/usePermissions';

export default function YourModulePage() {
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canExport,
    canConfigure
  } = usePermissions('your-module');

  return (
    <YourModuleActions
      onAdd={canCreate ? handleAdd : undefined}
      onBulkOps={canUpdate ? handleBulkOps : undefined}
      onExport={canExport ? handleExport : undefined}
      permissions={{ canCreate, canUpdate, canExport, canConfigure }}
    />
  );
}
```

**Example from Materials** (page.tsx:82-89, 321-326)

---

### PHASE 2: EVENTBUS EMISSIONS (3 hours)

#### 2.1. Identify Operations That Should Emit Events

**Ask yourself**: What operations in my module would OTHER modules care about?

**Common patterns**:
- `[module].[entity].created` → New record added
- `[module].[entity].updated` → Record modified
- `[module].[entity].deleted` → Record removed
- `[module].[status].changed` → Status/state change
- `[module].[action].completed` → Operation finished

**Example from Materials**:
- `materials.material_created` → Production updates recipes
- `materials.material_deleted` → Sales removes from POS
- `materials.stock_updated` → Dashboard updates metrics
- `materials.low_stock_alert` → Procurement creates PO

---

#### 2.2. Add Event Emissions to Service Layer

**File**: `src/pages/admin/.../services/[yourModule]Api.ts`

**Import EventBus**:
```typescript
import EventBus from '@/lib/events';
import { logger } from '@/lib/logging';
```

**Pattern for CREATE**:
```typescript
async create(item: YourItem, user: AuthUser): Promise<YourItem> {
  // Validate permissions
  requirePermission(user, 'your-module', 'create');

  // Perform operation
  const result = await supabase
    .from('your_table')
    .insert([item])
    .select()
    .single();

  if (result.error) throw result.error;

  // Invalidate cache
  invalidateCache();

  // ✅ EMIT EVENT
  EventBus.emit('your-module.entity.created', {
    entityId: result.data.id,
    entityName: result.data.name,
    userId: user.id,
    timestamp: Date.now()
  });

  logger.debug('YourModule', '📢 Emitted entity.created event', {
    entityId: result.data.id
  });

  return result.data;
}
```

**Example from Materials** (inventoryApi.ts:100-117)

---

**Pattern for UPDATE**:
```typescript
async update(id: string, updates: Partial<YourItem>, user: AuthUser): Promise<YourItem> {
  requirePermission(user, 'your-module', 'update');

  const result = await supabase
    .from('your_table')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (result.error) throw result.error;

  // ✅ EMIT EVENT
  EventBus.emit('your-module.entity.updated', {
    entityId: id,
    entityName: result.data.name,
    updatedFields: Object.keys(updates),
    updates,
    userId: user.id,
    timestamp: Date.now()
  });

  logger.debug('YourModule', '📢 Emitted entity.updated event');

  return result.data;
}
```

**Example from Materials** (inventoryApi.ts:301-314)

---

**Pattern for DELETE**:
```typescript
async delete(id: string): Promise<void> {
  // Get entity info BEFORE deletion
  const { data: entity } = await supabase
    .from('your_table')
    .select('id, name, type')
    .eq('id', id)
    .single();

  // Perform deletion
  const { error } = await supabase
    .from('your_table')
    .delete()
    .eq('id', id);

  if (error) throw error;

  // ✅ EMIT EVENT
  EventBus.emit('your-module.entity.deleted', {
    entityId: id,
    entityName: entity?.name || 'Unknown',
    entityType: entity?.type,
    timestamp: Date.now()
  });

  logger.debug('YourModule', '📢 Emitted entity.deleted event');
}
```

**Example from Materials** (inventoryApi.ts:379-393)

---

#### 2.3. Add Alert Events (If Applicable)

**File**: Smart alerts engine or business logic service

**Pattern**:
```typescript
// When detecting critical condition
if (item.value < item.threshold) {
  const severity = item.value === 0 ? 'critical' : 'warning';

  // ✅ EMIT ALERT EVENT
  EventBus.emit('your-module.alert_triggered', {
    itemId: item.id,
    itemName: item.name,
    currentValue: item.value,
    threshold: item.threshold,
    severity,
    recommendedAction: 'Take action immediately',
    timestamp: Date.now()
  });

  logger.debug('YourModule', '📢 Emitted alert event', { severity });
}
```

**Example from Materials** (smartAlertsEngine.ts:265-279, 347-361)

---

### PHASE 3: EVENTBUS CONSUMPTIONS (2 hours)

#### 3.1. Identify Events Your Module Should React To

**Ask yourself**: What events from OTHER modules should trigger actions in my module?

**Common patterns**:
- `sales.order_placed` → Reserve inventory
- `sales.completed` → Deduct stock
- `production.order.completed` → Add produced goods
- `supplier_orders.received` → Update inventory

---

#### 3.2. Configure Module Event Handlers

**File**: `src/pages/admin/.../page.tsx`

**Pattern**:
```typescript
// ✅ MODULE CONFIGURATION
const YOUR_MODULE_CONFIG = {
  capabilities: ['cap1', 'cap2'],
  events: {
    emits: [
      'your-module.entity.created',
      'your-module.entity.updated',
      'your-module.entity.deleted',
      'your-module.alert_triggered'
    ],
    listens: [
      'other-module.event1',  // React to external event
      'other-module.event2',
      'other-module.event3'
    ]
  },
  eventHandlers: {
    'other-module.event1': async (data: Record<string, unknown>) => {
      logger.info('YourModule', 'Reacting to event1...', data);

      // Perform action (update database, emit new event, etc.)
      const itemId = data.itemId as string;
      await yourModuleApi.updateRelated(itemId, data);
    },

    'other-module.event2': (data: Record<string, unknown>) => {
      logger.info('YourModule', 'Reacting to event2...', data);
      // Handle event
    },

    'other-module.event3': (data: Record<string, unknown>) => {
      logger.debug('YourModule', 'Reacting to event3...', data);
      // Handle event
    }
  }
} as const;
```

**Example from Materials** (page.tsx:51-115)

---

#### 3.3. Subscribe to Events in useEffect

**Pattern**:
```typescript
useEffect(() => {
  logger.debug('YourModule', '📡 Subscribing to cross-module events...');

  const unsubscribers = [
    // Subscribe to all events
    EventBus.on('other-module.event1', YOUR_MODULE_CONFIG.eventHandlers['other-module.event1']),
    EventBus.on('other-module.event2', YOUR_MODULE_CONFIG.eventHandlers['other-module.event2']),
    EventBus.on('other-module.event3', YOUR_MODULE_CONFIG.eventHandlers['other-module.event3'])
  ];

  logger.info('YourModule', `✅ Subscribed to ${unsubscribers.length} events`);

  return () => {
    logger.debug('YourModule', '🔌 Unsubscribing from events...');
    unsubscribers.forEach(unsub => unsub());
  };
}, []);
```

**Example from Materials** (page.tsx:156-182)

---

### PHASE 4: CROSS-MODULE HOOK INJECTIONS (3 hours)

#### 4.1. Identify Where Your Module Should Inject

**Ask yourself**: What buttons/widgets/actions from my module would be useful in OTHER modules?

**Common injection points**:
- `dashboard.widgets` → Summary widget
- `dashboard.top_alerts` → Critical alerts
- `[other-module].toolbar.actions` → Quick action buttons
- `[other-module].row.actions` → Row-level actions
- `[other-module].top_metrics` → Metric cards
- `reporting.data_sources` → Data for reports

---

#### 4.2. Inject into Dashboard

**File**: `src/modules/[your-module]/manifest.tsx`

**Pattern - Widget Component**:
```typescript
// Create widget component FIRST
// File: src/pages/admin/.../components/YourModuleWidget.tsx

export const YourModuleWidget: React.FC = () => {
  const { items, loading } = useYourModuleStore();

  if (loading) return <LoadingSkeleton />;

  const totalItems = items.length;
  const criticalCount = items.filter(i => i.status === 'critical').length;

  return (
    <Stack gap="3" p="4" bg="blue.50" borderRadius="md">
      <Stack direction="row" align="center" justify="space-between">
        <Icon icon={YourIcon} />
        <Badge>{totalItems} items</Badge>
      </Stack>
      <Text fontSize="lg" fontWeight="bold">{criticalCount} Critical</Text>
    </Stack>
  );
};
```

**Pattern - Register Hook**:
```typescript
// In manifest.tsx setup():

const { YourModuleWidget } = await import(
  '../pages/admin/.../components/YourModuleWidget'
);

registry.addAction(
  'dashboard.widgets',
  () => <YourModuleWidget key="your-module-widget" />,
  'your-module',
  8, // Priority (lower = earlier)
  { requiredPermission: { module: 'your-module', action: 'read' } }
);

logger.debug('App', 'Registered dashboard.widgets hook');
```

**Example from Materials** (manifest.tsx:127-147, InventoryWidget.tsx)

---

#### 4.3. Inject into Other Module's Toolbar

**Pattern**:
```typescript
registry.addAction(
  'other-module.toolbar.actions',
  (data) => {
    return (
      <Button
        key="your-action-button"
        size="sm"
        variant="outline"
        colorPalette="purple"
        onClick={() => {
          // Perform action (navigate, open modal, show data)
          toaster.create({
            title: 'Action Triggered',
            description: 'Your module action executed',
            type: 'info'
          });
        }}
      >
        <Icon icon={YourIcon} size="xs" />
        Your Action
      </Button>
    );
  },
  'your-module',
  80, // Priority
  { requiredPermission: { module: 'your-module', action: 'read' } }
);

logger.debug('App', 'Registered other-module.toolbar.actions hook');
```

**Example from Materials** (manifest.tsx:421-449 - production.toolbar.actions)

---

#### 4.4. Inject with API Call

**Pattern** (calling your module's public API):
```typescript
registry.addAction(
  'sales.order.actions',
  (data) => {
    const { order } = data || {};
    if (!order) return null;

    return (
      <Button
        key="your-module-check"
        onClick={async () => {
          try {
            // ✅ Call your module's API
            const yourModuleAPI = registry.getExports<YourModuleAPI>('your-module');
            const result = await yourModuleAPI.checkSomething(order.id);

            toaster.create({
              title: result.success ? '✅ Success' : '⚠️ Warning',
              description: result.message,
              type: result.success ? 'success' : 'warning'
            });
          } catch (error) {
            logger.error('YourModule', 'Error checking', error);
            toaster.create({
              title: '❌ Error',
              description: 'Could not complete check',
              type: 'error'
            });
          }
        }}
      >
        Check Something
      </Button>
    );
  },
  'your-module',
  12,
  { requiredPermission: { module: 'your-module', action: 'read' } }
);
```

**Example from Materials** (manifest.tsx:359-428 - sales.order.actions with checkOrderStockAvailability)

---

### PHASE 5: PUBLIC API EXPORTS (1 hour)

#### 5.1. Define API Methods

**File**: `src/modules/[your-module]/manifest.tsx`

**Pattern**:
```typescript
exports: {
  /**
   * Get entity by ID
   */
  getEntity: async (entityId: string) => {
    logger.debug('YourModule', 'Getting entity', { entityId });

    const { supabase } = await import('@/lib/supabase/client');
    const { data, error } = await supabase
      .from('your_table')
      .select('*')
      .eq('id', entityId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Check condition for entity
   */
  checkCondition: async (entityId: string) => {
    logger.debug('YourModule', 'Checking condition', { entityId });

    // Business logic
    const entity = await this.getEntity(entityId);
    const meetsCondition = entity.value > entity.threshold;

    return {
      meetsCondition,
      currentValue: entity.value,
      threshold: entity.threshold
    };
  },

  /**
   * Perform complex operation
   */
  performOperation: async (params: OperationParams) => {
    logger.debug('YourModule', 'Performing operation', params);

    try {
      // Complex business logic
      const result = await complexOperation(params);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error('YourModule', 'Operation failed', error);
      return {
        success: false,
        error: String(error)
      };
    }
  }
}
```

**Example from Materials** (manifest.tsx:491-584)

---

#### 5.2. Define TypeScript Interface

**Pattern**:
```typescript
/**
 * Your Module public API types
 */
export interface YourModuleAPI {
  getEntity: (entityId: string) => Promise<YourEntity>;

  checkCondition: (entityId: string) => Promise<{
    meetsCondition: boolean;
    currentValue: number;
    threshold: number;
  }>;

  performOperation: (params: OperationParams) => Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
  }>;
}
```

**Example from Materials** (manifest.tsx:617-644)

---

### PHASE 6: DOCUMENTATION (2 hours)

#### 6.1. Update README.md

**File**: `src/modules/[your-module]/README.md`

**Add section** (after Core Functionality):
```markdown
---

## 🏗️ ARCHITECTURAL PATTERNS APPLIED

Este módulo implementa todos los patrones arquitectónicos de G-Admin Mini.

### 1️⃣ Module Registry + Hook System

**Pattern**: Extensibilidad tipo WordPress/VS Code

**Implementado**:
- ✅ X hooks registrados en `manifest.tsx`
- ✅ Prioridades asignadas correctamente
- ✅ Documentación inline explicando cada hook

**Ejemplo**:
\`\`\`typescript
// manifest.tsx línea XXX
registry.addAction(
  'hook.name',
  (data) => <Component />,
  'your-module',
  priority,
  { requiredPermission: { module: 'your-module', action: 'read' } }
);
\`\`\`

### 2️⃣ Permissions System (RBAC)

**Pattern**: Role-Based Access Control integrado

**Implementado**:
- ✅ X hooks con `requiredPermission` parameter
- ✅ Grid valida permisos antes de mostrar botones
- ✅ Filtrado automático en HookPoint

**Ejemplo**:
\`\`\`tsx
// YourGrid.tsx
const { canPerformAction } = useAuth();
const canUpdate = canPerformAction('your-module', 'update');

{canUpdate && <Button onClick={onEdit}>Editar</Button>}
\`\`\`

### 3️⃣ EventBus (Cross-Module Communication)

**Pattern**: Pub/Sub para comunicación desacoplada

**Implementado**:
- ✅ **PRODUCE** X eventos
  - \`your-module.entity.created\` → [Consumers]
  - \`your-module.entity.updated\` → [Consumers]

- ✅ **CONSUME** X eventos
  - \`other-module.event\` → [Action taken]

**Ejemplo Producer**:
\`\`\`typescript
// yourModuleApi.ts
EventBus.emit('your-module.entity.created', {
  entityId: id,
  entityName: name,
  timestamp: Date.now()
});
\`\`\`

**Ejemplo Consumer**:
\`\`\`typescript
// page.tsx
useEffect(() => {
  const unsub = EventBus.on('other-module.event', (data) => {
    // React to event
  });
  return () => unsub();
}, []);
\`\`\`

### 4️⃣-10️⃣ [Continue with other patterns...]

---

## 📚 Referencias Arquitectónicas

- **Module Registry Guide**: \`src/modules/README.md\`
- **EventBus v2 Spec**: \`docs/06-features/eventbus-system.md\`
- **Materials Reference**: \`src/modules/materials/README.md\`
```

**Example from Materials** (README.md:25-242)

---

#### 6.2. Update Manifest Hooks Metadata

**File**: `src/modules/[your-module]/manifest.tsx`

**Pattern**:
```typescript
hooks: {
  /**
   * Hooks this module PROVIDES (Injects into other modules)
   */
  provide: [
    'your-module.entity.created',     // Event: Entity created
    'your-module.entity.updated',     // Event: Entity updated
    'your-module.entity.deleted',     // Event: Entity deleted
    'your-module.alert_triggered',    // Event: Alert condition met
    'your-module.row.actions',        // Hook: Grid row actions
    'dashboard.widgets',              // Hook: Dashboard widget
    'other-module.toolbar.actions',   // Hook: Toolbar button
  ],

  /**
   * Events/Hooks this module CONSUMES (Listens to other modules)
   */
  consume: [
    'other-module.event1',            // Description of what we do
    'other-module.event2',            // Description
    'other-module.event3',            // Description
  ],
},
```

**Example from Materials** (manifest.tsx:89-121)

---

### PHASE 7: VALIDATION & TESTING (1 hour)

#### 7.1. TypeScript Validation

```bash
pnpm -s exec tsc --noEmit
```

**Expected**: 0 errors ✅

**Common issues**:
- Missing type imports
- Incorrect event payload types
- Missing required props

---

#### 7.2. ESLint Validation

```bash
pnpm -s exec eslint src/modules/[your-module]/ src/pages/admin/.../[your-module]/
```

**Expected**: 0 errors ✅

**Common issues**:
- Unused imports
- Missing dependencies in useEffect
- Console.log statements (use logger instead)

---

#### 7.3. Manual Testing Checklist

**Permissions**:
- [ ] Login as OPERADOR → Limited actions visible
- [ ] Login as SUPERVISOR → More actions visible
- [ ] Login as ADMINISTRADOR → All actions visible

**EventBus**:
- [ ] Trigger action in your module → Check console for emitted event
- [ ] Trigger action in other module → Check console for your module reacting

**Cross-Module Hooks**:
- [ ] Navigate to Dashboard → See your widget
- [ ] Navigate to other module → See your injected button/action

**Public API**:
- [ ] From browser console: Test registry.getExports('your-module')
- [ ] Verify API methods are accessible and work

---

### PHASE 8: PERFORMANCE OPTIMIZATION (Optional, 1 hour)

#### 8.1. Lazy Load Heavy Components

**Pattern**:
```typescript
// In manifest.tsx setup()
const { HeavyComponent } = await import(
  '../pages/admin/.../components/HeavyComponent'
);
```

#### 8.2. Add Caching to API Calls

**Pattern**:
```typescript
import { CacheService } from './cacheService';

async getItems() {
  const cacheKey = CacheService.generateKey('getItems', { filters });

  return CacheService.withCache(
    cacheKey,
    () => supabase.from('table').select(),
    3 * 60 * 1000 // 3 min TTL
  );
}
```

#### 8.3. Use Performance Monitor

**Pattern**:
```typescript
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';

const { shouldReduceAnimations } = usePerformanceMonitor();

// Pass to components
<YourComponent performanceMode={shouldReduceAnimations} />
```

---

## 📊 QUALITY CHECKLIST

After completing all phases, verify:

### Architecture (10/10)
- [ ] Module Registry + Hook System implemented
- [ ] Permissions System (RBAC) integrated
- [ ] EventBus emissions configured
- [ ] EventBus consumptions configured
- [ ] Cross-module injections working
- [ ] Public API exports defined
- [ ] Feature-based activation configured
- [ ] Real-time sync enabled (if applicable)
- [ ] Offline-first support (if applicable)
- [ ] Performance optimizations applied

### Code Quality (6/6)
- [ ] TypeScript compiles with 0 errors
- [ ] ESLint passes with 0 errors
- [ ] All hooks have `requiredPermission`
- [ ] All event emissions have proper payloads
- [ ] All components have permission gates
- [ ] Documentation complete in README.md

### Integration (4/4)
- [ ] Injects into at least 2 other modules
- [ ] Consumes events from at least 2 other modules
- [ ] Public API has at least 3 methods
- [ ] Manual testing completed successfully

### Score Calculation
- **90-100**: A+ (Excellent, production ready)
- **80-89**: A (Very good, minor improvements needed)
- **70-79**: B (Good, some refactoring recommended)
- **60-69**: C (Acceptable, significant improvements needed)
- **<60**: D/F (Needs major refactoring)

---

## 🎯 COMMON PITFALLS TO AVOID

### ❌ DON'T:
1. Skip permissions on any hook (security risk)
2. Emit events without proper payload structure
3. Subscribe to events without cleanup (memory leak)
4. Call registry.getExports() outside try-catch (crashes)
5. Hardcode module names in event patterns (use constants)
6. Skip TypeScript validation (runtime errors)
7. Forget to update hooks metadata in manifest
8. Use direct imports between modules (breaks isolation)

### ✅ DO:
1. Add `requiredPermission` to EVERY hook registration
2. Use consistent event naming: `module.entity.action`
3. Always cleanup EventBus subscriptions in useEffect
4. Wrap API calls in try-catch with proper error handling
5. Define event payloads in TypeScript interfaces
6. Run TypeScript + ESLint before committing
7. Document every hook in manifest comments
8. Use Module Registry exports for cross-module calls

---

## 🚀 QUICK START TEMPLATE

**Copy-paste starter** (replace YOUR_MODULE):

```typescript
// src/modules/YOUR_MODULE/manifest.tsx
import React from 'react';
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';

export const yourModuleManifest: ModuleManifest = {
  id: 'YOUR_MODULE',
  name: 'Your Module Name',
  version: '1.0.0',
  depends: [],
  autoInstall: false,
  requiredFeatures: ['your_feature_id'] as FeatureId[],
  minimumRole: 'OPERADOR' as const,
  optionalFeatures: [] as FeatureId[],

  hooks: {
    provide: [
      'YOUR_MODULE.entity.created',
      'YOUR_MODULE.entity.updated',
      'YOUR_MODULE.entity.deleted',
      'YOUR_MODULE.row.actions',
      'dashboard.widgets',
    ],
    consume: [
      'sales.completed',
      'production.order.completed',
    ],
  },

  setup: async (registry) => {
    logger.info('App', '📦 Setting up YOUR_MODULE module');

    try {
      // Hook 1: Dashboard Widget
      registry.addAction(
        'dashboard.widgets',
        () => <YourWidget key="your-widget" />,
        'YOUR_MODULE',
        8,
        { requiredPermission: { module: 'YOUR_MODULE', action: 'read' } }
      );

      logger.info('App', '✅ YOUR_MODULE module setup complete');
    } catch (error) {
      logger.error('App', '❌ YOUR_MODULE module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down YOUR_MODULE module');
  },

  exports: {
    getEntity: async (id: string) => {
      logger.debug('YOUR_MODULE', 'Getting entity', { id });
      return { id, name: 'Entity' };
    },
  },

  metadata: {
    category: 'business',
    description: 'Your module description',
    author: 'G-Admin Team',
    tags: ['tag1', 'tag2'],
    navigation: {
      route: '/admin/YOUR_MODULE',
      icon: YourIcon,
      color: 'blue',
      domain: 'your-domain',
      isExpandable: false
    }
  },
};

export default yourModuleManifest;
```

---

## 📞 SUPPORT & RESOURCES

**Reference Implementations**:
- 🥇 **Materials** (Gold Standard) - `src/modules/materials/`
- 📚 **Materials README** - Complete patterns documentation
- 🎯 **CLAUDE.md** - Architecture overview

**Documentation**:
- Module Registry: `src/modules/README.md`
- EventBus v2: `docs/06-features/eventbus-system.md`
- Permissions: `src/config/PermissionsRegistry.ts`

**Testing**:
- Use MATERIALS_TESTING_PROMPT.md (next document)

---

**END OF REPLICATION GUIDE**

🎯 Follow these steps to achieve Materials-level quality (A+ 98/100) in any module!
