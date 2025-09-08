# 🚨 Sistema de Alertas G-Admin Mini v2.1 - Guía Completa

> **Última actualización**: 2025-09-08  
> **Versión**: 2.1 - Arquitectura Enterprise Distribuida  
> **Basado en**: Investigación Toast, Square, Event-Driven patterns  
> **Estado**: Arquitectura Unificada con Especialización por Módulo

## 🎯 Resumen Ejecutivo

El **Sistema de Alertas G-Admin Mini v2.1** implementa una **arquitectura híbrida moderna** que combina:

- ✅ **Sistema central unificado** para UI/UX consistente
- ✅ **Especialización por módulo** siguiendo screaming architecture
- ✅ **Event-driven processing** inspirado en Toast/Square POS
- ✅ **Performance enterprise** con CDC patterns y batch processing
- ✅ **10+ módulos especializados** cada uno con sus tipos de alertas

### 🏆 **Principios Arquitecturales**

Basados en investigación de sistemas POS líderes y mejores prácticas enterprise:

1. **Toast Pattern**: Especialización por dominio + UI unificada
2. **Square Pattern**: Performance optimizado + real-time capabilities  
3. **Event-Driven**: Loose coupling entre módulos via EventBus
4. **CDC-like**: Change detection para alertas automáticas
5. **Screaming Architecture**: Cada módulo declara sus alertas

## 🏗️ Arquitectura Distribuida v2.1

### 📁 **Sistema Central (Core + UI)**

```typescript
src/shared/alerts/                    // 🎯 CORE UNIFICADO
├── core/
│   ├── types.ts                     // ✅ Tipos globales + interfaces base
│   ├── AlertsProvider.tsx           // ✅ Context provider central
│   ├── EventBus.ts                  // ✅ Event-driven communication
│   └── constants.ts                 // ✅ Configuraciones globales
├── services/
│   ├── AlertsProcessor.ts          // ✅ Procesamiento maestro
│   ├── CrossModuleAnalyzer.ts      // ✅ Correlaciones entre módulos
│   ├── BatchProcessor.ts           // ✅ Square-style batch processing
│   └── RealtimeProcessor.ts        // ✅ Toast-style real-time alerts
├── hooks/
│   ├── useAlerts.ts                // ✅ Hook principal
│   ├── useModuleAlerts.ts          // ✅ Hook por módulo
│   ├── useAlertsAnalytics.ts       // ✅ Analytics y métricas
│   └── useAlertsBadge.ts           // ✅ UI badges globales
├── components/                      // ✅ Componentes UI reutilizables
│   ├── AlertDisplay.tsx
│   ├── AlertBadge.tsx              
│   └── GlobalAlertsDisplay.tsx
└── utils/                          // ✅ Utilidades compartidas
    ├── AlertUtils.ts
    └── performance.ts
```

### 🎯 **Módulos Especializados (Distribuidos)**

```typescript
// 🆕 PATRÓN: Cada módulo maneja sus propias alertas
src/pages/admin/materials/alerts/
├── types.ts                        // MaterialAlert, StockAlert, ABCAlert
├── MaterialsAlertsProcessor.ts     // Stock, ABC analysis, procurement
├── hooks/
│   ├── useMaterialsAlerts.ts      // Hook especializado materials
│   ├── useStockAlerts.ts          // Stock-specific logic
│   └── useABCAlerts.ts            // ABC analysis alerts
├── utils/
│   ├── stockCalculations.ts       // ABC thresholds, stock status
│   └── procurementLogic.ts        // Reorder calculations
└── constants.ts                    // Materials-specific constants

src/pages/admin/sales/alerts/
├── types.ts                        // RevenueAlert, POSAlert, ConversionAlert
├── SalesAlertsProcessor.ts         // Revenue drops, POS errors, conversions
├── hooks/
│   ├── useSalesAlerts.ts          // Sales-specific hooks
│   └── useRevenueAlerts.ts        // Revenue monitoring
└── utils/
    └── revenueCalculations.ts      // Revenue metrics, trends

src/pages/admin/operations/alerts/
├── types.ts                        // ProductionAlert, EfficiencyAlert
├── OperationsAlertsProcessor.ts    // Production delays, efficiency
└── hooks/
    └── useOperationsAlerts.ts      // Operations-specific

// ... Y así para cada módulo: customers, staff, fiscal, products, settings, scheduling
```

