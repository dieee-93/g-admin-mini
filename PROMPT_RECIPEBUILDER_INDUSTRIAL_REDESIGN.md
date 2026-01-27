# 🏭 Prompt: RecipeBuilder Industrial Redesign - Implementación

## 📋 Contexto del Proyecto

**Proyecto:** G-Admin Mini - ERP Modular
**Stack Técnico:**
- React 18 + TypeScript (strict mode)
- ChakraUI v3.23.0
- Arquitectura modular basada en manifests
- Sistema de theming con tokens semánticos

**Ubicación Base:**
```
src/modules/recipe/components/RecipeBuilder/
```

---

## 🎯 Objetivo de Implementación

Rediseñar el **RecipeBuilder existente** con estética de **"Orden de Producción Industrial"** tipo factura/spreadsheet, reorganizando y modificando componentes actuales.

**NO crear componentes nuevos** - Solo modificar existentes (excepto 1 wrapper pequeño para Staff)

---

## 🚨 CONVENCIONES CRÍTICAS DEL PROYECTO

### 1. Sistema de Imports (OBLIGATORIO)
```typescript
// ✅ CORRECTO - SIEMPRE usar @/shared/ui
import { Box, Stack, Button, Typography, Badge } from '@/shared/ui';

// ❌ INCORRECTO - NUNCA importar directamente de Chakra
import { Box } from '@chakra-ui/react';
```

### 2. Sistema de Theming (OBLIGATORIO)

**Tokens Semánticos:**
```typescript
// Backgrounds
bg.panel          // Containers principales
bg.subtle         // Containers secundarios
bg.muted          // Backgrounds deshabilitados

// Borders
border.emphasized // Borders gruesos (3px)
border.default    // Borders normales
border.subtle     // Borders suaves

// Foreground
fg.emphasized     // Texto principal
fg.default        // Texto normal
fg.muted          // Texto secundario

// Color Palettes (dinámico)
colorPalette="blue"    // Primary actions
colorPalette="green"   // Success, active
colorPalette="orange"  // Warnings
colorPalette="purple"  // Totals
colorPalette="cyan"    // Labor costs
colorPalette="gray"    // Neutral
```

**Uso de Color Palettes:**
```typescript
// ✅ CORRECTO
<Box
  bg="colorPalette.solid"
  color="colorPalette.fg"
  colorPalette="blue"
/>

// ❌ INCORRECTO - NO hardcodear colores
<Box bg="blue.500" color="white" />
<Box bg="#2563EB" />
```

**Gradientes con CSS Variables:**
```typescript
// ✅ CORRECTO
bg="linear-gradient(90deg, var(--chakra-colors-blue-emphasized), var(--chakra-colors-blue-fg))"

// ❌ INCORRECTO
bg="linear-gradient(90deg, #2563EB, #3B82F6)"
```

### 3. Mathematical Precision (CRÍTICO)

**NUNCA** usar operadores nativos de JS para cálculos financieros:

```typescript
// ❌ WRONG - floating point errors
const total = price * quantity;

// ✅ CORRECT - usar DecimalUtils
import { DecimalUtils } from '@/lib/precision';
const total = DecimalUtils.multiply(price, quantity);
```

---

## 🏗️ Plan de Implementación

### Fase 1: RecipeBuilder.tsx (Reordenar)

**Archivo:** `src/modules/recipe/components/RecipeBuilder/RecipeBuilder.tsx`

**Cambios:**
```typescript
// ORDEN ACTUAL:
<BasicInfoSection />
<InputsEditorSection />
<OutputConfigSection />
<RecipeProductionSection />
{showCosts && <CostSummarySection />}  // lazy
{showAdvanced && <AdvancedOptionsSection />}  // lazy
{showSubstitutions && <SubstitutionsSection />}  // lazy

// NUEVO ORDEN:
<BasicInfoSection />  // Sin cambios
<InputsEditorSection />  // Rediseñar
<StaffAssignmentSection />  // AGREGAR
<OutputConfigSection />  // Reformar
<CostSummarySection />  // Rediseñar
<RecipeProductionSection />  // Sin cambios
// ❌ NO renderizar: AdvancedOptionsSection, SubstitutionsSection
```

---

### Fase 2: InputsEditorSection.tsx (Rediseño Industrial)

**Archivo:** `src/modules/recipe/components/RecipeBuilder/sections/InputsEditorSection.tsx`

**Estética Objetivo:** Tabla inline editable tipo spreadsheet industrial

