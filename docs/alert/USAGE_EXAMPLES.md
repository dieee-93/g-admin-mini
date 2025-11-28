# 🔔 Sistema de Alertas - Ejemplos de Uso

Colección completa de ejemplos prácticos para implementar alertas en diferentes escenarios.

---

## 📦 Ejemplo 1: Alertas de Stock Bajo (Materials)

### Escenario
Generar alertas automáticas cuando el stock de un material está bajo.

```typescript
// src/pages/admin/supply-chain/materials/hooks/useStockAlerts.ts
import { useEffect, useCallback } from 'react';
import { useAlertsActions } from '@/shared/alerts';
import { useMaterialsStore } from '@/store/materialsStore';
import { logger } from '@/lib/logging';

export function useStockAlerts() {
  const actions = useAlertsActions();
  const materials = useMaterialsStore(state => state.items);

  const generateStockAlerts = useCallback(async () => {
    // 1. Clear previous alerts
    await actions.clearAll({ context: 'materials', type: 'stock' });

    // 2. Filter low stock items
    const lowStockItems = materials.filter(m => 
      m.stock <= m.min_stock && m.min_stock > 0
    );

    if (lowStockItems.length === 0) return;

    // 3. Generate alert inputs
    const alerts = lowStockItems.map(item => ({
      type: 'stock' as const,
      severity: item.stock === 0 ? 'critical' as const : 'high' as const,
      context: 'materials' as const,
      title: item.stock === 0 
        ? `🚨 Stock agotado: ${item.name}`
        : `⚠️ Stock bajo: ${item.name}`,
      description: item.stock === 0
        ? `El material ${item.name} está completamente agotado. Se requiere reabastecimiento inmediato.`
        : `Solo quedan ${item.stock} ${item.unit || 'unidades'} de ${item.name}. Umbral mínimo: ${item.min_stock}`,
      metadata: {
        itemId: item.id,
        itemName: item.name,
        currentStock: item.stock,
        minThreshold: item.min_stock,
        unit: item.unit
      },
      persistent: true,
      autoExpire: item.stock === 0 ? 120 : 360, // 2h for out-of-stock, 6h for low stock
      actions: [
        {
          label: '🛒 Crear Pedido',
          variant: 'primary' as const,
          action: () => {
            window.location.href = `/purchase-orders/new?itemId=${item.id}`;
          },
          autoResolve: false
        },
        {
          label: '📋 Ver Detalles',
          variant: 'secondary' as const,
          action: () => {
            window.location.href = `/materials/${item.id}`;
          },
          autoResolve: false
        }
      ]
    }));

    // 4. Bulk create
    if (alerts.length > 0) {
      await actions.bulkCreate(alerts);
      logger.info('Materials', `Created ${alerts.length} stock alerts`);
    }
  }, [materials, actions]);

  // Auto-generate on materials change
  useEffect(() => {
    if (materials.length > 0) {
      generateStockAlerts();
    }
  }, [materials, generateStockAlerts]);

  return { generateStockAlerts };
}
```

### Uso en componente

```typescript
// src/pages/admin/supply-chain/materials/MaterialsPage.tsx
import { useStockAlerts } from './hooks/useStockAlerts';
import { useAlerts } from '@/shared/alerts';

export function MaterialsPage() {
  // Initialize alerts
  useStockAlerts();

  // Display alerts
  const { alerts, count, actions, ui } = useAlerts({
    context: 'materials',
    type: 'stock',
    status: ['active', 'acknowledged'],
    autoFilter: true
  });

  return (
    <ContentLayout>
      <PageHeader 
        title="Gestión de Materiales"
        badge={ui.shouldShowBadge ? (
          <Badge colorPalette={ui.badgeColor}>
            {ui.statusText}
          </Badge>
        ) : undefined}
      />

      {alerts.length > 0 && (
        <CollapsibleAlertStack
          alerts={alerts.map(alert => ({
            status: alert.severity,
            title: alert.title,
            description: alert.description
          }))}
          defaultOpen={ui.hasCriticalAlerts}
          title="Alertas de Inventario"
        />
      )}

      {/* Rest of page content */}
    </ContentLayout>
  );
}
```

