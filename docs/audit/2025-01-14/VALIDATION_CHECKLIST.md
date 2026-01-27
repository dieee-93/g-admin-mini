# 🔍 LISTA DE DECISIONES TÉCNICAS CRÍTICAS PARA VALIDAR

**Proyecto**: G-Admin Mini ERP  
**Contexto**: Estudiante/aficionado - Muchas decisiones técnicas hechas por investigación  
**Objetivo**: Identificar qué aspectos necesitan validación por expertos

---

## 📊 CATEGORÍAS DE PRIORIDAD

- 🔴 **CRÍTICO** - Puede causar errores graves, pérdida de datos o bugs de producción
- 🟡 **IMPORTANTE** - Afecta performance, mantenibilidad o escalabilidad
- 🟢 **MEJORA** - Optimizaciones, convenciones, DX (Developer Experience)

---

## 1️⃣ ARQUITECTURA CORE (🔴 CRÍTICO)

### 1.1 Module Registry Pattern (WordPress-inspired)
**Status**: Implementado  
**Decisión**: Sistema de plugins con HookPoints + EventBus + Module Exports  
**Archivos**: `src/lib/modules/*`, `src/modules/*/manifest.tsx`

**❓ Preguntas para Validar**:
- [ ] ¿El patrón de HookPoints es la mejor manera de lograr extensibilidad entre módulos?
- [ ] ¿El sistema de prioridades en hooks (priority: number) es suficientemente robusto?
- [ ] ¿El singleton registry puede causar problemas de memoria o performance?
- [ ] ¿La carga dinámica de módulos (async setup functions) está bien implementada?

**📚 Referencias**:
- `src/lib/modules/ModuleRegistry.ts`
- `src/modules/README.md` (317 líneas)
- `docs/02-architecture/MODULE_REGISTRY_MIGRATION_PLAN.md`

**🤔 Riesgo**: Si el patrón está mal diseñado, toda la extensibilidad del sistema falla

---

### 1.2 Capability System v4.0 (Feature Flags)
**Status**: Implementado  
**Decisión**: 3 capas (User Choices → System Features → Module Requirements)  
**Archivos**: `src/config/BusinessModelRegistry.ts`, `src/config/FeatureRegistry.ts`

**❓ Preguntas para Validar**:
- [ ] ¿88 features es demasiado granular o es correcto?
- [ ] ¿La cascada de dependencias (capability → features → modules) puede generar bugs?
- [ ] ¿El cálculo dinámico de features v3.0 (`useDynamicCapabilities`) tiene edge cases?
- [ ] ¿La validación de permisos DESPUÉS de features es el orden correcto?

**📚 Referencias**:
- `docs/capabilities/DEVELOPER_GUIDE.md` (1477 líneas)
- `src/config/FeatureRegistry.ts` (88 features)
- `CLAUDE.md` - Validation checkpoints

**🤔 Riesgo**: Features mal configuradas pueden mostrar módulos sin permisos o viceversa

---

### 1.3 EventBus v2 (Pub/Sub)
**Status**: Implementado  
**Decisión**: EventBus síncrono in-memory para comunicación cross-module  
**Archivos**: `src/shared/events/ModuleEventBus.ts`

**❓ Preguntas para Validar**:
- [ ] ¿Un EventBus síncrono puede causar bloqueos en operaciones pesadas?
- [ ] ¿La falta de persistencia (in-memory) puede causar pérdida de eventos críticos?
- [ ] ¿El namespace pattern (`module.entity.action`) es suficiente para evitar colisiones?
- [ ] ¿Debería implementarse un Event Store (audit log) para eventos críticos?

**📚 Referencias**:
- `src/shared/events/ModuleEventBus.ts`
- `docs/achievements/` - Event-driven achievements pattern
- Tests: `src/lib/events/__tests__/`

**🤔 Riesgo**: Eventos perdidos o deadlocks en cascadas de eventos

---

## 2️⃣ STATE MANAGEMENT (🔴 CRÍTICO)

### 2.1 TanStack Query vs Zustand Split
**Status**: Implementado (migración parcial)  
**Decisión**: TanStack Query para server state, Zustand SOLO para UI state  
**Archivos**: `src/modules/cash/*` (referencia), otros módulos en proceso

