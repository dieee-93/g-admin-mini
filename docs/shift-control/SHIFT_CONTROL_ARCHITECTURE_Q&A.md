1.123513534534# 🔍 ShiftControl Widget - Q&A Arquitectónico

**Fecha**: 2025-01-26
**Documento de referencia**: `SHIFT_CONTROL_ARCHITECTURE.md`

---

## ❓ PREGUNTA 1: Fase 1 - ¿Hooks personalizados vs reutilización de módulos?

### 📋 Pregunta Original

> "¿Es necesario crear estos hooks? ¿No se pueden reutilizar la lógica del módulo del proyecto? ¿Es la manera correcta de consumir la información en nuestra arquitectura cross-module? ¿Estamos rompiendo convenciones del proyecto?"

### ✅ RESPUESTA

**TL;DR**: Tienes razón. **NO debemos duplicar lógica**. Debemos consumir directamente las **exports API** de los módulos existentes según la convención del proyecto.

---

### 🏗️ Convención Cross-Module del Proyecto

Investigando el código, el proyecto ya tiene un patrón establecido:

#### **Patrón Module Exports (VS Code-style)**

```typescript
// 📁 src/modules/staff/manifest.tsx (líneas 157-189)

exports: {
  /**
   * React Hooks for Staff data fetching
   * Follows Module Exports pattern from CROSS_MODULE_DATA_STRATEGY.md
   */
  hooks: {
    /**
     * Hook factory for employees list
     * Returns the actual hook that components can use
     */
    useEmployeesList: () => {
      return useCrudOperations({
        tableName: 'employees',
        selectQuery: 'id, first_name, last_name, position, hourly_rate, is_active',
        cacheKey: 'employees-list',
        cacheTime: 5 * 60 * 1000,
        enableRealtime: true,
      });
    }
  },

  // Functions that other modules can call
  getStaffAvailability: async () => { /* ... */ },
  calculateLaborCost: (hours: number, rate: number) => { /* ... */ }
}
```

#### **Consumo desde otros componentes**

```typescript
// ✅ FORMA CORRECTA (usada en el proyecto)
const registry = ModuleRegistry.getInstance();
const staffModule = registry.getExports('staff');
const useEmployeesList = staffModule.hooks.useEmployeesList;

function MyComponent() {
  const { items: employees, loading } = useEmployeesList();
  // ...
}
```

---

### 🚫 LO QUE NO DEBEMOS HACER (mi propuesta original)

```typescript
// ❌ MAL: Crear wrappers duplicados
function useStaffData() {
  // Esto duplica lógica que ya existe en el módulo Staff
  const staffModule = ModuleRegistry.getInstance().getExports('staff');
  const useEmployeesList = staffModule.hooks.useEmployeesList();
  const { items: allEmployees } = useEmployeesList();

  const activeEmployees = useMemo(() =>
    allEmployees.filter(emp => emp.is_active && emp.checked_in),
    [allEmployees]
  );

  return { activeStaff: activeEmployees };
}
```

**Problema**: Estamos creando una capa innecesaria que:
- ❌ Duplica lógica
- ❌ Rompe convenciones
- ❌ Dificulta mantenimiento
- ❌ No agrega valor

---

### ✅ SOLUCIÓN CORRECTA: Consumo Directo

#### **Fase 1 Rediseñada: Reutilización en lugar de Creación**

**ANTES (mi propuesta original)**:
```
Fase 1: Foundation
- [ ] Crear useShiftControl hook
- [ ] Crear useCashSession hook
- [ ] Crear useStaffData hook
```

**DESPUÉS (correcto según convenciones)**:
```
Fase 1: Integration Preparation
- [ ] Verificar exports API de Cash Module
- [ ] Verificar exports API de Staff Module
- [ ] Verificar exports API de Scheduling Module
- [ ] Crear SOLO useShiftControl (orquestador)
- [ ] Unit tests para integración
```

---

### 📐 Nueva Arquitectura de Hooks

