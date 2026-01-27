# MAPEO DEL ESTADO ACTUAL: SISTEMA DE RECIPE

> **Fecha**: 2025-12-23
> **Propósito**: Documentar el estado actual del sistema Recipe antes del rediseño arquitectónico
> **Contexto**: Sistema en desarrollo sin datos de producción, breaking changes permitidos

---

## 📊 RESUMEN EJECUTIVO

**Total de archivos**: 29 archivos TypeScript/TSX
**Líneas de código**: ~2,400 LOC (excluyendo tests/mocks)
**Ubicación actual**: Distribuido entre `/services/recipe`, `/shared/components/recipe`, `/pages/admin/core/dashboard`
**Estado**: Funcional pero con duplicación y gaps de arquitectura

---

## 📁 ESTRUCTURA ACTUAL

```
src/
├── services/recipe/                          [CORE SERVICE LAYER]
│   ├── types/
│   │   ├── core.ts                          ✅ 358 líneas - Tipos principales
│   │   ├── index.ts                         ✅ Export dinámico
│   │   ├── menu-engineering.ts              ⚠️ Lazy-loaded pero NO USADO
│   │   ├── nutrition.ts                     ⚠️ Lazy-loaded pero NO USADO
│   │   ├── production.ts                    ⚠️ Lazy-loaded pero NO USADO
│   │   └── supplier.ts                      ⚠️ Lazy-loaded pero NO USADO
│   │
│   ├── api/
│   │   ├── recipeApi.ts                     ✅ Modern API - 377 líneas
│   │   └── recipeApi.test.ts                ✅ Tests
│   │
│   ├── engines/
│   │   ├── costCalculationEngine.ts         ✅ Smart cost calc con Decimal.js
│   │   ├── costCalculationEngine.test.ts    ✅ Tests
│   │   ├── menuEngineeringEngine.ts         ⚠️ Existe pero NO integrado en UI
│   │   └── menuEngineeringEngine.test.ts    ✅ Tests
│   │
│   ├── hooks/
│   │   ├── useRecipes.ts                    ✅ Hook principal
│   │   └── useRecipes.test.ts               ✅ Tests
│   │
│   ├── components/
│   │   ├── RecipeForm/
│   │   │   ├── RecipeForm.tsx               ✅ Forma completa - 523 líneas
│   │   │   └── RecipeForm.mock.ts           ⚠️ Mock data (sugerencias IA)
│   │   ├── RecipeFormClean.tsx              🔄 DUPLICADO - Simplificado
│   │   ├── RecipeListClean.tsx              ✅ Listado con búsqueda
│   │   ├── RecipeList.tsx                   🔄 DUPLICADO - Avanzado
│   │   └── LazyRecipeForm.tsx               ✅ Code-split wrapper
│   │
│   ├── RecipeService.ts                     ✅ Business logic - 234 líneas
│   └── RecipeAPI.ts                         ❌ LEGACY - Eliminar
│
├── shared/components/recipe/                [SHARED UI COMPONENTS]
│   ├── hooks/
│   │   ├── useRecipeAPI.ts                  🔄 Duplica lógica de api/recipeApi
│   │   └── useRecipeBuilder.ts              ✅ Hook reutilizable - 192 líneas
│   ├── RecipeBuilderLite.tsx                🔄 DUPLICADO - 507 líneas
│   ├── RecipeBuilderClean.tsx               🔄 DUPLICADO - 142 líneas
│   └── index.ts
│
└── pages/admin/core/dashboard/components/recipes/
    ├── RecipeIntelligenceDashboard.tsx      ✅ Analytics dashboard
    └── RecipeIntelligenceDashboard.test.tsx ✅ Tests
```

**Leyenda**:
- ✅ Código funcional y útil
- ⚠️ Código existente pero no usado/integrado
- 🔄 Código duplicado
- ❌ Código legacy a eliminar

---

## 🔍 ANÁLISIS DE COMPONENTES

### Duplicación de UI Components

**Problema**: 4 componentes diferentes que hacen cosas similares

| Componente | Líneas | Usado En | Características |
|-----------|--------|----------|----------------|
| **RecipeForm.tsx** | 523 | ¿Ningún lado? | Completo con IA (mock), pestañas, validación |
| **RecipeFormClean.tsx** | ~200 | Materials → Elaborated | Simplificado, sin IA |
| **RecipeBuilderLite.tsx** | 507 | ¿Ningún lado? | Constructor con selector material |
| **RecipeBuilderClean.tsx** | 142 | Materials → Elaborated modal | Toggle form/list, botón "Avanzado" |

