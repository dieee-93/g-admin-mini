# Solución: Mezcla de lógica y presentación

## Código de referencia: 4.2

## Categoría de impacto
**ALTO** - Dificulta el testing unitario, la reusabilidad y la legibilidad del código.

## Descripción del anti-pattern

Componentes que contienen lógica de negocio compleja, llamadas a API (data fetching), validaciones y lógica de transformación de datos mezclada directamente con el código de renderizado (JSX).

```typescript
// ❌ INCORRECTO
const UserDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lógica de fetching mezclada con presentación
  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => {
      // Lógica de transformación mezclada
      const processed = d.map(u => ({ ...u, fullName: `${u.name} ${u.lastName}` }));
      setData(processed);
      setLoading(false);
    });
  }, []);

  // Lógica de negocio/validación inline
  const handleSubmit = (formData) => {
    if (formData.age < 18) {
      alert('Error');
      return;
    }
    // ... más lógica
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* JSX mezclado con lógica */}
      {data.map(user => (
        <div key={user.id} onClick={() => handleSubmit(user)}>
            {user.fullName}
        </div>
      ))}
    </div>
  );
};
```

## Por qué es un problema

**Fuente 1: React Documentation (Legacy)**
> "Container components are concerned with how things work. Presentational components are concerned with how things look."
- Fuente: Dan Abramov - Presentational and Container Components
- URL: https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0

**Fuente 2: Patterns.dev**
> "Separating the view from the application logic enforces a separation of concerns, which makes your code easier to read, test, and reuse."
- Fuente: Container/Presentational Pattern
- URL: https://www.patterns.dev/posts/presentational-container-pattern/

**Fuente 3: Kent C. Dodds**
> "When you mix concerns, your components become brittle and hard to change. Extracting logic into hooks allows you to compose behavior independently of the UI."
- Autor: Kent C. Dodds
- URL: https://kentcdodds.com/blog/compound-components-with-react-hooks

## Solución recomendada

Utilizar el patrón de **Custom Hooks** para encapsular la lógica (data fetching, estado, handlers) y dejar el componente principal enfocado puramente en la composición y presentación. Para casos muy complejos, se puede usar explícitamente el patrón **Container/Presentational**.

### Código correcto

```typescript
// ✅ CORRECTO

// 1. Custom Hook para la lógica (hooks/useUserDashboard.ts)
const useUserDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await userService.getUsers();
        setUsers(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleUserClick = useCallback((user: User) => {
    if (!userValidation.isValid(user)) return;
    // ... lógica
  }, []);

  return { users, isLoading, handleUserClick };
};

// 2. Componente de Presentación (UserDashboard.tsx)
const UserDashboard = () => {
  // La lógica está abstraída, el componente es declarativo
  const { users, isLoading, handleUserClick } = useUserDashboard();

  if (isLoading) return <LoadingSpinner />;

  return <UserList users={users} onItemClick={handleUserClick} />;
};
```

### Explicación

Al extraer la lógica a un Custom Hook (`useUserDashboard`):
1.  **Testability:** Podemos testear la lógica del hook sin montar componentes de UI.
2.  **Reusability:** La lógica de "cargar usuarios y manejar selección" puede reutilizarse en otras vistas.
3.  **Readability:** El componente `UserDashboard` describe *qué* se muestra, no *cómo* se obtienen los datos.

## Patrón de refactoring

### Paso 1: Identificar lógica acoplada
Identificar estados (`useState`), efectos (`useEffect`) y funciones de manejo (`handlers`) que contienen lógica de negocio o acceso a datos.

### Paso 2: Crear Custom Hook
Crear un archivo en la carpeta `hooks/` del módulo (ej. `useNombreComponente.ts`). Mover todos los estados y efectos identificados a este hook. Retornar solo lo necesario para el renderizado.

