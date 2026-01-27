# GUÍA DE IMPLEMENTACIÓN: RECIPE SYSTEM

> **Guía paso a paso** para implementar el Recipe System siguiendo convenciones de G-Admin Mini

---

## 🎯 Objetivo

Implementar el Recipe System como módulo formal en `/src/modules/recipe/` con:
- Componentes del design system de ChakraUI v3
- Patrones de Materials y Dashboard
- Performance optimizado con memoización
- Testing completo

---

## 📦 COMPONENTES DEL DESIGN SYSTEM A USAR

### Componentes Base (de `@/shared/ui`)

```typescript
import {
  // Layout
  Box,
  Stack,
  Flex,
  SimpleGrid,

  // Forms
  Input,
  SelectField,
  Textarea,
  Switch,

  // Interactive
  Button,
  IconButton,

  // Feedback
  Alert,
  Progress,
  Badge,

  // Typography
  Typography,

  // Dialogs
  Dialog,

  // Icons
  Icon
} from '@/shared/ui';

// Card wrapper (patrón de Dashboard)
import { CardWrapper } from '@/shared/ui/CardWrapper';

// Iconos
import {
  BeakerIcon,
  PlusIcon,
  TrashIcon,
  // ... otros
} from '@heroicons/react/24/outline';
```

### Componentes Personalizados a Crear

Siguiendo el patrón de Materials:

```typescript
// Wrappers de sección
<SectionCard title="Información Básica" icon={InfoIcon}>
  {/* contenido */}
</SectionCard>

// Campos validados
<ValidatedField
  label="Nombre de Receta"
  error={fieldErrors.name}
  warning={fieldWarnings.name}
  required
>
  <Input value={name} onChange={handleChange} />
</ValidatedField>

// Items de lista
<RecipeInputItem
  input={ingredient}
  onUpdate={handleUpdate}
  onRemove={handleRemove}
/>
```

---

## 🏗️ ESTRUCTURA DE IMPLEMENTACIÓN

### Fase 1: Setup Inicial

#### 1.1 Crear estructura de módulo

```bash
mkdir -p src/modules/recipe/{types,hooks,services,components,widgets,pages,__tests__}
```

```
src/modules/recipe/
├── manifest.tsx                # ✅ Crear primero
├── types/
│   ├── index.ts               # ✅ Exports públicos
│   ├── recipe.ts              # ✅ Core types
│   ├── costing.ts             # ✅ Cost types
│   ├── analytics.ts           # ⏳ Más adelante
│   └── execution.ts           # ⏳ Más adelante
├── hooks/
│   └── index.ts               # ⏳ Fase 2
├── services/
│   └── index.ts               # ⏳ Fase 2
├── components/
│   └── index.ts               # ⏳ Fase 3
└── __tests__/
    └── setup.test.ts          # ✅ Setup de testing
```

#### 1.2 Definir tipos core (recipe.ts)

**⚠️ CRÍTICO: Diferencia Material vs Product**

```typescript
// src/modules/recipe/types/recipe.ts

/**
 * Recipe: Composición de recursos
 *
 * IMPORTANTE - Consumo de stock:
 * - Material Elaborado: Se ejecuta al crear → consume stock inmediatamente
 * - Producto con BOM: NO se ejecuta al crear → consume stock al vender
 */
export interface Recipe<TInput = RecipeItem, TOutput = RecipeItem> {
  id: string
  name: string
  description?: string

  // Output
  output: RecipeOutput<TOutput>

  // Inputs
  inputs: RecipeInput<TInput>[]

  // Metadata
  category?: RecipeCategory
  entityType: 'material' | 'product' | 'kit' | 'service'  // 🔑 CRÍTICO

  // Execution behavior
  executionMode: 'immediate' | 'on_demand'  // 🔑 NUEVO
  // - immediate: Para materials (ejecutar al crear)
  // - on_demand: Para products (ejecutar al vender)

  // ... resto de campos
}

export interface RecipeOutput<T = RecipeItem> {
  item: T | string
  quantity: number
  unit: string
  yieldPercentage?: number
  wastePercentage?: number
}

export interface RecipeInput<T = RecipeItem> {
  id: string
  item: T | string
  quantity: number
  unit: string
  optional?: boolean

  // Yield (desperdicio)
  yieldPercentage?: number
  wastePercentage?: number

  // Stage (para multi-paso)
  stage?: number
  stageName?: string
}

export interface RecipeItem {
  id: string
  name: string
  type: 'material' | 'product' | 'asset' | 'service'
  unit?: string
  currentStock?: number
  unitCost?: number
}

export enum RecipeCategory {
  // Gastronomía
  APPETIZER = 'appetizer',
  MAIN_COURSE = 'main_course',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',

  // Producción
  ASSEMBLY = 'assembly',
  MANUFACTURING = 'manufacturing',

  // Servicios
  PROCEDURE = 'procedure',

  // Otros
  KIT = 'kit',
  OTHER = 'other'
}
```

