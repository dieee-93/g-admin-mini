# 🔄 Module Registry + Hook System - Migration Plan

**Version**: 1.0.0
**Date**: 2025-01-10
**Status**: Proposal - Pending Approval
**Impact**: High - Architectural Change

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current System Analysis](#current-system-analysis)
3. [Problems Identified](#problems-identified)
4. [Research & Validation](#research--validation)
5. [Proposed Solution](#proposed-solution)
6. [Migration Strategy](#migration-strategy)
7. [Implementation Examples](#implementation-examples)
8. [Risk Assessment](#risk-assessment)
9. [Decision Log](#decision-log)

---

## 🎯 Executive Summary

### Current State
G-Admin uses **Feature Flags** via `CapabilityGate` component for conditional rendering based on user-selected business capabilities. This works but has scalability concerns for cross-module interactions.

### Proposed State
Introduce **Module Registry + Hook System** (inspired by WordPress, VS Code, Odoo) to handle cross-module communication and reduce conditional rendering complexity.

### Key Benefits
- ✅ **Explicit dependencies** (no more guessing which features enable which buttons)
- ✅ **Reduced boilerplate** (no nested `<CapabilityGate>` in every component)
- ✅ **Better maintainability** (cross-module actions self-register via hooks)
- ✅ **Proven pattern** (WordPress: 60k plugins, VS Code: 40k extensions, Odoo: 30k modules)

### Migration Effort
- **Time**: 2-3 weeks
- **Complexity**: Medium
- **Risk**: Low (backwards compatible, gradual migration)

---

## 🔍 Current System Analysis

### How It Works Now

#### 1. User Selection Flow

```typescript
// src/pages/setup/steps/BusinessModelStep.tsx

// Usuario selecciona MÚLTIPLES capabilities:
const selectedCapabilities = [
  'onsite_service',      // Restaurant operations
  'requires_preparation', // Kitchen/Production
  'async_operations'     // E-commerce
];

// Al hacer click en "Continuar":
setCapabilities(selectedCapabilities); // Guarda en CapabilityStore
```

#### 2. Feature Activation

```typescript
// src/config/BusinessModelRegistry.ts

// Cada capability define features que activa:
const CAPABILITIES = {
  'onsite_service': {
    activatesFeatures: [
      'sales_order_management',
      'sales_pos_onsite',
      'sales_dine_in_orders',
      'operations_table_management',
      'inventory_stock_tracking'
    ]
  },

  'requires_preparation': {
    activatesFeatures: [
      'production_recipe_management',
      'production_kitchen_display',
      'inventory_purchase_orders',
      'inventory_supplier_management'
    ]
  },

  'async_operations': {
    activatesFeatures: [
      'sales_catalog_ecommerce',
      'sales_online_payment_gateway',
      'sales_cart_management',
      'analytics_ecommerce_metrics'
    ]
  }
};

// getActivatedFeatures() hace UNION (Set):
export function getActivatedFeatures(
  capabilities: BusinessCapabilityId[],
  infrastructure: InfrastructureId[]
): FeatureId[] {
  const features = new Set<FeatureId>();

  capabilities.forEach(capId => {
    const capability = CAPABILITIES[capId];
    capability.activatesFeatures.forEach(f => features.add(f));
  });

  // Resultado: Array ÚNICO de features (sin duplicados)
  return Array.from(features);
}
```

#### 3. Store Management

```typescript
// src/store/capabilityStore.ts

setCapabilities: (capabilities) => {
  // 1. Activar features
  const activationResult = FeatureActivationEngine.activateFeatures(
    capabilities,
    infrastructure,
    profile,
    {}
  );

  // 2. Guardar en state
  return {
    features: {
      activeFeatures: activationResult.activeFeatures, // ← Array de FeatureId
      activeModules: getModulesForActiveFeatures(...)  // ← Array de module names
    }
  };
}
```

#### 4. Component Conditional Rendering

```typescript
// ACTUAL - src/pages/admin/supply-chain/materials/components/MaterialRow.tsx

import { useCapabilities } from '@/store/capabilityStore';

function MaterialRow({ material }) {
  const { hasFeature } = useCapabilities();

  return (
    <tr>
      <td>{material.name}</td>
      <td>
        {/* Botón condicional - Kitchen */}
        {hasFeature('production_kitchen_display') && (
          <Button onClick={() => sendToKitchen(material)}>
            Use in Kitchen
          </Button>
        )}

        {/* Botón condicional - E-commerce */}
        {hasFeature('sales_catalog_ecommerce') && (
          <Button onClick={() => publishOnline(material)}>
            Publish Online
          </Button>
        )}

        {/* ⚠️ Problema: Si hay 10 capabilities, necesito 10 ifs aquí */}
      </td>
    </tr>
  );
}
```

### Current Architecture Diagram

```
┌─────────────────────────────────────────────┐
│  User Selection (Setup Wizard)             │
│  - Selecciona 3+ BusinessCapabilities       │
│  - Selecciona Infrastructure                │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  BusinessModelRegistry                      │
│  - getActivatedFeatures()                   │
│  - Union de todas las capabilities          │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  FeatureActivationEngine                    │
│  - Valida blocking requirements             │
│  - Retorna activeFeatures[]                 │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  CapabilityStore (Zustand)                  │
│  - features.activeFeatures: FeatureId[]     │
│  - features.activeModules: string[]         │
└────────────────┬────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────────┐
│ Navigation   │  │  UI Components   │
│ Filtering    │  │  <CapabilityGate>│
│              │  │  hasFeature()    │
└──────────────┘  └──────────────────┘
```

---

## ⚠️ Problems Identified

### Problem 1: Nested Conditional Complexity

**Current Code**:
```typescript
// materials/MaterialRow.tsx
function MaterialRow({ material }) {
  const { hasFeature } = useCapabilities();

  return (
    <tr>
      <td>{material.name}</td>
      <td>
        {/* ❌ Multiple ifs - difícil mantener */}
        {hasFeature('production_kitchen_display') && (
          <Button>Use in Kitchen</Button>
        )}
        {hasFeature('sales_catalog_ecommerce') && (
          <Button>Publish Online</Button>
        )}
        {hasFeature('sales_pos_onsite') && (
          <Button>Quick Sell</Button>
        )}
        {hasFeature('inventory_batch_lot_tracking') && (
          <Button>Track Batch</Button>
        )}
        {/* ⚠️ Con 10 capabilities → 10+ ifs aquí */}
      </td>
    </tr>
  );
}
```

**Issues**:
- ❌ Cada componente debe conocer TODAS las features disponibles
- ❌ Código duplicado en múltiples lugares
- ❌ Difícil rastrear "¿Qué feature habilita este botón?"
- ❌ Al agregar nueva capability → modificar múltiples componentes

### Problem 2: Implicit Dependencies

**Current State**:
```typescript
// ❌ IMPLÍCITO - No documentado
// Sales module necesita mostrar botón en Materials page
// pero Materials NO declara que acepta acciones de Sales

// materials/MaterialRow.tsx
{hasFeature('sales_pos_onsite') && (
  <Button onClick={() => {
    // Llama función de Sales module
    createQuickSale(material); // ← ¿De dónde viene esto?
  }}>
    Quick Sell
  </Button>
)}
```

**Issues**:
- ❌ Relación Materials ↔ Sales no está documentada
- ❌ Difícil debugging: "¿Qué módulos dependen de Materials?"
- ❌ Miedo a eliminar código: "¿Si quito esto, qué se rompe?"

### Problem 3: Performance - O(n) checks

**Current Implementation**:
```typescript
// src/store/capabilityStore.ts
hasFeature: (featureId) => {
  const { features } = get();
  return features.activeFeatures.includes(featureId); // ⚠️ O(n) lookup
}

// Cada <CapabilityGate> ejecuta esto:
<CapabilityGate capability="sales_pos_onsite"> {/* includes() */}
<CapabilityGate capability="inventory_tracking"> {/* includes() */}
<CapabilityGate capability="production_kitchen"> {/* includes() */}

// Con 58 CapabilityGates en 17 archivos → 58 × O(n) por render
```

**Issues**:
- ⚠️ `includes()` es O(n) - debería ser O(1) con Set
- ⚠️ Re-renders innecesarios (no memoizado)
- ⚠️ Escalabilidad: Con 100+ features, performance degrada

### Problem 4: No Clear Removal Strategy

**Current State**:
```typescript
// ❌ Si desactivo 'sales_pos_onsite', ¿cómo encuentro TODOS los lugares que lo usan?

// Búsqueda manual en codebase:
// materials/MaterialRow.tsx:45
// sales/SalesPage.tsx:122
// operations/OperationsHub.tsx:88
// customers/CustomerDetail.tsx:234
// ... 20+ archivos más?

// ⚠️ No hay manera automática de saber qué se rompe
```

---

## 🔬 Research & Validation

### Enterprise Systems Analyzed

Investigamos **5 plataformas empresariales** con necesidades similares (100+ módulos, composición múltiple):

#### 1. WordPress (60,000+ plugins)

**Architecture**: Hook System

```php
// ✅ Plugin A: WooCommerce (no sabe que Inventory existe)
do_action('woocommerce_after_add_to_cart_button');

// ✅ Plugin B: Inventory Manager (se conecta al hook)
add_action('woocommerce_after_add_to_cart_button', function() {
    if (!class_exists('WooCommerce')) return;

    global $product;
    echo '<a href="/inventory/product/' . $product->id . '">Ver Stock</a>';
});

// Manifest de dependencias:
/**
 * Requires Plugins: woocommerce
 */
```

**Key Insights**:
- ✅ Hooks permiten extensión sin modificar código base
- ✅ Dependencies explícitas en manifest
- ✅ Composición natural (múltiples plugins agregan al mismo hook)

#### 2. VS Code (40,000+ extensions)

**Architecture**: Export API + Extension Dependencies

```typescript
// ✅ Extension A: File Explorer (expone API)
export function activate(context: vscode.ExtensionContext) {
  return {
    registerAction: (action: FileAction) => {
      fileActions.push(action);
    }
  };
}

// ✅ Extension B: Git (usa API de File Explorer)
// package.json
{
  "extensionDependencies": ["vscode-fileexplorer"] // ← Explícito
}

// extension.ts
const fileExplorer = vscode.extensions.getExtension('vscode-fileexplorer');
const api = fileExplorer.exports;
api.registerAction({
  name: 'Git: Show Changes',
  onClick: (file) => showGitChanges(file)
});
```

**Key Insights**:
- ✅ Type-safe API exports
- ✅ Explicit dependencies in manifest
- ✅ `getExtension()` pattern para cross-extension communication

#### 3. Odoo ERP (30,000+ modules)

**Architecture**: Link Modules + Auto-install

```python
# ✅ Module A: CRM (independiente)
# crm/__manifest__.py
{
    'name': 'CRM',
    'depends': ['base']
}

# ✅ Module B: Sales (independiente)
# sale/__manifest__.py
{
    'name': 'Sales',
    'depends': ['base']
}

# ✅ Module C: Sale-CRM LINK (glue module)
# sale_crm/__manifest__.py
{
    'name': 'Sales CRM Integration',
    'depends': ['sale', 'crm'],  # ← Depende de AMBOS
    'auto_install': True         # ← Se instala automáticamente
}

# sale_crm/views/crm_lead_views.xml
<record id="crm_lead_view_form_inherited">
    <field name="inherit_id" ref="crm.crm_lead_view_form"/>
    <xpath expr="//header" position="inside">
        <button name="create_sale_order" string="New Quotation"/>
    </xpath>
</record>
```

**Key Insights**:
- ✅ Link modules para cross-domain features
- ✅ Auto-install based on dependencies
- ✅ View inheritance sin modificar originales

#### 4. Salesforce (Permission Set Groups)

**Architecture**: Additive Composition

```
User tiene:
✅ Permission Set Group: Sales Persona
✅ Permission Set Group: Support Persona
✅ Permission Set Group: Marketing Persona

Modelo: UNION (todos los permisos se suman)
```

**Key Insights**:
- ✅ Multiple "personas" activas simultáneamente
- ✅ Additive model (union, no override)
- ✅ Reusabilidad: Un permission set en múltiples grupos

#### 5. Dolibarr ERP (1,000+ modules)

**Architecture**: Hook Injection

```php
// ✅ Invoice module define hook point
$hookmanager->executeHooks('addMoreActionsButtons', $parameters, $invoice);

// ✅ Sale module inyecta su botón
function addMoreActionsButtons($parameters, &$object, &$action) {
    if ($object->element == 'facture') {
        print '<a href="/sales/order.php?invoiceid='.$object->id.'">
               Create Order</a>';
    }
}
```

**Key Insights**:
- ✅ Puntos de extensión declarativos
- ✅ Modules se suscriben a hooks
- ✅ No feature flags, solo module checks

### Common Patterns Identified

| Pattern | WordPress | VS Code | Odoo | Salesforce | Dolibarr |
|---------|-----------|---------|------|------------|----------|
| **Module Registry** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Hook System** | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Export API** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Explicit Dependencies** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Additive Composition** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Feature Flags** | ❌ | ❌ | ❌ | ❌ | ❌ |

**Key Finding**: **NINGUNO usa Feature Flags granulares anidados**

---

## 💡 Proposed Solution

### Architecture Overview

**Hybrid System**: Feature Flags (keep) + Module Registry (new) + Hook System (new)

```
┌─────────────────────────────────────────────┐
│  LAYER 1: User Choices (UNCHANGED)         │
│  - BusinessCapability selection             │
│  - Infrastructure selection                 │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  LAYER 2: Feature Activation (UNCHANGED)    │
│  - BusinessModelRegistry                    │
│  - FeatureActivationEngine                  │
│  - activeFeatures[] calculation             │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  LAYER 3: Module Registry (NEW)             │
│  - Register modules based on activeFeatures │
│  - Validate dependencies                    │
│  - Initialize hook system                   │
└────────────────┬────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────────┐
│ Hook System  │  │  CapabilityGate  │
│ (cross-mod)  │  │  (single-mod)    │
└──────────────┘  └──────────────────┘
```

### Core Components

#### 1. Module Registry

```typescript
// src/lib/modules/ModuleRegistry.ts

interface ModuleManifest {
  id: string;
  name: string;
  version: string;

  // Dependencies (inspired by Odoo)
  depends: string[];
  autoInstall?: boolean;

  // Required features (maps to activeFeatures)
  requiredFeatures: FeatureId[];

  // Hooks (inspired by WordPress)
  hooks?: {
    provide: string[];  // Hooks que este módulo ofrece
    consume: string[];  // Hooks que este módulo usa
  };

  // Setup function
  setup?: (registry: ModuleRegistry) => void;
}

class ModuleRegistry {
  private static instance: ModuleRegistry;
  private modules = new Map<string, ModuleInstance>();
  private hooks = new Map<string, HookHandler[]>();

  static getInstance() {
    if (!this.instance) this.instance = new ModuleRegistry();
    return this.instance;
  }

  // Register module
  register(manifest: ModuleManifest) {
    // 1. Validate dependencies
    for (const dep of manifest.depends) {
      if (!this.modules.has(dep)) {
        throw new Error(`Module ${manifest.id} requires ${dep}`);
      }
    }

    // 2. Register
    this.modules.set(manifest.id, {
      manifest,
      active: true
    });

    // 3. Execute setup
    manifest.setup?.(this);

    // 4. Check auto-install triggers
    if (manifest.autoInstall) {
      this.checkAutoInstall();
    }
  }

  // Hook system (inspired by WordPress)
  addAction(hookName: string, handler: HookHandler) {
    const handlers = this.hooks.get(hookName) || [];
    handlers.push(handler);
    this.hooks.set(hookName, handlers);
  }

  doAction(hookName: string, ...args: any[]) {
    const handlers = this.hooks.get(hookName) || [];
    return handlers.map(h => h(...args));
  }

  // Get module (inspired by VS Code)
  getModule(id: string): ModuleInstance | undefined {
    return this.modules.get(id);
  }

  // Cleanup
  clear() {
    this.modules.clear();
    this.hooks.clear();
  }
}
```

#### 2. Module Definitions

```typescript
// src/modules/sales/manifest.ts

export const salesManifest: ModuleManifest = {
  id: 'sales',
  name: 'Sales Management',
  version: '1.0.0',

  // Dependencies
  depends: ['customers'], // ← Needs customers module

  // Required features
  requiredFeatures: [
    'sales_order_management',
    'sales_payment_processing'
  ],

  // Hooks
  hooks: {
    provide: [
      'sales.order.actions',
      'sales.payment.methods'
    ],
    consume: [
      'materials.row.actions',
      'customers.detail.actions'
    ]
  },

  // Setup
  setup: (registry) => {
    // Register hooks
    registry.addAction('materials.row.actions', (material) => (
      <Button onClick={() => createQuickSale(material)}>
        Quick Sell
      </Button>
    ));

    registry.addAction('customers.detail.actions', (customer) => (
      <Button onClick={() => createOrder(customer)}>
        New Order
      </Button>
    ));
  }
};
```

#### 3. Hook Point Component

```typescript
// src/lib/modules/HookPoint.tsx

interface HookPointProps {
  name: string;
  data?: any;
  fallback?: React.ReactNode;
}

export function HookPoint({ name, data, fallback }: HookPointProps) {
  const registry = useModuleRegistry();

  // Execute all hooks for this point
  const results = registry.doAction(name, data);

  if (results.length === 0) {
    return <>{fallback}</>;
  }

  return (
    <>
      {results.map((result, index) => (
        <React.Fragment key={index}>{result}</React.Fragment>
      ))}
    </>
  );
}
```

#### 4. Integration with CapabilityStore

```typescript
// src/store/capabilityStore.ts (MODIFIED)

import { ModuleRegistry } from '@/lib/modules/ModuleRegistry';
import { initializeModules } from '@/modules/bootstrap';

setCapabilities: (capabilities) => {
  // ... existing code ...

  const activationResult = FeatureActivationEngine.activateFeatures(...);

  // ✅ NEW: Initialize Module Registry
  const registry = ModuleRegistry.getInstance();
  registry.clear();

  // Initialize modules based on activeFeatures
  initializeModules(activationResult.activeFeatures, registry);

  return {
    ...state,
    features: {
      activeFeatures: activationResult.activeFeatures,
      // ... rest unchanged
    }
  };
}
```

#### 5. Module Bootstrap

```typescript
// src/modules/bootstrap.ts

import { salesManifest } from './sales/manifest';
import { materialsManifest } from './materials/manifest';
import { kitchenManifest } from './kitchen/manifest';
// ... all module manifests

export function initializeModules(
  activeFeatures: FeatureId[],
  registry: ModuleRegistry
) {
  const modules = [
    salesManifest,
    materialsManifest,
    kitchenManifest,
    // ... all modules
  ];

  // Filter modules by required features
  const eligibleModules = modules.filter(mod =>
    mod.requiredFeatures.every(f => activeFeatures.includes(f))
  );

  // Register in dependency order
  const sorted = topologicalSort(eligibleModules);
  sorted.forEach(mod => registry.register(mod));

  logger.info('ModuleBootstrap', 'Initialized modules:', {
    total: sorted.length,
    modules: sorted.map(m => m.id)
  });
}
```

---

## 🚀 Migration Strategy

### Phase 1: Setup (Week 1)

**Goal**: Create infrastructure without breaking existing code

**Tasks**:
1. ✅ Create `src/lib/modules/ModuleRegistry.ts`
2. ✅ Create `src/lib/modules/HookPoint.tsx`
3. ✅ Create `src/lib/modules/useModuleRegistry.ts`
4. ✅ Create `src/modules/bootstrap.ts`
5. ✅ Integrate with `CapabilityStore.setCapabilities()`

**No Breaking Changes**: Existing `<CapabilityGate>` continues working

### Phase 2: Module Definitions (Week 1-2)

**Goal**: Define all module manifests

**Tasks**:
1. ✅ Create `src/modules/sales/manifest.ts`
2. ✅ Create `src/modules/materials/manifest.ts`
3. ✅ Create `src/modules/kitchen/manifest.ts`
4. ✅ Create `src/modules/operations/manifest.ts`
5. ✅ Create `src/modules/customers/manifest.ts`
... (repeat for all modules)

**Template**:
```typescript
// src/modules/{module}/manifest.ts

export const {module}Manifest: ModuleManifest = {
  id: '{module}',
  name: '{Module Name}',
  version: '1.0.0',
  depends: [], // Fill based on cross-module needs
  requiredFeatures: [], // Fill from FeatureRegistry
  hooks: {
    provide: [],
    consume: []
  },
  setup: (registry) => {
    // Register hooks here
  }
};
```

### Phase 3: Migrate Cross-Module Actions (Week 2)

**Goal**: Replace cross-module `<CapabilityGate>` with hooks

**Example Migration**:

**BEFORE**:
```typescript
// materials/MaterialRow.tsx
function MaterialRow({ material }) {
  const { hasFeature } = useCapabilities();

  return (
    <tr>
      <td>{material.name}</td>
      <td>
        {hasFeature('sales_pos_onsite') && (
          <Button onClick={() => createQuickSale(material)}>
            Quick Sell
          </Button>
        )}
        {hasFeature('production_kitchen_display') && (
          <Button onClick={() => sendToKitchen(material)}>
            Use in Kitchen
          </Button>
        )}
      </td>
    </tr>
  );
}
```

**AFTER**:
```typescript
// materials/MaterialRow.tsx
function MaterialRow({ material }) {
  return (
    <tr>
      <td>{material.name}</td>
      <td>
        {/* ✅ Hook point - all modules auto-register */}
        <HookPoint name="materials.row.actions" data={material} />
      </td>
    </tr>
  );
}

// sales/manifest.ts
setup: (registry) => {
  registry.addAction('materials.row.actions', (material) => (
    <Button onClick={() => createQuickSale(material)}>
      Quick Sell
    </Button>
  ));
}

// kitchen/manifest.ts
setup: (registry) => {
  registry.addAction('materials.row.actions', (material) => (
    <Button onClick={() => sendToKitchen(material)}>
      Use in Kitchen
    </Button>
  ));
}
```

### Phase 4: Testing & Validation (Week 2-3)

**Testing Checklist**:
- ✅ All module combinations work (onsite + preparation + async)
- ✅ Dependencies validated correctly
- ✅ Hooks execute in correct order
- ✅ No performance regression
- ✅ Backwards compatibility maintained

### Phase 5: Documentation & Cleanup (Week 3)

**Deliverables**:
- ✅ Update `docs/02-architecture/`
- ✅ Create `MODULE_DEVELOPMENT_GUIDE.md`
- ✅ Update `CLAUDE.md` with new patterns
- ✅ Remove deprecated `<CapabilityGate>` usage (gradual)

---

## 📝 Implementation Examples

### Example 1: Sales ↔ Materials Integration

**Scenario**: Sales module wants to add "Quick Sell" button in Materials page

**Current Code (Feature Flags)**:
```typescript
// materials/components/MaterialRow.tsx
import { useCapabilities } from '@/store/capabilityStore';
import { createQuickSale } from '@/pages/admin/operations/sales/services/saleApi';

function MaterialRow({ material }) {
  const { hasFeature } = useCapabilities();

  return (
    <tr>
      <td>{material.name}</td>
      <td>
        {/* ❌ Materials debe importar función de Sales */}
        {/* ❌ Dependency implícita */}
        {hasFeature('sales_pos_onsite') && (
          <Button onClick={() => createQuickSale(material)}>
            Quick Sell
          </Button>
        )}
      </td>
    </tr>
  );
}
```

**Problems**:
- ❌ Materials module imports from Sales (`createQuickSale`)
- ❌ Circular dependency risk
- ❌ Difícil eliminar Sales module
- ❌ No type-safe (si Sales cambia API, Materials se rompe silenciosamente)

**New Code (Module Registry)**:
```typescript
// materials/components/MaterialRow.tsx
import { HookPoint } from '@/lib/modules/HookPoint';

function MaterialRow({ material }) {
  return (
    <tr>
      <td>{material.name}</td>
      <td>
        {/* ✅ Materials NO conoce a Sales */}
        {/* ✅ Dependency explícita via hooks */}
        <HookPoint name="materials.row.actions" data={material} />
      </td>
    </tr>
  );
}

// sales/manifest.ts
import { createQuickSale } from './services/saleApi';

export const salesManifest: ModuleManifest = {
  id: 'sales',
  depends: ['materials'], // ← Explícito
  requiredFeatures: ['sales_pos_onsite'],
  hooks: {
    consume: ['materials.row.actions']
  },
  setup: (registry) => {
    // ✅ Sales se registra en el hook
    registry.addAction('materials.row.actions', (material) => (
      <Button onClick={() => createQuickSale(material)}>
        Quick Sell
      </Button>
    ));
  }
};
```

**Benefits**:
- ✅ Materials NO importa de Sales (desacoplado)
- ✅ Dependency explícita (`depends: ['materials']`)
- ✅ Type-safe (TypeScript valida hook signature)
- ✅ Fácil eliminar Sales (solo desregistrar, Materials sigue funcionando)

### Example 2: Multiple Modules Adding Actions

**Scenario**: Usuario selecciona `onsite_service + requires_preparation + async_operations`

**Features Activadas**:
```typescript
activeFeatures = [
  'sales_pos_onsite',           // De onsite_service
  'production_kitchen_display',  // De requires_preparation
  'sales_catalog_ecommerce'      // De async_operations
]
```

**Module Registry Initialization**:
```typescript
// Executed by CapabilityStore after feature activation

const registry = ModuleRegistry.getInstance();
registry.clear();

// 1. Register Sales module (has sales_pos_onsite feature)
registry.register(salesManifest);

// 2. Register Kitchen module (has production_kitchen_display feature)
registry.register(kitchenManifest);

// 3. Register Ecommerce module (has sales_catalog_ecommerce feature)
registry.register(ecommerceManifest);
```

**Hooks Registration**:
```typescript
// sales/manifest.ts
setup: (registry) => {
  registry.addAction('materials.row.actions', (material) => (
    <Button onClick={() => createQuickSale(material)}>
      Quick Sell
    </Button>
  ));
}

// kitchen/manifest.ts
setup: (registry) => {
  registry.addAction('materials.row.actions', (material) => (
    <Button onClick={() => sendToKitchen(material)}>
      Use in Kitchen
    </Button>
  ));
}

// ecommerce/manifest.ts
setup: (registry) => {
  registry.addAction('materials.row.actions', (material) => (
    <Button onClick={() => publishOnline(material)}>
      Publish Online
    </Button>
  ));
}
```

**Result in UI**:
```typescript
// materials/MaterialRow.tsx
<HookPoint name="materials.row.actions" data={material} />

// Renders:
// [Quick Sell] [Use in Kitchen] [Publish Online]
// ✅ Todos los botones conviven automáticamente
```

### Example 3: Link Modules (Odoo Pattern)

**Scenario**: Sales + Materials ambos activos → Auto-enable "Sales-Materials Integration"

**Link Module Definition**:
```typescript
// src/modules/sales-materials-link/manifest.ts

export const salesMaterialsLinkManifest: ModuleManifest = {
  id: 'sales-materials-link',
  name: 'Sales-Materials Integration',
  version: '1.0.0',

  depends: ['sales', 'materials'], // ← Requiere AMBOS
  autoInstall: true,               // ← Se instala automáticamente

  requiredFeatures: [
    'sales_order_management',
    'inventory_stock_tracking'
  ],

  setup: (registry) => {
    // ✅ Solo se ejecuta si sales Y materials están activos

    // Hook 1: Reduce stock automáticamente al vender
    registry.addAction('sales.order.created', (order) => {
      const materialsModule = registry.getModule('materials');
      materialsModule.reduceStock(order.items);
    });

    // Hook 2: Alert en Sales si material bajo stock
    registry.addAction('materials.low_stock', (material) => {
      const salesModule = registry.getModule('sales');
      salesModule.showLowStockWarning(material);
    });
  }
};
```

**Benefits**:
- ✅ Integration code separado de Sales y Materials
- ✅ Auto-instala solo si ambos módulos activos
- ✅ Fácil deshabilitar integración (remove link module)

---

## 🎯 Risk Assessment

### High Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing features | Medium | High | Gradual migration, backwards compatibility |
| Performance regression | Low | Medium | Benchmarking before/after, memoization |
| Circular dependencies | Medium | High | Topological sort, dependency validation |

### Medium Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Developer confusion | Medium | Medium | Documentation, training, examples |
| Module loading order | Low | Medium | Dependency-based sorting |
| Hook naming conflicts | Low | Low | Namespacing convention |

### Mitigation Strategies

#### 1. Backwards Compatibility

```typescript
// Keep CapabilityGate working during migration
export function CapabilityGate({ capability, children }) {
  const { hasFeature } = useCapabilities();

  if (!hasFeature(capability)) return null;
  return <>{children}</>;
}

// Gradual migration:
// Phase 1: Both systems coexist
// Phase 2: Migrate cross-module to hooks
// Phase 3: Keep CapabilityGate for single-module conditionals
```

#### 2. Performance Monitoring

```typescript
// Add performance tracking to Module Registry
class ModuleRegistry {
  register(manifest: ModuleManifest) {
    const start = performance.now();

    // ... registration logic ...

    const duration = performance.now() - start;
    logger.performance('ModuleRegistry', `Registered ${manifest.id}`, duration);
  }
}
```

#### 3. Dependency Validation

```typescript
function topologicalSort(modules: ModuleManifest[]): ModuleManifest[] {
  // Detect circular dependencies
  const visited = new Set();
  const stack = new Set();

  const visit = (mod: ModuleManifest) => {
    if (stack.has(mod.id)) {
      throw new Error(`Circular dependency detected: ${Array.from(stack).join(' → ')} → ${mod.id}`);
    }

    if (visited.has(mod.id)) return;

    stack.add(mod.id);

    mod.depends.forEach(dep => {
      const depMod = modules.find(m => m.id === dep);
      if (depMod) visit(depMod);
    });

    stack.delete(mod.id);
    visited.add(mod.id);
  };

  modules.forEach(visit);

  // ... return sorted array
}
```

---

## 📊 Decision Log

### Decision 1: Use Module Registry + Hooks (Not Pure Feature Flags)

**Date**: 2025-01-10
**Decision**: Adopt Module Registry + Hook System inspired by WordPress/Odoo
**Rationale**:
- ✅ Proven pattern in 60k+ WordPress plugins, 30k+ Odoo modules
- ✅ Solves cross-module communication elegantly
- ✅ Reduces conditional rendering complexity
- ✅ Better maintainability at scale

**Alternatives Considered**:
1. ❌ Keep only Feature Flags → Doesn't scale for cross-module
2. ❌ Pure Plugin Architecture → Too heavy, breaks React patterns
3. ❌ Module Federation → Overkill for monolithic app

**References**:
- [WordPress Hooks Documentation](https://developer.wordpress.org/plugins/hooks/)
- [Odoo Module System](https://www.odoo.com/documentation/18.0/developer/howtos/company.html)
- [VS Code Extension API](https://code.visualstudio.com/api/references/contribution-points)

### Decision 2: Keep Feature Flags for Single-Module Conditionals

**Date**: 2025-01-10
**Decision**: Maintain `<CapabilityGate>` for single-module conditional rendering
**Rationale**:
- ✅ Simple, works well for internal module conditionals
- ✅ No migration needed for existing code
- ✅ Hybrid approach: Best of both worlds

**Use Cases**:
- ✅ Use `<CapabilityGate>`: Internal module features (e.g., "Show advanced filters")
- ✅ Use `<HookPoint>`: Cross-module actions (e.g., "Sales button in Materials")

### Decision 3: Additive Composition Model (Union)

**Date**: 2025-01-10
**Decision**: Multiple capabilities/modules use UNION (additive) model
**Rationale**:
- ✅ Matches current `getActivatedFeatures()` behavior (Set union)
- ✅ Proven in Salesforce Permission Sets
- ✅ Natural for business use cases (Restaurant + Bakery both active)

**Example**:
```typescript
// User selects: ['onsite_service', 'requires_preparation']
// activeFeatures = union of both → 25 unique features
// Both modules active simultaneously, hooks stack
```

### Decision 4: Gradual Migration (Not Big Bang)

**Date**: 2025-01-10
**Decision**: Migrate incrementally over 2-3 weeks
**Rationale**:
- ✅ Lower risk (can rollback at any phase)
- ✅ Continuous testing
- ✅ Backwards compatibility maintained

**Migration Path**:
1. Week 1: Setup infrastructure (no breaking changes)
2. Week 2: Migrate cross-module actions (coexistence)
3. Week 3: Documentation & cleanup

---

## 📚 References

### Internal Documentation
- `docs/02-architecture/ATOMIC_CAPABILITIES_TECHNICAL_SPEC.md`
- `docs/ATOMIC_CAPABILITIES_DESIGN.md`
- `src/config/BusinessModelRegistry.ts`
- `src/config/FeatureRegistry.ts`

### External Resources
- [Martin Fowler - Feature Toggles](https://martinfowler.com/articles/feature-toggles.html)
- [WordPress Plugin Handbook - Hooks](https://developer.wordpress.org/plugins/hooks/)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Odoo Module Development](https://www.odoo.com/documentation/18.0/developer/howtos/company.html)
- [Salesforce Permission Sets](https://help.salesforce.com/s/articleView?id=platform.perm_sets_overview.htm)

### Research Findings
- WordPress: 60,000+ plugins using hook system
- VS Code: 40,000+ extensions using export API
- Odoo: 30,000+ modules using link module pattern
- Salesforce: Enterprise-proven additive composition model
- Dolibarr: 1,000+ modules using hook injection

---

## ✅ Next Steps

### Immediate Actions

1. **Review & Approve** this document
2. **Create implementation tickets** in project management
3. **Setup development branch** `feature/module-registry`
4. **Begin Phase 1** infrastructure setup

### Success Criteria

- ✅ All existing features continue working
- ✅ Cross-module actions work via hooks
- ✅ No performance regression
- ✅ Developer documentation complete
- ✅ All tests passing

### Timeline

- **Week 1**: Infrastructure + Module Definitions
- **Week 2**: Migration + Testing
- **Week 3**: Documentation + Cleanup
- **Total**: 2-3 weeks

---

**Document Status**: ✅ Ready for Review
**Author**: Architecture Team
**Last Updated**: 2025-01-10
**Version**: 1.0.0
