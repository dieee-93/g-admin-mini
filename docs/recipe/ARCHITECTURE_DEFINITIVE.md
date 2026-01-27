# ARQUITECTURA DEFINITIVA: RECIPE SYSTEM

> **Fecha**: 2025-12-23
> **Status**: 📐 DISEÑO - Pendiente implementación
> **Breaking Changes**: ✅ PERMITIDOS - Sistema en desarrollo sin datos de producción

---

## 🎯 VISIÓN GENERAL

El **Recipe System** es un módulo transversal que gestiona la definición, cálculo de costos, y análisis de **composiciones de recursos** (recetas, BOMs, kits, procedimientos). No se limita a comida/gastronomía, sino que es una **abstracción genérica** para cualquier entidad que se compone de otras entidades.

### Casos de Uso Soportados

| Caso | Input | Output | Ejemplo | Consumo de Stock |
|------|-------|--------|---------|------------------|
| **Material Elaborado** | Materials | Material | Pan (harina + agua + levadura) | ✅ Al crear/producir |
| **Producto con BOM** | Materials | Product | Hamburguesa (pan + carne + lechuga) | ⏳ Al vender |
| **Kit de Productos** | Products | Product | Combo (burger + fries + drink) | ⏳ Al vender |
| **Servicio con Recursos** | Materials/Assets | Service | Limpieza (detergente + trapo + tiempo) | ⏳ Al ejecutar servicio |
| **Procedimiento** | Materials | - | Procedimiento de mantenimiento | ⏳ Al ejecutar |

**⚠️ DIFERENCIA CRÍTICA - Consumo de Stock:**

- **Material Elaborado**: Se **ejecuta inmediatamente** al crear → Consume stock de inputs y genera stock del material elaborado
- **Producto con BOM**: Se **ejecuta al vender** → Recipe solo define qué se necesita, el consumo ocurre en Sales module
- **Kit/Servicio**: Se **ejecuta on-demand** → Consumo cuando se vende o ejecuta

---

## 🏗️ ARQUITECTURA DE MÓDULO

### Estructura de Directorio

```
src/modules/recipe/
├── manifest.tsx                    # Module registration
├── README.md                       # Documentación del módulo
│
├── types/
│   ├── index.ts                   # Core types (consolidado)
│   ├── recipe.ts                  # Recipe, RecipeInput, RecipeOutput
│   ├── costing.ts                 # Cost calculation types
│   ├── analytics.ts               # Analytics & menu engineering
│   └── execution.ts               # Production/execution types
│
├── hooks/
│   ├── index.ts
│   ├── useRecipes.ts              # CRUD operations
│   ├── useRecipeCosts.ts          # Cost calculations
│   ├── useRecipeAnalytics.ts      # Analytics & insights
│   ├── useRecipeExecution.ts      # Production execution
│   └── useRecipeBuilder.ts        # UI state management
│
├── services/
│   ├── index.ts
│   ├── recipeApi.ts               # Supabase API layer
│   ├── recipeService.ts           # Business logic
│   ├── costEngine.ts              # Cost calculation engine
│   ├── analyticsEngine.ts         # Menu engineering, analytics
│   └── executionEngine.ts         # Batch production, scaling
│
├── components/
│   ├── index.ts
│   ├── RecipeBuilder/             # 🎯 Componente UNIFICADO
│   │   ├── RecipeBuilder.tsx      # Main component
│   │   ├── RecipeBuilderProvider.tsx  # Context provider
│   │   ├── BasicInfo.tsx          # Sección: info básica
│   │   ├── InputsEditor.tsx       # Sección: inputs (ingredientes)
│   │   ├── OutputConfig.tsx       # Sección: output y rendimiento
│   │   ├── CostSummary.tsx        # Sección: resumen de costos
│   │   ├── AdvancedOptions.tsx    # Sección: opciones avanzadas
│   │   └── types.ts               # Props & types del builder
│   ├── RecipeList/
│   │   ├── RecipeList.tsx         # Listado con filtros
│   │   ├── RecipeCard.tsx         # Card de receta
│   │   ├── RecipeFilters.tsx      # Filtros y búsqueda
│   │   └── RecipeActions.tsx      # Acciones en listado
│   ├── RecipeView/
│   │   ├── RecipeView.tsx         # Vista detallada (read-only)
│   │   ├── RecipeHeader.tsx
│   │   ├── RecipeInputsTable.tsx
│   │   └── RecipeCostBreakdown.tsx
│   └── RecipeWorkshop/            # 🆕 Interfaz avanzada
│       ├── RecipeWorkshop.tsx     # Main workshop
│       ├── ScalingTool.tsx        # Herramienta de scaling
│       ├── SubstitutionTool.tsx   # Herramienta de sustituciones
│       ├── OptimizationTool.tsx   # Herramienta de optimización
│       └── ComparisonTool.tsx     # Comparar recetas
│
├── widgets/
│   ├── RecipeStatsWidget.tsx      # Widget para dashboard
│   └── RecipeAlertsWidget.tsx     # Alertas de recetas
│
├── pages/
│   ├── RecipesPage.tsx            # Página principal /recipes
│   ├── RecipeDetailsPage.tsx      # Detalle /recipes/:id
│   └── RecipeWorkshopPage.tsx     # Workshop /recipes/workshop
│
└── __tests__/
    ├── recipeApi.test.ts
    ├── costEngine.test.ts
    ├── RecipeBuilder.test.tsx
    └── integration/
        ├── material-recipe.test.ts
        └── product-recipe.test.ts
```

---

## 📐 DISEÑO DE TIPOS (Core)

### Abstracción Genérica

