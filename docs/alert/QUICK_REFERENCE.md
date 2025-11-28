# 🔔 Sistema de Alertas - Referencia Rápida

## 🚀 Quick Start

### Usar alertas en un componente

```typescript
import { useAlerts } from '@/shared/alerts';

function MyComponent() {
  const { alerts, count, actions } = useAlerts({
    context: 'materials',
    status: 'active'
  });

  return (
    <div>
      <Badge>{count} alertas</Badge>
      {alerts.map(alert => (
        <Alert key={alert.id}>
          <Alert.Title>{alert.title}</Alert.Title>
          <Button onClick={() => actions.resolve(alert.id)}>
            Resolver
          </Button>
        </Alert>
      ))}
    </div>
  );
}
```

## 📝 Crear Alertas

### Alerta Simple

```typescript
const { actions } = useAlerts();

await actions.create({
  type: 'stock',
  severity: 'high',
  context: 'materials',
  title: 'Stock bajo: Harina',
  description: 'Quedan 5 unidades'
});
```

### Alerta con Acciones

```typescript
await actions.create({
  type: 'stock',
  severity: 'critical',
  context: 'materials',
  title: 'Stock agotado',
  actions: [
    {
      label: 'Comprar ahora',
      variant: 'primary',
      action: () => navigate('/purchase-orders/new'),
      autoResolve: true
    }
  ]
});
```

### Bulk Create (Performance)

```typescript
const alerts = items.map(item => ({
  type: 'stock',
  severity: 'high',
  context: 'materials',
  title: `Stock bajo: ${item.name}`
}));

await actions.bulkCreate(alerts); // ✅ Single state update
```

## 🎯 Filtros y Queries

### Por Contexto

```typescript
const { alerts } = useAlerts({ 
  context: 'materials',
  autoFilter: true 
});
```

### Por Severidad

```typescript
const { alerts } = useAlerts({ 
  severity: ['critical', 'high'],
  autoFilter: true 
});
```

### Por Status

```typescript
const { alerts } = useAlerts({ 
  status: ['active', 'acknowledged'],
  autoFilter: true 
});
```

### Múltiples Filtros

```typescript
const { alerts } = useAlerts({
  context: ['materials', 'products'],
  severity: 'critical',
  status: 'active',
  autoFilter: true
});
```

## 🎨 UI Components

### GlobalAlertsDisplay

```typescript
import { AutoGlobalAlertsDisplay } from '@/shared/alerts';

function App() {
  return (
    <AlertsProvider>
      <YourApp />
      <AutoGlobalAlertsDisplay />
    </AlertsProvider>
  );
}
```

### AlertBadge

```typescript
import { NavAlertBadge, StockAlertBadge } from '@/shared/alerts';

// Navigation badge (all contexts)
<NavAlertBadge />

// Stock alerts badge (materials context)
<StockAlertBadge />

// Custom context badge
<AlertBadge context="sales" />
```

### CollapsibleAlertStack

```typescript
import { CollapsibleAlertStack } from '@/shared/ui';

<CollapsibleAlertStack
  alerts={alertItems}
  defaultOpen={true}
  title="Alertas de Inventario"
  variant="subtle"
  showCount
/>
```

## 🔧 Acciones

### Acknowledge (Reconocer)

```typescript
await actions.acknowledge(alertId, 'Revisado por equipo');
```

### Resolve (Resolver)

```typescript
await actions.resolve(alertId, 'Problema solucionado');
```

### Dismiss (Descartar)

```typescript
await actions.dismiss(alertId);
```

### Update (Actualizar)

```typescript
await actions.update(alertId, {
  severity: 'medium',
  description: 'Descripción actualizada'
});
```

### Bulk Operations

```typescript
// Acknowledge múltiples
await actions.bulkAcknowledge(['id1', 'id2', 'id3']);

// Resolve múltiples
await actions.bulkResolve(['id1', 'id2']);

// Clear todas las alertas de un contexto
await actions.clearAll({ context: 'materials' });
```

## 📊 Stats y Analytics

### useAlertsStats

```typescript
import { useAlertsStats } from '@/shared/alerts';

const stats = useAlertsStats();

console.log(stats.total);                    // Total alerts
console.log(stats.bySeverity.critical);      // Critical count
console.log(stats.byContext.materials);      // Materials count
console.log(stats.averageResolutionTime);    // Minutes
```

### UI Helpers

