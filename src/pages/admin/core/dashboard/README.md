te# Módulo de Dashboard - G-Admin Mini

## 📋 Descripción del Módulo

El módulo de **Dashboard** es el centro de visualización de datos y análisis de G-Admin Mini, proporcionando múltiples vistas de inteligencia de negocio para la toma de decisiones estratégicas. Integra datos de todos los módulos del sistema para crear un comando central operacional y analítico.

### Características principales:
- ✅ Dashboard Ejecutivo con métricas clave
- ✅ Análisis Predictivo y Tendencias
- ✅ Inteligencia Competitiva y Benchmarking
- ✅ Reportes Personalizables y Dinámicos
- ✅ Análisis Cross-Módulo e Integración de Datos
- ✅ Widgets y Componentes Reutilizables
- ✅ Centro de comando operacional en tiempo real

---

## 🏗️ Estructura Estándar de Módulo

Esta estructura representa nuestro **patrón oficial** para todos los módulos de G-Admin Mini:

```
src/pages/admin/core/dashboard/
├── README.md                     # 📖 Este archivo (documentación completa)
├── page.tsx                      # 🎯 Página orquestadora (componente principal)
│
├── components/                   # 🧩 Componentes UI específicos del módulo
│   ├── index.ts                  # 📦 Barrel exports
│   ├── ExecutiveDashboard/       # 📊 Dashboard ejecutivo principal
│   ├── PredictiveAnalytics/      # 🔮 Análisis predictivo y tendencias
│   ├── CompetitiveIntelligence/  # 🎯 Inteligencia competitiva
│   ├── CustomReporting/          # 📋 Reportes personalizables
│   ├── CrossModuleAnalytics/     # 🔄 Análisis cross-módulo
│   ├── widgets/                  # 🧩 Widgets reutilizables
│   │   ├── MilestoneTracker.tsx
│   │   ├── EvolutionRoutesWidget.tsx
│   │   └── index.ts
│   └── recipes/                  # 🍳 Analytics de recetas
│
├── hooks/                        # 🪝 Hooks de negocio y página
│   ├── index.ts                  # 📦 Barrel exports
│   ├── useDashboard.ts           # 🎭 Hook orquestador principal
│   └── [otros hooks]/           # 🔧 Hooks específicos
│
├── services/                     # ⚙️ Lógica de negocio y servicios
│   ├── index.ts                  # 📦 Barrel exports
│   └── [servicios]/             # 🔧 Servicios de analytics
│
├── types/                        # 🏷️ Definiciones TypeScript
│   ├── index.ts                  # 📦 Barrel exports
│   └── [tipos específicos]/     # 🔧 Tipos del dashboard
│
├── data/                         # 📊 Datos y configuraciones
│   └── mockData.ts              # 🧪 Datos de prueba
│
└── utils/                        # 🛠️ Utilidades específicas del módulo
    ├── index.ts                  # 📦 Barrel exports
    └── [utilidades]/            # 🔧 Helper functions
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
// src/pages/admin/core/dashboard/page.tsx
export function Dashboard() {
  // 🎭 Toda la lógica delegada al hook orquestador
  const {
    heroMetric,
    secondaryMetrics,
    summaryMetrics,
    summaryStatus,
    operationalActions,
    onConfigure
  } = useDashboard();

  const { setQuickActions } = useNavigation();

  // 🚀 Configurar acciones rápidas del dashboard
  useEffect(() => {
    setQuickActions([
      {
        id: 'refresh-dashboard',
        label: 'Actualizar Dashboard',
        icon: BoltIcon,
        action: () => console.log('Refresh dashboard'),
        color: 'blue'
      }
    ]);
  }, [setQuickActions]);

  return (
    <ContentLayout spacing="loose">
      {/* 📋 Header semántico */}
      <PageHeader
        title="Dashboard"
        subtitle="Centro de comando · G-Admin"
        icon={HomeIcon}
      />

      {/* 🧩 Widgets especializados */}
      <MilestoneTracker />
      <EvolutionRoutesWidget />

      {/* 📊 Métricas principales */}
      <StatsSection>
        <CardGrid columns={{ base: 1, md: 2, lg: 4 }}>
          <MetricCard {...heroMetric} />
          {secondaryMetrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </CardGrid>
      </StatsSection>

      {/* 📈 Resumen operacional */}
      <Section variant="elevated" title="Resumen Operacional" icon={ChartBarIcon}>
        <SummaryPanel
          metrics={summaryMetrics}
          status={summaryStatus}
          onConfigure={onConfigure}
          defaultExpanded={true}
        />
      </Section>

      {/* ⚡ Acciones rápidas */}
      <Section variant="default" title="Acciones Rápidas" icon={BoltIcon}>
        <CardGrid columns={{ base: 2, md: 3, lg: 5 }}>
          {operationalActions.map((action) => (
            <ActionButton key={action.id} {...action} />
          ))}
        </CardGrid>
      </Section>

      {/* 📊 Paneles informativos */}
      <CardGrid columns={{ base: 1, md: 2, lg: 3 }}>
        <Section variant="elevated" title="Tendencias Hoy" icon={ChartBarIcon}>
          {/* Contenido de tendencias */}
        </Section>

        <Section variant="elevated" title="Notificaciones" icon={BellIcon}>
          {/* Contenido de notificaciones */}
        </Section>

        <Section variant="elevated" title="Rendimiento" icon={BoltIcon}>
          {/* Contenido de rendimiento */}
        </Section>
      </CardGrid>
    </ContentLayout>
  );
}
```

