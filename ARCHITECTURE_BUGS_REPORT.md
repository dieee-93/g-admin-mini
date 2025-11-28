# 🐛 Architecture Bugs & Inconsistencies Report

**Date:** 2025-11-16
**Severity:** MEDIUM - HIGH
**Impact:** Funcionalidad correcta pero código obsoleto y comentarios confusos

---

## 📋 Executive Summary

Durante la validación del refactor de `activeModules`, se encontraron **inconsistencias arquitecturales** relacionadas con capabilities obsoletas que aún tienen referencias en el código activo.

### Problemas Encontrados

| #  | Tipo | Severidad | Ubicación | Descripción |
|----|------|-----------|-----------|-------------|
| 1  | Referencia Obsoleta | MEDIUM | src/config/FeatureRegistry.ts:1250 | Comentario menciona `production_workflow` (eliminada) |
| 2  | Código Obsoleto | HIGH | src/modules/achievements/.../AchievementsWidget.tsx:31 | Hardcoded reference a `production_workflow` |
| 3  | Código Obsoleto | HIGH | src/modules/achievements/.../CapabilityProgressCard.tsx:41 | Hardcoded reference a `production_workflow` |
| 4  | Código Obsoleto | HIGH | src/pages/debug/feature-ui-mapping/...tsx:116,120 | Chequea `production_workflow` |
| 5  | Código Obsoleto | HIGH | src/pages/admin/supply-chain/products/hooks/useAvailableProductTypes.ts:42 | Usa `production_workflow` |
| 6  | Documentación | LOW | Múltiples archivos README y docs | Referencias a capabilities obsoletas |
| 7  | Log Duplicado | LOW | src/store/capabilityStore.ts:266-269 | Log redundante de persistencia (YA CORREGIDO) |

---

## 🔍 Detalle de Problemas

### Bug #0: CRÍTICO - rentals se activa incorrectamente 🚨

**Archivo:** `src/config/FeatureRegistry.ts:1342-1357` + `1458-1488`

**Problema:**
El módulo `rentals` se activa cuando el usuario solo tiene `inventory_stock_tracking` (de `physical_products`), SIN haber seleccionado la capability `asset_rental`.

**Root Cause:**
La lógica de `getModulesForActiveFeatures()` trata `optionalFeatures` como activadores independientes, incluso cuando existen `requiredFeatures`.

**Código Actual:**
```typescript
// rentals module config
'rentals': {
  requiredFeatures: [
    'rental_item_management',
    'rental_booking_calendar',
    'rental_availability_tracking'
  ],
  optionalFeatures: [
    'rental_pricing_by_duration',
    'rental_late_fees',
    'inventory_stock_tracking',  // ← BUG: Activa rentals sin tener rental features
    'scheduling_appointment_booking',
    'operations_vendor_performance',
    'inventory_available_to_promise'
  ]
}

// Logic (INCORRECTA)
if (hasAllRequired) {
  activeModules.add(moduleId);
  return;
}
if (hasAnyOptional) {  // ← Se ejecuta aunque required no se cumpla
  activeModules.add(moduleId);
}
```

**Flujo Incorrecto:**
```
User selects: physical_products
  ↓
Activates: inventory_stock_tracking
  ↓
rentals.requiredFeatures: NOT met (no rental features)
rentals.optionalFeatures: MET (inventory_stock_tracking present)
  ↓
rentals module ACTIVADO ❌ (INCORRECTO!)
```

**Impacto:**
- **CRÍTICO**: Módulo de rentals aparece en navegación sin razón
- Confusión para el usuario
- Puede exponer funcionalidad no contratada/configurada

