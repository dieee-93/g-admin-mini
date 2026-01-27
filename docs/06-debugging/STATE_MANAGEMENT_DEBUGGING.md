# State Management Debugging Guide

## Índice

1. [Context API Debugging](#1-context-api-debugging)
2. [Redux Debugging](#2-redux-debugging)
3. [Zustand Debugging](#3-zustand-debugging)
4. [TanStack Query Debugging](#4-tanstack-query-debugging)
5. [Otros: Jotai y Valtio](#5-otros-jotai-y-valtio)

---

## 1. Context API Debugging

### 1.1 Provider Hierarchy Debugging

#### Problema: Context no disponible
```javascript
// ❌ Problema: Componente fuera del Provider
function MyComponent() {
  const value = useContext(MyContext); // undefined o error
  return <div>{value}</div>;
}

// ✅ Solución: Verificar jerarquía
function App() {
  return (
    <MyContext.Provider value={someValue}>
      <MyComponent /> {/* Ahora tiene acceso */}
    </MyContext.Provider>
  );
}
```

#### Debugging con React DevTools
1. Instalar React DevTools Extension
2. Buscar `Context.Provider` en el árbol de componentes
3. Verificar el `value` prop en DevTools
4. Confirmar que los consumers están dentro del Provider

#### Multiple Context Providers
```javascript
function App() {
  const [theme, setTheme] = useState('dark');
  const [currentUser, setCurrentUser] = useState({ name: 'Taylor' });

  return (
    <ThemeContext.Provider value={theme}>
      <AuthContext.Provider value={currentUser}>
        <Page />
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
```

**Debugging Tips:**
- Usa nombres descriptivos en `createContext(defaultValue)`
- Asigna `displayName` a Context para DevTools:
  ```javascript
  const MyContext = createContext(null);
  MyContext.displayName = 'MyContext'; // Aparece en DevTools
  ```

---

### 1.2 Performance Issues con Context

#### Problema: Re-renders innecesarios

**Caso 1: Objeto nuevo en cada render**
```javascript
// ❌ Problema: value crea nuevo objeto cada vez
function MyApp() {
  const [currentUser, setCurrentUser] = useState(null);
  
  function login(response) {
    storeCredentials(response.credentials);
    setCurrentUser(response.user);
  }
  
  return (
    <AuthContext.Provider value={{ currentUser, login }}>
      <Page />
    </AuthContext.Provider>
  );
}
```

**Solución: Memoizar valores**
```javascript
// ✅ Optimizado con useCallback y useMemo
import { useCallback, useMemo } from 'react';

function MyApp() {
  const [currentUser, setCurrentUser] = useState(null);
  
  const login = useCallback((response) => {
    storeCredentials(response.credentials);
    setCurrentUser(response.user);
  }, []);
  
  const contextValue = useMemo(() => ({
    currentUser,
    login
  }), [currentUser, login]);
  
  return (
    <AuthContext.Provider value={contextValue}>
      <Page />
    </AuthContext.Provider>
  );
}
```

**Debugging Performance:**
```javascript
// Agregar logging para detectar re-renders
function Greeting({ name }) {
  console.log("Greeting renderizado:", new Date().toLocaleTimeString());
  const theme = useContext(ThemeContext);
  return <h3 className={theme}>Hello, {name}!</h3>;
}
```

---

### 1.3 Prevención de Re-renders Innecesarios

#### Técnica 1: React.memo
```javascript
// memo NO previene re-renders por cambios en Context
const Greeting = memo(function Greeting({ name }) {
  console.log("Renderizado:", new Date().toLocaleTimeString());
  const theme = useContext(ThemeContext); // Esto causa re-render
  return <h3 className={theme}>Hello, {name}!</h3>;
});
```

**Importante:** `memo` solo previene re-renders por cambios en props, NO por cambios en Context.

#### Técnica 2: Dividir Contexts
```javascript
// ❌ Un Context grande causa re-renders frecuentes
const AppContext = createContext({ theme, user, settings, ... });

// ✅ Dividir en Contexts separados
const ThemeContext = createContext('light');
const UserContext = createContext(null);
const SettingsContext = createContext({});
```

#### Técnica 3: Selector Pattern
```javascript
// Crear custom hook con selector
function useAuthSelector(selector) {
  const context = useContext(AuthContext);
  return selector(context);
}

// Uso
function UserName() {
  // Solo re-renderiza cuando cambia userName
  const userName = useAuthSelector(state => state.user.name);
  return <div>{userName}</div>;
}
```

---

### 1.4 Debugging useEffect Dependencies con Context

```javascript
// Problema: useEffect se ejecuta inesperadamente
function Component() {
  const { serverUrl, roomId } = useContext(ConnectionContext);
  
  useEffect(() => {
    // Se ejecuta más de lo esperado
  }, [serverUrl, roomId]);
  
  // Debug: Log dependencies
  console.log([serverUrl, roomId]);
}
```

**Técnica de Debugging:**
```javascript
// En consola del navegador
temp1 = [serverUrl, roomId]; // Guardar primera ejecución
// ... después del re-render
temp2 = [serverUrl, roomId]; // Guardar segunda ejecución

// Comparar elemento por elemento
Object.is(temp1[0], temp2[0]); // false = cambió
Object.is(temp1[1], temp2[1]); // true = no cambió
```

---

## 2. Redux Debugging

### 2.1 Redux DevTools - Instalación Completa

#### Paso 1: Instalar Browser Extension
- **Chrome:** [Redux DevTools Extension](https://chrome.google.com/webstore/detail/redux-devtools)
- **Firefox:** [Redux DevTools Extension](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)
- **Edge:** Disponible en Chrome Web Store

#### Paso 2: Instalar npm Package
```bash
npm install --save redux-devtools-extension
# o
yarn add redux-devtools-extension
```

#### Paso 3: Configurar Store

**Opción 1: Setup Básico**
```javascript
import { createStore, applyMiddleware, compose } from 'redux';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(...middleware))
);
```

**Opción 2: Con Package (Recomendado)**
```javascript
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

const store = createStore(
  reducer,
  composeWithDevTools(
    applyMiddleware(...middleware)
  )
);
```

**Opción 3: Con Opciones Avanzadas**
```javascript
import { composeWithDevTools } from 'redux-devtools-extension';

const composeEnhancers = composeWithDevTools({
  name: 'MyApp',
  trace: true, // Habilita stack trace
  traceLimit: 25,
  actionsBlacklist: ['MOUSE_MOVE'],
  actionSanitizer: (action) => {
    // Sanitizar acciones sensibles
    if (action.type === 'LOGIN') {
      return { ...action, password: '***' };
    }
    return action;
  },
  stateSanitizer: (state) => {
    // Ocultar datos sensibles
    return {
      ...state,
      auth: { ...state.auth, token: '***' }
    };
  }
});

const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(...middleware))
);
```

---

### 2.2 Redux DevTools Features

#### Feature Configuration
```javascript
const composeEnhancers = composeWithDevTools({
  features: {
    pause: true,         // Pausar/reanudar recording
    lock: true,          // Bloquear dispatching
    persist: true,       // Persistir estado en reload
    export: true,        // Exportar historial
    import: 'custom',    // Importar historial
    jump: true,          // Time-travel debugging
    skip: true,          // Saltar acciones
    reorder: true,       // Reordenar acciones
    dispatch: true,      // Dispatch custom actions
    test: true           // Generar tests
  }
});
```

---

### 2.3 Time-Travel Debugging

#### Uso Básico
1. Abrir Redux DevTools en browser
2. Panel "Inspector": Ver lista de acciones
3. Hacer click en cualquier acción para "saltar" a ese estado
4. Panel "Diff": Ver cambios entre estados

#### Navegación por Teclado
- **Ctrl + J**: Acción anterior
- **Ctrl + K**: Acción siguiente
- **Ctrl + Q**: Toggle DevTools

#### Export/Import State
```javascript
// Exportar estado actual
// En DevTools, botón "Export" (JSON file)

// Importar estado
// En DevTools, botón "Import"
// Pegar JSON o cargar archivo
```

---

### 2.4 Action Logging

#### Custom Logger Middleware
```javascript
const logger = store => next => action => {
  console.group(action.type);
  console.info('dispatching', action);
  let result = next(action);
  console.log('next state', store.getState());
  console.groupEnd();
  return result;
};

// Aplicar middleware
const store = createStore(
  reducer,
  composeWithDevTools(applyMiddleware(logger, thunk))
);
```

#### Conditional Logging
```javascript
const logger = store => next => action => {
  if (process.env.NODE_ENV !== 'production') {
    console.group(action.type);
    console.info('dispatching', action);
    console.log('prev state', store.getState());
  }
  
  let result = next(action);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('next state', store.getState());
    console.groupEnd();
  }
  
  return result;
};
```

---

### 2.5 State Diff Visualization

**En DevTools:**
1. Panel "Diff": Muestra diferencias entre estados
2. Panel "State": Muestra estado completo
3. Panel "Action": Muestra payload de acción

**Ejemplo:**
```javascript
// Acción
{ type: 'user/profileUpdated', payload: { name: 'John' } }

// Diff muestra:
// - name: "Jane" (anterior)
// + name: "John" (nuevo)
```

---

### 2.6 Middleware Debugging

#### Debug Thunk Middleware
```javascript
import { thunk } from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

const composedEnhancer = composeWithDevTools(applyMiddleware(thunk));
const store = createStore(rootReducer, composedEnhancer);

// Thunks aparecen como acciones en DevTools
const fetchUserById = userId => {
  return async (dispatch, getState) => {
    dispatch({ type: 'users/fetchStarted' });
    try {
      const user = await userApi.getUserById(userId);
      dispatch({ type: 'users/fetchSucceeded', payload: user });
    } catch (err) {
      dispatch({ type: 'users/fetchFailed', error: err.message });
    }
  };
};
```

#### Custom Middleware Debugging
```javascript
const delayedActionMiddleware = storeAPI => next => action => {
  if (action.type === 'todos/todoAdded') {
    console.log('Delaying action:', action);
    setTimeout(() => {
      console.log('Executing delayed action:', action);
      next(action);
    }, 1000);
    return;
  }
  return next(action);
};
```

#### Dynamic Middleware (RTK 2.0+)
```javascript
import { createDynamicMiddleware, configureStore } from '@reduxjs/toolkit';

const dynamicMiddleware = createDynamicMiddleware();

const store = configureStore({
  reducer: { todos: todosReducer },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().prepend(dynamicMiddleware.middleware)
});

// Agregar middleware en runtime
dynamicMiddleware.addMiddleware(someOtherMiddleware);
```

---

### 2.7 Selector Debugging

#### Logging Selector Calls
```javascript
import { createSelector } from 'reselect';

const selectTodos = state => {
  console.log('selectTodos called');
  return state.todos;
};

const selectTodoDescriptions = createSelector(
  [selectTodos],
  todos => {
    console.log('Computing todo descriptions');
    return todos.map(todo => todo.text);
  }
);
```

#### Memoization Debugging
```javascript
// Verificar cuándo se recalcula selector
const selectPostsByUser = createSelector(
  [selectPosts, (state, userId) => userId],
  (posts, userId) => {
    console.log('Recomputing posts for user:', userId);
    return posts.filter(post => post.userId === userId);
  }
);

// Uso
const state1 = getState();
selectPostsByUser(state1, 'user1'); // Logs: "Recomputing..."
selectPostsByUser(state1, 'user1'); // NO logs (memoized)
selectPostsByUser(state1, 'user2'); // Logs: "Recomputing..."
```

#### Selector Performance
```javascript
// Globalized vs Localized selectors
// Globalized: Sabe dónde encontrar datos
const selectAllTodosCompletedGlobalized = state =>
  state.todos.every(todo => todo.completed);

// Localized: Solo recibe slice específico
const selectAllTodosCompletedLocalized = todos =>
  todos.every(todo => todo.completed);
```

---

### 2.8 Immutability Violations

#### Detección con Middleware
```javascript
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: true,        // Detecta mutaciones
      serializableCheck: true      // Detecta valores no serializables
    })
});
```

#### Errores Comunes
```javascript
// ❌ Mutación directa
function todosReducer(state = [], action) {
  switch (action.type) {
    case 'todos/added':
      state.push(action.payload); // MUTACIÓN!
      return state;
  }
}

// ✅ Actualización inmutable
function todosReducer(state = [], action) {
  switch (action.type) {
    case 'todos/added':
      return [...state, action.payload];
  }
}

// ✅ Con Immer (RTK)
import { createSlice } from '@reduxjs/toolkit';

const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    todoAdded(state, action) {
      state.push(action.payload); // Immer lo hace inmutable
    }
  }
});
```

#### Debugging Immutability
```javascript
// Custom middleware para detectar mutaciones
const immutabilityChecker = store => next => action => {
  const stateBefore = store.getState();
  const result = next(action);
  const stateAfter = store.getState();
  
  if (stateBefore === stateAfter) {
    console.warn('State reference no cambió, posible mutación:', action);
  }
  
  return result;
};
```

---

### 2.9 Best Practices Redux Debugging

1. **Nombres de Acciones Descriptivos**
   ```javascript
   // ❌ Genérico
   { type: 'UPDATE' }
   
   // ✅ Específico
   { type: 'user/profileUpdated', payload: { name: 'John' } }
   ```

2. **Action Creators con Metadata**
   ```javascript
   const addTodo = (text) => ({
     type: 'todos/added',
     payload: text,
     meta: {
       timestamp: Date.now(),
       source: 'user-input'
     }
   });
   ```

3. **Sanitize Sensitive Data**
   ```javascript
   const composeEnhancers = composeWithDevTools({
     actionSanitizer: (action) => {
       if (action.type.includes('password')) {
         return { ...action, payload: '***HIDDEN***' };
       }
       return action;
     }
   });
   ```

4. **Environment-based DevTools**
   ```javascript
   const middleware = [thunkMiddleware];
   
   if (process.env.NODE_ENV !== 'production') {
     const { logger } = require('redux-logger');
     middleware.push(logger);
   }
   
   const store = createStore(
     reducer,
     applyMiddleware(...middleware)
   );
   ```

---

## 3. Zustand Debugging

### 3.1 DevTools Integration

#### Instalación
```bash
npm install zustand
npm install --save-dev @redux-devtools/extension
```

#### Setup Básico
```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface BearState {
  bears: number;
  increase: () => void;
}

const useBearStore = create<BearState>()(
  devtools(
    (set) => ({
      bears: 0,
      increase: () => set((state) => ({ bears: state.bears + 1 })),
    })
  )
);
```

#### Con Opciones Avanzadas
```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {} from '@redux-devtools/extension'; // Typing

const useBearStore = create<BearState>()(
  devtools(
    (set) => ({
      bears: 0,
      fishes: 0,
      increase: () => set(
        (state) => ({ bears: state.bears + 1 }),
        undefined,
        'bear/increase' // Nombre de acción
      ),
      addFishes: (count) => set(
        (prev) => ({ fishes: prev.fishes + count }),
        undefined,
        { type: 'bear/addFishes', count } // Acción con payload
      ),
    }),
    {
      name: 'BearStore',                    // Nombre en DevTools
      enabled: process.env.NODE_ENV !== 'production',
      anonymousActionType: 'unknown',        // Acción por defecto
      store: 'store1',                       // Grupo de stores
    }
  )
);
```

---

### 3.2 Store Inspection

#### Ver Estado en DevTools
1. Abrir Redux DevTools Extension
2. Buscar store por nombre (`BearStore`)
3. Panel "State": Ver estado completo
4. Panel "Action": Ver últimas acciones

#### Programmatic Inspection
```typescript
// Obtener estado actual
const state = useBearStore.getState();
console.log('Current state:', state);

// Subscribe a cambios
const unsubscribe = useBearStore.subscribe(
  (state) => console.log('State changed:', state)
);

// Cleanup
unsubscribe();
```

---

### 3.3 Actions Tracking

#### Named Actions
```typescript
const useStore = create<State>()(
  devtools((set) => ({
    bears: 0,
    addBear: () => set(
      (state) => ({ bears: state.bears + 1 }),
      undefined,
      'jungle/addBear' // Nombre aparece en DevTools
    ),
  }))
);
```

#### Actions con Slices Pattern
```typescript
type BearSlice = {
  bears: number;
  addBear: () => void;
};

type FishSlice = {
  fishes: number;
  addFish: () => void;
};

type JungleStore = BearSlice & FishSlice;

const createBearSlice: StateCreator<
  JungleStore,
  [['zustand/devtools', never]],
  [],
  BearSlice
> = (set) => ({
  bears: 0,
  addBear: () => set(
    (state) => ({ bears: state.bears + 1 }),
    undefined,
    'jungle:bear/addBear'
  ),
});

const createFishSlice: StateCreator<
  JungleStore,
  [['zustand/devtools', never]],
  [],
  FishSlice
> = (set) => ({
  fishes: 0,
  addFish: () => set(
    (state) => ({ fishes: state.fishes + 1 }),
    undefined,
    'jungle:fish/addFish'
  ),
});

const useJungleStore = create<JungleStore>()(
  devtools((...args) => ({
    ...createBearSlice(...args),
    ...createFishSlice(...args),
  }))
);
```

---

### 3.4 Persistence Debugging

#### Setup Persist + DevTools
```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {} from '@redux-devtools/extension';

interface BearState {
  bears: number;
  increase: (by: number) => void;
}

const useBearStore = create<BearState>()(
  devtools(
    persist(
      (set) => ({
        bears: 0,
        increase: (by) => set((state) => ({ bears: state.bears + by })),
      }),
      {
        name: 'bear-storage', // localStorage key
      }
    ),
    { name: 'BearStore' } // DevTools name
  )
);
```

#### Debugging Rehydration
```typescript
const useBearStore = create<BearState>()(
  persist(
    (set) => ({
      bears: 0,
      increase: (by) => set((state) => ({ bears: state.bears + by })),
    }),
    {
      name: 'bear-storage',
      onRehydrateStorage: (state) => {
        console.log('Hydration starts');
        
        return (state, error) => {
          if (error) {
            console.error('Hydration failed:', error);
          } else {
            console.log('Hydration finished:', state);
          }
        };
      },
    }
  )
);
```

#### Manual Rehydration
```typescript
// Forzar recarga desde storage
await useBearStore.persist.rehydrate();

// Limpiar storage
useBearStore.persist.clearStorage();

// Verificar si ya se hidrato
const hasHydrated = useBearStore.persist.hasHydrated();
```

#### Storage Event Debugging
```typescript
// Sincronizar entre tabs
type StoreWithPersist = Mutate<StoreApi<State>, [["zustand/persist", unknown]]>;

export const withStorageDOMEvents = (store: StoreWithPersist) => {
  const storageEventCallback = (e: StorageEvent) => {
    if (e.key === store.persist.getOptions().name && e.newValue) {
      console.log('Storage changed in another tab:', e.newValue);
      store.persist.rehydrate();
    }
  };

  window.addEventListener('storage', storageEventCallback);

  return () => {
    window.removeEventListener('storage', storageEventCallback);
  };
};

const useBoundStore = create(persist(...));
withStorageDOMEvents(useBoundStore);
```

---

### 3.5 Immer Integration

#### Setup
```typescript
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface State {
  nested: { count: number };
  increment: () => void;
}

const useStore = create<State>()(
  devtools(
    subscribeWithSelector(
      immer((set) => ({
        nested: { count: 0 },
        increment: () => set((state) => {
          // Mutación "aparente" gracias a Immer
          state.nested.count += 1;
        }),
      }))
    ),
    { name: 'AppStore' }
  )
);
```

#### Debugging Immer Mutations
```typescript
const useStore = create<State>()(
  immer((set, get) => ({
    user: { name: 'John', age: 30 },
    updateUser: (updates) => set((state) => {
      console.log('Before mutation:', current(state.user));
      Object.assign(state.user, updates);
      console.log('After mutation:', current(state.user));
    }),
  }))
);
```

---

### 3.6 Multiple Middleware Composition

```typescript
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Order matters: outer wraps inner
const useStore = create<State>()(
  devtools(              // 4. DevTools (outermost)
    persist(             // 3. Persistence
      subscribeWithSelector(  // 2. Selective subscriptions
        immer((set) => ({     // 1. Immer (innermost)
          nested: { count: 0 },
          increment: () => set((state) => {
            state.nested.count += 1;
          }),
        }))
      ),
      { name: 'app-storage' }
    ),
    { name: 'AppStore' }
  )
);

// Usar selector subscription
const unsub = useStore.subscribe(
  (state) => state.nested.count,
  (count) => console.log('Count changed:', count)
);
```

---

### 3.7 Best Practices Zustand Debugging

1. **Siempre nombrar acciones**
   ```typescript
   set((state) => ({ count: state.count + 1 }), undefined, 'count/increment');
   ```

2. **DevTools solo en desarrollo**
   ```typescript
   const useStore = create<State>()(
     devtools(
       (set) => ({ /* ... */ }),
       { enabled: process.env.NODE_ENV !== 'production' }
     )
   );
   ```

3. **Limpiar DevTools si es necesario**
   ```typescript
   useStore.devtools?.cleanup();
   ```

4. **Logging custom**
   ```typescript
   const useStore = create<State>()((set, get) => ({
     count: 0,
     increment: () => {
       console.log('Before:', get().count);
       set((state) => ({ count: state.count + 1 }));
       console.log('After:', get().count);
     }
   }));
   ```

---

## 4. TanStack Query Debugging

### 4.1 Query DevTools

#### Instalación
```bash
npm install @tanstack/react-query-devtools
```

#### Setup Básico
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

#### Configuración Avanzada
```tsx
<ReactQueryDevtools
  initialIsOpen={false}
  position="bottom-right"
  panelPosition="bottom"
  buttonPosition="bottom-right"
  styleNonce="your-nonce"
  errorTypes={[
    { name: 'Error Name', initializer: (query) => new Error() }
  ]}
/>
```

---

### 4.2 Cache Debugging

#### Inspeccionar Cache
```typescript
import { useQueryClient } from '@tanstack/react-query';

function DebugComponent() {
  const queryClient = useQueryClient();
  
  // Ver todo el cache
  const cache = queryClient.getQueryCache();
  console.log('All queries:', cache.getAll());
  
  // Ver query específica
  const todoQuery = queryClient.getQueryData(['todos']);
  console.log('Todos cache:', todoQuery);
  
  // Ver estado de query
  const queryState = queryClient.getQueryState(['todos']);
  console.log('Query state:', queryState);
  
  return null;
}
```

#### Mutation Cache
```typescript
const queryClient = useQueryClient();

// Ver todas las mutations
const mutationCache = queryClient.getMutationCache();
console.log('All mutations:', mutationCache.getAll());

// Verificar si hay mutations activas
if (queryClient.isMutating()) {
  console.log('At least one mutation is fetching!');
}
```

---

### 4.3 Stale Time vs Cache Time

#### Conceptos
- **staleTime**: Tiempo que los datos permanecen "frescos"
- **gcTime** (antes cacheTime): Tiempo que datos no usados permanecen en cache

#### Configuración
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutos
      gcTime: 1000 * 60 * 10,     // 10 minutos
    },
  },
});
```

#### Debugging
```typescript
// staleTime = 0 (default): Data inmediatamente stale
const immediateStaleConfig = {
  staleTime: 0
};

// staleTime = 5 minutos: Data fresca por 5 minutos
const fiveMinuteStaleConfig = {
  staleTime: 5 * 60 * 1000
};

// staleTime = Infinity: Data nunca stale
const neverStaleConfig = {
  staleTime: Infinity
};
```

#### Lifecycle Debugging
```typescript
const { data, isLoading, isError, isFetching, isStale } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  staleTime: 5000,
});

