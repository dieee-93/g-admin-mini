# ShiftControl - Plan de Ejecución Concreto

**Fecha**: 2025-12-04
**Estado**: ✅ APPROVED - Multiple Shifts Architecture (Opción B)
**Propósito**: Definir QUÉ, CÓMO, CUÁNDO construir ShiftControl
**Decisión**: Múltiples operational shifts por día (lunch, dinner, etc.)

---

## 🎯 PROBLEMA IDENTIFICADO

**Situación actual**:
- ✅ Arquitectura teórica completa
- ✅ Módulo shift-control implementado
- ✅ Widgets de indicadores creados (Cash, Staff, Materials)
- ❌ **NO HAY plan de diseño UI/UX**
- ❌ **NO HAY definición de flujos de usuario**
- ❌ **NO HAY especificación de comportamiento automático**

---

## 📐 DISEÑO UI - PROPUESTA

### Estructura del Widget

```
┌─────────────────────────────────────────────────────────────┐
│ 🕐 Control de Turno              [Badge: OPERATIVO/CERRADO] │
│ Iniciado: 08:30 AM                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 📊 ESTADO ACTUAL (INDICADORES)                              │
│ ┌──────────────────┐ ┌──────────────────┐ ┌────────────┐  │
│ │ 💰 Caja: $5,230  │ │ 👥 5 empleados   │ │ ⚠️ 3 alerts │  │
│ │ [Abierta]        │ │ activos          │ │ de stock    │  │
│ └──────────────────┘ └──────────────────┘ └────────────┘  │
│                                                              │
│ (Más indicadores se inyectan dinámicamente según módulos)   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ⚡ ACCIONES RÁPIDAS                                          │
│ [Abrir Caja] [Registrar Entrada] [Ver Alertas]             │
│                                                              │
│ (Botones se inyectan según módulos activos)                 │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 🚨 ALERTAS Y PENDIENTES (solo si hay)                       │
│ ⚠️ Stock bajo en 3 materiales                               │
│ ❌ CIERRE BLOQUEADO: Hay 2 mesas abiertas                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ [Cerrar Turno] ← Deshabilitado si hay blockers              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Secciones del Widget

1. **Header** (Card.Header)
   - Icono de reloj + estado (Operativo/Cerrado)
   - Timestamp de apertura
   - Badge de estado (verde/gris)

2. **Indicadores** (HookPoint: `shift-control.indicators`)
   - Grid de cards pequeños
   - Cada módulo inyecta SU indicador
   - Orden por priority (90, 85, 70...)

3. **Acciones Rápidas** (HookPoint: `shift-control.quick-actions`)
   - Botones horizontales
   - Core actions: Abrir/Cerrar Turno
   - Módulos inyectan acciones adicionales

4. **Alertas** (HookPoint: `shift-control.alerts`)
   - Solo se muestra si hay alerts/blockers
   - Lista de warnings/errors
   - Close blockers destacados

5. **Footer** (Card.Footer)
   - Botón principal "Cerrar Turno"
   - Deshabilitado si hay blockers

---

## 🎬 FLUJOS DE USUARIO

### Flujo 1: Abrir Turno (Primera Interacción del Día)

**OPCIÓN A: Manual (RECOMENDADO para MVP)**

```
1. Usuario llega al dashboard
   ├─ Widget muestra: Badge "CERRADO", botón "Abrir Turno"
   └─ NO hay indicadores visibles

2. Usuario hace click en "Abrir Turno"
   ├─ Modal de confirmación: "¿Abrir turno operativo?"
   │  └─ Checkbox: "Abrir caja con fondo inicial" (si sales_pos activo)
   └─ Usuario confirma

3. ShiftControl ejecuta openShift()
   ├─ Actualiza shiftStore: isOperational = true
   ├─ Emite evento: eventBus.emit('shift.opened')
   └─ Logging: "Shift opened at 08:30 AM"

4. Módulos reaccionan al evento 'shift.opened'
   ├─ Cash Module: Si checkbox marcado → abre cash session
   ├─ Staff Module: Muestra botón "Registrar entrada"
   └─ Materials Module: Toma snapshot de inventario

