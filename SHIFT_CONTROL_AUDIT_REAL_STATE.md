# 🔍 ShiftControl - Auditoría del Estado Real

**Fecha**: 2025-12-26  
**Objetivo**: Mapear widgets y registros REALES del proyecto (no suposiciones)

---

## ✅ WIDGETS YA EXISTENTES (ENCONTRADOS)

### 1. Cash-Management Module ✅ COMPLETAMENTE IMPLEMENTADO

**Widget**: `CashSessionIndicator.tsx`  
**Ubicación**: `src/modules/cash-management/widgets/CashSessionIndicator.tsx`  
**Registro**: ✅ SÍ - en `cash-management/manifest.tsx` línea 91

```typescript
// cash-management/manifest.tsx
registry.addAction(
  'shift-control.indicators',
  ({ cashSession }) => <CashSessionIndicator cashSession={cashSession} key="cash-indicator" />,
  'cash-management',
  90  // High priority
);
```

**Diseño actual**:
```tsx
<HStack gap="2" padding="3" borderWidth="1px" borderRadius="md">
  <Icon><BanknotesIcon /></Icon>
  <Text>Caja: $X.XX</Text>
  <Badge>Abierta</Badge>
</HStack>
```

**Estado**: ✅ FUNCIONAL - Ya se inyecta correctamente en ShiftControl

---

### 2. Staff Module ⚠️ WIDGET EXISTE PERO NO ESTÁ REGISTRADO

**Widget**: `StaffIndicator.tsx`  
**Ubicación**: `src/modules/staff/widgets/StaffIndicator.tsx`  
**Registro**: ❌ NO - falta en `staff/manifest.tsx`

**Props**:
```typescript
interface StaffIndicatorProps {
  activeStaffCount: number;
  scheduledStaffCount?: number;
}
```

**Diseño actual**:
```tsx
<HStack gap="2" padding="3" borderWidth="1px" borderRadius="md">
  <Icon><UserGroupIcon /></Icon>
  <Text>{activeStaffCount} empleados / {scheduledStaffCount}</Text>
  {hasDeficit && <Badge colorPalette="orange">Falta personal</Badge>}
</HStack>
```

**Acción requerida**:
```typescript
// ❌ FALTA AGREGAR EN staff/manifest.tsx (línea ~130)
const { StaffIndicator } = await import('./widgets/StaffIndicator');

registry.addAction(
  'shift-control.indicators',
  ({ activeStaffCount }) => (
    <StaffIndicator 
      activeStaffCount={activeStaffCount}
      scheduledStaffCount={undefined} // TODO: Agregar a data contract
      key="staff-indicator"
    />
  ),
  'staff',
  80
);
```

---

### 3. Materials Module ⚠️ WIDGET EXISTE PERO NO ESTÁ REGISTRADO

**Widget**: `StockAlertIndicator.tsx`  
**Ubicación**: `src/modules/materials/widgets/StockAlertIndicator.tsx`  
**Registro**: ❌ NO - falta en `materials/manifest.tsx`

**Props**:
```typescript
interface StockAlertIndicatorProps {
  lowStockAlerts: number;
}
```

**Diseño actual**:
```tsx
{lowStockAlerts > 0 && (
  <HStack gap="2" padding="3" borderWidth="1px" borderRadius="md">
    <Icon><ExclamationTriangleIcon /></Icon>
    <Text>{lowStockAlerts} alertas de stock</Text>
  </HStack>
)}
```

**Acción requerida**:
```typescript
// ❌ FALTA AGREGAR EN materials/manifest.tsx (línea ~160)
const { StockAlertIndicator } = await import('./widgets/StockAlertIndicator');

registry.addAction(
  'shift-control.indicators',
  ({ stockAlerts }) => (
    <StockAlertIndicator 
      lowStockAlerts={stockAlerts?.length || 0}
      key="stock-alert-indicator"
    />
  ),
  'materials',
  70
);
```

---

## ❌ WIDGETS QUE NO EXISTEN (NECESITAN CREACIÓN)

### 1. Tables Module (Operations) - ❌ NO EXISTE

**¿Qué hay actualmente?**  
- Módulo: `operations/fulfillment` (tables, pickup, delivery)
- Tiene: `FulfillmentQueueWidget` para dashboard
- NO tiene: Widget para shift-control.indicators

**¿Debería existir?**  
- ⚠️ DEPENDE - Solo si el negocio tiene mesas (feature `operations_table_management`)
- Si existe, debería mostrar: "🍽️ X mesas abiertas"

**Propuesta**:
```typescript
// operations/fulfillment/widgets/TablesIndicator.tsx (CREAR)
export function TablesIndicator({ openTablesCount }: { openTablesCount: number }) {
  if (openTablesCount === 0) return null;
  
  return (
    <HStack gap="2" padding="3" borderWidth="1px" borderRadius="md">
      <Icon><TableCellsIcon /></Icon>
      <Text>{openTablesCount} mesas abiertas</Text>
    </HStack>
  );
}
```

