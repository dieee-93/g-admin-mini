# 🏗️ ANÁLISIS ARQUITECTÓNICO: INTEGRACIÓN CAPABILITIES + PERMISSIONS + MODULE REGISTRY

**Fecha**: 2025-01-30
**Autores**: Claude Code + Diego (estudiante)
**Propósito**: Documento definitivo para entender y mejorar la arquitectura de seguridad

---

## 📖 CONTEXTO: CÓMO FUNCIONA TU SISTEMA ACTUALMENTE

### **1. Sistema de Capabilities/Features** (Feature Flags)

**Flujo**:
```
User selecciona Capabilities (Setup)
   → FeatureActivationEngine.activateFeatures()
   → Features se activan en capabilityStore
   → Módulos se cargan SOLO si requiredFeatures están activas
```

**Ejemplo práctico**:
```typescript
// 1. User setup wizard
selectedCapabilities: ['onsite_service', 'pickup_counter']
selectedInfrastructure: ['single_location']

// 2. FeatureActivationEngine resuelve
activatedFeatures: [
  'pos_sales',
  'fulfillment_onsite_service',
  'fulfillment_pickup_queuing',
  'inventory_stock_tracking',
  // ... 20+ features más
]

// 3. Módulos se cargan SI cumplen requiredFeatures
Sales module: requiredFeatures: ['pos_sales'] ✅ → SE CARGA
Delivery module: requiredFeatures: ['fulfillment_delivery'] ❌ → NO SE CARGA
```

**⚠️ CRÍTICO**: Las features **NO se chequean con `hasFeature &&`** en UI.

---

### **2. Sistema Module Registry** (WordPress Hooks-like)

**Flujo**:
```
App inicia
   → Module Registry lee manifests
   → Carga módulos si requiredFeatures activas
   → Ejecuta setup() de cada módulo
   → Módulos registran hooks en registry
   → UI usa <HookPoint /> para ejecutar hooks
```

**Ejemplo práctico**:
```typescript
// src/modules/suppliers/manifest.tsx
export const suppliersManifest = {
  requiredFeatures: ['inventory_supplier_management'],  // ← Solo activo si feature está

  setup: async (registry) => {
    // ✅ Este código SOLO se ejecuta si feature activa
    registry.addAction(
      'materials.row.actions',  // Hook point
      (materialData) => (
        <Button onClick={() => createPO(materialData)}>
          Create PO
        </Button>
      ),
      'suppliers',  // Module ID
      10            // Priority
    );
  }
};

// src/pages/materials/components/Grid.tsx
<HookPoint
  name="materials.row.actions"
  data={item}
  fallback={null}
/>
// ↑ Ejecuta TODOS los hooks registrados para 'materials.row.actions'
// Si Suppliers activo → botón aparece
// Si Suppliers inactivo → setup() nunca se ejecutó, hook no existe
```

**✅ BENEFICIO**: NO necesitas `hasFeature &&` en UI porque **los módulos solo se registran si están activos**.

---

### **3. Sistema de Permissions** (RBAC)

**Flujo**:
```
User tiene Role asignado (ADMINISTRADOR, GERENTE, etc.)
   → PermissionsRegistry define qué puede hacer cada rol
   → AuthContext expone: canAccessModule(), canPerformAction()
   → UI y Services validan permisos
```

**Ejemplo práctico**:
```typescript
// 1. Definición de permisos
ROLE_PERMISSIONS['EMPLEADO'] = {
  sales: ['read', 'create'],  // ✅ Puede crear ventas
  materials: ['read'],         // ❌ NO puede crear materiales
};

// 2. Validación en UI
const { canPerformAction } = useAuth();

if (canPerformAction('materials', 'create')) {
  return <Button>Create Material</Button>;
}
// EMPLEADO → NO ve el botón

// 3. Validación en Service
requirePermission(user, 'materials', 'create'); // ← Throws si no tiene permiso
await supabase.from('items').insert(data);
```

---

## 🚨 EL PROBLEMA REAL: ¿SON SISTEMAS INDEPENDIENTES?

### **Pregunta crítica**: ¿Qué pasa actualmente?

**Escenario A: Feature ACTIVA + Usuario SIN PERMISO**
```typescript
// Setup: User activa 'inventory_supplier_management'
activeFeatures: ['inventory_supplier_management'] ✅

// Module Registry: Suppliers se carga
suppliersManifest.setup() se ejecuta ✅
registry.addAction('materials.row.actions', <Button>Create PO</Button>) ✅

// UI: HookPoint renderiza el botón
<HookPoint name="materials.row.actions" />
→ Renderiza: <Button>Create PO</Button> ✅

// Usuario EMPLEADO hace click
onClick={() => createPO(material)}
  → llama a createPOService(material, user)
    → requirePermission(user, 'suppliers', 'create')
      → user.role = 'EMPLEADO'
      → hasPermission('EMPLEADO', 'suppliers', 'create') = FALSE
      → ❌ THROWS PermissionDeniedError

// RESULTADO:
// ✅ Usuario VE el botón (feature activa)
// ❌ Usuario NO PUEDE usarlo (sin permiso)
// 😤 UX: FRUSTRACIÓN
```

