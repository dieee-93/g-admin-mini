# RECIPE MODULE - CONTINUATION PROMPT

> **Usar este prompt para continuar con contexto limpio**
> **Última actualización**: 2025-12-26
> **Progreso**: 90% (40/44 tareas)

---

## 📍 ESTADO ACTUAL

El **Recipe Module** está **90% completo** con integraciones funcionales en Materials y Products.

### ✅ COMPLETADO (Sesiones 1-4)

1. **Core Implementation** (100%)
   - Types: Recipe, RecipeInput, RecipeOutput, Costing, Analytics
   - Services: recipeApi, costEngine (11 tests passing)
   - Hooks: useRecipes, useRecipeCosts (TanStack Query)

2. **RecipeBuilder Component** (66%)
   - 4 secciones core: BasicInfo, OutputConfig, Inputs, CostSummary
   - Provider con Context API
   - Complexity modes: minimal, standard, advanced
   - Memoización completa

3. **Materials Integration** (100%)
   - ElaboratedFields usa RecipeBuilder
   - executionMode: 'immediate' (consume stock al crear)
   - complexity: 'minimal'

4. **Products Integration** (100%)
   - RecipeConfigSection component
   - Integrado en ProductFormWizard
   - executionMode: 'on_demand' (consume stock al vender)
   - complexity: 'standard'
   - Feature gating: production_bom_management

5. **DB Migration** (100%)
   - recipes.entity_type (material, product, kit, service)
   - recipes.execution_mode (immediate, on_demand)
   - products.recipe_id → recipes.id (FK ya existente)

6. **Testing** (85%)
   - 7 tests unitarios RecipeConfigSection (100% passing)
   - 11 tests cost engine (100% passing)
   - 4 tests integración (1 passing, 3 con jsdom issue)

---

## ⏳ PENDIENTE (Opcional - 10%)

### 1. Secciones Faltantes RecipeBuilder (4-6h)
- [ ] InstructionsSection
- [ ] AdvancedOptionsSection

### 2. Fix Tests Integración (30min)
- [ ] Mock window.scrollTo en vitest.setup.ts
- [ ] Re-ejecutar 3 tests fallidos

### 3. Features Adicionales (10-15h)
- [ ] Recipe Templates
- [ ] AI Suggestions
- [ ] Substitutions UI
- [ ] Recipe Workshop Page

---

## 📂 ARCHIVOS CLAVE

### Componentes
```
src/modules/recipe/
├── components/RecipeBuilder/
│   ├── RecipeBuilder.tsx               ✅ Main component
│   ├── RecipeBuilderProvider.tsx       ✅ Context provider
│   ├── sections/
│   │   ├── BasicInfoSection.tsx        ✅ Completo
│   │   ├── OutputConfigSection.tsx     ✅ Completo
│   │   ├── InputsEditorSection.tsx     ✅ Completo
│   │   ├── CostSummarySection.tsx      ✅ Completo
│   │   ├── InstructionsSection.tsx     ⏳ TODO
│   │   └── AdvancedOptionsSection.tsx  ⏳ TODO
│   └── types.ts                        ✅ Completo
├── hooks/
│   ├── useRecipes.ts                   ✅ TanStack Query
│   └── useRecipeCosts.ts               ✅ Cost calculations
├── services/
│   ├── recipeApi.ts                    ✅ Supabase API
│   └── costEngine.ts                   ✅ Decimal.js (11 tests)
└── types/
    ├── recipe.ts                       ✅ Core types
    └── costing.ts                      ✅ Cost types
```

### Integraciones
```
Materials:
- src/pages/admin/supply-chain/materials/
  └── components/.../ElaboratedFields.tsx  ✅ Usa RecipeBuilder

Products:
- src/pages/admin/supply-chain/products/
  ├── components/sections/
  │   └── RecipeConfigSection.tsx         ✅ Wrapper RecipeBuilder
  ├── config/formSectionsRegistry.tsx     ✅ BOM section
  └── types/productForm.ts                ✅ RecipeConfigFields
```

### Database
```
database/migrations/
└── 20251226_add_recipe_execution_fields.sql  ✅ Ejecutada
```

---

## 🎯 FLUJOS IMPLEMENTADOS

### Materials (executionMode: immediate)
```
Create Material → Type: ELABORATED → RecipeBuilder (minimal)
→ Add Ingredients → Calculate Costs → Save Recipe
→ Execute IMMEDIATELY → Consume Stock Inputs → Generate Material Stock
→ Assign recipe_id to Material → Save Material
```

