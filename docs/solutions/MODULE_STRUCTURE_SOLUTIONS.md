# Soluciones: Module Structure & Architecture

## Código de referencia: 8.1, 8.2, 8.3, 8.4

## Categoría de impacto
**ALTO** - La estructura incorrecta de módulos afecta la escalabilidad, el mantenimiento, la colaboración en equipo, y la capacidad de aplicar feature flags y cargas condicionales.

---

## 1. Manifest.tsx Faltante o Incompleto (8.1)

### Descripción del anti-pattern

Módulos en `src/modules/` que no tienen archivo `manifest.tsx` o tienen uno incompleto que no define correctamente las capacidades, hooks, exports, o dependencias del módulo.

```typescript
// ❌ INCORRECTO: Sin manifest.tsx o manifest incompleto
src/modules/sales/
├── components/
├── hooks/
├── services/
└── README.md  // ← Sin manifest.tsx
```

### Por qué es un problema

**Fuente 1: Module Pattern (Patterns.dev)**
> "Modules allow you to split up your code into smaller, reusable pieces. Declarations within a module are scoped (encapsulated) to that module by default, which reduces the risk of name collisions for values declared in other parts of your codebase."
- Fuente: Module Pattern - Patterns.dev
- URL: https://www.patterns.dev/vanilla/module-pattern

**Fuente 2: Clean Architecture (Robert C. Martin)**
> "Components should be independently deployable and replaceable. This requires clear interface definitions. The dependencies between them should be source code dependencies only, and should point in only one direction."
- Fuente: Clean Architecture: A Craftsman's Guide to Software Structure and Design

**Fuente 3: ModuleRegistry Implementation (Project)**
> "The Module Registry validates dependencies automatically, allowing modules to be loaded only when required features are present. Without a manifest, this validation and conditional loading is impossible."
- Fuente: `src/lib/modules/ModuleRegistry.ts`

Sin un manifest:
- No se puede validar que el módulo se cargue solo si el usuario tiene las features necesarias
- Otros módulos no saben qué servicios/hooks están disponibles
- No hay un contrato claro de API pública del módulo
- La integración con el Module Registry es imposible
- No hay forma de detectar dependencias circulares

### Solución recomendada

Crear un `manifest.tsx` siguiendo la estructura estándar del proyecto.

#### Código correcto

```typescript
// ✅ CORRECTO: src/modules/sales/manifest.tsx

import { lazy } from 'react';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

// Services exports
import { salesService } from './services/salesService';
import { orderCalculationEngine } from './services/orderCalculationEngine';

const MODULE_ID = 'sales';

export const salesManifest: ModuleManifest = {
  id: MODULE_ID,
  name: 'Sales & POS',
  version: '1.0.0',
  
  // Permission module for RBAC
  permissionModule: 'sales',
  
  // Dependencies on other modules (must be loaded first)
  depends: ['products', 'customers'],
  autoInstall: false,
  
  // Feature flags required to load this module
  requiredFeatures: ['sales_pos'] as FeatureId[],
  
  // Optional features (enhance functionality if present)
  optionalFeatures: ['sales_delivery', 'sales_reservations'] as FeatureId[],
  
  // Minimum role required
  minimumRole: 'VENDEDOR' as const,
  
  // Hooks provided and consumed
  hooks: {
    provide: [
      'sales.order.created',
      'sales.order.completed',
      'sales.payment.received',
    ],
    consume: [
      'dashboard.widgets',
      'products.item.actions',
      {
        name: 'reports.sales.data',
        requiredPermission: {
          module: 'reports',
          action: 'read',
        },
      },
    ],
  },
  
  // Setup function (called on module registration)
  setup: async (registry) => {
    logger.info(MODULE_ID, '🛒 Setting up Sales module');
    
    // Register hooks
    registry.addAction(
      'dashboard.widgets',
      () => <SalesSummaryWidget />,
      MODULE_ID,
      90 // Priority
    );
    
    // Subscribe to events
    const eventBus = registry.getEventBus();
    eventBus.subscribe('products.stock.updated', handleStockUpdate, MODULE_ID);
    
    logger.info(MODULE_ID, '✅ Sales module setup complete');
  },
  
  // Teardown function (called on module unregister)
  teardown: async () => {
    logger.info(MODULE_ID, '🧹 Tearing down Sales module');
    // Cleanup subscriptions
  },
  
  // Public API exports
  exports: {
    services: {
      createOrder: salesService.createOrder,
      calculateOrderTotal: orderCalculationEngine.calculate,
    },
    hooks: {
      useCart: () => import('./hooks/useCart'),
      useSalesMetrics: () => import('./hooks/useSalesMetrics'),
    },
  },
  
  // Metadata for navigation and discovery
  metadata: {
    category: 'business',
    description: 'Point of Sale, orders, and transactions management',
    author: 'G-Admin Team',
    tags: ['sales', 'pos', 'orders', 'transactions'],
    navigation: {
      route: '/admin/sales',
      icon: ShoppingCartIcon,
      color: 'green',
      domain: 'operations',
      isExpandable: false,
    },
  },
};

export default salesManifest;
```

