# Prompt de Investigación: Soluciones Industry-Standard para Anti-Patterns Detectados

**Fecha:** 2025-12-17  
**Contexto:** Este documento contiene el prompt completo para dirigir la investigación de soluciones para los 61 tipos de problemas documentados en `CODEBASE_ISSUES_CATALOG.md`

---

## OBJETIVO DE LA INVESTIGACIÓN

Investigar y documentar las **mejores prácticas de la industria** para cada categoría de problema encontrada en el codebase, con el fin de:

1. Establecer patrones de refactoring validados por fuentes oficiales
2. Crear ejemplos de código correcto para cada anti-pattern
3. Priorizar correcciones según impacto y esfuerzo
4. Construir un prompt maestro para corrección módulo por módulo

---

## METODOLOGÍA DE INVESTIGACIÓN

Para cada categoría de problema, debes:

### 1. Buscar Fuentes Oficiales
- Documentación oficial (React.dev, Zustand docs, TypeScript docs)
- RFC y propuestas de las librerías
- Blogs oficiales de los maintainers

### 2. Validar con la Comunidad
- Artículos de expertos reconocidos (Dan Abramov, Kent C. Dodds, TkDodo, etc.)
- Discusiones en GitHub de las librerías oficiales
- Stack Overflow con respuestas altamente votadas (>100 votos)

### 3. Verificar en Producción
- Proyectos open-source de empresas reconocidas (Vercel, Airbnb, GitHub)
- Análisis de código en repositorios públicos
- Case studies y postmortems técnicos

### 4. Documentar Solución
- Descripción del problema
- Por qué es un anti-pattern (con citas de fuentes)
- Solución recomendada con código de ejemplo
- Patrón de refactoring paso a paso
- Casos edge a considerar

---

## CATEGORÍAS PRIORITARIAS PARA INVESTIGAR

Las categorías están ordenadas por prioridad según impacto y frecuencia:

### 🔴 PRIORIDAD CRÍTICA (Investigar primero)

#### CATEGORÍA 1: Precisión Matemática (DecimalUtils)
**Problemas a investigar:**
- 2.1: Operadores nativos en cálculos financieros
- 2.2: Cálculo de impuestos con operadores nativos
- 2.5: Conversión temprana a Number

**Preguntas de investigación:**
1. ¿Cuál es el estándar industry para cálculos financieros en JavaScript/TypeScript?
2. ¿Qué librerías usan empresas fintech (Stripe, Square, PayPal)?
3. ¿Cómo manejar precisión decimal en diferentes dominios (financial, tax, inventory)?
4. ¿Cuándo es seguro convertir de Decimal a Number?
5. ¿Cómo estructurar servicios para centralizar cálculos financieros?

**Fuentes sugeridas:**
- Documentación de Decimal.js (la librería que usa el proyecto)
- Martin Fowler: "Patterns of Enterprise Application Architecture" (Money pattern)
- ISO 4217 (Currency codes and precision standards)
- Artículos de ingenieros de Stripe/Shopify sobre cálculos monetarios
- IEEE 754 floating point standard (para entender el problema)

---

#### CATEGORÍA 2: Gestión de Estado con Zustand
**Problemas a investigar:**
- 1.2: Mezcla de Server State con Client State
- 1.3: CRUD Operations en Stores
- 1.6: Falta de Atomic Selectors
- 1.7: Derived State almacenado

**Preguntas de investigación:**
1. ¿Qué debería ir en un Zustand store y qué no?
2. ¿Cómo separar server state (datos de API) de client state (UI)?
3. ¿Cuándo usar Zustand vs TanStack Query vs useState?
4. ¿Cómo implementar atomic selectors correctamente?
5. ¿Cómo evitar derived state almacenado?
6. ¿Cuál es el patrón recomendado para CRUD operations?

**Fuentes sugeridas:**
- Zustand official docs: "Updating state" y "Flux inspired practice"
- TkDodo blog: "Working with Zustand"
- Documentación de TanStack Query sobre server state
- Artículo de Daishi Kato (creator de Zustand) sobre state management patterns
- Comparativas oficiales Zustand vs Redux vs Jotai

---

#### CATEGORÍA 3: Performance - Re-renders
**Problemas a investigar:**
- 9.1: Re-renders innecesarios por modal state en store
- 9.2: Objetos/arrays inline en props
- 9.3: Selectores que retornan nuevos objetos
- 7.1: Context value sin memoización

