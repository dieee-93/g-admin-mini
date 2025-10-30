# Module Registry Integration - Scheduling Module

**Version:** 2.1.0
**Last Updated:** 2025-10-11
**Status:** ✅ Implemented

---

## 📋 Overview

Este documento describe cómo el módulo **Scheduling** utiliza el **Module Registry System** para:
- Exponer HookPoints para extensibilidad cross-module
- Recibir acciones/widgets desde otros módulos (Sales, Materials, Kitchen)
- Permitir composición dinámica de UI sin tight coupling

---

## 🎯 HookPoints Implementados

### 1. `calendar.events` - Eventos de Calendario

**Ubicación:** `page.tsx:478-490`
**Propósito:** Otros módulos pueden agregar eventos adicionales al calendario
**Contexto de datos:**
```typescript
{
  referenceDate: Date,
  calendarView: 'month' | 'week' | 'day',
  filteredEvents: UnifiedScheduleEvent[],
  onEventClick: (event) => void
}
```

**Módulos registrados:**
- **Scheduling** (priority 80): Time-off requests overlay
- **Kitchen** (priority 75): Bloques de producción programada

**Ejemplo de uso:**
```tsx
<HookPoint
  name="calendar.events"
  data={{
    referenceDate,
    calendarView,
    filteredEvents,
    onEventClick: handleEventClick
  }}
  fallback={null}
  direction="column"
  gap={3}
/>
```

---

### 2. `scheduling.toolbar.actions` - Acciones de Toolbar

**Ubicación:** `page.tsx:446-458`
**Propósito:** Botones de acción contextuales en la toolbar del calendario
**Contexto de datos:**
```typescript
{
  referenceDate: Date,
  calendarView: 'month' | 'week' | 'day',
  filters: CalendarFilters,
  selectedEvents: UnifiedScheduleEvent[]
}
```

**Módulos registrados:**
- **Sales** (priority 85): Botón "Forecast" - Ver forecast de ventas
- **Materials** (priority 80): Botón "Stock" - Verificar inventario
- **Kitchen** (priority 75): Botón "Kitchen" - Ver capacidad de cocina

**Ejemplo de render:**
```
[ Filtros ] [ Nuevo Turno ] [ Auto-Schedule ] [ Forecast ] [ Stock ] [ Kitchen ]
```

---

### 3. `scheduling.top_metrics` - Métricas Adicionales

**Ubicación:** `page.tsx:405-415`
**Propósito:** Widgets de métricas desde otros módulos que complementan SchedulingTopBar
**Contexto de datos:**
```typescript
{
  stats: SchedulingStats,
  referenceDate: Date,
  filteredEvents: UnifiedScheduleEvent[]
}
```

**Módulos registrados:**
- **Sales** (priority 90): Forecast de ventas proyectadas ($12,450 / 145 órdenes)
- **Materials** (priority 85): Alertas de stock bajo (3 items críticos)

**Ejemplo visual:**
```
┌─────────────────┬─────────────────┬─────────────────┐
│ Total Shifts    │ Sales Forecast  │ Stock Alert     │
│ 45 shifts       │ $12,450         │ Low Stock       │
│ Coverage: 92%   │ 145 orders      │ Harina, Azúcar  │
└─────────────────┴─────────────────┴─────────────────┘
```

---

## 🔌 Manifest Configuration

### Scheduling Manifest (`src/modules/scheduling/manifest.tsx`)

```typescript
hooks: {
  provide: [
    'calendar.events',              // ✅ Render time-off requests overlay
    'scheduling.toolbar.actions',   // ✅ Custom toolbar buttons
    'scheduling.top_metrics',       // ✅ Additional metric widgets
    'scheduling.event.actions',     // 📋 Context actions for events (future)
    'dashboard.widgets',            // ✅ Scheduling stats widget
    'scheduling.filters.custom'     // 📋 Custom filter options (future)
  ],
  consume: [
    'staff.availability.updated',   // React to staff availability changes
    'sales.volume_forecast',        // Adjust staffing based on forecasts
    'production.schedule.updated',  // React to production schedule changes
    'materials.stock_alert'         // Alert if low stock affects production
  ]
}
```

