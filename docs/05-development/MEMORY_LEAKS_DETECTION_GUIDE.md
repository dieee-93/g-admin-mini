# Guía Completa: Memory Leaks y Detección en React

## Índice
1. [Tipos de Memory Leaks en React](#tipos-de-memory-leaks-en-react)
2. [Detección de Memory Leaks](#detección-de-memory-leaks)
3. [Prevención de Memory Leaks](#prevención-de-memory-leaks)
4. [Problemas Comunes](#problemas-comunes)
5. [Ejemplos Completos](#ejemplos-completos)

---

## 1. Tipos de Memory Leaks en React

### 1.1 Event Listeners No Removidos

**Descripción**: Los event listeners globales que no se limpian persisten en memoria incluso después de desmontar el componente.

**Ejemplo de Bug**:
```tsx
// ❌ INCORRECTO - Memory Leak
function BadComponent() {
  useEffect(() => {
    function handleScroll(e: Event) {
      console.log(window.scrollX, window.scrollY);
    }
    window.addEventListener('scroll', handleScroll);
    // ⚠️ No hay cleanup - el listener persiste
  }, []);
  
  return <div>Component</div>;
}
```

**Cómo detectarlo**:
1. Abrir Chrome DevTools → Memory tab
2. Tomar heap snapshot inicial
3. Montar/desmontar el componente varias veces
4. Tomar segundo snapshot
5. Comparar snapshots - buscar listeners que persisten

**Cómo reproducirlo**:
```tsx
// Test para reproducir el leak
function TestLeakComponent() {
  const [show, setShow] = useState(true);
  
  return (
    <>
      <button onClick={() => setShow(!show)}>
        Toggle Component (Observa la memoria)
      </button>
      {show && <BadComponent />}
    </>
  );
}
```

**Solución**:
```tsx
// ✅ CORRECTO
function GoodComponent() {
  useEffect(() => {
    function handleScroll(e: Event) {
      console.log(window.scrollX, window.scrollY);
    }
    
    window.addEventListener('scroll', handleScroll);
    
    // ✅ Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return <div>Component</div>;
}
```

### 1.2 Timers/Intervals No Limpiados

**Descripción**: `setTimeout` y `setInterval` que no se cancelan continúan ejecutándose y consumiendo memoria.

**Ejemplo de Bug**:
```tsx
// ❌ INCORRECTO - Timer Leak
function BadTimer() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    
    // ⚠️ No se limpia el interval
  }, []);
  
  return <h1>Seconds: {count}</h1>;
}
```

**Cómo detectarlo**:
- El contador sigue incrementándose incluso después de desmontar
- En DevTools → Performance, observar múltiples callbacks ejecutándose

**Solución**:
```tsx
// ✅ CORRECTO - Con cleanup
function GoodTimer() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    
    // ✅ Limpia el interval
    return () => clearInterval(intervalId);
  }, []);
  
  return <h1>Seconds: {count}</h1>;
}
```

**Ejemplo con setTimeout**:
```tsx
// ✅ Cleanup de setTimeout
function NotificationComponent({ roomId, theme }: Props) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    let timeoutId: NodeJS.Timeout | undefined;
    
    connection.on('connected', () => {
      timeoutId = setTimeout(() => {
        showNotification('Welcome to ' + roomId, theme);
      }, 2000);
    });
    
    connection.connect();
    
    return () => {
      connection.disconnect();
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId); // ✅ Limpia el timeout
      }
    };
  }, [roomId, theme]);
  
  return <h1>Welcome to {roomId}</h1>;
}
```

### 1.3 Subscriptions Activas (WebSocket, etc.)

**Descripción**: Conexiones a servicios externos que no se cierran.

**Ejemplo de Bug**:
```tsx
// ❌ INCORRECTO - Conexión no cerrada
function ChatRoom({ roomId }: Props) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    
    // ⚠️ Conexión nunca se desconecta
  }, [roomId]);
  
  return <h1>Welcome to {roomId}</h1>;
}
```

**Cómo detectarlo**:
1. DevTools → Network → WS (WebSockets)
2. Montar/desmontar componente
3. Observar conexiones que no se cierran

**Solución**:
```tsx
// ✅ CORRECTO - Desconexión en cleanup
function ChatRoom({ roomId }: Props) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');
  
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    
    // ✅ Cleanup desconecta
    return () => {
      connection.disconnect();
    };
  }, [serverUrl, roomId]);
  
  return <h1>Welcome to {roomId}</h1>;
}
```

### 1.4 DOM Refs que Persisten

**Descripción**: Referencias a elementos DOM que ya no existen.

**Ejemplo de Bug**:
```tsx
// ❌ INCORRECTO - Ref callback sin cleanup
function BadRefComponent({ items }: Props) {
  const itemsRef = useRef<Array<{ animal: string; node: HTMLLIElement }>>([]);
  
  return (
    <ul>
      {items.map((animal) => (
        <li
          key={animal}
          ref={node => {
            if (node) {
              const list = itemsRef.current;
              list.push({ animal, node });
            }
            return () => {
              // 🚩 No cleanup - items se acumulan en memoria
            };
          }}
        >
          {animal}
        </li>
      ))}
    </ul>
  );
}
```

**Solución**:
```tsx
// ✅ CORRECTO - Con cleanup del ref
function GoodRefComponent({ items }: Props) {
  const itemsRef = useRef<Map<string, HTMLLIElement>>(new Map());
  
  return (
    <ul>
      {items.map((animal) => (
        <li
          key={animal}
          ref={node => {
            if (node) {
              itemsRef.current.set(animal, node);
            } else {
              itemsRef.current.delete(animal); // ✅ Limpia refs viejos
            }
          }}
        >
          {animal}
        </li>
      ))}
    </ul>
  );
}
```

### 1.5 Closures Capturando Datos Grandes

**Descripción**: Closures en useEffect que capturan objetos grandes innecesariamente.

**Ejemplo de Bug**:
```tsx
// ❌ INCORRECTO - Closure captura objeto grande
function BadClosure({ bigData }: Props) {
  useEffect(() => {
    // ⚠️ bigData queda capturado incluso si solo necesitamos un campo
    const handleClick = () => {
      console.log(bigData.id); // Solo usa un campo
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [bigData]); // ⚠️ Recrea el listener cuando bigData cambia
  
  return <div>Component</div>;
}
```

**Solución**:
```tsx
// ✅ CORRECTO - Extrae solo lo necesario
function GoodClosure({ bigData }: Props) {
  const dataId = bigData.id; // ✅ Extrae solo el campo necesario
  
  useEffect(() => {
    const handleClick = () => {
      console.log(dataId); // Captura solo el ID
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [dataId]); // ✅ Dependencia específica
  
  return <div>Component</div>;
}
```

### 1.6 Cache Infinito

**Descripción**: Cachés que crecen indefinidamente sin límite de tamaño.

**Ejemplo de Bug**:
```tsx
// ❌ INCORRECTO - Cache sin límite
const cache = new Map<string, any>();

function BadCache() {
  useEffect(() => {
    const fetchData = async (id: string) => {
      if (!cache.has(id)) {
        const data = await api.get(id);
        cache.set(id, data); // ⚠️ Cache crece indefinidamente
      }
      return cache.get(id);
    };
    
    fetchData('some-id');
  }, []);
  
  return <div>Component</div>;
}
```

**Solución**:
```tsx
// ✅ CORRECTO - LRU Cache con tamaño máximo
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;
  
  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }
  
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Mueve al final (más reciente)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Elimina el más antiguo (primero en el Map)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

const cache = new LRUCache<string, any>(100); // ✅ Máximo 100 items
```

---

## 2. Detección de Memory Leaks

### 2.1 Tutorial Chrome Memory Profiler

#### Paso 1: Abrir DevTools Memory Panel

1. Abrir Chrome DevTools (F12)
2. Ir a la pestaña **Memory**
3. Familiarizarse con las herramientas disponibles:
   - **Heap snapshot**: Captura del estado de memoria en un momento
   - **Allocation instrumentation on timeline**: Grabación continua de allocations
   - **Allocation sampling**: Muestreo de memoria

#### Paso 2: Tomar Heap Snapshots

**Flujo de trabajo recomendado**:

```typescript
// 1. Preparar escenario de prueba
function MemoryLeakTest() {
  const [count, setCount] = useState(0);
  
  return (
    <>
      <h1>Memory Leak Test - Iteration: {count}</h1>
      <button onClick={() => setCount(c => c + 1)}>
        Mount/Unmount Component
      </button>
      
      {count % 2 === 0 && <ComponentToTest />}
    </>
  );
}
```

**Pasos**:

1. **Baseline snapshot**:
   - Cargar la página
   - Esperar a que cargue completamente
   - Click en "Take snapshot" → Snapshot 1 (baseline)

2. **Acción repetitiva**:
   - Montar/desmontar componente 10 veces
   - Forzar garbage collection: DevTools → Performance → 🗑️ (garbage can icon)
   - Take snapshot → Snapshot 2

3. **Segunda ronda**:
   - Montar/desmontar 10 veces más
   - Forzar GC
   - Take snapshot → Snapshot 3

4. **Análisis**:
   - Comparar Snapshot 3 con Snapshot 1
   - Si hay leak: la memoria crece entre snapshots

### 2.2 Cómo Tomar Heap Snapshots

**Mejores prácticas**:

```typescript
// Utilidad para facilitar el testing
class MemoryProfiler {
  private snapshots: Array<{ name: string; time: number }> = [];
  
  takeSnapshot(name: string) {
    console.log(`📸 Taking snapshot: ${name}`);
    console.log('Press "Take snapshot" in DevTools Memory panel now');
    
    this.snapshots.push({
      name,
      time: Date.now()
    });
  }
  
  forceGC() {
    console.log('🗑️ Forcing garbage collection...');
    console.log('Click the trash icon in DevTools Performance tab');
  }
  
  printReport() {
    console.table(this.snapshots);
  }
}

// Uso en tests
const profiler = new MemoryProfiler();

// Test workflow
async function runMemoryTest() {
  profiler.takeSnapshot('Baseline');
  
  for (let i = 0; i < 10; i++) {
    // Montar componente
    render(<ComponentToTest />);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Desmontar componente
    unmount();
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  profiler.forceGC();
  profiler.takeSnapshot('After 10 iterations');
  
  profiler.printReport();
}
```

### 2.3 Allocation Timeline

**Cómo usar**:

1. En DevTools Memory → Seleccionar "Allocation instrumentation on timeline"
2. Click "Start"
3. Realizar acciones que sospechosas (mount/unmount)
4. Click "Stop"
5. Analizar el gráfico:
   - Barras azules: allocations
   - Barras grises: memoria liberada
   - Si las barras azules crecen sin grises correspondientes = leak

**Interpretación**:

```
Timeline visual:
████████████████████ ← Allocations crecientes (LEAK)
██████░░░░██████░░░░ ← Normal (allocations y liberaciones)
```

### 2.4 Comparación de Snapshots

**Workflow detallado**:

1. **Tomar snapshot inicial** (antes de la acción)
2. **Realizar acción** que sospechamos causa leak
3. **Tomar snapshot final**
4. **En el snapshot final**:
   - Cambiar vista a "Comparison"
   - Seleccionar snapshot inicial como baseline
   - Ordenar por "Delta" (diferencia)

**Qué buscar**:

```
Constructor      | # New | # Deleted | # Delta | Size Delta
---------------------------------------------------------
Array            |  150  |    10     |  +140   |  +50KB    ← Sospechoso
HTMLDivElement   |   30  |    25     |    +5   |  +2KB     ← Normal
Detached DOM tree|    5  |     0     |    +5   |  +15KB    ← LEAK!
```

### 2.5 Detached DOM Nodes Detection

**Qué son**: Nodos DOM removidos del document pero aún referenciados en memoria.

**Cómo detectar**:

1. En el snapshot, buscar "Detached"
2. Expandir "Detached DOM tree"
3. Ver qué los retiene (retainers)

**Ejemplo de código problemático**:

```tsx
// ❌ INCORRECTO - DOM node retenido
function BadComponent() {
  const nodeRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const node = nodeRef.current;
    
    // ⚠️ Esta función captura el nodo DOM
    const handler = () => {
      console.log(node?.textContent);
    };
    
    window.addEventListener('resize', handler);
    
    return () => {
      window.removeEventListener('resize', handler);
      // ⚠️ Pero el handler sigue reteniendo `node`
    };
  }, []);
  
  return <div ref={nodeRef}>Content</div>;
}
```

**Solución**:

```tsx
// ✅ CORRECTO - No retiene el nodo
function GoodComponent() {
  const nodeRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handler = () => {
      // ✅ Lee el nodo en el momento del evento
      console.log(nodeRef.current?.textContent);
    };
    
    window.addEventListener('resize', handler);
    
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);
  
  return <div ref={nodeRef}>Content</div>;
}
```

### 2.6 Event Listener Leaks Detection

**Comando de inspección**:

```javascript
// En Console de DevTools, inspeccionar listeners
getEventListeners(window);
getEventListeners(document);
```

**Script de diagnóstico**:

```typescript
// Utilidad para detectar listeners huérfanos
class ListenerDetector {
  private initialListeners: Map<EventTarget, number> = new Map();
  
  recordBaseline() {
    const windowListeners = this.countListeners(window);
    const documentListeners = this.countListeners(document);
    
    this.initialListeners.set(window, windowListeners);
    this.initialListeners.set(document, documentListeners);
    
    console.log('📊 Baseline recorded:', {
      window: windowListeners,
      document: documentListeners
    });
  }
  
  checkForLeaks() {
    const currentWindow = this.countListeners(window);
    const currentDocument = this.countListeners(document);
    
    const baseline = this.initialListeners;
    
    const leaks = {
      window: currentWindow - (baseline.get(window) || 0),
      document: currentDocument - (baseline.get(document) || 0)
    };
    
    if (leaks.window > 0 || leaks.document > 0) {
      console.error('🚨 LISTENER LEAKS DETECTED:', leaks);
    } else {
      console.log('✅ No listener leaks detected');
    }
    
    return leaks;
  }
  
  private countListeners(target: EventTarget): number {
    const listeners = (getEventListeners as any)(target);
    return Object.keys(listeners).reduce((sum, event) => {
      return sum + listeners[event].length;
    }, 0);
  }
}

// Uso en tests
const detector = new ListenerDetector();
detector.recordBaseline();

// ... montar/desmontar componentes ...

detector.checkForLeaks();
```

---

## 3. Prevención de Memory Leaks

### 3.1 Cleanup Functions en useEffect

**Patrón fundamental**:

```tsx
useEffect(() => {
  // 1. Setup (suscripciones, listeners, timers)
  const subscription = createSubscription();
  
  // 2. Cleanup (SIEMPRE retornar función de limpieza)
  return () => {
    subscription.unsubscribe();
  };
}, [dependencies]);
```

**Ejemplos completos**:

```tsx
// ✅ Event Listeners
useEffect(() => {
  const handler = (e: MouseEvent) => console.log(e.clientX, e.clientY);
  window.addEventListener('mousemove', handler);
  
  return () => window.removeEventListener('mousemove', handler);
}, []);

// ✅ Timers
useEffect(() => {
  const id = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  
  return () => clearInterval(id);
}, []);

// ✅ Subscriptions
useEffect(() => {
  const subscription = observable.subscribe(data => {
    setData(data);
  });
  
  return () => subscription.unsubscribe();
}, [observable]);

// ✅ WebSocket
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3000');
  ws.onmessage = (event) => {
    setMessages(prev => [...prev, event.data]);
  };
  
  return () => {
    ws.close();
  };
}, []);
```

### 3.2 AbortController para Fetch

**Problema sin AbortController**:

```tsx
// ❌ INCORRECTO - Request no se cancela
function BadFetch() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setData(data)); // ⚠️ Puede ejecutarse después de unmount
  }, []);
  
  return <div>{JSON.stringify(data)}</div>;
}
```

**Solución con AbortController**:

```tsx
// ✅ CORRECTO - Request se cancela en unmount
function GoodFetch() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    fetch('/api/data', {
      signal: controller.signal // ✅ Conecta el signal
    })
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted'); // ✅ Normal en unmount
        } else {
          console.error('Fetch error:', err);
        }
      });
    
    return () => {
      controller.abort(); // ✅ Cancela la request
    };
  }, []);
  
  return <div>{JSON.stringify(data)}</div>;
}
```

**Pattern avanzado con async/await**:

```tsx
// ✅ Async/await + AbortController
function AdvancedFetch({ userId }: Props) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/users/${userId}`, {
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        
        const data = await response.json();
        setUser(data);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    fetchUser();
    
    return () => {
      controller.abort();
    };
  }, [userId]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{user?.name}</div>;
}
```

### 3.3 Unsubscribe Patterns

**Pattern 1: Flag de ignore (data fetching)**:

```tsx
// ✅ Ignora resultados obsoletos
function SearchResults({ query }: Props) {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    let ignore = false; // ✅ Flag para ignorar resultados viejos
    
    const fetchResults = async () => {
      const data = await api.search(query);
      
      if (!ignore) {
        setResults(data);
      }
    };
    
    fetchResults();
    
    return () => {
      ignore = true; // ✅ Marca como obsoleto
    };
  }, [query]);
  
  return <ul>{results.map(r => <li key={r.id}>{r.name}</li>)}</ul>;
}
```

**Pattern 2: Subscription/Observable**:

```tsx
// ✅ Unsubscribe de observables
function RealtimeData() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const subscription = dataStream$.subscribe({
      next: (value) => setData(prev => [...prev, value]),
      error: (err) => console.error(err),
      complete: () => console.log('Stream completed')
    });
    
    return () => {
      subscription.unsubscribe(); // ✅ Limpia subscription
    };
  }, []);
  
  return <div>{JSON.stringify(data)}</div>;
}
```

**Pattern 3: Custom Hook reutilizable**:

```tsx
// ✅ Hook personalizado con cleanup
function useData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url, {
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        
        if (!ignore) {
          setData(json);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError' && !ignore) {
          setError(err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    
    if (url) {
      fetchData();
    }
    
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [url]);
  
  return { data, loading, error };
}

// Uso
function UserProfile({ userId }: Props) {
  const { data: user, loading, error } = useData<User>(
    `/api/users/${userId}`
  );
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{user?.name}</div>;
}
```

---

## 4. Problemas Comunes

### 4.1 setState en Componentes Desmontados

**Problema**:

```tsx
// ❌ WARNING: Can't perform a React state update on an unmounted component
function BadAsyncComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData().then(result => {
      setData(result); // ⚠️ Puede ejecutarse después de unmount
    });
  }, []);
  
  return <div>{data}</div>;
}
```

**Soluciones**:

```tsx
// ✅ Solución 1: Flag de montaje
function GoodAsyncComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    
    fetchData().then(result => {
      if (isMounted) {
        setData(result); // ✅ Solo actualiza si está montado
      }
    });
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  return <div>{data}</div>;
}

