# RecipeBuilder Component

Componente unificado para crear y editar recetas en G-Admin Mini.

## Características

- ✅ Configuración mediante props (complexity + features)
- ✅ Validación en tiempo real
- ✅ Cálculo de costos automático
- ✅ Soporte para diferentes entity types
- ✅ Context API para state compartido
- ✅ Secciones modulares

## Uso

### Crear una receta (Material Elaborado)

```typescript
import { RecipeBuilder } from '@/modules/recipe/components'

function MaterialForm() {
  return (
    <RecipeBuilder
      mode="create"
      entityType="material"
      complexity="minimal"
      features={{
        showCostCalculation: true,
        showInstructions: false,
      }}
      outputItem={selectedMaterial}
      onSave={(recipe) => {
        console.log('Recipe created:', recipe)
      }}
      onCancel={() => {
        console.log('Cancelled')
      }}
    />
  )
}
```

### Editar una receta (Producto)

```typescript
<RecipeBuilder
  mode="edit"
  recipeId={recipe.id}
  entityType="product"
  complexity="standard"
  features={{
    showCostCalculation: true,
    showInstructions: true,
    showYieldConfig: true,
  }}
  initialData={recipe}
  onSave={(updatedRecipe) => {
    console.log('Recipe updated:', updatedRecipe)
  }}
/>
```

### Modo avanzado (con todas las features)

```typescript
<RecipeBuilder
  mode="create"
  entityType="product"
  complexity="advanced"
  features={{
    showCostCalculation: true,
    showAnalytics: true,
    showInstructions: true,
    showYieldConfig: true,
    showQualityConfig: true,
    allowSubstitutions: true,
    enableAiSuggestions: true,
  }}
  onSave={(recipe) => {
    console.log('Recipe created:', recipe)
  }}
/>
```

## Props

### RecipeBuilderProps

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `mode` | `'create' \| 'edit'` | ✅ | Modo del builder |
| `entityType` | `'material' \| 'product' \| 'kit' \| 'service'` | ✅ | Tipo de entidad |
| `complexity` | `'minimal' \| 'standard' \| 'advanced'` | ❌ | Complejidad de UI (default: 'standard') |
| `features` | `RecipeBuilderFeatures` | ❌ | Features opcionales |
| `initialData` | `Partial<Recipe>` | ❌ | Datos iniciales (para modo edit) |
| `recipeId` | `string` | ❌ | ID de receta (para modo edit) |
| `outputItem` | `RecipeItem` | ❌ | Item de salida pre-seleccionado |
| `outputQuantity` | `number` | ❌ | Cantidad de salida pre-filled |
| `onSave` | `(recipe: Recipe) => void \| Promise<void>` | ❌ | Callback al guardar |
| `onCancel` | `() => void` | ❌ | Callback al cancelar |
| `onChange` | `(recipe: Partial<Recipe>) => void` | ❌ | Callback en cada cambio |
| `validateOnChange` | `boolean` | ❌ | Validar en cada cambio |
| `customValidation` | `(recipe: Partial<Recipe>) => ValidationResult` | ❌ | Validación personalizada |

### RecipeBuilderFeatures

| Feature | Descripción | Default |
|---------|-------------|---------|
| `showCostCalculation` | Mostrar cálculo de costos | `true` |
| `showAnalytics` | Mostrar analytics avanzados | `false` |
| `showInstructions` | Mostrar sección de instrucciones | `true` |
| `showYieldConfig` | Configurar yield/waste | `true` |
| `showQualityConfig` | Configurar quality grade | `false` |
| `allowSubstitutions` | Permitir sustituciones de inputs | `false` |
| `enableAiSuggestions` | Habilitar sugerencias AI | `false` |

## Complejidad

### Minimal
- Solo campos básicos
- Ideal para materials elaborados
- Sin instrucciones
- Cost calculation opcional

### Standard (Default)
- Campos completos
- Instrucciones incluidas
- Cost calculation por defecto
- Yield configuration

### Advanced
- Todas las features disponibles
- Analytics
- AI suggestions
- Quality configuration
- Substitutions

## Secciones

### 1. BasicInfoSection
- ✅ Nombre
- ✅ Descripción
- ✅ Categoría

### 2. OutputConfigSection
- ✅ Item de salida
- ✅ Cantidad
- ✅ Unidad
- ✅ Yield % (condicional)
- ✅ Waste % (condicional)
- ✅ Quality grade (condicional)

### 3. InputsEditorSection
- ✅ Lista de ingredientes
- ✅ Agregar/Editar/Eliminar
- ✅ Cantidades y unidades
- ✅ Yield/Waste por input

### 4. CostSummarySection
- ✅ Cálculo automático
- ✅ Desglose por ingrediente
- ✅ Costos de labor y overhead
- ✅ Yield analysis
- ✅ Profitability metrics

### 5. InstructionsSection (TODO)
- Pasos de preparación
- Tiempos
- Equipamiento

### 6. AdvancedOptionsSection (TODO)
- Tags
- Difficulty level
- AI suggestions

## Context API

El RecipeBuilder usa Context API para state compartido:

```typescript
import { useRecipeBuilderContext } from '@/modules/recipe/components/RecipeBuilder'

function CustomSection() {
  const {
    recipe,
    updateRecipe,
    validation,
    isSubmitting,
    saveRecipe,
  } = useRecipeBuilderContext()

  return (
    <div>
      <h3>{recipe.name}</h3>
      <button onClick={saveRecipe}>Save</button>
    </div>
  )
}
```

## Validación

El builder valida automáticamente según el `entityType`:

- **Material**: Solo acepta materials como inputs
- **Product**: Acepta materials + products
- **Kit**: Solo acepta products
- **Service**: Acepta materials + assets

## Costos

El cálculo de costos se hace automáticamente cuando:
- Hay inputs configurados
- Hay output configurado
- `showCostCalculation` está habilitado

El cálculo usa `RecipeCostEngine` con precisión decimal.

## Estado del Componente

| Feature | Estado |
|---------|--------|
| Basic Info | ✅ Implementado |
| Output Config | ✅ Implementado |
| Inputs Editor | ✅ Implementado |
| Cost Summary | ✅ Implementado |
| Instructions | ⏳ TODO |
| Advanced Options | ⏳ TODO |
| Item Selector Modal | ⏳ TODO |
| Substitutions | ⏳ TODO |
| AI Suggestions | ⏳ TODO |

## Próximas Mejoras

1. **Item Selector Modal** - Selector visual de materials/products
2. **Instructions Section** - Editor de pasos
3. **Advanced Options** - Tags, difficulty, etc.
4. **Substitutions UI** - Configurar sustituciones
5. **AI Suggestions** - Sugerencias automáticas
6. **Drag & Drop** - Reordenar inputs
7. **Bulk Import** - Importar múltiples inputs
8. **Templates** - Plantillas de recetas

## Reemplaza a

Este componente unificado reemplaza a:
- ❌ `RecipeForm.tsx` (legacy)
- ❌ `RecipeFormClean.tsx` (legacy)
- ❌ `RecipeBuilderLite.tsx` (legacy)
- ❌ `RecipeBuilderClean.tsx` (legacy)