### Patrón de Refactoring

#### Paso 1: Crear Manifest Base
Crear `manifest.tsx` en la raíz del módulo con la estructura mínima:

```typescript
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';

const MODULE_ID = '[module-id]';

export const [moduleName]Manifest: ModuleManifest = {
  id: MODULE_ID,
  name: '[Module Name]',
  version: '1.0.0',
  
  depends: [],
  autoInstall: false,
  
  requiredFeatures: [] as FeatureId[],
  optionalFeatures: [] as FeatureId[],
  
  hooks: {
    provide: [],
    consume: [],
  },
  
  exports: {},
  
  metadata: {
    category: 'business', // core | business | integration | tool
    description: '[Brief description]',
  },
};

export default [moduleName]Manifest;
```

#### Paso 2: Mapear Features Requeridas
Consultar `src/config/FeatureRegistry.ts` y determinar qué features debe tener el usuario para que este módulo se cargue.

```typescript
// Ejemplo: Sales require 'sales_pos'
requiredFeatures: ['sales_pos'] as FeatureId[]

// Ejemplo: Scheduling require 'staff_shift_management'
requiredFeatures: ['staff_shift_management'] as FeatureId[]
```

#### Paso 3: Identificar Dependencias
Revisar imports en servicios y hooks. Si el módulo usa exports de otro módulo, agregarlo a `depends`.

```typescript
// Si usas: registry.getExports('products')
depends: ['products']

// IMPORTANTE: El orden importa - se cargan en orden topológico
depends: ['products', 'customers'] // products se carga primero
```

#### Paso 4: Definir Hooks Provided/Consumed
Identificar qué hooks ofrece este módulo y cuáles consume:

```typescript
hooks: {
  // Hooks que ESTE módulo ofrece a otros
  provide: [
    'sales.order.created',  // Event hook
    'sales.order.updated',
  ],
  
  // Hooks que ESTE módulo consume de otros
  consume: [
    'dashboard.widgets',      // Simple hook
    {                         // Hook con permisos
      name: 'reports.data',
      requiredPermission: {
        module: 'reports',
        action: 'read',
      },
    },
  ],
},
```

#### Paso 5: Implementar Setup Function
La función `setup` es donde registras hooks y suscripciones a eventos:

```typescript
setup: async (registry) => {
  const MODULE_ID = 'sales';
  logger.info(MODULE_ID, 'Setting up...');
  
  // 1. Register UI hooks
  registry.addAction(
    'dashboard.widgets',
    () => <MyWidget />,
    MODULE_ID,
    80 // Priority (higher = executes first)
  );
  
  // 2. Subscribe to events
  const eventBus = registry.getEventBus();
  eventBus.subscribe('products.stock.updated', handleStockUpdate, MODULE_ID);
  
  logger.info(MODULE_ID, 'Setup complete ✅');
},
```

