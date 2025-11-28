# ✅ Refactor Completado: online_store → async_operations

**Fecha**: 2025-01-26
**Ejecutado por**: Diego + Claude
**Estado**: ✅ Completado exitosamente

---

## 📋 RESUMEN

Se completó el refactor de la capability `online_store` → `async_operations` para reflejar mejor su funcionalidad real.

### Razón del Cambio

**Problema**: El nombre `online_store` sugería "e-commerce puro" (como Amazon), pero la funcionalidad real es **operaciones asíncronas fuera de horario** (pre-orders, pre-booking, reservas diferidas).

**Solución**: Renombrar a `async_operations` para mayor claridad conceptual.

---

## ✅ CAMBIOS REALIZADOS

### 1. Archivos de Código Actualizados

#### **Core Types** (`src/config/types/atomic-capabilities.ts`)
```diff
- | 'online_store'           // E-commerce 24/7 (was: async_operations)
+ | 'async_operations'       // Operaciones asíncronas fuera de horario (was: online_store)
```

#### **Business Model Registry** (`src/config/BusinessModelRegistry.ts`)
```diff
- 'online_store': {
-   id: 'online_store',
-   name: 'Tienda Online',
-   description: 'E-commerce 24/7 con fulfillment diferido',
-   icon: '🌐',

+ 'async_operations': {
+   id: 'async_operations',
+   name: 'Operaciones Asíncronas',
+   description: 'Recibe pedidos, reservas y citas fuera del horario operativo',
+   icon: '🌙',
```

#### **Otros Archivos Actualizados**
- ✅ `src/config/ConfigurationRegistry.ts`
- ✅ `src/modules/achievements/constants.ts`
- ✅ `src/modules/achievements/components/CapabilityProgressCard.tsx`
- ✅ `src/modules/achievements/components/AchievementsWidget.tsx`
- ✅ `src/modules/sales/manifest.tsx`
- ✅ `src/pages/setup/steps/BusinessModelStep.tsx`
- ✅ `src/pages/admin/gamification/achievements/page.tsx`
- ✅ `src/pages/admin/gamification/achievements/page-requirements.tsx`
- ✅ `src/__tests__/capability-system-integration.test.ts`
- ✅ `src/lib/features/__tests__/FeatureEngine.test.ts`

**Total**: 12 archivos actualizados

---

### 2. Base de Datos Migrada

#### Query Ejecutada
```sql
UPDATE business_profiles
SET selected_activities = (
  SELECT jsonb_agg(
    CASE
      WHEN elem::text = '"online_store"' THEN '"async_operations"'::jsonb
      ELSE elem
    END
  )
  FROM jsonb_array_elements(selected_activities) AS elem
)
WHERE selected_activities::jsonb ? 'online_store';
```

#### Resultados
- ✅ **1 perfil** migrado exitosamente
- ✅ **0 perfiles** con `online_store` restantes
- ✅ **1 perfil** con `async_operations` activo

**Perfil migrado**:
```json
{
  "id": "3ab0829b-69f7-4c3f-87c7-606072cae633",
  "selected_activities": [
    "pickup_orders",
    "delivery_shipping",
    "production_workflow",
    "appointment_based",
    "async_operations"  // ✅ Migrado
  ]
}
```

---

### 3. TypeScript Verification

```bash
npx tsc --noEmit
# ✅ No errors found
```

---

## 📊 CAMBIOS POR CATEGORÍA

### User-Facing Strings
| Archivo | Antes | Después |
|---------|-------|---------|
| `achievements/constants.ts` | `online_store: 'E-commerce'` | `async_operations: 'Operaciones Async'` |
| `achievements/components/CapabilityProgressCard.tsx` | `online_store: { name: 'Comercio Electrónico', icon: '🛒' }` | `async_operations: { name: 'Operaciones Asíncronas', icon: '🌙' }` |
| `pages/admin/gamification/achievements/page.tsx` | `online_store: 'E-commerce (Tienda Online)'` | `async_operations: 'Operaciones Asíncronas'` |

### Comments & Docs
| Archivo | Actualización |
|---------|--------------|
| `sales/manifest.tsx` | Comment: "Register ecommerce sub-module hooks if **async_operations** capability active" |
| `achievements/constants.ts` | Comment: "**ASYNC OPERATIONS REQUIREMENTS** (Capability: async_operations)" |
| Tests | Descriptions actualizadas de "E-commerce" → "Operaciones Async" |

---

## 🔄 ROLLBACK (Si fuera necesario)

Si por alguna razón necesitas revertir este cambio:

### Código
```bash
cd "I:/Programacion/Proyectos/g-mini"
git revert <commit-hash>
```

### Base de Datos
```sql
UPDATE business_profiles
SET selected_activities = (
  SELECT jsonb_agg(
    CASE
      WHEN elem::text = '"async_operations"' THEN '"online_store"'::jsonb
      ELSE elem
    END
  )
  FROM jsonb_array_elements(selected_activities) AS elem
)
WHERE selected_activities::jsonb ? 'async_operations';
```

---

## ✅ VERIFICACIÓN POST-REFACTOR

### Checklist

- [x] TypeScript compila sin errores
- [x] Base de datos migrada (1 perfil)
- [x] No quedan referencias a `online_store` en código funcional
- [x] User-facing strings actualizados
- [x] Tests actualizados
- [x] Documentación actualizada

### Búsquedas de Verificación

```bash
# Verificar que no quede 'online_store' funcional
grep -r "online_store" src --include="*.ts" --include="*.tsx" | grep -v "was: online_store" | grep -v "RENAMED"
# Resultado: 0 ocurrencias ✅

# Verificar que exista 'async_operations'
grep -r "async_operations" src --include="*.ts" --include="*.tsx" | wc -l
# Resultado: 30+ ocurrencias ✅
```

---

## 📝 NOTAS ADICIONALES

### Comportamiento Funcional (Sin Cambios)

El refactor es **solo de naming**. La funcionalidad permanece idéntica:

- ✅ Features activadas: Las mismas
- ✅ Blocking requirements: Los mismos
- ✅ Lógica de negocio: Sin cambios
- ✅ UI/UX: Solo labels actualizados

### Próximos Pasos

Con este refactor completado, ahora podemos:

1. ✅ Continuar con el diseño del ShiftControlWidget
2. ✅ Implementar comportamiento para `async_operations` en el widget
3. ✅ Documentar casos de uso (restaurante con pre-orders, salón con booking 24/7)

---

## 🔗 REFERENCIAS

- **Decisión original**: `docs/capabilities/CAPABILITY_REFACTOR_DECISIONS.md`
- **Análisis de problemas**: `docs/capabilities/CAPABILITY_ARCHITECTURE_ISSUES.md`
- **Diseño ShiftControl**: `docs/shift-control/SHIFT_CONTROL_ARCHITECTURE.md`

---

**Documento creado por**: Claude Code
**Fecha de ejecución**: 2025-01-26
**Estado**: ✅ Refactor completado y verificado
**Breaking changes**: Sí (requiere migración de datos)
**Migración ejecutada**: ✅ Sí (1 perfil migrado)
