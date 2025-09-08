# 🚨 Alertas - Referencia Rápida

## 🎯 **API Principal**

```typescript
import { useAlerts, AlertUtils } from '@/shared/alerts';

const { actions } = useAlerts();

// Crear alerta
actions.create({
  type: 'stock' | 'system' | 'validation' | 'business' | 'security' | 'operational',
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info', 
  context: 'materials' | 'sales' | 'operations' | 'staff' | 'fiscal' | 'customers' | 'dashboard' | 'global',
  title: 'Título de la alerta',
  description: 'Descripción opcional'
});
```

## ⚡ **Helpers Rápidos**

```typescript
// Stock crítico
actions.create(AlertUtils.createStockAlert(itemName, currentStock, minThreshold, itemId));

// Sistema
actions.create(AlertUtils.createSystemAlert('Error conexión', 'Servidor offline', 'critical'));

// Validación
actions.create(AlertUtils.createValidationAlert('email', 'Formato inválido'));
```

## 🎯 **Hooks Especializados**

```typescript
// Por contexto
const { alerts, criticalCount } = useContextAlerts('materials');

// Solo críticas
const { alerts } = useCriticalAlerts(); 

// Solo stock
const { alerts } = useStockAlerts();

// Para badges
const { count, shouldShow } = useAlertsBadge();
```

## 🎨 **Componentes UI**

```typescript
// Badge en navegación (auto-aparece)
<NavAlertBadge onClick={() => navigate('/alerts')} />

// Display de alerta individual  
<AlertDisplay alert={alert} variant="card" onResolve={actions.resolve} />
```

## 🔄 **Flujo de Migración**

1. **Dashboard**: Reemplazar detección manual de alertas con `actions.create()`
2. **Stock**: Usar `AlertUtils.createStockAlert()` en lugar de sistemas custom
3. **Validaciones**: Cambiar alerts inline por `AlertUtils.createValidationAlert()`
4. **Badges**: Ya migrados - se actualizan automáticamente

## 📋 **Diferencias Clave**

- **TOASTS** (`notify.success()`): Feedback inmediato, desaparecen solos
- **ALERTS** (`actions.create()`): Estados persistentes, requieren resolución
- **VALIDATIONS**: Inline en formularios, temporales

## ✅ **Estado Actual**

- [x] Sistema base integrado en App.tsx
- [x] Badges de navegación migrados  
- [ ] Dashboard alerts (pendiente)
- [ ] Stock alerts (pendiente)
- [ ] Validations (pendiente)