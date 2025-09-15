# Módulo de Staff - G-Admin Mini

## 📋 Descripción del Módulo

El módulo de **Staff** gestiona la administración completa de personal, incluyendo análisis de rendimiento en tiempo real, gestión de costos laborales, control de asistencia, y desarrollo profesional. Incluye funcionalidades avanzadas de analytics de productividad, cálculos de costos laborales con precisión decimal, y sistemas de alertas para optimización de recursos humanos.

### Características principales:
- ✅ Gestión completa de directorio de empleados y roles
- ✅ Analytics de rendimiento con métricas de productividad en tiempo real
- ✅ Motor de costos laborales con cálculo de horas extra y presupuesto
- ✅ Sistema de alertas de retención y riesgos operacionales
- ✅ Gestión de entrenamiento y desarrollo profesional
- ✅ Control de tiempo y asistencia con reportes automatizados
- ✅ Análisis de eficiencia departamental y organizacional
- ✅ Cálculos de nómina y presupuesto con precisión decimal (Decimal.js)

---

## 🏗️ Estructura Estándar de Módulo

Esta estructura sigue nuestro **patrón oficial** establecido en el módulo Products:

```
src/pages/admin/resources/staff/
├── README.md                   # 📖 Este archivo (documentación completa)
├── page.tsx                    # 🎯 Página orquestadora (componente principal)
│
├── components/                 # 🧩 Componentes UI específicos del módulo
│   ├── index.ts               # 📦 Barrel exports
│   ├── sections/              # 📋 Secciones especializadas
│   │   ├── DirectorySection/  # 👥 Directorio de empleados
│   │   ├── PerformanceSection/ # 📊 Análisis de rendimiento
│   │   ├── TrainingSection/   # 🎓 Gestión de entrenamiento
│   │   ├── ManagementSection/ # 🏢 Administración HR
│   │   └── TimeTrackingSection/ # ⏰ Control de tiempo
│   └── [otros componentes]/   # 🔧 Componentes adicionales
│
├── hooks/                     # 🪝 Hooks de negocio y página
│   ├── index.ts              # 📦 Barrel exports
│   ├── useStaffPage.ts       # 🎭 Hook orquestador de la página
│   └── [otros hooks]/        # 🔧 Hooks específicos
│
├── services/                  # ⚙️ Lógica de negocio y servicios
│   ├── index.ts              # 📦 Barrel exports
│   ├── staffApi.ts           # 🌐 API calls de empleados
│   ├── realTimeLaborCostEngine.ts # 💰 Motor de costos laborales (migrado de business-logic)
│   └── staffPerformanceAnalyticsEngine.ts # 📊 Motor de analytics de rendimiento (migrado de business-logic)
│
├── types.ts                  # 🏷️ Definiciones TypeScript
└── __tests__/               # 🧪 Tests del módulo
    ├── page.test.tsx        # Tests del componente principal
    ├── hooks/              # Tests de hooks
    └── services/           # Tests de lógica de negocio
```

---

## 🎯 Patrón "Página Orquestadora"

### Concepto
El archivo `page.tsx` actúa como un **orquestador limpio** que:
- ✅ No contiene lógica de negocio
- ✅ Usa componentes semánticos del sistema de diseño
- ✅ Delega la lógica a hooks especializados
- ✅ Mantiene una estructura clara y consistente

### Implementación Actual