**Validaciones por entityType**:

```typescript
// src/modules/recipe/services/recipeValidation.ts

export function validateRecipeInputs(
  recipe: Partial<Recipe>
): ValidationResult {
  const errors: string[] = []

  // Validación según entityType
  switch (recipe.entityType) {
    case 'material':
      // Materials elaborados solo pueden usar materials como inputs
      recipe.inputs?.forEach(input => {
        if (input.item.type !== 'material') {
          errors.push(`Material elaborado solo puede usar materials. "${input.item.name}" es ${input.item.type}`)
        }
      })
      // Debe ejecutarse inmediatamente
      if (recipe.executionMode !== 'immediate') {
        errors.push('Material elaborado debe tener executionMode="immediate"')
      }
      break

    case 'product':
      // Products pueden usar materials y products
      recipe.inputs?.forEach(input => {
        if (!['material', 'product'].includes(input.item.type)) {
          errors.push(`Producto solo puede usar materials o products como inputs`)
        }
      })
      // Se ejecuta on-demand (al vender)
      if (recipe.executionMode !== 'on_demand') {
        errors.push('Producto debe tener executionMode="on_demand"')
      }
      break

    case 'kit':
      // Kits solo usan products
      recipe.inputs?.forEach(input => {
        if (input.item.type !== 'product') {
          errors.push(`Kit solo puede usar productos. "${input.item.name}" es ${input.item.type}`)
        }
      })
      break

    case 'service':
      // Services pueden usar materials y assets
      recipe.inputs?.forEach(input => {
        if (!['material', 'asset'].includes(input.item.type)) {
          errors.push(`Servicio solo puede usar materials o assets`)
        }
      })
      break
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  }
}
```

---

## 🧩 COMPONENTE RECIPEBUILDER - IMPLEMENTACIÓN DETALLADA

### Estructura del Componente

```
RecipeBuilder/
├── RecipeBuilder.tsx          # Main component
├── RecipeBuilderProvider.tsx  # Context provider
├── types.ts                   # Props & types
├── sections/
│   ├── BasicInfoSection.tsx
│   ├── InputsEditorSection.tsx
│   ├── OutputConfigSection.tsx
│   ├── CostSummarySection.tsx
│   └── AdvancedOptionsSection.tsx
├── components/
│   ├── SectionCard.tsx        # Wrapper de sección
│   ├── ValidatedField.tsx     # Campo con validación
│   ├── InputItemRow.tsx       # Row de ingrediente
│   └── CostBreakdown.tsx      # Breakdown de costos
└── hooks/
    ├── useRecipeBuilderState.ts
    └── useRecipeValidation.ts
```

### RecipeBuilder.tsx (Main Component)