```typescript
/**
 * Recipe: Composición genérica de recursos
 * @template TInput - Tipo de recurso de entrada (Material, Product, Asset, etc.)
 * @template TOutput - Tipo de recurso de salida (Material, Product, Service, etc.)
 *
 * ⚠️ IMPORTANTE - Execution Mode:
 * - executionMode='immediate': Para materials (consume stock al crear)
 * - executionMode='on_demand': Para products/kits (consume stock al vender)
 */
interface Recipe<TInput = RecipeItem, TOutput = RecipeItem> {
  // Identificación
  id: string
  name: string
  description?: string
  entityType: 'material' | 'product' | 'kit' | 'service'  // 🔑 Tipo de entidad

  // Output (qué produce)
  output: RecipeOutput<TOutput>

  // Inputs (qué consume)
  inputs: RecipeInput<TInput>[]

  // 🔑 CRÍTICO: Modo de ejecución (consumo de stock)
  executionMode: 'immediate' | 'on_demand'
  // - immediate: Ejecutar al crear (Materials)
  // - on_demand: Ejecutar al vender/usar (Products, Kits, Services)

  // Metadata
  category?: RecipeCategory
  tags?: string[]
  difficulty?: DifficultyLevel

  // Timing
  preparationTime?: number  // minutos
  cookingTime?: number      // minutos
  totalTime?: number        // minutos

  // Instructions
  instructions?: RecipeInstruction[]
  notes?: string

  // Costing
  costConfig?: RecipeCostConfig

  // Analytics
  metrics?: RecipeMetrics

  // Audit
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  version?: number
}

/**
 * RecipeOutput: Qué produce la receta
 */
interface RecipeOutput<T = RecipeItem> {
  item: T | string  // Entity o ID
  quantity: number
  unit: string

  // Rendimiento
  yieldPercentage?: number  // % de rendimiento esperado
  wastePercentage?: number  // % de desperdicio esperado

  // Calidad
  qualityGrade?: QualityGrade  // PREMIUM, STANDARD, ECONOMY
}

/**
 * RecipeInput: Qué consume la receta
 */
interface RecipeInput<T = RecipeItem> {
  id: string
  item: T | string  // Entity o ID
  quantity: number
  unit: string

  // Opciones
  optional?: boolean
  substituteFor?: string  // ID del input que reemplaza

  // Rendimiento
  yieldPercentage?: number
  wastePercentage?: number

  // Costing
  unitCostOverride?: number  // Override de costo unitario
  conversionFactor?: number  // Factor de conversión de unidades

  // Stage (para recetas con pasos)
  stage?: number
  stageName?: string
}

/**
 * RecipeItem: Tipo base para items en recipe
 * Puede ser Material, Product, Asset, etc.
 */
interface RecipeItem {
  id: string
  name: string
  type: 'material' | 'product' | 'asset' | 'service'
  unit?: string
  currentStock?: number
  unitCost?: number
}

/**
 * RecipeInstruction: Paso de preparación
 */
interface RecipeInstruction {
  step: number
  description: string
  duration?: number  // minutos
  temperature?: number  // °C
  equipment?: string[]
  image?: string
}

/**
 * RecipeCostConfig: Configuración de cálculo de costos
 */
interface RecipeCostConfig {
  includeLabor: boolean
  includeProfitability: boolean

  // Labor
  laborCostPerHour?: number
  laborHours?: number

  // Overhead
  overheadPercentage?: number  // % sobre costo de materiales
  overheadFixed?: number       // Monto fijo

  // Packaging
  packagingCost?: number

  // Costing method (para materials)
  costingMethod?: 'FIFO' | 'LIFO' | 'AVERAGE' | 'STANDARD'
}

/**
 * RecipeMetrics: Métricas y analytics
 */
interface RecipeMetrics {
  popularityScore?: number      // 0-100
  profitabilityScore?: number   // 0-100
  efficiencyScore?: number      // 0-100
  timesProduced?: number
  lastProducedAt?: Date
  averageProductionTime?: number
}

// Enums
enum RecipeCategory {
  // Gastronomía
  APPETIZER = 'appetizer',
  SOUP = 'soup',
  SALAD = 'salad',
  MAIN_COURSE = 'main_course',
  SIDE_DISH = 'side_dish',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
  SAUCE = 'sauce',

  // Producción
  ASSEMBLY = 'assembly',
  MANUFACTURING = 'manufacturing',
  PACKAGING = 'packaging',

  // Servicios
  PROCEDURE = 'procedure',
  MAINTENANCE = 'maintenance',

  // Otros
  KIT = 'kit',
  BUNDLE = 'bundle',
  OTHER = 'other'
}

enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

enum QualityGrade {
  PREMIUM = 'premium',
  STANDARD = 'standard',
  ECONOMY = 'economy'
}
```

### Tipos de Costing

```typescript
/**
 * RecipeCostResult: Resultado completo de cálculo de costos
 */
interface RecipeCostResult {
  // Costos base
  materialsCost: number
  laborCost: number
  overheadCost: number
  packagingCost: number
  totalCost: number

  // Por unidad
  costPerUnit: number
  costPerPortion?: number

  // Breakdown por input
  inputsBreakdown: RecipeInputCost[]

  // Yield analysis
  yieldAnalysis: {
    theoreticalYield: number
    actualYield: number
    yieldPercentage: number
    wasteFactor: number
    efficiencyScore: number
  }

  // Profitability (si se incluye)
  profitability?: RecipeProfitability

  // Metadata
  calculatedAt: Date
  costingMethod?: string
}

interface RecipeInputCost {
  inputId: string
  itemName: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  percentageOfTotal: number
  yieldAdjustedCost?: number
}

interface RecipeProfitability {
  sellingPrice?: number
  profitMargin?: number
  profitPercentage?: number
  breakEvenPrice: number
  targetFoodCostPercentage?: number
  actualFoodCostPercentage?: number
}
```

### Tipos de Analytics

```typescript
/**
 * RecipeAnalytics: Analytics avanzados
 */
interface RecipeAnalytics {
  // Menu Engineering
  menuEngineering?: MenuEngineeringResult

  // Performance
  performance: {
    popularity: number        // 0-100
    profitability: number     // 0-100
    contribution: number      // Contribución al revenue total
  }

  // Health score
  healthScore: number         // 0-100 (viabilidad + rentabilidad)

  // Recommendations
  recommendations: RecipeRecommendation[]
}

interface MenuEngineeringResult {
  classification: 'STAR' | 'PLOW_HORSE' | 'PUZZLE' | 'DOG'
  popularityRank: number
  profitabilityRank: number
  action: string  // "Keep", "Promote", "Improve margin", "Remove"
}

interface RecipeRecommendation {
  type: 'cost_reduction' | 'substitution' | 'pricing' | 'production'
  priority: 'high' | 'medium' | 'low'
  message: string
  estimatedImpact?: number
  actionable?: boolean
}
```

### Tipos de Ejecución