```typescript
// hooks/useMyComponent.ts
export const useMyComponent = (props: MyComponentProps) => {
  // ... lógica movida aquí
  return { state, handlers };
};
```

### Paso 3: Conectar Componente
Reemplazar la lógica en el componente original con la llamada al hook.

```typescript
// components/MyComponent.tsx
export const MyComponent = (props) => {
  const { state, handlers } = useMyComponent(props);
  return <div onClick={handlers.click}>{state.value}</div>;
};
```

## Casos edge a considerar

1.  **Drilling de props al hook:** Si el hook necesita muchas props del componente, quizás la lógica está demasiado acoplada a la vista específica.
2.  **Hooks muy grandes:** Si el custom hook resultante es gigante, se debe subdividir en hooks más pequeños (`useUsersQuery`, `useUserActions`, etc.).
3.  **Render Props:** En algunos casos donde la lógica debe ser muy flexible en el renderizado, considerar Render Props o Compound Components.

## Validación

- [ ] El componente visual no tiene `useEffect` con llamadas a API.
- [ ] La lógica de negocio está en un archivo separado (hook o servicio).
- [ ] Los tests unitarios pueden probar la lógica importando solo el hook.
- [ ] El componente principal tiene menos de 150-200 líneas.

## Esfuerzo estimado

**MEDIO** - Requiere análisis para separar correctamente las responsabilidades, pero es mecánico.
- **Por componente simple:** 15-30 minutos.
- **Por componente complejo:** 1-2 horas.

## Referencias

1.  React Docs: Reusing Logic with Custom Hooks
    https://react.dev/learn/reusing-logic-with-custom-hooks
2.  Patterns.dev: Container/Presentational Pattern
    https://www.patterns.dev/posts/presentational-container-pattern/
3.  Martin Fowler: Presentation Domain Data Layering
    https://martinfowler.com/bliki/PresentationDomainDataLayering.html

---

# Solución: Acceso directo a Supabase desde componentes

## Código de referencia: 4.3

## Categoría de impacto
**CRÍTICO** - Viola la arquitectura en capas, acopla la UI a la tecnología de base de datos específica y hace casi imposible el testing sin mocks globales complejos.

## Descripción del anti-pattern

Componentes de React importando directamente el cliente de Supabase y ejecutando queries SQL-like dentro del ciclo de vida del componente o handlers.

```typescript
// ❌ INCORRECTO
import { supabase } from '@/lib/supabase';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      // Query directa en el componente
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true);
      
      if (!error) setProducts(data);
    };
    fetchProducts();
  }, []);
  // ...
};
```

## Por qué es un problema

**Fuente 1: Clean Architecture (Robert C. Martin)**
> "The UI should not know about the database. Changes in the database schema or technology should not force changes in the UI components."
- Fuente: Clean Architecture: A Craftsman's Guide to Software Structure and Design

**Fuente 2: React Query (TanStack Query) Docs**
> "It is recommended to keep your data fetching logic separate from your UI components to ensure separation of concerns and testability."
- Fuente: TanStack Query Documentation - Best Practices
- URL: https://tanstack.com/query/latest/docs/react/guides/does-this-replace-client-state

**Fuente 3: 12 Factor App**
> "Backing services should be treated as attached resources. The code should not distinguish between local and third-party services."
- Fuente: The Twelve-Factor App
- URL: https://12factor.net/backing-services

## Solución recomendada

Implementar una **Capa de Servicios (Service Layer)**. Los componentes solo deben interactuar con servicios o hooks que abstraen la fuente de datos.

### Código correcto

```typescript
// ✅ CORRECTO

// 1. Servicio (services/productService.ts)
export const productService = {
  getActiveProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true);
    
    if (error) throw new Error(error.message);
    return data;
  }
};

// 2. Componente (usando un hook que usa el servicio)
const ProductList = () => {
  // El componente no sabe que existe Supabase
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getActiveProducts
  });
  
  // ...
};
```

### Explicación