**Diseño Visual:**
```
┌───────────────────────────────────────────────────────────────────┐
│ SECCIÓN: MATERIALES                                               │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│ #  │ MATERIAL           │ CANT.  │ UNID │ P.UNIT │ TOTAL │ %   │
│────┼────────────────────┼────────┼──────┼────────┼───────┼─────┤
│ 01 │ [🔍 Buscar...]     │        │      │        │       │     │
│    │ 🟢 Harina 000     │ 2.500  │ kg   │ $2.00  │ $5.00 │ 45% │
│    │    Stock: 50kg    │        │      │        │       │▓▓▓▓░│
│────┼────────────────────┼────────┼──────┼────────┼───────┼─────┤
│ 02 │ [+ AGREGAR LÍNEA]  │        │      │        │       │     │
│────┴────────────────────┴────────┴──────┴────────┴───────┴─────┤
│                                                                   │
│                              SUBTOTAL MATERIALES: $11.00         │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
1. **Table Headers**: Uppercase, letter-spacing wide, border 3px
2. **MaterialSelector inline**: Modo compact integrado en cada fila
3. **Stock LEDs**: 🟢 (OK) 🟠 (Low) 🔴 (Out)
4. **Progress Bars**: Para % del total (▓▓▓░░)
5. **Monospace**: Para cantidades y precios
6. **Subtotal**: Al final, right-aligned, bold

**Eliminar:**
- ❌ Collapsible "Opciones Avanzadas" (Yield/Waste)
- ❌ Alert sobre yield configuration

**Props (mantener):**
```typescript
interface InputsEditorSectionProps {
  recipe: Partial<Recipe>
  updateRecipe: (updates: Partial<Recipe>) => void
  entityType: 'material' | 'product' | 'kit' | 'service'
  features: Required<RecipeBuilderFeatures>
  materials: MaterialItem[]
  materialsLoading?: boolean
}
```

---

### Fase 3: StaffAssignmentSection.tsx (CREAR nuevo wrapper)

**Archivo:** `src/modules/recipe/components/RecipeBuilder/sections/StaffAssignmentSection.tsx` (NUEVO)

**Responsabilidad:** Wrapper industrial del StaffSelector existente

**Código Base:**
```typescript
import { memo, useMemo } from 'react';
import { Box, Stack, Typography } from '@/shared/ui';
import { StaffSelector, type StaffAssignment } from '@/shared/components';

interface StaffAssignmentSectionProps {
  staffAssignments: StaffAssignment[];
  onStaffChange: (assignments: StaffAssignment[]) => void;
}

