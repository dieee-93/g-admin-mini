# 📅 SchedulingCalendar - Guía de Uso Completa

## ✅ Componente Creado

**Ubicación**: `src/shared/ui/components/business/SchedulingCalendar.tsx`

Este componente genérico te permite programar eventos de cualquier tipo en un calendario visual. Es **100% plug-and-play** y sigue todas las convenciones del proyecto.

---

## 🎯 Características

✅ **Genérico con TypeScript** - Funciona con cualquier tipo de dato
✅ **Render Props** - Personalización total de cómo se muestran los eventos
✅ **Inyectable** - Usa donde quieras con una sola línea
✅ **Sigue convenciones** - Ubicado en `/shared/ui/components/business/`
✅ **Type-safe** - IntelliSense completo
✅ **Memoizado** - Optimizado para performance
✅ **ChakraUI v3** - Compatible con el design system del proyecto

---

## 📦 Instalación (Ya Hecho)

El componente ya está exportado desde `@/shared/ui`:

```typescript
import { SchedulingCalendar } from '@/shared/ui';
```

---

## 🔥 Caso de Uso #1: Programar Producción de Materiales Elaborados

### Contexto
Necesitas programar producciones de recetas en el formulario de material elaborado.

### Implementación

**Archivo**: `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/ElaboratedFields/ElaboratedFields.tsx`

