# ShiftControl Integration Guide

**Status**: ✅ Core implementation complete
**Next Step**: Integrate with existing modules

---

## ✅ COMPLETADO

### ShiftControl Module
- ✅ Types (types/index.ts)
- ✅ Store (store/shiftStore.ts)
- ✅ Handlers (handlers/*)
- ✅ Widget Component (components/ShiftControlWidget.tsx)
- ✅ Manifest (manifest.tsx)

### Cash Management Widgets
- ✅ CashSessionIndicator component created

---

## 📋 INTEGRACIÓN PENDIENTE

### 1. Actualizar cash-management/manifest.tsx

Agregar en la función `setup`:

```typescript
// Después de la línea 76 (registry.addAction dashboard.widgets)

// ============================================
// SHIFT CONTROL INTEGRATION
// ============================================

const { CashSessionIndicator } = await import('./widgets/CashSessionIndicator');

// Inject cash session indicator into ShiftControl
registry.addAction(
  'shift-control.indicators',
  ({ cashSession }) => <CashSessionIndicator cashSession={cashSession} key="cash-indicator" />,
  'cash-management',
  90  // High priority
);
```

Y actualizar el hooks.provide para incluir:

```typescript
hooks: {
  provide: [
    'cash.session.opened',
    'cash.session.closed',
    'cash.journal_entry.created',
    'cash.discrepancy.detected',
    'cash.drop.recorded',
    'dashboard.widgets',
    'shift-control.indicators',  // ← AGREGAR ESTA LÍNEA
  ],
  // ...
}
```

---

### 2. Registrar ShiftControl Module

**Ubicación**: Donde se registran los módulos (probablemente `src/App.tsx` o similar)

```typescript
import { shiftControlManifest } from '@/modules/shift-control';

// En la función de registro de módulos:
ModuleRegistry.getInstance().register(shiftControlManifest);
```

---

### 3. Agregar ShiftControl Widget al Dashboard

**Ubicación**: `src/modules/dashboard/manifest.tsx`

En la función `setup`, después de las otras inyecciones de widgets:

```typescript
// Importar el widget
const { ShiftControlWidget } = await import('@/modules/shift-control');

// Inyectar en dashboard (HIGHEST PRIORITY - Hero widget)
registry.addAction(
  'dashboard.widgets',
  () => <ShiftControlWidget key="shift-control" />,
  'shift-control',
  100  // Highest priority
);
```

---

## 🎯 PRÓXIMAS INTEGRACIONES (Opcional)

### Staff Module

**Crear**: `src/modules/staff/widgets/StaffIndicator.tsx`

```typescript
export function StaffIndicator({ activeStaffCount }: { activeStaffCount: number }) {
  return (
    <HStack gap="2" padding="3" borderWidth="1px" borderRadius="md">
      <Icon><UserGroupIcon /></Icon>
      <Text fontSize="sm">{activeStaffCount} empleados activos</Text>
    </HStack>
  );
}
```

**En** `src/modules/staff/manifest.tsx`:

```typescript
const { StaffIndicator } = await import('./widgets/StaffIndicator');

registry.addAction(
  'shift-control.indicators',
  ({ activeStaffCount }) => <StaffIndicator activeStaffCount={activeStaffCount} />,
  'staff',
  85
);
```

---

### Materials Module

**Crear**: `src/modules/materials/widgets/StockAlertIndicator.tsx`

```typescript
export function StockAlertIndicator({ lowStockAlerts }: { lowStockAlerts: number }) {
  if (lowStockAlerts === 0) return null;
  
  return (
    <HStack gap="2" padding="3" borderWidth="1px" borderRadius="md" borderColor="orange.200" bg="orange.50">
      <Icon color="orange.600"><ExclamationTriangleIcon /></Icon>
      <Text fontSize="sm" color="orange.800">{lowStockAlerts} alertas de stock</Text>
    </HStack>
  );
}
```

**En** `src/modules/materials/manifest.tsx`:

```typescript
const { StockAlertIndicator } = await import('./widgets/StockAlertIndicator');

registry.addAction(
  'shift-control.indicators',
  ({ lowStockAlerts }) => <StockAlertIndicator lowStockAlerts={lowStockAlerts} />,
  'materials',
  70
);
```

---

## 🧪 TESTING

### 1. Verificar Registro del Módulo

```typescript
// En consola del browser
const registry = ModuleRegistry.getInstance();
console.log(registry.isRegistered('shift-control')); // debe ser true
```

### 2. Verificar Event Subscriptions

```typescript
// En consola
import eventBus from '@/lib/events/EventBus';
eventBus.emit('cash.session.opened', { 
  payload: { cashSession: { /* mock data */ } }
});

// Verificar en Redux DevTools que el store se actualizó
```

### 3. Verificar Hook Injection

```typescript
// En consola
const registry = ModuleRegistry.getInstance();
const hooks = registry.hasHook('shift-control.indicators');
console.log(hooks); // debe ser true
```

---

## 🔍 TROUBLESHOOTING

### El widget no aparece en Dashboard

1. Verificar que shiftControlManifest esté registrado
2. Verificar que dashboard esté inyectando el widget con priority 100
3. Revisar console.log para errores de importación

### Los indicadores no aparecen

1. Verificar que el módulo (cash, staff, etc) esté activo
2. Verificar que las capabilities estén activadas
3. Revisar que los eventos se estén emitiendo correctamente

### El store no se actualiza

1. Verificar que los handlers estén suscritos correctamente
2. Usar Redux DevTools para ver el estado del ShiftStore
3. Agregar breakpoints en los handlers

---

## 📝 CHECKLIST DE INTEGRACIÓN

- [ ] Actualizar cash-management/manifest.tsx
- [ ] Registrar shiftControlManifest en App
- [ ] Inyectar ShiftControlWidget en dashboard
- [ ] Verificar que aparece en /admin/dashboard
- [ ] Probar abrir/cerrar caja
- [ ] Verificar que el indicador se actualiza
- [ ] (Opcional) Agregar staff indicator
- [ ] (Opcional) Agregar materials indicator

---

**Documentos Relacionados**:
- `IMPLEMENTATION_COMPLETE.md` - Implementación del módulo
- `SHIFTCONTROL_ARCHITECTURE_RESEARCH.md` - Investigación y decisiones

**Estado**: ⏳ Pendiente de integración manual