**Solución Opción 1: Cambiar lógica (RECOMENDADO)**
```typescript
export function getModulesForActiveFeatures(features: FeatureId[]): string[] {
  const activeModules = new Set<string>();

  Object.entries(MODULE_FEATURE_MAP).forEach(([moduleId, config]) => {
    if (config.alwaysActive) {
      activeModules.add(moduleId);
      return;
    }

    // ✅ FIX: Si tiene requiredFeatures, DEBE cumplirlas
    if (config.requiredFeatures && config.requiredFeatures.length > 0) {
      const hasAllRequired = config.requiredFeatures.every(f => features.includes(f));
      if (hasAllRequired) {
        activeModules.add(moduleId);
        return; // optionalFeatures son bonus, no necesarios
      }
      // ❌ Si no cumple required, NO activar aunque tenga optional
      return;
    }

    // Solo para módulos SIN requiredFeatures (como materials)
    if (config.optionalFeatures && config.optionalFeatures.length > 0) {
      const hasAnyOptional = config.optionalFeatures.some(f => features.includes(f));
      if (hasAnyOptional) {
        activeModules.add(moduleId);
      }
    }
  });

  return Array.from(activeModules);
}
```

**Solución Opción 2: Limpiar optionalFeatures de rentals**
```typescript
'rentals': {
  requiredFeatures: [
    'rental_item_management',
    'rental_booking_calendar',
    'rental_availability_tracking'
  ],
  // ✅ Eliminar optionalFeatures que no son de rental
  optionalFeatures: [
    'rental_pricing_by_duration',
    'rental_late_fees'
    // ❌ REMOVED: inventory_stock_tracking (no debería activar rentals)
    // ❌ REMOVED: scheduling_appointment_booking
    // ❌ REMOVED: operations_vendor_performance
    // ❌ REMOVED: inventory_available_to_promise
  ]
}
```

**Módulos Afectados:**
Revisar TODOS los módulos con `requiredFeatures` + `optionalFeatures`:
- `rentals` ← CONFIRMADO BUGUEADO
- `memberships` (revisar)
- `assets` (revisar)
- Otros...

**Testing:**
```typescript
describe('getModulesForActiveFeatures - Bug #0', () => {
  it('should NOT activate rentals with only inventory features', () => {
    const features = ['inventory_stock_tracking'];
    const modules = getModulesForActiveFeatures(features);
    expect(modules).not.toContain('rentals');
  });

  it('should activate rentals only with rental features', () => {
    const features = [
      'rental_item_management',
      'rental_booking_calendar',
      'rental_availability_tracking'
    ];
    const modules = getModulesForActiveFeatures(features);
    expect(modules).toContain('rentals');
  });
});
```

---

### Bug #1: Comentario Obsoleto en FeatureRegistry

**Archivo:** `src/config/FeatureRegistry.ts:1250`

**Código Actual:**
```typescript
'production': {
  requiredFeatures: [
    'production_bom_management',
    'production_display_system',
    'production_order_queue'
  ],
  description: 'Módulo de producción - requiere TODAS las features de production (production_workflow capability)'
  //                                                                                 ^^^^^^^^^^^^^^^^^^^^
  //                                                                                 ❌ YA NO EXISTE
}
```

**Problema:**
El comentario menciona `production_workflow capability` pero esta capability fue **eliminada** y reemplazada por `physical_products`.

**Solución Recomendada:**
```typescript
description: 'Módulo de producción - activado por physical_products o professional_services'
```

**Impacto:** Confusión para desarrolladores

---

### Bug #2: AchievementsWidget - Referencia Hardcoded

**Archivo:** `src/modules/achievements/components/AchievementsWidget.tsx:31`

**Código Actual:**
```typescript
const CAPABILITY_NAMES = {
  // ... otras capabilities
  production_workflow: 'Producción',  // ❌ Ya no existe
  // ...
};
```

**Problema:**
Widget de achievements tiene referencia hardcoded a capability eliminada.

**Impacto:**
- El widget puede intentar mostrar progreso para una capability inexistente
- Si un usuario tuvo `production_workflow` en el pasado (migraciones), esto causaría inconsistencias

**Solución Recomendada:**
```typescript
// Eliminar la referencia obsoleta
const CAPABILITY_NAMES = {
  // ... otras capabilities
  // production_workflow removed - now handled by physical_products
};
```

---

### Bug #3: CapabilityProgressCard - Referencia Hardcoded

**Archivo:** `src/modules/achievements/components/CapabilityProgressCard.tsx:41`

