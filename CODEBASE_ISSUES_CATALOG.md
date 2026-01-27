# Catálogo de Problemas y Anti-Patterns Detectados en el Codebase

**Fecha:** 2025-12-17  
**Propósito:** Documentar de forma genérica todos los tipos de problemas encontrados durante la auditoría del codebase para posteriormente investigar soluciones industry-standard.

---

## CATEGORÍA 1: GESTIÓN DE ESTADO (Zustand)

### 1.1 Uso de `immer` middleware sin el wrapper oficial
**Descripción:** Stores que importan `produce` de immer directamente en lugar de usar el middleware oficial de Zustand, causando que los cambios de estado no se detecten correctamente (bug de reactividad).

**Síntomas:**
- Imports como `import { produce } from 'immer'`
- Uso de `set(produce((state) => { ... }))`
- Componentes que no se actualizan cuando el estado cambia
- Referencias del estado que permanecen iguales después de mutaciones

**Impacto:** Alto - Causa bugs de reactividad donde la UI no refleja cambios de estado.

---

### 1.2 Mezcla de Server State con Client State
**Descripción:** Stores que almacenan tanto datos del servidor (items, products, customers) como estado de UI (isModalOpen, filters, selectedItems) en el mismo store.

**Síntomas:**
- Interface de store con campos como: `items: T[]`, `isModalOpen: boolean`, `filters: FilterObject`
- Actions que mezclan operaciones de fetching con operaciones de UI
- Problemas de sincronización entre datos del servidor y estado local

**Impacto:** Medio - Dificulta la separación de concerns y la gestión del cache.

---

### 1.3 CRUD Operations en Stores
**Descripción:** Stores que contienen operaciones async de creación, actualización y eliminación con llamadas a la base de datos, cuando estas deberían estar en custom hooks.

**Síntomas:**
- Actions como `addItem: async (data) => { const result = await api.create(data); ... }`
- Business logic dentro de las actions del store (validación, normalización)
- Manejo de loading/error states dentro del store para operaciones async

**Impacto:** Alto - Viola el principio de responsabilidad única y dificulta testing.

---

### 1.4 Persistencia de Server Data en localStorage
**Descripción:** Stores que persisten arrays de datos del servidor (suppliers, products) en localStorage, causando data stale y conflictos de sincronización.

**Síntomas:**
- Uso del middleware `persist` con arrays de datos del servidor
- Datos que se vuelven obsoletos entre sesiones
- Conflictos cuando múltiples tabs modifican datos

**Impacto:** Alto - Causa problemas de sincronización y datos desactualizados.

---

### 1.5 Stores muy grandes (>500 líneas)
**Descripción:** Stores monolíticos que manejan demasiadas responsabilidades, difíciles de mantener y testear.

**Síntomas:**
- Archivos de store con más de 500 líneas
- Múltiples dominios mezclados en un solo store
- Más de 20 actions en el mismo store

**Impacto:** Medio - Dificulta mantenimiento y testing.

---

### 1.6 Falta de Atomic Selectors
**Descripción:** Stores que no exportan selectores atómicos, causando que componentes se suscriban a más estado del necesario.

**Síntomas:**
- No hay selectores helper exportados
- Componentes usando `const data = useStore()` (todo el store)
- Componentes usando `const { a, b, c } = useStore()` sin `useShallow`

**Impacto:** Alto - Causa re-renders innecesarios y problemas de performance.

---

### 1.7 Derived State almacenado en lugar de computado
**Descripción:** Valores que podrían calcularse desde otros valores del state son almacenados redundantemente, causando problemas de sincronización.

**Síntomas:**
- Estado que se calcula a partir de otro estado pero se almacena
- Múltiples acciones que deben actualizar el mismo valor derivado
- Inconsistencias cuando un valor cambia pero su derivado no

**Impacto:** Alto - Viola Single Source of Truth, causa bugs de sincronización.

---

### 1.8 Lazy Loading Condicional
**Descripción:** Patrón `if (items.length === 0) fetch()` que causa data stale cuando hay datos parciales o cuando se eliminan todos los items.

