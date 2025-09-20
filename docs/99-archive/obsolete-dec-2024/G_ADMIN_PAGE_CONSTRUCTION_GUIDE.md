# 🏗️ G-ADMIN PAGE CONSTRUCTION GUIDE

**Guía práctica definitiva para construir páginas consistentes en G-Admin**
*Para agentes de desarrollo - Versión 2.1*

---

## 🎯 **PLANTILLAS OBLIGATORIAS**

### **PLANTILLA 1: Módulo de Gestión Empresarial**
*Usar para: Sales, Staff, Customers, Materials, Operations*

```tsx
// 🏢 PATRÓN EMPRESARIAL G-ADMIN
import {
  ContentLayout, StatsSection, Section, CardGrid, MetricCard,
  Button, Alert, Badge, Icon, Stack, Typography, Tabs
} from '@/shared/ui';
import {
  // Iconos específicos del dominio
  UsersIcon, ChartBarIcon, PlusIcon, CurrencyDollarIcon,
  ExclamationTriangleIcon, ClockIcon
} from '@heroicons/react/24/outline';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';
import { useModulePage } from './hooks';

export default function BusinessModulePage() {
  const {
    isLoading, error, connectionQuality, isSyncing, queueSize,
    metrics, activeTab, setActiveTab, alertsData, actions
  } = useModulePage();

  if (isLoading) return <div>Cargando...</div>;
  if (error) {
    ModuleEventUtils.business.error('module-load-failed', error);
    return <Alert variant="subtle" title={error} />;
  }

  return (
    <ContentLayout spacing="normal">
      {/* 🔄 ESTADO DE CONEXIÓN - Obligatorio para módulos empresariales */}
      {(isSyncing || queueSize > 0) && (
        <Section variant="elevated" title="Estado de Sincronización">
          <Stack direction="row" gap="sm" align="center">
            {isSyncing && (
              <Badge colorPalette="blue" variant="subtle">
                <Icon icon={ClockIcon} size="sm" />
                Sincronizando
              </Badge>
            )}
            {queueSize > 0 && (
              <Badge colorPalette="orange" variant="subtle">
                {queueSize} pendientes
              </Badge>
            )}
            <Typography variant="body" color="text.muted">
              Conexión: {connectionQuality}
            </Typography>
          </Stack>
        </Section>
      )}

      {/* 📊 MÉTRICAS DE NEGOCIO - SIEMPRE PRIMERO */}
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
          <MetricCard
            title="Revenue Principal"
            value={`$${metrics.revenue.toLocaleString('es-AR')}`}
            icon={CurrencyDollarIcon}
            colorPalette="green"
            trend={{ value: metrics.growth, isPositive: metrics.growth > 0 }}
            onClick={() => ModuleEventUtils.business.metricClicked('revenue')}
          />
          <MetricCard
            title="Operaciones Activas"
            value={metrics.activeOperations}
            icon={UsersIcon}
            colorPalette="blue"
          />
          <MetricCard
            title="Eficiencia"
            value={`${metrics.efficiency}%`}
            icon={ChartBarIcon}
            colorPalette="purple"
          />
          <MetricCard
            title="Transacciones Hoy"
            value={metrics.todayTransactions}
            icon={DocumentTextIcon}
            colorPalette="teal"
          />
        </CardGrid>
      </StatsSection>

      {/* 🚨 ALERTAS CRÍTICAS - Solo si existen */}
      {alertsData.length > 0 && (
        <Section variant="elevated" title="Alertas y Notificaciones">
          <Stack direction="column" gap="sm">
            {alertsData.map((alert, index) => (
              <Alert
                key={index}
                variant="subtle"
                title={alert.message}
                icon={<Icon icon={ExclamationTriangleIcon} size="sm" />}
              />
            ))}
          </Stack>
        </Section>
      )}

      {/* 🎯 GESTIÓN PRINCIPAL CON TABS */}
      <Section variant="elevated" title="Gestión Operacional">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="management">Gestión</Tabs.Trigger>
            <Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
            <Tabs.Trigger value="reports">Reportes</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="management">
            {/* Contenido de gestión */}
          </Tabs.Content>
          <Tabs.Content value="analytics">
            {/* Contenido de analytics */}
          </Tabs.Content>
          <Tabs.Content value="reports">
            {/* Contenido de reportes */}
          </Tabs.Content>
        </Tabs>
      </Section>

      {/* ⚡ ACCIONES RÁPIDAS */}
      <Section variant="default" title="Acciones Rápidas">
        <Stack direction="row" gap="md" flexWrap="wrap">
          <Button variant="solid" onClick={actions.handlePrimaryAction} size="lg">
            <Icon icon={PlusIcon} size="sm" />
            Acción Principal
          </Button>
          <Button variant="outline" onClick={actions.handleSecondaryAction} flex="1" minW="200px">
            <Icon icon={ChartBarIcon} size="sm" />
            Ver Reportes
          </Button>
        </Stack>
      </Section>
    </ContentLayout>
  );
}
```

