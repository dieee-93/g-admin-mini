# Errores Comunes en React

Guía completa de los errores más frecuentes en React, sus causas y soluciones.

---

## 1. Objects are not valid as React child

### Mensaje de Error
```
Error: Objects are not valid as a React child (found: object with keys {name, age}).
If you meant to render a collection of children, use an array instead.
```

### ❌ Código que Causa el Error
```tsx
const UserProfile = () => {
  const user = { name: 'Juan', age: 25 };
  
  return (
    <div>
      <h1>Usuario: {user}</h1> {/* ❌ Intentando renderizar un objeto */}
    </div>
  );
};
```

### 🔍 Causa Raíz
React no puede renderizar objetos directamente. Solo puede renderizar:
- Strings
- Numbers
- Componentes de React
- Arrays de elementos válidos
- null/undefined/boolean (no renderizan nada)

Cuando intentas renderizar un objeto en JSX, React no sabe cómo convertirlo a elementos del DOM.

### ✅ Solución
```tsx
const UserProfile = () => {
  const user = { name: 'Juan', age: 25 };
  
  return (
    <div>
      {/* ✅ Acceder a propiedades específicas */}
      <h1>Usuario: {user.name}</h1>
      <p>Edad: {user.age}</p>
      
      {/* ✅ O usar JSON.stringify para debugging */}
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
};
```

### 💡 Cómo Prevenir
- Siempre accede a propiedades específicas de objetos: `{user.name}`
- Para arrays de objetos, usa `.map()` para renderizar cada elemento
- Usa TypeScript para detectar estos errores en tiempo de desarrollo
- Si necesitas renderizar un objeto para debugging, usa `JSON.stringify()`

---

## 2. Functions are not valid as React child

### Mensaje de Error
```
Error: Functions are not valid as a React child. This may happen if you return a Component instead of <Component /> from render.
```

### ❌ Código que Causa el Error
```tsx
const Dashboard = () => {
  const renderHeader = () => <h1>Dashboard</h1>;
  
  return (
    <div>
      {renderHeader} {/* ❌ Función sin invocar */}
    </div>
  );
};

// O este error común:
const App = () => {
  return (
    <div>
      {Alert} {/* ❌ Componente sin instanciar */}
    </div>
  );
};
```

### 🔍 Causa Raíz
Estás pasando una referencia a la función en lugar de invocarla. React espera elementos, no definiciones de funciones.

### ✅ Solución
```tsx
const Dashboard = () => {
  const renderHeader = () => <h1>Dashboard</h1>;
  
  return (
    <div>
      {renderHeader()} {/* ✅ Invocar la función */}
    </div>
  );
};

// O mejor aún:
const App = () => {
  return (
    <div>
      <Alert /> {/* ✅ Instanciar el componente */}
    </div>
  );
};
```

### 💡 Cómo Prevenir
- Recuerda que los componentes se usan con `<Component />` no `{Component}`
- Las funciones helper deben invocarse: `{renderSomething()}`
- Usa ESLint con reglas de React para detectar estos errores
- TypeScript también ayuda a prevenir esto

---

## 3. Maximum update depth exceeded

### Mensaje de Error
```
Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
```

### ❌ Código que Causa el Error
```tsx
const Counter = () => {
  const [count, setCount] = useState(0);
  
  // ❌ Actualización infinita en el render
  setCount(count + 1);
  
  return <div>Count: {count}</div>;
};

// O en un useEffect sin dependencias correctas:
const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
    setUser(null); // ❌ Causa re-render infinito
  }); // ❌ Sin array de dependencias
  
  return <div>{user?.name}</div>;
};
```

### 🔍 Causa Raíz
Estás llamando a `setState` directamente en el cuerpo del componente o en un `useEffect` sin dependencias correctas, lo que causa:
1. Render
2. setState llamado
3. Re-render
4. setState llamado de nuevo
5. Loop infinito

### ✅ Solución
```tsx
const Counter = () => {
  const [count, setCount] = useState(0);
  
  // ✅ Actualizar solo en respuesta a eventos
  const handleClick = () => {
    setCount(count + 1);
  };
  
  return (
    <div>
      Count: {count}
      <button onClick={handleClick}>Increment</button>
    </div>
  );
};

const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // ✅ Solo se ejecuta cuando userId cambia
    fetchUser(userId).then(setUser);
  }, [userId]); // ✅ Array de dependencias correcto
  
  return <div>{user?.name}</div>;
};
```

### 💡 Cómo Prevenir
- NUNCA llames a `setState` en el cuerpo del componente
- Usa `useEffect` con array de dependencias correcto
- Las actualizaciones de estado deben ser en respuesta a eventos o efectos controlados
- Usa React DevTools Profiler para detectar loops de renderizado

---

## 4. Rendered more hooks than during the previous render

### Mensaje de Error
```
Error: Rendered more hooks than during the previous render.
```

### ❌ Código que Causa el Error
```tsx
const UserForm = ({ isEditing }: { isEditing: boolean }) => {
  const [name, setName] = useState('');
  
  // ❌ Hook condicional
  if (isEditing) {
    const [email, setEmail] = useState('');
  }
  
  return <form>...</form>;
};

// O en loops:
const ProductList = ({ items }: { items: string[] }) => {
  return (
    <div>
      {items.map(item => {
        const [selected, setSelected] = useState(false); // ❌ Hook en loop
        return <div key={item}>{item}</div>;
      })}
    </div>
  );
};
```

### 🔍 Causa Raíz
React usa el orden de los hooks para mantener el estado entre renders. Cuando usas hooks condicionalmente o en loops, el orden cambia y React pierde la referencia al estado correcto.

### ✅ Solución
```tsx
const UserForm = ({ isEditing }: { isEditing: boolean }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // ✅ Siempre declarar hooks
  
  return (
    <form>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      {isEditing && ( // ✅ Condicional en el JSX, no en el hook
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      )}
    </form>
  );
};

// Para items con estado, crear un componente separado:
const ProductItem = ({ item }: { item: string }) => {
  const [selected, setSelected] = useState(false); // ✅ Hook en componente
  return <div onClick={() => setSelected(!selected)}>{item}</div>;
};

const ProductList = ({ items }: { items: string[] }) => {
  return (
    <div>
      {items.map(item => (
        <ProductItem key={item} item={item} />
      ))}
    </div>
  );
};
```

### 💡 Cómo Prevenir
- **REGLA DE ORO**: Llama hooks solo en el nivel superior del componente
- No uses hooks dentro de condiciones, loops o funciones anidadas
- Extrae componentes separados si necesitas estado en items de un array
- Usa ESLint plugin `eslint-plugin-react-hooks` para detectar violaciones

---

