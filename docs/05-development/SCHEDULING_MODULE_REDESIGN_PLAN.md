# 🚀 PLAN DE REDISEÑO: SCHEDULING MODULE

**Fecha**: 2025-09-20
**Basado en**: SCHEDULING_MODULE_ANALYSIS.md + MODULE_PLANNING_MASTER_GUIDE.md
**Estrategia**: Modernización completa siguiendo G-Admin Mini v2.1 standards

---

## 📋 **RESUMEN EJECUTIVO**

### **ESTADO ACTUAL**
- ❌ **Arquitectura legacy**: No sigue Design System v2.1
- ❌ **Inconsistencia UI**: Diferente a otros módulos empresariales
- ❌ **No integración**: Falta EventBus, CapabilityGate, 13 sistemas
- ✅ **Lógica sólida**: Hooks y tipos bien estructurados

### **OBJETIVO**
Transformar Scheduling de módulo legacy a módulo enterprise-grade que siga:
- ✅ Design System v2.1 (ContentLayout + StatsSection + Section)
- ✅ Plantilla empresarial estándar
- ✅ Integración completa con 13 sistemas arquitectónicos
- ✅ Sistema de alertas inteligentes

### **IMPACTO ESPERADO**
- 🎯 **90%+ similitud** con Materials/Sales (consistencia)
- 📈 **12+ componentes reutilizables** extraídos
- 🧠 **Engine inteligente** para optimización automática
- ⚡ **70% código compartible** con otros módulos empresariales

---

## 🏗️ **FASES DE IMPLEMENTACIÓN**

### **FASE 1: REDISEÑO ARQUITECTÓNICO** ⭐ **CRÍTICO**
*Duración estimada: 3-4 horas*
*Prioridad: Máxima*

#### **1.1 MIGRACIÓN DE PAGE COMPONENT**

**ARCHIVO**: `src/pages/admin/resources/scheduling/page.tsx`

**CAMBIOS OBLIGATORIOS**:

```typescript
// ❌ ANTES (líneas 1-50)
import { Stack, VStack, HStack, Typography, CardWrapper, Badge, Tabs } from '@/shared/ui';

// ✅ DESPUÉS - Design System v2.1
import {
  ContentLayout, Section, StatsSection, CardGrid, MetricCard,
  Button, Alert, Badge, Icon, Stack, Typography, Tabs
} from '@/shared/ui';

// ✅ SISTEMAS INTEGRADOS (13 sistemas)
import { useModuleIntegration } from '@/hooks/useModuleIntegration';
import { CapabilityGate } from '@/lib/capabilities';
import { useErrorHandler } from '@/lib/error-handling';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';
```

**ESTRUCTURA NUEVA** (seguir Materials page.tsx:90-152):
```typescript
export default function SchedulingPage() {
  // ✅ SISTEMAS INTEGRATION
  const { emitEvent, hasCapability, status } = useModuleIntegration('scheduling', SCHEDULING_MODULE_CONFIG);
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();
  const { shouldReduceAnimations } = usePerformanceMonitor();

  return (
    <ContentLayout spacing="normal">
      {/* 📊 MÉTRICAS EMPRESARIALES - OBLIGATORIO PRIMERO */}
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }}>
          <MetricCard
            title="Turnos Esta Semana"
            value={schedulingStats.total_shifts_this_week}
            icon={CalendarIcon}
            colorPalette="blue"
          />
          <MetricCard
            title="Cobertura"
            value={`${schedulingStats.coverage_percentage}%`}
            icon={UsersIcon}
            colorPalette="green"
            trend={{ value: coverageChange, isPositive: coverageChange > 0 }}
          />
          <MetricCard
            title="Solicitudes Pendientes"
            value={schedulingStats.pending_time_off}
            icon={UserMinusIcon}
            colorPalette="orange"
          />
          <MetricCard
            title="Costo Laboral"
            value={`$${schedulingStats.labor_cost_this_week.toLocaleString()}`}
            icon={CurrencyDollarIcon}
            colorPalette="purple"
          />
        </CardGrid>
      </StatsSection>

      {/* 🚨 ALERTAS CRÍTICAS */}
      <CapabilityGate capability="schedule_management">
        <SchedulingAlerts context="scheduling" />
      </CapabilityGate>

      {/* 🎯 GESTIÓN PRINCIPAL CON TABS */}
      <Section variant="elevated" title="Gestión de Horarios">
        <SchedulingManagement
          activeTab={activeTab}
          onTabChange={setActiveTab}
          performanceMode={shouldReduceAnimations}
        />
      </Section>

      {/* ⚡ ACCIONES RÁPIDAS */}
      <SchedulingActions
        hasCapability={hasCapability}
        isMobile={isMobile}
      />
    </ContentLayout>
  );
}
```

