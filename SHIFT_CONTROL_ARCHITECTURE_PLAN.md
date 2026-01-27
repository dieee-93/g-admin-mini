# ShiftControl - Plan Arquitectónico Completo

**Fecha**: 2025-12-26
**Estado**: 📋 PLANIFICACIÓN
**Objetivo**: Definir arquitectura de widgets fijos vs dinámicos y estrategia de integración

---

## 🎯 PRINCIPIO ARQUITECTÓNICO CLAVE

**ShiftControl NO debe saber nada de otros módulos**. Usa:
- **HookPoints** para inyección dinámica
- **EventBus** para comunicación asíncrona
- **Zustand Store** para estado consolidado

```
┌─────────────────────────────────────────────────────┐
│ ShiftControlWidget (Core Container)                │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ ShiftHeader (FIJO)                          │   │
│ │ - Timer, status, location                   │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ ShiftTotalsCard (FIJO)                      │   │
│ │ - Total turno + payment methods             │   │
│ │ - Source: shift.cash_total, card_total, etc│   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ ShiftStats (SEMI-FIJO)                      │   │
│ │ - Source: shiftStore (event-driven)         │   │
│ │ - activeStaffCount, openTablesCount, etc    │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ HookPoint: shift-control.indicators         │   │
│ │ (DINÁMICO - Módulos se inyectan)            │   │
│ │                                             │   │
│ │ ▸ Cash Module → CashSessionIndicator        │   │
│ │ ▸ Staff Module → StaffScheduleIndicator     │   │
│ │ ▸ Inventory Module → StockAlertsIndicator   │   │
│ │ ▸ Tables Module → TablesStatusIndicator     │   │
│ │ ▸ Delivery Module → DeliveryMapIndicator    │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ─────────────────────────────────────────────────  │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ Core Actions (FIJO)                         │   │
│ │ [Abrir Turno] [Cerrar Turno]                │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ HookPoint: shift-control.quick-actions      │   │
│ │ (DINÁMICO)                                  │   │
│ │                                             │   │
│ │ ▸ Operations → [Ver Mesas] [Ver Pedidos]   │   │
│ │ ▸ Delivery → [Mapa de Entregas]            │   │
│ │ ▸ Reports → [Exportar Reporte]             │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ HookPoint: shift-control.alerts             │   │
│ │ (DINÁMICO)                                  │   │
│ │                                             │   │
│ │ ▸ Cash → "Caja desbalanceada"              │   │
│ │ ▸ Inventory → "Stock bajo: 3 items"        │   │
│ │ ▸ Staff → "Personal insuficiente"          │   │
│ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 📊 COMPONENTES FIJOS (Core ShiftControl)

### 1. **ShiftHeader** ✅ YA IMPLEMENTADO
**Responsabilidad**: Estado básico del turno
**Datos**:
- `shift: OperationalShift` - del store
- `isOperational: boolean` - computado
- `locationName: string` - de LocationContext

**NO depende de**: Otros módulos

---

### 2. **ShiftTotalsCard** ✅ YA IMPLEMENTADO
**Responsabilidad**: Totales consolidados del turno
**Datos**:
```typescript
{
  shift: {
    cash_total: number,
    card_total: number,
    transfer_total: number,
    qr_total: number
  },
  cashSession: CashSessionRow | null  // Para mostrar "en caja" real-time
}
```

**Actualización**: 
- `shift.*_total` se actualizan vía eventos `sales.payment.completed` (PENDIENTE FASE 2)
- `cashSession` viene del store (ya suscrito a `cash.session.*`)

**NO renderiza**: Indicadores de otros módulos (solo totales)

---

### 3. **ShiftStats** ✅ YA IMPLEMENTADO (MEJORADO)
**Responsabilidad**: Indicadores operativos básicos
**Datos del Store** (actualizados por eventos):
```typescript
{
  activeStaffCount: number,      // ← staff.employee.checked_in/out
  openTablesCount: number,        // ← tables.table.opened/closed
  activeDeliveriesCount: number,  // ← delivery.started/completed
  pendingOrdersCount: number,     // ← order.created/completed
  stockAlertsCount: number        // ← inventory.stock.low
}
```

**Característica**: Solo muestra stats > 0 (compacto)

**NO renderiza**: Contenido de otros módulos (solo números)

---

## 🔌 HOOKPOINTS DINÁMICOS (Inyección de Módulos)

### HookPoint 1: `shift-control.indicators`

**Propósito**: Widgets específicos de cada módulo
**Ubicación**: Después de ShiftStats
**Data Contract**:
```typescript
interface ShiftIndicatorData {
  shiftId: string;
  cashSession: CashSessionRow | null;
  activeStaffCount: number;
  openTablesCount: number;
  activeDeliveriesCount: number;
  pendingOrdersCount: number;
  stockAlerts: StockAlert[];
}
```

**Módulos que DEBEN inyectar**:

#### Cash Module → `CashSessionIndicator`
```typescript
// cash/manifest.tsx
registry.addAction(
  'shift-control.indicators',
  ({ cashSession }) => (
    <CashSessionIndicator 
      cashSession={cashSession}
      compact={true}
    />
  ),
  'cash-management',
  90  // Alta prioridad
);
```
**Visual**: Badge pequeño "💵 Caja Abierta • $5,000"
**Estado**: ✅ YA IMPLEMENTADO (componente existe, falta registro)

#### Staff Module → `StaffScheduleIndicator` 
```typescript
// staff/manifest.tsx
registry.addAction(
  'shift-control.indicators',
  ({ activeStaffCount, shiftId }) => {
    const scheduledCount = useStaffSchedule(shiftId);
    return (
      <StaffScheduleIndicator
        activeCount={activeStaffCount}
        scheduledCount={scheduledCount}
      />
    );
  },
  'staff-management',
  80
);
```
**Visual**: Badge "👥 5/8 programados" (warning si deficit)
**Estado**: ❌ NO IMPLEMENTADO

#### Inventory Module → `StockAlertsIndicator`
```typescript
// materials/manifest.tsx
registry.addAction(
  'shift-control.indicators',
  ({ stockAlerts }) => {
    if (stockAlerts.length === 0) return null;
    return (
      <StockAlertsIndicator
        alerts={stockAlerts}
      />
    );
  },
  'materials-inventory',
  70
);
```
**Visual**: Badge "⚠️ 3 items bajo stock" (click → modal con lista)
**Estado**: ❌ NO IMPLEMENTADO

#### Tables Module → `TablesStatusIndicator`
```typescript
// operations/tables/manifest.tsx
registry.addAction(
  'shift-control.indicators',
  ({ openTablesCount }) => {
    if (openTablesCount === 0) return null;
    return (
      <TablesStatusIndicator
        openCount={openTablesCount}
      />
    );
  },
  'operations-tables',
  60
);
```
**Visual**: Badge "🍽️ 5 mesas abiertas" (click → ver mesas)
**Estado**: ❌ NO IMPLEMENTADO

#### Delivery Module → `DeliveryMapIndicator`
```typescript
// delivery/manifest.tsx
registry.addAction(
  'shift-control.indicators',
  ({ activeDeliveriesCount }) => {
    if (activeDeliveriesCount === 0) return null;
    return (
      <DeliveryMapIndicator
        activeCount={activeDeliveriesCount}
      />
    );
  },
  'fulfillment-delivery',
  50
);
```
**Visual**: Badge "🚚 3 entregas activas" (click → mapa)
**Estado**: ❌ NO IMPLEMENTADO

---

### HookPoint 2: `shift-control.quick-actions`

**Propósito**: Botones de acción rápida específicos por módulo
**Ubicación**: Junto a botones "Abrir/Cerrar Turno"
**Data Contract**:
```typescript
interface ShiftQuickActionData {
  shift: OperationalShift | null;
  uiState: ShiftUIState;
  refreshShift: () => Promise<void>;
}
```

**Módulos que PUEDEN inyectar**:

#### Operations Module → "Ver Mesas"
```typescript
registry.addAction(
  'shift-control.quick-actions',
  ({ shift }) => {
    if (!shift) return null;
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate('/admin/operations/fulfillment/onsite')}
      >
        🍽️ Ver Mesas
      </Button>
    );
  },
  'operations-tables',
  50
);
```

#### Delivery Module → "Mapa de Entregas"
```typescript
registry.addAction(
  'shift-control.quick-actions',
  ({ shift }) => {
    if (!shift) return null;
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate('/admin/operations/fulfillment/delivery')}
      >
        🗺️ Mapa
      </Button>
    );
  },
  'fulfillment-delivery',
  40
);
```

#### Reports Module → "Exportar Reporte"
```typescript
registry.addAction(
  'shift-control.quick-actions',
  ({ shift }) => {
    if (!shift) return null;
    return (
      <Button
        size="sm"
        variant="ghost"
        onClick={() => exportShiftReport(shift.id)}
      >
        📊 Exportar
      </Button>
    );
  },
  'reports',
  30
);
```

**Estado**: ❌ NINGUNO IMPLEMENTADO

---

### HookPoint 3: `shift-control.alerts`

**Propósito**: Alertas críticas que requieren atención
**Ubicación**: Al final del widget (si hay alertas)
**Data Contract**:
```typescript
interface ShiftAlertData {
  shiftId: string;
  onDismissAlert: (alertId: string) => void;
}
```

**Módulos que PUEDEN inyectar**:

#### Cash Module → Alertas de descuadre
```typescript
registry.addAction(
  'shift-control.alerts',
  ({ shiftId }) => {
    const balanceIssue = useCashBalanceCheck(shiftId);
    
    if (!balanceIssue) return null;
    
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>Descuadre de caja</AlertTitle>
        <AlertDescription>
          Diferencia de ${balanceIssue.difference}. 
          <Link onClick={() => navigate('/admin/finance/cash')}>
            Ver detalles
          </Link>
        </AlertDescription>
      </Alert>
    );
  },
  'cash-management',
  100  // Crítico
);
```

#### Inventory Module → Alertas de stock crítico
```typescript
registry.addAction(
  'shift-control.alerts',
  ({ shiftId }) => {
    const criticalStock = useCriticalStockItems(shiftId);
    
    if (criticalStock.length === 0) return null;
    
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Stock crítico</AlertTitle>
        <AlertDescription>
          {criticalStock.length} productos sin stock. 
          <Link onClick={() => navigate('/admin/supply-chain/materials')}>
            Ver inventario
          </Link>
        </AlertDescription>
      </Alert>
    );
  },
  'materials-inventory',
  90
);
```

#### Staff Module → Alerta de personal insuficiente
```typescript
registry.addAction(
  'shift-control.alerts',
  ({ shiftId }) => {
    const staffShortage = useStaffShortageCheck(shiftId);
    
    if (!staffShortage) return null;
    
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>Personal insuficiente</AlertTitle>
        <AlertDescription>
          Faltan {staffShortage.missing} empleados programados.
        </AlertDescription>
      </Alert>
    );
  },
  'staff-management',
  80
);
```

**Estado**: ❌ NINGUNO IMPLEMENTADO

---

## 🔄 FLUJO DE DATOS (Event-Driven)

### Ejemplo: Staff Check-In

```
1. Usuario hace check-in en Staff Module
   ↓
