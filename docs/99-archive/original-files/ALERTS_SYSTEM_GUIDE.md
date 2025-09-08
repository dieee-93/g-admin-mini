# 🚨 Sistema Unificado de Alertas - Guía de Implementación

## 📋 **Resumen**

El nuevo sistema de alertas unifica todos los sistemas existentes en una arquitectura centralizada que separa claramente:

- **TOASTS**: Feedback inmediato (3-5s) → `notify.success()`, `notify.error()`
- **ALERTS**: Estados persistentes que requieren atención → `actions.create()`
- **VALIDATIONS**: Alertas contextuales en formularios → Componentes específicos

## 🏗️ **Arquitectura**

```
src/shared/alerts/
├── types.ts              # Tipos unificados
├── AlertsProvider.tsx    # Context provider (ya integrado en App.tsx)
├── components/
│   ├── AlertDisplay.tsx  # Componente base para mostrar alertas
│   ├── AlertBadge.tsx    # Badge unificado (reemplaza AlertsBadge)
│   └── GlobalAlertsDisplay.tsx  # Display automático flotante
├── hooks/
│   └── useAlerts.ts      # Hook principal + hooks especializados
└── index.ts              # Exportaciones centralizadas
```

## 🎯 **Cómo Usar el Sistema**

### 1. **Crear alertas desde cualquier componente**

```typescript
// En cualquier componente React
import { useAlerts, AlertUtils } from '@/shared/alerts';

function MaterialsComponent() {
  const { actions } = useAlerts();
  
  const checkStockLevels = async () => {
    const lowStockItems = await getInventoryData();
    
    lowStockItems.forEach(item => {
      // 🚨 SE CREA LA ALERTA - APARECE AUTOMÁTICAMENTE
      actions.create(AlertUtils.createStockAlert(
        item.name,
        item.currentStock,
        item.minThreshold,
        item.id
      ));
    });
  };
  
  return <Button onClick={checkStockLevels}>Verificar Stock</Button>;
}
```

### 2. **Mostrar badges en navegación**

```typescript
// En Header.tsx o navegación
import { NavAlertBadge } from '@/shared/alerts';

function Header() {
  return (
    <HStack>
      <Text>Mi App</Text>
      {/* Badge que aparece automáticamente cuando hay alertas */}
      <NavAlertBadge onClick={() => navigate('/alerts')} />
    </HStack>
  );
}
```

### 3. **Badges específicos por contexto**

```typescript
// Para mostrar solo alertas de stock
import { StockAlertBadge } from '@/shared/alerts';

function MaterialsHeader() {
  return (
    <HStack>
      <Text>Inventario</Text>
      <StockAlertBadge onClick={() => setShowAlertsPanel(true)} />
    </HStack>
  );
}
```

### 4. **Listas de alertas**

```typescript
import { useAlerts, AlertDisplay } from '@/shared/alerts';

function AlertsPage() {
  const { alerts, actions } = useAlerts({
    context: 'materials', // Solo alertas de inventario
    status: ['active', 'acknowledged']
  });

  return (
    <VStack>
      {alerts.map(alert => (
        <AlertDisplay
          key={alert.id}
          alert={alert}
          variant="card"
          onAcknowledge={actions.acknowledge}
          onResolve={actions.resolve}
          onDismiss={actions.dismiss}
        />
      ))}
    </VStack>
  );
}
```

## 🔄 **Migración de Sistemas Existentes**

### **GlobalAlerts → Nuevo Sistema**

```typescript
// ❌ ANTES (GlobalAlerts component)
<GlobalAlerts maxAlerts={3} position="top-right" />

// ✅ DESPUÉS (automático via provider)
// Ya integrado en App.tsx, solo crear alertas:
const { actions } = useAlerts();
actions.create({
  type: 'stock',
  severity: 'critical',
  context: 'materials',
  title: 'Stock crítico: Harina',
  description: 'Solo quedan 2 kg disponibles'
});
```

### **AlertsBadge → AlertBadge**

```typescript
// ❌ ANTES
import { AlertsBadge } from '@/shared/navigation/AlertsBadge';
<AlertsBadge variant="minimal" showIcon={true} />

// ✅ DESPUÉS
import { NavAlertBadge } from '@/shared/alerts';
<NavAlertBadge onClick={() => navigate('/alerts')} />
```

### **AlertCard → AlertDisplay**

```typescript
// ❌ ANTES
import { AlertCard } from '@/shared/components/widgets/AlertCard';
<AlertCard 
  title="Stock bajo"
  status="warning"
  onAction={handleAction}
/>

// ✅ DESPUÉS
import { AlertDisplay } from '@/shared/alerts';
<AlertDisplay 
  alert={alert}
  variant="card"
  onResolve={actions.resolve}
/>
```