**Síntomas:**
- Checks como `if (items.length === 0)` antes de fetch
- No hay flags de "initialized" o "loaded"
- Re-fetching no ocurre después de operaciones de eliminación

**Impacto:** Medio - Causa problemas con datos parciales y después de eliminaciones.

---

## CATEGORÍA 2: PRECISIÓN MATEMÁTICA (DecimalUtils)

### 2.1 Operadores nativos en cálculos financieros
**Descripción:** Uso de `*`, `/`, `+`, `-` para cálculos de precios, totales, subtotales en lugar de DecimalUtils.

**Síntomas:**
- Expresiones como: `price * quantity`, `subtotal + tax`, `total - discount`
- Cálculos financieros con operadores JavaScript nativos
- Variables de tipo `number` para valores monetarios

**Impacto:** Crítico - Causa errores de redondeo en cálculos financieros.

**Ejemplos típicos:**
```typescript
// ❌ INCORRECTO
const total = price * quantity;
const subtotal = items.reduce((sum, item) => sum + item.price, 0);
const withTax = amount * 1.21;
```

---

### 2.2 Cálculo de impuestos con operadores nativos
**Descripción:** Uso de `* 0.21` o similar para cálculos de IVA/impuestos.

**Síntomas:**
- Multiplicaciones directas por tasas de impuestos
- Cálculos de porcentajes con operadores nativos
- Pérdida de precisión en cálculos fiscales

**Impacto:** Crítico - Puede causar problemas legales con autoridades fiscales.

---

### 2.3 Cálculo de porcentajes sin precisión
**Descripción:** Cálculos de margen, descuentos, porcentajes usando división/multiplicación nativa.

**Síntomas:**
- Operaciones como `value / 100`, `amount * (discount / 100)`
- Comparaciones de porcentajes con números flotantes

**Impacto:** Alto - Causa inconsistencias en reportes y análisis.

---

### 2.4 Cálculos en componentes UI
**Descripción:** Lógica de cálculo financiero directamente en componentes en lugar de delegarla a servicios o hooks especializados.

**Síntomas:**
- Cálculos inline en JSX: `{price * quantity}`
- Lógica de negocio dentro del render
- Falta de centralización de reglas de cálculo

**Impacto:** Alto - Dificulta testing y causa duplicación de lógica.

---

### 2.5 Conversión temprana a Number
**Descripción:** Convertir a `.toNumber()` antes de completar todas las operaciones, perdiendo precisión intermedia.

**Síntomas:**
- Llamadas a `.toNumber()` en medio de cadenas de operaciones
- Conversión antes de sumar múltiples valores
- Uso de `Number()` en lugar de mantener Decimal

**Impacto:** Alto - Pierde la precisión que DecimalUtils intenta preservar.

---

## CATEGORÍA 3: ESTRUCTURA DE MÓDULOS

### 3.1 Módulos sin manifest.tsx
**Descripción:** Módulos que usan patrones legacy (init.ts) en lugar del sistema de manifests.

**Síntomas:**
- Carpetas en `/modules` sin archivo `manifest.tsx`
- Uso de archivos `init.ts` o `index.ts` para inicialización
- No se registran en el ModuleRegistry

**Impacto:** Alto - No se integran correctamente con el sistema modular.

---

### 3.2 Módulos minimalistas/incompletos
**Descripción:** Módulos que solo tienen manifest + README sin estructura interna (hooks, services, types, components).

**Síntomas:**
- Carpetas de módulos con solo 2-3 archivos
- Falta de subcarpetas estándar (hooks, services, components, types)
- Funcionalidad mínima o placeholder

**Impacto:** Medio - Indica desarrollo incompleto o arquitectura inconsistente.

---

### 3.3 Tipos importados desde /pages en lugar de /modules
**Descripción:** Módulos que importan tipos desde la carpeta pages, violando la encapsulación del módulo.

**Síntomas:**
- Imports como `import type { ... } from '@/pages/.../types'`
- Dependencia circular entre módulos y páginas
- Módulos que no son auto-contenidos

**Impacto:** Alto - Viola el principio de encapsulación, crea acoplamiento.