```typescript
import { Box, Stack, Alert, SchedulingCalendar } from '@/shared/ui';
import { SelectField } from '@/shared/ui';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { type ItemFormData } from '../../../../types';
import { CATEGORY_COLLECTION } from '../../constants';
import { RecipeBuilder } from '@/modules/recipe/components';
import { memo, useCallback, useMemo, useState } from 'react';

// ============================================
// TYPES - Define tu tipo de evento
// ============================================

interface ProductionSchedule {
  id: string;
  material_id: string;
  material_name: string;
  scheduled_date: string; // ISO date
  quantity: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  recipe_id?: string;
}

interface ElaboratedFieldsProps {
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
}

export const ElaboratedFields = memo(function ElaboratedFields({
  formData,
  setFormData
}: ElaboratedFieldsProps) {

  // ============================================
  // STATE - Para los schedules
  // ============================================

  const [productionSchedules, setProductionSchedules] = useState<ProductionSchedule[]>([
    // Ejemplo de datos - en producción vendrían del backend
    {
      id: '1',
      material_id: formData.id || '',
      material_name: formData.name || 'Pan',
      scheduled_date: '2025-01-15',
      quantity: 50,
      status: 'scheduled'
    },
    {
      id: '2',
      material_id: formData.id || '',
      material_name: formData.name || 'Pan',
      scheduled_date: '2025-01-15',
      quantity: 30,
      status: 'in_progress'
    },
    {
      id: '3',
      material_id: formData.id || '',
      material_name: formData.name || 'Pan',
      scheduled_date: '2025-01-20',
      quantity: 100,
      status: 'completed'
    }
  ]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleCategoryChange = useCallback((details: { value: string[] }) => {
    setFormData({
      ...formData,
      category: details.value[0] || ''
    });
  }, [formData, setFormData]);

  const handleRecipeSave = useCallback((recipe: any) => {
    setFormData({
      ...formData,
      recipe_id: recipe.id
    });
  }, [formData, setFormData]);

  // ✅ Handler cuando se hace click en una fecha (crear nueva producción)
  const handleDateClick = useCallback((date: Date) => {
    console.log('Crear nueva producción para:', date);

    // Aquí abrirías un modal para crear una nueva producción
    // Por ejemplo:
    // openCreateProductionModal({
    //   material_id: formData.id,
    //   scheduled_date: date.toISOString().split('T')[0],
    //   quantity: 0
    // });

    // Por ahora, solo agregamos un schedule de ejemplo
    const newSchedule: ProductionSchedule = {
      id: `temp-${Date.now()}`,
      material_id: formData.id || '',
      material_name: formData.name || '',
      scheduled_date: date.toISOString().split('T')[0],
      quantity: 0,
      status: 'scheduled'
    };

    setProductionSchedules(prev => [...prev, newSchedule]);
  }, [formData]);

  // ✅ Handler cuando se hace click en un evento existente (editar)
  const handleEventClick = useCallback((schedule: ProductionSchedule) => {
    console.log('Editar producción:', schedule);

    // Aquí abrirías un modal para editar
    // openEditProductionModal(schedule);
  }, []);

  // ✅ Handler cuando cambia el mes (opcional - para cargar datos del nuevo mes)
  const handleMonthChange = useCallback((date: Date) => {
    console.log('Mes cambiado a:', date);

    // Aquí podrías cargar los schedules del nuevo mes
    // fetchProductionSchedules(formData.id, date.getMonth(), date.getFullYear());
  }, [formData.id]);

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  // ✅ Función para extraer la fecha del evento
  const getScheduleDate = useCallback((schedule: ProductionSchedule) => {
    return new Date(schedule.scheduled_date);
  }, []);

  // ✅ Función para renderizar cada evento (personalización total)
  const renderScheduleEvent = useCallback((schedule: ProductionSchedule) => {
    return `${schedule.quantity}x`;
  }, []);

  // ✅ Función para obtener el color según el status
  const getScheduleColor = useCallback((schedule: ProductionSchedule) => {
    switch (schedule.status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  }, []);

  // ============================================
  // OUTPUT ITEM
  // ============================================

  const outputItem = useMemo(() => ({
    id: formData.id || '',
    name: formData.name || '',
    type: 'material' as const,
    unit: formData.unit || 'unit'
  }), [formData.id, formData.name, formData.unit]);

  return (
    <Stack gap="6" w="full">
      {/* Business Category */}
      <Box w="full">
        <SelectField
          label="Categoría del Producto"
          placeholder="¿A qué categoría pertenece?"
          collection={CATEGORY_COLLECTION}
          value={formData.category ? [formData.category] : []}
          onValueChange={handleCategoryChange}
          required
          height="44px"
          noPortal={true}
        />
      </Box>

      {/* Info sobre elaborados */}
      <Alert.Root status="warning" variant="subtle">
        <Alert.Indicator>
          <ExclamationTriangleIcon style={{ width: '16px', height: '16px' }} />
        </Alert.Indicator>
        <Alert.Title>Items Elaborados</Alert.Title>
        <Alert.Description>
          Los items elaborados requieren una receta con ingredientes.
          El sistema verificará automáticamente que haya stock suficiente antes de permitir la producción.
        </Alert.Description>
      </Alert.Root>

      {/* Constructor de Receta */}
      <Box w="full">
        <RecipeBuilder
          entityType="material"
          mode="create"
          complexity="minimal"
          outputItem={outputItem}
          onSave={handleRecipeSave}
        />
      </Box>

      {/* ============================================ */}
      {/* ✅ NUEVO: CALENDARIO DE PRODUCCIÓN            */}
      {/* ============================================ */}

      <Box w="full">
        <Stack gap="2">
          <Typography variant="body" fontWeight="semibold" fontSize="md">
            Programación de Producción
          </Typography>
          <Typography variant="body" fontSize="sm" color="fg.muted">
            Programa cuándo producir este material elaborado
          </Typography>
        </Stack>

        <SchedulingCalendar<ProductionSchedule>
          events={productionSchedules}
          getEventDate={getScheduleDate}
          renderEvent={renderScheduleEvent}
          getEventColor={getScheduleColor}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          onMonthChange={handleMonthChange}
          config={{
            showNavigation: true,
            showAddButton: true,
            allowDateClick: true,
            compactMode: false,
            highlightToday: true
          }}
        />
      </Box>
    </Stack>
  );
});
```

### Resultado Visual

