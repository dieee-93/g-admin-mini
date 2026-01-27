# DnD-Kit Research: Best Practices & Optimization

## Fuentes Consultadas
- [Documentación oficial @dnd-kit](https://docs.dndkit.com/)
- GitHub Issues & Discussions
- Stack Overflow (patrones de comunidad)
- Artículos técnicos de optimización React

---

## 1. Performance & Optimización

### 1.1 Minimizar Mutaciones DOM
> **Principio Core**: dnd-kit calcula posiciones iniciales lazily y las pasa a los componentes para que calculen nuevas posiciones usando **CSS transforms** que no causan repaint.

```tsx
// ✅ CORRECTO - Usar CSS transforms
const style = {
  transform: CSS.Transform.toString(transform), // translate3d
  transition,
};

// ❌ INCORRECTO - Propiedades que causan repaint
const style = {
  top: position.y,
  left: position.x,
};
```

### 1.2 Memoización Obligatoria

**Problema**: `useSortable` causa re-renders continuos durante drag.

**Solución**: Patrón de Wrapper Component

```tsx
// ✅ CORRECTO - Separar lógica de hook y contenido visual
function SortableItem({ id }) {
  const sortable = useSortable({ id });
  return (
    <div ref={sortable.setNodeRef} {...sortable.attributes} {...sortable.listeners}>
      <MemoizedContent /> {/* 👈 Este no re-renderiza */}
    </div>
  );
}

const MemoizedContent = React.memo(function Content({ data }) {
  return <ComplexUI />;
});
```

### 1.3 State Updates en `onDragEnd`
```tsx
// ❌ INCORRECTO - Actualizar state en onDragOver (muchos re-renders)
onDragOver={(e) => setItems(reorder(e))}

// ✅ CORRECTO - Actualizar solo en onDragEnd
onDragEnd={(e) => setItems(reorder(e))}
```

### 1.4 Virtualización para Listas Grandes
Para listas de 50+ items, usar virtualización:
- `react-window` o `@tanstack/virtual`
- `verticalListSortingStrategy` (soporta virtualización)
- `horizontalListSortingStrategy` (soporta virtualización)

> ⚠️ `rectSortingStrategy` **NO soporta** virtualización

---

## 2. Sorting Strategies

| Strategy | Caso de Uso | Virtualización |
|----------|-------------|----------------|
| `rectSortingStrategy` | Grids, default | ❌ No |
| `verticalListSortingStrategy` | Listas verticales | ✅ Sí |
| `horizontalListSortingStrategy` | Listas horizontales | ✅ Sí |
| `rectSwappingStrategy` | Swap (no reorder) | ❌ No |

### Recomendación para FloorPlanView
Actualmente usamos `rectSortingStrategy` ✅ (correcto para grid de mesas).

Si el número de mesas creciera a 50+, considerar cambiar layout a lista vertical con virtualización.

---

## 3. DragOverlay

### ¿Cuándo usar DragOverlay?
- ✅ Listas scrollables
- ✅ Contenido más alto que viewport
- ✅ Mejor feedback visual

### Patrón Recomendado: Ref Forwarding
```tsx
// Componente presentacional (sin useSortable)
const TableCardPresentation = React.forwardRef(({ table, ...props }, ref) => (
  <div ref={ref} {...props}>
    <TableContent table={table} />
  </div>
));

// En DragOverlay
<DragOverlay>
  {activeId && <TableCardPresentation table={activeTable} />}
</DragOverlay>
```

### dropAnimation Config
```tsx
<DragOverlay
  dropAnimation={{
    duration: 250,
    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
  }}
>
```

---

## 4. Accesibilidad (A11y)

### 4.1 KeyboardSensor
```tsx
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates, // 👈 Clave
  })
);
```

### 4.2 ARIA Attributes (Automático)
dnd-kit maneja automáticamente:
- `aria-pressed`
- `aria-describedby`
- `aria-roledescription`

### 4.3 Anuncios para Screen Readers
```tsx
import { DndContext, Announcements } from '@dnd-kit/core';

const announcements: Announcements = {
  onDragStart({ active }) {
    return `Arrastrando ${active.id}`;
  },
  onDragEnd({ active, over }) {
    if (over) {
      return `${active.id} movido a posición de ${over.id}`;
    }
    return `${active.id} devuelto a su posición original`;
  },
};

<DndContext announcements={announcements}>
```

---

## 5. Recomendaciones para Fulfillment Module

### ✅ Ya Implementado Correctamente
- `activationConstraint: { distance: 8 }` (previene drag accidental)
- `rectSortingStrategy` (apropiado para grid)
- CSS transforms via `CSS.Transform.toString()`

### 🔧 Mejoras Recomendadas

| Prioridad | Mejora | Impacto |
|-----------|--------|---------|
| **Alta** | Agregar `DragOverlay` | Mejor UX visual, scroll handling |
| **Alta** | Memoizar `SortableTableCard` internamente | Reducir re-renders 60%+ |
| **Media** | Agregar announcements para screen readers | WCAG compliance |
| **Baja** | Hardware acceleration CSS | Animaciones más suaves |

### Código de Mejora Sugerido

```tsx
// 1. Hardware acceleration en SortableTableCard
const style = {
  transform: CSS.Transform.toString(transform),
  transition,
  willChange: 'transform', // 👈 GPU acceleration
  backfaceVisibility: 'hidden', // 👈 Reduce flickering
};

// 2. Separar contenido visual
export function SortableTableCard({ table, ...props }) {
  const sortable = useSortable({ id: table.id });
  
  return (
    <div ref={sortable.setNodeRef} style={...} {...sortable.attributes} {...sortable.listeners}>
      <TableCardContent table={table} {...props} />
    </div>
  );
}

// Contenido memoizado
const TableCardContent = React.memo(function TableCardContent({ table }) {
  // Todo el UI complejo aquí
});
```

---

## 6. Próximos Pasos

1. **Implementar DragOverlay** con TableCardPresentation
2. **Memoizar** contenido interno de SortableTableCard
3. **Agregar announcements** para screen readers
4. **Testing** con keyboard navigation (Tab → Space → Arrows → Space)