---

### 3.4 Hooks en ubicación incorrecta
**Descripción:** Hooks de dominio ubicados en `/pages` cuando deberían estar en `/modules` (violación de Module-First architecture).

**Síntomas:**
- Hooks complejos (>300 líneas) en carpeta `pages/.../hooks/`
- Hooks reutilizables que no están en módulos
- Re-exports desde módulos hacia hooks en pages

**Impacto:** Medio - Dificulta reusabilidad y mantenimiento.

---

### 3.5 Servicios duplicados entre páginas y módulos
**Descripción:** El mismo servicio implementado en dos ubicaciones diferentes.

**Síntomas:**
- Archivos con mismo nombre en `/services` y `/pages/.../services/`
- Código duplicado o levemente diferente
- Confusión sobre cuál versión usar

**Impacto:** Alto - Causa inconsistencias y duplicación de bugs.

---

### 3.6 Estructura inconsistente entre módulos
**Descripción:** Algunos módulos tienen estructura completa (7 subdirectorios), otros casi vacíos.

**Síntomas:**
- Variabilidad alta en organización de carpetas
- Algunos con `__tests__/`, otros sin tests
- Algunos con README detallado, otros sin documentación

**Impacto:** Medio - Dificulta navegación y comprensión del código.

---

## CATEGORÍA 4: COMPONENTES REACT

### 4.1 Componentes muy grandes (>500 líneas)
**Descripción:** Componentes que mezclan demasiada lógica y presentación, difíciles de mantener.

**Síntomas:**
- Archivos de componentes con >500 líneas
- Múltiples responsabilidades en un solo componente
- Difícil de hacer scroll y entender

**Impacto:** Alto - Dificulta mantenimiento, testing, y code reviews.

---

### 4.2 Mezcla de lógica y presentación
**Descripción:** Componentes que contienen data fetching, business logic, y rendering en el mismo archivo.

**Síntomas:**
- `useEffect` para data fetching dentro del componente
- Validaciones y cálculos complejos en el cuerpo del componente
- Business logic no extraída a hooks o servicios

**Impacto:** Alto - Dificulta testing unitario y reusabilidad.

---

### 4.3 Acceso directo a Supabase desde componentes
**Descripción:** Componentes que importan y usan el cliente Supabase directamente en lugar de usar servicios.

**Síntomas:**
- `import { supabase } from '@/lib/supabase'` en componentes
- Queries de Supabase inline en componentes
- No hay capa de abstracción para data access

**Impacto:** Crítico - Viola arquitectura en capas, dificulta testing.

---

### 4.4 Inline event handlers en loops
**Descripción:** Funciones arrow inline en callbacks de `.map()` que crean nuevas funciones en cada render.

**Síntomas:**
- Patrón: `.map(item => <Component onClick={() => handler(item)} />)`
- Nuevas funciones creadas en cada render
- Componentes hijos no memoizados se re-renderizan innecesariamente

**Impacto:** Medio - Causa re-renders innecesarios, impacta performance.

---

### 4.5 Props drilling (>3 niveles)
**Descripción:** Pasar props a través de múltiples niveles de componentes.

**Síntomas:**
- Props pasadas a través de 3+ niveles de componentes intermedios
- Componentes intermedios que solo pasan props sin usarlas
- Dificultad para seguir el flujo de datos

**Impacto:** Medio - Dificulta refactoring y mantenimiento.

---

### 4.6 Inline styles extensos
**Descripción:** Objetos de estilo grandes definidos inline en JSX en lugar de usar el sistema de estilos.

**Síntomas:**
- Objetos `style={{ ... }}` con 5+ propiedades
- Estilos duplicados entre componentes
- No uso del design system (Chakra UI)

**Impacto:** Medio - Dificulta mantenimiento y consistencia visual.

---

### 4.7 Componentes con demasiadas props (>10)
**Descripción:** Interfaces de props muy amplias que indican que el componente hace demasiado.

**Síntomas:**
- Interfaces con >10 props
- Props con nombres genéricos (data, config, options)
- Componente con múltiples responsabilidades

