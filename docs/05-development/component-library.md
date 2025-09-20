# 🎨 G-Admin Mini Design System v2.0 - Guía Completa

**Sistema de Diseño Semántico con Theming Dinámico**
*Actualizado: Enero 2025*

---

## 🎯 **Filosofía del Sistema**

G-Admin Mini v2.0 implementa un sistema de diseño **semántico y context-aware** que:

1. **Prioriza la intención sobre la implementación** → `ContentLayout` vs `Box + Stack`
2. **Automatiza el theming** → 20+ temas con cambio dinámico
3. **Elimina repetición** → Componentes compuestos y patterns reutilizables
4. **Mantiene coherencia** → Import centralizado desde `@/shared/ui`

---

## 🏗️ **Arquitectura del Sistema**

### **Import Principal (OBLIGATORIO)**
```tsx
// ✅ CORRECTO - Import centralizado
import { 
  // Layout Semantic Components
  ContentLayout, PageHeader, Section, FormSection, StatsSection,
  
  // Base Components  
  Layout, Stack, Typography, Button, Modal, Alert, Badge,
  
  // Business Components
  Icon,
  
  // Hooks para theming
  // (useThemeStore se importa desde @/store/themeStore)
} from '@/shared/ui'

// Para theming dinámico
import { useThemeStore } from '@/store/themeStore'

// ❌ INCORRECTO - Import directo de Chakra
import { Box, Text, HStack, VStack } from '@chakra-ui/react'
```

### **Estructura de Carpetas**
```
src/shared/ui/
├── index.ts                    # Export centralizado
├── ContentLayout.tsx           # Layout principal de páginas
├── PageHeader.tsx              # Headers complejos con icons/actions
├── Section.tsx                 # Wrapper semántico (3 variantes)  
├── FormSection.tsx             # Secciones de formularios
├── StatsSection.tsx            # Wrapper para métricas
├── Layout.tsx                  # Layout base
├── Typography.tsx              # Sistema tipográfico
├── Stack.tsx                   # Stack semántico
├── Button.tsx                  # Button wrapper
├── Modal.tsx                   # Modal components
├── Alert.tsx                   # Alert components
├── Badge.tsx                   # Badge variants
├── Icon.tsx                    # Icon system
├── provider.tsx                # Chakra Provider con theming dinámico
└── ...                         # Otros componentes
```

---

## 📋 **Componentes Semánticos v2.0**

### **1. ContentLayout - Layout Principal**

**Reemplaza**: Repetitive `Layout variant="page" + Stack` patterns

```tsx
// ❌ ANTES (repetitivo)
<Layout variant="page">
  <Stack gap="xl" align="stretch">
    {/* content */}
  </Stack>
</Layout>

// ✅ DESPUÉS (semántico)
<ContentLayout spacing="normal" padding="xl">
  {/* content */}  
</ContentLayout>
```

**Props**: `spacing` (`'tight'|'normal'|'loose'`), `padding` (SpacingProp), `colorPalette`, `children`

**Spacing mapping**: `tight='4'`, `normal='8'`, `loose='12'`

**Casos de Uso**:
- ✅ Todas las páginas principales (`/sales`, `/materials`, `/settings`)
- ✅ Modales grandes con múltiples secciones
- ✅ Páginas con padding y spacing consistente

### **2. PageHeader - Headers Complejos**

**Reemplaza**: Manual header construction con icons, subtitles, actions

```tsx
// ❌ ANTES (manual, inconsistente)
<Stack direction="row" justify="space-between" align="end" pb="md">
  <Stack gap="xs">
    <Stack direction="row" align="center" gap="sm">
      <Icon icon={CogIcon} size="lg" color="gray.500" />
      <Typography variant="heading" size="2xl">Configuración</Typography>
    </Stack>
    <Typography variant="body" color="secondary" pl="3xl">
      Centro de comando · G-Admin
    </Typography>
  </Stack>
  <Button size="md">Guardar</Button>
</Stack>

// ✅ DESPUÉS (semántico, consistente)
<PageHeader 
  title="Configuración"
  subtitle="Centro de comando · G-Admin"
  icon={CogIcon}
  actions={<Button size="md">Guardar</Button>}
/>
```

**Props**: `title`, `subtitle?`, `icon?`, `actions?`, `colorPalette?`

**Casos de Uso**:
- ✅ Páginas principales con navegación compleja
- ✅ Settings, Integrations, Enterprise pages
- ✅ Cualquier header que necesite icon + subtitle + actions

### **3. Section - Wrapper Semántico Universal**

**Wrapper semántico** para organizar contenido en secciones visuales