## 📋 Tipos de Notificaciones v2.1

### 🔔 **TOASTS** - Feedback Inmediato (3-5s)
Para feedback instantáneo de acciones del usuario:

```typescript
import { notify } from '@/lib/notifications';

// Éxito - Acción completada
notify.success({
  title: 'Operación completada',
  description: 'La operación se realizó exitosamente'
});

// Error - Falló la operación
notify.error({
  title: 'Error en la operación', 
  description: 'Descripción del error'
});

// Información - Feedback contextual
notify.info({
  title: 'Información importante',
  description: 'Detalles adicionales'
});
```

### 🚨 **ALERTS** - Estados Persistentes Distribuidos

#### **API Central Unificada**
```typescript
import { useAlerts, AlertUtils } from '@/shared/alerts';

const { actions } = useAlerts();

// Crear alerta via sistema central
actions.create({
  type: AlertType,                    // Ver tipos por módulo abajo
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info', 
  context: AlertContext,              // 10+ contextos disponibles
  title: 'Título de la alerta',
  description: 'Descripción opcional',
  metadata: { /* datos específicos */ }
});
```

#### **Contextos Disponibles (10+ Módulos)**
```typescript
type AlertContext = 
  | 'materials'     // Stock, ABC analysis, procurement alerts
  | 'sales'         // Revenue, POS, conversion alerts  
  | 'operations'    // Production, efficiency, capacity alerts
  | 'customers'     // RFM, churn, satisfaction alerts
  | 'staff'         // Performance, attendance, labor alerts
  | 'fiscal'        // Tax compliance, deadline alerts
  | 'products'      // Cost variance, menu engineering alerts
  | 'settings'      // Configuration, integration alerts
  | 'scheduling'    // Labor cost, coverage gap alerts
  | 'dashboard'     // Cross-module insights
  | 'global';       // System-wide alerts
```

#### **Tipos por Módulo Especializado**
```typescript
// 📦 MATERIALS - Stock & Inventory
type MaterialsAlertType = 
  | 'stock_low'           // Stock bajo tradicional
  | 'stock_critical'      // Stock crítico (0 units)
  | 'abc_reclassification' // Cambio de categoría ABC
  | 'procurement_needed'   // Necesidad de compra
  | 'supplier_issue'      // Problema con proveedor
  | 'cost_variance';      // Variación de costo

// 💰 SALES - Revenue & Performance  
type SalesAlertType =
  | 'revenue_drop'        // Caída de ingresos
  | 'pos_error'          // Error en POS/checkout
  | 'conversion_low'     // Baja conversión
  | 'payment_failed'     // Fallo en pago
  | 'order_anomaly';     // Orden anómala

// ⚙️ OPERATIONS - Production & Efficiency
type OperationsAlertType =
  | 'production_delay'   // Retraso en producción
  | 'capacity_exceeded'  // Capacidad excedida
  | 'quality_issue'      // Problema de calidad
  | 'equipment_failure'; // Falla de equipo

// 👥 CUSTOMERS - Experience & Analytics
type CustomersAlertType =
  | 'churn_risk'         // Riesgo de pérdida de cliente
  | 'satisfaction_drop'  // Baja satisfacción
  | 'rfm_change'         // Cambio en segmento RFM
  | 'complaint_received'; // Queja recibida

// 👨‍💼 STAFF - Performance & Attendance  
type StaffAlertType =
  | 'attendance_issue'   // Problema de asistencia
  | 'performance_drop'   // Baja en rendimiento
  | 'overtime_excessive' // Overtime excesivo
  | 'training_needed';   // Entrenamiento requerido

// 📊 FISCAL - Compliance & Deadlines
type FiscalAlertType = 
  | 'tax_deadline'       // Fecha límite impuesto
  | 'compliance_violation' // Violación de cumplimiento
  | 'audit_required'     // Auditoría requerida
  | 'document_missing';  // Documento faltante
```

### ✅ **VALIDATIONS** - Alertas Contextuales
Para validaciones de formularios (no persistentes):

```typescript
// En formularios, usando el componente Alert del design system
import { Alert } from '@/shared/ui';

// Error de validación - Campo requerido
<Alert status="error" title="Campo requerido">
  Este campo es obligatorio
</Alert>

// Advertencia - Valor fuera de rango
<Alert status="warning" title="Valor fuera de rango">
  El valor debe estar entre 1 y 100
</Alert>

// Información contextual - Formato
<Alert status="info" title="Formato requerido">
  Use el formato DD/MM/YYYY para fechas
</Alert>
```