5. Widget se actualiza
   ├─ Badge cambia a "OPERATIVO" (verde)
   ├─ Indicadores aparecen (inyectados por módulos)
   └─ Quick actions disponibles
```

**OPCIÓN B: Automático (Futuro)**
- Detectar primer empleado que hace check-in
- Auto-abrir turno
- Preguntar si abrir caja

**DECISIÓN**: ¿Manual o Automático?

---

### Flujo 2: Durante el Turno (Operación Normal)

```
1. Widget muestra estado consolidado
   ├─ Indicadores se actualizan en tiempo real
   │  ├─ Cash: saldo actualizado con cada venta
   │  ├─ Staff: count cuando alguien entra/sale
   │  └─ Materials: alerts cuando stock bajo
   └─ Alertas aparecen si hay problemas

2. Usuario puede usar Quick Actions
   ├─ "Abrir Caja" (si cerrada)
   ├─ "Registrar Entrada" (staff check-in)
   └─ Etc. (módulos inyectan más)

3. Close Blockers se agregan automáticamente
   ├─ Caja abierta → blocker
   ├─ Mesas abiertas → blocker
   └─ Deliveries en ruta → warning (no blocker)
```

---

### Flujo 3: Cerrar Turno (Fin del Día)

```
1. Usuario hace click en "Cerrar Turno"
   ├─ Si HAY BLOCKERS → Modal de error
   │  └─ "No puedes cerrar turno:"
   │      - ❌ Hay 2 mesas abiertas
   │      - ❌ Caja no cerrada
   │      - ⚠️ 3 deliveries en ruta (warning)
   │  └─ [Aceptar] (volver y resolver)
   │
   └─ Si NO HAY BLOCKERS → Modal de confirmación
       └─ "¿Cerrar turno operativo?"
       └─ Resumen:
           - Ventas del día: $12,340
           - Personal activo: 5
           - Mermas detectadas: $120
       └─ [Cancelar] [Confirmar Cierre]

2. Usuario confirma
   ├─ ShiftControl ejecuta closeShift()
   ├─ Emite evento: eventBus.emit('shift.closing')
   └─ Módulos procesan cierre

3. Validaciones automáticas
   ├─ Cash Module: Verifica arqueo hecho
   ├─ Materials Module: Toma snapshot final
   └─ Staff Module: Check-out automático de activos

4. ShiftControl cierra
   ├─ Emite evento: eventBus.emit('shift.closed', summary)
   ├─ Actualiza store: isOperational = false
   └─ Logging: "Shift closed at 08:30 PM"

5. Widget se actualiza
   ├─ Badge cambia a "CERRADO" (gris)
   ├─ Indicadores desaparecen
   └─ Solo botón "Abrir Turno" visible
