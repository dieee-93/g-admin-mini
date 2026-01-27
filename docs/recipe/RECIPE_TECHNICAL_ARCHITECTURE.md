# ARQUITECTURA TÉCNICA DEFINITIVA: Sistema de Recetas
> **Versión**: 1.0.0
> **Fecha**: 2026-01-06
> **Status**: 🎯 **ARQUITECTURA APROBADA** - Listo para implementación

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Industry Standards & Best Practices](#industry-standards--best-practices)
3. [Arquitectura de Base de Datos](#arquitectura-de-base-de-datos)
4. [Reglas de Negocio Técnicas](#reglas-de-negocio-técnicas)
5. [Cálculos y Fórmulas](#cálculos-y-fórmulas)
6. [Validaciones y Constraints](#validaciones-y-constraints)
7. [Arquitectura de Componentes](#arquitectura-de-componentes)
8. [Plan de Migración](#plan-de-migración)
9. [Testing Strategy](#testing-strategy)
10. [Performance Considerations](#performance-considerations)

---

## 🎯 RESUMEN EJECUTIVO

### Objetivo
Diseñar e implementar un sistema de recetas robusto, escalable y preciso que:
- Soporte múltiples contextos (Materials, Products, Services)
- Permita encapsulamiento (productos con productos)
- Calcule costos automáticamente con precisión contable
- Prevenga errores y circularidades
- Sea extensible para futuras features

### Decisiones Arquitectónicas Clave

| Decisión | Opción Elegida | Razón |
|----------|----------------|-------|
| **Schema de DB** | Foreign Keys explícitas (no polymorphic) | Integridad referencial garantizada por DB |
| **Output Type** | Heredar dinámicamente del padre | Previene inconsistencias |
| **Yield/Waste** | Solo Waste% en MVP | Más común y simple |
| **Encapsulamiento** | Máximo 3 niveles | Balance entre flexibilidad y complejidad |
| **Circularidad** | Validación en frontend + backend | Doble capa de seguridad |
| **Scaling** | Solo en Workshop (no Lite) | Reduce confusión y complejidad |
| **Assets** | Post-MVP | Requiere modelo de costos diferente |
| **Versionado** | Soft delete + version tracking | Permite historial y rollback |

---

## 📚 INDUSTRY STANDARDS & BEST PRACTICES

### 1. Bill of Materials (BOM) Standards

Según investigación de **ERP systems** (SAP, Oracle, Odoo, ERPNext):

#### Standard BOM Structure
```
BOM Header (Qué se produce)
├── BOM ID
├── Product ID (qué produce)
├── Version number
├── Effective/Expiration dates
├── Quantity produced
├── Status (active/inactive)
└── BOM Type (manufacturing/recipe/service)

BOM Lines (Qué se consume)
├── Line number (orden)
├── Component ID (qué consume)
├── Quantity required
├── Unit of measure
├── Scrap factor (% desperdicio esperado)
├── Lead time offset (opcional)
└── Phantom flag (sub-assembly)
```

#### Industry Standard: Scrap Factor vs Yield

**Según documentación de SAP y Oracle:**

```sql
-- SCRAP FACTOR (Industry Standard)
-- Representa el % de desperdicio ESPERADO en producción normal

-- Ejemplo: Scrap factor = 10%
-- Para producir 100 unidades finales:
required_quantity = output_quantity / (1 - scrap_factor)
required_quantity = 100 / (1 - 0.10) = 111.11 unidades

-- El sistema automáticamente pide 11.11 unidades extra para compensar
```

**Conclusión**: El término correcto es **Scrap Factor** (no "waste%"). Representa el desperdicio esperado y se aplica al calcular cantidades de compra.

### 2. Recipe Costing Standards (Gastronomía)

Según **National Restaurant Association (NRA)** y libros de contabilidad gastronómica:

#### Standardized Recipe Components
```
1. Recipe Header
   - Name, description
   - Category (appetizer, main, dessert, etc.)
   - Difficulty level
   - Total time (prep + cooking)

2. Ingredients List
   - Ingredient name
   - Quantity (precise decimal)
   - Unit of measure
   - Preparation method (chopped, diced, etc.)

3. Output/Yield
   - Number of portions
   - Portion size
   - Total yield

4. Cost Calculation
   - Ingredient cost (per ingredient)
   - Total recipe cost
   - Cost per portion
   - Suggested selling price (based on target food cost %)

5. Instructions (optional)
   - Step-by-step procedure
   - Equipment needed
   - Cooking temperatures/times
```

#### Food Cost Calculation Standard

```javascript
// INDUSTRY STANDARD FORMULAS

// 1. Portion Cost
portion_cost = total_recipe_cost / number_of_portions

// 2. Target Selling Price (from food cost %)
selling_price = portion_cost / target_food_cost_percentage
// Example: $5 portion cost, 30% target = $5 / 0.30 = $16.67

// 3. Actual Food Cost %
food_cost_percentage = (cost_of_food_sold / food_sales) × 100

// 4. Theoretical Food Cost (what it SHOULD be)
theoretical_food_cost = Σ(portion_cost × quantity_sold) for all items

// 5. Food Cost Variance (operational efficiency)
variance = actual_food_cost - theoretical_food_cost
```

### 3. Yield Analysis (AS-PURCHASED vs AS-SERVED)

**Industry Standard** según **Culinary Institute of America**:

```
AP (As-Purchased) = Peso comprado del proveedor
EP (Edible Portion / As-Served) = Peso utilizable después de preparación

Yield % = (EP Weight / AP Weight) × 100

Waste % = 100% - Yield %

AP Weight Required = EP Weight Needed / Yield %
```

**Ejemplo Real:**
```
Producto: Lomo de res
AP Weight: 5 kg @ $25/kg = $125 total
Después de limpiar grasa y tendones: 4.2 kg (EP)

Yield % = (4.2 / 5.0) × 100 = 84%
Waste % = 16%

Costo real por kg EP = $125 / 4.2 kg = $29.76/kg
                       (vs $25/kg AP - 19% más alto)

CRÍTICO: Debes usar el costo EP en recetas, no el costo AP
```

### 4. Encapsulamiento y Phantom BOMs

**SAP Standard**: "Phantom BOM" o "Sub-assembly"

```
Producto Final: Combo Hamburguesa
├── Hamburguesa Premium (sub-product)
│   ├── Pan (material)
│   ├── Carne (material)
│   ├── Queso (material)
│   └── Vegetales (material)
├── Papas Fritas (sub-product)
│   ├── Papas (material)
│   └── Aceite (material)
└── Bebida (product)
```

**Regla de Costeo:**
```javascript
// NO recalcular ingredientes de sub-productos
// Usar el costo final del sub-producto

combo_cost = hamburguesa.final_cost + papas.final_cost + bebida.final_cost

// NO hacer:
// combo_cost = sum(all ingredients recursively) ❌
```

**Maximum Depth Standard:**
- **SAP/Oracle**: Generalmente 5-10 niveles
- **Odoo**: Sin límite técnico, pero recomiendan 3-5
- **ERPNext**: 5 niveles por defecto
- **Nuestra decisión**: **3 niveles** (balance entre flexibilidad y complejidad)

### 5. Circular Dependency Prevention

**Industry Standard** (de SAP, Oracle):

```sql
-- Approach 1: Recursive CTE para detectar ciclos
WITH RECURSIVE bom_tree AS (
  -- Base case
  SELECT
    product_id,
    component_id,
    1 as level,
    ARRAY[product_id] as path
  FROM bom_lines
  WHERE product_id = :start_product_id

  UNION ALL

  -- Recursive case
  SELECT
    bl.product_id,
    bl.component_id,
    bt.level + 1,
    bt.path || bl.product_id
  FROM bom_lines bl
  INNER JOIN bom_tree bt ON bl.product_id = bt.component_id
  WHERE NOT (bl.product_id = ANY(bt.path))  -- Previene ciclos
    AND bt.level < 10  -- Max depth
)
SELECT * FROM bom_tree;
```

**Frontend Validation:**
```typescript
function validateCircularDependency(
  productId: string,
  inputs: RecipeInput[]
): boolean {
  const visited = new Set<string>();

  function checkCircular(id: string, depth: number): boolean {
    if (depth > MAX_DEPTH) return false; // Exceeded max depth
    if (visited.has(id)) return false; // Circular dependency detected

    visited.add(id);

    // Check all sub-products recursively
    const product = getProductById(id);
    if (product?.recipe?.inputs) {
      for (const input of product.recipe.inputs) {
        if (input.itemType === 'product') {
          if (!checkCircular(input.itemId, depth + 1)) {
            return false;
          }
        }
      }
    }

    visited.delete(id); // Backtrack
    return true;
  }

  return checkCircular(productId, 0);
}
```

---

## 🗄️ ARQUITECTURA DE BASE DE DATOS

### Schema Definitivo (PostgreSQL/Supabase)

#### Opción A: Polymorphic con JSONB (Flexible pero menos seguro)
```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Metadata
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('material', 'product', 'service')),
  execution_mode TEXT NOT NULL CHECK (execution_mode IN ('immediate', 'on_demand')),

  -- Output (polymorphic)
  output_item_id UUID NOT NULL,
  output_item_type TEXT NOT NULL CHECK (output_item_type IN ('material', 'product', 'service')),
  output_quantity DECIMAL(15,6) NOT NULL,
  output_unit TEXT NOT NULL,

  -- Yield/Waste
  scrap_factor DECIMAL(5,2) DEFAULT 0, -- % esperado de desperdicio (0-99.99)

  -- Versioning
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ -- Soft delete
);
```

#### Opción B: Foreign Keys Explícitas (Recomendada - Industry Standard)
```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Metadata
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('material', 'product', 'service')),
  execution_mode TEXT NOT NULL CHECK (execution_mode IN ('immediate', 'on_demand')),

  -- Output (explicit FKs)
  output_material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  output_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  output_service_id UUID REFERENCES services(id) ON DELETE CASCADE,

  output_quantity DECIMAL(15,6) NOT NULL,
  output_unit TEXT NOT NULL,

  -- Constraint: Solo UNO debe estar poblado
  CONSTRAINT check_single_output CHECK (
    (output_material_id IS NOT NULL AND output_product_id IS NULL AND output_service_id IS NULL) OR
    (output_material_id IS NULL AND output_product_id IS NOT NULL AND output_service_id IS NULL) OR
    (output_material_id IS NULL AND output_product_id IS NULL AND output_service_id IS NOT NULL)
  ),

  -- Yield/Waste
  scrap_factor DECIMAL(5,2) DEFAULT 0 CHECK (scrap_factor >= 0 AND scrap_factor < 100),

  -- Instructions (opcional)
  instructions JSONB, -- Array de steps
  preparation_time INTEGER, -- minutos
  cooking_time INTEGER, -- minutos

  -- Versioning
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  effective_date TIMESTAMPTZ DEFAULT NOW(),
  expiration_date TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Índices
CREATE INDEX idx_recipes_material ON recipes(output_material_id) WHERE output_material_id IS NOT NULL;
CREATE INDEX idx_recipes_product ON recipes(output_product_id) WHERE output_product_id IS NOT NULL;
CREATE INDEX idx_recipes_service ON recipes(output_service_id) WHERE output_service_id IS NOT NULL;
CREATE INDEX idx_recipes_active ON recipes(is_active, deleted_at) WHERE deleted_at IS NULL;
```

**DECISIÓN: Usar Opción B (FKs Explícitas)**
- ✅ Integridad referencial garantizada por PostgreSQL
- ✅ Previene FK inválidas
- ✅ Queries más simples y rápidas
- ✅ Industry standard (SAP, Oracle, Odoo)
- ❌ Más columnas (pero aceptable)

#### Tabla: recipe_inputs

```sql
CREATE TABLE recipe_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,

  -- Input (polymorphic - materials, products, assets)
  input_material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  input_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  input_asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,

  -- Constraint: Solo UNO debe estar poblado
  CONSTRAINT check_single_input CHECK (
    (input_material_id IS NOT NULL AND input_product_id IS NULL AND input_asset_id IS NULL) OR
    (input_material_id IS NULL AND input_product_id IS NOT NULL AND input_asset_id IS NULL) OR
    (input_material_id IS NULL AND input_product_id IS NULL AND input_asset_id IS NOT NULL)
  ),

  -- Cantidad
  quantity DECIMAL(15,6) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,

  -- Scrap factor por input (opcional, override global)
  scrap_factor DECIMAL(5,2) CHECK (scrap_factor >= 0 AND scrap_factor < 100),

  -- Opcionalidad
  is_optional BOOLEAN DEFAULT FALSE,
  substitute_for_input_id UUID REFERENCES recipe_inputs(id),

  -- Cost override (para casos especiales)
  unit_cost_override DECIMAL(15,2),

  -- Ordenamiento
  display_order INTEGER DEFAULT 0,
  stage INTEGER, -- Para recetas multi-etapa
  stage_name TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: No duplicar inputs en misma receta
  UNIQUE(recipe_id, input_material_id, input_product_id, input_asset_id)
);

-- Índices
CREATE INDEX idx_recipe_inputs_recipe ON recipe_inputs(recipe_id);
CREATE INDEX idx_recipe_inputs_material ON recipe_inputs(input_material_id) WHERE input_material_id IS NOT NULL;
CREATE INDEX idx_recipe_inputs_product ON recipe_inputs(input_product_id) WHERE input_product_id IS NOT NULL;
CREATE INDEX idx_recipe_inputs_asset ON recipe_inputs(input_asset_id) WHERE input_asset_id IS NOT NULL;
```

#### Modificaciones a Tablas Existentes

```sql
-- Agregar recipe_id a materials
ALTER TABLE materials
ADD COLUMN recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL;

CREATE INDEX idx_materials_recipe ON materials(recipe_id) WHERE recipe_id IS NOT NULL;

-- Agregar recipe_id a products
ALTER TABLE products
ADD COLUMN recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL;

CREATE INDEX idx_products_recipe ON products(recipe_id) WHERE recipe_id IS NOT NULL;

-- Agregar recipe_id a services (si existe la tabla)
ALTER TABLE services
ADD COLUMN recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL;

CREATE INDEX idx_services_recipe ON services(recipe_id) WHERE recipe_id IS NOT NULL;
```

### Database Functions (Helper Functions)

```sql
-- Función: Obtener costo total de una receta (recursiva)
CREATE OR REPLACE FUNCTION calculate_recipe_cost(p_recipe_id UUID)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  v_total_cost DECIMAL(15,2) := 0;
  v_input RECORD;
  v_unit_cost DECIMAL(15,2);
  v_adjusted_quantity DECIMAL(15,6);
BEGIN
  -- Iterar sobre todos los inputs
  FOR v_input IN
    SELECT
      ri.*,
      COALESCE(m.id, p.id, a.id) as item_id,
      COALESCE(m.cost_per_unit, p.unit_cost, a.cost_per_hour) as cost
    FROM recipe_inputs ri
    LEFT JOIN materials m ON ri.input_material_id = m.id
    LEFT JOIN products p ON ri.input_product_id = p.id
    LEFT JOIN assets a ON ri.input_asset_id = a.id
    WHERE ri.recipe_id = p_recipe_id
  LOOP
    -- Determinar costo unitario
    IF v_input.unit_cost_override IS NOT NULL THEN
      v_unit_cost := v_input.unit_cost_override;
    ELSE
      v_unit_cost := v_input.cost;
    END IF;

    -- Ajustar cantidad por scrap factor
    v_adjusted_quantity := v_input.quantity;
    IF v_input.scrap_factor IS NOT NULL AND v_input.scrap_factor > 0 THEN
      v_adjusted_quantity := v_input.quantity / (1 - v_input.scrap_factor / 100);
    END IF;

    -- Sumar al costo total
    v_total_cost := v_total_cost + (v_unit_cost * v_adjusted_quantity);
  END LOOP;

  RETURN v_total_cost;
END;
$$ LANGUAGE plpgsql;

-- Función: Validar circularidad en BOM
CREATE OR REPLACE FUNCTION check_circular_dependency(
  p_product_id UUID,
  p_input_product_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_circular BOOLEAN;
BEGIN
  -- Usar CTE recursivo para detectar ciclos
  WITH RECURSIVE product_tree AS (
    -- Base case: el producto que queremos agregar
    SELECT
      p_input_product_id as product_id,
      1 as level,
      ARRAY[p_input_product_id] as path

    UNION ALL

    -- Recursive case: navegar por sub-productos
    SELECT
      ri.input_product_id,
      pt.level + 1,
      pt.path || ri.input_product_id
    FROM product_tree pt
    INNER JOIN recipes r ON r.output_product_id = pt.product_id
    INNER JOIN recipe_inputs ri ON ri.recipe_id = r.id
    WHERE ri.input_product_id IS NOT NULL
      AND NOT (ri.input_product_id = ANY(pt.path))
      AND pt.level < 10  -- Max depth
  )
  SELECT EXISTS (
    SELECT 1 FROM product_tree
    WHERE product_id = p_product_id
  ) INTO v_circular;

  RETURN v_circular;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Validar circular dependency antes de insert
CREATE OR REPLACE FUNCTION validate_recipe_input()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo validar si es un producto
  IF NEW.input_product_id IS NOT NULL THEN
    -- Obtener el product_id del recipe
    DECLARE
      v_output_product_id UUID;
    BEGIN
      SELECT output_product_id INTO v_output_product_id
      FROM recipes
      WHERE id = NEW.recipe_id;

      -- Verificar circularidad
      IF v_output_product_id IS NOT NULL AND
         check_circular_dependency(v_output_product_id, NEW.input_product_id) THEN
        RAISE EXCEPTION 'Circular dependency detected: Product cannot contain itself';
      END IF;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipe_input_validation
  BEFORE INSERT OR UPDATE ON recipe_inputs
  FOR EACH ROW
  EXECUTE FUNCTION validate_recipe_input();
```

---

## 📐 REGLAS DE NEGOCIO TÉCNICAS

### 1. Tipos de Inputs Permitidos por Contexto

```typescript
// Validación en TypeScript (frontend + backend)

type RecipeContext = 'material' | 'product' | 'service' | 'workshop';
type InputType = 'material' | 'product' | 'asset';

const ALLOWED_INPUTS: Record<RecipeContext, InputType[]> = {
  material: ['material'],           // Solo materiales
  product: ['material', 'product'], // Materiales + productos
  service: ['material', 'asset'],   // Materiales + assets (Post-MVP)
  workshop: ['material', 'product', 'asset'] // Todos (según receta original)
};

function validateInputType(
  context: RecipeContext,
  inputType: InputType
): boolean {
  return ALLOWED_INPUTS[context].includes(inputType);
}

// Ejemplo de uso
validateInputType('material', 'product'); // false
validateInputType('product', 'product'); // true
```

### 2. Execution Mode (Consumo de Stock)

```typescript
interface RecipeExecutionRule {
  entityType: 'material' | 'product' | 'service';
  executionMode: 'immediate' | 'on_demand';
  stockConsumedAt: string;
}

const EXECUTION_RULES: RecipeExecutionRule[] = [
  {
    entityType: 'material',
    executionMode: 'immediate',
    stockConsumedAt: 'Al producir/elaborar el material'
  },
  {
    entityType: 'product',
    executionMode: 'on_demand',
    stockConsumedAt: 'Al vender el producto'
  },
  {
    entityType: 'service',
    executionMode: 'on_demand',
    stockConsumedAt: 'Al ejecutar el servicio'
  }
];

// Validación automática
function getExecutionMode(entityType: string): 'immediate' | 'on_demand' {
  const rule = EXECUTION_RULES.find(r => r.entityType === entityType);
  if (!rule) throw new Error(`Unknown entity type: ${entityType}`);
  return rule.executionMode;
}
```

### 3. Validación de Profundidad de Encapsulamiento

```typescript
const MAX_BOM_DEPTH = 3;

async function validateBOMDepth(
  productId: string,
  currentDepth: number = 0
): Promise<boolean> {
  if (currentDepth > MAX_BOM_DEPTH) {
    throw new Error(`Maximum BOM depth (${MAX_BOM_DEPTH}) exceeded`);
  }

  // Obtener recipe del producto
  const recipe = await getRecipeByProductId(productId);
  if (!recipe) return true; // No tiene recipe, ok

  // Verificar todos los sub-productos
  const productInputs = recipe.inputs.filter(i => i.itemType === 'product');

  for (const input of productInputs) {
    await validateBOMDepth(input.itemId, currentDepth + 1);
  }

  return true;
}
```

### 4. Output Type (Heredar del Padre)

```typescript
// NO guardar output_unit en recipe, heredar dinámicamente

function getOutputUnit(recipe: Recipe): string {
  switch (recipe.entityType) {
    case 'material':
      const material = getMaterialById(recipe.outputMaterialId);
      return material.baseUnit; // 'kg', 'l', 'unit', etc.

    case 'product':
      const product = getProductById(recipe.outputProductId);
      return product.unit; // 'unit', 'portion', etc.

    case 'service':
      const service = getServiceById(recipe.outputServiceId);
      return service.unit; // 'hour', 'session', etc.

    default:
      return 'unit';
  }
}

// En el schema, NO incluir output_unit como columna persistida
// Solo output_quantity (el número)
```

---

## 🧮 CÁLCULOS Y FÓRMULAS

### 1. Cálculo de Costos (Standard Industry Formula)

```typescript
interface CostBreakdown {
  materialsCost: number;
  laborCost: number;
  overheadCost: number;
  packagingCost: number;
  totalCost: number;
  costPerUnit: number;
}

async function calculateRecipeCost(
  recipe: Recipe,
  options?: CostOptions
): Promise<CostBreakdown> {
  let materialsCost = 0;

  // 1. Calcular costo de materiales/inputs
  for (const input of recipe.inputs) {
    const unitCost = await getInputUnitCost(input);

    // Ajustar cantidad por scrap factor
    let adjustedQuantity = input.quantity;
    const scrapFactor = input.scrapFactor ?? recipe.scrapFactor ?? 0;

    if (scrapFactor > 0) {
      // Fórmula industry standard
      adjustedQuantity = input.quantity / (1 - scrapFactor / 100);
    }

    materialsCost += unitCost * adjustedQuantity;
  }

  // 2. Calcular labor cost (opcional)
  let laborCost = 0;
  if (options?.includeLabor && recipe.costConfig?.laborHours) {
    const laborRate = recipe.costConfig.laborCostPerHour ?? DEFAULT_LABOR_RATE;
    const prepTime = (recipe.preparationTime ?? 0) / 60; // minutos a horas
    const cookTime = (recipe.cookingTime ?? 0) / 60;
    laborCost = (prepTime + cookTime) * laborRate;
  }

  // 3. Calcular overhead (opcional)
  let overheadCost = 0;
  if (options?.includeOverhead && recipe.costConfig?.overheadPercentage) {
    overheadCost = materialsCost * (recipe.costConfig.overheadPercentage / 100);
  }

  // 4. Packaging cost (opcional)
  const packagingCost = recipe.costConfig?.packagingCost ?? 0;

  // 5. Total cost
  const totalCost = materialsCost + laborCost + overheadCost + packagingCost;

  // 6. Cost per unit
  const costPerUnit = totalCost / recipe.output.quantity;

  return {
    materialsCost,
    laborCost,
    overheadCost,
    packagingCost,
    totalCost,
    costPerUnit
  };
}

// Helper: Obtener costo unitario de un input
async function getInputUnitCost(input: RecipeInput): Promise<number> {
  // 1. Override manual tiene prioridad
  if (input.unitCostOverride) {
    return input.unitCostOverride;
  }

  // 2. Según tipo de input
  if (input.inputMaterialId) {
    const material = await getMaterialById(input.inputMaterialId);
    return material.costPerUnit;
  }

  if (input.inputProductId) {
    const product = await getProductById(input.inputProductId);
    // IMPORTANTE: Usar el costo FINAL del producto (incluye su recipe)
    return product.finalCost ?? product.unitCost;
  }

  if (input.inputAssetId) {
    const asset = await getAssetById(input.inputAssetId);
    // Costo por hora de uso del asset
    return asset.costPerHour;
  }

  return 0;
}
```

### 2. Scrap Factor Application

```typescript
// INDUSTRY STANDARD FORMULA

/**
 * Calcula la cantidad a comprar considerando el scrap factor
 *
 * Fórmula: AP = EP / (1 - scrap_factor)
 *
 * Donde:
 * - AP (As-Purchased): Cantidad a comprar
 * - EP (Edible Portion): Cantidad necesaria en receta
 * - scrap_factor: % de desperdicio esperado (0-99.99)
 *
 * Ejemplo:
 * - Necesito 100g de cebolla picada (EP)
 * - Scrap factor de cebolla: 15% (por pelar y recortar)
 * - AP = 100 / (1 - 0.15) = 117.65g
 * - Debo comprar 117.65g para tener 100g útiles
 */
function calculateAsPurchasedQuantity(
  edibleQuantity: number,
  scrapFactor: number
): number {
  if (scrapFactor < 0 || scrapFactor >= 100) {
    throw new Error('Scrap factor must be between 0 and 99.99');
  }

  if (scrapFactor === 0) {
    return edibleQuantity;
  }

  return edibleQuantity / (1 - scrapFactor / 100);
}

// Ejemplo de uso en recipe costing
const recipeNeedsQuantity = 500; // 500g de papa en la receta
const potatoScrapFactor = 20; // 20% se pierde al pelar

const quantityToPurchase = calculateAsPurchasedQuantity(
  recipeNeedsQuantity,
  potatoScrapFactor
);
// Result: 625g (debo comprar 625g para obtener 500g peladas)

const wastage = quantityToPurchase - recipeNeedsQuantity;
// Result: 125g (se perderán 125g en el pelado)
```

### 3. Target Pricing (Food Cost Method)

```typescript
/**
 * Calcula el precio de venta sugerido basado en target food cost %
 *
 * Formula estándar de la industria gastronómica:
 * Selling Price = Portion Cost / Target Food Cost %
 *
 * Benchmarks de industria:
 * - Fine dining: 25-32%
 * - Casual dining: 28-35%
 * - Fast casual: 30-35%
 * - QSR (Quick Service): 32-38%
 */
interface PricingSuggestion {
  portionCost: number;
  targetFoodCostPercentage: number;
  suggestedSellingPrice: number;
  grossProfitPerPortion: number;
  grossProfitMargin: number;
}

function calculateTargetPrice(
  portionCost: number,
  targetFoodCostPercentage: number
): PricingSuggestion {
  if (targetFoodCostPercentage <= 0 || targetFoodCostPercentage >= 100) {
    throw new Error('Target food cost % must be between 0 and 100');
  }

  const suggestedSellingPrice = portionCost / (targetFoodCostPercentage / 100);
  const grossProfitPerPortion = suggestedSellingPrice - portionCost;
  const grossProfitMargin = (grossProfitPerPortion / suggestedSellingPrice) * 100;

  return {
    portionCost,
    targetFoodCostPercentage,
    suggestedSellingPrice,
    grossProfitPerPortion,
    grossProfitMargin
  };
}

// Ejemplo
const pricing = calculateTargetPrice(5.50, 30);
// {
//   portionCost: 5.50,
//   targetFoodCostPercentage: 30,
//   suggestedSellingPrice: 18.33, // $5.50 / 0.30
//   grossProfitPerPortion: 12.83,
//   grossProfitMargin: 70%
// }
```

---

## ✅ VALIDACIONES Y CONSTRAINTS

### Frontend Validations (Real-time)

```typescript
import { z } from 'zod';

// Schema de validación para crear recipe
const createRecipeSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  entityType: z.enum(['material', 'product', 'service']),

  // Output
  outputQuantity: z.number().positive('Output quantity must be positive'),

  // Inputs
  inputs: z.array(z.object({
    itemId: z.string().uuid('Invalid item ID'),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required'),
    scrapFactor: z.number().min(0).max(99.99).optional(),
  })).min(1, 'At least one input is required'),

  // Scrap factor
  scrapFactor: z.number().min(0).max(99.99).optional(),

  // Timing
  preparationTime: z.number().min(0).optional(),
  cookingTime: z.number().min(0).optional(),
});

// Validación de negocio personalizada
async function validateRecipe(data: unknown): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Validación de schema
  try {
    createRecipeSchema.parse(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      errors.push(...err.errors.map(e => e.message));
      return { isValid: false, errors, warnings };
    }
  }

  const recipe = data as CreateRecipeInput;

  // 2. Validar tipos de inputs según contexto
  for (const input of recipe.inputs) {
    const inputType = await getItemType(input.itemId);
    if (!validateInputType(recipe.entityType, inputType)) {
      errors.push(
        `${inputType} inputs are not allowed in ${recipe.entityType} recipes`
      );
    }
  }

  // 3. Validar circularidad (solo para products)
  if (recipe.entityType === 'product') {
    const productInputs = recipe.inputs.filter(
      i => getItemType(i.itemId) === 'product'
    );

    for (const input of productInputs) {
      const hasCircular = await checkCircularDependency(
        recipe.outputProductId,
        input.itemId
      );

      if (hasCircular) {
        errors.push(
          `Circular dependency: Product cannot contain itself (directly or indirectly)`
        );
      }
    }
  }

  // 4. Validar profundidad de BOM
  if (recipe.entityType === 'product') {
    try {
      await validateBOMDepth(recipe.outputProductId);
    } catch (err) {
      errors.push(err.message);
    }
  }

  // 5. Warnings
  const totalCost = await calculateRecipeCost(recipe);
  if (totalCost.totalCost === 0) {
    warnings.push('Recipe has zero cost - check input costs');
  }

  if (recipe.scrapFactor && recipe.scrapFactor > 50) {
    warnings.push(
      `High scrap factor (${recipe.scrapFactor}%) - verify this is correct`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

### Backend Validations (Database Level)

```sql
-- CHECK Constraints
ALTER TABLE recipes
ADD CONSTRAINT check_output_quantity_positive
CHECK (output_quantity > 0);

ALTER TABLE recipes
ADD CONSTRAINT check_scrap_factor_range
CHECK (scrap_factor >= 0 AND scrap_factor < 100);

ALTER TABLE recipe_inputs
ADD CONSTRAINT check_quantity_positive
CHECK (quantity > 0);

-- Trigger para prevenir soft-deleted recipes
CREATE OR REPLACE FUNCTION prevent_deleted_recipe_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM recipes
    WHERE id = NEW.recipe_id
    AND deleted_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Cannot add inputs to deleted recipe';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipe_input_soft_delete_check
  BEFORE INSERT OR UPDATE ON recipe_inputs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_deleted_recipe_usage();
```

---

## 🏗️ ARQUITECTURA DE COMPONENTES

### Component Hierarchy

```
RecipeManagement/
├── RecipeBuilder (componente principal)
│   ├── RecipeHeader (nombre, descripción - solo Workshop)
│   ├── RecipeInputsEditor (tabla de inputs)
│   │   ├── InputTypeToggle (Material/Product/Asset)
│   │   ├── MaterialSelector (selector de materiales)
│   │   ├── ProductSelector (selector de productos) 🆕
│   │   ├── AssetSelector (selector de assets) 🔮 Post-MVP
│   │   └── InputRow (fila de input con cantidad, unit, scrap)
│   ├── RecipeOutputConfig (config de output)
│   │   ├── OutputItem (pre-filled del padre)
│   │   ├── OutputQuantity (input numérico)
│   │   └── OutputUnit (heredado, read-only)
│   ├── RecipeScrapConfig (config de desperdicio - colapsable)
│   │   ├── ScrapFactorInput (% input)
│   │   └── ScrapFactorHelp (tooltip explicativo)
│   └── RecipeCostSummary (resumen automático)
│       ├── CostBreakdown (desglose por input)
│       ├── TotalCost (costo total)
│       ├── CostPerUnit (costo unitario)
│       └── PricingSuggestions (sugerencias de precio)
│
├── RecipeWorkshop (herramientas avanzadas)
│   ├── RecipeSelector (dropdown de recetas)
│   ├── WorkshopSidebar (herramientas)
│   │   ├── ScalingTool
│   │   ├── SubstitutionTool 🔮 Post-MVP
│   │   ├── OptimizationTool 🔮 Post-MVP
│   │   └── ComparisonTool 🔮 Post-MVP
│   ├── WorkshopWorkArea (área reactiva)
│   │   ├── RecipePreview (vista default)
│   │   └── ToolResult (resultado según tool activo)
│   └── WorkshopActions (botones de acción)
│       ├── DiscardButton
│       ├── OverwriteButton
│       └── SaveAsButton
│
└── Shared Components (reutilizables)
    ├── MaterialSelector ✅ (ya existe)
    ├── ProductSelector 🆕 (crear nuevo)
    ├── AssetSelector 🔮 Post-MVP
    └── UnitConverter (conversión de unidades)
```

### Component Props (TypeScript Interfaces)

```typescript
// RecipeBuilder
interface RecipeBuilderProps {
  mode: 'create' | 'edit' | 'workshop';
  recipeId?: string;
  entityType: 'material' | 'product' | 'service';
  complexity: 'minimal' | 'standard' | 'advanced';

  features: {
    showHeader?: boolean;              // Solo workshop
    showCostCalculation: boolean;
    showScrapConfig?: boolean;         // Colapsable
    showInstructions?: boolean;        // Post-MVP
    allowProductInputs?: boolean;      // Para products
    allowAssetInputs?: boolean;        // Para services (Post-MVP)
  };

  // Output pre-filled (Material/Product padre)
  outputItem?: Material | Product | Service;

  // Callbacks
  onSave: (recipe: Recipe) => Promise<void>;
  onCancel?: () => void;
  onChange?: (recipe: Partial<Recipe>) => void;
}

// ProductSelector (nuevo componente)
interface ProductSelectorProps {
  onProductSelected: (product: Product) => void;
  placeholder?: string;
  excludeIds?: string[];      // Evitar seleccionar el producto padre
  filterByType?: string;      // 'finished_good', 'sub_assembly', etc.
  showCost?: boolean;         // Mostrar costo en dropdown
  showStock?: boolean;        // Mostrar stock en dropdown
}

// RecipeInputsEditor
interface RecipeInputsEditorProps {
  inputs: RecipeInput[];
  entityType: 'material' | 'product' | 'service';
  allowedInputTypes: ('material' | 'product' | 'asset')[];
  onInputsChange: (inputs: RecipeInput[]) => void;
  onValidationError?: (errors: string[]) => void;
}

// RecipeCostSummary
interface RecipeCostSummaryProps {
  recipe: Recipe;
  breakdown: CostBreakdown;
  showPricingSuggestions?: boolean;
  targetFoodCostPercentage?: number;
  onCostCalculated?: (cost: CostBreakdown) => void;
}
```

---

## 📦 PLAN DE MIGRACIÓN

### Fase 1: Preparación (1-2 días)

```bash
# 1.1 Backup de datos existentes
pg_dump -h localhost -U postgres -d g_admin > backup_pre_recipe_migration.sql

# 1.2 Auditar schema actual
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('recipes', 'recipe_ingredients', 'materials', 'products')
ORDER BY table_name, ordinal_position;

# 1.3 Identificar recetas existentes
SELECT COUNT(*) FROM recipes;
SELECT COUNT(*) FROM recipe_ingredients;
```

### Fase 2: Schema Migration (SQL Scripts)

```sql
-- Migration: 001_add_recipe_fk_columns.sql
-- Agregar nuevas columnas FK a recipes

BEGIN;

-- 1. Agregar columnas output (FKs explícitas)
ALTER TABLE recipes
ADD COLUMN output_material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
ADD COLUMN output_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
ADD COLUMN output_service_id UUID REFERENCES services(id) ON DELETE CASCADE;

-- 2. Migrar datos existentes (si los hay)
-- Asumiendo que recipes actuales son todas de tipo material
UPDATE recipes r
SET output_material_id = m.id
FROM materials m
WHERE m.recipe_id = r.id;

-- 3. Agregar constraint de single output
ALTER TABLE recipes
ADD CONSTRAINT check_single_output CHECK (
  (output_material_id IS NOT NULL AND output_product_id IS NULL AND output_service_id IS NULL) OR
  (output_material_id IS NULL AND output_product_id IS NOT NULL AND output_service_id IS NULL) OR
  (output_material_id IS NULL AND output_product_id IS NULL AND output_service_id IS NOT NULL)
);

-- 4. Agregar otras columnas nuevas
ALTER TABLE recipes
ADD COLUMN entity_type TEXT NOT NULL DEFAULT 'material',
ADD COLUMN execution_mode TEXT NOT NULL DEFAULT 'immediate',
ADD COLUMN scrap_factor DECIMAL(5,2) DEFAULT 0,
ADD COLUMN version INTEGER DEFAULT 1,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN deleted_at TIMESTAMPTZ;

-- 5. Agregar constraints
ALTER TABLE recipes
ADD CONSTRAINT check_entity_type CHECK (entity_type IN ('material', 'product', 'service')),
ADD CONSTRAINT check_execution_mode CHECK (execution_mode IN ('immediate', 'on_demand')),
ADD CONSTRAINT check_scrap_factor CHECK (scrap_factor >= 0 AND scrap_factor < 100);

-- 6. Crear índices
CREATE INDEX idx_recipes_material ON recipes(output_material_id) WHERE output_material_id IS NOT NULL;
CREATE INDEX idx_recipes_product ON recipes(output_product_id) WHERE output_product_id IS NOT NULL;
CREATE INDEX idx_recipes_active ON recipes(is_active, deleted_at) WHERE deleted_at IS NULL;

COMMIT;
```

```sql
-- Migration: 002_create_recipe_inputs_table.sql
-- Crear tabla recipe_inputs con FKs explícitas

BEGIN;

-- 1. Crear nueva tabla
CREATE TABLE recipe_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,

  input_material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  input_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  input_asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,

  quantity DECIMAL(15,6) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  scrap_factor DECIMAL(5,2) CHECK (scrap_factor >= 0 AND scrap_factor < 100),
  is_optional BOOLEAN DEFAULT FALSE,
  substitute_for_input_id UUID REFERENCES recipe_inputs(id),
  unit_cost_override DECIMAL(15,2),
  display_order INTEGER DEFAULT 0,
  stage INTEGER,
  stage_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT check_single_input CHECK (
    (input_material_id IS NOT NULL AND input_product_id IS NULL AND input_asset_id IS NULL) OR
    (input_material_id IS NULL AND input_product_id IS NOT NULL AND input_asset_id IS NULL) OR
    (input_material_id IS NULL AND input_product_id IS NULL AND input_asset_id IS NOT NULL)
  ),

  UNIQUE(recipe_id, input_material_id, input_product_id, input_asset_id)
);

-- 2. Migrar datos desde recipe_ingredients (si existen)
INSERT INTO recipe_inputs (
  recipe_id,
  input_material_id,
  quantity,
  unit,
  created_at
)
SELECT
  recipe_id,
  material_id,
  quantity,
  unit,
  created_at
FROM recipe_ingredients;

-- 3. Crear índices
CREATE INDEX idx_recipe_inputs_recipe ON recipe_inputs(recipe_id);
CREATE INDEX idx_recipe_inputs_material ON recipe_inputs(input_material_id) WHERE input_material_id IS NOT NULL;
CREATE INDEX idx_recipe_inputs_product ON recipe_inputs(input_product_id) WHERE input_product_id IS NOT NULL;

-- 4. Eliminar tabla antigua (después de verificar migración)
-- DROP TABLE recipe_ingredients; -- DESCOMENTAR SOLO DESPUÉS DE VERIFICAR

COMMIT;
```

```sql
-- Migration: 003_add_recipe_functions.sql
-- Crear funciones de cálculo y validación

BEGIN;

-- Función calculate_recipe_cost (ver sección Database Functions arriba)
-- Función check_circular_dependency (ver sección Database Functions arriba)
-- Función validate_recipe_input (ver sección Database Functions arriba)

-- Trigger recipe_input_validation (ver sección Database Functions arriba)

COMMIT;
```

### Fase 3: Data Validation (Post-Migration)

```sql
-- Verificar integridad de migración

-- 1. Verificar que todas las recetas tienen output
SELECT COUNT(*) FROM recipes
WHERE output_material_id IS NULL
  AND output_product_id IS NULL
  AND output_service_id IS NULL;
-- Expected: 0

-- 2. Verificar que todos los inputs tienen recipe válido
SELECT COUNT(*) FROM recipe_inputs ri
WHERE NOT EXISTS (
  SELECT 1 FROM recipes r WHERE r.id = ri.recipe_id
);
-- Expected: 0

-- 3. Verificar que no hay inputs huérfanos
SELECT COUNT(*) FROM recipe_inputs
WHERE input_material_id IS NULL
  AND input_product_id IS NULL
  AND input_asset_id IS NULL;
-- Expected: 0

-- 4. Verificar costos
SELECT
  r.id,
  r.name,
  calculate_recipe_cost(r.id) as total_cost
FROM recipes r
WHERE is_active = TRUE
LIMIT 10;
```

### Fase 4: Rollback Plan (si falla)

```sql
-- Rollback script (ejecutar si la migración falla)

BEGIN;

-- 1. Restaurar recipe_ingredients desde recipe_inputs
INSERT INTO recipe_ingredients (recipe_id, material_id, quantity, unit, created_at)
SELECT recipe_id, input_material_id, quantity, unit, created_at
FROM recipe_inputs
WHERE input_material_id IS NOT NULL;

-- 2. Drop nueva tabla
DROP TABLE recipe_inputs;

-- 3. Drop nuevas columnas
ALTER TABLE recipes
DROP COLUMN output_material_id,
DROP COLUMN output_product_id,
DROP COLUMN output_service_id,
DROP COLUMN entity_type,
DROP COLUMN execution_mode,
DROP COLUMN scrap_factor,
DROP COLUMN version,
DROP COLUMN is_active,
DROP COLUMN deleted_at;

-- 4. Drop funciones
DROP FUNCTION IF EXISTS calculate_recipe_cost(UUID);
DROP FUNCTION IF EXISTS check_circular_dependency(UUID, UUID);
DROP FUNCTION IF EXISTS validate_recipe_input();

COMMIT;

-- Restaurar desde backup completo
-- psql -h localhost -U postgres -d g_admin < backup_pre_recipe_migration.sql
```

---

## 🧪 TESTING STRATEGY

### Unit Tests (Jest + TypeScript)

```typescript
// tests/recipe/costCalculation.test.ts

describe('Recipe Cost Calculation', () => {
  describe('calculateRecipeCost', () => {
    it('should calculate simple material cost', async () => {
      const recipe: Recipe = {
        id: '123',
        entityType: 'product',
        output: { quantity: 1, unit: 'unit' },
        inputs: [
          { itemId: 'mat1', quantity: 100, unit: 'g', inputMaterialId: 'mat1' }
        ]
      };

      // Mock: material cuesta $0.10/g
      mockGetMaterialById.mockResolvedValue({ costPerUnit: 0.10 });

      const cost = await calculateRecipeCost(recipe);

      expect(cost.materialsCost).toBe(10); // 100g × $0.10/g
      expect(cost.totalCost).toBe(10);
      expect(cost.costPerUnit).toBe(10);
    });

    it('should apply scrap factor correctly', async () => {
      const recipe: Recipe = {
        id: '123',
        entityType: 'product',
        output: { quantity: 1, unit: 'unit' },
        inputs: [
          {
            itemId: 'mat1',
            quantity: 100,
            unit: 'g',
            scrapFactor: 20, // 20% scrap
            inputMaterialId: 'mat1'
          }
        ]
      };

      mockGetMaterialById.mockResolvedValue({ costPerUnit: 0.10 });

      const cost = await calculateRecipeCost(recipe);

      // Adjusted quantity: 100 / (1 - 0.20) = 125g
      // Cost: 125g × $0.10/g = $12.50
      expect(cost.materialsCost).toBe(12.5);
    });

    it('should calculate encapsulated product cost', async () => {
      // Sub-product
      const subProduct: Product = {
        id: 'sub1',
        finalCost: 5.00 // Ya tiene su costo calculado
      };

      const recipe: Recipe = {
        id: '123',
        entityType: 'product',
        output: { quantity: 1, unit: 'unit' },
        inputs: [
          { itemId: 'sub1', quantity: 2, unit: 'unit', inputProductId: 'sub1' }
        ]
      };

      mockGetProductById.mockResolvedValue(subProduct);

      const cost = await calculateRecipeCost(recipe);

      // 2 units × $5.00/unit = $10.00
      expect(cost.materialsCost).toBe(10);
    });
  });

  describe('scrap factor validation', () => {
    it('should reject scrap factor >= 100%', () => {
      expect(() =>
        calculateAsPurchasedQuantity(100, 100)
      ).toThrow('Scrap factor must be between 0 and 99.99');
    });

    it('should reject negative scrap factor', () => {
      expect(() =>
        calculateAsPurchasedQuantity(100, -5)
      ).toThrow('Scrap factor must be between 0 and 99.99');
    });
  });
});

describe('Recipe Validation', () => {
  describe('validateInputType', () => {
    it('should allow materials in material recipes', () => {
      expect(validateInputType('material', 'material')).toBe(true);
    });

    it('should reject products in material recipes', () => {
      expect(validateInputType('material', 'product')).toBe(false);
    });

    it('should allow products in product recipes', () => {
      expect(validateInputType('product', 'product')).toBe(true);
    });
  });

  describe('circular dependency detection', () => {
    it('should detect direct circular dependency', async () => {
      // Product A contains Product B, Product B contains Product A
      mockGetProductRecipe.mockImplementation((id) => {
        if (id === 'A') return { inputs: [{ itemId: 'B', itemType: 'product' }] };
        if (id === 'B') return { inputs: [{ itemId: 'A', itemType: 'product' }] };
      });

      const hasCircular = await checkCircularDependency('A', 'B');
      expect(hasCircular).toBe(true);
    });

    it('should detect indirect circular dependency', async () => {
      // A → B → C → A (ciclo de 3)
      mockGetProductRecipe.mockImplementation((id) => {
        if (id === 'A') return { inputs: [{ itemId: 'B', itemType: 'product' }] };
        if (id === 'B') return { inputs: [{ itemId: 'C', itemType: 'product' }] };
        if (id === 'C') return { inputs: [{ itemId: 'A', itemType: 'product' }] };
      });

      const hasCircular = await checkCircularDependency('A', 'B');
      expect(hasCircular).toBe(true);
    });

    it('should allow valid deep nesting', async () => {
      // A → B → C (sin ciclo)
      mockGetProductRecipe.mockImplementation((id) => {
        if (id === 'A') return { inputs: [{ itemId: 'B', itemType: 'product' }] };
        if (id === 'B') return { inputs: [{ itemId: 'C', itemType: 'product' }] };
        if (id === 'C') return { inputs: [{ itemId: 'mat1', itemType: 'material' }] };
      });

      const hasCircular = await checkCircularDependency('A', 'B');
      expect(hasCircular).toBe(false);
    });
  });

  describe('BOM depth validation', () => {
    it('should reject nesting exceeding MAX_DEPTH', async () => {
      // Crear cadena de 4 niveles (excede MAX_DEPTH=3)
      mockGetProductRecipe.mockImplementation((id) => {
        if (id === 'lvl1') return { inputs: [{ itemId: 'lvl2', itemType: 'product' }] };
        if (id === 'lvl2') return { inputs: [{ itemId: 'lvl3', itemType: 'product' }] };
        if (id === 'lvl3') return { inputs: [{ itemId: 'lvl4', itemType: 'product' }] };
      });

      await expect(validateBOMDepth('lvl1')).rejects.toThrow(
        'Maximum BOM depth (3) exceeded'
      );
    });
  });
});
```

### Integration Tests (Supabase + Database)

```typescript
// tests/integration/recipe.integration.test.ts

describe('Recipe Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('should create recipe with materials only', async () => {
    // 1. Crear materiales de prueba
    const flour = await createMaterial({ name: 'Flour', costPerUnit: 2.00 });
    const water = await createMaterial({ name: 'Water', costPerUnit: 0.01 });

    // 2. Crear material elaborado
    const bread = await createMaterial({ name: 'Bread', type: 'elaborated' });

    // 3. Crear recipe
    const recipe = await createRecipe({
      entityType: 'material',
      executionMode: 'immediate',
      outputMaterialId: bread.id,
      outputQuantity: 1,
      inputs: [
        { inputMaterialId: flour.id, quantity: 500, unit: 'g' },
        { inputMaterialId: water.id, quantity: 300, unit: 'ml' }
      ]
    });

    // 4. Verificar
    expect(recipe.id).toBeDefined();
    expect(recipe.inputs).toHaveLength(2);

    // 5. Calcular costo
    const cost = await calculateRecipeCost(recipe.id);
    expect(cost.totalCost).toBe(13); // (500g × $2/kg) + (300ml × $0.01/ml)
  });

  it('should prevent circular dependency at database level', async () => {
    // 1. Crear productos
    const productA = await createProduct({ name: 'Product A' });
    const productB = await createProduct({ name: 'Product B' });

    // 2. A contiene B
    const recipeA = await createRecipe({
      entityType: 'product',
      outputProductId: productA.id,
      outputQuantity: 1,
      inputs: [
        { inputProductId: productB.id, quantity: 1, unit: 'unit' }
      ]
    });

    // 3. Intentar que B contenga A (debe fallar)
    await expect(
      createRecipe({
        entityType: 'product',
        outputProductId: productB.id,
        outputQuantity: 1,
        inputs: [
          { inputProductId: productA.id, quantity: 1, unit: 'unit' }
        ]
      })
    ).rejects.toThrow('Circular dependency detected');
  });

  it('should calculate multi-level BOM cost correctly', async () => {
    // Setup: Producto con 2 niveles de encapsulamiento
    // Combo → Hamburguesa → Materiales

    // Nivel 2: Hamburguesa (product)
    const bun = await createMaterial({ name: 'Bun', costPerUnit: 0.50 });
    const patty = await createMaterial({ name: 'Patty', costPerUnit: 2.00 });
    const hamburger = await createProduct({ name: 'Hamburger' });

    const hamburgerRecipe = await createRecipe({
      entityType: 'product',
      outputProductId: hamburger.id,
      outputQuantity: 1,
      inputs: [
        { inputMaterialId: bun.id, quantity: 1, unit: 'unit' },
        { inputMaterialId: patty.id, quantity: 1, unit: 'unit' }
      ]
    });

    // Actualizar finalCost del hamburger
    const hamburgerCost = await calculateRecipeCost(hamburgerRecipe.id);
    await updateProduct(hamburger.id, { finalCost: hamburgerCost.totalCost });

    // Nivel 1: Combo (product)
    const fries = await createProduct({ name: 'Fries', finalCost: 1.50 });
    const combo = await createProduct({ name: 'Combo' });

    const comboRecipe = await createRecipe({
      entityType: 'product',
      outputProductId: combo.id,
      outputQuantity: 1,
      inputs: [
        { inputProductId: hamburger.id, quantity: 1, unit: 'unit' },
        { inputProductId: fries.id, quantity: 1, unit: 'unit' }
      ]
    });

    // Verificar costo del combo
    const comboCost = await calculateRecipeCost(comboRecipe.id);

    // Hamburger: $0.50 + $2.00 = $2.50
    // Combo: $2.50 + $1.50 = $4.00
    expect(comboCost.totalCost).toBe(4.00);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/recipe-builder.e2e.ts

test.describe('Recipe Builder E2E', () => {
  test('should create a material recipe', async ({ page }) => {
    // 1. Navegar a materials
    await page.goto('/admin/supply-chain/materials');

    // 2. Click en "New Material"
    await page.click('button:has-text("New Material")');

    // 3. Llenar formulario
    await page.fill('input[name="name"]', 'Pan Casero');
    await page.selectOption('select[name="type"]', 'elaborated');

    // 4. Agregar ingredientes
    await page.click('button:has-text("Add Material")');
    await page.fill('input[placeholder="Search material"]', 'Harina');
    await page.click('text=Harina');
    await page.fill('input[name="quantity"]', '500');
    await page.selectOption('select[name="unit"]', 'g');

    // 5. Configurar output
    await page.fill('input[name="outputQuantity"]', '1');

    // 6. Verificar costo calculado
    const costText = await page.textContent('[data-testid="recipe-total-cost"]');
    expect(costText).toContain('$');

    // 7. Guardar
    await page.click('button:has-text("Save")');

    // 8. Verificar que aparece en la lista
    await expect(page.locator('text=Pan Casero')).toBeVisible();
  });

  test('should prevent circular dependency', async ({ page }) => {
    // 1. Crear Product A con Product B
    await createProductWithRecipe('Product A', ['Product B']);

    // 2. Intentar crear Product B con Product A
    await page.goto('/admin/supply-chain/products');
    await page.click('button:has-text("New Product")');
    await page.fill('input[name="name"]', 'Product B');

    // 3. Agregar Product A como input
    await page.click('button:has-text("Add Product")');
    await page.fill('input[placeholder="Search product"]', 'Product A');
    await page.click('text=Product A');

    // 4. Verificar error
    await expect(page.locator('text=Circular dependency')).toBeVisible();

    // 5. Botón de guardar debe estar deshabilitado
    await expect(page.locator('button:has-text("Save")')).toBeDisabled();
  });
});
```

---

## ⚡ PERFORMANCE CONSIDERATIONS

### 1. Database Query Optimization

```typescript
// MALO: N+1 queries
async function getRecipeWithIngredients(recipeId: string) {
  const recipe = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .single();

  const inputs = await supabase
    .from('recipe_inputs')
    .select('*')
    .eq('recipe_id', recipeId);

  // Para cada input, fetch el material/product (N queries!)
  for (const input of inputs) {
    if (input.input_material_id) {
      const material = await supabase
        .from('materials')
        .select('*')
        .eq('id', input.input_material_id)
        .single();
      // ...
    }
  }
}

// BUENO: Single query con joins
async function getRecipeWithIngredients(recipeId: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_inputs (
        *,
        material:materials!recipe_inputs_input_material_id_fkey (*),
        product:products!recipe_inputs_input_product_id_fkey (*),
        asset:assets!recipe_inputs_input_asset_id_fkey (*)
      )
    `)
    .eq('id', recipeId)
    .single();

  return data;
}
```

### 2. Caching Strategy

```typescript
// Cache de costos calculados (invalidar al cambiar recipe o precios)

import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

// Hook con cache
function useRecipeCost(recipeId: string) {
  return useQuery(
    ['recipe-cost', recipeId],
    () => calculateRecipeCost(recipeId),
    {
      enabled: !!recipeId,
      staleTime: 5 * 60 * 1000,
    }
  );
}

// Invalidar cache al actualizar recipe
async function updateRecipe(recipeId: string, data: Partial<Recipe>) {
  await supabase.from('recipes').update(data).eq('id', recipeId);

  // Invalidar cache
  queryClient.invalidateQueries(['recipe-cost', recipeId]);
  queryClient.invalidateQueries(['recipe', recipeId]);
}
```

### 3. Lazy Loading de Componentes

```typescript
// Lazy load de Workshop (feature pesada)
const RecipeWorkshop = lazy(() => import('./RecipeWorkshop'));

// Lazy load de herramientas opcionales
const ScalingTool = lazy(() => import('./ScalingTool'));
const SubstitutionTool = lazy(() => import('./SubstitutionTool'));

function WorkshopPage() {
  return (
    <Suspense fallback={<WorkshopSkeleton />}>
      <RecipeWorkshop />
    </Suspense>
  );
}
```

### 4. Debouncing de Cálculos

```typescript
// Debounce al cambiar inputs para evitar re-cálculos excesivos

import { useDebouncedCallback } from 'use-debounce';

function RecipeInputsEditor({ recipe, onChange }: Props) {
  const [localRecipe, setLocalRecipe] = useState(recipe);

  // Debounce de 500ms antes de calcular costos
  const debouncedOnChange = useDebouncedCallback(
    (updated: Recipe) => {
      onChange(updated);
      // Trigger cost calculation
      calculateRecipeCost(updated);
    },
    500
  );

  const handleInputChange = (input: RecipeInput) => {
    const updated = {
      ...localRecipe,
      inputs: localRecipe.inputs.map(i =>
        i.id === input.id ? input : i
      )
    };

    setLocalRecipe(updated);
    debouncedOnChange(updated);
  };

  return <>{/* ... */}</>;
}
```

### 5. Virtualization para Listas Largas

```typescript
// Si una receta tiene muchos inputs (>50), virtualizar la lista

import { FixedSizeList } from 'react-window';

function RecipeInputsList({ inputs, onInputChange }: Props) {
  if (inputs.length < 50) {
    // Render normal para listas cortas
    return inputs.map(input => (
      <InputRow key={input.id} input={input} onChange={onInputChange} />
    ));
  }

  // Virtualizar para listas largas
  return (
    <FixedSizeList
      height={600}
      itemCount={inputs.length}
      itemSize={80}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <InputRow
            input={inputs[index]}
            onChange={onInputChange}
          />
        </div>
      )}
    </FixedSizeList>
  );
}
```

---

## 📊 MÉTRICAS DE ÉXITO

### KPIs Técnicos

| Métrica | Target | Método de Medición |
|---------|--------|-------------------|
| **Recipe Cost Calculation Time** | < 100ms | Performance.now() en calculateRecipeCost() |
| **Recipe Creation Time** | < 500ms | From submit to DB insert |
| **Circular Dependency Check** | < 50ms | Recursive CTE execution time |
| **Page Load Time (Recipe Builder)** | < 1s | Lighthouse performance score > 90 |
| **Database Query Count** | Max 3 queries | PostgreSQL query logs |
| **Cache Hit Rate** | > 80% | React Query devtools |

### KPIs de Negocio

| Métrica | Target | Razón |
|---------|--------|-------|
| **Recipe Accuracy** | 100% | Costos calculados = costos reales |
| **Circular Dependency Prevention** | 100% | 0 errores de circularidad en producción |
| **Data Integrity** | 100% | 0 FKs inválidas, 0 orphan records |
| **User Adoption** | > 80% | % de productos con recipe completa |

---

## ✅ CHECKLIST PRE-IMPLEMENTACIÓN

Antes de comenzar la implementación, confirmar:

- [ ] **Decisiones arquitectónicas aprobadas** (tabla en Resumen Ejecutivo)
- [ ] **Schema de DB revisado** y aprobado por tech lead
- [ ] **Reglas de negocio validadas** con stakeholders
- [ ] **Plan de migración probado** en ambiente de staging
- [ ] **Strategy de testing definida** (unit, integration, E2E)
- [ ] **Performance benchmarks establecidos**
- [ ] **Rollback plan documentado**
- [ ] **Equipo capacitado** en conceptos de BOM, scrap factor, etc.
- [ ] **Mockups de UI aprobados** (ver RECIPE_DESIGN_DEFINITIVO.md)
- [ ] **Componentes reutilizables identificados** (MaterialSelector, etc.)

---

## 📚 REFERENCIAS

### Industry Standards
- **SAP BOM Management**: [SAP Help Portal - BOM](https://help.sap.com/docs/BOM)
- **Oracle ERP Cloud**: [Oracle BOM Documentation](https://docs.oracle.com/en/cloud/saas/erp/)
- **Odoo Manufacturing**: [Odoo BOM Documentation](https://www.odoo.com/documentation/16.0/applications/inventory_and_mrp/manufacturing.html)
- **ERPNext**: [ERPNext BOM Structure](https://docs.erpnext.com/docs/user/manual/en/manufacturing/bill-of-materials)

### Accounting Standards
- **Horngren's Cost Accounting** (16th Edition) - Capítulo 4: Job Costing
- **IFRS IAS 2**: Inventory Valuation Standards
- **National Restaurant Association**: Restaurant Operations Manual (Food Cost Chapter)

### Technical Resources
- **PostgreSQL Recursive CTEs**: [PostgreSQL Documentation](https://www.postgresql.org/docs/current/queries-with.html)
- **React Query**: [TanStack Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/best-practices)
- **Zod Validation**: [Zod Documentation](https://zod.dev/)

---

**FIN DE ARQUITECTURA TÉCNICA**

> ✅ **DOCUMENTO COMPLETO Y LISTO PARA IMPLEMENTACIÓN**
>
> Este documento representa la arquitectura definitiva del sistema de recetas.
> Cualquier cambio debe documentarse aquí antes de implementarse.
