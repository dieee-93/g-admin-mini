# Recurring Billing Form - Ejemplo de Uso

**Fecha**: 2025-02-01
**Patrón**: Material Form Pattern
**Hook**: `useRecurringBillingForm`
**Componente**: `RecurringBillingFormModal`

---

## ✅ Migración Completa

El formulario de **Recurring Billing** ha sido migrado al **Material Form Pattern** con separación completa de lógica de negocio y UI.

### Archivos Creados

1. **`hooks/useRecurringBillingForm.tsx`** - Lógica de negocio
2. **`components/RecurringBillingFormModal.tsx`** - UI presentacional
3. **`hooks/index.ts`** - Exports de hooks
4. **`components/index.ts`** - Exports de componentes

---

## 📋 Características Implementadas

### ✅ Validation System
- Hook de validación pre-existente: `useRecurringBillingValidation`
- Field errors (bloquean submit)
- Field warnings (no bloquean, solo alertan)
- Validation summary con Alert

### ✅ Billing Metrics (Real-time)
- **Monto mensual**: Calculado según frecuencia
- **Ingresos anuales**: `monthlyAmount × 12`
- **Valor de vida (LTV)**: Basado en duración o estimado (2 años)
- **Próxima facturación**: Auto-calculado según frecuencia
- **Días hasta próxima**: Countdown en tiempo real
- **Ciclos totales**: Si hay fecha de fin
- **Salud de ingresos**: high/medium/low basado en monto
- **Riesgo de retención**: high/medium/low basado en frecuencia

### ✅ Loading States
- `isValidating` - Durante validación
- `isSaving` - Durante guardado
- `isCalculating` - Durante cálculo de métricas

### ✅ Success States
- `validationPassed` - Validación exitosa
- `billingCreated` - Facturación creada
- `metricsCalculated` - Métricas calculadas

### ✅ Computed Values
- `modalTitle` - "Nueva" o "Editar" según modo
- `submitButtonContent` - Estados dinámicos del botón
- `formStatusBadge` - Incompleto/Con errores/Listo
- `operationProgress` - 0% → 33% → 66% → 100%
- `billingHealthBadge` - Excelente/Buena/Mejorable

### ✅ Visual Feedback
- Border colors (error = red, warning = orange)
- Progress indicator multi-etapa
- Real-time metrics display
- Status badges

### ✅ Auto-calculate Helpers
- `autoCalculateNextBilling()` - Calcula próxima facturación según frecuencia

---

## 🔧 Ejemplo de Integración

### Opción 1: Modal (Recomendado)

```typescript
import { useState } from 'react';
import { RecurringBillingFormModal } from './components';
import { Button } from '@/shared/ui';

export const BillingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<RecurringBilling | undefined>();

  const handleCreate = () => {
    setSelectedBilling(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (billing: RecurringBilling) => {
    setSelectedBilling(billing);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    // Refresh billing list
    refetchBillings();
  };

  return (
    <>
      <Button onClick={handleCreate}>
        Nueva Facturación Recurrente
      </Button>

      <RecurringBillingFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recurringBilling={selectedBilling}
        onSuccess={handleSuccess}
      />
    </>
  );
};
```

### Opción 2: Inline (Si no se necesita modal)

```typescript
import { useRecurringBillingForm } from './hooks';

export const BillingFormInline = () => {
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    billingMetrics,
    handleSubmit
  } = useRecurringBillingForm({
    onSubmit: async (data) => {
      await createRecurringBilling(data);
    },
    onSuccess: () => {
      console.log('Billing created!');
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* Use form.register() para campos */}
      {/* Use fieldErrors/fieldWarnings para feedback */}
      {/* Use billingMetrics para mostrar métricas */}
    </form>
  );
};
```

---

## 📊 Billing Metrics - Detalles

### Cálculo de Monto Mensual

```typescript
monthlyAmount = {
  daily: amount × 30,
  weekly: amount × 4,
  monthly: amount,
  quarterly: amount ÷ 3,
  yearly: amount ÷ 12
}
```

### Cálculo de LTV (Lifetime Value)

```typescript
if (end_date && start_date) {
  months = (end_date - start_date) / 30 days
  LTV = monthlyAmount × months
} else {
  LTV = annualRevenue × 2  // Estimado 2 años
}
```

### Cálculo de Próxima Facturación

```typescript
nextBillingDate = {
  daily: startDate + 1 day,
  weekly: startDate + 7 days,
  monthly: startDate + 1 month,
  quarterly: startDate + 3 months,
  yearly: startDate + 1 year
}
```

---

## ⚠️ Validaciones y Warnings

### Errors (bloquean submit)
- ❌ `customer_id` requerido
- ❌ `service_description` requerido
- ❌ `amount` debe ser > 0
- ❌ `start_date` requerido
- ❌ `next_billing_date` requerido

### Warnings (no bloquean)
- ⚠️ Monto muy alto (> $100,000)
- ⚠️ Auto-cargo sin método de pago
- ⚠️ Facturación inactiva (paused/cancelled)
- ⚠️ Fecha de fin anterior a fecha de inicio

---

## 🎨 Estados del Formulario

### Form Status Badge
- 🔴 **Con errores** - Hay errores de validación
- 🟡 **Con advertencias** - Hay warnings pero sin errores
- ⚪ **Incompleto** - Faltan campos requeridos
- 🟢 **Listo para guardar** - Todo válido

### Billing Health Badge
- 🟢 **Excelente** - High revenue + Low risk
- 🔵 **Buena** - Medium revenue o Medium risk
- 🟠 **Mejorable** - Low revenue o High risk
- 🟡 **Revisar** - Otros casos

---

## 🔄 Progress Indicator

1. **0%** - Formulario en edición
2. **33%** - ✓ Validación pasada
3. **66%** - ✓ Guardando datos
4. **100%** - ✓ Completado

---

## 🚀 Próximos Pasos (Opcional)

Si se necesita integrar con backend real:

1. Crear hook CRUD: `useRecurringBillings.ts`
2. Implementar `createRecurringBilling()`
3. Implementar `updateRecurringBilling()`
4. Conectar con Supabase table `recurring_billings`
5. Agregar real-time subscriptions

---

## 📝 TypeScript

El hook y componente están **100% tipados**:
- ✅ 0 errores de TypeScript
- ✅ Inferencia completa de tipos
- ✅ Validación de schemas con Zod

---

**Migración completada**: 2025-02-01
**Patrón seguido**: Material Form Pattern
**Referencias**:
- `useMaterialForm.tsx` - Patrón original
- `useSupplierForm.tsx` - Ejemplo reciente
- `useShiftForm.tsx` - Ejemplo con métricas