#### **1.2 MODULE CONFIGURATION**

**NUEVO ARCHIVO**: Module config siguiendo Materials pattern:

```typescript
const SCHEDULING_MODULE_CONFIG = {
  capabilities: ['schedule_management', 'approve_timeoff', 'view_labor_costs'],
  events: {
    emits: [
      'scheduling.schedule_updated',
      'scheduling.overtime_alert',
      'scheduling.coverage_gap',
      'scheduling.shift_confirmed'
    ],
    listens: [
      'staff.availability_updated',
      'sales.volume_forecast',
      'hr.rate_updated'
    ]
  },
  eventHandlers: {
    'staff.availability_updated': (data) => {
      console.log('♻️ Scheduling: Staff availability changed, recalculating...');
    },
    'sales.volume_forecast': (data) => {
      console.log('📊 Scheduling: Sales forecast updated, adjusting staffing...');
    }
  }
} as const;
```

#### **1.3 HOOKS MODERNIZATION**

**ARCHIVO**: `src/pages/admin/resources/scheduling/hooks/useSchedulingPage.ts`

**INTEGRACIÓN SISTEMAS** (líneas 55-70):
```typescript
export const useSchedulingPage = (): UseSchedulingPageReturn => {
  // ✅ INTEGRAR SISTEMAS
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();
  const { shouldReduceAnimations } = usePerformanceMonitor();
  const { isMobile } = useNavigation();

  // ✅ PATRÓN EMPRESARIAL: métricas + acciones + estados
  const {
    metrics,
    pageState,
    actions,
    loading,
    error,
    activeTab,
    setActiveTab
  } = useSchedulingData(); // Hook especializado

  return {
    metrics,
    actions,
    pageState,
    // ... estados y handlers
  };
};
```

---

### **FASE 2: COMPONENTES ESPECIALIZADOS**
*Duración estimada: 4-5 horas*

#### **2.1 COMPONENTES EMPRESARIALES**

Crear siguiendo pattern de Materials module:

**`components/SchedulingMetrics/SchedulingMetrics.tsx`**
```typescript
interface SchedulingMetricsProps {
  metrics: SchedulingMetrics;
  onMetricClick: (metric: string) => void;
  loading: boolean;
}

export function SchedulingMetrics({ metrics, onMetricClick, loading }: SchedulingMetricsProps) {
  return (
    <StatsSection>
      <CardGrid columns={{ base: 1, sm: 2, lg: 4 }}>
        <MetricCard
          title="Turnos Esta Semana"
          value={metrics.totalShifts}
          icon={CalendarIcon}
          colorPalette="blue"
          onClick={() => onMetricClick('shifts')}
          loading={loading}
        />
        {/* 3 métricas más siguiendo patrón */}
      </CardGrid>
    </StatsSection>
  );
}
```

**`components/SchedulingManagement/SchedulingManagement.tsx`**
```typescript
export function SchedulingManagement({ activeTab, onTabChange, performanceMode }: Props) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <Tabs.List>
        <Tabs.Trigger value="schedule">Horarios</Tabs.Trigger>
        <Tabs.Trigger value="timeoff">Permisos</Tabs.Trigger>
        <Tabs.Trigger value="coverage">Cobertura</Tabs.Trigger>
        <Tabs.Trigger value="costs">Costos</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="schedule">
        {!performanceMode ? (
          <WeeklyScheduleView />
        ) : (
          <WeeklyScheduleViewReduced />
        )}
      </Tabs.Content>
      {/* Otros tabs */}
    </Tabs>
  );
}
```

