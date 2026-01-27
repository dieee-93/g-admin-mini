# Auditoría: Stores con produce() de Immer - Informe Completo

**Fecha**: 4 de diciembre de 2025  
**Contexto**: Después de corregir suppliersStore (bug de reactividad con produce()), auditamos los 5 stores restantes

---

## 🎯 Resumen Ejecutivo

**Problema identificado**: 5 stores usan `produce()` de Immer sin el middleware oficial de Zustand, lo cual rompe la detección de cambios de estado y causa bugs de reactividad.

**Evidencia del bug en suppliersStore**:
- Store tenía 3 suppliers pero SelectField mostraba solo 2
- Causa: `produce()` sin middleware hace que Zustand no detecte cambios (referencia === igual)
- Documentado en: `ZUSTAND_PRODUCE_BUG_FIX.md`

**Alcance del refactor necesario**:

| Store | Líneas | Usos de produce() | Prioridad | Complejidad |
|-------|--------|-------------------|-----------|-------------|
| **materialsStore.ts** | 616 | 9 | 🔴 ALTA | ⭐⭐⭐⭐⭐ (muy complejo) |
| **achievementsStore.ts** | 359 | 6 | 🟡 MEDIA | ⭐⭐⭐⭐ (usa Set/Map) |
| **paymentsStore.ts** | 339 | 7 | 🟡 MEDIA | ⭐⭐⭐ (arrays simples) |
| **assetsStore.ts** | 290 | 5 | 🟢 BAJA | ⭐⭐ (estructura simple) |
| **cashStore.ts** | 113 | 6 | 🟢 BAJA | ⭐⭐ (estructura simple) |

**Total**: 1,717 líneas de código afectadas, 33 usos de `produce()`

---

## 📊 Análisis Detallado por Store

### 1. materialsStore.ts - 🔴 PRIORIDAD ALTA

**Métricas**:
- 616 líneas (el más grande)
- 9 usos de `produce()`
- Patrón: CRUD + business logic en store (anti-pattern según TkDodo)

**Estructura actual**:
```typescript
import { produce } from 'immer'; // ❌ Sin middleware

export const useMaterialsStore = create<MaterialsState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        // ... 600+ líneas
        
        // ❌ PROBLEMA: CRUD operations en el store
        addItem: async (itemData) => {
          // 100+ líneas de business logic
          set(produce((state) => {
            state.items.push(normalizedItem);
          }));
        },
        
        updateItem: async (id, updates) => {
          // 80+ líneas de business logic
          set(produce((state) => {
            const item = state.items.find(i => i.id === id);
            Object.assign(item, updates);
          }));
        },
      })
    )
  )
);
```

**Problemas arquitectónicos**:

1. **Server state en store** (debería estar en hook con TanStack Query)
   - `items: MaterialItem[]` → DB data
   - `addItem()`, `updateItem()`, `deleteItem()` → CRUD async operations
   
2. **Business logic en store** (debería estar en custom hook)
   - 100+ líneas en `addItem()`: validación, normalización, API calls
   - 80+ líneas en `updateItem()`: stock calculations, RPC calls
   
3. **produce() en 9 lugares**:
   - `setItems()` - línea 153
   - `addItem()` - línea 243
   - `updateItem()` - línea 312
   - `deleteItem()` - línea 332
   - `bulkUpdateStock()` - línea 341
   - `setFilters()` - línea 357
   - `selectItem()` - línea 362
   - `deselectItem()` - línea 367
   - `selectAll()` - línea 370

**Refactor recomendado**:

```typescript
// ✅ DESPUÉS: Store solo UI state
interface MaterialsState {
  // UI State ONLY
  isModalOpen: boolean;
  modalMode: 'add' | 'edit' | 'view';
  currentItem: MaterialItem | null;
  filters: MaterialsFilters;
  selectedItems: string[];
  
  // Actions (simples, sin async)
  actions: {
    openModal: (mode, item?) => void;
    closeModal: () => void;
    setFilters: (filters) => void;
    selectItem: (id) => void;
    // ...
  }
}

// ✅ Server state va a hook con TanStack Query
export function useMaterials() {
  const filters = useFilters();
  
  // React Query maneja cache, loading, error
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: materialsApi.fetchItems,
    staleTime: 5 * 60 * 1000,
  });
  
  const createMutation = useMutation({
    mutationFn: materialsApi.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries(['materials']);
    }
  });
  
  // Derived state con filtros
  const filteredItems = useMemo(() => {
    return items.filter(/* filter logic */);
  }, [items, filters]);
  
  return {
    items: filteredItems,
    loading: isLoading,
    createItem: createMutation.mutateAsync,
  };
}
```

