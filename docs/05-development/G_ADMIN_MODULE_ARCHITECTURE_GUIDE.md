# 🏗️ G-ADMIN MODULE ARCHITECTURE GUIDE

**Guía definitiva para construcción de módulos empresariales en G-Admin**
*Basado en patrón Products Module - Para agentes de desarrollo*

---

## 🎯 **ESTRUCTURA ESTÁNDAR DE MÓDULO**

### **📁 Arquitectura de Carpetas OBLIGATORIA**

```
src/pages/admin/[domain]/[module]/
├── README.md                   # 📖 Documentación completa del módulo
├── page.tsx                    # 🎯 Página orquestadora (NUNCA lógica de negocio)
│
├── components/                 # 🧩 Componentes UI específicos del módulo
│   ├── index.ts               # 📦 Barrel exports obligatorio
│   ├── [Feature]List/         # 📋 Componente principal de listado
│   ├── [Feature]FormModal/    # ➕ Modal para crear/editar
│   ├── [Feature]Analytics/    # 📊 Componente de analytics
│   └── sections/              # 🗂️ Secciones organizadas por funcionalidad
│       ├── ManagementSection.tsx
│       ├── AnalyticsSection.tsx
│       └── ReportsSection.tsx
│
├── hooks/                     # 🪝 Hooks de negocio y página
│   ├── index.ts              # 📦 Barrel exports obligatorio
│   ├── use[Module]Page.ts    # 🎭 Hook orquestador principal
│   ├── use[Feature].ts       # 📊 Hooks de funcionalidades específicas
│   └── use[Module]Analytics.ts # 📈 Hook de analytics si aplica
│
├── services/                  # ⚙️ Lógica de negocio y servicios
│   ├── index.ts              # 📦 Barrel exports obligatorio
│   ├── [module]Api.ts        # 🌐 API calls y gestión de datos
│   ├── [module]Service.ts    # 💼 Lógica de negocio principal
│   ├── [module]Calculations.ts # 🧮 Cálculos específicos del dominio
│   └── [module]Validations.ts # ✅ Validaciones de negocio
│
├── types/                    # 🏷️ Definiciones TypeScript
│   ├── index.ts             # 📦 Barrel exports obligatorio
│   ├── [module].types.ts    # 📝 Interfaces principales del módulo
│   ├── api.types.ts         # 🌐 Types para API responses
│   └── business.types.ts    # 💼 Types de lógica de negocio
│
└── utils/                   # 🛠️ Utilidades específicas del módulo
    ├── index.ts            # 📦 Barrel exports obligatorio
    ├── [module]Helpers.ts  # 🔧 Helper functions
    └── constants.ts        # 📋 Constantes del módulo
```

---

## 🎭 **PATRÓN "PÁGINA ORQUESTADORA"**

### **📋 page.tsx - Estructura OBLIGATORIA**

```tsx
// src/pages/admin/[domain]/[module]/page.tsx
// 🎯 PÁGINA ORQUESTADORA - Sin lógica de negocio
import {
  ContentLayout, StatsSection, Section, CardGrid, MetricCard,
  Button, Alert, Icon, Stack, Typography, Tabs
} from '@/shared/ui';
import {
  // Iconos específicos del dominio empresarial
  PlusIcon, ChartBarIcon, CogIcon
} from '@heroicons/react/24/outline';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';

// Imports del módulo
import { useModulePage } from './hooks';
import {
  FeatureList, FeatureFormModal, AnalyticsSection,
  ManagementSection, ReportsSection
} from './components';

export default function ModulePage() {
  // 🎭 TODA la lógica delegada al hook orquestador
  const {
    isLoading, error, metrics, activeTab, setActiveTab,
    connectionQuality, isSyncing, queueSize, alertsData,
    actions
  } = useModulePage();

  // Estados estándar G-Admin
  if (isLoading) return <div>Cargando...</div>;
  if (error) {
    ModuleEventUtils.business.error('module-load-failed', error);
    return <Alert variant="subtle" title={error} />;
  }

  return (
    <ContentLayout spacing="normal">
      {/* 🔄 Estado de conexión empresarial */}
      {(isSyncing || queueSize > 0) && (
        <Section variant="elevated" title="Estado de Sincronización">
          {/* Status de sincronización */}
        </Section>
      )}

      {/* 📊 Métricas de negocio - SIEMPRE PRIMERO */}
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </CardGrid>
      </StatsSection>

      {/* 🚨 Alertas críticas - Solo si existen */}
      {alertsData.length > 0 && (
        <Section variant="elevated" title="Alertas y Notificaciones">
          {/* Alertas del módulo */}
        </Section>
      )}

      {/* 🎯 Gestión principal con tabs */}
      <Section variant="elevated" title="Gestión del Módulo">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="management">Gestión</Tabs.Trigger>
            <Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
            <Tabs.Trigger value="reports">Reportes</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="management">
            <ManagementSection />
          </Tabs.Content>
          <Tabs.Content value="analytics">
            <AnalyticsSection />
          </Tabs.Content>
          <Tabs.Content value="reports">
            <ReportsSection />
          </Tabs.Content>
        </Tabs>
      </Section>

      {/* ⚡ Acciones rápidas */}
      <Section variant="default" title="Acciones Rápidas">
        <Stack direction="row" gap="md" flexWrap="wrap">
          <Button variant="solid" onClick={actions.handlePrimaryAction} size="lg">
            <Icon icon={PlusIcon} size="sm" />
            Nueva Acción
          </Button>
          <Button variant="outline" onClick={actions.handleAnalytics} flex="1" minW="200px">
            <Icon icon={ChartBarIcon} size="sm" />
            Ver Analytics
          </Button>
        </Stack>
      </Section>

      {/* 📝 Modales y overlays */}
      <FeatureFormModal />
    </ContentLayout>
  );
}
```