---

## 📚 Cross-Module Actions Reference

### Sales → Scheduling

**Archivo:** `src/modules/sales/manifest.ts:187-267`

#### Toolbar Action: "Forecast" Button
- **Priority:** 85
- **Acción:** Abre vista de forecast de ventas
- **Trigger:** Click en "Forecast"
- **Icono:** ChartBarIcon (verde)

#### Top Metric: Sales Forecast Widget
- **Priority:** 90
- **Datos:** `$12,450` revenue, `145` órdenes proyectadas
- **Color:** Verde (`green.50`)
- **Tamaño:** Compacto (fits en 1 col)

---

### Materials → Scheduling

**Archivo:** `src/modules/materials/manifest.ts:216-295`

#### Toolbar Action: "Stock" Button
- **Priority:** 80
- **Acción:** Navega a /admin/materials con filtro de low stock
- **Trigger:** Click en "Stock"
- **Icono:** CubeIcon (purple)

#### Top Metric: Stock Alert Widget
- **Priority:** 85
- **Datos:** `3` items críticos (Harina, Azúcar, Manteca)
- **Color:** Naranja (`orange.50`)
- **Urgencia:** Critical alert

---

### Kitchen → Scheduling

**Archivo:** `src/modules/kitchen/manifest.ts:256-340`

#### Calendar Events: Production Blocks
- **Priority:** 75
- **Datos:** Bloques de producción programada (08:00-10:00 Pan dulce ×50)
- **Color:** Púrpura (`purple.50`)
- **Layout:** Columna con badges de tiempo

#### Toolbar Action: "Kitchen" Button
- **Priority:** 75
- **Acción:** Navega a capacidad de cocina
- **Trigger:** Click en "Kitchen"
- **Icono:** BeakerIcon (purple)

---

## 🏗️ Pattern de Extensión

### Para agregar un NUEVO módulo que extienda Scheduling:

#### 1️⃣ Actualizar manifest del nuevo módulo

```typescript
// src/modules/newmodule/manifest.ts

export const newModuleManifest: ModuleManifest = {
  id: 'newmodule',
  name: 'New Module',
  version: '1.0.0',

  hooks: {
    consume: [
      'calendar.events',              // Agregar eventos al calendario
      'scheduling.toolbar.actions',   // Agregar botón a toolbar
      'scheduling.top_metrics',       // Agregar métrica
    ]
  },

  setup: (registry) => {
    // Registrar hook para toolbar
    registry.addAction(
      'scheduling.toolbar.actions',
      (data) => {
        const { Button, Icon } = require('@/shared/ui');
        const { MyIcon } = require('@heroicons/react/24/outline');

        return (
          <Button
            key="newmodule-action-btn"
            size="sm"
            variant="outline"
            colorPalette="blue"
            onClick={() => {
              // Tu acción aquí
            }}
          >
            <Icon icon={MyIcon} size="xs" />
            My Action
          </Button>
        );
      },
      'newmodule',
      70 // Priority (70-90 rango común)
    );
  }
};
```

#### 2️⃣ Agregar manifest a ALL_MODULE_MANIFESTS

```typescript
// src/modules/index.ts
import { newModuleManifest } from './newmodule/manifest';

export const ALL_MODULE_MANIFESTS = [
  staffManifest,
  schedulingManifest,
  productionManifest,
  salesManifest,
  materialsManifest,
  kitchenManifest,
  newModuleManifest  // ✅ Agregar aquí
];
```

#### 3️⃣ Bootstrap automático

No se requiere código adicional. El sistema de bootstrap en `App.tsx` automáticamente:
1. Lee activeFeatures del CapabilityStore
2. Filtra módulos con requiredFeatures activos
3. Inicializa en orden topológico (respetando depends)
4. Registra hooks en ModuleRegistry