```typescript
/**
 * Hook Orquestador: useShiftControl
 *
 * RESPONSABILIDAD: Coordinar datos de múltiples módulos
 * NO duplica lógica, solo consume exports API
 */
function useShiftControl() {
  const { hasCapability } = useCapabilities();
  const registry = ModuleRegistry.getInstance();

  // ✅ CONSUMO DIRECTO: Cash Module
  const cashModule = registry.getExports('cash');
  const useCashSession = cashModule?.hooks?.useCashSession;
  const { activeCashSession, openCashSession, closeCashSession } =
    useCashSession ? useCashSession() : { activeCashSession: null };

  // ✅ CONSUMO DIRECTO: Staff Module
  const staffModule = registry.getExports('staff');
  const useEmployeesList = staffModule?.hooks?.useEmployeesList;
  const { items: employees, loading: staffLoading } =
    useEmployeesList ? useEmployeesList() : { items: [], loading: false };

  // ✅ CONSUMO DIRECTO: Scheduling Module (si existe)
  const schedulingModule = registry.getExports('scheduling');
  const useShiftsToday = schedulingModule?.hooks?.useShiftsToday;
  const { shifts } = useShiftsToday ? useShiftsToday() : { shifts: [] };

  // ✅ CONSUMO DIRECTO: Operations Store (business hours)
  const { operatingHours, pickupHours, deliveryHours } = useOperationsStore();

  // ✅ CONSUMO DIRECTO: Alerts System
  const { alerts } = useAlerts({
    categories: ['INVENTORY_LOW', 'STAFF_SHORTAGE', 'CASH_VARIANCE']
  });

  // 🎯 LÓGICA ESPECÍFICA DEL WIDGET (lo único que agregamos)
  const isOperational = useMemo(() => {
    if (hasCapability('online_store')) return true; // 24/7
    if (hasCapability('mobile_operations')) return !!activeCashSession;
    return isWithinOperatingHours(new Date(), operatingHours);
  }, [hasCapability, activeCashSession, operatingHours]);

  const operatingMinutes = useMemo(() => {
    if (!activeCashSession?.opened_at) return 0;
    const now = new Date();
    const opened = new Date(activeCashSession.opened_at);
    return Math.floor((now.getTime() - opened.getTime()) / 60000);
  }, [activeCashSession]);

  const currentShiftName = useMemo(() => {
    return getCurrentShiftName(new Date(), operatingHours);
  }, [operatingHours]);

  return {
    // Estado operacional
    isOperational,
    currentShift: {
      name: currentShiftName,
      start_time: operatingHours?.monday?.open || '09:00',
      end_time: operatingHours?.monday?.close || '17:00',
    },

    // Cash session (directo del módulo)
    cashSession: activeCashSession,
    openCashSession,
    closeCashSession,

    // Staff (calculado desde exports)
    staff: {
      active: employees.filter(e => e.is_active && e.checked_in).length,
      scheduled: employees.filter(e => e.is_active).length,
      percentage: 0, // Calcular
    },

    // Business hours (directo del store)
    businessHours: {
      operatingHours,
      pickupHours,
      deliveryHours,
    },

    // Alerts (directo del sistema)
    alerts: {
      count: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
    },

    // Tiempo operado (calculado)
    operatingMinutes,
  };
}
```

---

### 📋 Acción Requerida para Cash Module

**Verificar si Cash Module expone hooks**:

```typescript
// 📁 src/modules/cash/manifest.tsx (verificar si existe)
exports: {
  hooks: {
    useCashSession: () => {
      const { data: session } = useQuery({
        queryKey: ['active-cash-session'],
        queryFn: () => getAllActiveSessions().then(s => s[0]),
        refetchInterval: 30000
      });

      const openMutation = useMutation({ /* ... */ });
      const closeMutation = useMutation({ /* ... */ });

      return {
        activeCashSession: session,
        openCashSession: openMutation.mutate,
        closeCashSession: closeMutation.mutate,
        isLoading: openMutation.isPending || closeMutation.isPending
      };
    }
  },

  // Funciones puras (ya existen en cashSessionService)
  services: {
    getActiveCashSession,
    openCashSession,
    closeCashSession,
    recordCashSale,
    recordCashDrop
  }
}
```