### **PLANTILLA 2: Módulo de Configuración**
*Usar para: Settings, Admin tools, Config*

```tsx
// ⚙️ PATRÓN DE CONFIGURACIÓN G-ADMIN
import {
  ContentLayout, Section, FormSection, Alert, Stack, Button
} from '@/shared/ui';
import { CogIcon } from '@heroicons/react/24/outline';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';
import { useConfigPage } from './hooks';

export default function ConfigModulePage() {
  const { isLoading, error, config, isDirty, actions } = useConfigPage();

  if (isLoading) return <div>Cargando configuración...</div>;
  if (error) {
    ModuleEventUtils.system.configError(error);
    return <Alert variant="subtle" title={error} />;
  }

  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="Configuración del Sistema">

        <FormSection
          title="Configuración Principal"
          description="Ajustes críticos que afectan el funcionamiento del módulo"
        >
          {/* Formulario de configuración aquí */}
        </FormSection>

        <FormSection
          title="Configuración Avanzada"
          description="Opciones para usuarios experimentados"
        >
          {/* Configuración avanzada aquí */}
        </FormSection>

        <Stack direction="row" gap="md" justify="end" mt="lg">
          <Button variant="outline" onClick={actions.handleReset} disabled={!isDirty}>
            Restablecer
          </Button>
          <Button variant="solid" onClick={actions.handleSave} disabled={!isDirty}>
            Guardar Cambios
          </Button>
        </Stack>
      </Section>
    </ContentLayout>
  );
}
```

### **PLANTILLA 3: Módulo de Analytics/BI**
*Usar para: Dashboard, Executive, Reporting, Intelligence*

```tsx
// 📊 PATRÓN ANALYTICS G-ADMIN
import {
  ContentLayout, StatsSection, Section, CardGrid, MetricCard,
  Button, Icon, Stack, Typography
} from '@/shared/ui';
import {
  ChartBarIcon, ArrowTrendingUpIcon, CurrencyDollarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';
import { useAnalyticsPage } from './hooks';

export default function AnalyticsModulePage() {
  const {
    isLoading, error, metrics, insights, isAnalyzing,
    showAdvanced, actions
  } = useAnalyticsPage();

  if (isLoading) return <div>Cargando analytics...</div>;
  if (error) return <Alert variant="subtle" title={error} />;

  return (
    <ContentLayout spacing="normal">
      {/* 📊 MÉTRICAS EJECUTIVAS */}
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
          <MetricCard
            title="Impacto Total"
            value={`$${metrics.totalImpact.toLocaleString('es-AR')}`}
            icon={CurrencyDollarIcon}
            colorPalette="green"
            trend={{ value: metrics.impactGrowth, isPositive: metrics.impactGrowth > 0 }}
          />
          <MetricCard
            title="Eficiencia Promedio"
            value={`${metrics.averageEfficiency}%`}
            icon={ArrowTrendingUpIcon}
            colorPalette="blue"
          />
          <MetricCard
            title="Insights Activos"
            value={insights.active.length}
            icon={ChartBarIcon}
            colorPalette="purple"
          />
          <MetricCard
            title="Última Actualización"
            value={metrics.lastUpdate}
            icon={MagnifyingGlassIcon}
            colorPalette="gray"
          />
        </CardGrid>
      </StatsSection>

      {/* 🔍 INSIGHTS Y ANÁLISIS */}
      <Section variant="elevated" title="Insights Inteligentes">
        <Stack direction="row" justify="space-between" align="center" mb="lg">
          <Typography variant="heading" size="lg">
            Analytics del Sistema
          </Typography>
          <Button
            variant="solid"
            colorPalette="purple"
            onClick={actions.runDeepAnalysis}
            loading={isAnalyzing}
            loadingText="Analizando..."
          >
            <Icon icon={MagnifyingGlassIcon} size="sm" />
            Análisis Profundo
          </Button>
        </Stack>

        {/* Grid de insights aquí */}
      </Section>

      {/* 📈 ANÁLISIS AVANZADO - Condicional */}
      {showAdvanced && (
        <Section variant="elevated" title="Análisis Avanzado">
          {/* Contenido avanzado aquí */}
        </Section>
      )}
    </ContentLayout>
  );
}
```

