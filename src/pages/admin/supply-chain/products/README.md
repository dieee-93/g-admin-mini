# Módulo de Products - G-Admin Mini

## 📋 Descripción del Módulo

El módulo de **Products** gestiona la creación, análisis y optimización de productos del menú. Incluye funcionalidades avanzadas de ingeniería de menú (Menu Engineering), análisis de costos, y cálculo de rentabilidad basados en datos reales de ventas.

### Características principales:
- ✅ Gestión completa de productos y precios
- ✅ Matrix de Menu Engineering con clasificación automática (Stars, Plowhorses, Puzzles, Dogs)
- ✅ Análisis de costos con precisión decimal (Decimal.js)
- ✅ Cálculo de rentabilidad y márgenes
- ✅ Recomendaciones estratégicas automatizadas

### 🗺️ Feature & Route Map

| Route (Relative) | Feature Area | Components | Description |
|------------------|--------------|------------|-------------|
| **`/`** | **Product Management** | `ProductList`, `ProductFormModal` | Core catalog management. Create, edit, and organize products. |
| **`/`** (Section) | **Menu Engineering** | `MenuEngineeringMatrix` | Strategic analysis of menu item performance (Profitability vs. Popularity). |
| **`/`** (Section) | **Cost Analysis** | `CostAnalysisTab`, `ProductCostService` | Detailed breakdown of recipe costs and margins. |

---

## 🏗️ Estructura Estándar de Módulo

Esta estructura representa nuestro **patrón oficial** para todos los módulos de G-Admin Mini:

```
src/pages/admin/supply-chain/products/
├── README.md                   # 📖 Este archivo (documentación completa)
├── page.tsx                    # 🎯 Página orquestadora (componente principal)
│
├── components/                 # 🧩 Componentes UI específicos del módulo
│   ├── index.ts               # 📦 Barrel exports
│   ├── ProductList/           # 📋 Lista de productos
│   ├── ProductFormModal/      # ➕ Modal para crear/editar productos
│   ├── MenuEngineeringMatrix/ # 📊 Matrix de análisis de menú
│   ├── CostAnalysisTab/       # 💰 Tab de análisis de costos
│   └── [otros componentes]/   # 🔧 Componentes adicionales
│
├── hooks/                     # 🪝 Hooks de negocio y página
│   ├── index.ts              # 📦 Barrel exports
│   ├── useProductsPage.ts    # 🎭 Hook orquestador de la página
│   ├── useMenuEngineering.ts # 📊 Hook de Menu Engineering
│   └── [otros hooks]/        # 🔧 Hooks específicos
│
├── services/                  # ⚙️ Lógica de negocio y servicios
│   ├── index.ts              # 📦 Barrel exports
│   ├── productApi.ts         # 🌐 API calls y gestión de datos
│   ├── productCostService.ts # 💰 Cálculos de costos
│   ├── menuEngineeringCalculations.ts # 📊 Matrix calculations
│   └── [otros servicios]/    # 🔧 Servicios adicionales
│
├── types/                    # 🏷️ Definiciones TypeScript
│   ├── index.ts             # 📦 Barrel exports
│   └── [tipos específicos]/ # 📝 Interfaces y types
│
└── utils/                   # 🛠️ Utilidades específicas del módulo
    ├── index.ts            # 📦 Barrel exports
    └── [utilidades]/       # 🔧 Helper functions
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
// src/pages/admin/supply-chain/products/page.tsx
export function ProductsPage() {
  // 🎭 Toda la lógica delegada al hook orquestador
  const { handleNewProduct, handleMenuEngineering } = useProductsPage();

  return (
    <ContentLayout spacing="normal">
      {/* 📋 Header semántico con acciones */}
      <PageHeader
        title="Products"
        subtitle="Menu items, pricing & analytics"
        actions={
          <>
            <Button variant="outline" colorPalette="blue" onClick={handleMenuEngineering}>
              <CogIcon className="w-4 h-4" />
              Menu Engineering
            </Button>
            <Button colorPalette="purple" onClick={handleNewProduct}>
              <PlusIcon className="w-4 h-4" />
              New Product
            </Button>
          </>
        }
      />

      {/* 🧩 Secciones semánticas para cada funcionalidad */}
      <Section variant="elevated" title="Product Management">
        <ProductList />
      </Section>

      <Section variant="elevated" title="Menu Engineering">
        <MenuEngineeringMatrix />
      </Section>

      <Section variant="elevated" title="Cost Analysis">
        <CostAnalysisTab />
      </Section>

      {/* 📝 Modales y overlays */}
      <ProductFormModal />
    </ContentLayout>
  );
}
```