**Si NO existe**, entonces SÍ debemos crear `useCashSession` hook en el Cash Module, NO en el Dashboard.

---

### ✅ Decisión Final - Fase 1 Corregida

```
Fase 1: Module Exports Verification & Hook Orchestration (2 días)

Objetivo: Verificar/completar exports API de módulos y crear orquestador

PASO 1: Verificar Cash Module (1 día)
- [ ] Leer src/modules/cash/manifest.tsx
- [ ] SI NO tiene exports.hooks.useCashSession:
      └─ Agregarlo en Cash Module (NO en Dashboard)
- [ ] SI SÍ tiene exports:
      └─ Documentar API disponible

PASO 2: Verificar Staff Module (0.5 día)
- [x] Ya tiene exports.hooks.useEmployeesList ✅
- [ ] Verificar si necesitamos agregar:
      - getActiveStaff() para filtrar checked_in
      - getScheduledForToday(date) para shifts

PASO 3: Verificar Scheduling Module (0.5 día)
- [ ] Verificar si tiene exports.hooks.useShiftsToday
- [ ] Si NO existe, agregarlo en Scheduling Module

PASO 4: Crear Hook Orquestador (1 día)
- [ ] Crear useShiftControl que CONSUME exports
- [ ] NO duplica lógica, solo coordina
- [ ] Unit tests para integración

Archivos:
src/pages/admin/core/dashboard/components/
├── ShiftControlWidget/
│   ├── hooks/
│   │   └── useShiftControl.ts  (SOLO este hook)
│   └── utils/
│       └── businessHoursHelpers.ts (helpers puros)
```

---

## ❓ PREGUNTA 2: Multi-location + Food Truck + Comportamiento del Widget

### 📋 Pregunta Original

> "En el caso que se seleccionen combinadas las capabilities de foodtruck con otras capabilities, ¿cómo se comportará el widget? ¿Mostrará múltiples locales? ¿Mostrará solo el local que esté activado? ¿Se cambiará de local en el mismo componente para practicidad o se hará en otro lugar de la interfaz?"

### ✅ RESPUESTA

Esta es una pregunta CRÍTICA que cambia radicalmente el diseño del widget. Analicemos los escenarios:

---

### 🏢 Escenario 1: Single Location (Restaurante fijo)

```typescript
Capabilities: [onsite_service, physical_products]
Infrastructure: [single_location]

Widget muestra:
├─ Turno: "Turno Tarde"
├─ Local: "Sucursal Centro" (implícito, no se muestra selector)
├─ Cash Session: De esa única ubicación
└─ Staff: De esa única ubicación
```

**Diseño**: Simple, sin selector de ubicación.

---

### 🚚 Escenario 2: Food Truck Solo (Mobile Only)

```typescript
Capabilities: [mobile_operations, physical_products, pickup_orders]
Infrastructure: [mobile_business]

Widget muestra:
├─ Ubicación actual: "Plaza Central" ⬅️ SELECTOR
│  └─ Cambiar a: "Parque Norte", "Feria de la Ciudad"
├─ Turno: "Jornada Completa"
├─ Cash Session: Del food truck
└─ Staff: Del food truck
```

**Diseño**: Selector de ubicación móvil en el header del widget.

---

### 🏢🚚 Escenario 3: Multi-location + Food Truck (COMPLEJO)

```typescript
Capabilities: [onsite_service, mobile_operations, physical_products]
Infrastructure: [multi_location]  // NO mobile_business

Locales:
├─ 📍 Restaurante Centro (fixed)
├─ 📍 Restaurante Norte (fixed)
└─ 🚚 Food Truck 1 (mobile)

¿QUÉ MOSTRAMOS EN EL WIDGET?
```

#### **Opción A: Context-Aware (Recomendada)**

El widget muestra datos **según el contexto actual del usuario**:

```typescript
// Usuario tiene LocationContext activo
const { currentLocation } = useLocationContext();

Widget se adapta:
├─ SI currentLocation.type === 'FIXED':
│  └─ Mostrar turno del local fijo
│      ├─ Cash Session del local
│      └─ Staff asignado al local
│
└─ SI currentLocation.type === 'MOBILE':
   └─ Mostrar ubicación del food truck
       ├─ Cash Session del truck
       └─ Staff asignado al truck
```