## 5. Cannot read property 'X' of undefined

### Mensaje de Error
```
TypeError: Cannot read property 'name' of undefined
```

### ❌ Código que Causa el Error
```tsx
const UserProfile = () => {
  const [user, setUser] = useState<User>();
  
  useEffect(() => {
    fetchUser().then(setUser);
  }, []);
  
  // ❌ user es undefined en el primer render
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};
```

### 🔍 Causa Raíz
El estado comienza como `undefined` y tratas de acceder a propiedades antes de que los datos estén disponibles. Esto es muy común con datos asíncronos.

### ✅ Solución
```tsx
const UserProfile = () => {
  const [user, setUser] = useState<User>();
  
  useEffect(() => {
    fetchUser().then(setUser);
  }, []);
  
  // ✅ Opción 1: Early return con loading state
  if (!user) {
    return <div>Cargando...</div>;
  }
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};

// ✅ Opción 2: Optional chaining
const UserProfile2 = () => {
  const [user, setUser] = useState<User>();
  
  useEffect(() => {
    fetchUser().then(setUser);
  }, []);
  
  return (
    <div>
      <h1>{user?.name ?? 'Sin nombre'}</h1>
      <p>{user?.email ?? 'Sin email'}</p>
    </div>
  );
};

// ✅ Opción 3: Estado inicial con valores por defecto
const UserProfile3 = () => {
  const [user, setUser] = useState<User>({
    name: '',
    email: '',
  });
  
  useEffect(() => {
    fetchUser().then(setUser);
  }, []);
  
  return (
    <div>
      <h1>{user.name || 'Sin nombre'}</h1>
      <p>{user.email || 'Sin email'}</p>
    </div>
  );
};
```

### 💡 Cómo Prevenir
- Usa optional chaining (`?.`) y nullish coalescing (`??`)
- Implementa estados de loading/error explícitos
- Considera usar React Query que maneja estos estados automáticamente
- TypeScript con `strictNullChecks` te obliga a manejar estos casos

---

## 6. Each child in a list should have a unique key prop

### Mensaje de Error
```
Warning: Each child in a list should have a unique "key" prop.
```

### ❌ Código que Causa el Error
```tsx
const TodoList = ({ todos }: { todos: Todo[] }) => {
  return (
    <ul>
      {/* ❌ Sin key */}
      {todos.map(todo => (
        <li>{todo.text}</li>
      ))}
    </ul>
  );
};

// O peor aún:
const ProductList = ({ products }: { products: Product[] }) => {
  return (
    <div>
      {/* ❌ Usando index como key (puede causar bugs) */}
      {products.map((product, index) => (
        <ProductCard key={index} product={product} />
      ))}
    </div>
  );
};
```

### 🔍 Causa Raíz
React usa las `key` props para identificar qué elementos han cambiado, sido agregados o eliminados. Sin keys únicas y estables:
- El rendimiento se degrada
- El estado de los componentes puede mezclarse
- Los componentes pueden no actualizarse correctamente

Usar el `index` como key es problemático cuando el orden de los elementos puede cambiar.

### ✅ Solución
```tsx
const TodoList = ({ todos }: { todos: Todo[] }) => {
  return (
    <ul>
      {/* ✅ Usar ID único de la base de datos */}
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
};

// Si no tienes IDs, crea una función estable:
import { nanoid } from 'nanoid';

const ProductList = ({ products }: { products: Product[] }) => {
  // ✅ Asignar IDs únicos al crear/recibir los datos
  const productsWithIds = useMemo(
    () => products.map(p => ({ ...p, _key: p.id || nanoid() })),
    [products]
  );
  
  return (
    <div>
      {productsWithIds.map(product => (
        <ProductCard key={product._key} product={product} />
      ))}
    </div>
  );
};

// ✅ Index es aceptable SOLO si:
// - La lista es estática (nunca cambia)
// - Los items no se reordenan
// - Los items no se filtran
const StaticMenu = () => {
  const menuItems = ['Home', 'About', 'Contact']; // Nunca cambia
  
  return (
    <nav>
      {menuItems.map((item, index) => (
        <a key={index} href={`#${item.toLowerCase()}`}>{item}</a>
      ))}
    </nav>
  );
};
```

### 💡 Cómo Prevenir
- Usa IDs únicos de tu base de datos como keys
- Si generas IDs, hazlo durante la creación de datos, no en el render
- NUNCA uses `Math.random()` como key (cambia en cada render)
- Solo usa index si la lista es verdaderamente estática
- Considera usar librerías como `nanoid` o `uuid` para generar IDs

---

## 7. A component is changing an uncontrolled input to be controlled

### Mensaje de Error
```
Warning: A component is changing an uncontrolled input to be controlled. This is likely caused by the value changing from undefined to a defined value, which should not happen.
```

### ❌ Código que Causa el Error
```tsx
const UserForm = () => {
  const [user, setUser] = useState<User>(); // ❌ undefined inicial
  
  return (
    <form>
      {/* ❌ value cambia de undefined a string */}
      <input 
        value={user?.name} 
        onChange={(e) => setUser({ ...user, name: e.target.value })}
      />
    </form>
  );
};
```

### 🔍 Causa Raíz
Un input controlado debe tener siempre un valor definido (string, aunque sea vacío). Cuando el valor cambia de `undefined` a un string, React no sabe si el input debe ser controlado o no controlado.

### ✅ Solución
```tsx
// ✅ Opción 1: Inicializar con valores por defecto
const UserForm = () => {
  const [user, setUser] = useState<User>({
    name: '',
    email: '',
  });
  
  return (
    <form>
      <input 
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
      />
    </form>
  );
};

// ✅ Opción 2: Usar nullish coalescing
const UserForm2 = () => {
  const [user, setUser] = useState<User>();
  
  return (
    <form>
      <input 
        value={user?.name ?? ''}
        onChange={(e) => setUser({ ...user!, name: e.target.value })}
      />
    </form>
  );
};

