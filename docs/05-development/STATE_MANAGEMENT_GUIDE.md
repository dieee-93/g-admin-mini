# 🗃️ State Management Guide - Zustand en G-Admin Mini

**PROPÓSITO**: Guía definitiva para manejo de estado en G-Admin Mini
**FECHA CREACIÓN**: 2025-09-19
**ESTADO**: Guía inicial basada en análisis de código existente

---

## 🎯 **FILOSOFÍA DE STATE MANAGEMENT**

G-Admin Mini usa un enfoque **híbrido** para el manejo de estado:

```
LOCAL STATE (useState) ← Para UI simple
ZUSTAND STORES      ← Para estado compartido/persistente
EVENTBUS           ← Para comunicación entre módulos
```

---

## 📊 **CUÁNDO USAR CADA APPROACH**

### **✅ USA ZUSTAND CUANDO:**
- Estado compartido entre **múltiples componentes** del mismo módulo
- Estado que debe **persistir** entre navegación
- **Configuración global** de la aplicación
- **Cache de datos** que multiple componentes necesitan
- **Estado complejo** con múltiples propiedades relacionadas

### **✅ USA LOCAL STATE (useState) CUANDO:**
- Estado **específico** de un solo componente
- **UI state** simple (modal open/close, input values)
- **Form state** local
- Estado **temporal** que no necesita persistir

### **✅ USA EVENTBUS CUANDO:**
- **Comunicación entre módulos** diferentes
- **Eventos de negocio** (stock_updated, sale_completed)
- **Notificaciones cross-module**

---

## 🏗️ **STORES EXISTENTES IDENTIFICADOS**

### **1. BUSINESS CAPABILITIES STORE** ✅
**Ubicación**: `/src/store/businessCapabilitiesStore.ts`
**Propósito**: Maneja las capacidades de negocio del usuario
**Tipo**: Configuración global persistente

```typescript
// Ejemplo de uso (inferido del código)
import { useBusinessCapabilitiesStore } from '@/store/businessCapabilitiesStore';

const capabilities = useBusinessCapabilitiesStore(state => state.capabilities);
const updateCapabilities = useBusinessCapabilitiesStore(state => state.updateCapabilities);
```

### **2. THEME STORE** ✅
**Ubicación**: `/src/store/themeStore` (mencionado en component-library.md)
**Propósito**: Maneja el tema actual (20+ temas disponibles)
**Tipo**: Configuración global persistente

```typescript
// Ejemplo de uso (según documentación)
import { useThemeStore } from '@/store/themeStore';

const { currentTheme, setTheme } = useThemeStore();
```

---

## 🎯 **PATTERNS PARA CREAR NUEVOS STORES**

### **ESTRUCTURA ESTÁNDAR DE STORE**

```typescript
// /src/store/[moduleName]Store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface [ModuleName]State {
  // Estado del módulo
  items: [ItemType][];
  loading: boolean;
  filters: FilterState;

  // Acciones
  setItems: (items: [ItemType][]) => void;
  addItem: (item: [ItemType]) => void;
  updateItem: (id: string, updates: Partial<[ItemType]>) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  updateFilters: (filters: Partial<FilterState>) => void;

  // Actions complejas
  fetchItems: () => Promise<void>;
  resetStore: () => void;
}

export const use[ModuleName]Store = create<[ModuleName]State>()(
  persist(
    (set, get) => ({
      // Estado inicial
      items: [],
      loading: false,
      filters: {},

      // Acciones simples
      setItems: (items) => set({ items }),
      addItem: (item) => set(state => ({
        items: [...state.items, item]
      })),
      updateItem: (id, updates) => set(state => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      })),
      removeItem: (id) => set(state => ({
        items: state.items.filter(item => item.id !== id)
      })),
      setLoading: (loading) => set({ loading }),
      updateFilters: (filters) => set(state => ({
        filters: { ...state.filters, ...filters }
      })),

      // Acciones complejas
      fetchItems: async () => {
        set({ loading: true });
        try {
          // Fetch logic aquí
          const items = await fetchItemsFromAPI();
          set({ items, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      resetStore: () => set({
        items: [],
        loading: false,
        filters: {}
      })
    }),
    {
      name: '[module-name]-store', // Clave para localStorage
      partialize: (state) => ({
        // Solo persistir lo necesario
        filters: state.filters,
        // NO persistir loading, items se fetcha fresh
      })
    }
  )
);
```

### **HOOK PERSONALIZADO PARA EL STORE**