**Impacto:** Medio - Indica violación de Single Responsibility Principle.

---

### 4.8 Falta de displayName en componentes memoizados
**Descripción:** Componentes con `memo()` sin `displayName`, dificultando debugging.

**Síntomas:**
- `export const Component = memo(...)` sin `displayName`
- Componentes que aparecen como "Anonymous" en DevTools
- Dificulta profiling de performance

**Impacto:** Bajo - Dificulta debugging y performance profiling.

---

### 4.9 Demasiados imports (>15)
**Descripción:** Componentes que importan demasiados módulos, indicando acoplamiento alto.

**Síntomas:**
- Más de 15 líneas de imports
- Imports de muchos iconos individuales
- Imports de muchos componentes de UI

**Impacto:** Bajo - Indica posible violación de SRP.

---

## CATEGORÍA 5: HOOKS PERSONALIZADOS

### 5.1 Hooks muy grandes (>300 líneas)
**Descripción:** Hooks monolíticos que manejan demasiadas responsabilidades.

**Síntomas:**
- Archivos de hooks con >300 líneas
- Múltiples preocupaciones en un solo hook
- Retorna >8 valores

**Impacto:** Alto - Dificulta testing y reusabilidad.

---

### 5.2 Demasiados useState (>5)
**Descripción:** Hooks con muchos estados independientes que deberían usar useReducer o consolidarse.

**Síntomas:**
- Más de 5 llamadas a `useState` en el mismo hook
- Estados relacionados que cambian juntos
- Lógica de actualización compleja

**Impacto:** Medio - Indica que debería usarse useReducer.

---

### 5.3 Mezcla de concerns en hooks
**Descripción:** Hooks que mezclan data fetching, UI state, y business logic.

**Síntomas:**
- Un solo hook que maneja fetching + state + validación + UI
- Difícil de testear partes individuales
- No hay separación clara de responsabilidades

**Impacto:** Alto - Dificulta testing y reusabilidad.

---

### 5.4 Uso de refs como workaround de dependencias
**Descripción:** Patrón `useRef` para evitar incluir valores en arrays de dependencias.

**Síntomas:**
- `useRef` para almacenar valores que cambian
- Acceso a `.current` en effects
- Comentarios como "// avoid dependency"

**Impacto:** Medio - Indica problemas con el diseño del hook.

---

### 5.5 useCallback/useMemo con dependencias incorrectas
**Descripción:** Dependencies arrays que incluyen setters de useState (innecesario) o les faltan valores.

**Síntomas:**
- `[setState, ...]` en dependencies
- ESLint warnings ignorados sobre dependencies
- Closures stale por falta de dependencies

**Impacto:** Medio - Causa bugs sutiles o memoización inefectiva.

---

### 5.6 Validación síncrona en cada keystroke
**Descripción:** Validaciones costosas que se ejecutan en cada cambio de input sin debounce.

**Síntomas:**
- `useEffect(() => validate(formData), [formData])`
- Performance degradada al escribir rápido
- UI que se congela durante typing

**Impacto:** Alto - Impacta negativamente la UX.

---

### 5.7 Effects que modifican estado que observan
**Descripción:** `useEffect` que modifica valores de los que depende, causando loops infinitos potenciales.

**Síntomas:**
- Dependencies que incluyen estado modificado en el effect
- Infinite loop warnings
- Uso de flags para prevenir loops

**Impacto:** Crítico - Puede causar loops infinitos.

---

## CATEGORÍA 6: SERVICIOS Y API

### 6.1 Servicios duplicados
**Descripción:** El mismo servicio implementado en múltiples ubicaciones.

**Síntomas:**
- Archivos con mismo nombre en diferentes carpetas
- Funciones con misma firma en múltiples archivos
- Inconsistencias entre versiones

**Impacto:** Alto - Causa bugs y confusión sobre cuál usar.

---

### 6.2 Naming inconsistente
**Descripción:** Mezcla de `*Api.ts`, `*Service.ts`, `*Engine.ts` sin criterio claro.

**Síntomas:**
- No hay convención clara de nombres
- Archivos Api que contienen business logic
- Archivos Service que solo hacen CRUD

