# SHIFT CONTROL VALIDATION - AUDIT & FIX REQUIRED

**Created**: 2025-12-08
**Priority**: HIGH
**Scope**: Shift Control close validation + Module navigation system

---

## 🔴 PROBLEMAS IDENTIFICADOS

### **Problema 1: Módulo fulfillment-onsite NO aparece en navegación (BUG)**

**Descripción:**
- Usuario activó capability `onsite_service` en business_profile
- El módulo `fulfillment-onsite` sigue sin aparecer en sidebar navigation
- Manifest está correctamente registrado en `src/modules/index.ts`

**Estado actual:**
```json
// business_profiles (después de activar)
{
  "active_capabilities": ["physical_products", "pickup_orders", "onsite_service"],
  "id": "3ab0829b-69f7-4c3f-87c7-606072cae633"
}
```

**Manifest:**
```typescript
// src/modules/fulfillment/onsite/manifest.tsx
export const fulfillmentOnsiteManifest: ModuleManifest = {
  id: 'fulfillment-onsite',
  name: 'Fulfillment - Onsite Service',
  requiredFeatures: ['operations_table_management'],
  navigation: {
    route: '/admin/operations/fulfillment/onsite',
    icon: BuildingStorefrontIcon,
    domain: 'operations'
  }
}
```

**Hipótesis:**
- El sistema de navegación (`useModuleNavigation.ts`) filtra por `activeModules` de capabilityStore
- Capability `onsite_service` no está mapeada correctamente a feature `operations_table_management`
- O el módulo no está en el array de `activeModules` generado por `getActiveModules()`

---

### **Problema 2: Validación de cierre NO es dinámica según capabilities (DISEÑO)**

**Descripción:**
- El usuario NO tenía capability `onsite_service` activada
- Sin embargo, la validación de cierre de turno chequeaba mesas ocupadas
- Resultado: "No se puede cerrar turno - Hay 2 mesa(s) abierta(s)"
- **Esto viola el principio de validaciones dinámicas**

**Código actual:**
```typescript
// src/modules/shift-control/services/shiftService.ts:202-217
// ❌ PROBLEMA: Siempre ejecuta la validación de mesas
const { data: openTables } = await supabase
  .from('tables')
  .select('id, number')
  .eq('status', 'occupied');

if (openTables && openTables.length > 0) {
  blockers.push({
    type: 'open_tables',
    message: `Hay ${openTables.length} mesa(s) abierta(s)`,
    affectedFeature: 'sales_pos',
  });
}
```

**¿De dónde vienen las 2 mesas ocupadas?**
```sql
SELECT id, number, status FROM tables;
-- Result:
-- Table 1: status = 'occupied'
-- Table 2: status = 'occupied'
-- Table 3: status = 'available'
-- Table 4: status = 'reserved'
-- Table 5: status = 'available'
```

**Comportamiento esperado:**
- Si `onsite_service` NO está activo → NO validar mesas
- Si `operations_table_management` feature NO está activa → NO validar mesas
- Validaciones deben ser dinámicas según capabilities/features activas

---

## 🎯 SOLUCIÓN REQUERIDA

### **Fix 1: Resolver navegación de fulfillment-onsite**

**Tareas:**

1. **Verificar mapping capability → feature**
   - Archivo: `src/config/FeatureRegistry.ts`
   - Verificar que `onsite_service` capability active `operations_table_management` feature
   - O que el mapping esté en `BusinessModelRegistry.ts`

2. **Verificar getActiveModules() en capabilityStore**
   - Archivo: `src/store/capabilityStore.ts`
   - Revisar método `getActiveModules()`
   - Verificar que `fulfillment-onsite` esté incluido cuando `operations_table_management` está activa

3. **Debug logs**
   - Agregar logs en `useModuleNavigation.ts` línea 186
   - Ver por qué `fulfillment-onsite` no pasa el filtro `activeModules.includes(manifest.id)`

4. **Verificar MODULE_FEATURE_MAP**
   - Archivo: `src/config/FeatureRegistry.ts`
   - Verificar que `fulfillment-onsite` esté mapeado correctamente

**Comando de debug:**
```typescript
// En useModuleNavigation.ts después de línea 186
console.log('DEBUG fulfillment-onsite:', {
  manifestId: manifest.id,
  activeModules,
  isIncluded: activeModules.includes(manifest.id),
  requiredFeatures: manifest.requiredFeatures
});
```

---

### **Fix 2: Hacer validaciones dinámicas según capabilities**

**Principio arquitectónico:**
> Las validaciones del shift control deben ejecutarse SOLO si la capability/feature está activa

**Implementación:**

```typescript
// src/modules/shift-control/services/shiftService.ts

async function validateCloseShift(shiftId: string): Promise<CloseValidationResult> {
  const blockers: ValidationBlocker[] = [];
  const warnings: ValidationWarning[] = [];

  // ✅ NUEVO: Obtener capabilities activas
  const { useCapabilityStore } = await import('@/store/capabilityStore');
  const hasFeature = useCapabilityStore.getState().hasFeature;

  // 1. Cash Session Check
  if (hasFeature('sales_payment_processing') || hasFeature('sales_pos')) {
    // ... validación de caja
  }

  // 2. Open Tables Check
  // ✅ SOLO si onsite service está activo
  if (hasFeature('operations_table_management')) {
    const { data: openTables } = await supabase
      .from('tables')
      .select('id, number')
      .eq('status', 'occupied');

    if (openTables && openTables.length > 0) {
      blockers.push({
        type: 'open_tables',
        message: `Hay ${openTables.length} mesa(s) abierta(s)`,
        affectedFeature: 'operations_table_management',
      });
    }
  }

  // 3. Active Deliveries Check
  if (hasFeature('sales_delivery_orders') || hasFeature('operations_delivery_zones')) {
    // ... validación de deliveries
  }

  // 4. Pending Orders Check
  if (hasFeature('sales_order_management')) {
    // ... validación de órdenes
  }

  // 5. Pending Rental Returns Check
  if (hasFeature('asset_rental')) {
    // ... validación de devoluciones
  }

  // Warnings también condicionales
  if (hasFeature('staff_employee_management')) {
    // ... warning de staff sin checkout
  }

  if (hasFeature('inventory_stock_tracking')) {
    // ... warning de stock bajo
  }

  return {
    canClose: blockers.length === 0,
    blockers,
    warnings
  };
}
```