```tsx
// ✅ Uso semántico de Section
<Section variant="elevated" title="Business Profile">
  <form>...</form>
</Section>
```

**Variantes** (3 niveles visuales):
```tsx
// Variante Default - Sin elevación visual
<Section variant="default" title="Basic Info">
  {/* No background, subtle border */}
</Section>

// Variante Elevated - Con elevación
<Section variant="elevated" title="Important Settings">
  {/* Background, shadow, elevated appearance */}
</Section>

// Variante Flat - Completamente plano
<Section variant="flat" title="Minimal Section">
  {/* No visual separation, pure content */}
</Section>
```

**Props**: `variant`, `title?`, `subtitle?`, `actions?`, `colorPalette?`, `children`

**Casos de Uso**:
- ✅ **Elevated**: Settings sections, forms importantes
- ✅ **Default**: Contenido general, lists, tables  
- ✅ **Flat**: Pure content areas, minimal UI

### **4. FormSection - Formularios Especializados**

**Wrapper especializado** para formularios con labels y descriptions

```tsx
<FormSection 
  title="Tax Configuration"
  description="Configure AFIP integration and tax rates"
>
  <form>
    <Stack gap="md">
      <Input label="CUIT" required />
      <Select label="Tax Category" />
    </Stack>
  </form>
</FormSection>
```

### **5. StatsSection - Métricas y KPIs**

**Wrapper especializado** para secciones de métricas con layout optimizado

```tsx
<StatsSection>
  {/* Contenido de métricas */}
</StatsSection>
```

---

## 🧩 **Componentes Base**

### **Icon - Wrapper Universal**

**Wrapper simplificado** que actúa como envoltorio del `Icon` de Chakra UI, optimizado para uso con **Heroicons** y cualquier biblioteca de iconos.

**Reemplaza**: Import directo de Chakra UI Icon + configuración manual de tamaños

```tsx
// ❌ ANTES (múltiples imports, tamaños inconsistentes)
import { Icon as ChakraIcon } from '@chakra-ui/react';
import { HomeIcon } from '@heroicons/react/24/outline';
<ChakraIcon as={HomeIcon} size="5" />

// ✅ DESPUÉS (simple y consistente)
import { Icon } from '@/shared/ui/Icon';  
import { HomeIcon } from '@heroicons/react/24/outline';
<Icon icon={HomeIcon} size="md" />
```

**Props**: `icon`, `size`, `asChild`, `children`, + todas las props del Icon de Chakra UI

**Tamaños disponibles**:
- `xs` (`3`) - Botones pequeños, badges
- `sm` (`4`) - Inputs, texto  
- `md` (`5`) - **Default**, navegación
- `lg` (`6`) - Headers, elementos destacados
- `xl` (`8`) - Hero sections
- `2xl` (`10`) - Extra large contexts

**Casos de Uso**:
- ✅ **Heroicons** (recomendado para el proyecto)
- ✅ **React Icons** (compatibilidad)
- ✅ **SVG components** personalizados
- ✅ **Patrón asChild** (Chakra UI v3)

```tsx
// Con Heroicons (uso principal)
import { HomeIcon, UserIcon } from '@heroicons/react/24/outline';
<Icon icon={HomeIcon} size="md" />
<Icon icon={UserIcon} size="lg" color="blue.500" />

// Con React Icons
import { FiHome } from 'react-icons/fi';
<Icon icon={FiHome} size="lg" />

// Con SVG personalizado
const CustomIcon = () => <svg>...</svg>;
<Icon icon={CustomIcon} size="xl" />

// Patrón asChild (Chakra UI v3)
<Icon asChild>
  <CustomSvgIcon />
</Icon>

// Con props adicionales de Chakra UI
<Icon icon={UserIcon} size="sm" color="red.400" _hover={{ color: 'red.600' }} />
```

**Ventajas del wrapper**:
- ✅ **Consistencia en tamaños** semánticos en todo el proyecto
- ✅ **Sintaxis simplificada** para uso diario
- ✅ **Compatibilidad futura** si cambias de biblioteca de iconos
- ✅ **Mantiene toda la potencia** de Chakra UI (color, _hover, etc.)

### **6. Grid Components - Layout Responsivo**

**Grid y SimpleGrid** con props corregidas según Chakra UI v3:

```tsx
// ✅ SimpleGrid con spacing tokens correctos
<SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="4">
  {/* Grid items */}
</SimpleGrid>

// ✅ Grid avanzado
<Grid templateColumns="repeat(3, 1fr)" gap="6" rowGap="4">
  {/* Grid items */}
</Grid>

// ✅ CardGrid (alias de SimpleGrid)
<CardGrid columns={{ base: 1, md: 3 }} gap="6">
  {/* Cards content */}
</CardGrid>
```

