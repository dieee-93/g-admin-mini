# 🏗️ ARQUITECTURA DE FUNDACIONES G-ADMIN v3.0

> **Fecha**: 15 Septiembre 2025
> **Estado**: BLUEPRINT TÉCNICO FINAL
> **Propósito**: Especificación técnica para implementar fundaciones sólidas
> **Validación**: Basado en análisis de 424 componentes y patrones existentes

---

## 🎯 EXECUTIVE OVERVIEW

Esta es la **especificación técnica definitiva** para implementar las fundaciones que permitirán el desarrollo acelerado de todos los módulos futuros de G-Admin v3.0.

### **PRINCIPIOS ARQUITECTÓNICOS**
1. **Composición Dinámica** sobre configuración estática
2. **Reutilización Inteligente** sobre implementación desde cero
3. **Desacoplamiento** con comunicación vía eventos
4. **Escalabilidad** con lazy loading y code splitting
5. **Consistencia** en patrones y convenciones

---

## 📋 MATRIZ DE DEPENDENCIAS TÉCNICAS

### **LAYER 0: INFRASTRUCTURE** (Existente - No requiere cambios)
```
EventBus ✅         → Sistema de eventos maduro (111+ eventos)
Zustand Store ✅    → State management global
Design System ✅    → UI components semánticos
Routing ✅          → React Router con lazy loading
API Layer ✅        → Fetch abstraction con offline support
```

### **LAYER 1: FOUNDATION SYSTEMS** (A implementar - Fase 0)
```
CapabilityGate      → Renderizado condicional basado en business model
SlotSystem          → Inyección dinámica de componentes
ModuleRegistry      → Registro y discovery de módulos
DependencyResolver  → Resolución automática de dependencias inter-módulo
```

### **LAYER 2: MODULE FRAMEWORK** (A implementar - Fase 0)
```
ModuleInterface     → Interface estándar para todos los módulos
ModuleLoader        → Carga dinámica con lazy loading
ComponentRegistry   → Registro de componentes enchufables
HookRegistry        → Registro de hooks reutilizables
```

### **LAYER 3: BUSINESS MODULES** (Implementación progresiva)
```
Core Modules ✅     → Customers, Dashboard, Settings
Operations Modules  → Sales ✅, Hub ✅, Events ❌, Services ❌, Subscriptions ❌
Supply Chain ✅     → Materials ✅, Products ✅, Suppliers ❌
Resources ✅        → Staff ✅, Scheduling ✅, Assets ❌
Finance ✅          → Fiscal ✅, Accounting ❌, Payroll ✅
```

---

## 🔧 FUNDACIÓN 1: CAPABILITY GATE SYSTEM

### **🎯 PROPÓSITO**
Sistema que permite renderizado condicional de componentes basado en las capacidades de negocio activas del usuario.

### **📁 ESTRUCTURA DE ARCHIVOS**
```
src/lib/capabilities/
├── CapabilityGate.tsx                 // Componente principal
├── CapabilityProvider.tsx             // Context provider
├── CapabilityRegistry.ts              // Registro central
├── hooks/
│   ├── useCapabilities.ts            // Hook principal
│   ├── useBusinessModel.ts           // Hook para modelo de negocio
│   └── useModuleAccess.ts            // Hook para acceso a módulos
├── types/
│   ├── BusinessCapabilities.ts       // Tipos de capacidades
│   ├── BusinessModels.ts             // Tipos de modelos de negocio
│   └── ModuleCapabilities.ts         // Mapeo módulo → capacidades
├── utils/
│   ├── capabilityUtils.ts           // Utilidades
│   └── businessModelMapping.ts      // Mapeo modelo → capacidades
└── __tests__/
    └── capabilities.test.ts         // Tests unitarios
```

### **🔧 IMPLEMENTACIÓN TÉCNICA**

