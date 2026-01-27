# SHIFT CONTROL - GUÍA DE DEBUGGING

**Fecha**: 2025-12-08
**Problemas Identificados**: 2

---

## 🔴 PROBLEMA 1: No se ven las mesas en el módulo Onsite

### Estado Actual de la DB

**Mesas en la base de datos (tabla `tables`):**

| ID | Número | Status | is_active | Nombre | Capacidad |
|----|--------|---------|-----------|--------|-----------|
| a7b09... | 1 | `occupied` | ✅ true | Mesa Principal 1 | 4 |
| 4c3189... | 2 | `occupied` | ✅ true | Mesa Principal 2 | 6 |
| 1835a3... | 3 | `available` | ✅ true | Mesa Bar 1 | 2 |
| 26ac43... | 4 | `reserved` | ✅ true | Mesa Terraza 1 | 4 |
| cfbdd5... | 5 | `available` | ✅ true | Mesa VIP 1 | 8 |

✅ **Las mesas EXISTEN en la DB**
✅ **Todas tienen `is_active = true`**
✅ **2 mesas están occupied** (por eso salta la validación de shift control)

### Componente que carga las mesas

**Archivo**: `src/pages/admin/operations/fulfillment/onsite/components/FloorPlanView.tsx`

**Query que usa** (líneas 57-71):
```typescript
const { data, error} = await supabase
  .from('tables')
  .select(`
    *,
    parties (
      size,
      customer_name,
      seated_at,
      estimated_duration,
      total_spent,
      status
    )
  `)
  .eq('is_active', true)
  .order('number');
```

### Debugging Paso a Paso

#### 1. Abre la Consola del Navegador (F12)

**Verifica si hay errores:**
- Ve a la pestaña "Console"
- Busca errores en rojo
- Especialmente busca: "Error loading table data"

#### 2. Verifica Network Requests

**En la pestaña Network:**
1. Filtra por "supabase" o "tables"
2. Busca el request a la tabla `tables`
3. Verifica:
   - ✅ Status 200 (OK)?
   - ❌ Status 400/500 (error)?
   - ¿Qué datos retorna? (click en el request → Preview)

#### 3. Debugging en el Componente

**Agregar logs temporales** en `FloorPlanView.tsx` línea 104:

```typescript
// DESPUÉS DE LÍNEA 102
console.log('🔍 DEBUG - Tables loaded:', {
  count: formattedTables.length,
  tables: formattedTables,
  rawData: data
});

setTables(formattedTables);
```

**Agregar log de errores** en línea 106:

```typescript
logger.error('FloorPlanView', 'Error loading tables:', error);
console.error('🔴 ERROR loading tables:', error); // ← AGREGAR ESTA LÍNEA
notify.error({ title: 'Error loading table data' });
```

#### 4. Verificar que el componente se renderiza

**Agregar log en línea 148** (antes del return):

```typescript
console.log('🎨 RENDER - FloorPlanView:', {
  loading,
  tablesCount: tables.length,
  tables
});

return (
  <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap="md">
```

### Posibles Causas

1. **Error de RLS (Row Level Security)**
   - ¿Tienes permisos para leer la tabla `tables`?
   - Verifica en Supabase Dashboard → Authentication → Policies

2. **Error en el JOIN con `parties`**
   - La tabla `parties` existe ✅
   - Pero puede no tener foreign key configurada correctamente
   - O puede tener RLS que bloquea el JOIN

3. **Error de rendering**
   - Las mesas se cargan pero no se renderizan
   - Problema de CSS/layout que las oculta

4. **Estado inicial vacío**
   - `loading` es `true` pero nunca se pone en `false`
   - Quedas en el spinner infinito

### Solución Rápida (Temporal)

**Opción A: Simplificar la query (sin JOIN)**

Edita `FloorPlanView.tsx` línea 57-71:

```typescript
// Query simplificada SIN parties
const { data, error} = await supabase
  .from('tables')
  .select('*')
  .eq('is_active', true)
  .order('number');

if (error) {
  console.error('Error loading tables:', error);
  throw error;
}

// Mapear datos sin parties
const formattedTables = data.map((table) => ({
  ...table,
  location: table.section || 'main',
  current_party: null // Sin datos de parties por ahora
}));
```

**Opción B: Verificar RLS de la tabla tables**

```sql
-- En Supabase SQL Editor, ejecuta:
SELECT * FROM tables WHERE is_active = true;

-- Si retorna las 5 mesas ✅
-- Si retorna vacío ❌ → problema de RLS
```

---

## 🔴 PROBLEMA 2: Error genérico "Error al cerrar el turno"

### Síntoma

- Con `onsite_service` DESACTIVADO
- Intentas cerrar turno
- ❌ Muestra toast rojo: "Error al cerrar el turno"
- ✅ PERO: Ya no valida las 2 mesas ocupadas (fix funcionó parcialmente)

### Posible Causa

El error está en la ejecución de `validateCloseShift()` pero no se está capturando el error específico.

### Archivos Involucrados

1. **Validación Backend**: `src/modules/shift-control/services/shiftService.ts`
2. **UI que llama la validación**: ¿Dónde se ejecuta el cierre de turno?

### Debugging Paso a Paso

#### 1. Encontrar el componente que cierra el turno