```

---

## 🔧 COMPORTAMIENTO AUTOMÁTICO - DECISIONES

### ❓ Pregunta 1: ¿Cash Session se abre automáticamente?

**OPCIÓN A: Manual Explícito (RECOMENDADO)**
- ✅ Usuario decide cuándo abrir caja
- ✅ Puede trabajar sin caja (ej: solo reservas online)
- ✅ Mayor control y seguridad
- ❌ Requiere un paso extra

**OPCIÓN B: Automático al Abrir Turno**
- ✅ Más rápido
- ❌ Menos flexible (obliga a tener caja)
- ❌ ¿Qué pasa si solo hay pagos digitales?

**DECISIÓN**: ¿A o B?

---

### ❓ Pregunta 2: ¿Turno se abre automáticamente?

**OPCIÓN A: Manual (botón "Abrir Turno")**
- ✅ Control explícito
- ✅ Momento claro de inicio
- ✅ Permite preparación previa

**OPCIÓN B: Automático (primer evento operacional)**
- ✅ Más natural
- ❌ Poco control sobre momento exacto
- ❌ Difícil de testear

**DECISIÓN**: ¿A o B?

---

### ❓ Pregunta 3: ¿Qué pasa con Staff Check-in?

**OPCIÓN A: Independiente (staff puede entrar sin turno abierto)**
- ✅ Flexible (personal llega antes de abrir)
- ✅ Check-ins se registran igualmente
- ❌ Puede confundir

**OPCIÓN B: Requiere Turno Abierto**
- ✅ Más estructurado
- ❌ Inflexible

**DECISIÓN**: ¿A o B?

---

## 📋 WIDGETS - PLAN DE INYECCIÓN

### Widgets YA Creados ✅

1. **CashSessionIndicator** (`cash-management/widgets/`)
   - Props: `{ cashSession }`
   - Muestra: Saldo actual, badge "Abierta"
   - Priority: 90

2. **StaffIndicator** (`staff/widgets/`)
   - Props: `{ activeStaffCount, scheduledStaffCount }`
   - Muestra: "5 empleados / 7"
   - Priority: 85

3. **StockAlertIndicator** (`materials/widgets/`)
   - Props: `{ lowStockAlerts }`
   - Muestra: "⚠️ 3 alertas de stock"
   - Priority: 70

### Widgets FALTANTES ❌

4. **TablesIndicator** (si `onsite_service` activo)
   - Props: `{ openTablesCount, totalTablesCount }`
   - Muestra: "🍽️ 3 mesas / 12"
   - Priority: 80

5. **DeliveriesIndicator** (si `delivery_shipping` activo)
   - Props: `{ activeDeliveriesCount }`
   - Muestra: "🚚 5 deliveries en ruta"
   - Priority: 75

6. **AppointmentsIndicator** (si `professional_services` activo)
   - Props: `{ upcomingAppointmentsCount, completedToday }`
   - Muestra: "📅 8 citas / 12 completadas"
   - Priority: 82

### Orden de Aparición (por priority)

```
[CashSession: 90] [StaffIndicator: 85] [AppointmentsIndicator: 82]
[TablesIndicator: 80] [DeliveriesIndicator: 75] [StockAlerts: 70]
```

---

## ⚡ QUICK ACTIONS - PLAN DE INYECCIÓN

### Core Actions (ShiftControl Widget)

1. **Abrir Turno** (si turno cerrado)
   - Botón principal verde
   - Abre modal de confirmación

2. **Cerrar Turno** (si turno abierto)
   - Botón principal rojo
   - Deshabilitado si blockers
   - Tooltip muestra blockers

### Module Actions (Inyectados)

3. **Abrir Caja** (Cash Module)
   - Si caja cerrada Y turno abierto
   - Priority: 90

4. **Registrar Entrada** (Staff Module)
   - Abre modal de check-in
   - Priority: 85

5. **Ver Inventario** (Materials Module)
   - Link rápido a página de materials
   - Priority: 70

6. **Ver Mesas** (Tables Module - si aplica)
   - Link a vista de mesas
   - Priority: 80

---

## 🚨 CLOSE BLOCKERS - VALIDACIONES DINÁMICAS

### Blocker Automáticos por Capability

```typescript
interface CloseBlocker {
  reason: string;              // ID único
  message: string;             // Mensaje usuario
  capability: FeatureId;       // Feature que lo causa
  canOverride: boolean;        // ¿Puede forzar cierre?
  module: string;              // Módulo responsable
}
```

### Ejemplo: physical_products

```typescript
// Al detectar caja abierta
shiftStore.addCloseBlocker({
  reason: 'cash_session_open',
  message: 'Caja no cerrada - Falta arqueo',
  capability: 'sales_pos',
  canOverride: false,
  module: 'cash-management'
});

// Al detectar mesas abiertas
shiftStore.addCloseBlocker({
  reason: 'tables_open_count_2',
  message: '2 mesas abiertas - Cerrar antes de finalizar turno',
  capability: 'sales_pos',
  canOverride: false,
  module: 'tables'
});
```

### Lista Completa de Blockers

| Capability | Blocker | Blocking | Módulo |
|------------|---------|----------|--------|
| `sales_pos` | Cash session abierta | ✅ Sí | cash-management |
| `sales_pos` | Mesas abiertas | ✅ Sí | tables |
| `sales_pos` | Inventario no contado | ✅ Sí | materials |
| `delivery_shipping` | Deliveries en ruta | ⚠️ Warning | fulfillment |
| `asset_rental` | Devoluciones pendientes | ✅ Sí | assets |
| `professional_services` | Citas sin completar | ⚠️ Warning | scheduling |

---

## 🔄 ESTADOS DEL WIDGET

### Estado 1: Turno Cerrado (Inicial)

```tsx
isOperational: false

