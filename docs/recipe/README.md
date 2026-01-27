# RECIPE SYSTEM - DOCUMENTACIÓN

> Sistema de gestión de recetas, BOMs, kits y composiciones de recursos para G-Admin Mini

---

## 📚 Índice de Documentación

### 1. [CURRENT_STATE_MAPPING.md](./CURRENT_STATE_MAPPING.md)
**Estado actual del sistema Recipe**

Mapeo exhaustivo de:
- 29 archivos existentes (~2,400 LOC)
- Estructura actual distribuida en 3 ubicaciones
- Componentes duplicados y código legacy
- Integración actual con Materials y Products
- Gaps funcionales y de arquitectura
- Oportunidades de mejora

**📌 Lee este documento primero** para entender qué existe hoy.

---

### 2. [ARCHITECTURE_DEFINITIVE.md](./ARCHITECTURE_DEFINITIVE.md)
**Diseño arquitectónico definitivo** ⭐

Diseño completo sin retrocompatibilidad:
- **Módulo formal** `/src/modules/recipe`
- **Tipos genéricos** `Recipe<TInput, TOutput>` para máxima reutilización
- **Componente unificado** `RecipeBuilder` (elimina 4 duplicados)
- **Engines especializados**: Cost, Analytics, Execution
- **Recipe Workshop**: Interfaz avanzada para experimentación
- **Integración con módulos**: Materials, Products, Dashboard
- **Plan de implementación**: 7 fases detalladas

**📌 Lee este documento** para entender hacia dónde vamos.

---

## 🎯 Visión General

### ¿Qué es Recipe System?

Un **módulo transversal** para gestionar **composiciones de recursos**:
- No se limita a gastronomía
- Soporta múltiples casos de uso
- Cálculo de costos con precisión decimal
- Analytics y optimización
- Producción y tracking

### Casos de Uso Soportados

| Caso | Input → Output | Ejemplo |
|------|----------------|---------|
| **Material Elaborado** | Materials → Material | Pan (harina + agua + levadura) |
| **Producto con BOM** | Materials → Product | Hamburguesa (pan + carne + lechuga) |
| **Kit de Productos** | Products → Product | Combo (burger + fries + drink) |
| **Servicio con Recursos** | Materials/Assets → Service | Limpieza (detergente + trapo) |

---

## 🚀 Estado del Proyecto

### Situación Actual
- ✅ **Código funcional** distribuido en múltiples ubicaciones
- ⚠️ **Duplicación** de 4 componentes similares
- ⚠️ **No es módulo formal** (esparcido en `/services`, `/shared`, `/pages`)
- ⚠️ **Código legacy** y tipos no usados
- ⚠️ **Integración incompleta** con Products

### Próximo Paso
- 📐 **Rediseño arquitectónico** completo
- 🧹 **Consolidación** de componentes
- 📦 **Creación de módulo** formal
- 🎨 **Recipe Workshop** (nueva feature)
- 🧪 **Testing completo**

**Breaking changes permitidos** - Sistema en desarrollo sin datos de producción.

---

## 📐 Decisiones Arquitectónicas Clave

### 1. Recipe como Módulo Independiente
```
src/modules/recipe/
├── manifest.tsx
├── types/
├── hooks/
├── services/
├── components/
└── pages/
```

**Por qué**: Es transversal, tiene lógica compleja, merece su propia UI.

### 2. Tipos Genéricos
```typescript
Recipe<TInput = RecipeItem, TOutput = RecipeItem>
```

**Por qué**: Reutilización máxima, type-safety, no limita a comida.

### 3. Componente Unificado
```typescript
<RecipeBuilder
  entityType="material" | "product" | "kit" | "service"
  complexity="minimal" | "standard" | "advanced"
  features={{ showCostCalculation, showAnalytics, ... }}
/>
```

**Por qué**: Elimina duplicación de 4 componentes, mantenimiento simple.

### 4. Recipe Workshop
Interfaz dedicada en `/recipes/workshop` para:
- Scaling de recetas
- Sustituciones de ingredientes
- Optimización de costos
- Comparación de variaciones

**Por qué**: UX mejorada para power users, diferenciador de producto.

---

## 🗺️ Roadmap de Implementación

### Fase 1: Fundamentos ⏳
- Crear estructura de módulo
- Consolidar tipos
- Migrar API layer
- Setup testing

### Fase 2: Core Services ⏳
- RecipeCostEngine
- RecipeAnalyticsEngine
- RecipeExecutionEngine
- Hooks principales

### Fase 3: UI Components ⏳
- RecipeBuilder unificado
- RecipeList
- RecipeView

