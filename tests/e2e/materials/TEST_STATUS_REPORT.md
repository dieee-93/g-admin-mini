# Materials E2E Tests - Estado Actual

**Fecha**: 2026-01-30  
**Archivo**: `tests/e2e/materials/materials-crud-complete.spec.ts`

## Resumen Ejecutivo

- **Total de tests**: 7 (se eliminaron tests de Update/Delete que estaban duplicados)
- **✅ Tests pasando**: 2/7 (29%)
- **❌ Tests fallando**: 5/7 (71%)

## Tests que Pasan ✅

### 1. Test MEASURABLE Material (Test #1)
- **Estado**: ✅ PASA
- **Tiempo**: ~27s
- **Qué hace**: Crea material tipo MEASURABLE (kg, litros) con stock inicial
- **Selectores clave usados**:
  - `material-name-input`
  - `material-type-select`
  - `material-category-select`
  - `material-unit`
  - `add-stock-switch`
  - `measurable-quantity-input`
  - `measurable-cost-input`
  - `submit-material`

### 2. Test COUNTABLE Material (Test #3)
- **Estado**: ✅ PASA  
- **Tiempo**: ~27s
- **Qué hace**: Crea material tipo COUNTABLE (unidades) con stock inicial
- **Selectores similares** a test #1 pero con `countable-quantity-input` y `countable-cost-input`

---

## Tests que Fallan ❌

### 1. Test ELABORATED Material (Test #2) - LÍNEA 208
**Error**: `recipe-input-quantity-0` no se encuentra

**Problema**:
```typescript
const quantityInput = dialog.getByTestId('recipe-input-quantity-0');
await expect(quantityInput).toBeVisible(); // ❌ FALLA
```

**Causa**: 
- El test espera que después de seleccionar un material de la receta, aparezca un input con testid `recipe-input-quantity-0`
- Este testid probablemente no existe en el RecipeBuilder

**Solución requerida**:
1. Investigar cómo funciona RecipeBuilder y qué testids usa
2. O agregar data-testids al RecipeBuilder para inputs de cantidad
3. O simplificar el test para que NO pruebe recetas (solo crear ELABORATED sin receta)

---

### 2. Test Validar Campos Requeridos (Test #4) - LÍNEA 309
**Error**: Botón "Crear Material" no se encuentra

**Problema**:
```typescript
const submitButton = dialog.getByRole('button', { name: /Crear Material/i });
await submitButton.click(); // ❌ TIMEOUT
```

**Causa**:
- El botón no existe o tiene otro texto
- Posiblemente el formulario vacío deshabilita el botón submit

**Solución requerida**:
1. Usar `getByTestId('submit-material')` en lugar de `getByRole`
2. O verificar si el botón está deshabilitado y usar `.click({ force: true })`
3. O verificar el texto exacto del botón en el formulario

---

### 3. Test Validar Costo Negativo (Test #5) - LÍNEA 350
**Error**: Mensaje de error `costo.*mayor.*0` no se encuentra

**Problema**:
```typescript
const costError = dialog.locator('text=/costo.*mayor.*0/i').first();
await expect(costError).toBeVisible({ timeout: 3000 }); // ❌ NO VISIBLE
```

**Causa**:
- El mensaje de validación tiene otro texto
- O la validación no se dispara porque el formulario no hace submit
- O el sistema acepta costos negativos (bug en la app)

**Solución requerida**:
1. Verificar cuál es el mensaje exacto de validación para costos negativos
2. Verificar si la validación existe en el formulario
3. Posiblemente el formulario valida en submit, no en blur del campo

**Acciones**:
- Revisar screenshot en `test-results/materials-materials-crud-c-f0750-ar-costo-inválido-negativo--authenticated/test-failed-1.png`
- Buscar en el código la validación de `measurable-cost-input`

---

### 4. Test Toast Duración (Test #9) - LÍNEA 408
**Error**: Toast "Item creado" no aparece (timeout 30s)

**Problema**:
```typescript
const toast = page.locator('[role="status"]').filter({ hasText: /Item creado/i });
await expect(toast).toBeVisible({ timeout: 10000 }); // ❌ TIMEOUT
```

**Causa**:
- El material no se crea exitosamente
- Probablemente el Event Sourcing confirmation no se confirma
- O hay un error en la creación que no se detecta

**Solución requerida**:
1. Aumentar timeout de confirmación Event Sourcing
2. Agregar logs para ver si la confirmación aparece
3. Verificar si hay errores en console del browser

---

### 5. Test Múltiples Toasts (Test #10) - LÍNEA 467
**Error**: Segundo intento de crear material falla - botón "Agregar Material" no se encuentra

**Problema**:
```typescript
// En el loop i=2
const newMaterialButton = page.getByRole('button', { name: 'Agregar Material' });
await newMaterialButton.dispatchEvent('click'); // ❌ TIMEOUT
```

**Causa**:
- Después del primer material, la página cambia de estado
- El botón "Agregar Material" está oculto o deshabilitado
- O el primer material no se creó y la UI está en estado inválido

**Solución requerida**:
1. Esperar a que el primer toast desaparezca antes de crear el segundo
2. Usar `page.waitForLoadState('networkidle')` entre creaciones
3. Verificar que el modal del primer material se cierre correctamente

