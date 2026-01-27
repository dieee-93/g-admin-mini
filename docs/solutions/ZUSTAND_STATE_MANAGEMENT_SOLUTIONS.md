# Soluciones: Gestión de Estado con Zustand + TanStack Query

**Última actualización**: 17/12/2025  
**Estado**: ✅ TanStack Query implementado en el proyecto

Este documento detalla las soluciones para los anti-patterns detectados en la gestión de estado con Zustand.

---

# Solución: Mezcla de Server State con Client State

## Código de referencia: 1.2

## Categoría de impacto
**CRÍTICO** - Esta es la causa #1 de bugs de sincronización, condiciones de carrera, y complejidad innecesaria.

## Estado en el proyecto
✅ **RESUELTO en Cash Module** - Ver `CASH_MODULE_TANSTACK_QUERY_MIGRATION.md` para implementación de referencia  
⏳ **PENDIENTE**: Materials, Sales, Products, Suppliers modules

## Descripción del anti-pattern

El store de Zustand se utiliza para almacenar datos que provienen del servidor (como listas de productos, clientes, sesiones) junto con el estado de la UI.

```typescript
// ❌ INCORRECTO: Antes de la migración
export interface CashState {
  // Server State (NO debería estar aquí)
  moneyLocations: MoneyLocationWithAccount[];  // ← Viene de DB
  activeSessions: CashSessionRow[];            // ← Viene de DB
  sessionHistory: CashSessionRow[];            // ← Viene de DB
  loading: boolean;
  error: string | null;
  
  // Client State (UI) - Esto SÍ está bien
  selectedLocationId: string | null;
  isModalOpen: boolean;
}
```

## Por qué es un problema

**Fuente 1: TkDodo (Maintainer de TanStack Query)**
> "Client State and Server State are different. Server State is stored remotely, potentiality outdated, shared by many, and needs asynchronous APIs. Client State is synchronous, local, and owned by the client. Mixing them leads to reinventing caching logic."
- Fuente: "Practical React Query"
- URL: https://tkdodo.eu/blog/practical-react-query

**Fuente 2: Zustand Documentation**
> "If you want to fetch data from an API, consider using a data fetching library like TanStack Query or SWR. Zustand is for client state."
- Fuente: Zustand Docs - Flux inspired practice
- URL: https://zustand-demo.pmnd.rs/

## Solución recomendada ✅ IMPLEMENTADA

Separar responsabilidades usando el patrón implementado en Cash Module:

1.  **TanStack Query:** Para todo el estado del servidor (caching, loading, error, revalidation).
2.  **Zustand:** Solo para estado global de UI (filtros, modales, selección).
3.  **Custom Hooks (Facade):** Combinan ambos para API limpia.

### Código correcto (Implementación Real del Proyecto)

```typescript
// ✅ CORRECTO - Patrón implementado en Cash Module

// 1. React Query Hooks para Server State
// src/modules/cash/hooks/useCashSessions.ts

export const cashSessionsKeys = {
  all: ['cash', 'sessions'] as const,
  active: (locationId?: string) => [...cashSessionsKeys.all, 'active', locationId] as const,
};

export function useActiveCashSession(moneyLocationId?: string) {
  return useQuery({
    queryKey: cashSessionsKeys.active(moneyLocationId),
    queryFn: async () => {
      if (!moneyLocationId) return null;
      return await getActiveCashSession(moneyLocationId);
    },
    enabled: !!moneyLocationId,
    staleTime: 2 * 60 * 1000,  // 2 min
  });
}

export function useOpenCashSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: OpenCashSessionInput) => {
      return await openCashSession(input, userId);
    },
    onSuccess: (session) => {
      // Invalidate cache automatically
      queryClient.invalidateQueries({ 
        queryKey: cashSessionsKeys.active(session.money_location_id) 
      });
      notify.success({ title: 'Caja abierta' });
    },
  });
}

// 2. Zustand solo para UI State
// src/store/cashStore.ts

export interface CashUIState {
  selectedLocationId: string | null;
  isSessionModalOpen: boolean;
  filters: {
    dateRange: { from: Date | null; to: Date | null };
    status: 'OPEN' | 'CLOSED' | null;
  };
  actions: {
    selectLocation: (locationId: string | null) => void;
    openSessionModal: () => void;
    closeSessionModal: () => void;
  };
}

const useCashUIStore = create<CashUIState>()(
  devtools((set) => ({
    selectedLocationId: null,
    isSessionModalOpen: false,
    filters: { dateRange: { from: null, to: null }, status: null },
    actions: {
      selectLocation: (locationId) => set({ selectedLocationId: locationId }),
      openSessionModal: () => set({ isSessionModalOpen: true }),
      closeSessionModal: () => set({ isSessionModalOpen: false }),
    }
  }), { name: 'CashUIStore' })
);

// Atomic selectors (best practice)
export const useSelectedLocationId = () => useCashUIStore(state => state.selectedLocationId);
export const useIsSessionModalOpen = () => useCashUIStore(state => state.isSessionModalOpen);
export const useCashUIActions = () => useCashUIStore(state => state.actions);

// 3. Facade Hook (combines both)
// src/modules/cash-management/hooks/useCashSession.ts

export function useCashSession() {
  // UI state from Zustand
  const selectedLocationId = useSelectedLocationId();
  const uiActions = useCashUIActions();
  
  // Server state from React Query
  const { 
    data: activeCashSession, 
    isLoading 
  } = useActiveCashSession(selectedLocationId || undefined);
  
  const openMutation = useOpenCashSession();

  return {
    activeCashSession,
    loading: isLoading,
    openCashSession: openMutation.mutateAsync,
    isOpening: openMutation.isPending,
    ...uiActions,
  };
}
```