// ✅ Solución 2: AbortController
function BetterAsyncComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    fetch('/api/data', { signal: controller.signal })
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });
    
    return () => controller.abort();
  }, []);
  
  return <div>{data}</div>;
}

// ✅ Solución 3: Custom hook
function useSafeState<T>(initialState: T) {
  const [state, setState] = useState(initialState);
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const setSafeState = useCallback((value: T | ((prev: T) => T)) => {
    if (isMountedRef.current) {
      setState(value);
    }
  }, []);
  
  return [state, setSafeState] as const;
}

// Uso
function SafeComponent() {
  const [data, setData] = useSafeState(null);
  
  useEffect(() => {
    fetchData().then(setData); // ✅ Seguro usar
  }, [setData]);
  
  return <div>{data}</div>;
}
```

### 4.2 WebSocket Connections No Cerradas

**Problema**:

```tsx
// ❌ INCORRECTO - WebSocket persiste
function BadWebSocket() {
  const [messages, setMessages] = useState<string[]>([]);
  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');
    
    ws.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    // ⚠️ No se cierra la conexión
  }, []);
  
  return (
    <ul>
      {messages.map((msg, i) => <li key={i}>{msg}</li>)}
    </ul>
  );
}
```

**Solución completa**:

```tsx
// ✅ CORRECTO - WebSocket manejado correctamente
function GoodWebSocket() {
  const [messages, setMessages] = useState<string[]>([]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setStatus('connected');
    };
    
    ws.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setStatus('disconnected');
    };
    
    // ✅ Cleanup cierra la conexión
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, 'Component unmounting'); // Normal closure
      }
    };
  }, []);
  
  return (
    <div>
      <div>Status: {status}</div>
      <ul>
        {messages.map((msg, i) => <li key={i}>{msg}</li>)}
      </ul>
    </div>
  );
}
```

**Hook reutilizable para WebSocket**:

```tsx
// ✅ Hook custom para WebSocket
interface UseWebSocketOptions {
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onError,
    onOpen,
    onClose,
    reconnect = false,
    reconnectInterval = 3000,
    reconnectAttempts = 5
  } = options;
  
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  
  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      
      ws.onopen = (event) => {
        setReadyState(WebSocket.OPEN);
        reconnectCountRef.current = 0; // Reset counter
        onOpen?.(event);
      };
      
      ws.onmessage = (event) => {
        onMessage?.(event);
      };
      
      ws.onerror = (event) => {
        onError?.(event);
      };
      
      ws.onclose = (event) => {
        setReadyState(WebSocket.CLOSED);
        onClose?.(event);
        
        // Intentar reconectar
        if (reconnect && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current += 1;
          console.log(
            `Reconnecting... Attempt ${reconnectCountRef.current}/${reconnectAttempts}`
          );
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }, [url, onMessage, onError, onOpen, onClose, reconnect, reconnectInterval, reconnectAttempts]);
  
  useEffect(() => {
    connect();
    
    return () => {
      // ✅ Limpieza completa
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [connect]);
  
  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      console.warn('WebSocket is not open. Message not sent.');
    }
  }, []);
  
  return {
    sendMessage,
    readyState,
    isOpen: readyState === WebSocket.OPEN,
    isConnecting: readyState === WebSocket.CONNECTING,
    isClosed: readyState === WebSocket.CLOSED
  };
}

