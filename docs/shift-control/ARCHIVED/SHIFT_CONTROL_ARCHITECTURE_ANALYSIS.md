# 🔍 ShiftControl - Análisis Arquitectónico Profundo

**Fecha**: 2025-01-26
**Pregunta**: ¿Es `useShiftControl` el enfoque correcto según la arquitectura del proyecto?
**Estado**: 🟡 REQUIERE REDISEÑO

---

## ❓ LA PREGUNTA CORRECTA

> "¿Estamos desaprovechando parte de la arquitectura? ¿No nos estamos salteando nada? Recuerda que la app es compleja, combinable, etc."

**Respuesta corta**: **SÍ, estamos desaprovechando la arquitectura**.

---

## 🏗️ ARQUITECTURA REAL DEL PROYECTO

### Patrones Descubiertos

El proyecto tiene **4 patrones de integración cross-module**:

#### 1️⃣ **Hook Points** (UI Extension)
```typescript
// Para inyectar UI en otros componentes
<HookPoint name="sales.toolbar.actions" data={orderData} />
```

#### 2️⃣ **EventBus** (Data Communication) ⭐
```typescript
// Para comunicación entre módulos
eventBus.emit('sales.order_placed', { orderId }, { priority: HIGH });
eventBus.subscribe('sales.order_placed', handler, { moduleId: 'fulfillment' });
```

#### 3️⃣ **Shared Stores** (State Access)
```typescript
// Para acceder a estado compartido
const { materials } = useMaterialsStore();
```

#### 4️⃣ **Module Exports API** (Direct Access)
```typescript
// Para acceder a hooks/services de otros módulos
const module = registry.getExports('staff');
const { useEmployeesList } = module.hooks;
```

---

## 🚨 PROBLEMA CON `useShiftControl` (enfoque original)

### ❌ **Lo que propusimos**

```typescript
// Hook que consume directamente otros módulos
function useShiftControl() {
  const cashModule = registry.getExports('cash-management');
  const staffModule = registry.getExports('staff');
  const schedulingModule = registry.getExports('scheduling');

  // Consumir todos directamente...
  return {
    cashSession,
    staff,
    shifts
  };
}
```

### ❌ **Por qué está MAL**

1. **Acoplamiento Fuerte**: El widget conoce y depende de 3+ módulos directamente
2. **No usa EventBus**: Los módulos YA emiten eventos que NO estamos consumiendo
3. **Lógica de Coordinación en UI**: Mixing business logic con presentación
4. **No es Escalable**: Si agregamos más módulos (delivery, mobile), tenemos que modificar el hook
5. **Rompe Separation of Concerns**: El widget debería reaccionar a eventos, no orquestar módulos

---

## ✅ ARQUITECTURA CORRECTA - EventBus Driven

### Concepto: **ShiftControl NO orquesta, REACCIONA**

En lugar de que ShiftControl "jale" datos de múltiples módulos, debería:
1. **Escuchar eventos** del sistema
2. **Mantener su propio estado** local
3. **Emitir eventos** cuando el usuario interactúa

---

## 🎯 REDISEÑO PROPUESTO

### Opción A: **ShiftControl como Módulo** (RECOMENDADO)

```
src/modules/shift-control/
├── manifest.tsx           ← Módulo dedicado
├── services/
│   └── shiftService.ts    ← Lógica de negocio
├── store/
│   └── shiftStore.ts      ← Estado del turno
├── components/
│   └── ShiftControlWidget.tsx
└── hooks/
    └── useShiftState.ts   ← Hook local (NO orquestador)
```