```typescript
// src/modules/recipe/components/RecipeBuilder/RecipeBuilder.tsx

import { useMemo, useCallback } from 'react'
import { Box, Stack, Button, Alert, Progress } from '@/shared/ui'
import { RecipeBuilderProvider, useRecipeBuilderContext } from './RecipeBuilderProvider'
import { BasicInfoSection } from './sections/BasicInfoSection'
import { InputsEditorSection } from './sections/InputsEditorSection'
import { OutputConfigSection } from './sections/OutputConfigSection'
import { CostSummarySection } from './sections/CostSummarySection'
import { AdvancedOptionsSection } from './sections/AdvancedOptionsSection'
import type { RecipeBuilderProps } from './types'

/**
 * RecipeBuilder - Componente unificado para crear/editar recetas
 *
 * Reemplaza a:
 * - RecipeForm
 * - RecipeFormClean
 * - RecipeBuilderLite
 * - RecipeBuilderClean
 */
export function RecipeBuilder(props: RecipeBuilderProps) {
  return (
    <RecipeBuilderProvider initialData={props.initialData}>
      <RecipeBuilderContent {...props} />
    </RecipeBuilderProvider>
  )
}

function RecipeBuilderContent(props: RecipeBuilderProps) {
  const {
    mode,
    entityType,
    complexity = 'standard',
    features = {},
    outputItem,
    onSave,
    onCancel
  } = props

  const {
    recipe,
    updateRecipe,
    validation,
    isSubmitting,
    saveRecipe
  } = useRecipeBuilderContext()

  // ⚡ PERFORMANCE: Memoize save handler
  const handleSave = useCallback(async () => {
    const savedRecipe = await saveRecipe()
    if (savedRecipe) {
      onSave?.(savedRecipe)
    }
  }, [saveRecipe, onSave])

  // ⚡ PERFORMANCE: Memoize sections rendering
  const sections = useMemo(() => {
    const showCostCalculation = features.showCostCalculation ?? true
    const showInstructions = features.showInstructions ?? (complexity !== 'minimal')
    const showAdvanced = complexity === 'advanced'

    return {
      basicInfo: true,  // Siempre visible
      output: true,
      inputs: true,
      costs: showCostCalculation,
      instructions: showInstructions,
      advanced: showAdvanced
    }
  }, [complexity, features])

  return (
    <Stack gap="6" w="full">
      {/* Progress bar (si está guardando) */}
      {isSubmitting && (
        <Progress.Root value={null} colorPalette="blue">
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      )}

      {/* Validation errors/warnings */}
      {validation.errors.length > 0 && (
        <Alert.Root status="error" variant="subtle">
          <Alert.Icon />
          <Alert.Content>
            <Alert.Title>Errores de validación</Alert.Title>
            <Alert.Description>
              <Stack gap="1">
                {validation.errors.map((error, i) => (
                  <Typography key={i} variant="body" size="sm">{error}</Typography>
                ))}
              </Stack>
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* SECCIÓN 1: Basic Info (siempre visible) */}
      <BasicInfoSection
        name={recipe.name}
        description={recipe.description}
        category={recipe.category}
        entityType={entityType}
        onChange={updateRecipe}
      />

      {/* SECCIÓN 2: Output Config */}
      {sections.output && (
        <OutputConfigSection
          output={recipe.output}
          entityType={entityType}
          preselectedItem={outputItem}
          onChange={(output) => updateRecipe({ output })}
        />
      )}

      {/* SECCIÓN 3: Inputs Editor (ingredientes) */}
      {sections.inputs && (
        <InputsEditorSection
          inputs={recipe.inputs}
          entityType={entityType}
          allowSubstitutions={features.allowSubstitutions}
          onChange={(inputs) => updateRecipe({ inputs })}
        />
      )}

      {/* SECCIÓN 4: Cost Summary (condicional) */}
      {sections.costs && recipe.inputs.length > 0 && (
        <CostSummarySection
          recipeId={recipe.id}
          inputs={recipe.inputs}
          output={recipe.output}
        />
      )}

      {/* SECCIÓN 5: Advanced Options (solo en advanced) */}
      {sections.advanced && (
        <AdvancedOptionsSection
          recipe={recipe}
          features={features}
          onChange={updateRecipe}
        />
      )}

      {/* Actions */}
      <Flex gap="3" justify="flex-end">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          colorPalette="blue"
          onClick={handleSave}
          loading={isSubmitting}
          disabled={!validation.isValid}
        >
          {mode === 'create' ? 'Crear Receta' : 'Guardar Cambios'}
        </Button>
      </Flex>
    </Stack>
  )
}
```

### RecipeBuilderProvider.tsx (Context)

