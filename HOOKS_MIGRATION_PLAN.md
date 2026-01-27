# Hooks Migration Plan: src/hooks → src/modules

**Status**: Análisis completado
**Impacto**: ~80% de hooks en `src/hooks/` deberían moverse a módulos
**Esfuerzo**: 4-6 horas
**Archivos afectados**: ~100 archivos (imports)

---

## ❌ PROBLEMA ACTUAL

### Violación de Screaming Architecture

```
src/hooks/ contiene 50+ hooks MEZCLADOS:
├── Genéricos (~10, 20%) ✅ Deberían quedarse
└── Específicos (~40, 80%) ❌ Deberían moverse a módulos
```

### Inconsistencia de Patrones

- ✅ Cash module: hooks dentro (`modules/cash/hooks/`)
- ✅ Materials module: hooks dentro (`modules/materials/hooks/`)
- ❌ Staff: hooks fuera (`hooks/useStaff*.ts`)
- ❌ Customers: hooks fuera (`hooks/useCustomers.ts`)
- ❌ Suppliers: hooks fuera (`hooks/useSuppliers.ts`)

---

## ✅ SOLUCIÓN

### Criterio de Decisión

**¿Dónde debería vivir un hook?**

| Hook | Ubicación | Razón |
|------|-----------|-------|
| `useDebounce` | `src/hooks/core/` | Genérico, sin dominio |
| `usePagination` | `src/hooks/core/` | Genérico, sin dominio |
| `usePermissions` | `src/hooks/core/` | Cross-cutting concern |
| `useStaffData` | `src/modules/staff/hooks/` | Específico de Staff |
| `useCustomers` | `src/modules/customers/hooks/` | Específico de Customers |
| `useSuppliers` | `src/modules/suppliers/hooks/` | Específico de Suppliers |

---

## 📦 HOOKS A MOVER

### Staff Module

**Crear módulo:**
```bash
mkdir -p src/modules/staff/{hooks,store,services,components}
```

**Mover hooks:**
```bash
src/hooks/useStaffData.ts              → src/modules/staff/hooks/
src/hooks/useStaff.ts                  → src/modules/staff/hooks/
src/hooks/useStaffValidation.ts        → src/modules/staff/hooks/
src/hooks/useStaffPolicies.ts          → src/modules/staff/hooks/
src/hooks/useRealTimeLaborCosts.ts     → src/modules/staff/hooks/
src/hooks/useEmployees.ts              → src/modules/staff/hooks/
src/hooks/useEmployeeValidation.ts     → src/modules/staff/hooks/
src/hooks/useShiftValidation.ts        → src/modules/staff/hooks/
```

**Mover store:**
```bash
src/store/staffStore.ts → src/modules/staff/store/
```

**Crear barrel export:**
```typescript
// src/modules/staff/hooks/index.ts
export { useStaffData } from './useStaffData';
export { useStaff } from './useStaff';
export { useStaffValidation } from './useStaffValidation';
export { useStaffPolicies } from './useStaffPolicies';
export { useRealTimeLaborCosts } from './useRealTimeLaborCosts';
```

**Actualizar imports:**
```typescript
// Antes
import { useStaffData } from '@/hooks/useStaffData';

// Después
import { useStaffData } from '@/modules/staff/hooks';
```

---

### Customers Module

**Crear módulo:**
```bash
mkdir -p src/modules/customers/{hooks,store,services,components}
```

**Mover hooks:**
```bash
src/hooks/useCustomers.ts              → src/modules/customers/hooks/
src/hooks/useCustomerValidation.ts     → src/modules/customers/hooks/
```

**Mover store:**
```bash
src/store/customersStore.ts → src/modules/customers/store/
```

**Crear barrel export:**
```typescript
// src/modules/customers/hooks/index.ts
export { useCustomers } from './useCustomers';
export { useCustomerValidation } from './useCustomerValidation';
```

---

### Suppliers Module

**Crear módulo:**
```bash
mkdir -p src/modules/suppliers/{hooks,store,services,components}
```

**Mover hooks:**
```bash
src/hooks/useSuppliers.ts              → src/modules/suppliers/hooks/
src/hooks/useSupplierValidation.ts     → src/modules/suppliers/hooks/
src/hooks/useSupplierOrderValidation.ts → src/modules/suppliers/hooks/
```

**Mover store:**
```bash
src/store/suppliersStore.ts → src/modules/suppliers/store/
```

---

### Assets Module

**Crear módulo:**
```bash
mkdir -p src/modules/assets/{hooks,store,services,components}
```

**Mover hooks:**
```bash
src/hooks/useAssets.ts                 → src/modules/assets/hooks/
src/hooks/useAssetValidation.ts        → src/modules/assets/hooks/
```

**Mover store:**
```bash
src/store/assetsStore.ts → src/modules/assets/store/
```

---

### Materials Module (ya existe)