```tsx
// src/pages/admin/resources/staff/page.tsx
export default function StaffPage() {
  // 🎭 Toda la lógica delegada al hook orquestador
  const {
    pageState,
    metrics,
    loading,
    error,
    actions,
    alertsData
  } = useStaffPage();

  return (
    <ContentLayout spacing="normal">
      {/* 📋 Header semántico with real-time metrics */}
      <PageHeader
        title="Gestión de Personal"
        subtitle={
          <Stack direction="row" gap="sm" align="center">
            <Badge variant="solid" colorPalette="blue">Security Compliant</Badge>
            <Badge variant="solid" colorPalette="green">{metrics.activeStaff} Activos</Badge>
            <Typography variant="body" size="sm" color="text.muted">
              Directorio, rendimiento, entrenamiento y administración HR
            </Typography>
          </Stack>
        }
        icon={UserGroupIcon}
        actions={
          <Button variant="solid" onClick={actions.handleNewEmployee} size="lg">
            <Icon icon={PlusIcon} size="sm" />
            Nuevo Empleado
          </Button>
        }
      />

      {/* 📊 Métricas de personal en tiempo real */}
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
          <MetricCard
            title="Total Personal"
            value={metrics.totalStaff}
            icon={UsersIcon}
            colorPalette="blue"
          />
          <MetricCard
            title="En Turno"
            value={metrics.onShiftCount}
            icon={ClockIcon}
            colorPalette="green"
          />
          <MetricCard
            title="Rendimiento Prom."
            value={`${(metrics.avgPerformanceRating * 20).toFixed(1)}%`}
            icon={TrophyIcon}
            colorPalette="purple"
            trend={{ value: metrics.avgPerformanceRating, isPositive: metrics.avgPerformanceRating > 3.5 }}
          />
          {/* Más métricas... */}
        </CardGrid>
      </StatsSection>

      {/* 💰 Labor Cost & Budget Analytics */}
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
          <MetricCard
            title="Costo Laboral Hoy"
            value={`$${metrics.todayLaborCost.toFixed(2)}`}
            icon={CurrencyDollarIcon}
            colorPalette="teal"
          />
          {/* Métricas financieras... */}
        </CardGrid>
      </StatsSection>

      {/* 🚨 Alertas dinámicas */}
      {alertsData.length > 0 && (
        <Section variant="elevated" title="Alertas y Notificaciones">
          {/* Alert components */}
        </Section>
      )}

      {/* 🧩 Secciones especializadas */}
      <Section variant="elevated" title="Control de Tiempo">
        {/* Time tracking functionality */}
      </Section>

      {/* 📊 Analytics condicionales */}
      {pageState.showAnalytics && (
        <Section variant="elevated" title="Analytics de Rendimiento">
          {/* Performance analytics */}
        </Section>
      )}
    </ContentLayout>
  );
}
```

### Hook Orquestador

```tsx
// src/pages/admin/resources/staff/hooks/useStaffPage.ts
export const useStaffPage = (): UseStaffPageReturn => {
  const { setQuickActions, updateModuleBadge } = useNavigation();
  const { staff, loading: staffLoading, error: staffError, getStaffStats } = useStaffWithLoader();

  // 🚀 Configurar acciones rápidas del header global basadas en tab activo
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-employee',
        label: 'Nuevo Empleado',
        icon: PlusIcon,
        action: () => handleNewEmployee(),
        color: 'blue'
      },
      {
        id: 'analytics',
        label: 'Ver Analytics',
        icon: ChartBarIcon,
        action: () => handleShowAnalytics(),
        color: 'green'
      },
      {
        id: 'payroll',
        label: 'Generar Nómina',
        icon: CreditCardIcon,
        action: () => handlePayrollGeneration(),
        color: 'teal'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [pageState.activeTab]);

  // 📊 Cálculo de métricas usando servicios migrados
  const metrics: StaffPageMetrics = useMemo(() => {
    // Usar servicios de business logic migrados
    const liveCosts: LiveCostCalculation[] = staff
      .filter(emp => emp.status === 'active')
      .map(employee => {
        return calculateEmployeeLiveCost({
          employee_id: employee.id,
          employee_name: employee.name,
          hourly_rate: employee.hourly_rate || 15,
          clock_in_time: new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000),
          shift_start_time: '09:00',
          shift_end_time: '17:00'
        });
      });

    const laborSummary = calculateDailyCostSummary(liveCosts, 2000); // $2000 daily budget
    const budgetAnalysis = analyzeBudgetVariance(laborSummary.total_current_cost, 2000);
    const efficiencyData = calculateLaborEfficiency(liveCosts);

    return {
      // Real-time labor cost metrics
      todayLaborCost: laborSummary.total_current_cost,
      projectedLaborCost: laborSummary.total_projected_cost,
      budgetUtilization: laborSummary.budget_utilization_percent,
      budgetVariance: budgetAnalysis.variance_percentage,
      efficiencyScore: efficiencyData.overall_efficiency,
      // ... más métricas
    };
  }, [staff, getStaffStats]);

  // 🎯 Handlers de acciones específicas
  const actions: StaffPageActions = useMemo(() => ({
    handleNewEmployee: () => {
      console.log('Opening new employee modal');
    },

    handleShowAnalytics: () => {
      // Generar analytics usando StaffPerformanceAnalyticsEngine
      generatePerformanceAnalytics();
    },

    handlePayrollGeneration: () => {
      console.log('Generating payroll using labor cost data');
    },

    // ... más acciones
  }), []);

  return {
    pageState,
    metrics,
    loading: staffLoading || analyticsLoading,
    error: error || staffError,
    actions,
    alertsData,
    // ... más datos
  };
};
```