```typescript
// src/modules/recipe/components/RecipeBuilder/RecipeBuilderProvider.tsx

import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { useRecipeValidation } from './hooks/useRecipeValidation'
import { recipeApi } from '../../services/recipeApi'
import type { Recipe } from '../../types'

interface RecipeBuilderContextValue {
  recipe: Partial<Recipe>
  updateRecipe: (updates: Partial<Recipe>) => void
  validation: ValidationResult
  isSubmitting: boolean
  saveRecipe: () => Promise<Recipe | null>
}

const RecipeBuilderContext = createContext<RecipeBuilderContextValue | null>(null)

export function useRecipeBuilderContext() {
  const context = useContext(RecipeBuilderContext)
  if (!context) {
    throw new Error('useRecipeBuilderContext must be used within RecipeBuilderProvider')
  }
  return context
}

export function RecipeBuilderProvider({
  children,
  initialData
}: {
  children: React.ReactNode
  initialData?: Partial<Recipe>
}) {
  const [recipe, setRecipe] = useState<Partial<Recipe>>(
    initialData ?? {
      name: '',
      description: '',
      inputs: [],
      output: { quantity: 1, unit: 'unit' }
    }
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validación reactiva
  const validation = useRecipeValidation(recipe)

  // ⚡ PERFORMANCE: Memoize update function
  const updateRecipe = useCallback((updates: Partial<Recipe>) => {
    setRecipe(prev => ({ ...prev, ...updates }))
  }, [])

  // Save handler
  const saveRecipe = useCallback(async () => {
    if (!validation.isValid) {
      return null
    }

    setIsSubmitting(true)
    try {
      let savedRecipe: Recipe

      if (recipe.id) {
        // Update existing
        savedRecipe = await recipeApi.updateRecipe(recipe.id, recipe)
      } else {
        // Create new
        savedRecipe = await recipeApi.createRecipe(recipe)
      }

      // 🔑 CRÍTICO: Si es material con executionMode=immediate, ejecutar
      if (savedRecipe.executionMode === 'immediate') {
        await recipeApi.executeRecipe(savedRecipe.id, 1)
      }

      return savedRecipe
    } catch (error) {
      console.error('Error saving recipe:', error)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [recipe, validation.isValid])

  const value = useMemo(
    () => ({
      recipe,
      updateRecipe,
      validation,
      isSubmitting,
      saveRecipe
    }),
    [recipe, updateRecipe, validation, isSubmitting, saveRecipe]
  )

  return (
    <RecipeBuilderContext.Provider value={value}>
      {children}
    </RecipeBuilderContext.Provider>
  )
}
```

### BasicInfoSection.tsx

```typescript
// src/modules/recipe/components/RecipeBuilder/sections/BasicInfoSection.tsx

import { Stack, Input, Textarea, SelectField } from '@/shared/ui'
import { SectionCard } from '../components/SectionCard'
import { ValidatedField } from '../components/ValidatedField'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { RecipeCategory } from '../../../types'

interface BasicInfoSectionProps {
  name: string
  description?: string
  category?: RecipeCategory
  entityType: 'material' | 'product' | 'kit' | 'service'
  onChange: (updates: Partial<Recipe>) => void
}

export function BasicInfoSection(props: BasicInfoSectionProps) {
  const { name, description, category, entityType, onChange } = props

  // Categorías filtradas según entityType
  const availableCategories = getAvailableCategories(entityType)

  return (
    <SectionCard title="Información Básica" icon={InformationCircleIcon}>
      <Stack gap="4">
        {/* Nombre */}
        <ValidatedField
          label="Nombre de la Receta"
          required
          helperText="Nombre descriptivo que identifica esta receta"
        >
          <Input
            placeholder="Ej: Hamburguesa Clásica"
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </ValidatedField>

        {/* Descripción */}
        <ValidatedField
          label="Descripción"
          helperText="Breve descripción de la receta"
        >
          <Textarea
            placeholder="Describe esta receta..."
            value={description ?? ''}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={3}
          />
        </ValidatedField>

        {/* Categoría */}
        <ValidatedField label="Categoría">
          <SelectField
            placeholder="Selecciona una categoría"
            value={category}
            onChange={(e) => onChange({ category: e.target.value as RecipeCategory })}
          >
            {availableCategories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </SelectField>
        </ValidatedField>
      </Stack>
    </SectionCard>
  )
}

function getAvailableCategories(entityType: string) {
  const allCategories = [
    { value: RecipeCategory.APPETIZER, label: 'Entrada' },
    { value: RecipeCategory.MAIN_COURSE, label: 'Plato Principal' },
    { value: RecipeCategory.DESSERT, label: 'Postre' },
    { value: RecipeCategory.BEVERAGE, label: 'Bebida' },
    { value: RecipeCategory.ASSEMBLY, label: 'Ensamblaje' },
    { value: RecipeCategory.MANUFACTURING, label: 'Manufactura' },
    { value: RecipeCategory.KIT, label: 'Kit' },
    { value: RecipeCategory.PROCEDURE, label: 'Procedimiento' },
    { value: RecipeCategory.OTHER, label: 'Otro' }
  ]

  // Filtrar según entityType
  if (entityType === 'material' || entityType === 'product') {
    return allCategories.filter(c =>
      [RecipeCategory.APPETIZER, RecipeCategory.MAIN_COURSE, RecipeCategory.DESSERT, RecipeCategory.BEVERAGE, RecipeCategory.ASSEMBLY, RecipeCategory.OTHER].includes(c.value)
    )
  } else if (entityType === 'kit') {
    return allCategories.filter(c => c.value === RecipeCategory.KIT || c.value === RecipeCategory.OTHER)
  } else if (entityType === 'service') {
    return allCategories.filter(c => c.value === RecipeCategory.PROCEDURE || c.value === RecipeCategory.OTHER)
  }

  return allCategories
}
```

