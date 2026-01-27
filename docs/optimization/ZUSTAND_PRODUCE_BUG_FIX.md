# 🐛 Bug Fix: Zustand produce() sin Middleware

**Fecha:** 3 Diciembre 2025  
**Severidad:** 🔴 CRÍTICO  
**Impacto:** Reactividad rota en stores con `produce()`  
**Status:** ✅ 1/5 stores corregidas

---

## 📋 Resumen Ejecutivo

### Problema Identificado

**Root Cause:** Stores usando `produce()` de Immer **sin el middleware oficial de Zustand** rompen la reactividad del state manager.

**Síntoma:** Store se actualiza pero componentes NO re-renderizan porque Zustand no detecta cambios de referencia.

### Caso Real - SuppliersStore Bug

**Contexto:**
- Usuario crea nuevo supplier en modal dentro de MaterialFormDialog
- Store se actualiza correctamente (console.log confirma 3 suppliers)
- SelectField en UI solo muestra 2 suppliers (no refleja el nuevo)

**Causa:**
```typescript
// ❌ PROBLEMA: produce() sin middleware
setSuppliers: (suppliers) => {
  set(
    produce((state: SuppliersState) => {
      state.suppliers = suppliers.map(...);
    })
  );
}
```

**Explicación técnica:**
1. `produce()` muta el estado pero mantiene misma referencia de objeto
2. Zustand compara referencias: `prevState === nextState` → `true`
3. Zustand asume "no hay cambios" → NO notifica a subscribers
4. `useShallow` selector no se dispara → componente no re-renderiza

**Quote de documentación oficial:**
> "Zustand checks if the state has actually changed, so since both the current state and the next state are equal, Zustand will skip calling the subscriptions."  
> — [zustand.docs.pmnd.rs/integrations/immer-middleware](https://zustand.docs.pmnd.rs/integrations/immer-middleware)

---

## ✅ Solución Aplicada

### SuppliersStore - ✅ CORREGIDO (3 Dic 2025)

**Refactor:** Eliminado `produce()`, migrado a patrón inmutable estándar

**Cambios realizados:**

#### 1. Removed import
```diff
- import { produce } from 'immer';
```

#### 2. setSuppliers
```typescript
// ✅ DESPUÉS: Nueva referencia → Zustand detecta cambio
setSuppliers: (suppliers) => {
  set({
    suppliers: suppliers.map((supplier) => ({
      ...supplier,
      updated_at: supplier.updated_at || new Date().toISOString(),
    })),
  });
}
```

#### 3. addSupplier
```typescript
// ✅ DESPUÉS: Spread operator
set((state) => ({
  suppliers: [...state.suppliers, createdSupplier],
  loading: false,
}));
```

#### 4. updateSupplier
```typescript
// ✅ DESPUÉS: Array.map() inmutable
set((state) => ({
  suppliers: state.suppliers.map((s) => (s.id === id ? updatedSupplier : s)),
  loading: false,
}));
```

#### 5. deleteSupplier
```typescript
// ✅ DESPUÉS: Array.filter() inmutable
set((state) => ({
  suppliers: state.suppliers.filter((s) => s.id !== id),
  selectedSuppliers: state.selectedSuppliers.filter((sid) => sid !== id),
  loading: false,
}));
```

#### 6. setFilters, selectSupplier, deselectSupplier
```typescript
// ✅ DESPUÉS: Spread operator para objetos/arrays
setFilters: (filters) =>
  set((state) => ({
    filters: { ...state.filters, ...filters },
  })),

selectSupplier: (id) =>
  set((state) => ({
    selectedSuppliers: state.selectedSuppliers.includes(id)
      ? state.selectedSuppliers
      : [...state.selectedSuppliers, id],
  })),

deselectSupplier: (id) =>
  set((state) => ({
    selectedSuppliers: state.selectedSuppliers.filter((sid) => sid !== id),
  })),
```

**Resultado:** SelectField ahora se actualiza correctamente al crear nuevos suppliers.

---

## ⚠️ Stores Pendientes de Corrección

### Auditoría de Stores con `produce()`

| Store | Ubicación | Prioridad | Status |
|-------|-----------|-----------|--------|
| ✅ suppliersStore | `src/store/suppliersStore.ts` | 🔴 Alta | CORREGIDO |
| ⚠️ materialsStore | `src/store/materialsStore.ts` | 🔴 Alta | PENDIENTE |
| ⚠️ paymentsStore | `src/store/paymentsStore.ts` | 🟡 Media | PENDIENTE |
| ⚠️ cashStore | `src/store/cashStore.ts` | 🟡 Media | PENDIENTE |
| ⚠️ assetsStore | `src/store/assetsStore.ts` | 🟢 Baja | PENDIENTE |
| ⚠️ achievementsStore | `src/store/achievementsStore.ts` | 🟢 Baja | PENDIENTE |

### Priorización

**🔴 Alta (materialsStore):**
- Store más grande del proyecto (~400 líneas)
- Más de 20 acciones usando `produce()`
- Usado en módulo crítico (supply-chain/materials)
- Potencial bug similar al de suppliers

**🟡 Media (paymentsStore, cashStore):**
- Módulos de transacciones financieras
- Datos críticos pero menos frecuencia de uso que materials
- Refactor puede esperar sprint actual

**🟢 Baja (assetsStore, achievementsStore):**
- Módulos secundarios
- achievementsStore usa `enableMapSet` (requiere análisis especial)
- Refactor puede agendarse para próximo sprint

---

## 🎯 Plan de Acción

### Fase 1: Documentación ✅
- [x] Documento técnico del bug
- [x] Actualizado `ZUSTAND_SELECTOR_VALIDATION.md` con sección Immer
- [x] Actualizado `GAPS_ANALYSIS_FINAL_REVIEW.md` con warning
- [x] Creado checklist para futuras stores

### Fase 2: Corrección Crítica ✅
- [x] suppliersStore migrado a patrón inmutable
- [x] Tests de TypeScript pasando
- [x] Validado en navegador: SelectField actualiza correctamente

### Fase 3: Auditoría Masiva ⚠️ PENDIENTE
- [ ] materialsStore - refactor completo (~20 acciones)
- [ ] paymentsStore - refactor
- [ ] cashStore - refactor
- [ ] assetsStore - refactor
- [ ] achievementsStore - análisis especial por `enableMapSet`

### Fase 4: Prevención 📝 RECOMENDADO
- [ ] ESLint rule custom: bloquear `import { produce } from 'immer'`
- [ ] Pre-commit hook: detectar patrón `set(produce(`
- [ ] Template de store con patrón inmutable correcto

---

## 📚 Patrón Correcto - Referencia Rápida

### ✅ Patrón Inmutable Estándar (RECOMENDADO)

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useStore = create<State>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        
        // ✅ CREATE
        addItem: (item) =>
          set((state) => ({
            items: [...state.items, item],
          })),
        
        // ✅ UPDATE
        updateItem: (id, updates) =>
          set((state) => ({
            items: state.items.map((i) => 
              i.id === id ? { ...i, ...updates } : i
            ),
          })),
        
        // ✅ DELETE
        deleteItem: (id) =>
          set((state) => ({
            items: state.items.filter((i) => i.id !== id),
          })),
        
        // ✅ BULK UPDATE
        setItems: (items) => set({ items }),
      }),
      { name: 'store' }
    ),
    { name: 'Store' }
  )
);
```

### ❌ Anti-Patrón (NO USAR)

```typescript
import { produce } from 'immer'; // ❌ NO IMPORTAR