```typescript
/**
 * RecipeExecution: Ejecución de producción
 */
interface RecipeExecution {
  id: string
  recipeId: string
  recipeName: string

  // Cantidades
  batches: number
  outputQuantity: number

  // Inputs consumidos
  inputsConsumed: RecipeInputConsumed[]

  // Costos reales
  actualCost: number
  expectedCost: number
  costVariance: number

  // Timing
  startedAt: Date
  completedAt?: Date
  actualDuration?: number  // minutos
  expectedDuration?: number

  // Calidad
  yieldPercentage?: number
  qualityGrade?: QualityGrade

  // Metadata
  executedBy?: string
  notes?: string
  status: 'in_progress' | 'completed' | 'cancelled'
}

interface RecipeInputConsumed {
  inputId: string
  itemId: string
  itemName: string
  quantityPlanned: number
  quantityActual: number
  variance: number
  unit: string
  cost: number
}
```

---

## 🧩 COMPONENTE UNIFICADO: RecipeBuilder

### Concepto

Un **único componente** que reemplaza a los 4 actuales (RecipeForm, RecipeFormClean, RecipeBuilderLite, RecipeBuilderClean). Se configura mediante props para diferentes modos y niveles de complejidad.

### Props

```typescript
interface RecipeBuilderProps {
  // Modo
  mode: 'create' | 'edit'

  // Tipo de entidad
  entityType: 'material' | 'product' | 'kit' | 'service'

  // Complejidad de UI
  complexity?: 'minimal' | 'standard' | 'advanced'

  // Features habilitados
  features?: {
    showCostCalculation?: boolean
    showAnalytics?: boolean
    showInstructions?: boolean
    showYieldConfig?: boolean
    showQualityConfig?: boolean
    allowSubstitutions?: boolean
    enableAiSuggestions?: boolean
  }

  // Data inicial
  initialData?: Partial<Recipe>
  recipeId?: string  // Para modo edit

  // Output configuration
  outputItem?: RecipeItem  // Pre-seleccionado
  outputQuantity?: number

  // Callbacks
  onSave?: (recipe: Recipe) => void | Promise<void>
  onCancel?: () => void
  onChange?: (recipe: Partial<Recipe>) => void

  // Validación
  validateOnChange?: boolean
  customValidation?: (recipe: Partial<Recipe>) => ValidationResult
}
```

### Ejemplos de Uso

```typescript
// 1. Minimal: Material elaborado (reemplaza RecipeBuilderClean)
<RecipeBuilder
  mode="create"
  entityType="material"
  complexity="minimal"
  features={{
    showCostCalculation: true,
    showInstructions: false,
    showAnalytics: false
  }}
  outputItem={selectedMaterial}
  onSave={handleRecipeCreated}
/>

// 2. Standard: Producto con BOM
<RecipeBuilder
  mode="create"
  entityType="product"
  complexity="standard"
  features={{
    showCostCalculation: true,
    showInstructions: true,
    showYieldConfig: true
  }}
  onSave={handleRecipeCreated}
/>

// 3. Advanced: Forma completa con todas las features (reemplaza RecipeForm)
<RecipeBuilder
  mode="edit"
  recipeId={recipe.id}
  entityType="product"
  complexity="advanced"
  features={{
    showCostCalculation: true,
    showAnalytics: true,
    showInstructions: true,
    showYieldConfig: true,
    showQualityConfig: true,
    allowSubstitutions: true,
    enableAiSuggestions: true
  }}
  onSave={handleRecipeUpdated}
/>
```

### Estructura Interna

```typescript
// RecipeBuilder.tsx
export function RecipeBuilder(props: RecipeBuilderProps) {
  const { mode, entityType, complexity = 'standard', features = {} } = props

  // Context provider para state compartido
  return (
    <RecipeBuilderProvider initialData={props.initialData}>
      <RecipeBuilderContent
        mode={mode}
        entityType={entityType}
        complexity={complexity}
        features={features}
        {...props}
      />
    </RecipeBuilderProvider>
  )
}

function RecipeBuilderContent(props: RecipeBuilderProps) {
  const { recipe, updateRecipe, validation } = useRecipeBuilderContext()
  const { complexity, features } = props

  return (
    <Stack spacing={4}>
      {/* Siempre visible */}
      <BasicInfo
        name={recipe.name}
        description={recipe.description}
        onChange={updateRecipe}
      />

      {/* Output config */}
      <OutputConfig
        output={recipe.output}
        entityType={props.entityType}
        onChange={(output) => updateRecipe({ output })}
      />

      {/* Inputs editor (ingredientes) */}
      <InputsEditor
        inputs={recipe.inputs}
        entityType={props.entityType}
        allowSubstitutions={features.allowSubstitutions}
        onChange={(inputs) => updateRecipe({ inputs })}
      />

      {/* Condicional: Cost summary */}
      {features.showCostCalculation && (
        <CostSummary recipeId={recipe.id} inputs={recipe.inputs} />
      )}

      {/* Condicional: Instructions (solo en standard/advanced) */}
      {complexity !== 'minimal' && features.showInstructions && (
        <InstructionsEditor
          instructions={recipe.instructions}
          onChange={(instructions) => updateRecipe({ instructions })}
        />
      )}

      {/* Condicional: Advanced options (solo en advanced) */}
      {complexity === 'advanced' && (
        <AdvancedOptions
          recipe={recipe}
          features={features}
          onChange={updateRecipe}
        />
      )}

      {/* Actions */}
      <RecipeBuilderActions
        mode={props.mode}
        onSave={() => props.onSave?.(recipe)}
        onCancel={props.onCancel}
        validation={validation}
      />
    </Stack>
  )
}
```

---

## 🔌 INTEGRACIÓN CON MÓDULOS

### Recipe Module Manifest