### InputsEditorSection.tsx

```typescript
// src/modules/recipe/components/RecipeBuilder/sections/InputsEditorSection.tsx

import { useState, useCallback } from 'react'
import { Stack, Button, Alert, SimpleGrid } from '@/shared/ui'
import { SectionCard } from '../components/SectionCard'
import { InputItemRow } from '../components/InputItemRow'
import { InputSelectorModal } from '../components/InputSelectorModal'
import { PlusIcon, CubeIcon } from '@heroicons/react/24/outline'
import type { RecipeInput, RecipeItem } from '../../../types'

interface InputsEditorSectionProps {
  inputs: RecipeInput[]
  entityType: 'material' | 'product' | 'kit' | 'service'
  allowSubstitutions?: boolean
  onChange: (inputs: RecipeInput[]) => void
}

export function InputsEditorSection(props: InputsEditorSectionProps) {
  const { inputs, entityType, allowSubstitutions, onChange } = props
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)

  // ⚡ PERFORMANCE: Memoize handlers
  const handleAddInput = useCallback((item: RecipeItem) => {
    const newInput: RecipeInput = {
      id: `input_${Date.now()}`,
      item,
      quantity: 1,
      unit: item.unit ?? 'unit',
      yieldPercentage: 100,
      wastePercentage: 0
    }
    onChange([...inputs, newInput])
    setIsSelectorOpen(false)
  }, [inputs, onChange])

  const handleUpdateInput = useCallback((index: number, updates: Partial<RecipeInput>) => {
    const updated = [...inputs]
    updated[index] = { ...updated[index], ...updates }
    onChange(updated)
  }, [inputs, onChange])

  const handleRemoveInput = useCallback((index: number) => {
    onChange(inputs.filter((_, i) => i !== index))
  }, [inputs, onChange])

  return (
    <SectionCard
      title="Ingredientes / Componentes"
      icon={CubeIcon}
      action={
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsSelectorOpen(true)}
        >
          <PlusIcon className="w-4 h-4" />
          Agregar
        </Button>
      }
    >
      <Stack gap="3">
        {inputs.length === 0 ? (
          <Alert.Root status="info" variant="subtle">
            <Alert.Icon />
            <Alert.Content>
              <Alert.Description>
                No hay ingredientes agregados. Haz clic en "Agregar" para comenzar.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        ) : (
          <Stack gap="2">
            {inputs.map((input, index) => (
              <InputItemRow
                key={input.id}
                input={input}
                index={index}
                allowSubstitutions={allowSubstitutions}
                onUpdate={(updates) => handleUpdateInput(index, updates)}
                onRemove={() => handleRemoveInput(index)}
              />
            ))}
          </Stack>
        )}
      </Stack>

      {/* Selector modal */}
      <InputSelectorModal
        isOpen={isSelectorOpen}
        entityType={entityType}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={handleAddInput}
      />
    </SectionCard>
  )
}
```

