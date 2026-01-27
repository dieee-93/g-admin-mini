# Integración Recipe Module ↔ Materials Module

> Documentación de la integración entre RecipeBuilder y MaterialForm

---

## 🎯 Objetivo

Integrar el **RecipeBuilder** en el flujo de creación de **Materiales Elaborados**, reemplazando el componente legacy `RecipeBuilderClean`.

---

## ✅ Integración Completada

### Archivo Modificado

**Ubicación**: `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/ElaboratedFields.tsx`

### Cambios Realizados

#### ANTES (Legacy)
```typescript
import { RecipeBuilderClean } from '@/shared/components/recipe/RecipeBuilderClean';

<RecipeBuilderClean
  mode="material"
  context={`Material: ${formData.name || 'Nuevo Item'}`}
  showList={false}
  onRecipeCreated={(recipe) => {
    const r = recipe as any;
    setFormData({
      ...formData,
      recipe_id: r.id,
      initial_stock: r.output_quantity || 1,
      unit_cost: r.total_cost || 0
    });
  }}
/>
```

#### DESPUÉS (Nuevo)
```typescript
import { RecipeBuilder } from '@/modules/recipe/components';
import type { Recipe } from '@/modules/recipe/types';

<RecipeBuilder
  mode="create"
  entityType="material"
  complexity="minimal"
  features={{
    showCostCalculation: true,
    showInstructions: false,
    showYieldConfig: false,
    showQualityConfig: false,
  }}
  outputItem={{
    id: formData.id || 'temp',
    name: formData.name,
    type: 'material' as const,
    unit: formData.unit || 'unit',
  }}
  outputQuantity={formData.initial_stock || 1}
  onSave={(recipe: Recipe) => {
    setFormData({
      ...formData,
      recipe_id: recipe.id,
      initial_stock: recipe.output.quantity || 1,
    });
  }}
/>
```

---

## 🔄 Flujo de Integración

### 1. Usuario abre MaterialForm
```
User clicks "Nuevo Material"
  → MaterialFormModal opens
    → User selects type: "ELABORATED"
      → ElaboratedFields component renders
```

### 2. ElaboratedFields renderiza RecipeBuilder
```typescript
// El outputItem se pre-llena con datos del material
const outputItem = {
  id: formData.id || 'temp',
  name: formData.name,         // Nombre del material
  type: 'material',
  unit: formData.unit,         // Unidad del material
}

// RecipeBuilder se renderiza en modo "minimal"
<RecipeBuilder
  entityType="material"        // ✅ Solo permite materials como inputs
  complexity="minimal"         // ✅ UI simplificada
  outputItem={outputItem}      // ✅ Pre-filled con material actual
  onSave={handleRecipeSaved}   // ✅ Callback al guardar
/>
```

### 3. Usuario crea la receta
```
User fills recipe:
  → Adds ingredients (materials)
  → Sets quantities and units
  → Sees automatic cost calculation
  → Clicks "Crear Receta"
```

### 4. RecipeBuilder guarda la receta
```typescript
// En RecipeBuilderProvider.saveRecipe()
const savedRecipe = await createRecipe.mutateAsync(recipe)

// 🔑 CRÍTICO: Si entityType='material', ejecutar inmediatamente
if (savedRecipe.executionMode === 'immediate') {
  await recipeApi.executeRecipe(savedRecipe.id, 1)
}

// Llamar callback con recipe guardada
onSave?.(savedRecipe)
```

### 5. ElaboratedFields actualiza MaterialForm
```typescript
const handleRecipeSaved = (recipe: Recipe) => {
  setFormData({
    ...formData,
    recipe_id: recipe.id,                    // ✅ Link a recipe
    initial_stock: recipe.output.quantity,   // ✅ Stock inicial
  });
}
```

### 6. MaterialForm guarda el material
```
User clicks "Guardar Material"
  → Material saved with recipe_id
    → Material is now "ELABORATED"
      → Recipe is linked
        → Stock updated from recipe execution
```

---

## 🔑 Diferencias Clave

### Legacy vs Nuevo

