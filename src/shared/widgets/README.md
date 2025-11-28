# Shared Widgets

Widgets reutilizables para dashboards y vistas analíticas.

**Fuente**: `newdashboard/src/components/widgets/`
**Adaptado**: Design system G-Admin Mini

---

## 📦 Widgets Disponibles

### 1. **StatCard** - Tarjeta de estadísticas

Muestra métricas con valor principal, tendencia y footer.

```tsx
import { StatCard } from '@/shared/widgets';
import { Icon } from '@/shared/ui';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

<StatCard
  title="Revenue Hoy"
  value="$12,450"
  icon={<Icon as={CurrencyDollarIcon} boxSize={5} />}
  accentColor="green.500"
  trend={{ value: '+12.5%', isPositive: true }}
  footer="vs ayer"
/>
```

**Props**:
- `title` - Título del stat
- `value` - Valor principal (string | number)
- `icon?` - Icono decorativo
- `accentColor?` - Color del borde izquierdo
- `trend?` - `{ value: string, isPositive: boolean }`
- `footer?` - Texto del footer
- `onClick?` - Handler de click

---

### 2. **InsightCard** - Tarjeta de insights

Muestra recomendaciones con métrica, tags y acción.

```tsx
import { InsightCard } from '@/shared/widgets';

<InsightCard
  title="Producto más vendido"
  description="Pizza Margarita representa el 23% de tus ventas"
  metric="$4,230"
  metricLabel="este mes"
  tags={["Tendencia", "Alto rendimiento"]}
  actionLabel="Ver detalles"
  onAction={() => navigate('products')}
  positive={true}
/>
```

**Props**:
- `title` - Título del insight
- `description` - Descripción detallada
- `metric?` - Métrica destacada
- `metricLabel?` - Label de la métrica
- `tags?` - Array de tags
- `actionLabel?` - Texto del botón
- `onAction?` - Handler del botón
- `positive?` - true=verde, false=naranja

---

### 3. **AlertCard** - Tarjeta de alerta simple

Alerta compacta con status y colores.

```tsx
import { AlertCard } from '@/shared/widgets';

<AlertCard
  title="Stock crítico"
  description="Material XYZ tiene solo 5 unidades"
  status="warning"
/>
```

**Props**:
- `title` - Título de la alerta
- `description` - Descripción
- `status?` - `'success' | 'warning' | 'error' | 'info'`
- `icon?` - Icono custom (usa default si no se provee)

---

## 🔌 Inyección vía Hook Registry

Para widgets dinámicos que deben aparecer en el dashboard, usa el hook `dashboard.widgets` en el manifest de tu módulo:

### Ejemplo: Materials Module

```tsx
// src/modules/materials/manifest.tsx

import { StatCard } from '@/shared/widgets';
import { Icon } from '@/shared/ui';
import { CubeIcon } from '@heroicons/react/24/outline';

export const materialsManifest: ModuleManifest = {
  id: 'materials',

  hooks: {
    'dashboard.widgets': () => [
      {
        id: 'inventory-stat',
        component: () => {
          const { items } = useMaterialsData();
          const totalValue = items.reduce((acc, item) =>
            acc + (item.stock * item.unit_cost), 0
          );

          return (
            <StatCard
              title="Valor de Inventario"
              value={`$${totalValue.toLocaleString()}`}
              icon={<Icon as={CubeIcon} boxSize={5} />}
              accentColor="blue.500"
              trend={{ value: '+8.2%', isPositive: true }}
              footer="vs mes anterior"
            />
          );
        },
        priority: 10
      }
    ]
  }
};
```

### Hook Registry API

```tsx
type DashboardWidget = {
  id: string;              // ID único del widget
  component: () => JSX.Element;  // Función que retorna JSX
  priority?: number;       // Orden de aparición (mayor = primero)
}

hooks: {
  'dashboard.widgets': () => DashboardWidget[]
}
```

---

## 🎨 Design System

Los widgets usan **design tokens** automáticamente:

### Colores adaptados:
- ❌ `#152a47` (hardcoded)
- ✅ `bg.muted` (design token)

### Componentes usados:
- `Box`, `Stack`, `Typography` de `@/shared/ui`
- `Icon` wrapper con heroicons
- `Badge`, `Button` de Chakra v3

### Paleta de acentos:
- `blue.500` - Azul (default)
- `green.500` - Verde (positivo)
- `orange.500` - Naranja (advertencia)
- `red.500` - Rojo (error)
- `purple.500` - Morado

---

## 📐 Diseño Original Preservado

✅ **Animaciones**: `hover` con `translateY(-4px)` y `boxShadow`
✅ **Transiciones**: `cubic-bezier(0.34, 1.56, 0.64, 1)`
✅ **Bordes**: `borderLeft: 4px solid` con color de acento
✅ **Espaciado**: `p={6}`, `borderRadius="2xl"`

**Cambios ÚNICAMENTE en**:
- Colores (design tokens)
- Iconos (heroicons)
- Imports (wrappers G-Admin)

---

## 🔗 Paths

```tsx
import { StatCard, InsightCard, AlertCard } from '@/shared/widgets';
```

Alias configurado en `tsconfig.json`:
```json
{
  "paths": {
    "@/shared/*": ["src/shared/*"]
  }
}
```