export const StaffAssignmentSection = memo(function StaffAssignmentSection({
  staffAssignments,
  onStaffChange
}: StaffAssignmentSectionProps) {

  // Calculate total labor cost
  const totalLaborCost = useMemo(() => {
    return staffAssignments.reduce((sum, assignment) => {
      return sum + (assignment.total_cost || 0);
    }, 0);
  }, [staffAssignments]);

  return (
    <Box
      p="6"
      bg="bg.panel"
      borderWidth="3px"
      borderColor="border.emphasized"
      borderRadius="xl"
      boxShadow="lg"
      position="relative"
      css={{
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '4px',
          background: 'linear-gradient(90deg, var(--chakra-colors-cyan-emphasized), var(--chakra-colors-cyan-fg))',
          borderTopLeftRadius: 'var(--chakra-radii-xl)',
          borderTopRightRadius: 'var(--chakra-radii-xl)'
        }
      }}
    >
      <Stack gap="4">
        {/* Header */}
        <Typography
          fontSize="xs"
          fontWeight="800"
          color="fg.muted"
          letterSpacing="widest"
          textTransform="uppercase"
        >
          Personal Asignado
        </Typography>

        {/* StaffSelector Integration */}
        <StaffSelector
          value={staffAssignments}
          onChange={onStaffChange}
          variant="standard"
          showCost={true}
        />

        {/* Subtotal */}
        <Box
          textAlign="right"
          pt="3"
          borderTopWidth="2px"
          borderTopColor="border.subtle"
        >
          <Typography
            fontSize="sm"
            fontWeight="800"
            fontFamily="mono"
            color="fg.emphasized"
          >
            SUBTOTAL LABOR: ${totalLaborCost.toFixed(2)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
});
```

**Estética:**
- Cyan gradient top bar
- Industrial container con borders 3px
- Subtotal right-aligned con monospace
- Integración directa del StaffSelector existente

---

### Fase 4: OutputConfigSection.tsx (Reformar)

**Archivo:** `src/modules/recipe/components/RecipeBuilder/sections/OutputConfigSection.tsx`

**Agregar:**
1. **Output Type Selector** (RadioGroup)
2. **Unit Selector** dinámico
3. **Cost Preview** live

**Diseño Visual:**
```
┌───────────────────────────────────────────────────────────────────┐
│ SECCIÓN: OUTPUT                                                   │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│ TIPO DE SALIDA:  ⦿ Medible (kg, L)    ◯ Unitario (piezas)      │
│                                                                   │
│ PRODUCTO:        🍰 Torta de Chocolate (read-only)               │
│                                                                   │
│ PRODUCCIÓN:      [10.0] [kg ▼]                                   │
│                                                                   │
│ COSTO/UNIDAD:    $13.10 / kg  (calculado live)                  │
│                  ↑ Materiales + Labor + Overhead                 │
│                  (placeholder si no hay materials/staff)         │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Props (extender):**
```typescript
interface OutputConfigSectionProps {
  recipe: Partial<Recipe>
  updateRecipe: (updates: Partial<Recipe>) => void
  features: Required<RecipeBuilderFeatures>
  preselectedItem?: RecipeItem

  // AGREGAR:
  materialsCost?: number
  laborCost?: number
  overhead?: number
}
```

**Cálculo Live:**
```typescript
const costPerUnit = useMemo(() => {
  if (!materialsCost && !laborCost) {
    return null; // Placeholder
  }
  const total = (materialsCost || 0) + (laborCost || 0) + (overhead || 0);
  return outputQuantity > 0 ? total / outputQuantity : 0;
}, [materialsCost, laborCost, overhead, outputQuantity]);

// Display
{costPerUnit !== null ? (
  <Typography>COSTO/UNIDAD: ${costPerUnit.toFixed(2)}</Typography>
) : (
  <Typography color="fg.muted">(Agregá materiales y personal primero)</Typography>
)}
```

---

### Fase 5: CostSummarySection.tsx (Rediseño Visual)

**Archivo:** `src/modules/recipe/components/RecipeBuilder/sections/CostSummarySection.tsx`

**Mantener:** Toda la lógica existente (useRecipeCosts hook, cálculos)

**Rediseñar:** Solo el visual (factura style)

**Diseño Visual:**
```
┌───────────────────────────────────────────────────────────────────┐
│ SECCIÓN: RESUMEN DE COSTOS                                        │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│                                   Materiales:      $11.00        │
│                                   Labor:          $120.00        │
│                                   Overhead (10%):   $1.10        │
│                                   Empaquetado:      $0.00        │
│                                   ─────────────────────          │
│                                   TOTAL:          $132.10        │
│                                   ═════════════════════          │
│                                                                   │
│ PRODUCCIÓN:     10.0 kg                                          │
│ COSTO/UNIDAD:   $13.21 / kg                                      │
│                                                                   │
│ EFICIENCIA:     95/100                                           │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐  │
│ │ DESGLOSE POR INGREDIENTE                                    │  │
│ │                                                             │  │
│ │ Harina    2.5kg    $5.00    [▓▓▓▓░░] 45.5%               │  │
│ │ Azúcar    1.0kg    $3.00    [▓▓░░░░] 27.3%               │  │
│ │ Huevos    6.0u     $3.00    [▓▓░░░░] 27.3%               │  │
│ └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Right-aligned totals (como factura)
- Monospace para números
- Líneas separadoras (─, ═)
- Progress bars en breakdown (▓▓░░)
- Gradient purple top bar
- Typography industrial (uppercase headers)

---

### Fase 6: MaterialSelector.tsx (Modo Inline)

**Archivo:** `src/shared/components/MaterialSelector.tsx`

**Agregar modo "inline":**

```typescript
interface MaterialSelectorProps {
  // ... props existentes
  mode?: 'dropdown' | 'inline'  // NUEVO
  compact?: boolean              // NUEVO
}
```

**Modo "inline":**
- Search box compacto en celda de tabla
- Resultados como overlay absolute (no modal)
- Quick-select sin pasos intermedios
- Convert to badge cuando seleccionado

---

## 🎨 Especificaciones Visuales Comunes

### Typography Industrial

```typescript
// Headers de Sección
fontSize="xs"
fontWeight="800"
letterSpacing="widest"
textTransform="uppercase"
color="fg.muted"

// Labels de Tabla
fontSize="2xs"
fontWeight="700"
letterSpacing="wider"
textTransform="uppercase"
color="fg.muted"

// Números y Valores
fontFamily="mono"
fontSize="sm"
fontWeight="600"
color="fg.default"

// Subtotales
fontSize="sm"
fontWeight="800"
fontFamily="mono"
color="fg.emphasized"
```

### Borders & Shadows

```typescript
// Containers principales
borderWidth="3px"
borderColor="border.emphasized"
boxShadow="lg"
borderRadius="xl"

// Tablas
borderWidth="2px"
borderColor="border.default"

// Accent bars (left/top)
borderLeftWidth="4px"
borderLeftColor="colorPalette.solid"
```

### Gradient Bars

```typescript
// Top gradient (pseudo-element)
css={{
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '4px',
    background: 'linear-gradient(90deg, var(--chakra-colors-{color}-emphasized), var(--chakra-colors-{color}-fg))',
    borderTopLeftRadius: 'var(--chakra-radii-xl)',
    borderTopRightRadius: 'var(--chakra-radii-xl)'
  }
}}
```

### Status LEDs

```typescript
// LED Component Pattern
<Box
  w="8px"
  h="8px"
  borderRadius="full"
  bg="colorPalette.solid"
  colorPalette={status === 'ok' ? 'green' : status === 'low' ? 'orange' : 'red'}
  boxShadow={`0 0 8px var(--chakra-colors-${color}-emphasized)`}
  animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
  css={{
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.7 }
    }
  }}
