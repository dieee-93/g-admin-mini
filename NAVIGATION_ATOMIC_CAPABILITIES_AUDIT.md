# 🔍 Auditoría: Navegación + Atomic Capabilities Integration

**Fecha**: 2025-01-09
**Estado**: 🚨 CRITICAL ISSUES FOUND
**Prioridad**: HIGH

---

## 📊 Executive Summary

Se identificaron **desajustes críticos** entre el sistema de navegación y el sistema de Atomic Capabilities que **impiden que módulos se muestren correctamente** en la navegación.

### Impacto
- ❌ Módulos críticos como `dashboard`, `settings`, `staff` **nunca se muestran**
- ❌ Módulos avanzados (`gamification`, `executive`, `debug`) **bloqueados permanentemente**
- ❌ Mapeo incorrecto entre features → modules

---

## 🐛 Problemas Identificados

### 1. **CRITICAL: Módulos sin Features Asociadas**

**Ubicación**: `src/contexts/NavigationContext.tsx:833-919`

**Problema**:
```typescript
// NavigationContext.tsx:905
const hasCapabilityAccess = activeModules.includes(module.id);
```

`activeModules` viene de `getModulesForActiveFeatures()` que **SOLO retorna**:
- `sales`, `materials`, `products`, `operations`, `scheduling`, `customers`, `finance`, `mobile`, `multisite`, `analytics`

**Módulos que NUNCA aparecen**:
- ✗ `dashboard` - **Core module, debería estar SIEMPRE activo**
- ✗ `settings` - **Core module, debería estar SIEMPRE activo**
- ✗ `staff` - No hay features de STAFF domain en FeatureRegistry
- ✗ `fiscal` - FeatureRegistry retorna 'finance', no 'fiscal'
- ✗ `gamification` - No hay features de GAMIFICATION domain
- ✗ `executive` - No hay features de EXECUTIVE domain
- ✗ `finance-advanced` - No hay features mapeadas
- ✗ `operations-advanced` - No hay features mapeadas
- ✗ `advanced-tools` - No hay features mapeadas
- ✗ `debug` - Sí pasa la validación especial (línea 899), pero no aparece en activeModules

---

### 2. **Mapeo Incorrecto: Domain → Module ID**

**Ubicación**: `src/config/FeatureRegistry.ts:845-889`

**Problema**:
```typescript
switch (feature.domain) {
  case 'FINANCE':
    modules.add('finance');  // ❌ WRONG: NavigationContext usa 'fiscal'
    break;
  // ❌ MISSING: No cases para STAFF, GAMIFICATION, EXECUTIVE, etc.
}
```

**Desajustes encontrados**:
| Domain | FeatureRegistry retorna | NavigationContext espera | Status |
|--------|------------------------|-------------------------|--------|
| FINANCE | `finance` | `fiscal` + `finance-advanced` | ❌ MISMATCH |
| STAFF | ❌ NO EXISTE | `staff` | ❌ MISSING |
| GAMIFICATION | ❌ NO EXISTE | `gamification` | ❌ MISSING |
| EXECUTIVE | ❌ NO EXISTE | `executive` | ❌ MISSING |
| CORE | ❌ NO EXISTE | `dashboard`, `settings` | ❌ MISSING |

---

### 3. **Lógica de Filtrado Incorrecta**

**Ubicación**: `src/contexts/NavigationContext.tsx:905`

**Código actual**:
```typescript
const hasCapabilityAccess = activeModules.includes(module.id);
```

**Problema**: Compara directamente module.id con activeModules, pero:
- `module.id` = 'fiscal', 'staff', 'dashboard', etc.
- `activeModules` = ['sales', 'materials', 'finance', etc.]

**Resultado**: Módulos con nombres diferentes NUNCA pasan el filtro.

---

### 4. **Debug Module: Excepción Inefectiva**

**Ubicación**: `src/contexts/NavigationContext.tsx:898-901`

```typescript
if (module.id === 'debug') {
  return true; // Already passed role check above
}
```

**Problema**:
- Sí bypassa el capability check
- PERO luego `activeModules` no incluye 'debug'
- Entonces el módulo se filtra en `useMemo` y nunca llega al render

---

### 5. **Falta Sistema de "Always Active" Modules**

**Módulos que DEBERÍAN estar siempre activos**:
- ✅ `dashboard` - Core, siempre disponible
- ✅ `settings` - Core, siempre disponible
- ❓ `customers` - Depende de si venden (sales features)
- ❓ `staff` - Depende de si tienen empleados

**Actualmente**: NINGÚN módulo tiene flag de "always active"

---

## 🔧 Soluciones Propuestas

### Solución 1: **Mapeo Bidireccional Module ↔ Features**

Crear `MODULE_FEATURE_MAP` en `FeatureRegistry.ts`:

```typescript
export const MODULE_FEATURE_MAP: Record<string, {
  alwaysActive?: boolean;
  requiredFeatures?: FeatureId[];
  optionalFeatures?: FeatureId[];
}> = {
  'dashboard': { alwaysActive: true },
  'settings': { alwaysActive: true },
  'sales': {
    optionalFeatures: ['sales_order_management', 'sales_payment_processing']
  },
  'materials': {
    optionalFeatures: ['inventory_stock_tracking', 'inventory_alert_system']
  },
  'products': {
    optionalFeatures: ['production_recipe_management', 'production_kitchen_display']
  },
  'operations': {
    optionalFeatures: ['operations_table_management', 'operations_delivery_tracking']
  },
  'scheduling': {
    optionalFeatures: ['scheduling_appointment_booking', 'scheduling_calendar_management']
  },
  'staff': {
    optionalFeatures: ['scheduling_shift_management'] // Currently missing in registry
  },
  'customers': {
    optionalFeatures: ['customer_loyalty_program', 'customer_service_history']
  },
  'fiscal': {
    optionalFeatures: ['finance_invoice_scheduling', 'finance_corporate_accounts']
  },
  'gamification': { alwaysActive: true }, // Always show achievements
  'debug': { alwaysActive: true } // For SUPER_ADMIN
};
```

### Solución 2: **Nueva Función `getActiveModulesForFeatures()`**

```typescript
export function getActiveModulesForFeatures(features: FeatureId[]): string[] {
  const activeModules = new Set<string>();

  // Add always-active modules
  Object.entries(MODULE_FEATURE_MAP).forEach(([moduleId, config]) => {
    if (config.alwaysActive) {
      activeModules.add(moduleId);
    }
  });

  // Add modules with matching features
  Object.entries(MODULE_FEATURE_MAP).forEach(([moduleId, config]) => {
    if (config.optionalFeatures) {
      const hasAnyFeature = config.optionalFeatures.some(f => features.includes(f));
      if (hasAnyFeature) {
        activeModules.add(moduleId);
      }
    }
  });

  return Array.from(activeModules);
}
```

### Solución 3: **Actualizar NavigationContext Filtering**

```typescript
// NavigationContext.tsx:905 (FIXED)
const hasCapabilityAccess = activeModules.includes(module.id);

// REPLACE WITH:
const moduleConfig = MODULE_FEATURE_MAP[module.id];
const hasCapabilityAccess =
  moduleConfig?.alwaysActive ||
  activeModules.includes(module.id);
```

---

## 🧪 Plan de Testing con Chrome DevTools

### Test 1: Verificar Módulos Visibles (Sin Features)
1. Ir a `/debug/capabilities`
2. Desactivar TODAS las activities/infrastructure
3. Push to DB
4. Ir a `/admin/dashboard`
5. **Verificar**: ¿Se muestran módulos en sidebar?
   - ✅ ESPERADO: Dashboard, Settings, Gamification
   - ❌ ACTUAL: Ningún módulo (vacío)

### Test 2: Verificar Módulos después de Activar Features
1. Ir a `/debug/capabilities`
2. Activar `sells_products`
3. Push to DB
4. Ir a `/admin/dashboard`
5. **Verificar**: ¿Aparece módulo Sales?
   - ✅ ESPERADO: Sales, Dashboard, Settings
   - ❌ ACTUAL: Probablemente vacío o solo sales

### Test 3: Verificar Debug Module (SUPER_ADMIN)
1. Autenticarse como SUPER_ADMIN
2. Ir a `/admin/dashboard`
3. **Verificar**: ¿Aparece Debug en sidebar?
   - ✅ ESPERADO: Debug visible
   - ❌ ACTUAL: No visible (filtrado por activeModules)

---

## 📋 Checklist de Reparación

- [ ] Crear `MODULE_FEATURE_MAP` en `FeatureRegistry.ts`
- [ ] Crear función `getActiveModulesForFeatures()` mejorada
- [ ] Actualizar `capabilityStore.ts` para usar nueva función
- [ ] Actualizar `NavigationContext.tsx` filtrado (línea 905)
- [ ] Agregar features faltantes para STAFF domain
- [ ] Mapear correctamente 'fiscal' → 'finance' features
- [ ] Probar con Chrome DevTools (3 escenarios)
- [ ] Verificar que dashboard/settings SIEMPRE aparecen
- [ ] Verificar que debug aparece para SUPER_ADMIN
- [ ] Verificar que módulos desaparecen cuando se desactivan features

---

## 🎯 Próximos Pasos

1. **AHORA**: Probar con Chrome DevTools para confirmar el comportamiento
2. **Luego**: Implementar Solución 1 + 2 + 3
3. **Finalmente**: Re-test con Chrome DevTools para validar fix

---

**Estado**: PENDING CHROME DEVTOOLS TESTING
**Responsable**: Claude Code
**ETA**: 30 minutos