**Estimación de esfuerzo**: 8-12 horas (store más complejo del proyecto)

---

### 2. achievementsStore.ts - 🟡 PRIORIDAD MEDIA

**Métricas**:
- 359 líneas
- 6 usos de `produce()`
- Complejidad: Usa `Set` y `Map` (requiere `enableMapSet()`)

**Estructura actual**:
```typescript
import { produce, enableMapSet } from 'immer';
enableMapSet(); // Para Map<> y Set<>

export const useAchievementsStore = create<AchievementsState>()(
  devtools(
    persist(
      (set, get) => ({
        // ✅ CORRECTO: Solo client state (no server data)
        isSetupModalOpen: false,
        completedAchievements: new Set<string>(),
        capabilityProgress: new Map<BusinessCapabilityId, CapabilityProgress>(),
        
        // ✅ CORRECTO: Actions simples (no async)
        completeAchievement: (id, points) => {
          set(produce((state) => {
            state.completedAchievements.add(id); // ❌ Pero usa produce
            state.totalPoints += points || 0;
          }));
        },
      })
    )
  )
);
```

**Análisis**:
- ✅ **Arquitectura correcta**: Solo client state (no server data)
- ✅ **Actions correctos**: Simples, síncronos
- ❌ **Usa produce()**: Debería usar spread operator para Set/Map

**Problemas específicos**:
1. `Set.add()` muta el Set (necesita new Set([...old, item]))
2. `Map.set()` muta el Map (necesita new Map([[...old], [key, value]]))

**Refactor recomendado**:

```typescript
// ✅ DESPUÉS: Sin produce(), inmutabilidad explícita
completeAchievement: (id, points) => {
  set((state) => ({
    completedAchievements: new Set([...state.completedAchievements, id]),
    totalPoints: state.totalPoints + (points || 0),
    lastUpdated: new Date(),
  }));
},

updateCapabilityProgress: (capability, progress) => {
  set((state) => ({
    capabilityProgress: new Map([
      ...state.capabilityProgress,
      [capability, progress]
    ])
  }));
},
```

**Usos de produce()**:
- `openSetupModal()` - línea 177
- `closeSetupModal()` - línea 194
- `completeAchievement()` - línea 211
- `unlockBadge()` - línea 233
- `updateCapabilityProgress()` - línea 251
- `resetAchievements()` - línea 267

**Estimación de esfuerzo**: 3-4 horas (Set/Map requieren cuidado)

---

### 3. paymentsStore.ts - 🟡 PRIORIDAD MEDIA

**Métricas**:
- 339 líneas
- 7 usos de `produce()`
- Patrón: CRUD arrays simples

**Estructura actual**:
```typescript
import { produce } from 'immer';

export const usePaymentsStore = create<PaymentsState>()(
  devtools(
    persist(
      (set, get) => ({
        // ✅ CORRECTO: Estructura simple
        paymentMethods: [],
        paymentGateways: [],
        
        // ❌ PROBLEMA: CRUD operations en store
        addPaymentMethod: (method) => {
          set(produce((state) => {
            state.paymentMethods.push(method); // Array mutation
          }));
        },
        
        updatePaymentMethod: (id, updates) => {
          set(produce((state) => {
            const method = state.paymentMethods.find(m => m.id === id);
            Object.assign(method, updates); // Object mutation
          }));
        },
      })
    )
  )
);
```

**Análisis**:
- ⚠️ **Arquitectura dudosa**: ¿Son payment methods "server state" o "config state"?
- ❌ **Usa produce()**: Debería usar spread operator
- ✅ **No tiene business logic pesada**: Solo CRUD simple