```typescript
const { ui } = useAlerts({ context: 'materials' });

console.log(ui.badgeCount);      // Number to show in badge
console.log(ui.badgeColor);      // 'red' | 'orange' | 'yellow' | 'blue' | 'gray'
console.log(ui.statusText);      // "5 críticas" | "3 activas"
console.log(ui.shouldShowBadge); // boolean
```

## 🛠️ Utilities

### AlertUtils Helpers

```typescript
import { AlertUtils } from '@/shared/alerts';

// Quick stock alert
const alert = AlertUtils.createStockAlert(
  'Harina de Trigo', // itemName
  5,                 // currentStock
  20,                // minThreshold
  'item-123'         // itemId
);

// Quick system alert
const alert = AlertUtils.createSystemAlert(
  'Database Error',
  'Connection lost',
  'critical'
);

// Quick validation alert
const alert = AlertUtils.createValidationAlert(
  'email',
  'Email must be valid'
);
```

## 🎭 Performance Patterns

### Split Contexts

```typescript
// Only re-renders when alerts change
const { alerts } = useAlertsState();

// NEVER re-renders (stable refs)
const actions = useAlertsActions();
```

### Memoization

```typescript
import { memo } from 'react';

const AlertCard = memo(function AlertCard({ alert }) {
  return <div>{alert.title}</div>;
});
```

### useShallow (Zustand)

```typescript
import { useShallow } from 'zustand/react/shallow';

const items = useStore(useShallow(state => state.items));
```

## 🔗 EventBus Integration

### Escuchar eventos de alertas

```typescript
import { EventBus, ALERT_EVENTS } from '@/lib/events';

// Listen to all alert events
EventBus.on('alerts.alert.*', (event) => {
  console.log('Alert event:', event);
});

// Listen to specific event
EventBus.on(ALERT_EVENTS.CREATED, (event) => {
  console.log('New alert created:', event.alertId);
});
```

### Emitir eventos custom

```typescript
// Trigger alert creation from another module
EventBus.emit('materials.stock.low', {
  itemId: '123',
  currentStock: 5
});
```

## 📋 Tipos Principales

### AlertSeverity

```typescript
'critical' | 'high' | 'medium' | 'low' | 'info'
```

### AlertStatus

```typescript
'active' | 'acknowledged' | 'resolved' | 'dismissed'
```

### AlertType

```typescript
'stock' | 'system' | 'validation' | 'business' | 'security' | 'operational' | 'achievement'
```

### AlertContext

```typescript
'dashboard' | 'materials' | 'products' | 'sales' | 'staff' | 'customers' | ...
// (16 contexts totales - ver ALERTS_SYSTEM_AUDIT.md)
```

## ⚡ Performance Tips

1. **Use bulk operations** cuando crees múltiples alertas
2. **Use split contexts** para evitar re-renders innecesarios
3. **Memoize components** que renderizan listas de alertas
4. **Use autoFilter: true** en useAlerts para filtrado automático
5. **Use useShallow** con Zustand stores
6. **Implement circuit breakers** en alert generation loops

## 🐛 Common Pitfalls

### ❌ DON'T: Individual creates

```typescript
for (const item of items) {
  await actions.create({ /* ... */ }); // 50 re-renders!
}
```

### ✅ DO: Bulk create

```typescript
await actions.bulkCreate(items.map(item => ({ /* ... */ }))); // 1 re-render!
```

### ❌ DON'T: Full context when only actions needed

```typescript
const context = useAlertsContext(); // Re-renders on every alert change
```

### ✅ DO: Split contexts

```typescript
const actions = useAlertsActions(); // Never re-renders
```

### ❌ DON'T: Put generation function in deps

```typescript
useEffect(() => {
  generateAlerts();
}, [materials, generateAlerts]); // Infinite loop!
```

### ✅ DO: Remove from deps or use circuit breaker

```typescript
useEffect(() => {
  if (shouldGenerate()) {
    generateAlerts();
  }
}, [materials]); // ✅
```

## 🔍 Debugging

### Enable verbose logging

```typescript
import { logger } from '@/lib/logging';

logger.setLevel('debug'); // See detailed alert logs
```

### Check localStorage

```javascript
// In browser console
const alerts = JSON.parse(localStorage.getItem('g-mini-alerts'));
console.table(alerts);
```

### Monitor EventBus

```typescript
EventBus.on('alerts.alert.*', (event) => {
  console.log('🔔 Alert event:', event);
});
```

---

**Ver también:**
- [ALERTS_SYSTEM_AUDIT.md](./ALERTS_SYSTEM_AUDIT.md) - Documentación completa
- [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - Más ejemplos de uso
