# Build Errors Fix Strategy - Methodical Approach

## Root Cause Analysis

### Problem 1: `verbatimModuleSyntax: true`
**Causa:** TypeScript 5.8+ con esta opción requiere importaciones explícitas de tipos.
**Impacto:** ~20 archivos con imports incorrectos.
**Solución:** Cambiar `import { Type }` a `import type { Type }` para todos los tipos.

### Problem 2: Zod v4 `.default()` + react-hook-form type inference
**Causa:** `.default()` en Zod hace que campos sean `field?: Type | undefined` pero react-hook-form espera `field: Type`.
**Impacto:** Todos los validation hooks (15+ archivos).
**Solución CORRECTA:** ELIMINAR `.default()` de schemas y usar `defaultValues` en `useForm()`.

**Razonamiento:**
- `.default()` es para parsing runtime, no para tipos
- Los valores por defecto pertenecen a la capa de presentación (useForm)
- Zod debe validar, no proporcionar defaults para forms
- Esto separa correctamente las responsabilidades

### Problem 3: ChakraUI v3.23.0 API changes
**Causa:** Breaking changes en ChakraUI v3.
**Impacto:** SegmentGroup, refs incompatibles, ListCollection generics.
**Solución:** Consultar docs de Chakra v3 y actualizar componentes.

### Problem 4: Generic type errors
**Causa:** Inferencia incorrecta de tipos genéricos.
**Impacto:** useCrudOperations, SelectField, materialsStore.
**Solución:** Type guards, generics explícitos, corrección de argumentos.

---

## Fix Plan - Phase by Phase

### Phase 1: Type-Only Imports (Quick Win - 30 min)
**Objetivo:** Arreglar todos los imports de tipos.

**Estrategia automática:**
```bash
# Buscar y reemplazar en hooks de validación
find src/hooks -name "use*Validation.ts" -o -name "useFormWithEnterKey.ts" | \
  xargs sed -i 's/import { UseFormReturn }/import type { UseFormReturn }/g'

# Buscar y reemplazar ReactNode
find src -name "*.tsx" -o -name "*.ts" | \
  xargs sed -i 's/import { ReactNode }/import type { ReactNode }/g'
find src -name "*.tsx" -o -name "*.ts" | \
  xargs sed -i 's/import { FC, ReactNode }/import { FC }; import type { ReactNode }/g'
```

**Archivos a modificar (manual verification needed):**
- src/hooks/useAssetValidation.ts
- src/hooks/useCustomerValidation.ts
- src/hooks/useEmployeeValidation.ts
- src/hooks/useFiscalValidation.ts
- src/hooks/useFormWithEnterKey.ts
- src/hooks/useInvoiceFormValidation.ts
- src/hooks/useMaterialValidation.ts
- src/hooks/useMembershipFormValidation.ts
- src/hooks/usePaymentLinkFormValidation.ts
- src/hooks/useProductCatalogValidation.ts
- src/hooks/useRentalValidation.ts
- src/hooks/useSaleFormValidation.ts
- src/hooks/useSchedulingFormValidation.ts
- src/hooks/useSupplierOrderValidation.ts
- src/hooks/useSupplierValidation.ts
- src/shared/ui/QuickComponents.tsx
- src/modules/dashboard/manifest.tsx
- src/modules/sales/manifest.tsx

**Verification:** `pnpm -s exec tsc -b 2>&1 | grep "TS1484" | wc -l` should be 0

---

### Phase 2: Zod Schema Defaults Fix (Critical - 1.5 hours)

**Step 2.1: Remove .default() from CommonSchemas.ts**