---

### 2. Delivery Module - ❌ NO EXISTE

**¿Qué hay actualmente?**  
- Módulo: Parte de `fulfillment` (onsite, pickup, delivery)
- NO tiene: Widget específico para deliveries en shift-control

**¿Debería existir?**  
- ⚠️ DEPENDE - Solo si el negocio hace entregas (feature `sales_delivery_orders`)
- Si existe, debería mostrar: "🚚 X entregas activas"

**Propuesta**:
```typescript
// fulfillment/widgets/DeliveryIndicator.tsx (CREAR)
export function DeliveryIndicator({ activeDeliveriesCount }: { activeDeliveriesCount: number }) {
  if (activeDeliveriesCount === 0) return null;
  
  return (
    <HStack gap="2" padding="3" borderWidth="1px" borderRadius="md">
      <Icon><TruckIcon /></Icon>
      <Text>{activeDeliveriesCount} entregas activas</Text>
    </HStack>
  );
}
```

---

### 3. Sales Module - ❌ NO HAY WIDGETS PARA SHIFT-CONTROL

**¿Qué hay actualmente?**  
- Módulo: `sales`
- Tiene: `SalesStatWidget`, `RevenueStatWidget` para dashboard
- NO tiene: Widget para shift-control (no debería - ShiftTotalsCard ya muestra ventas)

**¿Debería existir?**  
- ❌ NO - ShiftTotalsCard ya maneja totales de ventas
- Sales NO necesita inyectar nada en shift-control.indicators

---

## 📊 TABLA RESUMEN: ESTADO REAL

| Módulo | Widget | Archivo Existe | Registrado | Prioridad | Acción |
|--------|--------|----------------|------------|-----------|--------|
| Cash-Management | CashSessionIndicator | ✅ | ✅ | 90 | ✅ NADA (funciona) |
| Staff | StaffIndicator | ✅ | ❌ | 80 | ⚡ Registrar en manifest |
| Materials | StockAlertIndicator | ✅ | ❌ | 70 | ⚡ Registrar en manifest |
| Fulfillment (Tables) | TablesIndicator | ❌ | ❌ | 60 | 💡 Crear si feature activo |
| Fulfillment (Delivery) | DeliveryIndicator | ❌ | ❌ | 50 | 💡 Crear si feature activo |
| Sales | - | - | - | - | ❌ No necesita widget |

---

## 🎯 PLAN DE ACCIÓN REALISTA

### Fase 1: Registrar Widgets Existentes ⚡ INMEDIATO (30 min)

#### 1.1. Staff Module
**Archivo**: `src/modules/staff/manifest.tsx`

```typescript
// Agregar después de línea 124 (después de StaffStatWidget)

// ============================================
// SHIFT CONTROL INTEGRATION
// ============================================

const { StaffIndicator } = await import('./widgets/StaffIndicator');

registry.addAction(
  'shift-control.indicators',
  ({ activeStaffCount }) => (
    <StaffIndicator 
      activeStaffCount={activeStaffCount}
      key="staff-indicator"
    />
  ),
  'staff',
  80
);

logger.debug('App', 'Registered shift-control.indicators hook (StaffIndicator)');
```

#### 1.2. Materials Module
**Archivo**: `src/modules/materials/manifest.tsx`

```typescript
// Agregar después de línea 157 (después de PendingOrdersWidget)

// ============================================
// SHIFT CONTROL INTEGRATION
// ============================================

const { StockAlertIndicator } = await import('./widgets/StockAlertIndicator');

registry.addAction(
  'shift-control.indicators',
  ({ stockAlerts }) => (
    <StockAlertIndicator 
      lowStockAlerts={stockAlerts?.length || 0}
      key="stock-alert-indicator"
    />
  ),
  'materials',
  70
);

logger.debug('App', 'Registered shift-control.indicators hook (StockAlertIndicator)');
```

---

### Fase 2: Verificar Data Contract 🔍 (15 min)

**Problema actual**: El data contract de `shift-control.indicators` NO incluye `stockAlerts` array completo.

**Revisar**: `src/modules/shift-control/components/ShiftControlWidget.tsx`

```typescript
// ¿Qué se pasa actualmente?
const indicatorsData = {
  shiftId: currentShift?.id,
  cashSession,
  activeStaffCount,
  openTablesCount,
  activeDeliveriesCount,
  pendingOrdersCount,
  stockAlerts  // ← ¿Es un número o un array?
};
```

**Verificar tipo en store**:
```typescript
// src/store/shiftStore.ts
interface ShiftState {
  stockAlerts: StockAlert[];  // ← Array
  // o
  stockAlertsCount: number;    // ← Número
}
```

**Acción**: Confirmar tipo y ajustar si es necesario.

