# ProductionConfigSection - Documentación de Uso

## 📋 Descripción

`ProductionConfigSection` es el componente que maneja la ejecución de producción para Materiales Elaborados, distinguiendo entre producción inmediata (con medición post-producción) y producción programada (scheduling).

**NO aplica a Productos/Servicios** - ellos usan BOM on-demand.

---

## 🎯 Características

### ✅ Para Materiales Elaborados
- Producción inmediata con medición post-producción
- Tracking de yield percentage (rendimiento)
- Registro de desperdicio (scrap) con motivos
- Programación de producción con frecuencias
- Validaciones automáticas

### ℹ️ Para Productos/Servicios
- Solo muestra información (BOM se ejecuta on-demand)
- No requiere configuración de producción

---

## 💻 Uso Básico

```tsx
import { ProductionConfigSection } from '@/modules/recipe/components'

function MaterialForm() {
  const [recipe, setRecipe] = useState<Partial<Recipe>>({
    // ... recipe data
  })

  return (
    <ProductionConfigSection
      entityType="material"
      recipe={recipe}
    />
  )
}
```

---

## 📐 Props

```typescript
interface ProductionConfigSectionProps {
  entityType: 'material' | 'product' | 'service'
  recipe: Partial<Recipe>
}
```

### `entityType`
- **Tipo**: `'material' | 'product' | 'service'`
- **Requerido**: Sí
- **Descripción**: Tipo de entidad. Solo `'material'` muestra el formulario completo.

### `recipe`
- **Tipo**: `Partial<Recipe>`
- **Requerido**: Sí
- **Descripción**: Datos de la receta actual.

---

## 🎨 UI/UX

### Vista: Material Elaborado

```
┌──────────────────────────────────────────────────┐
│ EJECUCIÓN DE PRODUCCIÓN                          │
├──────────────────────────────────────────────────┤
│                                                  │
│ [✓] Producir ahora                               │
│                                                  │
│ ┌─ MEDICIÓN POST-PRODUCCIÓN ───────────────────┐│
│ │ Cantidad Esperada:  1.0 kg (read-only)      ││
│ │ Cantidad Obtenida:  [0.95] kg ⚠️ Yield: 95% ││
│ │ Desperdicio (Scrap): [0.05] kg               ││
│ │ Motivo: [Merma normal ▼]                     ││
│ │ Notas: [_________________________]           ││
│ └──────────────────────────────────────────────┘│
│                                                  │
│ [ ] Programar producción                         │
└──────────────────────────────────────────────────┘
```

### Vista: Producto/Servicio

```
┌──────────────────────────────────────────────────┐
│ ℹ️ INFORMACIÓN DE BOM                            │
│                                                  │
│ Esta receta se ejecuta automáticamente:          │
│ • Producto: Al momento de cada venta             │
│ • Servicio: Al ejecutar el servicio              │
│                                                  │
│ Los ingredientes se consumen en cada ejecución.  │
└──────────────────────────────────────────────────┘
```

---

## 🔄 Flujos de Trabajo

### Flujo 1: Producir Ahora

1. Usuario marca checkbox "Producir ahora"
2. Sistema muestra formulario de medición post-producción
3. Usuario completa:
   - Cantidad obtenida (requerido)
   - Desperdicio (opcional)
   - Motivo de desperdicio (requerido si hay desperdicio)
   - Notas (opcional)
4. Sistema calcula automáticamente yield percentage
5. Al guardar:
   - Se crea registro en `production_batches`
   - Se emite evento `production.immediate.requested`
   - Módulo de inventario consume ingredientes
   - Módulo de inventario genera stock del material

### Flujo 2: Programar Producción

1. Usuario marca checkbox "Programar producción"
2. Sistema muestra formulario de scheduling
3. Usuario completa:
   - Fecha/Hora (requerido, debe ser futuro)
   - Frecuencia (requerido)
4. Sistema muestra próxima ejecución calculada
5. Al guardar:
   - Se crea registro en `production_batches` con status='scheduled'
   - Se emite evento `production.scheduled`
   - Scheduler module crea job recurrente

---

## ✅ Validaciones

### Producción Inmediata
- ✅ `actualQuantity` es requerido y > 0
- ✅ `scrapReason` es requerido si `scrapQuantity > 0`
- ✅ `actualQuantity + scrapQuantity` no puede ser > `expectedQuantity * 1.5`

### Producción Programada
- ✅ `scheduledAt` es requerido y debe ser fecha futura
- ✅ `frequency` es requerido

### Mutual Exclusion
- ✅ No se puede marcar "Producir ahora" y "Programar" simultáneamente

---

## 🔌 Integración con Módulos

### EventBus Events