### Fase 4: Integraciones ⏳
- Materials module
- Products module
- Dashboard widgets

### Fase 5: Recipe Workshop ⏳
- Scaling tool
- Substitution tool
- Optimization tool
- Comparison tool

### Fase 6: Cleanup ⏳
- Eliminar código legacy
- Actualizar imports
- Documentación final

### Fase 7: Refinamiento 🔄
- Features avanzadas opcionales
- Optimizaciones
- Mejoras de UX

---

## 📊 Comparación: Antes vs Después

### Antes (Estado Actual)
```
❌ 4 componentes duplicados (Form, FormClean, BuilderLite, BuilderClean)
❌ Código en 3 ubicaciones (/services, /shared, /pages)
❌ API legacy + moderna coexisten
❌ Tipos lazy-loaded nunca usados
❌ No es módulo formal
❌ Integración con Products no clara
❌ Testing incompleto
```

### Después (Arquitectura Definitiva)
```
✅ 1 componente unificado (RecipeBuilder)
✅ Todo en /src/modules/recipe
✅ Solo API moderna
✅ Solo tipos usados
✅ Módulo formal con manifest
✅ Integración clara con hook points
✅ Testing completo (>80% coverage)
✅ Recipe Workshop para power users
```

---

## 🧪 Testing Strategy

```
tests/
├── unit/           # Engines, services, validation
├── integration/    # Material+Recipe, Product+Recipe
├── components/     # RecipeBuilder, RecipeList, etc.
└── e2e/            # Workflows completos
```

**Meta**: >80% cobertura de código

---

## 🔗 Integración con Otros Módulos

### Materials Module
```typescript
// En MaterialForm → ElaboratedFields
<RecipeBuilder
  entityType="material"
  complexity="minimal"
  outputItem={material}
/>
```

### Products Module
```typescript
// En ProductForm → BOM tab
<RecipeBuilder
  entityType="product"
  complexity="standard"
  features={{ showCostCalculation: true }}
/>
```

### Dashboard
```typescript
// Widgets registrados
- RecipeStatsWidget
- RecipeAlertsWidget
- RecipeIntelligenceDashboard
```

---

## 📖 Glosario

| Término | Definición |
|---------|------------|
| **Recipe** | Composición de recursos (inputs) que produce un output |
| **BOM** | Bill of Materials - Lista de componentes de un producto |
| **Input** | Recurso consumido en la receta (material, producto, asset) |
| **Output** | Recurso producido por la receta |
| **Yield** | Rendimiento - % de output obtenido vs esperado |
| **Waste** | Desperdicio - % de inputs que se pierden en producción |
| **Menu Engineering** | Análisis de popularidad y rentabilidad (Boston Matrix) |
| **Recipe Workshop** | Interfaz para experimentar y optimizar recetas |

---

## 🤝 Contribución

### Para desarrolladores:

1. **Lee primero**: [CURRENT_STATE_MAPPING.md](./CURRENT_STATE_MAPPING.md)
2. **Diseño objetivo**: [ARCHITECTURE_DEFINITIVE.md](./ARCHITECTURE_DEFINITIVE.md)
3. **Sigue las convenciones** del proyecto G-Admin Mini
4. **Breaking changes permitidos** (sistema en desarrollo)

### Documentos pendientes:

- [ ] IMPLEMENTATION_GUIDE.md (guía paso a paso)
- [ ] API_REFERENCE.md (documentación de APIs)
- [ ] WORKSHOP_USER_GUIDE.md (guía de usuario del workshop)
- [ ] TROUBLESHOOTING.md (problemas comunes)

---

## ❓ FAQ

### ¿Por qué rediseñar si ya funciona?
- Eliminar duplicación (4 componentes → 1)
- Crear módulo formal siguiendo convenciones
- Mejorar testing y mantenibilidad
- Agregar features avanzadas (Workshop)

### ¿Habrá breaking changes?
- **Sí**, pero está permitido
- Sistema en desarrollo sin datos de producción
- Implementación limpia es prioridad

### ¿Cuándo estará listo?
- Depende de las fases implementadas
- Estimación: 6-8 semanas para implementación completa
- Puede implementarse en fases incrementales

### ¿Cómo ayudar?
1. Revisar y dar feedback en diseño
2. Participar en code reviews
3. Escribir tests
4. Documentar casos de uso

---

## 📞 Contacto

Para preguntas o sugerencias sobre Recipe System:
- Revisar documentación en `/docs/recipe`
- Crear issue en el proyecto
- Consultar con el equipo de arquitectura

---

**Última actualización**: 2025-12-23
**Versión de documentación**: 1.0.0
**Estado**: 📐 En diseño