**Observación**: Hay mucha lógica duplicada. `RecipeFormClean` y `RecipeBuilderClean` se usan en Materials, pero los otros dos parecen no estar integrados.

---

## 🎯 CASOS DE USO ACTUALES

### Caso 1: Material Elaborado (ELABORATED)
```
Materials Page → Crear Material → Type: ELABORATED
    ↓
MaterialFormModal → ElaboratedFields.tsx
    ↓
RecipeBuilderClean component (toggle form/list)
    ↓
Usuario selecciona ingredientes (materiales)
    ↓
Recipe se crea y vincula: material.recipe_id = recipe.id
    ↓
Material se guarda con referencia a receta
```

**Archivos**:
- `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/ElaboratedFields.tsx`
- `src/shared/components/recipe/RecipeBuilderClean.tsx`

### Caso 2: Producto con BOM/Receta
```
Products Page → (¿No hay integración visible?)
    ↓
RecipeForm.tsx debería usarse aquí, pero NO se encontró referencia
```

**Observación**: El sistema está preparado para productos con recetas, pero la integración en Products page no está clara.

### Caso 3: Analytics de Recetas
```
Dashboard → RecipeIntelligenceDashboard widget
    ↓
Muestra:
- Total recipes
- Average cost
- Average profitability
- Menu health score
- Top 5 performing recipes
```

**Archivos**:
- `src/pages/admin/core/dashboard/components/recipes/RecipeIntelligenceDashboard.tsx`

---

## 🗄️ MODELO DE DATOS

### Tablas

#### `recipes`
```sql
id: UUID PRIMARY KEY
name: VARCHAR
description: TEXT
output_item_id: UUID FK → items
output_quantity: NUMERIC
instructions: TEXT
preparation_time: INTEGER (minutos)
difficulty_level: VARCHAR
recipe_category: VARCHAR
kitchen_station: VARCHAR
base_cost: NUMERIC
labor_cost: NUMERIC
overhead_cost: NUMERIC
packaging_cost: NUMERIC
popularity_score: NUMERIC
nutritional_info: JSONB
allergens: TEXT[]
dietary_tags: TEXT[]
image_url: VARCHAR
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

#### `recipe_ingredients`
```sql
id: UUID PRIMARY KEY
recipe_id: UUID FK → recipes (CASCADE DELETE)
item_id: UUID FK → items
quantity: NUMERIC
unit: VARCHAR
yield_percentage: NUMERIC (0-100)
waste_percentage: NUMERIC (0-100)
unit_cost_override: NUMERIC
conversion_factor: NUMERIC
```

### RPC Functions (Supabase)
```sql
get_recipes_with_costs()                -- Retorna RecipeWithCost[]
calculate_recipe_cost(recipe_id)        -- Retorna total_cost
get_recipe_viability(recipe_id)         -- Retorna RecipeViability
execute_recipe(recipe_id, batches)      -- Ejecuta y registra producción
```

---

## 🔗 INTEGRACIÓN CON MÓDULOS

### Products Module
```typescript
// src/modules/products/manifest.tsx

provide: [
  'products.recipe_costing',           // Hook para cálculo de costo
  'products.availability_updated',
  'dashboard.widgets',
  'materials.row.actions'              // Botón "Check Recipes" en materiales
]

consume: [
  'materials.stock_updated',           // Actualizar disponibilidad
]

// Feature
'products_recipe_management': {
  domain: 'PRODUCTS'
  category: 'conditional'
}
```

**Hook Point en Materials**:
```typescript
// En materials row actions
registry.addAction('materials.row.actions',
  (material) => (
    <Button onClick={() => checkRecipeUsage(material.id)}>
      Recipe Usage
    </Button>
  )
)
```

### Materials Module
```typescript
// src/modules/materials/manifest.tsx

consume: [
  'products.recipe_updated',  // Recalcular requisitos de materiales
]

// En ElaboratedFields.tsx
<RecipeBuilderClean
  mode="material"
  onRecipeCreated={(recipe) => {
    formData.recipe_id = recipe.id
  }}