**Manifest**:
```typescript
export const shiftControlManifest: ModuleManifest = {
  id: 'shift-control',
  name: 'Shift Control',
  version: '1.0.0',

  depends: ['cash-management', 'staff', 'scheduling'],

  hooks: {
    // Lo que EMITE
    provide: [
      'shift.opened',
      'shift.closed',
      'shift.status_changed'
    ],

    // Lo que CONSUME (vía EventBus)
    consume: [
      'cash.session.opened',      // Cash module
      'cash.session.closed',
      'staff.employee.checked_in', // Staff module
      'staff.employee.checked_out',
      'scheduling.shift.started',  // Scheduling module
      'scheduling.shift.ended'
    ]
  },

  setup: async (registry) => {
    const { eventBus } = await import('@/lib/events');
    const { shiftStore } = await import('./store/shiftStore');

    // ============================================
    // REACCIONAR a eventos de Cash Module
    // ============================================
    eventBus.subscribe(
      'cash.session.opened',
      (event) => {
        shiftStore.setState({
          cashSession: event.payload,
          isOperational: true
        });
      },
      { moduleId: 'shift-control' }
    );

    eventBus.subscribe(
      'cash.session.closed',
      (event) => {
        shiftStore.setState({
          cashSession: null,
          isOperational: false
        });
      },
      { moduleId: 'shift-control' }
    );

    // ============================================
    // REACCIONAR a eventos de Staff Module
    // ============================================
    eventBus.subscribe(
      'staff.employee.checked_in',
      (event) => {
        const currentActive = shiftStore.getState().activeStaffCount;
        shiftStore.setState({
          activeStaffCount: currentActive + 1
        });
      },
      { moduleId: 'shift-control' }
    );

    eventBus.subscribe(
      'staff.employee.checked_out',
      (event) => {
        const currentActive = shiftStore.getState().activeStaffCount;
        shiftStore.setState({
          activeStaffCount: currentActive - 1
        });
      },
      { moduleId: 'shift-control' }
    );

    // ============================================
    // REACCIONAR a eventos de Scheduling Module
    // ============================================
    eventBus.subscribe(
      'scheduling.shift.started',
      (event) => {
        shiftStore.setState({
          currentShift: event.payload.shift
        });
      },
      { moduleId: 'shift-control' }
    );

    // Registrar widget en Dashboard
    registry.addAction(
      'dashboard.widgets',
      () => <ShiftControlWidget />,
      'shift-control',
      100 // Highest priority
    );
  },

  exports: {
    // Para otros módulos que necesiten saber estado del turno
    getShiftStatus: () => {
      return shiftStore.getState().isOperational;
    }
  }
};
```

**Store** (Zustand):
```typescript
// src/modules/shift-control/store/shiftStore.ts
import { create } from 'zustand';

interface ShiftState {
  // Datos reactivos del turno
  isOperational: boolean;
  cashSession: CashSessionRow | null;
  activeStaffCount: number;
  scheduledStaffCount: number;
  currentShift: Shift | null;

  // Acciones
  updateCashSession: (session: CashSessionRow | null) => void;
  updateStaffCount: (active: number, scheduled: number) => void;
}

export const useShiftStore = create<ShiftState>((set) => ({
  isOperational: false,
  cashSession: null,
  activeStaffCount: 0,
  scheduledStaffCount: 0,
  currentShift: null,

  updateCashSession: (session) => set({ cashSession: session }),
  updateStaffCount: (active, scheduled) => set({
    activeStaffCount: active,
    scheduledStaffCount: scheduled
  })
}));
```

**Widget** (Simple):
```typescript
// src/modules/shift-control/components/ShiftControlWidget.tsx
import { useShiftStore } from '../store/shiftStore';

export function ShiftControlWidget() {
  // ✅ Solo consume su propio store
  const {
    isOperational,
    cashSession,
    activeStaffCount,
    scheduledStaffCount
  } = useShiftStore();

  const handleOpenShift = async () => {
    // Llamar al service (que emitirá eventos)
    await shiftService.openShift();
  };

  return (
    <Box>
      <Badge colorPalette={isOperational ? 'green' : 'red'}>
        {isOperational ? 'Operativo' : 'Cerrado'}
      </Badge>

      {cashSession && (
        <Text>Cash: ${cashSession.starting_cash}</Text>
      )}

      <Text>Staff: {activeStaffCount}/{scheduledStaffCount}</Text>

      <Button onClick={handleOpenShift}>
        {isOperational ? 'Cerrar Turno' : 'Abrir Turno'}
      </Button>
    </Box>
  );
}
```

**Service** (Emite eventos):
```typescript
// src/modules/shift-control/services/shiftService.ts
import { eventBus } from '@/lib/events';

export const shiftService = {
  openShift: async () => {
    // 1. Abrir cash session (si aplica)
    const cashModule = registry.getExports('cash-management');
    const session = await cashModule.services.openCashSession(/* ... */);

    // 2. Emitir evento de turno abierto
    await eventBus.emit('shift.opened', {
      timestamp: new Date().toISOString(),
      cashSessionId: session?.id
    }, 'shift-control');

    // 3. El store se actualizará automáticamente al escuchar eventos
  },

  closeShift: async () => {
    // Similar...
    await eventBus.emit('shift.closed', {
      timestamp: new Date().toISOString()
    }, 'shift-control');
  }
};
```