#### **CapabilityGate.tsx**
```typescript
import React from 'react';
import { useCapabilities } from './hooks/useCapabilities';
import type { BusinessCapability } from './types/BusinessCapabilities';

interface CapabilityGateProps {
  capabilities: BusinessCapability | BusinessCapability[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
  mode?: 'any' | 'all'; // any = OR logic, all = AND logic
}

export const CapabilityGate: React.FC<CapabilityGateProps> = ({
  capabilities,
  fallback = null,
  children,
  mode = 'any'
}) => {
  const { hasCapability, hasAllCapabilities } = useCapabilities();

  const capabilityArray = Array.isArray(capabilities) ? capabilities : [capabilities];

  const hasAccess = mode === 'all'
    ? hasAllCapabilities(capabilityArray)
    : capabilityArray.some(cap => hasCapability(cap));

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Ejemplos de uso:
// <CapabilityGate capabilities="manages_appointments">
//   <AppointmentBookingModule />
// </CapabilityGate>
//
// <CapabilityGate capabilities={["sells_products", "table_management"]}>
//   <RestaurantPOSModule />
// </CapabilityGate>
```

#### **CapabilityProvider.tsx**
```typescript
import React, { createContext, useContext, useEffect } from 'react';
import { useStore } from '@/lib/store';
import type { BusinessCapability } from './types/BusinessCapabilities';
import type { BusinessModel } from './types/BusinessModels';

interface CapabilityContextValue {
  businessModel: BusinessModel;
  activeCapabilities: BusinessCapability[];
  hasCapability: (capability: BusinessCapability) => boolean;
  hasAllCapabilities: (capabilities: BusinessCapability[]) => boolean;
  addCapability: (capability: BusinessCapability) => void;
  removeCapability: (capability: BusinessCapability) => void;
}

const CapabilityContext = createContext<CapabilityContextValue | null>(null);

export const CapabilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { businessModel, capabilities } = useStore();

  const hasCapability = (capability: BusinessCapability): boolean => {
    return capabilities.includes(capability);
  };

  const hasAllCapabilities = (requiredCapabilities: BusinessCapability[]): boolean => {
    return requiredCapabilities.every(cap => hasCapability(cap));
  };

  const addCapability = (capability: BusinessCapability) => {
    useStore.getState().addCapability(capability);
  };

  const removeCapability = (capability: BusinessCapability) => {
    useStore.getState().removeCapability(capability);
  };

  const value: CapabilityContextValue = {
    businessModel,
    activeCapabilities: capabilities,
    hasCapability,
    hasAllCapabilities,
    addCapability,
    removeCapability
  };

  return (
    <CapabilityContext.Provider value={value}>
      {children}
    </CapabilityContext.Provider>
  );
};

export const useCapabilityContext = () => {
  const context = useContext(CapabilityContext);
  if (!context) {
    throw new Error('useCapabilityContext must be used within CapabilityProvider');
  }
  return context;
};
```

#### **BusinessCapabilities.ts**
```typescript
// Todas las capacidades de negocio disponibles
export type BusinessCapability =
  // Core capabilities
  | 'customer_management'
  | 'dashboard_analytics'
  | 'system_settings'

  // Sales capabilities
  | 'sells_products_for_onsite_consumption'
  | 'sells_products_online'
  | 'table_management'
  | 'pos_system'
  | 'payment_gateway'
  | 'qr_ordering'

  // Operations capabilities
  | 'manages_appointments'
  | 'manages_classes'
  | 'manages_events'
  | 'manages_delivery'
  | 'manages_pickup'
  | 'manages_catering'

  // Supply chain capabilities
  | 'inventory_tracking'
  | 'product_management'
  | 'supplier_management'
  | 'purchase_orders'

  // Resources capabilities
  | 'staff_management'
  | 'staff_scheduling'
  | 'asset_management'
  | 'manages_rentals'
  | 'manages_memberships'

  // Finance capabilities
  | 'fiscal_compliance'
  | 'invoice_management'
  | 'recurring_billing'
  | 'payroll_basic'
  | 'payroll_advanced'
  | 'financial_reporting';

// Mapeo de modelos de negocio a capacidades
export const businessModelCapabilities: Record<string, BusinessCapability[]> = {
  restaurant: [
    'customer_management',
    'sells_products_for_onsite_consumption',
    'table_management',
    'pos_system',
    'payment_gateway',
    'qr_ordering',
    'inventory_tracking',
    'staff_management',
    'staff_scheduling',
    'fiscal_compliance'
  ],
  retail: [
    'customer_management',
    'sells_products_for_onsite_consumption',
    'sells_products_online',
    'pos_system',
    'payment_gateway',
    'inventory_tracking',
    'supplier_management',
    'fiscal_compliance'
  ],
  services: [
    'customer_management',
    'manages_appointments',
    'staff_management',
    'staff_scheduling',
    'invoice_management',
    'fiscal_compliance'
  ],
  // ... más modelos
};
```