// ❌ NUNCA USAR sin middleware oficial
set(
  produce((state) => {
    state.items.push(newItem); // Muta pero no crea nueva referencia
  })
);
```

### ✅ Alternativa con Middleware (SI SE NECESITA IMMER)

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer'; // ✅ Middleware oficial

export const useStore = create<State>()(
  immer((set) => ({ // ✅ Wrapper immer
    items: [],
    addItem: (item) =>
      set((state) => {
        state.items.push(item); // ✅ Middleware maneja reactividad
      }),
  }))
);
```

---

## 🔍 Cómo Detectar el Bug

### En código:
```bash
# Buscar imports problemáticos
grep -r "import { produce } from 'immer'" src/store/

# Verificar si está usando middleware oficial
grep -r "from 'zustand/middleware/immer'" src/store/
```

### En runtime:
1. Store se actualiza (confirmar con DevTools o console.log)
2. Componente NO re-renderiza
3. `useShallow` selector no dispara
4. Datos correctos en store pero UI desactualizada

### Síntomas comunes:
- SelectFields no muestran opciones nuevas
- Listas no reflejan items agregados/eliminados
- Modales no se cierran/abren correctamente
- Stats/métricas no actualizan después de acciones

---

## 📖 Referencias

### Documentación Oficial
- [Zustand - Immer Middleware](https://zustand.docs.pmnd.rs/integrations/immer-middleware)
- [Zustand - Immutable State](https://zustand.docs.pmnd.rs/guides/immutable-state-and-merging)
- [Immer - Pitfalls](https://immerjs.github.io/immer/pitfalls)

### Documentación Interna
- `docs/optimization/ZUSTAND_SELECTOR_VALIDATION.md` - Sección "3. Immer Middleware"
- `docs/optimization/research/GAPS_ANALYSIS_FINAL_REVIEW.md` - GAP 3 actualizado
- `.github/copilot-instructions.md` - Patrones de store

---

## ✅ Checklist Post-Fix

Al corregir una store con este bug:

- [ ] Eliminar `import { produce } from 'immer'`
- [ ] Refactorizar todas las acciones con `set(produce(...))` a patrón inmutable
- [ ] Ejecutar `pnpm -s exec tsc --noEmit` (verificar tipos)
- [ ] Ejecutar `pnpm -s exec eslint .` (verificar linting)
- [ ] Probar UI: crear/editar/eliminar items
- [ ] Verificar cross-module: otras páginas que usen la store
- [ ] Actualizar este documento con status ✅

---

**Última actualización:** 3 Dic 2025  
**Próxima auditoría recomendada:** materialsStore (sprint actual)