// ✅ Opción 3: Usar campos individuales
const UserForm3 = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  return (
    <form>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
    </form>
  );
};
```

### 💡 Cómo Prevenir
- Siempre inicializa inputs controlados con string vacío `''`
- Usa `value ?? ''` si el valor puede ser undefined
- Para inputs opcionales, considera usar `defaultValue` (uncontrolled)
- TypeScript con tipos estrictos ayuda a prevenir esto

---

## 8. State not updating immediately (batching)

### Mensaje de Error
```
// No hay error, pero el comportamiento es inesperado
console.log(count); // Muestra valor viejo después de setState
```

### ❌ Código que Causa el Error
```tsx
const Counter = () => {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
    console.log(count); // ❌ Muestra valor VIEJO (0, no 1)
    
    // ❌ Esto solo incrementa en 1, no en 3
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };
  
  return <button onClick={handleClick}>Count: {count}</button>;
};
```

### 🔍 Causa Raíz
`setState` es **asíncrono** y React hace **batching** (agrupa múltiples actualizaciones). Después de llamar `setState`, el valor de la variable no cambia inmediatamente. En React 18+, el batching automático es aún más agresivo.

### ✅ Solución
```tsx
const Counter = () => {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    // ✅ Usar función updater para acceder al valor más reciente
    setCount(prevCount => {
      console.log('Valor anterior:', prevCount);
      return prevCount + 1;
    });
    
    // ✅ Para múltiples incrementos, usa función updater
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    // Ahora sí incrementa en 3
  };
  
  // ✅ Para acceder al nuevo valor, usa useEffect
  useEffect(() => {
    console.log('Count actualizado:', count);
  }, [count]);
  
  return <button onClick={handleClick}>Count: {count}</button>;
};

// ✅ O usa flushSync para forzar actualización inmediata (raro)
import { flushSync } from 'react-dom';

const ForceUpdate = () => {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    flushSync(() => {
      setCount(count + 1);
    });
    console.log(count); // Ahora muestra valor nuevo (solo en casos específicos)
  };
  
  return <button onClick={handleClick}>Count: {count}</button>;
};
```

### 💡 Cómo Prevenir
- Recuerda que `setState` es asíncrono
- Usa la forma funcional `setState(prev => prev + 1)` cuando dependas del valor anterior
- Para efectos secundarios basados en el nuevo estado, usa `useEffect`
- No dependas del valor inmediato después de `setState`

---

## 9. Stale closures en useEffect

### Mensaje de Error
```
// No hay error, pero el efecto usa valores viejos
```

### ❌ Código que Causa el Error
```tsx
const Timer = () => {
  const [count, setCount] = useState(0);
  const [delay, setDelay] = useState(1000);
  
  useEffect(() => {
    const timer = setInterval(() => {
      // ❌ count siempre es 0 (valor inicial capturado)
      console.log('Count:', count);
      setCount(count + 1); // Solo incrementa a 1 y se queda ahí
    }, delay);
    
    return () => clearInterval(timer);
  }, []); // ❌ Array vacío causa stale closure
  
  return <div>Count: {count}</div>;
};
```

### 🔍 Causa Raíz
Los closures de JavaScript capturan el valor de las variables en el momento de la creación. Si las dependencias de `useEffect` no incluyen todas las variables usadas dentro del efecto, el efecto "recuerda" valores viejos.

### ✅ Solución
```tsx
// ✅ Opción 1: Incluir todas las dependencias
const Timer1 = () => {
  const [count, setCount] = useState(0);
  const [delay, setDelay] = useState(1000);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Count:', count);
      setCount(count + 1);
    }, delay);
    
    return () => clearInterval(timer);
  }, [count, delay]); // ✅ Incluir todas las dependencias
  
  return <div>Count: {count}</div>;
};

// ✅ Opción 2: Usar función updater (preferido para setState)
const Timer2 = () => {
  const [count, setCount] = useState(0);
  const [delay, setDelay] = useState(1000);
  
  useEffect(() => {
    const timer = setInterval(() => {
      // ✅ No depende de count externo
      setCount(prev => {
        console.log('Count:', prev);
        return prev + 1;
      });
    }, delay);
    
    return () => clearInterval(timer);
  }, [delay]); // ✅ Solo delay es dependencia
  
  return <div>Count: {count}</div>;
};

// ✅ Opción 3: useRef para valores que no deben causar re-render
const Timer3 = () => {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  useEffect(() => {
    countRef.current = count; // Mantener sincronizado
  }, [count]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Count:', countRef.current); // ✅ Siempre el valor actual
      setCount(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []); // ✅ Array vacío OK porque usa ref
  
  return <div>Count: {count}</div>;
};
```

### 💡 Cómo Prevenir
- Usa ESLint rule `react-hooks/exhaustive-deps` (detecta dependencias faltantes)
- Siempre incluye todas las dependencias que uses en el efecto
- Para setState que depende del valor anterior, usa función updater
- Para valores de referencia que no necesitan re-render, usa `useRef`

---

## 10. State mutation directa no actualiza UI

### Mensaje de Error
```
// No hay error, pero la UI no se actualiza
```

### ❌ Código que Causa el Error
```tsx
const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Learn React', done: false }
  ]);
  
  const toggleTodo = (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.done = !todo.done; // ❌ Mutación directa
      setTodos(todos); // ❌ Misma referencia, React no detecta cambio
    }
  };
  
  const addTodo = (text: string) => {
    const newTodo = { id: Date.now(), text, done: false };
    todos.push(newTodo); // ❌ Mutación directa del array
    setTodos(todos); // ❌ React no detecta el cambio
  };
  
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id} onClick={() => toggleTodo(todo.id)}>
          {todo.text} - {todo.done ? 'Done' : 'Pending'}
        </li>
      ))}
    </ul>
  );
};
```

### 🔍 Causa Raíz
React usa **comparación referencial** (shallow comparison) para detectar cambios en el estado. Si mutas el objeto/array directamente, la referencia es la misma, por lo que React no detecta el cambio y no re-renderiza.

### ✅ Solución
```tsx
const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Learn React', done: false }
  ]);
  
  // ✅ Crear nuevo array con map
  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id 
        ? { ...todo, done: !todo.done } // ✅ Nuevo objeto
        : todo
    ));
  };
  
  // ✅ Crear nuevo array con spread
  const addTodo = (text: string) => {
    const newTodo = { id: Date.now(), text, done: false };
    setTodos([...todos, newTodo]); // ✅ Nuevo array
  };
  
  // ✅ Eliminar con filter
  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id} onClick={() => toggleTodo(todo.id)}>
          {todo.text} - {todo.done ? 'Done' : 'Pending'}
          <button onClick={(e) => {
            e.stopPropagation();
            deleteTodo(todo.id);
          }}>X</button>
        </li>
      ))}
    </ul>
  );
};

// ✅ Con Immer (si tienes estado complejo)
import { useImmer } from 'use-immer';

const TodoListWithImmer = () => {
  const [todos, setTodos] = useImmer<Todo[]>([
    { id: 1, text: 'Learn React', done: false }
  ]);
  
  const toggleTodo = (id: number) => {
    setTodos(draft => {
      const todo = draft.find(t => t.id === id);
      if (todo) {
        todo.done = !todo.done; // ✅ Immer permite mutación en el draft
      }
    });
  };
  
  return <ul>...</ul>;
};
```

### 💡 Cómo Prevenir
- **NUNCA** mutes el estado directamente
- Usa métodos inmutables: `map()`, `filter()`, spread `[...array]`, `{ ...object }`
- Para estado complejo, considera `useImmer` o Zustand con Immer
- TypeScript con `readonly` puede ayudar: `readonly Todo[]`
- Usa ESLint con reglas de inmutabilidad

---

## 11. Derived state anti-pattern

### Mensaje de Error
```
// No hay error, pero el estado está desincronizado
```

### ❌ Código que Causa el Error
```tsx
interface Props {
  products: Product[];
}

