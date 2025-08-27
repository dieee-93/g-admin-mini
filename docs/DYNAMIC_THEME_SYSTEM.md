# 🎨 Dynamic Theme System - Developer Guide

## Overview

El sistema de themes dinámicos de G-Admin Mini permite que **toda la aplicación** responda automáticamente a cambios de theme usando nuestro design system.

## 🚀 Quick Start

### 1. Import the Design System

```tsx
import { Button, Card, Typography, useThemeColors } from '@/shared/ui'
```

### 2. Use Theme-Aware Components

```tsx
// ✅ Button with dynamic theming
<Button  variant="solid">
  Dynamic Button
</Button>

// ✅ Card with dynamic theming  
<Card  padding="md">
  Dynamic Card Content
</Card>
```

### 3. Access Theme Colors Programmatically

```tsx
import { useThemeColors } from '@/shared/ui'

function MyComponent() {
  const { getThemeColor, palette, currentTheme } = useThemeColors()
  
  return (
    <div style={{ backgroundColor: getThemeColor('bg') }}>
      Current theme: {currentTheme?.name}
    </div>
  )
}
```

## 🎯 Available Theme Options

### For Buttons
- `` - Uses current theme colors
- `colorPalette="brand"` - Uses brand colors (default)
- `colorPalette="success"` - Success colors
- `colorPalette="warning"` - Warning colors
- `colorPalette="error"` - Error colors

### For Cards
- `` - Uses current theme surface/border colors
- `colorPalette="brand"` - Default card styling

## 🔧 Theme Colors API

### useThemeColors Hook

```tsx
const {
  // Current theme info
  currentTheme,        // Current theme object
  palette,            // Chakra palette name
  
  // Color getters
  getThemeColor,      // Function to get specific colors
  getChakraPalette,   // Get Chakra equivalent palette
  getThemeVariant,    // Get theme-appropriate variant
  
  // Quick accessors
  primary,            // Primary color
  bg,                 // Background color
  text,               // Text color
  surface,            // Surface color
  border,             // Border color
} = useThemeColors()
```

### Color Types

```tsx
getThemeColor('primary')  // Main theme color
getThemeColor('bg')       // Background color
getThemeColor('text')     // Text color
getThemeColor('surface')  // Surface/card background
getThemeColor('border')   // Border color
```

## 🌈 Available Themes ({availableThemes.length} Total)

### Base Themes
- **light** - Light mode with brand colors
- **dark** - Dark mode with brand colors
- **system** - Auto-detects system preference

### Professional Light Themes
- **corporate** - Professional blue theme
- **nature** - Green nature theme
- **sunset** - Orange sunset theme
- **ocean** - Cyan ocean theme

### Professional Dark Themes
- **corporate-dark** - Dark corporate blue theme
- **nature-dark** - Dark nature green theme
- **sunset-dark** - Dark sunset orange theme
- **ocean-dark** - Dark ocean cyan theme

### VSCode Inspired Themes
- **dracula** - Dark purple Dracula theme
- **tokyo-night** - Dark Tokyo Night theme
- **synthwave-84** - Dark pink Synthwave '84 theme
- **monokai-pro** - Dark Monokai Pro theme

### Material Theme Variations
- **material-oceanic** - Material Design oceanic theme
- **material-darker** - Material Design darker theme
- **material-palenight** - Material Design palenight theme
- **material-deep-ocean** - Material Design deep ocean theme

### Popular VSCode Themes
- **atom-one-dark** - Atom One Dark theme

### Accessibility
- **high-contrast** - High contrast theme for accessibility

## 📝 Usage Examples

### Theme-Aware Layout

```tsx
function DashboardLayout() {
  return (
    <Card  padding="lg">
      <VStack gap={4}>
        <Typography variant="heading" level={2}>
          Dashboard
        </Typography>
        
        <HStack gap={2}>
          <Button  variant="solid">
            Primary Action
          </Button>
          <Button  variant="outline">
            Secondary Action
          </Button>
        </HStack>
        
        <Card  padding="md">
          <Typography variant="body">
            Nested content that adapts to theme
          </Typography>
        </Card>
      </VStack>
    </Card>
  )
}
```

### Custom Component with Theme Colors

```tsx
import { useThemeColors } from '@/shared/ui'

function CustomWidget() {
  const { getThemeColor } = useThemeColors()
  
  return (
    <div
      style={{
        backgroundColor: getThemeColor('surface'),
        borderColor: getThemeColor('border'),
        color: getThemeColor('text'),
        border: '1px solid',
        borderRadius: '8px',
        padding: '16px'
      }}
    >
      Custom themed widget
    </div>
  )
}
```

## 🔄 Theme Switching

```tsx
import { useThemeStore } from '@/store/themeStore'

function ThemeSwitcher() {
  const { applyTheme, currentTheme } = useThemeStore()
  
  return (
    <Button
      
      onClick={() => applyTheme('dracula')}
    >
      Switch to Dracula
    </Button>
  )
}
```

## ⚡ Performance Notes

- ✅ **Zero re-renders**: Theme changes update CSS custom properties
- ✅ **Automatic**: Components respond instantly to theme changes
- ✅ **Type-safe**: Full TypeScript support for all theme options
- ✅ **SSR-ready**: Works with server-side rendering

## 🚨 Best Practices

1. **Always use ``** for primary components
2. **Fallback to semantic colors** for system components (success, warning, error)
3. **Test all themes** during development
4. **Use design system components** instead of direct Chakra UI imports

---

**Demo Location**: Admin → Settings → Dynamic Design System Demo