---

## 🔧 FUNDACIÓN 2: SLOT SYSTEM

### **🎯 PROPÓSITO**
Sistema de inyección dinámica que permite a los módulos extender la funcionalidad de otros módulos sin acoplamiento directo.

### **📁 ESTRUCTURA DE ARCHIVOS**
```
src/lib/composition/
├── SlotProvider.tsx               // Proveedor principal
├── Slot.tsx                      // Componente slot
├── PluggableComponent.tsx        // Base para componentes enchufables
├── CompositionOrchestrator.ts    // Orquestador central
├── hooks/
│   ├── useSlot.ts               // Hook para usar slots
│   ├── usePluggableComponent.ts  // Hook para componentes enchufables
│   └── useComposition.ts        // Hook de composición
├── registry/
│   ├── SlotRegistry.ts          // Registro de slots
│   ├── ComponentRegistry.ts     // Registro de componentes
│   └── RegistryUtils.ts         // Utilidades de registro
├── types/
│   ├── SlotTypes.ts            // Tipos de slots
│   ├── ComponentTypes.ts       // Tipos de componentes
│   └── CompositionTypes.ts     // Tipos de composición
└── __tests__/
    └── composition.test.ts     // Tests unitarios
```

### **🔧 IMPLEMENTACIÓN TÉCNICA**

#### **Slot.tsx**
```typescript
import React from 'react';
import { useSlot } from './hooks/useSlot';
import { CapabilityGate } from '../capabilities/CapabilityGate';
import type { BusinessCapability } from '../capabilities/types/BusinessCapabilities';

interface SlotProps {
  name: string;
  fallback?: React.ReactNode;
  capabilities?: BusinessCapability | BusinessCapability[];
  context?: Record<string, any>;
  maxComponents?: number;
}

export const Slot: React.FC<SlotProps> = ({
  name,
  fallback = null,
  capabilities,
  context = {},
  maxComponents
}) => {
  const { getSlotComponents } = useSlot();

  const components = getSlotComponents(name, maxComponents);

  if (components.length === 0) {
    return <>{fallback}</>;
  }

  const slotContent = (
    <>
      {components.map((ComponentConfig, index) => (
        <ComponentConfig.component
          key={`${name}-${ComponentConfig.id}-${index}`}
          slotContext={context}
          {...ComponentConfig.props}
        />
      ))}
    </>
  );

  // Si hay capabilities requeridas, wrap en CapabilityGate
  if (capabilities) {
    return (
      <CapabilityGate capabilities={capabilities} fallback={fallback}>
        {slotContent}
      </CapabilityGate>
    );
  }

  return slotContent;
};

// Ejemplos de uso:
// <Slot name="sales-actions" capabilities="pos_system" />
// <Slot name="dashboard-widgets" maxComponents={6} />
// <Slot name="customer-details-tabs" context={{ customerId: id }} />
```