useEffect(() => {
  console.log({
    isLoading,   // Primera carga
    isFetching,  // Cualquier fetch (background también)
    isStale,     // Si data es stale
  });
}, [isLoading, isFetching, isStale]);
```

---

### 4.4 Refetch Behavior

#### Configuración de Refetch
```typescript
const { data } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  refetchOnMount: true,        // Refetch al montar
  refetchOnWindowFocus: true,  // Refetch al enfocar ventana
  refetchOnReconnect: true,    // Refetch al reconectar
  refetchInterval: 5000,       // Refetch cada 5s
  refetchIntervalInBackground: false,
});
```

#### Debugging Refetch
```typescript
const { data, refetch } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  enabled: false, // No fetch automático
});

// Manual refetch con logging
const handleRefetch = async () => {
  console.log('Refetching todos...');
  const result = await refetch();
  console.log('Refetch result:', result);
};
```

#### Force Refetch
```typescript
const queryClient = useQueryClient();

// Invalidar todas las queries
queryClient.invalidateQueries();

// Invalidar query específica
queryClient.invalidateQueries({ queryKey: ['todos'] });

// Invalidar y refetch inmediatamente
queryClient.invalidateQueries({
  queryKey: ['todos'],
  refetchType: 'active'
});
```

---

### 4.5 Mutation Debugging

#### Setup con Logging
```typescript
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: (variables) => {
    console.log('Mutation started:', variables);
  },
  onSuccess: (data, variables, context) => {
    console.log('Mutation succeeded:', { data, variables, context });
  },
  onError: (error, variables, context) => {
    console.error('Mutation failed:', { error, variables, context });
  },
  onSettled: (data, error, variables, context) => {
    console.log('Mutation settled:', { data, error, variables, context });
  },
});
```

#### Mutation State
```typescript
const mutation = useMutation({ mutationFn: updateTodo });

