# PROMPT: REFACTOR COMPLETO - MÓDULO ONSITE (Fulfillment - Table Management)

**Prioridad**: ALTA
**Tipo**: Refactor completo (estética + funcionalidad)
**Tiempo estimado**: 1-2 horas

---

## 🎯 OBJETIVO

Refactorizar completamente el módulo de gestión de mesas (`/admin/operations/fulfillment/onsite`) para que tenga:
1. **Estética profesional** - cards visualmente atractivos, colores distintivos, shadows, hover effects
2. **Funcionalidad real** - botones funcionales con modales, acciones CRUD sobre mesas
3. **Drag & Drop** - arrastrar mesas para cambiar su ubicación/orden
4. **Real-time updates** - subscripciones de Supabase para actualizar en tiempo real
5. **Animaciones suaves** - transiciones profesionales

---

## 📊 CONTEXTO ACTUAL

### Estado del Módulo

**Ubicación**: `src/pages/admin/operations/fulfillment/onsite/`

**Página principal**: `page.tsx`
**Componente de mesas**: `components/FloorPlanView.tsx`

**Base de datos**:
- Tabla: `tables`
- 5 mesas de ejemplo:
  - Mesa 1: status='occupied', capacity=4, Party of 4, Juan Pérez, $180.50
  - Mesa 2: status='occupied', capacity=6, Party of 2, María García, $95.25
  - Mesa 3: status='available', capacity=2
  - Mesa 4: status='reserved', capacity=4
  - Mesa 5: status='available', capacity=8

**Capabilities activas**: `onsite_service` ✅ (activo)

### Problemas Actuales

#### 1. **Estética Pobre** ❌
- Cards muy simples/planos sin personalidad
- Colores sutiles (badges apenas visibles)
- Sin borders/shadows prominentes
- Falta jerarquía visual
- Espaciado inconsistente

#### 2. **Botones Sin Funcionalidad** ❌
```typescript
// Línea 229-232 FloorPlanView.tsx
<Button size="sm" variant="ghost">
  <Icon icon={EyeIcon} size="sm" />
  View
</Button>
// ❌ NO TIENE onClick - es un botón dummy

// Línea 234-236
<Button size="sm" colorPalette="blue">
  Seat Party
</Button>
// ❌ NO TIENE onClick - es un botón dummy
```

#### 3. **No hay modales** ❌
- No existe componente modal para ver detalles
- No existe form para sentar party
- No existe UI para cambiar status

#### 4. **No hay drag & drop** ❌
- Las mesas no se pueden arrastrar
- No se puede reordenar

---

## 🛠️ HERRAMIENTAS DISPONIBLES

### Drag & Drop Library
**Ya instalada en el proyecto**: Busca en `package.json` la librería de drag & drop instalada (probablemente `@dnd-kit` o `react-beautiful-dnd`).

### ChakraUI v3.23.0
- Componentes UI ya disponibles: `Dialog`, `Modal`, `Drawer`, `Button`, `Card`, etc.
- Sistema de colores: `colorPalette` prop

### Supabase Real-time
- Ya configurado: `supabase.channel().on('postgres_changes', ...)`
- Ver línea 42-47 de FloorPlanView.tsx

---

## 📋 TAREAS A IMPLEMENTAR

### 🎨 FASE 1: MEJORAS ESTÉTICAS (30 min)

#### 1.1 Mejorar Cards de Mesas
**Archivo**: `src/pages/admin/operations/fulfillment/onsite/components/FloorPlanView.tsx`

**Cambios requeridos**:
```typescript
// Línea 151: CardWrapper actual es muy simple
<CardWrapper key={table.id}>

// ✅ CAMBIAR A:
<CardWrapper
  key={table.id}
  borderWidth="2px"
  borderColor={getStatusBorderColor(table.status)}
  boxShadow={table.status === 'occupied' ? 'lg' : 'md'}
  transition="all 0.2s"
  _hover={{
    transform: 'translateY(-2px)',
    boxShadow: 'xl',
    cursor: 'pointer'
  }}
  bg={getStatusBgColor(table.status)}
>
```

**Agregar funciones de color**:
```typescript
const getStatusBorderColor = (status: string) => {
  switch (status) {
    case 'available': return 'green.400';
    case 'occupied': return 'orange.400';
    case 'reserved': return 'blue.400';
    case 'cleaning': return 'gray.400';
    case 'ready_for_bill': return 'purple.400';
    default: return 'gray.300';
  }
};

const getStatusBgColor = (status: string) => {
  switch (status) {
    case 'available': return 'green.50';
    case 'occupied': return 'orange.50';
    case 'reserved': return 'blue.50';
    case 'cleaning': return 'gray.50';
    case 'ready_for_bill': return 'purple.50';
    default: return 'white';
  }
};
```

#### 1.2 Mejorar Badges
**Línea 163-165**: Hacer badges más grandes y coloridos
```typescript
<Badge
  size="lg"
  colorPalette={getStatusColor(table.status)}
  fontWeight="bold"
  px="3"
  py="1"
>
  {table.status.replace('_', ' ').toUpperCase()}
</Badge>
```

