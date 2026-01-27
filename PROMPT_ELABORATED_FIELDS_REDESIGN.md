# 🎨 Prompt: Rediseño Completo de ElaboratedFields Component

## 📋 Contexto del Proyecto

**Proyecto:** G-Admin Mini - ERP Modular
**Stack Técnico:**
- React 18 + TypeScript (strict mode)
- ChakraUI v3.23.0
- Arquitectura modular basada en manifests
- Sistema de theming con tokens semánticos

**Ubicación del Componente:**
```
src/pages/admin/supply-chain/materials/components/
  MaterialsManagement/MaterialFormModalComplete/components/
    ElaboratedFields.tsx
```

---

## 🎯 Objetivo del Rediseño

Rediseñar completamente el formulario de **ElaboratedFields** (materiales elaborados) con:
1. **Estética moderna y profesional** - Evitar diseño genérico de AI
2. **UX clara y eficiente** - Flujo intuitivo para crear recetas de materiales
3. **Jerarquía visual mejorada** - Organización clara de secciones
4. **Micro-interacciones** - Feedback visual en cada paso
5. **Responsive design** - Desktop y mobile

**Inspiración de diseño:** Usar el mismo concepto **"Industrial Precision"** aplicado en `ScheduledProductionForm.tsx` (estética industrial moderna con brutalismo refinado)

---

## 📦 Componente Actual - Estructura

### **ElaboratedFields.tsx** (Componente Principal)

```tsx
interface ElaboratedFieldsProps {
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
}
```

**Estructura actual:**
1. **SelectField** - Categoría del Producto (dropdown)
2. **Alert Warning** - Info sobre materiales elaborados
3. **RecipeBuilder** - Constructor de receta (componente complejo)

### **RecipeBuilder** (Subcomponente - NO rediseñar internamente)

El RecipeBuilder tiene múltiples secciones:
- ✅ `BasicInfoSection` - Info básica de la receta
- ✅ `InputsEditorSection` - Editor de ingredientes/inputs
- ✅ `RecipeProductionSection` - Configuración de producción
- ✅ `CostSummarySection` - Resumen de costos (lazy)
- ✅ `InstructionsSection` - Instrucciones (lazy)
- ⚠️ `AdvancedOptionsSection` - Opciones avanzadas (lazy)
- ❌ `SubstitutionsSection` - **OMITIR COMPLETAMENTE**

**Props del RecipeBuilder:**
```tsx
<RecipeBuilder
  mode="create"
  entityType="material"
  complexity="minimal"
  features={{
    showCostCalculation: true,
    showScalingLite: true,
    showInstructions: false,
    allowProductInputs: false,
  }}
  outputItem={outputItem}
  outputQuantity={formData.initial_stock || 1}
  onSave={handleRecipeSaved}
/>
```

---

## ⚠️ RESTRICCIONES CRÍTICAS

### 1. **Sistema de Imports**
```typescript
// ✅ CORRECTO - SIEMPRE usar @/shared/ui
import { Box, Stack, Button, Typography } from '@/shared/ui';

// ❌ INCORRECTO - NUNCA importar directamente de Chakra
import { Box } from '@chakra-ui/react';
```

### 2. **Sistema de Theming**

**Tokens Semánticos Obligatorios:**

| Categoría | Tokens |
|-----------|--------|
| **Backgrounds** | `bg.panel`, `bg.subtle`, `bg.muted`, `bg.emphasized` |
| **Borders** | `border.emphasized`, `border.default`, `border.subtle`, `border.muted` |
| **Foreground** | `fg.emphasized`, `fg.default`, `fg.muted`, `fg.error` |
| **Interactivos** | `colorPalette.solid`, `colorPalette.fg`, `colorPalette.emphasized` |

**Uso de Color Palettes:**
```tsx
// ✅ CORRECTO
<Box
  bg="colorPalette.solid"
  color="colorPalette.fg"
  colorPalette="blue"  // blue, gray, green, orange, purple
/>

// ❌ INCORRECTO - NO usar colores hardcodeados
<Box bg="blue.500" color="white" />
<Box bg="#2563EB" />
```

**Gradientes con CSS Variables:**
```tsx
// ✅ CORRECTO
bg="linear-gradient(90deg, var(--chakra-colors-blue-emphasized), var(--chakra-colors-blue-fg))"

// ❌ INCORRECTO
bg="linear-gradient(90deg, #2563EB, #3B82F6)"
```

### 3. **Componentes Disponibles**

Ver `src/shared/ui/index.ts` para lista completa:
- Layout: `Box`, `Stack`, `Grid`, `Flex`, `Container`
- Typography: `Typography`, `Heading`, `Text`
- Forms: `InputField`, `SelectField`, `TextareaField`, `NumberField`
- Buttons: `Button`, `IconButton`, `ActionButton`
- Feedback: `Alert`, `Badge`, `Progress`, `Spinner`, `toaster`
- Advanced: `Accordion`, `Tabs`, `Dialog`, `Drawer`, `Popover`, `Tooltip`