console.log({
  isIdle: mutation.isIdle,       // No ejecutándose
  isPending: mutation.isPending, // Ejecutándose
  isError: mutation.isError,     // Error
  isSuccess: mutation.isSuccess, // Exitosa
  data: mutation.data,           // Datos de respuesta
  error: mutation.error,         // Error si hay
});
```

#### Update Cache from Mutation
```typescript
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: editTodo,
  onSuccess: (data, variables) => {
    // Actualizar cache directamente
    queryClient.setQueryData(['todo', { id: variables.id }], data);
    
    console.log('Cache updated for todo:', variables.id);
  },
});
```

---

### 4.6 Optimistic Updates

#### Cache-based Optimistic Update
```typescript
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: updateTodo,
  
  onMutate: async (newTodo) => {
    // 1. Cancelar refetches pendientes
    await queryClient.cancelQueries({ queryKey: ['todos'] });
    
    // 2. Snapshot estado anterior
    const previousTodos = queryClient.getQueryData(['todos']);
    
    // 3. Update optimista
    queryClient.setQueryData(['todos'], (old) => [...old, newTodo]);
    
    console.log('Optimistic update applied');
    
    // 4. Retornar context para rollback
    return { previousTodos };
  },
  
  onError: (err, newTodo, context) => {
    // Rollback en caso de error
    console.error('Mutation failed, rolling back:', err);
    queryClient.setQueryData(['todos'], context.previousTodos);
  },
  
  onSettled: () => {
    // Refetch siempre al terminar
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

#### UI-based Optimistic Update
```typescript
function TodoList() {
  const [optimisticTodos, setOptimisticTodos] = useState([]);
  const { data: todos } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos });
  
  const mutation = useMutation({
    mutationFn: addTodo,
    onMutate: (newTodo) => {
      // UI optimista
      setOptimisticTodos(prev => [...prev, { ...newTodo, id: 'temp-' + Date.now() }]);
    },
    onSuccess: () => {
      // Limpiar optimista
      setOptimisticTodos([]);
    },
    onError: () => {
      // Limpiar optimista en error
      setOptimisticTodos([]);
    },
  });
  
  const displayTodos = [...(todos || []), ...optimisticTodos];
  
  return <div>{displayTodos.map(todo => <Todo key={todo.id} {...todo} />)}</div>;
}
```

---

### 4.7 Infinite Queries Debugging

#### Setup
```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  isError,
  error,
} = useInfiniteQuery({
  queryKey: ['projects'],
  queryFn: ({ pageParam = 0 }) => fetchProjects(pageParam),
  getNextPageParam: (lastPage, allPages) => {
    console.log('Getting next page param:', { lastPage, allPages });
    return lastPage.nextCursor;
  },
  getPreviousPageParam: (firstPage, allPages) => {
    console.log('Getting previous page param:', { firstPage, allPages });
    return firstPage.prevCursor;
  },
  initialPageParam: 0,
});
```

#### Debugging Infinite Fetch
```typescript
useEffect(() => {
  console.log({
    totalPages: data?.pages.length,
    totalItems: data?.pages.reduce((acc, page) => acc + page.items.length, 0),
    hasNextPage,
    isFetchingNextPage,
  });
}, [data, hasNextPage, isFetchingNextPage]);
```

#### Preventing Infinite Loops
```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
} = useInfiniteQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  getNextPageParam: (lastPage, allPages) => {
    // ❌ Esto causa loop infinito
    // return allPages.length + 1;
    
    // ✅ Verificar si hay más páginas
    return lastPage.hasMore ? lastPage.nextCursor : undefined;
  },
});

// Cargar más solo si hay páginas disponibles
const loadMore = () => {
  if (hasNextPage && !isFetchingNextPage) {
    console.log('Loading next page...');
    fetchNextPage();
  }
};
```

---

### 4.8 Best Practices TanStack Query Debugging

1. **Query Keys consistentes**
   ```typescript
   // ✅ Usar factory pattern
   const todoKeys = {
     all: ['todos'] as const,
     lists: () => [...todoKeys.all, 'list'] as const,
     list: (filters: string) => [...todoKeys.lists(), { filters }] as const,
     details: () => [...todoKeys.all, 'detail'] as const,
     detail: (id: number) => [...todoKeys.details(), id] as const,
   };
   ```

2. **Logging en desarrollo**
   ```typescript
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         onError: (error) => {
           if (process.env.NODE_ENV === 'development') {
             console.error('Query error:', error);
           }
         },
       },
       mutations: {
         onError: (error) => {
           if (process.env.NODE_ENV === 'development') {
             console.error('Mutation error:', error);
           }
         },
       },
     },
   });
   ```

3. **DevTools solo en desarrollo**
   ```tsx
   {process.env.NODE_ENV === 'development' && (
     <ReactQueryDevtools initialIsOpen={false} />
   )}
   ```

---

## 5. Otros: Jotai y Valtio

### 5.1 Jotai DevTools

#### Instalación
```bash
npm install jotai-devtools
```

#### Setup
```jsx
import { Provider, atom } from 'jotai';
import { DevTools } from 'jotai-devtools';
import 'jotai-devtools/styles.css';

const countAtom = atom(0);
countAtom.debugLabel = 'count';

function App() {
  return (
    <Provider>
      <DevTools />
      <Counter />
    </Provider>
  );
}
```

#### useAtomsDebugValue
```jsx
import { useAtomsDebugValue } from 'jotai-devtools/utils';

const DebugAtoms = () => {
  useAtomsDebugValue();
  return null;
};

function App() {
  return (
    <Provider>
      <DebugAtoms />
      <Counter />
    </Provider>
  );
}
```

#### useAtomDevtools (Redux DevTools)
```javascript
import { useAtomDevtools } from 'jotai-devtools/utils';

const countAtom = atom(0);
countAtom.debugLabel = 'count';

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  useAtomDevtools(countAtom);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

#### useAtomsDevtools (All Atoms)
```jsx
import { useAtomsDevtools } from 'jotai-devtools/utils';

const AtomsDevtools = ({ children }) => {
  useAtomsDevtools('demo');
  return children;
};

function App() {
  return (
    <AtomsDevtools>
      <Counter />
    </AtomsDevtools>
  );
}
```

#### Babel Plugin (Debug Labels)
```json
{
  "plugins": ["jotai/babel/plugin-debug-label"]
}
```

```json
{
  "plugins": [
    ["jotai/babel/plugin-debug-label", { 
      "customAtomNames": ["customAtom"] 
    }]
  ]
}
```

#### Vite Config
```typescript
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react({
      babel: {
        presets: ['jotai/babel/preset'],
      },
    }),
  ],
});
```

---

### 5.2 Valtio DevTools

#### Setup
```javascript
import { proxy } from 'valtio';
import { devtools } from 'valtio/utils';