const ProductList = ({ products }: Props) => {
  // ❌ ANTI-PATTERN: Duplicar props en estado
  const [filteredProducts, setFilteredProducts] = useState(products);
  
  // ❌ Cuando products cambia, filteredProducts no se actualiza
  const handleFilter = (category: string) => {
    setFilteredProducts(
      products.filter(p => p.category === category)
    );
  };
  
  return <div>...</div>;
};

// Otro ejemplo común:
const UserProfile = ({ user }: { user: User }) => {
  // ❌ Nombre completo derivado de props, pero guardado en estado
  const [fullName, setFullName] = useState(`${user.firstName} ${user.lastName}`);
  
  // Cuando user cambia, fullName queda desactualizado
  return <h1>{fullName}</h1>;
};
```

### 🔍 Causa Raíz
**Derived state** es estado que se puede calcular a partir de props o estado existente. Duplicarlo en estado causa:
- Sincronización difícil de mantener
- Bugs cuando la fuente de verdad cambia
- Más código y complejidad innecesaria

### ✅ Solución
```tsx
// ✅ Opción 1: Calcular en cada render (preferido si es rápido)
const ProductList = ({ products }: Props) => {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  // ✅ Derivar, no duplicar
  const filteredProducts = categoryFilter
    ? products.filter(p => p.category === categoryFilter)
    : products;
  
  return (
    <div>
      <select onChange={(e) => setCategoryFilter(e.target.value)}>
        <option value="">All</option>
        <option value="electronics">Electronics</option>
      </select>
      {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
};

// ✅ Opción 2: useMemo si el cálculo es costoso
const ProductList2 = ({ products }: Props) => {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  const filteredProducts = useMemo(() => {
    console.log('Filtering products...');
    return categoryFilter
      ? products.filter(p => p.category === categoryFilter)
      : products;
  }, [products, categoryFilter]); // ✅ Re-calcula cuando cambian
  
  return <div>...</div>;
};

// ✅ Para fullName:
const UserProfile = ({ user }: { user: User }) => {
  // ✅ Calcular directamente
  const fullName = `${user.firstName} ${user.lastName}`;
  return <h1>{fullName}</h1>;
};

// ✅ Si necesitas sincronizar props a estado (raro):
const UserForm = ({ initialUser }: { initialUser: User }) => {
  const [user, setUser] = useState(initialUser);
  
  // ✅ useEffect para sincronizar cuando cambia la prop
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);
  
  return <form>...</form>;
};
```

### 💡 Cómo Prevenir
- Pregúntate: "¿Puedo calcular esto a partir de props/estado existente?"
- Si la respuesta es sí, NO uses estado
- Solo usa `useMemo` si el cálculo es realmente costoso
- Si necesitas sincronizar props a estado local (formularios editables), usa `useEffect`
- Documenta por qué estás duplicando el estado si es necesario

---

## 12. Props not updating (memo issue)

### Mensaje de Error
```
// No hay error, pero el componente no se actualiza
```

### ❌ Código que Causa el Error
```tsx
interface ProductCardProps {
  product: Product;
  onSelect: (id: string) => void;
}

// ❌ memo con función inline como prop
const ProductCard = memo(({ product, onSelect }: ProductCardProps) => {
  console.log('Rendering', product.name);
  return (
    <div onClick={() => onSelect(product.id)}>
      {product.name}
    </div>
  );
});

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([...]);
  
  return (
    <div>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={(id) => console.log(id)} // ❌ Nueva función cada render
        />
      ))}
    </div>
  );
  // ProductCard se re-renderiza aunque product no cambie
};
```

### 🔍 Causa Raíz
`React.memo()` hace shallow comparison de props. Si pasas una nueva referencia (función inline, objeto literal, array) en cada render, memo no previene el re-render porque las referencias son diferentes.

### ✅ Solución
```tsx
// ✅ Opción 1: useCallback para funciones
const ProductList1 = () => {
  const [products, setProducts] = useState<Product[]>([...]);
  
  const handleSelect = useCallback((id: string) => {
    console.log('Selected:', id);
  }, []); // ✅ Misma referencia entre renders
  
  return (
    <div>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
};

// ✅ Opción 2: Custom comparison para memo
const ProductCard2 = memo(
  ({ product, onSelect }: ProductCardProps) => {
    return <div onClick={() => onSelect(product.id)}>{product.name}</div>;
  },
  (prevProps, nextProps) => {
    // ✅ Comparar solo lo que importa
    return prevProps.product.id === nextProps.product.id &&
           prevProps.product.name === nextProps.product.name;
    // onSelect se ignora en la comparación
  }
);

// ✅ Opción 3: No usar memo si re-renderiza frecuentemente
// A veces memo es contraproducente
const ProductCard3 = ({ product, onSelect }: ProductCardProps) => {
  // Sin memo, se renderiza pero es rápido
  return <div onClick={() => onSelect(product.id)}>{product.name}</div>;
};

// ✅ Opción 4: Mover handler al componente hijo
const ProductCard4 = memo(({ product }: { product: Product }) => {
  const handleClick = () => {
    console.log('Selected:', product.id);
    // O dispatch action, etc.
  };
  
  return <div onClick={handleClick}>{product.name}</div>;
});
```

### 💡 Cómo Prevenir
- `memo` es útil solo si el componente es costoso de renderizar
- Usa `useCallback` para funciones que pases a componentes memoizados
- Usa `useMemo` para objetos/arrays que pases a componentes memoizados
- Considera no usar `memo` si las props cambian frecuentemente
- Usa React DevTools Profiler para medir si `memo` realmente ayuda

---

## 13. Inline functions breaking memo

### Mensaje de Error
```
// No hay error, pero optimizaciones no funcionan
```

### ❌ Código que Causa el Error
```tsx
const ExpensiveList = memo(({ items, renderItem }: {
  items: Item[];
  renderItem: (item: Item) => ReactNode;
}) => {
  console.log('Rendering ExpensiveList');
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{renderItem(item)}</div>
      ))}
    </div>
  );
});