**Ventaja**: Widget sigue siendo simple, la complejidad se maneja en LocationContext.

**Implementación**:

```typescript
function useShiftControl() {
  const { currentLocation } = useLocationContext(); // 🔑 KEY
  const { hasInfrastructure } = useCapabilities();

  // Filtrar datos por ubicación actual
  const activeCashSession = useCashSession({
    locationId: currentLocation.id
  });

  const activeStaff = useStaffData({
    locationId: currentLocation.id
  });

  return {
    location: currentLocation, // ⬅️ Incluir en return
    isOperational,
    cashSession: activeCashSession,
    staff: activeStaff,
    // ...
  };
}
```

**UI del Widget**:

```tsx
<ShiftControlWidget>
  {/* Header con ubicación actual */}
  <Stack direction="row" align="center" gap={3}>
    {hasInfrastructure('multi_location') && (
      <LocationSelector
        current={shiftData.location}
        onChange={(loc) => setCurrentLocation(loc)}
      />
    )}
    <Badge colorPalette={isOperational ? 'green' : 'red'}>
      {isOperational ? 'Operativo' : 'Cerrado'}
    </Badge>
  </Stack>

  {/* Stats filtrados por ubicación */}
  <ShiftStats {...shiftData} />
</ShiftControlWidget>
```

---

#### **Opción B: Multi-View Dashboard**

```typescript
Widget NO muestra selector, pero renderiza múltiples "cards":

Dashboard muestra:
├─ ShiftControlWidget (Restaurante Centro)
│  ├─ Turno: Abierto
│  └─ Cash: $12,000
│
├─ ShiftControlWidget (Restaurante Norte)
│  ├─ Turno: Cerrado
│  └─ Cash: N/A
│
└─ ShiftControlWidget (Food Truck 1)
   ├─ Ubicación: Plaza Central
   └─ Cash: $5,000
```

**Ventaja**: Vista consolidada de todas las ubicaciones.

**Desventaja**: Complica el Dashboard, mucho espacio vertical.

---

### 🎯 DECISIÓN RECOMENDADA

**Implementar Opción A: Context-Aware**

**Razones**:
1. ✅ Widget mantiene simplicidad
2. ✅ LocationContext ya existe en el proyecto (src/contexts/LocationContext.tsx)
3. ✅ Escalable: Funciona para 1, 2, 5, 10 ubicaciones
4. ✅ UX intuitiva: Usuario selecciona ubicación → Widget se actualiza
5. ✅ No contamina Dashboard con múltiples widgets

**Cambio en LocationContext**:

```typescript
// 📁 src/contexts/LocationContext.tsx
interface Location {
  id: string;
  name: string;
  type: 'FIXED' | 'MOBILE';  // ⬅️ Agregar type
  address?: string;
  current_latitude?: number;  // Solo para MOBILE
  current_longitude?: number; // Solo para MOBILE
}

const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [allLocations, setAllLocations] = useState<Location[]>([]);

  return (
    <LocationContext.Provider value={{
      currentLocation,
      setCurrentLocation,
      allLocations,
      isMobile: currentLocation?.type === 'MOBILE'
    }}>
      {children}
    </LocationContext.Provider>
  );
};
```

**Validación**:

```typescript
// En ShiftControlWidget
const { currentLocation, isMobile } = useLocationContext();

if (!currentLocation && hasInfrastructure('multi_location')) {
  return <LocationSelectorPrompt />;
}
```

---

### 📋 Listado de Locales - ¿Separar Food Trucks?

> "¿En el listado de locales aparecerán también los foodtrucks separados?"

**Respuesta**: Sí, PERO con agrupación visual.

