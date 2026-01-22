# 🎨 Design System Guide

This guide provides the standards for building consistent UI in G-Admin Mini.

## Core Principles

1. **Mobile-First**: Always design for mobile first, then scale up using responsive props.
   ```tsx
   // ✅ Correct
   <Box p={{ base: '4', md: '6', lg: '8' }}>
   ```

2. **Semantic Tokens**: Use semantic tokens for colors that adapt to themes (light/dark).
   ```tsx
   // ✅ Correct
   <Box bg="bg.surface" color="text.primary">
   ```

3. **Reusable Components**: Build with standardized components (`CardWrapper`, `ContentLayout`) instead of primitives.

---

## Tokens Reference

**NEVER** use hardcoded values (e.g., `16px`, `#ffffff`). Always use tokens.

### Spacing
| Token | Value | Usage |
|-------|-------|-------|
| `1` | 4px | Micro gaps |
| `2` | 8px | Button groups, small gaps |
| `4` | 16px | Form fields, standard gaps |
| `6` | 24px | **Standard Card Padding** |
| `8` | 32px | Section spacing |

### Colors (Semantic)
| Token | Description |
|-------|-------------|
| `bg.canvas` | Main background (gray.50 / gray.900) |
| `bg.surface` | Card background (white / gray.800) |
| `text.primary` | Main text (gray.900 / gray.50) |
| `text.muted` | Secondary text (gray.600 / gray.400) |
| `border.default` | Standard border (gray.200 / gray.700) |

---

## Component Patterns

### 1. ContentLayout
The main wrapper for all pages. Handles spacing and semantic structure.

```tsx
import { ContentLayout, Section } from '@/shared/ui';

export default function MyPage() {
  return (
    <ContentLayout spacing="normal"> {/* tight | compact | normal | loose */}
      <Section title="Section Title">
        {/* Content */}
      </Section>
    </ContentLayout>
  );
}
```

### 2. PageHeader
Standard header with title and actions.

```tsx
import { PageHeader, Button } from '@/shared/ui';

<PageHeader
  title="Page Title"
  subtitle="Optional description"
  actions={
    <Button colorPalette="blue">New Item</Button>
  }
/>
```

### 3. CardWrapper
Compound component for consistent cards.

```tsx
import { CardWrapper, Button } from '@/shared/ui';

<CardWrapper>
  <CardWrapper.Header title="Card Title" subtitle="Subtitle" />
  
  <CardWrapper.Body>
    <Stack gap="4">
      {/* Card Content */}
    </Stack>
  </CardWrapper.Body>

  <CardWrapper.Footer justify="flex-end">
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </CardWrapper.Footer>
</CardWrapper>
```

---

## Rules

### ❌ DO NOT
1. **Import from `@chakra-ui/react` directly** for UI components. Always use `@/shared/ui`.
   ```tsx
   // ❌ Wrong
   import { Box } from '@chakra-ui/react';
   
   // ✅ Correct
   import { Box } from '@/shared/ui';
   ```
2. **Use hardcoded hex colors**. (e.g., `bg="#fff"`). Use `bg="bg.surface"`.
3. **Use hardcoded pixel values**. (e.g., `p="24px"`). Use `p="6"`.
4. **Mix consistent spacing**. Stick to the 4/6/8 scale.

### ✅ DO
1. Use `ContentLayout` for every page root.
2. Use `CardWrapper` for all content containers.
3. Check `src/shared/ui` before building a new component.