const Dashboard = () => {
  const [items, setItems] = useState<Item[]>([...]);
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      
      <ExpensiveList
        items={items}
        renderItem={(item) => ( // ❌ Nueva función cada render
          <span>{item.name}</span>
        )}
      />
      {/* ExpensiveList se re-renderiza cuando count cambia */}
    </div>
  );
};
```

### 🔍 Causa Raíz
Cada render crea nuevas instancias de funciones inline, objetos literales y arrays. Aunque el contenido sea el mismo, la referencia es diferente, rompiendo optimizaciones de `memo`.

### ✅ Solución
```tsx
// ✅ Opción 1: useCallback para render props
const Dashboard1 = () => {
  const [items, setItems] = useState<Item[]>([...]);
  const [count, setCount] = useState(0);
  
  const renderItem = useCallback((item: Item) => (
    <span>{item.name}</span>
  ), []); // ✅ Misma referencia
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ExpensiveList items={items} renderItem={renderItem} />
    </div>
  );
};

// ✅ Opción 2: Componente separado (mejor)
const ItemRenderer = ({ item }: { item: Item }) => (
  <span>{item.name}</span>
);

const ExpensiveList2 = memo(({ items }: { items: Item[] }) => {
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <ItemRenderer item={item} />
        </div>
      ))}
    </div>
  );
});

const Dashboard2 = () => {
  const [items, setItems] = useState<Item[]>([...]);
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ExpensiveList2 items={items} />
    </div>
  );
};

// ✅ Opción 3: useMemo para objetos/arrays
const Dashboard3 = () => {
  const [count, setCount] = useState(0);
  
  const config = useMemo(() => ({
    theme: 'dark',
    layout: 'grid',
  }), []); // ✅ Misma referencia
  
  const filters = useMemo(() => ['active', 'completed'], []);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ExpensiveComponent config={config} filters={filters} />
    </div>
  );
};
```

### 💡 Cómo Prevenir
- Evita funciones inline, objetos y arrays como props de componentes memoizados
- Usa `useCallback` para funciones
- Usa `useMemo` para objetos y arrays
- Define constantes fuera del componente si no dependen de props/estado
- Mide con React DevTools Profiler antes de optimizar

---

## 14. useEffect missing dependencies

### Mensaje de Error
```
React Hook useEffect has a missing dependency: 'userId'. Either include it or remove the dependency array.
```

### ❌ Código que Causa el Error
```tsx
const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser); // Usa userId
  }, []); // ❌ userId no está en dependencias
  
  // Cuando userId cambia, el efecto no se ejecuta de nuevo
  return <div>{user?.name}</div>;
};

// Otro ejemplo:
const SearchResults = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  
  const searchAPI = async (searchTerm: string) => {
    const data = await fetch(`/api/search?q=${searchTerm}`);
    return data.json();
  };
  
  useEffect(() => {
    searchAPI(query).then(setResults); // Usa query
  }, []); // ❌ query no está en dependencias
  
  return <div>...</div>;
};
```

### 🔍 Causa Raíz
Si un efecto usa variables reactivas (props, estado, otras variables del scope del componente) pero no las incluye en el array de dependencias, el efecto usará valores stale (viejos) y no se actualizará cuando esas variables cambien.

### ✅ Solución
```tsx
// ✅ Incluir todas las dependencias
const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]); // ✅ userId en dependencias
  
  return <div>{user?.name}</div>;
};

// ✅ Para funciones, usa useCallback
const SearchResults = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  
  const searchAPI = useCallback(async (searchTerm: string) => {
    const data = await fetch(`/api/search?q=${searchTerm}`);
    return data.json();
  }, []); // ✅ Función estable
  
  useEffect(() => {
    searchAPI(query).then(setResults);
  }, [query, searchAPI]); // ✅ Todas las dependencias
  
  return <div>...</div>;
};

// ✅ O define la función dentro del efecto
const SearchResults2 = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  
  useEffect(() => {
    const searchAPI = async () => {
      const data = await fetch(`/api/search?q=${query}`);
      const json = await data.json();
      setResults(json);
    };
    
    searchAPI();
  }, [query]); // ✅ Solo query es dependencia externa
  
  return <div>...</div>;
};

// ✅ Con debounce para evitar demasiadas llamadas
const SearchResults3 = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        fetch(`/api/search?q=${query}`)
          .then(res => res.json())
          .then(setResults);
      }
    }, 300); // Debounce 300ms
    
    return () => clearTimeout(timer);
  }, [query]);
  
  return <div>...</div>;
};
```

### 💡 Cómo Prevenir
- SIEMPRE habilita ESLint rule `react-hooks/exhaustive-deps`
- Incluye todas las variables reactivas que uses en el efecto
- Para funciones, considera definirlas dentro del efecto o usa `useCallback`
- Para constantes que no cambian, defínelas fuera del componente
- Usa librerías como React Query que manejan esto automáticamente

---

## 15. Invalid hook call

### Mensaje de Error
```
Error: Invalid hook call. Hooks can only be called inside of the body of a function component.
```

### ❌ Código que Causa el Error
```tsx
// ❌ Hook en función regular
function createUser(name: string) {
  const [user, setUser] = useState({ name }); // ❌ No es un componente
  return user;
}

// ❌ Hook en class component
class UserProfile extends React.Component {
  render() {
    const [name, setName] = useState(''); // ❌ Hooks no funcionan en clases
    return <div>{name}</div>;
  }
}

// ❌ Hook llamado condicionalmente (rompe reglas de hooks)
const UserForm = ({ isEditing }: { isEditing: boolean }) => {
  if (isEditing) {
    const [name, setName] = useState(''); // ❌ Hook condicional
  }
  return <div>...</div>;
};

// ❌ Hook en callback
const TodoList = () => {
  const todos = ['Todo 1', 'Todo 2'];
  
  return (
    <div>
      {todos.map(todo => {
        const [done, setDone] = useState(false); // ❌ Hook en loop
        return <div>{todo}</div>;
      })}
    </div>
  );
};

// ❌ Hook en event handler
const Button = () => {
  const handleClick = () => {
    const [clicked, setClicked] = useState(false); // ❌ Hook en función
  };
  
  return <button onClick={handleClick}>Click</button>;
};
```

### 🔍 Causa Raíz
Los hooks tienen reglas estrictas:
1. Solo se pueden llamar en el nivel superior de componentes funcionales
2. Solo se pueden llamar en custom hooks (funciones que empiezan con `use`)
3. No se pueden llamar condicionalmente, en loops, o en funciones anidadas

### ✅ Solución
```tsx
// ✅ Hooks en el nivel superior del componente
const UserForm = ({ isEditing }: { isEditing: boolean }) => {
  const [name, setName] = useState(''); // ✅ Nivel superior
  
  return (
    <div>
      {isEditing && (
        <input value={name} onChange={(e) => setName(e.target.value)} />
      )}
    </div>
  );
};