#### `production.immediate.requested`
```typescript
{
  batchId: string
  recipeId: string
  expectedQuantity: number
  actualQuantity: number
  scrapQuantity: number
  scrapReason?: string
  notes?: string
  yieldPercentage: number
}
```

#### `production.scheduled`
```typescript
{
  batchId: string
  recipeId: string
  scheduledAt: string  // ISO string
  frequency: 'once' | 'daily' | 'weekly' | 'monthly'
  expectedQuantity: number
}
```

### Inventory Module
Debe escuchar estos eventos para:
- Consumir ingredientes
- Generar stock del material producido

### Scheduling Module
Debe escuchar `production.scheduled` para:
- Crear jobs recurrentes
- Ejecutar producción en fecha programada

---

## 🗄️ Base de Datos

### Tabla: `production_batches`

```sql
CREATE TABLE production_batches (
  id UUID PRIMARY KEY,
  recipe_id UUID NOT NULL,
  material_id UUID,
  scheduled_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  status VARCHAR(20),  -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  expected_quantity DECIMAL(10,3),
  actual_quantity DECIMAL(10,3),
  scrap_quantity DECIMAL(10,3),
  yield_percentage DECIMAL(5,2),
  scrap_reason VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by UUID
);
```

---

## 📊 Yield Percentage

El yield percentage se calcula automáticamente:

```typescript
yieldPercentage = (actualQuantity / expectedQuantity) * 100
```

### Códigos de Color
- 🟢 **Verde** (>= 95%): Excelente rendimiento
- 🟡 **Amarillo** (85-94%): Rendimiento aceptable
- 🔴 **Rojo** (< 85%): Rendimiento bajo, requiere atención

---

## 🔍 Ejemplo Completo

```tsx
import React, { useState } from 'react'
import {
  ProductionConfigSection,
  useProductionConfig
} from '@/modules/recipe'
import { Button, Stack } from '@/shared/ui'

function MaterialRecipeForm() {
  const [recipe, setRecipe] = useState<Partial<Recipe>>({
    id: 'recipe-123',
    name: 'Pan Casero',
    entityType: 'material',
    executionMode: 'immediate',
    output: {
      quantity: 1.0,
      unit: 'kg'
    },
    inputs: [
      // ... ingredientes
    ]
  })

  const updateRecipe = (updates: Partial<Recipe>) => {
    setRecipe(prev => ({ ...prev, ...updates }))
  }

  const {
    executeProduction,
    vali{
    executeProduction,
    validateConfig,
    isSubmitting
  } = useProductionConfig({
    recipe,
    entityType: 'material'
  })

  const handleSave = async () => {
    if (!validateConfig()) {
      return
    }

    // 1. Guardar receta
    await saveRecipe(recipe)

    // 2. Ejecutar producción (si se marcó "Producir ahora")
    const success = await executeProduction()

    if (success) {
      // 3. Guardar material
      await saveMaterial({ recipe_id: recipe.id })
    }
  }

  return (
    <Stack gap="6">
      {/* ... otros campos del formulario ... */}

      <ProductionConfigSection
        entityType="material"
        recipe={r
        {isSubmitting ? 'Guardando...' : 'Guardar Material'}
      </Button>
    </Stack>
  )
}
```

---

## 🧪 Testing

### Unit Tests
```typescript
describe('ProductionConfigSection', () => {
  it('should show production form for materials', () => {
    // Test material view
  })

  it('should show info message for products', () => {
    // Test product view
  })

  it('should validate mutual exclusion', () => {
    // Test que no se pueda marcar ambos checkboxes
  })

  it('should calculate yield percentage', () => {
    // Test cálculo de yield
  })
})
```

### Integration Tests
```typescript
describe('ProductionConfigSection integration', () => {
  it('should create production batch on immediate execution', async () => {
    // Test creación de batch
  })

  it('should emit EventBus events', async () => {
    // Test emisión de eventos
  })
})
```

---

## 📝 Notas de Implementación

1. **Componente usa sistema de UI**: Todos los componentes son de `@/shared/ui`
2. **EventBus para comunicación**: Cross-module communication via EventBus
3. **Logger en lugar de console**: Usa `logger.*` para logging
4. **Supabase + RLS**: API usa Supabase con Row Level Security
5. **Decimal.js para precisión**: Cantidades usan Decimal.js internamente
6. **Validaciones client-side**: Validación en tiempo real con feedback visual

---

## 🔗 Referencias

- [Diseño Original](./PRODUCTION_CONFIG_SECTION_DESIGN.md)
- [Recipe Module README](../README.md)
- [EventBus Documentation](../../../lib/events/README.md)
- [UI System](../../../shared/ui/README.md)

---

**Última actualización**: 2026-01-07  
**Versión**: 1.0  
**Estado**: ✅ Implementado