// Uso
function ChatComponent() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  
  const { sendMessage, isOpen } = useWebSocket('ws://localhost:3000', {
    onMessage: (event) => {
      setMessages(prev => [...prev, event.data]);
    },
    reconnect: true,
    reconnectAttempts: 5
  });
  
  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };
  
  return (
    <div>
      <div>Status: {isOpen ? 'Connected' : 'Disconnected'}</div>
      <ul>
        {messages.map((msg, i) => <li key={i}>{msg}</li>)}
      </ul>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={!isOpen}
      />
      <button onClick={handleSend} disabled={!isOpen}>
        Send
      </button>
    </div>
  );
}
```

### 4.3 Global Event Listeners

**Problema**:

```tsx
// ❌ INCORRECTO - Listener global no limpiado
function BadGlobalListener() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // ⚠️ No hay cleanup - listener persiste
  }, []);
  
  return <div>X: {position.x}, Y: {position.y}</div>;
}
```

**Solución**:

```tsx
// ✅ CORRECTO - Con cleanup
function GoodGlobalListener() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return <div>X: {position.x}, Y: {position.y}</div>;
}
```

**Pattern con throttle/debounce**:

```tsx
// ✅ Con throttle para mejor performance
import { throttle } from 'lodash';

function OptimizedGlobalListener() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    // ✅ Throttle para reducir llamadas
    const handleMouseMove = throttle((e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    }, 100);
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      handleMouseMove.cancel(); // ✅ Cancela throttle pendiente
    };
  }, []);
  
  return <div>X: {position.x}, Y: {position.y}</div>;
}
```

**Hook reutilizable**:

```tsx
// ✅ Custom hook para event listeners globales
function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | Document | HTMLElement = window,
  options?: AddEventListenerOptions
) {
  const savedHandler = useRef(handler);
  
  // ✅ Actualiza el ref cuando handler cambia
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;
    
    // ✅ Wrapper que llama al handler actual
    const eventListener = (event: Event) => 
      savedHandler.current(event as WindowEventMap[K]);
    
    element.addEventListener(eventName, eventListener, options);
    
    return () => {
      element.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}

// Uso
function MouseTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEventListener('mousemove', (e) => {
    setPosition({ x: e.clientX, y: e.clientY });
  });
  
  return <div>X: {position.x}, Y: {position.y}</div>;
}
```

---

## 5. Ejemplos Completos

### 5.1 Componente Sin Memory Leaks

```tsx
import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  id: string;
  text: string;
  timestamp: number;
}

