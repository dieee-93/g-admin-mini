# CAPABILITY CLEANUP - COMPLETE ✅

**Fecha**: 2025-01-30
**Estado**: ✅ COMPLETADO
**Build**: ✅ PASA (TypeScript + ESLint)

---

## 🎯 OBJETIVO

Eliminar TODO lo relacionado con `hasFeature` y `CapabilityGate` del código para evitar confusiones arquitectónicas.

---

## ✅ CAMBIOS REALIZADOS

### 1. Componentes Modificados

#### SalesActions.tsx
- ❌ Eliminado: Prop `hasCapability`
- ❌ Eliminado: `disabled={!hasCapability('pos_system')}` en 3 botones
- ✅ Resultado: Todos los botones siempre visibles (control vía Module Registry)

**Archivos**:
- `src/pages/admin/operations/sales/components/SalesActions.tsx`

---

#### MaterialsActions.tsx
- ❌ Eliminado: Prop `hasCapability`
- ❌ Eliminado: Condicional `{hasCapability('bulk_operations') && <Button>}`
- ✅ Resultado: "Operaciones Masivas" siempre visible

**Archivos**:
- `src/pages/admin/supply-chain/materials/components/MaterialsActions/MaterialsActions.tsx`

---

### 2. Páginas Modificadas

#### Sales Page
- ❌ Eliminado: `const { hasFeature } = useCapabilities()`
- ❌ Eliminado: `import { CapabilityGate, useCapabilities }`
- ❌ Eliminado: `<CapabilityGate capability="sells_products">` wrapper
- ❌ Eliminado: Prop `hasCapability={hasFeature}` en SalesActions
- ✅ Agregado: Comentario "Capabilities checked at module load time"

**Archivos**:
- `src/pages/admin/operations/sales/page.tsx`

---

#### Materials Page
- ❌ Eliminado: `const { hasFeature } = useCapabilities()`
- ❌ Eliminado: `import { CapabilityGate, useCapabilities }`
- ❌ Eliminado: `<CapabilityGate>` wrappers (2 instancias)
- ❌ Eliminado: Prop `hasCapability={hasFeature}` en MaterialsActions
- ✅ Agregado: Comentario "Capabilities checked at module load time"

**Archivos**:
- `src/pages/admin/supply-chain/materials/page.tsx`

---

#### Staff Page
- ❌ Eliminado: `const { hasFeature } = useCapabilities()`
- ❌ Eliminado: `import { CapabilityGate, useCapabilities }`
- ❌ Eliminado: Comentarios sobre CapabilityGate
- ✅ Actualizado: Comentarios a "Module Registry Hooks"

**Archivos**:
- `src/pages/admin/resources/staff/page.tsx`

---

#### Products Page
- ❌ Eliminado: `import { CapabilityGate }`
- ❌ Eliminado: 6 instancias de `<CapabilityGate capability="...">` wrappers
  - can_view_menu_engineering (4 instancias)
  - can_view_cost_analysis (2 instancias)

**Archivos**:
- `src/pages/admin/supply-chain/products/page.tsx`

---

#### Suppliers Page
- ❌ Eliminado: `import { CapabilityGate }`
- ❌ Eliminado: `<CapabilityGate capability="inventory_supplier_management">` wrapper
- ✅ Resultado: Todo el contenido siempre visible

**Archivos**:
- `src/pages/admin/supply-chain/suppliers/page.tsx`

---

#### Supplier Orders Page
- ❌ Eliminado: `import { CapabilityGate }`
- ❌ Eliminado: `<CapabilityGate capability="inventory_supplier_management">` wrapper

**Archivos**:
- `src/pages/admin/supply-chain/supplier-orders/page.tsx`

---

#### SchedulingActions Component
- ❌ Eliminado: `import { CapabilityGate }`
- ❌ Eliminado: 4 instancias de `<CapabilityGate>` wrappers
  - schedule_management (2 instancias)
  - view_labor_costs (2 instancias)

**Archivos**:
- `src/pages/admin/resources/scheduling/components/SchedulingActions/SchedulingActions.tsx`

---

### 3. Sistema de Capabilities

#### capabilities/index.ts
- ❌ Eliminado: Export `CapabilityGate` (era un stub vacío)
- ❌ Eliminado: JSDoc deprecated warnings
- ✅ Actualizado: Comentarios documentando que se usa Hook System

**Archivos**:
- `src/lib/capabilities/index.ts`

---

## 📊 RESUMEN NUMÉRICO

### Archivos Modificados: **10 archivos**