**Refactor recomendado**:

```typescript
// ✅ DESPUÉS: Spread operator para inmutabilidad
addPaymentMethod: (method) => {
  set((state) => ({
    paymentMethods: [...state.paymentMethods, method]
  }));
  get().refreshStats();
},

updatePaymentMethod: (id, updates) => {
  set((state) => ({
    paymentMethods: state.paymentMethods.map(m =>
      m.id === id ? { ...m, ...updates } : m
    )
  }));
},

deletePaymentMethod: (id) => {
  set((state) => ({
    paymentMethods: state.paymentMethods.filter(m => m.id !== id)
  }));
},
```

**Usos de produce()**:
- `addPaymentMethod()` - línea 141
- `updatePaymentMethod()` - línea 151
- `deletePaymentMethod()` - línea 167
- `addPaymentGateway()` - línea 187
- `updatePaymentGateway()` - línea 197
- `deletePaymentGateway()` - línea 213
- `setFilters()` - línea 231

**Estimación de esfuerzo**: 2-3 horas (arrays simples, estructura clara)

---

### 4. assetsStore.ts - 🟢 PRIORIDAD BAJA

**Métricas**:
- 290 líneas
- 5 usos de `produce()`
- Patrón: CRUD arrays simples + modal state

**Estructura actual**:
```typescript
import { produce } from 'immer';

export const useAssetsStore = create<AssetsState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        isModalOpen: false,
        modalMode: 'add',
        currentItem: null,
        
        addItem: (item) => {
          set(produce((state) => {
            state.items.push(item);
          }));
        },
      })
    )
  )
);
```

**Análisis**:
- ✅ **Estructura simple**: Arrays y booleans
- ⚠️ **Tiene modal state**: Patrón correcto (store maneja modal)
- ❌ **Usa produce()**: Debería usar spread operator

**Refactor recomendado**: Idéntico a paymentsStore (spread operator)

**Usos de produce()**:
- `addItem()` - línea 99
- `updateItem()` - línea 109
- `deleteItem()` - línea 122
- `selectItem()` - línea 144
- `deselectItem()` - línea 153

**Estimación de esfuerzo**: 1.5-2 horas (estructura simple)

---

### 5. cashStore.ts - 🟢 PRIORIDAD BAJA

**Métricas**:
- 113 líneas (el más pequeño)
- 6 usos de `produce()`
- Patrón: CRUD arrays simples

**Estructura actual**:
```typescript
import { produce } from 'immer';

export const useCashStore = create<CashState>()(
  devtools(
    persist(
      (set, get) => ({
        moneyLocations: [],
        activeSessions: [],
        sessionHistory: [],
        
        addSession: (session) => {
          set(produce((state) => {
            state.activeSessions.push(session);
          }));
        },
      })
    )
  )
);
```

**Análisis**:
- ✅ **Estructura muy simple**: Solo arrays
- ❌ **Usa produce()**: Debería usar spread operator
- ✅ **No tiene business logic**: CRUD puro

**Refactor recomendado**: Idéntico a otros stores (spread operator)

**Usos de produce()**:
- `setMoneyLocations()` - línea 51
- `setActiveSessions()` - línea 57
- `setSessionHistory()` - línea 63
- `addSession()` - línea 69
- `updateSession()` - línea 75
- `removeSession()` - línea 84

**Estimación de esfuerzo**: 1-1.5 horas (el más simple)

---

## 🎯 Plan de Migración Recomendado

### Fase 1: Stores Simples (Semana 1) - ✅ COMPLETADA (5h)

**Objetivo**: Ganar experiencia con refactors simples

1. ✅ **cashStore.ts** (1h - COMPLETADO)
   - **Resultado**: 6 produce() → spread operator
   - **Validación**: ✅ TypeScript compila
   
2. ✅ **assetsStore.ts** (1.5h - COMPLETADO)
   - **Resultado**: 5 produce() → spread operator
   - **Patrones nuevos**: Conditional array append (selectItem con includes check)
   - **Validación**: ✅ TypeScript compila
   
