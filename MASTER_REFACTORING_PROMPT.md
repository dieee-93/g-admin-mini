# MASTER REFACTORING PROMPT: Intelligent Router

**Version:** 3.0 (Updated: 2025-12-17)  
**Context:** Este prompt actúa como un router inteligente que detecta automáticamente si el target es un módulo o una página, y delega al prompt especializado correspondiente.

**✨ NEW**: 
- Sistema modular con prompts especializados
- Detección automática de contexto (modules vs pages)
- Documentación de soluciones expandida

---

## 🎯 CÓMO USAR ESTE PROMPT

1. **Proporciona un target path**: Ruta del módulo o página a refactorizar
2. **El prompt detecta automáticamente** si es `src/modules/` o `src/pages/`
3. **Delega al prompt especializado** correspondiente
4. **Ejecuta el protocolo apropiado** con las instrucciones optimizadas

---

## 🔀 ROUTING LOGIC

### Step 1: Detect Target Type

Analiza la ruta proporcionada:

```
Target Path: [RUTA A ANALIZAR]
```

**Detection Rules:**
- Si la ruta contiene `src/modules/` → Es un **MODULE**
- Si la ruta contiene `src/pages/` → Es una **PAGE**
- Si la ruta no es clara → PREGUNTAR al usuario

### Step 2: Route to Specialized Prompt

Una vez detectado el tipo de target:

#### 🔷 Si es MODULE (`src/modules/*`)
**→ Usar:** `MODULES_REFACTORING_PROMPT.md`

**Enfoque:**
- Arquitectura de módulos (manifest, exports, hooks system)
- Lógica de negocio (services, handlers, engines)
- Store management (Zustand para UI state)
- Server state (TanStack Query)
- EventBus integration
- Module Registry compliance

**Documentación prioritaria:**
- ✅ `docs/solutions/MODULE_STRUCTURE_SOLUTIONS.md` (ESSENTIAL)
- ✅ `docs/solutions/SERVICE_LAYER_SOLUTIONS.md` (Critical)
- ✅ `docs/solutions/ZUSTAND_STATE_MANAGEMENT_SOLUTIONS.md` (Critical)
- ✅ `docs/solutions/DECIMAL_UTILS_SOLUTIONS.md` (Critical para finance modules)

#### 🔶 Si es PAGE (`src/pages/*`)
**→ Usar:** `PAGES_REFACTORING_PROMPT.md`

**Enfoque:**
- Component architecture (composition, decomposition)
- UI/Logic separation
- Module consumption (NO creation)
- Performance optimization (React memo, callbacks)
- Form state management
- Component patterns (compound components, render props)

**Documentación prioritaria:**
- ✅ `docs/solutions/COMPONENT_ARCHITECTURE_SOLUTIONS.md` (ESSENTIAL)
- ✅ `docs/solutions/PERFORMANCE_OPTIMIZATION_SOLUTIONS.md` (High)
- ✅ `docs/solutions/REACT_HOOKS_SOLUTIONS.md` (High)
- ✅ `docs/solutions/MODULE_STRUCTURE_SOLUTIONS.md` (para consumo correcto)

---

## 📋 ROUTING DECISION TABLE

| Target Path Contains | Type | Use Prompt | Priority Focus |
|---------------------|------|------------|----------------|
| `src/modules/` | Module | `MODULES_REFACTORING_PROMPT.md` | Manifest, Services, Stores, EventBus |
| `src/pages/` | Page | `PAGES_REFACTORING_PROMPT.md` | Components, UI/Logic separation, Module consumption |

---

## 🚀 QUICK START

### Para Módulos (`src/modules/*`)

```bash
Target: src/modules/[module-name]
```

**Ejecutar:**
1. Leer `MODULES_REFACTORING_PROMPT.md`
2. Seguir PHASE 1-5 del prompt de módulos
3. Enfocarse en:
   - ✅ Manifest completeness
   - ✅ Service layer architecture
   - ✅ State management (TanStack Query + Zustand UI)
   - ✅ Financial precision (DecimalUtils)
   - ✅ EventBus integration