**Escenario B: Feature INACTIVA + Usuario CON PERMISO**
```typescript
// Setup: User NO activa 'inventory_supplier_management'
activeFeatures: [] ❌

// Module Registry: Suppliers NO se carga
suppliersManifest NO cumple requiredFeatures ❌
setup() nunca se ejecuta ❌

// UI: HookPoint no renderiza nada
<HookPoint name="materials.row.actions" />
→ No hay hooks registrados → Renderiza: null

// Usuario ADMINISTRADOR
// ✅ Tiene permiso para suppliers
// ❌ NO ve el botón (feature inactiva)
// 🤔 UX: Confusión - ¿Por qué no está disponible?
```

---

## 🔍 INVESTIGACIÓN: ¿CÓMO LO RESUELVEN OTROS?

### **SHOPIFY Pattern**

```
Plan (Shopify Basic, Plus, Advanced)
   → Unlocks Features (Multi-store, POS, Advanced Reports)
      → Staff Permissions (per-user RBAC)
         → Feature Access = Plan AND Staff Permission
```

**Ejemplo**:
- Plan "Shopify Basic": NO incluye Advanced Reports
- Staff "Manager": Tiene permiso "View Reports"
- **Resultado**: Manager NO ve "Advanced Reports" (feature no disponible en plan)

**Validación integrada**:
```typescript
// Shopify (pseudocode)
function canUseFeature(user, feature) {
  return shop.plan.includes(feature) && user.permissions.includes(feature);
}

// UI
if (canUseFeature(currentUser, 'advanced_reports')) {
  showAdvancedReportsButton();
}
```

---

### **SALESFORCE Pattern**

```
User License (Base features)
   → Permission Set License (Add-on features)
      → Permission Set (Granular permissions)
         → Record Rules (Ownership, location, state)
```

**Capa de validación**:
```
Layer 1: User License → Can access "Service Cloud"?
Layer 2: Permission Set → Can access "Cases" object?
Layer 3: Record Rules → Can edit THIS case (owned by me)?
```

**Key insight**: Salesforce NO muestra UI si falta Layer 1 (License). Solo valida Permissions si License existe.

---

### **ODOO ERP Pattern**

```
Groups (Collections of users)
   → Access Rights (Model-level CRUD)
      → Record Rules (Record-level filters)
```

**Ejemplo**:
```python
# Access Right (Model-level)
user.groups.has('sales_user') → ✅ Can access sales model

# Record Rule (Record-level)
if sale.state == 'draft' and sale.user_id == current_user.id:
    can_edit = True
else:
    can_edit = False
```

**Key insight**: Odoo valida Groups ANTES de mostrar módulo. Record Rules se aplican dentro del módulo.

---

## 💡 PROPUESTA: ¿QUÉ DEBERÍA HACER TU APP?

### **Opción 1: Check Integrado en Module Registry** (RECOMENDADO)

**Concepto**: Module Registry valida Features AND Permissions al registrar hooks.

```typescript
// src/lib/modules/ModuleRegistry.ts

addAction(
  hookName: string,
  callback: Function,
  moduleId: string,
  priority: number,
  options?: {
    requiredPermission?: { module: ModuleName; action: PermissionAction };
  }
) {
  // Existing check
  const module = this.getModule(moduleId);
  if (!module || !module.loaded) return;

  // NEW: Permission check at registration time
  if (options?.requiredPermission) {
    const { module: permModule, action } = options.requiredPermission;

    // Check if CURRENT USER has permission
    const { user } = useAuth.getState(); // Get auth state
    if (!hasPermission(user.role, permModule, action)) {
      logger.warn('ModuleRegistry', `Hook '${hookName}' not registered - user lacks permission`, {
        requiredPermission: options.requiredPermission,
        userRole: user.role
      });
      return; // ❌ NO registrar hook
    }
  }

  // Register hook
  this.hooks[hookName] = this.hooks[hookName] || [];
  this.hooks[hookName].push({ callback, moduleId, priority });
}
```

**Uso**:
```typescript
// src/modules/suppliers/manifest.tsx
setup: async (registry) => {
  registry.addAction(
    'materials.row.actions',
    (materialData) => <Button>Create PO</Button>,
    'suppliers',
    10,
    {
      requiredPermission: { module: 'suppliers', action: 'create' }  // ← NEW
    }
  );
}
```

**Resultado**:
- ✅ Feature activa + Usuario SIN permiso → Hook NO se registra → Botón NO aparece
- ✅ Feature activa + Usuario CON permiso → Hook se registra → Botón aparece
- ✅ Feature inactiva → Module setup() no se ejecuta → Botón NO aparece