**Impacto:** Medio - Dificulta encontrar funcionalidad.

---

### 6.3 Servicios que mezclan concerns
**Descripción:** Servicios con CRUD + business logic + analytics en el mismo archivo.

**Síntomas:**
- Archivos de servicio >500 líneas
- Funciones de CRUD mezcladas con cálculos
- Data access mezclado con transformaciones

**Impacto:** Alto - Viola Single Responsibility Principle.

---

### 6.4 Error handling inconsistente
**Descripción:** Algunos servicios usan logger, otros throw simple, otros errorHandler utility.

**Síntomas:**
- Mezcla de `throw new Error()`, `logger.error()`, `errorHandler.handle()`
- Algunos errores se logean, otros no
- Formato de errores inconsistente

**Impacto:** Medio - Dificulta debugging y monitoreo.

---

### 6.5 Servicios sin tipado de retorno
**Descripción:** Funciones que retornan `Promise<any>` o `Promise<any[]>`.

**Síntomas:**
- Return types como `Promise<any>`
- Falta de interfaces para response objects
- Type safety perdido en la capa de servicio

**Impacto:** Alto - Pierde beneficios de TypeScript.

---

### 6.6 Servicios muy grandes (>500 líneas)
**Descripción:** Servicios monolíticos que deberían dividirse por responsabilidad.

**Síntomas:**
- Archivos >500 líneas
- Múltiples dominios en el mismo archivo
- Difícil navegación

**Impacto:** Medio - Dificulta mantenimiento.

---

### 6.7 Falta de request deduplication
**Descripción:** Servicios que no previenen llamadas duplicadas concurrentes.

**Síntomas:**
- Múltiples requests idénticos en paralelo
- No uso de utilities de deduplication
- Race conditions con llamadas concurrentes

**Impacto:** Medio - Causa llamadas innecesarias a la API.

---

## CATEGORÍA 7: CONTEXTS

### 7.1 Context value sin memoización
**Descripción:** Providers que pasan objetos nuevos en cada render, causando re-renders masivos.

**Síntomas:**
- `<Context.Provider value={{ ... }}>` sin `useMemo`
- Todos los consumers re-renderizan en cada update del provider
- Performance degradada

**Impacto:** Crítico - Causa re-renders masivos en toda la aplicación.

---

### 7.2 Funciones en context sin useCallback
**Descripción:** Callbacks en context values que se recrean en cada render.

**Síntomas:**
- Funciones inline en el value object del context
- Consumers con `memo()` que se re-renderizan igual
- No uso de `useCallback` para funciones

**Impacto:** Alto - Rompe memoización de componentes consumers.

---

### 7.3 Contexts monolíticos
**Descripción:** Un solo context con state + actions cuando deberían separarse.

**Síntomas:**
- Context con 10+ valores
- Mezcla de state y dispatch functions
- Componentes que solo necesitan parte del context se re-renderizan

**Impacto:** Medio - Causa re-renders innecesarios.

---

## CATEGORÍA 8: TYPESCRIPT

### 8.1 Uso de `any`
**Descripción:** Tipos `any` en código de producción.

**Síntomas:**
- Variables o parámetros tipados como `any`
- Arrays como `any[]`
- Return types como `any`

**Impacto:** Alto - Pierde type safety.

---

### 8.2 Type assertions innecesarias (`as`)
**Descripción:** Casts que podrían evitarse con mejor tipado.

**Síntomas:**
- Uso frecuente de `as Type`
- `as any` para "solucionar" problemas de tipos
- Type guards no usados

**Impacto:** Medio - Indica problemas en el diseño de tipos.

---

### 8.3 Funciones sin tipo de retorno explícito
**Descripción:** Funciones exportadas sin declarar qué retornan.

**Síntomas:**
- Funciones sin `: ReturnType`
- TypeScript infiere el tipo
- No hay documentación del contrato

**Impacto:** Medio - Dificulta uso de las APIs.

---

### 8.4 Interfaces vacías
**Descripción:** `interface X {}` que no aportan valor.