---

### ✅ **Ventajas del Rediseño**

| Aspecto | Hook Orquestador ❌ | EventBus Driven ✅ |
|---------|---------------------|-------------------|
| **Acoplamiento** | Fuerte (depende de 3+ módulos) | Débil (solo escucha eventos) |
| **Escalabilidad** | Difícil (agregar módu los = modificar hook) | Fácil (nuevos módulos emiten eventos) |
| **Testeable** | Difícil (mock 3+ módulos) | Fácil (mock eventBus) |
| **Separation of Concerns** | Lógica mezclada | Lógica separada |
| **Performance** | Hook recalcula todo | Store solo actualiza lo necesario |
| **Real-time** | Polling/manual | Event-driven automático |
| **Mantenibilidad** | Baja (código complejo) | Alta (código simple) |

---

## 🔄 FLUJO CORRECTO - Event-Driven

### Ejemplo: Abrir Turno

```
Usuario click "Abrir Turno"
  ↓
ShiftControlWidget.handleOpenShift()
  ↓
shiftService.openShift()
  ├─ 1. Llamar cashModule.services.openCashSession()
  │    ↓
  │    Cash Service abre sesión en DB
  │    ↓
  │    Cash Service emite: eventBus.emit('cash.session.opened')
  │    ↓
  │    ShiftControl escucha evento
  │    ↓
  │    ShiftStore se actualiza (cashSession = session)
  │
  ├─ 2. Emitir: eventBus.emit('shift.opened')
  │    ↓
  │    Dashboard escucha evento
  │    ↓
  │    Dashboard muestra notificación
  │
  └─ Widget se re-renderiza automáticamente (Zustand)
```

**Sin polling, sin orquestación manual, sin acoplamiento.**

---

## 📋 EVENTOS QUE DEBEMOS CONSUMIR

### Cash Module (Ya emite)

```typescript
// src/modules/cash-management/manifest.tsx
hooks: {
  provide: [
    'cash.session.opened',     // ✅ Ya existe
    'cash.session.closed',     // ✅ Ya existe
    'cash.discrepancy.detected' // ✅ Ya existe
  ]
}
```

### Staff Module (Necesita agregar)

```typescript
// ❌ FALTA: Staff NO emite eventos de check-in/check-out
// ✅ ACCIÓN: Agregar en Staff service

// src/modules/staff/services/staffService.ts
export async function checkInEmployee(employeeId: string) {
  // Update DB
  await supabase.from('employees').update({ checked_in: true });

  // ✅ AGREGAR: Emitir evento
  await eventBus.emit('staff.employee.checked_in', {
    employeeId,
    timestamp: new Date().toISOString()
  }, 'staff');
}
```

### Scheduling Module (Revisar)

```typescript
// ❓ VERIFICAR: Si Scheduling emite eventos de shift start/end
// Si NO, agregar similar a Staff
```

---

## 🎯 DECISIÓN ARQUITECTÓNICA

### ❌ **Rechazar**: Hook Orquestador

```typescript
// NO IMPLEMENTAR ESTO
function useShiftControl() {
  // Consume múltiples módulos directamente
  // Acoplamiento fuerte
  // Difícil de mantener
}
```

### ✅ **Aprobar**: ShiftControl como Módulo Event-Driven

```typescript
// SÍ IMPLEMENTAR ESTO
src/modules/shift-control/
├── manifest.tsx        → EventBus subscriptions
├── store/shiftStore.ts → Estado reactivo
├── services/           → Emite eventos
└── components/         → UI simple
```

---

## 📐 COMPARACIÓN DE ENFOQUES

### Enfoque Original (Hook Orquestador)