## 🎯 **Ejemplos Prácticos**

### **Stock Management**

```typescript
// Detectar stock bajo y crear alerta
function useStockMonitoring() {
  const { actions } = useAlerts();
  
  const checkStock = useCallback(async (items: InventoryItem[]) => {
    for (const item of items) {
      if (item.currentStock <= item.minThreshold) {
        await actions.create({
          type: 'stock',
          severity: item.currentStock === 0 ? 'critical' : 'high',
          context: 'materials',
          title: `Stock ${item.currentStock === 0 ? 'agotado' : 'bajo'}: ${item.name}`,
          description: `${item.currentStock === 0 ? 'Sin stock disponible' : `Solo ${item.currentStock} unidades disponibles`}`,
          metadata: {
            itemId: item.id,
            itemName: item.name,
            currentStock: item.currentStock,
            minThreshold: item.minThreshold,
            unit: item.unit
          },
          actions: [
            {
              label: 'Agregar Stock',
              variant: 'primary',
              action: () => openStockModal(item.id),
              autoResolve: false
            },
            {
              label: 'Ajustar Mínimo',
              variant: 'secondary', 
              action: () => openThresholdModal(item.id)
            }
          ]
        });
      }
    }
  }, [actions]);
  
  return { checkStock };
}
```

### **Sistema de Validación**

```typescript
// Validaciones en formularios
function useFormValidation() {
  const { actions } = useAlerts();
  
  const validateAndAlert = useCallback(async (field: string, value: any, rules: ValidationRule[]) => {
    for (const rule of rules) {
      if (!rule.validate(value)) {
        await actions.create(AlertUtils.createValidationAlert(field, rule.message));
        return false;
      }
    }
    return true;
  }, [actions]);
  
  return { validateAndAlert };
}
```

### **Integración con el Dashboard**

```typescript
// En Dashboard.tsx
function Dashboard() {
  const { actions } = useAlerts();
  const { criticalCount, activeCount } = useAlerts({ 
    severity: ['critical', 'high'],
    autoFilter: true 
  });
  
  // Crear alertas basadas en métricas del dashboard
  useEffect(() => {
    if (systemMetrics.serverDown) {
      actions.create(AlertUtils.createSystemAlert(
        'Servidor desconectado',
        'No se puede conectar con el servidor principal',
        'critical'
      ));
    }
  }, [systemMetrics, actions]);
  
  return (
    <Box>
      {/* El badge aparece automáticamente si hay alertas */}
      <DashboardHeader />
      
      {/* Dashboard content */}
      <DashboardMetrics />
    </Box>
  );
}
```

## 📊 **Hooks Especializados**

```typescript
// Para stock específicamente
const { alerts, criticalCount } = useStockAlerts();

// Para alertas críticas solamente
const { alerts } = useCriticalAlerts();

// Para un contexto específico
const { alerts } = useContextAlerts('materials');

// Para badges de navegación
const { count, color, shouldShow } = useAlertsBadge();

// Para estadísticas
const stats = useAlertsStats({
  context: 'materials',
  createdAfter: startOfDay(new Date())
});
```

## 🔧 **Configuración**

```typescript
// Al inicializar la app (en App.tsx ya configurado)
<AlertsProvider
  initialConfig={{
    maxVisibleAlerts: 5,
    position: 'top-right',
    autoCollapse: true,
    collapseAfter: 10,
    persistAcrossSeessions: true
  }}
>
```

## ✅ **Checklist de Migración**

- [x] ✅ Sistema base creado e integrado en App.tsx
- [ ] 🔄 Migrar GlobalAlerts del dashboard
- [ ] 🔄 Reemplazar AlertsBadge en navegación  
- [ ] 🔄 Actualizar componentes de stock para usar nuevo sistema
- [ ] 🔄 Migrar AlertingSystem complejo (opcional - mantener funcionalidad específica)
- [ ] 🔄 Actualizar validaciones de formularios
- [ ] 🔄 Crear página de alertas (/alerts)
- [ ] 🔄 Tests del nuevo sistema

## 🚀 **Próximos Pasos**

1. **Probar el sistema**: Crear alertas desde cualquier componente
2. **Migrar AlertsBadge**: Reemplazar en Header/navegación
3. **Migrar GlobalAlerts**: Usar nuevo sistema automático
4. **Crear página de alertas**: Lista completa con filtros
5. **Optimizar rendimiento**: Lazy loading de alertas históricas

El sistema está listo para usar. ¿Empezamos con la migración de algún componente específico?