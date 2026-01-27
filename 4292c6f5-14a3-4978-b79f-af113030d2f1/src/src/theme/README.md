
# Sistema de Diseño - Guía de Uso

## 📐 Tokens de Diseño

### Spacing (Espaciado)

**Escala base: 8px**

| Token | Valor | Uso |
|-------|-------|-----|
| `1` | 4px | Micro gaps, espaciado entre ícono y texto |
| `2` | 8px | Button groups, badges, espaciado pequeño |
| `4` | 16px | Form fields, card content, espaciado estándar |
| `6` | 24px | **Card padding (ESTÁNDAR)**, section gaps |
| `8` | 32px | Page container, major sections |
| `12` | 48px | Section separators, large gaps |
| `16` | 64px | Hero sections, page headers |

**Ejemplos de uso:**

```tsx
// ✅ CORRECTO
<Box p="6">           // 24px padding (card estándar)
<Stack gap="4">       // 16px gap (form fields)
<Button px="4" py="2"> // 16px horizontal, 8px vertical

// ❌ INCORRECTO
<Box padding="24px">
<Stack gap="16px">
<Button paddingX="16px" paddingY="8px">
```

### Colors (Colores)

**Usa SIEMPRE tokens semánticos:**

```tsx
// ✅ CORRECTO - Semantic tokens (se adaptan al tema)
<Box bg="bg.surface">        // Fondo de cards/modals
<Text color="text.primary">  // Texto principal
<Box borderColor="border.default"> // Bordes

// ❌ INCORRECTO - Valores hardcoded
<Box bg="white">
<Text color="#111827">
<Box borderColor="#e5e7eb">
```

**Tokens semánticos disponibles:**

- **Backgrounds**: `bg.canvas`, `bg.surface`, `bg.subtle`, `bg.muted`
- **Text**: `text.primary`, `text.secondary`, `text.muted`, `text.disabled`
- **Borders**: `border.default`, `border.muted`, `border.emphasis`

### Typography (Tipografía)

**Font sizes:**

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

**Font weights:**

- `light` (300), `normal` (400), `medium` (500), `semibold` (600), `bold` (700)

**Ejemplos:**

```tsx
// ✅ CORRECTO
<Text fontSize="md" fontWeight="medium">
<Heading fontSize="2xl" fontWeight="semibold">

// ❌ INCORRECTO
<Text fontSize="16px" fontWeight="500">
<Heading fontSize="24px" fontWeight="600">
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

## 🎨 Patrones de Componentes

### Card Estándar

```tsx
<Box 
  bg="bg.surface"
  p="6"              // 24px padding (ESTÁNDAR)
  borderRadius="lg"  // 8px (ESTÁNDAR)
  shadow="md"        // Elevación media (ESTÁNDAR)
  borderWidth="1px"
  borderColor="border.default"
>
  {/* Contenido */}
</Box>
```

### Button Group

```tsx
<Stack direction="row" gap="2">  // 8px gap (ESTÁNDAR para botones)
  <Button>Cancelar</Button>
  <Button colorPalette="blue">Guardar</Button>
</Stack>
```

### Form Layout

```tsx
<Stack gap="4">  // 16px gap (ESTÁNDAR para forms)
  <InputField label="Nombre" />
  <InputField label="Email" />
  <Button>Enviar</Button>
</Stack>
```

## 📱 Responsive Design

**Mobile-first approach:**

```tsx
<Box 
  p={{ base: '4', md: '6', lg: '8' }}  // 16px → 24px → 32px
  fontSize={{ base: 'md', lg: 'lg' }}   // 16px → 18px
>
```

**Breakpoints:**

- `base`: 0px (mobile)
- `sm`: 480px
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px
- `2xl`: 1536px

## ⚠️ Reglas Obligatorias

### ✅ SIEMPRE:

1. Usar tokens de spacing (`p="6"`, no `padding="24px"`)
2. Usar semantic tokens para colores (`bg="bg.surface"`, no `bg="white"`)
3. Usar tokens de border radius (`borderRadius="lg"`, no `borderRadius="8px"`)
4. Usar tokens de shadows (`shadow="md"`, no valores custom)
5. Mobile-first responsive (`base` → `md` → `lg`)

### ❌ NUNCA:

1. Valores hardcoded: `padding="24px"`, `fontSize="16px"`
2. Colores directos: `bg="white"`, `color="#111827"`
3. Border radius custom: `borderRadius="8px"`
4. Shadows custom: `boxShadow="0 4px 6px..."`
5. Desktop-first responsive

## 🎯 Checklist de Componente

Antes de crear/modificar un componente, verifica:

- [ ] ¿Usa tokens de spacing? (`p="6"`, `gap="4"`)
- [ ] ¿Usa semantic tokens? (`bg="bg.surface"`, `color="text.primary"`)
- [ ] ¿Usa tokens de border radius? (`borderRadius="lg"`)
- [ ] ¿Usa tokens de shadows? (`shadow="md"`)
- [ ] ¿Es responsive mobile-first? (`base` → `md` → `lg`)
- [ ] ¿Sigue los patrones estándar? (card padding `6`, button gap `2`, form gap `4`)
- [ ] ¿Tiene contrast ratio WCAG AA? (4.5:1 mínimo)
- [ ] ¿Touch targets son 44px mínimo? (mobile)

## 📚 Recursos

- [Design Tokens](./designTokens.ts) - Todos los tokens disponibles
- [Chakra Theme](./chakraTheme.ts) - Configuración del tema
- [Chakra UI Docs](https://www.chakra-ui.com/docs) - Documentación oficial