```typescript
// ❌ Malo
function useShiftControl() {
  const cashData = useCashModule();      // Depende de Cash
  const staffData = useStaffModule();     // Depende de Staff
  const schedData = useSchedulingModule(); // Depende de Scheduling

  // Coordinar todo manualmente
  const isOperational = cashData.session && staffData.active > 0;

  return { isOperational, ... };
}

// Problemas:
// 1. Widget sabe CÓMO funcionan 3 módulos
// 2. Si Staff cambia su API, rompe ShiftControl
// 3. Si agregamos Delivery, modificar hook
// 4. Testing requiere mock de 3 módulos
```

### Enfoque Event-Driven (Módulo)

```typescript
// ✅ Bueno
function ShiftControlWidget() {
  const { isOperational, cashSession, activeStaff } = useShiftStore();

  // Widget solo reacciona a su store
  // NO sabe de dónde vienen los datos
  // Store se actualiza vía eventos

  return <UI />;
}

// Ventajas:
// 1. Widget NO conoce otros módulos
// 2. Cambios en Staff NO afectan ShiftControl
// 3. Nuevos módulos solo emiten eventos
// 4. Testing solo mock eventBus
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN CORRECTO

### Fase 1: Crear Módulo ShiftControl (2 días)

1. **Crear estructura de módulo**
   ```
   src/modules/shift-control/
   ├── manifest.tsx
   ├── store/shiftStore.ts
   ├── services/shiftService.ts
   ├── components/ShiftControlWidget.tsx
   └── types.ts
   ```

2. **Implementar Store (Zustand)**
   - Estado del turno
   - Getters/Setters

3. **Implementar Manifest**
   - EventBus subscriptions
   - Widget registration

4. **Implementar Service**
   - openShift() → Emite evento
   - closeShift() → Emite evento

### Fase 2: Actualizar Módulos Existentes (1 día)

5. **Staff Module: Agregar eventos**
   - `staff.employee.checked_in`
   - `staff.employee.checked_out`

6. **Scheduling Module: Verificar eventos**
   - `scheduling.shift.started`
   - `scheduling.shift.ended`

### Fase 3: UI Components (1 día)

7. **Crear variantes de widget** (según capabilities)
   - PhysicalWidget
   - HybridWidget
   - DigitalWidget

8. **Strategy Pattern** para modos

### Fase 4: Testing (1 día)

9. **Unit tests**
   - shiftStore
   - shiftService

10. **Integration tests**
    - EventBus flow
    - Multi-module coordination

**Total**: ~5 días (vs 3-4 días del enfoque incorrecto)

---

## ✅ CRITERIOS DE VALIDACIÓN

### ¿Cómo saber que lo hicimos bien?

- [ ] ShiftControl NO tiene `import` de cash/staff/scheduling modules
- [ ] ShiftControl SOLO consume `eventBus` y su propio `store`
- [ ] Widget se actualiza automáticamente cuando otros módulos cambian
- [ ] Agregar nuevo módulo (ej: delivery) NO requiere cambios en ShiftControl
- [ ] Tests son simples (solo mock eventBus)
- [ ] Código sigue patrones de `CROSS_MODULE_INTEGRATION_MAP.md`

---

## 📚 REFERENCIAS

### Documentos del Proyecto

- `src/lib/events/EventBus.ts` - EventBus implementation
- `docs/architecture-v2/deliverables/CROSS_MODULE_INTEGRATION_MAP.md` - Patrones
- `src/modules/mobile/manifest.tsx` - Ejemplo de EventBus usage
- `src/modules/cash-management/manifest.tsx` - Eventos de Cash

### Ejemplos en el Codebase

**Módulos que YA usan EventBus correctamente**:
- Mobile Module (`mobile/manifest.tsx` líneas 90-100)
- Cash Module (`cash/services/cashSessionService.ts` líneas 92-102)
- Gamification Module (escucha eventos de todos los módulos)

---

## 🎯 RECOMENDACIÓN FINAL

**NO implementar `useShiftControl` hook orquestador.**

**SÍ implementar `shift-control` como módulo Event-Driven.**

**Razón**: La arquitectura del proyecto está diseñada para EventBus. Ignorarlo significa:
- Código más complejo
- Menos mantenible
- Acoplamiento innecesario
- No escala
- Rompe convenciones establecidas

---

**Pregunta para Diego**: ¿Procedemos con el enfoque Event-Driven (módulo) o prefieres discutir más?

---

**Documento creado por**: Claude Code
**Estado**: 🟡 Esperando decisión
**Última actualización**: 2025-01-26
