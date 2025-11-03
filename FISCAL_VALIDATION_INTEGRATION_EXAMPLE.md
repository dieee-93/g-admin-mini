# 📋 Fiscal Document Validation - Integration Example

**Fecha**: 2025-01-31
**Hook creado**: `src/hooks/useFiscalDocumentValidation.ts`
**Schema utilizado**: `EntitySchemas.fiscalDocument` (CommonSchemas.ts)

---

## ✅ Hook de Validación Completado

El hook `useFiscalDocumentValidation.ts` sigue el patrón establecido de Materials/Employee y provee:

### Funcionalidades

- ✅ **React Hook Form + Zod** - Validación automática con schema centralizado
- ✅ **Validación CUIT** - Formato argentino `20-12345678-9`
- ✅ **Validación CAE** - Formato 14 dígitos + validación de expiración
- ✅ **Validación de Totales** - subtotal + IVA = total (con tolerancia 0.01)
- ✅ **Validación de Items** - Array de ítems con cálculos
- ✅ **Duplicate Detection** - Detecta comprobantes duplicados (punto_venta + numero)
- ✅ **Field Warnings** - Alertas para CAE faltante, totales altos, etc.
- ✅ **Real-time Validation** - onChange mode por defecto

---

## 📝 Ejemplo de Uso Básico

### Opción 1: Form Modal Simplificado (Similar a EmployeeForm.tsx)

