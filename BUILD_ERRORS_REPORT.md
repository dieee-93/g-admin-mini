# Build Errors Report - Production Blockers

**Fecha:** 2025-11-02
**Total de errores:** ~150+ errores TypeScript
**Comando:** `pnpm build`
**Estado:** ❌ Build FAILED

---

## 📋 Resumen Ejecutivo

Se encontraron múltiples categorías de errores que bloquean el build de producción:

1. **Importaciones de tipos incorrectas** (~30% de errores)
2. **Incompatibilidades de tipos react-hook-form** (~25% de errores)
3. **Problemas con componentes ChakraUI v3** (~20% de errores)
4. **Errores de tipos generics y asignación** (~15% de errores)
5. **Problemas con refs y forwarded refs** (~10% de errores)

---

## 🔴 Categoría 1: Type-only imports requeridos

**Error:** `is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled`

### Archivos afectados:
```typescript
// Hooks
src/hooks/useAssetValidation.ts(14,19)         - UseFormReturn
src/hooks/useCustomerValidation.ts(14,19)     - UseFormReturn
src/hooks/useEmployeeValidation.ts(8,19)      - UseFormReturn
src/hooks/useFiscalValidation.ts(9,19)        - UseFormReturn
src/hooks/useFormWithEnterKey.ts(2,19)        - UseFormReturn
src/hooks/useInvoiceFormValidation.ts(9,19)   - UseFormReturn
src/hooks/useMaterialValidation.ts(10,19)     - UseFormReturn
src/hooks/useMembershipFormValidation.ts(9,19) - UseFormReturn
src/hooks/usePaymentLinkFormValidation.ts(9,19) - UseFormReturn
src/hooks/useProductCatalogValidation.ts(9,19) - UseFormReturn
src/hooks/useRentalValidation.ts(9,19)        - UseFormReturn
src/hooks/useSaleFormValidation.ts(9,19)      - UseFormReturn
src/hooks/useSchedulingFormValidation.ts(9,19) - UseFormReturn
src/hooks/useSupplierOrderValidation.ts(9,19) - UseFormReturn
src/hooks/useSupplierValidation.ts(9,19)      - UseFormReturn

// Componentes UI
src/shared/ui/QuickComponents.tsx(6,10)       - ReactNode

// Módulos
src/modules/dashboard/manifest.tsx(4,10)      - ReactNode
src/modules/sales/manifest.tsx(4,10)          - ReactNode
```

### ✅ Solución:
```typescript
// ❌ INCORRECTO
import { UseFormReturn } from 'react-hook-form';
import { ReactNode } from 'react';

// ✅ CORRECTO
import type { UseFormReturn } from 'react-hook-form';
import type { ReactNode } from 'react';
```

---

## 🔴 Categoría 2: Incompatibilidades react-hook-form Resolver

**Error:** `Type 'Resolver<...>' is not assignable to parameter of type 'Resolver<...>'`

### Archivos afectados:
- `src/hooks/useAssetValidation.ts(60,5)` - status field undefined incompatibility
- `src/hooks/useEmployeeValidation.ts(53,5)` - department field incompatibility
- `src/hooks/useFiscalValidation.ts(52,5)` - transaction_type field incompatibility
- `src/hooks/useMaterialValidation.ts(72,5)` - category field incompatibility
- Todos los demás hooks de validación tienen el mismo patrón

### 🔍 Problema raíz:
Los tipos del schema Zod tienen campos como `optional()` pero el tipo esperado del resolver no acepta `undefined`.

### ✅ Solución:
```typescript
// Ejemplo: useAssetValidation.ts
const assetSchema = z.object({
  // ... otros campos
  status: z.enum(['active', 'maintenance', 'retired', 'disposed']).default('active'), // ← Añadir .default()
  // ... otros campos opcionales
  current_value: z.number().optional(),
  description: z.string().optional(),
});

// O hacer el cast explícito en el resolver
resolver: zodResolver(assetSchema) as Resolver<AssetFormValues>,
```

---

## 🔴 Categoría 3: ChakraUI v3 Component Props Incompatibility

### 3.1 SegmentGroup API Changes
**Archivo:** `src/shared/ui/SegmentGroup.tsx`

**Error:**
```typescript
TS2339: Property 'ItemControl' does not exist on type 'typeof SegmentGroup'
TS2339: Property 'Label' does not exist on type 'typeof SegmentGroup'
```

**Contexto:** ChakraUI v3.23.0 cambió la API de SegmentGroup

### ✅ Solución:
Consultar la documentación actualizada de Chakra v3 para SegmentGroup:
```typescript
// Usar mcp__chakra-ui__get_component_example para obtener el patrón correcto
```

### 3.2 RadioGroup/Checkbox Ref incompatibilities
**Archivos afectados:**
- `src/shared/ui/Checkbox.tsx(38,9)` - HTMLInputElement vs HTMLButtonElement
- `src/shared/ui/RadioGroup.tsx(138,9)` - HTMLLabelElement vs HTMLDivElement
- `src/shared/ui/EmptyState.tsx(64,9)` - HTMLSpanElement vs HTMLDivElement

**Error típico:**
```
Property 'align' is missing in type 'HTMLLabelElement' but required in type 'HTMLDivElement'
```

### ✅ Solución:
```typescript
// Cambiar el tipo de ref para que coincida con el elemento interno de Chakra
const ForwardedComponent = forwardRef<HTMLDivElement, Props>((props, ref) => {
  return <ChakraComponent ref={ref} {...props} />;
});
```

---

## 🔴 Categoría 4: Tipos de Datos y Generics

### 4.1 useCrudOperations any type error
**Archivo:** `src/hooks/core/useCrudOperations.ts(362,17)`

**Error:** `Argument of type 'any' is not assignable to parameter of type 'never'`

