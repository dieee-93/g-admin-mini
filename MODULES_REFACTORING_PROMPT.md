# MODULES REFACTORING PROMPT: Logic & Architecture Standardization

**Version:** 1.0 (Created: 2025-12-17)  
**Context:** Este prompt guía la refactorización de módulos en `src/modules/`, enfocándose en lógica de negocio, arquitectura modular, y integración con Module Registry.

---

## 🎯 OBJECTIVE

Analizar y refactorizar un módulo específico en `src/modules/[module-name]` para alinearlo con los estándares arquitectónicos del proyecto.

**Target Module:** `[src/modules/sales]` (ej., `src/modules/products`, `src/modules/shift-control`)

---

## 📚 KNOWLEDGE BASE (Must Read First)

Antes de hacer cambios, lee los documentos de soluciones relevantes:

| Category | Solution Document | Relevance for Modules |
|----------|-------------------|----------------------|
| **💰 Finance** | `docs/solutions/DECIMAL_UTILS_SOLUTIONS.md` | ✅ Critical - Handlers, Services |
| **🧠 State** | `docs/solutions/ZUSTAND_STATE_MANAGEMENT_SOLUTIONS.md` | ✅ Critical - Stores |
| **🚀 Performance** | `docs/solutions/PERFORMANCE_OPTIMIZATION_SOLUTIONS.md` | ⚠️ Medium - Widgets |
| **🪝 Hooks** | `docs/solutions/REACT_HOOKS_SOLUTIONS.md` | ✅ High - Module Hooks |
| **📘 Types** | `docs/solutions/TYPESCRIPT_BEST_PRACTICES_SOLUTIONS.md` | ✅ High - All Files |
| **🔌 Services** | `docs/solutions/SERVICE_LAYER_SOLUTIONS.md` | ✅ Critical - Services Layer |
| **📦 Modules** | `docs/solutions/MODULE_STRUCTURE_SOLUTIONS.md` | ✅ **ESSENTIAL** - Manifest, Structure |
| **✨ Quality** | `docs/solutions/CODE_QUALITY_SOLUTIONS.md` | ⚠️ Medium - All Files |

---

## 🔍 EXECUTION PROTOCOL

### PHASE 1: ARCHITECTURE DIAGNOSTIC (Read-Only)

**Objetivo**: Evaluar la estructura y conformidad del módulo con Module Registry.

#### 1.1 Manifest Validation
- [ ] **Archivo `manifest.tsx` existe** en la raíz del módulo
- [ ] **Estructura completa**: id, name, version, depends, requiredFeatures
- [ ] **Setup function** implementada (si registra hooks o eventos)
- [ ] **Teardown function** implementada (si necesita cleanup)
- [ ] **Exports** definidos correctamente (services, hooks, store)
- [ ] **Metadata** incluye navigation (si aplica)
- [ ] **Registrado** en `src/modules/index.ts`

#### 1.2 Module Structure Scan
```
src/modules/[module-name]/
├── manifest.tsx             ← ✅ Required
├── README.md                ← ✅ Required
├── index.ts                 ← ✅ Exports públicos
├── types/                   ← ✅ Type definitions
│   └── index.ts
├── services/                ← Business logic, API calls
│   ├── *Api.ts              (Data access)
│   ├── *Service.ts          (Business logic)
│   └── *Engine.ts           (Calculations)
├── store/                   ← Zustand stores (UI state ONLY)
│   └── *Store.ts
├── hooks/                   ← Domain hooks (reusable)
│   ├── use*.ts
│   └── __tests__/
├── handlers/                ← Event/action handlers
│   └── index.ts
├── components/              ← Module-specific components
│   └── widgets/             (Dashboard widgets)
└── utils/                   ← Pure functions, helpers
```

#### 1.3 Anti-Patterns Scan
Buscar en todos los archivos del módulo:

**❌ Critical Anti-Patterns**:
- [ ] **Native math operators** (`*`, `+`, `-`, `/`) en lógica financiera
- [ ] **Server state en Zustand stores** (items, listas de DB)
- [ ] **`produce()` de immer** en stores
- [ ] **Acceso directo a Supabase** fuera de `*Api.ts`
- [ ] **`any` types** sin justificación
- [ ] **Missing manifest.tsx**