3. ✅ **paymentsStore.ts** (2.5h - COMPLETADO)
   - **Resultado**: 7 produce() → spread operator
   - **Dual CRUD**: Payment methods + Payment gateways
   - **Validación**: ✅ TypeScript compila

**Patrones aplicados en Fase 1**:
- ✅ Array append: `[...state.array, newItem]`
- ✅ Array update: `state.array.map(item => item.id === id ? {...item, ...updates} : item)`
- ✅ Array filter: `state.array.filter(item => item.id !== id)`
- ✅ Conditional append: `state.array.includes(id) ? state.array : [...state.array, id]`
- ✅ Nested object: `{ ...state.obj, ...updates }`
- ✅ Direct replacement: `set({ array: newArray })`

**Total removido**: 18 usos de produce() (de 33)

---

### Fase 2: Store con Set/Map (Semana 2) - ⏳ EN PROGRESO
   - Estructura más simple
   - Solo arrays, sin complejidad
   - Refactor: 6 produce() → spread operator
   
2. **assetsStore.ts** (1.5-2h)
   - Similar a cashStore
   - Tiene modal state (mantener)
   - Refactor: 5 produce() → spread operator
   
3. **paymentsStore.ts** (2-3h)
   - Arrays simples
   - Dual CRUD (methods + gateways)
   - Refactor: 7 produce() → spread operator

**Validación**: Testear cada store después de refactor
- ✅ TypeScript compila
- ✅ UI se actualiza correctamente
- ✅ Persist funciona (localStorage)

---

### Fase 2: Store con Set/Map (Semana 2) - 3-4 horas

**Objetivo**: Manejar estructuras complejas (Set, Map)

4. **achievementsStore.ts** (3-4h)
   - Usa `Set<string>` y `Map<id, progress>`
   - Requiere inmutabilidad explícita con new Set/Map
   - Refactor: 6 produce() → new Set([...old, item])
   - **Cuidado**: `enableMapSet()` ya no será necesario

**Validación especial**:
- ✅ Set mantiene uniqueness
- ✅ Map mantiene orden de inserción
- ✅ Serialize/deserialize en persist funciona

---

### Fase 3: Store Crítico (Semana 3-4) - 8-12 horas

**Objetivo**: Refactor arquitectónico completo

5. **materialsStore.ts** (8-12h)
   - **NO solo remover produce()**: Requiere refactor arquitectónico
   - Separar client state (UI) de server state (DB data)
   - Mover business logic a custom hook
   - Considerar TanStack Query para server state
   
**Sub-tareas**:

a) **Analizar dependencias** (2h)
   - Auditar todos los componentes que usan `useMaterialsStore`
   - Identificar qué usan UI state vs server state
   - Ejemplo: Modal state vs items array
   
b) **Crear hook separado** (3h)
   - `useMaterials()`: Server state (items, loading, error)
   - `useMaterialsUI()`: UI state (modal, filters, selection)
   - Business logic: createItem, updateItem, etc.
   
c) **Migrar componentes** (2-3h)
   - Actualizar imports en componentes
   - Cambiar de `useMaterialsStore` a `useMaterials` + `useMaterialsUI`
   - Testear cada componente
   
d) **Remover produce()** (1h)
   - Spread operator para actions restantes
   - Simplificar store a solo UI state
   
e) **Evaluación TanStack Query** (2-4h - opcional)
   - POC con materials module
   - Si funciona: Migrar progresivamente
   - Beneficios: cache, revalidation, optimistic updates

**Validación crítica**:
- ✅ Todos los flujos funcionan (crear, editar, eliminar)
- ✅ Stock updates correctos
- ✅ Supplier integration funciona
- ✅ Lazy loading sin stale data
- ✅ Performance igual o mejor

---

## 🔍 Protocolo de Investigación

**IMPORTANTE**: Antes de implementar cualquier patrón desconocido:

1. ✅ **PAUSAR y consultar** `REFACTOR_INVESTIGATION_PROTOCOL.md`
2. ✅ **Investigar en fuentes oficiales** (Zustand docs, React docs, TkDodo blog)
3. ✅ **Documentar hallazgos** y presentar opciones
4. ✅ **Preguntar al usuario** si hay dudas
5. ✅ **Implementar solo después** de validar con comunidad