---

## 🛒 Ejemplo 2: Validación de Pedidos (Sales)

### Escenario
Validar pedidos antes de confirmar y generar alertas si hay problemas.

```typescript
// src/pages/admin/operations/sales/hooks/useOrderValidation.ts
import { useCallback } from 'react';
import { useAlerts } from '@/shared/alerts';
import type { Order } from '../types';

export function useOrderValidation() {
  const { actions } = useAlerts();

  const validateOrder = useCallback(async (order: Order) => {
    const validationErrors: Array<{
      field: string;
      message: string;
      severity: 'high' | 'medium';
    }> = [];

    // Validate customer
    if (!order.customerId) {
      validationErrors.push({
        field: 'customer',
        message: 'Debe seleccionar un cliente',
        severity: 'high'
      });
    }

    // Validate items
    if (!order.items || order.items.length === 0) {
      validationErrors.push({
        field: 'items',
        message: 'El pedido debe tener al menos un producto',
        severity: 'high'
      });
    }

    // Check stock availability
    for (const item of order.items) {
      if (item.quantity > item.availableStock) {
        validationErrors.push({
          field: `stock-${item.id}`,
          message: `Stock insuficiente para ${item.name}. Disponible: ${item.availableStock}, Solicitado: ${item.quantity}`,
          severity: 'high'
        });
      }
    }

    // Validate payment
    if (order.paymentMethod === 'credit' && !order.creditApproved) {
      validationErrors.push({
        field: 'payment',
        message: 'Crédito no aprobado para este cliente',
        severity: 'medium'
      });
    }

    // Generate alerts for errors
    if (validationErrors.length > 0) {
      const alerts = validationErrors.map(error => ({
        type: 'validation' as const,
        severity: error.severity,
        context: 'sales' as const,
        title: `Error de validación: ${error.field}`,
        description: error.message,
        metadata: {
          fieldName: error.field,
          validationRule: error.message
        },
        persistent: false,
        autoExpire: 10 // 10 minutes
      }));

      await actions.bulkCreate(alerts);
      return false; // Validation failed
    }

    return true; // Validation passed
  }, [actions]);

  return { validateOrder };
}
```

### Uso en formulario

```typescript
// src/pages/admin/operations/sales/components/OrderForm.tsx
import { useOrderValidation } from '../hooks/useOrderValidation';
import { useAlerts } from '@/shared/alerts';

export function OrderForm({ onSubmit }: OrderFormProps) {
  const { validateOrder } = useOrderValidation();
  const { alerts } = useAlerts({
    context: 'sales',
    type: 'validation',
    status: 'active'
  });

  const handleSubmit = async (order: Order) => {
    const isValid = await validateOrder(order);
    
    if (isValid) {
      await onSubmit(order);
    } else {
      // Validation alerts are already displayed
      showToast({
        title: 'Validación fallida',
        description: 'Por favor corrige los errores indicados',
        status: 'error'
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Validation alerts */}
      {alerts.length > 0 && (
        <Alert status="error" variant="subtle">
          <Alert.Title>Errores de validación</Alert.Title>
          <Stack gap="xs">
            {alerts.map(alert => (
              <Text key={alert.id} fontSize="sm">
                • {alert.description}
              </Text>
            ))}
          </Stack>
        </Alert>
      )}

      {/* Form fields */}
      <FormField label="Cliente" name="customer" />
      <FormField label="Productos" name="items" />
      <FormField label="Método de Pago" name="payment" />

      <Button type="submit">Confirmar Pedido</Button>
    </Form>
  );
}
```

---

## 👥 Ejemplo 3: Alertas de Scheduling (Staff)

### Escenario
Alertas predictivas para problemas de staffing.