**⚠️ Medium Anti-Patterns**:
- [ ] **Hooks >150 líneas** sin descomponer
- [ ] **Services mezclando concerns** (DB + Format + Auth)
- [ ] **Servicios duplicados** (nombre similar en otro módulo)
- [ ] **Exports sin JSDoc**
- [ ] **useEffect sin dependencies correctas**

#### 1.4 Diagnostic Report Output
```markdown
## Diagnostic Report: [module-name]

### ✅ Strengths
- [Listar aspectos bien implementados]

### ❌ Critical Issues
1. [Issue ID] [File]: [Description]
2. ...

### ⚠️ Improvements Needed
1. [Issue ID] [File]: [Description]
2. ...

### 📊 Metrics
- Total Files: X
- Critical Issues: X
- Medium Issues: X
- Manifest Status: ✅ / ❌
```

---

### PHASE 2: CRITICAL REFACTORING (High Impact)

**Priority 1: Module Architecture**

#### 2.1 Manifest Creation/Update
Si no existe `manifest.tsx`:

```typescript
// src/modules/[module]/manifest.tsx
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { logger } from '@/lib/logging/Logger';

const MODULE_ID = '[module-id]';

export const [module]Manifest: ModuleManifest = {
  id: MODULE_ID,
  name: '[Module Name]',
  version: '1.0.0',
  
  depends: [], // Módulos requeridos
  autoInstall: false,
  
  requiredFeatures: [] as FeatureId[],
  optionalFeatures: [] as FeatureId[],
  
  minimumRole: 'VENDEDOR' as const, // Ajustar según módulo
  
  hooks: {
    provide: [],  // Hooks que este módulo ofrece
    consume: [],  // Hooks que este módulo usa
  },
  
  setup: async (registry) => {
    logger.info(MODULE_ID, 'Setting up module...');
    // Register hooks, subscribe to events
    logger.info(MODULE_ID, 'Setup complete ✅');
  },
  
  teardown: async () => {
    logger.info(MODULE_ID, 'Tearing down module...');
    // Cleanup
  },
  
  exports: {
    services: {},
    hooks: {},
  },
  
  metadata: {
    category: 'business', // core | business | integration | tool
    description: '[Brief description]',
    author: 'G-Admin Team',
    tags: [],
  },
};

export default [module]Manifest;
```

**Verificación**:
- [ ] Manifest compilado sin errores TypeScript
- [ ] Registrado en `src/modules/index.ts`
- [ ] Dependencies correctas (no circulares)
- [ ] Setup function ejecuta sin errores

#### 2.2 Financial Precision
**OBLIGATORIO** en módulos: sales, products, materials, suppliers, cash, billing

- [ ] Buscar operadores `*`, `+`, `-`, `/` en lógica financiera
- [ ] Reemplazar con `DecimalUtils`: `financial.*`, `inventory.*`, `currency.*`
- [ ] Eliminar `.toNumber()` prematuro (mantener Decimal hasta el final)

```typescript
// ❌ ANTES
const total = price * quantity;
const discount = total * 0.1;

// ✅ DESPUÉS
const total = financial.multiply(price, quantity);
const discount = financial.multiply(total, financial.fromNumber(0.1));
```

**Priority 2: State Architecture**

#### 2.3 Server State Migration
**OBLIGATORIO**: Eliminar server state de Zustand stores

- [ ] Identificar datos de servidor en stores (items, lists, sessions)
- [ ] Crear hooks con TanStack Query en `hooks/use*.ts`
- [ ] Mantener SOLO UI state en Zustand (filters, modals, selections)

```typescript
// ❌ ANTES: src/modules/products/store/productsStore.ts
export interface ProductsState {
  products: Product[];      // ← Server state
  loading: boolean;         // ← Server state
  selectedId: string | null; // ← UI state (OK)
  isModalOpen: boolean;     // ← UI state (OK)
}

// ✅ DESPUÉS:

// 1. TanStack Query for server state
// src/modules/products/hooks/useProducts.ts
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

// 2. Zustand ONLY for UI state
// src/modules/products/store/productsUIStore.ts
export interface ProductsUIState {
  selectedId: string | null;
  isModalOpen: boolean;
  filters: ProductFilters;
  // NO server data
}
```

#### 2.4 Remove Immer Middleware
- [ ] Eliminar `immer` middleware de todos los stores
- [ ] Usar immutable updates manuales
- [ ] Agregar `useShallow` a selectors que retornan objetos