**❓ Preguntas para Validar**:
- [ ] ¿La separación server state (TanStack) vs UI state (Zustand) es correcta?
- [ ] ¿Los Facade Hooks (combinan TanStack + Zustand) son un anti-pattern?
- [ ] ¿La migración gradual puede causar inconsistencias entre módulos?
- [ ] ¿El query key factory pattern está bien implementado?

**📚 Referencias**:
- Cash module (gold standard): `src/modules/cash/`
- `docs/cross-module/CROSS_MODULE_DATA_ARCHITECTURE.md`
- Supermemory: "TanStack Query + Zustand best practices"

**🤔 Riesgo**: Módulos usando Zustand para server state → cache bugs, re-renders innecesarios

---

### 2.2 Atomic Selectors Pattern
**Status**: Implementado  
**Decisión**: Atomic selectors (`state => state.products`) en lugar de whole-store  
**Archivos**: Zustand stores en `src/store/*`, `src/modules/*/store/*`

**❓ Preguntas para Validar**:
- [ ] ¿Los atomic selectors están correctamente implementados en todos los stores?
- [ ] ¿useShallow() se usa donde debería?
- [ ] ¿Hay selectors que devuelven new objects (rompe memoización)?
- [ ] ¿Los selectors derivados deberían estar en el store o en hooks?

**📚 Referencias**:
- Supermemory: "Atomic selectors, store-first approach"
- Validated by: TkDodo, Zustand docs, LogRocket

**🤔 Riesgo**: Re-renders innecesarios (target: 85% reducción)

---

### 2.3 Modal State Strategy
**Status**: Implementado  
**Decisión**: Local state (useState) por defecto, Zustand solo si cross-component  
**Archivos**: Múltiples componentes de modales

**❓ Preguntas para Validar**:
- [ ] ¿Todos los modales usan local state correctamente?
- [ ] ¿Hay casos donde global state es necesario pero no se usa?
- [ ] ¿La apertura de modales desde otros módulos (via events) funciona bien?

**📚 Referencias**:
- Supermemory: "Modal state optimization, 85% re-render reduction"
- Validated by: 40+ industry sources

**🤔 Riesgo**: Performance degradation con muchos modales abiertos

---

## 3️⃣ PRECISIÓN MATEMÁTICA (🔴 CRÍTICO)

### 3.1 DecimalUtils Pattern
**Status**: Implementado  
**Decisión**: NUNCA usar operadores nativos (+, -, *, /), siempre DecimalUtils  
**Archivos**: `src/lib/decimal/decimalUtils.ts` (747 líneas)

**❓ Preguntas para Validar**:
- [ ] ¿La implementación de DecimalUtils con Decimal.js es correcta?
- [ ] ¿Los 4 dominios (financial/recipe/inventory/tax) son suficientes?
- [ ] ¿El banker's rounding (HALF_EVEN) es apropiado para Argentina?
- [ ] ¿Todas las conversiones a .toString() antes de pasar a DecimalUtils son necesarias?
- [ ] ¿El patrón "mantener Decimal hasta el final, .toNumber() solo para storage" es correcto?

**📚 Referencias**:
- `src/lib/decimal/decimalUtils.ts` (747 líneas)
- `CONTRIBUTING.md` - Full precision guide
- VS Code snippets: `.vscode/decimal-utils.code-snippets`
- Linter: `lint:precision`, Tests: `test:precision`

**🤔 Riesgo**: Errores de precisión → pérdida estimada $8,000/año

---

### 3.2 Domain-Specific Precision
**Status**: Implementado  
**Decisión**: Financial (2 dec), Recipe (3 dec), Inventory (4 dec), Tax (6 dec)  

**❓ Preguntas para Validar**:
- [ ] ¿6 decimales para tax es suficiente para IVA + Ingresos Brutos + otros impuestos?
- [ ] ¿3 decimales para recetas es correcto? (documentación dice 6 para food service)
- [ ] ¿4 decimales para inventory puede causar inconsistencias en conversiones de unidades?

**📚 Referencias**:
- `src/config/decimal-config.ts`
- Supermemory: "Food service recipe costing requires 6 decimal precision"
- `docs/teoria-administrativa/FOOD_SERVICE.md`

**🤔 Riesgo**: CONFLICTO - Supermemory dice 6 decimales para recetas, código usa 3

---

### 3.3 Margin vs Markup Conversions
**Status**: Implementado (recién agregado)  
**Decisión**: Métodos de conversión bidireccional en DecimalUtils  