### CostSummarySection.tsx

```typescript
// src/modules/recipe/components/RecipeBuilder/sections/CostSummarySection.tsx

import { useEffect, useState } from 'react'
import { Stack, SimpleGrid, Box, Typography, Badge, Progress } from '@/shared/ui'
import { SectionCard } from '../components/SectionCard'
import { CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { useRecipeCosts } from '../../../hooks/useRecipeCosts'
import type { RecipeInput, RecipeOutput } from '../../../types'

interface CostSummarySectionProps {
  recipeId?: string
  inputs: RecipeInput[]
  output: RecipeOutput
}

export function CostSummarySection(props: CostSummarySectionProps) {
  const { recipeId, inputs, output } = props

  // Hook para calcular costos
  const { calculateCost, isCalculating } = useRecipeCosts()
  const [costs, setCosts] = useState<RecipeCostResult | null>(null)

  useEffect(() => {
    // Recalcular cuando cambien inputs
    if (inputs.length > 0) {
      calculateCost({ inputs, output }).then(setCosts)
    }
  }, [inputs, output, calculateCost])

  if (isCalculating) {
    return (
      <SectionCard title="Resumen de Costos" icon={CurrencyDollarIcon}>
        <Progress.Root value={null} colorPalette="blue">
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </SectionCard>
    )
  }

  if (!costs) return null

  return (
    <SectionCard title="Resumen de Costos" icon={CurrencyDollarIcon}>
      <Stack gap="4">
        {/* Costos principales */}
        <SimpleGrid columns={3} gap="4">
          <CostCard
            label="Costo de Materiales"
            value={costs.materialsCost}
            color="blue"
          />
          <CostCard
            label="Costo Total"
            value={costs.totalCost}
            color="purple"
          />
          <CostCard
            label="Costo por Unidad"
            value={costs.costPerUnit}
            color="green"
          />
        </SimpleGrid>

        {/* Breakdown de inputs */}
        <Box>
          <Typography variant="body" size="sm" weight="medium" mb="2">
            Desglose por Ingrediente
          </Typography>
          <Stack gap="1">
            {costs.inputsBreakdown.map(input => (
              <Flex key={input.inputId} justify="space-between" p="2" bg="gray.50" borderRadius="md">
                <Typography variant="body" size="sm">
                  {input.itemName} ({input.quantity} {input.unit})
                </Typography>
                <Flex gap="2" align="center">
                  <Typography variant="body" size="sm" weight="medium">
                    ${input.totalCost.toFixed(2)}
                  </Typography>
                  <Badge size="sm" variant="subtle">
                    {input.percentageOfTotal.toFixed(1)}%
                  </Badge>
                </Flex>
              </Flex>
            ))}
          </Stack>
        </Box>

        {/* Yield analysis */}
        {costs.yieldAnalysis && (
          <Box p="3" bg="blue.50" borderRadius="md">
            <Typography variant="body" size="sm" color="blue.700">
              Rendimiento: {costs.yieldAnalysis.yieldPercentage.toFixed(1)}% |
              Desperdicio: {costs.yieldAnalysis.wasteFactor.toFixed(1)}%
            </Typography>
          </Box>
        )}
      </Stack>
    </SectionCard>
  )
}

function CostCard({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <Box p="3" bg={`${color}.50`} borderRadius="md" border="1px" borderColor={`${color}.200`}>
      <Typography variant="body" size="xs" color={`${color}.600`} mb="1">
        {label}
      </Typography>
      <Typography variant="heading" size="lg" color={`${color}.700`}>
        ${value.toFixed(2)}
      </Typography>
    </Box>
  )
}
```

---

## 🔌 INTEGRACIÓN CON MATERIALS MODULE

### Actualizar ElaboratedFields.tsx