**Archivos a modificar:**
1. `src/modules/shift-control/services/shiftService.ts` (líneas 150-416)
   - Agregar checks de features antes de cada validación
   - Usar `hasFeature()` de capabilityStore

2. `src/modules/shift-control/types/index.ts`
   - Actualizar `ValidationBlocker.affectedFeature` para usar `FeatureId` tipo correcto

---

## 📋 DATOS DE CONTEXTO

### **Business Profile actual**
```json
{
  "id": "3ab0829b-69f7-4c3f-87c7-606072cae633",
  "active_capabilities": ["physical_products", "pickup_orders", "onsite_service"],
  "selected_activities": [
    "pickup_orders",
    "delivery_shipping",
    "production_workflow",
    "appointment_based",
    "async_operations"
  ]
}
```

### **Estado de tables en DB**
```sql
-- 5 tables total:
-- 2 occupied (Mesa 1, Mesa 2)
-- 2 available (Mesa 3, Mesa 5)
-- 1 reserved (Mesa 4)
```

### **Módulos registrados**
```typescript
// src/modules/index.ts - línea 170
fulfillmentOnsiteManifest,  // ✅ Registrado correctamente
```

### **Sistema de navegación**
```typescript
// src/lib/modules/useModuleNavigation.ts:186
const hasCapabilityAccess = activeModules.includes(manifest.id);
// ❌ fulfillment-onsite no está en activeModules
```

---

## 🔍 PASOS DE INVESTIGACIÓN

### **Paso 1: Verificar feature activation**
```typescript
// En browser console:
const store = useCapabilityStore.getState();
console.log('Active features:', store.features.activeFeatures);
console.log('Has operations_table_management:', store.hasFeature('operations_table_management'));
console.log('Active modules:', store.getActiveModules());
```

### **Paso 2: Verificar mapping de capabilities**
```typescript
// Revisar en src/config/BusinessModelRegistry.ts
const onsiteService = BUSINESS_CAPABILITIES.find(c => c.id === 'onsite_service');
console.log('Onsite features:', onsiteService?.features);
// Debe incluir 'operations_table_management'
```

### **Paso 3: Verificar getActiveModules()**
```typescript
// En src/store/capabilityStore.ts
// Buscar método getActiveModules()
// Verificar que llama a getModulesForActiveFeatures()
// Verificar que 'fulfillment-onsite' está en MODULE_FEATURE_MAP
```

---

## ✅ CRITERIOS DE ÉXITO

**Fix 1 completado cuando:**
- [ ] `fulfillment-onsite` aparece en sidebar bajo "Operations"
- [ ] Ruta `/admin/operations/fulfillment/onsite` es accesible
- [ ] FloorPlanView muestra las mesas correctamente

**Fix 2 completado cuando:**
- [ ] Con `onsite_service` DESACTIVADO → NO valida mesas al cerrar turno
- [ ] Con `onsite_service` ACTIVADO → SÍ valida mesas al cerrar turno
- [ ] Todas las validaciones son condicionales según features
- [ ] Tests actualizados para verificar comportamiento dinámico

---

## 📝 NOTAS ADICIONALES

**Archivos clave:**
- `src/modules/shift-control/services/shiftService.ts` (validaciones)
- `src/lib/modules/useModuleNavigation.ts` (filtro de navegación)
- `src/store/capabilityStore.ts` (getActiveModules)
- `src/config/FeatureRegistry.ts` (mappings)
- `src/config/BusinessModelRegistry.ts` (capabilities)

**Documentación relevante:**
- `docs/shift-control/SHIFT_LIFECYCLE_BY_CAPABILITY.md` (validaciones por capability)
- `docs/architecture/CAPABILITY_SYSTEM.md` (sistema de capabilities)

**Testing:**
```bash
# Después de fix, verificar:
1. Activar onsite_service → módulo aparece
2. Desactivar onsite_service → módulo desaparece
3. Cerrar turno sin onsite_service → no valida mesas
4. Cerrar turno con onsite_service + mesas ocupadas → bloquea cierre
```

---

## 🚀 PROMPT PARA NUEVO AGENTE

```
Necesito resolver 2 problemas críticos en el sistema de shift control:

1. **Bug de navegación**: El módulo fulfillment-onsite no aparece en sidebar
   aunque la capability onsite_service está activa.

2. **Diseño inconsistente**: Las validaciones de cierre de turno NO son
   dinámicas - validan mesas aunque la capability onsite_service no esté activa.

Lee el archivo SHIFT_CONTROL_VALIDATION_AUDIT.md para detalles completos.

TASKS:
1. Investigar por qué fulfillment-onsite no está en activeModules[]
2. Agregar checks de hasFeature() antes de CADA validación en validateCloseShift()
3. Verificar que affectedFeature en cada blocker sea correcto
4. Testear ambos escenarios (capability on/off)

IMPORTANTE: Seguir arquitectura de capabilities del proyecto.
```