**Fields to modify:**
1. Line 290: `employment_status` - remove `.default('active')`
2. Line 298: `role` - remove `.default('employee')`
3. Line 300: `can_work_multiple_locations` - remove `.default(false)`
4. Line 308: `order_type` - remove `.default('dine_in')`
5. Line 309: `fulfillment_type` - remove `.default('dine_in')`
6. Line 404: `status` (supplier_order) - remove `.default('pending')`
7. Line 437: `status` (delivery) - remove `.default('pending')`
8. Line 461: `country` - remove `.default('Argentina')`
9. Line 476: `status` (scheduling) - remove `.default('scheduled')`
10. Line 508: `status` (asset) - remove `.default('active')` ⭐
11. Line 521: `status` (rental) - remove `.default('reserved')`
12. Line 546: `auto_renew` - remove `.default(false)`
13. Line 547: `status` (membership) - remove `.default('active')`
14. Line 560: `auto_charge` - remove `.default(false)`
15. Line 561: `status` (billing) - remove `.default('active')`
16. Line 571: `is_production` - remove `.default(false)`
17. Line 572: `enabled` - remove `.default(true)`
18. Line 583: `status` (delivery_assignment) - remove `.default('assigned')`
19. Line 598: `format` - remove `.default('pdf')`
20. Line 599: `schedule` - remove `.default('manual')`

**Step 2.2: Update validation hooks to ensure defaultValues**

Para cada validation hook que usa estos schemas, verificar que useForm tenga los `defaultValues` correctos:

**Ejemplo - useAssetValidation.ts:**
```typescript
// ANTES (schema con .default())
status: z.enum([...]).default('active')

// DESPUÉS (sin .default() en schema)
status: z.enum([...])

// Y en useForm:
defaultValues: {
  status: 'active',  // ✅ valor por defecto aquí
  // ...
}
```

**Hooks a revisar:**
1. useAssetValidation.ts - verificar defaultValues para status
2. useEmployeeValidation.ts - employment_status, role, can_work_multiple_locations
3. useSaleFormValidation.ts - order_type, fulfillment_type
4. useSupplierOrderValidation.ts - status
5. useSchedulingFormValidation.ts - status
6. useRentalValidation.ts - status
7. useMembershipFormValidation.ts - auto_renew, status
8. Billing/Invoice forms - auto_charge, status, format, schedule
9. Delivery forms - status (delivery_assignment)

**Step 2.3: Verify each form component**

Para cada componente de formulario, asegurar que los defaultValues estén presentes:
```typescript
// Buscar en componentes de formularios
grep -r "useForm<.*FormData>" src/pages --include="*.tsx"
```

**Verification:**
```bash
pnpm -s exec tsc -b 2>&1 | grep "Resolver<" | wc -l  # should be 0
```

---

### Phase 3: ChakraUI v3 Components Fix (2 hours)

**Step 3.1: SegmentGroup Component**

**Archivo:** `src/shared/ui/SegmentGroup.tsx`

**Problema:** API cambió en v3, no existen `SegmentGroup.ItemControl` ni `SegmentGroup.Label`

**Acción:**
1. Consultar docs de Chakra v3 con MCP: `mcp__chakra-ui__get_component_example("segment-group")`
2. Actualizar componente según nueva API
3. Verificar todos los usos: `grep -r "SegmentGroup" src --include="*.tsx"`

**Step 3.2: Ref Type Incompatibilities**

**Archivos:**
- src/shared/ui/Checkbox.tsx(38,9) - HTMLInputElement vs HTMLButtonElement
- src/shared/ui/RadioGroup.tsx(138,9) - HTMLLabelElement vs HTMLDivElement
- src/shared/ui/EmptyState.tsx(64,9) - HTMLSpanElement vs HTMLDivElement

**Estrategia:**
```typescript
// Investigar el tipo correcto del componente interno de Chakra
// Cambiar el forwardRef para que coincida:

// ANTES
const Component = forwardRef<HTMLInputElement, Props>((props, ref) => ...)

// DESPUÉS (verificar tipo correcto)
const Component = forwardRef<HTMLButtonElement, Props>((props, ref) => ...)
```

**Step 3.3: SelectField ListCollection**

**Archivo:** `src/shared/ui/SelectField.tsx(103,9)`

**Problema:** Generic de ListCollection no coincide

**Solución:**
```typescript
// Hacer el generic explícito
const collection = createListCollection<{ value: string; label: string }>({
  items: options
});
```

**Verification:**
```bash
pnpm -s exec tsc -b 2>&1 | grep "chakra" | wc -l  # should be 0
```

