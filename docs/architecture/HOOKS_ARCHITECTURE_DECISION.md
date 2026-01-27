# Architecture Decision: Hook Location Strategy

**Date**: 2025-01-28
**Status**: 🔴 DECISION REQUIRED
**Context**: Resolving dual-pattern issue for `useScheduling` hook location

---

## 🎯 Problem Statement

El hook `useScheduling` actualmente existe en dos ubicaciones:

1. **Implementación real**: `src/pages/admin/resources/scheduling/hooks/useScheduling.ts` (499 líneas)
2. **Re-export en módulo**: `src/modules/scheduling/hooks/index.ts` (solo re-exporta)

Esto genera **duplicación arquitectónica** y violación del principio **Single Source of Truth**.

---

## 📚 Industry Best Practices (2024-2025)

### 1. Feature-Sliced Design (FSD)

**Source**: [Feature-Sliced Design Architecture](https://feature-sliced.design/docs)

#### Principios Clave:

> "Segment names should describe **purpose** (the why), not essence (the what). Names like 'components', 'hooks', 'modals' should not be used."

**Estructura Recomendada:**
```
📂 features/
   📂 scheduling/
      📂 model/       ← hooks van aquí (business logic)
      📂 ui/          ← components
      📂 api/         ← API calls
```

**Conclusión FSD**: Los hooks deben estar en el **módulo feature** (`src/modules/scheduling/hooks/`), NO en páginas.

---

### 2. Single Source of Truth (SSOT)

**Source**: [State Management Anti Patterns](https://www.sourceallies.com/2020/11/state-management-anti-patterns/)

> "When state is duplicated, the app loses its single source of truth. Each piece of state should have ONE component that owns it."

**Anti-Pattern Identificado:**
- ❌ Hook implementation en `/pages`
- ❌ Re-export en `/modules`
- ❌ Dos rutas de import posibles → confusión

**Solución SSOT**: La implementación debe estar en **UN SOLO LUGAR** (preferiblemente en el módulo).

---

### 3. React Folder Structure (2025)

**Source**: [React Folder Structure in 5 Steps](https://www.robinwieruch.de/react-folder-structure/)

> "Hooks which are only used by one component should remain in the component's file. Only **reusable hooks** end up in the hooks/ folder."

**Clasificación del hook `useScheduling`:**
- ✅ **Reusable**: Usado por múltiples componentes (SchedulingPage, SchedulingWidget, Dashboard)
- ✅ **Complex**: 499 líneas de lógica de negocio
- ✅ **Feature-specific**: Pertenece al dominio Scheduling

**Conclusión**: Debe estar en `src/modules/scheduling/hooks/` (no en páginas).

---

### 4. Monorepo Best Practices

**Source**: [Managing TypeScript Packages in Monorepos](https://nx.dev/blog/managing-ts-packages-in-monorepos)

> "Split logic into separate packages to create smaller, self-contained, and maintainable units. Common structures include shared UI components packages."

**Patrón Identificado:**
- Módulos = "packages" internos
- `/modules` = código reutilizable y público
- `/pages` = código específico de rutas

**Conclusión**: Hooks de dominio pertenecen a `/modules`, no a `/pages`.

---

## 🔍 Analysis of Current Project Architecture

### Patrón Actual en el Proyecto

Análisis de módulos existentes:

| Módulo              | Hook Location                              | Líneas | Pattern         |
|---------------------|-------------------------------------------|--------|-----------------|
| cash-management     | `/modules/cash-management/hooks/`         | ~200   | ✅ Module-first |
| finance-corporate   | `/modules/finance-corporate/hooks/`       | ~250   | ✅ Module-first |
| delivery            | `/modules/fulfillment/delivery/hooks/`    | ~150   | ✅ Module-first |
| sales/ecommerce     | `/modules/sales/ecommerce/hooks/`         | ~100   | ✅ Module-first |
| **scheduling**      | `/pages/.../scheduling/hooks/` (re-export)| 499    | ❌ **Pages-first** |
| customers           | `/pages/admin/core/crm/customers/hooks/`  | ~200   | ❌ Pages-first  |

**Observación Crítica:**
- ✅ **Módulos nuevos** (cash, finance-corporate, delivery, ecommerce) → hooks en `/modules`
- ❌ **Módulos legacy** (scheduling, customers) → hooks en `/pages`

---

### ¿Por qué existe `/pages/admin/resources/scheduling/`?

**Hipótesis**: Legacy architecture

Cuando el proyecto comenzó, la estructura era:
```
src/pages/admin/
  ├── resources/scheduling/
  │   ├── hooks/
  │   ├── components/
  │   └── page.tsx
```

Luego se introdujo la arquitectura de **módulos** (`src/modules/`), pero el código legacy no se migró completamente.

---

## 🎯 Recommended Architecture (Industry Standard)

### Option A: Module-First (✅ RECOMMENDED)

**Implementation en módulo:**
```
src/modules/scheduling/
  ├── hooks/
  │   ├── useScheduling.ts        ← MOVE HERE (single source)
  │   ├── useAppointments.ts      ← MOVE HERE
  │   ├── useAvailability.ts      ← MOVE HERE
  │   └── index.ts                ← Central export
  ├── services/
  │   └── schedulingApi.ts        ← MOVE HERE
  ├── types/
  │   └── index.ts                ← MOVE HERE
  ├── components/
  │   └── SchedulingWidget.tsx
  └── manifest.tsx
```

**Consumo:**
```tsx
// Desde cualquier módulo o componente
import { useScheduling } from '@/modules/scheduling/hooks';

// O vía ModuleRegistry (dynamic import)
const { useScheduling } = await registry.getExports('scheduling').hooks.useScheduling();
```

**Pages solo mantiene:**
```
src/pages/admin/resources/scheduling/
  ├── page.tsx                    ← Solo routing logic
  └── components/                 ← Page-specific UI (opcional)
```

---

### Option B: Pages-First (❌ NOT RECOMMENDED)

**Mantener en páginas:**
```
src/pages/admin/resources/scheduling/
  ├── hooks/
  │   └── useScheduling.ts        ← KEEP HERE
  ├── page.tsx
```

**Problema:**
- ❌ Viola FSD (hooks deben estar en feature modules)
- ❌ Viola SSOT (re-export crea duplicación)
- ❌ Inconsistente con módulos nuevos
- ❌ Dificulta reusabilidad cross-module

---

## ✅ Recommended Decision: MIGRATE TO MODULE-FIRST

### Justificación:

1. **Industry Standards Alignment:**
   - ✅ Sigue Feature-Sliced Design
   - ✅ Respeta Single Source of Truth
   - ✅ Compatible con Monorepo best practices

2. **Project Consistency:**
   - ✅ Alinea con módulos nuevos (cash, finance-corporate)
   - ✅ Establece patrón claro para futuros módulos
   - ✅ Elimina confusión arquitectónica

3. **Maintainability:**
   - ✅ Un solo lugar para hooks de scheduling
   - ✅ Imports más claros (`@/modules/scheduling/hooks`)
   - ✅ Mejor tree-shaking y code splitting

4. **Future-Proof:**
   - ✅ Facilita migración a monorepo real (si es necesario)
   - ✅ Compatible con micro-frontends
   - ✅ Mejor aislamiento de dependencias

---

## 📝 Migration Plan

### Phase 1: Move Hook Implementation (30 min)

```bash
# 1. Move hook files
mv src/pages/admin/resources/scheduling/hooks/useScheduling.ts \
   src/modules/scheduling/hooks/useScheduling.ts

mv src/pages/admin/resources/scheduling/hooks/useAppointments.ts \
   src/modules/scheduling/hooks/useAppointments.ts

mv src/pages/admin/resources/scheduling/hooks/useAvailability.ts \
   src/modules/scheduling/hooks/useAvailability.ts

# 2. Move services
mv src/pages/admin/resources/scheduling/services/ \
   src/modules/scheduling/services/

# 3. Move types
mv src/pages/admin/resources/scheduling/types/ \
   src/modules/scheduling/types/
```

### Phase 2: Update Imports (15 min)

**Update all imports from:**
```tsx
import { useScheduling } from '@/pages/admin/resources/scheduling/hooks/useScheduling';
```

**To:**
```tsx
import { useScheduling } from '@/modules/scheduling/hooks';
```

**Files to update:**
- `src/modules/scheduling/components/SchedulingWidget.tsx`
- `src/pages/admin/resources/scheduling/page.tsx`
- Any other components using the hook

### Phase 3: Update Module Index (5 min)

**Update `src/modules/scheduling/hooks/index.ts`:**

```tsx
// OLD (re-export from pages)
export { useScheduling } from '../../../pages/admin/resources/scheduling/hooks/useScheduling';

// NEW (direct export)
export { useScheduling } from './useScheduling';
export { useAppointments } from './useAppointments';
export { useAvailability } from './useAvailability';
```

### Phase 4: Cleanup Pages (5 min)

**Remove empty directories:**
```bash
rm -rf src/pages/admin/resources/scheduling/hooks/
rm -rf src/pages/admin/resources/scheduling/services/
rm -rf src/pages/admin/resources/scheduling/types/
```

**Keep only:**
```
src/pages/admin/resources/scheduling/
  ├── page.tsx                    ← Routing component
  └── components/                 ← Page-specific UI (if any)
```

---

## 🎯 Expected Final Structure

```
src/
├── modules/
│   └── scheduling/
│       ├── hooks/
│       │   ├── useScheduling.ts          ✅ MOVED HERE (499 lines)
│       │   ├── useAppointments.ts        ✅ MOVED HERE
│       │   ├── useAvailability.ts        ✅ MOVED HERE
│       │   ├── useSchedulingAlerts.ts    ✅ MOVED HERE
│       │   ├── useSchedulingPage.ts      ✅ MOVED HERE
│       │   ├── useShiftForm.tsx          ✅ MOVED HERE
│       │   └── index.ts                  ✅ Direct exports
│       ├── services/
│       │   └── schedulingApi.ts          ✅ MOVED HERE
│       ├── types/
│       │   └── schedulingTypes.ts        ✅ MOVED HERE
│       ├── components/
│       │   └── SchedulingWidget.tsx
│       └── manifest.tsx
│
└── pages/
    └── admin/
        └── resources/
            └── scheduling/
                ├── page.tsx              ✅ ONLY routing
                └── components/           ✅ Page-specific UI (optional)
                    └── SchedulingPageLayout.tsx
```

---

## 📊 Benefits of Migration

| Aspect              | Before (Pages-first)                      | After (Module-first)               |
|---------------------|-------------------------------------------|------------------------------------|
| **SSOT**            | ❌ Dual location (pages + re-export)       | ✅ Single location (module)        |
| **Consistency**     | ❌ Differs from new modules                | ✅ Matches cash, finance, delivery |
| **Imports**         | ❌ Complex path (`@/pages/.../hooks`)      | ✅ Clean path (`@/modules/.../`)   |
| **Discoverability** | ❌ Hard to find (nested in pages)          | ✅ Easy to find (in module)        |
| **Reusability**     | ❌ Tied to page structure                  | ✅ Truly reusable                  |
| **FSD Compliance**  | ❌ Violates segment naming                 | ✅ Follows FSD principles          |

---

## 🚨 Breaking Changes: NONE

Esta migración es **backward-compatible** si se hace correctamente:

1. ✅ Update imports automáticamente (Find & Replace en IDE)
2. ✅ No cambia la API del hook (misma interfaz)
3. ✅ No afecta a componentes que ya lo usan
4. ✅ Tests siguen funcionando (solo actualizar imports)

---

## 📚 References

- [Feature-Sliced Design Architecture in React](https://serhiikoziy.medium.com/feature-sliced-design-architecture-in-react-with-typescript-447dc5e6a411)
- [React Folder Structure in 5 Steps (2025)](https://www.robinwieruch.de/react-folder-structure/)
- [State Management Anti Patterns - Source Allies](https://www.sourceallies.com/2020/11/state-management-anti-patterns/)
- [Managing TypeScript Packages in Monorepos - Nx](https://nx.dev/blog/managing-ts-packages-in-monorepos)
- [React Architecture Patterns and Best Practices (2025)](https://www.bacancytechnology.com/blog/react-architecture-patterns-and-best-practices)

---

## ✅ Decision

**RECOMMENDED**: **Migrate to Module-First Architecture**

**Reasoning**:
1. ✅ Aligns with industry best practices (FSD, SSOT, Monorepo patterns)
2. ✅ Consistent with project's own new modules
3. ✅ Better maintainability and discoverability
4. ✅ No breaking changes
5. ✅ Future-proof architecture

**Next Steps**:
1. Get approval from team/Diego
2. Execute migration plan (estimated 1 hour)
3. Update documentation
4. Update future module creation guidelines

---

**Created**: 2025-01-28
**Author**: Claude Code (based on industry research)
**Status**: Awaiting approval