---

## 🎨 Dirección de Diseño Sugerida

### **Concepto: "Manufacturing Precision"**

Inspirado en interfaces de control de producción industrial, con:

**Paleta Visual:**
- Backgrounds: Paneles con `bg.panel` y `bg.subtle` para contraste
- Accents: `colorPalette="blue"` para acciones, `orange` para warnings
- Bordes: Gruesos (2-3px) con `border.emphasized` para estructura
- Shadows: `boxShadow="lg|md|sm"` para profundidad

**Tipografía Industrial:**
- Labels: Uppercase + `letterSpacing="wider"` + `fontWeight="800"`
- Valores: `fontFamily="monospace"` para números/cantidades
- Jerarquía: xs (labels) → sm (body) → md (values)

**Micro-Interacciones:**
- Hover states con `transform="translateY(-1px)"` + `boxShadow`
- Active states con presión simulada
- Loading states con `Spinner` + `Progress`
- Validación en tiempo real con iconos y colores

---

## 📐 Propuesta de Estructura Rediseñada

### **Sección 1: Header con Status**
```tsx
<Stack direction="row" align="center" justify="space-between" mb="6">
  <Stack direction="row" align="center" gap="3">
    <StatusIndicator status="active" /> {/* LED pulsante */}
    <Typography
      fontSize="xs"
      fontWeight="800"
      color="fg.muted"
      letterSpacing="widest"
      textTransform="uppercase"
    >
      Material Elaborado
    </Typography>
  </Stack>

  <Badge colorPalette="blue" variant="solid">
    REQUIERE RECETA
  </Badge>
</Stack>
```

### **Sección 2: Categoría - Industrial Selector**
```tsx
<Box
  p="5"
  bg="bg.panel"
  borderWidth="3px"
  borderColor="border.emphasized"
  borderRadius="xl"
  boxShadow="lg"
  position="relative"
  borderLeftWidth="4px"
  borderLeftColor={formData.category ? 'colorPalette.solid' : 'border.muted'}
  colorPalette={formData.category ? 'green' : 'gray'}
>
  <Stack gap="4">
    <Stack direction="row" align="center" justify="space-between">
      <Typography
        fontSize="2xs"
        fontWeight="700"
        color="fg.muted"
        letterSpacing="wider"
        textTransform="uppercase"
      >
        Categoría de Negocio
      </Typography>
      <StatusIndicator status={formData.category ? 'active' : 'inactive'} />
    </Stack>

    <SelectField
      placeholder="Selecciona categoría..."
      collection={CATEGORY_COLLECTION}
      value={formData.category ? [formData.category] : []}
      onValueChange={(details) => setFormData({
        ...formData,
        category: details.value[0]
      })}
      required
      size="lg"
      // Estilo industrial con monospace
    />
  </Stack>
</Box>
```

### **Sección 3: Info Alert - Mejorado**
```tsx
<Box
  p="5"
  bg="bg.panel"
  borderWidth="2px"
  borderColor="colorPalette.emphasized"
  colorPalette="orange"
  borderRadius="lg"
  borderLeftWidth="4px"
  borderLeftColor="colorPalette.solid"
>
  <Stack gap="3">
    <Stack direction="row" align="center" gap="2">
      <Box
        w="6px"
        h="6px"
        borderRadius="full"
        bg="colorPalette.fg"
        colorPalette="orange"
      />
      <Typography
        fontSize="xs"
        fontWeight="800"
        color="colorPalette.fg"
        colorPalette="orange"
        letterSpacing="wider"
      >
        INFORMACIÓN IMPORTANTE
      </Typography>
    </Stack>

    <Stack gap="1">
      <Typography fontSize="2xs" color="fg.muted" lineHeight="relaxed">
        <Box as="span" color="colorPalette.fg" colorPalette="orange" fontWeight="700">▸</Box> Requiere receta con ingredientes
      </Typography>
      <Typography fontSize="2xs" color="fg.muted" lineHeight="relaxed">
        <Box as="span" color="colorPalette.fg" colorPalette="orange" fontWeight="700">▸</Box> Se ejecuta automáticamente al guardar
      </Typography>
      <Typography fontSize="2xs" color="fg.muted" lineHeight="relaxed">
        <Box as="span" color="colorPalette.fg" colorPalette="orange" fontWeight="700">▸</Box> Genera stock inicial del material
      </Typography>
    </Stack>
  </Stack>
</Box>
```