## ⚡ Helpers y Utilidades v2.1

### 🚀 **AlertUtils - Helpers Globales**

```typescript
import { AlertUtils } from '@/shared/alerts';

// 📦 MATERIALS - Helpers especializados
AlertUtils.createStockAlert(itemName, currentStock, minThreshold, itemId)
AlertUtils.createABCAlert(item, newClass, previousClass)
AlertUtils.createProcurementAlert(item, leadTime, demandForecast)

// 💰 SALES - Revenue & POS helpers
AlertUtils.createRevenueAlert('Caída 15%', period, impact)
AlertUtils.createPOSAlert('Error checkout', errorCode, affectedOrders)
AlertUtils.createConversionAlert(currentRate, targetRate, impact)

// ⚙️ OPERATIONS - Production helpers
AlertUtils.createProductionAlert('Retraso 2h', expectedTime, currentTime)
AlertUtils.createCapacityAlert('90% capacidad', currentLoad, maxCapacity)

// 👥 CUSTOMERS - Experience helpers
AlertUtils.createChurnAlert(customer, riskLevel, factors)
AlertUtils.createSatisfactionAlert(customer, score, previousScore)

// 👨‍💼 STAFF - Performance helpers  
AlertUtils.createAttendanceAlert(employee, absences, period)
AlertUtils.createPerformanceAlert(employee, metrics, threshold)

// 📊 FISCAL - Compliance helpers
AlertUtils.createTaxAlert(deadline, type, amount)
AlertUtils.createComplianceAlert(violation, severity, deadline)

// 🎯 CROSS-MODULE - Business insights
AlertUtils.createCrossModuleAlert('Oportunidad perdida', correlatedData)

// 🔧 SYSTEM - Technical helpers
AlertUtils.createSystemAlert('Error conexión', 'Servidor offline', 'critical')
AlertUtils.createValidationAlert('email', 'Formato inválido')
AlertUtils.createSecurityAlert('Acceso no autorizado', 'Intento fallido')
```

### 🎯 **Module-Specific Helpers**

```typescript
// 📦 MATERIALS MODULE - Usar desde el módulo
import { MaterialsAlertsProcessor } from '@/pages/admin/materials/alerts/MaterialsAlertsProcessor';

// Crear alerta ABC automática
const abcAlert = await MaterialsAlertsProcessor.createABCAlert(item);

// Detectar necesidad de procurement 
const procurementAlert = await MaterialsAlertsProcessor.createProcurementAlert(item);

// 💰 SALES MODULE - Usar desde el módulo
import { SalesAlertsProcessor } from '@/pages/admin/sales/alerts/SalesAlertsProcessor';

// Detectar caída de revenue
const revenueAlert = await SalesAlertsProcessor.createRevenueAlert(metrics);

// Error en POS checkout
const posAlert = await SalesAlertsProcessor.createPOSAlert(errorData);
```

## 🎯 Hooks Especializados v2.1

### 🌟 **Hook Principal (Central)**
```typescript
import { useAlerts } from '@/shared/alerts';

const { 
  alerts,           // ✅ Todas las alertas de todos los módulos
  actions,          // ✅ Acciones (create, dismiss, clear, batchProcess)
  criticalCount,    // ✅ Número de alertas críticas
  hasAlerts,        // ✅ Boolean si hay alertas
  analytics         // ✅ NUEVO: Analytics en tiempo real
} = useAlerts();
```

### 🎯 **Hooks por Módulo (Distribuidos)**
```typescript
import { useModuleAlerts } from '@/shared/alerts/hooks/useModuleAlerts';

// Hooks genéricos por contexto
const { alerts, criticalCount, hasUrgent } = useModuleAlerts('materials');
const { alerts, criticalCount, hasUrgent } = useModuleAlerts('sales');
const { alerts, criticalCount, hasUrgent } = useModuleAlerts('operations');

// Hooks especializados por módulo (desde cada módulo)
import { useMaterialsAlerts, useStockAlerts, useABCAlerts } from '@/pages/admin/materials/alerts/hooks/useMaterialsAlerts';
import { useSalesAlerts, useRevenueAlerts } from '@/pages/admin/sales/alerts/hooks/useSalesAlerts';
import { useOperationsAlerts } from '@/pages/admin/operations/alerts/hooks/useOperationsAlerts';
```