**`components/SchedulingActions/SchedulingActions.tsx`**
```typescript
export function SchedulingActions({ hasCapability, isMobile }: Props) {
  return (
    <Section variant="default" title="Acciones Rápidas">
      <Stack direction={isMobile ? "column" : "row"} gap="md">
        <CapabilityGate capability="schedule_management">
          <Button variant="solid" size="lg">
            <Icon icon={PlusIcon} size="sm" />
            Nuevo Turno
          </Button>
        </CapabilityGate>
        <Button variant="outline" flex="1">
          <Icon icon={Cog6ToothIcon} size="sm" />
          Auto-Programar
        </Button>
      </Stack>
    </Section>
  );
}
```

#### **2.2 SISTEMA DE ALERTAS**

**`components/SchedulingAlerts/SchedulingAlerts.tsx`**
```typescript
import { AlertBadge } from '@/shared/alerts';
import { useSchedulingAlerts } from './hooks/useSchedulingAlerts';

export function SchedulingAlerts({ context }: { context: string }) {
  const { alerts, loading } = useSchedulingAlerts();

  if (loading || alerts.length === 0) return null;

  return (
    <Section variant="elevated" title="Alertas y Notificaciones">
      <Stack direction="column" gap="sm">
        <AlertBadge context={context} />
        {alerts.map((alert) => (
          <Alert key={alert.id} variant="subtle" title={alert.message} />
        ))}
      </Stack>
    </Section>
  );
}
```

---

### **FASE 3: SISTEMA INTELIGENTE** 🧠
*Duración estimada: 6-8 horas*

#### **3.1 SCHEDULING INTELLIGENCE ENGINE**

**`services/SchedulingIntelligenceEngine.ts`**
```typescript
import { BaseIntelligentEngine } from '@/shared/alerts/engines/BaseIntelligentEngine';

interface SchedulingData {
  shifts: Shift[];
  employees: Employee[];
  salesForecast: SalesForecast[];
  laborRates: LaborRate[];
  historicalData: HistoricalSchedulingData;
}

export class SchedulingIntelligenceEngine extends BaseIntelligentEngine {
  analyze(data: SchedulingData): IntelligentAlert[] {
    return [
      ...this.analyzeLaborCosts(data),
      ...this.analyzeCoverageGaps(data),
      ...this.analyzeEfficiencyPatterns(data),
      ...this.analyzeCrossModuleImpact(data)
    ];
  }

  private analyzeLaborCosts(data: SchedulingData): IntelligentAlert[] {
    const alerts: IntelligentAlert[] = [];

    // Análisis de overtime patterns
    const overtimeEmployees = data.employees.filter(emp =>
      this.calculateWeeklyHours(emp, data.shifts) > 40
    );

    if (overtimeEmployees.length > 0) {
      alerts.push({
        id: `overtime_critical_${Date.now()}`,
        type: 'critical',
        category: 'labor_costs',
        title: '🚨 Overtime Crítico Detectado',
        message: `${overtimeEmployees.length} empleados exceden 40h semanales`,
        data: { employees: overtimeEmployees },
        priority: 'high',
        actions: [
          { label: 'Redistribuir Turnos', action: 'redistribute_shifts' },
          { label: 'Ver Detalles', action: 'view_overtime_details' }
        ]
      });
    }

    // Análisis de costo vs presupuesto
    const projectedCost = this.calculateProjectedWeeklyCost(data);
    const budgetThreshold = this.getBudgetThreshold(data);

    if (projectedCost > budgetThreshold * 1.15) {
      alerts.push({
        id: `budget_exceeded_${Date.now()}`,
        type: 'warning',
        category: 'budget',
        title: '💰 Presupuesto Laboral Excedido',
        message: `Costo proyectado: $${projectedCost.toLocaleString()} (+15% sobre presupuesto)`,
        data: { projectedCost, budget: budgetThreshold },
        priority: 'high'
      });
    }

    return alerts;
  }

  private analyzeCoverageGaps(data: SchedulingData): IntelligentAlert[] {
    const alerts: IntelligentAlert[] = [];

    // Análisis predictivo de demanda vs cobertura
    const forecast = this.predictDemandBasedOnSales(data.salesForecast);
    const currentCoverage = this.calculateCoverageByTimeSlot(data.shifts);

    const gaps = forecast.filter(slot =>
      currentCoverage[slot.timeSlot] < slot.predictedDemand * 0.8
    );

    if (gaps.length > 0) {
      alerts.push({
        id: `coverage_gap_${Date.now()}`,
        type: 'warning',
        category: 'coverage',
        title: '⚠️ Gaps de Cobertura Previstos',
        message: `${gaps.length} franjas horarias requieren personal adicional`,
        data: { gaps },
        priority: 'medium',
        actions: [
          { label: 'Auto-Programar', action: 'auto_schedule_gaps' },
          { label: 'Buscar Cobertura', action: 'find_coverage' }
        ]
      });
    }

    return alerts;
  }

  private analyzeCrossModuleImpact(data: SchedulingData): IntelligentAlert[] {
    // Correlación con sales forecasting
    // Correlación con kitchen demand
    // Correlación con materials availability
    return [];
  }
}
```