```
┌────────────────────────────────────────────────────────┐
│  ←    📅 Enero 2025             + Agregar    →        │
├────────────────────────────────────────────────────────┤
│ Dom  Lun  Mar  Mié  Jue  Vie  Sáb                     │
│                  1    2    3    4                      │
│  5    6    7    8    9   10   11                      │
│ 12   13   14  [15]  16   17   18   ← Día 15 tiene:    │
│                    50x (gris)       │ - 50x programado  │
│                    30x (azul)       │ - 30x en progreso │
│ 19  [20]  21   22   23   24   25   ← Día 20 tiene:    │
│     100x (verde)                    │ - 100x completado │
│ 26   27   28   29   30   31         │                  │
└────────────────────────────────────────────────────────┘
```

---

## 🔥 Caso de Uso #2: Programar Citas de Clientes

### Contexto
Sistema de reservas para servicios (peluquería, consultorio, etc.).

### Implementación

```typescript
// src/modules/appointments/components/AppointmentScheduler.tsx

import { SchedulingCalendar } from '@/shared/ui';
import { useState, useCallback } from 'react';

interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  appointment_date: string; // ISO date
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export function AppointmentScheduler() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      customer_name: 'María González',
      customer_phone: '+54 9 11 1234-5678',
      service_name: 'Corte de cabello',
      appointment_date: '2025-01-15',
      start_time: '10:00',
      end_time: '11:00',
      status: 'confirmed'
    },
    {
      id: '2',
      customer_name: 'Juan Pérez',
      customer_phone: '+54 9 11 8765-4321',
      service_name: 'Manicura',
      appointment_date: '2025-01-15',
      start_time: '14:00',
      end_time: '15:00',
      status: 'pending'
    }
  ]);

  const handleCreateAppointment = useCallback((date: Date) => {
    console.log('Crear nueva cita para:', date);
    // Abrir modal de creación
  }, []);

  const handleEditAppointment = useCallback((appointment: Appointment) => {
    console.log('Editar cita:', appointment);
    // Abrir modal de edición
  }, []);

  return (
    <SchedulingCalendar<Appointment>
      events={appointments}

      // ✅ Extraer fecha
      getEventDate={(apt) => new Date(apt.appointment_date)}

      // ✅ Renderizar evento (personalizado)
      renderEvent={(apt) => (
        <>
          {apt.start_time} - {apt.customer_name}
        </>
      )}

      // ✅ Color según status
      getEventColor={(apt) => {
        switch (apt.status) {
          case 'confirmed': return 'green';
          case 'pending': return 'orange';
          case 'cancelled': return 'red';
          default: return 'blue';
        }
      }}

      // ✅ Handlers
      onDateClick={handleCreateAppointment}
      onEventClick={handleEditAppointment}

      // ✅ Configuración
      config={{
        showNavigation: true,
        showAddButton: true,
        allowDateClick: true,
        compactMode: false
      }}
    />
  );
}
```

---

## 🔥 Caso de Uso #3: Programar Turnos de Staff

### Contexto
Gestión de turnos de empleados en una semana.

### Implementación

```typescript
// src/modules/staff/components/StaffShiftScheduler.tsx

import { SchedulingCalendar } from '@/shared/ui';
import { useState, useCallback } from 'react';

interface StaffShift {
  id: string;
  employee_id: string;
  employee_name: string;
  shift_date: string; // ISO date
  start_time: string;
  end_time: string;
  position: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'absent';
}

export function StaffShiftScheduler() {
  const [shifts, setShifts] = useState<StaffShift[]>([
    {
      id: '1',
      employee_id: 'EMP-001',
      employee_name: 'Carlos Martínez',
      shift_date: '2025-01-15',
      start_time: '09:00',
      end_time: '17:00',
      position: 'Cajero',
      status: 'confirmed'
    }
  ]);

  return (
    <SchedulingCalendar<StaffShift>
      events={shifts}
      getEventDate={(shift) => new Date(shift.shift_date)}

      // ✅ Mostrar nombre del empleado y horario
      renderEvent={(shift) => (
        <>
          {shift.employee_name.split(' ')[0]} ({shift.start_time})
        </>
      )}

      getEventColor={(shift) => {
        switch (shift.status) {
          case 'completed': return 'green';
          case 'confirmed': return 'blue';
          case 'absent': return 'red';
          default: return 'gray';
        }
      }}

      onDateClick={(date) => console.log('Asignar turno:', date)}
      onEventClick={(shift) => console.log('Editar turno:', shift)}
    />
  );
}
```