#### 1.3 Mejorar Tipografía
- Table number: `fontSize="2xl"`, `fontWeight="extrabold"`
- Revenue/stats: `fontSize="lg"`, `color="text.emphasized"`

---

### ⚙️ FASE 2: FUNCIONALIDAD - MODALES (45 min)

#### 2.1 Crear Modal "View Table Details"
**Nuevo archivo**: `src/pages/admin/operations/fulfillment/onsite/components/TableDetailsModal.tsx`

```typescript
import { Dialog } from '@chakra-ui/react';

interface TableDetailsModalProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (tableId: string, newStatus: string) => Promise<void>;
}

export function TableDetailsModal({ table, isOpen, onClose, onStatusChange }: TableDetailsModalProps) {
  if (!table) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Table {table.number} Details</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          {/* Mostrar todos los detalles de la mesa */}
          {/* Información del party actual */}
          {/* Historial de turns */}
          {/* Botones de acción: Change Status, Close Bill, etc. */}
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={onClose}>Close</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
```

**Implementación completa requerida**:
- Mostrar capacity, location, status
- Mostrar current party (si existe): size, customer name, seated time, estimated duration, total spent
- Mostrar revenue del día, turn count
- **Acciones**:
  - Cambiar status (dropdown con opciones: available, occupied, reserved, cleaning, maintenance)
  - Cerrar cuenta (si occupied)
  - Editar información

#### 2.2 Crear Modal "Seat Party"
**Nuevo archivo**: `src/pages/admin/operations/fulfillment/onsite/components/SeatPartyModal.tsx`

```typescript
interface SeatPartyModalProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
  onSeatParty: (tableId: string, partyData: PartyData) => Promise<void>;
}

export function SeatPartyModal({ table, isOpen, onClose, onSeatParty }: SeatPartyModalProps) {
  // Form con validación
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Seat Party at Table {table?.number}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <Stack gap="4">
            <FormControl>
              <FormLabel>Party Size</FormLabel>
              <Input type="number" min={1} max={table?.capacity} />
            </FormControl>
            <FormControl>
              <FormLabel>Customer Name (optional)</FormLabel>
              <Input placeholder="John Doe" />
            </FormControl>
            <FormControl>
              <FormLabel>Estimated Duration (minutes)</FormLabel>
              <Input type="number" defaultValue={90} />
            </FormControl>
          </Stack>
        </Dialog.Body>
        <Dialog.Footer>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button colorPalette="blue" onClick={handleSubmit}>Seat Party</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
```

**Lógica requerida**:
- Validar que party size <= capacity
- Crear entrada en tabla `parties`
- Actualizar `table.status = 'occupied'`
- Mostrar toast de éxito

#### 2.3 Agregar Handlers en FloorPlanView

**Línea 229-243**: Reemplazar botones dummy con botones funcionales

```typescript
// State para modales
const [selectedTable, setSelectedTable] = React.useState<Table | null>(null);
const [viewModalOpen, setViewModalOpen] = React.useState(false);
const [seatModalOpen, setSeatModalOpen] = React.useState(false);

// Handlers
const handleViewTable = (table: Table) => {
  setSelectedTable(table);
  setViewModalOpen(true);
};

const handleSeatParty = (table: Table) => {
  setSelectedTable(table);
  setSeatModalOpen(true);
};

const handleStatusChange = async (tableId: string, newStatus: string) => {
  const { error } = await supabase
    .from('tables')
    .update({ status: newStatus })
    .eq('id', tableId);

  if (error) {
    notify.error({ title: 'Error updating table status' });
  } else {
    notify.success({ title: 'Table status updated' });
    loadTableData(); // Recargar datos
  }
};

// Botones actualizados
<Button
  size="sm"
  variant="ghost"
  onClick={() => handleViewTable(table)}
>
  <Icon icon={EyeIcon} size="sm" />
  View
</Button>

{table.status === 'available' && (
  <Button
    size="sm"
    colorPalette="blue"
    onClick={() => handleSeatParty(table)}
  >
    Seat Party
  </Button>
)}
```

---

### 🎭 FASE 3: DRAG & DROP (30 min)

#### 3.1 Identificar librería instalada
```bash
# Buscar en package.json
grep -E "dnd|drag|drop" package.json
```

#### 3.2 Implementar Drag & Drop
**Si es @dnd-kit**:

```typescript
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';

// Wrapper para cada card
function SortableTableCard({ table }: { table: Table }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: table.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CardWrapper>
        {/* Card content */}
      </CardWrapper>
    </div>
  );
}

// En FloorPlanView
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  })
);

const handleDragEnd = async (event) => {
  const { active, over } = event;

  if (active.id !== over.id) {
    setTables((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });

    // Guardar nuevo orden en DB
    // ... implementar lógica de persistencia
  }
};

return (
  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
    <SortableContext items={tables.map(t => t.id)} strategy={rectSortingStrategy}>
      <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap="md">
        {tables.map((table) => (
          <SortableTableCard key={table.id} table={table} />
        ))}
      </Grid>
    </SortableContext>
  </DndContext>
);
```