---

## 🎨 Styling Guidelines

### Colors por tipo de módulo

| Módulo     | Color Base | Uso                        |
|------------|-----------|----------------------------|
| Sales      | `green`   | Revenue, forecast, órdenes |
| Materials  | `orange`  | Alertas de stock           |
| Kitchen    | `purple`  | Producción, recetas        |
| Scheduling | `blue`    | Staff, turnos              |
| Staff      | `blue`    | Empleados, asistencia      |

### Priorities recomendadas

| Rango   | Uso                                  |
|---------|--------------------------------------|
| 90-100  | Acciones críticas / prioritarias     |
| 80-89   | Acciones importantes / frecuentes    |
| 70-79   | Acciones estándar / moderadas        |
| 60-69   | Acciones secundarias / opcionales    |
| 50-59   | Acciones avanzadas / debug           |

---

## 🔍 Debugging

### Ver módulos registrados

```typescript
import { getModuleRegistry } from '@/lib/modules';

const registry = getModuleRegistry();
const stats = registry.getStats();

console.log('Registered modules:', stats.modules);
console.log('Total hooks:', stats.totalHooks);
console.log('Hook details:', stats.hooks);
```

### Ver hooks ejecutados en scheduling

Activa debug mode en HookPoint:

```tsx
<HookPoint
  name="scheduling.toolbar.actions"
  data={...}
  debug={true} // ✅ Logs execution time, results count
/>
```

Output:
```
[HookPoint] Executed hook: scheduling.toolbar.actions
  resultsCount: 3
  duration: 1.23ms
  data: { referenceDate: ..., calendarView: ... }
```

---

## 🚀 Roadmap

### Phase 4: Event Actions (Pending)

**HookPoint:** `scheduling.event.actions`
**Ubicación:** Event click handlers
**Propósito:** Acciones contextuales al hacer click en eventos específicos

**Ejemplo:**
```typescript
registry.addAction(
  'scheduling.event.actions',
  (event: UnifiedScheduleEvent) => {
    if (event.type === 'staff_shift') {
      return [
        { label: 'Request Coverage', onClick: () => {...} },
        { label: 'Swap Shift', onClick: () => {...} }
      ];
    }
  }
);
```

### Phase 5: Custom Filters (Pending)

**HookPoint:** `scheduling.filters.custom`
**Ubicación:** Inside CalendarFiltersPanel
**Propósito:** Filtros específicos de módulos

**Ejemplo desde Production:**
```typescript
registry.addAction(
  'scheduling.filters.custom',
  () => {
    return (
      <FilterGroup title="Production">
        <RecipeFilter />
        <BatchSizeFilter />
      </FilterGroup>
    );
  }
);
```

---

## 📖 References

- **Module Registry System:** `src/lib/modules/`
- **Bootstrap Integration:** `src/lib/modules/integration.ts`
- **HookPoint Component:** `src/lib/modules/HookPoint.tsx`
- **All Manifests:** `src/modules/index.ts`
- **App Bootstrap:** `src/App.tsx:159-174`

---

## ✅ Quick Checklist: Adding Cross-Module Integration

Para agregar una nueva integración a scheduling:

- [ ] Crear manifest del módulo en `src/modules/mymodule/manifest.ts`
- [ ] Declarar `consume` hooks (calendar.events, scheduling.toolbar.actions, etc.)
- [ ] Implementar `setup()` con `registry.addAction()` para cada hook
- [ ] Agregar manifest a `ALL_MODULE_MANIFESTS` en `src/modules/index.ts`
- [ ] Verificar que `requiredFeatures` están activos en CapabilityStore
- [ ] Probar en dev: `pnpm dev` → navegar a `/admin/scheduling`
- [ ] Ver logs de bootstrap en consola (App.tsx logs)
- [ ] Activar `debug={true}` en HookPoint para troubleshooting

---

**Maintainer:** G-Admin Team
**Status:** ✅ Production Ready
**Last Tested:** 2025-10-11