interface ChatProps {
  roomId: string;
  serverUrl: string;
}

/**
 * Componente de chat sin memory leaks
 * 
 * ✅ Implementa todos los patterns de prevención:
 * - WebSocket cleanup
 * - Event listener cleanup
 * - Timer cleanup
 * - AbortController para fetch
 * - Estado seguro en async
 */
function ChatComponent({ roomId, serverUrl }: ChatProps) {
  // Estado
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [isTyping, setIsTyping] = useState(false);
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);
  
  // ✅ 1. WebSocket con cleanup
  useEffect(() => {
    isMountedRef.current = true;
    const ws = new WebSocket(`${serverUrl}/${roomId}`);
    wsRef.current = ws;
    
    ws.onopen = () => {
      if (isMountedRef.current) {
        setStatus('connected');
      }
    };
    
    ws.onmessage = (event) => {
      if (isMountedRef.current) {
        const message: Message = JSON.parse(event.data);
        setMessages(prev => [...prev, message]);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      if (isMountedRef.current) {
        setStatus('disconnected');
      }
    };
    
    return () => {
      isMountedRef.current = false;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, 'Component cleanup');
      }
    };
  }, [roomId, serverUrl]);
  
  // ✅ 2. Cargar mensajes históricos con AbortController
  useEffect(() => {
    const controller = new AbortController();
    
    const loadHistory = async () => {
      try {
        const response = await fetch(
          `${serverUrl}/rooms/${roomId}/messages`,
          { signal: controller.signal }
        );
        
        if (!response.ok) {
          throw new Error('Failed to load messages');
        }
        
        const data = await response.json();
        
        if (isMountedRef.current) {
          setMessages(data);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to load history:', error);
        }
      }
    };
    
    loadHistory();
    
    return () => {
      controller.abort();
    };
  }, [roomId, serverUrl]);
  
  // ✅ 3. Typing indicator con timer cleanup
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    // Enviar "typing" al servidor
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing', roomId }));
    }
    
    // ✅ Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // ✅ Nuevo timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'stopped_typing', roomId }));
      }
    }, 1000);
  }, [roomId]);
  
  // ✅ 4. Cleanup del typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  // ✅ 5. Event listener con cleanup
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('User left the page');
      } else {
        console.log('User returned to the page');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  const handleSend = () => {
    if (input.trim() && wsRef.current?.readyState === WebSocket.OPEN) {
      const message: Message = {
        id: Date.now().toString(),
        text: input,
        timestamp: Date.now()
      };
      
      wsRef.current.send(JSON.stringify(message));
      setInput('');
      
      // ✅ Limpiar typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };
  
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Room: {roomId}</h2>
        <div className={`status ${status}`}>{status}</div>
      </div>
      
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <div className="text">{msg.text}</div>
            <div className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isTyping && <div className="typing-indicator">Someone is typing...</div>}
      </div>
      
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={status !== 'connected'}
          placeholder={
            status === 'connected' 
              ? 'Type a message...' 
              : 'Connecting...'
          }
        />
        <button onClick={handleSend} disabled={status !== 'connected'}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatComponent;
```

### 5.2 Checklist de Prevención

```tsx
/**
 * CHECKLIST DE PREVENCIÓN DE MEMORY LEAKS
 * 
 * Usa este checklist en code reviews:
 */

const MEMORY_LEAK_CHECKLIST = {
  useEffect: {
    '✅ Todos los useEffect tienen return function?': false,
    '✅ Los event listeners se remueven?': false,
    '✅ Los timers se limpian (clearTimeout/clearInterval)?': false,
    '✅ Las subscriptions se cancelan (unsubscribe)?': false,
    '✅ Las conexiones se cierran (WebSocket, SSE)?': false,
  },
  
  async: {
    '✅ Fetch usa AbortController?': false,
    '✅ setState tiene guard de mounted?': false,
    '✅ Promises tienen flag de ignore?': false,
  },
  
  refs: {
    '✅ DOM refs se limpian cuando el nodo se remueve?': false,
    '✅ Closures no capturan objetos grandes innecesariamente?': false,
  },
  
  cache: {
    '✅ Cache tiene límite de tamaño?': false,
    '✅ Cache tiene TTL o política de evicción?': false,
  }
};

// Uso en código:
function ComponentReview() {
  // ✅ GOOD: Tiene cleanup
  useEffect(() => {
    const ws = new WebSocket(url);
    return () => ws.close();
  }, [url]);
  
  // ❌ BAD: No tiene cleanup
  useEffect(() => {
    const ws = new WebSocket(url);
    // Missing cleanup!
  }, [url]);
}
```

### 5.3 Testing de Memory Leaks

```tsx
import { render, unmount, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

describe('Memory Leak Tests', () => {
  // ✅ Test: Event listeners se limpian
  it('should cleanup event listeners on unmount', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(<ComponentWithListener />);
    
    expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
    
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
  
  // ✅ Test: Timers se limpian
  it('should cleanup timers on unmount', () => {
    jest.useFakeTimers();
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    const { unmount } = render(<ComponentWithTimer />);
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
    
    clearIntervalSpy.mockRestore();
    jest.useRealTimers();
  });
  
  // ✅ Test: Fetch se cancela
  it('should abort fetch on unmount', async () => {
    const abortSpy = jest.fn();
    global.AbortController = jest.fn().mockImplementation(() => ({
      abort: abortSpy,
      signal: {}
    })) as any;
    
    const { unmount } = render(<ComponentWithFetch />);
    
    unmount();
    
    await waitFor(() => {
      expect(abortSpy).toHaveBeenCalled();
    });
  });
  
  // ✅ Test: WebSocket se cierra
  it('should close WebSocket on unmount', () => {
    const closeSpy = jest.fn();
    global.WebSocket = jest.fn().mockImplementation(() => ({
      close: closeSpy,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    })) as any;
    
    const { unmount } = render(<ComponentWithWebSocket />);
    
    unmount();
    
    expect(closeSpy).toHaveBeenCalled();
  });
  
  // ✅ Test: No setState en componente desmontado
  it('should not update state after unmount', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { unmount } = render(<AsyncComponent />);
    
    unmount();
    
    await waitFor(() => {
      // No debe haber warnings de setState en unmounted component
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("Can't perform a React state update")
      );
    });
    
    consoleSpy.mockRestore();
  });
});
```

---

## Recursos Adicionales

### Artículos Recomendados
- [React Docs: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [React Docs: useEffect Cleanup](https://react.dev/reference/react/useEffect#cleanup)
- [Understanding React useEffect Cleanup Function - LogRocket](https://blog.logrocket.com/understanding-react-useeffect-cleanup-function/)

### Herramientas
- Chrome DevTools Memory Profiler
- React DevTools Profiler
- [why-did-you-render](https://github.com/welldone-software/why-did-you-render)

### Patterns
- AbortController API
- Ignore flag pattern
- useSafeState custom hook
- useEventListener custom hook

---

## Resumen

**Reglas de oro para evitar memory leaks**:

1. **SIEMPRE** retornar una función de cleanup en `useEffect`
2. **SIEMPRE** usar `AbortController` para fetch requests
3. **SIEMPRE** verificar si el componente está montado antes de `setState` en async
4. **SIEMPRE** remover event listeners globales
5. **SIEMPRE** limpiar timers (`clearTimeout`/`clearInterval`)
6. **SIEMPRE** cerrar conexiones (WebSocket, SSE)
7. **SIEMPRE** cancelar subscriptions (`unsubscribe`)

**En caso de duda**:
> "Si creas algo en useEffect, debes limpiarlo en el cleanup"