**Preguntas de investigación:**
1. ¿Dónde debe vivir el estado de visibilidad de modals?
2. ¿Cómo usar `useShallow` correctamente?
3. ¿Cuál es el patrón para evitar nuevas referencias en selectores?
4. ¿Cómo optimizar Context para prevenir re-renders?
5. ¿Cuándo usar `React.memo()` y cuándo no?

**Fuentes sugeridas:**
- React.dev: "Separating Events from Effects"
- React.dev: "Optimizing Performance"
- Zustand docs: "Prevent Re-renders with useShallow"
- LogRocket: "Zustand Performance Optimization"
- Kent C. Dodds: "Application State Management with React"

---

### 🟡 PRIORIDAD ALTA (Investigar segundo)

#### CATEGORÍA 4: Hooks Best Practices
**Problemas a investigar:**
- 5.5: useCallback/useMemo con dependencias incorrectas
- 5.6: Validación síncrona en cada keystroke
- 5.7: Effects que modifican estado que observan

**Preguntas de investigación:**
1. ¿Cuándo incluir setters en dependencies y cuándo no?
2. ¿Cómo implementar debouncing en React correctamente?
3. ¿Cómo evitar infinite loops en useEffect?
4. ¿Cuándo usar updater function vs dependencia directa?
5. ¿Cuál es el patrón correcto para validation: onChange vs onBlur?

**Fuentes sugeridas:**
- React.dev: "useCallback" - sección "Updating state from a memoized callback"
- React.dev: "You Might Not Need an Effect"
- Developer Way: "Debouncing in React"
- React.dev: "Lifecycle of Reactive Effects"

---

#### CATEGORÍA 5: TypeScript Best Practices
**Problemas a investigar:**
- 8.1: Uso de `any`
- 8.3: Funciones sin tipo de retorno explícito
- 8.5: Uso del tipo `Function`

**Preguntas de investigación:**
1. ¿Cómo eliminar `any` de forma sistemática?
2. ¿Cuándo usar `unknown` vs `any`?
3. ¿Cómo tipar funciones callback correctamente?
4. ¿Cuál es el estándar para return types en funciones públicas?
5. ¿Cómo crear type guards efectivos?

**Fuentes sugeridas:**
- TypeScript Handbook: "Do's and Don'ts"
- Matt Pocock: TypeScript tips (Twitter/Blog)
- Total TypeScript: Best practices guide
- Google TypeScript Style Guide

---

#### CATEGORÍA 6: Component Architecture
**Problemas a investigar:**
- 4.2: Mezcla de lógica y presentación
- 4.3: Acceso directo a Supabase desde componentes
- 4.4: Inline event handlers en loops

**Preguntas de investigación:**
1. ¿Cómo separar container components de presentational components?
2. ¿Cuál es el patrón correcto para data fetching en React?
3. ¿Cómo manejar event handlers en listas de forma performant?
4. ¿Cuándo extraer lógica a custom hooks vs services?

**Fuentes sugeridas:**
- Dan Abramov: "Presentational and Container Components"
- React.dev: "Keeping Components Pure"
- Patterns.dev: "Container/Presentational Pattern"

---

### 🟢 PRIORIDAD MEDIA (Investigar tercero)

#### CATEGORÍA 7: Service Layer Architecture
**Problemas a investigar:**
- 6.1: Servicios duplicados
- 6.2: Naming inconsistente
- 6.3: Servicios que mezclan concerns

**Preguntas de investigación:**
1. ¿Cómo organizar la capa de servicios en aplicaciones React?
2. ¿Cuál es la convención de naming: Api vs Service vs Engine?
3. ¿Cómo separar data access de business logic?
4. ¿Dónde van validaciones, transformaciones, cálculos?

**Fuentes sugeridas:**
- Clean Architecture (Robert C. Martin)
- Domain-Driven Design patterns
- Hexagonal Architecture en frontend

---

#### CATEGORÍA 8: Module Structure
**Problemas a investigar:**
- 3.1: Módulos sin manifest.tsx
- 3.4: Hooks en ubicación incorrecta
- 3.5: Servicios duplicados entre páginas y módulos

**Preguntas de investigación:**
1. ¿Qué debe contener un módulo completo?
2. ¿Cómo implementar Module-First architecture?
3. ¿Cuándo código va en /modules vs /pages?
4. ¿Cómo evitar duplicación entre capas?

**Fuentes sugeridas:**
- Feature-Sliced Design documentation
- Nx.dev: Monorepo best practices
- Clean Architecture for Frontend

---

### 🔵 PRIORIDAD BAJA (Investigar último)

#### CATEGORÍA 9: Code Quality
**Problemas a investigar:**
- 4.6: Inline styles extensos
- 4.8: Falta de displayName
- 4.9: Demasiados imports

