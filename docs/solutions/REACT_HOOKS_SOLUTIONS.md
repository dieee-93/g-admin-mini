# Solución: React Hooks Anti-Patterns

## Código de referencia: 5.1, 5.5, 5.6, 5.7

## Categoría de impacto
**ALTA** - Afecta directamente la estabilidad de la UI, causa bucles infinitos, problemas de performance y hace el código inmantenerible.

---

## 1. Dependencias Incorrectas en Hooks (5.5)

### Descripción del anti-pattern

El uso incorrecto de los arrays de dependencia en `useEffect`, `useCallback` y `useMemo` es la fuente más común de bugs en React. Esto incluye:
1.  **Faltar dependencias:** Causa "stale closures" (el hook ve valores antiguos de variables).
2.  **Dependencias innecesarias:** Causa re-renderizados o re-cálculos excesivos.
3.  **Incluir funciones setters estables:** `setState` de `useState` o `dispatch` de `useReducer` son estables, pero a menudo se incluyen por "seguridad".
4.  **Mentir a React:** Omitir dependencias intencionalmente para "evitar que corra" el efecto.

```typescript
// ❌ INCORRECTO: Stale Closure
function SearchResults({ query }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // 'query' se usa aquí pero no está en dependencias
      const result = await api.search(query); 
      setData(result);
    }
    fetchData();
  }, []); // 🔴 El efecto no corre cuando 'query' cambia
}
```

### Por qué es un problema

**Fuente 1: React Documentation - Legacy Docs (Hooks FAQ)**
> "If you specify the dependencies, all values from the component scope that change over time and are used by the effect must be included. Otherwise, your code will reference stale values from previous renders."
- Fuente: React Docs (Legacy)
- URL: https://legacy.reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies

**Fuente 2: Dan Abramov**
> "You can't 'choose' when the effect runs. You can only choose 'what' the effect synchronizes with. If you use a variable, it is a dependency."
- Autor: Dan Abramov
- Fuente: A Complete Guide to useEffect
- URL: https://overreacted.io/a-complete-guide-to-useeffect/

### Solución recomendada

1.  **Siempre** usar la regla de ESLint `react-hooks/exhaustive-deps`.
2.  Si el linter pide una dependencia que no quieres que dispare el efecto, tu lógica está mal estructurada (probablemente necesitas un Event Handler, no un Effect).
3.  Usar funciones "updater" para romper dependencias de estado (`setCount(c => c + 1)` en lugar de `setCount(count + 1)`).

### Código correcto

```typescript
// ✅ CORRECTO
function SearchResults({ query }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      const result = await api.search(query);
      if (!ignore) setData(result);
    }
    fetchData();
    return () => { ignore = true; };
  }, [query]); // ✅ Se re-ejecuta cuando query cambia
}
```

### Patrón de refactoring

#### Paso 1: Habilitar/Obedecer Linter
Asegurarse de que `eslint-plugin-react-hooks` esté configurado y **no** usar `// eslint-disable-next-line react-hooks/exhaustive-deps` a menos que sea absolutamente crítico.

#### Paso 2: Usar Updater Functions
Eliminar dependencias de estado usando la forma funcional de los setters.

```typescript
// Antes
const increment = useCallback(() => {
  setCount(count + 1);
}, [count]); // Re-crea la función cada vez que count cambia

// Después
const increment = useCallback(() => {
  setCount(c => c + 1);
}, []); // ✅ Estable, nunca cambia
```

#### Paso 3: Mover objetos/funciones dentro del Effect
Si una función o objeto solo se usa en el efecto, muévelo adentro.

```typescript
// Antes
const options = { method: 'GET' }; // Se recrea en cada render
useEffect(() => { fetch(url, options) }, [options]); // Loop infinito o renders innecesarios

// Después
useEffect(() => {
  const options = { method: 'GET' };
  fetch(url, options);
}, []); // ✅ Estable
```

---

## 2. Validación Síncrona en Keystroke (5.6)

### Descripción del anti-pattern

Ejecutar validaciones costosas o llamadas a API directamente en el evento `onChange` de un input. Esto bloquea el hilo principal mientras el usuario escribe, causando una UI lenta ("janky").

```typescript
// ❌ INCORRECTO
const handleChange = (e) => {
  const newValue = e.target.value;
  setValue(newValue);
  // Validación pesada o llamada API en cada tecla
  validateComplexRules(newValue); 
  checkAvailabilityInServer(newValue);
};
```

### Por qué es un problema

**Fuente 1: React.dev**
> "State updates that happen in response to user events (like typing) should generally be handled quickly. If you perform an expensive calculation synchronously, the user will perceive a lag."
- Fuente: React Documentation - Performance

### Solución recomendada

1.  **Debouncing:** Esperar a que el usuario deje de escribir por N ms antes de validar.
2.  **Validación en `onBlur`:** Validar solo cuando el usuario sale del campo.
3.  **Transiciones (React 18 `useTransition`):** Marcar la actualización de validación como no urgente.

### Código correcto

#### Opción A: Debounce (hook personalizado o lodash)

```typescript
// ✅ CORRECTO: Debounce
import { useDebounce } from 'use-debounce'; // O custom hook

function SignupForm() {
  const [username, setUsername] = useState('');
  // El valor debounced se actualiza 500ms después de dejar de escribir
  const [debouncedUsername] = useDebounce(username, 500); 

  useEffect(() => {
    if (debouncedUsername) {
      checkAvailability(debouncedUsername);
    }
  }, [debouncedUsername]);

  return <input onChange={(e) => setUsername(e.target.value)} value={username} />;
}
```

