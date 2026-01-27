# PAGES REFACTORING PROMPT: UI & Component Standardization

**Version:** 1.0 (Created: 2025-12-17)  
**Context:** Este prompt guía la refactorización de páginas en `src/pages/`, enfocándose en componentes UI, separación presentación/lógica, y consumo correcto de módulos.

---

## 🎯 OBJECTIVE

Analizar y refactorizar una página específica en `src/pages/` para alinearlo con los estándares de arquitectura de componentes y consumo de módulos.

**Target Page:** `[src/pages/admin/sales/pos/page.tsx]` (ej., `src/pages/admin/supply-chain/products/page.tsx`)

---

## 📚 KNOWLEDGE BASE (Must Read First)

Antes de hacer cambios, lee los documentos de soluciones relevantes:

| Category | Solution Document | Relevance for Pages |
|----------|-------------------|---------------------|
| **💰 Finance** | `docs/solutions/DECIMAL_UTILS_SOLUTIONS.md` | ⚠️ Low - No cálculos en pages |
| **🧠 State** | `docs/solutions/ZUSTAND_STATE_MANAGEMENT_SOLUTIONS.md` | ⚠️ Medium - Solo consumo |
| **🚀 Performance** | `docs/solutions/PERFORMANCE_OPTIMIZATION_SOLUTIONS.md` | ✅ High - React optimization |
| **🪝 Hooks** | `docs/solutions/REACT_HOOKS_SOLUTIONS.md` | ✅ Critical - Component hooks |
| **📘 Types** | `docs/solutions/TYPESCRIPT_BEST_PRACTICES_SOLUTIONS.md` | ✅ High - Props, types |
| **🏗️ Architecture** | `docs/solutions/COMPONENT_ARCHITECTURE_SOLUTIONS.md` | ✅ **ESSENTIAL** - Component structure |
| **📦 Modules** | `docs/solutions/MODULE_STRUCTURE_SOLUTIONS.md` | ✅ High - Module consumption |
| **✨ Quality** | `docs/solutions/CODE_QUALITY_SOLUTIONS.md` | ⚠️ Medium - Code standards |

---

## 🔍 EXECUTION PROTOCOL

### PHASE 1: COMPONENT DIAGNOSTIC (Read-Only)

**Objetivo**: Evaluar la separación UI/lógica y el consumo correcto de módulos.

#### 1.1 Page Structure Scan
```
src/pages/admin/[domain]/[feature]/
├── page.tsx                 ← Main page component (orchestrator)
├── components/              ← Page-specific components
│   ├── SectionA.tsx
│   ├── SectionB.tsx
│   └── __tests__/
├── hooks/                   ← Page-specific UI hooks ONLY
│   └── usePageName.ts       (orchestration, local UI state)
└── config/                  ← Page-specific config
    └── constants.ts
```

#### 1.2 Anti-Patterns Scan
Buscar en el archivo de la página y componentes relacionados:

**❌ Critical Anti-Patterns (Pages)**:
- [ ] **Acceso directo a Supabase** (`import { supabase }`)
- [ ] **Lógica de negocio inline** (cálculos, validaciones complejas)
- [ ] **Data fetching con `useEffect`** (debe usar TanStack Query)
- [ ] **Server state en `useState`** (items, listas de DB)
- [ ] **Componente >500 líneas** (God Component)
- [ ] **Native math operators** en cualquier cálculo
- [ ] **Hooks de dominio** en `src/pages/.../hooks/` (debe estar en modules)

**⚠️ Medium Anti-Patterns (Components)**:
- [ ] **Inline event handlers en loops** (`onClick={() => handler(item)}`)
- [ ] **Componentes sin memo** cuando reciben props complejas
- [ ] **Context sin memoización** de values
- [ ] **Missing displayName** en componentes memoizados
- [ ] **Props drilling** excesivo (>3 niveles)
- [ ] **Mixing presentation with logic** en mismo componente

#### 1.3 Module Consumption Analysis
- [ ] **Imports correctos**: Solo de `@/modules/`, no de otros pages
- [ ] **No duplicación**: No re-implementa lógica que existe en módulos
- [ ] **Hooks usage**: Usa hooks exportados por módulos
- [ ] **No direct access**: No accede a stores/services directamente sin exports

#### 1.4 Diagnostic Report Output
```markdown
## Diagnostic Report: [page-path]

### ✅ Strengths
- [Listar aspectos bien implementados]

### ❌ Critical Issues
1. [Issue ID] [Component]: [Description]
2. ...

### ⚠️ Improvements Needed
1. [Issue ID] [Component]: [Description]
2. ...

### 📊 Metrics
- Page LOC: X
- Components: X
- Critical Issues: X
- Medium Issues: X
- Module Dependencies: [list]
```