1.  **Desacoplamiento:** Si cambiamos Supabase por Firebase o una API REST, solo cambiamos el archivo de servicio. Los componentes no se tocan.
2.  **Centralización:** Las queries repetidas (ej. "productos activos") se definen en un solo lugar. Si la lógica de "activo" cambia, se actualiza un solo sitio.
3.  **Testing:** Podemos mockear `productService.getActiveProducts` fácilmente en tests de componentes.

## Patrón de refactoring

### Paso 1: Crear el Servicio
Crear un archivo en `services/` (ej. `nombreModuloService.ts`). Copiar la query de Supabase y envolverla en una función asíncrona tipada.

```typescript
// services/ordersService.ts
export const getOrders = async (userId: string) => {
  // Query de supabase movida aquí
};
```

### Paso 2: Reemplazar en Componente
Eliminar el import de `supabase` del componente. Importar el servicio. Usar el servicio dentro del `useEffect` o `useQuery`.

```typescript
// components/Orders.tsx
// ANTES: supabase.from('orders')...
// DESPUÉS: await ordersService.getOrders(userId);
```

### Paso 3: Estandarizar Errores
Asegurarse que el servicio maneje los errores de Supabase y lance errores estándar o retorne estructuras predecibles, para que el componente no tenga que manejar objetos `PostgrestError` específicos.

## Casos edge a considerar

1.  **Realtime Subscriptions:** Las suscripciones de Supabase también deben encapsularse en hooks/servicios, no usarse directo en `useEffect`.
2.  **Auth Session:** El acceso a `supabase.auth.user()` debe hacerse a través de un `useAuth` hook o servicio de autenticación centralizado.

## Validación

- [ ] Búsqueda global de `import { supabase }` no arroja resultados en carpetas de componentes (`components/`, `pages/`).
- [ ] Solo archivos en `services/`, `lib/`, o `api/` importan el cliente de Supabase.
- [ ] Los servicios retornan datos tipados, no objetos crudos de respuesta de Supabase.

## Esfuerzo estimado

**ALTO** - Es un cambio estructural importante si el patrón está muy extendido.
- **Por archivo:** 10-20 minutos.
- **Sistémico:** Requiere definir interfaces de servicios claras.

## Referencias

1.  Patterns.dev: Repository Pattern
    https://www.patterns.dev/
2.  Supabase Docs: Client Libraries structure
    https://supabase.com/docs/reference/javascript/initializing
3.  Bulletproof React - Project Structure
    https://github.com/alan2207/bulletproof-react

---

# Solución: Componentes muy grandes (>500 líneas)

## Código de referencia: 4.1

## Categoría de impacto
**ALTO** - Componentes monolíticos son difíciles de entender, mantener y refactorizar. Aumentan la carga cognitiva y la probabilidad de bugs.

## Descripción del anti-pattern

Archivos de componentes que exceden las 500 líneas de código, generalmente debido a:
1.  Múltiples sub-componentes definidos en el mismo archivo.
2.  Lógica de negocio compleja inline (ver problema 4.2).
3.  Estilos inline extensos o configuraciones masivas.
4.  Renderizado condicional excesivo (God Component).

## Por qué es un problema

**Fuente 1: Clean Code (Robert C. Martin)**
> "The first rule of functions is that they should be small. The second rule of functions is that they should be smaller than that."
- Fuente: Clean Code: A Handbook of Agile Software Craftsmanship

**Fuente 2: React Docs**
> "Break components into smaller components. If a part of your UI is used several times (Button, Panel, Avatar), or is complex enough on its own (App, FeedStory, Comment), it is a good candidate to be a reusable component."
- Fuente: React Documentation - Components and Props
- URL: https://react.dev/learn/your-first-component

## Solución recomendada

Aplicar **Composición** y el patrón de **Slots** (children prop) para dividir el componente. Extraer sub-secciones lógicas a componentes más pequeños y dedicados.