---

### Phase 4: Generic Types & Type Guards (1.5 hours)

**Step 4.1: useCrudOperations.ts line 362**

**Problema:** `Argument of type 'any' is not assignable to parameter of type 'never'`

**Acción:**
1. Leer el contexto completo del error
2. Identificar el generic que está colapsando a `never`
3. Añadir type guard o constraint explícito

**Step 4.2: materialsStore.ts**

**Problemas:**
- Line 162: Expected 1 arguments, but got 2
- Line 277: Expected 3 arguments, but got 2

**Acción:**
1. Identificar las funciones llamadas
2. Verificar las signatures esperadas
3. Corregir los argumentos

**Step 4.3: types.ts(44,7)**

**Problema:** `'result' is of type 'unknown'`

**Solución:**
```typescript
// Añadir type guard
if (typeof result === 'object' && result !== null) {
  // usar result
}
// o type assertion si sabemos el tipo
const typedResult = result as ExpectedType;
```

**Verification:**
```bash
pnpm -s exec tsc -b 2>&1 | grep "TS2345\|TS2554\|TS18046" | wc -l  # should be 0
```

---

### Phase 5: WDYR Configuration (Optional - 30 min)

**Archivo:** `src/wdyr.ts`

**Opción A: Fix types (si WDYR es necesario)**
1. Crear `src/global.d.ts`:
```typescript
interface Window {
  __WDYR_LOAD_COUNT__?: number;
}
```

2. Verificar versión de WDYR y opciones disponibles
3. Actualizar configuración

**Opción B: Comentar temporalmente (recomendado para build production)**
```typescript
// Comentar todo el archivo o envolver en:
if (process.env.NODE_ENV === 'development') {
  // WDYR setup
}
```

---

### Phase 6: Remaining Component Errors (1 hour)

**Estrategia:** Por cada error restante:
1. Leer el archivo completo
2. Entender el contexto del error
3. Verificar tipos importados
4. Añadir optional chaining donde sea necesario
5. Corregir tipos de imports

**Archivos probables:**
- src/pages/admin/operations/sales/components/*.tsx
- src/pages/admin/resources/scheduling/components/*.tsx
- src/pages/admin/finance/fiscal/components/*.tsx

---

## Testing Strategy

### Incremental Testing
Después de cada Phase:
```bash
# 1. Type check
pnpm -s exec tsc -b

# 2. Lint check
pnpm -s exec eslint .

# 3. Count remaining errors
pnpm -s exec tsc -b 2>&1 | grep "error TS" | wc -l

# 4. Build attempt (if tsc passes)
pnpm build:skip-ts
```

### Final Verification
```bash
# Full type check
pnpm -s exec tsc -b

# Full build
pnpm build

# Run tests
pnpm test:run

# Check bundle size
ls -lh dist/
```

---

## Expected Timeline

| Phase | Task | Time | Priority |
|-------|------|------|----------|
| 1 | Type-only imports | 30 min | HIGH |
| 2 | Zod defaults fix | 1.5 hrs | CRITICAL |
| 3 | ChakraUI v3 fixes | 2 hrs | HIGH |
| 4 | Generic types | 1.5 hrs | MEDIUM |
| 5 | WDYR (optional) | 30 min | LOW |
| 6 | Component errors | 1 hr | MEDIUM |
| **TOTAL** | | **7 hours** | |

---

## Success Criteria

- [ ] `pnpm -s exec tsc -b` returns 0 errors
- [ ] `pnpm build` completes successfully
- [ ] Bundle size is reasonable (< 2MB for main chunk)
- [ ] No runtime errors in dev server
- [ ] All tests pass

---

## Rollback Plan

Si alguna Phase causa problemas:
1. Git stash changes
2. Revert to previous working state
3. Analizar el problema específico
4. Aplicar fix más conservador

---

## Notes

- **NO usar soluciones rápidas como `@ts-ignore` o `as any`**
- **NO hacer cambios masivos sin verificar cada caso**
- **SI hay duda, investigar primero con docs oficiales**
- **USAR git commits incrementales por Phase**