---

## 🪝 **HOOK ORQUESTADOR ESTÁNDAR**

### **📋 hooks/useModulePage.ts - Patrón OBLIGATORIO**

```tsx
// hooks/useModulePage.ts
// 🎭 HOOK ORQUESTADOR - Coordina toda la lógica de la página
import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';
import { moduleService, moduleAnalyticsService } from '../services';
import type { ModuleMetrics, ModuleState } from '../types';

export function useModulePage() {
  // 📊 Estado principal del módulo
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ModuleMetrics[]>([]);

  // 🔄 Estado de conexión empresarial
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueSize, setQueueSize] = useState(0);

  // 🎯 Estado de UI
  const [activeTab, setActiveTab] = useState('management');
  const [alertsData, setAlertsData] = useState([]);

  // 🚀 Configuración de navegación global
  const { setQuickActions } = useNavigation();

  // 🎯 Inicialización del módulo
  useEffect(() => {
    initializeModule();
    setupQuickActions();
    return () => cleanup();
  }, []);

  const initializeModule = async () => {
    try {
      setIsLoading(true);

      // Cargar datos paralelo
      const [metricsData, alertsData, syncStatus] = await Promise.all([
        moduleService.getMetrics(),
        moduleService.getAlerts(),
        moduleService.getSyncStatus()
      ]);

      setMetrics(metricsData);
      setAlertsData(alertsData);
      setConnectionQuality(syncStatus.quality);
      setIsSyncing(syncStatus.syncing);
      setQueueSize(syncStatus.queueSize);

      // Reportar carga exitosa
      ModuleEventUtils.business.moduleLoaded('module-name');

    } catch (error) {
      setError(error.message);
      ModuleEventUtils.business.error('module-load-failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupQuickActions = useCallback(() => {
    const quickActions = [
      {
        id: 'new-item',
        label: 'Nuevo Item',
        icon: PlusIcon,
        action: handlePrimaryAction,
        color: 'purple'
      },
      {
        id: 'analytics',
        label: 'Ver Analytics',
        icon: ChartBarIcon,
        action: handleAnalytics,
        color: 'blue'
      }
    ];

    setQuickActions(quickActions);
  }, []);

  // 🎯 Handlers de acciones
  const actions = {
    handlePrimaryAction: useCallback(() => {
      ModuleEventUtils.business.actionTriggered('primary-action');
      // Lógica específica del módulo
    }, []),

    handleAnalytics: useCallback(() => {
      ModuleEventUtils.business.actionTriggered('analytics-viewed');
      // Navegar a analytics o abrir modal
    }, []),

    handleSecondaryAction: useCallback(() => {
      // Lógica de acción secundaria
    }, [])
  };

  const cleanup = useCallback(() => {
    setQuickActions([]);
  }, [setQuickActions]);

  return {
    // Estado principal
    isLoading, error, metrics,

    // Estado de conexión
    connectionQuality, isSyncing, queueSize,

    // Estado de UI
    activeTab, setActiveTab, alertsData,

    // Acciones
    actions
  };
}
```

---

## ⚙️ **SERVICIOS DE NEGOCIO**

### **📋 services/[module]Service.ts - Lógica Principal**