### Hook Orquestador

```tsx
// src/pages/admin/supply-chain/products/hooks/useProductsPage.ts
export function useProductsPage() {
  const { setQuickActions } = useNavigation();

  // 🚀 Configurar acciones rápidas del header global
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-product',
        label: 'Nuevo Producto',
        icon: PlusIcon,
        action: () => handleNewProduct(),
        color: 'purple'
      },
      {
        id: 'menu-analysis',
        label: 'Análisis de Menú',
        icon: CogIcon,
        action: () => handleMenuAnalysis(),
        color: 'blue'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions]);

  // 🎯 Handlers de acciones específicas
  const handleNewProduct = useCallback(() => {
    // Lógica para abrir modal de nuevo producto
  }, []);

  const handleMenuEngineering = useCallback(() => {
    // Lógica para activar análisis de menú
  }, []);

  return {
    handleNewProduct,
    handleMenuEngineering
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

  // 🧩 Componentes Base
  Button, Modal, Alert, Badge,

  // 📊 Componentes de Negocio
  MetricCard, CardGrid
} from '@/shared/ui'
```

### Reglas de Diseño
1. **❌ NUNCA** importar de `@chakra-ui/react` directamente
2. **✅ SIEMPRE** usar `ContentLayout` como contenedor principal
3. **✅ USAR** `PageHeader` para títulos complejos con acciones
4. **✅ APLICAR** `Section` con variants apropiados
5. **✅ DELEGAR** theming automático (tokens `gray.*`)

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

### Tipos de Hooks

1. **Hook Orquestador** (`useProductsPage.ts`)
   - 🎯 Maneja el estado de la página completa
   - 🚀 Configura acciones rápidas globales
   - 🎭 Coordina interacciones entre componentes

2. **Hooks de Negocio** (`useMenuEngineering.ts`)
   - 📊 Encapsula lógica específica de funcionalidades
   - 🔄 Maneja llamadas a servicios
   - 📡 Gestiona estado local de componentes

### Servicios Modulares

```typescript
// services/productCostService.ts
export class ProductCostService {
  // 💰 Cálculos puros de costos con Decimal.js
  static calculateProductCost(components: Component[]): DecimalResult
}

// services/menuEngineeringCalculations.ts
export const calculateMenuEngineeringMatrix = (
  salesData: ProductSalesData[],
  config: MatrixConfiguration
): MenuEngineeringMatrix => {
  // 📊 Algoritmos de Menu Engineering
}
```

---

## 🔄 Integración con EventBus

### Eventos Emitidos (PROVIDES)

```typescript
// products.product_created - Cuando se crea un nuevo producto
eventBus.emit('products.product_created', {
  productId: string,
  productName: string,
  productType: ProductType,
  timestamp: string,
  userId: string
}, {
  priority: EventPriority.HIGH,
  moduleId: 'products'
});

// products.product_updated - Cuando se actualiza un producto
eventBus.emit('products.product_updated', {
  productId: string,
  productName: string,
  changes: string[],  // Array of changed fields
  timestamp: string,
  userId: string
}, {
  priority: EventPriority.MEDIUM,
  moduleId: 'products'
});

// products.price_changed - Cuando cambia el precio de un producto
eventBus.emit('products.price_changed', {
  productId: string,
  productName: string,
  oldPrice: number,
  newPrice: number,
  timestamp: string,
  userId: string
}, {
  priority: EventPriority.HIGH,  // HIGH porque afecta ventas activas
  moduleId: 'products'
});

// products.product_deleted - Cuando se elimina un producto
eventBus.emit('products.product_deleted', {
  productId: string,
  productName: string,
  timestamp: string,
  userId: string
}, {
  priority: EventPriority.MEDIUM,
  moduleId: 'products'
});
```