#### **3.2 ALERTS ADAPTER**

**`services/SchedulingAlertsAdapter.ts`**
```typescript
import { AlertUtils } from '@/shared/alerts';
import { SchedulingIntelligenceEngine } from './SchedulingIntelligenceEngine';

export class SchedulingAlertsAdapter {
  private engine = new SchedulingIntelligenceEngine();

  async generateAndUpdateAlerts(data: SchedulingData): Promise<void> {
    try {
      // Generar alertas inteligentes
      const intelligentAlerts = this.engine.analyze(data);

      // Convertir a formato sistema unificado
      for (const alert of intelligentAlerts) {
        await AlertUtils.createIntelligentAlert({
          context: 'scheduling',
          type: alert.type,
          category: alert.category,
          title: alert.title,
          message: alert.message,
          data: alert.data,
          priority: alert.priority,
          actions: alert.actions
        });
      }

      // Alertas básicas adicionales
      this.generateBasicAlerts(data);

    } catch (error) {
      console.error('Error generating scheduling alerts:', error);
    }
  }

  private generateBasicAlerts(data: SchedulingData): void {
    // Alertas simples usando sistema básico
    const understaffedShifts = data.shifts.filter(shift =>
      shift.employees.length < shift.minimumStaff
    );

    if (understaffedShifts.length > 0) {
      AlertUtils.createStockAlert(
        'Turnos con personal insuficiente',
        understaffedShifts.length,
        0,
        'scheduling_understaffed'
      );
    }
  }
}
```

#### **3.3 HOOKS INTEGRATION**

**`hooks/useSchedulingAlerts.ts`**
```typescript
import { useAlerts } from '@/shared/alerts/hooks/useAlerts';
import { SchedulingAlertsAdapter } from '../services/SchedulingAlertsAdapter';

export function useSchedulingAlerts() {
  const { alerts, loading, updateAlerts } = useAlerts('scheduling');
  const alertsAdapter = useMemo(() => new SchedulingAlertsAdapter(), []);

  const generateAndUpdateAlerts = useCallback(async (data: SchedulingData) => {
    await alertsAdapter.generateAndUpdateAlerts(data);
    await updateAlerts();
  }, [alertsAdapter, updateAlerts]);

  return {
    alerts,
    loading,
    generateAndUpdateAlerts
  };
}
```

---

### **FASE 4: REUTILIZACIÓN Y SHARED COMPONENTS**
*Duración estimada: 3-4 horas*

#### **4.1 EXTRAER COMPONENTES SHARED**

**`shared/ui/Calendar/`** - Reutilizable en Materials, Events, Maintenance
**`shared/ui/TimeSlot/`** - Reutilizable en Kitchen, Delivery, Production
**`shared/business-logic/scheduling/`** - Algoritmos compartidos

#### **4.2 BUSINESS LOGIC SHARED**