```typescript
// src/pages/admin/supply-chain/materials/components/.../ElaboratedFields.tsx

import { RecipeBuilder } from '@/modules/recipe/components/RecipeBuilder'

export function ElaboratedFields({ formData, updateFormData }: ElaboratedFieldsProps) {
  const handleRecipeCreated = useCallback((recipe: Recipe) => {
    // Vincular recipe al material
    updateFormData({ recipe_id: recipe.id })
  }, [updateFormData])

  return (
    <Stack gap="4">
      <Typography variant="body" size="sm" color="text.secondary">
        Los materiales elaborados requieren una receta que define los ingredientes necesarios.
      </Typography>

      <RecipeBuilder
        mode="create"
        entityType="material"
        complexity="minimal"
        features={{
          showCostCalculation: true,
          showInstructions: false,
          showAnalytics: false
        }}
        outputItem={{
          id: formData.id ?? 'temp',
          name: formData.name,
          type: 'material',
          unit: formData.unit
        }}
        outputQuantity={1}
        onSave={handleRecipeCreated}
        onCancel={() => {/* handle cancel */}}
      />
    </Stack>
  )
}
```

---

## 🧪 TESTING

### Setup de Testing

```typescript
// src/modules/recipe/__tests__/setup.test.ts

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecipeBuilder } from '../components/RecipeBuilder'

describe('Recipe Module Setup', () => {
  it('should render RecipeBuilder', () => {
    render(
      <RecipeBuilder
        mode="create"
        entityType="material"
        onSave={() => {}}
      />
    )

    expect(screen.getByText(/Información Básica/i)).toBeInTheDocument()
  })
})
```

### Test de Validación

```typescript
// src/modules/recipe/__tests__/validation.test.ts

import { describe, it, expect } from 'vitest'
import { validateRecipeInputs } from '../services/recipeValidation'

describe('Recipe Validation', () => {
  it('should reject product inputs for material recipe', () => {
    const recipe = {
      entityType: 'material' as const,
      executionMode: 'immediate' as const,
      inputs: [
        {
          id: '1',
          item: { id: '1', name: 'Product A', type: 'product' as const },
          quantity: 1,
          unit: 'unit'
        }
      ]
    }

    const result = validateRecipeInputs(recipe)

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain(expect.stringContaining('solo puede usar materials'))
  })

  it('should accept material inputs for material recipe', () => {
    const recipe = {
      entityType: 'material' as const,
      executionMode: 'immediate' as const,
      inputs: [
        {
          id: '1',
          item: { id: '1', name: 'Material A', type: 'material' as const },
          quantity: 1,
          unit: 'kg'
        }
      ]
    }

    const result = validateRecipeInputs(recipe)

    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Setup ✅
- [ ] Crear estructura `/src/modules/recipe/`
- [ ] Definir tipos en `types/recipe.ts` con `executionMode`
- [ ] Crear `manifest.tsx` del módulo
- [ ] Setup de testing con Vitest

### Fase 2: Core Services ⏳
- [ ] Implementar `recipeApi.ts` (migrar desde `/services/recipe/api`)
- [ ] Implementar `recipeValidation.ts` con validaciones por entityType
- [ ] Implementar `costEngine.ts` con precisión decimal
- [ ] Tests unitarios de services

### Fase 3: RecipeBuilder Component ⏳
- [ ] `RecipeBuilder.tsx` (main component)
- [ ] `RecipeBuilderProvider.tsx` (context)
- [ ] `BasicInfoSection.tsx`
- [ ] `InputsEditorSection.tsx`
- [ ] `OutputConfigSection.tsx`
- [ ] `CostSummarySection.tsx`
- [ ] Componentes auxiliares (`SectionCard`, `ValidatedField`, `InputItemRow`)
- [ ] Tests de componentes

### Fase 4: Integración ⏳
- [ ] Actualizar Materials module (ElaboratedFields)
- [ ] Actualizar Products module (BOM tab)
- [ ] Registrar módulo en ModuleRegistry
- [ ] Tests de integración

### Fase 5: Refinamiento ⏳
- [ ] Optimizaciones de performance
- [ ] Accesibilidad (a11y)
- [ ] Responsive design
- [ ] Documentación final

---

## 🎯 PRÓXIMOS PASOS

1. **Revisar esta guía** y confirmar que está alineada
2. **Empezar Fase 1** (Setup inicial)
3. **Implementar tipos** con `executionMode` crítico
4. **Crear RecipeBuilder** siguiendo el patrón de Materials

---

**Nota**: Esta guía usa el patrón establecido en Materials y Dashboard, siguiendo las convenciones de G-Admin Mini con ChakraUI v3 y optimizaciones de performance.