### Eventos Suscritos (CONSUMES)

```typescript
// materials.stock_updated - Recalcular disponibilidad de productos con recetas
eventBus.subscribe('materials.stock_updated', (event) => {
  // Recalcular availability para productos que usan este material
  const affectedProducts = getProductsUsingMaterial(event.data.materialId);
  affectedProducts.forEach(product => {
    recalculateProductAvailability(product.id);
  });
}, {
  moduleId: 'products',
  priority: 100
});

// materials.low_stock_alert - Alertar sobre productos afectados
eventBus.subscribe('materials.low_stock_alert', (event) => {
  // Mostrar alerta si productos populares se verán afectados
  const criticalProducts = getPopularProductsUsingMaterial(event.data.materialId);
  if (criticalProducts.length > 0) {
    showLowStockWarning(criticalProducts);
  }
}, {
  moduleId: 'products',
  priority: 80
});

// sales.order_completed - Actualizar métricas de Menu Engineering
eventBus.subscribe('sales.order.*', (event) => {
  // Actualizar estadísticas de ventas para análisis de menú
  updateProductSalesMetrics(event.data.items);
}, {
  moduleId: 'products',
  priority: 50  // LOW priority, no urgente
});
```

### Integración Cross-Module

| Módulo | Relación | Eventos Clave |
|--------|----------|---------------|
| **Materials** | 🔗 Dependencies | `materials.stock_updated`, `materials.low_stock_alert` |
| **Sales** | 📊 Analytics | `sales.order_completed`, `sales.item_sold` |
| **Dashboard** | 📈 Widgets | `dashboard.widgets` (hook point) |

---

## 🔒 Sistema de Permisos

### Configuración del Módulo

```typescript
// src/modules/products/manifest.tsx
export const productsManifest = {
  id: 'products',
  minimumRole: 'OPERADOR',  // 🔒 Employees can VIEW products
  // ...
};
```

### Permisos en Service Layer

```typescript
// src/pages/admin/supply-chain/products/services/productApi.ts
import { requirePermission, type AuthUser } from '@/lib/permissions';

export async function createProduct(
  productData: CreateProductData,
  user: AuthUser  // 🔑 User context required
): Promise<Product> {
  // 🔒 PERMISSION CHECK: Require 'create' permission
  requirePermission(user, 'products', 'create');

  // Proceed with operation...
  const { data, error } = await supabase
    .from("products")
    .insert([productData])
    .select()
    .single();

  if (error) throw error;

  // 📡 EVENTBUS: Emit event after successful creation
  eventBus.emit('products.product_created', {
    productId: data.id,
    productName: data.name,
    userId: user.id  // 🔑 Track who performed the action
  });

  return data;
}

export async function updateProduct(
  productData: UpdateProductData,
  user: AuthUser
): Promise<Product> {
  // 🔒 PERMISSION CHECK
  requirePermission(user, 'products', 'update');
  // ...
}

export async function deleteProduct(
  id: string,
  user: AuthUser
): Promise<void> {
  // 🔒 PERMISSION CHECK
  requirePermission(user, 'products', 'delete');
  // ...
}
```

### Matriz de Permisos

| Rol | read | create | update | delete | analytics |
|-----|------|--------|--------|--------|-----------|
| **OPERADOR** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **ENCARGADO** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **ADMINISTRADOR** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **SUPER_ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ |

### Error Handling