UI:
- Badge: "CERRADO" (gris)
- Indicadores: NO se muestran
- Quick Actions: Solo "Abrir Turno"
- Alerts: Vacío
- Footer: Botón "Abrir Turno" (verde, enabled)
```

### Estado 2: Turno Abierto (Operando)

```tsx
isOperational: true
cashSession: { id: 123, balance: 5230 }
activeStaffCount: 5
lowStockAlerts: 3

UI:
- Badge: "OPERATIVO" (verde)
- Indicadores: Se muestran (3+ widgets)
- Quick Actions: "Abrir Caja", "Registrar Entrada", etc.
- Alerts: Muestra si hay (3 alertas de stock)
- Footer: Botón "Cerrar Turno" (enabled si no blockers)
```

### Estado 3: Turno con Blockers (No puede cerrar)

```tsx
isOperational: true
closeBlockers: [
  { reason: 'cash_open', message: 'Caja abierta' },
  { reason: 'tables_2', message: '2 mesas abiertas' }
]

UI:
- Badge: "OPERATIVO" (verde)
- Indicadores: Normales
- Quick Actions: Normales
- Alerts: ❌ Sección destacada con blockers
- Footer: Botón "Cerrar Turno" (DISABLED, tooltip con razones)
```

---

## 📦 PRIORIDADES DE IMPLEMENTACIÓN

### FASE 1: MVP Básico (3-4 horas)

1. ✅ Lógica de open/close shift
   - Implementar openShift() en store
   - Implementar closeShift() con validación de blockers
   - Modal de confirmación

2. ✅ UI básica del widget
   - Header con badge
   - Sección de indicadores (HookPoint)
   - Footer con botón cerrar

3. ✅ Integrar widgets existentes
   - Cash, Staff, Materials ya creados
   - Conectarlos vía registry.addAction()

### FASE 2: Validaciones (2-3 horas)

4. ✅ Sistema de Close Blockers
   - Lógica dinámica por capability
   - UI de alertas bloqueantes
   - Tooltip en botón deshabilitado

5. ✅ Quick Actions
   - Core actions (abrir/cerrar)
   - HookPoint para acciones inyectadas

### FASE 3: Polish (2 horas)

6. ✅ Persistencia
   - API endpoints para shifts
   - Guardar en DB: open_time, close_time, summary

7. ✅ Testing
   - Flujo completo
   - Estados del widget
   - Validaciones

---

## 🎯 DECISIONES PENDIENTES

**REQUIEREN APROBACIÓN del usuario**:

1. ❓ **Cash session**: ¿Automática o manual al abrir turno?
   - [ ] Opción A: Manual (checkbox en modal)
   - [ ] Opción B: Automática si `sales_pos` activo

2. ❓ **Staff check-in**: ¿Independiente o requiere turno abierto?
   - [ ] Opción A: Independiente
   - [ ] Opción B: Requiere turno abierto

3. ❓ **Turno automático**: ¿Se abre automáticamente?
   - [ ] Opción A: Manual (botón)
   - [ ] Opción B: Automático (primer evento)

4. ❓ **Widgets faltantes**: ¿Crear ahora o después?
   - [ ] Crear todos (Tables, Deliveries, Appointments)
   - [ ] Solo MVP (Cash, Staff, Materials)

5. ❓ **Persistencia**: ¿Guardar en DB o solo memoria?
   - [ ] DB (tabla `shifts`)
   - [ ] Memoria (solo session)

---

## 📚 REFERENCIAS

- Widgets existentes: `src/modules/*/widgets/`
- Store: `src/modules/shift-control/store/shiftStore.ts`
- Handlers: `src/modules/shift-control/handlers/`
- Docs: `docs/shift-control/SHIFT_LIFECYCLE_BY_CAPABILITY.md`

---

**Estado**: 📋 ESPERANDO DECISIONES
**Próximo paso**: Usuario aprueba decisiones → Implementar FASE 1
