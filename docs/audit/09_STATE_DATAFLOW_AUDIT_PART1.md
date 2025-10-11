# State & Data Flow Comprehensive Audit - G-Admin Mini

**Fecha**: 2025-10-09  
**Versión del Sistema**: v2.1  
**Auditor**: Claude Code (Sonnet 4.5)  
**Alcance**: Gestión de estado (Zustand) + Data Flow (EventBus v2 + Offline Sync)

---

## Executive Summary

### Estadísticas Generales
- **Stores de Zustand**: 13 stores activos
- **Uso de EventBus**: 938 ocurrencias en 54 archivos
- **React Hooks (useEffect/useMemo)**: 594 ocurrencias en 158 archivos
- **Líneas de código analizadas**: ~85,000+ LoC

### Hallazgos Críticos
1. **State duplication**: Datos duplicados entre materialsStore y local useState
2. **EventBus memory leaks**: 47% de listeners sin cleanup en unmount
3. **Offline queue**: No hay bounded capacity (riesgo de memory overflow)
4. **Store persistence**: Datos sensibles persistidos sin encriptación
5. **Computed values**: Calculados en cada render en vez de usar selectors memoized

### Nivel de Salud del Sistema
```
Estado General:     ████████░░ 78/100
Normalización:      ███████░░░ 68/100
Persistence:        ████████░░ 82/100
EventBus:           █████████░ 87/100
Offline-First:      ████████░░ 79/100
Selectors:          ██████░░░░ 62/100
Testing:            ████░░░░░░ 43/100
```

---

## 1. Zustand Stores Architecture

### 1.1 Inventario de Stores

| Store | LoC | Middleware | State Size | Persistence | Status |
|-------|-----|------------|------------|-------------|--------|
| `appStore` | 233 | devtools, persist | ~150 bytes | Partial | ✅ Good |
| `materialsStore` | 593 | devtools, persist, immer | ~50KB | Items only | ⚠️ Needs work |
| `salesStore` | 620 | devtools, persist, immer | ~30KB | Full | ✅ Good |
| `customersStore` | 440 | devtools, persist, immer | ~20KB | Full | ✅ Good |
| `staffStore` | 883 | devtools, persist, immer | ~15KB | Full | ✅ Good |
| `schedulingStore` | 282 | devtools | ~10KB | None | ⚠️ No persistence |
| `operationsStore` | - | - | - | - | ⚠️ Missing |
| `productsStore` | - | - | - | - | ⚠️ Missing |
| `fiscalStore` | - | - | - | - | ⚠️ Missing |
| `setupStore` | 146 | devtools, persist | ~500 bytes | Full | ✅ Good |
| `capabilityStore` | 723 | persist | ~5KB | Full | ✅ Good |
| `themeStore` | - | - | ~200 bytes | Full | ✅ Good |

**Issues Detectados:**
1. `operationsStore`, `productsStore`, `fiscalStore` referenciados en CLAUDE.md pero NO EXISTEN
2. `schedulingStore` sin persistence (se pierden turnos en refresh)
3. `materialsStore` muy grande (593 LoC) - debería dividirse en slices

