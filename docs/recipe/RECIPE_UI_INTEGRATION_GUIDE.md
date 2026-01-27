# GUÍA DE INTEGRACIÓN UI/UX: Sistema de Recetas
> **Versión**: 1.0.0
> **Fecha**: 2026-01-06
> **Status**: 🎨 **DISEÑO UI COMPLETO** - Listo para implementación

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Componentes Existentes vs Nuevos](#componentes-existentes-vs-nuevos)
3. [CONTEXTO 1: Material Elaborado](#contexto-1-material-elaborado)
4. [CONTEXTO 2: Producto con BOM](#contexto-2-producto-con-bom)
5. [CONTEXTO 3: Workshop (Opcional)](#contexto-3-workshop-opcional)
6. [Componentes a Modificar](#componentes-a-modificar)
7. [Componentes a Crear](#componentes-a-crear)
8. [Flujos de Usuario](#flujos-de-usuario)
9. [Mobile Responsive](#mobile-responsive)
10. [Checklist de Implementación](#checklist-de-implementación)

---

## 🎯 RESUMEN EJECUTIVO

### Objetivo
Integrar el sistema de recetas en **3 contextos** específicos del proyecto actual:

| Contexto | Ubicación | Componente Padre | Estado Actual |
|----------|-----------|------------------|---------------|
| **Material Elaborado** | `/admin/supply-chain/materials` | `ElaboratedFields.tsx` | ✅ YA INTEGRADO (RecipeBuilder básico) |
| **Producto con BOM** | `/admin/supply-chain/products/new` | `RecipeConfigSection.tsx` | 🆕 CREAR (no existe) |
| **Workshop** | Nueva ruta `/admin/recipes/workshop` | `RecipeWorkshopPage.tsx` | 🔮 POST-MVP (opcional) |

### Estrategia de Implementación

**NO crear páginas nuevas desde cero** ✅
**SÍ integrar en flujos existentes** ✅

---

## 📊 COMPONENTES EXISTENTES VS NUEVOS

### ✅ Componentes que YA EXISTEN (reutilizar)

| Componente | Ubicación | Status | Uso en Recipe System |
|------------|-----------|--------|---------------------|
| **RecipeBuilder** | `/modules/recipe/components/RecipeBuilder/` | ✅ Existe | Componente principal |
| **InputsEditorSection** | `/modules/recipe/components/RecipeBuilder/sections/` | ✅ Existe | Editor de ingredientes |
| **OutputConfigSection** | `/modules/recipe/components/RecipeBuilder/sections/` | ✅ Existe | Config de output |
| **CostSummarySection** | `/modules/recipe/components/RecipeBuilder/sections/` | ✅ Existe | Resumen de costos |
| **MaterialSelector** | `/shared/components/MaterialSelector.tsx` | ✅ Existe | Selector de materiales |
| **ScalingTool** | `/modules/recipe/components/RecipeWorkshop/` | ✅ Existe | Escalado de recetas |
| **MenuEngineeringDashboard** | `/modules/recipe/components/Analytics/` | ✅ Existe | Dashboard de analytics |

### 🆕 Componentes a CREAR

| Componente | Ubicación | Prioridad | Propósito |
|------------|-----------|-----------|-----------|
| **ProductSelector** | `/shared/components/ProductSelector.tsx` | 🔴 ALTA | Selector de productos (análogo a MaterialSelector) |
| **RecipeConfigSection** | `/pages/admin/supply-chain/products/components/sections/` | 🔴 ALTA | Sección de BOM en ProductFormWizard |
| **RecipeWorkshopPage** | `/pages/admin/recipes/workshop/page.tsx` | 🔮 POST-MVP | Página independiente de Workshop |

### 🔄 Componentes a MODIFICAR

| Componente | Modificación | Prioridad | Razón |
|------------|-------------|-----------|-------|
| **InputsEditorSection** | Agregar toggle Material/Product | 🔴 ALTA | Soportar productos como inputs |
| **RecipeBuilder** | Agregar prop `allowProductInputs` | 🔴 ALTA | Controlar qué inputs se permiten |
| **ElaboratedFields** | Actualizar props de RecipeBuilder | 🟡 MEDIA | Pasar nuevas features |
| **OutputConfigSection** | Eliminar "Quality Grade" | 🟡 MEDIA | Limpiar campos obsoletos |
| **formSectionsRegistry** | Verificar `recipe_config` está registrado | ✅ YA EXISTE | Solo verificar |

---

## 📱 CONTEXTO 1: MATERIAL ELABORADO

### Ubicación
`/pages/admin/supply-chain/materials` → Modal "Nuevo Material" → Tipo: "Elaborado"

### Flujo de Usuario
```
1. Usuario hace click en "Nuevo Material"
2. Llena nombre, categoría
3. Selecciona tipo: "Elaborado"
4. ↓ Se muestra RecipeBuilder automáticamente
5. Usuario agrega materiales (solo materiales, NO productos)
6. Define cantidad de output
7. Sistema calcula costo automáticamente
8. Usuario guarda
```

### Wireframe: Material Elaborado (Desktop)

```
┌──────────────────────────────────────────────────────────────────┐
│  NUEVO MATERIAL: Pan Casero                            [×] Cerrar│
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Información Básica                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Nombre *         [Pan Casero__________________]            │ │
│  │ Categoría *      [Panadería ▼]                             │ │
│  │ Tipo *           ○ Countable  ● Measurable                 │ │
│  │ Unidad *         [kg ▼]                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ⚠️ Material Elaborado                                          │
│  Los materiales elaborados requieren una receta. Al guardar,    │
│  se ejecutará automáticamente para generar stock.               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ RECETA                                                     │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                            │ │
│  │ 📋 INGREDIENTES (Solo Materiales)                          │ │
│  │ ┌──────────────────────────────────────────────────────┐  │ │
│  │ │  Material          Cantidad   Unidad   Costo   [×]   │  │ │
│  │ │ ────────────────────────────────────────────────────  │  │ │
│  │ │  Harina           500         g        $10.00  [×]   │  │ │
│  │ │  Agua             300         ml       $0.50   [×]   │  │ │
│  │ │  Levadura         10          g        $5.00   [×]   │  │ │
│  │ │                                                       │  │ │
│  │ │  [+ Agregar Material]                                │  │ │
│  │ └──────────────────────────────────────────────────────┘  │ │
│  │                                                            │ │
│  │ 🎯 OUTPUT                                                  │ │
│  │ ┌──────────────────────────────────────────────────────┐  │ │
│  │ │  Producto:      Pan Casero (auto-filled)             │  │ │
│  │ │  Cantidad:      [1____] kg                           │  │ │
│  │ │  Unidad:        kg (heredado)                        │  │ │
│  │ └──────────────────────────────────────────────────────┘  │ │
│  │                                                            │ │
│  │ ⚙️ Configuración Avanzada (collapsed) ▼                   │ │
│  │                                                            │ │
│  │ 💰 COSTOS (Calculado Automáticamente)                     │ │
│  │ ┌──────────────────────────────────────────────────────┐  │ │
│  │ │  Costo Total:        $15.50                          │  │ │
│  │ │  Costo por kg:       $15.50/kg                       │  │ │
│  │ │                                                       │  │ │
│  │ │  Desglose:                                            │  │ │
│  │ │  • Harina:    $10.00 (64.5%)                         │  │ │
│  │ │  • Agua:      $0.50  (3.2%)                          │  │ │
│  │ │  • Levadura:  $5.00  (32.3%)                         │  │ │
│  │ └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [Cancelar]                                   [Guardar Material] │
└──────────────────────────────────────────────────────────────────┘
```

### Wireframe: Material Elaborado (Mobile)

```
┌─────────────────────────┐
│ ☰ Pan Casero      [×]  │
├─────────────────────────┤
│                         │
│ Información Básica      │
│ ┌─────────────────────┐ │
│ │ Nombre *            │ │
│ │ [Pan Casero_____]   │ │
│ │                     │ │
│ │ Categoría *         │ │
│ │ [Panadería ▼]       │ │
│ │                     │ │
│ │ Tipo *              │ │
│ │ [Medible ▼]         │ │
│ │                     │ │
│ │ Unidad *            │ │
│ │ [kg ▼]              │ │
│ └─────────────────────┘ │
│                         │
│ ⚠️ Material Elaborado   │
│ Requiere receta         │
│                         │
│ ▼ INGREDIENTES (3)      │
│ ┌─────────────────────┐ │
│ │ 🌾 Harina           │ │
│ │ 500g    $10.00      │ │
│ │ [Editar] [×]        │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 💧 Agua             │ │
│ │ 300ml   $0.50       │ │
│ │ [Editar] [×]        │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 🧪 Levadura         │ │
│ │ 10g     $5.00       │ │
│ │ [Editar] [×]        │ │
│ └─────────────────────┘ │
│                         │
│ [+ Agregar Material]    │
│                         │
│ ▼ OUTPUT                │
│ ┌─────────────────────┐ │
│ │ Producto:           │ │
│ │ Pan Casero          │ │
│ │                     │ │
│ │ Cantidad:           │ │
│ │ [1__] kg            │ │
│ └─────────────────────┘ │
│                         │
│ ▼ COSTOS                │
│ ┌─────────────────────┐ │
│ │ Total: $15.50       │ │
│ │ /kg:   $15.50       │ │
│ │                     │ │
│ │ Ver desglose ▼      │ │
│ └─────────────────────┘ │
│                         │
│ [Cancelar] [Guardar]    │
└─────────────────────────┘
```

### Código: ElaboratedFields (Estado Actual)

**Archivo**: `/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/ElaboratedFields.tsx`

**✅ YA ESTÁ INTEGRADO** - Solo necesita pequeños ajustes:

```tsx
// ANTES (Estado actual - básico)
<RecipeBuilder
  mode="create"
  entityType="material"
  complexity="minimal"
  features={{
    showCostCalculation: true,
    showInstructions: false,
    showYieldConfig: false,
    showQualityConfig: false,  // ❌ Eliminar (obsoleto)
  }}
  outputItem={outputItem}
  outputQuantity={formData.initial_stock || 1}
  onSave={handleRecipeSaved}
/>

// DESPUÉS (Actualizar props)
<RecipeBuilder
  mode="create"
  entityType="material"
  complexity="minimal"
  features={{
    showCostCalculation: true,
    showScrapConfig: true,      // 🆕 AGREGAR (colapsable)
    showInstructions: false,     // Post-MVP
    allowProductInputs: false,   // 🆕 Solo materiales
  }}
  outputItem={outputItem}
  onSave={handleRecipeSaved}
/>
```

**Cambios necesarios**:
1. ❌ Eliminar `showQualityConfig` (obsoleto)
2. ✅ Agregar `showScrapConfig: true` (para merma/desperdicio)
3. ✅ Agregar `allowProductInputs: false` (solo materiales)

---

## 🏭 CONTEXTO 2: PRODUCTO CON BOM

### Ubicación
`/pages/admin/supply-chain/products/new` → Wizard Step 3: "Bill of Materials (BOM)"

### Flujo de Usuario
```
1. Usuario hace click en "Nuevo Producto"
2. Step 1: Información básica (nombre, tipo, etc.)
3. Step 2: Recursos y operación (staff, assets)
4. Step 3: Bill of Materials (BOM) ← AQUÍ VA EL RECIPE
   └─ Usuario puede agregar MATERIALES y PRODUCTOS
   └─ Sistema valida circularidad
   └─ Cálculo de costos automático
5. Step 4: Pricing (precio de venta)
6. Usuario guarda producto
```

### Wireframe: Producto BOM (Desktop)

```
┌────────────────────────────────────────────────────────────────────┐
│  NUEVO PRODUCTO: Hamburguesa Premium                        [×]   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Step 3 de 4: Bill of Materials (BOM)                             │
│  Progress: [████████████████░░░░░░░░] 75%                        │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ COMPONENTES DEL PRODUCTO                                     │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │ Agregar: [Material] [Producto]  ← Toggle buttons             │ │
│  │                                                              │ │
│  │ ┌──────────────────────────────────────────────────────┐    │ │
│  │ │ Item           Tipo      Cant  Unidad  Costo  [×]    │    │ │
│  │ │ ──────────────────────────────────────────────────── │    │ │
│  │ │ Pan            Material  1     unit    $2.00   [×]    │    │ │
│  │ │ Carne molida   Material  150   g       $8.00   [×]    │    │ │
│  │ │ Lechuga        Material  50    g       $1.00   [×]    │    │ │
│  │ │ Queso cheddar  Material  30    g       $1.50   [×]    │    │ │
│  │ │                                                        │    │ │
│  │ │ [+ Agregar Material] [+ Agregar Producto]             │    │ │
│  │ └──────────────────────────────────────────────────────┘    │ │
│  │                                                              │ │
│  │ ℹ️ También puedes agregar productos (ej: combos, kits)       │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ OUTPUT                                                       │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ Producto:    Hamburguesa Premium (pre-filled)                │ │
│  │ Cantidad:    [1____] unit                                    │ │
│  │ Unidad:      unit (heredado del producto)                    │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ COSTOS BOM                                                   │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ Costo Materiales:    $12.50                                  │ │
│  │ Costo Total BOM:     $12.50                                  │ │
│  │ Costo por unidad:    $12.50/unit                             │ │
│  │                                                               │ │
│  │ ℹ️ Costo TOTAL del producto se calcula en Step 4 (Pricing)   │ │
│  │    (suma BOM + Staff + Assets + Overhead)                    │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  [← Anterior: Recursos]          [Siguiente: Pricing →]           │
└────────────────────────────────────────────────────────────────────┘
```

### Wireframe: Producto con Producto Encapsulado

```
┌────────────────────────────────────────────────────────────────────┐
│  NUEVO PRODUCTO: Combo Mega                                 [×]   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Step 3 de 4: Bill of Materials (BOM)                             │
│  Progress: [████████████████░░░░░░░░] 75%                        │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ COMPONENTES DEL PRODUCTO                                     │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │ Agregar: [Material] [Producto]  ← Toggle buttons             │ │
│  │                                                              │ │
│  │ ┌──────────────────────────────────────────────────────┐    │ │
│  │ │ Item              Tipo      Cant  Unidad  Costo [×] │    │ │
│  │ │ ──────────────────────────────────────────────────── │    │ │
│  │ │ Hamburguesa       Product   1     unit    $12.50 [×] │    │ │
│  │ │   └─ [Ver BOM]    └─ (costo ya calculado)           │    │ │
│  │ │ Papas Fritas      Product   1     unit    $3.00  [×] │    │ │
│  │ │   └─ [Ver BOM]                                       │    │ │
│  │ │ Bebida Grande     Product   1     unit    $2.00  [×] │    │ │
│  │ │                                                        │    │ │
│  │ │ [+ Agregar Material] [+ Agregar Producto]             │    │ │
│  │ └──────────────────────────────────────────────────────┘    │ │
│  │                                                              │ │
│  │ ✅ Los productos ya tienen su BOM calculado                  │ │
│  │ ⚠️ Se usa el costo FINAL del producto (no se recalcula BOM)  │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ COSTOS BOM                                                   │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ Hamburguesa:         $12.50                                  │ │
│  │ Papas Fritas:        $3.00                                   │ │
│  │ Bebida Grande:       $2.00                                   │ │
│  │ ──────────────────────────                                   │ │
│  │ Costo Total BOM:     $17.50                                  │ │
│  │ Costo por combo:     $17.50/unit                             │ │
│  │                                                               │ │
│  │ 💡 Precio sugerido (40% margin): $29.17                      │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  [← Anterior: Recursos]          [Siguiente: Pricing →]           │
└────────────────────────────────────────────────────────────────────┘
```

### Código: RecipeConfigSection (🆕 CREAR)

**Archivo**: `/pages/admin/supply-chain/products/components/sections/RecipeConfigSection.tsx`

**Este componente NO EXISTE** - Hay que crearlo:

```tsx
/**
 * RecipeConfigSection
 *
 * Sección del ProductFormWizard para configurar BOM (Bill of Materials).
 * Usa RecipeBuilder configurado para permitir productos como inputs.
 */

import { Box, Stack } from '@/shared/ui';
import { RecipeBuilder } from '@/modules/recipe/components';
import type { ProductFormData } from '../../types/productForm';
import type { Recipe } from '@/modules/recipe/types';
import { memo, useCallback, useMemo } from 'react';

interface RecipeConfigSectionProps {
  formData: ProductFormData;
  onChange: (data: Partial<ProductFormData>) => void;
  readOnly?: boolean;
}

export const RecipeConfigSection = memo(function RecipeConfigSection({
  formData,
  onChange,
  readOnly = false
}: RecipeConfigSectionProps) {

  // Construir outputItem del producto
  const outputItem = useMemo(() => {
    if (!formData.basic_info?.name) return undefined;

    return {
      id: formData.id || 'temp',
      name: formData.basic_info.name,
      type: 'product' as const,
      unit: formData.basic_info.unit || 'unit',
    };
  }, [formData.id, formData.basic_info]);

  // Handler cuando se guarda la receta
  const handleRecipeSaved = useCallback((recipe: Recipe) => {
    onChange({
      recipe_id: recipe.id,
      // Actualizar BOM cost si está disponible
      bom_cost: recipe.costConfig?.totalCost
    });
  }, [onChange]);

  return (
    <Stack gap="6" w="full">
      <Box w="full">
        <RecipeBuilder
          mode={formData.recipe_id ? 'edit' : 'create'}
          recipeId={formData.recipe_id}
          entityType="product"
          complexity="standard"
          features={{
            showCostCalculation: true,
            showScrapConfig: true,      // Colapsable
            showInstructions: false,     // Post-MVP
            allowProductInputs: true,    // 🆕 PERMITIR PRODUCTOS
          }}
          outputItem={outputItem}
          onSave={handleRecipeSaved}
          readOnly={readOnly}
        />
      </Box>
    </Stack>
  );
});
```

### Registro en formSectionsRegistry

**Archivo**: `/pages/admin/supply-chain/products/config/formSectionsRegistry.tsx`

**✅ YA EXISTE** la entrada `recipe_config` - Solo verificar:

```tsx
recipe_config: {
  id: 'recipe_config',
  label: 'Bill of Materials (BOM)',
  component: RecipeConfigSection,  // ← Importar el nuevo componente
  requiredFeatures: ['production_bom_management'],
  visibilityRule: (type, activeFeatures) => {
    if (!activeFeatures.includes('production_bom_management')) {
      return false;
    }
    return type === 'physical_product';
  },
  order: 3
},
```

---

## 🧪 CONTEXTO 3: WORKSHOP (POST-MVP)

### Ubicación
Nueva ruta: `/admin/recipes/workshop`

### Cuándo implementar
🔮 **POST-MVP** - Solo después de tener Material Elaborado y Producto BOM funcionando.

### Wireframe: Workshop (Desktop)

```
┌────────────────────────────────────────────────────────────────────┐
│  RECIPE WORKSHOP                                    [Nueva Receta] │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Receta: [Hamburguesa Premium ▼]  (selector dropdown)             │
│                                                                    │
│  ┌─────────────┬────────────────────────────────────────────────┐ │
│  │             │                                                │ │
│  │ HERRAMIENTAS│           ÁREA DE TRABAJO                      │ │
│  │             │                                                │ │
│  │ ┌─────────┐ │  ┌──────────────────────────────────────────┐ │ │
│  │ │ Scaling │ │  │ VISTA DE RECETA                          │ │ │
│  │ └─────────┘ │  ├──────────────────────────────────────────┤ │ │
│  │ ┌─────────┐ │  │ Nombre: Hamburguesa Premium              │ │ │
│  │ │Substit. │ │  │ Tipo:   Producto                         │ │ │
│  │ └─────────┘ │  │                                          │ │ │
│  │ ┌─────────┐ │  │ COMPONENTES:                             │ │ │
│  │ │ Optimize│ │  │ • Pan             1 unit    $2.00        │ │ │
│  │ └─────────┘ │  │ • Carne molida    150 g     $8.00        │ │ │
│  │             │  │ • Lechuga         50 g      $1.00        │ │ │
│  │             │  │ • Queso           30 g      $1.50        │ │ │
│  │             │  │                                          │ │ │
│  │             │  │ COSTO TOTAL: $12.50                      │ │ │
│  │             │  └──────────────────────────────────────────┘ │ │
│  │             │                                                │ │
│  │  (al hacer  │  [Área reactiva según herramienta]            │ │
│  │   click →   │                                                │ │
│  │   cambia UI)│                                                │ │
│  └─────────────┴────────────────────────────────────────────────┘ │
│                                                                    │
│  [Descartar Cambios] [Sobreescribir Original] [Guardar Como Nuevo]│
└────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 COMPONENTES A MODIFICAR

### 1. InputsEditorSection (MODIFICAR)

**Archivo**: `/modules/recipe/components/RecipeBuilder/sections/InputsEditorSection.tsx`

**Cambios necesarios**:

```tsx
// ANTES (solo MaterialSelector)
<MaterialSelector onMaterialSelected={handleAddMaterial} />

// DESPUÉS (toggle Material/Product)
interface InputsEditorSectionProps {
  // ...existing props
  allowProductInputs?: boolean;  // 🆕 AGREGAR
}

// En el componente:
const [inputMode, setInputMode] = useState<'material' | 'product'>('material');

return (
  <Stack gap="4">
    {/* Toggle buttons (solo si allowProductInputs === true) */}
    {allowProductInputs && (
      <HStack gap="2">
        <Button
          variant={inputMode === 'material' ? 'solid' : 'outline'}
          onClick={() => setInputMode('material')}
        >
          Material
        </Button>
        <Button
          variant={inputMode === 'product' ? 'solid' : 'outline'}
          onClick={() => setInputMode('product')}
        >
          Producto
        </Button>
      </HStack>
    )}

    {/* Selector dinámico */}
    {inputMode === 'material' ? (
      <MaterialSelector onMaterialSelected={handleAddMaterial} />
    ) : (
      <ProductSelector onProductSelected={handleAddProduct} />  // 🆕 NUEVO
    )}

    {/* Tabla de inputs existentes */}
    {/* ... */}
  </Stack>
);
```

### 2. RecipeBuilder (MODIFICAR)

**Archivo**: `/modules/recipe/components/RecipeBuilder/RecipeBuilder.tsx`

**Cambios necesarios**:

```tsx
interface RecipeBuilderProps {
  // ...existing props
  features: {
    showCostCalculation: boolean;
    showScrapConfig?: boolean;      // 🆕 AGREGAR (reemplaza showYieldConfig)
    showInstructions?: boolean;
    allowProductInputs?: boolean;   // 🆕 AGREGAR
  };
}

// Pasar allowProductInputs a InputsEditorSection:
<InputsEditorSection
  inputs={recipe.inputs}
  onChange={handleInputsChange}
  allowProductInputs={features.allowProductInputs}  // 🆕 PASAR
/>
```

### 3. OutputConfigSection (MODIFICAR)

**Archivo**: `/modules/recipe/components/RecipeBuilder/sections/OutputConfigSection.tsx`

**Cambios necesarios**:

```tsx
// ELIMINAR: "Quality Grade" selector
// ❌ const [qualityGrade, setQualityGrade] = useState<QualityGrade>(...);

// ELIMINAR del render:
// ❌ <SelectField label="Quality Grade" ... />

// MANTENER solo:
// ✅ Output item (pre-filled, read-only)
// ✅ Output quantity
// ✅ Output unit (heredado, read-only)
```

---

## 🆕 COMPONENTES A CREAR

### 1. ProductSelector (CREAR)

**Archivo**: `/shared/components/ProductSelector.tsx`

**Inspiración**: Copiar estructura de `MaterialSelector.tsx`

```tsx
/**
 * ProductSelector
 *
 * Selector de productos con búsqueda/autocomplete.
 * Similar a MaterialSelector pero para productos.
 */

import { useState } from 'react';
import { Input, Box, Stack } from '@/shared/ui';
import type { Product } from '@/types';

interface ProductSelectorProps {
  onProductSelected: (product: Product) => void;
  placeholder?: string;
  excludeIds?: string[];      // Evitar seleccionar el producto padre
  filterByType?: string;      // 'finished_good', 'sub_assembly', etc.
  showCost?: boolean;         // Mostrar costo en dropdown
  showStock?: boolean;        // Mostrar stock en dropdown
}

export function ProductSelector({
  onProductSelected,
  placeholder = 'Buscar producto...',
  excludeIds = [],
  showCost = true,
  showStock = false
}: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Fetch products con búsqueda
  const { data: products, isLoading } = useQuery(
    ['products', searchQuery],
    () => fetchProducts({ search: searchQuery, excludeIds })
  );

  const handleSelect = (product: Product) => {
    onProductSelected(product);
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <Box position="relative" w="full">
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />

      {isOpen && products && products.length > 0 && (
        <Box
          position="absolute"
          top="100%"
          left="0"
          right="0"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          maxH="300px"
          overflowY="auto"
          zIndex="dropdown"
          boxShadow="md"
        >
          <Stack gap="0">
            {products.map(product => (
              <Box
                key={product.id}
                p="3"
                cursor="pointer"
                _hover={{ bg: 'purple.50' }}
                onClick={() => handleSelect(product)}
              >
                <Stack gap="1">
                  <span className="font-medium">{product.name}</span>
                  <HStack gap="2" fontSize="sm" color="gray.600">
                    {showCost && <span>Costo: ${product.finalCost || product.unitCost}</span>}
                    {showStock && <span>Stock: {product.currentStock}</span>}
                  </HStack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
```

### 2. RecipeConfigSection (CREAR)

**Archivo**: `/pages/admin/supply-chain/products/components/sections/RecipeConfigSection.tsx`

**Código**: Ver sección [CONTEXTO 2: Producto con BOM](#código-recipeconfigsection-🆕-crear) arriba.

### 3. RecipeWorkshopPage (POST-MVP)

**Archivo**: `/pages/admin/recipes/workshop/page.tsx`

**Implementar solo si es necesario** - No es parte del MVP.

---

## 🚶 FLUJOS DE USUARIO

### Flujo 1: Crear Material Elaborado

```
┌─────────────────────────────────────────────────────────────┐
│ INICIO                                                      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Usuario navega a /admin/supply-chain/materials             │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Click en "Nuevo Material"                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ MaterialFormModal se abre                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Usuario llena:                                              │
│ • Nombre: "Pan Casero"                                      │
│ • Categoría: "Panadería"                                    │
│ • Tipo: "Measurable"                                        │
│ • Unidad: "kg"                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Sistema detecta que es "elaborated" → muestra RecipeBuilder │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Usuario agrega ingredientes:                                │
│ • Click "+ Agregar Material"                                │
│ • Busca "Harina" → selecciona                               │
│ • Ingresa cantidad: 500g                                    │
│ • Repite para Agua (300ml), Levadura (10g)                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Usuario define output:                                      │
│ • Cantidad: 1 kg                                            │
│ • (Unidad heredada de material: kg)                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Sistema calcula costos AUTOMÁTICAMENTE:                     │
│ • Costo total: $15.50                                       │
│ • Costo por kg: $15.50/kg                                   │
│ • Desglose visible                                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Usuario click "Guardar Material"                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Sistema:                                                    │
│ 1. Crea material                                            │
│ 2. Crea recipe                                              │
│ 3. Crea recipe_inputs (3 ingredientes)                      │
│ 4. Linkea material.recipe_id → recipe.id                    │
│ 5. Ejecuta recipe (execution_mode='immediate')              │
│ 6. Reduce stock de materiales                               │
│ 7. Incrementa stock de "Pan Casero"                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Material aparece en lista con costo calculado               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ FIN                                                         │
└─────────────────────────────────────────────────────────────┘
```

### Flujo 2: Crear Producto con BOM

```
┌─────────────────────────────────────────────────────────────┐
│ INICIO                                                      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Usuario navega a /admin/supply-chain/products              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Click en "Nuevo Producto"                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ProductFormWizard - Step 1: Información Básica              │
│ • Nombre: "Hamburguesa Premium"                             │
│ • Tipo: "Physical Product"                                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Click "Siguiente" → Step 2: Recursos y Operación            │
│ • Staff: Chef (30 min)                                      │
│ • Assets: Parrilla (15 min)                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Click "Siguiente" → Step 3: Bill of Materials (BOM)         │
│ ← RecipeConfigSection se muestra                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Usuario elige tipo de input: [Material] o [Producto]        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Agrega materiales:                                          │
│ • Pan (1 unit)                                              │
│ • Carne molida (150g)                                       │
│ • Lechuga (50g)                                             │
│ • Queso (30g)                                               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Sistema calcula costo BOM: $12.50                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Click "Siguiente" → Step 4: Pricing                         │
│ • Costo BOM: $12.50 (auto-filled)                           │
│ • Costo Staff: $5.00 (auto-calculated)                      │
│ • Costo Assets: $2.00 (auto-calculated)                     │
│ • Costo Total: $19.50                                       │
│ • Usuario define precio: $35.00                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Usuario click "Guardar Producto"                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Sistema:                                                    │
│ 1. Crea product                                             │
│ 2. Crea recipe con execution_mode='on_demand'               │
│ 3. Crea recipe_inputs (4 materiales)                        │
│ 4. Linkea product.recipe_id → recipe.id                     │
│ 5. Guarda costos calculados                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Producto aparece en catálogo                                │
│ Al vender → ejecuta recipe → reduce stock de ingredientes   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ FIN                                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 MOBILE RESPONSIVE

### Principios Mobile-First

1. **Touch-friendly**: Botones mínimo 44px de alto
2. **Sin hover**: Evitar efectos que requieran mouse
3. **Scroll vertical**: No scroll horizontal
4. **Cards sobre tablas**: Tablas se convierten en cards stacked
5. **Modals fullscreen**: Modales ocupan toda la pantalla en mobile

### Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  - Stack vertical
  - Cards en lugar de tables
  - Botones full-width
  - Modales fullscreen
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  - Tabla simplificada
  - Sidebar colapsable
  - 2 columnas si es posible
}

/* Desktop */
@media (min-width: 1025px) {
  - Tabla completa
  - Sidebar fijo
  - Múltiples columnas
}
```

### Ejemplo: InputsEditorSection Mobile

```
Desktop:
┌──────────────────────────────────────────────────────┐
│ Item          Cantidad  Unidad  Costo  [×]           │
│ ──────────────────────────────────────────────────── │
│ Pan           1         unit    $2.00  [×]           │
│ Carne molida  150       g       $8.00  [×]           │
└──────────────────────────────────────────────────────┘

Mobile:
┌─────────────────────┐
│ 🥖 Pan              │
│ 1 unit              │
│ Costo: $2.00        │
│ [Editar] [×]        │
└─────────────────────┘
┌─────────────────────┐
│ 🥩 Carne molida     │
│ 150 g               │
│ Costo: $8.00        │
│ [Editar] [×]        │
└─────────────────────┘
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Preparación (1 día)

- [ ] Leer RECIPE_TECHNICAL_ARCHITECTURE.md completo
- [ ] Leer RECIPE_UI_INTEGRATION_GUIDE.md completo
- [ ] Ejecutar migraciones de DB (ver TECHNICAL_ARCHITECTURE.md)
- [ ] Verificar que `production_bom_management` capability está activa
- [ ] Backup de DB antes de comenzar

### Fase 2: Componente ProductSelector (1 día)

- [ ] Crear `/shared/components/ProductSelector.tsx`
- [ ] Copiar estructura de `MaterialSelector.tsx`
- [ ] Implementar búsqueda/autocomplete
- [ ] Implementar `excludeIds` para evitar circularidad
- [ ] Testing: Buscar productos, seleccionar, verificar exclusión
- [ ] Testing mobile: Verificar selector funciona en pantalla pequeña

### Fase 3: Modificar RecipeBuilder (1 día)

- [ ] Abrir `/modules/recipe/components/RecipeBuilder/RecipeBuilder.tsx`
- [ ] Agregar prop `allowProductInputs?: boolean` a `features`
- [ ] Pasar prop a `InputsEditorSection`
- [ ] Eliminar lógica de `Quality Grade` (obsoleto)
- [ ] Agregar `showScrapConfig` para reemplazar `showYieldConfig`
- [ ] Testing: Verificar props se pasan correctamente

### Fase 4: Modificar InputsEditorSection (1-2 días)

- [ ] Abrir `/modules/recipe/components/RecipeBuilder/sections/InputsEditorSection.tsx`
- [ ] Agregar prop `allowProductInputs?: boolean`
- [ ] Agregar state `inputMode: 'material' | 'product'`
- [ ] Implementar toggle buttons [Material] [Producto]
- [ ] Renderizar `MaterialSelector` o `ProductSelector` según modo
- [ ] Implementar `handleAddProduct()`
- [ ] Validar que solo muestra productos si `allowProductInputs === true`
- [ ] Testing: Agregar materiales, agregar productos, validar restricciones
- [ ] Testing mobile: Verificar toggle funciona en mobile

### Fase 5: Crear RecipeConfigSection (1 día)

- [ ] Crear `/pages/admin/supply-chain/products/components/sections/RecipeConfigSection.tsx`
- [ ] Implementar según código de referencia (ver arriba)
- [ ] Configurar `RecipeBuilder` con `allowProductInputs: true`
- [ ] Implementar `handleRecipeSaved()` para actualizar formData
- [ ] Agregar a index de sections: `/pages/admin/supply-chain/products/components/sections/index.ts`
- [ ] Testing: Verificar se muestra en wizard step 3
- [ ] Testing: Agregar materiales y productos, guardar

### Fase 6: Actualizar formSectionsRegistry (30 min)

- [ ] Abrir `/pages/admin/supply-chain/products/config/formSectionsRegistry.tsx`
- [ ] Importar `RecipeConfigSection`
- [ ] Verificar entrada `recipe_config` está correcta
- [ ] Testing: Verificar sección aparece solo en `physical_product`

### Fase 7: Actualizar ElaboratedFields (30 min)

- [ ] Abrir `/pages/admin/supply-chain/materials/components/.../ElaboratedFields.tsx`
- [ ] Actualizar props de `RecipeBuilder`:
  - [ ] Eliminar `showQualityConfig`
  - [ ] Agregar `showScrapConfig: true`
  - [ ] Agregar `allowProductInputs: false`
- [ ] Testing: Verificar material elaborado sigue funcionando

### Fase 8: Testing de Integración (1 día)

- [ ] **Test 1**: Crear material elaborado completo
  - [ ] Verificar recipe se crea
  - [ ] Verificar costos se calculan
  - [ ] Verificar stock se reduce (execution_mode='immediate')
- [ ] **Test 2**: Crear producto con BOM (solo materiales)
  - [ ] Verificar step 3 muestra RecipeConfigSection
  - [ ] Agregar materiales
  - [ ] Verificar costos en step 4
  - [ ] Guardar y verificar recipe_id se linkea
- [ ] **Test 3**: Crear producto con BOM (materiales + productos)
  - [ ] Verificar toggle Material/Producto funciona
  - [ ] Agregar un producto como input
  - [ ] Verificar costo se calcula con finalCost del producto
  - [ ] Guardar y verificar
- [ ] **Test 4**: Prevención de circularidad
  - [ ] Crear Producto A con Producto B
  - [ ] Intentar crear Producto B con Producto A
  - [ ] Verificar se muestra error de circularidad
- [ ] **Test 5**: Profundidad máxima
  - [ ] Crear cadena A → B → C (3 niveles)
  - [ ] Intentar crear D con C (4 niveles)
  - [ ] Verificar se muestra error de profundidad

### Fase 9: Testing Mobile (1 día)

- [ ] Abrir DevTools → modo responsive (375px width)
- [ ] **Test Material Elaborado mobile**:
  - [ ] Modal se ve fullscreen
  - [ ] Inputs stacked verticalmente
  - [ ] Botones touch-friendly (44px mínimo)
  - [ ] Sin scroll horizontal
- [ ] **Test Producto BOM mobile**:
  - [ ] Wizard navigation funciona
  - [ ] Tabla de inputs se convierte a cards
  - [ ] Toggle Material/Producto es touch-friendly
  - [ ] Selector de materiales/productos funciona

### Fase 10: Validaciones y Errores (1 día)

- [ ] Verificar validación de inputs vacíos
- [ ] Verificar validación de cantidades negativas
- [ ] Verificar validación de scrap factor > 100%
- [ ] Verificar mensajes de error son claros
- [ ] Verificar warnings (scrap > 50%, costo cero, etc.)
- [ ] Testing: Intentar guardar recipe inválida → ver errores

### Fase 11: Performance & Polish (1 día)

- [ ] Verificar no hay N+1 queries (ver TECHNICAL_ARCHITECTURE.md)
- [ ] Implementar debouncing en cálculos (500ms)
- [ ] Verificar cache de costos funciona (React Query)
- [ ] Polish UI: Espaciados, colores, consistencia
- [ ] Agregar loading states
- [ ] Agregar skeleton loaders

### Fase 12: Documentación (1 día)

- [ ] Actualizar README del módulo recipe
- [ ] Documentar props de RecipeBuilder
- [ ] Documentar props de ProductSelector
- [ ] Crear ejemplos de uso
- [ ] Screenshots de UI final
- [ ] Video demo (opcional)

---

## 🎯 CRITERIOS DE ÉXITO

### Funcionales

- [ ] ✅ Puedo crear un material elaborado con receta
- [ ] ✅ El costo se calcula automáticamente
- [ ] ✅ Puedo crear un producto con BOM (solo materiales)
- [ ] ✅ Puedo crear un producto con BOM (materiales + productos)
- [ ] ✅ El sistema previene circularidad
- [ ] ✅ El sistema previene profundidad > 3 niveles
- [ ] ✅ Los costos de productos encapsulados usan finalCost
- [ ] ✅ La receta se guarda correctamente en DB
- [ ] ✅ El material/producto se linkea a la receta (recipe_id)

### No Funcionales

- [ ] ✅ UI es responsive (funciona en mobile)
- [ ] ✅ Touch-friendly (botones 44px mínimo)
- [ ] ✅ Sin scroll horizontal en mobile
- [ ] ✅ Cálculos se ejecutan en < 100ms
- [ ] ✅ No hay N+1 queries
- [ ] ✅ Cache funciona correctamente
- [ ] ✅ Loading states son visibles
- [ ] ✅ Errores se muestran claramente

### UX

- [ ] ✅ Flujo intuitivo (no requiere explicación)
- [ ] ✅ Mensajes de error son claros
- [ ] ✅ Feedback visual en cada acción
- [ ] ✅ Botones disabled cuando no son aplicables
- [ ] ✅ Tooltip/help text donde sea necesario
- [ ] ✅ Confirmaciones antes de acciones destructivas

---

## 📚 REFERENCIAS

### Documentos Relacionados

- **RECIPE_TECHNICAL_ARCHITECTURE.md**: Schema DB, validaciones, cálculos
- **RECIPE_DESIGN_DEFINITIVO.md**: Propuesta original de diseño
- **MODAL_STATE_BEST_PRACTICES.md**: Patterns de modal state
- **ZUSTAND_SELECTOR_VALIDATION.md**: Patterns de Zustand

### Componentes de Referencia

- **MaterialSelector**: `/shared/components/MaterialSelector.tsx`
- **CustomerSelector**: `/shared/components/CustomerSelector.tsx`
- **ProductFormWizard**: `/pages/admin/supply-chain/products/components/ProductFormWizard.tsx`
- **ElaboratedFields**: `/pages/admin/supply-chain/materials/components/.../ElaboratedFields.tsx`

---

**FIN DE LA GUÍA DE INTEGRACIÓN UI/UX**

> ✅ **DOCUMENTO COMPLETO CON WIREFRAMES Y FLUJOS**
>
> Este documento complementa RECIPE_TECHNICAL_ARCHITECTURE.md
> proporcionando la visión completa de UI/UX e integración.
>
> **Próximo paso**: Comenzar implementación siguiendo el checklist.
