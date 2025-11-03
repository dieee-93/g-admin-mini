# ✅ IMPLEMENTACIÓN: INTEGRACIÓN PERMISSIONS + MODULE REGISTRY

**Fecha**: 2025-01-30
**Estado**: ✅ COMPLETADO
**Opción elegida**: Opción 2 - Permission check in HookPoint with metadata

---

## 📋 CAMBIOS REALIZADOS

### **1. Types Extended** (`src/lib/modules/types.ts`)

#### **HookContext** - Added permission metadata
```typescript
export interface HookContext {
  moduleId: string;
  hookName: string;
  timestamp: number;
  metadata?: Record<string, any>;

  // ✅ NEW: Permission required to execute hook
  requiredPermission?: {
    module: string;    // ModuleName (e.g., 'suppliers', 'materials')
    action: string;    // PermissionAction (e.g., 'create', 'read')
  };
}
```

#### **ModuleManifest.hooks.consume** - Now accepts objects
```typescript
export interface ModuleManifest {
  hooks?: {
    provide: string[];

    // ✅ NEW: Can be string OR object with permission
    consume: Array<string | {
      name: string;
      requiredPermission?: {
        module: string;
        action: string;
      };
    }>;
  };
}
```

---

### **2. ModuleRegistry.addAction()** - Accepts options parameter

```typescript
// src/lib/modules/ModuleRegistry.ts

public addAction<T = any, R = any>(
  hookName: string,
  handler: HookHandler<T, R>,
  moduleId?: string,
  priority: number = 10,
  options?: {                          // ✅ NEW
    requiredPermission?: {
      module: string;
      action: string;
    };
    metadata?: Record<string, any>;
  }
): void {
  const registeredHook: RegisteredHook<T, R> = {
    handler,
    context: {
      moduleId: moduleId || 'unknown',
      hookName,
      timestamp: Date.now(),
      requiredPermission: options?.requiredPermission,  // ✅ Store permission
      metadata: options?.metadata,
    },
    priority,
  };

  // ... rest of registration logic
}
```

---

### **3. HookPoint Component** - Filters hooks by permissions

```typescript
// src/lib/modules/HookPoint.tsx

import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/config/PermissionsRegistry';

export const HookPoint = <T = any,>(props: HookPointProps<T>) => {
  // ✅ NEW: Get current user
  const { user } = useAuth();
  const registry = ModuleRegistry.getInstance();

  const results = useMemo(() => {
    // Get all registered hooks
    const allHooks = registry['hooks'].get(name) || [];

    // ✅ NEW: Filter by permissions
    const permittedHooks = allHooks.filter(hook => {
      const permission = hook.context.requiredPermission;

      // No permission required → allow
      if (!permission) return true;

      // No user → deny
      if (!user || !user.role) return false;

      // Check permission
      return hasPermission(
        user.role,
        permission.module,
        permission.action
      );
    });

    // Execute only permitted hooks
    return permittedHooks.map(hook => hook.handler(data));
  }, [registry, name, data, user]);

  // Render results...
};
```

---

## 🎯 CÓMO USAR

### **Ejemplo 1: Suppliers module agrega botón a Materials**

```typescript
// src/modules/suppliers/manifest.tsx

import type { ModuleManifest } from '@/lib/modules';

export const suppliersManifest: ModuleManifest = {
  id: 'suppliers',
  name: 'Suppliers Management',
  version: '1.0.0',
  depends: [],
  requiredFeatures: ['inventory_supplier_management'],

  hooks: {
    provide: [],
    consume: [
      {
        name: 'materials.row.actions',
        requiredPermission: {              // ✅ Declare permission
          module: 'suppliers',
          action: 'create'
        }
      }
    ]
  },

  setup: async (registry) => {
    // Register hook with permission
    registry.addAction(
      'materials.row.actions',
      (materialData) => (
        <Button
          size="sm"
          onClick={() => createPOFromMaterial(materialData)}
        >
          Create PO
        </Button>
      ),
      'suppliers',
      10,
      {
        requiredPermission: {              // ✅ Specify permission
          module: 'suppliers',
          action: 'create'
        }
      }
    );
  }
};
```

---

### **Ejemplo 2: Materials page ejecuta hooks**

```typescript
// src/pages/admin/supply-chain/materials/components/MaterialsGrid.tsx

import { HookPoint } from '@/lib/modules';

function MaterialsGrid({ items }) {
  return items.map(item => (
    <TableRow key={item.id}>
      <TableCell>{item.name}</TableCell>
      <TableCell>{item.quantity}</TableCell>
      <TableCell>
        {/* Base actions */}
        <Button onClick={() => handleEdit(item)}>Edit</Button>
        <Button onClick={() => handleDelete(item)}>Delete</Button>

        {/* ✅ HookPoint filtra automáticamente por permisos */}
        <HookPoint
          name="materials.row.actions"
          data={item}
          fallback={null}
          debug={process.env.NODE_ENV === 'development'}
        />
      </TableCell>
    </TableRow>
  ));
}
```

