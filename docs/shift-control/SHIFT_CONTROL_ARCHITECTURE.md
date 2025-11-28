# 🎯 ShiftControl Widget - Arquitectura y Diseño

**Documento de Diseño v1.0**
**Fecha**: 2025-01-26
**Componente**: `ShiftControlWidget` (OperationalStatusWidget evolución)
**Ubicación**: Dashboard principal - Hero component

---

## 📋 ÍNDICE

1. [Visión General](#visión-general)
2. [Alcance y Responsabilidades](#alcance-y-responsabilidades)
3. [Arquitectura Basada en Capabilities](#arquitectura-basada-en-capabilities)
4. [Integraciones de Sistemas](#integraciones-de-sistemas)
5. [Quick Actions Dinámicas](#quick-actions-dinámicas)
6. [Flujos de Usuario](#flujos-de-usuario)
7. [Especificación Técnica](#especificación-técnica)
8. [Plan de Implementación](#plan-de-implementación)

---

## 🎯 VISIÓN GENERAL

### Propósito

El **ShiftControlWidget** es el componente central del Dashboard que permite a los operadores **gestionar el turno operacional actual** del negocio, incluyendo:

- **Apertura/Cierre de turno**
- **Arqueo de caja** (cash session management)
- **Control de staff activo**
- **Horarios operacionales** del negocio
- **Acciones rápidas contextuales** según capabilities activas

### Principios de Diseño

1. **Capability-Driven**: El componente se adapta dinámicamente según las capabilities del negocio
2. **Data-Driven**: Todo debe conectarse a datos reales (NO placeholders)
3. **Hook-Based**: Quick Actions inyectadas vía HookRegistry, no hardcodeadas
4. **Composable**: Módulos independientes que pueden activarse/desactivarse
5. **Progressive Disclosure**: Mostrar complejidad incremental según necesidad

---

## 🎯 ALCANCE Y RESPONSABILIDADES

### ✅ SÍ es responsabilidad del componente

- ✅ Mostrar estado operacional (Abierto/Cerrado)
- ✅ Abrir/Cerrar turno con validaciones
- ✅ Iniciar/Finalizar Cash Session (arqueo de caja)
- ✅ Mostrar staff activo vs programado
- ✅ Mostrar horarios del negocio (business hours)
- ✅ Proveer Quick Actions contextuales
- ✅ Indicar tiempo operado en el turno actual
- ✅ Alertas del turno (stock bajo, staff faltante, etc.)


### ❌ NO es responsabilidad del componente

- ❌ Gestión de empleados (eso es Staff Management page)
- ❌ Programación de horarios (eso es Scheduling page)
- ❌ Reportes contables detallados (eso es Finance/Cash page)
- ❌ Configuración de business hours (eso es Settings page)
- ❌ Análisis de ventas (eso es Sales Analytics)

---



## 🏗️ ARQUITECTURA BASADA EN CAPABILITIES

### Matriz de Capabilities vs Features

El componente debe renderizar diferentes secciones según las capabilities activas:

| Capability Activa | Features del Widget | Quick Actions Sugeridas |
|-------------------|---------------------|-------------------------|
| `onsite_service` | • Turno Mañana/Tarde/Noche<br>• Staff activo (meseros, cocina)<br>• Mesas abiertas<br>• Business hours | • Nueva Venta Dine-in<br>• Ver Mesas<br>• Asignar Mesa |
| `pickup_orders` | • Horario de Pickup<br>• Órdenes pendientes para retirar<br>• Staff de mostrador | • Nueva Orden Pickup<br>• Ver Pedidos Pendientes |
| `delivery_shipping` | • Horario de Delivery<br>• Deliveries en curso<br>• Drivers activos | • Nueva Orden Delivery<br>• Ver Rutas |
| `physical_products` | • Cash Session activa<br>• Arqueo de caja<br>• Ventas en efectivo del turno | • Abrir Caja<br>• Cerrar Caja<br>• Arqueo |
| `professional_services` | • Appointments del día<br>• Profesionales activos<br>• Horarios de atención | • Nuevo Appointment<br>• Ver Calendario |
| `mobile_operations` | • Ubicación actual<br>• Ruta planificada<br>• Inventario disponible | • Actualizar Ubicación<br>• Ver Inventario Móvil |
| `online_store` | • Tienda online status (24/7)<br>• Pedidos online pendientes<br>• Sin turno físico | • Ver Pedidos Online<br>• Procesar Órdenes |

### Combinaciones Comunes

#### 🍕 Restaurante con Delivery
```
Capabilities: [onsite_service, pickup_orders, delivery_shipping, physical_products]

Widget muestra:
- Turno actual: "Turno Noche (18:00 - 23:00)"
- Cash Session: Abierta - $42,500 en ventas
- Staff activo: 8/10 (6 meseros + 2 cocina)
- Mesas ocupadas: 12/20
- Pedidos pickup: 3 pendientes
- Deliveries: 5 en ruta

Quick Actions:
- Nueva Venta Dine-in
- Nueva Orden Pickup
- Nueva Orden Delivery
- Ver Mesas
- Cerrar Turno
```

#### 💇 Salón de Belleza
```
Capabilities: [professional_services, onsite_service]

Widget muestra:
- Turno actual: "Jornada Completa (10:00 - 20:00)"
- Profesionales activos: 4/5
- Appointments hoy: 18 completados, 3 pendientes
- Próximo slot libre: 17:30

Quick Actions:
- Nuevo Appointment
- Walk-in Cliente
- Ver Calendario
- Cerrar Turno
```

#### 🚚 Food Truck
```
Capabilities: [mobile_operations, physical_products, pickup_orders]

Widget muestra:
- Ubicación actual: "Plaza Central"
- Cash Session: Abierta
- Staff: 2/2 activos
- Inventario móvil: 85% disponible
- Pedidos pickup: 2 pendientes

Quick Actions:
- Nueva Venta
- Actualizar Ubicación
- Ver Inventario
- Cerrar Día
```

---

## 🔗 INTEGRACIONES DE SISTEMAS

### 1. Cash Management Module

**Servicios:**
- `getActiveCashSession(moneyLocationId)` → CashSessionRow | null
- `openCashSession(input, userId)` → CashSessionRow
- `closeCashSession(sessionId, input, userId)` → CashSessionRow

**Datos Necesarios:**
```typescript
interface CashSessionData {
  id: string;
  money_location_id: string;
  opened_at: string;
  starting_cash: number;
  cash_sales: number;
  cash_refunds: number;
  expected_cash: number;
  status: 'OPEN' | 'CLOSED' | 'DISCREPANCY';
}
```

**Componentes Reutilizables:**
- `OpenSessionModal` (ya existe)
- `CloseSessionModal` (ya existe)

### 2. Staff Module

**API Exports:**
```typescript
const staffModule = ModuleRegistry.getInstance().getExports('staff');
const useEmployeesList = staffModule.hooks.useEmployeesList;
```

**Datos Necesarios:**
```typescript
interface StaffData {
  activeEmployees: Employee[];
  scheduledForToday: Employee[];
  currentShiftEmployees: Employee[];
  totalCount: number;
  activeCount: number;
}
```

### 3. Business Hours (Settings)

**Store:**
```typescript
const { operatingHours, pickupHours, deliveryHours } = useOperationsStore();
```

**Funciones Helpers:**
```typescript
function getCurrentShiftName(currentTime: string, hours: Hours): string;
function getNextShiftTime(currentTime: string, hours: Hours): string;
function isWithinOperatingHours(currentTime: string, hours: Hours): boolean;
```

### 4. Scheduling Module

**Datos Necesarios:**
```typescript
interface ShiftData {
  currentShift: {
    name: string; // "Turno Mañana", "Turno Tarde"
    start_time: string;
    end_time: string;
    scheduled_staff: number;
  };
  shiftsToday: Shift[];
}
```

### 5. Alerts System

**Hook Consumption:**
```typescript
const { alerts } = useAlerts({
  categories: ['INVENTORY_LOW', 'STAFF_SHORTAGE', 'CASH_VARIANCE']
});
```

---

## ⚡ QUICK ACTIONS DINÁMICAS

### Sistema de Inyección via HookRegistry

#### Hook Point: `dashboard.quick_actions`

Cada módulo puede registrar Quick Actions según sus capabilities:

```typescript
// En manifest de cada módulo
registry.addAction(
  'dashboard.quick_actions',
  () => ({
    id: 'new-sale',
    label: 'Nueva Venta',
    icon: ShoppingCartIcon,
    color: 'green',
    onClick: () => navigate('sales'),
    requiredCapabilities: ['physical_products'],
    priority: 100
  }),
  'sales',
  100 // priority
);
```

### Quick Actions por Módulo

#### Sales Module
```typescript
// src/modules/sales/manifest.tsx
hooks: {
  provide: ['dashboard.quick_actions'],
  consume: []
},

setup: async (registry) => {
  // Dine-in
  registry.addAction('dashboard.quick_actions',
    () => ({
      id: 'new-sale-dinein',
      label: 'Nueva Venta',
      icon: ShoppingCartIcon,
      color: 'green',
      onClick: () => navigate('sales'),
      requiredCapabilities: ['onsite_service'],
    }),
    'sales',
    100
  );

  // Pickup
  registry.addAction('dashboard.quick_actions',
    () => ({
      id: 'new-order-pickup',
      label: 'Pickup',
      icon: ShoppingBagIcon,
      color: 'blue',
      onClick: () => navigate('sales', { mode: 'pickup' }),
      requiredCapabilities: ['pickup_orders'],
    }),
    'sales',
    95
  );

  // Delivery
  registry.addAction('dashboard.quick_actions',
    () => ({
      id: 'new-order-delivery',
      label: 'Delivery',
      icon: TruckIcon,
      color: 'cyan',
      onClick: () => navigate('sales', { mode: 'delivery' }),
      requiredCapabilities: ['delivery_shipping'],
    }),
    'sales',
    90
  );
}
```

#### Cash Module
```typescript
// src/modules/cash/manifest.tsx
setup: async (registry) => {
  registry.addAction('dashboard.quick_actions',
    () => ({
      id: 'open-cash-session',
      label: 'Abrir Caja',
      icon: BanknotesIcon,
      color: 'green',
      onClick: () => openCashSessionModal(),
      requiredCapabilities: ['physical_products'],
      conditionalRender: (data) => !data.activeCashSession,
    }),
    'cash',
    80
  );

  registry.addAction('dashboard.quick_actions',
    () => ({
      id: 'close-cash-session',
      label: 'Cerrar Caja',
      icon: BanknotesIcon,
      color: 'red',
      onClick: () => closeCashSessionModal(),
      requiredCapabilities: ['physical_products'],
      conditionalRender: (data) => !!data.activeCashSession,
    }),
    'cash',
    79
  );
}
```

#### Scheduling Module
```typescript
setup: async (registry) => {
  registry.addAction('dashboard.quick_actions',
    () => ({
      id: 'new-appointment',
      label: 'Nuevo Turno',
      icon: CalendarIcon,
      color: 'purple',
      onClick: () => navigate('scheduling'),
      requiredCapabilities: ['professional_services'],
    }),
    'scheduling',
    85
  );
}
```

### Renderizado Dinámico

```typescript
// En ShiftControlWidget
const registry = ModuleRegistry.getInstance();
const quickActions = registry.doAction('dashboard.quick_actions', {
  activeCashSession,
  currentShift,
  activeStaff
});

// Filtrar por capabilities activas
const { hasCapability } = useCapabilities();
const filteredActions = quickActions.filter(action =>
  !action.requiredCapabilities ||
  action.requiredCapabilities.every(cap => hasCapability(cap))
);

// Filtrar por conditional render
const visibleActions = filteredActions.filter(action =>
  !action.conditionalRender || action.conditionalRender(widgetData)
);

// Ordenar por priority
const sortedActions = visibleActions.sort((a, b) => b.priority - a.priority);
```

---

## 🔄 FLUJOS DE USUARIO

### Flujo 1: Apertura de Turno

```
1. Usuario llega al Dashboard
   ├─ Widget muestra "Turno Cerrado"
   ├─ Botón: "Iniciar Turno"
   └─ Quick Actions deshabilitadas

2. Click en "Iniciar Turno"
   ├─ Validar business hours (¿está dentro del horario?)
   ├─ SI tiene capability 'physical_products':
   │  └─ Abrir OpenSessionModal
   │     ├─ Seleccionar Money Location
   │     ├─ Ingresar fondo inicial (default_float sugerido)
   │     ├─ Notas de apertura (opcional)
   │     └─ Confirmar
   ├─ Crear Cash Session (si aplica)
   ├─ Emitir evento: 'shift.opened'
   └─ Actualizar estado del widget

3. Widget actualizado
   ├─ Estado: "Turno Abierto - Turno Mañana"
   ├─ Timer: "Operando desde hace 0:05"
   ├─ Cash Session: "$5,000 inicial"
   ├─ Staff activo: 2/5
   └─ Quick Actions habilitadas
```

### Flujo 2: Cierre de Turno

```
1. Usuario click "Cerrar Turno"
   ├─ Validar condiciones:
   │  ├─ ¿Hay mesas abiertas? → Advertencia
   │  ├─ ¿Hay pedidos pendientes? → Advertencia
   │  ├─ ¿Cash session abierta? → Debe cerrar primero
   │  └─ ¿Staff activo? → Notificar checkout

2. SI tiene Cash Session abierta:
   ├─ Abrir CloseSessionModal
   │  ├─ Mostrar resumen de movimientos
   │  ├─ Ingresar efectivo contado (arqueo ciego)
   │  ├─ Calcular diferencia automática
   │  ├─ Notas de cierre (opcional)
   │  └─ Confirmar
   ├─ Cerrar Cash Session
   │  ├─ Si variance > $50 → Estado: DISCREPANCY
   │  ├─ Crear journal entry de ajuste
   │  └─ Emitir evento: 'cash.session.closed'

3. Finalizar turno
   ├─ Emitir evento: 'shift.closed'
   ├─ Actualizar widget → "Turno Cerrado"
   └─ Redirect a resumen del día (opcional)
```

### Flujo 3: Operación durante el turno

```
1. Turno activo
   ├─ Widget muestra métricas en vivo:
   │  ├─ Ventas en efectivo: $12,450
   │  ├─ Staff activo: 6/9
   │  ├─ Tiempo operando: 4:30 hrs
   │  └─ Alertas: 2 activas

2. Quick Actions disponibles:
   ├─ Nueva Venta → Abre Sales POS
   ├─ Nueva Orden Pickup → Abre Sales (modo pickup)
   ├─ Ver Mesas → Abre Table Management
   └─ Arqueo Parcial → Cash Drop modal

3. Eventos en tiempo real:
   ├─ Nueva venta → Actualiza cash_sales
   ├─ Employee check-in → Actualiza activeStaff
   ├─ Nueva alerta → Incrementa badge
   └─ Cambio de turno → Actualiza shiftName
```

---

## 📐 ESPECIFICACIÓN TÉCNICA

### Componente Principal

```typescript
/**
 * ShiftControlWidget - Hero component del Dashboard
 *
 * Gestiona el turno operacional actual con integraciones a:
 * - Cash Management (arqueos)
 * - Staff (empleados activos)
 * - Scheduling (turnos programados)
 * - Business Hours (horarios)
 *
 * @capability-driven Renderiza secciones según capabilities activas
 * @hook-consumer Consume 'dashboard.quick_actions' para acciones dinámicas
 */
interface ShiftControlWidgetProps {
  /** Modo de visualización (opcional) */
  variant?: 'full' | 'compact';

  /** Handlers de acciones (opcional, usa defaults si no se proveen) */
  onOpenShift?: () => void;
  onCloseShift?: () => void;
}

interface ShiftControlWidgetData {
  // Operational status
  isOperational: boolean;
  currentShift: {
    name: string;
    start_time: string;
    end_time: string;
    opened_at?: string;
  } | null;

  // Cash session (si tiene capability physical_products)
  cashSession: CashSessionRow | null;

  // Staff data
  staff: {
    active: number;
    scheduled: number;
    percentage: number;
  };

  // Business hours
  businessHours: {
    openTime: string;
    closeTime: string;
    isWithinHours: boolean;
  };

  // Alerts
  alerts: {
    count: number;
    critical: number;
  };

  // Operating time
  operatingMinutes: number;
}
```

### Hooks Necesarios

```typescript
/**
 * Hook: useShiftControl
 * Centraliza toda la lógica del turno
 */
function useShiftControl() {
  const { hasCapability } = useCapabilities();
  const { activeCashSession } = useCashSession();
  const { activeStaff, scheduledStaff } = useStaffData();
  const { operatingHours } = useOperationsStore();
  const { alerts } = useAlerts();

  // Determinar estado operacional
  const isOperational = useMemo(() => {
    if (hasCapability('online_store')) return true; // 24/7
    if (hasCapability('mobile_operations')) return !!activeCashSession;
    return isWithinOperatingHours(new Date(), operatingHours);
  }, [hasCapability, activeCashSession, operatingHours]);

  // Calcular tiempo operado
  const operatingMinutes = useMemo(() => {
    if (!activeCashSession) return 0;
    const now = new Date();
    const opened = new Date(activeCashSession.opened_at);
    return Math.floor((now.getTime() - opened.getTime()) / 60000);
  }, [activeCashSession]);

  return {
    isOperational,
    cashSession: activeCashSession,
    staff: { active: activeStaff.length, scheduled: scheduledStaff.length },
    businessHours: { /* ... */ },
    alerts: { count: alerts.length, critical: alerts.filter(a => a.severity === 'critical').length },
    operatingMinutes
  };
}

/**
 * Hook: useCashSession
 * Gestión de cash sessions
 */
function useCashSession() {
  const { data: session } = useQuery({
    queryKey: ['active-cash-session'],
    queryFn: () => getAllActiveSessions().then(sessions => sessions[0] || null),
    refetchInterval: 30000 // Cada 30 seg
  });

  const openMutation = useMutation({
    mutationFn: (input: OpenCashSessionInput) =>
      openCashSession(input, currentUserId),
    onSuccess: () => {
      queryClient.invalidateQueries(['active-cash-session']);
      toaster.success({ title: 'Caja abierta exitosamente' });
    }
  });

  const closeMutation = useMutation({
    mutationFn: ({ sessionId, input }: { sessionId: string, input: CloseCashSessionInput }) =>
      closeCashSession(sessionId, input, currentUserId),
    onSuccess: (closedSession) => {
      queryClient.invalidateQueries(['active-cash-session']);
      if (closedSession.status === 'DISCREPANCY') {
        toaster.warning({
          title: 'Caja cerrada con diferencia',
          description: `Diferencia: ${formatCurrency(closedSession.variance || 0)}`
        });
      } else {
        toaster.success({ title: 'Caja cerrada correctamente' });
      }
    }
  });

  return {
    activeCashSession: session,
    openCashSession: openMutation.mutate,
    closeCashSession: closeMutation.mutate,
    isLoading: openMutation.isPending || closeMutation.isPending
  };
}

/**
 * Hook: useStaffData
 * Datos de empleados activos
 */
function useStaffData() {
  const staffModule = ModuleRegistry.getInstance().getExports('staff');
  const useEmployeesList = staffModule.hooks.useEmployeesList();
  const { items: allEmployees } = useEmployeesList();

  const activeEmployees = useMemo(() =>
    allEmployees.filter(emp => emp.is_active && emp.checked_in),
    [allEmployees]
  );

  const scheduledForToday = useMemo(() => {
    // TODO: Query schedules for today
    return allEmployees.filter(emp => emp.is_active);
  }, [allEmployees]);

  return {
    activeStaff: activeEmployees,
    scheduledStaff: scheduledForToday,
    totalStaff: allEmployees.length
  };
}
```

### Estructura del Componente

```tsx
export const ShiftControlWidget: React.FC<ShiftControlWidgetProps> = ({
  variant = 'full'
}) => {
  const { hasCapability } = useCapabilities();
  const shiftData = useShiftControl();
  const registry = ModuleRegistry.getInstance();
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Obtener Quick Actions dinámicas
  const quickActions = registry.doAction('dashboard.quick_actions', shiftData);
  const filteredActions = filterActionsByCapabilities(quickActions, hasCapability);

  return (
    <Box
      bgGradient={shiftData.isOperational ? 'linear(to-br, blue.800, gray.800)' : 'linear(to-br, gray.800, gray.900)'}
      borderRadius="3xl"
      p={8}
      position="relative"
      overflow="hidden"
      boxShadow="xl"
      border="1px solid"
      borderColor={shiftData.isOperational ? 'green.500' : 'red.500'}
    >
      {/* Background Pattern */}
      <BackgroundPattern isOpen={shiftData.isOperational} />

      {/* Header: Status + Control Button */}
      <ShiftHeader
        isOperational={shiftData.isOperational}
        currentShift={shiftData.currentShift}
        onToggle={() => shiftData.isOperational ? setShowCloseModal(true) : setShowOpenModal(true)}
      />

      {/* Stats Grid: Operating Hours, Staff, Cash Session */}
      <ShiftStats
        operatingMinutes={shiftData.operatingMinutes}
        businessHours={shiftData.businessHours}
        staff={shiftData.staff}
        cashSession={shiftData.cashSession}
        alerts={shiftData.alerts}
      />

      {/* Quick Actions (solo si turno abierto) */}
      {shiftData.isOperational && (
        <QuickActionsSection actions={filteredActions} />
      )}

      {/* Modals */}
      {hasCapability('physical_products') && (
        <>
          <OpenSessionModal
            isOpen={showOpenModal}
            onClose={() => setShowOpenModal(false)}
            {...openSessionProps}
          />
          <CloseSessionModal
            isOpen={showCloseModal}
            session={shiftData.cashSession}
            onClose={() => setShowCloseModal(false)}
            {...closeSessionProps}
          />
        </>
      )}
    </Box>
  );
};
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Fase 1: Foundation (2-3 días)

**Objetivo**: Crear estructura base y hooks

- [x] ~~Investigar sistemas existentes~~ ✅ Completado
- [ ] Crear `useShiftControl` hook
- [ ] Crear `useCashSession` hook
- [ ] Crear `useStaffData` hook
- [ ] Crear `useBusinessHours` helper
- [ ] Unit tests para hooks


**Archivos**:
```
src/pages/admin/core/dashboard/components/
├── ShiftControlWidget/
│   ├── index.tsx
│   ├── ShiftControlWidget.tsx
│   ├── hooks/
│   │   ├── useShiftControl.ts
│   │   ├── useCashSession.ts
│   │   └── useStaffData.ts
│   └── types.ts
```

### Fase 2: UI Components (2 días)

**Objetivo**: Componentes visuales reutilizables

- [ ] `ShiftHeader` component
- [ ] `ShiftStats` component
- [ ] `QuickActionsSection` component
- [ ] `BackgroundPattern` component
- [ ] Integrar modales existentes (OpenSessionModal, CloseSessionModal)

### Fase 3: Dynamic Quick Actions (2 días)

**Objetivo**: Sistema de inyección via HookRegistry

- [ ] Definir hook point `dashboard.quick_actions`
- [ ] Actualizar Sales manifest para registrar actions
- [ ] Actualizar Cash manifest para registrar actions
- [ ] Actualizar Scheduling manifest para registrar actions
- [ ] Crear filtro por capabilities
- [ ] Crear filtro por conditional render

**Estructura de registro**:
```typescript
// src/modules/sales/manifest.tsx
setup: async (registry) => {
  registry.addAction(
    'dashboard.quick_actions',
    () => ({
      id: 'new-sale',
      label: 'Nueva Venta',
      icon: ShoppingCartIcon,
      color: 'green',
      onClick: () => navigate('sales'),
      requiredCapabilities: ['physical_products', 'onsite_service'],
      priority: 100
    }),
    'sales',
    100
  );
}
```

### Fase 4: Capability Variations (2 días)

**Objetivo**: Renderizado condicional por capabilities

- [ ] Variante: Restaurant (onsite + pickup + delivery)
- [ ] Variante: Salón (professional_services)
- [ ] Variante: Food Truck (mobile_operations)
- [ ] Variante: E-commerce (online_store)
- [ ] Tests de integración para cada variante

### Fase 5: Integration & Polish (1-2 días)

**Objetivo**: Conectar todo y pulir UX

- [ ] Integrar con EventBus (shift.opened, shift.closed)
- [ ] Real-time updates (cash sales, staff changes)
- [ ] Validaciones completas
- [ ] Error handling
- [ ] Loading states
- [ ] Accessibility (ARIA labels)
- [ ] Responsive design

### Fase 6: Migration (1 día)

**Objetivo**: Reemplazar OperationalStatusWidget

- [ ] Actualizar Dashboard page para usar ShiftControlWidget
- [ ] Migrar Quick Actions hardcodeadas a sistema dinámico
- [ ] Deprecar OperationalStatusWidget antiguo
- [ ] Actualizar tests
- [ ] Documentation

---

## 📊 CASOS DE USO - TESTING MATRIX

### Combinaciones a Probar

| # | Capabilities | Esperado |
|---|-------------|----------|
| 1 | `[physical_products, onsite_service]` | Restaurante básico: Turno + Cash + Staff + Mesas |
| 2 | `[physical_products, onsite_service, pickup_orders]` | Restaurante con takeaway: + Pickup hours + Pedidos pendientes |
| 3 | `[physical_products, onsite_service, pickup_orders, delivery_shipping]` | Restaurante completo: + Delivery hours + Drivers |
| 4 | `[professional_services, onsite_service]` | Salón: Appointments + Profesionales + Sin cash session |
| 5 | `[mobile_operations, physical_products]` | Food Truck: Ubicación + Cash + Inventario móvil |
| 6 | `[online_store]` | E-commerce: 24/7 + Sin turno físico + Pedidos online |
| 7 | `[asset_rental]` | Rental: Disponibilidad de assets + Reservas |

---

## 🎨 DECISIONES DE DISEÑO

### 1. ¿Por qué NO un componente separado para cada capability?

**Razón**: Progressive Enhancement > Component Explosion

En lugar de:
```
❌ ShiftControlRestaurant.tsx
❌ ShiftControlSalon.tsx
❌ ShiftControlFoodTruck.tsx
```

Usamos:
```
✅ ShiftControlWidget.tsx
   ├─ Renderiza secciones según capabilities
   └─ Quick Actions inyectadas dinámicamente
```

**Ventajas**:
- Un solo componente a mantener
- Testing más sencillo
- Composición flexible
- Evita duplicación de código

### 2. ¿Por qué Quick Actions vía HookRegistry y no props?

**Razón**: Extensibilidad > Configuración

Hook-based permite:
```typescript
✅ Módulos registran sus propias acciones
✅ Prioridad configurable
✅ Conditional rendering
✅ Fácil agregar nuevos módulos
```

Props-based requeriría:
```typescript
❌ Pasar todas las acciones desde Dashboard
❌ Dashboard conoce detalles de cada módulo
❌ Acoplamiento alto
❌ Difícil escalar
```

### 3. ¿Por qué separar Cash Session del Shift?

**Razón**: Cohesión de Responsabilidades

- **Shift**: Concepto operacional (turno de trabajo)
- **Cash Session**: Concepto contable (arqueo de caja)

Algunos negocios tienen:
- Turno SIN cash (servicios profesionales)
- Cash session SIN turnos (tienda 24/7)
- Múltiples cash sessions en un turno (múltiples cajas)

Por eso:
```typescript
if (hasCapability('physical_products')) {
  // Mostrar sección Cash Session
} else {
  // Omitir sección Cash Session
}
```

---

## ✅ CRITERIOS DE ÉXITO

### Funcionales

- [ ] Puede abrir/cerrar turno con validaciones correctas
- [ ] Puede abrir/cerrar cash session (arqueo)
- [ ] Muestra staff activo vs programado
- [ ] Muestra horarios correctos del negocio
- [ ] Quick Actions cambian según capabilities
- [ ] Funciona con TODAS las combinaciones de capabilities



### No Funcionales

- [ ] Tiempo de carga < 500ms
- [ ] Real-time updates sin lag perceptible
- [ ] Responsive en mobile, tablet, desktop
- [ ] WCAG 2.1 AA compliant
- [ ] Unit test coverage > 80%
- [ ] Integration tests para combinaciones principales

### UX

- [ ] Usuario entiende estado del turno de un vistazo
- [ ] Acciones críticas requieren confirmación
- [ ] Feedback visual inmediato en todas las acciones
- [ ] Errores claros y accionables
- [ ] Animaciones suaves y no distractoras

---

## 📚 REFERENCIAS

### Código Existente
- `src/pages/admin/core/dashboard/components/OperationalStatusWidget.tsx`
- `src/pages/admin/core/dashboard/components/QuickActionsWidget.tsx`
- `src/modules/cash/services/cashSessionService.ts`
- `src/modules/cash/components/OpenSessionModal.tsx`
- `src/modules/cash/components/CloseSessionModal.tsx`
- `src/modules/staff/manifest.tsx`
- `src/lib/modules/ModuleRegistry.ts`

### Documentación
- `docs/cash/QUICKSTART.md`
- `src/config/types/atomic-capabilities.ts`
- `DASHBOARD_COMPARISON_ANALYSIS.md`

---

## 🔄 PRÓXIMOS PASOS

### Inmediato
1. ✅ Revisar y aprobar este documento
2. Crear branch: `feature/shift-control-widget`
3. Implementar Fase 1 (Foundation)

### Seguimiento
- Daily standup: Progreso de implementación
- Code review: Al final de cada fase
- Demo: Al completar Fase 4 (variations)

### Post-Launch
- Recopilar feedback de usuarios
- Iterar sobre UX según usage patterns
- Considerar features avanzadas:
  - Múltiples cash sessions simultáneas
  - Handoff entre turnos
  - Notificaciones push al cerrar turno

---

**Documento creado por**: Claude Code
**Última actualización**: 2025-01-26
**Estado**: 🟢 Listo para implementación