#### Paso 6: Exportar API Pública
Exportar funciones/hooks que otros módulos pueden consumir:

```typescript
exports: {
  services: {
    // Funciones que otros módulos pueden llamar
    createOrder: salesService.createOrder,
    calculateTotal: orderEngine.calculate,
  },
  hooks: {
    // Custom hooks (lazy loaded para mejor performance)
    useCart: () => import('./hooks/useCart'),
    useSalesMetrics: () => import('./hooks/useSalesMetrics'),
  },
  store: {
    // Store access si es necesario
    useSalesStore: () => import('./store/salesStore').then(m => m.useSalesStore),
  },
},
```

#### Paso 7: Registrar en Index Central
Agregar el manifest a `src/modules/index.ts`:

```typescript
export { salesManifest } from './sales/manifest';

export const ALL_MODULE_MANIFESTS = [
  // ... existing
  salesManifest,
];
```

---

## 2. Lógica de Negocio en Pages (8.2)

### Descripción del anti-pattern

Páginas en `src/pages/` que contienen lógica de negocio, acceso a base de datos, cálculos complejos o handlers que deberían estar en `src/modules/`.

```typescript
// ❌ INCORRECTO: src/pages/admin/sales/pos/page.tsx
const POSPage = () => {
  // Lógica de negocio en la página
  const calculateDiscount = (items: Item[], couponCode: string) => {
    const discount = coupons[couponCode]?.value || 0;
    return items.reduce((acc, item) => 
      acc + (item.price * item.quantity * discount), 0
    );
  };

  // Acceso directo a DB
  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('active', true);
    setProducts(data);
  };

  // Estado de servidor en local state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ...
};
```

### Por qué es un problema

**Fuente 1: Service Layer Pattern (Martin Fowler)**
> "A Service Layer defines an application's boundary with a layer of services that establishes a set of available operations and coordinates the application's response in each operation."
- Fuente: Martin Fowler - Service Layer Pattern
- URL: https://martinfowler.com/eaaCatalog/serviceLayer.html

**Fuente 2: Feature-Sliced Design**
> "Business logic should live in feature modules (entities, features), not in the pages that consume them. Pages are part of the app layer and should only orchestrate and compose."
- Fuente: Feature-Sliced Design - Layers
- URL: https://feature-sliced.design/docs/reference/layers

**Fuente 3: Separation of Concerns**
> "Presentation logic should be separated from business logic. When you mix concerns, your components become brittle and hard to change."
- Fuente: Kent C. Dodds - Compound Components with React Hooks

Problemas:
- **No reutilizable**: Otra página no puede usar esa lógica de descuentos
- **No testeable**: No puedes testear la lógica sin montar la página completa
- **Duplicación**: Otras páginas duplicarán la lógica si la necesitan
- **Dificulta feature flags**: No puedes desactivar funcionalidad condicionalmente
- **Viola Single Responsibility**: La página se encarga de UI Y lógica de negocio

### Solución recomendada

Mover toda la lógica de negocio a `src/modules/[module]/`:
- **Hooks** → `src/modules/[module]/hooks/`
- **Servicios** → `src/modules/[module]/services/`
- **Stores** → `src/modules/[module]/store/`
- **Handlers** → `src/modules/[module]/handlers/`

#### Código correcto