```typescript
// src/modules/recipe/manifest.tsx

export const recipeManifest: ModuleManifest = {
  id: 'recipe',
  name: 'Recipe Management',
  description: 'Recipe definition, costing, and analytics',
  domain: 'SUPPLY_CHAIN',
  category: 'core',
  version: '1.0.0',

  routes: [
    {
      path: '/recipes',
      component: lazy(() => import('./pages/RecipesPage')),
      name: 'Recipes',
      icon: BeakerIcon,
      permissions: ['recipe.view']
    },
    {
      path: '/recipes/:id',
      component: lazy(() => import('./pages/RecipeDetailsPage')),
      name: 'Recipe Details',
      hidden: true
    },
    {
      path: '/recipes/workshop',
      component: lazy(() => import('./pages/RecipeWorkshopPage')),
      name: 'Recipe Workshop',
      icon: WrenchIcon,
      permissions: ['recipe.manage']
    }
  ],

  // Hook points: QUÉ PROVEE
  provide: [
    'recipe.cost_calculation',      // Cálculo de costos
    'recipe.builder',                // Componente RecipeBuilder
    'recipe.analytics',              // Analytics engine
    'recipe.execution',              // Production execution
    'dashboard.widgets'              // Widgets para dashboard
  ],

  // Hook points: QUÉ CONSUME
  consume: [
    'materials.stock_updated',       // Recalcular disponibilidad
    'products.created',              // Crear recipe automática
    'sales.order_completed'          // Tracking de popularidad
  ],

  widgets: [
    {
      id: 'recipe-stats',
      component: lazy(() => import('./widgets/RecipeStatsWidget')),
      title: 'Recipe Statistics',
      defaultSize: 'medium'
    },
    {
      id: 'recipe-alerts',
      component: lazy(() => import('./widgets/RecipeAlertsWidget')),
      title: 'Recipe Alerts',
      defaultSize: 'small'
    }
  ],

  permissions: [
    { id: 'recipe.view', name: 'View Recipes' },
    { id: 'recipe.create', name: 'Create Recipes' },
    { id: 'recipe.edit', name: 'Edit Recipes' },
    { id: 'recipe.delete', name: 'Delete Recipes' },
    { id: 'recipe.execute', name: 'Execute Recipes (Production)' },
    { id: 'recipe.manage', name: 'Full Recipe Management' }
  ],

  dependencies: ['materials', 'products'],
  optionalDependencies: ['sales', 'scheduling']
}
```

### Integración con Materials

```typescript
// src/modules/materials/manifest.tsx

export const materialsManifest: ModuleManifest = {
  // ...

  consume: [
    'recipe.builder',          // Usar RecipeBuilder en ElaboratedFields
    'recipe.cost_calculation'  // Cálculo de costos para materiales elaborados
  ],

  provide: [
    'materials.recipe_usage'   // Hook para ver qué recetas usan un material
  ],

  hookPoints: {
    // En MaterialForm → ElaboratedFields
    'material.form.elaborated': {
      render: (material) => {
        const RecipeBuilder = registry.getComponent('recipe.builder')

        return (
          <RecipeBuilder
            mode="create"
            entityType="material"
            complexity="minimal"
            outputItem={material}
            onSave={(recipe) => {
              material.recipe_id = recipe.id
            }}
          />
        )
      }
    },

    // En MaterialList → Row actions
    'material.row.actions': {
      render: (material) => (
        <Button
          size="sm"
          onClick={() => showRecipeUsage(material.id)}
        >
          Recipe Usage
        </Button>
      )
    }
  }
}
```

### Integración con Products

```typescript
// src/modules/products/manifest.tsx

export const productsManifest: ModuleManifest = {
  // ...

  consume: [
    'recipe.builder',          // Usar RecipeBuilder en ProductForm
    'recipe.cost_calculation', // Cálculo de costos para productos
    'recipe.analytics'         // Analytics de productos
  ],

  provide: [
    'products.bom',            // Bill of Materials
    'products.pricing'         // Pricing basado en recipe cost
  ],

  hookPoints: {
    // En ProductForm → BOM tab
    'product.form.bom': {
      render: (product) => {
        const RecipeBuilder = registry.getComponent('recipe.builder')

        return (
          <RecipeBuilder
            mode={product.recipe_id ? 'edit' : 'create'}
            recipeId={product.recipe_id}
            entityType="product"
            complexity="standard"
            features={{
              showCostCalculation: true,
              showInstructions: true,
              showYieldConfig: true
            }}
            outputItem={product}
            onSave={(recipe) => {
              product.recipe_id = recipe.id
              // Auto-calcular precio sugerido
              product.suggested_price = recipe.cost * (1 + targetMargin)
            }}
          />
        )
      }
    }
  }
}
```

### Integración con Dashboard

```typescript
// src/modules/dashboard/manifest.tsx

export const dashboardManifest: ModuleManifest = {
  // ...

  consume: [
    'recipe.analytics'  // Consumir analytics para widgets
  ],

  hookPoints: {
    'dashboard.widgets.register': {
      handler: (registry) => {
        // Registrar widgets de recipe
        registry.registerWidget({
          id: 'recipe-stats',
          category: 'operations',
          component: lazy(() => import('@/modules/recipe/widgets/RecipeStatsWidget'))
        })

        registry.registerWidget({
          id: 'recipe-intelligence',
          category: 'intelligence',
          component: lazy(() => import('@/modules/recipe/components/RecipeView/RecipeDashboard'))
        })
      }
    }
  }
}
```

---

## 🔧 SERVICIOS Y ENGINES

### Cost Engine