```typescript
// UI en Sidebar o LocationSelector
<Stack direction="column" gap={4}>
  {/* Grupo: Locales Fijos */}
  <Box>
    <Typography variant="body" size="xs" color="gray.500" mb={2}>
      LOCALES FIJOS
    </Typography>
    {fixedLocations.map(loc => (
      <LocationItem key={loc.id} location={loc} icon={BuildingIcon} />
    ))}
  </Box>

  {/* Grupo: Unidades Móviles */}
  {mobileLocations.length > 0 && (
    <Box>
      <Typography variant="body" size="xs" color="gray.500" mb={2}>
        UNIDADES MÓVILES
      </Typography>
      {mobileLocations.map(loc => (
        <LocationItem
          key={loc.id}
          location={loc}
          icon={TruckIcon}
          badge={loc.current_status} // "En ruta", "Estacionado"
        />
      ))}
    </Box>
  )}
</Stack>
```

**Ventaja**: Clara separación visual entre tipos.

---

## ❓ PREGUNTA 3: Capability Online Store (Async) - Comportamiento del Widget

### 📋 Pregunta Original

> "¿Cómo va a manejar el componente el caso de los negocios combinados con la capability venta async? ¿Se comportará distinto cuando esté cerrado, teniendo en cuenta que el sistema sigue 'abierto' o al menos recibiendo pedidos pero sin atención/operación? ¿Y si el negocio es solo digital funciona 24hs, cómo se comportará el componente?"

### ✅ RESPUESTA

Esta pregunta revela una **contradicción conceptual** en el diseño original. Analicemos:

---

### 🤔 El Problema Conceptual

**Pregunta filosófica**: ¿Qué significa "turno" en un e-commerce 24/7?

```
Restaurante Tradicional:
├─ Turno Mañana (09:00 - 14:00)
├─ Turno Tarde (14:00 - 20:00)
└─ Turno Noche (20:00 - 23:00)
   ⬆️ Clear boundaries

E-commerce 24/7:
├─ ??? (No hay turnos físicos)
├─ Sistema siempre recibiendo pedidos
└─ Staff puede trabajar remotamente en horarios distribuidos
   ⬆️ No tiene sentido "abrir/cerrar turno"
```
Entiendo lo que decis, pero viste que el paradigma de nuestra aplicacion es diferente, se trata debuscar flexibilidad entiendo que el planteo es confuso, a mi tmabien me resulta raro porque no termina de quedar claro, pero el planteo es simple, suponete que vos activas e-commerce, el sistema activa la operacion fuera de horario, dentro de horario se comporta de una manera para gestionar pedidos/turnos/etc en el momento, se supone que depende las otras capabilities con la que se combine, fuera de horario por ejemplo podria prepactar la cita, o precomprar el pedido y arreglar el retiro en horario operativo si posee retiro en el lugar, o comenzar los pasos del envio etc, depende de la capability que combine tambien, pero bueno entiendo que es confuso que se llame e-commerce, pero esta mas referio a operar fuera de horario que a otra cosa, porque la app incluye catalogo online para todos los comercios, este o no este abierto, pero si el negocio no opera 24 hs no puede preparar pedidos fuera de horario, ni despacharlos, ni recibir gewnte que los retire, pero al activar esa capabilitie permite prepactar como te menciono mas arriba. pero el negocio si va a tener un horario al fin y al cabo. pero entiendo que es confuso el termino e-coomeerce, y tambien puede confundirse este concepto con productos digitales, medio que se sobreescriben(es decir normalmente no necesitan medio de entrega, ni una persona que opere por lo tanto pueden entregarse 24 hs, y no parece termianr de quedar claro como se va a comportar el sistema y el formulario, aunque ya esta medianamente disctutido)
---

### 🏗️ Solución: Widget con 3 Modos

El widget debe tener **comportamientos distintos** según las capabilities:

---

#### **Modo 1: Physical Operations (Restaurante, Salón, Retail)**

```typescript
Capabilities: [onsite_service, physical_products]
Infrastructure: [single_location]

Widget muestra:
├─ Estado: "Turno Abierto" / "Turno Cerrado"
├─ Acción Principal: "Abrir Turno" / "Cerrar Turno"
├─ Cash Session: Vinculada al turno
├─ Staff: Empleados en turno activo
└─ Business Hours: Horario del local

Comportamiento:
- Usuario DEBE abrir turno para operar
- Al cerrar horario → Debe cerrar turno
- Cash session obligatoria si physical_products
```