---

### Fase 3: Testing (30 min)

**Checklist**:
```
[ ] Abrir turno
[ ] Cash-Management: Abrir caja → ver badge "Caja: $X.XX"
[ ] Staff: Check-in empleado → ver "X empleados"
[ ] Materials: Stock bajo → ver "X alertas de stock"
[ ] Dashboard: Todos los widgets se renderizan sin errores
[ ] DevTools: No hay warnings de props
```

---

### Fase 4 (OPCIONAL): Widgets Condicionales (1-2 horas)

Solo si las features están activas:

#### 4.1. Tables Indicator (Operations)
```typescript
// fulfillment/widgets/TablesIndicator.tsx (CREAR)
export function TablesIndicator({ openTablesCount }: { openTablesCount: number }) {
  if (openTablesCount === 0) return null;
  
  return (
    <HStack gap="2" padding="3" borderWidth="1px" borderRadius="md" borderColor="purple.200" bg="purple.50">
      <Icon color="purple.600"><TableCellsIcon /></Icon>
      <Text fontSize="sm" fontWeight="medium">{openTablesCount} mesas abiertas</Text>
    </HStack>
  );
}

// fulfillment/manifest.tsx (AGREGAR)
import { useCapabilityStore } from '@/store/capabilityStore';

if (useCapabilityStore.getState().hasFeature('operations_table_management')) {
  const { TablesIndicator } = await import('./widgets/TablesIndicator');
  
  registry.addAction(
    'shift-control.indicators',
    ({ openTablesCount }) => <TablesIndicator openTablesCount={openTablesCount} key="tables-indicator" />,
    'fulfillment',
    60
  );
}
```

#### 4.2. Delivery Indicator (Operations)
```typescript
// fulfillment/widgets/DeliveryIndicator.tsx (CREAR)
export function DeliveryIndicator({ activeDeliveriesCount }: { activeDeliveriesCount: number }) {
  if (activeDeliveriesCount === 0) return null;
  
  return (
    <HStack gap="2" padding="3" borderWidth="1px" borderRadius="md" borderColor="blue.200" bg="blue.50">
      <Icon color="blue.600"><TruckIcon /></Icon>
      <Text fontSize="sm" fontWeight="medium">{activeDeliveriesCount} entregas activas</Text>
    </HStack>
  );
}

// fulfillment/manifest.tsx (AGREGAR)
if (useCapabilityStore.getState().hasFeature('sales_delivery_orders')) {
  const { DeliveryIndicator } = await import('./widgets/DeliveryIndicator');
  
  registry.addAction(
    'shift-control.indicators',
    ({ activeDeliveriesCount }) => <DeliveryIndicator activeDeliveriesCount={activeDeliveriesCount} key="delivery-indicator" />,
    'fulfillment',
    50
  );
}
```

---

## 🚨 OTROS HALLAZGOS CRÍTICOS

### 1. CashSessionIndicator existe en DOS lugares ❓

**Ubicación 1**: `src/modules/cash-management/widgets/CashSessionIndicator.tsx` (REGISTRADO)  
**Ubicación 2**: `src/modules/shift-control/components/CashSessionIndicator.tsx` (USADO EN WIDGET)

**Pregunta**: ¿Son el mismo componente? ¿Cuál se usa?

**Acción**: Revisar si hay duplicación o conflicto.

---

### 2. ShiftStats muestra valores inline ⚠️

**Ubicación**: `src/modules/shift-control/components/ShiftStats.tsx`

**Problema**: ShiftStats renderiza stats inline (activeStaffCount, etc.) pero TAMBIÉN hay widgets inyectados.

**Duplicación potencial**:
- ShiftStats muestra "👥 5 empleados" (fijo)
- StaffIndicator inyecta "👥 5 empleados / 8" (dinámico)

**Decisión requerida**:
- **Opción A**: Eliminar ShiftStats, dejar todo a widgets inyectados
- **Opción B**: ShiftStats solo muestra números, widgets muestran detalles
- **Opción C**: Mantener ambos (puede ser redundante)

**Recomendación**: OPCIÓN B - ShiftStats compacto (solo números), widgets aportan contexto

---

## 📝 CONCLUSIONES

1. **✅ Cash-Management está completo** - Widget existe y está registrado
2. **⚡ Staff y Materials necesitan solo registro** - Widgets YA existen (30 min trabajo)
3. **💡 Tables y Delivery son opcionales** - Dependen de features activos (1-2h si se implementan)
4. **🔍 Revisar duplicación de CashSessionIndicator** - Hay 2 archivos con mismo nombre
5. **⚠️ Decisión de diseño requerida** - ShiftStats vs Widgets inyectados (redundancia?)

**Tiempo total estimado**:
- Mínimo (solo registros): 45 minutos
- Completo (con widgets opcionales): 2-3 horas

---

**FIN DE AUDITORÍA**