1. `src/pages/admin/operations/sales/page.tsx`
2. `src/pages/admin/operations/sales/components/SalesActions.tsx`
3. `src/pages/admin/supply-chain/materials/page.tsx`
4. `src/pages/admin/supply-chain/materials/components/MaterialsActions/MaterialsActions.tsx`
5. `src/pages/admin/resources/staff/page.tsx`
6. `src/pages/admin/supply-chain/products/page.tsx`
7. `src/pages/admin/supply-chain/suppliers/page.tsx`
8. `src/pages/admin/supply-chain/supplier-orders/page.tsx`
9. `src/pages/admin/resources/scheduling/components/SchedulingActions/SchedulingActions.tsx`
10. `src/lib/capabilities/index.ts`

### Líneas Eliminadas:
- `hasFeature` destructuring: **3 líneas**
- `hasFeature` usage en props: **2 líneas**
- `hasCapability` conditional rendering: **4 líneas**
- `CapabilityGate` imports: **7 líneas**
- `<CapabilityGate>` wrappers: **18+ líneas** (9 open + 9 close tags)
- Props `hasCapability`: **2 líneas**
- `CapabilityGate` export: **4 líneas**

**Total aproximado**: **~45 líneas eliminadas**

---

## ✅ VERIFICACIÓN

### TypeScript
```bash
pnpm -s exec tsc --noEmit
# ✅ PASA - 0 errores
```

### ESLint
```bash
pnpm -s exec eslint .
# ✅ PASA - Solo warnings pre-existentes no relacionados
```

### Referencias Restantes
```bash
grep -r "hasFeature\|CapabilityGate" src/pages --exclude-dir=__tests__
# ✅ Solo 3 líneas - Todas comentarios
```

---

## 🎯 ARQUITECTURA RESULTANTE

### ANTES (Confuso):
```typescript
// 3 formas de controlar features:
1. Module Registry (requiredFeatures en manifest)
2. hasFeature && conditional rendering
3. <CapabilityGate> wrapper components

// ❌ Problema: Confusión sobre cuándo usar qué
```

### DESPUÉS (Claro):
```typescript
// 1 ÚNICA forma de controlar features:
1. Module Registry controla TODO
   - requiredFeatures → Módulo se carga o no
   - Hook System → Extensiones cross-module

// ✅ Beneficio: Arquitectura clara y predecible
```

---

## 📖 PATRÓN CORRECTO

### ❌ NO HACER (Eliminado):
```typescript
const { hasFeature } = useCapabilities();

{hasFeature('suppliers') && <Button>Create PO</Button>}

<CapabilityGate capability="inventory">
  <InventoryComponent />
</CapabilityGate>
```

### ✅ HACER (Actual):
```typescript
// Capabilities checked at module load time via Module Registry

// Control de módulos completos:
// src/modules/suppliers/manifest.tsx
export const suppliersManifest = {
  requiredFeatures: ['inventory_supplier_management']
  // Si feature NO activa → módulo NO se carga
};

// Control de botones cross-module:
// src/modules/suppliers/manifest.tsx
setup: (registry) => {
  registry.addAction('materials.row.actions',
    () => <Button>Create PO</Button>,
    'suppliers'
  );
}

// src/pages/admin/supply-chain/materials/components/Grid.tsx
<HookPoint name="materials.row.actions" data={material} />
// Suppliers button aparece solo si Suppliers está activo
```

---

## 🚀 PRÓXIMOS PASOS

### Completar Hook System en Materials:

1. **Agregar HookPoints en MaterialsGrid**:
```typescript
<HookPoint name="materials.row.actions" data={item} />
```

2. **Verificar que Suppliers/Products registren hooks**:
```typescript
// src/modules/suppliers/manifest.tsx
setup: (registry) => {
  registry.addAction('materials.row.actions', ...);
}
```

3. **Testing**:
   - Activar Suppliers → Verificar botón "Create PO" aparece
   - Desactivar Suppliers → Verificar botón NO aparece
   - Sin editar Materials

---

## 📚 DOCUMENTACIÓN RELACIONADA

- **Hook System explicado**: `HOOK_SYSTEM_VS_HASFEATURE.md`
- **Materials analysis**: `MATERIALS_MODULE_DEEP_ANALYSIS.md`
- **Module Registry guide**: `src/modules/README.md`

---

## ✅ CONCLUSIÓN

**Estado**: ✅ Limpieza completa
**Build**: ✅ Pasa
**Arquitectura**: ✅ Simplificada a 1 único patrón (Hook System)
**Next**: Implementar HookPoints en Materials para completar la migración

**Beneficio**: Ya no hay confusión sobre hasFeature vs CapabilityGate vs Hook System.
**Regla**: Si necesitas conditional rendering cross-module → USA HOOK SYSTEM.