#### **SlotRegistry.ts**
```typescript
import type { BusinessCapability } from '../capabilities/types/BusinessCapabilities';

interface ComponentConfig {
  id: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  priority?: number;
  capabilities?: BusinessCapability[];
  module: string;
}

interface SlotConfig {
  name: string;
  description: string;
  maxComponents?: number;
  defaultCapabilities?: BusinessCapability[];
}

class SlotRegistryClass {
  private slots = new Map<string, SlotConfig>();
  private slotComponents = new Map<string, ComponentConfig[]>();

  // Registrar un nuevo slot
  registerSlot(config: SlotConfig): void {
    this.slots.set(config.name, config);
    if (!this.slotComponents.has(config.name)) {
      this.slotComponents.set(config.name, []);
    }
  }

  // Registrar componente en un slot
  registerComponent(slotName: string, component: ComponentConfig): void {
    if (!this.slots.has(slotName)) {
      throw new Error(`Slot '${slotName}' is not registered`);
    }

    const components = this.slotComponents.get(slotName) || [];
    components.push(component);

    // Sort by priority (higher priority first)
    components.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    this.slotComponents.set(slotName, components);
  }

  // Obtener componentes de un slot
  getSlotComponents(slotName: string, maxComponents?: number): ComponentConfig[] {
    const components = this.slotComponents.get(slotName) || [];
    const slotConfig = this.slots.get(slotName);

    const limit = maxComponents || slotConfig?.maxComponents || components.length;

    return components.slice(0, limit);
  }

  // Desregistrar componente
  unregisterComponent(slotName: string, componentId: string): void {
    const components = this.slotComponents.get(slotName) || [];
    const filtered = components.filter(comp => comp.id !== componentId);
    this.slotComponents.set(slotName, filtered);
  }

  // Listar todos los slots
  listSlots(): SlotConfig[] {
    return Array.from(this.slots.values());
  }

  // Verificar si slot existe
  hasSlot(slotName: string): boolean {
    return this.slots.has(slotName);
  }
}

export const SlotRegistry = new SlotRegistryClass();

// Pre-registrar slots comunes
SlotRegistry.registerSlot({
  name: 'sales-actions',
  description: 'Acciones adicionales en el módulo de ventas',
  maxComponents: 5,
  defaultCapabilities: ['pos_system']
});

SlotRegistry.registerSlot({
  name: 'dashboard-widgets',
  description: 'Widgets adicionales en el dashboard',
  maxComponents: 8
});

SlotRegistry.registerSlot({
  name: 'customer-details-tabs',
  description: 'Tabs adicionales en detalles de cliente',
  maxComponents: 4,
  defaultCapabilities: ['customer_management']
});

SlotRegistry.registerSlot({
  name: 'scheduling-actions',
  description: 'Acciones adicionales en scheduling',
  maxComponents: 3,
  defaultCapabilities: ['staff_scheduling']
});
```

---

## 🔧 FUNDACIÓN 3: MODULE INTERFACE SYSTEM

### **🎯 PROPÓSITO**
Estandarización de la interface que deben implementar todos los módulos para garantizar consistencia y interoperabilidad.

### **📁 ESTRUCTURA DE ARCHIVOS**
```
src/lib/modules/
├── ModuleInterface.ts            // Interface base para módulos
├── ModuleLoader.ts              // Cargador dinámico
├── ModuleRegistry.ts            // Registro central de módulos
├── DependencyResolver.ts        // Resolvedor de dependencias
├── hooks/
│   ├── useModule.ts            // Hook para cargar módulos
│   ├── useModuleDependencies.ts // Hook para dependencias
│   └── useModuleRegistry.ts    // Hook para registry
├── types/
│   ├── ModuleTypes.ts          // Tipos de módulos
│   ├── DependencyTypes.ts      // Tipos de dependencias
│   └── RegistryTypes.ts        // Tipos de registry
├── utils/
│   ├── moduleUtils.ts          // Utilidades de módulos
│   └── dependencyUtils.ts      // Utilidades de dependencias
└── __tests__/
    └── modules.test.ts         // Tests unitarios
```

### **🔧 IMPLEMENTACIÓN TÉCNICA**