| Aspecto | Legacy (RecipeBuilderClean) | Nuevo (RecipeBuilder) |
|---------|----------------------------|----------------------|
| **Configuración** | Props fijos | Configurable via complexity + features |
| **Validación** | Manual | Automática por entityType |
| **Costos** | Opcional, manual | Automático con Decimal.js |
| **Type Safety** | `any` casting | Tipos estrictos |
| **State Management** | Local state | Context API + TanStack Query |
| **Performance** | No optimizado | Memoización completa |
| **Execution Mode** | Manual | Automático (immediate para materials) |

### Features Habilitados

Para materiales elaborados, usamos `complexity="minimal"`:

```typescript
features: {
  showCostCalculation: true,   // ✅ Ver costos en tiempo real
  showInstructions: false,      // ❌ No necesario para materials
  showYieldConfig: false,       // ❌ Simplificado
  showQualityConfig: false,     // ❌ Simplificado
}
```

Esto muestra solo:
- ✅ BasicInfoSection
- ✅ OutputConfigSection
- ✅ InputsEditorSection
- ✅ CostSummarySection

---

## 🎨 UI Comparison

### Antes (RecipeBuilderClean)
```
┌─────────────────────────────────┐
│ Material: Pan Casero            │
├─────────────────────────────────┤
│ [Legacy form with mixed UI]     │
│                                  │
│ • No visual consistency         │
│ • Manual cost calculation       │
│ • Limited validation            │
└─────────────────────────────────┘
```

### Después (RecipeBuilder)
```
┌─────────────────────────────────────────────┐
│ ℹ️  Material Elaborado                      │
│ Los materiales elaborados requieren...      │
├─────────────────────────────────────────────┤
│ 📝 Información Básica                       │
│   Nombre: [Pan Casero            ]          │
│   Descripción: [                 ]          │
│   Categoría: [Panadería         ▼]          │
├─────────────────────────────────────────────┤
│ 📦 Configuración de Salida                  │
│   Item: Pan Casero (pre-filled)             │
│   Cantidad: [1.0]  Unidad: [unidad]         │
├─────────────────────────────────────────────┤
│ 🧪 Ingredientes / Componentes               │
│   ┌───────────┬─────┬──────┬───────┬───┐  │
│   │ Item      │ Qty │ Unit │ Yield │ ✕ │  │
│   ├───────────┼─────┼──────┼───────┼───┤  │
│   │ Harina    │ 500 │ g    │ 100%  │ ✕ │  │
│   │ Agua      │ 300 │ ml   │ 100%  │ ✕ │  │
│   │ Levadura  │ 10  │ g    │ 100%  │ ✕ │  │
│   └───────────┴─────┴──────┴───────┴───┘  │
│   [+ Agregar Ingrediente]                   │
├─────────────────────────────────────────────┤
│ 💰 Resumen de Costos                        │
│   Costo de Materiales: $12.50               │
│   Costo Total: $12.50                       │
│   Costo por Unidad: $12.50                  │
│                                              │
│   Desglose:                                  │
│   • Harina (500g): $5.00 (40%)              │
│   • Agua (300ml): $1.50 (12%)               │
│   • Levadura (10g): $6.00 (48%)             │
└─────────────────────────────────────────────┘
         [Cancelar]  [Crear Receta]
```

---

## 🔄 Execution Mode (Crítico)

### Material Elaborado = Immediate Execution

Cuando se guarda una receta de material elaborado:

```typescript
// 1. Recipe se guarda
const recipe = await createRecipe({
  entityType: 'material',
  executionMode: 'immediate',  // ← Auto-set por entityType
  // ...
})

// 2. Se ejecuta INMEDIATAMENTE
await executeRecipe(recipe.id, 1)

// 3. Resultado:
// - Stock de inputs se consume
// - Stock del material elaborado se genera
// - Material está listo para usar
```

### vs Product con BOM = On-Demand Execution

```typescript
// 1. Recipe se guarda
const recipe = await createRecipe({
  entityType: 'product',
  executionMode: 'on_demand',  // ← Auto-set
  // ...
})

// 2. NO se ejecuta al guardar
// 3. Se ejecuta cuando se VENDE el producto
// 4. En Sales module:
await executeRecipe(recipe.id, quantitySold)
```

