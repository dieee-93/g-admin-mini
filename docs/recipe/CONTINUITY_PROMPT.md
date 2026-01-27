# PROMPT DE CONTINUIDAD - RECIPE MODULE

> **Para usar**: Copia este texto al iniciar la próxima sesión con Claude

---

## Estado Actual: 60% Completado ✅

Implementación del **Recipe Module** con **Materials Integration** completada.

### ✅ COMPLETADO (Sesiones 1-3 + Integración)

**Core Infrastructure** (100%):
- ✅ Tipos: `recipe.ts`, `costing.ts`, `execution.ts`
- ✅ Validaciones: `recipeValidation.ts` (por entityType)
- ✅ API: `recipeApi.ts` (CRUD + execute + viability)
- ✅ Cost Engine: `costEngine.ts` (Decimal.js, yield analysis)
- ✅ Hooks: `useRecipes.ts`, `useRecipeCosts.ts` (TanStack Query)
- ✅ Tests: 11/11 pasando (cost engine)

**RecipeBuilder** (66%):
- ✅ Provider y Context
- ✅ Main component
- ✅ BasicInfoSection
- ✅ OutputConfigSection
- ✅ InputsEditorSection
- ✅ CostSummarySection
- ⏳ InstructionsSection (TODO)
- ⏳ AdvancedOptionsSection (TODO)

**Integraciones** (33%):
- ✅ Materials: ElaboratedFields integrado
- ⏳ Products: BOM tab (TODO)

---

## 🔑 Conceptos Críticos

### Execution Mode
```typescript
Material → 'immediate'   // Ejecuta AL CREAR
Product  → 'on_demand'   // Ejecuta AL VENDER
```

### Validaciones por EntityType
```typescript
material → solo materials como inputs
product  → materials + products
kit      → solo products
service  → materials + assets
```

---

## ⏳ PRÓXIMOS PASOS

### Opción 1: Testing (RECOMENDADO)
- Tests de RecipeBuilder
- Tests de integración
- **Estimado**: 2-3 horas

### Opción 2: Products Integration
- BOM tab en ProductForm
- **Estimado**: 1.5 horas

### Opción 3: DB Migration
- Schema update en Supabase
- **Estimado**: 1-2 horas

---

## 📁 Archivos Clave

```
src/modules/recipe/
├── types/                      ✅
├── services/                   ✅
├── hooks/                      ✅
└── components/RecipeBuilder/   ✅ 66%

docs/recipe/
└── COMPLETE_SESSION_SUMMARY.md ← Lee esto primero
```

---

## 🚀 Prompt para Claude

```
Hola Claude, continuamos con Recipe Module (60% completo).

ESTADO:
- ✅ Core services completos
- ✅ RecipeBuilder 66% (4 secciones)
- ✅ Materials integration completa
- ⏳ Pendiente: Testing, Products, DB migration

Lee: docs/recipe/COMPLETE_SESSION_SUMMARY.md

PRÓXIMO PASO (elige):
1. Testing
2. Products Integration
3. DB Migration
4. Secciones faltantes

¿Continuamos?
```

---

**Archivos**: 27 nuevos + 1 modificado | **LOC**: ~3,413 | **Tests**: 11/11