---

## 🎨 Sistema de Diseño Integrado

### Componentes Semánticos Obligatorios

```tsx
import {
  // 🏗️ Componentes de Layout Semánticos (PRIORIDAD)
  ContentLayout,    // Estructura principal de página
  PageHeader,       // Header con título, subtítulo y acciones
  Section,          // Secciones con variants (elevated/flat/default)
  StatsSection,     // Sección especializada para métricas

  // 🧩 Componentes Base
  Button, Alert, Badge, Icon, Stack, Typography,

  // 📊 Componentes de Negocio
  MetricCard, CardGrid
} from '@/shared/ui'
```

### Reglas de Diseño
1. **❌ NUNCA** importar de `@chakra-ui/react` directamente
2. **✅ SIEMPRE** usar `ContentLayout` como contenedor principal
3. **✅ USAR** `PageHeader` para títulos complejos con acciones
4. **✅ APLICAR** `Section` con variants apropiados
5. **✅ USAR** `StatsSection + CardGrid + MetricCard` para métricas
6. **✅ DELEGAR** theming automático (tokens `gray.*`)

---

## 🧠 Arquitectura de Lógica de Negocio

### Separación de Responsabilidades

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   page.tsx      │───▶│     hooks/      │───▶│   services/     │
│  (Orquestador)  │    │ (Estado/Efectos)│    │ (Lógica Pura)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
   🎭 UI Structure        🪝 State Management     ⚙️ Business Logic
```

### Migración de Business Logic

**Servicios migrados desde `business-logic/staff/`:**

1. **realTimeLaborCostEngine.ts** (529 líneas)
   - ✅ `calculateEmployeeLiveCost()` - Costos laborales en tiempo real con Decimal.js
   - ✅ `calculateDailyCostSummary()` - Resúmenes diarios de costos
   - ✅ `analyzeBudgetVariance()` - Análisis de variación presupuestaria
   - ✅ `calculateLaborEfficiency()` - Métricas de eficiencia laboral
   - ✅ `analyzeOvertimePattern()` - Patrones de horas extra

2. **staffPerformanceAnalyticsEngine.ts** (1058 líneas)
   - ✅ `StaffPerformanceAnalyticsEngine.generateStaffAnalytics()` - Analytics completos
   - ✅ Análisis de asistencia y puntualidad
   - ✅ Métricas de productividad y calidad
   - ✅ Análisis departamental y organizacional
   - ✅ Sistema de recomendaciones y alertas
   - ✅ Evaluación de riesgo de retención

### Tipos de Hooks

1. **Hook Orquestador** (`useStaffPage.ts`)
   - 🎯 Maneja el estado completo de la página de staff
   - 🚀 Configura acciones rápidas globales dinámicamente
   - 📊 Calcula métricas usando servicios de negocio migrados
   - ⚠️ Gestiona alertas y notificaciones en tiempo real
   - 🎭 Coordina entre directorio, rendimiento, entrenamiento y administración

2. **Hooks de Negocio** (futuros)
   - 👥 `useEmployeeManagement` - Gestión de empleados CRUD
   - 📊 `usePerformanceAnalytics` - Analytics detallados de rendimiento
   - ⏰ `useTimeTracking` - Control de tiempo y asistencia
   - 💰 `useLaborCostMonitoring` - Monitoreo de costos laborales

---

## 🔄 Integración con EventBus

### Eventos del Módulo

```typescript
// Eventos que emite el módulo
const STAFF_EVENTS = {
  EMPLOYEE_CREATED: 'staff:employee_created',
  EMPLOYEE_UPDATED: 'staff:employee_updated',
  CLOCK_IN: 'staff:clock_in',
  CLOCK_OUT: 'staff:clock_out',
  PERFORMANCE_REVIEW_COMPLETED: 'staff:performance_review_completed',
  OVERTIME_ALERT: 'staff:overtime_alert',
  RETENTION_RISK_DETECTED: 'staff:retention_risk_detected',
  LABOR_COST_THRESHOLD_EXCEEDED: 'staff:labor_cost_exceeded'
} as const;