**PROS**:
- ✅ Validación centralizada
- ✅ NO cambia código existente en manifests (solo agregar options)
- ✅ User-aware (reacciona a cambios de role)

**CONS**:
- ⚠️ Registry debe ser "user-aware" (conocer AuthContext)
- ⚠️ Si user cambia de role, hay que re-ejecutar todos los setups

---

### **Opción 2: Wrapper Hook con Permission Check** (MÁS FLEXIBLE)

**Concepto**: Module declara permisos en manifest, Registry los valida en HookPoint.

```typescript
// src/modules/suppliers/manifest.tsx
export const suppliersManifest = {
  hooks: {
    consume: [
      {
        name: 'materials.row.actions',
        requiredPermission: { module: 'suppliers', action: 'create' }  // ← Metadata
      }
    ]
  },

  setup: async (registry) => {
    registry.addAction(
      'materials.row.actions',
      (materialData) => <Button>Create PO</Button>,
      'suppliers',
      10
    );
  }
};

// src/lib/modules/HookPoint.tsx
export function HookPoint({ name, data, fallback }) {
  const { user } = useAuth();
  const registry = ModuleRegistry.getInstance();

  // Get hooks for this point
  const hooks = registry.getHooks(name);

  // Filter by permissions
  const permittedHooks = hooks.filter(hook => {
    const module = registry.getModule(hook.moduleId);
    const hookConfig = module.manifest.hooks.consume.find(h => h.name === name);

    if (hookConfig?.requiredPermission) {
      const { module: permModule, action } = hookConfig.requiredPermission;
      return hasPermission(user.role, permModule, action);
    }

    return true; // No permission required
  });

  // Render permitted hooks
  return permittedHooks.map(hook => hook.callback(data));
}
```

**PROS**:
- ✅ Registry NO necesita conocer AuthContext
- ✅ Validación en render time (reacciona a cambios de role automáticamente)
- ✅ Hooks se registran siempre, solo se filtran en render

**CONS**:
- ⚠️ Requiere cambiar estructura de manifest
- ⚠️ Validación en cada render (puede ser costoso)

---

### **Opción 3: Mantener Separados (ACTUAL)** + Agregar service-level validation

**Concepto**: Acepta que UI puede mostrar botones disabled/error si no hay permiso.

```typescript
// src/modules/suppliers/manifest.tsx
setup: async (registry) => {
  registry.addAction(
    'materials.row.actions',
    (materialData) => {
      const { canPerformAction } = useAuth();
      const canCreate = canPerformAction('suppliers', 'create');

      return (
        <Tooltip
          label={!canCreate ? "No tienes permiso para crear POs" : undefined}
        >
          <Button
            onClick={() => createPO(materialData)}
            disabled={!canCreate}  // ← UI refleja falta de permiso
          >
            Create PO
          </Button>
        </Tooltip>
      );
    },
    'suppliers',
    10
  );
}
```

**PROS**:
- ✅ NO requiere cambios en arquitectura
- ✅ Usuario VE la feature (sabe que existe)
- ✅ Tooltip explica por qué no puede usarla

**CONS**:
- ❌ Puede ser confuso (¿por qué veo algo que no puedo usar?)
- ❌ Cada module necesita implementar la lógica de disabled

---

## 🎯 RECOMENDACIÓN FINAL

### **Para tu caso (Estudiante + App en desarrollo)**:

**FASE 1**: Implementar **Opción 3** (Mantener separados + disabled states)
- ✅ Menos riesgo
- ✅ NO rompe arquitectura existente
- ✅ Aprende cómo interactúan los sistemas

**FASE 2**: Migrar a **Opción 2** (Wrapper en HookPoint con metadata)
- ✅ Más profesional
- ✅ Declarativo (manifest define permisos)
- ✅ Flexible (fácil agregar más checks)

**NO recomiendo Opción 1** porque hace el Registry "stateful" (user-aware), lo cual rompe el principio de que el Registry es solo un "catálogo" de hooks.

---

## 📝 SIGUIENTE PASO: DISCUTIR GAPS 2, 3, 4

Una vez que estés de acuerdo con este análisis de Gap 1, continuamos con:

- **Gap 2**: Record-Level Permissions (ownership, location, state)
- **Gap 3**: Event Schema Validation (EventBus)
- **Gap 4**: Offline Permission Caching

---

## ❓ PREGUNTAS PARA VOS

Antes de continuar, necesito que me digas:

1. **¿Te hace sentido la separación Features (Module Registry) vs Permissions (RBAC)?**
2. **¿Cuál opción te parece mejor para integrar ambos sistemas?**
3. **¿Hay algo que no entendiste de cómo funciona actualmente tu app?**
4. **¿Querés profundizar en algún aspecto específico antes de pasar a Gap 2?**

---

**Estado**: DRAFT - Esperando feedback para continuar