---

## 🔥 FLUJO COMPLETO

### **Escenario A: Feature ACTIVA + Usuario CON PERMISO**

```
1. Setup: User activa 'inventory_supplier_management' ✅
2. Module Registry: Suppliers module se carga ✅
3. Suppliers.setup(): registry.addAction(..., { requiredPermission: { module: 'suppliers', action: 'create' } }) ✅
4. Usuario ADMINISTRADOR abre Materials
   → user.role = 'ADMINISTRADOR'
   → hasPermission('ADMINISTRADOR', 'suppliers', 'create') = TRUE ✅
5. HookPoint: Filtra hooks
   → Suppliers hook pasa el filtro ✅
6. Renderiza: <Button>Create PO</Button> ✅
7. Usuario hace click → createPO() se ejecuta ✅

✅ RESULTADO: Usuario VE el botón Y puede usarlo
```

---

### **Escenario B: Feature ACTIVA + Usuario SIN PERMISO**

```
1. Setup: User activa 'inventory_supplier_management' ✅
2. Module Registry: Suppliers module se carga ✅
3. Suppliers.setup(): registry.addAction(..., { requiredPermission: { module: 'suppliers', action: 'create' } }) ✅
4. Usuario EMPLEADO abre Materials
   → user.role = 'EMPLEADO'
   → hasPermission('EMPLEADO', 'suppliers', 'create') = FALSE ❌
5. HookPoint: Filtra hooks
   → Suppliers hook NO pasa el filtro ❌
6. Renderiza: null (botón no aparece) ✅

✅ RESULTADO: Usuario NO ve el botón (mejor UX)
```

---

### **Escenario C: Feature INACTIVA**

```
1. Setup: User NO activa 'inventory_supplier_management' ❌
2. Module Registry: Suppliers module NO se carga ❌
3. Suppliers.setup(): NUNCA se ejecuta ❌
4. Usuario ADMINISTRADOR abre Materials
5. HookPoint: No hay hooks registrados para 'materials.row.actions' de Suppliers
6. Renderiza: null

✅ RESULTADO: Botón no aparece (feature no disponible)
```

---

## 🎨 VENTAJAS DE ESTA IMPLEMENTACIÓN

### ✅ **1. Declarativo**
```typescript
// Permiso se declara EN EL MANIFEST
// → Fácil de ver qué permisos requiere cada hook
hooks: {
  consume: [
    { name: 'materials.row.actions', requiredPermission: { module: 'suppliers', action: 'create' } }
  ]
}
```

### ✅ **2. Automático**
```typescript
// NO necesitas chequear permisos manualmente en cada componente
// HookPoint lo hace automáticamente
<HookPoint name="materials.row.actions" data={item} />
```

### ✅ **3. Reactivo**
```typescript
// Si user cambia de role, HookPoint re-filtra automáticamente
// → useMemo depende de `user`
const results = useMemo(() => {
  // Filter by permissions
}, [registry, name, data, user, debug]);  // ← user dependency
```

### ✅ **4. Debug-friendly**
```typescript
// Modo debug muestra qué hooks se filtraron y por qué
<HookPoint
  name="materials.row.actions"
  debug={true}
/>
// Console: "[HookPoint] Hook filtered (no permission): materials.row.actions"
//          "{ moduleId: 'suppliers', requiredPermission: {...}, userRole: 'EMPLEADO' }"
```

### ✅ **5. Backward Compatible**
```typescript
// Hooks SIN requiredPermission siguen funcionando
registry.addAction('dashboard.widgets', () => <Widget />, 'materials', 10);
// → No requiere permisos, siempre se ejecuta
```

---

## 🚀 PRÓXIMOS PASOS

1. ✅ **Gap 1 RESUELTO**: Features + Permissions integrados
2. ⏳ **Gap 2**: Record-Level Permissions (ownership, location, state)
3. ⏳ **Gap 3**: Event Schema Validation
4. ⏳ **Gap 4**: Offline Permission Caching

---

## 📝 MIGRATION GUIDE (Para otros módulos)

### **Antes** (Sin permissions):
```typescript
setup: async (registry) => {
  registry.addAction('materials.row.actions', () => <Button>Action</Button>, 'mymodule', 10);
}
```

### **Después** (Con permissions):
```typescript
setup: async (registry) => {
  registry.addAction(
    'materials.row.actions',
    () => <Button>Action</Button>,
    'mymodule',
    10,
    {
      requiredPermission: { module: 'mymodule', action: 'create' }  // ← ADD THIS
    }
  );
}
```

---

**Estado**: ✅ IMPLEMENTACIÓN COMPLETA - Listo para testing
