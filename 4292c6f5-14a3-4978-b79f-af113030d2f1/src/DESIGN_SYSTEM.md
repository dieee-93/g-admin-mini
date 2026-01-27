
# 🎨 Sistema de Diseño - Guía Completa

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Principios de Diseño](#principios-de-diseño)
3. [Tokens de Diseño](#tokens-de-diseño)
4. [Componentes](#componentes)
5. [Patrones de Uso](#patrones-de-uso)
6. [Reglas Obligatorias](#reglas-obligatorias)
7. [Checklist de Desarrollo](#checklist-de-desarrollo)

---

## Introducción

Este sistema de diseño proporciona una base sólida y consistente para construir interfaces empresariales modernas. Está basado en **Chakra UI v3** con tokens personalizados y componentes estandarizados.

### Objetivos

✅ **Consistencia**: Mismo look & feel en todas las páginas  
✅ **Escalabilidad**: Fácil de mantener y extender  
✅ **Accesibilidad**: WCAG 2.1 AA mínimo  
✅ **Responsive**: Mobile-first approach  
✅ **Productividad**: Desarrollo rápido con componentes reutilizables

---

## Principios de Diseño

### 1. Mobile-First

Siempre diseña primero para móvil, luego escala hacia arriba:

```tsx
// ✅ CORRECTO
<Box p={{ base: '4', md: '6', lg: '8' }}>

// ❌ INCORRECTO
<Box p={{ lg: '8', md: '6', base: '4' }}>
```

### 2. Tokens Obligatorios

**NUNCA uses valores hardcoded**. Siempre usa tokens:

```tsx
// ✅ CORRECTO
<Box p="6" borderRadius="lg" shadow="md">

// ❌ INCORRECTO
<Box padding="24px" borderRadius="8px" boxShadow="0 4px 6px rgba(0,0,0,0.1)">
```

### 3. Semantic Tokens

Usa tokens semánticos para colores (se adaptan al tema):

```tsx
// ✅ CORRECTO
<Box bg="bg.surface" color="text.primary">

// ❌ INCORRECTO
<Box bg="white" color="#111827">
```

### 4. Componentes Reutilizables

Construye con componentes, no con primitivas directas:

```tsx
// ✅ CORRECTO
<CardWrapper>
  <CardWrapper.Header title="Título" />
  <CardWrapper.Body>Contenido</CardWrapper.Body>
</CardWrapper>

// ❌ INCORRECTO (repetitivo)
<Box bg="white" p="6" borderRadius="lg" shadow="md">
  <Heading>Título</Heading>
  <Text>Contenido</Text>
</Box>
```

---

## Tokens de Diseño

### Spacing (Espaciado)

**Escala base: 8px**

| Token | Valor | Uso Principal |
|-------|-------|---------------|
| `1` | 4px | Micro gaps (ícono + texto) |
| `2` | 8px | **Button groups, badges** |
| `4` | 16px | **Form fields, card content** |
| `6` | 24px | **Card padding (ESTÁNDAR)** |
| `8` | 32px | **Section gaps** |
| `12` | 48px | Major separators |
| `16` | 64px | Hero sections |

**Guía de uso:**

```tsx
// Cards
<Box p="6">                    // 24px padding (ESTÁNDAR)

// Button groups
<Stack direction="row" gap="2"> // 8px gap

// Form fields
<Stack gap="4">                 // 16px gap

// Sections
<Section spacing="normal">      // 24px margin-bottom
```

### Colors (Colores)

**Semantic Tokens (se adaptan al tema):**

```tsx
// Backgrounds
bg.canvas      // Main background (gray.50 light / gray.900 dark)
bg.surface     // Cards, modals (white light / gray.800 dark)
bg.subtle      // Subtle backgrounds
bg.muted       // Muted backgrounds

// Text
text.primary   // Main text (gray.900 light / gray.50 dark)
text.secondary // Secondary text
text.muted     // Dimmed text
text.disabled  // Disabled text

// Borders
border.default // Default borders (gray.200 light / gray.700 dark)
border.muted   // Subtle borders
border.emphasis // Emphasized borders
```

**Color Palettes (fijos, no cambian con tema):**

- `blue.*` - Primary actions
- `green.*` - Success states
- `yellow.*` - Warning states
- `red.*` - Error states
- `purple.*` - Accent elements

### Typography (Tipografía)

**Font Sizes:**

| Token | Valor | Uso |
|-------|-------|-----|
| `xs` | 12px | Captions, metadata |
| `sm` | 14px | Small text, labels |
| `md` | 16px | **Body text (BASE)** |
| `lg` | 18px | Large body, subtitles |
| `xl` | 20px | Small headings |
| `2xl` | 24px | Section headings |
| `3xl` | 30px | Page headings |
| `4xl` | 36px | Large headings |

**Font Weights:**

- `light` (300) - Decorative text
- `normal` (400) - Body text
- `medium` (500) - Emphasized text
- `semibold` (600) - Headings
- `bold` (700) - Strong emphasis

**Ejemplos:**

```tsx
// Body text
<Text fontSize="md" fontWeight="normal" color="text.primary">

// Headings
<Heading fontSize="2xl" fontWeight="semibold" color="text.primary">

// Captions
<Text fontSize="xs" color="text.secondary">
```

### Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `sm` | 2px | Badges pequeños |
| `base` | 4px | Badges, small buttons |
| `md` | 6px | Inputs, buttons |
| `lg` | 8px | **Cards (ESTÁNDAR)** |
| `xl` | 12px | Modals, large cards |
| `full` | 9999px | Circular (avatars, pills) |

### Shadows (Elevación)

| Token | Uso |
|-------|-----|
| `sm` | Hover states |
| `md` | **Cards (ESTÁNDAR)** |
| `lg` | Elevated panels |
| `xl` | Modals, drawers |
| `2xl` | Overlays |

---

## Componentes

### ContentLayout

Wrapper principal para el contenido de páginas.

```tsx
<ContentLayout spacing="normal">
  {/* Contenido de la página */}
</ContentLayout>
```

**Props:**

- `spacing`: `'compact'` (16px) | `'normal'` (24px) | `'spacious'` (32px)
- `maxW`: Max width del contenedor (default: `'1400px'`)

### PageHeader

Header estándar con título y acciones.

```tsx
<PageHeader 
  title="Título de la Página"
  subtitle="Descripción opcional"
  actions={
    <>
      <Button variant="outline">Cancelar</Button>
      <Button colorPalette="blue">Guardar</Button>
    </>
  }
/>
```

### Section

Agrupa contenido relacionado con título opcional.

```tsx
<Section 
  title="Título de Sección"
  description="Descripción opcional"
  spacing="normal"
>
  {/* Contenido */}
</Section>
```

### CardWrapper

Card estándar con compound components.

```tsx
<CardWrapper padding="normal" hoverable>
  <CardWrapper.Header 
    title="Título"
    subtitle="Subtítulo"
    actions={<Button size="sm">Editar</Button>}
  />
  <CardWrapper.Body>
    {/* Contenido */}
  </CardWrapper.Body>
  <CardWrapper.Footer justify="flex-end">
    <Button variant="outline">Cancelar</Button>
    <Button colorPalette="blue">Guardar</Button>
  </CardWrapper.Footer>
</CardWrapper>
```

---

## Patrones de Uso

### Patrón: Página Estándar

```tsx
import { ContentLayout, PageHeader, Section, CardWrapper } from '@/shared/ui';

export function MyPage() {
  return (
    <ContentLayout spacing="normal">
      <PageHeader 
        title="Mi Página"
        actions={<Button colorPalette="blue">Nueva Acción</Button>}
      />
      
      <Section title="Contenido Principal">
        <CardWrapper>
          {/* Contenido */}
        </CardWrapper>
      </Section>
    </ContentLayout>
  );
}
```

### Patrón: Grid de Cards

```tsx
<Section title="Métricas">
  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="6">
    <MetricCard label="Ventas" value="$10,000" />
    <MetricCard label="Clientes" value="1,234" />
    <MetricCard label="Pedidos" value="45" />
    <MetricCard label="Satisfacción" value="98%" />
  </SimpleGrid>
</Section>
```

### Patrón: Formulario

```tsx
<CardWrapper>
  <CardWrapper.Header title="Información" />
  <CardWrapper.Body>
    <Stack gap="4">
      <Input placeholder="Nombre" />
      <Input placeholder="Email" type="email" />
      <Input placeholder="Teléfono" />
    </Stack>
  </CardWrapper.Body>
  <CardWrapper.Footer>
    <Button variant="outline">Cancelar</Button>
    <Button colorPalette="blue">Guardar</Button>
  </CardWrapper.Footer>
</CardWrapper>
```

### Patrón: Button Group

```tsx
// Horizontal
<Stack direction="row" gap="2">
  <Button variant="outline">Cancelar</Button>
  <Button colorPalette="blue">Confirmar</Button>
</Stack>

// Vertical (mobile)
<Stack direction={{ base: 'column', md: 'row' }} gap="2">
  <Button variant="outline">Cancelar</Button>
  <Button colorPalette="blue">Confirmar</Button>
</Stack>
```

---

## Reglas Obligatorias

### ✅ SIEMPRE:

1. **Importar de `@/shared/ui`**, nunca de `@chakra-ui/react`
2. **Usar tokens de spacing**: `p="6"`, no `padding="24px"`
3. **Usar semantic tokens**: `bg="bg.surface"`, no `bg="white"`
4. **Usar tokens de border radius**: `borderRadius="lg"`, no `borderRadius="8px"`
5. **Usar tokens de shadows**: `shadow="md"`, no valores custom
6. **Mobile-first responsive**: `base` → `md` → `lg`
7. **ContentLayout en todas las páginas**
8. **PageHeader para títulos de página**
9. **Section para agrupar contenido**
10. **CardWrapper para cards**

### ❌ NUNCA:

1. Valores hardcoded: `padding="24px"`, `fontSize="16px"`
2. Colores directos: `bg="white"`, `color="#111827"`
3. Border radius custom: `borderRadius="8px"`
4. Shadows custom: `boxShadow="0 4px 6px..."`
5. Desktop-first responsive: `lg` → `md` → `base`
6. Importar de Chakra directamente
7. Repetir estilos (crear componente reutilizable)
8. Ignorar accesibilidad (WCAG AA mínimo)

---

## Checklist de Desarrollo

Antes de crear/modificar un componente:

### Diseño

- [ ] ¿Usa tokens de spacing? (`p="6"`, `gap="4"`)
- [ ] ¿Usa semantic tokens? (`bg="bg.surface"`, `color="text.primary"`)
- [ ] ¿Usa tokens de border radius? (`borderRadius="lg"`)
- [ ] ¿Usa tokens de shadows? (`shadow="md"`)
- [ ] ¿Sigue los patrones estándar? (card padding `6`, button gap `2`)

### Responsive

- [ ] ¿Es mobile-first? (`base` → `md` → `lg`)
- [ ] ¿Se ve bien en móvil? (320px+)
- [ ] ¿Se ve bien en tablet? (768px+)
- [ ] ¿Se ve bien en desktop? (1024px+)

### Accesibilidad

- [ ] ¿Tiene contrast ratio WCAG AA? (4.5:1 mínimo)
- [ ] ¿Touch targets son 44px mínimo? (mobile)
- [ ] ¿Tiene labels apropiados? (ARIA)
- [ ] ¿Funciona con teclado? (Tab, Enter, Escape)

### Código

- [ ] ¿Importa de `@/shared/ui`? (no de Chakra)
- [ ] ¿Usa componentes reutilizables? (no repite código)
- [ ] ¿Tiene TypeScript types? (no `any`)
- [ ] ¿Sigue convenciones de nombres? (PascalCase componentes)

---

## Recursos

- [Design Tokens](./src/theme/designTokens.ts) - Todos los tokens disponibles
- [Chakra Theme](./src/theme/chakraTheme.ts) - Configuración del tema
- [Shared UI](./src/shared/ui/) - Componentes reutilizables
- [Chakra UI Docs](https://www.chakra-ui.com/docs) - Documentación oficial

---

**Última actualización**: Enero 2026  
**Versión**: 1.0.0