```typescript
// src/pages/admin/resources/scheduling/hooks/useSchedulingAlerts.ts
import { useEffect, useCallback } from 'react';
import { useAlerts } from '@/shared/alerts';
import { useSchedulingStore } from '@/store/schedulingStore';
import { addDays, format } from 'date-fns';

export function useSchedulingAlerts() {
  const { actions } = useAlerts();
  const shifts = useSchedulingStore(state => state.shifts);
  const employees = useSchedulingStore(state => state.employees);

  const analyzeSchedule = useCallback(async () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    // Filter shifts for next week
    const upcomingShifts = shifts.filter(shift => 
      shift.date >= today && shift.date <= nextWeek
    );

    const alertsToCreate = [];

    // Check for understaffing
    const shiftsByDate = upcomingShifts.reduce((acc, shift) => {
      const dateKey = format(shift.date, 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(shift);
      return acc;
    }, {} as Record<string, typeof shifts>);

    for (const [date, dayShifts] of Object.entries(shiftsByDate)) {
      const requiredStaff = dayShifts.reduce((sum, s) => sum + s.requiredEmployees, 0);
      const assignedStaff = dayShifts.reduce((sum, s) => sum + s.assignedEmployees.length, 0);

      if (assignedStaff < requiredStaff) {
        const shortage = requiredStaff - assignedStaff;
        alertsToCreate.push({
          type: 'operational' as const,
          severity: shortage > 3 ? 'high' as const : 'medium' as const,
          context: 'scheduling' as const,
          title: `⚠️ Falta personal: ${date}`,
          description: `Se necesitan ${shortage} empleados más para cubrir los turnos del ${date}. Personal requerido: ${requiredStaff}, Asignado: ${assignedStaff}`,
          metadata: {
            date,
            requiredStaff,
            assignedStaff,
            shortage
          },
          actions: [
            {
              label: '📋 Ver Turnos',
              variant: 'primary' as const,
              action: () => {
                window.location.href = `/scheduling?date=${date}`;
              }
            }
          ]
        });
      }
    }

    // Check for overtime risk
    const employeeHours = employees.map(emp => {
      const empShifts = upcomingShifts.filter(s => 
        s.assignedEmployees.includes(emp.id)
      );
      const totalHours = empShifts.reduce((sum, s) => sum + s.duration, 0);
      return { employee: emp, hours: totalHours };
    });

    for (const { employee, hours } of employeeHours) {
      if (hours > 40) {
        alertsToCreate.push({
          type: 'operational' as const,
          severity: hours > 48 ? 'high' as const : 'medium' as const,
          context: 'scheduling' as const,
          title: `⏰ Riesgo de horas extras: ${employee.name}`,
          description: `${employee.name} tiene ${hours} horas programadas esta semana (límite: 40h). Esto generará ${hours - 40}h de horas extras.`,
          metadata: {
            employeeId: employee.id,
            employeeName: employee.name,
            scheduledHours: hours,
            overtimeHours: hours - 40
          }
        });
      }
    }

    // Bulk create alerts
    if (alertsToCreate.length > 0) {
      await actions.bulkCreate(alertsToCreate);
    }
  }, [shifts, employees, actions]);

  // Run analysis when schedule changes
  useEffect(() => {
    if (shifts.length > 0) {
      analyzeSchedule();
    }
  }, [shifts, analyzeSchedule]);

  return { analyzeSchedule };
}
```

---

## 🎯 Ejemplo 4: Dashboard Consolidado

### Escenario
Vista consolidada de alertas de todos los módulos en el dashboard.