### 📊 **Hooks de Analytics (Nuevos)**
```typescript
import { useAlertsAnalytics } from '@/shared/alerts/hooks/useAlertsAnalytics';

const {
  totalAlerts,           // Total de alertas activas
  criticalCount,         // Alertas críticas
  byModule,              // Distribución por módulo
  trendsLastWeek,        // Tendencias última semana
  avgResolutionTime,     // Tiempo promedio de resolución
  topAlertTypes,         // Top 5 tipos de alertas
  performanceMetrics     // Métricas de performance
} = useAlertsAnalytics();
```

### 🔔 **Hooks de Badge (Optimizados)**
```typescript
import { useAlertsBadge } from '@/shared/alerts/hooks/useAlertsBadge';

// Badge global (todos los módulos)
const { count, shouldShow, severity } = useAlertsBadge();

// Badge por módulo específico
const { count, shouldShow } = useAlertsBadge('materials');
const { count, shouldShow } = useAlertsBadge('sales');

// Badge con criterios personalizados
const { count, shouldShow } = useAlertsBadge('global', {
  onlyIfCritical: true,
  includeContexts: ['materials', 'sales'],
  excludeTypes: ['system']
});
```

### ⚡ **Hooks de Performance (Enterprise)**
```typescript
// Real-time processing hook
import { useRealtimeAlerts } from '@/shared/alerts/hooks/useRealtimeAlerts';

const {
  isProcessing,         // ¿Está procesando alertas?
  processingQueue,      // Cola de procesamiento
  lastProcessed,        // Última alerta procesada
  performance          // Métricas de performance
} = useRealtimeAlerts();

// Cross-module insights hook
import { useCrossModuleInsights } from '@/shared/alerts/hooks/useCrossModuleInsights';

const {
  correlations,         // Correlaciones encontradas
  businessInsights,     // Insights de negocio
  predictions          // Predicciones basadas en patrones
} = useCrossModuleInsights();
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

## 📱 Ejemplos de Implementación v2.1

### 📦 **Materials Module - Ejemplo Completo**

```typescript
// src/pages/admin/materials/components/MaterialsPage.tsx
import { ContentLayout, PageHeader, AlertBadge } from '@/shared/ui';
import { useMaterialsAlerts, useStockAlerts } from '../alerts/hooks/useMaterialsAlerts';
import { MaterialsAlertsProcessor } from '../alerts/MaterialsAlertsProcessor';

function MaterialsPage() {
  const { alerts, criticalCount, hasUrgent } = useMaterialsAlerts();
  const { stockAlerts, lowStock, criticalStock } = useStockAlerts();
  
  const checkStockLevels = async () => {
    const lowStockItems = await getInventoryData();
    
    // Usar processor del módulo (no helper global)
    lowStockItems.forEach(async (item) => {
      const alert = await MaterialsAlertsProcessor.createStockAlert(item);
      if (alert) {
        // El processor automáticamente emite al sistema central
        console.log('Stock alert created:', alert.title);
      }
    });
  };
  
  const checkABCClassification = async () => {
    const items = await getItemsForABCAnalysis();
    
    items.forEach(async (item) => {
      const abcAlert = await MaterialsAlertsProcessor.createABCAlert(item);
      if (abcAlert) {
        console.log('ABC reclassification:', abcAlert.title);
      }
    });
  };
  
  return (
    <ContentLayout spacing="normal">
      <PageHeader 
        title="Materiales" 
        subtitle={`${criticalStock.length} elementos críticos`}
        actions={<AlertBadge context="materials" />}
      />
      
      {/* Mostrar alertas críticas prominentemente */}
      {hasUrgent && (
        <Section variant="elevated" colorPalette="red">
          <Alert status="error" title="Atención requerida">
            Hay {criticalCount} alertas críticas que requieren acción inmediata
          </Alert>
        </Section>
      )}
      
      {/* Resto del componente */}
    </ContentLayout>
  );
}
```

### 💰 **Sales Module - Ejemplo Completo**

```typescript
// src/pages/admin/sales/components/SalesPage.tsx  
import { useSalesAlerts, useRevenueAlerts } from '../alerts/hooks/useSalesAlerts';
import { SalesAlertsProcessor } from '../alerts/SalesAlertsProcessor';