```typescript
// /src/hooks/use[ModuleName].ts
import { use[ModuleName]Store } from '@/store/[moduleName]Store';
import { useEffect } from 'react';

export function use[ModuleName]() {
  const store = use[ModuleName]Store();

  // Auto-fetch al montar
  useEffect(() => {
    if (store.items.length === 0 && !store.loading) {
      store.fetchItems();
    }
  }, []);

  // API limpia para componentes
  return {
    // Estado
    items: store.items,
    loading: store.loading,
    filters: store.filters,

    // Acciones simplificadas
    actions: {
      refresh: store.fetchItems,
      add: store.addItem,
      update: store.updateItem,
      remove: store.removeItem,
      updateFilters: store.updateFilters,
      reset: store.resetStore
    },

    // Computed values
    filteredItems: store.items.filter(/* lógica de filtros */),
    totalCount: store.items.length,
    hasItems: store.items.length > 0
  };
}
```

---

## 🔄 **INTEGRACIÓN CON EVENTBUS**

### **PATRÓN: STORE + EVENTBUS**

```typescript
// En el store, escuchar eventos de otros módulos
export const useMaterialsStore = create<MaterialsState>((set, get) => ({
  // ... estado base

  // Inicializar listeners del EventBus
  initializeEventListeners: () => {
    EventBus.on('sales.completed', (saleData) => {
      // Actualizar stock basado en venta
      get().updateStockFromSale(saleData);
    });

    EventBus.on('products.recipe_updated', (recipeData) => {
      // Recalcular requirements basado en nueva receta
      get().recalculateRequirements(recipeData);
    });
  },

  updateStockFromSale: (saleData) => {
    // Lógica para actualizar stock
    set(state => ({
      items: state.items.map(item => {
        const soldQuantity = saleData.items[item.id] || 0;
        return soldQuantity > 0
          ? { ...item, stock: item.stock - soldQuantity }
          : item;
      })
    }));

    // Emitir evento de stock actualizado
    EventBus.emit('materials.stock_updated', {
      moduleId: 'materials',
      changedItems: get().items.filter(/* items que cambiaron */)
    });
  }
}));

// En el hook, inicializar listeners
export function useMaterials() {
  const store = useMaterialsStore();

  useEffect(() => {
    store.initializeEventListeners();

    // Cleanup listeners al desmontar
    return () => {
      EventBus.off('sales.completed');
      EventBus.off('products.recipe_updated');
    };
  }, []);

  return store;
}
```

---

## 🎯 **DECISION TREE PARA STATE MANAGEMENT**

```
🤔 ¿Necesitas manejar estado?
├── ¿Es UI simple de UN componente?
│   └── ✅ useState local
├── ¿Es comunicación entre MÓDULOS diferentes?
│   └── ✅ EventBus
├── ¿Es estado compartido en MISMO módulo?
│   ├── ¿Necesita persistir entre navegación?
│   │   └── ✅ Zustand Store
│   └── ¿Es temporal/session?
│       └── ✅ Zustand Store sin persist
└── ¿Es configuración GLOBAL?
    └── ✅ Zustand Store con persist
```

---

## 🚨 **ANTI-PATTERNS A EVITAR**

### **❌ NO HAGAS ESTO:**

```typescript
// ❌ Props drilling de estado complejo
function App() {
  const [materials, setMaterials] = useState([]);
  return (
    <MaterialsPage
      materials={materials}
      onUpdateMaterials={setMaterials}
    />
  );
}

// ❌ Store gigante con todo mezclado
interface AppState {
  materials: Material[];
  sales: Sale[];
  staff: Employee[];
  theme: Theme;
  user: User;
  // ... todo mezclado
}

// ❌ EventBus para estado local
EventBus.emit('modal_open', { open: true }); // ¡NO!
```

### **✅ HAZ ESTO:**

```typescript
// ✅ Hook específico del módulo
const { materials, actions } = useMaterials();

// ✅ Store específico por dominio
const useMaterialsStore = create(/* solo materials */);
const useSalesStore = create(/* solo sales */);
const useThemeStore = create(/* solo theme */);

// ✅ useState para UI local
const [isModalOpen, setIsModalOpen] = useState(false);
```

---

## 📚 **EXAMPLES POR TIPO DE ESTADO**

### **1. CONFIGURACIÓN GLOBAL**
```typescript
// Para theme, user preferences, app config
const useAppConfigStore = create(
  persist(
    (set) => ({
      theme: 'corporate',
      language: 'es',
      notifications: true,
      setTheme: (theme) => set({ theme }),
      toggleNotifications: () => set(state => ({
        notifications: !state.notifications
      }))
    }),
    { name: 'app-config' }
  )
);
```