### Código correcto

```typescript
// ✅ CORRECTO - Descomposición

// 1. Componente Padre (ProductPage.tsx) - Orquestador limpio
const ProductPage = () => {
  const { product, loading } = useProduct();

  if (loading) return <ProductSkeleton />;

  return (
    <PageLayout>
      <Header title={product.name} />
      <div className="grid-layout">
        <ProductGallery images={product.images} />
        <ProductDetails info={product.info} />
        <ProductReviews reviews={product.reviews} />
      </div>
    </PageLayout>
  );
};

// 2. Sub-componentes en archivos separados
// components/ProductGallery.tsx
// components/ProductDetails.tsx
// components/ProductReviews.tsx
```

### Explicación

1.  **Single Responsibility:** Cada sub-componente maneja una parte específica de la UI.
2.  **Cognitive Load:** Es más fácil leer 5 archivos de 100 líneas que 1 archivo de 500 líneas.
3.  **Reusability:** `ProductGallery` podría usarse en un modal de vista rápida, lo cual era imposible si estaba hardcoded dentro de `ProductPage`.

## Patrón de refactoring

### Paso 1: Identificar Bloques Lógicos
Buscar bloques de JSX grandes dentro del `return`. Buscar secciones separadas por comentarios (`// Header section`, `// Form section`).

### Paso 2: Extraer Componente
Seleccionar el JSX y sus variables necesarias. Extraer a un nuevo componente funcional. Pasar los datos necesarios vía props.
*Tip: VS Code tiene "Refactor... -> Extract Component to New File".*

```typescript
// Antes
return (
  <div>
    <div className="header">... 50 líneas ...</div>
    <div className="body">...</div>
  </div>
)

// Después
return (
  <div>
    <PageHeader {...props} />
    <PageBody {...props} />
  </div>
)
```

### Paso 3: Mover a Archivos
Mover los nuevos componentes a archivos separados en una carpeta con el nombre del componente original si son partes privadas, o a `components/` si son reusables.

`src/modules/products/components/ProductForm/`
  - `index.tsx` (Componente principal, ahora pequeño)
  - `ProductHeader.tsx`
  - `ProductInputs.tsx`
  - `ProductActions.tsx`

## Casos edge a considerar

1.  **Context Hell:** Si al dividir pasas demasiadas props, considera usar un contexto local (`ProductProvider`) o Composition Pattern (`<Card><Card.Header /><Card.Body /></Card>`).
2.  **Dependencias cruzadas:** Si dos secciones del componente están muy acopladas por estado, extrae ese estado a un hook común (`useProductForm`) y úsalo en los sub-componentes.

## Validación

- [ ] Ningún archivo de componente excede ~250-300 líneas (limite soft) o 500 (limite hard).
- [ ] Los componentes extraídos tienen nombres semánticos claros.
- [ ] No hay componentes definidos dentro de otros componentes.

## Esfuerzo estimado

**ALTO** - Refactorizar componentes "God" lleva tiempo y cuidado para no romper funcionalidad.
- **Por componente gigante:** 2-4 horas.

## Referencias

1.  React Docs: Composition vs Inheritance
    https://legacy.reactjs.org/docs/composition-vs-inheritance.html
2.  Atomic Design Methodology
    https://atomicdesign.bradfrost.com/chapter-2/
3.  Sandi Metz: Rules for Developers (Small Classes/Methods)

---

# Solución: Inline event handlers en loops

## Código de referencia: 4.4

## Categoría de impacto
**MEDIO** - Afecta el rendimiento en listas largas al forzar re-renders de hijos y aumenta la presión sobre el Garbage Collector.

## Descripción del anti-pattern

Definir funciones anónimas (arrow functions) directamente dentro de las props de componentes que están siendo renderizados dentro de un bucle (`.map`).