**❓ Preguntas para Validar**:
- [ ] ¿Las fórmulas de conversión son matemáticamente correctas?
  - `margin = markup / (1 + markup)`
  - `markup = margin / (1 - margin)`
- [ ] ¿La validación de margin >= 100% es suficiente?
- [ ] ¿Debería haber un límite superior para markup (ej. 1000%)?

**📚 Referencias**:
- `src/lib/decimal/decimalUtils.ts` (lines 360-450)
- `docs/features/MARGIN_CALCULATOR.md`
- `docs/teoria-administrativa/02-MARGENES-Y-PRICING.md`

**🤔 Riesgo**: Fórmulas incorrectas → pricing errors

---

## 4️⃣ DATABASE & DATA LAYER (🔴 CRÍTICO)

### 4.1 Supabase RLS (Row Level Security)
**Status**: Implementado (parcial)  
**Decisión**: Supabase RLS para autorización a nivel de base de datos  

**❓ Preguntas para Validar**:
- [ ] ¿Las políticas RLS cubren todos los casos de edge (ej. multi-tenant)?
- [ ] ¿El fallback a validación de service layer es robusto?
- [ ] ¿JWT tokens tienen el tamaño correcto para todos los roles/permisos?
- [ ] ¿RLS puede causar N+1 queries en ciertos casos?

**📚 Referencias**:
- Supabase schema (si existe)
- `src/lib/supabase/` (cliente)
- Permisos: `docs/permissions/`

**🤔 Riesgo**: Bypass de autorización → data leaks

---

### 4.2 Double-Entry Accounting Pattern
**Status**: Implementado (Cash module)  
**Decisión**: Transactions balancean a 0, audit trail en JSONB  

**❓ Preguntas para Validar**:
- [ ] ¿El patrón de double-entry es contablemente correcto?
- [ ] ¿Las transacciones son atómicas en todos los casos?
- [ ] ¿El audit trail (status_history JSONB) es performante para consultas?
- [ ] ¿Debería usarse una tabla separada para audit en lugar de JSONB?

**📚 Referencias**:
- `src/modules/cash/` - Reference implementation
- Supermemory: "Double-entry accounting, all transactions balance to zero"
- Validated against: SAP, Oracle, NetSuite, Microsoft Dynamics 365

**🤔 Riesgo**: Inconsistencias contables, fallos en auditorías

---

### 4.3 Idempotency Keys Pattern
**Status**: Implementado (Cash module)  
**Decisión**: Idempotency keys para evitar duplicados (92% reducción)  

**❓ Preguntas para Validar**:
- [ ] ¿El patrón de idempotency keys está implementado en TODOS los módulos críticos?
- [ ] ¿El key generation (timestamp + userId?) es suficientemente único?
- [ ] ¿Hay un cleanup de old keys para evitar table growth?
- [ ] ¿Los keys se validan antes de insert o después?

**📚 Referencias**:
- `src/modules/cash/` - Reference
- Supermemory: "Idempotency keys cut duplicate processing by 92%"

**🤔 Riesgo**: Transacciones duplicadas → inconsistencias financieras

---

## 5️⃣ TYPESCRIPT & TYPE SAFETY (🟡 IMPORTANTE)

### 5.1 TypeScript Strict Mode
**Status**: Enabled  
**Decisión**: `strict: true` en tsconfig  

**❓ Preguntas para Validar**:
- [ ] ¿Hay archivos con `any` que deberían usar `unknown`?
- [ ] ¿Todas las funciones exportadas tienen return types explícitos?
- [ ] ¿Se está usando `Function` type en lugar de signatures específicas?
- [ ] ¿Hay interfaces vacías que deberían ser `Record<string, never>`?

**📚 Referencias**:
- `tsconfig.json`
- Supermemory: "TypeScript best practices"
- Validation command: `tsc --noEmit`

**🤔 Riesgo**: Type errors en runtime, difícil debugging

---

### 5.2 Zod Integration
**Status**: Implementado (parcial)  
**Decisión**: Zod para runtime validation, `z.infer<typeof Schema>` para types  

**❓ Preguntas para Validar**:
- [ ] ¿Todos los inputs de usuario (forms, APIs) tienen Zod schemas?
- [ ] ¿Los schemas Zod están centralizados o dispersos?
- [ ] ¿Se valida en el lugar correcto (client + server layer)?
- [ ] ¿Hay casos donde Zod transforma data de manera inesperada?