### **Sección 4: Recipe Builder - Container Mejorado**
```tsx
<Box>
  {/* Divisor con título */}
  <Stack direction="row" align="center" gap="3" mb="5">
    <Box h="2px" flex="1" bg="border.emphasized" />
    <Typography
      fontSize="sm"
      fontWeight="800"
      color="fg.default"
      letterSpacing="widest"
      textTransform="uppercase"
    >
      Constructor de Receta
    </Typography>
    <Box h="2px" flex="1" bg="border.emphasized" />
  </Stack>

  {/* RecipeBuilder con wrapper estilizado */}
  <Box
    p="6"
    bg="bg.subtle"
    borderWidth="3px"
    borderColor="border.emphasized"
    borderRadius="xl"
    boxShadow="lg"
    position="relative"
    _before={{
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      h: '4px',
      bg: 'linear-gradient(90deg, var(--chakra-colors-blue-emphasized), var(--chakra-colors-blue-fg))',
      borderTopRadius: 'xl'
    }}
  >
    <RecipeBuilder
      mode="create"
      entityType="material"
      complexity="minimal"
      features={{
        showCostCalculation: true,
        showScalingLite: true,
        showInstructions: false,
        allowProductInputs: false,
        // ❌ CRÍTICO: Omitir sustituciones
        showSubstitutions: false, // Si existe este flag
      }}
      outputItem={outputItem}
      outputQuantity={formData.initial_stock || 1}
      onSave={handleRecipeSaved}
    />
  </Box>
</Box>
```

---

## 🎯 Componentes Auxiliares a Crear

### **StatusIndicator** (LED Industrial)
```tsx
function StatusIndicator({
  status
}: {
  status: 'active' | 'inactive' | 'warning'
}) {
  const getStatusColor = (s: typeof status) => {
    switch (s) {
      case 'active': return 'green'
      case 'warning': return 'orange'
      default: return 'gray'
    }
  }

  const colorPalette = getStatusColor(status)

  return (
    <Box
      w="8px"
      h="8px"
      borderRadius="full"
      bg="colorPalette.solid"
      colorPalette={colorPalette}
      boxShadow={status === 'active' ? 'lg' : 'sm'}
      animation={status === 'active' ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : undefined}
    />
  )
}
```

---

## ✅ Checklist de Implementación

### **Funcionalidad (MANTENER)**
- [ ] Selector de categoría funcional
- [ ] Alert informativo visible
- [ ] RecipeBuilder renderiza correctamente
- [ ] Callback `handleRecipeSaved` funciona
- [ ] Validación de campos requeridos
- [ ] Performance optimizations (`memo`, `useMemo`, `useCallback`)

### **Diseño (IMPLEMENTAR)**
- [ ] Estética "Industrial Precision" consistente
- [ ] Status LEDs con animación pulse
- [ ] Borders gruesos (2-3px) y shadows (lg, md, sm)
- [ ] Typography industrial (uppercase, monospace, letter-spacing)
- [ ] Micro-interacciones en hover/active
- [ ] Divisores visuales entre secciones
- [ ] Color accent bars (4px left border)
- [ ] Gradient headers en containers

### **Theming (OBLIGATORIO)**
- [ ] Todos los colores usan tokens semánticos
- [ ] Backgrounds: `bg.panel`, `bg.subtle`, `bg.muted`
- [ ] Borders: `border.emphasized`, `border.default`, `border.subtle`
- [ ] Foreground: `fg.emphasized`, `fg.default`, `fg.muted`
- [ ] ColorPalette: `blue`, `gray`, `green`, `orange` (NO hardcoded)
- [ ] Gradientes con CSS variables
- [ ] Shadows con tokens: `lg`, `md`, `sm`

### **Imports (CRÍTICO)**
- [ ] Todos los imports desde `@/shared/ui`
- [ ] NO imports directos de `@chakra-ui/react`
- [ ] Types correctos importados

### **Omisiones (IMPORTANTE)**
- [ ] SubstitutionsSection NO se renderiza
- [ ] Feature flag `showSubstitutions: false` si existe
- [ ] NO crear UI para sustitución de ingredientes

---

## 🚀 Entregables Esperados

1. **ElaboratedFields.tsx** - Componente principal rediseñado
2. **Componentes auxiliares** - StatusIndicator, divisores, containers
3. **Animaciones CSS** - Keyframes para pulse, hover states
4. **Documentación inline** - Comentarios explicando decisiones de diseño

---

## 📚 Referencias

**Archivos a consultar:**
- `src/modules/recipe/components/ScheduledProductionForm.tsx` - Inspiración de diseño
- `src/shared/ui/index.ts` - Componentes disponibles
- `docs/optimization/MODAL_STATE_BEST_PRACTICES.md` - Patrones de performance

**Tokens de theming:**
- Buscar en codebase: `bg.panel`, `border.emphasized`, `fg.muted`
- Ejemplos: `src/shared/ui/components/business/*.tsx`

---

## 💡 Notas Finales

- **NO sobrdiseñar** - Mantener simplicidad industrial
- **Consistencia** - Seguir mismos patrones que ScheduledProductionForm
- **Performance** - Mantener `memo`, `useMemo`, `useCallback`
- **Accesibilidad** - Labels, ARIA props, focus states
- **Responsive** - Mobile-first, breakpoints `{{ base, lg }}`

---

**Objetivo Final:** Un formulario de materiales elaborados con estética industrial profesional, jerarquía visual clara, micro-interacciones deliciosas y código que respeta completamente las convenciones del proyecto G-Admin Mini.