/>
```

---

## ⚠️ GAPS IDENTIFICADOS

### Gaps Funcionales

1. **❌ No hay validación de sustitución de ingredientes**
   - Las sugerencias de IA son mock data (`RecipeForm.mock.ts`)
   - No se valida disponibilidad en tiempo real

2. **❌ Costos de labor y overhead no son dinámicos**
   - Son valores fijos en createRecipeRequest
   - No están vinculados a configuración real

3. **❌ Menu Engineering no integrado**
   - Engine existe pero no está en UI
   - No hay cálculo de popularidad/rentabilidad real

4. **❌ Nutrición no implementada**
   - Tipos existen (`nutrition.ts`) pero nunca se usan
   - No hay validación de alérgenos real

5. **❌ Production tracking no implementado**
   - Tipos existen (`production.ts`) pero nunca se usan
   - `execute_recipe` RPC existe pero no se llama desde UI

### Gaps de Arquitectura

1. **🔄 Duplicación masiva de componentes**
   - 4 componentes diferentes (Form, FormClean, BuilderLite, BuilderClean)
   - Mucha lógica repetida

2. **📦 No es un módulo formal**
   - Esparcido entre `/services`, `/shared`, `/pages`
   - No sigue el patrón de módulos del proyecto

3. **🗑️ Código muerto**
   - `RecipeAPI.ts` (legacy)
   - Tipos lazy-loaded nunca importados
   - Componentes no usados en producción

4. **❓ Integración incompleta con Products**
   - No se ve dónde se usa RecipeForm para productos
   - Feature `products_recipe_management` existe pero implementación no clara

### Gaps de Testing

1. **Tests solo en 3 archivos**:
   - `recipeApi.test.ts`
   - `useRecipes.test.ts`
   - `RecipeIntelligenceDashboard.test.tsx`
   - `costCalculationEngine.test.ts`
   - `menuEngineeringEngine.test.ts`

2. **❌ No hay tests de integración**
   - Material + Recipe
   - Product + Recipe
   - EventBus + Recipe

---

## 💡 OPORTUNIDADES DE MEJORA

### Consolidación de Código

**Eliminar duplicación**:
- Unificar 4 componentes en 1 solo `RecipeBuilder` con props configurables
- Eliminar `RecipeAPI.ts` (legacy)
- Eliminar tipos no usados (o implementarlos)

**Crear módulo formal**:
```
src/modules/recipe/
├── manifest.tsx              # Module registration
├── types/
│   └── index.ts             # Solo tipos usados
├── hooks/
│   ├── useRecipes.ts
│   └── useRecipeCosts.ts
├── services/
│   ├── recipeApi.ts
│   ├── recipeService.ts
│   └── costEngine.ts
├── components/
│   ├── RecipeBuilder.tsx    # Componente unificado
│   ├── RecipeList.tsx
│   └── RecipeDashboard.tsx
└── README.md
```

### Abstracción para Reutilización

**Recipe no es solo para comida**:
- También se aplica a:
  - Servicios con materiales (ej: limpieza con productos)
  - Procedimientos con assets (ej: mantenimiento)
  - Kits de productos (ej: combo de ventas)

**Diseño abstracto**:
```typescript
interface Recipe<TInput = Item, TOutput = Item> {
  id: string
  name: string
  outputItem: TOutput        // Qué produce
  outputQuantity: number
  inputs: RecipeInput<TInput>[]  // Qué consume
  // ... resto
}