// ✅ Para estado en items de lista, crear componente
const TodoItem = ({ todo }: { todo: string }) => {
  const [done, setDone] = useState(false); // ✅ En componente
  
  return (
    <div onClick={() => setDone(!done)}>
      {todo} {done && '✓'}
    </div>
  );
};

const TodoList = () => {
  const todos = ['Todo 1', 'Todo 2'];
  
  return (
    <div>
      {todos.map((todo, i) => (
        <TodoItem key={i} todo={todo} />
      ))}
    </div>
  );
};

// ✅ Para lógica reutilizable, crear custom hook
function useUser(name: string) {
  const [user, setUser] = useState({ name });
  
  const updateName = (newName: string) => {
    setUser({ name: newName });
  };
  
  return { user, updateName };
}

// Usar el custom hook:
const UserProfile = () => {
  const { user, updateName } = useUser('Juan'); // ✅ Custom hook
  return <div>{user.name}</div>;
};

// ✅ Event handlers usan estado existente
const Button = () => {
  const [clicked, setClicked] = useState(false); // ✅ Nivel superior
  
  const handleClick = () => {
    setClicked(true); // ✅ Usar estado existente
  };
  
  return <button onClick={handleClick}>Click</button>;
};
```

### 💡 Cómo Prevenir
- Llama hooks solo en el nivel superior de componentes funcionales
- Para lógica reutilizable, crea custom hooks (nombre empieza con `use`)
- Extrae componentes si necesitas estado en items de arrays
- Usa ESLint plugin `eslint-plugin-react-hooks`
- Nunca llames hooks dentro de condiciones, loops o callbacks

---

## 16. useEffect infinite loop

### Mensaje de Error
```
// Browser se congela o warning:
Warning: Maximum update depth exceeded.
```

### ❌ Código que Causa el Error
```tsx
// ❌ Causa 1: Objeto como dependencia
const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  const config = { includeDetails: true }; // ❌ Nuevo objeto cada render
  
  useEffect(() => {
    fetchUser(userId, config).then(setUser);
  }, [userId, config]); // ❌ config cambia cada render → loop
  
  return <div>{user?.name}</div>;
};

// ❌ Causa 2: setState sin condición
const DataFetcher = () => {
  const [data, setData] = useState<Data | null>(null);
  
  useEffect(() => {
    fetchData().then(setData); // ✅ OK
    setData(null); // ❌ Causa re-render → efecto se ejecuta de nuevo
  }, [data]); // ❌ data en dependencias + setData en efecto = loop
  
  return <div>...</div>;
};

// ❌ Causa 3: Array/objeto en setState
const SearchResults = () => {
  const [filters, setFilters] = useState({ category: 'all' });
  const [results, setResults] = useState<Result[]>([]);
  
  useEffect(() => {
    search(filters).then(setResults);
    setFilters({ ...filters }); // ❌ Nuevo objeto → re-render → loop
  }, [filters]);
  
  return <div>...</div>;
};
```

### 🔍 Causa Raíz
Loops infinitos ocurren cuando:
1. Un efecto actualiza estado que está en sus dependencias
2. Las dependencias son objetos/arrays que se recrean cada render
3. No hay condición para prevenir actualizaciones innecesarias

### ✅ Solución
```tsx
// ✅ Solución 1: useMemo para objetos/arrays estables
const UserProfile1 = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const config = useMemo(() => ({
    includeDetails: true
  }), []); // ✅ Misma referencia
  
  useEffect(() => {
    fetchUser(userId, config).then(setUser);
  }, [userId, config]); // ✅ config no cambia
  
  return <div>{user?.name}</div>;
};

// ✅ Solución 2: Mover objeto dentro del efecto
const UserProfile2 = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const config = { includeDetails: true }; // ✅ Dentro del efecto
    fetchUser(userId, config).then(setUser);
  }, [userId]); // ✅ Solo userId es dependencia
  
  return <div>{user?.name}</div>;
};

// ✅ Solución 3: Usar valores primitivos como dependencias
const UserProfile3 = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  const includeDetails = true; // ✅ Primitivo, no cambia
  
  useEffect(() => {
    fetchUser(userId, { includeDetails }).then(setUser);
  }, [userId, includeDetails]);
  
  return <div>{user?.name}</div>;
};

// ✅ Solución 4: Condición antes de setState
const DataFetcher = () => {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!loading && !data) { // ✅ Solo fetch si no hay data
      setLoading(true);
      fetchData().then(d => {
        setData(d);
        setLoading(false);
      });
    }
  }, [data, loading]);
  
  return <div>...</div>;
};

// ✅ Mejor: Sin data en dependencias
const DataFetcher2 = () => {
  const [data, setData] = useState<Data | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    
    fetchData().then(d => {
      if (!cancelled) {
        setData(d);
      }
    });
    
    return () => {
      cancelled = true; // ✅ Cleanup para evitar setState en unmount
    };
  }, []); // ✅ Solo se ejecuta una vez
  
  return <div>...</div>;
};
```

### 💡 Cómo Prevenir
- Evita poner objetos/arrays en dependencias sin `useMemo`
- No actualices estado que esté en las dependencias del efecto
- Usa valores primitivos como dependencias cuando sea posible
- Mueve objetos/funciones dentro del efecto si es posible
- Usa React Query o SWR para data fetching (manejan esto automáticamente)

---

## 17. Missing cleanup function

### Mensaje de Error
```
Warning: Can't perform a React state update on an unmounted component.
```

### ❌ Código que Causa el Error
```tsx
// ❌ Suscripción sin cleanup
const UserStatus = ({ userId }: { userId: string }) => {
  const [status, setStatus] = useState<'online' | 'offline'>('offline');
  
  useEffect(() => {
    const subscription = subscribeToUserStatus(userId, (newStatus) => {
      setStatus(newStatus);
    });
    
    // ❌ Sin cleanup → suscripción sigue activa después de unmount
  }, [userId]);
  
  return <div>Status: {status}</div>;
};

// ❌ Timer sin cleanup
const CountdownTimer = () => {
  const [seconds, setSeconds] = useState(60);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => s - 1);
    }, 1000);
    
    // ❌ Sin cleanup → timer sigue corriendo después de unmount
  }, []);
  
  return <div>Time: {seconds}s</div>;
};

