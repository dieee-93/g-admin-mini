# 🚨 Sistema de Alertas - Guía Completa

> **Última actualización**: 2025-09-07  
> **Autor**: Migración automática docs  
> **Estado**: Documento consolidado

## 🎯 Resumen

El sistema unificado de alertas centraliza todos los sistemas existentes en una arquitectura que separa claramente diferentes tipos de notificaciones y estados del sistema.

## 🏗️ Arquitectura

```
src/shared/alerts/
├── types.ts              # Tipos unificados
├── AlertsProvider.tsx    # Context provider (integrado en App.tsx)
├── components/
│   ├── AlertDisplay.tsx  # Componente base para mostrar alertas
│   ├── AlertBadge.tsx    # Badge unificado (reemplaza AlertsBadge)
│   └── GlobalAlertsDisplay.tsx  # Display automático flotante
├── hooks/
│   └── useAlerts.ts      # Hook principal + hooks especializados
└── index.ts              # Exportaciones centralizadas
```

## 📋 Tipos de Notificaciones

### 🔔 **TOASTS** - Feedback Inmediato (3-5s)
```typescript
import { notify } from '@/lib/notifications';

// Éxito
notify.success({
  title: 'Operación completada',
  description: 'La operación se realizó exitosamente'
});

// Error
notify.error({
  title: 'Error en la operación',
  description: 'Descripción del error'
});

// Información
notify.info({
  title: 'Información importante',
  description: 'Detalles adicionales'
});
```

### 🚨 **ALERTS** - Estados Persistentes
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

### ✅ **VALIDATIONS** - Alertas Contextuales
```typescript
// En formularios, usando el componente Alert del design system
import { Alert } from '@/shared/ui';

// Error de validación
<Alert status="error" title="Campo requerido">
  Este campo es obligatorio
</Alert>

// Advertencia de validación
<Alert status="warning" title="Valor fuera de rango">
  El valor debe estar entre 1 y 100
</Alert>

// Información contextual
<Alert status="info" title="Formato requerido">
  Use el formato DD/MM/YYYY para fechas
</Alert>
```

## ⚡ Helpers Rápidos

```typescript
// Stock crítico
actions.create(AlertUtils.createStockAlert(itemName, currentStock, minThreshold, itemId));

// Sistema
actions.create(AlertUtils.createSystemAlert('Error conexión', 'Servidor offline', 'critical'));

// Validación
actions.create(AlertUtils.createValidationAlert('email', 'Formato inválido'));

// Negocio
actions.create(AlertUtils.createBusinessAlert('Ventas inusuales', 'Pico de ventas detectado'));

// Seguridad
actions.create(AlertUtils.createSecurityAlert('Acceso no autorizado', 'Intento de login fallido'));
```

## 🎯 Hooks Especializados

### Hook Principal
```typescript
const { 
  alerts,           // Todas las alertas
  actions,          // Acciones (create, dismiss, clear)
  criticalCount,    // Número de alertas críticas
  hasAlerts        // Boolean si hay alertas
} = useAlerts();
```

### Hooks por Contexto
```typescript
// Por contexto específico
const { alerts, criticalCount } = useContextAlerts('materials');

// Solo críticas
const { alerts } = useCriticalAlerts(); 

// Solo stock
const { alerts } = useStockAlerts();

// Para badges
const { count, shouldShow } = useAlertsBadge();
```

## 🎨 Componentes UI

### AlertDisplay - Componente Base
```typescript
<AlertDisplay
  alert={alert}
  onDismiss={() => actions.dismiss(alert.id)}
  showActions={true}
  compact={false}
/>
```

### AlertBadge - Badge Unificado
```typescript
<AlertBadge
  context="materials"
  showOnlyIfCritical={true}
  variant="solid"
/>
```

### GlobalAlertsDisplay - Display Automático
```typescript
<GlobalAlertsDisplay
  position="top-right"
  maxVisible={5}
  autoHide={false}
/>
```

## 📱 Ejemplos de Uso por Módulo

### Materials/Inventory
```typescript
function MaterialsComponent() {
  const { actions } = useAlerts();
  
  const checkStockLevels = async () => {
    const lowStockItems = await getInventoryData();
    
    lowStockItems.forEach(item => {
      actions.create(AlertUtils.createStockAlert(
        item.name,
        item.currentStock,
        item.minThreshold,
        item.id
      ));
    });
  };
  
  return (
    <div>
      <AlertBadge context="materials" />
      {/* Resto del componente */}
    </div>
  );
}
```

