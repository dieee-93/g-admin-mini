# Dynamic MODULE_FEATURE_MAP Migration

**Date**: December 21, 2025  
**Version**: 3.0.0  
**Status**: ✅ Complete

## 🎯 Objetivo

Eliminar la duplicación de código entre:
- `ModuleManifest` (`requiredFeatures`, `optionalFeatures`)
- `MODULE_FEATURE_MAP` (definición manual duplicada)

## 🏗️ Solución Implementada

### Antes (v2.0 - Manual)
```typescript
// src/modules/fulfillment/manifest.tsx
export const fulfillmentManifest: ModuleManifest = {
  id: 'fulfillment',
  requiredFeatures: ['sales_order_management'],
  optionalFeatures: ['operations_table_management', ...],
  // ...
};

// src/config/FeatureRegistry.ts - DUPLICACIÓN ❌
export const MODULE_FEATURE_MAP = {
  'fulfillment': {
    requiredFeatures: ['sales_order_management'],
    optionalFeatures: ['operations_table_management', ...],
  },
  // Había que agregarlo manualmente (propenso a errores)
};
```

**Problemas**:
- ❌ Duplicación de código
- ❌ Fácil olvidar agregar módulos nuevos
- ❌ Inconsistencias entre manifest y map
- ❌ Más mantenimiento

### Después (v3.0 - Dinámico) ✅
```typescript
// src/modules/fulfillment/manifest.tsx - ÚNICA FUENTE DE VERDAD
export const fulfillmentManifest: ModuleManifest = {
  id: 'fulfillment',
  requiredFeatures: ['sales_order_management'],
  optionalFeatures: ['operations_table_management', ...],
  // ...
};

// src/config/FeatureRegistry.ts - GENERACIÓN AUTOMÁTICA
export function getDynamicModuleFeatureMap() {
  // Lee desde ModuleRegistry automáticamente
  const modules = ModuleRegistry.getInstance().getAll();
  // Genera el mapa dinámicamente
  return buildMapFromManifests(modules);
}
```