**Spacing tokens válidos**: `'0'`, `'1'`, `'2'`, `'3'`, `'4'`, `'6'`, `'8'`, `'12'`, `'16'`, `'20'`, `'24'`, etc.

---

## 🌈 **Sistema de Theming Dinámico**

**Token override strategy**: Mapea 20+ temas dinámicos a la paleta `gray` de Chakra para actualizaciones automáticas.

### **Uso Principal**

```tsx
// ✅ Theming automático (recomendado)
<Button variant="solid">Auto-themed</Button>
<Section variant="elevated">Auto-themed</Section>

// ✅ Theming específico (casos especiales)  
<Button colorPalette="blue">Always Blue</Button>
<Section colorPalette="red">Always Red</Section>

// ✅ Cambio dinámico
const { applyTheme } = useThemeStore()
applyTheme('dracula') // Actualiza todos los componentes
```

**Temas disponibles**: 
- **Base**: `light`, `dark`, `system`
- **Professional Light**: `corporate`, `nature`, `sunset`, `ocean`
- **Professional Dark**: `corporate-dark`, `nature-dark`, `sunset-dark`, `ocean-dark` 
- **VSCode**: `dracula`, `tokyo-night`, `synthwave-84`, `monokai-pro`, `atom-one-dark`, `nord`, `gruvbox`
- **Material**: `material-oceanic`, `material-darker`, `material-palenight`, `material-deep-ocean`
- **Modern**: `cyberpunk`, `pastel`
- **Accessibility**: `high-contrast`

---

## 📖 **Guías de Migración**

### **Guía de Migración Rápida**

**Reglas de migración**: Usar componentes semánticos desde `@/shared/ui`, evitar imports directos de Chakra UI

### **Ejemplos de Migración**

```tsx
// ❌ ANTES: Layout patterns manuales y repetitivos
<Layout variant="page">
  <Stack gap="xl" align="stretch">
    <Stack direction="row" justify="space-between" align="end" pb="md">
      <Stack gap="xs">
        <Stack direction="row" align="center" gap="sm">
          <Icon icon={CogIcon} size="lg" color="gray.500" />
          <Typography variant="heading" size="2xl">Settings</Typography>
        </Stack>
        <Typography variant="body" color="secondary" pl="3xl">
          Configuration center
        </Typography>
      </Stack>
      <Button size="md">Save Changes</Button>
    </Stack>
    
    <Box bg="gray.800" p="md" borderRadius="md" boxShadow="lg">
      <Stack gap="md">
        <Typography variant="heading" size="lg">Business Profile</Typography>
        <Divider />
        <form>...</form>
      </Stack>
    </Box>
  </Stack>
</Layout>

// ✅ DESPUÉS: Componentes semánticos y concisos
<ContentLayout>
  <PageHeader 
    title="Settings"
    subtitle="Configuration center"
    icon={CogIcon}
    actions={<Button>Save Changes</Button>}
  />
  <Section variant="elevated" title="Business Profile">
    <form>...</form>
  </Section>
</ContentLayout>
```

### **Migración de Settings Module (Caso Real)**

El módulo Settings fue migrado completamente usando estos patterns:

**ANTES**: 68 líneas con layout manual
**DESPUÉS**: 32 líneas con componentes semánticos

**Resultados**:
- ✅ 50% reducción en líneas de código
- ✅ Consistencia visual automática
- ✅ Theming dinámico funcionando
- ✅ Mantenibilidad mejorada

---

## ⚡ **Performance y Best Practices**

### **Bundle Optimization**

```tsx
// ✅ Tree-shaking optimized
import { Section, PageHeader } from '@/shared/ui'

// ❌ Imports everything
import * as UI from '@/shared/ui'
```

### **Theming Performance**

- **CSS Variables**: Theming usa CSS custom properties para máxima performance
- **Zero Runtime**: Theme switching no re-renderiza componentes
- **Token Caching**: Design tokens se cachean automáticamente

### **Component Composition**

```tsx
// ✅ Composición eficiente
<ContentLayout>
  <PageHeader title="Dashboard" />
  <StatsSection>
    {/* Contenido de métricas */}
  </StatsSection>
</ContentLayout>

// ❌ Composición ineficiente
<Layout>
  <Stack>
    <Box>
      <Stack>
        <Box>
          <Stack>
            {/* nested chaos */}
          </Stack>
        </Box>
      </Stack>
    </Box>
  </Stack>
</Layout>
```