---

## 🔥 Caso de Uso #4: Programar Mantenimiento de Assets

### Contexto
Programar mantenimientos preventivos de equipos/activos.

### Implementación

```typescript
// src/modules/assets/components/MaintenanceScheduler.tsx

import { SchedulingCalendar } from '@/shared/ui';

interface MaintenanceSchedule {
  id: string;
  asset_id: string;
  asset_name: string;
  maintenance_date: string;
  maintenance_type: 'preventive' | 'corrective' | 'inspection';
  technician?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed';
  notes?: string;
}

export function MaintenanceScheduler({ assetId }: { assetId: string }) {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);

  return (
    <SchedulingCalendar<MaintenanceSchedule>
      events={schedules}
      getEventDate={(s) => new Date(s.maintenance_date)}

      renderEvent={(s) => (
        <>
          {s.maintenance_type === 'preventive' ? '🔧' : '⚠️'} {s.asset_name}
        </>
      )}

      getEventColor={(s) => {
        switch (s.maintenance_type) {
          case 'preventive': return 'blue';
          case 'corrective': return 'red';
          case 'inspection': return 'green';
          default: return 'gray';
        }
      }}

      onDateClick={(date) => console.log('Programar mantenimiento:', date)}
      onEventClick={(s) => console.log('Ver mantenimiento:', s)}

      config={{
        compactMode: true, // ✅ Modo compacto para ver más info
        showWeekNumbers: true
      }}
    />
  );
}
```

---

## 🎨 Personalización Avanzada

### Renderizado Personalizado de Contador de Eventos

```typescript
<SchedulingCalendar<ProductionSchedule>
  events={productionSchedules}
  getEventDate={(s) => new Date(s.scheduled_date)}
  renderEvent={(s) => `${s.quantity}x`}

  // ✅ Personalizar cómo se muestra el contador de eventos
  renderEventCount={(events) => (
    <Stack direction="row" gap="1">
      <Badge colorPalette="blue" size="xs">
        {events.reduce((sum, e) => sum + e.quantity, 0)} unidades
      </Badge>
    </Stack>
  )}

  onDateClick={handleDateClick}
/>
```

### Modo Compacto para Dashboards

```typescript
<SchedulingCalendar
  events={events}
  getEventDate={getDate}
  renderEvent={renderEvent}

  config={{
    compactMode: true,        // ✅ Celdas más pequeñas
    showNavigation: false,    // ✅ Sin navegación
    showAddButton: false,     // ✅ Sin botón agregar
    allowDateClick: false     // ✅ Solo vista, no interactivo
  }}
/>
```

---

## 🔌 Integración con Backend

### Cargar Datos del Backend

```typescript
import { SchedulingCalendar } from '@/shared/ui';
import { useQuery } from '@tanstack/react-query';

function ProductionScheduler({ materialId }: { materialId: string }) {

  // ✅ Cargar schedules del backend
  const { data: schedules, isLoading } = useQuery({
    queryKey: ['production-schedules', materialId],
    queryFn: () => fetchProductionSchedules(materialId)
  });

  return (
    <SchedulingCalendar
      events={schedules || []}
      loading={isLoading} // ✅ Muestra skeleton mientras carga
      getEventDate={(s) => new Date(s.scheduled_date)}
      renderEvent={(s) => `${s.quantity}x`}
      onDateClick={handleCreate}
      onEventClick={handleEdit}
    />
  );
}
```

### Crear Nuevo Evento