```typescript
// ❌ ANTES
import { produce } from 'immer';

export const useStore = create(immer((set) => ({
  // ...
})));

// ✅ DESPUÉS
export const useStore = create<State>((set) => ({
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
}));
```

**Priority 3: Service Layer**

#### 2.5 Service Layer Cleanup
- [ ] **Naming Convention**:
  - `*Api.ts` = Data Access (Supabase, REST, GraphQL)
  - `*Service.ts` = Business Logic (orchestration, validation)
  - `*Engine.ts` = Calculations (pure functions)

- [ ] **Separation of Concerns**:
  - APIs no contienen validaciones de negocio
  - Services no hacen llamadas directas a DB
  - No mezclar auth, DB, y formato en un archivo

```typescript
// ✅ CORRECTO:

// 1. productsApi.ts (Data Access)
export const productsApi = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    if (error) throw new AppError('DB_ERROR', error.message);
    return data;
  },
};

// 2. productsService.ts (Business Logic)
export const productsService = {
  async createProduct(input: CreateProductInput): Promise<Product> {
    // Validation
    if (!input.name) throw new AppError('INVALID_INPUT', 'Name required');
    
    // Call API
    const product = await productsApi.create(input);
    
    // Emit event
    eventBus.emit('products.created', product);
    
    return product;
  },
};

// 3. recipeEngine.ts (Calculations)
export const recipeEngine = {
  calculateCost(recipe: Recipe, materials: Material[]): Decimal {
    // Pure calculation logic
    return recipe.components.reduce((total, comp) => {
      const material = materials.find(m => m.id === comp.material_id);
      return financial.add(total, financial.multiply(material.price, comp.quantity));
    }, financial.zero());
  },
};
```

#### 2.6 Consolidate Duplicate Services
- [ ] Buscar servicios con nombres similares en otros módulos
- [ ] Consolidar en un solo servicio autorizado
- [ ] Actualizar todos los imports

---

### PHASE 3: MODULE-SPECIFIC REFACTORING

#### 3.1 Hooks Quality
- [ ] Hooks >150 líneas: dividir en hooks más pequeños
- [ ] Extraer lógica compleja a servicios/utils
- [ ] Agregar JSDoc completo
- [ ] useCallback/useMemo donde aplique

```typescript
// ❌ ANTES: Hook gigante (200 líneas)
export function useProductsPage() {
  // 200 líneas de lógica
}

// ✅ DESPUÉS: Hooks especializados
export function useProducts() { /* Data fetching */ }
export function useProductFilters() { /* Filter logic */ }
export function useProductActions() { /* CRUD operations */ }

// Facade hook (opcional)
export function useProductsPage() {
  const products = useProducts();
  const filters = useProductFilters();
  const actions = useProductActions();
  return { products, filters, actions };
}
```

#### 3.2 Event Handlers
Si el módulo usa EventBus:

- [ ] Handlers en carpeta `handlers/`
- [ ] Registrados en `manifest.tsx` setup function
- [ ] Des-registrados en teardown function
- [ ] Tipados correctamente

```typescript
// src/modules/products/handlers/index.ts
export const productEventHandlers = {
  'materials.stock.updated': (data: StockUpdateEvent) => {
    // Handle event
    logger.debug('products', 'Stock updated:', data);
  },
};

// En manifest.tsx
setup: async (registry) => {
  const eventBus = registry.getEventBus();
  Object.entries(productEventHandlers).forEach(([event, handler]) => {
    eventBus.subscribe(event, handler, MODULE_ID);
  });
},
```

#### 3.3 Exports Documentation
- [ ] Todos los exports en manifest tienen JSDoc
- [ ] JSDoc incluye: @param, @returns, @example, @throws
- [ ] Tipos exportados desde `types/index.ts`

```typescript
/**
 * Calculates if a recipe can be produced with current stock.
 * 
 * @param recipeId - UUID of recipe
 * @param quantity - Units to produce
 * @returns Availability status and missing materials
 * 
 * @example
 * ```typescript
 * const result = await canProduceRecipe('recipe-123', 5);
 * if (!result.canProduce) {
 *   console.log('Missing:', result.missingMaterials);
 * }
 * ```
 * 
 * @throws {AppError} If recipe not found
 */
export async function canProduceRecipe(
  recipeId: string,
  quantity: number
): Promise<RecipeAvailability> {
  // Implementation
}
```