```typescript
// ❌ INCORRECTO
const UserList = ({ users }) => {
  const handleDelete = (id) => { ... };

  return (
    <ul>
      {users.map(user => (
        // Se crea una NUEVA función () => ... para CADA item en CADA render
        <UserItem 
          key={user.id} 
          user={user} 
          onDelete={() => handleDelete(user.id)} 
        />
      ))}
    </ul>
  );
};
```

## Por qué es un problema

**Fuente 1: React Documentation - Optimizing Performance**
> "Anonymous functions inside render create new instances on every render. This breaks strict equality checks (===) in child components that use React.memo, causing them to re-render unnecessarily."
- Fuente: React Docs (Concepto general de reconciliación y referencias)

**Fuente 2: Codecademy React Patterns**
> "Defining handlers inline inside loops can have performance implications because a new function is allocated for each item every time the parent re-renders."

## Solución recomendada

1.  **Opción A (Preferida):** Pasar el ID o dato al componente hijo, y que el hijo llame al handler pasando su propio ID.
2.  **Opción B (Data Attributes):** Usar `data-id` y un solo handler en el padre (Event Delegation).
3.  **Opción C (Currying memoizado):** Solo si es estrictamente necesario (más complejo).

### Código correcto

#### Opción A: Componente hijo inteligente (Recomendado)

```typescript
// ✅ CORRECTO

// 1. El padre pasa la función genérica (estable)
const UserList = ({ users }) => {
  const handleDelete = useCallback((id: string) => {
    // Lógica delete
  }, []);

  return (
    <ul>
      {users.map(user => (
        <UserItem 
          key={user.id} 
          id={user.id} // Pasamos ID
          user={user} 
          onDelete={handleDelete} // Pasamos la misma referencia de función
        />
      ))}
    </ul>
  );
};

// 2. El hijo se encarga de invocarla con sus datos
const UserItem = memo(({ id, user, onDelete }) => {
  const handleClick = () => onDelete(id); // O inline aquí si UserItem no es complejo

  return <button onClick={handleClick}>Delete {user.name}</button>;
});
```

### Explicación

Al pasar `handleDelete` (que está memoizado con `useCallback`) directamente:
1.  La prop `onDelete` es referencialmente igual entre renders.
2.  `UserItem` puede usar `React.memo` efectivamente. Si `user` no cambia, `UserItem` **no** se re-renderiza.
3.  En la versión incorrecta, `onDelete` siempre cambiaba, forzando el re-render de `UserItem` siempre.

## Patrón de refactoring

### Paso 1: Identificar Inline Handlers
Buscar en `.map()` props como `onClick={() => handler(item.id)}`.

### Paso 2: Modificar Componente Hijo
Actualizar el componente hijo para que acepte el handler genérico y el identificador necesario.
Si el componente hijo es un elemento HTML nativo (`div`, `button`), extraerlo a un sub-componente ligero para encapsular esta lógica es buena práctica si la lista es grande.

### Paso 3: Limpiar Padre
Pasar la función handler directamente sin invocarla.

## Casos edge a considerar

1.  **Listas pequeñas (<50 items):** El impacto de performance es despreciable. No sobre-optimizar si la lista es pequeña y estática.
2.  **Librerías de UI:** Algunos componentes de librerías esperan `onClick` sin argumentos. En ese caso, la extracción a un wrapper component es necesaria.

## Validación

- [ ] Uso de Profiler de React muestra "Did not render" en items de la lista cuando el padre renderiza por causas ajenas a la lista.
- [ ] No hay arrow functions dentro de `.map()`.

## Esfuerzo estimado

**BAJO/MEDIO** - Refactoring sencillo y localizado.
- **Por lista:** 10-20 minutos.

## Referencias

1.  React.dev: Passing Props to a Component
    https://react.dev/learn/passing-props-to-a-component
2.  Overreacted (Dan Abramov): Before You Memo
    https://overreacted.io/before-you-memo/
