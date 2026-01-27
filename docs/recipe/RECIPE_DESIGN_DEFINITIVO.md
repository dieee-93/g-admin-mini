# DISEÑO DEFINITIVO: RecipeBuilder & Workshop

> **Versión**: 3.1.0 (Actualizado con omisiones corregidas)
> **Fecha**: 2026-01-06
> **Status**: 🎯 DISEÑO FINAL COMPLETO - Listo para revisión e implementación

---

## 📋 ÍNDICE

1. [Contexto y Problemas](#contexto-y-problemas)
2. [Reglas de Negocio](#reglas-de-negocio)
3. [Arquitectura de Componentes](#arquitectura-de-componentes)
4. [Mockups de Interfaces](#mockups-de-interfaces)
5. [Plan de Implementación](#plan-de-implementación)
6. [Limpieza y Migración](#limpieza-y-migración)

---

## 🎯 CONTEXTO Y PROBLEMAS

### Problemática Actual

1. **RecipeBuilder existe pero no se adapta bien a todos los contextos**
2. **No hay claridad sobre qué inputs permite cada contexto**
3. **Campos inútiles** (Quality Grade, otros placeholders)
4. **Cálculos manuales** cuando deberían ser automáticos
5. **Workshop no integrado** con el resto del sistema
6. **Componentes duplicados** y sin reutilización clara

### Solución Propuesta

**UN componente RecipeBuilder adaptable** que se comporta diferente según:
- **Contexto de uso** (Material Elaborado, Producto, Servicio, Workshop)
- **Configuración de features** (qué secciones mostrar)
- **Reglas de inputs** (qué tipos de items puede contener)

---

## 📐 REGLAS DE NEGOCIO

### Tipos de Inputs por Contexto

| Contexto | Puede contener | NO puede contener |
|----------|---------------|-------------------|
| **Material Elaborado** | ✅ Materiales | ❌ Productos, Servicios |
| **Producto** | ✅ Materiales, ✅ Productos | ❌ Servicios |
| **Servicio** | ✅ Materiales, (✅ Assets?) | ❌ Productos, Servicios |
| **Workshop** | ✅ Todos (según la receta original) | - |

**Regla de Encapsulamiento:**
- Un **Producto** puede contener **Productos** (ej: Combo con Hamburguesa + Papas)
- El costo se calcula sumando los costos finales (no recalcular ingredientes de sub-productos)

### Ejecución de Recetas

| Contexto | Execution Mode | Cuándo consume stock |
|----------|----------------|---------------------|
| Material Elaborado | `immediate` | Al producir el material |
| Producto | `on_demand` | Al vender |
| Servicio | `on_demand` | Al ejecutar servicio |

### Cálculo de Costos

**Costo Total = Σ Costos de Inputs**

**Para cada input:**
- Si es **Material**: `costo_unitario × cantidad`
- Si es **Producto**: `producto.precio_costo × cantidad` (ya incluye su BOM)
- Si es **Material Elaborado**: `material.costo_produccion × cantidad`

**Merma/Desperdicio:**
- Usuario define `% de merma` (ej: 10%)
- Sistema calcula cantidad real necesaria: `cantidad / (1 - merma%)`

---

## 📋 CAMPOS Y SECCIONES POR CONTEXTO

### ¿Qué se muestra en cada contexto?

| Sección | Material Elaborado | Producto | Servicio | Workshop |
|---------|-------------------|----------|----------|----------|
| **Nombre/Descripción** | ❌ NO (viene del material padre) | ❌ NO (viene del producto padre) | ❌ NO (viene del servicio padre) | ✅ SÍ (preview read-only) |
| **Lista de Inputs** | ✅ SÍ (solo materiales) | ✅ SÍ (materiales + productos) | ✅ SÍ (materiales + assets) | ✅ SÍ (según tipo original) |
| **Output** | ✅ SÍ (pre-filled) | ✅ SÍ (pre-filled) | ✅ SÍ (pre-filled) | ✅ SÍ (editable) |
| **Cantidad Output** | ✅ SÍ (usuario completa) | ✅ SÍ (usuario completa) | ✅ SÍ (usuario completa) | ✅ SÍ (editable) |
| **Tipo Output** | ✅ SÍ (unitario/conmesurable) | ✅ SÍ (unitario/conmesurable) | ✅ SÍ (unitario/conmesurable) | ✅ SÍ (read-only) |
| **Costos Automáticos** | ✅ SÍ | ✅ SÍ (solo BOM) | ✅ SÍ (solo materiales) | ✅ SÍ |
| **Yield/Waste** | 🟡 Opcional (colapsado) | 🟡 Opcional (colapsado) | 🟡 Opcional (colapsado) | 🟡 Opcional |
| **Instrucciones** | 🟢 No (baja prioridad) | 🟢 No (baja prioridad) | 🟢 No (baja prioridad) | 🟢 No (baja prioridad) |
| **Quality Grade** | ❌ ELIMINADO | ❌ ELIMINADO | ❌ ELIMINADO | ❌ ELIMINADO |
| **Scaling Lite** | 🟡 Opcional (x2, /2) | 🟡 Opcional (x2, /2) | ❌ NO | ❌ NO (usa Workshop) |

**Leyenda:**
- ✅ = Implementar (alta prioridad)
- 🟡 = Implementar (media prioridad)
- 🟢 = Post-MVP (baja prioridad)
- ❌ = No implementar

---

## 🎨 OUTPUT: Unitario vs Conmesurable

### Tipos de Output (Similar a Materials)

El sistema debe soportar **DOS tipos de output**, igual que los materiales:

#### **1. Unitario** (Countable)
**Ejemplos**: Hamburguesas, Panes, Botellas, Porciones

**Características:**
- Se cuenta por **unidades enteras**
- Unidad: `unit`, `piece`, `portion`
- Cantidad: Números enteros (1, 2, 3...)

**UI:**
```
┌──────────────────────────────────┐
│ Tipo de Output: [Unitario ▼]    │
│ Cantidad:       [20] unidades    │
│                                  │
│ ℹ️ Contar las piezas producidas  │
└──────────────────────────────────┘
```

#### **2. Conmesurable** (Measurable)
**Ejemplos**: Masa para pizza (kg), Relleno de pollo (kg), Salsa (litros)

**Características:**
- Se mide por **peso o volumen**
- Unidad: `kg`, `g`, `l`, `ml`
- Cantidad: Números decimales (1.5, 0.25, 10.75...)

**UI:**
```
┌──────────────────────────────────┐
│ Tipo de Output: [Conmesurable ▼] │
│ Cantidad:       [10.5] kg        │
│                                  │
│ ℹ️ Pesar el resultado en balanza │
└──────────────────────────────────┘
```

### ¿Cómo se determina el tipo?

**Opción A: Heredar del Material/Producto padre**
```typescript
// Si el material padre es unitario → output unitario
// Si el material padre es conmesurable → output conmesurable
outputType = parentItem.type; // 'unitario' | 'conmesurable'
```

**Opción B: Usuario elige al crear la receta**
- Workshop: Selector manual
- Material/Producto: Pre-filled según el tipo del padre

**Recomendación**: Opción A (heredar), más simple y evita errores.

---

## 📱 REQUISITOS DE RESPONSIVENESS

### Mobile-First Approach

**Breakpoints:**
```css
/* Mobile */
@media (max-width: 640px) {
  - Stack vertical (no tables)
  - Inputs lista como cards
  - Botones full-width
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  - Tabla simplificada (ocultar columnas opcionales)
  - Sidebar colapsable
}

/* Desktop */
@media (min-width: 1025px) {
  - Tabla completa
  - Sidebar siempre visible
}
```

### Adaptaciones Mobile

#### **RecipeBuilder en Mobile:**
```
┌─────────────────────────┐
│ 📱 RECETA: Pan Casero   │
├─────────────────────────┤
│                         │
│ ▼ INGREDIENTES (3)      │
│   ┌───────────────────┐ │
│   │ Harina            │ │
│   │ 500g    $10.00    │ │
│   │ [Editar] [×]      │ │
│   └───────────────────┘ │
│   ┌───────────────────┐ │
│   │ Agua              │ │
│   │ 300ml   $0.50     │ │
│   │ [Editar] [×]      │ │
│   └───────────────────┘ │
│                         │
│ [+ Agregar Material]    │
│                         │
│ ▼ PRODUCCIÓN            │
│   Output: Pan Casero    │
│   Cantidad: [1] kg      │
│                         │
│ ▼ COSTOS                │
│   Total: $15.50         │
│   /kg: $15.50           │
│                         │
│ [Cancelar] [Guardar]    │
└─────────────────────────┘
```

#### **Workshop en Mobile:**
```
┌─────────────────────────┐
│ 📱 WORKSHOP             │
├─────────────────────────┤
│ Receta: [Hamburguesa ▼] │
│                         │
│ ☰ Herramientas (tap)    │
│ ├ Scaling               │
│ ├ Substitutions         │
│ └ Optimize              │
│                         │
│ [Área de trabajo]       │
│ (full-width)            │
│                         │
│ [Descartar] [Guardar]   │
└─────────────────────────┘
```

**Principios:**
- ✅ Touch-friendly (botones grandes, mín 44px)
- ✅ Sin hover effects (no funciona en mobile)
- ✅ Scroll vertical (no horizontal)
- ✅ Tabs colapsables
- ✅ Cards en lugar de tablas

---

## ⚡ SCALING TOOL LITE (Versión Simplificada)

### ¿Dónde incluirlo?

**En RecipeBuilder (Material/Producto):**
- Botones rápidos: `×2`, `÷2`, `×0.5`
- Solo para casos simples
- NO reemplaza al Workshop

**UI Propuesta:**
```
┌──────────────────────────────────────────┐
│ PRODUCCIÓN                               │
├──────────────────────────────────────────┤
│ Output:    Pan Casero (pre-filled)       │
│ Cantidad:  [1   ] kg                     │
│                                          │
│ ⚡ Scaling rápido:                       │
│    [×2] [÷2] [×0.5] [Custom...]          │
│                                          │
│ ℹ️ Para escalado avanzado usa Workshop   │
└──────────────────────────────────────────┘
```

**Comportamiento:**
- Click en `×2`: Duplica TODOS los inputs
- Click en `÷2`: Divide TODOS los inputs a la mitad
- Click en `Custom...`: Abre modal simple con input de factor
- **NO modifica la receta original**, solo preview temporal

**Implementación:**
```typescript
// En OutputConfigSection o nueva sección "QuickScaling"
const handleQuickScale = (factor: number) => {
  const scaledInputs = recipe.inputs.map(input => ({
    ...input,
    quantity: input.quantity * factor
  }));
  updateRecipe({ inputs: scaledInputs });
};
```

---

## 🎯 PRIORIDADES DE IMPLEMENTACIÓN

### 🔴 PRIORIDAD ALTA (MVP - Fase 1-3)

**Componentes Core:**
- ✅ RecipeInputsEditor (con toggle Material/Producto)
- ✅ OutputConfigSection (limpiar, unitario/conmesurable)
- ✅ CostSummarySection (automático al 100%)
- ✅ ProductSelector (crear nuevo)

**Integraciones:**
- ✅ Material Elaborado (funcional)
- ✅ Producto (funcional)

**Cálculos:**
- ✅ Costos automáticos
- ✅ Encapsulamiento (producto con producto)

---

### 🟡 PRIORIDAD MEDIA (Fase 4)

**Workshop:**
- ✅ RecipeSelector (dropdown)
- ✅ Scaling Tool (completo)
- ✅ UI reactiva (sidebar + área de trabajo)
- 🟡 Scaling Tool Lite (versión simple en RecipeBuilder)

**Features Opcionales:**
- 🟡 Yield/Waste (colapsable, bien explicado)
- 🟡 Menu Engineering Dashboard (datos mock)

---

### 🟢 PRIORIDAD BAJA (Post-MVP)

**Features Avanzadas:**
- 🟢 Instrucciones (pasos de preparación)
- 🟢 SubstitutionTool (sustituciones de ingredientes)
- 🟢 OptimizationTool (optimización de costos)
- 🟢 ComparisonTool (comparar recetas)
- 🟢 AI Suggestions
- 🟢 Production Tracking
- 🟢 Recipe Versioning

**Servicios:**
- 🟢 Integración completa de Servicios
- 🟢 Assets en recetas

---

## 🏗️ ARQUITECTURA DE COMPONENTES

### Componentes Reutilizables (YA EXISTEN)

#### ✅ **MaterialSelector** (Ya existe en `/shared/components`)
- Busca y selecciona materiales
- **NO modificar**, reutilizar

#### ✅ **CustomerSelector** (Ya existe en `/shared/components`)
- Patrón similar para otros selectores
- **Inspiración para ProductSelector**

### Nuevos Componentes Necesarios

#### 🆕 **ProductSelector** (Crear)
**Ubicación**: `/shared/components/ProductSelector.tsx`

**Props:**
```typescript
interface ProductSelectorProps {
  onProductSelected: (product: ProductItem) => void;
  placeholder?: string;
  excludeIds?: string[];
  filterByStock?: boolean;
}
```

**Funcionalidad:**
- Similar a MaterialSelector pero para productos
- Busca por nombre
- Muestra precio y stock
- Excluye IDs ya seleccionados

---

### Componente Core: `RecipeInputsEditor`

#### 🔄 **RecipeInputsEditor** (Modificar InputsEditorSection)

**Ubicación**: `/modules/recipe/components/RecipeBuilder/sections/InputsEditorSection.tsx`

**Cambios necesarios:**

1. **Selector dinámico según contexto:**

```typescript
// ANTES (solo MaterialSelector)
<MaterialSelector onMaterialSelected={...} />

// DESPUÉS (selector dinámico)
{allowedTypes.includes('material') && !input.item && (
  <MaterialSelector onMaterialSelected={handleSelectMaterial} />
)}

{allowedTypes.includes('product') && !input.item && (
  <ProductSelector onProductSelected={handleSelectProduct} />
)}
```

2. **Validación de tipos:**

```typescript
const allowedTypes = useMemo(() => {
  switch (entityType) {
    case 'material':
      return ['material'];
    case 'product':
      return ['material', 'product'];
    case 'service':
      return ['material', 'asset']; // Por definir
    default:
      return ['material'];
  }
}, [entityType]);
```

3. **UI del selector (toggle buttons):**

```
┌─────────────────────────────────────────┐
│ Agregar Input:                          │
│ [Material] [Producto]  (botones toggle) │
│                                         │
│ [Selector dinámico según botón activo] │
└─────────────────────────────────────────┘
```

---

### Componente: `RecipeOutputConfig`

#### 🔄 **OutputConfigSection** (Modificar)

**Cambios necesarios:**

1. **Eliminar "Quality Grade"** (campo inútil)

2. **Simplificar Yield/Waste:**

```
┌─────────────────────────────────────────┐
│ ✓ Configuración Avanzada (collapsed)   │
│                                         │
│ Al expandir:                            │
│ • Yield % (rendimiento)                 │
│ • Waste % (merma/desperdicio)           │
│ • Explicación clara de para qué sirve   │
└─────────────────────────────────────────┘
```

3. **Output obligatorio:**
- En Material/Producto: Pre-filled desde el contexto padre
- En Workshop: Selector manual

---

### Componente: `RecipeCostSummary`

#### ✅ **CostSummarySection** (YA EXISTE - Solo ajustes)

**Lo que funciona bien:**
- ✅ Cálculo automático
- ✅ Desglose por ingrediente
- ✅ Yield analysis

**Ajustes menores:**
1. Eliminar campos manuales de costo
2. Asegurar que sume correctamente costos de productos encapsulados

---

## 🖼️ MOCKUPS DE INTERFACES

### CONTEXTO 1: Material Elaborado

**Ubicación**: Modal de crear Material → Tipo: "Elaborado"

```
┌────────────────────────────────────────────────────────┐
│  RECETA: Pan Casero                    [Guardar] [×]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ⚠️ Los materiales elaborados requieren una receta    │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ INGREDIENTES (Materiales)                        │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ Item          Cantidad  Unidad  Yield%  Waste%  │ │
│  │ Harina        500       g       100     0       │ │
│  │ Agua          300       ml      100     0       │ │
│  │ Levadura      10        g       100     0       │ │
│  │                                                  │ │
│  │ [+ Agregar Material]                            │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ PRODUCCIÓN                                       │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ Output:         Pan Casero (pre-filled)          │ │
│  │ Cantidad:       [1    ] kg  (usuario completa)   │ │
│  │                                                  │ │
│  │ ℹ️ Pesar el resultado en el mundo real y         │ │
│  │    registrar cuánto se obtuvo                    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ COSTOS (Calculado automáticamente)              │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ Costo Materiales:  $15.50                        │ │
│  │ Costo por kg:      $15.50/kg                     │ │
│  │                                                  │ │
│  │ Desglose:                                        │ │
│  │ • Harina:    $10.00 (64.5%)                      │ │
│  │ • Agua:      $0.50  (3.2%)                       │ │
│  │ • Levadura:  $5.00  (32.3%)                      │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [Cancelar]                          [Guardar Receta] │
└────────────────────────────────────────────────────────┘
```

**Campos visibles:**
- ✅ Lista de inputs (solo materiales)
- ✅ Output (pre-filled)
- ✅ Cantidad de producción
- ✅ Costos automáticos
- ❌ NO nombre/descripción (viene del material padre)
- ❌ NO instrucciones (opcional, no es foco)
- ❌ NO quality grade

#### **Diagrama de Componentes:**

```
┌────────────────────────────────────────────┐
│  MaterialFormModal (componente padre)     │
│  ├─ ElaboratedFields.tsx                  │
│     └─ RecipeBuilder                      │  ← Componente principal
│        ├─ InputsEditorSection             │  ← Tabla de inputs
│        │  └─ MaterialSelector (×N)        │  ← Selector por cada input
│        ├─ OutputConfigSection             │  ← Config de output
│        │  ├─ Tipo selector                │  ← unitario/conmesurable
│        │  └─ Cantidad input                │
│        └─ CostSummarySection              │  ← Costos automáticos
└────────────────────────────────────────────┘
```

**Props del RecipeBuilder en este contexto:**
```typescript
<RecipeBuilder
  mode="create"
  entityType="material"
  complexity="minimal"
  features={{
    showCostCalculation: true,
    showYieldConfig: false,      // Oculto por defecto
    showInstructions: false,     // No implementado aún
    showQualityConfig: false,    // ELIMINADO
    showScalingLite: true,       // 🆕 Scaling rápido (opcional)
  }}
  outputItem={materialData}       // Pre-filled
  onSave={(recipe) => {
    material.recipe_id = recipe.id
  }}
/>
```

---

### CONTEXTO 2: Producto

**Ubicación**: Formulario de Producto → Tab "BOM/Receta"

```
┌────────────────────────────────────────────────────────┐
│  PRODUCTO: Hamburguesa Premium                        │
│  ┌─────┬──────────┬──────────┬──────┬────────┐       │
│  │ BOM │ Staff    │ Assets   │ Costs│ Config │       │
│  └─────┴──────────┴──────────┴──────┴────────┘       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ COMPONENTES                                      │ │
│  ├──────────────────────────────────────────────────┤ │
│  │                                                  │ │
│  │ Agregar: [Material] [Producto]  (toggle)         │ │
│  │                                                  │ │
│  │ Item             Tipo       Cant  Unidad  Costo │ │
│  │ Pan              Material   1     unit    $2.00 │ │
│  │ Carne molida     Material   150   g       $8.00 │ │
│  │ Lechuga          Material   50    g       $1.00 │ │
│  │ Queso cheddar    Material   30    g       $1.50 │ │
│  │                                                  │ │
│  │ [+ Agregar Material/Producto]                    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ PRODUCCIÓN                                       │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ Output:         Hamburguesa Premium (pre-filled) │ │
│  │ Cantidad:       [1    ] unit                     │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ COSTOS                                           │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ Costo Materiales:    $12.50                      │ │
│  │ Costo Total BOM:     $12.50                      │ │
│  │ Costo por unidad:    $12.50/unit                 │ │
│  │                                                  │ │
│  │ ℹ️ Costo TOTAL del producto se calcula en        │ │
│  │    tab "Costs" (suma BOM + Staff + Assets)       │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [← Atrás]                                [Siguiente →│
└────────────────────────────────────────────────────────┘
```

**Diferencias con Material Elaborado:**
- ✅ Permite agregar PRODUCTOS además de materiales
- ✅ Toggle para elegir tipo de input
- ✅ Muestra tipo de cada input
- ✅ Costo por unidad (no por peso)

#### **Diagrama de Componentes:**

```
┌────────────────────────────────────────────┐
│  ProductFormWizard (componente padre)     │
│  ├─ Tab "BOM/Receta"                      │
│     └─ RecipeBuilder                      │  ← Componente principal
│        ├─ InputsEditorSection             │  ← Tabla de inputs
│        │  ├─ Toggle [Material|Producto]   │  ← 🆕 Selector de tipo
│        │  ├─ MaterialSelector (×N)        │  ← Si tipo = material
│        │  └─ ProductSelector (×N)         │  ← 🆕 Si tipo = producto
│        ├─ OutputConfigSection             │  ← Config de output
│        │  ├─ Tipo selector                │  ← unitario/conmesurable
│        │  └─ Cantidad input               │
│        └─ CostSummarySection              │  ← Costos BOM (no total)
└────────────────────────────────────────────┘
```

**Props del RecipeBuilder en este contexto:**
```typescript
<RecipeBuilder
  mode={product.recipe_id ? 'edit' : 'create'}
  recipeId={product.recipe_id}
  entityType="product"
  complexity="standard"
  features={{
    showCostCalculation: true,
    showYieldConfig: true,       // Colapsable
    showInstructions: false,     // Post-MVP
    showQualityConfig: false,    // ELIMINADO
    allowProductInputs: true,    // 🆕 Permite productos en inputs
    showScalingLite: true,       // 🆕 Scaling rápido (opcional)
  }}
  outputItem={productData}       // Pre-filled
  onSave={(recipe) => {
    product.recipe_id = recipe.id
  }}
/>
```

---

### CONTEXTO 3: Workshop

**Ubicación**: `/recipes` → Tab "Workshop"

```
┌────────────────────────────────────────────────────────────────┐
│  RECIPE WORKSHOP                                 [Nueva Receta]│
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Receta: [Hamburguesa Premium ▼]  (selector dropdown)         │
│                                                                │
│  ┌─────────────┬────────────────────────────────────────────┐ │
│  │             │                                            │ │
│  │ HERRAMIENTAS│           ÁREA DE TRABAJO                  │ │
│  │             │                                            │ │
│  │ ┌─────────┐ │  ┌──────────────────────────────────────┐ │ │
│  │ │ Scaling │ │  │ VISTA DE RECETA                      │ │ │
│  │ └─────────┘ │  ├──────────────────────────────────────┤ │ │
│  │ ┌─────────┐ │  │ Nombre: Hamburguesa Premium          │ │ │
│  │ │Substit. │ │  │ Tipo:   Producto                     │ │ │
│  │ └─────────┘ │  │                                      │ │ │
│  │ ┌─────────┐ │  │ COMPONENTES:                         │ │ │
│  │ │ Optimize│ │  │ • Pan             1 unit    $2.00    │ │ │
│  │ └─────────┘ │  │ • Carne molida    150 g     $8.00    │ │ │
│  │ ┌─────────┐ │  │ • Lechuga         50 g      $1.00    │ │ │
│  │ │ Compare │ │  │ • Queso           30 g      $1.50    │ │ │
│  │ └─────────┘ │  │                                      │ │ │
│  │             │  │ COSTO TOTAL: $12.50                  │ │ │
│  │             │  └──────────────────────────────────────┘ │ │
│  │             │                                            │ │
│  │  (al hacer  │  [Área reactiva según herramienta]        │ │
│  │   click →   │                                            │ │
│  │   cambia UI)│                                            │ │
│  └─────────────┴────────────────────────────────────────────┘ │
│                                                                │
│  [Descartar Cambios] [Sobreescribir Original] [Guardar Como] │
└────────────────────────────────────────────────────────────────┘
```

**Con herramienta SCALING activa:**

```
┌─────────────┬────────────────────────────────────────────┐
│ HERRAMIENTAS│           SCALING TOOL                     │
│             │                                            │
│ ┌─────────┐ │  Factor: [2.0] ó Cantidad: [2] units      │
│ │✓Scaling │ │                                            │
│ └─────────┘ │  INGREDIENTES ESCALADOS:                   │
│ ┌─────────┐ │  Original → Escalado (x2.0)                │
│ │Substit. │ │  • Pan        1 unit  → 2 units    $4.00   │
│ └─────────┘ │  • Carne      150 g   → 300 g      $16.00  │
│ ┌─────────┐ │  • Lechuga    50 g    → 100 g      $2.00   │
│ │ Optimize│ │  • Queso      30 g    → 60 g       $3.00   │
│ └─────────┘ │                                            │
│ ┌─────────┐ │  COSTO TOTAL: $12.50 → $25.00              │
│ │ Compare │ │                                            │
│ └─────────┘ │  [Aplicar Scaling]                         │
└─────────────┴────────────────────────────────────────────┘
```

**Características Workshop:**
- ✅ Selector de receta arriba
- ✅ Sidebar con herramientas
- ✅ Área reactiva (cambia según herramienta)
- ✅ Opciones: Descartar, Sobreescribir, Guardar Como
- ✅ Preview en tiempo real

#### **Diagrama de Componentes:**

```
┌─────────────────────────────────────────────┐
│  RecipesPage (componente padre)            │
│  ├─ Tab "Workshop"                          │
│     └─ RecipeWorkshop (nuevo componente)   │
│        ├─ RecipeSelector (dropdown)        │  ← 🆕 Selector de receta
│        ├─ Sidebar                          │
│        │  ├─ ToolButton: Scaling           │
│        │  ├─ ToolButton: Substitutions     │
│        │  ├─ ToolButton: Optimize          │
│        │  └─ ToolButton: Compare           │
│        ├─ WorkArea (reactiva)              │
│        │  ├─ RecipePreview (default)       │  ← Vista de receta
│        │  ├─ ScalingTool (si activa)       │  ← Ya existe
│        │  ├─ SubstitutionTool (si activa)  │  ← Post-MVP
│        │  └─ OptimizationTool (si activa)  │  ← Post-MVP
│        └─ ActionButtons                    │
│           ├─ Descartar                     │
│           ├─ Sobreescribir                 │
│           └─ Guardar Como                  │
└─────────────────────────────────────────────┘
```

**Props del Workshop:**
```typescript
<RecipeWorkshop
  mode="workshop"
  selectedRecipe={selectedRecipe}      // Del selector
  onRecipeChange={setSelectedRecipe}   // Callback al seleccionar
  onSave={(recipe, action) => {
    if (action === 'overwrite') {
      // Actualizar receta original
    } else if (action === 'save_as') {
      // Crear nueva receta
    }
  }}
  onDiscard={() => {
    // Reset cambios
  }}
/>
```

---

## 🛠️ COMPONENTES FINALES NECESARIOS

### Resumen de Componentes

| Componente | Acción | Ubicación |
|-----------|--------|-----------|
| **MaterialSelector** | ✅ Reutilizar (ya existe) | `/shared/components/MaterialSelector.tsx` |
| **ProductSelector** | 🆕 Crear nuevo | `/shared/components/ProductSelector.tsx` |
| **RecipeInputsEditor** | 🔄 Modificar (InputsEditorSection) | `/modules/recipe/components/RecipeBuilder/sections/InputsEditorSection.tsx` |
| **OutputConfigSection** | 🔄 Limpiar (eliminar Quality Grade) | `/modules/recipe/components/RecipeBuilder/sections/OutputConfigSection.tsx` |
| **CostSummarySection** | ✅ Mantener (funciona bien) | `/modules/recipe/components/RecipeBuilder/sections/CostSummarySection.tsx` |
| **RecipeBuilder** | 🔄 Ajustar props y lógica | `/modules/recipe/components/RecipeBuilder/RecipeBuilder.tsx` |
| **RecipeWorkshop** | 🔄 Mejorar UI (agregar selector) | `/pages/admin/supply-chain/recipes/page.tsx` |
| **ScalingTool** | ✅ Mantener | `/modules/recipe/components/RecipeWorkshop/ScalingTool.tsx` |
| **MenuEngineeringDashboard** | ✅ Mantener | `/modules/recipe/components/Analytics/MenuEngineeringDashboard.tsx` |

### Componentes a ELIMINAR (Limpieza)

```bash
# Buscar y eliminar si existen (duplicados/legacy):
- RecipeForm.tsx (legacy)
- RecipeFormClean.tsx (legacy)
- RecipeBuilderLite.tsx (legacy)
- RecipeBuilderClean.tsx (legacy)
```

---

## 📊 SCHEMA DE BASE DE DATOS (Propuesto)

### Tabla: `recipes`

```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Metadata
  entity_type TEXT NOT NULL CHECK (entity_type IN ('material', 'product', 'service')),
  execution_mode TEXT NOT NULL CHECK (execution_mode IN ('immediate', 'on_demand')),

  -- Output
  output_item_id UUID NOT NULL,  -- FK a materials/products/services
  output_item_type TEXT NOT NULL, -- 'material', 'product', 'service'
  output_quantity DECIMAL(10,3) NOT NULL,
  output_unit TEXT NOT NULL,

  -- Yield/Waste (opcional)
  yield_percentage DECIMAL(5,2),
  waste_percentage DECIMAL(5,2),

  -- Instrucciones (opcional)
  instructions JSONB, -- Array de steps
  preparation_time INTEGER, -- minutos
  cooking_time INTEGER, -- minutos

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `recipe_inputs`

```sql
CREATE TABLE recipe_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,

  -- Input
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('material', 'product', 'asset')),

  -- Cantidad
  quantity DECIMAL(10,3) NOT NULL,
  unit TEXT NOT NULL,

  -- Yield/Waste por input (opcional)
  yield_percentage DECIMAL(5,2),
  waste_percentage DECIMAL(5,2),

  -- Orden
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipe_inputs_recipe_id ON recipe_inputs(recipe_id);
```

### Relaciones con Materials/Products/Services

```sql
-- En tabla materials
ALTER TABLE materials ADD COLUMN recipe_id UUID REFERENCES recipes(id);

-- En tabla products
ALTER TABLE products ADD COLUMN recipe_id UUID REFERENCES recipes(id);

-- En tabla services (si existe)
ALTER TABLE services ADD COLUMN recipe_id UUID REFERENCES recipes(id);
```

**Cálculo de costos:**
- Material Elaborado: `costo = SUM(recipe_inputs.cost)`
- Producto: `costo_bom = SUM(recipe_inputs.cost)` + `costo_staff` + `costo_assets` + `overhead`
- Servicio: Similar a producto

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Fase 1: Preparación y Auditoría (1 día)

#### 1.1 Auditar código existente
- [ ] Listar todos los componentes relacionados con recipes
- [ ] Identificar qué se puede reutilizar
- [ ] Identificar qué se debe eliminar

#### 1.2 Crear schema de DB
- [ ] Ejecutar migration para `recipes` y `recipe_inputs`
- [ ] Agregar `recipe_id` a `materials`, `products`, `services`
- [ ] Crear índices necesarios

---

### Fase 2: Componentes Base (2-3 días)

#### 2.1 Crear ProductSelector
```typescript
// /shared/components/ProductSelector.tsx
// Similar a MaterialSelector pero para productos
```

#### 2.2 Modificar InputsEditorSection
- [ ] Agregar toggle Material/Producto
- [ ] Integrar ProductSelector
- [ ] Validar tipos según entityType
- [ ] Testing

#### 2.3 Limpiar OutputConfigSection
- [ ] Eliminar Quality Grade
- [ ] Simplificar Yield/Waste (colapsable)
- [ ] Testing

---

### Fase 3: Integraciones (2 días)

#### 3.1 Integración Material Elaborado
- [ ] Verificar que funciona en el modal
- [ ] Testing con datos reales
- [ ] Ajustar UI si es necesario

#### 3.2 Integración Producto
- [ ] Verificar tab BOM en ProductForm
- [ ] Asegurar que permite productos + materiales
- [ ] Testing con encapsulamiento (producto con producto)

---

### Fase 4: Workshop Completo (2-3 días)

#### 4.1 Agregar RecipeSelector
- [ ] Dropdown/buscador de recetas
- [ ] Cargar receta seleccionada en el área de trabajo

#### 4.2 Mejorar UI del Workshop
- [ ] Sidebar con herramientas
- [ ] Área reactiva
- [ ] Acciones: Descartar, Sobreescribir, Guardar Como

#### 4.3 Herramientas adicionales
- [ ] SubstitutionTool (opcional)
- [ ] OptimizationTool (opcional)
- [ ] ComparisonTool (opcional)

---

### Fase 5: Testing y Refinamiento (1-2 días)

#### 5.1 Testing completo
- [ ] Test unitarios de cada componente
- [ ] Test de integración (Material → Recipe, Product → Recipe)
- [ ] Test E2E del Workshop

#### 5.2 Refinamiento UI/UX
- [ ] Ajustes de diseño
- [ ] Feedback del usuario
- [ ] Performance optimization

---

### Fase 6: Limpieza Final (1 día)

#### 6.1 Eliminar código legacy
```bash
# Eliminar componentes no usados:
rm RecipeForm.tsx
rm RecipeFormClean.tsx
rm RecipeBuilderLite.tsx
rm RecipeBuilderClean.tsx

# Buscar referencias:
grep -r "RecipeForm" src/
grep -r "RecipeBuilderLite" src/
```

#### 6.2 Actualizar imports
- [ ] Buscar todos los imports de componentes eliminados
- [ ] Reemplazar por RecipeBuilder

#### 6.3 Documentación final
- [ ] Actualizar README.md del módulo recipe
- [ ] Documentar props de RecipeBuilder
- [ ] Ejemplos de uso

---

## 📈 MÉTRICAS DE ÉXITO

### Antes (Estado Actual)
- ❌ 4+ componentes duplicados
- ❌ Campos inútiles (Quality Grade, etc.)
- ❌ Cálculos manuales
- ❌ No soporta productos en inputs
- ❌ Workshop no integrado

### Después (Objetivo)
- ✅ 1 componente adaptable (RecipeBuilder)
- ✅ Solo campos útiles y automáticos
- ✅ Cálculos 100% automáticos
- ✅ Soporta materiales + productos + (assets?)
- ✅ Workshop completamente funcional
- ✅ Código limpio (0 componentes legacy)

---

## 🎯 CRITERIOS DE ACEPTACIÓN

### RecipeBuilder

- [ ] Se adapta a Material/Producto/Servicio/Workshop sin duplicar código
- [ ] Permite solo materiales en Material Elaborado
- [ ] Permite materiales + productos en Producto
- [ ] Cálculo de costos automático al 100%
- [ ] Output pre-filled en contextos (Material/Producto)
- [ ] NO muestra campos inútiles (Quality Grade eliminado)
- [ ] Yield/Waste es opcional y colapsable

### Workshop

- [ ] Selector de recetas funcional
- [ ] Herramientas aplicadas en tiempo real
- [ ] Opciones: Descartar, Sobreescribir, Guardar Como
- [ ] Scaling Tool integrado
- [ ] Menu Engineering Dashboard funcional

### Limpieza

- [ ] 0 componentes legacy (RecipeForm*, RecipeBuilder* legacy eliminados)
- [ ] 0 imports rotos
- [ ] Documentación actualizada

---

## 📝 NOTAS FINALES

### Decisiones Tomadas

1. **Servicios NO pueden contener Servicios**
   - Un servicio dentro de otro servicio es un edge case muy raro
   - Por simplicidad: `Servicio.inputs = Material[] | Asset[]`
   - NO permite: Servicios

2. **Instrucciones = Post-MVP (🟢 Baja Prioridad)**
   - Útil pero no es foco principal
   - Se implementará en fase posterior
   - Lazy loaded cuando se implemente

3. **Scaling Tool Lite = Opcional (🟡 Media Prioridad)**
   - Botones rápidos (×2, ÷2) en RecipeBuilder
   - NO reemplaza al Workshop completo
   - Implementar después del MVP core

### Decisiones Pendientes

1. **Assets en Servicios**:
   - ¿Se implementan en MVP o Post-MVP?
   - ¿Cómo se representa el costo de un asset en la receta?

2. **Assets en Workshop**:
   - ¿Scaling Tool aplica a assets?
   - Probablemente NO (los assets no se escalan como materiales)

### Próximas Mejoras (Post-MVP)

- [ ] AI Suggestions para optimización
- [ ] Production Tracking (ejecución de recetas)
- [ ] Recipe Versioning
- [ ] Nutrition Info (para gastronomía)
- [ ] Templates más avanzados

---

**FIN DEL DISEÑO DEFINITIVO**

> ✅ Listo para revisión e implementación