```typescript
// ✅ CORRECTO: Lógica en módulo

// 1. src/modules/sales/services/discountEngine.ts
import { financial } from '@/lib/math/DecimalUtils';
import type { Item, Coupon } from '../types';

export const discountEngine = {
  calculate(items: Item[], coupon: Coupon): Decimal {
    // Lógica de negocio centralizada y testeableconst subtotal = items.reduce((acc, item) => 
      financial.add(acc, financial.multiply(item.price, item.quantity)),
      financial.zero()
    );
    
    return financial.multiply(subtotal, coupon.discountRate);
  },
};

// 2. src/modules/sales/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../services/productsApi';

export function useProducts() {
  return useQuery({
    queryKey: ['products', 'active'],
    queryFn: () => productsApi.getActive(),
    staleTime: 5 * 60 * 1000,
  });
}

// 3. src/modules/sales/hooks/useDiscount.ts
export function useDiscount() {
  const applyCoupon = useCallback((items: Item[], couponCode: string) => {
    const coupon = couponsRegistry.get(couponCode);
    if (!coupon) return financial.zero();
    
    return discountEngine.calculate(items, coupon);
  }, []);
  
  return { applyCoupon };
}

// 4. src/pages/admin/sales/pos/page.tsx (SOLO presentación)
import { useProducts } from '@/modules/sales/hooks/useProducts';
import { useDiscount } from '@/modules/sales/hooks/useDiscount';

const POSPage = () => {
  // La página SOLO consume y presenta
  const { data: products, isLoading } = useProducts();
  const { applyCoupon } = useDiscount();

  if (isLoading) return <LoadingSpinner />;

  return (
    <ContentLayout title="Punto de Venta">
      <ProductGrid products={products} />
      <Cart />
      <DiscountPanel onApply={applyCoupon} />
    </ContentLayout>
  );
};
```

### Patrón de Refactoring

#### Paso 1: Identificar Lógica de Negocio
Buscar en la página:
- [ ] Cálculos matemáticos/financieros
- [ ] Validaciones complejas
- [ ] Llamadas a Supabase/API
- [ ] Funciones de transformación de datos
- [ ] Estado que representa data del servidor (`useState` con data de DB)
- [ ] `useEffect` con data fetching

#### Paso 2: Extraer a Módulo
Mover la lógica a la carpeta correspondiente:
- **Cálculos puros** → `services/*Engine.ts` o `utils/`
- **Data fetching** → `hooks/use*.ts` (con TanStack Query)
- **Acciones/Handlers** → `handlers/*.ts` o `services/*.ts`
- **Validaciones** → `services/*Validator.ts`

#### Paso 3: Actualizar Página
Importar y consumir desde el módulo:

```typescript
// ANTES (en page.tsx) - 150 líneas de lógica
const calculateTotal = (items) => { /* 50 líneas */ }
const validateOrder = () => { /* 30 líneas */ }
const submitOrder = async () => { /* 40 líneas */ }

// DESPUÉS (en page.tsx) - 50 líneas solo de composición
import { useOrderCalculation } from '@/modules/sales';
import { useOrderValidation } from '@/modules/sales';
import { useOrderSubmission } from '@/modules/sales';

const { total } = useOrderCalculation(items);
const { isValid, errors } = useOrderValidation(order);
const { submitOrder, isSubmitting } = useOrderSubmission();
```

---

## 3. Hooks de Dominio en Pages (8.3)

### Descripción del anti-pattern

Custom hooks que encapsulan lógica de dominio (no solo UI) ubicados en `src/pages/[...]/hooks/` en lugar de `src/modules/[module]/hooks/`.

```typescript
// ❌ INCORRECTO: src/pages/admin/sales/hooks/useOrderCalculation.ts
// Este hook contiene lógica de negocio de Sales, debería estar en el módulo
export function useOrderCalculation() {
  const calculateTax = (subtotal: Decimal) => {
    return financial.multiply(subtotal, TAX_RATE);
  };
  
  const applyDiscount = (amount: Decimal, discount: number) => {
    return financial.subtract(amount, financial.multiply(amount, discount));
  };
  
  // Más lógica de negocio...
  return { calculateTax, applyDiscount };
}
```

### Por qué es un problema

**Fuente 1: Feature-Sliced Design - Slices**
> "Slices partition the code by business domain. Shared business logic should be extracted to entities or features layers, not duplicated across pages."
- Fuente: Feature-Sliced Design - Slices and Segments
- URL: https://feature-sliced.design/docs/reference/slices-segments