**Mover hooks:**
```bash
src/hooks/useMaterialValidation.ts     → src/modules/materials/hooks/
src/hooks/useInventoryAlerts.ts        → src/modules/materials/hooks/
src/hooks/useInventoryTransferValidation.ts → src/modules/materials/hooks/
src/hooks/useSmartInventoryAlerts.ts   → src/modules/materials/hooks/
```

---

### Products Module (ya existe)

**Mover hooks:**
```bash
src/hooks/useProductValidation.ts      → src/modules/products/hooks/
src/hooks/useProductCatalog.ts         → src/modules/products/hooks/
src/hooks/useSmartProductsAlerts.ts    → src/modules/products/hooks/
```

---

### Sales Module (ya existe)

**Mover hooks:**
```bash
src/hooks/useSaleValidation.ts         → src/modules/sales/hooks/
```

---

### Finance Modules

**Finance Fiscal:**
```bash
src/hooks/useFiscalDocumentValidation.ts → src/modules/finance-fiscal/hooks/
```

**Finance Integrations:**
```bash
src/hooks/usePaymentIntegrationValidation.ts → src/modules/finance-integrations/hooks/
```

---

### Fulfillment Module

**Mover hooks:**
```bash
src/hooks/useFulfillmentPolicies.ts    → src/modules/fulfillment/hooks/
```

---

### Gamification Module (ya existe)

**Mover hooks:**
```bash
src/hooks/useMembershipValidation.ts   → src/modules/gamification/hooks/
```

---

### Rental Module

**Crear módulo:**
```bash
mkdir -p src/modules/rental/{hooks,store,services}
```

**Mover hooks:**
```bash
src/hooks/useRentalValidation.ts       → src/modules/rental/hooks/
```

---

### Recurring Billing Module

**Crear módulo:**
```bash
mkdir -p src/modules/recurring-billing/{hooks,store,services}
```

**Mover hooks:**
```bash
src/hooks/useRecurringBillingValidation.ts → src/modules/recurring-billing/hooks/
```

---

## ✅ HOOKS QUE DEBERÍAN QUEDARSE en src/hooks/

**Genéricos/Core (sin dominio):**

```
src/hooks/core/
├── useDebounce.ts                     ✅ Genérico
├── usePagination.ts                   ✅ Genérico
├── useErrorHandler.ts                 ✅ Genérico
├── usePasswordValidation.ts           ✅ Genérico (validation utility)
└── index.ts
```

**Framework-level:**

```
src/hooks/
├── usePermissions.ts                  ✅ Cross-cutting (RBAC)
├── useNavigationDebugger.ts           ✅ Dev tooling
├── useRouteBasedPreloading.ts         ✅ Performance optimization
├── useSmartRedirect.ts                ✅ Navigation utility
├── useValidationContext.ts            ✅ Framework-level context
├── useSystemSetup.ts                  ✅ App initialization
└── index.ts
```

**Infrastructure (considerar mover a src/lib/):**

```
src/hooks/ (considerar mover)
├── useAlertsWorker.ts                 → src/lib/alerts/hooks/?
├── useGlobalAlertsInit.ts             → src/lib/alerts/hooks/?
├── useModuleBadgeSync.ts              → src/lib/navigation/hooks/?
├── useNavigationBadges.ts             → src/lib/navigation/hooks/?
├── useNotifications.ts                → src/lib/notifications/hooks/?
├── useNotificationRules.ts            → src/lib/notifications/hooks/?
├── useOperationalLockWatcher.ts       → src/lib/operations/hooks/?
├── useSystemEnums.ts                  → src/lib/enums/hooks/?
└── useZustandStores.ts                → src/lib/stores/hooks/?
```

---

## 📊 RESUMEN

### Hooks por Categoría

```
Total en src/hooks/: ~50 archivos

Distribución:
├── Genéricos (deberían quedarse): 10 (20%)
├── Framework-level (deberían quedarse): 8 (16%)
└── Específicos (deberían moverse): 32 (64%)

Módulos afectados:
├── Staff: 8 hooks
├── Customers: 2 hooks
├── Suppliers: 3 hooks
├── Materials: 4 hooks
├── Products: 3 hooks
├── Sales: 1 hook
├── Assets: 2 hooks
├── Finance: 2 hooks
├── Fulfillment: 1 hook
├── Gamification: 1 hook
├── Rental: 1 hook
└── Recurring Billing: 1 hook
```

---

## 🎯 FASES DE MIGRACIÓN

### Fase 1: Módulos Críticos (2 horas)

**Prioridad Alta - Más usados:**

1. Staff Module
   - Crear `src/modules/staff/hooks/`
   - Mover 8 hooks de staff
   - Mover `staffStore.ts`
   - Actualizar ~30 imports

2. Customers Module
   - Crear `src/modules/customers/hooks/`
   - Mover 2 hooks de customers
   - Mover `customersStore.ts`
   - Actualizar ~15 imports

3. Suppliers Module
   - Crear `src/modules/suppliers/hooks/`
   - Mover 3 hooks de suppliers
   - Mover `suppliersStore.ts`
   - Actualizar ~10 imports

---

### Fase 2: Validations (1 hora)

