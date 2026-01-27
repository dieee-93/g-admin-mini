# Research: Operational Shift vs Employee Shifts

**Fecha**: 2025-12-04
**Estado**: 🔍 CRITICAL RESEARCH COMPLETE
**Propósito**: Distinguir "Operational Shift" (ShiftControl) vs "Employee Shifts" (Scheduling)

---

## 🎯 HALLAZGO CRÍTICO

**Hay DOS conceptos completamente diferentes de "shift" que se confundían:**

### 1️⃣ **Operational Shift** (Close of Day / Business State)
- **Qué es**: Estado del NEGOCIO (abierto/cerrado como entidad)
- **Quién lo controla**: Manager/Admin
- **Cuándo**: Una vez al día (o por turno: mañana/tarde/noche)
- **Propósito**: Control operacional del negocio
- **Ejemplo**: "Restaurante abierto de 9am-11pm"

### 2️⃣ **Employee Shift** (Staff Schedule / Individual Work Time)
- **Qué es**: Horario de trabajo de UN empleado
- **Quién lo controla**: Scheduler/Manager
- **Cuándo**: Múltiples por día, múltiples empleados
- **Propósito**: Gestión de personal
- **Ejemplo**: "John trabaja 10am-6pm, Mary trabaja 2pm-10pm"

---

## 📊 SISTEMAS REALES - ANÁLISIS

### Toast POS

