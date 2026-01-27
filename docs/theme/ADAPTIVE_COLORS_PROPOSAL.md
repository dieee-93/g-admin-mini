# 🎯 Propuesta: Tokens de Color Adaptativos

> **Solución al problema de colores conflictivos entre temas**
> Fecha: 2025-12-13

## Problema Central

Actualmente los componentes usan colores fijos (`green.500`, `red.500`, `purple.400`) que pueden chocar con ciertos temas:

| Tema | Color Base | Conflicto |
|------|------------|-----------|
| `sunset-dark` | Tonos rojos/naranjas | `red.*` se confunde con el fondo |
| `nature-dark` | Tonos verdes | `green.*` se pierde |
| `pastel` | Tonos púrpura | `purple.*` no destaca |
| `synthwave-84` | Rosa/Cyan brillante | Los colores "sutiles" no son visibles |

## Solución Propuesta

### Nuevo Sistema de Tokens Adaptativos

Agregar una capa de tokens semánticos que se calculen dinámicamente según el tema:

```typescript
// En dynamicTheming.ts
semanticTokens: {
  colors: {
    // Tokens de STATUS que cambian según tema
    'status': {
      'success': { 
        'DEFAULT': { value: /* verde que contraste */ },
        'subtle': { value: /* verde suave */ },
        'emphasis': { value: /* verde fuerte */ }
      },
      'warning': { 
        'DEFAULT': { value: /* naranja que contraste */ },
        'subtle': { value: /* naranja suave */ },
        'emphasis': { value: /* naranja fuerte */ }
      },
      'error': { 
        'DEFAULT': { value: /* rojo que contraste */ },
        'subtle': { value: /* rojo suave */ },
        'emphasis': { value: /* rojo fuerte */ }
      },
      'info': { 
        'DEFAULT': { value: /* azul que contraste */ },
        'subtle': { value: /* azul suave */ },
        'emphasis': { value: /* azul fuerte */ }
      }
    },
    
    // Tokens de ACCENT para destacar
    'accent': {
      'DEFAULT': { value: "{colors.gray.500}" },  // Primary del tema
      'subtle': { value: "{colors.gray.400}" },
      'muted': { value: "{colors.gray.600}" },
    }
  }
}
```

### Implementación por Tema

Para cada tema, definir colores de status que contrasten:

```typescript
const getStatusColors = (themeId: string) => {
  const statusColors: Record<string, any> = {
    // Temas claros - usar colores oscuros
    'light': {
      success: { DEFAULT: '#16a34a', subtle: '#dcfce7', emphasis: '#15803d' },
      warning: { DEFAULT: '#d97706', subtle: '#fef3c7', emphasis: '#b45309' },
      error:   { DEFAULT: '#dc2626', subtle: '#fee2e2', emphasis: '#b91c1c' },
      info:    { DEFAULT: '#2563eb', subtle: '#dbeafe', emphasis: '#1d4ed8' }
    },
    
    // sunset-dark - evitar rojos, usar cyans/azules para success
    'sunset-dark': {
      success: { DEFAULT: '#22d3ee', subtle: '#164e63', emphasis: '#67e8f9' }, // Cyan
      warning: { DEFAULT: '#fbbf24', subtle: '#451a03', emphasis: '#fcd34d' }, // Amarillo
      error:   { DEFAULT: '#f472b6', subtle: '#500724', emphasis: '#f9a8d4' }, // Rosa (no rojo)
      info:    { DEFAULT: '#38bdf8', subtle: '#0c4a6e', emphasis: '#7dd3fc' }  // Azul claro
    },
    
    // nature-dark - evitar verdes, usar azules para success
    'nature-dark': {
      success: { DEFAULT: '#38bdf8', subtle: '#0c4a6e', emphasis: '#7dd3fc' }, // Azul
      warning: { DEFAULT: '#fbbf24', subtle: '#451a03', emphasis: '#fcd34d' }, // Amarillo
      error:   { DEFAULT: '#f87171', subtle: '#450a0a', emphasis: '#fca5a5' }, // Rojo
      info:    { DEFAULT: '#a78bfa', subtle: '#2e1065', emphasis: '#c4b5fd' }  // Púrpura
    },
    
    // ... más temas
  }
  
  return statusColors[themeId] || statusColors['dark']
}
```

## Uso en Componentes

### Antes (Problemático)

```tsx
// ❌ Color fijo - puede chocar con el tema
<Icon color="green.400" />
<Text color="red.500">Error</Text>
<Badge colorPalette="green">Activo</Badge>
```

### Después (Adaptativo)

```tsx
// ✅ Token semántico - siempre visible
<Icon color="status.success" />
<Text color="status.error">Error</Text>
<Badge bg="status.success.subtle" color="status.success.emphasis">Activo</Badge>
```

## Componentes a Migrar

### Alta Prioridad (usan colores de status frecuentemente)

| Componente | Archivo | Colores Usados |
|------------|---------|----------------|
| MetricCard | `shared/ui/MetricCard.tsx` | green, red para cambios |
| SalesMetrics | `pages/.../SalesMetrics.tsx` | green, blue, purple |
| StockSummaryWidget | `pages/.../StockSummaryWidget.tsx` | green, orange, red |
| SalesAlerts | `pages/.../SalesAlerts.tsx` | red, orange |
| Badge (general) | Múltiples archivos | colorPalette="green/red" |

### Media Prioridad

| Componente | Archivo | Colores Usados |
|------------|---------|----------------|
| Alert | `shared/ui/Alert.tsx` | status colors |
| Buttons de acción | Múltiples | teal, purple |

## Plan de Migración

### Fase 1: Definir Tokens (1 día)

1. Agregar función `getStatusColors()` en `dynamicTheming.ts`
2. Mapear tokens `status.*` para cada tema
3. Agregar tokens a `semanticTokens`

### Fase 2: Migrar MetricCard (Piloto)

1. Cambiar `green.500` → `status.success`
2. Cambiar `red.500` → `status.error`
3. Verificar en 3+ temas diferentes

### Fase 3: Migrar Sales Components

1. SalesMetrics
2. StockSummaryWidget
3. SalesAlerts

### Fase 4: Documentar y Estandarizar

1. Actualizar guía de convenciones
2. Crear snippets/ejemplos

## Alternativa Simplificada

Si la implementación completa es demasiado compleja, una alternativa más simple:

### Usar Opacidades en lugar de tokens nuevos

```tsx
// En lugar de tokens de status por tema,
// usar colores estándar con fondos que contrasten

<Box 
  bg="green.500/10"  // 10% opacidad - se adapta al fondo
  borderColor="green.500/30"
  color="green.500"
>
  <Icon color="green.500" />
</Box>
```

**Pro**: No requiere cambios en el sistema de theming
**Con**: Puede no tener suficiente contraste en algunos temas

## Conclusión

La solución más robusta es agregar tokens `status.*` adaptativos, pero requiere:
1. Definir colores para cada uno de los 24 temas
2. Mantener consistencia de significado (éxito siempre es positivo)
3. Asegurar contraste WCAG AA en todos los casos

Como MVP, se podría:
1. Empezar con 5 temas más usados
2. Usar fallback a colores estándar para el resto
3. Iterar según feedback