```typescript
import {
  PermissionDeniedError,
  isPermissionDeniedError
} from '@/lib/permissions';

try {
  await createProduct(data, user);
} catch (error) {
  if (isPermissionDeniedError(error)) {
    // Show user-friendly permission error
    notify.error({
      title: 'Permission Denied',
      description: `You don't have permission to create products. Contact your administrator.`
    });
  } else {
    // Handle other errors
    throw error;
  }
}
```

---

## 🎯 Product Types & Flexibility

### Supported Product Types

Products module supports **11 business models** through flexible configuration:

1. **FOOD/BEVERAGE** (with recipe): Hamburgers, pizzas
2. **RETAIL_GOODS** (no recipe): Coca-Cola, electronics
3. **BEAUTY_SERVICE** (with materials): Hair coloring
4. **PROFESSIONAL_SERVICE** (no materials): Massages, consultations
5. **REPAIR_SERVICE** (dynamic materials): Car repair, maintenance
6. **EVENT** (digital): Webinars, conferences
7. **COURSE** (hybrid): Courses with physical materials
8. **DIGITAL_PRODUCT** (pure digital): E-books, downloads
9. **RENTAL** (time-based): Equipment rental
10. **MEMBERSHIP** (recurring): Gym memberships, subscriptions
11. **CUSTOM** (flexible): Custom product types

### Product Configuration System

```typescript
interface ProductConfig {
  // Materials (BOM)
  has_components: boolean;          // Uses materials?
  components_required: boolean;     // Are they mandatory?
  allow_dynamic_materials: boolean; // Can add during service?

  // Production
  requires_production: boolean;     // Needs Production module?
  production_type?: "kitchen" | "assembly" | "preparation";

  // Staff
  requires_staff: boolean;          // Needs personnel?
  staff_allocation?: StaffAllocation[];

  // Booking
  requires_booking: boolean;        // Needs Scheduling?
  booking_window_days?: number;
  concurrent_capacity?: number;

  // Digital
  is_digital: boolean;              // Has digital component?
  digital_delivery?: DigitalDeliveryConfig;