### Uso en componentes

```typescript
// Componente consume facade hook
function CashPage() {
  const { 
    activeCashSession, 
    loading, 
    openCashSession, 
    isOpening 
  } = useCashSession();

  if (loading) return <Spinner />;

  return (
    <div>
      {activeCashSession ? (
        <SessionDetails session={activeCashSession} />
      ) : (
        <Button 
          onClick={() => openCashSession({ 
            money_location_id: 'loc-123',
            starting_cash: 1000 
          })}
          isLoading={isOpening}
        >
          Abrir Sesión
        </Button>
      )}
    </div>
  );
}
```
  selectedProductId: string | null;
  
  setFilters: (filters: ProductFilters) => void;
  setSelectedProduct: (id: string | null) => void;
}

export const useProductsUIStore = create<ProductsUIState>((set) => ({
  filters: defaultFilters,
  viewMode: 'grid',
  selectedProductId: null,
  
  setFilters: (filters) => set({ filters }),
  setSelectedProduct: (id) => set({ selectedProductId: id }),
}));
```

### Explicación

Al separar los estados:
- **TanStack Query** maneja automáticamente: reintentos, deduplicación de requests, invalidación de caché y estados de carga (`isLoading`, `isError`).
- **Zustand** se vuelve mucho más ligero y predecible, manejando solo lo que es síncrono y local.

## Patrón de refactoring

### Paso 1: Identificar Server State
Busca campos como `items`, `list`, `data`, `isLoading`, `error` en el store.

### Paso 2: Crear Query Hook
Mueve la lógica de obtención de datos a un hook `useQuery`.

```typescript
// Antes (en componente)
const { fetchProducts, products, isLoading } = useStore();
useEffect(() => { fetchProducts() }, []);