```typescript
// src/modules/recipe/services/costEngine.ts

export class RecipeCostEngine {
  /**
   * Calcula el costo completo de una receta
   */
  static async calculateRecipeCost(
    recipeId: string,
    options?: RecipeCostOptions
  ): Promise<RecipeCostResult> {
    // 1. Fetch recipe con inputs
    const recipe = await recipeApi.getRecipeWithInputs(recipeId)

    // 2. Calcular costo de cada input (con yield ajustado)
    const inputsCosts = await this.calculateInputsCosts(recipe.inputs)

    // 3. Sumar costos base
    const materialsCost = inputsCosts.reduce((sum, input) =>
      sum.plus(input.yieldAdjustedCost), new Decimal(0)
    )

    // 4. Calcular labor cost
    const laborCost = this.calculateLaborCost(recipe, options)

    // 5. Calcular overhead
    const overheadCost = this.calculateOverhead(materialsCost, recipe, options)

    // 6. Packaging
    const packagingCost = new Decimal(recipe.costConfig?.packagingCost ?? 0)

    // 7. Total
    const totalCost = materialsCost
      .plus(laborCost)
      .plus(overheadCost)
      .plus(packagingCost)

    // 8. Por unidad
    const costPerUnit = totalCost.dividedBy(recipe.output.quantity)

    // 9. Yield analysis
    const yieldAnalysis = this.calculateYieldAnalysis(recipe)

    // 10. Profitability (opcional)
    const profitability = options?.includeProfitability
      ? this.calculateProfitability(totalCost, recipe)
      : undefined

    return {
      materialsCost: materialsCost.toNumber(),
      laborCost: laborCost.toNumber(),
      overheadCost: overheadCost.toNumber(),
      packagingCost: packagingCost.toNumber(),
      totalCost: totalCost.toNumber(),
      costPerUnit: costPerUnit.toNumber(),
      inputsBreakdown: inputsCosts,
      yieldAnalysis,
      profitability,
      calculatedAt: new Date(),
      costingMethod: recipe.costConfig?.costingMethod
    }
  }

  /**
   * Calcula costos de inputs con yield ajustado
   */
  private static async calculateInputsCosts(
    inputs: RecipeInput[]
  ): Promise<RecipeInputCost[]> {
    return Promise.all(
      inputs.map(async (input) => {
        // Obtener costo unitario (override o actual)
        const unitCost = input.unitCostOverride ??
          await this.getItemUnitCost(input.itemId)

        // Cantidad ajustada por yield
        const yieldFactor = (100 - (input.wastePercentage ?? 0)) / 100
        const effectiveQuantity = new Decimal(input.quantity).dividedBy(yieldFactor)

        // Costo total
        const totalCost = effectiveQuantity.times(unitCost)

        return {
          inputId: input.id,
          itemName: input.item.name,
          quantity: input.quantity,
          unit: input.unit,
          unitCost: unitCost.toNumber(),
          totalCost: totalCost.toNumber(),
          percentageOfTotal: 0,  // Se calcula después
          yieldAdjustedCost: totalCost.toNumber()
        }
      })
    )
  }

  /**
   * Obtiene el costo unitario de un item
   */
  private static async getItemUnitCost(itemId: string): Promise<Decimal> {
    // Implementación específica según tipo de item
    // Puede consultar materialsStore, productsStore, etc.
    const item = await itemsApi.getItem(itemId)
    return new Decimal(item.unit_cost ?? 0)
  }

  // ... otros métodos privados
}
```

### Analytics Engine

```typescript
// src/modules/recipe/services/analyticsEngine.ts

export class RecipeAnalyticsEngine {
  /**
   * Menu Engineering Analysis (Boston Matrix)
   */
  static async analyzeMenuEngineering(
    recipeId: string
  ): Promise<MenuEngineeringResult> {
    // 1. Get all recipes con metrics
    const allRecipes = await recipeApi.getRecipesWithMetrics()

    // 2. Calcular popularity percentile
    const popularityRank = this.calculatePercentile(
      allRecipes,
      recipeId,
      (r) => r.metrics?.popularityScore ?? 0
    )

    // 3. Calcular profitability percentile
    const profitabilityRank = this.calculatePercentile(
      allRecipes,
      recipeId,
      (r) => r.metrics?.profitabilityScore ?? 0
    )

    // 4. Clasificar según matriz
    const classification = this.classify(popularityRank, profitabilityRank)

    // 5. Determinar acción recomendada
    const action = this.getRecommendedAction(classification)

    return {
      classification,
      popularityRank,
      profitabilityRank,
      action
    }
  }

  /**
   * Clasifica según Boston Matrix
   */
  private static classify(
    popularityRank: number,
    profitabilityRank: number
  ): MenuEngineeringClassification {
    const popularityThreshold = 50
    const profitabilityThreshold = 50

    if (popularityRank >= popularityThreshold &&
        profitabilityRank >= profitabilityThreshold) {
      return 'STAR'  // Alto popularity, alta rentabilidad
    } else if (popularityRank >= popularityThreshold &&
               profitabilityRank < profitabilityThreshold) {
      return 'PLOW_HORSE'  // Alto popularity, baja rentabilidad
    } else if (popularityRank < popularityThreshold &&
               profitabilityRank >= profitabilityThreshold) {
      return 'PUZZLE'  // Bajo popularity, alta rentabilidad
    } else {
      return 'DOG'  // Bajo popularity, baja rentabilidad
    }
  }

  /**
   * Calcula health score (0-100)
   */
  static calculateHealthScore(recipe: Recipe): number {
    const weights = {
      viability: 0.3,      // Hay stock de inputs
      profitability: 0.3,  // Margen adecuado
      popularity: 0.2,     // Se vende bien
      efficiency: 0.2      // Yield alto, waste bajo
    }

    const viabilityScore = this.calculateViability(recipe)
    const profitabilityScore = recipe.metrics?.profitabilityScore ?? 50
    const popularityScore = recipe.metrics?.popularityScore ?? 50
    const efficiencyScore = recipe.metrics?.efficiencyScore ?? 50

    return (
      viabilityScore * weights.viability +
      profitabilityScore * weights.profitability +
      popularityScore * weights.popularity +
      efficiencyScore * weights.efficiency
    )
  }

  // ... otros métodos
}
```

---

## 🎨 RECIPE WORKSHOP (Nueva Feature)

### Concepto

Una interfaz dedicada para **experimentar y optimizar recetas**. Es como un "laboratorio" donde chefs/managers pueden:
- Escalar recetas (2x, 3x, batches)
- Probar sustituciones de ingredientes
- Optimizar costos
- Comparar variaciones
- Ver impacto de cambios en tiempo real

### Ubicación

- **Ruta**: `/recipes/workshop` o `/recipes/:id/workshop`
- **Componente**: `src/modules/recipe/pages/RecipeWorkshopPage.tsx`

### UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Recipe Workshop: Hamburguesa Clásica          [Save]    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────────────┐  ┌─────────────────────────────┐  │
│ │ Original Recipe  │  │ Modified Recipe             │  │
│ │                  │  │                             │  │
│ │ Ingredients:     │  │ Ingredients:                │  │
│ │ - Beef 200g      │  │ - Beef 200g → Turkey 200g   │  │
│ │ - Bun 1          │  │ - Bun 1                     │  │
│ │ - Lettuce 50g    │  │ - Lettuce 50g               │  │
│ │                  │  │                             │  │
│ │ Cost: $3.50      │  │ Cost: $2.80 (-20%)          │  │
│ │ Margin: 60%      │  │ Margin: 70% (+10%)          │  │
│ │ Time: 8 min      │  │ Time: 8 min                 │  │
│ └──────────────────┘  └─────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Tools                                              │  │
│ │ ┌─────────┐ ┌──────────────┐ ┌──────────────────┐ │  │
│ │ │ Scaling │ │Substitutions │ │ Optimization     │ │  │
│ │ └─────────┘ └──────────────┘ └──────────────────┘ │  │
│ │                                                    │  │
│ │ [Scale Recipe]                                     │  │
│ │  Batches: [2] ▼                                    │  │
│ │  → 400g beef, 2 buns, 100g lettuce                 │  │
│ │  → Total cost: $7.00                               │  │
│ │                                                    │  │
│ │ [Substitute Ingredient]                            │  │
│ │  From: Beef ▼                                      │  │
│ │  To: Turkey ▼                                      │  │
│ │  Impact: -$0.70 (-20% cost) ✓                      │  │
│ │                                                    │  │
│ │ [Optimize for Cost]                                │  │
│ │  Target cost: $2.50                                │  │
│ │  Suggestions:                                      │  │
│ │  • Use turkey instead of beef (-$0.70)             │  │
│ │  • Reduce lettuce to 40g (-$0.05)                  │  │
│ │  • Use economy bun (-$0.15)                        │  │
│ │  Total savings: $0.90                              │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Comparison                                         │  │
│ │  ┌──────────┬──────────┬──────────┬─────────────┐ │  │
│ │  │ Metric   │ Original │ Modified │ Difference  │ │  │
│ │  ├──────────┼──────────┼──────────┼─────────────┤ │  │
│ │  │ Cost     │ $3.50    │ $2.80    │ -$0.70(-20%)│ │  │
│ │  │ Margin   │ 60%      │ 70%      │ +10%        │ │  │
│ │  │ Quality  │ Premium  │ Standard │ ↓           │ │  │
│ │  │ Time     │ 8 min    │ 8 min    │ -           │ │  │
│ │  └──────────┴──────────┴──────────┴─────────────┘ │  │
│ └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Herramientas del Workshop

#### 1. Scaling Tool
```typescript
interface ScalingToolProps {
  recipe: Recipe
  onScale: (scaledRecipe: Recipe) => void
}

// Permite escalar por:
// - Factor (2x, 3x, 0.5x)
// - Batches
// - Output quantity target
```

#### 2. Substitution Tool
```typescript
interface SubstitutionToolProps {
  recipe: Recipe
  onSubstitute: (modifiedRecipe: Recipe) => void
}

// Funciones:
// - Seleccionar input a sustituir
// - Ver alternativas disponibles con mismo unit
// - Preview de impacto en costo y calidad
// - Aplicar sustitución
```

#### 3. Optimization Tool
```typescript
interface OptimizationToolProps {
  recipe: Recipe
  objective: 'minimize_cost' | 'maximize_margin' | 'maintain_quality'
  onOptimize: (optimizedRecipe: Recipe) => void
}

// Algoritmo de optimización:
// - Buscar alternativas más baratas
// - Ajustar cantidades
// - Sugerir cambios de calidad
// - Mostrar trade-offs
```

#### 4. Comparison Tool
```typescript
interface ComparisonToolProps {
  recipes: Recipe[]
  metrics: string[]  // 'cost', 'margin', 'time', 'quality'
}

// Comparación side-by-side de múltiples variaciones
```

---

## 📊 MODELO DE DATOS (Base de Datos)

### Esquema Consolidado