**`shared/business-logic/scheduling/schedulingCalculations.ts`**
```typescript
export class SchedulingCalculations {
  static calculateLaborCost(shifts: Shift[], rates: LaborRate[]): DecimalJS {
    // Usar DecimalUtils para cálculos precisos
    return shifts.reduce((total, shift) => {
      const hours = this.calculateShiftHours(shift);
      const rate = this.getEmployeeRate(shift.employee_id, rates);
      return DecimalUtils.add(total, DecimalUtils.mul(hours, rate));
    }, DecimalUtils.fromValue(0, 'financial'));
  }

  static optimizeScheduleForCost(
    requirements: StaffingRequirements[],
    employees: Employee[],
    constraints: SchedulingConstraints
  ): OptimizedSchedule {
    // Algoritmo de optimización reutilizable
  }
}
```

---

### **FASE 5: TESTING Y VALIDACIÓN**
*Duración estimada: 2-3 horas*

#### **5.1 INTEGRATION TESTING**

**Tests obligatorios**:
- ✅ EventBus integration
- ✅ CapabilityGate functionality
- ✅ Intelligence Engine accuracy
- ✅ UI consistency con Materials

#### **5.2 PERFORMANCE TESTING**

**Métricas objetivo**:
- ✅ Load time < 2s
- ✅ FPS > 30 en devices gama baja
- ✅ Memory usage estable

---

## 📊 **CRONOGRAMA DE IMPLEMENTACIÓN**

### **SPRINT 1** (Semana 1)
- ✅ **Día 1-2**: Fase 1 - Rediseño arquitectónico
- ✅ **Día 3-4**: Fase 2 - Componentes especializados
- ✅ **Día 5**: Testing básico e integración

### **SPRINT 2** (Semana 2)
- ✅ **Día 1-3**: Fase 3 - Sistema inteligente
- ✅ **Día 4**: Fase 4 - Shared components
- ✅ **Día 5**: Fase 5 - Testing y validación

---

## 🎯 **CRITERIOS DE ÉXITO**

### **TÉCNICOS**
- ✅ **90%+ similitud** con Materials/Sales en structure
- ✅ **Zero imports** de @chakra-ui/react directos
- ✅ **13 sistemas integrados** completamente
- ✅ **Engine inteligente** operacional con alertas

### **NEGOCIO**
- ✅ **Consistencia UX** cross-módulo
- ✅ **Optimización automática** de costos laborales
- ✅ **Predictive staffing** basado en sales forecast

### **ARQUITECTURA**
- ✅ **12+ componentes** extraídos a shared/
- ✅ **EventBus integration** con 4+ eventos
- ✅ **Extension points** documentados

---

## ⚠️ **RIESGOS Y MITIGACIONES**

### **RIESGO 1: Complejidad de algoritmos scheduling**
**Mitigación**: Implementar MVP primero, optimizar después
**Contingencia**: Usar algoritmos simples si advanced fallan

### **RIESGO 2: Performance con datasets grandes**
**Mitigación**: Implementar paginación y virtual scrolling
**Contingencia**: usePerformanceMonitor para degradación automática

### **RIESGO 3: Integración EventBus compleja**
**Mitigación**: Testing incremental por evento
**Contingencia**: Fallback a hooks locales temporalmente

---

## 📚 **DOCUMENTACIÓN DE REFERENCIA**

- `MODULE_PLANNING_MASTER_GUIDE.md` - Metodología aplicada
- `UI_MODULE_CONSTRUCTION_MASTER_GUIDE.md` - Templates seguidos
- `AI_KNOWLEDGE_BASE.md` - Sistemas integrados
- `Materials page.tsx` - Referencia de implementación

---

## 🚀 **RESULTADO ESPERADO**

Al completar este plan, el módulo Scheduling será:

1. **✅ Enterprise-grade**: Siguiendo todos los standards G-Admin Mini v2.1
2. **✅ Inteligente**: Con engine predictivo y optimización automática
3. **✅ Reutilizable**: Aportando 12+ componentes al ecosistema
4. **✅ Consistente**: 90%+ similitud con otros módulos empresariales
5. **✅ Escalable**: Preparado para growth y nuevas features

---

*Plan de rediseño basado en análisis técnico y metodología comprobada*
*Ready para implementación inmediata*