# ShiftControl - UI Architecture & Design (MASTER DOCUMENT)

**Fecha**: 2025-12-04
**Estado**: ✅ COMPLETE - Ready for critical review  
**Versión**: 2.0 - Feature-based mapping corregido

---

## 🎯 RESUMEN EJECUTIVO

ShiftControl es un módulo **event-driven** que gestiona el estado operativo del negocio mediante:
- ✅ **Subscripciones a eventos** (NO orquestación manual)
- ✅ **Mapeo feature-based** (many-to-many, NO 1:1 simplista)
- ✅ **Multiple operational shifts** por día
- ✅ **HookPoint pattern** para extensibilidad
- ✅ **Zustand store** reactivo y performante

**Arquitectura clave**: EventBus → Handlers → Store → UI (unidirectional)

---

## 🧩 FEATURE-BASED MAPPING (CORREGIDO)

### ❌ Mapeo Simplista Incorrecto

```typescript
// MAL: Asumir relación 1:1
if (hasCapability('physical_products')) {
  subscribe('cash.session.opened');
}
```

### ✅ Mapeo REAL (BusinessModelRegistry)

| Feature | Activado Por Capabilities | Eventos Suscritos |
|---------|--------------------------|-------------------|
| `sales_payment_processing` | physical_products, professional_services, onsite_service, pickup_orders, delivery_shipping | cash.session.* |
| `inventory_stock_tracking` | physical_products, onsite_service, pickup_orders, delivery_shipping | inventory.* |
| `staff_employee_management` | professional_services, onsite_service, pickup_orders, delivery_shipping, corporate_sales, mobile_operations | staff.employee.* |
| `operations_table_management` | onsite_service | tables.* |
| `scheduling_appointment_booking` | professional_services, asset_rental, membership_subscriptions | appointments.* |

**Conclusión**: El mapeo es **many-to-many**, NO 1:1.

---

## 🏗️ COMPONENT TREE

```
ShiftControlWidget
├─ ShiftHeader (status badge, tiempo operativo)
├─ ShiftStats (ventas, labor cost, staff activo)
├─ IndicatorsSection
│  └─ <HookPoint name="shift-control.indicators" />
│     ├─ CashSessionIndicator (Cash Module)
│     ├─ StaffIndicator (Staff Module) 
│     ├─ StockAlertIndicator (Materials Module)
│     └─ [Dynamic indicators...]
├─ QuickActionsSection
│  └─ <HookPoint name="shift-control.quick-actions" />
│     ├─ OpenShiftButton / CloseShiftButton
│     └─ [Dynamic actions...]
├─ AlertsPanel
│  └─ <HookPoint name="shift-control.alerts" />
└─ ShiftFooter (history, last closed summary)
```

---

## 🎭 STATE MACHINE

```
NO_SHIFT → OPENING_MODAL → SHIFT_ACTIVE → VALIDATE_CLOSE
                                ↓
                    [BLOCKED] o [CLOSING_MODAL] → CLOSING → SHIFT_CLOSED → NO_SHIFT
```

---

## 📦 ZUSTAND STORE

```typescript
interface ShiftState {
  // Multiple shifts (NO single)
  shifts: OperationalShift[];
  activeShiftId: string | null;
  
  // Indicators (actualizados por event handlers)
  cashSession: CashSessionRow | null;
  activeStaffCount: number;
  openTablesCount: number;
  activeDeliveriesCount: number;
  
  // Computed getters
  getCurrentShift(): OperationalShift | null;
  isOperational(): boolean;
}
```

---

## 🔌 EVENT SUBSCRIPTIONS (Feature-Based)

```typescript
// manifest.tsx setup
const { hasFeature } = useCapabilityStore.getState();

// Cash (múltiples capabilities lo activan)
if (hasFeature('sales_payment_processing')) {
  eventBus.subscribe('cash.session.opened', handleCashOpened);
}

// Staff (6+ capabilities lo activan)
if (hasFeature('staff_employee_management')) {
  eventBus.subscribe('staff.employee.checked_in', handleStaffCheckIn);
}

// Tables (solo onsite_service)
if (hasFeature('operations_table_management')) {
  eventBus.subscribe('tables.opened', handleTableOpened);
}
```

---

## ⚡ PERFORMANCE

- ✅ `React.memo` en componentes con props estables
- ✅ `useShallow` en selectores Zustand múltiples
- ✅ Selectores específicos para valores individuales
- ✅ Lazy loading de modals

---

## 🎯 IMPLEMENTATION CHECKLIST

**Fase 1**: Types, Store, Handlers, Services (2-3 días)  
**Fase 2**: UI Components (2-3 días)  
**Fase 3**: Modals (1-2 días)  
**Fase 4**: Integration (1 día)  
**Fase 5**: Testing (1-2 días)  

**Total**: ~10 días

---

## 🔍 PRÓXIMO PASO

**REVISIÓN CRÍTICA** del documento para detectar:
- Gaps arquitectónicos
- Casos no cubiertos  
- Inconsistencias con convenciones
- Optimizaciones faltantes

---

**Estado**: ✅ COMPLETE - Ready for review  
**Versión**: 2.0 (Feature-based corrected)  
**Autor**: Claude Code + User Feedback