---

## 🚫 **REGLAS ABSOLUTAS**

### **✅ OBLIGATORIO**
1. **SIEMPRE** usar una de las 3 plantillas arriba
2. **SIEMPRE** importar desde `@/shared/ui` únicamente
3. **SIEMPRE** usar `ContentLayout spacing="normal"` como contenedor
4. **SIEMPRE** incluir loading y error handling
5. **SIEMPRE** usar `ModuleEventUtils` para eventos de negocio
6. **SIEMPRE** usar spacing estándar: `gap="md"` para CardGrid, `gap={8}` para Stack

### **❌ PROHIBIDO**
1. **NUNCA** importar de `@chakra-ui/react` directamente
2. **NUNCA** usar `CardWrapper` directamente - solo `Section`
3. **NUNCA** usar `PageHeader` - ya eliminado por ocupar espacio innecesario
4. **NUNCA** hardcodear dimensiones - usar tokens del sistema
5. **NUNCA** usar CSS-in-JS inline - confiar en el sistema de tokens

### **📱 RESPONSIVE OBLIGATORIO**
```tsx
// ✅ PATRÓN RESPONSIVE ESTÁNDAR G-ADMIN
<CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">

// ❌ NUNCA hardcodear columnas
<CardGrid columns={4}>
```

---

## 🎨 **SYSTEM IMPORT REFERENCE**

```tsx
// ✅ IMPORT ESTÁNDAR G-ADMIN
import {
  // Layout Semántico (PRIORIDAD)
  ContentLayout, Section, FormSection, StatsSection,

  // Componentes Base
  Stack, Typography, Button, Modal, Alert, Badge, Icon,

  // Componentes de Negocio
  MetricCard, CardGrid, Tabs

  // NO INCLUIR: PageHeader (eliminado), CardWrapper (usar Section)
} from '@/shared/ui';

// Icons
import { IconName } from '@heroicons/react/24/outline';

// Business Logic
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';
import { useModulePage } from './hooks';
```

---

## 🔄 **HOOK PATTERN OBLIGATORIO**

```tsx
// hooks/useModulePage.ts - PATRÓN ESTÁNDAR
export function useModulePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ModuleMetrics>({});
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueSize, setQueueSize] = useState(0);
  const [alertsData, setAlertsData] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState('management');

  // Efectos de inicialización
  useEffect(() => {
    initializeModule();
  }, []);

  // Handlers de acciones
  const actions = {
    handlePrimaryAction: () => {
      ModuleEventUtils.business.actionTriggered('primary-action');
      // Lógica específica
    },
    handleSecondaryAction: () => {
      // Lógica específica
    }
  };

  return {
    isLoading, error, connectionQuality, isSyncing, queueSize,
    metrics, activeTab, setActiveTab, alertsData, actions
  };
}
```

---

## 📊 **MÉTRICA PATTERNS**

```tsx
// ✅ MÉTRICAS EMPRESARIALES ESTÁNDAR
const businessMetrics = [
  {
    title: "Revenue Principal",
    value: `$${revenue.toLocaleString('es-AR')}`,
    icon: CurrencyDollarIcon,
    colorPalette: "green",
    trend: { value: growth, isPositive: growth > 0 }
  },
  {
    title: "Operaciones Activas",
    value: activeOperations,
    icon: UsersIcon,
    colorPalette: "blue"
  },
  {
    title: "Eficiencia",
    value: `${efficiency}%`,
    icon: ChartBarIcon,
    colorPalette: "purple",
    trend: { value: efficiencyChange, isPositive: efficiencyChange > 0 }
  },
  {
    title: "Transacciones Hoy",
    value: todayTransactions,
    icon: DocumentTextIcon,
    colorPalette: "teal"
  }
];
```

---

## 🚀 **MIGRATION CHECKLIST**

Para migrar páginas existentes:

1. **✅** Identificar tipo de página (Empresarial/Config/Analytics)
2. **✅** Copiar plantilla correspondiente
3. **✅** Migrar lógica al hook useModulePage()
4. **✅** Actualizar imports a @/shared/ui
5. **✅** Eliminar PageHeader si existe
6. **✅** Reemplazar CardWrapper por Section
7. **✅** Verificar responsive patterns
8. **✅** Agregar ModuleEventUtils para eventos
9. **✅** Testear en mobile y desktop

---

**🎯 Esta guía es DEFINITIVA para construir páginas G-Admin consistentes y eficientes.**