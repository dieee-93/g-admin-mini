# 🏗️ GUÍA MAESTRA DE CONSTRUCCIÓN UI - G-ADMIN MINI

**Guía definitiva unificada para construir módulos consistentes**
*Versión 2.1 - Basada en código real verificado*
*Fecha: 2025-09-19*

---

## 🎯 **FILOSOFÍA UNIFICADA**

**"Tres plantillas específicas con base arquitectónica común"**

1. **Base común**: `ContentLayout` + Design System v2.1 + 12 sistemas integrados
2. **Plantillas específicas**: Empresarial, Configuración, Analytics
3. **Arquitectura verificada**: Wrappers en App.tsx, módulos solo con ContentLayout
4. **Consistencia cross-módulo**: Mismo patrón visual entre módulos del mismo tipo

---

## 🏗️ **ARQUITECTURA BASE VERIFICADA**

### **ESTRUCTURA REAL DEL CÓDIGO**
```typescript
// ✅ App.tsx (nivel arquitectónico)
<ErrorBoundary>                    // Nivel App (una sola vez)
  <Routes>
    <Route element={
      <ResponsiveLayout>             // Por ruta (maneja mobile/desktop)
        <ModulePage />               // Página individual
      </ResponsiveLayout>
    } />

// ✅ ModulePage.tsx (nivel módulo - SIN wrappers duplicados)
function ModulePage() {
  return (
    <ContentLayout spacing="normal"> // Solo layout de contenido
      {/* Contenido específico del módulo */}
    </ContentLayout>
  );
}
```

### **❌ NUNCA HACER**
```typescript
// ❌ NO duplicar wrappers en páginas individuales
function ModulePage() {
  return (
    <ErrorBoundary>        // ← Ya está en App.tsx
      <ResponsiveLayout>   // ← Ya está en la ruta
        <ContentLayout>
```

---

## 📋 **IMPORTS OBLIGATORIOS**

### **DESIGN SYSTEM V2.1 (ÚNICO VÁLIDO)**
```typescript
// ✅ ÚNICO IMPORT VÁLIDO
import {
  // Layout semántico
  ContentLayout, Section, FormSection, StatsSection,

  // Componentes base
  Stack, Typography, Button, Modal, Alert, Badge, Icon,

  // Componentes de negocio
  MetricCard, CardGrid
} from '@/shared/ui';

// Icons
import { HomeIcon, UserIcon } from '@heroicons/react/24/outline';

// ❌ PROHIBIDO - Genera inconsistencias
import { Box, VStack, HStack, Text, SimpleGrid } from '@chakra-ui/react';
```

### **SISTEMAS INTEGRADOS (12 SISTEMAS)**
```typescript
// Integración completa de sistemas
import { useModuleIntegration } from '@/hooks/useModuleIntegration';
import { CapabilityGate } from '@/lib/capabilities';
import { useErrorHandler } from '@/lib/error-handling';
import { notify } from '@/lib/notifications';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { formatCurrency, safeAdd } from '@/business-logic/shared/decimalUtils';
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';
import { secureApiCall } from '@/lib/validation/security';
```

---

## 🎯 **PLANTILLAS ESPECÍFICAS**

### **PLANTILLA 1: MÓDULO EMPRESARIAL**
*Usar para: Sales, Staff, Materials, Customers, Operations*

**Estructura obligatoria**:
1. **Estado de conexión** (si offline/sync crítico)
2. **Métricas de negocio** (SIEMPRE PRIMERO)
3. **Alertas críticas** (solo si existen)
4. **Gestión principal** (con tabs)
5. **Acciones rápidas**

