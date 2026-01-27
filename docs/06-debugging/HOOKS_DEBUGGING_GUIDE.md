# DEBUGGING DE HOOKS - GUÍA COMPLETA

## Índice
1. [useState Debugging](#1-usestate-debugging)
2. [useEffect Debugging](#2-useeffect-debugging)
3. [useRef Debugging](#3-useref-debugging)
4. [useCallback y useMemo](#4-usecallback-y-usememo)
5. [useContext Debugging](#5-usecontext-debugging)
6. [useReducer Debugging](#6-usereducer-debugging)
7. [Custom Hooks](#7-custom-hooks)

---

## 1. useState Debugging

### 1.1 State Updates No Reflejados - Explicación de Batching

**Problema**: Las actualizaciones de estado no se reflejan inmediatamente.

React **agrupa (batch)** múltiples llamadas a `setState` en un solo re-render por razones de performance. Esto significa que el estado no se actualiza inmediatamente después de llamar a `setState`.

#### Ejemplo del Problema:

```javascript
function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 1); // number es 0, establece a 1
        setNumber(number + 1); // number es TODAVÍA 0, establece a 1
        setNumber(number + 1); // number es TODAVÍA 0, establece a 1
      }}>+3</button>
    </>
  );
}
// Resultado: El contador solo incrementa en 1, no en 3
```

**Explicación**: Cada `setNumber(number + 1)` usa el valor de `number` capturado cuando se creó la función (closure). Todas las llamadas usan `0`, por lo que todas establecen el estado a `1`.

---

### 1.2 Functional Updates - Cuándo Usar

**Solución**: Usa **funciones actualizadoras** cuando el nuevo estado depende del estado anterior.

```javascript
function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(n => n + 1); // n es el valor más reciente
        setNumber(n => n + 1); // n es el valor más reciente
        setNumber(n => n + 1); // n es el valor más reciente
      }}>+3</button>
    </>
  );
}
// Resultado: El contador incrementa correctamente en 3
```

**Cuándo usar funciones actualizadoras**:
- ✅ Cuando necesitas múltiples actualizaciones secuenciales
- ✅ En operaciones asíncronas
- ✅ Cuando el nuevo estado depende del anterior
- ✅ En callbacks que podrían ejecutarse después de renders

#### Ejemplo: Operaciones Asíncronas

```javascript
// ❌ INCORRECTO - Usa valor "stale"
async function handleClick() {
  setPending(pending + 1); // pending es 0
  await delay(3000);
  setPending(pending - 1); // pending sigue siendo 0 en esta closure
  setCompleted(completed + 1); // Puede resultar en -1 con clicks rápidos
}

// ✅ CORRECTO - Usa función actualizadora
async function handleClick() {
  setPending(p => p + 1); // Usa el valor más reciente
  await delay(3000);
  setPending(p => p - 1); // Usa el valor más reciente
  setCompleted(c => c + 1); // Siempre correcto
}
```

---

### 1.3 Closures con State Viejo

**Problema**: Las funciones capturan el estado en el momento de su creación.

```javascript
function Timer() {
  const [count, setCount] = useState(0);
  const [increment, setIncrement] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      // ❌ BUG: increment siempre es 1 (valor inicial)
      setCount(c => c + increment); 
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vacío = closure sobre increment inicial

  return (
    <>
      <h1>Counter: {count}</h1>
      <button onClick={() => setIncrement(i => i + 1)}>
        Increment by: {increment}
      </button>
    </>
  );
}
```

**Soluciones**:

1. **Agregar la dependencia** (recomendado):
```javascript
useEffect(() => {
  const id = setInterval(() => {
    setCount(c => c + increment);
  }, 1000);
  return () => clearInterval(id);
}, [increment]); // ✅ Se re-crea cuando increment cambia
```

2. **Usar useRef para el valor más reciente**:
```javascript
const incrementRef = useRef(increment);

useEffect(() => {
  incrementRef.current = increment;
}, [increment]);

useEffect(() => {
  const id = setInterval(() => {
    setCount(c => c + incrementRef.current);
  }, 1000);
  return () => clearInterval(id);
}, []); // ✅ Funciona, pero menos elegante
```

---

### 1.4 Inicialización de Estado

**Problema de Performance**: Función ejecutándose en cada render

```javascript
// ❌ INEFICIENTE - createInitialTodos() se ejecuta en CADA render
const [todos, setTodos] = useState(createInitialTodos());
```

**Solución**: Usa inicialización lazy (función sin ejecutar)

```javascript
// ✅ EFICIENTE - Solo se ejecuta una vez
const [todos, setTodos] = useState(createInitialTodos);
// O
const [todos, setTodos] = useState(() => createInitialTodos());
```

---

### 1.5 Mixing Updates - Direct vs Functional

```javascript
function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <button onClick={() => {
      setNumber(number + 5);  // Reemplaza con 5
      setNumber(n => n + 1);   // Toma el 5, retorna 6
      setNumber(42);           // Reemplaza con 42
    }}>
      Increase
    </button>
  );
}
// Resultado final: 42
```

**Proceso de Cola de React**:
1. `setNumber(number + 5)` → Cola: "reemplazar con 5"
2. `setNumber(n => n + 1)` → Cola: "función: tomar estado actual + 1"
3. `setNumber(42)` → Cola: "reemplazar con 42"

React procesa en orden:
- Empieza con 0
- Reemplaza con 5
- Función: 5 + 1 = 6
- Reemplaza con 42
- **Resultado final: 42**

---

## 2. useEffect Debugging

### 2.1 ESLint exhaustive-deps Rule

**Propósito**: Prevenir closures obsoletos (stale closures).

```javascript
// ❌ ESLint advertirá
useEffect(() => {
  const connection = createConnection(roomId);
  connection.connect();
  return () => connection.disconnect();
}, []); // Falta 'roomId' en dependencias
```

**Reglas**:
- ✅ Incluye TODAS las variables reactivas usadas en el effect
- ✅ Props, state, y cualquier valor derivado de ellos
- ❌ No incluyas: refs, setters de useState, funciones estables

```javascript
// ✅ CORRECTO
useEffect(() => {
  const connection = createConnection(roomId);
  connection.connect();
  return () => connection.disconnect();
}, [roomId]); // ✅ Todas las dependencias declaradas
```

---

### 2.2 Object/Array Dependencies - Por Qué Causan Problemas

**Problema**: JavaScript compara objetos por **referencia**, no por valor.

```javascript
function ChatRoom({ roomId }) {
  const [message, setMessage] = useState('');

  // ❌ PROBLEMA: Nuevo objeto en cada render
  const options = {
    serverUrl: 'https://localhost:1234',
    roomId: roomId
  };

  useEffect(() => {
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, [options]); // ❌ 'options' es SIEMPRE diferente
  
  // Se reconecta incluso al escribir en el input de message
}
```

**Soluciones**:

#### Opción 1: Mover el objeto DENTRO del effect

```javascript
useEffect(() => {
  const options = {
    serverUrl: 'https://localhost:1234',
    roomId: roomId
  };
  const connection = createConnection(options);
  connection.connect();
  return () => connection.disconnect();
}, [roomId]); // ✅ Solo depende de primitivos
```

#### Opción 2: Usar useMemo

```javascript
const options = useMemo(() => ({
  serverUrl: 'https://localhost:1234',
  roomId: roomId
}), [roomId]); // ✅ Solo cambia cuando roomId cambia

useEffect(() => {
  const connection = createConnection(options);
  connection.connect();
  return () => connection.disconnect();
}, [options]); // ✅ options es estable
```

#### Opción 3: Leer valores primitivos del objeto

```javascript
function ChatRoom({ options }) {
  // ✅ Extraer valores primitivos
  const { serverUrl, roomId } = options;

  useEffect(() => {
    const connection = createConnection({ serverUrl, roomId });
    connection.connect();
    return () => connection.disconnect();
  }, [serverUrl, roomId]); // ✅ Comparación por valor
}
```

---

### 2.3 Effect Execution Timing

**Cuándo se ejecutan los Effects**:
1. Después del render inicial
2. Después de cada re-render (si las dependencias cambiaron)
3. La cleanup function se ejecuta:
   - Antes de ejecutar el effect nuevamente
   - Cuando el componente se desmonta

```javascript
useEffect(() => {
  console.log('1. Effect se ejecuta');
  
  return () => {
    console.log('2. Cleanup se ejecuta');
  };
}, [dependency]);

// Flujo en actualizaciones:
// Render 1 → "1. Effect se ejecuta"
// Render 2 → "2. Cleanup se ejecuta" → "1. Effect se ejecuta"
// Unmount → "2. Cleanup se ejecuta"
```

---

### 2.4 Strict Mode Double-Invocation

**En desarrollo**, React ejecuta effects **dos veces** para encontrar bugs.

```javascript
// Sin Strict Mode (producción):
// → Mount → Effect
// → Unmount → Cleanup

// Con Strict Mode (desarrollo):
// → Mount → Effect → Cleanup → Effect
// → Unmount → Cleanup
```

#### Ejemplo de Bug Detectado:

```javascript
// ❌ BUG: No limpia el interval
useEffect(() => {
  const id = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  // Falta cleanup!
}, []);
// En Strict Mode: El contador incrementa 2x por segundo
```

**Solución**:

```javascript
// ✅ CORRECTO: Limpia el interval
useEffect(() => {
  const id = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  return () => clearInterval(id); // ✅ Cleanup
}, []);
```

#### Evitar Double-Effect con useRef (ANTI-PATTERN):

```javascript
// 🚩 ANTI-PATTERN: No resuelve el problema real
const connectionRef = useRef(null);
useEffect(() => {
  if (!connectionRef.current) {
    connectionRef.current = createConnection();
    connectionRef.current.connect();
  }
  // ❌ Falta cleanup! La conexión nunca se cierra
}, []);
```

---

### 2.5 Race Conditions en Effects

**Problema**: Requests asíncronos pueden completarse fuera de orden.

```javascript
// ❌ BUG: Race condition
function Page() {
  const [person, setPerson] = useState('Alice');
  const [bio, setBio] = useState(null);

  useEffect(() => {
    setBio(null);
    fetchBio(person).then(result => {
      setBio(result); // ❌ Puede mostrar bio incorrecta
    });
  }, [person]);
  
  // Si cambias de Alice → Bob → Alice rápidamente,
  // podrías ver la bio de Bob
}
```

**Solución**: Usar flag de cleanup (ignore pattern)

```javascript
// ✅ CORRECTO: Ignora resultados obsoletos
useEffect(() => {
  let ignore = false;
  setBio(null);
  
  fetchBio(person).then(result => {
    if (!ignore) { // ✅ Solo actualiza si no fue cancelado
      setBio(result);
    }
  });
  
  return () => {
    ignore = true; // ✅ Cancela en cleanup
  };
}, [person]);
```

**Con async/await**:

```javascript
useEffect(() => {
  let ignore = false;

  async function startFetching() {
    const json = await fetchTodos(userId);
    if (!ignore) {
      setTodos(json);
    }
  }

  startFetching();

  return () => {
    ignore = true;
  };
}, [userId]);
```

---

### 2.6 Infinite Loops - Causas y Soluciones

#### Causa 1: Sin Array de Dependencias

```javascript
// ❌ INFINITE LOOP
useEffect(() => {
  setCount(count + 1);
}); // Sin array = se ejecuta después de CADA render
```

**Solución**: Agregar array de dependencias

```javascript
// ✅ CORRECTO
useEffect(() => {
  setCount(count + 1);
}, []); // Solo una vez
```

#### Causa 2: Dependencia que Siempre Cambia

```javascript
// ❌ INFINITE LOOP
useEffect(() => {
  const options = { serverUrl, roomId };
  connect(options);
}, [options]); // options es SIEMPRE nuevo
```

**Solución**: Ver sección 2.2 (Object Dependencies)

#### Causa 3: Función que se Re-crea

```javascript
// ❌ INFINITE LOOP
function ChatRoom({ roomId }) {
  function createOptions() { // Nueva función en cada render
    return { serverUrl, roomId };
  }

  useEffect(() => {
    const options = createOptions();
    connect(options);
  }, [createOptions]); // ❌ createOptions siempre nuevo
}
```

**Solución 1**: Mover función dentro del effect

```javascript
useEffect(() => {
  function createOptions() {
    return { serverUrl, roomId };
  }
  const options = createOptions();
  connect(options);
}, [roomId]); // ✅ Solo depende de roomId
```

**Solución 2**: Usar useCallback

```javascript
const createOptions = useCallback(() => {
  return { serverUrl, roomId };
}, [serverUrl, roomId]);

useEffect(() => {
  const options = createOptions();
  connect(options);
}, [createOptions]); // ✅ createOptions es estable
```

---

### 2.7 Missing Dependency Array

```javascript
// ❌ Se ejecuta después de CADA render
useEffect(() => {
  // ...
}); // Sin array de dependencias
```

**Siempre incluye el array**:
- `[]` → Solo mount/unmount
- `[dep1, dep2]` → Cuando dep1 o dep2 cambien
- Sin array → Después de cada render (raro, generalmente un bug)

---

### 2.8 Debugging Effects - Checklist

1. **¿El effect tiene cleanup?**
   - Si suscribes → desuscribe
   - Si conectas → desconecta
   - Si creas timers → límpialos
   - Si agregas event listeners → remuévelos

2. **¿Las dependencias son correctas?**
   - Usa ESLint plugin
   - No omitas dependencias
   - No uses refs para "esconder" dependencias

3. **¿El effect es idempotente?**
   - Debe ser seguro ejecutarlo 2 veces en desarrollo
   - Si no, probablemente necesitas cleanup

4. **¿Hay race conditions?**
   - Usa el patrón `ignore` para async
   - O considera libraries como React Query

---

## 3. useRef Debugging

### 3.1 useRef vs useState - Cuándo Usar Cada Uno

| Característica | useState | useRef |
|----------------|----------|--------|
| **Causa re-render** | ✅ Sí | ❌ No |
| **Mutable** | ❌ No (inmutable) | ✅ Sí (`.current` mutable) |
| **Timing de actualización** | Asíncrono (batch) | Síncrono (inmediato) |
| **Cuándo leer** | En render | En event handlers/effects |
| **Uso principal** | Datos UI | Datos no-UI, DOM refs |

#### Implementación Interna Conceptual

```javascript
// Así funciona useRef internamente (simplificado)
function useRef(initialValue) {
  const [ref, unused] = useState({ current: initialValue });
  return ref;
}
// El objeto { current } nunca cambia,
// pero .current es mutable
```

#### Cuándo Usar useState:

```javascript
// ✅ Datos que afectan el UI
function Counter() {
  const [count, setCount] = useState(0);
  
  return <h1>{count}</h1>; // UI se actualiza
}
```

#### Cuándo Usar useRef:

```javascript
// ✅ Datos que NO afectan el UI
function Counter() {
  const countRef = useRef(0);
  
  function handleClick() {
    countRef.current++;
    alert(`Clicks: ${countRef.current}`);
    // NO causa re-render
  }
  
  return <button onClick={handleClick}>Click me</button>;
}
```

**Casos de uso para useRef**:
1. **Referencias a DOM**: `inputRef.current.focus()`
2. **Valores previos**: Almacenar valor anterior de una prop
3. **Timers/Intervals**: Guardar IDs para cleanup
4. **Evitar closures obsoletos**: Acceder a valor más reciente
5. **Optimizaciones**: Evitar re-renders innecesarios

---

### 3.2 Problema: Ref con Estado para Async

```javascript
// ❌ PROBLEMA: alert muestra valor viejo
function Chat() {
  const [text, setText] = useState('');

  function handleSend() {
    setTimeout(() => {
      alert('Sending: ' + text); // Closure captura texto original
    }, 3000);
  }
  
  // Si escribes "hello", luego "world" y haces click,
  // el alert mostrará "hello" (no "world")
}
```

**Solución**: Combinar useState + useRef

```javascript
// ✅ CORRECTO: Ref siempre tiene el valor más reciente
function Chat() {
  const [text, setText] = useState('');
  const textRef = useRef(text);

  function handleChange(e) {
    setText(e.target.value);
    textRef.current = e.target.value; // Sincronizar
  }

  function handleSend() {
    setTimeout(() => {
      alert('Sending: ' + textRef.current); // ✅ Valor actual
    }, 3000);
  }

  return (
    <>
      <input value={text} onChange={handleChange} />
      <button onClick={handleSend}>Send</button>
    </>
  );
}
```

---

### 3.3 Refs y Pureza de Render

**Regla**: No leas ni escribas refs durante el render.

```javascript
function MyComponent() {
  const myRef = useRef(0);

  // ❌ NO HAGAS ESTO
  myRef.current = 123; // Mutación durante render
  console.log(myRef.current); // Lectura durante render

  // ✅ CORRECTO: En effect
  useEffect(() => {
    myRef.current = 123;
  });

  // ✅ CORRECTO: En event handler
  function handleClick() {
    myRef.current = 456;
    console.log(myRef.current);
  }
}
```

---

### 3.4 Callback Refs

**Uso avanzado**: Ejecutar código cuando un elemento se monta/desmonta.

```javascript
function CatFriends() {
  const itemsRef = useRef(null);
  const [catList, setCatList] = useState(setupCatList);

  function scrollToCat(cat) {
    const map = getMap();
    const node = map.get(cat);
    node.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }

  function getMap() {
    if (!itemsRef.current) {
      itemsRef.current = new Map();
    }
    return itemsRef.current;
  }

  return (
    <>
      <nav>
        <button onClick={() => scrollToCat(catList[0])}>First</button>
      </nav>
      <ul>
        {catList.map((cat) => (
          <li
            key={cat.id}
            ref={(node) => {
              const map = getMap();
              if (node) {
                // Elemento montado
                map.set(cat, node);
              } else {
                // Elemento desmontado
                map.delete(cat);
              }
            }}
          >
            <img src={cat.imageUrl} />
          </li>
        ))}
      </ul>
    </>
  );
}
```

**Con cleanup function**:

```javascript
ref={(node) => {
  const map = getMap();
  map.set(cat, node);

  return () => {
    map.delete(cat); // Cleanup cuando se desmonta
  };
}}
```

---

### 3.5 ForwardRef - Explicación

**Problema**: Los componentes no pueden recibir refs directamente.

```javascript
// ❌ NO FUNCIONA
function MyInput(props) {
  return <input {...props} />;
}

// En el padre:
const ref = useRef(null);
<MyInput ref={ref} /> // ❌ Error: ref is not a prop
```

**Solución**: `forwardRef`

```javascript
// ✅ CORRECTO
import { forwardRef } from 'react';

const MyInput = forwardRef(function MyInput(props, ref) {
  return <input {...props} ref={ref} />;
});

// En el padre:
function Form() {
  const ref = useRef(null);

  function handleClick() {
    ref.current.focus(); // ✅ Funciona
  }

  return (
    <form>
      <MyInput label="Name:" ref={ref} />
      <button type="button" onClick={handleClick}>
        Edit
      </button>
    </form>
  );
}
```

**Con lógica interna**:

```javascript
const MyInput = forwardRef(function MyInput(props, ref) {
  const { label, ...otherProps } = props;
  
  return (
    <label>
      {label}
      <input {...otherProps} ref={ref} />
    </label>
  );
});
```

---

## 4. useCallback y useMemo

### 4.1 Reference Equality en React

**Concepto clave**: React compara valores con `Object.is()`.

```javascript
// Primitivos: Comparación por valor
Object.is(5, 5);           // true
Object.is('hello', 'hello'); // true

// Objetos/Arrays/Funciones: Comparación por referencia
Object.is({}, {});           // false (diferentes referencias)
Object.is([], []);           // false
Object.is(() => {}, () => {}); // false

// Misma referencia
const obj = {};
Object.is(obj, obj);         // true
```

**Implicaciones para React**:

```javascript
function Component() {
  // ❌ Nueva función en cada render
  const handleClick = () => console.log('clicked');
  
  // ❌ Nuevo objeto en cada render
  const options = { theme: 'dark' };
  
  // ❌ Nuevo array en cada render
  const items = [1, 2, 3];
}
```

Esto causa problemas en:
- Dependency arrays de useEffect
- Props de componentes memoizados
- Contextos

---

### 4.2 useCallback - Memoización de Funciones

**Propósito**: Mantener la misma referencia de función entre renders.

```javascript
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b], // Dependencias
);
```

#### Ejemplo: Prevenir Re-renders Innecesarios

```javascript
// Sin useCallback
function Parent() {
  const [count, setCount] = useState(0);
  
  // ❌ Nueva función en cada render
  const handleClick = () => {
    console.log('clicked');
  };
  
  return <ExpensiveChild onClick={handleClick} />;
  // ExpensiveChild se re-renderiza aunque sea memo()
}

// Con useCallback
function Parent() {
  const [count, setCount] = useState(0);
  
  // ✅ Misma función entre renders
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []); // Sin dependencias
  
  return <ExpensiveChild onClick={handleClick} />;
  // ExpensiveChild NO se re-renderiza si es memo()
}

const ExpensiveChild = memo(({ onClick }) => {
  console.log('ExpensiveChild rendered');
  return <button onClick={onClick}>Click</button>;
});
```

#### Ejemplo: useEffect Dependencies

```javascript
// ❌ PROBLEMA: Effect se ejecuta en cada render
function ChatRoom({ roomId }) {
  const handleMessage = (msg) => {
    console.log(msg);
  };

  useEffect(() => {
    const connection = createConnection(roomId);
    connection.on('message', handleMessage);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId, handleMessage]); // handleMessage siempre cambia
}

// ✅ SOLUCIÓN: Memoizar con useCallback
function ChatRoom({ roomId }) {
  const handleMessage = useCallback((msg) => {
    console.log(msg);
  }, []); // Función estable

  useEffect(() => {
    const connection = createConnection(roomId);
    connection.on('message', handleMessage);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId, handleMessage]); // ✅ Solo re-ejecuta si roomId cambia
}
```

---

### 4.3 useMemo - Memoización de Valores

**Propósito**: Cachear cálculos costosos.

```javascript
const memoizedValue = useMemo(
  () => computeExpensiveValue(a, b),
  [a, b]
);
```

#### Ejemplo: Optimizar Cálculos Costosos

```javascript
function TodoList({ todos, filter }) {
  // ❌ Se filtra en CADA render (incluso si filter no cambió)
  const visibleTodos = filterTodos(todos, filter);

  // ✅ Solo se filtra cuando todos o filter cambian
  const visibleTodos = useMemo(() => {
    return filterTodos(todos, filter);
  }, [todos, filter]);

  return <ul>{visibleTodos.map(todo => ...)}</ul>;
}
```

#### Ejemplo: Estabilizar Dependencias de useEffect

```javascript
// ❌ PROBLEMA: options es nuevo en cada render
function ChatRoom({ roomId }) {
  const [message, setMessage] = useState('');

  const options = {
    serverUrl: 'https://localhost:1234',
    roomId: roomId
  };

  useEffect(() => {
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, [options]); // ❌ Se reconecta en cada render
}

// ✅ SOLUCIÓN 1: useMemo
function ChatRoom({ roomId }) {
  const [message, setMessage] = useState('');

  const options = useMemo(() => ({
    serverUrl: 'https://localhost:1234',
    roomId: roomId
  }), [roomId]); // ✅ Solo cambia cuando roomId cambia

  useEffect(() => {
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, [options]); // ✅ Estable
}

// ✅ SOLUCIÓN 2: Mover dentro del effect (mejor)
function ChatRoom({ roomId }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const options = {
      serverUrl: 'https://localhost:1234',
      roomId: roomId
    };
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // ✅ Sin necesidad de useMemo
}
```

---

### 4.4 Cuándo NO Usar Memoization

**❌ No uses useCallback/useMemo prematuramente**

```javascript
// ❌ INNECESARIO: No hay beneficio
function Component() {
  const [count, setCount] = useState(0);
  
  // Overhead sin beneficio
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  return <button onClick={handleClick}>Count: {count}</button>;
  // El botón NO es memoizado, no hay beneficio
}

// ✅ SIMPLE: Sin memoización
function Component() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(c => c + 1);
  };
  
  return <button onClick={handleClick}>Count: {count}</button>;
}
```

**Cuándo SÍ usar**:
- ✅ El componente hijo está memoizado con `memo()`
- ✅ La función/valor se usa en dependency array
- ✅ El cálculo es genuinamente costoso (medido con profiler)
- ✅ Custom hooks que retornan funciones

**Cuándo NO usar**:
- ❌ Optimización prematura
- ❌ Cálculos simples
- ❌ Componentes que se re-renderizan de todas formas
- ❌ "Por las dudas"

---

### 4.5 Dependency Arrays Correctas

#### Debugging useCallback Dependencies

```javascript
const handleSubmit = useCallback((orderDetails) => {
  post('/orders', orderDetails);
}, [productId, referrer]);

// Debug: ¿Por qué se recrea?
console.log([productId, referrer]);

// En la consola:
// Guarda el primer array como temp1
// Guarda el segundo array como temp2
// Luego compara:
Object.is(temp1[0], temp2[0]); // ¿productId es igual?
Object.is(temp1[1], temp2[1]); // ¿referrer es igual?
```

#### Debugging useMemo Dependencies

```javascript
const visibleTodos = useMemo(() => {
  return filterTodos(todos, tab);
}, [todos, tab]);

// Si se recalcula en cada render:
console.log([todos, tab]);

// Verifica:
// 1. ¿todos es un nuevo array cada vez?
// 2. ¿tab cambia inesperadamente?
```

**Herramienta**: React DevTools Profiler
- Marca "Record why each component rendered"
- Identifica qué props cambiaron

---

### 4.6 Custom Hooks y useCallback

**Buena práctica**: Envolver funciones retornadas en useCallback.

```javascript
// ✅ CORRECTO: Funciones estables
function useRouter() {
  const { dispatch } = useContext(RouterStateContext);

  const navigate = useCallback((url) => {
    dispatch({ type: 'navigate', url });
  }, [dispatch]);

  const goBack = useCallback(() => {
    dispatch({ type: 'back' });
  }, [dispatch]);

  return {
    navigate,
    goBack,
  };
}

// Consumidor puede optimizar
function Component() {
  const { navigate } = useRouter();
  
  useEffect(() => {
    // navigate es estable, no re-ejecuta innecesariamente
  }, [navigate]);
}
```

---

## 5. useContext Debugging

### 5.1 Performance con Context

**Problema**: Todos los consumidores se re-renderizan cuando el context cambia.

```javascript
const ThemeContext = createContext(null);

function MyApp() {
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);

  // ❌ PROBLEMA: Cualquier cambio (theme o user) re-renderiza
  // TODOS los consumidores
  return (
    <ThemeContext.Provider value={{ theme, user }}>
      <Header /> {/* Se re-renderiza incluso si solo user cambió */}
      <Main />
    </ThemeContext.Provider>
  );
}
```

**Soluciones**:

#### Solución 1: Split Context

```javascript
// ✅ Contextos separados
const ThemeContext = createContext(null);
const UserContext = createContext(null);

function MyApp() {
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);

  return (
    <ThemeContext.Provider value={theme}>
      <UserContext.Provider value={user}>
        <Header /> {/* Solo re-renderiza si su contexto cambia */}
        <Main />
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

// Componente solo se re-renderiza si theme cambia
function Header() {
  const theme = useContext(ThemeContext);
  // NO se re-renderiza cuando user cambia
}
```

#### Solución 2: Memoizar Componentes

```javascript
const Header = memo(function Header() {
  const theme = useContext(ThemeContext);
  return <header className={theme}>...</header>;
});
// memo() previene re-renders si props no cambiaron
// Pero Context BYPASSES memo() - se re-renderiza igual
```

**Nota**: `memo()` NO previene re-renders por cambios de context.

---

### 5.2 Context Value Optimization

**Problema**: Nuevo objeto en cada render.

```javascript
function MyApp() {
  const [currentUser, setCurrentUser] = useState(null);

  // ❌ Nuevo objeto en cada render
  const login = (response) => {
    storeCredentials(response.credentials);
    setCurrentUser(response.user);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login }}>
      <Page /> {/* Se re-renderiza en CADA render del padre */}
    </AuthContext.Provider>
  );
}
```

**Solución**: Memoizar el valor del context.

```javascript
// ✅ CORRECTO
function MyApp() {
  const [currentUser, setCurrentUser] = useState(null);

  const login = useCallback((response) => {
    storeCredentials(response.credentials);
    setCurrentUser(response.user);
  }, []); // Función estable

  const contextValue = useMemo(() => ({
    currentUser,
    login
  }), [currentUser, login]); // Solo cambia cuando necesario

  return (
    <AuthContext.Provider value={contextValue}>
      <Page /> {/* Solo re-renderiza si currentUser/login cambian */}
    </AuthContext.Provider>
  );
}
```

---

### 5.3 Debugging Context Re-renders

**Herramienta**: React DevTools Profiler

1. Abre Profiler
2. Activa "Record why each component rendered"
3. Haz una acción
4. Verifica qué componentes se re-renderizaron
5. Busca "Context changed"

**Debugging manual**:

```javascript
function MyComponent() {
  const value = useContext(MyContext);
  
  useEffect(() => {
    console.log('MyContext changed:', value);
  }, [value]);
}
```

---

### 5.4 Custom Hooks para Context

**Patrón recomendado**: Encapsular `useContext` en custom hooks.

```javascript
// ✅ BUENA PRÁCTICA
const TasksContext = createContext(null);
const TasksDispatchContext = createContext(null);

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === null) {
    throw new Error('useTasks must be used within TasksProvider');
  }
  return context;
}

export function useTasksDispatch() {
  const context = useContext(TasksDispatchContext);
  if (context === null) {
    throw new Error('useTasksDispatch must be used within TasksProvider');
  }
  return context;
}

// Consumo más limpio
function TaskList() {
  const tasks = useTasks();
  const dispatch = useTasksDispatch();
  
  // ...
}
```

**Beneficios**:
- ✅ Validación de errores centralizada
- ✅ Código más limpio en componentes
- ✅ Refactoring más fácil
- ✅ Type safety mejorado

---

### 5.5 Context con Reducer

**Patrón avanzado**: Combinar useReducer + Context.

```javascript
const TasksContext = createContext(null);
const TasksDispatchContext = createContext(null);

export function TasksProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);

  return (
    <TasksContext.Provider value={tasks}>
      <TasksDispatchContext.Provider value={dispatch}>
        {children}
      </TasksDispatchContext.Provider>
    </TasksContext.Provider>
  );
}

// Separar state de dispatch mejora performance
function TaskList() {
  const tasks = useTasks(); // Solo re-renderiza si tasks cambian
  return tasks.map(task => <Task key={task.id} task={task} />);
}

function AddTaskButton() {
  const dispatch = useTasksDispatch(); // No re-renderiza si tasks cambian
  return <button onClick={() => dispatch({ type: 'added', ... })}>Add</button>;
}
```

---

## 6. useReducer Debugging

### 6.1 Cómo Debuggear Reducers

#### Estructura Básica

```javascript
function tasksReducer(state, action) {
  switch (action.type) {
    case 'added': {
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          done: false,
        },
      ];
    }
    case 'changed': {
      return state.map((t) => {
        if (t.id === action.task.id) {
          return action.task;
        } else {
          return t;
        }
      });
    }
    case 'deleted': {
      return state.filter((t) => t.id !== action.id);
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}
```

#### Debugging Technique 1: Logging

```javascript
function tasksReducer(state, action) {
  console.group(`Reducer Action: ${action.type}`);
  console.log('Previous State:', state);
  console.log('Action:', action);
  
  let nextState;
  switch (action.type) {
    case 'added': {
      nextState = [...state, { id: action.id, text: action.text, done: false }];
      break;
    }
    // ... otros casos
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
  
  console.log('Next State:', nextState);
  console.groupEnd();
  return nextState;
}
```

#### Debugging Technique 2: State Validation

```javascript
function tasksReducer(state, action) {
  switch (action.type) {
    case 'added': {
      if (!action.text) {
        console.error('Action "added" requires text');
        return state; // No cambiar state si hay error
      }
      return [...state, { id: action.id, text: action.text, done: false }];
    }
    // ...
  }
  
  // ✅ CRÍTICO: Lanzar error para acciones desconocidas
  throw Error('Unknown action: ' + action.type);
}
```

**Por qué lanzar error**:

```javascript
// ❌ PROBLEMA: State se vuelve undefined
function badReducer(state, action) {
  switch (action.type) {
    case 'incremented_age': {
      return { ...state, age: state.age + 1 };
    }
    case 'changed_name': {
      return { ...state, name: action.nextName };
    }
  }
  // Olvidas return! State se vuelve undefined
}

// ✅ SOLUCIÓN: Lanzar error
function goodReducer(state, action) {
  switch (action.type) {
    case 'incremented_age': {
      return { ...state, age: state.age + 1 };
    }
    case 'changed_name': {
      return { ...state, name: action.nextName };
    }
  }
  throw Error('Unknown action: ' + action.type);
  // Si olvidas un return, el error te lo dice
}
```

---

### 6.2 Redux DevTools con useReducer

**Instalación**:

```bash
npm install @redux-devtools/extension
```

**Setup**:

```javascript
import { useReducer, useEffect } from 'react';

// Wrapper para integrar Redux DevTools
function useReducerWithDevtools(reducer, initialState, name = 'Reducer') {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
      const devtools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({ name });

      devtools.init(initialState);

      const enhancedDispatch = (action) => {
        dispatch(action);
        devtools.send(action, reducer(state, action));
      };

      return () => devtools.disconnect();
    }
  }, [state, reducer, initialState, name]);

  return [state, dispatch];
}

// Uso
function TaskApp() {
  const [tasks, dispatch] = useReducerWithDevtools(
    tasksReducer,
    initialTasks,
    'Tasks'
  );
  
  // ...
}
```

**Alternativa Simple**: Custom Hook para Logging

```javascript
function useReducerWithLogger(reducer, initialState) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const dispatchWithLog = useCallback((action) => {
    console.log('%c Action Dispatched', 'color: blue; font-weight: bold');
    console.log('Action:', action);
    console.log('Previous State:', state);
    
    dispatch(action);
    
    // useEffect mostrará el nuevo state
  }, [state]);

  useEffect(() => {
    console.log('%c New State', 'color: green; font-weight: bold');
    console.log(state);
  }, [state]);

  return [state, dispatchWithLog];
}
```

---

### 6.3 Testing Reducers

Los reducers son funciones puras → fáciles de testear.

```javascript
// tasksReducer.test.js
import { tasksReducer } from './tasksReducer';

describe('tasksReducer', () => {
  const initialState = [
    { id: 0, text: 'Task 1', done: false },
    { id: 1, text: 'Task 2', done: true },
  ];

  test('adds a new task', () => {
    const action = {
      type: 'added',
      id: 2,
      text: 'Task 3',
    };

    const newState = tasksReducer(initialState, action);

    expect(newState).toHaveLength(3);
    expect(newState[2]).toEqual({
      id: 2,
      text: 'Task 3',
      done: false,
    });
  });

  test('changes a task', () => {
    const action = {
      type: 'changed',
      task: { id: 0, text: 'Updated Task 1', done: true },
    };

    const newState = tasksReducer(initialState, action);

    expect(newState[0].text).toBe('Updated Task 1');
    expect(newState[0].done).toBe(true);
  });

  test('deletes a task', () => {
    const action = {
      type: 'deleted',
      id: 1,
    };

    const newState = tasksReducer(initialState, action);

    expect(newState).toHaveLength(1);
    expect(newState.find(t => t.id === 1)).toBeUndefined();
  });

  test('throws error for unknown action', () => {
    const action = {
      type: 'unknown',
    };

    expect(() => {
      tasksReducer(initialState, action);
    }).toThrow('Unknown action: unknown');
  });

  test('does not mutate original state', () => {
    const action = {
      type: 'added',
      id: 2,
      text: 'Task 3',
    };

    const originalState = [...initialState];
    tasksReducer(initialState, action);

    expect(initialState).toEqual(originalState);
  });
});
```

---

### 6.4 Implementación Interna de useReducer

**Concepto**: useReducer puede implementarse con useState.

```javascript
// Implementación simplificada
import { useState } from 'react';

export function useReducer(reducer, initialState) {
  const [state, setState] = useState(initialState);

  function dispatch(action) {
    const nextState = reducer(state, action);
    setState(nextState);
  }

  return [state, dispatch];
}
```

**Implicaciones**:
- useReducer NO es mágico
- Es una abstracción sobre useState
- Útil para lógica de estado compleja
- Hace el código más predecible

---

## 7. Custom Hooks

### 7.1 Reglas de Hooks

**Las mismas reglas que los hooks built-in**:

1. **Solo llamar en el top level**
   ```javascript
   // ❌ INCORRECTO
   function Component({ condition }) {
     if (condition) {
       const value = useCustomHook(); // Error!
     }
   }

   // ✅ CORRECTO
   function Component({ condition }) {
     const value = useCustomHook();
     if (condition) {
       // Usa value aquí
     }
   }
   ```

2. **Solo llamar desde componentes/hooks React**
   ```javascript
   // ❌ INCORRECTO
   function regularFunction() {
     const value = useCustomHook(); // Error!
   }

   // ✅ CORRECTO
   function useAnotherHook() {
     const value = useCustomHook(); // OK
   }

   function Component() {
     const value = useCustomHook(); // OK
   }
   ```

3. **Los nombres deben empezar con "use"**
   ```javascript
   // ❌ INCORRECTO
   function customHook() {
     return useState(0); // ESLint no verifica reglas
   }

   // ✅ CORRECTO
   function useCustomHook() {
     return useState(0); // ESLint verifica reglas
   }
   ```

---

### 7.2 Debugging de Custom Hooks

#### Technique 1: Logging

```javascript
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    console.log('useOnlineStatus: Setting up listeners');

    function handleOnline() {
      console.log('useOnlineStatus: User is online');
      setIsOnline(true);
    }

    function handleOffline() {
      console.log('useOnlineStatus: User is offline');
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      console.log('useOnlineStatus: Cleaning up listeners');
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  console.log('useOnlineStatus: Returning', isOnline);
  return isOnline;
}
```

#### Technique 2: React DevTools

Custom hooks aparecen en DevTools:

```
Component
  ├─ useState (from useCustomHook)
  ├─ useEffect (from useCustomHook)
  └─ useState (local)
```

#### Technique 3: Debugging Hook Display Name

```javascript
// En desarrollo, puedes añadir displayName
function useCustomHook() {
  const [state, setState] = useState(0);
  
  // Aparece en DevTools como "CustomHook"
  if (process.env.NODE_ENV !== 'production') {
    useState.displayName = 'CustomHook';
  }
  
  return [state, setState];
}
```

---

### 7.3 Dependency Propagation

**Problema**: Las dependencias se propagan desde custom hooks a consumidores.

```javascript
function useData(url) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let ignore = false;
    fetch(url)
      .then(response => response.json())
      .then(json => {
        if (!ignore) {
          setData(json);
        }
      });
    return () => {
      ignore = true;
    };
  }, [url]); // ✅ url es dependencia

  return data;
}

// Consumidor
function Component({ userId }) {
  const url = `/api/users/${userId}`;
  const userData = useData(url);
  
  // useData re-ejecuta cuando url cambia
  // url cambia cuando userId cambia
  // Por lo tanto, userData se refetch cuando userId cambia
}
```

**Problema con objetos**:

```javascript
// ❌ PROBLEMA
function Component({ config }) {
  const url = `/api/data?${new URLSearchParams(config)}`;
  const data = useData(url);
  
  // Si config es un objeto nuevo en cada render,
  // url también es nuevo, causando fetch infinito
}

// ✅ SOLUCIÓN: Estabilizar config
function Component({ config }) {
  const stableConfig = useMemo(() => config, [
    config.param1,
    config.param2,
  ]);
  
  const url = `/api/data?${new URLSearchParams(stableConfig)}`;
  const data = useData(url);
}
```

---

### 7.4 Custom Hooks Best Practices

#### 1. Retornar Funciones Memoizadas

```javascript
// ✅ CORRECTO
function useRouter() {
  const { dispatch } = useContext(RouterStateContext);

  const navigate = useCallback((url) => {
    dispatch({ type: 'navigate', url });
  }, [dispatch]);

  const goBack = useCallback(() => {
    dispatch({ type: 'back' });
  }, [dispatch]);

  return { navigate, goBack };
}
```

#### 2. Encapsular Effects

```javascript
// ✅ BUENA PRÁCTICA
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  // Actualizar ref cuando callback cambia
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Configurar interval
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// Uso simple
function Component() {
  useInterval(() => {
    console.log('Tick');
  }, 1000);
}
```

#### 3. Naming Convention

```javascript
// ✅ Descriptivo
function useWindowSize() { ... }
function useFetch(url) { ... }
function useLocalStorage(key) { ... }

// ❌ Genérico
function useData() { ... }
function useHook() { ... }
function useHelper() { ... }
```

#### 4. Documentation

```javascript
/**
 * Hook para manejar data fetching con loading y error states
 * 
 * @param {string} url - URL para fetch
 * @param {object} options - Fetch options
 * @returns {{ data, loading, error, refetch }}
 * 
 * @example
 * const { data, loading, error } = useFetch('/api/users');
 */
function useFetch(url, options = {}) {
  // ...
}
```

---

### 7.5 Common Custom Hooks Patterns

#### Pattern 1: useToggle

```javascript
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  return [value, toggle];
}

// Uso
function Component() {
  const [isOpen, toggleOpen] = useToggle(false);
  
  return (
    <>
      <button onClick={toggleOpen}>Toggle</button>
      {isOpen && <Modal />}
    </>
  );
}
```

#### Pattern 2: usePrevious

```javascript
function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

// Uso
function Component({ count }) {
  const prevCount = usePrevious(count);
  
  useEffect(() => {
    console.log(`Changed from ${prevCount} to ${count}`);
  }, [count, prevCount]);
}
```

#### Pattern 3: useDebounce

```javascript
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Uso
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Fetch con el valor debounced
      fetchResults(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
}
```

#### Pattern 4: useEventListener

```javascript
function useEventListener(eventName, handler, element = window) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event) => savedHandler.current(event);
    
    element.addEventListener(eventName, eventListener);
    
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

// Uso
function Component() {
  useEventListener('scroll', () => {
    console.log('Scrolled!');
  });
}
```

---

## Recursos Adicionales

### Documentación Oficial
- [React Docs - Hooks](https://react.dev/reference/react)
- [React Docs - Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [React Docs - ESLint Plugin](https://react.dev/reference/eslint-plugin-react-hooks)

### Artículos Recomendados
- [A Complete Guide to useEffect - Dan Abramov](https://overreacted.io/a-complete-guide-to-useeffect/)
- [Before You memo() - Dan Abramov](https://overreacted.io/before-you-memo/)
- [Why Do React Hooks Rely on Call Order?](https://overreacted.io/why-do-hooks-rely-on-call-order/)

### Tools
- React DevTools
- ESLint plugin: eslint-plugin-react-hooks
- Redux DevTools (para useReducer)

---

## Checklist General de Debugging

### Cuando algo no funciona:

1. **Verifica las reglas de hooks**
   - [ ] ¿Están en el top level?
   - [ ] ¿Solo en componentes/hooks?
   - [ ] ¿Nombres empiezan con "use"?

2. **Revisa dependency arrays**
   - [ ] ¿ESLint está habilitado?
   - [ ] ¿Todas las dependencias están declaradas?
   - [ ] ¿Hay objetos/arrays que deberían ser memoizados?

3. **Considera reference equality**
   - [ ] ¿Estás creando objetos/funciones en cada render?
   - [ ] ¿Necesitas useCallback/useMemo?

4. **Verifica effects**
   - [ ] ¿Hay cleanup functions?
   - [ ] ¿Hay race conditions?
   - [ ] ¿Funciona con Strict Mode?

5. **Prueba con React DevTools**
   - [ ] Usa el Profiler
   - [ ] Revisa qué causó el re-render
   - [ ] Inspecciona hooks en Components tab

---

**Última actualización**: Diciembre 2024
