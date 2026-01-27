# Design System Integration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrar el nuevo sistema de diseño de Magic Patterns (Chakra v2) al proyecto existente (Chakra v3), adaptando tokens y estilos mientras se mantiene la API actual de componentes y el theming dinámico.

**Architecture:** El nuevo sistema trae tokens de diseño estandarizados (spacing, colores semánticos, tipografía) y estilos visuales mejorados. La estrategia es: (1) adaptar tokens al formato v3 e integrarlos en `dynamicTheming.ts`, (2) actualizar los estilos de componentes existentes sin cambiar sus APIs, (3) preservar la compatibilidad con theming dinámico.

**Tech Stack:** Chakra UI v3, TypeScript, Zustand (theming store)

---

## Diferencias Clave: v2 vs v3

| Aspecto | Nuevo Sistema (v2) | Proyecto Actual (v3) |
|---------|-------------------|---------------------|
| Theme API | `extendTheme()` | `createSystem()` + `defineConfig()` |
| Semantic Tokens | `bg="bg.surface"` (string) | Mismo, pero en config v3 |
| Form Components | `FormControl`, `FormLabel` | `Field.Root`, `Field.Label` |
| Provider | `<ChakraProvider theme={}>` | `<ChakraProvider value={}>` |

---

## Phase 1: Design Tokens Foundation

### Task 1.1: Create Design Tokens File

**Files:**
- Create: `src/lib/theming/designTokens.ts`

**Step 1: Create the design tokens module**

Crear archivo con tokens del nuevo sistema adaptados para Chakra v3:

```typescript
/**
 * Design Tokens - Sistema de Tokens Centralizado para Chakra v3
 *
 * Adaptado del nuevo sistema de diseño (Magic Patterns)
 * Compatible con createSystem() y theming dinámico
 *
 * REGLA: Usar SOLO estos tokens, NUNCA valores hardcoded.
 */

/**
 * SPACING SCALE (Base 8px)
 * Uso: padding, margin, gap
 */
export const SPACING = {
  '0': '0',
  '1': '0.25rem',  // 4px  - Micro gaps, tight spacing
  '2': '0.5rem',   // 8px  - Small gaps (button groups, badges)
  '3': '0.75rem',  // 12px - Medium-small gaps
  '4': '1rem',     // 16px - Standard spacing (form fields, card content)
  '5': '1.25rem',  // 20px - Medium gaps
  '6': '1.5rem',   // 24px - Card padding, section gaps (STANDARD CARDS)
  '7': '1.75rem',  // 28px - Large-medium gaps
  '8': '2rem',     // 32px - Page container, major sections
  '10': '2.5rem',  // 40px - Extra large gaps
  '12': '3rem',    // 48px - Section separators
  '16': '4rem',    // 64px - Hero sections, page headers
  '20': '5rem',    // 80px - Extra large sections
} as const;

/**
 * SPACING USAGE GUIDE
 * Use these semantic names when explaining spacing decisions
 */
export const SPACING_USAGE = {
  microGap: '1',      // 4px - Entre iconos y texto
  buttonGroup: '2',   // 8px - Botones en grupo
  formField: '4',     // 16px - Entre campos de formulario
  cardPadding: '6',   // 24px - Padding interno de cards (STANDARD)
  sectionGap: '8',    // 32px - Entre secciones de pagina
  majorSection: '12', // 48px - Separadores grandes
  pageHeader: '16',   // 64px - Headers de pagina
} as const;

/**
 * TYPOGRAPHY SCALE
 */
export const FONT_SIZES = {
  xs: '0.75rem',    // 12px - Captions, metadata
  sm: '0.875rem',   // 14px - Small text, labels
  md: '1rem',       // 16px - Body text (BASE)
  lg: '1.125rem',   // 18px - Large body, subtitles
  xl: '1.25rem',    // 20px - Small headings
  '2xl': '1.5rem',  // 24px - Section headings
  '3xl': '1.875rem',// 30px - Page headings
  '4xl': '2.25rem', // 36px - Large headings
  '5xl': '3rem',    // 48px - Display text
  '6xl': '3.75rem', // 60px - Hero text
} as const;

export const FONT_WEIGHTS = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/**
 * BORDER RADIUS
 */
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',   // 2px - Small badges
  base: '0.25rem',  // 4px - Badges, small buttons
  md: '0.375rem',   // 6px - Inputs, buttons
  lg: '0.5rem',     // 8px - Cards (STANDARD)
  xl: '0.75rem',    // 12px - Modals, large cards
  '2xl': '1rem',    // 16px - Hero sections
  '3xl': '1.5rem',  // 24px - Special elements
  full: '9999px',   // Circular (avatars, pills)
} as const;

/**
 * SHADOWS (Elevation System)
 */
export const SHADOWS = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // STANDARD CARDS
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Elevated panels
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // Modals
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // Overlays
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
} as const;

/**
 * SEMANTIC COLOR TOKENS
 * These map to theme colors and adapt to light/dark modes
 */
export const SEMANTIC_TOKENS = {
  // Backgrounds
  'bg.canvas': 'gray.50',      // Main background
  'bg.surface': 'white',       // Cards, modals, panels
  'bg.subtle': 'gray.100',     // Subtle backgrounds
  'bg.muted': 'gray.200',      // Muted backgrounds

  // Text
  'text.primary': 'gray.900',  // Main text
  'text.secondary': 'gray.700',// Secondary text
  'text.muted': 'gray.600',    // Dimmed text
  'text.disabled': 'gray.400', // Disabled text

  // Borders
  'border.default': 'gray.200',// Default borders
  'border.muted': 'gray.300',  // Subtle borders
  'border.emphasis': 'gray.400',// Emphasized borders

  // Interactive
  'interactive.primary': 'blue.600',
  'interactive.hover': 'blue.700',
  'interactive.active': 'blue.800',

  // Status
  'status.success': 'green.600',
  'status.warning': 'yellow.600',
  'status.error': 'red.600',
  'status.info': 'blue.600',
} as const;

/**
 * Z-INDEX SCALE (Layering)
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

/**
 * ANIMATION DURATIONS
 */
export const DURATIONS = {
  fast: '150ms',
  normal: '250ms',
  slow: '400ms',
} as const;

/**
 * COMPONENT STANDARD STYLES
 * Common style presets for components
 */
export const CARD_STYLES = {
  bg: 'bg.surface',
  p: '6',
  borderRadius: 'lg',
  shadow: 'md',
  borderWidth: '1px',
  borderColor: 'border.default',
} as const;

export const CARD_HOVER_STYLES = {
  shadow: 'lg',
  transform: 'translateY(-2px)',
} as const;
```

**Step 2: Verify file created**

Run: `dir src\lib\theming\designTokens.ts`
Expected: File exists

**Step 3: Commit**

```bash
git add src/lib/theming/designTokens.ts
git commit -m "feat(theming): add design tokens from new design system"
```

---

### Task 1.2: Integrate Semantic Tokens into Dynamic Theming

**Files:**
- Modify: `src/lib/theming/dynamicTheming.ts`

**Step 1: Add semantic tokens to the defineConfig**

At the top of the file, add import:

```typescript
import { SEMANTIC_TOKENS, CARD_STYLES, SPACING } from './designTokens';
```

**Step 2: Add semantic token definitions to createThemeSystem**

In the `defineConfig()` call (around line 170), add semantic tokens to the theme section. The semantic tokens need to be defined in a way that works with the dynamic theming system.

Find the `theme: { tokens: { colors: {...} } }` section and add after it:

```typescript
semanticTokens: {
  colors: {
    // Backgrounds - adapt to theme
    'bg.canvas': { value: '{colors.gray.50}' },
    'bg.surface': { value: '{colors.gray.50}' },  // Use gray.50 for cards (matches current)
    'bg.subtle': { value: '{colors.gray.100}' },
    'bg.muted': { value: '{colors.gray.200}' },
    'bg.panel': { value: '{colors.gray.100}' },
    
    // Text
    'text.primary': { value: '{colors.gray.900}' },
    'text.secondary': { value: '{colors.gray.700}' },
    'text.muted': { value: '{colors.gray.600}' },
    'text.disabled': { value: '{colors.gray.400}' },
    'text.subtle': { value: '{colors.gray.500}' },
    
    // Borders
    'border.default': { value: '{colors.gray.200}' },
    'border.muted': { value: '{colors.gray.300}' },
    'border.emphasis': { value: '{colors.gray.400}' },
    
    // Interactive
    'interactive.primary': { value: '{colors.blue.600}' },
    'interactive.hover': { value: '{colors.blue.700}' },
    'interactive.active': { value: '{colors.blue.800}' },
    
    // Status
    'status.success': { value: '{colors.green.600}' },
    'status.warning': { value: '{colors.yellow.600}' },
    'status.error': { value: '{colors.red.600}' },
    'status.info': { value: '{colors.blue.600}' },
  },
},
```

**Step 3: Run TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/lib/theming/dynamicTheming.ts
git commit -m "feat(theming): integrate semantic tokens into dynamic theme system"
```

---

## Phase 2: Core Layout Components

### Task 2.1: Update ContentLayout Styles

**Files:**
- Modify: `src/shared/ui/ContentLayout.tsx`

**Step 1: Update background to use semantic token**

Change line ~105 from:
```typescript
bg="gray.50"
```

To:
```typescript
bg="bg.canvas"
```

**Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/ui/ContentLayout.tsx
git commit -m "refactor(ui): update ContentLayout to use semantic tokens"
```

---

### Task 2.2: Update CardWrapper Styles

**Files:**
- Modify: `src/shared/ui/CardWrapper.tsx`

**Step 1: Update CardWrapper base component**

Change the default `bg` prop value (line ~93) from:
```typescript
bg = 'gray.50'
```

To:
```typescript
bg = 'bg.surface'
```

**Step 2: Add standard shadow and border**

In the ChakraCard.Root component, ensure these props:
```typescript
<ChakraCard.Root 
  variant={variant}
  size={size}
  color={color}
  colorPalette={colorPalette}
  bg={bg}
  shadow="md"
  borderRadius="lg"
  borderWidth="1px"
  borderColor="border.default"
  {...props}
>
```

**Step 3: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/shared/ui/CardWrapper.tsx
git commit -m "refactor(ui): update CardWrapper to use semantic tokens and standard styles"
```

---

### Task 2.3: Update Section Styles

**Files:**
- Modify: `src/shared/ui/Section.tsx`

**Step 1: Read current implementation**

Review the file to understand current styling.

**Step 2: Update to use semantic tokens**

Update any hardcoded colors to use semantic tokens:
- `color="gray.900"` -> `color="text.primary"`
- `color="gray.600"` -> `color="text.muted"`
- `bg="white"` or `bg="gray.50"` -> `bg="bg.surface"`

**Step 3: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/shared/ui/Section.tsx
git commit -m "refactor(ui): update Section to use semantic tokens"
```

---

### Task 2.4: Update PageHeader Styles

**Files:**
- Modify: `src/shared/ui/PageHeader.tsx`

**Step 1: Read current implementation**

Review the file to understand current styling.

**Step 2: Update to use semantic tokens**

Update any hardcoded colors to use semantic tokens:
- Title colors -> `color="text.primary"`
- Subtitle colors -> `color="text.secondary"`