**📚 Referencias**:
- Supermemory: "Zod for runtime schema validation"
- `src/*/validators/` o `src/*/schemas/`

**🤔 Riesgo**: Invalid data bypasses validation → crashes

---

## 6️⃣ PERFORMANCE & OPTIMIZATION (🟡 IMPORTANTE)

### 6.1 Component Memoization Strategy
**Status**: Implementado (parcial)  
**Decisión**: React.memo + displayName + useCallback for event handlers  

**❓ Preguntas para Validar**:
- [ ] ¿Los criterios para usar React.memo son consistentes?
- [ ] ¿Hay componentes >500 líneas que deberían ser split?
- [ ] ¿Los event handlers inline en loops fueron refactorizados a useCallback?
- [ ] ¿Los displayNames están en TODOS los memoized components?

**📚 Referencias**:
- Supermemory: "Component architecture patterns"
- `docs/05-development/REACT_DEVTOOLS_PROFILING_GUIA_AVANZADA.md`
- React Scan debugging guide

**🤔 Riesgo**: Re-renders innecesarios → slow UI

---

### 6.2 Virtual Scrolling
**Status**: Implementado  
**Decisión**: VirtualList component para listas >50 items  

**❓ Preguntas para Validar**:
- [ ] ¿El threshold de 50 items es correcto?
- [ ] ¿Hay listas grandes que NO usan virtual scrolling?
- [ ] ¿La implementación maneja correctamente items de altura variable?

**📚 Referencias**:
- `src/shared/ui/VirtualList.tsx`
- `@tanstack/react-virtual`

**🤔 Riesgo**: Lag con listas grandes (>100 items)

---

### 6.3 Query Key Factory Pattern
**Status**: Implementado (Cash module)  
**Decisión**: Hierarchical query keys para TanStack Query  

**❓ Preguntas para Validar**:
- [ ] ¿Todos los módulos usan el query key factory pattern?
- [ ] ¿Las keys son lo suficientemente específicas para evitar over-invalidation?
- [ ] ¿Hay casos de invalidación en cascada que causen refetch loops?

**📚 Referencias**:
- `src/modules/cash/` - cashQueryKeys factory
- TkDodo blog (industry validation)

**🤔 Riesgo**: Cache invalidation incorrecta → stale data o refetches innecesarios

---

## 7️⃣ REACT HOOKS & SIDE EFFECTS (🟡 IMPORTANTE)

### 7.1 useEffect Dependency Arrays
**Status**: Revisión necesaria  
**Decisión**: eslint-plugin-react-hooks enforced  

