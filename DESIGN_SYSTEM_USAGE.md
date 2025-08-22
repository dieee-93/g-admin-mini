# Design System G-Admin Mini v2.0 - Guía de Uso

## 📋 INSTRUCCIÓN PARA CLAUDE

**SIEMPRE usa este sistema de diseño cuando construyas componentes UI para G-Admin Mini. NO uses componentes directos de Chakra UI.**

## 🎯 Import Principal

```tsx
import { 
  // Layout & Structure
  Layout, Stack, VStack, HStack, Cluster, Center,
  
  // Typography
  Typography, Heading, Title, Body, Caption, Label, Code,
  
  // Base Components  
  Button, Card, InputField, NumberField, SelectField,
  
  // Advanced Components
  Modal, Alert, Badge, Tabs,
  
  // Business Components
  RecipeCostCard, InventoryAlertBadge, SalesMetricChart,
  
  // Context & Smart Defaults
  DashboardArea, FormArea, TableArea, ModalArea,
  useSmartDefaults, useContextualProps
} from '@/shared/ui'
```

## 🏗️ Patrones de Uso

### Layout Structure
```tsx
// ❌ NO hagas esto
<Box p={4}>
  <Text fontSize="xl">Título</Text>
  <VStack spacing={4}>
    <Text>Contenido</Text>
  </VStack>
</Box>

// ✅ HAZ esto
<Layout variant="panel" padding="md">
  <Typography variant="heading">Título</Typography>
  <Stack gap="md">
    <Typography variant="body">Contenido</Typography>
  </Stack>
</Layout>
```

### Cards with Compound Pattern
```tsx
// ✅ Estructura correcta
<Card variant="elevated" padding="none">
  <Card.Header justify="space-between">
    <Typography variant="heading">Título</Typography>
    <Button size="sm">Acción</Button>
  </Card.Header>
  <Card.Body>
    <Typography variant="body">Contenido</Typography>
  </Card.Body>
  <Card.Footer justify="end">
    <Button variant="outline">Cancelar</Button>
    <Button variant="solid">Guardar</Button>
  </Card.Footer>
</Card>
```

### Smart Context Areas
```tsx
// ✅ Usa áreas de contexto para defaults automáticos
<DashboardArea>
  <Card> {/* Automáticamente: variant="elevated", interactive=true */}
    <Typography> {/* Automáticamente: size="md", color="primary" */}
</DashboardArea>

<FormArea>
  <Card> {/* Automáticamente: variant="outline", shadow="sm" */}
    <Button> {/* Automáticamente: size="md" */}
</FormArea>
```

## 🎨 Componentes por Categoría

### Layout
- `Layout` - Reemplaza Box con variantes semánticas
- `Stack/VStack/HStack` - Flexbox unificado
- `Cluster` - Wrap automático
- `Center` - Centrado perfecto

### Content
- `Typography` - Sistema tipográfico completo
- `Heading/Title/Body/Caption/Label/Code` - Shortcuts tipográficos

### Controls  
- `Button` - Con estados y variantes
- `InputField/NumberField/SelectField` - Forms consistentes

### Feedback
- `Alert` - Con variantes de negocio (`Alert.Inventory`, `Alert.System`)
- `Badge` - Estados semánticos (`Badge.Status`, `Badge.Stock`, `Badge.Priority`)
- `Modal` - Compound pattern completo

### Navigation
- `Tabs` - Con especializaciones (`Tabs.Module`, `Tabs.Settings`, `Tabs.Data`)

### Business Specific
- `RecipeCostCard` - Gestión de recetas y costos
- `InventoryAlertBadge` - Sistema de alertas de inventario  
- `SalesMetricChart` - Métricas y gráficos de ventas

## 🎯 Temas Disponibles

Usa el `ThemeToggle` o programa áticamente:
```tsx
const { setTheme } = useTheme()

// Temas disponibles:
// 'light', 'dark', 'system', 'corporate', 'nature', 'sunset', 'ocean', 'high-contrast'
setTheme('corporate')
```

## 📚 Documentación Completa

- **Storybook**: `pnpm run storybook` - http://localhost:6006
- **Design System Guide**: `/docs/DESIGN_SYSTEM.md`
- **Migration Guide**: Reemplaza imports de `@chakra-ui/react` con `@/shared/ui`

## ⚡ Reglas de Oro

1. **NUNCA** importes directamente de `@chakra-ui/react`
2. **SIEMPRE** usa variantes semánticas (`variant="elevated"` no `shadow="md"`)
3. **PREFIERE** compound patterns (`Card.Header` no `CardHeader` separado)
4. **USA** contextos inteligentes (`DashboardArea`, `FormArea`)
5. **APLICA** tokens semánticos (`color="accent"` no `color="blue.500"`)

## 🔍 Storybook Quick Reference

- **Layout Stories**: Design System → Layout
- **Typography**: Design System → Typography  
- **Cards**: Design System → Card
- **Business Components**: Design System → RecipeCostCard, etc.

---

**📖 Para ver ejemplos completos y interactivos, ejecuta `pnpm run storybook`**