**Step 3: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/shared/ui/PageHeader.tsx
git commit -m "refactor(ui): update PageHeader to use semantic tokens"
```

---

### Task 2.5: Update MetricCard Styles

**Files:**
- Modify: `src/shared/ui/MetricCard.tsx`

**Step 1: Review new design system MetricCard**

The new design system MetricCard uses:
- `bg="bg.surface"` for background
- `borderColor="border.default"` for borders
- `color="text.primary"` for main value
- `color="text.secondary"` / `color="text.muted"` for labels
- `shadow="md"` with `shadow="lg"` on hover
- Hover animation: `transform: 'translateY(-2px)'`

**Step 2: Update current MetricCard implementation**

The current implementation uses `Typography` and `CardWrapper` which is good. Update any direct color references to semantic tokens:

- Ensure card uses `bg="bg.surface"`
- Ensure borders use `borderColor="border.default"`
- Ensure title uses `color="text.muted"`
- Ensure value uses `color="text.primary"`

**Step 3: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/shared/ui/MetricCard.tsx
git commit -m "refactor(ui): update MetricCard to use semantic tokens"
```

---

## Phase 3: Form Components

### Task 3.1: Update InputField Styles

**Files:**
- Modify: `src/shared/ui/Input.tsx` (contains InputField)

**Step 1: Review new design system InputField**

The new design uses:
- `bg="bg.surface"` for input background
- `color="text.primary"` for input text
- `borderColor` with gray.200 default, red.500 for error
- Focus ring with blue.500

**Step 2: Update current InputField**

Note: Current project uses Chakra v3 `Field` namespace instead of `FormControl`. Keep the current API but update colors to semantic tokens.

**Step 3: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/shared/ui/Input.tsx
git commit -m "refactor(ui): update InputField to use semantic tokens"
```

---

### Task 3.2: Update SelectField Styles

**Files:**
- Modify: `src/shared/ui/SelectField.tsx`

**Step 1: Apply same pattern as InputField**

Update colors to semantic tokens:
- Background: `bg.surface`
- Text: `text.primary`
- Border: `border.default`
- Label: `text.primary` or `text.secondary`

**Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/ui/SelectField.tsx
git commit -m "refactor(ui): update SelectField to use semantic tokens"
```

---

### Task 3.3: Update TextareaField Styles

**Files:**
- Modify: `src/shared/ui/TextareaField.tsx`

**Step 1: Apply same pattern as InputField**

Update colors to semantic tokens.

**Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/ui/TextareaField.tsx
git commit -m "refactor(ui): update TextareaField to use semantic tokens"
```

---

### Task 3.4: Update FormSection Styles

**Files:**
- Modify: `src/shared/ui/FormSection.tsx`

**Step 1: Update to use semantic tokens**

Apply semantic tokens to any hardcoded colors.

**Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/ui/FormSection.tsx
git commit -m "refactor(ui): update FormSection to use semantic tokens"
```

---

## Phase 4: Data Display Components

### Task 4.1: Update Badge Styles

**Files:**
- Modify: `src/shared/ui/Badge.tsx`

**Step 1: Review new design system Badge**

Apply consistent styling patterns.

**Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/ui/Badge.tsx
git commit -m "refactor(ui): update Badge to use semantic tokens"
```

---

### Task 4.2: Update Table Styles

**Files:**
- Modify: `src/shared/ui/Table.tsx`

**Step 1: Update table styling**

Apply semantic tokens:
- Header background: `bg.subtle`
- Row borders: `border.default`
- Text colors: `text.primary`, `text.secondary`

**Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/ui/Table.tsx
git commit -m "refactor(ui): update Table to use semantic tokens"
```

---

### Task 4.3: Update Tabs Styles

**Files:**
- Modify: `src/shared/ui/Tabs.tsx`

**Step 1: Apply semantic tokens**

Update any hardcoded colors.

**Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/ui/Tabs.tsx
git commit -m "refactor(ui): update Tabs to use semantic tokens"
```

---

### Task 4.4: Update Accordion Styles

**Files:**
- Modify: `src/shared/ui/Accordion.tsx`

**Step 1: Apply semantic tokens**

Update any hardcoded colors.

**Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/ui/Accordion.tsx
git commit -m "refactor(ui): update Accordion to use semantic tokens"
```

---

## Phase 5: Feedback & Overlay Components

### Task 5.1: Update Alert Styles

**Files:**
- Modify: `src/shared/ui/Alert.tsx`

**Step 1: Apply semantic tokens**

Status colors should use:
- `status.success`, `status.warning`, `status.error`, `status.info`

**Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/ui/Alert.tsx
git commit -m "refactor(ui): update Alert to use semantic tokens"
```

---

### Task 5.2: Update Modal Styles

**Files:**
- Modify: `src/shared/ui/Modal.tsx`

**Step 1: Apply semantic tokens**

- Background: `bg.surface`
- Text: `text.primary`
- Shadow: `xl` (for modals)

**Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/ui/Modal.tsx
git commit -m "refactor(ui): update Modal to use semantic tokens"
```

---

### Task 5.3: Update Loading/Empty States

**Files:**
- Modify: `src/shared/ui/QuickComponents.tsx` (contains EmptyState, LoadingState patterns)

**Step 1: Apply semantic tokens**

Update any hardcoded colors.

**Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/ui/QuickComponents.tsx
git commit -m "refactor(ui): update EmptyState/LoadingState to use semantic tokens"
```

---

## Phase 6: Documentation & Validation

### Task 6.1: Create Design System Documentation

**Files:**
- Create: `docs/design-system/README.md`

**Step 1: Create documentation**

Create a README documenting:
- Available tokens and their usage
- Component styling standards
- Migration notes from the old system

**Step 2: Commit**

```bash
git add docs/design-system/README.md
git commit -m "docs: add design system documentation"
```

---

### Task 6.2: Update DESIGN_SYSTEM.md in src/shared/ui

**Files:**
- Create: `src/shared/ui/DESIGN_SYSTEM.md`

**Step 1: Create usage guide**

Copy and adapt the design system documentation from `new_design_system/src/DESIGN_SYSTEM.md`, updating for Chakra v3 usage.

**Step 2: Commit**

```bash
git add src/shared/ui/DESIGN_SYSTEM.md
git commit -m "docs: add design system usage guide to shared/ui"
```

---

### Task 6.3: Final Validation

**Step 1: Run full TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: No errors

**Step 2: Run linter**

Run: `pnpm lint`
Expected: No errors (or only pre-existing ones)

**Step 3: Run tests**

Run: `pnpm test:run`
Expected: All tests pass

**Step 4: Visual verification**

Start dev server (user has one running on :5173) and manually verify:
- Cards have consistent styling (shadow, border radius)
- Semantic colors work with theming
- Forms look consistent
- Typography is correct

**Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete design system integration"
```

---

## Summary

| Phase | Tasks | Files |
|-------|-------|-------|
| 1. Tokens | 2 | designTokens.ts, dynamicTheming.ts |
| 2. Layout | 5 | ContentLayout, CardWrapper, Section, PageHeader, MetricCard |
| 3. Forms | 4 | InputField, SelectField, TextareaField, FormSection |
| 4. Data Display | 4 | Badge, Table, Tabs, Accordion |
| 5. Feedback | 3 | Alert, Modal, QuickComponents |
| 6. Docs | 3 | README, DESIGN_SYSTEM.md, Validation |

**Total: 21 tasks**

---

## Notes

- **API Preservation**: We are NOT changing component APIs. Only updating styling to use semantic tokens.
- **Theming Compatibility**: Semantic tokens integrate with existing dynamic theming system.
- **Gradual Adoption**: Components can be migrated incrementally; semantic tokens fall back gracefully.
- **Testing**: Visual verification is critical after each phase.

---

**Last Updated**: 2026-01-21