---

## 🎯 **Ejemplos de Implementación - REFERENCIA**

⚠️ **IMPORTANTE**: Para **ejemplos completos de construcción de módulos** ver:
`/docs/05-development/UI_MODULE_CONSTRUCTION_MASTER_GUIDE.md`

### **Design System v2.0 - Componentes Base**

Este documento se enfoca en **componentes individuales** del Design System.
Para **plantillas completas de módulos**, usar el master guide que incluye:

- ✅ **3 plantillas específicas** por tipo de módulo
- ✅ **Código real verificado** del proyecto
- ✅ **Patterns de consistencia** cross-módulo
- ✅ **Hook patterns obligatorios**

### **Ejemplo Base Simplificado**

```tsx
// Solo muestra uso de componentes base del Design System
import { ContentLayout, Section, StatsSection } from '@/shared/ui';

export default function ExampleUsage() {
  return (
    <ContentLayout spacing="normal">
      <Section variant="elevated" title="Component Example">
        {/* Contenido usando componentes del Design System */}
      </Section>
    </ContentLayout>
  );
}
```

### **Modal Complejo**

```tsx
<Modal size="xl">
  <ContentLayout spacing="tight" padding="lg">
    <PageHeader 
      title="Create New Recipe"
      subtitle="Add ingredients and instructions"
      icon={ChefHatIcon}
    />
    
    <FormSection title="Basic Information">
      <RecipeBasicForm />
    </FormSection>
    
    <Section variant="flat" title="Ingredients">
      <IngredientsManager />
    </Section>
  </ContentLayout>
</Modal>
```

---

## 🚨 **Reglas Principales**

### **❌ Prohibido**
- Import directo: `import { Box } from '@chakra-ui/react'`  
- Mixing patterns: `<Layout><PageHeader /></Layout>` (inconsistente)
- Override colors: `<Button bg="red.500">` (rompe theming)
- Spacing tokens incorrectos: `gap="md"` → usar `gap="4"`

### **✅ Obligatorio**  
- Semantic imports: `import { ContentLayout, Section } from '@/shared/ui'`
- Composition patterns: `<ContentLayout><PageHeader /><Section /></ContentLayout>`
- Trust theming: `<Button variant="solid">` (auto-themed)
- Spacing tokens numéricos: `gap="4"`, `gap="6"`, `gap="8"`, etc.

### **🔧 Correcciones Recientes**
- **Grid/SimpleGrid**: Props `gap`, `rowGap`, `columnGap` ahora aceptan tokens numéricos Chakra UI v3
- **Stack components**: Props `gap` corregidas para compatibilidad v3
- **ContentLayout**: `spacingMap` corregido para usar tokens numéricos (`'4'`, `'8'`, `'12'`)
- **Layout.tsx**: Todos los spacing tokens corregidos, `sizeMap` eliminado, props actualizadas a `SpacingProp`
- **PageHeader.tsx**: Spacing tokens corregidos (`pb`, `gap`, `pl` ahora usan valores numéricos)
- **CardGrid**: Confirmado como alias válido de `SimpleGrid`
- **Types**: Nuevo archivo `types.ts` con definiciones compartidas
- **ActionButton**: `QuickActionCard` renombrado a `ActionButton`

### **⚠️ Problemas Comunes JSX**
- **Tags mixtos**: NUNCA mezclar `<Card>` con `</CardWrapper>` 
- **Componentes renombrados**: 
  - `QuickActionCard` → `ActionButton`
  - `HeroMetricCard` → `MetricCard variant="hero"` (planned)
- **Import consistency**: Usar siempre el mismo nombre para abrir y cerrar tags

```tsx
// ❌ INCORRECTO - Tags mixtos
<CardWrapper variant="elevated">
  <Stack>...</Stack>
</CardWrapper>

// ✅ CORRECTO - Tags consistentes
<CardWrapper variant="elevated">
  <Stack>...</Stack>
</Card>
```

---

## 🎨 **Patrones de Jerarquía Visual**

### **Estrategia de Componentes "Vivos"**

Para transformar interfaces estáticas en experiencias dinámicas y atractivas:

```tsx
// ✅ PATRÓN: MetricCard + Status Indicators + Colored Backgrounds
<MetricCard
  title="IVA Principal"
  value="21%"
  subtitle="Tasa aplicada por defecto"
  icon={CurrencyDollarIcon}
  colorPalette="green"
  badge={{
    value: "Activo",
    colorPalette: "green"
  }}
/>

// ✅ PATRÓN: Colored Background + Border Accent + Status Icons
<Stack 
  p="sm"
  bg="green.50"           // Fondo de color sutil
  borderRadius="md"
  borderLeft="4px solid"
  borderColor="green.400" // Acento visual
>
  <Stack direction="row" align="center" gap="sm">
    <Icon icon={CheckCircleIcon} size="sm" color="green.500" />
    {/* contenido */}
  </Stack>
</Stack>
```