### ✅ Solución:
```typescript
// Añadir type guard o hacer el cast explícito con el generic correcto
const result = await operation(data as T);
```

### 4.2 SelectField ListCollection incompatibility
**Archivo:** `src/shared/ui/SelectField.tsx(103,9)`

**Error:** `Type 'ListCollection<{ value: string; label: string; }>' is not assignable to type 'ListCollection<unknown>'`

### ✅ Solución:
```typescript
// Hacer el generic explícito
const collection = createListCollection<{ value: string; label: string }>({
  items: options,
});
```

### 4.3 Type unknown errors
**Archivos:**
- `src/shared/ui/types.ts(44,7)` - 'result' is of type 'unknown'

### ✅ Solución:
```typescript
// Añadir type assertion o type guard
if (typeof result === 'object' && result !== null) {
  // usar result
}
```

---

## 🔴 Categoría 5: Zustand Store Errors

### 5.1 materialsStore argument count mismatches
**Archivo:** `src/store/materialsStore.ts`

**Errores:**
```
(162,85): Expected 1 arguments, but got 2
(277,34): Expected 3 arguments, but got 2
```

### ✅ Solución:
Revisar las llamadas a funciones en el store y corregir los argumentos:
```typescript
// Línea 162: Revisar qué función está recibiendo 2 argumentos cuando espera 1
// Línea 277: Revisar qué función está recibiendo 2 argumentos cuando espera 3
```

---

## 🔴 Categoría 6: Why Did You Render (WDYR) Configuration

**Archivo:** `src/wdyr.ts`

**Errores:**
```typescript
TS2339: Property '__WDYR_LOAD_COUNT__' does not exist on type 'Window & typeof globalThis'
TS2353: Object literal may only specify known properties, and 'renderCountThreshold' does not exist
TS2353: 'resetCountTimeout' does not exist in type 'Options'
```

### ✅ Solución:
1. Añadir tipos globales para WDYR en `src/global.d.ts`:
```typescript
interface Window {
  __WDYR_LOAD_COUNT__?: number;
}
```

2. Actualizar configuración de WDYR para versión correcta:
```typescript
// Verificar la versión instalada y usar las opciones correctas
// O comentar temporalmente si no es crítico para producción
```

---

## 🔴 Categoría 7: Component-specific Type Errors

### 7.1 Material Import issues
**Archivos con importaciones incorrectas:**
- `src/pages/admin/finance/fiscal/components/TaxSummary.tsx(63,7)`
- `src/pages/admin/operations/sales/components/StockSummaryWidget.tsx(36,10)`
- Múltiples componentes más

**Error:** Material no importado correctamente desde el tipo correcto

### ✅ Solución:
```typescript
// Asegurar importación correcta
import type { Material } from '@/types/material';
```

### 7.2 Missing optional chaining
**Ejemplo:** `src/pages/admin/operations/sales/components/ProductWithStock.tsx`

**Error:** `Cannot read properties of undefined (reading 'someProperty')`

### ✅ Solución:
```typescript
// Añadir optional chaining y nullish coalescing
const value = data?.property ?? defaultValue;
```

---

## 📊 Estadísticas de Errores por Directorio

```
src/hooks/                     : ~40 errores (validation hooks)
src/shared/ui/                 : ~30 errores (ChakraUI wrappers)
src/pages/admin/operations/    : ~35 errores (componentes de páginas)
src/pages/admin/resources/     : ~15 errores
src/pages/admin/finance/       : ~10 errores
src/modules/                   : ~8 errores
src/store/                     : ~5 errores
src/components/                : ~10 errores
src/wdyr.ts                    : ~7 errores
```

---

## 🎯 Plan de Acción Recomendado

### Fase 1: Quick Wins (2-3 horas)
1. ✅ Corregir todas las importaciones de tipos (añadir `type` keyword)
2. ✅ Comentar temporalmente `src/wdyr.ts` si no es crítico
3. ✅ Añadir `.default()` a campos requeridos en schemas Zod

### Fase 2: ChakraUI v3 Fixes (3-4 horas)
1. ✅ Revisar y actualizar `SegmentGroup.tsx` con API correcta de v3
2. ✅ Corregir tipos de refs en RadioGroup, Checkbox, EmptyState
3. ✅ Verificar props de SelectField y ListCollection

### Fase 3: Type Safety (2-3 horas)
1. ✅ Corregir generics en `useCrudOperations.ts`
2. ✅ Añadir type guards donde sea necesario
3. ✅ Revisar y corregir `materialsStore.ts` argument counts

### Fase 4: Component Fixes (3-4 horas)
1. ✅ Revisar todos los componentes de páginas con errores de tipos
2. ✅ Añadir optional chaining donde falte
3. ✅ Corregir importaciones de tipos en componentes

### Fase 5: Final Testing (1 hora)
1. ✅ Ejecutar `pnpm build` nuevamente
2. ✅ Verificar bundle size
3. ✅ Test de smoke en producción

---

## 🚀 Tiempo Estimado Total: 11-15 horas

---

## 📝 Notas Adicionales

- **TSConfig:** `verbatimModuleSyntax` está habilitado, lo que requiere importaciones de tipos explícitas
- **ChakraUI v3:** Varios componentes tienen breaking changes desde v2
- **React 19.1:** Puede tener requisitos más estrictos de tipos para refs
- **Zustand v5:** Los stores pueden necesitar ajustes en las firmas de funciones

---

## ✅ Próximos Pasos

1. Decidir si atacar todos los errores de una vez o por fases
2. Considerar si es seguro comentar temporalmente WDYR para el build
3. Priorizar los errores críticos vs. warnings
4. Ejecutar `pnpm build:skip-ts` para ver si hay errores adicionales de Vite