```typescript
// 📁 src/pages/admin/[domain]/[module]/page.tsx
import {
  ContentLayout, StatsSection, Section, CardGrid, MetricCard,
  Button, Alert, Badge, Icon, Stack, Typography, Tabs
} from '@/shared/ui';
import { useModuleIntegration } from '@/hooks/useModuleIntegration';

export default function BusinessModulePage() {
  const { emitEvent, hasCapability, status } = useModuleIntegration('module', config);
  const { metrics, pageState, actions, error, loading } = useModulePage();

  if (error) {
    return (
      <ContentLayout spacing="normal">
        <Alert status="error" title="Error de carga">
          {error}
        </Alert>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      {/* 🔒 1. ESTADO DE CONEXIÓN - Solo si crítico */}
      {!status.isActive && (
        <Alert
          variant="subtle"
          title="Module Capabilities Required"
          description={`Missing capabilities: ${status.missingCapabilities.join(', ')}`}
        />
      )}

      {/* 📊 2. MÉTRICAS DE NEGOCIO - OBLIGATORIO PRIMERO */}
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }}>
          <MetricCard
            title="Revenue Principal"
            value={`$${metrics.revenue.toLocaleString('es-AR')}`}
            icon={CurrencyDollarIcon}
            colorPalette="green"
            trend={{ value: metrics.growth, isPositive: metrics.growth > 0 }}
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

      {/* 🚨 3. ALERTAS CRÍTICAS - Solo si existen */}
      {alertsData.length > 0 && (
        <Section variant="elevated" title="Alertas y Notificaciones">
          <Stack direction="column" gap="sm">
            {alertsData.map((alert, index) => (
              <Alert key={index} variant="subtle" title={alert.message} />
            ))}
          </Stack>
        </Section>
      )}

      {/* 🎯 4. GESTIÓN PRINCIPAL CON TABS - OBLIGATORIO */}
      <Section variant="elevated" title="Gestión Operacional">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="management">Gestión</Tabs.Trigger>
            <Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
            <Tabs.Trigger value="reports">Reportes</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="management">
            {/* Contenido de gestión específico del módulo */}
          </Tabs.Content>
          <Tabs.Content value="analytics">
            {/* Contenido de analytics específico del módulo */}
          </Tabs.Content>
          <Tabs.Content value="reports">
            {/* Contenido de reportes específico del módulo */}
          </Tabs.Content>
        </Tabs>
      </Section>

      {/* ⚡ 5. ACCIONES RÁPIDAS - OBLIGATORIO */}
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

### **PLANTILLA 2: MÓDULO DE CONFIGURACIÓN**
*Usar para: Settings, Admin tools, Permisos, Integraciones*

**Estructura obligatoria**:
1. **Formularios principales**
2. **Formularios avanzados**
3. **Botones de acción**

```typescript
// 📁 src/pages/admin/[domain]/[module]/page.tsx
import {
  ContentLayout, Section, FormSection, Alert, Stack, Button
} from '@/shared/ui';