### Para Páginas (`src/pages/*`)

```bash
Target: src/pages/[path]/page.tsx
```

**Ejecutar:**
1. Leer `PAGES_REFACTORING_PROMPT.md`
2. Seguir PHASE 1-5 del prompt de páginas
3. Enfocarse en:
   - ✅ UI/Logic separation
   - ✅ NO business logic in pages
   - ✅ Module consumption (not creation)
   - ✅ Component decomposition
   - ✅ Performance optimization (memo, callbacks)

---

## 📚 COMPLETE KNOWLEDGE BASE

Todos los documentos de soluciones disponibles:

| Category | Document | Relevance |
|----------|----------|-----------|
| **💰 Finance** | `docs/solutions/DECIMAL_UTILS_SOLUTIONS.md` | Critical for modules with calculations |
| **🧠 State** | `docs/solutions/ZUSTAND_STATE_MANAGEMENT_SOLUTIONS.md` | Critical for modules, Medium for pages |
| **🚀 Performance** | `docs/solutions/PERFORMANCE_OPTIMIZATION_SOLUTIONS.md` | High for pages, Medium for modules |
| **🪝 Hooks** | `docs/solutions/REACT_HOOKS_SOLUTIONS.md` | High for both |
| **📘 Types** | `docs/solutions/TYPESCRIPT_BEST_PRACTICES_SOLUTIONS.md` | High for both |
| **🏗️ Architecture** | `docs/solutions/COMPONENT_ARCHITECTURE_SOLUTIONS.md` | Essential for pages |
| **🔌 Services** | `docs/solutions/SERVICE_LAYER_SOLUTIONS.md` | Critical for modules |
| **📦 Modules** | `docs/solutions/MODULE_STRUCTURE_SOLUTIONS.md` | **ESSENTIAL** for modules |
| **✨ Quality** | `docs/solutions/CODE_QUALITY_SOLUTIONS.md` | Medium for both |

---

## ⚠️ UNIVERSAL CRITICAL RULES

Aplican tanto a módulos como a páginas:

1. **NEVER** romper funcionalidad existente. Si un refactor es riesgoso, preguntar.
2. **ALWAYS** usar `DecimalUtils` para cualquier cálculo financiero/matemático.
3. **ALWAYS** usar TanStack Query para server state (data from database/API).
4. **ALWAYS** usar Zustand ONLY para UI state (modals, filters, selections).
5. **NEVER** poner server data en Zustand stores o `localStorage`.
6. **ALWAYS** verificar compilación TypeScript después de cambios.
7. **ALWAYS** testear que la funcionalidad sigue trabajando correctamente.

---

## 📖 ESTADO DEL PROYECTO

### ✅ Migración TanStack Query
- **Estado**: En progreso
- **Completado**: Cash Module (ver `CASH_MODULE_TANSTACK_QUERY_MIGRATION.md`)
- **Pendiente**: Products, Materials, Sales, Suppliers

### ✅ Module Registry
- **Estado**: Implementado
- **Ubicación**: `src/lib/modules/`
- **Manifests requeridos**: Todos los módulos en `src/modules/`
- **Documentación**: `src/modules/README.md`

### ✅ DecimalUtils
- **Estado**: Implementado y validado
- **Ubicación**: `src/lib/math/DecimalUtils.ts`
- **Uso obligatorio**: Todos los cálculos financieros

---

## 🎯 COMENZAR REFACTORING

**Paso 1**: Proporciona el target path

```
Target: [RUTA AQUÍ]
```

**Paso 2**: El prompt detectará automáticamente el tipo

**Paso 3**: Se ejecutará el protocolo apropiado

---

## 📞 EJEMPLO DE USO

### Ejemplo 1: Refactorizar un Módulo

```
User: Vamos a trabajar en src/modules/products