### **2. MÓDULO CON CACHE**
```typescript
// Para datos que se fetchean y se cachean
const useMaterialsStore = create(
  persist(
    (set, get) => ({
      items: [],
      lastFetch: null,
      loading: false,

      fetchItems: async (force = false) => {
        const now = Date.now();
        const lastFetch = get().lastFetch;

        // Cache por 5 minutos
        if (!force && lastFetch && (now - lastFetch) < 300000) {
          return get().items;
        }

        set({ loading: true });
        const items = await fetchMaterials();
        set({ items, lastFetch: now, loading: false });
        return items;
      }
    }),
    {
      name: 'materials-cache',
      partialize: (state) => ({
        items: state.items,
        lastFetch: state.lastFetch
      })
    }
  )
);
```

### **3. FILTROS Y UI STATE**
```typescript
// Para filtros que persisten entre navegación
const useMaterialsFiltersStore = create(
  persist(
    (set) => ({
      category: 'all',
      priceRange: [0, 1000],
      inStock: true,
      sortBy: 'name',
      sortOrder: 'asc',

      updateFilters: (filters) => set(state => ({
        ...state,
        ...filters
      })),

      resetFilters: () => set({
        category: 'all',
        priceRange: [0, 1000],
        inStock: true,
        sortBy: 'name',
        sortOrder: 'asc'
      })
    }),
    { name: 'materials-filters' }
  )
);
```

---

## 🎯 **INTEGRACIÓN CON MÓDULOS EXISTENTES**

### **MATERIALS MODULE**
```typescript
// Estado que DEBERÍA estar en Zustand:
- Items cache con ABC classification
- Filtros de búsqueda/filtrado
- Configuración de alertas personalizadas
- Preferencias de vista (grid/list)

// Estado que está bien en local:
- Modal states (open/close)
- Form data temporal
- Loading states de acciones específicas
```

### **SALES MODULE**
```typescript
// Estado que DEBERÍA estar en Zustand:
- Carrito de ventas en proceso
- Configuración de POS
- Historial de ventas recientes (cache)
- Preferencias de usuario (qué columnas mostrar)

// Estado que está bien en local:
- Estados de forms
- Modals de confirmación
- Loading states
```

---

## 🔧 **HERRAMIENTAS DE DEBUGGING**

### **ZUSTAND DEVTOOLS**
```typescript
import { devtools } from 'zustand/middleware';

export const useStore = create(
  devtools(
    persist(
      (set) => ({
        // ... store logic
      }),
      { name: 'store-name' }
    ),
    { name: 'store-name-devtools' }
  )
);
```

### **LOGGING DE CAMBIOS**
```typescript
const useStoreWithLogging = create(
  (set, get) => ({
    updateItem: (id, updates) => {
      console.log('Updating item:', id, updates);
      set(state => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      }));
      console.log('New state:', get().items);
    }
  })
);
```

---

## 📋 **MIGRATION GUIDE**

### **MIGRAR DE LOCAL STATE A ZUSTAND**

```typescript
// ANTES: Local state con props drilling
function MaterialsPage() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({});

  return (
    <MaterialsList
      items={items}
      filters={filters}
      onFilterChange={setFilters}
    />
  );
}

// DESPUÉS: Zustand store
function MaterialsPage() {
  const { items, filters, actions } = useMaterials();

  return <MaterialsList />; // No props needed
}

function MaterialsList() {
  const { filteredItems, filters, actions } = useMaterials();

  return (
    <div>
      <FilterPanel
        filters={filters}
        onChange={actions.updateFilters}
      />
      <ItemGrid items={filteredItems} />
    </div>
  );
}
```

---

## 🎯 **PRÓXIMOS PASOS RECOMENDADOS**

1. **AUDITAR STORES EXISTENTES**: Identificar qué stores ya existen
2. **CREAR STORES FALTANTES**: Para módulos que usan mucho estado local
3. **MIGRAR ESTADO COMPARTIDO**: De props drilling a stores
4. **IMPLEMENTAR PERSIST**: Para filtros y preferencias de usuario
5. **INTEGRAR CON EVENTBUS**: Para comunicación cross-module

---

**🎯 NOTA PARA IA**: Consulta esta guía ANTES de decidir cómo manejar estado en nuevos componentes. Sigue los patterns establecidos y evita los anti-patterns documentados.