const state = proxy({
  count: 0,
  user: { name: 'John', age: 30 }
});

// Conectar a Redux DevTools
const unsubscribe = devtools(state, {
  name: 'My App State',
  enabled: true
});

// Todas las mutaciones son rastreadas
state.count++;
state.user.name = 'Jane';

// Desconectar
unsubscribe();
```

#### Snapshots Debugging
```javascript
import { proxy, snapshot, subscribe } from 'valtio/vanilla';

const state = proxy({
  count: 0,
  nested: { value: 42 }
});

// Crear snapshot inmutable
const snap1 = snapshot(state);
console.log(snap1.count); // 0

// Snapshots son frozen
try {
  snap1.count = 999; // Throws en strict mode
} catch (error) {
  console.error('Cannot modify snapshot');
}

// Estado original sigue mutable
state.count = 10;

// Nuevo snapshot
const snap2 = snapshot(state);
console.log(snap2.count); // 10
console.log(snap1.count); // Still 0
```

#### useProxy Utility
```javascript
import { useProxy } from 'valtio/utils';

const state = proxy({ count: 0, text: 'hello' });

function Counter() {
  const $state = useProxy(state);
  
  return (
    <div>
      {$state.count}
      <button onClick={() => ++$state.count}>+1</button>
    </div>
  );
}
```

---

### 5.3 Problemas Comunes

#### Jotai: Atoms sin debugLabel
```javascript
// ❌ Difícil de debuggear
const countAtom = atom(0);