// ❌ Fetch sin cancelación
const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
    
    // ❌ Si el componente se desmonta antes que termine el fetch,
    // setUser se llama en componente desmontado
  }, [userId]);
  
  return <div>{user?.name}</div>;
};
```

### 🔍 Causa Raíz
Muchos efectos necesitan **limpieza** (cleanup) para:
- Cancelar suscripciones
- Limpiar timers
- Cancelar requests HTTP
- Remover event listeners

Sin cleanup, estos recursos siguen activos después de que el componente se desmonta, causando memory leaks y intentos de actualizar componentes desmontados.

### ✅ Solución
```tsx
// ✅ Cleanup de suscripción
const UserStatus = ({ userId }: { userId: string }) => {
  const [status, setStatus] = useState<'online' | 'offline'>('offline');
  
  useEffect(() => {
    const subscription = subscribeToUserStatus(userId, (newStatus) => {
      setStatus(newStatus);
    });
    
    return () => {
      subscription.unsubscribe(); // ✅ Cleanup
    };
  }, [userId]);
  
  return <div>Status: {status}</div>;
};

// ✅ Cleanup de timer
const CountdownTimer = () => {
  const [seconds, setSeconds] = useState(60);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => s - 1);
    }, 1000);
    
    return () => {
      clearInterval(timer); // ✅ Cleanup
    };
  }, []);
  
  return <div>Time: {seconds}s</div>;
};

// ✅ Cancelación de fetch con AbortController
const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    fetchUser(userId, { signal: controller.signal })
      .then(setUser)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });
    
    return () => {
      controller.abort(); // ✅ Cancelar fetch
    };
  }, [userId]);
  
  return <div>{user?.name}</div>;
};

// ✅ O con flag booleano (alternativa simple)
const UserProfile2 = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    
    fetchUser(userId).then(data => {
      if (!cancelled) {
        setUser(data); // ✅ Solo setState si no está cancelled
      }
    });
    
    return () => {
      cancelled = true; // ✅ Marcar como cancelled
    };
  }, [userId]);
  
  return <div>{user?.name}</div>;
};

// ✅ Event listener cleanup
const WindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Llamar una vez para set inicial
    
    return () => {
      window.removeEventListener('resize', handleResize); // ✅ Cleanup
    };
  }, []);
  
  return <div>{size.width} x {size.height}</div>;
};
```

### 💡 Cómo Prevenir
- Si un efecto crea una suscripción, timer, o listener, necesita cleanup
- Para async operations (fetch), usa AbortController o flag booleano
- La función de cleanup se ejecuta antes del próximo efecto y en unmount
- Siempre limpia recursos para evitar memory leaks
- Usa custom hooks para encapsular lógica de setup/cleanup

---

## 18. useContext must be inside Provider

### Mensaje de Error
```
Error: useContext() called outside of a Provider
// O el valor es undefined
```

### ❌ Código que Causa el Error
```tsx
// Definir context
const UserContext = createContext<User | undefined>(undefined);

// ❌ Usar context sin Provider
const UserProfile = () => {
  const user = useContext(UserContext); // ❌ undefined
  
  return <div>{user?.name}</div>; // Bug potencial
};

const App = () => {
  return (
    <div>
      <UserProfile /> {/* ❌ Sin Provider */}
    </div>
  );
};

// ❌ Provider en ubicación incorrecta
const App2 = () => {
  return (
    <div>
      <Router>
        <Route path="/profile" element={<UserProfile />} />
      </Router>
      
      {/* ❌ Provider después de los componentes que lo usan */}
      <UserContext.Provider value={user}>
        <OtherComponent />
      </UserContext.Provider>
    </div>
  );
};
```

### 🔍 Causa Raíz
`useContext` busca el Provider más cercano en el árbol de componentes. Si no encuentra ninguno, devuelve el valor por defecto del contexto (usualmente `undefined`).

### ✅ Solución
```tsx
// ✅ Opción 1: Provider con valor por defecto y validación
const UserContext = createContext<User | undefined>(undefined);

const useUser = () => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider');
  }
  
  return context;
};

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({
    id: '1',
    name: 'Juan',
  });
  
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
};

// Usar:
const UserProfile = () => {
  const user = useUser(); // ✅ Error claro si no hay Provider
  return <div>{user.name}</div>;
};

const App = () => {
  return (
    <UserProvider>
      <UserProfile />
    </UserProvider>
  );
};

// ✅ Opción 2: Tipo non-nullable con valor inicial
interface UserContextType {
  user: User;
  setUser: (user: User) => void;
}

const UserContext = createContext<UserContextType>({
  user: { id: '', name: '' },
  setUser: () => {},
});

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({ id: '1', name: 'Juan' });
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// ✅ Opción 3: Multiple contexts con composición
const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <UserProvider>
      <ThemeProvider>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </ThemeProvider>
    </UserProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes />
      </Router>
    </AuthProvider>
  );
};
```

### 💡 Cómo Prevenir
- Siempre envuelve componentes que usan `useContext` con el Provider correspondiente
- Crea custom hooks que validen que el contexto existe
- Coloca Providers en la raíz de tu app o en el nivel más alto necesario
- Usa TypeScript para evitar valores undefined
- Considera usar Zustand o Redux si la complejidad de contextos crece

---

## 19. Context value causing re-renders

### Mensaje de Error
```
// No hay error, pero todos los consumidores se re-renderizan
```

### ❌ Código que Causa el Error
```tsx
const AppContext = createContext<{
  user: User;
  theme: string;
  updateUser: (user: User) => void;
  updateTheme: (theme: string) => void;
} | undefined>(undefined);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({ id: '1', name: 'Juan' });
  const [theme, setTheme] = useState('light');
  
  // ❌ Nuevo objeto en cada render
  const value = {
    user,
    theme,
    updateUser: setUser, // ❌ Nueva función cada render
    updateTheme: setTheme, // ❌ Nueva función cada render
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
  // Cada render del provider causa re-render de TODOS los consumidores
};

// Componentes que solo usan user también se re-renderizan cuando theme cambia
const UserProfile = () => {
  const { user } = useContext(AppContext)!;
  console.log('UserProfile render');
  return <div>{user.name}</div>;
};

const ThemeToggle = () => {
  const { theme, updateTheme } = useContext(AppContext)!;
  return <button onClick={() => updateTheme(theme === 'light' ? 'dark' : 'light')}>
    Toggle Theme
  </button>;
};
```

### 🔍 Causa Raíz
Context propaga cambios a **todos** los consumidores cuando el valor cambia (comparación referencial). Si creas un nuevo objeto en cada render:
- Todos los consumidores se re-renderizan
- Incluso si solo usan una parte del contexto que no cambió
- El rendimiento se degrada con muchos consumidores

### ✅ Solución
```tsx
// ✅ Solución 1: useMemo para el valor del context
const AppProvider1 = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({ id: '1', name: 'Juan' });
  const [theme, setTheme] = useState('light');
  
  const value = useMemo(() => ({
    user,
    theme,
    updateUser: setUser,
    updateTheme: setTheme,
  }), [user, theme]); // ✅ Solo cambia cuando user o theme cambian
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// ✅ Solución 2: Separar contextos (mejor para grandes apps)
const UserContext = createContext<{
  user: User;
  updateUser: (user: User) => void;
} | undefined>(undefined);