**Fuente**: [Toast Shift Review Documentation](https://doc.toasttab.com/doc/platformguide/platformCompletingShiftReview.html)

Toast distingue claramente:

```
EMPLOYEE SHIFT (Individual):
- Clock in
- Declare cash tips
- Close cash drawer
- Clock out
- Print shift report

vs

CLOSE OF DAY (Restaurant):
- Run close of day report
- All shifts must be closed
- Total cash reconciliation
- Restaurant closes
```

**Cita clave**:
> "At the end of shift review, you can clock out and start a new shift, simply clock out, or print your shift review report."

**Observación**: Un empleado puede hacer múltiples "shifts" en un día, pero el restaurante tiene un solo "close of day".

---

### Square for Restaurants

**Fuente**: [Square Close of Day Procedures](https://squareup.com/help/us/en/article/6566-customize-your-closing-procedures-with-square-for-restaurants)

Square separa:

```
TEAM MEMBER SHIFT:
- Clock in/out
- Individual cash tips
- Personal shift report

vs

CLOSE OF DAY (Restaurant):
- Account > Run Close of Day
- All team member shifts reviewed
- Final cash reconciliation
- Restaurant operational close
```

**Cita clave**:
> "The close of day report is the last report your managers may run for the day to close out your restaurant."

**Observación**: Team members cierran SUS shifts, pero el manager cierra EL RESTAURANTE.

---

### Odoo Planning Module

**Fuente**: [Odoo 18 Planning Documentation](https://www.odoo.com/documentation/18.0/applications/services/planning.html)

Odoo distingue explícitamente:

```
WORKING HOURS (Operational):
- Business open hours: 8am - 5pm
- Defines when business operates
- 1-hour lunch break (12-1pm)

vs

EMPLOYEE SHIFT (Individual):
- Shift Start: 9am
- Duration: 8 hours
- Calculated End: 5pm (accounts for break)
```

**Cita clave**:
> "Creating a shift template with a start hour of 10 am and a duration of 10 hours will result in the end hour of 10 am the following day, as the company is closed at 5 pm according to the working hours."

**Observación**: Los employee shifts se CALCULAN dentro de los límites de working hours.

---

## 🔍 EN NUESTRO PROYECTO - ESTADO ACTUAL

### ✅ **Scheduling Module (Employee Shifts)**

**Ubicación**: `src/modules/scheduling/`

**YA IMPLEMENTADO:**

```typescript
// Staff Shift (Individual employee)
interface StaffShift {
  employeeId: string;
  timeSlot: { startTime, endTime };
  position: string;
  status: 'not_started' | 'checked_in' | 'on_break' | 'checked_out' | 'overtime';
  breaks: Array<{ startTime, endTime }>;
}

// Shift Tracking (Real-time)
interface ShiftTracking {
  shiftId: string;
  employeeId: string;
  checkedInAt: Timestamp;
  checkedOutAt: Timestamp;
  location: { lat, lng };
}

// Business Hours Config
interface BusinessHoursConfig {
  day_of_week: DayOfWeek;
  start_time: string; // "09:00"
  end_time: string;   // "18:00"
  is_active: boolean;
  location_id: string; // ✅ Múltiples ubicaciones soportadas
}
```

**Funcionalidades:**
- ✅ Crear shifts de empleados
- ✅ Check-in/check-out tracking
- ✅ Breaks tracking
- ✅ Labor cost calculation
- ✅ Coverage analysis
- ✅ Time-off requests
- ✅ Schedule optimization

---

### ❌ **ShiftControl Module (Operational Shift)**

**Ubicación**: `src/modules/shift-control/`

**ESTADO ACTUAL:**
- ⚠️ Arquitectura básica implementada
- ⚠️ Store creado
- ⚠️ Event handlers creados
- ❌ **LÓGICA CENTRAL NO DEFINIDA**

**LO QUE FALTA:**

```typescript
// Operational Shift (Business state)
interface OperationalShift {
  // NO confundir con StaffShift!
  id: string;
  type: 'morning' | 'afternoon' | 'evening' | 'night' | 'full_day';
  openedAt: Timestamp;
  closedAt: Timestamp | null;

  // Referencias a recursos
  openedBy: UserId;
  closedBy: UserId | null;

  // Estado consolidado
  cashSessionId: string | null;
  staffShifts: Array<StaffShift['id']>; // Referencias

  // Validaciones
  closeBlockers: CloseBlocker[];

  // Summary
  summary?: {
    totalSales: number;
    laborCost: number;
    activeStaffPeak: number;
    // ...
  };
}
```

---

## 🎯 RELACIÓN ENTRE AMBOS CONCEPTOS

### Diagrama de Relación

```
┌─────────────────────────────────────────────────────┐
│ OPERATIONAL SHIFT (Business)                        │
│ Estado: ABIERTO (9:00 AM - 11:00 PM)                │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Cash Session │  │ Staff Shifts │  │ Materials │ │
│  │ $5,000 float │  │ 5 activos    │  │ Snapshot  │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│                                                      │
│  Employee Shifts (dentro del operational shift):    │
│  ├─ John:  10:00 AM - 6:00 PM  [✅ checked_out]     │
│  ├─ Mary:   2:00 PM - 10:00 PM [🟢 checked_in]      │
│  ├─ Peter:  5:00 PM - 11:00 PM [🟢 checked_in]      │
│  └─ Lisa:   9:00 AM - 5:00 PM  [✅ checked_out]     │
│                                                      │
│  Close Blockers:                                     │
│  ├─ ❌ Cash session no cerrada                       │
│  ├─ ❌ 2 mesas abiertas                              │
│  └─ ⚠️ 3 deliveries en ruta (warning)               │
│                                                      │
│ [Cerrar Turno] ← DESHABILITADO                       │
└─────────────────────────────────────────────────────┘
```

### Flujo de Interacción

```
1. Manager abre OPERATIONAL SHIFT (9:00 AM)
   ├─ ShiftControl.openShift()
   ├─ Emite: 'shift.opened'
   └─ Estado: isOperational = true

2. Empleados hacen check-in (sus EMPLOYEE SHIFTS)
   ├─ John clock-in (10:00 AM)
   ├─ Scheduling.checkIn(johnId)
   ├─ Emite: 'staff.employee.checked_in'
   └─ ShiftControl ESCUCHA y actualiza count

3. Durante el día:
   ├─ Multiple employee shifts se crean/terminan
   ├─ Cash session se abre/cierra (puede haber varias)
   └─ ShiftControl CONSOLIDA el estado

4. Manager intenta cerrar OPERATIONAL SHIFT (11:00 PM)
   ├─ ShiftControl.closeShift()
   ├─ VALIDA close blockers:
   │  ├─ ¿Cash sessions cerradas? NO → ❌ Blocker
   │  ├─ ¿Mesas cerradas? NO → ❌ Blocker
   │  └─ ¿Employee shifts cerrados? SÍ → ✅ OK
   ├─ Si HAY blockers → RECHAZA cierre
   └─ Si NO hay blockers → CIERRA + emite 'shift.closed'
```

---

## 🏗️ ARQUITECTURA PROPUESTA

### Principio de Diseño

**ShiftControl NO DUPLICA lógica de Scheduling**

```typescript
// ❌ MAL: ShiftControl manejando employee shifts
shiftControl.createEmployeeShift(employeeId, timeSlot);

// ✅ BIEN: ShiftControl CONSUME de Scheduling
const activeShifts = await schedulingModule.getActiveShifts();
shiftControl.updateStaffCount(activeShifts.length);
```

### Separación de Responsabilidades

| Responsabilidad | Módulo | Ejemplo |
|----------------|--------|---------|
| **Business State** | ShiftControl | Restaurant open/closed |
| **Cash Management** | Cash Module | Cash sessions, arqueo |
| **Staff Scheduling** | Scheduling Module | Employee shifts, check-in/out |
| **Time Tracking** | Scheduling Module | Breaks, overtime |
| **Labor Costs** | Scheduling Module | Hourly rates, cost calc |
| **Coverage** | Scheduling Module | Understaffed alerts |
| **Close Validation** | ShiftControl | Validate all modules ready |
| **Consolidated State** | ShiftControl | Aggregate indicators |

---

## 💡 RESPUESTAS A LAS DECISIONES DEL PLAN

### 1. ¿Cash session automática o manual?

**RECOMENDACIÓN: Manual (con opción de auto en settings)**

**Por qué:**
- Toast y Square: Manual explícito
- Permite flexibility (pagos solo digitales)
- Usuario controla momento exacto de apertura
- Security: Opening float debe ser consciente

**Implementación:**
```typescript
// Modal al abrir operational shift
<Checkbox>Abrir caja con fondo inicial</Checkbox>
```

---

### 2. ¿Turno operativo automático o manual?

**RECOMENDACIÓN: Manual (botón "Abrir Turno")**

**Por qué:**
- Todos los sistemas (Toast, Square, Odoo): Apertura manual
- Permite preparación previa (setup, stock check)
- Cierre es consciente (no automático)
- Momento claro de inicio de operaciones

**Futuro**: Configurar horario sugerido (ej: "Usualmente abres a las 9am")

---

### 3. ¿Staff check-in independiente?

**RECOMENDACIÓN: Independiente (puede entrar sin operational shift abierto)**

**Por qué:**
- Empleados llegan temprano para preparación
- Setup tasks antes de abrir al público
- Flexibility para pre-opening tasks
- Scheduling es INDEPENDIENTE de operational state

**Validación**:
- Si employee check-in SIN operational shift → Warning (no error)
- "Recordatorio: Turno operativo aún no abierto"

---

### 4. ¿Múltiples operational shifts por día?

**PREGUNTA PARA EL USUARIO:**

Algunos negocios tienen múltiples "turnos operativos":
- Restaurante: Lunch shift (11am-3pm), Dinner shift (6pm-11pm)
- Retail: Morning shift (9am-2pm), Afternoon shift (2pm-9pm)

**OPCIONES:**

A) **Single operational shift** (Todo el día)
   - Un solo "Abrir Turno" al inicio del día
   - Un solo "Cerrar Turno" al final
   - Más simple

B) **Multiple operational shifts** (Por servicio)
   - "Abrir Lunch Shift" + "Cerrar Lunch Shift"
   - "Abrir Dinner Shift" + "Cerrar Dinner Shift"
   - Más complejo pero más preciso

**¿Qué prefiere el usuario?**

---

### 5. ¿Relación con BusinessHoursConfig?

**PROPUESTA:**

```typescript
// BusinessHoursConfig define CUÁNDO PUEDE operar
const businessHours = {
  monday: { enabled: true, start: '09:00', end: '22:00' }
};

// OperationalShift define CUÁNDO ESTÁ OPERANDO
const shift = {
  openedAt: '09:15', // Dentro de business hours
  closedAt: '21:45'  // Dentro de business hours
};

// VALIDACIÓN:
if (shiftOpen < businessHours.start) {
  warning('Abriendo antes del horario configurado');
}
```

**Uso:**
- BusinessHours = "Horario permitido"
- OperationalShift = "Horario real de operación"
- Pueden diferir (ej: abrir tarde por feriado)

---

## 🎯 ARQUITECTURA FINAL PROPUESTA

### Event Flow

```typescript
// 1. Manager abre operational shift
ShiftControl.openShift()
  ├─ Valida business hours
  ├─ Opcional: Auto-open cash session
  ├─ Emite: 'shift.opened'
  └─ Estado: isOperational = true

// 2. Módulos reaccionan
eventBus.on('shift.opened', () => {
  CashModule.showOpenCashButton(); // Si no auto-opened
  SchedulingModule.loadTodayShifts();
  MaterialsModule.takeSnapshot();
});

// 3. Durante operación
Scheduling.checkIn(employeeId)
  ├─ Emite: 'staff.employee.checked_in'
  └─ ShiftControl actualiza: activeStaffCount++

// 4. Manager cierra operational shift
ShiftControl.closeShift()
  ├─ Query close blockers:
  │  ├─ CashModule.hasPendingCash() → ❌ Blocker
  │  ├─ TablesModule.hasOpenTables() → ❌ Blocker
  │  └─ Scheduling.hasActiveShifts() → ✅ OK (no blocker)
  ├─ Si blockers → RECHAZA
  └─ Si OK → Emite: 'shift.closed' + summary
```

### Store Structure

```typescript
// ShiftControl Store (Orchestrator)
interface ShiftState {
  // Operational shift (NOT employee shift!)
  isOperational: boolean;
  shiftOpenedAt: Timestamp | null;

  // Consolidated indicators (from other modules)
  cashSession: CashSession | null; // De cash-management
  activeStaffCount: number;        // De scheduling
  lowStockAlerts: number;          // De materials
  openTablesCount: number;         // De tables (si aplica)

  // Close validation
  closeBlockers: CloseBlocker[];

  // NO INCLUIR:
  // - staffShifts (vive en Scheduling)
  // - businessHours (vive en Settings)
  // - laborCosts (vive en Scheduling)
}
```

---

## 📚 FUENTES CONSULTADAS

### Documentación de Productos Reales

1. [Toast POS - Shift Review](https://doc.toasttab.com/doc/platformguide/platformCompletingShiftReview.html)
2. [Square - Close of Day Procedures](https://squareup.com/help/us/en/article/6566-customize-your-closing-procedures-with-square-for-restaurants)
3. [Toast - Restaurant Opening/Closing Checklist](https://pos.toasttab.com/resources/restaurant-opening-closing-checklist)
4. [Odoo 18 - Planning Module](https://www.odoo.com/documentation/18.0/applications/services/planning.html)
5. [Toast vs Square Comparison 2025](https://technologyadvice.com/blog/sales/toast-vs-square/)

### Módulos Internos Analizados

- `src/modules/scheduling/types/schedulingTypes.ts`
- `src/modules/scheduling/manifest.tsx`
- `src/modules/scheduling/components/BusinessHoursConfig.tsx`

---

## ✅ CONCLUSIONES

### 1. **Conceptos Bien Separados**

✅ **Operational Shift** (ShiftControl) ≠ **Employee Shift** (Scheduling)

### 2. **NO Duplicar Lógica**

✅ Scheduling ya maneja employee shifts perfectamente
✅ ShiftControl CONSUME, no reimplementa

### 3. **Arquitectura Clara**

```
ShiftControl (Orchestrator)
├─ Operational state (open/close business)
├─ Validates modules ready to close
├─ Consolidates indicators
└─ Emits coordination events

Scheduling Module (Domain Expert)
├─ Employee shifts (individual)
├─ Check-in/out tracking
├─ Labor cost calculation
└─ Coverage analysis
```

### 4. **Próximos Pasos**

1. ✅ Usuario decide: ¿Single o multiple operational shifts por día?
2. Implementar openShift() / closeShift() lógica
3. Implementar close blockers dinámicos
4. UI del widget según decisiones
5. Testing de interacciones cross-module

---

**Estado**: ✅ RESEARCH COMPLETE - READY FOR DECISIONS
**Autor**: Investigation by Claude Code
**Fecha**: 2025-12-04