---

## 🧪 Testing de Integración

### Test Manual

1. **Abrir MaterialForm**
   ```
   Navigate to: /admin/supply-chain/materials
   Click: "Nuevo Material"
   ```

2. **Configurar Material Elaborado**
   ```
   Nombre: "Pan Integral"
   Tipo: "ELABORATED"
   Unidad: "unidad"
   ```

3. **Crear Receta**
   ```
   Agregar ingredientes:
   - Harina Integral: 500g
   - Agua: 300ml
   - Levadura: 10g
   - Sal: 5g
   ```

4. **Verificar Costos**
   ```
   Debe mostrar:
   - Costo por ingrediente
   - Costo total
   - Costo por unidad
   ```

5. **Guardar Receta**
   ```
   Click: "Crear Receta"
   → recipe_id debe asignarse al formData
   → initial_stock debe actualizarse
   ```

6. **Guardar Material**
   ```
   Click: "Guardar Material"
   → Material se guarda con recipe_id
   → Recipe se ejecuta automáticamente
   → Stock se genera
   ```

### Test Automatizado (TODO)

```typescript
describe('Materials ↔ Recipe Integration', () => {
  it('should create elaborated material with recipe', async () => {
    // 1. Open material form
    const { getByText, getByLabelText } = render(<MaterialsPage />)
    fireEvent.click(getByText('Nuevo Material'))

    // 2. Select ELABORATED type
    fireEvent.change(getByLabelText('Tipo'), { target: { value: 'ELABORATED' }})

    // 3. Fill material info
    fireEvent.change(getByLabelText('Nombre'), { target: { value: 'Pan Integral' }})

    // 4. Add recipe ingredients
    fireEvent.click(getByText('Agregar Ingrediente'))
    // ... add ingredients

    // 5. Save recipe
    fireEvent.click(getByText('Crear Receta'))

    // 6. Verify recipe_id is set
    await waitFor(() => {
      expect(formData.recipe_id).toBeDefined()
    })

    // 7. Save material
    fireEvent.click(getByText('Guardar Material'))

    // 8. Verify material is created
    await waitFor(() => {
      expect(getByText('Pan Integral')).toBeInTheDocument()
    })
  })
})
```

---

## 📊 Performance Considerations

### Optimizations Applied

1. **useMemo for outputItem**
   ```typescript
   const outputItem = useMemo(() => ({
     id: formData.id || 'temp',
     name: formData.name,
     type: 'material' as const,
     unit: formData.unit || 'unit',
   }), [formData.id, formData.name, formData.unit])
   ```

2. **useCallback for handlers**
   ```typescript
   const handleRecipeSaved = useCallback((recipe: Recipe) => {
     setFormData({ ...formData, recipe_id: recipe.id })
   }, [formData, setFormData])
   ```

3. **React.memo on ElaboratedFields**
   ```typescript
   export const ElaboratedFields = memo(function ElaboratedFields({ ... })
   ```

4. **RecipeBuilder internal memoization**
   - Provider uses useMemo for context value
   - Sections use useCallback for handlers
   - Validation uses useMemo

---

## 🚀 Next Steps

### Immediate TODOs
- [ ] Test integración manual
- [ ] Verificar que recipe se ejecuta correctamente
- [ ] Verificar que stock se actualiza
- [ ] Verificar costos se calculan bien

### Future Enhancements
- [ ] Editar recipe de material existente
- [ ] Ver detalles de recipe desde material
- [ ] Copiar recipe de otro material
- [ ] Templates de recipes comunes

---

## 🔗 Referencias

- **RecipeBuilder**: `src/modules/recipe/components/RecipeBuilder/`
- **ElaboratedFields**: `src/pages/admin/supply-chain/materials/.../ElaboratedFields.tsx`
- **MaterialForm**: `src/pages/admin/supply-chain/materials/components/MaterialsManagement/`
- **Recipe Types**: `src/modules/recipe/types/`
- **Recipe Hooks**: `src/modules/recipe/hooks/`

---

**Status**: ✅ Integration Complete
**Reemplaza**: RecipeBuilderClean (legacy)
**Fecha**: 2025-12-24