### Hook Orquestador Dashboard

```tsx
// src/pages/admin/core/dashboard/hooks/useDashboard.ts
export function useDashboard() {
  // 📊 Métricas calculadas del sistema
  const heroMetric = {
    title: "Revenue Today",
    value: "$12,450",
    subtitle: "vs yesterday",
    icon: CurrencyDollarIcon,
    colorPalette: "green" as const
  };

  const secondaryMetrics = [
    {
      title: "Orders",
      value: "84",
      subtitle: "active orders",
      icon: ShoppingCartIcon,
      colorPalette: "blue" as const
    },
    // ... más métricas
  ];

  // 🎯 Acciones operacionales configurables
  const operationalActions = [
    {
      id: 'new-sale',
      title: 'Nueva Venta',
      description: 'Crear orden rápida',
      icon: PlusIcon,
      colorPalette: 'green',
      onClick: () => console.log('New sale')
    },
    // ... más acciones
  ];

  return {
    heroMetric,
    secondaryMetrics,
    summaryMetrics: [], // Calculado desde múltiples módulos
    summaryStatus: 'healthy' as const,
    operationalActions,
    onConfigure: () => console.log('Configure dashboard')
  };
}
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
  StatsSection,     // Contenedor para métricas

  // 🧩 Componentes Base
  Button, Modal, Alert, Badge, Stack, Typography,

  // 📊 Componentes de Negocio
  MetricCard, CardGrid, ActionButton
} from '@/shared/ui'
```

### Reglas de Diseño
1. **❌ NUNCA** importar de `@chakra-ui/react` directamente
2. **✅ SIEMPRE** usar `ContentLayout` como contenedor principal
3. **✅ USAR** `PageHeader` para títulos complejos con acciones
4. **✅ APLICAR** `Section` con variants apropiados
5. **✅ DELEGAR** theming automático (tokens `gray.*`)

---

## 🧠 Arquitectura de Inteligencia de Negocio

### Vistas de Dashboard Disponibles

```typescript
// Tipos de vistas del dashboard
export type DashboardView =
  | 'executive'           // Vista ejecutiva general
  | 'predictive'          // Análisis predictivo
  | 'competitive'         // Inteligencia competitiva
  | 'reporting'           // Reportes personalizados
  | 'cross-module';       // Análisis cross-módulo

// Configuración de cada vista
export interface DashboardViewConfig {
  id: DashboardView;
  title: string;
  description: string;
  component: React.ComponentType;
  permissions?: string[];
  refreshInterval?: number;
}
```

### Integración Multi-Módulo

```typescript
// services/dashboardService.ts
export class DashboardService {
  /**
   * 📊 Integra datos de múltiples módulos
   */
  static async aggregateMetrics(): Promise<DashboardMetrics> {
    const [sales, inventory, staff, customers] = await Promise.all([
      SalesService.getCurrentMetrics(),
      InventoryService.getCurrentMetrics(),
      StaffService.getCurrentMetrics(),
      CustomerService.getCurrentMetrics()
    ]);

    return {
      revenue: sales.totalRevenue,
      orders: sales.activeOrders,
      inventory: inventory.totalValue,
      staff: staff.activeEmployees,
      customers: customers.activeCustomers,
      // Métricas calculadas cross-módulo
      efficiency: this.calculateEfficiency(sales, staff),
      profitability: this.calculateProfitability(sales, inventory)
    };
  }

  /**
   * 🔮 Análisis predictivo integrado
   */
  static async generatePredictions(): Promise<PredictiveInsights> {
    // Implementación de predicciones ML
  }
}
```

### Widgets Reutilizables

```typescript
// components/widgets/
export interface WidgetProps {
  title: string;
  refreshInterval?: number;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

// Widget base con funcionalidad común
export abstract class BaseWidget<T> extends React.Component<WidgetProps, T> {
  // Implementación base para todos los widgets
}
```

---

## 🔄 Integración con EventBus

### Eventos del Módulo Dashboard

```typescript
// Eventos que emite el módulo
const DASHBOARD_EVENTS = {
  VIEW_CHANGED: 'dashboard:view_changed',
  METRICS_UPDATED: 'dashboard:metrics_updated',
  WIDGET_CONFIGURED: 'dashboard:widget_configured',
  EXPORT_REQUESTED: 'dashboard:export_requested'
} as const;

// Eventos que escucha el módulo
const SUBSCRIBED_EVENTS = [
  'sales:order_completed',          // Actualizar métricas de ventas
  'inventory:stock_updated',        // Actualizar métricas de inventario
  'staff:schedule_changed',         // Actualizar métricas de personal
  'customers:new_registration',     // Actualizar métricas de clientes
  'kitchen:order_completed',        // Actualizar métricas operacionales
  'fiscal:receipt_generated'        // Actualizar métricas fiscales
] as const;
```