### **Jerarquía de Colores de Fondo**
Sistema progresivo para crear profundidad visual:

```tsx
// Nivel 1: Contenedor principal
bg="gray.50"     // Fondo base más sutil

// Nivel 2: Elementos importantes  
bg="blue.50"     // Información
bg="green.50"    // Éxito/activo
bg="red.50"      // Error/crítico
bg="orange.50"   // Advertencia
bg="purple.50"   // Especial/premium

// Nivel 3: Estados y detalles
borderColor="blue.400"   // Bordes de acento
color="green.500"        // Iconos de estado
```

### **Componentes Dinámicos Esenciales**
Elementos que transforman interfaces planas:

- **MetricCard**: Estadísticas prominentes con badges
- **ActionButton**: Acciones rápidas contextuales  
- **Alert**: Notificaciones y recomendaciones
- **Badge**: Estados e indicadores de cantidad
- **Icon + Color**: Estados visuales inmediatos

### **Pattern de Aplicación Sistemática**
1. **Identificar elementos estáticos** → listas simples, información plana
2. **Agregar MetricCards** → para estadísticas importantes
3. **Implementar fondos coloreados** → según estados (activo/inactivo, tipos)
4. **Añadir ActionButtons** → para acciones contextuales
5. **Incluir Alert components** → para recomendaciones/avisos

```tsx
// ✅ EJEMPLO: Transformación completa
// ANTES: Lista estática
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}

// DESPUÉS: Lista dinámica con jerarquía visual
{items.map(item => (
  <Stack 
    key={item.id}
    p="sm"
    bg={item.active ? "green.50" : "gray.50"}
    borderLeft="4px solid"
    borderColor={item.active ? "green.400" : "gray.300"}
  >
    <Stack direction="row" justify="space-between" align="center">
      <Stack direction="row" align="center" gap="sm">
        <Icon 
          icon={item.active ? CheckCircleIcon : ExclamationTriangleIcon} 
          color={item.active ? "green.500" : "gray.400"}
        />
        <Typography weight="medium">{item.name}</Typography>
        <Badge colorPalette={item.active ? "green" : "gray"}>
          {item.active ? "Activo" : "Inactivo"}
        </Badge>
      </Stack>
      <ActionButton size="sm" variant="ghost">
        Editar
      </ActionButton>
    </Stack>
  </Stack>
))}
```

---

## 📚 **Recursos y Referencias**

### **Documentación Relacionada**

- `CHAKRA_UI_THEMING_ANALYSIS.md` - Sistema de theming detallado
- `.claude/agents/` - Agentes para decisiones arquitecturales
- `CLAUDE.local.md` - Configuración y reglas del sistema

### **Código de Referencia**

- `src/shared/ui/index.ts` - Exports centralizados
- `src/pages/admin/settings/` - Ejemplo completo migrado
- `src/lib/theming/dynamicTheming.ts` - Configuración de theming dinámico
- `src/store/themeStore.ts` - Store de temas y paletas

### **Herramientas de Desarrollo**

```bash
# Linting para design system compliance
npm run lint:design-system

# Build con bundle analysis
npm run build:analyze

# Storybook con componentes documentados
npm run storybook
```

---

## 🎉 **Resultados Esperados**

Después de la implementación completa del Design System v2.0:

### **Métricas de Productividad**
- ✅ **50% menos líneas** de código UI repetitivo
- ✅ **90% más consistencia** visual automática  
- ✅ **Zero learning curve** para nuevos componentes
- ✅ **Instant theming** para todos los componentes

### **Métricas de Mantenimiento**
- ✅ **Cambios centralizados** en `@/shared/ui`
- ✅ **Type-safety completo** con TypeScript
- ✅ **Automated testing** de componentes semánticos
- ✅ **Breaking changes prevention** con interfaces estables

### **Métricas de UX**
- ✅ **Coherencia visual** en toda la aplicación
- ✅ **Theming dinámico** sin flickering
- ✅ **Responsive automático** en todos los componentes
- ✅ **Accessibility compliance** por defecto

---

*G-Admin Mini Design System v2.0 - Enero 2025*
*Sistema gastronómico con arquitectura "screaming" y theming dinámico*