**Mover todos los hooks de validación a sus módulos:**

- `useMaterialValidation.ts` → `modules/materials/hooks/`
- `useProductValidation.ts` → `modules/products/hooks/`
- `useSaleValidation.ts` → `modules/sales/hooks/`
- `useAssetValidation.ts` → `modules/assets/hooks/`
- `useFiscalDocumentValidation.ts` → `modules/finance-fiscal/hooks/`

---

### Fase 3: Alerts & Policies (1 hora)

**Mover hooks de alerts/policies:**

- `useInventoryAlerts.ts` → `modules/materials/hooks/`
- `useSmartInventoryAlerts.ts` → `modules/materials/hooks/`
- `useSmartProductsAlerts.ts` → `modules/products/hooks/`
- `useFulfillmentPolicies.ts` → `modules/fulfillment/hooks/`
- `useStaffPolicies.ts` → `modules/staff/hooks/`

---

### Fase 4: Cleanup (1 hora)

**Limpiar src/hooks/:**

1. Mover genéricos a `src/hooks/core/`
2. Considerar mover infrastructure a `src/lib/`
3. Verificar que solo queden hooks genéricos
4. Actualizar `src/hooks/index.ts`

---

## ✅ CHECKLIST DE MIGRACIÓN

### Por cada hook movido:

- [ ] Crear carpeta `src/modules/{module}/hooks/` si no existe
- [ ] Mover archivo de hook
- [ ] Actualizar imports internos del hook
- [ ] Crear/actualizar `index.ts` del módulo
- [ ] Buscar y actualizar TODOS los imports del hook
  ```bash
  grep -r "from '@/hooks/useStaffData'" src/
  ```
- [ ] Verificar que compile TypeScript
- [ ] Verificar que funcione en dev
- [ ] Commit cambios

---

## 🎯 BENEFICIOS

### Antes (Anti-Pattern)

```typescript
// ❌ No está claro a qué módulo pertenece
import { useStaffData } from '@/hooks/useStaffData';

// ❌ 50+ hooks mezclados en src/hooks/
// ❌ Difícil encontrar hooks relacionados
// ❌ No sigue screaming architecture
```

### Después (Screaming Architecture)

```typescript
// ✅ GRITA "STAFF" desde el import
import { useStaffData } from '@/modules/staff/hooks';

// ✅ TODO lo de Staff está junto:
//    - hooks/
//    - store/
//    - services/
//    - components/
//    - manifest.tsx

// ✅ Consistente con Cash, Materials, Products
```

### Ventajas

1. **Screaming Architecture**: El código grita su propósito
2. **Cohesión**: Todo lo de un módulo vive junto
3. **Descubrimiento**: `ls src/modules/` muestra todas las capabilities
4. **Consistencia**: Mismo patrón en todos los módulos
5. **Mantenibilidad**: Fácil encontrar código relacionado
6. **Escalabilidad**: Agregar nuevos módulos es obvio

---

## 📝 NOTAS

### Manejo de Stores

Algunos stores están en `src/store/` pero deberían moverse a módulos:

```bash
# Actual (inconsistente)
src/store/staffStore.ts
src/store/customersStore.ts
src/store/suppliersStore.ts

# Debería ser
src/modules/staff/store/staffStore.ts
src/modules/customers/store/customersStore.ts
src/modules/suppliers/store/suppliersStore.ts
```

### Stores Globales (OK en src/store/)

Estos stores SÍ deberían quedarse en `src/store/`:

```
src/store/
├── appStore.ts                        ✅ App-level state
├── capabilityStore.ts                 ✅ App-level state
├── operationsStore.ts                 ✅ App-level state
├── setupStore.ts                      ✅ App-level state
├── themeStore.ts                      ✅ App-level state
└── index.ts
```

---

## 🔧 COMANDOS ÚTILES

### Buscar uso de un hook

```bash
# Encontrar todos los archivos que importan useStaffData
grep -r "useStaffData" src/ --include="*.ts" --include="*.tsx"
```

### Verificar TypeScript después de mover

```bash
npm run build
# o
tsc --noEmit
```

### Actualizar imports masivamente (VS Code)

1. Mover archivo
2. F2 en el import roto
3. "Update import path"
4. Repetir para cada import

---

## 🎓 APRENDIZAJES

### Qué NO hacer

❌ Mezclar hooks genéricos con hooks específicos de dominio
❌ Poner hooks de módulo en carpeta global `src/hooks/`
❌ Tener stores en `src/store/` y hooks en `src/hooks/` del mismo módulo
❌ Patrones inconsistentes entre módulos

### Qué SÍ hacer

✅ Hooks de módulo viven DENTRO del módulo
✅ Hooks genéricos en `src/hooks/core/`
✅ Todo lo de un módulo junto: hooks + store + services + components
✅ Screaming architecture: el código grita su propósito
✅ Consistencia: mismo patrón en todos los módulos

---

**Última actualización**: 2026-01-12
**Autor**: Análisis de arquitectura
**Status**: Pendiente de ejecución
