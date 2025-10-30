# Scheduling Event Types - Specification Document

**Version:** 2.0.0
**Last Updated:** 2025-01-10
**Author:** G-Admin Team

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Event Type Catalog](#event-type-catalog)
3. [UnifiedScheduleEvent Structure](#unifiedscheduleevent-structure)
4. [Metadata Specifications](#metadata-specifications)
5. [Capability Mapping](#capability-mapping)
6. [Examples](#examples)

---

## 🎯 Overview

### Purpose

Este documento especifica todos los tipos de eventos soportados por el calendario de Scheduling, incluyendo su estructura de datos, metadata específica, y relación con las capabilities del negocio.

### Design Principles

1. **Single Source of Truth**: UnifiedScheduleEvent normaliza todos los tipos
2. **Type Safety**: TypeScript discriminated unions garantizan metadata correcta
3. **Extensibility**: Agregar nuevos tipos solo requiere extender el enum y metadata
4. **Capability-Driven**: Los tipos se activan según las capabilities seleccionadas

---

## 📚 Event Type Catalog

### 1. Staff Shift (`staff_shift`)

**Descripción:** Turno de trabajo de un empleado

**Activado por capabilities:**
- `onsite_service` - Servicio en local
- `pickup_orders` - Retiro en local
- `delivery_shipping` - Envío a domicilio
- `mobile_operations` - Operaciones móviles

**Color:** 🔵 Azul (`blue.50`, `#3182CE`)

**Icon:** `UserIcon` (Heroicons)

**Campos específicos:**
- `position`: Posición/rol del empleado
- `hourlyRate`: Tarifa por hora (para cálculos de costo)
- `breakDuration`: Duración del break (minutos)
- `isMandatory`: Si el turno es obligatorio
- `canBeCovered`: Si puede ser cubierto por otro empleado
- `coveredBy`: ID del empleado que cubre (si aplica)

**Fuente de datos:** `shift_schedules` table (Supabase)

**Adapter:** `staffShiftAdapter.ts`

---

### 2. Production Block (`production`)

**Descripción:** Bloque de producción/cocina

**Activado por capabilities:**
- `requires_preparation` - Cocina/producción/manufactura

**Color:** 🟣 Púrpura (`purple.50`, `#805AD5`)

**Icon:** `BeakerIcon` (Heroicons)

**Campos específicos:**
- `recipeId`: ID de la receta/producto
- `recipeName`: Nombre de la receta
- `quantity`: Cantidad a producir
- `unit`: Unidad (ej: 'units', 'kg', 'liters')
- `assignedStaffIds`: IDs de empleados asignados
- `assignedStaffNames`: Nombres (desnormalizado)
- `capacityUsed`: Porcentaje de capacidad usado
- `station`: Estación de trabajo (ej: 'grill', 'prep')

**Fuente de datos:** `production_schedules` table (TODO: Crear en Supabase)

**Adapter:** `productionAdapter.ts` (TODO: Implementar)

**Status:** 📋 Placeholder - Requiere módulo de Production completo

---

### 3. Appointment (`appointment`)

**Descripción:** Cita con cliente

**Activado por capabilities:**
- `appointment_based` - Servicios con cita previa

**Color:** 🟢 Verde (`green.50`, `#38A169`)

**Icon:** `CalendarIcon` (Heroicons)

**Campos específicos:**
- `customerId`: ID del cliente
- `customerName`: Nombre del cliente
- `customerPhone`: Teléfono del cliente
- `customerEmail`: Email del cliente
- `serviceType`: Tipo de servicio
- `reminderSent`: Si se envió reminder
- `notes`: Notas del cliente
- `estimatedCost`: Costo estimado del servicio

**Fuente de datos:** `appointments` table (TODO: Crear en Supabase)

**Adapter:** `appointmentAdapter.ts` (TODO: Implementar)

**Status:** 📋 Placeholder - Requiere feature `scheduling_appointment_booking`

---

### 4. Delivery (`delivery`)

**Descripción:** Entrega programada

**Activado por capabilities:**
- `delivery_shipping` - Envío a domicilio

**Color:** 🔵 Cyan (`cyan.50`, `#0BC5EA`)

**Icon:** `TruckIcon` (Heroicons)

**Campos específicos:**
- `orderId`: ID del pedido
- `deliveryAddress`: Dirección de entrega
- `driverId`: ID del repartidor
- `driverName`: Nombre del repartidor
- `vehicleId`: ID del vehículo
- `deliveryZone`: Zona de entrega
- `distanceKm`: Distancia estimada (km)
- `estimatedTimeMinutes`: Tiempo estimado (minutos)
- `trackingUrl`: URL de tracking

**Fuente de datos:** `deliveries` table (Pendiente crear en Supabase)

**Adapter:** `deliveryAdapter.ts` ✅ **Implementado**

**Status:** ✅ Adapter completo - Falta crear tabla en Supabase

---

### 5. Time-Off (`time_off`)

**Descripción:** Permiso/ausencia de empleado

**Activado por capabilities:**
- Todas (gestión de personal es universal)

**Color:** 🟠 Naranja (`orange.50`, `#DD6B20`)

**Icon:** `CalendarDaysIcon` (Heroicons)

**Campos específicos:**
- `requestType`: Tipo ('vacation' | 'sick' | 'personal' | 'emergency')
- `reason`: Razón del permiso
- `approved`: Si fue aprobado
- `requestedAt`: Fecha de solicitud
- `reviewedBy`: ID de quien aprobó/rechazó
- `reviewedAt`: Fecha de revisión
- `reviewerComments`: Comentarios del revisor

**Fuente de datos:** `time_off_requests` table (Pendiente crear en Supabase)

**Adapter:** `timeOffAdapter.ts` ✅ **Implementado**

**Status:** ✅ Adapter completo - Falta crear tabla en Supabase

---

### 6. Maintenance (`maintenance`)

**Descripción:** Mantenimiento de equipos

**Activado por capabilities:**
- Todas (operaciones es universal)

**Color:** ⚪ Gris (`gray.50`, `#718096`)

**Icon:** `WrenchScrewdriverIcon` (Heroicons)

**Campos específicos:**
- `equipmentName`: Equipo/área a mantener
- `equipmentId`: ID del equipo
- `maintenanceType`: Tipo ('preventive' | 'corrective' | 'inspection')
- `technicianId`: Técnico asignado
- `technicianName`: Nombre del técnico
- `estimatedCost`: Costo estimado
- `notes`: Notas técnicas

**Fuente de datos:** `maintenance_schedules` table (Pendiente crear en Supabase)

**Adapter:** `maintenanceAdapter.ts` ✅ **Implementado**

**Status:** ✅ Adapter completo - Falta crear tabla en Supabase

**Status:** 📋 Placeholder - Low priority, future enhancement

---

## 🏗️ UnifiedScheduleEvent Structure

### Core Interface

```typescript
interface UnifiedScheduleEvent {
  // IDENTITY
  id: string;
  type: EventType;

  // BASIC INFO
  title: string;
  description?: string;

  // TEMPORAL
  start: Date;
  end: Date;
  allDay: boolean;

  // RELATIONSHIPS
  employeeId?: string;
  employeeName?: string;
  departmentId?: string;
  departmentName?: string;
  locationId?: string;

  // STATUS
  status: EventStatus;
  priority?: 1 | 2 | 3;

  // TYPE-SPECIFIC METADATA
  metadata: EventMetadata;

  // UI CONFIGURATION
  colorBg: string;
  colorBorder: string;
  colorText: string;
  colorDot: string;
  icon: string;

  // AUDIT
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}
```

### EventType Enum

```typescript
type EventType =
  | 'staff_shift'
  | 'production'
  | 'appointment'
  | 'delivery'
  | 'time_off'
  | 'maintenance';
```

### EventStatus Enum

```typescript
type EventStatus =
  | 'scheduled'   // Programado
  | 'confirmed'   // Confirmado
  | 'in_progress' // En curso
  | 'completed'   // Completado
  | 'cancelled'   // Cancelado
  | 'no_show';    // No se presentó (para citas)
```

### EventMetadata Union

```typescript
type EventMetadata =
  | StaffShiftMetadata
  | ProductionMetadata
  | AppointmentMetadata
  | DeliveryMetadata
  | TimeOffMetadata
  | MaintenanceMetadata;
```

**Discriminant:** El campo `type` en cada metadata interface permite a TypeScript inferir el tipo correcto.

---

## 📊 Metadata Specifications

### StaffShiftMetadata

```typescript
interface StaffShiftMetadata {
  type: 'staff_shift'; // Discriminant

  // Position & Compensation
  position: string;
  hourlyRate?: number;

  // Break Management
  breakDuration?: number; // Minutes

  // Coverage Rules
  isMandatory?: boolean;
  canBeCovered?: boolean;
  coveredBy?: string; // Employee ID

  // Notes
  notes?: string;
}
```

**Example:**
```json
{
  "type": "staff_shift",
  "position": "Kitchen Chef",
  "hourlyRate": 2500,
  "breakDuration": 30,
  "isMandatory": false,
  "canBeCovered": true,
  "notes": "Closing shift"
}
```

---

### ProductionMetadata

```typescript
interface ProductionMetadata {
  type: 'production'; // Discriminant

  // Recipe Info
  recipeId?: string;
  recipeName: string;

  // Quantity
  quantity: number;
  unit: string; // 'units', 'kg', 'liters', etc.

  // Staff Assignment
  assignedStaffIds: string[];
  assignedStaffNames: string[];

  // Capacity
  capacityUsed: number; // Percentage (0-100)

  // Station
  station?: string; // 'grill', 'prep', 'assembly'
}
```

**Example:**
```json
{
  "type": "production",
  "recipeId": "rec_123",
  "recipeName": "Classic Burger",
  "quantity": 50,
  "unit": "units",
  "assignedStaffIds": ["emp_001", "emp_002"],
  "assignedStaffNames": ["John Doe", "Jane Smith"],
  "capacityUsed": 75,
  "station": "grill"
}
```

---

### AppointmentMetadata

```typescript
interface AppointmentMetadata {
  type: 'appointment'; // Discriminant

  // Customer Info
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;

  // Service
  serviceType: string;
  estimatedCost?: number;

  // Reminders
  reminderSent: boolean;

  // Notes
  notes?: string;
}
```

**Example:**
```json
{
  "type": "appointment",
  "customerId": "cust_456",
  "customerName": "Carlos Pérez",
  "customerPhone": "+54 11 1234-5678",
  "serviceType": "Corte de cabello",
  "estimatedCost": 3000,
  "reminderSent": true,
  "notes": "Cliente prefiere estilista María"
}
```

---

### DeliveryMetadata

```typescript
interface DeliveryMetadata {
  type: 'delivery'; // Discriminant

  // Order
  orderId: string;

  // Delivery Details
  deliveryAddress: string;
  deliveryZone?: string;

  // Driver
  driverId?: string;
  driverName?: string;
  vehicleId?: string;

  // Logistics
  distanceKm?: number;
  estimatedTimeMinutes?: number;
  trackingUrl?: string;
}
```

**Example:**
```json
{
  "type": "delivery",
  "orderId": "ORD-2025-001",
  "deliveryAddress": "Av. Corrientes 1234, CABA",
  "deliveryZone": "Zone-A",
  "driverId": "drv_001",
  "driverName": "Pedro García",
  "vehicleId": "VEH-001",
  "distanceKm": 5.2,
  "estimatedTimeMinutes": 20,
  "trackingUrl": "https://tracking.example.com/ORD-2025-001"
}
```

---

### TimeOffMetadata

```typescript
interface TimeOffMetadata {
  type: 'time_off'; // Discriminant

  // Request Type
  requestType: 'vacation' | 'sick' | 'personal' | 'emergency';

  // Reason
  reason?: string;

  // Approval
  approved: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewerComments?: string;

  // Request Date
  requestedAt: Date;
}
```

**Example:**
```json
{
  "type": "time_off",
  "requestType": "vacation",
  "reason": "Vacaciones familiares",
  "approved": true,
  "reviewedBy": "mgr_001",
  "reviewedAt": "2025-01-05T10:30:00Z",
  "reviewerComments": "Aprobado. Disfrute sus vacaciones.",
  "requestedAt": "2025-01-01T09:00:00Z"
}
```

---

### MaintenanceMetadata

```typescript
interface MaintenanceMetadata {
  type: 'maintenance'; // Discriminant

  // Equipment
  equipmentName: string;
  equipmentId?: string;

  // Type
  maintenanceType: 'preventive' | 'corrective' | 'inspection';

  // Technician
  technicianId?: string;
  technicianName?: string;

  // Cost
  estimatedCost?: number;

  // Notes
  notes?: string;
}
```

**Example:**
```json
{
  "type": "maintenance",
  "equipmentName": "Horno Industrial #2",
  "equipmentId": "EQ-002",
  "maintenanceType": "preventive",
  "technicianId": "tech_001",
  "technicianName": "Roberto Martínez",
  "estimatedCost": 15000,
  "notes": "Revisión mensual programada"
}
```

---

## 🗺️ Capability Mapping

### Matrix: Event Type ↔ Business Capability

| Event Type     | Required Capability                | Status        |
|----------------|------------------------------------|---------------|
| staff_shift    | onsite_service, pickup_orders, etc | ✅ Active      |
| production     | requires_preparation               | 📋 Placeholder |
| appointment    | appointment_based                  | 📋 Placeholder |
| delivery       | delivery_shipping                  | 📋 Placeholder |
| delivery       | delivery_scheduling                | ✅ Implemented |
| time_off       | (Any - universal)                  | ✅ Implemented |
| maintenance    | (Any - universal)                  | ✅ Implemented |

### Feature Registry Integration

Los event types se activan automáticamente según las features del `FeatureRegistry`:

```typescript
// Ejemplo: Si el usuario tiene estas features activas:
const activeFeatures = [
  'staff_shift_management',
  'production_kitchen_display',
  'scheduling_appointment_booking'
];

// El calendario mostrará estos tipos:
const availableEventTypes = [
  'staff_shift',    // ← from staff_shift_management
  'production',     // ← from production_kitchen_display
  'appointment',    // ← from scheduling_appointment_booking
  'time_off',       // ← always available
  'maintenance'     // ← always available
];
```

---

## 💡 Examples

### Example 1: Staff Shift (Complete)

```typescript
const staffShiftEvent: UnifiedScheduleEvent = {
  id: 'shift_001',
  type: 'staff_shift',

  title: 'John Doe - Kitchen Chef',
  description: 'Closing shift',

  start: new Date('2025-01-10T18:00:00'),
  end: new Date('2025-01-11T02:00:00'),
  allDay: false,

  employeeId: 'emp_001',
  employeeName: 'John Doe',
  departmentId: 'dept_kitchen',
  departmentName: 'Kitchen',

  status: 'confirmed',
  priority: 2,

  metadata: {
    type: 'staff_shift',
    position: 'Kitchen Chef',
    hourlyRate: 2500,
    breakDuration: 30,
    isMandatory: false,
    canBeCovered: true,
    notes: 'Closing shift'
  },

  colorBg: 'blue.50',
  colorBorder: 'blue.500',
  colorText: 'blue.900',
  colorDot: '#3182CE',
  icon: 'UserIcon',

  createdAt: new Date('2025-01-01T10:00:00'),
  updatedAt: new Date('2025-01-05T15:30:00')
};
```

### Example 2: Production Block (Placeholder)

```typescript
const productionEvent: UnifiedScheduleEvent = {
  id: 'prod_001',
  type: 'production',

  title: 'Lunch Prep - 50 units',
  description: 'Preparación de almuerzos',

  start: new Date('2025-01-10T11:00:00'),
  end: new Date('2025-01-10T14:00:00'),
  allDay: false,

  departmentId: 'dept_kitchen',
  departmentName: 'Kitchen',

  status: 'in_progress',
  priority: 3,

  metadata: {
    type: 'production',
    recipeId: 'rec_123',
    recipeName: 'Classic Burger',
    quantity: 50,
    unit: 'units',
    assignedStaffIds: ['emp_001', 'emp_002'],
    assignedStaffNames: ['John Doe', 'Jane Smith'],
    capacityUsed: 80,
    station: 'grill'
  },

  colorBg: 'purple.50',
  colorBorder: 'purple.500',
  colorText: 'purple.900',
  colorDot: '#805AD5',
  icon: 'BeakerIcon',

  createdAt: new Date('2025-01-10T09:00:00'),
  updatedAt: new Date('2025-01-10T11:00:00')
};
```

### Example 3: Appointment (Placeholder)

```typescript
const appointmentEvent: UnifiedScheduleEvent = {
  id: 'appt_001',
  type: 'appointment',

  title: 'Carlos Pérez - Corte de cabello',
  description: 'Cliente regular',

  start: new Date('2025-01-10T15:00:00'),
  end: new Date('2025-01-10T15:45:00'),
  allDay: false,

  employeeId: 'emp_003',
  employeeName: 'María Estilista',
  departmentId: 'dept_service',
  departmentName: 'Service',

  status: 'confirmed',
  priority: 3,

  metadata: {
    type: 'appointment',
    customerId: 'cust_456',
    customerName: 'Carlos Pérez',
    customerPhone: '+54 11 1234-5678',
    serviceType: 'Corte de cabello',
    estimatedCost: 3000,
    reminderSent: true,
    notes: 'Cliente prefiere estilista María'
  },

  colorBg: 'green.50',
  colorBorder: 'green.500',
  colorText: 'green.900',
  colorDot: '#38A169',
  icon: 'CalendarIcon',

  createdAt: new Date('2025-01-05T10:00:00'),
  updatedAt: new Date('2025-01-08T12:00:00')
};
```

---

## 🔧 Adding New Event Types

### Step-by-Step Guide

1. **Define Metadata Interface**

```typescript
// types/calendar.ts
export interface CustomEventMetadata {
  type: 'custom_event'; // Discriminant
  customField1: string;
  customField2: number;
}
```

2. **Add to EventMetadata Union**

```typescript
export type EventMetadata =
  | StaffShiftMetadata
  | ProductionMetadata
  | AppointmentMetadata
  | DeliveryMetadata
  | TimeOffMetadata
  | MaintenanceMetadata
  | CustomEventMetadata; // ← Add here
```

3. **Add to EventType Enum**

```typescript
export type EventType =
  | 'staff_shift'
  | 'production'
  | 'appointment'
  | 'delivery'
  | 'time_off'
  | 'maintenance'
  | 'custom_event'; // ← Add here
```

4. **Add Color Configuration**

```typescript
export const EVENT_COLORS: Record<EventType, EventColorConfig> = {
  // ... existing colors
  custom_event: {
    bg: 'pink.50',
    border: 'pink.500',
    text: 'pink.900',
    dot: '#D53F8C'
  }
};
```

5. **Create Adapter**

```typescript
// adapters/customEventAdapter.ts
import { SchedulingAdapter } from './SchedulingAdapter';
import type { UnifiedScheduleEvent, CustomEventMetadata } from '../types/calendar';

interface CustomEventSource {
  id: string;
  // ... source fields
}

export class CustomEventAdapter extends SchedulingAdapter<CustomEventSource> {
  adapt(source: CustomEventSource): UnifiedScheduleEvent {
    // Implementation
  }
}

export const customEventAdapter = new CustomEventAdapter();
```

6. **Wire to Calendar**

```typescript
// page.tsx
import { customEventAdapter } from './adapters/customEventAdapter';

const customEvents = customEventAdapter.adaptMany(customEventData);
const allEvents = [...staffEvents, ...productionEvents, ...customEvents];
```

**Done!** El nuevo tipo ahora aparece en filtros, tooltips, y calendario.

---

## 📚 Related Documentation

- [Calendar Design Architecture](./SCHEDULING_CALENDAR_DESIGN.md)
- [Integration Guide](./SCHEDULING_INTEGRATION_GUIDE.md)
- [Adapter Pattern Reference](../adapters/SchedulingAdapter.ts)

---

**Document Version:** 2.0.0
**Last Review:** 2025-01-10
**Next Review:** After Production/Appointment adapters implementation