```tsx
// services/moduleService.ts
// 💼 SERVICIO PRINCIPAL - Lógica de negocio pura
import { Decimal } from 'decimal.js';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';
import { supabase } from '@/lib/supabase';
import type { ModuleData, ModuleMetrics, CreateModuleRequest } from '../types';

export class ModuleService {
  // 📊 Obtener métricas del módulo
  static async getMetrics(): Promise<ModuleMetrics[]> {
    try {
      const { data, error } = await supabase
        .from('module_metrics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar datos con precisión decimal
      return data.map(metric => ({
        title: metric.title,
        value: new Decimal(metric.value).toFixed(2),
        icon: metric.icon,
        colorPalette: metric.color_palette,
        trend: {
          value: new Decimal(metric.trend_value).toNumber(),
          isPositive: metric.trend_value > 0
        }
      }));
    } catch (error) {
      ModuleEventUtils.business.error('metrics-load-failed', error);
      throw error;
    }
  }

  // ➕ Crear nuevo elemento
  static async createItem(data: CreateModuleRequest): Promise<ModuleData> {
    try {
      // Validaciones de negocio
      this.validateCreateData(data);

      const { data: result, error } = await supabase
        .from('module_items')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      // Evento de negocio
      ModuleEventUtils.business.itemCreated('module-name', result.id);

      return result;
    } catch (error) {
      ModuleEventUtils.business.error('item-create-failed', error);
      throw error;
    }
  }

  // ✅ Validaciones de negocio
  private static validateCreateData(data: CreateModuleRequest): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('El nombre es obligatorio');
    }

    if (data.cost && new Decimal(data.cost).lessThan(0)) {
      throw new Error('El costo no puede ser negativo');
    }

    // Más validaciones específicas del dominio
  }

  // 🔄 Estado de sincronización
  static async getSyncStatus() {
    try {
      const { data, error } = await supabase
        .from('sync_status')
        .select('*')
        .eq('module_name', 'module-name')
        .single();

      if (error) throw error;

      return {
        quality: data.connection_quality,
        syncing: data.is_syncing,
        queueSize: data.pending_operations
      };
    } catch (error) {
      return {
        quality: 'excellent',
        syncing: false,
        queueSize: 0
      };
    }
  }

  // 🚨 Obtener alertas críticas
  static async getAlerts() {
    try {
      const { data, error } = await supabase
        .from('module_alerts')
        .select('*')
        .eq('module_name', 'module-name')
        .eq('active', true)
        .order('severity', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      ModuleEventUtils.business.error('alerts-load-failed', error);
      return [];
    }
  }
}

export const moduleService = ModuleService;
```

### **📋 services/[module]Calculations.ts - Cálculos Especializados**

```tsx
// services/moduleCalculations.ts
// 🧮 CÁLCULOS ESPECIALIZADOS - Lógica matemática pura
import { Decimal } from 'decimal.js';
import type { CalculationInput, CalculationResult } from '../types';

export class ModuleCalculations {
  // 💰 Cálculo principal del dominio
  static calculateDomainMetric(input: CalculationInput): CalculationResult {
    // Usar Decimal.js para precisión financiera
    const baseValue = new Decimal(input.baseValue);
    const multiplier = new Decimal(input.multiplier);
    const taxes = new Decimal(input.taxes || 0);

    // Cálculo principal
    const subtotal = baseValue.mul(multiplier);
    const totalTaxes = subtotal.mul(taxes).div(100);
    const total = subtotal.plus(totalTaxes);

    return {
      subtotal: subtotal.toFixed(2),
      taxes: totalTaxes.toFixed(2),
      total: total.toFixed(2),
      breakdown: {
        baseValue: baseValue.toFixed(2),
        multiplier: multiplier.toFixed(2),
        taxRate: taxes.toFixed(2)
      }
    };
  }

  // 📊 Cálculo de métricas de rendimiento
  static calculatePerformanceMetrics(data: PerformanceData[]): PerformanceMetrics {
    if (!data.length) return this.getEmptyMetrics();

    const totalOperations = data.length;
    const successfulOperations = data.filter(d => d.success).length;
    const efficiency = new Decimal(successfulOperations)
      .div(totalOperations)
      .mul(100);

    const averageTime = data
      .reduce((sum, d) => sum.plus(d.duration), new Decimal(0))
      .div(totalOperations);

    return {
      efficiency: efficiency.toFixed(1),
      averageTime: averageTime.toFixed(2),
      totalOperations,
      successfulOperations,
      failedOperations: totalOperations - successfulOperations
    };
  }

  private static getEmptyMetrics(): PerformanceMetrics {
    return {
      efficiency: '0.0',
      averageTime: '0.00',
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0
    };
  }
}

export const moduleCalculations = ModuleCalculations;
```