**Preguntas de investigación:**
1. ¿Cuándo usar inline styles vs styled components vs CSS modules?
2. ¿Es necesario displayName con function expressions nombradas?
3. ¿Cómo organizar imports (barrel exports)?

---

## FORMATO DE DOCUMENTACIÓN DE CADA SOLUCIÓN

Para cada problema investigado, crear un documento con esta estructura:

```markdown
# Solución: [Nombre del problema]

## Código de referencia: [X.Y]
(Ej: 2.1 para "Operadores nativos en cálculos financieros")

## Categoría de impacto
[Crítico / Alto / Medio / Bajo]

## Descripción del anti-pattern

[Explicación detallada con ejemplo de código INCORRECTO]

## Por qué es un problema

[Citas de fuentes oficiales explicando el problema]

**Fuente 1:**
> "Cita textual de documentación oficial"
- Fuente: [Nombre del documento/artículo]
- URL: [link]

**Fuente 2:**
> "Cita textual de experto"
- Autor: [Nombre]
- URL: [link]

## Solución recomendada

[Explicación de la solución correcta]

### Código correcto

```typescript
// ✅ CORRECTO
[ejemplo de código]
```

### Explicación

[Por qué este código es correcto, con citas]

## Patrón de refactoring

### Paso 1: [Descripción]
[Código antes → código después]

### Paso 2: [Descripción]
[Código antes → código después]

### Paso 3: [Descripción]
[Código antes → código después]

## Casos edge a considerar

1. [Caso edge 1]
2. [Caso edge 2]

## Validación

[Cómo verificar que la refactorización fue exitosa]

- [ ] Tests pasan
- [ ] TypeScript compila sin errores
- [ ] Performance igual o mejorada
- [ ] [Otros checks específicos]

## Esfuerzo estimado

[Bajo / Medio / Alto] - [Justificación]

## Referencias

1. [Fuente oficial 1]
2. [Artículo técnico 1]
3. [Proyecto open source ejemplo]
```

---

## INSTRUCCIONES PARA LA INVESTIGACIÓN

### Fase 1: Investigación de Prioridad Crítica (Hacer primero)

```
Investiga las soluciones para TODOS los problemas marcados como 🔴 PRIORIDAD CRÍTICA.

Para cada problema:
1. Lee la documentación oficial relevante
2. Busca artículos de expertos (mínimo 3 fuentes)
3. Encuentra ejemplos de código en proyectos reales
4. Documenta siguiendo el formato especificado
5. Incluye SIEMPRE citas textuales de las fuentes

Crea un documento por categoría:
- DECIMAL_UTILS_SOLUTIONS.md
- ZUSTAND_STATE_MANAGEMENT_SOLUTIONS.md
- PERFORMANCE_OPTIMIZATION_SOLUTIONS.md

Cada documento debe contener las soluciones para todos los sub-problemas de esa categoría.
```

### Fase 2: Investigación de Prioridad Alta (Hacer segundo)

```
[Mismas instrucciones que Fase 1, para categorías marcadas como 🟡]

Documentos a crear:
- REACT_HOOKS_SOLUTIONS.md
- TYPESCRIPT_BEST_PRACTICES_SOLUTIONS.md
- COMPONENT_ARCHITECTURE_SOLUTIONS.md
```

### Fase 3: Investigación de Prioridad Media (Hacer tercero)

```
[Mismas instrucciones que Fase 1, para categorías marcadas como 🟢]

Documentos a crear:
- SERVICE_LAYER_SOLUTIONS.md
- MODULE_STRUCTURE_SOLUTIONS.md
```

### Fase 4: Investigación de Prioridad Baja (Hacer último)

```
[Mismas instrucciones que Fase 1, para categorías marcadas como 🔵]

Documentos a crear:
- CODE_QUALITY_SOLUTIONS.md
```

---

## VALIDACIÓN DE FUENTES

### Fuentes Aceptables (en orden de prioridad):

1. **Documentación Oficial** (máxima prioridad)
   - react.dev
   - zustand.docs.pmnd.rs
   - typescriptlang.org
   - GitHub official repositories

2. **Expertos Reconocidos** (alta prioridad)
   - Dan Abramov (React core team)
   - Kent C. Dodds (Testing Library, React Training)
   - TkDodo (TanStack maintainer)
   - Daishi Kato (Zustand/Jotai creator)
   - Matt Pocock (TypeScript educator)

3. **Blogs de Empresas Tech** (media prioridad)
   - Vercel Engineering Blog
   - Stripe Engineering Blog
   - Netflix Tech Blog
   - Airbnb Engineering & Data Science