---

## Correcciones Realizadas

### ✅ Selectores Actualizados
- `material-name` → `material-name-input` ✅
- `getByRole('button', { name: /medible/i })` → `getByTestId('material-type-select').locator('[data-part="trigger"]')` ✅
- `material-category` → `material-category-select` ✅
- Agregado patrón completo de Event Sourcing confirmation ✅

### ✅ Patrón Correcto para Crear Material MEASURABLE
```typescript
// 1. Abrir modal
await page.getByTestId('materials-toolbar-new-button').click();

// 2. Esperar lazy load
await expect(page.getByText('Cargando formulario...')).toBeVisible({ timeout: 5000 });
await expect(page.getByText('Cargando formulario...')).toBeHidden({ timeout: 30000 });

const dialog = page.locator('[role="dialog"]');

// 3. Llenar nombre
await dialog.getByTestId('material-name-input').fill('Nombre Test');

// 4. Seleccionar tipo MEASURABLE
await dialog.getByTestId('material-type-select').locator('[data-part="trigger"]').click();
await page.waitForTimeout(300);
await page.getByRole('option', { name: /Conmensurable/i }).click();

// 5. Seleccionar categoría
await dialog.getByTestId('material-category-select').locator('[data-part="trigger"]').click();
await page.waitForTimeout(500);
await page.getByRole('option').first().click();

// 6. Seleccionar unidad
await dialog.getByTestId('material-unit').locator('[data-part="trigger"]').click();
await page.waitForTimeout(300);
await page.getByRole('option', { name: 'kg' }).click();

// 7. Activar stock switch
await dialog.getByTestId('add-stock-switch').click();
await page.waitForTimeout(500);

// 8. Llenar stock
await dialog.getByTestId('measurable-quantity-input').fill('20');
await dialog.getByTestId('measurable-cost-input').fill('3010');

// 9. Submit
await dialog.getByTestId('submit-material').click();

// 10. Confirmar Event Sourcing
await page.waitForTimeout(500);
const confirmationDialog = page.locator('[role="dialog"]').filter({ 
  hasText: 'Confirmar Creación con Event Sourcing' 
});
await expect(confirmationDialog).toBeVisible({ timeout: 5000 });

const confirmButton = confirmationDialog.getByRole('button', { 
  name: 'Confirmar y Guardar →' 
});
await confirmButton.click();

// 11. Verificar toast
const toast = page.locator('[role="status"]').filter({ hasText: /Material creado/i });
await expect(toast).toBeVisible({ timeout: 10000 });
```

---

## Próximos Pasos

### 🔥 Prioridad Alta

1. **Simplificar o skip test ELABORATED** (Test #2)
   - Opción A: Skip temporalmente hasta agregar testids al RecipeBuilder
   - Opción B: Simplificar para crear ELABORATED sin receta
   - Opción C: Investigar y agregar testids correctos

2. **Corregir test Validar Campos Requeridos** (Test #4)
   - Usar `getByTestId('submit-material')` en lugar de `getByRole`
   - Verificar screenshot para entender estado del formulario

3. **Corregir test Validar Costo Negativo** (Test #5)
   - Revisar screenshot para ver mensaje exacto de error
   - Posiblemente necesita ajustar regex del locator

4. **Corregir tests de Notificaciones** (Test #9 y #10)
   - Agregar `waitForLoadState('networkidle')` entre operaciones
   - Asegurar que confirmación Event Sourcing funciona correctamente

### 📋 Prioridad Media

5. **Ejecutar otros archivos de tests e2e**:
   - `materials-crud.spec.ts`
   - `materials-stock-adjustment.spec.ts`
   - `materials-bulk-operations.spec.ts`
   - `materials-abc-analysis.spec.ts`
   - `materials-notifications.spec.ts`
   - `materials-stock-calculations.spec.ts`
   - `materials-diagnostic.spec.ts`

6. **Identificar casos faltantes de cobertura**

### 📝 Prioridad Baja

7. **Documentar patrones de testing**
8. **Agregar más data-testids** a componentes
9. **Optimizar tiempos de espera**

---

## Comandos Útiles

```bash
# Ejecutar solo materials-crud-complete.spec.ts
pnpm exec playwright test tests/e2e/materials/materials-crud-complete.spec.ts --project=authenticated

# Modo UI (interactivo)
pnpm exec playwright test tests/e2e/materials/materials-crud-complete.spec.ts --project=authenticated --ui

# Modo debug
pnpm exec playwright test tests/e2e/materials/materials-crud-complete.spec.ts --project=authenticated --debug

# Ver screenshots de tests fallidos
explorer test-results

# Ejecutar test específico
pnpm exec playwright test tests/e2e/materials/materials-crud-complete.spec.ts:44 --project=authenticated
```

---

## Archivos Modificados

- `tests/e2e/materials/materials-crud-complete.spec.ts` - Actualizados selectores y patrones

## Screenshots Disponibles

Los tests fallidos generan screenshots automáticamente en:
- `test-results/materials-materials-crud-c-*/test-failed-1.png`

**Revisar estos screenshots para entender visualmente qué está fallando.**

---

**Estado**: 🟡 En Progreso  
**Próxima Acción**: Revisar screenshots y corregir tests de validación (#4 y #5)