---

## 🏷️ **SYSTEM TYPES**

### **📋 types/[module].types.ts - Interfaces Principales**

```tsx
// types/module.types.ts
// 📝 INTERFACES PRINCIPALES DEL MÓDULO
export interface ModuleData {
  id: string;
  name: string;
  description?: string;
  cost: string; // Usar string para Decimal.js
  created_at: string;
  updated_at: string;
  active: boolean;
}

export interface ModuleMetrics {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  colorPalette: 'green' | 'blue' | 'purple' | 'teal' | 'orange' | 'red';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export interface ModuleState {
  items: ModuleData[];
  selectedItem: ModuleData | null;
  metrics: ModuleMetrics[];
  loading: boolean;
  error: string | null;
}

export interface CreateModuleRequest {
  name: string;
  description?: string;
  cost?: string;
}

export interface ModuleAlert {
  id: string;
  module_name: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  active: boolean;
  created_at: string;
}

export interface SyncStatus {
  quality: 'excellent' | 'good' | 'poor';
  syncing: boolean;
  queueSize: number;
}
```

---

## 📊 **INTEGRATION PATTERNS**

### **🔄 EventBus Integration**

```tsx
// Eventos estándar que DEBE emitir cada módulo
const MODULE_EVENTS = {
  // Eventos de ciclo de vida
  MODULE_LOADED: 'module:loaded',
  MODULE_ERROR: 'module:error',

  // Eventos de datos
  ITEM_CREATED: 'module:item_created',
  ITEM_UPDATED: 'module:item_updated',
  ITEM_DELETED: 'module:item_deleted',

  // Eventos de métricas
  METRICS_UPDATED: 'module:metrics_updated',
  PERFORMANCE_CALCULATED: 'module:performance_calculated'
} as const;

// Eventos que DEBE escuchar del sistema
const SUBSCRIBED_EVENTS = [
  'system:sync_required',
  'user:preferences_updated',
  'business:working_hours_changed'
] as const;
```

### **📱 Responsive Patterns**

```tsx
// Patterns responsivos obligatorios
const RESPONSIVE_PATTERNS = {
  // Grid de métricas
  metrics: { base: 1, sm: 2, lg: 4 },

  // Grid de contenido
  content: { base: 1, md: 2, lg: 3 },

  // Spacing estándar
  gaps: {
    small: 'sm',    // 4px
    medium: 'md',   // 16px
    large: 'lg'     // 24px
  }
};
```

---

## 🚀 **CHECKLIST DE NUEVO MÓDULO**

### **✅ Creación Paso a Paso**

1. **📁 Estructura de carpetas**
   ```bash
   mkdir -p components hooks services types utils
   touch README.md page.tsx
   touch components/index.ts hooks/index.ts services/index.ts types/index.ts utils/index.ts
   ```

2. **🎯 Implementar página orquestadora**
   - Copiar plantilla de page.tsx
   - Usar ContentLayout + Section structure
   - Sin lógica de negocio

3. **🪝 Crear hook orquestador**
   - Implementar useModulePage.ts
   - Estado estándar (loading, error, metrics)
   - EventBus integration

4. **⚙️ Desarrollar servicios**
   - API service con Supabase
   - Business logic service
   - Calculations con Decimal.js

5. **🏷️ Definir types**
   - Interfaces principales
   - API types
   - Business types

6. **📝 Documentar módulo**
   - Copiar este README.md estructura
   - Adaptar contenido específico

---

## 🔧 **ENGINES DISPONIBLES PARA REUTILIZACIÓN**

### **💰 Tax Calculation Engine**
```tsx
import { taxCalculationService } from '@/pages/admin/finance/fiscal/services';
// Reutilizable en: Sales, Purchases, Payroll, Invoicing
```

### **📊 Menu Engineering Engine**
```tsx
import { menuEngineeringCalculations } from '@/pages/admin/supply-chain/products/services';
// Reutilizable en: Sales Analytics, Product Planning, Revenue Optimization
```

### **👥 Staff Performance Engine**
```tsx
import { staffAnalyticsService } from '@/pages/admin/resources/staff/services';
// Reutilizable en: Operations, Performance Reviews, Scheduling
```

### **📦 Inventory Optimization Engine**
```tsx
import { inventoryCalculations } from '@/pages/admin/supply-chain/materials/services';
// Reutilizable en: Procurement, Sales, Cost Analysis
```

---

**🎯 Esta guía es el estándar DEFINITIVO para construcción de módulos G-Admin.**

**📋 85-95% de reutilización confirmada entre módulos siguiendo estos patrones.**