**Nunca**:
- ❌ Inventar patrones sin validación
- ❌ Aplicar código sin entender el "por qué"
- ❌ Ignorar warnings o usar @ts-ignore como parche

Ver: `REFACTOR_INVESTIGATION_PROTOCOL.md` para detalles completos

---

## 📋 Checklist de Refactor (Por Store)

Para cada store, seguir estos pasos:

### 1. Preparación
- [ ] Leer código completo del store
- [ ] Identificar todos los usos de `produce()`
- [ ] **Identificar patrones desconocidos** → Investigar según protocolo
- [ ] Auditar componentes que consumen el store
- [ ] Crear branch: `refactor/[store-name]-remove-produce`

### 2. Refactor
- [ ] Remover `import { produce } from 'immer'`
- [ ] Convertir cada `produce()` a spread operator:
  ```typescript
  // ❌ ANTES
  set(produce((state) => {
    state.items.push(newItem);
  }));
  
  // ✅ DESPUÉS
  set((state) => ({
    items: [...state.items, newItem]
  }));
  ```
- [ ] Para Set: `new Set([...state.set, item])`
- [ ] Para Map: `new Map([[...state.map], [key, value]])`
- [ ] Para arrays: spread operator + map/filter

### 3. Validación
- [ ] `pnpm -s exec tsc --noEmit` pasa
- [ ] `pnpm -s exec eslint .` pasa
- [ ] Testear manualmente:
  - [ ] Crear item
  - [ ] Editar item
  - [ ] Eliminar item
  - [ ] Filtrar items
  - [ ] Seleccionar items
- [ ] Verificar persist (F12 → Application → Local Storage)
- [ ] Verificar devtools (Redux DevTools)

### 4. Documentación
- [ ] Agregar comentario: `// ✅ Fixed: Removed produce() - uses spread operator`
- [ ] Actualizar este documento con status
- [ ] Commit: `refactor(store): Remove produce() from [store-name] - fix reactivity`

---

## ⚠️ Patrones de Conversión

### Arrays

```typescript
// ❌ ANTES con produce()
addItem: (item) => {
  set(produce((state) => {
    state.items.push(item);
  }));
}

// ✅ DESPUÉS con spread operator
addItem: (item) => {
  set((state) => ({
    items: [...state.items, item]
  }));
}
```

```typescript
// ❌ ANTES con produce()
updateItem: (id, updates) => {
  set(produce((state) => {
    const item = state.items.find(i => i.id === id);
    Object.assign(item, updates);
  }));
}

// ✅ DESPUÉS con spread operator
updateItem: (id, updates) => {
  set((state) => ({
    items: state.items.map(i => 
      i.id === id ? { ...i, ...updates } : i
    )
  }));
}
```

```typescript
// ❌ ANTES con produce()
deleteItem: (id) => {
  set(produce((state) => {
    state.items = state.items.filter(i => i.id !== id);
  }));
}

// ✅ DESPUÉS con spread operator
deleteItem: (id) => {
  set((state) => ({
    items: state.items.filter(i => i.id !== id)
  }));
}
```

### Set

```typescript
// ❌ ANTES con produce()
completeAchievement: (id) => {
  set(produce((state) => {
    state.completedAchievements.add(id);
  }));
}

// ✅ DESPUÉS con spread operator
completeAchievement: (id) => {
  set((state) => ({
    completedAchievements: new Set([...state.completedAchievements, id])
  }));
}
```

```typescript
// ❌ ANTES con produce()
removeAchievement: (id) => {
  set(produce((state) => {
    state.completedAchievements.delete(id);
  }));
}

// ✅ DESPUÉS con spread operator
removeAchievement: (id) => {
  set((state) => {
    const newSet = new Set(state.completedAchievements);
    newSet.delete(id);
    return { completedAchievements: newSet };
  });
}
```

### Map