---

### PHASE 4: CODE QUALITY

#### 4.1 TypeScript
- [ ] Eliminar `any` types (usar `unknown` si es necesario)
- [ ] Agregar tipos explícitos a funciones exportadas
- [ ] Interfaces vs Types (preferir interfaces para objetos)

#### 4.2 Performance
- [ ] useCallback para event handlers
- [ ] useMemo para cálculos costosos
- [ ] React.memo para componentes de widgets pesados
- [ ] Lazy loading de componentes en manifest

```typescript
// En manifest.tsx
hooks: {
  consume: [
    'dashboard.widgets',
  ],
},
setup: async (registry) => {
  registry.addAction(
    'dashboard.widgets',
    () => <ProductsWidget />, // ← Lazy load si es pesado
    MODULE_ID,
    80
  );
},
```

---

### PHASE 5: VERIFICATION

#### 5.1 Compilation Check
```bash
# Verificar que compile sin errores
pnpm run typecheck
```

#### 5.2 Module Registration Test
```typescript
// Test manual (en devtools console)
import { getModuleRegistry } from '@/lib/modules';

const registry = getModuleRegistry();
const stats = registry.getStats();
console.log('Registered modules:', stats.modules);
console.log('Module [name] registered:', registry.has('[module-id]'));

const exports = registry.getExports('[module-id]');
console.log('Exports:', exports);
```

#### 5.3 Logic Verification
- [ ] Cálculos financieros dan resultados esperados
- [ ] Eventos se emiten correctamente
- [ ] Hooks exportados funcionan
- [ ] UI state se actualiza correctamente

---

## 📝 OUTPUT FORMAT

Para cada cambio:

```markdown
### [File Path]
**Issue ID**: [e.g., 8.1 - Missing Manifest]
**Action Taken**: [Description]
**Verification**: [How you verified it works]

Example:
### src/modules/products/manifest.tsx
**Issue ID**: 8.1 - Missing Manifest
**Action Taken**: Created complete manifest.tsx with setup/teardown, exports, and metadata
**Verification**: ✅ Module registered successfully, no TypeScript errors, exports accessible via registry.getExports('products')
```

---

## ⚠️ CRITICAL RULES (MODULES)

1. **NEVER** romper funcionalidad existente. Si un refactor es riesgoso, preguntar.
2. **ALWAYS** usar `DecimalUtils` para lógica financiera en este módulo.
3. **ALWAYS** usar TanStack Query para server state. Zustand SOLO para UI.
4. **ALWAYS** documentar exports públicos con JSDoc completo.
5. **ALWAYS** seguir convención: `*Api.ts`, `*Service.ts`, `*Engine.ts`.
6. **NEVER** importar de `src/pages/` desde módulos.
7. **ALWAYS** registrar/des-registrar eventos en setup/teardown.
8. **ALWAYS** validar manifest con TypeScript antes de completar.

---

## 📖 MODULE-SPECIFIC PATTERNS

### Pattern: Facade Hook
Cuando un módulo exporta múltiples hooks relacionados:

```typescript
// Individual hooks
export function useProducts() { /* ... */ }
export function useProductFilters() { /* ... */ }
export function useProductActions() { /* ... */ }

// Facade hook (opcional, para conveniencia)
export function useProductsModule() {
  const products = useProducts();
  const filters = useProductFilters();
  const actions = useProductActions();
  
  return {
    // Server state
    products: products.data,
    isLoading: products.isLoading,
    
    // UI state
    filters: filters.current,
    setFilter: filters.setFilter,
    
    // Actions
    createProduct: actions.create,
    updateProduct: actions.update,
    deleteProduct: actions.delete,
  };
}
```

### Pattern: Event-Driven Communication
Modules NO importan otros modules directamente. Usan eventos o exports:

```typescript
// ❌ INCORRECTO
import { productsService } from '@/modules/products';

// ✅ CORRECTO: Via exports
const productsExports = registry.getExports('products');
const product = await productsExports.services.getProduct(id);

// ✅ CORRECTO: Via events
eventBus.emit('products.updated', { productId });
```

---

**Ready to start? Provide the target module path in `src/modules/`.**