/>
```

### Progress Bars

```typescript
// Visual progress usando caracteres
const renderProgressBar = (percentage: number) => {
  const filled = Math.round(percentage / 20); // 0-5
  const empty = 5 - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
};

// Usage
<Typography fontFamily="mono">
  {renderProgressBar(45)} 45%
</Typography>
```

---

## ✅ Checklist de Validación

### Imports
- [ ] Todos desde `@/shared/ui`
- [ ] NO imports directos de `@chakra-ui/react`
- [ ] DecimalUtils para cálculos

### Theming
- [ ] Backgrounds: `bg.panel`, `bg.subtle`
- [ ] Borders: `border.emphasized`, `border.default`
- [ ] Foreground: `fg.emphasized`, `fg.default`, `fg.muted`
- [ ] ColorPalette dinámico (blue/green/orange/purple/cyan/gray)
- [ ] Gradientes con CSS variables
- [ ] NO colores hardcodeados

### Typography
- [ ] Headers uppercase con letter-spacing
- [ ] Monospace para números
- [ ] FontWeight correcto (700-800 para labels)

### Visual
- [ ] Borders 3px en containers
- [ ] Gradient bars en tops
- [ ] Status LEDs pulsantes
- [ ] Progress bars para porcentajes
- [ ] Subtotales right-aligned

### Funcionalidad
- [ ] Props mantenidas (no romper compatibilidad)
- [ ] Performance (memo, useMemo, useCallback)
- [ ] Cálculos live funcionando
- [ ] Orden correcto de render

---

## 🚀 Orden de Implementación Sugerido

**Sprint 1: Componentes Base**
1. StaffAssignmentSection (nuevo wrapper)
2. MaterialSelector modo inline
3. ProductSelector modo inline

**Sprint 2: Sections Rediseñadas**
1. InputsEditorSection (tabla inline)
2. OutputConfigSection (type selector + preview)
3. CostSummarySection (factura style)

**Sprint 3: Integración**
1. RecipeBuilder (reordenar + integrar Staff)
2. Props wiring
3. Testing end-to-end

---

## 📚 Referencias

**Archivos a consultar:**
- `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/ElaboratedFields.tsx` - Inspiración de diseño industrial
- `src/shared/ui/index.ts` - Componentes disponibles
- `src/shared/components/StaffSelector/` - StaffSelector existente
- `docs/optimization/MODAL_STATE_BEST_PRACTICES.md` - Patrones de performance

**Plan completo:** `C:\Users\Diego\.claude\plans\wild-jumping-wreath.md`

---

## 🎯 Resultado Final Esperado

Un RecipeBuilder reorganizado tipo "Orden de Producción Industrial" donde:

✅ **Orden lógico:** Materials → Staff → Output → Costs
✅ **Edición inline:** MaterialSelector integrado en tabla
✅ **Costos live:** Output preview + Cost summary actualizados en tiempo real
✅ **Staff incluido:** Labor costs parte del cálculo total
✅ **Estética industrial:** LEDs, borders gruesos, monospace, gradientes, uppercase
✅ **Sin yield/waste:** Eliminado del flujo
✅ **Sin substitutions:** Ignorado completamente

---

**Diseño:** Industrial Precision / Production Order Form
**Inspiración:** Factory production orders, industrial spreadsheets, invoices
**Objetivo:** Interfaz memorable donde todo es visible y editable inline