// Eventos que escucha el módulo
const SUBSCRIBED_EVENTS = [
  'sales:sale_completed',        // Calcular productividad por empleado
  'scheduling:shift_assigned',   // Actualizar horarios y costos
  'training:course_completed',   // Actualizar skills y desarrollo
  'payroll:payment_processed'    // Actualizar costos y presupuesto
] as const;
```

### Integración Tiempo Real

```typescript
// Actualización de métricas de costos laborales en tiempo real
useEffect(() => {
  const unsubscribe = eventBus.subscribe('staff:clock_in', (employee) => {
    // Recalcular costos laborales inmediatamente
    const newLiveCost = calculateEmployeeLiveCost({
      employee_id: employee.id,
      employee_name: employee.name,
      hourly_rate: employee.hourly_rate,
      clock_in_time: new Date(employee.clock_in_time)
    });

    // Actualizar métricas en tiempo real
    updateLaborCostMetrics(newLiveCost);
  });

  return unsubscribe;
}, []);

// Sistema de alertas automáticas
useEffect(() => {
  const unsubscribe = eventBus.subscribe('staff:overtime_alert', (data) => {
    updateModuleBadge('staff', {
      count: data.overtimeEmployeesCount,
      color: 'orange',
      pulse: true
    });
  });

  return unsubscribe;
}, []);
```

---

## 📊 Testing Strategy

### Estructura de Tests

```
src/pages/admin/resources/staff/
├── __tests__/
│   ├── page.test.tsx                    # Tests del componente principal
│   ├── hooks/
│   │   └── useStaffPage.test.ts         # Tests de hook orquestador
│   └── services/
│       ├── realTimeLaborCostEngine.test.ts      # Tests de motor de costos
│       └── staffPerformanceAnalyticsEngine.test.ts # Tests de analytics engine
```

### Tests Críticos de Precisión

```typescript
// Ejemplo: Tests de cálculos de costos laborales
describe('realTimeLaborCostEngine', () => {
  it('should calculate labor costs with decimal precision', () => {
    const result = calculateEmployeeLiveCost({
      employee_id: 'test-1',
      employee_name: 'Test Employee',
      hourly_rate: 15.75,
      clock_in_time: new Date('2024-01-01T09:00:00'),
      current_time: new Date('2024-01-01T17:30:00')
    });

    expect(result.current_cost).toBeCloseTo(133.875, 3); // 8.5 hours * 15.75
    expect(result.overtime_hours).toBeCloseTo(0.5, 1);
    expect(result.overtime_status).toBe('in_overtime');
  });

  it('should calculate daily cost summary accurately', () => {
    const liveCosts = [/* mock data */];
    const summary = calculateDailyCostSummary(liveCosts, 2000);

    expect(summary.budget_utilization_percent).toBeLessThanOrEqual(100);
    expect(summary.efficiency_score).toBeGreaterThan(0);
    expect(summary.cost_variance).toBeInstanceOf(Number);
  });
});