4. **Plataformas de Comunidad** (baja prioridad)
   - Stack Overflow (>100 votos)
   - Reddit r/reactjs (posts con gold/silver)
   - Dev.to (highly rated)

### Fuentes NO Aceptables:
- Blogs personales sin credenciales verificables
- Stack Overflow con <50 votos
- Artículos sin fecha (pueden ser obsoletos)
- Medium articles sin verificación del autor

---

## CRITERIOS DE ÉXITO

La investigación se considera completa cuando:

- [ ] Todas las categorías CRÍTICAS tienen documentación completa
- [ ] Cada solución tiene mínimo 3 fuentes verificables
- [ ] Hay ejemplos de código ANTES y DESPUÉS para cada problema
- [ ] Se incluyen pasos de refactoring específicos
- [ ] Se identifican casos edge
- [ ] Se estima esfuerzo de implementación
- [ ] Todas las citas incluyen URLs a las fuentes

---

## OUTPUT ESPERADO

Al finalizar la investigación, debes tener:

1. **7 documentos de soluciones:**
   - DECIMAL_UTILS_SOLUTIONS.md
   - ZUSTAND_STATE_MANAGEMENT_SOLUTIONS.md
   - PERFORMANCE_OPTIMIZATION_SOLUTIONS.md
   - REACT_HOOKS_SOLUTIONS.md
   - TYPESCRIPT_BEST_PRACTICES_SOLUTIONS.md
   - COMPONENT_ARCHITECTURE_SOLUTIONS.md
   - SERVICE_LAYER_SOLUTIONS.md
   - MODULE_STRUCTURE_SOLUTIONS.md
   - CODE_QUALITY_SOLUTIONS.md

2. **Un documento resumen:**
   - REFACTORING_STRATEGY_SUMMARY.md
   - Priorización de correcciones
   - Estimación de esfuerzo total
   - Roadmap de implementación

3. **Preparación para prompt maestro:**
   - Patrones validados listos para usar
   - Ejemplos de código verificados
   - Checklist de validación por categoría

---

## EJEMPLO DE INVESTIGACIÓN COMPLETA

### Para el problema 2.1: "Operadores nativos en cálculos financieros"

```markdown
# Solución: Operadores nativos en cálculos financieros

## Código de referencia: 2.1

## Categoría de impacto
**CRÍTICO** - Causa errores de precisión en dinero, puede tener implicaciones legales.

## Descripción del anti-pattern

El uso de operadores JavaScript nativos (`*`, `/`, `+`, `-`) para cálculos financieros causa errores de precisión debido a la representación binaria de números flotantes.

```typescript
// ❌ INCORRECTO
const price = 19.99;
const quantity = 3;
const total = price * quantity; // 59.97000000000001
const withTax = total * 1.21;   // 72.5637 (debería ser 72.56)
```

## Por qué es un problema

**Fuente 1: IEEE 754 Floating Point Standard**
> "Binary floating-point arithmetic cannot accurately represent all decimal values. For financial calculations where exact decimal representation is required, fixed-point or decimal arithmetic should be used."
- Fuente: IEEE Standard for Floating-Point Arithmetic (IEEE 754-2008)
- URL: https://ieeexplore.ieee.org/document/4610935

**Fuente 2: Martin Fowler - Money Pattern**
> "Floating point numbers are not appropriate for monetary calculations due to rounding errors. Use either integer cents or a decimal type with fixed precision."
- Autor: Martin Fowler
- Fuente: Patterns of Enterprise Application Architecture
- URL: https://martinfowler.com/eaaCatalog/money.html

**Fuente 3: Stripe Engineering Blog**
> "At Stripe, we represent all monetary amounts as integers in the smallest currency unit (cents for USD). This eliminates floating point errors entirely."
- Autor: Stripe Engineering Team
- URL: https://stripe.com/docs/currencies#zero-decimal

**Fuente 4: Decimal.js Documentation**
> "JavaScript numbers are IEEE 754 floating point and therefore suffer from rounding errors. This makes them unsuitable for financial calculations."
- Fuente: Decimal.js Official Documentation
- URL: https://mikemcl.github.io/decimal.js/

## Solución recomendada

Usar una librería de precisión decimal (como Decimal.js) que el proyecto ya tiene envuelta en `DecimalUtils`.

### Código correcto

```typescript
// ✅ CORRECTO
import { financial } from '@/lib/decimalUtils';