**Código Actual:**
```typescript
const capabilityIcons = {
  // ... otras capabilities
  production_workflow: { name: 'Producción', icon: '🏭' },  // ❌ Ya no existe
  // ...
};
```

**Problema:**
Mismo problema que Bug #2, diferentes componentes.

**Solución Recomendada:**
Eliminar referencia obsoleta

---

### Bug #4: Feature UI Mapping Debugger - Lógica Obsoleta

**Archivo:** `src/pages/debug/feature-ui-mapping/FeatureUIMappingDebugger.tsx:116,120`

**Código Actual:**
```typescript
{
  requiredCapabilities: ['production_workflow'],  // ❌ Ya no existe
  // ...
  return profile?.selectedActivities?.includes('production_workflow') || false;
       //                                      ^^^^^^^^^^^^^^^^^^^^
       //                                      ❌ Ya no existe
}
```

**Problema:**
Debugger tiene lógica que chequea una capability obsoleta.

**Impacto:**
- Tool de debugging mostrará información incorrecta
- Desarrolladores pueden confundirse al debuggear

**Solución Recomendada:**
```typescript
{
  requiredCapabilities: ['physical_products'], // ✅ Updated
  return profile?.selectedCapabilities?.includes('physical_products') || false;
}
```

---

### Bug #5: useAvailableProductTypes - Lógica Obsoleta

**Archivo:** `src/pages/admin/supply-chain/products/hooks/useAvailableProductTypes.ts:39-54`

**Código Actual:**
```typescript
// Disponible si hay onsite_service O production_workflow
hasAccess:
  activeCapabilities.includes('onsite_service') ||
  activeCapabilities.includes('production_workflow') ||  // ❌ Ya no existe
  // ...
recommendedCapabilities: ['production_workflow']  // ❌ Ya no existe
```

**Problema:**
Hook que determina qué tipos de productos están disponibles usa capability obsoleta.

**Impacto:**
- **ALTO**: Puede afectar qué tipos de productos se muestran disponibles en la UI
- Lógica de negocio incorrecta

**Solución Recomendada:**
```typescript
// Disponible si hay onsite_service O physical_products
hasAccess:
  activeCapabilities.includes('onsite_service') ||
  activeCapabilities.includes('physical_products') ||  // ✅ Updated
  // ...
recommendedCapabilities: ['physical_products']  // ✅ Updated
```

---

## 🎯 Plan de Corrección

### Prioridad ALTA (Afecta Funcionalidad)

1. ✅ **Bug #5 - useAvailableProductTypes.ts**
   - **Riesgo:** ALTO - Afecta tipos de productos disponibles
   - **Acción:** Reemplazar `production_workflow` por `physical_products`

2. ✅ **Bug #4 - FeatureUIMappingDebugger.tsx**
   - **Riesgo:** MEDIO - Debugging tool incorrecto
   - **Acción:** Actualizar lógica de capabilities

3. ✅ **Bug #2 & #3 - Achievements Components**
   - **Riesgo:** MEDIO - UI puede mostrar info incorrecta
   - **Acción:** Eliminar referencias obsoletas

### Prioridad MEDIA (Mantenibilidad)

4. ✅ **Bug #1 - FeatureRegistry Comment**
   - **Riesgo:** BAJO - Solo comentario
   - **Acción:** Actualizar comentario

### Prioridad BAJA (Documentación)

5. ⏳ **READMEs y Docs**
   - **Riesgo:** BAJO - No afecta código runtime
   - **Acción:** Actualizar cuando sea conveniente

---

## 🧪 Testing Recomendado

Después de aplicar fixes:

### Test 1: Product Types Availability
```typescript
describe('useAvailableProductTypes', () => {
  it('should show prepared_food when physical_products capability active', () => {
    // Mock profile with physical_products
    // Verify prepared_food is available
  });

  it('should NOT check for production_workflow', () => {
    // Verify no reference to obsolete capability
  });
});
```

### Test 2: Achievements System
```typescript
describe('AchievementsWidget', () => {
  it('should not render progress for production_workflow', () => {
    // Verify obsolete capability is not displayed
  });

  it('should handle legacy data with production_workflow gracefully', () => {
    // Test migration scenario
  });
});
```