// Tests de analytics de rendimiento
describe('staffPerformanceAnalyticsEngine', () => {
  it('should generate comprehensive performance analytics', async () => {
    const analytics = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
      mockEmployees,
      mockTimeEntries,
      mockSchedules
    );

    expect(analytics.employeeMetrics).toBeDefined();
    expect(analytics.departmentAnalytics).toBeDefined();
    expect(analytics.organizationMetrics).toBeDefined();
    expect(analytics.recommendationsCount).toBeGreaterThan(0);
  });
});
```

---

## 🚀 Funcionalidades Clave

### 1. Gestión de Personal Integral
- ✅ Directorio completo de empleados con roles y permisos
- ✅ Gestión de departamentos y posiciones
- ✅ Estados de empleados (activo, vacaciones, licencia, terminado)
- ✅ Historial completo de cambios y actualizaciones
- ✅ Integración con sistemas de autenticación

### 2. Analytics de Rendimiento Avanzado
- ✅ Métricas de productividad individuales y departamentales
- ✅ Análisis de asistencia y puntualidad con precisión
- ✅ Evaluaciones de desempeño automatizadas
- ✅ Identificación de fortalezas y áreas de mejora
- ✅ Análisis de tendencias de rendimiento temporal

### 3. Motor de Costos Laborales en Tiempo Real
- ✅ Cálculo de costos por empleado con Decimal.js
- ✅ Monitoreo de horas extra y alertas automáticas
- ✅ Análisis de variación presupuestaria
- ✅ Proyecciones de costos diarios y mensuales
- ✅ Eficiencia laboral y ratios de productividad

### 4. Sistema de Alertas Inteligentes
- ✅ Riesgos de retención de empleados
- ✅ Alertas de costos laborales excesivos
- ✅ Notificaciones de rendimiento bajo
- ✅ Alertas de asistencia y puntualidad
- ✅ Recordatorios de evaluaciones pendientes

### 5. Gestión de Desarrollo y Entrenamiento
- ✅ Programas de entrenamiento personalizados
- ✅ Seguimiento de habilidades y certificaciones
- ✅ Planes de desarrollo profesional
- ✅ Métricas de progreso de entrenamiento
- ✅ Identificación de gaps de habilidades

### 6. Control de Tiempo y Asistencia
- ✅ Sistema de clock in/out con timestamp preciso
- ✅ Gestión de horarios y turnos
- ✅ Reportes de tiempo trabajado
- ✅ Análisis de patrones de asistencia
- ✅ Cálculo automático de horas extra

### 7. Administración de Nómina y Presupuesto
- ✅ Generación automatizada de nómina
- ✅ Análisis de costos por departamento
- ✅ Control presupuestario en tiempo real
- ✅ Reportes financieros de recursos humanos
- ✅ Proyecciones de costos futuros

---

## 🔗 Referencias Técnicas

### Dependencias Clave
- **Decimal.js**: Precisión en cálculos de costos laborales y nómina
- **Zustand**: State management global para datos de empleados
- **ChakraUI v3**: Sistema de componentes base
- **React Query**: Data fetching para APIs de staff y analytics
- **Heroicons**: Iconografía consistente
- **EventBus**: Comunicación en tiempo real entre módulos
- **Date-fns**: Manipulación de fechas para control de tiempo

### Patrones Aplicados
- ✅ **Separation of Concerns**: UI, Estado, Lógica de Negocio
- ✅ **Real-time Analytics**: Métricas calculadas en tiempo real
- ✅ **Domain-Driven Design**: Estructura por dominios de HR
- ✅ **Decimal Precision**: Cálculos financieros exactos
- ✅ **Modular Services**: Migración desde business-logic centralizada
- ✅ **Event-Driven Updates**: Actualizaciones automáticas vía EventBus

### Integración con Otros Módulos
- 📊 **Sales**: Productividad por empleado basada en ventas
- 📅 **Scheduling**: Integración de horarios y turnos
- 💰 **Finance**: Costos laborales en reportes financieros
- 🍽️ **Kitchen**: Rendimiento de personal de cocina
- 🎯 **Training**: Programas de desarrollo y certificaciones

---

## 📈 Métricas de Calidad

### Indicadores de Éxito
- ⚡ **Performance**: Cálculos de costos < 50ms
- 🧪 **Testing**: Cobertura > 90% (crítico en cálculos de nómina)
- 📦 **Bundle Size**: Incremento < 100KB (engines complejos)
- 🔧 **Mantenibilidad**: Complejidad ciclomática < 15
- 🎨 **UX Consistency**: 100% componentes del design system
- 💰 **Precision**: 0 errores en cálculos decimales
- 📊 **Analytics Accuracy**: Métricas verificables vs datos reales

### Validación Técnica
```bash
# Comandos de verificación específicos para Staff
npm run typecheck           # Sin errores TypeScript
npm run lint               # Sin warnings ESLint
npm run test:unit          # Tests unitarios (servicios)
npm run test:integration   # Tests de integración (analytics)
npm run test:performance   # Tests de rendimiento de cálculos
npm run test:decimal       # Tests específicos de precisión decimal
npm run build              # Build exitoso
```

### KPIs Operacionales
- 📊 **Analytics Generation**: < 2 segundos para 100 empleados
- ⚡ **Real-time Updates**: < 100ms para métricas en vivo
- 🎯 **Calculation Accuracy**: 100% precisión en cálculos laborales
- 📱 **Mobile Performance**: Funcional en dispositivos móviles
- 🔄 **Data Synchronization**: < 500ms para actualizaciones en tiempo real

### Benchmarks de Rendimiento
- 👥 **Employee Analytics**: Hasta 500 empleados simultáneos
- 📈 **Performance Metrics**: 6 meses de datos históricos
- 💰 **Cost Calculations**: Precisión hasta 6 decimales
- ⏰ **Real-time Updates**: 10+ métricas actualizadas por segundo
- 🚨 **Alert Processing**: < 50ms para detección de alertas

---

**🎯 Este README.md representa nuestro estándar oficial para el módulo de Staff en G-Admin Mini.**

**📋 El módulo Staff sirve como referencia para otros módulos que requieren analytics avanzados, cálculos de precisión decimal, y sistemas de alertas en tiempo real para optimización de recursos.**