# 🚀 PROMPT PARA NUEVA SESIÓN - Continuación del Proyecto

**Copiar y pegar este prompt completo en una nueva conversación con Claude Code**

---

## 📋 CONTEXTO DEL PROYECTO

Hola Claude! Estoy continuando el desarrollo de **G-Admin Mini v3.1**, un sistema de gestión empresarial con React 19.1, TypeScript 5.8.3, Vite 7.0, ChakraUI v3.23.0 y Supabase.

### 🎉 ESTADO ACTUAL - 100% COMPLETADO

Acabamos de completar una **migración masiva de formularios** con estos logros:

- ✅ **15/15 Hooks de validación** creados (100%)
- ✅ **15/15 Hooks de form** creados (100%)
- ✅ **15/15 Formularios** migrados al Material Form Pattern (100%)
- ✅ **0 errores de TypeScript**
- ✅ **Material Form Pattern** establecido y documentado

### 📁 ARCHIVOS IMPORTANTES DE REFERENCIA

Lee estos archivos para entender el contexto:

1. **`FORM_MIGRATION_PROMPT.md`** - Documentación completa de la migración
2. **`NEXT_STEPS_ROADMAP.md`** - Roadmap de próximas tareas
3. **`CLAUDE.md`** - Instrucciones del proyecto y comandos
4. **`src/modules/ARCHITECTURE.md`** - Arquitectura del sistema

### 🏗️ PATRÓN ESTABLECIDO: MATERIAL FORM PATTERN

Todos los formularios siguen este patrón:

```
module/
├── hooks/
│   ├── useEntityValidation.ts    # Hook de validación (en src/hooks/)
│   ├── useEntityForm.tsx          # Hook de form (lógica de negocio)
│   └── index.ts
├── components/
│   └── EntityFormModal.tsx        # UI presentacional pura
└── types/
    └── entityTypes.ts
```

**Ejemplo de referencia completo**:
- Hook validación: `src/hooks/useCustomerValidation.ts`
- Hook form: `src/pages/admin/core/crm/customers/hooks/useCustomerForm.tsx`
- Componente UI: `src/pages/admin/core/crm/customers/components/CustomerForm/CustomerForm.tsx`

### 📊 HOOKS CREADOS (15/15)

**Hooks de validación** (todos en `src/hooks/`):
1. `useCustomerValidation.ts`
2. `useProductValidation.ts`
3. `useStaffValidation.ts`
4. `useSupplierValidation.ts`
5. `useMaterialValidation.ts`
6. `useShiftValidation.ts`
7. `useSaleValidation.ts`
8. `useFiscalDocumentValidation.ts`
9. `useAssetValidation.ts`
10. `useRentalValidation.ts`
11. `useMembershipValidation.ts`
12. `useRecurringBillingValidation.ts`
13. `usePaymentIntegrationValidation.ts`
14. `useSupplierOrderValidation.ts` ⭐ NUEVO
15. `useInventoryTransferValidation.ts` ⭐ NUEVO

**Hooks de form** (en módulos respectivos):
1. `useMaterialForm` - Materials (patrón de referencia)
2. `useSupplierForm` - Suppliers
3. `useShiftForm` - Scheduling
4. `useSaleForm` - Sales
5. `useFiscalDocumentForm` - Fiscal
6. `useAssetForm` - Assets
7. `useRentalForm` - Rentals
8. `useMembershipForm` - Memberships
9. `useRecurringBillingForm` - Billing
10. `usePaymentIntegrationForm` - Integrations
11. `useSupplierOrderForm` - Supplier Orders
12. `useInventoryTransferForm` - Materials
13. `useCustomerForm` - Customers ⭐ NUEVO
14. `useProductForm` - Products ⭐ NUEVO
15. `useStaffForm` - Staff ⭐ NUEVO

---

## 🎯 PRÓXIMA TAREA SUGERIDA

Quiero empezar con una **QUICK WIN de alto impacto**:

**Migrar CustomerForm para usar el nuevo hook `useCustomerForm`**

### 📍 Ubicaciones

**Hook ya creado (listo para usar)**:
- `src/pages/admin/core/crm/customers/hooks/useCustomerForm.tsx`

