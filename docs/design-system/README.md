# Design System Documentation

## Introduction

This design system is built on **Chakra UI v3** and utilizes **semantic tokens** to ensure consistency, accessibility, and theming capabilities across the G-Admin Mini application. The goal is to decouple design decisions from implementation details, allowing for easy updates and dark mode support.

## Tokens

The design system uses a centralized token system defined in `src/theme/tokens.ts` and `src/lib/theming/designTokens.ts`. These tokens should **ALWAYS** be used instead of hardcoded values.

### Semantic Tokens

Semantic tokens describe the *purpose* of a color or value rather than its specific look. This enables automatic theming (light/dark mode).

| Category | Token | Description | Example Value (Light) |
|----------|-------|-------------|-----------------------|
| **Backgrounds** | `bg.canvas` | Main page background | `gray.50` |
| | `bg.surface` | Cards, modals, panels | `white` |
| | `bg.subtle` | Subtle backgrounds | `gray.100` |
| **Text** | `text.primary` | Main content text | `gray.900` |
| | `text.secondary` | Secondary text | `gray.700` |
| | `text.muted` | Dimmed/disabled text | `gray.600` |
| **Borders** | `border.default` | Standard borders | `gray.200` |
| | `border.muted` | Subtle dividers | `gray.300` |
| **Status** | `status.success` | Success state | `green.600` |
| | `status.error` | Error state | `red.600` |

### Spacing Scale

We use a standard spacing scale based on **4px (0.25rem)** increments.

| Token | Size | Usage |
|-------|------|-------|
| `1` / `xs` | 4px | Micro gaps, text spacing |
| `2` / `sm` | 8px | Button gaps, tight grouping |
| `4` / `md` | 16px | Form fields, standard padding |
| `6` / `lg` | 24px | Card padding, section gaps |
| `8` / `xl` | 32px | Page layout, major sections |

## Component Usage

### CardWrapper

The `CardWrapper` component uses the **Compound Component** pattern for flexibility.

```tsx
import { CardWrapper } from '@/shared/ui';

// ✅ Standard Usage
<CardWrapper variant="outline">
  <CardWrapper.Header>
    <CardWrapper.Title>Card Title</CardWrapper.Title>
    <CardWrapper.Description>Optional description</CardWrapper.Description>
  </CardWrapper.Header>
  
  <CardWrapper.Body>
    <p>Main content goes here.</p>
  </CardWrapper.Body>
  
  <CardWrapper.Footer>
    <Button>Action</Button>
  </CardWrapper.Footer>
</CardWrapper>

// ✅ Simple Usage
<CardWrapper>
  <CardWrapper.Body>
    Simple content card
  </CardWrapper.Body>
</CardWrapper>
```

### ContentLayout

Used to wrap page content, providing consistent spacing and semantic structure.

```tsx
import { ContentLayout, Section } from '@/shared/ui';

// Usage in a Page
export default function DashboardPage() {
  return (
    <ContentLayout spacing="normal" mainLabel="Dashboard">
      <Section title="Overview">
        {/* Content */}
      </Section>
    </ContentLayout>
  );
}
```

### Section

Semantic sections with built-in styling variants and accessibility features.

```tsx
import { Section } from '@/shared/ui';

// Elevated Section (White background, shadow)
<Section variant="elevated" title="Performance Metrics">
  <StatsGrid />
</Section>

// Flat Section (Transparent, no shadow)
<Section variant="flat" title="Recent Activity">
  <ActivityList />
</Section>
```

## Theming

Theming is handled dynamically via Chakra's system. By strictly using **Semantic Tokens** (e.g., `bg="bg.surface"` instead of `bg="white"`), components automatically adapt to:

- **Light/Dark Mode**: Tokens map to different hex values based on the active color mode.
- **Brand Themes**: Primary colors can be swapped globally without touching component code.

## Migration Guide

When refactoring legacy code or adding new features:

1.  **Replace Hardcoded Colors**:
    *   ❌ `color="gray.500"` -> ✅ `color="text.muted"`
    *   ❌ `bg="white"` -> ✅ `bg="bg.surface"`
    *   ❌ `border="1px solid #E2E8F0"` -> ✅ `borderColor="border.default"`

2.  **Standardize Spacing**:
    *   ❌ `mt="20px"` -> ✅ `mt="5"` (20px) or `mt="6"` (24px)
    *   ❌ `p={3}` -> ✅ `p="3"` or `p="md"`

3.  **Use Shared UI Components**:
    *   Avoid importing directly from `@chakra-ui/react` for complex containers.
    *   Use `CardWrapper` instead of `Card`.
    *   Use `Section` for distinct page areas.
