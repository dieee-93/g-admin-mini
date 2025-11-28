# G-Admin Mini

> **Sistema ERP modular extensible para gestión empresarial con arquitectura plugin-based**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1.9-646CFF)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.76.0-3FCF8E)](https://supabase.com/)
[![Chakra UI](https://img.shields.io/badge/Chakra_UI-3.23.0-319795)](https://www.chakra-ui.com/)

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Sistemas Core](#-sistemas-core)
- [Módulos](#-módulos)
- [Testing](#-testing)
- [Contribución](#-contribución)
- [Roadmap](#-roadmap)

---

## 🎯 Descripción General

**G-Admin Mini** es un sistema ERP modular y extensible diseñado para gestionar operaciones empresariales en comercios, manufacturacion, servicios, y empresas multi-modelo. Inspirado en arquitecturas de **WordPress**, **VS Code**, y **Odoo**, el sistema permite activar solo las funcionalidades necesarias mediante un **Capability System** basado en features.

### 🌟 Características Principales

- **📦 31 Módulos Independientes**: Activables según el modelo de negocio
- **🔌 Sistema de Hooks**: Inyección de UI entre módulos (cross-module extensibility)
- **📊 EventBus v2**: Comunicación desacoplada entre módulos
- **🎯 Feature System v4.0**: 86 features organizadas en 3 capas (User Choices, System Features, Requirements)
- **🔒 RBAC Granular**: 5 roles con permisos por módulo y acción
- **💰 Precisión Decimal**: DecimalUtils para cálculos financieros sin errores de float
- **🌐 Multi-Location**: Soporte para múltiples ubicaciones e inventarios distribuidos
- **📈 Analytics en Tiempo Real**: Dashboards interactivos con métricas clave
- **♿ Accesibilidad**: WCAG 2.1 compliance, keyboard navigation, screen reader support

### 💼 Casos de Uso

| Modelo de Negocio | Módulos Activados | Features |
|-------------------|-------------------|----------|
| **Retail Simple** | Sales, Materials, Customers | POS, Inventory, Customer CRM |
| **Manufacturación** | Production, Materials, Products, Suppliers | Recipe management, MRP, BOM costing |
| **Servicios con Membresías** | Memberships, Billing, Customers, Scheduling | Recurring billing, Resource allocation |
| **E-commerce + Delivery** | Sales, Delivery, Fulfillment, Customers | Online orders, Route optimization, Tracking |
| **Multi-Model Completo** | Todos los módulos | Todas las 86 features |

---

## 🏗️ Arquitectura

### Arquitectura de 3 Capas

```
┌─────────────────────────────────────────────────────────┐
│                   USER INTERFACE                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Sales     │  │  Materials  │  │  Production │ ... │
│  │   Module    │  │   Module    │  │    Module   │     │
│  └─────┬───────┘  └─────┬───────┘  └─────┬───────┘     │
│        │                 │                 │             │
└────────┼─────────────────┼─────────────────┼─────────────┘
         │                 │                 │
┌────────┼─────────────────┼─────────────────┼─────────────┐
│        │    MODULE REGISTRY & HOOK SYSTEM  │             │
│        ▼                 ▼                 ▼             │
│  ┌──────────────────────────────────────────────┐       │
│  │         ModuleRegistry (Singleton)           │       │
│  │  • register() - Lifecycle management         │       │
│  │  • addAction() - Hook registration           │       │
│  │  • doAction() - Hook execution               │       │
│  │  • getExports() - Module API sharing         │       │
│  └──────────────────────────────────────────────┘       │
│                        │                                 │
│  ┌────────────────────▼────────────────────┐            │
│  │  <HookPoint name="products.row.actions" />           │
│  │  • Permission filtering                 │            │
│  │  • Priority-based execution             │            │
│  │  • Dependency injection                 │            │
│  └──────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
         │                 │                 │
┌────────┼─────────────────┼─────────────────┼─────────────┐
│        │      FEATURE ACTIVATION ENGINE    │             │
│        ▼                 ▼                 ▼             │
│  ┌──────────────────────────────────────────────┐       │
│  │     Capability System v4.0                   │       │
│  │  • BusinessModelRegistry (User Choices)      │       │
│  │  • FeatureRegistry (System Features)         │       │
│  │  • RequirementsRegistry (Dependencies)       │       │
│  │  • FeatureActivationEngine (Orchestration)   │       │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
         │                 │                 │
┌────────┼─────────────────┼─────────────────┼─────────────┐
│        │         INFRASTRUCTURE             │            │
│        ▼                 ▼                 ▼             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ EventBus │  │ Supabase │  │  Zustand │  │ Logger │  │
│  │    v2    │  │    DB    │  │  Store   │  │  MCP   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Patrones Arquitecturales

#### 1. **Module Registry Pattern** (WordPress-inspired)

Registro centralizado de módulos conmanifest declarations:

```typescript
// src/modules/sales/manifest.tsx
import { ModuleRegistry } from '@/lib/modules';

export const salesManifest = {
  id: 'sales',
  name: 'Sales Management',
  version: '1.0.0',
  depends: ['customers', 'materials'], // Dependencies
  requiredFeatures: ['sales_management'], // Features gate
  minimumRole: 'OPERADOR',
  
  setup: async (registry: ModuleRegistry) => {
    // Hook: Inject "Create Sale" button into Materials module
    registry.addAction('materials.row.actions', 
      (material) => ({
        id: 'create-sale',
        label: 'Create Sale',
        icon: ShoppingCartIcon,
        priority: 9,
        onClick: () => navigator('/sales?material=' + material.id)
      }),
      'sales', // module ID
      9 // priority
    );
    
    // Listen to events
    registry.getEventBus().on('materials.stock_updated', handleStockUpdate);
  },
  
  exports: {
    // Public API for other modules
    createQuote: (data) => quotesService.create(data),
    validateCredit: (customerId) => creditService.check(customerId)
  }
};
```

#### 2. **Hook Point Pattern** (VS Code Extensions)

Extensible UI via declarative hook points:

```tsx
// In Products page
import { HookPoint } from '@/lib/modules';

<DataGrid>
  {products.map(product => (
    <Row key={product.id}>
      <Cell>{product.name}</Cell>
      <Cell>{product.price}</Cell>
      
      {/* Other modules can inject actions here */}
      <HookPoint 
        name="products.row.actions"
        data={product}
        fallback={null}
      />
    </Row>
  ))}
</DataGrid>

// Rentals module injects "Rent Product" button
registry.addAction('products.row.actions', 
  (product) => (
    <Button onClick={() => openRentalModal(product)}>
      Rent Product
    </Button>
  )
);
```

#### 3. **EventBus Pattern** (Pub/Sub)

Comunicación desacoplada entre módulos:

```typescript
// Materials emits event
eventBus.emit('materials.stock_updated', {
  materialId: 'mat-123',
  newStock: 45,
  previousStock: 50,
  location: 'warehouse-a'
});

// Sales listens and updates UI
eventBus.on('materials.stock_updated', (event) => {
  if (event.newStock < 10) {
    showAlert('Low stock warning for ' + event.materialId);
  }
});

// Production listens and recalculates availability
eventBus.on('materials.stock_updated', (event) => {
  recalculateRecipeAvailability(event.materialId);
});
```

#### 4. **Feature System** (3-Layer Architecture)

```typescript
// Layer 1: User Choices (BusinessModelRegistry)
const businessModel = {
  id: 'retail_with_production',
  activities: ['sales', 'manufacturing'],
  infrastructure: ['single_location', 'local_delivery']
};

// Layer 2: System Features (FeatureRegistry)
const requiredFeatures = FeatureActivationEngine.resolve(businessModel);
// Returns: ['sales_management', 'inventory', 'production_orders', ...]

// Layer 3: Module Visibility
const activeModules = getActiveModules(requiredFeatures);
// Returns: ['sales', 'materials', 'products', 'production']
```

---

## 🛠️ Tecnologías

### Frontend Core
- **React 19.1.0** - UI library con Server Components support
- **TypeScript 5.8.3** - Type safety estricto
- **Vite 7.1.9** - Build tool ultra-rápido
- **React Router 7.7.1** - Client-side routing

### UI & Styling
- **Chakra UI 3.23.0** - Component library con design tokens
- **@emotion/react 11.14.0** - CSS-in-JS engine
- **Framer Motion 12.23.11** - Animaciones fluidas
- **Heroicons** - Iconografía consistente

### State Management
- **Zustand 5.0.7** - Lightweight state manager
- **React Hook Form 7.62.0** - Form state management
- **Zod 4.1.5** - Schema validation

### Backend & Database
- **Supabase 2.76.0** - PostgreSQL + Auth + Realtime
  - Row Level Security (RLS)
  - Realtime subscriptions
  - Edge Functions
  - Storage

### Business Logic
- **Decimal.js 10.6.0** - Precisión matemática financiera
- **date-fns 4.1.0** - Date manipulation
- **Immer 10.1.1** - Immutable state updates

### Charts & Visualization
- **Chart.js 4.5.0** - Chart rendering
- **react-chartjs-2 5.3.0** - React wrapper
- **Recharts 3.2.1** - Alternative charting

### Maps & Geolocation
- **Leaflet 1.9.4** - Interactive maps
- **react-leaflet 5.0.0react-leaflet-draw 0.21.0** - Drawing tools

### Testing
- **Vitest 3.2.4** - Unit testing (Vite-native)
- **@testing-library/react 16.3.0** - Component testing
- **Playwright 1.56.1** - E2E testing
- **@vitest/coverage-v8** - Code coverage

### Development Tools
- **ESLint + TypeScript ESLint** - Linting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit checks
- **react-scan** - Performance profiling
- **why-did-you-render** - Re-render debugging

---

## 🚀 Instalación

### Prerequisitos

- **Node.js** ≥ 20.11.0
- **pnpm** ≥ 8.0.0 (recomendado) o npm
- **Supabase account** (para la base dedatos)

### Setup Rápido

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/g-mini.git
cd g-mini

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 4. Ejecutar en desarrollo
pnpm dev

# 5. Abrir en el navegador
# http://localhost:5173
```

### Variables de Entorno

```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # Solo backend

# Opcional: Feature flags
VITE_ENABLE_DEBUG_TOOLS=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

### Database Setup

```bash
# 1. Ejecutar migraciones de Supabase
npx supabase db push

# 2. Seed initial data (opcional)
pnpm run db:seed

# 3. Configurar RLS policies
# Ver: database/policies/
```

### Scripts Disponibles

```bash
# Desarrollo
pnpm dev                    # Dev server con HMR
pnpm build                  # Build para producción
pnpm preview                # Preview del build

# Testing
pnpm test                   # Unit tests (Vitest)
pnpm test:run               # Run tests una vez
pnpm test:coverage          # Tests con coverage
pnpm e2e                    # E2E tests (Playwright)
pnpm e2e:ui                 # Playwright UI mode
pnpm e2e:debug              # Playwright debug mode

# Linting
pnpm lint                   # ESLint check
pnpm lint:fix               # ESLint auto-fix
pnpm lint:precision         # Precision decimal rules

# Validación de Precisión
pnpm run validate:precision # Lint + Tests de precisión
pnpm run test:precision     # Solo tests de decimal

# Type checking
pnpm run build              # TypeScript compilation check
```

---

## 📁 Estructura del Proyecto

```
g-mini/
├── src/
│   ├── modules/                # 📦 31 Módulos del sistema
│   │   ├── sales/              # Ventas (POS + B2B)
│   │   ├── materials/          # Inventario de materiales
│   │   ├── products/           # Gestión de productos
│   │   ├── production/         # Órdenes de producción
│   │   ├── customers/          # CRM
│   │   ├── memberships/        # Suscripciones
│   │   ├── staff/              # RRHH
│   │   ├── scheduling/         # Programación de recursos
│   │   ├── delivery/           # Logística
│   │   ├── finance-billing/    # Facturación
│   │   ├── suppliers/          # Gestión de proveedores
│   │   └── ... (21 módulos más)
│   │
│   ├── lib/                    # 🔧 Infraestructura
│   │   ├── modules/            # Module Registry + HookPoint
│   │   │   ├── ModuleRegistry.ts
│   │   │   ├── HookPoint.tsx
│   │   │   └── types.ts
│   │   ├── events/             # EventBus v2
│   │   │   ├── EventBus.ts
│   │   │   └── Subscriber.ts
│   │   ├── capabilities/       # Feature System v4.0
│   │   │   └── index.ts        # Bridge to new system
│   │   ├── permissions/        # RBAC system
│   │   ├── logging/            # Logger con MCP support
│   │   ├── offline/            # Offline-first support
│   │   ├── notifications/      # Toast notifications
│   │   └── ml/                 # Machine Learning algorithms
│   │
│   ├── config/                 # ⚙️ Configuración
│   │   ├── BusinessModelRegistry.ts  # User Choices
│   │   ├── FeatureRegistry.ts        # System Features
│   │   ├── RequirementsRegistry.ts   # Dependencies
│   │   └── PermissionsRegistry.ts    # Roles & Permissions
│   │
│   ├── business-logic/         # 💼 Lógica de negocio
│   │   ├── shared/
│   │   │   └── decimalUtils.ts  # Precisión decimal
│   │   ├── sales/
│   │   ├── inventory/
│   │   └── ...
│   │
│   ├── store/                  # 📦 Zustand stores
│   │   ├── capabilityStore.ts
│   │   ├── materialsStore.ts
│   │   └── ...
│   │
│   ├── components/             # 🧩 Componentes compartidos
│   │   ├── auth/               # Authentication
│   │   ├── debug/              # Debug tools
│   │   └── layout/             # Layout components
│   │
│   ├── shared/                 # 🎨 UI Compartido
│   │   ├── ui/                 # Component library
│   │   ├── alerts/             # Alert system
│   │   └── forms/              # Form components
│   │
│   ├── contexts/               # ⚛️ React Contexts
│   │   ├── AuthContext.tsx
│   │   └── NavigationContext.tsx
│   │
│   ├── hooks/                  # 🪝 Custom hooks
│   │   ├── usePermissions.ts
│   │   ├── useOfflineStatus.ts
│   │   └── ...
│   │
│   ├── pages/                  # 📄 Pages/Routes
│   │   ├── admin/
│   │   ├── app/                # Customer portal
│   │   └── public/
│   │
│   ├── services/               # 🔌 API Services
│   │   └── DatabaseSetupService.ts
│   │
│   ├── types/                  # 📘 TypeScript types
│   ├── theme/                  # 🎨 Chakra tokens
│   └── App.tsx                 # Entry point
│
├── database/                   # 💾 Database
│   ├── schema/
│   ├── migrations/
│   └── policies/
│
├── docs/                       # 📚 Documentation
│   ├── architecture/
│   ├── guides/
│   └── api/
│
├── tests/                      # 🧪 Tests
│   ├── e2e/                    # Playwright E2E
│   ├── integration/
│   └── unit/
│
├── public/                     # Static assets
├── .env                        # Environment variables
├── package.json
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts
├── CONTRIBUTING.md             # Contribution guide
├── ROADMAP.md                  # Development roadmap
└── README.md                   # This file
```

---

## 🧩 Sistemas Core

### 1. Module Registry

**Archivo**: `src/lib/modules/ModuleRegistry.ts`

Sistema singleton de gestión de módulos con:
- Lifecycle management (register, unregister, activate, deactivate)
- Hook system (addAction, doAction, hasHook, removeHook)
- VS Code-style exports API
- Dependency validation (circular dependency detection)
- Performance tracking

**Uso**:

```typescript
const registry = ModuleRegistry.getInstance();

// Registrar módulo
registry.register(salesManifest);

// Agregar hook
registry.addAction('dashboard.widgets', 
  () => <SalesWidget />,
  'sales',
  10 // priority
);

// Ejecutar hooks
const widgets = registry.doAction('dashboard.widgets');

// Obtener exports de otro módulo
const materialsAPI = registry.getExports('materials');
const stockLevel = materialsAPI.getStockLevel('mat-123');
```

### 2. Feature System v4.0

**Archivos**: 
- `src/config/BusinessModelRegistry.ts`
- `src/config/FeatureRegistry.ts`
- `src/config/RequirementsRegistry.ts`
- `src/lib/features/FeatureEngine.ts`

Arquitectura de 3 capas:

```typescript
// Layer 1: User chooses business model
const choices = {
  activities: ['sales', 'manufacturing'],
  infrastructure: ['single_location']
};

// Layer 2: System activates features
const engine = new FeatureActivationEngine();
const result = engine.activateFeatures(choices);

// Layer 3: Modules become visible
const modules = result.activeModules;
// ['sales', 'materials', 'products', 'production']
```

**86 Features organizadas en 6 categorías**:
- **Sales** (18): POS, B2B quotes, e-commerce, pricing tiers
- **Operations** (22): Inventory, production, quality control
- **Resources** (15): Staff, scheduling, assets
- **Finance** (12): Billing, fiscal, integrations
- **Customer** (10): CRM, memberships, loyalty
- **Intelligence** (9): Analytics, reporting, forecasting

### 3. EventBus v2

**Archivo**: `src/lib/events/EventBus.ts`

Pub/sub system con:
- Type-safe events
- Priority-based execution
- Wildcards (* pattern)
- Error isolation
- Performance monitoring

**Uso**:

```typescript
import eventBus from '@/lib/events/EventBus';

// Emit event
eventBus.emit('sales.order_placed', {
  orderId: 'ord-123',
  total: 1500.50,
  customerId: 'cust-456'
});

// Subscribe
const unsubscribe = eventBus.on('sales.order_placed', (event) => {
  console.log('New order:', event.orderId);
  updateInventory(event.items);
});

// Wildcard subscriptions
eventBus.on('materials.*', (event) => {
  console.log('Materials event:', event);
});

// Unsubscribe
unsubscribe();
```

### 4. Permissions System (RBAC)

**Archivo**: `src/config/PermissionsRegistry.ts`

Sistema granular de permisos con 5 roles:

| Role | Nivel | Permisos |
|------|-------|----------|
| `CLIENTE` | 1 | Portal del cliente, ver menú, mis órdenes |
| `OPERADOR` | 2 | POS, inventario básico, producción |
| `SUPERVISOR` | 3 | Staff, scheduling, reportes, proveedores |
| `ADMINISTRADOR` | 4 | Configuración, fiscal, integraciones |
| `SUPER_ADMIN` | 5 | Acceso total + debug tools |

**Acciones disponibles**: `read`, `create`, `update`, `delete`, `void`, `approve`, `configure`, `export`

**Uso**:

```typescript
const { canCreate, canDelete } = usePermissions('materials');

if (canCreate) {
  return <Button onClick={createMaterial}>Create</Button>;
}

// En manifest
requiredPermission: {
  module: 'sales',
  action: 'create'
}
```

### 5. DecimalUtils (Precisión Matemática)

**Archivo**: `src/business-logic/shared/decimalUtils.ts`

Sistema de precisión decimal para evitar errores de float en cálculos financieros.

**4 Dominios de Precisión**:

| Dominio | Decimales | Uso |
|---------|-----------|-----|
| `financial` | 2 | Ventas, pricing, B2B quotes |
| `recipe` | 3 | Overheadproducción, materiales de recetas |
| `inventory` | 4 | Stock, conversiones |
| `tax` | 6 | Impuestos (IVA, Ingresos Brutos) |

**API**:

```typescript
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

// ❌ MAL
const total = price * quantity; // 0.1 * 3 = 0.30000000000000004

// ✅ BIEN
const total = DecimalUtils.multiply(
  price.toString(),
  quantity.toString(),
  'financial' // dominio
).toNumber(); // 0.30

// Operaciones disponibles
DecimalUtils.add(a, b, domain);
DecimalUtils.subtract(a, b, domain);
DecimalUtils.multiply(a, b, domain);
DecimalUtils.divide(a, b, domain);
DecimalUtils.applyPercentage(value, percent, domain);
DecimalUtils.calculateProfitMargin(revenue, cost);
```

**Regla de oro**: NUNCA usar +, -, *, / para cálculos financieros.

###6. Offline-First System

**Archivos**:
- `src/lib/offline/OfflineSync.ts` (975 líneas)
- `src/lib/offline/useOfflineStatus.ts`

Sistema robusto de gestión offline:

**Features**:
- Persistent queue (IndexedDB)
- Priority-based processing (orders > payments > inventory)
- Batch processing (lotes de 10)
- Retry logic (3 intentos con exponential backoff)
- Conflict resolution (client_wins, server_wins, merge, manual)
- Anti-flapping (espera 5s para conexión estable)

**Patrón Command Queue**:

```typescript
// Queue operation cuando offline
await offlineSync.queueOperation({
  type: 'CREATE',
  entity: 'materials',
  data: materialData
});

// Auto-sync cuando vuelve online
offlineSync.syncPendingOperations();
```

---

## 📦 Módulos

### Módulos por Dominio

#### 🛒 Operations (7 módulos)
- **sales** - POS + B2B quotes + e-commerce
- **delivery** - Logística y route optimization
- **fulfillment** - Pickup, onsite, delivery
- **memberships** - Suscripciones y recurring billing
- **rentals** - Gestión de rentas

#### 🏭 Supply Chain (5 módulos)
- **materials** - Inventario de materiales consumibles
- **products** - Catálogo de productos
- **production** - Órdenes de producción y MRP
- **assets** - Inventario de activos durables
- **suppliers** - Gestión de proveedores
  - **materials-procurement** (submódulo) - Purchase orders

#### 👥 Resources (2 módulos)
- **staff** - RRHH y workforce management
- **scheduling** - Resource allocation y planning

#### 💰 Finance (3 módulos)
- **finance-billing** - Facturación y cuentas por cobrar
- **finance-corporate** - Finanzas corporativas (B2B)
- **finance-fiscal** - Cumplimiento contable y fiscal
- **finance-integrations** - Payment gateways (MODO, QR Interoperable)

#### 👨‍💼 Customer (2 módulos)
- **customers** - CRM y RFM analysis
- **customer-portal** - Portal de autoservicio

#### 📊 Intelligence (3 módulos)
- **reporting** - Reportes operacionales
- **dashboard** - Métricas ejecutivas
- **gamification** - Systemade logros

#### ⚙️ Core (4 módulos)
- **settings** - Configuración del sistema
- **debug** - Development tools (SUPER_ADMINonly)
- **mobile** - Mobile-first views
- **executive** - Executive dashboard

#### 🔌 Extensions (5 submódulos)
- **products-analytics** - Product insights
- **sales-analytics** - Sales insights
- **materials-procurement** - Supplier orders

**Total**: **31 módulos** (26 principales + 5 submódulos)

### Ejemplo de Manifest Completo

```typescript
// src/modules/materials/manifest.tsx
import type { ModuleManifest } from '@/lib/modules';

export const materialsManifest: ModuleManifest = {
  id: 'materials',
  name: 'Materials Management',
  version: '1.0.0',
  description: 'Inventory management for consumable materials',
  
  // Dependencies
  depends: [],
  requiredFeatures: ['inventory'],
  minimumRole: 'OPERADOR',
  
  // Routes
  routes: [{
    path: '/admin/supply-chain/materials',
    component: lazy(() => import('./page'))
  }],
  
  // Navigation
  navigation: {
    label: 'Materials',
    icon: CubeIcon,
    path: '/admin/supply-chain/materials',
    group: 'supply-chain'
  },
  
  // Hooks provided
  hooks: {
    provide: [
      'materials.row.actions',
      'materials.procurement.actions'
    ],
    consume: [
      'dashboard.widgets'
    ]
  },
  
  // Setup function
  setup: async (registry) => {
    const eventBus = registry.getEventBus();
    
    // Listen to events
    eventBus.on('sales.order_placed', handleSalesOrder);
    eventBus.on('production.item_consumed', handleProductionConsumption);
    
    // Provide dashboard widget
    registry.addAction('dashboard.widgets', 
      () => <InventoryWidget />,
      'materials',
      8
    );
  },
  
  // Public API exports
  exports: {
    getStockLevel: (materialId: string) => 
      materialsStore.getState().getStockLevel(materialId),
    
    validateStockAvailability: (materialId: string, quantity: number) =>
      materialsStore.getState().hasStock(materialId, quantity)
  }
};
```

---

## 🧪 Testing

### Test Suite Completo

```bash
# Unit tests (Vitest)
pnpm test                    # Watch mode
pnpm test:run                # Run once
pnpm test:coverage           # With coverage report

# Precision tests (Financial calculations)
pnpm run test:precision

# E2E tests (Playwright)
pnpm e2e                     # Headless
pnpm e2e:ui                  # UI mode
pnpm e2e:headed              # Headed browser
pnpm e2e:debug               # Debug mode

# Specific test files
pnpm test src/modules/sales
pnpm e2e tests/e2e/sales-flow.spec.ts
```

### Test Coverage Goals

- **Unit tests**: >80% coverage
- **Integration tests**: All critical workflows
- **E2E tests**: Main user journeys

### Test Examples

**Unit Test (Vitest)**:

```typescript
// src/__tests__/precision-migration-phase1.test.ts
import { describe, it, expect } from 'vitest';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

describe('DecimalUtils - Financial Precision', () => {
  it('should calculate order total without float errors', () => {
    const items = [
      { price: 0.1, quantity: 1 },
      { price: 0.2, quantity: 1 },
    ];
    
    const total = items.reduce((sum, item) => {
      const itemTotal = DecimalUtils.multiply(
        item.price.toString(),
        item.quantity.toString(),
        'financial'
      );
      return DecimalUtils.add(sum, itemTotal, 'financial');
    }, DecimalUtils.fromValue(0, 'financial'));
    
    // ✅ DEBE SER EXACTAMENTE 0.3, NO 0.30000000000000004
    expect(total.toNumber()).toBe(0.3);
  });
});
```

**E2E Test (Playwright)**:

```typescript
// tests/e2e/sales-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete sales flow from cart to checkout', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'operator@test.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Navigate to Sales
  await page.goto('/admin/operations/sales');
  
  // Add product to cart
  await page.click('[data-testid="product-card-1"]');
  await page.fill('[data-testid="quantity-input"]', '2');
  await page.click('[data-testid="add-to-cart"]');
  
  // Verify cart total
  const total = await page.textContent('[data-testid="cart-total"]');
  expect(total).toBe('$45.90');
  
  // Checkout
  await page.click('[data-testid="checkout-button"]');
  await page.selectOption('[data-testid="payment-method"]', 'cash');
  await page.click('[data-testid="complete-sale"]');
  
  // Verify success
  await expect(page.locator('[data-testid="success-message"]'))
    .toBeVisible();
});
```

---

## 🤝 Contribución

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para guías detalladas.

### Quick Start

1. Fork el repositorio
2. Crear branch: `git checkout -b feature/my-feature`
3. **Seguir guías de precisión decimal** (ver CONTRIBUTING.md)
4. Commit: `git commit -m "feat: add amazing feature"`
5. Push: `git push origin feature/my-feature`
6. Crear Pull Request

### Checklist para PRs

- [ ] ✅ Tests pasan (`pnpm test`)
- [ ] ✅ Lint sin errores (`pnpm lint`)
- [ ] ✅ Tests de precisión pasan (`pnpm run test:precision`)
- [ ] ✅ TypeScript compila (`pnpm run build`)
- [ ] ✅ DecimalUtils usado para cálculos financieros
- [ ] ✅ Documentación actualizada
- [ ] ✅ Código sigue guías de estilo

### Regla de Oro 🌟

**NUNCA uses operadores nativos de JavaScript (+, -, *, /) para cálculos financieros.**

Usa `DecimalUtils` en su lugar. Ver [CONTRIBUTING.md](./CONTRIBUTING.md#-precisión-matemática) para detalles.

---

## 🗺️ Roadmap

Ver [ROADMAP.md](./ROADMAP.md) para el plan de desarrollo completo.

### Q1 2025 (Actual)

- [x] ✅ Core architecture (Module Registry, EventBus, Feature System)
- [x] ✅ 31 módulos registrados
- [x] ✅ Sales POS completo
- [x] ✅ Materials con smart alerts
- [x] ✅ Customers with RFM analytics
- [ ] ⏳ Sales B2B UI completion
- [ ] ⏳ EventBus integration (todos los módulos)
- [ ] ⏳ Cross-module UI injections

### Q2 2025

- [ ] Integration tests completos
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production deployment

### Backlog

- [ ] Workforce optimization AI
- [ ] Advanced reporting (custom dashboards)
- [ ] Mobile app nativa (iOS/Android)
- [ ] Multi-currency support
- [ ] Multi-language i18n
- [ ] Public API para integraciones

---

## 📄 Licencia

[MIT License](./LICENSE)

---

## 🙏 Agradecimientos

- Inspirado por WordPress plugin system
- Arquitectura de módulos basada en VS Code extensions
- Patrones de Odoo ERP
- UI components de Chakra UI
- Backend powered by Supabase

---

## 📞 Contacto

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/g-mini/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tu-usuario/g-mini/discussions)
- **Email**: support@g-mini.dev (si aplica)

---

## 📚 Documentación Adicional

- [Contributing Guide](./CONTRIBUTING.md) - Guías de contribución y precisión decimal
- [Development Roadmap](./ROADMAP.md) - Plan de desarrollo detallado
- [Architecture Docs](./docs/architecture/) - Arquitectura profunda
- [API Reference](./docs/api/) - Documentación de APIs
- [Module Development Guide](./docs/guides/module-development.md) - Cómo crear módulos

---

**Última actualización**: 2025-01-23  
**Versión**: 3.2 Modular Architecture Edition  
**Estado**: In Development (Phase 3 - Assembly & Integration)

---

<p align="center">
  <strong>Hecho con ❤️ usando TypeScript, React y Supabase</strong>
</p>
