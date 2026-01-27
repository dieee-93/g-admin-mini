# 🎨 Sistema de Theming - G-Admin Mini

> **Documentación Técnica del Sistema de Theming**
> Última actualización: 2025-12-13

## Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Archivos Clave](#archivos-clave)
3. [Temas Disponibles](#temas-disponibles)
4. [Sistema de Tokens](#sistema-de-tokens)
5. [Tokens Semánticos](#tokens-semánticos)
6. [Problemas Identificados](#problemas-identificados)
7. [Guía de Uso (Convenciones)](#guía-de-uso-convenciones)
8. [Decisiones Pendientes](#decisiones-pendientes)

---

## Arquitectura General

El sistema de theming de G-Admin Mini está construido sobre **Chakra UI v3** y usa un enfoque dinámico donde:

```
┌─────────────────────────────────────────────────────────────────┐
│                      themeStore.ts (Zustand)                    │
│           Estado global: currentTheme, colorPalette             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   dynamicTheming.ts                             │
│    createThemeSystem(themeId) → Chakra System                   │
│    • 24+ themes predefinidos                                    │
│    • Mapea gray.* con colores del tema                          │
│    • Semantic tokens (bg.*, text.*, border.*)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     provider.tsx                                │
│         ChakraProvider + getCurrentThemeSystem()                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Componentes React                            │
│       Usan tokens: bg.surface, text.primary, gray.800, etc      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `src/theme/tokens.ts` | Design tokens estáticos (spacing, colors, breakpoints) - **NO usado por el theming dinámico** |
| `src/store/themeStore.ts` | Estado global del tema (Zustand) |
| `src/lib/theming/dynamicTheming.ts` | **Core del sistema**: genera Chakra systems dinámicos |
| `src/shared/ui/provider.tsx` | ChakraProvider que consume el tema dinámico |
| `src/shared/components/ThemeToggle.tsx` | UI para cambiar temas |

---

## Temas Disponibles

### Categorías de Temas (24 total)

| Categoría | Temas |
|-----------|-------|
| **Base** | `light`, `dark`, `system` |
| **Professional Light** | `corporate`, `nature`, `sunset`, `ocean` |
| **Professional Dark** | `corporate-dark`, `nature-dark`, `sunset-dark`, `ocean-dark` |
| **VSCode Inspired** | `dracula`, `tokyo-night`, `synthwave-84`, `monokai-pro`, `atom-one-dark`, `nord`, `gruvbox` |
| **Material** | `material-oceanic`, `material-darker`, `material-palenight`, `material-deep-ocean` |
| **Futuristic** | `cyberpunk` |
| **Modern** | `pastel` |
| **Accessibility** | `high-contrast` |

### Estructura de un Tema

Cada tema define una escala de 10 colores (50-900) que se mapean a `gray.*`:

```typescript
'dracula': {
  50: { value: "#282a36" },   // Fondo principal (oscuro)
  100: { value: "#44475a" },  // Superficie
  200: { value: "#3d4a77" },  // Bordes
  300: { value: "#7d8cc4" },  // Elementos
  400: { value: "#9fb1d4" },  // Elementos activos
  500: { value: "#bd93f9" },  // Primary (púrpura Dracula)
  600: { value: "#ff79c6" },  // Acento fuerte (rosa)
  700: { value: "#50fa7b" },  // Acento verde
  800: { value: "#ffb86c" },  // Superficie destacada
  900: { value: "#f8f8f2" },  // Texto principal
}
```

> **IMPORTANTE**: La escala está invertida para temas oscuros:
> - `50` = fondo más oscuro
> - `900` = texto más claro

---

## Sistema de Tokens

### Tokens de Color (en `dynamicTheming.ts`)

El sistema reemplaza la paleta `gray.*` de Chakra con los colores del tema seleccionado. Las paletas de colores estándar (`blue`, `green`, `red`, `purple`) se mantienen fijas.

```typescript
// gray.* → Mapeado al tema actual (dinámico)
gray.50  → Fondo principal
gray.100 → Superficie
gray.200 → Bordes
gray.300 → Elementos
gray.400 → Elementos activos
gray.500 → Color primary del tema
gray.600 → Hover states
gray.700 → Divisores
gray.800 → Superficie secundaria
gray.900 → Texto principal

// Paletas fijas (no cambian con el tema)
blue.*   → Siempre azul estándar
green.*  → Siempre verde estándar
red.*    → Siempre rojo estándar
purple.* → Siempre púrpura estándar
```

### Tokens Semánticos Disponibles

```typescript
// Fondos
bg.DEFAULT    → gray.50  (fondo principal)
bg.canvas     → gray.50  (alias)
bg.surface    → gray.50  (cards, modales)
bg.panel      → gray.100 (paneles, dropdowns)
bg.subtle     → gray.200 (superficie sutil)
bg.muted      → gray.300 (superficie muted)

// Texto
text.primary   → gray.900 (texto principal)
text.secondary → gray.800 (texto secundario)
text.muted     → gray.600 (texto atenuado)

// Foreground
fg.DEFAULT → gray.900 (foreground principal)
fg.muted   → gray.600 (foreground muted)
fg.subtle  → gray.700 (foreground sutil)

// Bordes
border.subtle  → gray.200 (bordes sutiles)
border.default → gray.300 (bordes default)
```

---

## Problemas Identificados

### 🔴 Problema 1: Uso Inconsistente de Tokens

**Situación actual** en `page.tsx` (Sales):

```tsx
// ❌ Usa colores hardcodeados (gray.900, gray.800, etc)
<Box bg="gray.900" color="white">
  <Box bg="gray.850" ...>  // gray.850 ni siquiera existe en nuestra escala!
  <Box bg="gray.800" ...>
```

**Debería ser**:
```tsx
// ✅ Usar tokens semánticos
<Box bg="bg.surface" color="text.primary">
  <Box bg="bg.panel" ...>
  <Box bg="bg.subtle" ...>
```

### 🔴 Problema 2: Colores Fijos en Métricas

Los componentes de métricas usan colores fijos que chocan con ciertos temas:

```tsx
// ❌ Problemático con temas como sunset-dark (tonos rojos)
<Icon color="green.400" />
<Text color="purple.400">...</Text>
```

**Temas Afectados**:
- `sunset-dark`: El rojo del fondo choca con `red.*` en alerts
- `nature-dark`: El verde del fondo puede confundirse con `green.*` de éxitos
- `pastel`: El púrpura primario hace que `purple.*` no destaque

### 🔴 Problema 3: Ausencia de Tokens de Status Adaptativos

No existen tokens semánticos para colores de estado que se adapten al tema:

```typescript
// ❌ NO EXISTEN estos tokens:
status.success → debería ser verde que contraste con cualquier tema
status.warning → debería ser naranja/amarillo adaptativo
status.error   → debería ser rojo adaptativo
status.info    → debería ser azul adaptativo
```

### 🔴 Problema 4: Página Sales con Diseño "Own World"

La página de Sales ignora completamente el sistema de theming:

```tsx
// page.tsx línea 97-100 - FORZANDO tema oscuro
<Box
  minH="100vh"
  bg="gray.900"  // ❌ Ignora el tema seleccionado
  color="white"  // ❌ No usa text.primary
>
```

---

## Guía de Uso (Convenciones)

### ✅ Hacer (DO)

```tsx
// Usar tokens semánticos para fondos
<Box bg="bg.surface">
<Box bg="bg.panel">
<Box bg="bg.subtle">

// Usar tokens semánticos para texto
<Text color="text.primary">
<Text color="text.secondary">
<Text color="text.muted">

// Usar tokens semánticos para bordes
borderColor="border.default"
borderColor="border.subtle"

// Usar colorPalette para componentes de Chakra
<Button colorPalette="blue">
<Badge colorPalette="green">
<Alert status="success">  // Chakra maneja los colores
```

### ❌ No Hacer (DON'T)

```tsx
// Evitar colores hardcodeados
<Box bg="gray.900">           // ❌ No se adapta al tema
<Box bg="#1f2937">            // ❌ Color hex directo
<Text color="white">          // ❌ No considera temas claros

// Evitar gray.* cuando hay un token semántico
<Box bg="gray.100">           // ❌ Usar bg.panel en su lugar
<Text color="gray.600">       // ❌ Usar text.muted en su lugar
```

### ⚠️ Casos Especiales

Para métricas que necesitan colores específicos (verde=positivo, rojo=negativo):

```tsx
// Opción A: Paletas fijas (siempre visibles, puede chocar con tema)
<Text color="green.500">+15%</Text>
<Text color="red.500">-10%</Text>

// Opción B: Tokens con opacidad (recomendado)
<Box bg="green.500/20">  // Fondo con 20% opacidad
  <Icon color="green.400" />
</Box>
```

---

## Decisiones Pendientes

### 1. ¿Crear Tokens de Status Adaptativos?

**Propuesta**: Agregar tokens que cambien según el tema para asegurar contraste

```typescript
// En dynamicTheming.ts
semanticTokens: {
  colors: {
    'status': {
      'success': { value: /* calculado por tema */ },
      'warning': { value: /* calculado por tema */ },
      'error':   { value: /* calculado por tema */ },
      'info':    { value: /* calculado por tema */ },
    }
  }
}
```

**Pro**: Colores siempre legibles
**Con**: Complejidad adicional, cada tema necesita definir estos valores

### 2. ¿Refactorizar Sales Page?

La página de Sales usa un diseño completamente oscuro que ignora el tema. Opciones:

1. **Mantener como "modo kiosko"** - Diseño fijo para POS
2. **Integrar con theming** - Usar bg.surface, etc
3. **Modo híbrido** - Header respeta tema, POS siempre oscuro

### 3. ¿Agregar más Tokens Subtle/Muted?

Actualmente solo hay:
- `bg.subtle`, `bg.muted`
- `fg.subtle`, `fg.muted`

¿Necesitamos?:
- `color.accent.subtle` (para destacar sin chocar)
- `color.accent.muted`

---

## Archivos a Revisar Próximamente

1. `src/pages/admin/operations/sales/page.tsx` - Refactorizar uso de colores
2. `src/pages/admin/operations/sales/components/SalesMetrics.tsx` - Métricas con colores fijos
3. `src/shared/ui/MetricCard.tsx` - Componente compartido de métricas
4. `src/lib/theming/dynamicTheming.ts` - Agregar tokens de status

---

## Referencias

- [Chakra UI v3 - Semantic Tokens](https://www.chakra-ui.com/docs/theming/semantic-tokens)
- [Chakra UI v3 - Creating Custom Themes](https://www.chakra-ui.com/docs/theming/overview)
- Código fuente: `src/lib/theming/dynamicTheming.ts`