function SalesPage() {
  const { alerts } = useSalesAlerts();
  const { revenueAlerts, conversionAlerts } = useRevenueAlerts();
  
  const processSale = async (saleData) => {
    try {
      await createSale(saleData);
      
      // Toast para feedback inmediato
      notify.success({
        title: 'Venta procesada exitosamente',
        description: 'La venta se ha registrado correctamente'
      });
      
      // Verificar patrones anómalos  
      const anomalyCheck = await SalesAlertsProcessor.detectAnomalies(saleData);
      if (anomalyCheck.hasAnomaly) {
        // Alert persistente para investigación
        await SalesAlertsProcessor.createOrderAnomalyAlert(saleData, anomalyCheck);
      }
      
    } catch (error) {
      // POS error alert
      await SalesAlertsProcessor.createPOSAlert({
        errorCode: error.code,
        orderData: saleData,
        timestamp: new Date()
      });
      
      // Toast para usuario
      notify.error({
        title: 'Error procesando venta',
        description: error.message
      });
    }
  };
  
  return (
    <ContentLayout>
      <PageHeader 
        title="Ventas" 
        actions={<AlertBadge context="sales" />}
      />
      {/* Resto del componente */}
    </ContentLayout>
  );
}
```

### ⚙️ **Cross-Module Analytics - Dashboard**

```typescript
// src/pages/admin/dashboard/components/AlertsOverview.tsx
import { useAlertsAnalytics, useCrossModuleInsights } from '@/shared/alerts';

function AlertsOverview() {
  const { 
    totalAlerts, 
    byModule, 
    trendsLastWeek,
    topAlertTypes 
  } = useAlertsAnalytics();
  
  const { 
    correlations, 
    businessInsights 
  } = useCrossModuleInsights();
  
  return (
    <Section title="Resumen de Alertas">
      <CardGrid columns={{ base: 1, md: 3 }} gap="md">
        
        {/* Total Alerts Card */}
        <MetricCard
          title="Alertas Activas"
          value={totalAlerts}
          trend={trendsLastWeek.totalChange}
          colorPalette={totalAlerts > 10 ? 'red' : 'blue'}
        />
        
        {/* Top Alert Types */}
        <CardWrapper>
          <Typography variant="h6">Tipos Principales</Typography>
          {topAlertTypes.map(type => (
            <Stack key={type.name} direction="row" justify="between">
              <Typography>{type.name}</Typography>
              <Badge>{type.count}</Badge>
            </Stack>
          ))}
        </CardWrapper>
        
        {/* Cross-Module Insights */}
        <CardWrapper>
          <Typography variant="h6">Insights de Negocio</Typography>
          {businessInsights.map(insight => (
            <Alert 
              key={insight.id}
              status="info" 
              title={insight.title}
              size="sm"
            >
              {insight.description}
            </Alert>
          ))}
        </CardWrapper>
        
      </CardGrid>
      
      {/* Module Distribution */}
      <Section variant="flat" title="Distribución por Módulo">
        {Object.entries(byModule).map(([module, count]) => (
          <Stack key={module} direction="row" justify="between" align="center">
            <Typography textTransform="capitalize">{module}</Typography>
            <Stack direction="row" align="center" gap="sm">
              <AlertBadge context={module} />
              <Typography color="fg.muted">{count} alertas</Typography>
            </Stack>
          </Stack>
        ))}
      </Section>
      
    </Section>
  );
}
```

## ⚡ Performance Patterns Enterprise

### 🔥 **CDC-like Pattern (Change Data Capture)**

Inspirado en CockroachDB y sistemas POS enterprise:

```typescript
// src/shared/alerts/services/CDCListener.ts
class AlertsCDCListener {
  private supabase = createClient();
  
  async startListening() {
    // PostgreSQL real-time para cambios críticos
    this.supabase
      .channel('inventory-changes')
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'items' },
          this.handleStockChange.bind(this)
      )
      .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'sales' },
          this.handleSaleCreated.bind(this)
      )
      .subscribe();
  }
  
  private async handleStockChange(payload: any) {
    const { new: newItem, old: oldItem } = payload;
    
    // Solo procesar si stock cambió significativamente
    if (Math.abs(newItem.stock - oldItem.stock) > 5) {
      await MaterialsAlertsProcessor.evaluateStockAlert(newItem);
    }
  }
  
  private async handleSaleCreated(payload: any) {
    const sale = payload.new;
    
    // Análisis en tiempo real
    await SalesAlertsProcessor.evaluateRevenuePatterns(sale);
  }
}
```

### ⚡ **Batch Processing (Square Pattern)**

Para alertas no críticas con mejor performance:

```typescript
// src/shared/alerts/services/BatchProcessor.ts
class AlertsBatchProcessor {
  private queue: PendingAlert[] = [];
  private readonly BATCH_SIZE = 50;
  private readonly BATCH_INTERVAL = 30000; // 30s como Square
  