### Sales
```typescript
function SalesModule() {
  const { actions } = useAlerts();
  
  const processSale = async (saleData) => {
    try {
      await createSale(saleData);
      notify.success({
        title: 'Venta procesada exitosamente',
        description: 'La venta se ha registrado correctamente'
      });
    } catch (error) {
      actions.create(AlertUtils.createBusinessAlert(
        'Error en venta',
        `No se pudo procesar la venta: ${error.message}`,
        'high'
      ));
    }
  };
}
```

### System Monitoring
```typescript
function SystemMonitor() {
  const { actions } = useAlerts();
  
  useEffect(() => {
    const checkSystemHealth = () => {
      if (!navigator.onLine) {
        actions.create(AlertUtils.createSystemAlert(
          'Sin conexión',
          'El sistema está trabajando offline',
          'medium'
        ));
      }
    };
    
    window.addEventListener('offline', checkSystemHealth);
    return () => window.removeEventListener('offline', checkSystemHealth);
  }, [actions]);
}
```

## 🔧 Configuración Avanzada

### Personalizar Tipos de Alertas
```typescript
// En types.ts
export interface CustomAlertData {
  customField?: string;
  metadata?: Record<string, any>;
}

// Uso
actions.create({
  type: 'custom',
  customField: 'valor personalizado',
  metadata: { source: 'background-job' }
});
```

### Filtros y Queries
```typescript
// Filtrar alertas
const materialAlerts = alerts.filter(alert => alert.context === 'materials');

// Alertas por severidad
const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');

// Alertas recientes (últimas 24h)
const recentAlerts = alerts.filter(alert => 
  isWithinLast24Hours(alert.createdAt)
);
```

## 🚨 Casos de Uso Críticos

### 1. Stock Bajo Automático
```typescript
// Trigger automático cuando stock < threshold
const autoCheckStock = (items: InventoryItem[]) => {
  items.forEach(item => {
    if (item.currentStock <= item.minThreshold) {
      actions.create(AlertUtils.createStockAlert(
        item.name,
        item.currentStock,
        item.minThreshold,
        item.id
      ));
    }
  });
};
```

### 2. Errores de Sistema
```typescript
// Manejo automático de errores de API
const apiErrorHandler = (error: ApiError) => {
  if (error.severity === 'critical') {
    actions.create(AlertUtils.createSystemAlert(
      'Error crítico del sistema',
      error.message,
      'critical'
    ));
  }
};
```

### 3. Validaciones de Negocio
```typescript
// Validaciones complejas
const validateBusinessRules = (data: SaleData) => {
  if (data.total > SUSPICIOUS_AMOUNT_THRESHOLD) {
    actions.create(AlertUtils.createBusinessAlert(
      'Venta inusual',
      `Monto elevado: $${data.total}`,
      'medium'
    ));
  }
};
```

## 📊 Integración con Dashboard

### Widgets de Alertas
```typescript
function AlertsWidget() {
  const { criticalCount } = useAlerts();
  const { alerts: stockAlerts } = useStockAlerts();
  
  return (
    <Card>
      <CardHeader>
        <Flex justify="between">
          <Text>Alertas del Sistema</Text>
          <AlertBadge context="global" />
        </Flex>
      </CardHeader>
      <CardBody>
        <VStack spacing={2}>
          <Stat>
            <StatLabel>Alertas Críticas</StatLabel>
            <StatNumber color="red.500">{criticalCount}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Stock Bajo</StatLabel>
            <StatNumber color="orange.500">{stockAlerts.length}</StatNumber>
          </Stat>
        </VStack>
      </CardBody>
    </Card>
  );
}
```

## 🔗 Referencias

- **API Documentation**: Ver `src/shared/alerts/types.ts` para tipos completos
- **Component Library**: Componentes reutilizables en `src/shared/alerts/components/`
- **Hooks Reference**: Hooks especializados en `src/shared/alerts/hooks/`
- **Utilities**: Helper functions en `AlertUtils`

## 📝 Notas de Migración

### Cambios desde v1.0:
- ✅ Unificación de 3 sistemas de alertas separados
- ✅ Hook único `useAlerts()` reemplaza múltiples hooks
- ✅ Componente `AlertBadge` unificado
- ✅ Sistema de contextos para filtrado automático
- ✅ Helper functions para casos comunes

### Breaking Changes:
- `useAlertsBadge()` → `useAlerts()` + filtros
- `AlertsBadge` → `AlertBadge`
- Props de componentes actualizadas según nuevos tipos

### Compatibilidad:
- ✅ Mantiene retrocompatibilidad con toasts existentes
- ✅ Sistema gradual de migración de alertas legacy
- ✅ Wrapper functions para APIs anteriores