**Ventajas**:
- ✅ DRY (Don't Repeat Yourself)
- ✅ Imposible olvidar agregar módulos
- ✅ Una sola fuente de verdad (manifest)
- ✅ Menos código que mantener

## 📁 Archivos Modificados

### 1. `src/config/FeatureRegistry.ts`
- ➕ `getDynamicModuleFeatureMap()` - Genera mapa desde manifests
- ➕ `clearModuleFeatureMapCache()` - Limpia cache cuando cambian módulos
- 🔄 `getModulesForActiveFeatures()` - Usa mapa dinámico
- ⚠️ `MODULE_FEATURE_MAP` - Marcado como deprecated (mantener por compatibilidad)

### 2. `src/lib/modules/useModuleNavigation.ts`
- 🔄 Import cambiado de `MODULE_FEATURE_MAP` a `getDynamicModuleFeatureMap()`
- 🔄 Usa función dinámica en lugar de constante estática

### 3. `src/lib/modules/ModuleRegistry.ts`
- ➕ Cache clearing en `register()` - Limpia cache al registrar módulos nuevos

## 🎨 Arquitectura

```
┌─────────────────────────────────────────────────┐
│ ModuleManifest (ÚNICA FUENTE DE VERDAD)        │
│ - requiredFeatures                              │
│ - optionalFeatures                              │
│ - autoInstall                                   │
└────────────────┬────────────────────────────────┘
                 │
                 │ Registrado en
                 ▼
┌─────────────────────────────────────────────────┐
│ ModuleRegistry                                  │
│ registry.register(manifest)                     │
│ registry.getAll() → módulos registrados         │
└────────────────┬────────────────────────────────┘
                 │
                 │ Leído por
                 ▼
┌─────────────────────────────────────────────────┐
│ getDynamicModuleFeatureMap() (CON CACHE)       │
│ Lee manifests → Genera mapa automático          │
└────────────────┬────────────────────────────────┘
                 │
                 │ Usado por
                 ▼
┌─────────────────────────────────────────────────┐
│ useModuleNavigation() Hook                      │
│ Determina módulos visibles en sidebar           │
└─────────────────────────────────────────────────┘
```

## 🚀 Performance

**Cache Strategy**:
```typescript
let _cachedModuleFeatureMap: Record<...> | null = null;

export function getDynamicModuleFeatureMap() {
  // Return cached version (rápido - O(1))
  if (_cachedModuleFeatureMap) {
    return _cachedModuleFeatureMap;
  }
  
  // Build from manifests (solo primera vez o después de clear)
  const map = buildFromManifests();
  _cachedModuleFeatureMap = map;
  return map;
}
```

- ✅ Primera llamada: construye mapa (lento - O(n))
- ✅ Llamadas subsecuentes: retorna cache (rápido - O(1))
- ✅ Cache se limpia al registrar nuevos módulos
- ✅ No impact en renders subsecuentes

## 🧪 Testing

El mapa estático `MODULE_FEATURE_MAP` se mantiene como **deprecated** para:
- Tests existentes que lo usan directamente
- Compatibilidad hacia atrás temporalmente
- Validaciones de arquitectura

**Plan de migración de tests**:
```typescript
// ❌ Viejo (deprecated)
import { MODULE_FEATURE_MAP } from '@/config/FeatureRegistry';
expect(MODULE_FEATURE_MAP['fulfillment']).toBeDefined();

// ✅ Nuevo (recomendado)
import { getDynamicModuleFeatureMap } from '@/config/FeatureRegistry';
const map = getDynamicModuleFeatureMap();
expect(map['fulfillment']).toBeDefined();
```

## 📋 Checklist de Migración

- [x] Crear `getDynamicModuleFeatureMap()` function
- [x] Agregar cache con `clearModuleFeatureMapCache()`
- [x] Actualizar `getModulesForActiveFeatures()` para usar mapa dinámico
- [x] Actualizar `useModuleNavigation()` para usar función dinámica
- [x] Integrar cache clearing en `ModuleRegistry.register()`
- [x] Marcar `MODULE_FEATURE_MAP` como deprecated
- [ ] Migrar tests para usar función dinámica
- [ ] Remover `MODULE_FEATURE_MAP` estático (futura v4.0)

## 🎓 Best Practice - Respuesta a la Pregunta

**Pregunta**: ¿Es mejor mantener MODULE_FEATURE_MAP manual o automático?

**Respuesta**: **AUTOMÁTICO** (v3.0) es definitivamente la mejor práctica porque:

### Ventajas del Sistema Dinámico:

1. **DRY (Don't Repeat Yourself)**
   - Una sola definición en el manifest
   - No duplicación de features

2. **Single Source of Truth**
   - El manifest es la única fuente
   - Imposible inconsistencias

3. **Menos propenso a errores**
   - No puedes olvidar agregar un módulo
   - Auto-actualización cuando se registra módulo

4. **Más fácil de mantener**
   - Solo editas el manifest
   - El sistema hace el resto

5. **Mejor escalabilidad**
   - Agregar 10 módulos nuevos → 0 cambios en FeatureRegistry
   - Sistema mantiene sincronización automática

### Cuándo usar Manual (deprecated):
- ❌ Nunca para nuevos módulos
- ⚠️ Solo para tests legacy temporalmente
- ⚠️ Mantener por compatibilidad hacia atrás

### Migración Gradual:
```typescript
// Fase 1: Ambos sistemas coexisten (ACTUAL)
// - Mapa dinámico en producción
// - Mapa estático para tests legacy

// Fase 2: Tests migrados (futuro)
// - Todos los tests usan getDynamicModuleFeatureMap()
// - Mapa estático marcado para remoción

// Fase 3: Limpieza completa (v4.0)
// - Remover MODULE_FEATURE_MAP estático completamente
// - Solo sistema dinámico
```

## 🔍 Verificación

Después de estos cambios, el módulo `fulfillment`:
1. Se define SOLO en su manifest
2. Se registra automáticamente en el map dinámico
3. Aparece en la sidebar sin tocar FeatureRegistry
4. ✅ Problema resuelto automáticamente

**NO más ediciones manuales en MODULE_FEATURE_MAP** 🎉

## 📚 Referencias

- Patrón DRY: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself
- Single Source of Truth: Principio de diseño de software
- Copilot Instructions: `docs/.github/copilot-instructions.md`

---

**Conclusión**: La generación dinámica es **definitivamente** la mejor práctica. El sistema v3.0 elimina duplicación, reduce errores y simplifica el mantenimiento.