**Síntomas:**
- Interfaces sin propiedades
- Placeholders no completados
- Type aliases que podrían ser `Record<string, never>`

**Impacto:** Bajo - Código muerto o incompleto.

---

### 8.5 Uso del tipo `Function`
**Descripción:** Tipo genérico `Function` en lugar de firma específica.

**Síntomas:**
- Props tipadas como `Function`
- Callbacks sin firma específica
- Pérdida de type safety en callbacks

**Impacto:** Medio - Pierde información de tipos.

---

## CATEGORÍA 9: PERFORMANCE

### 9.1 Re-renders innecesarios por modal state en store
**Descripción:** Estado de visibilidad de modals en Zustand store global causando re-renders de página completa.

**Síntomas:**
- `isModalOpen` en store global
- Toda la página re-renderiza al abrir/cerrar modal
- Profiler muestra 100+ componentes re-renderizando

**Impacto:** Crítico - Degrada performance severamente.

---

### 9.2 Objetos/arrays inline en props
**Descripción:** `prop={{ a: 1 }}` o `prop={[1,2,3]}` que rompen memoización.

**Síntomas:**
- Objetos literales inline en JSX
- Arrays literales inline
- Componentes `memo()` que se re-renderizan igual

**Impacto:** Alto - Rompe memoización.

---

### 9.3 Selectores que retornan nuevos objetos
**Descripción:** `useStore(state => ({ a: state.a, b: state.b }))` crea objeto nuevo cada vez.

**Síntomas:**
- Selectores que retornan objetos/arrays literales
- Re-renders en cada cambio del store
- No uso de `useShallow`

**Impacto:** Alto - Causa re-renders innecesarios.

---

### 9.4 Falta de memoización en componentes pesados
**Descripción:** Componentes con muchos hijos que no usan `memo()`.

**Síntomas:**
- Componentes pesados sin `React.memo()`
- Listas sin memoización de items
- Re-renders de árboles grandes

**Impacto:** Alto - Degrada performance de la aplicación.

---

## CATEGORÍA 10: ARQUITECTURA CROSS-MODULE

### 10.1 Eventos inconsistentes
**Descripción:** Algunos módulos usan EventBus, otros window.dispatchEvent, otros callbacks directos.

**Síntomas:**
- Mezcla de patrones de eventos
- No hay convención clara
- Difícil rastrear flujo de eventos

**Impacto:** Medio - Dificulta debugging.

---

### 10.2 Dependencias circulares potenciales
**Descripción:** Módulos que se importan mutuamente.

**Síntomas:**
- Módulo A importa de módulo B y viceversa
- Build warnings sobre circular dependencies
- Runtime errors en casos extremos

**Impacto:** Alto - Puede causar errores en runtime.

---

### 10.3 Hook points no consumidos
**Descripción:** Módulos que proveen hook points que nadie consume.

**Síntomas:**
- Hook points declarados en manifest pero no usados
- Código muerto
- Confusión sobre arquitectura

**Impacto:** Bajo - Código muerto, confusión.

---

### 10.4 Comunicación directa entre módulos
**Descripción:** Importaciones directas en lugar de usar el sistema de registry/events.

**Síntomas:**
- `import { ... } from '@/modules/other-module'`
- No uso de ModuleRegistry
- Acoplamiento fuerte entre módulos

**Impacto:** Alto - Viola arquitectura modular.

---

## ESTADÍSTICAS GLOBALES

### Resumen por Severidad:
- **Crítico:** 6 tipos de problemas
- **Alto:** 28 tipos de problemas
- **Medio:** 23 tipos de problemas
- **Bajo:** 4 tipos de problemas

**Total:** 61 tipos de anti-patterns y problemas identificados

---

## PRÓXIMOS PASOS

Este catálogo será usado para:
1. Investigar soluciones industry-standard para cada categoría
2. Crear patrones de refactoring documentados
3. Construir un prompt maestro que guíe la corrección módulo por módulo
4. Establecer convenciones claras para el proyecto

---

**Documento vivo:** Este catálogo se actualizará conforme se descubran nuevos patrones o se refinen las categorías.