**Componente actual a migrar**:
- `src/pages/admin/core/crm/customers/components/CustomerForm/CustomerForm.tsx`

### ✅ Objetivos

1. **Reemplazar** la lógica actual del componente por el hook `useCustomerForm`
2. **Activar** las nuevas métricas:
   - Profile completeness (0-100%)
   - Customer risk analysis (low/medium/high)
   - Contact info tracking
   - Tax info validation
3. **Mantener** toda la funcionalidad existente
4. **Agregar** UI para las nuevas métricas (badges, progress indicators)
5. **Verificar** que TypeScript compile sin errores

### 📋 PASOS SUGERIDOS

1. **Leer** el componente actual para entender su estructura
2. **Leer** el hook `useCustomerForm` para ver qué expone
3. **Ver** el patrón de referencia en otros forms migrados (ej: `RecurringBillingFormModal`)
4. **Migrar** el componente siguiendo el Material Form Pattern
5. **Agregar** UI para métricas (completeness badge, risk badge, progress)
6. **Verificar** TypeScript: `pnpm -s exec tsc --noEmit`
7. **Documentar** cambios si es necesario

### 🎨 UI COMPONENTS A AGREGAR

Basándote en otros formularios migrados, agregar:

```tsx
// Badges de estado
<Badge colorPalette={completenessBadge.color}>
  {completenessBadge.text}
</Badge>

<Badge colorPalette={riskBadge.color}>
  {riskBadge.text}
</Badge>

// Progress indicator
{(isValidating || isSaving) && (
  <Progress.Root value={operationProgress}>
    <Progress.Track>
      <Progress.Range />
    </Progress.Track>
  </Progress.Root>
)}

// Validation summary
{validationState.hasErrors && (
  <Alert status="error" title={`${validationState.errorCount} error(es)`}>
    Por favor corrige los errores antes de continuar
  </Alert>
)}

// Customer metrics display
<Card.Root>
  <Card.Body>
    <Text>Completitud del Perfil: {customerMetrics.profileCompleteness}%</Text>
    <Text>Nivel de Riesgo: {customerMetrics.customerRisk}</Text>
  </Card.Body>
</Card.Root>
```

### 📖 ARCHIVOS DE REFERENCIA

Para ver ejemplos de formularios ya migrados, revisar:

1. **RecurringBillingFormModal.tsx** - Ejemplo completo con métricas
   - `src/pages/admin/finance/billing/components/RecurringBillingFormModal.tsx`

2. **PaymentIntegrationFormModal.tsx** - Ejemplo con security analysis
   - `src/pages/admin/finance/integrations/components/PaymentIntegrationFormModal.tsx`

3. **MaterialFormDialog.tsx** - Patrón de referencia original
   - `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/`

### 🔍 VALIDACIONES A VERIFICAR

El hook `useCustomerForm` ya implementa:

- ✅ Email uniqueness validation
- ✅ Phone format validation (Argentina)
- ✅ Name required
- ✅ Customer type validation
- ✅ Profile completeness calculation
- ✅ Customer risk analysis

**Field warnings esperados**:
- ⚠️ Email duplicado (no bloquea submit)
- ⚠️ Sin información de contacto
- ⚠️ Sin información fiscal (para tipo business)

---

## 📚 INFORMACIÓN ADICIONAL

### Comandos útiles

```bash
# Type check
pnpm -s exec tsc --noEmit

# Lint
pnpm -s exec eslint .

# Dev server (NOTA: NO ejecutar si ya está corriendo en :5173)
pnpm dev

# Build
pnpm build
```

### Imports importantes

```typescript
// Hooks
import { useCustomerForm } from '../hooks';
import type { Customer } from '../hooks';

// UI Components (SIEMPRE desde @/shared/ui, NUNCA desde @chakra-ui/react)
import {
  Dialog,
  Button,
  Alert,
  Badge,
  Progress,
  Field,
  Input,
  Card,
  Stack,
  Grid
} from '@/shared/ui';

// Notifications
import { notify } from '@/lib/notifications';
```

### TypeScript Types

El hook expone este tipo:

```typescript
interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  customer_type: 'individual' | 'business';
  tags?: string[];
  notes?: string;
  is_active: boolean;
}
```

### Material Form Pattern - API del Hook

```typescript
const {
  // Form
  form,                    // React Hook Form instance
  formData,               // Watched form data
  isEditMode,             // true si está editando

  // Validation
  fieldErrors,            // Record<string, string> - Errores que bloquean
  fieldWarnings,          // Record<string, string> - Warnings que no bloquean
  validationState,        // { hasErrors, hasWarnings, errorCount, warningCount }

  // Customer metrics (NUEVAS - activar en UI)
  customerMetrics: {
    hasCompleteProfile,
    profileCompleteness,  // 0-100%
    hasContactInfo,
    hasTaxInfo,
    customerRisk          // 'low' | 'medium' | 'high'
  },

  // Loading states
  isValidating,
  isSaving,

  // Success states
  validationPassed,
  customerCreated,

  // Computed values (USAR en UI)
  modalTitle,             // "Nuevo Cliente" o "Editar Cliente"
  submitButtonContent,    // Texto dinámico del botón
  formStatusBadge,        // { text, color }
  operationProgress,      // 0-100%
  completenessBadge,      // { text, color }
  riskBadge,             // { text, color }

  // Handlers
  handleSubmit           // Submit handler
} = useCustomerForm({
  customer,              // Opcional para edit mode
  existingCustomers,     // Para duplicate validation
  onSuccess,            // Callback después de guardar
  onSubmit              // Función que guarda en backend
});
```

---

## 🎯 TU TAREA

Por favor:

1. **Lee** el componente actual `CustomerForm.tsx`
2. **Lee** el hook `useCustomerForm.tsx`
3. **Migra** el componente para usar el hook siguiendo el Material Form Pattern
4. **Agrega** UI para las nuevas métricas (badges, progress, completeness)
5. **Verifica** TypeScript sin errores
6. **Documenta** los cambios realizados

### ✅ Criterios de éxito

- ✅ Componente usa `useCustomerForm` hook
- ✅ Toda funcionalidad existente se mantiene
- ✅ Nuevas métricas visibles en UI (completeness, risk)
- ✅ Validation summary muestra error/warning count
- ✅ Progress indicator durante submit
- ✅ TypeScript compila sin errores
- ✅ Código sigue Material Form Pattern

---

## 💡 ALTERNATIVA: ELEGIR OTRA TAREA

Si prefieres empezar con algo diferente, estas son otras opciones del roadmap:

### Opción 2: Testing
- Crear tests unitarios para `useCustomerValidation`
- Archivo: `src/hooks/__tests__/useCustomerValidation.test.ts`
- Framework: Vitest + React Testing Library

### Opción 3: Migrar ProductForm
- Similar a Customer pero con profit margin calculations
- Hook: `useProductForm`
- Componente: `src/pages/admin/supply-chain/products/components/`

### Opción 4: Migrar StaffForm
- Similar a Customer pero con tenure analysis
- Hook: `useStaffForm`
- Componente: `src/pages/admin/resources/staff/components/`

### Opción 5: Documentación
- Crear `docs/hooks/FORM_HOOKS_GUIDE.md`
- Documentar cómo usar los 15 hooks creados

---

## 📝 NOTAS IMPORTANTES

### ⚠️ RECORDAR

1. **NUNCA** importar directamente desde `@chakra-ui/react`
   - ❌ `import { Button } from '@chakra-ui/react'`
   - ✅ `import { Button } from '@/shared/ui'`

2. **SIEMPRE** verificar TypeScript después de cambios
   - `pnpm -s exec tsc --noEmit`

3. **NO** correr `pnpm dev` si ya hay servidor en :5173

4. **USAR** Material Form Pattern consistentemente

5. **LEER** archivos de referencia antes de implementar

---

## 🚀 ¿LISTO?

**Por favor confirma**:
- ¿Entiendes el contexto del proyecto?
- ¿Entiendes el Material Form Pattern?
- ¿Estás listo para migrar CustomerForm?

O si prefieres, **dime qué otra tarea** del roadmap quieres abordar primero.

¡Empecemos! 🎉