#### **ModuleInterface.ts**
```typescript
import type { BusinessCapability } from '../capabilities/types/BusinessCapabilities';
import type { ComponentConfig } from '../composition/registry/ComponentRegistry';

interface ModuleMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  domain: 'core' | 'operations' | 'supply-chain' | 'resources' | 'finance';
  category: string;
}

interface ModuleCapabilities {
  provides: BusinessCapability[];
  requires: BusinessCapability[];
  optional?: BusinessCapability[];
}

interface ModuleDependencies {
  modules: string[];
  services?: string[];
  hooks?: string[];
  apis?: string[];
}

interface ModuleExports {
  components?: Record<string, React.ComponentType<any>>;
  hooks?: Record<string, (...args: any[]) => any>;
  services?: Record<string, any>;
  apis?: Record<string, any>;
  types?: Record<string, any>;
  utils?: Record<string, any>;
}

interface ModuleSlots {
  provides?: ComponentConfig[];
  consumes?: string[];
}

interface ModuleRoutes {
  main?: string;
  sub?: Array<{
    path: string;
    component: React.ComponentType<any>;
    name: string;
  }>;
}

interface ModuleConfig {
  defaultSettings?: Record<string, any>;
  permissions?: string[];
  features?: Record<string, boolean>;
}

export interface ModuleInterface {
  // Metadata requerido
  metadata: ModuleMetadata;

  // Capacidades de negocio
  capabilities: ModuleCapabilities;

  // Dependencias técnicas
  dependencies: ModuleDependencies;

  // Exports del módulo
  exports: ModuleExports;

  // Sistema de slots
  slots?: ModuleSlots;

  // Rutas del módulo
  routes?: ModuleRoutes;

  // Configuración
  config?: ModuleConfig;

  // Lifecycle methods
  onLoad?: () => Promise<void>;
  onUnload?: () => Promise<void>;
  onActivate?: () => Promise<void>;
  onDeactivate?: () => Promise<void>;

  // Health check
  healthCheck?: () => Promise<boolean>;
}

// Ejemplo de implementación para Appointment Booking Module:
export const appointmentBookingModule: ModuleInterface = {
  metadata: {
    id: 'appointment-booking',
    name: 'Appointment Booking',
    version: '1.0.0',
    description: 'Sistema de gestión de citas profesionales',
    domain: 'operations',
    category: 'scheduling'
  },

  capabilities: {
    provides: ['manages_appointments'],
    requires: ['customer_management', 'staff_scheduling'],
    optional: ['payment_gateway']
  },

  dependencies: {
    modules: ['scheduling', 'staff', 'customers'],
    services: ['notificationService', 'calendarService'],
    hooks: ['useScheduling', 'useStaff', 'useCustomers']
  },

  exports: {
    components: {
      AppointmentBooking: () => import('./components/AppointmentBooking'),
      AppointmentForm: () => import('./components/AppointmentForm'),
      AppointmentCalendar: () => import('./components/AppointmentCalendar')
    },
    hooks: {
      useAppointments: () => import('./hooks/useAppointments'),
      useAppointmentBooking: () => import('./hooks/useAppointmentBooking')
    },
    services: {
      appointmentService: () => import('./services/appointmentService'),
      bookingEngine: () => import('./services/bookingEngine')
    }
  },

  slots: {
    provides: [
      {
        id: 'appointment-quick-book',
        component: () => import('./components/QuickBookButton'),
        priority: 10,
        module: 'appointment-booking'
      }
    ],
    consumes: ['scheduling-actions', 'customer-details-tabs']
  },

  routes: {
    main: '/admin/operations/appointments',
    sub: [
      {
        path: '/admin/operations/appointments/calendar',
        component: () => import('./pages/AppointmentCalendar'),
        name: 'Calendar'
      },
      {
        path: '/admin/operations/appointments/manage',
        component: () => import('./pages/AppointmentManagement'),
        name: 'Management'
      }
    ]
  }
};
```