2. staffService.checkIn() → DB update
   ↓
3. eventBus.emit('staff.employee.checked_in', { employee_id, ... })
   ↓
4. ShiftControl handler: handleStaffCheckedIn()
   ↓
5. useShiftStore.incrementActiveStaffCount()
   ↓
6. ShiftStats re-renderiza (Zustand subscription)
   ↓
7. Staff Module indicator actualiza (si inyectado)
```

**Clave**: ShiftControl nunca llama a Staff Module directamente.

---

### Ejemplo: Payment Completed (PENDIENTE)

```
1. Usuario completa venta en Sales Module
   ↓
2. salesService.completePayment() → DB insert
   ↓
3. eventBus.emit('sales.payment.completed', {
     shift_id, payment_method, amount
   })
   ↓
4. ShiftControl handler: handlePaymentCompleted()
   ↓
5. shiftService.incrementShiftTotal(shift_id, method, amount)
   ↓
6. DB: UPDATE operational_shifts SET card_total += amount
   ↓
7. Handler reloads shift from DB
   ↓
8. useShiftStore.updateShift(shift_id, updatedShift)
   ↓
9. ShiftTotalsCard re-renderiza (Zustand subscription)
```

**Estado**: ❌ NO IMPLEMENTADO (Fase 2)

---

## 📋 ESTADO DE IMPLEMENTACIÓN

### Core Components (ShiftControl)

| Componente | Estado | Observaciones |
|------------|--------|---------------|
| ShiftHeader | ✅ | Funcionando correctamente |
| ShiftTotalsCard | ⚠️ | Renderiza pero totales en $0 (faltan eventos) |
| ShiftStats | ✅ | Compacto, solo muestra > 0 |
| OpenShiftModal | ✅ | Con validación de achievements |
| CloseShiftModal | ✅ | Con ValidationBlockersUI |
| ValidationBlockersUI | ✅ | Muestra blockers al cerrar |

### Event Handlers (ShiftControl)

| Handler | Evento | Estado | Funciona |
|---------|--------|--------|----------|
| handleCashSessionOpened | cash.session.opened | ✅ | ✅ SI |
| handleCashSessionClosed | cash.session.closed | ✅ | ✅ SI |
| handleStaffCheckedIn | staff.employee.checked_in | ✅ | ⚠️ Sí, pero no se ve (Staff no emite?) |
| handleStaffCheckedOut | staff.employee.checked_out | ✅ | ⚠️ Sí, pero no se ve |
| handlePaymentCompleted | sales.payment.completed | ❌ | NO (no existe) |
| handleTableOpened | tables.table.opened | ✅ | ❓ Sin confirmar |
| handleTableClosed | tables.table.closed | ✅ | ❓ Sin confirmar |
| handleDeliveryStarted | delivery.started | ✅ | ❓ Sin confirmar |
| handleOrderCreated | order.created | ✅ | ❓ Sin confirmar |

### HookPoint Injections (Otros Módulos)

| Módulo | HookPoint | Componente | Estado |
|--------|-----------|------------|--------|
| Cash | indicators | CashSessionIndicator | ⚠️ Componente existe, falta registro |
| Staff | indicators | StaffScheduleIndicator | ❌ No existe |
| Materials | indicators | StockAlertsIndicator | ❌ No existe |
| Tables | indicators | TablesStatusIndicator | ❌ No existe |
| Delivery | indicators | DeliveryMapIndicator | ❌ No existe |
| Operations | quick-actions | Ver Mesas button | ❌ No registrado |
| Delivery | quick-actions | Mapa button | ❌ No registrado |
| Reports | quick-actions | Exportar button | ❌ No registrado |
| Cash | alerts | Balance alerts | ❌ No existe |
| Materials | alerts | Stock alerts | ❌ No existe |
| Staff | alerts | Shortage alerts | ❌ No existe |

---

## 🎯 PLAN DE TRABAJO PROPUESTO

### Fase 1: Core ShiftControl ✅ (COMPLETADA)
- [x] ShiftTotalsCard compacto
- [x] ShiftStats horizontal
- [x] CashSessionIndicator refactorizado
- [x] Widget reorganizado
- [x] Espaciado optimizado

### Fase 2: Event Handlers Faltantes (CRÍTICO)
**Duración**: 2-3 horas

1. **Sales Payment Handler** ⭐ PRIORIDAD MÁXIMA
   ```typescript
   // handlers/salesHandlers.ts (CREAR)
   export const handlePaymentCompleted = createShiftAwareHandler(
     'sales.payment.completed',
     async (event) => {
       const { shift_id, payment_method, amount } = event.data;
       await shiftService.incrementShiftTotal(shift_id, payment_method, amount);
       const updatedShift = await shiftService.getShiftById(shift_id);
       useShiftStore.getState().updateShift(shift_id, updatedShift);
     }
   );
   ```

2. **SQL Function for Increment**
   ```sql
   CREATE OR REPLACE FUNCTION increment_shift_total(
     p_shift_id UUID,
     p_column TEXT,
     p_amount NUMERIC
   ) ...
   ```

3. **Sales Module Integration**
   - Verificar que Sales emite `sales.payment.completed`
   - Si no, agregar `eventBus.emit()` en salesService

### Fase 3: Registros de CashSessionIndicator (FÁCIL)
**Duración**: 30 minutos

```typescript
// modules/cash/manifest.tsx
registry.addAction(
  'shift-control.indicators',
  ({ cashSession }) => (
    <CashSessionIndicator cashSession={cashSession} compact={true} />
  ),
  'cash-management',
  90
);
```

### Fase 4: Indicadores de Otros Módulos (OPCIONAL)
**Duración**: 1-2 horas por módulo

Orden sugerido:
1. Staff → StaffScheduleIndicator
2. Materials → StockAlertsIndicator
3. Tables → TablesStatusIndicator
4. Delivery → DeliveryMapIndicator

### Fase 5: Quick Actions (OPCIONAL)
**Duración**: 1 hora

Botones simples que navegan a módulos existentes.

### Fase 6: Alerts (OPCIONAL)
**Duración**: 2-3 horas

Requiere lógica de detección en cada módulo.

---

## 🚨 DECISIONES ARQUITECTÓNICAS CRÍTICAS

### 1. **CashSessionIndicator: ¿Fijo o Dinámico?**

**Opción A**: Mantener en ShiftStats (FIJO)
- ✅ Simple, ya funciona
- ❌ ShiftControl conoce de Cash Module

**Opción B**: Mover a HookPoint (DINÁMICO) ⭐ RECOMENDADO
- ✅ Arquitectura limpia
- ✅ Cash Module es opcional
- ❌ Requiere registrar en manifest

**Decisión**: OPCIÓN B - Mover a HookPoint

---

### 2. **ShiftStats: ¿Qué mostrar cuando todo es 0?**

**Opción A**: Mostrar placeholder "Sin actividad"
- ✅ No confunde al usuario
- ❌ Ocupa espacio innecesario

**Opción B**: Ocultar completamente
- ✅ UI más limpia
- ❌ Usuario no sabe si hay error

**Opción C**: Mostrar solo "👥 0 Personal" (mínimo) ⭐ RECOMENDADO
- ✅ Indica que el sistema funciona
- ✅ Compacto
- ✅ Muestra info básica

**Decisión**: OPCIÓN C - Siempre mostrar Personal (aunque sea 0)

---

### 3. **Orden de Indicadores en HookPoint**

**Prioridades** (orden visual):
1. **90**: CashSessionIndicator (Cash)
2. **80**: StaffScheduleIndicator (Staff)
3. **70**: StockAlertsIndicator (Materials)
4. **60**: TablesStatusIndicator (Tables)
5. **50**: DeliveryMapIndicator (Delivery)

**Layout**: Horizontal wrap, sin overflow scroll

---

## 📊 MÉTRICAS DE ÉXITO

### UX
- [ ] Total turno visible en < 1 segundo
- [ ] Totales se actualizan en tiempo real con ventas
- [ ] Indicadores se cargan dinámicamente según módulos activos
- [ ] UI es compacta (< 400px altura total)
- [ ] No hay información redundante

### Performance
- [ ] Store updates no causan re-renders innecesarios
- [ ] HookPoints no generan layout shift
- [ ] Event handlers ejecutan en < 100ms
- [ ] Ningún componente renderiza > 2 veces por evento

### Arquitectura
- [ ] ShiftControl no importa de otros módulos
- [ ] Todos los módulos usan EventBus para comunicación
- [ ] HookPoints funcionan con módulos deshabilitados
- [ ] Store state es serializable (persist funciona)

---

## 🔧 PRÓXIMOS PASOS INMEDIATOS

### 1. Mover CashSessionIndicator a HookPoint (30 min)
- Quitar de ShiftStats inline
- Registrar en cash/manifest.tsx
- Verificar que funciona

### 2. Implementar Sales Payment Handler (2 horas)
- Crear handlers/salesHandlers.ts
- Crear SQL function
- Verificar Sales Module emite evento
- Testing manual

### 3. Testing de Event Flow (1 hora)
- Abrir turno
- Hacer check-in de personal → ver contador
- Crear venta → ver totales actualizarse
- Cerrar turno → verificar validaciones

**Total estimado**: 3.5 horas para funcionalidad básica completa

---

**FIN DEL PLAN ARQUITECTÓNICO**