### Products (executionMode: on_demand)
```
Create Product → Type: physical_product → ProductFormWizard
→ Step 1: Basic Info → Step 2: Production Config
→ Step 3: Bill of Materials (BOM) → RecipeBuilder (standard)
→ Add Ingredients → Calculate Costs → Save Recipe
→ Assign recipe_id to Product → Step 4: Pricing → Save Product

Sale Flow:
Sell Product → Has recipe_id? → Load Recipe (executionMode='on_demand')
→ Execute Recipe → Consume Stock Inputs → Generate Revenue
```

---

## 🔑 DECISIONES ARQUITECTÓNICAS

1. **executionMode Automático**
   - Materials: 'immediate' (ejecuta al crear)
   - Products: 'on_demand' (ejecuta al vender)
   - No requiere configuración manual

2. **RecipeBuilder Unificado**
   - 1 componente reemplaza 4 legacy
   - Configuración vía props (complexity, features)
   - Secciones modulares

3. **TanStack Query**
   - Cache management automático
   - Optimistic updates
   - Query invalidation estratégica

4. **Decimal.js para Costos**
   - RecipeDecimal: 6 decimales
   - FinancialDecimal: 4 decimales
   - Sin errores de redondeo

---

## 📊 DIFERENCIAS CLAVE

| Aspecto | Materials | Products |
|---------|-----------|----------|
| entityType | 'material' | 'product' |
| executionMode | 'immediate' | 'on_demand' |
| Consumo Stock | Al crear | Al vender |
| Complexity | 'minimal' | 'standard' |
| Ubicación | MaterialForm | ProductFormWizard |
| Features | Solo costs | Costs + Instructions + Yield |

---

## 🚀 PRÓXIMOS PASOS (ELIGE)

### Opción A: Completar RecipeBuilder (Recomendado)
- Implementar InstructionsSection
- Implementar AdvancedOptionsSection
- Alcanzar 100% del componente

### Opción B: Testing & QA
- Fix window.scrollTo mock
- Agregar más tests de integración
- Alcanzar 95%+ coverage

### Opción C: Features Adicionales
- Recipe Templates
- AI Suggestions
- Substitutions UI

### Opción D: Deployment & Production
- Prueba manual end-to-end
- Deploy a staging
- Monitoreo y ajustes

---

## 📚 DOCUMENTACIÓN DISPONIBLE

```
docs/recipe/
├── README.md                              # Índice
├── ARCHITECTURE_DEFINITIVE.md             # Diseño completo
├── COMPLETE_SESSION_SUMMARY.md            # Resumen 4 sesiones
├── PRODUCTS_INTEGRATION_COMPLETE.md       # Integration guide
├── PRODUCTS_INTEGRATION_TESTING.md        # Testing guide
├── MATERIALS_INTEGRATION.md               # Materials integration
└── CONTINUE_PROMPT.md                     # Este archivo
```

---

## 💬 PROMPT PARA PRÓXIMA SESIÓN

```
Hola Claude, continuamos con Recipe Module (90% completo).

ESTADO:
- ✅ Core services completos
- ✅ RecipeBuilder 66% (4/6 secciones)
- ✅ Materials integration completa
- ✅ Products integration completa
- ✅ DB migration ejecutada
- ✅ Testing 85% (tests unitarios completos)

Lee: docs/recipe/CONTINUE_PROMPT.md

PRÓXIMO PASO (elige):
A. Completar RecipeBuilder (InstructionsSection + AdvancedOptionsSection)
B. Testing & QA (fix window.scrollTo + más tests)
C. Features Adicionales (Templates, AI, Substitutions)
D. Deployment & Production Ready

¿Continuamos?
```

---

## 🔍 VALIDACIÓN RÁPIDA

### Verificar Estado
```bash
# Tests
pnpm test RecipeConfigSection
pnpm test costEngine

# DB
# Conectar a Supabase y verificar:
SELECT column_name FROM information_schema.columns
WHERE table_name = 'recipes'
AND column_name IN ('entity_type', 'execution_mode');

# Código
git status
# Debería mostrar archivos modificados/nuevos de sesión 4
```

---

**Estado**: 90% Completo - Listo para próxima fase

**Última Sesión**: Products Integration + Testing + DB Migration

**Próxima Meta**: 100% RecipeBuilder o Production Ready

---

*Usar este prompt al inicio de la próxima sesión para contexto limpio*