---

## 📊 Migration Impact Analysis

### ¿Qué pasa con datos legacy?

Si hay usuarios que tenían `production_workflow` en la DB:

**Escenario 1: LocalStorage**
```typescript
// OLD (localStorage):
{
  selectedCapabilities: ['production_workflow']
}

// NEW (expected):
{
  selectedCapabilities: ['physical_products']
}
```

**Solución:** Migration script en `capabilityStore.ts`:
```typescript
onRehydrateStorage: (state) => {
  if (state?.profile?.selectedCapabilities.includes('production_workflow')) {
    // Auto-migrate to physical_products
    state.profile.selectedCapabilities = [
      ...state.profile.selectedCapabilities.filter(c => c !== 'production_workflow'),
      'physical_products'
    ];
  }
}
```

**Escenario 2: Supabase DB**
```sql
-- Check if any profiles have production_workflow
SELECT COUNT(*)
FROM business_profiles
WHERE selected_capabilities @> '["production_workflow"]';

-- If any found, run migration:
UPDATE business_profiles
SET selected_capabilities =
  array_remove(selected_capabilities, 'production_workflow') ||
  '{physical_products}'::text[]
WHERE selected_capabilities @> '["production_workflow"]';
```

---

## ✅ Validation Checklist

### Code Cleanup
- [ ] Fix Bug #1 - Update comment in FeatureRegistry.ts
- [ ] Fix Bug #2 - Remove production_workflow from AchievementsWidget.tsx
- [ ] Fix Bug #3 - Remove production_workflow from CapabilityProgressCard.tsx
- [ ] Fix Bug #4 - Update FeatureUIMappingDebugger.tsx
- [ ] Fix Bug #5 - Fix useAvailableProductTypes.ts

### Data Migration
- [ ] Add migration logic to capabilityStore for localStorage
- [ ] Run SQL migration for Supabase DB (if applicable)
- [ ] Test with legacy data

### Testing
- [ ] Unit tests for useAvailableProductTypes
- [ ] Integration test for capability toggle
- [ ] E2E test for product type selection
- [ ] Verify achievements system works

### Documentation
- [ ] Update inline comments
- [ ] Update READMEs (low priority)
- [ ] Document migration in CHANGELOG

---

## 🚨 Recomendación Inmediata

**¿Corregir ahora?**

Sí, especialmente **Bug #5** (useAvailableProductTypes.ts) porque:
- Afecta lógica de negocio (qué productos se pueden crear)
- Fácil de corregir (buscar/reemplazar)
- Riesgo bajo de romper algo (solo actualizar capability ID)

**Orden sugerido de fixes:**
1. Bug #5 (useAvailableProductTypes) - 2 min
2. Bug #4 (FeatureUIMappingDebugger) - 2 min
3. Bug #2 & #3 (Achievements) - 3 min
4. Bug #1 (Comment) - 1 min
**Total: ~8 minutos**

---

## 📝 Conclusión

### Hallazgos Principales

1. **✅ Arquitectura Core es Correcta**
   - `physical_products` → features → `production` module ✓
   - `getActiveModules()` funciona correctamente ✓
   - Single Source of Truth mantenida ✓

2. **⚠️ Referencias Obsoletas en Código Activo**
   - 5 bugs encontrados con `production_workflow`
   - Principalmente en features secundarias (achievements, debugging)
   - **1 bug crítico en lógica de negocio** (useAvailableProductTypes)

3. **✅ Log Duplicado Corregido**
   - Eliminado log redundante en toggleCapability

### Next Steps

1. Aplicar fixes para bugs #1-5 (~8 minutos)
2. Agregar tests para prevenir regresiones
3. Considerar migration script si hay datos legacy
4. Actualizar documentación (opcional, baja prioridad)

---

**Status:** ✅ **VALIDATED** - Bugs identificados, soluciones propuestas
**Confidence:** HIGH - Todos los problemas son corregibles fácilmente
**Risk Level:** MEDIUM - Un bug afecta lógica de negocio, resto son secundarios