**Fuente 2: React Hooks - Reusing Logic**
> "Custom Hooks let you reuse stateful logic between components. Extract logic into hooks when it needs to be shared across multiple components or tested independently."
- Fuente: React Documentation - Reusing Logic with Custom Hooks
- URL: https://react.dev/learn/reusing-logic-with-custom-hooks

Problemas:
- Otras páginas no pueden acceder a este hook
- No se puede exportar vía `manifest.tsx`
- Difícil de testear aisladamente
- Viola el principio de cohesión (lógica de dominio dispersa)

### Diferencia clave: Hooks de Dominio vs Hooks de UI

| Aspecto | Hooks de Dominio | Hooks de UI/Página |
|---------|------------------|-------------------|
| **Ubicación** | `src/modules/[module]/hooks/` | `src/pages/[...]/hooks/` |
| **Responsabilidad** | Lógica de negocio, data fetching, state management | Estado UI local, orquestación de página |
| **Reusabilidad** | Múltiples páginas/componentes | Solo esa página |
| **Testing** | Unitario (sin renderizar componentes) | Integración (con la página) |
| **Exports** | Sí (vía manifest) | No |
| **Ejemplos** | `useOrderCalculation`, `useProducts`, `useInventory` | `useProductFormPage`, `useModalState`, `useTabSelection` |

### Solución recomendada

```typescript
// ✅ CORRECTO: src/modules/sales/hooks/useOrderCalculation.ts
// Lógica de dominio en el módulo - puede ser consumida por CUALQUIER página
export function useOrderCalculation() {
  const calculateTax = useCallback((subtotal: Decimal) => {
    return financial.multiply(subtotal, TAX_RATE);
  }, []);
  
  const applyDiscount = useCallback((amount: Decimal, discount: number) => {
    return financial.subtract(amount, financial.multiply(amount, discount));
  }, []);
  
  const calculateTotal = useCallback((items: CartItem[]) => {
    // Lógica de negocio...
  }, []);
  
  return { calculateTax, applyDiscount, calculateTotal };
}

// ✅ CORRECTO: src/pages/admin/sales/pos/hooks/usePOSPage.ts
// Hook específico de la página que ORQUESTA módulos y maneja UI
export function usePOSPage() {
  // 1. Consume hooks de módulos
  const { calculateTotal, applyDiscount } = useOrderCalculation();
  const { data: products } = useProducts();
  
  // 2. Estado UI local (específico de esta página)
  const [selectedTab, setSelectedTab] = useState<'cart' | 'history'>('cart');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  
  // 3. Handlers específicos de la UI de esta página
  const handleCheckout = useCallback(() => {
    setIsCheckoutModalOpen(true);
  }, []);
  
  return {
    // Estado y funciones de UI
    selectedTab,
    setSelectedTab,
    isCheckoutModalOpen,
    handleCheckout,
    
    // Lógica de negocio (delegada a módulos)
    calculateTotal,
    applyDiscount,
    products,
  };
}
```

### Regla Simple

**Pregunta: "¿Este hook puede ser útil en más de una página?"**
- **SÍ** → `src/modules/[module]/hooks/`
- **NO** → `src/pages/[...]/hooks/`

**Pregunta: "¿Este hook contiene lógica de negocio o solo orquesta UI?"**
- **Lógica de negocio** → `src/modules/[module]/hooks/`
- **Solo UI** → `src/pages/[...]/hooks/`

---

## 4. Exports Públicos sin Documentar (8.4)

### Descripción del anti-pattern

Módulos que exportan funciones/hooks en el `manifest.tsx` pero no documentan su uso, tipos de entrada/salida, o casos de uso.

```typescript
// ❌ INCORRECTO: Exports sin JSDoc
export const productsManifest: ModuleManifest = {
  // ...
  exports: {
    services: {
      canProduceRecipe,        // ← Sin documentación
      calculateRecipeCost,     // ← No sé qué parámetros recibe
      checkAvailability,       // ← No sé qué retorna
    },
  },
};
```