---

### PHASE 2: CRITICAL REFACTORING (High Impact)

**Priority 1: Separation of Concerns**

#### 2.1 Extract Business Logic to Modules
**OBLIGATORIO**: NO lógica de negocio en pages

Identificar y mover:
- [ ] **Cálculos complejos** → `src/modules/[module]/services/*Engine.ts`
- [ ] **Validaciones** → `src/modules/[module]/services/*Validator.ts`
- [ ] **Data transformations** → `src/modules/[module]/utils/`
- [ ] **Domain hooks** → `src/modules/[module]/hooks/`

```typescript
// ❌ ANTES: Lógica en page
// src/pages/admin/sales/pos/page.tsx
const POSPage = () => {
  const [products, setProducts] = useState([]);
  
  // ❌ Cálculo de negocio en la página
  const calculateDiscount = (items: Item[], coupon: string) => {
    const rate = coupons[coupon]?.rate || 0;
    return items.reduce((total, item) => 
      total + (item.price * item.quantity * rate), 0
    );
  };
  
  // ❌ Data fetching manual
  useEffect(() => {
    const loadProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      setProducts(data);
    };
    loadProducts();
  }, []);
  
  // ...
};

// ✅ DESPUÉS: Solo composición en page
// src/pages/admin/sales/pos/page.tsx
import { useProducts } from '@/modules/sales/hooks/useProducts';
import { useDiscount } from '@/modules/sales/hooks/useDiscount';

const POSPage = () => {
  // Solo consume hooks de módulos
  const { data: products, isLoading } = useProducts();
  const { calculateDiscount } = useDiscount();

  if (isLoading) return <LoadingSpinner />;

  return (
    <ContentLayout title="Punto de Venta">
      <ProductGrid products={products} />
      <Cart />
      <DiscountPanel onApply={calculateDiscount} />
    </ContentLayout>
  );
};
```

#### 2.2 Remove Direct Database Access
**OBLIGATORIO**: Eliminar imports de Supabase en pages

- [ ] Buscar `import { supabase }` o `import supabase`
- [ ] Buscar queries directas: `.from()`, `.select()`, `.insert()`
- [ ] Reemplazar con hooks de módulos que usan TanStack Query

```typescript
// ❌ ANTES
import { supabase } from '@/lib/supabase';

const [data, setData] = useState([]);
useEffect(() => {
  supabase.from('orders').select('*').then(({ data }) => setData(data));
}, []);

// ✅ DESPUÉS
import { useOrders } from '@/modules/sales/hooks/useOrders';

const { data, isLoading } = useOrders();
```

#### 2.3 Replace useState with TanStack Query
**OBLIGATORIO**: Server state debe usar TanStack Query

- [ ] Identificar `useState` que contiene data de servidor
- [ ] Identificar `useEffect` con fetching
- [ ] Reemplazar con hooks de módulos

```typescript
// ❌ ANTES: Manual state management
const [items, setItems] = useState<Item[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  const fetchItems = async () => {
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  fetchItems();
}, []);

// ✅ DESPUÉS: TanStack Query via module hook
const { data: items, isLoading, error } = useItems();
```

**Priority 2: Component Architecture**

#### 2.4 Decompose God Components
Componentes >500 líneas o >200 líneas con lógica compleja:

- [ ] Identificar bloques lógicos (Header, Content, Footer)
- [ ] Extraer a sub-componentes
- [ ] Mover a carpeta `components/`

```typescript
// ❌ ANTES: God Component (600 líneas)
const ProductPage = () => {
  // 600 líneas de JSX y lógica
  return (
    <div>
      {/* 100 líneas de header */}
      {/* 200 líneas de form */}
      {/* 150 líneas de table */}
      {/* 150 líneas de modals */}
    </div>
  );
};

// ✅ DESPUÉS: Composición de componentes
const ProductPage = () => {
  const pageState = useProductPage(); // Orchestration hook
  
  return (
    <ContentLayout>
      <ProductHeader {...pageState.header} />
      <ProductForm {...pageState.form} />
      <ProductTable {...pageState.table} />
      <ProductModals {...pageState.modals} />
    </ContentLayout>
  );
};

// components/ProductHeader.tsx (50 líneas)
// components/ProductForm.tsx (150 líneas)
// components/ProductTable.tsx (120 líneas)
// components/ProductModals.tsx (80 líneas)
```

#### 2.5 Extract Inline Event Handlers
**OBLIGATORIO en loops**: No arrow functions inline