---

### 📡 FASE 4: REAL-TIME UPDATES (15 min)

**Ya existe subscripción** (línea 42-47) pero mejorarla:

```typescript
// Línea 38-52: Mejorar subscription
React.useEffect(() => {
  loadTableData();

  // Real-time subscription con filtros
  const subscription = supabase
    .channel('tables-changes-enhanced')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tables',
        filter: 'is_active=eq.true'
      },
      (payload) => {
        logger.debug('FloorPlanView', 'Real-time update received', payload);

        // Actualizar optimistamente sin recargar todo
        if (payload.eventType === 'UPDATE') {
          setTables(prev =>
            prev.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t)
          );
        } else if (payload.eventType === 'INSERT') {
          loadTableData(); // Recargar si se agregó mesa nueva
        }

        // Toast de notificación
        if (payload.eventType === 'UPDATE' && payload.new.status !== payload.old?.status) {
          notify.info({
            title: `Table ${payload.new.number} status changed`,
            description: `${payload.old.status} → ${payload.new.status}`
          });
        }
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [refreshTrigger]);
```

---

### 🎬 FASE 5: ANIMACIONES (15 min)

#### 5.1 Agregar Framer Motion
```typescript
import { motion } from 'framer-motion';

// Wrapper animado para cards
const MotionCard = motion(CardWrapper);

<MotionCard
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2 }}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  {/* Card content */}
</MotionCard>
```

#### 5.2 Stagger Children Animation
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={containerVariants} initial="hidden" animate="show">
  {tables.map((table) => (
    <motion.div key={table.id} variants={itemVariants}>
      <TableCard />
    </motion.div>
  ))}
</motion.div>
```

---

## 🎯 CRITERIOS DE ÉXITO

Al finalizar el refactor, el módulo debe:

1. ✅ **Verse profesional**: Cards atractivos, colores distintivos, shadows, hover effects
2. ✅ **Botones funcionales**: View, Seat Party, Check Status todos funcionan
3. ✅ **Modales completos**: TableDetailsModal y SeatPartyModal implementados y funcionales
4. ✅ **Drag & Drop**: Mesas se pueden arrastrar y reordenar
5. ✅ **Real-time**: Cambios en DB se reflejan automáticamente en la UI
6. ✅ **Animaciones**: Transiciones suaves y profesionales
7. ✅ **CRUD completo**: Cambiar status, sentar party, cerrar mesa, todo funciona
8. ✅ **UX excelente**: Feedback visual claro (toasts, loading states, error handling)

---

## 📝 ORDEN DE IMPLEMENTACIÓN SUGERIDO

1. **Primero**: Fase 1 (Estética) - Ver cambios visuales inmediatos
2. **Segundo**: Fase 2 (Modales) - Agregar funcionalidad básica
3. **Tercero**: Fase 4 (Real-time) - Mejorar subscripciones
4. **Cuarto**: Fase 3 (Drag & Drop) - Agregar interactividad avanzada
5. **Quinto**: Fase 5 (Animaciones) - Polish final

---

## 🚀 INSTRUCCIONES PARA INICIAR

1. Lee este documento completo
2. Verifica la librería drag & drop instalada: `grep -E "dnd|drag|drop" package.json`
3. Empieza por Fase 1 - mejoras estéticas
4. Ve fase por fase, testeando cada cambio antes de continuar
5. Usa el Chrome DevTools MCP para ver cambios en tiempo real

---

## 📁 ARCHIVOS A MODIFICAR/CREAR

**Modificar**:
- `src/pages/admin/operations/fulfillment/onsite/components/FloorPlanView.tsx` (principal)
- `src/pages/admin/operations/fulfillment/onsite/page.tsx` (si necesario)

**Crear nuevos**:
- `src/pages/admin/operations/fulfillment/onsite/components/TableDetailsModal.tsx`
- `src/pages/admin/operations/fulfillment/onsite/components/SeatPartyModal.tsx`
- `src/pages/admin/operations/fulfillment/onsite/components/SortableTableCard.tsx` (si usas drag & drop)

---

## ⚠️ CONSIDERACIONES IMPORTANTES

1. **No rompas la funcionalidad existente** - el load de datos funciona bien
2. **Respeta el sistema de permisos** - `usePermissions('operations')` ya está implementado
3. **Usa componentes ChakraUI v3** - NO uses componentes deprecated
4. **Logger**: Usa `logger.debug()` para debugging, NO `console.log()`
5. **Notifications**: Usa `notify.success()`, `notify.error()` - ya están importados
6. **TypeScript**: Mantén tipado estricto, NO uses `any`

---

**¿Listo para empezar?** 🚀

Comienza con: "Voy a refactorizar el módulo onsite siguiendo el plan. Empezando con Fase 1: Mejoras Estéticas"