### Por qué es un problema

**Fuente 1: TypeScript Documentation - JSDoc Reference**
> "JSDoc comments provide information about the code to both developers and tools. They're particularly useful for documenting APIs and providing autocomplete in editors."
- Fuente: TypeScript - JSDoc Reference
- URL: https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html

**Fuente 2: Clean Code (Robert C. Martin)**
> "Good code is its own best documentation. As you're about to add a comment, ask yourself, 'How can I improve the code so that this comment isn't needed?' However, for public APIs, explicit documentation is essential."
- Fuente: Clean Code: A Craftsman's Guide to Software Structure

Sin documentación:
- Otros desarrolladores no saben cómo usar tu módulo
- No hay autocomplete efectivo en el IDE
- Difícil de mantener (no se sabe qué hace cada función)
- Aumenta el tiempo de onboarding

### Solución recomendada

Agregar JSDoc completo a todas las funciones exportadas públicamente:

```typescript
// ✅ CORRECTO: Exports documentados

/**
 * Verifies if a recipe can be produced given current material stock.
 * 
 * This function checks the inventory levels of all materials required
 * for the recipe and determines if there's sufficient stock to produce
 * the requested quantity.
 * 
 * @param recipeId - UUID of the recipe to check
 * @param quantity - Number of units to produce (must be positive)
 * @returns Promise resolving to availability status and missing materials
 * 
 * @example
 * ```typescript
 * const check = await canProduceRecipe('recipe-123', 5);
 * if (!check.canProduce) {
 *   console.log('Missing materials:', check.missingMaterials);
 *   // Output: ['Beef Patty', 'Cheese Slice']
 * }
 * ```
 * 
 * @throws {AppError} If recipe is not found (code: 'RECIPE_NOT_FOUND')
 * @throws {AppError} If quantity is invalid (code: 'INVALID_QUANTITY')
 * 
 * @see {@link calculateRecipeCost} for cost calculation
 * @see {@link getRecipe} for recipe details
 */
export async function canProduceRecipe(
  recipeId: string,
  quantity: number
): Promise<RecipeAvailability> {
  if (quantity <= 0) {
    throw new AppError('INVALID_QUANTITY', 'Quantity must be positive');
  }
  
  const recipe = await getRecipe(recipeId);
  if (!recipe) {
    throw new AppError('RECIPE_NOT_FOUND', `Recipe ${recipeId} not found`);
  }
  
  // Implementation...
}

/**
 * Calculates the total cost to produce a recipe based on current material prices.
 * 
 * This function aggregates the costs of all materials required for the recipe,
 * taking into account quantity needed and current market prices.
 * 
 * @param recipeId - UUID of the recipe
 * @returns Promise resolving to cost breakdown
 * 
 * @example
 * ```typescript
 * const cost = await calculateRecipeCost('recipe-123');
 * console.log(cost.total);        // Decimal(15.50)
 * console.log(cost.breakdown);    // { 'beef': 10.00, 'cheese': 5.50 }
 * ```
 */
export async function calculateRecipeCost(
  recipeId: string
): Promise<RecipeCostBreakdown> {
  // Implementation...
}

// En el manifest
export const productsManifest: ModuleManifest = {
  exports: {
    services: {
      canProduceRecipe,
      calculateRecipeCost,
    },
    hooks: {
      /**
       * Hook for managing product data fetching and caching.
       * @returns Dynamic import of useProducts hook
       */
      useProducts: () => import('./hooks/useProducts'),
    },
  },
};
```

### Template JSDoc para Exports

```typescript
/**
 * [Brief one-line description]
 * 
 * [Detailed explanation of what this function does, including any important
 * business logic, side effects, or behavior notes]
 * 
 * @param paramName - [Description of parameter]
 * @param optionalParam - [Description] (optional, defaults to [value])
 * @returns [Description of return value]
 * 
 * @example
 * ```typescript
 * [Code example showing typical usage]
 * ```
 * 
 * @throws {ErrorType} [Description of when this error is thrown]
 * 
 * @see {@link relatedFunction} [Why this is related]
 * 
 * @since [Version when this was added]
 * @deprecated [If deprecated, describe alternative]
 */
export async function myExportedFunction(
  paramName: Type,
  optionalParam?: Type
): Promise<ReturnType> {
  // Implementation
}
```