```typescript
// src/pages/admin/core/dashboard/components/AlertsOverview.tsx
import { useAlerts } from '@/shared/alerts';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export function AlertsOverview() {
  const navigate = useNavigate();
  
  // Get all active alerts
  const { alerts, count, criticalCount } = useAlerts({
    status: ['active', 'acknowledged'],
    autoFilter: true
  });

  // Group by context
  const alertsByContext = useMemo(() => {
    return alerts.reduce((acc, alert) => {
      if (!acc[alert.context]) {
        acc[alert.context] = [];
      }
      acc[alert.context].push(alert);
      return acc;
    }, {} as Record<string, typeof alerts>);
  }, [alerts]);

  // Context metadata
  const contextInfo = {
    materials: { label: 'Inventario', icon: '📦', route: '/materials' },
    sales: { label: 'Ventas', icon: '💰', route: '/sales' },
    scheduling: { label: 'Turnos', icon: '📅', route: '/scheduling' },
    customers: { label: 'Clientes', icon: '👥', route: '/customers' },
  };

  return (
    <Section title="Alertas del Sistema">
      <StatsSection>
        <MetricCard
          label="Total de Alertas"
          value={count}
          variant={criticalCount > 0 ? 'danger' : 'default'}
        />
        <MetricCard
          label="Críticas"
          value={criticalCount}
          variant="danger"
        />
      </StatsSection>

      <Stack direction="column" gap="md">
        {Object.entries(alertsByContext).map(([context, contextAlerts]) => {
          const info = contextInfo[context as keyof typeof contextInfo];
          if (!info) return null;

          const critical = contextAlerts.filter(a => a.severity === 'critical').length;

          return (
            <Box
              key={context}
              p="4"
              borderRadius="md"
              borderWidth="1px"
              cursor="pointer"
              onClick={() => navigate(info.route)}
              _hover={{ bg: 'gray.50' }}
            >
              <Stack direction="row" justify="space-between" align="center">
                <HStack gap="sm">
                  <Text fontSize="2xl">{info.icon}</Text>
                  <Box>
                    <Text fontWeight="bold">{info.label}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {contextAlerts.length} alertas
                      {critical > 0 && ` (${critical} críticas)`}
                    </Text>
                  </Box>
                </HStack>

                <Badge 
                  colorPalette={critical > 0 ? 'red' : 'orange'}
                  size="lg"
                >
                  {contextAlerts.length}
                </Badge>
              </Stack>

              {/* Show top 3 alerts */}
              <Stack direction="column" gap="xs" mt="3">
                {contextAlerts.slice(0, 3).map(alert => (
                  <Alert
                    key={alert.id}
                    status={alert.severity === 'critical' ? 'error' : 'warning'}
                    variant="subtle"
                    size="sm"
                  >
                    <Alert.Title>{alert.title}</Alert.Title>
                  </Alert>
                ))}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Section>
  );
}
```

---

## 🔔 Ejemplo 5: Alertas de Logros (Gamification)

### Escenario
Notificar al usuario cuando desbloquea un logro.

```typescript
// src/pages/admin/gamification/achievements/hooks/useAchievementAlerts.ts
import { useCallback } from 'react';
import { useAlerts } from '@/shared/alerts';
import type { Achievement } from '../types';

export function useAchievementAlerts() {
  const { actions } = useAlerts();

  const notifyAchievement = useCallback(async (achievement: Achievement) => {
    await actions.create({
      type: 'achievement',
      severity: 'info',
      context: 'gamification',
      title: `🎉 ¡Logro desbloqueado!`,
      description: `Has desbloqueado: **${achievement.title}** - ${achievement.description}`,
      metadata: {
        achievementId: achievement.id,
        achievementType: achievement.type,
        achievementIcon: achievement.icon,
        achievementDomain: achievement.domain,
        experiencePoints: achievement.xp
      },
      persistent: true,
      autoExpire: 1440, // 24 hours
      actions: [
        {
          label: '🏆 Ver Logros',
          variant: 'primary',
          action: () => {
            window.location.href = '/gamification/achievements';
          },
          autoResolve: true
        }
      ]
    });
  }, [actions]);

  return { notifyAchievement };
}
```

---

## 🛠️ Ejemplo 6: Smart Alerts Engine (Avanzado)

### Escenario
Motor de alertas inteligente con análisis ABC y predicción de impacto.