#### **ModuleRegistry.ts**
```typescript
import type { ModuleInterface } from './ModuleInterface';
import type { BusinessCapability } from '../capabilities/types/BusinessCapabilities';

interface ModuleRegistryEntry {
  module: ModuleInterface;
  status: 'registered' | 'loading' | 'loaded' | 'active' | 'error';
  loadedAt?: Date;
  activatedAt?: Date;
  error?: Error;
}

class ModuleRegistryClass {
  private modules = new Map<string, ModuleRegistryEntry>();
  private capabilityMap = new Map<BusinessCapability, string[]>();
  private dependencyGraph = new Map<string, string[]>();

  // Registrar un módulo
  async registerModule(module: ModuleInterface): Promise<void> {
    const entry: ModuleRegistryEntry = {
      module,
      status: 'registered'
    };

    this.modules.set(module.metadata.id, entry);

    // Actualizar mapa de capacidades
    this.updateCapabilityMap(module);

    // Actualizar grafo de dependencias
    this.updateDependencyGraph(module);

    console.log(`Module registered: ${module.metadata.name} v${module.metadata.version}`);
  }

  // Cargar un módulo
  async loadModule(moduleId: string): Promise<void> {
    const entry = this.modules.get(moduleId);
    if (!entry) {
      throw new Error(`Module '${moduleId}' is not registered`);
    }

    if (entry.status === 'loaded' || entry.status === 'active') {
      return; // Ya está cargado
    }

    try {
      entry.status = 'loading';

      // Verificar dependencias
      await this.resolveDependencies(entry.module);

      // Ejecutar onLoad si existe
      if (entry.module.onLoad) {
        await entry.module.onLoad();
      }

      entry.status = 'loaded';
      entry.loadedAt = new Date();

      console.log(`Module loaded: ${entry.module.metadata.name}`);
    } catch (error) {
      entry.status = 'error';
      entry.error = error as Error;
      throw error;
    }
  }

  // Activar un módulo
  async activateModule(moduleId: string): Promise<void> {
    const entry = this.modules.get(moduleId);
    if (!entry) {
      throw new Error(`Module '${moduleId}' is not registered`);
    }

    // Cargar si no está cargado
    if (entry.status !== 'loaded' && entry.status !== 'active') {
      await this.loadModule(moduleId);
    }

    if (entry.status === 'active') {
      return; // Ya está activo
    }

    try {
      // Ejecutar onActivate si existe
      if (entry.module.onActivate) {
        await entry.module.onActivate();
      }

      entry.status = 'active';
      entry.activatedAt = new Date();

      console.log(`Module activated: ${entry.module.metadata.name}`);
    } catch (error) {
      entry.status = 'error';
      entry.error = error as Error;
      throw error;
    }
  }

  // Obtener módulos por capability
  getModulesByCapability(capability: BusinessCapability): ModuleInterface[] {
    const moduleIds = this.capabilityMap.get(capability) || [];
    return moduleIds.map(id => this.modules.get(id)?.module).filter(Boolean) as ModuleInterface[];
  }

  // Verificar dependencias
  private async resolveDependencies(module: ModuleInterface): Promise<void> {
    for (const depId of module.dependencies.modules) {
      const depEntry = this.modules.get(depId);
      if (!depEntry) {
        throw new Error(`Dependency '${depId}' is not registered for module '${module.metadata.id}'`);
      }

      // Cargar dependencia si no está cargada
      if (depEntry.status === 'registered') {
        await this.loadModule(depId);
      }
    }
  }

  // Actualizar mapa de capacidades
  private updateCapabilityMap(module: ModuleInterface): void {
    for (const capability of module.capabilities.provides) {
      const modules = this.capabilityMap.get(capability) || [];
      modules.push(module.metadata.id);
      this.capabilityMap.set(capability, modules);
    }
  }

  // Actualizar grafo de dependencias
  private updateDependencyGraph(module: ModuleInterface): void {
    this.dependencyGraph.set(module.metadata.id, module.dependencies.modules);
  }

  // Obtener estado de un módulo
  getModuleStatus(moduleId: string): ModuleRegistryEntry['status'] | null {
    return this.modules.get(moduleId)?.status || null;
  }

  // Listar todos los módulos
  listModules(): ModuleInterface[] {
    return Array.from(this.modules.values()).map(entry => entry.module);
  }

  // Health check de módulos activos
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [id, entry] of this.modules) {
      if (entry.status === 'active' && entry.module.healthCheck) {
        try {
          results[id] = await entry.module.healthCheck();
        } catch (error) {
          results[id] = false;
        }
      } else {
        results[id] = entry.status === 'active';
      }
    }

    return results;
  }
}

export const ModuleRegistry = new ModuleRegistryClass();
```