  // Retail
  is_retail: boolean;               // Is resale?
  retail_details?: RetailConfig;
}
```

### Example Configurations

#### Hamburger (Food with recipe)
```typescript
{
  name: "Classic Burger",
  category: "FOOD",
  config: {
    has_components: true,
    components_required: true,
    requires_production: true,
    production_type: "kitchen",
    requires_staff: true,
    staff_allocation: [
      { role: "chef", count: 1, duration_minutes: 10 }
    ]
  },
  components: [
    { item_id: "bread", quantity: 2 },
    { item_id: "meat", quantity: 0.15 }
  ]
}
```

#### Massage (Service without materials)
```typescript
{
  name: "60min Massage",
  category: "PROFESSIONAL_SERVICE",
  config: {
    has_components: false,        // ← NO materials
    requires_staff: true,
    staff_allocation: [
      { role: "masseuse", count: 1, duration_minutes: 60 }
    ],
    requires_booking: true,
    booking_window_days: 1,
    concurrent_capacity: 3
  },
  components: []                  // ← EMPTY is valid
}
```

#### Webinar (Digital only)
```typescript
{
  name: "Marketing Webinar",
  category: "EVENT",
  config: {
    has_components: false,        // ← NO physical materials
    is_digital: true,
    digital_delivery: {
      delivery_type: "event",
      access_url: "zoom.us/xxx",
      max_participants: 100,
      platform: "Zoom"
    },
    requires_staff: true,
    staff_allocation: [
      { role: "instructor", count: 1, duration_minutes: 120 }
    ]
  }
}
```

---

## 🔄 Architectural Decisions

### Products vs Production Separation

**Products Module** (CATALOG - Layer 2):
- **Owns**: Recipe DEFINITION, BOM composition, costing, pricing
- **Exports**: `calculateRecipeCost()`, `canProduceRecipe()`
- **Stakeholder**: Product Manager, Marketing

**Production Module** (EXECUTION - Layer 2.5):
- **Owns**: Recipe EXECUTION, production orders, kitchen display
- **Uses**: Products API (no duplicate logic)
- **Stakeholder**: Kitchen Manager, Chef

### Feature Naming Convention

**Pattern**: `{domain}_{concern}`

**Products Domain Features**:
- `products_recipe_management` ✅ (not production_bom_management)
- `products_catalog_menu` ✅ (not sales_catalog_menu)
- `products_catalog_ecommerce` ✅ (not sales_catalog_ecommerce)
- `products_package_management` ✅ (not sales_package_management)
- `products_cost_intelligence` ✅
- `products_availability_calculation` ✅
- `products_dynamic_materials` ✅
- `products_digital_delivery` ✅

**Production Domain Features**:
- `production_order_management` ✅ (execution, not definition)
- `production_display_system` ✅
- `production_order_queue` ✅
- `production_capacity_planning` ✅

### Cross-Module Injections

**Products provides hook points**:
- `products.row.actions` → Production injects "Produce Batch" button
- `products.detail.sections` → Sales injects "Sales History", Production injects "Production Info"
- `products.form.fields` → Scheduling injects booking config, Staff injects allocation

**Products injects into**:
- `materials.row.actions` → "Recipe Usage" button
- `dashboard.widgets` → Products performance widget

---

## 📊 Responsibility Matrix

| Module | Responsibility | Products Interface |
|--------|-----------------|-------------------|
| **Products** | Catalog definition, BOM, costing | Owner |
| **Materials** | Stock tracking, reorder | `components[]` field |
| **Production** | Kitchen orders, execution | `config.requires_production` |
| **Sales** | Cart, checkout, payment | `pricing` + availability API |
| **Scheduling** | Appointments, slots | `config.requires_booking` |
| **Staff** | Employee allocation | `config.staff_allocation[]` |
| **Finance** | COGS, margins | `pricing.base_cost` |

**Products defines and coordinates, does NOT execute**

---

## 📊 Testing Strategy

### Estructura de Tests

```
src/pages/admin/supply-chain/products/
├── __tests__/
│   ├── page.test.tsx                    # Tests del componente principal
│   ├── components/
│   │   ├── ProductList.test.tsx         # Tests de componentes
│   │   └── MenuEngineeringMatrix.test.tsx
│   ├── hooks/
│   │   ├── useProductsPage.test.ts      # Tests de hooks
│   │   └── useMenuEngineering.test.ts
│   └── services/
│       ├── productCostService.test.ts   # Tests de lógica pura
│       └── menuEngineeringCalculations.test.ts
```

---

## 🚀 Cómo Replicar este Patrón

### Checklist para Nuevo Módulo

1. **📁 Crear estructura de carpetas**
   ```bash
   mkdir -p components hooks services types utils
   touch README.md page.tsx
   touch components/index.ts hooks/index.ts services/index.ts
   ```

2. **🎯 Implementar página orquestadora**
   - Usar `ContentLayout + PageHeader + Section`
   - Extraer lógica a hook orquestador
   - Componentes simples y semánticos

3. **🪝 Crear hooks especializados**
   - Hook orquestador para la página
   - Hooks de negocio para funcionalidades específicas
   - Estado local vs estado global bien definido

4. **⚙️ Desarrollar servicios**
   - Lógica de negocio pura
   - API calls centralizados
   - Cálculos con precisión decimal

5. **📝 Documentar el módulo**
   - Copiar este README.md
   - Adaptar contenido específico
   - Mantener estructura estándar

---

## 🔗 Referencias Técnicas

### Dependencias Clave
- **Decimal.js**: Precisión en cálculos financieros
- **Zustand**: State management global
- **ChakraUI v3**: Sistema de componentes base
- **React Query**: Data fetching y cache
- **Heroicons**: Iconografía consistente

### Patrones Aplicados
- ✅ **Separation of Concerns**: UI, Estado, Lógica
- ✅ **Composition over Inheritance**: Componentes reutilizables
- ✅ **Domain-Driven Design**: Estructura por dominios de negocio
- ✅ **Event-Driven Architecture**: Comunicación entre módulos
- ✅ **Decimal Precision**: Cálculos financieros exactos

---

## 📈 Métricas de Calidad

### Indicadores de Éxito
- ⚡ **Performance**: Carga < 200ms, operaciones < 50ms
- 🧪 **Testing**: Cobertura > 80%, tests unitarios + integración
- 📦 **Bundle Size**: Incremento < 50KB por módulo
- 🔧 **Mantenibilidad**: Complejidad ciclomática < 10
- 🎨 **UX Consistency**: 100% componentes del design system

### Validación Técnica
```bash
# Comandos de verificación
npm run typecheck     # Sin errores TypeScript
npm run lint         # Sin warnings ESLint
npm run test:unit    # Todos los tests pasan
npm run build        # Build exitoso
```

---

**🎯 Este README.md representa nuestro estándar oficial de módulos en G-Admin Mini.**

**📋 Para crear un nuevo módulo, copia este archivo y adapta el contenido específico manteniendo la estructura y patrones documentados.**