```sql
-- Tabla principal: recipes
CREATE TABLE recipes (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Output
  output_item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  output_quantity NUMERIC(10, 4) NOT NULL CHECK (output_quantity > 0),
  output_unit VARCHAR(50) NOT NULL,
  output_yield_percentage NUMERIC(5, 2) CHECK (output_yield_percentage >= 0 AND output_yield_percentage <= 100),
  output_waste_percentage NUMERIC(5, 2) CHECK (output_waste_percentage >= 0 AND output_waste_percentage <= 100),
  output_quality_grade VARCHAR(20) CHECK (output_quality_grade IN ('premium', 'standard', 'economy')),

  -- Metadata
  category VARCHAR(50),
  tags TEXT[],
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),

  -- Timing
  preparation_time INTEGER,  -- minutos
  cooking_time INTEGER,
  total_time INTEGER,

  -- Instructions
  instructions JSONB,  -- Array de RecipeInstruction
  notes TEXT,

  -- Costing config
  cost_config JSONB,  -- RecipeCostConfig

  -- Metrics
  popularity_score NUMERIC(5, 2) DEFAULT 0,
  profitability_score NUMERIC(5, 2) DEFAULT 0,
  efficiency_score NUMERIC(5, 2) DEFAULT 0,
  times_produced INTEGER DEFAULT 0,
  last_produced_at TIMESTAMP,
  average_production_time INTEGER,

  -- Image
  image_url VARCHAR(500),

  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  version INTEGER DEFAULT 1,

  -- Indexes
  CONSTRAINT recipes_name_unique UNIQUE (name)
);

CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_output_item ON recipes(output_item_id);
CREATE INDEX idx_recipes_popularity ON recipes(popularity_score DESC);
CREATE INDEX idx_recipes_profitability ON recipes(profitability_score DESC);

-- Tabla: recipe_inputs (ingredientes)
CREATE TABLE recipe_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,

  -- Input item
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  quantity NUMERIC(10, 4) NOT NULL CHECK (quantity > 0),
  unit VARCHAR(50) NOT NULL,

  -- Options
  optional BOOLEAN DEFAULT FALSE,
  substitute_for UUID REFERENCES recipe_inputs(id),  -- Si es sustituto

  -- Yield
  yield_percentage NUMERIC(5, 2) DEFAULT 100 CHECK (yield_percentage >= 0 AND yield_percentage <= 100),
  waste_percentage NUMERIC(5, 2) DEFAULT 0 CHECK (waste_percentage >= 0 AND waste_percentage <= 100),

  -- Costing
  unit_cost_override NUMERIC(10, 4),
  conversion_factor NUMERIC(10, 6) DEFAULT 1,

  -- Stage (para recetas multi-paso)
  stage INTEGER DEFAULT 1,
  stage_name VARCHAR(100),

  -- Order
  display_order INTEGER DEFAULT 0,

  CONSTRAINT recipe_inputs_unique UNIQUE (recipe_id, item_id, substitute_for)
);

CREATE INDEX idx_recipe_inputs_recipe ON recipe_inputs(recipe_id);
CREATE INDEX idx_recipe_inputs_item ON recipe_inputs(item_id);

-- Tabla: recipe_executions (producción)
CREATE TABLE recipe_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE RESTRICT,

  -- Cantidades
  batches INTEGER NOT NULL DEFAULT 1,
  output_quantity NUMERIC(10, 4) NOT NULL,

  -- Inputs consumed (JSONB)
  inputs_consumed JSONB NOT NULL,

  -- Costos
  actual_cost NUMERIC(10, 4),
  expected_cost NUMERIC(10, 4),
  cost_variance NUMERIC(10, 4),

  -- Timing
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  actual_duration INTEGER,  -- minutos
  expected_duration INTEGER,

  -- Quality
  yield_percentage NUMERIC(5, 2),
  quality_grade VARCHAR(20),

  -- Metadata
  executed_by UUID REFERENCES users(id),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recipe_executions_recipe ON recipe_executions(recipe_id);
CREATE INDEX idx_recipe_executions_executed_by ON recipe_executions(executed_by);
CREATE INDEX idx_recipe_executions_started_at ON recipe_executions(started_at DESC);

-- RPC Functions (mantenidas y mejoradas)

-- 1. Get recipes with costs
CREATE OR REPLACE FUNCTION get_recipes_with_costs()
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  output_item_id UUID,
  output_quantity NUMERIC,
  total_cost NUMERIC,
  cost_per_unit NUMERIC,
  materials_cost NUMERIC,
  labor_cost NUMERIC,
  overhead_cost NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.name,
    r.description,
    r.output_item_id,
    r.output_quantity,
    (
      SELECT SUM(ri.quantity * COALESCE(ri.unit_cost_override, i.unit_cost, 0))
      FROM recipe_inputs ri
      JOIN items i ON ri.item_id = i.id
      WHERE ri.recipe_id = r.id
    ) AS total_cost,
    (
      SELECT SUM(ri.quantity * COALESCE(ri.unit_cost_override, i.unit_cost, 0)) / r.output_quantity
      FROM recipe_inputs ri
      JOIN items i ON ri.item_id = i.id
      WHERE ri.recipe_id = r.id
    ) AS cost_per_unit,
    0::NUMERIC AS materials_cost,
    0::NUMERIC AS labor_cost,
    0::NUMERIC AS overhead_cost
  FROM recipes r;
END;
$$ LANGUAGE plpgsql;

-- 2. Calculate recipe cost (mejorado con yield)
CREATE OR REPLACE FUNCTION calculate_recipe_cost(p_recipe_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_total_cost NUMERIC := 0;
  v_input RECORD;
BEGIN
  FOR v_input IN
    SELECT
      ri.quantity,
      ri.yield_percentage,
      ri.waste_percentage,
      COALESCE(ri.unit_cost_override, i.unit_cost, 0) AS unit_cost
    FROM recipe_inputs ri
    JOIN items i ON ri.item_id = i.id
    WHERE ri.recipe_id = p_recipe_id
  LOOP
    -- Ajustar cantidad por yield
    v_total_cost := v_total_cost + (
      v_input.quantity / ((100 - COALESCE(v_input.waste_percentage, 0)) / 100) * v_input.unit_cost
    );
  END LOOP;

  RETURN v_total_cost;
END;
$$ LANGUAGE plpgsql;

-- 3. Execute recipe (producción)
CREATE OR REPLACE FUNCTION execute_recipe(
  p_recipe_id UUID,
  p_batches INTEGER DEFAULT 1,
  p_executed_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_execution_id UUID;
  v_recipe RECORD;
  v_inputs JSONB;
BEGIN
  -- Get recipe data
  SELECT * INTO v_recipe FROM recipes WHERE id = p_recipe_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recipe not found: %', p_recipe_id;
  END IF;

  -- Collect inputs
  SELECT jsonb_agg(
    jsonb_build_object(
      'item_id', ri.item_id,
      'quantity_planned', ri.quantity * p_batches,
      'unit', ri.unit
    )
  ) INTO v_inputs
  FROM recipe_inputs ri
  WHERE ri.recipe_id = p_recipe_id;

  -- Create execution record
  INSERT INTO recipe_executions (
    recipe_id,
    batches,
    output_quantity,
    inputs_consumed,
    expected_cost,
    expected_duration,
    executed_by,
    status
  ) VALUES (
    p_recipe_id,
    p_batches,
    v_recipe.output_quantity * p_batches,
    v_inputs,
    calculate_recipe_cost(p_recipe_id) * p_batches,
    v_recipe.total_time,
    p_executed_by,
    'in_progress'
  ) RETURNING id INTO v_execution_id;

  -- Update recipe metrics
  UPDATE recipes
  SET
    times_produced = times_produced + 1,
    last_produced_at = NOW()
  WHERE id = p_recipe_id;

  RETURN v_execution_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 🧪 TESTING STRATEGY

### Niveles de Testing

```
tests/
├── unit/
│   ├── costEngine.test.ts
│   ├── analyticsEngine.test.ts
│   ├── recipeService.test.ts
│   └── recipeValidation.test.ts
│
├── integration/
│   ├── material-recipe-integration.test.ts
│   ├── product-recipe-integration.test.ts
│   ├── recipe-execution.test.ts
│   └── eventbus-recipe.test.ts
│
├── components/
│   ├── RecipeBuilder.test.tsx
│   ├── RecipeList.test.tsx
│   ├── RecipeWorkshop.test.tsx
│   └── RecipeWidgets.test.tsx
│
└── e2e/
    ├── create-material-with-recipe.spec.ts
    ├── create-product-with-bom.spec.ts
    └── recipe-cost-analysis.spec.ts
```

### Casos de Test Críticos

```typescript
// Unit: Cost calculation con yield
describe('RecipeCostEngine', () => {
  it('should calculate cost with yield adjustment', () => {
    const recipe = {
      inputs: [
        {
          item: { unit_cost: 10 },
          quantity: 100,
          waste_percentage: 20  // 20% waste
        }
      ]
    }

    const result = RecipeCostEngine.calculateInputsCosts(recipe.inputs)

    // Expected: 100 / (80/100) * 10 = 1250
    expect(result[0].yieldAdjustedCost).toBe(1250)
  })
})

// Integration: Material → Recipe
describe('Material with Recipe', () => {
  it('should create elaborated material with recipe', async () => {
    const material = await createMaterial({
      type: 'ELABORATED',
      name: 'Pan casero'
    })

    const recipe = await createRecipe({
      output_item_id: material.id,
      inputs: [
        { item_id: flour.id, quantity: 500, unit: 'g' },
        { item_id: water.id, quantity: 300, unit: 'ml' }
      ]
    })

    expect(material.recipe_id).toBe(recipe.id)
  })
})