  constructor() {
    // Procesar cada 30 segundos
    setInterval(() => this.processBatch(), this.BATCH_INTERVAL);
  }
  
  enqueue(alert: PendingAlert) {
    this.queue.push(alert);
    
    // Si es crítico, procesar inmediatamente
    if (alert.severity === 'critical') {
      return RealtimeProcessor.processImmediate(alert);
    }
  }
  
  private async processBatch() {
    if (this.queue.length === 0) return;
    
    const batch = this.queue.splice(0, this.BATCH_SIZE);
    
    // Deduplicación inteligente
    const deduplicated = this.deduplicateAlerts(batch);
    
    // Batch database operations
    await this.batchCreateAlerts(deduplicated);
    
    // Batch UI notifications  
    EventBus.emit('alerts:batch-created', deduplicated);
  }
  
  private deduplicateAlerts(alerts: PendingAlert[]): PendingAlert[] {
    const seen = new Map<string, PendingAlert>();
    
    alerts.forEach(alert => {
      const key = `${alert.context}-${alert.type}-${alert.metadata?.item_id}`;
      
      // Solo mantener la más reciente o más severa
      if (!seen.has(key) || this.isCriticalThan(alert, seen.get(key)!)) {
        seen.set(key, alert);
      }
    });
    
    return Array.from(seen.values());
  }
}
```

### 🧠 **Cross-Module Intelligence**

Patrones empresariales para insights de negocio:

```typescript
// src/shared/alerts/services/CrossModuleAnalyzer.ts  
class CrossModuleAnalyzer {
  
  async analyzeBusinessCorrelations(): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = [];
    
    // Patrón 1: Stock bajo + Alta demanda = Oportunidad perdida
    const lostOpportunities = await this.detectLostOpportunities();
    insights.push(...lostOpportunities);
    
    // Patrón 2: Staff insuficiente + Alta ocupación = Riesgo servicio  
    const serviceRisks = await this.detectServiceRisks();
    insights.push(...serviceRisks);
    
    // Patrón 3: Costos subiendo + Márgenes bajando = Alerta financiera
    const marginPressure = await this.detectMarginPressure();
    insights.push(...marginPressure);
    
    return insights;
  }
  
  private async detectLostOpportunities(): Promise<BusinessInsight[]> {
    // Query compleja: ventas recientes vs stock actual
    const { data } = await supabase.rpc('analyze_demand_vs_stock', {
      days_lookback: 7,
      stock_threshold: 10
    });
    
    return data.map(item => ({
      type: 'lost_opportunity',
      severity: 'high',
      context: 'global',
      title: `Oportunidad perdida: ${item.name}`,
      description: `Alta demanda (${item.recent_sales} ventas) pero stock bajo (${item.current_stock})`,
      metadata: {
        cross_modules: ['sales', 'materials'],
        revenue_impact: item.potential_lost_revenue,
        recommended_action: 'urgent_restock',
        correlations: {
          sales_velocity: item.sales_velocity,
          stock_ratio: item.stock_ratio,
          confidence: item.confidence_level
        }
      }
    }));
  }
}
```

## 🎯 **Implementation Roadmap**

### 🚀 **Fase 1: Foundation (1-2 semanas)**
```bash
✅ Expandir tipos centrales para 10+ módulos
✅ Actualizar AlertsProvider con EventBus
✅ Crear hooks base: useModuleAlerts, useAlertsAnalytics
✅ Implementar AlertsBadge mejorado
✅ Testing del sistema central expandido
```

### 📦 **Fase 2: Materials Module (1 semana)**  
```bash
✅ Crear estructura /materials/alerts/
✅ Implementar MaterialsAlertsProcessor
✅ Migrar lógica ABC existente
✅ Hooks especializados: useMaterialsAlerts, useStockAlerts, useABCAlerts
✅ Integrar con MaterialsPage existente
```

### 💰 **Fase 3: Sales + Operations (1 semana)**
```bash
✅ Estructura /sales/alerts/ y /operations/alerts/
✅ SalesAlertsProcessor: revenue, POS, conversión
✅ OperationsAlertsProcessor: producción, eficiencia
✅ Hooks especializados por módulo
✅ Integración con páginas existentes
```

### 👥 **Fase 4: Customer Intelligence + Staff (1 semana)**
```bash
✅ Estructura /customers/alerts/ y /staff/alerts/
✅ CustomersAlertsProcessor: RFM, churn, satisfaction
✅ StaffAlertsProcessor: performance, asistencia
✅ Analytics predictivos básicos
```

### 📊 **Fase 5: Enterprise Features (1 semana)**
```bash
✅ CDC Listener para PostgreSQL changes
✅ BatchProcessor + RealtimeProcessor
✅ CrossModuleAnalyzer con business insights
✅ Performance monitoring y analytics
✅ Dashboard de alertas completo
```

## 🔧 **Guías de Desarrollo**

### ✅ **Crear Nuevo Módulo de Alertas**

```typescript
// 1. Crear estructura
src/pages/admin/[module]/alerts/
├── types.ts
├── [Module]AlertsProcessor.ts
├── hooks/
│   └── use[Module]Alerts.ts
└── constants.ts