**Buscar en el código:**
```bash
# En terminal:
grep -r "cerrar.*turno\|close.*shift" --include="*.tsx" --include="*.ts"
```

#### 2. Agregar logs en shiftService.ts

**En la función validateCloseShift** (línea 153-416):

**DESPUÉS de línea 174:**
```typescript
const hasFeature = useCapabilityStore.getState().hasFeature;

// ✅ AGREGAR ESTE LOG
console.log('🔍 DEBUG validateCloseShift:', {
  shiftId,
  activeFeatures: useCapabilityStore.getState().features.activeFeatures,
  willValidateTables: hasFeature('operations_table_management'),
  willValidateDeliveries: hasFeature('sales_delivery_orders'),
  willValidateStaff: hasFeature('staff_employee_management'),
});
```

**ANTES de línea 412 (return result):**
```typescript
const result: CloseValidationResult = {
  canClose: blockers.length === 0,
  blockers,
  warnings,
};

// ✅ AGREGAR ESTE LOG
console.log('✅ Validation result:', {
  canClose: result.canClose,
  blockers: result.blockers.length,
  warnings: result.warnings.length,
  blockersDetail: result.blockers,
  warningsDetail: result.warnings
});

// Emit validation failed event if there are blockers
```

**EN EL CATCH (línea 413):**
```typescript
} catch (error) {
  // ✅ AGREGAR LOG MÁS DETALLADO
  console.error('🔴 ERROR in validateCloseShift:', {
    error,
    errorMessage: error instanceof Error ? error.message : 'Unknown error',
    errorStack: error instanceof Error ? error.stack : undefined
  });
  logger.error(MODULE_ID, 'Validation error', { error });
  throw error;
}
```

#### 3. Verificar que todas las queries no fallen

**Cada validación tiene un try-catch implícito:**

Por ejemplo, en la validación de cash sessions (línea 193-207):

```typescript
if (hasFeature('sales_payment_processing') || hasFeature('sales_pos_onsite')) {
  console.log('💰 Checking cash sessions...'); // ← AGREGAR

  const { data: activeCashSessions, error: cashError } = await supabase
    .from('cash_sessions')
    .select('id, money_location_id')
    .eq('status', 'OPEN');

  console.log('💰 Cash sessions result:', { // ← AGREGAR
    found: activeCashSessions?.length,
    error: cashError
  });

  // ... resto del código
}
```

### Query SQL para verificar manualmente

```sql
-- 1. Verificar cash_sessions
SELECT id, status FROM cash_sessions WHERE status = 'OPEN';

-- 2. Verificar tables ocupadas
SELECT id, number, status FROM tables WHERE status = 'occupied';

-- 3. Verificar deliveries activos
SELECT id, status FROM fulfillment_queue
WHERE fulfillment_type = 'delivery'
AND status IN ('pending', 'in_progress', 'ready');

-- 4. Verificar órdenes pendientes
SELECT id, status FROM fulfillment_queue
WHERE status IN ('pending', 'in_progress');

-- 5. Verificar staff checked in
SELECT id, first_name, last_name, checked_in
FROM employees WHERE checked_in = true;

-- 6. Verificar rentals vencidos
SELECT id, end_datetime FROM rental_reservations
WHERE actual_return_datetime IS NULL
AND end_datetime < NOW();
```

---

## 🛠️ PLAN DE ACCIÓN

### Prioridad 1: Hacer que veas las mesas

1. Abre `/admin/operations/fulfillment/onsite`
2. Abre consola del navegador (F12)
3. Busca errores en rojo
4. **Si no ves errores**: Agrega los console.log sugeridos arriba
5. **Si ves errores**: Comparte el error completo

### Prioridad 2: Entender el error al cerrar turno

1. Agrega los console.log en `shiftService.ts`
2. Intenta cerrar el turno (con `onsite_service` desactivado)
3. Mira la consola del navegador
4. Busca el log `🔴 ERROR in validateCloseShift:`
5. Comparte el error específico

---

## 📊 QUERIES ÚTILES PARA DEBUGGING

```sql
-- Ver estado completo de tu DB relevante para shift control
SELECT
  'cash_sessions' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'OPEN') as open_count
FROM cash_sessions
UNION ALL
SELECT
  'tables',
  COUNT(*),
  COUNT(*) FILTER (WHERE status = 'occupied')
FROM tables
UNION ALL
SELECT
  'fulfillment_queue',
  COUNT(*),
  COUNT(*) FILTER (WHERE status IN ('pending', 'in_progress'))
FROM fulfillment_queue
UNION ALL
SELECT
  'employees',
  COUNT(*),
  COUNT(*) FILTER (WHERE checked_in = true)
FROM employees
UNION ALL
SELECT
  'rental_reservations',
  COUNT(*),
  COUNT(*) FILTER (WHERE actual_return_datetime IS NULL)
FROM rental_reservations;
```

---

## 🎯 PRÓXIMOS PASOS

1. **Lee esta guía completa**
2. **Ejecuta los pasos de debugging** para Problema 1 (mesas)
3. **Comparte los resultados** (console.log + errores)
4. **Luego** movemos a debugging del Problema 2

¿Por dónde quieres empezar? ¿Primero las mesas o el error de cierre?