const ThemeContext = createContext<{
  theme: string;
  updateTheme: (theme: string) => void;
} | undefined>(undefined);

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({ id: '1', name: 'Juan' });
  
  const value = useMemo(() => ({
    user,
    updateUser: setUser,
  }), [user]);
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState('light');
  
  const value = useMemo(() => ({
    theme,
    updateTheme: setTheme,
  }), [theme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Ahora UserProfile solo se re-renderiza cuando user cambia
const UserProfile = () => {
  const { user } = useContext(UserContext)!;
  console.log('UserProfile render'); // Solo cuando user cambia
  return <div>{user.name}</div>;
};

// ✅ Solución 3: Split context value y updaters
const UserStateContext = createContext<User | undefined>(undefined);
const UserDispatchContext = createContext<{
  updateUser: (user: User) => void;
} | undefined>(undefined);

const UserProvider3 = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({ id: '1', name: 'Juan' });
  
  const dispatch = useMemo(() => ({
    updateUser: setUser,
  }), []); // ✅ Nunca cambia
  
  return (
    <UserStateContext.Provider value={user}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
};

// Componentes que solo leen no se re-renderizan cuando otros actualizan
const useUserState = () => useContext(UserStateContext);
const useUserDispatch = () => useContext(UserDispatchContext);

// ✅ Solución 4: Usar Zustand (library diseñada para esto)
import { create } from 'zustand';

const useAppStore = create<{
  user: User;
  theme: string;
  updateUser: (user: User) => void;
  updateTheme: (theme: string) => void;
}>((set) => ({
  user: { id: '1', name: 'Juan' },
  theme: 'light',
  updateUser: (user) => set({ user }),
  updateTheme: (theme) => set({ theme }),
}));

// Solo se re-renderiza cuando user cambia (no theme)
const UserProfile4 = () => {
  const user = useAppStore(state => state.user);
  console.log('UserProfile render');
  return <div>{user.name}</div>;
};
```

### 💡 Cómo Prevenir
- Usa `useMemo` para el valor del contexto
- Separa contextos por dominio (user, theme, settings)
- Separa state y dispatch en contextos diferentes
- Para apps grandes, usa state management como Zustand o Redux
- Usa React DevTools Profiler para detectar re-renders innecesarios

---

## 20. Can't perform a React state update on an unmounted component

### Mensaje de Error
```
Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application.
```

### ❌ Código que Causa el Error
```tsx
// ❌ setState después de unmount
const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data); // ❌ Se ejecuta aunque el componente ya no exista
    });
  }, [userId]);
  
  return <div>{user?.name}</div>;
};

// Escenario: Usuario navega rápido antes de que termine el fetch

// ❌ setTimeout sin cleanup
const Notification = ({ message }: { message: string }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    setTimeout(() => {
      setVisible(false); // ❌ Se ejecuta aunque el componente se desmonte
    }, 3000);
  }, []);
  
  if (!visible) return null;
  return <div>{message}</div>;
};

// ❌ Event listener no removido
const MouseTracker = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // ❌ Sin cleanup → listener sigue llamando setPosition
  }, []);
  
  return <div>X: {position.x}, Y: {position.y}</div>;
};
```

### 🔍 Causa Raíz
El componente se desmonta pero hay operaciones asíncronas (fetch, timers, listeners) que intentan actualizar el estado después. Esto causa:
- Warning en consola
- Memory leaks potenciales
- Comportamiento inesperado

### ✅ Solución
```tsx
// ✅ Solución 1: Cancelar fetch con AbortController
const UserProfile1 = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    fetchUser(userId, { signal: controller.signal })
      .then(setUser)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });
    
    return () => {
      controller.abort(); // ✅ Cancelar fetch al desmontar
    };
  }, [userId]);
  
  return <div>{user?.name}</div>;
};

// ✅ Solución 2: Flag booleano (alternativa simple)
const UserProfile2 = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    fetchUser(userId).then(data => {
      if (isMounted) {
        setUser(data); // ✅ Solo setState si está montado
      }
    });
    
    return () => {
      isMounted = false; // ✅ Marcar como desmontado
    };
  }, [userId]);
  
  return <div>{user?.name}</div>;
};

// ✅ Solución 3: Limpiar setTimeout
const Notification = ({ message }: { message: string }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);
    
    return () => {
      clearTimeout(timer); // ✅ Limpiar timer
    };
  }, []);
  
  if (!visible) return null;
  return <div>{message}</div>;
};

// ✅ Solución 4: Remover event listener
const MouseTracker = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove); // ✅ Cleanup
    };
  }, []);
  
  return <div>X: {position.x}, Y: {position.y}</div>;
};

// ✅ Solución 5: Custom hook reutilizable
function useSafeState<T>(initialValue: T) {
  const [state, setState] = useState(initialValue);
  const isMountedRef = useRef(true);
  
  useEffect(() => {
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

// Usar:
const UserProfile3 = ({ userId }: { userId: string }) => {
  const [user, setUser] = useSafeState<User | null>(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser); // ✅ setUser es seguro
  }, [userId, setUser]);
  
  return <div>{user?.name}</div>;
};
```

### 💡 Cómo Prevenir
- SIEMPRE limpia efectos asíncronos con cleanup function
- Usa AbortController para fetch requests
- Limpia timers con `clearTimeout`/`clearInterval`
- Remueve event listeners en cleanup
- Considera usar React Query que maneja esto automáticamente
- Crea custom hooks para encapsular lógica de cleanup

---

## Recursos Adicionales

### Herramientas para Debugging
- **React DevTools**: Inspeccionar componentes, props, estado
- **React DevTools Profiler**: Medir performance y re-renders
- **ESLint plugin react-hooks**: Detectar violaciones de reglas de hooks
- **TypeScript**: Prevenir muchos errores en tiempo de desarrollo
- **Error Boundaries**: Capturar errores en tiempo de ejecución

### Best Practices
- Usa TypeScript con `strict: true`
- Habilita todas las reglas de ESLint para React
- Usa React DevTools regularmente
- Implementa Error Boundaries en producción
- Considera usar React Query/SWR para data fetching
- Usa Zustand o Redux para state management complejo

### Referencias
- [React Docs - Common Mistakes](https://react.dev/learn/you-might-not-need-an-effect)
- [React Hooks Rules](https://react.dev/reference/rules)
- [React Error Decoder](https://react.dev/errors)
- [TypeScript React Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

**Última actualización**: Diciembre 2025