```typescript
// src/pages/admin/supply-chain/materials/services/customSmartEngine.ts
import { useCallback, useEffect } from 'react';
import { useAlertsActions } from '@/shared/alerts';
import { useMaterialsStore } from '@/store/materialsStore';
import type { MaterialABC } from '../types';

export function useCustomSmartEngine() {
  const actions = useAlertsActions();
  const materials = useMaterialsStore(state => state.items) as MaterialABC[];

  const analyzeAndAlert = useCallback(async () => {
    const alerts = [];

    for (const material of materials) {
      // Calculate metrics
      const stockPercentage = (material.stock / material.max_stock) * 100;
      const daysOfStock = material.monthlyConsumption > 0
        ? (material.stock / material.monthlyConsumption) * 30
        : Infinity;

      // Critical: Out of stock (Class A items)
      if (material.stock === 0 && material.abcClass === 'A') {
        alerts.push({
          type: 'stock' as const,
          severity: 'critical' as const,
          context: 'materials' as const,
          title: `🚨 CRÍTICO: Stock agotado (Clase A)`,
          description: `${material.name} está agotado. Esto afecta el ${material.revenuePercentage.toFixed(1)}% de los ingresos anuales.`,
          metadata: {
            itemId: material.id,
            itemName: material.name,
            abcClass: material.abcClass,
            affectedRevenue: material.annualValue,
            estimatedImpact: `Alto impacto en producción`
          },
          actions: [
            {
              label: '🚀 Pedido Urgente',
              variant: 'danger' as const,
              action: () => {
                // Create urgent purchase order
              }
            }
          ]
        });
      }

      // High: Low days of stock
      else if (daysOfStock < 7 && daysOfStock !== Infinity) {
        alerts.push({
          type: 'stock' as const,
          severity: 'high' as const,
          context: 'materials' as const,
          title: `⚠️ Quedan ${Math.floor(daysOfStock)} días de stock`,
          description: `${material.name} se agotará pronto. Stock actual: ${material.stock} ${material.unit}`,
          metadata: {
            itemId: material.id,
            itemName: material.name,
            currentStock: material.stock,
            daysOfStock: Math.floor(daysOfStock)
          }
        });
      }

      // Medium: Slow moving (Class C with high stock)
      else if (material.abcClass === 'C' && stockPercentage > 150) {
        alerts.push({
          type: 'business' as const,
          severity: 'medium' as const,
          context: 'materials' as const,
          title: `📊 Movimiento lento detectado`,
          description: `${material.name} (Clase C) tiene ${stockPercentage.toFixed(0)}% de stock. Considerar reducir inventario.`,
          metadata: {
            itemId: material.id,
            itemName: material.name,
            abcClass: material.abcClass,
            stockPercentage
          }
        });
      }
    }

    // Bulk create
    if (alerts.length > 0) {
      await actions.bulkCreate(alerts);
    }
  }, [materials, actions]);

  useEffect(() => {
    if (materials.length > 0) {
      analyzeAndAlert();
    }
  }, [materials, analyzeAndAlert]);

  return { analyzeAndAlert };
}
```

---

## 🎨 Ejemplo 7: Alertas Custom UI

### Escenario
Componente custom para mostrar alertas con diseño específico.

```typescript
// src/pages/admin/supply-chain/materials/components/CustomAlertsDisplay.tsx
import { useAlerts } from '@/shared/alerts';
import { Stack, Box, Icon, Button, Text, Badge } from '@/shared/ui';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export function CustomAlertsDisplay() {
  const { alerts, actions } = useAlerts({
    context: 'materials',
    severity: ['critical', 'high'],
    status: 'active'
  });

  if (alerts.length === 0) {
    return (
      <Box p="8" textAlign="center" bg="green.50" borderRadius="md">
        <Icon icon={CheckCircleIcon} boxSize="12" color="green.500" mb="2" />
        <Text fontWeight="bold" color="green.700">
          Todo en orden
        </Text>
        <Text fontSize="sm" color="green.600">
          No hay alertas críticas en este momento
        </Text>
      </Box>
    );
  }

  return (
    <Stack direction="column" gap="md">
      {alerts.map(alert => {
        const isCritical = alert.severity === 'critical';
        
        return (
          <Box
            key={alert.id}
            p="4"
            borderRadius="md"
            borderWidth="2px"
            borderColor={isCritical ? 'red.500' : 'orange.500'}
            bg={isCritical ? 'red.50' : 'orange.50'}
          >
            <Stack direction="row" justify="space-between" align="start">
              {/* Icon and content */}
              <Stack direction="row" gap="sm" flex="1">
                <Icon
                  icon={ExclamationTriangleIcon}
                  boxSize="6"
                  color={isCritical ? 'red.500' : 'orange.500'}
                />
                
                <Box flex="1">
                  <Stack direction="row" gap="sm" align="center" mb="1">
                    <Text fontWeight="bold" fontSize="lg">
                      {alert.title}
                    </Text>
                    <Badge colorPalette={isCritical ? 'red' : 'orange'}>
                      {alert.severity}
                    </Badge>
                  </Stack>
                  
                  <Text fontSize="sm" color="gray.700" mb="3">
                    {alert.description}
                  </Text>

                  {/* Metadata */}
                  {alert.metadata && (
                    <Box
                      p="2"
                      bg="white"
                      borderRadius="sm"
                      fontSize="xs"
                      color="gray.600"
                    >
                      <Text>Stock actual: {alert.metadata.currentStock}</Text>
                      <Text>Umbral mínimo: {alert.metadata.minThreshold}</Text>
                    </Box>
                  )}

                  {/* Actions */}
                  <Stack direction="row" gap="xs" mt="3">
                    {alert.actions?.map(action => (
                      <Button
                        key={action.id}
                        size="sm"
                        colorPalette={action.variant === 'primary' ? 'blue' : 'gray'}
                        onClick={action.action}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              </Stack>

              {/* Quick actions */}
              <Stack direction="row" gap="xs">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => actions.acknowledge(alert.id)}
                >
                  ✓ OK
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => actions.dismiss(alert.id)}
                >
                  ✕
                </Button>
              </Stack>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
```