#### Opción B: Validación onBlur

```typescript
// ✅ CORRECTO: onBlur
function SignupForm() {
  const [error, setError] = useState(null);

  const handleBlur = (e) => {
    const validationError = validate(e.target.value);
    setError(validationError);
  };

  return <input onBlur={handleBlur} ... />;
}
```

---

## 3. Effects que Modifican Estado que Observan (5.7)

### Descripción del anti-pattern

Un `useEffect` que tiene una dependencia, y dentro del efecto actualiza esa misma dependencia (directa o indirectamente), causando un bucle infinito o ciclos de renderizado innecesarios.

```typescript
// ❌ INCORRECTO: Bucle Infinito
useEffect(() => {
  const newData = processData(data);
  setData(newData); // 🔴 Dispara el efecto de nuevo porque 'data' cambió
}, [data]);
```

### Por qué es un problema

**Fuente 1: React.dev - You Might Not Need an Effect**
> "If you want to update state based on other state, you might not need an Effect... adjusting state in an Effect makes your data flow harder to understand and slower."
- Fuente: React Documentation
- URL: https://react.dev/learn/you-might-not-need-an-effect

### Solución recomendada

1.  **Derived State:** Calcular el valor durante el renderizado, no en un efecto.
2.  **Event Handlers:** Mover la lógica al evento que causó el cambio original.

### Código correcto

```typescript
// ✅ CORRECTO: Derived State
function Chart({ data }) {
  // No necesitamos useState + useEffect. 
  // Calculamos esto en cada render. Es rápido y seguro.
  // Si es costoso, usamos useMemo.
  const processedData = useMemo(() => processData(data), [data]);

  return <Graph data={processedData} />;
}
```

---

## 4. Hooks Muy Grandes (5.1)

### Descripción del anti-pattern

Hooks personalizados (ej. `useSalesPage.ts` con ~1000 líneas) que manejan múltiples responsabilidades: fetching de datos, lógica de formulario, manejo de UI, reglas de negocio, etc. "God Hooks".

### Por qué es un problema

Viola el principio de Responsabilidad Única (SRP). Son difíciles de testear, difíciles de leer y propensos a errores porque comparten demasiado estado interno.

### Solución recomendada

**Composición de Hooks:** Dividir el hook grande en hooks más pequeños y especializados.

1.  `useSalesData`: Solo fetching y cache (TanStack Query).
2.  `useSalesForm`: Solo manejo de formulario (React Hook Form / Zod).
3.  `useSalesUI`: Manejo de modales, tabs, visibilidad.
4.  `useSalesActions`: Handlers para botones y acciones de usuario.

### Patrón de refactoring

#### Paso 1: Identificar responsabilidades
Analizar `useSalesPage.ts` y agrupar funciones por dominio.

#### Paso 2: Extraer sub-hooks
Crear archivos separados en la misma carpeta (o en `hooks/partials`):

```typescript
// src/pages/sales/hooks/useSalesData.ts
export const useSalesData = () => { ... }

// src/pages/sales/hooks/useSalesActions.ts
export const useSalesActions = (data, refresh) => { ... }
```

#### Paso 3: Componer en el hook principal (o en el componente)

```typescript
// src/pages/sales/hooks/useSalesPage.ts
export const useSalesPage = () => {
  const { data, isLoading } = useSalesData();
  const form = useSalesForm();
  const ui = useSalesUI();
  
  // Inyección de dependencias si es necesario
  const actions = useSalesActions(data, ui);

  return {
    data,
    isLoading,
    form,
    ui,
    actions
  };
};
```

---

## Casos edge a considerar

1.  **Race Conditions:** En efectos asíncronos (fetching), siempre manejar la cancelación ("cleanup") para evitar que respuestas anteriores sobrescriban las nuevas.
2.  **Objetos como dependencias:** `useEffect` usa comparación superficial (referencial). `{ id: 1 } !== { id: 1 }`. Usar primitivos en dependencias (`obj.id`) o `useMemo` para el objeto.
3.  **Third-party libs:** Asegurarse de que las librerías externas tengan referencias estables si se usan en dependencias.

## Validación

- [ ] `eslint-plugin-react-hooks` no reporta warnings en el código refactorizado.
- [ ] No hay bucles infinitos (verificar con `console.log` dentro de Effects sospechosos).
- [ ] La UI responde inmediatamente al escribir (no lag).
- [ ] Tests unitarios de los hooks divididos pasan aisladamente.

## Esfuerzo estimado

**ALTO** - Especialmente para el refactoring de hooks gigantes (`useSalesPage.ts`).

-   **Fix Deps (5.5, 5.7):** Medio. Requiere análisis caso por caso.
-   **Validation (5.6):** Bajo/Medio. Implementar debounce es rápido.
-   **Split Hooks (5.1):** Alto. Requiere entender profundamente la lógica de negocio para desacoplar.

## Referencias

1.  **React.dev - Synchronizing with Effects**
    https://react.dev/learn/synchronizing-with-effects
2.  **React.dev - You Might Not Need an Effect**
    https://react.dev/learn/you-might-not-need-an-effect
3.  **Overreacted - A Complete Guide to useEffect**
    https://overreacted.io/a-complete-guide-to-useeffect/
4.  **Kent C. Dodds - When to useMemo and useCallback**
    https://kentcdodds.com/blog/usememo-and-usecallback