```typescript
// ❌ ANTES con produce()
updateProgress: (capability, progress) => {
  set(produce((state) => {
    state.capabilityProgress.set(capability, progress);
  }));
}

// ✅ DESPUÉS con spread operator
updateProgress: (capability, progress) => {
  set((state) => ({
    capabilityProgress: new Map([
      ...state.capabilityProgress,
      [capability, progress]
    ])
  }));
}
```

### Nested Objects

```typescript
// ❌ ANTES con produce()
setFilters: (newFilters) => {
  set(produce((state) => {
    Object.assign(state.filters, newFilters);
  }));
}

// ✅ DESPUÉS con spread operator
setFilters: (newFilters) => {
  set((state) => ({
    filters: { ...state.filters, ...newFilters }
  }));
}
```

---

## 📊 Métricas de Éxito

### KPIs por Store

- [ ] **0 usos de produce()** en el archivo final
- [ ] **0 imports de immer** (excepto si se migra a middleware oficial)
- [ ] **TypeScript compila** sin errores
- [ ] **ESLint pasa** sin warnings
- [ ] **Tests pasan** (cuando los tengamos)
- [ ] **Performance igual o mejor** (react-scan)

### KPIs Globales

- [ ] **5/5 stores refactorizados**
- [ ] **33 produce() eliminados**
- [ ] **1,717 líneas auditadas**
- [ ] **0 bugs de reactividad** (como el de suppliersStore)
- [ ] **Documentación actualizada**

---

## 🎓 Lecciones del Caso suppliersStore

### Bug Original
```typescript
// ❌ PROBLEMA: produce() sin middleware
import { produce } from 'immer';

addSupplier: async (data) => {
  const newSupplier = await suppliersService.createSupplier(data);
  set(produce((state) => {
    state.suppliers.push(newSupplier);  // ⚠️ Zustand NO detecta cambio
  }));
}
```

**Por qué fallaba**:
1. `produce()` de Immer retorna un nuevo draft, pero con `===` igual al original
2. Zustand compara con `Object.is(oldState, newState)`
3. Como `produce()` retorna referencia igual, Zustand dice "no hay cambio"
4. Componentes NO se re-renderizan

### Fix Aplicado
```typescript
// ✅ SOLUCIÓN: Spread operator
addSupplier: (newSupplier) => {
  set((state) => ({
    suppliers: [...state.suppliers, newSupplier]  // Nueva referencia
  }));
}
```

**Por qué funciona**:
1. `[...state.suppliers, newSupplier]` crea nuevo array (nueva referencia)
2. `Object.is(oldArray, newArray) === false`
3. Zustand detecta cambio → llama subscriptions
4. Componentes se re-renderizan ✅

### Validación
- ✅ **Antes**: Store tenía 3 suppliers, SelectField mostraba 2
- ✅ **Después**: Store tiene 3 suppliers, SelectField muestra 3
- ✅ **Cross-module**: Crear supplier desde materials → automáticamente aparece en SupplierFields

---

## 🚀 Próximos Pasos

1. **AHORA**: Validar que suppliersStore sigue funcionando correctamente
2. **Esta semana**: Empezar Fase 1 (cashStore → assetsStore → paymentsStore)
3. **Próxima semana**: Fase 2 (achievementsStore con Set/Map)
4. **2 semanas**: Fase 3 (materialsStore refactor arquitectónico)
5. **Opcional**: Evaluar TanStack Query para server state

---

## 📚 Referencias

1. **Bug original**: `ZUSTAND_PRODUCE_BUG_FIX.md`
2. **Arquitectura**: `ZUSTAND_ARCHITECTURE_BEST_PRACTICES.md`
3. **Zustand Docs**: https://zustand.docs.pmnd.rs/guides/immutability
4. **TkDodo Blog**: "Working with Zustand"
5. **Redux Style Guide**: "Immutable Update Patterns"

---

**Conclusión**: Este refactor es crítico para la salud del proyecto. El bug de suppliersStore demuestra que `produce()` sin middleware causa bugs sutiles de reactividad. Debemos migrar los 5 stores restantes para evitar problemas similares en el futuro.

**Estimación total**: 16-26 horas de trabajo (distribuidas en 3-4 semanas)