---

## 🚀 IMPLEMENTACIÓN Y CRONOGRAMA

### **FASE 0A: CapabilityGate System (Semana 1)**
```
Día 1-2: Implementar tipos y interfaces básicas
Día 3-4: Desarrollar CapabilityGate y CapabilityProvider
Día 5-7: Testing e integración con Zustand store existente
```

### **FASE 0B: Slot System (Semana 2)**
```
Día 1-2: Implementar SlotRegistry y ComponentRegistry
Día 3-4: Desarrollar Slot component y hooks
Día 5-7: Testing e integración con módulos existentes
```

### **FASE 0C: Module Interface System (Semana 3)**
```
Día 1-2: Definir interfaces y tipos de módulos
Día 3-4: Implementar ModuleRegistry y ModuleLoader
Día 5-7: Testing y documentación
```

### **FASE 0D: Integration & Validation (Semana 4)**
```
Día 1-3: Integración completa de los 3 sistemas
Día 4-5: Testing end-to-end
Día 6-7: Documentación y preparación para Fase 1
```

---

## 🧪 ESTRATEGIA DE TESTING

### **UNIT TESTS**
```typescript
// Ejemplo de test para CapabilityGate
describe('CapabilityGate', () => {
  it('should render children when capability is available', () => {
    // Test implementation
  });

  it('should render fallback when capability is not available', () => {
    // Test implementation
  });

  it('should handle multiple capabilities with AND logic', () => {
    // Test implementation
  });
});
```

### **INTEGRATION TESTS**
```typescript
// Ejemplo de test de integración
describe('Module System Integration', () => {
  it('should load module with dependencies', async () => {
    // Test module loading with dependency resolution
  });

  it('should register components in slots', () => {
    // Test slot system integration
  });
});
```

---

## 📊 MÉTRICAS DE ÉXITO

### **CRITERIOS DE COMPLETITUD**
- [ ] CapabilityGate renderiza componentes basado en business model
- [ ] Slot system permite inyección dinámica de componentes
- [ ] ModuleRegistry carga módulos con dependency resolution
- [ ] Integration tests pasan al 100%
- [ ] Performance impact < 5ms en render time
- [ ] Bundle size increase < 50KB

### **VALIDATION CHECKLIST**
- [ ] Todos los módulos existentes migrados al nuevo sistema
- [ ] Documentación técnica completa
- [ ] Ejemplos de uso documentados
- [ ] Tests unitarios con 95%+ coverage
- [ ] Performance benchmarks establecidos

---

## 🎯 NEXT STEPS

### **IMMEDIATE** (Esta semana)
1. **Aprobar esta especificación técnica**
2. **Asignar desarrollador principal**
3. **Configurar entorno de desarrollo**

### **WEEK 1** (Próxima semana)
1. **Comenzar implementación CapabilityGate**
2. **Crear estructura de archivos**
3. **Implementar tipos básicos**

### **MONTH 1** (Próximas 4 semanas)
1. **Completar Fase 0 completa**
2. **Migrar 1-2 módulos existentes como validation**
3. **Comenzar Fase 1 con primer módulo nuevo**

---

*Especificación técnica lista para implementación*
*Última actualización: 15 Septiembre 2025*