```typescript
// ❌ ANTES: Inline handlers en map
{items.map(item => (
  <ItemCard 
    key={item.id}
    item={item}
    onClick={() => handleClick(item.id)}  // ← Nueva función cada render
    onDelete={() => handleDelete(item.id)} // ← Nueva función cada render
  />
))}

// ✅ DESPUÉS Opción A: Handler genérico + componente inteligente
// Componente padre
const handleAction = useCallback((id: string, action: 'click' | 'delete') => {
  if (action === 'click') handleClick(id);
  if (action === 'delete') handleDelete(id);
}, []);

{items.map(item => (
  <ItemCard 
    key={item.id}
    itemId={item.id}
    item={item}
    onAction={handleAction}  // ← Misma referencia
  />
))}

// Componente ItemCard
const ItemCard = memo(({ itemId, item, onAction }) => {
  return (
    <Card onClick={() => onAction(itemId, 'click')}>
      {/* ... */}
      <Button onClick={() => onAction(itemId, 'delete')}>Delete</Button>
    </Card>
  );
});
```

**Priority 3: Performance Optimization**

#### 2.6 Memoization Strategy
- [ ] **React.memo** para componentes que reciben props complejas
- [ ] **useCallback** para event handlers pasados como props
- [ ] **useMemo** para cálculos costosos (no para todo)
- [ ] **displayName** en todos los componentes memoizados

```typescript
// ❌ ANTES: Sin memoización
const ItemCard = ({ item, onDelete }) => {
  return <Card>{/* ... */}</Card>;
};

// ✅ DESPUÉS: Con memoización apropiada
export const ItemCard = memo<ItemCardProps>(({ item, onDelete }) => {
  return <Card>{/* ... */}</Card>;
});

ItemCard.displayName = 'ItemCard';

// En el padre
const handleDelete = useCallback((id: string) => {
  // Delete logic
}, []);
```

#### 2.7 Context Optimization
Si la página usa Context:

- [ ] Memoizar `value` del Provider
- [ ] Split contexts (state vs actions)
- [ ] Usar `useShallow` si es store de Zustand

```typescript
// ❌ ANTES: Context sin memo
const MyProvider = ({ children }) => {
  const [state, setState] = useState(initial);
  
  return (
    <MyContext.Provider value={{ state, setState }}>  {/* ← Nuevo objeto cada render */}
      {children}
    </MyContext.Provider>
  );
};

// ✅ DESPUÉS: Context memoizado
const MyProvider = ({ children }) => {
  const [state, setState] = useState(initial);
  
  const value = useMemo(() => ({ state, setState }), [state]);
  
  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
};
```

---

### PHASE 3: PAGE-SPECIFIC REFACTORING

#### 3.1 Page-Level Hooks
Hooks en `src/pages/.../hooks/` deben ser SOLO para orquestación de UI:

```typescript
// ✅ CORRECTO: Hook de orquestación de página
// src/pages/admin/sales/pos/hooks/usePOSPage.ts
export function usePOSPage() {
  // 1. Consume hooks de módulos (lógica de dominio)
  const { data: products } = useProducts();
  const { calculateTotal } = useOrderCalculation();
  const { submitOrder } = useOrderSubmission();
  
  // 2. Estado UI local (específico de esta página)
  const [selectedTab, setSelectedTab] = useState<'products' | 'cart'>('products');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // 3. Handlers UI (orquestación)
  const handleCheckout = useCallback(() => {
    setIsCheckoutOpen(true);
  }, []);
  
  const handleTabChange = useCallback((tab: string) => {
    setSelectedTab(tab as 'products' | 'cart');
  }, []);
  
  return {
    // UI State
    selectedTab,
    isCheckoutOpen,
    
    // UI Actions
    handleTabChange,
    handleCheckout,
    
    // Domain Data (from modules)
    products,
    calculateTotal,
    submitOrder,
  };
}
```

#### 3.2 Component Composition
Preferir composición sobre props drilling:

```typescript
// ❌ ANTES: Props drilling
<ParentComponent>
  <ChildA prop1={x} prop2={y} prop3={z} />
  <ChildB prop1={x} prop2={y} prop3={z} />
  <ChildC prop1={x} prop2={y} prop3={z} />
</ParentComponent>

// ✅ DESPUÉS: Context o Composition
<PageProvider value={{ x, y, z }}>
  <ChildA />
  <ChildB />
  <ChildC />
</PageProvider>

// O usar Compound Components
<ProductForm>
  <ProductForm.Header />
  <ProductForm.Body />
  <ProductForm.Actions />
</ProductForm>
```

#### 3.3 Form State Management
Formularios complejos:

- [ ] Usar `react-hook-form` para estado de formulario
- [ ] Validación en módulo (no en componente)
- [ ] Submit handler llama a módulo

```typescript
// ✅ CORRECTO
import { useForm } from 'react-hook-form';
import { useProductForm } from '@/modules/products/hooks/useProductForm';

const ProductFormPage = () => {
  const { register, handleSubmit, formState } = useForm();
  const { submitProduct, isSubmitting } = useProductForm();
  
  const onSubmit = handleSubmit(async (data) => {
    await submitProduct(data); // ← Lógica en módulo
  });
  
  return (
    <form onSubmit={onSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

---

### PHASE 4: CODE QUALITY

#### 4.1 TypeScript
- [ ] Props interfaces definidas
- [ ] No `any` types
- [ ] Componentes tipados correctamente

```typescript
// ✅ CORRECTO
interface ProductCardProps {
  product: Product;
  onSelect: (id: string) => void;
  isSelected?: boolean;
}

export const ProductCard = memo<ProductCardProps>(({ 
  product, 
  onSelect, 
  isSelected = false 
}) => {
  // Implementation
});
```

#### 4.2 Accessibility
- [ ] Botones tienen aria-label si no tienen texto
- [ ] Inputs tienen labels asociados
- [ ] Modal tiene focus trap
- [ ] Keyboard navigation funciona

#### 4.3 Error Boundaries
Páginas complejas deben tener Error Boundary:

```typescript
const ProductPage = () => {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <ProductPageContent />
    </ErrorBoundary>
  );
};
```

---

### PHASE 5: VERIFICATION

#### 5.1 Compilation Check
```bash
pnpm run typecheck
```

#### 5.2 Visual Regression Test
- [ ] La página se ve igual que antes
- [ ] Todas las interacciones funcionan
- [ ] No hay errores en console

#### 5.3 Performance Check
```typescript
// React DevTools Profiler
// Verificar que:
// - Componentes no re-renderizan innecesariamente
// - Listas grandes usan virtualización si es necesario
```

---

## 📝 OUTPUT FORMAT

Para cada cambio:

```markdown
### [File Path]
**Issue ID**: [e.g., 4.2 - Business Logic in Page]
**Action Taken**: [Description]
**Verification**: [How you verified it works]

Example:
### src/pages/admin/sales/pos/page.tsx
**Issue ID**: 4.2 - Business Logic in Page
**Action Taken**: Extracted discount calculation to useDiscount hook in sales module
**Verification**: ✅ Page compiles, discount calculation works identically, UI unchanged
```

---

## ⚠️ CRITICAL RULES (PAGES)

1. **NEVER** poner lógica de negocio en pages. Moverla a módulos.
2. **NEVER** acceder a Supabase directamente. Usar hooks de módulos.
3. **NEVER** usar `useState` para server data. Usar TanStack Query vía módulos.
4. **NEVER** crear hooks de dominio en `src/pages/`. Van en `src/modules/`.
5. **ALWAYS** importar SOLO de `@/modules/`, nunca de otros pages.
6. **ALWAYS** usar memoización (memo, useCallback) apropiadamente.
7. **ALWAYS** extraer componentes >200 líneas.
8. **ALWAYS** verificar que la UI funciona igual después del refactor.

---

## 📖 PAGE-SPECIFIC PATTERNS

### Pattern: Page Orchestration Hook
La página usa UN hook que orquesta todo:

```typescript
// Página limpia y declarativa
const MyPage = () => {
  const state = useMyPage();
  
  if (state.isLoading) return <LoadingSpinner />;
  if (state.error) return <ErrorMessage error={state.error} />;
  
  return (
    <ContentLayout>
      <Header {...state.header} />
      <Content {...state.content} />
      <Actions {...state.actions} />
    </ContentLayout>
  );
};
```

### Pattern: Compound Components
Para componentes complejos con sub-partes:

```typescript
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Actions>
      <Button>Action</Button>
    </Card.Actions>
  </Card.Header>
  <Card.Body>
    {/* Content */}
  </Card.Body>
  <Card.Footer>
    {/* Footer */}
  </Card.Footer>
</Card>
```

### Pattern: Lazy Loading
Para páginas/componentes pesados:

```typescript
// En route config
{
  path: '/admin/reports',
  component: lazy(() => import('./pages/admin/reports/page')),
}

// En componente
const HeavyChart = lazy(() => import('./components/HeavyChart'));

<Suspense fallback={<ChartSkeleton />}>
  <HeavyChart data={data} />
</Suspense>
```

---

**Ready to start? Provide the target page path in `src/pages/`.**