**UI**:
```tsx
{/* Modo Physical */}
<Box borderColor={isOperational ? 'green.500' : 'red.500'}>
  <Stack>
    <Badge colorPalette={isOperational ? 'green' : 'red'}>
      {isOperational ? '● TURNO ABIERTO' : '● TURNO CERRADO'}
    </Badge>

    <Button onClick={isOperational ? handleCloseShift : handleOpenShift}>
      {isOperational ? 'Cerrar Turno' : 'Abrir Turno'}
    </Button>

    {isOperational && (
      <>
        <ShiftTimer openedAt={cashSession?.opened_at} />
        <CashSessionStats session={cashSession} />
        <StaffActiveCount active={6} scheduled={9} />
      </>
    )}
  </Stack>
</Box>
```

---

#### **Modo 2: Hybrid (Restaurante + E-commerce)**

```typescript
Capabilities: [onsite_service, physical_products, online_store]
Infrastructure: [single_location]

Widget muestra DOS SECCIONES:

┌─────────────────────────────────────┐
│ OPERACIONES FÍSICAS                 │
│ ├─ Turno: Cerrado                   │
│ ├─ Local cerrado desde 23:00        │
│ └─ [Abrir Turno Mañana]             │
│                                     │
│ TIENDA ONLINE (24/7)                │
│ ├─ Estado: ● ACTIVA                 │
│ ├─ Pedidos pendientes: 12           │
│ └─ Última orden: Hace 5 min         │
└─────────────────────────────────────┘

Comportamiento:
- Sección física: Igual a Modo 1
- Sección online: Siempre activa
- Pueden convivir:
  ├─ Local cerrado + Online recibiendo pedidos ✅
  └─ Local abierto + Online activa ✅
```

**UI**:
```tsx
{/* Modo Hybrid */}
<Stack direction="column" gap={6}>
  {/* Sección 1: Operaciones Físicas */}
  {hasCapability('onsite_service') && (
    <Box>
      <Typography variant="heading" size="sm" mb={3}>
        Operaciones Físicas
      </Typography>
      <PhysicalOperationsSection
        isOperational={isOperational}
        cashSession={cashSession}
        staff={staff}
      />
    </Box>
  )}

  {/* Sección 2: Tienda Online (siempre activa) */}
  {hasCapability('online_store') && (
    <Box>
      <Typography variant="heading" size="sm" mb={3}>
        Tienda Online
      </Typography>
      <OnlineStoreSection
        isActive={true}  // Siempre true
        pendingOrders={onlineOrders.filter(o => o.status === 'pending').length}
        lastOrderTime={onlineOrders[0]?.created_at}
      />
    </Box>
  )}
</Stack>
```

---

#### **Modo 3: Pure Digital (E-commerce 24/7)**

```typescript
Capabilities: [online_store]  // SOLO online_store
Infrastructure: [online_only] // Sin physical location

Widget muestra:
├─ NO hay concepto de "turno"
├─ NO hay cash session
├─ NO hay staff físico
└─ Sistema SIEMPRE operativo

Alternativa 1: Widget Simplificado
┌─────────────────────────────────────┐
│ TIENDA ONLINE                       │
│ ├─ Estado: ● ACTIVA (24/7)          │
│ ├─ Pedidos hoy: 47                  │
│ ├─ Revenue hoy: $12,450             │
│ ├─ Pedidos pendientes: 8            │
│ └─ Última orden: Hace 2 min         │
└─────────────────────────────────────┘

Alternativa 2: NO renderizar widget
El Dashboard muestra otros KPIs más relevantes:
- Sales metrics widget
- Inventory alerts widget
- Fulfillment status widget
```

**Decisión recomendada**: **Alternativa 2** (NO renderizar ShiftControlWidget).

**Razón**: Un negocio 100% digital no tiene "turno" ni "estado operacional" que gestionar. Mostrar un widget de "estado" siempre verde es redundante.

**Implementación**:

```tsx
// En Dashboard page
{(() => {
  const { hasCapability } = useCapabilities();

  // Si es SOLO online_store, omitir widget
  if (hasCapability('online_store') &&
      !hasCapability('onsite_service') &&
      !hasCapability('pickup_orders') &&
      !hasCapability('delivery_shipping')) {
    return null; // No renderizar ShiftControlWidget
  }

  return <ShiftControlWidget />;
})()}
```

---

### 📐 Matriz de Decisión - Comportamiento del Widget

| Capabilities | Infraestructure | Comportamiento del Widget |
|-------------|----------------|--------------------------|
| `[onsite_service, physical_products]` | `single_location` | **Modo Physical**: Turno único, cash session, staff |
| `[onsite_service, pickup_orders]` | `single_location` | **Modo Physical**: Turno + horarios pickup |
| `[onsite_service, online_store]` | `single_location` | **Modo Hybrid**: Sección física + Sección online |
| `[online_store]` SOLO | N/A | **NO renderizar widget** → Usar widgets específicos de e-commerce |
| `[mobile_operations, physical_products]` | `mobile_business` | **Modo Physical + Location**: Turno + ubicación móvil |
| `[multi_location]` | Cualquiera | **Modo Context-Aware**: Filtrar por LocationContext |

---

### 🎯 Implementación Recomendada

```typescript
// Hook: useWidgetMode
function useWidgetMode() {
  const { hasCapability, hasInfrastructure } = useCapabilities();

  const mode = useMemo(() => {
    // Pure digital → No widget
    if (hasCapability('online_store') &&
        !hasCapability('onsite_service') &&
        !hasCapability('pickup_orders')) {
      return 'HIDDEN';
    }

    // Hybrid (física + online)
    if (hasCapability('onsite_service') && hasCapability('online_store')) {
      return 'HYBRID';
    }

    // Physical only
    return 'PHYSICAL';
  }, [hasCapability]);

  return mode;
}

// En ShiftControlWidget
export const ShiftControlWidget: React.FC = () => {
  const mode = useWidgetMode();

  if (mode === 'HIDDEN') return null;

  if (mode === 'HYBRID') {
    return <HybridWidget />;
  }

  return <PhysicalWidget />;
};
```

---

## 📊 RESUMEN DE DECISIONES

### ✅ Decisión 1: Hooks y Reutilización

**PROBLEMA**: Propuesta original duplicaba lógica.

**SOLUCIÓN**:
- ✅ Consumir directamente `exports` API de módulos
- ✅ Crear SOLO `useShiftControl` como orquestador
- ✅ NO crear `useCashSession`, `useStaffData` en Dashboard
- ✅ Si faltan exports, agregarlos en el módulo correspondiente

---

### ✅ Decisión 2: Multi-location + Food Truck

**PROBLEMA**: ¿Mostrar todas las ubicaciones o solo la actual?

**SOLUCIÓN**:
- ✅ Usar **LocationContext** para selección
- ✅ Widget muestra datos de `currentLocation` únicamente
- ✅ Selector de ubicación en header del widget si `multi_location`
- ✅ Agrupar visualmente Fixed vs Mobile en selector

---

### ✅ Decisión 3: Online Store (Async)

**PROBLEMA**: ¿Cómo manejar "turno" en e-commerce 24/7?

**SOLUCIÓN**:
- ✅ **Pure Digital** (solo online_store) → NO renderizar widget
- ✅ **Hybrid** (física + online) → Widget con 2 secciones
- ✅ **Physical** (sin online) → Widget tradicional con turno

---

## 🚀 PRÓXIMOS PASOS

### Inmediato
1. [ ] Revisar y aprobar estas decisiones
2. [ ] Actualizar `SHIFT_CONTROL_ARCHITECTURE.md` con cambios
3. [ ] Verificar exports API de Cash Module
4. [ ] Implementar Fase 1 corregida

### Preguntas Pendientes
1. ¿Apruebas el enfoque Context-Aware para multi-location?
2. ¿De acuerdo con NO renderizar widget para pure digital?
3. ¿Alguna combinación de capabilities que no consideramos?

---

**Documento creado por**: Claude Code
**Última actualización**: 2025-01-26
**Estado**: 🟡 Esperando aprobación de decisiones