export default function ConfigModulePage() {
  const { config, isDirty, actions, error, loading } = useConfigPage();

  if (error) {
    return (
      <ContentLayout spacing="normal">
        <Alert status="error" title="Error de configuración">
          {error}
        </Alert>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="Configuración del Sistema">

        {/* 📋 1. CONFIGURACIÓN PRINCIPAL - OBLIGATORIO */}
        <FormSection
          title="Configuración Principal"
          description="Ajustes críticos que afectan el funcionamiento del módulo"
        >
          {/* Formulario de configuración principal aquí */}
        </FormSection>

        {/* ⚙️ 2. CONFIGURACIÓN AVANZADA - OBLIGATORIO */}
        <FormSection
          title="Configuración Avanzada"
          description="Opciones para usuarios experimentados"
        >
          {/* Configuración avanzada aquí */}
        </FormSection>

        {/* 💾 3. BOTONES DE ACCIÓN - OBLIGATORIO */}
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

### **PLANTILLA 3: MÓDULO ANALYTICS/BI**
*Usar para: Dashboard, Executive, Reporting, Intelligence*

**Estructura obligatoria**:
1. **Métricas ejecutivas**
2. **Insights y análisis**
3. **Análisis avanzado** (condicional)

```typescript
// 📁 src/pages/admin/[domain]/[module]/page.tsx
import {
  ContentLayout, StatsSection, Section, CardGrid, MetricCard,
  Button, Icon, Stack, Typography
} from '@/shared/ui';

export default function AnalyticsModulePage() {
  const { metrics, insights, isAnalyzing, showAdvanced, actions, error } = useAnalyticsPage();

  if (error) {
    return (
      <ContentLayout spacing="normal">
        <Alert status="error" title="Error de analytics">
          {error}
        </Alert>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      {/* 📊 1. MÉTRICAS EJECUTIVAS - OBLIGATORIO */}
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }}>
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

      {/* 🔍 2. INSIGHTS Y ANÁLISIS - OBLIGATORIO */}
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

        {/* Grid de insights específicos del módulo aquí */}
      </Section>

      {/* 📈 3. ANÁLISIS AVANZADO - CONDICIONAL */}
      {showAdvanced && (
        <Section variant="elevated" title="Análisis Avanzado">
          {/* Contenido avanzado específico del módulo aquí */}
        </Section>
      )}
    </ContentLayout>
  );
}
```

---

## 🔄 **HOOK PATTERN OBLIGATORIO**

### **ESTRUCTURA ESTÁNDAR DEL HOOK**
```typescript
// 📁 hooks/use[Module]Page.ts - PATRÓN OBLIGATORIO
export function useModulePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ModuleMetrics>({});
  const [pageState, setPageState] = useState<PageState>({});
  const [activeTab, setActiveTab] = useState('management');

  // Integración con sistemas
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();
  const { shouldReduceAnimations } = usePerformanceMonitor();

  // Efectos de inicialización
  useEffect(() => {
    initializeModule();
  }, []);

  // Handlers de acciones específicas del tipo de módulo
  const actions = {
    // Para módulos empresariales
    handlePrimaryAction: () => {
      emitEvent('primary_action_triggered');
      // Lógica específica
    },

    // Para módulos de configuración
    handleSave: () => {
      // Lógica de guardado
    },
    handleReset: () => {
      // Lógica de reset
    },

    // Para módulos analytics
    runDeepAnalysis: () => {
      // Lógica de análisis
    }
  };

  return {
    loading, error, metrics, pageState, activeTab, setActiveTab, actions
  };
}
```

---

## 🎨 **PATRONES DE CONSISTENCIA CROSS-MÓDULO**

### **MÉTRICAS ESTÁNDAR POR TIPO**

#### **MÉTRICAS EMPRESARIALES (Sales, Staff, Materials)**
```typescript
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
    colorPalette: "purple"
  },
  {
    title: "Transacciones Hoy",
    value: todayTransactions,
    icon: DocumentTextIcon,
    colorPalette: "teal"
  }
];
```

#### **MÉTRICAS ANALYTICS (Dashboard, Intelligence, Reporting)**
```typescript
const analyticsMetrics = [
  {
    title: "Impacto Total",
    value: `$${totalImpact.toLocaleString('es-AR')}`,
    icon: CurrencyDollarIcon,
    colorPalette: "green"
  },
  {
    title: "Eficiencia Promedio",
    value: `${averageEfficiency}%`,
    icon: ArrowTrendingUpIcon,
    colorPalette: "blue"
  },
  {
    title: "Insights Activos",
    value: activeInsights,
    icon: ChartBarIcon,
    colorPalette: "purple"
  },
  {
    title: "Última Actualización",
    value: lastUpdate,
    icon: MagnifyingGlassIcon,
    colorPalette: "gray"
  }
];
```

### **NAVEGACIÓN ESTÁNDAR POR TIPO**

#### **TABS EMPRESARIALES**
```typescript
const businessTabs = [
  { value: "management", label: "Gestión" },
  { value: "analytics", label: "Analytics" },
  { value: "reports", label: "Reportes" }
];
```

#### **SECCIONES CONFIGURACIÓN**
```typescript
const configSections = [
  { title: "Configuración Principal", description: "Ajustes críticos" },
  { title: "Configuración Avanzada", description: "Opciones expertas" }
];
```

---

## ✅ **CHECKLIST DE VALIDACIÓN**

### **ANTES DE DESARROLLAR**
- [ ] ¿Identifiqué correctamente el tipo de módulo? (Empresarial/Config/Analytics)
- [ ] ¿Revisé módulos similares existentes para mantener consistencia?
- [ ] ¿Las métricas siguen el patrón estándar del tipo?
- [ ] ¿La navegación es consistente con módulos del mismo tipo?

### **STRUCTURE COMPLIANCE**
- [ ] ✅ Usa SOLO `ContentLayout` (sin ErrorBoundary/ResponsiveLayout)
- [ ] ✅ Imports desde `@/shared/ui` únicamente
- [ ] ✅ Sigue plantilla específica del tipo de módulo
- [ ] ✅ Hook pattern implementado (`use[Module]Page`)
- [ ] ✅ Integración EventBus configurada
- [ ] ✅ Error handling implementado

### **CONSISTENCY COMPLIANCE**
- [ ] ✅ Métricas en misma posición que módulos similares
- [ ] ✅ Navegación consistente (tabs, secciones, botones)
- [ ] ✅ Visual hierarchy identical to similar modules
- [ ] ✅ Same interaction patterns as related modules

### **INTEGRATION COMPLIANCE**
- [ ] ✅ CapabilityGate implementado
- [ ] ✅ EventBus events definidos y documentados
- [ ] ✅ Sistemas de alertas integrado
- [ ] ✅ Offline-first patterns aplicados (si crítico)

---

## 🚨 **CRITERIOS DE RECHAZO AUTOMÁTICO**

**PR SERÁ RECHAZADO SI:**
- ❌ Incluye `ErrorBoundary` o `ResponsiveLayout` en página individual
- ❌ Importa directamente de `@chakra-ui/react`
- ❌ No sigue plantilla específica del tipo de módulo
- ❌ No implementa hook pattern estándar
- ❌ Métricas en posiciones diferentes a módulos similares
- ❌ Navegación inconsistente con módulos del mismo tipo
- ❌ No integra CapabilityGate o EventBus

---

## 📚 **REFERENCIAS DE CÓDIGO**

### **EJEMPLOS REALES VERIFICADOS**
- **Empresarial**: `src/pages/admin/supply-chain/materials/page.tsx`
- **Empresarial**: `src/pages/admin/operations/sales/page.tsx`
- **Arquitectura**: `src/App.tsx` (wrappers correctos)

### **DOCUMENTACIÓN RELACIONADA**
- `AI_KNOWLEDGE_BASE.md` - Sistema completo y decisiones
- `MODULE_PLANNING_MASTER_GUIDE.md` - Planificación dimensional
- `component-library.md` - Design System v2.1

---

## 🎯 **RESULTADOS ESPERADOS**

### **CONSISTENCIA VISUAL**
- ✅ **90%+ similitud** entre módulos del mismo tipo
- ✅ **Flujo de navegación idéntico** para módulos relacionados
- ✅ **Métricas en posiciones consistentes** cross-módulo
- ✅ **Learning curve zero** para usuarios entre módulos

### **PRODUCTIVIDAD DESARROLLO**
- ✅ **70% código reutilizable** entre módulos similares
- ✅ **Template-driven development** - copy & customize
- ✅ **Arquitectura predecible** - sin sorpresas
- ✅ **Error-prevention** automático con patterns

---

*🎯 MANTRA: "Tres plantillas, base común, consistencia total"*

---

*UI Module Construction Master Guide - G-Admin Mini v2.1*
*Documento definitivo para construcción consistente de módulos*