---

## Validación Completa (Checklist)

### Manifest Checklist
- [ ] Existe `manifest.tsx` en la raíz del módulo
- [ ] Define `id`, `name`, `version` correctamente
- [ ] Define `requiredFeatures` (de FeatureRegistry)
- [ ] Define `depends` correctamente (en orden topológico)
- [ ] Tiene función `setup` si registra hooks o eventos
- [ ] Tiene función `teardown` si necesita cleanup
- [ ] Exporta `hooks` con lazy loading
- [ ] Exporta `services` y otros exports públicos
- [ ] Incluye `metadata` con navegación (si aplica)
- [ ] Está registrado en `src/modules/index.ts`

### Separación Módulos/Pages Checklist
- [ ] No hay acceso directo a Supabase en `src/pages/`
- [ ] No hay cálculos de negocio en `src/pages/`
- [ ] No hay `useState` con data de servidor en `src/pages/`
- [ ] No hay `useEffect` con data fetching en `src/pages/`
- [ ] Hooks de dominio están en `src/modules/[module]/hooks/`
- [ ] Hooks de UI/página específicos están en `src/pages/[...]/hooks/`
- [ ] Servicios están en `src/modules/[module]/services/`
- [ ] Stores están en `src/modules/[module]/store/`

### Documentación Checklist
- [ ] Todos los exports públicos tienen JSDoc completo
- [ ] JSDoc incluye @param, @returns, @example
- [ ] JSDoc incluye @throws para errores conocidos
- [ ] JSDoc incluye @see para funciones relacionadas
- [ ] README.md del módulo está actualizado
- [ ] Tipos están exportados desde `types/index.ts`
- [ ] Ejemplos de uso están en los comentarios

### Arquitectura Checklist
- [ ] El módulo no importa de páginas
- [ ] Las páginas solo importan de módulos (no al revés)
- [ ] No hay dependencias circulares entre módulos
- [ ] Los módulos más básicos no dependen de módulos avanzados
- [ ] La función `setup` es asíncrona y se awaita correctamente

---

## Esfuerzo Estimado

**ALTO** - Refactorizar la estructura de módulos es un cambio arquitectónico significativo.

| Tarea | Tiempo Estimado | Impacto |
|-------|----------------|---------|
| Crear manifest básico | 30-45 minutos | Medio |
| Implementar setup/teardown completo | 1-2 horas | Alto |
| Mover lógica de pages a modules | 2-4 horas por página compleja | Alto |
| Documentar exports con JSDoc | 15-30 minutos por módulo | Medio |
| Refactorizar hooks de página a módulo | 1-2 horas por hook complejo | Alto |
| Testing de integración del módulo | 2-3 horas | Alto |

**Estrategia recomendada**: 
1. Hacer módulo por módulo, empezando por los más críticos (sales, products, materials)
2. Crear el manifest primero
3. Mover lógica gradualmente (no todo de una vez)
4. Testear cada migración antes de continuar
5. Documentar a medida que migras

---

## Referencias

1. **Module Registry Implementation**: `src/lib/modules/ModuleRegistry.ts`
2. **Module Types**: `src/lib/modules/types.ts`
3. **Module README**: `src/modules/README.md`
4. **Feature-Sliced Design**: https://feature-sliced.design/
5. **Module Pattern**: https://www.patterns.dev/vanilla/module-pattern
6. **Service Layer Pattern**: https://martinfowler.com/eaaCatalog/serviceLayer.html
7. **Clean Architecture** - Robert C. Martin
8. **React Custom Hooks**: https://react.dev/learn/reusing-logic-with-custom-hooks