// ✅ Mejor
const countAtom = atom(0);
if (process.env.NODE_ENV !== 'production') {
  countAtom.debugLabel = 'count';
}
```

#### Valtio: Mutaciones fuera de componentes
```javascript
// Valtio permite mutaciones directas
state.count++; // OK en cualquier lugar

// Debugging
subscribe(state, () => {
  console.log('State changed:', snapshot(state));
});
```

---

## Resumen de Herramientas

| Librería | DevTools | Time-Travel | Middleware | Persist Debug |
|----------|----------|-------------|------------|---------------|
| Redux | ✅ Redux DevTools | ✅ | ✅ | ❌ |
| Zustand | ✅ Redux DevTools | ✅ | ✅ | ✅ |
| TanStack Query | ✅ React Query DevTools | ❌ | ❌ | ✅ |
| Jotai | ✅ jotai-devtools + Redux | ✅ | ❌ | ✅ |
| Valtio | ✅ Redux DevTools | ✅ | ❌ | ❌ |
| Context API | ✅ React DevTools | ❌ | ❌ | ❌ |

---

## Checklist de Debugging

### General
- [ ] DevTools instaladas (browser extension)
- [ ] DevTools habilitadas solo en desarrollo
- [ ] Logging apropiado en consola
- [ ] Error boundaries implementados

### Redux
- [ ] Redux DevTools configuradas
- [ ] Nombres de acciones descriptivos
- [ ] Logger middleware en desarrollo
- [ ] Immutability checks habilitados
- [ ] Selectors memoizados

### Zustand
- [ ] devtools middleware aplicado
- [ ] Acciones nombradas
- [ ] persist + onRehydrateStorage configurado
- [ ] Multiple stores con nombres únicos

### TanStack Query
- [ ] ReactQueryDevtools importadas
- [ ] Query keys factories implementadas
- [ ] staleTime vs gcTime configurados
- [ ] Mutation error handling

### Context API
- [ ] Provider hierarchy verificada
- [ ] Values memoizados con useMemo
- [ ] Callbacks memoizados con useCallback
- [ ] Context dividido por responsabilidad

---

**Creado:** 2025-12-25  
**Actualizado:** 2025-12-25