// 2. Definir tipos específicos
// types.ts
export interface ModuleAlert extends BaseAlert {
  context: 'module_name';
  type: 'specific_type_1' | 'specific_type_2';
  metadata: {
    // campos específicos del módulo
  };
}

// 3. Implementar processor
// ModuleAlertsProcessor.ts
export class ModuleAlertsProcessor {
  static async createSpecificAlert(data: any): Promise<ModuleAlert | null> {
    const alert = {
      id: nanoid(),
      type: 'specific_type_1',
      severity: this.calculateSeverity(data),
      context: 'module_name',
      title: 'Alert title',
      description: 'Alert description',
      metadata: { /* specific data */ },
      created_at: new Date().toISOString()
    };
    
    // Emitir al sistema central
    EventBus.emit('alert:created', alert);
    
    return alert;
  }
}

// 4. Crear hooks especializados
// hooks/useModuleAlerts.ts
export const useModuleAlerts = () => {
  return useModuleAlerts('module_name');
};

// 5. Integrar en el componente
// ModulePage.tsx
import { useModuleAlerts } from '../alerts/hooks/useModuleAlerts';

function ModulePage() {
  const { alerts, criticalCount } = useModuleAlerts();
  
  return (
    <ContentLayout>
      <PageHeader 
        title="Module" 
        actions={<AlertBadge context="module_name" />}
      />
      {/* resto del componente */}
    </ContentLayout>
  );
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

## 📊 **Métricas de Éxito**

### 🎯 **KPIs del Sistema de Alertas**

```typescript
interface AlertsSystemMetrics {
  coverage: {
    modules: 10,                    // ✅ Target: 100% módulos cubiertos
    alertTypes: 25+,                // ✅ Target: 3+ tipos por módulo  
    realTimeModules: 3              // ✅ Target: Materials, Sales, Operations
  },
  performance: {
    alertGenerationTime: '<100ms',  // ✅ Target: sub-100ms generación
    batchProcessingTime: '<30s',    // ✅ Target: procesamiento cada 30s
    memoryUsage: '<50MB',          // ✅ Target: optimizado memoria
    falsePositives: '<10%'         // ✅ Target: alta precisión
  },
  userExperience: {
    resolutionTime: '<2min',       // ✅ Target: acción rápida
    crossModuleInsights: 5+,       // ✅ Target: correlaciones útiles  
    satisfactionScore: '>8.5'      // ✅ Target: usuarios satisfechos
  }
}
```

## 🔗 **Referencias v2.1**

### 📚 **Documentación Técnica**
- **Tipos Centrales**: `src/shared/alerts/core/types.ts`
- **Processors**: `src/pages/admin/[module]/alerts/[Module]AlertsProcessor.ts`
- **Hooks Especializados**: `src/pages/admin/[module]/alerts/hooks/`
- **Performance Services**: `src/shared/alerts/services/`

### 🏗️ **Patrones Arquitecturales**
- **Toast Pattern**: UI unificada + especialización por dominio  
- **Square Pattern**: Batch processing + performance optimization
- **CDC Pattern**: Change data capture para real-time alerts
- **Event-Driven**: Loose coupling via EventBus communication

### 🌐 **Referencias Externas**
- [Toast POS Architecture](https://pos.toasttab.com/) - Real-time kitchen alerts  
- [Square POS Performance](https://squareup.com/) - Batch processing patterns
- [Event-Driven Architecture](https://microservices.io/patterns/data/event-driven-architecture.html) - Microservices patterns
- [CockroachDB CDC](https://www.cockroachlabs.com/) - Change data capture patterns

## 📝 **Changelog v2.1**

### 🚀 **Nuevas Features v2.1** 
- ✅ **Arquitectura Distribuida**: Cada módulo maneja sus alertas
- ✅ **10+ Módulos Soportados**: Coverage completo aplicación
- ✅ **Performance Enterprise**: CDC, batch processing, deduplicación
- ✅ **Cross-Module Intelligence**: Business insights automáticos
- ✅ **Analytics Avanzados**: Métricas tiempo real + tendencias
- ✅ **Real-time Processing**: Para alertas críticas
- ✅ **Hooks Especializados**: Por módulo + por contexto

### 🔄 **Migración desde v1.0**
- ✅ **Sistema Central Preservado**: `useAlerts()` mantiene compatibilidad
- ✅ **AlertBadge Mejorado**: Más opciones, mejor performance
- ✅ **Event-Driven Added**: EventBus para comunicación módulos
- ✅ **Legacy Systems Removed**: Stock alerts legacy eliminados
- ✅ **Performance Optimized**: Memoización + throttling + batching

### ❌ **Breaking Changes**
- ❌ `refreshAlerts()` eliminado de MaterialsStore
- ❌ `AlertsBadge` legacy → `AlertBadge` moderno  
- ❌ `StockAlert` type → usar sistema unificado
- ❌ Direct DB calls → usar module processors

### ✅ **Compatibilidad Mantenida**
- ✅ **Toasts**: Sistema notify existente intacto
- ✅ **Core Hooks**: `useAlerts()` API compatible
- ✅ **UI Components**: AlertDisplay, GlobalAlertsDisplay
- ✅ **Helper Functions**: AlertUtils expandido

## 🎯 **Próximos Pasos**

### 🔮 **Roadmap Futuro**

**v2.2 - ML & Predictions (Q2 2025)**
- 🤖 Machine Learning predictions para stock
- 🔍 Anomaly detection automática
- 📈 Predictive analytics avanzados
- 🧠 Auto-tuning de thresholds

**v2.3 - External Integrations (Q3 2025)**
- 📧 Email notifications automáticas
- 📱 SMS/WhatsApp alerts críticas  
- 🔗 Webhook integrations
- 📊 BI platforms connectivity

**v2.4 - Mobile & Offline (Q4 2025)**
- 📱 Mobile-first alert management
- 🔄 Offline alerts synchronization
- 📲 Push notifications
- 🎯 Location-based alerts

---

## 🏆 **Resumen Final**

El **Sistema de Alertas G-Admin Mini v2.1** representa una **arquitectura enterprise moderna** que:

✅ **Escala** para 500+ archivos y 10+ módulos  
✅ **Performance** optimizado con patrones Toast/Square  
✅ **Screaming Architecture** con specialización distribuida  
✅ **Business Intelligence** con correlaciones cross-module  
✅ **Developer Experience** con hooks especializados y helpers  
✅ **Future-Proof** preparado para ML y integraciones externas  

### 🎯 **En Resumen**: 
- **🏗️ Arquitectura**: Distribuida + Unificada (mejor de ambos mundos)
- **⚡ Performance**: Enterprise-grade con CDC + batch processing  
- **🎨 UX**: Consistente + contextual + inteligente
- **🔧 DX**: Hooks especializados + helpers + guías claras
- **📈 Escalabilidad**: Lista para crecer con tu aplicación

**¡Sistema robusto, performante y seguiendo las mejores prácticas de la industria! 🚀**

---

**📅 Última actualización**: 2025-09-08  
**👨‍💻 Basado en investigación**: Toast, Square, Event-Driven, CDC patterns  
**🎯 Versión objetivo**: v2.1 - Arquitectura Enterprise Distribuida  
**📋 Estado**: ✅ Documentación completa - Listo para implementación