```typescript
import { useFiscalDocumentValidation } from '@/hooks/useFiscalDocumentValidation';
import { FiscalDocumentFormData } from '@/lib/validation/zod/CommonSchemas';
import {
  Modal,
  VStack,
  HStack,
  Button,
  Input,
  Field,
  NativeSelect,
  Alert
} from '@/shared/ui';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

interface FiscalFormModalProps {
  document?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  existingDocuments?: any[];
}

export function FiscalFormModal({
  document,
  isOpen,
  onClose,
  onSuccess,
  existingDocuments = []
}: FiscalFormModalProps) {

  const isEditing = !!document;

  // Hook de validación
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm
  } = useFiscalDocumentValidation(
    {
      document_type: document?.document_type || 'factura_b',
      point_of_sale: document?.point_of_sale || 1,
      document_number: document?.document_number || 1,
      issue_date: document?.issue_date || new Date().toISOString().split('T')[0],
      customer_name: document?.customer_name || '',
      customer_cuit: document?.customer_cuit || '',
      customer_address: document?.customer_address || '',
      subtotal: document?.subtotal || 0,
      iva_amount: document?.iva_amount || 0,
      total: document?.total || 0,
      cae: document?.cae || '',
      cae_expiration: document?.cae_expiration || '',
      items: document?.items || []
    },
    existingDocuments,
    document?.id
  );

  const { register, handleSubmit: createSubmitHandler, reset } = form;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const handleSubmit = createSubmitHandler(async (data: FiscalDocumentFormData) => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      // API call to create/update fiscal document
      // await fiscalApi.create/update(data);

      onSuccess?.();
      onClose();
      reset();
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'Error al guardar'
      });
    }
  });

  return (
    <Modal open={isOpen} onClose={onClose} size="xl">
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>
            {isEditing ? 'Editar Comprobante Fiscal' : 'Nuevo Comprobante Fiscal'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <form onSubmit={handleSubmit} id="fiscal-form">
            <VStack gap="4">
              {/* Validation Summary */}
              {validationState.hasErrors && (
                <Alert status="error">
                  <Alert.Indicator />
                  <Alert.Title>Errores de Validación</Alert.Title>
                  <Alert.Description>
                    Hay {validationState.errorCount} error(es) en el formulario.
                  </Alert.Description>
                </Alert>
              )}

              {/* Document Type */}
              <Field.Root invalid={!!fieldErrors.document_type}>
                <Field.Label>Tipo de Comprobante *</Field.Label>
                <NativeSelect.Root {...register('document_type')}>
                  <NativeSelect.Field placeholder="Seleccionar...">
                    <option value="factura_a">Factura A</option>
                    <option value="factura_b">Factura B</option>
                    <option value="factura_c">Factura C</option>
                    <option value="nota_credito">Nota de Crédito</option>
                    <option value="nota_debito">Nota de Débito</option>
                  </NativeSelect.Field>
                </NativeSelect.Root>
                {fieldErrors.document_type && (
                  <Field.ErrorText>{fieldErrors.document_type}</Field.ErrorText>
                )}
              </Field.Root>

              {/* Point of Sale + Document Number */}
              <HStack gap="4">
                <Field.Root invalid={!!fieldErrors.point_of_sale} flex="1">
                  <Field.Label>Punto de Venta *</Field.Label>
                  <Input
                    type="number"
                    {...register('point_of_sale', { valueAsNumber: true })}
                    placeholder="1"
                  />
                  {fieldErrors.point_of_sale && (
                    <Field.ErrorText>{fieldErrors.point_of_sale}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!fieldErrors.document_number} flex="2">
                  <Field.Label>Número de Comprobante *</Field.Label>
                  <Input
                    type="number"
                    {...register('document_number', { valueAsNumber: true })}
                    placeholder="00000001"
                  />
                  {fieldErrors.document_number && (
                    <Field.ErrorText>{fieldErrors.document_number}</Field.ErrorText>
                  )}
                </Field.Root>
              </HStack>

              {/* Customer Info */}
              <Field.Root invalid={!!fieldErrors.customer_name}>
                <Field.Label>Razón Social / Nombre *</Field.Label>
                <Input
                  {...register('customer_name')}
                  placeholder="Juan Pérez / Empresa SA"
                />
                {fieldErrors.customer_name && (
                  <Field.ErrorText>{fieldErrors.customer_name}</Field.ErrorText>
                )}
              </Field.Root>

              <Field.Root invalid={!!fieldErrors.customer_cuit}>
                <Field.Label>CUIT/CUIL *</Field.Label>
                <Input
                  {...register('customer_cuit')}
                  placeholder="20-12345678-9"
                />
                {fieldErrors.customer_cuit && (
                  <Field.ErrorText>{fieldErrors.customer_cuit}</Field.ErrorText>
                )}
                <Field.HelperText>Formato: 20-12345678-9</Field.HelperText>
              </Field.Root>

              <Field.Root invalid={!!fieldErrors.customer_address}>
                <Field.Label>Domicilio *</Field.Label>
                <Input
                  {...register('customer_address')}
                  placeholder="Av. Corrientes 1234, CABA"
                />
                {fieldErrors.customer_address && (
                  <Field.ErrorText>{fieldErrors.customer_address}</Field.ErrorText>
                )}
              </Field.Root>

              {/* Amounts */}
              <HStack gap="4">
                <Field.Root invalid={!!fieldErrors.subtotal} flex="1">
                  <Field.Label>Subtotal *</Field.Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('subtotal', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {fieldErrors.subtotal && (
                    <Field.ErrorText>{fieldErrors.subtotal}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!fieldErrors.iva_amount} flex="1">
                  <Field.Label>IVA *</Field.Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('iva_amount', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {fieldErrors.iva_amount && (
                    <Field.ErrorText>{fieldErrors.iva_amount}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!fieldErrors.total} flex="1">
                  <Field.Label>Total *</Field.Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('total', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {fieldErrors.total && (
                    <Field.ErrorText>{fieldErrors.total}</Field.ErrorText>
                  )}
                  {fieldWarnings.total && (
                    <HStack gap="1" color="orange.500" fontSize="sm">
                      <ExclamationTriangleIcon style={{ width: '16px' }} />
                      <span>{fieldWarnings.total}</span>
                    </HStack>
                  )}
                </Field.Root>
              </HStack>

              {/* CAE */}
              <HStack gap="4">
                <Field.Root invalid={!!fieldErrors.cae} flex="1">
                  <Field.Label>CAE</Field.Label>
                  <Input
                    {...register('cae')}
                    placeholder="12345678901234"
                    maxLength={14}
                  />
                  {fieldErrors.cae && (
                    <Field.ErrorText>{fieldErrors.cae}</Field.ErrorText>
                  )}
                  {fieldWarnings.cae && (
                    <HStack gap="1" color="orange.500" fontSize="sm">
                      <ExclamationTriangleIcon style={{ width: '16px' }} />
                      <span>{fieldWarnings.cae}</span>
                    </HStack>
                  )}
                  <Field.HelperText>14 dígitos numéricos</Field.HelperText>
                </Field.Root>

                <Field.Root invalid={!!fieldErrors.cae_expiration} flex="1">
                  <Field.Label>Vencimiento CAE</Field.Label>
                  <Input
                    type="date"
                    {...register('cae_expiration')}
                  />
                  {fieldErrors.cae_expiration && (
                    <Field.ErrorText>{fieldErrors.cae_expiration}</Field.ErrorText>
                  )}
                  {fieldWarnings.cae_expiration && (
                    <HStack gap="1" color="orange.500" fontSize="sm">
                      <ExclamationTriangleIcon style={{ width: '16px' }} />
                      <span>{fieldWarnings.cae_expiration}</span>
                    </HStack>
                  )}
                </Field.Root>
              </HStack>
            </VStack>
          </form>
        </Modal.Body>

        <Modal.Footer>
          <HStack gap="3" justify="end">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="fiscal-form"
              colorPalette="blue"
            >
              {isEditing ? 'Actualizar' : 'Crear'} Comprobante
            </Button>
          </HStack>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
```

---

## 📝 Opción 2: Integración con FiscalFormEnhanced Existente

Si quieres integrar la validación en el `FiscalFormEnhanced.tsx` existente (que usa DynamicForm), puedes hacerlo así:

```typescript
// En FiscalFormEnhanced.tsx

import { useFiscalDocumentValidation } from '@/hooks/useFiscalDocumentValidation';

export function FiscalFormEnhanced({ invoice, onSuccess, onCancel }: FiscalFormEnhancedProps) {

  // 🆕 Agregar hook de validación
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm,
    validateCUITFormat,
    validateTotals
  } = useFiscalDocumentValidation(
    {
      // Map invoice data to FiscalDocumentFormData
      document_type: invoice?.invoice_type || 'factura_b',
      point_of_sale: parseInt(invoice?.fiscal_point || '1'),
      document_number: parseInt(invoice?.invoice_number || '1'),
      issue_date: invoice?.issue_date || new Date().toISOString().split('T')[0],
      customer_name: invoice?.customer_name || '',
      customer_cuit: invoice?.customer_tax_id || '',
      customer_address: invoice?.customer_address || '',
      subtotal: invoice?.subtotal || 0,
      iva_amount: invoice?.tax_amount || 0,
      total: invoice?.total_amount || 0,
      cae: invoice?.cae || '',
      cae_expiration: invoice?.cae_due_date || '',
      items: invoice?.items || []
    },
    [], // Existing documents (fetch from API)
    invoice?.id
  );

  // Usar las validaciones en el submit
  const handleSubmit = async (data: InvoiceFormData) => {
    // Validación Zod + Business Logic
    const isValid = await validateForm();
    if (!isValid) {
      notify.error({
        title: 'Errores de Validación',
        description: `Hay ${validationState.errorCount} errores en el formulario`
      });
      return;
    }

    // Validación extra de totales
    const totalsError = validateTotals(data as any);
    if (totalsError) {
      notify.error({
        title: 'Error en Totales',
        description: totalsError
      });
      return;
    }

    // Continuar con el submit...
    // ...
  };

  // Resto del componente...
}
```

---

## 🎯 Business Logic Validators Disponibles

El hook expone funciones de validación de negocio que puedes usar:

```typescript
const {
  validateCUITFormat,    // (cuit: string) => boolean
  validateCAEExpiration, // (date: string) => boolean
  calculateIVA,          // (subtotal: number, items: []) => number
  validateTotals         // (data: FormData) => string | null
} = useFiscalDocumentValidation(...);

// Ejemplo: Validar CUIT manualmente
if (!validateCUITFormat('20-12345678-9')) {
  console.error('CUIT inválido');
}

// Ejemplo: Calcular IVA automáticamente
const ivaCalculado = calculateIVA(1000, items);

// Ejemplo: Validar totales antes de submit
const error = validateTotals(formData);
if (error) {
  notify.error({ title: 'Error', description: error });
}
```

---

## ✅ Validaciones Implementadas

### Schema Zod (Automáticas)

- ✅ `document_type` - Enum values
- ✅ `point_of_sale` - Int, min 1, max 9999
- ✅ `document_number` - Int, min 1
- ✅ `customer_name` - String personalizado
- ✅ `customer_cuit` - Regex `^\d{2}-\d{8}-\d{1}$`
- ✅ `customer_address` - Min 5, max 300 chars
- ✅ `subtotal` - Currency (min 0)
- ✅ `iva_amount` - Currency (min 0)
- ✅ `total` - Currency (min 0)
- ✅ `cae` - 14 dígitos numéricos
- ✅ `cae_expiration` - Date string
- ✅ `items` - Array mínimo 1 ítem
- ✅ `items[].description` - Required
- ✅ `items[].quantity` - Min 1
- ✅ `items[].unit_price` - Min 0
- ✅ `items[].iva_rate` - 0-100%

### Business Logic (Customs)

- ✅ **Duplicate Detection** - Verifica punto_venta + numero + tipo
- ✅ **Totals Validation** - subtotal + IVA = total (tolerancia 0.01)
- ✅ **Items Subtotal** - Suma ítems = subtotal documento
- ✅ **CAE Expiration** - Fecha futura
- ✅ **High Total Warning** - Alerta si total > 1,000,000

### Field Warnings

- ⚠️ Total muy alto (> $1,000,000)
- ⚠️ CAE faltante
- ⚠️ CAE próximo a vencer (< 7 días)
- ⚠️ Items array vacío

---

## 📊 Siguiente Paso

Para completar la migración del módulo Fiscal:

1. ✅ Hook de validación creado
2. ⏳ Integrar hook en formulario existente (FiscalFormEnhanced.tsx) O crear formulario nuevo
3. ⏳ Crear tests del hook
4. ⏳ Actualizar documentación

**Recomendación**: Crear un formulario modal simplificado (como el ejemplo arriba) para casos de uso comunes, manteniendo el FiscalFormEnhanced.tsx para casos avanzados con cálculos en tiempo real.

---

**Última actualización**: 2025-01-31
**Autor**: Claude Code
**Sesión**: Schema Validation Migration - Phase 2 (Fiscal Module)