**❓ Preguntas para Validar**:
- [ ] ¿Hay casos donde dependency arrays están disabled (// eslint-disable)?
- [ ] ¿Los useEffects que modifican sus propias dependencias causan loops?
- [ ] ¿Todos los useEffects tienen cleanup functions donde corresponde?

**📚 Referencias**:
- Supermemory: "React Hook optimization"
- `eslint.config.js`

**🤔 Riesgo**: Infinite loops, memory leaks

---

### 7.2 Custom Hooks Separation
**Status**: Implementado  
**Decisión**: Domain hooks en `modules/*/hooks/`, UI hooks en `pages/*/hooks/`  

**❓ Preguntas para Validar**:
- [ ] ¿Todos los hooks siguen esta separación?
- [ ] ¿Los custom hooks >1000 líneas fueron split?
- [ ] ¿Hay lógica de negocio en UI hooks que debería estar en domain hooks?

**📚 Referencias**:
- Supermemory: "Module architecture patterns"
- `src/modules/*/hooks/`

**🤔 Riesgo**: Coupling entre UI y business logic

---

## 8️⃣ NAMING CONVENTIONS & CODE ORGANIZATION (🟢 MEJORA)

### 8.1 File Naming Pattern
**Status**: Implementado  
**Decisión**: `*Api.ts`, `*Service.ts`, `*Engine.ts`  

**❓ Preguntas para Validar**:
- [ ] ¿Todos los archivos siguen esta convención?
- [ ] ¿La separación Api/Service/Engine es clara para todos los desarrolladores?
- [ ] ¿Debería haber más sufijos (ej. `*Repository.ts`, `*Validator.ts`)?

**📚 Referencias**:
- Supermemory: "Module architecture patterns"
- `CLAUDE.md` - Anti-patterns

**🤔 Riesgo**: Bajo (solo afecta legibilidad)

---

### 8.2 Component DisplayNames
**Status**: En progreso  
**Decisión**: DisplayName obligatorio para components memoizados  

**❓ Preguntas para Validar**:
- [ ] ¿Hay un script que valide displayNames en CI?
- [ ] ¿El script `scripts/add-display-names.mjs` funciona correctamente?

**📚 Referencias**:
- Supermemory: "Component naming for React Scan debugging"
- `scripts/add-display-names.mjs`

**🤔 Riesgo**: Bajo (solo afecta debugging)

---

## 9️⃣ TESTING STRATEGY (🟡 IMPORTANTE)

### 9.1 Test Coverage Current State
**Status**: Parcial  
**Decisión**: Vitest + Testing Library + Playwright  

**❓ Preguntas para Validar**:
- [ ] ¿Cuál es el % de coverage actual? (target mínimo?)
- [ ] ¿Hay módulos críticos sin tests?
- [ ] ¿Los tests de precisión (`test:precision`) cubren todos los edge cases?
- [ ] ¿Los tests E2E cubren los flujos críticos de negocio?

**📚 Referencias**:
- `package.json` - scripts de tests
- `src/__tests__/`
- `tests/e2e/`

**🤔 Riesgo**: Bugs en producción no detectados

---

### 9.2 EventBus Testing Strategy
**Status**: Implementado  
**Decisión**: Unit + Integration + Performance + Stress tests  

**❓ Preguntas para Validar**:
- [ ] ¿Los tests de EventBus cubren edge cases (ej. eventos en cascada)?
- [ ] ¿Los tests de performance tienen thresholds realistas?

**📚 Referencias**:
- `src/lib/events/__tests__/`
- Scripts: `test:eventbus:*`

**🤔 Riesgo**: EventBus falla en producción bajo carga

---

## 🔟 SEGURIDAD & AUTENTICACIÓN (🔴 CRÍTICO)

### 10.1 RBAC Implementation
**Status**: Implementado  
**Decisión**: 5 roles + granular permissions + JWT-first  

**❓ Preguntas para Validar**:
- [ ] ¿Los 5 roles (ADMIN, GERENTE, SUPERVISOR, VENDEDOR, OPERADOR) cubren todos los casos?
- [ ] ¿La validación de permisos SIEMPRE ocurre en el service layer?
- [ ] ¿Los JWT tokens incluyen todos los claims necesarios?
- [ ] ¿Hay casos donde permisos de UI no matchean con backend?

**📚 Referencias**:
- `src/config/PermissionsRegistry.ts`
- `docs/permissions/` (9 files)
- Supermemory: "RBAC with JWT-first, service layer validation mandatory"

**🤔 Riesgo**: Authorization bypass → security breach

---

### 10.2 Service Layer Validation
**Status**: Implementado (debe verificarse)  
**Decisión**: Validación SIEMPRE en service layer, UI validation = UX only  

**❓ Preguntas para Validar**:
- [ ] ¿TODOS los endpoints validan permisos antes de ejecutar?
- [ ] ¿Hay casos donde la validación solo está en el frontend?
- [ ] ¿Los errores de autorización se loguean para auditoría?

**📚 Referencias**:
- Supermemory: "Service layer validation mandatory for security"
- `src/modules/*/services/*`

**🤔 Riesgo**: Bypass de validación → acceso no autorizado

---

## 🔧 LIBRARY CHOICES (🟡 IMPORTANTE)

### 11.1 Chakra UI v3 Migration
**Status**: Completado  
**Decisión**: Chakra UI v3.23.0 con Sistema de Recetas  

**❓ Preguntas para Validar**:
- [ ] ¿La migración a v3 fue completa o hay componentes legacy v2?
- [ ] ¿El import pattern `@/shared/ui` es correcto vs. direct `@chakra-ui/react`?
- [ ] ¿Los style props están siendo usados correctamente (no inline CSS)?

**📚 Referencias**:
- `package.json` - `@chakra-ui/react: ^3.30.0`
- `src/shared/ui/` - Wrapped components
- Anti-pattern: `import { Box } from '@chakra-ui/react'`

**🤔 Riesgo**: Import inconsistencies → build failures

---

### 11.2 React 19 Adoption
**Status**: Implementado  
**Decisión**: React 19.1.0 (early adoption)  

**❓ Preguntas para Validar**:
- [ ] ¿Hay breaking changes de React 19 que afecten el proyecto?
- [ ] ¿Todas las librerías son compatibles con React 19? (checking peer deps)
- [ ] ¿El uso de React Compiler está planeado o ya implementado?

**📚 Referencias**:
- `package.json` - `react: ^19.1.0`
- React 19 changelog

**🤔 Riesgo**: Incompatibilidades con librerías de terceros

---

### 11.3 Decimal.js Choice
**Status**: Implementado  
**Decisión**: Decimal.js para precisión matemática  

**❓ Preguntas para Validar**:
- [ ] ¿Decimal.js es la mejor opción vs. alternativas (big.js, bignumber.js)?
- [ ] ¿El bundle size de Decimal.js es aceptable?
- [ ] ¿Hay casos donde la conversión Decimal ↔ number causa problemas?

**📚 Referencias**:
- `package.json` - `decimal.js: ^10.6.0`
- `src/lib/decimal/decimalUtils.ts`

**🤔 Riesgo**: Bundle size, performance overhead

---

## 📋 CHECKLIST DE VALIDACIÓN FINAL

### Validaciones de Código (Automatizables):

```bash
# TypeScript compilation
pnpm run build  # ¿Compila sin errores?

# Precision validation
pnpm run lint:precision  # ¿Sin uso de operadores nativos?
pnpm run test:precision  # ¿Tests de precisión pasan?

# Linting
pnpm run lint  # ¿Sin warnings críticos?

# Tests
pnpm run test:run  # ¿Coverage aceptable?
pnpm run test:eventbus:full  # ¿EventBus robusto?

# E2E
pnpm run e2e  # ¿Flujos críticos funcionan?
```

### Validaciones Manuales (Requieren Experto):

#### Arquitectura:
- [ ] Review de Module Registry Pattern por experto en sistemas extensibles
- [ ] Review de Capability System por experto en feature flags
- [ ] Review de EventBus por experto en pub/sub systems

#### State Management:
- [ ] Audit de TanStack Query usage por experto (ej. TkDodo)
- [ ] Review de Zustand patterns por experto en state management

#### Database:
- [ ] Review de RLS policies por DBA/Security expert
- [ ] Audit de double-entry accounting por contador/CPA
- [ ] Review de idempotency pattern por experto en distributed systems

#### Matemáticas:
- [ ] Validación de fórmulas por contador (Markup/Margin, COGS, etc.)
- [ ] Review de decimal precision por experto financiero
- [ ] Validación de compliance fiscal (IVA, LIFO/FIFO) por contador

#### Seguridad:
- [ ] Penetration testing por security expert
- [ ] JWT implementation review por security expert
- [ ] RBAC audit por authorization expert

---

## 🎯 PRIORIDAD DE VALIDACIÓN RECOMENDADA

**Semana 1 (CRÍTICO):**
1. Precisión Matemática (DecimalUtils + formulas)
2. RBAC + Authorization (security)
3. Database Double-Entry Accounting

**Semana 2 (IMPORTANTE):**
4. Module Registry Pattern (extensibility)
5. State Management (TanStack Query migration)
6. EventBus robustness

**Semana 3 (MEJORA):**
7. Performance patterns (memoization, virtual scrolling)
8. TypeScript strictness
9. Test coverage

---

## 📞 DÓNDE BUSCAR AYUDA

### Forums/Communities:
- **Reddit**: r/reactjs, r/typescript, r/webdev
- **Discord**: Reactiflux, TypeScript Community
- **Stack Overflow**: Tags específicos

### Expertos a Consultar:
- **TkDodo** (TanStack Query) - Blog posts, Twitter
- **Zustand Maintainers** - GitHub Discussions
- **Chakra UI Team** - Discord server
- **Contador/CPA** - Fórmulas financieras, compliance fiscal
- **Security Expert** - RBAC, JWT, RLS policies

### Herramientas de Validación:
- **Lighthouse** - Performance audit
- **SonarQube** - Code quality
- **OWASP ZAP** - Security testing
- **React DevTools Profiler** - Performance
- **Chrome DevTools** - Bundle analysis

---

**Última Actualización**: 2025-01-13  
**Total de Aspectos Identificados**: 40+  
**Categoría Crítica**: 15 aspectos  
**Categoría Importante**: 18 aspectos  
**Categoría Mejora**: 7 aspectos