---

## 📊 Testing Strategy

### Estructura de Tests

```
src/pages/admin/core/dashboard/
├── __tests__/
│   ├── page.test.tsx                    # Tests del componente principal
│   ├── components/
│   │   ├── ExecutiveDashboard/
│   │   │   └── [tests específicos]
│   │   ├── PredictiveAnalytics/
│   │   │   └── [tests específicos]
│   │   ├── widgets/
│   │   │   ├── MilestoneTracker.test.tsx
│   │   │   └── EvolutionRoutesWidget.test.tsx
│   │   └── [otros componentes]/
│   ├── hooks/
│   │   └── useDashboard.test.ts         # Tests del hook orquestador
│   └── services/
│       └── dashboardService.test.ts     # Tests de servicios
```

### Casos de Test Críticos

```typescript
// 🧪 Tests del hook orquestador
describe('useDashboard', () => {
  test('should calculate metrics correctly', () => {
    // Test de cálculo de métricas
  });

  test('should handle multi-module data integration', () => {
    // Test de integración de datos
  });

  test('should setup operational actions', () => {
    // Test de acciones operacionales
  });
});

// 🧪 Tests de widgets
describe('Dashboard Widgets', () => {
  test('MilestoneTracker should display current milestones', () => {
    // Test del tracker de hitos
  });

  test('EvolutionRoutesWidget should show progress routes', () => {
    // Test del widget de evolución
  });
});
```

---

## 🚀 Vistas de Dashboard Implementadas

### ✅ Vista Principal (Executive)

1. **📊 Métricas Hero**
   - Revenue, Orders, Inventory, Staff en tiempo real
   - Comparaciones vs períodos anteriores
   - Indicadores de tendencia

2. **🧩 Widgets Operacionales**
   - `MilestoneTracker`: Seguimiento de hitos del negocio
   - `EvolutionRoutesWidget`: Rutas de evolución y mejora
   - Acciones rápidas contextuales

3. **📈 Paneles Informativos**
   - Tendencias del día
   - Centro de notificaciones
   - Estado del sistema

### 🚧 Vistas Avanzadas (Configurables)

1. **🔮 PredictiveAnalytics**
   - Forecasting de ventas e inventario
   - Análisis de tendencias estacionales
   - Predicciones de demanda

2. **🎯 CompetitiveIntelligence**
   - Benchmarking competitivo
   - Análisis de mercado
   - Oportunidades estratégicas

3. **📋 CustomReporting**
   - Reportes personalizables
   - Exportación de datos
   - Dashboards dinámicos

4. **🔄 CrossModuleAnalytics**
   - Correlaciones entre módulos
   - Análisis de eficiencia operacional
   - KPIs integrados

---

## 🔗 Referencias Técnicas

### Dependencias Clave Dashboard
- **Multi-Module Integration**: Servicios de todos los módulos del sistema
- **Real-time Updates**: EventBus para actualizaciones en vivo
- **ActionButton**: Componente de acciones rápidas
- **SummaryPanel**: Widget de resumen operacional
- **Navigation Context**: Integración con navegación global

### Patrones Dashboard Aplicados
- ✅ **Multi-View Architecture**: Múltiples vistas especializadas
- ✅ **Widget-Based Design**: Componentes reutilizables y modulares
- ✅ **Real-time Metrics**: Métricas actualizadas en tiempo real
- ✅ **Cross-Module Integration**: Integración de datos entre módulos
- ✅ **Business Intelligence**: Analytics y predicciones avanzadas

---

## 📈 Métricas de Calidad Dashboard

### Indicadores de Éxito Específicos
- ⚡ **Performance**: Carga inicial < 500ms, actualizaciones < 100ms
- 🧪 **Testing Coverage**: > 90% en métricas y widgets críticos
- 📦 **Bundle Size**: Carga lazy de vistas avanzadas
- 🔧 **Data Accuracy**: Precisión > 99% en métricas integradas
- 🎯 **User Experience**: Tiempo de comprensión < 30 segundos

### Validación Técnica Dashboard
```bash
# Comandos de verificación específicos
npm run test:dashboard        # Tests del módulo dashboard
npm run analyze:metrics       # Análisis de métricas
npm run validate:integration  # Validación de integración multi-módulo
npm run benchmark:widgets     # Performance de widgets
```

---

**🎯 Este README.md documenta el centro de comando de G-Admin Mini con inteligencia de negocio integrada.**

**📋 El módulo Dashboard implementa el patrón oficial mientras proporciona múltiples vistas especializadas de analytics y business intelligence.**