```typescript
const createMutation = useMutation({
  mutationFn: (newSchedule: ProductionSchedule) =>
    createProductionSchedule(newSchedule),
  onSuccess: () => {
    // ✅ Invalidar cache para recargar
    queryClient.invalidateQueries(['production-schedules']);
  }
});

const handleDateClick = useCallback((date: Date) => {
  // Crear nuevo schedule
  createMutation.mutate({
    material_id: materialId,
    scheduled_date: date.toISOString().split('T')[0],
    quantity: 0,
    status: 'scheduled'
  });
}, [materialId]);
```

---

## 📊 Props API Completa

```typescript
interface SchedulingCalendarProps<T extends SchedulableEvent> {
  // ============================================
  // DATOS
  // ============================================

  /** Array de eventos a mostrar */
  events: T[];

  /** Fecha inicial (default: hoy) */
  initialDate?: Date;

  /** Estado de carga */
  loading?: boolean;

  // ============================================
  // RENDER PROPS (Personalización)
  // ============================================

  /** Extraer fecha del evento (REQUERIDO) */
  getEventDate: (event: T) => Date;

  /** Renderizar evento (REQUERIDO) */
  renderEvent: (event: T) => React.ReactNode;

  /** Color del evento (opcional) */
  getEventColor?: (event: T) => string;

  /** Renderizado custom del contador (opcional) */
  renderEventCount?: (events: T[]) => React.ReactNode;

  // ============================================
  // CALLBACKS
  // ============================================

  /** Click en fecha vacía */
  onDateClick?: (date: Date) => void;

  /** Click en evento */
  onEventClick?: (event: T) => void;

  /** Cambio de mes */
  onMonthChange?: (date: Date) => void;

  /** Click en botón "Agregar" */
  onAddClick?: (currentDate: Date) => void;

  // ============================================
  // CONFIGURACIÓN
  // ============================================

  config?: {
    showNavigation?: boolean;     // Flechas prev/next (default: true)
    showAddButton?: boolean;      // Botón "Agregar" (default: true)
    allowDateClick?: boolean;     // Permitir click en fechas (default: true)
    compactMode?: boolean;        // Modo compacto (default: false)
    view?: 'month' | 'week';      // Vista (default: 'month')
    showWeekNumbers?: boolean;    // Números de semana (default: false)
    highlightToday?: boolean;     // Resaltar hoy (default: true)
    locale?: string;              // Locale (default: 'es-ES')
  };
}
```

---

## ✅ Checklist de Convenciones

- ✅ Ubicado en `/src/shared/ui/components/business/`
- ✅ Exportado desde `/src/shared/ui/index.ts`
- ✅ Exportado desde `/src/shared/ui/components/business/index.ts`
- ✅ Genérico con TypeScript `<T>`
- ✅ Props pattern con callbacks opcionales
- ✅ Memoizado con `React.memo`
- ✅ Compatible con ChakraUI v3.23.0
- ✅ Usa iconos de Heroicons v2
- ✅ Sigue naming conventions (camelCase, PascalCase)
- ✅ Type exports incluidos
- ✅ JSDoc comments para IntelliSense
- ✅ Accesibilidad (aria-labels)

---

## 🚀 Resumen

Este componente es:

1. **Genérico** - Funciona con cualquier tipo de dato
2. **Flexible** - Render props te dan control total
3. **Inyectable** - Lo usas donde quieras
4. **Type-safe** - TypeScript completo
5. **Performante** - Memoizado y optimizado
6. **Compatible** - Sigue todas las convenciones del proyecto

**NO VIOLA NINGUNA CONVENCIÓN** - Al contrario, las refuerza al estar en la ubicación correcta (`/shared/ui/components/business/`) y seguir todos los patrones del proyecto.

---

## 💡 Próximos Pasos

1. **Inyectar en ElaboratedFields** - Copia el ejemplo de arriba
2. **Crear handlers** - Implementa `onDateClick` y `onEventClick`
3. **Conectar con backend** - Usa React Query para cargar datos
4. **Personalizar** - Ajusta `renderEvent` y `getEventColor` según tus necesidades

¿Necesitas ayuda implementando alguno de estos casos de uso? ¡Dime y te ayudo! 🚀