// E2E: Workflow completo
describe('Recipe Workshop', () => {
  it('should scale recipe and update costs', async () => {
    // 1. Abrir workshop
    await page.goto('/recipes/workshop')

    // 2. Seleccionar receta
    await page.selectRecipe('hamburguesa')

    // 3. Escalar 2x
    await page.setScaleFactor(2)

    // 4. Verificar costos actualizados
    const originalCost = await page.getCost('original')
    const scaledCost = await page.getCost('modified')

    expect(scaledCost).toBe(originalCost * 2)
  })
})
```

---

## 📋 PLAN DE IMPLEMENTACIÓN

### Fase 1: Fundamentos (1-2 semanas)
- [ ] Crear estructura de módulo `/src/modules/recipe`
- [ ] Definir tipos consolidados (recipe.ts, costing.ts, analytics.ts, execution.ts)
- [ ] Migrar y consolidar API layer (recipeApi.ts)
- [ ] Migrar RecipeService.ts con mejoras
- [ ] Actualizar schema de base de datos
- [ ] Setup de testing infrastructure

### Fase 2: Core Services (1 semana)
- [ ] Implementar RecipeCostEngine completo
- [ ] Implementar RecipeAnalyticsEngine
- [ ] Implementar RecipeExecutionEngine
- [ ] Hooks: useRecipes, useRecipeCosts, useRecipeAnalytics
- [ ] Tests unitarios de engines y services

### Fase 3: UI Components (2 semanas)
- [ ] Diseñar y implementar RecipeBuilder unificado
  - [ ] RecipeBuilderProvider (context)
  - [ ] BasicInfo section
  - [ ] InputsEditor section
  - [ ] OutputConfig section
  - [ ] CostSummary section
  - [ ] AdvancedOptions section
- [ ] Implementar RecipeList
- [ ] Implementar RecipeView
- [ ] Tests de componentes

### Fase 4: Integraciones (1 semana)
- [ ] Crear manifest.tsx del módulo Recipe
- [ ] Integrar con Materials module (ElaboratedFields)
- [ ] Integrar con Products module (BOM tab)
- [ ] Registrar widgets en Dashboard
- [ ] Tests de integración

### Fase 5: Recipe Workshop (1-2 semanas)
- [ ] Implementar RecipeWorkshop page
- [ ] ScalingTool
- [ ] SubstitutionTool
- [ ] OptimizationTool
- [ ] ComparisonTool
- [ ] Tests E2E del workshop

### Fase 6: Cleanup (3-5 días)
- [ ] Eliminar código legacy:
  - [ ] RecipeAPI.ts
  - [ ] RecipeForm.tsx (viejo)
  - [ ] RecipeFormClean.tsx
  - [ ] RecipeBuilderLite.tsx
  - [ ] RecipeBuilderClean.tsx
  - [ ] Tipos lazy-loaded no usados
- [ ] Actualizar imports en todo el codebase
- [ ] Documentación final
- [ ] Migration guide (si aplica a futuro)

### Fase 7: Refinamiento (Continuo)
- [ ] Implementar features avanzadas opcionales:
  - [ ] Nutrition tracking (si se requiere)
  - [ ] AI suggestions reales (no mock)
  - [ ] Supplier integration
  - [ ] Production scheduling
- [ ] Optimizaciones de performance
- [ ] Mejoras de UX basadas en feedback

---

## 📊 MÉTRICAS DE ÉXITO

### KPIs de Implementación
- [ ] 100% de componentes duplicados eliminados
- [ ] 0 líneas de código legacy
- [ ] >80% cobertura de tests
- [ ] <200ms tiempo de render de RecipeBuilder
- [ ] 100% de integraciones funcionando

### KPIs de Uso (Post-implementación)
- Número de recetas creadas
- Tiempo promedio de creación de receta
- % de recetas con costo calculado
- % de productos con BOM definido
- % de materiales elaborados con receta
- Uso del Recipe Workshop

---

## 🎓 DECISIONES ARQUITECTÓNICAS

### 1. ¿Por qué un módulo separado?
**Decisión**: Recipe es un módulo independiente en `/src/modules/recipe`

**Razones**:
- Es una funcionalidad transversal usada por Materials, Products, Services
- Tiene su propia lógica de negocio compleja (costing, analytics, execution)
- Merece su propia UI (RecipeWorkshop)
- Sigue el patrón de módulos del proyecto

### 2. ¿Por qué tipos genéricos?
**Decisión**: `Recipe<TInput, TOutput>` con genéricos

**Razones**:
- Reutilización máxima del código
- Type-safety para diferentes casos de uso
- Flexibilidad para nuevos tipos en el futuro
- No limita Recipe a solo comida

### 3. ¿Por qué un solo RecipeBuilder?
**Decisión**: Componente unificado con props configurables

**Razones**:
- Elimina duplicación de 4 componentes
- Mantenimiento más simple
- Comportamiento consistente
- Flexibilidad mediante props

### 4. ¿Por qué Decimal.js en engine?
**Decisión**: Usar Decimal.js para cálculos financieros

**Razones**:
- Precisión decimal necesaria para money
- Evita errores de redondeo de float
- Compatible con el resto del codebase (DecimalUtils)

### 5. ¿Por qué Recipe Workshop?
**Decisión**: Crear interfaz dedicada para experimentación

**Razones**:
- Mejora UX para chefs/managers
- Herramientas avanzadas no necesarias en forms básicos
- Diferenciador de producto
- Valor agregado para usuarios power

---

## 📚 PRÓXIMOS PASOS

1. **Revisar y aprobar este diseño**
   - ¿Está alineado con la visión del proyecto?
   - ¿Hay algo que falta?
   - ¿Hay algo que sobra?

2. **Ajustar según feedback**

3. **Crear plan de implementación detallado**
   - Tickets/tasks específicos
   - Estimaciones de tiempo
   - Dependencias entre tasks

4. **Comenzar implementación Fase 1**

---

**Nota**: Este documento define la arquitectura "definitiva" sin considerar retrocompatibilidad. Está diseñado para un sistema en desarrollo sin datos de producción, permitiendo breaking changes completos.