---

## 📊 Ejemplo 8: Analytics de Alertas

### Escenario
Dashboard de analítica para alertas del sistema.

```typescript
// src/pages/admin/core/dashboard/components/AlertsAnalytics.tsx
import { useAlertsStats } from '@/shared/alerts';
import { useMemo } from 'react';

export function AlertsAnalytics() {
  const stats = useAlertsStats();

  // Calculate trends
  const trends = useMemo(() => {
    const total = stats.total;
    const critical = stats.bySeverity.critical;
    const criticalPercentage = total > 0 ? (critical / total) * 100 : 0;

    // Top contexts
    const topContexts = Object.entries(stats.byContext)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      total,
      critical,
      criticalPercentage,
      topContexts,
      avgResolution: stats.averageResolutionTime
    };
  }, [stats]);

  return (
    <Section title="Análisis de Alertas">
      {/* Overview metrics */}
      <StatsSection>
        <MetricCard
          label="Total Alertas"
          value={trends.total}
          trend={{ value: 12, direction: 'up' }}
        />
        <MetricCard
          label="Críticas"
          value={trends.critical}
          variant="danger"
          percentage={trends.criticalPercentage}
        />
        <MetricCard
          label="Tiempo Promedio de Resolución"
          value={`${Math.round(trends.avgResolution)}m`}
          trend={{ value: 5, direction: 'down', positive: true }}
        />
      </StatsSection>

      {/* Severity distribution */}
      <Box mt="6">
        <Text fontWeight="bold" mb="2">
          Distribución por Severidad
        </Text>
        <Stack direction="row" gap="sm">
          {Object.entries(stats.bySeverity).map(([severity, count]) => (
            <Box key={severity} flex="1">
              <Box
                h="100px"
                bg={`${getSeverityColor(severity)}.500`}
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="2xl"
                fontWeight="bold"
              >
                {count}
              </Box>
              <Text textAlign="center" mt="1" fontSize="sm" textTransform="capitalize">
                {severity}
              </Text>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Top contexts */}
      <Box mt="6">
        <Text fontWeight="bold" mb="2">
          Módulos con Más Alertas
        </Text>
        <Stack direction="column" gap="sm">
          {trends.topContexts.map(([context, count]) => (
            <Stack key={context} direction="row" justify="space-between" align="center">
              <Text textTransform="capitalize">{context}</Text>
              <Badge colorPalette="blue">{count}</Badge>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Section>
  );
}

function getSeverityColor(severity: string): string {
  const colors = {
    critical: 'red',
    high: 'orange',
    medium: 'yellow',
    low: 'blue',
    info: 'gray'
  };
  return colors[severity as keyof typeof colors] || 'gray';
}
```

---

**Ver también:**
- [ALERTS_SYSTEM_AUDIT.md](./ALERTS_SYSTEM_AUDIT.md) - Documentación completa del sistema
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Referencia rápida de la API
