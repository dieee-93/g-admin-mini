# Tooltip Component Documentation

**Status**: ✅ Complete
**Version**: 1.0.0
**Chakra UI Version**: v3.23.0

---

## Overview

Full-featured Tooltip wrapper component that exposes all native Chakra UI Tooltip functionality while following G-Admin Mini design system patterns.

## Installation

Already included in `@/shared/ui`:

```typescript
import { Tooltip } from '@/shared/ui'
```

## Basic Usage

### Simple Tooltip

```tsx
<Tooltip.Root>
  <Tooltip.Trigger>
    <Button>Hover me</Button>
  </Tooltip.Trigger>
  <Tooltip.Positioner>
    <Tooltip.Content>
      Helpful tooltip text
    </Tooltip.Content>
  </Tooltip.Positioner>
</Tooltip.Root>
```

### With Arrow

```tsx
<Tooltip.Root>
  <Tooltip.Trigger>
    <Button>Hover me</Button>
  </Tooltip.Trigger>
  <Tooltip.Positioner>
    <Tooltip.Content>
      Tooltip with arrow
    </Tooltip.Content>
    <Tooltip.Arrow>
      <Tooltip.ArrowTip />
    </Tooltip.Arrow>
  </Tooltip.Positioner>
</Tooltip.Root>
```

## API Reference

### Tooltip.Root

Main container managing tooltip state and configuration.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial open state |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when state changes |
| `positioning` | `TooltipPositioning` | - | Positioning configuration |
| `openDelay` | `number` | `0` | Delay before showing (ms) |
| `closeDelay` | `number` | `0` | Delay before hiding (ms) |
| `interactive` | `boolean` | `false` | Keep open when hovering content |
| `disabled` | `boolean` | `false` | Disable tooltip entirely |
| `closeOnEsc` | `boolean` | `true` | Close on Escape key |
| `closeOnPointerDown` | `boolean` | `true` | Close on pointer down |
| `portalled` | `boolean` | `true` | Render in portal |

### Tooltip.Trigger

Element that activates the tooltip.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `true` | Render as child element (no wrapper) |
| `disabled` | `boolean` | `false` | Disable trigger |

### Tooltip.Content

The tooltip content container.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxW` | `string \| number` | `'300px'` | Maximum width |
| `p` | `string \| number` | `'3'` | Padding |
| `fontSize` | `string \| number` | `'sm'` | Font size |
| `role` | `string` | `'tooltip'` | ARIA role |
| `aria-live` | `'polite' \| 'assertive'` | `'polite'` | Screen reader announcement |

### Positioning Configuration

```typescript
interface TooltipPositioning {
  placement?: 'top' | 'bottom' | 'left' | 'right' |
              'top-start' | 'top-end' |
              'bottom-start' | 'bottom-end' |
              'left-start' | 'left-end' |
              'right-start' | 'right-end'
  offset?: { x?: number; y?: number }
  gap?: number
  strategy?: 'absolute' | 'fixed'
}
```

## Examples

### Delayed Tooltip

```tsx
<Tooltip.Root openDelay={500} closeDelay={200}>
  <Tooltip.Trigger>
    <Button>Delayed</Button>
  </Tooltip.Trigger>
  <Tooltip.Positioner>
    <Tooltip.Content>
      Shows after 500ms
    </Tooltip.Content>
  </Tooltip.Positioner>
</Tooltip.Root>
```

### Interactive Tooltip

```tsx
<Tooltip.Root interactive={true}>
  <Tooltip.Trigger>
    <Button>Interactive</Button>
  </Tooltip.Trigger>
  <Tooltip.Positioner>
    <Tooltip.Content>
      <Button onClick={() => alert('Clicked!')}>
        Click Me
      </Button>
    </Tooltip.Content>
  </Tooltip.Positioner>
</Tooltip.Root>
```

### Custom Positioning

```tsx
<Tooltip.Root
  positioning={{
    placement: 'bottom-start',
    offset: { x: 10, y: 5 }
  }}
>
  <Tooltip.Trigger>
    <Button>Custom Position</Button>
  </Tooltip.Trigger>
  <Tooltip.Positioner>
    <Tooltip.Content>
      Custom positioned tooltip
    </Tooltip.Content>
  </Tooltip.Positioner>
</Tooltip.Root>
```

### Help Icon Pattern

```tsx
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <Box
      as="button"
      display="inline-flex"
      cursor="help"
      color="fg.muted"
      _hover={{ color: 'blue.500' }}
    >
      <QuestionMarkCircleIcon className="w-5 h-5" />
    </Box>
  </Tooltip.Trigger>
  <Tooltip.Positioner>
    <Tooltip.Content>
      Helpful explanation text
    </Tooltip.Content>
    <Tooltip.Arrow>
      <Tooltip.ArrowTip />
    </Tooltip.Arrow>
  </Tooltip.Positioner>
</Tooltip.Root>
```

## Accessibility

The Tooltip component is fully accessible:

- **ARIA Compliant**: Uses proper `role="tooltip"` and `aria-describedby`
- **Keyboard Navigation**:
  - Tab to focus trigger
  - Escape to close
  - Enter/Space to show
- **Screen Reader**: Announces content with `aria-live="polite"`
- **Focus Management**: Preserves focus outline

## Best Practices

### ✅ Do

- Use for supplementary information
- Keep content concise (1-2 sentences)
- Use delays for frequently hovered elements
- Add arrows for directional clarity
- Use help icon pattern for form fields

### ❌ Don't

- Use for critical information (use Alert instead)
- Put interactive elements in non-interactive tooltips
- Use very long text (use Popover instead)
- Nest tooltips inside tooltips
- Use for touch-only interfaces (unreliable)

## Common Patterns

### Form Field Helper

```tsx
<Box display="flex" alignItems="center" gap="2">
  <Text>Field Label</Text>
  <Tooltip.Root>
    <Tooltip.Trigger asChild>
      <QuestionMarkCircleIcon className="w-4 h-4" />
    </Tooltip.Trigger>
    <Tooltip.Positioner>
      <Tooltip.Content>
        Explanation of this field
      </Tooltip.Content>
    </Tooltip.Positioner>
  </Tooltip.Root>
</Box>
```

### Status Badge with Tooltip

```tsx
<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <Badge colorPalette="green" cursor="help">
      Active
    </Badge>
  </Tooltip.Trigger>
  <Tooltip.Positioner>
    <Tooltip.Content>
      This item is currently active
    </Tooltip.Content>
  </Tooltip.Positioner>
</Tooltip.Root>
```

### Truncated Text

```tsx
<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <Text
      maxW="200px"
      overflow="hidden"
      textOverflow="ellipsis"
      cursor="help"
    >
      {longText}
    </Text>
  </Tooltip.Trigger>
  <Tooltip.Positioner>
    <Tooltip.Content>{longText}</Tooltip.Content>
  </Tooltip.Positioner>
</Tooltip.Root>
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  TooltipProps,
  TooltipRootProps,
  TooltipTriggerProps,
  TooltipContentProps,
  TooltipPlacement,
  TooltipPositioning
} from '@/shared/ui'
```

## Related Components

- **Popover** - For more complex, interactive content
- **Alert** - For important messages
- **HelpTooltip** - Pre-built help icon pattern (in recipe module)

## References

- [Chakra UI Tooltip Docs](https://chakra-ui.com/docs/components/tooltip)
- [Ark UI Tooltip Docs](https://ark-ui.com/docs/components/tooltip)
- [WAI-ARIA Tooltip Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/)