// Después (en componente)
const { data: products, isLoading } = useProducts();
```

### Paso 3: Limpiar Store
Elimina los campos de datos y las acciones de fetching del store. Mantén solo selectores, filtros o estado de UI.

## Casos edge a considerar

1.  **Datos necesarios en múltiples lugares:** TanStack Query cachea por `queryKey`, así que llamar `useProducts()` en 5 componentes diferentes no dispara 5 requests (si están dentro del `staleTime`).
2.  **Persistencia:** Si necesitas persistir datos offline, TanStack Query tiene `persistQueryClient`. No uses `zustand/persist` para datos del servidor a menos que sea estrictamente necesario y entiendas los riesgos de datos obsoletos.

---

# Solución: CRUD Operations en Stores

## Código de referencia: 1.3

## Categoría de impacto
**ALTO** - Viola el principio de responsabilidad única, dificulta el testing y acopla la UI a la implementación específica de la API.

## Descripción del anti-pattern

Stores que contienen lógica asíncrona para Crear, Leer, Actualizar y Eliminar (CRUD) datos, a menudo llamando directamente a APIs o servicios.

```typescript
// ❌ INCORRECTO: src/store/customersStore.ts
export const useCustomersStore = create((set, get) => ({
  addCustomer: async (customerData) => {
    set({ loading: true });
    try {
      // Lógica de negocio y llamada API dentro del store
      const newCustomer = await api.create(customerData);
      set(state => ({ 
        customers: [...state.customers, newCustomer],
        loading: false 
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  // ... updateCustomer, deleteCustomer
}));
```

## Por qué es un problema

**Fuente 1: Daishi Kato (Zustand Creator)**
> "Zustand is unopinionated, but keeping actions synchronous makes state predictable. Async actions are better handled outside or via simple wrappers."
- Contexto: Discusiones sobre best practices en React state.

**Fuente 2: Separation of Concerns**
La lógica de negocio (validación, llamadas API, manejo de errores de red) no pertenece al gestor de estado. El store solo debe saber *cómo actualizarse* cuando recibe datos, no *cómo obtenerlos*.

## Solución recomendada

Usar **Custom Hooks** que orquesten las mutaciones usando `useMutation` de TanStack Query (o similar). El store se actualiza como un efecto secundario (si es necesario) o simplemente invalidando la query.

### Código correcto

```typescript
// ✅ CORRECTO: src/hooks/mutations/useCustomerMutations.ts
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  // Opcional: si necesitas actualizar UI state global (ej: cerrar modal)
  const closeModal = useCustomersUIStore(s => s.closeModal);

  return useMutation({
    mutationFn: (data: CustomerData) => customerService.create(data),
    onSuccess: () => {
      // 1. Invalidar caché para refetch automático
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      // 2. Actualizar UI state si es necesario
      closeModal();
      toast.success('Cliente creado');
    }
  });
};
```

### Explicación

- La lógica asíncrona vive en el hook de mutación.
- El éxito/error se maneja con callbacks (`onSuccess`, `onError`).
- El estado local se actualiza invalidando queries (la verdad única es el servidor).

## Patrón de refactoring

### Paso 1: Extraer lógica async
Saca la lógica async del store y ponla en una función de servicio (`src/services/customerService.ts`).

### Paso 2: Crear Mutation Hook
Crea un hook que use `useMutation` y llame al servicio.

### Paso 3: Reemplazar uso en componentes

```typescript
// Antes
const addCustomer = useStore(s => s.addCustomer);
<button onClick={() => addCustomer(data)} />

// Después
const { mutate: addCustomer } = useCreateCustomer();
<button onClick={() => addCustomer(data)} />
```

---

# Solución: Falta de Atomic Selectors

## Código de referencia: 1.6

## Categoría de impacto
**ALTO** - Causa re-renders innecesarios masivos ("over-rendering"), degradando la performance de la aplicación.

## Descripción del anti-pattern

Suscribirse al store completo o a porciones grandes del estado sin usar selectores específicos. Esto causa que el componente se re-renderice cada vez que *cualquier* parte del store cambia, incluso si los datos que usa el componente no cambiaron.

```typescript
// ❌ INCORRECTO
const ProductGrid = () => {
  // Se re-renderiza si cambia 'filters', 'isModalOpen', 'error', etc.
  const { products } = useProductsStore(); 
  
  // O destructurando del estado completo
  const store = useProductsStore();
  const products = store.products;
  
  return <div>...</div>;
};
```

## Por qué es un problema

**Fuente 1: Zustand Docs - Auto Generating Selectors**
> "If you don't use selectors, the component will re-render on every state change. Selectors allow you to subscribe to a specific part of the state."
- Fuente: Zustand Documentation

**Fuente 2: React Performance Best Practices**
Minimizar re-renders es clave. Suscribirse a más estado del necesario es la causa #1 de problemas de performance en apps React grandes.

## Solución recomendada

Siempre usar selectores atómicos o `useShallow` para objetos.

### Código correcto

```typescript
// ✅ OPCIÓN A: Selector Atómico (Recomendado para valores primitivos)
const products = useProductsStore((state) => state.products);

// ✅ OPCIÓN B: useShallow (Para múltiples valores)
import { useShallow } from 'zustand/react/shallow';

const { products, isLoading } = useProductsStore(
  useShallow((state) => ({
    products: state.products,
    isLoading: state.isLoading,
  }))
);

// ✅ OPCIÓN C: Selectores Pre-definidos (Best Practice para equipos grandes)
// En el archivo del store:
export const useProducts = () => useProductsStore(s => s.products);
export const useProductsLoading = () => useProductsStore(s => s.isLoading);

// En el componente:
const products = useProducts();
```

### Explicación

- **Selector Atómico:** Zustand compara el resultado del selector (`===`). Si el array `products` es la misma referencia, no re-renderiza.
- **useShallow:** Realiza una comparación superficial (shallow equality) del objeto retornado. Útil cuando necesitas extraer varias propiedades a la vez sin causar re-renders si otras propiedades cambian.

## Patrón de refactoring

### Paso 1: Identificar usos incorrectos
Busca `useStore()` sin argumentos o destructuring directo del resultado de `useStore()`.

### Paso 2: Aplicar selectores
Cambia `const { a, b } = useStore()` por `useStore(useShallow(s => ({ a: s.a, b: s.b })))` o llamadas individuales.

## Validación

Usa las **React DevTools** con la opción "Highlight updates when components render" activada. Interactúa con una parte del store (ej: abre un modal) y verifica que los componentes que no dependen de ese dato (ej: una lista de productos) no se iluminen (no re-rendericen).

---

# Solución: Uso de `immer` middleware sin wrapper

## Código de referencia: 1.1

## Categoría de impacto
**ALTO** - Puede romper la reactividad de Zustand si se muta el estado incorrectamente fuera del ciclo de vida controlado por el middleware, o causar inconsistencias de tipos.

## Descripción del anti-pattern

Importar `produce` de `immer` manualmente dentro de las acciones del store en lugar de configurar el middleware `immer` a nivel del store. O usar el middleware pero con una sintaxis incorrecta que confunde a TypeScript o a otros middlewares.

```typescript
// ❌ INCORRECTO: Uso manual propenso a errores
import { produce } from 'immer';

const useStore = create((set) => ({
  nested: { count: 0 },
  inc: () => set(produce((state) => {
    state.nested.count += 1; // Mutación manual
  })),
}));
```

## Por qué es un problema

**Fuente 1: Zustand Middleware Docs**
El middleware de `immer` simplifica drásticamente el código y asegura que las mutaciones se manejen correctamente dentro del flujo de `setState` de Zustand. Usarlo manualmente añade boilerplate innecesario y riesgo de error (ej: olvidar el return o envolver mal).

## Solución recomendada

Usar el middleware `immer` en la definición del store. Esto permite escribir mutaciones directas en todas las acciones sin importar `produce` cada vez.

### Código correcto

```typescript
// ✅ CORRECTO: Middleware configurado
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface State {
  nested: { count: number };
  inc: () => void;
}

export const useStore = create<State>()(
  immer((set) => ({
    nested: { count: 0 },
    
    // Ahora 'set' acepta una función que recibe el draft directamente
    inc: () => set((state) => {
      state.nested.count += 1; // ✅ Mutación directa permitida y segura
    }),
  }))
);
```

### Explicación

El middleware `immer` intercepta las llamadas a `set`. Si pasas una función, te da un `draft` (proxy) que puedes mutar. Zustand se encarga de finalizar el draft y notificar los cambios inmutables.

## Patrón de refactoring

### Paso 1: Configurar Middleware
Envuelve tu creador de estado con `immer(...)`.

```typescript
// Antes
create<State>((set) => ({ ... }))

// Después
create<State>()(immer((set) => ({ ... })))
```

### Paso 2: Actualizar Actions
Elimina `import { produce } from 'immer'` y simplifica los `set`.

```typescript
// Antes
updateUser: (user) => set(produce(state => { state.user = user }))

// Después
updateUser: (user) => set((state) => { state.user = user })
```

## Validación

- Verifica que TypeScript infiera correctamente el tipo `WritableDraft<State>` dentro de los setters.
- Verifica que los cambios profundos en objetos disparen re-renders en los componentes suscritos.

---

## Validación General

Para asegurar que estas soluciones se han implementado correctamente en todo el proyecto:

1.  **Auditoría de Stores:** Ningún store debe importar `axios`, `fetch` o clientes de API directamente.
2.  **React Query DevTools:** Deben mostrar queries activas para los datos del servidor.
3.  **Profiler:** Navegar por la app no debe causar \"flashing\" masivo en las DevTools de React (indicador de selectores atómicos funcionando).
4.  **TypeScript:** No debe haber errores de tipos en los `set` de los stores usando Immer.

## Estado de Implementación (17/12/2025)

### ✅ Módulos Migrados a TanStack Query

| Módulo | Estado | Hooks | Documentación |
|--------|--------|-------|---------------|
| **Cash** | ✅ Completo | 16 hooks (10 queries + 6 mutations) | `CASH_MODULE_TANSTACK_QUERY_MIGRATION.md` |

### ⏳ Módulos Pendientes

| Módulo | Prioridad | Complejidad | Estimación |
|--------|-----------|-------------|------------|
| Materials | Alta | Media | 2-3 días |
| Suppliers | Media | Baja | 1-2 días |
| Products | Alta | Media | 2-3 días |
| Sales | Alta | Alta | 3-4 días |
| Customers | Media | Baja | 1-2 días |

### 📚 Referencias de Implementación

**Código de Referencia**:
- `src/modules/cash/hooks/useMoneyLocations.ts` - Queries y mutations
- `src/modules/cash/hooks/useCashSessions.ts` - Optimistic updates
- `src/store/cashStore.ts` - Zustand UI-only
- `src/modules/cash-management/hooks/useCashSession.ts` - Facade pattern

**Documentación**:
- `CASH_MODULE_TANSTACK_QUERY_MIGRATION.md` - Plan técnico completo
- `MASTER_REFACTORING_PROMPT.md` v2.0 - Protocolo actualizado
- `ZUSTAND_ARCHITECTURE_BEST_PRACTICES.md` - Guía arquitectónica

## Esfuerzo estimado

**ACTUALIZADO** (basado en migración de Cash Module):

- **Refactorizar Store a TanStack Query:** 2-3 días por módulo (con Cash como referencia)
- **Implementar Selectores:** 1 día. Puede hacerse incrementalmente.
- **Corregir Immer:** < 1 día. Es principalmente sintáctico.
- **Testing e integración:** 1 día por módulo