interface RecipeInput<T = Item> {
  item: T
  quantity: number
  unit: string
  // ... resto
}
```

Esto permite:
- `Recipe<Material, Material>` → Material elaborado
- `Recipe<Material, Product>` → Producto físico
- `Recipe<Product, Product>` → Kit de productos
- `Recipe<Asset | Material, Service>` → Servicio con recursos

---

## 📊 MATRIZ DE ARCHIVOS

### Código a MANTENER y MEJORAR

| Archivo | Ubicación | Propósito | Acción |
|---------|-----------|----------|--------|
| `core.ts` | types/ | Tipos principales | ✅ Mantener, refinar |
| `recipeApi.ts` | api/ | API moderna | ✅ Mantener |
| `costCalculationEngine.ts` | engines/ | Cálculo de costos | ✅ Mantener |
| `menuEngineeringEngine.ts` | engines/ | Menu engineering | ✅ Integrar en UI |
| `useRecipes.ts` | hooks/ | Hook principal | ✅ Mantener, expandir |
| `RecipeService.ts` | / | Business logic | ✅ Mantener, expandir |

### Código a CONSOLIDAR

| Archivo | Acción | Razón |
|---------|--------|-------|
| RecipeForm.tsx | Unificar | Parte del componente unificado |
| RecipeFormClean.tsx | Unificar | Parte del componente unificado |
| RecipeBuilderLite.tsx | Unificar | Parte del componente unificado |
| RecipeBuilderClean.tsx | Unificar | Parte del componente unificado |
| RecipeList.tsx | Unificar | Parte del componente unificado |
| RecipeListClean.tsx | Unificar | Parte del componente unificado |

### Código a ELIMINAR

| Archivo | Razón |
|---------|-------|
| RecipeAPI.ts | Legacy, reemplazado por api/recipeApi.ts |
| nutrition.ts | Lazy-loaded pero nunca usado |
| production.ts | Lazy-loaded pero nunca usado |
| supplier.ts | Lazy-loaded pero nunca usado |
| menu-engineering.ts | Lazy-loaded pero nunca usado (mover a core si se usa) |
| RecipeForm.mock.ts | Mock data de IA, implementar real o eliminar |
| useRecipeAPI.ts | Duplica api/recipeApi.ts |

---

## 🎯 CASOS DE USO A SOPORTAR

### 1. Material Elaborado
**Quién**: Usuario creando material tipo ELABORATED
**Qué**: Definir receta con ingredientes (materiales)
**Dónde**: Materials page → Modal de creación
**Cómo**: RecipeBuilder en modo "material"

### 2. Producto con BOM
**Quién**: Usuario creando producto físico
**Qué**: Definir Bill of Materials (lista de componentes)
**Dónde**: Products page → Modal/Form de producto
**Cómo**: RecipeBuilder en modo "product"

### 3. Kit de Productos
**Quién**: Usuario creando combo/bundle
**Qué**: Agrupar productos existentes en un kit
**Dónde**: Products page
**Cómo**: RecipeBuilder con inputs = productos

### 4. Servicio con Materiales
**Quién**: Usuario definiendo servicio que consume materiales
**Qué**: Especificar materiales necesarios para servicio
**Dónde**: Services/Scheduling page
**Cómo**: RecipeBuilder en modo "service"

### 5. Análisis de Costos
**Quién**: Manager/Admin viendo analytics
**Qué**: Ver costos, rentabilidad, viabilidad de recetas
**Dónde**: Dashboard → Recipe Intelligence widget
**Cómo**: RecipeDashboard component

### 6. Recipe Workshop (Nuevo)
**Quién**: Chef/Manager experimentando con recetas
**Qué**: Probar variaciones, scaling, sustituciones, optimización
**Dónde**: Página dedicada `/recipes` o `/recipe-workshop`
**Cómo**: Interfaz completa con herramientas avanzadas

---

## 🔧 TECNOLOGÍAS Y DEPENDENCIAS

```typescript
// Dependencias actuales
{
  "supabase": "API calls, RPC functions",
  "Decimal.js": "Precisión financiera en cálculos",
  "Chakra UI": "Componentes de UI",
  "@tanstack/react-query": "Data fetching (usado en useRecipes)",
  "@heroicons/react": "Iconos",
  "EventBus": "Comunicación inter-módulos",
  "DecimalUtils": "Utilidades de precisión (@/business-logic/shared)",
  "Logger": "Logging"
}
```

---

## 📝 CONCLUSIONES

### ✅ Fortalezas
1. Arquitectura de capas clara (API → Service → Hook → Component)
2. Separación de concerns bien definida
3. Integración con sistema de capabilities
4. Precisión decimal en cálculos financieros
5. Tests en componentes críticos

### ⚠️ Debilidades
1. **Duplicación masiva** de componentes UI (4 builders, 2 lists, 2 forms)
2. **No es un módulo formal** - esparcido en 3 ubicaciones
3. **Código muerto** - tipos, componentes, API legacy no usados
4. **Integración incompleta** - Products no tiene UI clara para recipes
5. **Features no implementadas** - Nutrition, Production, Menu Engineering en UI

### 🎯 Próximos Pasos
1. **Definir arquitectura definitiva** (sin retrocompatibilidad)
2. **Diseñar interfaces y tipos** unificados y abstractos
3. **Consolidar componentes** en RecipeBuilder unificado
4. **Crear Recipe Module** siguiendo patrón del proyecto
5. **Implementar Recipe Workshop** para gestión avanzada
6. **Integrar con Products** de forma clara y explícita

---

**Nota**: Este documento refleja el estado al 23 de diciembre de 2025. El sistema está en desarrollo activo sin datos de producción, permitiendo breaking changes y refactorización completa.