const price = financial('19.99');
const quantity = 3;
const total = financial.multiply(price, quantity);        // Decimal: 59.97
const withTax = financial.multiply(total, '1.21');        // Decimal: 72.56
const finalAmount = financial.toNumber(withTax);          // 72.56 (exacto)
```

### Explicación

`DecimalUtils` proporciona diferentes dominios según la precisión requerida:

- `financial(value, decimals = 2)` - Para dinero (2 decimales)
- `tax(value, decimals = 6)` - Para impuestos (6 decimales)
- `inventory(value, decimals = 4)` - Para inventario (4 decimales)
- `recipe(value, decimals = 3)` - Para recetas (3 decimales)

Cada dominio garantiza:
1. **Precisión:** Sin errores de redondeo
2. **Consistencia:** Mismo número de decimales
3. **Trazabilidad:** Errores claros si se violan las reglas

## Patrón de refactoring

### Paso 1: Identificar cálculos financieros

```typescript
// Buscar patrones como:
// - price * quantity
// - amount + tax
// - total - discount
// - value * (1 + rate)
```

### Paso 2: Importar DecimalUtils

```typescript
// ❌ ANTES
const calculateTotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

// ✅ DESPUÉS
import { financial } from '@/lib/decimalUtils';

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => {
    const lineTotal = financial.multiply(item.price, item.quantity);
    return financial.add(sum, lineTotal);
  }, financial('0'));
};
```

### Paso 3: Convertir solo al final

```typescript
// ✅ Mantener Decimal hasta el último momento
const total = calculateTotal(items);           // Decimal
const withTax = financial.multiply(total, TAX_RATE); // Decimal

// Solo convertir para display o API
const displayValue = financial.format(withTax);      // "72.56"
const apiValue = financial.toNumber(withTax);        // 72.56
```

## Casos edge a considerar

### 1. Divisiones con resto
```typescript
// ⚠️ CUIDADO: División de 100 en 3 partes
const amount = financial('100.00');
const split = financial.divide(amount, 3); // 33.33333...

// Solución: Usar .round() explícitamente
const splitRounded = financial.round(split, 2); // 33.33
```

### 2. Comparaciones
```typescript
// ❌ INCORRECTO
if (total === 100) { ... }

// ✅ CORRECTO
if (financial.equals(total, '100.00')) { ... }
// O
if (financial.toNumber(total) === 100) { ... }
```

### 3. Valores null/undefined
```typescript
// ❌ INCORRECTO
const price = financial(product.price || 0);

// ✅ CORRECTO
const price = product.price ? financial(product.price) : financial('0');
```

## Validación

- [ ] Todos los operadores nativos (`*`, `/`, `+`, `-`) reemplazados con DecimalUtils
- [ ] Tests de cálculos pasan con valores decimales problemáticos (ej: 19.99 * 3)
- [ ] No hay conversiones tempranas a `Number` en medio de cálculos
- [ ] Comparaciones usan `.equals()` o conversión final
- [ ] TypeScript compila sin errores
- [ ] ESLint no reporta uso de operadores en contextos financieros

## Esfuerzo estimado

**MEDIO** - Refactoring sistemático pero straightforward.

- **Por función:** 5-15 minutos
- **Por servicio (10-20 funciones):** 2-4 horas
- **Proyecto completo (55 violaciones encontradas):** 3-5 días

## Referencias

1. IEEE Standard for Floating-Point Arithmetic (IEEE 754-2008)
   https://ieeexplore.ieee.org/document/4610935

2. Martin Fowler - Money Pattern
   https://martinfowler.com/eaaCatalog/money.html

3. Stripe API Documentation - Currencies
   https://stripe.com/docs/currencies

4. Decimal.js Documentation
   https://mikemcl.github.io/decimal.js/

5. MDN Web Docs - Number.EPSILON
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON

6. Stack Overflow: "Is floating point math broken?" (16k+ votes)
   https://stackoverflow.com/questions/588004/is-floating-point-math-broken
```

---

## SIGUIENTE PASO DESPUÉS DE LA INVESTIGACIÓN

Una vez completada la investigación de TODAS las categorías, usar los documentos de soluciones para construir:

**MASTER_REFACTORING_PROMPT.md** - Un prompt que:
1. Tome un módulo/página como input
2. Identifique automáticamente qué problemas tiene
3. Aplique las soluciones documentadas
4. Genere el código refactorizado
5. Cree tests de validación

Ese será el prompt que se ejecutará módulo por módulo para estandarizar el codebase.

---

**STATUS:** 📋 Listo para comenzar investigación
**PRIORIDAD:** Comenzar con Fase 1 (Crítica)
